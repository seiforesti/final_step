// ============================================================================
// USE CATALOG ANALYTICS HOOK - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hook for managing catalog analytics operations and insights
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  catalogAnalyticsService,
  AnalyticsRequest,
  UsageAnalyticsRequest,
  TrendAnalysisRequest,
  PopularityAnalysisRequest,
  ImpactAnalysisRequest,
  CustomAnalyticsRequest,
  ReportGenerationRequest,
  MetricsComparisonRequest
} from '../services';
import {
  CatalogMetrics,
  AnalyticsReport,
  UsageMetrics,
  AssetUsageMetrics,
  TrendAnalysis,
  PopularityMetrics,
  ImpactAnalysis,
  PredictiveInsights,
  AnalyticsQuery,
  TimeRange,
  CatalogApiResponse
} from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseCatalogAnalyticsOptions {
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  maxRetries?: number;
  defaultTimeRange?: TimeRange;
  onAnalyticsComplete?: (result: any) => void;
  onAnalyticsError?: (error: Error) => void;
}

export interface AnalyticsState {
  overview: CatalogMetrics | null;
  usageMetrics: UsageMetrics | null;
  trendAnalysis: TrendAnalysis | null;
  popularityMetrics: PopularityMetrics | null;
  impactAnalysis: ImpactAnalysis | null;
  predictiveInsights: PredictiveInsights | null;
  customResults: any | null;
  reports: AnalyticsReport[];
  savedQueries: AnalyticsQuery[];
  isLoading: boolean;
  isAnalyzing: boolean;
  isGeneratingReport: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

export interface AnalyticsFilters {
  timeRange: TimeRange;
  assetTypes?: string[];
  departments?: string[];
  metrics?: string[];
  aggregationType?: 'SUM' | 'AVERAGE' | 'COUNT' | 'MIN' | 'MAX';
  granularity?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

export interface AnalyticsOperations {
  // Core Analytics
  refreshOverview: (timeRange?: TimeRange) => Promise<void>;
  getCatalogMetrics: (request: AnalyticsRequest) => Promise<any>;
  getAssetMetricsByType: (assetType: string, timeRange: TimeRange) => Promise<any>;

  // Usage Analytics
  getUsageAnalytics: (request: UsageAnalyticsRequest) => Promise<UsageMetrics>;
  getAssetUsageMetrics: (assetId: string, timeRange: TimeRange) => Promise<AssetUsageMetrics>;
  getUserUsageAnalytics: (userId?: string, timeRange?: TimeRange) => Promise<any>;
  getDepartmentUsageAnalytics: (department: string, timeRange: TimeRange) => Promise<any>;

  // Trend Analysis
  performTrendAnalysis: (request: TrendAnalysisRequest) => Promise<TrendAnalysis>;
  getGrowthTrends: (metric: string, timeRange: TimeRange) => Promise<any>;
  getAdoptionTrends: (timeRange: TimeRange) => Promise<any>;
  getSeasonalPatterns: (metric: string, timeRange: TimeRange) => Promise<any>;

  // Popularity Analysis
  getPopularityAnalysis: (request: PopularityAnalysisRequest) => Promise<PopularityMetrics>;
  getTopAssets: (metric: string, timeRange: TimeRange, limit?: number) => Promise<any>;
  getTrendingAssets: (timeRange: TimeRange, limit?: number) => Promise<any>;
  getUnderutilizedAssets: (threshold?: number, timeRange?: TimeRange) => Promise<any>;

  // Impact Analysis
  performImpactAnalysis: (request: ImpactAnalysisRequest) => Promise<ImpactAnalysis>;
  getBusinessImpactMetrics: (assetId: string, timeRange: TimeRange) => Promise<any>;
  getRiskAnalysis: (assetId?: string, riskType?: string) => Promise<any>;

  // Predictive Analytics
  getPredictiveInsights: (metric: string, timeRange: TimeRange, predictionHorizon: number) => Promise<PredictiveInsights>;
  getCapacityForecasting: (resource: string, timeRange: TimeRange) => Promise<any>;
  getAnomalyDetection: (metric: string, timeRange: TimeRange) => Promise<any>;

  // Custom Analytics
  executeCustomAnalytics: (request: CustomAnalyticsRequest) => Promise<any>;
  saveAnalyticsQuery: (query: AnalyticsQuery) => Promise<void>;
  loadSavedQuery: (queryId: string) => Promise<any>;

  // Reporting
  generateReport: (request: ReportGenerationRequest) => Promise<AnalyticsReport>;
  scheduleReport: (reportConfig: ReportGenerationRequest, schedule: any) => Promise<void>;
  exportAnalyticsData: (query: AnalyticsQuery, format: string) => Promise<Blob>;

  // Real-time Analytics
  getRealTimeMetrics: (metrics: string[]) => Promise<any>;
  subscribeToMetricUpdates: (metrics: string[], callback: (data: any) => void) => Promise<void>;

  // Comparison & Benchmarking
  compareMetrics: (request: MetricsComparisonRequest) => Promise<any>;
  getBenchmarkComparison: (metric: string, benchmarkType: string) => Promise<any>;

  // State Management
  setFilters: (filters: AnalyticsFilters) => void;
  clearFilters: () => void;
  setTimeRange: (timeRange: TimeRange) => void;
  refreshAll: () => Promise<void>;
  resetState: () => void;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  ANALYTICS_OVERVIEW: 'catalogAnalytics.overview',
  CATALOG_METRICS: 'catalogAnalytics.metrics',
  USAGE_ANALYTICS: 'catalogAnalytics.usage',
  TREND_ANALYSIS: 'catalogAnalytics.trends',
  POPULARITY_METRICS: 'catalogAnalytics.popularity',
  IMPACT_ANALYSIS: 'catalogAnalytics.impact',
  PREDICTIVE_INSIGHTS: 'catalogAnalytics.predictive',
  ANALYTICS_REPORTS: 'catalogAnalytics.reports',
  SAVED_QUERIES: 'catalogAnalytics.savedQueries',
  REAL_TIME_METRICS: 'catalogAnalytics.realTime',
} as const;

// ============================================================================
// CATALOG ANALYTICS HOOK
// ============================================================================

export function useCatalogAnalytics(
  options: UseCatalogAnalyticsOptions = {}
): AnalyticsState & AnalyticsOperations {
  const {
    enableRealTimeUpdates = false,
    autoRefreshInterval = 60000, // 1 minute
    maxRetries = 3,
    defaultTimeRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    },
    onAnalyticsComplete,
    onAnalyticsError
  } = options;

  const queryClient = useQueryClient();

  // Local State
  const [filters, setFiltersState] = useState<AnalyticsFilters>({
    timeRange: defaultTimeRange
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Overview Query
  const {
    data: overviewResponse,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview
  } = useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS_OVERVIEW, filters.timeRange],
    queryFn: () => catalogAnalyticsService.getCatalogOverview(filters.timeRange),
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // Usage Analytics Query
  const {
    data: usageResponse,
    isLoading: usageLoading,
    refetch: refetchUsage
  } = useQuery({
    queryKey: [QUERY_KEYS.USAGE_ANALYTICS, filters],
    queryFn: () => catalogAnalyticsService.getUsageAnalytics({
      timeRange: filters.timeRange,
      includeDetails: true,
      includeUsers: true,
      includeSources: true
    }),
    enabled: !!filters.timeRange,
    retry: maxRetries
  });

  // Saved Queries
  const {
    data: savedQueriesResponse,
    refetch: refetchSavedQueries
  } = useQuery({
    queryKey: [QUERY_KEYS.SAVED_QUERIES],
    queryFn: () => catalogAnalyticsService.getSavedQueries(),
    retry: maxRetries
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Generate Report Mutation
  const generateReportMutation = useMutation({
    mutationFn: (request: ReportGenerationRequest) =>
      catalogAnalyticsService.generateReport(request),
    onMutate: () => {
      setIsGeneratingReport(true);
    },
    onSuccess: (result) => {
      setIsGeneratingReport(false);
      onAnalyticsComplete?.(result.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ANALYTICS_REPORTS] });
    },
    onError: (error) => {
      setIsGeneratingReport(false);
      onAnalyticsError?.(error as Error);
    }
  });

  // Custom Analytics Mutation
  const customAnalyticsMutation = useMutation({
    mutationFn: (request: CustomAnalyticsRequest) =>
      catalogAnalyticsService.executeCustomAnalytics(request),
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (result) => {
      setIsAnalyzing(false);
      onAnalyticsComplete?.(result.data);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      onAnalyticsError?.(error as Error);
    }
  });

  // Trend Analysis Mutation
  const trendAnalysisMutation = useMutation({
    mutationFn: (request: TrendAnalysisRequest) =>
      catalogAnalyticsService.getTrendAnalysis(request),
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (result) => {
      setIsAnalyzing(false);
      queryClient.setQueryData([QUERY_KEYS.TREND_ANALYSIS, request], result);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      onAnalyticsError?.(error as Error);
    }
  });

  // ============================================================================
  // COMPUTED STATE
  // ============================================================================

  const overview = useMemo(() => overviewResponse?.data || null, [overviewResponse]);
  const usageMetrics = useMemo(() => usageResponse?.data || null, [usageResponse]);
  const savedQueries = useMemo(() => savedQueriesResponse?.data || [], [savedQueriesResponse]);
  const isLoading = overviewLoading || usageLoading;
  const error = overviewError?.message || null;

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  const refreshOverview = useCallback(async (timeRange?: TimeRange) => {
    if (timeRange) {
      setFiltersState(prev => ({ ...prev, timeRange }));
    }
    await refetchOverview();
    setLastRefresh(new Date());
  }, [refetchOverview]);

  const getCatalogMetrics = useCallback(async (request: AnalyticsRequest): Promise<any> => {
    const result = await catalogAnalyticsService.getCatalogMetrics(request);
    return result.data;
  }, []);

  const getAssetMetricsByType = useCallback(async (
    assetType: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getAssetMetricsByType(assetType, timeRange);
    return result.data;
  }, []);

  const getUsageAnalytics = useCallback(async (
    request: UsageAnalyticsRequest
  ): Promise<UsageMetrics> => {
    const result = await catalogAnalyticsService.getUsageAnalytics(request);
    return result.data;
  }, []);

  const getAssetUsageMetrics = useCallback(async (
    assetId: string,
    timeRange: TimeRange
  ): Promise<AssetUsageMetrics> => {
    const result = await catalogAnalyticsService.getAssetUsageMetrics(assetId, timeRange);
    return result.data;
  }, []);

  const getUserUsageAnalytics = useCallback(async (
    userId?: string,
    timeRange?: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getUserUsageAnalytics(userId, timeRange);
    return result.data;
  }, []);

  const getDepartmentUsageAnalytics = useCallback(async (
    department: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getDepartmentUsageAnalytics(department, timeRange);
    return result.data;
  }, []);

  const performTrendAnalysis = useCallback(async (
    request: TrendAnalysisRequest
  ): Promise<TrendAnalysis> => {
    const result = await trendAnalysisMutation.mutateAsync(request);
    return result.data;
  }, [trendAnalysisMutation]);

  const getGrowthTrends = useCallback(async (
    metric: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getGrowthTrends(metric as any, timeRange);
    return result.data;
  }, []);

  const getAdoptionTrends = useCallback(async (timeRange: TimeRange): Promise<any> => {
    const result = await catalogAnalyticsService.getAdoptionTrends(timeRange);
    return result.data;
  }, []);

  const getSeasonalPatterns = useCallback(async (
    metric: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getSeasonalPatterns(metric, timeRange);
    return result.data;
  }, []);

  const getPopularityAnalysis = useCallback(async (
    request: PopularityAnalysisRequest
  ): Promise<PopularityMetrics> => {
    const result = await catalogAnalyticsService.getPopularityAnalysis(request);
    return result.data;
  }, []);

  const getTopAssets = useCallback(async (
    metric: string,
    timeRange: TimeRange,
    limit: number = 10
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getTopAssets(metric as any, timeRange, limit);
    return result.data;
  }, []);

  const getTrendingAssets = useCallback(async (
    timeRange: TimeRange,
    limit: number = 10
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getTrendingAssets(timeRange, limit);
    return result.data;
  }, []);

  const getUnderutilizedAssets = useCallback(async (
    threshold?: number,
    timeRange?: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getUnderutilizedAssets(threshold, timeRange);
    return result.data;
  }, []);

  const performImpactAnalysis = useCallback(async (
    request: ImpactAnalysisRequest
  ): Promise<ImpactAnalysis> => {
    const result = await catalogAnalyticsService.performImpactAnalysis(request);
    return result.data;
  }, []);

  const getBusinessImpactMetrics = useCallback(async (
    assetId: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getBusinessImpactMetrics(assetId, timeRange);
    return result.data;
  }, []);

  const getRiskAnalysis = useCallback(async (
    assetId?: string,
    riskType?: string
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getRiskAnalysis(assetId, riskType as any);
    return result.data;
  }, []);

  const getPredictiveInsights = useCallback(async (
    metric: string,
    timeRange: TimeRange,
    predictionHorizon: number
  ): Promise<PredictiveInsights> => {
    const result = await catalogAnalyticsService.getPredictiveInsights(metric, timeRange, predictionHorizon);
    return result.data;
  }, []);

  const getCapacityForecasting = useCallback(async (
    resource: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getCapacityForecasting(resource as any, timeRange);
    return result.data;
  }, []);

  const getAnomalyDetection = useCallback(async (
    metric: string,
    timeRange: TimeRange
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getAnomalyDetection(metric, timeRange);
    return result.data;
  }, []);

  const executeCustomAnalytics = useCallback(async (
    request: CustomAnalyticsRequest
  ): Promise<any> => {
    const result = await customAnalyticsMutation.mutateAsync(request);
    return result.data;
  }, [customAnalyticsMutation]);

  const generateReport = useCallback(async (
    request: ReportGenerationRequest
  ): Promise<AnalyticsReport> => {
    const result = await generateReportMutation.mutateAsync(request);
    return result.data;
  }, [generateReportMutation]);

  const scheduleReport = useCallback(async (
    reportConfig: ReportGenerationRequest,
    schedule: any
  ): Promise<void> => {
    await catalogAnalyticsService.scheduleReport(reportConfig, schedule);
  }, []);

  const exportAnalyticsData = useCallback(async (
    query: AnalyticsQuery,
    format: string
  ): Promise<Blob> => {
    return catalogAnalyticsService.exportAnalyticsData(query, format as any);
  }, []);

  const getRealTimeMetrics = useCallback(async (metrics: string[]): Promise<any> => {
    const result = await catalogAnalyticsService.getRealTimeMetrics(metrics);
    return result.data;
  }, []);

  const subscribeToMetricUpdates = useCallback(async (
    metrics: string[],
    callback: (data: any) => void
  ): Promise<void> => {
    await catalogAnalyticsService.subscribeToMetricUpdates(metrics, callback);
  }, []);

  const compareMetrics = useCallback(async (
    request: MetricsComparisonRequest
  ): Promise<any> => {
    const result = await catalogAnalyticsService.compareMetrics(request);
    return result.data;
  }, []);

  const getBenchmarkComparison = useCallback(async (
    metric: string,
    benchmarkType: string
  ): Promise<any> => {
    const result = await catalogAnalyticsService.getBenchmarkComparison(metric, benchmarkType as any);
    return result.data;
  }, []);

  const setFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ timeRange: defaultTimeRange });
  }, [defaultTimeRange]);

  const setTimeRange = useCallback((timeRange: TimeRange) => {
    setFiltersState(prev => ({ ...prev, timeRange }));
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetchOverview(),
      refetchUsage(),
      refetchSavedQueries()
    ]);
    setLastRefresh(new Date());
  }, [refetchOverview, refetchUsage, refetchSavedQueries]);

  const resetState = useCallback(() => {
    setFiltersState({ timeRange: defaultTimeRange });
    setIsAnalyzing(false);
    setIsGeneratingReport(false);
    setLastRefresh(null);
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.ANALYTICS_OVERVIEW] });
  }, [queryClient, defaultTimeRange]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    overview,
    usageMetrics,
    trendAnalysis: null,
    popularityMetrics: null,
    impactAnalysis: null,
    predictiveInsights: null,
    customResults: null,
    reports: [],
    savedQueries,
    isLoading,
    isAnalyzing,
    isGeneratingReport,
    error,
    lastRefresh,

    // Operations
    refreshOverview,
    getCatalogMetrics,
    getAssetMetricsByType,
    getUsageAnalytics,
    getAssetUsageMetrics,
    getUserUsageAnalytics,
    getDepartmentUsageAnalytics,
    performTrendAnalysis,
    getGrowthTrends,
    getAdoptionTrends,
    getSeasonalPatterns,
    getPopularityAnalysis,
    getTopAssets,
    getTrendingAssets,
    getUnderutilizedAssets,
    performImpactAnalysis,
    getBusinessImpactMetrics,
    getRiskAnalysis,
    getPredictiveInsights,
    getCapacityForecasting,
    getAnomalyDetection,
    executeCustomAnalytics,
    saveAnalyticsQuery: async () => {}, // TODO: Implement
    loadSavedQuery: async () => ({}), // TODO: Implement
    generateReport,
    scheduleReport,
    exportAnalyticsData,
    getRealTimeMetrics,
    subscribeToMetricUpdates,
    compareMetrics,
    getBenchmarkComparison,
    setFilters,
    clearFilters,
    setTimeRange,
    refreshAll,
    resetState
  };
}