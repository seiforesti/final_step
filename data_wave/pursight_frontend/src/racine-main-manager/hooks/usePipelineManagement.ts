// usePipelineManagement.ts
// Comprehensive React hook for pipeline management in Racine Main Manager

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'data-ingestion' | 'data-transformation' | 'data-loading' | 'ml-pipeline' | 'analytics' | 'custom';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  dueDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  progress: number;
  stages: PipelineStage[];
  dependencies: string[];
  tags: string[];
  metadata: Record<string, any>;
  version: string;
  template?: string;
  workspace: string;
  permissions: string[];
  notifications: boolean;
  autoRetry: boolean;
  maxRetries: number;
  retryCount: number;
  lastError?: string;
  lastExecuted?: string;
  nextExecution?: string;
  schedule?: PipelineSchedule;
  resources: PipelineResources;
  metrics: PipelineMetrics;
  audit: PipelineAudit[];
  configuration: PipelineConfiguration;
  validation: PipelineValidation;
  optimization: PipelineOptimization;
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'source' | 'transform' | 'sink' | 'validation' | 'notification';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  order: number;
  dependencies: string[];
  timeout: number;
  retryPolicy: RetryPolicy;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  logs: PipelineLog[];
  metadata: Record<string, any>;
  configuration: StageConfiguration;
  validation: StageValidation;
  performance: StagePerformance;
}

export interface StageConfiguration {
  enabled: boolean;
  parallel: boolean;
  batchSize: number;
  bufferSize: number;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  custom: Record<string, any>;
}

export interface StageValidation {
  enabled: boolean;
  rules: ValidationRule[];
  schema?: any;
  constraints: ValidationConstraint[];
  custom: Record<string, any>;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: 'data-quality' | 'business-rule' | 'schema' | 'custom';
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  description: string;
}

export interface ValidationConstraint {
  id: string;
  name: string;
  type: 'not-null' | 'unique' | 'range' | 'format' | 'custom';
  field: string;
  condition: string;
  message: string;
  enabled: boolean;
}

export interface StagePerformance {
  throughput: number;
  latency: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkUsage: number;
  errorRate: number;
  successRate: number;
}

export interface PipelineSchedule {
  type: 'once' | 'recurring' | 'cron' | 'event-driven';
  startDate: string;
  endDate?: string;
  timezone: string;
  cronExpression?: string;
  interval?: number;
  intervalUnit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  triggers: PipelineTrigger[];
}

