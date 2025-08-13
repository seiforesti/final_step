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