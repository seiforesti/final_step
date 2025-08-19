// ============================================================================
// ADVANCED SCAN RULE SETS - ORCHESTRATION TYPE DEFINITIONS
// ============================================================================

import { 
  ResourceAllocation, 
  ExecutionContext, 
  WorkflowDefinition,
  JobProgress,
  JobMetrics,
  PerformanceMetrics
} from './scan-rules.types';

// ============================================================================
// ORCHESTRATION CORE TYPES
// ============================================================================

export interface OrchestrationEngine {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  capabilities: OrchestrationCapability[];
  resource_pools: ResourcePool[];
  active_jobs: ActiveJob[];
  performance_metrics: OrchestrationMetrics;
  configuration: OrchestrationConfig;
}

export interface OrchestrationCapability {
  name: string;
  type: 'workflow' | 'scheduling' | 'resource_management' | 'monitoring' | 'optimization';
  enabled: boolean;
  version: string;
  configuration: Record<string, any>;
  dependencies: string[];
}

export interface ResourcePool {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'network' | 'gpu' | 'memory';
  total_capacity: ResourceCapacity;
  available_capacity: ResourceCapacity;
  allocated_capacity: ResourceCapacity;
  utilization_percentage: number;
  performance_metrics: ResourcePoolMetrics;
  scaling_policy: ScalingPolicy;
  cost_per_unit: number;
}

export interface ResourceCapacity {
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  network_gbps: number;
  gpu_units?: number;
  custom_resources?: Record<string, number>;
}

export interface ActiveJob {
  job_id: string;
  name: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  resource_allocation: ResourceAllocation;
  progress: JobProgress;
  estimated_completion: string;
  dependencies: JobDependency[];
  performance_metrics: JobPerformanceMetrics;
}

export interface JobDependency {
  job_id: string;
  dependency_type: 'hard' | 'soft' | 'conditional';
  condition?: string;
  status: 'pending' | 'satisfied' | 'failed';
  wait_timeout?: number;
}

export interface JobPerformanceMetrics {
  execution_time_ms: number;
  resource_efficiency: number;
  throughput_rate: number;
  error_rate: number;
  quality_score: number;
  cost_efficiency: number;
}

// ============================================================================
// WORKFLOW ORCHESTRATION TYPES
// ============================================================================

export interface WorkflowOrchestrator {
  id: string;
  name: string;
  workflow_templates: WorkflowTemplate[];
  active_workflows: ActiveWorkflow[];
  execution_history: WorkflowExecution[];
  performance_analytics: WorkflowAnalytics;
  optimization_settings: WorkflowOptimization;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'data_processing' | 'validation' | 'compliance' | 'quality_check' | 'custom';
  definition: WorkflowDefinition;
  default_parameters: Record<string, any>;
  resource_requirements: ResourceRequirements;
  estimated_duration: number;
  complexity_score: number;
  usage_statistics: TemplateUsageStats;
}

export interface ActiveWorkflow {
  workflow_id: string;
  template_id: string;
  instance_id: string;
  name: string;
  status: 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  current_step: string;
  progress: WorkflowProgress;
  execution_context: ExecutionContext;
  resource_allocation: ResourceAllocation;
  performance_metrics: WorkflowPerformanceMetrics;
  error_details?: WorkflowError;
}

export interface WorkflowProgress {
  percentage_complete: number;
  steps_completed: number;
  total_steps: number;
  current_step_name: string;
  current_step_progress: number;
  estimated_completion_time: string;
  elapsed_time_ms: number;
  throughput_metrics: ThroughputMetrics;
}

export interface WorkflowPerformanceMetrics {
  total_execution_time: number;
  step_execution_times: Record<string, number>;
  resource_utilization: ResourceUtilizationMetrics;
  throughput_rate: number;
  error_count: number;
  warning_count: number;
  quality_metrics: WorkflowQualityMetrics;
}

export interface WorkflowError {
  error_code: string;
  error_message: string;
  step_id: string;
  timestamp: string;
  stack_trace?: string;
  recovery_suggestions: string[];
  retry_count: number;
  max_retries: number;
}

// ============================================================================
// SCHEDULING TYPES
// ============================================================================

export interface SchedulingEngine {
  id: string;
  name: string;
  scheduler_type: 'cron' | 'event_driven' | 'dependency_based' | 'ai_optimized';
  active_schedules: Schedule[];
  scheduling_policies: SchedulingPolicy[];
  performance_metrics: SchedulingMetrics;
  optimization_settings: SchedulingOptimization;
}