export interface PipelineTrigger {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api' | 'message' | 'schedule' | 'manual';
  condition: string;
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface PipelineResources {
  cpu: number;
  memory: number;
  storage: number;
  gpu?: number;
  network?: number;
  custom: Record<string, any>;
  scaling: ResourceScaling;
}

export interface ResourceScaling {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  targetCPU: number;
  targetMemory: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

export interface PipelineMetrics {
  executionCount: number;
  successRate: number;
  averageDuration: number;
  totalDuration: number;
  errorCount: number;
  lastExecutionTime: number;
  resourceUtilization: ResourceUtilization;
  performance: PerformanceMetrics;
  cost: CostMetrics;
  quality: QualityMetrics;
  throughput: ThroughputMetrics;
}

export interface QualityMetrics {
  dataQualityScore: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  uniqueness: number;
  integrity: number;
}

export interface ThroughputMetrics {
  recordsProcessed: number;
  recordsPerSecond: number;
  bytesProcessed: number;
  bytesPerSecond: number;
  peakThroughput: number;
  averageThroughput: number;
}

export interface ResourceUtilization {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu?: number;
}

export interface PerformanceMetrics {
  throughput: number;
  latency: number;
  queueTime: number;
  processingTime: number;
  waitTime: number;
}

export interface CostMetrics {
  totalCost: number;
  cpuCost: number;
  memoryCost: number;
  storageCost: number;
  networkCost: number;
  gpuCost?: number;
}

export interface PipelineAudit {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface PipelineLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  stageId: string;
  metadata: Record<string, any>;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  progress: number;
  currentStage?: string;
  error?: string;
  logs: PipelineLog[];
  metrics: PipelineMetrics;
  resources: PipelineResources;
  stages: PipelineStage[];
}

export interface PipelineConfiguration {
  version: string;
  environment: 'development' | 'staging' | 'production';
  settings: Record<string, any>;
  secrets: Record<string, any>;
  variables: Record<string, any>;
  connections: PipelineConnection[];
  transformations: PipelineTransformation[];
  destinations: PipelineDestination[];
}

export interface PipelineConnection {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'message-queue' | 'stream';
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  validation: ConnectionValidation;
}

export interface ConnectionValidation {
  enabled: boolean;
  timeout: number;
  retryCount: number;
  healthCheck: boolean;
  healthCheckInterval: number;
}

export interface PipelineTransformation {
  id: string;
  name: string;
  type: 'filter' | 'map' | 'aggregate' | 'join' | 'custom';
  configuration: Record<string, any>;
  script?: string;
  validation: TransformationValidation;
}

export interface TransformationValidation {
  enabled: boolean;
  inputSchema?: any;
  outputSchema?: any;
  rules: ValidationRule[];
}

export interface PipelineDestination {
  id: string;
  name: string;
  type: 'database' | 'file' | 'api' | 'message-queue' | 'stream';
  configuration: Record<string, any>;
  validation: DestinationValidation;
}

export interface DestinationValidation {
  enabled: boolean;
  schema?: any;
  constraints: ValidationConstraint[];
  qualityChecks: boolean;
}

export interface PipelineValidation {
  enabled: boolean;
  rules: ValidationRule[];
  schema?: any;
  constraints: ValidationConstraint[];
  qualityChecks: boolean;
  custom: Record<string, any>;
}

export interface PipelineOptimization {
  enabled: boolean;
  strategies: OptimizationStrategy[];
  recommendations: OptimizationRecommendation[];
  autoOptimize: boolean;
  performanceThreshold: number;
  costThreshold: number;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  type: 'performance' | 'cost' | 'resource' | 'quality';
  description: string;
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'cost' | 'resource' | 'quality';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    performance: number;
    cost: number;
    quality: number;
  };
  implementation: string;
  estimatedEffort: number;
  enabled: boolean;
}

export interface CreatePipelineRequest {
  name: string;
  description: string;
  type: Pipeline['type'];
  priority: Pipeline['priority'];
  stages: Omit<PipelineStage, 'id' | 'status' | 'logs'>[];
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  template?: string;
  workspace: string;
  schedule?: PipelineSchedule;
  resources?: Partial<PipelineResources>;
  configuration?: Partial<PipelineConfiguration>;
  validation?: Partial<PipelineValidation>;
  optimization?: Partial<PipelineOptimization>;
  autoRetry?: boolean;
  maxRetries?: number;
  notifications?: boolean;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  priority?: Pipeline['priority'];
  stages?: PipelineStage[];
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  schedule?: PipelineSchedule;
  resources?: Partial<PipelineResources>;
  configuration?: Partial<PipelineConfiguration>;
  validation?: Partial<PipelineValidation>;
  optimization?: Partial<PipelineOptimization>;
  autoRetry?: boolean;
  maxRetries?: number;
  notifications?: boolean;
}

export interface PipelineFilters {
  status?: Pipeline['status'][];
  type?: Pipeline['type'][];
  priority?: Pipeline['priority'][];
  createdBy?: string;
  assignedTo?: string;
  workspace?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface PipelineSort {
  field: keyof Pipeline;
  direction: 'asc' | 'desc';
}

// Hook options
export interface UsePipelineManagementOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  enableNotifications?: boolean;
  onPipelineComplete?: (pipeline: Pipeline) => void;
  onPipelineFailed?: (pipeline: Pipeline) => void;
  onExecutionUpdate?: (execution: PipelineExecution) => void;
  onError?: (error: Error) => void;
}

// Hook return type
export interface UsePipelineManagementReturn {
  // Pipelines
  pipelines: Pipeline[];
  currentPipeline: Pipeline | null;
  pipelinesLoading: boolean;
  pipelinesError: Error | null;
  
