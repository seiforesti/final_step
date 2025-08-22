import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  MonitorSpeaker, 
  Workflow,
  GitBranch,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Plus,
  Minus,
  MoreHorizontal,
  Command,
  Zap,
  Target,
  Shield,
  Database,
  Server,
  Network,
  HardDrive,
  Cpu,
  Memory,
  Timer,
  Activity,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart,
  BarChart,
  Calendar,
  MapPin,
  Layers,
  Box,
  Grid,
  List,
  Table,
  Kanban,
  TreePine,
  Workflow as WorkflowIcon,
  Gauge,
  Radar,
  Orbit,
  Atom,
  Sparkles,
  Lightbulb,
  Brain,
  Robot
} from 'lucide-react';

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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table as UITable, TableBody as UITableBody, TableCell as UITableCell, TableHead as UITableHead, TableHeader as UITableHeader, TableRow as UITableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useOrchestration } from '../../hooks/useOrchestration';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';

// RBAC Integration
import { useScanRuleRBAC } from '../../utils/rbac-integration';

// API Services
import { orchestrationAPI } from '../../services/orchestration-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';
import { reportingAPI } from '../../services/reporting-apis';

// Types
import type { 
  OrchestrationJob,
  WorkflowExecution,
  ResourceAllocation,
  OrchestrationMetrics,
  OrchestrationConfig,
  ExecutionStatus,
  WorkflowTemplate,
  OrchestrationStage,
  DependencyGraph,
  ResourcePool,
  ExecutionHistory,
  PerformanceMetrics,
  OrchestrationEvent,
  WorkflowDefinition,
  RuleSet,
  ExecutionPlan,
  ScheduleConfig,
  NotificationConfig,
  AlertConfig,
  MonitoringConfig,
  OptimizationConfig
} from '../../types/orchestration.types';

// Utilities
import { workflowEngine } from '../../utils/workflow-engine';
import { performanceCalculator } from '../../utils/performance-calculator';
import { aiHelpers } from '../../utils/ai-helpers';

// Constants
import { ORCHESTRATION_CONFIGS } from '../../constants/optimization-configs';

interface RuleOrchestrationCenterProps {
  className?: string;
  onJobCreated?: (job: OrchestrationJob) => void;
  onExecutionStarted?: (execution: WorkflowExecution) => void;
  onResourceAllocated?: (allocation: ResourceAllocation) => void;
  // RBAC props
  rbac?: any;
  userContext?: any;
  accessLevel?: string;
}

interface OrchestrationViewState {
  currentView: 'dashboard' | 'workflows' | 'resources' | 'monitoring' | 'templates' | 'history';
  selectedJob?: OrchestrationJob;
  selectedExecution?: WorkflowExecution;
  selectedTemplate?: WorkflowTemplate;
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  gridView: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  selectedResourcePool?: ResourcePool;
  monitoringActive: boolean;
  alertsEnabled: boolean;
  soundEnabled: boolean;
  detailsPanelOpen: boolean;
  configurationOpen: boolean;
  filterActive: boolean;
  searchQuery: string;
  selectedFilters: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  groupBy: string;
  dateRange: { start: Date; end: Date };
  realTimeMode: boolean;
  expertMode: boolean;
}

interface OrchestrationState {
  jobs: OrchestrationJob[];
  executions: WorkflowExecution[];
  templates: WorkflowTemplate[];
  resourcePools: ResourcePool[];
  metrics: OrchestrationMetrics;
  events: OrchestrationEvent[];
  history: ExecutionHistory[];
  alerts: OrchestrationEvent[];
  config: OrchestrationConfig;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  systemHealth: 'healthy' | 'degraded' | 'critical';
  activeConnections: number;
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  queuedJobs: number;
  totalResources: number;
  allocatedResources: number;
  availableResources: number;
  resourceUtilization: number;
  averageExecutionTime: number;
  successRate: number;
  throughput: number;
  errorRate: number;
}

interface WorkflowVisualizationData {
  nodes: Array<{
    id: string;
    label: string;
    type: 'start' | 'end' | 'process' | 'decision' | 'parallel' | 'merge';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    position: { x: number; y: number };
    data: any;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: 'default' | 'conditional' | 'data' | 'error';
    label?: string;
    animated?: boolean;
  }>;
}

const DEFAULT_VIEW_STATE: OrchestrationViewState = {
  currentView: 'dashboard',
  sidebarCollapsed: false,
  fullscreen: false,
  gridView: false,
  autoRefresh: true,
  refreshInterval: 5000,
  monitoringActive: true,
  alertsEnabled: true,
  soundEnabled: false,
  detailsPanelOpen: false,
  configurationOpen: false,
  filterActive: false,
  searchQuery: '',
  selectedFilters: [],
  sortBy: 'created_at',
  sortOrder: 'desc',
  groupBy: 'status',
  dateRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  },
  realTimeMode: true,
  expertMode: false
};

export const RuleOrchestrationCenter: React.FC<RuleOrchestrationCenterProps> = ({
  className,
  onJobCreated,
  onExecutionStarted,
  onResourceAllocated,
  rbac: propRbac,
  userContext: propUserContext,
  accessLevel: propAccessLevel
}) => {
  // RBAC Integration - use prop or hook
  const hookRbac = useScanRuleRBAC();
  const rbac = propRbac || hookRbac;
  const userContext = propUserContext || rbac.getUserContext();
  const accessLevel = propAccessLevel || rbac.getAccessLevel();
  // State Management
  const [viewState, setViewState] = useState<OrchestrationViewState>(DEFAULT_VIEW_STATE);
  const [orchestrationState, setOrchestrationState] = useState<OrchestrationState>({
    jobs: [],
    executions: [],
    templates: [],
    resourcePools: [],
    metrics: {} as OrchestrationMetrics,
    events: [],
    history: [],
    alerts: [],
    config: {} as OrchestrationConfig,
    loading: false,
    error: null,
    lastUpdated: new Date(),
    connectionStatus: 'connected',
    systemHealth: 'healthy',
    activeConnections: 0,
    totalJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    queuedJobs: 0,
    totalResources: 0,
    allocatedResources: 0,
    availableResources: 0,
    resourceUtilization: 0,
    averageExecutionTime: 0,
    successRate: 0,
    throughput: 0,
    errorRate: 0
  });

  const [selectedJob, setSelectedJob] = useState<OrchestrationJob | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [workflowVisualization, setWorkflowVisualization] = useState<WorkflowVisualizationData>({ nodes: [], edges: [] });
  const [newJobDialogOpen, setNewJobDialogOpen] = useState(false);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const visualizationRef = useRef<HTMLDivElement>(null);

  // Custom Hooks
  const {
    orchestrationJobs,
    executions,
    resourceAllocations,
    createJob,
    updateJob,
    deleteJob,
    startExecution,
    stopExecution,
    pauseExecution,
    resumeExecution,
    allocateResources,
    deallocateResources,
    getMetrics,
    getEvents,
    loading: orchestrationLoading,
    error: orchestrationError
  } = useOrchestration();

  const {
    scanRules,
    ruleSets,
    getRules,
    createRuleSet,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    exportData,
    loading: reportingLoading
  } = useReporting();

  const {
    getInsights,
    analyzePerformance,
    predictOptimizations,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    collaborationSessions,
    sendMessage,
    shareProject,
    loading: collaborationLoading
  } = useCollaboration();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMode) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/orchestration`);
      
      wsRef.current.onopen = () => {
        setOrchestrationState(prev => ({ ...prev, connectionStatus: 'connected' }));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = () => {
        setOrchestrationState(prev => ({ ...prev, connectionStatus: 'error' }));
      };

      wsRef.current.onclose = () => {
        setOrchestrationState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
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
      case 'job_created':
        setOrchestrationState(prev => ({
          ...prev,
          jobs: [...prev.jobs, data.job],
          totalJobs: prev.totalJobs + 1
        }));
        break;
      case 'job_updated':
        setOrchestrationState(prev => ({
          ...prev,
          jobs: prev.jobs.map(job => job.id === data.job.id ? data.job : job)
        }));
        break;
      case 'execution_started':
        setOrchestrationState(prev => ({
          ...prev,
          executions: [...prev.executions, data.execution],
          runningJobs: prev.runningJobs + 1
        }));
        if (onExecutionStarted) onExecutionStarted(data.execution);
        break;
      case 'execution_completed':
        setOrchestrationState(prev => ({
          ...prev,
          executions: prev.executions.map(exec => 
            exec.id === data.execution.id ? data.execution : exec
          ),
          runningJobs: prev.runningJobs - 1,
          completedJobs: prev.completedJobs + 1
        }));
        break;
      case 'execution_failed':
        setOrchestrationState(prev => ({
          ...prev,
          executions: prev.executions.map(exec => 
            exec.id === data.execution.id ? data.execution : exec
          ),
          runningJobs: prev.runningJobs - 1,
          failedJobs: prev.failedJobs + 1
        }));
        break;
      case 'resource_allocated':
        setOrchestrationState(prev => ({
          ...prev,
          allocatedResources: prev.allocatedResources + data.allocation.amount,
          availableResources: prev.availableResources - data.allocation.amount
        }));
        if (onResourceAllocated) onResourceAllocated(data.allocation);
        break;
      case 'metrics_updated':
        setOrchestrationState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
      case 'alert':
        setOrchestrationState(prev => ({
          ...prev,
          alerts: [...prev.alerts, data.alert]
        }));
        if (viewState.alertsEnabled && viewState.soundEnabled) {
          playNotificationSound();
        }
        break;
      case 'event':
        setOrchestrationState(prev => ({
          ...prev,
          events: [...prev.events, data.event].slice(-1000) // Keep last 1000 events
        }));
        break;
    }
  }, [viewState.alertsEnabled, viewState.soundEnabled, onExecutionStarted, onResourceAllocated]);

  // Auto-refresh Logic
  useEffect(() => {
    if (viewState.autoRefresh && !viewState.realTimeMode) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, viewState.refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [viewState.autoRefresh, viewState.refreshInterval, viewState.realTimeMode]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setOrchestrationState(prev => ({ ...prev, loading: true, error: null }));

      const [jobsData, executionsData, metricsData, eventsData] = await Promise.all([
        orchestrationAPI.getJobs({ 
          limit: 100,
          status: viewState.selectedFilters.length > 0 ? viewState.selectedFilters : undefined,
          search: viewState.searchQuery || undefined
        }),
        orchestrationAPI.getExecutions({ limit: 100 }),
        orchestrationAPI.getMetrics(),
        orchestrationAPI.getEvents({ limit: 100 })
      ]);

      setOrchestrationState(prev => ({
        ...prev,
        jobs: jobsData.jobs,
        executions: executionsData.executions,
        metrics: metricsData,
        events: eventsData.events,
        totalJobs: jobsData.total,
        runningJobs: jobsData.jobs.filter(j => j.status === 'running').length,
        completedJobs: jobsData.jobs.filter(j => j.status === 'completed').length,
        failedJobs: jobsData.jobs.filter(j => j.status === 'failed').length,
        queuedJobs: jobsData.jobs.filter(j => j.status === 'queued').length,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setOrchestrationState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.selectedFilters, viewState.searchQuery]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Job Management Functions
  const handleCreateJob = useCallback(async (jobData: Partial<OrchestrationJob>) => {
    try {
      const newJob = await orchestrationAPI.createJob(jobData);
      setOrchestrationState(prev => ({
        ...prev,
        jobs: [...prev.jobs, newJob],
        totalJobs: prev.totalJobs + 1
      }));
      if (onJobCreated) onJobCreated(newJob);
      setNewJobDialogOpen(false);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  }, [onJobCreated]);

  const handleStartExecution = useCallback(async (job: OrchestrationJob) => {
    try {
      const execution = await orchestrationAPI.startExecution(job.id);
      setOrchestrationState(prev => ({
        ...prev,
        executions: [...prev.executions, execution],
        runningJobs: prev.runningJobs + 1
      }));
      if (onExecutionStarted) onExecutionStarted(execution);
    } catch (error) {
      console.error('Failed to start execution:', error);
    }
  }, [onExecutionStarted]);

  const handleStopExecution = useCallback(async (execution: WorkflowExecution) => {
    try {
      await orchestrationAPI.stopExecution(execution.id);
      setOrchestrationState(prev => ({
        ...prev,
        executions: prev.executions.map(exec => 
          exec.id === execution.id ? { ...exec, status: 'stopped' } : exec
        ),
        runningJobs: prev.runningJobs - 1
      }));
    } catch (error) {
      console.error('Failed to stop execution:', error);
    }
  }, []);

  const handlePauseExecution = useCallback(async (execution: WorkflowExecution) => {
    try {
      await orchestrationAPI.pauseExecution(execution.id);
      setOrchestrationState(prev => ({
        ...prev,
        executions: prev.executions.map(exec => 
          exec.id === execution.id ? { ...exec, status: 'paused' } : exec
        )
      }));
    } catch (error) {
      console.error('Failed to pause execution:', error);
    }
  }, []);

  const handleResumeExecution = useCallback(async (execution: WorkflowExecution) => {
    try {
      await orchestrationAPI.resumeExecution(execution.id);
      setOrchestrationState(prev => ({
        ...prev,
        executions: prev.executions.map(exec => 
          exec.id === execution.id ? { ...exec, status: 'running' } : exec
        )
      }));
    } catch (error) {
      console.error('Failed to resume execution:', error);
    }
  }, []);

  // Utility Functions
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'paused': return 'text-yellow-600';
      case 'queued': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'queued': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  }, []);

  // Filter and Search Functions
  const filteredJobs = useMemo(() => {
    let filtered = orchestrationState.jobs;

    if (viewState.searchQuery) {
      filtered = filtered.filter(job => 
        job.name.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.selectedFilters.length > 0) {
      filtered = filtered.filter(job => viewState.selectedFilters.includes(job.status));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
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
  }, [orchestrationState.jobs, viewState.searchQuery, viewState.selectedFilters, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* System Health and Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <WorkflowIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orchestrationState.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20)}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orchestrationState.runningJobs}</div>
            <p className="text-xs text-muted-foreground">
              {orchestrationState.queuedJobs} queued
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((orchestrationState.completedJobs / (orchestrationState.totalJobs || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {orchestrationState.failedJobs} failed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orchestrationState.resourceUtilization}%</div>
            <Progress value={orchestrationState.resourceUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Status and Alerts */}
      {orchestrationState.alerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>System Alerts ({orchestrationState.alerts.length})</AlertTitle>
          <AlertDescription>
            {orchestrationState.alerts.slice(0, 3).map(alert => alert.message).join(', ')}
            {orchestrationState.alerts.length > 3 && ` and ${orchestrationState.alerts.length - 3} more...`}
          </AlertDescription>
        </Alert>
      )}

      {/* Active Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orchestrationState.executions
              .filter(exec => exec.status === 'running' || exec.status === 'paused')
              .slice(0, 5)
              .map(execution => (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="font-medium">{execution.name}</div>
                      <div className="text-sm text-gray-500">
                        Started {new Date(execution.started_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={execution.progress || 0} className="w-24" />
                    <span className="text-sm font-medium">{execution.progress || 0}%</span>
                  </div>
                </div>
              ))}
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
              {orchestrationState.events.slice(0, 20).map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 text-sm">
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

  const renderWorkflows = () => (
    <div className="space-y-6">
      {/* Workflow Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Management</h2>
          <p className="text-gray-600">Create, manage, and monitor workflow executions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewTemplateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button
            size="sm"
            onClick={() => setNewJobDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search workflows..."
              value={viewState.searchQuery}
              onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {viewState.selectedFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {viewState.selectedFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['running', 'completed', 'failed', 'paused', 'queued'].map(status => (
              <DropdownMenuItem
                key={status}
                onClick={() => {
                  setViewState(prev => ({
                    ...prev,
                    selectedFilters: prev.selectedFilters.includes(status)
                      ? prev.selectedFilters.filter(f => f !== status)
                      : [...prev.selectedFilters, status]
                  }));
                }}
              >
                <Checkbox
                  checked={viewState.selectedFilters.includes(status)}
                  className="mr-2"
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Select
          value={viewState.sortBy}
          onValueChange={(value) => setViewState(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewState(prev => ({ 
            ...prev, 
            gridView: !prev.gridView 
          }))}
        >
          {viewState.gridView ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        </Button>
      </div>

      {/* Workflows List/Grid */}
      {viewState.gridView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => (
            <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStartExecution(job)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{job.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={job.status === 'running' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Priority:</span>
                    <span>{job.priority || 'Medium'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Created:</span>
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <div>
                        <div className="font-medium">{job.name}</div>
                        <div className="text-sm text-gray-500">{job.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'running' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.priority || 'Medium'}</TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {job.last_execution_at 
                      ? new Date(job.last_execution_at).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartExecution(job)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Start Execution</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Job</TooltipContent>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
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
                <WorkflowIcon className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Rule Orchestration Center</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  orchestrationState.connectionStatus === 'connected' ? 'bg-green-500' :
                  orchestrationState.connectionStatus === 'disconnected' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {orchestrationState.connectionStatus}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={orchestrationState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${orchestrationState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewState(prev => ({ ...prev, fullscreen: !prev.fullscreen }))}
              >
                {viewState.fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Navigation Sidebar */}
          {!viewState.sidebarCollapsed && (
            <div className="w-64 bg-white border-r">
              <nav className="p-4 space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'workflows', label: 'Workflows', icon: Workflow },
                  { id: 'resources', label: 'Resources', icon: Server },
                  { id: 'monitoring', label: 'Monitoring', icon: MonitorSpeaker },
                  { id: 'templates', label: 'Templates', icon: Grid },
                  { id: 'history', label: 'History', icon: Clock }
                ].map(item => (
                  <Button
                    key={item.id}
                    variant={viewState.currentView === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setViewState(prev => ({ ...prev, currentView: item.id as any }))}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewState.currentView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {viewState.currentView === 'dashboard' && renderDashboard()}
                  {viewState.currentView === 'workflows' && renderWorkflows()}
                  {viewState.currentView === 'resources' && (
                    <div>Resource Management (To be implemented)</div>
                  )}
                  {viewState.currentView === 'monitoring' && (
                    <div>Monitoring Dashboard (To be implemented)</div>
                  )}
                  {viewState.currentView === 'templates' && (
                    <div>Template Management (To be implemented)</div>
                  )}
                  {viewState.currentView === 'history' && (
                    <div>Execution History (To be implemented)</div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* New Job Dialog */}
        <Dialog open={newJobDialogOpen} onOpenChange={setNewJobDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Orchestration Job</DialogTitle>
              <DialogDescription>
                Configure a new workflow job for execution
              </DialogDescription>
            </DialogHeader>
            {/* Job creation form would go here */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="job-name">Job Name</Label>
                <Input id="job-name" placeholder="Enter job name" />
              </div>
              <div>
                <Label htmlFor="job-description">Description</Label>
                <Textarea id="job-description" placeholder="Enter job description" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewJobDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleCreateJob({ name: 'New Job', description: 'Test job' })}>
                  Create Job
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configuration Dialog */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Orchestration Settings</DialogTitle>
              <DialogDescription>
                Configure orchestration center preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <Switch
                  id="auto-refresh"
                  checked={viewState.autoRefresh}
                  onCheckedChange={(checked) => 
                    setViewState(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="real-time">Real-time Mode</Label>
                <Switch
                  id="real-time"
                  checked={viewState.realTimeMode}
                  onCheckedChange={(checked) => 
                    setViewState(prev => ({ ...prev, realTimeMode: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="alerts">Enable Alerts</Label>
                <Switch
                  id="alerts"
                  checked={viewState.alertsEnabled}
                  onCheckedChange={(checked) => 
                    setViewState(prev => ({ ...prev, alertsEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound Notifications</Label>
                <Switch
                  id="sound"
                  checked={viewState.soundEnabled}
                  onCheckedChange={(checked) => 
                    setViewState(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleOrchestrationCenter;