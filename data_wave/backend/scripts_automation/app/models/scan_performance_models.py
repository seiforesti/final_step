"""
Enterprise Scan Performance Models
Comprehensive performance models for enterprise-grade scan monitoring and optimization.
Supports real-time monitoring, performance analytics, bottleneck detection,
resource utilization tracking, and AI-powered optimization recommendations.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator
from sqlmodel import Column, Field, Relationship, SQLModel, ARRAY, JSON as JSONB, String

# ============================================================================
# ENUMS
# ============================================================================

class PerformanceMetricType(str, Enum):
    """Types of performance metrics"""
    THROUGHPUT = "throughput"
    LATENCY = "latency"
    ERROR_RATE = "error_rate"
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    DISK_USAGE = "disk_usage"
    NETWORK_USAGE = "network_usage"
    QUEUE_SIZE = "queue_size"
    RESPONSE_TIME = "response_time"
    CONCURRENCY = "concurrency"
    SUCCESS_RATE = "success_rate"
    RESOURCE_EFFICIENCY = "resource_efficiency"
    # Backward-compatible aliases used by services
    DISK_IO = "disk_usage"
    NETWORK_IO = "network_usage"
    QUEUE_LENGTH = "queue_size"
    EXECUTION_TIME = "response_time"

class PerformanceStatus(str, Enum):
    """Performance status levels"""
    OPTIMAL = "optimal"
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"
    DEGRADED = "degraded"
    UNKNOWN = "unknown"

class BottleneckType(str, Enum):
    """Types of performance bottlenecks"""
    CPU = "cpu"
    MEMORY = "memory"
    DISK_IO = "disk_io"
    NETWORK_IO = "network_io"
    DATABASE = "database"
    QUEUE_CONGESTION = "queue_congestion"
    CONNECTION_LIMIT = "connection_limit"
    THREAD_POOL = "thread_pool"
    DEPENDENCY = "dependency"
    CONFIGURATION = "configuration"
    RESOURCE_LOCK = "resource_lock"
    EXTERNAL_SERVICE = "external_service"

class OptimizationType(str, Enum):
    """Types of optimizations"""
    RESOURCE_ALLOCATION = "resource_allocation"
    CACHING = "caching"
    PARALLELIZATION = "parallelization"
    LOAD_BALANCING = "load_balancing"
    QUEUE_MANAGEMENT = "queue_management"
    CONNECTION_POOLING = "connection_pooling"
    BATCH_PROCESSING = "batch_processing"
    COMPRESSION = "compression"
    INDEXING = "indexing"
    PREFETCHING = "prefetching"
    CIRCUIT_BREAKING = "circuit_breaking"
    RATE_LIMITING = "rate_limiting"

class MonitoringScope(str, Enum):
    """Monitoring scope levels"""
    GLOBAL = "global"
    SYSTEM = "system"
    SERVICE = "service"
    WORKFLOW = "workflow"
    SCAN = "scan"
    TASK = "task"
    OPERATION = "operation"
    COMPONENT = "component"
    RESOURCE = "resource"

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
    EMERGENCY = "emergency"
    # Backward-compatible aliases used in routes
    LOW = "warning"
    MEDIUM = "error"
    HIGH = "critical"
    SEVERE = "emergency"

class ResourceType(str, Enum):
    """Types of system resources"""
    CPU = "cpu"
    MEMORY = "memory"
    DISK = "disk"
    NETWORK = "network"
    DATABASE_CONNECTION = "database_connection"
    THREAD = "thread"
    PROCESS = "process"
    FILE_HANDLE = "file_handle"
    SOCKET = "socket"
    CACHE = "cache"

class TrendDirection(str, Enum):
    """Performance trend directions"""
    IMPROVING = "improving"
    DEGRADING = "degrading"
    STABLE = "stable"
    VOLATILE = "volatile"
    CYCLICAL = "cyclical"
    ANOMALOUS = "anomalous"

class BenchmarkType(str, Enum):
    """Performance benchmark types"""
    BASELINE = "baseline"
    TARGET = "target"
    INDUSTRY_STANDARD = "industry_standard"
    HISTORICAL_BEST = "historical_best"
    COMPETITOR = "competitor"
    SLA = "sla"

# ============================================================================
# CORE PERFORMANCE MODELS
# ============================================================================

class ScanPerformanceMetric(SQLModel, table=True):
    """Real-time scan performance metrics"""
    __tablename__ = "scan_performance_metrics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str = Field(unique=True, index=True, description="Unique metric identifier")
    metric_name: str = Field(index=True, description="Metric name")
    metric_type: PerformanceMetricType = Field(index=True, description="Type of metric")
    
    # Scope and Context
    scope: MonitoringScope = Field(index=True, description="Monitoring scope")
    resource_id: str = Field(index=True, description="Resource being monitored")
    resource_type: ResourceType = Field(index=True, description="Type of resource")
    component: str = Field(index=True, description="System component")
    
    # Metric Values
    current_value: float = Field(description="Current metric value")
    previous_value: Optional[float] = Field(default=None, description="Previous metric value")
    min_value: Optional[float] = Field(default=None, description="Minimum recorded value")
    max_value: Optional[float] = Field(default=None, description="Maximum recorded value")
    average_value: Optional[float] = Field(default=None, description="Average value")
    
    # Thresholds
    warning_threshold: Optional[float] = Field(default=None, description="Warning threshold")
    critical_threshold: Optional[float] = Field(default=None, description="Critical threshold")
    target_value: Optional[float] = Field(default=None, description="Target/optimal value")
    
    # Status and Trends
    status: PerformanceStatus = Field(index=True, description="Current performance status")
    trend: TrendDirection = Field(description="Performance trend")
    change_percentage: Optional[float] = Field(default=None, description="Percentage change from previous")
    
    # Metadata
    unit: str = Field(description="Metric unit (e.g., %, MB/s, ms)")
    description: Optional[str] = Field(default=None, description="Metric description")
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Metric tags")
    
    # Timing
    measured_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Measurement timestamp")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    # Relationships
    performance_alerts: List["ScanPerformanceAlert"] = Relationship(back_populates="metric")
    historical_data: List["PerformanceHistory"] = Relationship(back_populates="metric")

class PerformanceHistory(SQLModel, table=True):
    """Historical performance data"""
    __tablename__ = "performance_history"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    history_id: str = Field(unique=True, index=True, description="Unique history record identifier")
    metric_id: str = Field(foreign_key="scan_performance_metrics.metric_id", index=True, description="Associated metric")
    
    # Historical Values
    value: float = Field(description="Metric value at this time")
    aggregated_value: Optional[float] = Field(default=None, description="Aggregated value (e.g., hourly avg)")
    sample_count: int = Field(default=1, description="Number of samples in aggregation")
    
    # Context
    context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Contextual information")
    resource_state: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource state snapshot")
    
    # Timing
    recorded_at: datetime = Field(index=True, description="Recording timestamp")
    aggregation_period: Optional[str] = Field(default=None, description="Aggregation period (1m, 5m, 1h, etc.)")
    
    # Quality
    data_quality: float = Field(default=1.0, description="Data quality score (0-1)")
    is_anomaly: bool = Field(default=False, description="Anomaly detection flag")
    confidence_score: Optional[float] = Field(default=None, description="Confidence in measurement")
    
    # Relationships
    metric: Optional[ScanPerformanceMetric] = Relationship(back_populates="historical_data")

class PerformanceBottleneck(SQLModel, table=True):
    """Detected performance bottlenecks"""
    __tablename__ = "performance_bottlenecks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    bottleneck_id: str = Field(unique=True, index=True, description="Unique bottleneck identifier")
    bottleneck_name: str = Field(index=True, description="Bottleneck name")
    bottleneck_type: BottleneckType = Field(index=True, description="Type of bottleneck")
    
    # Detection Details
    detected_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Detection timestamp")
    severity: AlertSeverity = Field(index=True, description="Bottleneck severity")
    confidence: float = Field(description="Detection confidence (0-1)")
    
    # Location and Context
    component: str = Field(index=True, description="Affected component")
    resource_id: str = Field(index=True, description="Affected resource")
    scope: MonitoringScope = Field(description="Bottleneck scope")
    
    # Impact Analysis
    performance_impact: float = Field(description="Performance impact percentage")
    affected_operations: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Affected operations")
    downstream_impact: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Downstream impact analysis")
    
    # Root Cause
    root_cause: str = Field(description="Root cause description")
    contributing_factors: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Contributing factors")
    evidence: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Detection evidence")
    
    # Resolution
    status: str = Field(default="active", index=True, description="Bottleneck status")
    resolution_status: Optional[str] = Field(default=None, description="Resolution status")
    resolution_time: Optional[datetime] = Field(default=None, description="Resolution timestamp")
    resolution_notes: Optional[str] = Field(default=None, description="Resolution notes")
    
    # Recommendations
    recommended_actions: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Recommended actions")
    priority: int = Field(default=5, description="Resolution priority (1-10)")
    estimated_effort: Optional[str] = Field(default=None, description="Estimated resolution effort")
    
    # Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Bottleneck tags")
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")
    
    # Relationships
    optimizations: List["PerformanceOptimization"] = Relationship(back_populates="bottleneck")

class PerformanceOptimization(SQLModel, table=True):
    """Performance optimization records"""
    __tablename__ = "performance_optimizations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    optimization_id: str = Field(unique=True, index=True, description="Unique optimization identifier")
    optimization_name: str = Field(index=True, description="Optimization name")
    optimization_type: OptimizationType = Field(index=True, description="Type of optimization")
    
    # Association
    bottleneck_id: Optional[str] = Field(foreign_key="performance_bottlenecks.bottleneck_id", index=True, description="Associated bottleneck")
    target_component: str = Field(index=True, description="Target component")
    target_resource: str = Field(index=True, description="Target resource")
    
    # Optimization Details
    description: str = Field(description="Optimization description")
    implementation_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Implementation details")
    configuration_changes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Configuration changes")
    
    # Impact Prediction
    predicted_improvement: float = Field(description="Predicted performance improvement %")
    confidence: float = Field(description="Confidence in prediction (0-1)")
    risk_assessment: str = Field(description="Risk assessment")
    rollback_plan: Optional[str] = Field(default=None, description="Rollback plan")
    
    # Implementation
    status: str = Field(default="proposed", index=True, description="Optimization status")
    implemented_at: Optional[datetime] = Field(default=None, description="Implementation timestamp")
    implemented_by: Optional[str] = Field(default=None, description="Implementer")
    
    # Results
    actual_improvement: Optional[float] = Field(default=None, description="Actual improvement achieved %")
    before_metrics: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Metrics before optimization")
    after_metrics: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Metrics after optimization")
    side_effects: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)), description="Observed side effects")
    
    # Validation
    validation_period_days: int = Field(default=7, description="Validation period in days")
    validation_status: Optional[str] = Field(default=None, description="Validation status")
    validation_results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Validation results")
    
    # Metadata
    priority: int = Field(default=5, description="Implementation priority (1-10)")
    estimated_effort: Optional[str] = Field(default=None, description="Estimated implementation effort")
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Optimization tags")
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    created_by: str = Field(description="User who created optimization")
    
    # Relationships
    bottleneck: Optional[PerformanceBottleneck] = Relationship(back_populates="optimizations")

class ScanPerformanceAlert(SQLModel, table=True):
    """Scan performance-related alerts"""
    __tablename__ = "scan_performance_alerts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    alert_id: str = Field(unique=True, index=True, description="Unique alert identifier")
    alert_name: str = Field(index=True, description="Alert name")
    metric_id: int = Field(foreign_key="scan_performance_metrics.id", index=True, description="Associated metric")
    
    # Alert Details
    severity: AlertSeverity = Field(index=True, description="Alert severity")
    alert_type: str = Field(index=True, description="Type of alert")
    message: str = Field(description="Alert message")
    description: str = Field(description="Detailed alert description")
    
    # Trigger Conditions
    threshold_value: float = Field(description="Threshold that triggered alert")
    actual_value: float = Field(description="Actual value that triggered alert")
    trigger_condition: str = Field(description="Trigger condition")
    duration_seconds: int = Field(description="Duration threshold was exceeded")
    
    # Status
    status: str = Field(default="active", index=True, description="Alert status")
    acknowledged: bool = Field(default=False, description="Acknowledgment status")
    acknowledged_by: Optional[str] = Field(default=None, description="User who acknowledged")
    acknowledged_at: Optional[datetime] = Field(default=None, description="Acknowledgment timestamp")
    
    # Resolution
    resolved: bool = Field(default=False, description="Resolution status")
    resolved_by: Optional[str] = Field(default=None, description="User who resolved")
    resolved_at: Optional[datetime] = Field(default=None, description="Resolution timestamp")
    resolution_notes: Optional[str] = Field(default=None, description="Resolution notes")
    
    # Impact
    impact_assessment: Optional[str] = Field(default=None, description="Impact assessment")
    affected_services: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Affected services")
    business_impact: Optional[str] = Field(default=None, description="Business impact description")
    
    # Escalation
    escalation_level: int = Field(default=0, description="Current escalation level")
    escalated_to: Optional[str] = Field(default=None, description="Escalated to user/team")
    escalation_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Escalation history")
    
    # Timing
    triggered_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Alert trigger timestamp")
    first_detected_at: Optional[datetime] = Field(default=None, description="First detection timestamp")
    last_updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    # Metadata
    tags: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Alert tags")
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")
    
    # Relationships
    metric: Optional[ScanPerformanceMetric] = Relationship(back_populates="performance_alerts")

class PerformanceBenchmark(SQLModel, table=True):
    """Performance benchmarks and targets"""
    __tablename__ = "performance_benchmarks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    benchmark_id: str = Field(unique=True, index=True, description="Unique benchmark identifier")
    benchmark_name: str = Field(index=True, description="Benchmark name")
    benchmark_type: BenchmarkType = Field(index=True, description="Type of benchmark")
    
    # Scope
    scope: MonitoringScope = Field(description="Benchmark scope")
    component: str = Field(index=True, description="Component being benchmarked")
    metric_type: PerformanceMetricType = Field(description="Metric type")
    
    # Benchmark Values
    target_value: float = Field(description="Target/expected value")
    minimum_acceptable: Optional[float] = Field(default=None, description="Minimum acceptable value")
    maximum_acceptable: Optional[float] = Field(default=None, description="Maximum acceptable value")
    optimal_range_min: Optional[float] = Field(default=None, description="Optimal range minimum")
    optimal_range_max: Optional[float] = Field(default=None, description="Optimal range maximum")
    
    # Context
    conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Benchmark conditions")
    environment: str = Field(description="Environment (prod, staging, test)")
    workload_characteristics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Workload characteristics")
    
    # Validation
    last_validated: Optional[datetime] = Field(default=None, description="Last validation timestamp")
    validation_frequency_days: int = Field(default=30, description="Validation frequency in days")
    validation_results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Validation results")
    
    # Status
    is_active: bool = Field(default=True, index=True, description="Benchmark status")
    confidence: float = Field(default=1.0, description="Confidence in benchmark (0-1)")
    reliability_score: Optional[float] = Field(default=None, description="Reliability score")
    
    # Metadata
    description: str = Field(description="Benchmark description")
    methodology: Optional[str] = Field(default=None, description="Benchmarking methodology")
    source: str = Field(description="Benchmark source")
    version: str = Field(default="1.0", description="Benchmark version")
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    valid_from: Optional[datetime] = Field(default=None, description="Validity start date")
    valid_until: Optional[datetime] = Field(default=None, description="Validity end date")
    
    # Tags
    tags: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Benchmark tags")

class ResourceUtilization(SQLModel, table=True):
    """Real-time resource utilization tracking"""
    __tablename__ = "resource_utilization"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    utilization_id: str = Field(unique=True, index=True, description="Unique utilization record identifier")
    resource_id: str = Field(index=True, description="Resource identifier")
    resource_type: ResourceType = Field(index=True, description="Type of resource")
    
    # Utilization Metrics
    current_usage: float = Field(description="Current usage amount")
    total_capacity: float = Field(description="Total resource capacity")
    utilization_percentage: float = Field(description="Utilization percentage")
    available_capacity: float = Field(description="Available capacity")
    
    # Trends
    trend: TrendDirection = Field(description="Utilization trend")
    peak_usage: float = Field(description="Peak usage in measurement period")
    average_usage: float = Field(description="Average usage in measurement period")
    minimum_usage: float = Field(description="Minimum usage in measurement period")
    
    # Thresholds
    warning_threshold: float = Field(default=80.0, description="Warning threshold percentage")
    critical_threshold: float = Field(default=95.0, description="Critical threshold percentage")
    efficiency_target: Optional[float] = Field(default=None, description="Target efficiency percentage")
    
    # Status
    status: PerformanceStatus = Field(description="Utilization status")
    is_overloaded: bool = Field(default=False, description="Overload flag")
    is_underutilized: bool = Field(default=False, description="Underutilization flag")
    
    # Context
    component: str = Field(description="Component using resource")
    environment: str = Field(description="Environment context")
    workload_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Workload context")
    
    # Quality Metrics
    efficiency_score: Optional[float] = Field(default=None, description="Resource efficiency score")
    waste_percentage: Optional[float] = Field(default=None, description="Resource waste percentage")
    optimization_potential: Optional[float] = Field(default=None, description="Optimization potential percentage")
    
    # Timing
    measured_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Measurement timestamp")
    measurement_duration: int = Field(description="Measurement duration in seconds")
    
    # Metadata
    unit: str = Field(description="Measurement unit")
    measurement_method: str = Field(description="How measurement was taken")
    tags: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Utilization tags")

class PerformanceReport(SQLModel, table=True):
    """Performance analysis reports"""
    __tablename__ = "performance_reports"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: str = Field(unique=True, index=True, description="Unique report identifier")
    report_name: str = Field(index=True, description="Report name")
    report_type: str = Field(index=True, description="Type of report")
    
    # Report Scope
    scope: MonitoringScope = Field(description="Report scope")
    components: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Components covered")
    date_range: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSONB), description="Report date range")
    
    # Report Data
    executive_summary: str = Field(description="Executive summary")
    key_findings: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Key findings")
    performance_overview: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Performance overview")
    detailed_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Detailed analysis")
    
    # Metrics and Trends
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Performance metrics")
    trend_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Trend analysis")
    benchmark_comparison: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Benchmark comparison")
    
    # Issues and Recommendations
    identified_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Identified issues")
    bottlenecks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Performance bottlenecks")
    recommendations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Optimization recommendations")
    
    # Report Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True, description="Report generation timestamp")
    generated_by: str = Field(description="User who generated report")
    generation_time_ms: int = Field(description="Report generation time")
    data_quality_score: float = Field(description="Data quality score for report")
    
    # Distribution
    recipients: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Report recipients")
    delivery_status: str = Field(default="pending", description="Delivery status")
    access_permissions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Access permissions")
    
    # Status
    status: str = Field(default="completed", index=True, description="Report status")
    file_path: Optional[str] = Field(default=None, description="Generated report file path")
    file_size_bytes: Optional[int] = Field(default=None, description="Report file size")

# ============================================================================
# API MODELS
# ============================================================================

class MetricQuery(BaseModel):
    """Performance metric query"""
    metric_types: Optional[List[PerformanceMetricType]] = None
    resource_ids: Optional[List[str]] = None
    components: Optional[List[str]] = None
    scopes: Optional[List[MonitoringScope]] = None
    date_range: Optional[Dict[str, str]] = None
    aggregation: Optional[str] = "avg"
    include_history: bool = False

class BottleneckAnalysisRequest(BaseModel):
    """Bottleneck analysis request"""
    scope: MonitoringScope
    components: Optional[List[str]] = None
    time_window_hours: int = 24
    severity_threshold: AlertSeverity = AlertSeverity.WARNING
    include_predictions: bool = True

class OptimizationRequest(BaseModel):
    """Optimization recommendation request"""
    target_components: List[str]
    optimization_types: Optional[List[OptimizationType]] = None
    priority_threshold: int = 5
    include_risk_assessment: bool = True
    implementation_timeline: Optional[str] = None

class PerformanceReportRequest(BaseModel):
    """Performance report generation request"""
    report_name: str
    report_type: str
    scope: MonitoringScope
    components: List[str]
    date_range: Dict[str, str]
    include_recommendations: bool = True
    include_benchmarks: bool = True
    recipients: Optional[List[str]] = None

class AlertConfiguration(BaseModel):
    """Alert configuration"""
    metric_type: PerformanceMetricType
    warning_threshold: float
    critical_threshold: float
    evaluation_window_minutes: int = 5
    notification_channels: List[str]
    escalation_rules: Optional[Dict[str, Any]] = None

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class PerformanceMetricResponse(BaseModel):
    """Performance metric response"""
    metric_id: str
    metric_name: str
    metric_type: PerformanceMetricType
    current_value: float
    status: PerformanceStatus
    trend: TrendDirection
    measured_at: datetime
    unit: str

class BottleneckResponse(BaseModel):
    """Bottleneck response"""
    bottleneck_id: str
    bottleneck_name: str
    bottleneck_type: BottleneckType
    severity: AlertSeverity
    confidence: float
    performance_impact: float
    recommended_actions: List[str]
    detected_at: datetime

class OptimizationResponse(BaseModel):
    """Optimization response"""
    optimization_id: str
    optimization_name: str
    optimization_type: OptimizationType
    predicted_improvement: float
    confidence: float
    priority: int
    risk_assessment: str
    status: str

class PerformanceDashboard(BaseModel):
    """Performance dashboard data"""
    overall_status: PerformanceStatus
    key_metrics: List[Dict[str, Any]]
    active_alerts: List[Dict[str, Any]]
    recent_bottlenecks: List[Dict[str, Any]]
    optimization_opportunities: List[Dict[str, Any]]
    resource_utilization: Dict[str, Any]
    trend_summary: Dict[str, Any]
    generated_at: datetime

# Backward-compatible alias expected by services/routes
# Many modules import `PerformanceMetric` while the concrete ORM class is `ScanPerformanceMetric`
PerformanceMetric = ScanPerformanceMetric
PerformanceAlert = ScanPerformanceAlert