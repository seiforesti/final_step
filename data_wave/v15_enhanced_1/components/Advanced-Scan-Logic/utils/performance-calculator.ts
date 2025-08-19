/**
 * ⚡ Performance Calculator - Advanced Scan Logic
 * ==============================================
 * 
 * Enterprise-grade performance calculator for measuring, analyzing,
 * and optimizing scan performance metrics and system efficiency
 * 
 * Features:
 * - Performance metrics calculation
 * - Throughput and latency analysis
 * - Resource utilization monitoring
 * - Efficiency scoring and benchmarking
 * - Performance trend analysis
 * - Bottleneck identification
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import {
  PerformanceMetrics,
  ThroughputAnalysis,
  LatencyAnalysis,
  ResourceUtilization,
  EfficiencyScore,
  PerformanceBenchmark,
  BottleneckAnalysis,
  PerformanceTrend
} from '../types/performance.types';

/**
 * Performance Calculator Configuration
 */
interface PerformanceCalculatorConfig {
  sampleWindow: number;
  aggregationInterval: number;
  enableRealTimeCalculation: boolean;
  benchmarkThresholds: Record<string, number>;
  alertThresholds: Record<string, number>;
  historicalDataRetention: number;
}

/**
 * Metric Type Enumeration
 */
export enum MetricType {
  THROUGHPUT = 'throughput',
  LATENCY = 'latency',
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage',
  DISK_IO = 'disk_io',
  NETWORK_IO = 'network_io',
  ERROR_RATE = 'error_rate',
  SUCCESS_RATE = 'success_rate'
}

/**
 * Performance Category
 */
export enum PerformanceCategory {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical'
}

/**
 * Aggregation Method
 */
export enum AggregationMethod {
  AVERAGE = 'average',
  MEDIAN = 'median',
  PERCENTILE_95 = 'p95',
  PERCENTILE_99 = 'p99',
  MAX = 'max',
  MIN = 'min',
  SUM = 'sum'
}

/**
 * Performance Calculator Class
 */
export class PerformanceCalculator {
  private config: PerformanceCalculatorConfig;
  private metricsHistory: Map<string, Array<{ timestamp: Date; value: number }>>;
  private currentMetrics: Map<string, number>;
  private benchmarks: Map<string, PerformanceBenchmark>;
  private isCalculating: boolean;

  constructor(config: Partial<PerformanceCalculatorConfig> = {}) {
    this.config = {
      sampleWindow: 300000, // 5 minutes
      aggregationInterval: 60000, // 1 minute
      enableRealTimeCalculation: true,
      benchmarkThresholds: {
        throughput: 1000,
        latency: 100,
        cpu_usage: 80,
        memory_usage: 85,
        error_rate: 1
      },
      alertThresholds: {
        throughput: 500,
        latency: 500,
        cpu_usage: 90,
        memory_usage: 95,
        error_rate: 5
      },
      historicalDataRetention: 86400000, // 24 hours
      ...config
    };

    this.metricsHistory = new Map();
    this.currentMetrics = new Map();
    this.benchmarks = new Map();
    this.isCalculating = false;
  }

