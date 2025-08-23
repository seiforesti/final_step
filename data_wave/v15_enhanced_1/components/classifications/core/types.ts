/**
 * Advanced Classifications System - Type Definitions
 * Enterprise-grade TypeScript interfaces for all three classification versions
 * Comprehensive type safety for ML, AI, and manual classification workflows
 */

import { ReactNode } from 'react'

// ============================================================================
// BASE SYSTEM TYPES
// ============================================================================

export interface BaseEntity {
  id: number
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string
  version: number
  metadata?: Record<string, any>
}

export interface PaginationParams {
  page: number
  limit: number
  offset?: number
  total?: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterParams {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'starts_with' | 'ends_with'
  value: any
}

export interface SearchParams {
  query: string
  fields?: string[]
  fuzzy?: boolean
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  pagination?: PaginationParams
  metadata?: Record<string, any>
}

export interface WorkflowState {
  currentStep: string
  totalSteps: number
  completedSteps: string[]
  nextSteps: string[]
  canGoBack: boolean
  canGoForward: boolean
  progress: number
  context: Record<string, any>
}

export interface RealTimeEvent {
  id: string
  type: string
  timestamp: string
  data: any
  source: 'ml' | 'ai' | 'classification' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// ============================================================================
// VERSION 1: MANUAL & RULE-BASED CLASSIFICATION TYPES
// ============================================================================

export enum ClassificationRuleType {
  REGEX = 'regex',
  DICTIONARY = 'dictionary',
  PATTERN = 'pattern',
  KEYWORD = 'keyword',
  COMPOUND = 'compound',
  CONDITIONAL = 'conditional'
}

export enum SensitivityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

export enum ClassificationScope {
  GLOBAL = 'global',
  DOMAIN = 'domain',
  DATASET = 'dataset',
  FIELD = 'field',
  RECORD = 'record'
}

export enum ClassificationStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
  TESTING = 'testing'
}

export interface ClassificationFramework extends BaseEntity {
  name: string
  description: string
  domain: string
  category: string
  status: ClassificationStatus
  scope: ClassificationScope
  tags: string[]
  rules_count: number
  policies_count: number
  applied_count: number
  accuracy_score?: number
  compliance_status: 'compliant' | 'non_compliant' | 'pending'
  business_impact: {
    cost_reduction: number
    time_savings: number
    accuracy_improvement: number
  }
  configuration: {
    auto_apply: boolean
    require_approval: boolean
    notification_enabled: boolean
    audit_enabled: boolean
  }
}

export interface ClassificationRule extends BaseEntity {
  framework_id: number
  name: string
  description: string
  rule_type: ClassificationRuleType
  pattern: string
  sensitivity_level: SensitivityLevel
  scope: ClassificationScope
  priority: number
  is_active: boolean
  conditions: RuleCondition[]
  actions: RuleAction[]
  validation_results?: ValidationResult
  performance_metrics: {
    accuracy: number
    precision: number
    recall: number
    f1_score: number
    execution_time_ms: number
    memory_usage_mb: number
  }
}

export interface RuleCondition {
  id: string
  field: string
  operator: string
  value: any
  data_type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  case_sensitive?: boolean
  logical_operator?: 'AND' | 'OR' | 'NOT'
}

export interface RuleAction {
  id: string
  type: 'classify' | 'tag' | 'alert' | 'block' | 'approve' | 'route'
  parameters: Record<string, any>
  conditions?: RuleCondition[]
  priority: number
}

export interface ValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  performance_impact: 'low' | 'medium' | 'high'
  estimated_accuracy: number
}

export interface ClassificationPolicy extends BaseEntity {
  framework_id: number
  name: string
  description: string
  policy_type: 'data_governance' | 'compliance' | 'security' | 'business'
  rules: PolicyRule[]
  enforcement_level: 'advisory' | 'mandatory' | 'blocking'
  compliance_requirements: string[]
  business_justification: string
  risk_assessment: {
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    impact_assessment: string
    mitigation_strategies: string[]
  }
}

export interface PolicyRule {
  id: string
  condition: string
  action: string
  parameters: Record<string, any>
  exceptions: string[]
}

export interface BulkOperation extends BaseEntity {
  operation_id: string
  operation_type: 'upload' | 'classify' | 'update' | 'delete' | 'export'
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: {
    total_items: number
    processed_items: number
    successful_items: number
    failed_items: number
    percentage: number
    estimated_completion_time?: string
  }
  configuration: {
    batch_size: number
    parallel_processing: boolean
    error_handling: 'continue' | 'stop_on_error' | 'rollback'
    notification_settings: NotificationSettings
  }
  results?: BulkOperationResult
}

export interface BulkOperationResult {
  summary: {
    total_processed: number
    successful: number
    failed: number
    warnings: number
  }
  details: BulkItemResult[]
  execution_time: number
  resource_usage: ResourceUsage
}

export interface BulkItemResult {
  item_id: string
  status: 'success' | 'failed' | 'warning'
  message?: string
  classification_result?: ClassificationResult
  errors?: string[]
}

export interface NotificationSettings {
  enabled: boolean
  channels: ('email' | 'slack' | 'webhook' | 'dashboard')[]
  recipients: string[]
  trigger_conditions: string[]
  message_template?: string
}

export interface ResourceUsage {
  cpu_usage: number
  memory_usage: number
  storage_usage: number
  network_io: number
  execution_time: number
}

// ============================================================================
// VERSION 2: ML-DRIVEN CLASSIFICATION TYPES
// ============================================================================

export enum MLModelType {
  NAIVE_BAYES = 'naive_bayes',
  SVM = 'svm',
  RANDOM_FOREST = 'random_forest',
  GRADIENT_BOOSTING = 'gradient_boosting',
  NEURAL_NETWORK = 'neural_network',
  TRANSFORMER = 'transformer',
  ENSEMBLE = 'ensemble'
}

