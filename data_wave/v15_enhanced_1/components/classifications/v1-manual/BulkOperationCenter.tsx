import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui';
import {
  Upload,
  Download,
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Users,
  Database,
  FileText,
  Folder,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Target,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Layers,
  GitBranch,
  Gauge,
  Brain,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  DollarSign,
  Award,
  Bookmark,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Mail,
  Phone,
  Video,
  Image,
  Music,
  PlayCircle,
  PauseCircle,
  StopCircle,
} from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { classificationApi } from '../core/api/classificationApi';
import type {
  BulkOperation,
  BulkOperationConfig,
  BulkOperationResult,
  BulkOperationStatus,
  BulkOperationType,
  BulkOperationProgress,
  BulkOperationError,
  BulkOperationMetrics,
  DataSource,
  ClassificationRule,
  Framework,
  Policy,
  ValidationResult,
  ProcessingQueue,
  BatchConfiguration,
  ScheduleConfiguration,
  NotificationConfiguration,
  AuditTrail,
  UserPermission,
  ResourceLimit,
  QualityCheck,
  DataMapping,
  TransformationRule,
  OutputConfiguration,
} from '../core/types';

// Enhanced bulk operation types
interface BulkOperationTemplate {
  id: string;
  name: string;
  description: string;
  type: BulkOperationType;
  defaultConfig: BulkOperationConfig;
  estimatedTime: number;
  complexity: 'Low' | 'Medium' | 'High';
  resourceRequirements: ResourceRequirement[];
  prerequisites: string[];
  outputs: OutputType[];
  icon: React.ReactNode;
}

interface ResourceRequirement {
  type: 'cpu' | 'memory' | 'storage' | 'network';
  amount: number;
  unit: string;
  priority: 'low' | 'medium' | 'high';
}

interface OutputType {
  format: 'csv' | 'json' | 'xml' | 'xlsx' | 'pdf';
  description: string;
  size: string;
}

interface BulkOperationJob {
  id: string;
  name: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  progress: BulkOperationProgress;
  config: BulkOperationConfig;
  result?: BulkOperationResult;
  errors: BulkOperationError[];
  metrics: BulkOperationMetrics;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  owner: string;
  tags: string[];
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
}

interface QueueStatistics {
  totalJobs: number;
  runningJobs: number;
  pendingJobs: number;
  completedJobs: number;
  failedJobs: number;
  avgProcessingTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: number;
}

const BULK_OPERATION_TEMPLATES: BulkOperationTemplate[] = [
  {
    id: 'classify-documents',
    name: 'Classify Documents',
    description: 'Apply classification rules to a batch of documents',
    type: 'classification',
    defaultConfig: {
      batchSize: 100,
      parallelism: 4,
      retryPolicy: 'exponential',
      timeout: 3600,
    },
    estimatedTime: 300,
    complexity: 'Medium',
    resourceRequirements: [
      { type: 'cpu', amount: 2, unit: 'cores', priority: 'medium' },
      { type: 'memory', amount: 4, unit: 'GB', priority: 'medium' },
      { type: 'storage', amount: 1, unit: 'GB', priority: 'low' },
    ],
    prerequisites: ['Active classification rules', 'Valid data source'],
    outputs: [
      { format: 'csv', description: 'Classification results', size: '~10MB' },
      { format: 'json', description: 'Detailed metadata', size: '~5MB' },
    ],
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'import-rules',
    name: 'Import Rules',
    description: 'Bulk import classification rules from external sources',
    type: 'import',
    defaultConfig: {
      batchSize: 50,
      parallelism: 2,
      retryPolicy: 'linear',
      timeout: 1800,
    },
    estimatedTime: 180,
    complexity: 'Low',
    resourceRequirements: [
      { type: 'cpu', amount: 1, unit: 'cores', priority: 'low' },
      { type: 'memory', amount: 2, unit: 'GB', priority: 'low' },
      { type: 'storage', amount: 500, unit: 'MB', priority: 'medium' },
    ],
    prerequisites: ['Valid rule format', 'Import permissions'],
    outputs: [
      { format: 'json', description: 'Import summary', size: '~1MB' },
      { format: 'csv', description: 'Error log', size: '~500KB' },
    ],
    icon: <Upload className="h-4 w-4" />,
  },
  {
    id: 'export-data',
    name: 'Export Data',
    description: 'Export classified data in various formats',
    type: 'export',
    defaultConfig: {
      batchSize: 200,
      parallelism: 3,
      retryPolicy: 'exponential',
      timeout: 2400,
    },
    estimatedTime: 240,
    complexity: 'Medium',
    resourceRequirements: [
      { type: 'cpu', amount: 1.5, unit: 'cores', priority: 'medium' },
      { type: 'memory', amount: 3, unit: 'GB', priority: 'medium' },
      { type: 'storage', amount: 2, unit: 'GB', priority: 'high' },
    ],
    prerequisites: ['Export permissions', 'Valid data selection'],
    outputs: [
      { format: 'xlsx', description: 'Excel export', size: '~50MB' },
      { format: 'csv', description: 'CSV export', size: '~20MB' },
      { format: 'pdf', description: 'Report format', size: '~10MB' },
    ],
    icon: <Download className="h-4 w-4" />,
  },
  {
    id: 'validate-rules',
    name: 'Validate Rules',
    description: 'Validate classification rules against test data',
    type: 'validation',
    defaultConfig: {
      batchSize: 75,
      parallelism: 2,
      retryPolicy: 'linear',
      timeout: 1200,
    },
    estimatedTime: 120,
    complexity: 'Low',
    resourceRequirements: [
      { type: 'cpu', amount: 1, unit: 'cores', priority: 'low' },
      { type: 'memory', amount: 2, unit: 'GB', priority: 'low' },
      { type: 'storage', amount: 200, unit: 'MB', priority: 'low' },
    ],
    prerequisites: ['Test dataset', 'Active rules'],
    outputs: [
      { format: 'json', description: 'Validation report', size: '~2MB' },
      { format: 'csv', description: 'Error details', size: '~1MB' },
    ],
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    id: 'sync-policies',
    name: 'Sync Policies',
    description: 'Synchronize policies across multiple environments',
    type: 'synchronization',
    defaultConfig: {
      batchSize: 25,
      parallelism: 1,
      retryPolicy: 'exponential',
      timeout: 900,
    },
    estimatedTime: 90,
    complexity: 'High',
    resourceRequirements: [
      { type: 'cpu', amount: 0.5, unit: 'cores', priority: 'low' },
      { type: 'memory', amount: 1, unit: 'GB', priority: 'low' },
      { type: 'network', amount: 100, unit: 'Mbps', priority: 'high' },
    ],
    prerequisites: ['Environment access', 'Sync permissions'],
    outputs: [
      { format: 'json', description: 'Sync report', size: '~500KB' },
      { format: 'csv', description: 'Change log', size: '~300KB' },
    ],
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    id: 'cleanup-data',
    name: 'Cleanup Data',
    description: 'Remove obsolete or invalid classification data',
    type: 'cleanup',
    defaultConfig: {
      batchSize: 150,
      parallelism: 2,
      retryPolicy: 'linear',
      timeout: 1800,
    },
    estimatedTime: 180,
    complexity: 'Medium',
    resourceRequirements: [
      { type: 'cpu', amount: 1, unit: 'cores', priority: 'low' },
      { type: 'memory', amount: 2, unit: 'GB', priority: 'medium' },
      { type: 'storage', amount: 500, unit: 'MB', priority: 'medium' },
    ],
    prerequisites: ['Cleanup criteria', 'Admin permissions'],
    outputs: [
      { format: 'csv', description: 'Cleanup summary', size: '~1MB' },
      { format: 'json', description: 'Deleted items log', size: '~2MB' },
    ],
    icon: <Trash2 className="h-4 w-4" />,
  },
];

