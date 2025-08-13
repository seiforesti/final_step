// Advanced-Scan-Logic/types/performance.types.ts
// Comprehensive performance types aligned with backend scan_performance_models.py

export interface PerformanceMetric {
  id: string;
  scan_id: string;
  metric_name: string;
  metric_type: PerformanceMetricType;
  value: number;
  unit: string;
  timestamp: string;
  context: PerformanceContext;
  baseline_value?: number;
  threshold: PerformanceThreshold;
  trend: TrendDirection;
  percentile_rank: number;
  historical_average: number;
  tags: Record<string, string>;
}

export enum PerformanceMetricType {
  EXECUTION_TIME = 'execution_time',
  THROUGHPUT = 'throughput',
  LATENCY = 'latency',
  RESOURCE_UTILIZATION = 'resource_utilization',
  MEMORY_USAGE = 'memory_usage',
  CPU_USAGE = 'cpu_usage',
  IO_OPERATIONS = 'io_operations',
  NETWORK_BANDWIDTH = 'network_bandwidth',
  ERROR_RATE = 'error_rate',
  SUCCESS_RATE = 'success_rate',
  AVAILABILITY = 'availability',
  SCALABILITY = 'scalability',
  EFFICIENCY = 'efficiency',
  COST_EFFICIENCY = 'cost_efficiency',
  QUALITY_SCORE = 'quality_score'
}

export enum TrendDirection {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DEGRADING = 'degrading',
  VOLATILE = 'volatile',
  UNKNOWN = 'unknown'
}

export interface ResourceUtilization {
  id: string;
  resource_type: ResourceType;
  resource_id: string;
  scan_id: string;
  timestamp: string;
  utilization_percent: number;
  allocated_amount: number;
  used_amount: number;
  available_amount: number;
  peak_usage: number;
  average_usage: number;
  efficiency_score: number;
  cost_per_unit: number;
  optimization_opportunities: OptimizationOpportunity[];
}

export enum ResourceType {
  CPU = 'cpu',
  MEMORY = 'memory',
  STORAGE = 'storage',
  NETWORK = 'network',
  GPU = 'gpu',
  DATABASE_CONNECTION = 'database_connection',
  THREAD_POOL = 'thread_pool',
  CONNECTION_POOL = 'connection_pool',
  CACHE = 'cache',
  QUEUE = 'queue'
}

export interface BottleneckAnalysis {
  id: string;
  scan_id: string;
  bottleneck_type: BottleneckType;
  severity: BottleneckSeverity;
  component: string;
  impact_score: number;
  detected_at: string;
  duration_minutes: number;
  root_cause: RootCause;
  affected_operations: string[];
  performance_degradation_percent: number;
  recommendations: BottleneckRecommendation[];
  remediation_actions: RemediationAction[];
  resolution_status: ResolutionStatus;
}

export enum BottleneckType {
  CPU_BOUND = 'cpu_bound',
  MEMORY_BOUND = 'memory_bound',
  IO_BOUND = 'io_bound',
  NETWORK_BOUND = 'network_bound',
  DATABASE_BOUND = 'database_bound',
  ALGORITHMIC = 'algorithmic',
  SYNCHRONIZATION = 'synchronization',
  RESOURCE_CONTENTION = 'resource_contention',
  CONFIGURATION = 'configuration',
  EXTERNAL_DEPENDENCY = 'external_dependency'
}

export enum BottleneckSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface ScalingRecommendation {
  id: string;
  scan_id: string;
  recommendation_type: ScalingType;
  priority: RecommendationPriority;
  current_capacity: ResourceCapacity;
  recommended_capacity: ResourceCapacity;
  expected_improvement: ExpectedImprovement;
  cost_impact: CostImpact;
  implementation_complexity: ImplementationComplexity;
  timeline: RecommendationTimeline;
  prerequisites: string[];
  risks: Risk[];
  benefits: Benefit[];
  confidence_score: number;
}

export enum ScalingType {
  HORIZONTAL_SCALE_OUT = 'horizontal_scale_out',
  HORIZONTAL_SCALE_IN = 'horizontal_scale_in',
  VERTICAL_SCALE_UP = 'vertical_scale_up',
  VERTICAL_SCALE_DOWN = 'vertical_scale_down',
  AUTO_SCALING = 'auto_scaling',
  LOAD_BALANCING = 'load_balancing',
  RESOURCE_OPTIMIZATION = 'resource_optimization',
  ARCHITECTURE_CHANGE = 'architecture_change'
}

export enum RecommendationPriority {
  IMMEDIATE = 'immediate',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  FUTURE = 'future'
}

export interface CostOptimization {
  id: string;
  optimization_type: CostOptimizationType;
  current_cost: Cost;
  optimized_cost: Cost;
  savings_amount: number;
  savings_percent: number;
  implementation_cost: number;
  roi_percent: number;
  payback_period_months: number;
  risk_level: RiskLevel;
  implementation_effort: ImplementationEffort;
  recommendations: CostRecommendation[];
  impact_analysis: CostImpactAnalysis;
}

export enum CostOptimizationType {
  RESOURCE_RIGHTSIZING = 'resource_rightsizing',
  RESERVED_CAPACITY = 'reserved_capacity',
  SPOT_INSTANCES = 'spot_instances',
  STORAGE_OPTIMIZATION = 'storage_optimization',
  NETWORK_OPTIMIZATION = 'network_optimization',
  COMPUTE_OPTIMIZATION = 'compute_optimization',
  LICENSING_OPTIMIZATION = 'licensing_optimization',
  OPERATIONAL_EFFICIENCY = 'operational_efficiency',
  AUTOMATION = 'automation',
  WASTE_ELIMINATION = 'waste_elimination'
}

export interface PerformanceBaseline {
  id: string;
  name: string;
  description?: string;
  baseline_type: BaselineType;
  created_at: string;
  updated_at: string;
  metrics: BaselineMetric[];
  environment: EnvironmentContext;
  workload_characteristics: WorkloadCharacteristics;
  confidence_level: number;
  validity_period_days: number;
  comparison_results: BaselineComparison[];
  drift_analysis: DriftAnalysis;
}

export enum BaselineType {
  HISTORICAL = 'historical',
  SYNTHETIC = 'synthetic',
  PEER_COMPARISON = 'peer_comparison',
  INDUSTRY_STANDARD = 'industry_standard',
  TARGET_STATE = 'target_state',
  SLA_BASED = 'sla_based'
}

export interface CapacityPlan {
  id: string;
  name: string;
  planning_horizon_months: number;
  current_capacity: CurrentCapacity;
  projected_demand: ProjectedDemand;
  recommended_capacity: RecommendedCapacity;
  growth_assumptions: GrowthAssumption[];
  constraints: CapacityConstraint[];
  scenarios: CapacityScenario[];
  investment_timeline: InvestmentTimeline;
  risk_assessment: CapacityRiskAssessment;
  alternatives: CapacityAlternative[];
}

export interface OptimizationHistory {
  id: string;
  optimization_type: OptimizationType;
  implemented_at: string;
  implemented_by: string;
  before_metrics: PerformanceSnapshot;
  after_metrics: PerformanceSnapshot;
  improvement_percent: number;
  cost_impact_dollars: number;
  effectiveness_score: number;
  lessons_learned: LessonLearned[];
  rollback_plan?: RollbackPlan;
  monitoring_plan: MonitoringPlan;
}

export enum OptimizationType {
  QUERY_OPTIMIZATION = 'query_optimization',
  INDEX_OPTIMIZATION = 'index_optimization',
  CACHING_STRATEGY = 'caching_strategy',
  ALGORITHM_IMPROVEMENT = 'algorithm_improvement',
  RESOURCE_ALLOCATION = 'resource_allocation',
  CONFIGURATION_TUNING = 'configuration_tuning',
  ARCHITECTURE_OPTIMIZATION = 'architecture_optimization',
  WORKFLOW_OPTIMIZATION = 'workflow_optimization',
  DATA_STRUCTURE_OPTIMIZATION = 'data_structure_optimization',
  PARALLELIZATION = 'parallelization'
}

// API Request/Response types
export interface PerformanceAnalysisRequest {
  scan_ids?: string[];
  metric_types?: PerformanceMetricType[];
  time_period: TimePeriod;
  include_baselines?: boolean;
  include_recommendations?: boolean;
  aggregation_level?: AggregationLevel;
  comparison_baseline_id?: string;
}

