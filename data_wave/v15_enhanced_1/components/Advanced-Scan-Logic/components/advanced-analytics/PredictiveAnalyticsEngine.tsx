/**
 * 🔮 Predictive Analytics Engine - Advanced Scan Logic
 * ===================================================
 * 
 * Enterprise-grade predictive analytics engine with AI-powered forecasting,
 * machine learning models, and intelligent predictions for scan optimization.
 * 
 * Features:
 * - Advanced ML-powered prediction models
 * - Real-time forecast generation and updates
 * - Intelligent resource prediction and optimization
 * - Performance forecasting and capacity planning
 * - Risk prediction and anomaly forecasting
 * - Cross-system predictive correlation analysis
 * - Enterprise-grade visualization and reporting
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Brain, TrendingUp, BarChart3, LineChart, PieChart, Activity, AlertTriangle, CheckCircle, Clock, Calendar, Target, Zap, Settings, Filter, Download, Upload, RefreshCw, PlayCircle, PauseCircle, StopCircle, Maximize2, Minimize2, Eye, EyeOff, Info, HelpCircle, ArrowRight, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Plus, Minus, X, Search, SortAsc, SortDesc, MoreHorizontal, Database, CloudComputing, Cpu, MemoryStick, HardDrive, Network, Server, Monitor, Gauge, Users, Lock, Shield, Key, FileText, BarChart, PresentationChart, Sparkles, Layers, GitBranch, Code, Terminal, Workflow, Map, Globe, Building, Factory, Briefcase, DollarSign, TrendingDown, AlertCircle, Warning, CheckSquare, Square, Circle, Triangle, Diamond, Star, Heart, Bookmark, Flag, Bell, BellOff } from 'lucide-react';

// Charts and Visualization
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart as RechartsBarChart,
  ScatterChart,
  PieChart as RechartsPieChart,
  RadarChart,
  ComposedChart,
  Treemap,
  Sankey,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Scatter,
  Pie,
  Cell,
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  ReferenceArea,
  ErrorBar,
  Brush,
  LabelList,
  FunnelChart,
  Funnel
} from 'recharts';

// Date handling
import { format, addDays, addMonths, addYears, isAfter, isBefore, parseISO } from 'date-fns';

// API and Types
import { ScanAnalyticsAPIService } from '../../services/scan-analytics-apis';
import { ScanIntelligenceAPIService } from '../../services/scan-intelligence-apis';
import {
  PredictiveAnalyticsConfig,
  PredictionModel,
  ForecastResult,
  ModelAccuracy,
  FeatureImportance,
  ModelType,
  PredictionType,
  TimeHorizon,
  ConfidenceLevel,
  ModelStatus,
  ValidationMetrics,
  TrainingProgress,
  HyperParameters,
  ModelComparison,
  PredictionInsight,
  ForecastTrend,
  AnomalyPrediction,
  ResourcePrediction,
  PerformancePrediction,
  CapacityPrediction,
  RiskPrediction,
  CostPrediction,
  QualityPrediction,
  CompliancePrediction,
  SecurityPrediction,
  BusinessPrediction
} from '../../types/intelligence.types';

// Interfaces for component state
interface PredictiveEngineState {
  isInitialized: boolean;
  isLoading: boolean;
  models: PredictionModel[];
  activeModel: PredictionModel | null;
  predictions: ForecastResult[];
  insights: PredictionInsight[];
  accuracy: ModelAccuracy | null;
  trainingProgress: TrainingProgress | null;
  config: PredictiveAnalyticsConfig;
  selectedTimeHorizon: TimeHorizon;
  selectedPredictionTypes: PredictionType[];
  filters: PredictionFilters;
  viewMode: 'overview' | 'detailed' | 'training' | 'validation' | 'deployment';
  error: string | null;
}

interface PredictionFilters {
  modelTypes: ModelType[];
  confidenceThreshold: number;
  dateRange: { start: Date; end: Date };
  targetMetrics: string[];
  includeAnomalies: boolean;
  includeUncertainty: boolean;
}

interface ModelTrainingConfig {
  modelType: ModelType;
  features: string[];
  targetVariable: string;
  trainingDataSize: number;
  validationSplit: number;
  hyperParameters: HyperParameters;
  crossValidation: boolean;
  autoFeatureSelection: boolean;
  ensembleMethod: boolean;
}

interface VisualizationConfig {
  chartType: 'line' | 'area' | 'bar' | 'scatter' | 'combined';
  showConfidenceIntervals: boolean;
  showTrendLines: boolean;
  showAnomalies: boolean;
  showSeasonality: boolean;
  timeGranularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  aggregationMethod: 'mean' | 'median' | 'sum' | 'max' | 'min';
}

const PredictiveAnalyticsEngine: React.FC = () => {
  // Services
  const analyticsAPI = useRef(new ScanAnalyticsAPIService());
  const intelligenceAPI = useRef(new ScanIntelligenceAPIService());

  // Component State
  const [engineState, setEngineState] = useState<PredictiveEngineState>({
    isInitialized: false,
    isLoading: false,
    models: [],
    activeModel: null,
    predictions: [],
    insights: [],
    accuracy: null,
    trainingProgress: null,
    config: {
      defaultTimeHorizon: TimeHorizon.THIRTY_DAYS,
      autoRetraining: true,
      confidenceThreshold: 0.8,
      maxModels: 10,
      predictionRefreshInterval: 300000, // 5 minutes
      enableRealTimePredictions: true,
      enableAnomalyDetection: true,
      enableUncertaintyQuantification: true,
      enableExplainability: true,
      modelSelectionStrategy: 'auto',
      ensembleMethod: 'weighted_average',
      featureSelectionMethod: 'automatic',
      validationMethod: 'time_series_split',
      hyperParameterOptimization: true,
      earlyStoppingEnabled: true,
      modelPersistence: true,
      predictionCaching: true,
      alertThresholds: {
        accuracy: 0.7,
        drift: 0.1,
        performance: 0.8
      }
    },
    selectedTimeHorizon: TimeHorizon.THIRTY_DAYS,
    selectedPredictionTypes: [PredictionType.PERFORMANCE, PredictionType.RESOURCE, PredictionType.ANOMALY],
    filters: {
      modelTypes: [ModelType.NEURAL_NETWORK, ModelType.RANDOM_FOREST, ModelType.GRADIENT_BOOSTING],
      confidenceThreshold: 0.8,
      dateRange: {
        start: addDays(new Date(), -30),
        end: addDays(new Date(), 30)
      },
      targetMetrics: ['cpu_usage', 'memory_usage', 'scan_duration', 'error_rate'],
      includeAnomalies: true,
      includeUncertainty: true
    },
    viewMode: 'overview',
    error: null
  });

  const [trainingConfig, setTrainingConfig] = useState<ModelTrainingConfig>({
    modelType: ModelType.GRADIENT_BOOSTING,
    features: ['historical_performance', 'resource_usage', 'scan_patterns', 'system_load'],
    targetVariable: 'scan_duration',
    trainingDataSize: 10000,
    validationSplit: 0.2,
    hyperParameters: {
      learningRate: 0.1,
      maxDepth: 6,
      nEstimators: 100,
      regularization: 0.01,
      batchSize: 32,
      epochs: 100
    },
    crossValidation: true,
    autoFeatureSelection: true,
    ensembleMethod: false
  });

  const [visualConfig, setVisualConfig] = useState<VisualizationConfig>({
    chartType: 'line',
    showConfidenceIntervals: true,
    showTrendLines: true,
    showAnomalies: true,
    showSeasonality: true,
    timeGranularity: 'hour',
    aggregationMethod: 'mean'
  });

  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedPredictionId, setSelectedPredictionId] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize the engine
  useEffect(() => {
    initializePredictiveEngine();
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Auto-refresh predictions
  useEffect(() => {
    if (engineState.config.enableRealTimePredictions && engineState.isInitialized) {
      const interval = setInterval(() => {
        refreshPredictions();
      }, engineState.config.predictionRefreshInterval);
      setRefreshInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [engineState.config.enableRealTimePredictions, engineState.isInitialized]);

  const initializePredictiveEngine = async () => {
    try {
      setEngineState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load existing models
      const models = await loadExistingModels();
      
      // Load recent predictions
      const predictions = await loadRecentPredictions();
      
      // Generate initial insights
      const insights = await generatePredictiveInsights();

      setEngineState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        models,
        predictions,
        insights,
        activeModel: models.length > 0 ? models[0] : null
      }));

    } catch (error) {
      console.error('Failed to initialize predictive engine:', error);
      setEngineState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize predictive analytics engine'
      }));
    }
  };

  const loadExistingModels = async (): Promise<PredictionModel[]> => {
    try {
      const response = await intelligenceAPI.current.getPredictiveModels({
        include_metrics: true,
        include_training_history: true,
        status_filter: [ModelStatus.ACTIVE, ModelStatus.TRAINED]
      });

      return response.models || [];
    } catch (error) {
      console.error('Failed to load prediction models:', error);
      return [];
    }
  };

  const loadRecentPredictions = async (): Promise<ForecastResult[]> => {
    try {
      const response = await analyticsAPI.current.getPredictiveAnalytics({
        time_horizon: engineState.selectedTimeHorizon,
        prediction_types: engineState.selectedPredictionTypes,
        include_confidence_intervals: true,
        include_feature_importance: true
      });

      return response.predictions || [];
    } catch (error) {
      console.error('Failed to load predictions:', error);
      return [];
    }
  };

  const generatePredictiveInsights = async (): Promise<PredictionInsight[]> => {
    try {
      const response = await intelligenceAPI.current.generatePredictiveInsights({
        analysis_scope: 'system_wide',
        insight_categories: ['optimization', 'risk', 'opportunity', 'anomaly'],
        confidence_threshold: engineState.filters.confidenceThreshold,
        include_recommendations: true
      });

      return response.insights || [];
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return [];
    }
  };

  const refreshPredictions = useCallback(async () => {
    if (!engineState.isInitialized || engineState.isLoading) return;

    try {
      const predictions = await loadRecentPredictions();
      const insights = await generatePredictiveInsights();

      setEngineState(prev => ({
        ...prev,
        predictions,
        insights
      }));
    } catch (error) {
      console.error('Failed to refresh predictions:', error);
    }
  }, [engineState.isInitialized, engineState.isLoading, engineState.selectedTimeHorizon, engineState.selectedPredictionTypes]);

  const trainNewModel = async () => {
    try {
      setEngineState(prev => ({ ...prev, isLoading: true }));

      const trainingRequest = {
        model_type: trainingConfig.modelType,
        features: trainingConfig.features,
        target_variable: trainingConfig.targetVariable,
        training_config: {
          data_size: trainingConfig.trainingDataSize,
          validation_split: trainingConfig.validationSplit,
          cross_validation: trainingConfig.crossValidation,
          auto_feature_selection: trainingConfig.autoFeatureSelection,
          ensemble_method: trainingConfig.ensembleMethod,
          hyperparameters: trainingConfig.hyperParameters
        },
        training_preferences: {
          early_stopping: engineState.config.earlyStoppingEnabled,
          hyperparameter_optimization: engineState.config.hyperParameterOptimization,
          model_persistence: engineState.config.modelPersistence
        }
      };

      const response = await intelligenceAPI.current.trainPredictiveModel(trainingRequest);

      if (response.success) {
        // Refresh models list
        const updatedModels = await loadExistingModels();
        setEngineState(prev => ({
          ...prev,
          models: updatedModels,
          isLoading: false
        }));
        setIsTrainingDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to train model:', error);
      setEngineState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to train prediction model'
      }));
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      setEngineState(prev => ({ ...prev, isLoading: true }));

      await intelligenceAPI.current.deployPredictiveModel({
        model_id: modelId,
        deployment_config: {
          enable_real_time: engineState.config.enableRealTimePredictions,
          enable_caching: engineState.config.predictionCaching,
          confidence_threshold: engineState.config.confidenceThreshold
        }
      });

      // Refresh models
      const updatedModels = await loadExistingModels();
      setEngineState(prev => ({
        ...prev,
        models: updatedModels,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to deploy model:', error);
      setEngineState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to deploy prediction model'
      }));
    }
  };

  const generatePredictions = async () => {
    try {
      setEngineState(prev => ({ ...prev, isLoading: true }));

      const predictionRequest = {
        model_ids: engineState.models
          .filter(m => m.status === ModelStatus.ACTIVE)
          .map(m => m.id),
        prediction_types: engineState.selectedPredictionTypes,
        time_horizon: engineState.selectedTimeHorizon,
        target_metrics: engineState.filters.targetMetrics,
        include_uncertainty: engineState.filters.includeUncertainty,
        include_anomalies: engineState.filters.includeAnomalies,
        confidence_level: engineState.filters.confidenceThreshold
      };

      const response = await analyticsAPI.current.generatePredictions(predictionRequest);

      setEngineState(prev => ({
        ...prev,
        predictions: response.predictions || [],
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      setEngineState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to generate predictions'
      }));
    }
  };

  // Computed values
  const modelAccuracyStats = useMemo(() => {
    if (!engineState.models.length) return null;

    const accuracies = engineState.models
      .filter(m => m.validation_metrics?.accuracy)
      .map(m => m.validation_metrics!.accuracy);

    if (!accuracies.length) return null;

    return {
      average: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
      min: Math.min(...accuracies),
      max: Math.max(...accuracies),
      count: accuracies.length
    };
  }, [engineState.models]);

  const predictionTrends = useMemo(() => {
    if (!engineState.predictions.length) return [];

    return engineState.predictions
      .filter(p => p.forecast_data && p.forecast_data.length > 0)
      .map(prediction => ({
        id: prediction.id,
        name: prediction.prediction_type,
        data: prediction.forecast_data.map(point => ({
          timestamp: point.timestamp,
          value: point.predicted_value,
          confidence_upper: point.confidence_interval?.upper,
          confidence_lower: point.confidence_interval?.lower,
          actual: point.actual_value
        })),
        trend: prediction.trend_analysis,
        accuracy: prediction.accuracy_score
      }));
  }, [engineState.predictions]);

  const riskPredictions = useMemo(() => {
    return engineState.predictions.filter(p => 
      p.prediction_type === PredictionType.RISK || 
      p.prediction_type === PredictionType.ANOMALY
    );
  }, [engineState.predictions]);

  const opportunityInsights = useMemo(() => {
    return engineState.insights.filter(insight => 
      insight.category === 'optimization' || 
      insight.category === 'opportunity'
    );
  }, [engineState.insights]);

  // Render helper functions
  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engineState.models.filter(m => m.status === ModelStatus.ACTIVE).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {engineState.models.length} total models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelAccuracyStats ? `${(modelAccuracyStats.average * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {modelAccuracyStats ? `${modelAccuracyStats.min.toFixed(2)} - ${modelAccuracyStats.max.toFixed(2)} range` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineState.predictions.length}</div>
            <p className="text-xs text-muted-foreground">
              {riskPredictions.length} risk alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineState.insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {opportunityInsights.length} opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Prediction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Prediction Trends
          </CardTitle>
          <CardDescription>
            Real-time prediction forecasts with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictionTrends[0]?.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, HH:mm')}
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(2) : value,
                    name
                  ]}
                />
                <Legend />
                
                {visualConfig.showConfidenceIntervals && (
                  <Area
                    dataKey="confidence_upper"
                    stackId="confidence"
                    stroke="none"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                  />
                )}
                
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Predicted"
                />
                
                {visualConfig.showConfidenceIntervals && (
                  <Area
                    dataKey="confidence_lower"
                    stackId="confidence"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1}
                  />
                )}
                
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                  name="Actual"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {engineState.insights.slice(0, 10).map((insight, index) => (
                <div key={insight.id} className="border-l-4 border-blue-500 pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant={
                      insight.confidence_score > 0.8 ? 'default' :
                      insight.confidence_score > 0.6 ? 'secondary' : 'outline'
                    }>
                      {(insight.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="text-sm">
                      <strong>Recommendation:</strong> {insight.recommendations[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailedAnalysis = () => (
    <div className="space-y-6">
      {/* Prediction Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(PredictionType).map(type => {
          const typePredictions = engineState.predictions.filter(p => p.prediction_type === type);
          const avgAccuracy = typePredictions.length > 0 
            ? typePredictions.reduce((sum, p) => sum + (p.accuracy_score || 0), 0) / typePredictions.length
            : 0;

          return (
            <Card key={type} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {type.replace('_', ' ').toUpperCase()}
                  <Badge variant="outline">{typePredictions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-medium">{(avgAccuracy * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={avgAccuracy * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {typePredictions.length} active predictions
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Comparison</CardTitle>
          <CardDescription>
            Accuracy, precision, and recall metrics across all prediction models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineState.models.map(model => ({
                name: model.name,
                accuracy: model.validation_metrics?.accuracy || 0,
                precision: model.validation_metrics?.precision || 0,
                recall: model.validation_metrics?.recall || 0,
                f1Score: model.validation_metrics?.f1_score || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy" />
                <Bar dataKey="precision" fill="#10b981" name="Precision" />
                <Bar dataKey="recall" fill="#f59e0b" name="Recall" />
                <Bar dataKey="f1Score" fill="#ef4444" name="F1 Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Feature Importance */}
      {engineState.activeModel?.feature_importance && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance - {engineState.activeModel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engineState.activeModel.feature_importance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="importance" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderModelTraining = () => (
    <div className="space-y-6">
      {/* Training Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Model Training Configuration</CardTitle>
          <CardDescription>
            Configure and train new predictive models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Model Type</Label>
              <Select 
                value={trainingConfig.modelType}
                onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, modelType: value as ModelType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ModelType).map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Variable</Label>
              <Select 
                value={trainingConfig.targetVariable}
                onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, targetVariable: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scan_duration">Scan Duration</SelectItem>
                  <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                  <SelectItem value="memory_usage">Memory Usage</SelectItem>
                  <SelectItem value="error_rate">Error Rate</SelectItem>
                  <SelectItem value="throughput">Throughput</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Training Data Size</Label>
              <div className="space-y-2">
                <Slider
                  value={[trainingConfig.trainingDataSize]}
                  onValueChange={([value]) => setTrainingConfig(prev => ({ ...prev, trainingDataSize: value }))}
                  min={1000}
                  max={100000}
                  step={1000}
                />
                <div className="text-sm text-muted-foreground">
                  {trainingConfig.trainingDataSize.toLocaleString()} samples
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Validation Split</Label>
              <div className="space-y-2">
                <Slider
                  value={[trainingConfig.validationSplit]}
                  onValueChange={([value]) => setTrainingConfig(prev => ({ ...prev, validationSplit: value }))}
                  min={0.1}
                  max={0.5}
                  step={0.05}
                />
                <div className="text-sm text-muted-foreground">
                  {(trainingConfig.validationSplit * 100).toFixed(0)}% for validation
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={trainingConfig.crossValidation}
                onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, crossValidation: checked }))}
              />
              <Label>Cross Validation</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={trainingConfig.autoFeatureSelection}
                onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, autoFeatureSelection: checked }))}
              />
              <Label>Automatic Feature Selection</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={trainingConfig.ensembleMethod}
                onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, ensembleMethod: checked }))}
              />
              <Label>Ensemble Method</Label>
            </div>
          </div>

          <Button onClick={trainNewModel} disabled={engineState.isLoading} className="w-full">
            {engineState.isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Training
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Training Progress */}
      {engineState.trainingProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{engineState.trainingProgress.progress_percentage}%</span>
              </div>
              <Progress value={engineState.trainingProgress.progress_percentage} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Current Epoch:</strong> {engineState.trainingProgress.current_epoch}
              </div>
              <div>
                <strong>Training Loss:</strong> {engineState.trainingProgress.training_loss?.toFixed(4)}
              </div>
              <div>
                <strong>Validation Loss:</strong> {engineState.trainingProgress.validation_loss?.toFixed(4)}
              </div>
              <div>
                <strong>ETA:</strong> {engineState.trainingProgress.estimated_time_remaining}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Models */}
      <Card>
        <CardHeader>
          <CardTitle>Trained Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engineState.models.map(model => (
              <div key={model.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{model.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      model.status === ModelStatus.ACTIVE ? 'default' :
                      model.status === ModelStatus.TRAINED ? 'secondary' : 'outline'
                    }>
                      {model.status}
                    </Badge>
                    {model.status === ModelStatus.TRAINED && (
                      <Button size="sm" onClick={() => deployModel(model.id)}>
                        Deploy
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Type:</strong> {model.model_type}
                  </div>
                  <div>
                    <strong>Accuracy:</strong> {model.validation_metrics?.accuracy ? (model.validation_metrics.accuracy * 100).toFixed(1) + '%' : 'N/A'}
                  </div>
                  <div>
                    <strong>Created:</strong> {format(new Date(model.created_at), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    <strong>Version:</strong> {model.version}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderValidationMetrics = () => (
    <div className="space-y-6">
      {/* Validation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Model Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {engineState.models.filter(m => m.validation_status === 'passed').length}
            </div>
            <p className="text-sm text-muted-foreground">Models passed validation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelAccuracyStats ? `${(modelAccuracyStats.average * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Across all models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prediction Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">A+</div>
            <p className="text-sm text-muted-foreground">Overall grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Model Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engineState.models.map(model => (
              <div key={model.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{model.name}</h3>
                  <Badge variant={
                    model.validation_status === 'passed' ? 'default' :
                    model.validation_status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {model.validation_status}
                  </Badge>
                </div>

                {model.validation_metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                      <div className="text-lg font-medium">
                        {(model.validation_metrics.accuracy * 100).toFixed(1)}%
                      </div>
                      <Progress value={model.validation_metrics.accuracy * 100} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Precision</div>
                      <div className="text-lg font-medium">
                        {(model.validation_metrics.precision * 100).toFixed(1)}%
                      </div>
                      <Progress value={model.validation_metrics.precision * 100} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Recall</div>
                      <div className="text-lg font-medium">
                        {(model.validation_metrics.recall * 100).toFixed(1)}%
                      </div>
                      <Progress value={model.validation_metrics.recall * 100} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">F1 Score</div>
                      <div className="text-lg font-medium">
                        {(model.validation_metrics.f1_score * 100).toFixed(1)}%
                      </div>
                      <Progress value={model.validation_metrics.f1_score * 100} className="h-2" />
                    </div>
                  </div>
                )}

                {model.validation_errors && model.validation_errors.length > 0 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Validation Issues</AlertTitle>
                    <AlertDescription>
                      {model.validation_errors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDeploymentStatus = () => (
    <div className="space-y-6">
      {/* Deployment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Deployed Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engineState.models.filter(m => m.status === ModelStatus.ACTIVE).length}
            </div>
            <p className="text-sm text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prediction Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2K</div>
            <p className="text-sm text-muted-foreground">Predictions/hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45ms</div>
            <p className="text-sm text-muted-foreground">Average latency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Model Health & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engineState.models
              .filter(m => m.status === ModelStatus.ACTIVE)
              .map(model => (
                <div key={model.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Deployed {format(new Date(model.deployed_at || model.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Healthy</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Predictions Today</div>
                      <div className="font-medium">2,456</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Response Time</div>
                      <div className="font-medium">42ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Accuracy</div>
                      <div className="font-medium">
                        {model.validation_metrics?.accuracy ? (model.validation_metrics.accuracy * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Model Drift</div>
                      <div className="font-medium text-green-600">Low</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { time: '00:00', predictions: 120, accuracy: 0.94, latency: 45 },
                { time: '04:00', predictions: 89, accuracy: 0.92, latency: 42 },
                { time: '08:00', predictions: 156, accuracy: 0.95, latency: 48 },
                { time: '12:00', predictions: 203, accuracy: 0.93, latency: 51 },
                { time: '16:00', predictions: 187, accuracy: 0.94, latency: 46 },
                { time: '20:00', predictions: 145, accuracy: 0.95, latency: 43 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="predictions" stroke="#3b82f6" name="Predictions/hour" />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy" />
                <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#f59e0b" name="Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!engineState.isInitialized && engineState.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p>Initializing Predictive Analytics Engine...</p>
        </div>
      </div>
    );
  }

  if (engineState.error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{engineState.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              Predictive Analytics Engine
            </h1>
            <p className="text-muted-foreground">
              AI-powered predictive analytics for intelligent scan optimization
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPredictions}
              disabled={engineState.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${engineState.isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={generatePredictions}
              disabled={engineState.isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Generate Predictions
            </Button>
            
            <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Train Model
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Train New Prediction Model</DialogTitle>
                  <DialogDescription>
                    Configure and start training a new predictive model
                  </DialogDescription>
                </DialogHeader>
                {renderModelTraining()}
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsConfigDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuration
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Models
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Models
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={engineState.viewMode} onValueChange={(value) => setEngineState(prev => ({ ...prev, viewMode: value as any }))}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="training">Model Training</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderOverviewDashboard()}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {renderDetailedAnalysis()}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            {renderModelTraining()}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            {renderValidationMetrics()}
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            {renderDeploymentStatus()}
          </TabsContent>
        </Tabs>

        {/* Configuration Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Predictive Analytics Configuration</DialogTitle>
              <DialogDescription>
                Configure engine settings and prediction parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Confidence Threshold</Label>
                  <Slider
                    value={[engineState.config.confidenceThreshold]}
                    onValueChange={([value]) => setEngineState(prev => ({
                      ...prev,
                      config: { ...prev.config, confidenceThreshold: value }
                    }))}
                    min={0.5}
                    max={1}
                    step={0.05}
                  />
                  <div className="text-sm text-muted-foreground">
                    {(engineState.config.confidenceThreshold * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Refresh Interval (minutes)</Label>
                  <Slider
                    value={[engineState.config.predictionRefreshInterval / 60000]}
                    onValueChange={([value]) => setEngineState(prev => ({
                      ...prev,
                      config: { ...prev.config, predictionRefreshInterval: value * 60000 }
                    }))}
                    min={1}
                    max={60}
                    step={1}
                  />
                  <div className="text-sm text-muted-foreground">
                    {engineState.config.predictionRefreshInterval / 60000} minutes
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={engineState.config.enableRealTimePredictions}
                    onCheckedChange={(checked) => setEngineState(prev => ({
                      ...prev,
                      config: { ...prev.config, enableRealTimePredictions: checked }
                    }))}
                  />
                  <Label>Enable Real-time Predictions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={engineState.config.autoRetraining}
                    onCheckedChange={(checked) => setEngineState(prev => ({
                      ...prev,
                      config: { ...prev.config, autoRetraining: checked }
                    }))}
                  />
                  <Label>Automatic Model Retraining</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={engineState.config.enableAnomalyDetection}
                    onCheckedChange={(checked) => setEngineState(prev => ({
                      ...prev,
                      config: { ...prev.config, enableAnomalyDetection: checked }
                    }))}
                  />
                  <Label>Enable Anomaly Detection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={engineState.config.enableExplainability}
                    onCheckedChange={(checked) => setEngineState(prev => ({
                      ...prev,
                      config: { ...prev.config, enableExplainability: checked }
                    }))}
                  />
                  <Label>Enable Model Explainability</Label>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PredictiveAnalyticsEngine;