export enum TrainingStatus {
  INITIALIZING = 'initializing',
  PREPROCESSING = 'preprocessing',
  TRAINING = 'training',
  VALIDATING = 'validating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ModelDeploymentStatus {
  TRAINING = 'training',
  STAGED = 'staged',
  PRODUCTION = 'production',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

export interface MLModelConfiguration extends BaseEntity {
  name: string
  description: string
  model_type: MLModelType
  algorithm_config: AlgorithmConfig
  feature_config: FeatureConfig
  training_config: TrainingConfig
  deployment_config: DeploymentConfig
  performance_metrics?: ModelPerformanceMetrics
  business_metrics?: BusinessMetrics
  status: ModelDeploymentStatus
  version_history: ModelVersion[]
}

export interface AlgorithmConfig {
  algorithm: string
  hyperparameters: Record<string, any>
  optimization_strategy: 'grid_search' | 'random_search' | 'bayesian' | 'evolutionary'
  cross_validation: {
    folds: number
    strategy: 'k_fold' | 'stratified' | 'time_series'
  }
  early_stopping: {
    enabled: boolean
    patience: number
    min_delta: number
    monitor_metric: string
  }
}

export interface FeatureConfig {
  feature_selection: {
    method: 'univariate' | 'recursive' | 'lasso' | 'tree_based'
    n_features: number | 'auto'
    threshold?: number
  }
  feature_engineering: {
    text_processing: TextProcessingConfig
    numerical_processing: NumericalProcessingConfig
    categorical_processing: CategoricalProcessingConfig
    custom_features: CustomFeature[]
  }
  feature_importance: {
    method: 'permutation' | 'shap' | 'lime' | 'integrated_gradients'
    top_n: number
  }
}

export interface TextProcessingConfig {
  tokenization: string
  lowercase: boolean
  remove_stopwords: boolean
  stemming: boolean
  lemmatization: boolean
  n_grams: number[]
  vectorization: 'tfidf' | 'count' | 'word2vec' | 'bert'
  max_features: number
}

export interface NumericalProcessingConfig {
  scaling: 'standard' | 'minmax' | 'robust' | 'none'
  outlier_handling: 'remove' | 'cap' | 'transform' | 'none'
  missing_value_strategy: 'mean' | 'median' | 'mode' | 'interpolate' | 'drop'
  binning: {
    enabled: boolean
    n_bins: number
    strategy: 'uniform' | 'quantile' | 'kmeans'
  }
}

export interface CategoricalProcessingConfig {
  encoding: 'onehot' | 'label' | 'target' | 'ordinal' | 'binary'
  handle_unknown: 'error' | 'ignore' | 'drop'
  rare_category_threshold: number
  missing_value_strategy: 'most_frequent' | 'constant' | 'drop'
}

export interface CustomFeature {
  name: string
  description: string
  feature_type: 'numerical' | 'categorical' | 'text' | 'datetime'
  extraction_logic: string
  dependencies: string[]
}

export interface TrainingConfig {
  dataset_config: DatasetConfig
  splitting_strategy: {
    train_ratio: number
    validation_ratio: number
    test_ratio: number
    stratify: boolean
    random_state: number
  }
  training_parameters: {
    batch_size: number
    epochs: number
    learning_rate: number
    regularization: RegularizationConfig
  }
  optimization: {
    optimizer: string
    loss_function: string
    metrics: string[]
    early_stopping: boolean
  }
  infrastructure: {
    compute_type: 'cpu' | 'gpu' | 'tpu'
    memory_limit: string
    timeout_minutes: number
    parallel_workers: number
  }
}

export interface RegularizationConfig {
  l1_ratio: number
  l2_ratio: number
  dropout_rate: number
  batch_normalization: boolean
}

export interface DatasetConfig {
  source_type: 'database' | 'file' | 'api' | 'stream'
  connection_config: Record<string, any>
  query_config?: {
    sql_query?: string
    filters?: FilterParams[]
    date_range?: {
      start_date: string
      end_date: string
    }
  }
  preprocessing: {
    data_validation: boolean
    duplicate_handling: 'remove' | 'keep_first' | 'keep_last'
    quality_checks: DataQualityCheck[]
  }
}

export interface DataQualityCheck {
  check_type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness'
  threshold: number
  action: 'warn' | 'fail' | 'auto_fix'
  parameters: Record<string, any>
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production'
  scaling: {
    min_instances: number
    max_instances: number
    auto_scaling: boolean
    cpu_threshold: number
    memory_threshold: number
  }
  monitoring: {
    performance_monitoring: boolean
    drift_detection: boolean
    alert_thresholds: AlertThreshold[]
  }
  rollback: {
    enabled: boolean
    criteria: RollbackCriteria[]
  }
}

export interface AlertThreshold {
  metric: string
  threshold: number
  comparison: 'gt' | 'lt' | 'eq'
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export interface RollbackCriteria {
  metric: string
  threshold: number
  time_window: number
  action: 'alert' | 'rollback' | 'scale_down'
}

export interface TrainingJob extends BaseEntity {
  model_config_id: number
  job_name: string
  status: TrainingStatus
  progress: TrainingProgress
  configuration: TrainingConfig
  results?: TrainingResults
  resource_usage: ResourceUsage
  logs: TrainingLog[]
  artifacts: TrainingArtifact[]
}

export interface TrainingProgress {
  current_epoch: number
  total_epochs: number
  current_batch: number
  total_batches: number
  elapsed_time: number
  estimated_remaining_time: number
  current_metrics: Record<string, number>
  best_metrics: Record<string, number>
}

export interface TrainingResults {
  final_metrics: ModelPerformanceMetrics
  feature_importance: FeatureImportance[]
  model_artifacts: ModelArtifact[]
  validation_results: ValidationResults
  business_impact: BusinessImpactAssessment
}

export interface ModelPerformanceMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  auc_roc: number
  auc_pr: number
  confusion_matrix: number[][]
  classification_report: ClassificationReport
  cross_validation_scores: CrossValidationScores
}

export interface ClassificationReport {
  classes: string[]
  precision_per_class: number[]
  recall_per_class: number[]
  f1_per_class: number[]
  support_per_class: number[]
  macro_avg: MetricSummary
  weighted_avg: MetricSummary
}

export interface MetricSummary {
  precision: number
  recall: number
  f1_score: number
  support: number
}

export interface CrossValidationScores {
  mean_scores: Record<string, number>
  std_scores: Record<string, number>
  individual_scores: Record<string, number[]>
}

export interface FeatureImportance {
  feature_name: string
  importance_score: number
  rank: number
  stability_score: number
  business_relevance: number
}

export interface ModelArtifact {
  artifact_type: 'model' | 'preprocessor' | 'encoder' | 'scaler' | 'metadata'
  file_path: string
  file_size: number
  checksum: string
  created_at: string
}

export interface ValidationResults {
  holdout_performance: ModelPerformanceMetrics
  time_series_validation?: TimeSeriesValidation
  data_drift_analysis: DataDriftAnalysis
  model_stability: ModelStabilityAnalysis
}

export interface TimeSeriesValidation {
  walk_forward_validation: WalkForwardResult[]
  temporal_consistency: number
  seasonality_impact: number
}

export interface WalkForwardResult {
  period: string
  metrics: ModelPerformanceMetrics
  data_quality_score: number
}

export interface DataDriftAnalysis {
  drift_detected: boolean
  drift_score: number
  affected_features: string[]
  drift_visualization: DriftVisualization[]
  recommended_actions: string[]
}

export interface DriftVisualization {
  feature_name: string
  drift_type: 'distribution' | 'statistical' | 'correlation'
  drift_magnitude: number
  visualization_data: any
}

export interface ModelStabilityAnalysis {
  stability_score: number
  prediction_consistency: number
  feature_stability: FeatureStabilityMetric[]
  temporal_stability: TemporalStabilityMetric[]
}

export interface FeatureStabilityMetric {
  feature_name: string
  stability_score: number
  variance_ratio: number
  outlier_sensitivity: number
}

export interface TemporalStabilityMetric {
  time_period: string
  stability_score: number
  performance_degradation: number
}

export interface BusinessImpactAssessment {
  cost_savings: CostSavingsAnalysis
  productivity_gains: ProductivityGainsAnalysis
  risk_reduction: RiskReductionAnalysis
  roi_projection: ROIProjection
}

export interface CostSavingsAnalysis {
  automation_savings: number
  error_reduction_savings: number
  resource_optimization_savings: number
  total_annual_savings: number
  confidence_interval: [number, number]
}

export interface ProductivityGainsAnalysis {
  time_savings_hours: number
  process_efficiency_improvement: number
  quality_improvement: number
  user_satisfaction_score: number
}

export interface RiskReductionAnalysis {
  compliance_risk_reduction: number
  security_risk_reduction: number
  operational_risk_reduction: number
  financial_risk_reduction: number
}

export interface ROIProjection {
  initial_investment: number
  annual_benefits: number
  payback_period_months: number
  net_present_value: number
  internal_rate_of_return: number
  risk_adjusted_roi: number
}

export interface MLPrediction extends BaseEntity {
  model_config_id: number
  input_data: Record<string, any>
  prediction_result: PredictionResult
  confidence_score: number
  explanation: PredictionExplanation
  business_context: BusinessContext
  audit_trail: PredictionAuditTrail
}

export interface PredictionResult {
  predicted_class: string
  probability_distribution: Record<string, number>
  prediction_metadata: Record<string, any>
  quality_indicators: QualityIndicator[]
}

export interface QualityIndicator {
  indicator_type: 'confidence' | 'consistency' | 'novelty' | 'drift'
  score: number
  threshold: number
  status: 'good' | 'warning' | 'poor'
  explanation: string
}

export interface PredictionExplanation {
  method: 'shap' | 'lime' | 'integrated_gradients' | 'attention'
  feature_contributions: FeatureContribution[]
  decision_path: DecisionPathNode[]
  counterfactual_examples: CounterfactualExample[]
  global_explanations: GlobalExplanation[]
}

export interface FeatureContribution {
  feature_name: string
  contribution: number
  normalized_contribution: number
  rank: number
  confidence: number
}

export interface DecisionPathNode {
  node_id: string
  feature: string
  threshold: number
  direction: 'left' | 'right'
  samples: number
  probability: Record<string, number>
}

export interface CounterfactualExample {
  original_prediction: string
  alternative_prediction: string
  feature_changes: FeatureChange[]
  feasibility_score: number
}

export interface FeatureChange {
  feature_name: string
  original_value: any
  suggested_value: any
  change_magnitude: number
}

export interface GlobalExplanation {
  explanation_type: 'feature_importance' | 'partial_dependence' | 'interaction'
  visualization_data: any
  interpretation: string
}

export interface BusinessContext {
  use_case: string
  business_unit: string
  decision_impact: 'low' | 'medium' | 'high' | 'critical'
  stakeholders: string[]
  regulatory_requirements: string[]
}

export interface PredictionAuditTrail {
  request_id: string
  user_id: string
  timestamp: string
  model_version: string
  input_hash: string
  processing_time_ms: number
  infrastructure_details: InfrastructureDetails
}

export interface InfrastructureDetails {
  compute_resource: string
  memory_usage: number
  cpu_usage: number
  network_latency: number
}

export interface TrainingLog {
  timestamp: string
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  component: string
  details?: Record<string, any>
}

export interface TrainingArtifact {
  name: string
  type: string
  path: string
  size: number
  metadata: Record<string, any>
}

export interface ModelVersion {
  version: string
  created_at: string
  performance_metrics: ModelPerformanceMetrics
  deployment_status: ModelDeploymentStatus
  change_log: string[]
}

export interface BusinessMetrics {
  business_kpis: BusinessKPI[]
  cost_metrics: CostMetric[]
  quality_metrics: QualityMetric[]
  user_metrics: UserMetric[]
}

export interface BusinessKPI {
  kpi_name: string
  current_value: number
  target_value: number
  trend: 'improving' | 'stable' | 'declining'
  business_impact: string
}

export interface CostMetric {
  metric_name: string
  current_cost: number
  projected_savings: number
  time_period: string
  cost_category: string
}

export interface QualityMetric {
  metric_name: string
  score: number
  benchmark: number
  improvement_trend: number
  quality_dimension: string
}

export interface UserMetric {
  metric_name: string
  user_satisfaction: number
  adoption_rate: number
  usage_frequency: number
  feedback_score: number
}

// ============================================================================
// VERSION 3: AI-INTELLIGENT CLASSIFICATION TYPES
// ============================================================================

export enum AIModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  AWS = 'aws',
  HUGGINGFACE = 'huggingface',
  CUSTOM = 'custom'
}

export enum ConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum KnowledgeEntryType {
  FACTUAL = 'factual',
  PROCEDURAL = 'procedural',
  CONCEPTUAL = 'conceptual',
  METACOGNITIVE = 'metacognitive',
  EXPERIENTIAL = 'experiential'
}

export interface AIModelConfiguration extends BaseEntity {
  name: string
  description: string
  provider: AIModelProvider
  model_name: string
  model_version: string
  capabilities: AICapability[]
  configuration: AIModelConfig
  performance_metrics?: AIPerformanceMetrics
  cost_metrics?: AICostMetrics
  deployment_status: ModelDeploymentStatus
  integration_settings: AIIntegrationSettings
}

export interface AICapability {
  capability_type: 'text_generation' | 'text_classification' | 'conversation' | 'reasoning' | 'analysis'
  supported: boolean
  performance_score: number
  cost_per_request: number
  latency_ms: number
}

export interface AIModelConfig {
  parameters: {
    temperature: number
    max_tokens: number
    top_p: number
    frequency_penalty: number
    presence_penalty: number
    stop_sequences: string[]
  }
  context_window: number
  system_prompt: string
  prompt_templates: PromptTemplate[]
  safety_settings: SafetySettings
  optimization_settings: OptimizationSettings
}

export interface PromptTemplate {
  template_id: string
  name: string
  description: string
  template: string
  variables: PromptVariable[]
  use_case: string
  performance_metrics?: PromptPerformanceMetrics
}

