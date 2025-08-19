/**
 * Advanced Performance Calculator
 * Comprehensive utility for calculating performance metrics, benchmarks, trends, and optimization scores
 */

// Types
export interface PerformanceMetrics {
  executionTime: ExecutionTimeMetrics;
  throughput: ThroughputMetrics;
  resourceUsage: ResourceUsageMetrics;
  accuracy: AccuracyMetrics;
  reliability: ReliabilityMetrics;
  efficiency: EfficiencyMetrics;
  cost: CostMetrics;
  scalability: ScalabilityMetrics;
}

export interface ExecutionTimeMetrics {
  mean: number;
  median: number;
  mode: number;
  min: number;
  max: number;
  standardDeviation: number;
  variance: number;
  percentiles: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    p99_9: number;
  };
  trend: TrendData;
}

export interface ThroughputMetrics {
  recordsPerSecond: number;
  recordsPerMinute: number;
  recordsPerHour: number;
  bytesPerSecond: number;
  operationsPerSecond: number;
  concurrentOperations: number;
  queueDepth: number;
  utilization: number;
  trend: TrendData;
}

export interface ResourceUsageMetrics {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  disk: ResourceMetric;
  network: ResourceMetric;
  gpu?: ResourceMetric;
  overall: ResourceMetric;
}

export interface ResourceMetric {
  current: number;
  average: number;
  peak: number;
  minimum: number;
  utilization: number;
  efficiency: number;
  cost: number;
  trend: TrendData;
}

export interface AccuracyMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  specificity: number;
  sensitivity: number;
  auc: number;
  confusionMatrix: ConfusionMatrix;
  classificationReport: ClassificationReport;
}

export interface ConfusionMatrix {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  total: number;
}

export interface ClassificationReport {
  classes: Record<string, {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  }>;
  macro: {
    precision: number;
    recall: number;
    f1Score: number;
  };
  weighted: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface ReliabilityMetrics {
  uptime: number;
  availability: number;
  errorRate: number;
  failureRate: number;
  meanTimeBetweenFailures: number;
  meanTimeToRecovery: number;
  serviceLevel: number;
  slaCompliance: number;
}

export interface EfficiencyMetrics {
  resourceEfficiency: number;
  costEfficiency: number;
  timeEfficiency: number;
  energyEfficiency: number;
  overallEfficiency: number;
  wasteRatio: number;
  optimizationPotential: number;
}

export interface CostMetrics {
  computeCost: number;
  storageCost: number;
  networkCost: number;
  licenseCost: number;
  operationalCost: number;
  totalCost: number;
  costPerOperation: number;
  costPerRecord: number;
  roi: number;
  paybackPeriod: number;
}

export interface ScalabilityMetrics {
  horizontalScaling: ScalingMetric;
  verticalScaling: ScalingMetric;
  elasticity: number;
  loadHandling: number;
  bottleneckScore: number;
  scalingEfficiency: number;
}

export interface ScalingMetric {
  capacity: number;
  efficiency: number;
  cost: number;
  latency: number;
  reliability: number;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  slope: number;
  correlation: number;
  volatility: number;
  forecast: number[];
  confidence: number;
  seasonality?: SeasonalityData;
}

export interface SeasonalityData {
  period: number;
  amplitude: number;
  phase: number;
  strength: number;
}

export interface BenchmarkData {
  baseline: number;
  target: number;
  industry: number;
  competitor: number;
  best: number;
  percentile: number;
  ranking: number;
  improvement: number;
}

export interface PerformanceScore {
  overall: number;
  categories: Record<string, number>;
  factors: Record<string, {
    score: number;
    weight: number;
    impact: number;
  }>;
  recommendation: string;
  improvementAreas: string[];
}

export interface OptimizationOpportunity {
  category: string;
  type: string;
  impact: number;
  effort: number;
  roi: number;
  description: string;
  implementation: string[];
  risks: string[];
  benefits: string[];
}

export interface PerformanceProfile {
  ruleId: string;
  name: string;
  category: string;
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  baseline: PerformanceMetrics;
  current: PerformanceMetrics;
  target: PerformanceMetrics;
  benchmarks: Record<string, BenchmarkData>;
  score: PerformanceScore;
  opportunities: OptimizationOpportunity[];
  history: PerformanceSnapshot[];
}

export interface PerformanceSnapshot {
  timestamp: Date;
  metrics: PerformanceMetrics;
  score: number;
  events: string[];
  context: Record<string, any>;
}

// Statistical Functions
export class StatisticalCalculator {
  static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static mode(values: number[]): number {
    if (values.length === 0) return 0;
    const frequency: Record<number, number> = {};
    let maxFreq = 0;
    let mode = values[0];
    
    for (const value of values) {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    }
    
    return mode;
  }

  static standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.mean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  static variance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.mean(values);
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  static percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    const stdX = this.standardDeviation(x);
    const stdY = this.standardDeviation(y);
    
    if (stdX === 0 || stdY === 0) return 0;
    
    let correlation = 0;
    for (let i = 0; i < x.length; i++) {
      correlation += (x[i] - meanX) * (y[i] - meanY);
    }
    
    return correlation / ((x.length - 1) * stdX * stdY);
  }

  static regression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    if (x.length !== y.length || x.length === 0) {
      return { slope: 0, intercept: 0, r2: 0 };
    }
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const totalSumSquares = sumYY - (sumY * sumY) / n;
    const residualSumSquares = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    
    const r2 = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
    
    return { slope, intercept, r2 };
  }
}

// Performance Calculator
export class PerformanceCalculator {
  private static readonly WEIGHTS = {
    execution_time: 0.25,
    throughput: 0.20,
    resource_usage: 0.20,
    accuracy: 0.15,
    reliability: 0.10,
    efficiency: 0.05,
    cost: 0.03,
    scalability: 0.02,
  };

  static calculateExecutionTimeMetrics(executionTimes: number[]): ExecutionTimeMetrics {
    if (executionTimes.length === 0) {
      return {
        mean: 0, median: 0, mode: 0, min: 0, max: 0,
        standardDeviation: 0, variance: 0,
        percentiles: { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0, p99_9: 0 },
        trend: { direction: 'stable', slope: 0, correlation: 0, volatility: 0, forecast: [], confidence: 0 }
      };
    }

    const mean = StatisticalCalculator.mean(executionTimes);
    const median = StatisticalCalculator.median(executionTimes);
    const mode = StatisticalCalculator.mode(executionTimes);
    const min = Math.min(...executionTimes);
    const max = Math.max(...executionTimes);
    const standardDeviation = StatisticalCalculator.standardDeviation(executionTimes);
    const variance = StatisticalCalculator.variance(executionTimes);

    const percentiles = {
      p50: StatisticalCalculator.percentile(executionTimes, 50),
      p75: StatisticalCalculator.percentile(executionTimes, 75),
      p90: StatisticalCalculator.percentile(executionTimes, 90),
      p95: StatisticalCalculator.percentile(executionTimes, 95),
      p99: StatisticalCalculator.percentile(executionTimes, 99),
      p99_9: StatisticalCalculator.percentile(executionTimes, 99.9),
    };

    const trend = this.calculateTrend(executionTimes);

    return {
      mean, median, mode, min, max, standardDeviation, variance, percentiles, trend
    };
  }

  static calculateThroughputMetrics(
    recordsProcessed: number,
    timeWindow: number,
    bytesProcessed: number = 0,
    operations: number = 0
  ): ThroughputMetrics {
    const timeInSeconds = timeWindow / 1000;
    const timeInMinutes = timeInSeconds / 60;
    const timeInHours = timeInMinutes / 60;

    return {
      recordsPerSecond: timeInSeconds > 0 ? recordsProcessed / timeInSeconds : 0,
      recordsPerMinute: timeInMinutes > 0 ? recordsProcessed / timeInMinutes : 0,
      recordsPerHour: timeInHours > 0 ? recordsProcessed / timeInHours : 0,
      bytesPerSecond: timeInSeconds > 0 ? bytesProcessed / timeInSeconds : 0,
      operationsPerSecond: timeInSeconds > 0 ? operations / timeInSeconds : 0,
      concurrentOperations: 0, // Would be calculated from system metrics
      queueDepth: 0, // Would be calculated from system metrics
      utilization: 0, // Would be calculated from system metrics
      trend: { direction: 'stable', slope: 0, correlation: 0, volatility: 0, forecast: [], confidence: 0 }
    };
  }

  static calculateResourceUsageMetrics(resourceData: {
    cpu: number[];
    memory: number[];
    disk: number[];
    network: number[];
    costs?: { cpu: number; memory: number; disk: number; network: number };
  }): ResourceUsageMetrics {
    const createResourceMetric = (values: number[], cost: number = 0): ResourceMetric => ({
      current: values.length > 0 ? values[values.length - 1] : 0,
      average: StatisticalCalculator.mean(values),
      peak: values.length > 0 ? Math.max(...values) : 0,
      minimum: values.length > 0 ? Math.min(...values) : 0,
      utilization: StatisticalCalculator.mean(values),
      efficiency: this.calculateEfficiency(values),
      cost,
      trend: this.calculateTrend(values)
    });

    const cpu = createResourceMetric(resourceData.cpu, resourceData.costs?.cpu || 0);
    const memory = createResourceMetric(resourceData.memory, resourceData.costs?.memory || 0);
    const disk = createResourceMetric(resourceData.disk, resourceData.costs?.disk || 0);
    const network = createResourceMetric(resourceData.network, resourceData.costs?.network || 0);

    const overallValues = [
      ...resourceData.cpu,
      ...resourceData.memory,
      ...resourceData.disk,
      ...resourceData.network
    ];
    
    const totalCost = (resourceData.costs?.cpu || 0) + 
                     (resourceData.costs?.memory || 0) + 
                     (resourceData.costs?.disk || 0) + 
                     (resourceData.costs?.network || 0);

    const overall = createResourceMetric(overallValues, totalCost);

    return { cpu, memory, disk, network, overall };
  }

  static calculateAccuracyMetrics(
    truePositives: number,
    trueNegatives: number,
    falsePositives: number,
    falseNegatives: number,
    classData?: Record<string, { tp: number; tn: number; fp: number; fn: number }>
  ): AccuracyMetrics {
    const total = truePositives + trueNegatives + falsePositives + falseNegatives;
    
    if (total === 0) {
      return {
        precision: 0, recall: 0, f1Score: 0, accuracy: 0,
        specificity: 0, sensitivity: 0, auc: 0,
        confusionMatrix: { truePositives: 0, trueNegatives: 0, falsePositives: 0, falseNegatives: 0, total: 0 },
        classificationReport: { classes: {}, macro: { precision: 0, recall: 0, f1Score: 0 }, weighted: { precision: 0, recall: 0, f1Score: 0 } }
      };
    }

    const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1Score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    const accuracy = total > 0 ? (truePositives + trueNegatives) / total : 0;
    const specificity = (trueNegatives + falsePositives) > 0 ? trueNegatives / (trueNegatives + falsePositives) : 0;
    const sensitivity = recall; // Same as recall
    
    // Simple AUC approximation
    const auc = (sensitivity + specificity) / 2;

    const confusionMatrix: ConfusionMatrix = {
      truePositives, trueNegatives, falsePositives, falseNegatives, total
    };

    const classificationReport: ClassificationReport = {
      classes: {},
      macro: { precision, recall, f1Score },
      weighted: { precision, recall, f1Score }
    };

    if (classData) {
      for (const [className, data] of Object.entries(classData)) {
        const classTotal = data.tp + data.tn + data.fp + data.fn;
        const classPrecision = (data.tp + data.fp) > 0 ? data.tp / (data.tp + data.fp) : 0;
        const classRecall = (data.tp + data.fn) > 0 ? data.tp / (data.tp + data.fn) : 0;
        const classF1 = (classPrecision + classRecall) > 0 ? 2 * (classPrecision * classRecall) / (classPrecision + classRecall) : 0;
        
        classificationReport.classes[className] = {
          precision: classPrecision,
          recall: classRecall,
          f1Score: classF1,
          support: data.tp + data.fn
        };
      }
    }

    return {
      precision, recall, f1Score, accuracy, specificity, sensitivity, auc,
      confusionMatrix, classificationReport
    };
  }

  static calculateReliabilityMetrics(
    uptime: number,
    totalTime: number,
    errorCount: number,
    totalOperations: number,
    failureEvents: { timestamp: Date; recoveryTime: number }[]
  ): ReliabilityMetrics {
    const availability = totalTime > 0 ? uptime / totalTime : 0;
    const errorRate = totalOperations > 0 ? errorCount / totalOperations : 0;
    const failureRate = failureEvents.length / totalTime;

    let meanTimeBetweenFailures = 0;
    let meanTimeToRecovery = 0;

    if (failureEvents.length > 0) {
      meanTimeToRecovery = failureEvents.reduce((sum, event) => sum + event.recoveryTime, 0) / failureEvents.length;
      
      if (failureEvents.length > 1) {
        let totalTimeBetween = 0;
        for (let i = 1; i < failureEvents.length; i++) {
          totalTimeBetween += failureEvents[i].timestamp.getTime() - failureEvents[i - 1].timestamp.getTime();
        }
        meanTimeBetweenFailures = totalTimeBetween / (failureEvents.length - 1);
      }
    }

    const serviceLevel = availability * 100;
    const slaCompliance = serviceLevel >= 99.9 ? 100 : serviceLevel;

    return {
      uptime: uptime / 1000, // Convert to seconds
      availability,
      errorRate,
      failureRate,
      meanTimeBetweenFailures: meanTimeBetweenFailures / 1000,
      meanTimeToRecovery: meanTimeToRecovery / 1000,
      serviceLevel,
      slaCompliance
    };
  }

  static calculateEfficiencyMetrics(
    resourceUsage: ResourceUsageMetrics,
    costMetrics: CostMetrics,
    executionTime: ExecutionTimeMetrics
  ): EfficiencyMetrics {
    const resourceEfficiency = this.calculateResourceEfficiency(resourceUsage);
    const costEfficiency = costMetrics.roi > 0 ? Math.min(costMetrics.roi / 100, 1) : 0;
    const timeEfficiency = executionTime.mean > 0 ? Math.max(0, 1 - (executionTime.standardDeviation / executionTime.mean)) : 0;
    const energyEfficiency = resourceEfficiency; // Simplified
    
    const overallEfficiency = (resourceEfficiency + costEfficiency + timeEfficiency + energyEfficiency) / 4;
    const wasteRatio = 1 - resourceEfficiency;
    const optimizationPotential = Math.max(0, 1 - overallEfficiency);

    return {
      resourceEfficiency,
      costEfficiency,
      timeEfficiency,
      energyEfficiency,
      overallEfficiency,
      wasteRatio,
      optimizationPotential
    };
  }

  static calculateCostMetrics(costs: {
    compute: number;
    storage: number;
    network: number;
    license: number;
    operational: number;
  }, operations: number, records: number, investment: number = 0): CostMetrics {
    const totalCost = costs.compute + costs.storage + costs.network + costs.license + costs.operational;
    const costPerOperation = operations > 0 ? totalCost / operations : 0;
    const costPerRecord = records > 0 ? totalCost / records : 0;
    
    // Simplified ROI calculation
    const benefit = totalCost * 0.2; // Assume 20% benefit
    const roi = investment > 0 ? (benefit - investment) / investment * 100 : 0;
    const paybackPeriod = benefit > 0 ? investment / benefit : 0;

    return {
      computeCost: costs.compute,
      storageCost: costs.storage,
      networkCost: costs.network,
      licenseCost: costs.license,
      operationalCost: costs.operational,
      totalCost,
      costPerOperation,
      costPerRecord,
      roi,
      paybackPeriod
    };
  }

  static calculateScalabilityMetrics(
    currentLoad: number,
    maxLoad: number,
    responseTimeAtLoad: number[],
    loadLevels: number[]
  ): ScalabilityMetrics {
    const horizontalScaling: ScalingMetric = {
      capacity: maxLoad,
      efficiency: currentLoad > 0 ? Math.min(maxLoad / currentLoad, 10) : 1,
      cost: 1, // Simplified
      latency: StatisticalCalculator.mean(responseTimeAtLoad),
      reliability: 0.95 // Simplified
    };

    const verticalScaling: ScalingMetric = {
      capacity: maxLoad * 2, // Simplified assumption
      efficiency: 0.8, // Simplified
      cost: 1.5, // Simplified
      latency: StatisticalCalculator.mean(responseTimeAtLoad) * 1.1,
      reliability: 0.98
    };

    const elasticity = loadLevels.length > 1 ? 
      Math.abs(StatisticalCalculator.correlation(loadLevels, responseTimeAtLoad)) : 0;
    
    const loadHandling = currentLoad > 0 ? Math.min(maxLoad / currentLoad, 1) : 1;
    const bottleneckScore = 1 - loadHandling;
    const scalingEfficiency = (horizontalScaling.efficiency + verticalScaling.efficiency) / 2;

    return {
      horizontalScaling,
      verticalScaling,
      elasticity,
      loadHandling,
      bottleneckScore,
      scalingEfficiency
    };
  }

  static calculateOverallScore(metrics: PerformanceMetrics): PerformanceScore {
    const scores = {
      execution_time: this.scoreExecutionTime(metrics.executionTime),
      throughput: this.scoreThroughput(metrics.throughput),
      resource_usage: this.scoreResourceUsage(metrics.resourceUsage),
      accuracy: this.scoreAccuracy(metrics.accuracy),
      reliability: this.scoreReliability(metrics.reliability),
      efficiency: this.scoreEfficiency(metrics.efficiency),
      cost: this.scoreCost(metrics.cost),
      scalability: this.scoreScalability(metrics.scalability)
    };

    const overall = Object.entries(scores).reduce((sum, [key, score]) => {
      const weight = this.WEIGHTS[key as keyof typeof this.WEIGHTS] || 0;
      return sum + (score * weight);
    }, 0);

    const factors = Object.entries(scores).reduce((acc, [key, score]) => {
      const weight = this.WEIGHTS[key as keyof typeof this.WEIGHTS] || 0;
      acc[key] = {
        score,
        weight,
        impact: score * weight
      };
      return acc;
    }, {} as Record<string, { score: number; weight: number; impact: number }>);

    const recommendation = this.generateRecommendation(overall, scores);
    const improvementAreas = this.identifyImprovementAreas(scores);

    return {
      overall: Math.round(overall * 100) / 100,
      categories: scores,
      factors,
      recommendation,
      improvementAreas
    };
  }

  static identifyOptimizationOpportunities(metrics: PerformanceMetrics): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Check execution time optimization
    if (metrics.executionTime.mean > 1000) { // > 1 second
      opportunities.push({
        category: 'performance',
        type: 'execution_time',
        impact: 0.8,
        effort: 0.6,
        roi: 0.8 / 0.6,
        description: 'High execution time detected',
        implementation: ['Optimize algorithms', 'Add caching', 'Parallelize operations'],
        risks: ['Code complexity increase', 'Testing overhead'],
        benefits: ['Faster response times', 'Better user experience', 'Reduced resource usage']
      });
    }

    // Check resource usage optimization
    if (metrics.resourceUsage.overall.utilization > 0.8) {
      opportunities.push({
        category: 'resource',
        type: 'resource_optimization',
        impact: 0.7,
        effort: 0.5,
        roi: 0.7 / 0.5,
        description: 'High resource utilization detected',
        implementation: ['Resource pooling', 'Load balancing', 'Auto-scaling'],
        risks: ['Infrastructure complexity', 'Monitoring overhead'],
        benefits: ['Lower costs', 'Better scalability', 'Improved reliability']
      });
    }

