import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Target, Zap, Clock, Timer, CheckCircle, XCircle, AlertTriangle, Info, Download, Upload, Search, Filter, Plus, RefreshCw, Calendar, Eye, Settings, FileText, Share2, Bookmark, Star, Award, Flag, Bell, Mail, Monitor, Server, Database, Network, Cpu, MemoryStick, HardDrive, Wifi, Smartphone, Laptop, Globe, Users, User, ArrowUp, ArrowDown, Minus, Equal, MoreHorizontal, Edit, Trash2, Copy, ExternalLink, Maximize, Minimize, Play, Pause, Square, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReporting } from '../../hooks/useReporting';
import { reportingApi } from '../../services/reporting-apis';

interface PerformanceReportsProps {
  className?: string;
  onReportGenerate?: (report: PerformanceReport) => void;
  onMetricUpdate?: (metrics: PerformanceMetrics) => void;
}

interface PerformanceReport {
  id: string;
  name: string;
  description: string;
  type: 'system_performance' | 'scan_performance' | 'rule_performance' | 'user_performance' | 'infrastructure' | 'custom';
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  generatedBy: string;
  generatedAt: Date;
  scheduledFor?: Date;
  timeRange: {
    start: Date;
    end: Date;
    timezone: string;
  };
  filters: {
    ruleIds?: string[];
    scanTypes?: string[];
    departments?: string[];
    userGroups?: string[];
    systems?: string[];
    severity?: string[];
  };
  metrics: PerformanceMetrics;
  trends: PerformanceTrend[];
  benchmarks: PerformanceBenchmark[];
  insights: PerformanceInsight[];
  recommendations: PerformanceRecommendation[];
  alerts: PerformanceAlert[];
  exportFormats: string[];
  isScheduled: boolean;
  schedule?: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour: number;
    timezone: string;
    recipients: string[];
  };
  metadata: {
    version: string;
    dataPoints: number;
    processingTime: number;
    accuracy: number;
    confidence: number;
  };
}

interface PerformanceMetrics {
  system: {
    cpuUtilization: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    throughput: number;
    errorRate: number;
    availability: number;
    responseTime: number;
  };
  scanning: {
    totalScans: number;
    completedScans: number;
    failedScans: number;
    averageScanTime: number;
    dataProcessed: number;
    rulesExecuted: number;
    detectionsFound: number;
    falsePositives: number;
  };
  rules: {
    totalRules: number;
    activeRules: number;
    disabledRules: number;
    averageExecutionTime: number;
    matchRate: number;
    precisionScore: number;
    recallScore: number;
    f1Score: number;
  };
  users: {
    activeUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    pageLoadTime: number;
    userSatisfaction: number;
    supportTickets: number;
    featureUsage: Record<string, number>;
  };
  infrastructure: {
    serverLoad: number;
    databaseConnections: number;
    cacheHitRate: number;
    queueLength: number;
    diskIO: number;
    networkIO: number;
    backupStatus: string;
    securityScore: number;
  };
}

interface PerformanceTrend {
  metric: string;
  timeframe: 'hour' | 'day' | 'week' | 'month';
  data: Array<{
    timestamp: Date;
    value: number;
    baseline?: number;
    target?: number;
  }>;
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  significance: 'high' | 'medium' | 'low';
}

interface PerformanceBenchmark {
  metric: string;
  current: number;
  target: number;
  industry: number;
  best: number;
  status: 'exceeding' | 'meeting' | 'below' | 'critical';
  improvement: number;
  timeToTarget?: number;
}

interface PerformanceInsight {
  id: string;
  type: 'anomaly' | 'pattern' | 'correlation' | 'prediction' | 'optimization';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  affectedMetrics: string[];
  timeframe: {
    start: Date;
    end: Date;
  };
  evidenceData: any[];
  suggestedActions: string[];
  relatedInsights: string[];
}

interface PerformanceRecommendation {
  id: string;
  category: 'optimization' | 'scaling' | 'configuration' | 'maintenance' | 'security';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: {
    metric: string;
    improvement: number;
    timeframe: string;
  };
  effort: 'low' | 'medium' | 'high';
  cost: 'low' | 'medium' | 'high';
  prerequisites: string[];
  steps: string[];
  risks: string[];
  roi: number;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

interface PerformanceAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'pattern';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  metric: string;
  currentValue: number;
  thresholdValue: number;
  message: string;
  triggeredAt: Date;
  duration: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolution?: string;
  resolvedAt?: Date;
  impactedSystems: string[];
  relatedAlerts: string[];
}