export interface Schedule {
  id: string;
  name: string;
  description: string;
  type: 'recurring' | 'one_time' | 'conditional' | 'event_triggered';
  cron_expression?: string;
  trigger_conditions?: TriggerCondition[];
  target_workflow: string;
  parameters: Record<string, any>;
  resource_requirements: ResourceRequirements;
  priority: number;
  enabled: boolean;
  next_execution: string;
  last_execution?: ScheduleExecution;
  execution_history: ScheduleExecution[];
}

export interface TriggerCondition {
  type: 'data_arrival' | 'file_change' | 'api_call' | 'metric_threshold' | 'time_window';
  configuration: Record<string, any>;
  enabled: boolean;
  last_triggered?: string;
}

export interface ScheduleExecution {
  execution_id: string;
  scheduled_time: string;
  actual_start_time: string;
  completion_time?: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'skipped';
  duration_ms?: number;
  resource_usage: ResourceUsageMetrics;
  performance_metrics: ExecutionPerformanceMetrics;
  error_details?: ExecutionError;
}

export interface SchedulingPolicy {
  name: string;
  type: 'priority_based' | 'resource_aware' | 'deadline_driven' | 'cost_optimized';
  configuration: Record<string, any>;
  enabled: boolean;
  effectiveness_score: number;
}

// ============================================================================
// RESOURCE MANAGEMENT TYPES
// ============================================================================

export interface ResourceManager {
  id: string;
  name: string;
  resource_pools: ResourcePool[];
  allocation_strategies: AllocationStrategy[];
  monitoring_settings: ResourceMonitoringSettings;
  optimization_policies: ResourceOptimizationPolicy[];
  cost_tracking: ResourceCostTracking;
}

export interface AllocationStrategy {
  name: string;
  type: 'first_fit' | 'best_fit' | 'worst_fit' | 'round_robin' | 'priority_based' | 'ai_optimized';
  configuration: Record<string, any>;
  enabled: boolean;
  performance_metrics: AllocationMetrics;
}

export interface ResourceMonitoringSettings {
  monitoring_interval_seconds: number;
  metrics_retention_days: number;
  alert_thresholds: AlertThreshold[];
  custom_metrics: CustomMetric[];
  dashboard_configuration: MonitoringDashboardConfig;
}

export interface AlertThreshold {
  metric_name: string;
  threshold_value: number;
  comparison: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  severity: 'info' | 'warning' | 'critical';
  notification_channels: string[];
  cooldown_period_minutes: number;
}

export interface CustomMetric {
  name: string;
  description: string;
  calculation_method: string;
  unit: string;
  collection_interval_seconds: number;
  retention_days: number;
}

export interface ResourceOptimizationPolicy {
  name: string;
  type: 'cost_optimization' | 'performance_optimization' | 'utilization_optimization' | 'energy_efficiency';
  enabled: boolean;
  configuration: Record<string, any>;
  optimization_targets: OptimizationTarget[];
  effectiveness_metrics: OptimizationEffectiveness;
}

export interface OptimizationTarget {
  metric: string;
  target_value: number;
  current_value: number;
  improvement_percentage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
}

export interface OptimizationEffectiveness {
  cost_savings_percentage: number;
  performance_improvement_percentage: number;
  resource_utilization_improvement: number;
  energy_savings_percentage: number;
  optimization_success_rate: number;
}

// ============================================================================
// MONITORING & ANALYTICS TYPES
// ============================================================================

export interface OrchestrationMonitoring {
  real_time_metrics: RealTimeMetrics;
  historical_analytics: HistoricalAnalytics;
  predictive_insights: PredictiveInsights;
  alerting_system: AlertingSystem;
  dashboard_configuration: DashboardConfiguration;
}

export interface RealTimeMetrics {
  active_jobs_count: number;
  total_resource_utilization: number;
  average_job_duration: number;
  throughput_rate: number;
  error_rate: number;
  system_health_score: number;
  performance_indicators: PerformanceIndicator[];
}

export interface PerformanceIndicator {
  name: string;
  value: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
}

export interface HistoricalAnalytics {
  time_series_data: TimeSeriesMetric[];
  trend_analysis: TrendAnalysis[];
  pattern_recognition: PatternRecognitionResult[];
  comparative_analysis: ComparativeAnalysis[];
  seasonal_patterns: SeasonalPattern[];
}

