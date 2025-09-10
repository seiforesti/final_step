from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text
from typing import List, Optional, Dict, Any, ForwardRef, TYPE_CHECKING
from datetime import datetime
from enum import Enum
import uuid
import json

# Import existing models for integration
from .scan_models import DataSource, ScanResult, Scan, DataClassification as ScanDataClassification
from .catalog_models import CatalogItem, CatalogTag
from .compliance_models import ComplianceRequirement, ComplianceFramework


class SensitivityLevel(str, Enum):
    """Enhanced sensitivity levels for enterprise classification"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"
    # Data protection categories
    PII = "pii"  # Personally Identifiable Information
    PHI = "phi"  # Protected Health Information
    PCI = "pci"  # Payment Card Industry
    GDPR = "gdpr"  # GDPR protected data
    CCPA = "ccpa"  # California Consumer Privacy Act
    HIPAA = "hipaa"  # Health Insurance Portability and Accountability Act
    SOX = "sox"  # Sarbanes-Oxley Act
    # Custom enterprise categories
    FINANCIAL = "financial"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    TRADE_SECRET = "trade_secret"
    CUSTOMER_DATA = "customer_data"
    EMPLOYEE_DATA = "employee_data"
    PARTNER_DATA = "partner_data"


class ClassificationRuleType(str, Enum):
    """Types of classification rules"""
    REGEX_PATTERN = "regex_pattern"
    DICTIONARY_LOOKUP = "dictionary_lookup"
    COLUMN_NAME_PATTERN = "column_name_pattern"
    TABLE_NAME_PATTERN = "table_name_pattern"
    DATA_TYPE_PATTERN = "data_type_pattern"
    VALUE_RANGE_PATTERN = "value_range_pattern"
    STATISTICAL_PATTERN = "statistical_pattern"
    METADATA_PATTERN = "metadata_pattern"
    COMPOSITE_PATTERN = "composite_pattern"
    ML_INFERENCE = "ml_inference"
    AI_INFERENCE = "ai_inference"
    CUSTOM_FUNCTION = "custom_function"


class ClassificationScope(str, Enum):
    """Scope of classification application"""
    GLOBAL = "global"  # Apply to all data sources
    DATA_SOURCE = "data_source"  # Apply to specific data source
    SCHEMA = "schema"  # Apply to specific schema
    TABLE = "table"  # Apply to specific table
    COLUMN = "column"  # Apply to specific column
    CUSTOM = "custom"  # Custom scope definition


class ClassificationStatus(str, Enum):
    """Status of classification operations"""
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    FAILED = "failed"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class ClassificationConfidenceLevel(str, Enum):
    """Confidence levels for automated classification"""
    VERY_LOW = "very_low"  # 0-20%
    LOW = "low"  # 20-40%
    MEDIUM = "medium"  # 40-60%
    HIGH = "high"  # 60-80%
    VERY_HIGH = "very_high"  # 80-95%
    CERTAIN = "certain"  # 95-100%


class ClassificationMethod(str, Enum):
    """Method used for classification"""
    MANUAL = "manual"
    AUTOMATED_RULE = "automated_rule"
    ML_PREDICTION = "ml_prediction"
    AI_INFERENCE = "ai_inference"
    INHERITED = "inherited"
    POLICY_DRIVEN = "policy_driven"
    EXPERT_REVIEW = "expert_review"


# Core Classification Models

class ClassificationFramework(SQLModel, table=True):
    """Enterprise classification framework defining organizational standards"""
    __tablename__ = "classification_frameworks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    version: str = Field(default="1.0.0")
    
    # Framework configuration
    is_default: bool = Field(default=False)
    is_active: bool = Field(default=True)
    applies_to_data_sources: bool = Field(default=True)
    applies_to_schemas: bool = Field(default=True)
    applies_to_tables: bool = Field(default=True)
    applies_to_columns: bool = Field(default=True)
    
    # Compliance integration
    compliance_frameworks: Optional[str] = Field(default=None, sa_column=Column(JSON))  # List of compliance framework IDs
    regulatory_requirements: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Governance
    owner: Optional[str] = None
    steward: Optional[str] = None
    approval_required: bool = Field(default=True)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # Relationships
    classification_rules: List["ClassificationRule"] = Relationship(back_populates="framework")
    classification_policies: List["ClassificationPolicy"] = Relationship(back_populates="framework")


class ClassificationPolicy(SQLModel, table=True):
    """Enterprise policies governing classification behavior"""
    __tablename__ = "classification_policies"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    framework_id: int = Field(foreign_key="classification_frameworks.id")
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Policy configuration
    priority: int = Field(default=100)  # Lower number = higher priority
    is_mandatory: bool = Field(default=False)
    auto_apply: bool = Field(default=True)
    requires_approval: bool = Field(default=False)
    
    # Scope and conditions
    scope: ClassificationScope = Field(default=ClassificationScope.GLOBAL)
    scope_filter: Optional[str] = Field(default=None, sa_column=Column(JSON))  # JSON filter criteria
    conditions: Optional[str] = Field(default=None, sa_column=Column(JSON))  # Conditions for policy application
    
    # Actions
    default_sensitivity: SensitivityLevel
    inheritance_rules: Optional[str] = Field(default=None, sa_column=Column(JSON))
    notification_rules: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # Relationships
    framework: Optional[ClassificationFramework] = Relationship(back_populates="classification_policies")


class ClassificationRule(SQLModel, table=True):
    """Enhanced classification rules with deep integration"""
    __tablename__ = "classification_rules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    framework_id: Optional[int] = Field(default=None, foreign_key="classification_frameworks.id")
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Rule definition
    rule_type: ClassificationRuleType
    pattern: str  # Regex pattern, dictionary name, or function reference
    sensitivity_level: SensitivityLevel
    confidence_threshold: float = Field(default=0.8)
    
    # Rule configuration
    is_active: bool = Field(default=True)
    priority: int = Field(default=100)  # Lower number = higher priority
    scope: ClassificationScope = Field(default=ClassificationScope.GLOBAL)
    scope_filter: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Advanced features
    case_sensitive: bool = Field(default=False)
    whole_word_only: bool = Field(default=False)
    negate_match: bool = Field(default=False)  # If true, rule applies when pattern does NOT match
    
    # Conditions and context
    conditions: Optional[str] = Field(default=None, sa_column=Column(JSON))  # Additional conditions
    context_requirements: Optional[str] = Field(default=None, sa_column=Column(JSON))  # Context needed for rule
    
    # Integration with scan and compliance
    applies_to_scan_results: bool = Field(default=True)
    applies_to_catalog_items: bool = Field(default=True)
    compliance_requirement_id: Optional[int] = Field(default=None, foreign_key="compliance_requirements.id")
    
    # **INTERCONNECTED: Racine Orchestrator Integration**
    racine_orchestrator_id: Optional[str] = Field(default=None, foreign_key="racine_orchestration_master.id", index=True)
    
    # Performance and monitoring
    execution_count: int = Field(default=0)
    success_count: int = Field(default=0)
    false_positive_count: int = Field(default=0)
    last_executed: Optional[datetime] = None
    avg_execution_time_ms: Optional[float] = None
    
    # Version control
    version: str = Field(default="1.0.0")
    parent_rule_id: Optional[int] = Field(default=None, foreign_key="classification_rules.id")
    is_deprecated: bool = Field(default=False)
    deprecation_reason: Optional[str] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # Relationships
    framework: Optional[ClassificationFramework] = Relationship(back_populates="classification_rules")
    compliance_requirement: Optional["ComplianceRequirement"] = Relationship()
    parent_rule: Optional["ClassificationRule"] = Relationship(
        back_populates="child_rules",
        sa_relationship_kwargs={"remote_side": "ClassificationRule.id"}
    )
    child_rules: List["ClassificationRule"] = Relationship(back_populates="parent_rule")
    classification_results: List["ClassificationResult"] = Relationship(back_populates="rule")
    rule_dictionaries: List["ClassificationRuleDictionary"] = Relationship(back_populates="rule")
    
    # **INTERCONNECTED: Racine Orchestrator Integration**
    racine_orchestrator: Optional["RacineOrchestrationMaster"] = Relationship(back_populates="managed_classifications")


class ClassificationDictionary(SQLModel, table=True):
    """Enhanced dictionary for classification with multi-language support"""
    __tablename__ = "classification_dictionaries"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    
    # Dictionary configuration
    language: str = Field(default="en")  # ISO language code
    encoding: str = Field(default="utf-8")
    is_case_sensitive: bool = Field(default=False)
    
    # Dictionary content
    entries: str = Field(sa_column=Column(JSON))  # JSON dictionary of terms and metadata
    entry_count: int = Field(default=0)
    
    # Categories and organization
    category: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[str] = Field(default=None, sa_column=Column(JSON))  # List of tags
    
    # Source and lineage
    source_type: str = Field(default="manual")  # manual, imported, generated, external
    source_reference: Optional[str] = None
    imported_from: Optional[str] = None
    
    # Quality and validation
    validation_status: str = Field(default="pending")  # pending, validated, rejected
    validation_notes: Optional[str] = None
    quality_score: float = Field(default=0.0)
    
    # Usage statistics
    usage_count: int = Field(default=0)
    last_used: Optional[datetime] = None
    
    # Version control
    version: str = Field(default="1.0.0")
    parent_dictionary_id: Optional[int] = Field(default=None, foreign_key="classification_dictionaries.id")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # Relationships
    parent_dictionary: Optional["ClassificationDictionary"] = Relationship(
        back_populates="child_dictionaries",
        sa_relationship_kwargs={"remote_side": "ClassificationDictionary.id"}
    )
    child_dictionaries: List["ClassificationDictionary"] = Relationship(back_populates="parent_dictionary")
    rule_dictionaries: List["ClassificationRuleDictionary"] = Relationship(back_populates="dictionary")


class ClassificationRuleDictionary(SQLModel, table=True):
    """Many-to-many relationship between rules and dictionaries"""
    __tablename__ = "classification_rule_dictionaries"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="classification_rules.id")
    dictionary_id: int = Field(foreign_key="classification_dictionaries.id")
    
    # Relationship configuration
    is_primary: bool = Field(default=False)
    weight: float = Field(default=1.0)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    
    # Relationships
    rule: Optional[ClassificationRule] = Relationship(back_populates="rule_dictionaries")
    dictionary: Optional[ClassificationDictionary] = Relationship(back_populates="rule_dictionaries")


class ClassificationResult(SQLModel, table=True):
    """Comprehensive classification results with full integration"""
    __tablename__ = "classification_results"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Target entity information
    entity_type: str  # data_source, schema, table, column, scan_result, catalog_item
    entity_id: str  # ID or identifier of the entity
    entity_name: Optional[str] = None
    entity_path: Optional[str] = None  # Full path for hierarchical entities
    
    # Classification details
    rule_id: Optional[int] = Field(default=None, foreign_key="classification_rules.id")
    sensitivity_level: SensitivityLevel
    classification_method: ClassificationMethod
    confidence_score: float = Field(default=0.0)
    confidence_level: ClassificationConfidenceLevel
    
    # Integration with existing systems
    data_source_id: Optional[int] = Field(default=None, foreign_key="datasource.id")
    scan_id: Optional[int] = Field(default=None, foreign_key="scan.id")
    scan_result_id: Optional[int] = Field(default=None, foreign_key="scanresult.id")
    catalog_item_id: Optional[int] = Field(default=None, foreign_key="catalog_items.id")
    
    # Classification context
    matched_patterns: Optional[str] = Field(default=None, sa_column=Column(JSON))  # Patterns that matched
    matched_values: Optional[str] = Field(default=None, sa_column=Column(JSON))  # Actual values that matched
    context_data: Optional[str] = Field(default=None, sa_column=Column(JSON))  # Additional context
    
    # Data sampling and evidence
    sample_data: Optional[str] = Field(default=None, sa_column=Column(JSON))  # Sample data that led to classification
    sample_size: Optional[int] = None
    total_records: Optional[int] = None
    match_percentage: Optional[float] = None
    
    # Quality and validation
    is_validated: bool = Field(default=False)
    validation_status: str = Field(default="pending")  # pending, validated, rejected, needs_review
    validation_notes: Optional[str] = None
    validation_date: Optional[datetime] = None
    validated_by: Optional[str] = None
    
    # Inheritance and propagation
    inherited_from_id: Optional[int] = Field(default=None, foreign_key="classification_results.id")
    propagated_to: Optional[str] = Field(default=None, sa_column=Column(JSON))  # List of IDs this was propagated to
    inheritance_depth: int = Field(default=0)
    
    # Override and exceptions
    is_override: bool = Field(default=False)
    override_reason: Optional[str] = None
    override_approved_by: Optional[str] = None
    override_approved_at: Optional[datetime] = None
    
    # Performance metrics
    processing_time_ms: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    
    # Status and lifecycle
    status: ClassificationStatus = Field(default=ClassificationStatus.ACTIVE)
    effective_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None
    
    # Audit and compliance
    compliance_checked: bool = Field(default=False)
    compliance_status: Optional[str] = None
    compliance_notes: Optional[str] = None
    
    # Version control
    version: str = Field(default="1.0.0")
    revision_number: int = Field(default=1)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # Relationships
    rule: Optional[ClassificationRule] = Relationship(back_populates="classification_results")
    data_source: Optional[DataSource] = Relationship()
    scan: Optional[Scan] = Relationship()
    scan_result: Optional[ScanResult] = Relationship()
    catalog_item: Optional[CatalogItem] = Relationship()
    inherited_from: Optional["ClassificationResult"] = Relationship(
        back_populates="child_results",
        sa_relationship_kwargs={"remote_side": "ClassificationResult.id"}
    )
    child_results: List["ClassificationResult"] = Relationship(back_populates="inherited_from")
    audit_logs: List["ClassificationAuditLog"] = Relationship(back_populates="classification_result")
    tags: List["ClassificationTag"] = Relationship(back_populates="classification_result")


class ClassificationAuditLog(SQLModel, table=True):
    """Comprehensive audit logging for all classification activities"""
    __tablename__ = "classification_audit_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Audit event details
    event_type: str  # create, update, delete, validate, override, inherit, etc.
    event_category: str  # rule_management, classification, validation, compliance, etc.
    event_description: str
    
    # Target information
    target_type: str  # rule, dictionary, result, policy, framework
    target_id: Optional[str] = None
    target_name: Optional[str] = None
    
    # Classification result reference
    classification_result_id: Optional[int] = Field(default=None, foreign_key="classification_results.id")
    
    # Event data
    old_values: Optional[str] = Field(default=None, sa_column=Column(JSON))
    new_values: Optional[str] = Field(default=None, sa_column=Column(JSON))
    event_data: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Context information
    user_id: Optional[str] = None
    user_role: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # System information
    system_version: Optional[str] = None
    api_version: Optional[str] = None
    request_id: Optional[str] = None
    correlation_id: Optional[str] = None
    
    # Risk and compliance
    risk_level: str = Field(default="low")  # low, medium, high, critical
    compliance_impact: bool = Field(default=False)
    requires_notification: bool = Field(default=False)
    
    # Processing information
    processing_time_ms: Optional[float] = None
    success: bool = Field(default=True)
    error_message: Optional[str] = None
    error_stack: Optional[str] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    classification_result: Optional[ClassificationResult] = Relationship(back_populates="audit_logs")


class ClassificationTag(SQLModel, table=True):
    """Tags for classification results with metadata"""
    __tablename__ = "classification_tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    classification_result_id: int = Field(foreign_key="classification_results.id")
    
    # Tag information
    tag_name: str = Field(index=True)
    tag_value: Optional[str] = None
    tag_category: Optional[str] = None
    tag_source: str = Field(default="manual")  # manual, automated, ml, ai
    
    # Tag metadata
    confidence_score: Optional[float] = None
    relevance_score: Optional[float] = None
    is_system_tag: bool = Field(default=False)
    is_user_tag: bool = Field(default=True)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    
    # Relationships
    classification_result: Optional[ClassificationResult] = Relationship(back_populates="tags")


class ClassificationException(SQLModel, table=True):
    """Exceptions and special cases for classification"""
    __tablename__ = "classification_exceptions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Exception details
    entity_type: str
    entity_id: str
    entity_path: Optional[str] = None
    
    # Exception configuration
    exception_type: str  # exclude, override, custom_rule, manual_only
    reason: str
    sensitivity_level: Optional[SensitivityLevel] = None
    
    # Scope and conditions
    scope: ClassificationScope = Field(default=ClassificationScope.CUSTOM)
    conditions: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Approval and governance
    is_approved: bool = Field(default=False)
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    approval_notes: Optional[str] = None
    
    # Lifecycle
    is_active: bool = Field(default=True)
    effective_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None


class ClassificationMetrics(SQLModel, table=True):
    """Metrics and statistics for classification performance"""
    __tablename__ = "classification_metrics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Metric information
    metric_type: str  # daily, weekly, monthly, rule_performance, etc.
    metric_name: str
    metric_category: str  # performance, accuracy, coverage, compliance
    
    # Scope
    scope_type: str  # global, data_source, rule, framework
    scope_id: Optional[str] = None
    
    # Metric values
    metric_value: float
    metric_unit: Optional[str] = None
    benchmark_value: Optional[float] = None
    trend_direction: Optional[str] = None  # increasing, decreasing, stable
    
    # Context
    measurement_period_start: datetime
    measurement_period_end: datetime
    sample_size: Optional[int] = None
    
    # Additional data
    details: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


# Integration Tables for Interconnectedness

class DataSourceClassificationSetting(SQLModel, table=True):
    """Classification settings specific to data sources"""
    __tablename__ = "data_source_classification_settings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", unique=True)
    
    # Classification configuration
    auto_classify: bool = Field(default=True)
    classification_framework_id: Optional[int] = Field(default=None, foreign_key="classification_frameworks.id")
    default_sensitivity_level: SensitivityLevel = Field(default=SensitivityLevel.INTERNAL)
    
    # Scanning integration
    classify_on_scan: bool = Field(default=True)
    classification_frequency: str = Field(default="daily")  # daily, weekly, monthly
    
    # Inheritance rules
    inherit_schema_classification: bool = Field(default=True)
    inherit_table_classification: bool = Field(default=True)
    inherit_column_classification: bool = Field(default=False)
    
    # Performance settings
    batch_size: int = Field(default=1000)
    max_parallel_jobs: int = Field(default=4)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    # Relationships
    data_source: Optional[DataSource] = Relationship()
    classification_framework: Optional[ClassificationFramework] = Relationship()


class ScanResultClassification(SQLModel, table=True):
    """Link between scan results and classification results"""
    __tablename__ = "scan_result_classifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_result_id: int = Field(foreign_key="scanresult.id")
    classification_result_id: int = Field(foreign_key="classification_results.id")
    
    # Classification context from scan
    classification_triggered_by: str = Field(default="scan")  # scan, manual, scheduled
    scan_iteration: int = Field(default=1)
    
    # Quality metrics
    data_quality_score: Optional[float] = None
    completeness_score: Optional[float] = None
    consistency_score: Optional[float] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    scan_result: Optional[ScanResult] = Relationship()
    classification_result: Optional[ClassificationResult] = Relationship()


class CatalogItemClassification(SQLModel, table=True):
    """Enhanced link between catalog items and classification results"""
    __tablename__ = "catalog_item_classifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    catalog_item_id: int = Field(foreign_key="catalog_items.id")
    classification_result_id: int = Field(foreign_key="classification_results.id")
    
    # Classification enhancement for catalog
    is_primary_classification: bool = Field(default=True)
    business_context: Optional[str] = None
    usage_context: Optional[str] = None
    
    # Integration with catalog features
    affects_lineage: bool = Field(default=True)
    affects_search: bool = Field(default=True)
    affects_recommendations: bool = Field(default=True)
    
    # Metadata enhancement
    enhanced_description: Optional[str] = None
    business_glossary_terms: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    catalog_item: Optional[CatalogItem] = Relationship()
    classification_result: Optional[ClassificationResult] = Relationship()


# Update foreign key references to use proper table names
# Note: model_rebuild() is not available in Pydantic V1

# Forward references to avoid circular imports
if TYPE_CHECKING:
    from .racine_models.racine_orchestration_models import RacineOrchestrationMaster