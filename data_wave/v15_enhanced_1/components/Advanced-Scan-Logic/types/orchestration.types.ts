// Advanced-Scan-Logic/types/orchestration.types.ts
// Comprehensive orchestration types aligned with backend scan_orchestration_models.py

export interface ScanOrchestrationJob {
  id: string;
  name: string;
  description?: string;
  status: OrchestrationJobStatus;
  type: OrchestrationJobType;
  priority: OrchestrationPriority;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  data_source_id: string;
  scan_rule_set_id: string;
  workflow_template_id?: string;
  configuration: OrchestrationConfiguration;
  resource_allocation: ResourceAllocation;
  dependencies: OrchestrationDependency[];
  execution_stages: OrchestrationStage[];
  performance_metrics: OrchestrationPerformanceMetrics;
  intelligence_insights: OrchestrationIntelligenceInsight[];
  error_details?: OrchestrationError;
  retry_count: number;
  max_retries: number;
  timeout_minutes: number;
  scheduled_for?: string;
  recurring_schedule?: RecurringSchedule;
  cross_system_coordination?: CrossSystemCoordination;
  compliance_requirements?: ComplianceRequirement[];
  security_policies?: SecurityPolicy[];
  notification_settings: NotificationSettings;
}

export enum OrchestrationJobStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  QUEUED = 'queued',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  PAUSED = 'paused',
  RESUMING = 'resuming',
  CANCELLING = 'cancelling',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  RETRYING = 'retrying',
  SKIPPED = 'skipped',
  PARTIALLY_COMPLETED = 'partially_completed'
}

export enum OrchestrationJobType {
  SIMPLE_SCAN = 'simple_scan',
  COMPLEX_WORKFLOW = 'complex_workflow',
  MULTI_SOURCE_SCAN = 'multi_source_scan',
  INCREMENTAL_SCAN = 'incremental_scan',
  COMPLIANCE_SCAN = 'compliance_scan',
  QUALITY_ASSESSMENT = 'quality_assessment',
  DISCOVERY_SCAN = 'discovery_scan',
  SECURITY_SCAN = 'security_scan',
  PERFORMANCE_BENCHMARK = 'performance_benchmark',
  CROSS_SYSTEM_COORDINATION = 'cross_system_coordination',
  AI_OPTIMIZED_SCAN = 'ai_optimized_scan',
  REAL_TIME_STREAMING = 'real_time_streaming',
  BATCH_PROCESSING = 'batch_processing',
  EDGE_PROCESSING = 'edge_processing'
}

export enum OrchestrationPriority {
  URGENT = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  BACKGROUND = 5
}

export interface OrchestrationConfiguration {
  scan_parameters: ScanParameters;
  performance_settings: PerformanceSettings;
  resource_limits: ResourceLimits;
  optimization_settings: OptimizationSettings;
  intelligence_settings: IntelligenceSettings;
  security_settings: SecuritySettings;
  compliance_settings: ComplianceSettings;
  notification_settings: NotificationSettings;
  retry_policy: RetryPolicy;
  timeout_policy: TimeoutPolicy;
  quality_thresholds: QualityThresholds;
  custom_parameters: Record<string, any>;
}

export interface ScanParameters {
  depth_level: number;
  include_patterns: string[];
  exclude_patterns: string[];
  sampling_rate?: number;
  parallel_execution: boolean;
  batch_size: number;
  memory_limit_mb: number;
  cpu_cores: number;
  enable_caching: boolean;
  cache_ttl_minutes: number;
  enable_compression: boolean;
  data_preview_enabled: boolean;
  schema_inference_enabled: boolean;
  metadata_extraction_enabled: boolean;
  relationship_discovery_enabled: boolean;
  lineage_tracking_enabled: boolean;
  quality_profiling_enabled: boolean;
  sensitivity_detection_enabled: boolean;
  compliance_validation_enabled: boolean;
  custom_rules_enabled: boolean;
  ai_optimization_enabled: boolean;
}

