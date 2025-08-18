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
        # Evaluate enterprise ABAC conditions with advanced pattern matching
        from ..services.advanced_analytics_service import AdvancedAnalyticsService
        from ..models.auth_models import User, UserProfile, Organization
        
        analytics_service = AdvancedAnalyticsService()
        
        # Get user context for advanced condition evaluation
        user_context = await self._get_user_context(user)
        
        # Advanced condition evaluation patterns
        if "user_id" in cond_obj and cond_obj["user_id"] == ":current_user_id":
            if getattr(user, "id", None) == user_id:
                return True, None
            else:
                return False, "User ID does not match (:current_user_id)"
        
        if "department" in cond_obj and cond_obj["department"] == ":user_department":
            user_dept = user_context.get('department')
            if user_dept and user_dept == cond_obj.get('department_value'):
                return True, None
            else:
                return False, f"User department '{user_dept}' does not match required department"
        
        if "region" in cond_obj and cond_obj["region"] == ":user_region":
            user_region = user_context.get('region')
            if user_region and user_region == cond_obj.get('region_value'):
                return True, None
            else:
                return False, f"User region '{user_region}' does not match required region"
        
        if "role_level" in cond_obj:
            user_role_level = user_context.get('role_level', 0)
            required_level = cond_obj.get('role_level', 0)
            if user_role_level >= required_level:
                return True, None
            else:
                return False, f"User role level {user_role_level} insufficient for required level {required_level}"
        
        if "time_based" in cond_obj:
            time_condition = cond_obj.get('time_based', {})
            current_time = datetime.utcnow()
            if self._evaluate_time_condition(current_time, time_condition):
                return True, None
            else:
                return False, "Time-based condition not met"
        
        if "resource_ownership" in cond_obj:
            resource_id = cond_obj.get('resource_id')
            if self._check_resource_ownership(user, resource_id):
                return True, None
            else:
                return False, "User does not own the specified resource"
        
        # Advanced ML-based condition evaluation
        if "ml_risk_score" in cond_obj:
            risk_score = await analytics_service.calculate_user_risk_score(user.id)
            max_risk = cond_obj.get('max_risk_score', 0.5)
            if risk_score <= max_risk:
                return True, None
            else:
                return False, f"User risk score {risk_score} exceeds maximum {max_risk}"
        
        # Default: cannot evaluate, mark as not effective
        return False, "Advanced condition not matched or not evaluable"

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

    async def _get_user_context(self, user) -> Dict[str, Any]:
        """Get comprehensive user context for ABAC evaluation"""
        try:
            from ..models.auth_models import UserProfile, Organization
            
            user_context = {
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'role_level': 0,
                'department': None,
                'region': None,
                'organization': None
            }
            
            # Get user profile information
            profile = self.db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
            if profile:
                user_context.update({
                    'department': profile.department,
                    'region': profile.region,
                    'role_level': profile.role_level or 0
                })
            
            # Get organization information
            if hasattr(user, 'organization_id') and user.organization_id:
                org = self.db.query(Organization).filter(Organization.id == user.organization_id).first()
                if org:
                    user_context['organization'] = org.name
            
            return user_context
            
        except Exception as e:
            logger.warning(f"Error getting user context: {e}")
            return {'user_id': user.id, 'role_level': 0}
    
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
            # This would check various resource ownership patterns
            # For now, implement basic ownership check
            if hasattr(user, 'id') and resource_id:
                # Check if resource belongs to user
                return str(user.id) in resource_id or resource_id.startswith(f"user_{user.id}")
            return False
            
        except Exception as e:
            logger.warning(f"Error checking resource ownership: {e}")
            return False
