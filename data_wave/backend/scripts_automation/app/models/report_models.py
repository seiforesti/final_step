from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ReportType(str, Enum):
    PERFORMANCE = "performance"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    USAGE = "usage"
    AUDIT = "audit"
    BACKUP = "backup"
    CUSTOM = "custom"


class ReportStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    SCHEDULED = "scheduled"


class ReportFormat(str, Enum):
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"
    JSON = "json"
    HTML = "html"


class Report(SQLModel, table=True):
    """Report model"""
    __tablename__ = "reports"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: Optional[int] = Field(foreign_key="datasource.id", index=True)
    
    # Report details
    name: str = Field(index=True)
    description: Optional[str] = None
    report_type: ReportType
    format: ReportFormat = Field(default=ReportFormat.PDF)
    
    # Status and execution
    status: ReportStatus = Field(default=ReportStatus.PENDING)
    generated_at: Optional[datetime] = None
    generated_by: str
    
    # File details
    file_path: Optional[str] = None
    file_size: Optional[int] = None  # in bytes
    
    # Schedule information
    is_scheduled: bool = Field(default=False)
    schedule_cron: Optional[str] = None
    next_run: Optional[datetime] = None
    
    # Configuration
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ReportTemplate(SQLModel, table=True):
    """Report template model"""
    __tablename__ = "report_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Template details
    name: str = Field(index=True)
    description: Optional[str] = None
    report_type: ReportType
    
    # Template configuration
    template_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    default_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    is_system: bool = Field(default=False)  # System templates vs user-created
    
    # Usage tracking
    usage_count: int = Field(default=0)
    last_used: Optional[datetime] = None
    
    # Audit fields
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ReportGeneration(SQLModel, table=True):
    """Report generation history model"""
    __tablename__ = "report_generations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: int = Field(foreign_key="reports.id", index=True)
    
    # Generation details
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Status and results
    status: ReportStatus
    error_message: Optional[str] = None
    records_processed: Optional[int] = None
    
    # File details
    output_file_path: Optional[str] = None
    output_file_size: Optional[int] = None
    
    # Audit
    triggered_by: str  # user_id or 'system'
    trigger_type: str = Field(default="manual")  # manual, scheduled, api


# Response Models
class ReportResponse(BaseModel):
    """Report response model"""
    id: int
    data_source_id: Optional[int]
    name: str
    description: Optional[str]
    report_type: ReportType
    format: ReportFormat
    status: ReportStatus
    generated_at: Optional[datetime]
    generated_by: str
    file_path: Optional[str]
    file_size: Optional[int]
    is_scheduled: bool
    schedule_cron: Optional[str]
    next_run: Optional[datetime]
    parameters: Dict[str, Any]
    filters: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportTemplateResponse(BaseModel):
    """Report template response model"""
    id: int
    name: str
    description: Optional[str]
    report_type: ReportType
    template_config: Dict[str, Any]
    default_parameters: Dict[str, Any]
    is_active: bool
    is_system: bool
    usage_count: int
    last_used: Optional[datetime]
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportCreate(BaseModel):
    """Report creation model"""
    data_source_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    report_type: ReportType
    format: ReportFormat = ReportFormat.PDF
    is_scheduled: bool = False
    schedule_cron: Optional[str] = None
    parameters: Dict[str, Any] = {}
    filters: Dict[str, Any] = {}


class ReportUpdate(BaseModel):
    """Report update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    format: Optional[ReportFormat] = None
    is_scheduled: Optional[bool] = None
    schedule_cron: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None


class ReportStats(BaseModel):
    """Report statistics model"""
    total_reports: int
    completed_reports: int
    failed_reports: int
    pending_reports: int
    scheduled_reports: int
    total_size_mb: float
    avg_generation_time_minutes: float
    most_used_type: str
    success_rate_percentage: float