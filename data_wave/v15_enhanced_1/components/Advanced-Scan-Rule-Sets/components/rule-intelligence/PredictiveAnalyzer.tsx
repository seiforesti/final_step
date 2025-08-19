import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Brain,
  Zap,
  Crystal,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  Copy,
  MoreHorizontal,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
  Sparkles,
  Database,
  Cpu,
  Memory,
  Network,
  Gauge,
  Layers,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { intelligenceAPI } from '../../services/intelligence-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';

// Types
import type { 
  Prediction,
  PredictiveModel,
  ForecastData,
  TrendAnalysis,
  PredictionMetrics,
  Forecast,
  PredictionAccuracy,
  ModelPerformance,
  TimeSeriesData,
  PredictiveInsight,
  ScenarioAnalysis,
  PredictionConfiguration,
  MachineLearningModel,
  FeatureImportance,
  ModelTraining,
  PredictionAlert,
  TrendIndicator,
  SeasonalPattern,
  AnomalyPrediction,
  RiskPrediction,
  PerformancePrediction,
  BusinessPrediction,
  ModelValidation,
  ForecastAccuracy
} from '../../types/intelligence.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { performanceCalculator } from '../../utils/performance-calculator';
import { statisticalAnalyzer } from '../../utils/statistical-analyzer';

interface PredictiveAnalyzerProps {
  className?: string;
  onPredictionGenerated?: (prediction: Prediction) => void;
  onTrendDetected?: (trend: TrendAnalysis) => void;
  onAlertTriggered?: (alert: PredictionAlert) => void;
}

interface PredictiveAnalyzerState {
  predictions: Prediction[];
  models: PredictiveModel[];
  forecasts: Forecast[];
  trends: TrendAnalysis[];
  insights: PredictiveInsight[];
  scenarios: ScenarioAnalysis[];
  metrics: PredictionMetrics;
  alerts: PredictionAlert[];
  timeSeriesData: TimeSeriesData[];
  modelPerformance: ModelPerformance[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalPredictions: number;
  activePredictions: number;
  accurateModels: number;
  trendsDetected: number;
  alertsGenerated: number;
  averageAccuracy: number;
  modelsTraining: number;
  forecastsGenerated: number;
  insightsGenerated: number;
  scenariosAnalyzed: number;
}

interface PredictiveViewState {
  currentView: 'overview' | 'predictions' | 'forecasts' | 'trends' | 'models' | 'scenarios';
  selectedPrediction?: Prediction;
  selectedModel?: PredictiveModel;
  selectedForecast?: Forecast;
  predictionType: 'performance' | 'risk' | 'trend' | 'anomaly' | 'business' | 'all';
  timeHorizon: 'short' | 'medium' | 'long';
  confidenceLevel: number;
  autoPrediction: boolean;
  realTimeMode: boolean;
  alertsEnabled: boolean;
  showConfidenceIntervals: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'day' | 'week' | 'month' | 'quarter' | 'year';
  filterAccuracy: string;
  modelType: string;
}

const DEFAULT_VIEW_STATE: PredictiveViewState = {
  currentView: 'overview',
  predictionType: 'all',
  timeHorizon: 'medium',
  confidenceLevel: 0.8,
  autoPrediction: true,
  realTimeMode: true,
  alertsEnabled: true,
  showConfidenceIntervals: true,
  searchQuery: '',
  sortBy: 'accuracy',
  sortOrder: 'desc',
  selectedTimeRange: 'month',
  filterAccuracy: 'all',
  modelType: 'all'
};

const PREDICTION_TYPES = [
  { value: 'all', label: 'All Types', icon: Target, description: 'All prediction types' },
  { value: 'performance', label: 'Performance', icon: Gauge, description: 'Performance predictions' },
  { value: 'risk', label: 'Risk', icon: AlertTriangle, description: 'Risk assessments' },
  { value: 'trend', label: 'Trend', icon: TrendingUp, description: 'Trend analysis' },
  { value: 'anomaly', label: 'Anomaly', icon: Eye, description: 'Anomaly detection' },
  { value: 'business', label: 'Business', icon: BarChart3, description: 'Business metrics' }
];

const TIME_HORIZONS = [
  { value: 'short', label: 'Short Term', period: '1-7 days', color: 'green' },
  { value: 'medium', label: 'Medium Term', period: '1-4 weeks', color: 'blue' },
  { value: 'long', label: 'Long Term', period: '1-12 months', color: 'purple' }
];

const MODEL_TYPES = [
  { value: 'linear_regression', label: 'Linear Regression', accuracy: 0.85 },
  { value: 'random_forest', label: 'Random Forest', accuracy: 0.92 },
  { value: 'lstm', label: 'LSTM Neural Network', accuracy: 0.94 },
  { value: 'arima', label: 'ARIMA', accuracy: 0.88 },
  { value: 'prophet', label: 'Facebook Prophet', accuracy: 0.91 },
  { value: 'xgboost', label: 'XGBoost', accuracy: 0.93 },
  { value: 'ensemble', label: 'Ensemble Model', accuracy: 0.96 }
];

const ACCURACY_RANGES = [
  { value: 'excellent', label: 'Excellent (90%+)', color: 'text-green-600 bg-green-100', min: 0.9 },
  { value: 'good', label: 'Good (80-90%)', color: 'text-blue-600 bg-blue-100', min: 0.8 },
  { value: 'fair', label: 'Fair (70-80%)', color: 'text-yellow-600 bg-yellow-100', min: 0.7 },
  { value: 'poor', label: 'Poor (<70%)', color: 'text-red-600 bg-red-100', min: 0 }
];

export const PredictiveAnalyzer: React.FC<PredictiveAnalyzerProps> = ({
  className,
  onPredictionGenerated,
  onTrendDetected,
  onAlertTriggered
}) => {
  // State Management
  const [viewState, setViewState] = useState<PredictiveViewState>(DEFAULT_VIEW_STATE);
  const [analyzerState, setAnalyzerState] = useState<PredictiveAnalyzerState>({
    predictions: [],
    models: [],
    forecasts: [],
    trends: [],
    insights: [],
    scenarios: [],
    metrics: {} as PredictionMetrics,
    alerts: [],
    timeSeriesData: [],
    modelPerformance: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalPredictions: 0,
    activePredictions: 0,
    accurateModels: 0,
    trendsDetected: 0,
    alertsGenerated: 0,
    averageAccuracy: 0,
    modelsTraining: 0,
    forecastsGenerated: 0,
    insightsGenerated: 0,
    scenariosAnalyzed: 0
  });

  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Form States
  const [predictionForm, setPredictionForm] = useState({
    modelId: '',
    predictionType: 'performance',
    targetMetric: '',
    timeHorizon: 'medium',
    confidenceLevel: 0.8,
    includeUncertainty: true,
    generateInsights: true,
    alertThresholds: [] as number[]
  });

  const [forecastForm, setForecastForm] = useState({
    dataSource: 'scan_rules',
    forecastPeriod: '30',
    granularity: 'daily',
    includeSeasonality: true,
    includeHolidays: false,
    scenarios: ['optimistic', 'realistic', 'pessimistic']
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const predictionIntervalRef = useRef<NodeJS.Timeout>();
  const streamingRef = useRef<boolean>(false);

  // Custom Hooks
  const {
    getInsights,
    analyzePerformance,
    generatePredictions,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    scanRules,
    ruleSets,
    getRules,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMode) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/predictive-analysis`);
      
      wsRef.current.onopen = () => {
        console.log('Predictive Analysis WebSocket connected');
        streamingRef.current = true;
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Predictive Analysis WebSocket error:', error);
        streamingRef.current = false;
      };

      wsRef.current.onclose = () => {
        console.log('Predictive Analysis WebSocket disconnected');
        streamingRef.current = false;
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        streamingRef.current = false;
      }
    };
  }, [viewState.realTimeMode]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'prediction_generated':
        setAnalyzerState(prev => ({
          ...prev,
          predictions: [...prev.predictions, data.prediction],
          totalPredictions: prev.totalPredictions + 1,
          activePredictions: prev.activePredictions + 1
        }));
        if (onPredictionGenerated) onPredictionGenerated(data.prediction);
        break;
      case 'trend_detected':
        setAnalyzerState(prev => ({
          ...prev,
          trends: [...prev.trends, data.trend],
          trendsDetected: prev.trendsDetected + 1
        }));
        if (onTrendDetected) onTrendDetected(data.trend);
        break;
      case 'forecast_completed':
        setAnalyzerState(prev => ({
          ...prev,
          forecasts: [...prev.forecasts, data.forecast],
          forecastsGenerated: prev.forecastsGenerated + 1
        }));
        break;
      case 'insight_generated':
        setAnalyzerState(prev => ({
          ...prev,
          insights: [...prev.insights, data.insight],
          insightsGenerated: prev.insightsGenerated + 1
        }));
        break;
      case 'alert_triggered':
        setAnalyzerState(prev => ({
          ...prev,
          alerts: [...prev.alerts, data.alert],
          alertsGenerated: prev.alertsGenerated + 1
        }));
        if (onAlertTriggered && viewState.alertsEnabled) onAlertTriggered(data.alert);
        break;
      case 'model_trained':
        setAnalyzerState(prev => ({
          ...prev,
          models: prev.models.map(model => 
            model.id === data.model.id ? data.model : model
          ),
          modelsTraining: prev.modelsTraining - 1
        }));
        break;
      case 'metrics_updated':
        setAnalyzerState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onPredictionGenerated, onTrendDetected, onAlertTriggered, viewState.alertsEnabled]);

  // Auto-prediction generation
  useEffect(() => {
    if (viewState.autoPrediction) {
      predictionIntervalRef.current = setInterval(() => {
        generateAutomaticPredictions();
      }, 300000); // Every 5 minutes
    }

    return () => {
      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
      }
    };
  }, [viewState.autoPrediction]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setAnalyzerState(prev => ({ ...prev, loading: true, error: null }));

      const [predictionsData, modelsData, forecastsData, trendsData, metricsData] = await Promise.all([
        intelligenceAPI.getPredictions({ 
          type: viewState.predictionType !== 'all' ? viewState.predictionType : undefined,
          timeHorizon: viewState.timeHorizon,
          timeRange: viewState.selectedTimeRange
        }),
        intelligenceAPI.getPredictiveModels(),
        intelligenceAPI.getForecasts({ timeRange: viewState.selectedTimeRange }),
        intelligenceAPI.getTrendAnalyses(),
        intelligenceAPI.getPredictionMetrics()
      ]);

      setAnalyzerState(prev => ({
        ...prev,
        predictions: predictionsData.predictions,
        models: modelsData.models,
        forecasts: forecastsData.forecasts,
        trends: trendsData.trends,
        metrics: metricsData,
        totalPredictions: predictionsData.total,
        activePredictions: predictionsData.predictions.filter(p => p.status === 'active').length,
        forecastsGenerated: forecastsData.total,
        trendsDetected: trendsData.total,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const accurateModels = modelsData.models.filter(m => m.accuracy >= 0.8).length;
      const avgAccuracy = modelsData.models.length > 0
        ? modelsData.models.reduce((sum, model) => sum + (model.accuracy || 0), 0) / modelsData.models.length
        : 0;

      setAnalyzerState(prev => ({
        ...prev,
        accurateModels: accurateModels,
        averageAccuracy: avgAccuracy
      }));

    } catch (error) {
      console.error('Failed to refresh predictive analysis data:', error);
      setAnalyzerState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.predictionType, viewState.timeHorizon, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Prediction Functions
  const generateAutomaticPredictions = useCallback(async () => {
    try {
      const activeScanRules = await scanRulesAPI.getActiveScanRules();
      
      if (activeScanRules.length > 0) {
        const prediction = await intelligenceAPI.generatePredictions({
          targetMetrics: ['performance', 'accuracy', 'execution_time'],
          timeHorizon: viewState.timeHorizon,
          confidenceLevel: viewState.confidenceLevel,
          includeUncertainty: true,
          autoAlert: viewState.alertsEnabled
        });

        setAnalyzerState(prev => ({
          ...prev,
          predictions: [...prev.predictions, prediction],
          totalPredictions: prev.totalPredictions + 1,
          activePredictions: prev.activePredictions + 1
        }));

        if (onPredictionGenerated) onPredictionGenerated(prediction);
      }
    } catch (error) {
      console.error('Auto-prediction generation failed:', error);
    }
  }, [viewState.timeHorizon, viewState.confidenceLevel, viewState.alertsEnabled, onPredictionGenerated]);

  const generateCustomPrediction = useCallback(async () => {
    try {
      const prediction = await intelligenceAPI.generatePredictions({
        modelId: predictionForm.modelId,
        predictionType: predictionForm.predictionType,
        targetMetric: predictionForm.targetMetric,
        timeHorizon: predictionForm.timeHorizon,
        confidenceLevel: predictionForm.confidenceLevel,
        includeUncertainty: predictionForm.includeUncertainty,
        generateInsights: predictionForm.generateInsights,
        alertThresholds: predictionForm.alertThresholds
      });

      setAnalyzerState(prev => ({
        ...prev,
        predictions: [...prev.predictions, prediction],
        totalPredictions: prev.totalPredictions + 1
      }));

      if (onPredictionGenerated) onPredictionGenerated(prediction);
      setPredictionDialogOpen(false);
    } catch (error) {
      console.error('Custom prediction generation failed:', error);
    }
  }, [predictionForm, onPredictionGenerated]);

  const generateForecast = useCallback(async () => {
    try {
      const forecast = await intelligenceAPI.generateForecast({
        dataSource: forecastForm.dataSource,
        forecastPeriod: parseInt(forecastForm.forecastPeriod),
        granularity: forecastForm.granularity,
        includeSeasonality: forecastForm.includeSeasonality,
        includeHolidays: forecastForm.includeHolidays,
        scenarios: forecastForm.scenarios
      });

      setAnalyzerState(prev => ({
        ...prev,
        forecasts: [...prev.forecasts, forecast],
        forecastsGenerated: prev.forecastsGenerated + 1
      }));

      setForecastDialogOpen(false);
    } catch (error) {
      console.error('Forecast generation failed:', error);
    }
  }, [forecastForm]);

  const performTrendAnalysis = useCallback(async (metricId: string, timeRange: string) => {
    try {
      const trendAnalysis = await intelligenceAPI.performTrendAnalysis({
        metricId: metricId,
        timeRange: timeRange,
        detectSeasonality: true,
        detectAnomalies: true,
        generateInsights: true
      });

      setAnalyzerState(prev => ({
        ...prev,
        trends: [...prev.trends, trendAnalysis],
        trendsDetected: prev.trendsDetected + 1
      }));

      if (onTrendDetected) onTrendDetected(trendAnalysis);
    } catch (error) {
      console.error('Trend analysis failed:', error);
    }
  }, [onTrendDetected]);

  const trainPredictiveModel = useCallback(async (modelConfig: any) => {
    try {
      setAnalyzerState(prev => ({ ...prev, modelsTraining: prev.modelsTraining + 1 }));
      
      const trainingJob = await intelligenceAPI.trainPredictiveModel({
        modelType: modelConfig.type,
        algorithm: modelConfig.algorithm,
        targetVariable: modelConfig.targetVariable,
        features: modelConfig.features,
        trainingPeriod: modelConfig.trainingPeriod,
        validationSplit: 0.2
      });

      // Training will complete asynchronously and update via WebSocket
      return trainingJob;
    } catch (error) {
      console.error('Model training failed:', error);
      setAnalyzerState(prev => ({ ...prev, modelsTraining: prev.modelsTraining - 1 }));
    }
  }, []);

  const generateScenarioAnalysis = useCallback(async (scenarios: string[]) => {
    try {
      const scenarioAnalysis = await intelligenceAPI.generateScenarioAnalysis({
        scenarios: scenarios,
        timeHorizon: viewState.timeHorizon,
        variables: ['performance', 'accuracy', 'resource_usage'],
        includeRiskAssessment: true
      });

      setAnalyzerState(prev => ({
        ...prev,
        scenarios: [...prev.scenarios, scenarioAnalysis],
        scenariosAnalyzed: prev.scenariosAnalyzed + 1
      }));
    } catch (error) {
      console.error('Scenario analysis failed:', error);
    }
  }, [viewState.timeHorizon]);

  // Utility Functions
  const getAccuracyColor = useCallback((accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-600';
    if (accuracy >= 0.8) return 'text-blue-600';
    if (accuracy >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getAccuracyBadge = useCallback((accuracy: number) => {
    const range = ACCURACY_RANGES.find(r => accuracy >= r.min);
    return range || ACCURACY_RANGES[ACCURACY_RANGES.length - 1];
  }, []);

  const getTrendIcon = useCallback((trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  const getPredictionTypeIcon = useCallback((type: string) => {
    const typeConfig = PREDICTION_TYPES.find(t => t.value === type);
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Target className="h-4 w-4" />;
  }, []);

  const getTimeHorizonColor = useCallback((horizon: string) => {
    const horizonConfig = TIME_HORIZONS.find(h => h.value === horizon);
    return horizonConfig ? horizonConfig.color : 'gray';
  }, []);

  // Filter and Search Functions
  const filteredPredictions = useMemo(() => {
    let filtered = analyzerState.predictions;

    if (viewState.searchQuery) {
      filtered = filtered.filter(prediction => 
        prediction.description?.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        prediction.targetMetric?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.predictionType !== 'all') {
      filtered = filtered.filter(prediction => prediction.type === viewState.predictionType);
    }

    if (viewState.filterAccuracy !== 'all') {
      const accuracyRange = ACCURACY_RANGES.find(r => r.value === viewState.filterAccuracy);
      if (accuracyRange) {
        filtered = filtered.filter(prediction => prediction.accuracy >= accuracyRange.min);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'accuracy':
          aValue = a.accuracy || 0;
          bValue = b.accuracy || 0;
          break;
        case 'confidence':
          aValue = a.confidence || 0;
          bValue = b.confidence || 0;
          break;
        case 'timestamp':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.accuracy || 0;
          bValue = b.accuracy || 0;
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [analyzerState.predictions, viewState.searchQuery, viewState.predictionType, viewState.filterAccuracy, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Prediction Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Crystal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzerState.totalPredictions}</div>
            <p className="text-xs text-muted-foreground">
              {analyzerState.activePredictions} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(analyzerState.averageAccuracy)}`}>
              {(analyzerState.averageAccuracy * 100).toFixed(1)}%
            </div>
            <Progress value={analyzerState.averageAccuracy * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trends Detected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analyzerState.trendsDetected}</div>
            <p className="text-xs text-muted-foreground">
              patterns identified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecasts Generated</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analyzerState.forecastsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              time series forecasts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Prediction Engine Status
            <Badge className={streamingRef.current ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {streamingRef.current ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{analyzerState.modelsTraining}</div>
              <div className="text-sm text-gray-500">Models Training</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{analyzerState.insightsGenerated}</div>
              <div className="text-sm text-gray-500">Insights Generated</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{analyzerState.scenariosAnalyzed}</div>
              <div className="text-sm text-gray-500">Scenarios Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{analyzerState.alertsGenerated}</div>
              <div className="text-sm text-gray-500">Alerts Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MODEL_TYPES.slice(0, 5).map(model => {
              const accuracy = model.accuracy;
              const accuracyBadge = getAccuracyBadge(accuracy);
              
              return (
                <div key={model.value} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{model.label}</div>
                      <div className="text-sm text-gray-500">{model.value}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getAccuracyColor(accuracy)}`}>
                      {(accuracy * 100).toFixed(1)}% accurate
                    </div>
                    <Badge className={accuracyBadge.color}>
                      {accuracyBadge.label.split(' ')[0]}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recent Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPredictions.slice(0, 5).map(prediction => (
              <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getPredictionTypeIcon(prediction.type)}
                  <div>
                    <div className="font-medium">{prediction.description}</div>
                    <div className="text-sm text-gray-500">
                      {prediction.targetMetric} • {prediction.timeHorizon}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getAccuracyColor(prediction.accuracy || 0)}`}>
                    {((prediction.accuracy || 0) * 100).toFixed(1)}% confidence
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(prediction.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prediction Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              By Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PREDICTION_TYPES.slice(1).map(type => {
                const count = filteredPredictions.filter(p => p.type === type.value).length;
                const percentage = analyzerState.totalPredictions > 0 
                  ? (count / analyzerState.totalPredictions) * 100 
                  : 0;
                
                return (
                  <div key={type.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPredictionTypeIcon(type.value)}
                      <span className="text-sm">{type.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="w-16">
                        <Progress value={percentage} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              By Time Horizon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TIME_HORIZONS.map(horizon => {
                const count = filteredPredictions.filter(p => p.timeHorizon === horizon.value).length;
                const percentage = analyzerState.totalPredictions > 0 
                  ? (count / analyzerState.totalPredictions) * 100 
                  : 0;
                
                return (
                  <div key={horizon.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <div>
                        <span className="text-sm font-medium">{horizon.label}</span>
                        <div className="text-xs text-gray-500">{horizon.period}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="w-16">
                        <Progress value={percentage} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <LineChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Trend visualization would be rendered here</p>
              <p className="text-sm">Real-time trend analysis and forecasting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crystal className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Predictive Analyzer</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  streamingRef.current ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {streamingRef.current ? 'Predicting' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.predictionType}
                onValueChange={(value) => setViewState(prev => ({ ...prev, predictionType: value as any }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREDICTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPredictionDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Predict
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={analyzerState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${analyzerState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Switch
                checked={viewState.autoPrediction}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, autoPrediction: checked }))}
              />
              <span className="text-sm text-gray-600">Auto-predict</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="predictions" className="flex items-center gap-2">
                  <Crystal className="h-4 w-4" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="forecasts" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Forecasts
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="models" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Models
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Scenarios
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="predictions">
                <div>Predictions Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="forecasts">
                <div>Forecast Dashboard (To be implemented)</div>
              </TabsContent>
              <TabsContent value="trends">
                <div>Trend Analysis Dashboard (To be implemented)</div>
              </TabsContent>
              <TabsContent value="models">
                <div>Model Management System (To be implemented)</div>
              </TabsContent>
              <TabsContent value="scenarios">
                <div>Scenario Analysis Tools (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Prediction Dialog */}
        <Dialog open={predictionDialogOpen} onOpenChange={setPredictionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Prediction</DialogTitle>
              <DialogDescription>
                Configure and generate predictive analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prediction-type">Prediction Type</Label>
                <Select 
                  value={predictionForm.predictionType}
                  onValueChange={(value) => setPredictionForm(prev => ({ ...prev, predictionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDICTION_TYPES.slice(1).map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time-horizon">Time Horizon</Label>
                <Select 
                  value={predictionForm.timeHorizon}
                  onValueChange={(value) => setPredictionForm(prev => ({ ...prev, timeHorizon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_HORIZONS.map(horizon => (
                      <SelectItem key={horizon.value} value={horizon.value}>
                        {horizon.label} ({horizon.period})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="confidence-level">Confidence Level: {predictionForm.confidenceLevel}</Label>
                <Slider
                  value={[predictionForm.confidenceLevel]}
                  onValueChange={(value) => setPredictionForm(prev => ({ ...prev, confidenceLevel: value[0] }))}
                  max={1}
                  min={0.5}
                  step={0.05}
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPredictionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateCustomPrediction}>
                  Generate Prediction
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PredictiveAnalyzer;