export interface TimeSeriesMetric {
  metric_name: string;
  data_points: TimeSeriesDataPoint[];
  aggregation_interval: string;
  retention_period: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  metric_name: string;
  trend_direction: 'upward' | 'downward' | 'stable' | 'volatile';
  trend_strength: number;
  confidence_level: number;
  forecast_values: ForecastValue[];
  trend_change_points: TrendChangePoint[];
}

export interface ForecastValue {
  timestamp: string;
  predicted_value: number;
  confidence_interval: [number, number];
  accuracy_score: number;
}

export interface TrendChangePoint {
  timestamp: string;
  change_type: 'increase' | 'decrease' | 'volatility_change';
  significance_level: number;
  impact_magnitude: number;
}

export interface PatternRecognitionResult {
  pattern_type: 'periodic' | 'seasonal' | 'anomaly' | 'correlation' | 'causation';
  description: string;
  confidence_score: number;
  frequency: string;
  impact_assessment: string;
  recommended_actions: string[];
}

// ============================================================================
// OPTIMIZATION TYPES
// ============================================================================

export interface OrchestrationOptimization {
  optimization_engine: OptimizationEngine;
  optimization_strategies: OptimizationStrategy[];
  performance_baselines: PerformanceBaseline[];
  optimization_history: OptimizationHistory[];
  ai_recommendations: AIRecommendation[];
}

export interface OptimizationEngine {
  engine_type: 'rule_based' | 'ml_based' | 'hybrid' | 'genetic_algorithm';
  version: string;
  configuration: Record<string, any>;
  learning_rate: number;
  optimization_frequency: string;
  performance_metrics: OptimizationEngineMetrics;
}

export interface OptimizationStrategy {
  name: string;
  type: 'workflow_optimization' | 'resource_optimization' | 'scheduling_optimization' | 'cost_optimization';
  description: string;
  enabled: boolean;
  configuration: Record<string, any>;
  success_metrics: SuccessMetric[];
  implementation_status: 'planned' | 'implementing' | 'active' | 'completed' | 'failed';
}

export interface SuccessMetric {
  metric_name: string;
  baseline_value: number;
  target_value: number;
  current_value: number;
  improvement_percentage: number;
  measurement_unit: string;
}

export interface PerformanceBaseline {
  baseline_id: string;
  name: string;
  description: string;
  measurement_period: string;
  metrics: BaselineMetric[];
  established_date: string;
  validity_period: string;
  confidence_level: number;
}

export interface BaselineMetric {
  metric_name: string;
  average_value: number;
  median_value: number;
  percentile_95: number;
  percentile_99: number;
  standard_deviation: number;
  sample_size: number;
}

export interface AIRecommendation {
  recommendation_id: string;
  type: 'performance_improvement' | 'cost_reduction' | 'resource_optimization' | 'workflow_enhancement';
  title: string;
  description: string;
  confidence_score: number;
  potential_impact: ImpactAssessment;
  implementation_complexity: 'low' | 'medium' | 'high';
  estimated_implementation_time: string;
  prerequisites: string[];
  implementation_steps: ImplementationStep[];
  risk_assessment: RiskAssessment;
}

export interface ImpactAssessment {
  performance_improvement_percentage: number;
  cost_savings_percentage: number;
  resource_efficiency_gain: number;
  quality_improvement_score: number;
  business_value_score: number;
}

export interface ImplementationStep {
  step_number: number;
  description: string;
  estimated_duration: string;
  required_resources: string[];
  dependencies: string[];
  validation_criteria: string[];
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'medium' | 'high';
  risk_factors: RiskFactor[];
  mitigation_strategies: MitigationStrategy[];
  rollback_plan: RollbackPlan;
}

export interface RiskFactor {
  factor_name: string;
  probability: number;
  impact_severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation_actions: string[];
}

export interface MitigationStrategy {
  strategy_name: string;
  description: string;
  implementation_cost: number;
  effectiveness_rating: number;
  implementation_timeline: string;
}

