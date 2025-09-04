import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Play, Pause, Square, Settings, RefreshCw, Plus, Edit, Trash2, Copy, Eye, Filter, Search, MoreHorizontal, CheckCircle2, XCircle, AlertTriangle, Timer, Activity, Target, Zap, Database, Server, Cpu, HardDrive, Network, BarChart3, TrendingUp, TrendingDown, PieChart, Gauge, Layers, GitBranch, Users, Shield, Sparkles, Brain, Robot, Lightbulb, Command } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";

// Custom Hooks
import { useOrchestration } from '../../hooks/useOrchestration';
import { useScanRules } from '../../hooks/useScanRules';
import { useIntelligence } from '../../hooks/useIntelligence';

// API Services
import { orchestrationAPI } from '../../services/orchestration-apis';
import { intelligenceAPI } from '../../services/intelligence-apis';

// Types
import type { 
  ScheduleConfig,
  ScheduledJob,
  ScheduleRule,
  ResourceSchedule,
  ScheduleOptimization,
  ScheduleConflict,
  ScheduleMetrics,
  CronExpression,
  ScheduleTrigger,
  ScheduleDependency,
  ScheduleHistory,
  ScheduleEvent,
  ResourceWindow,
  SchedulePriority,
  ScheduleStatus,
  OptimizationStrategy
} from '../../types/orchestration.types';

// Utilities
import { workflowEngine } from '../../utils/workflow-engine';
import { performanceCalculator } from '../../utils/performance-calculator';
import { aiHelpers } from '../../utils/ai-helpers';

interface SchedulingEngineProps {
  className?: string;
  onScheduleCreated?: (schedule: ScheduledJob) => void;
  onScheduleExecuted?: (schedule: ScheduledJob) => void;
  onConflictDetected?: (conflict: ScheduleConflict) => void;
}

interface SchedulingState {
  schedules: ScheduledJob[];
  activeSchedules: ScheduledJob[];
  conflicts: ScheduleConflict[];
  metrics: ScheduleMetrics;
  events: ScheduleEvent[];
  history: ScheduleHistory[];
  optimizations: ScheduleOptimization[];
  resourceWindows: ResourceWindow[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  systemLoad: number;
  nextExecution: Date | null;
  totalSchedules: number;
  activeSchedulesCount: number;
  completedToday: number;
  failedToday: number;
  averageExecutionTime: number;
  resourceUtilization: number;
  conflictRate: number;
  optimizationScore: number;
}

interface SchedulingViewState {
  currentView: 'overview' | 'schedules' | 'calendar' | 'conflicts' | 'optimization' | 'history';
  selectedSchedule?: ScheduledJob;
  selectedDate: Date;
  calendarView: 'month' | 'week' | 'day';
  showConflicts: boolean;
  showOptimizations: boolean;
  filterStatus: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  autoOptimize: boolean;
  smartScheduling: boolean;
  realTimeMode: boolean;
  expertMode: boolean;
  selectedTimeRange: 'today' | 'week' | 'month' | 'quarter';
}

const DEFAULT_VIEW_STATE: SchedulingViewState = {
  currentView: 'overview',
  selectedDate: new Date(),
  calendarView: 'month',
  showConflicts: true,
  showOptimizations: true,
  filterStatus: 'all',
  searchQuery: '',
  sortBy: 'next_execution',
  sortOrder: 'asc',
  autoOptimize: true,
  smartScheduling: true,
  realTimeMode: true,
  expertMode: false,
  selectedTimeRange: 'week'
};

const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 2 hours', value: '0 */2 * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 */12 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 6 AM', value: '0 6 * * *' },
  { label: 'Daily at noon', value: '0 12 * * *' },
  { label: 'Daily at 6 PM', value: '0 18 * * *' },
  { label: 'Weekly (Monday)', value: '0 0 * * 1' },
  { label: 'Weekly (Sunday)', value: '0 0 * * 0' },
  { label: 'Monthly (1st)', value: '0 0 1 * *' },
  { label: 'Quarterly', value: '0 0 1 */3 *' },
  { label: 'Yearly', value: '0 0 1 1 *' }
];

