import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, Treemap
} from 'recharts';
import {
  BarChart3, TrendingUp, Activity, Zap, Brain, Target, Award,
  Clock, Users, Database, Monitor, Cpu, Network, AlertTriangle,
  CheckCircle, XCircle, Info, Settings, Search, Filter, Download,
  Upload, Refresh, Play, Pause, Stop, MoreVertical, Eye, Edit,
  Trash2, Plus, Minus, ArrowUp, ArrowDown, ArrowRight, Calendar,
  Globe, Shield, Lock, Unlock, Star, Heart, Bookmark, Share,
  MessageSquare, Bell, Mail, Phone, Video, Mic, Camera, Image,
  File, Folder, Archive, Tag, Flag, Map, Navigation, Compass,
  Route, Layers, Grid, List, Table, Kanban, Timeline, Chart,
  PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon
} from 'lucide-react';

// Import custom hooks and utilities
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';

// TypeScript Interfaces for AI Analytics Dashboard
interface AIAnalyticsDashboardState {
  isLoading: boolean;
  error: string | null;
  analytics: AIAnalyticsData;
  performance: AIPerformanceMetrics;
  insights: AIInsightCollection;
  reports: AIReportCollection;
  dashboards: CustomDashboard[];
  visualizations: VisualizationConfig[];
  filters: AnalyticsFilters;
  preferences: DashboardPreferences;
  realTimeMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  selectedTimeRange: TimeRange;
  selectedMetrics: string[];
  selectedDimensions: string[];
  comparisonMode: boolean;
  exportSettings: ExportSettings;
  alertSettings: AlertConfiguration;
  collaborationSettings: CollaborationSettings;
}

interface AIAnalyticsData {
  id: string;
  timestamp: Date;
  timeRange: TimeRange;
  metrics: AnalyticsMetrics;
  dimensions: AnalyticsDimensions;
  kpis: KeyPerformanceIndicators;
  trends: TrendAnalysis;
  forecasts: ForecastData;
  benchmarks: BenchmarkData;
  segments: SegmentAnalysis;
  cohorts: CohortAnalysis;
  attribution: AttributionAnalysis;
  conversion: ConversionAnalysis;
  retention: RetentionAnalysis;
  churn: ChurnAnalysis;
  lifetime: LifetimeValueAnalysis;
  quality: QualityMetrics;
  efficiency: EfficiencyMetrics;
  cost: CostAnalysis;
  roi: ROIAnalysis;
  risk: RiskAssessment;
  compliance: ComplianceMetrics;
  security: SecurityMetrics;
  performance: PerformanceMetrics;
  availability: AvailabilityMetrics;
  scalability: ScalabilityMetrics;
  reliability: ReliabilityMetrics;
  usability: UsabilityMetrics;
  satisfaction: SatisfactionMetrics;
}

interface AIPerformanceMetrics {
  overall: OverallPerformance;
  models: ModelPerformanceCollection;
  agents: AgentPerformanceCollection;
  workflows: WorkflowPerformanceCollection;
  systems: SystemPerformanceCollection;
  infrastructure: InfrastructurePerformance;
  network: NetworkPerformance;
  storage: StoragePerformance;
  compute: ComputePerformance;
  memory: MemoryPerformance;
  throughput: ThroughputMetrics;
  latency: LatencyMetrics;
  accuracy: AccuracyMetrics;
  precision: PrecisionMetrics;
  recall: RecallMetrics;
  f1Score: F1ScoreMetrics;
  auc: AUCMetrics;
  mse: MSEMetrics;
  mae: MAEMetrics;
  rmse: RMSEMetrics;
  r2: R2Metrics;
  confusion: ConfusionMatrixData;
  classification: ClassificationMetrics;
  regression: RegressionMetrics;
  clustering: ClusteringMetrics;
  anomaly: AnomalyDetectionMetrics;
  nlp: NLPMetrics;
  vision: VisionMetrics;
  speech: SpeechMetrics;
  recommendation: RecommendationMetrics;
}

