import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Brain,
  Zap,
  Clock,
  DollarSign,
  Users,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Layers,
  GitBranch,
  Gauge,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart2,
  Sparkles,
  Award,
  Bookmark,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Plus,
  Minus,
  X,
  Edit,
  Trash2,
  Copy,
  Save,
  FileText,
  Code,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { mlApi } from '../core/api/mlApi';
import type {
  MLModel,
  ModelPerformance,
  TrainingJob,
  Prediction,
  AnalyticsMetrics,
  BusinessIntelligence,
  ModelComparison,
  PerformanceTrend,
  ResourceUtilization,
  CostAnalysis,
  UserEngagement,
  SystemHealth,
  AlertConfiguration,
  ReportConfiguration,
  DashboardWidget,
  MetricThreshold,
  TimeSeriesData,
  GeographicData,
  DeviceAnalytics,
  ModelLifecycleMetrics,
  ROICalculation,
  ComplianceMetrics,
  QualityMetrics,
  OperationalMetrics,
} from '../core/types';

// Enhanced analytics types
interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  refreshInterval: number;
  autoRefresh: boolean;
  theme: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
}

interface LayoutConfig {
  columns: number;
  rows: number;
  gap: number;
  responsive: boolean;
}

interface WidgetConfig {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map' | 'gauge' | 'heatmap';
  title: string;
  description: string;
  dataSource: string;
  visualization: VisualizationConfig;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval: number;
  filters: FilterConfig[];
}

interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar' | 'gauge';
  xAxis: string;
  yAxis: string[];
  groupBy?: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  timeRange: string;
  colors: string[];
}

interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like';
  value: any;
  type: 'text' | 'number' | 'date' | 'select';
}

interface MetricCard {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: number[];
  target?: number;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
  icon: React.ReactNode;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'ne';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: string[];
  created_at: string;
}

const DASHBOARD_THEMES = {
  light: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#34d399',
    accent: '#fbbf24',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
  },
};

const METRIC_CARDS: MetricCard[] = [
  {
    id: 'total-models',
    title: 'Total Models',
    value: 47,
    unit: '',
    change: 12,
    changeType: 'increase',
    trend: [35, 38, 42, 45, 47],
    status: 'healthy',
    description: 'Active ML models in production',
    icon: <Brain className="h-4 w-4" />,
  },
  {
    id: 'avg-accuracy',
    title: 'Average Accuracy',
    value: 94.2,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
    trend: [91.8, 92.5, 93.1, 93.8, 94.2],
    target: 95,
    status: 'healthy',
    description: 'Average model accuracy across all models',
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: 'predictions-today',
    title: 'Predictions Today',
    value: 1248567,
    unit: '',
    change: -3.2,
    changeType: 'decrease',
    trend: [1.2, 1.3, 1.4, 1.3, 1.25],
    status: 'warning',
    description: 'Total predictions made today',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: 'avg-latency',
    title: 'Average Latency',
    value: 45,
    unit: 'ms',
    change: -8.5,
    changeType: 'decrease',
    trend: [52, 49, 47, 46, 45],
    target: 50,
    status: 'healthy',
    description: 'Average prediction latency',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'cost-efficiency',
    title: 'Cost Efficiency',
    value: 87.3,
    unit: '%',
    change: 4.7,
    changeType: 'increase',
    trend: [82, 84, 85, 86, 87.3],
    target: 90,
    status: 'healthy',
    description: 'Resource utilization efficiency',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    id: 'model-drift',
    title: 'Models with Drift',
    value: 3,
    unit: '',
    change: 1,
    changeType: 'increase',
    trend: [2, 2, 3, 2, 3],
    status: 'warning',
    description: 'Models showing performance drift',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: 'training-jobs',
    title: 'Training Jobs',
    value: 12,
    unit: '',
    change: 0,
    changeType: 'neutral',
    trend: [10, 11, 12, 12, 12],
    status: 'healthy',
    description: 'Active training jobs',
    icon: <Activity className="h-4 w-4" />,
  },
  {
    id: 'data-quality',
    title: 'Data Quality',
    value: 96.8,
    unit: '%',
    change: 1.2,
    changeType: 'increase',
    trend: [95.2, 95.8, 96.1, 96.5, 96.8],
    target: 98,
    status: 'healthy',
    description: 'Overall data quality score',
    icon: <Database className="h-4 w-4" />,
  },
];

const MLAnalyticsDashboard: React.FC = () => {
  // State management
  const {
    models,
    trainingJobs,
    predictions,
    analytics,
    isLoading,
    error,
    getAnalytics,
    getPerformanceTrends,
    getBusinessIntelligence,
    getResourceUtilization,
    getCostAnalysis,
    getModelComparison,
  } = useMLIntelligence();

  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['accuracy', 'latency', 'throughput']);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ModelComparison | null>(null);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessIntelligence | null>(null);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceUtilization | null>(null);
  const [costMetrics, setCostMetrics] = useState<CostAnalysis | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dashboardTheme, setDashboardTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    loadAlertRules();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, autoRefresh, refreshInterval]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [
        analyticsData,
        trendsData,
        businessData,
        resourceData,
        costData,
      ] = await Promise.all([
        getAnalytics(selectedTimeRange),
        getPerformanceTrends(selectedTimeRange),
        getBusinessIntelligence(selectedTimeRange),
        getResourceUtilization(selectedTimeRange),
        getCostAnalysis(selectedTimeRange),
      ]);

      setPerformanceTrends(trendsData);
      setBusinessMetrics(businessData);
      setResourceMetrics(resourceData);
      setCostMetrics(costData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [selectedTimeRange, getAnalytics, getPerformanceTrends, getBusinessIntelligence, getResourceUtilization, getCostAnalysis]);

  const loadAlertRules = useCallback(async () => {
    try {
      const response = await mlApi.getAlertRules();
      setAlertRules(response.data);
    } catch (error) {
      console.error('Error loading alert rules:', error);
    }
  }, []);

  // Data preparation for visualizations
  const performanceTimeSeriesData = useMemo(() => {
    if (!performanceTrends.length) return [];
    
    return performanceTrends.map(trend => ({
      timestamp: new Date(trend.timestamp).toLocaleDateString(),
      accuracy: trend.accuracy * 100,
      precision: trend.precision * 100,
      recall: trend.recall * 100,
      f1Score: trend.f1_score * 100,
      latency: trend.latency,
      throughput: trend.throughput,
      errorRate: trend.error_rate * 100,
    }));
  }, [performanceTrends]);

  const modelDistributionData = useMemo(() => {
    if (!models.length) return [];
    
    const distribution = models.reduce((acc, model) => {
      const type = model.algorithm_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: (count / models.length * 100).toFixed(1),
    }));
  }, [models]);

  const resourceUtilizationData = useMemo(() => {
    if (!resourceMetrics) return [];
    
    return [
      { name: 'CPU', usage: resourceMetrics.cpu_usage, limit: 100 },
      { name: 'Memory', usage: resourceMetrics.memory_usage, limit: 100 },
      { name: 'GPU', usage: resourceMetrics.gpu_usage, limit: 100 },
      { name: 'Storage', usage: resourceMetrics.storage_usage, limit: 100 },
      { name: 'Network', usage: resourceMetrics.network_usage, limit: 100 },
    ];
  }, [resourceMetrics]);

  const costBreakdownData = useMemo(() => {
    if (!costMetrics) return [];
    
    return [
      { category: 'Compute', cost: costMetrics.compute_cost, percentage: 45 },
      { category: 'Storage', cost: costMetrics.storage_cost, percentage: 20 },
      { category: 'Network', cost: costMetrics.network_cost, percentage: 15 },
      { category: 'Training', cost: costMetrics.training_cost, percentage: 12 },
      { category: 'Other', cost: costMetrics.other_cost, percentage: 8 },
    ];
  }, [costMetrics]);

  const predictionVolumeData = useMemo(() => {
    // Generate sample data for the last 24 hours
    const now = new Date();
    const data = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        hour: time.getHours(),
        predictions: Math.floor(Math.random() * 10000) + 5000,
        successful: Math.floor(Math.random() * 9500) + 4500,
        failed: Math.floor(Math.random() * 500) + 50,
        latency: Math.floor(Math.random() * 20) + 30,
      });
    }
    
    return data;
  }, []);

  const geographicData = useMemo(() => {
    return [
      { country: 'United States', requests: 45230, latency: 42 },
      { country: 'United Kingdom', requests: 23450, latency: 38 },
      { country: 'Germany', requests: 18760, latency: 35 },
      { country: 'France', requests: 15230, latency: 40 },
      { country: 'Japan', requests: 12450, latency: 65 },
      { country: 'Canada', requests: 9870, latency: 45 },
      { country: 'Australia', requests: 7650, latency: 72 },
      { country: 'Brazil', requests: 6540, latency: 58 },
    ];
  }, []);

  const deviceAnalyticsData = useMemo(() => {
    return [
      { device: 'Desktop', requests: 42, accuracy: 94.5, latency: 38 },
      { device: 'Mobile', requests: 35, accuracy: 93.2, latency: 45 },
      { device: 'Tablet', requests: 15, accuracy: 94.8, latency: 42 },
      { device: 'API', requests: 8, accuracy: 96.1, latency: 28 },
    ];
  }, []);

  // Event handlers
  const handleModelComparison = useCallback(async () => {
    if (selectedModels.length < 2) {
      alert('Please select at least 2 models for comparison');
      return;
    }

    try {
      const comparison = await getModelComparison(selectedModels);
      setComparisonData(comparison);
      setActiveTab('comparison');
    } catch (error) {
      console.error('Error comparing models:', error);
    }
  }, [selectedModels, getModelComparison]);

  const handleExportDashboard = useCallback(async () => {
    try {
      const response = await mlApi.exportDashboard({
        format: exportFormat,
        timeRange: selectedTimeRange,
        metrics: selectedMetrics,
        theme: dashboardTheme,
      });
      
      // Trigger download
      const blob = new Blob([response.data], { 
        type: exportFormat === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ml-analytics-dashboard-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting dashboard:', error);
    }
  }, [exportFormat, selectedTimeRange, selectedMetrics, dashboardTheme]);

  const handleCreateAlert = useCallback(async (alertConfig: Omit<AlertRule, 'id' | 'created_at'>) => {
    try {
      const response = await mlApi.createAlertRule(alertConfig);
      setAlertRules(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error creating alert rule:', error);
    }
  }, []);

  const handleToggleAlert = useCallback(async (alertId: string, enabled: boolean) => {
    try {
      await mlApi.updateAlertRule(alertId, { enabled });
      setAlertRules(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, enabled } : alert
      ));
    } catch (error) {
      console.error('Error updating alert rule:', error);
    }
  }, []);

  // Utility functions
  const formatNumber = useCallback((value: number, unit: string = '') => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${unit}`;
    }
    return `${value}${unit}`;
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  const getChangeIcon = useCallback((changeType: string) => {
    switch (changeType) {
      case 'increase': return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'decrease': return <ArrowDown className="h-3 w-3 text-red-600" />;
      default: return <ArrowRight className="h-3 w-3 text-gray-600" />;
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              ML Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive analytics and insights for your ML models and operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button variant="outline" onClick={handleExportDashboard}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <CardDescription>
                    Customize your dashboard view with advanced filtering options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Model Types</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="classification">Classification</SelectItem>
                          <SelectItem value="regression">Regression</SelectItem>
                          <SelectItem value="clustering">Clustering</SelectItem>
                          <SelectItem value="deep_learning">Deep Learning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="deployed">Deployed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Performance Range</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Min %" type="number" />
                        <Input placeholder="Max %" type="number" />
                      </div>
                    </div>
                    <div>
                      <Label>Environment</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Environments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Environments</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {METRIC_CARDS.map((metric) => (
                <motion.div
                  key={metric.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-blue-100 dark:bg-blue-900 ${getStatusColor(metric.status)}`}>
                            {metric.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {metric.title}
                            </p>
                            <p className="text-2xl font-bold">
                              {formatNumber(metric.value, metric.unit)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {getChangeIcon(metric.changeType)}
                            <span className={`text-sm font-medium ${
                              metric.changeType === 'increase' ? 'text-green-600' :
                              metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {Math.abs(metric.change)}%
                            </span>
                          </div>
                          {metric.target && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Target: {metric.target}{metric.unit}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Mini trend chart */}
                      <div className="mt-4">
                        <ResponsiveContainer width="100%" height={60}>
                          <LineChart data={metric.trend.map((value, index) => ({ index, value }))}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={metric.changeType === 'increase' ? '#10b981' : '#ef4444'}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Status indicator */}
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        metric.status === 'healthy' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Model performance metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" name="Accuracy %" />
                      <Line type="monotone" dataKey="f1Score" stroke="#10b981" name="F1 Score %" />
                      <Line type="monotone" dataKey="precision" stroke="#f59e0b" name="Precision %" />
                      <Line type="monotone" dataKey="recall" stroke="#ef4444" name="Recall %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Prediction Volume
                  </CardTitle>
                  <CardDescription>
                    Hourly prediction volume and success rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={predictionVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="predictions" fill="#3b82f6" name="Total Predictions" />
                      <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#f59e0b" name="Avg Latency (ms)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Model Distribution and Resource Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Model Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of models by algorithm type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={modelDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                      >
                        {modelDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Resource Utilization
                  </CardTitle>
                  <CardDescription>
                    Current system resource usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resourceUtilizationData.map((resource) => (
                      <div key={resource.name}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{resource.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {resource.usage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={resource.usage} 
                          className={`h-2 ${
                            resource.usage > 90 ? 'bg-red-100' :
                            resource.usage > 75 ? 'bg-yellow-100' : 'bg-green-100'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Model Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Model Performance Comparison
                </CardTitle>
                <CardDescription>
                  Compare performance metrics across different models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Select Models to Compare</Label>
                  <div className="flex gap-2 mt-2">
                    {models.slice(0, 8).map((model) => (
                      <Badge
                        key={model.id}
                        variant={selectedModels.includes(model.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedModels(prev => 
                            prev.includes(model.id) 
                              ? prev.filter(id => id !== model.id)
                              : [...prev, model.id]
                          );
                        }}
                      >
                        {model.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { metric: 'Accuracy', model1: 94, model2: 91, model3: 96, model4: 89 },
                    { metric: 'Precision', metric: 92, model2: 94, model3: 93, model4: 87 },
                    { metric: 'Recall', model1: 89, model2: 88, model3: 94, model4: 92 },
                    { metric: 'F1 Score', model1: 90, model2: 91, model3: 95, model4: 89 },
                    { metric: 'Speed', model1: 85, model2: 92, model3: 78, model4: 95 },
                    { metric: 'Efficiency', model1: 88, model2: 85, model3: 91, model4: 82 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Model 1" dataKey="model1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                    <Radar name="Model 2" dataKey="model2" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Radar name="Model 3" dataKey="model3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                    <Radar name="Model 4" dataKey="model4" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
                <CardDescription>
                  Comprehensive performance data for all models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Precision</TableHead>
                      <TableHead>Recall</TableHead>
                      <TableHead>F1 Score</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.slice(0, 10).map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{model.algorithm_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{(model.performance?.accuracy * 100 || 0).toFixed(1)}%</span>
                            <Progress value={model.performance?.accuracy * 100 || 0} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{(model.performance?.precision * 100 || 0).toFixed(1)}%</TableCell>
                        <TableCell>{(model.performance?.recall * 100 || 0).toFixed(1)}%</TableCell>
                        <TableCell>{(model.performance?.f1_score * 100 || 0).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant={model.prediction_latency < 50 ? "default" : model.prediction_latency < 100 ? "secondary" : "destructive"}>
                            {model.prediction_latency}ms
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={model.status === 'active' ? "default" : model.status === 'training' ? "secondary" : "outline"}>
                            {model.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Performance Trends</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6">
            {/* ROI and Cost Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cost Breakdown
                  </CardTitle>
                  <CardDescription>
                    Operational costs by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={costBreakdownData}
                        dataKey="cost"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ category, percentage }) => `${category} (${percentage}%)`}
                      >
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    ROI Analysis
                  </CardTitle>
                  <CardDescription>
                    Return on investment over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { month: 'Jan', roi: 120, cost: 45000, revenue: 54000 },
                      { month: 'Feb', roi: 135, cost: 47000, revenue: 63450 },
                      { month: 'Mar', roi: 142, cost: 48000, revenue: 68160 },
                      { month: 'Apr', roi: 158, cost: 49000, revenue: 77420 },
                      { month: 'May', roi: 165, cost: 50000, revenue: 82500 },
                      { month: 'Jun', roi: 178, cost: 51000, revenue: 90780 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="roi" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Business Impact Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Business Impact Metrics
                </CardTitle>
                <CardDescription>
                  Key business indicators and improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">+23%</div>
                    <div className="text-sm text-muted-foreground">Revenue Increase</div>
                    <p className="text-xs mt-2">Attributed to ML model improvements</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">-18%</div>
                    <div className="text-sm text-muted-foreground">Cost Reduction</div>
                    <p className="text-xs mt-2">Through automation and optimization</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">+31%</div>
                    <div className="text-sm text-muted-foreground">Efficiency Gain</div>
                    <p className="text-xs mt-2">Process optimization improvements</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { metric: 'Customer Satisfaction', before: 78, after: 89, improvement: 11 },
                      { metric: 'Processing Speed', before: 65, after: 92, improvement: 27 },
                      { metric: 'Accuracy Rate', before: 84, after: 96, improvement: 12 },
                      { metric: 'Cost Efficiency', before: 72, after: 88, improvement: 16 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="before" fill="#94a3b8" name="Before" />
                      <Bar dataKey="after" fill="#3b82f6" name="After" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            {/* Resource Utilization Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Resource Utilization Trends
                </CardTitle>
                <CardDescription>
                  System resource usage patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={[
                    { time: '00:00', cpu: 45, memory: 62, gpu: 78, network: 23 },
                    { time: '04:00', cpu: 38, memory: 58, gpu: 72, network: 19 },
                    { time: '08:00', cpu: 72, memory: 81, gpu: 89, network: 45 },
                    { time: '12:00', cpu: 89, memory: 87, gpu: 94, network: 67 },
                    { time: '16:00', cpu: 94, memory: 92, gpu: 97, network: 78 },
                    { time: '20:00', cpu: 67, memory: 74, gpu: 82, network: 52 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="memory" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="gpu" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="network" stackId="1" stroke="#ef4444" fill="#ef4444" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Allocation and Scaling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Auto-Scaling Configuration
                  </CardTitle>
                  <CardDescription>
                    Current auto-scaling rules and thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">CPU Scaling</div>
                        <div className="text-sm text-muted-foreground">Scale up at 80% utilization</div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Memory Scaling</div>
                        <div className="text-sm text-muted-foreground">Scale up at 85% utilization</div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">GPU Scaling</div>
                        <div className="text-sm text-muted-foreground">Scale up at 90% utilization</div>
                      </div>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Request Queue</div>
                        <div className="text-sm text-muted-foreground">Scale up at 100 queued requests</div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage Analytics
                  </CardTitle>
                  <CardDescription>
                    Storage usage and optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Model Storage</span>
                        <span className="text-sm">2.4 TB / 5 TB</span>
                      </div>
                      <Progress value={48} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Training Data</span>
                        <span className="text-sm">1.8 TB / 3 TB</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Logs & Metrics</span>
                        <span className="text-sm">340 GB / 500 GB</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Cache</span>
                        <span className="text-sm">125 GB / 200 GB</span>
                      </div>
                      <Progress value={62.5} className="h-2" />
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Optimization Recommendations</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Archive old training data (save 200GB)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Compress model artifacts (save 150GB)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Clean up old logs (save 80GB)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            {/* Geographic Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription>
                    Request volume and performance by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData.map((region) => (
                      <div key={region.country} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{region.country}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(region.requests)} requests
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{region.latency}ms</div>
                          <div className="text-sm text-muted-foreground">avg latency</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Device Analytics
                  </CardTitle>
                  <CardDescription>
                    Performance breakdown by device type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deviceAnalyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="device" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="requests" fill="#3b82f6" name="Requests %" />
                      <Bar dataKey="accuracy" fill="#10b981" name="Accuracy %" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 space-y-2">
                    {deviceAnalyticsData.map((device) => (
                      <div key={device.device} className="flex justify-between items-center text-sm">
                        <span>{device.device}</span>
                        <div className="flex gap-4">
                          <span>{device.requests}% requests</span>
                          <span>{device.accuracy}% accuracy</span>
                          <span>{device.latency}ms latency</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regional Performance Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Regional Performance Heatmap
                </CardTitle>
                <CardDescription>
                  Performance metrics visualization across different regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-1 mb-4">
                  {Array.from({ length: 56 }, (_, i) => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded ${
                          intensity > 0.8 ? 'bg-red-500' :
                          intensity > 0.6 ? 'bg-orange-400' :
                          intensity > 0.4 ? 'bg-yellow-400' :
                          intensity > 0.2 ? 'bg-green-400' : 'bg-green-600'
                        }`}
                        title={`Region ${i + 1}: ${(intensity * 100).toFixed(1)}% performance`}
                      />
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Low Performance</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <div className="w-4 h-4 bg-orange-400 rounded"></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                  </div>
                  <span>High Performance</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {/* Alert Rules Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Alerts
                  </CardTitle>
                  <CardDescription>
                    Current system alerts and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <div className="font-medium text-red-900">High Memory Usage</div>
                        <div className="text-sm text-red-700">Memory usage exceeded 90% threshold</div>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <div className="font-medium text-yellow-900">Model Drift Detected</div>
                        <div className="text-sm text-yellow-700">Model accuracy dropped below 90%</div>
                      </div>
                      <Badge variant="secondary">Warning</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-blue-900">Training Completed</div>
                        <div className="text-sm text-blue-700">New model training finished successfully</div>
                      </div>
                      <Badge variant="outline">Info</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Alert Rules
                  </CardTitle>
                  <CardDescription>
                    Configure alert thresholds and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alertRules.slice(0, 5).map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.metric} {rule.condition} {rule.threshold}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            rule.severity === 'critical' ? 'destructive' :
                            rule.severity === 'high' ? 'secondary' : 'outline'
                          }>
                            {rule.severity}
                          </Badge>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => handleToggleAlert(rule.id, enabled)}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Alert Rule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Alert Rule</DialogTitle>
                          <DialogDescription>
                            Set up a new alert rule for monitoring
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Alert Name</Label>
                            <Input placeholder="Enter alert name" />
                          </div>
                          <div>
                            <Label>Metric</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select metric" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                                <SelectItem value="memory_usage">Memory Usage</SelectItem>
                                <SelectItem value="model_accuracy">Model Accuracy</SelectItem>
                                <SelectItem value="prediction_latency">Prediction Latency</SelectItem>
                                <SelectItem value="error_rate">Error Rate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Condition</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gt">Greater than</SelectItem>
                                  <SelectItem value="lt">Less than</SelectItem>
                                  <SelectItem value="eq">Equal to</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Threshold</Label>
                              <Input type="number" placeholder="Enter threshold" />
                            </div>
                          </div>
                          <div>
                            <Label>Severity</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full">Create Alert Rule</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alert History and Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Alert History & Trends
                </CardTitle>
                <CardDescription>
                  Historical alert data and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { date: '2024-01-01', critical: 2, high: 5, medium: 8, low: 12 },
                    { date: '2024-01-02', critical: 1, high: 3, medium: 6, low: 9 },
                    { date: '2024-01-03', critical: 3, high: 7, medium: 10, low: 15 },
                    { date: '2024-01-04', critical: 0, high: 2, medium: 4, low: 8 },
                    { date: '2024-01-05', critical: 1, high: 4, medium: 7, low: 11 },
                    { date: '2024-01-06', critical: 2, high: 6, medium: 9, low: 13 },
                    { date: '2024-01-07', critical: 0, high: 1, medium: 3, low: 6 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="low" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Report Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Reports
                </CardTitle>
                <CardDescription>
                  Create comprehensive analytics reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Report Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance Summary</SelectItem>
                          <SelectItem value="business">Business Intelligence</SelectItem>
                          <SelectItem value="technical">Technical Analysis</SelectItem>
                          <SelectItem value="cost">Cost Analysis</SelectItem>
                          <SelectItem value="compliance">Compliance Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Time Period</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Output Format</Label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xlsx">Excel</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Include Sections</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="executive-summary" defaultChecked />
                          <Label htmlFor="executive-summary">Executive Summary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="performance-metrics" defaultChecked />
                          <Label htmlFor="performance-metrics">Performance Metrics</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="cost-analysis" defaultChecked />
                          <Label htmlFor="cost-analysis">Cost Analysis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="recommendations" defaultChecked />
                          <Label htmlFor="recommendations">Recommendations</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleExportDashboard} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Recent Reports</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Monthly Performance Report</div>
                          <div className="text-sm text-muted-foreground">Generated on Jan 15, 2024</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Cost Analysis Q4 2023</div>
                          <div className="text-sm text-muted-foreground">Generated on Jan 10, 2024</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Business Intelligence Summary</div>
                          <div className="text-sm text-muted-foreground">Generated on Jan 8, 2024</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Reports
                </CardTitle>
                <CardDescription>
                  Manage automated report generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Weekly Performance Summary</div>
                      <div className="text-sm text-muted-foreground">
                        Every Monday at 9:00 AM • Next: Jan 22, 2024
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Monthly Business Report</div>
                      <div className="text-sm text-muted-foreground">
                        First day of each month • Next: Feb 1, 2024
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Quarterly Cost Analysis</div>
                      <div className="text-sm text-muted-foreground">
                        End of each quarter • Next: Mar 31, 2024
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Paused</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scheduled Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default MLAnalyticsDashboard;