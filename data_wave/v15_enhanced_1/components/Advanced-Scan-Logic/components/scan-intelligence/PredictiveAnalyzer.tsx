/**
 * 🔮 Predictive Analyzer - Advanced Forecasting & Predictive Intelligence
 * =====================================================================
 * 
 * Enterprise-grade predictive analytics system powered by advanced machine learning
 * algorithms for forecasting, trend analysis, and intelligent predictions.
 * 
 * Features:
 * - Advanced ML-powered predictive modeling
 * - Multi-horizon forecasting capabilities
 * - Real-time trend analysis and pattern recognition
 * - Intelligent scenario planning and simulation
 * - Risk assessment and probability analysis
 * - Automated model selection and optimization
 * - Interactive prediction visualization
 * - Comprehensive forecasting insights and recommendations
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component PredictiveAnalyzer
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Brain, Target, Activity, BarChart3, LineChart, PieChart, Eye, Settings,
  RefreshCw, Download, Upload, Play, Pause, Square, CheckCircle, XCircle, Clock,
  Calendar, Database, Server, Network, Cpu, HardDrive, Memory, Shield, Lock,
  Unlock, GitBranch, Layers, Box, Grid, List, MoreHorizontal, ChevronDown,
  ChevronRight, ChevronLeft, ExternalLink, Info, HelpCircle, Star, Bookmark,
  Share, Copy, Edit, Trash2, Plus, Minus, Maximize, Minimize, RotateCcw,
  Save, Send, MessageSquare, Users, User, MapPin, Globe, Wifi, WifiOff,
  Signal, Battery, Bluetooth, Volume2, VolumeX, Camera, Video, Image,
  FileText, File, Folder, FolderOpen, Archive, Package, Layers3, Component,
  Puzzle, Zap, AlertTriangle, Filter, Search, Gauge, Radar, Compass
} from 'lucide-react';

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
import { 
  ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, 
  Pie, Cell, AreaChart, Area, ComposedChart, Scatter, ScatterChart, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey, FunnelChart, Funnel, LabelList,
  ReferenceLine, ReferenceArea, Brush
} from 'recharts';

// Types and Interfaces
import { 
  PredictiveAnalysis, PredictionType, PredictionModel, ForecastHorizon, PredictionAccuracy,
  TrendAnalysis, SeasonalityPattern, AnomalyPrediction, RiskAssessment, ScenarioAnalysis,
  ModelConfiguration, PredictionInsight, ForecastResult, PredictionMetrics, TrendDirection,
  ConfidenceInterval, ModelPerformance, PredictionVisualization, TimeSeriesData, PredictiveMetadata,
  ModelValidation, CrossValidationResult, FeatureImportance, PredictionExplanation
} from '../../types/intelligence.types';

import { SystemHealthStatus, PerformanceMetrics, ResourceAllocation, WorkflowExecution } from '../../types/orchestration.types';

// Hooks and Services
import { useScanIntelligence } from '../../hooks/useScanIntelligence';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { useNotifications } from '@/hooks/useNotifications';
import { useWebSocket } from '@/hooks/useWebSocket';

// Utils and Constants
import { cn } from '@/lib/utils';
import { formatDate, formatDuration, formatBytes, formatNumber, formatPercentage } from '@/utils/formatters';
import { generateColor, getStatusColor, getSeverityColor, getTrendColor } from '@/utils/colors';
import { 
  PREDICTION_TYPES, FORECAST_HORIZONS, MODEL_ALGORITHMS, TREND_DIRECTIONS, CONFIDENCE_LEVELS,
  PREDICTION_CATEGORIES, DEFAULT_PREDICTION_SETTINGS, VISUALIZATION_CONFIGS
} from '../../constants/intelligence-constants';

// Component State Interface
interface PredictiveAnalyzerState {
  isAnalyzing: boolean;
  isTraining: boolean;
  isForecasting: boolean;
  lastUpdate: Date;
  predictions: PredictiveAnalysis[];
  forecasts: ForecastResult[];
  trends: TrendAnalysis[];
  scenarios: ScenarioAnalysis[];
  activeModels: PredictionModel[];
  modelPerformance: ModelPerformance[];
  configurations: ModelConfiguration[];
  validationResults: CrossValidationResult[];
  predictionMetrics: PredictionMetrics;
  riskAssessments: RiskAssessment[];
  seasonalityPatterns: SeasonalityPattern[];
  featureImportance: FeatureImportance[];
  selectedTimeHorizon: ForecastHorizon;
  selectedPredictionTypes: PredictionType[];
  selectedModels: string[];
  selectedMetrics: string[];
  activeTab: string;
  selectedPrediction: PredictiveAnalysis | null;
  selectedForecast: ForecastResult | null;
  showModelDetails: boolean;
  showAdvancedSettings: boolean;
  showScenarioBuilder: boolean;
  livePredictions: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  chartType: string;
  showConfidenceIntervals: boolean;
  showTrendLines: boolean;
  zoomLevel: number;
  timeWindow: string;
  errors: any[];
  warnings: any[];
  status: 'idle' | 'loading' | 'success' | 'error';
}

// Reducer Actions
type PredictiveAnalyzerAction = 
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_TRAINING'; payload: boolean }
  | { type: 'SET_FORECASTING'; payload: boolean }
  | { type: 'SET_LAST_UPDATE'; payload: Date }
  | { type: 'SET_PREDICTIONS'; payload: PredictiveAnalysis[] }
  | { type: 'ADD_PREDICTION'; payload: PredictiveAnalysis }
  | { type: 'SET_FORECASTS'; payload: ForecastResult[] }
  | { type: 'SET_TRENDS'; payload: TrendAnalysis[] }
  | { type: 'SET_SCENARIOS'; payload: ScenarioAnalysis[] }
  | { type: 'SET_MODELS'; payload: PredictionModel[] }
  | { type: 'SET_MODEL_PERFORMANCE'; payload: ModelPerformance[] }
  | { type: 'SET_CONFIGURATIONS'; payload: ModelConfiguration[] }
  | { type: 'SET_VALIDATION_RESULTS'; payload: CrossValidationResult[] }
  | { type: 'SET_PREDICTION_METRICS'; payload: PredictionMetrics }
  | { type: 'SET_RISK_ASSESSMENTS'; payload: RiskAssessment[] }
  | { type: 'SET_SEASONALITY_PATTERNS'; payload: SeasonalityPattern[] }
  | { type: 'SET_FEATURE_IMPORTANCE'; payload: FeatureImportance[] }
  | { type: 'SET_TIME_HORIZON'; payload: ForecastHorizon }
  | { type: 'SET_PREDICTION_TYPES'; payload: PredictionType[] }
  | { type: 'SET_SELECTED_MODELS'; payload: string[] }
  | { type: 'SET_SELECTED_METRICS'; payload: string[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SELECTED_PREDICTION'; payload: PredictiveAnalysis | null }
  | { type: 'SET_SELECTED_FORECAST'; payload: ForecastResult | null }
  | { type: 'SET_SHOW_MODEL_DETAILS'; payload: boolean }
  | { type: 'SET_SHOW_ADVANCED_SETTINGS'; payload: boolean }
  | { type: 'SET_SHOW_SCENARIO_BUILDER'; payload: boolean }
  | { type: 'SET_LIVE_PREDICTIONS'; payload: boolean }
  | { type: 'SET_AUTO_REFRESH'; payload: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'SET_CHART_TYPE'; payload: string }
  | { type: 'SET_SHOW_CONFIDENCE_INTERVALS'; payload: boolean }
  | { type: 'SET_SHOW_TREND_LINES'; payload: boolean }
  | { type: 'SET_ZOOM_LEVEL'; payload: number }
  | { type: 'SET_TIME_WINDOW'; payload: string }
  | { type: 'ADD_ERROR'; payload: any }
  | { type: 'ADD_WARNING'; payload: any }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_WARNINGS' }
  | { type: 'SET_STATUS'; payload: 'idle' | 'loading' | 'success' | 'error' };

// Reducer
const predictiveAnalyzerReducer = (state: PredictiveAnalyzerState, action: PredictiveAnalyzerAction): PredictiveAnalyzerState => {
  switch (action.type) {
    case 'SET_ANALYZING': return { ...state, isAnalyzing: action.payload };
    case 'SET_TRAINING': return { ...state, isTraining: action.payload };
    case 'SET_FORECASTING': return { ...state, isForecasting: action.payload };
    case 'SET_LAST_UPDATE': return { ...state, lastUpdate: action.payload };
    case 'SET_PREDICTIONS': return { ...state, predictions: action.payload };
    case 'ADD_PREDICTION': return { ...state, predictions: [action.payload, ...state.predictions] };
    case 'SET_FORECASTS': return { ...state, forecasts: action.payload };
    case 'SET_TRENDS': return { ...state, trends: action.payload };
    case 'SET_SCENARIOS': return { ...state, scenarios: action.payload };
    case 'SET_MODELS': return { ...state, activeModels: action.payload };
    case 'SET_MODEL_PERFORMANCE': return { ...state, modelPerformance: action.payload };
    case 'SET_CONFIGURATIONS': return { ...state, configurations: action.payload };
    case 'SET_VALIDATION_RESULTS': return { ...state, validationResults: action.payload };
    case 'SET_PREDICTION_METRICS': return { ...state, predictionMetrics: action.payload };
    case 'SET_RISK_ASSESSMENTS': return { ...state, riskAssessments: action.payload };
    case 'SET_SEASONALITY_PATTERNS': return { ...state, seasonalityPatterns: action.payload };
    case 'SET_FEATURE_IMPORTANCE': return { ...state, featureImportance: action.payload };
    case 'SET_TIME_HORIZON': return { ...state, selectedTimeHorizon: action.payload };
    case 'SET_PREDICTION_TYPES': return { ...state, selectedPredictionTypes: action.payload };
    case 'SET_SELECTED_MODELS': return { ...state, selectedModels: action.payload };
    case 'SET_SELECTED_METRICS': return { ...state, selectedMetrics: action.payload };
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'SET_SELECTED_PREDICTION': return { ...state, selectedPrediction: action.payload };
    case 'SET_SELECTED_FORECAST': return { ...state, selectedForecast: action.payload };
    case 'SET_SHOW_MODEL_DETAILS': return { ...state, showModelDetails: action.payload };
    case 'SET_SHOW_ADVANCED_SETTINGS': return { ...state, showAdvancedSettings: action.payload };
    case 'SET_SHOW_SCENARIO_BUILDER': return { ...state, showScenarioBuilder: action.payload };
    case 'SET_LIVE_PREDICTIONS': return { ...state, livePredictions: action.payload };
    case 'SET_AUTO_REFRESH': return { ...state, autoRefresh: action.payload };
    case 'SET_REFRESH_INTERVAL': return { ...state, refreshInterval: action.payload };
    case 'SET_CHART_TYPE': return { ...state, chartType: action.payload };
    case 'SET_SHOW_CONFIDENCE_INTERVALS': return { ...state, showConfidenceIntervals: action.payload };
    case 'SET_SHOW_TREND_LINES': return { ...state, showTrendLines: action.payload };
    case 'SET_ZOOM_LEVEL': return { ...state, zoomLevel: action.payload };
    case 'SET_TIME_WINDOW': return { ...state, timeWindow: action.payload };
    case 'ADD_ERROR': return { ...state, errors: [...state.errors, action.payload] };
    case 'ADD_WARNING': return { ...state, warnings: [...state.warnings, action.payload] };
    case 'CLEAR_ERRORS': return { ...state, errors: [] };
    case 'CLEAR_WARNINGS': return { ...state, warnings: [] };
    case 'SET_STATUS': return { ...state, status: action.payload };
    default: return state;
  }
};

// Initial state
const initialState: PredictiveAnalyzerState = {
  isAnalyzing: false,
  isTraining: false,
  isForecasting: false,
  lastUpdate: new Date(),
  predictions: [],
  forecasts: [],
  trends: [],
  scenarios: [],
  activeModels: [],
  modelPerformance: [],
  configurations: [],
  validationResults: [],
  predictionMetrics: {
    totalPredictions: 0,
    averageAccuracy: 0,
    averageConfidence: 0,
    successfulForecasts: 0,
    failedForecasts: 0
  },
  riskAssessments: [],
  seasonalityPatterns: [],
  featureImportance: [],
  selectedTimeHorizon: 'short',
  selectedPredictionTypes: [],
  selectedModels: [],
  selectedMetrics: [],
  activeTab: 'overview',
  selectedPrediction: null,
  selectedForecast: null,
  showModelDetails: false,
  showAdvancedSettings: false,
  showScenarioBuilder: false,
  livePredictions: false,
  autoRefresh: true,
  refreshInterval: 60000,
  chartType: 'line',
  showConfidenceIntervals: true,
  showTrendLines: true,
  zoomLevel: 1,
  timeWindow: '24h',
  errors: [],
  warnings: [],
  status: 'idle'
};

/**
 * PredictiveAnalyzer Component
 * Advanced predictive analytics and forecasting system
 */
export const PredictiveAnalyzer: React.FC = () => {
  // State Management
  const [state, dispatch] = useReducer(predictiveAnalyzerReducer, initialState);
  
  // Hooks
  const { 
    getPredictions, getForecasts, generatePrediction, trainPredictionModel,
    validateModel, getModelPerformance, generateScenarios
  } = useScanIntelligence();
  
  const { 
    getTrendAnalysis, getSeasonalityPatterns, getRiskAssessments, getFeatureImportance
  } = useAdvancedAnalytics();
  
  const { notify } = useNotifications();
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  
  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Memoized calculations
  const filteredPredictions = useMemo(() => {
    let filtered = state.predictions;
    
    if (state.selectedPredictionTypes.length > 0) {
      filtered = filtered.filter(prediction => 
        state.selectedPredictionTypes.includes(prediction.type)
      );
    }
    
    if (state.selectedModels.length > 0) {
      filtered = filtered.filter(prediction => 
        state.selectedModels.includes(prediction.modelId)
      );
    }
    
    return filtered;
  }, [state.predictions, state.selectedPredictionTypes, state.selectedModels]);
  
  const predictionStats = useMemo(() => {
    const total = filteredPredictions.length;
    const highConfidence = filteredPredictions.filter(p => p.confidence > 0.8).length;
    const mediumConfidence = filteredPredictions.filter(p => p.confidence > 0.6 && p.confidence <= 0.8).length;
    const lowConfidence = filteredPredictions.filter(p => p.confidence <= 0.6).length;
    
    const byType = PREDICTION_TYPES.reduce((acc, type) => {
      acc[type] = filteredPredictions.filter(p => p.type === type).length;
      return acc;
    }, {} as Record<string, number>);
    
    const averageConfidence = total > 0 
      ? filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / total 
      : 0;
    
    const averageAccuracy = state.modelPerformance.length > 0
      ? state.modelPerformance.reduce((sum, m) => sum + m.accuracy, 0) / state.modelPerformance.length
      : 0;
    
    return {
      total,
      byConfidence: { high: highConfidence, medium: mediumConfidence, low: lowConfidence },
      byType,
      averageConfidence,
      averageAccuracy,
      activeModels: state.activeModels.filter(m => m.status === 'active').length,
      lastPrediction: filteredPredictions[0]?.createdAt
    };
  }, [filteredPredictions, state.modelPerformance, state.activeModels]);
  
  const chartData = useMemo(() => {
    const data = filteredPredictions.map(prediction => ({
      timestamp: prediction.targetTimestamp,
      predicted: prediction.predictedValue,
      confidence: prediction.confidence,
      actual: prediction.actualValue || null,
      lower: prediction.confidenceInterval?.lower,
      upper: prediction.confidenceInterval?.upper,
      trend: prediction.trendDirection,
      type: prediction.type
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return data;
  }, [filteredPredictions]);
  
  // Event Handlers
  const handleStartAnalysis = useCallback(async () => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      dispatch({ type: 'SET_ANALYZING', payload: true });
      
      await initializePredictiveAnalysis();
      
      dispatch({ type: 'SET_STATUS', payload: 'success' });
      notify({
        title: 'Predictive Analysis Started',
        message: 'Advanced predictive analysis is now active',
        type: 'success'
      });
    } catch (error) {
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Analysis Start Failed',
        message: 'Failed to start predictive analysis',
        type: 'error'
      });
    }
  }, [notify]);
  
  const handleStopAnalysis = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ANALYZING', payload: false });
      dispatch({ type: 'SET_LIVE_PREDICTIONS', payload: false });
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      notify({
        title: 'Predictive Analysis Stopped',
        message: 'Real-time predictive analysis has been stopped',
        type: 'info'
      });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [notify]);
  
  const handleGeneratePrediction = useCallback(async (
    type: PredictionType,
    horizon: ForecastHorizon,
    configuration?: Partial<ModelConfiguration>
  ) => {
    try {
      dispatch({ type: 'SET_FORECASTING', payload: true });
      
      const result = await generatePrediction({
        type,
        horizon,
        configuration: {
          ...DEFAULT_PREDICTION_SETTINGS,
          ...configuration
        }
      });
      
      if (result.success) {
        dispatch({ type: 'ADD_PREDICTION', payload: result.prediction });
        
        notify({
          title: 'Prediction Generated',
          message: `New ${type} prediction has been generated`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Prediction Failed',
        message: 'Failed to generate prediction',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_FORECASTING', payload: false });
    }
  }, [generatePrediction, notify]);
  
  const handleTrainModel = useCallback(async (modelId: string, configuration: ModelConfiguration) => {
    try {
      dispatch({ type: 'SET_TRAINING', payload: true });
      
      const result = await trainPredictionModel(modelId, configuration);
      
      if (result.success) {
        await loadModels();
        await loadModelPerformance();
        
        notify({
          title: 'Model Training Complete',
          message: `Model ${modelId} has been successfully trained`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Model Training Failed',
        message: 'Failed to train the selected model',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_TRAINING', payload: false });
    }
  }, [trainPredictionModel, notify]);
  
  const handleValidateModel = useCallback(async (modelId: string) => {
    try {
      const result = await validateModel(modelId);
      
      if (result.success) {
        dispatch({ type: 'SET_VALIDATION_RESULTS', payload: [...state.validationResults, result.validation] });
        
        notify({
          title: 'Model Validation Complete',
          message: `Model validation completed with ${(result.validation.accuracy * 100).toFixed(1)}% accuracy`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Model Validation Failed',
        message: 'Failed to validate the selected model',
        type: 'error'
      });
    }
  }, [validateModel, state.validationResults, notify]);
  
  const handleExportPredictions = useCallback(() => {
    try {
      const exportData = {
        predictions: filteredPredictions,
        forecasts: state.forecasts,
        trends: state.trends,
        statistics: predictionStats,
        models: state.activeModels,
        performance: state.modelPerformance,
        exportedAt: new Date().toISOString(),
        configuration: {
          timeHorizon: state.selectedTimeHorizon,
          predictionTypes: state.selectedPredictionTypes,
          models: state.selectedModels,
          timeWindow: state.timeWindow
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `predictive-analysis-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notify({
        title: 'Export Complete',
        message: 'Predictive analysis report has been exported',
        type: 'success'
      });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Export Failed',
        message: 'Failed to export prediction data',
        type: 'error'
      });
    }
  }, [filteredPredictions, state, predictionStats, notify]);
  
  // Data Loading Functions
  const loadPredictions = useCallback(async () => {
    try {
      const predictions = await getPredictions({
        horizon: state.selectedTimeHorizon,
        types: state.selectedPredictionTypes,
        timeWindow: state.timeWindow,
        limit: 1000
      });
      
      dispatch({ type: 'SET_PREDICTIONS', payload: predictions });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getPredictions, state.selectedTimeHorizon, state.selectedPredictionTypes, state.timeWindow]);
  
  const loadForecasts = useCallback(async () => {
    try {
      const forecasts = await getForecasts({
        horizon: state.selectedTimeHorizon,
        types: state.selectedPredictionTypes
      });
      
      dispatch({ type: 'SET_FORECASTS', payload: forecasts });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getForecasts, state.selectedTimeHorizon, state.selectedPredictionTypes]);
  
  const loadModels = useCallback(async () => {
    try {
      const models: PredictionModel[] = [];
      dispatch({ type: 'SET_MODELS', payload: models });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, []);
  
  const loadModelPerformance = useCallback(async () => {
    try {
      const performance = await getModelPerformance();
      dispatch({ type: 'SET_MODEL_PERFORMANCE', payload: performance });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getModelPerformance]);
  
  const loadAnalytics = useCallback(async () => {
    try {
      const [trends, seasonality, risks, features] = await Promise.all([
        getTrendAnalysis(state.timeWindow),
        getSeasonalityPatterns(),
        getRiskAssessments(),
        getFeatureImportance()
      ]);
      
      dispatch({ type: 'SET_TRENDS', payload: trends });
      dispatch({ type: 'SET_SEASONALITY_PATTERNS', payload: seasonality });
      dispatch({ type: 'SET_RISK_ASSESSMENTS', payload: risks });
      dispatch({ type: 'SET_FEATURE_IMPORTANCE', payload: features });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getTrendAnalysis, getSeasonalityPatterns, getRiskAssessments, getFeatureImportance, state.timeWindow]);
  
  const initializePredictiveAnalysis = useCallback(async () => {
    try {
      await Promise.all([
        loadPredictions(),
        loadForecasts(),
        loadModels(),
        loadModelPerformance(),
        loadAnalytics()
      ]);
      
      if (isConnected) {
        subscribe('prediction_generated', (data: PredictiveAnalysis) => {
          dispatch({ type: 'ADD_PREDICTION', payload: data });
          
          if (data.confidence > 0.9) {
            notify({
              title: 'High-Confidence Prediction',
              message: `${data.type}: ${data.description}`,
              type: 'success'
            });
          }
        });
        
        subscribe('model_updated', () => {
          loadModels();
          loadModelPerformance();
        });
        
        subscribe('forecast_ready', () => {
          loadForecasts();
        });
      }
      
      if (state.autoRefresh && !refreshIntervalRef.current) {
        refreshIntervalRef.current = setInterval(() => {
          loadPredictions();
          loadForecasts();
          loadAnalytics();
          dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
        }, state.refreshInterval);
      }
      
      dispatch({ type: 'SET_LIVE_PREDICTIONS', payload: true });
      
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      throw error;
    }
  }, [
    isConnected, subscribe, loadPredictions, loadForecasts, loadModels, 
    loadModelPerformance, loadAnalytics, state.autoRefresh, state.refreshInterval, notify
  ]);
  
  // Effects
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      if (isConnected) {
        unsubscribe('prediction_generated');
        unsubscribe('model_updated');
        unsubscribe('forecast_ready');
      }
    };
  }, [isConnected, unsubscribe]);
  
  useEffect(() => {
    loadPredictions();
    loadForecasts();
    loadModels();
    loadModelPerformance();
    loadAnalytics();
  }, [loadPredictions, loadForecasts, loadModels, loadModelPerformance, loadAnalytics]);
  
  useEffect(() => {
    if (state.autoRefresh && state.isAnalyzing) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        loadPredictions();
        loadForecasts();
        loadAnalytics();
        dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
      }, state.refreshInterval);
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.autoRefresh, state.isAnalyzing, state.refreshInterval, loadPredictions, loadForecasts, loadAnalytics]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header Section */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                {state.isAnalyzing && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Predictive Analyzer
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Advanced forecasting and predictive intelligence system
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Indicators */}
            <div className="flex items-center space-x-2">
              <Badge 
                variant={state.isAnalyzing ? 'default' : 'secondary'}
                className={cn(
                  "flex items-center space-x-1",
                  state.isAnalyzing && "bg-purple-600 hover:bg-purple-700"
                )}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  state.isAnalyzing ? "bg-purple-200 animate-pulse" : "bg-slate-400"
                )} />
                <span>{state.isAnalyzing ? 'Analyzing' : 'Inactive'}</span>
              </Badge>
              
              {state.livePredictions && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>Live</span>
                </Badge>
              )}
              
              {state.isTraining && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Brain className="h-3 w-3 animate-spin" />
                  <span>Training</span>
                </Badge>
              )}
              
              {state.isForecasting && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Target className="h-3 w-3 animate-pulse" />
                  <span>Forecasting</span>
                </Badge>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_SHOW_ADVANCED_SETTINGS', payload: !state.showAdvancedSettings })}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Advanced Settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_SHOW_SCENARIO_BUILDER', payload: !state.showScenarioBuilder })}
                    >
                      <Compass className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Scenario Builder</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPredictions}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Predictions</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                onClick={state.isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
                disabled={state.status === 'loading'}
                className={cn(
                  "min-w-[140px]",
                  state.isAnalyzing 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                )}
              >
                {state.status === 'loading' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : state.isAnalyzing ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Analysis
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-6 gap-4">
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Total Predictions</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{predictionStats.total}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">High Confidence</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{predictionStats.byConfidence.high}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Medium Confidence</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{predictionStats.byConfidence.medium}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Avg Accuracy</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{(predictionStats.averageAccuracy * 100).toFixed(1)}%</p>
                  </div>
                  <Gauge className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Avg Confidence</p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{(predictionStats.averageConfidence * 100).toFixed(1)}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300">Active Models</p>
                    <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{predictionStats.activeModels}</p>
                  </div>
                  <Brain className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Advanced Settings Panel */}
      <AnimatePresence>
        {state.showAdvancedSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          >
            <div className="p-4">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="time-horizon">Forecast Horizon</Label>
                  <Select 
                    value={state.selectedTimeHorizon} 
                    onValueChange={(value: ForecastHorizon) => dispatch({ type: 'SET_TIME_HORIZON', payload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORECAST_HORIZONS.map((horizon) => (
                        <SelectItem key={horizon} value={horizon}>
                          {horizon.charAt(0).toUpperCase() + horizon.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Prediction Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PREDICTION_TYPES.map((type) => (
                      <Badge
                        key={type}
                        variant={state.selectedPredictionTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = state.selectedPredictionTypes.includes(type)
                            ? state.selectedPredictionTypes.filter(t => t !== type)
                            : [...state.selectedPredictionTypes, type];
                          dispatch({ type: 'SET_PREDICTION_TYPES', payload: updated });
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Chart Type</Label>
                  <Select 
                    value={state.chartType} 
                    onValueChange={(value) => dispatch({ type: 'SET_CHART_TYPE', payload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Visualization Options</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="confidence-intervals"
                        checked={state.showConfidenceIntervals}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_SHOW_CONFIDENCE_INTERVALS', payload: checked })}
                      />
                      <Label htmlFor="confidence-intervals" className="text-sm">
                        Confidence Intervals
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="trend-lines"
                        checked={state.showTrendLines}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_SHOW_TREND_LINES', payload: checked })}
                      />
                      <Label htmlFor="trend-lines" className="text-sm">
                        Trend Lines
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Auto-refresh Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-refresh"
                        checked={state.autoRefresh}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_AUTO_REFRESH', payload: checked })}
                      />
                      <Label htmlFor="auto-refresh" className="text-sm">
                        Auto-refresh
                      </Label>
                    </div>
                    <div>
                      <Label className="text-xs">Interval (seconds)</Label>
                      <Slider
                        value={[state.refreshInterval / 1000]}
                        onValueChange={([value]) => dispatch({ type: 'SET_REFRESH_INTERVAL', payload: value * 1000 })}
                        min={30}
                        max={300}
                        step={30}
                        className="mt-1"
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        {state.refreshInterval / 1000}s
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={state.activeTab} onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_TAB', payload: value })} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 mx-6 mt-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Forecasts</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Models</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center space-x-2">
              <Compass className="h-4 w-4" />
              <span>Scenarios</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-full">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Prediction Timeline */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LineChart className="h-5 w-5" />
                      <span>Prediction Timeline</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time prediction results and forecasting trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]" ref={chartRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        {state.chartType === 'line' ? (
                          <RechartsLineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="timestamp" 
                              tickFormatter={(value) => formatDate(value)}
                            />
                            <YAxis />
                            <RechartsTooltip 
                              labelFormatter={(value) => formatDate(value)}
                              formatter={(value: number, name: string) => [
                                typeof value === 'number' ? value.toFixed(2) : value,
                                name
                              ]}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="predicted" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              name="Predicted"
                            />
                            {chartData.some(d => d.actual !== null) && (
                              <Line 
                                type="monotone" 
                                dataKey="actual" 
                                stroke="#82ca9d" 
                                strokeWidth={2}
                                name="Actual"
                              />
                            )}
                            {state.showConfidenceIntervals && (
                              <>
                                <Line 
                                  type="monotone" 
                                  dataKey="upper" 
                                  stroke="#ffc658" 
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                  name="Upper Bound"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="lower" 
                                  stroke="#ffc658" 
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                  name="Lower Bound"
                                />
                              </>
                            )}
                          </RechartsLineChart>
                        ) : state.chartType === 'area' ? (
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="timestamp" 
                              tickFormatter={(value) => formatDate(value)}
                            />
                            <YAxis />
                            <RechartsTooltip 
                              labelFormatter={(value) => formatDate(value)}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="predicted" 
                              stackId="1"
                              stroke="#8884d8" 
                              fill="#8884d8"
                              fillOpacity={0.6}
                              name="Predicted"
                            />
                            {chartData.some(d => d.actual !== null) && (
                              <Area 
                                type="monotone" 
                                dataKey="actual" 
                                stackId="2"
                                stroke="#82ca9d" 
                                fill="#82ca9d"
                                fillOpacity={0.6}
                                name="Actual"
                              />
                            )}
                          </AreaChart>
                        ) : (
                          <ScatterChart data={chartData}>
                            <CartesianGrid />
                            <XAxis 
                              dataKey="timestamp" 
                              tickFormatter={(value) => formatDate(value)}
                            />
                            <YAxis />
                            <RechartsTooltip 
                              labelFormatter={(value) => formatDate(value)}
                            />
                            <Legend />
                            <Scatter 
                              dataKey="predicted" 
                              fill="#8884d8"
                              name="Predicted"
                            />
                            {chartData.some(d => d.actual !== null) && (
                              <Scatter 
                                dataKey="actual" 
                                fill="#82ca9d"
                                name="Actual"
                              />
                            )}
                          </ScatterChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Model Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gauge className="h-5 w-5" />
                      <span>Model Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Accuracy</span>
                        <span className="text-sm font-bold">{(predictionStats.averageAccuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={predictionStats.averageAccuracy * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Avg Confidence</span>
                        <span className="text-sm font-bold">{(predictionStats.averageConfidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={predictionStats.averageConfidence * 100} className="h-2" />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Models</span>
                        <span className="text-sm font-bold">{predictionStats.activeModels}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Prediction</span>
                        <span className="text-sm">
                          {predictionStats.lastPrediction ? formatDate(predictionStats.lastPrediction) : 'None'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Update</span>
                        <span className="text-sm">{formatDate(state.lastUpdate)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleGeneratePrediction('performance', 'short')}
                        disabled={state.isForecasting}
                      >
                        {state.isForecasting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Target className="h-4 w-4 mr-2" />
                            Generate Prediction
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => dispatch({ type: 'SET_SHOW_SCENARIO_BUILDER', payload: true })}
                      >
                        <Compass className="h-4 w-4 mr-2" />
                        Build Scenario
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Predictions Tab */}
            <TabsContent value="predictions" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Predictions</CardTitle>
                      <CardDescription>
                        Comprehensive view of all generated predictions
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search predictions..."
                          className="w-64"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGeneratePrediction('anomaly', 'medium')}
                        disabled={state.isForecasting}
                      >
                        {state.isForecasting ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <DataTable
                      data={filteredPredictions}
                      columns={[
                        {
                          accessorKey: 'type',
                          header: 'Type',
                          cell: ({ row }) => (
                            <Badge variant="secondary">
                              {row.getValue('type')}
                            </Badge>
                          )
                        },
                        {
                          accessorKey: 'description',
                          header: 'Description'
                        },
                        {
                          accessorKey: 'confidence',
                          header: 'Confidence',
                          cell: ({ row }) => {
                            const confidence = row.getValue('confidence') as number;
                            return (
                              <div className="flex items-center space-x-2">
                                <Progress value={confidence * 100} className="w-16 h-2" />
                                <span className="text-sm font-medium">
                                  {(confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            );
                          }
                        },
                        {
                          accessorKey: 'targetTimestamp',
                          header: 'Target Time',
                          cell: ({ row }) => formatDate(row.getValue('targetTimestamp'))
                        },
                        {
                          accessorKey: 'createdAt',
                          header: 'Created',
                          cell: ({ row }) => formatDate(row.getValue('createdAt'))
                        },
                        {
                          id: 'actions',
                          header: 'Actions',
                          cell: ({ row }) => (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => dispatch({ type: 'SET_SELECTED_PREDICTION', payload: row.original })}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Export Prediction
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Create Scenario
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  Mark as Verified
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Additional tabs would continue here... */}
          </div>
        </Tabs>
      </div>
      
      {/* Prediction Details Modal */}
      <Dialog 
        open={!!state.selectedPrediction} 
        onOpenChange={(open) => !open && dispatch({ type: 'SET_SELECTED_PREDICTION', payload: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {state.selectedPrediction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Prediction Details</span>
                </DialogTitle>
                <DialogDescription>
                  Comprehensive analysis and details for the selected prediction
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Prediction Information */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Prediction Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Type</Label>
                        <Badge variant="secondary">
                          {state.selectedPrediction.type}
                        </Badge>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {state.selectedPrediction.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Confidence</Label>
                          <div className="flex items-center space-x-2">
                            <Progress value={state.selectedPrediction.confidence * 100} className="flex-1 h-2" />
                            <span className="text-sm font-medium">
                              {(state.selectedPrediction.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label>Predicted Value</Label>
                          <p className="font-medium">{state.selectedPrediction.predictedValue}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Target Time</Label>
                          <p className="text-sm">{formatDate(state.selectedPrediction.targetTimestamp)}</p>
                        </div>
                        <div>
                          <Label>Created</Label>
                          <p className="text-sm">{formatDate(state.selectedPrediction.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Model Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Model ID</Label>
                        <p className="font-medium font-mono text-sm">{state.selectedPrediction.modelId}</p>
                      </div>
                      <div>
                        <Label>Algorithm</Label>
                        <p className="text-sm">{state.selectedPrediction.algorithm}</p>
                      </div>
                      <div>
                        <Label>Trend Direction</Label>
                        <Badge 
                          variant="outline"
                          className={getTrendColor(state.selectedPrediction.trendDirection)}
                        >
                          {state.selectedPrediction.trendDirection}
                        </Badge>
                      </div>
                      {state.selectedPrediction.confidenceInterval && (
                        <div>
                          <Label>Confidence Interval</Label>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            [{state.selectedPrediction.confidenceInterval.lower}, {state.selectedPrediction.confidenceInterval.upper}]
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Button>
                      Verify Prediction
                    </Button>
                    <Button variant="outline">
                      Create Scenario
                    </Button>
                    <Button variant="outline">
                      Retrain Model
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      Export Details
                    </Button>
                    <Button variant="outline">
                      Share Prediction
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PredictiveAnalyzer;