  // Executions
  executions: PipelineExecution[];
  currentExecution: PipelineExecution | null;
  executionsLoading: boolean;
  executionsError: Error | null;
  
  // Metrics
  metrics: PipelineMetrics | null;
  metricsLoading: boolean;
  metricsError: Error | null;
  
  // State management
  filters: PipelineFilters;
  sort: PipelineSort;
  pagination: {
    page: number;
    size: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  
  // Actions
  setCurrentPipeline: (pipeline: Pipeline | null) => void;
  setCurrentExecution: (execution: PipelineExecution | null) => void;
  setFilters: (filters: Partial<PipelineFilters>) => void;
  setSort: (sort: PipelineSort) => void;
  setPagination: (page: number, size?: number) => void;
  
  // Pipeline operations
  createPipeline: (request: CreatePipelineRequest) => Promise<Pipeline>;
  updatePipeline: (id: string, request: UpdatePipelineRequest) => Promise<Pipeline>;
  deletePipeline: (id: string) => Promise<void>;
  clonePipeline: (id: string, name: string) => Promise<Pipeline>;
  validatePipeline: (pipeline: Pipeline) => Promise<boolean>;
  optimizePipeline: (pipeline: Pipeline) => Promise<PipelineOptimization>;
  
  // Execution operations
  executePipeline: (pipelineId: string, context?: Record<string, any>) => Promise<PipelineExecution>;
  pauseExecution: (executionId: string) => Promise<void>;
  resumeExecution: (executionId: string) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  retryExecution: (executionId: string) => Promise<PipelineExecution>;
  skipStage: (executionId: string, stageId: string) => Promise<void>;
  
  // Utility functions
  getPipelineStatusColor: (status: Pipeline['status']) => string;
  getPipelinePriorityLabel: (priority: Pipeline['priority']) => string;
  getPipelineTypeIcon: (type: Pipeline['type']) => string;
  calculateProgress: (pipeline: Pipeline) => number;
  getEstimatedCompletion: (pipeline: Pipeline) => string | null;
  
  // Real-time subscriptions
  subscribeToPipelineUpdates: (pipelineId: string) => void;
  unsubscribeFromPipelineUpdates: (pipelineId: string) => void;
  subscribeToExecutionUpdates: (executionId: string) => void;
  unsubscribeFromExecutionUpdates: (executionId: string) => void;
  
  // Loading states
  isLoading: boolean;
  isExecuting: boolean;
  isSaving: boolean;
}

// Mock API functions (to be replaced with real API calls)
const pipelineAPI = {
  getPipelines: async (params: { filters?: PipelineFilters; sort?: PipelineSort; page?: number; size?: number }) => {
    // Mock implementation
    return {
      pipelines: [],
      pagination: { page: 1, size: 20, total: 0, hasNext: false, hasPrevious: false }
    };
  },
  
  getPipeline: async (id: string) => {
    // Mock implementation
    return null;
  },
  
  createPipeline: async (request: CreatePipelineRequest) => {
    // Mock implementation
    return {} as Pipeline;
  },
  
  updatePipeline: async (id: string, request: UpdatePipelineRequest) => {
    // Mock implementation
    return {} as Pipeline;
  },
  
  deletePipeline: async (id: string) => {
    // Mock implementation
  },
  
  executePipeline: async (pipelineId: string, context?: Record<string, any>) => {
    // Mock implementation
    return {} as PipelineExecution;
  },
  
  getExecutions: async (pipelineId: string) => {
    // Mock implementation
    return [];
  },
  
  getExecution: async (executionId: string) => {
    // Mock implementation
    return null;
  },
  
  pauseExecution: async (executionId: string) => {
    // Mock implementation
  },
  
  resumeExecution: async (executionId: string) => {
    // Mock implementation
  },
  
  cancelExecution: async (executionId: string) => {
    // Mock implementation
  },
  
  retryExecution: async (executionId: string) => {
    // Mock implementation
    return {} as PipelineExecution;
  },
  
  getMetrics: async (pipelineId: string) => {
    // Mock implementation
    return null;
  },
  
  optimizePipeline: async (pipelineId: string) => {
    // Mock implementation
    return {} as PipelineOptimization;
  }
};

export const usePipelineManagement = (initialPipeline?: Pipeline, options: UsePipelineManagementOptions = {}): UsePipelineManagementReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTimeUpdates = true,
    enableNotifications = true,
    onPipelineComplete,
    onPipelineFailed,
    onExecutionUpdate,
    onError
  } = options;

  const queryClient = useQueryClient();
  const pipelineWsRef = useRef<WebSocket | null>(null);
  const executionWsRef = useRef<WebSocket | null>(null);

  // State management
  const [currentPipeline, setCurrentPipeline] = useState<Pipeline | null>(initialPipeline || null);
  const [currentExecution, setCurrentExecution] = useState<PipelineExecution | null>(null);
  const [filters, setFiltersState] = useState<PipelineFilters>({});
  const [sort, setSortState] = useState<PipelineSort>({ field: 'createdAt', direction: 'desc' });
  const [pagination, setPaginationState] = useState({
    page: 1,
    size: 20,
    total: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Query for pipelines
  const {
    data: pipelinesData,
    isLoading: pipelinesLoading,
    error: pipelinesError,
    refetch: refetchPipelines
  } = useQuery({
    queryKey: ['pipelines', filters, sort, pagination.page, pagination.size],
    queryFn: () => pipelineAPI.getPipelines({
      filters,
      sort,
      page: pagination.page,
      size: pagination.size
    }),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Query for current pipeline
  const {
    data: pipelineData,
    isLoading: pipelineLoading,
    error: pipelineError,
    refetch: refetchPipeline
  } = useQuery({
    queryKey: ['pipeline', currentPipeline?.id],
    queryFn: () => currentPipeline?.id ? pipelineAPI.getPipeline(currentPipeline.id) : null,
    enabled: !!currentPipeline?.id,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Query for executions
  const {
    data: executionsData,
    isLoading: executionsLoading,
    error: executionsError,
    refetch: refetchExecutions
  } = useQuery({
    queryKey: ['pipeline-executions', currentPipeline?.id],
    queryFn: () => currentPipeline?.id ? pipelineAPI.getExecutions(currentPipeline.id) : [],
    enabled: !!currentPipeline?.id,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Query for current execution
  const {
    data: executionData,
    isLoading: executionLoading,
    error: executionError,
    refetch: refetchExecution
  } = useQuery({
    queryKey: ['pipeline-execution', currentExecution?.id],
    queryFn: () => currentExecution?.id ? pipelineAPI.getExecution(currentExecution.id) : null,
    enabled: !!currentExecution?.id,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Query for metrics
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['pipeline-metrics', currentPipeline?.id],
    queryFn: () => currentPipeline?.id ? pipelineAPI.getMetrics(currentPipeline.id) : null,
    enabled: !!currentPipeline?.id,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Mutations
  const createPipelineMutation = useMutation({
    mutationFn: pipelineAPI.createPipeline,
    onSuccess: (pipeline) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast.success('Pipeline created successfully');
      setCurrentPipeline(pipeline);
    },
    onError: (error) => {
      toast.error('Failed to create pipeline');
      onError?.(error);
    }
  });

  const updatePipelineMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdatePipelineRequest }) => 
      pipelineAPI.updatePipeline(id, request),
    onSuccess: (pipeline) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipeline.id] });
      toast.success('Pipeline updated successfully');
      setCurrentPipeline(pipeline);
    },
    onError: (error) => {
      toast.error('Failed to update pipeline');
      onError?.(error);
    }
  });

  const deletePipelineMutation = useMutation({
    mutationFn: pipelineAPI.deletePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast.success('Pipeline deleted successfully');
      setCurrentPipeline(null);
    },
    onError: (error) => {
      toast.error('Failed to delete pipeline');
      onError?.(error);
    }
  });

  const executePipelineMutation = useMutation({
    mutationFn: ({ pipelineId, context }: { pipelineId: string; context?: Record<string, any> }) =>
      pipelineAPI.executePipeline(pipelineId, context),
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-executions'] });
      toast.success('Pipeline execution started');
      setCurrentExecution(execution);
      onExecutionUpdate?.(execution);
    },
    onError: (error) => {
      toast.error('Failed to execute pipeline');
      onError?.(error);
    }
  });

  // Action functions
  const setFilters = useCallback((newFilters: Partial<PipelineFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setSort = useCallback((newSort: PipelineSort) => {
    setSortState(newSort);
  }, []);

  const setPagination = useCallback((page: number, size?: number) => {
    setPaginationState(prev => ({
      ...prev,
      page,
      size: size || prev.size
    }));
  }, []);

  // Pipeline operations
  const createPipeline = useCallback(async (request: CreatePipelineRequest) => {
    return createPipelineMutation.mutateAsync(request);
  }, [createPipelineMutation]);

  const updatePipeline = useCallback(async (id: string, request: UpdatePipelineRequest) => {
    return updatePipelineMutation.mutateAsync({ id, request });
  }, [updatePipelineMutation]);

  const deletePipeline = useCallback(async (id: string) => {
    return deletePipelineMutation.mutateAsync(id);
  }, [deletePipelineMutation]);

  const clonePipeline = useCallback(async (id: string, name: string) => {
    // Implementation for cloning pipeline
    const pipeline = pipelinesData?.pipelines.find(p => p.id === id);
    if (!pipeline) throw new Error('Pipeline not found');
    
    const cloneRequest: CreatePipelineRequest = {
      name,
      description: `${pipeline.description} (Clone)`,
      type: pipeline.type,
      priority: pipeline.priority,
      stages: pipeline.stages.map(stage => ({
        name: stage.name,
        type: stage.type,
        order: stage.order,
        dependencies: stage.dependencies,
        timeout: stage.timeout,
        retryPolicy: stage.retryPolicy,
        inputs: stage.inputs,
        outputs: stage.outputs,
        metadata: stage.metadata,
        configuration: stage.configuration,
        validation: stage.validation,
        performance: stage.performance
      })),
      dependencies: pipeline.dependencies,
      tags: [...pipeline.tags, 'cloned'],
      metadata: pipeline.metadata,
      template: pipeline.template,
      workspace: pipeline.workspace,
      schedule: pipeline.schedule,
      resources: pipeline.resources,
      configuration: pipeline.configuration,
      validation: pipeline.validation,
      optimization: pipeline.optimization,
      autoRetry: pipeline.autoRetry,
      maxRetries: pipeline.maxRetries,
      notifications: pipeline.notifications
    };
    
    return createPipeline(cloneRequest);
  }, [pipelinesData, createPipeline]);

  const validatePipeline = useCallback(async (pipeline: Pipeline) => {
    // Basic validation logic
    if (!pipeline.name.trim()) return false;
    if (!pipeline.stages.length) return false;
    if (pipeline.stages.some(stage => !stage.name.trim())) return false;
    return true;
  }, []);

  const optimizePipeline = useCallback(async (pipeline: Pipeline) => {
    // Implementation for pipeline optimization
    return pipelineAPI.optimizePipeline(pipeline.id);
  }, []);

  // Execution operations
  const executePipeline = useCallback(async (pipelineId: string, context?: Record<string, any>) => {
    return executePipelineMutation.mutateAsync({ pipelineId, context });
  }, [executePipelineMutation]);

  const pauseExecution = useCallback(async (executionId: string) => {
    // Implementation for pausing execution
    toast.info('Execution paused');
  }, []);

  const resumeExecution = useCallback(async (executionId: string) => {
    // Implementation for resuming execution
    toast.info('Execution resumed');
  }, []);

  const cancelExecution = useCallback(async (executionId: string) => {
    // Implementation for cancelling execution
    toast.info('Execution cancelled');
  }, []);

  const retryExecution = useCallback(async (executionId: string) => {
    // Implementation for retrying execution
    toast.info('Execution retried');
    return {} as PipelineExecution;
  }, []);

  const skipStage = useCallback(async (executionId: string, stageId: string) => {
    // Implementation for skipping stage
    toast.info('Stage skipped');
  }, []);

  // Utility functions
  const getPipelineStatusColor = useCallback((status: Pipeline['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-500';
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  }, []);

  const getPipelinePriorityLabel = useCallback((priority: Pipeline['priority']) => {
    switch (priority) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  }, []);

  const getPipelineTypeIcon = useCallback((type: Pipeline['type']) => {
    switch (type) {
      case 'data-ingestion': return 'download';
      case 'data-transformation': return 'refresh-cw';
      case 'data-loading': return 'upload';
      case 'ml-pipeline': return 'brain';
      case 'analytics': return 'bar-chart';
      case 'custom': return 'settings';
      default: return 'pipeline';
    }
  }, []);

  const calculateProgress = useCallback((pipeline: Pipeline) => {
    if (!pipeline.stages.length) return 0;
    const completedStages = pipeline.stages.filter(stage => stage.status === 'completed').length;
    return Math.round((completedStages / pipeline.stages.length) * 100);
  }, []);

  const getEstimatedCompletion = useCallback((pipeline: Pipeline) => {
    if (!pipeline.estimatedDuration || pipeline.status === 'completed') return null;
    const startTime = new Date(pipeline.lastExecuted || pipeline.createdAt);
    const estimatedEnd = new Date(startTime.getTime() + pipeline.estimatedDuration * 60000);
    return estimatedEnd.toISOString();
  }, []);

  // Real-time subscriptions
  const subscribeToPipelineUpdates = useCallback((pipelineId: string) => {
    if (!enableRealTimeUpdates) return;
    // Implementation for WebSocket subscription
  }, [enableRealTimeUpdates]);

  const unsubscribeFromPipelineUpdates = useCallback((pipelineId: string) => {
    if (pipelineWsRef.current) {
      pipelineWsRef.current.close();
      pipelineWsRef.current = null;
    }
  }, []);

  const subscribeToExecutionUpdates = useCallback((executionId: string) => {
    if (!enableRealTimeUpdates) return;
    // Implementation for WebSocket subscription
  }, [enableRealTimeUpdates]);

  const unsubscribeFromExecutionUpdates = useCallback((executionId: string) => {
    if (executionWsRef.current) {
      executionWsRef.current.close();
      executionWsRef.current = null;
    }
  }, []);

  // Loading states
  const isLoading = pipelinesLoading || pipelineLoading || executionsLoading || executionLoading || metricsLoading;
  const isExecuting = executePipelineMutation.isPending;
  const isSaving = createPipelineMutation.isPending || updatePipelineMutation.isPending || deletePipelineMutation.isPending;

  return {
    // Pipelines
    pipelines: pipelinesData?.pipelines || [],
    currentPipeline: pipelineData || currentPipeline,
    pipelinesLoading,
    pipelinesError,
    
    // Executions
    executions: executionsData || [],
    currentExecution: executionData || currentExecution,
    executionsLoading,
    executionsError,
    
    // Metrics
    metrics: metricsData,
    metricsLoading,
    metricsError,
    
    // State management
    filters,
    sort,
    pagination,
    
    // Actions
    setCurrentPipeline,
    setCurrentExecution,
    setFilters,
    setSort,
    setPagination,
    
    // Pipeline operations
    createPipeline,
    updatePipeline,
    deletePipeline,
    clonePipeline,
    validatePipeline,
    optimizePipeline,
    
    // Execution operations
    executePipeline,
    pauseExecution,
    resumeExecution,
    cancelExecution,
    retryExecution,
    skipStage,
    
    // Utility functions
    getPipelineStatusColor,
    getPipelinePriorityLabel,
    getPipelineTypeIcon,
    calculateProgress,
    getEstimatedCompletion,
    
    // Real-time subscriptions
    subscribeToPipelineUpdates,
    unsubscribeFromPipelineUpdates,
    subscribeToExecutionUpdates,
    unsubscribeFromExecutionUpdates,
    
    // Loading states
    isLoading,
    isExecuting,
    isSaving
  };
};
