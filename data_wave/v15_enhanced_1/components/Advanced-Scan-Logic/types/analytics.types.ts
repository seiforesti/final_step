// Advanced-Scan-Logic/types/analytics.types.ts
// Analytics and insights types

export interface ScanAnalytics {
  id: string;
  analysis_type: AnalysisType;
  time_period: TimePeriod;
  metrics: AnalyticsMetric[];
  insights: AnalyticsInsight[];
  trends: Trend[];
  forecasts: Forecast[];
  comparisons: Comparison[];
  generated_at: string;
}

export enum AnalysisType {
  PERFORMANCE = 'performance',
  USAGE = 'usage',
  COST = 'cost',
  QUALITY = 'quality',
  EFFICIENCY = 'efficiency',
  BUSINESS_IMPACT = 'business_impact'
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  change_percent?: number;
  trend_direction: TrendDirection;
  benchmark?: number;
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  confidence_score: number;
  impact_score: number;
  recommendations: string[];
}

export enum InsightCategory {
  OPTIMIZATION = 'optimization',
  RISK = 'risk',
  OPPORTUNITY = 'opportunity',
  ANOMALY = 'anomaly',
  TREND = 'trend'
}

export interface TimePeriod {
  start_date: string;
  end_date: string;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

// Missing enum types referenced by components
export enum TrendType {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  SEASONAL = 'seasonal',
  CYCLICAL = 'cyclical',
  RANDOM = 'random',
  POLYNOMIAL = 'polynomial',
  LOGARITHMIC = 'logarithmic',
  POWER = 'power',
  MOVING_AVERAGE = 'moving_average',
  WEIGHTED = 'weighted',
  CUSTOM = 'custom'
}

export enum StatisticalModel {
  ARIMA = 'arima',
  SARIMA = 'sarima',
  EXPONENTIAL_SMOOTHING = 'exponential_smoothing',
  HOLT_WINTERS = 'holt_winters',
  LINEAR_REGRESSION = 'linear_regression',
  POLYNOMIAL_REGRESSION = 'polynomial_regression',
  MOVING_AVERAGE = 'moving_average',
  WEIGHTED_MOVING_AVERAGE = 'weighted_moving_average',
  SIMPLE_EXPONENTIAL = 'simple_exponential',
  DOUBLE_EXPONENTIAL = 'double_exponential',
  TRIPLE_EXPONENTIAL = 'triple_exponential',
  SEASONAL_DECOMPOSITION = 'seasonal_decomposition'
}

export enum TrendStrength {
  VERY_STRONG = 'very_strong',
  STRONG = 'strong',
  MODERATE = 'moderate',
  WEAK = 'weak',
  VERY_WEAK = 'very_weak',
  NEGLIGIBLE = 'negligible',
  INDETERMINATE = 'indeterminate'
}

// Supporting interfaces for trend analysis
export interface Trend {
  id: string;
  trend_type: TrendType;
  strength: TrendStrength;
  direction: TrendDirection;
  start_date: string;
  end_date: string;
  confidence_score: number;
  statistical_significance: number;
  model_used: StatisticalModel;
  parameters: Record<string, any>;
  forecast_horizon: number;
  accuracy_metrics: TrendAccuracyMetrics;
}

export interface TrendAccuracyMetrics {
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
  r_squared: number; // Coefficient of determination
}

export interface Forecast {
  target_date: string;
  predicted_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  probability: number;
}

export interface Comparison {
  baseline_period: TimePeriod;
  comparison_period: TimePeriod;
  metrics: ComparisonMetric[];
  insights: string[];
}

export interface ComparisonMetric {
  name: string;
  baseline_value: number;
  comparison_value: number;
  change_absolute: number;
  change_percentage: number;
  significance: 'significant' | 'not_significant';
}

// API Error type for service compatibility
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id?: string;
}