// ============================================================================
// QUALITY TRENDS ANALYZER - ADVANCED CATALOG QUALITY MANAGEMENT
// ============================================================================
// Enterprise-grade quality trend analysis with AI-powered insights
// Integrates with: catalog_quality_service.py, catalog_analytics_service.py
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Progress,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Switch,
  Slider,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Calendar as CalendarIcon,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Target,
  Brain,
  Lightbulb,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Search,
  Plus,
  Minus,
  X,
  Info,
  HelpCircle,
  ExternalLink,
  Save,
  Share2,
  Copy,
  Edit,
  Trash2,
  Archive,
  Star,
  Flag,
  Tag,
  BookOpen,
  Database,
  Server,
  Globe,
  Users,
  UserCheck,
  Mail,
  Bell,
  Smartphone,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Wifi,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Gauge,
  Thermometer,
  Timer,
  Stopwatch,
  Battery,
  BatteryLow,
  Fuel,
  Anchor,
  Compass,
  Map,
  Navigation,
  Route,
  MapPin,
  Radar,
  Satellite,
  Radio,
  Mic,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  Gamepad2,
  Joystick,
  Mouse,
  Keyboard,
  Printer,
  Scanner,
  Camera,
  Video,
  Image,
  Film,
  Music,
  Disc,
  Cassette,
  Radio as RadioIcon
} from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { 
  LineChart as RechartsLineChart, 
  AreaChart, 
  BarChart as RechartsBarChart,
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Line, 
  Area, 
  Bar,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  FunnelChart,
  Funnel,
  TreemapChart,
  Treemap,
  SunburstChart,
  Sankey
} from 'recharts';

// Import services and types
import { 
  CatalogQualityService,
  CatalogAnalyticsService,
  IntelligentDiscoveryService
} from '../../services';
import { 
  QualityTrend,
  QualityTrendAnalysis,
  QualityMetric,
  QualityDimension,
  QualityTrendPrediction,
  QualityTrendAlert,
  QualityTrendInsight,
  QualityTrendRecommendation,
  QualityTrendPattern,
  QualityTrendAnomaly,
  QualityTrendComparison,
  QualityTrendForecast,
  QualityTrendBaseline,
  QualityTrendReport,
  TimePeriod,
  TrendVisualizationType,
  TrendAggregationType,
  TrendScopeConfig,
  TrendFilterConfig,
  TrendExportConfig
} from '../../types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface QualityTrendsAnalyzerProps {
  className?: string;
  initialScope?: TrendScopeConfig;
  realTimeUpdates?: boolean;
  enablePredictions?: boolean;
  enableAnomalyDetection?: boolean;
  onTrendSelected?: (trend: QualityTrend) => void;
  onInsightGenerated?: (insight: QualityTrendInsight) => void;
  onAlertTriggered?: (alert: QualityTrendAlert) => void;
}

interface TrendConfiguration {
  timePeriod: TimePeriod;
  aggregation: TrendAggregationType;
  visualization: TrendVisualizationType;
  dimensions: QualityDimension[];
  metrics: QualityMetric[];
  baseline: QualityTrendBaseline | null;
  enableRealTime: boolean;
  enablePredictions: boolean;
  enableAnomalyDetection: boolean;
  alertThresholds: QualityTrendAlert[];
  refreshInterval: number;
}

interface TrendVisualization {
  id: string;
  type: TrendVisualizationType;
  title: string;
  data: any[];
  config: any;
  insights: QualityTrendInsight[];
  recommendations: QualityTrendRecommendation[];
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface TrendAnalysisState {
  loading: boolean;
  error: string | null;
  trends: QualityTrend[];
  analysis: QualityTrendAnalysis | null;
  predictions: QualityTrendPrediction[];
  anomalies: QualityTrendAnomaly[];
  patterns: QualityTrendPattern[];
  insights: QualityTrendInsight[];
  recommendations: QualityTrendRecommendation[];
  alerts: QualityTrendAlert[];
  comparisons: QualityTrendComparison[];
  forecasts: QualityTrendForecast[];
  baselines: QualityTrendBaseline[];
}

interface DrillDownContext {
  trend: QualityTrend;
  dimension: QualityDimension;
  metric: QualityMetric;
  timePoint: Date;
  value: number;
  context: Record<string, any>;
}

interface AdvancedFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  label: string;
  enabled: boolean;
  type: 'dimension' | 'metric' | 'temporal' | 'statistical';
}

