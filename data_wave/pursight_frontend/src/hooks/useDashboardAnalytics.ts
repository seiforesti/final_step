import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
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

interface UseDashboardAnalyticsOptions {
  refreshInterval?: number;
  initialTimeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  dataSourceId?: string;
}

/**
 * Advanced hook for dashboard analytics and data visualization
 * with comprehensive filtering and time-series capabilities.
 * 
 * Features:
 * - Fetches dashboard summary and detailed statistics
 * - Provides time-series data for trend analysis
 * - Supports filtering by data source and time range
 * - Offers real-time data refresh
 * - Integrates with RBAC permissions
 */
export function useDashboardAnalytics(options: UseDashboardAnalyticsOptions = {}) {
  const { 
    refreshInterval = 0, 
    initialTimeRange = 'month',
    dataSourceId
  } = options;
  
  const queryClient = useQueryClient();
  const { hasPermission } = useRBACPermissions();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>(initialTimeRange);
  const [currentDataSourceId, setCurrentDataSourceId] = useState<string | undefined>(dataSourceId);

  // Check permissions
  const canViewDashboard = hasPermission('dashboard.view');
  const canViewDetailedStats = hasPermission('dashboard.view.detailed');

  // Fetch dashboard summary
  const {
    data: dashboardSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['dashboardSummary', timeRange, currentDataSourceId],
    queryFn: () => fetchDashboardSummary({
      timeRange,
      dataSourceId: currentDataSourceId
    }),
    enabled: canViewDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch data source statistics
  const {
    data: dataSourceStats,
    isLoading: isDataSourceStatsLoading,
    refetch: refetchDataSourceStats
  } = useQuery({
    queryKey: ['dataSourceStats', timeRange, currentDataSourceId],
    queryFn: () => fetchDataSourceStats({
      timeRange,
      dataSourceId: currentDataSourceId
    }),
    enabled: canViewDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch scan summary statistics
  const {
    data: scanSummaryStats,
    isLoading: isScanStatsLoading,
    refetch: refetchScanStats
  } = useQuery({
    queryKey: ['scanSummaryStats', timeRange, currentDataSourceId],
    queryFn: () => fetchScanSummaryStats({
      timeRange,
      dataSourceId: currentDataSourceId
    }),
    enabled: canViewDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch metadata statistics
  const {
    data: metadataStats,
    isLoading: isMetadataStatsLoading,
    refetch: refetchMetadataStats
  } = useQuery({
    queryKey: ['metadataStats', timeRange, currentDataSourceId],
    queryFn: () => fetchMetadataStats({
      timeRange,
      dataSourceId: currentDataSourceId
    }),
    enabled: canViewDetailedStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch compliance statistics
  const {
    data: complianceStats,
    isLoading: isComplianceStatsLoading,
    refetch: refetchComplianceStats
  } = useQuery({
    queryKey: ['complianceStats', timeRange, currentDataSourceId],
    queryFn: () => fetchComplianceStats({
      timeRange,
      dataSourceId: currentDataSourceId
    }),
    enabled: canViewDetailedStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch time series data
  const {
    data: timeSeriesData,
    isLoading: isTimeSeriesLoading,
    refetch: refetchTimeSeriesData
  } = useQuery({
    queryKey: ['timeSeriesData', timeRange, currentDataSourceId],
    queryFn: () => fetchTimeSeriesData({
      timeRange,
      dataSourceId: currentDataSourceId,
      metrics: ['scans', 'issues', 'sensitivity', 'compliance']
    }),
    enabled: canViewDetailedStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  /**
   * Set the time range for dashboard data
   * @param range The time range
   */
  const updateTimeRange = useCallback((range: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  }, []);

  /**
   * Set the data source filter
   * @param dataSourceId The ID of the data source
   */
  const updateDataSourceFilter = useCallback((dataSourceId?: string) => {
    setCurrentDataSourceId(dataSourceId);
  }, []);

  /**
   * Refresh all dashboard data
   */
  const refreshAllDashboardData = useCallback(() => {
    refetchSummary();
    refetchDataSourceStats();
    refetchScanStats();
    refetchMetadataStats();
    refetchComplianceStats();
    refetchTimeSeriesData();
  }, [
    refetchSummary,
    refetchDataSourceStats,
    refetchScanStats,
    refetchMetadataStats,
    refetchComplianceStats,
    refetchTimeSeriesData
  ]);

  /**
   * Get aggregated statistics across all data sources
   */
  const getAggregatedStats = useCallback(() => {
    if (!dataSourceStats) return null;
    
    // Calculate aggregated statistics
    const totalDataSources = dataSourceStats.length;
    const totalTables = dataSourceStats.reduce((sum, ds) => sum + ds.tableCount, 0);
    const totalColumns = dataSourceStats.reduce((sum, ds) => sum + ds.columnCount, 0);
    const totalScans = dataSourceStats.reduce((sum, ds) => sum + ds.scanCount, 0);
    const totalIssues = dataSourceStats.reduce((sum, ds) => sum + ds.issueCount, 0);
    
    return {
      totalDataSources,
      totalTables,
      totalColumns,
      totalScans,
      totalIssues,
      averageIssuesPerScan: totalScans > 0 ? totalIssues / totalScans : 0,
      averageTablesPerDataSource: totalDataSources > 0 ? totalTables / totalDataSources : 0,
      averageColumnsPerTable: totalTables > 0 ? totalColumns / totalTables : 0
    };
  }, [dataSourceStats]);

  /**
   * Get compliance score
   */
  const getComplianceScore = useCallback(() => {
    if (!complianceStats) return null;
    
    const totalRules = complianceStats.totalRules;
    const passedRules = complianceStats.passedRules;
    
    return {
      score: totalRules > 0 ? (passedRules / totalRules) * 100 : 0,
      passedRules,
      totalRules,
      failedRules: totalRules - passedRules
    };
  }, [complianceStats]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
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
      timeRange,
      currentDataSourceId,
      refreshInterval,
      
      // Operations
      updateTimeRange,
      updateDataSourceFilter,
      refreshAllDashboardData,
      
      // Computed values
      aggregatedStats: getAggregatedStats(),
      complianceScore: getComplianceScore(),
      
      // Loading state
      isLoading: isSummaryLoading || isDataSourceStatsLoading || isScanStatsLoading || 
                isMetadataStatsLoading || isComplianceStatsLoading || isTimeSeriesLoading,
      
      // Permissions
      canViewDashboard,
      canViewDetailedStats
    }),
    [
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
      timeRange,
      currentDataSourceId,
      refreshInterval,
      updateTimeRange,
      updateDataSourceFilter,
      refreshAllDashboardData,
      getAggregatedStats,
      getComplianceScore,
      canViewDashboard,
      canViewDetailedStats
    ]
  );
}