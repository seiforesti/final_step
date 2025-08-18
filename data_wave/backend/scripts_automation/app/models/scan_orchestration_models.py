"""
Enterprise Scan Orchestration Models
Comprehensive orchestration models for enterprise-grade distributed caching,
cache partitioning, and cache synchronization capabilities.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator
from sqlmodel import Column, Field, Relationship, SQLModel, ARRAY, JSON as JSONB, String
from sqlalchemy import Index

# ============================================================================
# ENUMS
# ============================================================================

class CacheNodeStatus(str, Enum):
    """Cache node status levels"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    FAILED = "failed"
    RECOVERING = "recovering"
    SYNCHRONIZING = "synchronizing"

class CacheNodeType(str, Enum):
    """Types of cache nodes"""
    PRIMARY = "primary"
    SECONDARY = "secondary"
    REPLICA = "replica"
    EDGE = "edge"
    GATEWAY = "gateway"
    COORDINATOR = "coordinator"

class PartitionStrategy(str, Enum):
    """Cache partitioning strategies"""
    CONSISTENT_HASHING = "consistent_hashing"
    RANGE_BASED = "range_based"
    DIRECTORY_BASED = "directory_based"
    DYNAMIC = "dynamic"
    INTELLIGENT = "intelligent"

class SynchronizationMode(str, Enum):
    """Cache synchronization modes"""
    SYNCHRONOUS = "synchronous"
    ASYNCHRONOUS = "asynchronous"
    SEMI_SYNCHRONOUS = "semi_synchronous"
    EVENTUAL = "eventual"
    STRONG = "strong"

class OrchestrationStatus(str, Enum):
    """Status of orchestration operations"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RECOVERING = "recovering"

class WorkflowStatus(str, Enum):
    """Status of workflow operations"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ResourceType(str, Enum):
    """Types of resources managed by orchestrator"""
    CPU = "cpu"
    MEMORY = "memory"
    STORAGE = "storage"
    NETWORK = "network"
    DATABASE_CONNECTIONS = "database_connections"
    API_RATE_LIMITS = "api_rate_limits"

class SchedulingStrategy(str, Enum):
    """Scheduling strategies for orchestration"""
    FIFO = "fifo"
    PRIORITY = "priority"
    ROUND_ROBIN = "round_robin"
    INTELLIGENT = "intelligent"
    ADAPTIVE = "adaptive"

class WorkflowType(str, Enum):
    """Types of workflows"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONDITIONAL = "conditional"
    HYBRID = "hybrid"

class DependencyType(str, Enum):
    """Types of dependencies"""
    STRONG = "strong"
    WEAK = "weak"
    OPTIONAL = "optional"

class PriorityLevel(str, Enum):
    """Priority levels for orchestration"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

class ExecutionMode(str, Enum):
    """Execution modes for orchestration"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    HYBRID = "hybrid"

class OptimizationGoal(str, Enum):
    """Optimization goals for orchestration"""
    PERFORMANCE = "performance"
    COST = "cost"
    QUALITY = "quality"
    BALANCED = "balanced"
# ============================================================================
# ORCHESTRATION EXECUTION METRICS
# ============================================================================

class OrchestrationExecution(SQLModel, table=True):
    """Persisted orchestration execution metrics for performance dashboards."""
    __tablename__ = "orchestration_executions"

    id: Optional[int] = Field(default=None, primary_key=True)
    orchestration_id: str = Field(index=True)
    scan_request_id: Optional[str] = Field(default=None, index=True)
    user_id: Optional[str] = Field(default=None, index=True)
    data_source_id: Optional[int] = Field(default=None, index=True)
    started_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = Field(default=None, index=True)
    status: str = Field(default="completed", index=True)
    duration_seconds: Optional[float] = Field(default=None)
    rules_executed: Optional[int] = Field(default=None)
    findings_count: Optional[int] = Field(default=None)
    data_quality_score: Optional[float] = Field(default=None)
    cpu_usage_percent: Optional[float] = Field(default=None)
    memory_usage_mb: Optional[float] = Field(default=None)
    error_message: Optional[str] = Field(default=None)
    extra_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))

    __table_args__ = (
        Index('ix_orch_exec_time', 'started_at', 'completed_at'),
    )

# ============================================================================
# CACHE NODE MODELS
# ============================================================================

class CacheNode(SQLModel, table=True):
    """Enterprise cache node model for distributed caching infrastructure"""
    
    __tablename__ = "cache_nodes"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    node_name: str = Field(..., description="Unique name identifier for the cache node")
    node_type: CacheNodeType = Field(..., description="Type of cache node")
    host_address: str = Field(..., description="Host address/IP of the cache node")
    port: int = Field(..., description="Port number for the cache node")
    memory_capacity: int = Field(..., description="Memory capacity in MB")
    is_active: bool = Field(default=True, description="Whether the node is currently active")
    status: CacheNodeStatus = Field(default=CacheNodeStatus.ACTIVE, description="Current status of the node")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Node creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    # Performance metrics
    current_memory_usage: Optional[int] = Field(default=None, description="Current memory usage in MB")
    current_connection_count: Optional[int] = Field(default=None, description="Current number of connections")
    response_time_ms: Optional[float] = Field(default=None, description="Average response time in milliseconds")
    throughput_ops_per_sec: Optional[float] = Field(default=None, description="Operations per second throughput")
    
    # Configuration
    cache_strategy: Optional[str] = Field(default=None, description="Cache strategy configuration")
    eviction_policy: Optional[str] = Field(default=None, description="Eviction policy configuration")
    ttl_seconds: Optional[int] = Field(default=None, description="Default TTL in seconds")
    
    # Relationships
    distributed_cache_id: Optional[UUID] = Field(default=None, foreign_key="distributed_caches.id", description="Parent distributed cache")
    distributed_cache: Optional["DistributedCache"] = Relationship(back_populates="nodes")
    partitions: List["CachePartition"] = Relationship(back_populates="node")
    synchronizations: List["CacheSynchronization"] = Relationship(back_populates="source_node")
    
    class Config:
        arbitrary_types_allowed = True

# ============================================================================
# DISTRIBUTED CACHE MODELS
# ============================================================================

class DistributedCache(SQLModel, table=True):
    """Enterprise distributed cache model for cache cluster management"""
    
    __tablename__ = "distributed_caches"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    cache_name: str = Field(..., description="Unique name for the distributed cache")
    cache_type: str = Field(..., description="Type of distributed cache (redis, memcached, hybrid)")
    cluster_size: int = Field(..., description="Number of nodes in the cache cluster")
    replication_factor: int = Field(default=2, description="Replication factor for data redundancy")
    partition_count: int = Field(default=16, description="Number of cache partitions")
    partition_strategy: PartitionStrategy = Field(default=PartitionStrategy.CONSISTENT_HASHING, description="Partitioning strategy")
    
    # Configuration
    consistency_level: str = Field(default="eventual", description="Consistency level for the cache")
    compression_enabled: bool = Field(default=True, description="Whether compression is enabled")
    encryption_enabled: bool = Field(default=False, description="Whether encryption is enabled")
    monitoring_enabled: bool = Field(default=True, description="Whether monitoring is enabled")
    
    # Status
    is_active: bool = Field(default=True, description="Whether the distributed cache is active")
    health_status: str = Field(default="healthy", description="Overall health status")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    # Relationships
    nodes: List["CacheNode"] = Relationship(back_populates="distributed_cache")
    partitions: List["CachePartition"] = Relationship(back_populates="distributed_cache")
    
    class Config:
        arbitrary_types_allowed = True

# ============================================================================
# CACHE PARTITION MODELS
# ============================================================================

class CachePartition(SQLModel, table=True):
    """Enterprise cache partition model for intelligent cache sharding"""
    
    __tablename__ = "cache_partitions"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    partition_name: str = Field(..., description="Unique name for the cache partition")
    partition_index: int = Field(..., description="Index/ID of the partition")
    partition_key_range: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Key range for this partition")
    
    # Node assignment
    node_id: UUID = Field(..., foreign_key="cache_nodes.id", description="Assigned cache node")
    distributed_cache_id: UUID = Field(..., foreign_key="distributed_caches.id", description="Parent distributed cache")
    
    # Performance metrics
    current_size_mb: Optional[int] = Field(default=None, description="Current partition size in MB")
    key_count: Optional[int] = Field(default=None, description="Number of keys in partition")
    hit_rate: Optional[float] = Field(default=None, description="Cache hit rate percentage")
    eviction_count: Optional[int] = Field(default=None, description="Number of evictions")
    
    # Configuration
    max_size_mb: int = Field(default=1024, description="Maximum partition size in MB")
    eviction_policy: str = Field(default="lru", description="Eviction policy for this partition")
    ttl_seconds: Optional[int] = Field(default=None, description="Default TTL for partition")
    
    # Status
    is_active: bool = Field(default=True, description="Whether partition is active")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    # Relationships
    node: CacheNode = Relationship(back_populates="partitions")
    distributed_cache: DistributedCache = Relationship(back_populates="partitions")
    
    class Config:
        arbitrary_types_allowed = True

# ============================================================================
# CACHE SYNCHRONIZATION MODELS
# ============================================================================

class CacheSynchronization(SQLModel, table=True):
    """Enterprise cache synchronization model for cross-node data consistency"""
    
    __tablename__ = "cache_synchronizations"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    sync_id: str = Field(..., description="Unique synchronization identifier")
    
    # Node information
    source_node_id: UUID = Field(..., foreign_key="cache_nodes.id", description="Source cache node")
    target_node_id: Optional[UUID] = Field(default=None, description="Target cache node (if applicable)")
    
    # Synchronization details
    sync_mode: SynchronizationMode = Field(..., description="Synchronization mode")
    sync_type: str = Field(..., description="Type of synchronization (full, incremental, selective)")
    keys_synced: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Keys that were synchronized")
    
    # Performance metrics
    sync_duration_ms: Optional[float] = Field(default=None, description="Synchronization duration in milliseconds")
    keys_count: Optional[int] = Field(default=None, description="Number of keys synchronized")
    data_size_mb: Optional[float] = Field(default=None, description="Data size synchronized in MB")
    
    # Status
    status: str = Field(default="pending", description="Synchronization status")
    error_message: Optional[str] = Field(default=None, description="Error message if failed")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Completion timestamp")
    
    # Relationships
    source_node: CacheNode = Relationship(back_populates="synchronizations")
    
    class Config:
        arbitrary_types_allowed = True

# ============================================================================
# EDGE COMPUTING MODELS
# ============================================================================

class EdgeNode(SQLModel, table=True):
    """Enterprise edge node model for distributed edge computing infrastructure"""
    
    __tablename__ = "edge_nodes"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    node_name: str = Field(..., description="Unique name identifier for the edge node")
    node_type: str = Field(..., description="Type of edge node (gateway, compute, storage, hybrid)")
    compute_capacity: float = Field(..., description="Compute capacity in CPU cores")
    memory_capacity: float = Field(..., description="Memory capacity in GB")
    storage_capacity: float = Field(..., description="Storage capacity in GB")
    network_bandwidth: float = Field(..., description="Network bandwidth in Mbps")
    geographical_location: str = Field(..., description="Geographical location of the node")
    security_level: str = Field(default="standard", description="Security level of the node")
    specialized_capabilities: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Specialized capabilities")
    
    # Status and health
    is_active: bool = Field(default=True, description="Whether the node is currently active")
    health_status: str = Field(default="healthy", description="Current health status")
    last_heartbeat: Optional[datetime] = Field(default=None, description="Last heartbeat timestamp")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Node creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    # Performance metrics
    current_cpu_usage: Optional[float] = Field(default=None, description="Current CPU usage percentage")
    current_memory_usage: Optional[float] = Field(default=None, description="Current memory usage percentage")
    current_storage_usage: Optional[float] = Field(default=None, description="Current storage usage percentage")
    current_network_usage: Optional[float] = Field(default=None, description="Current network usage percentage")
    
    # Relationships
    workloads: List["EdgeWorkload"] = Relationship(back_populates="edge_node")
    distributed_tasks: List["DistributedTask"] = Relationship(back_populates="assigned_node")
    synchronizations: List["EdgeSynchronization"] = Relationship(back_populates="source_node")
    
    class Config:
        arbitrary_types_allowed = True

class EdgeWorkload(SQLModel, table=True):
    """Enterprise edge workload model for workload management and scheduling"""
    
    __tablename__ = "edge_workloads"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    workload_name: str = Field(..., description="Unique name for the workload")
    workload_type: str = Field(..., description="Type of workload (scan_processing, data_ingestion, etc.)")
    priority: str = Field(default="normal", description="Workload priority (low, normal, high, critical)")
    
    # Resource requirements
    required_cpu: float = Field(..., description="Required CPU cores")
    required_memory: float = Field(..., description="Required memory in GB")
    required_storage: float = Field(..., description="Required storage in GB")
    required_bandwidth: float = Field(..., description="Required network bandwidth in Mbps")
    
    # Assignment and execution
    edge_node_id: UUID = Field(..., foreign_key="edge_nodes.id", description="Assigned edge node")
    status: str = Field(default="pending", description="Workload status")
    started_at: Optional[datetime] = Field(default=None, description="Start timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Completion timestamp")
    
    # Performance metrics
    execution_time_seconds: Optional[float] = Field(default=None, description="Execution time in seconds")
    resource_utilization: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource utilization metrics")
    
    # Configuration
    retry_count: int = Field(default=0, description="Number of retry attempts")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    timeout_seconds: int = Field(default=3600, description="Timeout in seconds")
    
    # Relationships
    edge_node: EdgeNode = Relationship(back_populates="workloads")
    
    class Config:
        arbitrary_types_allowed = True

class DistributedTask(SQLModel, table=True):
    """Enterprise distributed task model for task distribution and coordination"""
    
    __tablename__ = "distributed_tasks"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    task_name: str = Field(..., description="Unique name for the distributed task")
    task_type: str = Field(..., description="Type of distributed task")
    task_description: Optional[str] = Field(default=None, description="Task description")
    
    # Task assignment
    assigned_node_id: UUID = Field(..., foreign_key="edge_nodes.id", description="Assigned edge node")
    parent_task_id: Optional[UUID] = Field(default=None, description="Parent task ID if part of workflow")
    
    # Execution details
    status: str = Field(default="pending", description="Task execution status")
    priority: str = Field(default="normal", description="Task priority")
    progress_percentage: float = Field(default=0.0, description="Task progress percentage")
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Task creation timestamp")
    started_at: Optional[datetime] = Field(default=None, description="Task start timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Task completion timestamp")
    deadline: Optional[datetime] = Field(default=None, description="Task deadline")
    
    # Performance metrics
    execution_time_seconds: Optional[float] = Field(default=None, description="Execution time in seconds")
    resource_consumption: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource consumption metrics")
    
    # Relationships
    assigned_node: EdgeNode = Relationship(back_populates="distributed_tasks")
    
    class Config:
        arbitrary_types_allowed = True

class EdgeSynchronization(SQLModel, table=True):
    """Enterprise edge synchronization model for cross-node data consistency"""
    
    __tablename__ = "edge_synchronizations"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    sync_id: str = Field(..., description="Unique synchronization identifier")
    
    # Node information
    source_node_id: UUID = Field(..., foreign_key="edge_nodes.id", description="Source edge node")
    target_node_id: Optional[UUID] = Field(default=None, description="Target edge node (if applicable)")
    
    # Synchronization details
    sync_mode: str = Field(..., description="Synchronization mode (real_time, periodic, event_driven, on_demand)")
    sync_type: str = Field(..., description="Type of synchronization (full, incremental, selective)")
    data_synced: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Data items that were synchronized")
    
    # Performance metrics
    sync_duration_ms: Optional[float] = Field(default=None, description="Synchronization duration in milliseconds")
    data_size_mb: Optional[float] = Field(default=None, description="Data size synchronized in MB")
    
    # Status
    status: str = Field(default="pending", description="Synchronization status")
    error_message: Optional[str] = Field(default=None, description="Error message if failed")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Completion timestamp")
    
    # Relationships
    source_node: EdgeNode = Relationship(back_populates="synchronizations")
    
    class Config:
        arbitrary_types_allowed = True

# ============================================================================
# ORCHESTRATION PIPELINE MODELS
# ============================================================================

class OrchestrationPipeline(SQLModel, table=True):
    """Enterprise orchestration pipeline model for advanced workflow orchestration"""
    
    __tablename__ = "orchestration_pipelines"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    pipeline_name: str = Field(..., description="Unique name for the orchestration pipeline")
    pipeline_type: str = Field(..., description="Type of pipeline (data_processing, ml_training, scan_orchestration, etc.)")
    pipeline_version: str = Field(..., description="Pipeline version identifier")
    description: Optional[str] = Field(default=None, description="Pipeline description")
    
    # Pipeline configuration
    pipeline_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Complete pipeline configuration")
    workflow_steps: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Ordered list of workflow step identifiers")
    dependencies: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSONB), description="Step dependencies mapping")
    
    # Execution settings
    max_concurrent_executions: int = Field(default=5, description="Maximum concurrent pipeline executions")
    timeout_seconds: int = Field(default=7200, description="Pipeline execution timeout in seconds")
    retry_policy: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Retry policy configuration")
    
    # Resource requirements
    required_cpu_cores: float = Field(default=2.0, description="Required CPU cores for pipeline execution")
    required_memory_gb: float = Field(default=4.0, description="Required memory in GB")
    required_storage_gb: float = Field(default=10.0, description="Required storage in GB")
    required_network_bandwidth_mbps: float = Field(default=100.0, description="Required network bandwidth in Mbps")
    
    # Status and lifecycle
    is_active: bool = Field(default=True, description="Whether the pipeline is currently active")
    execution_status: str = Field(default="idle", description="Current execution status")
    last_execution_at: Optional[datetime] = Field(default=None, description="Last execution timestamp")
    next_scheduled_execution: Optional[datetime] = Field(default=None, description="Next scheduled execution")
    
    # Performance metrics
    total_executions: int = Field(default=0, description="Total number of pipeline executions")
    successful_executions: int = Field(default=0, description="Number of successful executions")
    failed_executions: int = Field(default=0, description="Number of failed executions")
    average_execution_time_seconds: Optional[float] = Field(default=None, description="Average execution time in seconds")
    success_rate_percentage: Optional[float] = Field(default=None, description="Success rate percentage")
    
    # Monitoring and alerting
    monitoring_enabled: bool = Field(default=True, description="Whether monitoring is enabled")
    alerting_enabled: bool = Field(default=True, description="Whether alerting is enabled")
    alert_thresholds: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Alert threshold configurations")
    
    # Security and compliance
    security_level: str = Field(default="standard", description="Security level (standard, enhanced, enterprise)")
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Compliance requirements")
    access_control: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Access control configuration")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Pipeline creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    activated_at: Optional[datetime] = Field(default=None, description="Activation timestamp")
    deactivated_at: Optional[datetime] = Field(default=None, description="Deactivation timestamp")
    
    class Config:
        arbitrary_types_allowed = True

class StreamProcessingConfig(SQLModel, table=True):
    """Enterprise stream processing configuration model for real-time data processing"""
    
    __tablename__ = "stream_processing_configs"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    config_name: str = Field(..., description="Unique name for the stream processing configuration")
    config_type: str = Field(..., description="Type of stream processing (kafka, kinesis, pubsub, custom)")
    description: Optional[str] = Field(default=None, description="Configuration description")
    
    # Stream configuration
    stream_source: str = Field(..., description="Stream source identifier (topic, stream, channel)")
    stream_format: str = Field(..., description="Data format (json, avro, protobuf, xml, binary)")
    encoding: str = Field(default="utf-8", description="Data encoding")
    compression: str = Field(default="none", description="Compression algorithm (none, gzip, snappy, lz4)")
    
    # Processing settings
    batch_size: int = Field(default=1000, description="Batch size for processing")
    batch_timeout_ms: int = Field(default=5000, description="Batch timeout in milliseconds")
    max_concurrent_processors: int = Field(default=10, description="Maximum concurrent processors")
    processing_mode: str = Field(default="streaming", description="Processing mode (streaming, micro_batch, batch)")
    
    # Data transformation
    transformation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Data transformation rules")
    schema_validation: bool = Field(default=True, description="Whether to validate data schema")
    data_quality_checks: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Data quality check types")
    
    # Error handling
    error_handling_strategy: str = Field(default="dead_letter_queue", description="Error handling strategy")
    max_retry_attempts: int = Field(default=3, description="Maximum retry attempts for failed records")
    retry_backoff_ms: int = Field(default=1000, description="Retry backoff in milliseconds")
    dead_letter_topic: Optional[str] = Field(default=None, description="Dead letter queue topic")
    
    # Performance tuning
    buffer_size_mb: int = Field(default=100, description="Buffer size in MB")
    flush_interval_ms: int = Field(default=1000, description="Flush interval in milliseconds")
    parallelism_factor: int = Field(default=1, description="Parallelism factor for processing")
    
    # Monitoring and metrics
    metrics_enabled: bool = Field(default=True, description="Whether metrics collection is enabled")
    latency_threshold_ms: int = Field(default=1000, description="Latency threshold in milliseconds")
    throughput_threshold_records_per_sec: int = Field(default=10000, description="Throughput threshold")
    
    # Security and authentication
    authentication_enabled: bool = Field(default=False, description="Whether authentication is enabled")
    authentication_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Authentication configuration")
    encryption_enabled: bool = Field(default=False, description="Whether encryption is enabled")
    encryption_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Encryption configuration")
    
    # Integration settings
    external_system_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="External system configuration")
    webhook_endpoints: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Webhook endpoints for notifications")
    
    # Status and lifecycle
    is_active: bool = Field(default=True, description="Whether the configuration is currently active")
    status: str = Field(default="configured", description="Configuration status")
    last_modified_by: Optional[str] = Field(default=None, description="Last modifier identifier")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Configuration creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    activated_at: Optional[datetime] = Field(default=None, description="Activation timestamp")
    deactivated_at: Optional[datetime] = Field(default=None, description="Deactivation timestamp")
    
    class Config:
        arbitrary_types_allowed = True

# ============================================================================
# SCAN ORCHESTRATION MODELS
# ============================================================================

class ScanOrchestration(SQLModel, table=True):
    """Enterprise-grade scan orchestration model for advanced data governance."""
    __tablename__ = "scan_orchestrations"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    orchestration_id: str = Field(unique=True, index=True)
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(default=None)
    orchestration_type: str = Field(..., max_length=100)
    status: str = Field(default="draft", max_length=50)
    priority_level: int = Field(default=5, ge=1, le=10)
    target_data_sources: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    orchestration_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    created_by: str = Field(..., max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    
    class Config:
        arbitrary_types_allowed = True


class OrchestrationStep(SQLModel, table=True):
    """Enterprise-grade orchestration step model for advanced scan orchestration."""
    __tablename__ = "orchestration_steps"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    step_id: str = Field(unique=True, index=True)
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(default=None)
    step_type: str = Field(..., max_length=100)
    step_order: int = Field(..., ge=1)
    status: str = Field(default="pending", max_length=50)
    orchestration_id: UUID = Field(..., foreign_key="scan_orchestration_jobs.id")
    step_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    created_by: str = Field(..., max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    
    class Config:
        arbitrary_types_allowed = True


class ScanOrchestrationMaster(SQLModel, table=True):
    """
    Enterprise-grade scan orchestration master model for advanced data governance.
    
    This model serves as the central coordinator for complex scan orchestration
    operations, managing multiple orchestrations and their interdependencies.
    """
    __tablename__ = "scan_orchestration_masters"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    master_id: str = Field(unique=True, index=True, description="Unique master orchestration identifier")
    
    # Master orchestration identification
    name: str = Field(..., max_length=255, description="Master orchestration name")
    display_name: Optional[str] = Field(max_length=255, description="Human-readable display name")
    description: Optional[str] = Field(default=None, description="Detailed description")
    master_type: str = Field(..., max_length=100, description="Type of master orchestration")
    category: str = Field(..., max_length=100, description="Orchestration category")
    
    # Master orchestration strategy
    orchestration_strategy: str = Field(..., max_length=100, description="Master orchestration strategy")
    execution_mode: str = Field(..., max_length=50, description="Execution mode (sequential, parallel, hybrid)")
    priority_level: int = Field(default=5, ge=1, le=10, description="Priority level (1=highest, 10=lowest)")
    complexity_score: Optional[float] = Field(default=None, ge=0.0, le=10.0, description="Complexity assessment")
    
    # Scope and targets
    target_data_sources: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Target data source identifiers")
    target_rule_sets: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Target rule set identifiers")
    target_environments: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Target environments")
    scope_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Detailed scope definition")
    
    # Advanced orchestration features
    ai_optimization_enabled: bool = Field(default=False, description="Whether AI optimization is enabled")
    machine_learning_enabled: bool = Field(default=False, description="Whether ML capabilities are enabled")
    adaptive_execution: bool = Field(default=False, description="Whether execution adapts to conditions")
    real_time_monitoring: bool = Field(default=True, description="Whether real-time monitoring is enabled")
    
    # Performance and resource management
    estimated_duration_minutes: Optional[int] = Field(default=None, description="Estimated execution duration")
    max_concurrent_executions: Optional[int] = Field(default=None, description="Maximum concurrent executions")
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource requirements")
    timeout_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Timeout configuration")
    
    # Dependencies and relationships
    dependencies: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Dependency identifiers")
    prerequisite_orchestrations: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Prerequisite orchestration IDs")
    dependent_orchestrations: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Dependent orchestration IDs")
    
    # Compliance and governance
    compliance_frameworks: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Compliance frameworks")
    regulatory_requirements: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Regulatory requirements")
    audit_trail_required: bool = Field(default=True, description="Whether audit trail is required")
    data_retention_policy: Optional[str] = Field(max_length=255, description="Data retention policy")
    
    # Status and lifecycle
    status: str = Field(default="draft", max_length=50, description="Current status")
    lifecycle_phase: str = Field(default="planning", max_length=50, description="Lifecycle phase")
    approval_status: str = Field(default="pending", max_length=50, description="Approval status")
    activation_status: str = Field(default="inactive", max_length=50, description="Activation status")
    
    # Execution tracking
    current_execution_id: Optional[str] = Field(default=None, description="Current execution identifier")
    execution_count: int = Field(default=0, description="Total execution count")
    last_executed: Optional[datetime] = Field(default=None, description="Last execution timestamp")
    next_scheduled: Optional[datetime] = Field(default=None, description="Next scheduled execution")
    
    # Quality and performance metrics
    success_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Historical success rate")
    average_execution_time: Optional[float] = Field(default=None, description="Average execution time")
    performance_score: Optional[float] = Field(default=None, ge=0.0, le=10.0, description="Performance score")
    quality_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Quality metrics")
    
    # Configuration and settings
    orchestration_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Orchestration configuration")
    notification_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Notification configuration")
    escalation_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Escalation configuration")
    
    # Metadata and tracking
    tags: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Classification tags")
    master_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Additional metadata")
    created_by: str = Field(default="system", max_length=255, description="Creator identifier")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_by: Optional[str] = Field(default=None, max_length=255, description="Last updater identifier")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    class Config:
        arbitrary_types_allowed = True


class OrchestrationStageExecution(SQLModel, table=True):
    """
    Enterprise-grade orchestration stage execution model for advanced scan orchestration.
    
    This model tracks the execution of individual stages within orchestration workflows,
    providing granular monitoring and control capabilities.
    """
    __tablename__ = "orchestration_stage_executions"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    execution_id: str = Field(unique=True, index=True, description="Unique execution identifier")
    
    # Stage identification and metadata
    stage_name: str = Field(..., max_length=255, description="Stage name")
    stage_type: str = Field(..., max_length=100, description="Type of stage")
    stage_category: str = Field(..., max_length=100, description="Stage category")
    stage_version: str = Field(..., max_length=20, description="Stage version")
    
    # Execution context
    orchestration_id: UUID = Field(..., foreign_key="scan_orchestration_jobs.id", description="Parent orchestration")
    stage_order: int = Field(..., ge=1, description="Execution order within orchestration")
    stage_sequence: str = Field(..., max_length=50, description="Sequence type (sequential, parallel, conditional)")
    
    # Stage configuration and logic
    stage_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Stage configuration")
    execution_logic: str = Field(..., description="Execution logic or script")
    validation_rules: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Validation rules")
    error_handling: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Error handling configuration")
    
    # Dependencies and relationships
    dependencies: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Stage dependencies")
    prerequisite_stages: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Prerequisite stage IDs")
    dependent_stages: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Dependent stage IDs")
    
    # Advanced stage features
    conditional_execution: bool = Field(default=False, description="Whether execution is conditional")
    retry_enabled: bool = Field(default=True, description="Whether retry is enabled")
    rollback_enabled: bool = Field(default=False, description="Whether rollback is enabled")
    parallel_execution: bool = Field(default=False, description="Whether stage can execute in parallel")
    
    # Performance and resource management
    estimated_duration_seconds: Optional[int] = Field(default=None, description="Estimated execution duration")
    timeout_seconds: Optional[int] = Field(default=None, description="Stage timeout")
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource requirements")
    concurrency_limit: Optional[int] = Field(default=None, description="Concurrency limit")
    
    # Status and lifecycle
    status: str = Field(default="pending", max_length=50, description="Current status")
    execution_phase: str = Field(default="queued", max_length=50, description="Execution phase")
    completion_status: str = Field(default="not_started", max_length=50, description="Completion status")
    
    # Execution tracking
    current_execution_id: Optional[str] = Field(default=None, description="Current execution identifier")
    execution_count: int = Field(default=0, description="Total execution count")
    last_executed: Optional[datetime] = Field(default=None, description="Last execution timestamp")
    last_successful: Optional[datetime] = Field(default=None, description="Last successful execution")
    
    # Performance metrics
    success_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Historical success rate")
    average_execution_time: Optional[float] = Field(default=None, description="Average execution time")
    failure_count: int = Field(default=0, description="Total failure count")
    retry_count: int = Field(default=0, description="Total retry count")
    
    # Input and output
    input_schema: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Input data schema")
    output_schema: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Output data schema")
    data_transformations: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Data transformations")
    
    # Monitoring and alerting
    monitoring_enabled: bool = Field(default=True, description="Whether monitoring is enabled")
    alert_thresholds: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Alert thresholds")
    notification_triggers: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Notification triggers")
    
    # Metadata and tracking
    tags: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Classification tags")
    stage_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Additional metadata")
    created_by: str = Field(..., max_length=255, description="Creator identifier")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_by: Optional[str] = Field(max_length=255, description="Last updater identifier")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    class Config:
        arbitrary_types_allowed = True


class OrchestrationDependency(SQLModel, table=True):
    """
    Enterprise-grade orchestration dependency model for advanced scan orchestration.
    
    This model manages dependencies between different orchestration components,
    ensuring proper execution order and resource coordination.
    """
    __tablename__ = "orchestration_dependencies"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    dependency_id: str = Field(unique=True, index=True, description="Unique dependency identifier")
    
    # Dependency identification
    dependency_name: str = Field(..., max_length=255, description="Dependency name")
    dependency_type: str = Field(..., max_length=100, description="Type of dependency")
    dependency_category: str = Field(..., max_length=100, description="Dependency category")
    
    # Source and target components
    source_component_id: str = Field(..., index=True, description="Source component identifier")
    source_component_type: str = Field(..., max_length=100, description="Type of source component")
    target_component_id: str = Field(..., index=True, description="Target component identifier")
    target_component_type: str = Field(..., max_length=100, description="Type of target component")
    
    # Dependency configuration
    dependency_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Dependency configuration")
    dependency_rules: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Dependency rules")
    validation_conditions: Optional[str] = Field(default=None, sa_column=Column(JSONB), description="Validation conditions")
    
    # Dependency strength and priority
    dependency_strength: str = Field(..., max_length=50, description="Dependency strength (strong, weak, optional)")
    priority_level: int = Field(default=5, ge=1, le=10, description="Priority level (1=highest, 10=lowest)")
    criticality: str = Field(default="medium", max_length=50, description="Criticality level (low, medium, high, critical)")
    
    # Execution constraints
    execution_order: int = Field(..., ge=1, description="Execution order constraint")
    parallel_execution_allowed: bool = Field(default=False, description="Whether parallel execution is allowed")
    timeout_seconds: Optional[int] = Field(default=None, description="Dependency timeout")
    
    # Status and lifecycle
    status: str = Field(default="active", max_length=50, description="Dependency status")
    lifecycle_phase: str = Field(default="active", max_length=50, description="Lifecycle phase")
    activation_status: str = Field(default="active", max_length=50, description="Activation status")
    
    # Monitoring and validation
    monitoring_enabled: bool = Field(default=True, description="Whether monitoring is enabled")
    validation_enabled: bool = Field(default=True, description="Whether validation is enabled")
    alert_on_violation: bool = Field(default=True, description="Whether to alert on violation")
    
    # Performance metrics
    dependency_satisfaction_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Satisfaction rate")
    average_resolution_time: Optional[float] = Field(default=None, description="Average resolution time")
    violation_count: int = Field(default=0, description="Total violation count")
    
    # Metadata and tracking
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Classification tags")
    dependency_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Additional metadata")
    created_by: str = Field(..., max_length=255, description="Creator identifier")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_by: Optional[str] = Field(max_length=255, description="Last updater identifier")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    class Config:
        arbitrary_types_allowed = True


class OrchestrationPerformanceSnapshot(SQLModel, table=True):
    """Enterprise-grade orchestration performance snapshot model for advanced scan orchestration."""
    __tablename__ = "orchestration_performance_snapshots"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    snapshot_id: str = Field(unique=True, index=True, description="Unique snapshot identifier")
    snapshot_name: str = Field(..., max_length=255, description="Snapshot name")
    orchestration_id: Optional[UUID] = Field(default=None, foreign_key="scan_orchestration_jobs.id")
    cpu_utilization: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    memory_utilization: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    execution_time_seconds: Optional[float] = Field(default=None)
    success_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    captured_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    created_by: str = Field(..., max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True


# ============================================================================
# REQUEST AND RESPONSE MODELS
# ============================================================================

class OrchestrationCreateRequest(BaseModel):
    """Request model for creating orchestration"""
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(default=None)
    orchestration_type: str = Field(..., max_length=100)
    target_data_sources: List[str] = Field(default_factory=list)
    orchestration_config: Dict[str, Any] = Field(default_factory=dict)
    created_by: str = Field(..., max_length=255)

class OrchestrationResponse(BaseModel):
    """Response model for orchestration operations"""
    id: UUID
    orchestration_id: str
    name: str
    description: Optional[str]
    orchestration_type: str
    status: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime]

class ResourceAllocationRequest(BaseModel):
    """Request model for resource allocation"""
    orchestration_id: UUID
    resource_type: ResourceType
    amount: float
    duration_minutes: int
    priority: PriorityLevel = PriorityLevel.NORMAL

class WorkflowExecutionResponse(BaseModel):
    """Response model for workflow execution"""
    execution_id: str
    status: WorkflowStatus
    progress_percentage: float
    started_at: datetime
    estimated_completion: Optional[datetime]

class OrchestrationAnalytics(BaseModel):
    """Analytics model for orchestration performance"""
    total_executions: int
    success_rate: float
    average_execution_time: float
    resource_utilization: Dict[str, float]

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class CacheNodeResponse(SQLModel):
    """Response model for cache node operations"""
    id: UUID
    node_name: str
    node_type: CacheNodeType
    host_address: str
    port: int
    memory_capacity: int
    is_active: bool
    status: CacheNodeStatus
    current_memory_usage: Optional[int]
    current_connection_count: Optional[int]
    response_time_ms: Optional[float]
    throughput_ops_per_sec: Optional[float]
    created_at: datetime
    updated_at: datetime

class DistributedCacheResponse(SQLModel):
    """Response model for distributed cache operations"""
    id: UUID
    cache_name: str
    cache_type: str
    cluster_size: int
    replication_factor: int
    partition_count: int
    partition_strategy: PartitionStrategy
    consistency_level: str
    compression_enabled: bool
    encryption_enabled: bool
    monitoring_enabled: bool
    is_active: bool
    health_status: str
    created_at: datetime
    updated_at: datetime

class CachePartitionResponse(SQLModel):
    """Response model for cache partition operations"""
    id: UUID
    partition_name: str
    partition_index: int
    partition_key_range: Dict[str, Any]
    current_size_mb: Optional[int]
    key_count: Optional[int]
    hit_rate: Optional[float]
    eviction_count: Optional[int]
    max_size_mb: int
    eviction_policy: str
    ttl_seconds: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime

class CacheSynchronizationResponse(SQLModel):
    """Response model for cache synchronization operations"""
    id: UUID
    sync_id: str
    sync_mode: SynchronizationMode
    sync_type: str
    keys_synced: List[str]
    sync_duration_ms: Optional[float]
    keys_count: Optional[int]
    data_size_mb: Optional[float]
    status: str
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]


class IntelligentScanCoordinator(SQLModel, table=True):
    """Enterprise-grade intelligent scan coordinator model for advanced scan orchestration."""
    __tablename__ = "intelligent_scan_coordinators"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    coordinator_id: str = Field(unique=True, index=True, description="Unique coordinator identifier")
    coordinator_name: str = Field(..., max_length=255, description="Coordinator name")
    coordinator_type: str = Field(..., max_length=100, description="Type of coordinator")
    status: str = Field(default="active", max_length=50, description="Current status")
    ai_enabled: bool = Field(default=True, description="Whether AI capabilities are enabled")
    ml_enabled: bool = Field(default=True, description="Whether ML capabilities are enabled")
    orchestration_id: Optional[UUID] = Field(default=None, foreign_key="scan_orchestration_jobs.id")
    configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    created_by: str = Field(..., max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    
    class Config:
        arbitrary_types_allowed = True
