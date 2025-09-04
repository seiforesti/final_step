// ============================================================================
// USE CATALOG PROFILING HOOK - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hook for managing data profiling operations and statistical analysis
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataProfilingService,
  CreateProfilingJobRequest,
  ProfilingJobUpdateRequest,
  ProfilingAnalyticsRequest,
  ColumnProfilingRequest,
  CustomProfilingRequest
} from '../services';
import {
  DataProfilingResult,
  ProfilingRequest,
  ProfilingConfig,
  StatisticalMetrics,
  DataDistribution,
  DataQualityProfile,
  ProfilingJob,
  ProfilingJobStatus,
  TimeRange,
  CatalogApiResponse,
  PaginationRequest
} from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseCatalogProfilingOptions {
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  maxRetries?: number;
  onProfilingComplete?: (result: DataProfilingResult) => void;
  onProfilingError?: (error: Error) => void;
}

export interface ProfilingState {
  jobs: ProfilingJob[];
  currentJob: ProfilingJob | null;
  results: DataProfilingResult[];
  currentResult: DataProfilingResult | null;
  statisticalMetrics: StatisticalMetrics[];
  distributions: DataDistribution[];
  qualityProfiles: DataQualityProfile[];
  configurations: ProfilingConfig[];
  defaultConfig: ProfilingConfig | null;
  analytics: any | null;
  trends: any | null;
  isLoading: boolean;
  isProfiling: boolean;
  isAnalyzing: boolean;
  error: string | null;
  lastProfilingTime: Date | null;
}

export interface ProfilingFilters {
  assetId?: string;
  jobStatus?: ProfilingJobStatus[];
  jobType?: 'BASIC' | 'ADVANCED' | 'COMPREHENSIVE' | 'CUSTOM';
  timeRange?: TimeRange;
  includeStatistics?: boolean;
  includeQuality?: boolean;
  sampleSize?: number;
}

// ============================================================================
// PROFILING OPERATIONS
// ============================================================================

export interface ProfilingOperations {
  // Job Management
  createProfilingJob: (request: CreateProfilingJobRequest) => Promise<ProfilingJob>;
  updateProfilingJob: (jobId: string, updates: ProfilingJobUpdateRequest) => Promise<ProfilingJob>;
  deleteProfilingJob: (jobId: string) => Promise<void>;
  executeProfilingJob: (jobId: string) => Promise<DataProfilingResult>;
  cancelProfilingJob: (jobId: string) => Promise<void>;
  listProfilingJobs: (pagination: PaginationRequest) => Promise<ProfilingJob[]>;

  // Results Management
  getProfilingResults: (assetId: string) => Promise<DataProfilingResult[]>;
  getLatestProfilingResult: (assetId: string) => Promise<DataProfilingResult>;
  getProfilingResultById: (resultId: string) => Promise<DataProfilingResult>;
  deleteProfilingResult: (resultId: string) => Promise<void>;

  // Statistical Analysis
  getStatisticalMetrics: (assetId: string, columnNames?: string[]) => Promise<StatisticalMetrics[]>;
  getDataDistribution: (assetId: string, columnName: string, binCount?: number) => Promise<DataDistribution>;
  getDataQualityProfile: (assetId: string) => Promise<DataQualityProfile>;

  // Custom Profiling
  profileColumns: (request: ColumnProfilingRequest) => Promise<DataProfilingResult>;
  executeCustomProfiling: (request: CustomProfilingRequest) => Promise<DataProfilingResult>;
  validateProfilingRules: (rules: any[]) => Promise<{ valid: boolean; errors: string[] }>;

  // Analytics
  getProfilingAnalytics: (request: ProfilingAnalyticsRequest) => Promise<any>;
  getProfilingTrends: (assetId: string, timeRange: TimeRange) => Promise<any>;
  compareProfilingResults: (resultId1: string, resultId2: string) => Promise<any>;

  // Configuration
  getDefaultProfilingConfig: () => Promise<ProfilingConfig>;
  updateDefaultProfilingConfig: (config: ProfilingConfig) => Promise<ProfilingConfig>;
  getProfilingTemplates: () => Promise<ProfilingConfig[]>;

  // Export & Reporting
  exportProfilingResults: (resultId: string, format: string) => Promise<Blob>;
  generateProfilingReport: (assetId: string, includeCharts?: boolean) => Promise<string>;

