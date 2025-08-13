from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.db_session import get_session, get_db
from app.services.auth_service import get_user_by_email, get_session_by_token
from app.services.rbac_service import get_user_effective_permissions_rbac


# Define permission constants for the new features (dot notation)
PERMISSION_SCAN_VIEW = "scan.view"
PERMISSION_SCAN_CREATE = "scan.create"
PERMISSION_SCAN_EDIT = "scan.edit"
PERMISSION_SCAN_DELETE = "scan.delete"
PERMISSION_DASHBOARD_VIEW = "dashboard.view"
PERMISSION_DASHBOARD_EXPORT = "dashboard.export"
PERMISSION_LINEAGE_VIEW = "lineage.view"
PERMISSION_LINEAGE_EXPORT = "lineage.export"
PERMISSION_COMPLIANCE_VIEW = "compliance.view"
PERMISSION_COMPLIANCE_EXPORT = "compliance.export"
PERMISSION_DATA_PROFILING_VIEW = "data_profiling.view"
PERMISSION_DATA_PROFILING_RUN = "data_profiling.run"
PERMISSION_CUSTOM_SCAN_RULES_VIEW = "custom_scan_rules.view"
PERMISSION_CUSTOM_SCAN_RULES_CREATE = "custom_scan_rules.create"
PERMISSION_CUSTOM_SCAN_RULES_EDIT = "custom_scan_rules.edit"
PERMISSION_CUSTOM_SCAN_RULES_DELETE = "custom_scan_rules.delete"
PERMISSION_INCREMENTAL_SCAN_VIEW = "incremental_scan.view"
PERMISSION_INCREMENTAL_SCAN_RUN = "incremental_scan.run"
PERMISSION_INCREMENTAL_SCAN_CREATE = "incremental_scan.create"
# Add missing permissions for Data Sources and Scan Rule Sets (dot notation)
PERMISSION_DATASOURCE_VIEW = "datasource.view"
PERMISSION_DATASOURCE_CREATE = "datasource.create"
PERMISSION_SCAN_RULESET_VIEW = "scan.ruleset.view"
PERMISSION_SCAN_RULESET_CREATE = "scan.ruleset.create"

# Enterprise Analytics permissions
PERMISSION_ANALYTICS_VIEW = "analytics.view"
PERMISSION_ANALYTICS_MANAGE = "analytics.manage"

# Collaboration permissions
PERMISSION_COLLABORATION_VIEW = "collaboration.view"
PERMISSION_COLLABORATION_MANAGE = "collaboration.manage"
PERMISSION_WORKSPACE_CREATE = "workspace.create"
PERMISSION_WORKSPACE_EDIT = "workspace.edit"

# Workflow permissions
PERMISSION_WORKFLOW_VIEW = "workflow.view"
PERMISSION_WORKFLOW_MANAGE = "workflow.manage"
PERMISSION_WORKFLOW_CREATE = "workflow.create"
PERMISSION_WORKFLOW_EXECUTE = "workflow.execute"

# Enhanced Performance permissions
PERMISSION_PERFORMANCE_VIEW = "performance.view"
PERMISSION_PERFORMANCE_MANAGE = "performance.manage"
PERMISSION_ALERTS_VIEW = "alerts.view"
PERMISSION_ALERTS_MANAGE = "alerts.manage"

# Enhanced Security permissions
PERMISSION_SECURITY_VIEW = "security.view"
PERMISSION_SECURITY_MANAGE = "security.manage"
PERMISSION_AUDIT_VIEW = "audit.view"
PERMISSION_AUDIT_MANAGE = "audit.manage"

# Role to permission mapping (now includes datasource and scan.ruleset permissions)
ROLE_PERMISSIONS = {
    "admin": [
        PERMISSION_SCAN_VIEW, PERMISSION_SCAN_CREATE, PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE,
        PERMISSION_DASHBOARD_VIEW, PERMISSION_DASHBOARD_EXPORT,
        PERMISSION_LINEAGE_VIEW, PERMISSION_LINEAGE_EXPORT,
        PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_EXPORT,
        PERMISSION_DATA_PROFILING_VIEW, PERMISSION_DATA_PROFILING_RUN,
        PERMISSION_CUSTOM_SCAN_RULES_VIEW, PERMISSION_CUSTOM_SCAN_RULES_CREATE,
        PERMISSION_CUSTOM_SCAN_RULES_EDIT, PERMISSION_CUSTOM_SCAN_RULES_DELETE,
        PERMISSION_INCREMENTAL_SCAN_VIEW, PERMISSION_INCREMENTAL_SCAN_RUN, PERMISSION_INCREMENTAL_SCAN_CREATE,
        PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_CREATE,
        PERMISSION_SCAN_RULESET_VIEW, PERMISSION_SCAN_RULESET_CREATE,
        # Enterprise features
        PERMISSION_ANALYTICS_VIEW, PERMISSION_ANALYTICS_MANAGE,
        PERMISSION_COLLABORATION_VIEW, PERMISSION_COLLABORATION_MANAGE,
        PERMISSION_WORKSPACE_CREATE, PERMISSION_WORKSPACE_EDIT,
        PERMISSION_WORKFLOW_VIEW, PERMISSION_WORKFLOW_MANAGE,
        PERMISSION_WORKFLOW_CREATE, PERMISSION_WORKFLOW_EXECUTE,
        PERMISSION_PERFORMANCE_VIEW, PERMISSION_PERFORMANCE_MANAGE,
        PERMISSION_ALERTS_VIEW, PERMISSION_ALERTS_MANAGE,
        PERMISSION_SECURITY_VIEW, PERMISSION_SECURITY_MANAGE,
        PERMISSION_AUDIT_VIEW, PERMISSION_AUDIT_MANAGE
    ],
    "data_steward": [
        PERMISSION_SCAN_VIEW, PERMISSION_SCAN_CREATE,
        PERMISSION_DASHBOARD_VIEW, PERMISSION_DASHBOARD_EXPORT,
        PERMISSION_LINEAGE_VIEW, PERMISSION_LINEAGE_EXPORT,
        PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_EXPORT,
        PERMISSION_DATA_PROFILING_VIEW, PERMISSION_DATA_PROFILING_RUN,
        PERMISSION_CUSTOM_SCAN_RULES_VIEW,
        PERMISSION_INCREMENTAL_SCAN_VIEW, PERMISSION_INCREMENTAL_SCAN_CREATE,
        PERMISSION_DATASOURCE_VIEW, PERMISSION_DATASOURCE_CREATE,
        PERMISSION_SCAN_RULESET_VIEW, PERMISSION_SCAN_RULESET_CREATE,
        # Limited enterprise features
        PERMISSION_ANALYTICS_VIEW,
        PERMISSION_COLLABORATION_VIEW, PERMISSION_COLLABORATION_MANAGE,
        PERMISSION_WORKSPACE_CREATE,
        PERMISSION_WORKFLOW_VIEW, PERMISSION_WORKFLOW_CREATE, PERMISSION_WORKFLOW_EXECUTE,
        PERMISSION_PERFORMANCE_VIEW, PERMISSION_ALERTS_VIEW,
        PERMISSION_SECURITY_VIEW, PERMISSION_AUDIT_VIEW
    ],
    "data_analyst": [
        PERMISSION_SCAN_VIEW,
        PERMISSION_DASHBOARD_VIEW,
        PERMISSION_LINEAGE_VIEW,
        PERMISSION_COMPLIANCE_VIEW,
        PERMISSION_DATA_PROFILING_VIEW,
        PERMISSION_DATASOURCE_VIEW,
        PERMISSION_SCAN_RULESET_VIEW,
        # View-only enterprise features
        PERMISSION_ANALYTICS_VIEW,
        PERMISSION_COLLABORATION_VIEW,
        PERMISSION_WORKFLOW_VIEW,
        PERMISSION_PERFORMANCE_VIEW, PERMISSION_ALERTS_VIEW,
        PERMISSION_SECURITY_VIEW, PERMISSION_AUDIT_VIEW
    ],
    "viewer": [
        PERMISSION_SCAN_VIEW,
        PERMISSION_DASHBOARD_VIEW,
        PERMISSION_LINEAGE_VIEW,
        PERMISSION_DATASOURCE_VIEW,
        PERMISSION_SCAN_RULESET_VIEW,
        # Read-only enterprise features
        PERMISSION_ANALYTICS_VIEW,
        PERMISSION_COLLABORATION_VIEW,
        PERMISSION_WORKFLOW_VIEW,
        PERMISSION_PERFORMANCE_VIEW,
        PERMISSION_SECURITY_VIEW
    ]
}

def get_current_user(session_token: str = Cookie(None), db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get the current user from the session token."""
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_session = get_session_by_token(db, session_token)
    if not user_session or not user_session.user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user = user_session.user
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "department": getattr(user, "department", None),
        "region": getattr(user, "region", None)
    }

def check_permission(permission: str, current_user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)) -> bool:
    """Check if the current user has the specified permission."""
    # For simple role-based permissions
    if current_user.get("role") in ROLE_PERMISSIONS:
        if permission in ROLE_PERMISSIONS[current_user["role"]]:
            return True
    
    # For more complex RBAC with conditions
    user_id = current_user.get("id")
    if user_id:
        effective_permissions = get_user_effective_permissions_rbac(db, user_id)
        for perm in effective_permissions:
            if perm["action"] == permission and perm["is_effective"]:
                return True
    
    return False

def require_permission(permission: str):
    """Dependency factory to require a specific permission."""
    def dependency(current_user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
        has_permission = check_permission(permission, current_user, db)
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized to perform this action. Required permission: {permission}"
            )
        return current_user
    return dependency