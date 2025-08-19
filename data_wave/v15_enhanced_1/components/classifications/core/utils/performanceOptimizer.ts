import { toast } from 'sonner';

// Advanced TypeScript interfaces for performance optimization
export interface PerformanceConfig {
  enableMonitoring: boolean;
  monitoringInterval: number;
  enableAutoOptimization: boolean;
  optimizationThreshold: number;
  enablePredictiveOptimization: boolean;
  predictionWindow: number;
  enableResourceScaling: boolean;
  scalingPolicy: ScalingPolicy;
  enableCaching: boolean;
  cacheStrategy: CacheStrategy;
  enableProfiling: boolean;
  profilingDepth: 'basic' | 'detailed' | 'comprehensive';
}

export interface ScalingPolicy {
  type: 'reactive' | 'predictive' | 'hybrid';
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
}

export interface CacheStrategy {
  type: 'lru' | 'lfu' | 'ttl' | 'adaptive';
  maxSize: number;
  ttl: number;
  prefetchEnabled: boolean;
  compressionEnabled: boolean;
  distributedCaching: boolean;
}

export interface PerformanceMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
    cores: number;
    frequency: number;
  };
  memory: {
    used: number;
    available: number;
    total: number;
    utilization: number;
    heapUsed?: number;
    heapTotal?: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number;
    bandwidth: number;
  };
  disk: {
    readBytes: number;
    writeBytes: number;
    readOps: number;
    writeOps: number;
    utilization: number;
  };
  application: {
    requestsPerSecond: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    activeConnections: number;
    queueLength: number;
    throughput: number;
  };
  database: {
    connectionsActive: number;
    connectionsIdle: number;
    queryTime: number;
    slowQueries: number;
    cacheHitRate: number;
    lockWaitTime: number;
  };
}

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: OptimizationAction;
  priority: number;
  cooldown: number;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
}

export interface OptimizationAction {
  type: 'scale' | 'cache' | 'algorithm' | 'resource' | 'configuration';
  parameters: Record<string, any>;
  execute: (params: Record<string, any>) => Promise<OptimizationResult>;
  rollback?: (params: Record<string, any>) => Promise<void>;
  validate?: (result: OptimizationResult) => boolean;
}

export interface OptimizationResult {
  success: boolean;
  improvement: number;
  metrics: {
    before: PerformanceMetrics;
    after: PerformanceMetrics;
  };
  changes: OptimizationChange[];
  duration: number;
  cost: number;
  risk: number;
  recommendation: string;
}

export interface OptimizationChange {
  component: string;
  property: string;
  oldValue: any;
  newValue: any;
  impact: number;
  reversible: boolean;
}

export interface PredictionModel {
  id: string;
  name: string;
  type: 'linear' | 'polynomial' | 'neural' | 'ensemble';
  accuracy: number;
  lastTrained: Date;
  features: string[];
  predictions: Prediction[];
  parameters: Record<string, any>;
}

export interface Prediction {
  timestamp: Date;
  metric: string;
  value: number;
  confidence: number;
  horizon: number; // minutes
  trend: 'increasing' | 'decreasing' | 'stable';
  anomaly: boolean;
}

export interface PerformanceAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'prediction';
  severity: 'info' | 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actions: string[];
}

export interface OptimizationProfile {
  id: string;
  name: string;
  description: string;
  rules: OptimizationRule[];
  enabled: boolean;
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
  conditions: {
    timeRanges?: TimeRange[];
    loadThresholds?: LoadThreshold[];
    dependencies?: string[];
  };
}

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
  days: number[]; // 0-6 (Sunday-Saturday)
}

export interface LoadThreshold {
  metric: string;
  min?: number;
  max?: number;
}

export interface ResourcePool {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'network' | 'storage' | 'custom';
  capacity: number;
  allocated: number;
  available: number;
  utilization: number;
  cost: number;
  instances: ResourceInstance[];
}

export interface ResourceInstance {
  id: string;
  status: 'active' | 'idle' | 'scaling' | 'terminating';
  capacity: number;
  utilization: number;
  cost: number;
  metadata: Record<string, any>;
}

// Advanced Performance Optimizer Class
export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private rules: Map<string, OptimizationRule> = new Map();
  private profiles: Map<string, OptimizationProfile> = new Map();
  private models: Map<string, PredictionModel> = new Map();
  private alerts: PerformanceAlert[] = [];
  private resourcePools: Map<string, ResourcePool> = new Map();
  private optimizationHistory: OptimizationResult[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private predictionInterval?: NodeJS.Timeout;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMonitoring: true,
      monitoringInterval: 5000,
      enableAutoOptimization: true,
      optimizationThreshold: 0.8,
      enablePredictiveOptimization: true,
      predictionWindow: 30,
      enableResourceScaling: true,
      scalingPolicy: {
        type: 'hybrid',
        minInstances: 1,
        maxInstances: 10,
        targetCpuUtilization: 70,
        targetMemoryUtilization: 80,
        scaleUpCooldown: 300,
        scaleDownCooldown: 600,
        scaleUpThreshold: 80,
        scaleDownThreshold: 30
      },
      enableCaching: true,
      cacheStrategy: {
        type: 'adaptive',
        maxSize: 1000,
        ttl: 3600,
        prefetchEnabled: true,
        compressionEnabled: true,
        distributedCaching: false
      },
      enableProfiling: true,
      profilingDepth: 'detailed',
      ...config
    };

    this.initializeDefaultRules();
    this.initializePredictionModels();
    this.startMonitoring();
  }

  // Monitoring Methods
  private startMonitoring(): void {
    if (this.config.enableMonitoring) {
      this.monitoringInterval = setInterval(() => {
        this.collectMetrics();
      }, this.config.monitoringInterval);
    }

    if (this.config.enablePredictiveOptimization) {
      this.predictionInterval = setInterval(() => {
        this.generatePredictions();
      }, this.config.predictionWindow * 1000);
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.gatherSystemMetrics();
      this.metrics.push(metrics);

      // Keep only recent metrics (last 1000 samples)
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Check for alerts
      this.checkAlerts(metrics);

      // Trigger auto-optimization if enabled
      if (this.config.enableAutoOptimization) {
        await this.evaluateOptimizationRules(metrics);
      }
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  private async gatherSystemMetrics(): Promise<PerformanceMetrics> {
    // In a real implementation, this would gather actual system metrics
    // For now, we'll simulate realistic metrics
    return {
      timestamp: new Date(),
      cpu: {
        usage: Math.random() * 100,
        load: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
        cores: 8,
        frequency: 2.4
      },
      memory: {
        used: Math.random() * 8000,
        available: 8000 - (Math.random() * 8000),
        total: 16000,
        utilization: Math.random() * 100,
        heapUsed: Math.random() * 1000,
        heapTotal: 2000
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000,
        latency: Math.random() * 100,
        bandwidth: 1000
      },
      disk: {
        readBytes: Math.random() * 1000000,
        writeBytes: Math.random() * 1000000,
        readOps: Math.random() * 1000,
        writeOps: Math.random() * 1000,
        utilization: Math.random() * 100
      },
      application: {
        requestsPerSecond: Math.random() * 1000,
        averageResponseTime: Math.random() * 1000,
        p95ResponseTime: Math.random() * 2000,
        p99ResponseTime: Math.random() * 5000,
        errorRate: Math.random() * 0.05,
        activeConnections: Math.floor(Math.random() * 1000),
        queueLength: Math.floor(Math.random() * 100),
        throughput: Math.random() * 10000
      },
      database: {
        connectionsActive: Math.floor(Math.random() * 100),
        connectionsIdle: Math.floor(Math.random() * 50),
        queryTime: Math.random() * 100,
        slowQueries: Math.floor(Math.random() * 10),
        cacheHitRate: 0.7 + Math.random() * 0.3,
        lockWaitTime: Math.random() * 10
      }
    };
  }

  // Optimization Rules Management
  private initializeDefaultRules(): void {
    // CPU Optimization Rule
    this.addRule({
      id: 'cpu-high-usage',
      name: 'High CPU Usage Optimization',
      description: 'Scale resources when CPU usage exceeds threshold',
      condition: (metrics) => metrics.cpu.usage > this.config.scalingPolicy.scaleUpThreshold,
      action: {
        type: 'scale',
        parameters: { direction: 'up', factor: 1.2 },
        execute: async (params) => this.executeScaling(params)
      },
      priority: 1,
      cooldown: this.config.scalingPolicy.scaleUpCooldown * 1000,
      executionCount: 0,
      successRate: 1.0,
      impact: 'high',
      risk: 'medium'
    });

    // Memory Optimization Rule
    this.addRule({
      id: 'memory-high-usage',
      name: 'High Memory Usage Optimization',
      description: 'Optimize memory usage when threshold exceeded',
      condition: (metrics) => metrics.memory.utilization > this.config.scalingPolicy.targetMemoryUtilization,
      action: {
        type: 'cache',
        parameters: { action: 'cleanup', aggressive: true },
        execute: async (params) => this.executeCacheOptimization(params)
      },
      priority: 2,
      cooldown: 60000, // 1 minute
      executionCount: 0,
      successRate: 1.0,
      impact: 'medium',
      risk: 'low'
    });

    // Response Time Optimization Rule
    this.addRule({
      id: 'response-time-high',
      name: 'High Response Time Optimization',
      description: 'Optimize when response time degrades',
      condition: (metrics) => metrics.application.p95ResponseTime > 2000,
      action: {
        type: 'algorithm',
        parameters: { optimization: 'caching', level: 'aggressive' },
        execute: async (params) => this.executeAlgorithmOptimization(params)
      },
      priority: 3,
      cooldown: 120000, // 2 minutes
      executionCount: 0,
      successRate: 1.0,
      impact: 'high',
      risk: 'low'
    });

    // Database Optimization Rule
    this.addRule({
      id: 'database-slow-queries',
      name: 'Database Query Optimization',
      description: 'Optimize database when slow queries detected',
      condition: (metrics) => metrics.database.slowQueries > 5 || metrics.database.queryTime > 50,
      action: {
        type: 'configuration',
        parameters: { component: 'database', optimization: 'query-cache' },
        execute: async (params) => this.executeDatabaseOptimization(params)
      },
      priority: 4,
      cooldown: 180000, // 3 minutes
      executionCount: 0,
      successRate: 1.0,
      impact: 'medium',
      risk: 'low'
    });
  }

  addRule(rule: OptimizationRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  private async evaluateOptimizationRules(metrics: PerformanceMetrics): Promise<void> {
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => {
        // Check cooldown
        if (rule.lastExecuted) {
          const timeSinceExecution = Date.now() - rule.lastExecuted.getTime();
          if (timeSinceExecution < rule.cooldown) {
            return false;
          }
        }
        
        // Check condition
        return rule.condition(metrics);
      })
      .sort((a, b) => a.priority - b.priority);

    for (const rule of applicableRules) {
      try {
        const beforeMetrics = { ...metrics };
        const result = await rule.action.execute(rule.action.parameters);
        
        result.metrics.before = beforeMetrics;
        this.optimizationHistory.push(result);
        
        // Update rule statistics
        rule.executionCount++;
        rule.lastExecuted = new Date();
        rule.successRate = (rule.successRate * (rule.executionCount - 1) + (result.success ? 1 : 0)) / rule.executionCount;
        
        if (result.success) {
          toast.success(`Optimization applied: ${rule.name}`, {
            description: `Performance improved by ${(result.improvement * 100).toFixed(1)}%`
          });
        }
        
        // Only apply one rule at a time to avoid conflicts
        break;
      } catch (error) {
        console.error(`Error executing optimization rule ${rule.id}:`, error);
        rule.successRate = (rule.successRate * (rule.executionCount - 1)) / (rule.executionCount + 1);
        rule.executionCount++;
      }
    }
  }

  // Optimization Execution Methods
  private async executeScaling(params: Record<string, any>): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    try {
      // Simulate scaling operation
      const direction = params.direction as 'up' | 'down';
      const factor = params.factor as number;
      
      // Get current resource allocation
      const currentInstances = this.getCurrentInstances();
      const newInstances = direction === 'up' 
        ? Math.min(currentInstances * factor, this.config.scalingPolicy.maxInstances)
        : Math.max(currentInstances / factor, this.config.scalingPolicy.minInstances);
      
      // Simulate scaling delay
      await this.delay(2000);
      
      const improvement = direction === 'up' ? 0.3 : 0.1;
      const cost = direction === 'up' ? (newInstances - currentInstances) * 10 : 0;
      
      return {
        success: true,
        improvement,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics() // Would be actual after metrics
        },
        changes: [{
          component: 'resource-pool',
          property: 'instances',
          oldValue: currentInstances,
          newValue: newInstances,
          impact: improvement,
          reversible: true
        }],
        duration: Date.now() - startTime,
        cost,
        risk: 0.2,
        recommendation: `Scaled ${direction} from ${currentInstances} to ${newInstances} instances`
      };
    } catch (error) {
      return {
        success: false,
        improvement: 0,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics()
        },
        changes: [],
        duration: Date.now() - startTime,
        cost: 0,
        risk: 0,
        recommendation: `Scaling failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async executeCacheOptimization(params: Record<string, any>): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    try {
      const action = params.action as string;
      const aggressive = params.aggressive as boolean;
      
      // Simulate cache optimization
      await this.delay(1000);
      
      let improvement = 0;
      let changes: OptimizationChange[] = [];
      
      switch (action) {
        case 'cleanup':
          improvement = aggressive ? 0.25 : 0.15;
          changes.push({
            component: 'cache',
            property: 'size',
            oldValue: 'high',
            newValue: 'optimized',
            impact: improvement,
            reversible: false
          });
          break;
        case 'prefetch':
          improvement = 0.2;
          changes.push({
            component: 'cache',
            property: 'prefetch',
            oldValue: false,
            newValue: true,
            impact: improvement,
            reversible: true
          });
          break;
      }
      
      return {
        success: true,
        improvement,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics()
        },
        changes,
        duration: Date.now() - startTime,
        cost: 0,
        risk: 0.1,
        recommendation: `Cache ${action} completed successfully`
      };
    } catch (error) {
      return {
        success: false,
        improvement: 0,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics()
        },
        changes: [],
        duration: Date.now() - startTime,
        cost: 0,
        risk: 0,
        recommendation: `Cache optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async executeAlgorithmOptimization(params: Record<string, any>): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    try {
      const optimization = params.optimization as string;
      const level = params.level as string;
      
      // Simulate algorithm optimization
      await this.delay(1500);
      
      let improvement = 0;
      let changes: OptimizationChange[] = [];
      
      switch (optimization) {
        case 'caching':
          improvement = level === 'aggressive' ? 0.4 : 0.2;
          changes.push({
            component: 'algorithm',
            property: 'caching_strategy',
            oldValue: 'basic',
            newValue: level,
            impact: improvement,
            reversible: true
          });
          break;
        case 'batching':
          improvement = 0.3;
          changes.push({
            component: 'algorithm',
            property: 'batch_size',
            oldValue: 50,
            newValue: 100,
            impact: improvement,
            reversible: true
          });
          break;
      }
      
      return {
        success: true,
        improvement,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics()
        },
        changes,
        duration: Date.now() - startTime,
        cost: 0,
        risk: 0.15,
        recommendation: `Algorithm optimization (${optimization}) applied at ${level} level`
      };
    } catch (error) {
      return {
        success: false,
        improvement: 0,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics()
        },
        changes: [],
        duration: Date.now() - startTime,
        cost: 0,
        risk: 0,
        recommendation: `Algorithm optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async executeDatabaseOptimization(params: Record<string, any>): Promise<OptimizationResult> {
    const startTime = Date.now();
    
    try {
      const component = params.component as string;
      const optimization = params.optimization as string;
      
      // Simulate database optimization
      await this.delay(3000);
      
      let improvement = 0;
      let changes: OptimizationChange[] = [];
      
      switch (optimization) {
        case 'query-cache':
          improvement = 0.35;
          changes.push({
            component: 'database',
            property: 'query_cache_size',
            oldValue: '256MB',
            newValue: '512MB',
            impact: improvement,
            reversible: true
          });
          break;
        case 'index-optimization':
          improvement = 0.25;
          changes.push({
            component: 'database',
            property: 'indexes',
            oldValue: 'basic',
            newValue: 'optimized',
            impact: improvement,
            reversible: false
          });
          break;
      }
      
      return {
        success: true,
        improvement,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics()
        },
        changes,
        duration: Date.now() - startTime,
        cost: 0,
        risk: 0.1,
        recommendation: `Database ${optimization} completed successfully`
      };
    } catch (error) {
      return {
        success: false,
        improvement: 0,
        metrics: {
          before: this.getLatestMetrics(),
          after: this.getLatestMetrics()
        },
        changes: [],
        duration: Date.now() - startTime,
        cost: 0,
        risk: 0,
        recommendation: `Database optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Prediction and Analysis
  private initializePredictionModels(): void {
    // CPU Usage Prediction Model
    this.models.set('cpu-usage', {
      id: 'cpu-usage',
      name: 'CPU Usage Predictor',
      type: 'linear',
      accuracy: 0.85,
      lastTrained: new Date(),
      features: ['time', 'load', 'requests'],
      predictions: [],
      parameters: {
        weights: [0.3, 0.4, 0.3],
        bias: 0.1
      }
    });

    // Memory Usage Prediction Model
    this.models.set('memory-usage', {
      id: 'memory-usage',
      name: 'Memory Usage Predictor',
      type: 'polynomial',
      accuracy: 0.78,
      lastTrained: new Date(),
      features: ['time', 'heap', 'connections'],
      predictions: [],
      parameters: {
        degree: 2,
        coefficients: [0.2, 0.5, 0.3]
      }
    });

    // Response Time Prediction Model
    this.models.set('response-time', {
      id: 'response-time',
      name: 'Response Time Predictor',
      type: 'ensemble',
      accuracy: 0.82,
      lastTrained: new Date(),
      features: ['cpu', 'memory', 'queue_length', 'connections'],
      predictions: [],
      parameters: {
        models: ['linear', 'polynomial', 'neural'],
        weights: [0.3, 0.3, 0.4]
      }
    });
  }

  private async generatePredictions(): Promise<void> {
    if (this.metrics.length < 10) return; // Need sufficient data

    for (const [modelId, model] of this.models.entries()) {
      try {
        const predictions = await this.predict(model);
        model.predictions = predictions;
        
        // Check for predicted issues
        this.checkPredictiveAlerts(predictions, modelId);
      } catch (error) {
        console.error(`Error generating predictions for model ${modelId}:`, error);
      }
    }
  }

  private async predict(model: PredictionModel): Promise<Prediction[]> {
    const recentMetrics = this.metrics.slice(-20); // Use last 20 data points
    const predictions: Prediction[] = [];
    
    // Generate predictions for next 30 minutes
    for (let i = 1; i <= 6; i++) {
      const horizon = i * 5; // 5-minute intervals
      const futureTimestamp = new Date(Date.now() + horizon * 60 * 1000);
      
      // Simplified prediction logic (in real implementation, use actual ML models)
      let predictedValue = 0;
      let confidence = 0;
      
      switch (model.type) {
        case 'linear':
          predictedValue = this.linearPredict(recentMetrics, model);
          confidence = Math.max(0.6, model.accuracy - (horizon * 0.01));
          break;
        case 'polynomial':
          predictedValue = this.polynomialPredict(recentMetrics, model);
          confidence = Math.max(0.5, model.accuracy - (horizon * 0.015));
          break;
        case 'ensemble':
          predictedValue = this.ensemblePredict(recentMetrics, model);
          confidence = Math.max(0.7, model.accuracy - (horizon * 0.008));
          break;
      }
      
      const trend = this.determineTrend(recentMetrics, predictedValue);
      const anomaly = this.detectAnomaly(predictedValue, recentMetrics);
      
      predictions.push({
        timestamp: futureTimestamp,
        metric: model.id,
        value: predictedValue,
        confidence,
        horizon,
        trend,
        anomaly
      });
    }
    
    return predictions;
  }

  private linearPredict(metrics: PerformanceMetrics[], model: PredictionModel): number {
    // Simplified linear prediction
    const values = metrics.map(m => this.extractMetricValue(m, model.id));
    const trend = (values[values.length - 1] - values[0]) / values.length;
    return Math.max(0, values[values.length - 1] + trend);
  }

  private polynomialPredict(metrics: PerformanceMetrics[], model: PredictionModel): number {
    // Simplified polynomial prediction
    const values = metrics.map(m => this.extractMetricValue(m, model.id));
    const recent = values.slice(-5);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / recent.length;
    return Math.max(0, avg + Math.sqrt(variance));
  }

  private ensemblePredict(metrics: PerformanceMetrics[], model: PredictionModel): number {
    // Simplified ensemble prediction
    const linear = this.linearPredict(metrics, model);
    const polynomial = this.polynomialPredict(metrics, model);
    const weights = model.parameters.weights as number[];
    return linear * weights[0] + polynomial * weights[1];
  }

  private extractMetricValue(metrics: PerformanceMetrics, metricId: string): number {
    switch (metricId) {
      case 'cpu-usage':
        return metrics.cpu.usage;
      case 'memory-usage':
        return metrics.memory.utilization;
      case 'response-time':
        return metrics.application.averageResponseTime;
      default:
        return 0;
    }
  }

  private determineTrend(metrics: PerformanceMetrics[], predictedValue: number): 'increasing' | 'decreasing' | 'stable' {
    const currentValue = this.extractMetricValue(metrics[metrics.length - 1], 'current');
    const diff = predictedValue - currentValue;
    const threshold = currentValue * 0.05; // 5% threshold
    
    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  }

  private detectAnomaly(predictedValue: number, metrics: PerformanceMetrics[]): boolean {
    const values = metrics.map(m => this.extractMetricValue(m, 'current'));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    // Consider it an anomaly if predicted value is more than 2 standard deviations away
    return Math.abs(predictedValue - mean) > 2 * stdDev;
  }

  // Alert Management
  private checkAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];
    
    // CPU Usage Alert
    if (metrics.cpu.usage > 90) {
      alerts.push({
        id: `cpu-${Date.now()}`,
        type: 'threshold',
        severity: 'critical',
        metric: 'cpu.usage',
        value: metrics.cpu.usage,
        threshold: 90,
        message: `Critical CPU usage: ${metrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
        actions: ['scale-up', 'optimize-algorithms']
      });
    }
    
    // Memory Usage Alert
    if (metrics.memory.utilization > 85) {
      alerts.push({
        id: `memory-${Date.now()}`,
        type: 'threshold',
        severity: 'warning',
        metric: 'memory.utilization',
        value: metrics.memory.utilization,
        threshold: 85,
        message: `High memory usage: ${metrics.memory.utilization.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
        actions: ['cleanup-cache', 'optimize-memory']
      });
    }
    
    // Response Time Alert
    if (metrics.application.p95ResponseTime > 3000) {
      alerts.push({
        id: `response-${Date.now()}`,
        type: 'threshold',
        severity: 'error',
        metric: 'application.p95ResponseTime',
        value: metrics.application.p95ResponseTime,
        threshold: 3000,
        message: `High response time: ${metrics.application.p95ResponseTime.toFixed(0)}ms`,
        timestamp: new Date(),
        acknowledged: false,
        actions: ['optimize-queries', 'increase-cache']
      });
    }
    
    // Error Rate Alert
    if (metrics.application.errorRate > 0.05) {
      alerts.push({
        id: `error-${Date.now()}`,
        type: 'threshold',
        severity: 'error',
        metric: 'application.errorRate',
        value: metrics.application.errorRate,
        threshold: 0.05,
        message: `High error rate: ${(metrics.application.errorRate * 100).toFixed(2)}%`,
        timestamp: new Date(),
        acknowledged: false,
        actions: ['investigate-errors', 'rollback-changes']
      });
    }
    
    this.alerts.push(...alerts);
    
    // Keep only recent alerts (last 100)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Notify about critical alerts
    alerts.forEach(alert => {
      if (alert.severity === 'critical') {
        toast.error(`Critical Alert: ${alert.message}`, {
          description: 'Immediate action required'
        });
      }
    });
  }

  private checkPredictiveAlerts(predictions: Prediction[], modelId: string): void {
    predictions.forEach(prediction => {
      if (prediction.anomaly && prediction.confidence > 0.7) {
        const alert: PerformanceAlert = {
          id: `predictive-${Date.now()}-${Math.random()}`,
          type: 'prediction',
          severity: 'warning',
          metric: prediction.metric,
          value: prediction.value,
          threshold: 0,
          message: `Predicted anomaly in ${prediction.metric}: ${prediction.value.toFixed(2)} in ${prediction.horizon} minutes`,
          timestamp: new Date(),
          acknowledged: false,
          actions: ['preemptive-optimization', 'resource-preparation']
        };
        
        this.alerts.push(alert);
        
        toast.warning(`Predictive Alert: ${alert.message}`, {
          description: `Confidence: ${(prediction.confidence * 100).toFixed(1)}%`
        });
      }
    });
  }

  // Utility Methods
  private getCurrentInstances(): number {
    // Simulate current instance count
    return Math.floor(Math.random() * 5) + 1;
  }

  private getLatestMetrics(): PerformanceMetrics {
    return this.metrics[this.metrics.length - 1] || this.createEmptyMetrics();
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      timestamp: new Date(),
      cpu: { usage: 0, load: [0, 0, 0], cores: 0, frequency: 0 },
      memory: { used: 0, available: 0, total: 0, utilization: 0 },
      network: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0, latency: 0, bandwidth: 0 },
      disk: { readBytes: 0, writeBytes: 0, readOps: 0, writeOps: 0, utilization: 0 },
      application: { requestsPerSecond: 0, averageResponseTime: 0, p95ResponseTime: 0, p99ResponseTime: 0, errorRate: 0, activeConnections: 0, queueLength: 0, throughput: 0 },
      database: { connectionsActive: 0, connectionsIdle: 0, queryTime: 0, slowQueries: 0, cacheHitRate: 0, lockWaitTime: 0 }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API Methods
  getMetrics(limit?: number): PerformanceMetrics[] {
    return limit ? this.metrics.slice(-limit) : this.metrics;
  }

  getAlerts(unacknowledgedOnly = false): PerformanceAlert[] {
    return unacknowledgedOnly 
      ? this.alerts.filter(alert => !alert.acknowledged)
      : this.alerts;
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  getPredictions(modelId?: string): Prediction[] {
    if (modelId) {
      const model = this.models.get(modelId);
      return model ? model.predictions : [];
    }
    
    return Array.from(this.models.values()).flatMap(model => model.predictions);
  }

  getOptimizationHistory(limit?: number): OptimizationResult[] {
    return limit ? this.optimizationHistory.slice(-limit) : this.optimizationHistory;
  }

  async manualOptimization(ruleId: string): Promise<OptimizationResult> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Optimization rule ${ruleId} not found`);
    }
    
    const metrics = this.getLatestMetrics();
    const result = await rule.action.execute(rule.action.parameters);
    
    result.metrics.before = metrics;
    this.optimizationHistory.push(result);
    
    return result;
  }

  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart monitoring if interval changed
    if (config.monitoringInterval && this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.startMonitoring();
    }
  }

  getSystemHealth(): {
    overall: 'healthy' | 'warning' | 'critical';
    cpu: 'healthy' | 'warning' | 'critical';
    memory: 'healthy' | 'warning' | 'critical';
    network: 'healthy' | 'warning' | 'critical';
    application: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
  } {
    const latest = this.getLatestMetrics();
    
    const cpu = latest.cpu.usage > 90 ? 'critical' : latest.cpu.usage > 70 ? 'warning' : 'healthy';
    const memory = latest.memory.utilization > 90 ? 'critical' : latest.memory.utilization > 80 ? 'warning' : 'healthy';
    const network = latest.network.latency > 200 ? 'critical' : latest.network.latency > 100 ? 'warning' : 'healthy';
    const application = latest.application.errorRate > 0.05 ? 'critical' : latest.application.p95ResponseTime > 2000 ? 'warning' : 'healthy';
    const database = latest.database.slowQueries > 10 ? 'critical' : latest.database.queryTime > 50 ? 'warning' : 'healthy';
    
    const criticalCount = [cpu, memory, network, application, database].filter(status => status === 'critical').length;
    const warningCount = [cpu, memory, network, application, database].filter(status => status === 'warning').length;
    
    const overall = criticalCount > 0 ? 'critical' : warningCount > 1 ? 'warning' : 'healthy';
    
    return { overall, cpu, memory, network, application, database };
  }

  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval);
    }
    
    this.metrics = [];
    this.alerts = [];
    this.optimizationHistory = [];
    
    toast.success('Performance optimizer shut down successfully');
  }
}

// Factory function for creating optimizer instances
export function createPerformanceOptimizer(config?: Partial<PerformanceConfig>): PerformanceOptimizer {
  return new PerformanceOptimizer(config);
}

// Export default instance
export const defaultOptimizer = createPerformanceOptimizer();