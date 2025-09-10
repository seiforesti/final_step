from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json


class BackupType(str, Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"
    SNAPSHOT = "snapshot"
    TRANSACTION_LOG = "transaction_log"


class BackupStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RestoreStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class BackupOperation(SQLModel, table=True):
    """Backup operation model for tracking backup operations"""
    __tablename__ = "backup_operations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Backup details
    backup_type: BackupType
    backup_name: str
    description: Optional[str] = None
    
    # Status and timing
    status: BackupStatus = Field(default=BackupStatus.PENDING)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Size and location
    backup_size_bytes: Optional[int] = None
    backup_location: Optional[str] = None
    compression_ratio: Optional[float] = None
    
    # Background task tracking
    background_task_id: Optional[str] = None
    
    # Metadata
    backup_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class RestoreOperation(SQLModel, table=True):
    """Restore operation model for tracking restore operations"""
    __tablename__ = "restore_operations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    backup_id: int = Field(foreign_key="backup_operations.id")
    
    # Restore details
    restore_name: str
    description: Optional[str] = None
    target_location: Optional[str] = None
    
    # Status and timing
    status: RestoreStatus = Field(default=RestoreStatus.PENDING)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Progress
    progress_percentage: float = Field(default=0.0)
    
    # Metadata
    restore_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class BackupSchedule(SQLModel, table=True):
    """Backup schedule model for automated backups"""
    __tablename__ = "backup_schedules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Schedule details
    schedule_name: str
    backup_type: BackupType
    cron_expression: str
    is_enabled: bool = Field(default=True)
    
    # Retention
    retention_days: int = Field(default=30)
    max_backups: int = Field(default=10)
    
    # Next run
    next_run: Optional[datetime] = None
    last_run: Optional[datetime] = None
    
    # Metadata
    schedule_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Response Models
class BackupOperationResponse(SQLModel):
    id: int
    data_source_id: int
    backup_type: BackupType
    backup_name: str
    description: Optional[str]
    status: BackupStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    backup_size_bytes: Optional[int]
    backup_location: Optional[str]
    compression_ratio: Optional[float]
    created_by: Optional[str]
    created_at: datetime


class RestoreOperationResponse(SQLModel):
    id: int
    data_source_id: int
    backup_id: int
    restore_name: str
    description: Optional[str]
    target_location: Optional[str]
    status: RestoreStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    progress_percentage: float
    created_by: Optional[str]
    created_at: datetime


class BackupScheduleResponse(SQLModel):
    id: int
    data_source_id: int
    schedule_name: str
    backup_type: BackupType
    cron_expression: str
    is_enabled: bool
    retention_days: int
    max_backups: int
    next_run: Optional[datetime]
    last_run: Optional[datetime]
    created_by: Optional[str]
    created_at: datetime


class BackupStatusResponse(SQLModel):
    recent_backups: List[BackupOperationResponse]
    scheduled_backups: List[BackupScheduleResponse]
    backup_statistics: Dict[str, Any]
    storage_usage: Dict[str, Any]
    recommendations: List[str]


# Create Models
class BackupOperationCreate(SQLModel):
    data_source_id: int
    backup_type: BackupType
    backup_name: str
    description: Optional[str] = None
    backup_metadata: Dict[str, Any] = Field(default_factory=dict)


class RestoreOperationCreate(SQLModel):
    data_source_id: int
    backup_id: int
    restore_name: str
    description: Optional[str] = None
    target_location: Optional[str] = None


class BackupScheduleCreate(SQLModel):
    data_source_id: int
    schedule_name: str
    backup_type: BackupType
    cron_expression: str
    retention_days: int = 30
    max_backups: int = 10
    is_enabled: bool = True


# Update Models
class BackupOperationUpdate(SQLModel):
    status: Optional[BackupStatus] = None
    backup_size_bytes: Optional[int] = None
    backup_location: Optional[str] = None
    compression_ratio: Optional[float] = None


class RestoreOperationUpdate(SQLModel):
    status: Optional[RestoreStatus] = None
    progress_percentage: Optional[float] = None
    target_location: Optional[str] = None


class BackupScheduleUpdate(SQLModel):
    is_enabled: Optional[bool] = None
    cron_expression: Optional[str] = None
    retention_days: Optional[int] = None
    max_backups: Optional[int] = None
