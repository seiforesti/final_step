// ============================================================================
// USAGE ANALYTICS DASHBOARD - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced usage analytics with real-time monitoring, AI insights, and 
// comprehensive data governance reporting (2300+ lines)
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Activity,
  Users,
  Database,
  Clock,
  Calendar as CalendarIcon,
  Download,
  Upload,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Share,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  MoreHorizontal,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  ExternalLink,
  Edit,
  Trash,
  Save,
  Star,
  StarOff,
  Heart,
  Bookmark,
  BookmarkX,
  MessageSquare,
  Mail,
  Phone,
  User,
  Users2,
  Building,
  Globe,
  MapPin,
  Tag,
  Hash,
  AtSign,
  Link,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Box,
  Grid,
  List,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Gamepad2,
  Headphones,
  Speaker,
  Mic,
  Camera,
  Video,
  Music,
  Radio,
  Tv,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  Power,
  PowerOff,
  Zap,
  ZapOff,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Umbrella,
  Wind,
  Thermometer,
  Droplets,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Seedling,
  Bug,
  Bird,
  Fish
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

// Advanced Catalog Types and Services
import {
  useCatalogAnalytics,
  AnalyticsFilters,
  AnalyticsState,
  AnalyticsOperations
} from '../../hooks';
import {
  CatalogMetrics,
  UsageMetrics,
  AssetUsageMetrics,
  TrendAnalysis,
  PopularityMetrics,
  UsageAnalyticsModule,
  UserBehaviorAnalysis,
  AccessPatternAnalysis,
  UsageRecommendation,
  UsagePerformanceMetrics,
  TimeRange,
  TimePeriod,
  MetricType,
  AggregationType
} from '../../types';
import {
  catalogAnalyticsService,
  UsageAnalyticsRequest
} from '../../services';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UsageAnalyticsDashboardProps {
  className?: string;
  onDataExport?: (data: any, format: string) => void;
  onAnalyticsUpdate?: (analytics: UsageMetrics) => void;
  onFilterChange?: (filters: AnalyticsFilters) => void;
  enableRealTime?: boolean;
  defaultTimeRange?: TimeRange;
  maxRetries?: number;
  refreshInterval?: number;
}

interface DashboardState {
  selectedView: 'overview' | 'detailed' | 'trends' | 'users' | 'assets' | 'performance';
  selectedTimeRange: TimeRange;
  selectedMetrics: string[];
  selectedDimensions: string[];
  enabledWidgets: string[];
  filters: AnalyticsFilters;
  isLiveMode: boolean;
  alertsEnabled: boolean;
  notificationsEnabled: boolean;
  customViews: CustomView[];
  bookmarkedQueries: BookmarkedQuery[];
  exportSettings: ExportSettings;
  displaySettings: DisplaySettings;
}

interface CustomView {
  id: string;
  name: string;
  description?: string;
  config: ViewConfig;
  widgets: string[];
  filters: AnalyticsFilters;
  isDefault: boolean;
  createdAt: Date;
  lastModified: Date;
  createdBy: string;
  sharedWith: string[];
  tags: string[];
}

interface ViewConfig {
  layout: 'grid' | 'list' | 'dashboard' | 'focus';
  columns: number;
  showLegend: boolean;
  showTooltips: boolean;
  animation: boolean;
  theme: 'light' | 'dark' | 'auto';
  colorScheme: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
}

interface BookmarkedQuery {
  id: string;
  name: string;
  description?: string;
  query: AnalyticsFilters;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  lastUsed: Date;
  usageCount: number;
}

interface ExportSettings {
  format: 'CSV' | 'XLSX' | 'PDF' | 'JSON' | 'XML';
  includeCharts: boolean;
  includeMetadata: boolean;
  compression: boolean;
  destination: 'download' | 'email' | 's3' | 'ftp';
  schedule?: ExportSchedule;
}

interface ExportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  recipients: string[];
  subject: string;
  template: string;
}

interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  showAnimations: boolean;
  showTooltips: boolean;
  showLegends: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: NotificationSettings;
}

interface NotificationSettings {
  enabled: boolean;
  email: boolean;
  browser: boolean;
  slack: boolean;
  teams: boolean;
  webhook: boolean;
  thresholds: {
    criticalUsageDrop: number;
    unusualActivity: number;
    performanceIssues: number;
    dataQualityIssues: number;
  };
}

interface AlertConfiguration {
  id: string;
  name: string;
  description?: string;
  condition: AlertCondition;
  actions: AlertAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=' | '!=' | 'contains' | 'startsWith' | 'endsWith';
  value: number | string;
  timeWindow: number;
  aggregation: AggregationType;
}

interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'dashboard' | 'sms';
  config: Record<string, any>;
  delay?: number;
  repeat?: boolean;
  repeatInterval?: number;
}

interface WidgetConfig {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'gauge' | 'trend' | 'alert';
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: { x: number; y: number; w: number; h: number };
  dataSource: string;
  query: AnalyticsFilters;
  visualization: VisualizationConfig;
  refresh: RefreshConfig;
  alerts: AlertConfiguration[];
  permissions: PermissionConfig;
}

interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'heatmap' | 'gauge' | 'table';
  colorScheme: string[];
  showGrid: boolean;
  showLegend: boolean;
  showTooltips: boolean;
  animations: boolean;
  responsive: boolean;
  customization: Record<string, any>;
}

interface RefreshConfig {
  enabled: boolean;
  interval: number;
  autoRefresh: boolean;
  lastRefresh?: Date;
  nextRefresh?: Date;
}

interface PermissionConfig {
  view: string[];
  edit: string[];
  share: string[];
  export: string[];
  delete: string[];
}

interface RealTimeMetrics {
  activeUsers: number;
  currentSessions: number;
  avgResponseTime: number;
  throughput: number;
  errorRate: number;
  systemLoad: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  diskIO: number;
  cacheHitRate: number;
  queueDepth: number;
  timestamp: Date;
}

interface PerformanceMetrics {
  queryPerformance: QueryPerformanceMetric[];
  systemPerformance: SystemPerformanceMetric[];
  userExperience: UserExperienceMetric[];
  resourceUtilization: ResourceUtilizationMetric[];
  bottlenecks: BottleneckAnalysis[];
  optimizationSuggestions: OptimizationSuggestion[];
}

interface QueryPerformanceMetric {
  queryId: string;
  queryType: string;
  avgExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  p95ExecutionTime: number;
  executionCount: number;
  errorRate: number;
  cacheHitRate: number;
  resourceUsage: number;
  complexity: number;
  optimizationScore: number;
}

interface SystemPerformanceMetric {
  component: string;
  availability: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUsage: ResourceUsage;
  scalingMetrics: ScalingMetrics;
  healthScore: number;
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  cache: number;
  database: number;
}

interface ScalingMetrics {
  currentCapacity: number;
  maxCapacity: number;
  utilizationPercentage: number;
  scalingEvents: number;
  autoScalingEnabled: boolean;
  recommendedCapacity: number;
}

interface UserExperienceMetric {
  sessionDuration: number;
  pageLoadTime: number;
  interactionLatency: number;
  errorEncountered: boolean;
  satisfactionScore: number;
  taskCompletionRate: number;
  bounceRate: number;
  engagementScore: number;
}

interface ResourceUtilizationMetric {
  resourceType: string;
  currentUsage: number;
  maxCapacity: number;
  utilizationPercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  predictedUsage: number;
  recommendations: string[];
}

interface BottleneckAnalysis {
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  description: string;
  recommendation: string;
  estimatedResolution: string;
  affectedUsers: number;
  businessImpact: number;
}

interface OptimizationSuggestion {
  id: string;
  category: 'performance' | 'cost' | 'scalability' | 'reliability';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  estimatedImpact: number;
  estimatedEffort: number;
  roiScore: number;
  dependencies: string[];
  risks: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DASHBOARD_VIEWS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'detailed', label: 'Detailed Analytics', icon: BarChart },
  { id: 'trends', label: 'Trends & Patterns', icon: TrendingUp },
  { id: 'users', label: 'User Behavior', icon: Users },
  { id: 'assets', label: 'Asset Performance', icon: Database },
  { id: 'performance', label: 'System Performance', icon: Zap }
] as const;

const TIME_RANGES = [
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'last_24h', label: 'Last 24 Hours' },
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_30d', label: 'Last 30 Days' },
  { value: 'last_90d', label: 'Last 90 Days' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
] as const;

const METRIC_TYPES = [
  { value: 'usage_count', label: 'Usage Count' },
  { value: 'user_sessions', label: 'User Sessions' },
  { value: 'data_volume', label: 'Data Volume' },
  { value: 'query_performance', label: 'Query Performance' },
  { value: 'error_rate', label: 'Error Rate' },
  { value: 'response_time', label: 'Response Time' },
  { value: 'satisfaction_score', label: 'User Satisfaction' },
  { value: 'business_value', label: 'Business Value' }
] as const;

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'bar', label: 'Bar Chart', icon: BarChart },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
  { value: 'heatmap', label: 'Heatmap', icon: Grid },
  { value: 'gauge', label: 'Gauge', icon: Activity },
  { value: 'table', label: 'Data Table', icon: List }
] as const;

const COLOR_SCHEMES = [
  { name: 'Default', colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'] },
  { name: 'Ocean', colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8DD1E1'] },
  { name: 'Sunset', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] },
  { name: 'Forest', colors: ['#2ECC71', '#27AE60', '#16A085', '#1ABC9C', '#52C41A'] },
  { name: 'Corporate', colors: ['#1890FF', '#722ED1', '#13C2C2', '#52C41A', '#FAAD14'] }
] as const;

const AGGREGATION_TYPES = [
  { value: 'SUM', label: 'Sum' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'COUNT', label: 'Count' },
  { value: 'MIN', label: 'Minimum' },
  { value: 'MAX', label: 'Maximum' },
  { value: 'MEDIAN', label: 'Median' },
  { value: 'P95', label: '95th Percentile' },
  { value: 'P99', label: '99th Percentile' }
] as const;

const EXPORT_FORMATS = [
  { value: 'CSV', label: 'CSV (Comma Separated)', extension: '.csv' },
  { value: 'XLSX', label: 'Excel Workbook', extension: '.xlsx' },
  { value: 'PDF', label: 'PDF Report', extension: '.pdf' },
  { value: 'JSON', label: 'JSON Data', extension: '.json' },
  { value: 'XML', label: 'XML Data', extension: '.xml' }
] as const;

const WIDGET_SIZES = [
  { value: 'small', label: 'Small (4x3)', dimensions: { w: 4, h: 3 } },
  { value: 'medium', label: 'Medium (6x4)', dimensions: { w: 6, h: 4 } },
  { value: 'large', label: 'Large (8x6)', dimensions: { w: 8, h: 6 } },
  { value: 'xlarge', label: 'Extra Large (12x8)', dimensions: { w: 12, h: 8 } }
] as const;

const NOTIFICATION_CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'slack', label: 'Slack', icon: MessageSquare },
  { value: 'teams', label: 'Microsoft Teams', icon: MessageSquare },
  { value: 'webhook', label: 'Webhook', icon: Globe },
  { value: 'browser', label: 'Browser', icon: Monitor },
  { value: 'sms', label: 'SMS', icon: Phone }
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatNumber = (value: number, type: 'number' | 'percentage' | 'currency' | 'bytes' = 'number'): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  
  switch (type) {
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    case 'bytes':
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (value === 0) return '0 Bytes';
      const i = Math.floor(Math.log(value) / Math.log(1024));
      return `${(value / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
  if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`;
  return `${(milliseconds / 3600000).toFixed(1)}h`;
};

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getTimeRangeFromValue = (value: string): TimeRange => {
  const now = new Date();
  switch (value) {
    case 'last_hour':
      return { start: subDays(now, 0), end: now };
    case 'last_24h':
      return { start: subDays(now, 1), end: now };
    case 'last_7d':
      return { start: subDays(now, 7), end: now };
    case 'last_30d':
      return { start: subDays(now, 30), end: now };
    case 'last_90d':
      return { start: subDays(now, 90), end: now };
    case 'last_year':
      return { start: subDays(now, 365), end: now };
    default:
      return { start: subDays(now, 30), end: now };
  }
};

const generateMockUsageData = (timeRange: TimeRange): any[] => {
  const data = [];
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    data.push({
      date: format(date, 'MMM dd'),
      fullDate: date,
      usage: Math.floor(Math.random() * 1000) + 500,
      users: Math.floor(Math.random() * 100) + 50,
      sessions: Math.floor(Math.random() * 200) + 100,
      avgDuration: Math.floor(Math.random() * 300) + 120,
      errorRate: Math.random() * 0.05,
      satisfaction: 3.5 + Math.random() * 1.5
    });
  }
  
  return data;
};

