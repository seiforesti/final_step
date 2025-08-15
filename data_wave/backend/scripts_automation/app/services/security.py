"""
Enterprise Security Integration

Production-ready security wrapper that integrates with the enterprise authentication service.
This replaces the previous mock implementation with real enterprise-grade security.
"""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from typing import Optional, List
import logging

from app.services.enterprise_auth_service import (
    enterprise_auth_service, 
    TokenValidationResult,
    AuthenticationResult
)
from app.models.rbac_models import User

logger = logging.getLogger(__name__)

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Get current authenticated user from JWT token.
    
    This is the main dependency for protected endpoints.
    """
    
    try:
        # Validate token using enterprise authentication service
        validation_result = await enterprise_auth_service.validate_token(token)
        
        if not validation_result.valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation_result.error or "Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not validation_result.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return validation_result.user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating user token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication service error",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_with_permissions(token: str = Depends(oauth2_scheme)) -> tuple[User, List[str]]:
    """
    Get current authenticated user along with their permissions.
    
    Returns a tuple of (user, permissions).
    """
    
    try:
        validation_result = await enterprise_auth_service.validate_token(token)
        
        if not validation_result.valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation_result.error or "Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = validation_result.user
        permissions = validation_result.permissions or []
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user, permissions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating user token with permissions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication service error",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_permission(required_permission: str):
    """
    Dependency factory for requiring specific permissions.
    
    Usage:
        @app.get("/admin/users")
        async def get_users(user: User = Depends(require_permission("admin"))):
            # This endpoint requires admin permission
    """
    
    async def permission_checker(
        user_and_permissions: tuple[User, List[str]] = Depends(get_current_user_with_permissions)
    ) -> User:
        user, permissions = user_and_permissions
        
        if required_permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {required_permission}"
            )
        
        return user
    
    return permission_checker

def require_any_permission(required_permissions: List[str]):
    """
    Dependency factory for requiring any one of the specified permissions.
    
    Usage:
        @app.get("/data")
        async def get_data(user: User = Depends(require_any_permission(["read", "admin"]))):
            # This endpoint requires either read or admin permission
    """
    
    async def permission_checker(
        user_and_permissions: tuple[User, List[str]] = Depends(get_current_user_with_permissions)
    ) -> User:
        user, permissions = user_and_permissions
        
        if not any(perm in permissions for perm in required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required one of: {', '.join(required_permissions)}"
            )
        
        return user
    
    return permission_checker

def require_all_permissions(required_permissions: List[str]):
    """
    Dependency factory for requiring all specified permissions.
    
    Usage:
        @app.delete("/system/data")
        async def delete_data(user: User = Depends(require_all_permissions(["admin", "delete"]))):
            # This endpoint requires both admin and delete permissions
    """
    
    async def permission_checker(
        user_and_permissions: tuple[User, List[str]] = Depends(get_current_user_with_permissions)
    ) -> User:
        user, permissions = user_and_permissions
        
        if not all(perm in permissions for perm in required_permissions):
            missing_perms = [perm for perm in required_permissions if perm not in permissions]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Missing: {', '.join(missing_perms)}"
            )
        
        return user
    
    return permission_checker

async def get_current_user_role(token: str = Depends(oauth2_scheme)) -> str:
    """
    Get current user's primary role.
    
    This is a backward-compatible function for existing code that expects role strings.
    """
    
    try:
        user, permissions = await get_current_user_with_permissions(token)
        
        # Determine primary role based on permissions
        if "admin" in permissions:
            return "admin"
        elif "write" in permissions:
            return "writer"
        elif "read" in permissions:
            return "reader"
        else:
            return "guest"
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication service error",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def check_permission(user: User, permission: str) -> bool:
    """
    Check if a user has a specific permission.
    
    This is a utility function for manual permission checking.
    """
    
    try:
        # This would typically be called with a validated user
        permissions = await enterprise_auth_service._get_user_permissions(user.id)
        return permission in permissions
        
    except Exception as e:
        logger.error(f"Error checking permission {permission} for user {user.id}: {str(e)}")
        return False

async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None.
    
    This is useful for endpoints that have optional authentication.
    """
    
    if not token:
        return None
    
    try:
        validation_result = await enterprise_auth_service.validate_token(token)
        return validation_result.user if validation_result.valid else None
        
    except Exception as e:
        logger.debug(f"Optional authentication failed: {str(e)}")
        return None

class SecurityContext:
    """
    Security context class for advanced security operations.
    """
    
    def __init__(self, user: User, permissions: List[str], token_claims: dict):
        self.user = user
        self.permissions = permissions
        self.token_claims = token_claims
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission"""
        return permission in self.permissions
    
    def has_any_permission(self, permissions: List[str]) -> bool:
        """Check if user has any of the specified permissions"""
        return any(perm in self.permissions for perm in permissions)
    
    def has_all_permissions(self, permissions: List[str]) -> bool:
        """Check if user has all specified permissions"""
        return all(perm in self.permissions for perm in permissions)
    
    def is_admin(self) -> bool:
        """Check if user is an administrator"""
        return "admin" in self.permissions or self.user.is_superuser
    
    def can_access_resource(self, resource_type: str, resource_id: Optional[str] = None) -> bool:
        """
        Check if user can access a specific resource.
        
        This can be extended with resource-specific logic.
        """
        # Basic implementation - can be extended
        if self.is_admin():
            return True
        
        # Add resource-specific logic here
        return f"access_{resource_type}" in self.permissions

async def get_security_context(token: str = Depends(oauth2_scheme)) -> SecurityContext:
    """
    Get complete security context for advanced security operations.
    """
    
    try:
        validation_result = await enterprise_auth_service.validate_token(token)
        
        if not validation_result.valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation_result.error or "Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return SecurityContext(
            user=validation_result.user,
            permissions=validation_result.permissions or [],
            token_claims=validation_result.token_claims or {}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating security context: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication service error",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Additional security utilities

async def extract_client_ip(request: Request) -> str:
    """Extract client IP address from request"""
    
    # Check for forwarded IP headers
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    
    # Fall back to client host
    return request.client.host if request.client else "unknown"

async def log_security_event(event_type: str, user: Optional[User], details: dict, request: Optional[Request] = None):
    """Log security events for audit purposes"""
    
    try:
        event_data = {
            "event_type": event_type,
            "user_id": user.id if user else None,
            "username": user.username if user else None,
            "details": details,
            "timestamp": enterprise_auth_service.datetime.now(enterprise_auth_service.timezone.utc).isoformat(),
            "ip_address": await extract_client_ip(request) if request else None
        }
        
        logger.info(f"Security event: {event_type}", extra=event_data)
        
    except Exception as e:
        logger.error(f"Error logging security event: {str(e)}")

# Backward compatibility aliases
get_current_user_role_legacy = get_current_user_role  # For legacy code
