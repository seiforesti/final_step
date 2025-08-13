import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

// Import APIs and utilities
import { classificationApi } from '../core/api/classificationApi';
import { websocketApi } from '../core/api/websocketApi';
import { defaultProcessor } from '../core/utils/intelligenceProcessor';
import { defaultOptimizer } from '../core/utils/performanceOptimizer';

// Advanced TypeScript interfaces
interface ClassificationContextState {
  // System State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data State
  frameworks: ClassificationFramework[];
  rules: ClassificationRule[];
  policies: ClassificationPolicy[];
  results: ClassificationResult[];
  auditLogs: ClassificationAuditLog[];
  
  // ML/AI State
  mlModels: MLModel[];
  aiModels: AIModel[];
  trainingJobs: TrainingJob[];
  predictions: Prediction[];
  
  // Real-time State
  realTimeUpdates: boolean;
  webSocketConnected: boolean;
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
  
  // UI State
  selectedFramework: ClassificationFramework | null;
  selectedRule: ClassificationRule | null;
  selectedModel: MLModel | AIModel | null;
  activeTab: string;
  sidebarCollapsed: boolean;
  
  // Workflow State
  currentWorkflow: WorkflowExecution | null;
  workflowHistory: WorkflowExecution[];
  
  // Cache State
  cache: Map<string, CacheEntry>;
  cacheStats: CacheStats;
}

interface ClassificationFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  rules: ClassificationRule[];
  policies: ClassificationPolicy[];
  metadata: Record<string, any>;
}

interface ClassificationRule {
  id: string;
  frameworkId: string;
  name: string;
  description: string;
  type: 'regex' | 'dictionary' | 'ml' | 'ai' | 'composite';
  pattern: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  confidence: number;
  isActive: boolean;
  priority: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface ClassificationPolicy {
  id: string;
  frameworkId: string;
  name: string;
  description: string;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface PolicyCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'gt' | 'lt';
  value: any;
}

interface PolicyAction {
  type: 'classify' | 'tag' | 'alert' | 'block';
  parameters: Record<string, any>;
}

interface ClassificationResult {
  id: string;
  sourceId: string;
  sourceType: 'table' | 'column' | 'file' | 'document';
  ruleId: string;
  classification: string;
  confidence: number;
  method: 'manual' | 'automated' | 'ml' | 'ai';
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  metadata: Record<string, any>;
}

interface ClassificationAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: Date;
  changes: AuditChange[];
  metadata: Record<string, any>;
}

interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn';
  status: 'training' | 'trained' | 'deployed' | 'failed';
  accuracy: number;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface AIModel {
  id: string;
  name: string;
  type: 'llm' | 'embedding' | 'reasoning';
  provider: 'openai' | 'anthropic' | 'local';
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface TrainingJob {
  id: string;
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  metrics: TrainingMetrics;
  logs: string[];
}

interface TrainingMetrics {
  loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface Prediction {
  id: string;
  modelId: string;
  input: any;
  output: any;
  confidence: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    api: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    cache: 'healthy' | 'warning' | 'critical';
    ml: 'healthy' | 'warning' | 'critical';
    ai: 'healthy' | 'warning' | 'critical';
  };
  lastChecked: Date;
}

interface PerformanceMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
}

