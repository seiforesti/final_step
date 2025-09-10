from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.access_control_models import (
    DataSourcePermission, AccessLog,
    PermissionType, AccessLevel
)
from app.models.scan_models import DataSource
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class PermissionResponse(BaseModel):
    """Permission response model"""
    id: int
    data_source_id: int
    user_id: Optional[str]
    role_id: Optional[str]
    permission_type: PermissionType
    access_level: AccessLevel
    granted_by: str
    granted_at: datetime
    expires_at: Optional[datetime]
    conditions: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AccessLogResponse(BaseModel):
    """Access log response model"""
    id: int
    data_source_id: int
    user_id: str
    action: str
    resource: str
    result: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    metadata: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class PermissionCreate(BaseModel):
    """Permission creation model"""
    data_source_id: int
    user_id: Optional[str] = None
    role_id: Optional[str] = None
    permission_type: PermissionType
    access_level: AccessLevel
    expires_at: Optional[datetime] = None
    conditions: Dict[str, Any] = {}


class PermissionUpdate(BaseModel):
    """Permission update model"""
    permission_type: Optional[PermissionType] = None
    access_level: Optional[AccessLevel] = None
    expires_at: Optional[datetime] = None
    conditions: Optional[Dict[str, Any]] = None


class AccessStats(BaseModel):
    """Access statistics model"""
    total_permissions: int
    active_permissions: int
    expired_permissions: int
    user_permissions: int
    role_permissions: int
    total_access_attempts: int
    successful_access: int
    failed_access: int
    success_rate_percentage: float
    most_accessed_data_source: str
    recent_access_logs: List[AccessLogResponse]


