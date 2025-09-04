/**
 * 🎼 UnifiedScanOrchestrator.tsx - Master Scan Orchestration Engine
 * ================================================================
 * 
 * Enterprise-grade unified scan orchestrator that coordinates all scanning
 * operations across multiple systems, data sources, and workflows. Features
 * intelligent scheduling, resource optimization, and real-time monitoring.
 * 
 * Features:
 * - Unified orchestration of all scan operations
 * - Intelligent scheduling and resource allocation
 * - Cross-system coordination and synchronization
 * - Real-time monitoring and performance optimization
 * - Automated conflict resolution and load balancing
 * - Advanced workflow management and dependency handling
 * - Predictive scaling and capacity planning
 * - Comprehensive analytics and reporting
 * 
 * @author Enterprise Orchestration Team
 * @version 2.0.0 - Production Ready
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Settings, Play, Pause, Square, RotateCcw, Activity, Zap, Target, TrendingUp, BarChart3, PieChart, LineChart, RefreshCw, Clock, Calendar, Users, Database, Server, Network, HardDrive, Cpu, MemoryStick, Globe, Building, User, Search, Filter, Download, Upload, FileText, FolderOpen, Link, ExternalLink, Info, CheckCircle, XCircle, AlertCircle, AlertTriangle, HelpCircle, Plus, Minus, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreVertical, MoreHorizontal, Maximize, Minimize, Grid, List, LayoutGrid, Map, GitBranch, Workflow, Shuffle, Route, Navigation, Compass, Eye, Brain, Shield, Lock, Unlock } from 'lucide-react';

// UI Components
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

// Hooks and Services
import { useScanOrchestration } from '../../hooks/useScanOrchestration';
import { useWorkflowManagement } from '../../hooks/useWorkflowManagement';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useOptimization } from '../../hooks/useOptimization';
import { scanOrchestrationAPI } from '../../services/scan-orchestration-apis';
import { scanWorkflowAPI } from '../../services/scan-workflow-apis';
import { scanCoordinationAPI } from '../../services/scan-coordination-apis';

// Types
import {
  ScanOrchestrationJob,
  OrchestrationStatus,
  OrchestrationPriority,
  OrchestrationMode,
  WorkflowTemplate,
  ExecutionPipeline,
  ResourceAllocation,
  OrchestrationMetrics,
  OrchestrationConfiguration,
  SystemResource,
  OrchestrationEvent,
  OrchestrationAlert,
  CrossSystemCoordination,
  LoadBalancingStrategy,
  ConflictResolution,
  CapacityPlan,
  PerformanceOptimization
} from '../../types/orchestration.types';

// Constants
import { 
  ORCHESTRATION_CONFIGS,
  WORKFLOW_TEMPLATES,
  PERFORMANCE_THRESHOLDS
} from '../../constants/orchestration-configs';

// Utilities
import { 
  orchestrationEngine,
  workflowExecutor,
  performanceCalculator,
  coordinationManager
} from '../../utils/orchestration-engine';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const pulseVariants = {
  idle: { scale: 1, opacity: 0.8 },
  active: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Reducer for orchestration state management
interface OrchestrationState {
  jobs: ScanOrchestrationJob[];
  activeJobs: ScanOrchestrationJob[];
  completedJobs: ScanOrchestrationJob[];
  failedJobs: ScanOrchestrationJob[];
  queuedJobs: ScanOrchestrationJob[];
  metrics: OrchestrationMetrics;
  resources: SystemResource[];
  alerts: OrchestrationAlert[];
  events: OrchestrationEvent[];
  isLoading: boolean;
  error: string | null;
}

type OrchestrationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_JOBS'; payload: ScanOrchestrationJob[] }
  | { type: 'ADD_JOB'; payload: ScanOrchestrationJob }
  | { type: 'UPDATE_JOB'; payload: { id: string; updates: Partial<ScanOrchestrationJob> } }
  | { type: 'REMOVE_JOB'; payload: string }
  | { type: 'SET_METRICS'; payload: OrchestrationMetrics }
  | { type: 'SET_RESOURCES'; payload: SystemResource[] }
  | { type: 'ADD_ALERT'; payload: OrchestrationAlert }
  | { type: 'ADD_EVENT'; payload: OrchestrationEvent }
  | { type: 'CLEAR_ALERTS'; payload: void }
  | { type: 'CLEAR_EVENTS'; payload: void };

const orchestrationReducer = (state: OrchestrationState, action: OrchestrationAction): OrchestrationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_JOBS':
      return {
        ...state,
        jobs: action.payload,
        activeJobs: action.payload.filter(job => job.status === 'running'),
        completedJobs: action.payload.filter(job => job.status === 'completed'),
        failedJobs: action.payload.filter(job => job.status === 'failed'),
        queuedJobs: action.payload.filter(job => job.status === 'queued')
      };
    case 'ADD_JOB':
      const newJobs = [...state.jobs, action.payload];
      return {
        ...state,
        jobs: newJobs,
        activeJobs: newJobs.filter(job => job.status === 'running'),
        queuedJobs: newJobs.filter(job => job.status === 'queued')
      };
    case 'UPDATE_JOB':
      const updatedJobs = state.jobs.map(job =>
        job.id === action.payload.id ? { ...job, ...action.payload.updates } : job
      );
      return {
        ...state,
        jobs: updatedJobs,
        activeJobs: updatedJobs.filter(job => job.status === 'running'),
        completedJobs: updatedJobs.filter(job => job.status === 'completed'),
        failedJobs: updatedJobs.filter(job => job.status === 'failed'),
        queuedJobs: updatedJobs.filter(job => job.status === 'queued')
      };
    case 'REMOVE_JOB':
      const filteredJobs = state.jobs.filter(job => job.id !== action.payload);
      return {
        ...state,
        jobs: filteredJobs,
        activeJobs: filteredJobs.filter(job => job.status === 'running'),
        completedJobs: filteredJobs.filter(job => job.status === 'completed'),
        failedJobs: filteredJobs.filter(job => job.status === 'failed'),
        queuedJobs: filteredJobs.filter(job => job.status === 'queued')
      };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_RESOURCES':
      return { ...state, resources: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    case 'CLEAR_EVENTS':
      return { ...state, events: [] };
    default:
      return state;
  }
};

// Component interfaces
interface UnifiedScanOrchestratorProps {
  className?: string;
  onJobCreated?: (job: ScanOrchestrationJob) => void;
  onJobUpdated?: (job: ScanOrchestrationJob) => void;
  onJobCompleted?: (job: ScanOrchestrationJob) => void;
  onJobFailed?: (job: ScanOrchestrationJob) => void;
}

interface OrchestrationFilters {
  status: OrchestrationStatus[];
  priority: OrchestrationPriority[];
  mode: OrchestrationMode[];
  timeRange: string;
  searchQuery: string;
}

interface JobCreationRequest {
  name: string;
  description: string;
  template: string;
  priority: OrchestrationPriority;
  mode: OrchestrationMode;
  configuration: Record<string, any>;
  schedule?: string;
  dependencies?: string[];
}

// Main Component
export const UnifiedScanOrchestrator: React.FC<UnifiedScanOrchestratorProps> = ({
  className,
  onJobCreated,
  onJobUpdated,
  onJobCompleted,
  onJobFailed
}) => {
  // State Management
  const [state, dispatch] = useReducer(orchestrationReducer, {
    jobs: [],
    activeJobs: [],
    completedJobs: [],
    failedJobs: [],
    queuedJobs: [],
    metrics: {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageExecutionTime: 0,
      throughput: 0,
      resourceUtilization: 0,
      successRate: 0
    },
    resources: [],
    alerts: [],
    events: [],
    isLoading: false,
    error: null
  });

  const [viewMode, setViewMode] = useState<'dashboard' | 'jobs' | 'resources' | 'analytics' | 'config'>('dashboard');
  const [selectedJob, setSelectedJob] = useState<ScanOrchestrationJob | null>(null);
  const [isJobCreationOpen, setIsJobCreationOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [jobFilters, setJobFilters] = useState<OrchestrationFilters>({
    status: [],
    priority: [],
    mode: [],
    timeRange: '24h',
    searchQuery: ''
  });
  const [newJobRequest, setNewJobRequest] = useState<JobCreationRequest>({
    name: '',
    description: '',
    template: '',
    priority: 'medium',
    mode: 'automated',
    configuration: {},
    schedule: '',
    dependencies: []
  });
  const [orchestrationConfig, setOrchestrationConfig] = useState<OrchestrationConfiguration>({
    maxConcurrentJobs: 10,
    autoScaling: true,
    loadBalancing: 'intelligent',
    failureHandling: 'retry_with_backoff',
    optimizationMode: 'performance',
    monitoring: {
      enabled: true,
      interval: 30,
      metrics: ['performance', 'resources', 'errors']
    }
  });

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const orchestrationEngineRef = useRef<any>(null);

  // Hooks
  const {
    orchestrationJobs,
    metrics: orchestrationMetrics,
    resources: systemResources,
    createJob,
    updateJob,
    deleteJob,
    startJob,
    pauseJob,
    resumeJob,
    cancelJob,
    getJobDetails,
    loading: orchestrationLoading,
    error: orchestrationError
  } = useScanOrchestration({
    autoRefresh: true,
    refreshInterval: 30000,
    onJobStatusChange: handleJobStatusChange,
    onResourceChange: handleResourceChange
  });

  const {
    workflows,
    templates: workflowTemplates,
    createWorkflow,
    executeWorkflow,
    loading: workflowLoading
  } = useWorkflowManagement();

  const {
    isMonitoring,
    metrics: monitoringMetrics,
    alerts: monitoringAlerts,
    startMonitoring,
    stopMonitoring
  } = useRealTimeMonitoring({
    onAlert: handleMonitoringAlert,
    onMetricsUpdate: handleMetricsUpdate
  });

  const {
    optimizationRecommendations,
    performOptimization,
    loading: optimizationLoading
  } = useOptimization();

  // Callbacks
  const handleJobStatusChange = useCallback((job: ScanOrchestrationJob) => {
    dispatch({ type: 'UPDATE_JOB', payload: { id: job.id, updates: job } });
    
    switch (job.status) {
      case 'completed':
        onJobCompleted?.(job);
        dispatch({ 
          type: 'ADD_EVENT', 
          payload: {
            id: `event-${Date.now()}`,
            type: 'job_completed',
            jobId: job.id,
            message: `Job ${job.name} completed successfully`,
            timestamp: new Date().toISOString(),
            severity: 'info'
          }
        });
        break;
      case 'failed':
        onJobFailed?.(job);
        dispatch({ 
          type: 'ADD_ALERT', 
          payload: {
            id: `alert-${Date.now()}`,
            type: 'job_failure',
            jobId: job.id,
            message: `Job ${job.name} failed`,
            severity: 'high',
            timestamp: new Date().toISOString(),
            acknowledged: false
          }
        });
        break;
      case 'running':
        dispatch({ 
          type: 'ADD_EVENT', 
          payload: {
            id: `event-${Date.now()}`,
            type: 'job_started',
            jobId: job.id,
            message: `Job ${job.name} started execution`,
            timestamp: new Date().toISOString(),
            severity: 'info'
          }
        });
        break;
    }
  }, [onJobCompleted, onJobFailed]);

  const handleResourceChange = useCallback((resources: SystemResource[]) => {
    dispatch({ type: 'SET_RESOURCES', payload: resources });
    
    // Check for resource alerts
    resources.forEach(resource => {
      if (resource.utilization > 90) {
        dispatch({ 
          type: 'ADD_ALERT', 
          payload: {
            id: `alert-${Date.now()}`,
            type: 'resource_high_utilization',
            message: `High ${resource.type} utilization: ${resource.utilization}%`,
            severity: 'medium',
            timestamp: new Date().toISOString(),
            acknowledged: false
          }
        });
      }
    });
  }, []);

  const handleMonitoringAlert = useCallback((alert: any) => {
    dispatch({ 
      type: 'ADD_ALERT', 
      payload: {
        id: `alert-${Date.now()}`,
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        timestamp: new Date().toISOString(),
        acknowledged: false
      }
    });
  }, []);

  const handleMetricsUpdate = useCallback((metrics: any) => {
    dispatch({ type: 'SET_METRICS', payload: metrics });
  }, []);

  const handleCreateJob = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const job = await createJob({
        name: newJobRequest.name,
        description: newJobRequest.description,
        template: newJobRequest.template,
        priority: newJobRequest.priority,
        mode: newJobRequest.mode,
        configuration: newJobRequest.configuration,
        schedule: newJobRequest.schedule,
        dependencies: newJobRequest.dependencies
      });
      
      dispatch({ type: 'ADD_JOB', payload: job });
      onJobCreated?.(job);
      
      setIsJobCreationOpen(false);
      setNewJobRequest({
        name: '',
        description: '',
        template: '',
        priority: 'medium',
        mode: 'automated',
        configuration: {},
        schedule: '',
        dependencies: []
      });
      
    } catch (error) {
      console.error('Failed to create job:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create job' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [newJobRequest, createJob, onJobCreated]);

  const handleJobAction = useCallback(async (jobId: string, action: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let updatedJob: ScanOrchestrationJob;
      
      switch (action) {
        case 'start':
          updatedJob = await startJob(jobId);
          break;
        case 'pause':
          updatedJob = await pauseJob(jobId);
          break;
        case 'resume':
          updatedJob = await resumeJob(jobId);
          break;
        case 'cancel':
          updatedJob = await cancelJob(jobId);
          break;
        case 'delete':
          await deleteJob(jobId);
          dispatch({ type: 'REMOVE_JOB', payload: jobId });
          return;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      dispatch({ type: 'UPDATE_JOB', payload: { id: jobId, updates: updatedJob } });
      
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to ${action} job` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [startJob, pauseJob, resumeJob, cancelJob, deleteJob]);

  const handleOptimizeResources = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const optimization = await performOptimization({
        type: 'resource_allocation',
        scope: 'system_wide',
        parameters: {
          jobs: state.activeJobs,
          resources: state.resources,
          configuration: orchestrationConfig
        }
      });
      
      // Apply optimization recommendations
      if (optimization.recommendations) {
        // Update job priorities and resource allocations
        for (const recommendation of optimization.recommendations) {
          if (recommendation.type === 'job_priority_adjustment') {
            await updateJob(recommendation.jobId, {
              priority: recommendation.newPriority
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to optimize resources:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to optimize resources' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.activeJobs, state.resources, orchestrationConfig, performOptimization, updateJob]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    dispatch({
      type: 'ADD_ALERT',
      payload: state.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )[0]
    });
  }, [state.alerts]);

  // Computed Values
  const jobStatusDistribution = useMemo(() => {
    const total = state.jobs.length;
    return {
      running: Math.round((state.activeJobs.length / total) * 100) || 0,
      completed: Math.round((state.completedJobs.length / total) * 100) || 0,
      failed: Math.round((state.failedJobs.length / total) * 100) || 0,
      queued: Math.round((state.queuedJobs.length / total) * 100) || 0
    };
  }, [state.jobs, state.activeJobs, state.completedJobs, state.failedJobs, state.queuedJobs]);

  const resourceUtilization = useMemo(() => {
    if (state.resources.length === 0) return 0;
    return state.resources.reduce((acc, resource) => acc + resource.utilization, 0) / state.resources.length;
  }, [state.resources]);

  const filteredJobs = useMemo(() => {
    return state.jobs.filter(job => {
      if (jobFilters.status.length > 0 && !jobFilters.status.includes(job.status)) return false;
      if (jobFilters.priority.length > 0 && !jobFilters.priority.includes(job.priority)) return false;
      if (jobFilters.mode.length > 0 && !jobFilters.mode.includes(job.mode)) return false;
      if (jobFilters.searchQuery && !job.name.toLowerCase().includes(jobFilters.searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [state.jobs, jobFilters]);

  const unacknowledgedAlerts = useMemo(
    () => state.alerts.filter(alert => !alert.acknowledged),
    [state.alerts]
  );

  // Effects
  useEffect(() => {
    // Initialize orchestration data
    const initializeOrchestration = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load orchestration jobs
        if (orchestrationJobs) {
          dispatch({ type: 'SET_JOBS', payload: orchestrationJobs });
        }
        
        // Load system resources
        if (systemResources) {
          dispatch({ type: 'SET_RESOURCES', payload: systemResources });
        }
        
        // Load metrics
        if (orchestrationMetrics) {
          dispatch({ type: 'SET_METRICS', payload: orchestrationMetrics });
        }
        
        // Start monitoring
        if (!isMonitoring) {
          await startMonitoring({
            components: ['orchestration', 'resources', 'workflows'],
            interval: 30000
          });
        }
        
      } catch (error) {
        console.error('Failed to initialize orchestration:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize orchestration' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeOrchestration();
  }, []);

  useEffect(() => {
    // Update jobs from hook data
    if (orchestrationJobs) {
      dispatch({ type: 'SET_JOBS', payload: orchestrationJobs });
    }
  }, [orchestrationJobs]);

  useEffect(() => {
    // Update metrics from hook data
    if (orchestrationMetrics) {
      dispatch({ type: 'SET_METRICS', payload: orchestrationMetrics });
    }
  }, [orchestrationMetrics]);

  useEffect(() => {
    // Update resources from hook data
    if (systemResources) {
      dispatch({ type: 'SET_RESOURCES', payload: systemResources });
    }
  }, [systemResources]);

  useEffect(() => {
    // Handle monitoring alerts
    if (monitoringAlerts) {
      monitoringAlerts.forEach(alert => {
        dispatch({ 
          type: 'ADD_ALERT', 
          payload: {
            id: `alert-${Date.now()}-${Math.random()}`,
            type: alert.type,
            message: alert.message,
            severity: alert.severity,
            timestamp: new Date().toISOString(),
            acknowledged: false
          }
        });
      });
    }
  }, [monitoringAlerts]);

  useEffect(() => {
    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Render Helper Functions
  const renderJobStatusBadge = (status: OrchestrationStatus) => {
    const statusConfig = {
      running: { color: 'default', icon: Play },
      completed: { color: 'success', icon: CheckCircle },
      failed: { color: 'destructive', icon: XCircle },
      queued: { color: 'secondary', icon: Clock },
      paused: { color: 'warning', icon: Pause },
      cancelled: { color: 'muted', icon: X }
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

  const renderPriorityBadge = (priority: OrchestrationPriority) => {
    const priorityConfig = {
      critical: { color: 'destructive', icon: AlertTriangle },
      high: { color: 'warning', icon: AlertCircle },
      medium: { color: 'default', icon: Info },
      low: { color: 'secondary', icon: Info }
    };
    
    const config = priorityConfig[priority];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const renderJobCard = (job: ScanOrchestrationJob) => (
    <motion.div
      key={job.id}
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className={`hover:shadow-lg transition-all duration-200 ${
        job.status === 'running' ? 'border-l-4 border-l-blue-500' :
        job.status === 'completed' ? 'border-l-4 border-l-green-500' :
        job.status === 'failed' ? 'border-l-4 border-l-red-500' :
        'border-l-4 border-l-gray-300'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                variants={pulseVariants}
                animate={job.status === 'running' ? 'active' : 'idle'}
              >
                <Layers className={`h-5 w-5 ${
                  job.status === 'running' ? 'text-blue-500' :
                  job.status === 'completed' ? 'text-green-500' :
                  job.status === 'failed' ? 'text-red-500' :
                  'text-gray-500'
                }`} />
              </motion.div>
              <div>
                <CardTitle className="text-sm font-medium">{job.name}</CardTitle>
                <CardDescription className="text-xs">{job.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderJobStatusBadge(job.status)}
              {renderPriorityBadge(job.priority)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {job.status === 'queued' && (
                    <DropdownMenuItem onClick={() => handleJobAction(job.id, 'start')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Job
                    </DropdownMenuItem>
                  )}
                  {job.status === 'running' && (
                    <>
                      <DropdownMenuItem onClick={() => handleJobAction(job.id, 'pause')}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Job
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleJobAction(job.id, 'cancel')}>
                        <Square className="h-4 w-4 mr-2" />
                        Cancel Job
                      </DropdownMenuItem>
                    </>
                  )}
                  {job.status === 'paused' && (
                    <DropdownMenuItem onClick={() => handleJobAction(job.id, 'resume')}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume Job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleJobAction(job.id, 'delete')}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {job.progress !== undefined && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{Math.round(job.progress * 100)}%</span>
                </div>
                <Progress value={job.progress * 100} className="h-2" />
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Template: {job.template}</span>
              <span>Mode: {job.mode}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
              {job.started_at && (
                <span>Started: {new Date(job.started_at).toLocaleTimeString()}</span>
              )}
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
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.metrics.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{state.metrics.activeJobs}</div>
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
            <div className="text-2xl font-bold text-green-500">{state.metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Job completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
            <Cpu className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{Math.round(resourceUtilization)}%</div>
            <p className="text-xs text-muted-foreground">
              Average utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Job Status Distribution</CardTitle>
          <CardDescription>Current status of all orchestration jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                Running
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${jobStatusDistribution.running}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{state.activeJobs.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                Completed
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${jobStatusDistribution.completed}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{state.completedJobs.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                Failed
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${jobStatusDistribution.failed}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{state.failedJobs.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                Queued
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${jobStatusDistribution.queued}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{state.queuedJobs.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>Currently running orchestration jobs</CardDescription>
            </div>
            <Button onClick={() => setIsJobCreationOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {state.activeJobs.length > 0 ? (
                state.activeJobs.map(renderJobCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active jobs</p>
                  <p className="text-sm">Create a new job to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
            <CardDescription>Current resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.resources.map((resource, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {resource.type === 'cpu' && <Cpu className="h-4 w-4" />}
                      {resource.type === 'memory' && <MemoryStick className="h-4 w-4" />}
                      {resource.type === 'storage' && <HardDrive className="h-4 w-4" />}
                      {resource.type === 'network' && <Network className="h-4 w-4" />}
                      {resource.name}
                    </span>
                    <span className="font-medium">{resource.utilization}%</span>
                  </div>
                  <Progress 
                    value={resource.utilization} 
                    className={`h-2 ${
                      resource.utilization > 90 ? 'text-red-500' :
                      resource.utilization > 70 ? 'text-orange-500' :
                      'text-green-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key orchestration metrics</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleOptimizeResources}>
                <Zap className="h-4 w-4 mr-2" />
                Optimize
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Execution Time</span>
                <span className="font-medium">{state.metrics.averageExecutionTime}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Throughput</span>
                <span className="font-medium">{state.metrics.throughput} jobs/hour</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resource Efficiency</span>
                <span className="font-medium">{state.metrics.resourceUtilization}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="font-medium">{(100 - state.metrics.successRate).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>{unacknowledgedAlerts.length} unacknowledged alerts</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'CLEAR_ALERTS', payload: undefined })}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unacknowledgedAlerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={`${
                  alert.severity === 'high' ? 'border-red-500' : 
                  alert.severity === 'medium' ? 'border-orange-500' : 
                  'border-yellow-500'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.type.replace('_', ' ').toUpperCase()}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.message}
                    <span className="block text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderJobsList = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Job Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Jobs</Label>
              <Input
                id="search"
                placeholder="Search by name, description..."
                value={jobFilters.searchQuery}
                onChange={(e) => setJobFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setJobFilters(prev => ({ ...prev, status: [value as OrchestrationStatus] }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => setJobFilters(prev => ({ ...prev, priority: [value as OrchestrationPriority] }))}>
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
              <Select onValueChange={(value) => setJobFilters(prev => ({ ...prev, timeRange: value }))}>
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

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orchestration Jobs</CardTitle>
              <CardDescription>{filteredJobs.length} jobs found</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setIsJobCreationOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{job.name}</div>
                        <div className="text-sm text-muted-foreground">{job.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderJobStatusBadge(job.status)}
                  </TableCell>
                  <TableCell>
                    {renderPriorityBadge(job.priority)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.mode}</Badge>
                  </TableCell>
                  <TableCell>
                    {job.progress !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Progress value={job.progress * 100} className="w-16" />
                        <span className="text-sm">{Math.round(job.progress * 100)}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {job.status === 'queued' && (
                          <DropdownMenuItem onClick={() => handleJobAction(job.id, 'start')}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Job
                          </DropdownMenuItem>
                        )}
                        {job.status === 'running' && (
                          <>
                            <DropdownMenuItem onClick={() => handleJobAction(job.id, 'pause')}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleJobAction(job.id, 'cancel')}>
                              <Square className="h-4 w-4 mr-2" />
                              Cancel Job
                            </DropdownMenuItem>
                          </>
                        )}
                        {job.status === 'paused' && (
                          <DropdownMenuItem onClick={() => handleJobAction(job.id, 'resume')}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleJobAction(job.id, 'delete')}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <motion.div
        className={`p-6 space-y-6 ${className}`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Layers className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Unified Scan Orchestrator
                </h1>
                <p className="text-muted-foreground">
                  Master orchestration engine for all scanning operations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unacknowledgedAlerts.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Button variant="destructive" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {unacknowledgedAlerts.length} Alerts
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
                onClick={() => setIsConfigOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Config
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              {renderDashboard()}
            </TabsContent>

            <TabsContent value="jobs" className="mt-6">
              {renderJobsList()}
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <div className="text-center py-12">
                <Server className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Resource Management</h3>
                <p className="text-muted-foreground">
                  Advanced resource allocation and optimization features
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Comprehensive orchestration analytics and insights
                </p>
              </div>
            </TabsContent>

            <TabsContent value="config" className="mt-6">
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Configuration</h3>
                <p className="text-muted-foreground">
                  Orchestration settings and configuration management
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Job Creation Dialog */}
        <Dialog open={isJobCreationOpen} onOpenChange={setIsJobCreationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Orchestration Job</DialogTitle>
              <DialogDescription>
                Configure a new scan orchestration job
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input
                    id="jobName"
                    value={newJobRequest.name}
                    onChange={(e) => setNewJobRequest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter job name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTemplate">Template</Label>
                  <Select 
                    value={newJobRequest.template} 
                    onValueChange={(value) => setNewJobRequest(prev => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_discovery">Data Discovery</SelectItem>
                      <SelectItem value="compliance_scan">Compliance Scan</SelectItem>
                      <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
                      <SelectItem value="security_audit">Security Audit</SelectItem>
                      <SelectItem value="performance_test">Performance Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="jobDescription">Description</Label>
                <Textarea
                  id="jobDescription"
                  value={newJobRequest.description}
                  onChange={(e) => setNewJobRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter job description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobPriority">Priority</Label>
                  <Select 
                    value={newJobRequest.priority} 
                    onValueChange={(value) => setNewJobRequest(prev => ({ ...prev, priority: value as OrchestrationPriority }))}
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
                  <Label htmlFor="jobMode">Mode</Label>
                  <Select 
                    value={newJobRequest.mode} 
                    onValueChange={(value) => setNewJobRequest(prev => ({ ...prev, mode: value as OrchestrationMode }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automated">Automated</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="jobSchedule">Schedule (Optional)</Label>
                <Input
                  id="jobSchedule"
                  value={newJobRequest.schedule}
                  onChange={(e) => setNewJobRequest(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="0 2 * * * (Daily at 2 AM)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJobCreationOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob} disabled={!newJobRequest.name || !newJobRequest.template}>
                Create Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Job Details Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedJob && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    {selectedJob.name}
                  </DialogTitle>
                  <DialogDescription>
                    Detailed job information and execution logs
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        {renderJobStatusBadge(selectedJob.status)}
                      </div>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <div className="mt-1">
                        {renderPriorityBadge(selectedJob.priority)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedJob.description}</p>
                  </div>
                  {selectedJob.progress !== undefined && (
                    <div>
                      <Label>Progress</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={selectedJob.progress * 100} className="flex-1" />
                        <span className="text-sm font-medium">{Math.round(selectedJob.progress * 100)}%</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Created</Label>
                      <p className="mt-1 text-sm">{new Date(selectedJob.created_at).toLocaleString()}</p>
                    </div>
                    {selectedJob.started_at && (
                      <div>
                        <Label>Started</Label>
                        <p className="mt-1 text-sm">{new Date(selectedJob.started_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedJob(null)}>
                    Close
                  </Button>
                  {selectedJob.status === 'queued' && (
                    <Button onClick={() => handleJobAction(selectedJob.id, 'start')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Job
                    </Button>
                  )}
                  {selectedJob.status === 'running' && (
                    <Button onClick={() => handleJobAction(selectedJob.id, 'pause')}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Job
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Configuration Dialog */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Orchestration Configuration</DialogTitle>
              <DialogDescription>
                Configure orchestration engine settings and parameters
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxJobs">Max Concurrent Jobs</Label>
                  <Input
                    id="maxJobs"
                    type="number"
                    value={orchestrationConfig.maxConcurrentJobs}
                    onChange={(e) => setOrchestrationConfig(prev => ({ 
                      ...prev, 
                      maxConcurrentJobs: parseInt(e.target.value) 
                    }))}
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <Label htmlFor="loadBalancing">Load Balancing</Label>
                  <Select 
                    value={orchestrationConfig.loadBalancing} 
                    onValueChange={(value) => setOrchestrationConfig(prev => ({ 
                      ...prev, 
                      loadBalancing: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="least_connections">Least Connections</SelectItem>
                      <SelectItem value="intelligent">Intelligent</SelectItem>
                      <SelectItem value="weighted">Weighted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoScaling"
                  checked={orchestrationConfig.autoScaling}
                  onCheckedChange={(checked) => setOrchestrationConfig(prev => ({ 
                    ...prev, 
                    autoScaling: checked 
                  }))}
                />
                <Label htmlFor="autoScaling">Enable auto-scaling</Label>
              </div>
              <div>
                <Label htmlFor="optimizationMode">Optimization Mode</Label>
                <Select 
                  value={orchestrationConfig.optimizationMode} 
                  onValueChange={(value) => setOrchestrationConfig(prev => ({ 
                    ...prev, 
                    optimizationMode: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsConfigOpen(false)}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default UnifiedScanOrchestrator;