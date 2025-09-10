"""
Racine Dashboard Models
=======================

Advanced dashboard models for intelligent dashboard system with real-time metrics,
cross-group KPIs, predictive analytics, and customizable visualizations across all 7 groups.

These models provide:
- Real-time dashboard orchestration and management
- Cross-group KPI visualization and analytics
- Customizable dashboard builder and layout engine
- Predictive analytics and forecasting
- Executive reporting and business intelligence
- Performance monitoring and alerting
- Dashboard personalization and user preferences
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


class DashboardType(enum.Enum):
    """Dashboard type enumeration"""
    EXECUTIVE = "executive"
    OPERATIONAL = "operational"
    ANALYTICAL = "analytical"
    MONITORING = "monitoring"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"
    CUSTOM = "custom"
    EMBEDDED = "embedded"


class WidgetType(enum.Enum):
    """Dashboard widget type enumeration"""
    CHART = "chart"
    TABLE = "table"
    METRIC = "metric"
    MAP = "map"
    TEXT = "text"
    IMAGE = "image"
    IFRAME = "iframe"
    CUSTOM = "custom"
    REAL_TIME = "real_time"
    PREDICTIVE = "predictive"


class ChartType(enum.Enum):
    """Chart type enumeration"""
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    AREA = "area"
    SCATTER = "scatter"
    HEATMAP = "heatmap"
    GAUGE = "gauge"
    FUNNEL = "funnel"
    TREEMAP = "treemap"
    SANKEY = "sankey"


class RefreshFrequency(enum.Enum):
    """Dashboard refresh frequency enumeration"""
    REAL_TIME = "real_time"
    EVERY_SECOND = "every_second"
    EVERY_MINUTE = "every_minute"
    EVERY_5_MINUTES = "every_5_minutes"
    EVERY_15_MINUTES = "every_15_minutes"
    EVERY_HOUR = "every_hour"
    DAILY = "daily"
    MANUAL = "manual"


class RacineDashboard(Base):
    """
    Master dashboard definition model for intelligent dashboard system
    with comprehensive cross-group analytics and visualization.
    """
    __tablename__ = 'racine_dashboards'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Dashboard basic information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    dashboard_type = Column(SQLEnum(DashboardType), nullable=False, index=True)
    category = Column(String, index=True)
    
    # Dashboard configuration
    layout_config = Column(JSON, nullable=False)  # Dashboard layout configuration
    theme_config = Column(JSON)  # Theme and styling configuration
    responsive_config = Column(JSON)  # Responsive design configuration
    interaction_config = Column(JSON)  # User interaction configuration
    
    # Data and metrics
    data_sources = Column(JSON)  # Data sources used by dashboard
    refresh_frequency = Column(SQLEnum(RefreshFrequency), default=RefreshFrequency.EVERY_5_MINUTES)
    cache_config = Column(JSON)  # Caching configuration
    real_time_config = Column(JSON)  # Real-time data configuration
    
    # Cross-group analytics
    involved_groups = Column(JSON)  # Groups involved in dashboard
    cross_group_metrics = Column(JSON)  # Cross-group metrics configuration
    group_specific_views = Column(JSON)  # Group-specific view configurations
    integration_points = Column(JSON)  # Integration points with groups
    
    # Predictive analytics
    predictive_models = Column(JSON)  # Predictive models configuration
    forecasting_config = Column(JSON)  # Forecasting configuration
    trend_analysis_config = Column(JSON)  # Trend analysis configuration
    anomaly_detection_config = Column(JSON)  # Anomaly detection configuration
    
    # Personalization and access
    is_public = Column(Boolean, default=False, index=True)
    access_level = Column(String, default="private")  # private, team, organization, public
    allowed_users = Column(JSON)  # Users allowed to access dashboard
    allowed_roles = Column(JSON)  # Roles allowed to access dashboard
    personalization_enabled = Column(Boolean, default=True)
    
    # Performance and optimization
    performance_config = Column(JSON)  # Performance optimization configuration
    lazy_loading_config = Column(JSON)  # Lazy loading configuration
    compression_enabled = Column(Boolean, default=True)
    cdn_config = Column(JSON)  # CDN configuration
    
    # Alerting and notifications
    alerting_config = Column(JSON)  # Alerting configuration
    notification_settings = Column(JSON)  # Notification settings
    threshold_configs = Column(JSON)  # Threshold configurations for alerts
    escalation_rules = Column(JSON)  # Alert escalation rules
    
    # Export and sharing
    export_config = Column(JSON)  # Export configuration
    sharing_config = Column(JSON)  # Sharing configuration
    embedded_config = Column(JSON)  # Embedded dashboard configuration
    api_access_config = Column(JSON)  # API access configuration
    
    # Usage analytics
    usage_analytics = Column(JSON)  # Usage analytics configuration
    user_interaction_tracking = Column(Boolean, default=True)
    performance_tracking = Column(Boolean, default=True)
    
    # Version control
    version = Column(String, default="1.0.0")
    previous_version_id = Column(String, ForeignKey('racine_dashboards.id'))
    is_current_version = Column(Boolean, default=True, index=True)
    change_log = Column(JSON)  # Change log
    
    # Integration with orchestration
    orchestration_master_id = Column(String, ForeignKey('racine_orchestration_master.id'))
    
    # Audit and tracking fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    updated_by = Column(String, ForeignKey('users.id'))
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    orchestration_master = relationship("RacineOrchestrationMaster")
    previous_version = relationship("RacineDashboard", remote_side=[id])
    
    # Back references
    widgets = relationship("RacineDashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")
    layouts = relationship("RacineDashboardLayout", back_populates="dashboard", cascade="all, delete-orphan")
    personalizations = relationship("RacineDashboardPersonalization", back_populates="dashboard", cascade="all, delete-orphan")
    analytics = relationship("RacineDashboardAnalytics", back_populates="dashboard", cascade="all, delete-orphan")


class RacineDashboardWidget(Base):
    """
    Dashboard widget model for flexible and customizable dashboard components
    with real-time data integration.
    """
    __tablename__ = 'racine_dashboard_widgets'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Widget basic information
    name = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    widget_type = Column(SQLEnum(WidgetType), nullable=False)
    
    # Widget configuration
    widget_config = Column(JSON, nullable=False)  # Widget-specific configuration
    data_config = Column(JSON, nullable=False)  # Data configuration
    visualization_config = Column(JSON)  # Visualization configuration
    interaction_config = Column(JSON)  # Interaction configuration
    
    # Chart-specific configuration (if applicable)
    chart_type = Column(SQLEnum(ChartType))
    chart_config = Column(JSON)  # Chart-specific configuration
    axes_config = Column(JSON)  # Axes configuration
    series_config = Column(JSON)  # Series configuration
    
    # Layout and positioning
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    width = Column(Integer, default=4)
    height = Column(Integer, default=3)
    z_index = Column(Integer, default=1)
    
    # Data source and queries
    data_source = Column(JSON, nullable=False)  # Data source configuration
    primary_query = Column(JSON)  # Primary data query
    secondary_queries = Column(JSON)  # Additional queries for comparison
    filter_config = Column(JSON)  # Filter configuration
    
    # Cross-group data integration
    involved_groups = Column(JSON)  # Groups involved in widget data
    cross_group_joins = Column(JSON)  # Cross-group data joins
    group_specific_filters = Column(JSON)  # Group-specific filters
    
    # Real-time and refresh configuration
    is_real_time = Column(Boolean, default=False)
    refresh_interval = Column(Integer, default=300)  # Refresh interval in seconds
    cache_enabled = Column(Boolean, default=True)
    cache_duration = Column(Integer, default=300)  # Cache duration in seconds
    
    # Predictive and analytical features
    predictive_enabled = Column(Boolean, default=False)
    predictive_config = Column(JSON)  # Predictive analytics configuration
    trend_analysis_enabled = Column(Boolean, default=False)
    anomaly_detection_enabled = Column(Boolean, default=False)
    
    # Alerting and thresholds
    alerts_enabled = Column(Boolean, default=False)
    alert_thresholds = Column(JSON)  # Alert thresholds
    alert_config = Column(JSON)  # Alert configuration
    
    # Personalization
    is_personalizable = Column(Boolean, default=True)
    user_customizations_allowed = Column(JSON)  # Allowed customizations
    
    # Performance optimization
    lazy_loading_enabled = Column(Boolean, default=False)
    data_sampling_config = Column(JSON)  # Data sampling for performance
    compression_config = Column(JSON)  # Compression configuration
    
    # Dashboard reference
    dashboard_id = Column(String, ForeignKey('racine_dashboards.id'), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    dashboard = relationship("RacineDashboard", back_populates="widgets")
    creator = relationship("User")
    widget_data = relationship("RacineDashboardWidgetData", back_populates="widget", cascade="all, delete-orphan")


class RacineDashboardLayout(Base):
    """
    Dashboard layout model for responsive and flexible dashboard layouts
    with multi-device support.
    """
    __tablename__ = 'racine_dashboard_layouts'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Layout basic information
    layout_name = Column(String, nullable=False, index=True)
    description = Column(Text)
    layout_type = Column(String, nullable=False)  # grid, masonry, flex, custom
    
    # Layout configuration
    layout_config = Column(JSON, nullable=False)  # Complete layout configuration
    grid_config = Column(JSON)  # Grid-specific configuration
    responsive_breakpoints = Column(JSON)  # Responsive breakpoints
    device_layouts = Column(JSON)  # Device-specific layouts
    
    # Styling and theme
    theme_config = Column(JSON)  # Theme configuration
    css_overrides = Column(Text)  # Custom CSS overrides
    color_scheme = Column(JSON)  # Color scheme configuration
    typography_config = Column(JSON)  # Typography configuration
    
    # Interaction and behavior
    interaction_config = Column(JSON)  # User interaction configuration
    animation_config = Column(JSON)  # Animation configuration
    transition_config = Column(JSON)  # Transition configuration
    
    # Performance configuration
    lazy_loading_config = Column(JSON)  # Lazy loading configuration
    virtualization_config = Column(JSON)  # Virtualization for large datasets
    
    # Personalization
    is_default = Column(Boolean, default=False, index=True)
    is_customizable = Column(Boolean, default=True)
    user_customizations = Column(JSON)  # User-specific customizations
    
    # Dashboard reference
    dashboard_id = Column(String, ForeignKey('racine_dashboards.id'), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    dashboard = relationship("RacineDashboard", back_populates="layouts")
    creator = relationship("User")


class RacineDashboardPersonalization(Base):
    """
    Dashboard personalization model for user-specific customizations
    and preferences.
    """
    __tablename__ = 'racine_dashboard_personalizations'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Personalization basic information
    personalization_name = Column(String, index=True)
    description = Column(Text)
    
    # User-specific configuration
    layout_preferences = Column(JSON)  # Layout preferences
    widget_preferences = Column(JSON)  # Widget preferences
    filter_preferences = Column(JSON)  # Filter preferences
    theme_preferences = Column(JSON)  # Theme preferences
    
    # Widget customizations
    widget_positions = Column(JSON)  # Custom widget positions
    widget_sizes = Column(JSON)  # Custom widget sizes
    hidden_widgets = Column(JSON)  # Hidden widgets
    custom_widgets = Column(JSON)  # User-added custom widgets
    
    # Data and view preferences
    default_time_range = Column(JSON)  # Default time range
    default_filters = Column(JSON)  # Default filters
    preferred_metrics = Column(JSON)  # Preferred metrics
    custom_calculations = Column(JSON)  # Custom calculations
    
    # Notification preferences
    notification_preferences = Column(JSON)  # Notification preferences
    alert_preferences = Column(JSON)  # Alert preferences
    
    # Usage patterns
    access_patterns = Column(JSON)  # User access patterns
    interaction_preferences = Column(JSON)  # Interaction preferences
    
    # Dashboard and user references
    dashboard_id = Column(String, ForeignKey('racine_dashboards.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Status and lifecycle
    is_active = Column(Boolean, default=True, index=True)
    last_used = Column(DateTime)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dashboard = relationship("RacineDashboard", back_populates="personalizations")
    user = relationship("User")


class RacineDashboardAnalytics(Base):
    """
    Dashboard analytics model for usage tracking and performance monitoring.
    """
    __tablename__ = 'racine_dashboard_analytics'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Analytics basic information
    analytics_type = Column(String, nullable=False, index=True)  # usage, performance, engagement
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String)
    
    # Analytics data
    analytics_data = Column(JSON)  # Detailed analytics data
    context_data = Column(JSON)  # Context information
    user_segment = Column(String)  # User segment
    device_info = Column(JSON)  # Device information
    
    # Usage analytics
    page_views = Column(Integer, default=0)
    unique_users = Column(Integer, default=0)
    session_duration = Column(Integer)  # Session duration in seconds
    interaction_count = Column(Integer, default=0)
    
    # Performance analytics
    load_time_ms = Column(Integer)  # Dashboard load time
    render_time_ms = Column(Integer)  # Render time
    data_fetch_time_ms = Column(Integer)  # Data fetch time
    error_count = Column(Integer, default=0)
    
    # Engagement analytics
    click_through_rate = Column(Float)
    time_spent_seconds = Column(Integer)
    bounce_rate = Column(Float)
    conversion_rate = Column(Float)
    
    # Cross-group analytics
    group_usage_patterns = Column(JSON)  # Usage patterns per group
    cross_group_interactions = Column(JSON)  # Cross-group interactions
    
    # Dashboard and user references
    dashboard_id = Column(String, ForeignKey('racine_dashboards.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'))
    widget_id = Column(String, ForeignKey('racine_dashboard_widgets.id'))
    
    # Temporal information
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    time_window_start = Column(DateTime)
    time_window_end = Column(DateTime)
    
    # Relationships
    dashboard = relationship("RacineDashboard", back_populates="analytics")
    user = relationship("User")
    widget = relationship("RacineDashboardWidget")


class RacineDashboardWidgetData(Base):
    """
    Dashboard widget data model for caching and historical data tracking.
    """
    __tablename__ = 'racine_dashboard_widget_data'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Data basic information
    data_type = Column(String, nullable=False, index=True)  # current, historical, predicted
    data_format = Column(String, default="json")  # json, csv, parquet
    
    # Data content
    data_content = Column(JSON, nullable=False)  # Actual data content
    data_metadata = Column(JSON)  # Data metadata
    schema_info = Column(JSON)  # Data schema information
    data_quality_metrics = Column(JSON)  # Data quality metrics
    
    # Data source information
    source_query = Column(JSON)  # Query used to generate data
    source_system = Column(String)  # Source system
    source_timestamp = Column(DateTime)  # When data was generated
    
    # Cache information
    is_cached = Column(Boolean, default=True, index=True)
    cache_key = Column(String, index=True)
    cache_expiry = Column(DateTime)
    cache_hit_count = Column(Integer, default=0)
    
    # Data processing
    processing_time_ms = Column(Integer)  # Time taken to process data
    transformation_applied = Column(JSON)  # Transformations applied
    aggregation_applied = Column(JSON)  # Aggregations applied
    
    # Cross-group data
    involved_groups = Column(JSON)  # Groups involved in data
    group_data_sources = Column(JSON)  # Data sources per group
    cross_group_correlations = Column(JSON)  # Cross-group correlations
    
    # Quality and validation
    validation_status = Column(String, default="valid")  # valid, invalid, warning
    validation_errors = Column(JSON)  # Validation errors
    data_completeness = Column(Float, default=1.0)  # Data completeness score
    data_accuracy = Column(Float, default=1.0)  # Data accuracy score
    
    # Widget reference
    widget_id = Column(String, ForeignKey('racine_dashboard_widgets.id'), nullable=False)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    widget = relationship("RacineDashboardWidget", back_populates="widget_data")


class RacineDashboardAlert(Base):
    """
    Dashboard alert model for threshold-based alerting and notifications.
    """
    __tablename__ = 'racine_dashboard_alerts'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Alert basic information
    alert_name = Column(String, nullable=False, index=True)
    alert_type = Column(String, nullable=False)  # threshold, trend, anomaly, comparison
    severity = Column(String, default="medium")  # low, medium, high, critical
    status = Column(String, default="active")  # active, triggered, acknowledged, resolved
    
    # Alert configuration
    alert_condition = Column(JSON, nullable=False)  # Alert condition
    threshold_config = Column(JSON)  # Threshold configuration
    comparison_config = Column(JSON)  # Comparison configuration
    evaluation_window = Column(Integer, default=300)  # Evaluation window in seconds
    
    # Alert trigger information
    trigger_data = Column(JSON)  # Data that triggered alert
    trigger_timestamp = Column(DateTime)
    trigger_value = Column(Float)
    threshold_value = Column(Float)
    
    # Notification configuration
    notification_channels = Column(JSON)  # Notification channels
    notification_templates = Column(JSON)  # Notification templates
    escalation_rules = Column(JSON)  # Escalation rules
    
    # Response tracking
    acknowledged_by = Column(String, ForeignKey('users.id'))
    acknowledged_at = Column(DateTime)
    resolved_by = Column(String, ForeignKey('users.id'))
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    
    # Dashboard and widget references
    dashboard_id = Column(String, ForeignKey('racine_dashboards.id'), nullable=False)
    widget_id = Column(String, ForeignKey('racine_dashboard_widgets.id'))
    
    # Alert lifecycle
    first_triggered = Column(DateTime, default=datetime.utcnow, index=True)
    last_triggered = Column(DateTime, default=datetime.utcnow)
    trigger_count = Column(Integer, default=1)
    
    # Cross-group impact
    affected_groups = Column(JSON)  # Groups affected by alert
    cross_group_implications = Column(JSON)  # Cross-group implications
    
    # Relationships
    dashboard = relationship("RacineDashboard")
    widget = relationship("RacineDashboardWidget")
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    resolver = relationship("User", foreign_keys=[resolved_by])


class RacineDashboardTemplate(Base):
    """
    Dashboard template model for reusable dashboard patterns and quick setup.
    """
    __tablename__ = 'racine_dashboard_templates'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Template basic information
    template_name = Column(String, nullable=False, index=True)
    description = Column(Text)
    template_category = Column(String, index=True)
    template_type = Column(SQLEnum(DashboardType), nullable=False)
    
    # Template configuration
    template_definition = Column(JSON, nullable=False)  # Complete template definition
    widget_templates = Column(JSON)  # Widget templates
    layout_templates = Column(JSON)  # Layout templates
    default_parameters = Column(JSON)  # Default parameters
    
    # Template metadata
    use_cases = Column(JSON)  # Documented use cases
    prerequisites = Column(JSON)  # Prerequisites
    target_audience = Column(JSON)  # Target audience
    complexity_level = Column(String, default="intermediate")
    
    # Cross-group configuration
    supported_groups = Column(JSON)  # Supported groups
    required_permissions = Column(JSON)  # Required permissions
    group_customizations = Column(JSON)  # Group-specific customizations
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    user_ratings = Column(JSON)  # User ratings
    user_feedback = Column(JSON)  # User feedback
    
    # Template lifecycle
    is_public = Column(Boolean, default=False, index=True)
    is_verified = Column(Boolean, default=False)
    version = Column(String, default="1.0.0")
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = relationship("User")


class RacineDashboardAudit(Base):
    """
    Comprehensive audit trail for dashboard operations.
    """
    __tablename__ = 'racine_dashboard_audit'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Audit event information
    event_type = Column(String, nullable=False, index=True)  # created, updated, viewed, exported
    event_description = Column(Text)
    event_data = Column(JSON)  # Detailed event data
    
    # Context information
    dashboard_id = Column(String, ForeignKey('racine_dashboards.id'))
    widget_id = Column(String, ForeignKey('racine_dashboard_widgets.id'))
    user_id = Column(String, ForeignKey('users.id'))
    
    # Change tracking
    changes_made = Column(JSON)  # Detailed changes made
    previous_values = Column(JSON)  # Previous values
    new_values = Column(JSON)  # New values
    
    # System information
    ip_address = Column(String)
    user_agent = Column(String)
    session_id = Column(String)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    dashboard = relationship("RacineDashboard")
    widget = relationship("RacineDashboardWidget")
    user = relationship("User")