##NOTE: This code is part of mock data use for test user authentication and role management note for real production.
# """dont use this code in production, this is just for mock data use"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user_role(token: str = Depends(oauth2_scheme)):
    # Simule un rôle : à remplacer par un JWT avec rôle
    if token == "admin_token":
        return "admin"
    elif token == "reader_token":
        return "reader"
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")