const BulkOperationCenter: React.FC = () => {
  // State management
  const {
    bulkOperations,
    isLoading,
    error,
    createBulkOperation,
    updateBulkOperation,
    deleteBulkOperation,
    getBulkOperationStatus,
    cancelBulkOperation,
    retryBulkOperation,
  } = useClassificationState();

  const [activeTab, setActiveTab] = useState('operations');
  const [selectedTemplate, setSelectedTemplate] = useState<BulkOperationTemplate | null>(null);
  const [operationJobs, setOperationJobs] = useState<BulkOperationJob[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStatistics | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentConfig, setCurrentConfig] = useState<BulkOperationConfig | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Load initial data
  useEffect(() => {
    loadOperationJobs();
    loadQueueStatistics();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadOperationJobs();
        loadQueueStatistics();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadOperationJobs = useCallback(async () => {
    try {
      const response = await classificationApi.getBulkOperations();
      const jobs: BulkOperationJob[] = response.data.map((op: BulkOperation) => ({
        id: op.id,
        name: op.name,
        type: op.type,
        status: op.status,
        progress: op.progress,
        config: op.config,
        result: op.result,
        errors: op.errors || [],
        metrics: op.metrics || {
          totalItems: 0,
          processedItems: 0,
          successfulItems: 0,
          failedItems: 0,
          processingRate: 0,
          estimatedTimeRemaining: 0,
        },
        createdAt: new Date(op.created_at),
        startedAt: op.started_at ? new Date(op.started_at) : undefined,
        completedAt: op.completed_at ? new Date(op.completed_at) : undefined,
        estimatedCompletion: op.estimated_completion ? new Date(op.estimated_completion) : undefined,
        priority: op.priority || 'medium',
        owner: op.owner || 'Unknown',
        tags: op.tags || [],
        dependencies: op.dependencies || [],
        retryCount: op.retry_count || 0,
        maxRetries: op.max_retries || 3,
      }));
      setOperationJobs(jobs);
    } catch (error) {
      console.error('Error loading operation jobs:', error);
    }
  }, []);

  const loadQueueStatistics = useCallback(async () => {
    try {
      const response = await classificationApi.getBulkOperationStats();
      setQueueStats(response.data);
    } catch (error) {
      console.error('Error loading queue statistics:', error);
    }
  }, []);

  // Filtered and sorted jobs
  const filteredJobs = useMemo(() => {
    let filtered = operationJobs.filter(job => {
      const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof BulkOperationJob];
      let bValue: any = b[sortBy as keyof BulkOperationJob];
      
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [operationJobs, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Event handlers
  const handleCreateOperation = useCallback(async () => {
    if (!selectedTemplate || !currentConfig) return;

    try {
      const operationConfig: BulkOperationConfig = {
        ...selectedTemplate.defaultConfig,
        ...currentConfig,
        template: selectedTemplate.id,
      };

      await createBulkOperation({
        name: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        type: selectedTemplate.type,
        config: operationConfig,
      });

      setShowCreateDialog(false);
      setSelectedTemplate(null);
      setCurrentConfig(null);
      loadOperationJobs();
    } catch (error) {
      console.error('Error creating bulk operation:', error);
    }
  }, [selectedTemplate, currentConfig, createBulkOperation]);

  const handleJobAction = useCallback(async (jobId: string, action: string) => {
    try {
      switch (action) {
        case 'start':
          await classificationApi.startBulkOperation(jobId);
          break;
        case 'pause':
          await classificationApi.pauseBulkOperation(jobId);
          break;
        case 'cancel':
          await cancelBulkOperation(jobId);
          break;
        case 'retry':
          await retryBulkOperation(jobId);
          break;
        case 'delete':
          await deleteBulkOperation(jobId);
          break;
      }
      loadOperationJobs();
    } catch (error) {
      console.error(`Error performing ${action} on job ${jobId}:`, error);
    }
  }, [cancelBulkOperation, retryBulkOperation, deleteBulkOperation]);

  const handleBulkAction = useCallback(async (action: string) => {
    const jobIds = Array.from(selectedJobs);
    
    try {
      await Promise.all(jobIds.map(jobId => handleJobAction(jobId, action)));
      setSelectedJobs(new Set());
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  }, [selectedJobs, handleJobAction]);

  const handleJobSelection = useCallback((jobId: string, selected: boolean) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)));
    } else {
      setSelectedJobs(new Set());
    }
  }, [filteredJobs]);

  // Utility functions
  const getStatusIcon = useCallback((status: BulkOperationStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'running': return <Play className="h-4 w-4 text-blue-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-orange-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <Square className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const formatDuration = useCallback((seconds: number) => {
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
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              Bulk Operation Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor large-scale classification operations with advanced workflow orchestration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Operation
            </Button>
          </div>
        </div>

        {/* Queue Statistics */}
        {queueStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{queueStats.totalJobs}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Running: {queueStats.runningJobs}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Pending: {queueStats.pendingJobs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{((1 - queueStats.errorRate) * 100).toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <Progress value={(1 - queueStats.errorRate) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                    <p className="text-2xl font-bold">{queueStats.throughput.toFixed(1)}/min</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    Avg processing: {formatDuration(queueStats.avgProcessingTime)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resource Usage</p>
                    <p className="text-2xl font-bold">{queueStats.resourceUtilization.toFixed(0)}%</p>
                  </div>
                  <Gauge className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-4">
                  <Progress value={queueStats.resourceUtilization} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            {/* Filters and Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Operation Queue</CardTitle>
                    <CardDescription>
                      Manage and monitor bulk classification operations
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedJobs.size > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkAction('start')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Selected
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkAction('pause')}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Selected
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkAction('cancel')}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Cancel Selected
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search operations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                  {showAdvancedOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Date Range</Label>
                            <Select value={dateRange} onValueChange={setDateRange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1d">Last 24 Hours</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Sort By</Label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="createdAt">Created Date</SelectItem>
                                <SelectItem value="startedAt">Start Date</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="progress">Progress</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Sort Order</Label>
                            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desc">Descending</SelectItem>
                                <SelectItem value="asc">Ascending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Operations Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Switch
                            checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Operation</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Switch
                              checked={selectedJobs.has(job.id)}
                              onCheckedChange={(checked) => handleJobSelection(job.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{job.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {job.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(job.status)}
                              <span className="capitalize">{job.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{job.progress.percentage}%</span>
                                <span>{job.metrics.processedItems}/{job.metrics.totalItems}</span>
                              </div>
                              <Progress value={job.progress.percentage} className="h-2" />
                              {job.status === 'running' && job.metrics.estimatedTimeRemaining > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  ETA: {formatDuration(job.metrics.estimatedTimeRemaining)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(job.priority)}>
                              {job.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.owner}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {job.createdAt.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {job.createdAt.toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {job.status === 'pending' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleJobAction(job.id, 'start')}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Start Operation</TooltipContent>
                                </Tooltip>
                              )}
                              
                              {job.status === 'running' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleJobAction(job.id, 'pause')}
                                    >
                                      <Pause className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Pause Operation</TooltipContent>
                                </Tooltip>
                              )}
                              
                              {job.status === 'paused' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleJobAction(job.id, 'start')}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Resume Operation</TooltipContent>
                                </Tooltip>
                              )}
                              
                              {(job.status === 'running' || job.status === 'pending') && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleJobAction(job.id, 'cancel')}
                                    >
                                      <Square className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Cancel Operation</TooltipContent>
                                </Tooltip>
                              )}
                              
                              {job.status === 'failed' && job.retryCount < job.maxRetries && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleJobAction(job.id, 'retry')}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Retry Operation</TooltipContent>
                                </Tooltip>
                              )}
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              
                              {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleJobAction(job.id, 'delete')}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Operation</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No operations found</p>
                    <p className="text-sm">Create a new bulk operation to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Operation Templates</CardTitle>
                <CardDescription>
                  Pre-configured templates for common bulk operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {BULK_OPERATION_TEMPLATES.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setCurrentConfig(template.defaultConfig);
                          setShowCreateDialog(true);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                              {template.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{template.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {template.description}
                              </p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Complexity:</span>
                                  <Badge variant={
                                    template.complexity === 'Low' ? 'default' : 
                                    template.complexity === 'Medium' ? 'secondary' : 'destructive'
                                  }>
                                    {template.complexity}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>Est. Time:</span>
                                  <span>{formatDuration(template.estimatedTime)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>Outputs:</span>
                                  <span>{template.outputs.length} formats</span>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t">
                                <div className="text-xs text-muted-foreground">
                                  <div>Prerequisites:</div>
                                  <ul className="list-disc list-inside mt-1">
                                    {template.prerequisites.slice(0, 2).map((prereq, index) => (
                                      <li key={index}>{prereq}</li>
                                    ))}
                                    {template.prerequisites.length > 2 && (
                                      <li>+{template.prerequisites.length - 2} more</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scheduled Operations</CardTitle>
                    <CardDescription>
                      Manage recurring and scheduled bulk operations
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowScheduleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Operation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Daily Classification Cleanup</div>
                      <div className="text-sm text-muted-foreground">
                        Every day at 2:00 AM • Next run: Tomorrow at 2:00 AM
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">cleanup</Badge>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Weekly Policy Sync</div>
                      <div className="text-sm text-muted-foreground">
                        Every Sunday at 6:00 PM • Next run: Sunday at 6:00 PM
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">synchronization</Badge>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Monthly Export Report</div>
                      <div className="text-sm text-muted-foreground">
                        First day of each month • Next run: February 1st
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">export</Badge>
                        <Badge variant="secondary">Paused</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Operation performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {queueStats?.throughput.toFixed(1) || '0'}
                        </div>
                        <div className="text-sm text-muted-foreground">Operations/min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {queueStats ? formatDuration(queueStats.avgProcessingTime) : '0s'}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Duration</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm">
                          {queueStats ? ((1 - queueStats.errorRate) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                      <Progress value={queueStats ? (1 - queueStats.errorRate) * 100 : 0} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Resource Utilization</span>
                        <span className="text-sm">
                          {queueStats?.resourceUtilization.toFixed(0) || '0'}%
                        </span>
                      </div>
                      <Progress value={queueStats?.resourceUtilization || 0} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    System Health
                  </CardTitle>
                  <CardDescription>
                    Current system status and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">System Operational</div>
                        <div className="text-sm text-green-700">All services running normally</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-yellow-900">High Queue Load</div>
                        <div className="text-sm text-yellow-700">Consider scaling resources</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Queue Capacity</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>62%</span>
                      </div>
                      <Progress value={62} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest operation events and status changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Classification operation completed</div>
                      <div className="text-xs text-muted-foreground">
                        Document batch #1247 • 2 minutes ago
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">New operation started</div>
                      <div className="text-xs text-muted-foreground">
                        Policy sync #892 • 5 minutes ago
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Operation paused</div>
                      <div className="text-xs text-muted-foreground">
                        Export job #445 • 8 minutes ago
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Operation failed</div>
                      <div className="text-xs text-muted-foreground">
                        Import rules #223 • 12 minutes ago
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Validation completed</div>
                      <div className="text-xs text-muted-foreground">
                        Rule validation #156 • 15 minutes ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Operation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Bulk Operation</DialogTitle>
              <DialogDescription>
                Configure a new bulk operation using the selected template
              </DialogDescription>
            </DialogHeader>
            
            {selectedTemplate && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Operation Name</Label>
                    <Input 
                      placeholder="Enter operation name"
                      defaultValue={`${selectedTemplate.name} - ${new Date().toLocaleDateString()}`}
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Batch Size</Label>
                    <Input 
                      type="number"
                      defaultValue={selectedTemplate.defaultConfig.batchSize}
                    />
                  </div>
                  <div>
                    <Label>Parallelism</Label>
                    <Input 
                      type="number"
                      defaultValue={selectedTemplate.defaultConfig.parallelism}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Data Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upload">File Upload</SelectItem>
                      <SelectItem value="database">Database Query</SelectItem>
                      <SelectItem value="api">API Endpoint</SelectItem>
                      <SelectItem value="existing">Existing Dataset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Notification Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-start" defaultChecked />
                      <Label htmlFor="notify-start">Notify on start</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-complete" defaultChecked />
                      <Label htmlFor="notify-complete">Notify on completion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-error" defaultChecked />
                      <Label htmlFor="notify-error">Notify on errors</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOperation}>
                    Create Operation
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default BulkOperationCenter;