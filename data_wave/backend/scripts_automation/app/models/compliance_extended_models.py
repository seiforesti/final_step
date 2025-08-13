from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid

# **INTERCONNECTED: Import existing models for proper relationships**
from app.models.compliance_rule_models import ComplianceRule


# Enums for extended models
class ReportStatus(str, Enum):
    """Status of compliance reports"""
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"


class ReportType(str, Enum):
    """Types of compliance reports"""
    COMPLIANCE_STATUS = "compliance_status"
    GAP_ANALYSIS = "gap_analysis"
    RISK_ASSESSMENT = "risk_assessment"
    AUDIT_TRAIL = "audit_trail"
    EXECUTIVE_SUMMARY = "executive_summary"
    DETAILED_FINDINGS = "detailed_findings"
    FRAMEWORK_MAPPING = "framework_mapping"
    TREND_ANALYSIS = "trend_analysis"


class WorkflowStatus(str, Enum):
    """Status of compliance workflows"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"
    WAITING_APPROVAL = "waiting_approval"


class WorkflowType(str, Enum):
    """Types of compliance workflows"""
    ASSESSMENT = "assessment"
    REMEDIATION = "remediation"
    APPROVAL = "approval"
    REVIEW = "review"
    NOTIFICATION = "notification"
    ESCALATION = "escalation"
    INCIDENT_RESPONSE = "incident_response"


class IntegrationStatus(str, Enum):
    """Status of compliance integrations"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    TESTING = "testing"
    CONFIGURED = "configured"


class IntegrationType(str, Enum):
    """Types of compliance integrations"""
    GRC_TOOL = "grc_tool"
    SECURITY_SCANNER = "security_scanner"
    AUDIT_PLATFORM = "audit_platform"
    RISK_MANAGEMENT = "risk_management"
    DOCUMENTATION = "documentation"
    TICKETING = "ticketing"
    MONITORING = "monitoring"
    SIEM = "siem"


# **PRODUCTION MODELS: Reports**
class ComplianceReport(SQLModel, table=True):
    """Model for compliance reports with full production capabilities"""
    __tablename__ = "compliance_reports"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Basic Information
    name: str = Field(index=True)
    description: Optional[str] = None
    report_type: ReportType
    status: ReportStatus = Field(default=ReportStatus.DRAFT)
    
    # Report Configuration
    framework: Optional[str] = None
    data_source_ids: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    rule_ids: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Output Configuration
    file_format: str = Field(default="pdf")  # pdf, excel, csv, json, html
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    file_hash: Optional[str] = None
    
    # Generation Details
    template_id: Optional[str] = None
    generated_by: Optional[str] = None
    generated_at: Optional[datetime] = None
    generation_time_ms: Optional[int] = None
    
    # Scheduling
    schedule_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    next_run_at: Optional[datetime] = None
    last_run_at: Optional[datetime] = None
    
    # Distribution
    recipients: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    distribution_method: str = Field(default="download")  # email, download, api, ftp
    
    # Access Control
    access_level: str = Field(default="internal")  # public, internal, confidential, restricted
    retention_period_days: Optional[int] = None
    
    # Statistics
    page_count: Optional[int] = None
    section_count: Optional[int] = None
    finding_count: Optional[int] = None
    compliance_score: Optional[float] = None
    
    # Metadata
    report_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    version: int = Field(default=1)


class ComplianceReportTemplate(SQLModel, table=True):
    """Model for compliance report templates"""
    __tablename__ = "compliance_report_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Template Information
    name: str = Field(index=True)
    description: Optional[str] = None
    template_id: str = Field(unique=True, index=True)
    framework: Optional[str] = None
    report_type: ReportType
    
    # Template Configuration
    sections: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    file_formats: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    default_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Template Content
    template_content: Optional[str] = None  # JSON or YAML template definition
    css_styles: Optional[str] = None
    header_template: Optional[str] = None
    footer_template: Optional[str] = None
    
    # Metadata
    category: Optional[str] = None
    complexity_level: str = Field(default="intermediate")  # basic, intermediate, advanced
    estimated_generation_time: Optional[int] = None  # in minutes
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    is_active: bool = Field(default=True)


