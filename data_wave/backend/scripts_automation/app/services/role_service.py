
from sqlalchemy.orm import Session
from app.models.auth_models import Group, UserGroup, User, GroupRole, Role, DenyAssignment, Permission, RolePermission, ResourceRole, AccessRequest, RbacAuditLog
from typing import List, Optional
from datetime import datetime

# --- Notification System (Pluggable) ---
def notify_admins(subject: str, body: str):
    """Send a notification to admins. Swap out implementation as needed."""
    try:
        from app.services.notification_service import send_email, send_slack_notification, EMAIL_ADMINS
        send_email(subject, body, EMAIL_ADMINS)
        send_slack_notification(f"[ADMIN] {subject}\n{body}")
    except ImportError:
        pass

def notify_user(email: str, subject: str, body: str):
    """Send a notification to a user. Swap out implementation as needed."""
    try:
        from app.services.notification_service import send_email
        send_email(subject, body, [email])
    except ImportError:
        pass



# --- Permission Diff Service ---
def get_permission_diff(
    db: Session,
    user_id: int = None,
    role_id: int = None,
    resource_type: str = None,
    resource_id: str = None,
    before_state: dict = None,
    after_state: dict = None
) -> dict:
    """
    Returns a granular diff of permissions for a user or role on a resource.
    Includes: direct/inherited, ancestor/source, added/removed/unchanged.
    If before_state/after_state are not provided, computes current effective permissions.
    """
    from app.models.auth_models import User, Role
    def get_effective(db, user_id, role_id, resource_type, resource_id, state=None):
        # If state is provided, use it; else, fetch from DB
        if state is not None:
            return set(tuple(sorted((p['action'], p['resource']))) for p in state)
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return set()
            perms = set()
            for role in getattr(user, 'roles', []):
                perms.update(get_effective_permissions_for_role(role))
            return set((p.action, p.resource) for p in perms)
        elif role_id:
            role = db.query(Role).filter(Role.id == role_id).first()
            if not role:
                return set()
            perms = get_effective_permissions_for_role(role)
            return set((p.action, p.resource) for p in perms)
        return set()

    before = get_effective(db, user_id, role_id, resource_type, resource_id, before_state)
    after = get_effective(db, user_id, role_id, resource_type, resource_id, after_state)
    added = after - before
    removed = before - after
    unchanged = after & before

    def annotate(perms, status):
        return [
            {
                "action": p[0],
                "resource": p[1],
                "change": status,
                # Optionally: add source/inheritance info here
            }
            for p in perms
        ]

    return {
        "added": annotate(added, "added"),
        "removed": annotate(removed, "removed"),
        "unchanged": annotate(unchanged, "unchanged"),
    }
def get_effective_permissions_for_role(role, visited=None):
    """
    Recursively collect all permissions for a role, including inherited (parent) roles.
    Args:
        role: Role instance
        visited: set of role ids to avoid cycles
    Returns:
        Set of Permission objects
    """
    # Defensive: handle if role is a tuple or str (should never be str, but guard anyway)
    if isinstance(role, tuple):
        role = role[0]
    if not hasattr(role, 'id') or isinstance(role, str):
        return []
    if visited is None:
        visited = set()
    if role.id in visited:
        return []
    visited.add(role.id)
    perms = []
    seen_perm_ids = set()
    for p in getattr(role, "permissions", []) or []:
        if hasattr(p, "id") and p.id not in seen_perm_ids:
            perms.append(p)
            seen_perm_ids.add(p.id)
    for parent in getattr(role, "parents", []) or []:
        if isinstance(parent, tuple):
            parent = parent[0]
        if not hasattr(parent, 'id') or isinstance(parent, str):
            continue
        parent_perms = get_effective_permissions_for_role(parent, visited)
        for p in parent_perms:
            if hasattr(p, "id") and p.id not in seen_perm_ids:
                perms.append(p)
                seen_perm_ids.add(p.id)
    return perms
# --- Group Management Service ---
from sqlalchemy.orm import selectinload
def list_groups(db: Session):
    # Eager load users and roles for each group to avoid N+1 queries
    groups = db.query(Group).options(
        selectinload(Group.users)
    ).all()
    result = []
    for g in groups:
        # Defensive: if g is a tuple, get the first element
        if isinstance(g, tuple):
            g = g[0]
        # Users
        user_objs = []
        for u in (getattr(g, 'users', []) or []):
            if isinstance(u, tuple):
                u = u[0]
            # Defensive: skip if not a User object
            if not hasattr(u, 'id') or not hasattr(u, 'email'):
                continue
            user_objs.append({"id": u.id, "email": u.email})
        # Roles
        group_roles = db.query(GroupRole).filter(GroupRole.group_id == g.id).all()
        role_ids = [gr.role_id for gr in group_roles]
        roles = db.query(Role).filter(Role.id.in_(role_ids)).all() if role_ids else []
        role_objs = [{"id": r.id, "name": r.name, "description": r.description} for r in roles]
        result.append({
            "id": g.id,
            "name": g.name,
            "description": g.description,
            "users": user_objs,
            "roles": role_objs
        })
    return result

def create_group(db: Session, name: str, description: str = None):
    group = Group(name=name, description=description)
    db.add(group)
    db.commit()
    db.refresh(group)
    db.add(RbacAuditLog(
        action="create_group",
        performed_by="system",  # Replace with current user
        target_user=None,
        resource_type="group",
        resource_id=str(group.id),
        role=None,
        status="success",
        note=f"Group '{name}' created"
    ))
    db.commit()
    return group

def add_user_to_group(db: Session, user_id: int, group_id: int):
    # Prevent duplicate
    exists = db.query(UserGroup).filter_by(user_id=user_id, group_id=group_id).first()
    if exists:
        return exists
    ug = UserGroup(user_id=user_id, group_id=group_id)
    db.add(ug)
    db.commit()
    return ug

def remove_user_from_group(db: Session, user_id: int, group_id: int):
    ug = db.query(UserGroup).filter(UserGroup.user_id == user_id, UserGroup.group_id == group_id).first()
    if ug:
        db.delete(ug)
        db.commit()
    return ug

def assign_role_to_group(db: Session, group_id: int, role_id: int, resource_type: str = None, resource_id: str = None):
    # Prevent duplicate
    exists = db.query(GroupRole).filter_by(group_id=group_id, role_id=role_id, resource_type=resource_type, resource_id=resource_id).first()
    if exists:
        return exists
    gr = GroupRole(group_id=group_id, role_id=role_id, resource_type=resource_type, resource_id=resource_id)
    db.add(gr)
    db.commit()
    db.refresh(gr)
    return gr

def remove_role_from_group(db: Session, group_id: int, role_id: int):
    gr = db.query(GroupRole).filter(GroupRole.group_id == group_id, GroupRole.role_id == role_id).first()
    if gr:
        db.delete(gr)
        db.commit()
    return gr

def list_group_members(db: Session, group_id: int):
    ugs = db.query(UserGroup).filter(UserGroup.group_id == group_id).all()
    user_ids = [ug.user_id for ug in ugs]
    return db.query(User).filter(User.id.in_(user_ids)).all()

def list_group_roles(db: Session, group_id: int):
    return db.query(GroupRole).filter(GroupRole.group_id == group_id).all()

# --- Deny Assignment Service ---
def list_deny_assignments(db: Session, user_id=None, group_id=None, resource=None, action=None):
    q = db.query(DenyAssignment)
    if user_id:
        q = q.filter(DenyAssignment.user_id == user_id)
    if group_id:
        q = q.filter(DenyAssignment.group_id == group_id)
    if resource:
        q = q.filter(DenyAssignment.resource == resource)
    if action:
        q = q.filter(DenyAssignment.action == action)
    return q.all()

