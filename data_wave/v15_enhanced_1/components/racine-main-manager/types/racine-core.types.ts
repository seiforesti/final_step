/**
 * Racine Core Types - Complete TypeScript Type Definitions
 * =========================================================
 *
 * This file contains comprehensive TypeScript type definitions that map 100% to the backend
 * Racine models, ensuring complete type safety and perfect backend-frontend integration.
 *
 * Type Categories:
 * - Core System Types: Master state management and system health
 * - Cross-Group Integration Types: Multi-group orchestration and coordination
 * - Orchestration Types: Workflow and pipeline management
 * - Workspace Types: Multi-workspace and resource management
 * - AI Assistant Types: Context-aware AI functionality
 * - Activity & Monitoring Types: Comprehensive tracking and analytics
 * - Dashboard Types: Real-time metrics and visualization
 * - Collaboration Types: Team workspace and communication
 * - Integration Types: External system and API gateway integration
 * - User Management Types: RBAC and profile management
 *
 * All types are designed to match backend models exactly and provide
 * comprehensive type safety for enterprise-grade applications.
 */

// =============================================================================
// UTILITY AND BASE TYPES
// =============================================================================

export type UUID = string;
export type ISODateString = string;
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {}

// Status enumerations matching backend
export enum SystemStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  FAILED = "failed",
  MAINTENANCE = "maintenance",
  INITIALIZING = "initializing",
}

export enum OperationStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  PAUSED = "paused",
}

export enum ViewMode {
  DASHBOARD = "dashboard",
  WORKSPACE = "workspace",
  WORKFLOWS = "workflows",
  PIPELINES = "pipelines",
  AI_ASSISTANT = "ai_assistant",
  ACTIVITY = "activity",
  COLLABORATION = "collaboration",
  SETTINGS = "settings",
  // Data Governance Group SPAs - Full routing support
  DATA_SOURCES = "data_sources",
  SCAN_RULE_SETS = "scan_rule_sets",
  CLASSIFICATIONS = "classifications",
  COMPLIANCE_RULES = "compliance_rules",
  ADVANCED_CATALOG = "advanced_catalog",
  SCAN_LOGIC = "scan_logic",
  RBAC_SYSTEM = "rbac_system",
}

export enum LayoutMode {
  SINGLE_PANE = "single_pane",
  SPLIT_SCREEN = "split_screen",
  TABBED = "tabbed",
  GRID = "grid",
  CUSTOM = "custom",
}

export enum IntegrationStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  FAILED = "failed",
  MAINTENANCE = "maintenance",
  INITIALIZING = "initializing",
}

// =============================================================================
// CORE SYSTEM TYPES - Master State Management
// =============================================================================

/**
 * Main Racine system state - maps to RacineOrchestrationMaster backend model
 */
export interface RacineState {
  // Core state fields
  isInitialized: boolean;
  currentView: ViewMode;
  activeWorkspaceId: UUID;
  layoutMode: LayoutMode;
  sidebarCollapsed: boolean;
  loading: boolean;
  error: string | null;

  // System health and monitoring
  systemHealth: SystemHealth;
  lastActivity: ISODateString;
  performanceMetrics: PerformanceMetrics;

  // Cross-group state
  connectedGroups: GroupConfiguration[];
  activeIntegrations: Integration[];
  globalMetrics: Record<string, JSONValue>;

  // User context
  currentUser: UserContext;
  permissions: RBACPermissions;
  preferences: UserPreferences;

  // Real-time updates
  websocketConnected: boolean;
  lastSync: ISODateString;
}

/**
 * Cross-group integration state
 */
export interface CrossGroupState {
  connectedGroups: GroupConfiguration[];
  activeIntegrations: Integration[];
  sharedResources: SharedResource[];
  crossGroupWorkflows: CrossGroupWorkflow[];
  globalMetrics: Record<string, JSONValue>;
  synchronizationStatus: SynchronizationStatus;
  lastSync: ISODateString;
  healthStatus: Record<string, SystemStatus>;
}

/**
 * System health monitoring - maps to RacineSystemHealth backend model
 */
export interface SystemHealth {
  overall: SystemStatus;
  groups: Record<string, GroupHealth>;
  services: Record<string, ServiceHealth>;
  integrations: Record<string, IntegrationHealth>;
  performance: PerformanceHealth;
  lastCheck: ISODateString;
  uptime: number;
  version: string;
}

export interface GroupHealth {
  groupId: string;
  groupName: string;
  status: SystemStatus;
  responseTime: number;
  errorRate: number;
  lastCheck: ISODateString;
  endpoints: EndpointHealth[];
  capabilities: string[];
}

export interface ServiceHealth {
  serviceId: string;
  serviceName: string;
  status: SystemStatus;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  lastCheck: ISODateString;
}

export interface IntegrationHealth {
  integrationId: UUID;
  integrationName: string;
  status: IntegrationStatus;
  lastSync: ISODateString;
  syncSuccess: boolean;
  errorCount: number;
  responseTime: number;
}

export interface EndpointHealth {
  endpoint: string;
  status: SystemStatus;
  responseTime: number;
  statusCode: number;
  lastCheck: ISODateString;
}

export interface PerformanceHealth {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
}

/**
 * Performance metrics tracking
 */
export interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    operationsPerSecond: number;
    dataProcessed: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  errors: {
    totalCount: number;
    errorRate: number;
    criticalErrors: number;
    warningCount: number;
  };
  lastUpdated: ISODateString;
}

// =============================================================================
// GROUP CONFIGURATION AND INTEGRATION TYPES
// =============================================================================

/**
 * Group configuration - maps to supported data governance groups
 */
export interface GroupConfiguration {
  groupId: string;
  groupName: string;
  description: string;
  serviceClass: string;
  endpoints: string[];
  capabilities: string[];
  status: SystemStatus;
  version: string;
  healthCheckInterval: number;
  timeout: number;
  retryCount: number;
  configuration: Record<string, JSONValue>;
  lastHealthCheck: ISODateString;
}

/**
 * Integration definition between groups
 */
export interface Integration {
  id: UUID;
  name: string;
  description: string;
  sourceGroup: string;
  targetGroups: string[];
  integrationType: string;
  status: IntegrationStatus;
  configuration: Record<string, JSONValue>;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastSync: ISODateString;
  syncResults: Record<string, JSONValue>;
}

/**
 * Shared resource across groups
 */
export interface SharedResource {
  id: UUID;
  name: string;
  type: string;
  description: string;
  sourceGroup: string;
  sharedWithGroups: string[];
  resourceData: Record<string, JSONValue>;
  permissions: ResourcePermissions;
  createdBy: UUID;
  createdAt: ISODateString;
  lastAccessed: ISODateString;
  accessCount: number;
}

export interface ResourcePermissions {
  read: string[];
  write: string[];
  delete: string[];
  admin: string[];
}

/**
 * Cross-group workflow definition
 */
export interface CrossGroupWorkflow {
  id: UUID;
  name: string;
  description: string;
  groups: string[];
  steps: WorkflowStep[];
  dependencies: WorkflowDependency[];
  status: OperationStatus;
  configuration: Record<string, JSONValue>;
  createdBy: UUID;
  createdAt: ISODateString;
  lastExecution: ISODateString;
  executionHistory: WorkflowExecution[];
}

/**
 * Synchronization status across groups
 */
export interface SynchronizationStatus {
  overall: SystemStatus;
  groups: Record<string, GroupSyncStatus>;
  lastGlobalSync: ISODateString;
  syncInProgress: boolean;
  pendingSyncs: number;
  failedSyncs: number;
  totalSyncs: number;
}

export interface GroupSyncStatus {
  groupId: string;
  status: SystemStatus;
  lastSync: ISODateString;
  syncDuration: number;
  recordsSynced: number;
  errors: string[];
}

// =============================================================================
// WORKSPACE MANAGEMENT TYPES - Maps to RacineWorkspace models
// =============================================================================

/**
 * Workspace configuration - maps to RacineWorkspace backend model
 */
export interface WorkspaceConfiguration {
  id: UUID;
  name: string;
  description: string;
  type: WorkspaceType;
  owner: UUID;
  members: WorkspaceMember[];
  groups: string[];
  resources: WorkspaceResource[];
  settings: WorkspaceSettings;
  analytics: WorkspaceAnalytics;
  permissions: WorkspacePermissions;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastAccessed: ISODateString;
  isActive: boolean;
  tags: string[];
}

export enum WorkspaceType {
  PERSONAL = "personal",
  TEAM = "team",
  ENTERPRISE = "enterprise",
  PROJECT = "project",
  TEMPORARY = "temporary",
}

/**
 * Workspace member - maps to RacineWorkspaceMember backend model
 */
export interface WorkspaceMember {
  id: UUID;
  workspaceId: UUID;
  userId: UUID;
  role: WorkspaceRole;
  permissions: string[];
  addedBy: UUID;
  addedAt: ISODateString;
  lastActivity: ISODateString;
  isActive: boolean;
  user: UserProfile;
}

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
  GUEST = "guest",
}

/**
 * Workspace resource - maps to RacineWorkspaceResource backend model
 */
export interface WorkspaceResource {
  id: UUID;
  workspaceId: UUID;
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  name: string;
  description: string;
  metadata: Record<string, JSONValue>;
  addedBy: UUID;
  addedAt: ISODateString;
  lastAccessed: ISODateString;
  accessCount: number;
  permissions: ResourcePermissions;
}

export interface WorkspaceSettings {
  theme: string;
  layout: LayoutMode;
  defaultView: ViewMode;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  integrations: IntegrationSettings;
  customizations: Record<string, JSONValue>;
}

export interface WorkspaceAnalytics {
  totalMembers: number;
  totalResources: number;
  activityLevel: number;
  collaborationScore: number;
  resourceUtilization: number;
  averageSessionDuration: number;
  mostActiveMembers: string[];
  mostUsedResources: string[];
  growthTrends: Record<string, number[]>;
  lastUpdated: ISODateString;
}

export interface WorkspacePermissions {
  canInvite: boolean;
  canRemoveMembers: boolean;
  canModifySettings: boolean;
  canDeleteWorkspace: boolean;
  canManageResources: boolean;
  canViewAnalytics: boolean;
}

// =============================================================================
// WORKFLOW AND PIPELINE TYPES - Maps to RacineWorkflow/Pipeline models
// =============================================================================

/**
 * Workflow definition - maps to RacineJobWorkflow backend model
 */
export interface WorkflowDefinition {
  id: UUID;
  name: string;
  description: string;
  version: string;
  workspaceId: UUID;
  steps: WorkflowStep[];
  dependencies: WorkflowDependency[];
  parameters: WorkflowParameter[];
  schedule: WorkflowSchedule;
  configuration: WorkflowConfiguration;
  status: OperationStatus;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastExecution: ISODateString;
  executionCount: number;
  successRate: number;
  averageDuration: number;
}

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  id: UUID;
  name: string;
  description: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  inputs: StepInput[];
  outputs: StepOutput[];
  dependencies: string[];
  timeout: number;
  retryPolicy: RetryPolicy;
  condition: StepCondition;
  position: StepPosition;
}

export enum StepType {
  DATA_SOURCE = "data_source",
  SCAN_RULE = "scan_rule",
  CLASSIFICATION = "classification",
  COMPLIANCE = "compliance",
  CATALOG = "catalog",
  SCAN_LOGIC = "scan_logic",
  AI_PROCESSING = "ai_processing",
  CUSTOM = "custom",
}

export interface StepInput {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
}

export interface StepOutput {
  name: string;
  type: string;
  description: string;
  schema?: Record<string, JSONValue>;
}

export interface StepCondition {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
}

export enum ConditionType {
  ALWAYS = "always",
  ON_SUCCESS = "on_success",
  ON_FAILURE = "on_failure",
  CONDITIONAL = "conditional",
}

export interface StepPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Workflow dependency
 */
export interface WorkflowDependency {
  id: UUID;
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
  parameters?: Record<string, JSONValue>;
}

export enum DependencyType {
  SEQUENCE = "sequence",
  PARALLEL = "parallel",
  CONDITIONAL = "conditional",
  LOOP = "loop",
}

/**
 * Workflow parameter
 */
export interface WorkflowParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
}

export interface ValidationRule {
  type: string;
  value: JSONValue;
  message: string;
}

/**
 * Workflow schedule
 */
export interface WorkflowSchedule {
  enabled: boolean;
  type: ScheduleType;
  cronExpression?: string;
  interval?: number;
  timezone: string;
  startDate?: ISODateString;
  endDate?: ISODateString;
  maxRuns?: number;
  notifications: NotificationRule[];
}

export enum ScheduleType {
  MANUAL = "manual",
  CRON = "cron",
  INTERVAL = "interval",
  EVENT_TRIGGERED = "event_triggered",
}

export interface NotificationRule {
  type: NotificationType;
  recipients: string[];
  events: string[];
  template: string;
}

export enum NotificationType {
  EMAIL = "email",
  SLACK = "slack",
  WEBHOOK = "webhook",
  IN_APP = "in_app",
}

/**
 * Workflow configuration
 */
export interface WorkflowConfiguration {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicy;
  errorHandling: ErrorHandlingPolicy;
  logging: LoggingConfiguration;
  monitoring: MonitoringConfiguration;
  resources: ResourceConfiguration;
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
}

export enum BackoffStrategy {
  FIXED = "fixed",
  LINEAR = "linear",
  EXPONENTIAL = "exponential",
}

export interface ErrorHandlingPolicy {
  onFailure: FailureAction;
  continueOnError: boolean;
  notificationEnabled: boolean;
  logLevel: LogLevel;
}

export enum FailureAction {
  STOP = "stop",
  CONTINUE = "continue",
  RETRY = "retry",
  SKIP = "skip",
}

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LoggingConfiguration {
  level: LogLevel;
  includeParameters: boolean;
  includeResults: boolean;
  retention: number;
}

export interface MonitoringConfiguration {
  metricsEnabled: boolean;
  alertingEnabled: boolean;
  performanceThresholds: Record<string, number>;
  customMetrics: string[];
}

export interface ResourceConfiguration {
  cpuLimit: number;
  memoryLimit: number;
  diskSpace: number;
  networkBandwidth: number;
}

/**
 * Workflow execution - maps to RacineJobExecution backend model
 */
export interface WorkflowExecution {
  id: UUID;
  workflowId: UUID;
  workflowVersion: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  triggeredBy: UUID;
  triggerType: TriggerType;
  parameters: Record<string, JSONValue>;
  stepExecutions: StepExecution[];
  results: ExecutionResults;
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  errors: ExecutionError[];
}

export enum TriggerType {
  MANUAL = "manual",
  SCHEDULED = "scheduled",
  EVENT = "event",
  API = "api",
}

export interface StepExecution {
  stepId: UUID;
  stepName: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: StepMetrics;
  logs: string[];
  errors: string[];
}

export interface StepMetrics {
  dataProcessed: number;
  recordsProcessed: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  diskIO: number;
}

export interface ExecutionResults {
  success: boolean;
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  skippedSteps: number;
  dataProcessed: number;
  recordsProcessed: number;
  outputArtifacts: string[];
  summary: string;
}

export interface ExecutionMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  resourceUsage: ResourceUsage;
  performance: PerformanceMetrics;
  cost: CostMetrics;
}

export interface ResourceUsage {
  peakMemory: number;
  avgCpuUsage: number;
  diskIO: number;
  networkIO: number;
  duration: number;
}

export interface CostMetrics {
  computeCost: number;
  storageCost: number;
  networkCost: number;
  totalCost: number;
  currency: string;
}

export interface ExecutionLog {
  timestamp: ISODateString;
  level: LogLevel;
  message: string;
  stepId?: UUID;
  metadata?: Record<string, JSONValue>;
}

export interface ExecutionError {
  timestamp: ISODateString;
  stepId?: UUID;
  errorType: string;
  errorCode: string;
  message: string;
  stackTrace?: string;
  recoverable: boolean;
  metadata?: Record<string, JSONValue>;
}

// =============================================================================
// PIPELINE TYPES - Maps to RacinePipeline models
// =============================================================================

/**
 * Pipeline definition - maps to RacinePipeline backend model
 */
export interface PipelineDefinition {
  id: UUID;
  name: string;
  description?: string;
  version: string;
  status: PipelineStatus;

  // Pipeline configuration
  pipeline_definition: Record<string, JSONValue>; // Complete pipeline DAG definition
  stage_configurations?: Record<string, JSONValue>; // Individual stage configurations
  data_flow_mapping?: Record<string, JSONValue>; // Data flow between stages
  dependency_graph?: Record<string, JSONValue>; // Stage dependency graph

  // Cross-group integration
  involved_groups?: string[]; // List of groups involved in pipeline
  group_stage_mapping?: Record<string, JSONValue>; // Mapping of stages to groups
  cross_group_data_flow?: Record<string, JSONValue>; // Data flow across groups
  group_specific_configs?: Record<string, JSONValue>; // Group-specific configurations

