/**
 * Optimization Hook
 * Advanced React hook for scan rule optimization, performance tuning,
 * AI-powered optimization, and resource management with real-time monitoring
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { optimizationAPIService } from '../services/optimization-apis';
import {
  OptimizationEngine,
  OptimizationJob,
  OptimizationResult,
  OptimizationMetrics,
  OptimizationConfiguration,
  OptimizationStrategy,
  PerformanceProfile,
  ResourceOptimization,
  CostOptimization,
  AIOptimization,
  OptimizationRecommendation,
  OptimizationAnalytics,
  OptimizationBenchmark,
  OptimizationAlert,
  OptimizationDeployment,
  OptimizationMonitoring,
  OptimizationWorkflow,
  OptimizationTemplate,
  OptimizationHistory,
  APIResponse,
  APIError
} from '../types/optimization.types';

/**
 * Optimization Hook Configuration
 */
interface UseOptimizationConfig {
  enableRealTime?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableMetrics?: boolean;
  enableAI?: boolean;
  enableAutoOptimization?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  batchSize?: number;
  maxRetries?: number;
  errorRetryDelay?: number;
  optimizationThreshold?: number;
  performanceTargets?: Record<string, number>;
  costTargets?: Record<string, number>;
}

/**
 * Optimization State Interface
 */
interface OptimizationState {
  // Core Optimization Data
  engines: OptimizationEngine[];
  jobs: OptimizationJob[];
  results: OptimizationResult[];
  strategies: OptimizationStrategy[];
  configurations: OptimizationConfiguration[];
  
  // Performance and Resource Data
  performanceProfiles: PerformanceProfile[];
  resourceOptimizations: ResourceOptimization[];
  costOptimizations: CostOptimization[];
  
  // AI and Recommendations
  aiOptimizations: AIOptimization[];
  recommendations: OptimizationRecommendation[];
  
  // Analytics and Monitoring
  metrics: OptimizationMetrics | null;
  analytics: OptimizationAnalytics | null;
  benchmarks: OptimizationBenchmark[];
  alerts: OptimizationAlert[];
  monitoring: OptimizationMonitoring | null;
  
  // Workflows and Templates
  workflows: OptimizationWorkflow[];
  templates: OptimizationTemplate[];
  history: OptimizationHistory[];
  
  // Current Operations
  currentJob: OptimizationJob | null;
  currentResult: OptimizationResult | null;
  activeOptimizations: OptimizationJob[];
  runningDeployments: OptimizationDeployment[];
  
  // UI State
  loading: boolean;
  error: APIError | null;
  selectedEngineId: string | null;
  selectedJobId: string | null;
  
  // Real-time State
  realTimeConnected: boolean;
  lastUpdate: Date | null;
  updateCount: number;
}

/**
 * Optimization Operations Interface
 */
interface OptimizationOperations {
  // Engine Management
  loadEngines: () => Promise<void>;
  getEngine: (engineId: string) => Promise<OptimizationEngine | null>;
  createEngine: (engine: Partial<OptimizationEngine>) => Promise<OptimizationEngine | null>;
  updateEngine: (engineId: string, updates: Partial<OptimizationEngine>) => Promise<OptimizationEngine | null>;
  deleteEngine: (engineId: string) => Promise<boolean>;
  
  // Optimization Jobs
  startOptimization: (request: any) => Promise<OptimizationJob | null>;
  getOptimizationJob: (jobId: string) => Promise<OptimizationJob | null>;
  stopOptimization: (jobId: string) => Promise<boolean>;
  pauseOptimization: (jobId: string) => Promise<boolean>;
  resumeOptimization: (jobId: string) => Promise<boolean>;
  
  // Optimization Results
  getOptimizationResult: (jobId: string) => Promise<OptimizationResult | null>;
  applyOptimization: (resultId: string) => Promise<boolean>;
  revertOptimization: (resultId: string) => Promise<boolean>;
  compareOptimizations: (resultIds: string[]) => Promise<any>;
  
  // Performance Optimization
  analyzePerformance: (data: any) => Promise<PerformanceProfile | null>;
  optimizePerformance: (profileId: string, targets: any) => Promise<OptimizationJob | null>;
  benchmarkPerformance: (config: any) => Promise<OptimizationBenchmark | null>;
  
  // Resource Optimization
  analyzeResources: (data: any) => Promise<ResourceOptimization | null>;
  optimizeResources: (config: any) => Promise<OptimizationJob | null>;
  scaleResources: (resourceId: string, scaling: any) => Promise<boolean>;
  
  // Cost Optimization
  analyzeCosts: (data: any) => Promise<CostOptimization | null>;
  optimizeCosts: (config: any) => Promise<OptimizationJob | null>;
  calculateROI: (optimizationId: string) => Promise<number>;
  
  // AI-Powered Optimization
  enableAIOptimization: (config: any) => Promise<AIOptimization | null>;
  getAIRecommendations: (context: any) => Promise<OptimizationRecommendation[]>;
  applyAIRecommendation: (recommendationId: string) => Promise<boolean>;
  trainOptimizationModel: (data: any) => Promise<boolean>;
  
  // Optimization Strategies
  loadStrategies: () => Promise<void>;
  createStrategy: (strategy: Partial<OptimizationStrategy>) => Promise<OptimizationStrategy | null>;
  updateStrategy: (strategyId: string, updates: Partial<OptimizationStrategy>) => Promise<OptimizationStrategy | null>;
  deleteStrategy: (strategyId: string) => Promise<boolean>;
  applyStrategy: (strategyId: string, target: any) => Promise<OptimizationJob | null>;
  
  // Optimization Workflows
  createWorkflow: (workflow: Partial<OptimizationWorkflow>) => Promise<OptimizationWorkflow | null>;
  executeWorkflow: (workflowId: string, data: any) => Promise<OptimizationJob | null>;
  monitorWorkflow: (workflowId: string) => Promise<OptimizationMonitoring | null>;
  
  // Templates and History
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Partial<OptimizationTemplate>) => Promise<OptimizationTemplate | null>;
  applyTemplate: (templateId: string, data: any) => Promise<OptimizationJob | null>;
  getHistory: (filters?: any) => Promise<void>;
  
  // Analytics and Monitoring
  getMetrics: () => Promise<OptimizationMetrics | null>;
  getAnalytics: (request: any) => Promise<OptimizationAnalytics | null>;
  getMonitoring: () => Promise<OptimizationMonitoring | null>;
  generateReport: (options: any) => Promise<any>;
  
  // Alerts and Notifications
  getAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
  configureAlerts: (config: any) => Promise<boolean>;
  
  // Deployment Management
  deployOptimization: (resultId: string, options: any) => Promise<OptimizationDeployment | null>;
  getDeploymentStatus: (deploymentId: string) => Promise<OptimizationDeployment | null>;
  rollbackDeployment: (deploymentId: string) => Promise<boolean>;
  
  // Utility Operations
  refreshData: () => Promise<void>;
  clearCache: () => void;
  exportData: (format: 'json' | 'csv' | 'excel') => Promise<Blob | null>;
  resetState: () => void;
}

/**
 * Advanced Optimization Hook
 */
export const useOptimization = (config: UseOptimizationConfig = {}): [OptimizationState, OptimizationOperations] => {
  // Configuration with defaults
  const hookConfig = useMemo(() => ({
    enableRealTime: true,
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableMetrics: true,
    enableAI: true,
    enableAutoOptimization: false,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    batchSize: 50,
    maxRetries: 3,
    errorRetryDelay: 1000,
    optimizationThreshold: 0.1, // 10% improvement threshold
    performanceTargets: {
      responseTime: 200, // ms
      throughput: 1000, // requests/sec
      errorRate: 0.01 // 1%
    },
    costTargets: {
      reduction: 0.2, // 20% cost reduction
      efficiency: 0.9 // 90% efficiency
    },
    ...config
  }), [config]);

  // State Management
  const [state, setState] = useState<OptimizationState>({
    // Core Optimization Data
    engines: [],
    jobs: [],
    results: [],
    strategies: [],
    configurations: [],
    
    // Performance and Resource Data
    performanceProfiles: [],
    resourceOptimizations: [],
    costOptimizations: [],
    
    // AI and Recommendations
    aiOptimizations: [],
    recommendations: [],
    
    // Analytics and Monitoring
    metrics: null,
    analytics: null,
    benchmarks: [],
    alerts: [],
    monitoring: null,
    
    // Workflows and Templates
    workflows: [],
    templates: [],
    history: [],
    
    // Current Operations
    currentJob: null,
    currentResult: null,
    activeOptimizations: [],
    runningDeployments: [],
    
    // UI State
    loading: false,
    error: null,
    selectedEngineId: null,
    selectedJobId: null,
    
    // Real-time State
    realTimeConnected: false,
    lastUpdate: null,
    updateCount: 0
  });

  // Refs for managing timers and subscriptions
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const metricsRef = useRef<any>({
    operations: 0,
    successful: 0,
    failed: 0,
    averageResponseTime: 0,
    optimizationsStarted: 0,
    optimizationsCompleted: 0,
    optimizationsApplied: 0,
    performanceGains: 0,
    costSavings: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  /**
   * Update state with error handling
   */
  const updateState = useCallback((updates: Partial<OptimizationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle API errors with retry logic
   */
  const handleError = useCallback(async (error: APIError, operation: () => Promise<any>, retryCount = 0) => {
    console.error('Optimization operation error:', error);
    
    updateState({ error, loading: false });
    metricsRef.current.failed++;

    if (retryCount < hookConfig.maxRetries) {
      retryTimeoutRef.current = setTimeout(async () => {
        try {
          await operation();
        } catch (retryError) {
          await handleError(retryError as APIError, operation, retryCount + 1);
        }
      }, hookConfig.errorRetryDelay * Math.pow(2, retryCount));
    }
  }, [hookConfig.maxRetries, hookConfig.errorRetryDelay, updateState]);

  /**
   * Cache management
   */
  const getCachedData = useCallback((key: string) => {
    if (!hookConfig.enableCaching) return null;
    
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < hookConfig.cacheTimeout) {
      metricsRef.current.cacheHits++;
      return cached.data;
    }
    
    metricsRef.current.cacheMisses++;
    return null;
  }, [hookConfig.enableCaching, hookConfig.cacheTimeout]);

  const setCachedData = useCallback((key: string, data: any) => {
    if (hookConfig.enableCaching) {
      cacheRef.current.set(key, { data, timestamp: Date.now() });
    }
  }, [hookConfig.enableCaching]);

  // ==================== ENGINE MANAGEMENT ====================

  const loadEngines = useCallback(async () => {
    const cacheKey = 'optimization-engines';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ engines: cachedData });
      return;
    }

    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.getOptimizationEngines({
        includeMetrics: hookConfig.enableMetrics,
        includeAnalytics: true,
        realTimeUpdates: hookConfig.enableRealTime
      });
      
      if (response.success) {
        updateState({ engines: response.data, loading: false });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadEngines);
    }
  }, [getCachedData, setCachedData, hookConfig.enableMetrics, hookConfig.enableRealTime, updateState, handleError]);

  const getEngine = useCallback(async (engineId: string): Promise<OptimizationEngine | null> => {
    const cacheKey = `optimization-engine-${engineId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) return cachedData;

    try {
      const response = await optimizationAPIService.getOptimizationEngine(engineId, {
        includeMetrics: hookConfig.enableMetrics,
        includeAnalytics: true
      });
      
      if (response.success) {
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getEngine(engineId));
    }
    
    return null;
  }, [getCachedData, setCachedData, hookConfig.enableMetrics, handleError]);

  const createEngine = useCallback(async (engine: Partial<OptimizationEngine>): Promise<OptimizationEngine | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.createOptimizationEngine(engine);
      
      if (response.success) {
        updateState(prev => ({
          engines: [...prev.engines, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createEngine(engine));
    }
    
    return null;
  }, [updateState, handleError]);

  const updateEngine = useCallback(async (engineId: string, updates: Partial<OptimizationEngine>): Promise<OptimizationEngine | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.updateOptimizationEngine(engineId, updates);
      
      if (response.success) {
        updateState(prev => ({
          engines: prev.engines.map(engine => 
            engine.id === engineId ? { ...engine, ...response.data } : engine
          ),
          loading: false
        }));
        
        // Clear cache for this engine
        cacheRef.current.delete(`optimization-engine-${engineId}`);
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateEngine(engineId, updates));
    }
    
    return null;
  }, [updateState, handleError]);

  const deleteEngine = useCallback(async (engineId: string): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.deleteOptimizationEngine(engineId);
      
      if (response.success) {
        updateState(prev => ({
          engines: prev.engines.filter(engine => engine.id !== engineId),
          loading: false
        }));
        
        // Clear cache for this engine
        cacheRef.current.delete(`optimization-engine-${engineId}`);
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteEngine(engineId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== OPTIMIZATION JOBS ====================

  const startOptimization = useCallback(async (request: any): Promise<OptimizationJob | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.startOptimization(request);
      
      if (response.success) {
        updateState(prev => ({
          jobs: [...prev.jobs, response.data],
          activeOptimizations: [...prev.activeOptimizations, response.data],
          currentJob: response.data,
          loading: false
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsStarted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => startOptimization(request));
    }
    
    return null;
  }, [updateState, handleError]);

  const getOptimizationJob = useCallback(async (jobId: string): Promise<OptimizationJob | null> => {
    const cacheKey = `optimization-job-${jobId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) return cachedData;

    try {
      const response = await optimizationAPIService.getOptimizationJob(jobId);
      
      if (response.success) {
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getOptimizationJob(jobId));
    }
    
    return null;
  }, [getCachedData, setCachedData, handleError]);

  const stopOptimization = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.stopOptimization(jobId);
      
      if (response.success) {
        updateState(prev => ({
          jobs: prev.jobs.map(job => 
            job.id === jobId ? { ...job, status: 'stopped' } : job
          ),
          activeOptimizations: prev.activeOptimizations.filter(job => job.id !== jobId)
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => stopOptimization(jobId));
    }
    
    return false;
  }, [updateState, handleError]);

  const pauseOptimization = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.pauseOptimization(jobId);
      
      if (response.success) {
        updateState(prev => ({
          jobs: prev.jobs.map(job => 
            job.id === jobId ? { ...job, status: 'paused' } : job
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => pauseOptimization(jobId));
    }
    
    return false;
  }, [updateState, handleError]);

  const resumeOptimization = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.resumeOptimization(jobId);
      
      if (response.success) {
        updateState(prev => ({
          jobs: prev.jobs.map(job => 
            job.id === jobId ? { ...job, status: 'running' } : job
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => resumeOptimization(jobId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== OPTIMIZATION RESULTS ====================

  const getOptimizationResult = useCallback(async (jobId: string): Promise<OptimizationResult | null> => {
    const cacheKey = `optimization-result-${jobId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) return cachedData;

    try {
      const response = await optimizationAPIService.getOptimizationResult(jobId);
      
      if (response.success) {
        updateState(prev => ({
          results: [...prev.results.filter(r => r.jobId !== jobId), response.data],
          currentResult: response.data
        }));
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
        metricsRef.current.optimizationsCompleted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getOptimizationResult(jobId));
    }
    
    return null;
  }, [getCachedData, setCachedData, updateState, handleError]);

  const applyOptimization = useCallback(async (resultId: string): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.applyOptimization(resultId);
      
      if (response.success) {
        updateState(prev => ({
          results: prev.results.map(result => 
            result.id === resultId ? { ...result, status: 'applied' } : result
          ),
          loading: false
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsApplied++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => applyOptimization(resultId));
    }
    
    return false;
  }, [updateState, handleError]);

  const revertOptimization = useCallback(async (resultId: string): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.revertOptimization(resultId);
      
      if (response.success) {
        updateState(prev => ({
          results: prev.results.map(result => 
            result.id === resultId ? { ...result, status: 'reverted' } : result
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => revertOptimization(resultId));
    }
    
    return false;
  }, [updateState, handleError]);

  const compareOptimizations = useCallback(async (resultIds: string[]): Promise<any> => {
    try {
      const response = await optimizationAPIService.compareOptimizations({ resultIds });
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => compareOptimizations(resultIds));
    }
    
    return null;
  }, [handleError]);

  // ==================== PERFORMANCE OPTIMIZATION ====================

  const analyzePerformance = useCallback(async (data: any): Promise<PerformanceProfile | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.analyzePerformance({ data });
      
      if (response.success) {
        updateState(prev => ({
          performanceProfiles: [...prev.performanceProfiles, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => analyzePerformance(data));
    }
    
    return null;
  }, [updateState, handleError]);

  const optimizePerformance = useCallback(async (profileId: string, targets: any): Promise<OptimizationJob | null> => {
    try {
      const response = await optimizationAPIService.optimizePerformance({ profileId, targets });
      
      if (response.success) {
        updateState(prev => ({
          jobs: [...prev.jobs, response.data],
          activeOptimizations: [...prev.activeOptimizations, response.data]
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsStarted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => optimizePerformance(profileId, targets));
    }
    
    return null;
  }, [updateState, handleError]);

  const benchmarkPerformance = useCallback(async (config: any): Promise<OptimizationBenchmark | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.benchmarkPerformance(config);
      
      if (response.success) {
        updateState(prev => ({
          benchmarks: [...prev.benchmarks, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => benchmarkPerformance(config));
    }
    
    return null;
  }, [updateState, handleError]);

  // ==================== RESOURCE OPTIMIZATION ====================

  const analyzeResources = useCallback(async (data: any): Promise<ResourceOptimization | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.analyzeResources({ data });
      
      if (response.success) {
        updateState(prev => ({
          resourceOptimizations: [...prev.resourceOptimizations, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => analyzeResources(data));
    }
    
    return null;
  }, [updateState, handleError]);

  const optimizeResources = useCallback(async (config: any): Promise<OptimizationJob | null> => {
    try {
      const response = await optimizationAPIService.optimizeResources(config);
      
      if (response.success) {
        updateState(prev => ({
          jobs: [...prev.jobs, response.data],
          activeOptimizations: [...prev.activeOptimizations, response.data]
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsStarted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => optimizeResources(config));
    }
    
    return null;
  }, [updateState, handleError]);

  const scaleResources = useCallback(async (resourceId: string, scaling: any): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.scaleResources(resourceId, scaling);
      
      if (response.success) {
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => scaleResources(resourceId, scaling));
    }
    
    return false;
  }, [handleError]);

  // ==================== COST OPTIMIZATION ====================

  const analyzeCosts = useCallback(async (data: any): Promise<CostOptimization | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.analyzeCosts({ data });
      
      if (response.success) {
        updateState(prev => ({
          costOptimizations: [...prev.costOptimizations, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => analyzeCosts(data));
    }
    
    return null;
  }, [updateState, handleError]);

  const optimizeCosts = useCallback(async (config: any): Promise<OptimizationJob | null> => {
    try {
      const response = await optimizationAPIService.optimizeCosts(config);
      
      if (response.success) {
        updateState(prev => ({
          jobs: [...prev.jobs, response.data],
          activeOptimizations: [...prev.activeOptimizations, response.data]
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsStarted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => optimizeCosts(config));
    }
    
    return null;
  }, [updateState, handleError]);

  const calculateROI = useCallback(async (optimizationId: string): Promise<number> => {
    try {
      const response = await optimizationAPIService.calculateROI(optimizationId);
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data.roi;
      }
    } catch (error) {
      await handleError(error as APIError, () => calculateROI(optimizationId));
    }
    
    return 0;
  }, [handleError]);

  // ==================== AI-POWERED OPTIMIZATION ====================

  const enableAIOptimization = useCallback(async (config: any): Promise<AIOptimization | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.enableAIOptimization(config);
      
      if (response.success) {
        updateState(prev => ({
          aiOptimizations: [...prev.aiOptimizations, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => enableAIOptimization(config));
    }
    
    return null;
  }, [updateState, handleError]);

  const getAIRecommendations = useCallback(async (context: any): Promise<OptimizationRecommendation[]> => {
    try {
      const response = await optimizationAPIService.getAIRecommendations(context);
      
      if (response.success) {
        updateState(prev => ({
          recommendations: [...prev.recommendations, ...response.data]
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getAIRecommendations(context));
    }
    
    return [];
  }, [updateState, handleError]);

  const applyAIRecommendation = useCallback(async (recommendationId: string): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.applyAIRecommendation(recommendationId);
      
      if (response.success) {
        updateState(prev => ({
          recommendations: prev.recommendations.map(rec => 
            rec.id === recommendationId ? { ...rec, status: 'applied' } : rec
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => applyAIRecommendation(recommendationId));
    }
    
    return false;
  }, [updateState, handleError]);

  const trainOptimizationModel = useCallback(async (data: any): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.trainOptimizationModel(data);
      
      if (response.success) {
        updateState({ loading: false });
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => trainOptimizationModel(data));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== OPTIMIZATION STRATEGIES ====================

  const loadStrategies = useCallback(async () => {
    const cacheKey = 'optimization-strategies';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ strategies: cachedData });
      return;
    }

    try {
      const response = await optimizationAPIService.getOptimizationStrategies();
      
      if (response.success) {
        updateState({ strategies: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadStrategies);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createStrategy = useCallback(async (strategy: Partial<OptimizationStrategy>): Promise<OptimizationStrategy | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.createOptimizationStrategy(strategy);
      
      if (response.success) {
        updateState(prev => ({
          strategies: [...prev.strategies, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createStrategy(strategy));
    }
    
    return null;
  }, [updateState, handleError]);

  const updateStrategy = useCallback(async (strategyId: string, updates: Partial<OptimizationStrategy>): Promise<OptimizationStrategy | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.updateOptimizationStrategy(strategyId, updates);
      
      if (response.success) {
        updateState(prev => ({
          strategies: prev.strategies.map(strategy => 
            strategy.id === strategyId ? { ...strategy, ...response.data } : strategy
          ),
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateStrategy(strategyId, updates));
    }
    
    return null;
  }, [updateState, handleError]);

  const deleteStrategy = useCallback(async (strategyId: string): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.deleteOptimizationStrategy(strategyId);
      
      if (response.success) {
        updateState(prev => ({
          strategies: prev.strategies.filter(strategy => strategy.id !== strategyId),
          loading: false
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteStrategy(strategyId));
    }
    
    return false;
  }, [updateState, handleError]);

  const applyStrategy = useCallback(async (strategyId: string, target: any): Promise<OptimizationJob | null> => {
    try {
      const response = await optimizationAPIService.applyOptimizationStrategy(strategyId, target);
      
      if (response.success) {
        updateState(prev => ({
          jobs: [...prev.jobs, response.data],
          activeOptimizations: [...prev.activeOptimizations, response.data]
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsStarted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => applyStrategy(strategyId, target));
    }
    
    return null;
  }, [updateState, handleError]);

  // ==================== OPTIMIZATION WORKFLOWS ====================

  const createWorkflow = useCallback(async (workflow: Partial<OptimizationWorkflow>): Promise<OptimizationWorkflow | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.createOptimizationWorkflow(workflow);
      
      if (response.success) {
        updateState(prev => ({
          workflows: [...prev.workflows, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createWorkflow(workflow));
    }
    
    return null;
  }, [updateState, handleError]);

  const executeWorkflow = useCallback(async (workflowId: string, data: any): Promise<OptimizationJob | null> => {
    try {
      const response = await optimizationAPIService.executeOptimizationWorkflow(workflowId, data);
      
      if (response.success) {
        updateState(prev => ({
          jobs: [...prev.jobs, response.data],
          activeOptimizations: [...prev.activeOptimizations, response.data]
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsStarted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => executeWorkflow(workflowId, data));
    }
    
    return null;
  }, [updateState, handleError]);

  const monitorWorkflow = useCallback(async (workflowId: string): Promise<OptimizationMonitoring | null> => {
    try {
      const response = await optimizationAPIService.monitorOptimizationWorkflow(workflowId);
      
      if (response.success) {
        updateState({ monitoring: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => monitorWorkflow(workflowId));
    }
    
    return null;
  }, [updateState, handleError]);

  // ==================== TEMPLATES AND HISTORY ====================

  const loadTemplates = useCallback(async () => {
    const cacheKey = 'optimization-templates';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ templates: cachedData });
      return;
    }

    try {
      const response = await optimizationAPIService.getOptimizationTemplates();
      
      if (response.success) {
        updateState({ templates: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadTemplates);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createTemplate = useCallback(async (template: Partial<OptimizationTemplate>): Promise<OptimizationTemplate | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.createOptimizationTemplate(template);
      
      if (response.success) {
        updateState(prev => ({
          templates: [...prev.templates, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createTemplate(template));
    }
    
    return null;
  }, [updateState, handleError]);

  const applyTemplate = useCallback(async (templateId: string, data: any): Promise<OptimizationJob | null> => {
    try {
      const response = await optimizationAPIService.applyOptimizationTemplate(templateId, data);
      
      if (response.success) {
        updateState(prev => ({
          jobs: [...prev.jobs, response.data],
          activeOptimizations: [...prev.activeOptimizations, response.data]
        }));
        metricsRef.current.successful++;
        metricsRef.current.optimizationsStarted++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => applyTemplate(templateId, data));
    }
    
    return null;
  }, [updateState, handleError]);

  const getHistory = useCallback(async (filters?: any) => {
    try {
      const response = await optimizationAPIService.getOptimizationHistory(filters);
      
      if (response.success) {
        updateState({ history: response.data });
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, () => getHistory(filters));
    }
  }, [updateState, handleError]);

  // ==================== ANALYTICS AND MONITORING ====================

  const getMetrics = useCallback(async (): Promise<OptimizationMetrics | null> => {
    try {
      const response = await optimizationAPIService.getOptimizationMetrics();
      
      if (response.success) {
        updateState({ metrics: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getMetrics);
    }
    
    return null;
  }, [updateState, handleError]);

  const getAnalytics = useCallback(async (request: any): Promise<OptimizationAnalytics | null> => {
    try {
      const response = await optimizationAPIService.getOptimizationAnalytics(request);
      
      if (response.success) {
        updateState({ analytics: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getAnalytics(request));
    }
    
    return null;
  }, [updateState, handleError]);

  const getMonitoring = useCallback(async (): Promise<OptimizationMonitoring | null> => {
    try {
      const response = await optimizationAPIService.getOptimizationMonitoring();
      
      if (response.success) {
        updateState({ monitoring: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getMonitoring);
    }
    
    return null;
  }, [updateState, handleError]);

  const generateReport = useCallback(async (options: any): Promise<any> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.generateOptimizationReport(options);
      
      if (response.success) {
        updateState({ loading: false });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => generateReport(options));
    }
    
    return null;
  }, [updateState, handleError]);

  // ==================== ALERTS AND NOTIFICATIONS ====================

  const getAlerts = useCallback(async () => {
    try {
      const response = await optimizationAPIService.getOptimizationAlerts();
      
      if (response.success) {
        updateState({ alerts: response.data });
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, getAlerts);
    }
  }, [updateState, handleError]);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.acknowledgeOptimizationAlert(alertId);
      
      if (response.success) {
        updateState(prev => ({
          alerts: prev.alerts.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => acknowledgeAlert(alertId));
    }
    
    return false;
  }, [updateState, handleError]);

  const configureAlerts = useCallback(async (config: any): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.configureOptimizationAlerts(config);
      
      if (response.success) {
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => configureAlerts(config));
    }
    
    return false;
  }, [handleError]);

  // ==================== DEPLOYMENT MANAGEMENT ====================

  const deployOptimization = useCallback(async (resultId: string, options: any): Promise<OptimizationDeployment | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await optimizationAPIService.deployOptimization(resultId, options);
      
      if (response.success) {
        updateState(prev => ({
          runningDeployments: [...prev.runningDeployments, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => deployOptimization(resultId, options));
    }
    
    return null;
  }, [updateState, handleError]);

  const getDeploymentStatus = useCallback(async (deploymentId: string): Promise<OptimizationDeployment | null> => {
    try {
      const response = await optimizationAPIService.getOptimizationDeploymentStatus(deploymentId);
      
      if (response.success) {
        updateState(prev => ({
          runningDeployments: prev.runningDeployments.map(deployment => 
            deployment.id === deploymentId ? response.data : deployment
          )
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getDeploymentStatus(deploymentId));
    }
    
    return null;
  }, [updateState, handleError]);

  const rollbackDeployment = useCallback(async (deploymentId: string): Promise<boolean> => {
    try {
      const response = await optimizationAPIService.rollbackOptimizationDeployment(deploymentId);
      
      if (response.success) {
        updateState(prev => ({
          runningDeployments: prev.runningDeployments.map(deployment => 
            deployment.id === deploymentId ? { ...deployment, status: 'rolled_back' } : deployment
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => rollbackDeployment(deploymentId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== UTILITY OPERATIONS ====================

  const refreshData = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      await Promise.all([
        loadEngines(),
        loadStrategies(),
        loadTemplates(),
        getMetrics(),
        getMonitoring(),
        getAlerts()
      ]);
      
      updateState({ 
        loading: false, 
        lastUpdate: new Date(),
        updateCount: state.updateCount + 1
      });
    } catch (error) {
      await handleError(error as APIError, refreshData);
    }
  }, [loadEngines, loadStrategies, loadTemplates, getMetrics, getMonitoring, getAlerts, state.updateCount, updateState, handleError]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    metricsRef.current.cacheHits = 0;
    metricsRef.current.cacheMisses = 0;
  }, []);

  const exportData = useCallback(async (format: 'json' | 'csv' | 'excel'): Promise<Blob | null> => {
    try {
      const response = await optimizationAPIService.exportOptimizationData({ format });
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => exportData(format));
    }
    
    return null;
  }, [handleError]);

  const resetState = useCallback(() => {
    setState({
      engines: [],
      jobs: [],
      results: [],
      strategies: [],
      configurations: [],
      performanceProfiles: [],
      resourceOptimizations: [],
      costOptimizations: [],
      aiOptimizations: [],
      recommendations: [],
      metrics: null,
      analytics: null,
      benchmarks: [],
      alerts: [],
      monitoring: null,
      workflows: [],
      templates: [],
      history: [],
      currentJob: null,
      currentResult: null,
      activeOptimizations: [],
      runningDeployments: [],
      loading: false,
      error: null,
      selectedEngineId: null,
      selectedJobId: null,
      realTimeConnected: false,
      lastUpdate: null,
      updateCount: 0
    });
    
    clearCache();
    metricsRef.current = {
      operations: 0,
      successful: 0,
      failed: 0,
      averageResponseTime: 0,
      optimizationsStarted: 0,
      optimizationsCompleted: 0,
      optimizationsApplied: 0,
      performanceGains: 0,
      costSavings: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }, [clearCache]);

  // ==================== EFFECTS ====================

  // Initialize real-time connection
  useEffect(() => {
    if (hookConfig.enableRealTime) {
      const unsubscribe = optimizationAPIService.subscribe('optimization_updated', (data) => {
        updateState(prev => ({
          ...prev,
          lastUpdate: new Date(),
          updateCount: prev.updateCount + 1,
          realTimeConnected: true
        }));
      });
      
      wsUnsubscribeRef.current = unsubscribe;
      
      return () => {
        if (wsUnsubscribeRef.current) {
          wsUnsubscribeRef.current();
        }
      };
    }
  }, [hookConfig.enableRealTime, updateState]);

  // Auto-refresh timer
  useEffect(() => {
    if (hookConfig.autoRefresh && hookConfig.refreshInterval > 0) {
      refreshTimerRef.current = setInterval(refreshData, hookConfig.refreshInterval);
      
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [hookConfig.autoRefresh, hookConfig.refreshInterval, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
    };
  }, []);

  // Operations object
  const operations: OptimizationOperations = {
    // Engine Management
    loadEngines,
    getEngine,
    createEngine,
    updateEngine,
    deleteEngine,
    
    // Optimization Jobs
    startOptimization,
    getOptimizationJob,
    stopOptimization,
    pauseOptimization,
    resumeOptimization,
    
    // Optimization Results
    getOptimizationResult,
    applyOptimization,
    revertOptimization,
    compareOptimizations,
    
    // Performance Optimization
    analyzePerformance,
    optimizePerformance,
    benchmarkPerformance,
    
    // Resource Optimization
    analyzeResources,
    optimizeResources,
    scaleResources,
    
    // Cost Optimization
    analyzeCosts,
    optimizeCosts,
    calculateROI,
    
    // AI-Powered Optimization
    enableAIOptimization,
    getAIRecommendations,
    applyAIRecommendation,
    trainOptimizationModel,
    
    // Optimization Strategies
    loadStrategies,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    applyStrategy,
    
    // Optimization Workflows
    createWorkflow,
    executeWorkflow,
    monitorWorkflow,
    
    // Templates and History
    loadTemplates,
    createTemplate,
    applyTemplate,
    getHistory,
    
    // Analytics and Monitoring
    getMetrics,
    getAnalytics,
    getMonitoring,
    generateReport,
    
    // Alerts and Notifications
    getAlerts,
    acknowledgeAlert,
    configureAlerts,
    
    // Deployment Management
    deployOptimization,
    getDeploymentStatus,
    rollbackDeployment,
    
    // Utility Operations
    refreshData,
    clearCache,
    exportData,
    resetState
  };

  return [state, operations];
};

export default useOptimization;