export interface PromptVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  default_value?: any
  description: string
  validation_rules?: ValidationRule[]
}

export interface ValidationRule {
  rule_type: 'min_length' | 'max_length' | 'pattern' | 'range' | 'custom'
  parameters: Record<string, any>
  error_message: string
}

export interface PromptPerformanceMetrics {
  response_quality: number
  response_consistency: number
  token_efficiency: number
  latency_ms: number
  cost_per_execution: number
}

export interface SafetySettings {
  content_filtering: boolean
  bias_detection: boolean
  toxicity_screening: boolean
  pii_protection: boolean
  custom_safety_rules: SafetyRule[]
}

export interface SafetyRule {
  rule_id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: 'warn' | 'block' | 'modify' | 'escalate'
  conditions: RuleCondition[]
}

export interface OptimizationSettings {
  caching_enabled: boolean
  cache_ttl: number
  batching_enabled: boolean
  max_batch_size: number
  retry_policy: RetryPolicy
  rate_limiting: RateLimitingConfig
}

export interface RetryPolicy {
  max_retries: number
  backoff_strategy: 'linear' | 'exponential' | 'fixed'
  base_delay_ms: number
  max_delay_ms: number
}

export interface RateLimitingConfig {
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  burst_allowance: number
}

export interface AIIntegrationSettings {
  webhook_endpoints: WebhookEndpoint[]
  authentication: AuthenticationConfig
  data_privacy: DataPrivacyConfig
  compliance_settings: ComplianceSettings
}

export interface WebhookEndpoint {
  endpoint_id: string
  url: string
  events: string[]
  authentication_method: 'none' | 'basic' | 'bearer' | 'api_key'
  retry_policy: RetryPolicy
}

export interface AuthenticationConfig {
  method: 'api_key' | 'oauth' | 'jwt' | 'certificate'
  credentials: Record<string, any>
  token_refresh_settings?: TokenRefreshSettings
}

export interface TokenRefreshSettings {
  auto_refresh: boolean
  refresh_threshold_minutes: number
  max_refresh_attempts: number
}

export interface DataPrivacyConfig {
  data_residency: string
  encryption_at_rest: boolean
  encryption_in_transit: boolean
  data_retention_days: number
  anonymization_enabled: boolean
  consent_management: boolean
}

export interface ComplianceSettings {
  gdpr_compliance: boolean
  hipaa_compliance: boolean
  sox_compliance: boolean
  custom_compliance_rules: string[]
  audit_logging: boolean
  data_lineage_tracking: boolean
}

export interface AIPerformanceMetrics {
  response_quality: QualityMetrics
  efficiency_metrics: EfficiencyMetrics
  reliability_metrics: ReliabilityMetrics
  user_satisfaction: UserSatisfactionMetrics
}

export interface QualityMetrics {
  accuracy_score: number
  relevance_score: number
  coherence_score: number
  factual_correctness: number
  bias_score: number
  toxicity_score: number
}

export interface EfficiencyMetrics {
  average_response_time_ms: number
  token_efficiency: number
  cache_hit_rate: number
  throughput_per_second: number
  cost_per_request: number
}

export interface ReliabilityMetrics {
  uptime_percentage: number
  error_rate: number
  timeout_rate: number
  retry_success_rate: number
  availability_score: number
}

export interface UserSatisfactionMetrics {
  user_rating: number
  task_completion_rate: number
  user_retention_rate: number
  feature_adoption_rate: number
  support_ticket_volume: number
}

export interface AICostMetrics {
  total_cost: number
  cost_per_request: number
  cost_per_token: number
  cost_breakdown: CostBreakdown
  cost_optimization_opportunities: CostOptimization[]
}

export interface CostBreakdown {
  compute_cost: number
  api_cost: number
  storage_cost: number
  bandwidth_cost: number
  support_cost: number
}

export interface CostOptimization {
  optimization_type: 'caching' | 'batching' | 'model_selection' | 'prompt_optimization'
  potential_savings: number
  implementation_effort: 'low' | 'medium' | 'high'
  risk_level: 'low' | 'medium' | 'high'
  description: string
}

export interface Conversation extends BaseEntity {
  ai_model_id: number
  conversation_id: string
  status: ConversationStatus
  context: ConversationContext
  messages: ConversationMessage[]
  workflow_state: ConversationWorkflowState
  performance_metrics: ConversationMetrics
  business_context: ConversationBusinessContext
}

export interface ConversationContext {
  user_id: string
  session_id: string
  domain: string
  use_case: string
  classification_context: ClassificationContext
  knowledge_context: KnowledgeContext[]
  temporal_context: TemporalContext
}

export interface ClassificationContext {
  active_frameworks: number[]
  classification_history: ClassificationResult[]
  current_classification_task?: ClassificationTask
  user_preferences: UserPreferences
}

export interface ClassificationTask {
  task_id: string
  task_type: 'single_classification' | 'bulk_classification' | 'model_training' | 'analysis'
  data_source: string
  requirements: TaskRequirements
  progress: TaskProgress
}

export interface TaskRequirements {
  accuracy_threshold: number
  processing_time_limit: number
  compliance_requirements: string[]
  business_constraints: string[]
}

export interface TaskProgress {
  current_step: string
  completion_percentage: number
  estimated_time_remaining: number
  intermediate_results: any[]
}

export interface UserPreferences {
  preferred_explanation_level: 'basic' | 'intermediate' | 'advanced'
  notification_preferences: NotificationPreferences
  ui_preferences: UIPreferences
  workflow_preferences: WorkflowPreferences
}

export interface NotificationPreferences {
  enabled_channels: string[]
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  severity_threshold: 'info' | 'warning' | 'error' | 'critical'
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto'
  layout: 'compact' | 'comfortable' | 'spacious'
  default_views: string[]
  customizations: Record<string, any>
}