# **PRODUCTION MODELS: Workflows**
class ComplianceWorkflow(SQLModel, table=True):
    """Model for compliance workflows with full production capabilities"""
    __tablename__ = "compliance_workflows"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Basic Information
    name: str = Field(index=True)
    description: Optional[str] = None
    workflow_type: WorkflowType
    status: WorkflowStatus = Field(default=WorkflowStatus.DRAFT)
    
    # Workflow Configuration
    rule_id: Optional[int] = Field(default=None, foreign_key="compliance_rules.id")
    template_id: Optional[str] = None
    framework: Optional[str] = None
    
    # Steps and Execution
    steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    current_step: int = Field(default=0)
    total_steps: int = Field(default=0)
    
    # Assignment and Scheduling
    assigned_to: Optional[str] = None
    assigned_team: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = Field(default="medium")  # low, medium, high, urgent
    
    # Triggers and Conditions
    triggers: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    variables: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Tracking
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    progress_percentage: int = Field(default=0)
    
    # Results and Outcomes
    execution_results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    error_message: Optional[str] = None
    execution_log: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Approval and Review
    requires_approval: bool = Field(default=False)
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    approval_notes: Optional[str] = None
    
    # Notifications
    notification_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    workflow_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # Relationships
    rule: Optional[ComplianceRule] = Relationship(back_populates="workflows")


class ComplianceWorkflowTemplate(SQLModel, table=True):
    """Model for workflow templates"""
    __tablename__ = "compliance_workflow_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Template Information
    name: str = Field(index=True)
    description: Optional[str] = None
    template_id: str = Field(unique=True, index=True)
    workflow_type: WorkflowType
    framework: Optional[str] = None
    
    # Template Configuration
    steps_template: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    triggers_template: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    default_variables: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Estimation and Planning
    estimated_completion_hours: Optional[int] = None
    complexity_level: str = Field(default="intermediate")
    required_roles: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata
    category: Optional[str] = None
    usage_count: int = Field(default=0)
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    is_active: bool = Field(default=True)


# **PRODUCTION MODELS: Integrations**
class ComplianceIntegration(SQLModel, table=True):
    """Model for compliance integrations with external systems"""
    __tablename__ = "compliance_integrations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Basic Information
    name: str = Field(index=True)
    description: Optional[str] = None
    integration_type: IntegrationType
    provider: str
    status: IntegrationStatus = Field(default=IntegrationStatus.PENDING)
    
    # Configuration
    config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    credentials: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))  # Encrypted in production
    connection_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Synchronization
    sync_frequency: str = Field(default="daily")  # real_time, hourly, daily, weekly, manual
    last_synced_at: Optional[datetime] = None
    last_sync_status: Optional[str] = None  # success, failed, partial
    next_sync_at: Optional[datetime] = None
    
    # Error Handling
    error_message: Optional[str] = None
    error_count: int = Field(default=0)
    last_error_at: Optional[datetime] = None
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)
    
    # Performance and Statistics
    sync_statistics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    average_sync_duration_ms: Optional[int] = None
    total_records_synced: int = Field(default=0)
    success_rate: float = Field(default=0.0)
    
    # Capabilities and Features
    supported_frameworks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    capabilities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_mapping: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # API and Communication
    webhook_url: Optional[str] = None
    api_version: Optional[str] = None
    rate_limit: Optional[int] = None
    timeout_seconds: int = Field(default=30)
    
    # Security
    encryption_enabled: bool = Field(default=True)
    authentication_method: Optional[str] = None
    certificate_info: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    integration_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_tested_at: Optional[datetime] = None


class ComplianceIntegrationLog(SQLModel, table=True):
    """Model for tracking integration activity logs"""
    __tablename__ = "compliance_integration_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    integration_id: int = Field(foreign_key="compliance_integrations.id", index=True)
    
    # Log Details
    operation: str  # sync, test, configure, error, etc.
    status: str  # success, failed, warning, info
    message: str
    details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Performance Metrics
    duration_ms: Optional[int] = None
    records_processed: Optional[int] = None
    bytes_transferred: Optional[int] = None
    
    # Context
    triggered_by: Optional[str] = None  # user, system, schedule, webhook
    external_reference: Optional[str] = None
    
    # Timestamp
    created_at: datetime = Field(default_factory=datetime.now)


# **PRODUCTION MODELS: Audit Trail**
class ComplianceAuditLog(SQLModel, table=True):
    """Model for comprehensive compliance audit logging"""
    __tablename__ = "compliance_audit_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Audit Information
    entity_type: str  # rule, workflow, report, integration, etc.
    entity_id: int
    action: str  # created, updated, deleted, evaluated, executed, etc.
    
    # User and Context
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Change Details
    old_values: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    new_values: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    changes: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Additional Information
    description: Optional[str] = None
    reason: Optional[str] = None
    impact_level: str = Field(default="low")  # low, medium, high, critical
    
    # System Context
    system_version: Optional[str] = None
    request_id: Optional[str] = None
    correlation_id: Optional[str] = None
    
    # Metadata
    audit_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timestamp
    created_at: datetime = Field(default_factory=datetime.now, index=True)


class ComplianceCertification(SQLModel, table=True):
    """Model for compliance certifications and attestations"""
    __tablename__ = "compliance_certifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Entity Information
    entity_type: str = Field(index=True)  # data_source, system, organization, etc.
    entity_id: str = Field(index=True)  # ID of the certified entity
    
    # Certification Details
    certification_type: str = Field(index=True)  # SOC 2, ISO 27001, HIPAA, etc.
    issuer: str  # Organization that issued the certification
    audit_firm: Optional[str] = None  # Audit firm that performed the assessment
    
    # Dates
    issued_date: Optional[date] = None
    expiry_date: Optional[date] = Field(default=None, index=True)
    assessment_period_start: Optional[date] = None
    assessment_period_end: Optional[date] = None
    next_assessment_date: Optional[date] = None
    
    # Status and Details
    status: str = Field(default="active", index=True)  # active, expired, suspended, revoked
    certificate_url: Optional[str] = None  # URL to certificate document
    scope: Optional[str] = None  # Scope of certification
    compliance_frameworks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Assessment Information
    assessment_type: Optional[str] = None  # Type I, Type II, etc.
    opinion: Optional[str] = None  # Unqualified, qualified, etc.
    findings_count: Optional[int] = None
    exceptions_count: Optional[int] = None
    
    # Control Information
    control_objectives: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    tested_controls: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Additional Information
    description: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = Field(default=True, index=True)
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None


class ComplianceWorkflowExecution(SQLModel, table=True):
    """Model for tracking workflow execution history"""
    __tablename__ = "compliance_workflow_executions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(unique=True, index=True)  # Unique execution identifier
    workflow_id: int = Field(foreign_key="compliance_workflows.id", index=True)
    
    # Execution Details
    status: WorkflowStatus = Field(index=True)
    trigger_type: str  # manual, scheduled, event, api
    triggered_by: Optional[str] = None  # User or system that triggered
    
    # Timing
    started_at: datetime = Field(index=True)
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    
    # Progress
    current_step: int = Field(default=0)
    steps_completed: int = Field(default=0)
    total_steps: int = Field(default=0)
    progress_percentage: float = Field(default=0.0)
    
    # Execution Data
    input_parameters: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    output_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    execution_log: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Error Handling
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    retry_count: int = Field(default=0)
    
    # Metadata
    execution_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit
    created_at: datetime = Field(default_factory=datetime.now, index=True)