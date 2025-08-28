import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  fetchDashboardSummary, 
  fetchDataSourceStats, 
  fetchScanSummaryStats,
  fetchMetadataStats,
  fetchComplianceStats,
  fetchTimeSeriesData
} from '../api/dashboard';
import { DashboardSummary } from '../models/DashboardSummary';
import { DataSourceStats } from '../models/DataSourceStats';
import { ScanSummaryStats } from '../models/ScanSummaryStats';
import { MetadataStats } from '../models/MetadataStats';
import { ComplianceStats } from '../models/ComplianceStats';
import { TimeSeriesData } from '../models/TimeSeriesData';
import { useRBACPermissions } from './useRBACPermissions';

interface UseOptimizedDashboardAnalyticsOptions {
  refreshInterval?: number;
  initialTimeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  dataSourceId?: string;
  enableRealTimeUpdates?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// Debounce utility for filter changes
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Batch query executor to reduce API calls
class QueryBatcher {
  private batch: Array<() => Promise<any>> = [];
  private timeoutId: NodeJS.Timeout | null = null;
  
  add(queryFn: () => Promise<any>) {
    this.batch.push(queryFn);
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.executeBatch();
    }, 50); // Batch queries within 50ms
  }
  
  private async executeBatch() {
    if (this.batch.length === 0) return;
    
    const queries = [...this.batch];
    this.batch = [];
    this.timeoutId = null;
    
    try {
      await Promise.allSettled(queries.map(query => query()));
    } catch (error) {
      console.warn('Batch query execution failed:', error);
    }
  }
}

/**
 * Optimized hook for dashboard analytics with performance improvements:
 * - Reduced API calls through intelligent caching
 * - Debounced filter changes
 * - Batched query execution
 * - Selective data fetching based on permissions
 * - Memory leak prevention
 */
export function useOptimizedDashboardAnalytics(options: UseOptimizedDashboardAnalyticsOptions = {}) {
  const { 
    refreshInterval = 0, 
    initialTimeRange = 'month',
    dataSourceId,
    enableRealTimeUpdates = false,
    staleTime = 10 * 60 * 1000, // 10 minutes default
    cacheTime = 30 * 60 * 1000  // 30 minutes default
  } = options;
  
  const queryClient = useQueryClient();
  const { hasPermission } = useRBACPermissions();
  const queryBatcher = useRef(new QueryBatcher());
  
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>(initialTimeRange);
  const [currentDataSourceId, setCurrentDataSourceId] = useState<string | undefined>(dataSourceId);
  
  // Debounce filter changes to reduce API calls
  const debouncedTimeRange = useDebounce(timeRange, 300);
  const debouncedDataSourceId = useDebounce(currentDataSourceId, 300);

  // Check permissions once and memoize
  const permissions = useMemo(() => ({
    canViewDashboard: hasPermission('dashboard.view'),
    canViewDetailedStats: hasPermission('dashboard.view.detailed'),
  }), [hasPermission]);

  // Optimized query configuration
  const queryConfig = useMemo(() => ({
    staleTime,
    cacheTime,
    refetchInterval: enableRealTimeUpdates && refreshInterval > 0 ? refreshInterval : undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }), [staleTime, cacheTime, enableRealTimeUpdates, refreshInterval]);

  // Fetch dashboard summary (always needed)
  const {
    data: dashboardSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['dashboardSummary', debouncedTimeRange, debouncedDataSourceId],
    queryFn: () => fetchDashboardSummary({
      timeRange: debouncedTimeRange,
      dataSourceId: debouncedDataSourceId
    }),
    enabled: permissions.canViewDashboard,
    ...queryConfig
  });

  // Fetch data source statistics (conditional)
  const {
    data: dataSourceStats,
    isLoading: isDataSourceStatsLoading,
    refetch: refetchDataSourceStats
  } = useQuery({
    queryKey: ['dataSourceStats', debouncedTimeRange, debouncedDataSourceId],
    queryFn: () => fetchDataSourceStats({
      timeRange: debouncedTimeRange,
      dataSourceId: debouncedDataSourceId
    }),
    enabled: permissions.canViewDashboard && Boolean(dashboardSummary), // Only after summary loads
    ...queryConfig
  });

  // Fetch scan summary statistics (conditional on detailed permissions)
  const {
    data: scanSummaryStats,
    isLoading: isScanStatsLoading,
    refetch: refetchScanStats
  } = useQuery({
    queryKey: ['scanSummaryStats', debouncedTimeRange, debouncedDataSourceId],
    queryFn: () => fetchScanSummaryStats({
      timeRange: debouncedTimeRange,
      dataSourceId: debouncedDataSourceId
    }),
    enabled: permissions.canViewDetailedStats && Boolean(dataSourceStats),
    ...queryConfig
  });

  // Fetch metadata statistics (conditional on detailed permissions)
  const {
    data: metadataStats,
    isLoading: isMetadataStatsLoading,
    refetch: refetchMetadataStats
  } = useQuery({
    queryKey: ['metadataStats', debouncedTimeRange, debouncedDataSourceId],
    queryFn: () => fetchMetadataStats({
      timeRange: debouncedTimeRange,
      dataSourceId: debouncedDataSourceId
    }),
    enabled: permissions.canViewDetailedStats && Boolean(dataSourceStats),
    ...queryConfig
  });

  // Fetch compliance statistics (conditional on detailed permissions)
  const {
    data: complianceStats,
    isLoading: isComplianceStatsLoading,
    refetch: refetchComplianceStats
  } = useQuery({
    queryKey: ['complianceStats', debouncedTimeRange, debouncedDataSourceId],
    queryFn: () => fetchComplianceStats({
      timeRange: debouncedTimeRange,
      dataSourceId: debouncedDataSourceId
    }),
    enabled: permissions.canViewDetailedStats && Boolean(dataSourceStats),
    ...queryConfig
  });

  // Fetch time series data (lowest priority)
  const {
    data: timeSeriesData,
    isLoading: isTimeSeriesLoading,
    refetch: refetchTimeSeriesData
  } = useQuery({
    queryKey: ['timeSeriesData', debouncedTimeRange, debouncedDataSourceId],
    queryFn: () => fetchTimeSeriesData({
      timeRange: debouncedTimeRange,
      dataSourceId: debouncedDataSourceId,
      metrics: ['scans', 'issues', 'sensitivity', 'compliance']
    }),
    enabled: permissions.canViewDetailedStats && Boolean(metadataStats) && Boolean(complianceStats),
    ...queryConfig
  });

  /**
   * Optimized filter update functions with debouncing
   */
  const updateTimeRange = useCallback((range: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  }, []);

  const updateDataSourceFilter = useCallback((dataSourceId?: string) => {
    setCurrentDataSourceId(dataSourceId);
  }, []);

  /**
   * Batched refresh function
   */
  const refreshAllDashboardData = useCallback(() => {
    const refreshFunctions = [
      refetchSummary,
      permissions.canViewDashboard ? refetchDataSourceStats : null,
      permissions.canViewDetailedStats ? refetchScanStats : null,
      permissions.canViewDetailedStats ? refetchMetadataStats : null,
      permissions.canViewDetailedStats ? refetchComplianceStats : null,
      permissions.canViewDetailedStats ? refetchTimeSeriesData : null,
    ].filter(Boolean) as Array<() => Promise<any>>;

    refreshFunctions.forEach(refetchFn => {
      queryBatcher.current.add(refetchFn);
    });
  }, [
    refetchSummary,
    refetchDataSourceStats,
    refetchScanStats,
    refetchMetadataStats,
    refetchComplianceStats,
    refetchTimeSeriesData,
    permissions
  ]);

  /**
   * Memoized computed values to prevent unnecessary recalculations
   */
  const aggregatedStats = useMemo(() => {
    if (!dataSourceStats || dataSourceStats.length === 0) return null;
    
    return {
      totalDataSources: dataSourceStats.length,
      totalTables: dataSourceStats.reduce((sum, ds) => sum + (ds.tableCount || 0), 0),
      totalColumns: dataSourceStats.reduce((sum, ds) => sum + (ds.columnCount || 0), 0),
      totalScans: dataSourceStats.reduce((sum, ds) => sum + (ds.scanCount || 0), 0),
      totalIssues: dataSourceStats.reduce((sum, ds) => sum + (ds.issueCount || 0), 0),
    };
  }, [dataSourceStats]);

  const complianceScore = useMemo(() => {
    if (!complianceStats) return null;
    
    const totalRules = complianceStats.totalRules || 0;
    const passedRules = complianceStats.passedRules || 0;
    
    return {
      score: totalRules > 0 ? (passedRules / totalRules) * 100 : 0,
      passedRules,
      totalRules,
      failedRules: totalRules - passedRules
    };
  }, [complianceStats]);

  // Overall loading state
  const isLoading = useMemo(() => {
    return isSummaryLoading || 
           (permissions.canViewDashboard && isDataSourceStatsLoading) ||
           (permissions.canViewDetailedStats && (isScanStatsLoading || isMetadataStatsLoading || isComplianceStatsLoading));
  }, [
    isSummaryLoading,
    isDataSourceStatsLoading,
    isScanStatsLoading,
    isMetadataStatsLoading,
    isComplianceStatsLoading,
    permissions
  ]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cancel any pending batched queries
      if (queryBatcher.current) {
        queryBatcher.current = new QueryBatcher();
      }
    };
  }, []);

  // Memoize the entire return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Dashboard summary
    dashboardSummary,
    isSummaryLoading,
    isSummaryError,
    summaryError,
    
    // Detailed statistics
    dataSourceStats,
    isDataSourceStatsLoading,
    scanSummaryStats,
    isScanStatsLoading,
    metadataStats,
    isMetadataStatsLoading,
    complianceStats,
    isComplianceStatsLoading,
    timeSeriesData,
    isTimeSeriesLoading,
    
    // Configuration
    timeRange: debouncedTimeRange,
    currentDataSourceId: debouncedDataSourceId,
    refreshInterval,
    
    // Operations
    updateTimeRange,
    updateDataSourceFilter,
    refreshAllDashboardData,
    
    // Computed values
    aggregatedStats,
    complianceScore,
    
    // Loading state
    isLoading,
    
    // Permissions
    ...permissions
  }), [
    dashboardSummary,
    isSummaryLoading,
    isSummaryError,
    summaryError,
    dataSourceStats,
    isDataSourceStatsLoading,
    scanSummaryStats,
    isScanStatsLoading,
    metadataStats,
    isMetadataStatsLoading,
    complianceStats,
    isComplianceStatsLoading,
    timeSeriesData,
    isTimeSeriesLoading,
    debouncedTimeRange,
    debouncedDataSourceId,
    refreshInterval,
    updateTimeRange,
    updateDataSourceFilter,
    refreshAllDashboardData,
    aggregatedStats,
    complianceScore,
    isLoading,
    permissions
  ]);
}