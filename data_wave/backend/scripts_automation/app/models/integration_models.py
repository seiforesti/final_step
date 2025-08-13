from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json


class IntegrationType(str, Enum):
    CRM = "crm"
    STORAGE = "storage"
    NOTIFICATION = "notification"
    SECURITY = "security"
    ANALYTICS = "analytics"
    API = "api"


class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    CONNECTING = "connecting"
    DISABLED = "disabled"


class Integration(SQLModel, table=True):
    """Integration model for third-party integrations"""
    __tablename__ = "integrations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    type: IntegrationType
    provider: str
    status: IntegrationStatus = Field(default=IntegrationStatus.INACTIVE)
    description: Optional[str] = None
    
    # Configuration stored as JSON
    config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Sync information
    sync_frequency: str = Field(default="24h")  # e.g., "1h", "4h", "24h"
    last_sync: Optional[datetime] = None
    next_sync: Optional[datetime] = None
    
    # Statistics
    data_volume: int = Field(default=0)
    error_count: int = Field(default=0)
    success_rate: float = Field(default=0.0)
    
    # Relationships
    data_source_id: int = Field(foreign_key="data_sources.id")
    data_source: Optional["DataSource"] = Relationship(back_populates="integrations")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None


class IntegrationLog(SQLModel, table=True):
    """Integration execution logs"""
    __tablename__ = "integration_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    integration_id: int = Field(foreign_key="integrations.id")
    
    # Execution details
    execution_time: datetime = Field(default_factory=datetime.utcnow)
    status: str  # success, error, warning
    message: Optional[str] = None
    error_details: Optional[str] = None
    
    # Metrics
    duration_ms: Optional[int] = None
    records_processed: Optional[int] = None
    data_size_bytes: Optional[int] = None
    
    # Relationships
    integration: Optional[Integration] = Relationship()


class IntegrationTemplate(SQLModel, table=True):
    """Templates for common integrations"""
    __tablename__ = "integration_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    provider: str
    type: IntegrationType
    description: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    
    # Configuration schema
    config_schema: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    features: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Template metadata
    version: str = Field(default="1.0.0")
    is_active: bool = Field(default=True)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Integration response models
class IntegrationResponse(SQLModel):
    id: int
    name: str
    type: IntegrationType
    provider: str
    status: IntegrationStatus
    description: Optional[str] = None
    sync_frequency: str
    last_sync: Optional[datetime] = None
    next_sync: Optional[datetime] = None
    data_volume: int
    error_count: int
    success_rate: float
    data_source_id: int
    created_at: datetime
    updated_at: datetime


class IntegrationCreate(SQLModel):
    name: str
    type: IntegrationType
    provider: str
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    sync_frequency: str = Field(default="24h")
    data_source_id: int


class IntegrationUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    sync_frequency: Optional[str] = None
    status: Optional[IntegrationStatus] = None


class IntegrationStats(SQLModel):
    total_integrations: int
    active_integrations: int
    error_integrations: int
    total_data_volume: int
    avg_success_rate: float
    last_sync_time: Optional[datetime] = None