  // Performance and optimization
  performance_targets?: Record<string, JSONValue>; // Performance targets and SLAs
  optimization_config?: Record<string, JSONValue>; // AI optimization configuration
  resource_allocation?: Record<string, JSONValue>; // Resource allocation per stage
  scaling_policies?: Record<string, JSONValue>; // Auto-scaling policies

  // AI-driven optimization
  ai_optimization_enabled: boolean;
  optimization_history?: Record<string, JSONValue>; // History of AI optimizations
  performance_baselines?: Record<string, JSONValue>; // Performance baselines
  optimization_recommendations?: Record<string, JSONValue>; // Current AI recommendations

  // Pipeline templates and reusability
  is_template: boolean;
  template_category?: string;
  template_tags?: string[]; // Template categorization tags
  parent_template_id?: UUID;

  // Versioning and lifecycle
  previous_version_id?: UUID;
  next_version_id?: UUID;
  is_current_version: boolean;
  deprecation_date?: ISODateString;

  // Data lineage and quality
  data_lineage_config?: Record<string, JSONValue>; // Data lineage tracking configuration
  quality_gates?: Record<string, JSONValue>; // Quality gates and validations
  data_governance_rules?: Record<string, JSONValue>; // Data governance rules
  compliance_requirements?: Record<string, JSONValue>; // Compliance requirements

  // Monitoring and alerting
  monitoring_config?: Record<string, JSONValue>; // Monitoring configuration
  alerting_rules?: Record<string, JSONValue>; // Alerting rules and thresholds
  notification_settings?: Record<string, JSONValue>; // Notification preferences
  health_check_config?: Record<string, JSONValue>; // Health check configuration

  // Security and access control
  access_level: AccessLevel; // private, team, organization, public
  allowed_groups?: string[]; // RBAC groups allowed to access
  execution_permissions?: Record<string, JSONValue>; // Execution permission configuration
  data_access_policies?: Record<string, JSONValue>; // Data access policies

  // Integration with orchestration
  orchestration_master_id?: UUID;

  // Audit and tracking fields
  created_at: ISODateString;
  updated_at: ISODateString;
  created_by: UUID;
  updated_by?: UUID;

  // Legacy fields for backward compatibility
  workspaceId?: UUID;
  stages?: PipelineStage[];
  configuration?: PipelineConfiguration;
  lastExecution?: ISODateString;
  executionCount?: number;
  successRate?: number;
  averageDuration?: number;
  tags?: string[];
}

export enum PipelineStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  OPTIMIZING = "optimizing",
  ARCHIVED = "archived",
}

export enum AccessLevel {
  PRIVATE = "private",
  TEAM = "team",
  ORGANIZATION = "organization",
  PUBLIC = "public",
}

/**
 * Pipeline execution - maps to RacinePipelineExecution backend model
 */
export interface PipelineExecution {
  id: UUID;

  // Execution basic information
  execution_name?: string;
  status: PipelineStatus;
  trigger_type: TriggerType; // manual, scheduled, event_driven, api

  // Execution context
  triggered_by: UUID;
  trigger_data?: Record<string, JSONValue>; // Data that triggered the execution
  execution_context?: Record<string, JSONValue>; // Execution environment context
  input_parameters?: Record<string, JSONValue>; // Input parameters for this execution
  input_data_sources?: Record<string, JSONValue>; // Input data sources

  // Timing information
  started_at: ISODateString;
  completed_at?: ISODateString;
  estimated_completion?: ISODateString;
  actual_duration?: number; // Duration in seconds
  estimated_duration?: number; // Estimated duration in seconds

  // Progress tracking
  total_stages: number;
  completed_stages: number;
  failed_stages: number;
  skipped_stages: number;
  current_stage?: string;
  progress_percentage: number;

  // Resource tracking
  resource_usage?: Record<string, JSONValue>; // Current resource usage
  peak_resource_usage?: Record<string, JSONValue>; // Peak resource usage
  resource_allocation?: Record<string, JSONValue>; // Allocated resources
  cost_tracking?: Record<string, JSONValue>; // Cost tracking data

  // Performance metrics
  throughput_metrics?: Record<string, JSONValue>; // Throughput measurements
  performance_metrics?: Record<string, JSONValue>; // Performance data
  bottlenecks_detected?: Record<string, JSONValue>; // Performance bottlenecks
  optimization_applied?: Record<string, JSONValue>; // Applied optimizations

  // Data processing metrics
  total_records_processed: number;
  total_records_failed: number;
  total_data_size?: number; // Data size in bytes
  data_quality_score?: number; // Overall data quality score

  // Output and results
  execution_results?: Record<string, JSONValue>; // Execution results
  output_artifacts?: string[]; // Output artifacts paths
  logs_location?: string; // Location of execution logs
  metrics_snapshot?: Record<string, JSONValue>; // Metrics snapshot

  // Error handling
  error_details?: Record<string, JSONValue>; // Error details if execution failed
  error_recovery_attempts?: number;
  last_error_stage?: string;
  error_handling_stages?: string[]; // Stages to execute on error

  // AI optimization
  ai_optimization_enabled: boolean;
  optimization_priorities?: Record<string, JSONValue>; // Optimization priorities
  learning_data?: Record<string, JSONValue>; // Data for AI learning

  // Pipeline reference
  pipeline_id: UUID;

  // Legacy fields for backward compatibility
  pipelineId?: UUID;
  pipelineVersion?: string;
  startTime?: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  triggerType?: TriggerType;
  stageExecutions?: StageExecution[];
  results?: PipelineResults;
  metrics?: PipelineMetrics;
  logs?: ExecutionLog[];
  errors?: ExecutionError[];
}

/**
 * Pipeline stage - maps to RacinePipelineStage backend model
 */
export interface PipelineStage {
  id: UUID;
  stage_name: string;
  stage_description?: string;
  stage_type: PipelineStageType;
  stage_order: number;

  // Stage configuration
  stage_configuration: Record<string, JSONValue>; // Stage-specific configuration
  input_schema?: Record<string, JSONValue>; // Input data schema
  output_schema?: Record<string, JSONValue>; // Output data schema
  validation_rules?: Record<string, JSONValue>; // Data validation rules

  // Dependencies and flow
  depends_on?: string[]; // Stage dependencies
  parallel_execution: boolean; // Can execute in parallel
  conditional_execution?: Record<string, JSONValue>; // Conditional execution logic
  data_flow_config?: Record<string, JSONValue>; // Data flow configuration

  // Cross-group integration
  target_group: string; // Which group this stage targets
  group_operation: string; // Specific operation within the group
  group_specific_config?: Record<string, JSONValue>; // Group-specific configuration

  // Performance and resources
  resource_requirements?: Record<string, JSONValue>; // Resource requirements
  performance_targets?: Record<string, JSONValue>; // Performance targets
  timeout_seconds?: number; // Stage timeout
  retry_policy?: RetryPolicy; // Retry configuration

  // Quality and compliance
  quality_requirements?: Record<string, JSONValue>; // Quality requirements
  compliance_requirements?: Record<string, JSONValue>; // Compliance requirements
  data_lineage_config?: Record<string, JSONValue>; // Data lineage configuration

  // Monitoring and alerting
  monitoring_config?: Record<string, JSONValue>; // Monitoring configuration
  alerting_config?: Record<string, JSONValue>; // Alerting configuration
  health_check_config?: Record<string, JSONValue>; // Health check configuration

  // Error handling
  error_handling_policy?: Record<string, JSONValue>; // Error handling policy
  error_recovery_config?: Record<string, JSONValue>; // Error recovery configuration
  error_handling_stages?: string[]; // Stages to execute on error

  // AI optimization
  ai_optimization_enabled: boolean;
  optimization_priorities?: Record<string, JSONValue>; // Optimization priorities
  learning_data?: Record<string, JSONValue>; // Data for AI learning

  // Pipeline reference
  pipeline_id: UUID;

  // Legacy fields for backward compatibility
  name?: string;
  description?: string;
  type?: StageType;
  groupId?: string;
  operations?: PipelineOperation[];
  inputs?: StageInput[];
  outputs?: StageOutput[];
  dependencies?: string[];
  parallelism?: number;
  timeout?: number;
  position?: StagePosition;
  configuration?: Record<string, JSONValue>;
}

export enum PipelineStageType {
  DATA_INGESTION = "data_ingestion",
  DATA_TRANSFORMATION = "data_transformation",
  DATA_VALIDATION = "data_validation",
  QUALITY_CHECK = "quality_check",
  CLASSIFICATION = "classification",
  COMPLIANCE_VALIDATION = "compliance_validation",
  CATALOG_UPDATE = "catalog_update",
  SCAN_EXECUTION = "scan_execution",
  AI_PROCESSING = "ai_processing",
  NOTIFICATION = "notification",
  CONDITIONAL_BRANCH = "conditional_branch",
  PARALLEL_PROCESSING = "parallel_processing",
  CUSTOM_OPERATION = "custom_operation",
}

/**
 * Pipeline stage execution - maps to RacineStageExecution backend model
 */
export interface PipelineStageExecution {
  id: UUID;

  // Execution information
  status: PipelineStatus;
  started_at: ISODateString;
  completed_at?: ISODateString;
  duration_seconds?: number;

  // Data processing
  input_data?: Record<string, JSONValue>; // Actual input data for this execution
  output_data?: Record<string, JSONValue>; // Output data from this execution
  records_processed: number;
  records_failed: number;
  data_quality_metrics?: Record<string, JSONValue>; // Data quality metrics

  // Performance tracking
  resource_usage?: Record<string, JSONValue>; // Resource consumption
  performance_metrics?: Record<string, JSONValue>; // Performance metrics
  throughput_metrics?: Record<string, JSONValue>; // Throughput measurements
  bottlenecks_detected?: Record<string, JSONValue>; // Performance bottlenecks

  // Quality and compliance results
  quality_check_results?: Record<string, JSONValue>; // Quality validation results
  compliance_validation_results?: Record<string, JSONValue>; // Compliance validation results
  validation_errors?: Record<string, JSONValue>; // Validation errors encountered

  // Error handling
  execution_logs?: string; // Execution logs
  error_details?: Record<string, JSONValue>; // Error details if stage failed
  retry_attempts: number;
  retry_reason?: string;
  recovery_actions?: Record<string, JSONValue>;

  // AI optimization tracking
  optimization_applied?: Record<string, JSONValue>; // Applied optimizations
  performance_improvement?: number; // Performance improvement
  ai_recommendations_generated?: Record<string, JSONValue>; // AI recommendations generated

  // References
  pipeline_execution_id: UUID;
  pipeline_stage_id: UUID;
}

/**
 * Pipeline template - maps to RacinePipelineTemplate backend model
 */
export interface PipelineTemplate {
  id: UUID;

  // Template information
  template_name: string;
  template_description?: string;
  template_category: string;
  template_version: string;
  complexity_level: ComplexityLevel; // beginner, intermediate, advanced

  // Template configuration
  template_definition: Record<string, JSONValue>; // Complete template definition
  parameter_schema?: Record<string, JSONValue>; // Schema for template parameters
  default_parameters?: Record<string, JSONValue>; // Default parameter values
  validation_rules?: Record<string, JSONValue>; // Parameter validation rules

  // Template metadata
  use_cases?: string[]; // Documented use cases
  prerequisites?: string[]; // Prerequisites for using template
  expected_outcomes?: string[]; // Expected outcomes
  supported_groups?: string[]; // Supported groups
  integration_examples?: Record<string, JSONValue>; // Integration examples

  // Performance and optimization
  performance_benchmarks?: Record<string, JSONValue>; // Performance benchmarks
  optimization_recommendations?: Record<string, JSONValue>; // Optimization recommendations
  best_practices?: string[]; // Best practices
  common_issues?: string[]; // Common issues and solutions

  // AI enhancements
  ai_optimization_enabled: boolean;
  ai_recommendations?: Record<string, JSONValue>; // AI recommendations for usage
  learning_data?: Record<string, JSONValue>; // Learning data for improvement
  success_patterns?: Record<string, JSONValue>; // Success patterns

  // Usage tracking
  usage_count: number;
  success_rate: number;
  average_execution_time?: number;
  user_ratings?: Record<string, JSONValue>; // User ratings and feedback

  // Versioning and maintenance
  is_active: boolean;
  maintenance_schedule?: Record<string, JSONValue>; // Maintenance schedule
  deprecation_notice?: string;
  migration_guide?: string;

  // Access control
  access_level: AccessLevel;
  allowed_groups?: string[];
  created_by_organization?: UUID;

  // Base pipeline reference
  base_pipeline_id?: UUID;

  // Audit fields
  created_at: ISODateString;
  updated_at: ISODateString;
  created_by: UUID;
  updated_by?: UUID;
}

export enum ComplexityLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

/**
 * Pipeline optimization - maps to RacinePipelineOptimization backend model
 */
export interface PipelineOptimization {
  id: UUID;
  optimization_type: PipelineOptimizationType;
  recommendation_data: Record<string, JSONValue>;
  implementation_status: OptimizationStatus;
  expected_improvement: Record<string, JSONValue>;
  actual_improvement?: Record<string, JSONValue>;
  confidence_score: number;

  // AI analysis
  ai_analysis: Record<string, JSONValue>;
  learning_source: string;
  validation_results?: Record<string, JSONValue>;

  // Implementation tracking
  applied_at?: ISODateString;
  rollback_plan?: Record<string, JSONValue>;
  monitoring_config?: Record<string, JSONValue>;

  // Pipeline reference
  pipeline_id: UUID;

  // Audit fields
  created_at: ISODateString;
  updated_at: ISODateString;
  created_by: UUID;
}

export enum PipelineOptimizationType {
  PERFORMANCE = "performance",
  RESOURCE_USAGE = "resource_usage",
  COST = "cost",
  RELIABILITY = "reliability",
  THROUGHPUT = "throughput",
  LATENCY = "latency",
  QUALITY = "quality",
}

export enum OptimizationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  APPLIED = "applied",
  REJECTED = "rejected",
  ROLLED_BACK = "rolled_back",
}

// =============================================================================
// AI ASSISTANT TYPES - Maps to RacineAI models
// =============================================================================

/**
 * AI conversation type enumeration - maps to AIConversationType backend enum
 */
export enum AIConversationType {
  GENERAL_QUERY = "general_query",
  TECHNICAL_SUPPORT = "technical_support",
  WORKFLOW_ASSISTANCE = "workflow_assistance",
  PIPELINE_OPTIMIZATION = "pipeline_optimization",
  DATA_DISCOVERY = "data_discovery",
  COMPLIANCE_GUIDANCE = "compliance_guidance",
  TROUBLESHOOTING = "troubleshooting",
  KNOWLEDGE_DISCOVERY = "knowledge_discovery",
  CROSS_GROUP_ANALYSIS = "cross_group_analysis",
  SYSTEM_MONITORING = "system_monitoring",
}

/**
 * AI recommendation type enumeration - maps to AIRecommendationType backend enum
 */
export enum AIRecommendationType {
  PERFORMANCE_OPTIMIZATION = "performance_optimization",
  WORKFLOW_IMPROVEMENT = "workflow_improvement",
  PIPELINE_OPTIMIZATION = "pipeline_optimization",
  RESOURCE_ALLOCATION = "resource_allocation",
  SECURITY_ENHANCEMENT = "security_enhancement",
  COMPLIANCE_IMPROVEMENT = "compliance_improvement",
  DATA_QUALITY = "data_quality",
  INTEGRATION_OPTIMIZATION = "integration_optimization",
  COST_OPTIMIZATION = "cost_optimization",
  AUTOMATION_OPPORTUNITY = "automation_opportunity",
  KNOWLEDGE_SHARING = "knowledge_sharing",
  PROCESS_IMPROVEMENT = "process_improvement",
}

/**
 * AI insight type enumeration - maps to AIInsightType backend enum
 */
export enum AIInsightType {
  TREND_ANALYSIS = "trend_analysis",
  PATTERN_DISCOVERY = "pattern_discovery",
  ANOMALY_DETECTION = "anomaly_detection",
  PREDICTIVE_ANALYSIS = "predictive_analysis",
  CORRELATION_DISCOVERY = "correlation_discovery",
  PERFORMANCE_ANALYSIS = "performance_analysis",
  USAGE_ANALYSIS = "usage_analysis",
  RISK_ASSESSMENT = "risk_assessment",
  OPPORTUNITY_IDENTIFICATION = "opportunity_identification",
  CROSS_GROUP_INSIGHTS = "cross_group_insights",
}

/**
 * AI learning type enumeration - maps to AILearningType backend enum
 */
export enum AILearningType {
  USER_INTERACTION = "user_interaction",
  SYSTEM_BEHAVIOR = "system_behavior",
  PERFORMANCE_FEEDBACK = "performance_feedback",
  RECOMMENDATION_OUTCOME = "recommendation_outcome",
  WORKFLOW_EXECUTION = "workflow_execution",
  PIPELINE_PERFORMANCE = "pipeline_performance",
  ERROR_PATTERN = "error_pattern",
  OPTIMIZATION_RESULT = "optimization_result",
  USER_PREFERENCE = "user_preference",
  DOMAIN_KNOWLEDGE = "domain_knowledge",
}

/**
 * AI conversation - maps to RacineAIConversation backend model
 */
export interface AIConversation {
  id: UUID;
  userId: UUID;
  workspaceId?: UUID;

  // Conversation basic information
  conversationTitle: string;
  conversationType: AIConversationType;
  status: string; // active, archived, resolved
  priority: string; // low, normal, high, urgent

  // Context information
  userContext: Record<string, JSONValue>;
  systemContext: Record<string, JSONValue>;
  workspaceContext: Record<string, JSONValue>;
  groupContext: Record<string, JSONValue>;

  // Conversation metadata
  conversationSummary?: string;
  keyTopics: string[];
  mentionedEntities: Record<string, JSONValue>;
  crossGroupReferences: Record<string, JSONValue>;

  // Resolution tracking
  isResolved: boolean;
  resolutionType?: string; // answered, escalated, automated, closed
  resolutionSummary?: string;
  userSatisfaction?: number; // 1-10 rating

  // Learning and improvement
  learningPoints: Record<string, JSONValue>;
  improvementSuggestions: Record<string, JSONValue>;
  knowledgeGaps: Record<string, JSONValue>;

  // Analytics and metrics
  messageCount: number;
  durationMinutes?: number;
  responseTimeAvg?: number;
  accuracyScore?: number;

  // Integration tracking
  workflowsTriggered: Record<string, JSONValue>;
  pipelinesReferenced: Record<string, JSONValue>;
  resourcesAccessed: Record<string, JSONValue>;
  actionsPerformed: Record<string, JSONValue>;

  // Timing
  startedAt: ISODateString;
  lastActivity: ISODateString;
  endedAt?: ISODateString;

  // Relations
  messages: AIMessage[];
  recommendations: AIRecommendation[];

  // Legacy compatibility
  title: string; // alias for conversationTitle
  context: AIContext;
  createdAt: ISODateString; // alias for startedAt
  updatedAt: ISODateString; // alias for lastActivity
  metadata: Record<string, JSONValue>;
}

export enum ConversationStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  RESOLVED = "resolved",
  DELETED = "deleted",
}

/**
 * AI message within conversation - maps to RacineAIMessage backend model
 */
export interface AIMessage {
  id: UUID;
  conversationId: UUID;

  // Message basic information
  role: MessageRole;
  content: string;
  messageType: MessageType;
  isFromUser: boolean;

  // AI analysis
  intentDetected?: string;
  entitiesExtracted: Record<string, JSONValue>;
  sentimentScore?: number;
  confidenceScore?: number;
  complexityScore?: number;

  // Processing information
  processingTimeMs?: number;
  aiModelUsed?: string;
  processingPipeline: Record<string, JSONValue>;
  externalApisCalled: Record<string, JSONValue>;

  // Context and references
  contextUsed: Record<string, JSONValue>;
  referencedDocuments: Record<string, JSONValue>;
  crossGroupDataUsed: Record<string, JSONValue>;
  workflowContext?: Record<string, JSONValue>;

  // Quality and feedback
  userFeedback?: string; // helpful, not_helpful, etc.
  accuracyRating?: number;
  relevanceScore?: number;
  improvementNotes?: string;

  // Actions and results
  actionsSuggested: Record<string, JSONValue>;
  actionsExecuted: Record<string, JSONValue>;
  followUpRequired: boolean;
  followUpActions: Record<string, JSONValue>;

  // Message order
  messageOrder: number;

  // Timing
  timestamp: ISODateString;

  // Legacy compatibility
  context: MessageContext;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  metadata: Record<string, JSONValue>;
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum MessageType {
  TEXT = "text",
  CODE = "code",
  QUERY = "query",
  RECOMMENDATION = "recommendation",
  INSIGHT = "insight",
  ERROR = "error",
  WARNING = "warning",
}

export interface MessageContext {
  currentView: ViewMode;
  activeWorkspace: UUID;
  relatedResources: string[];
  systemState: Record<string, JSONValue>;
  userIntent: string;
  confidence: number;
}

export interface MessageAttachment {
  id: UUID;
  type: AttachmentType;
  name: string;
  url: string;
  size: number;
  metadata: Record<string, JSONValue>;
}

export enum AttachmentType {
  DOCUMENT = "document",
  IMAGE = "image",
  CODE = "code",
  DATA = "data",
  WORKFLOW = "workflow",
  PIPELINE = "pipeline",
}

export interface MessageReaction {
  userId: UUID;
  reaction: ReactionType;
  timestamp: ISODateString;
}

export enum ReactionType {
  HELPFUL = "helpful",
  NOT_HELPFUL = "not_helpful",
  ACCURATE = "accurate",
  INACCURATE = "inaccurate",
}

/**
 * AI context for context-aware assistance
 */
export interface AIContext {
  userId: UUID;
  workspaceId?: UUID;
  currentView: ViewMode;
  activeResources: string[];
  recentActivities: ActivitySummary[];
  userPreferences: AIPreferences;
  systemState: SystemContextSnapshot;
  conversationHistory: ConversationSummary[];
  expertise: UserExpertise;
}

export interface ActivitySummary {
  type: string;
  timestamp: ISODateString;
  resource: string;
  action: string;
  context: Record<string, JSONValue>;
}

export interface AIPreferences {
  responseStyle: ResponseStyle;
  detailLevel: DetailLevel;
  languagePreference: string;
  topicInterests: string[];
  learningMode: boolean;
  proactiveAssistance: boolean;
}

export enum ResponseStyle {
  CONCISE = "concise",
  DETAILED = "detailed",
  TECHNICAL = "technical",
  BUSINESS = "business",
}

export enum DetailLevel {
  MINIMAL = "minimal",
  STANDARD = "standard",
  COMPREHENSIVE = "comprehensive",
}

export interface SystemContextSnapshot {
  systemHealth: SystemStatus;
  activeWorkflows: number;
  activePipelines: number;
  recentErrors: string[];
  performanceMetrics: PerformanceMetrics;
  timestamp: ISODateString;
}

export interface ConversationSummary {
  conversationId: UUID;
  topic: string;
  summary: string;
  keyInsights: string[];
  timestamp: ISODateString;
}

export interface UserExpertise {
  level: ExpertiseLevel;
  domains: string[];
  skills: string[];
  learningGoals: string[];
  recentAchievements: string[];
}

export enum ExpertiseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

/**
 * AI recommendation - maps to RacineAIRecommendation backend model
 */
export interface AIRecommendation {
  id: UUID;
  userId: UUID;
  conversationId?: UUID;

  // Recommendation basic information
  recommendationTitle: string;
  recommendationType: AIRecommendationType;
  description: string;
  priority: string; // low, medium, high, critical

  // Recommendation details
  detailedAnalysis: Record<string, JSONValue>;
  implementationSteps: Record<string, JSONValue>;
  expectedBenefits: Record<string, JSONValue>;
  potentialRisks: Record<string, JSONValue>;
  resourceRequirements: Record<string, JSONValue>;

  // AI analysis
  confidenceScore: number; // 0-1
  evidenceData: Record<string, JSONValue>;
  similarCases: Record<string, JSONValue>;
  successProbability?: number;

  // Impact assessment
  impactAreas: Record<string, JSONValue>;
  performanceImpact: Record<string, JSONValue>;
  costImpact: Record<string, JSONValue>;
  userImpact: Record<string, JSONValue>;
  complianceImpact: Record<string, JSONValue>;

  // Cross-group implications
  affectedGroups: Record<string, JSONValue>;
  crossGroupBenefits: Record<string, JSONValue>;
  integrationRequirements: Record<string, JSONValue>;
  coordinationNeeded: Record<string, JSONValue>;

  // Implementation tracking
  implementationStatus: string; // pending, in_progress, completed, rejected
  implementationProgress?: number; // 0-100
  implementationNotes?: string;
  actualResults?: Record<string, JSONValue>;

  // Quality and validation
  validationStatus: string; // pending, validated, disputed
  accuracyScore?: number;
  effectivenessScore?: number;
  userSatisfaction?: number;

  // Learning and feedback
  userFeedback?: string;
  outcomeTracking: Record<string, JSONValue>;
  learningPoints: Record<string, JSONValue>;
  improvementSuggestions: Record<string, JSONValue>;

  // Usage and sharing
  isPublic: boolean;
  accessLevel: string; // private, team, organization
  sharedWithGroups: Record<string, JSONValue>;
  usageCount: number;

  // Context and generation
  generationContext: Record<string, JSONValue>;
  triggeringAnalysis: Record<string, JSONValue>;
  relatedRecommendations: string[];

  // Timing
  createdAt: ISODateString;
  updatedAt: ISODateString;
  expiresAt?: ISODateString;
  implementedAt?: ISODateString;
  reviewedAt?: ISODateString;

  // Legacy compatibility
  type: RecommendationType;
  title: string; // alias for recommendationTitle
  confidence: number; // alias for confidenceScore
  category: RecommendationCategory;
  context: RecommendationContext;
  actions: RecommendationAction[];
  metrics: RecommendationMetrics;
  status: RecommendationStatus;
  feedback: RecommendationFeedback[];
}

/**
 * AI insight - maps to RacineAIInsight backend model
 */
export interface AIInsight {
  id: UUID;
  userId: UUID;
  conversationId?: UUID;
  orchestrationMasterId?: UUID;

  // Insight basic information
  insightTitle: string;
  insightType: AIInsightType;
  description: string;
  significanceLevel: string; // low, medium, high, critical

  // Insight analysis
  detailedAnalysis: Record<string, JSONValue>;
  keyFindings: Record<string, JSONValue>;
  supportingEvidence: Record<string, JSONValue>;
  statisticalData: Record<string, JSONValue>;

  // Data and methodology
  dataSources: Record<string, JSONValue>;
  analysisMethodology: Record<string, JSONValue>;
  aiModelsUsed: Record<string, JSONValue>;
  confidenceIntervals: Record<string, JSONValue>;

  // Cross-group analysis
  groupsAnalyzed: Record<string, JSONValue>;
  crossGroupPatterns: Record<string, JSONValue>;
  groupSpecificInsights: Record<string, JSONValue>;
  integrationOpportunities: Record<string, JSONValue>;

  // Predictive elements
  predictions: Record<string, JSONValue>;
  trendAnalysis: Record<string, JSONValue>;
  forecasts: Record<string, JSONValue>;
  scenarioAnalysis: Record<string, JSONValue>;

  // Impact and implications
  businessImpact: Record<string, JSONValue>;
  technicalImplications: Record<string, JSONValue>;
  operationalImpact: Record<string, JSONValue>;
  strategicImplications: Record<string, JSONValue>;

  // Actionable information
  recommendedActions: Record<string, JSONValue>;
  nextSteps: Record<string, JSONValue>;
  monitoringRequirements: Record<string, JSONValue>;
  successMetrics: Record<string, JSONValue>;

  // Quality and validation
  validationStatus: string; // pending, validated, disputed
  accuracyScore?: number;
  reliabilityScore?: number;
  peerReviewNotes: Record<string, JSONValue>;

  // Usage and sharing
  isPublic: boolean;
  accessLevel: string; // private, team, organization
  sharedWithGroups: Record<string, JSONValue>;
  usageCount: number;

  // Context and generation
  generationContext: Record<string, JSONValue>;
  triggeringAnalysis: Record<string, JSONValue>;
  relatedInsights: string[];

  // Timing
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export enum RecommendationType {
  OPTIMIZATION = "optimization",
  SECURITY = "security",
  BEST_PRACTICE = "best_practice",
  TROUBLESHOOTING = "troubleshooting",
  WORKFLOW = "workflow",
  PIPELINE = "pipeline",
  INTEGRATION = "integration",
}

export enum RecommendationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum RecommendationCategory {
  PERFORMANCE = "performance",
  SECURITY = "security",
  COMPLIANCE = "compliance",
  COST = "cost",
  QUALITY = "quality",
  MAINTENANCE = "maintenance",
}

export interface RecommendationContext {
  triggeredBy: string;
  relatedResources: string[];
  currentMetrics: Record<string, number>;
  expectedImprovement: Record<string, number>;
  implementation: ImplementationGuide;
}

export interface ImplementationGuide {
  estimatedTime: number;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  steps: ImplementationStep[];
  risks: string[];
  rollbackPlan: string[];
}

export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  estimatedTime: number;
  command?: string;
  verification?: string;
}

export interface RecommendationAction {
  id: UUID;
  type: ActionType;
  title: string;
  description: string;
  parameters: Record<string, JSONValue>;
  autoExecute: boolean;
  confirmationRequired: boolean;
}

export enum ActionType {
  EXECUTE_COMMAND = "execute_command",
  UPDATE_CONFIGURATION = "update_configuration",
  CREATE_RESOURCE = "create_resource",
  MODIFY_WORKFLOW = "modify_workflow",
  SCHEDULE_TASK = "schedule_task",
  SEND_NOTIFICATION = "send_notification",
}

export interface RecommendationMetrics {
  viewCount: number;
  implementationCount: number;
  successRate: number;
  averageRating: number;
  impactScore: number;
  roi: number;
}

export enum RecommendationStatus {
  PENDING = "pending",
  VIEWED = "viewed",
  IMPLEMENTED = "implemented",
  DISMISSED = "dismissed",
  EXPIRED = "expired",
}

export interface RecommendationFeedback {
  userId: UUID;
  rating: number;
  helpful: boolean;
  comment?: string;
  implemented: boolean;
  improvement: Record<string, number>;
  timestamp: ISODateString;
}

/**
 * AI insight - maps to RacineAIInsight backend model
 */
export interface AIInsight {
  id: UUID;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  relevance: number;
  category: InsightCategory;
  dataSource: string[];
  analysis: InsightAnalysis;
  visualizations: InsightVisualization[];
  recommendations: UUID[];
  status: InsightStatus;
  createdAt: ISODateString;
  validUntil?: ISODateString;
  viewCount: number;
  shareCount: number;
}

export enum InsightType {
  TREND = "trend",
  ANOMALY = "anomaly",
  PATTERN = "pattern",
  CORRELATION = "correlation",
  PREDICTION = "prediction",
  OPTIMIZATION = "optimization",
}

export enum InsightCategory {
  PERFORMANCE = "performance",
  USAGE = "usage",
  QUALITY = "quality",
  SECURITY = "security",
  COST = "cost",
  COMPLIANCE = "compliance",
}

export interface InsightAnalysis {
  summary: string;
  keyFindings: string[];
  methodology: string;
  dataQuality: number;
  statisticalSignificance: number;
  limitations: string[];
  nextSteps: string[];
}

export interface InsightVisualization {
  id: UUID;
  type: VisualizationType;
  title: string;
  description: string;
  data: Record<string, JSONValue>;
  configuration: Record<string, JSONValue>;
}

export enum VisualizationType {
  CHART = "chart",
  GRAPH = "graph",
  HEATMAP = "heatmap",
  TIMELINE = "timeline",
  NETWORK = "network",
  TREEMAP = "treemap",
}

export enum InsightStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  OUTDATED = "outdated",
}

// =============================================================================
// USER MANAGEMENT AND RBAC TYPES
// =============================================================================

/**
 * User context and profile
 */
export interface UserContext {
  id: UUID;
  username: string;
  email: string;
  profile: UserProfile;
  roles: Role[];
  permissions: RBACPermissions;
  preferences: UserPreferences;
  currentSession: UserSession;
  workspaces: UUID[];
  recentActivity: ActivitySummary[];
}

export interface UserProfile {
  id: UUID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  title?: string;
  department?: string;
  organization?: string;
  phone?: string;
  timezone: string;
  locale: string;
  bio?: string;
  skills: string[];
  interests: string[];
  socialLinks: SocialLink[];
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SocialLink {
  platform: string;
  url: string;
  verified: boolean;
}

export interface Role {
  id: UUID;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Permission {
  id: UUID;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, JSONValue>;
  isSystem: boolean;
  createdAt: ISODateString;
}

export interface RBACPermissions {
  groups: Record<string, GroupPermissions>;
  workspaces: Record<UUID, WorkspacePermissions>;
  resources: Record<UUID, ResourcePermissions>;
  system: SystemPermissions;
}

// ============================================================================
// COMPREHENSIVE RBAC SYSTEM TYPES
// Integration with Advanced_RBAC_Datagovernance_System SPA
// ============================================================================

export interface RBACUser {
  id: UUID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: ISODateString;
  roles?: RBACRole[];
  groups?: RBACGroup[];
  permissions?: RBACPermission[];
  profile?: UserProfile;
  preferences?: UserPreferences;
  auditInfo: AuditInfo;
  metadata?: Record<string, JSONValue>;
}

export interface RBACRole {
  id: UUID;
  name: string;
  displayName: string;
  description: string;
  permissions: RBACPermission[];
  inheritedRoles?: UUID[];
  isSystemRole: boolean;
  isActive: boolean;
  scope: "global" | "workspace" | "group";
  workspaceId?: UUID;
  groupId?: string;
  auditInfo: AuditInfo;
  metadata?: Record<string, JSONValue>;
}

export interface RBACPermission {
  id: UUID;
  name: string;
  resource: string;
  action: string;
  effect: "allow" | "deny";
  conditions?: RBACCondition[];
  scope: "global" | "workspace" | "group" | "resource";
  description?: string;
  isSystemPermission: boolean;
  auditInfo: AuditInfo;
}

export interface RBACGroup {
  id: UUID;
  name: string;
  displayName: string;
  description: string;
  type: "functional" | "organizational" | "project";
  members: RBACUser[];
  roles: RBACRole[];
  parentGroupId?: UUID;
  childGroups?: RBACGroup[];
  isActive: boolean;
  auditInfo: AuditInfo;
  metadata?: Record<string, JSONValue>;
}

export interface RBACResource {
  id: UUID;
  name: string;
  type: string;
  path: string;
  attributes: Record<string, JSONValue>;
  permissions: RBACPermission[];
  owner: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface RBACPolicy {
  id: UUID;
  name: string;
  type: "access" | "data" | "workflow" | "security";
  rules: RBACPolicyRule[];
  conditions: RBACCondition[];
  priority: number;
  isActive: boolean;
  scope: "global" | "workspace" | "group";
  workspaceId?: UUID;
  groupId?: string;
  auditInfo: AuditInfo;
}

export interface RBACPolicyRule {
  id: UUID;
  effect: "allow" | "deny";
  subjects: RBACSubject[];
  resources: string[];
  actions: string[];
  conditions?: RBACCondition[];
}

export interface RBACSubject {
  type: "user" | "role" | "group";
  id: UUID;
  name: string;
}

export interface RBACCondition {
  id: UUID;
  type: "time_based" | "location_based" | "attribute_based" | "resource_based";
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "in";
  value: JSONValue;

