// Advanced Workflow Analytics Utilities - aligned to backend
// Maps to: /api/v1/workflow/analytics

import { 
  ANALYTICS_METRICS, 
  ANALYTICS_DIMENSIONS, 
  ANALYTICS_AGGREGATIONS,
  ALERT_THRESHOLDS,
  TIME_PERIODS 
} from '../constants/workflow-analytics';

// Core formatting functions for analytics data
export const formatMetricValue = (value: number, metric: string, precision: number = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  
  // Handle different metric types
  switch (metric) {
    case ANALYTICS_METRICS.EXECUTION_TIME:
    case ANALYTICS_METRICS.LATENCY:
    case ANALYTICS_METRICS.RESPONSE_TIME:
    case ANALYTICS_METRICS.PROCESSING_TIME:
      return formatDuration(value);
    
    case ANALYTICS_METRICS.SUCCESS_RATE:
    case ANALYTICS_METRICS.FAILURE_RATE:
    case ANALYTICS_METRICS.COMPLIANCE_SCORE:
    case ANALYTICS_METRICS.QUALITY_SCORE:
      return formatPercentage(value);
    
    case ANALYTICS_METRICS.CPU_USAGE:
    case ANALYTICS_METRICS.MEMORY_USAGE:
    case ANALYTICS_METRICS.RESOURCE_UTILIZATION:
      return formatPercentage(value);
    
    case ANALYTICS_METRICS.THROUGHPUT:
    case ANALYTICS_METRICS.EXECUTION_COUNT:
    case ANALYTICS_METRICS.ERROR_COUNT:
      return formatNumber(value);
    
    case ANALYTICS_METRICS.COST_PER_EXECUTION:
    case ANALYTICS_METRICS.BUSINESS_VALUE:
      return formatCurrency(value);
    
    default:
      return formatNumber(value, precision);
  }
};

export const formatPercentage = (value: number, precision: number = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  
  // Convert decimal to percentage if needed
  const percentage = value <= 1 ? value * 100 : value;
  return `${percentage.toFixed(precision)}%`;
};

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds === null || milliseconds === undefined) return 'N/A';
  
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  
  if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }
  
  if (milliseconds < 3600000) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

export const formatNumber = (value: number, precision: number = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(precision)}M`;
  }
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(precision)}K`;
  }
  
  return value.toFixed(precision);
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Advanced analytics calculations
export const calculateTrend = (data: number[], period: number = 7): {
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  confidence: number;
  change: number;
} => {
  if (data.length < period) {
    return { trend: 'stable', slope: 0, confidence: 0, change: 0 };
  }
  
  const recentData = data.slice(-period);
  const x = Array.from({ length: recentData.length }, (_, i) => i);
  const y = recentData;
  
  // Linear regression calculation
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared for confidence
  const yMean = sumY / n;
  const ssRes = y.reduce((a, b, i) => a + Math.pow(b - (slope * x[i] + intercept), 2), 0);
  const ssTot = y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
  const confidence = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  
  // Calculate percentage change
  const firstValue = recentData[0];
  const lastValue = recentData[recentData.length - 1];
  const change = firstValue === 0 ? 0 : ((lastValue - firstValue) / firstValue) * 100;
  
  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(slope) < 0.01) {
    trend = 'stable';
  } else if (slope > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  
  return { trend, slope, confidence, change };
};

export const detectAnomalies = (data: number[], threshold: number = 2): {
  anomalies: Array<{ index: number; value: number; score: number }>;
  mean: number;
  stdDev: number;
} => {
  if (data.length < 3) {
    return { anomalies: [], mean: 0, stdDev: 0 };
  }
  
  // Calculate mean and standard deviation
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  // Detect anomalies using z-score
  const anomalies = data
    .map((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      return { index, value, score: zScore };
    })
    .filter(item => item.score > threshold)
    .sort((a, b) => b.score - a.score);
  
  return { anomalies, mean, stdDev };
};

export const calculateMovingAverage = (data: number[], window: number): number[] => {
  if (data.length < window) return data;
  
  const result: number[] = [];
  
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }
  
  return result;
};

export const calculatePercentile = (data: number[], percentile: number): number => {
  if (data.length === 0) return 0;
  
  const sortedData = [...data].sort((a, b) => a - b);
  const index = (percentile / 100) * (sortedData.length - 1);
  
  if (Number.isInteger(index)) {
    return sortedData[index];
  }
  
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
};

// Performance analysis functions
export const analyzePerformance = (metrics: Record<string, number[]>): {
  summary: Record<string, any>;
  recommendations: string[];
  alerts: Array<{ metric: string; level: 'warning' | 'critical'; message: string }>;
} => {
  const summary: Record<string, any> = {};
  const recommendations: string[] = [];
  const alerts: Array<{ metric: string; level: 'warning' | 'critical'; message: string }> = [];
  
  Object.entries(metrics).forEach(([metric, values]) => {
    if (values.length === 0) return;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const p95 = calculatePercentile(values, 95);
    const p99 = calculatePercentile(values, 99);
    
    summary[metric] = { mean, min, max, p95, p99 };
    
    // Check thresholds and generate alerts
    if (metric === ANALYTICS_METRICS.EXECUTION_TIME || metric === ANALYTICS_METRICS.LATENCY) {
      if (p95 > ALERT_THRESHOLDS.CRITICAL_LATENCY) {
        alerts.push({
          metric,
          level: 'critical',
          message: `95th percentile ${metric} exceeds critical threshold`
        });
      } else if (p95 > ALERT_THRESHOLDS.WARNING_LATENCY) {
        alerts.push({
          metric,
          level: 'warning',
          message: `95th percentile ${metric} exceeds warning threshold`
        });
      }
    }
    
    if (metric === ANALYTICS_METRICS.SUCCESS_RATE) {
      if (mean < ALERT_THRESHOLDS.CRITICAL_SUCCESS_RATE) {
        alerts.push({
          metric,
          level: 'critical',
          message: `Average ${metric} below critical threshold`
        });
      } else if (mean < ALERT_THRESHOLDS.WARNING_SUCCESS_RATE) {
        alerts.push({
          metric,
          level: 'warning',
          message: `Average ${metric} below warning threshold`
        });
      }
    }
    
    if (metric === ANALYTICS_METRICS.FAILURE_RATE) {
      if (mean > ALERT_THRESHOLDS.CRITICAL_ERROR_RATE) {
        alerts.push({
          metric,
          level: 'critical',
          message: `Average ${metric} above critical threshold`
        });
      } else if (mean > ALERT_THRESHOLDS.WARNING_ERROR_RATE) {
        alerts.push({
          metric,
          level: 'warning',
          message: `Average ${metric} above warning threshold`
        });
      }
    }
  });
  
  // Generate recommendations based on analysis
  if (summary[ANALYTICS_METRICS.EXECUTION_TIME]?.p95 > ALERT_THRESHOLDS.WARNING_LATENCY) {
    recommendations.push('Consider optimizing workflow execution paths or adding caching');
  }
  
  if (summary[ANALYTICS_METRICS.SUCCESS_RATE]?.mean < ALERT_THRESHOLDS.WARNING_SUCCESS_RATE) {
    recommendations.push('Investigate workflow failure patterns and improve error handling');
  }
  
  if (summary[ANALYTICS_METRICS.FAILURE_RATE]?.mean > ALERT_THRESHOLDS.WARNING_ERROR_RATE) {
    recommendations.push('Review error logs and implement better error prevention strategies');
  }
  
  return { summary, recommendations, alerts };
};

// Data aggregation functions
export const aggregateData = (
  data: any[],
  groupBy: string[],
  aggregations: Record<string, string>
): any[] => {
  const groups = new Map<string, any[]>();
  
  // Group data
  data.forEach(item => {
    const key = groupBy.map(field => item[field]).join('|');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });
  
  // Apply aggregations
  return Array.from(groups.entries()).map(([key, groupData]) => {
    const result: any = {};
    
    // Add group fields
    const groupValues = key.split('|');
    groupBy.forEach((field, index) => {
      result[field] = groupValues[index];
    });
    
    // Apply aggregations
    Object.entries(aggregations).forEach(([field, aggregation]) => {
      const values = groupData.map(item => item[field]).filter(v => v !== null && v !== undefined);
      
      switch (aggregation) {
        case ANALYTICS_AGGREGATIONS.COUNT:
          result[`${field}_count`] = values.length;
          break;
        case ANALYTICS_AGGREGATIONS.SUM:
          result[`${field}_sum`] = values.reduce((a, b) => a + b, 0);
          break;
        case ANALYTICS_AGGREGATIONS.AVERAGE:
          result[`${field}_avg`] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case ANALYTICS_AGGREGATIONS.MIN:
          result[`${field}_min`] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case ANALYTICS_AGGREGATIONS.MAX:
          result[`${field}_max`] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case ANALYTICS_AGGREGATIONS.MEDIAN:
          result[`${field}_median`] = values.length > 0 ? calculatePercentile(values, 50) : 0;
          break;
        case ANALYTICS_AGGREGATIONS.PERCENTILE_95:
          result[`${field}_p95`] = values.length > 0 ? calculatePercentile(values, 95) : 0;
          break;
        case ANALYTICS_AGGREGATIONS.PERCENTILE_99:
          result[`${field}_p99`] = values.length > 0 ? calculatePercentile(values, 99) : 0;
          break;
      }
    });
    
    return result;
  });
};

