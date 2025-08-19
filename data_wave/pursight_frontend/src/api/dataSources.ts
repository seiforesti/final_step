import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from './axiosConfig';
import { DataSourceStats, SingleDataSourceStats, DataSourceConnectionTest, DataSourceHealthCheck } from '../models/DataSourceStats';

/**
 * API functions for data sources
 */

// Types
export interface DataSourceCreateParams {
  name: string;
  source_type: string;
  location: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database_name?: string;
  description?: string;
  connection_properties?: Record<string, any>;
}

export interface DataSourceUpdateParams {
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database_name?: string;
  description?: string;
  connection_properties?: Record<string, any>;
}

export interface DataSourceFilters {
  type?: string;
  status?: 'active' | 'inactive' | 'error' | 'pending';
  search?: string;
}

// API functions

/**
 * Get all data sources with optional filtering
 */
export const getDataSources = async (filters: DataSourceFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await axios.get(`/scan/data-sources?${params.toString()}`);
  return data;
};

/**
 * Get data source statistics
 */
export const getDataSourceStats = async () => {
  const { data } = await axios.get('/dashboard/data-source-stats');
  return data as DataSourceStats;
};

/**
 * Get a specific data source by ID
 */
export const getDataSourceById = async (dataSourceId: number) => {
  const { data } = await axios.get(`/scan/data-sources/${dataSourceId}`);
  return data;
};

/**
 * Get detailed statistics for a specific data source
 */
export const getDataSourceDetailStats = async (dataSourceId: number) => {
  const { data } = await axios.get(`/dashboard/data-source-stats/${dataSourceId}`);
  return data as SingleDataSourceStats;
};

/**
 * Create a new data source
 */
export const createDataSource = async (params: DataSourceCreateParams) => {
  const { data } = await axios.post('/scan/data-sources', params);
  return data;
};

/**
 * Update an existing data source
 */
export const updateDataSource = async (id: number, params: DataSourceUpdateParams) => {
  const { data } = await axios.put(`/scan/data-sources/${id}`, params);
  return data;
};

/**
 * Delete a data source
 */
export const deleteDataSource = async (id: number) => {
  await axios.delete(`/scan/data-sources/${id}`);
  return id;
};

/**
 * Test connection to a data source
 */
export const testDataSourceConnection = async (id: number) => {
  const { data } = await axios.post(`/scan/data-sources/${id}/validate`);
  return data as DataSourceConnectionTest;
};

/**
 * Get health check for a data source
 */
export const getDataSourceHealth = async (dataSourceId: number) => {
  const { data } = await axios.get(`/scan/data-sources/${dataSourceId}/health`);
  return data as DataSourceHealthCheck;
};

// React Query hooks

/**
 * Hook for fetching data sources with React Query
 */
export const useDataSourcesQuery = (filters: DataSourceFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['dataSources', filters],
    queryFn: () => getDataSources(filters),
    ...options
  });
};

/**
 * Hook for fetching data source statistics with React Query
 */
export const useDataSourceStatsQuery = (dataSourceIdOrFilters?: number | DataSourceFilters, options = {}) => {
  if (typeof dataSourceIdOrFilters === 'number') {
    return useQuery({
      queryKey: ['dataSourceDetailStats', dataSourceIdOrFilters],
      queryFn: () => getDataSourceDetailStats(dataSourceIdOrFilters),
      enabled: !!dataSourceIdOrFilters,
      ...options
    });
  }
  
  return useQuery({
    queryKey: ['dataSourceStats', dataSourceIdOrFilters],
    queryFn: () => getDataSourceStats(),
    ...options
  });
};

/**
 * Hook for fetching a single data source with React Query
 */
export const useDataSourceQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSource', dataSourceId],
    queryFn: () => getDataSourceById(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching detailed statistics for a data source with React Query
 */
export const useDataSourceDetailStatsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceDetailStats', dataSourceId],
    queryFn: () => getDataSourceDetailStats(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for creating a data source with React Query
 */
export const useCreateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries(['dataSources']);
      queryClient.invalidateQueries(['dataSourceStats']);
    }
  });
};

/**
 * Hook for updating a data source with React Query
 */
export const useUpdateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & DataSourceUpdateParams) => 
      updateDataSource(id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['dataSources']);
      queryClient.invalidateQueries(['dataSource', variables.id]);
      queryClient.invalidateQueries(['dataSourceStats']);
      queryClient.invalidateQueries(['dataSourceDetailStats', variables.id]);
    }
  });
};

/**
 * Hook for deleting a data source with React Query
 */
export const useDeleteDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDataSource,
    onSuccess: (id) => {
      queryClient.invalidateQueries(['dataSources']);
      queryClient.invalidateQueries(['dataSource', id]);
      queryClient.invalidateQueries(['dataSourceStats']);
      queryClient.invalidateQueries(['dataSourceDetailStats', id]);
    }
  });
};