export interface WorkflowPreferences {
  auto_advance_steps: boolean
  confirmation_prompts: boolean
  save_drafts_automatically: boolean
  preferred_workflow_templates: string[]
}

export interface KnowledgeContext {
  knowledge_id: string
  relevance_score: number
  knowledge_type: KnowledgeEntryType
  content_summary: string
  last_accessed: string
}

export interface TemporalContext {
  session_start_time: string
  last_activity_time: string
  timezone: string
  business_hours: BusinessHours
  seasonal_factors: string[]
}

export interface BusinessHours {
  start_time: string
  end_time: string
  days_of_week: number[]
  holidays: string[]
}

export interface ConversationMessage extends BaseEntity {
  conversation_id: string
  message_type: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  metadata: MessageMetadata
  attachments: MessageAttachment[]
  feedback?: MessageFeedback
  processing_details: MessageProcessingDetails
}

export interface MessageMetadata {
  token_count: number
  processing_time_ms: number
  model_version: string
  prompt_template_id?: string
  confidence_score: number
  intent_classification: IntentClassification
  entity_extraction: EntityExtraction[]
}

export interface IntentClassification {
  primary_intent: string
  confidence: number
  alternative_intents: AlternativeIntent[]
  intent_hierarchy: string[]
}

export interface AlternativeIntent {
  intent: string
  confidence: number
  explanation: string
}

export interface EntityExtraction {
  entity_type: string
  entity_value: string
  confidence: number
  start_position: number
  end_position: number
  context: string
}

export interface MessageAttachment {
  attachment_id: string
  file_name: string
  file_type: string
  file_size: number
  content_preview?: string
  analysis_results?: AttachmentAnalysis
}

export interface AttachmentAnalysis {
  content_type: string
  extracted_text?: string
  detected_entities: EntityExtraction[]
  classification_suggestions: ClassificationSuggestion[]
  quality_score: number
}

export interface ClassificationSuggestion {
  category: string
  confidence: number
  reasoning: string
  supporting_evidence: string[]
}

export interface MessageFeedback {
  rating: number
  feedback_type: 'helpful' | 'not_helpful' | 'incorrect' | 'inappropriate'
  comments?: string
  suggested_improvements?: string[]
  timestamp: string
}

export interface MessageProcessingDetails {
  processing_stages: ProcessingStage[]
  resource_usage: ResourceUsage
  error_details?: ErrorDetails
  optimization_applied: string[]
}

export interface ProcessingStage {
  stage_name: string
  start_time: string
  end_time: string
  duration_ms: number
  success: boolean
  details: Record<string, any>
}

export interface ErrorDetails {
  error_code: string
  error_message: string
  error_category: 'input' | 'processing' | 'model' | 'system'
  recovery_actions: string[]
  escalation_required: boolean
}

export interface ConversationWorkflowState {
  current_workflow: string
  workflow_step: string
  workflow_progress: number
  workflow_context: Record<string, any>
  available_actions: WorkflowAction[]
  workflow_history: WorkflowHistoryEntry[]
}

export interface WorkflowAction {
  action_id: string
  action_type: string
  action_name: string
  description: string
  parameters: Record<string, any>
  prerequisites: string[]
  estimated_duration: number
}

export interface WorkflowHistoryEntry {
  step_name: string
  timestamp: string
  duration_ms: number
  outcome: 'success' | 'failure' | 'skipped'
  details: Record<string, any>
}

export interface ConversationMetrics {
  total_messages: number
  average_response_time: number
  user_satisfaction_score: number
  task_completion_rate: number
  error_rate: number
  cost_metrics: ConversationCostMetrics
}

export interface ConversationCostMetrics {
  total_cost: number
  cost_per_message: number
  token_usage: TokenUsage
  efficiency_score: number
}

export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost_per_token: number
}

export interface ConversationBusinessContext {
  business_objective: string
  success_criteria: string[]
  stakeholders: string[]
  priority_level: 'low' | 'medium' | 'high' | 'critical'
  deadline?: string
  budget_constraints?: BudgetConstraints
}

export interface BudgetConstraints {
  max_cost: number
  cost_center: string
  approval_required: boolean
  cost_tracking_enabled: boolean
}

export interface KnowledgeEntry extends BaseEntity {
  title: string
  content: string
  knowledge_type: KnowledgeEntryType
  domain: string
  category: string
  tags: string[]
  structured_content: StructuredContent
  relevance_metrics: RelevanceMetrics
  quality_metrics: KnowledgeQualityMetrics
  access_control: AccessControl
  lifecycle_management: LifecycleManagement
}

export interface StructuredContent {
  key_concepts: KeyConcept[]
  relationships: KnowledgeRelationship[]
  procedures: Procedure[]
  examples: Example[]
  references: Reference[]
}

export interface KeyConcept {
  concept_id: string
  name: string
  definition: string
  synonyms: string[]
  related_concepts: string[]
  importance_score: number
}

export interface KnowledgeRelationship {
  relationship_id: string
  source_concept: string
  target_concept: string
  relationship_type: 'depends_on' | 'part_of' | 'similar_to' | 'opposite_to' | 'causes' | 'enables'
  strength: number
  confidence: number
}

export interface Procedure {
  procedure_id: string
  name: string
  description: string
  steps: ProcedureStep[]
  prerequisites: string[]
  expected_outcomes: string[]
  success_criteria: string[]
}

export interface ProcedureStep {
  step_number: number
  description: string
  action_type: 'manual' | 'automated' | 'decision' | 'validation'
  parameters: Record<string, any>
  validation_criteria: string[]
  error_handling: string[]
}

export interface Example {
  example_id: string
  title: string
  description: string
  input_data: any
  expected_output: any
  explanation: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
}

export interface Reference {
  reference_id: string
  title: string
  source: string
  url?: string
  publication_date?: string
  relevance_score: number
  credibility_score: number
}

export interface RelevanceMetrics {
  usage_frequency: number
  user_rating: number
  click_through_rate: number
  search_ranking: number
  contextual_relevance: ContextualRelevance[]
}

export interface ContextualRelevance {
  context: string
  relevance_score: number
  last_updated: string
  confidence: number
}

export interface KnowledgeQualityMetrics {
  accuracy_score: number
  completeness_score: number
  currency_score: number
  clarity_score: number
  consistency_score: number
  validation_status: 'pending' | 'validated' | 'rejected' | 'outdated'
}

export interface AccessControl {
  visibility: 'public' | 'internal' | 'restricted' | 'confidential'
  permitted_roles: string[]
  permitted_users: string[]
  access_conditions: AccessCondition[]
  audit_access: boolean
}

export interface AccessCondition {
  condition_type: 'time_based' | 'location_based' | 'context_based' | 'approval_based'
  parameters: Record<string, any>
  description: string
}

export interface LifecycleManagement {
  review_schedule: ReviewSchedule
  deprecation_policy: DeprecationPolicy
  versioning: VersioningPolicy
  maintenance_alerts: MaintenanceAlert[]
}

export interface ReviewSchedule {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  next_review_date: string
  assigned_reviewers: string[]
  review_criteria: string[]
}

export interface DeprecationPolicy {
  deprecation_triggers: string[]
  notification_period_days: number
  migration_guidance: string
  sunset_date?: string
}

export interface VersioningPolicy {
  version_strategy: 'semantic' | 'timestamp' | 'incremental'
  major_version_triggers: string[]
  backward_compatibility: boolean
  change_approval_required: boolean
}

export interface MaintenanceAlert {
  alert_type: 'review_due' | 'content_outdated' | 'low_usage' | 'quality_degradation'
  severity: 'info' | 'warning' | 'error'
  description: string
  recommended_actions: string[]
  auto_resolve: boolean
}

// ============================================================================
// CROSS-VERSION TYPES
// ============================================================================

export interface ClassificationResult extends BaseEntity {
  classification_type: 'manual' | 'ml' | 'ai' | 'hybrid'
  source_type: 'framework' | 'model' | 'conversation'
  source_id: number
  data_source: DataSource
  classification_output: ClassificationOutput
  confidence_metrics: ConfidenceMetrics
  business_impact: BusinessImpact
  validation_status: ValidationStatus
  audit_trail: AuditTrailEntry[]
}

export interface DataSource {
  source_type: 'database' | 'file' | 'api' | 'stream' | 'manual_input'
  source_identifier: string
  data_format: string
  data_size: number
  data_schema?: DataSchema
  quality_score: number
}

export interface DataSchema {
  fields: SchemaField[]
  primary_key: string[]
  foreign_keys: ForeignKey[]
  constraints: SchemaConstraint[]
}

export interface SchemaField {
  field_name: string
  data_type: string
  nullable: boolean
  default_value?: any
  description?: string
  validation_rules: ValidationRule[]
}

export interface ForeignKey {
  field_name: string
  reference_table: string
  reference_field: string
  constraint_name: string
}

export interface SchemaConstraint {
  constraint_type: 'unique' | 'check' | 'not_null' | 'primary_key' | 'foreign_key'
  fields: string[]
  condition?: string
  error_message: string
}

export interface ClassificationOutput {
  primary_classification: PrimaryClassification
  alternative_classifications: AlternativeClassification[]
  tags: ClassificationTag[]
  metadata: ClassificationMetadata
  recommendations: ClassificationRecommendation[]
}

export interface PrimaryClassification {
  category: string
  subcategory?: string
  sensitivity_level: SensitivityLevel
  confidence: number
  reasoning: string[]
  supporting_evidence: SupportingEvidence[]
}

export interface AlternativeClassification {
  category: string
  subcategory?: string
  sensitivity_level: SensitivityLevel
  confidence: number
  probability_difference: number
  reasoning: string[]
}

export interface ClassificationTag {
  tag_name: string
  tag_value: string
  tag_type: 'system' | 'user' | 'automatic' | 'compliance'
  confidence: number
  source: string
}

export interface ClassificationMetadata {
  processing_time_ms: number
  model_version?: string
  algorithm_used?: string
  feature_importance?: FeatureImportance[]
  data_quality_indicators: DataQualityIndicator[]
}

export interface DataQualityIndicator {
  indicator_name: string
  score: number
  threshold: number
  status: 'pass' | 'warning' | 'fail'
  impact_on_classification: string
}

export interface ClassificationRecommendation {
  recommendation_type: 'accuracy_improvement' | 'efficiency_optimization' | 'compliance_enhancement'
  description: string
  implementation_effort: 'low' | 'medium' | 'high'
  expected_benefit: string
  priority: number
}

export interface SupportingEvidence {
  evidence_type: 'feature_match' | 'pattern_match' | 'rule_match' | 'model_prediction' | 'expert_knowledge'
  description: string
  confidence: number
  source: string
  details: Record<string, any>
}

export interface ConfidenceMetrics {
  overall_confidence: number
  prediction_confidence: number
  data_quality_confidence: number
  model_confidence?: number
  consistency_score: number
  uncertainty_indicators: UncertaintyIndicator[]
}

export interface UncertaintyIndicator {
  indicator_type: 'data_quality' | 'model_drift' | 'edge_case' | 'conflicting_evidence'
  severity: 'low' | 'medium' | 'high'
  description: string
  mitigation_suggestions: string[]
}

export interface BusinessImpact {
  impact_category: 'operational' | 'compliance' | 'financial' | 'strategic'
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affected_stakeholders: string[]
  risk_assessment: RiskAssessment
  opportunity_assessment: OpportunityAssessment
}

export interface RiskAssessment {
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: RiskFactor[]
  mitigation_strategies: MitigationStrategy[]
  residual_risk: number
}

export interface RiskFactor {
  factor_name: string
  probability: number
  impact: number
  risk_score: number
  description: string
}

export interface MitigationStrategy {
  strategy_name: string
  description: string
  implementation_cost: number
  risk_reduction: number
  timeline: string
}

export interface OpportunityAssessment {
  opportunity_type: string
  potential_value: number
  realization_probability: number
  implementation_requirements: string[]
  success_metrics: string[]
}

export interface ValidationStatus {
  status: 'pending' | 'validated' | 'rejected' | 'requires_review'
  validator: string
  validation_timestamp?: string
  validation_comments?: string
  validation_criteria: ValidationCriteria[]
}

