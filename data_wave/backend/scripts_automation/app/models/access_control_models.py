from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class PermissionType(str, Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"
    EXECUTE = "execute"


class AccessLevel(str, Enum):
    NONE = "none"
    READ_ONLY = "read_only"
    READ_WRITE = "read_write"
    FULL_ACCESS = "full_access"


class DataSourcePermission(SQLModel, table=True):
    """Data source permission model"""
    __tablename__ = "data_source_permissions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    user_id: Optional[str] = Field(index=True)
    role_id: Optional[str] = Field(index=True)
    
    # Permission details
    permission_type: PermissionType
    access_level: AccessLevel
    granted_by: str
    granted_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    
    # Conditions
    conditions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class AccessLog(SQLModel, table=True):
    """Access log model for audit trails"""
    __tablename__ = "access_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    user_id: str = Field(index=True)
    
    # Access details
    action: str  # read, write, delete, etc.
    resource: str
    result: str  # success, denied, error
    
    # Context
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    
    # Metadata
    access_metadata: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)


# Response Models
class DataSourcePermissionResponse(SQLModel):
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


class AccessLogResponse(SQLModel):
    id: int
    data_source_id: int
    user_id: str
    action: str
    resource: str
    result: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime


class AccessControlResponse(SQLModel):
    permissions: List[DataSourcePermissionResponse]
    recent_access: List[AccessLogResponse]
    user_summary: Dict[str, Any]
    role_summary: Dict[str, Any]
    recommendations: List[str]