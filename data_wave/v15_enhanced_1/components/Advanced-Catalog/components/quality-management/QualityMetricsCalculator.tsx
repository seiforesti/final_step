// ============================================================================
// QUALITY METRICS CALCULATOR - ADVANCED CATALOG QUALITY MANAGEMENT
// ============================================================================
// Enterprise-grade quality metrics calculation with AI-powered analytics
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Switch,
  Slider,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui";
import { 
  Calculator,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Gauge,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Brain,
  Lightbulb,
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
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Thermometer,
  Timer,
  Stopwatch,
  Battery,
  BatteryLow,
  Fuel,
  Anchor,
  Compass,
  MapPin,
  Radar,
  Satellite,
  Radio,
  Mic,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  FileText,
  FileCode,
  FileCheck,
  FileX,
  FolderOpen,
  Folder,
  Upload,
  Import,
  Export,
  Link,
  Unlink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Home,
  Settings2,
  Cog,
  Wrench,
  Tool,
  Hammer,
  Screwdriver,
  PaintBucket,
  Palette,
  Brush,
  Pen,
  PenTool,
  Scissors,
  Paperclip,
  Pin,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  Send,
  Reply,
  Forward,
  Undo,
  Redo,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Diamond,
  Hash,
  AtSign,
  Percent,
  Equal,
  NotEqual,
  GreaterThan,
  LessThan,
  Infinity,
  AlarmClock,
  Watch,
  Hourglass,
  Calendar,
  CalendarDays,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  ListOrdered
} from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { 
  LineChart, 
  AreaChart, 
  BarChart,
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
  Radar as RechartsRadar,
  FunnelChart,
  Funnel,
  TreemapChart,
  Treemap
} from 'recharts';

// Import services and types
import { 
  CatalogQualityService,
  CatalogAnalyticsService,
  DataProfilingService
} from '../../services';
import { 
  QualityMetric,
  QualityDimension,
  QualityMetricDefinition,
  QualityMetricCalculation,
  QualityMetricResult,
  QualityMetricTrend,
  QualityMetricComparison,
  QualityMetricThreshold,
  QualityMetricAlert,
  QualityMetricInsight,
  QualityMetricRecommendation,
  QualityMetricWeight,
  QualityMetricFormula,
  QualityMetricValidation,
  QualityMetricAggregation,
  QualityMetricBaseline,
  QualityMetricBenchmark,
  QualityMetricTarget,
  QualityMetricScore,
  QualityMetricRanking,
  QualityMetricCorrelation,
  QualityMetricDistribution,
  QualityMetricHistogram,
  QualityMetricPercentile,
  QualityMetricOutlier,
  QualityMetricAnomaly,
  QualityMetricPattern,
  QualityMetricForecast,
  QualityMetricImpact,
  QualityMetricSensitivity,
  QualityMetricOptimization,
  TimePeriod,
  MetricCalculationType,
  MetricAggregationType,
  MetricWeightingMethod,
  MetricNormalizationMethod,
  MetricValidationRule,
  MetricExportConfig
} from '../../types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface QualityMetricsCalculatorProps {
  className?: string;
  assets?: string[];
  dimensions?: QualityDimension[];
  timePeriod?: TimePeriod;
  realTimeUpdates?: boolean;
  enablePredictiveAnalytics?: boolean;
  enableBenchmarking?: boolean;
  onMetricCalculated?: (metric: QualityMetricResult) => void;
  onThresholdBreached?: (alert: QualityMetricAlert) => void;
  onInsightGenerated?: (insight: QualityMetricInsight) => void;
}

interface MetricCalculatorState {
  loading: boolean;
  calculating: boolean;
  error: string | null;
  definitions: QualityMetricDefinition[];
  calculations: QualityMetricCalculation[];
  results: QualityMetricResult[];
  trends: QualityMetricTrend[];
  comparisons: QualityMetricComparison[];
  thresholds: QualityMetricThreshold[];
  alerts: QualityMetricAlert[];
  insights: QualityMetricInsight[];
  recommendations: QualityMetricRecommendation[];
  baselines: QualityMetricBaseline[];
  benchmarks: QualityMetricBenchmark[];
  targets: QualityMetricTarget[];
  correlations: QualityMetricCorrelation[];
  distributions: QualityMetricDistribution[];
  forecasts: QualityMetricForecast[];
  optimizations: QualityMetricOptimization[];
}

