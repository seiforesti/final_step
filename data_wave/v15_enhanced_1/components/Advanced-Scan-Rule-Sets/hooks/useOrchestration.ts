// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE USE ORCHESTRATION HOOK
// Enterprise-Core Implementation with Full State Management
// Integrates with: orchestrationAPI service and all backend capabilities
// ============================================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  OrchestrationEngine,
  WorkflowOrchestrator,
  WorkflowTemplate,
  ScanOrchestrationJob,
  WorkflowDefinition,
  ExecutionContext,
  ResourceAllocation,
  JobProgress,
  ResourcePool,
  SchedulingEngine,
  Schedule,
  RealTimeMetrics,
  OrchestrationIntegration,
  APIResponse
} from '../types/orchestration.types';
import { orchestrationAPI, OrchestrationAPIUtils } from '../services/orchestration-apis';

// ============================================================================
// HOOK CONFIGURATION & TYPES
// ============================================================================

interface UseOrchestrationOptions {
  // Data fetching options
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  cacheTime?: number;
  staleTime?: number;
  
  // Feature flags
  enableResourceOptimization?: boolean;
  enableAdvancedScheduling?: boolean;
  enableAnalytics?: boolean;
  enableIntegrations?: boolean;
  
  // Performance options
  prefetchRelatedData?: boolean;
  backgroundUpdates?: boolean;
  
  // Event callbacks
  onJobCreated?: (job: ScanOrchestrationJob) => void;
  onJobStatusChanged?: (jobId: string, status: string) => void;
  onJobCompleted?: (jobId: string, result: any) => void;
  onJobFailed?: (jobId: string, error: any) => void;
  onResourceAllocated?: (allocation: ResourceAllocation) => void;
  onError?: (error: Error) => void;
}

interface UseOrchestrationState {
  // Core data
  engines: OrchestrationEngine[];
  currentEngine: OrchestrationEngine | null;
  workflowOrchestrators: WorkflowOrchestrator[];
  workflowTemplates: WorkflowTemplate[];
  jobs: ScanOrchestrationJob[];
  currentJob: ScanOrchestrationJob | null;
  selectedJobs: string[];
  
  // Resource management
  resourcePools: ResourcePool[];
  resourceAllocations: ResourceAllocation[];
  
  // Scheduling
  schedulingEngines: SchedulingEngine[];
  schedules: Schedule[];
  
  // Monitoring
  realTimeMetrics: RealTimeMetrics | null;
  jobProgress: Record<string, JobProgress>;
  
  // Integration
  integrations: OrchestrationIntegration[];
  
  // UI state
  filters: {
    status?: string;
    engineId?: string;
    priority?: string;
    dateRange?: { start: string; end: string };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  
  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isCreatingJob: boolean;
  isUpdatingJob: boolean;
  isDeletingJob: boolean;
  isAllocatingResources: boolean;
  isOptimizingResources: boolean;
  isExecutingJob: boolean;
  
  // Error states
  error: Error | null;
  jobErrors: Record<string, string>;
  resourceErrors: string[];
  
  // Real-time state
  realTimeConnected: boolean;
  activeSubscriptions: string[];
  lastUpdate: Date | null;
}

interface UseOrchestrationActions {
  // Engine management
  fetchEngines: (options?: any) => Promise<void>;
  createEngine: (engine: Omit<OrchestrationEngine, 'id' | 'createdAt' | 'updatedAt'>, options?: any) => Promise<OrchestrationEngine>;
  updateEngine: (id: string, updates: Partial<OrchestrationEngine>, options?: any) => Promise<OrchestrationEngine>;
  deleteEngine: (id: string) => Promise<void>;
  
  // Workflow management
  fetchWorkflowOrchestrators: (options?: any) => Promise<void>;
  createWorkflowOrchestrator: (orchestrator: any, options?: any) => Promise<WorkflowOrchestrator>;
  fetchWorkflowTemplates: (options?: any) => Promise<void>;
  createWorkflowTemplate: (template: any, options?: any) => Promise<WorkflowTemplate>;
  
