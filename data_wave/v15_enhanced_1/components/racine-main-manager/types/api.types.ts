/**
 * Racine API Types - Complete API Request/Response Type Definitions
 * ================================================================
 * 
 * This file contains comprehensive TypeScript type definitions for all API
 * requests and responses, mapping 100% to the backend API routes and ensuring
 * complete type safety for all frontend-backend communication.
 * 
 * API Categories:
 * - Orchestration API: Master system orchestration and health monitoring
 * - Workspace API: Multi-workspace management and resource linking
 * - Workflow API: Databricks-style workflow management
 * - Pipeline API: Advanced pipeline management with AI optimization
 * - AI Assistant API: Context-aware AI functionality
 * - Activity API: Activity tracking and audit trails
 * - Dashboard API: Real-time metrics and visualization
 * - Collaboration API: Team collaboration and communication
 * - Integration API: Cross-group and external system integration
 * - User Management API: RBAC and profile management
 */

import {
  UUID,
  ISODateString,
  JSONValue,
  SystemStatus,
  OperationStatus,
  IntegrationStatus,
  RacineState,
  CrossGroupState,
  SystemHealth,
  PerformanceMetrics,
  WorkspaceConfiguration,
  WorkflowDefinition,
  WorkflowExecution,
  PipelineDefinition,
  PipelineExecution,
  AIConversation,
  AIMessage,
  AIRecommendation,
  AIInsight,
  ActivityRecord,
  AuditTrail,
  DashboardState,
  CollaborationState,
  IntegrationConfiguration,
  UserProfile,
  UserSession
} from './racine-core.types';

// ============================================================================
// API TYPES FOR RACINE MAIN MANAGER
// ============================================================================

// APIError class for throwing errors
export class APIError extends Error {
  public code: string;
  public details?: any;
  public timestamp: string;
  public requestId: string;
  public statusCode: number;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
    requestId?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  query: string;
  fields?: string[];
  filters?: FilterParams;
  pagination?: PaginationParams;
}

// ============================================================================
// RBAC TYPES
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: string[];
  permissions: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: any;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  roles: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  path: string;
  permissions: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  steps: WorkflowStep[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'decision' | 'approval' | 'notification';
  status: 'pending' | 'running' | 'completed' | 'failed';
  dependencies: string[];
  config: any;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  progress: number;
  metadata: {
    startedAt: string;
    completedAt?: string;
    initiatedBy: string;
  };
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface DashboardLayout {
  type: 'grid' | 'flexible';
  columns: number;
  rows: number;
  widgets: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'custom';
  title: string;
  config: any;
  dataSource: string;
}

// ============================================================================
// PIPELINE TYPES
// ============================================================================

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  stages: PipelineStage[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'data_ingestion' | 'transformation' | 'validation' | 'output';
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: any;
  dependencies: string[];
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStage: string;
  progress: number;
  metadata: {
    startedAt: string;
    completedAt?: string;
    initiatedBy: string;
  };
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  metadata: {
    createdAt: string;
    userId: string;
  };
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  timestamp: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    updatedBy: string;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SearchResult<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkOperation {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  metadata: {
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    createdBy: string;
  };
}

// =============================================================================
// BASE API TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
  pagination?: PaginationInfo;
}

export interface ResponseMetadata {
  requestId: UUID;
  timestamp: ISODateString;
  duration: number;
  version: string;
  cached: boolean;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: ISODateString;
  retryAfter?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Standard request parameters
 */
export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterRequest {
  filters?: Record<string, JSONValue>;
  search?: string;
  dateRange?: DateRangeFilter;
}

export interface DateRangeFilter {
  start?: ISODateString;
  end?: ISODateString;
  period?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

// =============================================================================
// ORCHESTRATION API TYPES - Maps to /api/racine/orchestration
// =============================================================================

/**
 * Orchestration Master Management
 */
export interface CreateOrchestrationRequest {
  name: string;
  description?: string;
  orchestrationType: string;
  groupConfigurations: Record<string, JSONValue>;
  performanceThresholds: Record<string, number>;
  autoOptimization: boolean;
  notifications: NotificationSettings;
}

export interface UpdateOrchestrationRequest {
  name?: string;
  description?: string;
  group_configurations?: Record<string, JSONValue>;
  priority?: 'critical' | 'high' | 'medium' | 'low' | 'background';
}

export interface OrchestrationResponse {
  id: UUID;
  name: string;
  status: SystemStatus;
  connectedGroups: string[];
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
  createdAt: ISODateString;
  lastHealthCheck: ISODateString;
}

export interface BulkOperationRequest {
  operations: Array<{
    operation_type: string;
    target_group: string;
    parameters: Record<string, JSONValue>;
    priority?: 'critical' | 'high' | 'medium' | 'low';
  }>;
  execution_mode: 'sequential' | 'parallel' | 'optimized';
  timeout_seconds?: number;
  rollback_on_failure?: boolean;
}

export interface BulkOperationResponse {
  operation_id: UUID;
  status: OperationStatus;
  total_operations: number;
  completed_operations: number;
  failed_operations: number;
  results: Array<{
    operation_index: number;
    status: OperationStatus;
    result?: JSONValue;
    error?: string;
    execution_time_ms: number;
  }>;
  total_execution_time_ms: number;
  created_at: ISODateString;
  completed_at?: ISODateString;
}

export interface ServiceRegistryResponse {
  services: Array<{
    service_id: UUID;
    service_name: string;
    service_type: string;
    status: SystemStatus;
    last_heartbeat: ISODateString;
    endpoints: string[];
    health_check_url?: string;
    metrics?: Record<string, JSONValue>;
  }>;
  registry_health: SystemStatus;
  total_services: number;
  healthy_services: number;
  degraded_services: number;
  failed_services: number;
  last_updated: ISODateString;
}

export interface EmergencyShutdownRequest {
  reason: string;
  shutdown_type: 'graceful' | 'immediate' | 'maintenance';
  affected_groups?: string[];
  notification_message?: string;
  estimated_downtime_minutes?: number;
  contact_info?: string;
}

export interface CrossGroupDependencyResponse {
  orchestration_id: UUID;
  dependency_graph: {
    nodes: Array<{
      id: string;
      group: string;
      resource_type: string;
      resource_id: UUID;
      status: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
      dependency_type: string;
      strength: number;
    }>;
  };
  critical_paths: Array<{
    path: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    estimated_impact: string;
  }>;
  recommendations: Array<{
    type: string;
    description: string;
    priority: string;
    implementation_effort: string;
  }>;
  analysis_timestamp: ISODateString;
}

export interface ValidateOrchestrationRequest {
  name: string;
  orchestration_type: string;
  connected_groups: string[];
  group_configurations: Record<string, JSONValue>;
  workflow_definition?: WorkflowDefinition;
  pipeline_definition?: PipelineDefinition;
}

export interface OrchestrationValidationResponse {
  is_valid: boolean;
  validation_errors: Array<{
    error_code: string;
    error_message: string;
    severity: 'error' | 'warning' | 'info';
    field_path?: string;
    suggested_fix?: string;
  }>;
  warnings: Array<{
    warning_code: string;
    warning_message: string;
    recommendation: string;
  }>;
  estimated_resource_usage: {
    cpu_cores: number;
    memory_mb: number;
    storage_gb: number;
    network_mbps: number;
  };
  estimated_execution_time_minutes: number;
  compatibility_matrix: Record<string, boolean>;
  validation_timestamp: ISODateString;
}

export interface PerformanceInsightsResponse {
  orchestration_id: UUID;
  time_range: {
    start: ISODateString;
    end: ISODateString;
  };
  overall_health_score: number; // 0-100
  performance_metrics: {
    average_response_time_ms: number;
    throughput_per_minute: number;
    error_rate_percentage: number;
    resource_utilization: {
      cpu_percentage: number;
      memory_percentage: number;
      storage_percentage: number;
      network_percentage: number;
    };
  };
  group_performance: Array<{
    group_name: string;
    health_score: number;
    bottlenecks: Array<{
      component: string;
      severity: string;
      description: string;
    }>;
    optimization_opportunities: Array<{
      opportunity: string;
      potential_improvement: string;
      implementation_complexity: string;
    }>;
  }>;
  trends: Array<{
    metric_name: string;
    trend_direction: 'improving' | 'degrading' | 'stable';
    change_percentage: number;
    confidence_level: number;
  }>;
  ai_recommendations: Array<{
    recommendation_type: string;
    description: string;
    expected_improvement: string;
    implementation_steps: string[];
    priority_score: number;
  }>;
  analysis_timestamp: ISODateString;
}

export interface OrchestrationReportRequest {
  report_type: 'summary' | 'detailed' | 'performance' | 'security' | 'compliance';
  time_range: {
    start: ISODateString;
    end: ISODateString;
  };
  include_sections: string[];
  format: 'json' | 'pdf' | 'excel' | 'csv';
  filters?: {
    groups?: string[];
    severity_levels?: string[];
    status_types?: string[];
  };
  recipients?: Array<{
    email: string;
    role: string;
  }>;
}

export interface OrchestrationReportResponse {
  report_id: UUID;
  report_type: string;
  status: 'generating' | 'completed' | 'failed';
  download_url?: string;
  file_size_bytes?: number;
  generated_at?: ISODateString;
  expires_at?: ISODateString;
  summary: {
    total_orchestrations: number;
    active_orchestrations: number;
    total_workflows_executed: number;
    success_rate_percentage: number;
    average_execution_time_minutes: number;
  };
  sections: Array<{
    section_name: string;
    status: 'completed' | 'pending' | 'failed';
    data_points: number;
    insights: string[];
  }>;
  error_message?: string;
}

export interface SystemHealthResponse {
  overall: SystemStatus;
  groups: Record<string, GroupHealthStatus>;
  services: Record<string, ServiceHealthStatus>;
  integrations: Record<string, IntegrationHealthStatus>;
  performance: PerformanceHealthStatus;
  lastCheck: ISODateString;
  uptime: number;
  version: string;
  alerts: SystemAlert[];
}

export interface GroupHealthStatus {
  groupId: string;
  groupName: string;
  status: SystemStatus;
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastCheck: ISODateString;
  endpoints: EndpointStatus[];
  capabilities: string[];
  activeConnections: number;
  resourceUsage: ResourceUsageInfo;
}

export interface ServiceHealthStatus {
  serviceId: string;
  serviceName: string;
  status: SystemStatus;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  lastCheck: ISODateString;
  activeRequests: number;
  errorCount: number;
}

export interface IntegrationHealthStatus {
  integrationId: UUID;
  integrationName: string;
  status: IntegrationStatus;
  lastSync: ISODateString;
  syncSuccess: boolean;
  errorCount: number;
  responseTime: number;
  dataVolume: number;
  throughput: number;
}

export interface EndpointStatus {
  endpoint: string;
  status: SystemStatus;
  responseTime: number;
  statusCode: number;
  lastCheck: ISODateString;
  errorCount: number;
  successRate: number;
}

export interface PerformanceHealthStatus {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  queueDepth: number;
}

export interface ResourceUsageInfo {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
}

export interface SystemAlert {
  id: UUID;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  timestamp: ISODateString;
  acknowledged: boolean;
  resolvedAt?: ISODateString;
  metadata: Record<string, JSONValue>;
}

export enum AlertType {
  PERFORMANCE = "performance",
  AVAILABILITY = "availability",
  SECURITY = "security",
  CAPACITY = "capacity",
  INTEGRATION = "integration"
}

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

export interface NotificationSettings {
  email: boolean;
  slack: boolean;
  webhook?: string;
  thresholds: Record<string, number>;
}

/**
 * Cross-group workflow execution
 */
export interface ExecuteWorkflowRequest {
  workflowDefinition: WorkflowDefinitionInput;
  parameters: Record<string, JSONValue>;
  priority: WorkflowPriority;
  scheduledAt?: ISODateString;
  notifications: NotificationRule[];
}

export interface WorkflowDefinitionInput {
  name: string;
  description?: string;
  steps: WorkflowStepInput[];
  dependencies: WorkflowDependencyInput[];
  timeout: number;
  retryPolicy: RetryPolicyInput;
}

export interface WorkflowStepInput {
  id: UUID;
  name: string;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  timeout: number;
  retryPolicy: RetryPolicyInput;
  condition?: ConditionInput;
}

export interface WorkflowDependencyInput {
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
}

export interface RetryPolicyInput {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
}

export interface ConditionInput {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
}

export interface NotificationRule {
  type: NotificationType;
  recipients: string[];
  events: string[];
  template: string;
}

export enum WorkflowPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent"
}

export enum DependencyType {
  SEQUENCE = "sequence",
  PARALLEL = "parallel",
  CONDITIONAL = "conditional",
  LOOP = "loop"
}

export enum BackoffStrategy {
  FIXED = "fixed",
  LINEAR = "linear",
  EXPONENTIAL = "exponential"
}

export enum ConditionType {
  ALWAYS = "always",
  ON_SUCCESS = "on_success",
  ON_FAILURE = "on_failure",
  CONDITIONAL = "conditional"
}

export enum NotificationType {
  EMAIL = "email",
  SLACK = "slack",
  WEBHOOK = "webhook",
  IN_APP = "in_app"
}

export interface WorkflowExecutionResponse {
  executionId: UUID;
  workflowId: UUID;
  status: OperationStatus;
  startTime: ISODateString;
  estimatedCompletion?: ISODateString;
  progress: WorkflowProgress;
  results: WorkflowResults;
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
}

export interface WorkflowProgress {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  currentStep?: StepProgress;
  overallProgress: number;
  estimatedTimeRemaining?: number;
}

export interface StepProgress {
  stepId: UUID;
  stepName: string;
  status: OperationStatus;
  progress: number;
  startTime: ISODateString;
  estimatedCompletion?: ISODateString;
}

export interface WorkflowResults {
  success: boolean;
  outputs: Record<string, JSONValue>;
  artifacts: string[];
  summary: string;
  metrics: Record<string, number>;
}

export interface ExecutionLog {
  timestamp: ISODateString;
  level: LogLevel;
  message: string;
  stepId?: UUID;
  metadata?: Record<string, JSONValue>;
}

export interface ExecutionMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  resourceUsage: ResourceUsageMetrics;
  performance: PerformanceMetrics;
  cost: CostMetrics;
}

export interface ResourceUsageMetrics {
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

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

/**
 * Performance optimization
 */
export interface OptimizePerformanceRequest {
  targetMetrics: Record<string, number>;
  constraints: Record<string, JSONValue>;
  optimizationScope: OptimizationScope[];
  dryRun: boolean;
}

export enum OptimizationScope {
  SYSTEM_WIDE = "system_wide",
  GROUP_SPECIFIC = "group_specific",
  WORKFLOW_SPECIFIC = "workflow_specific",
  RESOURCE_ALLOCATION = "resource_allocation"
}

export interface PerformanceOptimizationResponse {
  optimizationId: UUID;
  recommendations: OptimizationRecommendation[];
  expectedImprovements: Record<string, number>;
  estimatedSavings: CostMetrics;
  implementationPlan: ImplementationPlan;
  riskAssessment: RiskAssessment;
}

export interface OptimizationRecommendation {
  id: UUID;
  type: OptimizationType;
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  category: OptimizationCategory;
  actions: OptimizationAction[];
  metrics: OptimizationMetrics;
}

export enum OptimizationType {
  RESOURCE_SCALING = "resource_scaling",
  QUERY_OPTIMIZATION = "query_optimization",
  CACHING_STRATEGY = "caching_strategy",
  LOAD_BALANCING = "load_balancing",
  WORKFLOW_REDESIGN = "workflow_redesign"
}

export enum ImpactLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum EffortLevel {
  MINIMAL = "minimal",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export enum OptimizationCategory {
  PERFORMANCE = "performance",
  COST = "cost",
  RELIABILITY = "reliability",
  SCALABILITY = "scalability"
}

export interface OptimizationAction {
  id: UUID;
  type: string;
  description: string;
  parameters: Record<string, JSONValue>;
  estimatedTime: number;
  prerequisites: string[];
  risks: string[];
}

export interface OptimizationMetrics {
  expectedImprovement: Record<string, number>;
  confidenceScore: number;
  implementationTime: number;
  rollbackTime: number;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  totalDuration: number;
  dependencies: string[];
  rollbackPlan: RollbackStep[];
}

export interface ImplementationPhase {
  phase: number;
  name: string;
  description: string;
  actions: OptimizationAction[];
  estimatedDuration: number;
  prerequisites: string[];
}

export interface RollbackStep {
  step: number;
  description: string;
  command?: string;
  estimatedTime: number;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  risks: Risk[];
  mitigations: Mitigation[];
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface Risk {
  id: UUID;
  type: RiskType;
  description: string;
  probability: number;
  impact: ImpactLevel;
  severity: RiskLevel;
  mitigations: string[];
}

export enum RiskType {
  PERFORMANCE_DEGRADATION = "performance_degradation",
  SERVICE_OUTAGE = "service_outage",
  DATA_LOSS = "data_loss",
  SECURITY_VULNERABILITY = "security_vulnerability",
  COMPATIBILITY_ISSUE = "compatibility_issue"
}

export interface Mitigation {
  id: UUID;
  riskId: UUID;
  description: string;
  effectiveness: number;
  implementationCost: number;
  recommended: boolean;
}

// =============================================================================
// WORKSPACE API TYPES - Maps to /api/racine/workspace
// =============================================================================

/**
 * Workspace Management
 */
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  type: WorkspaceType;
  templateId?: UUID;
  settings: WorkspaceSettingsInput;
  initialMembers?: WorkspaceMemberInput[];
  initialResources?: WorkspaceResourceInput[];
}

export enum WorkspaceType {
  PERSONAL = "personal",
  TEAM = "team",
  ENTERPRISE = "enterprise",
  PROJECT = "project",
  TEMPORARY = "temporary"
}

export interface WorkspaceSettingsInput {
  theme?: string;
  layout?: LayoutMode;
  defaultView?: ViewMode;
  privacy?: PrivacyLevel;
  notifications?: WorkspaceNotificationSettings;
  integrations?: WorkspaceIntegrationSettings;
  customizations?: Record<string, JSONValue>;
}

export enum LayoutMode {
  SINGLE_PANE = "single_pane",
  SPLIT_SCREEN = "split_screen",
  TABBED = "tabbed",
  GRID = "grid",
  CUSTOM = "custom"
}

export enum ViewMode {
  DASHBOARD = "dashboard",
  WORKSPACE = "workspace",
  WORKFLOWS = "workflows",
  PIPELINES = "pipelines",
  AI_ASSISTANT = "ai_assistant",
  ACTIVITY = "activity",
  COLLABORATION = "collaboration",
  SETTINGS = "settings"
}

export enum PrivacyLevel {
  PRIVATE = "private",
  TEAM = "team",
  ORGANIZATION = "organization",
  PUBLIC = "public"
}

export interface WorkspaceNotificationSettings {
  enabled: boolean;
  events: string[];
  channels: string[];
  frequency: NotificationFrequency;
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly"
}

export interface WorkspaceIntegrationSettings {
  allowedGroups: string[];
  externalIntegrations: string[];
  sharingEnabled: boolean;
  collaborationEnabled: boolean;
}

export interface WorkspaceMemberInput {
  userId: UUID;
  role: WorkspaceRole;
  permissions: string[];
}

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
  GUEST = "guest"
}

export interface WorkspaceResourceInput {
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  name: string;
  description?: string;
  metadata?: Record<string, JSONValue>;
}

export interface WorkspaceResponse {
  id: UUID;
  name: string;
  description: string;
  type: WorkspaceType;
  owner: UserProfile;
  memberCount: number;
  resourceCount: number;
  settings: WorkspaceSettings;
  analytics: WorkspaceAnalytics;
  permissions: WorkspacePermissions;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastAccessed: ISODateString;
  isActive: boolean;
  tags: string[];
}

export interface WorkspaceSettings {
  theme: string;
  layout: LayoutMode;
  defaultView: ViewMode;
  privacy: PrivacyLevel;
  notifications: WorkspaceNotificationSettings;
  integrations: WorkspaceIntegrationSettings;
  customizations: Record<string, JSONValue>;
}

export interface WorkspaceAnalytics {
  totalMembers: number;
  totalResources: number;
  activityLevel: number;
  collaborationScore: number;
  resourceUtilization: number;
  averageSessionDuration: number;
  mostActiveMembers: UserActivity[];
  mostUsedResources: ResourceUsage[];
  growthTrends: GrowthTrend[];
  lastUpdated: ISODateString;
}

export interface UserActivity {
  userId: UUID;
  username: string;
  activityCount: number;
  lastActivity: ISODateString;
  averageSessionDuration: number;
}

export interface ResourceUsage {
  resourceId: UUID;
  resourceName: string;
  resourceType: string;
  accessCount: number;
  lastAccessed: ISODateString;
  averageUsageDuration: number;
}

export interface GrowthTrend {
  metric: string;
  period: string;
  values: number[];
  trend: TrendDirection;
  changePercent: number;
}

export enum TrendDirection {
  INCREASING = "increasing",
  DECREASING = "decreasing",
  STABLE = "stable",
  VOLATILE = "volatile"
}

export interface WorkspacePermissions {
  canInvite: boolean;
  canRemoveMembers: boolean;
  canModifySettings: boolean;
  canDeleteWorkspace: boolean;
  canManageResources: boolean;
  canViewAnalytics: boolean;
  canExport: boolean;
  canShare: boolean;
}

/**
 * Workspace Resources Management
 */
export interface LinkResourceRequest {
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  permissions?: ResourcePermissionLevel[];
  metadata?: Record<string, JSONValue>;
}

export enum ResourcePermissionLevel {
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  ADMIN = "admin"
}

export interface WorkspaceResourcesResponse {
  resources: WorkspaceResourceDetails[];
  groupSummary: ResourceGroupSummary[];
  totalCount: number;
  permissions: Record<UUID, ResourcePermissionLevel[]>;
}

export interface WorkspaceResourceDetails {
  id: UUID;
  workspaceId: UUID;
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  name: string;
  description: string;
  metadata: Record<string, JSONValue>;
  permissions: ResourcePermissionLevel[];
  addedBy: UserProfile;
  addedAt: ISODateString;
  lastAccessed: ISODateString;
  accessCount: number;
  status: ResourceStatus;
  tags: string[];
}

export enum ResourceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  ERROR = "error"
}

export interface ResourceGroupSummary {
  groupId: string;
  groupName: string;
  resourceCount: number;
  lastActivity: ISODateString;
  status: SystemStatus;
}

/**
 * Workspace Analytics
 */
export interface WorkspaceAnalyticsRequest {
  workspaceId: UUID;
  timeRange: AnalyticsTimeRange;
  metrics: AnalyticsMetric[];
  groupBy?: AnalyticsGroupBy[];
  filters?: AnalyticsFilter[];
}

export interface AnalyticsTimeRange {
  start: ISODateString;
  end: ISODateString;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  MINUTE = "minute",
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month"
}

export enum AnalyticsMetric {
  USER_ACTIVITY = "user_activity",
  RESOURCE_USAGE = "resource_usage",
  COLLABORATION_EVENTS = "collaboration_events",
  PERFORMANCE_METRICS = "performance_metrics",
  ERROR_RATES = "error_rates"
}

export enum AnalyticsGroupBy {
  USER = "user",
  RESOURCE_TYPE = "resource_type",
  GROUP = "group",
  TIME_PERIOD = "time_period"
}

export interface AnalyticsFilter {
  field: string;
  operator: FilterOperator;
  value: JSONValue;
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  CONTAINS = "contains",
  IN = "in",
  NOT_IN = "not_in"
}

export interface WorkspaceAnalyticsResponse {
  summary: AnalyticsSummary;
  timeSeries: TimeSeriesData[];
  breakdowns: AnalyticsBreakdown[];
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalResources: number;
  activeResources: number;
  totalActivity: number;
  averageSessionDuration: number;
  collaborationScore: number;
  healthScore: number;
}

export interface TimeSeriesData {
  metric: AnalyticsMetric;
  data: TimeSeriesPoint[];
  trend: TrendDirection;
  changePercent: number;
}

export interface TimeSeriesPoint {
  timestamp: ISODateString;
  value: number;
  metadata?: Record<string, JSONValue>;
}

export interface AnalyticsBreakdown {
  dimension: AnalyticsGroupBy;
  data: BreakdownItem[];
  total: number;
}

export interface BreakdownItem {
  key: string;
  value: number;
  percentage: number;
  trend: TrendDirection;
  metadata?: Record<string, JSONValue>;
}

export interface AnalyticsInsight {
  id: UUID;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  relevance: number;
  actionable: boolean;
  recommendations: string[];
}

export enum InsightType {
  TREND = "trend",
  ANOMALY = "anomaly",
  PATTERN = "pattern",
  OPPORTUNITY = "opportunity",
  RISK = "risk"
}

export interface AnalyticsRecommendation {
  id: UUID;
  type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  expectedImpact: Record<string, number>;
  implementation: ImplementationGuide;
}

export enum RecommendationType {
  OPTIMIZATION = "optimization",
  ENGAGEMENT = "engagement",
  SECURITY = "security",
  COST_REDUCTION = "cost_reduction",
  PRODUCTIVITY = "productivity"
}

export enum RecommendationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface ImplementationGuide {
  estimatedTime: number;
  difficulty: DifficultyLevel;
  steps: ImplementationStep[];
  prerequisites: string[];
  risks: string[];
}

export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert"
}

export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  estimatedTime: number;
  command?: string;
  verification?: string;
}

// =============================================================================
// WORKFLOW API TYPES - Maps to /api/racine/workflows
// =============================================================================

/**
 * Workflow Management
 */
export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  workspaceId: UUID;
  templateId?: UUID;
  steps: WorkflowStepDefinition[];
  dependencies: WorkflowDependencyDefinition[];
  parameters: WorkflowParameterDefinition[];
  schedule?: WorkflowScheduleDefinition;
  configuration: WorkflowConfigurationDefinition;
  tags?: string[];
}

export interface WorkflowStepDefinition {
  id?: UUID;
  name: string;
  description?: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  inputs: StepInputDefinition[];
  outputs: StepOutputDefinition[];
  timeout: number;
  retryPolicy: RetryPolicyDefinition;
  condition?: StepConditionDefinition;
  position: StepPositionDefinition;
}

export enum StepType {
  DATA_SOURCE = "data_source",
  SCAN_RULE = "scan_rule",
  CLASSIFICATION = "classification",
  COMPLIANCE = "compliance",
  CATALOG = "catalog",
  SCAN_LOGIC = "scan_logic",
  AI_PROCESSING = "ai_processing",
  CUSTOM = "custom"
}

export interface StepInputDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
}

export interface StepOutputDefinition {
  name: string;
  type: string;
  description: string;
  schema?: Record<string, JSONValue>;
}

