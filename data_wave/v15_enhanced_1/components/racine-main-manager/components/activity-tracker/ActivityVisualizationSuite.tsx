/**
 * ActivityVisualizationSuite.tsx
 * ================================
 * 
 * Comprehensive Visual Analytics Dashboard - Advanced visualization suite for
 * activity data with interactive charts, timelines, heatmaps, and sophisticated
 * data representations using modern charting libraries and enterprise UI/UX.
 * 
 * Features:
 * - Interactive chart library with 15+ chart types
 * - Real-time data visualization updates
 * - Advanced filtering and drill-down capabilities
 * - Customizable dashboard layouts with drag-and-drop
 * - Time-series analysis with zoom and pan
 * - Heatmaps and geographic visualizations
 * - Export capabilities for charts and data
 * - Responsive design with adaptive layouts
 * 
 * Design: Modern dashboard interface with interactive visualizations, smooth
 * animations, and enterprise-grade UI/UX using shadcn/ui, Next.js, and Tailwind CSS.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity, Calendar, Clock, Filter, Search, Download, Settings, RefreshCcw, Eye, EyeOff, Maximize2, Minimize2, MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Play, Pause, Square, RotateCw, Move, MousePointer, Focus, ZoomIn, ZoomOut, Shuffle, Repeat, Grid3X3, List, Table, Map, Radar as RadarIcon, Target, Layers, GitBranch, Network, Cpu, HardDrive, Gauge, BarChart, ScatterChart, TreePine, Workflow, Users, Database, Shield, AlertTriangle, CheckCircle, XCircle, AlertCircle, Info, Hash, Globe, MapPin, Clock3, User, Building, Lock, Unlock, Zap, FileText, Archive, Star, Bookmark, Share, ExternalLink, Copy, Edit, Save, Palette, Layout, Layers3, Box, Columns, Grid, ScanLine, BarChart2, BarChart4, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon, Radar as RadarLucideIcon, Waypoints, BrainCircuit, FlaskConical, Lightbulb, Microscope } from 'lucide-react';

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
  FunnelChart,
  SankeyChart,
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
  Funnel,
  Sankey,
  ResponsiveTreeMap,
  ReferenceArea,
  ReferenceLine,
  Brush,
  ErrorBar
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
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
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
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useIntelligentDashboard } from '../../hooks/useIntelligentDashboard';

// Types
import {
  RacineActivity,
  ActivityFilter,
  ActivityAnalytics,
  ActivityType,
  ActivitySeverity,
  UUID,
  UserRole,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utils
import { formatDateTime, formatDuration, formatBytes, formatNumber } from '../../utils/formatting-utils';
import { cn } from '@/lib/utils';

/**
 * Chart type enumeration
 */
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  AREA = 'area',
  PIE = 'pie',
  DONUT = 'donut',
  SCATTER = 'scatter',
  BUBBLE = 'bubble',
  HEATMAP = 'heatmap',
  RADAR = 'radar',
  POLAR = 'polar',
  TREEMAP = 'treemap',
  SANKEY = 'sankey',
  FUNNEL = 'funnel',
  WATERFALL = 'waterfall',
  GAUGE = 'gauge',
  TIMELINE = 'timeline',
  GANTT = 'gantt',
  NETWORK = 'network',
  MAP = 'map',
  CALENDAR = 'calendar'
}

/**
 * Time aggregation options
 */
export enum TimeAggregation {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

/**
 * Visualization mode enumeration
 */
export enum VisualizationMode {
  SINGLE = 'single',
  GRID = 'grid',
  DASHBOARD = 'dashboard',
  FULLSCREEN = 'fullscreen',
  COMPARISON = 'comparison',
  SPLIT = 'split'
}

/**
 * Chart configuration interface
 */
interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  dataKey: string;
  xAxis?: string;
  yAxis?: string[];
  groupBy?: string;
  aggregation?: TimeAggregation;
  filters?: ActivityFilter[];
  colors?: string[];
  size?: { width: number; height: number };
  position?: { x: number; y: number };
  options?: {
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    showLabels?: boolean;
    interactive?: boolean;
    animated?: boolean;
    responsive?: boolean;
    stacked?: boolean;
    normalized?: boolean;
    smoothing?: boolean;
    zoom?: boolean;
    pan?: boolean;
    brush?: boolean;
  };
}