export interface PerformanceSettings {
  enable_performance_monitoring: boolean;
  performance_baseline_id?: string;
  target_completion_time_minutes?: number;
  max_memory_usage_mb: number;
  max_cpu_usage_percent: number;
  enable_auto_scaling: boolean;
  scaling_threshold_percent: number;
  enable_load_balancing: boolean;
  enable_performance_optimization: boolean;
  enable_bottleneck_detection: boolean;
  enable_resource_prediction: boolean;
  performance_alerts_enabled: boolean;
  metrics_collection_interval_seconds: number;
  enable_distributed_execution: boolean;
  enable_edge_processing: boolean;
  enable_stream_processing: boolean;
}

export interface ResourceAllocation {
  id: string;
  orchestration_job_id: string;
  resource_pool_id: string;
  allocated_memory_mb: number;
  allocated_cpu_cores: number;
  allocated_storage_gb: number;
  allocated_network_bandwidth_mbps: number;
  allocated_gpu_units?: number;
  allocated_at: string;
  deallocated_at?: string;
  actual_usage: ResourceUsage;
  estimated_usage: ResourceUsage;
  cost_estimation: CostEstimation;
  resource_efficiency_score: number;
  optimization_recommendations: OptimizationRecommendation[];
  scaling_decisions: ScalingDecision[];
  resource_conflicts: ResourceConflict[];
  reservation_details?: ResourceReservation;
}

export interface ResourceUsage {
  memory_used_mb: number;
  memory_peak_mb: number;
  cpu_used_cores: number;
  cpu_peak_cores: number;
  storage_used_gb: number;
  network_used_mbps: number;
  gpu_used_units?: number;
  io_operations_per_second: number;
  cache_hit_ratio: number;
  queue_depth: number;
  active_connections: number;
  throughput_records_per_second: number;
  latency_ms: number;
  error_rate_percent: number;
  availability_percent: number;
}

export interface OrchestrationDependency {
  id: string;
  dependent_job_id: string;
  prerequisite_job_id: string;
  dependency_type: DependencyType;
  condition: DependencyCondition;
  status: DependencyStatus;
  created_at: string;
  resolved_at?: string;
  timeout_minutes?: number;
  retry_on_failure: boolean;
  critical: boolean;
  description?: string;
  validation_rules: ValidationRule[];
  cross_system_dependency?: CrossSystemDependency;
}

export enum DependencyType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  RESOURCE = 'resource',
  DATA = 'data',
  TIMING = 'timing',
  CROSS_SYSTEM = 'cross_system',
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
  QUALITY = 'quality'
}

export enum DependencyStatus {
  PENDING = 'pending',
  SATISFIED = 'satisfied',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  SKIPPED = 'skipped',
  WAITING = 'waiting'
}

export interface OrchestrationStage {
  id: string;
  orchestration_job_id: string;
  stage_name: string;
  stage_type: StageType;
  stage_order: number;
  status: StageStatus;
  started_at?: string;
  completed_at?: string;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  resource_requirements: ResourceRequirements;
  input_parameters: Record<string, any>;
  output_results: Record<string, any>;
  error_details?: StageError;
  retry_count: number;
  max_retries: number;
  parallel_execution_group?: string;
  conditional_logic?: ConditionalLogic;
  performance_metrics: StagePerformanceMetrics;
  quality_metrics: StageQualityMetrics;
  dependencies: StageDependency[];
  artifacts: StageArtifact[];
  notifications: StageNotification[];
}

export enum StageType {
  INITIALIZATION = 'initialization',
  DATA_DISCOVERY = 'data_discovery',
  SCHEMA_ANALYSIS = 'schema_analysis',
  DATA_PROFILING = 'data_profiling',
  QUALITY_ASSESSMENT = 'quality_assessment',
  CLASSIFICATION = 'classification',
  SENSITIVITY_DETECTION = 'sensitivity_detection',
  COMPLIANCE_VALIDATION = 'compliance_validation',
  LINEAGE_TRACKING = 'lineage_tracking',
  RELATIONSHIP_DISCOVERY = 'relationship_discovery',
  ANOMALY_DETECTION = 'anomaly_detection',
  PATTERN_RECOGNITION = 'pattern_recognition',
  OPTIMIZATION = 'optimization',
  REPORTING = 'reporting',
  NOTIFICATION = 'notification',
  CLEANUP = 'cleanup',
  VALIDATION = 'validation',
  FINALIZATION = 'finalization'
}

