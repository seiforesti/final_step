from datetime import datetime, timedelta
from typing import Optional
import secrets
import string
import pyotp
import jwt
from sqlalchemy.orm import Session
from app.models.auth_models import User, Session as UserSession, EmailVerificationCode, Role, UserRole
from app.db_session import get_db
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_user(
    db: Session, 
    email: str, 
    password: Optional[str] = None, 
    role: str = "user",
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    display_name: Optional[str] = None,
    profile_picture_url: Optional[str] = None,
    birthday: Optional[str] = None,
    phone_number: Optional[str] = None,
    department: Optional[str] = None,
    region: Optional[str] = None,
    oauth_provider: Optional[str] = None,
    oauth_id: Optional[str] = None,
    timezone: Optional[str] = None
) -> User:
    # Bootstrap: first user is always admin
    if db.query(User).count() == 0:
        role = "admin"
    hashed_password = get_password_hash(password) if password else None
    
    user = User(
        email=email, 
        hashed_password=hashed_password, 
        is_active=True, 
        is_verified=True if oauth_provider else False, 
        role=role,
        first_name=first_name,
        last_name=last_name,
        display_name=display_name or f"{first_name} {last_name}".strip() if first_name or last_name else None,
        profile_picture_url=profile_picture_url,
        birthday=birthday,
        phone_number=phone_number,
        department=department,
        region=region,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
        last_login=datetime.utcnow(),
        timezone=timezone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_session(db: Session, user: User, expires_minutes: int = 60*24*7) -> UserSession:
    session_token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    session = UserSession(user_id=user.id, session_token=session_token, expires_at=expires_at)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_session_by_token(db: Session, token: str) -> Optional[UserSession]:
    return db.query(UserSession).filter(UserSession.session_token == token).first()

def delete_session(db: Session, session: UserSession):
    db.delete(session)
    db.commit()

def create_email_verification_code(db: Session, email: str, expires_minutes: int = 10) -> str:
    code = ''.join(secrets.choice(string.digits) for _ in range(6))
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    evc = EmailVerificationCode(email=email, code=code, expires_at=expires_at)
    db.add(evc)
    db.commit()
    db.refresh(evc)
    return code

def verify_email_code(db: Session, email: str, code: str) -> bool:
    print(f"Verifying code: email={email}, code={code}")
    evc = db.query(EmailVerificationCode).filter(EmailVerificationCode.email == email, EmailVerificationCode.code == code).first()
    if evc:
        print(f"Found code in DB: {evc.code}, expires at {evc.expires_at}, now {datetime.utcnow()}")
    if evc and evc.expires_at > datetime.utcnow():
        db.delete(evc)
        db.commit()
        return True
    return False

def enable_mfa_for_user(db: Session, user: User) -> str:
    secret = pyotp.random_base32()
    user.mfa_enabled = True
    user.mfa_secret = secret
    db.commit()
    return secret

def verify_mfa_code(user: User, code: str) -> bool:
    if not user.mfa_enabled or not user.mfa_secret:
        return False
    totp = pyotp.TOTP(user.mfa_secret)
    return totp.verify(code)

def create_user_with_invite(db: Session, email: str, invite_token: Optional[str] = None) -> User:
    import os
    import jwt
    SECRET_KEY = os.environ.get("SECRET_KEY", "fallback-unsafe-key")
    role = "user"
    if invite_token:
        try:
            payload = jwt.decode(invite_token, SECRET_KEY, algorithms=["HS256"])
            if payload.get("email") == email and payload.get("role"):
                role = payload.get("role")
        except Exception:
            pass  # Invalid/expired token, fallback to default role
    return create_user(db, email, password=None, role=role)

def get_user_roles(db: Session, user: User):
    return [ur.role for ur in db.query(UserRole).filter(UserRole.user_id == user.id).all()]

def assign_role_to_user(db: Session, user: User, role_name: str):
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name)
        db.add(role)
        db.commit()
        db.refresh(role)
    user_role = UserRole(user_id=user.id, role_id=role.id)
    db.add(user_role)
    db.commit()
    return user_role

def remove_role_from_user(db: Session, user: User, role_name: str):
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        return
    db.query(UserRole).filter(UserRole.user_id == user.id, UserRole.role_id == role.id).delete()
    db.commit()

def has_role(user, role_name):
    if hasattr(user, 'role') and user.role == role_name:
        return True
    if hasattr(user, 'roles') and role_name in [r.name for r in getattr(user, 'roles', [])]:
        return True
    return False
