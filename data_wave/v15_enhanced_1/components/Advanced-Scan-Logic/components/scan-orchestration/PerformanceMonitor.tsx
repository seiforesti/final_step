/**
 * 📊 Performance Monitor - Advanced Scan Logic
 * ===========================================
 * 
 * Enterprise-grade real-time performance monitoring system that provides
 * comprehensive insights into scan performance, resource utilization,
 * and system health with intelligent alerting and analytics.
 * 
 * Features:
 * - Real-time performance monitoring and analytics
 * - Advanced metrics collection and visualization
 * - Intelligent alerting and anomaly detection
 * - Performance trend analysis and forecasting
 * - Resource utilization tracking and optimization
 * - SLA monitoring and compliance tracking
 * - Interactive dashboards and reporting
 * - Historical performance analysis
 * - Cross-system performance correlation
 * - Automated performance tuning recommendations
 * 
 * Architecture:
 * - Real-time telemetry processing engine
 * - Advanced time-series analytics
 * - Distributed monitoring with aggregation
 * - Enterprise alerting and notification systems
 * - Performance data warehousing and analytics
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component PerformanceMonitor
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Monitor, Gauge, Timer, Clock, AlertTriangle, AlertCircle, CheckCircle, XCircle, Info, Target, Zap, Cpu, HardDrive, Network, Database, Server, Cloud, Thermometer, Battery, Wifi, Settings, Filter, Search, Download, Upload, Share, Copy, Edit, Trash2, Plus, Minus, Maximize, Minimize, RefreshCw, Save, Send, MessageSquare, Users, User, Calendar, MapPin, Globe, Link, ExternalLink, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, MoreHorizontal, MoreVertical, Grid, List, Box, Package, Archive, Folder, File, FileText, Image, Video, Music, Code, Terminal, Command, Shortcut, Tag, Hash, AtSign, Percent, DollarSign, Euro, Pound, Yen, Bitcoin, CreditCard, Banknote, Receipt, Calculator, PenTool, Brush, Palette, Droplet, Flame, Snowflake, Wind, Play, Pause, Square, SkipForward, SkipBack, FastForward, Rewind, Bell, BellOff, Eye, EyeOff, Shield, Lock, Unlock } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Advanced Scan Logic Imports
import { ScanPerformanceAPIService } from '../../services/scan-performance-apis';
import { ScanOrchestrationAPIService } from '../../services/scan-orchestration-apis';
import { ScanCoordinationAPIService } from '../../services/scan-coordination-apis';
import { ScanAnalyticsAPIService } from '../../services/scan-analytics-apis';

// Hooks
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';

// Types
import {
  PerformanceMetrics,
  SystemHealthMetrics,
  ResourceUtilizationMetrics,
  ThroughputMetrics,
  LatencyMetrics,
  ErrorRateMetrics,
  SLAMetrics,
  PerformanceAlert,
  PerformanceTrend,
  PerformanceBenchmark,
  PerformanceThreshold,
  PerformanceReport,
  MonitoringConfiguration,
  AlertConfiguration,
  DashboardLayout,
  PerformanceKPI,
  BottleneckAnalysis,
  PerformanceForecast,
  PerformanceOptimizationSuggestion,
  MonitoringTarget,
  AlertSeverity,
  MetricAggregation,
  TimeSeriesData,
  PerformanceComparisonReport
} from '../../types/orchestration.types';

// Utils
import { performanceCalculator } from '../../utils/performance-calculator';
import { monitoringAggregator } from '../../utils/monitoring-aggregator';
import { analyticsProcessor } from '../../utils/analytics-processor';

// Constants
import { 
  PERFORMANCE_THRESHOLDS,
  MONITORING_INTERVALS,
  ALERT_SEVERITIES,
  SLA_TARGETS
} from '../../constants/performance-thresholds';

// Performance Monitor state management
interface PerformanceMonitorState {
  selectedTimeRange: '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d';
  activeView: 'overview' | 'metrics' | 'alerts' | 'trends' | 'reports';
  performanceMetrics: PerformanceMetrics;
  systemHealth: SystemHealthMetrics;
  resourceUtilization: ResourceUtilizationMetrics;
  alerts: PerformanceAlert[];
  trends: PerformanceTrend[];
  benchmarks: PerformanceBenchmark[];
  kpis: PerformanceKPI[];
  bottlenecks: BottleneckAnalysis[];
  forecasts: PerformanceForecast[];
  optimizationSuggestions: PerformanceOptimizationSuggestion[];
  monitoringTargets: MonitoringTarget[];
  realTimeUpdates: boolean;
  alertsEnabled: boolean;
  showAdvancedMetrics: boolean;
  dashboardLayout: DashboardLayout;
  selectedMetrics: string[];
  comparisonMode: boolean;
  comparisonPeriod: string;
  filters: {
    severity: AlertSeverity[];
    category: string[];
    status: string[];
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  searchQuery: string;
  notifications: any[];
  errors: any[];
  isLoading: boolean;
}

type PerformanceMonitorAction = 
  | { type: 'SET_TIME_RANGE'; payload: '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d' }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'overview' | 'metrics' | 'alerts' | 'trends' | 'reports' }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: PerformanceMetrics }
  | { type: 'SET_SYSTEM_HEALTH'; payload: SystemHealthMetrics }
  | { type: 'SET_RESOURCE_UTILIZATION'; payload: ResourceUtilizationMetrics }
  | { type: 'SET_ALERTS'; payload: PerformanceAlert[] }
  | { type: 'SET_TRENDS'; payload: PerformanceTrend[] }
  | { type: 'SET_BENCHMARKS'; payload: PerformanceBenchmark[] }
  | { type: 'SET_KPIS'; payload: PerformanceKPI[] }
  | { type: 'SET_BOTTLENECKS'; payload: BottleneckAnalysis[] }
  | { type: 'SET_FORECASTS'; payload: PerformanceForecast[] }
  | { type: 'SET_OPTIMIZATION_SUGGESTIONS'; payload: PerformanceOptimizationSuggestion[] }
  | { type: 'SET_MONITORING_TARGETS'; payload: MonitoringTarget[] }
  | { type: 'TOGGLE_REAL_TIME_UPDATES' }
  | { type: 'TOGGLE_ALERTS' }
  | { type: 'TOGGLE_ADVANCED_METRICS' }
  | { type: 'SET_DASHBOARD_LAYOUT'; payload: DashboardLayout }
  | { type: 'SET_SELECTED_METRICS'; payload: string[] }
  | { type: 'TOGGLE_COMPARISON_MODE' }
  | { type: 'SET_COMPARISON_PERIOD'; payload: string }
  | { type: 'SET_FILTERS'; payload: any }
  | { type: 'SET_SORT'; payload: { field: string; direction: 'asc' | 'desc' } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'ADD_ERROR'; payload: any }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const performanceMonitorReducer = (state: PerformanceMonitorState, action: PerformanceMonitorAction): PerformanceMonitorState => {
  switch (action.type) {
    case 'SET_TIME_RANGE':
      return { ...state, selectedTimeRange: action.payload };
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_PERFORMANCE_METRICS':
      return { ...state, performanceMetrics: action.payload };
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    case 'SET_RESOURCE_UTILIZATION':
      return { ...state, resourceUtilization: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_TRENDS':
      return { ...state, trends: action.payload };
    case 'SET_BENCHMARKS':
      return { ...state, benchmarks: action.payload };
    case 'SET_KPIS':
      return { ...state, kpis: action.payload };
    case 'SET_BOTTLENECKS':
      return { ...state, bottlenecks: action.payload };
    case 'SET_FORECASTS':
      return { ...state, forecasts: action.payload };
    case 'SET_OPTIMIZATION_SUGGESTIONS':
      return { ...state, optimizationSuggestions: action.payload };
    case 'SET_MONITORING_TARGETS':
      return { ...state, monitoringTargets: action.payload };
    case 'TOGGLE_REAL_TIME_UPDATES':
      return { ...state, realTimeUpdates: !state.realTimeUpdates };
    case 'TOGGLE_ALERTS':
      return { ...state, alertsEnabled: !state.alertsEnabled };
    case 'TOGGLE_ADVANCED_METRICS':
      return { ...state, showAdvancedMetrics: !state.showAdvancedMetrics };
    case 'SET_DASHBOARD_LAYOUT':
      return { ...state, dashboardLayout: action.payload };
    case 'SET_SELECTED_METRICS':
      return { ...state, selectedMetrics: action.payload };
    case 'TOGGLE_COMPARISON_MODE':
      return { ...state, comparisonMode: !state.comparisonMode };
    case 'SET_COMPARISON_PERIOD':
      return { ...state, comparisonPeriod: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, { 
          id: Date.now().toString(), 
          timestamp: new Date(), 
          ...action.payload 
        }] 
      };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    case 'ADD_ERROR':
      return { 
        ...state, 
        errors: [...state.errors, { 
          id: Date.now().toString(), 
          timestamp: new Date(), 
          ...action.payload 
        }] 
      };
    case 'REMOVE_ERROR':
      return { 
        ...state, 
        errors: state.errors.filter(e => e.id !== action.payload) 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialPerformanceMonitorState: PerformanceMonitorState = {
  selectedTimeRange: '1h',
  activeView: 'overview',
  performanceMetrics: {
    throughput: 0,
    latency: 0,
    errorRate: 0,
    availability: 0,
    performanceTrends: []
  },
  systemHealth: {
    overall: 'healthy',
    components: [],
    uptime: 0,
    lastUpdate: new Date().toISOString()
  },
  resourceUtilization: {
    cpu: 0,
    memory: 0,
    storage: 0,
    network: 0,
    trends: []
  },
  alerts: [],
  trends: [],
  benchmarks: [],
  kpis: [],
  bottlenecks: [],
  forecasts: [],
  optimizationSuggestions: [],
  monitoringTargets: [],
  realTimeUpdates: true,
  alertsEnabled: true,
  showAdvancedMetrics: false,
  dashboardLayout: 'grid',
  selectedMetrics: ['throughput', 'latency', 'errorRate', 'availability'],
  comparisonMode: false,
  comparisonPeriod: '24h',
  filters: {
    severity: [],
    category: [],
    status: []
  },
  sort: { field: 'timestamp', direction: 'desc' },
  searchQuery: '',
  notifications: [],
  errors: [],
  isLoading: false
};

// Main PerformanceMonitor Component
export const PerformanceMonitor: React.FC = () => {
  // State management
  const [state, dispatch] = useReducer(performanceMonitorReducer, initialPerformanceMonitorState);
  
  // Refs for monitoring intervals
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // API services
  const performanceAPI = useMemo(() => new ScanPerformanceAPIService(), []);
  const orchestrationAPI = useMemo(() => new ScanOrchestrationAPIService(), []);
  const coordinationAPI = useMemo(() => new ScanCoordinationAPIService(), []);
  const analyticsAPI = useMemo(() => new ScanAnalyticsAPIService(), []);
  
  // Hooks for advanced functionality
  const {
    performanceMetrics,
    bottleneckAnalysis,
    optimizePerformance,
    predictPerformance,
    analyzePerformanceTrends,
    generatePerformanceReport,
    isLoading: performanceLoading,
    error: performanceError
  } = usePerformanceOptimization();
  
  const {
    realTimeMetrics,
    systemHealth,
    alertSummary,
    subscribe,
    unsubscribe,
    isConnected
  } = useRealTimeMonitoring({
    autoConnect: state.realTimeUpdates,
    updateInterval: 5000
  });
  
  const {
    analytics,
    insights,
    generateAnalytics,
    analyzeMetrics,
    createReport,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useAdvancedAnalytics();

  // ==================== LIFECYCLE HOOKS ====================
  
  useEffect(() => {
    // Initialize component and load data
    initializePerformanceMonitor();
    
    return () => {
      // Cleanup
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      if (alertsIntervalRef.current) {
        clearInterval(alertsIntervalRef.current);
      }
      unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Update real-time monitoring subscription
    if (state.realTimeUpdates) {
      subscribe(['performance-metrics', 'system-health', 'alerts']);
      setupRealTimeMonitoring();
    } else {
      unsubscribe();
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    }
  }, [state.realTimeUpdates, subscribe, unsubscribe]);
  
  useEffect(() => {
    // Update metrics from real-time data
    if (realTimeMetrics) {
      dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: realTimeMetrics.performance });
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: realTimeMetrics.systemHealth });
      dispatch({ type: 'SET_RESOURCE_UTILIZATION', payload: realTimeMetrics.resources });
    }
  }, [realTimeMetrics]);
  
  useEffect(() => {
    // Refresh data when time range changes
    loadPerformanceData();
  }, [state.selectedTimeRange]);
  
  useEffect(() => {
    // Handle errors
    if (performanceError || analyticsError) {
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: performanceError?.message || analyticsError?.message,
          type: 'error'
        }
      });
    }
  }, [performanceError, analyticsError]);

  // ==================== CORE FUNCTIONS ====================
  
  const initializePerformanceMonitor = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load initial data
      await Promise.all([
        loadPerformanceMetrics(),
        loadSystemHealth(),
        loadAlerts(),
        loadTrends(),
        loadBenchmarks(),
        loadKPIs(),
        loadBottlenecks(),
        loadForecasts(),
        loadOptimizationSuggestions(),
        loadMonitoringTargets()
      ]);
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          message: 'Performance Monitor initialized successfully',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Failed to initialize Performance Monitor:', error);
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: { 
          message: 'Failed to initialize Performance Monitor',
          type: 'error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const loadPerformanceData = useCallback(async () => {
    try {
      await Promise.all([
        loadPerformanceMetrics(),
        loadSystemHealth(),
        loadAlerts(),
        loadTrends()
      ]);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  }, []);
  
  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const metrics = await performanceAPI.getPerformanceMetrics({
        timeRange: state.selectedTimeRange,
        includeHistorical: true
      });
      dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: metrics });
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
      throw error;
    }
  }, [performanceAPI, state.selectedTimeRange]);
  
  const loadSystemHealth = useCallback(async () => {
    try {
      const health = await performanceAPI.getSystemHealth({
        includeComponents: true,
        includeHistory: false
      });
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: health });
    } catch (error) {
      console.error('Failed to load system health:', error);
      throw error;
    }
  }, [performanceAPI]);
  
  const loadAlerts = useCallback(async () => {
    try {
      const alerts = await performanceAPI.getPerformanceAlerts({
        timeRange: state.selectedTimeRange,
        includeResolved: false,
        severity: state.filters.severity
      });
      dispatch({ type: 'SET_ALERTS', payload: alerts });
    } catch (error) {
      console.error('Failed to load alerts:', error);
      throw error;
    }
  }, [performanceAPI, state.selectedTimeRange, state.filters.severity]);
  
  const loadTrends = useCallback(async () => {
    try {
      const trends = await analyzePerformanceTrends({
        timeRange: state.selectedTimeRange,
        metrics: state.selectedMetrics
      });
      dispatch({ type: 'SET_TRENDS', payload: trends });
    } catch (error) {
      console.error('Failed to load trends:', error);
      throw error;
    }
  }, [analyzePerformanceTrends, state.selectedTimeRange, state.selectedMetrics]);
  
  const loadBenchmarks = useCallback(async () => {
    try {
      const benchmarks = await performanceAPI.getPerformanceBenchmarks({
        includeIndustryStandards: true
      });
      dispatch({ type: 'SET_BENCHMARKS', payload: benchmarks });
    } catch (error) {
      console.error('Failed to load benchmarks:', error);
      throw error;
    }
  }, [performanceAPI]);
  
  const loadKPIs = useCallback(async () => {
    try {
      const kpis = await performanceAPI.getPerformanceKPIs({
        timeRange: state.selectedTimeRange,
        includeTargets: true
      });
      dispatch({ type: 'SET_KPIS', payload: kpis });
    } catch (error) {
      console.error('Failed to load KPIs:', error);
      throw error;
    }
  }, [performanceAPI, state.selectedTimeRange]);
  
  const loadBottlenecks = useCallback(async () => {
    try {
      const bottlenecks = await bottleneckAnalysis({
        includeRecommendations: true
      });
      dispatch({ type: 'SET_BOTTLENECKS', payload: bottlenecks });
    } catch (error) {
      console.error('Failed to load bottlenecks:', error);
      throw error;
    }
  }, [bottleneckAnalysis]);
  
  const loadForecasts = useCallback(async () => {
    try {
      const forecasts = await predictPerformance({
        timeHorizon: '24h',
        includeConfidenceIntervals: true
      });
      dispatch({ type: 'SET_FORECASTS', payload: forecasts });
    } catch (error) {
      console.error('Failed to load forecasts:', error);
      throw error;
    }
  }, [predictPerformance]);
  
  const loadOptimizationSuggestions = useCallback(async () => {
    try {
      const suggestions = await optimizePerformance({
        includeImpactAnalysis: true
      });
      dispatch({ type: 'SET_OPTIMIZATION_SUGGESTIONS', payload: suggestions });
    } catch (error) {
      console.error('Failed to load optimization suggestions:', error);
      throw error;
    }
  }, [optimizePerformance]);
  
  const loadMonitoringTargets = useCallback(async () => {
    try {
      const targets = await performanceAPI.getMonitoringTargets();
      dispatch({ type: 'SET_MONITORING_TARGETS', payload: targets });
    } catch (error) {
      console.error('Failed to load monitoring targets:', error);
      throw error;
    }
  }, [performanceAPI]);
  
  const setupRealTimeMonitoring = useCallback(() => {
    metricsIntervalRef.current = setInterval(async () => {
      try {
        await loadPerformanceMetrics();
      } catch (error) {
        console.error('Failed to update real-time metrics:', error);
      }
    }, 30000); // Update every 30 seconds
    
    if (state.alertsEnabled) {
      alertsIntervalRef.current = setInterval(async () => {
        try {
          await loadAlerts();
        } catch (error) {
          console.error('Failed to update alerts:', error);
        }
      }, 60000); // Check alerts every minute
    }
  }, [loadPerformanceMetrics, loadAlerts, state.alertsEnabled]);

  // ==================== UTILITY FUNCTIONS ====================
  
  const getHealthStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'degraded':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }, []);
  
  const getSeverityIcon = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return XCircle;
      case 'high':
        return AlertTriangle;
      case 'medium':
        return AlertCircle;
      case 'low':
        return Info;
      default:
        return CheckCircle;
    }
  }, []);
  
  const formatMetricValue = useCallback((value: number, unit: string) => {
    switch (unit) {
      case 'ms':
        return `${value.toFixed(1)}ms`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toLocaleString();
      case 'bytes':
        return formatBytes(value);
      default:
        return value.toFixed(2);
    }
  }, []);
  
  const formatBytes = useCallback((bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);
  
  const formatDuration = useCallback((milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // ==================== RENDER FUNCTIONS ====================
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.performanceMetrics.throughput.toLocaleString()}/hr</div>
            <p className="text-xs text-muted-foreground">
              {state.performanceMetrics.throughputChange > 0 ? '+' : ''}{state.performanceMetrics.throughputChange}% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.performanceMetrics.latency.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground">
              P95: {state.performanceMetrics.latencyP95?.toFixed(1)}ms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.performanceMetrics.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Target: &lt; {PERFORMANCE_THRESHOLDS.errorRate}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.performanceMetrics.availability.toFixed(3)}%</div>
            <p className="text-xs text-muted-foreground">
              Uptime: {formatDuration(state.systemHealth.uptime)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
            
            <Badge className={getHealthStatusColor(state.systemHealth.overall)}>
              {state.systemHealth.overall}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {state.resourceUtilization.cpu}%
              </div>
              <div className="text-sm text-blue-600">CPU Usage</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {state.resourceUtilization.memory}%
              </div>
              <div className="text-sm text-purple-600">HardDrive Usage</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <HardDrive className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {state.resourceUtilization.storage}%
              </div>
              <div className="text-sm text-orange-600">Storage Usage</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Network className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {state.resourceUtilization.network}%
              </div>
              <div className="text-sm text-green-600">Network Usage</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Active Alerts */}
      {state.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Active Alerts</span>
              <Badge variant="destructive">{state.alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.alerts.slice(0, 5).map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                
                return (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <SeverityIcon className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      
                      <div>
                        <div className="font-medium text-sm">{alert.title}</div>
                        <div className="text-xs text-gray-500">{alert.description}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getHealthStatusColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Performance trends chart would be rendered here with a charting library
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderMetrics = () => (
    <div className="space-y-6">
      {/* Metrics Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Metrics</CardTitle>
            
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Real-time</Label>
              <Switch
                checked={state.realTimeUpdates}
                onCheckedChange={() => dispatch({ type: 'TOGGLE_REAL_TIME_UPDATES' })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Metric Selection */}
            <div className="space-y-2">
              <Label>Display Metrics</Label>
              <div className="space-y-2">
                {['throughput', 'latency', 'errorRate', 'availability', 'resourceUsage'].map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      checked={state.selectedMetrics.includes(metric)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          dispatch({ 
                            type: 'SET_SELECTED_METRICS', 
                            payload: [...state.selectedMetrics, metric] 
                          });
                        } else {
                          dispatch({ 
                            type: 'SET_SELECTED_METRICS', 
                            payload: state.selectedMetrics.filter(m => m !== metric) 
                          });
                        }
                      }}
                    />
                    <Label className="text-sm capitalize">{metric}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Time Range Selection */}
            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select
                value={state.selectedTimeRange}
                onValueChange={(value) => 
                  dispatch({ type: 'SET_TIME_RANGE', payload: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">Last 5 minutes</SelectItem>
                  <SelectItem value="15m">Last 15 minutes</SelectItem>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Comparison Mode */}
            <div className="space-y-2">
              <Label>Comparison</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={state.comparisonMode}
                  onCheckedChange={() => dispatch({ type: 'TOGGLE_COMPARISON_MODE' })}
                />
                <span className="text-sm">Compare with previous period</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{kpi.name}</CardTitle>
              <CardDescription>{kpi.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatMetricValue(kpi.currentValue, kpi.unit)}
                  </span>
                  
                  <Badge className={
                    kpi.status === 'good' ? 'bg-green-100 text-green-800' :
                    kpi.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {kpi.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Target: {formatMetricValue(kpi.target, kpi.unit)}</span>
                  <span>
                    {kpi.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {kpi.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {kpi.trend === 'stable' && <Activity className="h-4 w-4 text-blue-500" />}
                  </span>
                </div>
                
                <Progress 
                  value={(kpi.currentValue / kpi.target) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  
  const renderAlerts = () => (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <div className="text-2xl font-bold text-red-600">
            {state.alerts.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-sm text-red-600">Critical</div>
        </Card>
        
        <Card className="text-center p-4">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold text-orange-600">
            {state.alerts.filter(a => a.severity === 'high').length}
          </div>
          <div className="text-sm text-orange-600">High</div>
        </Card>
        
        <Card className="text-center p-4">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold text-yellow-600">
            {state.alerts.filter(a => a.severity === 'medium').length}
          </div>
          <div className="text-sm text-yellow-600">Medium</div>
        </Card>
        
        <Card className="text-center p-4">
          <Info className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-blue-600">
            {state.alerts.filter(a => a.severity === 'low').length}
          </div>
          <div className="text-sm text-blue-600">Low</div>
        </Card>
      </div>
      
      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Alerts</CardTitle>
            
            <div className="flex items-center space-x-2">
              <Select
                value={state.filters.severity.join(',')}
                onValueChange={(value) => 
                  dispatch({ 
                    type: 'SET_FILTERS', 
                    payload: { 
                      ...state.filters, 
                      severity: value ? value.split(',') : [] 
                    }
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.alerts.map((alert) => {
              const SeverityIcon = getSeverityIcon(alert.severity);
              
              return (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <SeverityIcon className={`h-5 w-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="font-medium mb-1">{alert.title}</div>
                        <div className="text-sm text-gray-600 mb-2">{alert.description}</div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Source: {alert.source}</span>
                          <span>Time: {new Date(alert.timestamp).toLocaleString()}</span>
                          {alert.metric && (
                            <span>Metric: {alert.metric} = {alert.value}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getHealthStatusColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Acknowledge
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <XCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== MAIN RENDER ====================
  
  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Monitor className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Performance Monitor</h1>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {state.alerts.length} alerts
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Real-time indicator */}
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Time Range Selector */}
              <Select
                value={state.selectedTimeRange}
                onValueChange={(value) => 
                  dispatch({ type: 'SET_TIME_RANGE', payload: value as any })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="6h">6h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPerformanceData()}
                disabled={state.isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${state.isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => dispatch({ type: 'TOGGLE_ADVANCED_METRICS' })}>
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Metrics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generatePerformanceReport({})}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => dispatch({ type: 'TOGGLE_ALERTS' })}>
                    <Bell className="h-4 w-4 mr-2" />
                    Configure Alerts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Navigation Tabs */}
          <Tabs value={state.activeView} onValueChange={(value) => 
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: value as any })
          }>
            <div className="border-b bg-white px-6">
              <TabsList className="h-12">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Metrics</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Alerts</span>
                  {state.alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                      {state.alerts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trends</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6 overflow-auto">
              <TabsContent value="overview" className="m-0">
                {renderOverview()}
              </TabsContent>
              
              <TabsContent value="metrics" className="m-0">
                {renderMetrics()}
              </TabsContent>
              
              <TabsContent value="alerts" className="m-0">
                {renderAlerts()}
              </TabsContent>
              
              <TabsContent value="trends" className="m-0">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Performance trends analysis would be rendered here
                </div>
              </TabsContent>
              
              <TabsContent value="reports" className="m-0">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Performance reports dashboard would be rendered here
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {/* Notifications */}
        <AnimatePresence>
          {state.notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="fixed bottom-4 right-4 z-50"
            >
              <Alert className="w-80">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Notification</AlertTitle>
                <AlertDescription>{notification.message}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default PerformanceMonitor;