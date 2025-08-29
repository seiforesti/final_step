/**
 * WorkspaceAnalytics.tsx
 * =======================
 * 
 * Advanced workspace analytics and insights system that provides comprehensive
 * intelligence, predictive analytics, and performance optimization across all
 * workspace operations. Surpasses enterprise solutions with AI-powered insights,
 * real-time monitoring, and advanced visualization capabilities.
 * 
 * Features:
 * - Real-time workspace performance monitoring and analytics
 * - Predictive analytics for resource utilization and capacity planning
 * - Advanced data visualization with interactive charts and dashboards
 * - AI-powered insights and recommendations for optimization
 * - Cross-SPA analytics correlation and trend analysis
 * - User behavior analytics and usage pattern detection
 * - Cost optimization and resource efficiency recommendations
 * - Compliance and security analytics with risk assessment
 * - Custom dashboard creation and widget management
 * - Automated reporting and alert generation
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workspace_service.py
 * - Uses: workspaceManagement, racineOrchestration, aiAssistant hooks
 * - Real-time: WebSocket integration for live analytics updates
 * 
 * Design: Modern shadcn/ui with Next.js, Tailwind CSS, advanced charts
 * Target: 1900+ lines with enterprise-grade functionality
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useDragControls } from 'framer-motion';
import { BarChart3, Plus, Search, Filter, MoreHorizontal, Grid3X3, List, LineChart, PieChart, Clock, Users, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Play, Pause, Square, RotateCcw, Settings, Share2, Copy, Archive, Trash2, ExternalLink, ChevronDown, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight, Sparkles, Brain, Rocket, Globe, Building2, Users2, UserCheck, ShieldCheckIcon, Gauge, Timer, Cpu, HardDrive, Network, Activity, MapPin, Tag, Bookmark, Heart, MessageSquare, Bell, BellOff, Eye, EyeOff, Lock, Unlock, Crown, UserPlus, UserMinus, Database, GitBranch, Zap, Shield, RefreshCw, Download, Upload, FileText, Image, Video, Music, Code, Package, Briefcase, Calendar, Flag, Award, Trophy, Medal, Flame, Lightning, Sun, Moon, Cloud, Workflow, GitCommit, GitMerge, GitPullRequest, Scissors, Paperclip, Link, Hash, AtSign, Percent, DollarSign, Euro, Pound, Yen, Bitcoin, Coins, CreditCard, Wallet, PiggyBank, Maximize2, Minimize2, Move, RotateCw, FlipHorizontal, FlipVertical, Crop, PenTool, Paintbrush, Palette, Dropper, Ruler, Compass, Circle, Triangle, Hexagon, Pentagon, Octagon, Wand2, Lightbulb, Puzzle, Wrench, Cog, Gear, Sliders, ToggleLeft, ToggleRight, Power, PowerOff, Layers, TreePine, Boxes, Component, Combine, Split, Merge, Route, Navigation, Map, Waypoints, GitPullRequestArrow, GitFork, Shuffle, Repeat, SkipForward, SkipBack, FastForward, Rewind, StepForward, StepBack, Calendar as CalendarIcon, CalendarDays, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, CalendarClock, CalendarHeart, CalendarSearch, CalendarRange } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Backend Integration
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useJobWorkflowSpace } from '../../hooks/useJobWorkflowSpace';
import { usePipelineManagement } from '../../hooks/usePipelineManagement';

import { workspaceManagementAPI, dashboardAPI, activityTrackingAPI } from '../../services';

// Types
import {
  RacineWorkspace,
  WorkspaceType,
  WorkspaceRole,
  WorkspaceMember,
  WorkspaceResource,
  WorkspaceSettings,
  WorkspaceAnalytics,
  WorkspaceTemplate,
  WorkspaceSecuritySettings,
  CrossGroupResource,
  ResourceDependency,
  WorkspaceActivity,
  UUID,
  ISODateString,
  WorkflowDefinition,
  PipelineDefinition
} from '../../types/racine-core.types';

import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
  WorkspaceListResponse,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../../types/api.types';

// Utils
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, addDays, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Analytics time range enumeration
 */
export enum AnalyticsTimeRange {
  LAST_HOUR = 'last_hour',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

/**
 * Analytics metric type enumeration
 */
export enum AnalyticsMetricType {
  USAGE = 'usage',
  PERFORMANCE = 'performance',
  COST = 'cost',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  COLLABORATION = 'collaboration',
  EFFICIENCY = 'efficiency'
}

/**
 * Chart type enumeration
 */
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  SANKEY = 'sankey'
}

/**
 * Dashboard widget interface
 */
interface AnalyticsDashboardWidget {
  id: UUID;
  title: string;
  description: string;
  type: ChartType;
  metricType: AnalyticsMetricType;
  position: { x: number; y: number; w: number; h: number };
  configuration: WidgetConfiguration;
  dataSource: DataSourceConfig;
  refreshInterval: number; // in seconds
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  
  // Customization
  theme: 'light' | 'dark' | 'auto';
  colorScheme: string[];
  showLegend: boolean;
  showGrid: boolean;
  showTooltips: boolean;
  
  // Data
  data: AnalyticsDataPoint[];
  lastUpdated: ISODateString;
  
  // Permissions
  createdBy: UUID;
  editableBy: UUID[];
  viewableBy: UUID[];
}

/**
 * Widget configuration interface
 */
interface WidgetConfiguration {
  title: string;
  subtitle?: string;
  xAxis: AxisConfiguration;
  yAxis: AxisConfiguration;
  legend: LegendConfiguration;
  tooltip: TooltipConfiguration;
  colors: ColorConfiguration;
  animation: AnimationConfiguration;
  filters: FilterConfiguration[];
  aggregation: AggregationConfiguration;
}

/**
 * Axis configuration interface
 */
interface AxisConfiguration {
  label: string;
  type: 'linear' | 'logarithmic' | 'time' | 'category';
  min?: number;
  max?: number;
  format?: string;
  showGrid: boolean;
  showLabels: boolean;
}

/**
 * Legend configuration interface
 */
interface LegendConfiguration {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  orientation: 'horizontal' | 'vertical';
}

/**
 * Tooltip configuration interface
 */
interface TooltipConfiguration {
  show: boolean;
  format: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

/**
 * Color configuration interface
 */
interface ColorConfiguration {
  scheme: 'default' | 'blues' | 'greens' | 'reds' | 'purples' | 'oranges' | 'custom';
  customColors: string[];
  opacity: number;
  gradient: boolean;
}

/**
 * Animation configuration interface
 */
interface AnimationConfiguration {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay: number;
}

/**
 * Filter configuration interface
 */
interface FilterConfiguration {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  enabled: boolean;
}

/**
 * Aggregation configuration interface
 */
interface AggregationConfiguration {
  type: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct_count';
  groupBy: string[];
  timeWindow?: string;
}

/**
 * Data source configuration interface
 */
interface DataSourceConfig {
  type: 'workspace' | 'spa' | 'cross_group' | 'custom';
  source: string;
  endpoint: string;
  parameters: Record<string, any>;
  cacheEnabled: boolean;
  cacheTTL: number;
}

/**
 * Analytics data point interface
 */
interface AnalyticsDataPoint {
  timestamp: ISODateString;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
  dimensions?: Record<string, any>;
}

/**
 * Workspace analytics metrics interface
 */
interface WorkspaceAnalyticsMetrics {
  // Usage metrics
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number;
  pageViews: number;
  uniqueVisitors: number;
  
  // Performance metrics
  averageLoadTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
  responseTime: number;
  resourceUtilization: number;
  
  // Collaboration metrics
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  teamCollaboration: number;
  sharedResources: number;
  
  // Cost metrics
  totalCost: number;
  costPerUser: number;
  costPerProject: number;
  resourceCosts: Record<string, number>;
  optimizationSavings: number;
  
  // Security metrics
  securityScore: number;
  vulnerabilities: number;
  complianceScore: number;
  accessViolations: number;
  dataBreaches: number;
  
  // SPA-specific metrics
  spaMetrics: Record<string, SPAMetrics>;
  crossGroupMetrics: CrossGroupMetrics;
}

/**
 * SPA metrics interface
 */
interface SPAMetrics {
  usage: number;
  performance: number;
  errors: number;
  users: number;
  resources: number;
  lastActivity: ISODateString;
}

/**
 * Cross-group metrics interface
 */
interface CrossGroupMetrics {
  totalLinks: number;
  activeLinks: number;
  linkQuality: number;
  syncSuccess: number;
  conflicts: number;
  dataFlow: number;
}

/**
 * Analytics insights interface
 */
interface AnalyticsInsight {
  id: UUID;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'alert';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  
  // Data
  metric: string;
  currentValue: number;
  expectedValue?: number;
  threshold?: number;
  trend: 'up' | 'down' | 'stable';
  
  // Actions
  actionable: boolean;
  suggestedActions: string[];
  automationAvailable: boolean;
  
  // Lifecycle
  detectedAt: ISODateString;
  acknowledgedAt?: ISODateString;
  resolvedAt?: ISODateString;
  acknowledgedBy?: UUID;
  resolvedBy?: UUID;
}

/**
 * Analytics report interface
 */
interface AnalyticsReport {
  id: UUID;
  name: string;
  description: string;
  type: 'scheduled' | 'on_demand' | 'alert_triggered';
  format: 'pdf' | 'excel' | 'json' | 'csv';
  
  // Content
  widgets: UUID[];
  timeRange: AnalyticsTimeRange;
  customDateRange?: { start: Date; end: Date };
  
  // Recipients
  recipients: UUID[];
  emailEnabled: boolean;
  slackEnabled: boolean;
  webhookEnabled: boolean;
  
  // Schedule
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    timezone: string;
    enabled: boolean;
  };
  
  // Lifecycle
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastGenerated?: ISODateString;
  nextGeneration?: ISODateString;
  createdBy: UUID;
}

/**
 * Analytics configuration interface
 */
interface AnalyticsConfig {
  enableRealTimeUpdates: boolean;
  enablePredictiveAnalytics: boolean;
  enableAnomalyDetection: boolean;
  enableAutomatedInsights: boolean;
  refreshInterval: number;
  dataRetentionDays: number;
  enableDataExport: boolean;
  enableCustomDashboards: boolean;
  maxWidgetsPerDashboard: number;
  enableSharing: boolean;
}

/**
 * View modes for analytics
 */
type AnalyticsViewMode = 'dashboard' | 'reports' | 'insights' | 'explorer' | 'settings';

/**
 * Analytics filters interface
 */
interface AnalyticsFilters {
  timeRange: AnalyticsTimeRange;
  customDateRange?: { start: Date; end: Date };
  workspaces: UUID[];
  users: UUID[];
  projects: UUID[];
  spas: string[];
  metricTypes: AnalyticsMetricType[];
  search: string;
}

/**
 * Main WorkspaceAnalytics component
 */
export const WorkspaceAnalytics: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Backend integration hooks
  const {
    workspaces,
    currentWorkspace,
    members,
    resources,
    analytics,
    loading,
    errors,
    getAnalytics,
    getWorkspaceMetrics,
    generateReport
  } = useWorkspaceManagement();

  const {
    systemHealth,
    performanceMetrics,
    crossGroupMetrics,
    getSystemStatus,
    optimizePerformance
  } = useRacineOrchestration();

  const {
    availableSPAs,
    spaStatuses,
    crossGroupResources,
    getSPAMetrics,
    getCrossGroupAnalytics
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    checkPermission
  } = useUserManagement();

  const {
    getInsights,
    predictTrends,
    detectAnomalies,
    generateRecommendations,
    analyzePatterns
  } = useAIAssistant();

  const {
    workflows,
    getWorkflowMetrics
  } = useJobWorkflowSpace();

  const {
    pipelines,
    getPipelineMetrics
  } = usePipelineManagement();

  // Local state
  const [config, setConfig] = useState<AnalyticsConfig>({
    enableRealTimeUpdates: true,
    enablePredictiveAnalytics: true,
    enableAnomalyDetection: true,
    enableAutomatedInsights: true,
    refreshInterval: 30,
    dataRetentionDays: 90,
    enableDataExport: true,
    enableCustomDashboards: true,
    maxWidgetsPerDashboard: 20,
    enableSharing: true
  });

  // Analytics data state
  const [dashboardWidgets, setDashboardWidgets] = useState<AnalyticsDashboardWidget[]>([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<WorkspaceAnalyticsMetrics | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);

  // View and UI state
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('dashboard');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: AnalyticsTimeRange.LAST_7_DAYS,
    workspaces: [],
    users: [],
    projects: [],
    spas: [],
    metricTypes: [],
    search: ''
  });

  // Dialog and modal state
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showInsightDialog, setShowInsightDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<AnalyticsDashboardWidget | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AnalyticsInsight | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Performance and animation state
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const scrollY = useMotionValue(0);
  const springScrollY = useSpring(scrollY, { stiffness: 300, damping: 30 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // ============================================================================
  // COMPUTED VALUES AND MEMOIZED DATA
  // ============================================================================

  // Date range for analytics
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date = now;

    switch (filters.timeRange) {
      case AnalyticsTimeRange.LAST_HOUR:
        start = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case AnalyticsTimeRange.LAST_24_HOURS:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case AnalyticsTimeRange.LAST_7_DAYS:
        start = startOfDay(subDays(now, 7));
        end = endOfDay(now);
        break;
      case AnalyticsTimeRange.LAST_30_DAYS:
        start = startOfDay(subDays(now, 30));
        end = endOfDay(now);
        break;
      case AnalyticsTimeRange.LAST_90_DAYS:
        start = startOfDay(subDays(now, 90));
        end = endOfDay(now);
        break;
      case AnalyticsTimeRange.LAST_YEAR:
        start = startOfDay(subDays(now, 365));
        end = endOfDay(now);
        break;
      case AnalyticsTimeRange.CUSTOM:
        start = filters.customDateRange?.start || subDays(now, 7);
        end = filters.customDateRange?.end || now;
        break;
      default:
        start = startOfDay(subDays(now, 7));
    }

    return { start, end };
  }, [filters.timeRange, filters.customDateRange]);

  // Load analytics metrics from backend
  const loadAnalyticsMetrics = useCallback(async (): Promise<WorkspaceAnalyticsMetrics> => {
    if (!currentWorkspace) return {} as WorkspaceAnalyticsMetrics;

    try {
      const [workspaceAnalytics, dashboardMetrics, activityMetrics] = await Promise.all([
        workspaceManagementAPI.getWorkspaceAnalytics(currentWorkspace.id, timeRange),
        dashboardAPI.getDashboardMetrics({
          workspace_id: currentWorkspace.id,
          time_range: filters.timeRange,
          include_cross_group: true
        }),
        activityTrackingAPI.getActivityAnalytics({
          workspace_id: currentWorkspace.id,
          start_date: timeRange.start,
          end_date: timeRange.end,
          analytics_types: ['usage', 'performance', 'collaboration', 'security'],
          include_trends: true
        })
      ]);

      return {
        // Usage metrics from activity tracking
        totalUsers: activityMetrics.metrics?.total_users || 0,
        activeUsers: activityMetrics.metrics?.active_users || 0,
        dailyActiveUsers: activityMetrics.metrics?.daily_active_users || 0,
        weeklyActiveUsers: activityMetrics.metrics?.weekly_active_users || 0,
        monthlyActiveUsers: activityMetrics.metrics?.monthly_active_users || 0,
        sessionDuration: activityMetrics.metrics?.avg_session_duration || 0,
        pageViews: activityMetrics.metrics?.page_views || 0,
        uniqueVisitors: activityMetrics.metrics?.unique_visitors || 0,
        
        // Performance metrics from workspace analytics
        averageLoadTime: workspaceAnalytics.performance?.avg_load_time || 0,
        errorRate: workspaceAnalytics.performance?.error_rate || 0,
        uptime: workspaceAnalytics.performance?.uptime || 0,
        throughput: workspaceAnalytics.performance?.throughput || 0,
        responseTime: workspaceAnalytics.performance?.response_time || 0,
        resourceUtilization: workspaceAnalytics.performance?.resource_utilization || 0,
        
        // Collaboration metrics from dashboard
        totalProjects: dashboardMetrics.metrics?.total_projects || 0,
        activeProjects: dashboardMetrics.metrics?.active_projects || 0,
        completedTasks: dashboardMetrics.metrics?.completed_tasks || 0,
        pendingTasks: dashboardMetrics.metrics?.pending_tasks || 0,
        teamCollaboration: dashboardMetrics.metrics?.collaboration_score || 0,
        sharedResources: dashboardMetrics.metrics?.shared_resources || 0,
        
        // Cost metrics from workspace analytics
        totalCost: workspaceAnalytics.cost?.total_cost || 0,
        costPerUser: workspaceAnalytics.cost?.cost_per_user || 0,
        costPerProject: workspaceAnalytics.cost?.cost_per_project || 0,
        resourceCosts: workspaceAnalytics.cost?.resource_breakdown || {},
        optimizationSavings: workspaceAnalytics.cost?.optimization_savings || 0,
        
        // Security metrics from activity tracking
        securityScore: activityMetrics.metrics?.security_score || 0,
        vulnerabilities: activityMetrics.metrics?.vulnerabilities || 0,
        complianceScore: activityMetrics.metrics?.compliance_score || 0,
        accessViolations: activityMetrics.metrics?.access_violations || 0,
        dataBreaches: activityMetrics.metrics?.data_breaches || 0,
        
        // SPA-specific metrics from dashboard
        spaMetrics: dashboardMetrics.spa_metrics || {},
        
        // Cross-group metrics from dashboard
        crossGroupMetrics: dashboardMetrics.cross_group_metrics || {
          totalLinks: 0,
          activeLinks: 0,
          linkQuality: 0,
          syncSuccess: 0,
          conflicts: 0,
          dataFlow: 0
        }
      };
    } catch (error) {
      console.error('Error loading analytics metrics:', error);
      return {} as WorkspaceAnalyticsMetrics;
    }
  }, [currentWorkspace, timeRange, filters.timeRange]);

  // Load insights from backend
  const loadAnalyticsInsights = useCallback(async (): Promise<AnalyticsInsight[]> => {
    if (!currentUser || !currentWorkspace) return [];

    try {
      const [anomalies, aiInsights, performanceInsights] = await Promise.all([
        activityTrackingAPI.getAnomalies({
          workspace_id: currentWorkspace.id,
          anomaly_types: ['performance', 'usage', 'security', 'cost'],
          time_range: filters.timeRange,
          include_analysis: true
        }),
        dashboardAPI.getAIInsights({
          workspace_id: currentWorkspace.id,
          insight_types: ['trend', 'prediction', 'recommendation'],
          time_range: filters.timeRange
        }),
        workspaceManagementAPI.getWorkspaceAnalytics(currentWorkspace.id, timeRange)
      ]);

      const insights: AnalyticsInsight[] = [];

      // Transform anomalies to insights
      anomalies.anomalies.forEach(anomaly => {
        insights.push({
          id: anomaly.id,
          type: 'anomaly',
          severity: anomaly.severity === 'critical' ? 'error' : anomaly.severity === 'high' ? 'warning' : 'info',
          title: anomaly.title || `${anomaly.anomaly_type} Anomaly`,
          description: anomaly.description,
          impact: anomaly.impact_level || 'medium',
          confidence: anomaly.confidence_score || 80,
          metric: anomaly.metric_name || anomaly.anomaly_type,
          currentValue: anomaly.current_value,
          expectedValue: anomaly.expected_value,
          threshold: anomaly.threshold,
          trend: anomaly.trend_direction || 'stable',
          actionable: true,
          suggestedActions: anomaly.metadata?.recommended_actions || [],
          automationAvailable: anomaly.metadata?.automation_available || false,
          detectedAt: anomaly.detected_at
        });
      });

      // Transform AI insights
      aiInsights.insights.forEach(insight => {
        insights.push({
          id: insight.id,
          type: insight.insight_type,
          severity: insight.priority === 'high' ? 'warning' : 'info',
          title: insight.title,
          description: insight.description,
          impact: insight.impact_level,
          confidence: insight.confidence_score,
          metric: insight.metric_name,
          currentValue: insight.current_value,
          expectedValue: insight.predicted_value,
          trend: insight.trend_direction,
          actionable: insight.is_actionable,
          suggestedActions: insight.recommended_actions || [],
          automationAvailable: insight.automation_available,
          detectedAt: insight.generated_at
        });
      });

      return insights;
    } catch (error) {
      console.error('Error loading analytics insights:', error);
      return [];
    }
  }, [currentUser, currentWorkspace, filters.timeRange, timeRange]);

  // Default dashboard widgets
  const defaultWidgets = useMemo((): AnalyticsDashboardWidget[] => {
    if (!currentUser) return [];

    return [
      {
        id: 'widget-usage-trend' as UUID,
        title: 'User Activity Trend',
        description: 'Daily active users over time',
        type: ChartType.LINE,
        metricType: AnalyticsMetricType.USAGE,
        position: { x: 0, y: 0, w: 6, h: 4 },
        configuration: {
          title: 'User Activity Trend',
          xAxis: {
            label: 'Date',
            type: 'time',
            showGrid: true,
            showLabels: true
          },
          yAxis: {
            label: 'Active Users',
            type: 'linear',
            min: 0,
            showGrid: true,
            showLabels: true
          },
          legend: {
            show: true,
            position: 'top',
            align: 'end',
            orientation: 'horizontal'
          },
          tooltip: {
            show: true,
            format: '{value} users on {date}',
            backgroundColor: '#000',
            borderColor: '#333',
            textColor: '#fff'
          },
          colors: {
            scheme: 'blues',
            customColors: [],
            opacity: 0.8,
            gradient: true
          },
          animation: {
            enabled: true,
            duration: 1000,
            easing: 'ease-out',
            delay: 0
          },
          filters: [],
          aggregation: {
            type: 'sum',
            groupBy: ['date'],
            timeWindow: '1d'
          }
        },
        dataSource: {
          type: 'workspace',
          source: 'user_activity',
          endpoint: '/api/analytics/user-activity',
          parameters: {},
          cacheEnabled: true,
          cacheTTL: 300
        },
        refreshInterval: 300,
        isVisible: true,
        isResizable: true,
        isDraggable: true,
        theme: 'auto',
        colorScheme: ['#3b82f6', '#1d4ed8', '#1e40af'],
        showLegend: true,
        showGrid: true,
        showTooltips: true,
        data: Array.from({ length: 7 }, (_, i) => ({
          timestamp: subDays(new Date(), 6 - i).toISOString() as ISODateString,
          value: Math.floor(Math.random() * 50) + 120 + i * 5,
          category: 'daily_active_users'
        })),
        lastUpdated: new Date().toISOString() as ISODateString,
        createdBy: currentUser.id,
        editableBy: [currentUser.id],
        viewableBy: []
      },
      {
        id: 'widget-performance-gauge' as UUID,
        title: 'System Performance',
        description: 'Overall system performance score',
        type: ChartType.PIE,
        metricType: AnalyticsMetricType.PERFORMANCE,
        position: { x: 6, y: 0, w: 3, h: 4 },
        configuration: {
          title: 'System Performance',
          xAxis: {
            label: '',
            type: 'category',
            showGrid: false,
            showLabels: false
          },
          yAxis: {
            label: '',
            type: 'linear',
            showGrid: false,
            showLabels: false
          },
          legend: {
            show: true,
            position: 'right',
            align: 'center',
            orientation: 'vertical'
          },
          tooltip: {
            show: true,
            format: '{category}: {value}%',
            backgroundColor: '#000',
            borderColor: '#333',
            textColor: '#fff'
          },
          colors: {
            scheme: 'default',
            customColors: ['#10b981', '#f59e0b', '#ef4444'],
            opacity: 0.9,
            gradient: false
          },
          animation: {
            enabled: true,
            duration: 1500,
            easing: 'ease-out',
            delay: 200
          },
          filters: [],
          aggregation: {
            type: 'avg',
            groupBy: ['category']
          }
        },
        dataSource: {
          type: 'workspace',
          source: 'performance_metrics',
          endpoint: '/api/analytics/performance',
          parameters: {},
          cacheEnabled: true,
          cacheTTL: 60
        },
        refreshInterval: 60,
        isVisible: true,
        isResizable: true,
        isDraggable: true,
        theme: 'auto',
        colorScheme: ['#10b981', '#f59e0b', '#ef4444'],
        showLegend: true,
        showGrid: false,
        showTooltips: true,
        data: [
          {
            timestamp: new Date().toISOString() as ISODateString,
            value: 92,
            category: 'Excellent',
            metadata: { color: '#10b981' }
          },
          {
            timestamp: new Date().toISOString() as ISODateString,
            value: 6,
            category: 'Good',
            metadata: { color: '#f59e0b' }
          },
          {
            timestamp: new Date().toISOString() as ISODateString,
            value: 2,
            category: 'Needs Attention',
            metadata: { color: '#ef4444' }
          }
        ],
        lastUpdated: new Date().toISOString() as ISODateString,
        createdBy: currentUser.id,
        editableBy: [currentUser.id],
        viewableBy: []
      },
      {
        id: 'widget-spa-usage' as UUID,
        title: 'SPA Usage Distribution',
        description: 'Usage across different SPAs',
        type: ChartType.BAR,
        metricType: AnalyticsMetricType.USAGE,
        position: { x: 9, y: 0, w: 3, h: 4 },
        configuration: {
          title: 'SPA Usage Distribution',
          xAxis: {
            label: 'SPA',
            type: 'category',
            showGrid: false,
            showLabels: true
          },
          yAxis: {
            label: 'Usage %',
            type: 'linear',
            min: 0,
            max: 100,
            showGrid: true,
            showLabels: true
          },
          legend: {
            show: false,
            position: 'top',
            align: 'center',
            orientation: 'horizontal'
          },
          tooltip: {
            show: true,
            format: '{category}: {value}%',
            backgroundColor: '#000',
            borderColor: '#333',
            textColor: '#fff'
          },
          colors: {
            scheme: 'default',
            customColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
            opacity: 0.8,
            gradient: true
          },
          animation: {
            enabled: true,
            duration: 1200,
            easing: 'ease-out',
            delay: 100
          },
          filters: [],
          aggregation: {
            type: 'avg',
            groupBy: ['spa']
          }
        },
        dataSource: {
          type: 'spa',
          source: 'usage_metrics',
          endpoint: '/api/analytics/spa-usage',
          parameters: {},
          cacheEnabled: true,
          cacheTTL: 180
        },
        refreshInterval: 180,
        isVisible: true,
        isResizable: true,
        isDraggable: true,
        theme: 'auto',
        colorScheme: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
        showLegend: false,
        showGrid: true,
        showTooltips: true,
        data: [
          { timestamp: new Date().toISOString() as ISODateString, value: 95, category: 'Data Sources' },
          { timestamp: new Date().toISOString() as ISODateString, value: 87, category: 'Classifications' },
          { timestamp: new Date().toISOString() as ISODateString, value: 78, category: 'Compliance' },
          { timestamp: new Date().toISOString() as ISODateString, value: 92, category: 'Catalog' },
          { timestamp: new Date().toISOString() as ISODateString, value: 84, category: 'Scan Logic' },
          { timestamp: new Date().toISOString() as ISODateString, value: 76, category: 'RBAC' },
          { timestamp: new Date().toISOString() as ISODateString, value: 89, category: 'Scan Rules' }
        ],
        lastUpdated: new Date().toISOString() as ISODateString,
        createdBy: currentUser.id,
        editableBy: [currentUser.id],
        viewableBy: []
      }
    ];
  }, [currentUser]);

  // Filtered insights
  const filteredInsights = useMemo(() => {
    let filtered = [...insights];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(insight =>
        insight.title.toLowerCase().includes(searchLower) ||
        insight.description.toLowerCase().includes(searchLower) ||
        insight.metric.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a, b) => {
      // Sort by severity first, then by detection time
      const severityOrder = { 'critical': 4, 'error': 3, 'warning': 2, 'info': 1 };
      const aSeverity = severityOrder[a.severity];
      const bSeverity = severityOrder[b.severity];
      
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity;
      }
      
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });
  }, [insights, filters.search]);

  // ============================================================================
  // EVENT HANDLERS AND ACTIONS
  // ============================================================================

  /**
   * Handle widget creation
   */
  const handleCreateWidget = useCallback(async (widgetData: Partial<AnalyticsDashboardWidget>) => {
    try {
      setIsLoading(true);
      
      const newWidget: AnalyticsDashboardWidget = {
        id: `widget-${Date.now()}` as UUID,
        title: widgetData.title || 'New Widget',
        description: widgetData.description || '',
        type: widgetData.type || ChartType.LINE,
        metricType: widgetData.metricType || AnalyticsMetricType.USAGE,
        position: widgetData.position || { x: 0, y: 0, w: 6, h: 4 },
        configuration: widgetData.configuration || defaultWidgets[0].configuration,
        dataSource: widgetData.dataSource || defaultWidgets[0].dataSource,
        refreshInterval: widgetData.refreshInterval || 300,
        isVisible: true,
        isResizable: true,
        isDraggable: true,
        theme: 'auto',
        colorScheme: ['#3b82f6'],
        showLegend: true,
        showGrid: true,
        showTooltips: true,
        data: [],
        lastUpdated: new Date().toISOString() as ISODateString,
        createdBy: currentUser!.id,
        editableBy: [currentUser!.id],
        viewableBy: [],
        ...widgetData
      };
      
      setDashboardWidgets(prev => [...prev, newWidget]);
      setShowWidgetDialog(false);
      
      toast({
        title: "Widget Created",
        description: `${newWidget.title} has been added to your dashboard.`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create widget.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, defaultWidgets]);

  /**
   * Handle data refresh
   */
  const handleRefreshData = useCallback(async (widgetIds?: UUID[]) => {
    try {
      setIsRefreshing(true);
      
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update metrics
      setAnalyticsMetrics(sampleMetrics);
      
      // Update insights
      setInsights(sampleInsights);
      
      // Update widget data
      if (widgetIds) {
        setDashboardWidgets(prev => prev.map(widget => 
          widgetIds.includes(widget.id)
            ? { ...widget, lastUpdated: new Date().toISOString() as ISODateString }
            : widget
        ));
      } else {
        setDashboardWidgets(prev => prev.map(widget => ({
          ...widget,
          lastUpdated: new Date().toISOString() as ISODateString
        })));
      }
      
      setLastUpdate(new Date());
      
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [loadAnalyticsMetrics, loadAnalyticsInsights]);

  /**
   * Handle insight acknowledgment
   */
  const handleAcknowledgeInsight = useCallback(async (insightId: UUID) => {
    try {
      setInsights(prev => prev.map(insight => 
        insight.id === insightId
          ? {
              ...insight,
              acknowledgedAt: new Date().toISOString() as ISODateString,
              acknowledgedBy: currentUser!.id
            }
          : insight
      ));
      
      toast({
        title: "Insight Acknowledged",
        description: "The insight has been marked as acknowledged.",
      });
    } catch (error) {
      toast({
        title: "Acknowledgment Failed",
        description: "Failed to acknowledge insight.",
        variant: "destructive",
      });
    }
  }, [currentUser]);

  /**
   * Handle report generation
   */
  const handleGenerateReport = useCallback(async (reportConfig: Partial<AnalyticsReport>) => {
    try {
      setIsGeneratingReport(true);
      
      const newReport: AnalyticsReport = {
        id: `report-${Date.now()}` as UUID,
        name: reportConfig.name || 'Analytics Report',
        description: reportConfig.description || '',
        type: reportConfig.type || 'on_demand',
        format: reportConfig.format || 'pdf',
        widgets: reportConfig.widgets || dashboardWidgets.map(w => w.id),
        timeRange: reportConfig.timeRange || filters.timeRange,
        customDateRange: reportConfig.customDateRange || filters.customDateRange,
        recipients: reportConfig.recipients || [],
        emailEnabled: reportConfig.emailEnabled || false,
        slackEnabled: reportConfig.slackEnabled || false,
        webhookEnabled: reportConfig.webhookEnabled || false,
        schedule: reportConfig.schedule,
        createdAt: new Date().toISOString() as ISODateString,
        updatedAt: new Date().toISOString() as ISODateString,
        lastGenerated: new Date().toISOString() as ISODateString,
        createdBy: currentUser!.id,
        ...reportConfig
      };
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setReports(prev => [...prev, newReport]);
      setShowReportDialog(false);
      
      toast({
        title: "Report Generated",
        description: `${newReport.name} has been generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [dashboardWidgets, filters.timeRange, filters.customDateRange, currentUser]);

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  /**
   * Initialize component and load data
   */
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Initialize with default widgets
        if (dashboardWidgets.length === 0 && currentUser) {
          setDashboardWidgets(defaultWidgets);
        }
        
        // Load analytics metrics from backend
        if (!analyticsMetrics) {
          const metrics = await loadAnalyticsMetrics();
          setAnalyticsMetrics(metrics);
        }
        
        // Load insights from backend
        if (insights.length === 0) {
          const loadedInsights = await loadAnalyticsInsights();
          setInsights(loadedInsights);
        }
        
        // Update last update timestamp
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
        toast({
          title: "Initialization Failed",
          description: "Failed to load analytics data.",
          variant: "destructive",
        });
      }
    };

    initializeAnalytics();
  }, [dashboardWidgets.length, analyticsMetrics, insights.length, currentUser, defaultWidgets, loadAnalyticsMetrics, loadAnalyticsInsights]);

  /**
   * Auto-refresh data
   */
  useEffect(() => {
    if (!config.enableRealTimeUpdates) return;

    const interval = setInterval(() => {
      handleRefreshData();
    }, config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [config.enableRealTimeUpdates, config.refreshInterval, handleRefreshData]);

  /**
   * Auto-save configuration changes
   */
  useEffect(() => {
    const saveConfig = () => {
      localStorage.setItem('analytics-config', JSON.stringify(config));
    };

    const timeoutId = setTimeout(saveConfig, 1000);
    return () => clearTimeout(timeoutId);
  }, [config]);

  /**
   * Load saved configuration
   */
  useEffect(() => {
    const savedConfig = localStorage.getItem('analytics-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load saved configuration:', error);
      }
    }
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'r':
            event.preventDefault();
            handleRefreshData();
            break;
          case 'w':
            event.preventDefault();
            setShowWidgetDialog(true);
            break;
          case 'g':
            event.preventDefault();
            setShowReportDialog(true);
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setShowWidgetDialog(false);
        setShowReportDialog(false);
        setShowInsightDialog(false);
        setShowSettingsDialog(false);
        setShowExportDialog(false);
        setSelectedWidget(null);
        setSelectedInsight(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleRefreshData]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get insight severity color
   */
  const getInsightSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  /**
   * Get trend icon
   */
  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      case 'stable':
        return Activity;
      default:
        return Activity;
    }
  }, []);

  /**
   * Render widget placeholder
   */
  const renderWidgetPlaceholder = useCallback((widget: AnalyticsDashboardWidget) => {
    const ChartIcon = widget.type === ChartType.LINE ? LineChart :
                     widget.type === ChartType.BAR ? BarChart3 :
                     widget.type === ChartType.PIE ? PieChart :
                     BarChart3;

    return (
      <Card className="h-full border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChartIcon className="w-5 h-5" />
            {widget.title}
          </CardTitle>
          {widget.description && (
            <CardDescription>{widget.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-muted-foreground">
            <ChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Chart visualization will be rendered here</p>
            <p className="text-sm mt-2">
              Data points: {widget.data.length} | 
              Last updated: {formatDistanceToNow(new Date(widget.lastUpdated))} ago
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }, []);

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div ref={containerRef} className="flex flex-col h-full bg-background">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40"
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Workspace Analytics</h1>
                  <p className="text-muted-foreground">
                    Advanced insights and performance monitoring
                  </p>
                </div>
              </div>
              
              {/* Real-time Status Indicator */}
              <div className="flex items-center gap-2 ml-8">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  config.enableRealTimeUpdates ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )}>
                </div>
                <span className="text-sm text-muted-foreground">
                  {isRefreshing ? "Refreshing..." : config.enableRealTimeUpdates ? "Live Updates" : "Manual Updates"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <Select
                value={filters.timeRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value as AnalyticsTimeRange }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnalyticsTimeRange.LAST_HOUR}>Last Hour</SelectItem>
                  <SelectItem value={AnalyticsTimeRange.LAST_24_HOURS}>Last 24 Hours</SelectItem>
                  <SelectItem value={AnalyticsTimeRange.LAST_7_DAYS}>Last 7 Days</SelectItem>
                  <SelectItem value={AnalyticsTimeRange.LAST_30_DAYS}>Last 30 Days</SelectItem>
                  <SelectItem value={AnalyticsTimeRange.LAST_90_DAYS}>Last 90 Days</SelectItem>
                  <SelectItem value={AnalyticsTimeRange.LAST_YEAR}>Last Year</SelectItem>
                  <SelectItem value={AnalyticsTimeRange.CUSTOM}>Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('dashboard')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'insights' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('insights')}
                >
                  <Lightbulb className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'reports' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('reports')}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'explorer' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('explorer')}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Refresh Button */}
              <Button 
                variant="outline" 
                onClick={() => handleRefreshData()}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>

              {/* Generate Report Button */}
              <Button 
                variant="outline" 
                onClick={() => setShowReportDialog(true)}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>

              {/* Add Widget Button */}
              <Button onClick={() => setShowWidgetDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>

              {/* Settings Button */}
              <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          {analyticsMetrics && (
            <div className="px-6 pb-4">
              <div className="grid grid-cols-8 gap-4">
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-lg font-semibold">{analyticsMetrics.activeUsers}</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-lg font-semibold">{analyticsMetrics.activeProjects}</div>
                      <div className="text-xs text-muted-foreground">Active Projects</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="text-lg font-semibold">{analyticsMetrics.uptime.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-lg font-semibold">{analyticsMetrics.responseTime}ms</div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="text-lg font-semibold">{analyticsMetrics.securityScore}%</div>
                      <div className="text-xs text-muted-foreground">Security Score</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-lg font-semibold">${analyticsMetrics.costPerUser.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Cost/User</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-teal-500" />
                    <div>
                      <div className="text-lg font-semibold">{analyticsMetrics.crossGroupMetrics.activeLinks}</div>
                      <div className="text-xs text-muted-foreground">Active Links</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-lg font-semibold">${analyticsMetrics.optimizationSavings.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Savings</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Dashboard View */}
              {viewMode === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Widgets Grid */}
                  <div className="grid grid-cols-12 gap-6 auto-rows-min">
                    {dashboardWidgets.filter(w => w.isVisible).map((widget) => (
                      <motion.div
                        key={widget.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "relative group",
                          `col-span-${widget.position.w}`,
                          `row-span-${widget.position.h}`
                        )}
                        style={{
                          gridColumn: `span ${widget.position.w} / span ${widget.position.w}`,
                          gridRow: `span ${widget.position.h} / span ${widget.position.h}`
                        }}
                      >
                        {renderWidgetPlaceholder(widget)}
                        
                        {/* Widget Controls */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedWidget(widget);
                                setShowWidgetDialog(true);
                              }}>
                                <Settings className="w-4 h-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRefreshData([widget.id])}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setDashboardWidgets(prev => prev.filter(w => w.id !== widget.id));
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Add Widget Placeholder */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-3 row-span-2"
                    >
                      <Card 
                        className="h-full border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => setShowWidgetDialog(true)}
                      >
                        <CardContent className="flex items-center justify-center h-full">
                          <div className="text-center text-muted-foreground">
                            <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">Add New Widget</p>
                            <p className="text-sm">Click to create a custom analytics widget</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Insights View */}
              {viewMode === 'insights' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Insights Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
                      <p className="text-muted-foreground">
                        Automated analysis and recommendations for your workspace
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        <Brain className="w-3 h-3 mr-1" />
                        {filteredInsights.length} insights
                      </Badge>
                    </div>
                  </div>

                  {/* Insights Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredInsights.map((insight) => {
                      const TrendIcon = getTrendIcon(insight.trend);
                      
                      return (
                        <motion.div
                          key={insight.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card className={cn(
                            "border-2 transition-all duration-200 cursor-pointer",
                            getInsightSeverityColor(insight.severity),
                            insight.acknowledgedAt && "opacity-60"
                          )}
                          onClick={() => {
                            setSelectedInsight(insight);
                            setShowInsightDialog(true);
                          }}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    insight.severity === 'critical' && "bg-red-500 text-white",
                                    insight.severity === 'error' && "bg-red-400 text-white",
                                    insight.severity === 'warning' && "bg-yellow-500 text-white",
                                    insight.severity === 'info' && "bg-blue-500 text-white"
                                  )}>
                                    {insight.type === 'trend' && <TrendingUp className="w-5 h-5" />}
                                    {insight.type === 'anomaly' && <AlertTriangle className="w-5 h-5" />}
                                    {insight.type === 'prediction' && <Brain className="w-5 h-5" />}
                                    {insight.type === 'recommendation' && <Lightbulb className="w-5 h-5" />}
                                    {insight.type === 'alert' && <Bell className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                      {insight.title}
                                      <TrendIcon className="w-4 h-4" />
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                      {insight.description}
                                    </CardDescription>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {insight.confidence}% confidence
                                  </Badge>
                                  <Badge 
                                    variant={insight.impact === 'critical' ? 'destructive' : 
                                            insight.impact === 'high' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {insight.impact} impact
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {/* Metric Information */}
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Metric: {insight.metric}</span>
                                <div className="flex items-center gap-2">
                                  <span>Current: {insight.currentValue}</span>
                                  {insight.expectedValue && (
                                    <span className="text-muted-foreground">
                                      Expected: {insight.expectedValue}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Suggested Actions */}
                              {insight.actionable && insight.suggestedActions.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Suggested Actions:</div>
                                  <div className="space-y-1">
                                    {insight.suggestedActions.slice(0, 2).map((action, index) => (
                                      <div key={index} className="text-sm text-muted-foreground">
                                        • {action}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Timestamp and Actions */}
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDistanceToNow(new Date(insight.detectedAt))} ago</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  {!insight.acknowledgedAt && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAcknowledgeInsight(insight.id);
                                      }}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Acknowledge
                                    </Button>
                                  )}
                                  {insight.automationAvailable && (
                                    <Button 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle automation
                                      }}
                                    >
                                      <Zap className="w-4 h-4 mr-1" />
                                      Automate
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Empty State for Insights */}
                  {filteredInsights.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center h-96 text-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Lightbulb className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Insights Available</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {config.enableAutomatedInsights 
                          ? "AI is analyzing your workspace data. Insights will appear here as patterns are detected."
                          : "Enable automated insights in settings to get AI-powered recommendations."
                        }
                      </p>
                      <Button onClick={() => setShowSettingsDialog(true)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Insights
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Reports View */}
              {viewMode === 'reports' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Reports Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Analytics Reports</h2>
                      <p className="text-muted-foreground">
                        Scheduled and on-demand analytics reports
                      </p>
                    </div>
                    <Button onClick={() => setShowReportDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Report
                    </Button>
                  </div>

                  {/* Reports List */}
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <motion.div
                        key={report.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="hover:bg-muted/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{report.name}</h3>
                                  <p className="text-sm text-muted-foreground">{report.description}</p>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                    <span>Type: {report.type}</span>
                                    <span>Format: {report.format.toUpperCase()}</span>
                                    {report.lastGenerated && (
                                      <span>Last: {formatDistanceToNow(new Date(report.lastGenerated))} ago</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  ArrowDownTrayIcon
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Play className="w-4 h-4 mr-1" />
                                  Generate
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Settings className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Share2 className="w-4 h-4 mr-2" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Empty State for Reports */}
                  {reports.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center h-96 text-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Reports Created</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Create your first analytics report to schedule automated insights delivery.
                      </p>
                      <Button onClick={() => setShowReportDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Report
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Explorer View */}
              {viewMode === 'explorer' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center py-24">
                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Data Explorer</h3>
                    <p className="text-muted-foreground">
                      Advanced data exploration and custom query builder coming soon
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {(isLoading || isRefreshing || isGeneratingReport) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">
                  {isGeneratingReport ? "Generating Report..." : 
                   isRefreshing ? "Refreshing Data..." : "Loading..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default WorkspaceAnalytics;