def create_deny_assignment(db: Session, user_id=None, group_id=None, action=None, resource=None, conditions=None):
    uid = int(user_id) if user_id not in (None, '', 'null') else None
    gid = int(group_id) if group_id not in (None, '', 'null') else None
    if uid and gid:
        gid = None  # Only one of user_id or group_id should be set
    deny = DenyAssignment(user_id=uid, group_id=gid, action=action, resource=resource, conditions=conditions)
    db.add(deny)
    db.commit()
    db.refresh(deny)
    return deny

def delete_deny_assignment(db: Session, deny_id: int):
    deny = db.query(DenyAssignment).filter(DenyAssignment.id == deny_id).first()
    if deny:
        db.delete(deny)
        db.commit()
    return deny

# --- Role Management Service ---
from sqlalchemy.orm import selectinload
def list_users(db: Session) -> List[User]:
    # Always eagerly load roles and groups to ensure user.roles and user.groups are loaded efficiently
    return db.query(User).options(selectinload(User.roles), selectinload(User.groups)).all()
# --- Role Inheritance Cycle Prevention ---
def can_assign_parent_role(db: Session, child_role_id: int, parent_role_id: int) -> bool:
    """
    Returns True if assigning parent_role_id as a parent to child_role_id would NOT create a cycle.
    Returns False if a cycle would be created.
    """
    # Traverse up from parent_role_id, ensure child_role_id is not in the ancestor chain
    visited = set()
    def visit(role_id):
        if role_id in visited:
            return False
        visited.add(role_id)
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            return True
        for parent in getattr(role, 'parents', []) or []:
            if hasattr(parent, 'id') and parent.id == child_role_id:
                return False
            if hasattr(parent, 'id') and not visit(parent.id):
                return False
        return True
    return visit(parent_role_id)

def get_user_role(db: Session, email: str) -> Optional[str]:
    user = db.query(User).filter(User.email == email).first()
    return user.role if user else None

