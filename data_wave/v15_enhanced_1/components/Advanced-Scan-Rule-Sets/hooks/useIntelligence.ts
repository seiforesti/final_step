/**
 * Intelligence Hook
 * Advanced React hook for scan intelligence operations, AI-powered insights,
 * pattern recognition, and predictive analytics with real-time capabilities
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { intelligenceAPIService } from '../services/intelligence-apis';
import {
  IntelligenceEngine,
  IntelligenceAnalysis,
  IntelligenceInsight,
  PatternRecognition,
  PredictiveAnalytics,
  AnomalyDetection,
  ThreatIntelligence,
  ContextualIntelligence,
  IntelligenceMetrics,
  IntelligenceConfiguration,
  IntelligenceReport,
  MLModel,
  AIRecommendation,
  IntelligenceWorkflow,
  IntelligenceOptimization,
  IntelligenceMonitoring,
  APIResponse,
  APIError
} from '../types/intelligence.types';

/**
 * Intelligence Hook Configuration
 */
interface UseIntelligenceConfig {
  enableRealTime?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableMetrics?: boolean;
  enableOptimization?: boolean;
  enablePredictive?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  batchSize?: number;
  maxRetries?: number;
  errorRetryDelay?: number;
  enableAI?: boolean;
  aiModelVersion?: string;
  confidenceThreshold?: number;
}

/**
 * Intelligence State Interface
 */
interface IntelligenceState {
  // Core Intelligence Data
  engines: IntelligenceEngine[];
  analyses: IntelligenceAnalysis[];
  insights: IntelligenceInsight[];
  patterns: PatternRecognition[];
  predictions: PredictiveAnalytics[];
  anomalies: AnomalyDetection[];
  threats: ThreatIntelligence[];
  contextual: ContextualIntelligence[];
  
  // Intelligence Operations
  currentAnalysis: IntelligenceAnalysis | null;
  currentInsight: IntelligenceInsight | null;
  activeWorkflows: IntelligenceWorkflow[];
  runningOptimizations: IntelligenceOptimization[];
  
  // ML and AI
  mlModels: MLModel[];
  aiRecommendations: AIRecommendation[];
  activePredictions: PredictiveAnalytics[];
  
  // Metrics and Monitoring
  metrics: IntelligenceMetrics | null;
  monitoring: IntelligenceMonitoring | null;
  performance: any;
  
  // UI State
  loading: boolean;
  error: APIError | null;
  selectedEngineId: string | null;
  selectedAnalysisId: string | null;
  
  // Real-time State
  realTimeConnected: boolean;
  lastUpdate: Date | null;
  updateCount: number;
}

/**
 * Intelligence Operations Interface
 */
interface IntelligenceOperations {
  // Engine Management
  loadEngines: () => Promise<void>;
  getEngine: (engineId: string) => Promise<IntelligenceEngine | null>;
  createEngine: (engine: Partial<IntelligenceEngine>) => Promise<IntelligenceEngine | null>;
  updateEngine: (engineId: string, updates: Partial<IntelligenceEngine>) => Promise<IntelligenceEngine | null>;
  deleteEngine: (engineId: string) => Promise<boolean>;
  
  // Intelligence Analysis
  startAnalysis: (request: any) => Promise<IntelligenceAnalysis | null>;
  getAnalysis: (analysisId: string) => Promise<IntelligenceAnalysis | null>;
  stopAnalysis: (analysisId: string) => Promise<boolean>;
  getAnalysisResults: (analysisId: string) => Promise<any>;
  
  // Pattern Recognition
  recognizePatterns: (data: any, options?: any) => Promise<PatternRecognition[]>;
  getPatternInsights: (patternId: string) => Promise<IntelligenceInsight[]>;
  validatePatterns: (patterns: string[]) => Promise<any>;
  
  // Predictive Analytics
  generatePredictions: (data: any, options?: any) => Promise<PredictiveAnalytics | null>;
  getPredictionAccuracy: (predictionId: string) => Promise<number>;
  updatePredictionModel: (modelId: string, data: any) => Promise<boolean>;
  
  // Anomaly Detection
  detectAnomalies: (data: any, options?: any) => Promise<AnomalyDetection[]>;
  investigateAnomaly: (anomalyId: string) => Promise<IntelligenceInsight | null>;
  resolveAnomaly: (anomalyId: string, resolution: any) => Promise<boolean>;
  
  // Threat Intelligence
  analyzeThreat: (data: any, options?: any) => Promise<ThreatIntelligence | null>;
  getThreatContext: (threatId: string) => Promise<ContextualIntelligence | null>;
  mitigateThreat: (threatId: string, mitigation: any) => Promise<boolean>;
  
  // AI Recommendations
  getRecommendations: (context: any) => Promise<AIRecommendation[]>;
  applyRecommendation: (recommendationId: string) => Promise<boolean>;
  feedbackRecommendation: (recommendationId: string, feedback: any) => Promise<boolean>;
  
  // Intelligence Workflows
  createWorkflow: (workflow: Partial<IntelligenceWorkflow>) => Promise<IntelligenceWorkflow | null>;
  executeWorkflow: (workflowId: string, data: any) => Promise<any>;
  monitorWorkflow: (workflowId: string) => Promise<IntelligenceMonitoring | null>;
  
  // Optimization
  optimizeIntelligence: (request: any) => Promise<IntelligenceOptimization | null>;
  applyOptimization: (optimizationId: string) => Promise<boolean>;
  
  // Metrics and Monitoring
  getMetrics: () => Promise<IntelligenceMetrics | null>;
  getMonitoring: () => Promise<IntelligenceMonitoring | null>;
  generateReport: (options: any) => Promise<IntelligenceReport | null>;
  
  // ML Model Management
  loadMLModels: () => Promise<void>;
  trainModel: (modelConfig: any) => Promise<MLModel | null>;
  deployModel: (modelId: string) => Promise<boolean>;
  evaluateModel: (modelId: string, testData: any) => Promise<any>;
  
  // Utility Operations
  refreshData: () => Promise<void>;
  clearCache: () => void;
  exportData: (format: 'json' | 'csv' | 'excel') => Promise<Blob | null>;
  resetState: () => void;
}

/**
 * Advanced Intelligence Hook
 */
export const useIntelligence = (config: UseIntelligenceConfig = {}): [IntelligenceState, IntelligenceOperations] => {
  // Configuration with defaults
  const hookConfig = useMemo(() => ({
    enableRealTime: true,
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableMetrics: true,
    enableOptimization: true,
    enablePredictive: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    batchSize: 50,
    maxRetries: 3,
    errorRetryDelay: 1000,
    enableAI: true,
    aiModelVersion: 'latest',
    confidenceThreshold: 0.8,
    ...config
  }), [config]);

  // State Management
  const [state, setState] = useState<IntelligenceState>({
    // Core Intelligence Data
    engines: [],
    analyses: [],
    insights: [],
    patterns: [],
    predictions: [],
    anomalies: [],
    threats: [],
    contextual: [],
    
    // Intelligence Operations
    currentAnalysis: null,
    currentInsight: null,
    activeWorkflows: [],
    runningOptimizations: [],
    
    // ML and AI
    mlModels: [],
    aiRecommendations: [],
    activePredictions: [],
    
    // Metrics and Monitoring
    metrics: null,
    monitoring: null,
    performance: null,
    
    // UI State
    loading: false,
    error: null,
    selectedEngineId: null,
    selectedAnalysisId: null,
    
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
    cacheHits: 0,
    cacheMisses: 0
  });

  /**
   * Update state with error handling
   */
  const updateState = useCallback((updates: Partial<IntelligenceState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle API errors with retry logic
   */
  const handleError = useCallback(async (error: APIError, operation: () => Promise<any>, retryCount = 0) => {
    console.error('Intelligence operation error:', error);
    
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
    const cacheKey = 'intelligence-engines';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ engines: cachedData });
      return;
    }

    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.getIntelligenceEngines({
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

  const getEngine = useCallback(async (engineId: string): Promise<IntelligenceEngine | null> => {
    const cacheKey = `intelligence-engine-${engineId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) return cachedData;

    try {
      const response = await intelligenceAPIService.getIntelligenceEngine(engineId, {
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

  const createEngine = useCallback(async (engine: Partial<IntelligenceEngine>): Promise<IntelligenceEngine | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.createIntelligenceEngine(engine);
      
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

  const updateEngine = useCallback(async (engineId: string, updates: Partial<IntelligenceEngine>): Promise<IntelligenceEngine | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.updateIntelligenceEngine(engineId, updates);
      
      if (response.success) {
        updateState(prev => ({
          engines: prev.engines.map(engine => 
            engine.id === engineId ? { ...engine, ...response.data } : engine
          ),
          loading: false
        }));
        
        // Clear cache for this engine
        cacheRef.current.delete(`intelligence-engine-${engineId}`);
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
      const response = await intelligenceAPIService.deleteIntelligenceEngine(engineId);
      
      if (response.success) {
        updateState(prev => ({
          engines: prev.engines.filter(engine => engine.id !== engineId),
          loading: false
        }));
        
        // Clear cache for this engine
        cacheRef.current.delete(`intelligence-engine-${engineId}`);
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteEngine(engineId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== INTELLIGENCE ANALYSIS ====================

  const startAnalysis = useCallback(async (request: any): Promise<IntelligenceAnalysis | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.startIntelligenceAnalysis(request);
      
      if (response.success) {
        updateState(prev => ({
          analyses: [...prev.analyses, response.data],
          currentAnalysis: response.data,
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => startAnalysis(request));
    }
    
    return null;
  }, [updateState, handleError]);

  const getAnalysis = useCallback(async (analysisId: string): Promise<IntelligenceAnalysis | null> => {
    const cacheKey = `intelligence-analysis-${analysisId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) return cachedData;

    try {
      const response = await intelligenceAPIService.getAnalysisResults(analysisId);
      
      if (response.success) {
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getAnalysis(analysisId));
    }
    
    return null;
  }, [getCachedData, setCachedData, handleError]);

  const stopAnalysis = useCallback(async (analysisId: string): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.stopIntelligenceAnalysis(analysisId);
      
      if (response.success) {
        updateState(prev => ({
          analyses: prev.analyses.map(analysis => 
            analysis.id === analysisId ? { ...analysis, status: 'stopped' } : analysis
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => stopAnalysis(analysisId));
    }
    
    return false;
  }, [updateState, handleError]);

  const getAnalysisResults = useCallback(async (analysisId: string): Promise<any> => {
    try {
      const response = await intelligenceAPIService.getAnalysisResults(analysisId);
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getAnalysisResults(analysisId));
    }
    
    return null;
  }, [handleError]);

  // ==================== PATTERN RECOGNITION ====================

  const recognizePatterns = useCallback(async (data: any, options?: any): Promise<PatternRecognition[]> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.recognizePatterns({ data, options });
      
      if (response.success) {
        updateState(prev => ({
          patterns: [...prev.patterns, ...response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => recognizePatterns(data, options));
    }
    
    return [];
  }, [updateState, handleError]);

  const getPatternInsights = useCallback(async (patternId: string): Promise<IntelligenceInsight[]> => {
    try {
      const response = await intelligenceAPIService.getPatternInsights(patternId);
      
      if (response.success) {
        updateState(prev => ({
          insights: [...prev.insights, ...response.data]
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getPatternInsights(patternId));
    }
    
    return [];
  }, [updateState, handleError]);

  const validatePatterns = useCallback(async (patterns: string[]): Promise<any> => {
    try {
      const response = await intelligenceAPIService.validatePatterns({ patterns });
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => validatePatterns(patterns));
    }
    
    return null;
  }, [handleError]);

  // ==================== PREDICTIVE ANALYTICS ====================

  const generatePredictions = useCallback(async (data: any, options?: any): Promise<PredictiveAnalytics | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.generatePredictions({ data, options });
      
      if (response.success) {
        updateState(prev => ({
          predictions: [...prev.predictions, response.data],
          activePredictions: [...prev.activePredictions, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => generatePredictions(data, options));
    }
    
    return null;
  }, [updateState, handleError]);

  const getPredictionAccuracy = useCallback(async (predictionId: string): Promise<number> => {
    try {
      const response = await intelligenceAPIService.getPredictionAccuracy(predictionId);
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data.accuracy;
      }
    } catch (error) {
      await handleError(error as APIError, () => getPredictionAccuracy(predictionId));
    }
    
    return 0;
  }, [handleError]);

  const updatePredictionModel = useCallback(async (modelId: string, data: any): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.updatePredictionModel(modelId, data);
      
      if (response.success) {
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => updatePredictionModel(modelId, data));
    }
    
    return false;
  }, [handleError]);

  // ==================== ANOMALY DETECTION ====================

  const detectAnomalies = useCallback(async (data: any, options?: any): Promise<AnomalyDetection[]> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.detectAnomalies({ data, options });
      
      if (response.success) {
        updateState(prev => ({
          anomalies: [...prev.anomalies, ...response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => detectAnomalies(data, options));
    }
    
    return [];
  }, [updateState, handleError]);

  const investigateAnomaly = useCallback(async (anomalyId: string): Promise<IntelligenceInsight | null> => {
    try {
      const response = await intelligenceAPIService.investigateAnomaly(anomalyId);
      
      if (response.success) {
        updateState(prev => ({
          insights: [...prev.insights, response.data]
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => investigateAnomaly(anomalyId));
    }
    
    return null;
  }, [updateState, handleError]);

  const resolveAnomaly = useCallback(async (anomalyId: string, resolution: any): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.resolveAnomaly(anomalyId, resolution);
      
      if (response.success) {
        updateState(prev => ({
          anomalies: prev.anomalies.map(anomaly => 
            anomaly.id === anomalyId ? { ...anomaly, status: 'resolved', resolution } : anomaly
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => resolveAnomaly(anomalyId, resolution));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== THREAT INTELLIGENCE ====================

  const analyzeThreat = useCallback(async (data: any, options?: any): Promise<ThreatIntelligence | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.analyzeThreat({ data, options });
      
      if (response.success) {
        updateState(prev => ({
          threats: [...prev.threats, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => analyzeThreat(data, options));
    }
    
    return null;
  }, [updateState, handleError]);

  const getThreatContext = useCallback(async (threatId: string): Promise<ContextualIntelligence | null> => {
    try {
      const response = await intelligenceAPIService.getThreatContext(threatId);
      
      if (response.success) {
        updateState(prev => ({
          contextual: [...prev.contextual, response.data]
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getThreatContext(threatId));
    }
    
    return null;
  }, [updateState, handleError]);

  const mitigateThreat = useCallback(async (threatId: string, mitigation: any): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.mitigateThreat(threatId, mitigation);
      
      if (response.success) {
        updateState(prev => ({
          threats: prev.threats.map(threat => 
            threat.id === threatId ? { ...threat, status: 'mitigated', mitigation } : threat
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => mitigateThreat(threatId, mitigation));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== AI RECOMMENDATIONS ====================

  const getRecommendations = useCallback(async (context: any): Promise<AIRecommendation[]> => {
    try {
      const response = await intelligenceAPIService.getAIRecommendations(context);
      
      if (response.success) {
        updateState(prev => ({
          aiRecommendations: [...prev.aiRecommendations, ...response.data]
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getRecommendations(context));
    }
    
    return [];
  }, [updateState, handleError]);

  const applyRecommendation = useCallback(async (recommendationId: string): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.applyRecommendation(recommendationId);
      
      if (response.success) {
        updateState(prev => ({
          aiRecommendations: prev.aiRecommendations.map(rec => 
            rec.id === recommendationId ? { ...rec, status: 'applied' } : rec
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => applyRecommendation(recommendationId));
    }
    
    return false;
  }, [updateState, handleError]);

  const feedbackRecommendation = useCallback(async (recommendationId: string, feedback: any): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.feedbackRecommendation(recommendationId, feedback);
      
      if (response.success) {
        updateState(prev => ({
          aiRecommendations: prev.aiRecommendations.map(rec => 
            rec.id === recommendationId ? { ...rec, feedback } : rec
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => feedbackRecommendation(recommendationId, feedback));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== INTELLIGENCE WORKFLOWS ====================

  const createWorkflow = useCallback(async (workflow: Partial<IntelligenceWorkflow>): Promise<IntelligenceWorkflow | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.createIntelligenceWorkflow(workflow);
      
      if (response.success) {
        updateState(prev => ({
          activeWorkflows: [...prev.activeWorkflows, response.data],
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

  const executeWorkflow = useCallback(async (workflowId: string, data: any): Promise<any> => {
    try {
      const response = await intelligenceAPIService.executeIntelligenceWorkflow(workflowId, data);
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => executeWorkflow(workflowId, data));
    }
    
    return null;
  }, [handleError]);

  const monitorWorkflow = useCallback(async (workflowId: string): Promise<IntelligenceMonitoring | null> => {
    try {
      const response = await intelligenceAPIService.monitorIntelligenceWorkflow(workflowId);
      
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

  // ==================== OPTIMIZATION ====================

  const optimizeIntelligence = useCallback(async (request: any): Promise<IntelligenceOptimization | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.optimizeIntelligence(request);
      
      if (response.success) {
        updateState(prev => ({
          runningOptimizations: [...prev.runningOptimizations, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => optimizeIntelligence(request));
    }
    
    return null;
  }, [updateState, handleError]);

  const applyOptimization = useCallback(async (optimizationId: string): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.applyOptimization(optimizationId);
      
      if (response.success) {
        updateState(prev => ({
          runningOptimizations: prev.runningOptimizations.map(opt => 
            opt.id === optimizationId ? { ...opt, status: 'applied' } : opt
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => applyOptimization(optimizationId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== METRICS AND MONITORING ====================

  const getMetrics = useCallback(async (): Promise<IntelligenceMetrics | null> => {
    try {
      const response = await intelligenceAPIService.getIntelligenceMetrics();
      
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

  const getMonitoring = useCallback(async (): Promise<IntelligenceMonitoring | null> => {
    try {
      const response = await intelligenceAPIService.getIntelligenceMonitoring();
      
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

  const generateReport = useCallback(async (options: any): Promise<IntelligenceReport | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.generateIntelligenceReport(options);
      
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

  // ==================== ML MODEL MANAGEMENT ====================

  const loadMLModels = useCallback(async () => {
    const cacheKey = 'ml-models';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ mlModels: cachedData });
      return;
    }

    try {
      const response = await intelligenceAPIService.getMLModels();
      
      if (response.success) {
        updateState({ mlModels: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadMLModels);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const trainModel = useCallback(async (modelConfig: any): Promise<MLModel | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await intelligenceAPIService.trainMLModel(modelConfig);
      
      if (response.success) {
        updateState(prev => ({
          mlModels: [...prev.mlModels, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => trainModel(modelConfig));
    }
    
    return null;
  }, [updateState, handleError]);

  const deployModel = useCallback(async (modelId: string): Promise<boolean> => {
    try {
      const response = await intelligenceAPIService.deployMLModel(modelId);
      
      if (response.success) {
        updateState(prev => ({
          mlModels: prev.mlModels.map(model => 
            model.id === modelId ? { ...model, status: 'deployed' } : model
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deployModel(modelId));
    }
    
    return false;
  }, [updateState, handleError]);

  const evaluateModel = useCallback(async (modelId: string, testData: any): Promise<any> => {
    try {
      const response = await intelligenceAPIService.evaluateMLModel(modelId, testData);
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => evaluateModel(modelId, testData));
    }
    
    return null;
  }, [handleError]);

  // ==================== UTILITY OPERATIONS ====================

  const refreshData = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      await Promise.all([
        loadEngines(),
        getMetrics(),
        getMonitoring(),
        loadMLModels()
      ]);
      
      updateState({ 
        loading: false, 
        lastUpdate: new Date(),
        updateCount: state.updateCount + 1
      });
    } catch (error) {
      await handleError(error as APIError, refreshData);
    }
  }, [loadEngines, getMetrics, getMonitoring, loadMLModels, state.updateCount, updateState, handleError]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    metricsRef.current.cacheHits = 0;
    metricsRef.current.cacheMisses = 0;
  }, []);

  const exportData = useCallback(async (format: 'json' | 'csv' | 'excel'): Promise<Blob | null> => {
    try {
      const response = await intelligenceAPIService.exportIntelligenceData({ format });
      
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
      analyses: [],
      insights: [],
      patterns: [],
      predictions: [],
      anomalies: [],
      threats: [],
      contextual: [],
      currentAnalysis: null,
      currentInsight: null,
      activeWorkflows: [],
      runningOptimizations: [],
      mlModels: [],
      aiRecommendations: [],
      activePredictions: [],
      metrics: null,
      monitoring: null,
      performance: null,
      loading: false,
      error: null,
      selectedEngineId: null,
      selectedAnalysisId: null,
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
      cacheHits: 0,
      cacheMisses: 0
    };
  }, [clearCache]);

  // ==================== EFFECTS ====================

  // Initialize real-time connection
  useEffect(() => {
    if (hookConfig.enableRealTime) {
      const unsubscribe = intelligenceAPIService.subscribe('intelligence_updated', (data) => {
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
  const operations: IntelligenceOperations = {
    // Engine Management
    loadEngines,
    getEngine,
    createEngine,
    updateEngine,
    deleteEngine,
    
    // Intelligence Analysis
    startAnalysis,
    getAnalysis,
    stopAnalysis,
    getAnalysisResults,
    
    // Pattern Recognition
    recognizePatterns,
    getPatternInsights,
    validatePatterns,
    
    // Predictive Analytics
    generatePredictions,
    getPredictionAccuracy,
    updatePredictionModel,
    
    // Anomaly Detection
    detectAnomalies,
    investigateAnomaly,
    resolveAnomaly,
    
    // Threat Intelligence
    analyzeThreat,
    getThreatContext,
    mitigateThreat,
    
    // AI Recommendations
    getRecommendations,
    applyRecommendation,
    feedbackRecommendation,
    
    // Intelligence Workflows
    createWorkflow,
    executeWorkflow,
    monitorWorkflow,
    
    // Optimization
    optimizeIntelligence,
    applyOptimization,
    
    // Metrics and Monitoring
    getMetrics,
    getMonitoring,
    generateReport,
    
    // ML Model Management
    loadMLModels,
    trainModel,
    deployModel,
    evaluateModel,
    
    // Utility Operations
    refreshData,
    clearCache,
    exportData,
    resetState
  };

  return [state, operations];
};

export default useIntelligence;