# Security module initialization
from app.services.role_service import  get_user_role
from app.api.security.rbac import get_current_user, check_permission, require_permission