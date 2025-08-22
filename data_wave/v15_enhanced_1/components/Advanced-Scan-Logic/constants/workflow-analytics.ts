// Advanced Workflow Analytics Constants - aligned to backend
// Maps to: /api/v1/workflow/analytics

// Core analytics metrics for workflow performance
export const ANALYTICS_METRICS = {
  // Execution Metrics
  EXECUTION_TIME: 'execution_time',
  EXECUTION_COUNT: 'execution_count',
  SUCCESS_RATE: 'success_rate',
  FAILURE_RATE: 'failure_rate',
  ERROR_COUNT: 'error_count',
  TIMEOUT_COUNT: 'timeout_count',
  
  // Performance Metrics
  THROUGHPUT: 'throughput',
  LATENCY: 'latency',
  RESPONSE_TIME: 'response_time',
  PROCESSING_TIME: 'processing_time',
  QUEUE_TIME: 'queue_time',
  WAIT_TIME: 'wait_time',
  
  // Resource Metrics
  CPU_USAGE: 'cpu_usage',
  MEMORY_USAGE: 'memory_usage',
  DISK_IO: 'disk_io',
  NETWORK_IO: 'network_io',
  CONCURRENT_EXECUTIONS: 'concurrent_executions',
  RESOURCE_UTILIZATION: 'resource_utilization',
  
  // Business Metrics
  BUSINESS_VALUE: 'business_value',
  COST_PER_EXECUTION: 'cost_per_execution',
  ROI: 'roi',
  EFFICIENCY_SCORE: 'efficiency_score',
  QUALITY_SCORE: 'quality_score',
  SATISFACTION_SCORE: 'satisfaction_score',
  
  // Workflow Specific Metrics
  WORKFLOW_COMPLETION_RATE: 'workflow_completion_rate',
  STEP_SUCCESS_RATE: 'step_success_rate',
  APPROVAL_TIME: 'approval_time',
  ESCALATION_COUNT: 'escalation_count',
  RETRY_COUNT: 'retry_count',
  ROLLBACK_COUNT: 'rollback_count',
  
  // Compliance Metrics
  COMPLIANCE_SCORE: 'compliance_score',
  AUDIT_TRAIL_COMPLETENESS: 'audit_trail_completeness',
  POLICY_VIOLATIONS: 'policy_violations',
  RISK_SCORE: 'risk_score',
  SECURITY_SCORE: 'security_score'
} as const;

// Analytics dimensions for data segmentation
export const ANALYTICS_DIMENSIONS = {
  // Time Dimensions
  TIME_HOUR: 'time_hour',
  TIME_DAY: 'time_day',
  TIME_WEEK: 'time_week',
  TIME_MONTH: 'time_month',
  TIME_QUARTER: 'time_quarter',
  TIME_YEAR: 'time_year',
  
  // Workflow Dimensions
  WORKFLOW_TYPE: 'workflow_type',
  WORKFLOW_VERSION: 'workflow_version',
  WORKFLOW_STATUS: 'workflow_status',
  WORKFLOW_PRIORITY: 'workflow_priority',
  WORKFLOW_CATEGORY: 'workflow_category',
  
  // User Dimensions
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
  USER_DEPARTMENT: 'user_department',
  USER_REGION: 'user_region',
  USER_TENANT: 'user_tenant',
  
  // System Dimensions
  SYSTEM_ID: 'system_id',
  ENVIRONMENT: 'environment',
  DATACENTER: 'datacenter',
  CLUSTER: 'cluster',
  NODE: 'node',
  
  // Business Dimensions
  BUSINESS_UNIT: 'business_unit',
  PROJECT: 'project',
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  SERVICE: 'service',
  
  // Technical Dimensions
  TECHNOLOGY_STACK: 'technology_stack',
  INTEGRATION_POINT: 'integration_point',
  DATA_SOURCE: 'data_source',
  API_VERSION: 'api_version',
  PROTOCOL: 'protocol'
} as const;

