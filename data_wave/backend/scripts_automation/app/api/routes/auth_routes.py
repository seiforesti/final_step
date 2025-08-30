from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.api.security.auth import authenticate_user, create_access_token
from app.api.security import get_current_user
from app.db_session import get_db
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/permissions")
async def get_user_permissions(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's permissions."""
    try:
        user_role = current_user.get("role", "user")
        
        # Get permissions based on role
        if user_role == "admin":
            permissions = [
                "scan.view", "scan.create", "scan.edit", "scan.delete",
                "dashboard.view", "dashboard.export",
                "lineage.view", "lineage.export",
                "compliance.view", "compliance.export",
                "data_profiling.view", "data_profiling.run",
                "custom_scan_rules.view", "custom_scan_rules.create",
                "incremental_scan.view", "incremental_scan.create",
                "datasource.view", "datasource.create",
                "scan_ruleset.view", "scan_ruleset.create",
                "analytics.view", "analytics.manage",
                "collaboration.view", "collaboration.manage",
                "workspace.create", "workspace.edit",
                "workflow.view", "workflow.manage", "workflow.create", "workflow.execute",
                "performance.view", "performance.manage",
                "alerts.view", "alerts.manage",
                "security.view", "security.manage",
                "audit.view", "audit.manage"
            ]
        elif user_role == "data_steward":
            permissions = [
                "scan.view", "scan.create", "scan.manage",
                "dashboard.view", "dashboard.export",
                "lineage.view", "lineage.export",
                "compliance.view", "compliance.export",
                "data_profiling.view", "data_profiling.run",
                "custom_scan_rules.view",
                "incremental_scan.view", "incremental_scan.create",
                "datasource.view", "datasource.create",
                "scan_ruleset.view", "scan_ruleset.create",
                "analytics.view",
                "collaboration.view", "collaboration.manage",
                "workspace.create",
                "workflow.view", "workflow.create", "workflow.execute",
                "performance.view", "alerts.view",
                "security.view", "audit.view"
            ]
        elif user_role == "data_analyst":
            permissions = [
                "scan.view",
                "dashboard.view",
                "lineage.view",
                "compliance.view",
                "data_profiling.view",
                "datasource.view",
                "scan_ruleset.view",
                "analytics.view",
                "collaboration.view",
                "workflow.view",
                "performance.view", "alerts.view",
                "security.view", "audit.view"
            ]
        else:  # viewer
            permissions = [
                "scan.view",
                "dashboard.view",
                "lineage.view",
                "datasource.view",
                "scan_ruleset.view",
                "analytics.view",
                "collaboration.view",
                "workflow.view",
                "performance.view",
                "security.view"
            ]
        
        return {
            "user_id": current_user.get("id"),
            "role": user_role,
            "permissions": permissions,
            "effective_permissions": permissions
        }
    except Exception as e:
        logger.error(f"Error getting user permissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get current user information."""
    try:
        return {
            "id": current_user.get("id"),
            "username": current_user.get("display_name") or current_user.get("email"),
            "email": current_user.get("email"),
            "role": current_user.get("role", "user"),
            "display_name": current_user.get("display_name"),
            "is_active": True,
            "last_login": current_user.get("last_login"),
            "created_at": current_user.get("created_at")
        }
    except Exception as e:
        logger.error(f"Error getting current user info: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
