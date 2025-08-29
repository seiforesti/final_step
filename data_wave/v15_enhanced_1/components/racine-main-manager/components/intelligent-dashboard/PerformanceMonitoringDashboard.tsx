'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, TrendingUp, TrendingDown, BarChart3, LineChart, Server, Database, Cpu, HardDrive, Network, AlertTriangle, CheckCircle, Clock, Zap, Target, RefreshCw, Settings, Filter, Search, Download, Share2, Play, Pause, StopCircle, SkipForward, SkipBack, Maximize2, Minimize2, Eye, EyeOff, Plus, Minus, ArrowUp, ArrowDown, ArrowRight, MoreVertical, ExternalLink, Gauge, Thermometer, Wifi, WifiOff, Power, PowerOff, Monitor, Smartphone, Tablet, Laptop, HardDriveIcon, CloudIcon, CloudOff, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, LineChart as RechartsLineChart, AreaChart, BarChart as RechartsBarChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  Line, Area, Bar, PieChart as RechartsPieChart, Cell, RadialBarChart, RadialBar,
  ComposedChart, ReferenceLine, ReferenceArea
} from 'recharts';
import { 
  DashboardState, SystemHealth, CrossGroupMetrics, PerformanceMetrics,
  SystemResource, ResourceMetrics, ServiceMetrics, NetworkMetrics
} from '../../types/racine-core.types';
import { useDashboardAPIs } from '../../hooks/useDashboardAPIs';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Enhanced interfaces for performance monitoring
interface PerformanceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'service' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  service: string;
  isResolved: boolean;
  resolutionTime?: number;
}

interface SystemService {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'cache' | 'worker' | 'scheduler';
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  lastHealthCheck: string;
  dependencies: string[];
  endpoint?: string;
}

interface ResourceUsage {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
  requests: number;
}

interface PerformanceOptimization {
  id: string;
  type: 'caching' | 'indexing' | 'query' | 'scaling' | 'cleanup';
  title: string;
  description: string;
  estimatedImprovement: string;
  complexity: 'low' | 'medium' | 'high';
  status: 'suggested' | 'planned' | 'in_progress' | 'completed' | 'rejected';
  service: string;
  createdAt: string;
  completedAt?: string;
}

interface PerformanceState {
  currentMetrics: PerformanceMetrics | null;
  historicalData: ResourceUsage[];
  services: SystemService[];
  alerts: PerformanceAlert[];
  optimizations: PerformanceOptimization[];
  selectedService: SystemService | null;
  selectedMetric: string;
  timeRange: {
    start: string;
    end: string;
    period: 'hour' | 'day' | 'week' | 'month';
  };
  thresholds: {
    cpu: { warning: number; critical: number };
    memory: { warning: number; critical: number };
    disk: { warning: number; critical: number };
    network: { warning: number; critical: number };
    responseTime: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
  };
  isLoading: boolean;
  isRealTimeEnabled: boolean;
  autoOptimizationEnabled: boolean;
  refreshInterval: number;
  error: string | null;
}

interface PerformanceMonitoringDashboardProps {
  currentDashboard?: DashboardState | null;
  systemHealth?: SystemHealth | null;
  crossGroupMetrics?: CrossGroupMetrics | null;
  performanceMetrics?: PerformanceMetrics | null;
  isLoading?: boolean;
  onPerformanceAlert?: (alert: PerformanceAlert) => void;
  onOptimizationApply?: (optimization: PerformanceOptimization) => void;
  onThresholdUpdate?: (metric: string, thresholds: any) => void;
}

// Animation variants
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  pulse: {
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  },
  wave: {
    animate: {
      x: [-100, 100, -100],
      transition: { duration: 3, repeat: Infinity, ease: "linear" }
    }
  }
};

// Status colors and configurations
const STATUS_COLORS = {
  healthy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', color: '#10B981' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', color: '#F59E0B' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', color: '#EF4444' },
  offline: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', color: '#6B7280' }
};

const METRIC_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