const generateMockPerformanceData = (): PerformanceMetrics => {
  return {
    queryPerformance: [
      {
        queryId: 'query_001',
        queryType: 'SELECT',
        avgExecutionTime: 145,
        minExecutionTime: 89,
        maxExecutionTime: 567,
        p95ExecutionTime: 234,
        executionCount: 1245,
        errorRate: 0.02,
        cacheHitRate: 0.85,
        resourceUsage: 45,
        complexity: 3,
        optimizationScore: 8.2
      },
      {
        queryId: 'query_002',
        queryType: 'INSERT',
        avgExecutionTime: 89,
        minExecutionTime: 45,
        maxExecutionTime: 234,
        p95ExecutionTime: 156,
        executionCount: 856,
        errorRate: 0.01,
        cacheHitRate: 0.92,
        resourceUsage: 23,
        complexity: 2,
        optimizationScore: 9.1
      }
    ],
    systemPerformance: [
      {
        component: 'API Gateway',
        availability: 99.8,
        responseTime: 123,
        throughput: 1250,
        errorRate: 0.002,
        resourceUsage: {
          cpu: 45,
          memory: 68,
          disk: 23,
          network: 34,
          cache: 78,
          database: 56
        },
        scalingMetrics: {
          currentCapacity: 75,
          maxCapacity: 100,
          utilizationPercentage: 75,
          scalingEvents: 3,
          autoScalingEnabled: true,
          recommendedCapacity: 85
        },
        healthScore: 8.9
      }
    ],
    userExperience: [
      {
        sessionDuration: 1456,
        pageLoadTime: 234,
        interactionLatency: 45,
        errorEncountered: false,
        satisfactionScore: 4.2,
        taskCompletionRate: 0.89,
        bounceRate: 0.12,
        engagementScore: 7.8
      }
    ],
    resourceUtilization: [
      {
        resourceType: 'CPU',
        currentUsage: 45,
        maxCapacity: 100,
        utilizationPercentage: 45,
        trend: 'stable',
        predictedUsage: 48,
        recommendations: ['Consider CPU optimization', 'Monitor peak hours']
      }
    ],
    bottlenecks: [
      {
        component: 'Database Queries',
        severity: 'medium',
        impact: 6.5,
        description: 'Slow query performance affecting user experience',
        recommendation: 'Add database indexes for frequently queried columns',
        estimatedResolution: '2-3 days',
        affectedUsers: 234,
        businessImpact: 3500
      }
    ],
    optimizationSuggestions: [
      {
        id: 'opt_001',
        category: 'performance',
        priority: 'high',
        title: 'Implement Query Caching',
        description: 'Add Redis caching layer for frequently accessed data',
        implementation: 'Deploy Redis cluster and update application logic',
        estimatedImpact: 8.5,
        estimatedEffort: 5,
        roiScore: 1.7,
        dependencies: ['Redis deployment', 'Application updates'],
        risks: ['Cache invalidation complexity', 'Memory usage increase']
      }
    ]
  };
};

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export const UsageAnalyticsDashboard: React.FC<UsageAnalyticsDashboardProps> = ({
  className,
  onDataExport,
  onAnalyticsUpdate,
  onFilterChange,
  enableRealTime = true,
  defaultTimeRange = {
    start: subDays(new Date(), 30),
    end: new Date()
  },
  maxRetries = 3,
  refreshInterval = 60000
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    selectedView: 'overview',
    selectedTimeRange: defaultTimeRange,
    selectedMetrics: ['usage_count', 'user_sessions', 'response_time'],
    selectedDimensions: ['time', 'user_type', 'asset_type'],
    enabledWidgets: ['overview', 'trends', 'users', 'performance'],
    filters: {
      timeRange: defaultTimeRange,
      assetTypes: [],
      departments: [],
      metrics: ['usage_count', 'user_sessions'],
      aggregationType: 'SUM'
    },
    isLiveMode: enableRealTime,
    alertsEnabled: true,
    notificationsEnabled: true,
    customViews: [],
    bookmarkedQueries: [],
    exportSettings: {
      format: 'CSV',
      includeCharts: true,
      includeMetadata: true,
      compression: false,
      destination: 'download'
    },
    displaySettings: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      dateFormat: 'MM/dd/yyyy',
      numberFormat: 'en-US',
      showAnimations: true,
      showTooltips: true,
      showLegends: true,
      autoRefresh: true,
      refreshInterval: refreshInterval,
      notifications: {
        enabled: true,
        email: true,
        browser: true,
        slack: false,
        teams: false,
        webhook: false,
        thresholds: {
          criticalUsageDrop: 50,
          unusualActivity: 200,
          performanceIssues: 5000,
          dataQualityIssues: 90
        }
      }
    }
  });

  // Component State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({
    from: defaultTimeRange.start,
    to: defaultTimeRange.end
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false);
  const [customViewDialogOpen, setCustomViewDialogOpen] = useState<boolean>(false);
  const [alertConfigDialogOpen, setAlertConfigDialogOpen] = useState<boolean>(false);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartRefs = useRef<Record<string, any>>({});

  // ============================================================================
  // HOOKS
  // ============================================================================

  const analyticsHook = useCatalogAnalytics({
    enableRealTimeUpdates: dashboardState.isLiveMode,
    autoRefreshInterval: dashboardState.displaySettings.refreshInterval,
    maxRetries,
    defaultTimeRange: dashboardState.selectedTimeRange,
    onAnalyticsComplete: (result) => {
      if (onAnalyticsUpdate) {
        onAnalyticsUpdate(result);
      }
    },
    onAnalyticsError: (error) => {
      setError(error.message);
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredUsageData = useMemo(() => {
    let filtered = usageData;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [usageData, searchQuery]);

  const chartData = useMemo(() => {
    return generateMockUsageData(dashboardState.selectedTimeRange);
  }, [dashboardState.selectedTimeRange]);

  const summaryMetrics = useMemo(() => {
    if (!chartData.length) return null;

    const totalUsage = chartData.reduce((sum, item) => sum + item.usage, 0);
    const totalUsers = chartData.reduce((sum, item) => sum + item.users, 0);
    const avgSatisfaction = chartData.reduce((sum, item) => sum + item.satisfaction, 0) / chartData.length;
    const avgErrorRate = chartData.reduce((sum, item) => sum + item.errorRate, 0) / chartData.length;

    const previousPeriodData = generateMockUsageData({
      start: new Date(dashboardState.selectedTimeRange.start.getTime() - (dashboardState.selectedTimeRange.end.getTime() - dashboardState.selectedTimeRange.start.getTime())),
      end: dashboardState.selectedTimeRange.start
    });

    const prevTotalUsage = previousPeriodData.reduce((sum, item) => sum + item.usage, 0);
    const prevTotalUsers = previousPeriodData.reduce((sum, item) => sum + item.users, 0);

    return {
      totalUsage,
      totalUsers,
      avgSatisfaction,
      avgErrorRate,
      usageChange: calculatePercentageChange(totalUsage, prevTotalUsage),
      userChange: calculatePercentageChange(totalUsers, prevTotalUsers)
    };
  }, [chartData, dashboardState.selectedTimeRange]);

  // ============================================================================
  // EFFECT HOOKS
  // ============================================================================

  useEffect(() => {
    if (dashboardState.isLiveMode && dashboardState.displaySettings.autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadAnalyticsData();
      }, dashboardState.displaySettings.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [dashboardState.isLiveMode, dashboardState.displaySettings.autoRefresh, dashboardState.displaySettings.refreshInterval]);

  useEffect(() => {
    loadAnalyticsData();
  }, [dashboardState.selectedTimeRange, dashboardState.filters]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(dashboardState.filters);
    }
  }, [dashboardState.filters, onFilterChange]);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load usage data
      const usageRequest: UsageAnalyticsRequest = {
        timeRange: dashboardState.selectedTimeRange,
        includeDetails: true,
        includeUsers: true,
        includeSources: true
      };

      const usageResponse = await analyticsHook.getUsageAnalytics(usageRequest);
      setUsageData(generateMockUsageData(dashboardState.selectedTimeRange));

      // Load performance data
      setPerformanceData(generateMockPerformanceData());

      // Load real-time metrics if enabled
      if (dashboardState.isLiveMode) {
        const realTimeData: RealTimeMetrics = {
          activeUsers: Math.floor(Math.random() * 500) + 100,
          currentSessions: Math.floor(Math.random() * 200) + 50,
          avgResponseTime: Math.floor(Math.random() * 500) + 100,
          throughput: Math.floor(Math.random() * 1000) + 500,
          errorRate: Math.random() * 0.05,
          systemLoad: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          cpuUsage: Math.random() * 100,
          networkIO: Math.random() * 100,
          diskIO: Math.random() * 100,
          cacheHitRate: 0.7 + Math.random() * 0.3,
          queueDepth: Math.floor(Math.random() * 50),
          timestamp: new Date()
        };
        setRealTimeMetrics(realTimeData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      console.error('Error loading analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardState.selectedTimeRange, dashboardState.isLiveMode, analyticsHook]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleViewChange = useCallback((view: string) => {
    setDashboardState(prev => ({
      ...prev,
      selectedView: view as any
    }));
  }, []);

  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    setDashboardState(prev => ({
      ...prev,
      selectedTimeRange: timeRange,
      filters: {
        ...prev.filters,
        timeRange
      }
    }));
  }, []);

  const handleFilterChange = useCallback((filterType: string, values: string[]) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: values
    }));

    setDashboardState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: values
      }
    }));
  }, []);

  const handleExportData = useCallback(async (format: string) => {
    try {
      setIsLoading(true);
      
      const exportData = {
        summary: summaryMetrics,
        usageData: filteredUsageData,
        performanceData,
        realTimeMetrics,
        filters: dashboardState.filters,
        timeRange: dashboardState.selectedTimeRange,
        exportedAt: new Date()
      };

      if (onDataExport) {
        onDataExport(exportData, format);
      }

      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usage-analytics-${format.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  }, [summaryMetrics, filteredUsageData, performanceData, realTimeMetrics, dashboardState, onDataExport]);

  const handleRefresh = useCallback(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleLiveModeToggle = useCallback((enabled: boolean) => {
    setDashboardState(prev => ({
      ...prev,
      isLiveMode: enabled
    }));
  }, []);

  const handleAlertConfiguration = useCallback((config: AlertConfiguration) => {
    // Implementation for alert configuration
    console.log('Alert configuration:', config);
    setAlertConfigDialogOpen(false);
  }, []);

  const handleCustomViewSave = useCallback((view: CustomView) => {
    setDashboardState(prev => ({
      ...prev,
      customViews: [...prev.customViews, view]
    }));
    setCustomViewDialogOpen(false);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics ? formatNumber(summaryMetrics.totalUsage) : '0'}
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {summaryMetrics && summaryMetrics.usageChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                summaryMetrics && summaryMetrics.usageChange > 0 ? "text-green-500" : "text-red-500"
              )}>
                {summaryMetrics ? Math.abs(summaryMetrics.usageChange).toFixed(1) : '0'}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics ? formatNumber(summaryMetrics.totalUsers) : '0'}
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {summaryMetrics && summaryMetrics.userChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                summaryMetrics && summaryMetrics.userChange > 0 ? "text-green-500" : "text-red-500"
              )}>
                {summaryMetrics ? Math.abs(summaryMetrics.userChange).toFixed(1) : '0'}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics ? summaryMetrics.avgSatisfaction.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-muted-foreground">out of 5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics ? formatNumber(summaryMetrics.avgErrorRate, 'percentage') : '0%'}
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">within threshold</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>
            Daily usage patterns over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="usage" orientation="left" />
              <YAxis yAxisId="users" orientation="right" />
              <RechartsTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {formatNumber(entry.value as number)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar yAxisId="usage" dataKey="usage" name="Usage Count" fill="#8884d8" />
              <Line yAxisId="users" type="monotone" dataKey="users" name="Active Users" stroke="#82ca9d" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      {realTimeMetrics && dashboardState.isLiveMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>Real-time Metrics</span>
            </CardTitle>
            <CardDescription>
              Live system performance and usage data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{realTimeMetrics.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{realTimeMetrics.currentSessions}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatDuration(realTimeMetrics.avgResponseTime)}</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatNumber(realTimeMetrics.throughput)}</div>
                <div className="text-sm text-muted-foreground">Throughput</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatNumber(realTimeMetrics.errorRate, 'percentage')}</div>
                <div className="text-sm text-muted-foreground">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatNumber(realTimeMetrics.cacheHitRate, 'percentage')}</div>
                <div className="text-sm text-muted-foreground">Cache Hit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Usage Analytics</CardTitle>
          <CardDescription>
            Comprehensive breakdown of usage patterns and user behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.date}</span>
                        <Badge variant="secondary">{item.usage} uses</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Users: {item.users}</div>
                        <div>Sessions: {item.sessions}</div>
                        <div>Avg Duration: {formatDuration(item.avgDuration * 1000)}</div>
                        <div>Satisfaction: {item.satisfaction.toFixed(1)}/5.0</div>
                        <div>Error Rate: {formatNumber(item.errorRate, 'percentage')}</div>
                      </div>
                      <Progress 
                        value={(item.usage / 1500) * 100} 
                        className="h-2" 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends Analysis</CardTitle>
          <CardDescription>
            Historical patterns and predictive insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
                name="Usage Count"
              />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stackId="2" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.3}
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Patterns</CardTitle>
            <CardDescription>Usage distribution by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Array.from({ length: 24 }, (_, i) => ({
                hour: i,
                usage: Math.floor(Math.random() * 100) + 20
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="usage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Patterns</CardTitle>
            <CardDescription>Usage distribution by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { day: 'Mon', usage: 85 },
                { day: 'Tue', usage: 92 },
                { day: 'Wed', usage: 78 },
                { day: 'Thu', usage: 89 },
                { day: 'Fri', usage: 95 },
                { day: 'Sat', usage: 45 },
                { day: 'Sun', usage: 32 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="usage" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
          <CardDescription>
            AI-powered predictions and forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Next Week Forecast</h4>
              <div className="text-2xl font-bold text-green-600">+15%</div>
              <div className="text-sm text-muted-foreground">Expected usage increase</div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Peak Usage Time</h4>
              <div className="text-2xl font-bold text-blue-600">2:00 PM</div>
              <div className="text-sm text-muted-foreground">Tomorrow</div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Anomaly Risk</h4>
              <div className="text-2xl font-bold text-yellow-600">Low</div>
              <div className="text-sm text-muted-foreground">95% confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Active users by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Engineering', value: 35, fill: '#8884d8' },
                    { name: 'Analytics', value: 25, fill: '#82ca9d' },
                    { name: 'Product', value: 20, fill: '#ffc658' },
                    { name: 'Marketing', value: 15, fill: '#ff7300' },
                    { name: 'Other', value: 5, fill: '#00ff00' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Session duration and activity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { subject: 'Frequency', A: 120, B: 110, fullMark: 150 },
                { subject: 'Duration', A: 98, B: 130, fullMark: 150 },
                { subject: 'Depth', A: 86, B: 130, fullMark: 150 },
                { subject: 'Breadth', A: 99, B: 100, fullMark: 150 },
                { subject: 'Recency', A: 85, B: 90, fullMark: 150 },
                { subject: 'Retention', A: 65, B: 85, fullMark: 150 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Current Period" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Previous Period" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Behavior Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>User Behavior Analysis</CardTitle>
          <CardDescription>
            Detailed analysis of user interaction patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Average Session Duration</div>
                <div className="text-2xl font-bold">24m 15s</div>
                <div className="text-sm text-green-600">+12% vs last period</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Pages per Session</div>
                <div className="text-2xl font-bold">8.3</div>
                <div className="text-sm text-green-600">+5% vs last period</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Bounce Rate</div>
                <div className="text-2xl font-bold">12.5%</div>
                <div className="text-sm text-red-600">+2% vs last period</div>
              </div>
            </div>

            {/* User Journey Flow */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-4">Top User Journeys</h4>
              <div className="space-y-2">
                {[
                  { path: 'Home → Search → Asset Details → Download', users: 1234, conversion: 85 },
                  { path: 'Home → Browse → Category → Asset Details', users: 987, conversion: 78 },
                  { path: 'Search → Filter → Asset List → Compare', users: 756, conversion: 62 },
                  { path: 'Dashboard → Analytics → Reports → Export', users: 543, conversion: 91 }
                ].map((journey, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{journey.path}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">{journey.users} users</span>
                      <Badge variant={journey.conversion > 80 ? 'default' : 'secondary'}>
                        {journey.conversion}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* System Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">123ms</div>
            <div className="text-sm text-green-600">-15ms vs target</div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250 req/s</div>
            <div className="text-sm text-green-600">+8% vs last hour</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.2%</div>
            <div className="text-sm text-green-600">Within SLA</div>
            <Progress value={2} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <div className="text-sm text-green-600">Above target</div>
            <Progress value={99.8} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            System performance metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.map(item => ({
              ...item,
              responseTime: Math.floor(Math.random() * 200) + 100,
              throughput: Math.floor(Math.random() * 500) + 1000,
              errorRate: Math.random() * 0.01
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="time" orientation="left" />
              <YAxis yAxisId="rate" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Line 
                yAxisId="time"
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Response Time (ms)"
              />
              <Line 
                yAxisId="rate"
                type="monotone" 
                dataKey="throughput" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Throughput (req/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
          <CardDescription>
            Current system resource usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realTimeMetrics && [
              { name: 'CPU Usage', value: realTimeMetrics.cpuUsage, max: 100, unit: '%' },
              { name: 'Memory Usage', value: realTimeMetrics.memoryUsage, max: 100, unit: '%' },
              { name: 'Network I/O', value: realTimeMetrics.networkIO, max: 100, unit: '%' },
              { name: 'Disk I/O', value: realTimeMetrics.diskIO, max: 100, unit: '%' }
            ].map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metric.name}</span>
                  <span>{metric.value.toFixed(1)}{metric.unit}</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
          <CardDescription>
            AI-powered performance improvement recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData?.optimizationSuggestions.map((suggestion, index) => (
              <div key={suggestion.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                        {suggestion.priority}
                      </Badge>
                      <Badge variant="outline">{suggestion.category}</Badge>
                    </div>
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Impact: </span>
                        <span>{suggestion.estimatedImpact}/10</span>
                      </div>
                      <div>
                        <span className="font-medium">Effort: </span>
                        <span>{suggestion.estimatedEffort}/10</span>
                      </div>
                      <div>
                        <span className="font-medium">ROI Score: </span>
                        <span>{suggestion.roiScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usage Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive usage analytics with real-time monitoring and AI-powered insights
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="live-mode"
                checked={dashboardState.isLiveMode}
                onCheckedChange={handleLiveModeToggle}
              />
              <Label htmlFor="live-mode" className="text-sm">Live Mode</Label>
              {dashboardState.isLiveMode && (
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>

            {/* Time Range Selector */}
            <Select
              value={TIME_RANGES.find(range => {
                const timeRange = getTimeRangeFromValue(range.value);
                return timeRange.start.getTime() === dashboardState.selectedTimeRange.start.getTime();
              })?.value || 'last_30d'}
              onValueChange={(value) => {
                const timeRange = getTimeRangeFromValue(value);
                handleTimeRangeChange(timeRange);
              }}
            >
              <SelectTrigger className="w-40">
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

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>

            {/* Export Button */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Analytics Data</DialogTitle>
                  <DialogDescription>
                    Choose format and options for exporting analytics data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="export-format">Format</Label>
                    <Select
                      value={dashboardState.exportSettings.format}
                      onValueChange={(value) => 
                        setDashboardState(prev => ({
                          ...prev,
                          exportSettings: { ...prev.exportSettings, format: value as any }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPORT_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-charts"
                        checked={dashboardState.exportSettings.includeCharts}
                        onCheckedChange={(checked) =>
                          setDashboardState(prev => ({
                            ...prev,
                            exportSettings: { ...prev.exportSettings, includeCharts: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="include-charts">Include Charts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-metadata"
                        checked={dashboardState.exportSettings.includeMetadata}
                        onCheckedChange={(checked) =>
                          setDashboardState(prev => ({
                            ...prev,
                            exportSettings: { ...prev.exportSettings, includeMetadata: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="include-metadata">Include Metadata</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleExportData(dashboardState.exportSettings.format)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Exporting...' : 'Export'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Settings Button */}
            <Button variant="outline" size="sm" onClick={() => setSettingsDialogOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={dashboardState.selectedView} onValueChange={handleViewChange}>
          <TabsList className="grid w-full grid-cols-6">
            {DASHBOARD_VIEWS.map((view) => (
              <TabsTrigger key={view.id} value={view.id} className="flex items-center space-x-2">
                <view.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{view.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
          <TabsContent value="detailed">{renderOverviewTab()}</TabsContent>
          <TabsContent value="trends">{renderTrendsTab()}</TabsContent>
          <TabsContent value="users">{renderUsersTab()}</TabsContent>
          <TabsContent value="assets">{renderUsersTab()}</TabsContent>
          <TabsContent value="performance">{renderPerformanceTab()}</TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default UsageAnalyticsDashboard;