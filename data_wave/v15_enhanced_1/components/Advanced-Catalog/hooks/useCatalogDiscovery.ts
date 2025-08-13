// ============================================================================
// USE CATALOG DISCOVERY HOOK - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hook for managing catalog discovery operations and state
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  intelligentDiscoveryService,
  IntelligentDiscoveryService,
  CreateDiscoveryJobRequest,
  DiscoveryJobUpdateRequest,
  IncrementalDiscoveryRequest
} from '../services';
import { 
  DiscoveryJob,
  DiscoveryJobStatus,
  DiscoverySource,
  DiscoveryConfig,
  DiscoveryResult,
  IntelligentDataAsset,
  PaginationRequest,
  CatalogApiResponse
} from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseCatalogDiscoveryOptions {
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  maxRetries?: number;
  onDiscoveryComplete?: (result: DiscoveryResult) => void;
  onDiscoveryError?: (error: Error) => void;
}

export interface DiscoveryState {
  jobs: DiscoveryJob[];
  currentJob: DiscoveryJob | null;
  sources: DiscoverySource[];
  configs: DiscoveryConfig[];
  isLoading: boolean;
  isDiscovering: boolean;
  error: string | null;
  lastDiscovery: DiscoveryResult | null;
  metrics: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    averageDuration: number;
    lastRunTime: Date | null;
  };
}

export interface DiscoveryFilters {
  status?: DiscoveryJobStatus[];
  sourceType?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

// ============================================================================
// DISCOVERY OPERATIONS
// ============================================================================

export interface DiscoveryOperations {
  // Job Management
  createDiscoveryJob: (request: CreateDiscoveryJobRequest) => Promise<DiscoveryJob>;
  updateDiscoveryJob: (jobId: string, updates: DiscoveryJobUpdateRequest) => Promise<DiscoveryJob>;
  deleteDiscoveryJob: (jobId: string) => Promise<void>;
  executeDiscoveryJob: (jobId: string) => Promise<DiscoveryResult>;
  cancelDiscoveryJob: (jobId: string) => Promise<void>;
  
  // Discovery Operations
  startIncrementalDiscovery: (request: IncrementalDiscoveryRequest) => Promise<DiscoveryResult>;
  startFullDiscovery: (sourceId: string, configId?: string) => Promise<DiscoveryResult>;
  scheduleDiscovery: (jobId: string, schedule: any) => Promise<void>;
  
  // Source Management
  addDiscoverySource: (source: Partial<DiscoverySource>) => Promise<DiscoverySource>;
  updateDiscoverySource: (sourceId: string, updates: Partial<DiscoverySource>) => Promise<DiscoverySource>;
  removeDiscoverySource: (sourceId: string) => Promise<void>;
  testSourceConnection: (sourceId: string) => Promise<boolean>;
  
  // Configuration Management
  createDiscoveryConfig: (config: Partial<DiscoveryConfig>) => Promise<DiscoveryConfig>;
  updateDiscoveryConfig: (configId: string, updates: Partial<DiscoveryConfig>) => Promise<DiscoveryConfig>;
  deleteDiscoveryConfig: (configId: string) => Promise<void>;
  cloneDiscoveryConfig: (configId: string, newName: string) => Promise<DiscoveryConfig>;
  
  // Filtering and Search
  setFilters: (filters: DiscoveryFilters) => void;
  clearFilters: () => void;
  searchJobs: (query: string) => void;
  
  // State Management
  setCurrentJob: (job: DiscoveryJob | null) => void;
  refreshJobs: () => Promise<void>;
  refreshSources: () => Promise<void>;
  refreshConfigs: () => Promise<void>;
  resetState: () => void;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  DISCOVERY_JOBS: 'catalogDiscovery.jobs',
  DISCOVERY_JOB: 'catalogDiscovery.job',
  DISCOVERY_SOURCES: 'catalogDiscovery.sources',
  DISCOVERY_CONFIGS: 'catalogDiscovery.configs',
  DISCOVERY_RESULTS: 'catalogDiscovery.results',
  DISCOVERY_METRICS: 'catalogDiscovery.metrics',
} as const;

// ============================================================================
// CATALOG DISCOVERY HOOK
// ============================================================================

export function useCatalogDiscovery(
  options: UseCatalogDiscoveryOptions = {}
): DiscoveryState & DiscoveryOperations {
  const {
    enableRealTimeUpdates = false,
    autoRefreshInterval = 30000,
    maxRetries = 3,
    onDiscoveryComplete,
    onDiscoveryError
  } = options;

  const queryClient = useQueryClient();
  
  // Local State
  const [currentJob, setCurrentJob] = useState<DiscoveryJob | null>(null);
  const [filters, setFiltersState] = useState<DiscoveryFilters>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Discovery Jobs Query
  const {
    data: jobsResponse,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery({
    queryKey: [QUERY_KEYS.DISCOVERY_JOBS, filters, searchTerm],
    queryFn: async () => {
      const pagination: PaginationRequest = {
        page: 1,
        size: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };
      
      if (searchTerm) {
        return intelligentDiscoveryService.searchDiscoveryJobs({
          query: searchTerm,
          filters,
          pagination
        });
      }
      
      return intelligentDiscoveryService.listDiscoveryJobs(pagination);
    },
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // Discovery Sources Query
  const {
    data: sourcesResponse,
    isLoading: sourcesLoading,
    refetch: refetchSources
  } = useQuery({
    queryKey: [QUERY_KEYS.DISCOVERY_SOURCES],
    queryFn: () => intelligentDiscoveryService.listDiscoverySources({
      page: 1,
      size: 100,
      sortBy: 'name',
      sortOrder: 'ASC'
    }),
    retry: maxRetries
  });

  // Discovery Configs Query
  const {
    data: configsResponse,
    isLoading: configsLoading,
    refetch: refetchConfigs
  } = useQuery({
    queryKey: [QUERY_KEYS.DISCOVERY_CONFIGS],
    queryFn: () => intelligentDiscoveryService.listDiscoveryConfigs({
      page: 1,
      size: 100,
      sortBy: 'name',
      sortOrder: 'ASC'
    }),
    retry: maxRetries
  });

  // Discovery Metrics Query
  const { data: metricsResponse } = useQuery({
    queryKey: [QUERY_KEYS.DISCOVERY_METRICS],
    queryFn: () => intelligentDiscoveryService.getDiscoveryAnalytics({
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      }
    }),
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create Discovery Job
  const createJobMutation = useMutation({
    mutationFn: (request: CreateDiscoveryJobRequest) => 
      intelligentDiscoveryService.createDiscoveryJob(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_METRICS] });
    },
    onError: (error) => {
      onDiscoveryError?.(error as Error);
    }
  });

  // Update Discovery Job
  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, updates }: { jobId: string; updates: DiscoveryJobUpdateRequest }) =>
      intelligentDiscoveryService.updateDiscoveryJob(jobId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_JOBS] });
    }
  });

  // Execute Discovery Job
  const executeJobMutation = useMutation({
    mutationFn: (jobId: string) => intelligentDiscoveryService.executeDiscoveryJob(jobId),
    onMutate: () => {
      setIsDiscovering(true);
    },
    onSuccess: (result) => {
      setIsDiscovering(false);
      onDiscoveryComplete?.(result.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_METRICS] });
    },
    onError: (error) => {
      setIsDiscovering(false);
      onDiscoveryError?.(error as Error);
    }
  });

  // Delete Discovery Job
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => intelligentDiscoveryService.deleteDiscoveryJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_JOBS] });
      if (currentJob && deleteJobMutation.variables === currentJob.id) {
        setCurrentJob(null);
      }
    }
  });

  // Add Discovery Source
  const addSourceMutation = useMutation({
    mutationFn: (source: Partial<DiscoverySource>) =>
      intelligentDiscoveryService.createDiscoverySource(source as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_SOURCES] });
    }
  });

  // ============================================================================
  // COMPUTED STATE
  // ============================================================================

  const jobs = useMemo(() => jobsResponse?.data || [], [jobsResponse]);
  const sources = useMemo(() => sourcesResponse?.data || [], [sourcesResponse]);
  const configs = useMemo(() => configsResponse?.data || [], [configsResponse]);
  const isLoading = jobsLoading || sourcesLoading || configsLoading;
  const error = jobsError?.message || null;

  const metrics = useMemo(() => {
    if (!metricsResponse?.data || !jobs.length) {
      return {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        averageDuration: 0,
        lastRunTime: null
      };
    }

    const completedJobs = jobs.filter(job => job.status === 'COMPLETED').length;
    const failedJobs = jobs.filter(job => job.status === 'FAILED').length;
    const totalDuration = jobs
      .filter(job => job.duration)
      .reduce((sum, job) => sum + (job.duration || 0), 0);
    const avgDuration = totalDuration / Math.max(completedJobs, 1);
    const lastRun = jobs
      .filter(job => job.endTime)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())[0]?.endTime;

    return {
      totalJobs: jobs.length,
      completedJobs,
      failedJobs,
      averageDuration: avgDuration,
      lastRunTime: lastRun ? new Date(lastRun) : null
    };
  }, [jobs, metricsResponse]);

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  const createDiscoveryJob = useCallback(async (request: CreateDiscoveryJobRequest): Promise<DiscoveryJob> => {
    const result = await createJobMutation.mutateAsync(request);
    return result.data;
  }, [createJobMutation]);

  const updateDiscoveryJob = useCallback(async (
    jobId: string, 
    updates: DiscoveryJobUpdateRequest
  ): Promise<DiscoveryJob> => {
    const result = await updateJobMutation.mutateAsync({ jobId, updates });
    return result.data;
  }, [updateJobMutation]);

  const deleteDiscoveryJob = useCallback(async (jobId: string): Promise<void> => {
    await deleteJobMutation.mutateAsync(jobId);
  }, [deleteJobMutation]);

  const executeDiscoveryJob = useCallback(async (jobId: string): Promise<DiscoveryResult> => {
    const result = await executeJobMutation.mutateAsync(jobId);
    return result.data;
  }, [executeJobMutation]);

  const cancelDiscoveryJob = useCallback(async (jobId: string): Promise<void> => {
    await intelligentDiscoveryService.cancelDiscoveryJob(jobId);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_JOBS] });
  }, [queryClient]);

  const startIncrementalDiscovery = useCallback(async (
    request: IncrementalDiscoveryRequest
  ): Promise<DiscoveryResult> => {
    setIsDiscovering(true);
    try {
      const result = await intelligentDiscoveryService.startIncrementalDiscovery(request);
      setIsDiscovering(false);
      onDiscoveryComplete?.(result.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISCOVERY_JOBS] });
      return result.data;
    } catch (error) {
      setIsDiscovering(false);
      onDiscoveryError?.(error as Error);
      throw error;
    }
  }, [queryClient, onDiscoveryComplete, onDiscoveryError]);

  const startFullDiscovery = useCallback(async (
    sourceId: string, 
    configId?: string
  ): Promise<DiscoveryResult> => {
    const request: CreateDiscoveryJobRequest = {
      sourceId,
      configId,
      type: 'FULL_DISCOVERY',
      priority: 'NORMAL'
    };
    
    const job = await createDiscoveryJob(request);
    return executeDiscoveryJob(job.id);
  }, [createDiscoveryJob, executeDiscoveryJob]);

  const addDiscoverySource = useCallback(async (
    source: Partial<DiscoverySource>
  ): Promise<DiscoverySource> => {
    const result = await addSourceMutation.mutateAsync(source);
    return result.data;
  }, [addSourceMutation]);

  const setFilters = useCallback((newFilters: DiscoveryFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchTerm('');
  }, []);

  const searchJobs = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  const refreshJobs = useCallback(async () => {
    await refetchJobs();
  }, [refetchJobs]);

  const refreshSources = useCallback(async () => {
    await refetchSources();
  }, [refetchSources]);

  const refreshConfigs = useCallback(async () => {
    await refetchConfigs();
  }, [refetchConfigs]);

  const resetState = useCallback(() => {
    setCurrentJob(null);
    setFiltersState({});
    setSearchTerm('');
    setIsDiscovering(false);
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.DISCOVERY_JOBS] });
  }, [queryClient]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    jobs,
    currentJob,
    sources,
    configs,
    isLoading,
    isDiscovering,
    error,
    lastDiscovery: null, // This would come from a separate query
    metrics,
    
    // Operations
    createDiscoveryJob,
    updateDiscoveryJob,
    deleteDiscoveryJob,
    executeDiscoveryJob,
    cancelDiscoveryJob,
    startIncrementalDiscovery,
    startFullDiscovery,
    scheduleDiscovery: async () => {}, // TODO: Implement
    addDiscoverySource,
    updateDiscoverySource: async () => ({} as DiscoverySource), // TODO: Implement
    removeDiscoverySource: async () => {}, // TODO: Implement
    testSourceConnection: async () => true, // TODO: Implement
    createDiscoveryConfig: async () => ({} as DiscoveryConfig), // TODO: Implement
    updateDiscoveryConfig: async () => ({} as DiscoveryConfig), // TODO: Implement
    deleteDiscoveryConfig: async () => {}, // TODO: Implement
    cloneDiscoveryConfig: async () => ({} as DiscoveryConfig), // TODO: Implement
    setFilters,
    clearFilters,
    searchJobs,
    setCurrentJob,
    refreshJobs,
    refreshSources,
    refreshConfigs,
    resetState
  };
}