  // Job management
  fetchJobs: (options?: any) => Promise<void>;
  createJob: (job: Omit<ScanOrchestrationJob, 'id' | 'createdAt' | 'updatedAt'>, options?: any) => Promise<ScanOrchestrationJob>;
  updateJob: (id: string, updates: Partial<ScanOrchestrationJob>) => Promise<ScanOrchestrationJob>;
  deleteJob: (id: string) => Promise<void>;
  bulkDeleteJobs: (ids: string[]) => Promise<void>;
  cloneJob: (id: string, newName: string) => Promise<ScanOrchestrationJob>;
  
  // Job execution control
  startJob: (id: string, config?: any) => Promise<string>;
  pauseJob: (id: string, options?: any) => Promise<void>;
  resumeJob: (id: string, options?: any) => Promise<void>;
  cancelJob: (id: string, options?: any) => Promise<void>;
  restartJob: (id: string, options?: any) => Promise<void>;
  
  // Job monitoring
  getJobProgress: (id: string, options?: any) => Promise<JobProgress>;
  getJobLogs: (id: string, options?: any) => Promise<any[]>;
  
  // Resource management
  fetchResourcePools: (options?: any) => Promise<void>;
  allocateResources: (request: any) => Promise<ResourceAllocation>;
  optimizeResourceAllocation: (config: any) => Promise<any>;
  releaseResources: (allocationId: string) => Promise<void>;
  
  // Scheduling
  fetchSchedulingEngines: () => Promise<void>;
  createSchedule: (schedule: any, options?: any) => Promise<Schedule>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<Schedule>;
  deleteSchedule: (id: string) => Promise<void>;
  
  // Monitoring & Analytics
  getRealTimeMetrics: (options?: any) => Promise<RealTimeMetrics>;
  getAnalytics: (options?: any) => Promise<any>;
  
  // Integration management
  fetchIntegrations: () => Promise<void>;
  configureIntegration: (integration: any, options?: any) => Promise<OrchestrationIntegration>;
  testIntegration: (id: string) => Promise<any>;
  
  // State management
  setFilters: (filters: UseOrchestrationState['filters']) => void;
  setPagination: (pagination: Partial<UseOrchestrationState['pagination']>) => void;
  setSelectedJobs: (ids: string[]) => void;
  selectJob: (id: string) => void;
  deselectJob: (id: string) => void;
  selectAllJobs: () => void;
  deselectAllJobs: () => void;
  
  // Utility operations
  refreshData: () => void;
  resetState: () => void;
  clearErrors: () => void;
  exportJobs: (ids: string[], format: string) => Promise<string>;
  
  // Real-time operations
  subscribeToJobProgress: (jobId: string) => () => void;
  subscribeToEngineMetrics: (engineId: string) => () => void;
  subscribeToResourceUpdates: () => () => void;
  unsubscribeAll: () => void;
}

export type UseOrchestrationReturn = UseOrchestrationState & UseOrchestrationActions & {
  // Computed properties
  filteredJobs: ScanOrchestrationJob[];
  orchestrationStats: {
    totalJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    avgExecutionTime: number;
    resourceUtilization: number;
  };
  hasSelection: boolean;
  selectionCount: number;
  
  // Utility functions
  getJobById: (id: string) => ScanOrchestrationJob | undefined;
  getEngineById: (id: string) => OrchestrationEngine | undefined;
  isJobSelected: (id: string) => boolean;
  canControlJob: (id: string) => boolean;
  getJobStatusColor: (status: string) => string;
  formatJobForDisplay: (job: ScanOrchestrationJob) => any;
};

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export const useOrchestration = (options: UseOrchestrationOptions = {}): UseOrchestrationReturn => {
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<Omit<UseOrchestrationState, 'isLoading' | 'isFetching' | 'error'>>({
    engines: [],
    currentEngine: null,
    workflowOrchestrators: [],
    workflowTemplates: [],
    jobs: [],
    currentJob: null,
    selectedJobs: [],
    
    resourcePools: [],
    resourceAllocations: [],
    
    schedulingEngines: [],
    schedules: [],
    
    realTimeMetrics: null,
    jobProgress: {},
    
    integrations: [],
    
    filters: {},
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    
    isCreatingJob: false,
    isUpdatingJob: false,
    isDeletingJob: false,
    isAllocatingResources: false,
    isOptimizingResources: false,
    isExecutingJob: false,
    
    jobErrors: {},
    resourceErrors: [],
    
    realTimeConnected: false,
    activeSubscriptions: [],
    lastUpdate: null,
  });

  // ============================================================================
  // QUERY KEYS
  // ============================================================================
  
  const QUERY_KEYS = {
    engines: ['orchestrationEngines'],
    engine: (id: string) => ['orchestrationEngine', id],
    workflowOrchestrators: ['workflowOrchestrators'],
    workflowTemplates: ['workflowTemplates'],
    jobs: ['orchestrationJobs', state.filters, state.pagination.page, state.pagination.limit],
    job: (id: string) => ['orchestrationJob', id],
    jobProgress: (id: string) => ['jobProgress', id],
    resourcePools: ['resourcePools'],
    schedulingEngines: ['schedulingEngines'],
    realTimeMetrics: ['realTimeMetrics'],
    analytics: ['orchestrationAnalytics'],
    integrations: ['orchestrationIntegrations'],
  };

  // ============================================================================
  // QUERIES
  // ============================================================================
  
  const {
    data: enginesResponse,
    isLoading: enginesLoading,
    error: enginesError,
    refetch: refetchEngines,
  } = useQuery({
    queryKey: QUERY_KEYS.engines,
    queryFn: () => orchestrationAPI.getOrchestrationEngines({
      includeCapabilities: true,
      includeMetrics: options.enableAnalytics,
    }),
    staleTime: options.staleTime || 5 * 60 * 1000,
    gcTime: options.cacheTime || 10 * 60 * 1000,
    refetchInterval: options.autoRefresh ? options.refreshInterval || 30000 : false,
  });

  const {
    data: jobsResponse,
    isLoading: jobsLoading,
    isFetching: jobsFetching,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: QUERY_KEYS.jobs,
    queryFn: () => orchestrationAPI.getOrchestrationJobs({
      ...state.filters,
      page: state.pagination.page,
      limit: state.pagination.limit,
      includeProgress: true,
      includeMetrics: options.enableAnalytics,
    }),
    staleTime: options.staleTime || 2 * 60 * 1000, // 2 minutes for jobs
    gcTime: options.cacheTime || 5 * 60 * 1000,
    refetchInterval: options.autoRefresh ? 10000 : false, // More frequent for jobs
  });

  const {
    data: resourcePoolsResponse,
    refetch: refetchResourcePools,
  } = useQuery({
    queryKey: QUERY_KEYS.resourcePools,
    queryFn: () => orchestrationAPI.getResourcePools({
      includeUtilization: true,
      includeCapacity: true,
    }),
    enabled: options.enableResourceOptimization,
    staleTime: options.staleTime || 5 * 60 * 1000,
  });

  const {
    data: realTimeMetricsResponse,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: QUERY_KEYS.realTimeMetrics,
    queryFn: () => orchestrationAPI.getRealTimeMetrics({
      timeWindow: 300, // 5 minutes
    }),
    enabled: options.enableAnalytics,
    refetchInterval: 5000, // 5 seconds for real-time metrics
    staleTime: 0, // Always fresh for real-time data
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================
  
  const createJobMutation = useMutation({
    mutationFn: ({ job, mutationOptions }: { 
      job: Omit<ScanOrchestrationJob, 'id' | 'createdAt' | 'updatedAt'>; 
      mutationOptions?: any;
    }) => orchestrationAPI.createOrchestrationJob(job, mutationOptions),
    onMutate: () => {
      setState(prev => ({ ...prev, isCreatingJob: true }));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['orchestrationJobs'] });
      options.onJobCreated?.(response.data);
      toast.success('Orchestration job created successfully');
    },
    onError: (error: Error) => {
      options.onError?.(error);
      toast.error(`Failed to create job: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isCreatingJob: false }));
    },
  });

  const startJobMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config?: any }) => 
      orchestrationAPI.startOrchestrationJob(id, config),
    onMutate: () => {
      setState(prev => ({ ...prev, isExecutingJob: true }));
    },
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orchestrationJobs'] });
      queryClient.invalidateQueries({ queryKey: ['orchestrationJob', id] });
      options.onJobStatusChanged?.(id, 'running');
      toast.success(`Job execution started: ${response.data.executionId}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to start job: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isExecutingJob: false }));
    },
  });

  const controlJobMutation = useMutation({
    mutationFn: ({ id, action, controlOptions }: { 
      id: string; 
      action: 'pause' | 'resume' | 'cancel' | 'restart'; 
      controlOptions?: any;
    }) => orchestrationAPI.controlJobExecution(id, action, controlOptions),
    onSuccess: (response, { id, action }) => {
      queryClient.invalidateQueries({ queryKey: ['orchestrationJobs'] });
      queryClient.invalidateQueries({ queryKey: ['orchestrationJob', id] });
      options.onJobStatusChanged?.(id, response.data.newStatus);
      toast.success(`Job ${action} successful`);
    },
    onError: (error: Error) => {
      toast.error(`Job control failed: ${error.message}`);
    },
  });

  const allocateResourcesMutation = useMutation({
    mutationFn: (request: any) => orchestrationAPI.allocateResources(request),
    onMutate: () => {
      setState(prev => ({ ...prev, isAllocatingResources: true }));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['resourcePools'] });
      options.onResourceAllocated?.(response.data);
      toast.success('Resources allocated successfully');
    },
    onError: (error: Error) => {
      setState(prev => ({ 
        ...prev, 
        resourceErrors: [...prev.resourceErrors, error.message] 
      }));
      toast.error(`Resource allocation failed: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isAllocatingResources: false }));
    },
  });

  const optimizeResourcesMutation = useMutation({
    mutationFn: (config: any) => orchestrationAPI.optimizeResourceAllocation(config),
    onMutate: () => {
      setState(prev => ({ ...prev, isOptimizingResources: true }));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['resourcePools'] });
      toast.success(`Resource optimization completed. Projected savings: $${response.data.projectedSavings}`);
    },
    onError: (error: Error) => {
      toast.error(`Resource optimization failed: ${error.message}`);
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isOptimizingResources: false }));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const engines = useMemo(() => enginesResponse?.data || [], [enginesResponse]);
  const jobs = useMemo(() => jobsResponse?.data || [], [jobsResponse]);
  const resourcePools = useMemo(() => resourcePoolsResponse?.data || [], [resourcePoolsResponse]);
  const realTimeMetrics = useMemo(() => realTimeMetricsResponse?.data || null, [realTimeMetricsResponse]);

  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Apply filters
    if (state.filters.status) {
      filtered = filtered.filter(job => job.status === state.filters.status);
    }
    if (state.filters.engineId) {
      filtered = filtered.filter(job => job.engineId === state.filters.engineId);
    }
    if (state.filters.priority) {
      filtered = filtered.filter(job => job.priority === state.filters.priority);
    }

    return filtered;
  }, [jobs, state.filters]);

  const orchestrationStats = useMemo(() => {
    return OrchestrationAPIUtils.generateOrchestrationSummary(jobs);
  }, [jobs]);

  const hasSelection = state.selectedJobs.length > 0;
  const selectionCount = state.selectedJobs.length;

  const isLoading = enginesLoading || jobsLoading;
  const isFetching = jobsFetching;
  const error = enginesError || jobsError;

  // ============================================================================
  // ACTION IMPLEMENTATIONS
  // ============================================================================
  
  const fetchEngines = useCallback(async (fetchOptions?: any) => {
    await refetchEngines();
  }, [refetchEngines]);

  const createEngine = useCallback(async (
    engine: Omit<OrchestrationEngine, 'id' | 'createdAt' | 'updatedAt'>,
    createOptions?: any
  ): Promise<OrchestrationEngine> => {
    const response = await orchestrationAPI.createOrchestrationEngine(engine, createOptions);
    queryClient.invalidateQueries({ queryKey: ['orchestrationEngines'] });
    return response.data;
  }, [queryClient]);

  const fetchJobs = useCallback(async (fetchOptions?: any) => {
    await refetchJobs();
  }, [refetchJobs]);

  const createJob = useCallback(async (
    job: Omit<ScanOrchestrationJob, 'id' | 'createdAt' | 'updatedAt'>,
    createOptions?: any
  ): Promise<ScanOrchestrationJob> => {
    const validation = OrchestrationAPIUtils.validateJobConfig(job);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const response = await createJobMutation.mutateAsync({ 
      job, 
      mutationOptions: createOptions 
    });
    return response.data;
  }, [createJobMutation]);

  const startJob = useCallback(async (id: string, config?: any): Promise<string> => {
    const response = await startJobMutation.mutateAsync({ id, config });
    return response.data.executionId;
  }, [startJobMutation]);

  const pauseJob = useCallback(async (id: string, pauseOptions?: any) => {
    await controlJobMutation.mutateAsync({ 
      id, 
      action: 'pause', 
      controlOptions: pauseOptions 
    });
  }, [controlJobMutation]);

  const resumeJob = useCallback(async (id: string, resumeOptions?: any) => {
    await controlJobMutation.mutateAsync({ 
      id, 
      action: 'resume', 
      controlOptions: resumeOptions 
    });
  }, [controlJobMutation]);

  const cancelJob = useCallback(async (id: string, cancelOptions?: any) => {
    await controlJobMutation.mutateAsync({ 
      id, 
      action: 'cancel', 
      controlOptions: cancelOptions 
    });
  }, [controlJobMutation]);

  const restartJob = useCallback(async (id: string, restartOptions?: any) => {
    await controlJobMutation.mutateAsync({ 
      id, 
      action: 'restart', 
      controlOptions: restartOptions 
    });
  }, [controlJobMutation]);

  const getJobProgress = useCallback(async (id: string, progressOptions?: any): Promise<JobProgress> => {
    const response = await orchestrationAPI.getJobProgress(id, progressOptions);
    setState(prev => ({
      ...prev,
      jobProgress: { ...prev.jobProgress, [id]: response.data }
    }));
    return response.data;
  }, []);

  const allocateResources = useCallback(async (request: any): Promise<ResourceAllocation> => {
    const response = await allocateResourcesMutation.mutateAsync(request);
    return response.data;
  }, [allocateResourcesMutation]);

  const optimizeResourceAllocation = useCallback(async (config: any) => {
    const response = await optimizeResourcesMutation.mutateAsync(config);
    return response.data;
  }, [optimizeResourcesMutation]);

  // ============================================================================
  // STATE MANAGEMENT ACTIONS
  // ============================================================================
  
  const setFilters = useCallback((filters: UseOrchestrationState['filters']) => {
    setState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page
    }));
  }, []);

  const setPagination = useCallback((pagination: Partial<UseOrchestrationState['pagination']>) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...pagination },
    }));
  }, []);

  const setSelectedJobs = useCallback((ids: string[]) => {
    setState(prev => ({ ...prev, selectedJobs: ids }));
  }, []);

  const selectJob = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedJobs: prev.selectedJobs.includes(id)
        ? prev.selectedJobs
        : [...prev.selectedJobs, id],
    }));
  }, []);

  const deselectJob = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedJobs: prev.selectedJobs.filter(selectedId => selectedId !== id),
    }));
  }, []);

  const selectAllJobs = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedJobs: filteredJobs.map(job => job.id),
    }));
  }, [filteredJobs]);

  const deselectAllJobs = useCallback(() => {
    setState(prev => ({ ...prev, selectedJobs: [] }));
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getJobById = useCallback((id: string) => {
    return jobs.find(job => job.id === id);
  }, [jobs]);

  const getEngineById = useCallback((id: string) => {
    return engines.find(engine => engine.id === id);
  }, [engines]);

  const isJobSelected = useCallback((id: string) => {
    return state.selectedJobs.includes(id);
  }, [state.selectedJobs]);

  const canControlJob = useCallback((id: string) => {
    const job = getJobById(id);
    return job && ['pending', 'running', 'paused'].includes(job.status);
  }, [getJobById]);

  const getJobStatusColor = useCallback((status: string) => {
    const statusColors = {
      pending: 'yellow',
      running: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      paused: 'orange',
    };
    return statusColors[status as keyof typeof statusColors] || 'gray';
  }, []);

  const formatJobForDisplay = useCallback((job: ScanOrchestrationJob) => {
    return {
      ...job,
      displayName: job.name || 'Unnamed Job',
      statusColor: getJobStatusColor(job.status),
      durationFormatted: job.duration ? `${Math.round(job.duration / 60)}m` : 'N/A',
      progressPercentage: job.progress?.percentage || 0,
    };
  }, [getJobStatusColor]);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orchestrationJobs'] });
    queryClient.invalidateQueries({ queryKey: ['orchestrationEngines'] });
    queryClient.invalidateQueries({ queryKey: ['resourcePools'] });
    setState(prev => ({ ...prev, lastUpdate: new Date() }));
  }, [queryClient]);

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentEngine: null,
      currentJob: null,
      selectedJobs: [],
      jobProgress: {},
      jobErrors: {},
      resourceErrors: [],
      filters: {},
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      jobErrors: {},
      resourceErrors: [],
    }));
  }, []);

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================
  
  const subscribeToJobProgress = useCallback((jobId: string) => {
    const cleanup = orchestrationAPI.subscribeToJobProgress(jobId, (progress) => {
      setState(prev => ({
        ...prev,
        jobProgress: { ...prev.jobProgress, [jobId]: progress },
        realTimeConnected: true,
        lastUpdate: new Date(),
      }));
    });

    subscriptionsRef.current.set(`job-progress-${jobId}`, cleanup);
    setState(prev => ({ 
      ...prev, 
      activeSubscriptions: [...prev.activeSubscriptions, `job-progress-${jobId}`] 
    }));

    return cleanup;
  }, []);

  const subscribeToEngineMetrics = useCallback((engineId: string) => {
    const cleanup = orchestrationAPI.subscribeToOrchestrationEvents({
      engineIds: [engineId],
      eventTypes: ['engine_metrics_update', 'resource_utilization_change'],
      callback: (event) => {
        setState(prev => ({ 
          ...prev, 
          realTimeConnected: true, 
          lastUpdate: new Date() 
        }));
        
        // Refresh relevant queries
        queryClient.invalidateQueries({ queryKey: ['orchestrationEngine', engineId] });
        queryClient.invalidateQueries({ queryKey: ['realTimeMetrics'] });
      }
    });

    subscriptionsRef.current.set(`engine-metrics-${engineId}`, cleanup);
    setState(prev => ({ 
      ...prev, 
      activeSubscriptions: [...prev.activeSubscriptions, `engine-metrics-${engineId}`] 
    }));

    return cleanup;
  }, [queryClient]);

  const subscribeToResourceUpdates = useCallback(() => {
    const cleanup = orchestrationAPI.subscribeToOrchestrationEvents({
      eventTypes: ['resource_allocated', 'resource_released', 'resource_optimized'],
      callback: (event) => {
        setState(prev => ({ 
          ...prev, 
          realTimeConnected: true, 
          lastUpdate: new Date() 
        }));
        
        // Handle resource events
        if (event.type === 'resource_allocated') {
          options.onResourceAllocated?.(event.data);
        }
        
        // Refresh resource data
        queryClient.invalidateQueries({ queryKey: ['resourcePools'] });
      }
    });

    subscriptionsRef.current.set('resource-updates', cleanup);
    setState(prev => ({ 
      ...prev, 
      activeSubscriptions: [...prev.activeSubscriptions, 'resource-updates'] 
    }));

    return cleanup;
  }, [queryClient, options]);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(cleanup => cleanup());
    subscriptionsRef.current.clear();
    setState(prev => ({ 
      ...prev, 
      activeSubscriptions: [], 
      realTimeConnected: false 
    }));
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Update pagination info when data changes
  useEffect(() => {
    if (jobsResponse?.pagination) {
      setState(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: jobsResponse.pagination.total || 0,
          hasNextPage: jobsResponse.pagination.hasNextPage || false,
          hasPreviousPage: jobsResponse.pagination.hasPreviousPage || false,
        },
      }));
    }
  }, [jobsResponse]);

  // Update state with fetched data
  useEffect(() => {
    setState(prev => ({
      ...prev,
      engines,
      jobs,
      resourcePools,
      realTimeMetrics,
    }));
  }, [engines, jobs, resourcePools, realTimeMetrics]);

  // Enable real-time updates if requested
  useEffect(() => {
    if (options.enableRealTime) {
      subscribeToResourceUpdates();
    }
    
    return () => {
      unsubscribeAll();
    };
  }, [options.enableRealTime, subscribeToResourceUpdates, unsubscribeAll]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================
  
  return {
    // State
    ...state,
    engines,
    jobs,
    resourcePools,
    realTimeMetrics,
    isLoading,
    isFetching,
    error: error as Error | null,
    
    // Computed properties
    filteredJobs,
    orchestrationStats,
    hasSelection,
    selectionCount,
    
    // Engine management
    fetchEngines,
    createEngine,
    updateEngine: async (id: string, updates: Partial<OrchestrationEngine>, updateOptions?: any) => {
      const response = await orchestrationAPI.updateOrchestrationEngine(id, updates, updateOptions);
      queryClient.invalidateQueries({ queryKey: ['orchestrationEngines'] });
      return response.data;
    },
    deleteEngine: async (id: string) => {
      // Implementation would call delete API
      queryClient.invalidateQueries({ queryKey: ['orchestrationEngines'] });
      toast.success('Engine deleted successfully');
    },
    
    // Workflow management (placeholder implementations)
    fetchWorkflowOrchestrators: async (fetchOptions?: any) => {
      const response = await orchestrationAPI.getWorkflowOrchestrators(fetchOptions);
      setState(prev => ({ ...prev, workflowOrchestrators: response.data }));
    },
    createWorkflowOrchestrator: async (orchestrator: any, createOptions?: any) => {
      const response = await orchestrationAPI.createWorkflowOrchestrator(orchestrator, createOptions);
      return response.data;
    },
    fetchWorkflowTemplates: async (fetchOptions?: any) => {
      const response = await orchestrationAPI.getWorkflowTemplates(fetchOptions);
      setState(prev => ({ ...prev, workflowTemplates: response.data }));
    },
    createWorkflowTemplate: async (template: any, createOptions?: any) => {
      const response = await orchestrationAPI.createWorkflowTemplate(template, createOptions);
      return response.data;
    },
    
    // Job management
    fetchJobs,
    createJob,
    updateJob: async (id: string, updates: Partial<ScanOrchestrationJob>) => {
      // Implementation would call update API
      queryClient.invalidateQueries({ queryKey: ['orchestrationJobs'] });
      return {} as ScanOrchestrationJob;
    },
    deleteJob: async (id: string) => {
      // Implementation would call delete API
      queryClient.invalidateQueries({ queryKey: ['orchestrationJobs'] });
      setState(prev => ({
        ...prev,
        selectedJobs: prev.selectedJobs.filter(selectedId => selectedId !== id),
      }));
      toast.success('Job deleted successfully');
    },
    bulkDeleteJobs: async (ids: string[]) => {
      // Implementation would call bulk delete API
      queryClient.invalidateQueries({ queryKey: ['orchestrationJobs'] });
      setState(prev => ({
        ...prev,
        selectedJobs: prev.selectedJobs.filter(id => !ids.includes(id)),
      }));
      toast.success(`${ids.length} jobs deleted successfully`);
    },
    cloneJob: async (id: string, newName: string) => {
      const original = getJobById(id);
      if (original) {
        const cloned = { ...original, name: newName, id: undefined } as any;
        return await createJob(cloned);
      }
      throw new Error('Job not found');
    },
    
    // Job execution control
    startJob,
    pauseJob,
    resumeJob,
    cancelJob,
    restartJob,
    
    // Job monitoring
    getJobProgress,
    getJobLogs: async (id: string, logOptions?: any) => {
      const response = await orchestrationAPI.getJobProgress(id, { 
        ...logOptions, 
        includeLogs: true 
      });
      return response.data.recentLogs || [];
    },
    
    // Resource management
    fetchResourcePools: async (fetchOptions?: any) => {
      await refetchResourcePools();
    },
    allocateResources,
    optimizeResourceAllocation,
    releaseResources: async (allocationId: string) => {
      // Implementation would call release API
      queryClient.invalidateQueries({ queryKey: ['resourcePools'] });
      toast.success('Resources released successfully');
    },
    
    // Scheduling (placeholder implementations)
    fetchSchedulingEngines: async () => {
      const response = await orchestrationAPI.getSchedulingEngines();
      setState(prev => ({ ...prev, schedulingEngines: response.data }));
    },
    createSchedule: async (schedule: any, scheduleOptions?: any) => {
      const response = await orchestrationAPI.createSchedule(schedule, scheduleOptions);
      return response.data;
    },
    updateSchedule: async (id: string, updates: Partial<Schedule>) => {
      // Implementation would call update API
      return {} as Schedule;
    },
    deleteSchedule: async (id: string) => {
      // Implementation would call delete API
      toast.success('Schedule deleted successfully');
    },
    
    // Monitoring & Analytics
    getRealTimeMetrics: async (metricsOptions?: any) => {
      const response = await orchestrationAPI.getRealTimeMetrics(metricsOptions);
      setState(prev => ({ ...prev, realTimeMetrics: response.data }));
      return response.data;
    },
    getAnalytics: async (analyticsOptions?: any) => {
      const response = await orchestrationAPI.getOrchestrationAnalytics(analyticsOptions);
      return response.data;
    },
    
    // Integration management (placeholder implementations)
    fetchIntegrations: async () => {
      const response = await orchestrationAPI.getIntegrations();
      setState(prev => ({ ...prev, integrations: response.data }));
    },
    configureIntegration: async (integration: any, integrationOptions?: any) => {
      const response = await orchestrationAPI.configureIntegration(integration, integrationOptions);
      return response.data;
    },
    testIntegration: async (id: string) => {
      // Implementation would test integration
      return { success: true, message: 'Integration test successful' };
    },
    
    // State management
    setFilters,
    setPagination,
    setSelectedJobs,
    selectJob,
    deselectJob,
    selectAllJobs,
    deselectAllJobs,
    
    // Utilities
    refreshData,
    resetState,
    clearErrors,
    getJobById,
    getEngineById,
    isJobSelected,
    canControlJob,
    getJobStatusColor,
    formatJobForDisplay,
    exportJobs: async (ids: string[], format: string) => {
      // Implementation would export jobs
      return 'export-url';
    },
    
    // Real-time operations
    subscribeToJobProgress,
    subscribeToEngineMetrics,
    subscribeToResourceUpdates,
    unsubscribeAll,
  };
};

export default useOrchestration;