class AccessControlService:
    """Service layer for access control management"""
    
    @staticmethod
    def get_permissions_by_data_source(session: Session, data_source_id: int) -> List[PermissionResponse]:
        """Get all permissions for a data source"""
        try:
            statement = select(DataSourcePermission).where(
                DataSourcePermission.data_source_id == data_source_id,
                (DataSourcePermission.expires_at.is_(None)) | 
                (DataSourcePermission.expires_at > datetime.now())
            )
            permissions = session.execute(statement).scalars().all()
            
            return [PermissionResponse.from_orm(permission) for permission in permissions]
        except Exception as e:
            logger.error(f"Error getting permissions for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_permission_by_id(session: Session, permission_id: int) -> Optional[PermissionResponse]:
        """Get permission by ID"""
        try:
            statement = select(DataSourcePermission).where(DataSourcePermission.id == permission_id)
            permission = session.execute(statement).scalars().first()
            
            if permission:
                return PermissionResponse.from_orm(permission)
            return None
        except Exception as e:
            logger.error(f"Error getting permission {permission_id}: {str(e)}")
            return None
    
    @staticmethod
    def get_user_permissions(session: Session, user_id: str, data_source_id: Optional[int] = None) -> List[PermissionResponse]:
        """Get permissions for a specific user"""
        try:
            query = select(DataSourcePermission).where(
                DataSourcePermission.user_id == user_id,
                (DataSourcePermission.expires_at.is_(None)) | 
                (DataSourcePermission.expires_at > datetime.now())
            )
            
            if data_source_id:
                query = query.where(DataSourcePermission.data_source_id == data_source_id)
            
            permissions = session.execute(query).scalars().all()
            return [PermissionResponse.from_orm(permission) for permission in permissions]
        except Exception as e:
            logger.error(f"Error getting permissions for user {user_id}: {str(e)}")
            return []
    
    @staticmethod
    def create_permission(session: Session, permission_data: PermissionCreate, granted_by: str) -> PermissionResponse:
        """Create a new permission"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, permission_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {permission_data.data_source_id} not found")
            
            # Verify either user_id or role_id is provided
            if not permission_data.user_id and not permission_data.role_id:
                raise ValueError("Either user_id or role_id must be provided")
            
            # Check for existing permission
            existing = AccessControlService._check_existing_permission(
                session, permission_data.data_source_id, 
                permission_data.user_id, permission_data.role_id
            )
            
            if existing:
                logger.warning(f"Permission already exists, updating instead")
                return AccessControlService._update_existing_permission(
                    session, existing, permission_data, granted_by
                )
            
            # Create new permission
            permission = DataSourcePermission(
                data_source_id=permission_data.data_source_id,
                user_id=permission_data.user_id,
                role_id=permission_data.role_id,
                permission_type=permission_data.permission_type,
                access_level=permission_data.access_level,
                granted_by=granted_by,
                expires_at=permission_data.expires_at,
                conditions=permission_data.conditions
            )
            
            session.add(permission)
            session.commit()
            session.refresh(permission)
            
            # Log the permission grant
            AccessControlService._log_access(
                session, permission_data.data_source_id, granted_by,
                "grant_permission", f"permission_{permission.id}", "success"
            )
            
            logger.info(f"Created permission {permission.id} granted by {granted_by}")
            return PermissionResponse.from_orm(permission)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating permission: {str(e)}")
            raise
    
    @staticmethod
    def update_permission(session: Session, permission_id: int, permission_data: PermissionUpdate, updated_by: str) -> Optional[PermissionResponse]:
        """Update an existing permission"""
        try:
            permission = session.get(DataSourcePermission, permission_id)
            if not permission:
                return None
            
            # Update fields
            if permission_data.permission_type is not None:
                permission.permission_type = permission_data.permission_type
            if permission_data.access_level is not None:
                permission.access_level = permission_data.access_level
            if permission_data.expires_at is not None:
                permission.expires_at = permission_data.expires_at
            if permission_data.conditions is not None:
                permission.conditions = permission_data.conditions
            
            permission.updated_at = datetime.now()
            
            session.add(permission)
            session.commit()
            session.refresh(permission)
            
            # Log the permission update
            AccessControlService._log_access(
                session, permission.data_source_id, updated_by,
                "update_permission", f"permission_{permission_id}", "success"
            )
            
            logger.info(f"Updated permission {permission_id} by {updated_by}")
            return PermissionResponse.from_orm(permission)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating permission {permission_id}: {str(e)}")
            raise
    
    @staticmethod
    def revoke_permission(session: Session, permission_id: int, revoked_by: str) -> bool:
        """Revoke a permission"""
        try:
            permission = session.get(DataSourcePermission, permission_id)
            if not permission:
                return False
            
            data_source_id = permission.data_source_id
            
            session.delete(permission)
            session.commit()
            
            # Log the permission revocation
            AccessControlService._log_access(
                session, data_source_id, revoked_by,
                "revoke_permission", f"permission_{permission_id}", "success"
            )
            
            logger.info(f"Revoked permission {permission_id} by {revoked_by}")
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error revoking permission {permission_id}: {str(e)}")
            return False
    
    @staticmethod
    def check_user_access(session: Session, user_id: str, data_source_id: int, required_permission: PermissionType) -> bool:
        """Check if user has required access to data source"""
        try:
            # Get user permissions
            statement = select(DataSourcePermission).where(
                DataSourcePermission.data_source_id == data_source_id,
                DataSourcePermission.user_id == user_id,
                DataSourcePermission.permission_type == required_permission,
                (DataSourcePermission.expires_at.is_(None)) | 
                (DataSourcePermission.expires_at > datetime.now())
            )
            
            permission = session.execute(statement).scalars().first()
            has_access = permission is not None
            
            # Log access attempt
            AccessControlService._log_access(
                session, data_source_id, user_id,
                "check_access", f"permission_{required_permission}",
                "success" if has_access else "denied"
            )
            
            return has_access
            
        except Exception as e:
            logger.error(f"Error checking user access: {str(e)}")
            # Log failed access check
            AccessControlService._log_access(
                session, data_source_id, user_id,
                "check_access", f"permission_{required_permission}", "error",
                metadata={"error": str(e)}
            )
            return False
    
    @staticmethod
    def get_access_logs(session: Session, data_source_id: int, limit: int = 100) -> List[AccessLogResponse]:
        """Get access logs for a data source"""
        try:
            statement = select(AccessLog).where(
                AccessLog.data_source_id == data_source_id
            ).order_by(AccessLog.created_at.desc()).limit(limit)
            
            logs = session.execute(statement).scalars().all()
            return [AccessLogResponse.from_orm(log) for log in logs]
        except Exception as e:
            logger.error(f"Error getting access logs: {str(e)}")
            return []
    
    @staticmethod
    def get_access_stats(session: Session, data_source_id: Optional[int] = None) -> AccessStats:
        """Get access control statistics"""
        try:
            # Get permissions stats
            permission_query = select(DataSourcePermission)
            if data_source_id:
                permission_query = permission_query.where(DataSourcePermission.data_source_id == data_source_id)
            
            permissions = session.execute(permission_query).scalars().all()
            
            total_permissions = len(permissions)
            active_permissions = len([p for p in permissions if not p.expires_at or p.expires_at > datetime.now()])
            expired_permissions = total_permissions - active_permissions
            user_permissions = len([p for p in permissions if p.user_id])
            role_permissions = len([p for p in permissions if p.role_id])
            
            # Get access logs stats
            log_query = select(AccessLog)
            if data_source_id:
                log_query = log_query.where(AccessLog.data_source_id == data_source_id)
            
            logs = session.execute(log_query.limit(1000)).all()  # Limit for performance
            
            total_access_attempts = len(logs)
            successful_access = len([l for l in logs if l.result == "success"])
            failed_access = total_access_attempts - successful_access
            success_rate = (successful_access / total_access_attempts * 100) if total_access_attempts > 0 else 0
            
            # Get most accessed data source
            data_source_counts = {}
            for log in logs:
                ds_id = log.data_source_id
                data_source_counts[ds_id] = data_source_counts.get(ds_id, 0) + 1
            
            most_accessed_ds = "none"
            if data_source_counts:
                most_accessed_id = max(data_source_counts.items(), key=lambda x: x[1])[0]
                data_source = session.get(DataSource, most_accessed_id)
                most_accessed_ds = data_source.name if data_source else f"DS-{most_accessed_id}"
            
            # Get recent logs
            recent_logs = session.execute(
                select(AccessLog).order_by(AccessLog.created_at.desc()).limit(10)
            ).all()
            
            return AccessStats(
                total_permissions=total_permissions,
                active_permissions=active_permissions,
                expired_permissions=expired_permissions,
                user_permissions=user_permissions,
                role_permissions=role_permissions,
                total_access_attempts=total_access_attempts,
                successful_access=successful_access,
                failed_access=failed_access,
                success_rate_percentage=round(success_rate, 1),
                most_accessed_data_source=most_accessed_ds,
                recent_access_logs=[AccessLogResponse.from_orm(log) for log in recent_logs]
            )
            
        except Exception as e:
            logger.error(f"Error getting access stats: {str(e)}")
            return AccessStats(
                total_permissions=0,
                active_permissions=0,
                expired_permissions=0,
                user_permissions=0,
                role_permissions=0,
                total_access_attempts=0,
                successful_access=0,
                failed_access=0,
                success_rate_percentage=0.0,
                most_accessed_data_source="none",
                recent_access_logs=[]
            )
    
    @staticmethod
    def _check_existing_permission(session: Session, data_source_id: int, user_id: Optional[str], role_id: Optional[str]) -> Optional[DataSourcePermission]:
        """Check if permission already exists"""
        query = select(DataSourcePermission).where(
            DataSourcePermission.data_source_id == data_source_id
        )
        
        if user_id:
            query = query.where(DataSourcePermission.user_id == user_id)
        if role_id:
            query = query.where(DataSourcePermission.role_id == role_id)
        
        return session.execute(query).scalars().first()
    
    @staticmethod
    def _update_existing_permission(session: Session, permission: DataSourcePermission, new_data: PermissionCreate, updated_by: str) -> PermissionResponse:
        """Update existing permission"""
        permission.permission_type = new_data.permission_type
        permission.access_level = new_data.access_level
        permission.expires_at = new_data.expires_at
        permission.conditions = new_data.conditions
        permission.granted_by = updated_by
        permission.granted_at = datetime.now()
        permission.updated_at = datetime.now()
        
        session.add(permission)
        session.commit()
        session.refresh(permission)
        
        return PermissionResponse.from_orm(permission)
    
    @staticmethod
    def _log_access(session: Session, data_source_id: int, user_id: str, action: str, resource: str, result: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None, metadata: Dict[str, Any] = None):
        """Log access attempt"""
        try:
            log = AccessLog(
                data_source_id=data_source_id,
                user_id=user_id,
                action=action,
                resource=resource,
                result=result,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata=metadata or {}
            )
            
            session.add(log)
            session.commit()
        except Exception as e:
            logger.error(f"Error logging access: {str(e)}")
            # Don't raise - logging failures shouldn't break main functionality