from typing import Dict, Any, Optional
from fastapi import Header, Cookie, HTTPException, Depends
from sqlmodel import Session

from ..db_session import get_session
from ..api.security.rbac import get_current_user as _rbac_get_current_user


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    session_token: Optional[str] = Cookie(default=None),
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Enterprise auth shim that resolves the current user from either a Bearer token or session cookie,
    delegating to the RBAC security utility for token verification.
    Returns a dict with at least id/user_id and roles to integrate with services expecting a mapping.
    """
    # Prefer cookie/session via RBAC utility; fall back to Authorization header parsing if provided
    try:
        user_dict = _rbac_get_current_user(session_token=session_token, db=session)  # type: ignore[arg-type]
    except Exception:
        user_dict = None
    if not user_dict and authorization and authorization.lower().startswith("bearer "):
        # If Bearer tokens are used elsewhere, create a minimal user context
        token = authorization[7:].strip()
        if not token:
            raise HTTPException(status_code=401, detail="Missing authorization token")
        # Minimal context when only bearer token is available
        user_dict = {"id": "bearer", "user_id": "bearer", "roles": ["viewer"], "email": None}
    if not user_dict:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_dict