interface WorkflowExecution {
  id: string;
  type: 'classification' | 'training' | 'inference' | 'audit';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  steps: WorkflowStep[];
  startedAt: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

interface CacheEntry {
  key: string;
  value: any;
  timestamp: Date;
  expiresAt: Date;
  accessCount: number;
}

interface CacheStats {
  entries: number;
  hitRate: number;
  size: number;
  evictions: number;
}

// Action types
type ClassificationAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: Partial<ClassificationContextState> }
  | { type: 'INITIALIZE_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FRAMEWORKS'; payload: ClassificationFramework[] }
  | { type: 'SET_RULES'; payload: ClassificationRule[] }
  | { type: 'SET_POLICIES'; payload: ClassificationPolicy[] }
  | { type: 'SET_RESULTS'; payload: ClassificationResult[] }
  | { type: 'SET_AUDIT_LOGS'; payload: ClassificationAuditLog[] }
  | { type: 'SET_ML_MODELS'; payload: MLModel[] }
  | { type: 'SET_AI_MODELS'; payload: AIModel[] }
  | { type: 'SET_TRAINING_JOBS'; payload: TrainingJob[] }
  | { type: 'SET_PREDICTIONS'; payload: Prediction[] }
  | { type: 'SET_REAL_TIME_UPDATES'; payload: boolean }
  | { type: 'SET_WEBSOCKET_CONNECTED'; payload: boolean }
  | { type: 'SET_SYSTEM_HEALTH'; payload: SystemHealth }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: PerformanceMetrics }
  | { type: 'SET_SELECTED_FRAMEWORK'; payload: ClassificationFramework | null }
  | { type: 'SET_SELECTED_RULE'; payload: ClassificationRule | null }
  | { type: 'SET_SELECTED_MODEL'; payload: MLModel | AIModel | null }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_CURRENT_WORKFLOW'; payload: WorkflowExecution | null }
  | { type: 'ADD_WORKFLOW_TO_HISTORY'; payload: WorkflowExecution }
  | { type: 'UPDATE_CACHE'; payload: { key: string; value: any } }
  | { type: 'SET_CACHE_STATS'; payload: CacheStats }
  | { type: 'REAL_TIME_UPDATE'; payload: any };

// Context interfaces
interface ClassificationContextValue {
  state: ClassificationContextState;
  actions: {
    // Initialization
    initialize: () => Promise<void>;
    
    // Data Management
    loadFrameworks: () => Promise<void>;
    loadRules: (frameworkId?: string) => Promise<void>;
    loadPolicies: (frameworkId?: string) => Promise<void>;
    loadResults: (filters?: any) => Promise<void>;
    loadAuditLogs: (filters?: any) => Promise<void>;
    
    // CRUD Operations
    createFramework: (data: Partial<ClassificationFramework>) => Promise<ClassificationFramework>;
    updateFramework: (id: string, data: Partial<ClassificationFramework>) => Promise<ClassificationFramework>;
    deleteFramework: (id: string) => Promise<void>;
    
    createRule: (data: Partial<ClassificationRule>) => Promise<ClassificationRule>;
    updateRule: (id: string, data: Partial<ClassificationRule>) => Promise<ClassificationRule>;
    deleteRule: (id: string) => Promise<void>;
    
    createPolicy: (data: Partial<ClassificationPolicy>) => Promise<ClassificationPolicy>;
    updatePolicy: (id: string, data: Partial<ClassificationPolicy>) => Promise<ClassificationPolicy>;
    deletePolicy: (id: string) => Promise<void>;
    
    // Classification Operations
    runClassification: (config: any) => Promise<WorkflowExecution>;
    bulkClassify: (items: any[], config: any) => Promise<WorkflowExecution>;
    approveResult: (resultId: string) => Promise<void>;
    rejectResult: (resultId: string, reason: string) => Promise<void>;
    
    // ML/AI Operations
    trainModel: (modelId: string, config: any) => Promise<TrainingJob>;
    deployModel: (modelId: string) => Promise<void>;
    runInference: (modelId: string, input: any) => Promise<Prediction>;
    
    // Real-time Operations
    enableRealTimeUpdates: () => void;
    disableRealTimeUpdates: () => void;
    
    // UI Operations
    selectFramework: (framework: ClassificationFramework | null) => void;
    selectRule: (rule: ClassificationRule | null) => void;
    selectModel: (model: MLModel | AIModel | null) => void;
    setActiveTab: (tab: string) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    
    // Workflow Operations
    startWorkflow: (type: string, config: any) => Promise<WorkflowExecution>;
    cancelWorkflow: (workflowId: string) => Promise<void>;
    
    // Cache Operations
    getCached: (key: string) => any;
    setCached: (key: string, value: any, ttl?: number) => void;
    clearCache: () => void;
    
    // Utility Operations
    exportData: (type: string, filters?: any) => Promise<Blob>;
    importData: (file: File) => Promise<void>;
    generateReport: (type: string, config: any) => Promise<Blob>;
  };
}

// Initial state
const initialState: ClassificationContextState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  
  frameworks: [],
  rules: [],
  policies: [],
  results: [],
  auditLogs: [],
  
  mlModels: [],
  aiModels: [],
  trainingJobs: [],
  predictions: [],
  
  realTimeUpdates: false,
  webSocketConnected: false,
  systemHealth: {
    overall: 'healthy',
    components: {
      api: 'healthy',
      database: 'healthy',
      cache: 'healthy',
      ml: 'healthy',
      ai: 'healthy'
    },
    lastChecked: new Date()
  },
  performanceMetrics: {
    requestsPerSecond: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    timestamp: new Date()
  },
  
  selectedFramework: null,
  selectedRule: null,
  selectedModel: null,
  activeTab: 'overview',
  sidebarCollapsed: false,
  
  currentWorkflow: null,
  workflowHistory: [],
  
  cache: new Map(),
  cacheStats: {
    entries: 0,
    hitRate: 0,
    size: 0,
    evictions: 0
  }
};

// Reducer
function classificationReducer(
  state: ClassificationContextState,
  action: ClassificationAction
): ClassificationContextState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return { ...state, isLoading: true, error: null };
    
    case 'INITIALIZE_SUCCESS':
      return { 
        ...state, 
        ...action.payload,
        isInitialized: true,
        isLoading: false,
        error: null 
      };
    
    case 'INITIALIZE_ERROR':
      return { 
        ...state, 
        isLoading: false, 
        error: action.payload,
        isInitialized: false 
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_FRAMEWORKS':
      return { ...state, frameworks: action.payload };
    
    case 'SET_RULES':
      return { ...state, rules: action.payload };
    
    case 'SET_POLICIES':
      return { ...state, policies: action.payload };
    
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    
    case 'SET_AUDIT_LOGS':
      return { ...state, auditLogs: action.payload };
    
    case 'SET_ML_MODELS':
      return { ...state, mlModels: action.payload };
    
    case 'SET_AI_MODELS':
      return { ...state, aiModels: action.payload };
    
    case 'SET_TRAINING_JOBS':
      return { ...state, trainingJobs: action.payload };
    
    case 'SET_PREDICTIONS':
      return { ...state, predictions: action.payload };
    
    case 'SET_REAL_TIME_UPDATES':
      return { ...state, realTimeUpdates: action.payload };
    
    case 'SET_WEBSOCKET_CONNECTED':
      return { ...state, webSocketConnected: action.payload };
    
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    
    case 'SET_PERFORMANCE_METRICS':
      return { ...state, performanceMetrics: action.payload };
    
    case 'SET_SELECTED_FRAMEWORK':
      return { ...state, selectedFramework: action.payload };
    
    case 'SET_SELECTED_RULE':
      return { ...state, selectedRule: action.payload };
    
    case 'SET_SELECTED_MODEL':
      return { ...state, selectedModel: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    
    case 'SET_CURRENT_WORKFLOW':
      return { ...state, currentWorkflow: action.payload };
    
    case 'ADD_WORKFLOW_TO_HISTORY':
      return { 
        ...state, 
        workflowHistory: [action.payload, ...state.workflowHistory.slice(0, 99)] 
      };
    
    case 'UPDATE_CACHE':
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, {
        key: action.payload.key,
        value: action.payload.value,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
        accessCount: 1
      });
      return { ...state, cache: newCache };
    
    case 'SET_CACHE_STATS':
      return { ...state, cacheStats: action.payload };
    
    case 'REAL_TIME_UPDATE':
      // Handle real-time updates based on the payload type
      return state; // Implementation would vary based on update type
    
    default:
      return state;
  }
}

// Context creation
const ClassificationContext = createContext<ClassificationContextValue | null>(null);

// Provider component
export const ClassificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(classificationReducer, initialState);

  // Initialize the system
  const initialize = useCallback(async () => {
    try {
      dispatch({ type: 'INITIALIZE_START' });
      
      // Initialize processors
      await defaultProcessor.createContext('classification', 'system-init');
      
      // Load initial data in parallel
      const [
        frameworksResponse,
        systemHealthResponse,
        performanceResponse
      ] = await Promise.all([
        classificationApi.getFrameworks(),
        classificationApi.getSystemHealth(),
        defaultOptimizer.getSystemHealth()
      ]);
      
      dispatch({ 
        type: 'INITIALIZE_SUCCESS', 
        payload: {
          frameworks: frameworksResponse.data || [],
          systemHealth: systemHealthResponse.data || state.systemHealth,
          performanceMetrics: {
            ...state.performanceMetrics,
            timestamp: new Date()
          }
        }
      });
      
      toast.success('Classification system initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize system';
      dispatch({ type: 'INITIALIZE_ERROR', payload: errorMessage });
      toast.error('Failed to initialize classification system', {
        description: errorMessage
      });
    }
  }, []);

  // Advanced Data loading functions with enterprise features
  const loadFrameworks = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Advanced API call with retry logic and performance tracking
      const startTime = performance.now();
      const response = await classificationApi.getFrameworks({
        includeStats: true,
        includeRelated: ['rules', 'policies', 'results'],
        performanceTracking: true,
        cacheStrategy: 'intelligent'
      });
      
      const loadTime = performance.now() - startTime;
      
      // Process and enhance framework data
      const frameworks = (response.data || []).map((framework: any) => ({
        ...framework,
        loadedAt: new Date().toISOString(),
        loadTime: Math.round(loadTime),
        isActive: framework.isActive !== false,
        metadata: {
          ...framework.metadata,
          totalRules: framework.rules?.length || 0,
          totalPolicies: framework.policies?.length || 0,
          lastAccessed: new Date().toISOString(),
          performanceMetrics: {
            loadTime: Math.round(loadTime),
            dataSize: JSON.stringify(framework).length,
            complexity: (framework.rules?.length || 0) + (framework.policies?.length || 0)
          }
        }
      }));
      
      dispatch({ type: 'SET_FRAMEWORKS', payload: frameworks });
      
      // Update performance metrics
      dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: {
        ...state.performanceMetrics,
        frameworksLoadTime: Math.round(loadTime),
        lastFrameworksLoad: new Date().toISOString(),
        totalFrameworks: frameworks.length
      }});
      
      toast.success(`Loaded ${frameworks.length} classification frameworks`, {
        description: `Load time: ${Math.round(loadTime)}ms • API Version: ${response.apiVersion || 'v1'}`
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load frameworks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      toast.error('Failed to Load Classification Frameworks', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => loadFrameworks()
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.performanceMetrics]);

  const loadRules = useCallback(async (frameworkId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await classificationApi.getRules(frameworkId);
      dispatch({ type: 'SET_RULES', payload: response.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load rules';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Failed to load rules', { description: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadPolicies = useCallback(async (frameworkId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await classificationApi.getPolicies(frameworkId);
      dispatch({ type: 'SET_POLICIES', payload: response.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load policies';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Failed to load policies', { description: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadResults = useCallback(async (filters?: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await classificationApi.getResults(filters);
      dispatch({ type: 'SET_RESULTS', payload: response.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load results';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Failed to load results', { description: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadAuditLogs = useCallback(async (filters?: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await classificationApi.getAuditLogs(filters);
      dispatch({ type: 'SET_AUDIT_LOGS', payload: response.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audit logs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Failed to load audit logs', { description: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // CRUD operations
  const createFramework = useCallback(async (data: Partial<ClassificationFramework>) => {
    try {
      const response = await classificationApi.createFramework(data);
      await loadFrameworks(); // Reload to get updated list
      toast.success('Framework created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create framework';
      toast.error('Failed to create framework', { description: errorMessage });
      throw error;
    }
  }, [loadFrameworks]);

  const updateFramework = useCallback(async (id: string, data: Partial<ClassificationFramework>) => {
    try {
      const response = await classificationApi.updateFramework(id, data);
      await loadFrameworks(); // Reload to get updated list
      toast.success('Framework updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update framework';
      toast.error('Failed to update framework', { description: errorMessage });
      throw error;
    }
  }, [loadFrameworks]);

  const deleteFramework = useCallback(async (id: string) => {
    try {
      await classificationApi.deleteFramework(id);
      await loadFrameworks(); // Reload to get updated list
      toast.success('Framework deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete framework';
      toast.error('Failed to delete framework', { description: errorMessage });
      throw error;
    }
  }, [loadFrameworks]);

  // Similar CRUD operations for rules and policies...
  const createRule = useCallback(async (data: Partial<ClassificationRule>) => {
    try {
      const response = await classificationApi.createRule(data);
      await loadRules(data.frameworkId);
      toast.success('Rule created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create rule';
      toast.error('Failed to create rule', { description: errorMessage });
      throw error;
    }
  }, [loadRules]);

  const updateRule = useCallback(async (id: string, data: Partial<ClassificationRule>) => {
    try {
      const response = await classificationApi.updateRule(id, data);
      await loadRules(data.frameworkId);
      toast.success('Rule updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update rule';
      toast.error('Failed to update rule', { description: errorMessage });
      throw error;
    }
  }, [loadRules]);

  const deleteRule = useCallback(async (id: string) => {
    try {
      await classificationApi.deleteRule(id);
      await loadRules();
      toast.success('Rule deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete rule';
      toast.error('Failed to delete rule', { description: errorMessage });
      throw error;
    }
  }, [loadRules]);

  // Real-time operations
  const enableRealTimeUpdates = useCallback(() => {
    if (!state.webSocketConnected) {
      websocketApi.connect();
      websocketApi.subscribe('classification-updates', (data) => {
        dispatch({ type: 'REAL_TIME_UPDATE', payload: data });
      });
      websocketApi.subscribe('system-health', (data) => {
        dispatch({ type: 'SET_SYSTEM_HEALTH', payload: data });
      });
      websocketApi.subscribe('performance-metrics', (data) => {
        dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: data });
      });
      dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: true });
    }
    dispatch({ type: 'SET_REAL_TIME_UPDATES', payload: true });
    toast.success('Real-time updates enabled');
  }, [state.webSocketConnected]);

  const disableRealTimeUpdates = useCallback(() => {
    dispatch({ type: 'SET_REAL_TIME_UPDATES', payload: false });
    if (state.webSocketConnected) {
      websocketApi.disconnect();
      dispatch({ type: 'SET_WEBSOCKET_CONNECTED', payload: false });
    }
    toast.info('Real-time updates disabled');
  }, [state.webSocketConnected]);

  // UI operations
  const selectFramework = useCallback((framework: ClassificationFramework | null) => {
    dispatch({ type: 'SET_SELECTED_FRAMEWORK', payload: framework });
    if (framework) {
      loadRules(framework.id);
      loadPolicies(framework.id);
    }
  }, [loadRules, loadPolicies]);

  const selectRule = useCallback((rule: ClassificationRule | null) => {
    dispatch({ type: 'SET_SELECTED_RULE', payload: rule });
  }, []);

  const selectModel = useCallback((model: MLModel | AIModel | null) => {
    dispatch({ type: 'SET_SELECTED_MODEL', payload: model });
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  }, []);

  // Workflow operations
  const startWorkflow = useCallback(async (type: string, config: any) => {
    try {
      const contextId = await defaultProcessor.createContext(
        type as any, 
        'user-initiated',
        config
      );
      
      const workflow: WorkflowExecution = {
        id: contextId,
        type: type as any,
        status: 'running',
        progress: 0,
        steps: [],
        startedAt: new Date(),
        metadata: config
      };
      
      dispatch({ type: 'SET_CURRENT_WORKFLOW', payload: workflow });
      toast.success(`${type} workflow started`);
      
      return workflow;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start workflow';
      toast.error('Failed to start workflow', { description: errorMessage });
      throw error;
    }
  }, []);

  // Cache operations
  const getCached = useCallback((key: string) => {
    const entry = state.cache.get(key);
    if (entry && entry.expiresAt > new Date()) {
      entry.accessCount++;
      return entry.value;
    }
    return null;
  }, [state.cache]);

  const setCached = useCallback((key: string, value: any, ttl = 3600000) => {
    dispatch({ 
      type: 'UPDATE_CACHE', 
      payload: { key, value } 
    });
  }, []);

  const clearCache = useCallback(() => {
    state.cache.clear();
    dispatch({ 
      type: 'SET_CACHE_STATS', 
      payload: { entries: 0, hitRate: 0, size: 0, evictions: 0 } 
    });
    toast.success('Cache cleared');
  }, [state.cache]);

  // Export/Import operations
  const exportData = useCallback(async (type: string, filters?: any) => {
    try {
      const response = await classificationApi.exportData(type, filters);
      toast.success(`${type} data exported successfully`);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export data';
      toast.error('Failed to export data', { description: errorMessage });
      throw error;
    }
  }, []);

  const importData = useCallback(async (file: File) => {
    try {
      const response = await classificationApi.importData(file);
      await loadFrameworks(); // Reload data
      toast.success('Data imported successfully');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import data';
      toast.error('Failed to import data', { description: errorMessage });
      throw error;
    }
  }, [loadFrameworks]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.webSocketConnected) {
        websocketApi.disconnect();
      }
      defaultProcessor.shutdown();
      defaultOptimizer.shutdown();
    };
  }, [state.webSocketConnected]);

  // Context value
  const contextValue = useMemo<ClassificationContextValue>(() => ({
    state,
    actions: {
      initialize,
      loadFrameworks,
      loadRules,
      loadPolicies,
      loadResults,
      loadAuditLogs,
      createFramework,
      updateFramework,
      deleteFramework,
      createRule,
      updateRule,
      deleteRule,
      createPolicy: async () => ({} as ClassificationPolicy), // Placeholder
      updatePolicy: async () => ({} as ClassificationPolicy), // Placeholder
      deletePolicy: async () => {}, // Placeholder
      runClassification: async () => ({} as WorkflowExecution), // Placeholder
      bulkClassify: async () => ({} as WorkflowExecution), // Placeholder
      approveResult: async () => {}, // Placeholder
      rejectResult: async () => {}, // Placeholder
      trainModel: async () => ({} as TrainingJob), // Placeholder
      deployModel: async () => {}, // Placeholder
      runInference: async () => ({} as Prediction), // Placeholder
      enableRealTimeUpdates,
      disableRealTimeUpdates,
      selectFramework,
      selectRule,
      selectModel,
      setActiveTab,
      setSidebarCollapsed,
      startWorkflow,
      cancelWorkflow: async () => {}, // Placeholder
      getCached,
      setCached,
      clearCache,
      exportData,
      importData,
      generateReport: async () => new Blob() // Placeholder
    }
  }), [
    state,
    initialize,
    loadFrameworks,
    loadRules,
    loadPolicies,
    loadResults,
    loadAuditLogs,
    createFramework,
    updateFramework,
    deleteFramework,
    createRule,
    updateRule,
    deleteRule,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    selectFramework,
    selectRule,
    selectModel,
    setActiveTab,
    setSidebarCollapsed,
    startWorkflow,
    getCached,
    setCached,
    clearCache,
    exportData,
    importData
  ]);

  return (
    <ClassificationContext.Provider value={contextValue}>
      {children}
    </ClassificationContext.Provider>
  );
};

// Hook to use the classification context
export const useClassification = (): ClassificationContextValue => {
  const context = useContext(ClassificationContext);
  if (!context) {
    throw new Error('useClassification must be used within a ClassificationProvider');
  }
  return context;
};

export default ClassificationProvider;