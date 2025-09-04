'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  LineChart,
  FunnelChart,
  Funnel,
  TreemapChart,
  Treemap
} from 'recharts';

import { Brain, TrendingUp, Activity, Target, AlertCircle, CheckCircle, Clock, Filter, Download, Settings, RefreshCw, Play, Pause, MoreVertical, Search, SortAsc, SortDesc, Eye, EyeOff, ChevronDown, ChevronUp, Info, Lightbulb, Zap, Database, Microscope, Calculator, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, Table as TableIcon, FileText, Save, Share, Copy, Edit, Trash2, Calendar as CalendarIcon, Clock4, Shield, AlertTriangle, Star, TrendingDown, Layers, Hash, Type, Globe, Binary, Calendar as DateIcon, Percent, Ruler, BarChart2, PlusCircle, MinusCircle, FileBarChart, Bot, Cpu, Network, Workflow, Sparkles, TrendingUp as ChartLine, GitBranch, Users, Timer, Gauge, TrendingUp as TrendIcon, BarChart3, PieChart as PieIcon, ArrowUp, ArrowDown, ArrowRight, Minus, Plus, X, Check, ExternalLink, RotateCcw, FastForward, Rewind, SkipForward, SkipBack, Maximize, Minimize } from 'lucide-react';

// Hook imports
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { useCatalogRecommendations } from '../../hooks/useCatalogRecommendations';

// Type imports
import {
  PredictiveAnalyticsResults,
  ModelPerformance,
  Prediction,
  AdvancedInsight,
  ComprehensiveAnalytics,
  PredictiveModelType,
  AdvancedInsightType,
  InsightPriority,
  InsightImpact
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface PredictiveInsightsProps {
  assetId?: string;
  defaultTimeRange?: { start: Date; end: Date };
  onInsightGenerated?: (insight: AdvancedInsight) => void;
  onPredictionComplete?: (prediction: Prediction) => void;
  onError?: (error: Error) => void;
}

interface InsightsState {
  selectedTimeRange: { start: Date; end: Date };
  selectedModelType: PredictiveModelType;
  selectedAssetTypes: string[];
  predictionHorizon: number;
  confidenceThreshold: number;
  enableAutoRefresh: boolean;
  showAdvancedFilters: boolean;
  activeTab: string;
  selectedInsight: AdvancedInsight | null;
  comparisonMode: boolean;
  selectedMetrics: string[];
  trainingInProgress: boolean;
  modelOptimizationLevel: 'BASIC' | 'ADVANCED' | 'EXPERT';
}

interface PredictiveFilters {
  modelTypes?: PredictiveModelType[];
  insightTypes?: AdvancedInsightType[];
  priorityLevel?: InsightPriority[];
  impactLevel?: InsightImpact[];
  dateRange?: { start: Date; end: Date };
  searchTerm: string;
  minConfidence?: number;
  maxVariance?: number;
  includeExplanations: boolean;
}

interface ModelConfiguration {
  id: string;
  name: string;
  type: PredictiveModelType;
  algorithm: string;
  hyperparameters: Record<string, any>;
  trainingData: {
    features: string[];
    target: string;
    size: number;
    quality: number;
  };
  performance: ModelPerformance;
  status: 'TRAINING' | 'READY' | 'DEPLOYED' | 'FAILED';
  accuracy: number;
  lastTrained: Date;
  predictions: Prediction[];
}

interface PredictiveScenario {
  id: string;
  name: string;
  description: string;
  variables: ScenarioVariable[];
  predictions: ScenarioPrediction[];
  confidence: number;
  createdAt: Date;
  tags: string[];
}

interface ScenarioVariable {
  name: string;
  type: 'NUMERIC' | 'CATEGORICAL' | 'BOOLEAN' | 'DATE';
  currentValue: any;
  proposedValue: any;
  impact: number;
  constraint?: {
    min?: number;
    max?: number;
    options?: string[];
  };
}

interface ScenarioPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  changePercentage: number;
  confidence: number;
  explanation: string;
}

