"""
Enterprise Scan Workflow Models
Comprehensive workflow models for enterprise-grade scan orchestration.
Supports complex multi-stage workflows, conditional logic, approval processes,
and advanced workflow management with real-time tracking and intelligence.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator
from sqlmodel import Column, Field, Relationship, SQLModel, ARRAY, JSON as JSONB

# ============================================================================
# ENUMS
# ============================================================================

class WorkflowType(str, Enum):
    """Types of scan workflows"""
    SIMPLE = "simple"
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONDITIONAL = "conditional"
    APPROVAL_BASED = "approval_based"
    EVENT_DRIVEN = "event_driven"
    SCHEDULED = "scheduled"
    REACTIVE = "reactive"
    HYBRID = "hybrid"
    INTELLIGENT = "intelligent"

class WorkflowStatus(str, Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    WAITING_APPROVAL = "waiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"
    ERROR = "error"
    RETRY = "retry"

class StageType(str, Enum):
    """Types of workflow stages"""
    INITIALIZATION = "initialization"
    PREPARATION = "preparation"
    VALIDATION = "validation"
    EXECUTION = "execution"
    POST_PROCESSING = "post_processing"
    APPROVAL = "approval"
    NOTIFICATION = "notification"
    CLEANUP = "cleanup"
    FINALIZATION = "finalization"
    CUSTOM = "custom"

class StageStatus(str, Enum):
    """Stage execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"
    WAITING = "waiting"
    RETRY = "retry"
    ERROR = "error"
    TIMEOUT = "timeout"

class TaskType(str, Enum):
    """Types of workflow tasks"""
    SCAN = "scan"
    VALIDATION = "validation"
    TRANSFORMATION = "transformation"
    NOTIFICATION = "notification"
    APPROVAL = "approval"
    CONDITION_CHECK = "condition_check"
    DATA_PROCESSING = "data_processing"
    QUALITY_CHECK = "quality_check"
    COMPLIANCE_CHECK = "compliance_check"
    CUSTOM = "custom"

class TaskStatus(str, Enum):
    """Task execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"
    WAITING = "waiting"
    RETRY = "retry"
    ERROR = "error"
    TIMEOUT = "timeout"

class ConditionOperator(str, Enum):
    """Condition operators for workflow logic"""
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    GREATER_EQUAL = "greater_equal"
    LESS_EQUAL = "less_equal"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    IN = "in"
    NOT_IN = "not_in"
    REGEX_MATCH = "regex_match"
    IS_NULL = "is_null"
    IS_NOT_NULL = "is_not_null"

class TriggerType(str, Enum):
    """Workflow trigger types"""
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    EVENT = "event"
    CONDITION = "condition"
    WEBHOOK = "webhook"
    API = "api"
    FILE_CHANGE = "file_change"
    DATA_CHANGE = "data_change"
    THRESHOLD = "threshold"
    CASCADE = "cascade"

class ApprovalType(str, Enum):
    """Approval types"""
    SINGLE = "single"
    MULTIPLE = "multiple"
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONSENSUS = "consensus"
    MAJORITY = "majority"
    HIERARCHICAL = "hierarchical"
    ROLE_BASED = "role_based"

class ApprovalStatus(str, Enum):
    """Approval status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    DELEGATED = "delegated"
    ESCALATED = "escalated"

class WorkflowPriority(str, Enum):
    """Workflow priority levels"""
    CRITICAL = "critical"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"
    BACKGROUND = "background"

class RetryStrategy(str, Enum):
    """Retry strategies"""
    IMMEDIATE = "immediate"
    LINEAR_BACKOFF = "linear_backoff"
    EXPONENTIAL_BACKOFF = "exponential_backoff"
    FIXED_DELAY = "fixed_delay"
    CUSTOM = "custom"
    NO_RETRY = "no_retry"

# ============================================================================
# CORE WORKFLOW MODELS
# ============================================================================

class ScanWorkflowTemplate(SQLModel, table=True):
    """Reusable workflow templates"""
    __tablename__ = "scan_workflow_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: str = Field(unique=True, index=True, description="Unique template identifier")
    template_name: str = Field(index=True, description="Template name")
    template_version: str = Field(description="Template version")
    
    # Template Configuration
    workflow_type: WorkflowType = Field(description="Type of workflow")
    description: str = Field(description="Template description")
    category: str = Field(index=True, description="Template category")
    
    # Template Definition
    stages: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Stage definitions")
    default_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Default parameters")
    variables: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Template variables")
    
    # Execution Settings
    timeout_minutes: int = Field(default=60, description="Default timeout in minutes")
    retry_strategy: RetryStrategy = Field(default=RetryStrategy.EXPONENTIAL_BACKOFF, description="Default retry strategy")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    parallel_execution: bool = Field(default=False, description="Enable parallel execution")
    
    # Template Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)), description="Template tags")
    is_active: bool = Field(default=True, index=True, description="Template status")
    is_system_template: bool = Field(default=False, description="System template flag")
    
    # Usage Statistics
    usage_count: int = Field(default=0, description="Number of times used")
    success_rate: float = Field(default=0.0, description="Success rate percentage")
    average_duration: int = Field(default=0, description="Average execution duration")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    created_by: str = Field(description="User who created template")
    
    # Relationships
    workflows: List["ScanWorkflow"] = Relationship(back_populates="template")

class ScanWorkflow(SQLModel, table=True):
    """Main workflow instance"""
    __tablename__ = "scan_workflows"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: str = Field(unique=True, index=True, description="Unique workflow identifier")
    workflow_name: str = Field(index=True, description="Workflow name")
    template_id: Optional[str] = Field(foreign_key="scan_workflow_templates.template_id", index=True, description="Template used")
    
    # Workflow Configuration
    workflow_type: WorkflowType = Field(description="Type of workflow")
    priority: WorkflowPriority = Field(default=WorkflowPriority.NORMAL, index=True, description="Workflow priority")
    description: Optional[str] = Field(default=None, description="Workflow description")
    
    # Execution State
    status: WorkflowStatus = Field(default=WorkflowStatus.PENDING, index=True, description="Current workflow status")
    current_stage_id: Optional[str] = Field(default=None, index=True, description="Currently executing stage")
    progress_percentage: float = Field(default=0.0, description="Overall progress percentage")
    
    # Timing
    scheduled_at: Optional[datetime] = Field(default=None, index=True, description="Scheduled execution time")
    started_at: Optional[datetime] = Field(default=None, description="Actual start time")
    completed_at: Optional[datetime] = Field(default=None, description="Completion time")
    timeout_at: Optional[datetime] = Field(default=None, description="Timeout timestamp")
    
    # Configuration
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Workflow parameters")
    variables: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Workflow variables")
    context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Execution context")
    
    # Results
    output: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Workflow output")
    error_message: Optional[str] = Field(default=None, description="Error message if failed")
    stack_trace: Optional[str] = Field(default=None, description="Stack trace if error")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    created_by: str = Field(description="User who created workflow")
    executed_by: Optional[str] = Field(default=None, description="User who executed workflow")
    
    # Relationships
    template: Optional[ScanWorkflowTemplate] = Relationship(back_populates="workflows")
    stages: List["WorkflowStage"] = Relationship(back_populates="workflow")
    approvals: List["WorkflowApproval"] = Relationship(back_populates="workflow")
    triggers: List["WorkflowTrigger"] = Relationship(back_populates="workflow")

class WorkflowStage(SQLModel, table=True):
    """Individual workflow stages"""
    __tablename__ = "workflow_stages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    stage_id: str = Field(unique=True, index=True, description="Unique stage identifier")
    workflow_id: str = Field(foreign_key="scan_workflows.workflow_id", index=True, description="Parent workflow")
    stage_name: str = Field(index=True, description="Stage name")
    
    # Stage Configuration
    stage_type: StageType = Field(description="Type of stage")
    stage_order: int = Field(description="Execution order")
    is_critical: bool = Field(default=False, description="Critical stage flag")
    
    # Execution State
    status: StageStatus = Field(default=StageStatus.PENDING, index=True, description="Stage status")
    progress_percentage: float = Field(default=0.0, description="Stage progress")
    
    # Dependencies
    depends_on: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)), description="Dependent stage IDs")
    can_run_parallel: bool = Field(default=False, description="Parallel execution allowed")
    
    # Conditions
    preconditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Stage preconditions")
    postconditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Stage postconditions")
    
    # Configuration
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Stage parameters")
    timeout_minutes: int = Field(default=30, description="Stage timeout")
    retry_strategy: RetryStrategy = Field(default=RetryStrategy.EXPONENTIAL_BACKOFF, description="Retry strategy")
    max_retries: int = Field(default=3, description="Maximum retries")
    
    # Timing
    started_at: Optional[datetime] = Field(default=None, description="Stage start time")
    completed_at: Optional[datetime] = Field(default=None, description="Stage completion time")
    duration_seconds: Optional[int] = Field(default=None, description="Execution duration")
    
    # Results
    output: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Stage output")
    error_message: Optional[str] = Field(default=None, description="Error message")
    
    # Relationships
    workflow: Optional[ScanWorkflow] = Relationship(back_populates="stages")
    tasks: List["WorkflowTask"] = Relationship(back_populates="stage")

class WorkflowTask(SQLModel, table=True):
    """Individual tasks within stages"""
    __tablename__ = "workflow_tasks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: str = Field(unique=True, index=True, description="Unique task identifier")
    stage_id: str = Field(foreign_key="workflow_stages.stage_id", index=True, description="Parent stage")
    task_name: str = Field(index=True, description="Task name")
    
    # Task Configuration
    task_type: TaskType = Field(description="Type of task")
    task_order: int = Field(description="Execution order within stage")
    is_critical: bool = Field(default=False, description="Critical task flag")
    
    # Execution State
    status: TaskStatus = Field(default=TaskStatus.PENDING, index=True, description="Task status")
    progress_percentage: float = Field(default=0.0, description="Task progress")
    
    # Configuration
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Task parameters")
    timeout_minutes: int = Field(default=15, description="Task timeout")
    retry_strategy: RetryStrategy = Field(default=RetryStrategy.LINEAR_BACKOFF, description="Retry strategy")
    max_retries: int = Field(default=3, description="Maximum retries")
    
    # Execution Details
    execution_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Execution details")
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource requirements")
    
    # Timing
    started_at: Optional[datetime] = Field(default=None, description="Task start time")
    completed_at: Optional[datetime] = Field(default=None, description="Task completion time")
    duration_seconds: Optional[int] = Field(default=None, description="Execution duration")
    
    # Results
    output: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Task output")
    error_message: Optional[str] = Field(default=None, description="Error message")
    
    # Relationships
    stage: Optional[WorkflowStage] = Relationship(back_populates="tasks")

class WorkflowCondition(SQLModel, table=True):
    """Conditional logic for workflows"""
    __tablename__ = "workflow_conditions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    condition_id: str = Field(unique=True, index=True, description="Unique condition identifier")
    workflow_id: str = Field(index=True, description="Associated workflow")
    stage_id: Optional[str] = Field(index=True, description="Associated stage")
    
    # Condition Definition
    condition_name: str = Field(description="Condition name")
    condition_type: str = Field(description="Type of condition")
    left_operand: str = Field(description="Left operand")
    operator: ConditionOperator = Field(description="Comparison operator")
    right_operand: str = Field(description="Right operand")
    
    # Logic
    logical_operator: Optional[str] = Field(default=None, description="Logical operator (AND/OR)")
    parent_condition_id: Optional[str] = Field(default=None, description="Parent condition for grouping")
    
    # Actions
    true_action: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Action if condition is true")
    false_action: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Action if condition is false")
    
    # Evaluation
    last_evaluated: Optional[datetime] = Field(default=None, description="Last evaluation time")
    last_result: Optional[bool] = Field(default=None, description="Last evaluation result")
    evaluation_count: int = Field(default=0, description="Number of evaluations")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    created_by: str = Field(description="User who created condition")

class WorkflowTrigger(SQLModel, table=True):
    """Workflow triggers"""
    __tablename__ = "workflow_triggers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    trigger_id: str = Field(unique=True, index=True, description="Unique trigger identifier")
    workflow_id: str = Field(foreign_key="scan_workflows.workflow_id", index=True, description="Associated workflow")
    trigger_name: str = Field(index=True, description="Trigger name")
    
    # Trigger Configuration
    trigger_type: TriggerType = Field(description="Type of trigger")
    is_active: bool = Field(default=True, index=True, description="Trigger activation status")
    
    # Trigger Definition
    trigger_conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Trigger conditions")
    schedule_expression: Optional[str] = Field(default=None, description="Cron expression for scheduled triggers")
    event_filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Event filtering criteria")
    
    # Execution Control
    max_executions: Optional[int] = Field(default=None, description="Maximum number of executions")
    execution_count: int = Field(default=0, description="Current execution count")
    cooldown_minutes: int = Field(default=0, description="Cooldown period between executions")
    
    # Timing
    valid_from: Optional[datetime] = Field(default=None, description="Trigger validity start")
    valid_until: Optional[datetime] = Field(default=None, description="Trigger validity end")
    last_triggered: Optional[datetime] = Field(default=None, description="Last trigger time")
    next_trigger: Optional[datetime] = Field(default=None, description="Next scheduled trigger")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    created_by: str = Field(description="User who created trigger")
    
    # Relationships
    workflow: Optional[ScanWorkflow] = Relationship(back_populates="triggers")

class WorkflowApproval(SQLModel, table=True):
    """Workflow approval processes"""
    __tablename__ = "workflow_approvals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    approval_id: str = Field(unique=True, index=True, description="Unique approval identifier")
    workflow_id: str = Field(foreign_key="scan_workflows.workflow_id", index=True, description="Associated workflow")
    stage_id: Optional[str] = Field(index=True, description="Associated stage")
    
    # Approval Configuration
    approval_type: ApprovalType = Field(description="Type of approval process")
    approval_name: str = Field(description="Approval process name")
    description: str = Field(description="Approval description")
    
    # Approvers
    required_approvers: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)), description="Required approver IDs")
    approved_by: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)), description="Users who approved")
    rejected_by: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(str)), description="Users who rejected")
    
    # Status
    status: ApprovalStatus = Field(default=ApprovalStatus.PENDING, index=True, description="Approval status")
    required_approvals: int = Field(default=1, description="Number of required approvals")
    current_approvals: int = Field(default=0, description="Current number of approvals")
    
    # Timing
    requested_at: datetime = Field(default_factory=datetime.utcnow, description="Approval request time")
    due_date: Optional[datetime] = Field(default=None, description="Approval due date")
    completed_at: Optional[datetime] = Field(default=None, description="Approval completion time")
    
    # Details
    approval_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Approval criteria")
    approval_notes: Optional[str] = Field(default=None, description="Approval notes")
    rejection_reason: Optional[str] = Field(default=None, description="Rejection reason")
    
    # Escalation
    escalation_enabled: bool = Field(default=False, description="Escalation enabled")
    escalation_after_minutes: Optional[int] = Field(default=None, description="Escalation timeout")
    escalated_to: Optional[str] = Field(default=None, description="Escalated to user")
    escalated_at: Optional[datetime] = Field(default=None, description="Escalation time")
    
    # Relationships
    workflow: Optional[ScanWorkflow] = Relationship(back_populates="approvals")

class ScanWorkflowExecutionDetail(SQLModel, table=True):
    """Detailed scan workflow execution tracking"""
    __tablename__ = "scan_workflow_execution_details"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(unique=True, index=True, description="Unique execution identifier")
    workflow_id: str = Field(index=True, description="Associated workflow")
    
    # Execution Details
    execution_number: int = Field(description="Execution attempt number")
    trigger_type: TriggerType = Field(description="What triggered this execution")
    triggered_by: str = Field(description="User or system that triggered")
    
    # State Tracking
    current_status: WorkflowStatus = Field(index=True, description="Current execution status")
    execution_log: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Detailed execution log")
    state_changes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="State change history")
    
    # Performance Metrics
    total_stages: int = Field(default=0, description="Total number of stages")
    completed_stages: int = Field(default=0, description="Number of completed stages")
    failed_stages: int = Field(default=0, description="Number of failed stages")
    skipped_stages: int = Field(default=0, description="Number of skipped stages")
    
    # Resource Usage
    cpu_usage_percent: Optional[float] = Field(default=None, description="CPU usage percentage")
    memory_usage_mb: Optional[float] = Field(default=None, description="Memory usage in MB")
    storage_usage_mb: Optional[float] = Field(default=None, description="Storage usage in MB")
    network_usage_mb: Optional[float] = Field(default=None, description="Network usage in MB")
    
    # Timing
    started_at: Optional[datetime] = Field(default=None, description="Execution start time")
    completed_at: Optional[datetime] = Field(default=None, description="Execution completion time")
    total_duration_seconds: Optional[int] = Field(default=None, description="Total execution duration")
    
    # Results
    final_output: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Final execution output")
    error_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Error details if failed")
    
    # Quality Metrics
    success_rate: float = Field(default=0.0, description="Success rate of stages")
    quality_score: Optional[float] = Field(default=None, description="Overall quality score")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")

# ============================================================================
# API MODELS
# ============================================================================

class WorkflowTemplateCreate(BaseModel):
    """Create workflow template request"""
    template_name: str
    workflow_type: WorkflowType
    description: str
    category: str
    stages: List[Dict[str, Any]]
    default_parameters: Optional[Dict[str, Any]] = None
    timeout_minutes: int = 60
    retry_strategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF
    max_retries: int = 3
    tags: Optional[List[str]] = None

class WorkflowCreate(BaseModel):
    """Create workflow request"""
    workflow_name: str
    template_id: Optional[str] = None
    workflow_type: WorkflowType
    priority: WorkflowPriority = WorkflowPriority.NORMAL
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None

class WorkflowExecuteRequest(BaseModel):
    """Execute workflow request"""
    workflow_id: str
    parameters: Optional[Dict[str, Any]] = None
    override_settings: Optional[Dict[str, Any]] = None
    force_execution: bool = False

class StageCreate(BaseModel):
    """Create stage request"""
    stage_name: str
    stage_type: StageType
    stage_order: int
    depends_on: Optional[List[str]] = None
    parameters: Optional[Dict[str, Any]] = None
    timeout_minutes: int = 30
    is_critical: bool = False

class TaskCreate(BaseModel):
    """Create task request"""
    task_name: str
    task_type: TaskType
    task_order: int
    parameters: Optional[Dict[str, Any]] = None
    timeout_minutes: int = 15
    is_critical: bool = False

class ApprovalRequest(BaseModel):
    """Approval request"""
    approval_type: ApprovalType
    required_approvers: List[str]
    description: str
    due_date: Optional[datetime] = None
    approval_criteria: Optional[Dict[str, Any]] = None

class TriggerCreate(BaseModel):
    """Create trigger request"""
    trigger_name: str
    trigger_type: TriggerType
    trigger_conditions: Dict[str, Any]
    schedule_expression: Optional[str] = None
    max_executions: Optional[int] = None
    cooldown_minutes: int = 0

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class WorkflowResponse(BaseModel):
    """Workflow response"""
    workflow_id: str
    workflow_name: str
    workflow_type: WorkflowType
    status: WorkflowStatus
    priority: WorkflowPriority
    progress_percentage: float
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

class StageResponse(BaseModel):
    """Stage response"""
    stage_id: str
    stage_name: str
    stage_type: StageType
    status: StageStatus
    progress_percentage: float
    stage_order: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

class WorkflowExecutionResponse(BaseModel):
    """Workflow execution response"""
    execution_id: str
    workflow_id: str
    execution_number: int
    current_status: WorkflowStatus
    progress_percentage: float
    total_stages: int
    completed_stages: int
    started_at: Optional[datetime]
    estimated_completion: Optional[datetime]

class WorkflowMetrics(BaseModel):
    """Workflow metrics"""
    total_workflows: int
    active_workflows: int
    completed_workflows: int
    failed_workflows: int
    average_duration: float
    success_rate: float
    resource_utilization: Dict[str, float]