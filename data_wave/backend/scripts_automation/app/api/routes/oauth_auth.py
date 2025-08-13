from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import secrets
import string
import time
from sqlalchemy.orm import Session
from app.db_session import get_db
from app.services.auth_service import (
    get_user_by_email,
    create_user,
    create_session,
    create_email_verification_code,
    verify_email_code,
    verify_mfa_code,
    create_user_with_invite,
)
from pydantic import BaseModel
from app.services.email_service import send_email
import logging
import requests
from app.configs.config import OAUTH_CONFIG
from msal import ConfidentialClientApplication
from fastapi import Query

router = APIRouter(prefix="/auth", tags=["OAuth Authentication"])

# OAuth state store in-memory for demo; in production use persistent store
oauth_state_store = {}

def generate_state_token():
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

from fastapi.responses import RedirectResponse

@router.get("/google")
def google_login():
    state = generate_state_token()
    oauth_state_store[state] = time.time()
    google_oauth_url = (
        f"https://accounts.google.com/o/oauth2/auth"
        f"?client_id={OAUTH_CONFIG['google_client_id']}"
        f"&response_type=code"
        f"&scope=email profile openid"
        f"&redirect_uri={OAUTH_CONFIG['google_redirect_uri']}"
        f"&state={state}"
    )
    return RedirectResponse(url=google_oauth_url)