interface FeatureImportanceData {
  feature: string;
  importance: number;
  description: string;
  category: string;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  correlation: number;
}

interface AnomalyDetection {
  id: string;
  timestamp: Date;
  metric: string;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  recommendations: string[];
  confidence: number;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockModels = (): ModelConfiguration[] => {
  const modelTypes: PredictiveModelType[] = ['REGRESSION', 'CLASSIFICATION', 'TIME_SERIES', 'CLUSTERING', 'ANOMALY_DETECTION'];
  const algorithms = ['RandomForest', 'XGBoost', 'Neural Network', 'LSTM', 'ARIMA', 'K-Means', 'Isolation Forest'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `model_${i + 1}`,
    name: `${algorithms[i % algorithms.length]} Model`,
    type: modelTypes[i % modelTypes.length],
    algorithm: algorithms[i % algorithms.length],
    hyperparameters: {
      learning_rate: 0.01 + Math.random() * 0.09,
      max_depth: Math.floor(Math.random() * 10) + 5,
      n_estimators: Math.floor(Math.random() * 200) + 100
    },
    trainingData: {
      features: [`feature_${Math.floor(Math.random() * 20) + 1}`],
      target: 'target_metric',
      size: Math.floor(Math.random() * 50000) + 10000,
      quality: 70 + Math.random() * 30
    },
    performance: {
      modelId: `model_${i + 1}`,
      accuracy: 70 + Math.random() * 30,
      precision: 65 + Math.random() * 35,
      recall: 60 + Math.random() * 40,
      f1Score: 65 + Math.random() * 35,
      meanAbsoluteError: Math.random() * 10,
      meanSquaredError: Math.random() * 100,
      rootMeanSquaredError: Math.random() * 10,
      crossValidationScore: 70 + Math.random() * 25,
      holdoutValidationScore: 65 + Math.random() * 30,
      stabilityScore: 80 + Math.random() * 20,
      driftScore: Math.random() * 20,
      featureStability: []
    } as ModelPerformance,
    status: ['TRAINING', 'READY', 'DEPLOYED'][Math.floor(Math.random() * 3)] as any,
    accuracy: 70 + Math.random() * 30,
    lastTrained: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    predictions: []
  }));
};

const generateMockInsights = (): AdvancedInsight[] => {
  const types: AdvancedInsightType[] = ['TREND_ANALYSIS', 'PATTERN_DETECTION', 'ANOMALY_DETECTION', 'CORRELATION_ANALYSIS', 'FORECASTING'];
  const priorities: InsightPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'];
  const impacts: InsightImpact[] = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH', 'TRANSFORMATIONAL'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `insight_${i + 1}`,
    type: types[i % types.length],
    category: 'PREDICTIVE',
    title: `Predictive Insight ${i + 1}`,
    description: `Advanced AI-generated insight revealing important patterns and future trends in your data catalog usage.`,
    data: {
      predictions: Array.from({ length: 30 }, (_, j) => ({
        date: new Date(Date.now() + j * 24 * 60 * 60 * 1000),
        value: 100 + Math.random() * 200,
        confidence: 70 + Math.random() * 30
      })),
      metrics: {
        accuracy: 75 + Math.random() * 25,
        precision: 70 + Math.random() * 30,
        recall: 65 + Math.random() * 35
      }
    },
    evidence: [
      {
        type: 'STATISTICAL',
        description: 'Historical data analysis shows strong correlation',
        confidence: 80 + Math.random() * 20,
        source: 'ML Pipeline'
      }
    ],
    impact: impacts[i % impacts.length],
    priority: priorities[i % priorities.length],
    confidence: 60 + Math.random() * 40,
    actionItems: [
      {
        id: `action_${i + 1}`,
        title: 'Optimize data pipeline',
        description: 'Implement recommended changes to improve performance',
        priority: 'HIGH',
        estimatedEffort: '2 weeks',
        expectedImpact: 'Reduce processing time by 30%'
      }
    ],
    businessValue: {
      estimatedValue: Math.floor(Math.random() * 100000) + 10000,
      confidence: 70 + Math.random() * 30,
      timeframe: '6 months',
      roi: Math.floor(Math.random() * 300) + 100
    },
    relatedInsights: [`insight_${(i + 1) % 12 + 1}`, `insight_${(i + 2) % 12 + 1}`],
    validated: Math.random() > 0.3,
    validationScore: 60 + Math.random() * 40,
    discoveredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    lastValidated: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined
  }));
};

const generateMockScenarios = (): PredictiveScenario[] => {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `scenario_${i + 1}`,
    name: `What-if Scenario ${i + 1}`,
    description: `Predictive analysis scenario exploring potential outcomes based on different variable configurations`,
    variables: [
      {
        name: 'user_growth_rate',
        type: 'NUMERIC',
        currentValue: 15,
        proposedValue: 20 + Math.random() * 10,
        impact: 70 + Math.random() * 30,
        constraint: { min: 0, max: 100 }
      },
      {
        name: 'data_quality_threshold',
        type: 'NUMERIC',
        currentValue: 85,
        proposedValue: 90 + Math.random() * 10,
        impact: 60 + Math.random() * 40,
        constraint: { min: 50, max: 100 }
      }
    ],
    predictions: [
      {
        metric: 'System Performance',
        currentValue: 78,
        predictedValue: 85 + Math.random() * 10,
        changePercentage: 8 + Math.random() * 12,
        confidence: 75 + Math.random() * 25,
        explanation: 'Improved data quality leads to better system performance'
      },
      {
        metric: 'User Satisfaction',
        currentValue: 82,
        predictedValue: 87 + Math.random() * 8,
        changePercentage: 5 + Math.random() * 10,
        confidence: 80 + Math.random() * 20,
        explanation: 'Enhanced system performance increases user satisfaction'
      }
    ],
    confidence: 70 + Math.random() * 30,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    tags: ['performance', 'optimization', 'user-experience']
  }));
};

const generateMockAnomalies = (): AnomalyDetection[] => {
  const metrics = ['usage_count', 'query_performance', 'data_quality', 'user_engagement', 'system_load'];
  const severities: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return Array.from({ length: 10 }, (_, i) => ({
    id: `anomaly_${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    metric: metrics[i % metrics.length],
    actualValue: 100 + Math.random() * 200,
    expectedValue: 120 + Math.random() * 180,
    deviation: 10 + Math.random() * 40,
    severity: severities[i % severities.length],
    explanation: `Unusual pattern detected in ${metrics[i % metrics.length]} indicating potential system anomaly`,
    recommendations: [
      'Investigate data source changes',
      'Check system configuration',
      'Review recent user behavior patterns'
    ],
    confidence: 70 + Math.random() * 30
  }));
};

const generateMockFeatureImportance = (): FeatureImportanceData[] => {
  const features = [
    'user_activity', 'data_quality', 'query_complexity', 'system_load', 'time_of_day',
    'user_department', 'asset_popularity', 'data_freshness', 'collaboration_level', 'access_frequency'
  ];

  return features.map((feature, i) => ({
    feature,
    importance: Math.random() * 100,
    description: `Impact of ${feature.replace('_', ' ')} on model predictions`,
    category: ['User Behavior', 'Data Quality', 'System', 'Temporal'][i % 4],
    trend: (['INCREASING', 'DECREASING', 'STABLE'] as const)[i % 3],
    correlation: (Math.random() - 0.5) * 2
  }));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({
  assetId,
  defaultTimeRange,
  onInsightGenerated,
  onPredictionComplete,
  onError
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const analyticsHook = useCatalogAnalytics({
    enableRealTimeUpdates: true,
    autoRefreshInterval: 60000
  });

  const recommendationsHook = useCatalogRecommendations({
    enableRealTimeUpdates: true,
    autoRefreshInterval: 120000
  });

  // Local State
  const [state, setState] = useState<InsightsState>({
    selectedTimeRange: defaultTimeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    selectedModelType: 'REGRESSION',
    selectedAssetTypes: [],
    predictionHorizon: 30,
    confidenceThreshold: 70,
    enableAutoRefresh: true,
    showAdvancedFilters: false,
    activeTab: 'overview',
    selectedInsight: null,
    comparisonMode: false,
    selectedMetrics: ['accuracy', 'confidence', 'impact'],
    trainingInProgress: false,
    modelOptimizationLevel: 'ADVANCED'
  });

  const [filters, setFilters] = useState<PredictiveFilters>({
    searchTerm: '',
    includeExplanations: true,
    minConfidence: 60
  });

  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [isInsightDetailOpen, setIsInsightDetailOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelConfiguration | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<PredictiveScenario | null>(null);

  // Mock data (in production, this would come from the hooks)
  const [mockModels] = useState(() => generateMockModels());
  const [mockInsights] = useState(() => generateMockInsights());
  const [mockScenarios] = useState(() => generateMockScenarios());
  const [mockAnomalies] = useState(() => generateMockAnomalies());
  const [mockFeatureImportance] = useState(() => generateMockFeatureImportance());

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredInsights = useMemo(() => {
    return mockInsights.filter(insight => {
      if (filters.searchTerm && !insight.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.insightTypes && !filters.insightTypes.includes(insight.type)) {
        return false;
      }
      if (filters.priorityLevel && !filters.priorityLevel.includes(insight.priority)) {
        return false;
      }
      if (filters.impactLevel && !filters.impactLevel.includes(insight.impact)) {
        return false;
      }
      if (filters.minConfidence && insight.confidence < filters.minConfidence) {
        return false;
      }
      return true;
    });
  }, [mockInsights, filters]);

  const filteredModels = useMemo(() => {
    return mockModels.filter(model => {
      if (filters.modelTypes && !filters.modelTypes.includes(model.type)) {
        return false;
      }
      return true;
    });
  }, [mockModels, filters]);

  const overallModelPerformance = useMemo(() => {
    if (filteredModels.length === 0) return { accuracy: 0, confidence: 0, stability: 0 };
    
    const avgAccuracy = filteredModels.reduce((sum, model) => sum + model.accuracy, 0) / filteredModels.length;
    const avgConfidence = filteredModels.reduce((sum, model) => sum + model.performance.stabilityScore, 0) / filteredModels.length;
    const avgStability = filteredModels.reduce((sum, model) => sum + model.performance.stabilityScore, 0) / filteredModels.length;
    
    return {
      accuracy: avgAccuracy,
      confidence: avgConfidence,
      stability: avgStability
    };
  }, [filteredModels]);

  const criticalAnomalies = useMemo(() => {
    return mockAnomalies.filter(anomaly => anomaly.severity === 'HIGH' || anomaly.severity === 'CRITICAL');
  }, [mockAnomalies]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTimeRangeChange = useCallback((start: Date, end: Date) => {
    setState(prev => ({ ...prev, selectedTimeRange: { start, end } }));
  }, []);

  const handleModelTypeChange = useCallback((type: PredictiveModelType) => {
    setState(prev => ({ ...prev, selectedModelType: type }));
  }, []);

  const handleTrainModel = useCallback(async (modelConfig: Partial<ModelConfiguration>) => {
    setState(prev => ({ ...prev, trainingInProgress: true }));
    
    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In production, this would call the backend API
      console.log('Training model with config:', modelConfig);
      
      setState(prev => ({ ...prev, trainingInProgress: false }));
      setIsModelDialogOpen(false);
    } catch (error) {
      setState(prev => ({ ...prev, trainingInProgress: false }));
      onError?.(error as Error);
    }
  }, [onError]);

  const handleGenerateScenario = useCallback(async (variables: ScenarioVariable[]) => {
    try {
      // In production, this would call the backend API for scenario generation
      const newScenario: PredictiveScenario = {
        id: `scenario_${Date.now()}`,
        name: `Custom Scenario ${mockScenarios.length + 1}`,
        description: 'User-generated what-if scenario',
        variables,
        predictions: variables.map(variable => ({
          metric: variable.name,
          currentValue: variable.currentValue,
          predictedValue: variable.proposedValue,
          changePercentage: ((variable.proposedValue - variable.currentValue) / variable.currentValue) * 100,
          confidence: 70 + Math.random() * 30,
          explanation: `Predicted change based on ${variable.name} modification`
        })),
        confidence: 75 + Math.random() * 25,
        createdAt: new Date(),
        tags: ['custom', 'user-generated']
      };

      setSelectedScenario(newScenario);
      setIsScenarioDialogOpen(false);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [mockScenarios.length, onError]);

  const handleInsightAction = useCallback((insight: AdvancedInsight, action: string) => {
    console.log(`Performing action ${action} on insight:`, insight);
    
    if (action === 'implement') {
      // In production, this would trigger the implementation workflow
      onInsightGenerated?.(insight);
    }
  }, [onInsightGenerated]);

  const handleFilterChange = useCallback((key: keyof PredictiveFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      analyticsHook.refreshAnalytics(),
      recommendationsHook.refreshRecommendations()
    ]);
  }, [analyticsHook, recommendationsHook]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Active Models</CardTitle>
          <Brain className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{filteredModels.length}</div>
          <p className="text-xs text-purple-600 mt-1">
            {filteredModels.filter(m => m.status === 'DEPLOYED').length} deployed
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Model Accuracy</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{Math.round(overallModelPerformance.accuracy)}%</div>
          <Progress value={overallModelPerformance.accuracy} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Insights Generated</CardTitle>
          <Lightbulb className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{filteredInsights.length}</div>
          <p className="text-xs text-green-600 mt-1">
            {filteredInsights.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').length} high priority
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Anomalies Detected</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">{criticalAnomalies.length}</div>
          <p className="text-xs text-red-600 mt-1">
            {mockAnomalies.filter(a => a.severity === 'CRITICAL').length} critical
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightCard = (insight: AdvancedInsight) => (
    <Card key={insight.id} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              insight.type === 'TREND_ANALYSIS' ? 'bg-blue-100 text-blue-600' :
              insight.type === 'PATTERN_DETECTION' ? 'bg-green-100 text-green-600' :
              insight.type === 'ANOMALY_DETECTION' ? 'bg-red-100 text-red-600' :
              insight.type === 'CORRELATION_ANALYSIS' ? 'bg-purple-100 text-purple-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              {insight.type === 'TREND_ANALYSIS' ? <TrendingUp className="h-4 w-4" /> :
               insight.type === 'PATTERN_DETECTION' ? <Search className="h-4 w-4" /> :
               insight.type === 'ANOMALY_DETECTION' ? <AlertTriangle className="h-4 w-4" /> :
               insight.type === 'CORRELATION_ANALYSIS' ? <Network className="h-4 w-4" /> :
               <ChartLine className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant={
                  insight.priority === 'CRITICAL' ? 'destructive' :
                  insight.priority === 'HIGH' ? 'destructive' :
                  insight.priority === 'MEDIUM' ? 'secondary' :
                  'default'
                }>
                  {insight.priority}
                </Badge>
                <Badge variant="outline">
                  {insight.impact}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence)}% confidence
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                setState(prev => ({ ...prev, selectedInsight: insight }));
                setIsInsightDetailOpen(true);
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsightAction(insight, 'implement')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Implement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsightAction(insight, 'dismiss')}>
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{insight.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Business Value</p>
            <p className="text-lg font-semibold">${insight.businessValue.estimatedValue.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">ROI</p>
            <p className="text-lg font-semibold">{insight.businessValue.roi}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Discovered: {insight.discoveredAt.toLocaleDateString()}
          </span>
          <div className="flex items-center space-x-1">
            {insight.validated ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-xs text-gray-500">
              {insight.validated ? 'Validated' : 'Pending'}
            </span>
          </div>
        </div>

        {insight.actionItems.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Recommended Actions:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {insight.actionItems.slice(0, 2).map((action, idx) => (
                <li key={idx} className="flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  {action.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderModelsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ML Models</h3>
        <Button onClick={() => setIsModelDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Train New Model
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModels.map((model) => (
          <Card key={model.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{model.type}</Badge>
                    <Badge variant={
                      model.status === 'DEPLOYED' ? 'default' :
                      model.status === 'READY' ? 'secondary' :
                      model.status === 'TRAINING' ? 'secondary' :
                      'destructive'
                    }>
                      {model.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(model.accuracy)}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Precision</p>
                    <p className="font-semibold">{Math.round(model.performance.precision)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recall</p>
                    <p className="font-semibold">{Math.round(model.performance.recall)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">F1 Score</p>
                    <p className="font-semibold">{Math.round(model.performance.f1Score)}%</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stability Score</span>
                    <span>{Math.round(model.performance.stabilityScore)}%</span>
                  </div>
                  <Progress value={model.performance.stabilityScore} />
                  
                  <div className="flex justify-between text-sm">
                    <span>Model Drift</span>
                    <span className={model.performance.driftScore > 15 ? 'text-red-500' : 'text-green-500'}>
                      {Math.round(model.performance.driftScore)}%
                    </span>
                  </div>
                  <Progress value={model.performance.driftScore} className="bg-red-100" />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Last trained: {model.lastTrained.toLocaleDateString()}</span>
                  <span>Data size: {model.trainingData.size.toLocaleString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedModel(model)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  {model.status === 'READY' && (
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                  )}
                  {model.status === 'DEPLOYED' && (
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retrain
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderScenariosTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">What-if Scenarios</h3>
        <Button onClick={() => setIsScenarioDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Scenario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockScenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                </div>
                <Badge variant="outline">
                  {Math.round(scenario.confidence)}% confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Variables</h4>
                  <div className="space-y-2">
                    {scenario.variables.map((variable, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{variable.name.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{variable.currentValue}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-semibold">{variable.proposedValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Predicted Outcomes</h4>
                  <div className="space-y-2">
                    {scenario.predictions.map((prediction, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{prediction.metric}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={prediction.changePercentage > 0 ? 'default' : 'destructive'} className="text-xs">
                            {prediction.changePercentage > 0 ? '+' : ''}{Math.round(prediction.changePercentage)}%
                          </Badge>
                          <span className="text-xs text-gray-500">{Math.round(prediction.confidence)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedScenario(scenario)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Simulate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnomaliesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Anomaly Detection</h3>
        <div className="flex space-x-2">
          <Badge variant="outline">{mockAnomalies.length} total</Badge>
          <Badge variant="destructive">{criticalAnomalies.length} critical</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {mockAnomalies.map((anomaly) => (
          <Card key={anomaly.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    anomaly.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                    anomaly.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                    anomaly.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold capitalize">{anomaly.metric.replace('_', ' ')} Anomaly</h4>
                    <p className="text-sm text-gray-600">{anomaly.explanation}</p>
                  </div>
                </div>
                <Badge variant={
                  anomaly.severity === 'CRITICAL' ? 'destructive' :
                  anomaly.severity === 'HIGH' ? 'destructive' :
                  anomaly.severity === 'MEDIUM' ? 'secondary' :
                  'default'
                }>
                  {anomaly.severity}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Actual Value</p>
                  <p className="text-lg font-semibold">{Math.round(anomaly.actualValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Expected Value</p>
                  <p className="text-lg font-semibold">{Math.round(anomaly.expectedValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Deviation</p>
                  <p className="text-lg font-semibold text-red-600">{Math.round(anomaly.deviation)}%</p>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2">Recommendations:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {anomaly.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-center">
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Detected: {anomaly.timestamp.toLocaleString()}</span>
                <span>Confidence: {Math.round(anomaly.confidence)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFeatureImportanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Importance Analysis</CardTitle>
          <CardDescription>
            Understanding which features have the most impact on model predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockFeatureImportance.sort((a, b) => b.importance - a.importance)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="importance" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Correlation</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFeatureImportance.map((feature) => (
                <TableRow key={feature.feature}>
                  <TableCell className="font-medium">{feature.feature}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{feature.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={feature.importance} className="w-16" />
                      <span className="text-sm">{Math.round(feature.importance)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      feature.trend === 'INCREASING' ? 'default' :
                      feature.trend === 'DECREASING' ? 'destructive' :
                      'secondary'
                    }>
                      {feature.trend === 'INCREASING' ? <ArrowUp className="h-3 w-3 mr-1" /> :
                       feature.trend === 'DECREASING' ? <ArrowDown className="h-3 w-3 mr-1" /> :
                       <Minus className="h-3 w-3 mr-1" />}
                      {feature.trend}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={feature.correlation > 0 ? 'text-green-600' : 'text-red-600'}>
                      {feature.correlation > 0 ? '+' : ''}{feature.correlation.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{feature.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Predictive Insights</h1>
            <p className="text-gray-600 mt-1">AI-powered analytics and machine learning insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={state.trainingInProgress}>
              <RefreshCw className={`h-4 w-4 mr-2 ${state.trainingInProgress ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsModelDialogOpen(true)}>
              <Brain className="h-4 w-4 mr-2" />
              Train Model
            </Button>
            <Button onClick={() => setIsScenarioDialogOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Model Type</Label>
                <Select value={state.selectedModelType} onValueChange={handleModelTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGRESSION">Regression</SelectItem>
                    <SelectItem value="CLASSIFICATION">Classification</SelectItem>
                    <SelectItem value="TIME_SERIES">Time Series</SelectItem>
                    <SelectItem value="CLUSTERING">Clustering</SelectItem>
                    <SelectItem value="ANOMALY_DETECTION">Anomaly Detection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prediction Horizon (days)</Label>
                <Input
                  type="number"
                  value={state.predictionHorizon}
                  onChange={(e) => setState(prev => ({ ...prev, predictionHorizon: parseInt(e.target.value) || 30 }))}
                  min="1"
                  max="365"
                />
              </div>
              <div>
                <Label>Min Confidence (%)</Label>
                <Input
                  type="number"
                  value={filters.minConfidence || ''}
                  onChange={(e) => handleFilterChange('minConfidence', parseFloat(e.target.value) || undefined)}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>Search Insights</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    placeholder="Search insights..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={Array.from({ length: 30 }, (_, i) => ({
                      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      accuracy: 70 + Math.random() * 30,
                      precision: 65 + Math.random() * 35,
                      recall: 60 + Math.random() * 40
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="precision" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="recall" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prediction Confidence Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'High (90-100%)', value: 35, color: '#22c55e' },
                          { name: 'Medium (70-89%)', value: 45, color: '#3b82f6' },
                          { name: 'Low (50-69%)', value: 20, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'High (90-100%)', value: 35, color: '#22c55e' },
                          { name: 'Medium (70-89%)', value: 45, color: '#3b82f6' },
                          { name: 'Low (50-69%)', value: 20, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Insights</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredInsights.slice(0, 4).map(renderInsightCard)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models">
            {renderModelsTab()}
          </TabsContent>

          <TabsContent value="scenarios">
            {renderScenariosTab()}
          </TabsContent>

          <TabsContent value="anomalies">
            {renderAnomaliesTab()}
          </TabsContent>

          <TabsContent value="features">
            {renderFeatureImportanceTab()}
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <div className="space-y-4">
                {filteredInsights.map(renderInsightCard)}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Train Model Dialog */}
        <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Train New ML Model</DialogTitle>
              <DialogDescription>
                Configure and train a new machine learning model for predictive analytics
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Model Type</Label>
                  <Select value={state.selectedModelType} onValueChange={handleModelTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGRESSION">Regression</SelectItem>
                      <SelectItem value="CLASSIFICATION">Classification</SelectItem>
                      <SelectItem value="TIME_SERIES">Time Series</SelectItem>
                      <SelectItem value="CLUSTERING">Clustering</SelectItem>
                      <SelectItem value="ANOMALY_DETECTION">Anomaly Detection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Optimization Level</Label>
                  <Select value={state.modelOptimizationLevel} onValueChange={(value: any) => setState(prev => ({ ...prev, modelOptimizationLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Model Name</Label>
                <Input placeholder="Enter model name" />
              </div>

              <div>
                <Label>Training Features</Label>
                <Textarea placeholder="Specify features to include in training (comma-separated)" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Train/Test Split (%)</Label>
                  <Slider
                    defaultValue={[80]}
                    max={95}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Cross-Validation Folds</Label>
                  <Input type="number" defaultValue="5" min="3" max="10" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-hyperparameter" defaultChecked />
                <Label htmlFor="auto-hyperparameter">Auto-optimize hyperparameters</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModelDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleTrainModel({})} disabled={state.trainingInProgress}>
                {state.trainingInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Training
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Scenario Dialog */}
        <Dialog open={isScenarioDialogOpen} onOpenChange={setIsScenarioDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create What-if Scenario</DialogTitle>
              <DialogDescription>
                Define variables and explore potential outcomes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Scenario Name</Label>
                <Input placeholder="Enter scenario name" />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe the scenario" />
              </div>

              <div>
                <Label>Variables to Modify</Label>
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Variable</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variable" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user_growth">User Growth Rate</SelectItem>
                          <SelectItem value="data_quality">Data Quality</SelectItem>
                          <SelectItem value="system_load">System Load</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Current Value</Label>
                      <Input type="number" placeholder="Current" disabled />
                    </div>
                    <div>
                      <Label>New Value</Label>
                      <Input type="number" placeholder="Proposed" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScenarioDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleGenerateScenario([])}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Scenario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Insight Detail Dialog */}
        <Dialog open={isInsightDetailOpen} onOpenChange={setIsInsightDetailOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{state.selectedInsight?.title}</DialogTitle>
              <DialogDescription>{state.selectedInsight?.description}</DialogDescription>
            </DialogHeader>
            {state.selectedInsight && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Impact Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Priority:</span>
                        <Badge variant={
                          state.selectedInsight.priority === 'CRITICAL' ? 'destructive' :
                          state.selectedInsight.priority === 'HIGH' ? 'destructive' :
                          'secondary'
                        }>
                          {state.selectedInsight.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Impact:</span>
                        <Badge variant="outline">{state.selectedInsight.impact}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span>{Math.round(state.selectedInsight.confidence)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Business Value</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Estimated Value:</span>
                        <span>${state.selectedInsight.businessValue.estimatedValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span>{state.selectedInsight.businessValue.roi}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timeframe:</span>
                        <span>{state.selectedInsight.businessValue.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <div className="space-y-2">
                    {state.selectedInsight.actionItems.map((action, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{action.title}</h5>
                          <Badge variant="outline">{action.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{action.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Effort: {action.estimatedEffort} | Impact: {action.expectedImpact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInsightDetailOpen(false)}>
                Close
              </Button>
              <Button onClick={() => state.selectedInsight && handleInsightAction(state.selectedInsight, 'implement')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Implement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PredictiveInsights;