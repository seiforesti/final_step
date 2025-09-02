from sqlalchemy.orm import Session
from app.models.auth_models import User, Role, Group, UserRole, GroupRole, RoleInheritance, Permission, RolePermission
from typing import List, Dict, Any, Set, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

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

    service = RBACService(db)

    def check_condition(perm, user):
        cond = getattr(perm, "conditions", None)
        if not cond:
            return True, None  # No condition, always effective
        try:
            cond_obj = json.loads(cond) if isinstance(cond, str) else cond
        except Exception:
            return False, "Invalid condition format"

        # Build user context once
        user_context = service._get_user_context(user)

        # Placeholder-based checks that depend only on user context
        # Owner check
        if cond_obj.get("user_id") == ":current_user_id":
            return getattr(user, "id", None) == user_id, None if getattr(user, "id", None) == user_id else "User ID mismatch"

        # Department placeholder means resource.department must match user's department.
        # Without resource context here, we can only assert that user has a department set.
        if cond_obj.get("department") == ":user_department":
            return user_context.get("department") is not None, None if user_context.get("department") else "User department unknown"

        # Region placeholder
        if cond_obj.get("region") == ":user_region":
            return user_context.get("region") is not None, None if user_context.get("region") else "User region unknown"

        # Role level threshold
        if "role_level" in cond_obj:
            user_role_level = user_context.get("role_level", 0)
            required_level = int(cond_obj.get("role_level", 0))
            return (user_role_level >= required_level), (
                None if user_role_level >= required_level else f"User role level {user_role_level} < required {required_level}"
            )

        # Time-based window
        if "time_based" in cond_obj:
            current_time = datetime.utcnow()
            ok = service._evaluate_time_condition(current_time, cond_obj.get("time_based", {}))
            return ok, None if ok else "Outside allowed time window"

        # Resource ownership requires target context; treat as indeterminate in listing
        if "resource_ownership" in cond_obj:
            return True, None  # Defer to enforcement where resource_id is available

        # Optional ML risk check if available
        if "ml_risk_score" in cond_obj:
            try:
                from ..services.advanced_analytics_service import AdvancedAnalyticsService  # type: ignore
                analytics_service = AdvancedAnalyticsService()
                risk_score = getattr(analytics_service, "calculate_user_risk_score", lambda _id: 0.0)(user.id)
                max_risk = float(cond_obj.get("max_risk_score", 0.5))
                return (risk_score <= max_risk), (
                    None if risk_score <= max_risk else f"Risk {risk_score} > max {max_risk}"
                )
            except Exception:
                # If risk cannot be computed, be conservative and mark as not effective
                return False, "Unable to compute ML risk score"

        # Unknown condition keys: conservatively mark as not effective
        return False, "Condition not evaluable without full context"

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


class RBACService:
    """Enterprise RBAC service facade used across Racine orchestration and routes."""

    def __init__(self, db_session: Session):
        self.db = db_session

    def get_user_effective_permissions(self, user_id: int) -> List[Dict[str, Any]]:
        return get_user_effective_permissions_rbac(self.db, user_id)

    def check_permission(self, user_id: int, action: str, resource: str) -> Dict[str, Any]:
        try:
            permissions = self.get_user_effective_permissions(user_id)
            for perm in permissions:
                if perm["action"] == action and perm["resource"] == resource and perm["is_effective"]:
                    return {"allowed": True, "permission": perm}
            return {"allowed": False, "reason": "No matching effective permission"}
        except Exception as e:
            logger.error(f"RBAC permission check error: {e}")
            return {"allowed": False, "error": str(e)}

    def assign_role(self, user_id: int, role_id: int) -> bool:
        try:
            # Create UserRole record if does not exist
            existing = self.db.query(UserRole).filter(UserRole.user_id == user_id, UserRole.role_id == role_id).first()
            if existing:
                return True
            new_ur = UserRole(user_id=user_id, role_id=role_id)
            self.db.add(new_ur)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"RBAC assign_role failed: {e}")
            return False

    def get_health_status(self) -> Dict[str, Any]:
        try:
            users = self.db.query(User).count()
            roles = self.db.query(Role).count()
            permissions = self.db.query(Permission).count()
            return {"status": "healthy", "users": users, "roles": roles, "permissions": permissions}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _get_user_context(self, user) -> Dict[str, Any]:
        """Get comprehensive user context for ABAC evaluation (synchronous)."""
        try:
            from ..models.auth_models import UserProfile, Organization

            user_context = {
                'user_id': getattr(user, 'id', None),
                'username': getattr(user, 'username', None),
                'email': getattr(user, 'email', None),
                'role_level': 0,
                'department': None,
                'region': None,
                'organization': None
            }

            # Get user profile information
            profile = self.db.query(UserProfile).filter(UserProfile.user_id == getattr(user, 'id', None)).first()
            if profile:
                user_context.update({
                    'department': getattr(profile, 'department', None),
                    'region': getattr(profile, 'region', None),
                    'role_level': getattr(profile, 'role_level', 0) or 0
                })

            # Get organization information
            if hasattr(user, 'organization_id') and getattr(user, 'organization_id', None):
                org = self.db.query(Organization).filter(Organization.id == user.organization_id).first()
                if org:
                    user_context['organization'] = getattr(org, 'name', None)

            return user_context

        except Exception as e:
            logger.warning(f"Error getting user context: {e}")
            return {'user_id': getattr(user, 'id', None), 'role_level': 0}
    
    def _evaluate_time_condition(self, current_time: datetime, time_condition: Dict[str, Any]) -> bool:
        """Evaluate time-based ABAC conditions"""
        try:
            start_time = time_condition.get('start_time')
            end_time = time_condition.get('end_time')
            days_of_week = time_condition.get('days_of_week', [])
            
            # Check time range
            if start_time and end_time:
                start_hour, start_minute = map(int, start_time.split(':'))
                end_hour, end_minute = map(int, end_time.split(':'))
                
                current_hour = current_time.hour
                current_minute = current_time.minute
                current_minutes = current_hour * 60 + current_minute
                start_minutes = start_hour * 60 + start_minute
                end_minutes = end_hour * 60 + end_minute
                
                if not (start_minutes <= current_minutes <= end_minutes):
                    return False
            
            # Check days of week
            if days_of_week:
                current_day = current_time.weekday()
                if current_day not in days_of_week:
                    return False
            
            return True
            
        except Exception as e:
            logger.warning(f"Error evaluating time condition: {e}")
            return False
    
    def _check_resource_ownership(self, user, resource_id: str) -> bool:
        """Check if user owns the specified resource"""
        try:
            if not getattr(user, 'id', None) or not resource_id:
                return False

            # Admins own all resources
            try:
                from app.models.auth_models import Role, UserRole
                admin_role = self.db.query(Role).filter(Role.name.in_(["admin", "superadmin"]))
                admin_ids = [ur.user_id for ur in self.db.query(UserRole).filter(UserRole.role_id.in_([r.id for r in admin_role])).all()]
                if user.id in admin_ids:
                    return True
            except Exception:
                pass

            # Parse resource identifier pattern: type:id
            parts = resource_id.split(":", 1)
            resource_type = parts[0] if len(parts) == 2 else "generic"
            resource_key = parts[1] if len(parts) == 2 else resource_id

            # Direct ownership mapping table
            try:
                from app.models.ownership_models import ResourceOwnership  # optional
                ro = self.db.query(ResourceOwnership).filter(
                    ResourceOwnership.resource_type == resource_type,
                    ResourceOwnership.resource_id == resource_key,
                    ResourceOwnership.user_id == user.id,
                ).first()
                if ro:
                    return True
            except Exception:
                pass

            # Check common domain objects
            try:
                if resource_type in ("datasource", "data_source", "ds"):
                    from app.models.data_source_models import DataSource
                    ds = self.db.query(DataSource).filter((DataSource.id == resource_key) | (DataSource.external_id == resource_key)).first()
                    if ds and (getattr(ds, "owner_user_id", None) == user.id or getattr(ds, "created_by", None) == user.id):
                        return True
                elif resource_type in ("asset", "catalog_asset"):
                    from app.models.catalog_models import CatalogAsset as _Asset
                    a = self.db.query(_Asset).filter((_Asset.id == resource_key) | (_Asset.logical_id == resource_key)).first()
                    if a and (getattr(a, "owner_user_id", None) == user.id or getattr(a, "created_by", None) == user.id):
                        return True
                elif resource_type in ("workspace", "ws"):
                    from app.models.catalog_collaboration_models import CollaborationWorkspace, CatalogWorkspaceMember
                    ws = self.db.query(CollaborationWorkspace).filter((CollaborationWorkspace.id == resource_key) | (CollaborationWorkspace.code == resource_key)).first()
                    if ws and (getattr(ws, "owner_user_id", None) == user.id or getattr(ws, "created_by", None) == user.id):
                        return True
                    # Member ownership if write/admin
                    if ws:
                        membership = self.db.query(CatalogWorkspaceMember).filter(
                            CatalogWorkspaceMember.workspace_id == ws.id,
                            CatalogWorkspaceMember.user_id == user.id,
                        ).first()
                        if membership and getattr(membership, "role", "member") in ("owner", "admin", "editor"):
                            return True
                elif resource_type in ("review", "asset_review"):
                    from app.models.catalog_collaboration_models import AssetReview
                    rev = self.db.query(AssetReview).filter(AssetReview.id == resource_key).first()
                    if rev and (getattr(rev, "requester_id", None) == str(user.id) or getattr(rev, "reviewer_id", None) == user.id):
                        return True
                elif resource_type in ("annotation", "note"):
                    from app.models.catalog_collaboration_models import DataAnnotation
                    ann = self.db.query(DataAnnotation).filter(DataAnnotation.id == resource_key).first()
                    if ann and getattr(ann, "author_id", None) == str(user.id):
                        return True
                elif resource_type in ("ml_model", "model"):
                    from app.models.ml_models import MLModelConfiguration
                    mm = self.db.query(MLModelConfiguration).filter((MLModelConfiguration.id == resource_key) | (MLModelConfiguration.name == resource_key)).first()
                    if mm and (getattr(mm, "owner_user_id", None) == user.id or getattr(mm, "created_by", None) == user.id):
                        return True
            except Exception:
                pass

            # Heuristic fallback: resource string contains user id
            if str(user.id) in resource_id or resource_id.startswith(f"user_{user.id}"):
                return True
            return False
            
        except Exception as e:
            logger.warning(f"Error checking resource ownership: {e}")
            return False

    def log_rbac_action(self, action: str, performed_by: str, target_user: str = None, 
                       resource_type: str = None, resource_id: str = None, role: str = None, 
                       status: str = "success", note: str = None, **kwargs):
        """Log RBAC actions for audit purposes"""
        try:
            from app.models.auth_models import RbacAuditLog
            
            audit_log = RbacAuditLog(
                action=action,
                performed_by=performed_by,
                target_user=target_user,
                resource_type=resource_type,
                resource_id=resource_id,
                role=role,
                status=status,
                note=note,
                timestamp=datetime.utcnow(),
                entity_type=kwargs.get('entity_type'),
                entity_id=kwargs.get('entity_id'),
                before_state=kwargs.get('before_state'),
                after_state=kwargs.get('after_state'),
                correlation_id=kwargs.get('correlation_id'),
                actor_ip=kwargs.get('actor_ip'),
                actor_device=kwargs.get('actor_device'),
                api_client=kwargs.get('api_client'),
                extra_metadata=kwargs.get('extra_metadata')
            )
            
            self.db.add(audit_log)
            self.db.commit()
            logger.info(f"RBAC action logged: {action} by {performed_by} - {status}")
            
        except Exception as e:
            logger.error(f"Failed to log RBAC action: {e}")
            # Don't fail the main operation if logging fails
