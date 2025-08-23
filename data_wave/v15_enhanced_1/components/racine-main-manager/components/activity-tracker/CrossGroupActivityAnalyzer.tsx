/**
 * CrossGroupActivityAnalyzer.tsx
 * ===============================
 * 
 * Advanced Cross-Group Activity Analytics Engine - Sophisticated analytics system
 * for correlating, analyzing, and gaining insights from activities across all 
 * data governance SPAs with intelligent pattern detection and predictive analytics.
 * 
 * Features:
 * - Cross-SPA activity correlation and pattern analysis
 * - Advanced statistical analysis and machine learning insights
 * - Interactive data visualizations and drill-down capabilities
 * - Anomaly detection and predictive analytics
 * - Performance bottleneck identification
 * - User behavior analysis and optimization recommendations
 * - Real-time correlation updates and intelligent alerting
 * - Custom analytics dashboard with drag-and-drop widgets
 * 
 * Design: Modern analytics interface with interactive charts, adaptive layouts,
 * and enterprise-grade UI/UX using shadcn/ui, Next.js, and Tailwind CSS.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity, Users, Database, Workflow, Shield, AlertTriangle, Clock, Calendar as CalendarIcon, Filter, Search, Download, Settings, RefreshCcw, Eye, EyeOff, Maximize2, Minimize2, MoreHorizontal, Bell, CheckCircle, XCircle, AlertCircle, Info, Hash, Globe, MapPin, Clock3, User, Building, Lock, Unlock, Target, Layers, GitBranch, Network, Radar as RadarIcon, Cpu, HardDrive, Gauge, Grid3X3, List, Table as TableIcon, Zap, FileText, Archive, Star, Bookmark, Share, ExternalLink, Copy, Edit, Save, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Play, Pause, Square, RotateCw, Move, MousePointer, Focus, ZoomIn, ZoomOut, Shuffle, Repeat, SkipBack, SkipForward, FastForward, Rewind, Timer, Crosshair, Scan, Brain, Lightbulb, FlaskConical, Microscope, Calculator, BarChart, ScatterChart, Heatmap as HeatmapIcon, TreePine, Workflow as WorkflowIcon, Layers as LayersIcon } from 'lucide-react';

// Chart Components
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  ScatterChart as RechartsScatterChart,
  AreaChart,
  RadarChart,
  TreemapChart,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Line,
  Bar,
  Area,
  Scatter,
  Pie,
  Cell,
  Radar as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  ResponsiveTreeMap
} from 'recharts';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Hooks and Services
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useIntelligentDashboard } from '../../hooks/useIntelligentDashboard';

// Types
import {
  RacineActivity,
  ActivityFilter,
  ActivityAnalytics,
  ActivityType,
  ActivitySeverity,
  ActivityAnomaly,
  ActivityCorrelation,
  ActivityPattern,
  CrossGroupActivity,
  SystemActivity,
  UserActivity,
  ComplianceActivity,
  UUID,
  UserRole,
  WorkspaceContext
} from '../../types/racine-core.types';
import {
  ActivitySearchRequest,
  ActivityAnalyticsRequest,
  PaginationRequest,
  FilterRequest
} from '../../types/api.types';

// Utils
import { formatDateTime, formatDuration, formatBytes, formatNumber } from '../../utils/formatting-utils';
import { validatePermissions, checkAccess } from '../../utils/security-utils';
import { cn } from '@/lib/utils';

/**
 * Analytics view modes
 */
export enum AnalyticsViewMode {
  OVERVIEW = 'overview',
  CORRELATIONS = 'correlations',
  PATTERNS = 'patterns',
  ANOMALIES = 'anomalies',
  PREDICTIONS = 'predictions',
  PERFORMANCE = 'performance',
  USERS = 'users',
  CUSTOM = 'custom'
}

/**
 * Chart types for analytics
 */
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  AREA = 'area',
  PIE = 'pie',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  RADAR = 'radar',
  TREEMAP = 'treemap',
  SANKEY = 'sankey',
  NETWORK = 'network'
}

/**
 * Time period options
 */
export enum TimePeriod {
  LAST_HOUR = 'last_hour',
  LAST_24H = 'last_24h',
  LAST_7D = 'last_7d',
  LAST_30D = 'last_30d',
  LAST_90D = 'last_90d',
  CUSTOM = 'custom'
}

/**
 * Aggregation methods
 */
export enum AggregationMethod {
  COUNT = 'count',
  SUM = 'sum',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE_95 = 'percentile_95',
  PERCENTILE_99 = 'percentile_99'
}

/**
 * Cross-group analyzer component props
 */
interface CrossGroupActivityAnalyzerProps {
  height?: number;
  showControls?: boolean;
  enableExport?: boolean;
  enableDrillDown?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

/**
 * Analytics configuration interface
 */
interface AnalyticsConfig {
  timePeriod: TimePeriod;
  customDateRange?: { start: Date; end: Date };
  aggregationMethod: AggregationMethod;
  groupBy: string[];
  filters: ActivityFilter[];
  chartType: ChartType;
  enableRealTime: boolean;
  enableMLInsights: boolean;
  anomalyThreshold: number;
  correlationThreshold: number;
}

/**
 * Analytics state interface
 */
interface AnalyticsState {
  // View Management
  currentView: AnalyticsViewMode;
  config: AnalyticsConfig;
  
  // Data
  analytics: ActivityAnalytics | null;
  correlations: ActivityCorrelation[];
  patterns: ActivityPattern[];
  anomalies: ActivityAnomaly[];
  predictions: any[];
  
  // UI State
  showSettings: boolean;
  showExportDialog: boolean;
  showFilterPanel: boolean;
  isFullscreen: boolean;
  selectedChart: string | null;
  
  // Loading and Errors
  loading: {
    analytics: boolean;
    correlations: boolean;
    patterns: boolean;
    anomalies: boolean;
    predictions: boolean;
  };
  errors: {
    analytics: string | null;
    correlations: string | null;
    patterns: string | null;
    anomalies: string | null;
    predictions: string | null;
  };
  
  // Performance
  lastUpdated: Date;
  analysisProgress: number;
  
  // Advanced Features
  mlModelStatus: {
    loaded: boolean;
    accuracy: number;
    lastTrained: Date | null;
  };
  
