import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Play,
  Pause,
  Stop,
  RotateCcw,
  FastForward,
  Settings,
  Monitor,
  Activity,
  TrendingUp,
  Database,
  Brain,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Download,
  Upload,
  Edit,
  Trash2,
  Copy,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Layers,
  GitBranch,
  Code,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  MoreVertical,
  RefreshCw,
  Calendar,
  Users,
  Globe,
  Lock,
  Unlock,
  History,
  BookOpen,
  Lightbulb,
  Award,
  Gauge,
  Timer,
  Sparkles,
  Workflow,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Package,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { toast } from 'sonner';

import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { 
  TrainingJob, 
  MLModel, 
  TrainingPipeline,
  PipelineStage,
  PipelineTemplate,
  PipelineMetrics,
  TrainingConfiguration,
  HyperparameterConfig,
  DatasetInfo,
  ValidationConfig,
  DeploymentConfig,
  MLNotification,
  PipelineExecution,
  PipelineOptimization,
  ResourceAllocation,
  TrainingJobCreate
} from '../core/types';

// Enhanced interfaces for training pipeline management
interface PipelineStageProgress {
  stageId: string;
  stageName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs: string[];
  metrics?: Record<string, number>;
  error?: string;
}

interface PipelineVisualization {
  stages: PipelineStageProgress[];
  dependencies: Array<{ from: string; to: string }>;
  criticalPath: string[];
  totalDuration: number;
  estimatedCompletion: string;
}

interface AutoScalingConfig {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  targetCPUUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

interface TrainingPipelineManagerProps {
  className?: string;
  modelId?: string;
  onPipelineSelect?: (pipelineId: string) => void;
  onJobSelect?: (jobId: string) => void;
}

const TrainingPipelineManager: React.FC<TrainingPipelineManagerProps> = ({
  className,
  modelId,
  onPipelineSelect,
  onJobSelect
}) => {
  // ML Intelligence hook
  const {
    trainingJobs,
    models,
    loading,
    errors,
    realtimeData,
    workflowState,
    businessIntelligence,
    fetchTrainingJobs,
    fetchModels,
    createTrainingJob,
    stopTrainingJob,
    fetchTrainingJob,
    addNotification
  } = useMLIntelligence();

  // Local state management
  const [activeTab, setActiveTab] = useState<'overview' | 'pipelines' | 'jobs' | 'templates' | 'analytics'>('overview');
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'kanban'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'status' | 'duration'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Pipeline management state
  const [pipelines, setPipelines] = useState<TrainingPipeline[]>([]);
  const [pipelineTemplates, setPipelineTemplates] = useState<PipelineTemplate[]>([]);
  const [pipelineExecutions, setPipelineExecutions] = useState<PipelineExecution[]>([]);
  const [pipelineMetrics, setPipelineMetrics] = useState<Record<string, PipelineMetrics>>({});
  const [pipelineVisualizations, setPipelineVisualizations] = useState<Record<string, PipelineVisualization>>({});

  // Form state for pipeline creation
  const [newPipelineForm, setNewPipelineForm] = useState<{
    name: string;
    description: string;
    templateId: string;
    modelId: string;
    datasetId: string;
    configuration: TrainingConfiguration;
    autoScaling: AutoScalingConfig;
    notifications: {
      onStart: boolean;
      onComplete: boolean;
      onFailure: boolean;
      email: string;
      webhook: string;
    };
    scheduling: {
      enabled: boolean;
      cron: string;
      timezone: string;
    };
  }>({
    name: '',
    description: '',
    templateId: '',
    modelId: modelId || '',
    datasetId: '',
    configuration: {
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: 'adam',
      lossFunction: 'categorical_crossentropy',
      metrics: ['accuracy', 'precision', 'recall'],
      validationSplit: 0.2,
      earlyStopping: {
        enabled: true,
        patience: 10,
        monitor: 'val_loss',
        minDelta: 0.001
      },
      checkpointing: {
        enabled: true,
        frequency: 'epoch',
        saveWeights: true,
        saveBest: true
      },
      dataAugmentation: {
        enabled: false,
        rotation: 0,
        zoom: 0,
        flip: false,
        brightness: 0,
        contrast: 0
      }
    },
    autoScaling: {
      enabled: false,
      minInstances: 1,
      maxInstances: 10,
      targetCPUUtilization: 70,
      targetMemoryUtilization: 80,
      scaleUpCooldown: 300,
      scaleDownCooldown: 600
    },
    notifications: {
      onStart: true,
      onComplete: true,
      onFailure: true,
      email: '',
      webhook: ''
    },
    scheduling: {
      enabled: false,
      cron: '0 0 * * *',
      timezone: 'UTC'
    }
  });

  // Optimization state
  const [optimizationConfig, setOptimizationConfig] = useState<{
    enabled: boolean;
    strategy: 'grid_search' | 'random_search' | 'bayesian' | 'genetic';
    maxTrials: number;
    maxDuration: number;
    objectiveMetric: string;
    direction: 'maximize' | 'minimize';
    hyperparameters: Record<string, any>;
    earlyTermination: {
      enabled: boolean;
      minTrials: number;
      improvementThreshold: number;
    };
  }>({
    enabled: false,
    strategy: 'bayesian',
    maxTrials: 50,
    maxDuration: 3600,
    objectiveMetric: 'val_accuracy',
    direction: 'maximize',
    hyperparameters: {},
    earlyTermination: {
      enabled: true,
      minTrials: 10,
      improvementThreshold: 0.01
    }
  });

  // Real-time monitoring
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized computed values
  const filteredJobs = useMemo(() => {
    let filtered = trainingJobs;

    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (modelId) {
      filtered = filtered.filter(job => job.modelId === modelId);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof TrainingJob];
      const bValue = b[sortBy as keyof TrainingJob];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [trainingJobs, searchQuery, statusFilter, modelId, sortBy, sortOrder]);

  const jobStatusStats = useMemo(() => {
    const stats = trainingJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: trainingJobs.length,
      running: stats.running || 0,
      completed: stats.completed || 0,
      failed: stats.failed || 0,
      pending: stats.pending || 0,
      cancelled: stats.cancelled || 0
    };
  }, [trainingJobs]);

  const recentJobsMetrics = useMemo(() => {
    const recentJobs = trainingJobs
      .filter(job => job.status === 'completed')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    return recentJobs.map(job => ({
      name: job.name,
      accuracy: job.metrics?.accuracy || 0,
      loss: job.metrics?.loss || 0,
      duration: job.duration || 0,
      timestamp: job.updatedAt
    }));
  }, [trainingJobs]);

  const pipelinePerformanceMetrics = useMemo(() => {
    return Object.values(pipelineMetrics).map(metrics => ({
      pipelineName: metrics.pipelineName,
      averageDuration: metrics.averageDuration,
      successRate: metrics.successRate,
      totalExecutions: metrics.totalExecutions,
      costPerExecution: metrics.costPerExecution,
      resourceUtilization: metrics.resourceUtilization
    }));
  }, [pipelineMetrics]);

  // Event handlers
  const handleJobToggleExpand = useCallback((jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  }, []);

  const handleCreatePipeline = useCallback(async () => {
    try {
      const pipelineData: TrainingJobCreate = {
        name: newPipelineForm.name,
        description: newPipelineForm.description,
        modelId: newPipelineForm.modelId,
        datasetId: newPipelineForm.datasetId,
        configuration: newPipelineForm.configuration,
        notifications: newPipelineForm.notifications,
        scheduling: newPipelineForm.scheduling.enabled ? {
          cron: newPipelineForm.scheduling.cron,
          timezone: newPipelineForm.scheduling.timezone
        } : undefined
      };

      await createTrainingJob(pipelineData);
      setShowCreateDialog(false);
      toast.success('Training pipeline created successfully');
      
      // Reset form
      setNewPipelineForm(prev => ({
        ...prev,
        name: '',
        description: '',
        datasetId: ''
      }));
    } catch (error) {
      toast.error('Failed to create training pipeline');
      console.error('Pipeline creation error:', error);
    }
  }, [newPipelineForm, createTrainingJob]);

  const handleStopJob = useCallback(async (jobId: string) => {
    try {
      await stopTrainingJob(jobId);
      toast.success('Training job stopped successfully');
    } catch (error) {
      toast.error('Failed to stop training job');
      console.error('Job stop error:', error);
    }
  }, [stopTrainingJob]);

  const handleRestartJob = useCallback(async (job: TrainingJob) => {
    try {
      const restartData: TrainingJobCreate = {
        name: `${job.name} (Restart)`,
        description: job.description,
        modelId: job.modelId,
        datasetId: job.datasetId,
        configuration: job.configuration
      };

      await createTrainingJob(restartData);
      toast.success('Training job restarted successfully');
    } catch (error) {
      toast.error('Failed to restart training job');
      console.error('Job restart error:', error);
    }
  }, [createTrainingJob]);

  const handleOptimizePipeline = useCallback(async (pipelineId: string) => {
    try {
      // This would typically call a pipeline optimization endpoint
      addNotification({
        type: 'info',
        title: 'Pipeline Optimization Started',
        message: `Optimization for pipeline ${pipelineId} has been initiated.`,
        category: 'optimization'
      });
      
      setShowOptimizationDialog(false);
      toast.success('Pipeline optimization started');
    } catch (error) {
      toast.error('Failed to start pipeline optimization');
      console.error('Optimization error:', error);
    }
  }, [addNotification]);

  const handleExportPipeline = useCallback((pipeline: TrainingPipeline) => {
    const exportData = {
      name: pipeline.name,
      description: pipeline.description,
      stages: pipeline.stages,
      configuration: pipeline.configuration,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pipeline.name.replace(/\s+/g, '_')}_pipeline.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Pipeline exported successfully');
  }, []);

  // Real-time monitoring setup
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchTrainingJobs();
        fetchModels();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchTrainingJobs, fetchModels]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/v2/ml/training/realtime`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        
        if (update.type === 'job_progress' && expandedJobs.has(update.jobId)) {
          // Update job progress in real-time
          fetchTrainingJob(update.jobId);
        } else if (update.type === 'pipeline_status') {
          // Update pipeline status
          setPipelineVisualizations(prev => ({
            ...prev,
            [update.pipelineId]: update.visualization
          }));
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [expandedJobs, fetchTrainingJob]);

  // Load initial data
  useEffect(() => {
    fetchTrainingJobs();
    fetchModels();
  }, [fetchTrainingJobs, fetchModels]);

  // Job status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  // Job status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <Stop className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Render job card
  const renderJobCard = (job: TrainingJob) => (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getStatusColor(job.status)} text-white`}>
                {getStatusIcon(job.status)}
              </div>
              <div>
                <CardTitle className="text-lg">{job.name}</CardTitle>
                <CardDescription className="text-sm">
                  Model: {models.find(m => m.id === job.modelId)?.name || job.modelId}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                {job.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleJobToggleExpand(job.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    {expandedJobs.has(job.id) ? 'Collapse' : 'Expand'}
                  </DropdownMenuItem>
                  {job.status === 'running' && (
                    <DropdownMenuItem onClick={() => handleStopJob(job.id)} className="text-red-600">
                      <Stop className="h-4 w-4 mr-2" />
                      Stop Job
                    </DropdownMenuItem>
                  )}
                  {job.status === 'failed' && (
                    <DropdownMenuItem onClick={() => handleRestartJob(job)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restart Job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onJobSelect?.(job.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Job Progress */}
            {job.status === 'running' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(job.progress || 0)}%</span>
                </div>
                <Progress value={job.progress || 0} className="h-2" />
              </div>
            )}

            {/* Job Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Duration</span>
                <p className="font-medium">
                  {job.duration ? `${Math.round(job.duration / 60)} min` : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Accuracy</span>
                <p className="font-medium">
                  {job.metrics?.accuracy ? `${(job.metrics.accuracy * 100).toFixed(2)}%` : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Loss</span>
                <p className="font-medium">
                  {job.metrics?.loss ? job.metrics.loss.toFixed(4) : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Epochs</span>
                <p className="font-medium">
                  {job.currentEpoch ? `${job.currentEpoch}/${job.configuration.epochs}` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Job Timeline */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started: {format(parseISO(job.createdAt), 'MMM dd, HH:mm')}</span>
              {job.completedAt && (
                <span>Completed: {format(parseISO(job.completedAt), 'MMM dd, HH:mm')}</span>
              )}
            </div>

            {/* Expanded View */}
            <Collapsible open={expandedJobs.has(job.id)}>
              <CollapsibleContent className="space-y-4 pt-4 border-t">
                {/* Real-time Metrics Chart */}
                {realtimeData.trainingMetrics[job.id] && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Real-time Metrics</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={realtimeData.trainingMetrics[job.id]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="loss" stroke="#82ca9d" strokeWidth={2} />
                          <Line type="monotone" dataKey="val_accuracy" stroke="#ffc658" strokeWidth={2} />
                          <Line type="monotone" dataKey="val_loss" stroke="#ff7300" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Resource Usage */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Cpu className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium">CPU</span>
                    </div>
                    <Progress value={job.resourceUsage?.cpu || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(job.resourceUsage?.cpu || 0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MemoryStick className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <Progress value={job.resourceUsage?.memory || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(job.resourceUsage?.memory || 0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium">GPU</span>
                    </div>
                    <Progress value={job.resourceUsage?.gpu || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(job.resourceUsage?.gpu || 0)}%
                    </p>
                  </div>
                </div>

                {/* Hyperparameters */}
                <div className="space-y-2">
                  <h4 className="font-medium">Configuration</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batch Size:</span>
                      <span>{job.configuration.batchSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Learning Rate:</span>
                      <span>{job.configuration.learningRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Optimizer:</span>
                      <span>{job.configuration.optimizer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loss Function:</span>
                      <span>{job.configuration.lossFunction}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => onJobSelect?.(job.id)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Detailed Analytics
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Render overview dashboard
  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{jobStatusStats.total}</p>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Running</p>
              <p className="text-2xl font-bold text-blue-600">{jobStatusStats.running}</p>
            </div>
            <Play className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{jobStatusStats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{jobStatusStats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{jobStatusStats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Training Performance</CardTitle>
            <CardDescription>Accuracy and loss trends for recent training jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={recentJobsMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                  />
                  <YAxis yAxisId="left" domain={[0, 1]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip 
                    labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy HH:mm')}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(4) : value,
                      name === 'accuracy' ? 'Accuracy' : name === 'loss' ? 'Loss' : name
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Accuracy"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Loss"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Performance</CardTitle>
            <CardDescription>Success rates and average duration by pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelinePerformanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pipelineName" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="successRate" fill="#8884d8" name="Success Rate %" />
                  <Bar yAxisId="right" dataKey="averageDuration" fill="#82ca9d" name="Avg Duration (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Training Jobs</CardTitle>
          <CardDescription>Latest training job activities and status updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredJobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getStatusColor(job.status)} text-white`}>
                    {getStatusIcon(job.status)}
                  </div>
                  <div>
                    <p className="font-medium">{job.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(parseISO(job.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                    {job.status}
                  </Badge>
                  {job.metrics?.accuracy && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Accuracy: {(job.metrics.accuracy * 100).toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render training jobs section
  const renderTrainingJobs = () => (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search training jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="updated">Updated Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Play className="h-4 w-4 mr-2" />
                New Training Job
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredJobs.map(job => renderJobCard(job))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Training Jobs Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by creating your first training job'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Play className="h-4 w-4 mr-2" />
                Create Training Job
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Pipeline Manager</h1>
          <p className="text-muted-foreground">
            Manage and monitor ML training pipelines with advanced orchestration and optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={() => setShowOptimizationDialog(true)}>
            <Gauge className="h-4 w-4 mr-2" />
            Optimize
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Play className="h-4 w-4 mr-2" />
            New Pipeline
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      {realtimeData.connectionStatus === 'connected' && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertTitle>Real-time Monitoring Active</AlertTitle>
          <AlertDescription>
            Live updates for training progress and system metrics are enabled.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewDashboard()}
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="text-center py-12">
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Pipeline Management</h3>
            <p className="text-muted-foreground">
              Advanced pipeline orchestration features coming soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {renderTrainingJobs()}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Pipeline Templates</h3>
            <p className="text-muted-foreground">
              Reusable training pipeline templates for quick deployment
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Comprehensive analytics and performance insights
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Pipeline Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Training Pipeline</DialogTitle>
            <DialogDescription>
              Configure a new training pipeline with advanced settings and optimization options.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
                <TabsTrigger value="deployment">Deployment</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pipeline-name">Pipeline Name</Label>
                    <Input
                      id="pipeline-name"
                      value={newPipelineForm.name}
                      onChange={(e) => setNewPipelineForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter pipeline name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-select">Model</Label>
                    <Select
                      value={newPipelineForm.modelId}
                      onValueChange={(value) => setNewPipelineForm(prev => ({ ...prev, modelId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pipeline-description">Description</Label>
                  <Textarea
                    id="pipeline-description"
                    value={newPipelineForm.description}
                    onChange={(e) => setNewPipelineForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and goals of this training pipeline"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="training" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="epochs">Epochs</Label>
                    <Input
                      id="epochs"
                      type="number"
                      value={newPipelineForm.configuration.epochs}
                      onChange={(e) => setNewPipelineForm(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          epochs: parseInt(e.target.value) || 100
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Input
                      id="batch-size"
                      type="number"
                      value={newPipelineForm.configuration.batchSize}
                      onChange={(e) => setNewPipelineForm(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          batchSize: parseInt(e.target.value) || 32
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <Input
                      id="learning-rate"
                      type="number"
                      step="0.0001"
                      value={newPipelineForm.configuration.learningRate}
                      onChange={(e) => setNewPipelineForm(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          learningRate: parseFloat(e.target.value) || 0.001
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="optimizer">Optimizer</Label>
                    <Select
                      value={newPipelineForm.configuration.optimizer}
                      onValueChange={(value) => setNewPipelineForm(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          optimizer: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adam">Adam</SelectItem>
                        <SelectItem value="sgd">SGD</SelectItem>
                        <SelectItem value="rmsprop">RMSprop</SelectItem>
                        <SelectItem value="adagrad">Adagrad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loss-function">Loss Function</Label>
                    <Select
                      value={newPipelineForm.configuration.lossFunction}
                      onValueChange={(value) => setNewPipelineForm(prev => ({
                        ...prev,
                        configuration: {
                          ...prev.configuration,
                          lossFunction: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="categorical_crossentropy">Categorical Crossentropy</SelectItem>
                        <SelectItem value="binary_crossentropy">Binary Crossentropy</SelectItem>
                        <SelectItem value="sparse_categorical_crossentropy">Sparse Categorical Crossentropy</SelectItem>
                        <SelectItem value="mse">Mean Squared Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={optimizationConfig.enabled}
                    onCheckedChange={(checked) => setOptimizationConfig(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label>Enable Hyperparameter Optimization</Label>
                </div>

                {optimizationConfig.enabled && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Optimization Strategy</Label>
                        <Select
                          value={optimizationConfig.strategy}
                          onValueChange={(value) => setOptimizationConfig(prev => ({ 
                            ...prev, 
                            strategy: value as any 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                            <SelectItem value="grid_search">Grid Search</SelectItem>
                            <SelectItem value="random_search">Random Search</SelectItem>
                            <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Max Trials</Label>
                        <Input
                          type="number"
                          value={optimizationConfig.maxTrials}
                          onChange={(e) => setOptimizationConfig(prev => ({
                            ...prev,
                            maxTrials: parseInt(e.target.value) || 50
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="deployment" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPipelineForm.autoScaling.enabled}
                      onCheckedChange={(checked) => setNewPipelineForm(prev => ({
                        ...prev,
                        autoScaling: { ...prev.autoScaling, enabled: checked }
                      }))}
                    />
                    <Label>Enable Auto Scaling</Label>
                  </div>

                  {newPipelineForm.autoScaling.enabled && (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label>Min Instances</Label>
                        <Input
                          type="number"
                          value={newPipelineForm.autoScaling.minInstances}
                          onChange={(e) => setNewPipelineForm(prev => ({
                            ...prev,
                            autoScaling: {
                              ...prev.autoScaling,
                              minInstances: parseInt(e.target.value) || 1
                            }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Instances</Label>
                        <Input
                          type="number"
                          value={newPipelineForm.autoScaling.maxInstances}
                          onChange={(e) => setNewPipelineForm(prev => ({
                            ...prev,
                            autoScaling: {
                              ...prev.autoScaling,
                              maxInstances: parseInt(e.target.value) || 10
                            }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePipeline}>
                <Play className="h-4 w-4 mr-2" />
                Create Pipeline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pipeline Optimization Dialog */}
      <Dialog open={showOptimizationDialog} onOpenChange={setShowOptimizationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pipeline Optimization</DialogTitle>
            <DialogDescription>
              Configure advanced optimization settings for your training pipelines.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Advanced Optimization</h3>
              <p className="text-muted-foreground">
                Intelligent pipeline optimization features will be available soon
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOptimizationDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingPipelineManager;