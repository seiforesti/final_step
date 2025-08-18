"""
Enterprise Catalog Quality Models
Comprehensive data quality management models for enterprise-grade production use.
Supports automated quality assessment, continuous monitoring, configurable rules,
and quality reporting with real-time analytics.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator
from sqlmodel import Column, Field, Relationship, SQLModel, ARRAY, JSON as JSONB, String
from sqlalchemy import UniqueConstraint

# ============================================================================
# ENUMS
# ============================================================================

class QualityDimension(str, Enum):
    """Data quality dimensions"""
    COMPLETENESS = "completeness"
    ACCURACY = "accuracy"
    CONSISTENCY = "consistency"
    VALIDITY = "validity"
    TIMELINESS = "timeliness"
    UNIQUENESS = "uniqueness"
    INTEGRITY = "integrity"
    CONFORMITY = "conformity"
    PRECISION = "precision"
    RELEVANCE = "relevance"

class QualityRuleType(str, Enum):
    """Types of quality rules"""
    NULL_CHECK = "null_check"
    RANGE_CHECK = "range_check"
    FORMAT_CHECK = "format_check"
    UNIQUENESS_CHECK = "uniqueness_check"
    REFERENTIAL_INTEGRITY = "referential_integrity"
    CUSTOM_SQL = "custom_sql"
    PATTERN_MATCH = "pattern_match"
    STATISTICAL_OUTLIER = "statistical_outlier"
    BUSINESS_RULE = "business_rule"
    CROSS_REFERENCE = "cross_reference"

class QualityStatus(str, Enum):
    """Quality assessment status"""
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"
    ERROR = "error"
    PENDING = "pending"
    RUNNING = "running"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"

class QualitySeverity(str, Enum):
    """Quality issue severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class QualityScoreMethod(str, Enum):
    """Quality scoring methods"""
    WEIGHTED_AVERAGE = "weighted_average"
    MINIMUM_SCORE = "minimum_score"
    CUSTOM_FORMULA = "custom_formula"
    STATISTICAL_MODEL = "statistical_model"
    AI_BASED = "ai_based"

class QualityTrend(str, Enum):
    """Quality trend directions"""
    IMPROVING = "improving"
    DECLINING = "declining"
    STABLE = "stable"
    VOLATILE = "volatile"
    UNKNOWN = "unknown"

class MonitoringFrequency(str, Enum):
    """Quality monitoring frequencies"""
    REAL_TIME = "real_time"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ON_DEMAND = "on_demand"
    EVENT_DRIVEN = "event_driven"

class AlertThreshold(str, Enum):
    """Alert threshold types"""
    ABSOLUTE_VALUE = "absolute_value"
    PERCENTAGE_CHANGE = "percentage_change"
    STANDARD_DEVIATION = "standard_deviation"
    TREND_BASED = "trend_based"
    CUSTOM_LOGIC = "custom_logic"

class QualityReportType(str, Enum):
    """Quality report types"""
    SUMMARY = "summary"
    DETAILED = "detailed"
    TREND_ANALYSIS = "trend_analysis"
    COMPARATIVE = "comparative"
    DRILL_DOWN = "drill_down"
    EXECUTIVE = "executive"
    TECHNICAL = "technical"
    COMPLIANCE = "compliance"

# ============================================================================
# CORE QUALITY MODELS
# ============================================================================

class DataQualityRule(SQLModel, table=True):
    """Configurable data quality rules"""
    __tablename__ = "data_quality_rules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: str = Field(unique=True, index=True, description="Unique rule identifier")
    rule_name: str = Field(index=True, description="Human-readable rule name")
    rule_type: QualityRuleType = Field(index=True, description="Type of quality rule")
    
    quality_dimension: QualityDimension = Field(index=True, description="Quality dimension addressed")
    description: str = Field(description="Rule description")
    rule_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Rule logic definition")
    
    # Rule Configuration
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Rule parameters")
    thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSONB), description="Quality thresholds")
    severity: QualitySeverity = Field(description="Rule failure severity")
    weight: float = Field(default=1.0, description="Rule weight in overall score")
    
    # Execution Settings
    is_active: bool = Field(default=True, index=True, description="Rule activation status")
    execution_order: int = Field(default=0, description="Rule execution order")
    timeout_seconds: int = Field(default=300, description="Rule execution timeout")
    retry_attempts: int = Field(default=3, description="Retry attempts on failure")
    
    # Business Context
    business_impact: str = Field(description="Business impact description")
    owner: str = Field(description="Rule owner")
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Rule tags")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    created_by: str = Field(description="User who created the rule")
    last_modified_by: Optional[str] = Field(default=None, description="User who last modified")
    
    # Relationships
    assessments: List["QualityAssessment"] = Relationship(back_populates="quality_rule")
    monitoring_configs: List["QualityMonitoringConfig"] = Relationship(
        back_populates="quality_rules",
        sa_relationship_kwargs={"secondary": "quality_rule_monitoring_config_link"}
    )