// Analytics aggregation functions
export const ANALYTICS_AGGREGATIONS = {
  // Basic Aggregations
  COUNT: 'count',
  SUM: 'sum',
  AVERAGE: 'average',
  MIN: 'min',
  MAX: 'max',
  MEDIAN: 'median',
  
  // Statistical Aggregations
  STANDARD_DEVIATION: 'stddev',
  VARIANCE: 'variance',
  PERCENTILE_25: 'percentile_25',
  PERCENTILE_50: 'percentile_50',
  PERCENTILE_75: 'percentile_75',
  PERCENTILE_90: 'percentile_90',
  PERCENTILE_95: 'percentile_95',
  PERCENTILE_99: 'percentile_99',
  
  // Advanced Aggregations
  MOVING_AVERAGE: 'moving_average',
  EXPONENTIAL_SMOOTHING: 'exponential_smoothing',
  LINEAR_REGRESSION: 'linear_regression',
  CORRELATION: 'correlation',
  COVARIANCE: 'covariance',
  
  // Business Aggregations
  GROWTH_RATE: 'growth_rate',
  TREND_ANALYSIS: 'trend_analysis',
  SEASONAL_DECOMPOSITION: 'seasonal_decomposition',
  ANOMALY_DETECTION: 'anomaly_detection',
  FORECASTING: 'forecasting'
} as const;

// Time periods for analytics
export const TIME_PERIODS = {
  // Real-time periods
  LAST_5_MINUTES: '5m',
  LAST_15_MINUTES: '15m',
  LAST_30_MINUTES: '30m',
  LAST_HOUR: '1h',
  
  // Short-term periods
  LAST_6_HOURS: '6h',
  LAST_12_HOURS: '12h',
  LAST_DAY: '1d',
  LAST_3_DAYS: '3d',
  LAST_WEEK: '1w',
  
  // Medium-term periods
  LAST_2_WEEKS: '2w',
  LAST_MONTH: '1M',
  LAST_3_MONTHS: '3M',
  LAST_6_MONTHS: '6M',
  
  // Long-term periods
  LAST_YEAR: '1y',
  LAST_2_YEARS: '2y',
  LAST_5_YEARS: '5y',
  
  // Custom periods
  CUSTOM_RANGE: 'custom',
  COMPARISON_PERIOD: 'comparison'
} as const;

// Chart types for analytics visualization
export const CHART_TYPES = {
  // Time series charts
  LINE_CHART: 'line',
  AREA_CHART: 'area',
  STEP_CHART: 'step',
  CANDLESTICK: 'candlestick',
  
  // Comparison charts
  BAR_CHART: 'bar',
  COLUMN_CHART: 'column',
  STACKED_BAR: 'stacked_bar',
  GROUPED_BAR: 'grouped_bar',
  
  // Distribution charts
  HISTOGRAM: 'histogram',
  BOX_PLOT: 'box_plot',
  VIOLIN_PLOT: 'violin_plot',
  DENSITY_PLOT: 'density_plot',
  
  // Relationship charts
  SCATTER_PLOT: 'scatter',
  BUBBLE_CHART: 'bubble',
  HEATMAP: 'heatmap',
  CORRELATION_MATRIX: 'correlation_matrix',
  
  // Composition charts
  PIE_CHART: 'pie',
  DONUT_CHART: 'donut',
  TREEMAP: 'treemap',
  SUNBURST: 'sunburst',
  
  // Advanced charts
  RADAR_CHART: 'radar',
  POLAR_CHART: 'polar',
  FUNNEL_CHART: 'funnel',
  WATERFALL: 'waterfall',
  GANTT_CHART: 'gantt'
} as const;