export interface RollbackPlan {
  rollback_triggers: string[];
  rollback_steps: string[];
  estimated_rollback_time: string;
  data_backup_requirements: string[];
  validation_steps: string[];
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface OrchestrationIntegration {
  integration_points: IntegrationPoint[];
  api_gateways: APIGateway[];
  event_streams: EventStream[];
  message_brokers: MessageBroker[];
  external_systems: ExternalSystem[];
}

export interface IntegrationPoint {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'message_queue' | 'database' | 'file_system' | 'event_stream';
  configuration: IntegrationConfiguration;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  performance_metrics: IntegrationMetrics;
  security_settings: SecuritySettings;
}

export interface IntegrationConfiguration {
  endpoint_url?: string;
  authentication: AuthenticationConfig;
  timeout_settings: TimeoutSettings;
  retry_policy: RetryPolicy;
  data_format: 'json' | 'xml' | 'csv' | 'binary' | 'custom';
  compression: 'none' | 'gzip' | 'deflate' | 'brotli';
  encryption: EncryptionConfig;
}

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer_token' | 'oauth2' | 'api_key' | 'certificate';
  credentials: Record<string, string>;
  refresh_token_settings?: RefreshTokenSettings;
}

export interface TimeoutSettings {
  connection_timeout_ms: number;
  read_timeout_ms: number;
  write_timeout_ms: number;
  total_timeout_ms: number;
}

export interface RetryPolicy {
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed' | 'custom';
  base_delay_ms: number;
  max_delay_ms: number;
  retry_conditions: string[];
  circuit_breaker_settings?: CircuitBreakerSettings;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  key_management: 'static' | 'rotating' | 'hsm' | 'cloud_kms';
  certificate_validation: boolean;
}

export interface RefreshTokenSettings {
  auto_refresh: boolean;
  refresh_threshold_minutes: number;
  max_refresh_attempts: number;
}

export interface CircuitBreakerSettings {
  failure_threshold: number;
  recovery_timeout_ms: number;
  half_open_max_calls: number;
  monitoring_window_ms: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface OrchestrationMetrics {
  total_jobs_processed: number;
  average_job_duration: number;
  success_rate: number;
  resource_efficiency: number;
  cost_per_job: number;
  throughput_rate: number;
  system_availability: number;
  performance_score: number;
}

export interface ResourcePoolMetrics {
  utilization_percentage: number;
  allocation_efficiency: number;
  wait_time_average: number;
  throughput_rate: number;
  cost_efficiency: number;
  failure_rate: number;
}

export interface TemplateUsageStats {
  total_executions: number;
  success_rate: number;
  average_duration: number;
  resource_efficiency: number;
  user_rating: number;
  last_used: string;
}

export interface WorkflowQualityMetrics {
  data_quality_score: number;
  process_compliance_score: number;
  output_accuracy: number;
  completeness_percentage: number;
  consistency_score: number;
}

export interface ResourceUsageMetrics {
  cpu_hours: number;
  memory_gb_hours: number;
  storage_gb_hours: number;
  network_gb: number;
  gpu_hours?: number;
  total_cost: number;
}

export interface ExecutionPerformanceMetrics {
  execution_time_ms: number;
  resource_efficiency: number;
  throughput_rate: number;
  quality_score: number;
  cost_efficiency: number;
  error_count: number;
}

export interface ExecutionError {
  error_code: string;
  error_message: string;
  error_category: 'system' | 'data' | 'configuration' | 'resource' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  recovery_actions: string[];
}

export interface AllocationMetrics {
  allocation_success_rate: number;
  average_allocation_time: number;
  resource_utilization_efficiency: number;
  allocation_cost_efficiency: number;
  wait_time_reduction: number;
}

export interface MonitoringDashboardConfig {
  layout: 'grid' | 'list' | 'custom';
  refresh_interval_seconds: number;
  widgets: DashboardWidget[];
  alert_panels: AlertPanel[];
  custom_charts: CustomChart[];
}

export interface DashboardWidget {
  widget_id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'custom';
  title: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
  refresh_rate: number;
}

export interface AlertPanel {
  panel_id: string;
  title: string;
  alert_types: string[];
  severity_filter: string[];
  auto_refresh: boolean;
  max_alerts_displayed: number;
}

export interface CustomChart {
  chart_id: string;
  chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge';
  title: string;
  metrics: string[];
  time_range: string;
  aggregation: 'sum' | 'average' | 'min' | 'max' | 'count';
  configuration: Record<string, any>;
}

export interface ComparativeAnalysis {
  comparison_type: 'period_over_period' | 'baseline_comparison' | 'peer_comparison';
  baseline_period: string;
  comparison_period: string;
  metrics_compared: string[];
  variance_analysis: VarianceAnalysis[];
  significance_test_results: SignificanceTestResult[];
}

export interface VarianceAnalysis {
  metric_name: string;
  baseline_value: number;
  comparison_value: number;
  absolute_variance: number;
  percentage_variance: number;
  variance_significance: 'significant' | 'not_significant' | 'highly_significant';
}

export interface SignificanceTestResult {
  test_name: string;
  p_value: number;
  confidence_level: number;
  result: 'significant' | 'not_significant';
  interpretation: string;
}

export interface SeasonalPattern {
  pattern_name: string;
  pattern_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  strength: number;
  confidence: number;
  peak_periods: string[];
  trough_periods: string[];
  pattern_stability: number;
}

export interface OptimizationEngineMetrics {
  optimization_success_rate: number;
  average_improvement_percentage: number;
  optimization_cost: number;
  time_to_optimization: number;
  model_accuracy: number;
  learning_progress: number;
}

export interface IntegrationMetrics {
  request_count: number;
  success_rate: number;
  average_response_time: number;
  error_rate: number;
  throughput_rate: number;
  availability_percentage: number;
  data_transfer_volume: number;
}

export interface SecuritySettings {
  encryption_enabled: boolean;
  authentication_required: boolean;
  authorization_policies: string[];
  audit_logging: boolean;
  data_masking_rules: string[];
  compliance_requirements: string[];
}

export interface OrchestrationConfig {
  max_concurrent_jobs: number;
  default_timeout_minutes: number;
  resource_allocation_strategy: string;
  scheduling_algorithm: string;
  monitoring_level: 'basic' | 'detailed' | 'comprehensive';
  optimization_enabled: boolean;
  auto_scaling_enabled: boolean;
  cost_optimization_enabled: boolean;
}

export interface ResourceRequirements {
  min_cpu_cores: number;
  min_memory_gb: number;
  min_storage_gb: number;
  min_network_gbps: number;
  gpu_required: boolean;
  special_requirements: string[];
  estimated_duration_minutes: number;
}

export interface ScalingPolicy {
  auto_scaling_enabled: boolean;
  min_capacity: number;
  max_capacity: number;
  target_utilization: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
  scale_up_cooldown_minutes: number;
  scale_down_cooldown_minutes: number;
  scaling_metric: string;
}

export interface ThroughputMetrics {
  records_per_second: number;
  bytes_per_second: number;
  operations_per_second: number;
  transactions_per_minute: number;
  peak_throughput: number;
  average_throughput: number;
}

export interface ResourceUtilizationMetrics {
  cpu_utilization_percentage: number;
  memory_utilization_percentage: number;
  storage_utilization_percentage: number;
  network_utilization_percentage: number;
  gpu_utilization_percentage?: number;
  overall_efficiency_score: number;
}

export interface SchedulingMetrics {
  total_schedules: number;
  active_schedules: number;
  execution_success_rate: number;
  average_scheduling_latency: number;
  missed_executions: number;
  resource_contention_events: number;
  scheduling_efficiency_score: number;
}

export interface SchedulingOptimization {
  optimization_algorithm: 'genetic' | 'simulated_annealing' | 'particle_swarm' | 'machine_learning';
  optimization_objectives: string[];
  constraint_handling: 'penalty' | 'repair' | 'rejection' | 'adaptive';
  population_size: number;
  max_generations: number;
  convergence_criteria: ConvergenceCriteria;
}

export interface ConvergenceCriteria {
  max_iterations: number;
  improvement_threshold: number;
  stagnation_generations: number;
  target_fitness: number;
  time_limit_minutes: number;
}

export interface OptimizationHistory {
  optimization_id: string;
  timestamp: string;
  optimization_type: string;
  before_metrics: Record<string, number>;
  after_metrics: Record<string, number>;
  improvement_achieved: number;
  optimization_cost: number;
  implementation_time: number;
  success: boolean;
  lessons_learned: string[];
}

export interface ResourceCostTracking {
  cost_model: CostModel;
  current_costs: ResourceCosts;
  cost_trends: CostTrend[];
  cost_optimization_opportunities: CostOptimizationOpportunity[];
  budget_tracking: BudgetTracking;
}

export interface CostModel {
  pricing_model: 'pay_per_use' | 'reserved' | 'spot' | 'hybrid';
  cost_components: CostComponent[];
  billing_frequency: 'hourly' | 'daily' | 'monthly';
  currency: string;
  tax_rate: number;
}

export interface CostComponent {
  component_name: string;
  unit_cost: number;
  billing_unit: string;
  minimum_charge: number;
  volume_discounts: VolumeDiscount[];
}

export interface VolumeDiscount {
  threshold: number;
  discount_percentage: number;
  effective_date: string;
  expiry_date?: string;
}

export interface ResourceCosts {
  total_cost: number;
  cost_breakdown: Record<string, number>;
  cost_per_job: number;
  cost_per_hour: number;
  projected_monthly_cost: number;
  cost_efficiency_score: number;
}

export interface CostTrend {
  period: string;
  total_cost: number;
  cost_change_percentage: number;
  cost_drivers: string[];
  optimization_impact: number;
}

export interface CostOptimizationOpportunity {
  opportunity_id: string;
  opportunity_type: 'resource_rightsizing' | 'scheduling_optimization' | 'reserved_capacity' | 'spot_instances';
  description: string;
  potential_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
  payback_period_days: number;
}

export interface BudgetTracking {
  monthly_budget: number;
  current_spend: number;
  projected_spend: number;
  budget_utilization_percentage: number;
  budget_alerts: BudgetAlert[];
  spend_forecast: SpendForecast[];
}

export interface BudgetAlert {
  alert_type: 'threshold_reached' | 'projected_overspend' | 'unusual_spending';
  threshold_percentage: number;
  current_percentage: number;
  alert_message: string;
  recommended_actions: string[];
}

export interface SpendForecast {
  forecast_date: string;
  predicted_spend: number;
  confidence_interval: [number, number];
  forecast_accuracy: number;
}

export interface DashboardConfiguration {
  dashboard_id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refresh_settings: RefreshSettings;
  sharing_settings: SharingSettings;
}

export interface DashboardLayout {
  type: 'grid' | 'flow' | 'custom';
  columns: number;
  row_height: number;
  margin: number;
  responsive: boolean;
}

export interface DashboardFilter {
  filter_id: string;
  name: string;
  type: 'date_range' | 'dropdown' | 'multi_select' | 'text_input' | 'slider';
  configuration: Record<string, any>;
  default_value: any;
  applies_to_widgets: string[];
}

export interface RefreshSettings {
  auto_refresh: boolean;
  refresh_interval_seconds: number;
  refresh_on_focus: boolean;
  refresh_on_data_change: boolean;
}

export interface SharingSettings {
  is_public: boolean;
  shared_with_users: string[];
  shared_with_groups: string[];
  access_level: 'view' | 'edit' | 'admin';
  expiry_date?: string;
}

export interface AlertingSystem {
  alert_rules: AlertRule[];
  notification_channels: NotificationChannel[];
  alert_history: AlertHistory[];
  escalation_policies: EscalationPolicy[];
  alert_analytics: AlertAnalytics;
}

export interface AlertRule {
  rule_id: string;
  name: string;
  description: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  evaluation_interval_seconds: number;
  notification_channels: string[];
  suppression_rules: SuppressionRule[];
}

export interface SuppressionRule {
  condition: string;
  duration_minutes: number;
  reason: string;
}

export interface NotificationChannel {
  channel_id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'push_notification';
  name: string;
  configuration: Record<string, any>;
  enabled: boolean;
  rate_limiting: RateLimiting;
}

export interface RateLimiting {
  max_notifications_per_hour: number;
  burst_limit: number;
  cooldown_period_minutes: number;
}

export interface AlertHistory {
  alert_id: string;
  rule_id: string;
  timestamp: string;
  severity: string;
  message: string;
  status: 'active' | 'resolved' | 'suppressed';
  resolution_time?: string;
  acknowledged_by?: string;
  resolution_notes?: string;
}

export interface EscalationPolicy {
  policy_id: string;
  name: string;
  escalation_levels: EscalationLevel[];
  default_assignee: string;
  timeout_minutes: number;
}

export interface EscalationLevel {
  level: number;
  assignees: string[];
  notification_channels: string[];
  timeout_minutes: number;
  escalation_condition: string;
}

export interface AlertAnalytics {
  total_alerts: number;
  alerts_by_severity: Record<string, number>;
  alert_resolution_time: number;
  false_positive_rate: number;
  alert_fatigue_score: number;
  top_alert_sources: AlertSource[];
}

export interface AlertSource {
  source: string;
  alert_count: number;
  average_severity: number;
  resolution_rate: number;
}

// ============================================================================
// API INTEGRATION TYPES
// ============================================================================

export interface APIGateway {
  gateway_id: string;
  name: string;
  version: string;
  endpoints: APIEndpoint[];
  security_policies: SecurityPolicy[];
  rate_limiting: APIRateLimiting;
  monitoring: APIMonitoring;
  caching: APICaching;
}

export interface APIEndpoint {
  endpoint_id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  authentication_required: boolean;
  rate_limit: number;
  timeout_ms: number;
  caching_enabled: boolean;
  monitoring_enabled: boolean;
}

export interface SecurityPolicy {
  policy_id: string;
  name: string;
  type: 'authentication' | 'authorization' | 'encryption' | 'rate_limiting';
  configuration: Record<string, any>;
  enabled: boolean;
  applies_to_endpoints: string[];
}

export interface APIRateLimiting {
  global_rate_limit: number;
  per_user_rate_limit: number;
  burst_limit: number;
  time_window_seconds: number;
  rate_limiting_algorithm: 'token_bucket' | 'sliding_window' | 'fixed_window';
}

export interface APIMonitoring {
  request_logging: boolean;
  response_logging: boolean;
  performance_tracking: boolean;
  error_tracking: boolean;
  metrics_collection: APIMetricsCollection;
}

export interface APIMetricsCollection {
  request_count: boolean;
  response_time: boolean;
  error_rate: boolean;
  throughput: boolean;
  payload_size: boolean;
  custom_metrics: string[];
}

export interface APICaching {
  enabled: boolean;
  cache_type: 'memory' | 'redis' | 'memcached' | 'cdn';
  default_ttl_seconds: number;
  cache_key_strategy: 'url_based' | 'header_based' | 'custom';
  cache_invalidation: CacheInvalidation;
}

export interface CacheInvalidation {
  strategy: 'ttl' | 'manual' | 'event_driven' | 'dependency_based';
  invalidation_rules: InvalidationRule[];
}

export interface InvalidationRule {
  trigger: string;
  cache_keys: string[];
  cascade: boolean;
}

export interface EventStream {
  stream_id: string;
  name: string;
  type: 'kafka' | 'kinesis' | 'event_hub' | 'pubsub' | 'custom';
  configuration: EventStreamConfiguration;
  topics: EventTopic[];
  consumers: EventConsumer[];
  producers: EventProducer[];
  monitoring: EventStreamMonitoring;
}

export interface EventStreamConfiguration {
  bootstrap_servers: string[];
  security_protocol: string;
  serialization_format: 'json' | 'avro' | 'protobuf' | 'binary';
  compression: 'none' | 'gzip' | 'snappy' | 'lz4';
  batch_size: number;
  buffer_memory: number;
  retry_settings: EventRetrySettings;
}

export interface EventRetrySettings {
  max_retries: number;
  retry_backoff_ms: number;
  delivery_timeout_ms: number;
  enable_idempotence: boolean;
}

export interface EventTopic {
  topic_name: string;
  partition_count: number;
  replication_factor: number;
  retention_ms: number;
  cleanup_policy: 'delete' | 'compact';
  schema: EventSchema;
}

export interface EventSchema {
  schema_id: string;
  version: string;
  format: 'json_schema' | 'avro' | 'protobuf';
  definition: string;
  compatibility: 'backward' | 'forward' | 'full' | 'none';
}

export interface EventConsumer {
  consumer_id: string;
  group_id: string;
  topics: string[];
  auto_offset_reset: 'earliest' | 'latest';
  enable_auto_commit: boolean;
  max_poll_records: number;
  processing_mode: 'at_least_once' | 'at_most_once' | 'exactly_once';
}

export interface EventProducer {
  producer_id: string;
  client_id: string;
  acks: 'none' | 'leader' | 'all';
  retries: number;
  batch_size: number;
  linger_ms: number;
  compression_type: string;
}

export interface EventStreamMonitoring {
  lag_monitoring: boolean;
  throughput_monitoring: boolean;
  error_monitoring: boolean;
  schema_evolution_tracking: boolean;
  consumer_group_monitoring: boolean;
}

export interface MessageBroker {
  broker_id: string;
  name: string;
  type: 'rabbitmq' | 'activemq' | 'apache_pulsar' | 'amazon_sqs' | 'custom';
  configuration: MessageBrokerConfiguration;
  queues: MessageQueue[];
  exchanges: MessageExchange[];
  bindings: MessageBinding[];
  monitoring: MessageBrokerMonitoring;
}

export interface MessageBrokerConfiguration {
  connection_url: string;
  virtual_host: string;
  authentication: MessageBrokerAuth;
  connection_pooling: ConnectionPooling;
  message_persistence: boolean;
  clustering_enabled: boolean;
}

export interface MessageBrokerAuth {
  username: string;
  password: string;
  ssl_enabled: boolean;
  certificate_path?: string;
}

export interface ConnectionPooling {
  max_connections: number;
  connection_timeout_ms: number;
  idle_timeout_ms: number;
  max_idle_connections: number;
}

export interface MessageQueue {
  queue_name: string;
  durable: boolean;
  exclusive: boolean;
  auto_delete: boolean;
  arguments: Record<string, any>;
  message_ttl: number;
  max_length: number;
  dead_letter_exchange?: string;
}

export interface MessageExchange {
  exchange_name: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  durable: boolean;
  auto_delete: boolean;
  arguments: Record<string, any>;
}

export interface MessageBinding {
  queue_name: string;
  exchange_name: string;
  routing_key: string;
  arguments: Record<string, any>;
}

export interface MessageBrokerMonitoring {
  queue_depth_monitoring: boolean;
  message_rate_monitoring: boolean;
  consumer_monitoring: boolean;
  connection_monitoring: boolean;
  memory_usage_monitoring: boolean;
}

export interface ExternalSystem {
  system_id: string;
  name: string;
  type: 'database' | 'api_service' | 'file_system' | 'cloud_service' | 'legacy_system';
  connection_details: ExternalSystemConnection;
  capabilities: SystemCapability[];
  integration_status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  health_check: SystemHealthCheck;
  performance_metrics: SystemPerformanceMetrics;
}

export interface ExternalSystemConnection {
  connection_string: string;
  authentication: AuthenticationConfig;
  connection_pooling: ConnectionPoolingConfig;
  ssl_configuration: SSLConfiguration;
  proxy_settings?: ProxySettings;
}

export interface ConnectionPoolingConfig {
  pool_size: number;
  max_pool_size: number;
  connection_timeout: number;
  idle_timeout: number;
  validation_query?: string;
}

export interface SSLConfiguration {
  enabled: boolean;
  certificate_path?: string;
  key_path?: string;
  ca_certificate_path?: string;
  verify_hostname: boolean;
}

export interface ProxySettings {
  proxy_host: string;
  proxy_port: number;
  proxy_username?: string;
  proxy_password?: string;
  proxy_type: 'http' | 'socks4' | 'socks5';
}

export interface SystemCapability {
  capability_name: string;
  supported_operations: string[];
  data_formats: string[];
  rate_limits: RateLimit[];
  feature_flags: Record<string, boolean>;
}

export interface RateLimit {
  operation: string;
  requests_per_second: number;
  burst_capacity: number;
  time_window: string;
}

export interface SystemHealthCheck {
  enabled: boolean;
  check_interval_seconds: number;
  timeout_seconds: number;
  health_endpoint?: string;
  custom_checks: CustomHealthCheck[];
  failure_threshold: number;
  recovery_threshold: number;
}

export interface CustomHealthCheck {
  check_name: string;
  check_type: 'ping' | 'query' | 'api_call' | 'file_existence' | 'custom';
  configuration: Record<string, any>;
  expected_result: any;
  timeout_seconds: number;
}

export interface SystemPerformanceMetrics {
  response_time_ms: number;
  throughput_ops_per_second: number;
  error_rate_percentage: number;
  availability_percentage: number;
  resource_utilization: SystemResourceUtilization;
  connection_pool_metrics: ConnectionPoolMetrics;
}

export interface SystemResourceUtilization {
  cpu_usage_percentage: number;
  memory_usage_percentage: number;
  disk_usage_percentage: number;
  network_bandwidth_utilization: number;
}

export interface ConnectionPoolMetrics {
  active_connections: number;
  idle_connections: number;
  total_connections: number;
  connection_wait_time_ms: number;
  connection_creation_rate: number;
}