interface AIInsightCollection {
  automated: AutomatedInsight[];
  manual: ManualInsight[];
  scheduled: ScheduledInsight[];
  realTime: RealTimeInsight[];
  predictive: PredictiveInsight[];
  prescriptive: PrescriptiveInsight[];
  descriptive: DescriptiveInsight[];
  diagnostic: DiagnosticInsight[];
  comparative: ComparativeInsight[];
  contextual: ContextualInsight[];
  actionable: ActionableInsight[];
  strategic: StrategicInsight[];
  operational: OperationalInsight[];
  tactical: TacticalInsight[];
  financial: FinancialInsight[];
  customer: CustomerInsight[];
  product: ProductInsight[];
  market: MarketInsight[];
  competitive: CompetitiveInsight[];
  risk: RiskInsight[];
  opportunity: OpportunityInsight[];
  trend: TrendInsight[];
  pattern: PatternInsight[];
  anomaly: AnomalyInsight[];
  correlation: CorrelationInsight[];
  causation: CausationInsight[];
}

interface AIReportCollection {
  executive: ExecutiveReport[];
  operational: OperationalReport[];
  technical: TechnicalReport[];
  financial: FinancialReport[];
  compliance: ComplianceReport[];
  security: SecurityReport[];
  performance: PerformanceReport[];
  quality: QualityReport[];
  customer: CustomerReport[];
  product: ProductReport[];
  market: MarketReport[];
  competitive: CompetitiveReport[];
  risk: RiskReport[];
  audit: AuditReport[];
  scheduled: ScheduledReport[];
  adhoc: AdhocReport[];
  automated: AutomatedReport[];
  interactive: InteractiveReport[];
  dashboard: DashboardReport[];
  summary: SummaryReport[];
  detailed: DetailedReport[];
  comparative: ComparativeReport[];
  trend: TrendReport[];
  forecast: ForecastReport[];
  benchmark: BenchmarkReport[];
}

interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  type: DashboardType;
  category: DashboardCategory;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  settings: DashboardSettings;
  permissions: DashboardPermissions;
  sharing: DashboardSharing;
  collaboration: DashboardCollaboration;
  version: number;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  status: DashboardStatus;
  visibility: DashboardVisibility;
  access: DashboardAccess;
  usage: DashboardUsage;
  performance: DashboardPerformance;
  feedback: DashboardFeedback;
  analytics: DashboardAnalytics;
}

interface VisualizationConfig {
  id: string;
  type: VisualizationType;
  title: string;
  description: string;
  data: VisualizationData;
  options: VisualizationOptions;
  styling: VisualizationStyling;
  interactions: VisualizationInteractions;
  animations: VisualizationAnimations;
  responsive: VisualizationResponsive;
  accessibility: VisualizationAccessibility;
  performance: VisualizationPerformance;
  caching: VisualizationCaching;
  export: VisualizationExport;
  sharing: VisualizationSharing;
  embedding: VisualizationEmbedding;
  metadata: VisualizationMetadata;
}

interface AnalyticsFilters {
  timeRange: TimeRangeFilter;
  dateRange: DateRangeFilter;
  metrics: MetricFilter[];
  dimensions: DimensionFilter[];
  segments: SegmentFilter[];
  cohorts: CohortFilter[];
  geography: GeographyFilter;
  demographics: DemographicsFilter;
  behavior: BehaviorFilter;
  technology: TechnologyFilter;
  business: BusinessFilter;
  performance: PerformanceFilter;
  quality: QualityFilter;
  custom: CustomFilter[];
  advanced: AdvancedFilter[];
  saved: SavedFilter[];
  shared: SharedFilter[];
  recent: RecentFilter[];
  favorite: FavoriteFilter[];
  recommended: RecommendedFilter[];
}

interface DashboardPreferences {
  theme: DashboardTheme;
  layout: PreferredLayout;
  density: DisplayDensity;
  colors: ColorScheme;
  fonts: FontSettings;
  animations: AnimationSettings;
  interactions: InteractionSettings;
  notifications: NotificationSettings;
  updates: UpdateSettings;
  refresh: RefreshSettings;
  export: ExportPreferences;
  sharing: SharingPreferences;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  performance: PerformanceSettings;
  advanced: AdvancedSettings;
  personalization: PersonalizationSettings;
  customization: CustomizationSettings;
  integration: IntegrationSettings;
  automation: AutomationSettings;
  collaboration: CollaborationPreferences;
}

interface TimeRange {
  start: Date;
  end: Date;
  period: TimePeriod;
  granularity: TimeGranularity;
  timezone: string;
  comparison: TimeComparison;
  forecast: TimeForecast;
  seasonality: TimeSeasonality;
  trends: TimeTrends;
  patterns: TimePatterns;
}

interface ExportSettings {
  format: ExportFormat;
  quality: ExportQuality;
  compression: ExportCompression;
  security: ExportSecurity;
  schedule: ExportSchedule;
  destination: ExportDestination;
  notification: ExportNotification;
  metadata: ExportMetadata;
  versioning: ExportVersioning;
  archiving: ExportArchiving;
}

interface AlertConfiguration {
  enabled: boolean;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: AlertEscalation;
  suppression: AlertSuppression;
  grouping: AlertGrouping;
  routing: AlertRouting;
  templates: AlertTemplate[];
  history: AlertHistory;
  analytics: AlertAnalytics;
  automation: AlertAutomation;
  integration: AlertIntegration;
}

interface CollaborationSettings {
  enabled: boolean;
  permissions: CollaborationPermissions;
  sharing: CollaborationSharing;
  commenting: CollaborationCommenting;
  annotations: CollaborationAnnotations;
  versioning: CollaborationVersioning;
  workflows: CollaborationWorkflows;
  notifications: CollaborationNotifications;
  integration: CollaborationIntegration;
  security: CollaborationSecurity;
  audit: CollaborationAudit;
  governance: CollaborationGovernance;
}

// Additional type definitions
type DashboardType = 'executive' | 'operational' | 'analytical' | 'strategic' | 'tactical' | 'custom';
type DashboardCategory = 'overview' | 'performance' | 'quality' | 'financial' | 'customer' | 'product' | 'market';
type DashboardStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'deprecated';
type DashboardVisibility = 'public' | 'private' | 'shared' | 'restricted';
type VisualizationType = 'chart' | 'table' | 'map' | 'gauge' | 'kpi' | 'text' | 'image' | 'custom';
type TimePeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type TimeGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'xml' | 'html' | 'image';
type DashboardTheme = 'light' | 'dark' | 'auto' | 'custom';
type DisplayDensity = 'compact' | 'comfortable' | 'spacious';

// Constants
const ANALYTICS_TYPES = [
  'descriptive', 'diagnostic', 'predictive', 'prescriptive',
  'real-time', 'batch', 'streaming', 'interactive'
] as const;

const METRIC_CATEGORIES = [
  'performance', 'quality', 'efficiency', 'cost', 'roi',
  'customer', 'product', 'market', 'financial', 'operational'
] as const;

const VISUALIZATION_TYPES = [
  'line', 'bar', 'pie', 'area', 'scatter', 'radar', 'treemap',
  'heatmap', 'gauge', 'kpi', 'table', 'map', 'funnel', 'sankey'
] as const;

const TIME_RANGES = [
  { label: 'Last Hour', value: 'hour' },
  { label: 'Last 24 Hours', value: 'day' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last Quarter', value: 'quarter' },
  { label: 'Last Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' }
] as const;

const DASHBOARD_TEMPLATES = [
  { id: 'executive', name: 'Executive Overview', description: 'High-level KPIs and strategic metrics' },
  { id: 'operational', name: 'Operational Dashboard', description: 'Day-to-day operations monitoring' },
  { id: 'performance', name: 'Performance Analytics', description: 'Detailed performance analysis' },
  { id: 'quality', name: 'Quality Metrics', description: 'Quality assurance and control' },
  { id: 'financial', name: 'Financial Analysis', description: 'Financial performance and ROI' },
  { id: 'customer', name: 'Customer Insights', description: 'Customer behavior and satisfaction' }
] as const;

const EXPORT_FORMATS = [
  { label: 'PDF Report', value: 'pdf', icon: File },
  { label: 'Excel Workbook', value: 'excel', icon: Table },
  { label: 'CSV Data', value: 'csv', icon: Database },
  { label: 'JSON Data', value: 'json', icon: Archive },
  { label: 'PNG Image', value: 'png', icon: Image },
  { label: 'SVG Vector', value: 'svg', icon: Edit }
] as const;

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
] as const;

// Mock data generators
const generateAnalyticsData = (): AIAnalyticsData => ({
  id: `analytics-${Date.now()}`,
  timestamp: new Date(),
  timeRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    period: 'month',
    granularity: 'day',
    timezone: 'UTC',
    comparison: {} as TimeComparison,
    forecast: {} as TimeForecast,
    seasonality: {} as TimeSeasonality,
    trends: {} as TimeTrends,
    patterns: {} as TimePatterns
  },
  metrics: {} as AnalyticsMetrics,
  dimensions: {} as AnalyticsDimensions,
  kpis: {} as KeyPerformanceIndicators,
  trends: {} as TrendAnalysis,
  forecasts: {} as ForecastData,
  benchmarks: {} as BenchmarkData,
  segments: {} as SegmentAnalysis,
  cohorts: {} as CohortAnalysis,
  attribution: {} as AttributionAnalysis,
  conversion: {} as ConversionAnalysis,
  retention: {} as RetentionAnalysis,
  churn: {} as ChurnAnalysis,
  lifetime: {} as LifetimeValueAnalysis,
  quality: {} as QualityMetrics,
  efficiency: {} as EfficiencyMetrics,
  cost: {} as CostAnalysis,
  roi: {} as ROIAnalysis,
  risk: {} as RiskAssessment,
  compliance: {} as ComplianceMetrics,
  security: {} as SecurityMetrics,
  performance: {} as PerformanceMetrics,
  availability: {} as AvailabilityMetrics,
  scalability: {} as ScalabilityMetrics,
  reliability: {} as ReliabilityMetrics,
  usability: {} as UsabilityMetrics,
  satisfaction: {} as SatisfactionMetrics
});

const generatePerformanceData = () => [
  { name: 'Model Accuracy', value: 94.5, target: 95, trend: 2.1 },
  { name: 'Processing Speed', value: 87.2, target: 90, trend: -1.3 },
  { name: 'Resource Efficiency', value: 91.8, target: 85, trend: 4.7 },
  { name: 'Cost Optimization', value: 89.3, target: 88, trend: 1.8 },
  { name: 'User Satisfaction', value: 96.1, target: 95, trend: 3.2 },
  { name: 'System Reliability', value: 99.2, target: 99, trend: 0.8 }
];

const generateTrendData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      accuracy: 92 + Math.random() * 6,
      throughput: 800 + Math.random() * 400,
      latency: 50 + Math.random() * 30,
      errors: Math.random() * 5,
      users: 1000 + Math.random() * 500
    });
  }
  return data;
};

const generateUsageData = () => [
  { name: 'Classification Models', value: 45, color: CHART_COLORS[0] },
  { name: 'AI Agents', value: 28, color: CHART_COLORS[1] },
  { name: 'Workflows', value: 18, color: CHART_COLORS[2] },
  { name: 'Analytics', value: 9, color: CHART_COLORS[3] }
];

const generateModelPerformance = () => [
  { model: 'Text Classifier', accuracy: 94.5, precision: 93.2, recall: 95.1, f1: 94.1 },
  { model: 'Image Analyzer', accuracy: 91.8, precision: 90.5, recall: 93.2, f1: 91.8 },
  { model: 'Sentiment Engine', accuracy: 89.3, precision: 88.7, recall: 90.1, f1: 89.4 },
  { model: 'Entity Extractor', accuracy: 96.2, precision: 95.8, recall: 96.6, f1: 96.2 },
  { model: 'Topic Modeler', accuracy: 87.9, precision: 86.4, recall: 89.5, f1: 87.9 }
];

const generateCostAnalysis = () => [
  { category: 'Compute', cost: 12500, budget: 15000, variance: -16.7 },
  { category: 'Storage', cost: 3200, budget: 3500, variance: -8.6 },
  { category: 'Network', cost: 1800, budget: 2000, variance: -10.0 },
  { category: 'Licensing', cost: 8900, budget: 9000, variance: -1.1 },
  { category: 'Support', cost: 2100, budget: 2500, variance: -16.0 }
];

const generateUserActivity = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: i,
      active: Math.floor(50 + Math.random() * 200),
      peak: Math.floor(100 + Math.random() * 150)
    });
  }
  return data;
};

// Main Component
export const AIAnalyticsDashboard: React.FC = () => {
  // State Management
  const [state, setState] = useState<AIAnalyticsDashboardState>({
    isLoading: false,
    error: null,
    analytics: generateAnalyticsData(),
    performance: {} as AIPerformanceMetrics,
    insights: {} as AIInsightCollection,
    reports: {} as AIReportCollection,
    dashboards: [],
    visualizations: [],
    filters: {} as AnalyticsFilters,
    preferences: {} as DashboardPreferences,
    realTimeMode: true,
    autoRefresh: true,
    refreshInterval: 30000,
    selectedTimeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      period: 'month',
      granularity: 'day',
      timezone: 'UTC',
      comparison: {} as TimeComparison,
      forecast: {} as TimeForecast,
      seasonality: {} as TimeSeasonality,
      trends: {} as TimeTrends,
      patterns: {} as TimePatterns
    },
    selectedMetrics: ['accuracy', 'throughput', 'latency'],
    selectedDimensions: ['model', 'time', 'user'],
    comparisonMode: false,
    exportSettings: {} as ExportSettings,
    alertSettings: {} as AlertConfiguration,
    collaborationSettings: {} as CollaborationSettings
  });

  // Custom hooks
  const { classifications, updateClassification } = useClassificationState();
  const { aiModels, aiAgents, startIntelligence, stopIntelligence } = useAIIntelligence();

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const chartRefs = useRef<{ [key: string]: any }>({});

  // Memoized data
  const performanceData = useMemo(() => generatePerformanceData(), []);
  const trendData = useMemo(() => generateTrendData(), []);
  const usageData = useMemo(() => generateUsageData(), []);
  const modelPerformance = useMemo(() => generateModelPerformance(), []);
  const costAnalysis = useMemo(() => generateCostAnalysis(), []);
  const userActivity = useMemo(() => generateUserActivity(), []);

  // Effects
  useEffect(() => {
    if (state.realTimeMode && state.autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, state.refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.realTimeMode, state.autoRefresh, state.refreshInterval]);

  useEffect(() => {
    if (state.realTimeMode) {
      initializeWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [state.realTimeMode]);

  // WebSocket initialization
  const initializeWebSocket = useCallback(() => {
    try {
      websocketRef.current = websocketApi.connect('ai-analytics');
      
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Real-time connection failed' }));
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, []);

  // Event Handlers
  const handleRefreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const [analyticsData, performanceData, insightsData] = await Promise.all([
        aiApi.getAnalytics(state.selectedTimeRange),
        aiApi.getPerformanceMetrics(),
        aiApi.getInsights(state.selectedMetrics)
      ]);

      setState(prev => ({
        ...prev,
        analytics: analyticsData,
        performance: performanceData,
        insights: insightsData,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false
      }));
    }
  }, [state.selectedTimeRange, state.selectedMetrics]);

  const handleRealTimeUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      analytics: { ...prev.analytics, ...data.analytics },
      performance: { ...prev.performance, ...data.performance }
    }));
  }, []);

  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    setState(prev => ({ ...prev, selectedTimeRange: timeRange }));
    handleRefreshData();
  }, [handleRefreshData]);

  const handleMetricSelection = useCallback((metrics: string[]) => {
    setState(prev => ({ ...prev, selectedMetrics: metrics }));
  }, []);

  const handleExportDashboard = useCallback(async (format: ExportFormat) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const exportData = await aiApi.exportAnalytics({
        format,
        timeRange: state.selectedTimeRange,
        metrics: state.selectedMetrics,
        visualizations: state.visualizations
      });

      // Trigger download
      const blob = new Blob([exportData], { type: getContentType(format) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Export failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedTimeRange, state.selectedMetrics, state.visualizations]);

  const handleCreateDashboard = useCallback(async (template: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const dashboard = await aiApi.createDashboard({
        template,
        timeRange: state.selectedTimeRange,
        metrics: state.selectedMetrics
      });

      setState(prev => ({
        ...prev,
        dashboards: [...prev.dashboards, dashboard],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create dashboard',
        isLoading: false
      }));
    }
  }, [state.selectedTimeRange, state.selectedMetrics]);

  const handleScheduleReport = useCallback(async (reportConfig: any) => {
    try {
      await aiApi.scheduleReport(reportConfig);
      // Show success notification
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to schedule report'
      }));
    }
  }, []);

  const handleConfigureAlerts = useCallback(async (alertConfig: AlertConfiguration) => {
    try {
      await aiApi.configureAlerts(alertConfig);
      setState(prev => ({ ...prev, alertSettings: alertConfig }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to configure alerts'
      }));
    }
  }, []);

  // Utility functions
  const getContentType = (format: ExportFormat): string => {
    const types = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      json: 'application/json',
      png: 'image/png',
      svg: 'image/svg+xml'
    };
    return types[format] || 'application/octet-stream';
  };

  const formatMetric = (value: number, type: string): string => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
        return value.toLocaleString();
      case 'duration':
        return `${value.toFixed(1)}ms`;
      default:
        return value.toString();
    }
  };

  const getStatusColor = (value: number, target: number): string => {
    const ratio = value / target;
    if (ratio >= 0.95) return 'text-green-600';
    if (ratio >= 0.85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <ArrowRight className="h-4 w-4 text-gray-600" />;
  };

  // Render functions
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceData.map((metric, index) => (
          <Card key={metric.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-xs ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(metric.trend).toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.value, metric.target)}`}>
                    {formatMetric(metric.value, 'percentage')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Target: {formatMetric(metric.target, 'percentage')}
                  </span>
                </div>
                <Progress value={(metric.value / metric.target) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Trends</span>
          </CardTitle>
          <CardDescription>
            30-day performance metrics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke={CHART_COLORS[0]} strokeWidth={2} />
                <Line type="monotone" dataKey="throughput" stroke={CHART_COLORS[1]} strokeWidth={2} />
                <Line type="monotone" dataKey="latency" stroke={CHART_COLORS[2]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Usage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Usage Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>User Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="active" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} />
                  <Area type="monotone" dataKey="peak" stackId="2" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Model Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Model Performance Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={modelPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="model" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Accuracy" dataKey="accuracy" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
                <Radar name="Precision" dataKey="precision" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.3} />
                <Radar name="Recall" dataKey="recall" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.3} />
                <Radar name="F1 Score" dataKey="f1" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Model</th>
                  <th className="text-right p-2">Accuracy</th>
                  <th className="text-right p-2">Precision</th>
                  <th className="text-right p-2">Recall</th>
                  <th className="text-right p-2">F1 Score</th>
                  <th className="text-right p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {modelPerformance.map((model, index) => (
                  <tr key={model.model} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{model.model}</td>
                    <td className="p-2 text-right">{model.accuracy.toFixed(1)}%</td>
                    <td className="p-2 text-right">{model.precision.toFixed(1)}%</td>
                    <td className="p-2 text-right">{model.recall.toFixed(1)}%</td>
                    <td className="p-2 text-right">{model.f1.toFixed(1)}%</td>
                    <td className="p-2 text-right">
                      <Badge variant={model.accuracy > 90 ? 'default' : 'secondary'}>
                        {model.accuracy > 90 ? 'Excellent' : 'Good'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* AI-Generated Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>AI-Generated Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Performance Optimization Opportunity</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    The Text Classifier model shows 94.5% accuracy with potential for improvement through hyperparameter tuning. 
                    Estimated performance gain: +2.3%.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Cost Optimization Success</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Resource allocation optimization has reduced compute costs by 16.7% while maintaining performance levels.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Scaling Recommendation</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    User activity patterns suggest peak usage between 9-11 AM. Consider auto-scaling configuration 
                    to handle increased load efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis & Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="users" fill={CHART_COLORS[0]} stroke={CHART_COLORS[0]} fillOpacity={0.3} />
                <Bar dataKey="errors" fill={CHART_COLORS[1]} />
                <Line type="monotone" dataKey="accuracy" stroke={CHART_COLORS[2]} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <File className="h-5 w-5" />
            <span>Report Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DASHBOARD_TEMPLATES.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                   onClick={() => handleCreateDashboard(template.id)}>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                <Button size="sm" className="mt-3">
                  Generate Report
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export & Sharing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPORT_FORMATS.map((format) => (
              <Button
                key={format.value}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleExportDashboard(format.value as ExportFormat)}
              >
                <format.icon className="h-8 w-8" />
                <span>{format.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Scheduled Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-frequency">Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="report-format">Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="excel">Excel Workbook</SelectItem>
                    <SelectItem value="email">Email Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="report-recipients">Recipients</Label>
              <Textarea
                id="report-recipients"
                placeholder="Enter email addresses separated by commas"
                className="mt-1"
              />
            </div>
            <Button onClick={() => handleScheduleReport({})}>
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="real-time-mode">Real-time Mode</Label>
            <Switch
              id="real-time-mode"
              checked={state.realTimeMode}
              onCheckedChange={(checked) => setState(prev => ({ ...prev, realTimeMode: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={state.autoRefresh}
              onCheckedChange={(checked) => setState(prev => ({ ...prev, autoRefresh: checked }))}
            />
          </div>
          <div>
            <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
            <Slider
              id="refresh-interval"
              min={10}
              max={300}
              step={10}
              value={[state.refreshInterval / 1000]}
              onValueChange={([value]) => setState(prev => ({ ...prev, refreshInterval: value * 1000 }))}
              className="mt-2"
            />
            <div className="text-sm text-muted-foreground mt-1">
              Current: {state.refreshInterval / 1000} seconds
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alert Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accuracy-threshold">Accuracy Threshold (%)</Label>
              <Input
                id="accuracy-threshold"
                type="number"
                placeholder="90"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="latency-threshold">Latency Threshold (ms)</Label>
              <Input
                id="latency-threshold"
                type="number"
                placeholder="100"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="alert-channels">Alert Channels</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="email-alerts" />
                <Label htmlFor="email-alerts">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="slack-alerts" />
                <Label htmlFor="slack-alerts">Slack Integration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="webhook-alerts" />
                <Label htmlFor="webhook-alerts">Webhook Notifications</Label>
              </div>
            </div>
          </div>
          <Button onClick={() => handleConfigureAlerts({} as AlertConfiguration)}>
            Save Alert Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Retention</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="retention-period">Retention Period (days)</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-archive">Auto Archive Old Data</Label>
            <Switch id="auto-archive" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="compress-data">Compress Archived Data</Label>
            <Switch id="compress-data" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">AI Analytics Dashboard</h1>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${state.realTimeMode ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span>{state.realTimeMode ? 'Live' : 'Static'}</span>
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={state.isLoading}
          >
            <Refresh className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Settings */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Dashboard Settings</DialogTitle>
                <DialogDescription>
                  Configure your analytics dashboard preferences and settings.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                {renderSettingsTab()}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{state.error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="overview" className="mt-0">
              {renderOverviewTab()}
            </TabsContent>
            
            <TabsContent value="performance" className="mt-0">
              {renderPerformanceTab()}
            </TabsContent>
            
            <TabsContent value="insights" className="mt-0">
              {renderInsightsTab()}
            </TabsContent>
            
            <TabsContent value="reports" className="mt-0">
              {renderReportsTab()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAnalyticsDashboard;