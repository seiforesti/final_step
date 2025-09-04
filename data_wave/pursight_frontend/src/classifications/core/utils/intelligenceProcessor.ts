import { toast } from 'sonner';

// Advanced TypeScript interfaces for intelligence processing
export interface ProcessingConfig {
  batchSize: number;
  maxConcurrency: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheExpiry: number;
  enableOptimization: boolean;
  optimizationLevel: 'basic' | 'advanced' | 'aggressive';
  enableProfiling: boolean;
  profilingInterval: number;
}

export interface ProcessingContext {
  id: string;
  type: 'classification' | 'training' | 'inference' | 'analysis' | 'optimization';
  source: string;
  metadata: Record<string, any>;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  results?: any[];
  errors?: ProcessingError[];
  metrics: ProcessingMetrics;
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

export interface ProcessingMetrics {
  itemsProcessed: number;
  itemsTotal: number;
  throughputPerSecond: number;
  averageProcessingTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  errorRate: number;
  qualityScore: number;
  confidenceScore: number;
}

export interface ProcessingTask<T = any, R = any> {
  id: string;
  data: T;
  processor: (data: T, context: ProcessingContext) => Promise<R>;
  priority: number;
  dependencies?: string[];
  timeout?: number;
  retryConfig?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
  validation?: (result: R) => boolean;
  transformation?: (result: R) => any;
}

export interface ProcessingPipeline {
  id: string;
  name: string;
  stages: ProcessingStage[];
  parallelExecution: boolean;
  errorHandling: 'fail-fast' | 'continue' | 'retry';
  outputFormat: 'array' | 'stream' | 'batch';
}

export interface ProcessingStage {
  id: string;
  name: string;
  processor: string;
  config: Record<string, any>;
  inputFilter?: (data: any) => boolean;
  outputTransform?: (data: any) => any;
  errorHandler?: (error: ProcessingError) => any;
}

export interface OptimizationResult {
  originalMetrics: ProcessingMetrics;
  optimizedMetrics: ProcessingMetrics;
  improvements: {
    throughput: number;
    latency: number;
    memoryUsage: number;
    errorRate: number;
  };
  recommendations: OptimizationRecommendation[];
  appliedOptimizations: string[];
}

export interface OptimizationRecommendation {
  type: 'batching' | 'caching' | 'parallelization' | 'resource-allocation' | 'algorithm-tuning';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: number;
  implementation: string;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessed: Date;
  size: number;
  metadata?: Record<string, any>;
}

export interface ProcessingProfile {
  contextId: string;
  samples: ProfileSample[];
  aggregatedMetrics: {
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    throughput: number;
    errorRate: number;
    memoryPeak: number;
    cpuAverage: number;
  };
  bottlenecks: ProfileBottleneck[];
  recommendations: OptimizationRecommendation[];
}

export interface ProfileSample {
  timestamp: Date;
  latency: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  queueLength: number;
  activeWorkers: number;
}

export interface ProfileBottleneck {
  stage: string;
  type: 'cpu' | 'memory' | 'io' | 'network' | 'algorithm';
  severity: number;
  description: string;
  suggestion: string;
}

// Advanced Intelligence Processor Class
export class IntelligenceProcessor {
  private config: ProcessingConfig;
  private contexts: Map<string, ProcessingContext> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private taskQueue: Map<string, ProcessingTask[]> = new Map();
  private workers: Map<string, Worker[]> = new Map();
  private profiles: Map<string, ProcessingProfile> = new Map();
  private pipelines: Map<string, ProcessingPipeline> = new Map();
  private optimizations: Map<string, OptimizationResult> = new Map();

  constructor(config: Partial<ProcessingConfig> = {}) {
    this.config = {
      batchSize: 100,
      maxConcurrency: 4,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheExpiry: 3600000, // 1 hour
      enableOptimization: true,
      optimizationLevel: 'advanced',
      enableProfiling: true,
      profilingInterval: 5000,
      ...config
    };

    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), 60000);
    
    // Start profiling if enabled
    if (this.config.enableProfiling) {
      setInterval(() => this.collectProfileSamples(), this.config.profilingInterval);
    }
  }

  // Context Management
  async createContext(
    type: ProcessingContext['type'],
    source: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const context: ProcessingContext = {
      id: contextId,
      type,
      source,
      metadata,
      startTime: new Date(),
      status: 'pending',
      progress: 0,
      results: [],
      errors: [],
      metrics: {
        itemsProcessed: 0,
        itemsTotal: 0,
        throughputPerSecond: 0,
        averageProcessingTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        cacheHitRate: 0,
        errorRate: 0,
        qualityScore: 0,
        confidenceScore: 0
      }
    };

    this.contexts.set(contextId, context);
    this.taskQueue.set(contextId, []);

    return contextId;
  }

  getContext(contextId: string): ProcessingContext | null {
    return this.contexts.get(contextId) || null;
  }

  updateContext(contextId: string, updates: Partial<ProcessingContext>): void {
    const context = this.contexts.get(contextId);
    if (context) {
      Object.assign(context, updates);
      this.contexts.set(contextId, context);
    }
  }

  // Task Processing
  async addTask<T, R>(
    contextId: string,
    task: ProcessingTask<T, R>
  ): Promise<void> {
    const tasks = this.taskQueue.get(contextId) || [];
    tasks.push(task);
    
    // Sort by priority (higher priority first)
    tasks.sort((a, b) => b.priority - a.priority);
    
    this.taskQueue.set(contextId, tasks);
  }

  async processTasks(contextId: string): Promise<any[]> {
    const context = this.getContext(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }

    const tasks = this.taskQueue.get(contextId) || [];
    if (tasks.length === 0) {
      return [];
    }

    context.status = 'processing';
    context.metrics.itemsTotal = tasks.length;
    this.updateContext(contextId, context);

    const results: any[] = [];
    const batches = this.createBatches(tasks, this.config.batchSize);

    try {
      for (const batch of batches) {
        const batchResults = await this.processBatch(contextId, batch);
        results.push(...batchResults);
        
        // Update progress
        context.metrics.itemsProcessed += batch.length;
        context.progress = (context.metrics.itemsProcessed / context.metrics.itemsTotal) * 100;
        this.updateContext(contextId, context);
      }

      context.status = 'completed';
      context.endTime = new Date();
      context.results = results;
      
      // Calculate final metrics
      this.calculateMetrics(contextId);
      
      // Apply optimizations if enabled
      if (this.config.enableOptimization) {
        await this.optimizeContext(contextId);
      }

      return results;
    } catch (error) {
      context.status = 'failed';
      context.errors?.push({
        code: 'PROCESSING_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        timestamp: new Date(),
        severity: 'critical',
        recoverable: false
      });
      
      this.updateContext(contextId, context);
      throw error;
    }
  }

  private async processBatch<T, R>(
    contextId: string,
    tasks: ProcessingTask<T, R>[]
  ): Promise<R[]> {
    const context = this.getContext(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }

    const promises = tasks.map(task => this.processTask(contextId, task));
    
    // Process with concurrency limit
    const results: R[] = [];
    for (let i = 0; i < promises.length; i += this.config.maxConcurrency) {
      const batch = promises.slice(i, i + this.config.maxConcurrency);
      const batchResults = await Promise.allSettled(batch);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          context.errors?.push({
            code: 'TASK_FAILED',
            message: result.reason?.message || 'Task processing failed',
            details: { taskId: tasks[i + index].id, error: result.reason },
            timestamp: new Date(),
            severity: 'high',
            recoverable: true
          });
        }
      });
    }

    return results;
  }

  private async processTask<T, R>(
    contextId: string,
    task: ProcessingTask<T, R>
  ): Promise<R> {
    const context = this.getContext(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }

    const startTime = Date.now();

    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cacheKey = this.generateCacheKey(task);
        const cached = this.getFromCache<R>(cacheKey);
        if (cached) {
          context.metrics.cacheHitRate++;
          return cached;
        }
      }

      // Process with timeout
      const result = await this.withTimeout(
        task.processor(task.data, context),
        task.timeout || this.config.timeout
      );

      // Validate result
      if (task.validation && !task.validation(result)) {
        throw new Error('Task result validation failed');
      }

      // Transform result
      const finalResult = task.transformation ? task.transformation(result) : result;

      // Cache result
      if (this.config.enableCaching) {
        const cacheKey = this.generateCacheKey(task);
        this.addToCache(cacheKey, finalResult);
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateTaskMetrics(contextId, processingTime, true);

      return finalResult;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateTaskMetrics(contextId, processingTime, false);

      // Retry if configured
      if (task.retryConfig && task.retryConfig.attempts > 0) {
        await this.delay(task.retryConfig.delay);
        task.retryConfig.attempts--;
        return this.processTask(contextId, task);
      }

      throw error;
    }
  }

  // Pipeline Processing
  async createPipeline(pipeline: ProcessingPipeline): Promise<void> {
    this.pipelines.set(pipeline.id, pipeline);
  }

  async executePipeline(
    pipelineId: string,
    data: any[],
    contextId?: string
  ): Promise<any[]> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    const context = contextId ? this.getContext(contextId) : null;
    let currentData = data;

    for (const stage of pipeline.stages) {
      try {
        // Filter input data
        if (stage.inputFilter) {
          currentData = currentData.filter(stage.inputFilter);
        }

        // Process stage
        const stageResults = await this.processStage(stage, currentData, context);

        // Transform output
        if (stage.outputTransform) {
          currentData = stageResults.map(stage.outputTransform);
        } else {
          currentData = stageResults;
        }
      } catch (error) {
        if (pipeline.errorHandling === 'fail-fast') {
          throw error;
        } else if (pipeline.errorHandling === 'continue') {
          if (stage.errorHandler) {
            stage.errorHandler({
              code: 'STAGE_FAILED',
              message: error instanceof Error ? error.message : 'Stage failed',
              details: error,
              timestamp: new Date(),
              severity: 'high',
              recoverable: true
            });
          }
          continue;
        }
        // Retry logic would go here for 'retry' mode
      }
    }

    return currentData;
  }

  private async processStage(
    stage: ProcessingStage,
    data: any[],
    context: ProcessingContext | null
  ): Promise<any[]> {
    // This would integrate with specific processors based on stage.processor
    // For now, we'll simulate processing
    return data.map(item => ({
      ...item,
      processedBy: stage.id,
      processedAt: new Date()
    }));
  }

  // Optimization Engine
  async optimizeContext(contextId: string): Promise<OptimizationResult> {
    const context = this.getContext(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }

    const originalMetrics = { ...context.metrics };
    const recommendations: OptimizationRecommendation[] = [];
    const appliedOptimizations: string[] = [];

    // Analyze performance bottlenecks
    if (context.metrics.throughputPerSecond < 10) {
      recommendations.push({
        type: 'batching',
        description: 'Increase batch size to improve throughput',
        impact: 'high',
        effort: 'low',
        estimatedImprovement: 0.3,
        implementation: 'Increase batchSize from current to 200'
      });
    }

    if (context.metrics.cacheHitRate < 0.5) {
      recommendations.push({
        type: 'caching',
        description: 'Optimize caching strategy for better hit rates',
        impact: 'medium',
        effort: 'medium',
        estimatedImprovement: 0.2,
        implementation: 'Implement intelligent cache warming and LRU eviction'
      });
    }

    if (context.metrics.errorRate > 0.05) {
      recommendations.push({
        type: 'algorithm-tuning',
        description: 'Tune algorithms to reduce error rate',
        impact: 'high',
        effort: 'high',
        estimatedImprovement: 0.4,
        implementation: 'Implement adaptive parameter tuning and validation'
      });
    }

    // Apply optimizations based on level
    if (this.config.optimizationLevel === 'aggressive') {
      // Apply all high-impact optimizations
      const highImpactOptimizations = recommendations.filter(r => r.impact === 'high');
      appliedOptimizations.push(...highImpactOptimizations.map(o => o.type));
    } else if (this.config.optimizationLevel === 'advanced') {
      // Apply high and medium impact optimizations
      const optimizations = recommendations.filter(r => r.impact === 'high' || r.impact === 'medium');
      appliedOptimizations.push(...optimizations.map(o => o.type));
    }

    // Simulate optimized metrics
    const optimizedMetrics = this.applyOptimizations(originalMetrics, appliedOptimizations);

    const result: OptimizationResult = {
      originalMetrics,
      optimizedMetrics,
      improvements: {
        throughput: (optimizedMetrics.throughputPerSecond - originalMetrics.throughputPerSecond) / originalMetrics.throughputPerSecond,
        latency: (originalMetrics.averageProcessingTime - optimizedMetrics.averageProcessingTime) / originalMetrics.averageProcessingTime,
        memoryUsage: (originalMetrics.memoryUsage - optimizedMetrics.memoryUsage) / originalMetrics.memoryUsage,
        errorRate: (originalMetrics.errorRate - optimizedMetrics.errorRate) / originalMetrics.errorRate
      },
      recommendations,
      appliedOptimizations
    };

    this.optimizations.set(contextId, result);
    return result;
  }

  private applyOptimizations(
    metrics: ProcessingMetrics,
    optimizations: string[]
  ): ProcessingMetrics {
    const optimized = { ...metrics };

    optimizations.forEach(opt => {
      switch (opt) {
        case 'batching':
          optimized.throughputPerSecond *= 1.3;
          break;
        case 'caching':
          optimized.cacheHitRate = Math.min(0.9, optimized.cacheHitRate * 1.5);
          optimized.averageProcessingTime *= 0.8;
          break;
        case 'parallelization':
          optimized.throughputPerSecond *= 1.5;
          optimized.cpuUsage *= 1.2;
          break;
        case 'algorithm-tuning':
          optimized.errorRate *= 0.6;
          optimized.qualityScore *= 1.2;
          optimized.confidenceScore *= 1.1;
          break;
      }
    });

    return optimized;
  }

  // Cache Management
  private generateCacheKey(task: ProcessingTask): string {
    return `task_${JSON.stringify(task.data)}_${task.processor.toString().slice(0, 100)}`;
  }

  private addToCache<T>(key: string, value: T, metadata?: Record<string, any>): void {
    const now = new Date();
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      expiresAt: new Date(now.getTime() + this.config.cacheExpiry),
      accessCount: 0,
      lastAccessed: now,
      size: this.estimateSize(value),
      metadata
    };

    this.cache.set(key, entry);
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = new Date();
    return entry.value as T;
  }

  private cleanupCache(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  // Performance Profiling
  private collectProfileSamples(): void {
    for (const [contextId, context] of this.contexts.entries()) {
      if (context.status !== 'processing') continue;

      const profile = this.profiles.get(contextId) || {
        contextId,
        samples: [],
        aggregatedMetrics: {
          averageLatency: 0,
          p95Latency: 0,
          p99Latency: 0,
          throughput: 0,
          errorRate: 0,
          memoryPeak: 0,
          cpuAverage: 0
        },
        bottlenecks: [],
        recommendations: []
      };

      const sample: ProfileSample = {
        timestamp: new Date(),
        latency: context.metrics.averageProcessingTime,
        throughput: context.metrics.throughputPerSecond,
        memoryUsage: context.metrics.memoryUsage,
        cpuUsage: context.metrics.cpuUsage,
        queueLength: this.taskQueue.get(contextId)?.length || 0,
        activeWorkers: this.workers.get(contextId)?.length || 0
      };

      profile.samples.push(sample);
      
      // Keep only recent samples (last 100)
      if (profile.samples.length > 100) {
        profile.samples = profile.samples.slice(-100);
      }

      // Update aggregated metrics
      this.updateAggregatedMetrics(profile);
      
      // Detect bottlenecks
      this.detectBottlenecks(profile);

      this.profiles.set(contextId, profile);
    }
  }

  private updateAggregatedMetrics(profile: ProcessingProfile): void {
    const samples = profile.samples;
    if (samples.length === 0) return;

    const latencies = samples.map(s => s.latency).sort((a, b) => a - b);
    const throughputs = samples.map(s => s.throughput);
    const memoryUsages = samples.map(s => s.memoryUsage);
    const cpuUsages = samples.map(s => s.cpuUsage);

    profile.aggregatedMetrics = {
      averageLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      throughput: throughputs.reduce((a, b) => a + b, 0) / throughputs.length,
      errorRate: 0, // Would be calculated from error samples
      memoryPeak: Math.max(...memoryUsages),
      cpuAverage: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length
    };
  }

  private detectBottlenecks(profile: ProcessingProfile): void {
    profile.bottlenecks = [];

    if (profile.aggregatedMetrics.cpuAverage > 0.8) {
      profile.bottlenecks.push({
        stage: 'processing',
        type: 'cpu',
        severity: profile.aggregatedMetrics.cpuAverage,
        description: 'High CPU usage detected',
        suggestion: 'Consider increasing parallelization or optimizing algorithms'
      });
    }

    if (profile.aggregatedMetrics.memoryPeak > 1000) { // MB
      profile.bottlenecks.push({
        stage: 'processing',
        type: 'memory',
        severity: profile.aggregatedMetrics.memoryPeak / 1000,
        description: 'High memory usage detected',
        suggestion: 'Consider implementing streaming processing or reducing batch sizes'
      });
    }

    if (profile.aggregatedMetrics.p95Latency > 5000) { // ms
      profile.bottlenecks.push({
        stage: 'processing',
        type: 'algorithm',
        severity: profile.aggregatedMetrics.p95Latency / 1000,
        description: 'High latency detected',
        suggestion: 'Consider algorithm optimization or caching strategies'
      });
    }
  }

  // Utility Methods
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      )
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateTaskMetrics(
    contextId: string,
    processingTime: number,
    success: boolean
  ): void {
    const context = this.getContext(contextId);
    if (!context) return;

    const metrics = context.metrics;
    
    // Update average processing time
    const totalTime = metrics.averageProcessingTime * metrics.itemsProcessed + processingTime;
    metrics.averageProcessingTime = totalTime / (metrics.itemsProcessed + 1);
    
    // Update throughput
    const elapsedTime = (Date.now() - context.startTime.getTime()) / 1000;
    metrics.throughputPerSecond = metrics.itemsProcessed / elapsedTime;
    
    // Update error rate
    if (!success) {
      metrics.errorRate = (metrics.errorRate * metrics.itemsProcessed + 1) / (metrics.itemsProcessed + 1);
    }

    this.updateContext(contextId, context);
  }

  private calculateMetrics(contextId: string): void {
    const context = this.getContext(contextId);
    if (!context) return;

    const totalTime = context.endTime!.getTime() - context.startTime.getTime();
    const metrics = context.metrics;

    // Final calculations
    metrics.throughputPerSecond = (metrics.itemsTotal * 1000) / totalTime;
    metrics.cacheHitRate = metrics.cacheHitRate / metrics.itemsTotal;
    
    // Calculate quality and confidence scores based on error rate and processing consistency
    metrics.qualityScore = Math.max(0, 1 - metrics.errorRate);
    metrics.confidenceScore = Math.max(0, 1 - (metrics.errorRate * 0.5) - (Math.abs(metrics.averageProcessingTime - 1000) / 10000));

    this.updateContext(contextId, context);
  }

  private estimateSize(obj: any): number {
    return JSON.stringify(obj).length * 2; // Rough estimate in bytes
  }

  // Public API Methods
  getProcessingMetrics(contextId: string): ProcessingMetrics | null {
    const context = this.getContext(contextId);
    return context ? context.metrics : null;
  }

  getOptimizationResults(contextId: string): OptimizationResult | null {
    return this.optimizations.get(contextId) || null;
  }

  getProfile(contextId: string): ProcessingProfile | null {
    return this.profiles.get(contextId) || null;
  }

  getCacheStats(): { size: number; hitRate: number; entries: number } {
    const entries = Array.from(this.cache.values());
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalHits = entries.filter(entry => entry.accessCount > 1).length;
    
    return {
      size: entries.reduce((sum, entry) => sum + entry.size, 0),
      hitRate: totalAccess > 0 ? totalHits / totalAccess : 0,
      entries: entries.length
    };
  }

  async clearContext(contextId: string): Promise<void> {
    this.contexts.delete(contextId);
    this.taskQueue.delete(contextId);
    this.workers.delete(contextId);
    this.profiles.delete(contextId);
    this.optimizations.delete(contextId);
  }

  async shutdown(): Promise<void> {
    // Cleanup all contexts and resources
    this.contexts.clear();
    this.taskQueue.clear();
    this.workers.clear();
    this.profiles.clear();
    this.optimizations.clear();
    this.cache.clear();
    
    toast.success('Intelligence processor shut down successfully');
  }
}

// Factory function for creating processor instances
export function createIntelligenceProcessor(config?: Partial<ProcessingConfig>): IntelligenceProcessor {
  return new IntelligenceProcessor(config);
}

// Utility functions for common processing tasks
export async function processClassificationBatch<T>(
  processor: IntelligenceProcessor,
  data: T[],
  classificationFn: (item: T) => Promise<any>,
  options: {
    batchSize?: number;
    priority?: number;
    validation?: (result: any) => boolean;
  } = {}
): Promise<any[]> {
  const contextId = await processor.createContext('classification', 'batch-classification');
  
  const tasks = data.map((item, index) => ({
    id: `task_${index}`,
    data: item,
    processor: async (data: T) => classificationFn(data),
    priority: options.priority || 1,
    validation: options.validation
  }));

  for (const task of tasks) {
    await processor.addTask(contextId, task);
  }

  return processor.processTasks(contextId);
}

export async function optimizeProcessingWorkflow(
  processor: IntelligenceProcessor,
  contextId: string
): Promise<OptimizationResult> {
  return processor.optimizeContext(contextId);
}

export function createProcessingPipeline(
  id: string,
  name: string,
  stages: ProcessingStage[]
): ProcessingPipeline {
  return {
    id,
    name,
    stages,
    parallelExecution: false,
    errorHandling: 'fail-fast',
    outputFormat: 'array'
  };
}

// Export default instance
export const defaultProcessor = createIntelligenceProcessor();