/**
 * Hook for testing connection to a data source with React Query
 */
export const useTestDataSourceConnectionMutation = () => {
  return useMutation({
    mutationFn: testDataSourceConnection
  });
};

/**
 * Hook for fetching health check for a data source with React Query
 */
export const useDataSourceHealthCheckQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceHealth', dataSourceId],
    queryFn: () => getDataSourceHealth(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

// ============================================================================
// NEW: Additional API endpoints for enhanced functionality
// ============================================================================

/**
 * Get performance metrics for a data source
 */
export const getDataSourcePerformanceMetrics = async (dataSourceId: number, timeRange: string = '24h') => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/performance-metrics?time_range=${timeRange}`);
  return response.data;
};

/**
 * Get security audit data for a data source
 */
export const getDataSourceSecurityAudit = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/security-audit`);
  return response.data;
};

/**
 * Get compliance status for a data source
 */
export const getDataSourceComplianceStatus = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/compliance-status`);
  return response.data;
};

/**
 * Get backup status for a data source
 */
export const getDataSourceBackupStatus = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/backup-status`);
  return response.data;
};

/**
 * Get scheduled tasks for a data source
 */
export const getDataSourceScheduledTasks = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/scheduled-tasks`);
  return response.data;
};

/**
 * Get access control information for a data source
 */
export const getDataSourceAccessControl = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/access-control`);
  return response.data;
};

/**
 * Get notifications for the current user
 */
export const getNotifications = async () => {
  const response = await axios.get('/scan/notifications');
  return response.data;
};

/**
 * Get reports for a data source
 */
export const getDataSourceReports = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/reports`);
  return response.data;
};

/**
 * Get version history for a data source
 */
export const getDataSourceVersionHistory = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/version-history`);
  return response.data;
};

/**
 * Get tags for a data source
 */
export const getDataSourceTags = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/tags`);
  return response.data;
};

// React Query Hooks for the new endpoints

/**
 * Hook for fetching performance metrics with React Query
 */
export const useDataSourcePerformanceMetricsQuery = (dataSourceId: number, timeRange: string = '24h', options = {}) => {
  return useQuery({
    queryKey: ['dataSourcePerformanceMetrics', dataSourceId, timeRange],
    queryFn: () => getDataSourcePerformanceMetrics(dataSourceId, timeRange),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching security audit with React Query
 */
export const useDataSourceSecurityAuditQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceSecurityAudit', dataSourceId],
    queryFn: () => getDataSourceSecurityAudit(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching compliance status with React Query
 */
export const useDataSourceComplianceStatusQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceComplianceStatus', dataSourceId],
    queryFn: () => getDataSourceComplianceStatus(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching backup status with React Query
 */
export const useDataSourceBackupStatusQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceBackupStatus', dataSourceId],
    queryFn: () => getDataSourceBackupStatus(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching scheduled tasks with React Query
 */
export const useDataSourceScheduledTasksQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceScheduledTasks', dataSourceId],
    queryFn: () => getDataSourceScheduledTasks(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching access control with React Query
 */
export const useDataSourceAccessControlQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceAccessControl', dataSourceId],
    queryFn: () => getDataSourceAccessControl(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching notifications with React Query
 */
export const useNotificationsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    ...options
  });
};

/**
 * Hook for fetching reports with React Query
 */
export const useDataSourceReportsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceReports', dataSourceId],
    queryFn: () => getDataSourceReports(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching version history with React Query
 */
export const useDataSourceVersionHistoryQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceVersionHistory', dataSourceId],
    queryFn: () => getDataSourceVersionHistory(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching tags with React Query
 */
export const useDataSourceTagsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceTags', dataSourceId],
    queryFn: () => getDataSourceTags(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

// ============================================================================
// NEW: Additional missing endpoints for integrations and catalog
// ============================================================================

/**
 * Get integrations for a data source
 */
export const getDataSourceIntegrations = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/integrations`);
  return response.data;
};

/**
 * Get catalog data for a data source
 */
export const getDataSourceCatalog = async (dataSourceId: number) => {
  const response = await axios.get(`/scan/data-sources/${dataSourceId}/catalog`);
  return response.data;
};

/**
 * Hook for fetching integrations with React Query
 */
export const useDataSourceIntegrationsQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceIntegrations', dataSourceId],
    queryFn: () => getDataSourceIntegrations(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching catalog with React Query
 */
export const useDataSourceCatalogQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['dataSourceCatalog', dataSourceId],
    queryFn: () => getDataSourceCatalog(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};