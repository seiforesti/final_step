from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class VersionStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    ROLLBACK = "rollback"


class ChangeType(str, Enum):
    CONFIGURATION = "configuration"
    SCHEMA = "schema"
    SECURITY = "security"
    PERFORMANCE = "performance"
    INTEGRATION = "integration"
    METADATA = "metadata"
    OTHER = "other"


class DataSourceVersion(SQLModel, table=True):
    """Data source version model"""
    __tablename__ = "data_source_versions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    
    # Version details
    version: str = Field(index=True)  # e.g., "1.2.3", "v2.1.0"
    name: Optional[str] = None
    description: Optional[str] = None
    
    # Status
    status: VersionStatus = Field(default=VersionStatus.DRAFT)
    is_current: bool = Field(default=False)
    
    # Changes
    changes_summary: Optional[str] = None
    breaking_changes: bool = Field(default=False)
    
    # Configuration snapshot
    configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    schema_snapshot: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Parent version (for tracking lineage)
    parent_version_id: Optional[int] = Field(foreign_key="data_source_versions.id")
    
    # Audit fields
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    activated_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None


class VersionChange(SQLModel, table=True):
    """Version change detail model"""
    __tablename__ = "version_changes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: int = Field(foreign_key="data_source_versions.id", index=True)
    
    # Change details
    change_type: ChangeType
    field_path: str  # dot notation path like "config.host" or "schema.tables.users"
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    description: str
    
    # Impact assessment
    impact_level: str = Field(default="low")  # low, medium, high, critical
    requires_restart: bool = Field(default=False)
    affects_data: bool = Field(default=False)
    
    # Audit
    created_at: datetime = Field(default_factory=datetime.now)


class VersionApproval(SQLModel, table=True):
    """Version approval workflow model"""
    __tablename__ = "version_approvals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: int = Field(foreign_key="data_source_versions.id", index=True)
    
    # Approval details
    approver_id: str
    status: str = Field(default="pending")  # pending, approved, rejected
    comments: Optional[str] = None
    
    # Timestamps
    requested_at: datetime = Field(default_factory=datetime.now)
    reviewed_at: Optional[datetime] = None


class VersionDeployment(SQLModel, table=True):
    """Version deployment history model"""
    __tablename__ = "version_deployments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: int = Field(foreign_key="data_source_versions.id", index=True)
    
    # Deployment details
    deployment_type: str = Field(default="deploy")  # deploy, rollback, hotfix
    deployed_by: str
    deployment_notes: Optional[str] = None
    
    # Status tracking
    status: str = Field(default="pending")  # pending, in_progress, completed, failed
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    # Rollback information
    rollback_version_id: Optional[int] = Field(foreign_key="data_source_versions.id")


# Response Models
class VersionChangeResponse(BaseModel):
    """Version change response model"""
    id: int
    version_id: int
    change_type: ChangeType
    field_path: str
    old_value: Optional[str]
    new_value: Optional[str]
    description: str
    impact_level: str
    requires_restart: bool
    affects_data: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DataSourceVersionResponse(BaseModel):
    """Data source version response model"""
    id: int
    data_source_id: int
    version: str
    name: Optional[str]
    description: Optional[str]
    status: VersionStatus
    is_current: bool
    changes_summary: Optional[str]
    breaking_changes: bool
    configuration: Dict[str, Any]
    schema_snapshot: Dict[str, Any]
    parent_version_id: Optional[int]
    created_by: str
    created_at: datetime
    updated_at: datetime
    activated_at: Optional[datetime]
    archived_at: Optional[datetime]
    changes: List[VersionChangeResponse] = []

    class Config:
        from_attributes = True


class VersionCreate(BaseModel):
    """Version creation model"""
    version: str
    name: Optional[str] = None
    description: Optional[str] = None
    changes_summary: Optional[str] = None
    breaking_changes: bool = False
    configuration: Dict[str, Any] = {}
    schema_snapshot: Dict[str, Any] = {}
    parent_version_id: Optional[int] = None


class VersionUpdate(BaseModel):
    """Version update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    changes_summary: Optional[str] = None
    breaking_changes: Optional[bool] = None
    configuration: Optional[Dict[str, Any]] = None
    schema_snapshot: Optional[Dict[str, Any]] = None


class VersionStats(BaseModel):
    """Version statistics model"""
    total_versions: int
    active_versions: int
    draft_versions: int
    archived_versions: int
    total_changes: int
    breaking_changes_count: int
    avg_deployment_time_minutes: float
    success_rate_percentage: float
    most_common_change_type: str