// Sample performance data
const SAMPLE_SERVICES: SystemService[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway',
    type: 'api',
    status: 'healthy',
    uptime: 99.97,
    responseTime: 45,
    throughput: 1250,
    errorRate: 0.02,
    lastHealthCheck: new Date().toISOString(),
    dependencies: ['auth-service', 'data-service'],
    endpoint: '/health'
  },
  {
    id: 'auth-service',
    name: 'Authentication Service',
    type: 'api',
    status: 'warning',
    uptime: 99.85,
    responseTime: 120,
    throughput: 450,
    errorRate: 0.15,
    lastHealthCheck: new Date().toISOString(),
    dependencies: ['database', 'cache'],
    endpoint: '/auth/health'
  },
  {
    id: 'data-service',
    name: 'Data Processing Service',
    type: 'worker',
    status: 'healthy',
    uptime: 99.92,
    responseTime: 200,
    throughput: 800,
    errorRate: 0.05,
    lastHealthCheck: new Date().toISOString(),
    dependencies: ['database', 'message-queue'],
    endpoint: '/data/health'
  }
];

export const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  currentDashboard,
  systemHealth,
  crossGroupMetrics,
  performanceMetrics,
  isLoading = false,
  onPerformanceAlert,
  onOptimizationApply,
  onThresholdUpdate
}) => {
  // Refs
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<Record<string, any>>({});
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Custom hooks for backend integration
  const { 
    getPerformanceMetrics,
    getSystemServices,
    getPerformanceAlerts,
    updatePerformanceThresholds,
    applyPerformanceOptimization,
    getResourceUsageHistory,
    triggerPerformanceAnalysis
  } = useDashboardAPIs();

  const { subscribe, unsubscribe } = useRealtimeUpdates();
  const { orchestrateWorkflow, getWorkflowStatus } = useRacineOrchestration();
  const { integrateCrossGroupData, getCrossGroupInsights } = useCrossGroupIntegration();
  const { analyzePerformance, suggestOptimizations, predictResourceNeeds } = useAIAssistant();

  // Component state
  const [state, setState] = useState<PerformanceState>({
    currentMetrics: performanceMetrics || null,
    historicalData: [],
    services: SAMPLE_SERVICES,
    alerts: [],
    optimizations: [],
    selectedService: null,
    selectedMetric: 'cpu',
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      period: 'day'
    },
    thresholds: {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      network: { warning: 80, critical: 95 },
      responseTime: { warning: 1000, critical: 3000 },
      errorRate: { warning: 1, critical: 5 }
    },
    isLoading: false,
    isRealTimeEnabled: true,
    autoOptimizationEnabled: false,
    refreshInterval: 30000,
    error: null
  });

  // Dialog states
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  // Generate sample historical data
  const generateHistoricalData = useCallback((hours: number = 24) => {
    return Array.from({ length: hours * 4 }, (_, i) => {
      const timestamp = new Date(Date.now() - (hours * 4 - i) * 15 * 60 * 1000);
      return {
        timestamp: timestamp.toISOString(),
        cpu: Math.max(10, Math.min(95, 45 + Math.sin(i / 10) * 20 + Math.random() * 15)),
        memory: Math.max(20, Math.min(90, 60 + Math.sin(i / 8) * 15 + Math.random() * 10)),
        disk: Math.max(30, Math.min(85, 50 + Math.sin(i / 12) * 10 + Math.random() * 8)),
        network: Math.max(10, Math.min(80, 35 + Math.sin(i / 6) * 25 + Math.random() * 12)),
        connections: Math.floor(Math.random() * 500) + 100,
        requests: Math.floor(Math.random() * 1000) + 200
      };
    });
  }, []);

  // Computed values
  const currentResourceUsage = useMemo(() => {
    if (state.historicalData.length === 0) return null;
    return state.historicalData[state.historicalData.length - 1];
  }, [state.historicalData]);

  const servicesByStatus = useMemo(() => {
    return state.services.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [state.services]);

  const criticalAlerts = useMemo(() => {
    return state.alerts.filter(alert => 
      alert.severity === 'critical' && !alert.isResolved
    );
  }, [state.alerts]);

  const averageResponseTime = useMemo(() => {
    if (state.services.length === 0) return 0;
    return state.services.reduce((sum, service) => sum + service.responseTime, 0) / state.services.length;
  }, [state.services]);

  // Initialize component
  useEffect(() => {
    initializePerformanceMonitoring();
    return () => cleanup();
  }, []);

  // Real-time updates effect
  useEffect(() => {
    if (state.isRealTimeEnabled) {
      startRealTimeUpdates();
      return () => stopRealTimeUpdates();
    }
  }, [state.isRealTimeEnabled, state.refreshInterval]);

  // Initialize performance monitoring
  const initializePerformanceMonitoring = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Generate initial historical data
      const historicalData = generateHistoricalData(24);
      
      // Load performance data
      const [servicesData, alertsData, optimizationsData] = await Promise.all([
        getSystemServices?.() || SAMPLE_SERVICES,
        getPerformanceAlerts?.() || [],
        // getPerformanceOptimizations?.() || []
        []
      ]);

      setState(prev => ({
        ...prev,
        historicalData,
        services: servicesData,
        alerts: alertsData,
        optimizations: optimizationsData,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize performance monitoring' 
      }));
    }
  }, [generateHistoricalData, getSystemServices, getPerformanceAlerts]);

  // Start real-time updates
  const startRealTimeUpdates = useCallback(() => {
    const interval = setInterval(() => {
      updatePerformanceData();
    }, state.refreshInterval);
    
    updateIntervalRef.current = interval;
    
    // Subscribe to real-time events
    const unsubscribe = subscribe('performance_metrics', handleRealTimeUpdate);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [state.refreshInterval, subscribe]);

  // Stop real-time updates
  const stopRealTimeUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  // Update performance data
  const updatePerformanceData = useCallback(() => {
    setState(prev => {
      const newDataPoint: ResourceUsage = {
        timestamp: new Date().toISOString(),
        cpu: Math.max(10, Math.min(95, prev.historicalData[prev.historicalData.length - 1]?.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(90, prev.historicalData[prev.historicalData.length - 1]?.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(30, Math.min(85, prev.historicalData[prev.historicalData.length - 1]?.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(10, Math.min(80, prev.historicalData[prev.historicalData.length - 1]?.network + (Math.random() - 0.5) * 12)),
        connections: Math.floor(Math.random() * 500) + 100,
        requests: Math.floor(Math.random() * 1000) + 200
      };

      // Keep only last 24 hours of data (4 points per hour)
      const updatedHistory = [...prev.historicalData, newDataPoint].slice(-96);
      
      // Check for alerts
      checkPerformanceThresholds(newDataPoint);
      
      return {
        ...prev,
        historicalData: updatedHistory
      };
    });
  }, []);

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      currentMetrics: { ...prev.currentMetrics, ...data.metrics },
      services: data.services || prev.services,
      alerts: data.alerts || prev.alerts
    }));
  }, []);

  // Check performance thresholds
  const checkPerformanceThresholds = useCallback((data: ResourceUsage) => {
    const newAlerts: PerformanceAlert[] = [];
    
    Object.entries(state.thresholds).forEach(([metric, thresholds]) => {
      const value = data[metric as keyof ResourceUsage] as number;
      
      if (value >= thresholds.critical) {
        newAlerts.push({
          id: `alert_${metric}_${Date.now()}`,
          type: metric as any,
          severity: 'critical',
          title: `Critical ${metric.toUpperCase()} Usage`,
          description: `${metric.toUpperCase()} usage is at ${value}%, exceeding critical threshold of ${thresholds.critical}%`,
          threshold: thresholds.critical,
          currentValue: value,
          timestamp: data.timestamp,
          service: 'system',
          isResolved: false
        });
      } else if (value >= thresholds.warning) {
        newAlerts.push({
          id: `alert_${metric}_${Date.now()}`,
          type: metric as any,
          severity: 'medium',
          title: `High ${metric.toUpperCase()} Usage`,
          description: `${metric.toUpperCase()} usage is at ${value}%, exceeding warning threshold of ${thresholds.warning}%`,
          threshold: thresholds.warning,
          currentValue: value,
          timestamp: data.timestamp,
          service: 'system',
          isResolved: false
        });
      }
    });

    if (newAlerts.length > 0) {
      setState(prev => ({
        ...prev,
        alerts: [...prev.alerts, ...newAlerts]
      }));
      
      newAlerts.forEach(alert => {
        if (onPerformanceAlert) {
          onPerformanceAlert(alert);
        }
      });
    }
  }, [state.thresholds, onPerformanceAlert]);

  // Update thresholds
  const handleThresholdUpdate = useCallback(async (metric: string, newThresholds: any) => {
    try {
      setState(prev => ({
        ...prev,
        thresholds: {
          ...prev.thresholds,
          [metric]: newThresholds
        }
      }));

      if (updatePerformanceThresholds) {
        await updatePerformanceThresholds(metric, newThresholds);
      }
      
      if (onThresholdUpdate) {
        onThresholdUpdate(metric, newThresholds);
      }

    } catch (error) {
      console.error('Failed to update thresholds:', error);
      setState(prev => ({ ...prev, error: 'Failed to update thresholds' }));
    }
  }, [updatePerformanceThresholds, onThresholdUpdate]);

  // Apply optimization
  const handleApplyOptimization = useCallback(async (optimization: PerformanceOptimization) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (applyPerformanceOptimization) {
        await applyPerformanceOptimization(optimization.id);
      }
      
      setState(prev => ({
        ...prev,
        optimizations: prev.optimizations.map(opt =>
          opt.id === optimization.id
            ? { ...opt, status: 'in_progress' }
            : opt
        ),
        isLoading: false
      }));
      
      if (onOptimizationApply) {
        onOptimizationApply(optimization);
      }

    } catch (error) {
      console.error('Failed to apply optimization:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to apply optimization' 
      }));
    }
  }, [applyPerformanceOptimization, onOptimizationApply]);

  // Time range handler
  const handleTimeRangeChange = useCallback((period: string) => {
    const now = new Date();
    let hours: number;
    
    switch (period) {
      case 'hour':
        hours = 1;
        break;
      case 'day':
        hours = 24;
        break;
      case 'week':
        hours = 24 * 7;
        break;
      case 'month':
        hours = 24 * 30;
        break;
      default:
        hours = 24;
    }
    
    const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    setState(prev => ({
      ...prev,
      timeRange: {
        start: start.toISOString(),
        end: now.toISOString(),
        period: period as any
      },
      historicalData: generateHistoricalData(hours)
    }));
  }, [generateHistoricalData]);

  // Cleanup
  const cleanup = useCallback(() => {
    stopRealTimeUpdates();
  }, [stopRealTimeUpdates]);

  // Render resource usage gauge
  const renderResourceGauge = (metric: string, value: number, unit: string = '%') => {
    const thresholds = state.thresholds[metric as keyof typeof state.thresholds];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (thresholds) {
      if (value >= thresholds.critical) status = 'critical';
      else if (value >= thresholds.warning) status = 'warning';
    }
    
    const statusConfig = STATUS_COLORS[status];
    
    return (
      <motion.div
        variants={animationVariants.item}
        className="relative"
      >
        <Card className={cn("border-l-4", statusConfig.border)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium capitalize flex items-center justify-between">
              {metric}
              <Badge className={cn("text-xs", statusConfig.bg, statusConfig.text)}>
                {status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold" style={{ color: statusConfig.color }}>
                  {value.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">{unit}</span>
              </div>
              
              <div className="relative w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(value, 100)}%`,
                    backgroundColor: statusConfig.color
                  }}
                />
                {thresholds && (
                  <>
                    <div 
                      className="absolute top-0 w-0.5 h-3 bg-yellow-400"
                      style={{ left: `${thresholds.warning}%` }}
                    />
                    <div 
                      className="absolute top-0 w-0.5 h-3 bg-red-400"
                      style={{ left: `${thresholds.critical}%` }}
                    />
                  </>
                )}
              </div>
              
              {thresholds && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Warning: {thresholds.warning}%</span>
                  <span>Critical: {thresholds.critical}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render service status card
  const renderServiceCard = (service: SystemService) => {
    const statusConfig = STATUS_COLORS[service.status];
    const StatusIcon = service.status === 'offline' ? PowerOff : CheckCircle;
    
    return (
      <motion.div
        key={service.id}
        variants={animationVariants.item}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
        onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
      >
        <Card className={cn("border-l-4", statusConfig.border, "hover:shadow-md transition-shadow")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusIcon className={cn("h-4 w-4", statusConfig.text)} />
                <CardTitle className="text-base">{service.name}</CardTitle>
              </div>
              <Badge className={cn("text-xs", statusConfig.bg, statusConfig.text)}>
                {service.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Uptime</span>
                <p className="font-medium">{service.uptime}%</p>
              </div>
              <div>
                <span className="text-gray-500">Response</span>
                <p className="font-medium">{service.responseTime}ms</p>
              </div>
              <div>
                <span className="text-gray-500">Throughput</span>
                <p className="font-medium">{service.throughput}/min</p>
              </div>
              <div>
                <span className="text-gray-500">Error Rate</span>
                <p className="font-medium">{service.errorRate}%</p>
              </div>
            </div>
            
            {service.dependencies.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Dependencies:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {service.dependencies.slice(0, 2).map(dep => (
                    <Badge key={dep} variant="outline" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                  {service.dependencies.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{service.dependencies.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render performance chart
  const renderPerformanceChart = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Resource Usage Trends
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={state.selectedMetric} onValueChange={(value) => setState(prev => ({ ...prev, selectedMetric: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpu">CPU</SelectItem>
                <SelectItem value="memory">HardDrive</SelectItem>
                <SelectItem value="disk">Disk</SelectItem>
                <SelectItem value="network">Network</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, isRealTimeEnabled: !prev.isRealTimeEnabled }))}
            >
              {state.isRealTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={state.historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis domain={[0, 100]} />
            <RechartsTooltip 
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value: number) => [`${value.toFixed(1)}%`, state.selectedMetric.toUpperCase()]}
            />
            <Line 
              type="monotone" 
              dataKey={state.selectedMetric}
              stroke={METRIC_COLORS[0]} 
              strokeWidth={2}
              dot={false}
            />
            {state.thresholds[state.selectedMetric as keyof typeof state.thresholds] && (
              <>
                <ReferenceLine 
                  y={state.thresholds[state.selectedMetric as keyof typeof state.thresholds].warning} 
                  stroke="#F59E0B" 
                  strokeDasharray="5 5" 
                />
                <ReferenceLine 
                  y={state.thresholds[state.selectedMetric as keyof typeof state.thresholds].critical} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5" 
                />
              </>
            )}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <motion.div
        ref={dashboardRef}
        className="p-6 space-y-6"
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="h-8 w-8 mr-3" />
              Performance Monitoring
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time system performance tracking and optimization
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={state.timeRange.period}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">1 Hour</SelectItem>
                <SelectItem value="day">1 Day</SelectItem>
                <SelectItem value="week">1 Week</SelectItem>
                <SelectItem value="month">1 Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThresholdDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Thresholds
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, isRealTimeEnabled: !prev.isRealTimeEnabled }))}
            >
              {state.isRealTimeEnabled ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Resource Usage Overview */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Resource Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentResourceUsage && (
              <>
                {renderResourceGauge('cpu', currentResourceUsage.cpu)}
                {renderResourceGauge('memory', currentResourceUsage.memory)}
                {renderResourceGauge('disk', currentResourceUsage.disk)}
                {renderResourceGauge('network', currentResourceUsage.network)}
              </>
            )}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {renderPerformanceChart()}
          </div>
          
          {/* System Statistics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  System Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Services</span>
                  <span className="font-medium">{state.services.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Healthy Services</span>
                  <span className="font-medium text-green-600">{servicesByStatus.healthy || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Warning Services</span>
                  <span className="font-medium text-yellow-600">{servicesByStatus.warning || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical Alerts</span>
                  <span className="font-medium text-red-600">{criticalAlerts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-medium">{Math.round(averageResponseTime)}ms</span>
                </div>
                {currentResourceUsage && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Connections</span>
                      <span className="font-medium">{currentResourceUsage.connections}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Requests/min</span>
                      <span className="font-medium">{currentResourceUsage.requests}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Services Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Services</h2>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search services..."
                className="w-64"
              />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.services.map(renderServiceCard)}
          </div>
        </div>

        {/* Threshold Configuration Dialog */}
        <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Performance Thresholds</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {Object.entries(state.thresholds).map(([metric, thresholds]) => (
                <div key={metric} className="space-y-3">
                  <Label className="text-sm font-medium capitalize">{metric}</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Warning Threshold</Label>
                      <Input
                        type="number"
                        value={thresholds.warning}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setState(prev => ({
                            ...prev,
                            thresholds: {
                              ...prev.thresholds,
                              [metric]: { ...thresholds, warning: value }
                            }
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Critical Threshold</Label>
                      <Input
                        type="number"
                        value={thresholds.critical}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setState(prev => ({
                            ...prev,
                            thresholds: {
                              ...prev.thresholds,
                              [metric]: { ...thresholds, critical: value }
                            }
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowThresholdDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Save thresholds
                  setShowThresholdDialog(false);
                }}>
                  Save Thresholds
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading overlay */}
        {(state.isLoading || isLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading performance data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {state.error && (
          <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default PerformanceMonitoringDashboard;
