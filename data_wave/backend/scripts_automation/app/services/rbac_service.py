from sqlalchemy.orm import Session
from app.models.auth_models import User, Role, Group, UserRole, GroupRole, RoleInheritance, Permission, RolePermission
from typing import List, Dict, Any, Set

def get_user_effective_permissions_rbac(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """
    Returns all effective permissions for a user, including direct, group, and inherited roles.
    This is the single source of truth for effective permissions logic.
    """
    # 1. Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    # 2. Get direct role IDs
    direct_role_ids = [r.id for r in db.query(Role).join(UserRole, UserRole.role_id == Role.id).filter(UserRole.user_id == user_id).all()]

    # 3. Get group role IDs
    # Use ORM relationship for join
    group_ids = [g.id for g in db.query(Group).join(Group.users).filter(User.id == user_id).all()]
    group_role_ids = [gr.role_id for gr in db.query(GroupRole).filter(GroupRole.group_id.in_(group_ids)).all()] if group_ids else []

    # 4. Aggregate all role IDs
    all_role_ids = set(direct_role_ids + group_role_ids)

    # 5. Recursively collect inherited roles
    def collect_inherited_roles(role_id: int, visited: Set[int]) -> Set[int]:
        if role_id in visited:
            return set()
        visited.add(role_id)
        inherited = {role_id}
        for inh in db.query(RoleInheritance).filter(RoleInheritance.child_role_id == role_id).all():
            inherited |= collect_inherited_roles(inh.parent_role_id, visited)
        return inherited

    effective_role_ids = set()
    for rid in all_role_ids:
        effective_role_ids |= collect_inherited_roles(rid, set())

    if not effective_role_ids:
        return []

    # 6. Get all permissions for effective roles
    perms = db.query(Permission).join(RolePermission, Permission.id == RolePermission.permission_id)
    perms = perms.filter(RolePermission.role_id.in_(effective_role_ids)).distinct(Permission.id).all()

    # 7. Format output with ABAC/condition evaluation
    import json
    result = []
    def check_condition(perm, user):
        cond = getattr(perm, "conditions", None)
        if not cond:
            return True, None  # No condition, always effective
        try:
            if isinstance(cond, str):
                cond_obj = json.loads(cond)
            else:
                cond_obj = cond
        except Exception:
            return False, "Invalid condition format"
        # Evaluate common ABAC patterns
        # Only basic patterns supported here; expand as needed
        if "user_id" in cond_obj and cond_obj["user_id"] == ":current_user_id":
            if getattr(user, "id", None) == user_id:
                return True, None
            else:
                return False, "User ID does not match (:current_user_id)"
        if "department" in cond_obj and cond_obj["department"] == ":user_department":
            if hasattr(user, "department") and getattr(user, "department", None):
                # If user has department, always effective (or add more logic)
                return True, None
            else:
                return False, "User has no department"
        if "region" in cond_obj and cond_obj["region"] == ":user_region":
            if hasattr(user, "region") and getattr(user, "region", None):
                return True, None
            else:
                return False, "User has no region"
        # Add more ABAC patterns as needed
        # Default: cannot evaluate, mark as not effective
        return False, "Condition not matched or not evaluable"

    for perm in perms:
        is_effective, note = check_condition(perm, user)
        result.append({
            "id": perm.id,
            "action": perm.action,
            "resource": perm.resource,
            "conditions": getattr(perm, "conditions", None),
            "is_effective": is_effective,
            "note": note if not is_effective else None
        })
    return result