    // Check accuracy improvement
    if (metrics.accuracy.f1Score < 0.8) {
      opportunities.push({
        category: 'accuracy',
        type: 'model_tuning',
        impact: 0.9,
        effort: 0.8,
        roi: 0.9 / 0.8,
        description: 'Low accuracy detected',
        implementation: ['Feature engineering', 'Model tuning', 'Data quality improvement'],
        risks: ['Overfitting', 'Increased complexity'],
        benefits: ['Higher accuracy', 'Better classification', 'Reduced false positives']
      });
    }

    // Check cost optimization
    if (metrics.cost.costPerOperation > 0.1) {
      opportunities.push({
        category: 'cost',
        type: 'cost_reduction',
        impact: 0.6,
        effort: 0.4,
        roi: 0.6 / 0.4,
        description: 'High cost per operation detected',
        implementation: ['Resource optimization', 'Reserved instances', 'Spot instances'],
        risks: ['Service interruption', 'Performance impact'],
        benefits: ['Lower operational costs', 'Better ROI', 'Budget optimization']
      });
    }

    return opportunities.sort((a, b) => b.roi - a.roi);
  }

  // Helper methods
  private static calculateTrend(values: number[]): TrendData {
    if (values.length < 2) {
      return {
        direction: 'stable',
        slope: 0,
        correlation: 0,
        volatility: 0,
        forecast: [],
        confidence: 0
      };
    }

    const x = values.map((_, i) => i);
    const regression = StatisticalCalculator.regression(x, values);
    
    const direction: 'up' | 'down' | 'stable' = 
      regression.slope > 0.1 ? 'up' : 
      regression.slope < -0.1 ? 'down' : 
      'stable';

    const volatility = StatisticalCalculator.standardDeviation(values) / StatisticalCalculator.mean(values);
    
    // Simple forecast (linear projection)
    const forecast = Array.from({ length: 5 }, (_, i) => {
      const futureX = values.length + i;
      return regression.slope * futureX + regression.intercept;
    });

    return {
      direction,
      slope: regression.slope,
      correlation: regression.r2,
      volatility: isNaN(volatility) ? 0 : volatility,
      forecast,
      confidence: regression.r2
    };
  }

  private static calculateEfficiency(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = StatisticalCalculator.mean(values);
    const max = Math.max(...values);
    return max > 0 ? 1 - (mean / max) : 1;
  }

  private static calculateResourceEfficiency(resourceUsage: ResourceUsageMetrics): number {
    const efficiencies = [
      resourceUsage.cpu.efficiency,
      resourceUsage.memory.efficiency,
      resourceUsage.disk.efficiency,
      resourceUsage.network.efficiency
    ];
    return StatisticalCalculator.mean(efficiencies);
  }

  private static scoreExecutionTime(metrics: ExecutionTimeMetrics): number {
    // Score based on mean execution time (lower is better)
    if (metrics.mean <= 100) return 1.0;
    if (metrics.mean <= 500) return 0.8;
    if (metrics.mean <= 1000) return 0.6;
    if (metrics.mean <= 5000) return 0.4;
    return 0.2;
  }

  private static scoreThroughput(metrics: ThroughputMetrics): number {
    // Score based on records per second (higher is better)
    if (metrics.recordsPerSecond >= 1000) return 1.0;
    if (metrics.recordsPerSecond >= 500) return 0.8;
    if (metrics.recordsPerSecond >= 100) return 0.6;
    if (metrics.recordsPerSecond >= 10) return 0.4;
    return 0.2;
  }

  private static scoreResourceUsage(metrics: ResourceUsageMetrics): number {
    return metrics.overall.efficiency;
  }

  private static scoreAccuracy(metrics: AccuracyMetrics): number {
    return metrics.f1Score;
  }

  private static scoreReliability(metrics: ReliabilityMetrics): number {
    return metrics.availability;
  }

  private static scoreEfficiency(metrics: EfficiencyMetrics): number {
    return metrics.overallEfficiency;
  }

  private static scoreCost(metrics: CostMetrics): number {
    // Score based on ROI (higher is better)
    if (metrics.roi >= 50) return 1.0;
    if (metrics.roi >= 30) return 0.8;
    if (metrics.roi >= 15) return 0.6;
    if (metrics.roi >= 5) return 0.4;
    return 0.2;
  }

  private static scoreScalability(metrics: ScalabilityMetrics): number {
    return metrics.scalingEfficiency;
  }

  private static generateRecommendation(overall: number, scores: Record<string, number>): string {
    if (overall >= 0.9) return 'Excellent performance across all metrics';
    if (overall >= 0.8) return 'Good performance with minor optimization opportunities';
    if (overall >= 0.7) return 'Moderate performance requiring targeted improvements';
    if (overall >= 0.6) return 'Below average performance needing significant optimization';
    return 'Poor performance requiring immediate attention';
  }

  private static identifyImprovementAreas(scores: Record<string, number>): string[] {
    const areas: string[] = [];
    const threshold = 0.7;

    Object.entries(scores).forEach(([category, score]) => {
      if (score < threshold) {
        areas.push(category.replace('_', ' '));
      }
    });

    return areas.sort();
  }
}