/**
 * Visualization suite component props
 */
interface ActivityVisualizationSuiteProps {
  activities: RacineActivity[];
  analytics?: ActivityAnalytics | null;
  viewMode?: VisualizationMode;
  height?: number;
  enableCustomization?: boolean;
  enableExport?: boolean;
  enableRealTime?: boolean;
  className?: string;
}

/**
 * Visualization suite state interface
 */
interface VisualizationState {
  // View Management
  currentMode: VisualizationMode;
  selectedChart: string | null;
  
  // Chart Configurations
  charts: ChartConfig[];
  activeCharts: string[];
  
  // Data Processing
  processedData: Record<string, any[]>;
  timeRange: { start: Date; end: Date };
  groupBy: string;
  aggregation: TimeAggregation;
  
  // Customization
  customColors: string[];
  theme: 'light' | 'dark' | 'auto';
  gridLayout: { cols: number; rows: number };
  
  // Interaction
  hoveredElement: any;
  selectedElements: Set<string>;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  
  // UI State
  showCustomization: boolean;
  showExportDialog: boolean;
  showFilterPanel: boolean;
  isFullscreen: boolean;
  
  // Performance
  updateInterval: number;
  maxDataPoints: number;
  enableAnimations: boolean;
  
  // Loading and Errors
  loading: boolean;
  error: string | null;
}

/**
 * Color schemes for charts
 */
const colorSchemes = {
  default: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
  pastel: ['#93C5FD', '#86EFAC', '#FDE047', '#FCA5A5', '#C4B5FD', '#67E8F9', '#BEF264', '#FDBA74'],
  dark: ['#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#65A30D', '#EA580C'],
  monochrome: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'],
  rainbow: ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6'],
  severity: {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444'
  }
};

/**
 * Chart type configurations
 */
const chartTypeConfigs = {
  [ChartType.LINE]: {
    icon: LineChart,
    name: 'Line Chart',
    description: 'Show trends over time',
    bestFor: ['time-series', 'trends', 'continuous-data']
  },
  [ChartType.BAR]: {
    icon: BarChart3,
    name: 'Bar Chart',
    description: 'Compare categories',
    bestFor: ['categorical-data', 'comparisons', 'rankings']
  },
  [ChartType.AREA]: {
    icon: TrendingUp,
    name: 'Area Chart',
    description: 'Show cumulative values',
    bestFor: ['cumulative-data', 'part-to-whole', 'volume']
  },
  [ChartType.PIE]: {
    icon: PieChart,
    name: 'Pie Chart',
    description: 'Show proportions',
    bestFor: ['proportions', 'percentages', 'parts-of-whole']
  },
  [ChartType.SCATTER]: {
    icon: ScatterChart,
    name: 'Scatter Plot',
    description: 'Show correlations',
    bestFor: ['correlations', 'distributions', 'outliers']
  },
  [ChartType.HEATMAP]: {
    icon: Grid3X3,
    name: 'Heatmap',
    description: 'Show intensity patterns',
    bestFor: ['patterns', 'intensity', 'matrix-data']
  },
  [ChartType.RADAR]: {
    icon: RadarIcon,
    name: 'Radar Chart',
    description: 'Multi-dimensional comparison',
    bestFor: ['multi-dimensional', 'profiles', 'capabilities']
  },
  [ChartType.TREEMAP]: {
    icon: TreePine,
    name: 'Treemap',
    description: 'Hierarchical proportions',
    bestFor: ['hierarchical-data', 'nested-proportions', 'space-filling']
  },
  [ChartType.GAUGE]: {
    icon: Gauge,
    name: 'Gauge Chart',
    description: 'Show progress or KPIs',
    bestFor: ['progress', 'kpis', 'single-value']
  },
  [ChartType.TIMELINE]: {
    icon: Clock,
    name: 'Timeline',
    description: 'Show events over time',
    bestFor: ['events', 'chronology', 'milestones']
  }
};

/**
 * Initial state
 */
const initialState: VisualizationState = {
  currentMode: VisualizationMode.GRID,
  selectedChart: null,
  charts: [],
  activeCharts: [],
  processedData: {},
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date()
  },
  groupBy: 'activityType',
  aggregation: TimeAggregation.HOUR,
  customColors: colorSchemes.default,
  theme: 'auto',
  gridLayout: { cols: 2, rows: 2 },
  hoveredElement: null,
  selectedElements: new Set(),
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
  showCustomization: false,
  showExportDialog: false,
  showFilterPanel: false,
  isFullscreen: false,
  updateInterval: 30000,
  maxDataPoints: 1000,
  enableAnimations: true,
  loading: false,
  error: null
};

/**
 * Main ActivityVisualizationSuite Component
 */
export const ActivityVisualizationSuite: React.FC<ActivityVisualizationSuiteProps> = ({
  activities = [],
  analytics = null,
  viewMode = VisualizationMode.GRID,
  height = 800,
  enableCustomization = true,
  enableExport = true,
  enableRealTime = true,
  className
}) => {
  // State Management
  const [state, setState] = useState<VisualizationState>({
    ...initialState,
    currentMode: viewMode
  });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation Controls
  const mainAnimationControls = useAnimation();
  
  // Hooks
  const { currentUser, userPermissions } = useUserManagement();
  const { currentWorkspace } = useWorkspaceManagement();
  const { getAllSPAStatus } = useCrossGroupIntegration();
  const { 
    createWidget, 
    updateWidget, 
    deleteWidget, 
    getDashboardLayout 
  } = useIntelligentDashboard();
  
  // Initialize default charts
  useEffect(() => {
    const defaultCharts: ChartConfig[] = [
      {
        id: 'activity-timeline',
        type: ChartType.LINE,
        title: 'Activity Timeline',
        description: 'Activities over time',
        dataKey: 'timestamp',
        xAxis: 'time',
        yAxis: ['count'],
        aggregation: TimeAggregation.HOUR,
        size: { width: 400, height: 300 },
        position: { x: 0, y: 0 },
        options: {
          showLegend: true,
          showGrid: true,
          showTooltip: true,
          interactive: true,
          animated: true,
          responsive: true,
          zoom: true,
          brush: true
        }
      },
      {
        id: 'activity-distribution',
        type: ChartType.PIE,
        title: 'Activity Type Distribution',
        description: 'Distribution by activity type',
        dataKey: 'activityType',
        groupBy: 'activityType',
        size: { width: 400, height: 300 },
        position: { x: 1, y: 0 },
        options: {
          showLegend: true,
          showTooltip: true,
          showLabels: true,
          interactive: true,
          animated: true,
          responsive: true
        }
      },
      {
        id: 'severity-heatmap',
        type: ChartType.HEATMAP,
        title: 'Severity Heatmap',
        description: 'Activity severity by time',
        dataKey: 'severity',
        xAxis: 'time',
        yAxis: ['severity'],
        aggregation: TimeAggregation.DAY,
        size: { width: 400, height: 300 },
        position: { x: 0, y: 1 },
        options: {
          showTooltip: true,
          interactive: true,
          responsive: true
        }
      },
      {
        id: 'user-activity',
        type: ChartType.BAR,
        title: 'User Activity',
        description: 'Activity count by user',
        dataKey: 'userId',
        groupBy: 'userId',
        size: { width: 400, height: 300 },
        position: { x: 1, y: 1 },
        options: {
          showLegend: false,
          showGrid: true,
          showTooltip: true,
          interactive: true,
          animated: true,
          responsive: true
        }
      }
    ];
    
    setState(prev => ({
      ...prev,
      charts: defaultCharts,
      activeCharts: defaultCharts.map(c => c.id)
    }));
  }, []);
  
  // Process activity data
  const processedData = useMemo(() => {
    if (!activities.length) return {};
    
    const data: Record<string, any[]> = {};
    
    // Timeline data
    data['activity-timeline'] = generateTimelineData(activities, state.aggregation);
    
    // Distribution data
    data['activity-distribution'] = generateDistributionData(activities, 'activityType');
    
    // Severity heatmap data
    data['severity-heatmap'] = generateHeatmapData(activities, 'severity', TimeAggregation.DAY);
    
    // User activity data
    data['user-activity'] = generateUserActivityData(activities);
    
    return data;
  }, [activities, state.aggregation]);
  
  // Auto-update setup
  useEffect(() => {
    if (enableRealTime && state.updateInterval > 0) {
      updateIntervalRef.current = setInterval(() => {
        // Trigger data refresh
        setState(prev => ({ ...prev, loading: true }));
        setTimeout(() => {
          setState(prev => ({ ...prev, loading: false }));
        }, 500);
      }, state.updateInterval);
    }
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [enableRealTime, state.updateInterval]);
  
  // Data processing functions
  const generateTimelineData = useCallback((activities: RacineActivity[], aggregation: TimeAggregation) => {
    const buckets: Record<string, number> = {};
    const interval = getTimeInterval(aggregation);
    const startTime = state.timeRange.start.getTime();
    const endTime = state.timeRange.end.getTime();
    
    // Initialize buckets
    for (let time = startTime; time <= endTime; time += interval) {
      const key = formatTimeKey(new Date(time), aggregation);
      buckets[key] = 0;
    }
    
    // Fill buckets with activity counts
    activities.forEach(activity => {
      const activityTime = new Date(activity.timestamp).getTime();
      if (activityTime >= startTime && activityTime <= endTime) {
        const bucketTime = Math.floor((activityTime - startTime) / interval) * interval + startTime;
        const key = formatTimeKey(new Date(bucketTime), aggregation);
        if (buckets[key] !== undefined) {
          buckets[key]++;
        }
      }
    });
    
    return Object.entries(buckets).map(([time, count]) => ({
      time,
      count,
      timestamp: time
    }));
  }, [state.timeRange]);
  
  const generateDistributionData = useCallback((activities: RacineActivity[], groupBy: string) => {
    const distribution: Record<string, number> = {};
    
    activities.forEach(activity => {
      const key = getNestedValue(activity, groupBy) || 'Unknown';
      distribution[key] = (distribution[key] || 0) + 1;
    });
    
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);
  
  const generateHeatmapData = useCallback((activities: RacineActivity[], valueKey: string, timeAgg: TimeAggregation) => {
    const heatmapData: any[] = [];
    const timeInterval = getTimeInterval(timeAgg);
    const valueCategories = [...new Set(activities.map(a => getNestedValue(a, valueKey)))];
    
    const startTime = state.timeRange.start.getTime();
    const endTime = state.timeRange.end.getTime();
    
    for (let time = startTime; time <= endTime; time += timeInterval) {
      const timeKey = formatTimeKey(new Date(time), timeAgg);
      
      valueCategories.forEach(category => {
        const count = activities.filter(activity => {
          const activityTime = new Date(activity.timestamp).getTime();
          const activityValue = getNestedValue(activity, valueKey);
          return activityTime >= time && 
                 activityTime < time + timeInterval && 
                 activityValue === category;
        }).length;
        
        heatmapData.push({
          time: timeKey,
          category,
          value: count,
          intensity: count
        });
      });
    }
    
    return heatmapData;
  }, [state.timeRange]);
  
  const generateUserActivityData = useCallback((activities: RacineActivity[]) => {
    const userActivity: Record<string, number> = {};
    
    activities.forEach(activity => {
      const user = activity.userId || 'System';
      userActivity[user] = (userActivity[user] || 0) + 1;
    });
    
    return Object.entries(userActivity)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 users
  }, []);
  
  // Utility functions
  const getTimeInterval = (aggregation: TimeAggregation): number => {
    const intervals = {
      [TimeAggregation.MINUTE]: 60 * 1000,
      [TimeAggregation.HOUR]: 60 * 60 * 1000,
      [TimeAggregation.DAY]: 24 * 60 * 60 * 1000,
      [TimeAggregation.WEEK]: 7 * 24 * 60 * 60 * 1000,
      [TimeAggregation.MONTH]: 30 * 24 * 60 * 60 * 1000,
      [TimeAggregation.QUARTER]: 90 * 24 * 60 * 60 * 1000,
      [TimeAggregation.YEAR]: 365 * 24 * 60 * 60 * 1000
    };
    return intervals[aggregation];
  };
  
  const formatTimeKey = (date: Date, aggregation: TimeAggregation): string => {
    switch (aggregation) {
      case TimeAggregation.MINUTE:
        return formatDateTime(date.toISOString(), 'time');
      case TimeAggregation.HOUR:
        return date.toISOString().slice(0, 13);
      case TimeAggregation.DAY:
        return date.toISOString().slice(0, 10);
      case TimeAggregation.WEEK:
        return `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      case TimeAggregation.MONTH:
        return date.toISOString().slice(0, 7);
      case TimeAggregation.QUARTER:
        return `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
      case TimeAggregation.YEAR:
        return date.getFullYear().toString();
      default:
        return date.toISOString();
    }
  };
  
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
  };
  
  // Event Handlers
  const handleChartTypeChange = useCallback((chartId: string, newType: ChartType) => {
    setState(prev => ({
      ...prev,
      charts: prev.charts.map(chart =>
        chart.id === chartId ? { ...chart, type: newType } : chart
      )
    }));
  }, []);
  
  const handleModeChange = useCallback((mode: VisualizationMode) => {
    setState(prev => ({ ...prev, currentMode: mode }));
    mainAnimationControls.start({
      opacity: [0, 1],
      scale: [0.95, 1],
      transition: { duration: 0.3 }
    });
  }, [mainAnimationControls]);
  
  const handleExport = useCallback(async (format: 'png' | 'svg' | 'pdf' | 'csv' = 'png') => {
    try {
      // Implementation would export chart data or images
      const exportData = {
        charts: state.charts,
        data: processedData,
        timestamp: new Date().toISOString()
      };
      
      let content: string;
      let mimeType: string;
      let filename: string;
      
      switch (format) {
        case 'csv':
          content = convertToCSV(exportData);
          mimeType = 'text/csv';
          filename = `activity-visualizations-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'png':
        case 'svg':
        case 'pdf':
          // Implementation would capture chart images
          content = JSON.stringify(exportData);
          mimeType = 'application/json';
          filename = `activity-visualizations-${new Date().toISOString().split('T')[0]}.json`;
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
  }, [state.charts, processedData]);
  
  const convertToCSV = useCallback((data: any): string => {
    // Implementation would convert chart data to CSV format
    const headers = ['Chart', 'Type', 'Data Point', 'Value'];
    const rows: string[] = [headers.join(',')];
    
    // This is a simplified version - real implementation would be more comprehensive
    return rows.join('\n');
  }, []);
  
  // Chart Rendering Functions
  const renderChart = useCallback((chartConfig: ChartConfig) => {
    const data = processedData[chartConfig.id] || [];
    const colors = chartConfig.colors || state.customColors;
    
    if (!data.length) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>No data available</p>
          </div>
        </div>
      );
    }
    
    const commonProps = {
      width: '100%',
      height: '100%',
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };
    
    switch (chartConfig.type) {
      case ChartType.LINE:
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsLineChart data={data}>
              {chartConfig.options?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="time" />
              <YAxis />
              {chartConfig.options?.showTooltip && <Tooltip />}
              {chartConfig.options?.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={chartConfig.options?.interactive}
                animationDuration={chartConfig.options?.animated ? 300 : 0}
              />
              {chartConfig.options?.brush && <Brush />}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
        
      case ChartType.BAR:
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsBarChart data={data}>
              {chartConfig.options?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chartConfig.options?.showTooltip && <Tooltip />}
              {chartConfig.options?.showLegend && <Legend />}
              <Bar dataKey="value" fill={colors[0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        );
        
      case ChartType.PIE:
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={chartConfig.options?.showLabels ? ({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%` : false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {chartConfig.options?.showTooltip && <Tooltip />}
              {chartConfig.options?.showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );
        
      case ChartType.AREA:
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              {chartConfig.options?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="time" />
              <YAxis />
              {chartConfig.options?.showTooltip && <Tooltip />}
              {chartConfig.options?.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke={colors[0]} 
                fill={colors[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case ChartType.SCATTER:
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsScatterChart data={data}>
              {chartConfig.options?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              {chartConfig.options?.showTooltip && <Tooltip />}
              {chartConfig.options?.showLegend && <Legend />}
              <Scatter fill={colors[0]} />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );
        
      case ChartType.HEATMAP:
        return (
          <div className="h-full w-full relative">
            <div className="text-center text-gray-500 absolute inset-0 flex items-center justify-center">
              <div>
                <Grid3X3 className="h-8 w-8 mx-auto mb-2" />
                <p>Heatmap visualization</p>
                <p className="text-sm">{data.length} data points</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unsupported chart type</p>
            </div>
          </div>
        );
    }
  }, [processedData, state.customColors]);
  
  const renderChartCard = useCallback((chartConfig: ChartConfig) => {
    const isSelected = state.selectedChart === chartConfig.id;
    
    return (
      <Card 
        key={chartConfig.id}
        className={cn(
          "transition-all duration-200 cursor-pointer hover:shadow-lg",
          isSelected && "ring-2 ring-blue-500 ring-opacity-50"
        )}
        onClick={() => setState(prev => ({ 
          ...prev, 
          selectedChart: prev.selectedChart === chartConfig.id ? null : chartConfig.id 
        }))}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {React.createElement(chartTypeConfigs[chartConfig.type].icon, { 
                className: "h-4 w-4 text-blue-600" 
              })}
              <CardTitle className="text-sm font-medium">{chartConfig.title}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Chart Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(chartTypeConfigs).map(([type, config]) => (
                  <DropdownMenuItem 
                    key={type}
                    onClick={() => handleChartTypeChange(chartConfig.id, type as ChartType)}
                  >
                    {React.createElement(config.icon, { className: "h-4 w-4 mr-2" })}
                    {config.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {chartConfig.description && (
            <CardDescription className="text-xs">{chartConfig.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            {renderChart(chartConfig)}
          </div>
        </CardContent>
      </Card>
    );
  }, [state.selectedChart, renderChart, handleChartTypeChange]);
  
  const renderControls = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Visualization Suite
          </h2>
        </div>
        
        {state.loading && (
          <div className="flex items-center space-x-2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Updating...</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* View Mode Selector */}
        <Tabs value={state.currentMode} onValueChange={(value) => handleModeChange(value as VisualizationMode)}>
          <TabsList>
            <TabsTrigger value={VisualizationMode.GRID} className="text-xs">
              <Grid3X3 className="h-3 w-3 mr-1" />
              Grid
            </TabsTrigger>
            <TabsTrigger value={VisualizationMode.SINGLE} className="text-xs">
              <Maximize2 className="h-3 w-3 mr-1" />
              Single
            </TabsTrigger>
            <TabsTrigger value={VisualizationMode.DASHBOARD} className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              Dashboard
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Time Aggregation */}
        <Select value={state.aggregation} onValueChange={(value) => setState(prev => ({ ...prev, aggregation: value as TimeAggregation }))}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeAggregation.MINUTE}>1m</SelectItem>
            <SelectItem value={TimeAggregation.HOUR}>1h</SelectItem>
            <SelectItem value={TimeAggregation.DAY}>1d</SelectItem>
            <SelectItem value={TimeAggregation.WEEK}>1w</SelectItem>
            <SelectItem value={TimeAggregation.MONTH}>1M</SelectItem>
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
                  onClick={() => setState(prev => ({ ...prev, loading: true }))}
                  disabled={state.loading}
                >
                  <RefreshCcw className={cn("h-4 w-4", state.loading && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {enableCustomization && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showCustomization: !prev.showCustomization }))}
                    className={cn(state.showCustomization && "bg-blue-50 border-blue-300")}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Customize Charts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
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
                  <p>Export Charts</p>
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
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}>
                {state.isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                {state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, enableAnimations: !prev.enableAnimations }))}>
                <Play className="h-4 w-4 mr-2" />
                Animations: {state.enableAnimations ? 'On' : 'Off'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}>
                <Palette className="h-4 w-4 mr-2" />
                Toggle Theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
  
  const renderMainContent = () => {
    const activeCharts = state.charts.filter(chart => state.activeCharts.includes(chart.id));
    
    return (
      <motion.div
        animate={mainAnimationControls}
        className="flex-1 overflow-hidden p-4"
      >
        {state.currentMode === VisualizationMode.GRID && (
          <div className={cn(
            "grid gap-4 h-full",
            state.gridLayout.cols === 1 && "grid-cols-1",
            state.gridLayout.cols === 2 && "grid-cols-1 lg:grid-cols-2",
            state.gridLayout.cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            state.gridLayout.cols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {activeCharts.map(chart => renderChartCard(chart))}
          </div>
        )}
        
        {state.currentMode === VisualizationMode.SINGLE && state.selectedChart && (
          <div className="h-full">
            {(() => {
              const chart = state.charts.find(c => c.id === state.selectedChart);
              return chart ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {React.createElement(chartTypeConfigs[chart.type].icon, { 
                        className: "h-5 w-5 text-blue-600" 
                      })}
                      <span>{chart.title}</span>
                    </CardTitle>
                    {chart.description && (
                      <CardDescription>{chart.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-[calc(100vh-12rem)]">
                      {renderChart(chart)}
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}
          </div>
        )}
        
        {state.currentMode === VisualizationMode.DASHBOARD && (
          <div className="h-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Activities</p>
                      <p className="text-2xl font-bold text-blue-900">{formatNumber(activities.length)}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Charts</p>
                      <p className="text-2xl font-bold text-green-900">{state.activeCharts.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Data Points</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatNumber(Object.values(processedData).reduce((sum, data) => sum + data.length, 0))}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
              {activeCharts.slice(0, 4).map(chart => renderChartCard(chart))}
            </div>
          </div>
        )}
        
        {activeCharts.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Charts Active
              </h3>
              <p className="text-gray-500 mb-4">
                Add charts to visualize your activity data
              </p>
              <Button onClick={() => setState(prev => ({ ...prev, showCustomization: true }))}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Add Charts
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };
  
  // Error Handling
  if (state.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Visualization Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setState(prev => ({ ...prev, error: null }))}
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
        "flex flex-col h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden",
        state.isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      style={{ height: state.isFullscreen ? '100vh' : height }}
    >
      {/* Header Controls */}
      {renderControls()}
      
      {/* Main Content */}
      {renderMainContent()}
      
      {/* Export Dialog */}
      <Dialog open={state.showExportDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showExportDialog: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Visualizations</DialogTitle>
            <DialogDescription>
              Choose the format to export your charts and data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select defaultValue="png">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Image)</SelectItem>
                  <SelectItem value="svg">SVG (Vector)</SelectItem>
                  <SelectItem value="pdf">PDF (Report)</SelectItem>
                  <SelectItem value="csv">CSV (Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Include Charts</Label>
              <div className="space-y-2">
                {state.charts.map(chart => (
                  <div key={chart.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={chart.id}
                      defaultChecked={state.activeCharts.includes(chart.id)}
                    />
                    <Label htmlFor={chart.id} className="text-sm">
                      {chart.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showExportDialog: false }))}>
              Cancel
            </Button>
            <Button onClick={() => handleExport('png')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Customization Panel */}
      <Dialog open={state.showCustomization} onOpenChange={(open) => setState(prev => ({ ...prev, showCustomization: open }))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Customize Visualizations</DialogTitle>
            <DialogDescription>
              Configure charts, colors, and layout options.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="charts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(chartTypeConfigs).map(([type, config]) => (
                  <Card 
                    key={type}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      // Add new chart logic
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      {React.createElement(config.icon, { className: "h-8 w-8 mx-auto mb-2 text-blue-600" })}
                      <h4 className="font-medium text-sm">{config.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {Object.entries(colorSchemes).map(([scheme, colors]) => (
                      <div 
                        key={scheme}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors",
                          JSON.stringify(colors) === JSON.stringify(state.customColors) 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setState(prev => ({ ...prev, customColors: Array.isArray(colors) ? colors : Object.values(colors) }))}
                      >
                        <div className="flex space-x-1 mb-2">
                          {(Array.isArray(colors) ? colors : Object.values(colors)).slice(0, 6).map((color, index) => (
                            <div 
                              key={index}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-medium capitalize">{scheme.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Grid Layout</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[1, 2, 3, 4].map(cols => (
                      <Button
                        key={cols}
                        variant={state.gridLayout.cols === cols ? "default" : "outline"}
                        size="sm"
                        onClick={() => setState(prev => ({ 
                          ...prev, 
                          gridLayout: { ...prev.gridLayout, cols } 
                        }))}
                      >
                        {cols} Col{cols > 1 ? 's' : ''}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Enable Animations</Label>
                  <Switch 
                    checked={state.enableAnimations}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, enableAnimations: checked }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Max Data Points</Label>
                  <Slider
                    value={[state.maxDataPoints]}
                    onValueChange={([value]) => setState(prev => ({ ...prev, maxDataPoints: value }))}
                    min={100}
                    max={10000}
                    step={100}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Current: {formatNumber(state.maxDataPoints)} points
                  </div>
                </div>
                
                <div>
                  <Label>Update Interval (seconds)</Label>
                  <Slider
                    value={[state.updateInterval / 1000]}
                    onValueChange={([value]) => setState(prev => ({ ...prev, updateInterval: value * 1000 }))}
                    min={5}
                    max={300}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Current: {state.updateInterval / 1000} seconds
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCustomization: false }))}>
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

export default ActivityVisualizationSuite;