// Alert thresholds for analytics monitoring
export const ALERT_THRESHOLDS = {
  // Performance thresholds
  CRITICAL_LATENCY: 1000, // 1 second
  WARNING_LATENCY: 500,   // 500ms
  CRITICAL_ERROR_RATE: 0.1, // 10%
  WARNING_ERROR_RATE: 0.05, // 5%
  
  // Resource thresholds
  CRITICAL_CPU_USAGE: 0.9,  // 90%
  WARNING_CPU_USAGE: 0.8,   // 80%
  CRITICAL_MEMORY_USAGE: 0.95, // 95%
  WARNING_MEMORY_USAGE: 0.85,  // 85%
  
  // Business thresholds
  CRITICAL_SUCCESS_RATE: 0.8,  // 80%
  WARNING_SUCCESS_RATE: 0.9,   // 90%
  CRITICAL_COMPLIANCE_SCORE: 0.7, // 70%
  WARNING_COMPLIANCE_SCORE: 0.8,  // 80%
  
  // Workflow thresholds
  CRITICAL_TIMEOUT_RATE: 0.2,  // 20%
  WARNING_TIMEOUT_RATE: 0.1,   // 10%
  CRITICAL_ESCALATION_RATE: 0.3, // 30%
  WARNING_ESCALATION_RATE: 0.2   // 20%
} as const;

// Analytics refresh intervals
export const REFRESH_INTERVALS = {
  // Real-time intervals
  REAL_TIME: 5000,      // 5 seconds
  FAST: 15000,          // 15 seconds
  MEDIUM: 60000,        // 1 minute
  SLOW: 300000,         // 5 minutes
  
  // Batch intervals
  HOURLY: 3600000,      // 1 hour
  DAILY: 86400000,      // 1 day
  WEEKLY: 604800000,    // 1 week
  MONTHLY: 2592000000   // 1 month
} as const;

// Export types for TypeScript
export type AnalyticsMetric = typeof ANALYTICS_METRICS[keyof typeof ANALYTICS_METRICS];
export type AnalyticsDimension = typeof ANALYTICS_DIMENSIONS[keyof typeof ANALYTICS_DIMENSIONS];
export type AnalyticsAggregation = typeof ANALYTICS_AGGREGATIONS[keyof typeof ANALYTICS_AGGREGATIONS];
export type TimePeriod = typeof TIME_PERIODS[keyof typeof TIME_PERIODS];
export type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];
export type AlertThreshold = typeof ALERT_THRESHOLDS[keyof typeof ALERT_THRESHOLDS];
export type RefreshInterval = typeof REFRESH_INTERVALS[keyof typeof REFRESH_INTERVALS];

// Analytics configuration interface
export interface AnalyticsConfig {
  metrics: AnalyticsMetric[];
  dimensions: AnalyticsDimension[];
  aggregations: AnalyticsAggregation[];
  timePeriod: TimePeriod;
  chartType: ChartType;
  refreshInterval: RefreshInterval;
  alertThresholds: Partial<Record<AnalyticsMetric, number>>;
  customFilters?: Record<string, any>;
}

// Default analytics configuration
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  metrics: [ANALYTICS_METRICS.EXECUTION_TIME, ANALYTICS_METRICS.SUCCESS_RATE],
  dimensions: [ANALYTICS_DIMENSIONS.WORKFLOW_TYPE, ANALYTICS_DIMENSIONS.TIME_DAY],
  aggregations: [ANALYTICS_AGGREGATIONS.AVERAGE, ANALYTICS_AGGREGATIONS.COUNT],
  timePeriod: TIME_PERIODS.LAST_WEEK,
  chartType: CHART_TYPES.LINE_CHART,
  refreshInterval: REFRESH_INTERVALS.MEDIUM,
  alertThresholds: {
    [ANALYTICS_METRICS.SUCCESS_RATE]: ALERT_THRESHOLDS.WARNING_SUCCESS_RATE,
    [ANALYTICS_METRICS.EXECUTION_TIME]: ALERT_THRESHOLDS.WARNING_LATENCY
  }
};