export enum StageStatus {
  PENDING = 'pending',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RETRYING = 'retrying',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  version: string;
  category: WorkflowCategory;
  template_type: TemplateType;
  created_by: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  deprecated: boolean;
  stages: WorkflowStageTemplate[];
  dependencies: WorkflowDependencyTemplate[];
  default_configuration: OrchestrationConfiguration;
  validation_rules: ValidationRule[];
  approval_required: boolean;
  approval_workflow_id?: string;
  tags: string[];
  compliance_frameworks: string[];
  security_requirements: SecurityRequirement[];
  performance_benchmarks: PerformanceBenchmark[];
  cost_estimates: CostEstimate[];
  usage_statistics: TemplateUsageStatistics;
  reviews: TemplateReview[];
  documentation: TemplateDocumentation;
}

export enum WorkflowCategory {
  DATA_DISCOVERY = 'data_discovery',
  COMPLIANCE_SCANNING = 'compliance_scanning',
  QUALITY_ASSESSMENT = 'quality_assessment',
  SECURITY_SCANNING = 'security_scanning',
  PERFORMANCE_MONITORING = 'performance_monitoring',
  LINEAGE_TRACKING = 'lineage_tracking',
  CLASSIFICATION = 'classification',
  OPTIMIZATION = 'optimization',
  INTEGRATION = 'integration',
  CUSTOM = 'custom'
}

export enum TemplateType {
  STANDARD = 'standard',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
  COMMUNITY = 'community',
  CERTIFIED = 'certified',
  EXPERIMENTAL = 'experimental'
}

export interface ExecutionPipeline {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: PipelineStatus;
  pipeline_type: PipelineType;
  configuration: PipelineConfiguration;
  stages: PipelineStage[];
  dependencies: PipelineDependency[];
  resource_pools: ResourcePool[];
  monitoring_settings: MonitoringSettings;
  alerting_rules: AlertingRule[];
  performance_targets: PerformanceTarget[];
  quality_gates: QualityGate[];
  security_policies: SecurityPolicy[];
  compliance_checks: ComplianceCheck[];
  cost_controls: CostControl[];
  optimization_settings: PipelineOptimizationSettings;
  analytics_configuration: AnalyticsConfiguration;
}

export enum PipelineStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
  UNDER_MAINTENANCE = 'under_maintenance'
}

export enum PipelineType {
  BATCH = 'batch',
  STREAMING = 'streaming',
  HYBRID = 'hybrid',
  REAL_TIME = 'real_time',
  SCHEDULED = 'scheduled',
  EVENT_DRIVEN = 'event_driven',
  EDGE = 'edge',
  DISTRIBUTED = 'distributed'
}

export interface ResourcePool {
  id: string;
  name: string;
  description?: string;
  pool_type: ResourcePoolType;
  status: ResourcePoolStatus;
  total_capacity: ResourceCapacity;
  available_capacity: ResourceCapacity;
  allocated_capacity: ResourceCapacity;
  reserved_capacity: ResourceCapacity;
  utilization_metrics: UtilizationMetrics;
  cost_metrics: CostMetrics;
  performance_metrics: ResourcePerformanceMetrics;
  scaling_policies: ScalingPolicy[];
  access_policies: AccessPolicy[];
  maintenance_windows: MaintenanceWindow[];
  health_status: HealthStatus;
  location: ResourceLocation;
  provider_details: ProviderDetails;
  tags: Record<string, string>;
}

export enum ResourcePoolType {
  COMPUTE = 'compute',
  STORAGE = 'storage',
  NETWORK = 'network',
  GPU = 'gpu',
  MEMORY = 'memory',
  MIXED = 'mixed',
  CLOUD = 'cloud',
  ON_PREMISE = 'on_premise',
  EDGE = 'edge',
  HYBRID = 'hybrid'
}

export enum ResourcePoolStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  OFFLINE = 'offline',
  SCALING = 'scaling',
  RESERVED = 'reserved'
}

export interface OrchestrationPerformanceMetrics {
  execution_time_ms: number;
  queue_time_ms: number;
  initialization_time_ms: number;
  processing_time_ms: number;
  finalization_time_ms: number;
  total_records_processed: number;
  records_per_second: number;
  data_volume_processed_gb: number;
  throughput_gbps: number;
  memory_usage_peak_mb: number;
  memory_usage_average_mb: number;
  cpu_usage_peak_percent: number;
  cpu_usage_average_percent: number;
  io_operations_count: number;
  network_bytes_transferred: number;
  cache_hit_ratio: number;
  error_count: number;
  warning_count: number;
  retry_count: number;
  efficiency_score: number;
  quality_score: number;
  cost_dollars: number;
  carbon_footprint_kg: number;
  sla_compliance_percent: number;
}

export interface OrchestrationIntelligenceInsight {
  id: string;
  orchestration_job_id: string;
  insight_type: InsightType;
  severity: InsightSeverity;
  category: InsightCategory;
  title: string;
  description: string;
  recommendation: string;
  confidence_score: number;
  impact_score: number;
  priority_score: number;
  detected_at: string;
  resolved_at?: string;
  status: InsightStatus;
  evidence: InsightEvidence[];
  related_insights: string[];
  action_items: ActionItem[];
  feedback: InsightFeedback[];
  tags: string[];
}

export enum InsightType {
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
  RESOURCE_OPTIMIZATION = 'resource_optimization',
  COST_OPTIMIZATION = 'cost_optimization',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  SECURITY_ENHANCEMENT = 'security_enhancement',
  COMPLIANCE_REQUIREMENT = 'compliance_requirement',
  ANOMALY_DETECTION = 'anomaly_detection',
  PATTERN_RECOGNITION = 'pattern_recognition',
  PREDICTIVE_ANALYSIS = 'predictive_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  CAPACITY_PLANNING = 'capacity_planning',
  WORKFLOW_OPTIMIZATION = 'workflow_optimization'
}

export enum InsightSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum InsightCategory {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  QUALITY = 'quality',
  COST = 'cost',
  RELIABILITY = 'reliability',
  EFFICIENCY = 'efficiency',
  USABILITY = 'usability'
}

export enum InsightStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ESCALATED = 'escalated'
}

export interface RecurringSchedule {
  enabled: boolean;
  schedule_type: ScheduleType;
  cron_expression?: string;
  interval_minutes?: number;
  start_date: string;
  end_date?: string;
  timezone: string;
  max_concurrent_runs: number;
  skip_if_running: boolean;
  catch_up: boolean;
  retry_failed_runs: boolean;
  notification_settings: ScheduleNotificationSettings;
}

export enum ScheduleType {
  ONCE = 'once',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  INTERVAL = 'interval',
  CRON = 'cron',
  EVENT_DRIVEN = 'event_driven'
}

export interface CrossSystemCoordination {
  enabled: boolean;
  systems: ConnectedSystem[];
  coordination_rules: CoordinationRule[];
  conflict_resolution: ConflictResolution;
  synchronization_settings: SynchronizationSettings;
  failure_handling: FailureHandling;
  monitoring_settings: CrossSystemMonitoringSettings;
}

export interface OrchestrationAnalytics {
  job_id: string;
  analytics_type: AnalyticsType;
  time_period: TimePeriod;
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrend[];
  comparisons: AnalyticsComparison[];
  forecasts: AnalyticsForecast[];
  anomalies: AnalyticsAnomaly[];
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
  alerts: AnalyticsAlert[];
  generated_at: string;
  report_configuration: ReportConfiguration;
}

export enum AnalyticsType {
  PERFORMANCE = 'performance',
  RESOURCE_UTILIZATION = 'resource_utilization',
  COST_ANALYSIS = 'cost_analysis',
  QUALITY_METRICS = 'quality_metrics',
  SECURITY_METRICS = 'security_metrics',
  COMPLIANCE_METRICS = 'compliance_metrics',
  USER_BEHAVIOR = 'user_behavior',
  SYSTEM_HEALTH = 'system_health',
  BUSINESS_IMPACT = 'business_impact',
  OPERATIONAL_EFFICIENCY = 'operational_efficiency'
}

// Request/Response types for API integration
export interface CreateOrchestrationJobRequest {
  name: string;
  description?: string;
  type: OrchestrationJobType;
  priority: OrchestrationPriority;
  data_source_id: string;
  scan_rule_set_id: string;
  workflow_template_id?: string;
  configuration: Partial<OrchestrationConfiguration>;
  scheduled_for?: string;
  recurring_schedule?: Partial<RecurringSchedule>;
  tags?: string[];
}

export interface UpdateOrchestrationJobRequest {
  name?: string;
  description?: string;
  priority?: OrchestrationPriority;
  configuration?: Partial<OrchestrationConfiguration>;
  scheduled_for?: string;
  recurring_schedule?: Partial<RecurringSchedule>;
  tags?: string[];
}

export interface OrchestrationJobListResponse {
  jobs: ScanOrchestrationJob[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  filters_applied: Record<string, any>;
  sort_order: string;
  aggregations: OrchestrationAggregations;
}

export interface OrchestrationAggregations {
  status_counts: Record<OrchestrationJobStatus, number>;
  type_counts: Record<OrchestrationJobType, number>;
  priority_counts: Record<OrchestrationPriority, number>;
  average_execution_time_ms: number;
  success_rate_percent: number;
  resource_utilization_average: number;
  cost_summary: CostSummary;
}

export interface OrchestrationJobFilters {
  status?: OrchestrationJobStatus[];
  type?: OrchestrationJobType[];
  priority?: OrchestrationPriority[];
  data_source_ids?: string[];
  scan_rule_set_ids?: string[];
  created_after?: string;
  created_before?: string;
  tags?: string[];
  search_query?: string;
}

export interface OrchestrationJobSort {
  field: string;
  direction: 'asc' | 'desc';
}

// Additional supporting interfaces
export interface DependencyCondition {
  condition_type: ConditionType;
  expression: string;
  parameters: Record<string, any>;
}

export enum ConditionType {
  STATUS_EQUALS = 'status_equals',
  CUSTOM_EXPRESSION = 'custom_expression',
  TIME_BASED = 'time_based',
  RESOURCE_AVAILABLE = 'resource_available',
  DATA_AVAILABLE = 'data_available',
  QUALITY_THRESHOLD = 'quality_threshold'
}

export interface ValidationRule {
  id: string;
  name: string;
  rule_type: ValidationRuleType;
  expression: string;
  parameters: Record<string, any>;
  severity: ValidationSeverity;
  enabled: boolean;
}

export enum ValidationRuleType {
  SCHEMA_VALIDATION = 'schema_validation',
  DATA_QUALITY = 'data_quality',
  BUSINESS_RULE = 'business_rule',
  SECURITY_POLICY = 'security_policy',
  COMPLIANCE_RULE = 'compliance_rule',
  PERFORMANCE_THRESHOLD = 'performance_threshold'
}

export enum ValidationSeverity {
  BLOCKING = 'blocking',
  WARNING = 'warning',
  INFO = 'info'
}

export interface ResourceRequirements {
  min_memory_mb: number;
  max_memory_mb: number;
  min_cpu_cores: number;
  max_cpu_cores: number;
  storage_gb: number;
  network_bandwidth_mbps: number;
  gpu_units?: number;
  special_requirements?: string[];
}