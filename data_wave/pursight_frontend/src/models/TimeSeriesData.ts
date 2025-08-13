/**
 * TimeSeriesData model representing time-based metrics for dashboard visualizations
 */
export interface TimeSeriesData {
  // Time periods for the x-axis
  periods: string[];
  
  // Available metrics in this time series
  metrics: string[];
  
  // Data series for each metric
  series: Record<string, number[]>;
  
  // Optional metadata for each metric
  metadata?: Record<string, {
    label: string;
    description?: string;
    unit?: string;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
    changePercent?: number;
  }>;
  
  // Time range information
  timeRange: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  
  // Last updated timestamp
  lastUpdated: string;
}

/**
 * Scan activity time series
 */
export interface ScanTimeSeriesData extends TimeSeriesData {
  // Predefined metrics for scan activity
  series: {
    scanCount: number[];
    successfulScans: number[];
    failedScans: number[];
    entitiesScanned: number[];
    entitiesAdded: number[];
    entitiesUpdated: number[];
    entitiesRemoved: number[];
    scanDuration: number[];
    [key: string]: number[];
  };
}

/**
 * Metadata activity time series
 */
export interface MetadataTimeSeriesData extends TimeSeriesData {
  // Predefined metrics for metadata activity
  series: {
    totalEntities: number[];
    newEntities: number[];
    updatedEntities: number[];
    deletedEntities: number[];
    classifiedEntities: number[];
    sensitiveEntities: number[];
    entitiesWithDescription: number[];
    entitiesWithOwner: number[];
    [key: string]: number[];
  };
}

/**
 * Compliance activity time series
 */
export interface ComplianceTimeSeriesData extends TimeSeriesData {
  // Predefined metrics for compliance activity
  series: {
    complianceScore: number[];
    openIssues: number[];
    resolvedIssues: number[];
    criticalIssues: number[];
    highIssues: number[];
    mediumIssues: number[];
    lowIssues: number[];
    averageResolutionTime: number[];
    [key: string]: number[];
  };
}

/**
 * Usage activity time series
 */
export interface UsageTimeSeriesData extends TimeSeriesData {
  // Predefined metrics for usage activity
  series: {
    activeUsers: number[];
    searches: number[];
    apiCalls: number[];
    dataAccess: number[];
    downloads: number[];
    uploads: number[];
    pageViews: number[];
    averageSessionDuration: number[];
    [key: string]: number[];
  };
}

/**
 * Multi-metric time series for comparison
 */
export interface MultiMetricTimeSeriesData {
  // Time periods for the x-axis
  periods: string[];
  
  // Multiple metrics to compare
  metrics: Array<{
    id: string;
    name: string;
    description?: string;
    values: number[];
    unit?: string;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
    changePercent?: number;
  }>;
  
  // Time range information
  timeRange: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  
  // Comparison information
  comparison?: {
    type: 'previous_period' | 'year_over_year' | 'custom';
    label: string;
    metrics: Array<{
      id: string;
      values: number[];
    }>;
  };
  
  // Last updated timestamp
  lastUpdated: string;
}

/**
 * Forecast time series with predictions
 */
export interface ForecastTimeSeriesData extends TimeSeriesData {
  // Historical periods
  historicalPeriods: string[];
  
  // Forecast periods
  forecastPeriods: string[];
  
  // Historical data
  historical: Record<string, number[]>;
  
  // Forecast data
  forecast: Record<string, number[]>;
  
  // Confidence intervals (optional)
  confidenceIntervals?: Record<string, Array<{
    upper: number[];
    lower: number[];
    confidence: number; // e.g., 0.95 for 95% confidence
  }>>;
  
  // Forecast metadata
  forecastMetadata?: {
    generatedAt: string;
    model: string;
    accuracy: number;
    factors?: string[];
  };
}