from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
import json

class WorkflowType(str, Enum):
    DATA_PIPELINE = "data_pipeline"
    ETL = "etl"
    ML_PIPELINE = "ml_pipeline"
    APPROVAL = "approval"
    NOTIFICATION = "notification"
    GOVERNANCE = "governance"
    CUSTOM = "custom"

class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TriggerType(str, Enum):
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    EVENT_DRIVEN = "event_driven"
    DATA_CHANGE = "data_change"
    API_CALL = "api_call"
    WEBHOOK = "webhook"

class ActionType(str, Enum):
    DATA_SCAN = "data_scan"
    DATA_TRANSFORM = "data_transform"
    ML_TRAINING = "ml_training"
    ML_INFERENCE = "ml_inference"
    NOTIFICATION = "notification"
    APPROVAL_REQUEST = "approval_request"
    API_CALL = "api_call"
    CUSTOM_SCRIPT = "custom_script"
    CONDITIONAL = "conditional"
    LOOP = "loop"
    PARALLEL = "parallel"

class Workflow(SQLModel, table=True):
    """Advanced workflow orchestration engine"""
    __tablename__ = "workflows"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    workflow_type: WorkflowType = Field(default=WorkflowType.CUSTOM)
    
    # Workflow definition
    definition: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    version: str = Field(default="1.0.0")
    is_template: bool = Field(default=False)
    
    # Ownership and access
    created_by: str = Field(index=True)
    organization_id: Optional[str] = Field(index=True)
    team_id: Optional[str] = None
    
    # Status and lifecycle
    status: WorkflowStatus = Field(default=WorkflowStatus.DRAFT)
    is_enabled: bool = Field(default=True)
    is_deleted: bool = Field(default=False)
    
    # Scheduling and triggers
    trigger_type: TriggerType = Field(default=TriggerType.MANUAL)
    cron_expression: Optional[str] = None
    trigger_conditions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Advanced features
    supports_parallel_execution: bool = Field(default=True)
    max_concurrent_runs: int = Field(default=1)
    timeout_minutes: Optional[int] = None
    retry_policy: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Error handling and recovery
    error_handling_strategy: str = Field(default="stop_on_error")  # stop_on_error, continue, retry
    failure_notification_enabled: bool = Field(default=True)
    auto_recovery_enabled: bool = Field(default=False)
    
    # Performance and optimization
    execution_priority: int = Field(default=50, ge=0, le=100)
    resource_requirements: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    performance_targets: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # AI-powered optimization
    ai_optimization_enabled: bool = Field(default=True)
    auto_scaling_enabled: bool = Field(default=False)
    smart_scheduling: bool = Field(default=True)
    predictive_scaling: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Governance and compliance
    governance_policies: List[str] = Field(default=None, sa_column=Column(JSON))
    compliance_requirements: List[str] = Field(default=None, sa_column=Column(JSON))
    audit_enabled: bool = Field(default=True)
    data_lineage_tracking: bool = Field(default=True)
    
    # Metrics and monitoring
    execution_count: int = Field(default=0)
    success_rate: Optional[float] = Field(ge=0.0, le=1.0)
    average_duration_minutes: Optional[float] = None
    last_execution: Optional[datetime] = None
    next_execution: Optional[datetime] = None
    
    # Metadata
    tags: List[str] = Field(default=None, sa_column=Column(JSON))
    workflow_metadata: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    steps: List["WorkflowStep"] = Relationship(back_populates="workflow")
    executions: List["WorkflowExecution"] = Relationship(back_populates="workflow")
    dependencies: List["WorkflowDependency"] = Relationship(back_populates="workflow")

class WorkflowStep(SQLModel, table=True):
    """Individual steps in a workflow"""
    __tablename__ = "workflow_steps"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: int = Field(foreign_key="workflows.id", index=True)
    name: str
    description: Optional[str] = None
    
    # Step definition
    action_type: ActionType = Field(default=ActionType.CUSTOM_SCRIPT)
    step_order: int = Field(index=True)
    is_optional: bool = Field(default=False)
    is_parallel: bool = Field(default=False)
    
    # Configuration
    configuration: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    input_parameters: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    output_parameters: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Conditions and logic
    execution_condition: Optional[str] = None  # JavaScript expression
    skip_condition: Optional[str] = None
    retry_condition: Optional[str] = None
    
    # Error handling
    max_retries: int = Field(default=0)
    retry_delay_seconds: int = Field(default=60)
    timeout_minutes: Optional[int] = None
    on_failure_action: str = Field(default="stop")  # stop, continue, retry, skip
    
    # Resource requirements
    cpu_requirement: Optional[float] = None
    memory_requirement_mb: Optional[int] = None
    gpu_requirement: bool = Field(default=False)
    custom_resources: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # AI-powered features
    ai_assisted_configuration: bool = Field(default=False)
    auto_parameter_tuning: bool = Field(default=False)
    performance_optimization: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Data and security
    data_access_requirements: List[str] = Field(default=None, sa_column=Column(JSON))
    security_context: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    encryption_required: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workflow: Optional["Workflow"] = Relationship(back_populates="steps")
    executions: List["StepExecution"] = Relationship(back_populates="step")

class WorkflowExecution(SQLModel, table=True):
    """Workflow execution instances and tracking"""
    __tablename__ = "workflow_executions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: int = Field(foreign_key="workflows.id", index=True)
    execution_id: str = Field(unique=True, index=True)
    
    # Execution details
    status: WorkflowStatus = Field(default=WorkflowStatus.DRAFT)
    trigger_type: TriggerType
    triggered_by: str = Field(index=True)
    trigger_data: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timing
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[float] = None
    estimated_completion: Optional[datetime] = None
    
    # Progress tracking
    total_steps: int = Field(default=0)
    completed_steps: int = Field(default=0)
    failed_steps: int = Field(default=0)
    skipped_steps: int = Field(default=0)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Resource usage
    cpu_usage_cores: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    storage_usage_gb: Optional[float] = None
    cost_estimate: Optional[float] = None
    
    # Results and output
    output_data: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    artifacts_generated: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    data_products_created: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Error handling
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    retry_count: int = Field(default=0)
    
    # Quality and validation
    quality_score: Optional[float] = Field(ge=0.0, le=1.0)
    validation_results: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    data_quality_checks: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Monitoring and observability
    logs_location: Optional[str] = None
    metrics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    performance_metrics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workflow: Optional["Workflow"] = Relationship(back_populates="executions")
    step_executions: List["StepExecution"] = Relationship(back_populates="execution")

class StepExecution(SQLModel, table=True):
    """Individual step execution tracking"""
    __tablename__ = "step_executions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: int = Field(foreign_key="workflow_executions.id", index=True)
    step_id: int = Field(foreign_key="workflow_steps.id", index=True)
    
    # Execution details
    status: WorkflowStatus = Field(default=WorkflowStatus.DRAFT)
    attempt_number: int = Field(default=1)
    
    # Timing
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    
    # Input/Output
    input_data: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    output_data: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Resource usage
    cpu_usage: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    network_io_mb: Optional[float] = None
    disk_io_mb: Optional[float] = None
    
    # Results
    exit_code: Optional[int] = None
    error_message: Optional[str] = None
    logs: Optional[str] = None
    
    # Quality metrics
    data_quality_score: Optional[float] = Field(ge=0.0, le=1.0)
    performance_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    execution: Optional["WorkflowExecution"] = Relationship(back_populates="step_executions")
    step: Optional["WorkflowStep"] = Relationship(back_populates="executions")

class WorkflowDependency(SQLModel, table=True):
    """Workflow dependencies and relationships"""
    __tablename__ = "workflow_dependencies"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: int = Field(foreign_key="workflows.id", index=True)
    depends_on_workflow_id: int = Field(foreign_key="workflows.id", index=True)
    
    # Dependency type
    dependency_type: str = Field(default="sequential")  # sequential, parallel, conditional
    condition: Optional[str] = None  # JavaScript expression
    
    # Timing
    wait_for_completion: bool = Field(default=True)
    timeout_minutes: Optional[int] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workflow: Optional["Workflow"] = Relationship(back_populates="dependencies")

class WorkflowTemplate(SQLModel, table=True):
    """Reusable workflow templates and blueprints"""
    __tablename__ = "workflow_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str
    category: str = Field(index=True)
    
    # Template definition
    template_definition: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    parameters: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    default_values: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Template metadata
    workflow_type: WorkflowType
    complexity_level: str = Field(default="intermediate")  # beginner, intermediate, advanced, expert
    estimated_duration_minutes: Optional[int] = None
    required_permissions: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Usage and popularity
    usage_count: int = Field(default=0)
    rating: Optional[float] = Field(ge=0.0, le=5.0)
    is_featured: bool = Field(default=False)
    is_verified: bool = Field(default=False)
    
    # Authorship
    created_by: str = Field(index=True)
    maintained_by: Optional[str] = None
    contributors: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Version control
    version: str = Field(default="1.0.0")
    changelog: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Documentation
    documentation: Optional[str] = None
    examples: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    best_practices: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    tags: List[str] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class WorkflowSchedule(SQLModel, table=True):
    """Advanced workflow scheduling with smart optimization"""
    __tablename__ = "workflow_schedules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: int = Field(foreign_key="workflows.id", index=True)
    name: str
    
    # Schedule definition
    cron_expression: str
    timezone: str = Field(default="UTC")
    is_enabled: bool = Field(default=True)
    
    # Advanced scheduling
    smart_scheduling_enabled: bool = Field(default=True)
    resource_optimization: bool = Field(default=True)
    load_balancing: bool = Field(default=True)
    optimal_execution_time: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Constraints
    max_concurrent_executions: int = Field(default=1)
    execution_window_start: Optional[datetime] = None
    execution_window_end: Optional[datetime] = None
    blackout_periods: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Monitoring
    last_execution: Optional[datetime] = None
    next_execution: Optional[datetime] = None
    execution_count: int = Field(default=0)
    failure_count: int = Field(default=0)
    
    # Alerting
    alert_on_failure: bool = Field(default=True)
    alert_on_delay: bool = Field(default=True)
    max_delay_minutes: int = Field(default=60)
    notification_channels: List[str] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class WorkflowMetrics(SQLModel, table=True):
    """Workflow performance metrics and analytics"""
    __tablename__ = "workflow_metrics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: int = Field(foreign_key="workflows.id", index=True)
    
    # Time period
    metric_date: datetime = Field(index=True)
    aggregation_period: str = Field(default="daily")  # hourly, daily, weekly, monthly
    
    # Execution metrics
    total_executions: int = Field(default=0)
    successful_executions: int = Field(default=0)
    failed_executions: int = Field(default=0)
    average_duration_minutes: Optional[float] = None
    success_rate: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Performance metrics
    avg_cpu_usage: Optional[float] = None
    avg_memory_usage_mb: Optional[float] = None
    total_cost: Optional[float] = None
    efficiency_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Quality metrics
    data_quality_score: Optional[float] = Field(ge=0.0, le=1.0)
    sla_compliance: Optional[float] = Field(ge=0.0, le=1.0)
    error_rate: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Business impact
    data_products_created: int = Field(default=0)
    business_value_generated: Optional[float] = None
    time_saved_hours: Optional[float] = None
    
    created_at: datetime = Field(default_factory=datetime.now)