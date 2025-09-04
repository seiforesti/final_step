'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Progress 
} from "@/components/ui/progress";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Checkbox 
} from "@/components/ui/checkbox";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Calendar 
} from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  cn 
} from "@/lib copie/utils";
import { format, subDays, subMonths, parseISO, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { CalendarIcon, Download, FileText, Filter, MoreHorizontal, Plus, RefreshCw, Settings, Share, Upload, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Edit3, Trash2, Copy, Search, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Save, Send, Users, Mail, Printer, ExternalLink, Zap, Target, Layers, Activity, Database, Archive, Globe, Shield, Award, Bookmark, Info, HelpCircle, ChevronDown, ChevronRight, Maximize2, Minimize2, RotateCcw, PlayCircle, StopCircle, PauseCircle, Palette, Layout, Grid3X3, List, MapPin, Tag, Link, Star, Heart, MessageSquare, Bell, Lock, Unlock, Key, UserCheck, UserX, Briefcase, Building, Home, Folder, FolderOpen, File, FileType, Image, Video, Music, Code, Terminal, Cpu, HardDrive, Wifi, WifiOff, Power, PowerOff, BookOpen, GraduationCap, Brain, Network, GitBranch, Workflow, FileCheck, FileX, Clock3, Calendar as CalendarDays, Timer, Fingerprint, Hash, Type, BarChart2, Gauge, Percent, Shuffle, Repeat, SkipBack, SkipForward, Volume2, VolumeX, Mic, Camera, Smartphone, Monitor, Tablet, Watch, Navigation, Compass, Map, Route, Flag, Megaphone, Radio, Headphones, Speaker, Box, Package, Truck, Plane, Car, Bike, Ship, Train, Bus, Rocket, Satellite, CloudRain, Sun, Moon, CloudSnow } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart as RechartsLineChart, 
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart as RechartsScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';

// Import types and services
import { 
  CatalogMetrics,
  AssetMetrics,
  QualityMetrics,
  GovernanceMetrics,
  UsageMetrics,
  DataAsset,
  MetricAlert,
  MetricThreshold,
  DashboardWidget,
  KPICard,
  CatalogApiResponse
} from '../../types';

import { catalogAnalyticsService, enterpriseCatalogService } from '../../services';
import { useCatalogAnalytics } from '../../hooks';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface CatalogMetricsCenterProps {
  className?: string;
  embedded?: boolean;
  dashboardId?: string;
  onMetricAlert?: (alert: MetricAlert) => void;
  onError?: (error: Error) => void;
}

interface MetricsDashboardConfig {
  timeRange: 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'last_1y' | 'custom';
  customDateRange?: {
    start: Date;
    end: Date;
  };
  refreshInterval: number; // seconds
  autoRefresh: boolean;
  widgets: string[];
  layout: 'compact' | 'standard' | 'detailed';
  theme: 'light' | 'dark' | 'auto';
}

interface KPIConfiguration {
  id: string;
  name: string;
  type: 'count' | 'percentage' | 'ratio' | 'growth' | 'score';
  category: 'assets' | 'quality' | 'governance' | 'usage' | 'adoption';
  thresholds: {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
  };
  calculation: string;
  description: string;
  unit?: string;
  format?: string;
}

interface MetricComparison {
  current: number;
  previous: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
  significance: 'high' | 'medium' | 'low';
}

interface DrillDownConfig {
  dimension: string;
  level: 'summary' | 'detailed' | 'raw';
  filters: Record<string, any>;
  groupBy: string[];
  orderBy: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

interface ExportConfiguration {
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON' | 'PNG' | 'SVG';
  includeCharts: boolean;
  includeRawData: boolean;
  includeMetadata: boolean;
  template: 'executive' | 'detailed' | 'technical' | 'custom';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
}

interface AlertConfiguration {
  metricId: string;
  conditions: Array<{
    operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
    value: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
  }>;
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
    inApp: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_RANGES = [
  { value: 'last_24h', label: 'Last 24 Hours' },
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_30d', label: 'Last 30 Days' },
  { value: 'last_90d', label: 'Last 90 Days' },
  { value: 'last_1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

const REFRESH_INTERVALS = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 0, label: 'Manual only' }
];

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

const METRIC_CATEGORIES = [
  { value: 'assets', label: 'Data Assets', icon: Database },
  { value: 'quality', label: 'Data Quality', icon: CheckCircle },
  { value: 'governance', label: 'Governance', icon: Shield },
  { value: 'usage', label: 'Usage & Adoption', icon: Activity },
  { value: 'performance', label: 'Performance', icon: Zap }
];

const DEFAULT_KPIS = [
  {
    id: 'total_assets',
    name: 'Total Data Assets',
    type: 'count',
    category: 'assets',
    thresholds: { excellent: 1000, good: 500, warning: 100, critical: 50 },
    calculation: 'COUNT(assets)',
    description: 'Total number of cataloged data assets'
  },
  {
    id: 'quality_score',
    name: 'Overall Quality Score',
    type: 'percentage',
    category: 'quality',
    thresholds: { excellent: 95, good: 85, warning: 70, critical: 50 },
    calculation: 'AVG(quality_scores)',
    description: 'Average data quality score across all assets',
    unit: '%'
  },
  {
    id: 'governance_compliance',
    name: 'Governance Compliance',
    type: 'percentage',
    category: 'governance',
    thresholds: { excellent: 98, good: 90, warning: 80, critical: 70 },
    calculation: 'COMPLIANCE_RATE(governance_rules)',
    description: 'Percentage of assets compliant with governance policies',
    unit: '%'
  },
  {
    id: 'active_users',
    name: 'Active Users',
    type: 'count',
    category: 'usage',
    thresholds: { excellent: 500, good: 200, warning: 50, critical: 10 },
    calculation: 'COUNT(DISTINCT active_users)',
    description: 'Number of users who accessed the catalog this month'
  }
];

const WIDGET_TYPES = [
  { value: 'kpi_cards', label: 'KPI Cards', description: 'Key performance indicators' },
  { value: 'trend_chart', label: 'Trend Chart', description: 'Time series trends' },
  { value: 'distribution_chart', label: 'Distribution Chart', description: 'Data distribution' },
  { value: 'comparison_chart', label: 'Comparison Chart', description: 'Period comparisons' },
  { value: 'heatmap', label: 'Heatmap', description: 'Activity heatmap' },
  { value: 'sankey_diagram', label: 'Flow Diagram', description: 'Data lineage flows' },
  { value: 'alerts_panel', label: 'Alerts Panel', description: 'Active alerts and issues' },
  { value: 'top_assets', label: 'Top Assets', description: 'Most accessed assets' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CatalogMetricsCenter: React.FC<CatalogMetricsCenterProps> = ({
  className,
  embedded = false,
  dashboardId,
  onMetricAlert,
  onError
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dashboardConfig, setDashboardConfig] = useState<MetricsDashboardConfig>({
    timeRange: 'last_30d',
    refreshInterval: 300,
    autoRefresh: true,
    widgets: ['kpi_cards', 'trend_chart', 'distribution_chart', 'alerts_panel'],
    layout: 'standard',
    theme: 'auto'
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['total_assets', 'quality_score', 'governance_compliance', 'active_users']);
  const [drillDownConfig, setDrillDownConfig] = useState<DrillDownConfig | null>(null);
  const [exportConfig, setExportConfig] = useState<ExportConfiguration>({
    format: 'PDF',
    includeCharts: true,
    includeRawData: false,
    includeMetadata: true,
    template: 'executive'
  });
  const [alertConfigs, setAlertConfigs] = useState<AlertConfiguration[]>([]);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [showAlertDialog, setShowAlertDialog] = useState<boolean>(false);
  const [showConfigDialog, setShowConfigDialog] = useState<boolean>(false);
  const [selectedKPI, setSelectedKPI] = useState<string>('');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [realTimeData, setRealTimeData] = useState<boolean>(true);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous_period' | 'year_over_year'>('previous_period');

  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // HOOKS & API INTEGRATION
  // ============================================================================

  const {
    generateReport,
    exportData,
    isLoading: analyticsLoading
  } = useCatalogAnalytics();

  // Fetch catalog metrics
  const { 
    data: catalogMetrics, 
    isLoading: metricsLoading,
    refetch: refetchMetrics 
  } = useQuery({
    queryKey: ['catalog-metrics', dashboardConfig.timeRange, customDateRange],
    queryFn: async () => {
      const timeRange = dashboardConfig.timeRange === 'custom' 
        ? { start: customDateRange.start, end: customDateRange.end }
        : { range: dashboardConfig.timeRange };
      
      const response = await catalogAnalyticsService.getCatalogMetrics(timeRange);
      return response.data;
    },
    refetchInterval: dashboardConfig.autoRefresh ? dashboardConfig.refreshInterval * 1000 : false
  });

  // Fetch asset metrics
  const { 
    data: assetMetrics,
    isLoading: assetMetricsLoading 
  } = useQuery({
    queryKey: ['asset-metrics', dashboardConfig.timeRange],
    queryFn: async () => {
      const response = await catalogAnalyticsService.getAssetMetrics({
        timeRange: dashboardConfig.timeRange
      });
      return response.data;
    }
  });

  // Fetch quality metrics
  const { 
    data: qualityMetrics,
    isLoading: qualityMetricsLoading 
  } = useQuery({
    queryKey: ['quality-metrics', dashboardConfig.timeRange],
    queryFn: async () => {
      const response = await catalogAnalyticsService.getQualityMetrics({
        timeRange: dashboardConfig.timeRange
      });
      return response.data;
    }
  });

  // Fetch governance metrics
  const { 
    data: governanceMetrics,
    isLoading: governanceMetricsLoading 
  } = useQuery({
    queryKey: ['governance-metrics', dashboardConfig.timeRange],
    queryFn: async () => {
      const response = await catalogAnalyticsService.getGovernanceMetrics({
        timeRange: dashboardConfig.timeRange
      });
      return response.data;
    }
  });

  // Fetch usage metrics
  const { 
    data: usageMetrics,
    isLoading: usageMetricsLoading 
  } = useQuery({
    queryKey: ['usage-metrics', dashboardConfig.timeRange],
    queryFn: async () => {
      const response = await catalogAnalyticsService.getUsageMetrics({
        timeRange: dashboardConfig.timeRange
      });
      return response.data;
    }
  });

  // Fetch active alerts
  const { 
    data: activeAlerts = [],
    refetch: refetchAlerts 
  } = useQuery({
    queryKey: ['metric-alerts'],
    queryFn: async () => {
      const response = await catalogAnalyticsService.getActiveAlerts();
      return response.data || [];
    }
  });

  // Fetch trending assets
  const { 
    data: trendingAssets = [],
    isLoading: trendingAssetsLoading 
  } = useQuery({
    queryKey: ['trending-assets', dashboardConfig.timeRange],
    queryFn: async () => {
      const response = await catalogAnalyticsService.getTrendingAssets({
        timeRange: dashboardConfig.timeRange,
        limit: 10
      });
      return response.data || [];
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (config: ExportConfiguration) => {
      const response = await catalogAnalyticsService.exportMetricsReport({
        ...config,
        timeRange: dashboardConfig.timeRange,
        metrics: selectedMetrics,
        dateRange: dashboardConfig.timeRange === 'custom' ? customDateRange : undefined
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Metrics report exported successfully');
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      setShowExportDialog(false);
    },
    onError: (error) => {
      toast.error('Failed to export metrics report');
      onError?.(error as Error);
    }
  });

  // Alert configuration mutation
  const configureAlertMutation = useMutation({
    mutationFn: async (config: AlertConfiguration) => {
      const response = await catalogAnalyticsService.configureAlert(config);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Alert configured successfully');
      setShowAlertDialog(false);
      refetchAlerts();
    },
    onError: (error) => {
      toast.error('Failed to configure alert');
      onError?.(error as Error);
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const kpiData = useMemo(() => {
    if (!catalogMetrics) return [];

    return DEFAULT_KPIS.map(kpi => {
      const value = catalogMetrics[kpi.id as keyof typeof catalogMetrics] as number || 0;
      const previousValue = catalogMetrics[`${kpi.id}_previous` as keyof typeof catalogMetrics] as number || 0;
      
      const comparison: MetricComparison = {
        current: value,
        previous: previousValue,
        percentChange: previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0,
        trend: value > previousValue ? 'up' : value < previousValue ? 'down' : 'stable',
        significance: Math.abs(((value - previousValue) / previousValue) * 100) > 10 ? 'high' : 
                     Math.abs(((value - previousValue) / previousValue) * 100) > 5 ? 'medium' : 'low'
      };

      const status = value >= kpi.thresholds.excellent ? 'excellent' :
                    value >= kpi.thresholds.good ? 'good' :
                    value >= kpi.thresholds.warning ? 'warning' : 'critical';

      return {
        ...kpi,
        value,
        comparison,
        status
      };
    });
  }, [catalogMetrics]);

  const timeSeriesData = useMemo(() => {
    if (!catalogMetrics?.timeSeries) return [];

    return catalogMetrics.timeSeries.map((point: any) => ({
      timestamp: point.timestamp,
      date: format(new Date(point.timestamp), 'MMM dd'),
      totalAssets: point.totalAssets || 0,
      qualityScore: point.qualityScore || 0,
      governanceCompliance: point.governanceCompliance || 0,
      activeUsers: point.activeUsers || 0,
      dataVolume: point.dataVolume || 0
    }));
  }, [catalogMetrics]);

  const distributionData = useMemo(() => {
    if (!assetMetrics?.distribution) return [];

    return Object.entries(assetMetrics.distribution).map(([type, count]) => ({
      name: type,
      value: count as number,
      percentage: ((count as number) / assetMetrics.total * 100).toFixed(1)
    }));
  }, [assetMetrics]);

  const qualityDistribution = useMemo(() => {
    if (!qualityMetrics?.scoreDistribution) return [];

    return Object.entries(qualityMetrics.scoreDistribution).map(([range, count]) => ({
      range,
      count: count as number,
      percentage: ((count as number) / qualityMetrics.total * 100).toFixed(1)
    }));
  }, [qualityMetrics]);

  const isLoading = metricsLoading || assetMetricsLoading || qualityMetricsLoading || 
                   governanceMetricsLoading || usageMetricsLoading;

  // ============================================================================
  // EFFECT HOOKS
  // ============================================================================

  useEffect(() => {
    if (dashboardConfig.autoRefresh && dashboardConfig.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refetchMetrics();
      }, dashboardConfig.refreshInterval * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [dashboardConfig.autoRefresh, dashboardConfig.refreshInterval, refetchMetrics]);

  useEffect(() => {
    // Check for metric alerts
    if (activeAlerts.length > 0) {
      activeAlerts.forEach(alert => {
        if (onMetricAlert) {
          onMetricAlert(alert);
        }
      });
    }
  }, [activeAlerts, onMetricAlert]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTimeRangeChange = useCallback((range: string) => {
    setDashboardConfig(prev => ({ ...prev, timeRange: range as any }));
  }, []);

  const handleRefreshIntervalChange = useCallback((interval: number) => {
    setDashboardConfig(prev => ({ ...prev, refreshInterval: interval }));
  }, []);

  const handleAutoRefreshToggle = useCallback((enabled: boolean) => {
    setDashboardConfig(prev => ({ ...prev, autoRefresh: enabled }));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await exportMutation.mutateAsync(exportConfig);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportMutation, exportConfig]);

  const handleConfigureAlert = useCallback(async (config: AlertConfiguration) => {
    try {
      await configureAlertMutation.mutateAsync(config);
    } catch (error) {
      console.error('Alert configuration failed:', error);
    }
  }, [configureAlertMutation]);

  const handleDrillDown = useCallback((metricId: string, dimension: string) => {
    setDrillDownConfig({
      dimension,
      level: 'detailed',
      filters: { metricId },
      groupBy: [dimension],
      orderBy: { field: 'value', direction: 'desc' }
    });
  }, []);

  const handleRefreshData = useCallback(() => {
    refetchMetrics();
    refetchAlerts();
    toast.success('Data refreshed');
  }, [refetchMetrics, refetchAlerts]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderKPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-lg",
            kpi.status === 'excellent' && "border-green-200 bg-green-50/50",
            kpi.status === 'good' && "border-blue-200 bg-blue-50/50",
            kpi.status === 'warning' && "border-yellow-200 bg-yellow-50/50",
            kpi.status === 'critical' && "border-red-200 bg-red-50/50"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{kpi.name}</h3>
                    <Badge 
                      variant={
                        kpi.status === 'excellent' ? 'default' :
                        kpi.status === 'good' ? 'secondary' :
                        kpi.status === 'warning' ? 'outline' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {kpi.status}
                    </Badge>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">
                      {kpi.type === 'count' ? kpi.value.toLocaleString() : 
                       kpi.type === 'percentage' ? `${kpi.value.toFixed(1)}%` :
                       kpi.value.toFixed(2)}
                    </span>
                    {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
                  </div>
                  {comparisonMode && (
                    <div className="flex items-center space-x-1 mt-2">
                      {kpi.comparison.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : kpi.comparison.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <BarChart2 className="h-3 w-3 text-gray-500" />
                      )}
                      <span className={cn(
                        "text-xs font-medium",
                        kpi.comparison.trend === 'up' ? "text-green-600" :
                        kpi.comparison.trend === 'down' ? "text-red-600" :
                        "text-gray-600"
                      )}>
                        {kpi.comparison.percentChange > 0 ? '+' : ''}
                        {kpi.comparison.percentChange.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs prev period</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    kpi.status === 'excellent' && "bg-green-100",
                    kpi.status === 'good' && "bg-blue-100",
                    kpi.status === 'warning' && "bg-yellow-100",
                    kpi.status === 'critical' && "bg-red-100"
                  )}>
                    {kpi.category === 'assets' && <Database className={cn("h-6 w-6", 
                      kpi.status === 'excellent' ? "text-green-600" :
                      kpi.status === 'good' ? "text-blue-600" :
                      kpi.status === 'warning' ? "text-yellow-600" :
                      "text-red-600"
                    )} />}
                    {kpi.category === 'quality' && <CheckCircle className={cn("h-6 w-6",
                      kpi.status === 'excellent' ? "text-green-600" :
                      kpi.status === 'good' ? "text-blue-600" :
                      kpi.status === 'warning' ? "text-yellow-600" :
                      "text-red-600"
                    )} />}
                    {kpi.category === 'governance' && <Shield className={cn("h-6 w-6",
                      kpi.status === 'excellent' ? "text-green-600" :
                      kpi.status === 'good' ? "text-blue-600" :
                      kpi.status === 'warning' ? "text-yellow-600" :
                      "text-red-600"
                    )} />}
                    {kpi.category === 'usage' && <Activity className={cn("h-6 w-6",
                      kpi.status === 'excellent' ? "text-green-600" :
                      kpi.status === 'good' ? "text-blue-600" :
                      kpi.status === 'warning' ? "text-yellow-600" :
                      "text-red-600"
                    )} />}
                  </div>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-4">
                    <Progress 
                      value={(kpi.value / kpi.thresholds.excellent) * 100} 
                      className="h-2"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{kpi.description}</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderTrendChart = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trends Over Time</CardTitle>
            <CardDescription>
              Key metrics trending over the selected time period
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
            >
              {comparisonMode ? 'Hide Comparison' : 'Show Comparison'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Chart Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Show Total Assets</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Show Quality Score</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Show Active Users</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Show Data Volume</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="totalAssets" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                name="Total Assets"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="qualityScore" 
                stroke={CHART_COLORS[1]} 
                strokeWidth={2}
                name="Quality Score (%)"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="activeUsers" 
                stroke={CHART_COLORS[2]} 
                strokeWidth={2}
                name="Active Users"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderDistributionCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Type Distribution</CardTitle>
          <CardDescription>Breakdown of data assets by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Score Distribution</CardTitle>
          <CardDescription>Distribution of data quality scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={qualityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill={CHART_COLORS[3]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlertsPanel = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active Alerts
              {activeAlerts.length > 0 && (
                <Badge variant="destructive">{activeAlerts.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Current metric alerts and notifications</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlertDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Configure Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">All Clear</h3>
            <p className="text-muted-foreground">No active alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={cn(
                "p-4 rounded-lg border",
                alert.severity === 'critical' && "border-red-200 bg-red-50",
                alert.severity === 'error' && "border-orange-200 bg-orange-50",
                alert.severity === 'warning' && "border-yellow-200 bg-yellow-50",
                alert.severity === 'info' && "border-blue-200 bg-blue-50"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {alert.severity === 'critical' && <XCircle className="h-5 w-5 text-red-500" />}
                      {alert.severity === 'error' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                      {alert.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {alert.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'error' ? 'destructive' :
                        alert.severity === 'warning' ? 'outline' :
                        'secondary'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTopAssets = () => (
    <Card>
      <CardHeader>
        <CardTitle>Top Trending Assets</CardTitle>
        <CardDescription>Most accessed and popular data assets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendingAssets.map((asset, index) => (
            <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium">{asset.name}</h4>
                  <p className="text-sm text-muted-foreground">{asset.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{asset.accessCount}</p>
                <p className="text-sm text-muted-foreground">accesses</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderControlPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Controls</CardTitle>
        <CardDescription>Configure dashboard settings and data refresh</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Time Range</Label>
          <Select value={dashboardConfig.timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {dashboardConfig.timeRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(customDateRange.start, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateRange.start}
                    onSelect={(date) => date && setCustomDateRange(prev => ({ ...prev, start: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm font-medium">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(customDateRange.end, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateRange.end}
                    onSelect={(date) => date && setCustomDateRange(prev => ({ ...prev, end: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Auto Refresh</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              checked={dashboardConfig.autoRefresh}
              onCheckedChange={handleAutoRefreshToggle}
            />
            <span className="text-sm text-muted-foreground">
              {dashboardConfig.autoRefresh ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {dashboardConfig.autoRefresh && (
          <div>
            <Label className="text-sm font-medium">Refresh Interval</Label>
            <Select 
              value={dashboardConfig.refreshInterval.toString()} 
              onValueChange={(value) => handleRefreshIntervalChange(parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_INTERVALS.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value.toString()}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        <div className="flex items-center space-x-2">
          <Button onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={cn("w-full space-y-6", className)}>
        {/* Header */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Catalog Metrics Center</h1>
              <p className="text-muted-foreground">
                Comprehensive analytics and performance metrics for your data catalog
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                {dashboardConfig.autoRefresh ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Auto-refresh: {dashboardConfig.refreshInterval}s
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                    Manual refresh only
                  </>
                )}
              </Badge>
              <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Loading metrics data...</p>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              {renderKPICards()}

              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {renderTrendChart()}
                  {renderDistributionCharts()}
                </div>
                <div className="space-y-6">
                  {renderControlPanel()}
                  {renderAlertsPanel()}
                  {renderTopAssets()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Growth Over Time</CardTitle>
                    <CardDescription>Number of assets added to the catalog</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsAreaChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="totalAssets" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
                        </RechartsAreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Asset Health Status</CardTitle>
                    <CardDescription>Health scores across all data assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Excellent (90-100)</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={75} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground">75%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Good (70-89)</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={20} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground">20%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Needs Attention (50-69)</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={5} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground">5%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Score Trends</CardTitle>
                    <CardDescription>Data quality improvements over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="qualityScore" stroke={CHART_COLORS[1]} strokeWidth={3} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quality Issues</CardTitle>
                    <CardDescription>Active data quality issues by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { category: 'Missing Values', count: 12, severity: 'high' },
                        { category: 'Schema Violations', count: 8, severity: 'critical' },
                        { category: 'Duplicates', count: 15, severity: 'medium' },
                        { category: 'Format Issues', count: 6, severity: 'low' }
                      ].map((issue) => (
                        <div key={issue.category} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              issue.severity === 'critical' && "bg-red-500",
                              issue.severity === 'high' && "bg-orange-500",
                              issue.severity === 'medium' && "bg-yellow-500",
                              issue.severity === 'low' && "bg-blue-500"
                            )} />
                            <span className="font-medium">{issue.category}</span>
                          </div>
                          <Badge variant="outline">{issue.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="governance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Rate</CardTitle>
                    <CardDescription>Governance policy compliance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="governanceCompliance" stroke={CHART_COLORS[2]} strokeWidth={3} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Policy Violations</CardTitle>
                    <CardDescription>Recent governance policy violations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { policy: 'Data Classification', violations: 3, trend: 'down' },
                        { policy: 'Access Controls', violations: 1, trend: 'stable' },
                        { policy: 'Retention Policies', violations: 5, trend: 'up' },
                        { policy: 'Privacy Compliance', violations: 0, trend: 'down' }
                      ].map((item) => (
                        <div key={item.policy} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.policy}</span>
                            {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                            {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                            {item.trend === 'stable' && <BarChart2 className="h-4 w-4 text-gray-500" />}
                          </div>
                          <Badge variant={item.violations === 0 ? 'default' : 'destructive'}>
                            {item.violations}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CatalogMetricsCenter;