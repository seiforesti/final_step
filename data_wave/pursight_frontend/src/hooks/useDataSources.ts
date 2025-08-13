import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { DataSourceStats, SingleDataSourceStats, DataSourceConnectionTest, DataSourceHealthCheck } from '../models/DataSourceStats';
import { useRBACPermissions } from './useRBACPermissions';
import {
  DataSourceFilters,
  DataSourceCreateParams,
  DataSourceUpdateParams,
  useDataSourcesQuery,
  useDataSourceStatsQuery,
  useDataSourceQuery,
  useDataSourceHealthCheckQuery,
  useCreateDataSourceMutation,
  useUpdateDataSourceMutation,
  useDeleteDataSourceMutation,
  useTestDataSourceConnectionMutation,
  // NEW: Import additional hooks
  useDataSourcePerformanceMetricsQuery,
  useDataSourceSecurityAuditQuery,
  useDataSourceComplianceStatusQuery,
  useDataSourceBackupStatusQuery,
  useDataSourceScheduledTasksQuery,
  useDataSourceAccessControlQuery,
  useNotificationsQuery,
  useDataSourceReportsQuery,
  useDataSourceVersionHistoryQuery,
  useDataSourceTagsQuery,
  // NEW: Additional hooks for integrations and catalog
  useDataSourceIntegrationsQuery,
  useDataSourceCatalogQuery
} from '../api/dataSources';

// Types are imported from dataSources.ts

interface UseDataSourcesOptions {
  refreshInterval?: number;
  initialFilters?: DataSourceFilters;
}

/**
 * Advanced hook for managing data sources with comprehensive filtering
 * and connection testing capabilities.
 * 
 * Features:
 * - Fetches all data sources with filtering options
 * - Provides detailed statistics for individual data sources
 * - Supports connection testing and health checks
 * - Offers CRUD operations for data sources
 * - Integrates with RBAC permissions
 */
export function useDataSources(options: UseDataSourcesOptions = {}) {
  const { refreshInterval = 0, initialFilters = {} } = options;
  
  // No need for queryClient as it's handled in the API file
  const { hasPermission } = useRBACPermissions();
  const [filters, setFilters] = useState<DataSourceFilters>(initialFilters);

  // Check permissions
  const canViewDataSources = hasPermission('datasource.view');
  const canCreateDataSource = hasPermission('datasource.create');
  const canEditDataSource = hasPermission('datasource.edit');
  const canDeleteDataSource = hasPermission('datasource.delete');

  // Fetch all data sources
  const {
    data: dataSources,
    isLoading: isDataSourcesLoading,
    isError: isDataSourcesError,
    error: dataSourcesError,
    refetch: refetchDataSources
  } = useDataSourcesQuery(filters, {
    enabled: canViewDataSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch data source statistics
  const {
    data: dataSourceStats,
    isLoading: isDataSourceStatsLoading,
    refetch: refetchDataSourceStats
  } = useDataSourceStatsQuery(filters, {
    enabled: canViewDataSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch single data source details
  const fetchDataSourceDetails = useCallback((dataSourceId: number) => {
    return useDataSourceQuery(dataSourceId, {
      enabled: canViewDataSources && !!dataSourceId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [canViewDataSources]);

  // Fetch single data source statistics
  const fetchDataSourceDetailStats = useCallback((dataSourceId: number) => {
    return useDataSourceStatsQuery(dataSourceId, {
      enabled: canViewDataSources && !!dataSourceId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [canViewDataSources]);

  // Create data source mutation
  const createDataSourceMutation = useCreateDataSourceMutation();

  // Update data source mutation
  const updateDataSourceMutation = useUpdateDataSourceMutation();

  // Delete data source mutation
  const deleteDataSourceMutation = useDeleteDataSourceMutation();

  // Test data source connection mutation
  const testConnectionMutation = useTestDataSourceConnectionMutation();

  // Fetch data source health check
  const fetchDataSourceHealth = useCallback((dataSourceId: number) => {
    return useDataSourceHealthCheckQuery(dataSourceId, {
      enabled: canViewDataSources && !!dataSourceId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [canViewDataSources]);

  /**
   * Update filters for data sources
   * @param newFilters The new filters to apply
   */
  const updateFilters = useCallback((newFilters: Partial<DataSourceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Refresh all data source related data
   */
  const refreshAllDataSourceData = useCallback(() => {
    refetchDataSources();
    refetchDataSourceStats();
  }, [refetchDataSources, refetchDataSourceStats]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Data
      dataSources,
      dataSourceStats,
      
      // Loading states
      isDataSourcesLoading,
      isDataSourceStatsLoading,
      isLoading: isDataSourcesLoading || isDataSourceStatsLoading,
      
      // Error states
      isDataSourcesError,
      dataSourcesError,
      
      // Filters
      filters,
      updateFilters,
      clearFilters,
      
      // Fetch functions
      fetchDataSourceDetails,
      fetchDataSourceDetailStats,
      fetchDataSourceHealth,
      refreshAllDataSourceData,
      
      // Mutations
      createDataSource: createDataSourceMutation.mutateAsync,
      updateDataSource: updateDataSourceMutation.mutateAsync,
      deleteDataSource: deleteDataSourceMutation.mutateAsync,
      testConnection: testConnectionMutation.mutateAsync,
      
      // Mutation states
      isCreatingDataSource: createDataSourceMutation.isPending,
      isUpdatingDataSource: updateDataSourceMutation.isPending,
      isDeletingDataSource: deleteDataSourceMutation.isPending,
      isTestingConnection: testConnectionMutation.isPending,
      
      // Permissions
      canViewDataSources,
      canCreateDataSource,
      canEditDataSource,
      canDeleteDataSource,
      
      // NEW: Additional hooks for enhanced functionality
      usePerformanceMetrics: useDataSourcePerformanceMetricsQuery,
      useSecurityAudit: useDataSourceSecurityAuditQuery,
      useComplianceStatus: useDataSourceComplianceStatusQuery,
      useBackupStatus: useDataSourceBackupStatusQuery,
      useScheduledTasks: useDataSourceScheduledTasksQuery,
      useAccessControl: useDataSourceAccessControlQuery,
      useNotifications: useNotificationsQuery,
      useReports: useDataSourceReportsQuery,
      useVersionHistory: useDataSourceVersionHistoryQuery,
      useTags: useDataSourceTagsQuery,
      useIntegrations: useDataSourceIntegrationsQuery,
      useCatalog: useDataSourceCatalogQuery
    }),
    [
      dataSources,
      dataSourceStats,
      isDataSourcesLoading,
      isDataSourceStatsLoading,
      isDataSourcesError,
      dataSourcesError,
      filters,
      updateFilters,
      clearFilters,
      fetchDataSourceDetails,
      fetchDataSourceDetailStats,
      fetchDataSourceHealth,
      refreshAllDataSourceData,
      createDataSourceMutation.mutateAsync,
      updateDataSourceMutation.mutateAsync,
      deleteDataSourceMutation.mutateAsync,
      testConnectionMutation.mutateAsync,
      createDataSourceMutation.isPending,
      updateDataSourceMutation.isPending,
      deleteDataSourceMutation.isPending,
      testConnectionMutation.isPending,
      canViewDataSources,
      canCreateDataSource,
      canEditDataSource,
      canDeleteDataSource
    ]
  );
}