@router.get("/google/callback")
async def google_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None, db: Session = Depends(get_db)):
    logger = logging.getLogger("oauth_auth")
    logger.info(f"Google OAuth callback: code={code}, state={state}")
    if not code or not state or state not in oauth_state_store:
        logger.error("Invalid OAuth callback parameters: missing code or state or invalid state")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth callback parameters")
    if time.time() - oauth_state_store[state] > 300:
        del oauth_state_store[state]
        logger.error("OAuth state token expired")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OAuth state token expired")
    del oauth_state_store[state]
    import traceback
    try:
        # Exchange code for token
        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": OAUTH_CONFIG["google_client_id"],
                "client_secret": OAUTH_CONFIG["google_client_secret"],
                "redirect_uri": OAUTH_CONFIG["google_redirect_uri"],
                "grant_type": "authorization_code",
            },
        )
        token_response.raise_for_status()
        tokens = token_response.json()
        access_token = tokens.get("access_token")
        logger.info(f"Access token received: {bool(access_token)}")
        if not access_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to obtain access token")

        # Get user info with full profile
        userinfo_response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            params={"alt": "json"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()
        
        user_email = userinfo.get("email")
        first_name = userinfo.get("given_name")
        last_name = userinfo.get("family_name")
        display_name = userinfo.get("name")
        profile_picture = userinfo.get("picture")
        oauth_id = userinfo.get("id")
        
        logger.info(f"Google user info: {userinfo}")
        if not user_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to obtain user email")

        user = get_user_by_email(db, user_email)
        logger.info(f"User from DB: {user}")
        if not user:
            user = create_user(
                db, 
                user_email, 
                role="admin",  # or "user"
                first_name=first_name,
                last_name=last_name,
                display_name=display_name,
                profile_picture_url=profile_picture,
                oauth_provider="google",
                oauth_id=oauth_id
            )
            logger.info(f"Created new user: {user.email}")
        else:
            # Update existing user profile
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.display_name = display_name or user.display_name
            user.profile_picture_url = profile_picture or user.profile_picture_url
            user.oauth_provider = "google"
            user.oauth_id = oauth_id or user.oauth_id
            user.last_login = datetime.utcnow()
            db.commit()
            db.refresh(user)
        session = create_session(db, user)
        logger.info(f"Created session: {session.session_token}")
    except Exception as e:
        logger.error(f"Exception in google_callback: {e}", exc_info=True)
        logger.error(traceback.format_exc())
        import sys
        print("Exception in google_callback:", e, file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error during OAuth callback: {e}")
    response = RedirectResponse(url="/popuphandler/oauth_success.html")
    response.set_cookie(key="session_token", value=session.session_token, httponly=True)
    logger.info(f"Set session_token cookie for user {user.email}")
    return response

@router.get("/microsoft")
def microsoft_login():
    state = generate_state_token()
    oauth_state_store[state] = time.time()
    scopes = "openid email profile User.Read"
    microsoft_oauth_url = (
        f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
        f"?client_id={OAUTH_CONFIG['microsoft_client_id']}"
        f"&response_type=code"
        f"&scope={scopes}"
        f"&redirect_uri={OAUTH_CONFIG['microsoft_redirect_uri']}"
        f"&state={state}"
    )
    return RedirectResponse(url=microsoft_oauth_url)

@router.get("/microsoft/callback")
async def microsoft_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None, db: Session = Depends(get_db)):
    logger = logging.getLogger("oauth_auth")
    logger.info(f"Microsoft OAuth callback: code={code}, state={state}")
    
    if not code or not state or state not in oauth_state_store:
        logger.error("Invalid OAuth callback parameters: missing code or state or invalid state")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth callback parameters")
    
    if time.time() - oauth_state_store[state] > 300:
        del oauth_state_store[state]
        logger.error("OAuth state token expired")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OAuth state token expired")
    
    del oauth_state_store[state]
    
    try:
        # Exchange code for token
        token_response = requests.post(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            data={
                "code": code,
                "client_id": OAUTH_CONFIG["microsoft_client_id"],
                "client_secret": OAUTH_CONFIG["microsoft_client_secret"],
                "redirect_uri": OAUTH_CONFIG["microsoft_redirect_uri"],
                "grant_type": "authorization_code",
                "scope": "openid email profile User.Read"
            },
        )
        token_response.raise_for_status()
        tokens = token_response.json()
        access_token = tokens.get("access_token")
        
        logger.info(f"Microsoft access token received: {bool(access_token)}")
        if not access_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to obtain access token")

        # Get user info from Microsoft Graph
        userinfo_response = requests.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()
        
        # Get user photo
        photo_url = None
        try:
            photo_response = requests.get(
                "https://graph.microsoft.com/v1.0/me/photo/$value",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if photo_response.status_code == 200:
                # In production, you'd want to store this image and serve it from your own CDN
                photo_url = f"data:image/jpeg;base64,{photo_response.content.hex()}"
        except:
            pass  # Photo is optional
        
        user_email = userinfo.get("mail") or userinfo.get("userPrincipalName")
        first_name = userinfo.get("givenName")
        last_name = userinfo.get("surname")
        display_name = userinfo.get("displayName")
        oauth_id = userinfo.get("id")
        birthday = userinfo.get("birthday")  # May require additional permissions
        
        logger.info(f"Microsoft user info: {userinfo}")
        if not user_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to obtain user email")

        user = get_user_by_email(db, user_email)
        logger.info(f"User from DB: {user}")
        if not user:
            user = create_user(
                db, 
                user_email, 
                role="admin",  # or "user"
                first_name=first_name,
                last_name=last_name,
                display_name=display_name,
                profile_picture_url=photo_url,
                birthday=birthday,
                oauth_provider="microsoft",
                oauth_id=oauth_id
            )
            logger.info(f"Created new user: {user.email}")
        else:
            # Update existing user profile
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.display_name = display_name or user.display_name
            user.profile_picture_url = photo_url or user.profile_picture_url
            user.birthday = birthday or user.birthday
            user.oauth_provider = "microsoft"
            user.oauth_id = oauth_id or user.oauth_id
            user.last_login = datetime.utcnow()
            db.commit()
            db.refresh(user)
            
        session = create_session(db, user)
        logger.info(f"Created session: {session.session_token}")
        
    except Exception as e:
        logger.error(f"Exception in microsoft_callback: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error during OAuth callback: {e}")
    
    response = RedirectResponse(url="/popuphandler/oauth_success.html")
    response.set_cookie(key="session_token", value=session.session_token, httponly=True)
    logger.info(f"Set session_token cookie for user {user.email}")
    return response

class EmailLoginRequest(BaseModel):
    email: str

class EmailSignupRequest(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    region: Optional[str] = None

from fastapi import Request

@router.options("/email")
async def email_options(request: Request):
    return JSONResponse(status_code=200, content={"message": "CORS preflight"})

@router.post("/email")
def email_login(request: EmailLoginRequest, db: Session = Depends(get_db)):
    email = request.email
    if "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")
    code = create_email_verification_code(db, email)
    subject = "Your Verification Code"
    # Ensure code is string for concatenation
    code_str = str(code)
    body = "Your verification code is: " + code_str
    import traceback
    try:
        print(f"Sending email with email type: {type(email)}, subject type: {type(subject)}, body type: {type(body)}")
        if not send_email(email, subject, body):
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send verification email")
    except Exception as e:
        tb_str = traceback.format_exc()
        print(f"Exception in send_email: {e}\nTraceback:\n{tb_str}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Email sending error: {e}")
    return JSONResponse(content={"message": "Verification code sent"})

@router.post("/signup")
def email_signup(request: EmailSignupRequest, db: Session = Depends(get_db)):
    email = request.email
    if "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")
    
    # Check if user already exists
    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    
    code = create_email_verification_code(db, email)
    subject = "Welcome! Verify Your Email"
    code_str = str(code)
    
    # Store signup data temporarily (in production, use Redis or similar)
    global signup_data_store
    if 'signup_data_store' not in globals():
        signup_data_store = {}
    
    signup_data_store[email] = {
        'first_name': request.first_name,
        'last_name': request.last_name,
        'phone_number': request.phone_number,
        'department': request.department,
        'region': request.region,
        'timestamp': time.time()
    }
    
    body = f"Welcome to our Data Governance Platform!\n\nYour verification code is: {code_str}\n\nPlease enter this code to complete your registration."
    
    try:
        if not send_email(email, subject, body):
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send verification email")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Email sending error: {e}")
    
    return JSONResponse(content={"message": "Verification code sent to your email"})

