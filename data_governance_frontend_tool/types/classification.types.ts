// Classification types aligned with backend classification models

export enum ClassificationType {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  ML_ASSISTED = 'ml_assisted',
  RULE_BASED = 'rule_based',
  PATTERN_BASED = 'pattern_based',
  AI_POWERED = 'ai_powered',
}

export enum ClassificationLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret',
}

export enum SensitivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ClassificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REQUIRES_REVIEW = 'requires_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum DataCategory {
  PII = 'pii',
  PHI = 'phi',
  FINANCIAL = 'financial',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  TRADE_SECRETS = 'trade_secrets',
  CUSTOMER_DATA = 'customer_data',
  EMPLOYEE_DATA = 'employee_data',
  SYSTEM_DATA = 'system_data',
  LOG_DATA = 'log_data',
  METADATA = 'metadata',
  CUSTOM = 'custom',
}

export enum MLModelType {
  TRANSFORMER = 'transformer',
  CNN = 'cnn',
  RNN = 'rnn',
  RANDOM_FOREST = 'random_forest',
  SVM = 'svm',
  NAIVE_BAYES = 'naive_bayes',
  GRADIENT_BOOSTING = 'gradient_boosting',
  NEURAL_NETWORK = 'neural_network',
  ENSEMBLE = 'ensemble',
  CUSTOM = 'custom',
}

export enum ModelStatus {
  TRAINING = 'training',
  TRAINED = 'trained',
  DEPLOYED = 'deployed',
  DEPRECATED = 'deprecated',
  FAILED = 'failed',
  TESTING = 'testing',
}

export enum TrainingStatus {
  NOT_STARTED = 'not_started',
  PREPARING_DATA = 'preparing_data',
  TRAINING = 'training',
  VALIDATING = 'validating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Main ClassificationRule interface
export interface ClassificationRule {
  id: string;
  name: string;
  description?: string;
  type: ClassificationType;
  classification_level: ClassificationLevel;
  sensitivity_level: SensitivityLevel;
  data_category: DataCategory;
  enabled: boolean;
  
  // Rule configuration
  rule_config: ClassificationRuleConfig;
  
  // Pattern matching
  patterns: ClassificationPattern[];
  
  // ML model configuration
  ml_config?: MLModelConfig;
  
  // Validation settings
  validation_settings: ValidationSettings;
  
  // Metadata
  metadata: ClassificationMetadata;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Statistics
  statistics?: ClassificationStatistics;
  
  // Relationships
  results?: ClassificationResult[];
  tags?: ClassificationTag[];
}

export interface ClassificationRuleConfig {
  scope: ClassificationScope;
  confidence_threshold: number;
  auto_approve_threshold?: number;
  require_human_review: boolean;
  processing_priority: 'low' | 'medium' | 'high' | 'critical';
  batch_size?: number;
  timeout_seconds: number;
  retry_count: number;
  custom_parameters?: Record<string, any>;
}

export interface ClassificationScope {
  data_sources?: string[];
  schemas?: string[];
  tables?: string[];
  columns?: string[];
  file_types?: string[];
  include_patterns?: string[];
  exclude_patterns?: string[];
  max_file_size_mb?: number;
  sample_percentage?: number;
}

export interface ClassificationPattern {
  id: string;
  name: string;
  pattern_type: PatternType;
  pattern_value: string;
  case_sensitive: boolean;
  weight: number;
  regex_flags?: string;
  context_window?: number;
  negative_patterns?: string[];
}

export enum PatternType {
  REGEX = 'regex',
  KEYWORD = 'keyword',
  DICTIONARY = 'dictionary',
  STATISTICAL = 'statistical',
  SEMANTIC = 'semantic',
  CONTEXTUAL = 'contextual',
}

export interface MLModelConfig {
  model_id?: string;
  model_type: MLModelType;
  model_name: string;
  model_version: string;
  training_config: TrainingConfig;
  feature_config: FeatureConfig;
  deployment_config: DeploymentConfig;
  performance_metrics?: ModelMetrics;
}

export interface TrainingConfig {
  training_data_sources: string[];
  validation_split: number;
  test_split: number;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  early_stopping: boolean;
  cross_validation_folds?: number;
  hyperparameters?: Record<string, any>;
  data_augmentation?: DataAugmentationConfig;
}

export interface DataAugmentationConfig {
  enabled: boolean;
  techniques: string[];
  augmentation_factor: number;
  preserve_labels: boolean;
}

export interface FeatureConfig {
  text_features: TextFeatureConfig;
  numerical_features?: NumericalFeatureConfig;
  categorical_features?: CategoricalFeatureConfig;
  custom_features?: CustomFeatureConfig[];
}

export interface TextFeatureConfig {
  tokenization: 'word' | 'subword' | 'character';
  max_sequence_length: number;
  vocabulary_size?: number;
  embedding_dimension?: number;
  pretrained_embeddings?: string;
  normalization: boolean;
  remove_stopwords: boolean;
  stemming: boolean;
  lemmatization: boolean;
}

export interface NumericalFeatureConfig {
  scaling: 'standard' | 'minmax' | 'robust' | 'none';
  handle_outliers: boolean;
  fill_missing: 'mean' | 'median' | 'mode' | 'drop';
}

export interface CategoricalFeatureConfig {
  encoding: 'onehot' | 'label' | 'target' | 'binary';
  handle_unknown: 'error' | 'ignore' | 'drop';
  max_categories?: number;
}

export interface CustomFeatureConfig {
  name: string;
  feature_type: 'text' | 'numerical' | 'categorical' | 'boolean';
  extraction_method: string;
  parameters?: Record<string, any>;
}

export interface DeploymentConfig {
  deployment_target: 'cloud' | 'edge' | 'hybrid';
  resource_requirements: ResourceRequirements;
  scaling_config: ScalingConfig;
  monitoring_config: MonitoringConfig;
}

export interface ResourceRequirements {
  cpu_cores: number;
  memory_gb: number;
  gpu_required: boolean;
  gpu_memory_gb?: number;
  storage_gb: number;
}

export interface ScalingConfig {
  min_instances: number;
  max_instances: number;
  target_cpu_utilization: number;
  scale_up_cooldown: number;
  scale_down_cooldown: number;
}

export interface MonitoringConfig {
  enable_metrics: boolean;
  enable_logging: boolean;
  log_level: 'debug' | 'info' | 'warning' | 'error';
  metrics_retention_days: number;
  alert_thresholds: AlertThresholds;
}

export interface AlertThresholds {
  accuracy_drop_threshold: number;
  latency_threshold_ms: number;
  error_rate_threshold: number;
  drift_threshold: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc?: number;
  confusion_matrix?: number[][];
  class_metrics?: Record<string, ClassMetrics>;
  training_time_seconds: number;
  model_size_mb: number;
  inference_time_ms: number;
}

export interface ClassMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface ValidationSettings {
  human_review_required: boolean;
  review_sample_percentage: number;
  confidence_threshold: number;
  consensus_required: boolean;
  reviewer_count: number;
  escalation_threshold: number;
  validation_timeout_hours: number;
}

export interface ClassificationMetadata {
  business_owner?: string;
  technical_owner?: string;
  department?: string;
  compliance_requirements?: string[];
  regulatory_frameworks?: string[];
  data_retention_policy?: string;
  geographical_restrictions?: string[];
  last_reviewed_date?: string;
  next_review_date?: string;
  custom_fields?: Record<string, any>;
}

export interface ClassificationStatistics {
  total_classifications: number;
  successful_classifications: number;
  failed_classifications: number;
  pending_review: number;
  average_confidence: number;
  classification_distribution: Record<ClassificationLevel, number>;
  sensitivity_distribution: Record<SensitivityLevel, number>;
  processing_time_stats: ProcessingTimeStats;
  accuracy_metrics?: AccuracyMetrics;
}

export interface ProcessingTimeStats {
  average_time_ms: number;
  median_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
  percentile_95_ms: number;
}

export interface AccuracyMetrics {
  overall_accuracy: number;
  precision_by_class: Record<string, number>;
  recall_by_class: Record<string, number>;
  false_positive_rate: number;
  false_negative_rate: number;
}

// Classification Results
export interface ClassificationResult {
  id: string;
  rule_id: string;
  rule: ClassificationRule;
  data_source_id: string;
  data_source_name: string;
  target_info: ClassificationTarget;
  
  // Classification outcome
  classification_level: ClassificationLevel;
  sensitivity_level: SensitivityLevel;
  data_category: DataCategory;
  confidence_score: number;
  
  // Processing details
  processing_details: ProcessingDetails;
  
  // Review information
  review_status: ReviewStatus;
  review_details?: ReviewDetails;
  
  // Audit fields
  classified_at: string;
  classified_by?: string;
  last_updated: string;
  
  // Metadata
  metadata: ClassificationResultMetadata;
}

export interface ClassificationTarget {
  type: 'table' | 'column' | 'file' | 'document' | 'field';
  identifier: string;
  name: string;
  schema?: string;
  table?: string;
  column?: string;
  file_path?: string;
  size_bytes?: number;
  record_count?: number;
  sample_data?: any[];
}

export interface ProcessingDetails {
  method: ClassificationType;
  model_used?: string;
  model_version?: string;
  patterns_matched: PatternMatch[];
  features_extracted?: FeatureVector;
  processing_time_ms: number;
  resource_usage?: ResourceUsage;
  error_details?: ErrorDetails;
}

export interface PatternMatch {
  pattern_id: string;
  pattern_name: string;
  match_count: number;
  match_examples: string[];
  confidence_contribution: number;
}

export interface FeatureVector {
  text_features?: Record<string, number>;
  statistical_features?: Record<string, number>;
  custom_features?: Record<string, number>;
  feature_importance?: Record<string, number>;
}

export interface ResourceUsage {
  cpu_time_ms: number;
  memory_used_mb: number;
  gpu_time_ms?: number;
  io_operations: number;
}

export interface ErrorDetails {
  error_type: string;
  error_message: string;
  error_code?: string;
  stack_trace?: string;
  recovery_attempted: boolean;
}

export enum ReviewStatus {
  NOT_REQUIRED = 'not_required',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision',
}

export interface ReviewDetails {
  reviewer_id: string;
  reviewer_name: string;
  review_date: string;
  review_comments?: string;
  suggested_classification?: ClassificationLevel;
  suggested_sensitivity?: SensitivityLevel;
  confidence_in_review: number;
  review_time_spent_minutes: number;
}

export interface ClassificationResultMetadata {
  data_lineage?: string[];
  related_results?: string[];
  business_context?: string;
  technical_context?: string;
  quality_score?: number;
  validation_notes?: string;
  custom_attributes?: Record<string, any>;
}

// ML Models
export interface MLModel {
  id: string;
  name: string;
  description?: string;
  model_type: MLModelType;
  version: string;
  status: ModelStatus;
  
  // Model configuration
  configuration: MLModelConfig;
  
  // Training information
  training_info: TrainingInfo;
  
  // Performance metrics
  performance: ModelPerformance;
  
  // Deployment information
  deployment_info?: DeploymentInfo;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Metadata
  metadata: ModelMetadata;
}

export interface TrainingInfo {
  training_status: TrainingStatus;
  training_started_at?: string;
  training_completed_at?: string;
  training_duration_seconds?: number;
  dataset_info: DatasetInfo;
  hyperparameters: Record<string, any>;
  training_logs?: TrainingLog[];
}

export interface DatasetInfo {
  total_samples: number;
  training_samples: number;
  validation_samples: number;
  test_samples: number;
  class_distribution: Record<string, number>;
  data_quality_score: number;
  data_sources: string[];
}

export interface TrainingLog {
  epoch: number;
  timestamp: string;
  metrics: Record<string, number>;
  loss: number;
  validation_loss?: number;
}

export interface ModelPerformance {
  overall_metrics: ModelMetrics;
  validation_metrics: ModelMetrics;
  test_metrics?: ModelMetrics;
  cross_validation_scores?: number[];
  benchmark_comparisons?: BenchmarkComparison[];
  drift_detection?: DriftDetection;
}

export interface BenchmarkComparison {
  benchmark_name: string;
  our_score: number;
  benchmark_score: number;
  improvement_percentage: number;
}

export interface DriftDetection {
  data_drift_detected: boolean;
  concept_drift_detected: boolean;
  drift_score: number;
  drift_detection_date: string;
  affected_features: string[];
}

export interface DeploymentInfo {
  deployment_id: string;
  deployment_status: 'deploying' | 'deployed' | 'failed' | 'stopped';
  deployment_date: string;
  endpoint_url?: string;
  resource_allocation: ResourceRequirements;
  scaling_info: ScalingInfo;
  health_status: HealthStatus;
}

export interface ScalingInfo {
  current_instances: number;
  target_instances: number;
  cpu_utilization: number;
  memory_utilization: number;
  requests_per_second: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  last_health_check: string;
  response_time_ms: number;
  error_rate: number;
  uptime_percentage: number;
}

export interface ModelMetadata {
  tags: string[];
  use_cases: string[];
  supported_data_types: string[];
  limitations: string[];
  known_biases?: string[];
  ethical_considerations?: string[];
  privacy_implications?: string[];
  regulatory_compliance?: string[];
}

// Classification Jobs
export interface ClassificationJob {
  id: string;
  name: string;
  description?: string;
  rule_ids: string[];
  scope: ClassificationScope;
  status: JobStatus;
  
  // Job configuration
  configuration: JobConfiguration;
  
  // Execution details
  execution_details: JobExecutionDetails;
  
  // Results summary
  results_summary?: JobResultsSummary;
  
  // Audit fields
  created_at: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
}

export enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export interface JobConfiguration {
  parallel_processing: boolean;
  max_concurrent_tasks: number;
  batch_size: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout_hours: number;
  retry_failed_items: boolean;
  notification_settings: NotificationSettings;
}

export interface NotificationSettings {
  notify_on_completion: boolean;
  notify_on_failure: boolean;
  notify_on_milestone: boolean;
  milestone_percentage: number;
  notification_channels: string[];
  recipients: string[];
}

export interface JobExecutionDetails {
  progress_percentage: number;
  current_stage: string;
  items_processed: number;
  items_total: number;
  items_successful: number;
  items_failed: number;
  estimated_completion_time?: string;
  resource_usage: ResourceUsage;
  error_logs?: ErrorLog[];
}

export interface ErrorLog {
  timestamp: string;
  item_identifier: string;
  error_type: string;
  error_message: string;
  retry_count: number;
}

export interface JobResultsSummary {
  total_items: number;
  successful_items: number;
  failed_items: number;
  skipped_items: number;
  classification_distribution: Record<ClassificationLevel, number>;
  average_confidence: number;
  processing_time_total_seconds: number;
  cost_estimation?: CostEstimation;
}

export interface CostEstimation {
  compute_cost: number;
  storage_cost: number;
  api_cost: number;
  total_cost: number;
  currency: string;
}

// Tags and Labels
export interface ClassificationTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: 'classification' | 'sensitivity' | 'category' | 'custom';
  created_at: string;
}

export interface SensitivityLabel {
  id: string;
  name: string;
  level: SensitivityLevel;
  description: string;
  handling_instructions: string;
  retention_policy?: string;
  access_controls?: AccessControl[];
}

export interface AccessControl {
  type: 'role' | 'group' | 'user' | 'attribute';
  identifier: string;
  permissions: string[];
  conditions?: Record<string, any>;
}

// Forms and UI types
export interface ClassificationRuleFormData {
  name: string;
  description?: string;
  type: ClassificationType;
  classification_level: ClassificationLevel;
  sensitivity_level: SensitivityLevel;
  data_category: DataCategory;
  enabled: boolean;
  rule_config: Partial<ClassificationRuleConfig>;
  patterns: Partial<ClassificationPattern>[];
  ml_config?: Partial<MLModelConfig>;
  validation_settings: Partial<ValidationSettings>;
  metadata: Partial<ClassificationMetadata>;
  tags: string[];
}

export interface ClassificationFilters {
  types?: ClassificationType[];
  classification_levels?: ClassificationLevel[];
  sensitivity_levels?: SensitivityLevel[];
  data_categories?: DataCategory[];
  statuses?: ClassificationStatus[];
  confidence_min?: number;
  confidence_max?: number;
  tags?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
  enabled?: boolean;
}

// API response types
export interface ClassificationRulesResponse {
  rules: ClassificationRule[];
  total: number;
  page: number;
  limit: number;
  filters_applied: ClassificationFilters;
}

export interface ClassificationResultsResponse {
  results: ClassificationResult[];
  total: number;
  page: number;
  limit: number;
  summary: ClassificationSummary;
}

export interface ClassificationSummary {
  total_results: number;
  by_classification: Record<ClassificationLevel, number>;
  by_sensitivity: Record<SensitivityLevel, number>;
  by_category: Record<DataCategory, number>;
  average_confidence: number;
  pending_review: number;
}

export interface MLModelsResponse {
  models: MLModel[];
  total: number;
  page: number;
  limit: number;
}

export interface ClassificationDashboardData {
  overview: ClassificationOverview;
  recent_results: ClassificationResult[];
  model_performance: ModelPerformanceOverview[];
  classification_trends: TrendDataPoint[];
  accuracy_metrics: AccuracyOverview;
}

export interface ClassificationOverview {
  total_rules: number;
  active_rules: number;
  total_classifications: number;
  pending_review: number;
  average_confidence: number;
  accuracy_score: number;
}

export interface ModelPerformanceOverview {
  model_id: string;
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  last_trained: string;
  status: ModelStatus;
}

export interface TrendDataPoint {
  date: string;
  classifications: number;
  accuracy: number;
  confidence: number;
}

export interface AccuracyOverview {
  overall_accuracy: number;
  accuracy_by_category: Record<DataCategory, number>;
  accuracy_trends: AccuracyTrendPoint[];
  model_comparison: ModelComparisonPoint[];
}

export interface AccuracyTrendPoint {
  date: string;
  accuracy: number;
  sample_size: number;
}

export interface ModelComparisonPoint {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}