class QualityAssessment(SQLModel, table=True):
    """Quality assessment results"""
    __tablename__ = "quality_assessments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: str = Field(unique=True, index=True, description="Unique assessment identifier")
    asset_id: str = Field(index=True, description="Catalog asset being assessed")
    rule_id: str = Field(foreign_key="data_quality_rules.rule_id", index=True, description="Quality rule applied")
    
    # Assessment Results
    status: QualityStatus = Field(index=True, description="Assessment status")
    score: Optional[float] = Field(default=None, description="Quality score (0-100)")
    passed: bool = Field(description="Whether assessment passed")
    
    # Metrics
    total_records: int = Field(default=0, description="Total records assessed")
    passed_records: int = Field(default=0, description="Records that passed")
    failed_records: int = Field(default=0, description="Records that failed")
    error_records: int = Field(default=0, description="Records with errors")
    
    # Details
    results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Detailed results")
    anomalies: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Detected anomalies")
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Improvement recommendations")
    
    # Execution Metadata
    execution_time_ms: int = Field(default=0, description="Execution time in milliseconds")
    executed_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Execution timestamp")
    executed_by: str = Field(description="User or system that executed assessment")
    
    # Error Handling
    error_message: Optional[str] = Field(default=None, description="Error message if failed")
    stack_trace: Optional[str] = Field(default=None, description="Stack trace if error occurred")
    
    # Relationships
    quality_rule: Optional[DataQualityRule] = Relationship(back_populates="assessments")
    monitoring_alerts: List["QualityMonitoringAlert"] = Relationship(back_populates="assessment")

class QualityScorecard(SQLModel, table=True):
    """Overall quality scorecard for data assets"""
    __tablename__ = "quality_scorecards"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scorecard_id: str = Field(unique=True, index=True, description="Unique scorecard identifier")
    asset_id: str = Field(index=True, description="Catalog asset identifier")
    asset_type: str = Field(index=True, description="Type of asset")
    
    # Overall Scores
    overall_score: float = Field(description="Overall quality score (0-100)")
    scoring_method: QualityScoreMethod = Field(description="Method used for scoring")
    
    # Dimension Scores
    completeness_score: Optional[float] = Field(default=None, description="Completeness score")
    accuracy_score: Optional[float] = Field(default=None, description="Accuracy score")
    consistency_score: Optional[float] = Field(default=None, description="Consistency score")
    validity_score: Optional[float] = Field(default=None, description="Validity score")
    timeliness_score: Optional[float] = Field(default=None, description="Timeliness score")
    uniqueness_score: Optional[float] = Field(default=None, description="Uniqueness score")
    integrity_score: Optional[float] = Field(default=None, description="Integrity score")
    
    # Trend Analysis
    previous_score: Optional[float] = Field(default=None, description="Previous score for comparison")
    score_change: Optional[float] = Field(default=None, description="Score change from previous")
    trend: QualityTrend = Field(default=QualityTrend.UNKNOWN, description="Score trend")
    
    # Assessment Summary
    total_rules: int = Field(default=0, description="Total rules assessed")
    passed_rules: int = Field(default=0, description="Rules that passed")
    failed_rules: int = Field(default=0, description="Rules that failed")
    warning_rules: int = Field(default=0, description="Rules with warnings")
    
    # Issues Summary
    critical_issues: int = Field(default=0, description="Critical issues count")
    high_issues: int = Field(default=0, description="High severity issues")
    medium_issues: int = Field(default=0, description="Medium severity issues")
    low_issues: int = Field(default=0, description="Low severity issues")
    
    # Metadata
    assessed_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Assessment timestamp")
    assessed_by: str = Field(description="User or system that performed assessment")
    valid_until: Optional[datetime] = Field(default=None, description="Score validity expiration")
    
    # Custom Properties
    custom_metrics: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom quality metrics")
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Scorecard tags")