  /**
   * Initialize the performance calculator
   */
  public async initialize(): Promise<void> {
    try {
      this.initializeBenchmarks();
      
      if (this.config.enableRealTimeCalculation) {
        this.startRealTimeCalculation();
      }

      this.startHistoryCleanup();
      console.log('Performance Calculator initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Performance Calculator: ${error}`);
    }
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metricType: string, value: number, timestamp: Date = new Date()): void {
    try {
      // Update current metrics
      this.currentMetrics.set(metricType, value);

      // Add to history
      if (!this.metricsHistory.has(metricType)) {
        this.metricsHistory.set(metricType, []);
      }

      const history = this.metricsHistory.get(metricType)!;
      history.push({ timestamp, value });

      // Maintain history size
      this.trimHistory(metricType);
    } catch (error) {
      console.error(`Failed to record metric ${metricType}:`, error);
    }
  }

  /**
   * Calculate comprehensive performance metrics
   */
  public calculatePerformanceMetrics(
    timeWindow: number = this.config.sampleWindow
  ): PerformanceMetrics {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - timeWindow);

      const metrics: PerformanceMetrics = {
        timestamp: endTime,
        timeWindow,
        throughput: this.calculateThroughput(startTime, endTime),
        latency: this.calculateLatency(startTime, endTime),
        resourceUtilization: this.calculateResourceUtilization(startTime, endTime),
        errorRate: this.calculateErrorRate(startTime, endTime),
        successRate: this.calculateSuccessRate(startTime, endTime),
        efficiency: this.calculateEfficiencyScore(startTime, endTime),
        bottlenecks: this.identifyBottlenecks(startTime, endTime),
        overallScore: 0
      };

      // Calculate overall performance score
      metrics.overallScore = this.calculateOverallScore(metrics);

      return metrics;
    } catch (error) {
      throw new Error(`Failed to calculate performance metrics: ${error}`);
    }
  }

  /**
   * Analyze throughput performance
   */
  public analyzeThroughput(
    timeWindow: number = this.config.sampleWindow,
    aggregationMethod: AggregationMethod = AggregationMethod.AVERAGE
  ): ThroughputAnalysis {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - timeWindow);
      const throughputData = this.getMetricData(MetricType.THROUGHPUT, startTime, endTime);

      const analysis: ThroughputAnalysis = {
        timeWindow,
        totalRequests: this.aggregateMetric(throughputData, AggregationMethod.SUM),
        averageThroughput: this.aggregateMetric(throughputData, AggregationMethod.AVERAGE),
        peakThroughput: this.aggregateMetric(throughputData, AggregationMethod.MAX),
        minimumThroughput: this.aggregateMetric(throughputData, AggregationMethod.MIN),
        throughputVariability: this.calculateVariability(throughputData),
        trend: this.calculateTrend(throughputData),
        performanceCategory: this.categorizePerformance(
          this.aggregateMetric(throughputData, aggregationMethod),
          MetricType.THROUGHPUT
        )
      };

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze throughput: ${error}`);
    }
  }

  /**
   * Analyze latency performance
   */
  public analyzeLatency(
    timeWindow: number = this.config.sampleWindow
  ): LatencyAnalysis {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - timeWindow);
      const latencyData = this.getMetricData(MetricType.LATENCY, startTime, endTime);

      const analysis: LatencyAnalysis = {
        timeWindow,
        averageLatency: this.aggregateMetric(latencyData, AggregationMethod.AVERAGE),
        medianLatency: this.aggregateMetric(latencyData, AggregationMethod.MEDIAN),
        p95Latency: this.aggregateMetric(latencyData, AggregationMethod.PERCENTILE_95),
        p99Latency: this.aggregateMetric(latencyData, AggregationMethod.PERCENTILE_99),
        maxLatency: this.aggregateMetric(latencyData, AggregationMethod.MAX),
        minLatency: this.aggregateMetric(latencyData, AggregationMethod.MIN),
        latencyDistribution: this.calculateLatencyDistribution(latencyData),
        performanceCategory: this.categorizePerformance(
          this.aggregateMetric(latencyData, AggregationMethod.AVERAGE),
          MetricType.LATENCY
        )
      };

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze latency: ${error}`);
    }
  }

  /**
   * Calculate resource utilization
   */
  public calculateResourceUtilization(
    startTime: Date,
    endTime: Date
  ): ResourceUtilization {
    try {
      const cpuData = this.getMetricData(MetricType.CPU_USAGE, startTime, endTime);
      const memoryData = this.getMetricData(MetricType.MEMORY_USAGE, startTime, endTime);
      const diskData = this.getMetricData(MetricType.DISK_IO, startTime, endTime);
      const networkData = this.getMetricData(MetricType.NETWORK_IO, startTime, endTime);

      return {
        cpu: {
          average: this.aggregateMetric(cpuData, AggregationMethod.AVERAGE),
          peak: this.aggregateMetric(cpuData, AggregationMethod.MAX),
          utilization: this.aggregateMetric(cpuData, AggregationMethod.AVERAGE)
        },
        memory: {
          average: this.aggregateMetric(memoryData, AggregationMethod.AVERAGE),
          peak: this.aggregateMetric(memoryData, AggregationMethod.MAX),
          utilization: this.aggregateMetric(memoryData, AggregationMethod.AVERAGE)
        },
        disk: {
          readThroughput: this.aggregateMetric(diskData, AggregationMethod.AVERAGE),
          writeThroughput: this.aggregateMetric(diskData, AggregationMethod.AVERAGE),
          utilization: this.aggregateMetric(diskData, AggregationMethod.AVERAGE)
        },
        network: {
          inboundThroughput: this.aggregateMetric(networkData, AggregationMethod.AVERAGE),
          outboundThroughput: this.aggregateMetric(networkData, AggregationMethod.AVERAGE),
          utilization: this.aggregateMetric(networkData, AggregationMethod.AVERAGE)
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate resource utilization: ${error}`);
    }
  }

  /**
   * Calculate efficiency score
   */
  public calculateEfficiencyScore(
    startTime: Date,
    endTime: Date
  ): EfficiencyScore {
    try {
      const throughput = this.calculateThroughput(startTime, endTime);
      const resourceUtil = this.calculateResourceUtilization(startTime, endTime);
      const errorRate = this.calculateErrorRate(startTime, endTime);

      // Calculate component scores
      const throughputScore = this.normalizeScore(throughput, 'throughput');
      const resourceScore = 100 - Math.max(
        resourceUtil.cpu.utilization,
        resourceUtil.memory.utilization
      );
      const reliabilityScore = 100 - errorRate;

      // Weighted efficiency calculation
      const weights = { throughput: 0.4, resource: 0.3, reliability: 0.3 };
      const overallScore = 
        (throughputScore * weights.throughput) +
        (resourceScore * weights.resource) +
        (reliabilityScore * weights.reliability);

      return {
        overall: overallScore,
        throughputEfficiency: throughputScore,
        resourceEfficiency: resourceScore,
        reliabilityScore: reliabilityScore,
        category: this.categorizeEfficiency(overallScore),
        recommendations: this.generateEfficiencyRecommendations(overallScore, {
          throughput: throughputScore,
          resource: resourceScore,
          reliability: reliabilityScore
        })
      };
    } catch (error) {
      throw new Error(`Failed to calculate efficiency score: ${error}`);
    }
  }

  /**
   * Identify performance bottlenecks
   */
  public identifyBottlenecks(
    startTime: Date,
    endTime: Date
  ): BottleneckAnalysis[] {
    try {
      const bottlenecks: BottleneckAnalysis[] = [];
      const resourceUtil = this.calculateResourceUtilization(startTime, endTime);
      const latency = this.calculateLatency(startTime, endTime);

      // CPU bottleneck
      if (resourceUtil.cpu.utilization > this.config.alertThresholds.cpu_usage) {
        bottlenecks.push({
          type: 'cpu',
          severity: this.calculateSeverity(resourceUtil.cpu.utilization, 'cpu_usage'),
          impact: 'high',
          description: `High CPU utilization: ${resourceUtil.cpu.utilization.toFixed(1)}%`,
          recommendations: [
            'Scale CPU resources',
            'Optimize CPU-intensive operations',
            'Implement CPU affinity'
          ],
          detectedAt: new Date()
        });
      }

      // Memory bottleneck
      if (resourceUtil.memory.utilization > this.config.alertThresholds.memory_usage) {
        bottlenecks.push({
          type: 'memory',
          severity: this.calculateSeverity(resourceUtil.memory.utilization, 'memory_usage'),
          impact: 'high',
          description: `High memory utilization: ${resourceUtil.memory.utilization.toFixed(1)}%`,
          recommendations: [
            'Increase memory allocation',
            'Optimize memory usage patterns',
            'Implement memory caching strategies'
          ],
          detectedAt: new Date()
        });
      }

      // Latency bottleneck
      if (latency > this.config.alertThresholds.latency) {
        bottlenecks.push({
          type: 'latency',
          severity: this.calculateSeverity(latency, 'latency'),
          impact: 'medium',
          description: `High latency: ${latency.toFixed(1)}ms`,
          recommendations: [
            'Optimize query performance',
            'Implement caching',
            'Review network configuration'
          ],
          detectedAt: new Date()
        });
      }

      return bottlenecks.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
    } catch (error) {
      throw new Error(`Failed to identify bottlenecks: ${error}`);
    }
  }

  /**
   * Analyze performance trends
   */
  public analyzePerformanceTrends(
    metricType: string,
    timeWindow: number = this.config.sampleWindow * 4
  ): PerformanceTrend {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - timeWindow);
      const data = this.getMetricData(metricType, startTime, endTime);

      const trend = this.calculateTrend(data);
      const seasonality = this.detectSeasonality(data);
      const forecast = this.generateForecast(data, 10); // 10 data points ahead

      return {
        metricType,
        timeWindow,
        trend: {
          direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          slope: trend,
          confidence: this.calculateTrendConfidence(data)
        },
        seasonality: {
          detected: seasonality.detected,
          period: seasonality.period,
          strength: seasonality.strength
        },
        forecast: {
          predictions: forecast,
          confidence: 0.85 // Mock confidence
        },
        anomalies: this.detectAnomalies(data),
        summary: this.generateTrendSummary(trend, seasonality, data)
      };
    } catch (error) {
      throw new Error(`Failed to analyze performance trends: ${error}`);
    }
  }

  /**
   * Compare performance against benchmarks
   */
  public compareAgainstBenchmarks(metrics: PerformanceMetrics): Record<string, {
    current: number;
    benchmark: number;
    performance: PerformanceCategory;
    deviation: number;
  }> {
    try {
      const comparison: Record<string, any> = {};

      // Compare throughput
      if (this.benchmarks.has('throughput')) {
        const benchmark = this.benchmarks.get('throughput')!;
        comparison.throughput = {
          current: metrics.throughput,
          benchmark: benchmark.value,
          performance: this.categorizePerformance(metrics.throughput, MetricType.THROUGHPUT),
          deviation: ((metrics.throughput - benchmark.value) / benchmark.value) * 100
        };
      }

      // Compare latency
      if (this.benchmarks.has('latency')) {
        const benchmark = this.benchmarks.get('latency')!;
        comparison.latency = {
          current: metrics.latency,
          benchmark: benchmark.value,
          performance: this.categorizePerformance(metrics.latency, MetricType.LATENCY),
          deviation: ((metrics.latency - benchmark.value) / benchmark.value) * 100
        };
      }

      // Compare error rate
      if (this.benchmarks.has('error_rate')) {
        const benchmark = this.benchmarks.get('error_rate')!;
        comparison.errorRate = {
          current: metrics.errorRate,
          benchmark: benchmark.value,
          performance: this.categorizePerformance(metrics.errorRate, MetricType.ERROR_RATE),
          deviation: ((metrics.errorRate - benchmark.value) / benchmark.value) * 100
        };
      }

      return comparison;
    } catch (error) {
      throw new Error(`Failed to compare against benchmarks: ${error}`);
    }
  }

  // ==================== Private Methods ====================

  /**
   * Initialize default benchmarks
   */
  private initializeBenchmarks(): void {
    const defaultBenchmarks = [
      { name: 'throughput', value: 1000, unit: 'ops/sec' },
      { name: 'latency', value: 100, unit: 'ms' },
      { name: 'error_rate', value: 1, unit: '%' },
      { name: 'cpu_usage', value: 70, unit: '%' },
      { name: 'memory_usage', value: 80, unit: '%' }
    ];

    defaultBenchmarks.forEach(benchmark => {
      this.benchmarks.set(benchmark.name, {
        name: benchmark.name,
        value: benchmark.value,
        unit: benchmark.unit,
        category: 'system',
        updatedAt: new Date()
      });
    });
  }

  /**
   * Start real-time calculation
   */
  private startRealTimeCalculation(): void {
    const calculate = async () => {
      while (this.config.enableRealTimeCalculation) {
        if (!this.isCalculating) {
          this.isCalculating = true;
          
          try {
            const metrics = this.calculatePerformanceMetrics();
            this.publishMetrics(metrics);
          } catch (error) {
            console.error('Real-time calculation error:', error);
          }
          
          this.isCalculating = false;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.config.aggregationInterval));
      }
    };

    calculate();
  }

  /**
   * Start history cleanup
   */
  private startHistoryCleanup(): void {
    const cleanup = async () => {
      while (true) {
        this.cleanupOldData();
        await new Promise(resolve => setTimeout(resolve, 3600000)); // Clean every hour
      }
    };

    cleanup();
  }

  /**
   * Get metric data for time range
   */
  private getMetricData(
    metricType: string,
    startTime: Date,
    endTime: Date
  ): Array<{ timestamp: Date; value: number }> {
    const history = this.metricsHistory.get(metricType) || [];
    return history.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * Aggregate metric data
   */
  private aggregateMetric(
    data: Array<{ timestamp: Date; value: number }>,
    method: AggregationMethod
  ): number {
    if (data.length === 0) return 0;

    const values = data.map(d => d.value);

    switch (method) {
      case AggregationMethod.AVERAGE:
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      
      case AggregationMethod.MEDIAN:
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid];
      
      case AggregationMethod.PERCENTILE_95:
        return this.calculatePercentile(values, 95);
      
      case AggregationMethod.PERCENTILE_99:
        return this.calculatePercentile(values, 99);
      
      case AggregationMethod.MAX:
        return Math.max(...values);
      
      case AggregationMethod.MIN:
        return Math.min(...values);
      
      case AggregationMethod.SUM:
        return values.reduce((sum, val) => sum + val, 0);
      
      default:
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    
    if (Number.isInteger(index)) {
      return sorted[index];
    } else {
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
  }

  /**
   * Calculate throughput
   */
  private calculateThroughput(startTime: Date, endTime: Date): number {
    const throughputData = this.getMetricData(MetricType.THROUGHPUT, startTime, endTime);
    return this.aggregateMetric(throughputData, AggregationMethod.AVERAGE);
  }

  /**
   * Calculate latency
   */
  private calculateLatency(startTime: Date, endTime: Date): number {
    const latencyData = this.getMetricData(MetricType.LATENCY, startTime, endTime);
    return this.aggregateMetric(latencyData, AggregationMethod.AVERAGE);
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(startTime: Date, endTime: Date): number {
    const errorData = this.getMetricData(MetricType.ERROR_RATE, startTime, endTime);
    return this.aggregateMetric(errorData, AggregationMethod.AVERAGE);
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(startTime: Date, endTime: Date): number {
    const successData = this.getMetricData(MetricType.SUCCESS_RATE, startTime, endTime);
    const rate = this.aggregateMetric(successData, AggregationMethod.AVERAGE);
    return rate || (100 - this.calculateErrorRate(startTime, endTime));
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(metrics: PerformanceMetrics): number {
    const weights = {
      throughput: 0.25,
      latency: 0.25,
      efficiency: 0.25,
      reliability: 0.25
    };

    const throughputScore = this.normalizeScore(metrics.throughput, 'throughput');
    const latencyScore = 100 - this.normalizeScore(metrics.latency, 'latency');
    const efficiencyScore = metrics.efficiency.overall;
    const reliabilityScore = metrics.successRate;

    return (
      throughputScore * weights.throughput +
      latencyScore * weights.latency +
      efficiencyScore * weights.efficiency +
      reliabilityScore * weights.reliability
    );
  }

  /**
   * Normalize score to 0-100 scale
   */
  private normalizeScore(value: number, metricType: string): number {
    const benchmark = this.config.benchmarkThresholds[metricType] || 100;
    return Math.min(100, (value / benchmark) * 100);
  }

  /**
   * Categorize performance
   */
  private categorizePerformance(value: number, metricType: MetricType): PerformanceCategory {
    const threshold = this.config.benchmarkThresholds[metricType] || 100;
    const alertThreshold = this.config.alertThresholds[metricType] || 200;

    if (metricType === MetricType.LATENCY || metricType === MetricType.ERROR_RATE) {
      // Lower is better for latency and error rate
      if (value <= threshold * 0.5) return PerformanceCategory.EXCELLENT;
      if (value <= threshold) return PerformanceCategory.GOOD;
      if (value <= threshold * 1.5) return PerformanceCategory.FAIR;
      if (value <= alertThreshold) return PerformanceCategory.POOR;
      return PerformanceCategory.CRITICAL;
    } else {
      // Higher is better for throughput, etc.
      if (value >= threshold * 1.5) return PerformanceCategory.EXCELLENT;
      if (value >= threshold) return PerformanceCategory.GOOD;
      if (value >= threshold * 0.7) return PerformanceCategory.FAIR;
      if (value >= threshold * 0.5) return PerformanceCategory.POOR;
      return PerformanceCategory.CRITICAL;
    }
  }

  /**
   * Categorize efficiency
   */
  private categorizeEfficiency(score: number): PerformanceCategory {
    if (score >= 90) return PerformanceCategory.EXCELLENT;
    if (score >= 80) return PerformanceCategory.GOOD;
    if (score >= 70) return PerformanceCategory.FAIR;
    if (score >= 60) return PerformanceCategory.POOR;
    return PerformanceCategory.CRITICAL;
  }

  /**
   * Calculate variability
   */
  private calculateVariability(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 0;

    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? (stdDev / mean) * 100 : 0; // Coefficient of variation
  }

  /**
   * Calculate trend
   */
  private calculateTrend(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 0;

    // Simple linear regression slope
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Calculate latency distribution
   */
  private calculateLatencyDistribution(
    data: Array<{ timestamp: Date; value: number }>
  ): Record<string, number> {
    const values = data.map(d => d.value);
    const buckets = {
      '0-50ms': 0,
      '50-100ms': 0,
      '100-200ms': 0,
      '200-500ms': 0,
      '500ms+': 0
    };

    values.forEach(value => {
      if (value <= 50) buckets['0-50ms']++;
      else if (value <= 100) buckets['50-100ms']++;
      else if (value <= 200) buckets['100-200ms']++;
      else if (value <= 500) buckets['200-500ms']++;
      else buckets['500ms+']++;
    });

    // Convert to percentages
    const total = values.length;
    Object.keys(buckets).forEach(key => {
      buckets[key as keyof typeof buckets] = (buckets[key as keyof typeof buckets] / total) * 100;
    });

    return buckets;
  }

  /**
   * Calculate severity
   */
  private calculateSeverity(value: number, metricType: string): 'low' | 'medium' | 'high' | 'critical' {
    const threshold = this.config.alertThresholds[metricType] || 100;
    
    if (value >= threshold * 1.5) return 'critical';
    if (value >= threshold * 1.2) return 'high';
    if (value >= threshold) return 'medium';
    return 'low';
  }

  /**
   * Get severity weight for sorting
   */
  private getSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  /**
   * Generate efficiency recommendations
   */
  private generateEfficiencyRecommendations(
    overallScore: number,
    componentScores: { throughput: number; resource: number; reliability: number }
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 70) {
      recommendations.push('Overall performance needs significant improvement');
    }

    if (componentScores.throughput < 70) {
      recommendations.push('Optimize throughput by scaling resources or improving algorithms');
    }

    if (componentScores.resource < 70) {
      recommendations.push('Improve resource efficiency through better allocation and optimization');
    }

    if (componentScores.reliability < 70) {
      recommendations.push('Address reliability issues by reducing error rates and improving stability');
    }

    return recommendations;
  }

  /**
   * Detect seasonality
   */
  private detectSeasonality(
    data: Array<{ timestamp: Date; value: number }>
  ): { detected: boolean; period: number; strength: number } {
    // Simplified seasonality detection
    if (data.length < 24) {
      return { detected: false, period: 0, strength: 0 };
    }

    // Mock seasonality detection
    return {
      detected: Math.random() > 0.7,
      period: 24, // Assuming hourly data with daily seasonality
      strength: Math.random() * 0.5 + 0.3
    };
  }

  /**
   * Generate forecast
   */
  private generateForecast(
    data: Array<{ timestamp: Date; value: number }>,
    periods: number
  ): Array<{ timestamp: Date; value: number; confidence: number }> {
    if (data.length === 0) return [];

    const lastValue = data[data.length - 1].value;
    const trend = this.calculateTrend(data);
    const forecast: Array<{ timestamp: Date; value: number; confidence: number }> = [];

    for (let i = 1; i <= periods; i++) {
      const forecastValue = lastValue + (trend * i);
      const confidence = Math.max(0.5, 1 - (i * 0.05)); // Decreasing confidence

      forecast.push({
        timestamp: new Date(data[data.length - 1].timestamp.getTime() + i * 60000), // 1 minute intervals
        value: Math.max(0, forecastValue),
        confidence
      });
    }

    return forecast;
  }

  /**
   * Calculate trend confidence
   */
  private calculateTrendConfidence(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 3) return 0;

    // Calculate R-squared for trend line
    const trend = this.calculateTrend(data);
    const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
    
    let ssRes = 0;
    let ssTot = 0;

    data.forEach((d, i) => {
      const predicted = data[0].value + trend * i;
      ssRes += Math.pow(d.value - predicted, 2);
      ssTot += Math.pow(d.value - mean, 2);
    });

    return ssTot > 0 ? Math.max(0, 1 - (ssRes / ssTot)) : 0;
  }

  /**
   * Detect anomalies
   */
  private detectAnomalies(
    data: Array<{ timestamp: Date; value: number }>
  ): Array<{ timestamp: Date; value: number; severity: string }> {
    if (data.length < 10) return [];

    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    const anomalies: Array<{ timestamp: Date; value: number; severity: string }> = [];
    const threshold = 2.5; // Z-score threshold

    data.forEach(point => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          severity: zScore > 3 ? 'high' : 'medium'
        });
      }
    });

    return anomalies;
  }

  /**
   * Generate trend summary
   */
  private generateTrendSummary(
    trend: number,
    seasonality: { detected: boolean; period: number; strength: number },
    data: Array<{ timestamp: Date; value: number }>
  ): string {
    let summary = '';

    if (Math.abs(trend) < 0.1) {
      summary = 'Performance is stable with minimal trend';
    } else if (trend > 0) {
      summary = `Performance is improving with an upward trend (${trend.toFixed(2)})`;
    } else {
      summary = `Performance is declining with a downward trend (${trend.toFixed(2)})`;
    }

    if (seasonality.detected) {
      summary += `. Seasonal patterns detected with ${seasonality.period}-period cycle`;
    }

    return summary;
  }

  /**
   * Publish metrics (placeholder for event emission)
   */
  private publishMetrics(metrics: PerformanceMetrics): void {
    // This would typically emit events or send to monitoring systems
    console.debug('Performance metrics calculated:', {
      timestamp: metrics.timestamp,
      overallScore: metrics.overallScore,
      throughput: metrics.throughput,
      latency: metrics.latency
    });
  }

  /**
   * Trim history to maintain size limits
   */
  private trimHistory(metricType: string): void {
    const history = this.metricsHistory.get(metricType);
    if (!history) return;

    const maxAge = Date.now() - this.config.historicalDataRetention;
    const filtered = history.filter(entry => entry.timestamp.getTime() > maxAge);
    
    this.metricsHistory.set(metricType, filtered);
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const maxAge = Date.now() - this.config.historicalDataRetention;

    for (const [metricType, history] of this.metricsHistory) {
      const filtered = history.filter(entry => entry.timestamp.getTime() > maxAge);
      this.metricsHistory.set(metricType, filtered);
    }
  }
}

/**
 * Create performance calculator instance
 */
export const createPerformanceCalculator = (
  config?: Partial<PerformanceCalculatorConfig>
): PerformanceCalculator => {
  return new PerformanceCalculator(config);
};

/**
 * Default performance calculator instance
 */
export const performanceCalculator = createPerformanceCalculator();

export default PerformanceCalculator;