// Export utility functions
export function calculatePerformanceMetrics(data: {
  executionTimes: number[];
  resourceData: {
    cpu: number[];
    memory: number[];
    disk: number[];
    network: number[];
  };
  accuracyData: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
  reliabilityData: {
    uptime: number;
    totalTime: number;
    errorCount: number;
    totalOperations: number;
  };
  costData: {
    compute: number;
    storage: number;
    network: number;
    license: number;
    operational: number;
  };
}): PerformanceMetrics {
  const executionTime = PerformanceCalculator.calculateExecutionTimeMetrics(data.executionTimes);
  
  const throughput = PerformanceCalculator.calculateThroughputMetrics(
    data.executionTimes.length,
    data.executionTimes.reduce((sum, time) => sum + time, 0)
  );
  
  const resourceUsage = PerformanceCalculator.calculateResourceUsageMetrics(data.resourceData);
  
  const accuracy = PerformanceCalculator.calculateAccuracyMetrics(
    data.accuracyData.tp,
    data.accuracyData.tn,
    data.accuracyData.fp,
    data.accuracyData.fn
  );
  
  const reliability = PerformanceCalculator.calculateReliabilityMetrics(
    data.reliabilityData.uptime,
    data.reliabilityData.totalTime,
    data.reliabilityData.errorCount,
    data.reliabilityData.totalOperations,
    []
  );
  
  const cost = PerformanceCalculator.calculateCostMetrics(
    data.costData,
    data.reliabilityData.totalOperations,
    data.executionTimes.length
  );
  
  const efficiency = PerformanceCalculator.calculateEfficiencyMetrics(resourceUsage, cost, executionTime);
  
  const scalability = PerformanceCalculator.calculateScalabilityMetrics(
    100,
    1000,
    data.executionTimes,
    Array.from({ length: data.executionTimes.length }, (_, i) => i * 10)
  );

  return {
    executionTime,
    throughput,
    resourceUsage,
    accuracy,
    reliability,
    efficiency,
    cost,
    scalability
  };
}

export function calculatePerformanceScore(metrics: PerformanceMetrics): PerformanceScore {
  return PerformanceCalculator.calculateOverallScore(metrics);
}

export function identifyOptimizationOpportunities(metrics: PerformanceMetrics): OptimizationOpportunity[] {
  return PerformanceCalculator.identifyOptimizationOpportunities(metrics);
}

export function compareBenchmarks(current: number, baseline: number, target: number, industry: number): BenchmarkData {
  const improvement = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0;
  const percentile = industry > 0 ? (current / industry) * 100 : 50;
  const ranking = Math.max(1, Math.round((100 - percentile) / 10));

  return {
    baseline,
    target,
    industry,
    competitor: industry * 1.1, // Assume competitor is 10% better than industry
    best: industry * 1.5, // Assume best-in-class is 50% better than industry
    current,
    percentile,
    ranking,
    improvement
  };
}

// Export class for direct usage
export { PerformanceCalculator, StatisticalCalculator };