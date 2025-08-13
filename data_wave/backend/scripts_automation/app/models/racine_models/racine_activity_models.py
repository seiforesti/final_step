"""
Racine Activity Tracking Models
===============================

Advanced activity tracking models for comprehensive historic activities tracking
with real-time monitoring and cross-group correlation across all 7 groups.

These models provide:
- Comprehensive activity logging and tracking
- Real-time activity streaming and monitoring
- Cross-group activity correlation and analysis
- Advanced audit trails and compliance tracking
- Activity analytics and visualization
- User behavior analysis and insights
- System performance monitoring through activities
- Integration with all existing group services

All models are designed for enterprise-grade scalability, performance, and security.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, Float, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
import enum
from typing import Dict, List, Any, Optional

from ..db_models import Base
from ..auth_models import User
from .racine_orchestration_models import RacineOrchestrationMaster


class ActivityType(enum.Enum):
    """Activity type enumeration"""
    USER_ACTION = "user_action"
    SYSTEM_EVENT = "system_event"
    WORKFLOW_EXECUTION = "workflow_execution"
    PIPELINE_EXECUTION = "pipeline_execution"
    DATA_ACCESS = "data_access"
    SECURITY_EVENT = "security_event"
    COMPLIANCE_CHECK = "compliance_check"
    PERFORMANCE_EVENT = "performance_event"
    ERROR_EVENT = "error_event"
    INTEGRATION_EVENT = "integration_event"
    COLLABORATION_EVENT = "collaboration_event"
    AI_INTERACTION = "ai_interaction"


class ActivitySeverity(enum.Enum):
    """Activity severity enumeration"""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class ActivityStatus(enum.Enum):
    """Activity status enumeration"""
    INITIATED = "initiated"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"
    TIMEOUT = "timeout"


class RacineActivity(Base):
    """
    Master activity tracking model for comprehensive activity logging
    with cross-group correlation and real-time monitoring.
    """
    __tablename__ = 'racine_activities'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Activity basic information
    activity_name = Column(String, nullable=False, index=True)
    activity_type = Column(SQLEnum(ActivityType), nullable=False, index=True)
    activity_category = Column(String, index=True)  # Custom categorization
    description = Column(Text)
    
    # Activity status and severity
    status = Column(SQLEnum(ActivityStatus), default=ActivityStatus.INITIATED, index=True)
    severity = Column(SQLEnum(ActivitySeverity), default=ActivitySeverity.INFO, index=True)
    priority = Column(String, default="normal")  # low, normal, high, urgent
    
    # Activity details
    activity_data = Column(JSON)  # Detailed activity data
    input_parameters = Column(JSON)  # Input parameters
    output_results = Column(JSON)  # Output results
    activity_metadata = Column(JSON)  # Additional metadata
    
    # Context information
    user_context = Column(JSON)  # User context at time of activity
    system_context = Column(JSON)  # System context
    workspace_context = Column(JSON)  # Workspace context
    session_context = Column(JSON)  # Session context
    
    # Cross-group information
    primary_group = Column(String, nullable=False, index=True)  # Primary group involved
    involved_groups = Column(JSON)  # All groups involved in activity
    cross_group_correlations = Column(JSON)  # Correlations across groups
    group_specific_data = Column(JSON)  # Group-specific data
    
    # Technical details
    source_system = Column(String, index=True)  # Source system
    source_component = Column(String)  # Source component
    api_endpoint = Column(String)  # API endpoint if applicable
    http_method = Column(String)  # HTTP method if applicable
    request_id = Column(String, index=True)  # Request correlation ID
    trace_id = Column(String, index=True)  # Distributed tracing ID
    
    # Performance metrics
    execution_time_ms = Column(Integer)  # Execution time in milliseconds
    resource_usage = Column(JSON)  # Resource usage data
    performance_metrics = Column(JSON)  # Performance metrics
    
    # Error and debugging information
    error_details = Column(JSON)  # Error details if activity failed
    stack_trace = Column(Text)  # Stack trace for errors
    debug_information = Column(JSON)  # Debug information
    
    # Network and security information
    ip_address = Column(String, index=True)  # Source IP address
    user_agent = Column(String)  # User agent
    geo_location = Column(JSON)  # Geographical location data
    security_context = Column(JSON)  # Security context
    
    # Compliance and audit information
    compliance_flags = Column(JSON)  # Compliance-related flags
    audit_requirements = Column(JSON)  # Audit requirements
    retention_period = Column(Integer)  # Retention period in days
    is_sensitive = Column(Boolean, default=False, index=True)  # Sensitive activity flag
    
    # Correlation and relationships
    parent_activity_id = Column(String, ForeignKey('racine_activities.id'))
    correlation_id = Column(String, index=True)  # Correlation with related activities
    workflow_execution_id = Column(String)  # Related workflow execution
    pipeline_execution_id = Column(String)  # Related pipeline execution
    
    # User and timing information
    user_id = Column(String, ForeignKey('users.id'))
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Integration with orchestration
    orchestration_master_id = Column(String, ForeignKey('racine_orchestration_master.id'))
    
    # Relationships
    user = relationship("User")
    orchestration_master = relationship("RacineOrchestrationMaster")
    parent_activity = relationship("RacineActivity", remote_side=[id])
    child_activities = relationship("RacineActivity", back_populates="parent_activity")
    activity_logs = relationship("RacineActivityLog", back_populates="activity", cascade="all, delete-orphan")
    activity_metrics = relationship("RacineActivityMetrics", back_populates="activity", cascade="all, delete-orphan")


class RacineActivityLog(Base):
    """
    Detailed activity log entries for granular tracking
    and step-by-step monitoring.
    """
    __tablename__ = 'racine_activity_logs'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Log basic information
    log_level = Column(String, nullable=False, index=True)  # DEBUG, INFO, WARN, ERROR, FATAL
    message = Column(Text, nullable=False)
    log_category = Column(String, index=True)  # Category for log classification
    
    # Log details
    log_data = Column(JSON)  # Structured log data
    context_data = Column(JSON)  # Context at time of log
    stack_trace = Column(Text)  # Stack trace if applicable
    
    # Technical information
    source_file = Column(String)  # Source file
    source_function = Column(String)  # Source function
    line_number = Column(Integer)  # Line number
    thread_id = Column(String)  # Thread ID
    process_id = Column(String)  # Process ID
    
    # Performance data
    timestamp_precise = Column(DateTime, default=datetime.utcnow)  # Precise timestamp
    duration_ms = Column(Integer)  # Duration for step completion
    memory_usage = Column(Integer)  # Memory usage at log time
    
    # Cross-group tracking
    group_context = Column(String)  # Group context for this log
    cross_group_references = Column(JSON)  # References to other groups
    
    # Activity reference
    activity_id = Column(String, ForeignKey('racine_activities.id'), nullable=False)
    sequence_number = Column(Integer, nullable=False)  # Sequential order in activity
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    activity = relationship("RacineActivity", back_populates="activity_logs")


class RacineActivityStream(Base):
    """
    Real-time activity stream for live monitoring
    and immediate event processing.
    """
    __tablename__ = 'racine_activity_streams'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Stream basic information
    stream_name = Column(String, nullable=False, index=True)
    stream_type = Column(String, nullable=False)  # real_time, batch, aggregated
    description = Column(Text)
    
    # Stream configuration
    filter_criteria = Column(JSON)  # Criteria for including activities
    aggregation_rules = Column(JSON)  # Rules for aggregating activities
    transformation_rules = Column(JSON)  # Rules for transforming data
    retention_policy = Column(JSON)  # Retention policy for stream data
    
    # Target configuration
    target_systems = Column(JSON)  # Target systems for stream
    notification_rules = Column(JSON)  # Notification rules
    alert_thresholds = Column(JSON)  # Alert thresholds
    
    # Performance configuration
    batch_size = Column(Integer, default=100)  # Batch size for processing
    processing_interval = Column(Integer, default=1000)  # Processing interval in ms
    max_lag_tolerance = Column(Integer, default=5000)  # Max lag tolerance in ms
    
    # Status and monitoring
    is_active = Column(Boolean, default=True, index=True)
    last_processed_at = Column(DateTime)
    processing_lag_ms = Column(Integer)  # Current processing lag
    error_count = Column(Integer, default=0)  # Error count
    
    # Statistics
    total_events_processed = Column(Integer, default=0)
    events_per_second = Column(Float, default=0.0)
    average_processing_time = Column(Float, default=0.0)
    
    # User and timing
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User")
    stream_events = relationship("RacineActivityStreamEvent", back_populates="stream", cascade="all, delete-orphan")


class RacineActivityStreamEvent(Base):
    """
    Individual stream events for real-time activity processing.
    """
    __tablename__ = 'racine_activity_stream_events'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Event information
    event_type = Column(String, nullable=False, index=True)
    event_data = Column(JSON, nullable=False)
    original_activity_id = Column(String, ForeignKey('racine_activities.id'))
    
    # Processing information
    processing_status = Column(String, default="pending")  # pending, processed, failed, skipped
    processing_attempts = Column(Integer, default=0)
    last_processing_error = Column(Text)
    processing_time_ms = Column(Integer)
    
    # Stream reference
    stream_id = Column(String, ForeignKey('racine_activity_streams.id'), nullable=False)
    
    # Timing
    event_timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    processed_at = Column(DateTime)
    
    # Relationships
    stream = relationship("RacineActivityStream", back_populates="stream_events")
    original_activity = relationship("RacineActivity")


class RacineActivityCorrelation(Base):
    """
    Activity correlation tracking for cross-group analysis
    and pattern discovery.
    """
    __tablename__ = 'racine_activity_correlations'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Correlation information
    correlation_type = Column(String, nullable=False, index=True)  # temporal, causal, pattern
    correlation_name = Column(String, nullable=False)
    description = Column(Text)
    confidence_score = Column(Float, default=0.0)  # Correlation confidence (0-1)
    
    # Correlation details
    correlation_data = Column(JSON)  # Detailed correlation data
    pattern_definition = Column(JSON)  # Pattern definition
    statistical_measures = Column(JSON)  # Statistical correlation measures
    
    # Participating activities
    primary_activity_id = Column(String, ForeignKey('racine_activities.id'), nullable=False)
    related_activity_ids = Column(JSON)  # List of related activity IDs
    activity_pattern = Column(JSON)  # Activity pattern information
    
    # Cross-group analysis
    involved_groups = Column(JSON)  # Groups involved in correlation
    cross_group_impact = Column(JSON)  # Cross-group impact analysis
    group_interaction_patterns = Column(JSON)  # Group interaction patterns
    
    # Temporal analysis
    time_window_start = Column(DateTime)
    time_window_end = Column(DateTime)
    frequency_pattern = Column(JSON)  # Frequency pattern analysis
    seasonal_patterns = Column(JSON)  # Seasonal patterns
    
    # Discovery and validation
    discovery_method = Column(String)  # Method used to discover correlation
    validation_status = Column(String, default="pending")  # pending, validated, rejected
    validation_data = Column(JSON)  # Validation data
    
    # Usage and impact
    business_impact = Column(JSON)  # Business impact of correlation
    actionable_insights = Column(JSON)  # Actionable insights
    recommended_actions = Column(JSON)  # Recommended actions
    
    # Timing
    discovered_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_validated = Column(DateTime)
    
    # Relationships
    primary_activity = relationship("RacineActivity")


class RacineActivityAnalytics(Base):
    """
    Activity analytics and insights for performance monitoring
    and user behavior analysis.
    """
    __tablename__ = 'racine_activity_analytics'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Analytics information
    analytics_type = Column(String, nullable=False, index=True)  # user_behavior, performance, trends
    analytics_name = Column(String, nullable=False)
    description = Column(Text)
    time_period = Column(String, nullable=False)  # hourly, daily, weekly, monthly
    
    # Analytics data
    analytics_data = Column(JSON, nullable=False)  # Comprehensive analytics data
    key_metrics = Column(JSON)  # Key metrics extracted
    trends_identified = Column(JSON)  # Identified trends
    anomalies_detected = Column(JSON)  # Detected anomalies
    
    # Scope and filters
    scope_definition = Column(JSON)  # Scope of analytics
    filter_criteria = Column(JSON)  # Filter criteria used
    groups_included = Column(JSON)  # Groups included in analytics
    user_segments = Column(JSON)  # User segments analyzed
    
    # Statistical analysis
    statistical_summary = Column(JSON)  # Statistical summary
    distribution_analysis = Column(JSON)  # Distribution analysis
    correlation_matrix = Column(JSON)  # Correlation matrix
    predictive_models = Column(JSON)  # Predictive model results
    
    # Insights and recommendations
    key_insights = Column(JSON)  # Key insights discovered
    performance_insights = Column(JSON)  # Performance insights
    user_behavior_insights = Column(JSON)  # User behavior insights
    recommendations = Column(JSON)  # Recommendations based on analytics
    
    # Quality and confidence
    data_quality_score = Column(Float, default=1.0)  # Data quality score
    confidence_level = Column(Float, default=0.95)  # Statistical confidence level
    sample_size = Column(Integer)  # Sample size used
    margin_of_error = Column(Float)  # Margin of error
    
    # Time range
    analysis_start_time = Column(DateTime, nullable=False)
    analysis_end_time = Column(DateTime, nullable=False)
    
    # Processing information
    computation_time_ms = Column(Integer)  # Time taken to compute analytics
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships - no direct FK relationships to maintain flexibility


class RacineActivityMetrics(Base):
    """
    Activity performance metrics for detailed monitoring
    and optimization insights.
    """
    __tablename__ = 'racine_activity_metrics'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Metric basic information
    metric_type = Column(String, nullable=False, index=True)  # performance, usage, quality, error
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String)
    metric_category = Column(String)  # timing, resource, business, technical
    
    # Metric context
    activity_id = Column(String, ForeignKey('racine_activities.id'), nullable=False)
    measurement_context = Column(JSON)  # Context during measurement
    aggregation_level = Column(String, default="individual")  # individual, grouped, aggregated
    
    # Metric details
    baseline_value = Column(Float)  # Baseline value for comparison
    target_value = Column(Float)  # Target value
    threshold_values = Column(JSON)  # Various threshold values
    variance_from_baseline = Column(Float)  # Variance from baseline
    
    # Dimensional analysis
    dimensions = Column(JSON)  # Metric dimensions (user, group, time, etc.)
    tags = Column(JSON)  # Metric tags for categorization
    labels = Column(JSON)  # Additional labels
    
    # Quality and reliability
    measurement_quality = Column(Float, default=1.0)  # Quality of measurement
    confidence_interval = Column(JSON)  # Statistical confidence interval
    sample_size = Column(Integer)  # Sample size for metric
    
    # Temporal information
    measurement_timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    measurement_window_start = Column(DateTime)
    measurement_window_end = Column(DateTime)
    
    # Additional metadata
    metric_metadata = Column(JSON)  # Additional metric metadata
    collection_method = Column(String)  # Method used to collect metric
    
    # Relationships
    activity = relationship("RacineActivity", back_populates="activity_metrics")


class RacineActivityAlert(Base):
    """
    Activity-based alerting for proactive monitoring
    and incident response.
    """
    __tablename__ = 'racine_activity_alerts'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Alert basic information
    alert_name = Column(String, nullable=False, index=True)
    alert_type = Column(String, nullable=False)  # threshold, pattern, anomaly, correlation
    severity = Column(SQLEnum(ActivitySeverity), nullable=False, index=True)
    status = Column(String, default="active")  # active, acknowledged, resolved, suppressed
    
    # Alert trigger information
    trigger_condition = Column(JSON, nullable=False)  # Condition that triggered alert
    trigger_data = Column(JSON)  # Data that triggered the alert
    related_activities = Column(JSON)  # Related activities that triggered alert
    
    # Alert details
    description = Column(Text, nullable=False)
    detailed_message = Column(Text)
    resolution_steps = Column(JSON)  # Suggested resolution steps
    escalation_rules = Column(JSON)  # Escalation rules
    
    # Impact assessment
    impact_level = Column(String, default="medium")  # low, medium, high, critical
    affected_systems = Column(JSON)  # Affected systems
    affected_users = Column(JSON)  # Affected users
    business_impact = Column(JSON)  # Business impact assessment
    
    # Response tracking
    acknowledged_by = Column(String, ForeignKey('users.id'))
    acknowledged_at = Column(DateTime)
    resolved_by = Column(String, ForeignKey('users.id'))
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    
    # Cross-group impact
    affected_groups = Column(JSON)  # Groups affected by alert
    cross_group_implications = Column(JSON)  # Cross-group implications
    coordination_required = Column(JSON)  # Required coordination
    
    # Alert lifecycle
    first_occurrence = Column(DateTime, default=datetime.utcnow, index=True)
    last_occurrence = Column(DateTime, default=datetime.utcnow)
    occurrence_count = Column(Integer, default=1)
    suppression_rules = Column(JSON)  # Rules for suppressing similar alerts
    
    # Notification tracking
    notifications_sent = Column(JSON)  # Notifications sent
    notification_channels = Column(JSON)  # Channels used for notification
    
    # Relationships
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    resolver = relationship("User", foreign_keys=[resolved_by])


class RacineActivityAudit(Base):
    """
    Comprehensive audit trail for activity operations
    and compliance tracking.
    """
    __tablename__ = 'racine_activity_audit'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Audit event information
    event_type = Column(String, nullable=False, index=True)  # created, accessed, modified, deleted
    event_description = Column(Text)
    event_data = Column(JSON)  # Detailed event data
    audit_category = Column(String)  # activity, access, compliance, security
    
    # Context information
    activity_id = Column(String, ForeignKey('racine_activities.id'))
    user_id = Column(String, ForeignKey('users.id'))
    session_id = Column(String)
    request_id = Column(String)
    
    # Change tracking
    changes_made = Column(JSON)  # Detailed changes made
    previous_values = Column(JSON)  # Previous values before change
    new_values = Column(JSON)  # New values after change
    change_reason = Column(Text)  # Reason for change
    
    # System and network information
    ip_address = Column(String)
    user_agent = Column(String)
    geo_location = Column(JSON)
    system_context = Column(JSON)
    
    # Compliance information
    compliance_requirements = Column(JSON)  # Applicable compliance requirements
    retention_requirements = Column(JSON)  # Data retention requirements
    privacy_implications = Column(JSON)  # Privacy implications
    
    # Cross-group tracking
    affected_groups = Column(JSON)  # Groups affected by audit event
    cross_group_impact = Column(JSON)  # Cross-group impact
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    activity = relationship("RacineActivity")
    user = relationship("User")