// ============================================================================
// USE CATALOG LINEAGE HOOK - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hook for managing data lineage operations and visualization
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  advancedLineageService,
  CreateLineageRequest,
  LineageTrackingRequest,
  LineageAnalysisRequest,
  LineageVisualizationRequest,
  LineageSearchRequest,
  BulkLineageUpdateRequest
} from '../services';
import {
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageVisualizationConfig,
  LineageMetrics,
  LineageImpactAnalysis,
  LineageQuery,
  CatalogApiResponse,
  PaginationRequest
} from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseCatalogLineageOptions {
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  maxRetries?: number;
  defaultDepth?: number;
  onLineageComplete?: (result: any) => void;
  onLineageError?: (error: Error) => void;
}

export interface LineageState {
  lineages: EnterpriseDataLineage[];
  currentLineage: EnterpriseDataLineage | null;
  visualizationData: {
    nodes: DataLineageNode[];
    edges: DataLineageEdge[];
  } | null;
  impactAnalysis: LineageImpactAnalysis | null;
  metrics: LineageMetrics | null;
  searchResults: EnterpriseDataLineage[];
  isLoading: boolean;
  isTracking: boolean;
  isAnalyzing: boolean;
  isVisualizing: boolean;
  error: string | null;
  lastTrackingTime: Date | null;
}

export interface LineageFilters {
  assetId?: string;
  direction?: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH';
  depth?: number;
  lineageType?: 'COLUMN' | 'TABLE' | 'SCHEMA' | 'DATABASE';
  includeColumns?: boolean;
  includeTransformations?: boolean;
  confidenceThreshold?: number;
}

// ============================================================================
// LINEAGE OPERATIONS
// ============================================================================

export interface LineageOperations {
  // Lineage Management
  createLineage: (request: CreateLineageRequest) => Promise<EnterpriseDataLineage>;
  updateLineage: (lineageId: string, updates: Partial<EnterpriseDataLineage>) => Promise<EnterpriseDataLineage>;
  deleteLineage: (lineageId: string) => Promise<void>;
  bulkUpdateLineage: (request: BulkLineageUpdateRequest) => Promise<EnterpriseDataLineage[]>;

  // Lineage Tracking
  trackLineage: (request: LineageTrackingRequest) => Promise<EnterpriseDataLineage[]>;
  getUpstreamLineage: (assetId: string, depth?: number, includeColumns?: boolean) => Promise<EnterpriseDataLineage[]>;
  getDownstreamLineage: (assetId: string, depth?: number, includeColumns?: boolean) => Promise<EnterpriseDataLineage[]>;
  getColumnLineage: (assetId: string, columnName: string) => Promise<EnterpriseDataLineage[]>;
  discoverLineage: (assetId: string, discoveryType: string) => Promise<EnterpriseDataLineage[]>;

  // Visualization
  generateVisualization: (request: LineageVisualizationRequest) => Promise<any>;
  getLineageGraph: (assetId: string, config: LineageVisualizationConfig) => Promise<{ nodes: DataLineageNode[]; edges: DataLineageEdge[] }>;
  updateVisualizationConfig: (assetId: string, config: LineageVisualizationConfig) => Promise<LineageVisualizationConfig>;

  // Impact Analysis
  performImpactAnalysis: (request: LineageAnalysisRequest) => Promise<LineageImpactAnalysis>;
  getChangeImpactAnalysis: (assetId: string, changeType: string) => Promise<any>;
  getDependencyAnalysis: (assetId: string) => Promise<any>;
  getCoverageAnalysis: () => Promise<any>;

  // Search & Query
  searchLineage: (request: LineageSearchRequest) => Promise<EnterpriseDataLineage[]>;
  executeLineageQuery: (query: LineageQuery) => Promise<any>;
  getLineagePath: (sourceAssetId: string, targetAssetId: string) => Promise<EnterpriseDataLineage[]>;

  // Metrics & Analytics
  getLineageMetrics: (assetId?: string) => Promise<LineageMetrics>;
  getQualityMetrics: () => Promise<any>;
  getStatistics: (timeRange?: { start: Date; end: Date }) => Promise<any>;

  // Validation
  validateConsistency: (assetId?: string) => Promise<any>;
  validateCompleteness: (assetId: string) => Promise<any>;

  // Export & Reporting
  exportLineageData: (assetId: string, format: string, includeColumns?: boolean) => Promise<Blob>;
  generateReport: (assetId: string, reportType: string) => Promise<string>;
  scheduleTracking: (assetId: string, schedule: any) => Promise<any>;

  // State Management
  setFilters: (filters: LineageFilters) => void;
  clearFilters: () => void;
  setCurrentLineage: (lineage: EnterpriseDataLineage | null) => void;
  refreshLineages: () => Promise<void>;
  resetState: () => void;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  LINEAGES: 'catalogLineage.lineages',
  LINEAGE: 'catalogLineage.lineage',
  UPSTREAM: 'catalogLineage.upstream',
  DOWNSTREAM: 'catalogLineage.downstream',
  COLUMN_LINEAGE: 'catalogLineage.columnLineage',
  VISUALIZATION: 'catalogLineage.visualization',
  IMPACT_ANALYSIS: 'catalogLineage.impactAnalysis',
  METRICS: 'catalogLineage.metrics',
  SEARCH_RESULTS: 'catalogLineage.searchResults',
} as const;

// ============================================================================
// CATALOG LINEAGE HOOK
// ============================================================================

export function useCatalogLineage(
  options: UseCatalogLineageOptions = {}
): LineageState & LineageOperations {
  const {
    enableRealTimeUpdates = false,
    autoRefreshInterval = 30000,
    maxRetries = 3,
    defaultDepth = 5,
    onLineageComplete,
    onLineageError
  } = options;

  const queryClient = useQueryClient();

  // Local State
  const [currentLineage, setCurrentLineage] = useState<EnterpriseDataLineage | null>(null);
  const [filters, setFiltersState] = useState<LineageFilters>({
    depth: defaultDepth,
    includeColumns: true,
    includeTransformations: true
  });
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  const [lastTrackingTime, setLastTrackingTime] = useState<Date | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Lineages Query
  const {
    data: lineagesResponse,
    isLoading: lineagesLoading,
    error: lineagesError,
    refetch: refetchLineages
  } = useQuery({
    queryKey: [QUERY_KEYS.LINEAGES, filters],
    queryFn: async () => {
      if (!filters.assetId) return { data: [] };
      
      return advancedLineageService.trackLineage({
        assetId: filters.assetId,
        direction: filters.direction || 'BOTH',
        depth: filters.depth || defaultDepth,
        includeColumns: filters.includeColumns || true,
        includeTransformations: filters.includeTransformations || true,
        filterTypes: filters.lineageType ? [filters.lineageType] : undefined
      });
    },
    enabled: !!filters.assetId,
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // Visualization Data Query
  const {
    data: visualizationResponse,
    isLoading: visualizationLoading,
    refetch: refetchVisualization
  } = useQuery({
    queryKey: [QUERY_KEYS.VISUALIZATION, filters.assetId],
    queryFn: async () => {
      if (!filters.assetId) return null;
      
      const config: LineageVisualizationConfig = {
        showLabels: true,
        showMetrics: true,
        colorScheme: 'default',
        layout: 'hierarchical',
        nodeSize: 'medium',
        edgeStyle: 'straight'
      };

      return advancedLineageService.getLineageGraph(filters.assetId, config);
    },
    enabled: !!filters.assetId,
    retry: maxRetries
  });

  // Metrics Query
  const {
    data: metricsResponse,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: [QUERY_KEYS.METRICS, filters.assetId],
    queryFn: () => advancedLineageService.getLineageMetrics(filters.assetId),
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create Lineage
  const createLineageMutation = useMutation({
    mutationFn: (request: CreateLineageRequest) =>
      advancedLineageService.createLineage(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINEAGES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METRICS] });
    },
    onError: (error) => {
      onLineageError?.(error as Error);
    }
  });

  // Update Lineage
  const updateLineageMutation = useMutation({
    mutationFn: ({ lineageId, updates }: { lineageId: string; updates: Partial<EnterpriseDataLineage> }) =>
      advancedLineageService.updateLineage(lineageId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINEAGES] });
    }
  });

  // Track Lineage
  const trackLineageMutation = useMutation({
    mutationFn: (request: LineageTrackingRequest) =>
      advancedLineageService.trackLineage(request),
    onMutate: () => {
      setIsTracking(true);
    },
    onSuccess: (result) => {
      setIsTracking(false);
      setLastTrackingTime(new Date());
      onLineageComplete?.(result.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINEAGES] });
    },
    onError: (error) => {
      setIsTracking(false);
      onLineageError?.(error as Error);
    }
  });

  // Impact Analysis
  const impactAnalysisMutation = useMutation({
    mutationFn: (request: LineageAnalysisRequest) =>
      advancedLineageService.performImpactAnalysis(request),
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (result) => {
      setIsAnalyzing(false);
      queryClient.setQueryData([QUERY_KEYS.IMPACT_ANALYSIS, request], result);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      onLineageError?.(error as Error);
    }
  });

  // ============================================================================
  // COMPUTED STATE
  // ============================================================================

  const lineages = useMemo(() => lineagesResponse?.data || [], [lineagesResponse]);
  const visualizationData = useMemo(() => visualizationResponse?.data || null, [visualizationResponse]);
  const metrics = useMemo(() => metricsResponse?.data || null, [metricsResponse]);
  const isLoading = lineagesLoading || visualizationLoading;
  const error = lineagesError?.message || null;

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  const createLineage = useCallback(async (request: CreateLineageRequest): Promise<EnterpriseDataLineage> => {
    const result = await createLineageMutation.mutateAsync(request);
    return result.data;
  }, [createLineageMutation]);

  const updateLineage = useCallback(async (
    lineageId: string,
    updates: Partial<EnterpriseDataLineage>
  ): Promise<EnterpriseDataLineage> => {
    const result = await updateLineageMutation.mutateAsync({ lineageId, updates });
    return result.data;
  }, [updateLineageMutation]);

  const deleteLineage = useCallback(async (lineageId: string): Promise<void> => {
    await advancedLineageService.deleteLineage(lineageId);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINEAGES] });
  }, [queryClient]);

  const bulkUpdateLineage = useCallback(async (
    request: BulkLineageUpdateRequest
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await advancedLineageService.bulkUpdateLineage(request);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINEAGES] });
    return result.data;
  }, [queryClient]);

  const trackLineage = useCallback(async (
    request: LineageTrackingRequest
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await trackLineageMutation.mutateAsync(request);
    return result.data;
  }, [trackLineageMutation]);

  const getUpstreamLineage = useCallback(async (
    assetId: string,
    depth: number = defaultDepth,
    includeColumns: boolean = true
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await advancedLineageService.getUpstreamLineage(assetId, depth, includeColumns);
    return result.data;
  }, [defaultDepth]);

  const getDownstreamLineage = useCallback(async (
    assetId: string,
    depth: number = defaultDepth,
    includeColumns: boolean = true
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await advancedLineageService.getDownstreamLineage(assetId, depth, includeColumns);
    return result.data;
  }, [defaultDepth]);

  const getColumnLineage = useCallback(async (
    assetId: string,
    columnName: string
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await advancedLineageService.getColumnLineage(assetId, columnName);
    return result.data;
  }, []);

  const discoverLineage = useCallback(async (
    assetId: string,
    discoveryType: string
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await advancedLineageService.discoverLineage(assetId, discoveryType as any);
    return result.data;
  }, []);

  const generateVisualization = useCallback(async (
    request: LineageVisualizationRequest
  ): Promise<any> => {
    setIsVisualizing(true);
    try {
      const result = await advancedLineageService.generateLineageVisualization(request);
      setIsVisualizing(false);
      return result.data;
    } catch (error) {
      setIsVisualizing(false);
      throw error;
    }
  }, []);

  const getLineageGraph = useCallback(async (
    assetId: string,
    config: LineageVisualizationConfig
  ): Promise<{ nodes: DataLineageNode[]; edges: DataLineageEdge[] }> => {
    const result = await advancedLineageService.getLineageGraph(assetId, config);
    return result.data;
  }, []);

  const updateVisualizationConfig = useCallback(async (
    assetId: string,
    config: LineageVisualizationConfig
  ): Promise<LineageVisualizationConfig> => {
    const result = await advancedLineageService.updateVisualizationConfig(assetId, config);
    return result.data;
  }, []);

  const performImpactAnalysis = useCallback(async (
    request: LineageAnalysisRequest
  ): Promise<LineageImpactAnalysis> => {
    const result = await impactAnalysisMutation.mutateAsync(request);
    return result.data;
  }, [impactAnalysisMutation]);

  const getChangeImpactAnalysis = useCallback(async (
    assetId: string,
    changeType: string
  ): Promise<any> => {
    const result = await advancedLineageService.getChangeImpactAnalysis(assetId, changeType as any);
    return result.data;
  }, []);

  const getDependencyAnalysis = useCallback(async (assetId: string): Promise<any> => {
    const result = await advancedLineageService.getDependencyAnalysis(assetId);
    return result.data;
  }, []);

  const getCoverageAnalysis = useCallback(async (): Promise<any> => {
    const result = await advancedLineageService.getLineageCoverageAnalysis();
    return result.data;
  }, []);

  const searchLineage = useCallback(async (
    request: LineageSearchRequest
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await advancedLineageService.searchLineage(request);
    return result.data;
  }, []);

  const executeLineageQuery = useCallback(async (query: LineageQuery): Promise<any> => {
    const result = await advancedLineageService.executeLineageQuery(query);
    return result.data;
  }, []);

  const getLineagePath = useCallback(async (
    sourceAssetId: string,
    targetAssetId: string
  ): Promise<EnterpriseDataLineage[]> => {
    const result = await advancedLineageService.getLineagePath(sourceAssetId, targetAssetId);
    return result.data;
  }, []);

  const getLineageMetrics = useCallback(async (assetId?: string): Promise<LineageMetrics> => {
    const result = await advancedLineageService.getLineageMetrics(assetId);
    return result.data;
  }, []);

  const getQualityMetrics = useCallback(async (): Promise<any> => {
    const result = await advancedLineageService.getLineageQualityMetrics();
    return result.data;
  }, []);

  const getStatistics = useCallback(async (
    timeRange?: { start: Date; end: Date }
  ): Promise<any> => {
    const result = await advancedLineageService.getLineageStatistics(timeRange);
    return result.data;
  }, []);

  const validateConsistency = useCallback(async (assetId?: string): Promise<any> => {
    const result = await advancedLineageService.validateLineageConsistency(assetId);
    return result.data;
  }, []);

  const validateCompleteness = useCallback(async (assetId: string): Promise<any> => {
    const result = await advancedLineageService.validateLineageCompleteness(assetId);
    return result.data;
  }, []);

  const exportLineageData = useCallback(async (
    assetId: string,
    format: string,
    includeColumns: boolean = true
  ): Promise<Blob> => {
    return advancedLineageService.exportLineageData(assetId, format as any, includeColumns);
  }, []);

  const generateReport = useCallback(async (
    assetId: string,
    reportType: string
  ): Promise<string> => {
    const result = await advancedLineageService.generateLineageReport(assetId, reportType as any);
    return result.data;
  }, []);

  const scheduleTracking = useCallback(async (
    assetId: string,
    schedule: any
  ): Promise<any> => {
    const result = await advancedLineageService.scheduleLineageTracking(assetId, schedule);
    return result.data;
  }, []);

  const setFilters = useCallback((newFilters: LineageFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      depth: defaultDepth,
      includeColumns: true,
      includeTransformations: true
    });
  }, [defaultDepth]);

  const refreshLineages = useCallback(async () => {
    await Promise.all([
      refetchLineages(),
      refetchVisualization(),
      refetchMetrics()
    ]);
  }, [refetchLineages, refetchVisualization, refetchMetrics]);

  const resetState = useCallback(() => {
    setCurrentLineage(null);
    setFiltersState({
      depth: defaultDepth,
      includeColumns: true,
      includeTransformations: true
    });
    setIsTracking(false);
    setIsAnalyzing(false);
    setIsVisualizing(false);
    setLastTrackingTime(null);
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.LINEAGES] });
  }, [queryClient, defaultDepth]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    lineages,
    currentLineage,
    visualizationData,
    impactAnalysis: null,
    metrics,
    searchResults: [],
    isLoading,
    isTracking,
    isAnalyzing,
    isVisualizing,
    error,
    lastTrackingTime,

    // Operations
    createLineage,
    updateLineage,
    deleteLineage,
    bulkUpdateLineage,
    trackLineage,
    getUpstreamLineage,
    getDownstreamLineage,
    getColumnLineage,
    discoverLineage,
    generateVisualization,
    getLineageGraph,
    updateVisualizationConfig,
    performImpactAnalysis,
    getChangeImpactAnalysis,
    getDependencyAnalysis,
    getCoverageAnalysis,
    searchLineage,
    executeLineageQuery,
    getLineagePath,
    getLineageMetrics,
    getQualityMetrics,
    getStatistics,
    validateConsistency,
    validateCompleteness,
    exportLineageData,
    generateReport,
    scheduleTracking,
    setFilters,
    clearFilters,
    setCurrentLineage,
    refreshLineages,
    resetState
  };
}