export const SchedulingEngine: React.FC<SchedulingEngineProps> = ({
  className,
  onScheduleCreated,
  onScheduleExecuted,
  onConflictDetected
}) => {
  // State Management
  const [viewState, setViewState] = useState<SchedulingViewState>(DEFAULT_VIEW_STATE);
  const [schedulingState, setSchedulingState] = useState<SchedulingState>({
    schedules: [],
    activeSchedules: [],
    conflicts: [],
    metrics: {} as ScheduleMetrics,
    events: [],
    history: [],
    optimizations: [],
    resourceWindows: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    systemLoad: 0,
    nextExecution: null,
    totalSchedules: 0,
    activeSchedulesCount: 0,
    completedToday: 0,
    failedToday: 0,
    averageExecutionTime: 0,
    resourceUtilization: 0,
    conflictRate: 0,
    optimizationScore: 0
  });

  const [newScheduleDialogOpen, setNewScheduleDialogOpen] = useState(false);
  const [editScheduleDialogOpen, setEditScheduleDialogOpen] = useState(false);
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  // Form States
  const [newScheduleForm, setNewScheduleForm] = useState({
    name: '',
    description: '',
    cronExpression: '',
    jobId: '',
    priority: 'medium' as SchedulePriority,
    enabled: true,
    resourceRequirements: {
      cpu: 1,
      memory: 512,
      storage: 1024
    },
    dependencies: [] as string[],
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 300
    },
    notifications: {
      onSuccess: false,
      onFailure: true,
      onDelay: true
    }
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const optimizationIntervalRef = useRef<NodeJS.Timeout>();

  // Custom Hooks
  const {
    orchestrationJobs,
    executions,
    resourceAllocations,
    getMetrics,
    loading: orchestrationLoading
  } = useOrchestration();

  const {
    scanRules,
    ruleSets,
    loading: rulesLoading
  } = useScanRules();

  const {
    getInsights,
    analyzePerformance,
    predictOptimizations,
    loading: intelligenceLoading
  } = useIntelligence();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMode) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/scheduling`);
      
      wsRef.current.onopen = () => {
        console.log('Scheduling WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Scheduling WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Scheduling WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.realTimeMode]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'schedule_created':
        setSchedulingState(prev => ({
          ...prev,
          schedules: [...prev.schedules, data.schedule],
          totalSchedules: prev.totalSchedules + 1
        }));
        if (onScheduleCreated) onScheduleCreated(data.schedule);
        break;
      case 'schedule_executed':
        setSchedulingState(prev => ({
          ...prev,
          events: [...prev.events, data.event],
          completedToday: prev.completedToday + 1
        }));
        if (onScheduleExecuted) onScheduleExecuted(data.schedule);
        break;
      case 'schedule_failed':
        setSchedulingState(prev => ({
          ...prev,
          events: [...prev.events, data.event],
          failedToday: prev.failedToday + 1
        }));
        break;
      case 'conflict_detected':
        setSchedulingState(prev => ({
          ...prev,
          conflicts: [...prev.conflicts, data.conflict]
        }));
        if (onConflictDetected) onConflictDetected(data.conflict);
        break;
      case 'optimization_suggested':
        setSchedulingState(prev => ({
          ...prev,
          optimizations: [...prev.optimizations, data.optimization]
        }));
        break;
      case 'metrics_updated':
        setSchedulingState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onScheduleCreated, onScheduleExecuted, onConflictDetected]);

  // Auto-optimization Logic
  useEffect(() => {
    if (viewState.autoOptimize) {
      optimizationIntervalRef.current = setInterval(() => {
        performAutoOptimization();
      }, 60000); // Every minute
    }

    return () => {
      if (optimizationIntervalRef.current) {
        clearInterval(optimizationIntervalRef.current);
      }
    };
  }, [viewState.autoOptimize]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setSchedulingState(prev => ({ ...prev, loading: true, error: null }));

      const [schedulesData, conflictsData, metricsData, historyData] = await Promise.all([
        orchestrationAPI.getSchedules({ 
          status: viewState.filterStatus !== 'all' ? viewState.filterStatus : undefined,
          search: viewState.searchQuery || undefined
        }),
        orchestrationAPI.getScheduleConflicts(),
        orchestrationAPI.getScheduleMetrics(),
        orchestrationAPI.getScheduleHistory({ limit: 100 })
      ]);

      setSchedulingState(prev => ({
        ...prev,
        schedules: schedulesData.schedules,
        conflicts: conflictsData.conflicts,
        metrics: metricsData,
        history: historyData.history,
        totalSchedules: schedulesData.total,
        activeSchedulesCount: schedulesData.schedules.filter(s => s.enabled).length,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Failed to refresh scheduling data:', error);
      setSchedulingState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.filterStatus, viewState.searchQuery]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Schedule Management Functions
  const handleCreateSchedule = useCallback(async () => {
    try {
      const newSchedule = await orchestrationAPI.createSchedule(newScheduleForm);
      setSchedulingState(prev => ({
        ...prev,
        schedules: [...prev.schedules, newSchedule],
        totalSchedules: prev.totalSchedules + 1
      }));
      if (onScheduleCreated) onScheduleCreated(newSchedule);
      setNewScheduleDialogOpen(false);
      resetNewScheduleForm();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  }, [newScheduleForm, onScheduleCreated]);

  const handleUpdateSchedule = useCallback(async (schedule: ScheduledJob, updates: Partial<ScheduledJob>) => {
    try {
      const updatedSchedule = await orchestrationAPI.updateSchedule(schedule.id, updates);
      setSchedulingState(prev => ({
        ...prev,
        schedules: prev.schedules.map(s => s.id === schedule.id ? updatedSchedule : s)
      }));
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  }, []);

  const handleDeleteSchedule = useCallback(async (scheduleId: string) => {
    try {
      await orchestrationAPI.deleteSchedule(scheduleId);
      setSchedulingState(prev => ({
        ...prev,
        schedules: prev.schedules.filter(s => s.id !== scheduleId),
        totalSchedules: prev.totalSchedules - 1
      }));
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  }, []);

  const handleToggleSchedule = useCallback(async (schedule: ScheduledJob) => {
    await handleUpdateSchedule(schedule, { enabled: !schedule.enabled });
  }, [handleUpdateSchedule]);

  // Optimization Functions
  const performAutoOptimization = useCallback(async () => {
    try {
      const optimizationResult = await intelligenceAPI.optimizeSchedules({
        schedules: schedulingState.schedules,
        resourceWindows: schedulingState.resourceWindows,
        strategy: 'balanced' as OptimizationStrategy
      });

      setSchedulingState(prev => ({
        ...prev,
        optimizations: [...prev.optimizations, ...optimizationResult.suggestions],
        optimizationScore: optimizationResult.score
      }));
    } catch (error) {
      console.error('Auto-optimization failed:', error);
    }
  }, [schedulingState.schedules, schedulingState.resourceWindows]);

  const detectConflicts = useCallback(async () => {
    try {
      const conflicts = await orchestrationAPI.detectScheduleConflicts();
      setSchedulingState(prev => ({
        ...prev,
        conflicts: conflicts,
        conflictRate: (conflicts.length / prev.totalSchedules) * 100
      }));
    } catch (error) {
      console.error('Conflict detection failed:', error);
    }
  }, []);

  // Utility Functions
  const resetNewScheduleForm = useCallback(() => {
    setNewScheduleForm({
      name: '',
      description: '',
      cronExpression: '',
      jobId: '',
      priority: 'medium',
      enabled: true,
      resourceRequirements: {
        cpu: 1,
        memory: 512,
        storage: 1024
      },
      dependencies: [],
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 300
      },
      notifications: {
        onSuccess: false,
        onFailure: true,
        onDelay: true
      }
    });
  }, []);

  const getStatusColor = useCallback((status: ScheduleStatus) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'pending': return 'text-blue-600';
      case 'paused': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  }, []);

  const getStatusIcon = useCallback((status: ScheduleStatus) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  }, []);

  const getPriorityColor = useCallback((priority: SchedulePriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatCronExpression = useCallback((cron: string) => {
    const preset = CRON_PRESETS.find(p => p.value === cron);
    return preset ? preset.label : cron;
  }, []);

  const getNextExecutionTime = useCallback((schedule: ScheduledJob) => {
    try {
      // This would use a cron parser library in real implementation
      return new Date(Date.now() + 3600000); // Placeholder: 1 hour from now
    } catch {
      return null;
    }
  }, []);

  // Filter and Search Functions
  const filteredSchedules = useMemo(() => {
    let filtered = schedulingState.schedules;

    if (viewState.searchQuery) {
      filtered = filtered.filter(schedule => 
        schedule.name.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        schedule.description?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.filterStatus !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === viewState.filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'next_execution':
          aValue = getNextExecutionTime(a)?.getTime() || 0;
          bValue = getNextExecutionTime(b)?.getTime() || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [schedulingState.schedules, viewState.searchQuery, viewState.filterStatus, viewState.sortBy, viewState.sortOrder, getNextExecutionTime]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedulingState.totalSchedules}</div>
            <p className="text-xs text-muted-foreground">
              {schedulingState.activeSchedulesCount} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{schedulingState.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              {schedulingState.failedToday} failed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedulingState.systemLoad}%</div>
            <Progress value={schedulingState.systemLoad} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedulingState.optimizationScore}/100</div>
            <p className="text-xs text-muted-foreground">
              {schedulingState.conflicts.length} conflicts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Conflicts */}
      {schedulingState.conflicts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Schedule Conflicts Detected ({schedulingState.conflicts.length})</AlertTitle>
          <AlertDescription>
            {schedulingState.conflicts.slice(0, 3).map(conflict => conflict.description).join(', ')}
            {schedulingState.conflicts.length > 3 && ` and ${schedulingState.conflicts.length - 3} more...`}
          </AlertDescription>
        </Alert>
      )}

      {/* Upcoming Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSchedules
              .filter(schedule => schedule.enabled)
              .slice(0, 5)
              .map(schedule => {
                const nextExecution = getNextExecutionTime(schedule);
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(schedule.status)}
                      <div>
                        <div className="font-medium">{schedule.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatCronExpression(schedule.cronExpression)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {nextExecution 
                          ? nextExecution.toLocaleTimeString()
                          : 'Not scheduled'
                        }
                      </div>
                      <Badge className={getPriorityColor(schedule.priority)}>
                        {schedule.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {schedulingState.events.slice(0, 20).map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="flex-1">{event.message}</div>
                  <div className="text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderSchedules = () => (
    <div className="space-y-6">
      {/* Schedule Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <p className="text-gray-600">Create and manage automated schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => detectConflicts()}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Detect Conflicts
          </Button>
          <Button
            size="sm"
            onClick={() => setNewScheduleDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search schedules..."
              value={viewState.searchQuery}
              onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={viewState.filterStatus}
          onValueChange={(value) => setViewState(prev => ({ ...prev, filterStatus: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={viewState.sortBy}
          onValueChange={(value) => setViewState(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="next_execution">Next Execution</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Schedules Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Next Execution</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.map(schedule => {
              const nextExecution = getNextExecutionTime(schedule);
              return (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(schedule.status)}
                      <div>
                        <div className="font-medium">{schedule.name}</div>
                        <div className="text-sm text-gray-500">{schedule.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                      {schedule.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatCronExpression(schedule.cronExpression)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(schedule.priority)}>
                      {schedule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {nextExecution 
                        ? nextExecution.toLocaleString()
                        : 'Not scheduled'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSchedule(schedule)}
                            >
                              {schedule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {schedule.enabled ? 'Pause' : 'Resume'} Schedule
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setViewState(prev => ({ ...prev, selectedSchedule: schedule }));
                                setEditScheduleDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Schedule</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Scheduling Engine</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  schedulingState.systemLoad < 70 ? 'bg-green-500' :
                  schedulingState.systemLoad < 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  System Load: {schedulingState.systemLoad}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={schedulingState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${schedulingState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOptimizationDialogOpen(true)}
              >
                <Target className="h-4 w-4 mr-2" />
                Optimize
              </Button>
              <Switch
                checked={viewState.autoOptimize}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, autoOptimize: checked }))}
              />
              <span className="text-sm text-gray-600">Auto-optimize</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Navigation Tabs */}
          <div className="flex-1">
            <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
              <div className="border-b bg-white">
                <TabsList className="h-12 p-1 bg-transparent">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="schedules" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedules
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </TabsTrigger>
                  <TabsTrigger value="conflicts" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Conflicts
                  </TabsTrigger>
                  <TabsTrigger value="optimization" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Optimization
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="overview">
                  {renderOverview()}
                </TabsContent>
                <TabsContent value="schedules">
                  {renderSchedules()}
                </TabsContent>
                <TabsContent value="calendar">
                  <div>Calendar View (To be implemented)</div>
                </TabsContent>
                <TabsContent value="conflicts">
                  <div>Conflict Management (To be implemented)</div>
                </TabsContent>
                <TabsContent value="optimization">
                  <div>Optimization Dashboard (To be implemented)</div>
                </TabsContent>
                <TabsContent value="history">
                  <div>Execution History (To be implemented)</div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* New Schedule Dialog */}
        <Dialog open={newScheduleDialogOpen} onOpenChange={setNewScheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Configure a new automated schedule for job execution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule-name">Schedule Name</Label>
                  <Input 
                    id="schedule-name" 
                    value={newScheduleForm.name}
                    onChange={(e) => setNewScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter schedule name" 
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-priority">Priority</Label>
                  <Select 
                    value={newScheduleForm.priority} 
                    onValueChange={(value) => setNewScheduleForm(prev => ({ ...prev, priority: value as SchedulePriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="schedule-description">Description</Label>
                <Textarea 
                  id="schedule-description" 
                  value={newScheduleForm.description}
                  onChange={(e) => setNewScheduleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter schedule description" 
                />
              </div>
              <div>
                <Label htmlFor="cron-expression">Cron Expression</Label>
                <div className="flex gap-2">
                  <Input 
                    id="cron-expression" 
                    value={newScheduleForm.cronExpression}
                    onChange={(e) => setNewScheduleForm(prev => ({ ...prev, cronExpression: e.target.value }))}
                    placeholder="* * * * *" 
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Presets</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {CRON_PRESETS.map(preset => (
                        <DropdownMenuItem 
                          key={preset.value}
                          onClick={() => setNewScheduleForm(prev => ({ ...prev, cronExpression: preset.value }))}
                        >
                          {preset.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="schedule-enabled" 
                  checked={newScheduleForm.enabled}
                  onCheckedChange={(checked) => setNewScheduleForm(prev => ({ ...prev, enabled: checked as boolean }))}
                />
                <Label htmlFor="schedule-enabled">Enable schedule immediately</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSchedule}>
                  Create Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default SchedulingEngine;