// Export all utilities
export const workflowAnalyticsUtils = {
  formatMetricValue,
  formatPercentage,
  formatDuration,
  formatNumber,
  formatCurrency,
  calculateTrend,
  detectAnomalies,
  calculateMovingAverage,
  calculatePercentile,
  analyzePerformance,
  aggregateData
};

// Additional analytics functions
export const calculateStandardDeviation = (data: number[]): number => {
  if (data.length === 0) return 0;
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDifferences = data.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / data.length;
  
  return Math.sqrt(variance);
};

export const calculateVariance = (data: number[]): number => {
  if (data.length === 0) return 0;
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDifferences = data.map(val => Math.pow(val - mean, 2));
  
  return squaredDifferences.reduce((sum, val) => sum + val, 0) / data.length;
};

export const calculateSeasonality = (data: number[], period: number): number[] => {
  if (data.length < period * 2) return [];
  
  const seasonalPatterns: number[] = [];
  
  for (let i = 0; i < period; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = i; j < data.length; j += period) {
      sum += data[j];
      count++;
    }
    
    seasonalPatterns.push(count > 0 ? sum / count : 0);
  }
  
  return seasonalPatterns;
};

export const calculateCyclicality = (data: number[], minPeriod: number = 2, maxPeriod: number = data.length / 2): number => {
  if (data.length < minPeriod * 2) return 0;
  
  let maxCorrelation = 0;
  let bestPeriod = minPeriod;
  
  for (let period = minPeriod; period <= Math.min(maxPeriod, data.length / 2); period++) {
    const correlation = calculateAutocorrelation(data, period);
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }
  
  return maxCorrelation;
};

export const calculateForecast = (data: number[], periods: number, method: 'linear' | 'exponential' | 'moving_average' = 'linear'): number[] => {
  switch (method) {
    case 'linear':
      return calculateLinearForecast(data, periods);
    case 'exponential':
      return calculateExponentialForecast(data, periods);
    case 'moving_average':
      return calculateMovingAverageForecast(data, periods);
    default:
      return calculateLinearForecast(data, periods);
  }
};

export const calculateReliability = (successCount: number, totalCount: number): number => {
  if (totalCount === 0) return 0;
  return successCount / totalCount;
};

export const calculateStability = (data: number[]): number => {
  if (data.length < 2) return 1;
  
  const variance = calculateVariance(data);
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  
  if (mean === 0) return 1;
  
  const coefficientOfVariation = Math.sqrt(variance) / Math.abs(mean);
  return Math.max(0, 1 - coefficientOfVariation);
};

export const formatTimestamp = (timestamp: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    case 'relative':
      return formatRelativeTime(date);
    default:
      return date.toISOString();
  }
};

// Helper functions
const calculateAutocorrelation = (data: number[], lag: number): number => {
  if (lag >= data.length) return 0;
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = calculateVariance(data);
  
  if (variance === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < data.length - lag; i++) {
    sum += (data[i] - mean) * (data[i + lag] - mean);
  }
  
  return sum / ((data.length - lag) * variance);
};

const calculateLinearForecast = (data: number[], periods: number): number[] => {
  if (data.length < 2) return Array(periods).fill(data[0] || 0);
  
  const n = data.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = data.reduce((sum, val) => sum + val, 0);
  const sumXY = data.reduce((sum, val, index) => sum + val * index, 0);
  const sumX2 = data.reduce((sum, val, index) => sum + index * index, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const forecast: number[] = [];
  for (let i = 0; i < periods; i++) {
    forecast.push(slope * (n + i) + intercept);
  }
  
  return forecast;
};

const calculateExponentialForecast = (data: number[], periods: number): number[] => {
  if (data.length < 2) return Array(periods).fill(data[0] || 0);
  
  const alpha = 0.3; // Smoothing factor
  let forecast = data[0];
  const forecasts: number[] = [];
  
  for (let i = 0; i < periods; i++) {
    forecast = alpha * data[data.length - 1] + (1 - alpha) * forecast;
    forecasts.push(forecast);
  }
  
  return forecasts;
};

const calculateMovingAverageForecast = (data: number[], periods: number): number[] => {
  if (data.length < 3) return Array(periods).fill(data[0] || 0);
  
  const window = Math.min(3, data.length);
  const movingAverage = data.slice(-window).reduce((sum, val) => sum + val, 0) / window;
  
  return Array(periods).fill(movingAverage);
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export default workflowAnalyticsUtils;
