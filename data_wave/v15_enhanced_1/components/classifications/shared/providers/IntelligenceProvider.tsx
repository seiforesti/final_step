"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';

// Types and Interfaces
export type ModelStatus = 'idle' | 'loading' | 'training' | 'ready' | 'error' | 'deploying' | 'deployed';
export type InferenceStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ModelType = 'classification' | 'regression' | 'clustering' | 'nlp' | 'computer_vision' | 'anomaly_detection';
export type TrainingStatus = 'queued' | 'preparing' | 'training' | 'validating' | 'completed' | 'failed' | 'stopped';

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  loss?: number;
  mse?: number;
  mae?: number;
  r2Score?: number;
  confusionMatrix?: number[][];
  classificationReport?: Record<string, any>;
  featureImportance?: Array<{
    feature: string;
    importance: number;
  }>;
}

export interface TrainingProgress {
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  trainingLoss: number;
  validationLoss: number;
  trainingAccuracy?: number;
  validationAccuracy?: number;
  estimatedTimeRemaining: number;
  elapsedTime: number;
  learningRate: number;
  batchSize: number;
}

export interface ModelConfiguration {
  id: string;
  name: string;
  type: ModelType;
  algorithm: string;
  hyperparameters: Record<string, any>;
  features: string[];
  targetColumn?: string;
  validationSplit: number;
  crossValidationFolds?: number;
  earlyStoppingPatience?: number;
  maxTrainingTime?: number;
  autoHyperparameterTuning: boolean;
  preprocessing?: {
    scaleFeatures: boolean;
    handleMissingValues: 'drop' | 'mean' | 'median' | 'mode' | 'forward_fill';
    encodeCategorical: 'onehot' | 'label' | 'target';
    featureSelection: boolean;
    dimensionalityReduction?: 'pca' | 'tsne' | 'umap';
  };
}

export interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: TrainingStatus;
  progress: TrainingProgress;
  startTime: string;
  endTime?: string;
  datasetId: string;
  datasetSize: number;
  configuration: ModelConfiguration;
  metrics?: ModelMetrics;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    data?: any;
  }>;
  artifacts: Array<{
    id: string;
    name: string;
    type: 'model' | 'weights' | 'config' | 'metrics' | 'plot';
    url: string;
    size: number;
  }>;
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage?: number;
    diskUsage: number;
  };
}

export interface InferenceRequest {
  id: string;
  modelId: string;
  modelVersion: string;
  data: any;
  batchSize?: number;
  includeExplanations: boolean;
  confidenceThreshold?: number;
  metadata?: Record<string, any>;
}

export interface InferenceResult {
  id: string;
  requestId: string;
  modelId: string;
  predictions: Array<{
    input: any;
    prediction: any;
    confidence: number;
    probabilities?: number[];
    explanation?: {
      featureImportance: Array<{
        feature: string;
        importance: number;
      }>;
      shap?: any;
      lime?: any;
    };
  }>;
  metadata: {
    inferenceTime: number;
    modelVersion: string;
    timestamp: string;
    batchSize: number;
  };
}

export interface ModelDeployment {
  id: string;
  modelId: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  endpoint: string;
  status: 'deploying' | 'active' | 'inactive' | 'failed';
  replicas: number;
  autoScaling: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCpuUtilization: number;
    targetMemoryUtilization: number;
  };
  healthCheck: {
    enabled: boolean;
    endpoint: string;
    interval: number;
    timeout: number;
    retries: number;
  };
  monitoring: {
    enabled: boolean;
    metricsEndpoint: string;
    alerting: boolean;
  };
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  id: string;
  type: 'model_performance' | 'data_drift' | 'anomaly_detection' | 'optimization_suggestion' | 'prediction_explanation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: string;
  modelId?: string;
  data: any;
  recommendations: Array<{
    action: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
  dismissed: boolean;
}

export interface IntelligenceState {
  // Models
  models: Record<string, ModelConfiguration>;
  modelStatuses: Record<string, ModelStatus>;
  
  // Training
  trainingJobs: Record<string, TrainingJob>;
  activeTrainingJobs: string[];
  
  // Inference
  inferenceRequests: Record<string, InferenceRequest>;
  inferenceResults: Record<string, InferenceResult>;
  activeInferences: string[];
  
  // Deployments
  deployments: Record<string, ModelDeployment>;
  
  // Insights
  insights: AIInsight[];
  
  // System State
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Real-time connections
  webSocketConnected: boolean;
  
  // Performance metrics
  systemMetrics: {
    totalModels: number;
    activeTrainingJobs: number;
    totalInferences: number;
    averageInferenceTime: number;
    systemLoad: number;
    availableResources: {
      cpu: number;
      memory: number;
      gpu?: number;
    };
  };
}

export type IntelligenceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_WEBSOCKET_CONNECTED'; payload: boolean }
  | { type: 'SET_MODELS'; payload: Record<string, ModelConfiguration> }
  | { type: 'ADD_MODEL'; payload: ModelConfiguration }
  | { type: 'UPDATE_MODEL'; payload: { id: string; updates: Partial<ModelConfiguration> } }
  | { type: 'DELETE_MODEL'; payload: string }
  | { type: 'SET_MODEL_STATUS'; payload: { id: string; status: ModelStatus } }
  | { type: 'SET_TRAINING_JOBS'; payload: Record<string, TrainingJob> }
  | { type: 'ADD_TRAINING_JOB'; payload: TrainingJob }
  | { type: 'UPDATE_TRAINING_JOB'; payload: { id: string; updates: Partial<TrainingJob> } }
  | { type: 'REMOVE_TRAINING_JOB'; payload: string }
  | { type: 'SET_INFERENCE_REQUESTS'; payload: Record<string, InferenceRequest> }
  | { type: 'ADD_INFERENCE_REQUEST'; payload: InferenceRequest }
  | { type: 'UPDATE_INFERENCE_REQUEST'; payload: { id: string; updates: Partial<InferenceRequest> } }
  | { type: 'REMOVE_INFERENCE_REQUEST'; payload: string }
  | { type: 'SET_INFERENCE_RESULTS'; payload: Record<string, InferenceResult> }
  | { type: 'ADD_INFERENCE_RESULT'; payload: InferenceResult }
  | { type: 'SET_DEPLOYMENTS'; payload: Record<string, ModelDeployment> }
  | { type: 'ADD_DEPLOYMENT'; payload: ModelDeployment }
  | { type: 'UPDATE_DEPLOYMENT'; payload: { id: string; updates: Partial<ModelDeployment> } }
  | { type: 'REMOVE_DEPLOYMENT'; payload: string }
  | { type: 'SET_INSIGHTS'; payload: AIInsight[] }
  | { type: 'ADD_INSIGHT'; payload: AIInsight }
  | { type: 'UPDATE_INSIGHT'; payload: { id: string; updates: Partial<AIInsight> } }
  | { type: 'REMOVE_INSIGHT'; payload: string }
  | { type: 'UPDATE_SYSTEM_METRICS'; payload: Partial<IntelligenceState['systemMetrics']> };

export interface IntelligenceContextValue {
  state: IntelligenceState;
  actions: {
    // Initialization
    initialize: () => Promise<void>;
    
    // Model Management
    loadModels: () => Promise<void>;
    createModel: (config: Omit<ModelConfiguration, 'id'>) => Promise<ModelConfiguration>;
    updateModel: (id: string, updates: Partial<ModelConfiguration>) => Promise<ModelConfiguration>;
    deleteModel: (id: string) => Promise<void>;
    
    // Training Management
    startTraining: (modelId: string, datasetId: string, config?: Partial<ModelConfiguration>) => Promise<TrainingJob>;
    stopTraining: (jobId: string) => Promise<void>;
    getTrainingLogs: (jobId: string) => Promise<TrainingJob['logs']>;
    downloadTrainingArtifacts: (jobId: string, artifactId: string) => Promise<void>;
    
    // Inference Management
    runInference: (request: Omit<InferenceRequest, 'id'>) => Promise<InferenceResult>;
    batchInference: (requests: Array<Omit<InferenceRequest, 'id'>>) => Promise<InferenceResult[]>;
    cancelInference: (requestId: string) => Promise<void>;
    
    // Deployment Management
    deployModel: (modelId: string, environment: ModelDeployment['environment'], config?: Partial<ModelDeployment>) => Promise<ModelDeployment>;
    updateDeployment: (deploymentId: string, updates: Partial<ModelDeployment>) => Promise<ModelDeployment>;
    scaleDeployment: (deploymentId: string, replicas: number) => Promise<void>;
    undeployModel: (deploymentId: string) => Promise<void>;
    
    // Insights Management
    generateInsights: (modelId?: string) => Promise<AIInsight[]>;
    dismissInsight: (insightId: string) => Promise<void>;
    
    // Model Operations
    validateModel: (modelId: string, testDatasetId: string) => Promise<ModelMetrics>;
    explainPrediction: (modelId: string, input: any) => Promise<any>;
    compareModels: (modelIds: string[]) => Promise<any>;
    
    // AutoML Operations
    autoML: (datasetId: string, targetColumn: string, problemType: ModelType) => Promise<TrainingJob>;
    hyperparameterTuning: (modelId: string, searchSpace: Record<string, any>) => Promise<TrainingJob>;
    
    // Monitoring and Observability
    getModelMetrics: (modelId: string, timeRange?: string) => Promise<any>;
    getSystemHealth: () => Promise<any>;
    
    // Utilities
    exportModel: (modelId: string, format: 'onnx' | 'tensorflow' | 'pytorch' | 'pickle') => Promise<Blob>;
    importModel: (file: File, metadata: Partial<ModelConfiguration>) => Promise<ModelConfiguration>;
  };
}

// Initial State
const initialState: IntelligenceState = {
  models: {},
  modelStatuses: {},
  trainingJobs: {},
  activeTrainingJobs: [],
  inferenceRequests: {},
  inferenceResults: {},
  activeInferences: [],
  deployments: {},
  insights: [],
  loading: false,
  error: null,
  initialized: false,
  webSocketConnected: false,
  systemMetrics: {
    totalModels: 0,
    activeTrainingJobs: 0,
    totalInferences: 0,
    averageInferenceTime: 0,
    systemLoad: 0,
    availableResources: {
      cpu: 0,
      memory: 0
    }
  }
};

// Reducer
function intelligenceReducer(state: IntelligenceState, action: IntelligenceAction): IntelligenceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    
    case 'SET_WEBSOCKET_CONNECTED':
      return { ...state, webSocketConnected: action.payload };
    
    case 'SET_MODELS':
      return { 
        ...state, 
        models: action.payload,
        systemMetrics: {
          ...state.systemMetrics,
          totalModels: Object.keys(action.payload).length
        }
      };
    
    case 'ADD_MODEL':
      return { 
        ...state, 
        models: { ...state.models, [action.payload.id]: action.payload },
        systemMetrics: {
          ...state.systemMetrics,
          totalModels: state.systemMetrics.totalModels + 1
        }
      };
    
    case 'UPDATE_MODEL':
      return {
        ...state,
        models: {
          ...state.models,
          [action.payload.id]: { ...state.models[action.payload.id], ...action.payload.updates }
        }
      };
    
    case 'DELETE_MODEL':
      const { [action.payload]: deleted, ...remainingModels } = state.models;
      return { 
        ...state, 
        models: remainingModels,
        systemMetrics: {
          ...state.systemMetrics,
          totalModels: state.systemMetrics.totalModels - 1
        }
      };
    
    case 'SET_MODEL_STATUS':
      return {
        ...state,
        modelStatuses: { ...state.modelStatuses, [action.payload.id]: action.payload.status }
      };
    
    case 'SET_TRAINING_JOBS':
      const activeJobs = Object.values(action.payload).filter(job => 
        job.status === 'training' || job.status === 'preparing'
      ).map(job => job.id);
      
      return { 
        ...state, 
        trainingJobs: action.payload,
        activeTrainingJobs: activeJobs,
        systemMetrics: {
          ...state.systemMetrics,
          activeTrainingJobs: activeJobs.length
        }
      };
    
    case 'ADD_TRAINING_JOB':
      const newActiveJobs = action.payload.status === 'training' || action.payload.status === 'preparing' ?
        [...state.activeTrainingJobs, action.payload.id] : state.activeTrainingJobs;
      
      return { 
        ...state, 
        trainingJobs: { ...state.trainingJobs, [action.payload.id]: action.payload },
        activeTrainingJobs: newActiveJobs,
        systemMetrics: {
          ...state.systemMetrics,
          activeTrainingJobs: newActiveJobs.length
        }
      };
    
    case 'UPDATE_TRAINING_JOB':
      const updatedJob = { ...state.trainingJobs[action.payload.id], ...action.payload.updates };
      const isActive = updatedJob.status === 'training' || updatedJob.status === 'preparing';
      const wasActive = state.activeTrainingJobs.includes(action.payload.id);
      
      let updatedActiveJobs = [...state.activeTrainingJobs];
      if (isActive && !wasActive) {
        updatedActiveJobs.push(action.payload.id);
      } else if (!isActive && wasActive) {
        updatedActiveJobs = updatedActiveJobs.filter(id => id !== action.payload.id);
      }
      
      return {
        ...state,
        trainingJobs: { ...state.trainingJobs, [action.payload.id]: updatedJob },
        activeTrainingJobs: updatedActiveJobs,
        systemMetrics: {
          ...state.systemMetrics,
          activeTrainingJobs: updatedActiveJobs.length
        }
      };
    
    case 'REMOVE_TRAINING_JOB':
      const { [action.payload]: removedJob, ...remainingJobs } = state.trainingJobs;
      return { 
        ...state, 
        trainingJobs: remainingJobs,
        activeTrainingJobs: state.activeTrainingJobs.filter(id => id !== action.payload),
        systemMetrics: {
          ...state.systemMetrics,
          activeTrainingJobs: state.activeTrainingJobs.filter(id => id !== action.payload).length
        }
      };
    
    case 'SET_INFERENCE_REQUESTS':
      return { ...state, inferenceRequests: action.payload };
    
    case 'ADD_INFERENCE_REQUEST':
      return { 
        ...state, 
        inferenceRequests: { ...state.inferenceRequests, [action.payload.id]: action.payload },
        activeInferences: [...state.activeInferences, action.payload.id]
      };
    
    case 'UPDATE_INFERENCE_REQUEST':
      return {
        ...state,
        inferenceRequests: {
          ...state.inferenceRequests,
          [action.payload.id]: { ...state.inferenceRequests[action.payload.id], ...action.payload.updates }
        }
      };
    
    case 'REMOVE_INFERENCE_REQUEST':
      const { [action.payload]: removedRequest, ...remainingRequests } = state.inferenceRequests;
      return { 
        ...state, 
        inferenceRequests: remainingRequests,
        activeInferences: state.activeInferences.filter(id => id !== action.payload)
      };
    
    case 'SET_INFERENCE_RESULTS':
      return { 
        ...state, 
        inferenceResults: action.payload,
        systemMetrics: {
          ...state.systemMetrics,
          totalInferences: Object.keys(action.payload).length
        }
      };
    
    case 'ADD_INFERENCE_RESULT':
      return { 
        ...state, 
        inferenceResults: { ...state.inferenceResults, [action.payload.id]: action.payload },
        activeInferences: state.activeInferences.filter(id => id !== action.payload.requestId),
        systemMetrics: {
          ...state.systemMetrics,
          totalInferences: state.systemMetrics.totalInferences + 1
        }
      };
    
    case 'SET_DEPLOYMENTS':
      return { ...state, deployments: action.payload };
    
    case 'ADD_DEPLOYMENT':
      return { ...state, deployments: { ...state.deployments, [action.payload.id]: action.payload } };
    
    case 'UPDATE_DEPLOYMENT':
      return {
        ...state,
        deployments: {
          ...state.deployments,
          [action.payload.id]: { ...state.deployments[action.payload.id], ...action.payload.updates }
        }
      };
    
    case 'REMOVE_DEPLOYMENT':
      const { [action.payload]: removedDeployment, ...remainingDeployments } = state.deployments;
      return { ...state, deployments: remainingDeployments };
    
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload };
    
    case 'ADD_INSIGHT':
      return { ...state, insights: [action.payload, ...state.insights] };
    
    case 'UPDATE_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(insight =>
          insight.id === action.payload.id ? { ...insight, ...action.payload.updates } : insight
        )
      };
    
    case 'REMOVE_INSIGHT':
      return { ...state, insights: state.insights.filter(insight => insight.id !== action.payload) };
    
    case 'UPDATE_SYSTEM_METRICS':
      return {
        ...state,
        systemMetrics: { ...state.systemMetrics, ...action.payload }
      };
    
    default:
      return state;
  }
}

// Context
const IntelligenceContext = createContext<IntelligenceContextValue | undefined>(undefined);

// Mock API functions (replace with actual API calls)
const mockApiCall = async <T>(data: T, delay = 1000): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return data;
};

// Provider Component
export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(intelligenceReducer, initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the intelligence system with advanced enterprise features
  const initialize = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Advanced parallel initialization with intelligent error handling
      const initializationTasks = [
        loadModels(),
        loadTrainingJobs(),
        loadDeployments(),
        loadInsights(),
        initializeIntelligenceProcessor(),
        initializePerformanceOptimizer(),
        validateSystemHealth(),
        loadSystemConfiguration()
      ];

      const results = await Promise.allSettled(initializationTasks);
      
      // Process results and handle partial failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some initialization tasks failed:', failures);
        toast.warning(`System initialized with ${failures.length} warnings. Check system health.`);
      }

      // Connect to WebSocket for real-time updates
      await connectWebSocket();

      // Start advanced metrics collection with ML-powered optimization
      await startMetricsCollection();

      // Initialize predictive analytics
      await initializePredictiveAnalytics();

      // Setup intelligent caching
      await setupIntelligentCaching();

      dispatch({ type: 'SET_INITIALIZED', payload: true });
      toast.success('Advanced Intelligence System initialized successfully', {
        description: 'All enterprise features are now active'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize intelligence system';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Intelligence System Initialization Failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => initialize()
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ai/intelligence/stream/${Date.now()}`);
      
      wsRef.current.onopen = () => {
        dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: true });
        toast.success('Real-time connection established');
      };
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };
      
      wsRef.current.onclose = () => {
        dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: false });
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: false });
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'training_progress':
        dispatch({
          type: 'UPDATE_TRAINING_JOB',
          payload: { id: message.jobId, updates: { progress: message.progress } }
        });
        break;
      
      case 'training_completed':
        dispatch({
          type: 'UPDATE_TRAINING_JOB',
          payload: { 
            id: message.jobId, 
            updates: { 
              status: 'completed',
              endTime: new Date().toISOString(),
              metrics: message.metrics
            }
          }
        });
        toast.success(`Training job ${message.jobId} completed successfully`);
        break;
      
      case 'inference_result':
        dispatch({ type: 'ADD_INFERENCE_RESULT', payload: message.result });
        break;
      
      case 'new_insight':
        dispatch({ type: 'ADD_INSIGHT', payload: message.insight });
        toast.info(`New insight: ${message.insight.title}`);
        break;
      
      case 'system_metrics':
        dispatch({ type: 'UPDATE_SYSTEM_METRICS', payload: message.metrics });
        break;
    }
  }, []);

  // Advanced initialization functions
  const initializeIntelligenceProcessor = useCallback(async () => {
    try {
      // Initialize advanced AI/ML processing capabilities
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/agents/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: ['predictive_analytics', 'anomaly_detection', 'optimization'],
          performance_tier: 'enterprise'
        })
      });
    } catch (error) {
      console.warn('Intelligence processor initialization failed:', error);
    }
  }, []);

  const initializePerformanceOptimizer = useCallback(async () => {
    try {
      // Initialize performance optimization engine
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/performance/monitoring/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimization_level: 'aggressive',
          monitoring_enabled: true,
          auto_scaling: true
        })
      });
    } catch (error) {
      console.warn('Performance optimizer initialization failed:', error);
    }
  }, []);

  const validateSystemHealth = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/performance/system/health`);
      const health = await response.json();
      
      if (health.status !== 'healthy') {
        toast.warning('System Health Warning', {
          description: `System status: ${health.status}. Some features may be limited.`
        });
      }
      
      return health;
    } catch (error) {
      console.warn('System health validation failed:', error);
      return { status: 'unknown' };
    }
  }, []);

  const loadSystemConfiguration = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classifications/system/performance`);
      const config = await response.json();
      
      // Apply system configuration
      dispatch({ type: 'UPDATE_SYSTEM_METRICS', payload: { 
        systemConfig: config,
        configLoadedAt: new Date().toISOString()
      }});
      
      return config;
    } catch (error) {
      console.warn('System configuration loading failed:', error);
      return {};
    }
  }, []);

  const initializePredictiveAnalytics = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: ['trend_prediction', 'resource_forecasting', 'performance_prediction'],
          model_complexity: 'high'
        })
      });
    } catch (error) {
      console.warn('Predictive analytics initialization failed:', error);
    }
  }, []);

  const setupIntelligentCaching = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cache/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: 'intelligent',
          max_size: '1GB',
          ttl_optimization: true,
          predictive_preloading: true
        })
      });
    } catch (error) {
      console.warn('Intelligent caching setup failed:', error);
    }
  }, []);

  // Enhanced metrics collection with advanced analytics
  const startMetricsCollection = useCallback(async () => {
    metricsIntervalRef.current = setInterval(async () => {
      try {
        // Collect comprehensive system metrics
        const [systemHealth, performanceMetrics, resourceUtilization, businessMetrics] = await Promise.all([
          getSystemHealth(),
          getPerformanceMetrics(),
          getResourceUtilization(),
          getBusinessMetrics()
        ]);

        dispatch({ type: 'UPDATE_SYSTEM_METRICS', payload: {
          ...systemHealth,
          performance: performanceMetrics,
          resources: resourceUtilization,
          business: businessMetrics,
          timestamp: new Date().toISOString()
        }});

        // Trigger predictive analysis if metrics indicate potential issues
        if (performanceMetrics.cpu > 80 || performanceMetrics.memory > 85) {
          await triggerPredictiveOptimization();
        }

      } catch (error) {
        console.error('Failed to collect advanced metrics:', error);
      }
    }, 15000); // Collect metrics every 15 seconds for enterprise monitoring
  }, []);

  const getPerformanceMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classifications/system/performance`);
      return await response.json();
    } catch (error) {
      console.warn('Performance metrics collection failed:', error);
      return {};
    }
  }, []);

  const getResourceUtilization = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classifications/system/capacity`);
      return await response.json();
    } catch (error) {
      console.warn('Resource utilization collection failed:', error);
      return {};
    }
  }, []);

  const getBusinessMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classifications/system/compliance`);
      return await response.json();
    } catch (error) {
      console.warn('Business metrics collection failed:', error);
      return {};
    }
  }, []);

  const triggerPredictiveOptimization = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/intelligence/optimize-workload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'performance_threshold',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Predictive optimization trigger failed:', error);
    }
  }, []);

  // Model Management
  const loadModels = useCallback(async () => {
    try {
      const models = await mockApiCall<Record<string, ModelConfiguration>>({});
      dispatch({ type: 'SET_MODELS', payload: models });
    } catch (error) {
      throw new Error('Failed to load models');
    }
  }, []);

  const createModel = useCallback(async (config: Omit<ModelConfiguration, 'id'>): Promise<ModelConfiguration> => {
    const newModel: ModelConfiguration = {
      ...config,
      id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const result = await mockApiCall(newModel);
    dispatch({ type: 'ADD_MODEL', payload: result });
    toast.success(`Model "${result.name}" created successfully`);
    return result;
  }, []);

  const updateModel = useCallback(async (id: string, updates: Partial<ModelConfiguration>): Promise<ModelConfiguration> => {
    const updatedModel = { ...state.models[id], ...updates };
    const result = await mockApiCall(updatedModel);
    dispatch({ type: 'UPDATE_MODEL', payload: { id, updates } });
    toast.success(`Model "${result.name}" updated successfully`);
    return result;
  }, [state.models]);

  const deleteModel = useCallback(async (id: string): Promise<void> => {
    await mockApiCall(null);
    dispatch({ type: 'DELETE_MODEL', payload: id });
    toast.success('Model deleted successfully');
  }, []);

  // Training Management
  const loadTrainingJobs = useCallback(async () => {
    try {
      const jobs = await mockApiCall<Record<string, TrainingJob>>({});
      dispatch({ type: 'SET_TRAINING_JOBS', payload: jobs });
    } catch (error) {
      throw new Error('Failed to load training jobs');
    }
  }, []);

  const startTraining = useCallback(async (
    modelId: string, 
    datasetId: string, 
    config?: Partial<ModelConfiguration>
  ): Promise<TrainingJob> => {
    const model = state.models[modelId];
    if (!model) throw new Error('Model not found');

    const trainingJob: TrainingJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      modelName: model.name,
      status: 'queued',
      startTime: new Date().toISOString(),
      datasetId,
      datasetSize: 10000, // Mock value
      configuration: { ...model, ...config },
      progress: {
        currentEpoch: 0,
        totalEpochs: 100,
        currentStep: 0,
        totalSteps: 1000,
        trainingLoss: 0,
        validationLoss: 0,
        estimatedTimeRemaining: 3600000,
        elapsedTime: 0,
        learningRate: 0.001,
        batchSize: 32
      },
      logs: [],
      artifacts: [],
      resourceUsage: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0
      }
    };

    const result = await mockApiCall(trainingJob);
    dispatch({ type: 'ADD_TRAINING_JOB', payload: result });
    dispatch({ type: 'SET_MODEL_STATUS', payload: { id: modelId, status: 'training' } });
    toast.success(`Training started for model "${model.name}"`);
    return result;
  }, [state.models]);

  const stopTraining = useCallback(async (jobId: string): Promise<void> => {
    await mockApiCall(null);
    dispatch({ 
      type: 'UPDATE_TRAINING_JOB', 
      payload: { id: jobId, updates: { status: 'stopped', endTime: new Date().toISOString() } }
    });
    toast.success('Training job stopped');
  }, []);

  const getTrainingLogs = useCallback(async (jobId: string): Promise<TrainingJob['logs']> => {
    const logs = await mockApiCall<TrainingJob['logs']>([]);
    return logs;
  }, []);

  const downloadTrainingArtifacts = useCallback(async (jobId: string, artifactId: string): Promise<void> => {
    await mockApiCall(null);
    toast.success('Artifact download started');
  }, []);

  // Inference Management
  const runInference = useCallback(async (request: Omit<InferenceRequest, 'id'>): Promise<InferenceResult> => {
    const inferenceRequest: InferenceRequest = {
      ...request,
      id: `inference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    dispatch({ type: 'ADD_INFERENCE_REQUEST', payload: inferenceRequest });

    const result: InferenceResult = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: inferenceRequest.id,
      modelId: request.modelId,
      predictions: [{
        input: request.data,
        prediction: 'mock_prediction',
        confidence: 0.95,
        probabilities: [0.05, 0.95],
        explanation: {
          featureImportance: [
            { feature: 'feature1', importance: 0.3 },
            { feature: 'feature2', importance: 0.7 }
          ]
        }
      }],
      metadata: {
        inferenceTime: 150,
        modelVersion: request.modelVersion,
        timestamp: new Date().toISOString(),
        batchSize: 1
      }
    };

    const mockResult = await mockApiCall(result, 2000);
    dispatch({ type: 'ADD_INFERENCE_RESULT', payload: mockResult });
    toast.success('Inference completed successfully');
    return mockResult;
  }, []);

  const batchInference = useCallback(async (requests: Array<Omit<InferenceRequest, 'id'>>): Promise<InferenceResult[]> => {
    const results = await Promise.all(requests.map(request => runInference(request)));
    return results;
  }, [runInference]);

  const cancelInference = useCallback(async (requestId: string): Promise<void> => {
    await mockApiCall(null);
    dispatch({ type: 'REMOVE_INFERENCE_REQUEST', payload: requestId });
    toast.success('Inference cancelled');
  }, []);

  // Deployment Management
  const loadDeployments = useCallback(async () => {
    try {
      const deployments = await mockApiCall<Record<string, ModelDeployment>>({});
      dispatch({ type: 'SET_DEPLOYMENTS', payload: deployments });
    } catch (error) {
      throw new Error('Failed to load deployments');
    }
  }, []);

  const deployModel = useCallback(async (
    modelId: string, 
    environment: ModelDeployment['environment'],
    config?: Partial<ModelDeployment>
  ): Promise<ModelDeployment> => {
    const deployment: ModelDeployment = {
      id: `deployment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      version: '1.0.0',
      environment,
      endpoint: `https://api.example.com/models/${modelId}`,
      status: 'deploying',
      replicas: 1,
      autoScaling: {
        enabled: false,
        minReplicas: 1,
        maxReplicas: 10,
        targetCpuUtilization: 70,
        targetMemoryUtilization: 80
      },
      healthCheck: {
        enabled: true,
        endpoint: '/health',
        interval: 30,
        timeout: 10,
        retries: 3
      },
      monitoring: {
        enabled: true,
        metricsEndpoint: '/metrics',
        alerting: true
      },
      resources: {
        cpu: '500m',
        memory: '1Gi'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...config
    };

    const result = await mockApiCall(deployment);
    dispatch({ type: 'ADD_DEPLOYMENT', payload: result });
    dispatch({ type: 'SET_MODEL_STATUS', payload: { id: modelId, status: 'deploying' } });
    toast.success(`Model deployment started in ${environment} environment`);
    return result;
  }, []);

  const updateDeployment = useCallback(async (deploymentId: string, updates: Partial<ModelDeployment>): Promise<ModelDeployment> => {
    const updatedDeployment = { ...state.deployments[deploymentId], ...updates, updatedAt: new Date().toISOString() };
    const result = await mockApiCall(updatedDeployment);
    dispatch({ type: 'UPDATE_DEPLOYMENT', payload: { id: deploymentId, updates } });
    toast.success('Deployment updated successfully');
    return result;
  }, [state.deployments]);

  const scaleDeployment = useCallback(async (deploymentId: string, replicas: number): Promise<void> => {
    await mockApiCall(null);
    dispatch({ type: 'UPDATE_DEPLOYMENT', payload: { id: deploymentId, updates: { replicas } } });
    toast.success(`Deployment scaled to ${replicas} replicas`);
  }, []);

  const undeployModel = useCallback(async (deploymentId: string): Promise<void> => {
    await mockApiCall(null);
    dispatch({ type: 'REMOVE_DEPLOYMENT', payload: deploymentId });
    toast.success('Model undeployed successfully');
  }, []);

  // Insights Management
  const loadInsights = useCallback(async () => {
    try {
      const insights = await mockApiCall<AIInsight[]>([]);
      dispatch({ type: 'SET_INSIGHTS', payload: insights });
    } catch (error) {
      throw new Error('Failed to load insights');
    }
  }, []);

  const generateInsights = useCallback(async (modelId?: string): Promise<AIInsight[]> => {
    const insights = await mockApiCall<AIInsight[]>([]);
    dispatch({ type: 'SET_INSIGHTS', payload: insights });
    toast.success('Insights generated successfully');
    return insights;
  }, []);

  const dismissInsight = useCallback(async (insightId: string): Promise<void> => {
    await mockApiCall(null);
    dispatch({ type: 'UPDATE_INSIGHT', payload: { id: insightId, updates: { dismissed: true } } });
  }, []);

  // Additional operations (placeholder implementations)
  const validateModel = useCallback(async (modelId: string, testDatasetId: string): Promise<ModelMetrics> => {
    const metrics = await mockApiCall<ModelMetrics>({
      accuracy: 0.95,
      precision: 0.93,
      recall: 0.97,
      f1Score: 0.95,
      auc: 0.98
    });
    toast.success('Model validation completed');
    return metrics;
  }, []);

  const explainPrediction = useCallback(async (modelId: string, input: any): Promise<any> => {
    const explanation = await mockApiCall({
      featureImportance: [
        { feature: 'feature1', importance: 0.3 },
        { feature: 'feature2', importance: 0.7 }
      ]
    });
    return explanation;
  }, []);

  const compareModels = useCallback(async (modelIds: string[]): Promise<any> => {
    const comparison = await mockApiCall({
      models: modelIds,
      metrics: {}
    });
    return comparison;
  }, []);

  const autoML = useCallback(async (datasetId: string, targetColumn: string, problemType: ModelType): Promise<TrainingJob> => {
    const config: ModelConfiguration = {
      id: `automl_${Date.now()}`,
      name: `AutoML ${problemType}`,
      type: problemType,
      algorithm: 'auto',
      hyperparameters: {},
      features: [],
      targetColumn,
      validationSplit: 0.2,
      autoHyperparameterTuning: true
    };

    const model = await createModel(config);
    return startTraining(model.id, datasetId);
  }, [createModel, startTraining]);

  const hyperparameterTuning = useCallback(async (modelId: string, searchSpace: Record<string, any>): Promise<TrainingJob> => {
    const datasetId = 'mock_dataset'; // This should be provided or retrieved
    return startTraining(modelId, datasetId, { hyperparameters: searchSpace });
  }, [startTraining]);

  const getModelMetrics = useCallback(async (modelId: string, timeRange?: string): Promise<any> => {
    const metrics = await mockApiCall({
      modelId,
      timeRange,
      metrics: []
    });
    return metrics;
  }, []);

  const getSystemHealth = useCallback(async (): Promise<any> => {
    const health = await mockApiCall({
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      gpu: Math.random() * 100,
      activeTrainingJobs: state.activeTrainingJobs.length,
      totalInferences: Object.keys(state.inferenceResults).length
    });
    return health;
  }, [state.activeTrainingJobs, state.inferenceResults]);

  const exportModel = useCallback(async (modelId: string, format: 'onnx' | 'tensorflow' | 'pytorch' | 'pickle'): Promise<Blob> => {
    const blob = await mockApiCall(new Blob(['mock model data'], { type: 'application/octet-stream' }));
    toast.success(`Model exported in ${format} format`);
    return blob;
  }, []);

  const importModel = useCallback(async (file: File, metadata: Partial<ModelConfiguration>): Promise<ModelConfiguration> => {
    const config: Omit<ModelConfiguration, 'id'> = {
      name: metadata.name || file.name,
      type: metadata.type || 'classification',
      algorithm: metadata.algorithm || 'unknown',
      hyperparameters: metadata.hyperparameters || {},
      features: metadata.features || [],
      validationSplit: metadata.validationSplit || 0.2,
      autoHyperparameterTuning: metadata.autoHyperparameterTuning || false
    };

    const model = await createModel(config);
    toast.success(`Model imported: ${model.name}`);
    return model;
  }, [createModel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, []);

  // Context value
  const contextValue = useMemo<IntelligenceContextValue>(() => ({
    state,
    actions: {
      initialize,
      loadModels,
      createModel,
      updateModel,
      deleteModel,
      startTraining,
      stopTraining,
      getTrainingLogs,
      downloadTrainingArtifacts,
      runInference,
      batchInference,
      cancelInference,
      deployModel,
      updateDeployment,
      scaleDeployment,
      undeployModel,
      generateInsights,
      dismissInsight,
      validateModel,
      explainPrediction,
      compareModels,
      autoML,
      hyperparameterTuning,
      getModelMetrics,
      getSystemHealth,
      exportModel,
      importModel
    }
  }), [
    state,
    initialize,
    loadModels,
    createModel,
    updateModel,
    deleteModel,
    startTraining,
    stopTraining,
    getTrainingLogs,
    downloadTrainingArtifacts,
    runInference,
    batchInference,
    cancelInference,
    deployModel,
    updateDeployment,
    scaleDeployment,
    undeployModel,
    generateInsights,
    dismissInsight,
    validateModel,
    explainPrediction,
    compareModels,
    autoML,
    hyperparameterTuning,
    getModelMetrics,
    getSystemHealth,
    exportModel,
    importModel
  ]);

  return (
    <IntelligenceContext.Provider value={contextValue}>
      {children}
    </IntelligenceContext.Provider>
  );
};

// Custom hook to use the Intelligence context
export const useIntelligence = (): IntelligenceContextValue => {
  const context = useContext(IntelligenceContext);
  if (context === undefined) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
};

export default IntelligenceProvider;