export interface ValidationRule {
  type: string;
  value: JSONValue;
  message: string;
}

export interface RetryPolicyDefinition {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
}

export interface StepConditionDefinition {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
}

export interface StepPositionDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkflowDependencyDefinition {
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
  parameters?: Record<string, JSONValue>;
}

export interface WorkflowParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
}

export interface WorkflowScheduleDefinition {
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
  EVENT_TRIGGERED = "event_triggered"
}

export interface WorkflowConfigurationDefinition {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicyDefinition;
  errorHandling: ErrorHandlingPolicyDefinition;
  logging: LoggingConfigurationDefinition;
  monitoring: MonitoringConfigurationDefinition;
  resources: ResourceConfigurationDefinition;
}

export interface ErrorHandlingPolicyDefinition {
  onFailure: FailureAction;
  continueOnError: boolean;
  notificationEnabled: boolean;
  logLevel: LogLevel;
}

export enum FailureAction {
  STOP = "stop",
  CONTINUE = "continue",
  RETRY = "retry",
  SKIP = "skip"
}

export interface LoggingConfigurationDefinition {
  level: LogLevel;
  includeParameters: boolean;
  includeResults: boolean;
  retention: number;
}

export interface MonitoringConfigurationDefinition {
  metricsEnabled: boolean;
  alertingEnabled: boolean;
  performanceThresholds: Record<string, number>;
  customMetrics: string[];
}