interface PredictiveModel {
  id: string;
  name: string;
  type: 'linear' | 'polynomial' | 'exponential' | 'arima' | 'lstm' | 'prophet';
  accuracy: number;
  confidence: number;
  trainedAt: Date;
  lastUsed: Date;
  parameters: Record<string, any>;
  validationMetrics: Record<string, number>;
}

interface TrendCorrelation {
  metric1: QualityMetric;
  metric2: QualityMetric;
  correlation: number;
  significance: number;
  relationship: 'positive' | 'negative' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  confidence: number;
}

interface SeasonalityPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  strength: number;
  period: number;
  amplitude: number;
  phase: number;
  confidence: number;
  description: string;
}

interface AnomalyContext {
  anomaly: QualityTrendAnomaly;
  surroundingData: any[];
  possibleCauses: string[];
  historicalSimilarity: number;
  impact: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    scope: string[];
    affectedAssets: number;
    estimatedCost: number;
  };
  recommendations: QualityTrendRecommendation[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const QualityTrendsAnalyzer: React.FC<QualityTrendsAnalyzerProps> = ({
  className,
  initialScope,
  realTimeUpdates = false,
  enablePredictions = true,
  enableAnomalyDetection = true,
  onTrendSelected,
  onInsightGenerated,
  onAlertTriggered
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<TrendAnalysisState>({
    loading: false,
    error: null,
    trends: [],
    analysis: null,
    predictions: [],
    anomalies: [],
    patterns: [],
    insights: [],
    recommendations: [],
    alerts: [],
    comparisons: [],
    forecasts: [],
    baselines: []
  });

  const [configuration, setConfiguration] = useState<TrendConfiguration>({
    timePeriod: {
      start: subMonths(new Date(), 3),
      end: new Date(),
      granularity: 'daily'
    },
    aggregation: 'average',
    visualization: 'line',
    dimensions: [],
    metrics: [],
    baseline: null,
    enableRealTime: realTimeUpdates,
    enablePredictions,
    enableAnomalyDetection,
    alertThresholds: [],
    refreshInterval: 300000 // 5 minutes
  });

  const [visualizations, setVisualizations] = useState<TrendVisualization[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTrend, setSelectedTrend] = useState<QualityTrend | null>(null);
  const [drillDownContext, setDrillDownContext] = useState<DrillDownContext | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [correlations, setCorrelations] = useState<TrendCorrelation[]>([]);
  const [seasonalityPatterns, setSeasonalityPatterns] = useState<SeasonalityPattern[]>([]);
  const [anomalyContexts, setAnomalyContexts] = useState<AnomalyContext[]>([]);

  // UI State
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showBaselines, setShowBaselines] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(realTimeUpdates);
  const [fullScreen, setFullScreen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date]>([
    subMonths(new Date(), 3),
    new Date()
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportDialog, setExportDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [insightDialog, setInsightDialog] = useState(false);
  const [alertsDialog, setAlertsDialog] = useState(false);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const chartRefs = useRef<Map<string, any>>(new Map());

  // ============================================================================
  // SERVICE INITIALIZATION
  // ============================================================================

  const qualityService = useMemo(() => new CatalogQualityService(), []);
  const analyticsService = useMemo(() => new CatalogAnalyticsService(), []);
  const discoveryService = useMemo(() => new IntelligentDiscoveryService(), []);

  // ============================================================================
  // DATA LOADING AND PROCESSING
  // ============================================================================

  const loadTrendData = useCallback(async (config: TrendConfiguration) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load base trend data
      const trendsResponse = await qualityService.getQualityTrends({
        timePeriod: config.timePeriod,
        dimensions: config.dimensions.map(d => d.id),
        metrics: config.metrics.map(m => m.id),
        aggregation: config.aggregation,
        includeBaseline: config.baseline !== null,
        scope: initialScope
      });

      // Load trend analysis
      const analysisResponse = await qualityService.analyzeQualityTrends({
        trends: trendsResponse.data,
        enableCorrelation: true,
        enableSeasonality: true,
        enablePatternDetection: true,
        enableInsightGeneration: true
      });

      // Load predictions if enabled
      let predictions: QualityTrendPrediction[] = [];
      if (config.enablePredictions) {
        const predictionsResponse = await qualityService.predictQualityTrends({
          historicalData: trendsResponse.data,
          forecastPeriod: {
            start: new Date(),
            end: subMonths(new Date(), -1),
            granularity: config.timePeriod.granularity
          },
          models: predictiveModels.map(m => m.id),
          confidence: 0.95
        });
        predictions = predictionsResponse.data;
      }

      // Load anomalies if enabled
      let anomalies: QualityTrendAnomaly[] = [];
      if (config.enableAnomalyDetection) {
        const anomaliesResponse = await qualityService.detectQualityAnomalies({
          trends: trendsResponse.data,
          sensitivity: 0.8,
          includeContext: true,
          includeRecommendations: true
        });
        anomalies = anomaliesResponse.data;
      }

      // Load patterns and insights
      const patternsResponse = await qualityService.identifyQualityPatterns({
        trends: trendsResponse.data,
        patternTypes: ['seasonal', 'cyclical', 'trend', 'irregular'],
        minConfidence: 0.7
      });

      const insightsResponse = await qualityService.generateQualityInsights({
        trends: trendsResponse.data,
        analysis: analysisResponse.data,
        predictions,
        anomalies,
        patterns: patternsResponse.data
      });

      // Load recommendations
      const recommendationsResponse = await qualityService.generateQualityRecommendations({
        trends: trendsResponse.data,
        insights: insightsResponse.data,
        includeActionItems: true,
        includePrioritization: true
      });

      // Load baselines
      const baselinesResponse = await qualityService.getQualityBaselines({
        dimensions: config.dimensions.map(d => d.id),
        metrics: config.metrics.map(m => m.id),
        includeStatistical: true,
        includeBusinessRules: true
      });

      // Load correlations
      const correlationsResponse = await analyticsService.calculateTrendCorrelations({
        trends: trendsResponse.data,
        metrics: config.metrics.map(m => m.id),
        minCorrelation: 0.3,
        includeSignificance: true
      });

      // Load seasonality patterns
      const seasonalityResponse = await analyticsService.analyzeSeasonality({
        trends: trendsResponse.data,
        timePeriod: config.timePeriod,
        patternTypes: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
      });

      // Update state
      setState(prev => ({
        ...prev,
        loading: false,
        trends: trendsResponse.data,
        analysis: analysisResponse.data,
        predictions,
        anomalies,
        patterns: patternsResponse.data,
        insights: insightsResponse.data,
        recommendations: recommendationsResponse.data,
        baselines: baselinesResponse.data
      }));

      setCorrelations(correlationsResponse.data);
      setSeasonalityPatterns(seasonalityResponse.data);

      // Generate visualizations
      await generateVisualizations(trendsResponse.data, analysisResponse.data);

      // Process anomaly contexts
      const contexts = await Promise.all(
        anomalies.map(async (anomaly) => {
          const contextResponse = await qualityService.getAnomalyContext(anomaly.id);
          return contextResponse.data;
        })
      );
      setAnomalyContexts(contexts);

      // Trigger insights callback
      if (onInsightGenerated && insightsResponse.data.length > 0) {
        insightsResponse.data.forEach(insight => onInsightGenerated(insight));
      }

    } catch (error) {
      console.error('Error loading trend data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load trend data'
      }));
    }
  }, [qualityService, analyticsService, initialScope, predictiveModels, onInsightGenerated]);

  // Generate visualizations based on data
  const generateVisualizations = useCallback(async (
    trends: QualityTrend[], 
    analysis: QualityTrendAnalysis
  ) => {
    const visualizations: TrendVisualization[] = [];

    // Overview visualization
    visualizations.push({
      id: 'overview',
      type: 'multi-line',
      title: 'Quality Trends Overview',
      data: trends,
      config: {
        showBaseline: showBaselines,
        showPredictions: showPredictions,
        showAnomalies: showAnomalies,
        aggregation: configuration.aggregation
      },
      insights: state.insights.filter(i => i.scope === 'overview'),
      recommendations: state.recommendations.filter(r => r.scope === 'overview'),
      visible: true,
      position: { x: 0, y: 0 },
      size: { width: 12, height: 6 }
    });

    // Dimension breakdown
    configuration.dimensions.forEach((dimension, index) => {
      visualizations.push({
        id: `dimension-${dimension.id}`,
        type: 'area',
        title: `${dimension.name} Trends`,
        data: trends.filter(t => t.dimension === dimension.id),
        config: {
          dimension: dimension.id,
          showComparison: true,
          enableDrillDown: true
        },
        insights: state.insights.filter(i => i.dimension === dimension.id),
        recommendations: state.recommendations.filter(r => r.dimension === dimension.id),
        visible: true,
        position: { x: (index % 2) * 6, y: 6 + Math.floor(index / 2) * 4 },
        size: { width: 6, height: 4 }
      });
    });

    // Correlation heatmap
    if (correlations.length > 0) {
      visualizations.push({
        id: 'correlations',
        type: 'heatmap',
        title: 'Metric Correlations',
        data: correlations,
        config: {
          showSignificance: true,
          threshold: 0.3
        },
        insights: state.insights.filter(i => i.type === 'correlation'),
        recommendations: state.recommendations.filter(r => r.type === 'correlation'),
        visible: true,
        position: { x: 0, y: 10 },
        size: { width: 6, height: 4 }
      });
    }

    // Anomaly distribution
    if (state.anomalies.length > 0) {
      visualizations.push({
        id: 'anomalies',
        type: 'scatter',
        title: 'Quality Anomalies',
        data: state.anomalies,
        config: {
          showSeverity: true,
          enableSelection: true,
          colorBySeverity: true
        },
        insights: state.insights.filter(i => i.type === 'anomaly'),
        recommendations: state.recommendations.filter(r => r.type === 'anomaly'),
        visible: showAnomalies,
        position: { x: 6, y: 10 },
        size: { width: 6, height: 4 }
      });
    }

    // Forecasting visualization
    if (state.predictions.length > 0) {
      visualizations.push({
        id: 'forecasts',
        type: 'forecast',
        title: 'Quality Forecasts',
        data: state.predictions,
        config: {
          showConfidence: true,
          showHistorical: true,
          predictionHorizon: 30
        },
        insights: state.insights.filter(i => i.type === 'prediction'),
        recommendations: state.recommendations.filter(r => r.type === 'prediction'),
        visible: showPredictions,
        position: { x: 0, y: 14 },
        size: { width: 12, height: 4 }
      });
    }

    setVisualizations(visualizations);
  }, [configuration, correlations, state, showBaselines, showPredictions, showAnomalies]);

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  const setupRealTimeUpdates = useCallback(() => {
    if (!configuration.enableRealTime) return;

    // Setup WebSocket connection
    const wsUrl = `ws://localhost:8000/ws/quality-trends/${initialScope?.assetIds?.join(',')}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'trend_update') {
        setState(prev => ({
          ...prev,
          trends: prev.trends.map(trend => 
            trend.id === update.data.id ? { ...trend, ...update.data } : trend
          )
        }));
      } else if (update.type === 'anomaly_detected') {
        setState(prev => ({
          ...prev,
          anomalies: [...prev.anomalies, update.data]
        }));
        
        if (onAlertTriggered) {
          onAlertTriggered({
            id: update.data.id,
            type: 'anomaly',
            severity: update.data.severity,
            message: `Anomaly detected: ${update.data.description}`,
            timestamp: new Date(),
            data: update.data
          });
        }
      } else if (update.type === 'insight_generated') {
        setState(prev => ({
          ...prev,
          insights: [...prev.insights, update.data]
        }));
        
        if (onInsightGenerated) {
          onInsightGenerated(update.data);
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocketRef.current = ws;

    // Setup auto-refresh interval
    if (configuration.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadTrendData(configuration);
      }, configuration.refreshInterval);
    }

    return () => {
      ws.close();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [configuration, initialScope, loadTrendData, onAlertTriggered, onInsightGenerated]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTrendClick = useCallback((trend: QualityTrend, context?: any) => {
    setSelectedTrend(trend);
    
    if (context) {
      setDrillDownContext({
        trend,
        dimension: context.dimension,
        metric: context.metric,
        timePoint: context.timePoint,
        value: context.value,
        context: context.additionalData || {}
      });
    }

    if (onTrendSelected) {
      onTrendSelected(trend);
    }
  }, [onTrendSelected]);

  const handleConfigurationChange = useCallback((newConfig: Partial<TrendConfiguration>) => {
    const updatedConfig = { ...configuration, ...newConfig };
    setConfiguration(updatedConfig);
    loadTrendData(updatedConfig);
  }, [configuration, loadTrendData]);

  const handleFilterChange = useCallback((filterId: string, updates: Partial<AdvancedFilter>) => {
    setAdvancedFilters(prev => 
      prev.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      )
    );
  }, []);

  const handleAddFilter = useCallback(() => {
    const newFilter: AdvancedFilter = {
      id: `filter-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      label: 'New Filter',
      enabled: true,
      type: 'dimension'
    };
    setAdvancedFilters(prev => [...prev, newFilter]);
  }, []);

  const handleRemoveFilter = useCallback((filterId: string) => {
    setAdvancedFilters(prev => prev.filter(filter => filter.id !== filterId));
  }, []);

  const handleExport = useCallback(async (config: TrendExportConfig) => {
    try {
      const exportResponse = await qualityService.exportQualityTrends({
        trends: state.trends,
        analysis: state.analysis,
        predictions: state.predictions,
        anomalies: state.anomalies,
        format: config.format,
        includeVisualizations: config.includeCharts,
        includeInsights: config.includeInsights,
        includeRecommendations: config.includeRecommendations
      });

      // Download the file
      const blob = new Blob([exportResponse.data], { 
        type: config.format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quality-trends-${format(new Date(), 'yyyy-MM-dd')}.${config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [qualityService, state]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadTrendData(configuration);
  }, [loadTrendData]);

  useEffect(() => {
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [setupRealTimeUpdates]);

  useEffect(() => {
    // Load available predictive models
    const loadPredictiveModels = async () => {
      try {
        const modelsResponse = await qualityService.getPredictiveModels({
          includeMetrics: true,
          includeValidation: true
        });
        setPredictiveModels(modelsResponse.data);
      } catch (error) {
        console.error('Failed to load predictive models:', error);
      }
    };

    loadPredictiveModels();
  }, [qualityService]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const filteredTrends = useMemo(() => {
    let filtered = state.trends;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trend => 
        trend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trend.dimension.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trend.metric.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    advancedFilters.forEach(filter => {
      if (!filter.enabled) return;

      filtered = filtered.filter(trend => {
        const fieldValue = (trend as any)[filter.field];
        
        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value;
          case 'not_equals':
            return fieldValue !== filter.value;
          case 'greater_than':
            return fieldValue > filter.value;
          case 'less_than':
            return fieldValue < filter.value;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [state.trends, searchTerm, advancedFilters]);

  const trendSummary = useMemo(() => {
    const trends = filteredTrends;
    
    return {
      total: trends.length,
      improving: trends.filter(t => t.direction === 'improving').length,
      declining: trends.filter(t => t.direction === 'declining').length,
      stable: trends.filter(t => t.direction === 'stable').length,
      averageScore: trends.reduce((sum, t) => sum + t.currentValue, 0) / trends.length || 0,
      criticalAnomalies: state.anomalies.filter(a => a.severity === 'critical').length,
      totalInsights: state.insights.length,
      actionableRecommendations: state.recommendations.filter(r => r.actionable).length
    };
  }, [filteredTrends, state.anomalies, state.insights, state.recommendations]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderOverviewCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Trends</p>
              <p className="text-2xl font-bold">{trendSummary.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Improving</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-green-600">{trendSummary.improving}</p>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {((trendSummary.improving / trendSummary.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Declining</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-red-600">{trendSummary.declining}</p>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {((trendSummary.declining / trendSummary.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
              <p className="text-2xl font-bold">{trendSummary.averageScore.toFixed(1)}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">
                {trendSummary.averageScore >= 80 ? 'Excellent' : 
                 trendSummary.averageScore >= 60 ? 'Good' :
                 trendSummary.averageScore >= 40 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMainVisualization = () => {
    const overviewViz = visualizations.find(v => v.id === 'overview');
    if (!overviewViz || !overviewViz.data.length) {
      return (
        <Card className="h-96 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No trend data available</p>
          </div>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{overviewViz.title}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullScreen(!fullScreen)}
              >
                {fullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowConfiguration(true)}>
                    Configure View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setExportDialog(true)}>
                    Export Chart
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowBaselines(!showBaselines)}
                    className="flex items-center justify-between"
                  >
                    Show Baselines
                    <Switch checked={showBaselines} />
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowPredictions(!showPredictions)}
                    className="flex items-center justify-between"
                  >
                    Show Predictions
                    <Switch checked={showPredictions} />
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowAnomalies(!showAnomalies)}
                    className="flex items-center justify-between"
                  >
                    Show Anomalies
                    <Switch checked={showAnomalies} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`${fullScreen ? 'h-screen' : 'h-96'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={overviewViz.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => format(new Date(value), 'PPP')}
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(2) : value,
                    name
                  ]}
                />
                <Legend />
                
                {/* Main trend lines */}
                {configuration.metrics.map((metric, index) => (
                  <Line
                    key={metric.id}
                    type="monotone"
                    dataKey={metric.id}
                    stroke={`hsl(${index * 45}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ fill: `hsl(${index * 45}, 70%, 50%)`, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: `hsl(${index * 45}, 70%, 50%)`, strokeWidth: 2 }}
                    connectNulls={false}
                    onClick={(data, index) => handleTrendClick(data as any, { metric, timePoint: data })}
                  />
                ))}

                {/* Baselines */}
                {showBaselines && state.baselines.map((baseline, index) => (
                  <Line
                    key={`baseline-${baseline.id}`}
                    type="monotone"
                    dataKey={`baseline_${baseline.metric}`}
                    stroke={`hsl(${index * 45 + 180}, 50%, 60%)`}
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={true}
                  />
                ))}

                {/* Predictions */}
                {showPredictions && state.predictions.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="predicted_value"
                    stroke="orange"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ fill: 'orange', strokeWidth: 2, r: 3 }}
                    connectNulls={true}
                  />
                )}

                {/* Anomalies */}
                {showAnomalies && state.anomalies.length > 0 && (
                  <Scatter
                    dataKey="anomaly_value"
                    fill="red"
                    shape="circle"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInsightsPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5" />
          <span>AI-Generated Insights</span>
          <Badge variant="secondary">{state.insights.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {state.insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={insight.type === 'positive' ? 'default' : 
                              insight.type === 'negative' ? 'destructive' : 'secondary'}
                    >
                      {insight.type}
                    </Badge>
                    <Badge variant="outline">{insight.confidence.toFixed(0)}% confidence</Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                {insight.impact && (
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>Impact: {insight.impact.level}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Generated: {format(new Date(insight.generatedAt), 'MMM dd, HH:mm')}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
            {state.insights.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No insights generated yet</p>
                <p className="text-sm text-muted-foreground">Check back as more data is analyzed</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderAnomaliesTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Quality Anomalies</span>
          <Badge variant="destructive">{state.anomalies.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Detected</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Deviation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.anomalies.slice(0, 10).map((anomaly) => (
              <TableRow key={anomaly.id}>
                <TableCell>
                  {format(new Date(anomaly.detectedAt), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="truncate max-w-32 block">
                          {anomaly.assetName}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{anomaly.assetName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{anomaly.metric}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      anomaly.severity === 'critical' ? 'destructive' :
                      anomaly.severity === 'high' ? 'destructive' :
                      anomaly.severity === 'medium' ? 'secondary' : 'outline'
                    }
                  >
                    {anomaly.severity}
                  </Badge>
                </TableCell>
                <TableCell>{anomaly.expectedValue.toFixed(2)}</TableCell>
                <TableCell>{anomaly.actualValue.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`font-mono ${anomaly.deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {anomaly.deviation > 0 ? '+' : ''}{(anomaly.deviation * 100).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading quality trends...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quality Trends Analysis</h2>
          <p className="text-muted-foreground">
            AI-powered quality trend analysis and forecasting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search trends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" onClick={() => setShowConfiguration(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setExportDialog(true)}>
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50' : ''}
            >
              {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">
            Insights
            {state.insights.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.insights.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            Anomalies
            {state.anomalies.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {state.anomalies.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderMainVisualization()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderInsightsPanel()}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {state.recommendations.map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{rec.priority}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Est. Impact: {rec.estimatedImpact}%
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        {rec.actionItems && rec.actionItems.length > 0 && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm">
                              View Actions ({rec.actionItems.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderInsightsPanel()}
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          {renderAnomaliesTable()}
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Quality Forecasts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={state.predictions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="timestamp"
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <RechartsTooltip
                      labelFormatter={(value) => format(new Date(value), 'PPP')}
                    />
                    <Legend />
                    
                    <Line
                      type="monotone"
                      dataKey="predictedValue"
                      stroke="blue"
                      strokeWidth={2}
                      name="Predicted"
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceUpper"
                      stackId="confidence"
                      stroke="none"
                      fill="blue"
                      fillOpacity={0.1}
                      name="Confidence Interval"
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceLower"
                      stackId="confidence"
                      stroke="none"
                      fill="white"
                      fillOpacity={1}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Metric Correlations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96">
                  {/* Correlation heatmap would go here */}
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <p className="text-muted-foreground">Correlation Heatmap</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Strong Correlations</h4>
                  <div className="space-y-3">
                    {correlations
                      .filter(c => Math.abs(c.correlation) > 0.7)
                      .map((correlation) => (
                        <div key={`${correlation.metric1.id}-${correlation.metric2.id}`} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {correlation.metric1.name} ↔ {correlation.metric2.name}
                            </span>
                            <Badge variant={correlation.relationship === 'positive' ? 'default' : 'destructive'}>
                              {correlation.correlation.toFixed(3)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {correlation.strength} {correlation.relationship} correlation
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Confidence: {(correlation.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityTrendsAnalyzer;