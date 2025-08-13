from fastapi import APIRouter, Depends, HTTPException, status, Cookie, Request
from sqlalchemy.orm import Session
from app.db_session import get_db
from app.services.role_service import list_users, get_user_role, set_user_role
from app.services.auth_service import get_session_by_token
from app.models.auth_models import User
import jwt
from datetime import datetime, timedelta
import os
import logging

router = APIRouter(prefix="/admin/roles", tags=["Role Management"])

# Helper to get current user from session token
INVITE_EXPIRY_MINUTES = 30

def get_current_admin(session_token: str = Cookie(None), db: Session = Depends(get_db)) -> User:
    logger = logging.getLogger("role_admin")
    logger.info(f"get_current_admin: session_token={session_token}")
    if not session_token:
        logger.warning("No session_token provided")
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_session = get_session_by_token(db, session_token)
    logger.info(f"user_session: {user_session}")
    if not user_session or not user_session.user:
        logger.warning("Invalid session or user not found")
        raise HTTPException(status_code=401, detail="Invalid session")
    user = user_session.user
    logger.info(f"Authenticated user: {user.email}, role: {user.role}")
    if user.role != "admin":
        logger.warning(f"User {user.email} does not have admin privileges")
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

@router.get("/users")
def api_list_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    return list_users(db)

@router.get("/user-role/{email}")
def api_get_user_role(email: str, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    role = get_user_role(db, email)
    if role is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": email, "role": role}

@router.post("/set-role")
def api_set_user_role(email: str, new_role: str, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    user = set_user_role(db, email, new_role, changed_by=current_admin.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": email, "new_role": new_role}

@router.post("/invite-user")
def invite_user(email: str, request: Request, role: str = "user", current_admin: User = Depends(get_current_admin)):
    """
    Generate a secure, single-use invitation link for a specific email and role (admin, steward, user, etc).
    Only accessible by admins.
    """
    SECRET_KEY = os.environ.get("SECRET_KEY", "fallback-unsafe-key")
    payload = {
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=INVITE_EXPIRY_MINUTES)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    base_url = str(request.base_url).rstrip("/")
    invite_link = f"{base_url}/auth/register?invite_token={token}"
    return {"invite_link": invite_link, "role": role, "expires_in_minutes": INVITE_EXPIRY_MINUTES}