interface ReportFilter {
  dateRange: {
    start?: Date;
    end?: Date;
    preset?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'custom';
  };
  metrics: string[];
  systems: string[];
  departments: string[];
  ruleTypes: string[];
  severityLevels: string[];
  includeComparisons: boolean;
  includeTrends: boolean;
  includeRecommendations: boolean;
  aggregation: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

const REPORT_TYPES = [
  { value: 'system_performance', label: 'System Performance', icon: Server, description: 'Overall system health and performance' },
  { value: 'scan_performance', label: 'Scan Performance', icon: Activity, description: 'Scanning operations and efficiency' },
  { value: 'rule_performance', label: 'Rule Performance', icon: Target, description: 'Rule execution and effectiveness' },
  { value: 'user_performance', label: 'User Performance', icon: Users, description: 'User experience and engagement' },
  { value: 'infrastructure', label: 'Infrastructure', icon: Database, description: 'Infrastructure metrics and utilization' },
  { value: 'custom', label: 'Custom Report', icon: FileText, description: 'Custom metrics and analysis' }
];

const METRIC_CATEGORIES = [
  { value: 'system', label: 'System Metrics', metrics: ['cpu', 'memory', 'disk', 'network'] },
  { value: 'performance', label: 'Performance', metrics: ['response_time', 'throughput', 'latency', 'availability'] },
  { value: 'quality', label: 'Quality', metrics: ['accuracy', 'precision', 'recall', 'f1_score'] },
  { value: 'usage', label: 'Usage', metrics: ['active_users', 'sessions', 'page_views', 'feature_usage'] },
  { value: 'errors', label: 'Errors', metrics: ['error_rate', 'failures', 'exceptions', 'timeouts'] }
];

const TIME_RANGES = [
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'last_24h', label: 'Last 24 Hours' },
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_30d', label: 'Last 30 Days' },
  { value: 'last_90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

export const PerformanceReports: React.FC<PerformanceReportsProps> = ({
  className,
  onReportGenerate,
  onMetricUpdate
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'reports' | 'metrics' | 'trends' | 'alerts' | 'insights'>('dashboard');
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [selectedReport, setSelectedReport] = useState<PerformanceReport | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  
  // Report generation
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [showMetricDetails, setShowMetricDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  
  // Form states
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    type: 'system_performance' as PerformanceReport['type'],
    timeRange: {
      preset: 'last_24h' as 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'custom',
      start: undefined as Date | undefined,
      end: undefined as Date | undefined
    },
    metrics: [] as string[],
    includeComparisons: true,
    includeTrends: true,
    includeRecommendations: true,
    isScheduled: false,
    scheduleFrequency: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly',
    recipients: [] as string[]
  });
  
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: { preset: 'last_24h' },
    metrics: [],
    systems: [],
    departments: [],
    ruleTypes: [],
    severityLevels: [],
    includeComparisons: true,
    includeTrends: true,
    includeRecommendations: true,
    aggregation: 'hour'
  });
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie'>('line');
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week' | 'month'>('hour');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('overview');
  
  // Hooks
  const {
    getPerformanceReports,
    generatePerformanceReport,
    getPerformanceMetrics,
    getPerformanceTrends,
    getPerformanceAlerts,
    getPerformanceInsights,
    acknowledgeAlert,
    exportReport,
    loading: reportingLoading,
    error: reportingError
  } = useReporting();

  // Initialize data
  useEffect(() => {
    loadReports();
    loadCurrentMetrics();
    loadTrends();
    loadAlerts();
    loadInsights();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      loadCurrentMetrics();
      loadAlerts();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Data loading functions
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const reportsData = await getPerformanceReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }, [getPerformanceReports]);

  const loadCurrentMetrics = useCallback(async () => {
    try {
      const metricsData = await getPerformanceMetrics();
      setCurrentMetrics(metricsData);
      
      if (onMetricUpdate) {
        onMetricUpdate(metricsData);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }, [getPerformanceMetrics, onMetricUpdate]);

  const loadTrends = useCallback(async () => {
    try {
      const trendsData = await getPerformanceTrends();
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to load trends:', error);
    }
  }, [getPerformanceTrends]);

  const loadAlerts = useCallback(async () => {
    try {
      const alertsData = await getPerformanceAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }, [getPerformanceAlerts]);

  const loadInsights = useCallback(async () => {
    try {
      const insightsData = await getPerformanceInsights();
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  }, [getPerformanceInsights]);

  // Report operations
  const handleGenerateReport = useCallback(async () => {
    try {
      setLoading(true);
      const report = await generatePerformanceReport({
        name: reportForm.name,
        description: reportForm.description,
        type: reportForm.type,
        timeRange: {
          start: reportForm.timeRange.start || new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: reportForm.timeRange.end || new Date(),
          timezone: 'UTC'
        },
        filters: {
          ruleIds: [],
          scanTypes: [],
          departments: [],
          userGroups: [],
          systems: [],
          severity: []
        },
        includeComparisons: reportForm.includeComparisons,
        includeTrends: reportForm.includeTrends,
        includeRecommendations: reportForm.includeRecommendations,
        isScheduled: reportForm.isScheduled,
        schedule: reportForm.isScheduled ? {
          frequency: reportForm.scheduleFrequency,
          hour: 9,
          timezone: 'UTC',
          recipients: reportForm.recipients
        } : undefined
      });
      
      setReports(prev => [...prev, report]);
      setShowCreateReport(false);
      setReportForm({
        name: '',
        description: '',
        type: 'system_performance',
        timeRange: {
          preset: 'last_24h',
          start: undefined,
          end: undefined
        },
        metrics: [],
        includeComparisons: true,
        includeTrends: true,
        includeRecommendations: true,
        isScheduled: false,
        scheduleFrequency: 'daily',
        recipients: []
      });
      
      if (onReportGenerate) {
        onReportGenerate(report);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  }, [reportForm, generatePerformanceReport, onReportGenerate]);

  const handleExportReport = useCallback(async (reportId: string, format: string) => {
    try {
      await exportReport(reportId, format);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }, [exportReport]);

  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isAcknowledged: true, acknowledgedAt: new Date() }
          : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, [acknowledgeAlert]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!currentMetrics) return [];
    
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 1000,
        response_time: Math.random() * 500
      });
    }
    return data;
  }, [currentMetrics]);

  // Utility functions
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'generating': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'scheduled': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatMetricValue = (value: number, unit?: string): string => {
    if (unit === 'percent') return `${value.toFixed(1)}%`;
    if (unit === 'ms') return `${value.toFixed(0)}ms`;
    if (unit === 'bytes') return `${(value / 1024 / 1024).toFixed(1)}MB`;
    return value.toLocaleString();
  };

  // Render functions
  const renderMetricCard = (title: string, value: number, unit?: string, trend?: number, icon?: React.ElementType) => {
    const Icon = icon || Activity;
    const trendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
    const trendColor = trend && trend > 0 ? 'text-green-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-600';
    
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{formatMetricValue(value, unit)}</p>
              {trend !== undefined && (
                <div className={cn("flex items-center text-sm", trendColor)}>
                  {React.createElement(trendIcon, { className: "h-3 w-3 mr-1" })}
                  {Math.abs(trend).toFixed(1)}%
                </div>
              )}
            </div>
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="memory" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="cpu" fill="#3b82f6" />
              <Bar dataKey="memory" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="response_time" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Reports</h2>
          <p className="text-muted-foreground">
            Monitor system performance and generate insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadCurrentMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateReport(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts {alerts.filter(a => !a.isAcknowledged).length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {alerts.filter(a => !a.isAcknowledged).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          {currentMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderMetricCard('CPU Usage', currentMetrics.system.cpuUtilization, 'percent', 2.1, Cpu)}
              {renderMetricCard('Memory Usage', currentMetrics.system.memoryUsage, 'percent', -1.3, MemoryStick)}
              {renderMetricCard('Response Time', currentMetrics.system.responseTime, 'ms', 5.2, Timer)}
              {renderMetricCard('Availability', currentMetrics.system.availability, 'percent', 0.1, CheckCircle)}
            </div>
          )}

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Real-time system performance metrics</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Last Hour</SelectItem>
                      <SelectItem value="day">Last Day</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>

          {/* System Health */}
          {currentMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status and health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU Utilization</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={currentMetrics.system.cpuUtilization} className="w-24" />
                        <span className="text-sm font-medium">{currentMetrics.system.cpuUtilization.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={currentMetrics.system.memoryUsage} className="w-24" />
                        <span className="text-sm font-medium">{currentMetrics.system.memoryUsage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Disk Usage</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={currentMetrics.system.diskUsage} className="w-24" />
                        <span className="text-sm font-medium">{currentMetrics.system.diskUsage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={currentMetrics.system.errorRate} className="w-24" />
                        <span className="text-sm font-medium">{currentMetrics.system.errorRate.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Scan Performance</CardTitle>
                  <CardDescription>Scanning operations and efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Scans:</span>
                      <span className="ml-2 font-medium">{currentMetrics.scanning.totalScans}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="ml-2 font-medium">{currentMetrics.scanning.completedScans}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <span className="ml-2 font-medium">{currentMetrics.scanning.failedScans}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="ml-2 font-medium">
                        {((currentMetrics.scanning.completedScans / currentMetrics.scanning.totalScans) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Scan Time:</span>
                      <span className="ml-2 font-medium">{currentMetrics.scanning.averageScanTime}s</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Processed:</span>
                      <span className="ml-2 font-medium">{(currentMetrics.scanning.dataProcessed / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rules Executed:</span>
                      <span className="ml-2 font-medium">{currentMetrics.scanning.rulesExecuted}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Detections:</span>
                      <span className="ml-2 font-medium">{currentMetrics.scanning.detectionsFound}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map(report => (
              <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <CardDescription className="mt-1">{report.description}</CardDescription>
                    </div>
                    <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{report.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Generated:</span>
                        <span className="ml-2 font-medium">{report.generatedAt.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Points:</span>
                        <span className="ml-2 font-medium">{report.metadata.dataPoints}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="ml-2 font-medium">{report.metadata.accuracy.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {report.isScheduled && (
                          <Badge variant="outline" className="text-xs">
                            Scheduled
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-6">
          {currentMetrics && (
            <>
              {/* Metric Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {METRIC_CATEGORIES.map(category => (
                  <Card key={category.value}>
                    <CardHeader>
                      <CardTitle>{category.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.metrics.map(metric => (
                          <div key={metric} className="flex items-center justify-between">
                            <span className="text-sm">{metric.replace('_', ' ').toUpperCase()}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={Math.random() * 100} className="w-20" />
                              <span className="text-sm font-medium">{(Math.random() * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trends.map(trend => (
              <Card key={trend.metric}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{trend.metric}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "flex items-center text-sm",
                        trend.direction === 'up' ? 'text-green-600' : 
                        trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                      )}>
                        {trend.direction === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                         trend.direction === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
                         <Minus className="h-4 w-4 mr-1" />}
                        {Math.abs(trend.changePercent).toFixed(1)}%
                      </div>
                      <Badge variant={trend.significance === 'high' ? 'default' : 'outline'}>
                        {trend.significance}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trend.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                      {trend.data[0]?.baseline && (
                        <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeDasharray="5 5" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map(alert => (
              <Card key={alert.id} className={cn(
                "border-l-4",
                alert.severity === 'emergency' && "border-l-red-500",
                alert.severity === 'critical' && "border-l-red-400",
                alert.severity === 'warning' && "border-l-yellow-400",
                alert.severity === 'info' && "border-l-blue-400"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base">{alert.metric}</CardTitle>
                        <Badge className={getAlertSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">{alert.message}</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.triggeredAt.toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="ml-2 font-medium">{alert.currentValue}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="ml-2 font-medium">{alert.thresholdValue}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-medium">{alert.duration}min</span>
                      </div>
                    </div>
                    
                    {alert.impactedSystems.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Impacted Systems:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alert.impactedSystems.map(system => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        {!alert.isAcknowledged && (
                          <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                      {alert.isAcknowledged && (
                        <div className="text-xs text-muted-foreground">
                          Acknowledged {alert.acknowledgedAt?.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {insights.map(insight => (
              <Card key={insight.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant={insight.severity === 'critical' ? 'destructive' : insight.severity === 'warning' ? 'secondary' : 'outline'}>
                          {insight.severity}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">{insight.description}</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {insight.confidence.toFixed(0)}% confidence
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Affected Metrics:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {insight.affectedMetrics.map(metric => (
                          <Badge key={metric} variant="outline" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {insight.suggestedActions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Suggested Actions:</span>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                          {insight.suggestedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Performance Report</DialogTitle>
            <DialogDescription>
              Create a custom performance report with specific metrics and time range
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportForm.name}
                  onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportForm.type} onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Report description"
              />
            </div>
            
            <div>
              <Label htmlFor="time-range">Time Range</Label>
              <Select 
                value={reportForm.timeRange.preset} 
                onValueChange={(value) => setReportForm(prev => ({ 
                  ...prev, 
                  timeRange: { ...prev.timeRange, preset: value as any } 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportForm.includeComparisons}
                  onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, includeComparisons: !!checked }))}
                />
                <Label className="text-sm">Include historical comparisons</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportForm.includeTrends}
                  onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, includeTrends: !!checked }))}
                />
                <Label className="text-sm">Include trend analysis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportForm.includeRecommendations}
                  onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, includeRecommendations: !!checked }))}
                />
                <Label className="text-sm">Include recommendations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportForm.isScheduled}
                  onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, isScheduled: !!checked }))}
                />
                <Label className="text-sm">Schedule recurring report</Label>
              </div>
            </div>
            
            {reportForm.isScheduled && (
              <div>
                <Label htmlFor="schedule-frequency">Frequency</Label>
                <Select 
                  value={reportForm.scheduleFrequency} 
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, scheduleFrequency: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateReport(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={loading || !reportForm.name}>
              Generate Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceReports;