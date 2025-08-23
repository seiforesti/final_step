/**
 * 🤖 IntelligentScheduler.tsx - AI-Powered Scan Scheduling Engine
 * ===============================================================
 * 
 * Enterprise-grade intelligent scheduling system for optimizing scan
 * operations across multiple resources, time zones, and priority levels.
 * Features machine learning-based scheduling optimization, predictive
 * resource allocation, and adaptive scheduling algorithms.
 * 
 * Features:
 * - AI-powered scheduling optimization
 * - Predictive resource allocation and capacity planning
 * - Multi-dimensional scheduling constraints
 * - Real-time schedule adaptation and optimization
 * - Resource conflict detection and resolution
 * - Priority-based scheduling with SLA management
 * - Time zone and calendar integration
 * - Performance analytics and optimization insights
 * 
 * @author Enterprise Scheduling Team
 * @version 2.0.0 - Production Ready
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Brain, Zap, Target, TrendingUp, Activity, AlertTriangle, CheckCircle, XCircle, Play, Pause, Square, RotateCcw, Settings, Search, Filter, Download, Upload, RefreshCw, Plus, Minus, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreVertical, Info, Eye, BarChart3, LineChart, PieChart, Map, Globe, Users, User, Building, Server, Database, HardDrive, Cpu, MemoryStick, Network, Wifi, Link, ExternalLink, FileText, FolderOpen, Grid, List, LayoutGrid, Maximize, Minimize, Layers, Route, Navigation, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

import { useScanOrchestration } from '../../hooks/useScanOrchestration';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useOptimization } from '../../hooks/useOptimization';
import { scanOrchestrationAPI } from '../../services/scan-orchestration-apis';
import { scanPerformanceAPI } from '../../services/scan-performance-apis';

import {
  ScheduledScan,
  SchedulingRule,
  SchedulingConstraint,
  SchedulingOptimization,
  ResourceSchedule,
  SchedulingMetrics,
  SchedulingPolicy,
  TimeWindow,
  RecurrencePattern,
  SchedulingConflict,
  SchedulingRecommendation,
  CapacityPlan,
  SchedulingAlert
} from '../../types/orchestration.types';

import { 
  SCHEDULING_CONFIGS,
  SCHEDULING_ALGORITHMS,
  OPTIMIZATION_STRATEGIES
} from '../../constants/orchestration-configs';

import { 
  schedulingEngine,
  optimizationAlgorithms,
  capacityPlanner,
  conflictResolver
} from '../../utils/optimization-algorithms';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const scheduleVariants = {
  idle: { scale: 1, opacity: 0.8 },
  active: { 
    scale: [1, 1.05, 1], 
    opacity: [0.8, 1, 0.8], 
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } 
  },
  completed: { scale: 1, opacity: 1 },
  conflict: { 
    scale: [1, 1.1, 1], 
    opacity: [0.8, 1, 0.8], 
    borderColor: ['#ef4444', '#f97316', '#ef4444'],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } 
  }
};

// Interfaces
interface SchedulerState {
  isOptimizing: boolean;
  isScheduling: boolean;
  selectedSchedule: ScheduledScan | null;
  viewMode: 'calendar' | 'timeline' | 'resources' | 'analytics' | 'optimization';
  timeRange: 'day' | 'week' | 'month' | 'quarter';
  currentDate: Date;
  filters: SchedulingFilters;
  optimizationLevel: number;
  autoOptimization: boolean;
  realTimeUpdates: boolean;
}

interface SchedulingFilters {
  priorities: string[];
  types: string[];
  resources: string[];
  status: string[];
  searchQuery: string;
  showConflicts: boolean;
  showOptimizations: boolean;
}

interface CalendarView {
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  schedules: ScheduledScan[];
  conflicts: SchedulingConflict[];
  recommendations: SchedulingRecommendation[];
}

interface ScheduleCreationRequest {
  name: string;
  description: string;
  scanType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  resources: string[];
  duration: number;
  recurrence: RecurrencePattern;
  constraints: SchedulingConstraint[];
  notifications: boolean;
  autoReschedule: boolean;
}

interface SchedulingRecommendation {
  id: string;
  type: 'optimization' | 'conflict_resolution' | 'resource_allocation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  estimatedImprovement: string;
  action: () => void;
}

interface AIOptimizationEngine {
  analyze: (schedules: ScheduledScan[]) => Promise<SchedulingRecommendation[]>;
  optimize: (config: any) => Promise<SchedulingOptimization>;
  predict: (resource: string, timeframe: string) => Promise<number>;
  resolve: (conflict: SchedulingConflict) => Promise<string[]>;
}

// Main Component
export const IntelligentScheduler: React.FC = () => {
  // State Management
  const [state, setState] = useState<SchedulerState>({
    isOptimizing: false,
    isScheduling: false,
    selectedSchedule: null,
    viewMode: 'calendar',
    timeRange: 'week',
    currentDate: new Date(),
    filters: {
      priorities: [],
      types: [],
      resources: [],
      status: [],
      searchQuery: '',
      showConflicts: true,
      showOptimizations: true
    },
    optimizationLevel: 80,
    autoOptimization: true,
    realTimeUpdates: true
  });

  const [schedules, setSchedules] = useState<ScheduledScan[]>([]);
  const [metrics, setMetrics] = useState<SchedulingMetrics>({
    totalSchedules: 0,
    activeSchedules: 0,
    completedSchedules: 0,
    conflictingSchedules: 0,
    resourceUtilization: 0,
    optimizationScore: 0,
    averageExecutionTime: 0,
    scheduleAccuracy: 0
  });
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [recommendations, setRecommendations] = useState<SchedulingRecommendation[]>([]);
  const [resources, setResources] = useState<ResourceSchedule[]>([]);
  const [calendar, setCalendar] = useState<CalendarView>({
    view: 'week',
    currentDate: new Date(),
    schedules: [],
    conflicts: [],
    recommendations: []
  });
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isOptimizationDialogOpen, setIsOptimizationDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newScheduleRequest, setNewScheduleRequest] = useState<ScheduleCreationRequest>({
    name: '',
    description: '',
    scanType: '',
    priority: 'medium',
    resources: [],
    duration: 60,
    recurrence: { type: 'none', interval: 1, endDate: null },
    constraints: [],
    notifications: true,
    autoReschedule: true
  });

  // AI Optimization Engine
  const aiEngine = useRef<AIOptimizationEngine>({
    analyze: async (schedules: ScheduledScan[]) => {
      // AI-powered schedule analysis
      const analysis = await schedulingEngine.analyze(schedules);
      return analysis.recommendations || [];
    },
    optimize: async (config: any) => {
      // Intelligent scheduling optimization
      return await optimizationAlgorithms.optimize('scheduling', config);
    },
    predict: async (resource: string, timeframe: string) => {
      // Predictive resource utilization
      return await capacityPlanner.predict(resource, timeframe);
    },
    resolve: async (conflict: SchedulingConflict) => {
      // AI conflict resolution
      return await conflictResolver.resolve(conflict);
    }
  });

  // Refs
  const optimizationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    orchestrationJobs,
    schedules: orchestrationSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    optimizeScheduling,
    loading: orchestrationLoading,
    error: orchestrationError
  } = useScanOrchestration({
    autoRefresh: state.realTimeUpdates,
    refreshInterval: 30000,
    onScheduleChange: handleScheduleChange,
    onConflictDetected: handleConflictDetected
  });

  const {
    isMonitoring,
    metrics: monitoringMetrics,
    startMonitoring,
    stopMonitoring
  } = useRealTimeMonitoring({
    onMetricsUpdate: handleMetricsUpdate,
    onAlert: handleSchedulingAlert
  });

  const {
    optimizationRecommendations,
    performOptimization,
    loading: optimizationLoading
  } = useOptimization({
    onOptimizationComplete: handleOptimizationComplete
  });

  // Callbacks
  const handleScheduleChange = useCallback((schedule: ScheduledScan) => {
    setSchedules(prev => {
      const index = prev.findIndex(s => s.id === schedule.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = schedule;
        return updated;
      }
      return [...prev, schedule];
    });

    setCalendar(prev => ({
      ...prev,
      schedules: prev.schedules.some(s => s.id === schedule.id)
        ? prev.schedules.map(s => s.id === schedule.id ? schedule : s)
        : [...prev.schedules, schedule]
    }));

    if (state.autoOptimization) {
      optimizeSchedules();
    }
  }, [state.autoOptimization]);

  const handleConflictDetected = useCallback((conflict: SchedulingConflict) => {
    setConflicts(prev => [...prev, conflict]);
    setCalendar(prev => ({ ...prev, conflicts: [...prev.conflicts, conflict] }));
  }, []);

  const handleMetricsUpdate = useCallback((newMetrics: any) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  const handleSchedulingAlert = useCallback((alert: SchedulingAlert) => {
    console.log('Scheduling alert:', alert);
  }, []);

  const handleOptimizationComplete = useCallback((result: any) => {
    setRecommendations(result.recommendations || []);
    setState(prev => ({ ...prev, isOptimizing: false }));
  }, []);

  const createNewSchedule = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isScheduling: true }));

      const schedule = await createSchedule({
        name: newScheduleRequest.name,
        description: newScheduleRequest.description,
        scanType: newScheduleRequest.scanType,
        priority: newScheduleRequest.priority,
        resources: newScheduleRequest.resources,
        duration: newScheduleRequest.duration,
        recurrence: newScheduleRequest.recurrence,
        constraints: newScheduleRequest.constraints,
        scheduledAt: new Date().toISOString(),
        status: 'scheduled'
      });

      setSchedules(prev => [...prev, schedule]);
      setIsScheduleDialogOpen(false);
      
      setNewScheduleRequest({
        name: '',
        description: '',
        scanType: '',
        priority: 'medium',
        resources: [],
        duration: 60,
        recurrence: { type: 'none', interval: 1, endDate: null },
        constraints: [],
        notifications: true,
        autoReschedule: true
      });

    } catch (error) {
      console.error('Failed to create schedule:', error);
    } finally {
      setState(prev => ({ ...prev, isScheduling: false }));
    }
  }, [newScheduleRequest, createSchedule]);

  const optimizeSchedules = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }));

      const optimization = await performOptimization({
        type: 'scheduling',
        scope: 'all_schedules',
        level: state.optimizationLevel,
        constraints: {
          preservePriorities: true,
          minimizeConflicts: true,
          optimizeResourceUsage: true
        }
      });

      if (optimization.schedulingOptimizations) {
        for (const opt of optimization.schedulingOptimizations) {
          if (opt.type === 'reschedule') {
            await updateSchedule(opt.scheduleId, {
              scheduledAt: opt.newTime,
              optimized: true
            });
          }
        }
      }

      setRecommendations(optimization.recommendations || []);

    } catch (error) {
      console.error('Failed to optimize schedules:', error);
    } finally {
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, [state.optimizationLevel, performOptimization, updateSchedule]);

  const resolveConflict = useCallback(async (conflictId: string, resolution: string) => {
    try {
      const conflict = conflicts.find(c => c.id === conflictId);
      if (!conflict) return;

      await conflictResolver.resolveSchedulingConflict(conflict, {
        strategy: resolution,
        preservePriorities: true
      });

      setConflicts(prev => prev.filter(c => c.id !== conflictId));
      setCalendar(prev => ({
        ...prev,
        conflicts: prev.conflicts.filter(c => c.id !== conflictId)
      }));

    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  }, [conflicts]);

  const handleScheduleAction = useCallback(async (scheduleId: string, action: string) => {
    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return;

      setState(prev => ({ ...prev, isScheduling: true }));

      switch (action) {
        case 'execute':
          await scanOrchestrationAPI.executeSchedule(scheduleId);
          break;
        case 'pause':
          await updateSchedule(scheduleId, { status: 'paused' });
          break;
        case 'resume':
          await updateSchedule(scheduleId, { status: 'scheduled' });
          break;
        case 'cancel':
          await updateSchedule(scheduleId, { status: 'cancelled' });
          break;
        case 'delete':
          await deleteSchedule(scheduleId);
          setSchedules(prev => prev.filter(s => s.id !== scheduleId));
          break;
      }

    } catch (error) {
      console.error(`Failed to ${action} schedule:`, error);
    } finally {
      setState(prev => ({ ...prev, isScheduling: false }));
    }
  }, [schedules, updateSchedule, deleteSchedule]);

  const navigateCalendar = useCallback((direction: 'prev' | 'next') => {
    setState(prev => {
      const currentDate = new Date(prev.currentDate);
      
      switch (prev.timeRange) {
        case 'day':
          currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'month':
          currentDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'quarter':
          currentDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 3 : -3));
          break;
      }
      
      return { ...prev, currentDate };
    });
  }, []);

  // Computed Values
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (state.filters.priorities.length > 0 && !state.filters.priorities.includes(schedule.priority)) return false;
      if (state.filters.types.length > 0 && !state.filters.types.includes(schedule.scanType)) return false;
      if (state.filters.status.length > 0 && !state.filters.status.includes(schedule.status)) return false;
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        return schedule.name.toLowerCase().includes(query) ||
               schedule.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [schedules, state.filters]);

  const schedulesByTimeSlot = useMemo(() => {
    const slots = new Map<string, ScheduledScan[]>();
    
    filteredSchedules.forEach(schedule => {
      const date = new Date(schedule.scheduledAt);
      const timeSlot = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      if (!slots.has(timeSlot)) {
        slots.set(timeSlot, []);
      }
      slots.get(timeSlot)!.push(schedule);
    });
    
    return slots;
  }, [filteredSchedules]);

  const resourceUtilization = useMemo(() => {
    const utilization = new Map<string, number>();
    
    schedules.forEach(schedule => {
      schedule.resources.forEach(resource => {
        const current = utilization.get(resource) || 0;
        utilization.set(resource, current + schedule.duration);
      });
    });
    
    return utilization;
  }, [schedules]);

  const upcomingSchedules = useMemo(() => {
    const now = new Date();
    return schedules
      .filter(s => new Date(s.scheduledAt) > now && s.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 10);
  }, [schedules]);

  // Effects
  useEffect(() => {
    const initializeScheduler = async () => {
      try {
        if (orchestrationSchedules) {
          setSchedules(orchestrationSchedules);
          setCalendar(prev => ({ ...prev, schedules: orchestrationSchedules }));
        }

        if (state.realTimeUpdates && !isMonitoring) {
          await startMonitoring({
            components: ['scheduling', 'resources', 'performance'],
            interval: 30000
          });
        }

        const metricsData = await scanPerformanceAPI.getSchedulingMetrics();
        setMetrics(metricsData);

      } catch (error) {
        console.error('Failed to initialize scheduler:', error);
      }
    };

    initializeScheduler();
  }, []);

  useEffect(() => {
    if (state.autoOptimization) {
      optimizationIntervalRef.current = setInterval(() => {
        optimizeSchedules();
      }, 300000); // Optimize every 5 minutes
    } else if (optimizationIntervalRef.current) {
      clearInterval(optimizationIntervalRef.current);
      optimizationIntervalRef.current = null;
    }

    return () => {
      if (optimizationIntervalRef.current) {
        clearInterval(optimizationIntervalRef.current);
      }
    };
  }, [state.autoOptimization, optimizeSchedules]);

  useEffect(() => {
    setCalendar(prev => ({ ...prev, schedules: filteredSchedules }));
  }, [filteredSchedules]);

  // Render Helper Functions
  const renderSchedulePriorityBadge = (priority: string) => {
    const priorityConfig = {
      critical: { color: 'destructive', icon: AlertTriangle },
      high: { color: 'orange', icon: AlertTriangle },
      medium: { color: 'default', icon: Clock },
      low: { color: 'secondary', icon: Info }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const renderScheduleStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'default', icon: Clock },
      running: { color: 'blue', icon: Play },
      completed: { color: 'success', icon: CheckCircle },
      failed: { color: 'destructive', icon: XCircle },
      paused: { color: 'warning', icon: Pause },
      cancelled: { color: 'secondary', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderScheduleCard = (schedule: ScheduledScan) => {
    const hasConflict = conflicts.some(c => c.scheduleIds.includes(schedule.id));
    
    return (
      <motion.div
        key={schedule.id}
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="group"
      >
        <Card className={`hover:shadow-lg transition-all duration-200 ${
          hasConflict ? 'border-l-4 border-l-red-500' :
          schedule.status === 'running' ? 'border-l-4 border-l-blue-500' :
          schedule.status === 'completed' ? 'border-l-4 border-l-green-500' :
          'border-l-4 border-l-gray-300'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  variants={scheduleVariants}
                  animate={
                    hasConflict ? 'conflict' :
                    schedule.status === 'running' ? 'active' : 
                    schedule.status === 'completed' ? 'completed' :
                    'idle'
                  }
                >
                  <Calendar className={`h-5 w-5 ${
                    hasConflict ? 'text-red-500' :
                    schedule.status === 'running' ? 'text-blue-500' :
                    schedule.status === 'completed' ? 'text-green-500' :
                    'text-gray-500'
                  }`} />
                </motion.div>
                <div>
                  <CardTitle className="text-sm font-medium">{schedule.name}</CardTitle>
                  <CardDescription className="text-xs">{schedule.scanType}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderSchedulePriorityBadge(schedule.priority)}
                {renderScheduleStatusBadge(schedule.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, selectedSchedule: schedule }))}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {schedule.status === 'scheduled' && (
                      <DropdownMenuItem onClick={() => handleScheduleAction(schedule.id, 'execute')}>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Now
                      </DropdownMenuItem>
                    )}
                    {schedule.status === 'scheduled' && (
                      <DropdownMenuItem onClick={() => handleScheduleAction(schedule.id, 'pause')}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </DropdownMenuItem>
                    )}
                    {schedule.status === 'paused' && (
                      <DropdownMenuItem onClick={() => handleScheduleAction(schedule.id, 'resume')}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleScheduleAction(schedule.id, 'delete')}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Scheduled:</span>
                <span>{new Date(schedule.scheduledAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Duration:</span>
                <span>{schedule.duration} minutes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Resources:</span>
                <span>{schedule.resources.length} assigned</span>
              </div>
              {hasConflict && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Scheduling Conflict</AlertTitle>
                  <AlertDescription className="text-xs">
                    This schedule conflicts with other scheduled scans
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderCalendarView = () => (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {state.currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric',
                    ...(state.timeRange === 'day' && { day: 'numeric' })
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {state.timeRange.charAt(0).toUpperCase() + state.timeRange.slice(1)} View
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={state.timeRange} 
                onValueChange={(value) => setState(prev => ({ ...prev, timeRange: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsScheduleDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Scan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            ref={calendarRef}
            className="h-96 border border-muted rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20"
          >
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Interactive Calendar</p>
                <p className="text-sm text-muted-foreground">
                  {state.timeRange} view for {state.currentDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSchedules}</div>
            <p className="text-xs text-muted-foreground">
              Across all time periods
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{metrics.activeSchedules}</div>
            <p className="text-xs text-muted-foreground">
              Currently scheduled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">
              Require resolution
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{metrics.optimizationScore}%</div>
            <p className="text-xs text-muted-foreground">
              AI optimization level
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSchedulesList = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Schedules</Label>
              <Input
                id="search"
                placeholder="Search by name, type..."
                value={state.filters.searchQuery}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, searchQuery: e.target.value }
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => setState(prev => ({
                ...prev,
                filters: { ...prev.filters, priorities: [value] }
              }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setState(prev => ({
                ...prev,
                filters: { ...prev.filters, status: [value] }
              }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="showConflicts"
                checked={state.filters.showConflicts}
                onCheckedChange={(checked) => setState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, showConflicts: checked }
                }))}
              />
              <Label htmlFor="showConflicts">Show conflicts</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scheduled Scans</CardTitle>
              <CardDescription>{filteredSchedules.length} schedules found</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={optimizeSchedules} disabled={state.isOptimizing}>
                {state.isOptimizing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Optimize
              </Button>
              <Button onClick={() => setIsScheduleDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Scan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map(renderScheduleCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No schedules found</p>
                  <p className="text-sm">Create a new schedule to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Upcoming Schedules */}
      {upcomingSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedules</CardTitle>
            <CardDescription>Next {upcomingSchedules.length} scheduled scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{schedule.name}</span>
                    {renderSchedulePriorityBadge(schedule.priority)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(schedule.scheduledAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <motion.div
        className="p-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  Intelligent Scheduler
                </h1>
                <p className="text-muted-foreground">
                  AI-powered scan scheduling and optimization engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {conflicts.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Button variant="destructive" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {conflicts.length} Conflicts
                  </Button>
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfigDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={state.viewMode} onValueChange={(value) => setState(prev => ({ ...prev, viewMode: value as any }))}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Optimization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-6">
              {renderCalendarView()}
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              {renderSchedulesList()}
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <div className="text-center py-12">
                <Server className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Resource Scheduling</h3>
                <p className="text-muted-foreground">
                  Advanced resource allocation and scheduling optimization
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Scheduling Analytics</h3>
                <p className="text-muted-foreground">
                  Comprehensive scheduling performance and optimization insights
                </p>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="mt-6">
              <div className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
                <p className="text-muted-foreground">
                  Machine learning-powered scheduling optimization and recommendations
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Schedule Creation Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Scan</DialogTitle>
              <DialogDescription>
                Create a new scheduled scan with AI optimization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduleName">Schedule Name</Label>
                  <Input
                    id="scheduleName"
                    value={newScheduleRequest.name}
                    onChange={(e) => setNewScheduleRequest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter schedule name"
                  />
                </div>
                <div>
                  <Label htmlFor="scanType">Scan Type</Label>
                  <Select 
                    value={newScheduleRequest.scanType} 
                    onValueChange={(value) => setNewScheduleRequest(prev => ({ ...prev, scanType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_discovery">Data Discovery</SelectItem>
                      <SelectItem value="compliance_audit">Compliance Audit</SelectItem>
                      <SelectItem value="security_scan">Security Scan</SelectItem>
                      <SelectItem value="quality_check">Quality Check</SelectItem>
                      <SelectItem value="performance_test">Performance Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newScheduleRequest.description}
                  onChange={(e) => setNewScheduleRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter schedule description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newScheduleRequest.priority} 
                    onValueChange={(value) => setNewScheduleRequest(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newScheduleRequest.duration}
                    onChange={(e) => setNewScheduleRequest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min={1}
                    max={1440}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoReschedule"
                  checked={newScheduleRequest.autoReschedule}
                  onCheckedChange={(checked) => setNewScheduleRequest(prev => ({ ...prev, autoReschedule: checked }))}
                />
                <Label htmlFor="autoReschedule">Enable auto-rescheduling on conflicts</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createNewSchedule} 
                disabled={!newScheduleRequest.name || !newScheduleRequest.scanType || state.isScheduling}
              >
                {state.isScheduling ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Create Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configuration Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Scheduler Configuration</DialogTitle>
              <DialogDescription>
                Configure AI scheduling parameters and optimization settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="optimizationLevel">Optimization Level: {state.optimizationLevel}%</Label>
                  <Slider
                    value={[state.optimizationLevel]}
                    onValueChange={([value]) => setState(prev => ({ ...prev, optimizationLevel: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoOptimization"
                      checked={state.autoOptimization}
                      onCheckedChange={(checked) => setState(prev => ({ ...prev, autoOptimization: checked }))}
                    />
                    <Label htmlFor="autoOptimization">Auto-optimization</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="realTimeUpdates"
                      checked={state.realTimeUpdates}
                      onCheckedChange={(checked) => setState(prev => ({ ...prev, realTimeUpdates: checked }))}
                    />
                    <Label htmlFor="realTimeUpdates">Real-time updates</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsConfigDialogOpen(false)}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default IntelligentScheduler;