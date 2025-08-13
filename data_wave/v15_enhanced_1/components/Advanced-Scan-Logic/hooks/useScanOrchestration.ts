// Advanced-Scan-Logic/hooks/useScanOrchestration.ts
// Comprehensive React hook for scan orchestration

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ScanOrchestrationJob,
  OrchestrationJobStatus,
  OrchestrationJobType,
  OrchestrationPriority,
  CreateOrchestrationJobRequest,
  UpdateOrchestrationJobRequest,
  OrchestrationJobListResponse,
  OrchestrationJobFilters,
  OrchestrationJobSort,
  WorkflowTemplate,
  ExecutionPipeline,
  ResourcePool,
  OrchestrationAnalytics
} from '../types/orchestration.types';
import { scanOrchestrationAPI } from '../services/scan-orchestration-apis';

// Hook options interface
interface UseScanOrchestrationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  onJobStatusChange?: (jobId: string, status: OrchestrationJobStatus) => void;
  onError?: (error: Error) => void;
}

// Hook return type
interface UseScanOrchestrationReturn {
  // Job management
  jobs: ScanOrchestrationJob[];
  selectedJob: ScanOrchestrationJob | null;
  isLoading: boolean;
  error: Error | null;
  
  // Pagination and filtering
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: OrchestrationJobFilters;
  sort: OrchestrationJobSort;
  
  // Job operations
  createJob: (request: CreateOrchestrationJobRequest) => Promise<ScanOrchestrationJob>;
  updateJob: (jobId: string, request: UpdateOrchestrationJobRequest) => Promise<ScanOrchestrationJob>;
  deleteJob: (jobId: string) => Promise<void>;
  startJob: (jobId: string) => Promise<ScanOrchestrationJob>;
  stopJob: (jobId: string) => Promise<ScanOrchestrationJob>;
  pauseJob: (jobId: string) => Promise<ScanOrchestrationJob>;
  resumeJob: (jobId: string) => Promise<ScanOrchestrationJob>;
  retryJob: (jobId: string) => Promise<ScanOrchestrationJob>;
  
  // Bulk operations
  bulkStartJobs: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  bulkStopJobs: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  
  // Selection and filtering
  selectJob: (job: ScanOrchestrationJob | null) => void;
  setFilters: (filters: Partial<OrchestrationJobFilters>) => void;
  setSort: (sort: OrchestrationJobSort) => void;
  setPagination: (page: number, pageSize?: number) => void;
  clearFilters: () => void;
  
  // Templates and resources
  workflowTemplates: WorkflowTemplate[];
  executionPipelines: ExecutionPipeline[];
  resourcePools: ResourcePool[];
  loadWorkflowTemplates: () => Promise<void>;
  loadExecutionPipelines: () => Promise<void>;
  loadResourcePools: () => Promise<void>;
  
  // Analytics and monitoring
  analytics: OrchestrationAnalytics | null;
  loadAnalytics: (timeRange?: { start: string; end: string }) => Promise<void>;
  getJobLogs: (jobId: string, level?: string, limit?: number) => Promise<any[]>;
  
  // Real-time updates
  subscribeToJobUpdates: (jobId: string) => void;
  unsubscribeFromJobUpdates: () => void;
  
  // Utility functions
  refreshJobs: () => Promise<void>;
  validateJobConfiguration: (request: CreateOrchestrationJobRequest) => { valid: boolean; errors: string[] };
  getJobStatusColor: (status: OrchestrationJobStatus) => string;
  getJobPriorityLabel: (priority: OrchestrationPriority) => string;
  estimateJobDuration: (job: ScanOrchestrationJob) => number;
}