export interface ResourceConfigurationDefinition {
  cpuLimit: number;
  memoryLimit: number;
  diskSpace: number;
  networkBandwidth: number;
}

export interface WorkflowResponse {
  id: UUID;
  name: string;
  description: string;
  version: string;
  workspaceId: UUID;
  status: OperationStatus;
  steps: WorkflowStepResponse[];
  dependencies: WorkflowDependencyResponse[];
  parameters: WorkflowParameterResponse[];
  schedule?: WorkflowScheduleResponse;
  configuration: WorkflowConfigurationResponse;
  createdBy: UserProfile;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastExecution?: ISODateString;
  executionCount: number;
  successRate: number;
  averageDuration: number;
  tags: string[];
}

export interface WorkflowStepResponse {
  id: UUID;
  name: string;
  description: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  inputs: StepInputResponse[];
  outputs: StepOutputResponse[];
  dependencies: UUID[];
  timeout: number;
  retryPolicy: RetryPolicyResponse;
  condition?: StepConditionResponse;
  position: StepPositionResponse;
  status: StepStatus;
  lastExecution?: StepExecutionSummary;
}

export interface StepInputResponse {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  currentValue?: JSONValue;
}

export interface StepOutputResponse {
  name: string;
  type: string;
  description: string;
  schema?: Record<string, JSONValue>;
  lastValue?: JSONValue;
}

export interface RetryPolicyResponse {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
  currentAttempt?: number;
}

export interface StepConditionResponse {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
  lastEvaluation?: boolean;
}

export interface StepPositionResponse {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum StepStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
  CANCELLED = "cancelled"
}

export interface StepExecutionSummary {
  executionId: UUID;
  status: StepStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  successRate: number;
  errorCount: number;
}

export interface WorkflowDependencyResponse {
  id: UUID;
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
  parameters?: Record<string, JSONValue>;
  status: DependencyStatus;
}

export enum DependencyStatus {
  PENDING = "pending",
  SATISFIED = "satisfied",
  BLOCKED = "blocked",
  FAILED = "failed"
}

export interface WorkflowParameterResponse {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
  currentValue?: JSONValue;
}

export interface WorkflowScheduleResponse {
  enabled: boolean;
  type: ScheduleType;
  cronExpression?: string;
  interval?: number;
  timezone: string;
  startDate?: ISODateString;
  endDate?: ISODateString;
  maxRuns?: number;
  notifications: NotificationRule[];
  nextRun?: ISODateString;
  lastRun?: ISODateString;
  runCount: number;
}

export interface WorkflowConfigurationResponse {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicyResponse;
  errorHandling: ErrorHandlingPolicyResponse;
  logging: LoggingConfigurationResponse;
  monitoring: MonitoringConfigurationResponse;
  resources: ResourceConfigurationResponse;
}

export interface ErrorHandlingPolicyResponse {
  onFailure: FailureAction;
  continueOnError: boolean;
  notificationEnabled: boolean;
  logLevel: LogLevel;
}

export interface LoggingConfigurationResponse {
  level: LogLevel;
  includeParameters: boolean;
  includeResults: boolean;
  retention: number;
}

export interface MonitoringConfigurationResponse {
  metricsEnabled: boolean;
  alertingEnabled: boolean;
  performanceThresholds: Record<string, number>;
  customMetrics: string[];
}

export interface ResourceConfigurationResponse {
  cpuLimit: number;
  memoryLimit: number;
  diskSpace: number;
  networkBandwidth: number;
  currentUsage?: ResourceUsageInfo;
}

/**
 * Workflow Execution
 */
export interface ExecuteWorkflowRequest {
  workflowId: UUID;
  parameters?: Record<string, JSONValue>;
  priority?: WorkflowPriority;
  scheduledAt?: ISODateString;
  dryRun?: boolean;
  notifications?: NotificationRule[];
}

export interface WorkflowExecutionResponse {
  id: UUID;
  workflowId: UUID;
  workflowVersion: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  triggeredBy: UserProfile;
  triggerType: TriggerType;
  parameters: Record<string, JSONValue>;
  stepExecutions: StepExecutionDetails[];
  results: WorkflowExecutionResults;
  metrics: WorkflowExecutionMetrics;
  logs: ExecutionLog[];
  errors: ExecutionError[];
}

export enum TriggerType {
  MANUAL = "manual",
  SCHEDULED = "scheduled",
  EVENT = "event",
  API = "api"
}

export interface StepExecutionDetails {
  stepId: UUID;
  stepName: string;
  status: StepStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: StepExecutionMetrics;
  logs: string[];
  errors: string[];
  retryCount: number;
}

export interface StepExecutionMetrics {
  dataProcessed: number;
  recordsProcessed: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  diskIO: number;
}

export interface WorkflowExecutionResults {
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

export interface WorkflowExecutionMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  resourceUsage: ResourceUsageMetrics;
  performance: PerformanceMetrics;
  cost: CostMetrics;
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

/**
 * Workflow Templates
 */
export interface GetWorkflowTemplatesRequest {
  category?: TemplateCategory;
  groupId?: string;
  tags?: string[];
  complexity?: TemplateComplexity;
}

export enum TemplateCategory {
  DATA_INGESTION = "data_ingestion",
  DATA_PROCESSING = "data_processing",
  COMPLIANCE_CHECK = "compliance_check",
  CLASSIFICATION = "classification",
  MONITORING = "monitoring",
  INTEGRATION = "integration"
}

export enum TemplateComplexity {
  SIMPLE = "simple",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert"
}

export interface WorkflowTemplateResponse {
  templates: WorkflowTemplate[];
  categories: TemplateCategoryInfo[];
  totalCount: number;
}

export interface WorkflowTemplate {
  id: UUID;
  name: string;
  description: string;
  category: TemplateCategory;
  complexity: TemplateComplexity;
  groups: string[];
  tags: string[];
  definition: WorkflowDefinitionTemplate;
  metadata: TemplateMetadata;
  usage: TemplateUsage;
  rating: TemplateRating;
  createdBy: UserProfile;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface WorkflowDefinitionTemplate {
  steps: WorkflowStepTemplate[];
  dependencies: WorkflowDependencyTemplate[];
  parameters: WorkflowParameterTemplate[];
  configuration: WorkflowConfigurationTemplate;
}

export interface WorkflowStepTemplate {
  name: string;
  description: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameterTemplates: ParameterTemplate[];
  position: StepPositionDefinition;
  configurable: string[];
}

export interface ParameterTemplate {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  userConfigurable: boolean;
}

export interface WorkflowDependencyTemplate {
  sourceStepName: string;
  targetStepName: string;
  dependencyType: DependencyType;
  condition?: string;
}

export interface WorkflowParameterTemplate {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
  userConfigurable: boolean;
}

export interface WorkflowConfigurationTemplate {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicyDefinition;
  errorHandling: ErrorHandlingPolicyDefinition;
  userConfigurable: string[];
}

export interface TemplateMetadata {
  author: string;
  version: string;
  license: string;
  documentation: string;
  examples: TemplateExample[];
  requirements: TemplateRequirement[];
}

export interface TemplateExample {
  name: string;
  description: string;
  parameters: Record<string, JSONValue>;
  expectedResults: Record<string, JSONValue>;
}

export interface TemplateRequirement {
  type: RequirementType;
  description: string;
  optional: boolean;
}

export enum RequirementType {
  PERMISSION = "permission",
  RESOURCE = "resource",
  INTEGRATION = "integration",
  CONFIGURATION = "configuration"
}

export interface TemplateUsage {
  usageCount: number;
  successRate: number;
  averageDuration: number;
  popularParameters: ParameterUsage[];
  recentUsage: TemplateUsageEvent[];
}

export interface ParameterUsage {
  parameter: string;
  usagePercent: number;
  averageValue: JSONValue;
  popularValues: JSONValue[];
}

export interface TemplateUsageEvent {
  userId: UUID;
  workflowId: UUID;
  timestamp: ISODateString;
  success: boolean;
  duration: number;
}

export interface TemplateRating {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: RatingDistribution;
  reviews: TemplateReview[];
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface TemplateReview {
  userId: UUID;
  username: string;
  rating: number;
  comment: string;
  helpful: number;
  timestamp: ISODateString;
}

export interface TemplateCategoryInfo {
  category: TemplateCategory;
  name: string;
  description: string;
  templateCount: number;
  popularTags: string[];
}

// =============================================================================
// ACTIVITY API TYPES
// =============================================================================

export interface CreateActivityRequest {
  user_id: UUID;
  activity_type: string;
  description: string;
  resource_type?: string;
  resource_id?: UUID;
  group?: string;
  metadata?: Record<string, JSONValue>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActivityResponse {
  id: UUID;
  user_id: UUID;
  activity_type: string;
  description: string;
  resource_type?: string;
  resource_id?: UUID;
  group?: string;
  metadata?: Record<string, JSONValue>;
  severity: string;
  created_at: ISODateString;
  ip_address?: string;
  user_agent?: string;
}

export interface ActivityCorrelationRequest {
  correlation_type: 'cross_group_impact' | 'user_behavior_pattern' | 'resource_access_pattern' | 
                   'security_correlation' | 'performance_correlation' | 'causal_analysis' | 
                   'temporal_correlation';
  time_range: {
    start: ISODateString;
    end: ISODateString;
  };
  source_activities: UUID[];
  analysis_depth?: 'shallow' | 'medium' | 'deep';
  include_patterns?: boolean;
  confidence_threshold?: number; // 0-1
}

export interface ActivityCorrelationResponse {
  correlation_id: UUID;
  correlation_type: string;
  source_activities: UUID[];
  related_activities: UUID[];
  correlation_strength: number; // 0-1
  correlation_patterns: Array<{
    pattern_type: string;
    pattern_description: string;
    confidence: number;
    occurrences: number;
    time_periods: string[];
  }>;
  insights: Array<{
    insight_type: string;
    description: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    supporting_evidence: string[];
  }>;
  recommendations: Array<{
    recommendation_type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    implementation_steps: string[];
  }>;
  confidence_score: number; // 0-1
  created_at: ISODateString;
}

export interface ActivitySessionResponse {
  session_id: UUID;
  user_id: UUID;
  start_time: ISODateString;
  end_time?: ISODateString;
  duration_minutes?: number;
  activity_count: number;
  groups_accessed: string[];
  resources_accessed: Array<{
    resource_type: string;
    resource_id: UUID;
    access_count: number;
  }>;
  session_status: 'active' | 'completed' | 'terminated' | 'timeout';
  ip_address?: string;
  user_agent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  risk_score?: number; // 0-100
  anomalies_detected?: number;
}

export interface ActivityReportRequest {
  report_type: 'summary' | 'detailed' | 'security_audit' | 'compliance_audit' | 
               'user_activity' | 'performance_analysis' | 'cross_group_analysis';
  time_range: {
    start: ISODateString;
    end: ISODateString;
  };
  filters: {
    user_ids?: UUID[];
    groups?: string[];
    activity_types?: string[];
    severity_levels?: string[];
    resource_types?: string[];
  };
  format: 'json' | 'pdf' | 'excel' | 'csv';
  include_sections: string[];
  aggregation_level?: 'hour' | 'day' | 'week' | 'month';
  include_trends?: boolean;
  include_correlations?: boolean;
  recipients?: Array<{
    email: string;
    role: string;
  }>;
}

export interface ActivityReportResponse {
  report_id: UUID;
  report_type: string;
  status: 'generating' | 'completed' | 'failed';
  progress_percentage?: number;
  download_url?: string;
  file_size_bytes?: number;
  generated_at?: ISODateString;
  expires_at?: ISODateString;
  summary: {
    total_activities: number;
    unique_users: number;
    groups_covered: number;
    time_span_days: number;
    top_activity_types: Array<{
      activity_type: string;
      count: number;
      percentage: number;
    }>;
  };
  error_message?: string;
}

export interface AdvancedActivitySearchRequest {
  query?: string;
  filters?: {
    user_ids?: UUID[];
    activity_types?: string[];
    groups?: string[];
    severity_levels?: string[];
    resource_types?: string[];
    has_anomalies?: boolean;
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
  };
  date_range?: {
    start: ISODateString;
    end: ISODateString;
  };
  sort?: {
    field: 'created_at' | 'user_id' | 'activity_type' | 'severity' | 'risk_score';
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  include_correlations?: boolean;
  include_patterns?: boolean;
}

export interface ActivitySystemHealthResponse {
  overall_status: SystemStatus;
  components: {
    activity_ingestion: {
      status: SystemStatus;
      throughput_per_minute: number;
      queue_depth: number;
      processing_latency_ms: number;
    };
    correlation_engine: {
      status: SystemStatus;
      active_analyses: number;
      average_processing_time_minutes: number;
    };
    storage_backend: {
      status: SystemStatus;
      storage_used_gb: number;
      storage_capacity_gb: number;
      read_latency_ms: number;
      write_latency_ms: number;
    };
    streaming_pipeline: {
      status: SystemStatus;
      active_connections: number;
      events_per_second: number;
    };
  };
  performance_metrics: {
    activities_processed_last_hour: number;
    correlations_completed_last_hour: number;
    average_response_time_ms: number;
    error_rate_percentage: number;
  };
  resource_utilization: {
    cpu_percentage: number;
    memory_percentage: number;
    disk_percentage: number;
    network_mbps: number;
  };
  alerts: Array<{
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: ISODateString;
  }>;
  last_updated: ISODateString;
}

export interface ActivitySystemStatsResponse {
  statistics_period: {
    start: ISODateString;
    end: ISODateString;
  };
  activity_statistics: {
    total_activities: number;
    activities_by_type: Record<string, number>;
    activities_by_group: Record<string, number>;
    activities_by_hour: Array<{
      hour: string;
      count: number;
    }>;
    top_users: Array<{
      user_id: UUID;
      username: string;
      activity_count: number;
    }>;
  };
  session_statistics: {
    total_sessions: number;
    active_sessions: number;
    average_session_duration_minutes: number;
    sessions_by_hour: Array<{
      hour: string;
      count: number;
    }>;
  };
  correlation_statistics: {
    total_correlations_analyzed: number;
    significant_patterns_found: number;
    average_correlation_strength: number;
    top_correlation_types: Array<{
      type: string;
      count: number;
    }>;
  };
  security_statistics: {
    anomalies_detected: number;
    security_incidents: number;
    risk_score_distribution: Record<string, number>;
    failed_access_attempts: number;
  };
  performance_statistics: {
    average_processing_time_ms: number;
    peak_throughput_per_minute: number;
    data_retention_days: number;
    storage_growth_rate_gb_per_day: number;
  };
  trends: Array<{
    metric_name: string;
    trend_direction: 'increasing' | 'decreasing' | 'stable';
    change_percentage: number;
    period_comparison: string;
  }>;
}

// =============================================================================
// INTEGRATION API TYPES
// =============================================================================

export interface CreateIntegrationEndpointRequest {
  endpoint_name: string;
  endpoint_type: 'rest_api' | 'webhook' | 'database' | 'message_queue' | 'file_system';
  endpoint_url: string;
  authentication_type: 'none' | 'api_key' | 'oauth2' | 'basic_auth' | 'custom';
  authentication_config?: Record<string, JSONValue>;
  connection_config: Record<string, JSONValue>;
  timeout_seconds?: number;
  retry_config?: {
    max_retries: number;
    retry_delay_ms: number;
    backoff_multiplier: number;
  };
  health_check_config?: {
    enabled: boolean;
    interval_seconds: number;
    timeout_seconds: number;
    endpoint_path?: string;
  };
  tags?: string[];
  description?: string;
}

export interface IntegrationEndpointResponse {
  id: UUID;
  endpoint_name: string;
  endpoint_type: string;
  endpoint_url: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  last_test_result?: {
    success: boolean;
    response_time_ms: number;
    tested_at: ISODateString;
    error_message?: string;
  };
  health_status: {
    is_healthy: boolean;
    last_check: ISODateString;
    consecutive_failures: number;
    average_response_time_ms?: number;
  };
  usage_statistics: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    average_response_time_ms: number;
    last_used: ISODateString;
  };
  created_at: ISODateString;
  updated_at: ISODateString;
  created_by: UUID;
}

export interface IntegrationTestResult {
  test_id: UUID;
  endpoint_id: UUID;
  test_status: 'success' | 'failure' | 'timeout' | 'error';
  response_time_ms: number;
  status_code?: number;
  response_data?: Record<string, JSONValue>;
  error_message?: string;
  test_details: {
    request_sent: Record<string, JSONValue>;
    response_received?: Record<string, JSONValue>;
    network_info?: {
      dns_resolution_time_ms: number;
      connection_time_ms: number;
      ssl_handshake_time_ms?: number;
    };
  };
  tested_at: ISODateString;
  tested_by: UUID;
}

export interface ServiceRegistrationRequest {
  service_name: string;
  service_type: 'microservice' | 'database' | 'message_queue' | 'cache' | 'external_api' | 'data_processor';
  description?: string;
  version: string;
  endpoints: string[];
  health_check_url?: string;
  metadata?: Record<string, JSONValue>;
  tags?: string[];
  auto_heartbeat?: boolean;
  heartbeat_interval_seconds?: number;
}

export interface ServiceRegistryResponse {
  id: UUID;
  service_name: string;
  service_type: string;
  description?: string;
  version: string;
  endpoints: string[];
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  health_check_url?: string;
  last_heartbeat?: ISODateString;
  heartbeat_interval_seconds?: number;
  registration_time: ISODateString;
  uptime_percentage: number;
  metadata?: Record<string, JSONValue>;
  tags?: string[];
  registered_by: UUID;
}

export interface CreateIntegrationJobRequest {
  job_name: string;
  job_type: 'sync' | 'migration' | 'validation' | 'cleanup' | 'monitoring';
  description?: string;
  source_config: {
    group: string;
    resource_type: string;
    filters?: Record<string, JSONValue>;
  };
  target_config: {
    group: string;
    resource_type: string;
    mapping_rules?: Record<string, JSONValue>;
  };
  schedule?: {
    type: 'once' | 'recurring';
    cron_expression?: string;
    start_time?: ISODateString;
    end_time?: ISODateString;
  };
  execution_config: {
    timeout_seconds: number;
    retry_policy: {
      max_retries: number;
      retry_delay_ms: number;
    };
    parallelism?: number;
    batch_size?: number;
  };
  notification_config?: {
    on_success: boolean;
    on_failure: boolean;
    recipients: string[];
  };
}

export interface IntegrationJobResponse {
  id: UUID;
  job_name: string;
  job_type: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  progress?: {
    total_items: number;
    processed_items: number;
    failed_items: number;
    current_step: string;
    percentage: number;
  };
  execution_history: Array<{
    execution_id: UUID;
    started_at: ISODateString;
    completed_at?: ISODateString;
    status: string;
    result_summary?: Record<string, JSONValue>;
    error_message?: string;
  }>;
  next_execution?: ISODateString;
  created_at: ISODateString;
  updated_at: ISODateString;
  created_by: UUID;
}

export interface IntegrationJobExecutionResponse {
  execution_id: UUID;
  job_id: UUID;
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: ISODateString;
  estimated_completion?: ISODateString;
  progress: {
    total_items: number;
    processed_items: number;
    failed_items: number;
    current_step: string;
    percentage: number;
  };
  logs_url?: string;
  result_preview?: Record<string, JSONValue>;
}

export interface StartSyncRequest {
  source_group: string;
  target_group: string;
  sync_type: 'full' | 'incremental' | 'selective';
  resource_types?: string[];
  filters?: Record<string, JSONValue>;
  conflict_resolution?: 'source_wins' | 'target_wins' | 'latest_wins' | 'manual';
  validation_rules?: Record<string, JSONValue>;
  notification_config?: {
    on_completion: boolean;
    on_error: boolean;
    recipients: string[];
  };
  schedule?: {
    start_immediately: boolean;
    start_time?: ISODateString;
  };
}

export interface SyncJobResponse {
  sync_id: UUID;
  source_group: string;
  target_group: string;
  sync_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  progress: {
    total_resources: number;
    synced_resources: number;
    failed_resources: number;
    skipped_resources: number;
    current_resource_type: string;
    percentage: number;
  };
  sync_statistics: {
    resources_created: number;
    resources_updated: number;
    resources_deleted: number;
    conflicts_detected: number;
    conflicts_resolved: number;
  };
  started_at: ISODateString;
  completed_at?: ISODateString;
  estimated_completion?: ISODateString;
  error_details?: Array<{
    resource_type: string;
    resource_id: UUID;
    error_message: string;
    error_code: string;
  }>;
  created_by: UUID;
}

export interface IntegrationSystemHealthResponse {
  overall_status: SystemStatus;
  components: {
    endpoints: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
      average_response_time_ms: number;
    };
    services: {
      total: number;
      registered: number;
      active: number;
      inactive: number;
      last_heartbeat_within_threshold: number;
    };
    sync_operations: {
      active_syncs: number;
      failed_syncs_last_24h: number;
      average_sync_duration_minutes: number;
      success_rate_percentage: number;
    };
    integration_jobs: {
      total_jobs: number;
      running_jobs: number;
      failed_jobs_last_24h: number;
      queue_depth: number;
    };
  };
  performance_metrics: {
    throughput_per_minute: number;
    error_rate_percentage: number;
    average_processing_time_ms: number;
    resource_utilization: {
      cpu_percentage: number;
      memory_percentage: number;
      network_mbps: number;
    };
  };
  alerts: Array<{
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    component: string;
    timestamp: ISODateString;
  }>;
  last_updated: ISODateString;
}

export interface IntegrationPerformanceAnalyticsResponse {
  time_period: {
    start: ISODateString;
    end: ISODateString;
  };
  endpoint_analytics: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    average_response_time_ms: number;
    p95_response_time_ms: number;
    throughput_per_minute: number;
    error_rate_percentage: number;
    slowest_endpoints: Array<{
      endpoint_id: UUID;
      endpoint_name: string;
      average_response_time_ms: number;
      request_count: number;
    }>;
  };
  sync_analytics: {
    total_syncs: number;
    successful_syncs: number;
    failed_syncs: number;
    average_sync_duration_minutes: number;
    total_resources_synced: number;
    sync_success_rate_percentage: number;
    most_active_groups: Array<{
      group: string;
      sync_count: number;
      success_rate: number;
    }>;
  };
  resource_utilization: {
    peak_cpu_percentage: number;
    peak_memory_percentage: number;
    peak_network_mbps: number;
    average_cpu_percentage: number;
    average_memory_percentage: number;
    average_network_mbps: number;
  };
  trends: Array<{
    metric_name: string;
    trend_direction: 'increasing' | 'decreasing' | 'stable';
    change_percentage: number;
    significance: 'high' | 'medium' | 'low';
  }>;
}

// Continue with Pipeline API, AI Assistant API, Dashboard API, Collaboration API, Integration API, and User Management API types...
// Due to length constraints, I'll create additional type files for the remaining APIs

export type {
  // Core API response types
  APIResponse,
  ResponseMetadata,
  PaginationInfo,
  
  // Orchestration API types
  CreateOrchestrationRequest,
  OrchestrationResponse,
  SystemHealthResponse,
  ExecuteWorkflowRequest,
  WorkflowExecutionResponse,
  OptimizePerformanceRequest,
  PerformanceOptimizationResponse,
  
  // Workspace API types
  CreateWorkspaceRequest,
  WorkspaceResponse,
  LinkResourceRequest,
  WorkspaceResourcesResponse,
  WorkspaceAnalyticsRequest,
  WorkspaceAnalyticsResponse,
  
  // Workflow API types
  CreateWorkflowRequest,
  WorkflowResponse,
  ExecuteWorkflowRequest,
  GetWorkflowTemplatesRequest,
  WorkflowTemplateResponse,
  
  // Activity API types
  CreateActivityRequest,
  ActivityResponse,
  ActivityCorrelationRequest,
  ActivityCorrelationResponse,
  ActivitySessionResponse,
  ActivityReportRequest,
  ActivityReportResponse,
  AdvancedActivitySearchRequest,
  ActivitySystemHealthResponse,
  ActivitySystemStatsResponse,

  // Integration API types
  CreateIntegrationEndpointRequest,
  IntegrationEndpointResponse,
  IntegrationTestResult,
  ServiceRegistrationRequest,
  ServiceRegistryResponse,
  CreateIntegrationJobRequest,
  IntegrationJobResponse,
  IntegrationJobExecutionResponse,
  StartSyncRequest,
  SyncJobResponse,
  IntegrationSystemHealthResponse,
  IntegrationPerformanceAnalyticsResponse
};