  // Time-based conditions
  timeRange?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  allowedDays?: number[]; // 0-6 (Sunday-Saturday)

  // Location-based conditions
  allowedLocations?: string[];
  blockedLocations?: string[];

  // Attribute-based conditions
  attributes?: Array<{
    name: string;
    value: JSONValue;
    operator: string;
  }>;

  // Resource-based conditions
  resourceConstraints?: Array<{
    type: string;
    constraint: JSONValue;
  }>;
}

export interface RBACAccessRequest {
  id: UUID;
  userId: UUID;
  requestedBy: RBACUser;
  resource: string;
  action: string;
  reason: string;
  status: "pending" | "approved" | "denied" | "expired";
  approvedBy?: UUID;
  approvalDate?: ISODateString;
  deniedBy?: UUID;
  denialReason?: string;
  expiresAt?: ISODateString;
  metadata?: Record<string, JSONValue>;
  auditInfo: AuditInfo;
}

export interface RBACAuditLog {
  id: UUID;
  userId: UUID;
  action: string;
  resource: string;
  resourceId?: UUID;
  timestamp: ISODateString;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "denied";
  details?: Record<string, JSONValue>;
  sessionId?: UUID;
}

export interface RBACConfiguration {
  workspaceId: UUID;
  policies: RBACPolicy[];
  settings: {
    enableAuditLogging: boolean;
    auditLogRetention: number; // days
    sessionTimeout: number; // minutes
    passwordPolicy: PasswordPolicy;
    mfaRequired: boolean;
    allowedIpRanges?: string[];
    customAttributes?: Record<string, JSONValue>;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  historyCount: number; // prevent reuse of last N passwords
  expirationDays?: number;
}

export interface RBACMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalGroups: number;
  totalPolicies: number;
  activeSessions: number;
  failedLoginAttempts: number;
  complianceScore: number;
  violations: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    count: number;
    description: string;
  }>;
  recommendations: string[];
  userActivityTrends?: Array<{
    date: ISODateString;
    activeUsers: number;
    loginCount: number;
    failedAttempts: number;
  }>;
  permissionUsageMetrics?: Array<{
    permission: string;
    usageCount: number;
    lastUsed: ISODateString;
  }>;
  accessPatterns?: Array<{
    userId: UUID;
    pattern: string;
    frequency: number;
    riskScore: number;
  }>;
}

export interface RBACAnalytics {
  timeframe: {
    start: ISODateString;
    end: ISODateString;
  };
  userAnalytics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    accessFrequency: Record<UUID, number>;
    riskUsers: Array<{
      userId: UUID;
      riskScore: number;
      reasons: string[];
    }>;
  };
  permissionAnalytics: {
    mostUsedPermissions: Array<{
      permission: string;
      usageCount: number;
    }>;
    unusedPermissions: string[];
    permissionTrends: Array<{
      date: ISODateString;
      usage: number;
    }>;
  };
  complianceAnalytics: {
    overallScore: number;
    violations: Array<{
      type: string;
      count: number;
      trend: "increasing" | "decreasing" | "stable";
    }>;
    auditFindings: Array<{
      finding: string;
      severity: string;
      recommendation: string;
    }>;
  };
}

export interface RBACCoordination {
  id: UUID;
  type: "cross_group" | "workspace" | "policy_sync";
  participants: string[]; // group or workspace IDs
  rules: RBACPolicy[];
  syncConfig: {
    enabled: boolean;
    syncInterval: number; // minutes
    conflictResolution: "merge" | "overwrite" | "manual";
  };
  status: "active" | "paused" | "error";
  lastSync?: ISODateString;
  auditInfo: AuditInfo;
}

export interface GroupPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
  execute: boolean;
  configure: boolean;
}

export interface SystemPermissions {
  manageUsers: boolean;
  manageRoles: boolean;
  managePermissions: boolean;
  viewSystemHealth: boolean;
  manageIntegrations: boolean;
  accessAuditLogs: boolean;
  manageBackups: boolean;
  systemConfiguration: boolean;
}

export interface UserPreferences {
  theme: ThemePreference;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  dashboard: DashboardPreferences;
  accessibility: AccessibilitySettings;
}

export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto",
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  inApp: InAppNotificationSettings;
  push: PushNotificationSettings;
  digest: DigestSettings;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  workflowUpdates: boolean;
  systemAlerts: boolean;
  collaborationUpdates: boolean;
  weeklyDigest: boolean;
  immediateAlerts: boolean;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  showBadges: boolean;
  playSound: boolean;
  autoHide: boolean;
  autoHideDelay: number;
}

export interface PushNotificationSettings {
  enabled: boolean;
  criticalOnly: boolean;
  quietHours: QuietHours;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface DigestSettings {
  enabled: boolean;
  frequency: DigestFrequency;
  time: string;
  timezone: string;
  includeMetrics: boolean;
  includeRecommendations: boolean;
}

export enum DigestFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  activityTracking: boolean;
  dataSharing: boolean;
  analyticsOptOut: boolean;
  searchableProfile: boolean;
}

export enum ProfileVisibility {
  PUBLIC = "public",
  ORGANIZATION = "organization",
  TEAM = "team",
  PRIVATE = "private",
}

export interface DashboardPreferences {
  defaultLayout: LayoutMode;
  widgetPreferences: WidgetPreference[];
  autoRefresh: boolean;
  refreshInterval: number;
  compactMode: boolean;
}

export interface WidgetPreference {
  widgetId: string;
  visible: boolean;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: Record<string, JSONValue>;
}

export interface WidgetPosition {
  x: number;
  y: number;
  z: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: FontSize;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindness: ColorBlindnessType;
}

export enum FontSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extra_large",
}

export enum ColorBlindnessType {
  NONE = "none",
  PROTANOPIA = "protanopia",
  DEUTERANOPIA = "deuteranopia",
  TRITANOPIA = "tritanopia",
}

export interface UserSession {
  id: UUID;
  userId: UUID;
  token: string;
  refreshToken: string;
  createdAt: ISODateString;
  expiresAt: ISODateString;
  lastActivity: ISODateString;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  isActive: boolean;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

// =============================================================================
// ACTIVITY AND MONITORING TYPES
// =============================================================================

/**
 * Activity record - maps to RacineActivity backend model
 */
export interface ActivityRecord {
  id: UUID;
  userId: UUID;
  workspaceId?: UUID;
  activityType: ActivityType;
  resourceType: string;
  resourceId: UUID;
  action: ActivityAction;
  description: string;
  metadata: ActivityMetadata;
  timestamp: ISODateString;
  duration?: number;
  ipAddress: string;
  userAgent: string;
  sessionId: UUID;
  correlationId?: UUID;
  parentActivityId?: UUID;
  childActivities: UUID[];
}

export enum ActivityType {
  USER_ACTION = "user_action",
  SYSTEM_EVENT = "system_event",
  WORKFLOW_EVENT = "workflow_event",
  PIPELINE_EVENT = "pipeline_event",
  INTEGRATION_EVENT = "integration_event",
  SECURITY_EVENT = "security_event",
  ERROR_EVENT = "error_event",
}

export enum ActivityAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXECUTE = "execute",
  PAUSE = "pause",
  RESUME = "resume",
  CANCEL = "cancel",
  LOGIN = "login",
  LOGOUT = "logout",
  ACCESS = "access",
  SHARE = "share",
  EXPORT = "export",
  IMPORT = "import",
}

export interface ActivityMetadata {
  source: string;
  category: string;
  severity: ActivitySeverity;
  tags: string[];
  properties: Record<string, JSONValue>;
  context: ActivityContext;
  impact: ActivityImpact;
}

export enum ActivitySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ActivityContext {
  view: ViewMode;
  feature: string;
  component: string;
  operation: string;
  parameters: Record<string, JSONValue>;
}

export interface ActivityImpact {
  scope: ImpactScope;
  affectedUsers: number;
  affectedResources: number;
  dataVolume: number;
  performanceImpact: number;
}

export enum ImpactScope {
  USER = "user",
  WORKSPACE = "workspace",
  GROUP = "group",
  SYSTEM = "system",
}

/**
 * Audit trail
 */
export interface AuditTrail {
  id: UUID;
  resourceType: string;
  resourceId: UUID;
  activities: ActivityRecord[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  retentionPolicy: RetentionPolicy;
  complianceLevel: ComplianceLevel;
}

export interface RetentionPolicy {
  retentionPeriod: number;
  archiveAfter: number;
  deleteAfter: number;
  compressionEnabled: boolean;
  encryptionRequired: boolean;
}

export enum ComplianceLevel {
  BASIC = "basic",
  STANDARD = "standard",
  ENHANCED = "enhanced",
  STRICT = "strict",
}

// =============================================================================
// DASHBOARD AND VISUALIZATION TYPES
// =============================================================================

/**
 * Dashboard state - maps to RacineDashboard backend model
 */
export interface DashboardState {
  id: UUID;
  name: string;
  description: string;
  type: DashboardType;
  workspaceId?: UUID;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  permissions: DashboardPermissions;
  settings: DashboardSettings;
  analytics: DashboardAnalytics;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastViewed: ISODateString;
  isPublic: boolean;
  tags: string[];
}

export enum DashboardType {
  PERSONAL = "personal",
  TEAM = "team",
  EXECUTIVE = "executive",
  OPERATIONAL = "operational",
  ANALYTICAL = "analytical",
  REAL_TIME = "real_time",
}

export interface DashboardLayout {
  type: LayoutType;
  columns: number;
  rows: number;
  gaps: number;
  responsive: boolean;
  breakpoints: LayoutBreakpoint[];
}

export enum LayoutType {
  GRID = "grid",
  FLEX = "flex",
  MASONRY = "masonry",
  CUSTOM = "custom",
}

export interface LayoutBreakpoint {
  breakpoint: string;
  columns: number;
  gaps: number;
}

export interface DashboardWidget {
  id: UUID;
  type: WidgetType;
  title: string;
  description: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  dataSource: WidgetDataSource;
  refreshInterval: number;
  lastUpdated: ISODateString;
  isVisible: boolean;
  permissions: WidgetPermissions;
}

export enum WidgetType {
  METRIC = "metric",
  CHART = "chart",
  TABLE = "table",
  TEXT = "text",
  IMAGE = "image",
  MAP = "map",
  GAUGE = "gauge",
  PROGRESS = "progress",
  ALERT = "alert",
  ACTIVITY_FEED = "activity_feed",
  CUSTOM = "custom",
}

export interface WidgetConfiguration {
  visualization: VisualizationConfig;
  interactions: InteractionConfig;
  styling: StylingConfig;
  behavior: BehaviorConfig;
}

export interface VisualizationConfig {
  chartType?: ChartType;
  aggregation?: AggregationType;
  groupBy?: string[];
  sortBy?: SortConfig[];
  limits?: LimitConfig;
  formatting?: FormattingConfig;
}

export enum ChartType {
  LINE = "line",
  BAR = "bar",
  PIE = "pie",
  AREA = "area",
  SCATTER = "scatter",
  HEATMAP = "heatmap",
  TREEMAP = "treemap",
  SANKEY = "sankey",
}

export enum AggregationType {
  SUM = "sum",
  COUNT = "count",
  AVERAGE = "average",
  MIN = "min",
  MAX = "max",
  MEDIAN = "median",
  PERCENTILE = "percentile",
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
  priority: number;
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export interface LimitConfig {
  maxItems: number;
  showOthers: boolean;
  otherLabel: string;
}

export interface FormattingConfig {
  numberFormat?: NumberFormat;
  dateFormat?: string;
  colorPalette?: string[];
  customColors?: Record<string, string>;
}

export interface NumberFormat {
  type: NumberFormatType;
  decimals: number;
  thousands: boolean;
  prefix?: string;
  suffix?: string;
}

export enum NumberFormatType {
  NUMBER = "number",
  CURRENCY = "currency",
  PERCENTAGE = "percentage",
  BYTES = "bytes",
  DURATION = "duration",
}

export interface InteractionConfig {
  clickAction?: ClickAction;
  hoverEnabled: boolean;
  selectionEnabled: boolean;
  zoomEnabled: boolean;
  panEnabled: boolean;
  exportEnabled: boolean;
}

export enum ClickAction {
  NONE = "none",
  DRILL_DOWN = "drill_down",
  FILTER = "filter",
  NAVIGATE = "navigate",
  CUSTOM = "custom",
}

export interface StylingConfig {
  theme: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  opacity?: number;
}

export interface BehaviorConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  loadingIndicator: boolean;
  errorHandling: ErrorDisplayMode;
  emptyStateMessage: string;
}

export enum ErrorDisplayMode {
  INLINE = "inline",
  OVERLAY = "overlay",
  NOTIFICATION = "notification",
  HIDDEN = "hidden",
}

export interface WidgetDataSource {
  type: DataSourceType;
  query: DataQuery;
  parameters: Record<string, JSONValue>;
  caching: CachingConfig;
  refreshTriggers: RefreshTrigger[];
}

export enum DataSourceType {
  API = "api",
  DATABASE = "database",
  FILE = "file",
  REAL_TIME = "real_time",
  COMPUTED = "computed",
}

export interface DataQuery {
  source: string;
  query: string;
  parameters: QueryParameter[];
  filters: QueryFilter[];
  aggregations: QueryAggregation[];
}

export interface QueryParameter {
  name: string;
  type: string;
  defaultValue?: JSONValue;
  required: boolean;
}

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: JSONValue;
  condition: FilterCondition;
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  CONTAINS = "contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IN = "in",
  NOT_IN = "not_in",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

export enum FilterCondition {
  AND = "and",
  OR = "or",
}

export interface QueryAggregation {
  field: string;
  function: AggregationType;
  alias?: string;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: CachingStrategy;
  invalidationRules: InvalidationRule[];
}

export enum CachingStrategy {
  TIME_BASED = "time_based",
  EVENT_BASED = "event_based",
  MANUAL = "manual",
}

export interface InvalidationRule {
  trigger: string;
  condition: string;
  action: InvalidationAction;
}

export enum InvalidationAction {
  REFRESH = "refresh",
  CLEAR = "clear",
  MARK_STALE = "mark_stale",
}

export interface RefreshTrigger {
  type: TriggerType;
  condition: string;
  parameters: Record<string, JSONValue>;
}

export interface WidgetPermissions {
  view: string[];
  edit: string[];
  delete: string[];
  share: string[];
}

export interface DashboardFilter {
  id: UUID;
  name: string;
  type: FilterType;
  field: string;
  operator: FilterOperator;
  values: JSONValue[];
  defaultValue?: JSONValue;
  required: boolean;
  visible: boolean;
  position: FilterPosition;
}

export enum FilterType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  SELECT = "select",
  MULTI_SELECT = "multi_select",
  RANGE = "range",
  BOOLEAN = "boolean",
}

export interface FilterPosition {
  section: FilterSection;
  order: number;
}

export enum FilterSection {
  TOP = "top",
  SIDEBAR = "sidebar",
  INLINE = "inline",
}

export interface DashboardPermissions {
  view: string[];
  edit: string[];
  delete: string[];
  share: string[];
  export: string[];
  embed: string[];
}

export interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  timezone: string;
  defaultDateRange: DateRange;
  allowExport: boolean;
  allowEmbed: boolean;
  publicAccess: boolean;
  watermark: WatermarkConfig;
}

export interface DateRange {
  type: DateRangeType;
  value: string | DateRangeValue;
}

export enum DateRangeType {
  RELATIVE = "relative",
  ABSOLUTE = "absolute",
  CUSTOM = "custom",
}

export interface DateRangeValue {
  start: ISODateString;
  end: ISODateString;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  opacity: number;
}

export enum WatermarkPosition {
  TOP_LEFT = "top_left",
  TOP_RIGHT = "top_right",
  BOTTOM_LEFT = "bottom_left",
  BOTTOM_RIGHT = "bottom_right",
  CENTER = "center",
}

export interface DashboardAnalytics {
  viewCount: number;
  uniqueViewers: number;
  averageViewDuration: number;
  mostViewedWidgets: WidgetAnalytics[];
  interactionMetrics: InteractionMetrics;
  performanceMetrics: DashboardPerformanceMetrics;
  lastAnalyticsUpdate: ISODateString;
}

export interface WidgetAnalytics {
  widgetId: UUID;
  viewCount: number;
  interactionCount: number;
  errorCount: number;
  averageLoadTime: number;
}

export interface InteractionMetrics {
  totalClicks: number;
  totalFilters: number;
  totalExports: number;
  totalShares: number;
  heatmapData: HeatmapPoint[];
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

export interface DashboardPerformanceMetrics {
  averageLoadTime: number;
  renderTime: number;
  dataLoadTime: number;
  errorRate: number;
  cacheHitRate: number;
}

// =============================================================================
// COLLABORATION TYPES
// =============================================================================

/**
 * Collaboration state - maps to RacineCollaboration backend model
 */
export interface CollaborationState {
  id: UUID;
  type: CollaborationType;
  resourceId: UUID;
  resourceType: string;
  participants: CollaborationParticipant[];
  sessions: CollaborationSession[];
  messages: CollaborationMessage[];
  activities: CollaborationActivity[];
  settings: CollaborationSettings;
  status: CollaborationStatus;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastActivity: ISODateString;
}

export enum CollaborationType {
  WORKSPACE = "workspace",
  WORKFLOW = "workflow",
  PIPELINE = "pipeline",
  DOCUMENT = "document",
  DASHBOARD = "dashboard",
  MEETING = "meeting",
}

export interface CollaborationParticipant {
  userId: UUID;
  role: CollaborationRole;
  permissions: CollaborationPermissions;
  status: ParticipantStatus;
  joinedAt: ISODateString;
  lastActivity: ISODateString;
  user: UserProfile;
}

export enum CollaborationRole {
  OWNER = "owner",
  MODERATOR = "moderator",
  CONTRIBUTOR = "contributor",
  VIEWER = "viewer",
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canInvite: boolean;
  canRemove: boolean;
  canModerate: boolean;
}

export enum ParticipantStatus {
  ONLINE = "online",
  AWAY = "away",
  BUSY = "busy",
  OFFLINE = "offline",
}

export interface CollaborationSession {
  id: UUID;
  userId: UUID;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  activities: SessionActivity[];
  cursor: CursorPosition;
  viewport: ViewportPosition;
  selections: Selection[];
}

export interface SessionActivity {
  type: string;
  timestamp: ISODateString;
  data: Record<string, JSONValue>;
}

export interface CursorPosition {
  x: number;
  y: number;
  element?: string;
}

export interface ViewportPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface Selection {
  type: string;
  start: Position;
  end: Position;
  content: string;
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface CollaborationMessage {
  id: UUID;
  senderId: UUID;
  type: CollaborationMessageType;
  content: string;
  metadata: MessageMetadata;
  timestamp: ISODateString;
  editedAt?: ISODateString;
  deletedAt?: ISODateString;
  reactions: MessageReaction[];
  replies: CollaborationMessage[];
  mentions: UUID[];
  attachments: MessageAttachment[];
}

export enum CollaborationMessageType {
  TEXT = "text",
  COMMENT = "comment",
  SUGGESTION = "suggestion",
  QUESTION = "question",
  ANNOUNCEMENT = "announcement",
  SYSTEM = "system",
}

export interface MessageMetadata {
  channel?: string;
  thread?: UUID;
  priority: MessagePriority;
  flags: string[];
  context: Record<string, JSONValue>;
}

export enum MessagePriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export interface CollaborationActivity {
  id: UUID;
  userId: UUID;
  type: CollaborationActivityType;
  description: string;
  timestamp: ISODateString;
  metadata: Record<string, JSONValue>;
}

export enum CollaborationActivityType {
  JOINED = "joined",
  LEFT = "left",
  EDITED = "edited",
  COMMENTED = "commented",
  SHARED = "shared",
  INVITED = "invited",
  REMOVED = "removed",
  PROMOTED = "promoted",
  DEMOTED = "demoted",
}

export interface CollaborationSettings {
  visibility: CollaborationVisibility;
  allowComments: boolean;
  allowSuggestions: boolean;
  allowAnonymous: boolean;
  moderationRequired: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  versionControl: boolean;
  retentionPolicy: RetentionPolicy;
}

export enum CollaborationVisibility {
  PRIVATE = "private",
  TEAM = "team",
  ORGANIZATION = "organization",
  PUBLIC = "public",
}

export enum CollaborationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  LOCKED = "locked",
}

// =============================================================================
// INTEGRATION TYPES
// =============================================================================

/**
 * Integration configuration for external systems
 */
export interface IntegrationConfiguration {
  id: UUID;
  name: string;
  description: string;
  type: IntegrationType;
  provider: string;
  configuration: IntegrationSettings;
  credentials: CredentialReference;
  endpoints: IntegrationEndpoint[];
  status: IntegrationStatus;
  lastSync: ISODateString;
  syncInterval: number;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export enum IntegrationType {
  API = "api",
  DATABASE = "database",
  FILE_SYSTEM = "file_system",
  MESSAGE_QUEUE = "message_queue",
  WEBHOOK = "webhook",
  STREAMING = "streaming",
}

export interface IntegrationSettings {
  authentication: AuthenticationConfig;
  connection: ConnectionConfig;
  mapping: MappingConfig;
  transformation: TransformationConfig;
  validation: ValidationConfig;
  errorHandling: ErrorHandlingConfig;
}

export interface AuthenticationConfig {
  type: AuthenticationType;
  parameters: Record<string, JSONValue>;
  tokenExpiry?: number;
  refreshEnabled?: boolean;
}

export enum AuthenticationType {
  API_KEY = "api_key",
  OAUTH2 = "oauth2",
  BASIC_AUTH = "basic_auth",
  JWT = "jwt",
  CERTIFICATE = "certificate",
}

export interface ConnectionConfig {
  host: string;
  port?: number;
  protocol: string;
  timeout: number;
  retryConfig: RetryConfig;
  pooling: PoolingConfig;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableStatus: number[];
}

export interface PoolingConfig {
  enabled: boolean;
  maxConnections: number;
  minConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
}

export interface MappingConfig {
  fieldMappings: FieldMapping[];
  transformations: FieldTransformation[];
  filters: MappingFilter[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: string;
  required: boolean;
  defaultValue?: JSONValue;
}

export interface FieldTransformation {
  field: string;
  type: TransformationType;
  parameters: Record<string, JSONValue>;
}

export enum TransformationType {
  FORMAT = "format",
  CALCULATE = "calculate",
  LOOKUP = "lookup",
  AGGREGATE = "aggregate",
  FILTER = "filter",
  SPLIT = "split",
  MERGE = "merge",
}

export interface MappingFilter {
  field: string;
  operator: FilterOperator;
  value: JSONValue;
}

export interface TransformationConfig {
  rules: TransformationRule[];
  validation: boolean;
  errorHandling: TransformationErrorHandling;
}

export interface TransformationRule {
  name: string;
  condition: string;
  actions: TransformationAction[];
  order: number;
}

export interface TransformationAction {
  type: TransformationType;
  parameters: Record<string, JSONValue>;
  onError: TransformationErrorAction;
}

export enum TransformationErrorAction {
  SKIP = "skip",
  DEFAULT = "default",
  FAIL = "fail",
  LOG = "log",
}

export interface TransformationErrorHandling {
  onValidationError: TransformationErrorAction;
  onTransformationError: TransformationErrorAction;
  maxErrors: number;
  logErrors: boolean;
}

export interface ValidationConfig {
  rules: ValidationRule[];
  strictMode: boolean;
  onError: ValidationErrorAction;
}

export enum ValidationErrorAction {
  REJECT = "reject",
  WARN = "warn",
  IGNORE = "ignore",
}

export interface ErrorHandlingConfig {
  retryPolicy: RetryPolicy;
  fallbackAction: FallbackAction;
  alerting: AlertingConfig;
  logging: LoggingConfig;
}

export enum FallbackAction {
  SKIP = "skip",
  DEFAULT_VALUE = "default_value",
  PREVIOUS_VALUE = "previous_value",
  FAIL = "fail",
}

export interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  channels: AlertChannel[];
}

export interface AlertThreshold {
  metric: string;
  operator: string;
  value: number;
  severity: AlertSeverity;
}

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export interface AlertChannel {
  type: string;
  configuration: Record<string, JSONValue>;
  enabled: boolean;
}

export interface LoggingConfig {
  level: LogLevel;
  destinations: LogDestination[];
  format: LogFormat;
  retention: number;
}

export interface LogDestination {
  type: string;
  configuration: Record<string, JSONValue>;
  filters: LogFilter[];
}

export interface LogFilter {
  field: string;
  operator: string;
  value: JSONValue;
}

export enum LogFormat {
  JSON = "json",
  TEXT = "text",
  STRUCTURED = "structured",
}

export interface CredentialReference {
  id: UUID;
  type: string;
  provider: string;
  encrypted: boolean;
}

export interface IntegrationEndpoint {
  id: UUID;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  parameters: Record<string, JSONValue>;
  responseMapping: MappingConfig;
  rateLimit: RateLimitConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  period: number;
  burst: number;
}

// Legacy types for backward compatibility
export interface PipelineOperation {
  id: UUID;
  name: string;
  type: string;
  parameters: Record<string, JSONValue>;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface StageInput {
  name: string;
  type: string;
  source: string;
  required: boolean;
  schema?: Record<string, JSONValue>;
}

export interface StageOutput {
  name: string;
  type: string;
  destination: string;
  schema?: Record<string, JSONValue>;
}

export interface StagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
}

export enum StageType {
  INGESTION = "ingestion",
  TRANSFORMATION = "transformation",
  VALIDATION = "validation",
  CLASSIFICATION = "classification",
  COMPLIANCE_CHECK = "compliance_check",
  CATALOGING = "cataloging",
  ANALYSIS = "analysis",
  OUTPUT = "output",
}

export interface PipelineConfiguration {
  maxConcurrentStages: number;
  globalTimeout: number;
  errorHandling: ErrorHandlingPolicy;
  monitoring: MonitoringConfiguration;
  optimization: OptimizationConfiguration;
  resources: ResourceConfiguration;
}

export interface OptimizationConfiguration {
  enabled: boolean;
  autoScaling: boolean;
  resourceOptimization: boolean;
  costOptimization: boolean;
  performanceOptimization: boolean;
  customRules: OptimizationRule[];
}

export interface OptimizationRule {
  name: string;
  type: string;
  condition: string;
  action: string;
  parameters: Record<string, JSONValue>;
}

export interface SecurityConfiguration {
  encryption: EncryptionSettings;
  authentication: AuthenticationSettings;
  authorization: AuthorizationSettings;
  audit: AuditSettings;
}

export interface EncryptionSettings {
  enabled: boolean;
  algorithm: string;
  keyRotation: boolean;
  keyRotationInterval: number;
}

export interface AuthenticationSettings {
  required: boolean;
  methods: string[];
  tokenExpiry: number;
}

export interface AuthorizationSettings {
  rbacEnabled: boolean;
  requiredPermissions: string[];
  resourceAccess: Record<string, string[]>;
}

export interface AuditSettings {
  enabled: boolean;
  logLevel: LogLevel;
  retention: number;
  destinations: string[];
}

export interface StageExecution {
  stageId: UUID;
  stageName: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  operationExecutions: OperationExecution[];
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: StageMetrics;
  logs: string[];
  errors: string[];
}

export interface OperationExecution {
  operationId: UUID;
  operationName: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: OperationMetrics;
  logs: string[];
  errors: string[];
}

export interface OperationMetrics {
  recordsProcessed: number;
  dataSize: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  diskIO: number;
}

export interface StageMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  dataProcessed: number;
  recordsProcessed: number;
  averageOperationTime: number;
  resourceUsage: ResourceUsage;
}

export interface PipelineResults {
  success: boolean;
  totalStages: number;
  successfulStages: number;
  failedStages: number;
  skippedStages: number;
  totalOperations: number;
  dataProcessed: number;
  recordsProcessed: number;
  outputArtifacts: string[];
  qualityScore: number;
  summary: string;
}

export interface PipelineMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  optimizationSavings: number;
  resourceEfficiency: number;
  costEfficiency: number;
  qualityMetrics: QualityMetrics;
  performanceMetrics: PerformanceMetrics;
}

export interface QualityMetrics {
  dataQualityScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  validityScore: number;
  uniquenessScore: number;
}

// =============================================================================
// DATA SOURCE MANAGEMENT TYPES - Complete Backend Integration
// =============================================================================

/**
 * Data Source Type Enum - matches backend DataSourceType
 */
export enum DataSourceType {
  POSTGRESQL = "postgresql",
  MYSQL = "mysql",
  MONGODB = "mongodb",
  SNOWFLAKE = "snowflake",
  S3 = "s3",
  REDIS = "redis",
  API = "api",
}

export enum DataSourceLocation {
  ON_PREM = "on_prem",
  CLOUD = "cloud",
  HYBRID = "hybrid",
}

export enum DataSourceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
  PENDING = "pending",
  SYNCING = "syncing",
  MAINTENANCE = "maintenance",
}

export enum Environment {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
  TEST = "test",
}

export enum Criticality {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum DataClassification {
  PUBLIC = "public",
  INTERNAL = "internal",
  CONFIDENTIAL = "confidential",
  RESTRICTED = "restricted",
}

export enum ScanFrequency {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export enum CloudProvider {
  AWS = "aws",
  AZURE = "azure",
  GCP = "gcp",
}

/**
 * Core Data Source Interface - maps to backend DataSource model
 */
export interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: DataSourceType;
  location: DataSourceLocation;
  status: DataSourceStatus;

  // Connection configuration
  connectionConfig: ConnectionConfig;
  credentials?: EncryptedCredentials;

  // Metadata and classification
  environment?: Environment;
  criticality?: Criticality;
  dataClassification?: DataClassification;

  // Scheduling and automation
  scanFrequency?: ScanFrequency;
  isActive: boolean;

  // Cloud configuration
  cloudProvider?: CloudProvider;
  cloudConfig?: Record<string, any>;

  // Security and compliance
  security: SecurityPolicy;
  tags: string[];

  // Timestamps and ownership
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;
  ownerId: string;
  workspaceId: string;

  // Performance and monitoring
  healthCheck?: HealthCheckConfig;
  lastScanAt?: ISODateString;
  metrics?: DataSourceMetrics;
}

/**
 * Connection Configuration
 */
export interface ConnectionConfig {
  type: DataSourceType;
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  ssl?: boolean;
  encryption?: boolean;
  timeout?: number;
  poolSize?: number;
  maxConnections?: number;
  // Cloud-specific config
  bucket?: string;
  region?: string;
  account?: string;
  provider?: string;
  baseUrl?: string;
  apiKey?: string;
  token?: string;
  authMethod?: AuthenticationMethod;
  // Additional type-specific properties
  additionalProperties?: Record<string, any>;
}

export enum AuthenticationMethod {
  USERNAME_PASSWORD = "username_password",
  API_KEY = "api_key",
  OAUTH = "oauth",
  JWT = "jwt",
  IAM = "iam",
  CERTIFICATE = "certificate",
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  details?: Record<string, any>;
}

/**
 * Connection Test Result
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  error?: string;
  latency: number;
  timestamp: number;
  details?: ConnectionDiagnostics;
  duration?: number;
}

/**
 * Connection Diagnostics
 */
export interface ConnectionDiagnostics {
  networkLatency: NetworkLatency;
  dnsResolution: DiagnosticResult;
  tlsHandshake: DiagnosticResult;
  authentication: DiagnosticResult;
  queryExecution: DiagnosticResult;
  resourceUsage: ResourceUsage;
  recommendations: string[];
}

export interface NetworkLatency {
  min: number;
  max: number;
  avg: number;
  jitter: number;
  packetLoss: number;
}

export interface DiagnosticResult {
  success: boolean;
  duration: number;
  message: string;
  details?: Record<string, any>;
}



/**
 * Data Source Health
 */
export interface DataSourceHealth {
  status: HealthStatus;
  lastCheck: number;
  latency: number;
  uptime: number;
  errorRate: number;
  message?: string;
  issues?: HealthIssue[];
  score?: number;
}

export interface HealthIssue {
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  message: string;
  suggestion?: string;
  timestamp: ISODateString;
}

/**
 * Test Configuration and Suites
 */
export interface TestConfiguration {
  timeout: number;
  retries: number;
  parallel: boolean;
  validateSsl: boolean;
  testQuery?: string;
  expectedResult?: any;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: string[];
  timeout: number;
  parallel: boolean;
}

/**
 * Security and Encryption
 */
export interface SecurityPolicy {
  encryption: boolean;
  ssl: boolean;
  accessControl: string;
  auditEnabled: boolean;
  complianceLevel: DataClassification;
  securityFeatures: string[];
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  provider: string;
  keyRotation: boolean;
  rotationInterval: number;
}

export interface EncryptedCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  encrypted: boolean;
  algorithm?: string;
  timestamp: number;
}

/**
 * Connection Pool Configuration
 */
export interface ConnectionPool {
  minSize: number;
  maxSize: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
  maxRetries: number;
  validateOnBorrow: boolean;
  validateOnReturn: boolean;
  maxWaitingClients: number;
}

/**
 * Data Source Templates
 */
export interface DataSourceTemplate {
  id: string;
  name: string;
  description: string;
  type: DataSourceType;
  category: string;
  connectionTemplate: string;
  defaultSettings: Record<string, any>;
  securityFeatures: string[];
  supportedOperations: Record<string, boolean>;
  metadata: TemplateMetadata;
}

export interface TemplateMetadata {
  createdAt: number;
  version: string;
  tags: string[];
  documentation?: string;
  examples?: Record<string, any>[];
}

/**
 * Connection Optimization and Reports
 */
export interface ConnectionOptimization {
  recommendations: OptimizationRecommendation[];
  estimatedImprovement: PerformanceMetrics;
  performanceGain: number;
  costSavings?: number;
  improvements: string[];
}

export interface OptimizationRecommendation {
  category: string;
  priority: "low" | "medium" | "high";
  description: string;
  implementation: string;
  estimatedImpact: number;
}

export interface SecurityValidation {
  sslEnabled: boolean;
  encryptionEnabled: boolean;
  authenticationValid: boolean;
  complianceLevel: string;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  score: number;
}

export interface SecurityVulnerability {
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  description: string;
  remediation: string;
  cveId?: string;
}

export interface ConnectionReport {
  timestamp: number;
  config: ConnectionConfig;
  testResult: ConnectionTestResult | null;
  diagnostics: ConnectionDiagnostics | null;
  performance: PerformanceMetrics | null;
  security: SecurityValidation | null;
  recommendations: string[];
  summary: ReportSummary;
}

export interface ReportSummary {
  overallStatus: "excellent" | "good" | "warning" | "critical";
  score: number;
  criticalIssues: number;
  warnings: number;
  suggestions: number;
}

/**
 * Diagnostic Logs
 */
export interface DiagnosticLog {
  timestamp: ISODateString;
  level: "debug" | "info" | "warn" | "error";
  category: string;
  message: string;
  details?: Record<string, any>;
  duration?: number;
  success?: boolean;
}

/**
 * Connection Health Configuration
 */
export interface ConnectionHealth {
  status: HealthStatus;
  lastCheck: number;
  latency: number;
  uptime: number;
  errorRate: number;
  message?: string;
  details?: Record<string, any>;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  healthQuery?: string;
  alertThresholds: HealthThresholds;
}

export interface HealthThresholds {
  latencyWarning: number;
  latencyCritical: number;
  errorRateWarning: number;
  errorRateCritical: number;
  uptimeWarning: number;
}

/**
 * Data Source CRUD Request/Response Types
 */
export interface DataSourceCreateRequest {
  name: string;
  description?: string;
  type: DataSourceType;
  connectionConfig: ConnectionConfig;
  environment?: Environment;
  criticality?: Criticality;
  dataClassification?: DataClassification;
  tags?: string[];
  workspaceId?: string;
  security?: Partial<SecurityPolicy>;
}

export interface DataSourceUpdateRequest {
  name?: string;
  description?: string;
  connectionConfig?: Partial<ConnectionConfig>;
  environment?: Environment;
  criticality?: Criticality;
  dataClassification?: DataClassification;
  tags?: string[];
  isActive?: boolean;
  security?: Partial<SecurityPolicy>;
}

export interface DataSourceFilters {
  type?: DataSourceType | DataSourceType[];
  status?: DataSourceStatus | DataSourceStatus[];
  environment?: Environment | Environment[];
  criticality?: Criticality | Criticality[];
  workspaceId?: string;
  tags?: string[];
  search?: string;
  owner?: string;
  createdAfter?: ISODateString;
  createdBefore?: ISODateString;
}

export interface DataSourceStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  byType: Record<DataSourceType, number>;
  byEnvironment: Record<Environment, number>;
  byCriticality: Record<Criticality, number>;
  healthScore: number;
  lastUpdated: ISODateString;
}

export interface DataSourceMetrics {
  connectionCount: number;
  avgLatency: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  dataVolume: number;
  queryCount: number;
  performanceScore: number;
  timeRange: string;
  lastUpdated: ISODateString;
  trends: MetricTrend[];
}

export interface MetricTrend {
  metric: string;
  direction: "up" | "down" | "stable";
  change: number;
  period: string;
}

// Additional metrics and monitoring types needed by components
export interface UsageStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  peakUsage: number;
  currentConnections: number;
  dataTransferred: number;
  queriesExecuted: number;
  errorRate: number;
  uptime: number;
  lastUpdated: ISODateString;
  timeRange: string;
}

export interface MetricPoint {
  timestamp: ISODateString;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TimeRange {
  start: ISODateString;
  end: ISODateString;
  interval: "1m" | "5m" | "15m" | "1h" | "6h" | "12h" | "1d" | "7d" | "30d";
  timezone?: string;
}

export enum MetricType {
  COUNTER = "counter",
  GAUGE = "gauge",
  HISTOGRAM = "histogram",
  TIMER = "timer",
  PERCENTAGE = "percentage",
  RATE = "rate",
}

export enum AggregationMethod {
  SUM = "sum",
  AVERAGE = "average",
  MIN = "min",
  MAX = "max",
  COUNT = "count",
  PERCENTILE_95 = "percentile_95",
  PERCENTILE_99 = "percentile_99",
  MEDIAN = "median",
}

export interface PerformanceReport {
  id: string;
  dataSourceId: string;
  reportType: "daily" | "weekly" | "monthly" | "custom";
  generatedAt: ISODateString;
  period: TimeRange;
  summary: PerformanceReportSummary;
  performanceMetrics: PerformanceMetrics[];
  usageStatistics: UsageStatistics;
  trends: MetricTrend[];
  alerts: MetricAlert[];
  recommendations: string[];
  chartData: ChartDataPoint[];
  comparison?: PerformanceComparison;
}

export interface PerformanceReportSummary {
  overallScore: number;
  performanceGrade: "A" | "B" | "C" | "D" | "F";
  keyMetrics: KeyMetric[];
  criticalIssues: number;
  improvements: number;
  degradations: number;
}

export interface KeyMetric {
  name: string;
  current: number;
  previous?: number;
  change?: number;
  trend: "up" | "down" | "stable";
  unit: string;
  status: "good" | "warning" | "critical";
}

export interface ChartDataPoint {
  timestamp: ISODateString;
  metrics: Record<string, number>;
  labels?: Record<string, string>;
}

export interface PerformanceComparison {
  previousPeriod: TimeRange;
  improvements: string[];
  degradations: string[];
  overallChange: number;
  significantChanges: MetricChange[];
}

export interface MetricChange {
  metric: string;
  previousValue: number;
  currentValue: number;
  changePercent: number;
  significance: "minor" | "moderate" | "major";
}

export interface MetricAlert {
  id: string;
  dataSourceId: string;
  name: string;
  description: string;
  metric: string;
  threshold: MetricThreshold;
  status: AlertStatus;
  severity: AlertLevel;
  enabled: boolean;
  notificationChannels: string[];
  triggered: boolean;
  triggeredAt?: ISODateString;
  resolvedAt?: ISODateString;
  acknowledgedAt?: ISODateString;
  acknowledgiedBy?: string;
  history: AlertHistoryEntry[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;
}

export interface MetricThreshold {
  operator:
    | "greater_than"
    | "less_than"
    | "equals"
    | "not_equals"
    | "between"
    | "outside";
  value: number | number[];
  duration?: number;
  evaluationWindow?: number;
}

export enum AlertStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  RESOLVED = "resolved",
}

export enum AlertLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export interface AlertHistoryEntry {
  timestamp: ISODateString;
  action: "triggered" | "resolved" | "acknowledged" | "escalated";
  value: number;
  message: string;
  userId?: string;
}

export enum HealthStatus {
  HEALTHY = "healthy",
  WARNING = "warning",
  CRITICAL = "critical",
  ERROR = "error",
  UNKNOWN = "unknown",
  CONNECTING = "connecting",
  DISCONNECTED = "disconnected",
  DEGRADED = "degraded",
}

export interface SecurityStatus {
  overall: HealthStatus;
  encryption: HealthStatus;
  authentication: HealthStatus;
  authorization: HealthStatus;
  compliance: HealthStatus;
  vulnerabilities: SecurityVulnerability[];
  lastSecurityScan: ISODateString;
  securityScore: number;
  complianceLevel: string;
  recommendations: SecurityRecommendation[];
  pendingUpdates: SecurityUpdate[];
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  impact: string;
  effort: "low" | "medium" | "high";
  priority: number;
}

export interface SecurityUpdate {
  id: string;
  title: string;
  type: "patch" | "configuration" | "policy";
  description: string;
  scheduledDate?: ISODateString;
  estimatedDowntime?: number;
}

export interface HealthCheck {
  id: string;
  name: string;
  type: HealthCheckType;
  status: HealthStatus;
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  endpoint?: string;
  query?: string;
  expectedResult?: any;
  lastRun: ISODateString;
  lastSuccess: ISODateString;
  lastFailure?: ISODateString;
  consecutiveFailures: number;
  responseTime: number;
  history: HealthCheckResult[];
  alertThresholds: HealthAlertThreshold[];
  notificationChannels: string[];
}

export enum HealthCheckType {
  CONNECTIVITY = "connectivity",
  QUERY = "query",
  AUTHENTICATION = "authentication",
  PERFORMANCE = "performance",
  CUSTOM = "custom",
}

export interface HealthCheckResult {
  timestamp: ISODateString;
  status: HealthStatus;
  responseTime: number;
  message?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface HealthAlertThreshold {
  metric: "response_time" | "consecutive_failures" | "error_rate";
  operator: "greater_than" | "less_than" | "equals";
  value: number;
  severity: AlertLevel;
}

export interface StatusHistory {
  dataSourceId: string;
  entries: StatusHistoryEntry[];
  retentionDays: number;
  lastUpdated: ISODateString;
}

export interface StatusHistoryEntry {
  timestamp: ISODateString;
  status: DataSourceStatus;
  healthStatus: HealthStatus;
  metrics?: PerformanceMetrics;
  events: StatusEvent[];
  triggeredBy: string;
  reason?: string;
}

export interface StatusEvent {
  type:
    | "connection"
    | "performance"
    | "security"
    | "configuration"
    | "user_action";
  description: string;
  severity: AlertLevel;
  metadata?: Record<string, any>;
}

// =============================================================================
// CLASSIFICATIONS TYPES - Complete Backend Integration
// =============================================================================

export enum ClassificationLevel {
  PUBLIC = "public",
  INTERNAL = "internal",
  CONFIDENTIAL = "confidential",
  RESTRICTED = "restricted",
  TOP_SECRET = "top_secret",
}

export enum ClassificationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
  PENDING_REVIEW = "pending_review",
  APPROVED = "approved",
}

export interface Classification {
  id: string;
  name: string;
  description?: string;
  level: ClassificationLevel;
  status: ClassificationStatus;
  rules: ClassificationRule[];
  confidence: number;
  tags: string[];
  version: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;
  ownerId: string;
  workspaceId: string;
  metrics?: ClassificationMetrics;
  history: ClassificationHistory[];
}

export interface ClassificationRule {
  id: string;
  pattern: string;
  weight: number;
  conditions: RuleCondition[];
  threshold: number;
}

export interface ClassificationTemplate {
  id: string;
  name: string;
  description: string;
  level: ClassificationLevel;
  ruleTemplates: ClassificationRule[];
  usageCount: number;
}

export interface ClassificationResult {
  id: string;
  dataSourceId: string;
  fieldName: string;
  detectedLevel: ClassificationLevel;
  confidence: number;
  appliedRules: string[];
  timestamp: ISODateString;
}

export interface ClassificationMetrics {
  totalClassifications: number;
  accuracyScore: number;
  confidenceAverage: number;
  byLevel: Record<ClassificationLevel, number>;
  timeRange: string;
  lastUpdated: ISODateString;
}

export interface ClassificationHistory {
  id: string;
  action: "created" | "updated" | "deleted" | "classified";
  previousLevel?: ClassificationLevel;
  newLevel: ClassificationLevel;
  changedBy: string;
  changedAt: ISODateString;
  reason?: string;
}

export interface ClassificationConfig {
  autoClassification: boolean;
  confidenceThreshold: number;
  reviewRequired: boolean;
  notifyOnChange: boolean;
  retentionDays: number;
}

// =============================================================================
// COMPLIANCE RULE TYPES - Complete Backend Integration
// =============================================================================

export enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PENDING = "pending",
  REVIEWING = "reviewing",
  REMEDIATED = "remediated",
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  regulation: string;
  severity: "low" | "medium" | "high" | "critical";
  status: RuleStatus;
  requirements: string[];
  conditions: RuleCondition[];
  validationLogic: string;
  complianceFramework: string;
  riskLevel: number;
  tags: string[];
  version: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  framework: string;
  rules: ComplianceRule[];
  status: ComplianceStatus;
  scope: string;
  applicability: string[];
  enforcement: "manual" | "automatic" | "hybrid";
  version: string;
  effectiveDate: ISODateString;
  expiryDate?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ComplianceReport {
  id: string;
  title: string;
  period: TimeRange;
  status: ComplianceStatus;
  overallScore: number;
  violations: ComplianceViolation[];
  remediation: ComplianceRemediation[];
  recommendations: string[];
  generatedAt: ISODateString;
  generatedBy: string;
}

export interface ComplianceAudit {
  id: string;
  auditType: "internal" | "external" | "self_assessment";
  auditor: string;
  startDate: ISODateString;
  endDate?: ISODateString;
  findings: AuditFinding[];
  status: "planning" | "in_progress" | "completed" | "follow_up";
}

export interface AuditFinding {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: string[];
  recommendation: string;
  status: "open" | "resolved" | "accepted_risk";
}

export interface ComplianceMetrics {
  overallScore: number;
  complianceRate: number;
  violationCount: number;
  byFramework: Record<string, number>;
  riskScore: number;
  trends: MetricTrend[];
  lastUpdated: ISODateString;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: ISODateString;
  status: "open" | "investigating" | "resolved" | "false_positive";
  affectedAssets: string[];
}

export interface ComplianceRemediation {
  id: string;
  violationId: string;
  action: string;
  assignedTo: string;
  dueDate: ISODateString;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  completedAt?: ISODateString;
}

export interface ComplianceHistory {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  previousStatus?: ComplianceStatus;
  newStatus: ComplianceStatus;
  changedBy: string;
  changedAt: ISODateString;
  reason?: string;
}

// =============================================================================
// SCAN RULE SETS TYPES - Complete Backend Integration
// =============================================================================

/**
 * Rule Category Enum - matches backend RuleCategory
 */
export enum RuleCategory {
  PRIVACY = "privacy",
  SECURITY = "security",
  COMPLIANCE = "compliance",
  QUALITY = "quality",
  CUSTOM = "custom",
}

export enum RuleComplexity {
  SIMPLE = "simple",
  MODERATE = "moderate",
  COMPLEX = "complex",
  ADVANCED = "advanced",
}

export enum RuleStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
  ARCHIVED = "archived",
}

/**
 * Core Scan Rule Set Interface - maps to backend ScanRuleSet model
 */
export interface ScanRuleSet {
  id: string;
  name: string;
  description?: string;
  category: RuleCategory;
  complexity: RuleComplexity;
  status: RuleStatus;

  // Rules and execution
  rules: ScanRule[];
  executionOrder: string[];
  parallelExecution: boolean;

  // Metadata and ownership
  tags: string[];
  version: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;
  ownerId: string;
  workspaceId: string;

  // Scheduling and automation
  isScheduled: boolean;
  scheduleConfig?: RuleSchedule;

  // Performance and optimization
  optimizationLevel: "basic" | "standard" | "aggressive";
  resourceLimits?: ResourceLimits;

  // Analytics and reporting
  executionHistory: RuleExecution[];
  metrics?: RuleMetrics;
  lastExecutionAt?: ISODateString;
}

/**
 * Individual Scan Rule
 */
export interface ScanRule {
  id: string;
  name: string;
  description?: string;
  category: RuleCategory;
  complexity: RuleComplexity;
  status: RuleStatus;

  // Rule definition
  pattern: string;
  conditions: RuleCondition[];
  actions: RuleAction[];

  // Execution settings
  priority: number;
  timeout: number;
  retryAttempts: number;

  // Dependencies
  dependencies: string[];
  conflictsWith: string[];

