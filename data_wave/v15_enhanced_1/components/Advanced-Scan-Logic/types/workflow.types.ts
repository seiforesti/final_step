// Advanced-Scan-Logic/types/workflow.types.ts
// Comprehensive workflow types aligned with backend scan_workflow_models.py

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: WorkflowStatus;
  category: WorkflowCategory;
  created_by: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  deprecated: boolean;
  steps: WorkflowStep[];
  dependencies: WorkflowDependency[];
  configuration: WorkflowConfiguration;
  validation_rules: WorkflowValidationRule[];
  approval_required: boolean;
  approval_workflow_id?: string;
  tags: string[];
  metadata: WorkflowMetadata;
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum WorkflowCategory {
  DATA_PROCESSING = 'data_processing',
  QUALITY_ASSURANCE = 'quality_assurance',
  COMPLIANCE_CHECK = 'compliance_check',
  SECURITY_SCAN = 'security_scan',
  OPTIMIZATION = 'optimization',
  REPORTING = 'reporting',
  NOTIFICATION = 'notification',
  INTEGRATION = 'integration',
  CUSTOM = 'custom'
}

export interface WorkflowExecution {
  id: string;
  workflow_definition_id: string;
  status: ExecutionStatus;
  priority: ExecutionPriority;
  started_by: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  progress_percent: number;
  current_step_id?: string;
  step_executions: StepExecution[];
  context: ExecutionContext;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  error_details?: ExecutionError;
  retry_count: number;
  max_retries: number;
  parent_execution_id?: string;
  child_executions: string[];
  notifications: ExecutionNotification[];
  audit_trail: AuditEntry[];
}

export enum ExecutionStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
  SKIPPED = 'skipped',
  RETRYING = 'retrying'
}

export enum ExecutionPriority {
  URGENT = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  BACKGROUND = 5
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  step_type: StepType;
  order: number;
  enabled: boolean;
  configuration: StepConfiguration;
  input_mapping: ParameterMapping[];
  output_mapping: ParameterMapping[];
  error_handling: ErrorHandling;
  timeout_minutes: number;
  retry_policy: RetryPolicy;
  dependencies: StepDependency[];
  conditions: StepCondition[];
  parallel_group?: string;
  resource_requirements: StepResourceRequirements;
  validation_rules: StepValidationRule[];
}

export enum StepType {
  DATA_EXTRACTION = 'data_extraction',
  DATA_TRANSFORMATION = 'data_transformation',
  DATA_VALIDATION = 'data_validation',
  QUALITY_CHECK = 'quality_check',
  CLASSIFICATION = 'classification',
  COMPLIANCE_CHECK = 'compliance_check',
  SECURITY_SCAN = 'security_scan',
  NOTIFICATION = 'notification',
  APPROVAL = 'approval',
  CUSTOM_SCRIPT = 'custom_script',
  API_CALL = 'api_call',
  DATABASE_OPERATION = 'database_operation',
  FILE_OPERATION = 'file_operation',
  DECISION = 'decision',
  LOOP = 'loop',
  PARALLEL_EXECUTION = 'parallel_execution',
  WAIT = 'wait',
  HUMAN_TASK = 'human_task'
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  execution_order: string[];
  parallel_groups: ParallelGroup[];
  critical_path: string[];
  estimated_duration_minutes: number;
  complexity_score: number;
  optimization_suggestions: GraphOptimizationSuggestion[];
}

export interface ConditionalLogic {
  condition_type: ConditionType;
  expression: string;
  parameters: Record<string, any>;
  true_branch: BranchAction;
  false_branch: BranchAction;
  evaluation_context: EvaluationContext;
}

export enum ConditionType {
  SIMPLE_COMPARISON = 'simple_comparison',
  COMPLEX_EXPRESSION = 'complex_expression',
  SCRIPT_BASED = 'script_based',
  RULE_ENGINE = 'rule_engine',
  ML_PREDICTION = 'ml_prediction',
  EXTERNAL_SERVICE = 'external_service'
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  approval_type: ApprovalType;
  approvers: Approver[];
  approval_sequence: ApprovalSequence;
  timeout_hours: number;
  escalation_rules: EscalationRule[];
  auto_approval_conditions: AutoApprovalCondition[];
  rejection_handling: RejectionHandling;
  notification_settings: ApprovalNotificationSettings;
}

export enum ApprovalType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  MAJORITY = 'majority',
  UNANIMOUS = 'unanimous',
  ANY_ONE = 'any_one',
  HIERARCHICAL = 'hierarchical',
  CONDITIONAL = 'conditional'
}

export interface WorkflowVersion {
  version: string;
  created_at: string;
  created_by: string;
  changes: VersionChange[];
  change_summary: string;
  breaking_changes: boolean;
  rollback_plan?: RollbackPlan;
  migration_script?: MigrationScript;
  compatibility_notes: string[];
  deployment_status: DeploymentStatus;
}

export interface WorkflowMetrics {
  execution_count: number;
  success_rate: number;
  average_duration_minutes: number;
  failure_reasons: FailureReason[];
  performance_trends: PerformanceTrend[];
  resource_utilization: ResourceUtilizationMetrics;
  cost_metrics: CostMetrics;
  business_impact_metrics: BusinessImpactMetrics;
  user_satisfaction_score: number;
  optimization_opportunities: OptimizationOpportunity[];
}

// API Request/Response types
export interface WorkflowExecutionRequest {
  workflow_definition_id: string;
  priority?: ExecutionPriority;
  input_data: Record<string, any>;
  context?: Partial<ExecutionContext>;
  override_configuration?: Partial<WorkflowConfiguration>;
  notification_settings?: NotificationSettings;
  tags?: string[];
}

export interface WorkflowExecutionResponse {
  execution_id: string;
  status: ExecutionStatus;
  started_at: string;
  estimated_completion_time?: string;
  tracking_url: string;
  initial_context: ExecutionContext;
}

export interface WorkflowListResponse {
  workflows: WorkflowDefinition[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  filters_applied: WorkflowFilters;
  sort_order: string;
}

export interface WorkflowExecutionListResponse {
  executions: WorkflowExecution[];
  total_count: number;
  page: number;
  page_size: number;
  aggregations: ExecutionAggregations;
}

export interface WorkflowFilters {
  status?: WorkflowStatus[];
  category?: WorkflowCategory[];
  created_by?: string[];
  tags?: string[];
  created_after?: string;
  created_before?: string;
  search_query?: string;
}

export interface ExecutionFilters {
  status?: ExecutionStatus[];
  priority?: ExecutionPriority[];
  workflow_ids?: string[];
  started_by?: string[];
  started_after?: string;
  started_before?: string;
  duration_range?: DurationRange;
}

// Supporting interfaces
export interface StepExecution {
  id: string;
  step_id: string;
  status: StepExecutionStatus;
  started_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  error_details?: StepError;
  retry_count: number;
  resource_usage: StepResourceUsage;
  performance_metrics: StepPerformanceMetrics;
  logs: LogEntry[];
}

export enum StepExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
  WAITING_FOR_APPROVAL = 'waiting_for_approval'
}

export interface WorkflowDependency {
  id: string;
  dependent_step_id: string;
  prerequisite_step_id: string;
  dependency_type: DependencyType;
  condition?: DependencyCondition;
  timeout_minutes?: number;
  critical: boolean;
}

export enum DependencyType {
  COMPLETION = 'completion',
  SUCCESS = 'success',
  FAILURE = 'failure',
  CONDITIONAL = 'conditional',
  DATA_DEPENDENCY = 'data_dependency',
  RESOURCE_DEPENDENCY = 'resource_dependency',
  TIME_DEPENDENCY = 'time_dependency'
}

export interface StepConfiguration {
  implementation: StepImplementation;
  parameters: Record<string, any>;
  environment_variables: Record<string, string>;
  resource_limits: ResourceLimits;
  security_context: SecurityContext;
  monitoring_settings: MonitoringSettings;
  custom_properties: Record<string, any>;
}

export interface StepImplementation {
  type: ImplementationType;
  source_code?: string;
  script_path?: string;
  docker_image?: string;
  function_name?: string;
  api_endpoint?: string;
  sql_query?: string;
  command_line?: string;
  configuration_file?: string;
}

export enum ImplementationType {
  INLINE_SCRIPT = 'inline_script',
  EXTERNAL_SCRIPT = 'external_script',
  DOCKER_CONTAINER = 'docker_container',
  LAMBDA_FUNCTION = 'lambda_function',
  REST_API = 'rest_api',
  DATABASE_QUERY = 'database_query',
  COMMAND_LINE = 'command_line',
  BUILT_IN_FUNCTION = 'built_in_function',
  CUSTOM_PLUGIN = 'custom_plugin'
}

export interface ParameterMapping {
  source_parameter: string;
  target_parameter: string;
  transformation?: ParameterTransformation;
  validation?: ParameterValidation;
  default_value?: any;
  required: boolean;
}

export interface ExecutionContext {
  environment: string;
  user_id: string;
  session_id: string;
  trace_id: string;
  business_context: BusinessContext;
  security_context: SecurityContext;
  resource_context: ResourceContext;
  temporal_context: TemporalContext;
  custom_context: Record<string, any>;
}

export interface WorkflowConfiguration {
  max_parallel_steps: number;
  default_timeout_minutes: number;
  error_handling_strategy: ErrorHandlingStrategy;
  retry_configuration: RetryConfiguration;
  notification_configuration: NotificationConfiguration;
  logging_configuration: LoggingConfiguration;
  security_configuration: SecurityConfiguration;
  performance_configuration: PerformanceConfiguration;
  compliance_configuration: ComplianceConfiguration;
}

export enum ErrorHandlingStrategy {
  FAIL_FAST = 'fail_fast',
  CONTINUE_ON_ERROR = 'continue_on_error',
  RETRY_AND_FAIL = 'retry_and_fail',
  COMPENSATE = 'compensate',
  ESCALATE = 'escalate',
  IGNORE = 'ignore',
  CUSTOM = 'custom'
}

export interface WorkflowValidationRule {
  id: string;
  name: string;
  rule_type: ValidationRuleType;
  expression: string;
  severity: ValidationSeverity;
  error_message: string;
  enabled: boolean;
  scope: ValidationScope;
}

export enum ValidationRuleType {
  STRUCTURE_VALIDATION = 'structure_validation',
  DATA_VALIDATION = 'data_validation',
  BUSINESS_RULE = 'business_rule',
  SECURITY_POLICY = 'security_policy',
  COMPLIANCE_RULE = 'compliance_rule',
  PERFORMANCE_CONSTRAINT = 'performance_constraint',
  RESOURCE_CONSTRAINT = 'resource_constraint'
}

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export enum ValidationScope {
  WORKFLOW = 'workflow',
  STEP = 'step',
  PARAMETER = 'parameter',
  DEPENDENCY = 'dependency',
  CONDITION = 'condition'
}

export interface WorkflowMetadata {
  author: string;
  version: string;
  created_date: string;
  last_modified: string;
  documentation_url?: string;
  support_contact?: string;
  license?: string;
  compatibility_requirements: CompatibilityRequirement[];
  resource_requirements: ResourceRequirement[];
  performance_expectations: PerformanceExpectation[];
  security_requirements: SecurityRequirement[];
  compliance_requirements: ComplianceRequirement[];
}

export interface StepDependency {
  step_id: string;
  dependency_type: StepDependencyType;
  condition?: string;
  timeout_minutes?: number;
}

export enum StepDependencyType {
  PREDECESSOR = 'predecessor',
  SUCCESSOR = 'successor',
  CONDITIONAL = 'conditional',
  PARALLEL = 'parallel',
  EXCLUSIVE = 'exclusive'
}

export interface StepCondition {
  condition_id: string;
  expression: string;
  action: ConditionAction;
  parameters: Record<string, any>;
}

export enum ConditionAction {
  EXECUTE = 'execute',
  SKIP = 'skip',
  FAIL = 'fail',
  RETRY = 'retry',
  BRANCH = 'branch',
  WAIT = 'wait'
}

export interface RetryPolicy {
  max_attempts: number;
  delay_seconds: number;
  backoff_strategy: BackoffStrategy;
  retry_conditions: RetryCondition[];
  escalation_policy?: EscalationPolicy;
}

export enum BackoffStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  RANDOM = 'random',
  CUSTOM = 'custom'
}