interface MetricConfiguration {
  dimensions: QualityDimension[];
  aggregationType: MetricAggregationType;
  calculationType: MetricCalculationType;
  weightingMethod: MetricWeightingMethod;
  normalizationMethod: MetricNormalizationMethod;
  timePeriod: TimePeriod;
  includeBaselines: boolean;
  includeBenchmarks: boolean;
  includeTargets: boolean;
  enableRealTime: boolean;
  enablePredictions: boolean;
  enableOptimization: boolean;
  customWeights: Record<string, number>;
  validationRules: MetricValidationRule[];
  alertThresholds: QualityMetricThreshold[];
}

interface MetricVisualization {
  id: string;
  type: 'gauge' | 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'scatter' | 'heatmap' | 'treemap' | 'funnel';
  title: string;
  data: any[];
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
}

interface MetricFormula {
  id: string;
  name: string;
  expression: string;
  variables: string[];
  description: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  dependencies: string[];
  validationRules: string[];
  examples: string[];
}

interface MetricBenchmark {
  id: string;
  name: string;
  industry: string;
  segment: string;
  value: number;
  percentile: number;
  source: string;
  lastUpdated: Date;
  reliability: number;
  coverage: string[];
}

interface MetricOptimization {
  id: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  potentialImpact: number;
  confidence: number;
  timeframe: string;
  cost: number;
  effort: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  dependencies: string[];
  prerequisites: string[];
}

interface MetricSensitivityAnalysis {
  metric: string;
  variables: Array<{
    name: string;
    impact: number;
    confidence: number;
    direction: 'positive' | 'negative';
    elasticity: number;
  }>;
  scenarios: Array<{
    name: string;
    variables: Record<string, number>;
    expectedValue: number;
    confidence: number;
  }>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const QualityMetricsCalculator: React.FC<QualityMetricsCalculatorProps> = ({
  className,
  assets = [],
  dimensions = [],
  timePeriod,
  realTimeUpdates = false,
  enablePredictiveAnalytics = true,
  enableBenchmarking = true,
  onMetricCalculated,
  onThresholdBreached,
  onInsightGenerated
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<MetricCalculatorState>({
    loading: false,
    calculating: false,
    error: null,
    definitions: [],
    calculations: [],
    results: [],
    trends: [],
    comparisons: [],
    thresholds: [],
    alerts: [],
    insights: [],
    recommendations: [],
    baselines: [],
    benchmarks: [],
    targets: [],
    correlations: [],
    distributions: [],
    forecasts: [],
    optimizations: []
  });

  const [configuration, setConfiguration] = useState<MetricConfiguration>({
    dimensions: dimensions,
    aggregationType: 'weighted_average',
    calculationType: 'composite',
    weightingMethod: 'equal',
    normalizationMethod: 'z_score',
    timePeriod: timePeriod || {
      start: subMonths(new Date(), 1),
      end: new Date(),
      granularity: 'daily'
    },
    includeBaselines: true,
    includeBenchmarks: enableBenchmarking,
    includeTargets: true,
    enableRealTime: realTimeUpdates,
    enablePredictions: enablePredictiveAnalytics,
    enableOptimization: true,
    customWeights: {},
    validationRules: [],
    alertThresholds: []
  });

  const [visualizations, setVisualizations] = useState<MetricVisualization[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [calculationInProgress, setCalculationInProgress] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [comparisonMode, setComparisonMode] = useState<'time' | 'dimension' | 'asset'>('time');
  const [sensitivityAnalysis, setSensitivityAnalysis] = useState<MetricSensitivityAnalysis | null>(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'excellent' | 'good' | 'poor' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'trend' | 'impact'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [autoRefresh, setAutoRefresh] = useState(realTimeUpdates);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const [exportDialog, setExportDialog] = useState(false);
  const [formulaDialog, setFormulaDialog] = useState(false);
  const [benchmarkDialog, setBenchmarkDialog] = useState(false);
  const [optimizationDialog, setOptimizationDialog] = useState(false);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const calculationWorkerRef = useRef<Worker | null>(null);

  // ============================================================================
  // SERVICE INITIALIZATION
  // ============================================================================

  const qualityService = useMemo(() => new CatalogQualityService(), []);
  const analyticsService = useMemo(() => new CatalogAnalyticsService(), []);
  const profilingService = useMemo(() => new DataProfilingService(), []);

  // ============================================================================
  // DATA LOADING AND PROCESSING
  // ============================================================================

  const loadMetricDefinitions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load metric definitions
      const definitionsResponse = await qualityService.getQualityMetricDefinitions({
        dimensions: configuration.dimensions.map(d => d.id),
        includeFormulas: true,
        includeValidationRules: true,
        includeThresholds: true
      });

      // Load baselines if enabled
      let baselines: QualityMetricBaseline[] = [];
      if (configuration.includeBaselines) {
        const baselinesResponse = await qualityService.getQualityBaselines({
          dimensions: configuration.dimensions.map(d => d.id),
          timePeriod: configuration.timePeriod,
          includeStatistical: true,
          includeBusinessRules: true
        });
        baselines = baselinesResponse.data;
      }

      // Load benchmarks if enabled
      let benchmarks: QualityMetricBenchmark[] = [];
      if (configuration.includeBenchmarks) {
        const benchmarksResponse = await qualityService.getQualityBenchmarks({
          dimensions: configuration.dimensions.map(d => d.id),
          includeIndustryData: true,
          includeCompetitorData: true
        });
        benchmarks = benchmarksResponse.data;
      }

      // Load targets if enabled
      let targets: QualityMetricTarget[] = [];
      if (configuration.includeTargets) {
        const targetsResponse = await qualityService.getQualityTargets({
          dimensions: configuration.dimensions.map(d => d.id),
          timePeriod: configuration.timePeriod,
          includeStrategic: true,
          includeOperational: true
        });
        targets = targetsResponse.data;
      }

      // Load existing thresholds
      const thresholdsResponse = await qualityService.getQualityThresholds({
        dimensions: configuration.dimensions.map(d => d.id),
        includeAlertRules: true
      });

      setState(prev => ({
        ...prev,
        loading: false,
        definitions: definitionsResponse.data,
        baselines,
        benchmarks,
        targets,
        thresholds: thresholdsResponse.data
      }));

    } catch (error) {
      console.error('Error loading metric definitions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load metric definitions'
      }));
    }
  }, [qualityService, configuration]);

  const calculateMetrics = useCallback(async (config: MetricConfiguration) => {
    setState(prev => ({ ...prev, calculating: true, error: null }));
    setCalculationInProgress(true);

    try {
      // Calculate metrics
      const calculationResponse = await qualityService.calculateQualityMetrics({
        assets,
        dimensions: config.dimensions.map(d => d.id),
        timePeriod: config.timePeriod,
        aggregationType: config.aggregationType,
        calculationType: config.calculationType,
        weightingMethod: config.weightingMethod,
        normalizationMethod: config.normalizationMethod,
        customWeights: config.customWeights,
        validationRules: config.validationRules,
        includeBaselines: config.includeBaselines,
        includeBenchmarks: config.includeBenchmarks,
        includeTargets: config.includeTargets,
        enableRealTime: config.enableRealTime
      });

      // Calculate trends
      const trendsResponse = await qualityService.calculateQualityTrends({
        metrics: calculationResponse.data.map(r => r.id),
        timePeriod: config.timePeriod,
        includeForecasts: config.enablePredictions,
        includeSeasonality: true,
        includeAnomalies: true
      });

      // Calculate comparisons
      const comparisonsResponse = await qualityService.calculateQualityComparisons({
        metrics: calculationResponse.data.map(r => r.id),
        comparisonType: comparisonMode,
        includeBaselines: config.includeBaselines,
        includeBenchmarks: config.includeBenchmarks,
        includeTargets: config.includeTargets
      });

      // Calculate correlations
      const correlationsResponse = await analyticsService.calculateMetricCorrelations({
        metrics: calculationResponse.data.map(r => r.id),
        timePeriod: config.timePeriod,
        minCorrelation: 0.3,
        includeSignificance: true
      });

      // Calculate distributions
      const distributionsResponse = await analyticsService.calculateMetricDistributions({
        metrics: calculationResponse.data.map(r => r.id),
        includeHistograms: true,
        includePercentiles: true,
        includeOutliers: true
      });

      // Generate insights
      const insightsResponse = await qualityService.generateQualityInsights({
        results: calculationResponse.data,
        trends: trendsResponse.data,
        comparisons: comparisonsResponse.data,
        correlations: correlationsResponse.data,
        includeRecommendations: true,
        includeActionItems: true
      });

      // Calculate forecasts if enabled
      let forecasts: QualityMetricForecast[] = [];
      if (config.enablePredictions) {
        const forecastsResponse = await qualityService.forecastQualityMetrics({
          metrics: calculationResponse.data.map(r => r.id),
          forecastPeriod: {
            start: new Date(),
            end: subMonths(new Date(), -3),
            granularity: config.timePeriod.granularity
          },
          confidence: 0.95,
          includeScenarios: true
        });
        forecasts = forecastsResponse.data;
      }

      // Calculate optimizations if enabled
      let optimizations: QualityMetricOptimization[] = [];
      if (config.enableOptimization) {
        const optimizationsResponse = await qualityService.optimizeQualityMetrics({
          metrics: calculationResponse.data.map(r => r.id),
          targets: state.targets,
          constraints: {
            budget: 100000,
            timeframe: '6_months',
            riskTolerance: 'medium'
          },
          includeROI: true,
          includeFeasibility: true
        });
        optimizations = optimizationsResponse.data;
      }

      // Check for threshold breaches and generate alerts
      const alerts = calculationResponse.data.reduce((acc: QualityMetricAlert[], result) => {
        const thresholds = state.thresholds.filter(t => t.metricId === result.id);
        thresholds.forEach(threshold => {
          if (
            (threshold.operator === 'greater_than' && result.value > threshold.value) ||
            (threshold.operator === 'less_than' && result.value < threshold.value) ||
            (threshold.operator === 'equals' && result.value === threshold.value)
          ) {
            acc.push({
              id: `alert-${result.id}-${threshold.id}`,
              metricId: result.id,
              thresholdId: threshold.id,
              severity: threshold.severity,
              message: `Metric ${result.name} breached threshold: ${result.value} ${threshold.operator} ${threshold.value}`,
              timestamp: new Date(),
              acknowledged: false,
              resolved: false
            });
          }
        });
        return acc;
      }, []);

      // Update state
      setState(prev => ({
        ...prev,
        calculating: false,
        results: calculationResponse.data,
        trends: trendsResponse.data,
        comparisons: comparisonsResponse.data,
        correlations: correlationsResponse.data,
        distributions: distributionsResponse.data,
        insights: insightsResponse.data,
        recommendations: insightsResponse.data.recommendations || [],
        forecasts,
        optimizations,
        alerts: [...prev.alerts, ...alerts]
      }));

      // Generate visualizations
      await generateVisualizations(calculationResponse.data, trendsResponse.data);

      // Trigger callbacks
      calculationResponse.data.forEach(result => {
        if (onMetricCalculated) {
          onMetricCalculated(result);
        }
      });

      alerts.forEach(alert => {
        if (onThresholdBreached) {
          onThresholdBreached(alert);
        }
      });

      insightsResponse.data.forEach(insight => {
        if (onInsightGenerated) {
          onInsightGenerated(insight);
        }
      });

    } catch (error) {
      console.error('Error calculating metrics:', error);
      setState(prev => ({
        ...prev,
        calculating: false,
        error: error instanceof Error ? error.message : 'Failed to calculate metrics'
      }));
    } finally {
      setCalculationInProgress(false);
    }
  }, [
    qualityService,
    analyticsService,
    assets,
    state.thresholds,
    state.targets,
    comparisonMode,
    onMetricCalculated,
    onThresholdBreached,
    onInsightGenerated
  ]);

  const generateVisualizations = useCallback(async (
    results: QualityMetricResult[],
    trends: QualityMetricTrend[]
  ) => {
    const visualizations: MetricVisualization[] = [];

    // Overall score gauge
    const overallScore = results.reduce((sum, r) => sum + r.value, 0) / results.length;
    visualizations.push({
      id: 'overall-gauge',
      type: 'gauge',
      title: 'Overall Quality Score',
      data: [{ value: overallScore, max: 100 }],
      config: {
        min: 0,
        max: 100,
        thresholds: [
          { value: 60, color: 'red' },
          { value: 80, color: 'yellow' },
          { value: 100, color: 'green' }
        ]
      },
      position: { x: 0, y: 0 },
      size: { width: 6, height: 4 },
      visible: true
    });

    // Dimension breakdown
    const dimensionData = configuration.dimensions.map(dim => {
      const dimResults = results.filter(r => r.dimension === dim.id);
      const avgScore = dimResults.reduce((sum, r) => sum + r.value, 0) / dimResults.length || 0;
      return {
        dimension: dim.name,
        score: avgScore,
        count: dimResults.length
      };
    });

    visualizations.push({
      id: 'dimension-bar',
      type: 'bar',
      title: 'Quality by Dimension',
      data: dimensionData,
      config: {
        xKey: 'dimension',
        yKey: 'score',
        color: '#8884d8'
      },
      position: { x: 6, y: 0 },
      size: { width: 6, height: 4 },
      visible: true
    });

    // Trend analysis
    if (trends.length > 0) {
      visualizations.push({
        id: 'trends-line',
        type: 'line',
        title: 'Quality Trends',
        data: trends,
        config: {
          xKey: 'timestamp',
          yKey: 'value',
          groupBy: 'metric'
        },
        position: { x: 0, y: 4 },
        size: { width: 12, height: 4 },
        visible: true
      });
    }

    // Distribution pie chart
    const distributionData = [
      { name: 'Excellent (90-100)', value: results.filter(r => r.value >= 90).length, color: '#22c55e' },
      { name: 'Good (70-89)', value: results.filter(r => r.value >= 70 && r.value < 90).length, color: '#3b82f6' },
      { name: 'Fair (50-69)', value: results.filter(r => r.value >= 50 && r.value < 70).length, color: '#f59e0b' },
      { name: 'Poor (<50)', value: results.filter(r => r.value < 50).length, color: '#ef4444' }
    ];

    visualizations.push({
      id: 'distribution-pie',
      type: 'pie',
      title: 'Quality Distribution',
      data: distributionData,
      config: {
        dataKey: 'value',
        nameKey: 'name'
      },
      position: { x: 0, y: 8 },
      size: { width: 6, height: 4 },
      visible: true
    });

    // Correlation heatmap
    if (state.correlations.length > 0) {
      visualizations.push({
        id: 'correlation-heatmap',
        type: 'heatmap',
        title: 'Metric Correlations',
        data: state.correlations,
        config: {
          showValues: true,
          colorScale: ['#ef4444', '#ffffff', '#22c55e']
        },
        position: { x: 6, y: 8 },
        size: { width: 6, height: 4 },
        visible: true
      });
    }

    setVisualizations(visualizations);
  }, [configuration.dimensions, state.correlations]);

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  const setupRealTimeUpdates = useCallback(() => {
    if (!configuration.enableRealTime) return;

    // Setup WebSocket connection
    const wsUrl = `ws://localhost:8000/ws/quality-metrics/${assets.join(',')}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'metric_update') {
        setState(prev => ({
          ...prev,
          results: prev.results.map(result => 
            result.id === update.data.id ? { ...result, ...update.data } : result
          )
        }));
      } else if (update.type === 'threshold_breach') {
        const alert: QualityMetricAlert = {
          id: update.data.id,
          metricId: update.data.metricId,
          thresholdId: update.data.thresholdId,
          severity: update.data.severity,
          message: update.data.message,
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        };

        setState(prev => ({
          ...prev,
          alerts: [...prev.alerts, alert]
        }));

        if (onThresholdBreached) {
          onThresholdBreached(alert);
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
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        calculateMetrics(configuration);
      }, refreshInterval);
    }

    return () => {
      ws.close();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [
    configuration,
    assets,
    autoRefresh,
    refreshInterval,
    calculateMetrics,
    onThresholdBreached,
    onInsightGenerated
  ]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCalculateMetrics = useCallback(async () => {
    await calculateMetrics(configuration);
  }, [calculateMetrics, configuration]);

  const handleConfigurationChange = useCallback((updates: Partial<MetricConfiguration>) => {
    const newConfig = { ...configuration, ...updates };
    setConfiguration(newConfig);
  }, [configuration]);

  const handleMetricSelection = useCallback((metricIds: string[]) => {
    setSelectedMetrics(metricIds);
  }, []);

  const handleThresholdUpdate = useCallback(async (threshold: QualityMetricThreshold) => {
    try {
      await qualityService.updateQualityThreshold(threshold.id, threshold);
      setState(prev => ({
        ...prev,
        thresholds: prev.thresholds.map(t => 
          t.id === threshold.id ? threshold : t
        )
      }));
    } catch (error) {
      console.error('Failed to update threshold:', error);
    }
  }, [qualityService]);

  const handleExport = useCallback(async (config: MetricExportConfig) => {
    try {
      const exportResponse = await qualityService.exportQualityMetrics({
        results: state.results.filter(r => 
          selectedMetrics.length === 0 || selectedMetrics.includes(r.id)
        ),
        trends: state.trends,
        comparisons: state.comparisons,
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
      a.download = `quality-metrics-${format(new Date(), 'yyyy-MM-dd')}.${config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [qualityService, state, selectedMetrics]);

  const handleSensitivityAnalysis = useCallback(async (metricId: string) => {
    try {
      const analysisResponse = await analyticsService.performSensitivityAnalysis({
        metricId,
        variables: state.definitions.find(d => d.id === metricId)?.formula.variables || [],
        scenarios: ['optimistic', 'realistic', 'pessimistic'],
        confidence: 0.95
      });

      setSensitivityAnalysis(analysisResponse.data);
    } catch (error) {
      console.error('Sensitivity analysis failed:', error);
    }
  }, [analyticsService, state.definitions]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadMetricDefinitions();
  }, [loadMetricDefinitions]);

  useEffect(() => {
    if (state.definitions.length > 0) {
      calculateMetrics(configuration);
    }
  }, [state.definitions, calculateMetrics, configuration]);

  useEffect(() => {
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [setupRealTimeUpdates]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const filteredResults = useMemo(() => {
    let filtered = state.results;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply quality filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(result => {
        switch (filterBy) {
          case 'excellent':
            return result.value >= 90;
          case 'good':
            return result.value >= 70 && result.value < 90;
          case 'poor':
            return result.value >= 50 && result.value < 70;
          case 'critical':
            return result.value < 50;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'trend':
          const aTrend = state.trends.find(t => t.metricId === a.id);
          const bTrend = state.trends.find(t => t.metricId === b.id);
          aValue = aTrend?.direction === 'improving' ? 1 : aTrend?.direction === 'declining' ? -1 : 0;
          bValue = bTrend?.direction === 'improving' ? 1 : bTrend?.direction === 'declining' ? -1 : 0;
          break;
        case 'impact':
          aValue = a.businessImpact || 0;
          bValue = b.businessImpact || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [state.results, state.trends, searchTerm, filterBy, sortBy, sortOrder]);

  const metricsSummary = useMemo(() => {
    const results = filteredResults;
    
    return {
      total: results.length,
      excellent: results.filter(r => r.value >= 90).length,
      good: results.filter(r => r.value >= 70 && r.value < 90).length,
      poor: results.filter(r => r.value >= 50 && r.value < 70).length,
      critical: results.filter(r => r.value < 50).length,
      averageScore: results.reduce((sum, r) => sum + r.value, 0) / results.length || 0,
      improving: state.trends.filter(t => t.direction === 'improving').length,
      declining: state.trends.filter(t => t.direction === 'declining').length,
      activeAlerts: state.alerts.filter(a => !a.acknowledged && !a.resolved).length,
      totalInsights: state.insights.length
    };
  }, [filteredResults, state.trends, state.alerts, state.insights]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderOverviewCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Metrics</p>
              <p className="text-2xl font-bold">{metricsSummary.total}</p>
            </div>
            <Calculator className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{metricsSummary.averageScore.toFixed(1)}</p>
                <Badge 
                  variant={
                    metricsSummary.averageScore >= 80 ? 'default' :
                    metricsSummary.averageScore >= 60 ? 'secondary' : 'destructive'
                  }
                >
                  {metricsSummary.averageScore >= 80 ? 'Excellent' :
                   metricsSummary.averageScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>
            <Gauge className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trends</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-bold text-green-600">{metricsSummary.improving}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold text-red-600">{metricsSummary.declining}</span>
                </div>
              </div>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-red-600">{metricsSummary.activeAlerts}</p>
                {metricsSummary.activeAlerts > 0 && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetricsTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Quality Metrics</span>
            <Badge variant="secondary">{filteredResults.length}</Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="trend">Trend</SelectItem>
                <SelectItem value="impact">Impact</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={selectedMetrics.length === filteredResults.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMetrics(filteredResults.map(r => r.id));
                    } else {
                      setSelectedMetrics([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Dimension</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result) => {
              const trend = state.trends.find(t => t.metricId === result.id);
              const target = state.targets.find(t => t.metricId === result.id);
              
              return (
                <TableRow key={result.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedMetrics.includes(result.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMetrics([...selectedMetrics, result.id]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(id => id !== result.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {configuration.dimensions.find(d => d.id === result.dimension)?.name || result.dimension}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-lg">{result.value.toFixed(2)}</span>
                      <Progress value={result.value} className="w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {target ? (
                      <span className="font-mono">{target.value.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {trend ? (
                      <div className="flex items-center space-x-1">
                        {trend.direction === 'improving' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : trend.direction === 'declining' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm">{trend.changePercent?.toFixed(1)}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        result.value >= 90 ? 'default' :
                        result.value >= 70 ? 'secondary' :
                        result.value >= 50 ? 'outline' : 'destructive'
                      }
                    >
                      {result.value >= 90 ? 'Excellent' :
                       result.value >= 70 ? 'Good' :
                       result.value >= 50 ? 'Fair' : 'Poor'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSensitivityAnalysis(result.id)}
                            >
                              <Brain className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sensitivity Analysis</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Target className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Set Target</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderVisualizationGrid = () => (
    <div className="grid grid-cols-12 gap-4">
      {visualizations.filter(viz => viz.visible).map((viz) => (
        <Card key={viz.id} className={`col-span-${viz.size.width}`}>
          <CardHeader>
            <CardTitle className="text-lg">{viz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: `${viz.size.height * 100}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                {viz.type === 'gauge' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="relative w-32 h-32">
                      {/* Gauge implementation would go here */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{viz.data[0]?.value?.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {viz.type === 'bar' && (
                  <BarChart data={viz.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={viz.config.xKey} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey={viz.config.yKey} fill={viz.config.color} />
                  </BarChart>
                )}
                {viz.type === 'line' && (
                  <LineChart data={viz.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={viz.config.xKey} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={viz.config.yKey} 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
                {viz.type === 'pie' && (
                  <RechartsPieChart>
                    <RechartsTooltip />
                    <Legend />
                  </RechartsPieChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading metric definitions...</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Quality Metrics Calculator</h2>
          <p className="text-muted-foreground">
            Advanced quality metrics calculation and analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleCalculateMetrics}
            disabled={calculationInProgress}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {calculationInProgress ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Calculate Metrics
          </Button>
          <Button variant="outline" onClick={() => setShowConfiguration(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setExportDialog(true)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">
            Metrics
            {state.results.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.results.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="insights">
            Insights
            {state.insights.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.insights.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderVisualizationGrid()}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {renderMetricsTable()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Quality Trends Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={state.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
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
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Quality Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Quality Comparisons</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={state.comparisons}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="current" fill="#8884d8" name="Current" />
                      <Bar dataKey="baseline" fill="#82ca9d" name="Baseline" />
                      <Bar dataKey="target" fill="#ffc658" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Key Insights</h4>
                  {state.comparisons.slice(0, 5).map((comparison) => (
                    <div key={comparison.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{comparison.name}</span>
                        <Badge 
                          variant={comparison.variance > 0 ? 'default' : 'destructive'}
                        >
                          {comparison.variance > 0 ? '+' : ''}{comparison.variance.toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comparison.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Optimization Opportunities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.optimizations.map((optimization) => (
                  <div key={optimization.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{optimization.metric}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current: {optimization.currentValue} → Target: {optimization.targetValue}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{optimization.potentialImpact.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {optimization.confidence.toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{optimization.timeframe}</div>
                        <div className="text-sm text-muted-foreground">Timeframe</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">${optimization.cost.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Investment</div>
                      </div>
                      <div className="text-center">
                        <Badge 
                          variant={
                            optimization.riskLevel === 'low' ? 'default' :
                            optimization.riskLevel === 'medium' ? 'secondary' : 'destructive'
                          }
                        >
                          {optimization.riskLevel} risk
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium">Recommendations:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {optimization.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
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
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-muted-foreground">{rec.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-xs mt-3">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Generated: {format(new Date(insight.generatedAt), 'MMM dd, HH:mm')}</span>
                        </span>
                        {insight.impact && (
                          <span className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>Impact: {insight.impact.level}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {state.insights.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No insights generated yet</p>
                      <p className="text-sm text-muted-foreground">Calculate metrics to generate insights</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityMetricsCalculator;