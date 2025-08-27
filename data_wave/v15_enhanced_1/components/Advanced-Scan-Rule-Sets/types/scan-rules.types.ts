// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE TYPE DEFINITIONS
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// API TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
  pagination?: PaginationInfo;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stackTrace?: string;
  correlationId?: string;
  timestamp: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  duration: number;
  version: string;
  cached: boolean;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// CORE SCAN RULE TYPES
// ============================================================================

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'file_system' | 'cloud_storage' | 'api' | 'streaming' | 'data_lake';
  connection_string: string;
  configuration: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'testing';
  created_at: string;
  updated_at: string;
  metadata: DataSourceMetadata;
  health_status: HealthStatus;
  performance_metrics: PerformanceMetrics;
}

export interface DataSourceMetadata {
  schema_count: number;
  table_count: number;
  estimated_size: string;
  last_scan: string;
  scan_frequency: string;
  data_classification: string[];
  compliance_tags: string[];
  business_context: string;
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  last_check: string;
  uptime_percentage: number;
  response_time_ms: number;
  error_rate: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface PerformanceMetrics {
  throughput_records_per_second: number;
  latency_ms: number;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  storage_usage_gb: number;
  network_io_mbps: number;
}

// ============================================================================
// SCAN RULE SET TYPES
// ============================================================================

export interface ScanRuleSet {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  category: 'data_quality' | 'compliance' | 'security' | 'business_rules' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'critical';
  rules: ScanRule[];
  metadata: RuleSetMetadata;
  execution_config: ExecutionConfiguration;
  validation_results: ValidationResult[];
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface EnhancedScanRuleSet extends ScanRuleSet {
  ai_optimization: AIOptimization;
  pattern_library: PatternLibrary;
  collaboration_features: CollaborationFeatures;
  analytics: RuleSetAnalytics;
  integration_points: IntegrationPoint[];
  governance_settings: GovernanceSettings;
}

export interface ScanRule {
  id: string;
  name: string;
  description: string;
  type: 'validation' | 'transformation' | 'classification' | 'compliance' | 'quality';
  expression: string;
  language: 'sql' | 'python' | 'regex' | 'json_path' | 'xpath' | 'custom';
  parameters: Record<string, any>;
  thresholds: Threshold[];
  conditions: Condition[];
  actions: Action[];
  pattern: string; // Added missing pattern property
  metadata: RuleMetadata;
  performance_profile: PerformanceProfile;
  test_cases: TestCase[];
}

export interface RuleSetMetadata {
  complexity_score: number;
  estimated_execution_time: number;
  resource_requirements: ResourceRequirements;
  compatibility: string[];
  dependencies: string[];
  change_history: ChangeHistoryEntry[];
  usage_statistics: UsageStatistics;
  status: 'active' | 'inactive' | 'draft' | 'deprecated'; // Added missing status property
  complexity: 'low' | 'medium' | 'high' | 'critical'; // Added missing complexity property
  compliance_score: number; // Added missing compliance_score property
  performance_score: number; // Added missing performance_score property
}

export interface ExecutionConfiguration {
  schedule: ScheduleConfig;
  resource_allocation: ResourceAllocation;
  retry_policy: RetryPolicy;
  notification_settings: NotificationSettings;
  output_configuration: OutputConfiguration;
  monitoring_settings: MonitoringSettings;
}

export interface ValidationResult {
  rule_id: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  details: Record<string, any>;
  timestamp: string;
  execution_time_ms: number;
  suggestions: string[];
}

// ============================================================================
// AI OPTIMIZATION TYPES
// ============================================================================

export interface AIOptimization {
  enabled: boolean;
  optimization_level: 'conservative' | 'balanced' | 'aggressive';
  ml_models: MLModel[];
  pattern_recognition: PatternRecognition;
  performance_tuning: PerformanceTuning;
  predictive_insights: PredictiveInsights;
  recommendation_engine: RecommendationEngine;
}

export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection';
  version: string;
  accuracy: number;
  training_date: string;
  status: 'training' | 'ready' | 'deployed' | 'deprecated';
  metrics: MLMetrics;
  features: string[];
}

export interface PatternRecognition {
  enabled: boolean;
  confidence_threshold: number;
  patterns_detected: DetectedPattern[];
  learning_mode: 'supervised' | 'unsupervised' | 'reinforcement';
  update_frequency: string;
}

export interface DetectedPattern {
  id: string;
  type: string;
  description: string;
  confidence: number;
  occurrences: number;
  first_detected: string;
  last_seen: string;
  impact_score: number;
}

export interface PerformanceTuning {
  auto_optimization: boolean;
  optimization_targets: OptimizationTarget[];
  current_metrics: PerformanceMetrics;
  optimization_history: OptimizationHistory[];
  recommendations: PerformanceRecommendation[];
}

export interface OptimizationTarget {
  metric: string;
  target_value: number;
  current_value: number;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'achieved' | 'failed';
}

export interface PredictiveInsights {
  enabled: boolean;
  prediction_horizon: string;
  insights: Insight[];
  trends: Trend[];
  forecasts: Forecast[];
  anomaly_predictions: AnomalyPrediction[];
}

export interface Insight {
  id: string;
  type: 'performance' | 'quality' | 'compliance' | 'cost' | 'usage';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommended_actions: string[];
  created_at: string;
}

// ============================================================================
// ORCHESTRATION TYPES
// ============================================================================

export interface ScanOrchestrationJob {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  workflow_definition: WorkflowDefinition;
  execution_context: ExecutionContext;
  resource_allocation: ResourceAllocation;
  dependencies: JobDependency[];
  progress: JobProgress;
  metrics: JobMetrics;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  created_by: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
  error_handling: ErrorHandlingConfig;
  rollback_strategy: RollbackStrategy;
  approval_gates: ApprovalGate[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'scan' | 'validation' | 'transformation' | 'notification' | 'approval' | 'custom';
  configuration: Record<string, any>;
  timeout: number;
  retry_count: number;
  conditions: Condition[];
  outputs: StepOutput[];
  dependencies: string[];
}

export interface WorkflowTransition {
  from_step: string;
  to_step: string;
  condition: string;
  action: string;
  metadata: Record<string, any>;
}

export interface ExecutionContext {
  environment: 'development' | 'staging' | 'production';
  user_context: UserContext;
  system_context: SystemContext;
  business_context: BusinessContext;
  security_context: SecurityContext;
}

export interface ResourceAllocation {
  cpu_cores: number;
  memory_mb: number;
  storage_gb: number;
  network_bandwidth_mbps: number;
  gpu_units?: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  scaling_policy: ScalingPolicy;
}

export interface JobDependency {
  job_id: string;
  dependency_type: 'hard' | 'soft' | 'conditional';
  condition?: string;
  timeout?: number;
  failure_action: 'fail' | 'skip' | 'retry';
}

export interface JobProgress {
  percentage_complete: number;
  current_step: string;
  steps_completed: number;
  total_steps: number;
  estimated_completion_time: string;
  throughput: ThroughputMetrics;
  quality_metrics: QualityMetrics;
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export interface CollaborationFeatures {
  team_workspace: TeamWorkspace;
  review_workflow: ReviewWorkflow;
  commenting_system: CommentingSystem;
  knowledge_base: KnowledgeBase;
  expert_consultation: ExpertConsultation;
  version_control: VersionControl;
}

export interface TeamWorkspace {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  permissions: WorkspacePermissions;
  settings: WorkspaceSettings;
  activity_feed: ActivityFeedItem[];
  shared_resources: SharedResource[];
}

export interface TeamMember {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'reviewer';
  permissions: string[];
  joined_at: string;
  last_active: string;
  expertise_areas: string[];
  contribution_score: number;
}

export interface ReviewWorkflow {
  id: string;
  name: string;
  stages: ReviewStage[];
  current_stage: string;
  reviewers: Reviewer[];
  approval_criteria: ApprovalCriteria;
  timeline: ReviewTimeline;
  comments: Comment[];
  attachments: Attachment[];
}

export interface ReviewStage {
  id: string;
  name: string;
  description: string;
  required_approvals: number;
  timeout_hours: number;
  auto_approve_conditions: string[];
  escalation_rules: EscalationRule[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  type: 'general' | 'suggestion' | 'issue' | 'approval' | 'rejection';
  target_element?: string;
  line_number?: number;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  replies: Comment[];
  reactions: Reaction[];
}

export interface KnowledgeBase {
  articles: KnowledgeArticle[];
  faqs: FAQ[];
  best_practices: BestPractice[];
  troubleshooting_guides: TroubleshootingGuide[];
  video_tutorials: VideoTutorial[];
  documentation_links: DocumentationLink[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
  rating: number;
  helpful_votes: number;
  related_articles: string[];
}

// ============================================================================
// REPORTING & ANALYTICS TYPES
// ============================================================================

export interface RuleSetAnalytics {
  execution_metrics: ExecutionMetrics;
  performance_trends: PerformanceTrend[];
  usage_statistics: UsageStatistics;
  quality_metrics: QualityMetrics;
  compliance_metrics: ComplianceMetrics;
  cost_analysis: CostAnalysis;
  roi_metrics: ROIMetrics;
  user_engagement: UserEngagementMetrics;
}

export interface ExecutionMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time: number;
  throughput_per_hour: number;
  resource_utilization: ResourceUtilization;
  error_rates: ErrorRate[];
  performance_percentiles: PerformancePercentiles;
}

export interface PerformanceTrend {
  metric_name: string;
  time_series: TimeSeriesData[];
  trend_direction: 'up' | 'down' | 'stable';
  trend_percentage: number;
  seasonality_detected: boolean;
  anomalies: AnomalyPoint[];
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface UsageStatistics {
  daily_active_users: number;
  monthly_active_users: number;
  most_used_rules: RuleUsage[];
  peak_usage_times: PeakUsage[];
  geographic_distribution: GeographicUsage[];
  feature_adoption: FeatureAdoption[];
}

export interface QualityMetrics {
  data_quality_score: number;
  rule_effectiveness: number;
  false_positive_rate: number;
  false_negative_rate: number;
  precision: number;
  recall: number;
  f1_score: number;
  quality_trends: QualityTrend[];
}

export interface ComplianceMetrics {
  overall_compliance_score: number;
  regulatory_compliance: RegulatoryCompliance[];
  policy_adherence: PolicyAdherence[];
  audit_readiness: AuditReadiness;
  violation_trends: ViolationTrend[];
  remediation_status: RemediationStatus[];
}

export interface ROIMetrics {
  cost_savings: CostSavings;
  productivity_gains: ProductivityGains;
  risk_reduction: RiskReduction;
  time_savings: TimeSavings;
  quality_improvements: QualityImprovements;
  compliance_benefits: ComplianceBenefits;
  total_roi_percentage: number;
  payback_period_months: number;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export interface ComponentProps {
  className?: string;
  children?: ReactNode;
  loading?: boolean;
  error?: Error | null;
  onError?: (error: Error) => void;
}

export interface DashboardProps extends ComponentProps {
  data: any;
  filters?: FilterOptions;
  refreshInterval?: number;
  realTimeUpdates?: boolean;
  customization?: DashboardCustomization;
}

export interface FilterOptions {
  dateRange?: DateRange;
  categories?: string[];
  status?: string[];
  priority?: string[];
  users?: string[];
  tags?: string[];
  customFilters?: CustomFilter[];
}

export interface DateRange {
  start: string;
  end: string;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface CustomFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between';
  value: any;
  label: string;
}

export interface DashboardCustomization {
  layout: 'grid' | 'list' | 'cards';
  theme: 'light' | 'dark' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  widgets: WidgetConfiguration[];
  personalization: PersonalizationSettings;
}

export interface WidgetConfiguration {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  configuration: Record<string, any>;
  visible: boolean;
  refreshRate?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
  pagination?: PaginationInfo;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  trace_id?: string;
}

export interface ResponseMetadata {
  request_id: string;
  timestamp: string;
  execution_time_ms: number;
  version: string;
  cache_hit?: boolean;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ============================================================================
// FORM & VALIDATION TYPES
// ============================================================================

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'datetime' | 'file' | 'custom';
  required?: boolean;
  placeholder?: string;
  description?: string;
  validation?: ValidationRule[];
  options?: SelectOption[];
  dependencies?: FieldDependency[];
  conditional?: ConditionalLogic;
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface SelectOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface FieldDependency {
  field: string;
  condition: string;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export interface ConditionalLogic {
  conditions: LogicalCondition[];
  operator: 'and' | 'or';
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export interface LogicalCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc';
export type SortField = string;

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface SearchConfig {
  query: string;
  fields: string[];
  fuzzy?: boolean;
  case_sensitive?: boolean;
  exact_match?: boolean;
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields?: string[];
  filters?: FilterOptions;
  filename?: string;
}

// ============================================================================
// THEME & STYLING TYPES
// ============================================================================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  font_size: 'small' | 'medium' | 'large';
  border_radius: 'none' | 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface StyleOverrides {
  css_variables?: Record<string, string>;
  component_styles?: Record<string, Record<string, any>>;
  custom_css?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Additional supporting types referenced above
interface Threshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
  value: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface Condition {
  field: string;
  operator: string;
  value: any;
  logical_operator?: 'and' | 'or';
}

interface Action {
  type: 'alert' | 'email' | 'webhook' | 'stop_execution' | 'log' | 'custom';
  configuration: Record<string, any>;
  enabled: boolean;
}

interface RuleMetadata {
  author: string;
  created_at: string;
  updated_at: string;
  version: string;
  tags: string[];
  documentation: string;
  examples: string[];
}

interface PerformanceProfile {
  avg_execution_time_ms: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  success_rate: number;
  error_patterns: string[];
}

interface TestCase {
  id: string;
  name: string;
  input: any;
  expected_output: any;
  status: 'passed' | 'failed' | 'pending';
  last_run: string;
}

interface ResourceRequirements {
  min_cpu_cores: number;
  min_memory_mb: number;
  min_storage_gb: number;
  estimated_duration_minutes: number;
}

interface ChangeHistoryEntry {
  version: string;
  author: string;
  timestamp: string;
  changes: string[];
  impact_assessment: string;
}

interface ScheduleConfig {
  type: 'immediate' | 'scheduled' | 'recurring' | 'event_driven';
  cron_expression?: string;
  timezone: string;
  start_date?: string;
  end_date?: string;
  max_concurrent_executions: number;
}

interface RetryPolicy {
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  base_delay_ms: number;
  max_delay_ms: number;
  retry_conditions: string[];
}

interface NotificationSettings {
  email_notifications: boolean;
  slack_notifications: boolean;
  webhook_notifications: boolean;
  notification_rules: NotificationRule[];
}

interface NotificationRule {
  trigger: string;
  recipients: string[];
  template: string;
  enabled: boolean;
}

interface OutputConfiguration {
  format: 'json' | 'csv' | 'parquet' | 'avro';
  destination: string;
  compression: 'none' | 'gzip' | 'snappy';
  partitioning: PartitioningConfig;
}

interface PartitioningConfig {
  enabled: boolean;
  fields: string[];
  strategy: 'date' | 'hash' | 'range';
}

interface MonitoringSettings {
  metrics_collection: boolean;
  log_level: 'debug' | 'info' | 'warning' | 'error';
  custom_metrics: string[];
  alerting_rules: AlertingRule[];
}

interface AlertingRule {
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
}

interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  confusion_matrix: number[][];
}

interface OptimizationHistory {
  timestamp: string;
  optimization_type: string;
  before_metrics: Record<string, number>;
  after_metrics: Record<string, number>;
  improvement_percentage: number;
}

interface PerformanceRecommendation {
  id: string;
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimated_improvement: number;
  implementation_steps: string[];
}

interface Trend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  rate_of_change: number;
  confidence: number;
  time_window: string;
}

interface Forecast {
  metric: string;
  predicted_values: { timestamp: string; value: number; confidence_interval: [number, number] }[];
  model_accuracy: number;
  forecast_horizon: string;
}

interface AnomalyPrediction {
  timestamp: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommended_actions: string[];
}

interface ErrorHandlingConfig {
  strategy: 'fail_fast' | 'continue_on_error' | 'retry' | 'skip';
  max_errors: number;
  error_threshold_percentage: number;
  notification_on_error: boolean;
}

interface RollbackStrategy {
  enabled: boolean;
  trigger_conditions: string[];
  rollback_steps: string[];
  data_backup_required: boolean;
}

interface ApprovalGate {
  id: string;
  name: string;
  required_approvers: string[];
  timeout_hours: number;
  auto_approve_conditions: string[];
}

interface StepOutput {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface UserContext {
  user_id: string;
  username: string;
  roles: string[];
  permissions: string[];
  preferences: Record<string, any>;
}

interface SystemContext {
  environment: string;
  version: string;
  region: string;
  cluster_id: string;
  instance_id: string;
}

interface BusinessContext {
  organization: string;
  department: string;
  project: string;
  cost_center: string;
  business_unit: string;
}

interface SecurityContext {
  access_token: string;
  permissions: string[];
  security_level: string;
  audit_trail_id: string;
}

interface ScalingPolicy {
  auto_scaling: boolean;
  min_instances: number;
  max_instances: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
  cooldown_period: number;
}

interface ThroughputMetrics {
  records_per_second: number;
  bytes_per_second: number;
  operations_per_second: number;
  peak_throughput: number;
  average_throughput: number;
}

interface WorkspacePermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
  share: boolean;
  export: boolean;
}

interface WorkspaceSettings {
  visibility: 'private' | 'team' | 'organization' | 'public';
  collaboration_mode: 'synchronous' | 'asynchronous';
  notification_preferences: Record<string, boolean>;
  integration_settings: Record<string, any>;
}

interface ActivityFeedItem {
  id: string;
  type: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  metadata: Record<string, any>;
}

interface SharedResource {
  id: string;
  type: string;
  name: string;
  description: string;
  owner: string;
  permissions: ResourcePermissions;
  last_modified: string;
}

interface ResourcePermissions {
  read: string[];
  write: string[];
  admin: string[];
}

interface Reviewer {
  user_id: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  comments: string;
  timestamp: string;
}

interface ApprovalCriteria {
  required_approvals: number;
  approval_percentage: number;
  blocking_reviewers: string[];
  auto_approve_conditions: string[];
}

interface ReviewTimeline {
  created_at: string;
  due_date: string;
  completed_at?: string;
  milestones: Milestone[];
}

interface Milestone {
  name: string;
  target_date: string;
  completed_date?: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface EscalationRule {
  trigger_condition: string;
  escalation_target: string;
  delay_hours: number;
  notification_template: string;
}

interface Attachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful_votes: number;
  created_at: string;
}

interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: string;
  implementation_steps: string[];
  benefits: string[];
  examples: string[];
}

interface TroubleshootingGuide {
  id: string;
  problem: string;
  symptoms: string[];
  causes: string[];
  solutions: Solution[];
  prevention_tips: string[];
}

interface Solution {
  description: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string;
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  thumbnail: string;
  category: string;
  views: number;
}

interface DocumentationLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  last_updated: string;
}

interface ErrorRate {
  error_type: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PerformancePercentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  p99_9: number;
}

interface AnomalyPoint {
  timestamp: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface RuleUsage {
  rule_id: string;
  rule_name: string;
  usage_count: number;
  last_used: string;
  average_execution_time: number;
}

interface PeakUsage {
  hour_of_day: number;
  day_of_week: number;
  usage_count: number;
  resource_utilization: number;
}

interface GeographicUsage {
  region: string;
  country: string;
  user_count: number;
  usage_percentage: number;
}

interface FeatureAdoption {
  feature_name: string;
  adoption_rate: number;
  user_count: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface QualityTrend {
  metric: string;
  trend_direction: 'improving' | 'declining' | 'stable';
  change_percentage: number;
  time_period: string;
}

interface RegulatoryCompliance {
  regulation: string;
  compliance_percentage: number;
  violations: number;
  last_assessment: string;
  next_assessment: string;
}

interface PolicyAdherence {
  policy_name: string;
  adherence_percentage: number;
  violations: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface AuditReadiness {
  overall_score: number;
  readiness_percentage: number;
  missing_controls: string[];
  recommendations: string[];
}

interface ViolationTrend {
  violation_type: string;
  count: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  severity_distribution: Record<string, number>;
}

interface RemediationStatus {
  violation_id: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assigned_to: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface CostSavings {
  total_savings: number;
  savings_breakdown: Record<string, number>;
  cost_avoidance: number;
  efficiency_gains: number;
}

interface ProductivityGains {
  time_saved_hours: number;
  automation_percentage: number;
  manual_effort_reduction: number;
  process_improvements: string[];
}

interface RiskReduction {
  risk_score_improvement: number;
  vulnerabilities_addressed: number;
  compliance_improvements: number;
  incident_reduction: number;
}

interface TimeSavings {
  total_time_saved_hours: number;
  average_time_per_task_reduction: number;
  automation_time_savings: number;
  process_optimization_savings: number;
}

interface QualityImprovements {
  data_quality_score_improvement: number;
  error_reduction_percentage: number;
  accuracy_improvement: number;
  consistency_improvement: number;
}

interface ComplianceBenefits {
  compliance_score_improvement: number;
  audit_cost_reduction: number;
  penalty_avoidance: number;
  regulatory_confidence: number;
}

interface PatternLibrary {
  id: string;
  name: string;
  patterns: Pattern[];
  categories: PatternCategory[];
  usage_statistics: PatternUsageStats;
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  pattern_type: string;
  expression: string;
  language: string;
  examples: string[];
  usage_count: number;
  effectiveness_score: number;
}

interface PatternCategory {
  id: string;
  name: string;
  description: string;
  pattern_count: number;
}

interface PatternUsageStats {
  most_used_patterns: string[];
  pattern_effectiveness: Record<string, number>;
  adoption_trends: Record<string, number>;
}

interface IntegrationPoint {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'event' | 'database' | 'file';
  configuration: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  health_check: HealthCheck;
}

interface HealthCheck {
  status: 'healthy' | 'warning' | 'unhealthy';
  last_check: string;
  response_time: number;
  error_message?: string;
}

interface GovernanceSettings {
  approval_required: boolean;
  review_process: string;
  compliance_checks: string[];
  audit_logging: boolean;
  access_controls: AccessControl[];
}

interface AccessControl {
  resource: string;
  permissions: string[];
  conditions: string[];
  expiry_date?: string;
}

interface RecommendationEngine {
  enabled: boolean;
  recommendation_types: string[];
  confidence_threshold: number;
  learning_rate: number;
  feedback_integration: boolean;
}

interface ResourceUtilization {
  cpu_utilization: number;
  memory_utilization: number;
  storage_utilization: number;
  network_utilization: number;
  gpu_utilization?: number;
}

interface JobMetrics {
  execution_time: number;
  resource_usage: ResourceUtilization;
  throughput: ThroughputMetrics;
  quality_metrics: QualityMetrics;
  error_count: number;
  warning_count: number;
}

interface UserEngagementMetrics {
  daily_active_users: number;
  session_duration: number;
  feature_usage: Record<string, number>;
  user_satisfaction_score: number;
  retention_rate: number;
}

interface CostAnalysis {
  total_cost: number;
  cost_breakdown: Record<string, number>;
  cost_trends: CostTrend[];
  cost_optimization_opportunities: CostOptimization[];
}

interface CostTrend {
  period: string;
  cost: number;
  change_percentage: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

interface CostOptimization {
  opportunity: string;
  potential_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
}

interface PersonalizationSettings {
  dashboard_layout: string;
  default_filters: FilterOptions;
  notification_preferences: Record<string, boolean>;
  theme_preferences: ThemeConfig;
  widget_preferences: Record<string, any>;
}