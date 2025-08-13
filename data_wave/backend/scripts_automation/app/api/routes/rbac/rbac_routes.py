print("=== rbac_routes.py loaded ===")
# --- Advanced CRUD for Condition Templates (append at end) ---
from pydantic import BaseModel

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.auth_models import ConditionTemplate
from datetime import datetime

# --- New: Bulk Role Permissions Endpoint (robust, simple) ---
from app.models.auth_models import Role, Permission
from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, Body, HTTPException



from fastapi import APIRouter, Depends, HTTPException, Body, Cookie, Request, Header
from app.db_session import get_session
from app.services.auth_service import get_session_by_token, assign_role_to_user
from app.models.auth_models import User, Role, UserRole, Permission, ResourceRole, AccessRequest, RbacAuditLog
from app.services.role_service import (
    get_permission_diff, get_selected_roles_permissions, list_users, get_user_role, set_user_role, list_permissions, create_permission, delete_permission, update_permission,
    user_has_permission, assign_permission_to_role, remove_permission_from_role, get_user_permissions,
    assign_resource_role, list_resource_roles, create_access_request, review_access_request, log_rbac_action, list_rbac_audit_logs
)


import logging
from datetime import datetime
from app.models.auth_models import ConditionTemplate
from sqlalchemy import func

# Pydantic model for role update
from sensitivity_labeling.websocket_manager import manager
import asyncio

class RoleUpdate(BaseModel):
    name: str
    description: Optional[str] = None
# --- Azure-style Role Assignment Listing ---

# Robust session checker
from sqlalchemy.orm import Session
from app.db_session import get_db

def get_current_user(
    session_token: str = Cookie(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    token = session_token
    # Support Authorization: Bearer <token>
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:]
    session = get_session_by_token(db, token)
    if session is None or getattr(session, "user", None) is None:
        raise HTTPException(status_code=401, detail="Invalid or missing session token")
    return session.user

# Pydantic model for role creation
class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None



router = APIRouter(prefix="/rbac", tags=["RBAC"])

# --- Condition Templates Endpoint ---

# --- Advanced CRUD for Condition Templates ---



# --- Pydantic models for ConditionTemplate ---
class ConditionTemplateRead(BaseModel):
    id: int
    label: str
    value: str
    description: str = None
    created_at: datetime
    updated_at: datetime

# ---
# Admin Documentation: How to Use Condition Templates for ABAC
#
# Condition templates allow you to define reusable, parameterized access control conditions for permissions and denies.
#
# - The `label` is a human-friendly name (e.g., "Owner Only").
# - The `value` is a JSON string representing the condition, e.g.:
#     {"user_id": ":current_user_id"}
#   You can use placeholders like :current_user_id, :user_department, :user_region, etc.
# - The `description` should explain what the template does and when to use it.
#
# Example Templates:
#   - Owner Only: {"user_id": ":current_user_id"}
#   - Department Match: {"department": ":user_department"}
#   - Region Match: {"region": ":user_region"}
#
# When creating or editing a template, ensure the value is valid JSON and references only supported attributes.
# These templates can be attached to permissions or denies for fine-grained, attribute-based access control (ABAC).
# ---
class ConditionTemplateCreate(BaseModel):
    label: str
    value: str
    description: str = None

class ConditionTemplateUpdate(BaseModel):
    label: str = None
    value: str = None
    description: str = None

def admin_required(current_user: User):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")


# Return full model with id for frontend
@router.get("/condition-templates", response_model=List[ConditionTemplateRead])
def list_condition_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)
    return db.query(ConditionTemplate).order_by(ConditionTemplate.created_at.desc()).all()

@router.post("/condition-templates", response_model=ConditionTemplateRead)
def create_condition_template(template: ConditionTemplateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    import json
    admin_required(current_user)
    # Prevent duplicate label (case-insensitive, trimmed)
    label_normalized = template.label.strip().lower()
    existing = db.query(ConditionTemplate).filter(
        func.lower(func.trim(ConditionTemplate.label)) == label_normalized
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Label already exists (case-insensitive, trimmed)")
    # Validate value is valid JSON (if not empty)
    if template.value:
        try:
            json.loads(template.value)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON in value: {e}")
    obj = ConditionTemplate(**template.dict(), created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    from fastapi import BackgroundTasks
    def broadcast_event():
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(manager.broadcast({"type": "rbac_event", "event": "condition_template_created", "template_id": obj.id}))
            else:
                loop.run_until_complete(manager.broadcast({"type": "rbac_event", "event": "condition_template_created", "template_id": obj.id}))
        except Exception as e:
            print(f"Broadcast error: {e}")
    background_tasks = BackgroundTasks()
    background_tasks.add_task(broadcast_event)
    return obj


# Move helpers route above the {template_id} route to avoid path conflict
@router.get("/condition-templates/helpers")
def get_prebuilt_condition_templates(current_user: User = Depends(get_current_user)):
    admin_required(current_user)
    return PREBUILT_CONDITION_TEMPLATES

@router.get("/condition-templates/{template_id}", response_model=ConditionTemplateRead)
def get_condition_template(template_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)
    obj = db.query(ConditionTemplate).get(template_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj

@router.put("/condition-templates/{template_id}", response_model=ConditionTemplateRead)
def update_condition_template(template_id: int, update: ConditionTemplateUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)
    obj = db.query(ConditionTemplate).get(template_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in update.dict(exclude_unset=True).items():
        setattr(obj, field, value)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    from fastapi import BackgroundTasks
    def broadcast_event():
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(manager.broadcast({"type": "rbac_event", "event": "condition_template_updated", "template_id": obj.id}))
            else:
                loop.run_until_complete(manager.broadcast({"type": "rbac_event", "event": "condition_template_updated", "template_id": obj.id}))
        except Exception as e:
            print(f"Broadcast error: {e}")
    background_tasks = BackgroundTasks()
    background_tasks.add_task(broadcast_event)
    return obj

@router.delete("/condition-templates/{template_id}")
def delete_condition_template(template_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)
    obj = db.query(ConditionTemplate).get(template_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(obj)
    db.commit()
    from fastapi import BackgroundTasks
    def broadcast_event():
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(manager.broadcast({"type": "rbac_event", "event": "condition_template_deleted", "template_id": template_id}))
            else:
                loop.run_until_complete(manager.broadcast({"type": "rbac_event", "event": "condition_template_deleted", "template_id": template_id}))
        except Exception as e:
            print(f"Broadcast error: {e}")
    background_tasks = BackgroundTasks()
    background_tasks.add_task(broadcast_event)
    return {"ok": True}

# --- Condition Validation Endpoint ---
from fastapi import HTTPException
@router.post("/validate-condition")
def validate_condition(condition: dict = Body(...)):
    import json
    try:
        # Dummy user/context for validation
        dummy_user = type("User", (), {"id": 1, "department": "IT", "region": "EU"})()
        _ = json.dumps(condition)  # Check serializable
        # Optionally, run through ABAC logic with dummy values (future)
        return {"valid": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid condition: {str(e)}")
@router.get("/role-assignments")
def list_role_assignments(
    user_id: Optional[int] = None,
    role_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all role assignments (user, role, resource scope). Azure-style.
    """
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    q = db.query(ResourceRole)
    if user_id:
        q = q.filter(ResourceRole.user_id == user_id)
    if role_id:
        q = q.filter(ResourceRole.role_id == role_id)
    # ResourceRole does not have resource_type; filter by resource_id only
    # if resource_type:
    #     q = q.filter(ResourceRole.resource_type == resource_type)
    if resource_id:
        q = q.filter(ResourceRole.resource_id == resource_id)
    assignments = q.all()
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "role_id": a.role_id,
            # ResourceRole does not have resource_type; omit or set to None
            "resource_type": None,
            "resource_id": a.resource_id,
            "assigned_at": a.assigned_at,
        }
        for a in assignments
    ]
# --- User Effective Permissions Endpoint ---
@router.get("/users/{user_id}/effective-permissions-v2")
def get_user_effective_permissions_v2(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    New unified endpoint for retrieving a user's effective permissions, using the single-source-of-truth RBAC logic.
    """
    from app.services.rbac_service import get_user_effective_permissions_rbac
    perms = get_user_effective_permissions_rbac(db, user_id)
    if perms is None:
        raise HTTPException(status_code=404, detail="User not found")
    return perms
# --- List Access Requests (Delegation/Review) ---
@router.get("/access-requests")
def list_access_requests(
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all access requests (delegation workflow), filterable by user and status.
    """
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    q = db.query(AccessRequest)
    if user_id:
        q = q.filter(AccessRequest.user_id == user_id)
    if status:
        q = q.filter(AccessRequest.status == status)
    reqs = q.order_by(AccessRequest.created_at.desc()).all()
    return [r.dict() for r in reqs]

# --- Periodic Access Review Trigger ---
@router.post("/access-review/trigger")
def trigger_access_review(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Trigger a periodic access review. Returns all active assignments and logs the review trigger.
    """
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    assignments = db.query(ResourceRole).all()
    # Log the review trigger
    from app.services.role_service import log_rbac_action
    log_rbac_action(
        db=db,
        action="trigger_access_review",
        performed_by=getattr(current_user, "email", str(current_user)),
        status="success",
        note=f"Periodic access review triggered by {getattr(current_user, 'email', str(current_user))}",
    )
    # In a real system, this would notify reviewers or create review tasks
    return {"assignments_for_review": [
        {
            "id": a.id,
            "user_id": a.user_id,
            "role_id": a.role_id,
            "resource_type": a.resource_type,
            "resource_id": a.resource_id,
            "assigned_at": a.assigned_at,
        }
        for a in assignments
    ], "count": len(assignments)}

# --- Enhanced Audit Log Filtering ---
@router.get("/audit-logs/filter")
def filter_rbac_audit_logs(
    user: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    q = db.query(RbacAuditLog)
    if user:
        q = q.filter(RbacAuditLog.target_user == user)
    if action:
        q = q.filter(RbacAuditLog.action == action)
    if resource_type:
        q = q.filter(RbacAuditLog.resource_type == resource_type)
    if resource_id:
        q = q.filter(RbacAuditLog.resource_id == resource_id)
    if role:
        q = q.filter(RbacAuditLog.role == role)
    if status:
        q = q.filter(RbacAuditLog.status == status)
    logs = q.order_by(RbacAuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return {"logs": [l.dict() for l in logs], "skip": skip, "limit": limit}
"""
RBAC API routes: advanced, Azure-inspired, enterprise-grade RBAC endpoints.
Handles: user/role/permission/group/service principal management, resource-level scoping, ABAC, delegation, access review, audit logging.
"""
# from fastapi import APIRouter, Depends, HTTPException, Body, Cookie, Request
# from app.models.auth_models import ResourceRole, AccessRequest, RbacAuditLog
# from sqlalchemy.orm import Session
# from typing import List, Optional
# from app.db_session import get_session
# from app.models.auth_models import User, Role, UserRole, Permission
# from app.services.role_service import (
#     list_users, get_user_role, set_user_role, list_permissions, create_permission, delete_permission, update_permission,
#     user_has_permission, assign_permission_to_role, remove_permission_from_role, get_user_permissions,
#     assign_resource_role, list_resource_roles, create_access_request, review_access_request, log_rbac_action, list_rbac_audit_logs
# )
# from app.services.auth_service import get_session_by_token, assign_role_to_user
# import logging


# --- User Management Endpoints --- 
@router.get("/users")
def list_users_api(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    # Eagerly load user roles and role info for all users
    from sqlalchemy.orm import selectinload
    users = db.query(User).options(selectinload(User.roles)).all()
    from app.models.auth_models import Role, RoleInheritance
    from app.services.role_service import get_user_permissions
    # Preload all roles and inheritances
    all_roles = {r.id: r for r in db.query(Role).all()}
    all_role_inheritances = db.query(RoleInheritance).all()
    # Preload group memberships and group roles
    user_groups = {}  # user_id -> set of group_ids
    group_roles = {}  # group_id -> set of role_ids
    from sqlalchemy import text
    for row in db.execute(text("SELECT user_id, group_id FROM user_groups")).fetchall():
        user_groups.setdefault(row.user_id, set()).add(row.group_id)
    for row in db.execute(text("SELECT group_id, role_id FROM group_roles")).fetchall():
        group_roles.setdefault(row.group_id, set()).add(row.role_id)

    # Helper: recursively collect all roles (direct + inherited)
    def collect_all_roles(role, visited=None):
        # Defensive: handle if role is a tuple (ORM join may return tuple)
        if isinstance(role, tuple):
            role = role[0]
        if visited is None:
            visited = set()
        if not hasattr(role, 'id'):
            return []
        if role.id in visited:
            return []
        visited.add(role.id)
        roles = [role]
        for inh in all_role_inheritances:
            if inh.child_role_id == role.id and inh.parent_role_id in all_roles:
                parent = all_roles[inh.parent_role_id]
                roles += collect_all_roles(parent, visited)
        return roles

    result = []
    for u in users:
        # Direct roles
        direct_roles = list(u.roles or [])
        # Group roles
        group_ids = user_groups.get(u.id, set())
        group_role_objs = []
        for gid in group_ids:
            for rid in group_roles.get(gid, set()):
                if rid in all_roles:
                    group_role_objs.append(all_roles[rid])
        # All roles (direct + group)
        all_user_roles = direct_roles + group_role_objs
        # Recursively collect inherited roles (unique by id)
        effective_roles = {}
        for r in all_user_roles:
            for eff_r in collect_all_roles(r):
                effective_roles[eff_r.id] = eff_r
        # Add the primary role string if present and not already in list
        if hasattr(u, "role") and isinstance(u.role, str):
            found = False
            for r in effective_roles.values():
                if hasattr(r, 'name') and r.name == u.role:
                    found = True
                    break
            if not found:
                # Dummy role object with name only
                effective_roles[-1] = type('Role', (), {'id': -1, 'name': u.role, 'description': None})()
        # Return roles as array of unique role names (as expected by frontend)
        role_names = sorted(list({r.name for r in effective_roles.values() if hasattr(r, 'name') and isinstance(r.name, str)}))
        # Build effective_roles array for frontend (id, name, description)
        effective_roles_list = []
        for r in effective_roles.values():
            role_obj = {
                'id': getattr(r, 'id', None),
                'name': getattr(r, 'name', None),
                'description': getattr(r, 'description', None)
            }
            effective_roles_list.append(role_obj)
        # Get direct user permissions (not effective permissions)
        permissions = []
        perms = get_user_permissions(db, u)
        for p in perms:
            perm_obj = None
            if isinstance(p, tuple):
                for item in p:
                    if hasattr(item, "id") and hasattr(item, "action") and hasattr(item, "resource"):
                        perm_obj = item
                        break
            elif hasattr(p, "id") and hasattr(p, "action") and hasattr(p, "resource"):
                perm_obj = p
            if perm_obj:
                permissions.append({
                    "id": perm_obj.id,
                    "action": perm_obj.action,
                    "resource": perm_obj.resource,
                    "conditions": getattr(perm_obj, "conditions", None)
                })
        result.append({
            "id": u.id,
            "email": u.email,
            "roles": role_names,
            "permissions": permissions,
            "isActive": getattr(u, "is_active", True),
            "effective_roles": effective_roles_list
        })
    return result

@router.post("/users/{user_id}/deactivate")
def deactivate_user_api(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"detail": f"User {user_id} deactivated"}

@router.post("/users/{user_id}/activate")
def activate_user_api(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"detail": f"User {user_id} activated"}

@router.post("/users/{user_id}/remove-role")
def remove_role_from_user_api(user_id: int, role_id: int = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    user_role = db.query(UserRole).filter(UserRole.user_id == user_id, UserRole.role_id == role_id).first()
    if not user_role:
        raise HTTPException(status_code=404, detail="User does not have this role")
    db.delete(user_role)
    db.commit()
    return {"detail": f"Role {role_id} removed from user {user_id}"}

@router.post("/users/{user_id}/reactivate")
def reactivate_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    # TODO: Add audit log
    return {"detail": f"User {user.email} reactivated"}

@router.post("/users/bulk-assign-roles")
def bulk_assign_roles(user_ids: List[int] = Body(...), role_id: int = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            assign_role_to_user(db, user, role.name)
            # TODO: Add audit log
    db.commit()
    return {"detail": f"Role {role.name} assigned to users", "role": role.name, "user_ids": user_ids}

@router.post("/users/bulk-remove-roles")
def bulk_remove_roles(user_ids: List[int] = Body(...), role_id: int = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Remove role from user
            user.roles = [r for r in user.roles if r.id != role_id]
            db.add(user)
            # TODO: Add audit log
    db.commit()
    return {"detail": f"Role {role.name} removed from users", "role": role.name, "user_ids": user_ids}

# --- Permission Management Endpoints ---
@router.get("/permissions")
def list_permissions_api(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    permissions = list_permissions(db)
    # For each permission, find all roles that have it
    result = []
    for p in permissions:
        # Find roles for this permission
        roles = db.query(Role).join(RolePermission, Role.id == RolePermission.role_id).filter(RolePermission.permission_id == p.id).all()
        result.append({
            "id": p.id,
            "action": p.action,
            "resource": p.resource,
            "conditions": p.conditions,
            "roles": [
                {"id": r.id, "name": r.name, "description": r.description} for r in roles
            ]
        })
    return result

@router.post("/permissions")
async def create_permission_api(action: str = Body(...), resource: str = Body(...), conditions: Optional[str] = Body(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    perm = create_permission(db, action, resource, conditions)
    await broadcast_rbac_event("permission_created", {"permission_id": perm.id, "action": perm.action, "resource": perm.resource, "conditions": perm.conditions})
    return {"id": perm.id, "action": perm.action, "resource": perm.resource, "conditions": perm.conditions}

@router.delete("/permissions/{permission_id}")
def delete_permission_api(permission_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    success = delete_permission(db, permission_id)
    if not success:
        raise HTTPException(status_code=404, detail="Permission not found")
    # Fix: run broadcast_rbac_event synchronously if no running event loop
    import asyncio
    try:
        loop = asyncio.get_running_loop()
        if loop.is_running():
            asyncio.create_task(broadcast_rbac_event("permission_deleted", {"permission_id": permission_id}))
        else:
            loop.run_until_complete(broadcast_rbac_event("permission_deleted", {"permission_id": permission_id}))
    except RuntimeError:
        # No running event loop
        asyncio.run(broadcast_rbac_event("permission_deleted", {"permission_id": permission_id}))
    return {"detail": f"Permission {permission_id} deleted"}

@router.put("/permissions/{permission_id}")
def update_permission_api(permission_id: int, action: Optional[str] = Body(None), resource: Optional[str] = Body(None), conditions: Optional[str] = Body(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    perm = update_permission(db, permission_id, action, resource, conditions)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    return {"id": perm.id, "action": perm.action, "resource": perm.resource, "conditions": perm.conditions}

@router.post("/roles/bulk-assign-permissions")
def bulk_assign_permissions(role_ids: List[int] = Body(...), permission_id: int = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    perm = db.query(Permission).filter(Permission.id == permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    for role_id in role_ids:
        role = db.query(Role).filter(Role.id == role_id).first()
        if role:
            assign_permission_to_role(db, role_id, permission_id)
            # TODO: Add audit log
    db.commit()
    return {"detail": f"Permission {perm.action} assigned to roles", "permission": perm.action, "role_ids": role_ids}

@router.post("/roles/bulk-remove-permissions")
def bulk_remove_permissions(role_ids: List[int] = Body(...), permission_id: int = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    perm = db.query(Permission).filter(Permission.id == permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    for role_id in role_ids:
        role = db.query(Role).filter(Role.id == role_id).first()
        if role:
            remove_permission_from_role(db, role_id, permission_id)
            # TODO: Add audit log
    db.commit()
    return {"detail": f"Permission {perm.action} removed from roles", "permission": perm.action, "role_ids": role_ids}

# --- Role Management Endpoints ---
@router.get("/roles")
def list_roles_api(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    roles = db.query(Role).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "permissions": [
                {
                    "id": p.id,
                    "action": p.action,
                    "resource": p.resource,
                    "conditions": getattr(p, "conditions", None)
                }
                for p in (getattr(r, "permissions", []) or [])
                if hasattr(p, "id") and hasattr(p, "action") and hasattr(p, "resource")
            ],
        }
        for r in roles
    ]

@router.post("/roles")
def create_role_api(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    from app.services.role_service import create_role
    role = create_role(db, role_in.name, role_in.description)
    return {"id": role.id, "name": role.name, "description": role.description}

@router.delete("/roles/{role_id}")
def delete_role_api(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    return {"detail": f"Role {role_id} deleted"}

@router.put("/roles/{role_id}")
def update_role_api(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not user_has_permission(db, current_user, "manage", "rbac") and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin or RBAC manager only")
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role.name = role_in.name
    role.description = role_in.description
    db.commit()
    db.refresh(role)
    return {"id": role.id, "name": role.name, "description": role.description}

# --- Current User + Effective Permissions Endpoint ---
@router.get("/me")
def get_rbac_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    import traceback
    try:
        from sqlalchemy.orm import selectinload
        # Always re-query the user with relationships loaded
        user = db.query(User).options(
            selectinload(User.roles).selectinload(Role.permissions)
        ).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        roles = []
        # Add the primary role if it exists and is a string
        if hasattr(user, "role") and isinstance(user.role, str):
            roles.append(user.role)
        user_roles = getattr(user, "roles", None) or []
        # Only add role names (strings) to roles
        for r in user_roles:
            if hasattr(r, "name") and isinstance(r.name, str):
                roles.append(r.name)
            elif isinstance(r, tuple) and len(r) > 1 and isinstance(r[1], str):
                roles.append(r[1])
        permissions = []
        import sys
        print("[RBAC DEBUG] User roles:", [getattr(r, 'name', None) for r in user_roles], file=sys.stderr)
        for role in user_roles:
            print(f"[RBAC DEBUG] Role: {getattr(role, 'name', None)} Permissions: {[f'{p.action}:{p.resource}' for p in getattr(role, 'permissions', [])]}", file=sys.stderr)
            for rp in getattr(role, "permissions", []) or []:
                if (rp.action, rp.resource) not in [(p["action"], p["resource"]) for p in permissions]:
                    permissions.append({
                        "id": getattr(rp, "id", None),
                        "action": rp.action,
                        "resource": rp.resource,
                        "conditions": getattr(rp, "conditions", None)
                    })
        print("[RBAC DEBUG] Final permissions:", permissions, file=sys.stderr)
        return {
            "id": user.id,
            "email": user.email,
            "roles": list(dict.fromkeys(roles)),
            "permissions": permissions,
        }
    except Exception as e:
        import sys
        print("Exception in get_rbac_me:", e, file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        import logging
        logger = logging.getLogger("rbac_me")
        logger.error(f"Exception in get_rbac_me: {e}", exc_info=True)
        logger.error(traceback.format_exc())
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error in /me: {e}")

# --- Current User + Flat Permissions Array Endpoint ---
@router.get("/me/flat-permissions")
def get_rbac_me_flat_permissions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.services.rbac_service import get_user_effective_permissions_rbac
    perms = get_user_effective_permissions_rbac(db, current_user.id)
    if perms is None:
        raise HTTPException(status_code=404, detail="User not found")
    flat_permissions = [f"{p['resource']}.{p['action']}" for p in perms if p.get('action') and p.get('resource')]
    return {
        "id": getattr(current_user, "id", None),
        "email": getattr(current_user, "email", None),
        "roles": [r for r in getattr(current_user, "roles", [])],
        "flatPermissions": flat_permissions,
    }


# --- Advanced RBAC Features ---

# Resource-level scoping example: assign role/permission to a specific resource (db/schema/table)
@router.post("/assign-role-scope")
def assign_role_scope(
    user_id: int = Body(...),
    role_id: int = Body(...),
    resource_type: str = Body(...),  # e.g., 'database', 'schema', 'table'
    resource_id: str = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    # Defensive: ensure resource_type is not None or empty
    if not resource_type:
        raise HTTPException(status_code=400, detail="resource_type is required")
    rr = assign_resource_role(db, user_id, role_id, resource_type, resource_id, performed_by=current_user.email)
    return {"detail": f"Role {role_id} assigned to user {user_id} for {resource_type}:{resource_id}", "assignment": rr.dict()}

@router.get("/resource-roles")
def get_resource_roles(
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    roles = list_resource_roles(db, user_id, resource_type, resource_id)
    return [r.dict() for r in roles]

# Built-in roles endpoint (Azure-style)
@router.get("/builtin-roles")
def get_builtin_roles():
    return [
        {"name": "DB Reader", "description": "Read-only access to database resources."},
        {"name": "DB Writer", "description": "Read/write access to database resources."},
        {"name": "DB Admin", "description": "Full admin access to database resources."},
        {"name": "RBAC Admin", "description": "Manage RBAC assignments and policies."},
    ]

# ABAC/conditions: test permission with advanced conditions
@router.post(
    "/test-abac",
    summary="Test ABAC Permission",
    response_description="Whether the user is allowed the action on the resource under the given conditions.",
    responses={
        200: {
            "description": "Permission check result",
            "content": {
                "application/json": {
                    "example": {"allowed": True}
                }
            }
        },
        404: {"description": "User not found"}
    }
)
def test_abac(
    user_id: int = Body(..., example=1, description="User ID to check permission for"),
    action: str = Body(..., example="view", description="Action to check, e.g. 'view', 'edit'"),
    resource: str = Body(..., example="sensitivity_labels", description="Resource name/type to check"),
    conditions: dict = Body(..., example={"department": "finance"}, description="ABAC conditions to test (attribute dict)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Test whether a user is allowed to perform an action on a resource under specific ABAC conditions.

    - **user_id**: The user to check
    - **action**: The action (e.g. 'view', 'edit')
    - **resource**: The resource name/type
    - **conditions**: A dict of attributes (e.g. {"department": "finance"})

    Returns: {"allowed": true/false}
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    allowed = user_has_permission(db, user, action, resource, conditions=conditions)
    return {"allowed": allowed}

# Delegation: request access (delegation workflow)
@router.post("/request-access")
def request_access(
    user_id: int = Body(...),
    resource_type: str = Body(...),
    resource_id: str = Body(...),
    requested_role: str = Body(...),
    justification: str = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda session_token=Cookie(None), db=Depends(get_db): get_session_by_token(db, session_token).user)
):
    req = create_access_request(db, user_id, resource_type, resource_id, requested_role, justification)
    return {"detail": "Access request submitted", "status": req.status, "request": req.dict()}

# Access review: approve/reject access requests
@router.post("/access-review")
def access_review(
    request_id: int = Body(...),
    approve: bool = Body(...),
    review_note: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda session_token=Cookie(None), db=Depends(get_db): get_session_by_token(db, session_token).user)
):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    req = review_access_request(db, request_id, approve, reviewer=current_user.email, review_note=review_note)
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")
    return {"detail": "Access request reviewed", "approved": approve, "request": req.dict()}

# Audit log: list RBAC-related audit events
@router.get("/audit-logs")
def get_rbac_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda session_token=Cookie(None), db=Depends(get_db): get_session_by_token(db, session_token).user)
):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    logs = list_rbac_audit_logs(db, skip=skip, limit=limit)
    return {"logs": [l.dict() for l in logs], "skip": skip, "limit": limit}

# --- Entity-centric Audit Log Endpoint ---
from typing import Any
from app.services.role_service import get_entity_audit_history

class EntityAuditQuery(BaseModel):
    entity_type: str
    entity_id: str
    limit: int = 100

@router.post("/audit-logs/entity-history")
def get_audit_history_for_entity(
    query: EntityAuditQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    logs = get_entity_audit_history(db, query.entity_type, query.entity_id, query.limit)
    return {"logs": [l.dict() for l in logs], "entity_type": query.entity_type, "entity_id": query.entity_id}


#---------------------------------------------------------------------------------
# --- Group Management Endpoints ---
@router.get("/groups")
def list_groups_api(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import list_group_members, list_group_roles
    from app.models.auth_models import Group
    groups = db.query(Group).all()
    result = []
    for group in groups:
        # Get users
        users = list_group_members(db, group.id)
        users_data = [{"id": u.id, "email": u.email} for u in users]
        # Get roles
        group_roles = list_group_roles(db, group.id)
        # For each group role, fetch the role object for name/description
        roles_data = []
        for gr in group_roles:
            role = db.query(Role).filter(Role.id == gr.role_id).first()
            if role:
                roles_data.append({
                    "id": role.id,
                    "name": role.name,
                    "description": role.description,
                    "resource_type": gr.resource_type,
                    "resource_id": gr.resource_id,
                    "assigned_at": gr.assigned_at
                })
        result.append({
            "id": group.id,
            "name": group.name,
            "description": getattr(group, "description", None),
            "users": users_data,
            "roles": roles_data
        })
    return result

@router.post("/groups")
def create_group_api(name: str = Body(...), description: str = Body(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import create_group
    group = create_group(db, name, description)
    return {"id": group.id, "name": group.name, "description": group.description}

from typing import List
@router.post("/groups/{group_id}/add-user")
def add_user_to_group_api(group_id: int, user_ids: List[int] = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import add_user_to_group
    user_group_ids = []
    for user_id in user_ids:
        ug = add_user_to_group(db, user_id, group_id)
        user_group_ids.append(ug.id)
    return {"detail": f"Users {user_ids} added to group {group_id}", "user_group_ids": user_group_ids}

class RemoveUserRequest(BaseModel):
    user_id: int

@router.post("/groups/{group_id}/remove-user")
def remove_user_from_group_api(group_id: int, req: RemoveUserRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import remove_user_from_group, list_groups
    ug = remove_user_from_group(db, req.user_id, group_id)
    # Return updated group object for frontend
    group = [g for g in list_groups(db) if g["id"] == group_id]
    return {"detail": f"User {req.user_id} removed from group {group_id}", "group": group[0] if group else None}

class RemoveRoleRequest(BaseModel):
    role_id: int

@router.post("/groups/{group_id}/remove-role")
def remove_role_from_group_api(group_id: int, req: RemoveRoleRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import remove_role_from_group, list_groups
    gr = remove_role_from_group(db, group_id, req.role_id)
    group = [g for g in list_groups(db) if g["id"] == group_id]
    return {"detail": f"Role {req.role_id} removed from group {group_id}", "group": group[0] if group else None}
@router.post("/groups/{group_id}/assign-role")
def assign_role_to_group_api(group_id: int, role_ids: List[int] = Body(...), resource_type: str = Body(None), resource_id: str = Body(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import assign_role_to_group
    group_role_ids = []
    for role_id in role_ids:
        gr = assign_role_to_group(db, group_id, role_id, resource_type, resource_id)
        group_role_ids.append(gr.id)
    return {"detail": f"Roles {role_ids} assigned to group {group_id}", "group_role_ids": group_role_ids}

@router.get("/groups/{group_id}/members")
def list_group_members_api(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import list_group_members
    users = list_group_members(db, group_id)
    return [
        {"id": u.id, "email": u.email} for u in users
    ]

@router.get("/groups/{group_id}/roles")
def list_group_roles_api(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import list_group_roles
    roles = list_group_roles(db, group_id)
    return [
        {"id": r.id, "role_id": r.role_id, "resource_type": r.resource_type, "resource_id": r.resource_id, "assigned_at": r.assigned_at} for r in roles
    ]
#---------------------------------------
# --- Deny Assignment Endpoints ---
@router.get("/deny-assignments")
def list_deny_assignments_api(principal_type: str = None, principal_id: int = None, resource: str = None, action: str = None, db: Session = Depends(get_db), current_user: User = Depends(lambda session_token=Cookie(None), db=Depends(get_db): get_session_by_token(db, session_token).user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.services.role_service import list_deny_assignments
    user_id = principal_id if principal_type == "user" else None
    group_id = principal_id if principal_type == "group" else None
    denies = list_deny_assignments(db, user_id, group_id, resource, action)
    return [
        {
            "id": d.id,
            "principal_type": "user" if d.user_id else "group",
            "principal_id": d.user_id if d.user_id else d.group_id,
            "user_id": d.user_id,
            "group_id": d.group_id,
            "action": d.action,
            "resource": d.resource,
            "conditions": d.conditions,
            "created_at": d.created_at
        } for d in denies
    ]

from fastapi import Request
@router.post("/deny-assignments")
def create_deny_assignment_api(request: Request, db: Session = Depends(get_db), current_user: User = Depends(lambda session_token=Cookie(None), db=Depends(get_db): get_session_by_token(db, session_token).user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    data = None
    import asyncio
    if hasattr(request, 'json'):
        data = asyncio.run(request.json())
    if not data:
        data = getattr(request, '_json', {})
    principal_type = data.get("principal_type")
    principal_id = data.get("principal_id")
    action = data.get("action")
    resource = data.get("resource")
    conditions = data.get("conditions")
    user_id = principal_id if principal_type == "user" else None
    group_id = principal_id if principal_type == "group" else None
    from app.services.role_service import create_deny_assignment
    deny = create_deny_assignment(db, user_id, group_id, action, resource, conditions)
    return {
        "id": deny.id,
        "principal_type": "user" if deny.user_id else "group",
        "principal_id": deny.user_id if deny.user_id else deny.group_id,
        "user_id": deny.user_id,
        "group_id": deny.group_id,
        "action": deny.action,
        "resource": deny.resource,
        "conditions": deny.conditions,
        "created_at": deny.created_at
    }

# --- DELETE DenyAssignment endpoint ---
from app.models.auth_models import DenyAssignment
@router.delete("/deny-assignments/{deny_assignment_id}")
def delete_deny_assignment_api(
    deny_assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda session_token=Cookie(None), db=Depends(get_db): get_session_by_token(db, session_token).user)
):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    obj = db.query(DenyAssignment).filter(DenyAssignment.id == deny_assignment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="DenyAssignment not found")
    db.delete(obj)
    db.commit()
    return {"detail": f"DenyAssignment {deny_assignment_id} deleted"}
    #----------------------------
    # --- Role Inheritance Endpoints (appended at end of file to avoid import/dependency issues) ---
from app.models.auth_models import RoleInheritance
from sqlalchemy.orm import joinedload

@router.get("/roles/{role_id}/parents")
def get_role_parents(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(Role).options(joinedload(Role.parents)).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    # Defensive: role.parents may be None if not set by ORM
    parents = role.parents if role.parents is not None else []
    return [{"id": r.id, "name": r.name, "description": r.description} for r in parents]

@router.get("/roles/{role_id}/children")
def get_role_children(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(Role).options(joinedload(Role.children)).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    # Defensive: role.children may be None if not set by ORM
    children = role.children if role.children is not None else []
    return [{"id": r.id, "name": r.name, "description": r.description} for r in children]

@router.post("/roles/{role_id}/parents")
def add_role_parent(role_id: int, parent_id: int = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    # Prevent cycles
    if role_id == parent_id:
        raise HTTPException(status_code=400, detail="Role cannot inherit from itself")
    # Check existence
    role = db.query(Role).filter(Role.id == role_id).first()
    parent = db.query(Role).filter(Role.id == parent_id).first()
    if not role or not parent:
        raise HTTPException(status_code=404, detail="Role or parent not found")
    # Check for existing
    existing = db.query(RoleInheritance).filter(RoleInheritance.child_role_id == role_id, RoleInheritance.parent_role_id == parent_id).first()
    if existing:
        return {"detail": "Already inherited"}
    # Import and use cycle prevention
    from app.services.role_service import can_assign_parent_role
    if not can_assign_parent_role(db, child_role_id=role_id, parent_role_id=parent_id):
        raise HTTPException(status_code=400, detail="Cycle detected: cannot assign parent role.")
    inh = RoleInheritance(parent_role_id=parent_id, child_role_id=role_id)
    db.add(inh)
    db.commit()
    return {"detail": "Parent added"}

@router.delete("/roles/{role_id}/parents/{parent_id}")
def remove_role_parent(role_id: int, parent_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    inh = db.query(RoleInheritance).filter(RoleInheritance.child_role_id == role_id, RoleInheritance.parent_role_id == parent_id).first()
    if not inh:
        raise HTTPException(status_code=404, detail="Inheritance not found")
    db.delete(inh)
    db.commit()
    return {"detail": "Parent removed"}

@router.get("/roles/{role_id}/effective-permissions")
def get_role_effective_permissions(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.services.role_service import get_effective_permissions_for_role
    from sqlalchemy.orm import selectinload
    role = db.query(Role).options(selectinload(Role.parents), selectinload(Role.permissions)).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Get effective permissions (should be set of Permission objects)
    perms = get_effective_permissions_for_role(role)
    # Defensive: filter out any non-Permission objects
    permission_objs = []
    for p in perms:
        if all(hasattr(p, attr) for attr in ("id", "action", "resource")):
            permission_objs.append(p)
    result = []
    for perm_obj in permission_objs:
        result.append({
            "id": perm_obj.id,
            "action": perm_obj.action,
            "resource": perm_obj.resource,
            "conditions": getattr(perm_obj, "conditions", None)
        })
    return result


@router.post("/roles/selected-permissions")
def get_selected_roles_permissions_endpoint(
    role_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda: None),  # Optionally add Depends(get_current_user)
):
    # Optionally: admin_required(current_user)
    return get_selected_roles_permissions(db, role_ids)

# --- Resource Pydantic Schemas ---
from app.models.auth_models import Resource

class ResourceCreate(BaseModel):
    name: str
    type: str  # server, database, schema, table, collection
    parent_id: Optional[int] = None
    engine: Optional[str] = None
    details: Optional[str] = None

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    engine: Optional[str] = None
    details: Optional[str] = None




# --- Resource Tree Endpoint ---
def build_resource_tree(db: Session, parent_id: Optional[int] = None):
    nodes = db.query(Resource).filter(Resource.parent_id == parent_id).all()
    return [
        {
            **n.dict(),
            "children": build_resource_tree(db, n.id)
        }
        for n in nodes
    ]

@router.get("/resources/tree")
def get_resource_tree(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return build_resource_tree(db)

@router.post("/resources", response_model=Resource)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = Resource(**resource.dict())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r

@router.get("/resources/{resource_id}", response_model=Resource)
def get_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return r

@router.put("/resources/{resource_id}", response_model=Resource)
def update_resource(resource_id: int, update: ResourceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    for k, v in update.dict(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r

@router.delete("/resources/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(r)
    db.commit()
    return {"ok": True}

# --- Resource Role Assignment & Effective Permissions ---
from app.models.auth_models import ResourceRole

class AssignResourceRoleRequest(BaseModel):
    user_id: int
    role_id: int
    resource_id: int

@router.post("/resources/{resource_id}/assign-role")
def assign_role_to_resource_node(resource_id: int, req: AssignResourceRoleRequest, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Fetch the resource to get its type
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    rr = ResourceRole(
        user_id=req.user_id,
        role_id=req.role_id,
        resource_id=resource_id,
        resource_type=resource.type
    )
    db.add(rr)
    db.commit()
    db.refresh(rr)
    return rr

@router.get("/resources/{resource_id}/roles")
def get_roles_for_resource_node(resource_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    roles = db.query(ResourceRole).filter(ResourceRole.resource_id == resource_id).all()
    return roles

# --- Effective Permissions Up The Resource Tree ---
def get_resource_ancestors(db: Session, resource_id: int):
    ancestors = []
    current = db.query(Resource).filter(Resource.id == resource_id).first()
    while current:
        ancestors.append(current)
        if not current.parent_id:
            break
        current = db.query(Resource).filter(Resource.id == current.parent_id).first()
    return ancestors

@router.get("/resources/{resource_id}/effective-permissions")
def get_effective_permissions_for_resource(resource_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Walk up the tree, collect all ResourceRole assignments
    ancestors = get_resource_ancestors(db, resource_id)
    ancestor_ids = [r.id for r in ancestors]
    roles = db.query(ResourceRole).filter(ResourceRole.resource_id.in_(ancestor_ids)).all()
    # Optionally, resolve to permissions via roles
    # ...existing code to resolve permissions for each role...
    return roles

# --- Enhanced Effective Permissions: resolve to permissions per user ---
from app.models.auth_models import Role, Permission, RolePermission

def get_permissions_for_roles(db: Session, role_ids: list[int]):
    # Get all permissions for the given role ids
    role_perms = db.query(RolePermission).filter(RolePermission.role_id.in_(role_ids)).all()
    perm_ids = [rp.permission_id for rp in role_perms]
    perms = db.query(Permission).filter(Permission.id.in_(perm_ids)).all()
    return perms

@router.get("/resources/{resource_id}/effective-user-permissions")
def get_effective_user_permissions_for_resource(resource_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Walk up the tree, collect all ResourceRole assignments
    ancestors = get_resource_ancestors(db, resource_id)
    ancestor_ids = [r.id for r in ancestors]
    resource_roles = db.query(ResourceRole).filter(ResourceRole.resource_id.in_(ancestor_ids)).all()
    # Map: user_id -> set(role_ids)
    user_roles = {}
    for rr in resource_roles:
        user_roles.setdefault(rr.user_id, set()).add(rr.role_id)
    # Map: user_id -> set(permission)
    user_permissions = {}
    for user_id, role_ids in user_roles.items():
        perms = get_permissions_for_roles(db, list(role_ids))
        user_permissions[user_id] = [p.dict() for p in perms]
    return user_permissions

# Place after router = APIRouter(...)
class PermissionDiffRequest(BaseModel):
    user_id: Optional[int] = None
    role_id: Optional[int] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    before_state: Optional[list] = None  # List of {action, resource}
    after_state: Optional[list] = None

@router.post("/permission-diff")
def permission_diff(
    req: PermissionDiffRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not (req.user_id or req.role_id):
        raise HTTPException(status_code=400, detail="user_id or role_id required")
    # Only admin or self can view
    if getattr(current_user, "role", None) != "admin":
        if req.user_id and req.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    diff = get_permission_diff(
        db,
        user_id=req.user_id,
        role_id=req.role_id,
        resource_type=req.resource_type,
        resource_id=req.resource_id,
        before_state=req.before_state,
        after_state=req.after_state
    )
# Utility to broadcast RBAC events
async def broadcast_rbac_event(event_type: str, data: dict):
    await manager.broadcast({
        "type": "rbac_event",
        "event": event_type,
        "data": data,
    })


# --- Prebuilt Condition Template Helpers ---


PREBUILT_CONDITION_TEMPLATES = [
    {
        "label": "Owner Only",
        "value": '{"user_id": ":current_user_id"}',
        "description": "Only the owner (current user) can access."
    },
    {
        "label": "Department Match",
        "value": '{"department": ":user_department"}',
        "description": "User's department must match the resource's department."
    },
    {
        "label": "Region Match",
        "value": '{"region": ":user_region"}',
        "description": "User's region must match the resource's region."
    },
    {
        "label": "Custom",
        "value": '',
        "description": "Custom condition (advanced)."
    }
]




# # Place after router = APIRouter(...) and get_current_user is defined
# @router.get("/condition-templates/helpers")
# def get_prebuilt_condition_templates(current_user: User = Depends(get_current_user)):
#     admin_required(current_user)
#     return PREBUILT_CONDITION_TEMPLATES


# class ConditionTemplateCreate(BaseModel):
#     label: str
#     value: str
#     description: Optional[str] = None

# class ConditionTemplateUpdate(BaseModel):
#     label: Optional[str] = None
#     value: Optional[str] = None
#     description: Optional[str] = None

# def admin_required(current_user: User):
#     if getattr(current_user, "role", None) != "admin":
#         raise HTTPException(status_code=403, detail="Admin only")

# @router.post("/condition-templates", response_model=ConditionTemplateCreate)
# def create_condition_template(template: ConditionTemplateCreate, db: Session = Depends(get_session), current_user: User = Depends(get_current_user), from_prebuilt: Optional[bool] = Body(False)):
#     admin_required(current_user)
#     # If from_prebuilt is True, ensure label matches a prebuilt, and use its value/description
#     if from_prebuilt:
#         match = next((t for t in PREBUILT_CONDITION_TEMPLATES if t["label"] == template.label), None)
#         if not match:
#             raise HTTPException(status_code=400, detail="No such prebuilt template")
#         template_data = {
#             "label": match["label"],
#             "value": match["value"],
#             "description": match["description"]
#         }
#     else:
#         template_data = template.dict()
#     if db.query(ConditionTemplate).filter_by(label=template_data["label"]).first():
#         raise HTTPException(status_code=400, detail="Label already exists")
#     obj = ConditionTemplate(**template_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
#     db.add(obj)
#     db.commit()
#     db.refresh(obj)
#     return obj

# @router.get("/condition-templates/{template_id}", response_model=ConditionTemplateCreate)
# def get_condition_template(template_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
#     admin_required(current_user)
#     obj = db.query(ConditionTemplate).get(template_id)
#     if not obj:
#         raise HTTPException(status_code=404, detail="Not found")
#     return obj

# @router.put("/condition-templates/{template_id}", response_model=ConditionTemplateCreate)
# def update_condition_template(template_id: int, update: ConditionTemplateUpdate, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
#     admin_required(current_user)
#     obj = db.query(ConditionTemplate).get(template_id)
#     if not obj:
#         raise HTTPException(status_code=404, detail="Not found")
#     for field, value in update.dict(exclude_unset=True).items():
#         setattr(obj, field, value)
#     obj.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(obj)
#     return obj

# @router.delete("/condition-templates/{template_id}")
# def delete_condition_template(template_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
#     admin_required(current_user)
#     obj = db.query(ConditionTemplate).get(template_id)
#     if not obj:
#         raise HTTPException(status_code=404, detail="Not found")
#     db.delete(obj)
#     db.commit()
#     return {"ok": True}



# =====================
# Resource Ancestor/Descendant API Endpoints (Efficient, CTE-backed)
# =====================
from app.services.resource_service import (
    get_resource_ancestors, get_resource_descendants, sync_data_sources_to_resources,
    get_resource_by_data_source, create_schema_resources_for_data_source,
    create_table_resources_for_schema, get_resources_by_data_source_hierarchy
)

# --- Get all ancestors of a resource (up to root) ---
@router.get("/resources/{resource_id}/ancestors")
def api_get_resource_ancestors(resource_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """
    Returns a list of ancestor resources, closest parent first, up to the root.
    Uses recursive CTE if supported by the DB, otherwise falls back to Python recursion.
    """
    return [r.dict() for r in get_resource_ancestors(db, resource_id)]

# --- Get all descendants of a resource (children, grandchildren, etc.) ---
@router.get("/resources/{resource_id}/descendants")
def api_get_resource_descendants(resource_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """
    Returns a flat list of all descendant resources (children, grandchildren, etc.).
    Uses recursive CTE if supported by the DB, otherwise falls back to Python recursion.
    """
    return [r.dict() for r in get_resource_descendants(db, resource_id)]

# --- Data Source Integration Endpoints ---
@router.post("/resources/sync-data-sources")
def sync_data_sources_endpoint(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """
    Synchronize data sources to RBAC resources for production-ready resource management.
    Creates hierarchical resource structure based on real data sources.
    """
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    try:
        result = sync_data_sources_to_resources(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync data sources: {str(e)}")

@router.get("/resources/data-source/{data_source_id}")
def get_resource_by_data_source_endpoint(data_source_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Get the RBAC resource associated with a specific data source."""
    resource = get_resource_by_data_source(db, data_source_id)
    if not resource:
        raise HTTPException(status_code=404, detail="No resource found for this data source")
    return resource.dict()

@router.get("/resources/data-source/{data_source_id}/hierarchy")
def get_data_source_hierarchy_endpoint(data_source_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Get all resources in the hierarchy for a specific data source."""
    hierarchy = get_resources_by_data_source_hierarchy(db, data_source_id)
    return {
        "data_source": [r.dict() for r in hierarchy["data_source"]],
        "databases": [r.dict() for r in hierarchy["databases"]],
        "schemas": [r.dict() for r in hierarchy["schemas"]],
        "tables": [r.dict() for r in hierarchy["tables"]]
    }

class CreateSchemaResourcesRequest(BaseModel):
    schemas: List[str]

@router.post("/resources/data-source/{data_source_id}/schemas")
def create_schema_resources_endpoint(
    data_source_id: int, 
    request: CreateSchemaResourcesRequest,
    db: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    """Create schema resources under a data source resource."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    try:
        resources = create_schema_resources_for_data_source(db, data_source_id, request.schemas)
        return {
            "created_count": len(resources),
            "resources": [r.dict() for r in resources]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create schema resources: {str(e)}")

class CreateTableResourcesRequest(BaseModel):
    tables: List[str]

@router.post("/resources/schema/{schema_resource_id}/tables")
def create_table_resources_endpoint(
    schema_resource_id: int,
    request: CreateTableResourcesRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create table resources under a schema resource."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    try:
        resources = create_table_resources_for_schema(db, schema_resource_id, request.tables)
        return {
            "created_count": len(resources),
            "resources": [r.dict() for r in resources]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create table resources: {str(e)}")


# =====================
# RBAC Bulk Operations API Documentation
# =====================
'''
Efficient Bulk Operations Endpoints (Service-backed)
---------------------------------------------------
These endpoints allow admins to assign or remove roles and permissions in bulk, using optimized service-layer logic for performance and reliability.

Endpoints:
- POST /rbac/users/bulk-assign-roles-efficient
    Assign a role to multiple users efficiently.
    Body: {"user_ids": [int, ...], "role_id": int}

- POST /rbac/users/bulk-remove-roles-efficient
    Remove a role from multiple users efficiently.
    Body: {"user_ids": [int, ...], "role_id": int}

- POST /rbac/roles/bulk-assign-permissions-efficient
    Assign a permission to multiple roles efficiently.
    Body: {"role_ids": [int, ...], "permission_id": int}

- POST /rbac/roles/bulk-remove-permissions-efficient
    Remove a permission from multiple roles efficiently.
    Body: {"role_ids": [int, ...], "permission_id": int}

All endpoints require admin privileges.

Use these endpoints for large-scale RBAC changes to avoid performance issues with many individual API calls.
'''

# =====================
# Bulk Operations API (Efficient, Service-backed)
# =====================
from app.services.role_service import (
    bulk_assign_role_to_users, bulk_remove_role_from_users,
    bulk_assign_permission_to_roles, bulk_remove_permission_from_roles
)

@router.post("/users/bulk-assign-roles-efficient")
def bulk_assign_roles_efficient(user_ids: List[int] = Body(...), role_id: int = Body(...), db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Assign a role to multiple users efficiently (service-backed)."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    bulk_assign_role_to_users(db, user_ids, role_id)
    return {"detail": f"Role {role_id} assigned to users", "role_id": role_id, "user_ids": user_ids}

@router.post("/users/bulk-remove-roles-efficient")
def bulk_remove_roles_efficient(user_ids: List[int] = Body(...), role_id: int = Body(...), db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Remove a role from multiple users efficiently (service-backed)."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    bulk_remove_role_from_users(db, user_ids, role_id)
    return {"detail": f"Role {role_id} removed from users", "role_id": role_id, "user_ids": user_ids}

@router.post("/roles/bulk-assign-permissions-efficient")
def bulk_assign_permissions_efficient(role_ids: List[int] = Body(...), permission_id: int = Body(...), db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Assign a permission to multiple roles efficiently (service-backed)."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    bulk_assign_permission_to_roles(db, role_ids, permission_id)
    return {"detail": f"Permission {permission_id} assigned to roles", "permission_id": permission_id, "role_ids": role_ids}

@router.post("/roles/bulk-remove-permissions-efficient")
def bulk_remove_permissions_efficient(role_ids: List[int] = Body(...), permission_id: int = Body(...), db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Remove a permission from multiple roles efficiently (service-backed)."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    bulk_remove_permission_from_roles(db, role_ids, permission_id)
    return {"detail": f"Permission {permission_id} removed from roles", "permission_id": permission_id, "role_ids": role_ids}

@router.post("/roles/bulk-permissions", response_model=list)
def get_roles_bulk_permissions(
    role_ids: list[int] = Body(...),
    db: Session = Depends(get_session),
    current_user: User = Depends(lambda: None),
):
    try:
        # Eagerly load permissions for all roles
        roles = db.query(Role).options(selectinload(Role.permissions)).filter(Role.id.in_(role_ids)).all()
        result = []
        for role in roles:
            perms = [
                {
                    "id": p.id,
                    "action": p.action,
                    "resource": p.resource,
                    "conditions": getattr(p, "conditions", None),
                }
                for p in getattr(role, "permissions", []) or []
            ]
            result.append({"role_id": role.id, "permissions": perms})
        # For any missing role IDs, return empty permissions
        found_ids = {r.id for r in roles}
        for rid in role_ids:
            if rid not in found_ids:
                result.append({"role_id": rid, "permissions": []})
        return result
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Error in bulk role permissions: {str(e)}\n{tb}")