class QualityMonitoringConfig(SQLModel, table=True):
    """Quality monitoring configuration"""
    __tablename__ = "quality_monitoring_configs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    config_id: str = Field(unique=True, index=True, description="Unique configuration identifier")
    config_name: str = Field(index=True, description="Configuration name")
    
    # Monitoring Scope
    asset_ids: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Assets to monitor")
    rule_ids: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Rules to apply")
    
    # Schedule Configuration
    frequency: MonitoringFrequency = Field(description="Monitoring frequency")
    cron_expression: Optional[str] = Field(default=None, description="Cron expression for custom schedules")
    start_time: Optional[datetime] = Field(default=None, description="Monitoring start time")
    end_time: Optional[datetime] = Field(default=None, description="Monitoring end time")
    
    # Alert Configuration
    enable_alerts: bool = Field(default=True, description="Enable alert generation")
    alert_thresholds: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Alert threshold configuration")
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Notification channels")
    
    # Advanced Settings
    parallel_execution: bool = Field(default=True, description="Enable parallel execution")
    max_concurrent_assessments: int = Field(default=5, description="Maximum concurrent assessments")
    timeout_minutes: int = Field(default=30, description="Monitoring timeout in minutes")
    
    # Status
    is_active: bool = Field(default=True, index=True, description="Configuration status")
    last_execution: Optional[datetime] = Field(default=None, description="Last execution timestamp")
    next_execution: Optional[datetime] = Field(default=None, description="Next scheduled execution")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    created_by: str = Field(description="User who created configuration")
    
    # Relationships
    quality_rules: List[DataQualityRule] = Relationship(
        back_populates="monitoring_configs",
        sa_relationship_kwargs={"secondary": "quality_rule_monitoring_config_link"}
    )
    alerts: List["QualityMonitoringAlert"] = Relationship(back_populates="monitoring_config")


# ============================================================================
# INTERMEDIATE TABLES FOR MANY-TO-MANY RELATIONSHIPS
# ============================================================================

class QualityRuleMonitoringConfigLink(SQLModel, table=True):
    """Intermediate table for many-to-many relationship between quality rules and monitoring configs"""
    __tablename__ = "quality_rule_monitoring_config_link"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: str = Field(foreign_key="data_quality_rules.rule_id", index=True)
    config_id: str = Field(foreign_key="quality_monitoring_configs.config_id", index=True)
    
    # Additional metadata
    is_active: bool = Field(default=True, description="Relationship activation status")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Relationship creation timestamp")
    created_by: str = Field(description="User who created the relationship")
    
    # Table constraints
    __table_args__ = (
        UniqueConstraint('rule_id', 'config_id', name='uq_quality_rule_monitoring_config'),
    )

class QualityMonitoringAlert(SQLModel, table=True):
    """Quality monitoring alerts"""
    __tablename__ = "quality_monitoring_alerts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    alert_id: str = Field(unique=True, index=True, description="Unique alert identifier")
    config_id: str = Field(foreign_key="quality_monitoring_configs.config_id", index=True, description="Monitoring configuration")
    assessment_id: Optional[str] = Field(foreign_key="quality_assessments.assessment_id", index=True, description="Related assessment")
    
    # Alert Details
    alert_type: str = Field(index=True, description="Type of alert")
    severity: QualitySeverity = Field(index=True, description="Alert severity")
    title: str = Field(description="Alert title")
    message: str = Field(description="Alert message")
    
    # Context
    asset_id: str = Field(index=True, description="Affected asset")
    rule_id: Optional[str] = Field(index=True, description="Related quality rule")
    metric_name: str = Field(description="Metric that triggered alert")
    current_value: float = Field(description="Current metric value")
    threshold_value: float = Field(description="Threshold that was breached")
    
    # Status
    status: str = Field(default="open", index=True, description="Alert status")
    acknowledged: bool = Field(default=False, description="Alert acknowledgment status")
    acknowledged_by: Optional[str] = Field(default=None, description="User who acknowledged")
    acknowledged_at: Optional[datetime] = Field(default=None, description="Acknowledgment timestamp")
    
    # Resolution
    resolved: bool = Field(default=False, description="Alert resolution status")
    resolved_by: Optional[str] = Field(default=None, description="User who resolved")
    resolved_at: Optional[datetime] = Field(default=None, description="Resolution timestamp")
    resolution_notes: Optional[str] = Field(default=None, description="Resolution notes")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Alert creation timestamp")
    alert_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Additional alert metadata")
    
    # Relationships
    monitoring_config: Optional[QualityMonitoringConfig] = Relationship(back_populates="alerts")
    assessment: Optional[QualityAssessment] = Relationship(back_populates="monitoring_alerts")

class QualityReport(SQLModel, table=True):
    """Quality reports and analytics"""
    __tablename__ = "quality_reports"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: str = Field(unique=True, index=True, description="Unique report identifier")
    report_name: str = Field(index=True, description="Report name")
    report_type: QualityReportType = Field(index=True, description="Type of report")
    
    # Report Scope
    asset_ids: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Assets included in report")
    date_range: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSONB), description="Report date range")
    filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Report filters")
    
    # Report Data
    summary: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Report summary")
    detailed_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Detailed results")
    charts_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Chart data")
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Quality recommendations")
    
    # Report Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Report generation timestamp")
    generated_by: str = Field(description="User who generated report")
    execution_time_ms: int = Field(default=0, description="Report generation time")
    
    # Distribution
    recipients: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Report recipients")
    delivery_channels: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Delivery channels")
    
    # Status
    status: str = Field(default="completed", index=True, description="Report status")
    file_path: Optional[str] = Field(default=None, description="Generated report file path")
    file_size_bytes: Optional[int] = Field(default=None, description="Report file size")

# ============================================================================
# API MODELS
# ============================================================================

class QualityRuleCreate(BaseModel):
    """Create quality rule request"""
    rule_name: str
    rule_type: QualityRuleType
    quality_dimension: QualityDimension
    description: str
    rule_definition: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = None
    thresholds: Optional[Dict[str, float]] = None
    severity: QualitySeverity = QualitySeverity.MEDIUM
    weight: float = 1.0
    business_impact: str
    owner: str
    tags: Optional[List[str]] = None

class QualityRuleUpdate(BaseModel):
    """Update quality rule request"""
    rule_name: Optional[str] = None
    description: Optional[str] = None
    rule_definition: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    thresholds: Optional[Dict[str, float]] = None
    severity: Optional[QualitySeverity] = None
    weight: Optional[float] = None
    is_active: Optional[bool] = None
    business_impact: Optional[str] = None
    tags: Optional[List[str]] = None

class QualityAssessmentRequest(BaseModel):
    """Quality assessment request"""
    asset_id: str
    rule_ids: Optional[List[str]] = None
    custom_parameters: Optional[Dict[str, Any]] = None
    include_recommendations: bool = True
    generate_report: bool = False

class QualityMonitoringSetup(BaseModel):
    """Quality monitoring setup request"""
    config_name: str
    asset_ids: List[str]
    rule_ids: List[str]
    frequency: MonitoringFrequency
    cron_expression: Optional[str] = None
    enable_alerts: bool = True
    alert_thresholds: Optional[Dict[str, Any]] = None
    notification_channels: Optional[List[str]] = None

class QualityReportRequest(BaseModel):
    """Quality report generation request"""
    report_name: str
    report_type: QualityReportType
    asset_ids: List[str]
    date_range: Dict[str, str]
    filters: Optional[Dict[str, Any]] = None
    include_charts: bool = True
    include_recommendations: bool = True
    recipients: Optional[List[str]] = None

class QualityMetrics(BaseModel):
    """Quality metrics response"""
    overall_score: float
    dimension_scores: Dict[str, float]
    trend: QualityTrend
    issues_summary: Dict[str, int]
    assessment_summary: Dict[str, int]
    last_assessed: datetime
    recommendations: List[str]

class QualityDashboard(BaseModel):
    """Quality dashboard data"""
    summary_metrics: Dict[str, Any]
    trend_data: List[Dict[str, Any]]
    top_issues: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]
    recent_assessments: List[Dict[str, Any]]
    recommendations: List[str]
    generated_at: datetime

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class QualityRuleResponse(BaseModel):
    """Quality rule response"""
    rule_id: str
    rule_name: str
    rule_type: QualityRuleType
    quality_dimension: QualityDimension
    description: str
    severity: QualitySeverity
    weight: float
    is_active: bool
    owner: str
    created_at: datetime
    updated_at: Optional[datetime]
    
class QualityAssessmentResponse(BaseModel):
    """Quality assessment response"""
    assessment_id: str
    asset_id: str
    rule_id: str
    status: QualityStatus
    score: Optional[float]
    passed: bool
    total_records: int
    passed_records: int
    failed_records: int
    execution_time_ms: int
    executed_at: datetime
    recommendations: List[str]

class QualityScorecardResponse(BaseModel):
    """Quality scorecard response"""
    scorecard_id: str
    asset_id: str
    overall_score: float
    dimension_scores: Dict[str, Optional[float]]
    trend: QualityTrend
    issues_summary: Dict[str, int]
    assessment_summary: Dict[str, int]
    assessed_at: datetime
    valid_until: Optional[datetime]