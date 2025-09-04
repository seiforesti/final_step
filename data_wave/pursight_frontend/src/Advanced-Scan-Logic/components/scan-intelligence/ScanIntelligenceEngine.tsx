/**
 * 🧠 Scan Intelligence Engine - Core Intelligence Hub
 * ==================================================
 * 
 * Enterprise-grade AI-powered intelligence engine that serves as the central
 * brain for all scanning operations. Features advanced pattern recognition,
 * real-time anomaly detection, predictive analytics, and intelligent automation.
 * 
 * Key Features:
 * - AI-powered pattern recognition and analysis
 * - Real-time anomaly detection with ML models
 * - Predictive analytics and forecasting
 * - Intelligent threat detection and security analysis
 * - Behavioral profiling and contextual intelligence
 * - Advanced data insights and recommendations
 * - Machine learning model management and training
 * - Comprehensive intelligence reporting and visualization
 * - Cross-system correlation and analysis
 * - Adaptive learning and continuous optimization
 * 
 * Architecture:
 * - Multi-layered AI/ML processing pipeline
 * - Real-time streaming analytics
 * - Distributed computing capabilities
 * - Advanced caching and optimization
 * - Enterprise security and compliance
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component ScanIntelligenceEngine
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertTriangle, Eye, Target, Activity, BarChart3, PieChart, LineChart, Settings, RefreshCw, Filter, Search, Download, Upload, Play, Pause, Square, CheckCircle, XCircle, Clock, Database, Server, Network, Cpu, HardDrive, Shield, Lock, Unlock, GitBranch, Layers, Box, Grid, List, MoreHorizontal, ChevronDown, ChevronRight, ChevronLeft, ExternalLink, Info, HelpCircle, Star, Bookmark, Share, Copy, Edit, Trash2, Plus, Minus, Maximize, Minimize, RotateCcw, Save, Send, MessageSquare, Users, User, Calendar, MapPin, Globe, Wifi, WifiOff, Signal, Battery, Bluetooth, Volume2, VolumeX, Camera, Video, Image, FileText, File, Folder, FolderOpen, Archive, Package, Layers3, Component, Puzzle } from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { DataTable } from '@/components/ui/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Chart Components
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, ComposedChart, Scatter, ScatterChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey, FunnelChart, Funnel, LabelList } from 'recharts';

// Types and Interfaces
import { 
  ScanIntelligenceInsight,
  PatternRecognitionResult,
  AnomalyDetectionResult,
  PredictiveAnalysis,
  IntelligenceInsightType,
  IntelligenceCategory,
  IntelligenceSeverity,
  IntelligenceStatus,
  PatternType,
  AnomalyType,
  PredictionType,
  IntelligenceActionItem,
  BusinessContext,
  TechnicalContext,
  PerformanceMetrics,
  SecurityThreat,
  ComplianceViolation,
  ModelConfiguration,
  MLModelInfo,
  TrainingMetrics,
  InferenceResult
} from '../../types/intelligence.types';

import {
  OrchestrationJob,
  WorkflowExecution,
  ResourceAllocation,
  PerformanceOptimization,
  SystemHealthStatus,
  IntelligenceRecommendation,
  CrossSystemCorrelation
} from '../../types/orchestration.types';

// Hooks and Services
import { useScanIntelligence } from '../../hooks/useScanIntelligence';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { useNotifications } from '@/hooks/useNotifications';
import { useWebSocket } from '@/hooks/useWebSocket';

// Utils and Constants
import { cn } from '@/lib copie/utils';
import { formatDate, formatDuration, formatBytes, formatNumber } from '@/utils/formatters';
import { generateColor, getStatusColor, getSeverityColor } from '@/utils/colors';
import { 
  INTELLIGENCE_CATEGORIES,
  INTELLIGENCE_SEVERITIES,
  PATTERN_TYPES,
  ANOMALY_TYPES,
  PREDICTION_TYPES,
  MODEL_TYPES,
  OPTIMIZATION_STRATEGIES,
  REFRESH_INTERVALS
} from '../../constants/intelligence-constants';

// ===================== INTERFACES & TYPES =====================

interface IntelligenceEngineState {
  isInitialized: boolean;
  isLoading: boolean;
  insights: ScanIntelligenceInsight[];
  patterns: PatternRecognitionResult[];
  anomalies: AnomalyDetectionResult[];
  predictions: PredictiveAnalysis[];
  activeModels: MLModelInfo[];
  systemHealth: SystemHealthStatus;
  performanceMetrics: PerformanceMetrics;
  securityThreats: SecurityThreat[];
  complianceViolations: ComplianceViolation[];
  recommendations: IntelligenceRecommendation[];
  correlations: CrossSystemCorrelation[];
  selectedInsight: ScanIntelligenceInsight | null;
  selectedPattern: PatternRecognitionResult | null;
  selectedAnomaly: AnomalyDetectionResult | null;
  filterCriteria: IntelligenceFilterCriteria;
  viewMode: IntelligenceViewMode;
  activeTab: string;
  refreshInterval: number;
  autoRefresh: boolean;
  notifications: IntelligenceNotification[];
  errors: IntelligenceError[];
  processingStatus: ProcessingStatus;
  modelTrainingStatus: ModelTrainingStatus;
  realTimeStreaming: boolean;
  advancedMode: boolean;
}

interface IntelligenceFilterCriteria {
  categories: IntelligenceCategory[];
  severities: IntelligenceSeverity[];
  statuses: IntelligenceStatus[];
  timeRange: TimeRange;
  confidenceThreshold: number;
  includeResolved: boolean;
  searchQuery: string;
  tags: string[];
  dataSources: string[];
  scanTypes: string[];
  customFilters: Record<string, any>;
}

interface IntelligenceViewMode {
  layout: 'grid' | 'list' | 'timeline' | 'dashboard';
  groupBy: 'category' | 'severity' | 'status' | 'date' | 'source';
  sortBy: 'date' | 'severity' | 'confidence' | 'impact' | 'relevance';
  sortOrder: 'asc' | 'desc';
  density: 'compact' | 'comfortable' | 'spacious';
  showDetails: boolean;
  showPreview: boolean;
  showMetrics: boolean;
}

interface TimeRange {
  start: Date;
  end: Date;
  preset: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'custom';
}

interface IntelligenceNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actionable: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  variant: 'default' | 'destructive' | 'outline';
}

interface IntelligenceError {
  id: string;
  code: string;
  message: string;
  details: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  retryCount: number;
  resolved: boolean;
}

interface ProcessingStatus {
  isProcessing: boolean;
  currentOperation: string;
  progress: number;
  estimatedCompletion: Date | null;
  queueSize: number;
  throughput: number;
  errorRate: number;
}

interface ModelTrainingStatus {
  isTraining: boolean;
  modelId: string;
  modelType: string;
  progress: number;
  epochsCompleted: number;
  totalEpochs: number;
  currentLoss: number;
  bestLoss: number;
  validationAccuracy: number;
  estimatedCompletion: Date | null;
  trainingMetrics: TrainingMetrics[];
}

interface IntelligenceMetrics {
  totalInsights: number;
  criticalInsights: number;
  resolvedInsights: number;
  averageConfidence: number;
  patternDetectionRate: number;
  anomalyDetectionRate: number;
  predictionAccuracy: number;
  processingLatency: number;
  systemEfficiency: number;
  modelPerformance: Record<string, number>;
  trendAnalysis: TrendData[];
  performanceHistory: PerformanceData[];
}

interface TrendData {
  timestamp: Date;
  value: number;
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
}

interface PerformanceData {
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

// ===================== REDUCER =====================

type IntelligenceEngineAction = 
  | { type: 'INITIALIZE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INSIGHTS'; payload: ScanIntelligenceInsight[] }
  | { type: 'ADD_INSIGHT'; payload: ScanIntelligenceInsight }
  | { type: 'UPDATE_INSIGHT'; payload: ScanIntelligenceInsight }
  | { type: 'REMOVE_INSIGHT'; payload: string }
  | { type: 'SET_PATTERNS'; payload: PatternRecognitionResult[] }
  | { type: 'SET_ANOMALIES'; payload: AnomalyDetectionResult[] }
  | { type: 'SET_PREDICTIONS'; payload: PredictiveAnalysis[] }
  | { type: 'SET_MODELS'; payload: MLModelInfo[] }
  | { type: 'SET_SYSTEM_HEALTH'; payload: SystemHealthStatus }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: PerformanceMetrics }
  | { type: 'SET_SECURITY_THREATS'; payload: SecurityThreat[] }
  | { type: 'SET_COMPLIANCE_VIOLATIONS'; payload: ComplianceViolation[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: IntelligenceRecommendation[] }
  | { type: 'SET_CORRELATIONS'; payload: CrossSystemCorrelation[] }
  | { type: 'SELECT_INSIGHT'; payload: ScanIntelligenceInsight | null }
  | { type: 'SELECT_PATTERN'; payload: PatternRecognitionResult | null }
  | { type: 'SELECT_ANOMALY'; payload: AnomalyDetectionResult | null }
  | { type: 'SET_FILTER_CRITERIA'; payload: Partial<IntelligenceFilterCriteria> }
  | { type: 'SET_VIEW_MODE'; payload: Partial<IntelligenceViewMode> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'TOGGLE_AUTO_REFRESH' }
  | { type: 'ADD_NOTIFICATION'; payload: IntelligenceNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_ERROR'; payload: IntelligenceError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'SET_PROCESSING_STATUS'; payload: Partial<ProcessingStatus> }
  | { type: 'SET_MODEL_TRAINING_STATUS'; payload: Partial<ModelTrainingStatus> }
  | { type: 'TOGGLE_REAL_TIME_STREAMING' }
  | { type: 'TOGGLE_ADVANCED_MODE' }
  | { type: 'RESET_FILTERS' }
  | { type: 'RESET_STATE' };

const initialState: IntelligenceEngineState = {
  isInitialized: false,
  isLoading: false,
  insights: [],
  patterns: [],
  anomalies: [],
  predictions: [],
  activeModels: [],
  systemHealth: {
    overall_status: 'healthy',
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_latency: 0,
    active_connections: 0,
    error_rate: 0,
    uptime: 0,
    last_updated: new Date().toISOString()
  },
  performanceMetrics: {
    processing_latency: 0,
    throughput: 0,
    accuracy: 0,
    efficiency: 0,
    resource_utilization: 0,
    error_rate: 0,
    prediction_accuracy: 0,
    model_performance: 0,
    system_load: 0,
    response_time: 0
  },
  securityThreats: [],
  complianceViolations: [],
  recommendations: [],
  correlations: [],
  selectedInsight: null,
  selectedPattern: null,
  selectedAnomaly: null,
  filterCriteria: {
    categories: [],
    severities: [],
    statuses: [],
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
      preset: 'last_day'
    },
    confidenceThreshold: 0.7,
    includeResolved: false,
    searchQuery: '',
    tags: [],
    dataSources: [],
    scanTypes: [],
    customFilters: {}
  },
  viewMode: {
    layout: 'dashboard',
    groupBy: 'category',
    sortBy: 'date',
    sortOrder: 'desc',
    density: 'comfortable',
    showDetails: true,
    showPreview: true,
    showMetrics: true
  },
  activeTab: 'overview',
  refreshInterval: 30000,
  autoRefresh: true,
  notifications: [],
  errors: [],
  processingStatus: {
    isProcessing: false,
    currentOperation: '',
    progress: 0,
    estimatedCompletion: null,
    queueSize: 0,
    throughput: 0,
    errorRate: 0
  },
  modelTrainingStatus: {
    isTraining: false,
    modelId: '',
    modelType: '',
    progress: 0,
    epochsCompleted: 0,
    totalEpochs: 0,
    currentLoss: 0,
    bestLoss: 0,
    validationAccuracy: 0,
    estimatedCompletion: null,
    trainingMetrics: []
  },
  realTimeStreaming: true,
  advancedMode: false
};

function intelligenceEngineReducer(
  state: IntelligenceEngineState, 
  action: IntelligenceEngineAction
): IntelligenceEngineState {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isInitialized: true };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload };
      
    case 'ADD_INSIGHT':
      return { 
        ...state, 
        insights: [action.payload, ...state.insights].slice(0, 1000) // Limit to 1000 items
      };
      
    case 'UPDATE_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(insight => 
          insight.id === action.payload.id ? action.payload : insight
        )
      };
      
    case 'REMOVE_INSIGHT':
      return {
        ...state,
        insights: state.insights.filter(insight => insight.id !== action.payload)
      };
      
    case 'SET_PATTERNS':
      return { ...state, patterns: action.payload };
      
    case 'SET_ANOMALIES':
      return { ...state, anomalies: action.payload };
      
    case 'SET_PREDICTIONS':
      return { ...state, predictions: action.payload };
      
    case 'SET_MODELS':
      return { ...state, activeModels: action.payload };
      
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
      
    case 'SET_PERFORMANCE_METRICS':
      return { ...state, performanceMetrics: action.payload };
      
    case 'SET_SECURITY_THREATS':
      return { ...state, securityThreats: action.payload };
      
    case 'SET_COMPLIANCE_VIOLATIONS':
      return { ...state, complianceViolations: action.payload };
      
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
      
    case 'SET_CORRELATIONS':
      return { ...state, correlations: action.payload };
      
    case 'SELECT_INSIGHT':
      return { ...state, selectedInsight: action.payload };
      
    case 'SELECT_PATTERN':
      return { ...state, selectedPattern: action.payload };
      
    case 'SELECT_ANOMALY':
      return { ...state, selectedAnomaly: action.payload };
      
    case 'SET_FILTER_CRITERIA':
      return { 
        ...state, 
        filterCriteria: { ...state.filterCriteria, ...action.payload }
      };
      
    case 'SET_VIEW_MODE':
      return { 
        ...state, 
        viewMode: { ...state.viewMode, ...action.payload }
      };
      
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
      
    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };
      
    case 'TOGGLE_AUTO_REFRESH':
      return { ...state, autoRefresh: !state.autoRefresh };
      
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications].slice(0, 100)
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
      
    case 'ADD_ERROR':
      return { 
        ...state, 
        errors: [action.payload, ...state.errors].slice(0, 50)
      };
      
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(e => e.id !== action.payload)
      };
      
    case 'SET_PROCESSING_STATUS':
      return { 
        ...state, 
        processingStatus: { ...state.processingStatus, ...action.payload }
      };
      
    case 'SET_MODEL_TRAINING_STATUS':
      return { 
        ...state, 
        modelTrainingStatus: { ...state.modelTrainingStatus, ...action.payload }
      };
      
    case 'TOGGLE_REAL_TIME_STREAMING':
      return { ...state, realTimeStreaming: !state.realTimeStreaming };
      
    case 'TOGGLE_ADVANCED_MODE':
      return { ...state, advancedMode: !state.advancedMode };
      
    case 'RESET_FILTERS':
      return { ...state, filterCriteria: initialState.filterCriteria };
      
    case 'RESET_STATE':
      return { ...initialState, isInitialized: true };
      
    default:
      return state;
  }
}

// ===================== COMPONENT =====================

const ScanIntelligenceEngine: React.FC = () => {
  const [state, dispatch] = useReducer(intelligenceEngineReducer, initialState);
  const engineRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsConnectionRef = useRef<WebSocket | null>(null);
  const processingQueueRef = useRef<any[]>([]);
  const modelCacheRef = useRef<Map<string, any>>(new Map());

  // Hooks
  const {
    insights,
    patterns,
    anomalies,
    predictions,
    models,
    isLoading: intelligenceLoading,
    error: intelligenceError,
    createInsight,
    updateInsight,
    deleteInsight,
    getInsightsByCategory,
    getPatternsByType,
    getAnomaliesBySeverity,
    getPredictionsByScope,
    trainModel,
    deployModel,
    getModelMetrics,
    optimizeModels,
    generateRecommendations,
    analyzeCorrelations,
    detectThreats,
    validateCompliance,
    refetch: refetchIntelligence
  } = useScanIntelligence();

  const {
    systemHealth,
    performanceMetrics,
    realTimeData,
    isConnected,
    latency,
    subscribe,
    unsubscribe,
    reconnect
  } = useRealTimeMonitoring();

  const {
    analytics,
    trends,
    forecasts,
    generateReport,
    exportData,
    customAnalysis,
    getInsights: getAnalyticsInsights
  } = useAdvancedAnalytics();

  const {
    optimizationRecommendations,
    performanceOptimizations,
    resourceUtilization,
    optimizePerformance,
    implementOptimization,
    scheduleOptimization,
    monitorOptimization
  } = usePerformanceOptimization();

  const { showNotification, showError, showSuccess } = useNotifications();

  // ===================== INITIALIZATION & LIFECYCLE =====================

  useEffect(() => {
    initializeEngine();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (state.autoRefresh && state.refreshInterval > 0) {
      setupAutoRefresh();
    } else {
      clearAutoRefresh();
    }
  }, [state.autoRefresh, state.refreshInterval]);

  useEffect(() => {
    if (state.realTimeStreaming) {
      setupWebSocketConnection();
    } else {
      closeWebSocketConnection();
    }
  }, [state.realTimeStreaming]);

  useEffect(() => {
    if (intelligenceError) {
      handleIntelligenceError(intelligenceError);
    }
  }, [intelligenceError]);

  const initializeEngine = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Initialize core intelligence components
      await Promise.all([
        loadInitialData(),
        initializeModels(),
        setupMonitoring(),
        validateConfiguration()
      ]);

      dispatch({ type: 'INITIALIZE' });
      
      showNotification({
        title: 'Intelligence Engine Started',
        message: 'Scan Intelligence Engine is now operational',
        type: 'success'
      });

    } catch (error) {
      console.error('Failed to initialize intelligence engine:', error);
      handleError(error as Error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [
        insightsData,
        patternsData,
        anomaliesData,
        predictionsData,
        modelsData,
        healthData,
        metricsData
      ] = await Promise.all([
        getInsightsByCategory(state.filterCriteria.categories),
        getPatternsByType(PATTERN_TYPES),
        getAnomaliesBySeverity(state.filterCriteria.severities),
        getPredictionsByScope('system_wide'),
        getModelMetrics(),
        systemHealth,
        performanceMetrics
      ]);

      dispatch({ type: 'SET_INSIGHTS', payload: insightsData || [] });
      dispatch({ type: 'SET_PATTERNS', payload: patternsData || [] });
      dispatch({ type: 'SET_ANOMALIES', payload: anomaliesData || [] });
      dispatch({ type: 'SET_PREDICTIONS', payload: predictionsData || [] });
      dispatch({ type: 'SET_MODELS', payload: modelsData || [] });
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: healthData });
      dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: metricsData });

    } catch (error) {
      console.error('Failed to load initial data:', error);
      throw error;
    }
  }, []);

  const initializeModels = useCallback(async () => {
    try {
      // Initialize AI/ML models
      const modelConfigurations = [
        {
          type: 'pattern_recognition',
          config: { threshold: 0.8, window_size: 1000 }
        },
        {
          type: 'anomaly_detection',
          config: { sensitivity: 0.9, algorithm: 'isolation_forest' }
        },
        {
          type: 'predictive_analytics',
          config: { horizon: '7d', confidence: 0.85 }
        }
      ];

      for (const modelConfig of modelConfigurations) {
        await trainModel(modelConfig);
      }

      // Load pre-trained models into cache
      const activeModels = await getModelMetrics();
      activeModels.forEach(model => {
        modelCacheRef.current.set(model.id, model);
      });

    } catch (error) {
      console.error('Failed to initialize models:', error);
      throw error;
    }
  }, []);

  const setupMonitoring = useCallback(async () => {
    try {
      // Subscribe to real-time monitoring channels
      await subscribe([
        'scan_insights',
        'pattern_detection',
        'anomaly_alerts',
        'performance_metrics',
        'system_health',
        'security_threats',
        'compliance_violations'
      ]);

    } catch (error) {
      console.error('Failed to setup monitoring:', error);
      throw error;
    }
  }, []);

  const validateConfiguration = useCallback(async () => {
    try {
      // Validate intelligence engine configuration
      const requiredServices = [
        'scan_intelligence_service',
        'pattern_recognition_service',
        'anomaly_detection_service',
        'predictive_analytics_service'
      ];

      // Check service availability
      // Implementation would check backend service health

    } catch (error) {
      console.error('Configuration validation failed:', error);
      throw error;
    }
  }, []);

  // ===================== REAL-TIME UPDATES =====================

  const setupAutoRefresh = useCallback(() => {
    clearAutoRefresh();
    
    refreshIntervalRef.current = setInterval(() => {
      if (!state.isLoading) {
        refreshData();
      }
    }, state.refreshInterval);
  }, [state.refreshInterval]);

  const clearAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const setupWebSocketConnection = useCallback(() => {
    try {
      const wsUrl = `${(typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL)}/intelligence`;
      wsConnectionRef.current = new WebSocket(wsUrl);

      wsConnectionRef.current.onopen = () => {
        console.log('WebSocket connected');
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          id: Date.now().toString(),
          type: 'success',
          title: 'Real-time Connection Established',
          message: 'Now receiving live intelligence updates',
          timestamp: new Date(),
          read: false,
          persistent: false,
          actionable: false
        }});
      };

      wsConnectionRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeUpdate(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsConnectionRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        if (state.realTimeStreaming) {
          // Attempt reconnection
          setTimeout(setupWebSocketConnection, 5000);
        }
      };

      wsConnectionRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        handleError(new Error('WebSocket connection failed'));
      };

    } catch (error) {
      console.error('Failed to setup WebSocket connection:', error);
      handleError(error as Error);
    }
  }, [state.realTimeStreaming]);

  const closeWebSocketConnection = useCallback(() => {
    if (wsConnectionRef.current) {
      wsConnectionRef.current.close();
      wsConnectionRef.current = null;
    }
  }, []);

  const handleRealtimeUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'new_insight':
        dispatch({ type: 'ADD_INSIGHT', payload: data.payload });
        if (data.payload.severity === 'critical') {
          showNotification({
            title: 'Critical Insight Detected',
            message: data.payload.title,
            type: 'warning'
          });
        }
        break;

      case 'pattern_detected':
        dispatch({ type: 'SET_PATTERNS', payload: data.payload });
        break;

      case 'anomaly_detected':
        dispatch({ type: 'SET_ANOMALIES', payload: data.payload });
        if (data.payload.some((a: any) => a.severity === 'critical')) {
          showNotification({
            title: 'Critical Anomaly Detected',
            message: 'Immediate attention required',
            type: 'error'
          });
        }
        break;

      case 'system_health_update':
        dispatch({ type: 'SET_SYSTEM_HEALTH', payload: data.payload });
        break;

      case 'performance_metrics_update':
        dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: data.payload });
        break;

      case 'model_training_update':
        dispatch({ type: 'SET_MODEL_TRAINING_STATUS', payload: data.payload });
        break;

      case 'processing_status_update':
        dispatch({ type: 'SET_PROCESSING_STATUS', payload: data.payload });
        break;

      default:
        console.log('Unknown real-time update type:', data.type);
    }
  }, []);

  // ===================== DATA MANAGEMENT =====================

  const refreshData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await loadInitialData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
      handleError(error as Error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadInitialData]);

  const applyFilters = useCallback((criteria: Partial<IntelligenceFilterCriteria>) => {
    dispatch({ type: 'SET_FILTER_CRITERIA', payload: criteria });
    // Trigger data refresh with new filters
    setTimeout(refreshData, 100);
  }, [refreshData]);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
    setTimeout(refreshData, 100);
  }, [refreshData]);

  // ===================== INTELLIGENCE OPERATIONS =====================

  const analyzePattern = useCallback(async (patternId: string) => {
    try {
      dispatch({ type: 'SET_PROCESSING_STATUS', payload: {
        isProcessing: true,
        currentOperation: 'Analyzing pattern...',
        progress: 0
      }});

      // Perform pattern analysis
      const analysis = await analyzeCorrelations(patternId);
      
      dispatch({ type: 'SET_CORRELATIONS', payload: analysis });
      
      showSuccess('Pattern analysis completed successfully');

    } catch (error) {
      console.error('Pattern analysis failed:', error);
      handleError(error as Error);
    } finally {
      dispatch({ type: 'SET_PROCESSING_STATUS', payload: {
        isProcessing: false,
        currentOperation: '',
        progress: 100
      }});
    }
  }, []);

  const investigateAnomaly = useCallback(async (anomalyId: string) => {
    try {
      dispatch({ type: 'SET_PROCESSING_STATUS', payload: {
        isProcessing: true,
        currentOperation: 'Investigating anomaly...',
        progress: 0
      }});

      // Perform anomaly investigation
      const investigation = await detectThreats(anomalyId);
      
      dispatch({ type: 'SET_SECURITY_THREATS', payload: investigation });
      
      showSuccess('Anomaly investigation completed');

    } catch (error) {
      console.error('Anomaly investigation failed:', error);
      handleError(error as Error);
    } finally {
      dispatch({ type: 'SET_PROCESSING_STATUS', payload: {
        isProcessing: false,
        currentOperation: '',
        progress: 100
      }});
    }
  }, []);

  const generateIntelligenceReport = useCallback(async (type: string, parameters: any) => {
    try {
      dispatch({ type: 'SET_PROCESSING_STATUS', payload: {
        isProcessing: true,
        currentOperation: 'Generating intelligence report...',
        progress: 0
      }});

      const report = await generateReport(type, parameters);
      
      // ArrowDownTrayIcon the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intelligence-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showSuccess('Intelligence report generated successfully');

    } catch (error) {
      console.error('Report generation failed:', error);
      handleError(error as Error);
    } finally {
      dispatch({ type: 'SET_PROCESSING_STATUS', payload: {
        isProcessing: false,
        currentOperation: '',
        progress: 100
      }});
    }
  }, []);

  const optimizeIntelligenceModels = useCallback(async () => {
    try {
      dispatch({ type: 'SET_MODEL_TRAINING_STATUS', payload: {
        isTraining: true,
        modelType: 'All Models',
        progress: 0
      }});

      await optimizeModels();
      
      // Refresh model data
      const updatedModels = await getModelMetrics();
      dispatch({ type: 'SET_MODELS', payload: updatedModels });
      
      showSuccess('Model optimization completed successfully');

    } catch (error) {
      console.error('Model optimization failed:', error);
      handleError(error as Error);
    } finally {
      dispatch({ type: 'SET_MODEL_TRAINING_STATUS', payload: {
        isTraining: false,
        progress: 100
      }});
    }
  }, []);

  // ===================== ERROR HANDLING =====================

  const handleError = useCallback((error: Error) => {
    const errorData: IntelligenceError = {
      id: Date.now().toString(),
      code: 'INTELLIGENCE_ERROR',
      message: error.message,
      details: error.stack || '',
      timestamp: new Date(),
      severity: 'medium',
      recoverable: true,
      retryCount: 0,
      resolved: false
    };

    dispatch({ type: 'ADD_ERROR', payload: errorData });
    showError(error.message);
  }, []);

  const handleIntelligenceError = useCallback((error: any) => {
    console.error('Intelligence service error:', error);
    handleError(new Error(error.message || 'Intelligence operation failed'));
  }, [handleError]);

  const retryOperation = useCallback(async (errorId: string) => {
    try {
      const error = state.errors.find(e => e.id === errorId);
      if (!error || !error.recoverable) return;

      // Implement retry logic based on error type
      await refreshData();
      
      dispatch({ type: 'REMOVE_ERROR', payload: errorId });
      showSuccess('Operation retried successfully');

    } catch (retryError) {
      console.error('Retry failed:', retryError);
      handleError(retryError as Error);
    }
  }, [state.errors, refreshData]);

  // ===================== UTILITY FUNCTIONS =====================

  const cleanup = useCallback(() => {
    clearAutoRefresh();
    closeWebSocketConnection();
    processingQueueRef.current = [];
    modelCacheRef.current.clear();
  }, [clearAutoRefresh, closeWebSocketConnection]);

  const exportIntelligenceData = useCallback(async (format: 'json' | 'csv' | 'excel') => {
    try {
      const data = {
        insights: state.insights,
        patterns: state.patterns,
        anomalies: state.anomalies,
        predictions: state.predictions,
        systemHealth: state.systemHealth,
        performanceMetrics: state.performanceMetrics,
        exportTimestamp: new Date().toISOString()
      };

      await exportData(data, format);
      showSuccess(`Intelligence data exported as ${format.toUpperCase()}`);

    } catch (error) {
      console.error('Export failed:', error);
      handleError(error as Error);
    }
  }, [state]);

  // ===================== COMPUTED VALUES =====================

  const filteredInsights = useMemo(() => {
    let filtered = state.insights;

    // Apply category filter
    if (state.filterCriteria.categories.length > 0) {
      filtered = filtered.filter(insight => 
        state.filterCriteria.categories.includes(insight.category)
      );
    }

    // Apply severity filter
    if (state.filterCriteria.severities.length > 0) {
      filtered = filtered.filter(insight => 
        state.filterCriteria.severities.includes(insight.severity)
      );
    }

    // Apply status filter
    if (state.filterCriteria.statuses.length > 0) {
      filtered = filtered.filter(insight => 
        state.filterCriteria.statuses.includes(insight.status)
      );
    }

    // Apply confidence threshold
    filtered = filtered.filter(insight => 
      insight.confidence_score >= state.filterCriteria.confidenceThreshold
    );

    // Apply time range filter
    filtered = filtered.filter(insight => {
      const insightDate = new Date(insight.created_at);
      return insightDate >= state.filterCriteria.timeRange.start && 
             insightDate <= state.filterCriteria.timeRange.end;
    });

    // Apply search query
    if (state.filterCriteria.searchQuery) {
      const query = state.filterCriteria.searchQuery.toLowerCase();
      filtered = filtered.filter(insight => 
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query) ||
        insight.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply include resolved filter
    if (!state.filterCriteria.includeResolved) {
      filtered = filtered.filter(insight => insight.status !== 'resolved');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = state.viewMode;
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'severity':
          const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'informational': 0 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
          break;
        case 'confidence':
          aValue = a.confidence_score;
          bValue = b.confidence_score;
          break;
        case 'relevance':
          // Implement relevance scoring logic
          aValue = a.confidence_score * (a.severity === 'critical' ? 2 : 1);
          bValue = b.confidence_score * (b.severity === 'critical' ? 2 : 1);
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [state.insights, state.filterCriteria, state.viewMode]);

  const intelligenceMetrics = useMemo((): IntelligenceMetrics => {
    const totalInsights = state.insights.length;
    const criticalInsights = state.insights.filter(i => i.severity === 'critical').length;
    const resolvedInsights = state.insights.filter(i => i.status === 'resolved').length;
    const averageConfidence = totalInsights > 0 
      ? state.insights.reduce((sum, i) => sum + i.confidence_score, 0) / totalInsights 
      : 0;

    return {
      totalInsights,
      criticalInsights,
      resolvedInsights,
      averageConfidence,
      patternDetectionRate: state.patterns.length / Math.max(totalInsights, 1),
      anomalyDetectionRate: state.anomalies.length / Math.max(totalInsights, 1),
      predictionAccuracy: state.performanceMetrics.prediction_accuracy || 0,
      processingLatency: state.performanceMetrics.processing_latency || 0,
      systemEfficiency: state.performanceMetrics.efficiency || 0,
      modelPerformance: state.activeModels.reduce((acc, model) => {
        acc[model.model_type] = model.performance_metrics?.accuracy || 0;
        return acc;
      }, {} as Record<string, number>),
      trendAnalysis: [], // Would be populated with actual trend data
      performanceHistory: [] // Would be populated with historical performance data
    };
  }, [state.insights, state.patterns, state.anomalies, state.performanceMetrics, state.activeModels]);

  const systemHealthColor = useMemo(() => {
    switch (state.systemHealth.overall_status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [state.systemHealth.overall_status]);

  // ===================== RENDER HELPERS =====================

  const renderSystemHealthIndicator = () => (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "w-3 h-3 rounded-full",
        state.systemHealth.overall_status === 'healthy' ? 'bg-green-500' :
        state.systemHealth.overall_status === 'warning' ? 'bg-yellow-500' :
        'bg-red-500'
      )} />
      <span className={cn("text-sm font-medium", systemHealthColor)}>
        {state.systemHealth.overall_status.toUpperCase()}
      </span>
      {state.realTimeStreaming && (
        <Badge variant="outline" className="text-xs">
          LIVE
        </Badge>
      )}
    </motion.div>
  );

  const renderProcessingStatus = () => (
    state.processingStatus.isProcessing && (
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="w-80">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {state.processingStatus.currentOperation}
                </p>
                <Progress 
                  value={state.processingStatus.progress} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  );

  const renderInsightCard = (insight: ScanIntelligenceInsight) => (
    <motion.div
      key={insight.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          state.selectedInsight?.id === insight.id && "ring-2 ring-primary"
        )}
        onClick={() => dispatch({ type: 'SELECT_INSIGHT', payload: insight })}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{insight.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {insight.description}
              </CardDescription>
            </div>
            <Badge 
              variant={getSeverityColor(insight.severity)}
              className="ml-2"
            >
              {insight.severity.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={insight.confidence_score * 100} 
                  className="w-16"
                />
                <span className="font-medium">
                  {(insight.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="outline">
                {insight.category.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge 
                variant={getStatusColor(insight.status)}
                className="text-xs"
              >
                {insight.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(insight.created_at)}</span>
            </div>
            
            {insight.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {insight.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {insight.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{insight.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Insights
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(intelligenceMetrics.totalInsights)}
              </p>
            </div>
            <Brain className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Critical Issues
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatNumber(intelligenceMetrics.criticalInsights)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Confidence
              </p>
              <p className="text-2xl font-bold">
                {(intelligenceMetrics.averageConfidence * 100).toFixed(1)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Processing Time
              </p>
              <p className="text-2xl font-bold">
                {intelligenceMetrics.processingLatency.toFixed(0)}ms
              </p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>
            Real-time system performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={[
              { time: '00:00', cpu: state.systemHealth.cpu_usage, memory: state.systemHealth.memory_usage },
              { time: '06:00', cpu: 45, memory: 62 },
              { time: '12:00', cpu: 78, memory: 84 },
              { time: '18:00', cpu: 52, memory: 71 },
              { time: '24:00', cpu: state.systemHealth.cpu_usage, memory: state.systemHealth.memory_usage }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="HardDrive %" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intelligence Categories</CardTitle>
          <CardDescription>
            Distribution of insights by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={Object.entries(
                  state.insights.reduce((acc, insight) => {
                    acc[insight.category] = (acc[insight.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([category, count]) => ({
                  name: category.replace('_', ' ').toUpperCase(),
                  value: count,
                  fill: generateColor(category)
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {state.insights.map((_, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveModels = () => (
    <Card>
      <CardHeader>
        <CardTitle>Active ML Models</CardTitle>
        <CardDescription>
          Current AI/ML models and their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state.activeModels.map(model => (
            <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{model.model_name}</h4>
                <p className="text-sm text-muted-foreground">{model.model_type}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm font-medium">Accuracy</p>
                  <p className="text-lg font-bold text-green-600">
                    {((model.performance_metrics?.accuracy || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={model.status === 'active' ? 'default' : 'secondary'}
                  >
                    {model.status.toUpperCase()}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {}}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      Retrain Model
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      Deploy Model
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ===================== MAIN RENDER =====================

  if (!state.isInitialized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Initializing Intelligence Engine...</p>
          <p className="text-muted-foreground">Setting up AI models and monitoring systems</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div ref={engineRef} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Scan Intelligence Engine</h1>
            <p className="text-muted-foreground">
              AI-powered intelligence and pattern recognition for data governance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {renderSystemHealthIndicator()}
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={state.isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", state.isLoading && "animate-spin")} />
                Refresh
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportIntelligenceData('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportIntelligenceData('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportIntelligenceData('excel')}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: 'TOGGLE_ADVANCED_MODE' })}
              >
                <Settings className="h-4 w-4 mr-2" />
                {state.advancedMode ? 'Basic' : 'Advanced'}
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        {renderMetricsOverview()}

        {/* Main Content */}
        <Tabs value={state.activeTab} onValueChange={(tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            {state.advancedMode && (
              <>
                <TabsTrigger value="correlations">Correlations</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderPerformanceCharts()}
            {renderActiveModels()}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Filter Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Insights</Label>
                    <Input
                      id="search"
                      placeholder="Search by title, description, or tags..."
                      value={state.filterCriteria.searchQuery}
                      onChange={(e) => applyFilters({ searchQuery: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select
                      onValueChange={(value) => {
                        const categories = value === 'all' ? [] : [value as IntelligenceCategory];
                        applyFilters({ categories });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {INTELLIGENCE_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Severity</Label>
                    <Select
                      onValueChange={(value) => {
                        const severities = value === 'all' ? [] : [value as IntelligenceSeverity];
                        applyFilters({ severities });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        {INTELLIGENCE_SEVERITIES.map(severity => (
                          <SelectItem key={severity} value={severity}>
                            {severity.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="flex-1"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredInsights.map(renderInsightCard)}
              </AnimatePresence>
            </div>

            {filteredInsights.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Insights Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or refresh the data to see more insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            {/* Pattern Recognition Results */}
            <Card>
              <CardHeader>
                <CardTitle>Pattern Recognition Results</CardTitle>
                <CardDescription>
                  AI-detected patterns and correlations in scan data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.patterns.map(pattern => (
                    <div key={pattern.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{pattern.pattern_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pattern.pattern_description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>
                              Confidence: {(pattern.confidence_score * 100).toFixed(1)}%
                            </span>
                            <span>
                              Frequency: {pattern.frequency}
                            </span>
                            <Badge variant="outline">
                              {pattern.pattern_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => analyzePattern(pattern.id)}
                        >
                          Analyze
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            {/* Anomaly Detection Results */}
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
                <CardDescription>
                  Real-time anomaly detection and classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.anomalies.map(anomaly => (
                    <div key={anomaly.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{anomaly.anomaly_type}</h4>
                            <Badge 
                              variant={getSeverityColor(anomaly.severity)}
                            >
                              {anomaly.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {anomaly.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>
                              Score: {anomaly.anomaly_score.toFixed(3)}
                            </span>
                            <span>
                              Detected: {formatDate(anomaly.detected_at)}
                            </span>
                            {anomaly.false_positive_probability && (
                              <span>
                                False Positive Risk: {(anomaly.false_positive_probability * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => investigateAnomaly(anomaly.id)}
                        >
                          Investigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>
                  AI-powered predictions and forecasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.predictions.map(prediction => (
                    <div key={prediction.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{prediction.prediction_type}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {prediction.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>
                              Confidence: {(prediction.confidence_score * 100).toFixed(1)}%
                            </span>
                            <span>
                              Valid Until: {formatDate(prediction.valid_until)}
                            </span>
                            <Badge variant="outline">
                              {prediction.scope.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {typeof prediction.predicted_value === 'number' 
                              ? formatNumber(prediction.predicted_value)
                              : prediction.predicted_value
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Predicted Value
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            {/* Model Management */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">ML Model Management</h3>
                <p className="text-muted-foreground">
                  Manage and monitor AI/ML models
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={optimizeIntelligenceModels}
                  disabled={state.modelTrainingStatus.isTraining}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Models
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Train New Model
                </Button>
              </div>
            </div>

            {renderActiveModels()}

            {/* Model Training Status */}
            {state.modelTrainingStatus.isTraining && (
              <Card>
                <CardHeader>
                  <CardTitle>Model Training in Progress</CardTitle>
                  <CardDescription>
                    Training {state.modelTrainingStatus.modelType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{state.modelTrainingStatus.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={state.modelTrainingStatus.progress} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Epochs</p>
                        <p className="font-medium">
                          {state.modelTrainingStatus.epochsCompleted} / {state.modelTrainingStatus.totalEpochs}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Loss</p>
                        <p className="font-medium">
                          {state.modelTrainingStatus.currentLoss.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Best Loss</p>
                        <p className="font-medium">
                          {state.modelTrainingStatus.bestLoss.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Validation Accuracy</p>
                        <p className="font-medium">
                          {(state.modelTrainingStatus.validationAccuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    {state.modelTrainingStatus.estimatedCompletion && (
                      <p className="text-sm text-muted-foreground">
                        Estimated completion: {formatDate(state.modelTrainingStatus.estimatedCompletion)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {state.advancedMode && (
            <>
              <TabsContent value="correlations" className="space-y-6">
                {/* Cross-System Correlations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cross-System Correlations</CardTitle>
                    <CardDescription>
                      Detected correlations across different systems and data sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.correlations.map(correlation => (
                        <div key={correlation.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{correlation.correlation_type}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Strength: {(correlation.correlation_strength * 100).toFixed(1)}%
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                {correlation.involved_systems.map(system => (
                                  <Badge key={system} variant="outline">
                                    {system}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                {/* Security Threats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security Threat Detection</CardTitle>
                    <CardDescription>
                      AI-powered security threat identification and analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.securityThreats.map(threat => (
                        <div key={threat.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{threat.threat_type}</h4>
                                <Badge 
                                  variant={getSeverityColor(threat.severity)}
                                >
                                  {threat.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {threat.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span>
                                  Risk Score: {threat.risk_score.toFixed(2)}
                                </span>
                                <span>
                                  Detected: {formatDate(threat.detected_at)}
                                </span>
                                {threat.mitigated && (
                                  <Badge variant="outline" className="text-green-600">
                                    MITIGATED
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={threat.mitigated ? "outline" : "destructive"}
                              size="sm"
                            >
                              {threat.mitigated ? 'View' : 'Mitigate'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-6">
                {/* Compliance Violations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Violations</CardTitle>
                    <CardDescription>
                      Detected compliance issues and regulatory violations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.complianceViolations.map(violation => (
                        <div key={violation.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{violation.violation_type}</h4>
                                <Badge 
                                  variant={getSeverityColor(violation.severity)}
                                >
                                  {violation.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {violation.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span>
                                  Regulation: {violation.regulation_framework}
                                </span>
                                <span>
                                  Detected: {formatDate(violation.detected_at)}
                                </span>
                                {violation.resolved && (
                                  <Badge variant="outline" className="text-green-600">
                                    RESOLVED
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={violation.resolved ? "outline" : "destructive"}
                              size="sm"
                            >
                              {violation.resolved ? 'View' : 'Resolve'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Processing Status Overlay */}
        <AnimatePresence>
          {renderProcessingStatus()}
        </AnimatePresence>

        {/* Error Notifications */}
        <AnimatePresence>
          {state.errors.map(error => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <Alert className="w-80">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message}
                  {error.recoverable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => retryOperation(error.id)}
                    >
                      Retry
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Insight Details Sidebar */}
        <Sheet 
          open={!!state.selectedInsight} 
          onOpenChange={(open) => !open && dispatch({ type: 'SELECT_INSIGHT', payload: null })}
        >
          <SheetContent className="w-full sm:w-96">
            {state.selectedInsight && (
              <>
                <SheetHeader>
                  <SheetTitle>{state.selectedInsight.title}</SheetTitle>
                  <SheetDescription>
                    Insight Details and Recommendations
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {state.selectedInsight.description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendation</h4>
                    <p className="text-sm text-muted-foreground">
                      {state.selectedInsight.recommendation}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Impact Assessment</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Business Impact:</span>
                        <Badge variant="outline">
                          {state.selectedInsight.impact_assessment?.business_impact || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Technical Impact:</span>
                        <Badge variant="outline">
                          {state.selectedInsight.impact_assessment?.technical_impact || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <Badge variant="outline">
                          {state.selectedInsight.impact_assessment?.risk_level || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {state.selectedInsight.action_items?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Action Items</h4>
                      <div className="space-y-2">
                        {state.selectedInsight.action_items.map((item, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Checkbox />
                            <div className="flex-1">
                              <p className="text-sm">{item.action}</p>
                              <p className="text-xs text-muted-foreground">
                                Priority: {item.priority} | Due: {formatDate(item.due_date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        // Implement insight resolution
                        dispatch({ 
                          type: 'UPDATE_INSIGHT', 
                          payload: { 
                            ...state.selectedInsight!, 
                            status: 'resolved',
                            resolved_at: new Date().toISOString()
                          }
                        });
                        dispatch({ type: 'SELECT_INSIGHT', payload: null });
                        showSuccess('Insight marked as resolved');
                      }}
                    >
                      Mark Resolved
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Implement insight dismissal
                        dispatch({ 
                          type: 'UPDATE_INSIGHT', 
                          payload: { 
                            ...state.selectedInsight!, 
                            status: 'dismissed'
                          }
                        });
                        dispatch({ type: 'SELECT_INSIGHT', payload: null });
                        showSuccess('Insight dismissed');
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
};

export default ScanIntelligenceEngine;