/**
 * Intelligent Dashboard Orchestrator
 * ==================================
 * 
 * Master controller for the entire intelligent dashboard system that orchestrates
 * real-time analytics, cross-SPA data integration, AI-powered insights, and
 * customizable dashboard experiences. Built to surpass Databricks and Azure
 * dashboard capabilities with enterprise-grade performance and design.
 * 
 * Features:
 * - Real-time cross-SPA data aggregation and visualization
 * - Drag-and-drop dashboard builder with advanced customization
 * - AI-powered recommendations and predictive analytics
 * - Executive reporting and drill-down capabilities
 * - Advanced alerting and notification system
 * - Multi-workspace dashboard management
 * - Collaborative dashboard sharing and editing
 * - Enterprise-grade performance monitoring
 * 
 * Technology Stack:
 * - React 18+ with TypeScript
 * - Next.js 14+ with App Router
 * - shadcn/ui components with Tailwind CSS
 * - React Query for state management
 * - WebSocket for real-time updates
 * - D3.js and Recharts for advanced visualizations
 * - Framer Motion for smooth animations
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

// Icons
import { BarChart3, LineChart, PieChart, Activity, TrendingUp, TrendingDown, Zap, Eye, Settings, Plus, Minus, MoreHorizontal, RefreshCw, Download, Share, Filter, Search, Bell, AlertTriangle, CheckCircle, XCircle, Clock, Users, Database, Server, Shield, Brain, Target, Layers, Grid, Layout, Maximize2, Minimize2, Move, Copy, Trash2, Edit, Save, Star, Play, Pause, Square, RotateCcw, ExternalLink, Info, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom Hooks and Services
import { useDashboardAPIs } from '../../hooks/useDashboardAPIs';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useActivityTracking } from '../../hooks/useActivityTracking';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

// Types
import {
  DashboardState,
  DashboardWidget,
  DashboardType,
  WidgetType,
  ViewMode,
  LayoutType,
  DashboardLayout,
  WidgetConfiguration,
  CrossGroupMetrics,
  PredictiveInsight,
  ExecutiveReport,
  SystemHealth,
  PerformanceMetrics,
  AlertConfiguration,
  UUID,
  ISODateString,
  SystemStatus,
  OperationStatus
} from '../../types/racine-core.types';

// Components
import { CrossGroupKPIDashboard } from './CrossGroupKPIDashboard';
import { RealTimeMetricsEngine } from './RealTimeMetricsEngine';
import { PredictiveAnalyticsDashboard } from './PredictiveAnalyticsDashboard';
import { CustomDashboardBuilder } from './CustomDashboardBuilder';
import { AlertingAndNotificationCenter } from './AlertingAndNotificationCenter';
import { ExecutiveReportingDashboard } from './ExecutiveReportingDashboard';
import { PerformanceMonitoringDashboard } from './PerformanceMonitoringDashboard';
import { DashboardPersonalizationEngine } from './DashboardPersonalizationEngine';

// Utils
import { cn } from '../../utils/cn';
import { formatNumber, formatDate, formatDuration } from '../../utils/formatting-utils';
import { validateDashboardConfig, optimizeDashboardPerformance } from '../../utils/dashboard-utils';

/**
 * Dashboard orchestrator configuration
 */
interface DashboardOrchestratorConfig {
  refreshInterval: number;
  maxConcurrentWidgets: number;
  enableRealTimeUpdates: boolean;
  enablePredictiveAnalytics: boolean;
  enableCrossGroupIntegration: boolean;
  enableAIInsights: boolean;
  autoSaveInterval: number;
  performanceThreshold: number;
  alertThreshold: number;
}

/**
 * Dashboard view modes
 */
enum DashboardViewMode {
  OVERVIEW = 'overview',
  KPI = 'kpi',
  REAL_TIME = 'real_time', 
  PREDICTIVE = 'predictive',
  CUSTOM = 'custom',
  EXECUTIVE = 'executive',
  PERFORMANCE = 'performance',
  BUILDER = 'builder'
}

/**
 * Dashboard orchestrator state
 */
interface DashboardOrchestratorState {
  currentDashboard: DashboardState | null;
  activeDashboards: DashboardState[];
  availableWidgets: WidgetType[];
  viewMode: DashboardViewMode;
  isBuilderMode: boolean;
  isFullscreen: boolean;
  selectedWidgets: UUID[];
  draggedWidget: DashboardWidget | null;
  copiedWidgets: DashboardWidget[];
  systemHealth: SystemHealth;
  crossGroupMetrics: CrossGroupMetrics;
  predictiveInsights: PredictiveInsight[];
  alertsActive: boolean;
  performanceMetrics: PerformanceMetrics;
  lastRefresh: ISODateString;
  autoRefresh: boolean;
  refreshInterval: number;
  isLoading: boolean;
  error: string | null;
  unsavedChanges: boolean;
}

/**
 * Widget drag and drop data
 */
interface DragData {
  type: 'widget' | 'component';
  data: DashboardWidget | WidgetType;
  position?: { x: number; y: number };
}

/**
 * Dashboard template definitions
 */
const DASHBOARD_TEMPLATES = {
  executive: {
    name: 'Executive Overview',
    description: 'High-level KPIs and strategic insights',
    widgets: ['metric', 'chart', 'progress', 'alert'],
    layout: { type: 'grid' as LayoutType, columns: 4, rows: 3 }
  },
  operational: {
    name: 'Operational Dashboard',
    description: 'Real-time operational metrics and monitoring',
    widgets: ['real_time_chart', 'gauge', 'activity_feed', 'table'],
    layout: { type: 'grid' as LayoutType, columns: 3, rows: 4 }
  },
  analytical: {
    name: 'Analytics Dashboard',
    description: 'Deep-dive analytics and data exploration',
    widgets: ['chart', 'table', 'heatmap', 'scatter'],
    layout: { type: 'flex' as LayoutType, columns: 2, rows: 6 }
  },
  performance: {
    name: 'Performance Monitoring',
    description: 'System performance and health metrics',
    widgets: ['gauge', 'metric', 'progress', 'alert'],
    layout: { type: 'grid' as LayoutType, columns: 4, rows: 2 }
  }
};

/**
 * Animation variants for smooth transitions
 */
const animationVariants = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideIn: {
    initial: { opacity: 0, x: -300 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 300 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

/**
 * Default configuration
 */
const DEFAULT_CONFIG: DashboardOrchestratorConfig = {
  refreshInterval: 30000, // 30 seconds
  maxConcurrentWidgets: 20,
  enableRealTimeUpdates: true,
  enablePredictiveAnalytics: true,
  enableCrossGroupIntegration: true,
  enableAIInsights: true,
  autoSaveInterval: 60000, // 1 minute
  performanceThreshold: 80,
  alertThreshold: 90
};

/**
 * Intelligent Dashboard Orchestrator Props Interface
 */
interface IntelligentDashboardOrchestratorProps {
  mode?: 'full-dashboard' | 'basic-dashboard' | 'executive-view' | 'analytics-only';
  enableRealTimeUpdates?: boolean;
  enableCustomWidgets?: boolean;
  enableDrillDownAnalytics?: boolean;
  enableExportCapabilities?: boolean;
  enableAlertManagement?: boolean;
  enablePredictiveAnalytics?: boolean;
  enableCrossGroupCorrelation?: boolean;
  enablePerformanceMetrics?: boolean;
  enableNotifications?: boolean;
  showSystemHealth?: boolean;
  showDataQuality?: boolean;
  showComplianceScores?: boolean;
  showUsageStatistics?: boolean;
  showTrendAnalysis?: boolean;
  showQuickActions?: boolean;
  autoRefreshInterval?: number;
}

/**
 * Intelligent Dashboard Orchestrator Component
 */
export const IntelligentDashboardOrchestrator: React.FC<IntelligentDashboardOrchestratorProps> = ({
  mode = 'full-dashboard',
  enableRealTimeUpdates = true,
  enableCustomWidgets = true,
  enableDrillDownAnalytics = true,
  enableExportCapabilities = true,
  enableAlertManagement = true,
  enablePredictiveAnalytics = true,
  enableCrossGroupCorrelation = true,
  enablePerformanceMetrics = true,
  enableNotifications = true,
  showSystemHealth = true,
  showDataQuality = true,
  showComplianceScores = true,
  showUsageStatistics = true,
  showTrendAnalysis = true,
  showQuickActions = true,
  autoRefreshInterval = 30000
}) => {
  // Refs
  const dashboardContainerRef = useRef<HTMLDivElement>(null);
  const dragSourceRef = useRef<DragData | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core Hooks
  const { 
    dashboards,
    widgets,
    metrics,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    removeWidget,
    updateWidget,
    getRealtimeMetrics,
    getExecutiveReport,
    exportDashboard,
    importDashboard,
    shareDashboard,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useDashboardAPIs();

  const {
    systemHealth,
    performanceMetrics,
    coordinateOperation,
    monitorPerformance,
    optimizePerformance
  } = useRacineOrchestration();

  const {
    crossGroupMetrics,
    getAllSPAStatus,
    coordinateAcrossSPAs,
    getIntegratedData
  } = useCrossGroupIntegration();

  const {
    getContextualInsights,
    getPredictiveAnalytics,
    getRecommendations,
    analyzePerformance
  } = useAIAssistant();

  const {
    activeWorkspace,
    workspaceMetrics,
    switchWorkspace
  } = useWorkspaceManagement();

  const {
    currentUser,
    permissions,
    userPreferences
  } = useUserManagement();

  const {
    trackActivity,
    getDashboardAnalytics
  } = useActivityTracking();

  const {
    subscribeToUpdates,
    unsubscribeFromUpdates
  } = useRealtimeUpdates();

  // State Management
  const [state, setState] = useState<DashboardOrchestratorState>({
    currentDashboard: null,
    activeDashboards: [],
    availableWidgets: Object.values(WidgetType),
    viewMode: DashboardViewMode.OVERVIEW,
    isBuilderMode: false,
    isFullscreen: false,
    selectedWidgets: [],
    draggedWidget: null,
    copiedWidgets: [],
    systemHealth: {
      status: SystemStatus.HEALTHY,
      uptime: 0,
      lastCheck: new Date().toISOString(),
      components: []
    } as SystemHealth,
    crossGroupMetrics: {} as CrossGroupMetrics,
    predictiveInsights: [],
    alertsActive: true,
    performanceMetrics: {} as PerformanceMetrics,
    lastRefresh: new Date().toISOString(),
    autoRefresh: true,
    refreshInterval: DEFAULT_CONFIG.refreshInterval,
    isLoading: false,
    error: null,
    unsavedChanges: false
  });

  const [config, setConfig] = useState<DashboardOrchestratorConfig>(DEFAULT_CONFIG);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Computed Values
  const filteredDashboards = useMemo(() => {
    let filtered = dashboards || [];
    
    if (searchQuery) {
      filtered = filtered.filter(dashboard => 
        dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (filterBy !== 'all') {
      filtered = filtered.filter(dashboard => 
        dashboard.type === filterBy ||
        dashboard.tags.includes(filterBy)
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'viewed':
          return new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime();
        default:
          return 0;
      }
    });
  }, [dashboards, searchQuery, filterBy, sortBy]);

  const activeWidgetsCount = useMemo(() => {
    return state.currentDashboard?.widgets.length || 0;
  }, [state.currentDashboard]);

  const performanceScore = useMemo(() => {
    if (!performanceMetrics) return 100;
    const score = 100 - (performanceMetrics.memoryUsage || 0) - (performanceMetrics.cpuUsage || 0);
    return Math.max(0, Math.min(100, score));
  }, [performanceMetrics]);

  const healthStatus = useMemo(() => {
    return systemHealth?.status || SystemStatus.HEALTHY;
  }, [systemHealth]);

  // Initialize component
  useEffect(() => {
    initializeDashboardOrchestrator();
    return () => cleanup();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (state.autoRefresh && state.refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        refreshDashboardData();
      }, state.refreshInterval);
    } else {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [state.autoRefresh, state.refreshInterval]);

  // Auto-save effect
  useEffect(() => {
    if (state.unsavedChanges && config.autoSaveInterval > 0) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveDashboard();
      }, config.autoSaveInterval);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [state.unsavedChanges, config.autoSaveInterval]);

  // Real-time updates subscription
  useEffect(() => {
    if (config.enableRealTimeUpdates && state.currentDashboard) {
      subscribeToUpdates('dashboard', state.currentDashboard.id, handleRealtimeUpdate);
    }

    return () => {
      unsubscribeFromUpdates('dashboard');
    };
  }, [config.enableRealTimeUpdates, state.currentDashboard?.id]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      monitorDashboardPerformance();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize the dashboard orchestrator
   */
  const initializeDashboardOrchestrator = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load initial data
      await Promise.all([
        loadSystemHealth(),
        loadCrossGroupMetrics(),
        loadPredictiveInsights(),
        loadUserPreferences()
      ]);

      // Set default dashboard if available
      if (dashboards && dashboards.length > 0) {
        const defaultDashboard = dashboards.find(d => d.type === DashboardType.PERSONAL) || dashboards[0];
        await selectDashboard(defaultDashboard.id);
      }

      trackActivity('dashboard_orchestrator_initialized', {
        dashboardCount: dashboards?.length || 0,
        systemHealth: healthStatus
      });

    } catch (error) {
      console.error('Failed to initialize dashboard orchestrator:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to initialize dashboard orchestrator',
        isLoading: false 
      }));
    }
  }, [dashboards, healthStatus]);

  /**
   * Load system health data
   */
  const loadSystemHealth = useCallback(async () => {
    try {
      const health = await monitorPerformance();
      setState(prev => ({ 
        ...prev, 
        systemHealth: health.systemHealth,
        performanceMetrics: health.performanceMetrics 
      }));
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  }, [monitorPerformance]);

  /**
   * Load cross-group metrics
   */
  const loadCrossGroupMetrics = useCallback(async () => {
    try {
      const metrics = await getIntegratedData();
      setState(prev => ({ ...prev, crossGroupMetrics: metrics }));
    } catch (error) {
      console.error('Failed to load cross-group metrics:', error);
    }
  }, [getIntegratedData]);

  /**
   * Load AI predictive insights
   */
  const loadPredictiveInsights = useCallback(async () => {
    if (!config.enablePredictiveAnalytics) return;

    try {
      const insights = await getPredictiveAnalytics({
        timeframe: '7d',
        includeRecommendations: true,
        dataSource: 'all_groups'
      });
      setState(prev => ({ ...prev, predictiveInsights: insights }));
    } catch (error) {
      console.error('Failed to load predictive insights:', error);
    }
  }, [getPredictiveAnalytics, config.enablePredictiveAnalytics]);

  /**
   * Load user preferences
   */
  const loadUserPreferences = useCallback(async () => {
    if (userPreferences?.dashboard) {
      setConfig(prev => ({
        ...prev,
        ...userPreferences.dashboard
      }));
      
      setState(prev => ({
        ...prev,
        autoRefresh: userPreferences.dashboard.autoRefresh ?? true,
        refreshInterval: userPreferences.dashboard.refreshInterval ?? DEFAULT_CONFIG.refreshInterval,
        alertsActive: userPreferences.dashboard.alertsActive ?? true
      }));
    }
  }, [userPreferences]);

  /**
   * Handle real-time updates
   */
  const handleRealtimeUpdate = useCallback((update: any) => {
    switch (update.type) {
      case 'dashboard_updated':
        if (state.currentDashboard?.id === update.dashboardId) {
          setState(prev => ({
            ...prev,
            currentDashboard: { ...prev.currentDashboard!, ...update.data }
          }));
        }
        break;
      
      case 'widget_updated':
        if (state.currentDashboard?.id === update.dashboardId) {
          setState(prev => ({
            ...prev,
            currentDashboard: {
              ...prev.currentDashboard!,
              widgets: prev.currentDashboard!.widgets.map(widget =>
                widget.id === update.widgetId ? { ...widget, ...update.data } : widget
              )
            }
          }));
        }
        break;
      
      case 'metrics_updated':
        setState(prev => ({
          ...prev,
          crossGroupMetrics: { ...prev.crossGroupMetrics, ...update.data },
          lastRefresh: new Date().toISOString()
        }));
        break;
      
      case 'system_health_updated':
        setState(prev => ({
          ...prev,
          systemHealth: update.data
        }));
        break;
    }
  }, [state.currentDashboard]);

  /**
   * Refresh dashboard data
   */
  const refreshDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        loadSystemHealth(),
        loadCrossGroupMetrics(),
        config.enablePredictiveAnalytics && loadPredictiveInsights()
      ].filter(Boolean));

      setState(prev => ({
        ...prev,
        lastRefresh: new Date().toISOString()
      }));

      trackActivity('dashboard_data_refreshed', {
        dashboardId: state.currentDashboard?.id,
        manual: false
      });

    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to refresh dashboard data'
      }));
    }
  }, [loadSystemHealth, loadCrossGroupMetrics, loadPredictiveInsights, config.enablePredictiveAnalytics, state.currentDashboard]);

  /**
   * Monitor dashboard performance
   */
  const monitorDashboardPerformance = useCallback(async () => {
    try {
      const performance = await analyzePerformance({
        component: 'dashboard',
        metrics: ['memory', 'cpu', 'load_time', 'render_time']
      });

      setState(prev => ({
        ...prev,
        performanceMetrics: performance.metrics
      }));

      // Auto-optimize if performance is below threshold
      if (performance.score < config.performanceThreshold) {
        await optimizePerformance();
      }

    } catch (error) {
      console.error('Failed to monitor dashboard performance:', error);
    }
  }, [analyzePerformance, optimizePerformance, config.performanceThreshold]);

  /**
   * Select a dashboard
   */
  const selectDashboard = useCallback(async (dashboardId: UUID) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const dashboard = dashboards?.find(d => d.id === dashboardId);
      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      setState(prev => ({ 
        ...prev, 
        currentDashboard: dashboard,
        selectedWidgets: [],
        isLoading: false 
      }));

      trackActivity('dashboard_selected', {
        dashboardId,
        dashboardType: dashboard.type,
        widgetCount: dashboard.widgets.length
      });

    } catch (error) {
      console.error('Failed to select dashboard:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to select dashboard',
        isLoading: false 
      }));
    }
  }, [dashboards, trackActivity]);

  /**
   * Create a new dashboard
   */
  const createNewDashboard = useCallback(async (template?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const templateConfig = template ? DASHBOARD_TEMPLATES[template as keyof typeof DASHBOARD_TEMPLATES] : null;
      
      const newDashboard = await createDashboard({
        name: templateConfig?.name || 'New Dashboard',
        description: templateConfig?.description || '',
        type: DashboardType.PERSONAL,
        layout: templateConfig?.layout || { type: LayoutType.GRID, columns: 4, rows: 3 },
        workspaceId: activeWorkspace?.id
      });

      setState(prev => ({ 
        ...prev, 
        currentDashboard: newDashboard,
        isLoading: false,
        viewMode: DashboardViewMode.BUILDER
      }));

      trackActivity('dashboard_created', {
        dashboardId: newDashboard.id,
        template: template || 'blank',
        workspaceId: activeWorkspace?.id
      });

    } catch (error) {
      console.error('Failed to create dashboard:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create dashboard',
        isLoading: false 
      }));
    }
  }, [createDashboard, activeWorkspace, trackActivity]);

  /**
   * Save current dashboard
   */
  const saveDashboard = useCallback(async () => {
    if (!state.currentDashboard || !state.unsavedChanges) return;

    try {
      await updateDashboard(state.currentDashboard.id, state.currentDashboard);
      
      setState(prev => ({ ...prev, unsavedChanges: false }));

      trackActivity('dashboard_saved', {
        dashboardId: state.currentDashboard.id,
        widgetCount: state.currentDashboard.widgets.length
      });

    } catch (error) {
      console.error('Failed to save dashboard:', error);
      setState(prev => ({ ...prev, error: 'Failed to save dashboard' }));
    }
  }, [state.currentDashboard, state.unsavedChanges, updateDashboard, trackActivity]);

  /**
   * Delete dashboard
   */
  const handleDeleteDashboard = useCallback(async (dashboardId: UUID) => {
    try {
      await deleteDashboard(dashboardId);
      
      if (state.currentDashboard?.id === dashboardId) {
        const remainingDashboards = dashboards?.filter(d => d.id !== dashboardId);
        if (remainingDashboards && remainingDashboards.length > 0) {
          await selectDashboard(remainingDashboards[0].id);
        } else {
          setState(prev => ({ ...prev, currentDashboard: null }));
        }
      }

      trackActivity('dashboard_deleted', { dashboardId });

    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      setState(prev => ({ ...prev, error: 'Failed to delete dashboard' }));
    }
  }, [deleteDashboard, state.currentDashboard, dashboards, selectDashboard, trackActivity]);

  /**
   * Toggle view mode
   */
  const toggleViewMode = useCallback((mode: DashboardViewMode) => {
    setState(prev => ({ 
      ...prev, 
      viewMode: mode,
      isBuilderMode: mode === DashboardViewMode.BUILDER
    }));

    trackActivity('dashboard_view_changed', {
      dashboardId: state.currentDashboard?.id,
      viewMode: mode
    });
  }, [state.currentDashboard, trackActivity]);

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
    
    if (!state.isFullscreen && dashboardContainerRef.current) {
      dashboardContainerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [state.isFullscreen]);

  /**
   * Handle widget selection
   */
  const handleWidgetSelect = useCallback((widgetId: UUID, multiSelect = false) => {
    setState(prev => {
      let selectedWidgets = [...prev.selectedWidgets];
      
      if (multiSelect) {
        if (selectedWidgets.includes(widgetId)) {
          selectedWidgets = selectedWidgets.filter(id => id !== widgetId);
        } else {
          selectedWidgets.push(widgetId);
        }
      } else {
        selectedWidgets = selectedWidgets.includes(widgetId) ? [] : [widgetId];
      }
      
      return { ...prev, selectedWidgets };
    });
  }, []);

  /**
   * Handle widget drag start
   */
  const handleDragStart = useCallback((widget: DashboardWidget, event: React.DragEvent) => {
    dragSourceRef.current = {
      type: 'widget',
      data: widget,
      position: { x: event.clientX, y: event.clientY }
    };
    
    setState(prev => ({ ...prev, draggedWidget: widget }));
  }, []);

  /**
   * Handle widget drag end
   */
  const handleDragEnd = useCallback(() => {
    dragSourceRef.current = null;
    setState(prev => ({ ...prev, draggedWidget: null }));
  }, []);

  /**
   * Handle widget drop
   */
  const handleDrop = useCallback((event: React.DragEvent, targetPosition?: { x: number; y: number }) => {
    event.preventDefault();
    
    if (!dragSourceRef.current || !state.currentDashboard) return;

    const { type, data } = dragSourceRef.current;
    
    if (type === 'widget' && data) {
      // Move existing widget
      const widget = data as DashboardWidget;
      const updatedWidgets = state.currentDashboard.widgets.map(w => 
        w.id === widget.id 
          ? { ...w, position: targetPosition || w.position }
          : w
      );

      setState(prev => ({
        ...prev,
        currentDashboard: {
          ...prev.currentDashboard!,
          widgets: updatedWidgets
        },
        unsavedChanges: true
      }));
    }
  }, [state.currentDashboard]);

  /**
   * Copy selected widgets
   */
  const copySelectedWidgets = useCallback(() => {
    if (!state.currentDashboard || state.selectedWidgets.length === 0) return;

    const widgetsToCopy = state.currentDashboard.widgets.filter(w => 
      state.selectedWidgets.includes(w.id)
    );

    setState(prev => ({ ...prev, copiedWidgets: widgetsToCopy }));

    trackActivity('widgets_copied', {
      dashboardId: state.currentDashboard.id,
      widgetCount: widgetsToCopy.length
    });
  }, [state.currentDashboard, state.selectedWidgets, trackActivity]);

  /**
   * Paste copied widgets
   */
  const pasteWidgets = useCallback(async () => {
    if (!state.currentDashboard || state.copiedWidgets.length === 0) return;

    try {
      const newWidgets = await Promise.all(
        state.copiedWidgets.map(async (widget) => {
          const newWidget = await addWidget(state.currentDashboard!.id, {
            ...widget,
            id: undefined, // Generate new ID
            title: `${widget.title} (Copy)`,
            position: {
              x: widget.position.x + 50,
              y: widget.position.y + 50
            }
          });
          return newWidget;
        })
      );

      setState(prev => ({
        ...prev,
        currentDashboard: {
          ...prev.currentDashboard!,
          widgets: [...prev.currentDashboard!.widgets, ...newWidgets]
        },
        unsavedChanges: true
      }));

      trackActivity('widgets_pasted', {
        dashboardId: state.currentDashboard.id,
        widgetCount: newWidgets.length
      });

    } catch (error) {
      console.error('Failed to paste widgets:', error);
      setState(prev => ({ ...prev, error: 'Failed to paste widgets' }));
    }
  }, [state.currentDashboard, state.copiedWidgets, addWidget, trackActivity]);

  /**
   * Export dashboard
   */
  const handleExportDashboard = useCallback(async (format: 'json' | 'pdf' | 'png') => {
    if (!state.currentDashboard) return;

    try {
      const exportData = await exportDashboard(state.currentDashboard.id, { format });
      
      // Create download link
      const blob = new Blob([exportData.data], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${state.currentDashboard.name}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      trackActivity('dashboard_exported', {
        dashboardId: state.currentDashboard.id,
        format
      });

    } catch (error) {
      console.error('Failed to export dashboard:', error);
      setState(prev => ({ ...prev, error: 'Failed to export dashboard' }));
    }
  }, [state.currentDashboard, exportDashboard, trackActivity]);

  /**
   * Share dashboard
   */
  const handleShareDashboard = useCallback(async (shareConfig: { 
    users: UUID[]; 
    permissions: string; 
    expiresAt?: ISODateString;
  }) => {
    if (!state.currentDashboard) return;

    try {
      await shareDashboard(state.currentDashboard.id, shareConfig);

      trackActivity('dashboard_shared', {
        dashboardId: state.currentDashboard.id,
        userCount: shareConfig.users.length,
        permissions: shareConfig.permissions
      });

    } catch (error) {
      console.error('Failed to share dashboard:', error);
      setState(prev => ({ ...prev, error: 'Failed to share dashboard' }));
    }
  }, [state.currentDashboard, shareDashboard, trackActivity]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    unsubscribeFromUpdates('dashboard');
  }, [unsubscribeFromUpdates]);

  /**
   * Keyboard shortcuts handler
   */
  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          saveDashboard();
          break;
        case 'c':
          if (state.selectedWidgets.length > 0) {
            event.preventDefault();
            copySelectedWidgets();
          }
          break;
        case 'v':
          if (state.copiedWidgets.length > 0) {
            event.preventDefault();
            pasteWidgets();
          }
          break;
        case 'f':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'r':
          event.preventDefault();
          refreshDashboardData();
          break;
      }
    }
    
    if (event.key === 'Escape') {
      setState(prev => ({ 
        ...prev, 
        selectedWidgets: [],
        isFullscreen: false 
      }));
    }
  }, [saveDashboard, copySelectedWidgets, pasteWidgets, toggleFullscreen, refreshDashboardData, state.selectedWidgets, state.copiedWidgets]);

  // Add keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  /**
   * Render dashboard header
   */
  const renderDashboardHeader = () => (
    <motion.div 
      className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b"
      variants={animationVariants.fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Intelligent Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enterprise-grade analytics and insights
            </p>
          </div>
        </div>
        
        {state.currentDashboard && (
          <div className="flex items-center space-x-2">
            <Separator orientation="vertical" className="h-8" />
            <Badge variant="outline" className="text-xs">
              {state.currentDashboard.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {activeWidgetsCount} widgets
            </Badge>
            {state.unsavedChanges && (
              <Badge variant="destructive" className="text-xs">
                Unsaved
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Performance indicator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  healthStatus === SystemStatus.HEALTHY ? "bg-green-500" :
                  healthStatus === SystemStatus.DEGRADED ? "bg-yellow-500" :
                  "bg-red-500"
                )} />
                <span className="text-xs font-medium">
                  {performanceScore}%
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>System Performance: {performanceScore}%</p>
              <p>Status: {healthStatus}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Auto-refresh indicator */}
        {state.autoRefresh && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Auto-refresh</span>
          </div>
        )}

        {/* Action buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshDashboardData()}
          disabled={state.isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", state.isLoading && "animate-spin")} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleFullscreen}>
              {state.isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );

  /**
   * Render dashboard navigation
   */
  const renderDashboardNavigation = () => (
    <motion.div 
      className="p-4 bg-white dark:bg-gray-800 border-b"
      variants={animationVariants.fadeIn}
      initial="initial"
      animate="animate"
    >
      <Tabs value={state.viewMode} onValueChange={(value) => toggleViewMode(value as DashboardViewMode)}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-auto grid-cols-8">
            <TabsTrigger value={DashboardViewMode.OVERVIEW}>Overview</TabsTrigger>
            <TabsTrigger value={DashboardViewMode.KPI}>KPIs</TabsTrigger>
            <TabsTrigger value={DashboardViewMode.REAL_TIME}>Real-time</TabsTrigger>
            <TabsTrigger value={DashboardViewMode.PREDICTIVE}>Predictive</TabsTrigger>
            <TabsTrigger value={DashboardViewMode.CUSTOM}>Custom</TabsTrigger>
            <TabsTrigger value={DashboardViewMode.EXECUTIVE}>Executive</TabsTrigger>
            <TabsTrigger value={DashboardViewMode.PERFORMANCE}>Performance</TabsTrigger>
            <TabsTrigger value={DashboardViewMode.BUILDER}>Builder</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setShowTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </div>
        </div>
      </Tabs>
    </motion.div>
  );

  /**
   * Render dashboard content based on view mode
   */
  const renderDashboardContent = () => {
    const contentProps = {
      currentDashboard: state.currentDashboard,
      systemHealth: state.systemHealth,
      crossGroupMetrics: state.crossGroupMetrics,
      predictiveInsights: state.predictiveInsights,
      performanceMetrics: state.performanceMetrics,
      isLoading: state.isLoading,
      onRefresh: refreshDashboardData,
      onWidgetSelect: handleWidgetSelect,
      onWidgetUpdate: (widgetId: UUID, updates: Partial<DashboardWidget>) => {
        if (!state.currentDashboard) return;
        
        setState(prev => ({
          ...prev,
          currentDashboard: {
            ...prev.currentDashboard!,
            widgets: prev.currentDashboard!.widgets.map(w =>
              w.id === widgetId ? { ...w, ...updates } : w
            )
          },
          unsavedChanges: true
        }));
      }
    };

    return (
      <motion.div 
        className="flex-1 overflow-hidden"
        variants={animationVariants.fadeIn}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="wait">
          {state.viewMode === DashboardViewMode.OVERVIEW && (
            <motion.div key="overview" {...animationVariants.slideIn}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                <div className="lg:col-span-2">
                  <CrossGroupKPIDashboard {...contentProps} />
                </div>
                <div className="space-y-6">
                  <RealTimeMetricsEngine {...contentProps} />
                  <AlertingAndNotificationCenter 
                    {...contentProps} 
                    alertsActive={state.alertsActive}
                    onToggleAlerts={(active) => setState(prev => ({ ...prev, alertsActive: active }))}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {state.viewMode === DashboardViewMode.KPI && (
            <motion.div key="kpi" {...animationVariants.slideIn}>
              <CrossGroupKPIDashboard {...contentProps} />
            </motion.div>
          )}

          {state.viewMode === DashboardViewMode.REAL_TIME && (
            <motion.div key="realtime" {...animationVariants.slideIn}>
              <RealTimeMetricsEngine {...contentProps} />
            </motion.div>
          )}

          {state.viewMode === DashboardViewMode.PREDICTIVE && (
            <motion.div key="predictive" {...animationVariants.slideIn}>
              <PredictiveAnalyticsDashboard {...contentProps} />
            </motion.div>
          )}

          {state.viewMode === DashboardViewMode.CUSTOM && (
            <motion.div key="custom" {...animationVariants.slideIn}>
              <CustomDashboardBuilder 
                {...contentProps}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                selectedWidgets={state.selectedWidgets}
                draggedWidget={state.draggedWidget}
              />
            </motion.div>
          )}

          {state.viewMode === DashboardViewMode.EXECUTIVE && (
            <motion.div key="executive" {...animationVariants.slideIn}>
              <ExecutiveReportingDashboard {...contentProps} />
            </motion.div>
          )}

          {state.viewMode === DashboardViewMode.PERFORMANCE && (
            <motion.div key="performance" {...animationVariants.slideIn}>
              <PerformanceMonitoringDashboard {...contentProps} />
            </motion.div>
          )}

          {state.viewMode === DashboardViewMode.BUILDER && (
            <motion.div key="builder" {...animationVariants.slideIn}>
              <CustomDashboardBuilder 
                {...contentProps}
                builderMode={true}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                selectedWidgets={state.selectedWidgets}
                draggedWidget={state.draggedWidget}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  /**
   * Render dashboard sidebar
   */
  const renderDashboardSidebar = () => (
    <motion.div 
      className="w-80 bg-white dark:bg-gray-800 border-r flex flex-col"
      variants={animationVariants.slideIn}
      initial="initial"
      animate="animate"
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Dashboards
          </h3>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredDashboards.map((dashboard) => (
            <motion.div
              key={dashboard.id}
              variants={animationVariants.scaleIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ContextMenu>
                <ContextMenuTrigger>
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      state.currentDashboard?.id === dashboard.id && "ring-2 ring-blue-500"
                    )}
                    onClick={() => selectDashboard(dashboard.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm">{dashboard.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {dashboard.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {dashboard.widgets.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Updated {formatDate(dashboard.updatedAt)}</span>
                        <div className="flex items-center space-x-1">
                          {dashboard.isPublic && <Eye className="h-3 w-3" />}
                          {dashboard.tags.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {dashboard.tags[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => selectDashboard(dashboard.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {
                    // Handle edit
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {
                    // Handle duplicate
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );

  // Main render
  return (
    <TooltipProvider>
      <motion.div 
        ref={dashboardContainerRef}
        className={cn(
          "flex flex-col h-screen bg-gray-50 dark:bg-gray-900",
          state.isFullscreen && "fixed inset-0 z-50"
        )}
        variants={animationVariants.fadeIn}
        initial="initial"
        animate="animate"
      >
        {renderDashboardHeader()}
        {renderDashboardNavigation()}
        
        <div className="flex flex-1 overflow-hidden">
          {!state.isFullscreen && renderDashboardSidebar()}
          {renderDashboardContent()}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              className="fixed bottom-4 right-4 z-50"
              variants={animationVariants.slideIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, error: null }))}
                  className="ml-auto"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
              <DialogDescription>
                Choose a template to get started or create a blank dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => {
                  createNewDashboard();
                  setShowTemplateDialog(false);
                }}
              >
                <Layout className="h-6 w-6 mb-2" />
                Blank
              </Button>
              {Object.entries(DASHBOARD_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => {
                    createNewDashboard(key);
                    setShowTemplateDialog(false);
                  }}
                >
                  <Grid className="h-6 w-6 mb-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Dashboard</DialogTitle>
              <DialogDescription>
                Choose the format to export your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  handleExportDashboard('json');
                  setShowExportDialog(false);
                }}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleExportDashboard('pdf');
                  setShowExportDialog(false);
                }}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleExportDashboard('png');
                  setShowExportDialog(false);
                }}
              >
                PNG
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Insights Panel */}
        <AnimatePresence>
          {showAIInsights && (
            <motion.div
              className="fixed right-4 top-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-40"
              variants={animationVariants.slideIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">AI Insights</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIInsights(false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-96">
                <div className="p-4 space-y-3">
                  {state.predictiveInsights.map((insight, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{insight.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {insight.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-2">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance Panel */}
        <AnimatePresence>
          {showPerformancePanel && (
            <motion.div
              className="fixed bottom-4 left-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-40"
              variants={animationVariants.slideIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <DashboardPersonalizationEngine
                performanceMetrics={state.performanceMetrics}
                systemHealth={state.systemHealth}
                onClose={() => setShowPerformancePanel(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};

export default IntelligentDashboardOrchestrator;
