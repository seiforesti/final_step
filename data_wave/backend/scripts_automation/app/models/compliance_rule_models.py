from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Table
from sqlalchemy import Integer, ForeignKey
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# **INTERCONNECTED: Import existing models for proper relationships**
from app.models.scan_models import DataSource, ScanRuleSet

# Link table for many-to-many relationship between ComplianceRule and DataSource
compliance_rule_data_source_link = Table(
    "compliance_rule_data_source_link",
    SQLModel.metadata,
    Column("compliance_rule_id", Integer, ForeignKey("compliance_rules.id"), primary_key=True),
    Column("data_source_id", Integer, ForeignKey("datasource.id"), primary_key=True),
)

class ComplianceRuleType(str, Enum):
    """Types of compliance rules"""
    REGULATORY = "regulatory"
    INTERNAL = "internal"
    SECURITY = "security"
    PRIVACY = "privacy"
    QUALITY = "quality"
    ACCESS_CONTROL = "access_control"
    DATA_RETENTION = "data_retention"
    ENCRYPTION = "encryption"
    AUDIT = "audit"
    MONITORING = "monitoring"
    CUSTOM = "custom"

class ComplianceRuleSeverity(str, Enum):
    """Severity levels for compliance rules"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ComplianceRuleStatus(str, Enum):
    """Status of compliance rules"""
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    UNDER_REVIEW = "under_review"

class ComplianceRuleScope(str, Enum):
    """Scope of compliance rules"""
    GLOBAL = "global"
    DATA_SOURCE = "data_source"
    SCHEMA = "schema"
    TABLE = "table"
    COLUMN = "column"
    FIELD = "field"

class RuleValidationStatus(str, Enum):
    """Status of rule validation/evaluation"""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIALLY_COMPLIANT = "partially_compliant"
    NOT_ASSESSED = "not_assessed"
    IN_PROGRESS = "in_progress"
    ERROR = "error"

class WorkflowStatus(str, Enum):
    """Status of compliance workflows"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

# **INTERCONNECTED: Core Compliance Rule Model with proper relationships**
class ComplianceRule(SQLModel, table=True):
    """Compliance rule model for managing compliance rules and policies"""
    __tablename__ = "compliance_rules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Basic Information
    name: str = Field(index=True)
    description: str
    rule_type: ComplianceRuleType
    severity: ComplianceRuleSeverity
    status: ComplianceRuleStatus = Field(default=ComplianceRuleStatus.DRAFT)
    
    # Scope and Applicability
    scope: ComplianceRuleScope = Field(default=ComplianceRuleScope.GLOBAL)
    entity_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # **INTERCONNECTED: Direct relationships to existing backend models**
    scan_rule_set_id: Optional[int] = Field(default=None, foreign_key="scan_rule_sets.id")
    custom_scan_rule_ids: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Rule Definition
    condition: str  # JSON or expression string representing the condition
    rule_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # **INTERCONNECTED: Integration with Scan Results**
    scan_integration_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    auto_scan_on_evaluation: bool = Field(default=False)
    scan_triggers: List[str] = Field(default_factory=list, sa_column=Column(JSON))  # schedule, on_change, manual
    
    # Compliance Framework
    compliance_standard: Optional[str] = None  # e.g., "GDPR", "SOX", "HIPAA"
    reference: Optional[str] = None  # Reference to external standard or regulation
    reference_link: Optional[str] = None
    
    # Remediation
    remediation_steps: Optional[str] = None
    auto_remediation: bool = Field(default=False)
    remediation_workflow_id: Optional[int] = Field(default=None)  # Link to workflow
    
    # **INTERCONNECTED: Data Source Integration**
    data_source_filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    applies_to_all_sources: bool = Field(default=False)
    source_type_filters: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Validation and Monitoring
    validation_frequency: str = Field(default="daily")  # daily, weekly, monthly
    is_automated: bool = Field(default=True)
    last_evaluated_at: Optional[datetime] = None
    next_evaluation_at: Optional[datetime] = None
    
    # **INTERCONNECTED: Performance and Metrics Integration**
    performance_thresholds: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Context
    business_impact: str = Field(default="medium")  # low, medium, high, critical
    regulatory_requirement: bool = Field(default=False)
    
    # Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    rule_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # System Fields
    is_built_in: bool = Field(default=False)
    is_global: bool = Field(default=True)
    version: int = Field(default=1)
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)
    updated_by: Optional[str] = None
    
    # Performance Metrics
    pass_rate: float = Field(default=0.0)
    total_entities: int = Field(default=0)
    passing_entities: int = Field(default=0)
    failing_entities: int = Field(default=0)
    
    # **INTERCONNECTED: Relationships to existing and new models**
    scan_rule_set: Optional["ScanRuleSet"] = Relationship(back_populates="compliance_rules")
    data_sources: List["DataSource"] = Relationship(
        back_populates="compliance_rules",
        sa_relationship_kwargs={"secondary": compliance_rule_data_source_link}
    )
    evaluations: List["ComplianceRuleEvaluation"] = Relationship(back_populates="rule")
    issues: List["ComplianceIssue"] = Relationship(back_populates="rule")
    workflows: List["ComplianceWorkflow"] = Relationship(back_populates="rule")  # Defined in compliance_extended_models.py


# **INTERCONNECTED: Models that integrate with existing compliance_models.py**
class ComplianceRuleEvaluation(SQLModel, table=True):
    """Model for tracking compliance rule evaluations"""
    __tablename__ = "compliance_rule_evaluations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="compliance_rules.id", index=True)
    evaluation_id: str = Field(index=True)
    
    # Evaluation Results
    status: RuleValidationStatus
    entity_count: Dict[str, int] = Field(sa_column=Column(JSON))
    compliance_score: float
    issues_found: int = Field(default=0)
    
    # Execution Details
    execution_time_ms: int
    entities_processed: int
    evaluation_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # **INTERCONNECTED: Integration context**
    scan_results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    performance_metrics: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    security_checks: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    evaluation_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timestamps
    evaluated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    rule: ComplianceRule = Relationship(back_populates="evaluations")


class ComplianceIssue(SQLModel, table=True):
    """Model for tracking compliance issues and gaps"""
    __tablename__ = "compliance_issues"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="compliance_rules.id", index=True)
    
    # Issue Details
    title: str
    description: str
    severity: ComplianceRuleSeverity
    status: str = Field(default="open")  # open, in_progress, resolved, accepted_risk
    
    # **INTERCONNECTED: Data source context**
    data_source_id: Optional[int] = Field(default=None, foreign_key="datasource.id")
    entity_type: Optional[str] = None  # table, column, schema, etc.
    entity_name: Optional[str] = None
    
    # Remediation
    remediation_plan: Optional[str] = None
    remediation_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    
    # Progress Tracking
    progress_percentage: int = Field(default=0)
    last_updated_by: Optional[str] = None
    
    # Impact Assessment
    business_impact: Optional[str] = None
    technical_impact: Optional[str] = None
    cost_estimate: Optional[float] = None
    effort_estimate: Optional[str] = None
    
    # Prioritization
    priority: int = Field(default=3)  # 1=highest, 5=lowest
    dependencies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    related_issues: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata
    issue_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    
    # Relationships
    rule: ComplianceRule = Relationship(back_populates="issues")
    data_source: Optional["DataSource"] = Relationship()


# Note: ComplianceWorkflow and ComplianceWorkflowExecution classes are defined in compliance_extended_models.py
# to avoid duplicate table definitions


# Response Models for API
class ComplianceRuleResponse(SQLModel):
    """Response model for compliance rules"""
    id: int
    name: str
    description: str
    rule_type: ComplianceRuleType
    severity: ComplianceRuleSeverity
    status: ComplianceRuleStatus
    scope: ComplianceRuleScope
    condition: str
    compliance_standard: Optional[str]
    business_impact: str
    regulatory_requirement: bool
    tags: List[str]
    rule_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]
    updated_by: Optional[str]
    version: int
    pass_rate: float
    total_entities: int
    passing_entities: int
    failing_entities: int

    class Config:
        from_attributes = True


class ComplianceRuleEvaluationResponse(SQLModel):
    """Response model for rule evaluations"""
    id: int
    rule_id: int
    evaluation_id: str
    status: RuleValidationStatus
    entity_count: Dict[str, int]
    compliance_score: float
    issues_found: int
    execution_time_ms: int
    entities_processed: int
    evaluated_at: datetime
    evaluation_context: Dict[str, Any]
    evaluation_metadata: Dict[str, Any]

    class Config:
        from_attributes = True


class ComplianceIssueResponse(SQLModel):
    """Response model for compliance issues"""
    id: int
    rule_id: int
    title: str
    description: str
    severity: ComplianceRuleSeverity
    status: str
    data_source_id: Optional[int]
    entity_type: Optional[str]
    entity_name: Optional[str]
    assigned_to: Optional[str]
    due_date: Optional[datetime]
    progress_percentage: int
    priority: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class ComplianceWorkflowResponse(SQLModel):
    """Response model for workflows"""
    id: int
    rule_id: Optional[int]
    name: str
    description: str
    workflow_type: str
    status: WorkflowStatus
    current_step: int
    assigned_to: Optional[str]
    due_date: Optional[datetime]
    priority: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Create Models for API requests
class ComplianceRuleCreate(SQLModel):
    """Model for creating compliance rules"""
    name: str
    description: str
    rule_type: ComplianceRuleType
    severity: ComplianceRuleSeverity
    scope: ComplianceRuleScope = ComplianceRuleScope.GLOBAL
    condition: str
    compliance_standard: Optional[str] = None
    business_impact: str = "medium"
    regulatory_requirement: bool = False
    remediation_steps: Optional[str] = None
    auto_remediation: bool = False
    validation_frequency: str = "weekly"
    tags: List[str] = Field(default_factory=list)
    rule_metadata: Dict[str, Any] = Field(default_factory=dict)
    scan_rule_set_id: Optional[int] = None
    custom_scan_rule_ids: List[int] = Field(default_factory=list)
    auto_scan_on_evaluation: bool = False
    scan_triggers: List[str] = Field(default_factory=list)


class ComplianceRuleUpdate(SQLModel):
    """Model for updating compliance rules"""
    name: Optional[str] = None
    description: Optional[str] = None
    rule_type: Optional[ComplianceRuleType] = None
    severity: Optional[ComplianceRuleSeverity] = None
    status: Optional[ComplianceRuleStatus] = None
    scope: Optional[ComplianceRuleScope] = None
    condition: Optional[str] = None
    compliance_standard: Optional[str] = None
    business_impact: Optional[str] = None
    regulatory_requirement: Optional[bool] = None
    remediation_steps: Optional[str] = None
    auto_remediation: Optional[bool] = None
    validation_frequency: Optional[str] = None
    tags: Optional[List[str]] = None
    rule_metadata: Optional[Dict[str, Any]] = None


class ComplianceIssueCreate(SQLModel):
    """Model for creating compliance issues"""
    rule_id: int
    title: str
    description: str
    severity: ComplianceRuleSeverity
    data_source_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_name: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: int = 3
    remediation_plan: Optional[str] = None


class ComplianceIssueUpdate(SQLModel):
    """Model for updating compliance issues"""
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[ComplianceRuleSeverity] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = None
    progress_percentage: Optional[int] = None
    remediation_plan: Optional[str] = None


class ComplianceWorkflowCreate(SQLModel):
    """Model for creating workflows"""
    rule_id: Optional[int] = None
    name: str
    description: str
    workflow_type: str
    steps: List[Dict[str, Any]] = Field(default_factory=list)
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"
    triggers: List[Dict[str, Any]] = Field(default_factory=list)
    conditions: Dict[str, Any] = Field(default_factory=dict)


class ComplianceWorkflowUpdate(SQLModel):
    """Model for updating workflows"""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    current_step: Optional[int] = None