def set_user_role(db: Session, email: str, new_role: str, changed_by: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    old_role = user.role
    user.role = new_role
    db.commit()
    db.refresh(user)
    # Audit log (use real audit table)
    log_rbac_action(
        db=db,
        action="set_user_role",
        performed_by=changed_by,
        target_user=email,
        role=new_role,
        status="success",
        note=f"Role changed from {old_role} to {new_role} for {email} by {changed_by}",
        before_state={"role": old_role},
        after_state={"role": new_role}
    )
    return user

def create_role(db: Session, name: str, description: str = None):
    # Always set description, even if None, to avoid SQLModel/ORM default issues
    role = Role(name=name, description=description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

# --- Permission Management Service ---
def list_permissions(db: Session) -> List[Permission]:
    return db.query(Permission).all()

def create_permission(db: Session, action: str, resource: str, conditions: Optional[str] = None) -> Permission:
    perm = Permission(action=action, resource=resource, conditions=conditions)
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return perm

def assign_permission_to_role(db: Session, role_id: int, permission_id: int):
    # Prevent duplicate assignment
    existing = db.query(RolePermission).filter_by(role_id=role_id, permission_id=permission_id).first()
    if existing:
        return existing
    rp = RolePermission(role_id=role_id, permission_id=permission_id)
    db.add(rp)
    db.commit()
    return rp

def remove_permission_from_role(db: Session, role_id: int, permission_id: int):
    db.query(RolePermission).filter(RolePermission.role_id == role_id, RolePermission.permission_id == permission_id).delete()
    db.commit()

def get_user_permissions(db: Session, user: User) -> List[Permission]:
    perms = set()
    roles = getattr(user, "roles", [])
    if roles is None:
        roles = []
    # Defensive: filter out tuples and only use Role objects
    for role in roles:
        if hasattr(role, "id") and hasattr(role, "name"):
            perms.update(get_effective_permissions_for_role(role))
    return list(perms)

def user_has_permission(db: Session, user: User, action: str, resource: str, conditions: Optional[dict] = None) -> bool:
    import fnmatch
    import json
    import re
    # --- DENY CHECK ---
    from app.models.auth_models import DenyAssignment, UserGroup
    # Check direct user denies
    deny_q = db.query(DenyAssignment).filter(
        DenyAssignment.user_id == user.id,
        DenyAssignment.action == action,
        DenyAssignment.resource == resource
    )
    for deny in deny_q:
        if not deny.conditions:
            return False
        try:
            cond = json.loads(deny.conditions)
            if not conditions:
                continue
            match = all(conditions.get(k) == v for k, v in cond.items())
            if match:
                return False
        except Exception:
            continue
    # Check group denies
    user_group_ids = [ug.group_id for ug in db.query(UserGroup).filter(UserGroup.user_id == user.id)]
    if user_group_ids:
        group_denies = db.query(DenyAssignment).filter(
            DenyAssignment.group_id.in_(user_group_ids),
            DenyAssignment.action == action,
            DenyAssignment.resource == resource
        )
        for deny in group_denies:
            if not deny.conditions:
                return False
            try:
                cond = json.loads(deny.conditions)
                if not conditions:
                    continue
                match = all(conditions.get(k) == v for k, v in cond.items())
                if match:
                    return False
            except Exception:
                continue
    # --- ALLOW CHECK (existing logic, extensible for OPA or custom policy engines) ---
    perms = get_user_permissions(db, user)
    for perm in perms:
        if perm.action == action and perm.resource == resource:
            if not perm.conditions:
                return True
            try:
                cond = json.loads(perm.conditions)
                if not conditions:
                    continue
                # --- EXTENSION POINT: Integrate with OPA or other policy engine here ---
                # Example: if opa_client.evaluate(cond, conditions, user): return True
                # For now, use built-in evaluator:
                match = True
                for k, v in cond.items():
                    val = conditions.get(k)
                    # Wildcard support
                    if isinstance(v, str) and ('*' in v or '?' in v):
                        if not (isinstance(val, str) and fnmatch.fnmatch(val, v)):
                            match = False
                            break
                    # List support
                    elif isinstance(v, list):
                        if val not in v:
                            match = False
                            break
                    # Custom evaluator: dict with $op
                    elif isinstance(v, dict) and "$op" in v:
                        op = v["$op"]
                        operand = v.get("value")
                        if op == "in":
                            if val not in operand:
                                match = False
                                break
                        elif op == "not_in":
                            if val in operand:
                                match = False
                                break
                        elif op == "eq":
                            if val != operand:
                                match = False
                                break
                        elif op == "ne":
                            if val == operand:
                                match = False
                                break
                        elif op == "regex":
                            if not (isinstance(val, str) and re.match(operand, val)):
                                match = False
                                break
                        elif op == "gt":
                            if not (isinstance(val, (int, float)) and val > operand):
                                match = False
                                break
                        elif op == "gte":
                            if not (isinstance(val, (int, float)) and val >= operand):
                                match = False
                                break
                        elif op == "lt":
                            if not (isinstance(val, (int, float)) and val < operand):
                                match = False
                                break
                        elif op == "lte":
                            if not (isinstance(val, (int, float)) and val <= operand):
                                match = False
                                break
                        elif op == "user_attr":
                            # Check user attribute (e.g., department, region)
                            user_val = getattr(user, operand, None)
                            if user_val != val:
                                match = False
                                break
                        # Add more custom ops as needed
                        else:
                            match = False
                            break
                    else:
                        if val != v:
                            match = False
                            break
                if match:
                    return True
            except Exception:
                continue
    return False

def delete_permission(db: Session, permission_id: int) -> bool:
    perm = db.query(Permission).filter(Permission.id == permission_id).first()
    if not perm:
        return False
    db.delete(perm)
    db.commit()
    return True

def update_permission(db: Session, permission_id: int, action: Optional[str] = None, resource: Optional[str] = None, conditions: Optional[str] = None) -> Optional[Permission]:
    perm = db.query(Permission).filter(Permission.id == permission_id).first()
    if not perm:
        return None
    if action is not None:
        perm.action = action
    if resource is not None:
        perm.resource = resource
    if conditions is not None:
        perm.conditions = conditions
    db.commit()
    db.refresh(perm)
    return perm

# --- Advanced RBAC Service Functions ---

def assign_resource_role(db: Session, user_id: int, role_id: int, resource_type: str, resource_id: str, performed_by: str):
    rr = ResourceRole(user_id=user_id, role_id=role_id, resource_type=resource_type, resource_id=resource_id)
    db.add(rr)
    db.add(RbacAuditLog(
        action="assign_resource_role",
        performed_by=performed_by,
        target_user=str(user_id),
        resource_type=resource_type,
        resource_id=resource_id,
        role=str(role_id),
        status="success",
        note=f"Assigned role {role_id} to user {user_id} for {resource_type}:{resource_id}"
    ))
    db.commit()
    db.refresh(rr)
    return rr

def list_resource_roles(db: Session, user_id: Optional[int] = None, resource_type: Optional[str] = None, resource_id: Optional[str] = None):
    q = db.query(ResourceRole)
    if user_id:
        q = q.filter(ResourceRole.user_id == user_id)
    if resource_type:
        q = q.filter(ResourceRole.resource_type == resource_type)
    if resource_id:
        q = q.filter(ResourceRole.resource_id == resource_id)
    return q.all()

def create_access_request(db: Session, user_id: int, resource_type: str, resource_id: str, requested_role: str, justification: str):
    req = AccessRequest(
        user_id=user_id,
        resource_type=resource_type,
        resource_id=resource_id,
        requested_role=requested_role,
        justification=justification,
        status="pending"
    )
    db.add(req)
    db.add(RbacAuditLog(
        action="request_access",
        performed_by=str(user_id),
        resource_type=resource_type,
        resource_id=resource_id,
        role=requested_role,
        status="pending",
        note=justification
    ))
    db.commit()
    db.refresh(req)
    # Notify admins
    subject = f"[RBAC] New Access Request #{req.id}"
    body = f"User {user_id} requested role '{requested_role}' on {resource_type}:{resource_id}\nJustification: {justification}"
    notify_admins(subject, body)
    return req

def review_access_request(db: Session, request_id: int, approve: bool, reviewer: str, review_note: Optional[str] = None):
    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not req:
        return None
    req.status = "approved" if approve else "rejected"
    req.reviewed_by = reviewer
    req.reviewed_at = datetime.utcnow()
    req.review_note = review_note
    db.add(RbacAuditLog(
        action="review_access_request",
        performed_by=reviewer,
        target_user=str(req.user_id),
        resource_type=req.resource_type,
        resource_id=req.resource_id,
        role=req.requested_role,
        status=req.status,
        note=review_note
    ))
    db.commit()
    db.refresh(req)
    # Notify user
    subject = f"[RBAC] Access Request #{req.id} {req.status.title()}"
    body = f"Your access request for role '{req.requested_role}' on {req.resource_type}:{req.resource_id} was {req.status}.\nReview note: {review_note or ''}"
    # In real system, fetch user email from db
    user_email = getattr(req, 'user_email', None) or 'user@example.com'
    notify_user(user_email, subject, body)
    notify_admins(f"Access request #{req.id} reviewed", f"Access request #{req.id} for user {req.user_id} was {req.status} by {reviewer}.")
    return req

def log_rbac_action(
    db: Session,
    action: str,
    performed_by: str,
    target_user: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    note: Optional[str] = None,
    before_state: Optional[dict] = None,
    after_state: Optional[dict] = None,
    correlation_id: Optional[str] = None,
    actor_ip: Optional[str] = None,
    actor_user_agent: Optional[str] = None,
):
    """
    Advanced audit log for RBAC actions, with before/after state, correlation, and actor context.
    """
    import json
    log = RbacAuditLog(
        action=action,
        performed_by=performed_by,
        target_user=target_user,
        resource_type=resource_type,
        resource_id=resource_id,
        role=role,
        status=status,
        note=note,
        before_state=json.dumps(before_state) if before_state else None,
        after_state=json.dumps(after_state) if after_state else None,
        correlation_id=correlation_id,
        actor_ip=actor_ip,
        actor_user_agent=actor_user_agent
    )
    db.add(log)
    db.commit()
    return log

def list_rbac_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RbacAuditLog).order_by(RbacAuditLog.timestamp.desc()).offset(skip).limit(limit).all()

def get_entity_audit_history(db: Session, entity_type: str, entity_id: str, skip: int = 0, limit: int = 100):
    """
    Fetch audit log entries for a specific entity (user, group, role, permission, resource, etc.)
    Args:
        db: SQLAlchemy session
        entity_type: Type of entity (e.g., 'user', 'role', 'group', 'permission', 'resource')
        entity_id: ID of the entity (as string)
        skip: Offset for pagination
        limit: Max number of results
    Returns:
        List of RbacAuditLog entries for the entity, ordered by timestamp descending
    """
    return db.query(RbacAuditLog)\
        .filter(RbacAuditLog.entity_type == entity_type, RbacAuditLog.entity_id == entity_id)\
        .order_by(RbacAuditLog.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()




# --- Bulk Operations for Roles and Permissions ---
def bulk_assign_role_to_users(db: Session, user_ids: list[int], role_id: int):
    """Assign a role to multiple users efficiently."""
    from app.models.auth_models import UserRole
    for user_id in user_ids:
        exists = db.query(UserRole).filter_by(user_id=user_id, role_id=role_id).first()
        if not exists:
            db.add(UserRole(user_id=user_id, role_id=role_id))
    db.commit()

def bulk_remove_role_from_users(db: Session, user_ids: list[int], role_id: int):
    """Remove a role from multiple users efficiently."""
    from app.models.auth_models import UserRole
    db.query(UserRole).filter(UserRole.user_id.in_(user_ids), UserRole.role_id == role_id).delete(synchronize_session=False)
    db.commit()

def bulk_assign_permission_to_roles(db: Session, role_ids: list[int], permission_id: int):
    """Assign a permission to multiple roles efficiently."""
    from app.models.auth_models import RolePermission
    for role_id in role_ids:
        exists = db.query(RolePermission).filter_by(role_id=role_id, permission_id=permission_id).first()
        if not exists:
            db.add(RolePermission(role_id=role_id, permission_id=permission_id))
    db.commit()

def bulk_remove_permission_from_roles(db: Session, role_ids: list[int], permission_id: int):
    """Remove a permission from multiple roles efficiently."""
    from app.models.auth_models import RolePermission
    db.query(RolePermission).filter(RolePermission.role_id.in_(role_ids), RolePermission.permission_id == permission_id).delete(synchronize_session=False)
    db.commit()



def get_selected_roles_permissions(db: Session, role_ids: list[int]) -> list[dict]:
    """
    Return all permissions for each role in role_ids, including inherited permissions.
    Returns a list of dicts: [{role_id, permissions: [Permission dicts]}]
    """
    from app.models.auth_models import Role, Permission
    result = []
    for role_id in role_ids:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            result.append({"role_id": role_id, "permissions": []})
            continue
        perms = get_effective_permissions_for_role(role)
        perms_list = []
        for p in perms:
            perms_list.append({
                "id": p.id,
                "action": p.action,
                "resource": p.resource,
                "conditions": p.conditions,
            })
        result.append({"role_id": role_id, "permissions": perms_list})
    return result