class EmailVerifyRequest(BaseModel):
    email: str
    code: str

from fastapi import Request

@router.post("/verify")
async def email_verify(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()
    if not email or not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and code are required")
    if not verify_email_code(db, email, code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
    
    user = get_user_by_email(db, email)
    if not user:
        # Check if this is a signup verification
        global signup_data_store
        signup_data = signup_data_store.get(email, {}) if 'signup_data_store' in globals() else {}
        
        # Clean up old signup data (older than 1 hour)
        if signup_data and time.time() - signup_data.get('timestamp', 0) > 3600:
            signup_data = {}
            if 'signup_data_store' in globals():
                signup_data_store.pop(email, None)
        
        user = create_user(
            db, 
            email, 
            role="admin",  # or "user"
            first_name=signup_data.get('first_name'),
            last_name=signup_data.get('last_name'),
            phone_number=signup_data.get('phone_number'),
            department=signup_data.get('department'),
            region=signup_data.get('region'),
            oauth_provider="email"
        )
        
        # Clean up signup data
        if 'signup_data_store' in globals():
            signup_data_store.pop(email, None)
    else:
        # Update last login for existing user
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
    
    session = create_session(db, user)
    response = JSONResponse(content={"message": "Email verified", "user": {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "display_name": user.display_name,
        "profile_picture_url": user.profile_picture_url
    }})
    response.set_cookie(key="session_token", value=session.session_token, httponly=True)
    return response

class MfaVerifyRequest(BaseModel):
    email: str
    code: str

@router.post("/mfa/verify")
def mfa_verify(request: MfaVerifyRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user or not user.mfa_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA not enabled for user")
    if not verify_mfa_code(user, request.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid MFA code")
    return JSONResponse(content={"message": "MFA verified"})

@router.post("/register")
def register_with_invite(
    email: str,
    invite_token: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Register a new user using an invitation token (no password required).
    If the invite_token is valid and matches the email, the user is assigned the invited role.
    """
    user = get_user_by_email(db, email)
    if user:
        raise HTTPException(status_code=400, detail="User already exists")
    user = create_user_with_invite(db, email, invite_token)
    session = create_session(db, user)
    response = JSONResponse(content={"message": "Registration successful"})
    response.set_cookie(key="session_token", value=session.session_token, httponly=True)
    return response
