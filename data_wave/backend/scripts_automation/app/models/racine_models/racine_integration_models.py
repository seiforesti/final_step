"""
Racine Integration Models
=========================

Advanced integration models for cross-group integration management with seamless
coordination, data flow mapping, and enterprise-grade connectivity across all 7 groups.

These models provide:
- Cross-group integration orchestration and management
- Data flow mapping and synchronization
- Service mesh coordination and connectivity
- API gateway and endpoint management
- Event-driven architecture and messaging
- Integration monitoring and health tracking
- Configuration management and versioning
- Error handling and recovery mechanisms

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


class IntegrationType(enum.Enum):
    """Integration type enumeration"""
    API_INTEGRATION = "api_integration"
    DATA_INTEGRATION = "data_integration"
    WORKFLOW_INTEGRATION = "workflow_integration"
    EVENT_INTEGRATION = "event_integration"
    SERVICE_INTEGRATION = "service_integration"
    DATABASE_INTEGRATION = "database_integration"
    MESSAGING_INTEGRATION = "messaging_integration"
    STREAM_INTEGRATION = "stream_integration"


class IntegrationStatus(enum.Enum):
    """Integration status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    FAILED = "failed"
    DEGRADED = "degraded"
    MAINTENANCE = "maintenance"
    DEPRECATED = "deprecated"


class DataFlowDirection(enum.Enum):
    """Data flow direction enumeration"""
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    BIDIRECTIONAL = "bidirectional"
    MULTICAST = "multicast"


class MessageType(enum.Enum):
    """Message type enumeration"""
    REQUEST = "request"
    RESPONSE = "response"
    EVENT = "event"
    NOTIFICATION = "notification"
    COMMAND = "command"
    QUERY = "query"
    HEARTBEAT = "heartbeat"


class RacineIntegration(Base):
    """
    Master integration model for comprehensive cross-group integration
    management and orchestration.
    """
    __tablename__ = 'racine_integrations'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Integration basic information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    integration_type = Column(SQLEnum(IntegrationType), nullable=False, index=True)
    status = Column(SQLEnum(IntegrationStatus), default=IntegrationStatus.PENDING, index=True)
    
    # Integration scope and configuration
    source_group = Column(String, nullable=False, index=True)
    target_groups = Column(JSON, nullable=False)  # List of target groups
    integration_scope = Column(JSON)  # Integration scope definition
    configuration = Column(JSON, nullable=False)  # Integration configuration
    
    # Connectivity and endpoints
    endpoint_configuration = Column(JSON)  # Endpoint configuration
    connection_details = Column(JSON)  # Connection details
    authentication_config = Column(JSON)  # Authentication configuration
    security_settings = Column(JSON)  # Security settings
    
    # Data flow and mapping
    data_flow_direction = Column(SQLEnum(DataFlowDirection), default=DataFlowDirection.BIDIRECTIONAL)
    data_mapping = Column(JSON)  # Data mapping rules
    transformation_rules = Column(JSON)  # Data transformation rules
    validation_rules = Column(JSON)  # Data validation rules
    
    # Performance and reliability
    performance_config = Column(JSON)  # Performance configuration
    reliability_config = Column(JSON)  # Reliability configuration
    retry_policy = Column(JSON)  # Retry policy
    timeout_settings = Column(JSON)  # Timeout settings
    
    # Monitoring and health
    health_check_config = Column(JSON)  # Health check configuration
    monitoring_config = Column(JSON)  # Monitoring configuration
    alerting_rules = Column(JSON)  # Alerting rules
    sla_requirements = Column(JSON)  # SLA requirements
    
    # Event handling and messaging
    event_configuration = Column(JSON)  # Event configuration
    message_routing = Column(JSON)  # Message routing rules
    event_filtering = Column(JSON)  # Event filtering rules
    dead_letter_config = Column(JSON)  # Dead letter queue configuration
    
    # Version control and lifecycle
    version = Column(String, default="1.0.0")
    previous_version_id = Column(String, ForeignKey('racine_integrations.id'))
    is_current_version = Column(Boolean, default=True, index=True)
    deployment_config = Column(JSON)  # Deployment configuration
    
    # Access control and governance
    access_policies = Column(JSON)  # Access control policies
    governance_rules = Column(JSON)  # Governance rules
    compliance_requirements = Column(JSON)  # Compliance requirements
    audit_settings = Column(JSON)  # Audit settings
    
    # Dependencies and relationships
    dependent_integrations = Column(JSON)  # Dependent integrations
    dependency_integrations = Column(JSON)  # Integration dependencies
    conflict_resolution = Column(JSON)  # Conflict resolution rules
    
    # Performance metrics
    throughput_target = Column(Float)  # Target throughput
    latency_target = Column(Float)  # Target latency in ms
    availability_target = Column(Float)  # Target availability percentage
    error_rate_threshold = Column(Float)  # Error rate threshold
    
    # Integration with orchestration
    orchestration_master_id = Column(String, ForeignKey('racine_orchestration_master.id'))
    
    # Audit and tracking fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = relationship("User")
    orchestration_master = relationship("RacineOrchestrationMaster")
    previous_version = relationship("RacineIntegration", remote_side=[id])
    endpoints = relationship("RacineIntegrationEndpoint", back_populates="integration", cascade="all, delete-orphan")
    data_flows = relationship("RacineDataFlow", back_populates="integration", cascade="all, delete-orphan")
    messages = relationship("RacineIntegrationMessage", back_populates="integration", cascade="all, delete-orphan")
    health_checks = relationship("RacineIntegrationHealthCheck", back_populates="integration", cascade="all, delete-orphan")


class RacineIntegrationEndpoint(Base):
    """
    Integration endpoint model for managing API endpoints
    and service connectivity points.
    """
    __tablename__ = 'racine_integration_endpoints'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Endpoint basic information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    endpoint_type = Column(String, nullable=False)  # rest_api, graphql, grpc, websocket, webhook
    url = Column(String, nullable=False)
    
    # Endpoint configuration
    http_method = Column(String)  # HTTP method for REST APIs
    headers = Column(JSON)  # Default headers
    query_parameters = Column(JSON)  # Default query parameters
    request_schema = Column(JSON)  # Request schema
    response_schema = Column(JSON)  # Response schema
    
    # Authentication and security
    authentication_type = Column(String)  # none, basic, bearer, oauth, api_key
    authentication_config = Column(JSON)  # Authentication configuration
    ssl_config = Column(JSON)  # SSL/TLS configuration
    rate_limiting = Column(JSON)  # Rate limiting configuration
    
    # Group mapping and routing
    source_group = Column(String, nullable=False, index=True)
    target_group = Column(String, nullable=False, index=True)
    routing_rules = Column(JSON)  # Routing rules
    load_balancing = Column(JSON)  # Load balancing configuration
    
    # Performance and reliability
    timeout_ms = Column(Integer, default=30000)  # Timeout in milliseconds
    retry_config = Column(JSON)  # Retry configuration
    circuit_breaker_config = Column(JSON)  # Circuit breaker configuration
    caching_config = Column(JSON)  # Caching configuration
    
    # Data transformation
    request_transformation = Column(JSON)  # Request transformation rules
    response_transformation = Column(JSON)  # Response transformation rules
    error_transformation = Column(JSON)  # Error transformation rules
    
    # Monitoring and logging
    logging_config = Column(JSON)  # Logging configuration
    metrics_config = Column(JSON)  # Metrics configuration
    tracing_config = Column(JSON)  # Distributed tracing configuration
    
    # Health and status
    is_enabled = Column(Boolean, default=True, index=True)
    health_status = Column(String, default="unknown")  # healthy, unhealthy, unknown
    last_health_check = Column(DateTime)
    error_count = Column(Integer, default=0)
    
    # Usage statistics
    request_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_rate = Column(Float, default=0.0)
    average_latency = Column(Float, default=0.0)
    
    # Integration reference
    integration_id = Column(String, ForeignKey('racine_integrations.id'), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    integration = relationship("RacineIntegration", back_populates="endpoints")


class RacineDataFlow(Base):
    """
    Data flow model for tracking and managing data movement
    between groups and systems.
    """
    __tablename__ = 'racine_data_flows'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Data flow basic information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    flow_type = Column(String, nullable=False)  # batch, streaming, real_time, event_driven
    direction = Column(SQLEnum(DataFlowDirection), nullable=False)
    
    # Source and destination
    source_group = Column(String, nullable=False, index=True)
    source_system = Column(String, nullable=False)
    source_endpoint = Column(String)
    destination_groups = Column(JSON, nullable=False)  # List of destination groups
    destination_systems = Column(JSON)  # Destination systems
    
    # Data characteristics
    data_type = Column(String, nullable=False)  # structured, semi_structured, unstructured
    data_format = Column(String)  # json, xml, csv, parquet, avro
    data_schema = Column(JSON)  # Data schema definition
    data_volume_estimate = Column(String)  # small, medium, large, very_large
    
    # Flow configuration
    flow_configuration = Column(JSON, nullable=False)  # Flow configuration
    scheduling_config = Column(JSON)  # Scheduling configuration
    trigger_conditions = Column(JSON)  # Trigger conditions
    processing_rules = Column(JSON)  # Data processing rules
    
    # Data transformation
    transformation_pipeline = Column(JSON)  # Transformation pipeline
    mapping_rules = Column(JSON)  # Data mapping rules
    enrichment_rules = Column(JSON)  # Data enrichment rules
    cleansing_rules = Column(JSON)  # Data cleansing rules
    
    # Quality and validation
    quality_rules = Column(JSON)  # Data quality rules
    validation_schema = Column(JSON)  # Validation schema
    error_handling = Column(JSON)  # Error handling configuration
    data_lineage = Column(JSON)  # Data lineage information
    
    # Performance and monitoring
    performance_metrics = Column(JSON)  # Performance metrics
    throughput_target = Column(Float)  # Target throughput
    latency_target = Column(Float)  # Target latency
    monitoring_config = Column(JSON)  # Monitoring configuration
    
    # Security and compliance
    encryption_config = Column(JSON)  # Encryption configuration
    access_controls = Column(JSON)  # Access controls
    retention_policy = Column(JSON)  # Data retention policy
    compliance_tags = Column(JSON)  # Compliance tags
    
    # Status and health
    status = Column(String, default="active")  # active, paused, error, disabled
    health_status = Column(String, default="healthy")  # healthy, degraded, unhealthy
    last_execution = Column(DateTime)
    next_execution = Column(DateTime)
    
    # Execution statistics
    execution_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    average_duration = Column(Float, default=0.0)
    
    # Integration reference
    integration_id = Column(String, ForeignKey('racine_integrations.id'), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    integration = relationship("RacineIntegration", back_populates="data_flows")
    flow_executions = relationship("RacineDataFlowExecution", back_populates="data_flow", cascade="all, delete-orphan")


class RacineDataFlowExecution(Base):
    """
    Data flow execution model for tracking individual
    data flow execution instances.
    """
    __tablename__ = 'racine_data_flow_executions'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Execution information
    execution_id = Column(String, nullable=False, index=True)
    status = Column(String, default="running")  # running, completed, failed, cancelled
    trigger_type = Column(String)  # scheduled, manual, event, api
    
    # Execution context
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)
    duration_ms = Column(Integer)  # Duration in milliseconds
    triggered_by = Column(String, ForeignKey('users.id'))
    
    # Data processing metrics
    records_processed = Column(Integer, default=0)
    records_success = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    records_skipped = Column(Integer, default=0)
    data_volume_bytes = Column(Integer, default=0)
    
    # Quality metrics
    quality_score = Column(Float)  # Data quality score
    validation_errors = Column(JSON)  # Validation errors
    quality_issues = Column(JSON)  # Quality issues found
    
    # Performance metrics
    throughput_rate = Column(Float)  # Records per second
    latency_metrics = Column(JSON)  # Latency metrics
    resource_usage = Column(JSON)  # Resource usage
    bottlenecks = Column(JSON)  # Performance bottlenecks
    
    # Error and debugging
    error_details = Column(JSON)  # Error details
    debug_information = Column(JSON)  # Debug information
    retry_attempts = Column(Integer, default=0)
    recovery_actions = Column(JSON)  # Recovery actions taken
    
    # Data lineage and tracking
    input_sources = Column(JSON)  # Input data sources
    output_destinations = Column(JSON)  # Output destinations
    transformation_applied = Column(JSON)  # Transformations applied
    data_lineage_trace = Column(JSON)  # Data lineage trace
    
    # Data flow reference
    data_flow_id = Column(String, ForeignKey('racine_data_flows.id'), nullable=False)
    
    # Relationships
    data_flow = relationship("RacineDataFlow", back_populates="flow_executions")
    trigger_user = relationship("User")


class RacineIntegrationMessage(Base):
    """
    Integration message model for tracking messages and events
    flowing through integrations.
    """
    __tablename__ = 'racine_integration_messages'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Message basic information
    message_id = Column(String, nullable=False, index=True)
    message_type = Column(SQLEnum(MessageType), nullable=False)
    content_type = Column(String, default="application/json")
    
    # Message routing
    source_group = Column(String, nullable=False, index=True)
    source_endpoint = Column(String)
    target_group = Column(String, nullable=False, index=True)
    target_endpoint = Column(String)
    routing_key = Column(String, index=True)
    
    # Message content
    headers = Column(JSON)  # Message headers
    payload = Column(JSON)  # Message payload
    message_metadata = Column(JSON)  # Message metadata
    correlation_id = Column(String, index=True)  # Correlation ID
    
    # Message processing
    status = Column(String, default="pending")  # pending, processing, delivered, failed
    priority = Column(Integer, default=5)  # Message priority (1-10)
    ttl_seconds = Column(Integer)  # Time to live in seconds
    retry_count = Column(Integer, default=0)
    
    # Timing information
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    expired_at = Column(DateTime)
    
    # Processing results
    processing_duration_ms = Column(Integer)  # Processing duration
    response_payload = Column(JSON)  # Response payload
    error_details = Column(JSON)  # Error details if failed
    
    # Message transformation
    original_payload = Column(JSON)  # Original payload before transformation
    transformation_applied = Column(JSON)  # Transformations applied
    validation_results = Column(JSON)  # Validation results
    
    # Quality and monitoring
    quality_score = Column(Float)  # Message quality score
    processing_metrics = Column(JSON)  # Processing metrics
    performance_data = Column(JSON)  # Performance data
    
    # Integration reference
    integration_id = Column(String, ForeignKey('racine_integrations.id'), nullable=False)
    
    # Relationships
    integration = relationship("RacineIntegration", back_populates="messages")


class RacineIntegrationHealthCheck(Base):
    """
    Integration health check model for monitoring integration
    health and availability.
    """
    __tablename__ = 'racine_integration_health_checks'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Health check basic information
    check_name = Column(String, nullable=False, index=True)
    check_type = Column(String, nullable=False)  # endpoint, service, database, queue
    description = Column(Text)
    
    # Health check configuration
    check_configuration = Column(JSON, nullable=False)  # Health check configuration
    check_interval_seconds = Column(Integer, default=60)  # Check interval
    timeout_seconds = Column(Integer, default=30)  # Check timeout
    retry_count = Column(Integer, default=3)  # Retry count
    
    # Health status
    status = Column(String, default="unknown")  # healthy, unhealthy, unknown, degraded
    last_check_time = Column(DateTime, default=datetime.utcnow, index=True)
    last_success_time = Column(DateTime)
    consecutive_failures = Column(Integer, default=0)
    
    # Health metrics
    response_time_ms = Column(Float)  # Response time in milliseconds
    availability_percentage = Column(Float, default=100.0)  # Availability percentage
    error_rate = Column(Float, default=0.0)  # Error rate
    
    # Health check results
    check_results = Column(JSON)  # Detailed check results
    error_details = Column(JSON)  # Error details if unhealthy
    diagnostic_info = Column(JSON)  # Diagnostic information
    
    # Alerting and notifications
    alert_thresholds = Column(JSON)  # Alert thresholds
    notification_config = Column(JSON)  # Notification configuration
    escalation_rules = Column(JSON)  # Escalation rules
    
    # Historical data
    uptime_percentage_24h = Column(Float)  # 24-hour uptime percentage
    uptime_percentage_7d = Column(Float)  # 7-day uptime percentage
    uptime_percentage_30d = Column(Float)  # 30-day uptime percentage
    
    # Dependency tracking
    dependent_checks = Column(JSON)  # Dependent health checks
    dependency_checks = Column(JSON)  # Health check dependencies
    cascade_failures = Column(Boolean, default=False)  # Cascade failure indicator
    
    # Integration reference
    integration_id = Column(String, ForeignKey('racine_integrations.id'), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    integration = relationship("RacineIntegration", back_populates="health_checks")


class RacineServiceMesh(Base):
    """
    Service mesh model for managing service-to-service
    communication and coordination.
    """
    __tablename__ = 'racine_service_mesh'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Service mesh basic information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    mesh_type = Column(String, default="istio")  # istio, linkerd, consul_connect, custom
    
    # Mesh configuration
    mesh_configuration = Column(JSON, nullable=False)  # Mesh configuration
    security_policies = Column(JSON)  # Security policies
    traffic_policies = Column(JSON)  # Traffic management policies
    observability_config = Column(JSON)  # Observability configuration
    
    # Service registration
    registered_services = Column(JSON)  # Registered services
    service_discovery_config = Column(JSON)  # Service discovery configuration
    load_balancing_config = Column(JSON)  # Load balancing configuration
    
    # Cross-group connectivity
    group_connections = Column(JSON)  # Inter-group connections
    connection_policies = Column(JSON)  # Connection policies
    authentication_config = Column(JSON)  # Authentication configuration
    authorization_policies = Column(JSON)  # Authorization policies
    
    # Traffic management
    routing_rules = Column(JSON)  # Traffic routing rules
    circuit_breaker_config = Column(JSON)  # Circuit breaker configuration
    retry_policies = Column(JSON)  # Retry policies
    timeout_policies = Column(JSON)  # Timeout policies
    
    # Security and encryption
    mtls_config = Column(JSON)  # Mutual TLS configuration
    certificate_management = Column(JSON)  # Certificate management
    encryption_policies = Column(JSON)  # Encryption policies
    
    # Monitoring and observability
    metrics_collection = Column(JSON)  # Metrics collection configuration
    distributed_tracing = Column(JSON)  # Distributed tracing configuration
    logging_config = Column(JSON)  # Logging configuration
    
    # Health and status
    status = Column(String, default="active")  # active, inactive, degraded, failed
    health_status = Column(String, default="healthy")  # healthy, degraded, unhealthy
    deployment_status = Column(String, default="deployed")  # deployed, deploying, failed
    
    # Performance metrics
    connection_count = Column(Integer, default=0)
    request_volume = Column(Integer, default=0)
    average_latency = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = relationship("User")


class RacineAPIGateway(Base):
    """
    API Gateway model for managing API access and routing
    across all groups.
    """
    __tablename__ = 'racine_api_gateways'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Gateway basic information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    gateway_type = Column(String, default="kong")  # kong, envoy, nginx, aws_api_gateway
    base_url = Column(String, nullable=False)
    
    # Gateway configuration
    gateway_configuration = Column(JSON, nullable=False)  # Gateway configuration
    routing_configuration = Column(JSON)  # Routing configuration
    middleware_config = Column(JSON)  # Middleware configuration
    
    # API management
    registered_apis = Column(JSON)  # Registered APIs
    api_versions = Column(JSON)  # API version management
    deprecation_policies = Column(JSON)  # API deprecation policies
    
    # Cross-group routing
    group_routing_rules = Column(JSON)  # Group-specific routing rules
    cross_group_policies = Column(JSON)  # Cross-group policies
    traffic_splitting = Column(JSON)  # Traffic splitting configuration
    
    # Security and authentication
    authentication_providers = Column(JSON)  # Authentication providers
    authorization_policies = Column(JSON)  # Authorization policies
    api_key_management = Column(JSON)  # API key management
    oauth_configuration = Column(JSON)  # OAuth configuration
    
    # Rate limiting and throttling
    rate_limiting_config = Column(JSON)  # Rate limiting configuration
    throttling_policies = Column(JSON)  # Throttling policies
    quota_management = Column(JSON)  # Quota management
    
    # Monitoring and analytics
    metrics_config = Column(JSON)  # Metrics configuration
    analytics_config = Column(JSON)  # Analytics configuration
    audit_logging = Column(JSON)  # Audit logging configuration
    
    # Caching and performance
    caching_config = Column(JSON)  # Caching configuration
    compression_config = Column(JSON)  # Compression configuration
    cdn_integration = Column(JSON)  # CDN integration
    
    # Health and status
    status = Column(String, default="active")  # active, inactive, maintenance
    health_status = Column(String, default="healthy")  # healthy, degraded, unhealthy
    
    # Performance metrics
    total_requests = Column(Integer, default=0)
    successful_requests = Column(Integer, default=0)
    failed_requests = Column(Integer, default=0)
    average_response_time = Column(Float, default=0.0)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = relationship("User")


class RacineIntegrationAudit(Base):
    """
    Comprehensive audit trail for integration operations.
    """
    __tablename__ = 'racine_integration_audit'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Audit event information
    event_type = Column(String, nullable=False, index=True)  # created, updated, executed, failed
    event_description = Column(Text)
    event_data = Column(JSON)  # Detailed event data
    
    # Context information
    integration_id = Column(String, ForeignKey('racine_integrations.id'))
    endpoint_id = Column(String, ForeignKey('racine_integration_endpoints.id'))
    user_id = Column(String, ForeignKey('users.id'))
    
    # Change tracking
    changes_made = Column(JSON)  # Detailed changes made
    previous_values = Column(JSON)  # Previous values
    new_values = Column(JSON)  # New values
    
    # System information
    ip_address = Column(String)
    user_agent = Column(String)
    request_id = Column(String)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    integration = relationship("RacineIntegration")
    endpoint = relationship("RacineIntegrationEndpoint")
    user = relationship("User")