export interface ValidationCriteria {
  criteria_name: string
  criteria_type: 'accuracy' | 'compliance' | 'business_rule' | 'data_quality'
  threshold: number
  actual_value: number
  status: 'pass' | 'fail' | 'warning'
  importance: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditTrailEntry {
  action_id: string
  action_type: string
  timestamp: string
  user_id: string
  action_details: Record<string, any>
  before_state?: any
  after_state?: any
  business_justification?: string
}

// ============================================================================
// UI AND WORKFLOW TYPES
// ============================================================================

export interface NavigationItem {
  id: string
  label: string
  icon?: string
  path?: string
  children?: NavigationItem[]
  permissions?: string[]
  badge?: {
    text: string
    variant: 'default' | 'success' | 'warning' | 'error'
  }
  metadata?: Record<string, any>
}

export interface DashboardWidget {
  widget_id: string
  title: string
  type: 'metric' | 'chart' | 'table' | 'list' | 'progress' | 'status' | 'custom'
  size: 'small' | 'medium' | 'large' | 'extra_large'
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  configuration: WidgetConfiguration
  data_source: WidgetDataSource
  refresh_settings: RefreshSettings
  permissions: string[]
}

export interface WidgetConfiguration {
  display_options: DisplayOptions
  interaction_options: InteractionOptions
  styling_options: StylingOptions
  alert_settings?: AlertSettings
}

export interface DisplayOptions {
  show_title: boolean
  show_legend: boolean
  show_grid: boolean
  animation_enabled: boolean
  responsive: boolean
  custom_formatting: Record<string, any>
}

export interface InteractionOptions {
  clickable: boolean
  hoverable: boolean
  selectable: boolean
  drilldown_enabled: boolean
  export_enabled: boolean
  filter_enabled: boolean
}

export interface StylingOptions {
  color_scheme: string
  font_family: string
  font_size: string
  border_style: string
  shadow_enabled: boolean
  custom_css: string
}

export interface AlertSettings {
  alerts_enabled: boolean
  alert_conditions: AlertCondition[]
  notification_channels: string[]
  escalation_rules: EscalationRule[]
}

export interface AlertCondition {
  condition_id: string
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte'
  threshold: number
  severity: 'info' | 'warning' | 'error' | 'critical'
  message_template: string
}

export interface EscalationRule {
  rule_id: string
  trigger_conditions: string[]
  escalation_delay_minutes: number
  escalation_targets: string[]
  max_escalations: number
}

export interface WidgetDataSource {
  source_type: 'api' | 'database' | 'file' | 'realtime' | 'static'
  connection_details: Record<string, any>
  query_configuration: QueryConfiguration
  data_transformation: DataTransformation[]
  caching_settings: CachingSettings
}

export interface QueryConfiguration {
  query: string
  parameters: Record<string, any>
  filters: FilterParams[]
  sorting: SortParams[]
  pagination: PaginationParams
}

export interface DataTransformation {
  transformation_type: 'filter' | 'aggregate' | 'join' | 'pivot' | 'custom'
  configuration: Record<string, any>
  output_format: string
}

export interface CachingSettings {
  enabled: boolean
  ttl_seconds: number
  cache_key_strategy: 'query_based' | 'time_based' | 'custom'
  invalidation_triggers: string[]
}

export interface RefreshSettings {
  auto_refresh: boolean
  refresh_interval_seconds: number
  refresh_on_focus: boolean
  manual_refresh_enabled: boolean
}

export interface FormConfiguration {
  form_id: string
  title: string
  description?: string
  sections: FormSection[]
  validation_rules: FormValidationRule[]
  submission_settings: SubmissionSettings
  ui_settings: FormUISettings
}

export interface FormSection {
  section_id: string
  title: string
  description?: string
  fields: FormField[]
  conditional_logic?: ConditionalLogic[]
  layout: SectionLayout
}

export interface FormField {
  field_id: string
  name: string
  label: string
  type: FormFieldType
  required: boolean
  default_value?: any
  validation_rules: FieldValidationRule[]
  options?: FieldOption[]
  dependencies?: FieldDependency[]
  help_text?: string
  placeholder?: string
}

export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  DATETIME = 'datetime',
  FILE = 'file',
  JSON = 'json',
  RICH_TEXT = 'rich_text'
}

export interface FieldOption {
  value: any
  label: string
  description?: string
  disabled?: boolean
  group?: string
}

export interface FieldDependency {
  field_id: string
  condition: string
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require'
}

export interface FieldValidationRule {
  rule_type: string
  parameters: Record<string, any>
  error_message: string
  warning_message?: string
}

export interface ConditionalLogic {
  condition: string
  action: 'show' | 'hide' | 'enable' | 'disable'
  target_fields: string[]
}

export interface SectionLayout {
  columns: number
  responsive_breakpoints: ResponsiveBreakpoint[]
  spacing: string
  alignment: 'left' | 'center' | 'right'
}

export interface ResponsiveBreakpoint {
  breakpoint: string
  columns: number
  spacing?: string
}

export interface FormValidationRule {
  rule_id: string
  fields: string[]
  condition: string
  error_message: string
  severity: 'error' | 'warning' | 'info'
}

export interface SubmissionSettings {
  submit_button_text: string
  cancel_button_text?: string
  confirmation_message?: string
  redirect_url?: string
  save_draft_enabled: boolean
  auto_save_enabled: boolean
  auto_save_interval_seconds?: number
}

export interface FormUISettings {
  layout: 'vertical' | 'horizontal' | 'inline'
  size: 'small' | 'medium' | 'large'
  theme: string
  show_progress: boolean
  show_validation_summary: boolean
  animation_enabled: boolean
}

export interface DataTableConfiguration {
  table_id: string
  columns: TableColumn[]
  data_source: TableDataSource
  features: TableFeatures
  styling: TableStyling
  actions: TableAction[]
}

export interface TableColumn {
  column_id: string
  field: string
  header: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'link' | 'custom'
  width?: string
  sortable: boolean
  filterable: boolean
  resizable: boolean
  visible: boolean
  formatter?: ColumnFormatter
  cell_renderer?: string
}

export interface ColumnFormatter {
  type: 'currency' | 'percentage' | 'date' | 'number' | 'text' | 'custom'
  options: Record<string, any>
}

export interface TableDataSource {
  source_type: 'api' | 'array' | 'database'
  configuration: Record<string, any>
  pagination: boolean
  server_side: boolean
  real_time_updates: boolean
}

export interface TableFeatures {
  sorting: boolean
  filtering: boolean
  searching: boolean
  pagination: boolean
  selection: 'none' | 'single' | 'multiple'
  row_grouping: boolean
  column_grouping: boolean
  export: boolean
  print: boolean
}

export interface TableStyling {
  theme: string
  striped_rows: boolean
  bordered: boolean
  hover_effect: boolean
  compact: boolean
  responsive: boolean
  custom_css: string
}

export interface TableAction {
  action_id: string
  label: string
  icon?: string
  type: 'row' | 'bulk' | 'global'
  position: 'inline' | 'dropdown' | 'toolbar'
  permissions: string[]
  confirmation_required: boolean
  handler: string
}

export interface WorkflowDefinition {
  workflow_id: string
  name: string
  description: string
  version: string
  steps: WorkflowStep[]
  transitions: WorkflowTransition[]
  variables: WorkflowVariable[]
  error_handling: ErrorHandlingConfig
  audit_settings: AuditSettings
}

export interface WorkflowStep {
  step_id: string
  name: string
  type: 'form' | 'approval' | 'automated' | 'decision' | 'notification' | 'integration'
  configuration: StepConfiguration
  timeout_settings?: TimeoutSettings
  retry_settings?: RetrySettings
  assignments: StepAssignment[]
}

export interface StepConfiguration {
  form_configuration?: FormConfiguration
  automation_script?: string
  integration_endpoint?: string
  decision_criteria?: DecisionCriteria[]
  notification_template?: NotificationTemplate
  custom_configuration?: Record<string, any>
}

export interface TimeoutSettings {
  timeout_duration: number
  timeout_action: 'escalate' | 'abort' | 'continue' | 'retry'
  escalation_targets?: string[]
}

export interface RetrySettings {
  max_retries: number
  retry_delay: number
  backoff_strategy: 'linear' | 'exponential' | 'constant'
  retry_conditions: string[]
}

export interface StepAssignment {
  assignment_type: 'user' | 'role' | 'group' | 'automatic'
  assignee: string
  assignment_rules: AssignmentRule[]
  delegation_enabled: boolean
}

export interface AssignmentRule {
  rule_type: 'load_balancing' | 'expertise' | 'availability' | 'random'
  parameters: Record<string, any>
  weight: number
}

export interface WorkflowTransition {
  transition_id: string
  from_step: string
  to_step: string
  condition?: string
  trigger: 'automatic' | 'manual' | 'event'
  configuration: Record<string, any>
}

export interface WorkflowVariable {
  variable_id: string
  name: string
  type: string
  scope: 'global' | 'step' | 'user'
  default_value?: any
  validation_rules: ValidationRule[]
}

export interface ErrorHandlingConfig {
  global_error_handler?: string
  step_error_handlers: Record<string, string>
  retry_policy: RetryPolicy
  escalation_rules: EscalationRule[]
}

export interface AuditSettings {
  audit_enabled: boolean
  audit_level: 'minimal' | 'standard' | 'detailed' | 'comprehensive'
  retention_days: number
  audit_fields: string[]
}

export interface DecisionCriteria {
  criteria_id: string
  condition: string
  outcome: string
  weight: number
  explanation: string
}

export interface NotificationTemplate {
  template_id: string
  subject: string
  body: string
  variables: string[]
  channels: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

// ============================================================================
// ML PIPELINE TYPES (For TrainingPipelineManager)
// ============================================================================

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering' | 'custom';
  status: 'training' | 'ready' | 'deployed' | 'archived' | 'failed';
  accuracy: number;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    framework: string;
    algorithm: string;
  };
}

export interface TrainingPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'data_preparation' | 'training' | 'validation' | 'deployment';
  status: 'pending' | 'running' | 'completed' | 'failed';
  dependencies: string[];
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  metadata: {
    createdAt: string;
    createdBy: string;
    tags: string[];
  };
}

export interface PipelineMetrics {
  totalPipelines: number;
  runningPipelines: number;
  completedPipelines: number;
  failedPipelines: number;
  averageExecutionTime: number;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  progress: number;
  logs: string[];
}

export interface TrainingConfiguration {
  modelType: string;
  hyperparameters: HyperparameterConfig;
  dataset: DatasetInfo;
  validation: ValidationConfig;
  deployment: DeploymentConfig;
}

export interface HyperparameterConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: string;
  lossFunction: string;
  [key: string]: any;
}

export interface DatasetInfo {
  id: string;
  name: string;
  size: number;
  features: string[];
  targetColumn: string;
}

export interface ValidationConfig {
  validationSplit: number;
  crossValidation: boolean;
  metrics: string[];
}

export interface MLNotification {
  id: string;
  type: 'training_complete' | 'model_deployed' | 'error' | 'warning';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  read: boolean;
  metadata: {
    createdAt: string;
    userId: string;
  };
}

export interface TrainingJobCreate {
  modelId: string;
  configuration: TrainingConfiguration;
}

export interface PipelineOptimization {
  id: string;
  pipelineId: string;
  type: 'performance' | 'resource' | 'cost';
  status: 'pending' | 'running' | 'completed' | 'failed';
  recommendations: Array<{
    action: string;
    impact: string;
    effort: string;
    priority: number;
  }>;
}

export interface ResourceAllocation {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
  network: number;
}

// ============================================================================
// COMPONENT-COMPATIBLE WRAPPER TYPES
// ============================================================================

// Wrapper interface for TrainingJob that matches component expectations
export interface TrainingJobWrapper {
  id: string;
  name: string;
  modelId: string;
  description?: string;
  status: string;
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  metrics?: {
    accuracy: number;
    loss: number;
  };
  updatedAt: string;
  createdAt: string;
  logs: string[];
  configuration: TrainingConfiguration;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type ClassificationType = 'manual' | 'ml' | 'ai' | 'hybrid'
export type ClassificationVersion = 'v1' | 'v2' | 'v3'
export type UIComponentSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type UIComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
export type ViewMode = 'list' | 'grid' | 'table' | 'chart'
export type ThemeMode = 'light' | 'dark' | 'auto'

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  size?: UIComponentSize
  variant?: UIComponentVariant
  disabled?: boolean
  loading?: boolean
}

export interface DataComponentProps<T = any> extends BaseComponentProps {
  data?: T[]
  loading?: boolean
  error?: string
  onRefresh?: () => void
  onError?: (error: string) => void
}

export interface FormComponentProps extends BaseComponentProps {
  onSubmit?: (data: any) => void
  onCancel?: () => void
  initialValues?: Record<string, any>
  validationSchema?: any
}

export interface ModalComponentProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

// Hook Return Types
export interface UseApiResult<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export interface UseFormResult {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldValue: (field: string, value: any) => void
  setFieldError: (field: string, error: string) => void
  handleSubmit: (e: React.FormEvent) => void
  reset: () => void
  isValid: boolean
  isDirty: boolean
}

export interface UseWorkflowResult {
  currentStep: string
  totalSteps: number
  progress: number
  canGoNext: boolean
  canGoPrevious: boolean
  goNext: () => void
  goPrevious: () => void
  goToStep: (step: string) => void
  reset: () => void
  context: Record<string, any>
  updateContext: (updates: Record<string, any>) => void
}