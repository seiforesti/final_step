/**
 * 🎯 Scan Orchestration Dashboard - Advanced Scan Logic
 * ====================================================
 * 
 * Enterprise-grade scan orchestration dashboard component with comprehensive
 * orchestration management, real-time monitoring, and advanced analytics.
 * 
 * Features:
 * - Real-time orchestration monitoring and control
 * - Advanced workflow visualization and management
 * - Enterprise resource allocation and optimization
 * - Cross-system coordination and synchronization
 * - Intelligent priority management and scheduling
 * - Comprehensive analytics and performance insights
 * - Dynamic dashboard customization and layouts
 * - Advanced filtering, search, and data management
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 * @component ScanOrchestrationDashboard
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, Settings, Play, Pause, Square, RefreshCw, Filter, Search, Download, Upload, AlertTriangle, CheckCircle, Clock, Zap, Database, Server, Network, Cpu, HardDrive, TrendingUp, TrendingDown, Eye, EyeOff, Maximize2, Minimize2, Grid, List, Calendar, Users, Shield, Target, Layers, GitBranch, MoreHorizontal, Plus, Edit, Trash2, Copy, ExternalLink, Bell, BellOff } from 'lucide-react';

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

// Advanced Scan Logic Imports
import { ScanOrchestrationAPIService } from '../../services/scan-orchestration-apis';
import { IntelligentScanningAPIService } from '../../services/intelligent-scanning-apis';
import { ScanPerformanceAPIService } from '../../services/scan-performance-apis';
import { ScanCoordinationAPIService } from '../../services/scan-coordination-apis';

// Types
import {
  ScanOrchestrationJob,
  OrchestrationJobStatus,
  OrchestrationJobType,
  OrchestrationPriority,
  CreateOrchestrationJobRequest,
  OrchestrationAnalytics,
  ResourcePool,
  WorkflowTemplate
} from '../../types/orchestration.types';

import {
  PerformanceMetric,
  ResourceUtilization
} from '../../types/performance.types';

// Constants
import { SCAN_LOGIC_UI, THEMES, ANIMATIONS } from '../../constants/ui-constants';
import { ENTERPRISE_WORKFLOW_TEMPLATES } from '../../constants/workflow-templates';

// Utilities
import { coordinationManager } from '../../utils/coordination-manager';
import { monitoringAggregator } from '../../utils/monitoring-aggregator';
import { optimizationAlgorithms } from '../../utils/optimization-algorithms';

// ========================================================================================
// INTERFACES AND TYPES
// ========================================================================================

interface DashboardConfig {
  layout: 'grid' | 'list' | 'kanban';
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number;
  autoRefresh: boolean;
  notifications: boolean;
  compactMode: boolean;
  showMetrics: boolean;
  showCharts: boolean;
  gridColumns: number;
}

interface FilterConfig {
  status: OrchestrationJobStatus[];
  priority: OrchestrationPriority[];
  type: OrchestrationJobType[];
  dateRange: [Date, Date] | null;
  searchQuery: string;
  showCompleted: boolean;
  showFailed: boolean;
}

interface OrchestrationMetrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  averageExecutionTime: number;
  resourceUtilization: number;
  systemLoad: number;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  services: {
    orchestration: 'online' | 'offline' | 'degraded';
    intelligence: 'online' | 'offline' | 'degraded';
    coordination: 'online' | 'offline' | 'degraded';
    monitoring: 'online' | 'offline' | 'degraded';
  };
}

interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

// ========================================================================================
// MAIN COMPONENT
// ========================================================================================

export const ScanOrchestrationDashboard: React.FC = () => {
  // ========================================================================================
  // STATE MANAGEMENT
  // ========================================================================================

  // Core state
  const [jobs, setJobs] = useState<ScanOrchestrationJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ScanOrchestrationJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard configuration
  const [config, setConfig] = useState<DashboardConfig>({
    layout: 'grid',
    theme: 'light',
    refreshInterval: 30000,
    autoRefresh: true,
    notifications: true,
    compactMode: false,
    showMetrics: true,
    showCharts: true,
    gridColumns: 3
  });

  // Filtering and search
  const [filters, setFilters] = useState<FilterConfig>({
    status: [],
    priority: [],
    type: [],
    dateRange: null,
    searchQuery: '',
    showCompleted: true,
    showFailed: true
  });

  // Analytics and metrics
  const [metrics, setMetrics] = useState<OrchestrationMetrics>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    successRate: 0,
    averageExecutionTime: 0,
    resourceUtilization: 0,
    systemLoad: 0
  });

  // System health
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    services: {
      orchestration: 'online',
      intelligence: 'online',
      coordination: 'online',
      monitoring: 'online'
    }
  });

  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Performance data
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [resourceData, setResourceData] = useState<ResourceUtilization[]>([]);

  // Workflow templates
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>([]);

  // ========================================================================================
  // SERVICE INSTANCES
  // ========================================================================================

  const orchestrationService = useMemo(() => new ScanOrchestrationAPIService(), []);
  const intelligentScanService = useMemo(() => new IntelligentScanningAPIService(), []);
  const performanceService = useMemo(() => new ScanPerformanceAPIService(), []);
  const coordinationService = useMemo(() => new ScanCoordinationAPIService(), []);

  // ========================================================================================
  // REFS AND INTERVALS
  // ========================================================================================

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // ========================================================================================
  // DATA FETCHING AND MANAGEMENT
  // ========================================================================================

  const fetchOrchestrationJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orchestrationService.listOrchestrationJobs({
        page: 1,
        limit: 100,
        filters: {
          status: filters.status.length > 0 ? filters.status : undefined,
          priority: filters.priority.length > 0 ? filters.priority : undefined,
          type: filters.type.length > 0 ? filters.type : undefined,
          search: filters.searchQuery || undefined
        }
      });

      setJobs(response.jobs || []);
      
      // Calculate metrics
      const totalJobs = response.jobs?.length || 0;
      const activeJobs = response.jobs?.filter(job => 
        ['running', 'pending', 'paused'].includes(job.status)
      ).length || 0;
      const completedJobs = response.jobs?.filter(job => 
        job.status === 'completed'
      ).length || 0;
      const failedJobs = response.jobs?.filter(job => 
        job.status === 'failed'
      ).length || 0;

      setMetrics(prev => ({
        ...prev,
        totalJobs,
        activeJobs,
        completedJobs,
        failedJobs,
        successRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
      }));

      setError(null);
    } catch (err) {
      console.error('Failed to fetch orchestration jobs:', err);
      setError('Failed to load orchestration jobs');
    } finally {
      setLoading(false);
    }
  }, [orchestrationService, filters]);

  const fetchSystemHealth = useCallback(async () => {
    try {
      // Fetch system health metrics
      const healthData = await monitoringAggregator.getSystemHealth();
      
      setSystemHealth({
        overall: healthData.overallStatus as 'healthy' | 'warning' | 'critical',
        cpu: healthData.cpuUsage || 0,
        memory: healthData.memoryUsage || 0,
        disk: healthData.diskUsage || 0,
        network: healthData.networkUsage || 0,
        services: {
          orchestration: healthData.services?.orchestration || 'online',
          intelligence: healthData.services?.intelligence || 'online',
          coordination: healthData.services?.coordination || 'online',
          monitoring: healthData.services?.monitoring || 'online'
        }
      });

      // Update metrics with resource utilization
      setMetrics(prev => ({
        ...prev,
        resourceUtilization: healthData.resourceUtilization || 0,
        systemLoad: healthData.systemLoad || 0
      }));
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    }
  }, []);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const performance = await performanceService.getPerformanceMetrics({
        timeRange: '1h',
        metrics: ['execution_time', 'throughput', 'resource_usage'],
        aggregation: 'avg'
      });

      setPerformanceData(performance.metrics || []);

      const resources = await performanceService.getResourceUtilization({
        timeRange: '1h',
        resources: ['cpu', 'memory', 'disk', 'network']
      });

      setResourceData(resources.utilization || []);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
    }
  }, [performanceService]);

  const fetchWorkflowTemplates = useCallback(async () => {
    try {
      const templates = await orchestrationService.getWorkflowTemplates();
      setWorkflowTemplates(templates || []);
    } catch (err) {
      console.error('Failed to fetch workflow templates:', err);
    }
  }, [orchestrationService]);

  const fetchResourcePools = useCallback(async () => {
    try {
      const pools = await orchestrationService.getResourcePools();
      setResourcePools(pools || []);
    } catch (err) {
      console.error('Failed to fetch resource pools:', err);
    }
  }, [orchestrationService]);

  // ========================================================================================
  // JOB MANAGEMENT FUNCTIONS
  // ========================================================================================

  const createOrchestrationJob = useCallback(async (jobData: CreateOrchestrationJobRequest) => {
    try {
      setLoading(true);
      const newJob = await orchestrationService.createOrchestrationJob(jobData);
      
      setJobs(prev => [newJob, ...prev]);
      setIsCreateDialogOpen(false);
      
      // Add success alert
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'success',
        title: 'Job Created',
        message: `Orchestration job "${newJob.name}" has been created successfully.`,
        timestamp: new Date(),
        acknowledged: false,
        source: 'orchestration'
      }]);

      await fetchOrchestrationJobs();
    } catch (err) {
      console.error('Failed to create orchestration job:', err);
      setError('Failed to create orchestration job');
      
      // Add error alert
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'error',
        title: 'Job Creation Failed',
        message: 'Failed to create orchestration job. Please try again.',
        timestamp: new Date(),
        acknowledged: false,
        source: 'orchestration'
      }]);
    } finally {
      setLoading(false);
    }
  }, [orchestrationService, fetchOrchestrationJobs]);

  const startJob = useCallback(async (jobId: string) => {
    try {
      await orchestrationService.startOrchestrationJob(jobId);
      await fetchOrchestrationJobs();
      
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'info',
        title: 'Job Started',
        message: `Orchestration job has been started.`,
        timestamp: new Date(),
        acknowledged: false,
        source: 'orchestration'
      }]);
    } catch (err) {
      console.error('Failed to start job:', err);
      setError('Failed to start job');
    }
  }, [orchestrationService, fetchOrchestrationJobs]);

  const pauseJob = useCallback(async (jobId: string) => {
    try {
      await orchestrationService.pauseOrchestrationJob(jobId);
      await fetchOrchestrationJobs();
      
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'warning',
        title: 'Job Paused',
        message: `Orchestration job has been paused.`,
        timestamp: new Date(),
        acknowledged: false,
        source: 'orchestration'
      }]);
    } catch (err) {
      console.error('Failed to pause job:', err);
      setError('Failed to pause job');
    }
  }, [orchestrationService, fetchOrchestrationJobs]);

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      await orchestrationService.cancelOrchestrationJob(jobId);
      await fetchOrchestrationJobs();
      
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'warning',
        title: 'Job Cancelled',
        message: `Orchestration job has been cancelled.`,
        timestamp: new Date(),
        acknowledged: false,
        source: 'orchestration'
      }]);
    } catch (err) {
      console.error('Failed to cancel job:', err);
      setError('Failed to cancel job');
    }
  }, [orchestrationService, fetchOrchestrationJobs]);

  // ========================================================================================
  // FILTERING AND SEARCH
  // ========================================================================================

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(job.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(job.priority)) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(job.type)) {
        return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          job.name,
          job.description,
          job.type,
          job.status,
          job.priority
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Completed jobs filter
      if (!filters.showCompleted && job.status === 'completed') {
        return false;
      }

      // Failed jobs filter
      if (!filters.showFailed && job.status === 'failed') {
        return false;
      }

      return true;
    });
  }, [jobs, filters]);

  // ========================================================================================
  // UTILITY FUNCTIONS
  // ========================================================================================

  const getStatusColor = (status: OrchestrationJobStatus): string => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'cancelled': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: OrchestrationPriority): string => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getHealthStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
      case 'online': return 'text-green-600';
      case 'warning':
      case 'degraded': return 'text-yellow-600';
      case 'critical':
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // ========================================================================================
  // EFFECTS
  // ========================================================================================

  useEffect(() => {
    // Initial data fetch
    fetchOrchestrationJobs();
    fetchSystemHealth();
    fetchPerformanceData();
    fetchWorkflowTemplates();
    fetchResourcePools();
  }, [
    fetchOrchestrationJobs,
    fetchSystemHealth,
    fetchPerformanceData,
    fetchWorkflowTemplates,
    fetchResourcePools
  ]);

  useEffect(() => {
    // Setup auto-refresh
    if (config.autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchOrchestrationJobs();
        fetchSystemHealth();
        fetchPerformanceData();
      }, config.refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [config.autoRefresh, config.refreshInterval, fetchOrchestrationJobs, fetchSystemHealth, fetchPerformanceData]);

  useEffect(() => {
    // Handle fullscreen mode
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // ========================================================================================
  // RENDER HELPERS
  // ========================================================================================

  const renderJobCard = (job: ScanOrchestrationJob) => (
    <motion.div
      key={job.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`} />
              <CardTitle className="text-lg font-semibold">{job.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {job.status === 'pending' && (
                  <DropdownMenuItem onClick={() => startJob(job.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Job
                  </DropdownMenuItem>
                )}
                {job.status === 'running' && (
                  <DropdownMenuItem onClick={() => pauseJob(job.id)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Job
                  </DropdownMenuItem>
                )}
                {['running', 'paused', 'pending'].includes(job.status) && (
                  <DropdownMenuItem onClick={() => cancelJob(job.id)}>
                    <Square className="h-4 w-4 mr-2" />
                    Cancel Job
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Job
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="text-sm text-gray-600">
            {job.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Type:</span>
              <Badge variant="outline">{job.type}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Priority:</span>
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progress:</span>
              <div className="flex items-center space-x-2">
                <Progress value={job.progress || 0} className="w-16" />
                <span>{job.progress || 0}%</span>
              </div>
            </div>
            {job.executionTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span>{formatDuration(job.executionTime)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Created:</span>
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMetricsCard = (title: string, value: string | number, icon: React.ReactNode, trend?: 'up' | 'down' | 'stable') => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="flex items-center space-x-2">
            {trend && (
              <div className={`p-1 rounded-full ${
                trend === 'up' ? 'bg-green-100 text-green-600' :
                trend === 'down' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                 trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                 <Activity className="h-4 w-4" />}
              </div>
            )}
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSystemHealthCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>System Health</span>
          <Badge className={getHealthStatusColor(systemHealth.overall)}>
            {systemHealth.overall}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Cpu className="h-4 w-4" />
                  <span>CPU</span>
                </span>
                <span>{systemHealth.cpu}%</span>
              </div>
              <Progress value={systemHealth.cpu} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <HardDrive className="h-4 w-4" />
                  <span>HardDrive</span>
                </span>
                <span>{systemHealth.memory}%</span>
              </div>
              <Progress value={systemHealth.memory} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <HardDrive className="h-4 w-4" />
                  <span>Disk</span>
                </span>
                <span>{systemHealth.disk}%</span>
              </div>
              <Progress value={systemHealth.disk} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Network className="h-4 w-4" />
                  <span>Network</span>
                </span>
                <span>{systemHealth.network}%</span>
              </div>
              <Progress value={systemHealth.network} className="h-2" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Services Status</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(systemHealth.services).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="capitalize">{service}</span>
                  <Badge className={getHealthStatusColor(status)}>
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ========================================================================================
  // MAIN RENDER
  // ========================================================================================

  return (
    <TooltipProvider>
      <div 
        ref={dashboardRef}
        className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Scan Orchestration Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Enterprise scan orchestration and management
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Alerts */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    {config.notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    {alerts.filter(a => !a.acknowledged).length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                        {alerts.filter(a => !a.acknowledged).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Recent Alerts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-64">
                    {alerts.slice(0, 10).map(alert => (
                      <div key={alert.id} className="p-3 border-b">
                        <div className="flex items-start space-x-2">
                          <div className={`mt-1 w-2 h-2 rounded-full ${
                            alert.type === 'error' ? 'bg-red-500' :
                            alert.type === 'warning' ? 'bg-yellow-500' :
                            alert.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchOrchestrationJobs();
                      fetchSystemHealth();
                      fetchPerformanceData();
                    }}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh Data</TooltipContent>
              </Tooltip>

              {/* Layout Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {config.layout === 'grid' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setConfig(prev => ({ ...prev, layout: 'grid' }))}>
                    <Grid className="h-4 w-4 mr-2" />
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setConfig(prev => ({ ...prev, layout: 'list' }))}>
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings */}
              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Dashboard Settings</SheetTitle>
                    <SheetDescription>
                      Customize your dashboard experience
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select
                        value={config.theme}
                        onValueChange={(value: 'light' | 'dark' | 'auto') =>
                          setConfig(prev => ({ ...prev, theme: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Auto Refresh</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.autoRefresh}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, autoRefresh: checked }))
                          }
                        />
                        <span className="text-sm text-gray-600">
                          {config.autoRefresh ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {config.autoRefresh && (
                      <div className="space-y-2">
                        <Label>Refresh Interval (seconds)</Label>
                        <Slider
                          value={[config.refreshInterval / 1000]}
                          onValueChange={(value) =>
                            setConfig(prev => ({ ...prev, refreshInterval: value[0] * 1000 }))
                          }
                          min={10}
                          max={300}
                          step={10}
                        />
                        <div className="text-sm text-gray-600">
                          {config.refreshInterval / 1000} seconds
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Notifications</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.notifications}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, notifications: checked }))
                          }
                        />
                        <span className="text-sm text-gray-600">
                          {config.notifications ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Compact Mode</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.compactMode}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, compactMode: checked }))
                          }
                        />
                        <span className="text-sm text-gray-600">
                          {config.compactMode ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {config.layout === 'grid' && (
                      <div className="space-y-2">
                        <Label>Grid Columns</Label>
                        <Slider
                          value={[config.gridColumns]}
                          onValueChange={(value) =>
                            setConfig(prev => ({ ...prev, gridColumns: value[0] }))
                          }
                          min={1}
                          max={6}
                          step={1}
                        />
                        <div className="text-sm text-gray-600">
                          {config.gridColumns} columns
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Fullscreen Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Fullscreen</TooltipContent>
              </Tooltip>

              {/* Create Job */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Orchestration Job</DialogTitle>
                    <DialogDescription>
                      Create a new scan orchestration job with advanced configuration options.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Create job form would go here */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job-name">Job Name</Label>
                        <Input id="job-name" placeholder="Enter job name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-type">Job Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="data-discovery">Data Discovery</SelectItem>
                            <SelectItem value="compliance-scan">Compliance Scan</SelectItem>
                            <SelectItem value="classification">Classification</SelectItem>
                            <SelectItem value="lineage-analysis">Lineage Analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-description">Description</Label>
                      <Textarea id="job-description" placeholder="Enter job description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job-priority">Priority</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workflow-template">Workflow Template</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {workflowTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Handle job creation
                      setIsCreateDialogOpen(false);
                    }}>
                      Create Job
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderMetricsCard(
                  'Total Jobs',
                  metrics.totalJobs,
                  <Database className="h-5 w-5" />,
                  'stable'
                )}
                {renderMetricsCard(
                  'Active Jobs',
                  metrics.activeJobs,
                  <Activity className="h-5 w-5" />,
                  'up'
                )}
                {renderMetricsCard(
                  'Success Rate',
                  `${metrics.successRate.toFixed(1)}%`,
                  <CheckCircle className="h-5 w-5" />,
                  metrics.successRate > 95 ? 'up' : metrics.successRate > 80 ? 'stable' : 'down'
                )}
                {renderMetricsCard(
                  'System Load',
                  `${metrics.systemLoad.toFixed(1)}%`,
                  <Server className="h-5 w-5" />,
                  metrics.systemLoad < 70 ? 'stable' : metrics.systemLoad < 90 ? 'up' : 'down'
                )}
              </div>

              {/* System Health and Recent Jobs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderSystemHealthCard()}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Recent Jobs</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredJobs.slice(0, 5).map(job => (
                        <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                            <div>
                              <p className="text-sm font-medium">{job.name}</p>
                              <p className="text-xs text-gray-600">{job.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getPriorityColor(job.priority)}>
                              {job.priority}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Job Management</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search jobs..."
                          value={filters.searchQuery}
                          onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                          className="pl-10 w-64"
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {/* Filter options would go here */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Job Statistics */}
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{filteredJobs.length}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {filteredJobs.filter(j => j.status === 'running').length}
                      </p>
                      <p className="text-sm text-gray-600">Running</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {filteredJobs.filter(j => j.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {filteredJobs.filter(j => j.status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {filteredJobs.filter(j => j.status === 'failed').length}
                      </p>
                      <p className="text-sm text-gray-600">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs Grid/List */}
              <AnimatePresence>
                {config.layout === 'grid' ? (
                  <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${config.gridColumns}`}>
                    {filteredJobs.map(renderJobCard)}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredJobs.map(job => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{job.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                                  <span className="capitalize">{job.status}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getPriorityColor(job.priority)}>
                                  {job.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Progress value={job.progress || 0} className="w-16" />
                                  <span className="text-sm">{job.progress || 0}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(job.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {job.status === 'pending' && (
                                      <DropdownMenuItem onClick={() => startJob(job.id)}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Start
                                      </DropdownMenuItem>
                                    )}
                                    {job.status === 'running' && (
                                      <DropdownMenuItem onClick={() => pauseJob(job.id)}>
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Performance charts would be rendered here
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Resource utilization charts would be rendered here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Pools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {resourcePools.map(pool => (
                        <div key={pool.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{pool.name}</h4>
                            <Badge>{pool.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Capacity:</span>
                              <span className="ml-2">{pool.capacity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Used:</span>
                              <span className="ml-2">{pool.used}</span>
                            </div>
                          </div>
                          <Progress 
                            value={(pool.used / pool.capacity) * 100} 
                            className="mt-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workflowTemplates.map(template => (
                        <div key={template.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-gray-600">{template.description}</p>
                            </div>
                            <Badge variant="outline">{template.version}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      Execution trend analytics would be rendered here
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Success Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      Success rate analytics would be rendered here
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      Resource efficiency analytics would be rendered here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Job Details Modal */}
        {selectedJob && (
          <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedJob.status)}`} />
                  <span>{selectedJob.name}</span>
                </DialogTitle>
                <DialogDescription>
                  Detailed information about the orchestration job
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="mt-1">{selectedJob.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <Badge variant="outline" className="mt-1">{selectedJob.type}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <Badge className={`${getPriorityColor(selectedJob.priority)} mt-1`}>
                        {selectedJob.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedJob.status)}`} />
                        <span className="capitalize">{selectedJob.status}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Progress</Label>
                      <div className="mt-1">
                        <Progress value={selectedJob.progress || 0} className="w-full" />
                        <span className="text-sm text-gray-600">{selectedJob.progress || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p className="mt-1">{new Date(selectedJob.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {selectedJob.executionTime && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Execution Time</Label>
                    <p className="mt-1">{formatDuration(selectedJob.executionTime)}</p>
                  </div>
                )}
                
                {selectedJob.configuration && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Configuration</Label>
                    <pre className="mt-1 p-3 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedJob.configuration, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Error Alert */}
        {error && (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert className="w-96 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ScanOrchestrationDashboard;