export const useScanOrchestration = (options: UseScanOrchestrationOptions = {}): UseScanOrchestrationReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true,
    onJobStatusChange,
    onError
  } = options;

  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  // State management
  const [selectedJob, setSelectedJob] = useState<ScanOrchestrationJob | null>(null);
  const [filters, setFiltersState] = useState<OrchestrationJobFilters>({});
  const [sort, setSortState] = useState<OrchestrationJobSort>({ field: 'created_at', direction: 'desc' });
  const [pagination, setPaginationState] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Additional state
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [executionPipelines, setExecutionPipelines] = useState<ExecutionPipeline[]>([]);
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>([]);
  const [analytics, setAnalytics] = useState<OrchestrationAnalytics | null>(null);

  // Query key for caching
  const getJobsQueryKey = useCallback(() => [
    'orchestration-jobs',
    filters,
    sort,
    pagination.page,
    pagination.pageSize
  ], [filters, sort, pagination.page, pagination.pageSize]);

  // Fetch orchestration jobs
  const {
    data: jobsResponse,
    isLoading,
    error,
    refetch: refreshJobs
  } = useQuery<OrchestrationJobListResponse>({
    queryKey: getJobsQueryKey(),
    queryFn: () => scanOrchestrationAPI.listOrchestrationJobs(filters, sort, pagination.page, pagination.pageSize),
    refetchInterval: autoRefresh ? refreshInterval : false,
    onError: (err) => {
      console.error('Failed to fetch orchestration jobs:', err);
      onError?.(err as Error);
      toast.error('Failed to load orchestration jobs');
    }
  });

  // Update pagination when data changes
  useEffect(() => {
    if (jobsResponse) {
      setPaginationState(prev => ({
        ...prev,
        totalPages: jobsResponse.total_pages,
        totalCount: jobsResponse.total_count,
        hasNext: jobsResponse.has_next,
        hasPrevious: jobsResponse.has_previous
      }));
    }
  }, [jobsResponse]);

  // Job creation mutation
  const createJobMutation = useMutation({
    mutationFn: (request: CreateOrchestrationJobRequest) => scanOrchestrationAPI.createOrchestrationJob(request),
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['orchestration-jobs'] });
      toast.success(`Job "${newJob.name}" created successfully`);
    },
    onError: (err) => {
      console.error('Failed to create job:', err);
      onError?.(err as Error);
      toast.error('Failed to create orchestration job');
    }
  });

  // Job update mutation
  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, request }: { jobId: string; request: UpdateOrchestrationJobRequest }) =>
      scanOrchestrationAPI.updateOrchestrationJob(jobId, request),
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: ['orchestration-jobs'] });
      if (selectedJob?.id === updatedJob.id) {
        setSelectedJob(updatedJob);
      }
      toast.success(`Job "${updatedJob.name}" updated successfully`);
    },
    onError: (err) => {
      console.error('Failed to update job:', err);
      onError?.(err as Error);
      toast.error('Failed to update orchestration job');
    }
  });

  // Job deletion mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => scanOrchestrationAPI.deleteOrchestrationJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['orchestration-jobs'] });
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
      }
      toast.success('Job deleted successfully');
    },
    onError: (err) => {
      console.error('Failed to delete job:', err);
      onError?.(err as Error);
      toast.error('Failed to delete orchestration job');
    }
  });

  // Job control mutations
  const createJobControlMutation = (action: string, apiCall: (jobId: string) => Promise<ScanOrchestrationJob>) =>
    useMutation({
      mutationFn: apiCall,
      onSuccess: (updatedJob) => {
        queryClient.invalidateQueries({ queryKey: ['orchestration-jobs'] });
        if (selectedJob?.id === updatedJob.id) {
          setSelectedJob(updatedJob);
        }
        onJobStatusChange?.(updatedJob.id, updatedJob.status);
        toast.success(`Job ${action} successfully`);
      },
      onError: (err) => {
        console.error(`Failed to ${action} job:`, err);
        onError?.(err as Error);
        toast.error(`Failed to ${action} job`);
      }
    });

  const startJobMutation = createJobControlMutation('started', scanOrchestrationAPI.startOrchestrationJob);
  const stopJobMutation = createJobControlMutation('stopped', scanOrchestrationAPI.stopOrchestrationJob);
  const pauseJobMutation = createJobControlMutation('paused', scanOrchestrationAPI.pauseOrchestrationJob);
  const resumeJobMutation = createJobControlMutation('resumed', scanOrchestrationAPI.resumeOrchestrationJob);
  const retryJobMutation = createJobControlMutation('retried', scanOrchestrationAPI.retryOrchestrationJob);

  // Bulk operations mutations
  const bulkStartMutation = useMutation({
    mutationFn: (jobIds: string[]) => scanOrchestrationAPI.bulkStartJobs(jobIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orchestration-jobs'] });
      toast.success(`Started ${result.success.length} jobs successfully`);
      if (result.failed.length > 0) {
        toast.warning(`Failed to start ${result.failed.length} jobs`);
      }
    },
    onError: (err) => {
      console.error('Failed to bulk start jobs:', err);
      onError?.(err as Error);
      toast.error('Failed to start jobs');
    }
  });

  const bulkStopMutation = useMutation({
    mutationFn: (jobIds: string[]) => scanOrchestrationAPI.bulkStopJobs(jobIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orchestration-jobs'] });
      toast.success(`Stopped ${result.success.length} jobs successfully`);
      if (result.failed.length > 0) {
        toast.warning(`Failed to stop ${result.failed.length} jobs`);
      }
    },
    onError: (err) => {
      console.error('Failed to bulk stop jobs:', err);
      onError?.(err as Error);
      toast.error('Failed to stop jobs');
    }
  });

  // Utility functions
  const setFilters = useCallback((newFilters: Partial<OrchestrationJobFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const setSort = useCallback((newSort: OrchestrationJobSort) => {
    setSortState(newSort);
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const setPagination = useCallback((page: number, pageSize?: number) => {
    setPaginationState(prev => ({
      ...prev,
      page,
      ...(pageSize && { pageSize })
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const selectJob = useCallback((job: ScanOrchestrationJob | null) => {
    setSelectedJob(job);
  }, []);

  // Load workflow templates
  const loadWorkflowTemplates = useCallback(async () => {
    try {
      const templates = await scanOrchestrationAPI.getWorkflowTemplates();
      setWorkflowTemplates(templates);
    } catch (err) {
      console.error('Failed to load workflow templates:', err);
      onError?.(err as Error);
      toast.error('Failed to load workflow templates');
    }
  }, [onError]);

  // Load execution pipelines
  const loadExecutionPipelines = useCallback(async () => {
    try {
      const pipelines = await scanOrchestrationAPI.getExecutionPipelines();
      setExecutionPipelines(pipelines);
    } catch (err) {
      console.error('Failed to load execution pipelines:', err);
      onError?.(err as Error);
      toast.error('Failed to load execution pipelines');
    }
  }, [onError]);

  // Load resource pools
  const loadResourcePools = useCallback(async () => {
    try {
      const pools = await scanOrchestrationAPI.getResourcePools();
      setResourcePools(pools);
    } catch (err) {
      console.error('Failed to load resource pools:', err);
      onError?.(err as Error);
      toast.error('Failed to load resource pools');
    }
  }, [onError]);

  // Load analytics
  const loadAnalytics = useCallback(async (timeRange?: { start: string; end: string }) => {
    try {
      const analyticsData = await scanOrchestrationAPI.getOrchestrationAnalytics(timeRange);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      onError?.(err as Error);
      toast.error('Failed to load analytics');
    }
  }, [onError]);

  // Get job logs
  const getJobLogs = useCallback(async (jobId: string, level?: string, limit?: number) => {
    try {
      return await scanOrchestrationAPI.getJobLogs(jobId, level, limit);
    } catch (err) {
      console.error('Failed to get job logs:', err);
      onError?.(err as Error);
      toast.error('Failed to load job logs');
      return [];
    }
  }, [onError]);

  // Real-time updates
  const subscribeToJobUpdates = useCallback((jobId: string) => {
    if (!enableRealTimeUpdates) return;

    try {
      wsRef.current = scanOrchestrationAPI.subscribeToJobUpdates(jobId, (data) => {
        // Update the specific job in the cache
        queryClient.setQueryData(getJobsQueryKey(), (oldData: OrchestrationJobListResponse | undefined) => {
          if (!oldData) return oldData;
          
          const updatedJobs = oldData.jobs.map(job => 
            job.id === jobId ? { ...job, ...data } : job
          );
          
          return { ...oldData, jobs: updatedJobs };
        });

        // Update selected job if it matches
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? { ...prev, ...data } : null);
        }

        // Trigger status change callback
        if (data.status) {
          onJobStatusChange?.(jobId, data.status);
        }
      });
    } catch (err) {
      console.error('Failed to subscribe to job updates:', err);
      onError?.(err as Error);
    }
  }, [enableRealTimeUpdates, selectedJob?.id, onJobStatusChange, onError, queryClient, getJobsQueryKey]);

  const unsubscribeFromJobUpdates = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Utility functions for UI
  const validateJobConfiguration = useCallback((request: CreateOrchestrationJobRequest) => {
    return scanOrchestrationAPI.validateJobConfiguration(request);
  }, []);

  const getJobStatusColor = useCallback((status: OrchestrationJobStatus): string => {
    const statusColors: Record<OrchestrationJobStatus, string> = {
      [OrchestrationJobStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [OrchestrationJobStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
      [OrchestrationJobStatus.QUEUED]: 'bg-yellow-100 text-yellow-800',
      [OrchestrationJobStatus.INITIALIZING]: 'bg-purple-100 text-purple-800',
      [OrchestrationJobStatus.RUNNING]: 'bg-green-100 text-green-800',
      [OrchestrationJobStatus.PAUSED]: 'bg-orange-100 text-orange-800',
      [OrchestrationJobStatus.RESUMING]: 'bg-blue-100 text-blue-800',
      [OrchestrationJobStatus.CANCELLING]: 'bg-red-100 text-red-800',
      [OrchestrationJobStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
      [OrchestrationJobStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [OrchestrationJobStatus.FAILED]: 'bg-red-100 text-red-800',
      [OrchestrationJobStatus.TIMEOUT]: 'bg-red-100 text-red-800',
      [OrchestrationJobStatus.RETRYING]: 'bg-yellow-100 text-yellow-800',
      [OrchestrationJobStatus.SKIPPED]: 'bg-gray-100 text-gray-800',
      [OrchestrationJobStatus.PARTIALLY_COMPLETED]: 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const getJobPriorityLabel = useCallback((priority: OrchestrationPriority): string => {
    const priorityLabels: Record<OrchestrationPriority, string> = {
      [OrchestrationPriority.URGENT]: 'Urgent',
      [OrchestrationPriority.HIGH]: 'High',
      [OrchestrationPriority.NORMAL]: 'Normal',
      [OrchestrationPriority.LOW]: 'Low',
      [OrchestrationPriority.BACKGROUND]: 'Background'
    };
    return priorityLabels[priority] || 'Unknown';
  }, []);

  const estimateJobDuration = useCallback((job: ScanOrchestrationJob): number => {
    // Simple estimation based on job configuration and historical data
    // This would typically use more sophisticated algorithms
    return job.timeout_minutes || 60;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromJobUpdates();
    };
  }, [unsubscribeFromJobUpdates]);

  // Load initial data
  useEffect(() => {
    loadWorkflowTemplates();
    loadExecutionPipelines();
    loadResourcePools();
    loadAnalytics();
  }, [loadWorkflowTemplates, loadExecutionPipelines, loadResourcePools, loadAnalytics]);

  return {
    // Job data
    jobs: jobsResponse?.jobs || [],
    selectedJob,
    isLoading,
    error: error as Error | null,
    
    // Pagination and filtering
    pagination,
    filters,
    sort,
    
    // Job operations
    createJob: createJobMutation.mutateAsync,
    updateJob: (jobId: string, request: UpdateOrchestrationJobRequest) => 
      updateJobMutation.mutateAsync({ jobId, request }),
    deleteJob: deleteJobMutation.mutateAsync,
    startJob: startJobMutation.mutateAsync,
    stopJob: stopJobMutation.mutateAsync,
    pauseJob: pauseJobMutation.mutateAsync,
    resumeJob: resumeJobMutation.mutateAsync,
    retryJob: retryJobMutation.mutateAsync,
    
    // Bulk operations
    bulkStartJobs: bulkStartMutation.mutateAsync,
    bulkStopJobs: bulkStopMutation.mutateAsync,
    
    // Selection and filtering
    selectJob,
    setFilters,
    setSort,
    setPagination,
    clearFilters,
    
    // Templates and resources
    workflowTemplates,
    executionPipelines,
    resourcePools,
    loadWorkflowTemplates,
    loadExecutionPipelines,
    loadResourcePools,
    
    // Analytics and monitoring
    analytics,
    loadAnalytics,
    getJobLogs,
    
    // Real-time updates
    subscribeToJobUpdates,
    unsubscribeFromJobUpdates,
    
    // Utility functions
    refreshJobs,
    validateJobConfiguration,
    getJobStatusColor,
    getJobPriorityLabel,
    estimateJobDuration
  };
};