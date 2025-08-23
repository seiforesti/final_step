/**
 * ⚡ ExecutionPipeline.tsx - Advanced Pipeline Execution & Management Engine
 * =========================================================================
 * 
 * Enterprise-grade execution pipeline system for orchestrating complex
 * scanning workflows with real-time monitoring, automated error handling,
 * and intelligent performance optimization. Features DAG-based execution,
 * parallel processing, and comprehensive failure recovery mechanisms.
 * 
 * Features:
 * - DAG-based pipeline execution with dependency management
 * - Real-time execution monitoring and progress tracking
 * - Parallel processing with intelligent load balancing
 * - Automated error handling and recovery mechanisms
 * - Dynamic pipeline optimization and resource allocation
 * - Comprehensive logging and audit trails
 * - Interactive pipeline visualization and debugging
 * - Performance analytics and bottleneck detection
 * 
 * @author Enterprise Pipeline Team
 * @version 2.0.0 - Production Ready
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Activity, Zap, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Settings, RefreshCw, Search, Filter, Download, Upload, Plus, Minus, X, Eye, MoreVertical, BarChart3, LineChart, PieChart, Users, User, Building, Globe, Map, Route, Navigation, Layers, Grid, List, Maximize, Minimize, Info, AlertCircle, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, GitBranch, Workflow, Link, ExternalLink, FileText, FolderOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

import { useScanOrchestration } from '../../hooks/useScanOrchestration';
import { useWorkflowManagement } from '../../hooks/useWorkflowManagement';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { scanOrchestrationAPI } from '../../services/scan-orchestration-apis';
import { scanWorkflowAPI } from '../../services/scan-workflow-apis';

import {
  PipelineExecution,
  PipelineStep,
  PipelineStage,
  ExecutionStatus,
  ExecutionMetrics,
  PipelineConfiguration,
  ExecutionContext,
  PipelineError,
  ExecutionLog,
  ParallelExecution,
  DependencyGraph,
  ResourceRequirement,
  ExecutionResult
} from '../../types/orchestration.types';

import { 
  PIPELINE_CONFIGS,
  EXECUTION_STRATEGIES,
  ERROR_HANDLING_POLICIES
} from '../../constants/orchestration-configs';

import { 
  pipelineExecutor,
  dependencyResolver,
  errorHandler,
  performanceOptimizer
} from '../../utils/workflow-executor';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const pipelineVariants = {
  idle: { 
    scale: 1, 
    opacity: 0.8,
    backgroundColor: '#f3f4f6'
  },
  running: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    backgroundColor: ['#3b82f6', '#1d4ed8', '#3b82f6'],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  completed: {
    scale: 1,
    opacity: 1,
    backgroundColor: '#10b981'
  },
  failed: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    backgroundColor: ['#ef4444', '#dc2626', '#ef4444'],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  }
};

// Reducer for pipeline state management
interface PipelineState {
  executions: PipelineExecution[];
  activeExecutions: PipelineExecution[];
  completedExecutions: PipelineExecution[];
  failedExecutions: PipelineExecution[];
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  errors: PipelineError[];
  isLoading: boolean;
  error: string | null;
}

type PipelineAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXECUTIONS'; payload: PipelineExecution[] }
  | { type: 'ADD_EXECUTION'; payload: PipelineExecution }
  | { type: 'UPDATE_EXECUTION'; payload: { id: string; updates: Partial<PipelineExecution> } }
  | { type: 'REMOVE_EXECUTION'; payload: string }
  | { type: 'SET_METRICS'; payload: ExecutionMetrics }
  | { type: 'ADD_LOG'; payload: ExecutionLog }
  | { type: 'ADD_ERROR'; payload: PipelineError }
  | { type: 'CLEAR_LOGS'; payload: void }
  | { type: 'CLEAR_ERRORS'; payload: void };

const pipelineReducer = (state: PipelineState, action: PipelineAction): PipelineState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EXECUTIONS':
      return {
        ...state,
        executions: action.payload,
        activeExecutions: action.payload.filter(exec => exec.status === 'running'),
        completedExecutions: action.payload.filter(exec => exec.status === 'completed'),
        failedExecutions: action.payload.filter(exec => exec.status === 'failed')
      };
    case 'ADD_EXECUTION':
      const newExecutions = [...state.executions, action.payload];
      return {
        ...state,
        executions: newExecutions,
        activeExecutions: newExecutions.filter(exec => exec.status === 'running')
      };
    case 'UPDATE_EXECUTION':
      const updatedExecutions = state.executions.map(exec =>
        exec.id === action.payload.id ? { ...exec, ...action.payload.updates } : exec
      );
      return {
        ...state,
        executions: updatedExecutions,
        activeExecutions: updatedExecutions.filter(exec => exec.status === 'running'),
        completedExecutions: updatedExecutions.filter(exec => exec.status === 'completed'),
        failedExecutions: updatedExecutions.filter(exec => exec.status === 'failed')
      };
    case 'REMOVE_EXECUTION':
      const filteredExecutions = state.executions.filter(exec => exec.id !== action.payload);
      return {
        ...state,
        executions: filteredExecutions,
        activeExecutions: filteredExecutions.filter(exec => exec.status === 'running'),
        completedExecutions: filteredExecutions.filter(exec => exec.status === 'completed'),
        failedExecutions: filteredExecutions.filter(exec => exec.status === 'failed')
      };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'ADD_LOG':
      return { ...state, logs: [action.payload, ...state.logs.slice(0, 999)] };
    case 'ADD_ERROR':
      return { ...state, errors: [action.payload, ...state.errors] };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    default:
      return state;
  }
};

// Component interfaces
interface ExecutionPipelineState {
  viewMode: 'dashboard' | 'executions' | 'monitoring' | 'logs' | 'analytics';
  selectedExecution: PipelineExecution | null;
  filters: PipelineFilters;
  configuration: PipelineConfiguration;
  autoOptimization: boolean;
  realTimeUpdates: boolean;
}

interface PipelineFilters {
  status: ExecutionStatus[];
  priority: string[];
  types: string[];
  timeRange: string;
  searchQuery: string;
  showErrors: boolean;
  showLogs: boolean;
}

interface PipelineCreationRequest {
  name: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: PipelineStep[];
  configuration: PipelineConfiguration;
  schedule?: string;
  dependencies?: string[];
}

// Main Component
export const ExecutionPipeline: React.FC = () => {
  // State Management
  const [state, dispatch] = useReducer(pipelineReducer, {
    executions: [],
    activeExecutions: [],
    completedExecutions: [],
    failedExecutions: [],
    metrics: {
      totalExecutions: 0,
      activeExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      throughput: 0,
      errorRate: 0,
      resourceUtilization: 0,
      bottleneckSteps: []
    },
    logs: [],
    errors: [],
    isLoading: false,
    error: null
  });

  const [pipelineState, setPipelineState] = useState<ExecutionPipelineState>({
    viewMode: 'dashboard',
    selectedExecution: null,
    filters: {
      status: [],
      priority: [],
      types: [],
      timeRange: '24h',
      searchQuery: '',
      showErrors: true,
      showLogs: true
    },
    configuration: {
      maxConcurrentExecutions: 5,
      retryPolicy: 'exponential_backoff',
      timeoutSeconds: 3600,
      errorHandling: 'continue_on_error',
      resourceLimits: {
        cpu: 80,
        memory: 80,
        storage: 90
      }
    },
    autoOptimization: true,
    realTimeUpdates: true
  });

  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [newPipelineRequest, setNewPipelineRequest] = useState<PipelineCreationRequest>({
    name: '',
    description: '',
    type: '',
    priority: 'medium',
    steps: [],
    configuration: pipelineState.configuration
  });

  // Refs
  const executionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    orchestrationJobs,
    createJob,
    updateJob,
    cancelJob,
    loading: orchestrationLoading
  } = useScanOrchestration({
    autoRefresh: pipelineState.realTimeUpdates,
    refreshInterval: 10000,
    onJobStatusChange: handleExecutionUpdate
  });

  const {
    workflows,
    createWorkflow,
    executeWorkflow,
    loading: workflowLoading
  } = useWorkflowManagement({
    onWorkflowComplete: handleWorkflowComplete,
    onWorkflowError: handleWorkflowError
  });

  const {
    isMonitoring,
    startMonitoring,
    stopMonitoring
  } = useRealTimeMonitoring({
    onMetricsUpdate: handleMetricsUpdate,
    onAlert: handleExecutionAlert
  });

  // Callbacks
  const handleExecutionUpdate = useCallback((execution: any) => {
    dispatch({ type: 'UPDATE_EXECUTION', payload: { id: execution.id, updates: execution } });
    
    // Log execution status change
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: `log-${Date.now()}`,
        executionId: execution.id,
        level: 'info',
        message: `Execution ${execution.name} status changed to ${execution.status}`,
        timestamp: new Date().toISOString(),
        step: execution.currentStep
      }
    });
  }, []);

  const handleWorkflowComplete = useCallback((workflow: any) => {
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: `log-${Date.now()}`,
        executionId: workflow.executionId,
        level: 'success',
        message: `Workflow ${workflow.name} completed successfully`,
        timestamp: new Date().toISOString(),
        step: workflow.finalStep
      }
    });
  }, []);

  const handleWorkflowError = useCallback((error: any) => {
    dispatch({
      type: 'ADD_ERROR',
      payload: {
        id: `error-${Date.now()}`,
        executionId: error.executionId,
        step: error.step,
        type: error.type,
        message: error.message,
        severity: error.severity,
        timestamp: new Date().toISOString(),
        context: error.context
      }
    });
  }, []);

  const handleMetricsUpdate = useCallback((metrics: any) => {
    dispatch({ type: 'SET_METRICS', payload: metrics });
  }, []);

  const handleExecutionAlert = useCallback((alert: any) => {
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: `log-${Date.now()}`,
        executionId: alert.executionId,
        level: 'warning',
        message: alert.message,
        timestamp: new Date().toISOString(),
        step: alert.step
      }
    });
  }, []);

  const createPipeline = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const pipeline = await scanWorkflowAPI.createPipeline({
        name: newPipelineRequest.name,
        description: newPipelineRequest.description,
        type: newPipelineRequest.type,
        priority: newPipelineRequest.priority,
        steps: newPipelineRequest.steps,
        configuration: newPipelineRequest.configuration
      });

      dispatch({ type: 'ADD_EXECUTION', payload: pipeline });
      setIsPipelineDialogOpen(false);
      
      setNewPipelineRequest({
        name: '',
        description: '',
        type: '',
        priority: 'medium',
        steps: [],
        configuration: pipelineState.configuration
      });

    } catch (error) {
      console.error('Failed to create pipeline:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create pipeline' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [newPipelineRequest, pipelineState.configuration]);

  const executePipeline = useCallback(async (pipelineId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const execution = await scanWorkflowAPI.executePipeline(pipelineId, {
        configuration: pipelineState.configuration,
        context: {
          timestamp: new Date().toISOString(),
          user: 'system',
          environment: 'production'
        }
      });

      dispatch({ type: 'UPDATE_EXECUTION', payload: { id: pipelineId, updates: execution } });

    } catch (error) {
      console.error('Failed to execute pipeline:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to execute pipeline' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [pipelineState.configuration]);

  const handleExecutionAction = useCallback(async (executionId: string, action: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      switch (action) {
        case 'start':
          await executePipeline(executionId);
          break;
        case 'pause':
          await scanWorkflowAPI.pauseExecution(executionId);
          break;
        case 'resume':
          await scanWorkflowAPI.resumeExecution(executionId);
          break;
        case 'cancel':
          await scanWorkflowAPI.cancelExecution(executionId);
          break;
        case 'retry':
          await scanWorkflowAPI.retryExecution(executionId);
          break;
        case 'delete':
          await scanWorkflowAPI.deleteExecution(executionId);
          dispatch({ type: 'REMOVE_EXECUTION', payload: executionId });
          break;
      }

    } catch (error) {
      console.error(`Failed to ${action} execution:`, error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to ${action} execution` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [executePipeline]);

  const optimizePipeline = useCallback(async (executionId: string) => {
    try {
      const optimization = await scanWorkflowAPI.optimizeExecution(executionId, {
        strategy: 'performance',
        constraints: pipelineState.configuration.resourceLimits
      });

      dispatch({
        type: 'UPDATE_EXECUTION',
        payload: { id: executionId, updates: optimization.optimizedExecution }
      });

    } catch (error) {
      console.error('Failed to optimize pipeline:', error);
    }
  }, [pipelineState.configuration]);

  // Computed Values
  const filteredExecutions = useMemo(() => {
    return state.executions.filter(execution => {
      if (pipelineState.filters.status.length > 0 && 
          !pipelineState.filters.status.includes(execution.status)) return false;
      if (pipelineState.filters.priority.length > 0 && 
          !pipelineState.filters.priority.includes(execution.priority)) return false;
      if (pipelineState.filters.types.length > 0 && 
          !pipelineState.filters.types.includes(execution.type)) return false;
      if (pipelineState.filters.searchQuery) {
        const query = pipelineState.filters.searchQuery.toLowerCase();
        return execution.name.toLowerCase().includes(query) ||
               execution.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [state.executions, pipelineState.filters]);

  const executionStats = useMemo(() => {
    const total = state.executions.length;
    const running = state.activeExecutions.length;
    const completed = state.completedExecutions.length;
    const failed = state.failedExecutions.length;
    const successRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, running, completed, failed, successRate };
  }, [state.executions, state.activeExecutions, state.completedExecutions, state.failedExecutions]);

  const recentLogs = useMemo(() => {
    return state.logs.slice(0, 50);
  }, [state.logs]);

  const criticalErrors = useMemo(() => {
    return state.errors.filter(error => error.severity === 'critical');
  }, [state.errors]);

  // Effects
  useEffect(() => {
    const initializePipeline = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Load pipeline executions
        const executions = await scanWorkflowAPI.getExecutions();
        dispatch({ type: 'SET_EXECUTIONS', payload: executions });

        // Load execution metrics
        const metrics = await scanWorkflowAPI.getExecutionMetrics();
        dispatch({ type: 'SET_METRICS', payload: metrics });

        // Start real-time monitoring
        if (pipelineState.realTimeUpdates && !isMonitoring) {
          await startMonitoring({
            components: ['executions', 'workflows', 'performance'],
            interval: 10000
          });
        }

      } catch (error) {
        console.error('Failed to initialize pipeline:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize pipeline' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializePipeline();
  }, []);

  useEffect(() => {
    if (pipelineState.autoOptimization) {
      executionIntervalRef.current = setInterval(() => {
        state.activeExecutions.forEach(execution => {
          if (execution.performance && execution.performance.efficiency < 70) {
            optimizePipeline(execution.id);
          }
        });
      }, 60000); // Check every minute
    } else if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
      executionIntervalRef.current = null;
    }

    return () => {
      if (executionIntervalRef.current) {
        clearInterval(executionIntervalRef.current);
      }
    };
  }, [pipelineState.autoOptimization, state.activeExecutions, optimizePipeline]);

  // Render Helper Functions
  const renderExecutionStatusBadge = (status: ExecutionStatus) => {
    const statusConfig = {
      pending: { color: 'secondary', icon: Clock },
      running: { color: 'default', icon: Play },
      completed: { color: 'success', icon: CheckCircle },
      failed: { color: 'destructive', icon: XCircle },
      cancelled: { color: 'warning', icon: X },
      paused: { color: 'warning', icon: Pause }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderExecutionCard = (execution: PipelineExecution) => (
    <motion.div
      key={execution.id}
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className={`hover:shadow-lg transition-all duration-200 ${
        execution.status === 'failed' ? 'border-l-4 border-l-red-500' :
        execution.status === 'running' ? 'border-l-4 border-l-blue-500' :
        execution.status === 'completed' ? 'border-l-4 border-l-green-500' :
        'border-l-4 border-l-gray-300'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                variants={pipelineVariants}
                animate={
                  execution.status === 'running' ? 'running' :
                  execution.status === 'completed' ? 'completed' :
                  execution.status === 'failed' ? 'failed' :
                  'idle'
                }
                className="p-2 rounded-lg"
              >
                <Workflow className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-sm font-medium">{execution.name}</CardTitle>
                <CardDescription className="text-xs">{execution.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderExecutionStatusBadge(execution.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPipelineState(prev => ({ ...prev, selectedExecution: execution }))}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {execution.status === 'pending' && (
                    <DropdownMenuItem onClick={() => handleExecutionAction(execution.id, 'start')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </DropdownMenuItem>
                  )}
                  {execution.status === 'running' && (
                    <>
                      <DropdownMenuItem onClick={() => handleExecutionAction(execution.id, 'pause')}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExecutionAction(execution.id, 'cancel')}>
                        <Square className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </>
                  )}
                  {execution.status === 'paused' && (
                    <DropdownMenuItem onClick={() => handleExecutionAction(execution.id, 'resume')}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </DropdownMenuItem>
                  )}
                  {execution.status === 'failed' && (
                    <DropdownMenuItem onClick={() => handleExecutionAction(execution.id, 'retry')}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => optimizePipeline(execution.id)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExecutionAction(execution.id, 'delete')}
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
            {execution.progress !== undefined && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{Math.round(execution.progress * 100)}%</span>
                </div>
                <Progress value={execution.progress * 100} className="h-2" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Steps:</span>
                <span className="ml-1 font-medium">
                  {execution.completedSteps}/{execution.totalSteps}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-1 font-medium">{execution.duration || 0}min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <span className="ml-1 font-medium">{execution.priority}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-1 font-medium">{execution.type}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Started: {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All pipeline executions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Executions</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{executionStats.running}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{Math.round(executionStats.successRate)}%</div>
            <p className="text-xs text-muted-foreground">
              Execution success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{state.metrics.averageExecutionTime}min</div>
            <p className="text-xs text-muted-foreground">
              Average completion time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Executions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Pipeline Executions</CardTitle>
              <CardDescription>Currently running pipeline executions</CardDescription>
            </div>
            <Button onClick={() => setIsPipelineDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {state.activeExecutions.length > 0 ? (
                state.activeExecutions.map(renderExecutionCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active executions</p>
                  <p className="text-sm">Create a new pipeline to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Logs and Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Execution Logs</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsLogDialogOpen(true)}>
                <FileText className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      log.level === 'error' ? 'bg-red-500' :
                      log.level === 'warning' ? 'bg-orange-500' :
                      log.level === 'success' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()} • Step: {log.step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Errors</CardTitle>
            <CardDescription>{criticalErrors.length} critical errors detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalErrors.length > 0 ? (
                criticalErrors.slice(0, 5).map((error) => (
                  <Alert key={error.id} className="border-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{error.type}</AlertTitle>
                    <AlertDescription>
                      {error.message}
                      <span className="block text-xs text-muted-foreground mt-1">
                        Step: {error.step} • {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No critical errors</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderExecutionsList = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Executions</Label>
              <Input
                id="search"
                placeholder="Search by name, type..."
                value={pipelineState.filters.searchQuery}
                onChange={(e) => setPipelineState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, searchQuery: e.target.value }
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setPipelineState(prev => ({
                ...prev,
                filters: { ...prev.filters, status: [value as ExecutionStatus] }
              }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => setPipelineState(prev => ({
                ...prev,
                filters: { ...prev.filters, priority: [value] }
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
              <Label htmlFor="timeRange">Time Range</Label>
              <Select onValueChange={(value) => setPipelineState(prev => ({
                ...prev,
                filters: { ...prev.filters, timeRange: value }
              }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Last 24 hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pipeline Executions</CardTitle>
              <CardDescription>{filteredExecutions.length} executions found</CardDescription>
            </div>
            <Button onClick={() => setIsPipelineDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExecutions.map(renderExecutionCard)}
          </div>
        </CardContent>
      </Card>
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
                className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Workflow className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  Execution Pipeline
                </h1>
                <p className="text-muted-foreground">
                  Advanced pipeline execution and management engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {criticalErrors.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Button variant="destructive" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {criticalErrors.length} Errors
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
          <Tabs 
            value={pipelineState.viewMode} 
            onValueChange={(value) => setPipelineState(prev => ({ ...prev, viewMode: value as any }))}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="executions" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Executions
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              {renderDashboard()}
            </TabsContent>

            <TabsContent value="executions" className="mt-6">
              {renderExecutionsList()}
            </TabsContent>

            <TabsContent value="monitoring" className="mt-6">
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-muted-foreground">
                  Live execution monitoring and performance tracking
                </p>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Execution Logs</h3>
                <p className="text-muted-foreground">
                  Comprehensive logging and audit trail
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Pipeline Analytics</h3>
                <p className="text-muted-foreground">
                  Performance analytics and optimization insights
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Pipeline Creation Dialog */}
        <Dialog open={isPipelineDialogOpen} onOpenChange={setIsPipelineDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Pipeline</DialogTitle>
              <DialogDescription>
                Create a new execution pipeline with custom steps and configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pipelineName">Pipeline Name</Label>
                  <Input
                    id="pipelineName"
                    value={newPipelineRequest.name}
                    onChange={(e) => setNewPipelineRequest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter pipeline name"
                  />
                </div>
                <div>
                  <Label htmlFor="pipelineType">Pipeline Type</Label>
                  <Select 
                    value={newPipelineRequest.type} 
                    onValueChange={(value) => setNewPipelineRequest(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_processing">Data Processing</SelectItem>
                      <SelectItem value="scan_execution">Scan Execution</SelectItem>
                      <SelectItem value="compliance_check">Compliance Check</SelectItem>
                      <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPipelineRequest.description}
                  onChange={(e) => setNewPipelineRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter pipeline description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newPipelineRequest.priority} 
                  onValueChange={(value) => setNewPipelineRequest(prev => ({ ...prev, priority: value as any }))}
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPipelineDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createPipeline} 
                disabled={!newPipelineRequest.name || !newPipelineRequest.type || state.isLoading}
              >
                {state.isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Pipeline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configuration Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pipeline Configuration</DialogTitle>
              <DialogDescription>
                Configure pipeline execution settings and resource limits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxConcurrent">Max Concurrent Executions</Label>
                  <Input
                    id="maxConcurrent"
                    type="number"
                    value={pipelineState.configuration.maxConcurrentExecutions}
                    onChange={(e) => setPipelineState(prev => ({
                      ...prev,
                      configuration: { ...prev.configuration, maxConcurrentExecutions: parseInt(e.target.value) }
                    }))}
                    min={1}
                    max={20}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={pipelineState.configuration.timeoutSeconds}
                    onChange={(e) => setPipelineState(prev => ({
                      ...prev,
                      configuration: { ...prev.configuration, timeoutSeconds: parseInt(e.target.value) }
                    }))}
                    min={60}
                    max={86400}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoOptimization"
                    checked={pipelineState.autoOptimization}
                    onCheckedChange={(checked) => setPipelineState(prev => ({ ...prev, autoOptimization: checked }))}
                  />
                  <Label htmlFor="autoOptimization">Auto-optimization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="realTimeUpdates"
                    checked={pipelineState.realTimeUpdates}
                    onCheckedChange={(checked) => setPipelineState(prev => ({ ...prev, realTimeUpdates: checked }))}
                  />
                  <Label htmlFor="realTimeUpdates">Real-time updates</Label>
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

export default ExecutionPipeline;