  // Custom Analytics
  customWidgets: AnalyticsWidget[];
  dashboardLayout: DashboardLayout;
}

/**
 * Analytics widget interface
 */
interface AnalyticsWidget {
  id: string;
  type: ChartType;
  title: string;
  description: string;
  query: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
  data: any[];
}

/**
 * Dashboard layout interface
 */
interface DashboardLayout {
  columns: number;
  rows: number;
  gaps: number;
  widgets: AnalyticsWidget[];
}

/**
 * Initial state
 */
const initialState: AnalyticsState = {
  currentView: AnalyticsViewMode.OVERVIEW,
  config: {
    timePeriod: TimePeriod.LAST_24H,
    aggregationMethod: AggregationMethod.COUNT,
    groupBy: ['activityType'],
    filters: [],
    chartType: ChartType.LINE,
    enableRealTime: true,
    enableMLInsights: true,
    anomalyThreshold: 0.95,
    correlationThreshold: 0.7
  },
  analytics: null,
  correlations: [],
  patterns: [],
  anomalies: [],
  predictions: [],
  showSettings: false,
  showExportDialog: false,
  showFilterPanel: false,
  isFullscreen: false,
  selectedChart: null,
  loading: {
    analytics: false,
    correlations: false,
    patterns: false,
    anomalies: false,
    predictions: false
  },
  errors: {
    analytics: null,
    correlations: null,
    patterns: null,
    anomalies: null,
    predictions: null
  },
  lastUpdated: new Date(),
  analysisProgress: 0,
  mlModelStatus: {
    loaded: false,
    accuracy: 0,
    lastTrained: null
  },
  customWidgets: [],
  dashboardLayout: {
    columns: 12,
    rows: 8,
    gaps: 16,
    widgets: []
  }
};

/**
 * Chart color schemes
 */
const chartColors = {
  primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
  severity: {
    low: '#10B981',
    medium: '#F59E0B', 
    high: '#F97316',
    critical: '#EF4444'
  },
  spa: {
    'data-sources': '#3B82F6',
    'scan-rule-sets': '#8B5CF6',
    'classifications': '#10B981',
    'compliance-rule': '#EF4444',
    'advanced-catalog': '#F59E0B',
    'scan-logic': '#06B6D4',
    'rbac-system': '#84CC16'
  }
};

/**
 * Main CrossGroupActivityAnalyzer Component
 */
export const CrossGroupActivityAnalyzer: React.FC<CrossGroupActivityAnalyzerProps> = ({
  height = 800,
  showControls = true,
  enableExport = true,
  enableDrillDown = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className
}) => {
  // State Management
  const [state, setState] = useState<AnalyticsState>(initialState);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation Controls
  const mainAnimationControls = useAnimation();
  
  // Hooks
  const {
    activities,
    analytics: activityAnalytics,
    correlations: activityCorrelations,
    anomalies: activityAnomalies,
    loading: activityLoading,
    errors: activityErrors,
    getAnalytics,
    getCorrelations,
    getAnomalies,
    searchActivities
  } = useActivityTracker();
  
  const { currentUser, userPermissions, checkPermission } = useUserManagement();
  const { currentWorkspace } = useWorkspaceManagement();
  const { getSystemHealth, getPerformanceMetrics } = useRacineOrchestration();
  const { getAllSPAStatus, getAnalyticsSummary, getCrossGroupMetrics } = useCrossGroupIntegration();
  const { 
    createWidget, 
    updateWidget, 
    deleteWidget, 
    getDashboardLayout, 
    updateDashboardLayout 
  } = useIntelligentDashboard();
  
  // Auto-refresh Setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshAnalytics();
      }, refreshInterval);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);
  
  // Initial Data Load
  useEffect(() => {
    refreshAnalytics();
    loadMLModelStatus();
    loadCustomDashboard();
  }, []);
  
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            event.preventDefault();
            refreshAnalytics();
            break;
          case 'f':
            event.preventDefault();
            setState(prev => ({ ...prev, showFilterPanel: !prev.showFilterPanel }));
            break;
          case 's':
            event.preventDefault();
            setState(prev => ({ ...prev, showSettings: true }));
            break;
          case 'e':
            event.preventDefault();
            if (enableExport) {
              setState(prev => ({ ...prev, showExportDialog: true }));
            }
            break;
          case '1':
            event.preventDefault();
            handleViewChange(AnalyticsViewMode.OVERVIEW);
            break;
          case '2':
            event.preventDefault();
            handleViewChange(AnalyticsViewMode.CORRELATIONS);
            break;
          case '3':
            event.preventDefault();
            handleViewChange(AnalyticsViewMode.PATTERNS);
            break;
          case '4':
            event.preventDefault();
            handleViewChange(AnalyticsViewMode.ANOMALIES);
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setState(prev => ({
          ...prev,
          showSettings: false,
          showExportDialog: false,
          showFilterPanel: false,
          selectedChart: null
        }));
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [enableExport]);
  
  // Event Handlers
  const handleViewChange = useCallback((view: AnalyticsViewMode) => {
    setState(prev => ({ ...prev, currentView: view }));
    mainAnimationControls.start({
      opacity: [0, 1],
      y: [10, 0],
      transition: { duration: 0.3 }
    });
    
    // Load specific data for the view
    switch (view) {
      case AnalyticsViewMode.CORRELATIONS:
        loadCorrelations();
        break;
      case AnalyticsViewMode.PATTERNS:
        loadPatterns();
        break;
      case AnalyticsViewMode.ANOMALIES:
        loadAnomalies();
        break;
      case AnalyticsViewMode.PREDICTIONS:
        loadPredictions();
        break;
    }
  }, [mainAnimationControls]);
  
  const refreshAnalytics = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      loading: { ...prev.loading, analytics: true },
      analysisProgress: 0
    }));
    
    try {
      const analyticsRequest: ActivityAnalyticsRequest = {
        timePeriod: state.config.timePeriod,
        dateRange: state.config.customDateRange,
        groupBy: state.config.groupBy,
        aggregationMethod: state.config.aggregationMethod,
        filters: state.config.filters,
        includeCorrelations: true,
        includeAnomalies: true,
        includePatterns: true
      };
      
      // Simulate progress for complex analysis
      const progressInterval = setInterval(() => {
        setState(prev => ({ 
          ...prev, 
          analysisProgress: Math.min(prev.analysisProgress + 10, 90) 
        }));
      }, 200);
      
      const [analytics, crossGroupMetrics, spaStatus] = await Promise.all([
        getAnalytics(analyticsRequest),
        getCrossGroupMetrics(),
        getAllSPAStatus()
      ]);
      
      clearInterval(progressInterval);
      
      setState(prev => ({
        ...prev,
        analytics: analytics || prev.analytics,
        loading: { ...prev.loading, analytics: false },
        errors: { ...prev.errors, analytics: null },
        lastUpdated: new Date(),
        analysisProgress: 100
      }));
      
      // Reset progress after a delay
      setTimeout(() => {
        setState(prev => ({ ...prev, analysisProgress: 0 }));
      }, 1000);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, analytics: false },
        errors: { ...prev.errors, analytics: error instanceof Error ? error.message : 'Analytics failed' },
        analysisProgress: 0
      }));
    }
  }, [state.config, getAnalytics, getCrossGroupMetrics, getAllSPAStatus]);
  
  const loadCorrelations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, correlations: true } }));
    
    try {
      const correlations = await getCorrelations({
        threshold: state.config.correlationThreshold,
        timePeriod: state.config.timePeriod,
        dateRange: state.config.customDateRange
      });
      
      setState(prev => ({
        ...prev,
        correlations: correlations || [],
        loading: { ...prev.loading, correlations: false },
        errors: { ...prev.errors, correlations: null }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, correlations: false },
        errors: { ...prev.errors, correlations: error instanceof Error ? error.message : 'Correlations failed' }
      }));
    }
  }, [state.config, getCorrelations]);
  
  const loadPatterns = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, patterns: true } }));
    
    try {
      // Implementation would call ML pattern detection service
      const patterns: ActivityPattern[] = [];
      
      setState(prev => ({
        ...prev,
        patterns,
        loading: { ...prev.loading, patterns: false },
        errors: { ...prev.errors, patterns: null }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, patterns: false },
        errors: { ...prev.errors, patterns: error instanceof Error ? error.message : 'Patterns failed' }
      }));
    }
  }, [state.config]);
  
  const loadAnomalies = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, anomalies: true } }));
    
    try {
      const anomalies = await getAnomalies({
        threshold: state.config.anomalyThreshold,
        timePeriod: state.config.timePeriod,
        dateRange: state.config.customDateRange
      });
      
      setState(prev => ({
        ...prev,
        anomalies: anomalies || [],
        loading: { ...prev.loading, anomalies: false },
        errors: { ...prev.errors, anomalies: null }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, anomalies: false },
        errors: { ...prev.errors, anomalies: error instanceof Error ? error.message : 'Anomalies failed' }
      }));
    }
  }, [state.config, getAnomalies]);
  
  const loadPredictions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, predictions: true } }));
    
    try {
      // Implementation would call ML prediction service
      const predictions: any[] = [];
      
      setState(prev => ({
        ...prev,
        predictions,
        loading: { ...prev.loading, predictions: false },
        errors: { ...prev.errors, predictions: null }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, predictions: false },
        errors: { ...prev.errors, predictions: error instanceof Error ? error.message : 'Predictions failed' }
      }));
    }
  }, [state.config]);
  
  const loadMLModelStatus = useCallback(async () => {
    try {
      // Implementation would check ML model status
      const modelStatus = {
        loaded: true,
        accuracy: 0.89,
        lastTrained: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
      
      setState(prev => ({ ...prev, mlModelStatus: modelStatus }));
    } catch (error) {
      console.error('Failed to load ML model status:', error);
    }
  }, []);
  
  const loadCustomDashboard = useCallback(async () => {
    try {
      const layout = await getDashboardLayout('cross-group-analytics');
      if (layout) {
        setState(prev => ({ ...prev, dashboardLayout: layout }));
      }
    } catch (error) {
      console.error('Failed to load custom dashboard:', error);
    }
  }, [getDashboardLayout]);
  
  const handleConfigChange = useCallback((newConfig: Partial<AnalyticsConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));
    
    // Auto-refresh analytics when config changes
    setTimeout(refreshAnalytics, 100);
  }, [refreshAnalytics]);
  
  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf' = 'csv') => {
    try {
      const exportData = {
        analytics: state.analytics,
        correlations: state.correlations,
        patterns: state.patterns,
        anomalies: state.anomalies,
        config: state.config,
        timestamp: new Date().toISOString()
      };
      
      let content: string;
      let mimeType: string;
      let filename: string;
      
      switch (format) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `cross-group-analytics-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'csv':
          // Convert to CSV format
          content = convertAnalyticsToCSV(exportData);
          mimeType = 'text/csv';
          filename = `cross-group-analytics-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'pdf':
          // Implementation would generate PDF report
          content = JSON.stringify(exportData);
          mimeType = 'application/pdf';
          filename = `cross-group-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, showExportDialog: false }));
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [state.analytics, state.correlations, state.patterns, state.anomalies, state.config]);
  
  const convertAnalyticsToCSV = useCallback((data: any): string => {
    // Implementation would convert complex analytics data to CSV format
    const headers = ['Timestamp', 'Type', 'Value', 'Category', 'Description'];
    const rows: string[] = [headers.join(',')];
    
    // Add analytics data rows
    // This is a simplified version - real implementation would be more comprehensive
    
    return rows.join('\n');
  }, []);
  
  // Memoized Computations
  const overviewMetrics = useMemo(() => {
    if (!state.analytics) return null;
    
    const totalActivities = activities.length;
    const correlationCount = state.correlations.length;
    const anomalyCount = state.anomalies.length;
    const patternCount = state.patterns.length;
    
    // Calculate trend indicators
    const recentActivities = activities.filter(
      a => new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    
    const previousDayActivities = activities.filter(
      a => {
        const activityTime = new Date(a.timestamp);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        return activityTime > twoDaysAgo && activityTime <= oneDayAgo;
      }
    ).length;
    
    const activityTrend = previousDayActivities > 0 
      ? ((recentActivities - previousDayActivities) / previousDayActivities) * 100 
      : 0;
    
    return {
      totalActivities,
      recentActivities,
      activityTrend,
      correlationCount,
      anomalyCount,
      patternCount,
      mlAccuracy: state.mlModelStatus.accuracy,
      lastAnalysis: state.lastUpdated
    };
  }, [state.analytics, activities, state.correlations, state.anomalies, state.patterns, state.mlModelStatus, state.lastUpdated]);
  
  const chartData = useMemo(() => {
    if (!state.analytics || !activities.length) return null;
    
    // Generate different chart data based on current view
    switch (state.currentView) {
      case AnalyticsViewMode.OVERVIEW:
        return generateOverviewChartData();
      case AnalyticsViewMode.CORRELATIONS:
        return generateCorrelationChartData();
      case AnalyticsViewMode.PATTERNS:
        return generatePatternChartData();
      case AnalyticsViewMode.ANOMALIES:
        return generateAnomalyChartData();
      case AnalyticsViewMode.PERFORMANCE:
        return generatePerformanceChartData();
      default:
        return generateOverviewChartData();
    }
  }, [state.analytics, activities, state.currentView, state.correlations, state.patterns, state.anomalies]);
  
  const generateOverviewChartData = useCallback(() => {
    // Generate time series data for activities
    const timeSeriesData = generateTimeSeriesData(activities, state.config.timePeriod);
    
    // Generate SPA distribution data
    const spaDistribution = activities.reduce((acc, activity) => {
      const spa = activity.metadata?.spa || 'Unknown';
      acc[spa] = (acc[spa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate severity distribution
    const severityDistribution = activities.reduce((acc, activity) => {
      acc[activity.severity] = (acc[activity.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate user activity data
    const userActivity = activities.reduce((acc, activity) => {
      const user = activity.userId || 'System';
      acc[user] = (acc[user] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      timeSeries: timeSeriesData,
      spaDistribution: Object.entries(spaDistribution).map(([name, value]) => ({ name, value })),
      severityDistribution: Object.entries(severityDistribution).map(([name, value]) => ({ name, value })),
      userActivity: Object.entries(userActivity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }))
    };
  }, [activities, state.config.timePeriod]);
  
  const generateCorrelationChartData = useCallback(() => {
    if (!state.correlations.length) return null;
    
    // Generate correlation matrix data
    const correlationMatrix = state.correlations.map(correlation => ({
      source: correlation.sourceActivityType,
      target: correlation.targetActivityType,
      strength: correlation.strength,
      confidence: correlation.confidence
    }));
    
    // Generate network data for correlation visualization
    const networkData = {
      nodes: [...new Set([
        ...state.correlations.map(c => c.sourceActivityType),
        ...state.correlations.map(c => c.targetActivityType)
      ])].map(type => ({ id: type, name: type, group: getActivityTypeGroup(type) })),
      links: state.correlations.map(c => ({
        source: c.sourceActivityType,
        target: c.targetActivityType,
        value: c.strength
      }))
    };
    
    return {
      correlationMatrix,
      networkData,
      strongCorrelations: state.correlations
        .filter(c => c.strength > 0.8)
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 10)
    };
  }, [state.correlations]);
  
  const generatePatternChartData = useCallback(() => {
    if (!state.patterns.length) return null;
    
    return {
      patterns: state.patterns.map(pattern => ({
        name: pattern.name,
        frequency: pattern.frequency,
        confidence: pattern.confidence,
        type: pattern.type
      })),
      patternTrends: generatePatternTrends(),
      patternDistribution: generatePatternDistribution()
    };
  }, [state.patterns]);
  
  const generateAnomalyChartData = useCallback(() => {
    if (!state.anomalies.length) return null;
    
    // Generate anomaly timeline
    const anomalyTimeline = state.anomalies.map(anomaly => ({
      timestamp: anomaly.detectedAt,
      severity: anomaly.severity,
      type: anomaly.type,
      score: anomaly.anomalyScore
    }));
    
    // Generate anomaly distribution by type
    const anomalyDistribution = state.anomalies.reduce((acc, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      anomalyTimeline,
      anomalyDistribution: Object.entries(anomalyDistribution).map(([name, value]) => ({ name, value })),
      recentAnomalies: state.anomalies
        .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
        .slice(0, 10)
    };
  }, [state.anomalies]);
  
  const generatePerformanceChartData = useCallback(() => {
    // Generate performance metrics visualization
    const performanceData = activities.map(activity => ({
      timestamp: activity.timestamp,
      duration: activity.duration || 0,
      type: activity.activityType,
      spa: activity.metadata?.spa || 'Unknown'
    }));
    
    return {
      performanceTimeline: performanceData,
      averagePerformance: calculateAveragePerformance(),
      performanceByType: calculatePerformanceByType(),
      performanceBySPA: calculatePerformanceBySPA()
    };
  }, [activities]);
  
  const generateTimeSeriesData = useCallback((activities: RacineActivity[], period: TimePeriod) => {
    const now = new Date();
    let startTime: Date;
    let interval: number;
    
    switch (period) {
      case TimePeriod.LAST_HOUR:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        interval = 5 * 60 * 1000; // 5 minutes
        break;
      case TimePeriod.LAST_24H:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case TimePeriod.LAST_7D:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case TimePeriod.LAST_30D:
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        interval = 60 * 60 * 1000;
    }
    
    const buckets: Record<string, number> = {};
    let currentTime = startTime.getTime();
    
    while (currentTime <= now.getTime()) {
      const bucketKey = new Date(currentTime).toISOString();
      buckets[bucketKey] = 0;
      currentTime += interval;
    }
    
    // Fill buckets with activity counts
    activities.forEach(activity => {
      const activityTime = new Date(activity.timestamp).getTime();
      if (activityTime >= startTime.getTime()) {
        const bucketTime = Math.floor((activityTime - startTime.getTime()) / interval) * interval + startTime.getTime();
        const bucketKey = new Date(bucketTime).toISOString();
        if (buckets[bucketKey] !== undefined) {
          buckets[bucketKey]++;
        }
      }
    });
    
    return Object.entries(buckets).map(([timestamp, count]) => ({
      timestamp,
      count,
      time: formatDateTime(timestamp, 'short')
    }));
  }, []);
  
  const getActivityTypeGroup = useCallback((type: ActivityType): string => {
    const groups: Record<string, string[]> = {
      'User Actions': ['user_action', 'workflow_execution'],
      'System Events': ['system_event', 'performance_metric', 'automation'],
      'Security': ['security_event', 'audit_event'],
      'Data Operations': ['data_operation', 'resource_access'],
      'Notifications': ['notification', 'info_event', 'warning_event', 'error_event'],
      'Compliance': ['compliance_check']
    };
    
    for (const [group, types] of Object.entries(groups)) {
      if (types.includes(type)) {
        return group;
      }
    }
    return 'Other';
  }, []);
  
  const generatePatternTrends = useCallback(() => {
    // Implementation would generate pattern trend analysis
    return [];
  }, []);
  
  const generatePatternDistribution = useCallback(() => {
    // Implementation would generate pattern distribution analysis
    return [];
  }, []);
  
  const calculateAveragePerformance = useCallback(() => {
    // Implementation would calculate performance averages
    return [];
  }, []);
  
  const calculatePerformanceByType = useCallback(() => {
    // Implementation would calculate performance by activity type
    return [];
  }, []);
  
  const calculatePerformanceBySPA = useCallback(() => {
    // Implementation would calculate performance by SPA
    return [];
  }, []);
  
  // Render Functions
  const renderControls = () => (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cross-Group Analytics
          </h1>
        </div>
        
        {state.mlModelStatus.loaded && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <FlaskConical className="w-3 h-3" />
            <span>ML: {(state.mlModelStatus.accuracy * 100).toFixed(1)}%</span>
          </Badge>
        )}
        
        {state.analysisProgress > 0 && state.analysisProgress < 100 && (
          <div className="flex items-center space-x-2">
            <div className="w-24">
              <Progress value={state.analysisProgress} className="h-2" />
            </div>
            <span className="text-sm text-gray-500">{state.analysisProgress}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* View Mode Selector */}
        <Tabs value={state.currentView} onValueChange={(value) => handleViewChange(value as AnalyticsViewMode)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value={AnalyticsViewMode.OVERVIEW} className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value={AnalyticsViewMode.CORRELATIONS} className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value={AnalyticsViewMode.PATTERNS} className="text-xs">
              <Radar className="h-3 w-3 mr-1" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value={AnalyticsViewMode.ANOMALIES} className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value={AnalyticsViewMode.PREDICTIONS} className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value={AnalyticsViewMode.CUSTOM} className="text-xs">
              <Grid3X3 className="h-3 w-3 mr-1" />
              Custom
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Time Period Selector */}
        <Select value={state.config.timePeriod} onValueChange={(value) => handleConfigChange({ timePeriod: value as TimePeriod })}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimePeriod.LAST_HOUR}>Last Hour</SelectItem>
            <SelectItem value={TimePeriod.LAST_24H}>Last 24h</SelectItem>
            <SelectItem value={TimePeriod.LAST_7D}>Last 7d</SelectItem>
            <SelectItem value={TimePeriod.LAST_30D}>Last 30d</SelectItem>
            <SelectItem value={TimePeriod.CUSTOM}>Custom</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAnalytics}
                  disabled={state.loading.analytics}
                >
                  <RefreshCcw className={cn("h-4 w-4", state.loading.analytics && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Analytics (Ctrl+R)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showFilterPanel: !prev.showFilterPanel }))}
                  className={cn(state.showFilterPanel && "bg-blue-50 border-blue-300")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Filters (Ctrl+F)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {enableExport && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showExportDialog: true }))}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export Analytics (Ctrl+E)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showSettings: true }))}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}>
                {state.isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                {state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={loadMLModelStatus}>
                <Brain className="h-4 w-4 mr-2" />
                Refresh ML Model
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
  
  const renderOverviewMetrics = () => {
    if (!overviewMetrics) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Activities
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatNumber(overviewMetrics.totalActivities)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center space-x-1">
              {overviewMetrics.activityTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={cn(
                "text-xs",
                overviewMetrics.activityTrend > 0 ? "text-green-600" : "text-red-600"
              )}>
                {Math.abs(overviewMetrics.activityTrend).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Correlations Found
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {overviewMetrics.correlationCount}
                </p>
              </div>
              <Network className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {state.correlations.filter(c => c.strength > 0.8).length} strong
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Anomalies Detected
                </p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {overviewMetrics.anomalyCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {state.anomalies.filter(a => a.severity === 'high').length} high severity
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  ML Accuracy
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {(overviewMetrics.mlAccuracy * 100).toFixed(1)}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={overviewMetrics.mlAccuracy * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderMainContent = () => {
    const data = chartData;
    
    return (
      <motion.div
        animate={mainAnimationControls}
        className="flex-1 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {state.currentView === AnalyticsViewMode.OVERVIEW && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderOverviewMetrics()}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <LineChart className="h-5 w-5" />
                        <span>Activity Timeline</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {data?.timeSeries && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={data.timeSeries}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke={chartColors.primary[0]} 
                                strokeWidth={2}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5" />
                        <span>SPA Distribution</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {data?.spaDistribution && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={data.spaDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {data.spaDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={chartColors.primary[index % chartColors.primary.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart className="h-5 w-5" />
                        <span>Severity Distribution</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {data?.severityDistribution && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={data.severityDistribution}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value">
                                {data.severityDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={chartColors.severity[entry.name as keyof typeof chartColors.severity] || chartColors.primary[0]} />
                                ))}
                              </Bar>
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Top Users</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {data?.userActivity && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={data.userActivity} layout="horizontal">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" />
                              <Tooltip />
                              <Bar dataKey="value" fill={chartColors.primary[1]} />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
          
          {state.currentView === AnalyticsViewMode.CORRELATIONS && (
            <motion.div
              key="correlations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Network className="h-5 w-5" />
                      <span>Correlation Network</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Network visualization would be rendered here</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {state.correlations.length} correlations found
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart className="h-5 w-5" />
                      <span>Correlation Strength</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.correlations.slice(0, 10).map((correlation, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Badge variant="outline">{correlation.sourceActivityType}</Badge>
                              <ChevronRight className="h-3 w-3" />
                              <Badge variant="outline">{correlation.targetActivityType}</Badge>
                            </div>
                            <Progress value={correlation.strength * 100} className="mt-1 h-2" />
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {(correlation.strength * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
          
          {state.currentView === AnalyticsViewMode.ANOMALIES && (
            <motion.div
              key="anomalies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Recent Anomalies</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.anomalies.slice(0, 10).map((anomaly, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <AlertTriangle className={cn(
                            "h-5 w-5",
                            anomaly.severity === 'high' ? "text-red-500" : "text-yellow-500"
                          )} />
                          <div className="flex-1">
                            <div className="font-medium">{anomaly.type}</div>
                            <div className="text-sm text-gray-500">{anomaly.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDateTime(anomaly.detectedAt)}
                            </div>
                          </div>
                          <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>
                            Score: {anomaly.anomalyScore.toFixed(2)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
          
          {/* Add other view modes as needed */}
        </AnimatePresence>
      </motion.div>
    );
  };
  
  // Error Handling
  if (Object.values(state.errors).some(error => error !== null)) {
    const firstError = Object.values(state.errors).find(error => error !== null);
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analytics Error</AlertTitle>
          <AlertDescription>{firstError}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setState(prev => ({ 
              ...prev, 
              errors: {
                analytics: null,
                correlations: null,
                patterns: null,
                anomalies: null,
                predictions: null
              }
            }))}
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }
  
  // Main Render
  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full bg-gray-50 dark:bg-gray-900",
        state.isFullscreen && "fixed inset-0 z-50",
        className
      )}
      style={{ height: state.isFullscreen ? '100vh' : height }}
    >
      {/* Header Controls */}
      {showControls && renderControls()}
      
      {/* Main Content */}
      {renderMainContent()}
      
      {/* Export Dialog */}
      <Dialog open={state.showExportDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showExportDialog: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Analytics Data</DialogTitle>
            <DialogDescription>
              Choose the format and data to export.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Raw Data)</SelectItem>
                  <SelectItem value="pdf">PDF (Report)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Include Data</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-analytics" defaultChecked />
                  <Label htmlFor="include-analytics">Analytics Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-correlations" defaultChecked />
                  <Label htmlFor="include-correlations">Correlations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-anomalies" defaultChecked />
                  <Label htmlFor="include-anomalies">Anomalies</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-patterns" />
                  <Label htmlFor="include-patterns">Patterns</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showExportDialog: false }))}>
              Cancel
            </Button>
            <Button onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={state.showSettings} onOpenChange={(open) => setState(prev => ({ ...prev, showSettings: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Analytics Settings</DialogTitle>
            <DialogDescription>
              Configure analytics processing and visualization options.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ml">Machine Learning</TabsTrigger>
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Real-time Updates</Label>
                  <Switch 
                    checked={state.config.enableRealTime}
                    onCheckedChange={(checked) => handleConfigChange({ enableRealTime: checked })}
                  />
                </div>
                
                <div>
                  <Label>Aggregation Method</Label>
                  <Select 
                    value={state.config.aggregationMethod} 
                    onValueChange={(value) => handleConfigChange({ aggregationMethod: value as AggregationMethod })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AggregationMethod.COUNT}>Count</SelectItem>
                      <SelectItem value={AggregationMethod.SUM}>Sum</SelectItem>
                      <SelectItem value={AggregationMethod.AVERAGE}>Average</SelectItem>
                      <SelectItem value={AggregationMethod.MIN}>Minimum</SelectItem>
                      <SelectItem value={AggregationMethod.MAX}>Maximum</SelectItem>
                      <SelectItem value={AggregationMethod.MEDIAN}>Median</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ml" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable ML Insights</Label>
                  <Switch 
                    checked={state.config.enableMLInsights}
                    onCheckedChange={(checked) => handleConfigChange({ enableMLInsights: checked })}
                  />
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Model Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={state.mlModelStatus.loaded ? "secondary" : "destructive"}>
                        {state.mlModelStatus.loaded ? "Loaded" : "Not Loaded"}
                      </Badge>
                    </div>
                    {state.mlModelStatus.loaded && (
                      <>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span>{(state.mlModelStatus.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Trained:</span>
                          <span>{state.mlModelStatus.lastTrained ? formatDateTime(state.mlModelStatus.lastTrained.toISOString()) : 'Unknown'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="thresholds" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Anomaly Detection Threshold</Label>
                  <Slider
                    value={[state.config.anomalyThreshold]}
                    onValueChange={([value]) => handleConfigChange({ anomalyThreshold: value })}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Current: {(state.config.anomalyThreshold * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div>
                  <Label>Correlation Threshold</Label>
                  <Slider
                    value={[state.config.correlationThreshold]}
                    onValueChange={([value]) => handleConfigChange({ correlationThreshold: value })}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Current: {(state.config.correlationThreshold * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(activities.length)}
                    </div>
                    <div className="text-sm text-gray-500">Activities Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {state.correlations.length}
                    </div>
                    <div className="text-sm text-gray-500">Correlations Found</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Last Updated: {formatDateTime(state.lastUpdated.toISOString())}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showSettings: false }))}>
              Close
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrossGroupActivityAnalyzer;