"""
Racine Workflow Models
======================

Advanced workflow management models for Databricks-style workflow orchestration
with comprehensive cross-group integration across all 7 groups.

These models provide:
- Databricks-style job workflow management
- Cross-group workflow execution and coordination
- Advanced workflow templates and reusability
- Comprehensive scheduling and automation
- Real-time execution monitoring and control
- Performance optimization and analytics
- Version control and rollback capabilities
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


class WorkflowStatus(enum.Enum):
    """Workflow execution status enumeration"""
    DRAFT = "draft"
    ACTIVE = "active"
    SCHEDULED = "scheduled"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"


class WorkflowStepType(enum.Enum):
    """Workflow step type enumeration"""
    DATA_SOURCE_OPERATION = "data_source_operation"
    SCAN_RULE_OPERATION = "scan_rule_operation"
    CLASSIFICATION_OPERATION = "classification_operation"
    COMPLIANCE_OPERATION = "compliance_operation"
    CATALOG_OPERATION = "catalog_operation"
    SCAN_LOGIC_OPERATION = "scan_logic_operation"
    AI_OPERATION = "ai_operation"
    CUSTOM_SCRIPT = "custom_script"
    CONDITIONAL_BRANCH = "conditional_branch"
    PARALLEL_GROUP = "parallel_group"
    NOTIFICATION = "notification"
    APPROVAL = "approval"


class WorkflowTriggerType(enum.Enum):
    """Workflow trigger type enumeration"""
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    EVENT_DRIVEN = "event_driven"
    API_TRIGGER = "api_trigger"
    WEBHOOK = "webhook"
    DATA_CHANGE = "data_change"
    COMPLIANCE_ALERT = "compliance_alert"


class RacineJobWorkflow(Base):
    """
    Master workflow definition model for Databricks-style workflow management
    with comprehensive cross-group orchestration capabilities.
    """
    __tablename__ = 'racine_job_workflows'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic workflow information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    version = Column(String, default="1.0.0")
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.DRAFT, index=True)
    
    # Workflow configuration
    workflow_definition = Column(JSON, nullable=False)  # Complete workflow DAG definition
    step_dependencies = Column(JSON)  # Step dependency mapping
    parallel_execution_config = Column(JSON)  # Parallel execution configuration
    error_handling_config = Column(JSON)  # Error handling and retry configuration
    
    # Cross-group integration
    involved_groups = Column(JSON)  # List of groups involved in workflow
    group_specific_configs = Column(JSON)  # Group-specific configurations
    cross_group_dependencies = Column(JSON)  # Inter-group dependencies
    resource_requirements = Column(JSON)  # Resource requirements per group
    
    # Trigger and scheduling configuration
    trigger_type = Column(SQLEnum(WorkflowTriggerType), default=WorkflowTriggerType.MANUAL)
    trigger_configuration = Column(JSON)  # Trigger-specific configuration
    schedule_expression = Column(String)  # Cron expression for scheduled workflows
    schedule_timezone = Column(String, default="UTC")
    
    # Performance and optimization
    performance_targets = Column(JSON)  # Performance targets and SLAs
    optimization_hints = Column(JSON)  # AI optimization hints
    resource_allocation = Column(JSON)  # Resource allocation preferences
    
    # Templates and reusability
    is_template = Column(Boolean, default=False, index=True)
    template_category = Column(String, index=True)
    template_tags = Column(JSON)  # Template categorization tags
    parent_template_id = Column(String, ForeignKey('racine_job_workflows.id'))
    
    # Versioning and lifecycle
    previous_version_id = Column(String, ForeignKey('racine_job_workflows.id'))
    next_version_id = Column(String, ForeignKey('racine_job_workflows.id'))
    is_current_version = Column(Boolean, default=True, index=True)
    deprecation_date = Column(DateTime)
    
    # Security and access control
    access_level = Column(String, default="private")  # private, team, organization, public
    allowed_groups = Column(JSON)  # RBAC groups allowed to access
    execution_permissions = Column(JSON)  # Execution permission configuration
    
    # Monitoring and alerting
    monitoring_config = Column(JSON)  # Monitoring configuration
    alerting_rules = Column(JSON)  # Alerting rules and thresholds
    notification_settings = Column(JSON)  # Notification preferences
    
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
    orchestration_master = relationship("RacineOrchestrationMaster", back_populates="workflows")
    parent_template = relationship("RacineJobWorkflow", remote_side=[id], foreign_keys=[parent_template_id])
    previous_version = relationship("RacineJobWorkflow", remote_side=[id], foreign_keys=[previous_version_id])
    next_version = relationship("RacineJobWorkflow", remote_side=[id], foreign_keys=[next_version_id])
    
    # Back references
    executions = relationship("RacineJobExecution", back_populates="workflow", cascade="all, delete-orphan")
    steps = relationship("RacineWorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    templates = relationship("RacineWorkflowTemplate", back_populates="base_workflow")
    schedules = relationship("RacineWorkflowSchedule", back_populates="workflow", cascade="all, delete-orphan")


class RacineJobExecution(Base):
    """
    Workflow execution tracking model with comprehensive monitoring
    and real-time status updates.
    """
    __tablename__ = 'racine_job_executions'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Execution basic information
    execution_name = Column(String, index=True)
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.RUNNING, index=True)
    trigger_type = Column(SQLEnum(WorkflowTriggerType))
    
    # Execution context
    triggered_by = Column(String, ForeignKey('users.id'))
    trigger_data = Column(JSON)  # Data that triggered the execution
    execution_context = Column(JSON)  # Execution environment context
    input_parameters = Column(JSON)  # Input parameters for this execution
    
    # Timing information
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, index=True)
    estimated_completion = Column(DateTime)
    actual_duration = Column(Integer)  # Duration in seconds
    estimated_duration = Column(Integer)  # Estimated duration in seconds
    
    # Progress tracking
    total_steps = Column(Integer, default=0)
    completed_steps = Column(Integer, default=0)
    failed_steps = Column(Integer, default=0)
    skipped_steps = Column(Integer, default=0)
    progress_percentage = Column(Float, default=0.0)
    
    # Execution results and outputs
    execution_results = Column(JSON)  # Results from each step
    output_data = Column(JSON)  # Final output data
    generated_artifacts = Column(JSON)  # Generated files/artifacts
    
    # Performance metrics
    performance_metrics = Column(JSON)  # Detailed performance metrics
    resource_usage = Column(JSON)  # Resource consumption data
    bottlenecks_detected = Column(JSON)  # Performance bottlenecks
    optimization_suggestions = Column(JSON)  # AI-generated optimization suggestions
    
    # Error handling and debugging
    error_details = Column(JSON)  # Detailed error information
    debug_information = Column(JSON)  # Debug logs and traces
    retry_attempts = Column(Integer, default=0)
    recovery_actions = Column(JSON)  # Automated recovery actions taken
    
    # Cross-group execution tracking
    group_execution_status = Column(JSON)  # Status per involved group
    cross_group_dependencies_status = Column(JSON)  # Inter-group dependency status
    group_specific_results = Column(JSON)  # Results per group
    
    # Workflow reference
    workflow_id = Column(String, ForeignKey('racine_job_workflows.id'), nullable=False)
    workflow_version = Column(String)  # Version of workflow executed
    
    # Relationships
    workflow = relationship("RacineJobWorkflow", back_populates="executions")
    trigger_user = relationship("User", foreign_keys=[triggered_by])
    step_executions = relationship("RacineStepExecution", back_populates="job_execution", cascade="all, delete-orphan")


class RacineWorkflowStep(Base):
    """
    Individual workflow step definition with cross-group operation support.
    """
    __tablename__ = 'racine_workflow_steps'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Step basic information
    step_name = Column(String, nullable=False, index=True)
    step_type = Column(SQLEnum(WorkflowStepType), nullable=False)
    step_order = Column(Integer, nullable=False)
    description = Column(Text)
    
    # Step configuration
    step_configuration = Column(JSON, nullable=False)  # Step-specific configuration
    input_mappings = Column(JSON)  # Input parameter mappings
    output_mappings = Column(JSON)  # Output parameter mappings
    environment_variables = Column(JSON)  # Environment variables for step
    
    # Dependencies and conditions
    depends_on_steps = Column(JSON)  # List of step IDs this step depends on
    conditional_logic = Column(JSON)  # Conditional execution logic
    parallel_group_id = Column(String)  # ID for parallel execution grouping
    
    # Cross-group operation configuration
    target_group = Column(String, nullable=False)  # Target group for operation
    target_service = Column(String, nullable=False)  # Target service within group
    target_operation = Column(String, nullable=False)  # Specific operation to execute
    group_specific_config = Column(JSON)  # Group-specific configuration
    
    # Error handling and retry
    retry_policy = Column(JSON)  # Retry policy configuration
    timeout_seconds = Column(Integer, default=3600)  # Step timeout
    on_failure_action = Column(String, default="fail")  # fail, skip, retry, continue
    error_handling_steps = Column(JSON)  # Steps to execute on error
    
    # Performance and optimization
    expected_duration = Column(Integer)  # Expected duration in seconds
    resource_requirements = Column(JSON)  # Resource requirements
    optimization_hints = Column(JSON)  # Performance optimization hints
    
    # Workflow reference
    workflow_id = Column(String, ForeignKey('racine_job_workflows.id'), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workflow = relationship("RacineJobWorkflow", back_populates="steps")
    step_executions = relationship("RacineStepExecution", back_populates="workflow_step", cascade="all, delete-orphan")


class RacineStepExecution(Base):
    """
    Individual step execution tracking with detailed monitoring.
    """
    __tablename__ = 'racine_step_executions'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Execution information
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.RUNNING, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)
    
    # Step execution details
    input_data = Column(JSON)  # Actual input data for this execution
    output_data = Column(JSON)  # Output data from this execution
    execution_logs = Column(Text)  # Execution logs
    error_details = Column(JSON)  # Error details if step failed
    
    # Performance tracking
    resource_usage = Column(JSON)  # Resource consumption
    performance_metrics = Column(JSON)  # Performance metrics
    
    # Retry and recovery
    attempt_number = Column(Integer, default=1)
    retry_reason = Column(String)
    recovery_actions = Column(JSON)
    
    # References
    job_execution_id = Column(String, ForeignKey('racine_job_executions.id'), nullable=False)
    workflow_step_id = Column(String, ForeignKey('racine_workflow_steps.id'), nullable=False)
    
    # Relationships
    job_execution = relationship("RacineJobExecution", back_populates="step_executions")
    workflow_step = relationship("RacineWorkflowStep", back_populates="step_executions")


class RacineWorkflowTemplate(Base):
    """
    Workflow template management for reusable workflow patterns.
    """
    __tablename__ = 'racine_workflow_templates'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Template information
    template_name = Column(String, nullable=False, index=True)
    template_description = Column(Text)
    template_category = Column(String, index=True)
    template_version = Column(String, default="1.0.0")
    
    # Template configuration
    template_definition = Column(JSON, nullable=False)  # Complete template definition
    parameter_schema = Column(JSON)  # Schema for template parameters
    default_parameters = Column(JSON)  # Default parameter values
    validation_rules = Column(JSON)  # Parameter validation rules
    
    # Template metadata
    use_cases = Column(JSON)  # Documented use cases
    prerequisites = Column(JSON)  # Prerequisites for using template
    expected_outcomes = Column(JSON)  # Expected outcomes
    complexity_level = Column(String, default="intermediate")  # beginner, intermediate, advanced
    
    # Cross-group configuration
    supported_groups = Column(JSON)  # Groups supported by this template
    required_permissions = Column(JSON)  # Required permissions
    group_specific_customizations = Column(JSON)  # Group-specific customizations
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    average_execution_time = Column(Integer)  # Average execution time in seconds
    user_ratings = Column(JSON)  # User ratings and feedback
    
    # Template lifecycle
    is_public = Column(Boolean, default=False, index=True)
    is_verified = Column(Boolean, default=False)
    deprecation_date = Column(DateTime)
    replacement_template_id = Column(String, ForeignKey('racine_workflow_templates.id'))
    
    # Base workflow reference (if created from existing workflow)
    base_workflow_id = Column(String, ForeignKey('racine_job_workflows.id'))
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = relationship("User")
    base_workflow = relationship("RacineJobWorkflow", back_populates="templates")
    replacement_template = relationship("RacineWorkflowTemplate", remote_side=[id])
    created_workflows = relationship("RacineJobWorkflow", foreign_keys=[RacineJobWorkflow.parent_template_id])


class RacineWorkflowSchedule(Base):
    """
    Advanced workflow scheduling with multiple trigger types and conditions.
    """
    __tablename__ = 'racine_workflow_schedules'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Schedule basic information
    schedule_name = Column(String, nullable=False, index=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True, index=True)
    
    # Schedule configuration
    schedule_type = Column(SQLEnum(WorkflowTriggerType), nullable=False)
    schedule_expression = Column(String)  # Cron expression or frequency
    timezone = Column(String, default="UTC")
    
    # Advanced scheduling options
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    max_executions = Column(Integer)  # Maximum number of executions
    execution_count = Column(Integer, default=0)  # Current execution count
    
    # Conditional execution
    execution_conditions = Column(JSON)  # Conditions that must be met
    skip_conditions = Column(JSON)  # Conditions to skip execution
    dependency_workflows = Column(JSON)  # Workflows that must complete first
    
    # Event-driven configuration
    event_sources = Column(JSON)  # Event sources for event-driven triggers
    event_filters = Column(JSON)  # Filters for events
    webhook_configuration = Column(JSON)  # Webhook configuration
    
    # Execution configuration
    execution_parameters = Column(JSON)  # Default parameters for executions
    execution_environment = Column(JSON)  # Environment configuration
    concurrency_policy = Column(String, default="forbid")  # forbid, allow, replace
    
    # Monitoring and alerting
    monitoring_enabled = Column(Boolean, default=True)
    alert_on_failure = Column(Boolean, default=True)
    alert_on_success = Column(Boolean, default=False)
    notification_settings = Column(JSON)
    
    # Schedule statistics
    last_execution_time = Column(DateTime)
    next_execution_time = Column(DateTime, index=True)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    average_execution_time = Column(Integer)
    
    # Workflow reference
    workflow_id = Column(String, ForeignKey('racine_job_workflows.id'), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    workflow = relationship("RacineJobWorkflow", back_populates="schedules")
    creator = relationship("User")


class RacineWorkflowMetrics(Base):
    """
    Comprehensive workflow performance metrics and analytics.
    """
    __tablename__ = 'racine_workflow_metrics'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Metric basic information
    metric_type = Column(String, nullable=False, index=True)  # execution_time, resource_usage, etc.
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String)
    
    # Metric context
    workflow_id = Column(String, ForeignKey('racine_job_workflows.id'))
    execution_id = Column(String, ForeignKey('racine_job_executions.id'))
    step_id = Column(String, ForeignKey('racine_workflow_steps.id'))
    
    # Temporal information
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    time_window_start = Column(DateTime)
    time_window_end = Column(DateTime)
    
    # Additional metadata
    metric_metadata = Column(JSON)  # Additional metric metadata
    tags = Column(JSON)  # Metric tags for categorization
    
    # Relationships
    workflow = relationship("RacineJobWorkflow")
    execution = relationship("RacineJobExecution")
    step = relationship("RacineWorkflowStep")


class RacineWorkflowAudit(Base):
    """
    Comprehensive audit trail for workflow operations.
    """
    __tablename__ = 'racine_workflow_audit'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Audit event information
    event_type = Column(String, nullable=False, index=True)  # created, updated, executed, etc.
    event_description = Column(Text)
    event_data = Column(JSON)  # Detailed event data
    
    # Context information
    workflow_id = Column(String, ForeignKey('racine_job_workflows.id'))
    execution_id = Column(String, ForeignKey('racine_job_executions.id'))
    user_id = Column(String, ForeignKey('users.id'))
    
    # Change tracking
    changes_made = Column(JSON)  # Detailed changes made
    previous_values = Column(JSON)  # Previous values before change
    new_values = Column(JSON)  # New values after change
    
    # System information
    ip_address = Column(String)
    user_agent = Column(String)
    session_id = Column(String)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    workflow = relationship("RacineJobWorkflow")
    execution = relationship("RacineJobExecution")
    user = relationship("User")