export interface PerformanceAnalysisResponse {
  metrics: PerformanceMetric[];
  utilization: ResourceUtilization[];
  bottlenecks: BottleneckAnalysis[];
  scaling_recommendations: ScalingRecommendation[];
  cost_optimizations: CostOptimization[];
  baselines: PerformanceBaseline[];
  capacity_plans: CapacityPlan[];
  optimization_history: OptimizationHistory[];
  summary: PerformanceSummary;
  trends: PerformanceTrend[];
  alerts: PerformanceAlert[];
}

export interface PerformanceMonitoringConfig {
  enabled_metrics: PerformanceMetricType[];
  collection_interval_seconds: number;
  retention_days: number;
  alerting_rules: AlertingRule[];
  baseline_update_frequency: BaselineUpdateFrequency;
  optimization_triggers: OptimizationTrigger[];
  reporting_schedule: ReportingSchedule;
  integration_settings: IntegrationSettings;
}

export interface PerformanceAlert {
  id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  triggered_at: string;
  resolved_at?: string;
  metric_name: string;
  threshold_value: number;
  actual_value: number;
  affected_resources: string[];
  recommended_actions: string[];
  escalation_level: EscalationLevel;
  acknowledgment_status: AcknowledgmentStatus;
}

export enum AlertType {
  THRESHOLD_BREACH = 'threshold_breach',
  TREND_ANOMALY = 'trend_anomaly',
  BASELINE_DEVIATION = 'baseline_deviation',
  RESOURCE_EXHAUSTION = 'resource_exhaustion',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  BOTTLENECK_DETECTED = 'bottleneck_detected',
  SLA_VIOLATION = 'sla_violation',
  COST_SPIKE = 'cost_spike'
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

// Supporting interfaces
export interface PerformanceContext {
  environment: string;
  data_volume_gb: number;
  concurrent_users: number;
  workload_type: WorkloadType;
  business_hours: boolean;
  system_load: SystemLoad;
  network_conditions: NetworkConditions;
}

export enum WorkloadType {
  BATCH = 'batch',
  INTERACTIVE = 'interactive',
  ANALYTICAL = 'analytical',
  TRANSACTIONAL = 'transactional',
  STREAMING = 'streaming',
  MIXED = 'mixed'
}

export interface PerformanceThreshold {
  warning_value: number;
  critical_value: number;
  target_value?: number;
  acceptable_range: ValueRange;
  comparison_operator: ComparisonOperator;
}

export enum ComparisonOperator {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  BETWEEN = 'between',
  OUTSIDE_RANGE = 'outside_range'
}

export interface OptimizationOpportunity {
  opportunity_type: OpportunityType;
  potential_improvement_percent: number;
  implementation_effort: ImplementationEffort;
  risk_level: RiskLevel;
  estimated_cost_savings: number;
  description: string;
  action_items: string[];
}

export enum OpportunityType {
  RESOURCE_REALLOCATION = 'resource_reallocation',
  ALGORITHM_OPTIMIZATION = 'algorithm_optimization',
  CACHING_IMPROVEMENT = 'caching_improvement',
  PARALLELIZATION = 'parallelization',
  DATA_STRUCTURE_OPTIMIZATION = 'data_structure_optimization',
  QUERY_OPTIMIZATION = 'query_optimization',
  CONFIGURATION_TUNING = 'configuration_tuning',
  ARCHITECTURE_REFINEMENT = 'architecture_refinement'
}

export enum ImplementationEffort {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface RootCause {
  category: RootCauseCategory;
  description: string;
  contributing_factors: string[];
  evidence: Evidence[];
  confidence_score: number;
}

export enum RootCauseCategory {
  RESOURCE_LIMITATION = 'resource_limitation',
  CONFIGURATION_ISSUE = 'configuration_issue',
  ALGORITHMIC_INEFFICIENCY = 'algorithmic_inefficiency',
  DATA_CHARACTERISTICS = 'data_characteristics',
  EXTERNAL_DEPENDENCY = 'external_dependency',
  CONCURRENCY_ISSUE = 'concurrency_issue',
  INFRASTRUCTURE_PROBLEM = 'infrastructure_problem',
  SOFTWARE_BUG = 'software_bug'
}

export interface TimePeriod {
  start_date: string;
  end_date: string;
  timezone: string;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export enum AggregationLevel {
  RAW = 'raw',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}