  // Validation and testing
  testCases: RuleTestCase[];
  lastValidatedAt?: ISODateString;

  // Performance
  averageExecutionTime: number;
  successRate: number;

  // Metadata
  tags: string[];
  version: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;
}

export interface RuleCondition {
  id: string;
  type: "field" | "value" | "pattern" | "custom";
  field?: string;
  operator:
    | "equals"
    | "contains"
    | "matches"
    | "greater_than"
    | "less_than"
    | "in"
    | "not_in";
  value: any;
  caseSensitive?: boolean;
  negate?: boolean;
}

export interface RuleAction {
  id: string;
  type: "flag" | "mask" | "encrypt" | "quarantine" | "alert" | "log" | "custom";
  parameters: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
  requiresApproval?: boolean;
}

export interface RuleTestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  expectedActions: string[];
  status: "pass" | "fail" | "pending";
  lastRun?: ISODateString;
}

/**
 * Rule Execution and Results
 */
export interface RuleExecution {
  id: string;
  ruleSetId: string;
  ruleId?: string;
  status: OperationStatus;

  // Execution details
  startedAt: ISODateString;
  completedAt?: ISODateString;
  duration?: number;

  // Results
  recordsProcessed: number;
  matchesFound: number;
  actionsExecuted: number;
  errorsOccurred: number;

  // Execution context
  dataSourceId: string;
  executedBy: string;
  executionMode: "manual" | "scheduled" | "triggered";

  // Results and logs
  results: RuleExecutionResult[];
  logs: ExecutionLog[];
  errors: ExecutionError[];

  // Performance metrics
  resourceUsage: ResourceUsage;
  performanceMetrics: PerformanceMetrics;
}

export interface RuleExecutionResult {
  ruleId: string;
  recordId: string;
  field?: string;
  matchedPattern?: string;
  confidence: number;
  actionsApplied: string[];
  metadata: Record<string, any>;
  timestamp: ISODateString;
}

export interface ResourceLimits {
  maxMemory: number;
  maxCpu: number;
  maxDuration: number;
  maxRecords: number;
}

/**
 * Rule Validation and Testing
 */
export interface RuleValidation {
  ruleId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  coverage: number;
  testResults: RuleTestResult[];
  validatedAt: ISODateString;
}

export interface RuleTestResult {
  testCaseId: string;
  status: "pass" | "fail" | "error";
  actualOutput?: any;
  actualActions?: string[];
  message?: string;
  duration: number;
}

/**
 * Rule Metrics and Analytics
 */
export interface RuleMetrics {
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  totalRecordsProcessed: number;
  totalMatchesFound: number;
  errorRate: number;
  resourceEfficiency: number;
  accuracyScore: number;
  timeRange: string;
  lastUpdated: ISODateString;
  trends: MetricTrend[];
}

/**
 * Rule Scheduling
 */
export interface RuleSchedule {
  id: string;
  frequency: "once" | "hourly" | "daily" | "weekly" | "monthly" | "cron";
  cronExpression?: string;
  startDate: ISODateString;
  endDate?: ISODateString;
  timezone: string;
  enabled: boolean;

  // Execution conditions
  conditions: ScheduleCondition[];

  // Notification settings
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationChannels: string[];

  // History
  lastExecution?: ISODateString;
  nextExecution?: ISODateString;
  executionHistory: ScheduleExecution[];
}

export interface ScheduleCondition {
  type: "data_available" | "resource_available" | "time_window" | "custom";
  parameters: Record<string, any>;
}

export interface ScheduleExecution {
  id: string;
  scheduledAt: ISODateString;
  executedAt?: ISODateString;
  status: OperationStatus;
  duration?: number;
  result?: string;
  error?: string;
}

/**
 * Rule History and Versioning
 */
export interface RuleHistory {
  id: string;
  ruleId: string;
  version: string;
  changeType: "created" | "updated" | "deleted" | "deployed" | "rollback";
  changes: RuleChange[];
  changedBy: string;
  changedAt: ISODateString;
  reason?: string;
  approvedBy?: string;
  approvedAt?: ISODateString;
}

export interface RuleChange {
  field: string;
  oldValue: any;
  newValue: any;
  operation: "add" | "update" | "remove";
}

/**
 * Rule Optimization
 */
export interface RuleOptimization {
  ruleId: string;
  currentPerformance: PerformanceMetrics;
  optimizedPattern?: string;
  optimizedConditions?: RuleCondition[];
  estimatedImprovement: number;
  recommendations: OptimizationRecommendation[];
  implementationComplexity: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high";
  testResults?: RuleTestResult[];
}

/**
 * Rule Templates
 */
export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  complexity: RuleComplexity;

  // Template definition
  patternTemplate: string;
  conditionTemplates: RuleConditionTemplate[];
  actionTemplates: RuleActionTemplate[];

  // Usage and popularity
  usageCount: number;
  rating: number;

  // Metadata
  tags: string[];
  version: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;

  // Customization options
  customizableFields: string[];
  requiredParameters: string[];
  optionalParameters: string[];
}

export interface RuleConditionTemplate {
  type: "field" | "value" | "pattern" | "custom";
  fieldTemplate?: string;
  operatorOptions: string[];
  valueTemplate?: string;
  description: string;
  required: boolean;
}

export interface RuleActionTemplate {
  type: "flag" | "mask" | "encrypt" | "quarantine" | "alert" | "log" | "custom";
  parameterTemplates: Record<string, ParameterTemplate>;
  severityOptions: string[];
  description: string;
  required: boolean;
}

export interface ParameterTemplate {
  type: "string" | "number" | "boolean" | "array" | "object";
  defaultValue?: any;
  options?: any[];
  validation?: string;
  description: string;
  required: boolean;
}

/**
 * Rule CRUD Request/Response Types
 */
export interface ScanRuleSetCreateRequest {
  name: string;
  description?: string;
  category: RuleCategory;
  complexity?: RuleComplexity;
  rules?: Partial<ScanRule>[];
  tags?: string[];
  workspaceId?: string;
  optimizationLevel?: "basic" | "standard" | "aggressive";
  parallelExecution?: boolean;
}

export interface ScanRuleSetUpdateRequest {
  name?: string;
  description?: string;
  category?: RuleCategory;
  complexity?: RuleComplexity;
  status?: RuleStatus;
  rules?: Partial<ScanRule>[];
  tags?: string[];
  optimizationLevel?: "basic" | "standard" | "aggressive";
  parallelExecution?: boolean;
}

export interface ScanRuleSetFilters {
  category?: RuleCategory | RuleCategory[];
  complexity?: RuleComplexity | RuleComplexity[];
  status?: RuleStatus | RuleStatus[];
  workspaceId?: string;
  tags?: string[];
  search?: string;
  owner?: string;
  createdAfter?: ISODateString;
  createdBefore?: ISODateString;
}

export interface ScanRuleSetStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  byCategory: Record<RuleCategory, number>;
  byComplexity: Record<RuleComplexity, number>;
  averageExecutionTime: number;
  successRate: number;
  lastUpdated: ISODateString;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

// Re-export all types for easy importing
export type {
  // Core system types
  SystemHealth,
  GroupHealth,
  ServiceHealth,
  SystemAlert,
  UserContext,
  WorkspaceState,
  NavigationContext,
  GroupConfiguration,
  Integration,
  SharedResource,
  CrossGroupWorkflow,
  SynchronizationStatus,

  // Workspace types
  WorkspaceConfiguration,
  WorkspaceMember,
  WorkspaceResource,
  WorkspaceSettings,
  WorkspaceAnalytics,
  WorkspaceTemplate,
  ResourceType,
  ResourceLink,
  ResourceDependency,

  // Workflow types
  WorkflowDefinition,
  WorkflowStep,
  WorkflowDependency,
  WorkflowExecution,

  // Pipeline types - Enhanced
  PipelineDefinition,
  PipelineStage,
  PipelineExecution,
  PipelineStageExecution,
  PipelineTemplate,
  PipelineOptimization,

  // Pipeline legacy types
  PipelineOperation,
  StageInput,
  StageOutput,
  StagePosition,
  PipelineConfiguration,
  OptimizationConfiguration,
  OptimizationRule,
  SecurityConfiguration,
  EncryptionSettings,
  AuthenticationSettings,
  AuthorizationSettings,
  AuditSettings,
  StageExecution,
  OperationExecution,
  OperationMetrics,
  StageMetrics,
  PipelineResults,
  PipelineMetrics,
  QualityMetrics,

  // AI types
  AIConversation,
  AIMessage,
  AIRecommendation,
  AIInsight,
  AIConversationType,
  AIRecommendationType,
  AIInsightType,
  AILearningType,

  // Activity types
  ActivityRecord,
  AuditTrail,
  ActivityFilter,
  ActivityTimeRange,

  // Dashboard types
  DashboardState,
  Widget,
  WidgetConfiguration,

  // Collaboration types
  CollaborationState,
  CollaborationSession,
  CollaborationMember,

  // Integration types
  IntegrationConfiguration,
  IntegrationEndpoint,
  ExternalSystemConfig,

  // User management types
  UserProfile,
  UserSession,
  UserPermissions,
  RolePermissions,
  GroupPermissions,
  SystemPermissions,
  UserPreferences,
  NotificationSettings,

  // Common utility types
  RetryPolicy,
  ErrorHandlingPolicy,
  MonitoringConfiguration,
  ResourceConfiguration,
  ResourceUsage,
  LogLevel,
  TriggerType,
  ExecutionLog,
  ExecutionError,

  // Data Source Management Types
  DataSource,
  DataSourceType as DataSourceTypeEnum,
  DataSourceLocation,
  DataSourceStatus,
  Environment,
  Criticality,
  DataClassification,
  ScanFrequency,
  CloudProvider,
  ConnectionConfig,
  ValidationResult,
  SecurityPolicy,
  DataSourceTemplate,
  EncryptionConfig,
  AuthenticationMethod,
  ConnectionPool,
  DataSourceMetrics,
  DataSourceHealth,
  ConnectionTestResult,
  ConnectionDiagnostics,
  TestConfiguration,
  ConnectionHealth,
  NetworkLatency,
  TestSuite,
  DiagnosticLog,
  ConnectionOptimization,
  SecurityValidation,
  ConnectionReport,
  DataSourceCreateRequest,
  DataSourceUpdateRequest,
  DataSourceFilters,
  DataSourceStats,

  // Scan Rule Sets Types
  ScanRuleSet,
  ScanRule,
  RuleCategory,
  RuleComplexity,
  RuleTemplate,
  RuleExecution,
  RuleValidation,
  RuleMetrics,
  RuleSchedule,
  RuleHistory,
  RuleOptimization,

  // Classifications Types
  Classification,
  ClassificationRule,
  ClassificationLevel,
  ClassificationTemplate,
  ClassificationResult,
  ClassificationMetrics,
  ClassificationHistory,
  ClassificationConfig,

  // Compliance Rule Types
  ComplianceRule,
  CompliancePolicy,
  ComplianceStatus,
  ComplianceReport,
  ComplianceAudit,
  ComplianceMetrics,
  ComplianceViolation,
  ComplianceRemediation,
  ComplianceHistory,

  // Advanced Catalog Types - Enhanced
  CatalogAsset,
  CatalogAssetType,
  AssetStatus,
  CatalogMetadata,
  LineageGraph,
  DataLineage,
  AssetRelationship,
  AssetMetrics,
  CatalogSearch,
  AssetClassification,
  AssetGovernance,
  CatalogConfiguration,
  AssetProfile,
  DataQuality,
  SchemaEvolution,
  AssetUsage,
  CatalogTags,
  BusinessGlossary,
  DataDictionary,
  AssetSteward,
  CatalogCreateRequest,
  CatalogUpdateRequest,
  CatalogFilters,
  CatalogStats,
  AssetDiscovery,
  SemanticSearch,

  // Scan Logic Types - Enhanced
  ScanEngine,
  ScanEngineType,
  ScanEngineStatus,
  ScanLogic,
  ScanExecution,
  ScanConfiguration,
  ScanSchedule,
  ScanResult,
  ScanMetrics,
  ScanHistory,
  ScanOptimization,
  ScanDiagnostics,
  ScanTemplate,
  ScanPattern,
  ScanPolicy,
  ScanCreateRequest,
  ScanUpdateRequest,
  ScanFilters,
  ScanStats,
  ScanPerformance,
  ScanAlert,
  ScanRecommendation,

  // RBAC System Types
  Role,
  Permission,
  User,
  UserRole,
  RolePermission,
  AccessControl,
  SecurityGroup,
  PermissionSet,
  AuthenticationProvider,
  SessionManagement,
  AuditLog,
};

// ============================================================================
// ADVANCED CATALOG TYPES
// ============================================================================

export enum CatalogAssetType {
  TABLE = "table",
  VIEW = "view",
  SCHEMA = "schema",
  DATABASE = "database",
  COLUMN = "column",
  FILE = "file",
  DATASET = "dataset",
  MODEL = "model",
  REPORT = "report",
  DASHBOARD = "dashboard",
  API = "api",
  STREAM = "stream",
  TOPIC = "topic",
  QUEUE = "queue",
}

export enum AssetStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DEPRECATED = "deprecated",
  DRAFT = "draft",
  ARCHIVED = "archived",
  PENDING = "pending",
}

export interface CatalogAsset {
  id?: string;
  name: string;
  type: CatalogAssetType;
  status: AssetStatus;
  description?: string;
  owner?: string;
  steward?: AssetSteward;
  tags?: CatalogTags[];
  metadata?: CatalogMetadata;
  schema?: any;
  location?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  lastAccessed?: string;
  version?: string;
  lineage?: DataLineage;
  quality?: DataQuality;
  usage?: AssetUsage;
  classification?: AssetClassification;
  governance?: AssetGovernance;
  profile?: AssetProfile;
  relationships?: AssetRelationship[];
  metrics?: AssetMetrics;
  businessTerms?: BusinessGlossary[];
  dataElements?: DataDictionary[];
}

export interface AssetSteward {
  userId: string;
  name: string;
  email?: string;
  role: string;
  responsibilities?: string[];
  assignedAt: string;
}

export interface CatalogTags {
  key: string;
  value: string;
  category?: string;
  source?: "user" | "system" | "imported";
  confidence?: number;
}

export interface DataLineage {
  upstream?: LineageNode[];
  downstream?: LineageNode[];
  graph?: LineageGraph;
  impact?: ImpactAnalysis;
  dependencies?: AssetDependency[];
}

export interface LineageNode {
  assetId: string;
  assetName: string;
  assetType: CatalogAssetType;
  relationship: "parent" | "child" | "sibling" | "reference";
  transformationType?: string;
  confidence?: number;
}

export interface LineageGraph {
  nodes: LineageGraphNode[];
  edges: LineageGraphEdge[];
  metadata?: any;
}

export interface LineageGraphNode {
  id: string;
  label: string;
  type: CatalogAssetType;
  properties?: Record<string, any>;
}

export interface LineageGraphEdge {
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

export interface ImpactAnalysis {
  upstreamImpact: number;
  downstreamImpact: number;
  criticalPath: string[];
  riskScore: number;
  affectedAssets: string[];
}

export interface AssetDependency {
  dependentAssetId: string;
  dependencyType: "hard" | "soft" | "reference";
  criticality: "high" | "medium" | "low";
}

export interface DataQuality {
  overallScore?: number;
  dimensions?: QualityDimension[];
  issues?: QualityIssue[];
  rules?: QualityRule[];
  history?: QualityHistory[];
}

export interface QualityDimension {
  name: string;
  score: number;
  weight: number;
  description?: string;
  measurements?: QualityMeasurement[];
}

export interface QualityMeasurement {
  metric: string;
  value: number;
  threshold: number;
  status: "pass" | "fail" | "warning";
}

export interface QualityIssue {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedRows?: number;
  affectedColumns?: string[];
  detectedAt: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface QualityRule {
  id: string;
  name: string;
  description?: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  lastRun?: string;
  status?: "pass" | "fail" | "error";
}

export interface QualityHistory {
  timestamp: string;
  score: number;
  dimensions: Record<string, number>;
  issues: number;
}

export interface AssetUsage {
  totalQueries?: number;
  uniqueUsers?: number;
  avgQueriesPerDay?: number;
  peakUsageTime?: string;
  usageTrend?: "increasing" | "decreasing" | "stable";
  topConsumers?: AssetConsumer[];
  usageByTime?: TimeSeriesData[];
}

export interface AssetConsumer {
  userId: string;
  userName?: string;
  queryCount: number;
  lastAccess: string;
  accessType: string[];
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface AssetProfile {
  summary?: string;
  sampleData?: any[];
  columnProfiles?: ColumnProfile[];
  distributionAnalysis?: DistributionAnalysis;
  anomalies?: DataAnomaly[];
  recommendations?: string[];
}

export interface ColumnProfile {
  name: string;
  dataType: string;
  nullable: boolean;
  unique: boolean;
  distinctCount?: number;
  nullCount?: number;
  minValue?: any;
  maxValue?: any;
  meanValue?: any;
  medianValue?: any;
  mode?: any;
  standardDeviation?: number;
  patterns?: string[];
  examples?: any[];
}

export interface DistributionAnalysis {
  histogram?: HistogramBin[];
  percentiles?: Record<string, number>;
  outliers?: any[];
  trends?: TrendAnalysis[];
}

export interface HistogramBin {
  range: [number, number];
  count: number;
  percentage: number;
}

export interface TrendAnalysis {
  metric: string;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
  timeRange: string;
}

export interface DataAnomaly {
  type: "outlier" | "missing" | "duplicate" | "format" | "range";
  description: string;
  severity: "low" | "medium" | "high";
  count: number;
  examples?: any[];
  suggestions?: string[];
}

export interface BusinessGlossary {
  termId: string;
  term: string;
  definition: string;
  category?: string;
  synonyms?: string[];
  relatedTerms?: string[];
  owner?: string;
  status: "draft" | "approved" | "deprecated";
}

export interface DataDictionary {
  elementId: string;
  name: string;
  dataType: string;
  description?: string;
  businessRules?: string[];
  validValues?: string[];
  format?: string;
  constraints?: string[];
}

export interface CatalogSearch {
  query: string;
  filters?: CatalogFilters;
  facets?: SearchFacet[];
  sort?: SearchSort;
  pagination?: SearchPagination;
  suggestions?: string[];
  results?: SearchResult[];
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

export interface SearchSort {
  field: string;
  order: "asc" | "desc";
}

export interface SearchPagination {
  page: number;
  size: number;
  total?: number;
}

export interface SearchResult {
  asset: CatalogAsset;
  score: number;
  highlights?: Record<string, string[]>;
  explanation?: string;
}

export interface AssetDiscovery {
  discoveredAssets?: DiscoveredAsset[];
  patterns?: DiscoveryPattern[];
  recommendations?: DiscoveryRecommendation[];
  statistics?: DiscoveryStatistics;
}

export interface DiscoveredAsset {
  source: string;
  path: string;
  type: CatalogAssetType;
  confidence: number;
  metadata?: any;
  suggestedTags?: string[];
  similarAssets?: string[];
}

export interface DiscoveryPattern {
  pattern: string;
  frequency: number;
  examples: string[];
  confidence: number;
}

export interface DiscoveryRecommendation {
  type: "tag" | "classification" | "owner" | "description";
  suggestion: string;
  confidence: number;
  reasoning: string;
}

export interface DiscoveryStatistics {
  totalAssets: number;
  newAssets: number;
  modifiedAssets: number;
  missingMetadata: number;
  qualityIssues: number;
}

export interface SemanticSearch {
  semanticQuery?: string;
  conceptualMatches?: ConceptualMatch[];
  contextualResults?: ContextualResult[];
  knowledgeGraph?: KnowledgeGraph;
}

export interface ConceptualMatch {
  concept: string;
  similarity: number;
  relatedConcepts: string[];
  assets: string[];
}

export interface ContextualResult {
  assetId: string;
  contextScore: number;
  relevanceFactors: string[];
  semanticSimilarity: number;
}

export interface KnowledgeGraph {
  entities: KnowledgeEntity[];
  relationships: KnowledgeRelationship[];
  concepts: KnowledgeConcept[];
}

export interface KnowledgeEntity {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
}

export interface KnowledgeRelationship {
  source: string;
  target: string;
  type: string;
  weight: number;
}

export interface KnowledgeConcept {
  id: string;
  name: string;
  description?: string;
  synonyms: string[];
  category: string;
}

export interface CatalogConfiguration {
  indexing?: IndexingConfig;
  discovery?: DiscoveryConfig;
  quality?: QualityConfig;
  governance?: GovernanceConfig;
  search?: SearchConfig;
  lineage?: LineageConfig;
}

export interface IndexingConfig {
  enabled: boolean;
  frequency: string;
  batchSize: number;
  parallelism: number;
  includedSources: string[];
  excludedPatterns: string[];
}

export interface DiscoveryConfig {
  autoDiscovery: boolean;
  discoveryRules: DiscoveryRule[];
  confidenceThreshold: number;
  notificationSettings: any;
}

export interface DiscoveryRule {
  id: string;
  name: string;
  pattern: string;
  action: string;
  enabled: boolean;
}

export interface QualityConfig {
  enabledRules: string[];
  thresholds: Record<string, number>;
  alerting: AlertingConfig;
  reporting: ReportingConfig;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: string[];
  severity: string[];
  frequency: string;
}

export interface ReportingConfig {
  enabled: boolean;
  schedule: string;
  recipients: string[];
  format: string[];
}

export interface GovernanceConfig {
  policies: string[];
  approvalWorkflows: WorkflowConfig[];
  certificationLevels: string[];
  lifecycleStages: string[];
}

export interface WorkflowConfig {
  id: string;
  name: string;
  steps: WorkflowStep[];
  triggers: string[];
}

export interface SearchConfig {
  indexFields: string[];
  facetFields: string[];
  boostFields: Record<string, number>;
  semanticSearch: boolean;
}

export interface LineageConfig {
  autoDetection: boolean;
  trackingLevel: "column" | "table" | "schema";
  retentionDays: number;
  computeImpact: boolean;
}

// Request/Response types
export interface CatalogCreateRequest {
  name: string;
  type: CatalogAssetType;
  description?: string;
  metadata?: CatalogMetadata;
  tags?: CatalogTags[];
  owner?: string;
  source?: string;
  location?: string;
  schema?: any;
}

export interface CatalogUpdateRequest {
  name?: string;
  description?: string;
  metadata?: Partial<CatalogMetadata>;
  tags?: CatalogTags[];
  owner?: string;
  status?: AssetStatus;
  governance?: Partial<AssetGovernance>;
}

export interface CatalogFilters {
  types?: CatalogAssetType[];
  statuses?: AssetStatus[];
  owners?: string[];
  tags?: string[];
  sources?: string[];
  dateRange?: DateRange;
  qualityScore?: NumberRange;
  usageLevel?: "high" | "medium" | "low";
}

export interface NumberRange {
  min?: number;
  max?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CatalogStats {
  totalAssets?: number;
  assetsByType?: Record<CatalogAssetType, number>;
  assetsByStatus?: Record<AssetStatus, number>;
  qualityDistribution?: QualityDistribution;
  usageStats?: UsageStatistics;
  governanceStats?: GovernanceStatistics;
  recentActivity?: ActivitySummary[];
}

export interface QualityDistribution {
  excellent: number; // 90-100
  good: number; // 70-89
  fair: number; // 50-69
  poor: number; // 0-49
}

export interface UsageStatistics {
  totalQueries: number;
  activeUsers: number;
  topAssets: AssetUsageSummary[];
  usageTrends: TrendData[];
}

export interface AssetUsageSummary {
  assetId: string;
  assetName: string;
  queryCount: number;
  userCount: number;
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
}

export interface GovernanceStatistics {
  governedAssets: number;
  ungoverned: number;
  pendingApproval: number;
  complianceRate: number;
}

export interface ActivitySummary {
  type: string;
  count: number;
  timestamp: string;
  assets: string[];
}

// ============================================================================
// SCAN LOGIC TYPES
// ============================================================================

export enum ScanEngineType {
  PATTERN_BASED = "pattern_based",
  ML_BASED = "ml_based",
  RULE_BASED = "rule_based",
  HYBRID = "hybrid",
  CUSTOM = "custom",
}

export enum ScanEngineStatus {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  STOPPED = "stopped",
  ERROR = "error",
  MAINTENANCE = "maintenance",
}

export interface ScanEngine {
  id?: string;
  name: string;
  type: ScanEngineType;
  status: ScanEngineStatus;
  version?: string;
  description?: string;
  capabilities?: string[];
  configuration?: ScanConfiguration;
  performance?: ScanPerformance;
  createdAt?: string;
  updatedAt?: string;
  lastUsed?: string;
}

export interface ScanLogic {
  id?: string;
  name: string;
  description?: string;
  engine: string;
  engineType: ScanEngineType;
  patterns?: ScanPattern[];
  policies?: ScanPolicy[];
  template?: ScanTemplate;
  configuration?: ScanConfiguration;
  schedule?: ScanSchedule;
  metrics?: ScanMetrics;
  history?: ScanHistory[];
  optimization?: ScanOptimization;
  diagnostics?: ScanDiagnostics;
  status?: ScanEngineStatus;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  tags?: string[];
}

export interface ScanPattern {
  id?: string;
  name: string;
  type: "regex" | "sql" | "semantic" | "ml" | "custom";
  pattern: string;
  description?: string;
  confidence?: number;
  sensitivity?: "low" | "medium" | "high";
  category?: string;
  examples?: string[];
  exclusions?: string[];
  metadata?: Record<string, any>;
}

export interface ScanPolicy {
  id?: string;
  name: string;
  description?: string;
  rules: ScanRule[];
  scope?: ScanScope;
  priority?: number;
  enforcement?: "strict" | "advisory" | "disabled";
  notifications?: NotificationConfig[];
  exceptions?: PolicyException[];
}

export interface ScanRule {
  id?: string;
  name: string;
  condition: string;
  action: "alert" | "block" | "log" | "quarantine";
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  parameters?: Record<string, any>;
}

export interface ScanScope {
  dataSources?: string[];
  assetTypes?: string[];
  locations?: string[];
  excludePatterns?: string[];
  includePatterns?: string[];
  maxDepth?: number;
}

export interface NotificationConfig {
  type: "email" | "webhook" | "slack" | "teams";
  recipients: string[];
  template?: string;
  conditions?: string[];
}

export interface PolicyException {
  id?: string;
  pattern: string;
  reason: string;
  approver: string;
  validUntil?: string;
  metadata?: Record<string, any>;
}

export interface ScanTemplate {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  patterns: ScanPattern[];
  policies: ScanPolicy[];
  configuration: ScanConfiguration;
  metadata?: TemplateMetadata;
}

export interface TemplateMetadata {
  author?: string;
  version?: string;
  tags?: string[];
  compliance?: string[];
  industry?: string[];
  useCase?: string;
}

export interface ScanConfiguration {
  concurrency?: number;
  timeout?: number;
  retries?: number;
  batchSize?: number;
  samplingRate?: number;
  enableCaching?: boolean;
  cacheExpiry?: number;
  enableProfiling?: boolean;
  enableLineage?: boolean;
  outputFormat?: "json" | "csv" | "xml";
  compression?: boolean;
  encryption?: boolean;
  customSettings?: Record<string, any>;
}

export interface ScanExecution {
  id?: string;
  scanLogicId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startTime?: string;
  endTime?: string;
  duration?: number;
  progress?: number;
  processedItems?: number;
  totalItems?: number;
  results?: ScanResult[];
  errors?: ScanError[];
  warnings?: ScanWarning[];
  metrics?: ExecutionMetrics;
  logs?: string[];
}

export interface ScanResult {
  id?: string;
  executionId: string;
  assetId?: string;
  assetName?: string;
  assetType?: string;
  location?: string;
  findings: Finding[];
  score?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  recommendations?: ScanRecommendation[];
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Finding {
  id?: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  pattern?: string;
  confidence: number;
  location?: FindingLocation;
  evidence?: Evidence[];
  remediation?: RemediationAction[];
}

export interface FindingLocation {
  source?: string;
  line?: number;
  column?: number;
  offset?: number;
  context?: string;
}

export interface Evidence {
  type: "sample" | "pattern" | "metadata" | "statistical";
  value: any;
  description?: string;
  confidence?: number;
}

export interface RemediationAction {
  type: "mask" | "encrypt" | "delete" | "quarantine" | "classify";
  description: string;
  automated?: boolean;
  priority?: number;
  estimatedEffort?: string;
}

export interface ScanError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  recoverable?: boolean;
}

export interface ScanWarning {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
}

export interface ExecutionMetrics {
  throughput?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  falsePositives?: number;
  falseNegatives?: number;
  processingTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface ScanMetrics {
  totalExecutions?: number;
  successfulExecutions?: number;
  failedExecutions?: number;
  averageDuration?: number;
  averageAccuracy?: number;
  totalFindings?: number;
  findingsByType?: Record<string, number>;
  findingsBySeverity?: Record<string, number>;
  trends?: MetricTrend[];
}

export interface MetricTrend {
  metric: string;
  period: string;
  value: number;
  change: number;
  trend: "increasing" | "decreasing" | "stable";
}

export interface ScanHistory {
  executionId: string;
  timestamp: string;
  status: string;
  duration: number;
  findings: number;
  errors: number;
  metrics?: ExecutionMetrics;
  summary?: string;
}

export interface ScanSchedule {
  id?: string;
  name?: string;
  cron?: string;
  frequency?: "hourly" | "daily" | "weekly" | "monthly";
  enabled?: boolean;
  nextRun?: string;
  lastRun?: string;
  timezone?: string;
  parameters?: Record<string, any>;
}

export interface ScanOptimization {
  recommendations?: OptimizationRecommendation[];
  performance?: PerformanceOptimization;
  cost?: CostOptimization;
  accuracy?: AccuracyOptimization;
}

export interface OptimizationRecommendation {
  type: "performance" | "accuracy" | "cost" | "configuration";
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  estimatedImprovement?: number;
  implementation?: string[];
}

export interface PerformanceOptimization {
  currentThroughput?: number;
  potentialThroughput?: number;
  bottlenecks?: string[];
  suggestions?: string[];
}

export interface CostOptimization {
  currentCost?: number;
  potentialSavings?: number;
  costDrivers?: string[];
  suggestions?: string[];
}

export interface AccuracyOptimization {
  currentAccuracy?: number;
  potentialAccuracy?: number;
  improvementAreas?: string[];
  suggestions?: string[];
}

export interface ScanDiagnostics {
  health?: HealthStatus;
  performance?: PerformanceStatus;
  errors?: ErrorAnalysis;
  warnings?: WarningAnalysis;
  recommendations?: DiagnosticRecommendation[];
}

export interface HealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  components?: ComponentHealth[];
  lastCheck?: string;
}

export interface ComponentHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  message?: string;
  metrics?: Record<string, number>;
}

export interface PerformanceStatus {
  throughput: number;
  latency: number;
  errorRate: number;
  resourceUtilization: ResourceUtilization;
}

export interface ResourceUtilization {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorTrends: TrendData[];
  topErrors: ErrorSummary[];
}

export interface ErrorSummary {
  error: string;
  count: number;
  lastOccurrence: string;
  impact: "low" | "medium" | "high";
}

export interface WarningAnalysis {
  totalWarnings: number;
  warningsByType: Record<string, number>;
  warningTrends: TrendData[];
  topWarnings: WarningSummary[];
}

export interface WarningSummary {
  warning: string;
  count: number;
  lastOccurrence: string;
  impact: "low" | "medium" | "high";
}

export interface DiagnosticRecommendation {
  type: "configuration" | "resource" | "pattern" | "policy";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  action: string;
  expectedOutcome?: string;
}

export interface ScanPerformance {
  throughput?: number;
  latency?: number;
  accuracy?: number;
  reliability?: number;
  scalability?: number;
  benchmarks?: PerformanceBenchmark[];
}

export interface PerformanceBenchmark {
  name: string;
  value: number;
  unit: string;
  baseline?: number;
  target?: number;
  timestamp: string;
}

export interface ScanAlert {
  id?: string;
  type: "finding" | "error" | "performance" | "system";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  source?: string;
  timestamp: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface ScanRecommendation {
  id?: string;
  type: "pattern" | "policy" | "configuration" | "optimization";
  category?: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  confidence: number;
  implementation?: ImplementationGuide;
  benefits?: string[];
  risks?: string[];
  metadata?: Record<string, any>;
}

export interface ImplementationGuide {
  steps: string[];
  estimatedTime?: string;
  requiredSkills?: string[];
  prerequisites?: string[];
  resources?: string[];
}

// Request/Response types
export interface ScanCreateRequest {
  name: string;
  description?: string;
  engineType: ScanEngineType;
  patterns?: ScanPattern[];
  policies?: ScanPolicy[];
  configuration?: ScanConfiguration;
  schedule?: ScanSchedule;
  tags?: string[];
}

export interface ScanUpdateRequest {
  name?: string;
  description?: string;
  patterns?: ScanPattern[];
  policies?: ScanPolicy[];
  configuration?: Partial<ScanConfiguration>;
  schedule?: Partial<ScanSchedule>;
  tags?: string[];
  status?: ScanEngineStatus;
}

export interface ScanFilters {
  engineTypes?: ScanEngineType[];
  statuses?: ScanEngineStatus[];
  tags?: string[];
  dateRange?: DateRange;
  performance?: NumberRange;
  accuracy?: NumberRange;
  createdBy?: string[];
}

export interface ScanStats {
  totalEngines?: number;
  enginesByType?: Record<ScanEngineType, number>;
  enginesByStatus?: Record<ScanEngineStatus, number>;
  totalExecutions?: number;
  successRate?: number;
  averageAccuracy?: number;
  totalFindings?: number;
  findingsByType?: Record<string, number>;
  performanceMetrics?: PerformanceMetrics;
  recentActivity?: ActivitySummary[];
}

// Note: All enums are already exported via their individual declarations above