  // State Management
  setFilters: (filters: ProfilingFilters) => void;
  clearFilters: () => void;
  setCurrentJob: (job: ProfilingJob | null) => void;
  setCurrentResult: (result: DataProfilingResult | null) => void;
  refreshProfiling: () => Promise<void>;
  resetState: () => void;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  PROFILING_JOBS: 'catalogProfiling.jobs',
  PROFILING_JOB: 'catalogProfiling.job',
  PROFILING_RESULTS: 'catalogProfiling.results',
  PROFILING_RESULT: 'catalogProfiling.result',
  STATISTICAL_METRICS: 'catalogProfiling.statisticalMetrics',
  DATA_DISTRIBUTIONS: 'catalogProfiling.distributions',
  QUALITY_PROFILES: 'catalogProfiling.qualityProfiles',
  PROFILING_CONFIGS: 'catalogProfiling.configs',
  DEFAULT_CONFIG: 'catalogProfiling.defaultConfig',
  PROFILING_ANALYTICS: 'catalogProfiling.analytics',
  PROFILING_TRENDS: 'catalogProfiling.trends',
} as const;

// ============================================================================
// CATALOG PROFILING HOOK
// ============================================================================

export function useCatalogProfiling(
  options: UseCatalogProfilingOptions = {}
): ProfilingState & ProfilingOperations {
  const {
    enableRealTimeUpdates = false,
    autoRefreshInterval = 60000, // 1 minute
    maxRetries = 3,
    onProfilingComplete,
    onProfilingError
  } = options;

  const queryClient = useQueryClient();

  // Local State
  const [currentJob, setCurrentJob] = useState<ProfilingJob | null>(null);
  const [currentResult, setCurrentResult] = useState<DataProfilingResult | null>(null);
  const [filters, setFiltersState] = useState<ProfilingFilters>({
    includeStatistics: true,
    includeQuality: true
  });
  const [isProfiling, setIsProfiling] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastProfilingTime, setLastProfilingTime] = useState<Date | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Profiling Jobs Query
  const {
    data: jobsResponse,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery({
    queryKey: [QUERY_KEYS.PROFILING_JOBS, filters],
    queryFn: () => dataProfilingService.listProfilingJobs({
      page: 1,
      size: 100,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    }),
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // Profiling Results Query
  const {
    data: resultsResponse,
    isLoading: resultsLoading,
    refetch: refetchResults
  } = useQuery({
    queryKey: [QUERY_KEYS.PROFILING_RESULTS, filters.assetId],
    queryFn: () => dataProfilingService.getProfilingResults(filters.assetId!),
    enabled: !!filters.assetId,
    retry: maxRetries
  });

  // Statistical Metrics Query
  const {
    data: metricsResponse,
    isLoading: metricsLoading,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: [QUERY_KEYS.STATISTICAL_METRICS, filters.assetId],
    queryFn: () => dataProfilingService.getStatisticalMetrics(filters.assetId!),
    enabled: !!filters.assetId && filters.includeStatistics,
    retry: maxRetries
  });

  // Quality Profiles Query
  const {
    data: qualityResponse,
    isLoading: qualityLoading,
    refetch: refetchQuality
  } = useQuery({
    queryKey: [QUERY_KEYS.QUALITY_PROFILES, filters.assetId],
    queryFn: () => dataProfilingService.getDataQualityProfile(filters.assetId!),
    enabled: !!filters.assetId && filters.includeQuality,
    retry: maxRetries
  });

  // Default Configuration Query
  const {
    data: defaultConfigResponse,
    refetch: refetchDefaultConfig
  } = useQuery({
    queryKey: [QUERY_KEYS.DEFAULT_CONFIG],
    queryFn: () => dataProfilingService.getDefaultProfilingConfig(),
    retry: maxRetries
  });

  // Profiling Templates Query
  const {
    data: templatesResponse,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: [QUERY_KEYS.PROFILING_CONFIGS],
    queryFn: () => dataProfilingService.getProfilingTemplates(),
    retry: maxRetries
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create Profiling Job
  const createJobMutation = useMutation({
    mutationFn: (request: CreateProfilingJobRequest) =>
      dataProfilingService.createProfilingJob(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_JOBS] });
    },
    onError: (error) => {
      onProfilingError?.(error as Error);
    }
  });

  // Execute Profiling Job
  const executeJobMutation = useMutation({
    mutationFn: (jobId: string) => dataProfilingService.executeProfilingJob(jobId),
    onMutate: () => {
      setIsProfiling(true);
    },
    onSuccess: (result) => {
      setIsProfiling(false);
      setLastProfilingTime(new Date());
      onProfilingComplete?.(result.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_JOBS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_RESULTS] });
    },
    onError: (error) => {
      setIsProfiling(false);
      onProfilingError?.(error as Error);
    }
  });

  // Update Profiling Job
  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, updates }: { jobId: string; updates: ProfilingJobUpdateRequest }) =>
      dataProfilingService.updateProfilingJob(jobId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_JOBS] });
    }
  });

  // Custom Profiling
  const customProfilingMutation = useMutation({
    mutationFn: (request: CustomProfilingRequest) =>
      dataProfilingService.executeCustomProfiling(request),
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (result) => {
      setIsAnalyzing(false);
      onProfilingComplete?.(result.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_RESULTS] });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      onProfilingError?.(error as Error);
    }
  });

  // Column Profiling
  const columnProfilingMutation = useMutation({
    mutationFn: (request: ColumnProfilingRequest) =>
      dataProfilingService.profileColumns(request),
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (result) => {
      setIsAnalyzing(false);
      onProfilingComplete?.(result.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_RESULTS] });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      onProfilingError?.(error as Error);
    }
  });

  // ============================================================================
  // COMPUTED STATE
  // ============================================================================

  const jobs = useMemo(() => jobsResponse?.data || [], [jobsResponse]);
  const results = useMemo(() => resultsResponse?.data || [], [resultsResponse]);
  const statisticalMetrics = useMemo(() => metricsResponse?.data || [], [metricsResponse]);
  const qualityProfiles = useMemo(() => qualityResponse?.data ? [qualityResponse.data] : [], [qualityResponse]);
  const defaultConfig = useMemo(() => defaultConfigResponse?.data || null, [defaultConfigResponse]);
  const configurations = useMemo(() => templatesResponse?.data || [], [templatesResponse]);
  
  const isLoading = jobsLoading || resultsLoading || metricsLoading || qualityLoading;
  const error = jobsError?.message || null;

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  const createProfilingJob = useCallback(async (
    request: CreateProfilingJobRequest
  ): Promise<ProfilingJob> => {
    const result = await createJobMutation.mutateAsync(request);
    return result.data;
  }, [createJobMutation]);

  const updateProfilingJob = useCallback(async (
    jobId: string,
    updates: ProfilingJobUpdateRequest
  ): Promise<ProfilingJob> => {
    const result = await updateJobMutation.mutateAsync({ jobId, updates });
    return result.data;
  }, [updateJobMutation]);

  const deleteProfilingJob = useCallback(async (jobId: string): Promise<void> => {
    await dataProfilingService.deleteProfilingJob(jobId);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_JOBS] });
    if (currentJob && currentJob.id === jobId) {
      setCurrentJob(null);
    }
  }, [queryClient, currentJob]);

  const executeProfilingJob = useCallback(async (jobId: string): Promise<DataProfilingResult> => {
    const result = await executeJobMutation.mutateAsync(jobId);
    return result.data;
  }, [executeJobMutation]);

  const cancelProfilingJob = useCallback(async (jobId: string): Promise<void> => {
    await dataProfilingService.cancelProfilingJob(jobId);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_JOBS] });
  }, [queryClient]);

  const listProfilingJobs = useCallback(async (
    pagination: PaginationRequest
  ): Promise<ProfilingJob[]> => {
    const result = await dataProfilingService.listProfilingJobs(pagination);
    return result.data;
  }, []);

  const getProfilingResults = useCallback(async (assetId: string): Promise<DataProfilingResult[]> => {
    const result = await dataProfilingService.getProfilingResults(assetId);
    return result.data;
  }, []);

  const getLatestProfilingResult = useCallback(async (assetId: string): Promise<DataProfilingResult> => {
    const result = await dataProfilingService.getLatestProfilingResult(assetId);
    return result.data;
  }, []);

  const getProfilingResultById = useCallback(async (resultId: string): Promise<DataProfilingResult> => {
    const result = await dataProfilingService.getProfilingResultById(resultId);
    return result.data;
  }, []);

  const deleteProfilingResult = useCallback(async (resultId: string): Promise<void> => {
    await dataProfilingService.deleteProfilingResult(resultId);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILING_RESULTS] });
    if (currentResult && currentResult.id === resultId) {
      setCurrentResult(null);
    }
  }, [queryClient, currentResult]);

  const getStatisticalMetrics = useCallback(async (
    assetId: string,
    columnNames?: string[]
  ): Promise<StatisticalMetrics[]> => {
    const result = await dataProfilingService.getStatisticalMetrics(assetId, columnNames);
    return result.data;
  }, []);

  const getDataDistribution = useCallback(async (
    assetId: string,
    columnName: string,
    binCount?: number
  ): Promise<DataDistribution> => {
    const result = await dataProfilingService.getDataDistribution(assetId, columnName, binCount);
    return result.data;
  }, []);

  const getDataQualityProfile = useCallback(async (assetId: string): Promise<DataQualityProfile> => {
    const result = await dataProfilingService.getDataQualityProfile(assetId);
    return result.data;
  }, []);

  const profileColumns = useCallback(async (
    request: ColumnProfilingRequest
  ): Promise<DataProfilingResult> => {
    const result = await columnProfilingMutation.mutateAsync(request);
    return result.data;
  }, [columnProfilingMutation]);

  const executeCustomProfiling = useCallback(async (
    request: CustomProfilingRequest
  ): Promise<DataProfilingResult> => {
    const result = await customProfilingMutation.mutateAsync(request);
    return result.data;
  }, [customProfilingMutation]);

  const validateProfilingRules = useCallback(async (
    rules: any[]
  ): Promise<{ valid: boolean; errors: string[] }> => {
    const result = await dataProfilingService.validateProfilingRules(rules as any);
    return result.data;
  }, []);

  const getProfilingAnalytics = useCallback(async (
    request: ProfilingAnalyticsRequest
  ): Promise<any> => {
    const result = await dataProfilingService.getProfilingAnalytics(request);
    return result.data;
  }, []);

  const getProfilingTrends = useCallback(async (
    assetId: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await dataProfilingService.getProfilingTrends(assetId, timeRange);
    return result.data;
  }, []);

  const compareProfilingResults = useCallback(async (
    resultId1: string,
    resultId2: string
  ): Promise<any> => {
    const result = await dataProfilingService.compareProfilingResults(resultId1, resultId2);
    return result.data;
  }, []);

  const getDefaultProfilingConfig = useCallback(async (): Promise<ProfilingConfig> => {
    const result = await dataProfilingService.getDefaultProfilingConfig();
    return result.data;
  }, []);

  const updateDefaultProfilingConfig = useCallback(async (
    config: ProfilingConfig
  ): Promise<ProfilingConfig> => {
    const result = await dataProfilingService.updateDefaultProfilingConfig(config);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEFAULT_CONFIG] });
    return result.data;
  }, [queryClient]);

  const getProfilingTemplates = useCallback(async (): Promise<ProfilingConfig[]> => {
    const result = await dataProfilingService.getProfilingTemplates();
    return result.data;
  }, []);

  const exportProfilingResults = useCallback(async (
    resultId: string,
    format: string
  ): Promise<Blob> => {
    return dataProfilingService.exportProfilingResults(resultId, format as any);
  }, []);

  const generateProfilingReport = useCallback(async (
    assetId: string,
    includeCharts: boolean = true
  ): Promise<string> => {
    const result = await dataProfilingService.generateProfilingReport(assetId, includeCharts);
    return result.data;
  }, []);

  const setFilters = useCallback((newFilters: ProfilingFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      includeStatistics: true,
      includeQuality: true
    });
  }, []);

  const refreshProfiling = useCallback(async () => {
    await Promise.all([
      refetchJobs(),
      refetchResults(),
      refetchMetrics(),
      refetchQuality(),
      refetchDefaultConfig(),
      refetchTemplates()
    ]);
  }, [refetchJobs, refetchResults, refetchMetrics, refetchQuality, refetchDefaultConfig, refetchTemplates]);

  const resetState = useCallback(() => {
    setCurrentJob(null);
    setCurrentResult(null);
    setFiltersState({
      includeStatistics: true,
      includeQuality: true
    });
    setIsProfiling(false);
    setIsAnalyzing(false);
    setLastProfilingTime(null);
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.PROFILING_JOBS] });
  }, [queryClient]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    jobs,
    currentJob,
    results,
    currentResult,
    statisticalMetrics,
    distributions: [],
    qualityProfiles,
    configurations,
    defaultConfig,
    analytics: null,
    trends: null,
    isLoading,
    isProfiling,
    isAnalyzing,
    error,
    lastProfilingTime,

    // Operations
    createProfilingJob,
    updateProfilingJob,
    deleteProfilingJob,
    executeProfilingJob,
    cancelProfilingJob,
    listProfilingJobs,
    getProfilingResults,
    getLatestProfilingResult,
    getProfilingResultById,
    deleteProfilingResult,
    getStatisticalMetrics,
    getDataDistribution,
    getDataQualityProfile,
    profileColumns,
    executeCustomProfiling,
    validateProfilingRules,
    getProfilingAnalytics,
    getProfilingTrends,
    compareProfilingResults,
    getDefaultProfilingConfig,
    updateDefaultProfilingConfig,
    getProfilingTemplates,
    exportProfilingResults,
    generateProfilingReport,
    setFilters,
    clearFilters,
    setCurrentJob,
    setCurrentResult,
    refreshProfiling,
    resetState
  };
}