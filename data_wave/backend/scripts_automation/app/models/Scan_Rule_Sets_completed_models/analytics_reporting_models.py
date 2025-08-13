"""
Analytics and Reporting Models for Scan-Rule-Sets Group
======================================================

Advanced analytics and reporting system for scan rule governance with enterprise features:
- Comprehensive usage analytics and behavior tracking
- Advanced trend analysis with predictive modeling
- ROI metrics and business value calculation
- Compliance integration with regulatory frameworks
- Performance monitoring and optimization insights
- User behavior analytics and recommendation engines
- Business intelligence and executive dashboards
- Advanced reporting with customizable visualizations

Production Features:
- Real-time analytics processing with streaming data
- Machine learning-powered trend prediction
- Advanced statistical analysis and correlation detection
- Multi-dimensional data aggregation and rollups
- Enterprise-grade reporting with scheduled delivery
- Advanced visualization and interactive dashboards
- Integration with external BI tools and data warehouses
- Comprehensive audit trails and compliance reporting
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
import uuid

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text, ARRAY
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, DECIMAL
from pydantic import BaseModel, validator

# ===================== ENUMS AND TYPES =====================

class AnalyticsType(str, Enum):
    """Analytics data types"""
    USAGE_METRICS = "usage_metrics"
    PERFORMANCE_METRICS = "performance_metrics"
    QUALITY_METRICS = "quality_metrics"
    COMPLIANCE_METRICS = "compliance_metrics"
    BUSINESS_METRICS = "business_metrics"
    USER_BEHAVIOR = "user_behavior"
    SYSTEM_HEALTH = "system_health"
    SECURITY_METRICS = "security_metrics"

class TrendDirection(str, Enum):
    """Trend direction indicators"""
    UPWARD = "upward"
    DOWNWARD = "downward"
    STABLE = "stable"
    VOLATILE = "volatile"
    SEASONAL = "seasonal"
    CYCLICAL = "cyclical"
    ANOMALOUS = "anomalous"
    EMERGING = "emerging"

class MetricGranularity(str, Enum):
    """Metric aggregation granularity"""
    MINUTE = "minute"
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"
    REAL_TIME = "real_time"

class ROICategory(str, Enum):
    """ROI calculation categories"""
    COST_SAVINGS = "cost_savings"
    PRODUCTIVITY_GAINS = "productivity_gains"
    RISK_REDUCTION = "risk_reduction"
    COMPLIANCE_VALUE = "compliance_value"
    QUALITY_IMPROVEMENT = "quality_improvement"
    TIME_TO_MARKET = "time_to_market"
    OPERATIONAL_EFFICIENCY = "operational_efficiency"
    REVENUE_GENERATION = "revenue_generation"

class ComplianceFramework(str, Enum):
    """Compliance framework types"""
    GDPR = "gdpr"
    CCPA = "ccpa"
    HIPAA = "hipaa"
    SOX = "sox"
    PCI_DSS = "pci_dss"
    ISO_27001 = "iso_27001"
    NIST = "nist"
    SOC2 = "soc2"
    CUSTOM = "custom"

class ComplianceStatus(str, Enum):
    """Compliance status levels"""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIALLY_COMPLIANT = "partially_compliant"
    UNDER_REVIEW = "under_review"
    REMEDIATION_REQUIRED = "remediation_required"
    EXEMPT = "exempt"
    NOT_APPLICABLE = "not_applicable"

# ===================== CORE MODELS =====================

class UsageAnalytics(SQLModel, table=True):
    """
    Comprehensive usage analytics for scan rules and system components.
    Tracks user behavior, system utilization, and performance metrics.
    """
    __tablename__ = "usage_analytics"
    
    # Primary identification
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    analytics_type: AnalyticsType = Field(description="Type of analytics data")
    
    # Entity tracking
    entity_type: str = Field(description="Type of entity being tracked (rule, user, system, etc.)")
    entity_id: Optional[str] = Field(default=None, description="ID of the tracked entity")
    entity_name: Optional[str] = Field(default=None, description="Name of the tracked entity")
    
    # User and context information
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    session_id: Optional[str] = Field(default=None, description="User session identifier")
    organization_id: Optional[uuid.UUID] = Field(default=None, description="Organization context")
    
    # Temporal tracking
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")
    duration_seconds: Optional[float] = Field(default=None, description="Duration of tracked activity")
    
    # Usage metrics
    usage_count: int = Field(default=1, description="Number of times used")
    frequency_score: float = Field(default=0.0, description="Usage frequency score")
    popularity_rank: Optional[int] = Field(default=None, description="Popularity ranking")
    
    # Performance metrics
    response_time_ms: Optional[float] = Field(default=None, description="Response time in milliseconds")
    throughput_ops_sec: Optional[float] = Field(default=None, description="Operations per second")
    success_rate: Optional[float] = Field(default=None, ge=0, le=1, description="Success rate (0-1)")
    error_rate: Optional[float] = Field(default=None, ge=0, le=1, description="Error rate (0-1)")
    
    # Resource utilization
    cpu_usage_percent: Optional[float] = Field(default=None, ge=0, le=100, description="CPU usage percentage")
    memory_usage_mb: Optional[float] = Field(default=None, description="Memory usage in MB")
    disk_io_ops: Optional[int] = Field(default=None, description="Disk I/O operations")
    network_bytes: Optional[int] = Field(default=None, description="Network bytes transferred")
    
    # Business metrics
    business_value_score: Optional[float] = Field(default=None, description="Business value score")
    cost_impact: Optional[float] = Field(default=None, description="Cost impact in currency units")
    productivity_gain: Optional[float] = Field(default=None, description="Productivity gain percentage")
    
    # Detailed metrics and metadata
    metrics_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    analytics_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    
    # System context
    environment: Optional[str] = Field(default=None, description="Environment context (prod, dev, test)")
    version: Optional[str] = Field(default=None, description="System/component version")
    region: Optional[str] = Field(default=None, description="Geographic region")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Indexes for performance
    __table_args__ = (
        Index("idx_usage_analytics_type_timestamp", "analytics_type", "timestamp"),
        Index("idx_usage_analytics_entity", "entity_type", "entity_id"),
        Index("idx_usage_analytics_user_timestamp", "user_id", "timestamp"),
        Index("idx_usage_analytics_organization", "organization_id"),
        Index("idx_usage_analytics_environment", "environment"),
    )

class TrendAnalysis(SQLModel, table=True):
    """
    Advanced trend analysis with predictive modeling and pattern recognition.
    Identifies patterns, predicts future trends, and provides insights.
    """
    __tablename__ = "trend_analysis"
    
    # Primary identification
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    trend_name: str = Field(description="Human-readable trend name")
    trend_type: str = Field(description="Type of trend being analyzed")
    
    # Analysis scope
    entity_type: str = Field(description="Type of entity being analyzed")
    entity_ids: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    scope_filter: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal scope
    analysis_start_date: datetime = Field(description="Start date of analysis period")
    analysis_end_date: datetime = Field(description="End date of analysis period")
    granularity: MetricGranularity = Field(description="Analysis granularity")
    
    # Trend characteristics
    trend_direction: TrendDirection = Field(description="Overall trend direction")
    trend_strength: float = Field(ge=0, le=1, description="Strength of the trend (0-1)")
    confidence_score: float = Field(ge=0, le=1, description="Confidence in the analysis (0-1)")
    statistical_significance: float = Field(ge=0, le=1, description="Statistical significance (p-value)")
    
    # Statistical metrics
    correlation_coefficient: Optional[float] = Field(default=None, ge=-1, le=1)
    r_squared: Optional[float] = Field(default=None, ge=0, le=1, description="R-squared value")
    slope: Optional[float] = Field(default=None, description="Trend slope")
    intercept: Optional[float] = Field(default=None, description="Trend intercept")
    
    # Data points and statistics
    data_points_count: int = Field(description="Number of data points analyzed")
    min_value: float = Field(description="Minimum value in dataset")
    max_value: float = Field(description="Maximum value in dataset")
    mean_value: float = Field(description="Mean value")
    median_value: float = Field(description="Median value")
    std_deviation: float = Field(description="Standard deviation")
    
    # Seasonality and patterns
    seasonal_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    cyclical_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    anomalies_detected: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Predictions and forecasting
    forecast_horizon_days: Optional[int] = Field(default=None, description="Days ahead forecasted")
    predicted_values: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    prediction_intervals: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    forecast_accuracy: Optional[float] = Field(default=None, ge=0, le=1)
    
    # Model information
    algorithm_used: str = Field(description="Algorithm used for analysis")
    model_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    training_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business insights
    business_impact: Optional[str] = Field(default=None, sa_column=Column(Text))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    risk_factors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    opportunities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata and context
    created_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    organization_id: Optional[uuid.UUID] = Field(default=None)
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    trend_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None, description="When analysis expires")

    # Indexes for performance
    __table_args__ = (
        Index("idx_trend_analysis_type_date", "trend_type", "analysis_start_date"),
        Index("idx_trend_analysis_entity", "entity_type"),
        Index("idx_trend_analysis_organization", "organization_id"),
        Index("idx_trend_analysis_created", "created_at"),
    )

class ROIMetrics(SQLModel, table=True):
    """
    Comprehensive ROI calculation and business value metrics.
    Tracks financial impact, business value, and return on investment.
    """
    __tablename__ = "roi_metrics"
    
    # Primary identification
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    metric_name: str = Field(description="Human-readable metric name")
    roi_category: ROICategory = Field(description="Category of ROI calculation")
    
    # Scope and context
    entity_type: str = Field(description="Type of entity being measured")
    entity_id: str = Field(description="ID of the measured entity")
    entity_name: Optional[str] = Field(default=None, description="Name of the measured entity")
    
    # Financial metrics
    investment_amount: float = Field(description="Total investment amount")
    cost_savings: float = Field(default=0.0, description="Cost savings achieved")
    revenue_generated: float = Field(default=0.0, description="Revenue generated")
    cost_avoidance: float = Field(default=0.0, description="Costs avoided")
    
    # ROI calculations
    total_benefit: float = Field(description="Total financial benefit")
    net_benefit: float = Field(description="Net benefit (benefit - investment)")
    roi_percentage: float = Field(description="ROI as percentage")
    payback_period_months: Optional[float] = Field(default=None, description="Payback period in months")
    npv: Optional[float] = Field(default=None, description="Net Present Value")
    irr: Optional[float] = Field(default=None, description="Internal Rate of Return")
    
    # Time-based metrics
    measurement_start_date: datetime = Field(description="Start date of measurement period")
    measurement_end_date: datetime = Field(description="End date of measurement period")
    projection_end_date: Optional[datetime] = Field(default=None, description="End date of projections")
    
    # Productivity metrics
    time_savings_hours: float = Field(default=0.0, description="Time savings in hours")
    productivity_improvement_percent: float = Field(default=0.0, description="Productivity improvement %")
    efficiency_gains: float = Field(default=0.0, description="Efficiency gains score")
    
    # Quality and compliance metrics
    defect_reduction_percent: float = Field(default=0.0, description="Defect reduction %")
    compliance_improvement_score: float = Field(default=0.0, description="Compliance improvement score")
    risk_reduction_value: float = Field(default=0.0, description="Value of risk reduction")
    
    # Business impact
    customer_satisfaction_improvement: Optional[float] = Field(default=None, description="Customer satisfaction improvement")
    employee_satisfaction_improvement: Optional[float] = Field(default=None, description="Employee satisfaction improvement")
    market_share_impact: Optional[float] = Field(default=None, description="Market share impact")
    
    # Calculation methodology
    calculation_method: str = Field(description="Method used for ROI calculation")
    assumptions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    confidence_level: float = Field(ge=0, le=1, description="Confidence in calculations (0-1)")
    data_quality_score: float = Field(ge=0, le=1, description="Quality of underlying data (0-1)")
    
    # Detailed breakdowns
    cost_breakdown: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    benefit_breakdown: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    monthly_projections: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Benchmarking
    industry_benchmark: Optional[float] = Field(default=None, description="Industry benchmark ROI")
    organization_benchmark: Optional[float] = Field(default=None, description="Organization benchmark ROI")
    peer_comparison: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Metadata and context
    created_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    organization_id: Optional[uuid.UUID] = Field(default=None)
    currency: str = Field(default="USD", description="Currency for financial calculations")
    discount_rate: Optional[float] = Field(default=None, description="Discount rate for NPV calculations")
    
    # Validation and approval
    validated: bool = Field(default=False, description="Whether metrics have been validated")
    validated_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    validated_at: Optional[datetime] = Field(default=None)
    
    # Tags and metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    roi_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Indexes for performance
    __table_args__ = (
        Index("idx_roi_metrics_category_entity", "roi_category", "entity_type"),
        Index("idx_roi_metrics_organization", "organization_id"),
        Index("idx_roi_metrics_measurement_period", "measurement_start_date", "measurement_end_date"),
        Index("idx_roi_metrics_created", "created_at"),
    )

class ComplianceIntegration(SQLModel, table=True):
    """
    Comprehensive compliance integration with regulatory frameworks.
    Manages compliance status, assessments, and regulatory reporting.
    """
    __tablename__ = "compliance_integration"
    
    # Primary identification
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    integration_name: str = Field(description="Human-readable integration name")
    framework: ComplianceFramework = Field(description="Compliance framework")
    
    # Scope and applicability
    entity_type: str = Field(description="Type of entity being assessed")
    entity_id: str = Field(description="ID of the assessed entity")
    entity_name: Optional[str] = Field(default=None, description="Name of the assessed entity")
    scope_description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Compliance status
    overall_status: ComplianceStatus = Field(description="Overall compliance status")
    compliance_score: float = Field(ge=0, le=100, description="Compliance score (0-100)")
    last_assessment_date: datetime = Field(description="Date of last assessment")
    next_assessment_due: datetime = Field(description="Next assessment due date")
    
    # Requirements and controls
    total_requirements: int = Field(description="Total number of requirements")
    compliant_requirements: int = Field(description="Number of compliant requirements")
    non_compliant_requirements: int = Field(description="Number of non-compliant requirements")
    partially_compliant_requirements: int = Field(description="Number of partially compliant requirements")
    
    # Detailed compliance tracking
    requirements_status: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    control_mappings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    evidence_links: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Risk and impact assessment
    risk_level: str = Field(description="Overall risk level (low, medium, high, critical)")
    potential_penalties: Optional[float] = Field(default=None, description="Potential financial penalties")
    business_impact: Optional[str] = Field(default=None, sa_column=Column(Text))
    reputation_risk: Optional[str] = Field(default=None, description="Reputation risk level")
    
    # Remediation tracking
    open_findings: int = Field(default=0, description="Number of open findings")
    critical_findings: int = Field(default=0, description="Number of critical findings")
    remediation_plans: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    remediation_status: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timeline and deadlines
    implementation_deadline: Optional[datetime] = Field(default=None, description="Implementation deadline")
    certification_date: Optional[datetime] = Field(default=None, description="Certification date")
    certification_expiry: Optional[datetime] = Field(default=None, description="Certification expiry date")
    
    # Assessment details
    assessor_name: Optional[str] = Field(default=None, description="Name of the assessor")
    assessment_methodology: Optional[str] = Field(default=None, description="Assessment methodology used")
    assessment_scope: Optional[str] = Field(default=None, sa_column=Column(Text))
    assessment_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Documentation and reporting
    compliance_report_url: Optional[str] = Field(default=None, description="URL to compliance report")
    documentation_links: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # External integration
    external_system_id: Optional[str] = Field(default=None, description="ID in external compliance system")
    external_system_name: Optional[str] = Field(default=None, description="Name of external system")
    sync_status: Optional[str] = Field(default=None, description="Synchronization status")
    last_sync_date: Optional[datetime] = Field(default=None, description="Last synchronization date")
    
    # Notifications and alerts
    alert_thresholds: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    notification_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    escalation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata and context
    created_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    organization_id: Optional[uuid.UUID] = Field(default=None)
    business_unit: Optional[str] = Field(default=None, description="Business unit or department")
    geography: Optional[str] = Field(default=None, description="Geographic scope")
    
    # Version and change tracking
    version: str = Field(default="1.0", description="Integration version")
    change_log: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Tags and metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    compliance_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Indexes for performance
    __table_args__ = (
        Index("idx_compliance_framework_status", "framework", "overall_status"),
        Index("idx_compliance_entity", "entity_type", "entity_id"),
        Index("idx_compliance_organization", "organization_id"),
        Index("idx_compliance_assessment_date", "last_assessment_date"),
        Index("idx_compliance_next_due", "next_assessment_due"),
        UniqueConstraint("entity_type", "entity_id", "framework", name="uq_compliance_entity_framework"),
    )

# ===================== REQUEST/RESPONSE MODELS =====================

class UsageAnalyticsCreate(BaseModel):
    """Request model for creating usage analytics"""
    analytics_type: AnalyticsType
    entity_type: str
    entity_id: Optional[str] = None
    entity_name: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    session_id: Optional[str] = None
    duration_seconds: Optional[float] = None
    usage_count: int = 1
    response_time_ms: Optional[float] = None
    success_rate: Optional[float] = None
    metrics_data: Dict[str, Any] = {}
    create_metadata: Dict[str, Any] = {}
    tags: List[str] = []

class UsageAnalyticsResponse(BaseModel):
    """Response model for usage analytics"""
    id: uuid.UUID
    analytics_type: AnalyticsType
    entity_type: str
    entity_id: Optional[str]
    timestamp: datetime
    usage_count: int
    frequency_score: float
    metrics_data: Dict[str, Any]
    created_at: datetime

class TrendAnalysisCreate(BaseModel):
    """Request model for creating trend analysis"""
    trend_name: str
    trend_type: str
    entity_type: str
    entity_ids: List[str] = []
    analysis_start_date: datetime
    analysis_end_date: datetime
    granularity: MetricGranularity
    scope_filter: Dict[str, Any] = {}
    algorithm_used: str = "linear_regression"
    model_parameters: Dict[str, Any] = {}
    tags: List[str] = []

class TrendAnalysisResponse(BaseModel):
    """Response model for trend analysis"""
    id: uuid.UUID
    trend_name: str
    trend_direction: TrendDirection
    trend_strength: float
    confidence_score: float
    data_points_count: int
    predicted_values: List[Dict[str, Any]]
    business_impact: Optional[str]
    recommendations: List[str]
    created_at: datetime

class ROIMetricsCreate(BaseModel):
    """Request model for creating ROI metrics"""
    metric_name: str
    roi_category: ROICategory
    entity_type: str
    entity_id: str
    entity_name: Optional[str] = None
    investment_amount: float
    cost_savings: float = 0.0
    revenue_generated: float = 0.0
    measurement_start_date: datetime
    measurement_end_date: datetime
    calculation_method: str
    currency: str = "USD"
    assumptions: List[str] = []
    tags: List[str] = []

class ROIMetricsResponse(BaseModel):
    """Response model for ROI metrics"""
    id: uuid.UUID
    metric_name: str
    roi_category: ROICategory
    total_benefit: float
    net_benefit: float
    roi_percentage: float
    payback_period_months: Optional[float]
    confidence_level: float
    data_quality_score: float
    created_at: datetime

class ComplianceIntegrationCreate(BaseModel):
    """Request model for creating compliance integration"""
    integration_name: str
    framework: ComplianceFramework
    entity_type: str
    entity_id: str
    entity_name: Optional[str] = None
    scope_description: Optional[str] = None
    total_requirements: int
    assessor_name: Optional[str] = None
    assessment_methodology: Optional[str] = None
    implementation_deadline: Optional[datetime] = None
    tags: List[str] = []

class ComplianceIntegrationResponse(BaseModel):
    """Response model for compliance integration"""
    id: uuid.UUID
    integration_name: str
    framework: ComplianceFramework
    overall_status: ComplianceStatus
    compliance_score: float
    last_assessment_date: datetime
    next_assessment_due: datetime
    total_requirements: int
    compliant_requirements: int
    open_findings: int
    risk_level: str
    created_at: datetime

# ===================== ANALYTICS AGGREGATION MODELS =====================

class AnalyticsSummary(BaseModel):
    """Summary analytics across multiple dimensions"""
    total_entities: int
    total_events: int
    average_usage_frequency: float
    top_entities: List[Dict[str, Any]]
    performance_summary: Dict[str, float]
    trend_indicators: Dict[str, Any]
    period_start: datetime
    period_end: datetime

class ROIDashboard(BaseModel):
    """ROI dashboard summary"""
    total_investment: float
    total_benefit: float
    overall_roi_percentage: float
    category_breakdown: Dict[ROICategory, float]
    monthly_trends: List[Dict[str, Any]]
    top_performing_entities: List[Dict[str, Any]]
    projected_returns: Dict[str, Any]

class ComplianceDashboard(BaseModel):
    """Compliance dashboard summary"""
    overall_compliance_score: float
    framework_status: Dict[ComplianceFramework, ComplianceStatus]
    critical_findings: int
    upcoming_deadlines: List[Dict[str, Any]]
    risk_distribution: Dict[str, int]
    remediation_progress: Dict[str, Any]

# ===================== MARKETPLACE ANALYTICS MODELS =====================

class MarketplaceAnalytics(SQLModel, table=True):
    """
    Advanced marketplace analytics for rule marketplace operations.
    Tracks marketplace performance, user engagement, and business metrics.
    """
    __tablename__ = "marketplace_analytics"
    
    # Primary identification
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    marketplace_id: str = Field(unique=True, index=True, description="Marketplace identifier")
    organization_id: Optional[uuid.UUID] = Field(default=None, foreign_key="organizations.id")
    
    # Marketplace performance metrics
    total_rules_published: int = Field(default=0, description="Total rules published")
    total_rules_downloaded: int = Field(default=0, description="Total rules downloaded")
    total_revenue_generated: float = Field(default=0.0, description="Total revenue generated")
    total_users_registered: int = Field(default=0, description="Total registered users")
    total_organizations: int = Field(default=0, description="Total organizations")
    
    # User engagement metrics
    daily_active_users: int = Field(default=0, description="Daily active users")
    monthly_active_users: int = Field(default=0, description="Monthly active users")
    user_retention_rate: float = Field(default=0.0, ge=0, le=1, description="User retention rate")
    average_session_duration: float = Field(default=0.0, description="Average session duration in minutes")
    
    # Rule performance metrics
    top_downloaded_rules: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    top_rated_rules: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    average_rule_rating: float = Field(default=0.0, ge=0, le=5, description="Average rule rating")
    rule_quality_score: float = Field(default=0.0, ge=0, le=100, description="Overall rule quality score")
    
    # Business metrics
    conversion_rate: float = Field(default=0.0, ge=0, le=1, description="Visitor to user conversion rate")
    average_revenue_per_user: float = Field(default=0.0, description="Average revenue per user")
    customer_lifetime_value: float = Field(default=0.0, description="Customer lifetime value")
    churn_rate: float = Field(default=0.0, ge=0, le=1, description="User churn rate")
    
    # Marketplace health metrics
    rule_approval_rate: float = Field(default=0.0, ge=0, le=1, description="Rule approval rate")
    average_review_time: float = Field(default=0.0, description="Average review time in hours")
    support_ticket_volume: int = Field(default=0, description="Support ticket volume")
    marketplace_uptime: float = Field(default=100.0, ge=0, le=100, description="Marketplace uptime percentage")
    
    # Geographic and demographic data
    geographic_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    industry_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    user_role_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance tracking
    response_time_avg: float = Field(default=0.0, description="Average response time in ms")
    throughput_requests_per_sec: float = Field(default=0.0, description="Requests per second")
    error_rate: float = Field(default=0.0, ge=0, le=1, description="Error rate percentage")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_calculated: datetime = Field(default_factory=datetime.utcnow)
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_marketplace_analytics_org", "organization_id"),
        Index("idx_marketplace_analytics_updated", "updated_at"),
        Index("idx_marketplace_analytics_performance", "rule_quality_score", "user_retention_rate"),
    )
    
    class Config:
        arbitrary_types_allowed = True

class UsageMetrics(SQLModel, table=True):
    """
    Comprehensive usage metrics for marketplace rules and services.
    Tracks individual rule usage, user behavior, and performance indicators.
    """
    __tablename__ = "usage_metrics"
    
    # Primary identification
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    rule_id: str = Field(index=True, description="Rule identifier")
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id", index=True)
    organization_id: Optional[uuid.UUID] = Field(default=None, foreign_key="organizations.id", index=True)
    
    # Usage tracking
    usage_count: int = Field(default=1, description="Number of times used")
    first_used_at: datetime = Field(default_factory=datetime.utcnow, description="First usage timestamp")
    last_used_at: datetime = Field(default_factory=datetime.utcnow, description="Last usage timestamp")
    total_usage_time: float = Field(default=0.0, description="Total usage time in seconds")
    
    # User behavior metrics
    session_count: int = Field(default=1, description="Number of sessions")
    average_session_duration: float = Field(default=0.0, description="Average session duration")
    feature_usage_pattern: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    user_satisfaction_score: Optional[float] = Field(default=None, ge=1, le=5, description="User satisfaction score")
    
    # Performance metrics
    execution_time_avg: float = Field(default=0.0, description="Average execution time")
    success_rate: float = Field(default=1.0, ge=0, le=1, description="Success rate percentage")
    error_count: int = Field(default=0, description="Total error count")
    error_types: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    
    # Business impact metrics
    time_saved_hours: float = Field(default=0.0, description="Time saved in hours")
    cost_savings: float = Field(default=0.0, description="Cost savings in currency units")
    productivity_gain: float = Field(default=0.0, description="Productivity gain percentage")
    business_value_score: Optional[float] = Field(default=None, ge=0, le=10, description="Business value score")
    
    # Context and environment
    environment: str = Field(default="production", description="Usage environment")
    version: str = Field(default="1.0", description="Rule version")
    platform: Optional[str] = Field(default=None, description="Platform used")
    integration_method: Optional[str] = Field(default=None, description="Integration method")
    
    # Advanced analytics
    usage_trends: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    peak_usage_times: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    seasonal_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    user_segments: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    
    # Quality and feedback
    bug_reports: int = Field(default=0, description="Number of bug reports")
    feature_requests: int = Field(default=0, description="Number of feature requests")
    user_feedback: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    improvement_suggestions: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_usage_metrics_rule_user", "rule_id", "user_id"),
        Index("idx_usage_metrics_organization", "organization_id"),
        Index("idx_usage_metrics_last_used", "last_used_at"),
        Index("idx_usage_metrics_success_rate", "success_rate"),
    )
    
    class Config:
        arbitrary_types_allowed = True

# ===================== ADDITIONAL ENUMS =====================

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# ===================== REQUEST MODELS =====================

class AnalyticsRequest(BaseModel):
    """Request model for analytics generation"""
    analytics_type: str = Field(description="Type of analytics to generate")
    entity_type: Optional[str] = Field(default=None, description="Entity type to analyze")
    entity_id: Optional[str] = Field(default=None, description="Entity ID to analyze")
    time_range: Optional[str] = Field(default="30d", description="Time range for analysis")
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional filters")
    include_metadata: bool = Field(default=True, description="Include metadata in response")

class TrendAnalysisRequest(BaseModel):
    """Request model for trend analysis"""
    metric_name: str = Field(description="Metric to analyze")
    time_period: str = Field(default="monthly", description="Time period for analysis")
    include_forecast: bool = Field(default=False, description="Include forecasting")
    confidence_level: float = Field(default=0.95, ge=0.5, le=0.99, description="Confidence level")

class ROICalculationRequest(BaseModel):
    """Request model for ROI calculations"""
    investment_amount: float = Field(description="Investment amount")
    time_period: str = Field(default="yearly", description="Time period for ROI calculation")
    include_intangibles: bool = Field(default=True, description="Include intangible benefits")
    discount_rate: float = Field(default=0.1, description="Discount rate for NPV")

# ===================== EXPORT LIST =====================

__all__ = [
    # Core Models
    "UsageAnalytics", "TrendAnalysis", "ROIMetrics", "ComplianceIntegration",
    
    # Request/Response Models
    "UsageAnalyticsCreate", "UsageAnalyticsResponse", "TrendAnalysisCreate", "TrendAnalysisResponse",
    "ROIMetricsCreate", "ROIMetricsResponse", "ComplianceIntegrationCreate", "ComplianceIntegrationResponse",
    
    # Analytics Aggregation Models
    "AnalyticsSummary", "ROIDashboard", "ComplianceDashboard",
    
    # Marketplace Analytics Models
    "MarketplaceAnalytics", "UsageMetrics",
    
    # Additional Request Models
    "AnalyticsRequest", "TrendAnalysisRequest", "ROICalculationRequest",
    
    # Enums
    "AnalyticsType", "MetricGranularity", "TrendDirection", "ROICategory", "ComplianceFramework", "ComplianceStatus", "AlertSeverity"
]