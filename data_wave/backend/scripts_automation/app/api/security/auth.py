##NOTE: This code is part of mock data use for test user authentication and role management note for real production.

from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import os

from app.db_session import get_db
from app.services.auth_service import get_user_by_email, get_session_by_token

# Simuler une base utilisateurs
fake_users_db = {
    "admin": {"username": "admin", "password": "admin123", "role": "admin"},
    "viewer": {"username": "viewer", "password": "viewer123", "role": "viewer"},
}

SECRET_KEY = os.environ.get("SECRET_KEY", "fallback-unsafe-key")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user or user["password"] != password:
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user_role(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("✅ Token reçu pour:", payload["sub"], "avec rôle:", payload["role"])
        return payload.get("role")
    except JWTError:
        raise HTTPException(status_code=403, detail="Unauthorized")

def get_current_user_role(session_token: str = Cookie(None), db: Session = Depends(get_db)) -> str:
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_session = get_session_by_token(db, session_token)
    if not user_session or not user_session.user:
        raise HTTPException(status_code=401, detail="Invalid session")
    user = user_session.user
    return user.role
