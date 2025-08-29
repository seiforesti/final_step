'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { 
  DataSource, 
  DataSourcesResponse, 
  DataSourceDetailsResponse,
  DataSourceFormData,
  DataSourceFilters,
  ConnectionTest,
  DataSourceDiscovery,
  BulkOperation,
  DataSourceScan,
  ScanType
} from '@/types/data-source.types';
import toast from 'react-hot-toast';

// Query keys for react-query
const QUERY_KEYS = {
  dataSources: (filters?: DataSourceFilters) => ['data-sources', filters],
  dataSource: (id: string) => ['data-source', id],
  dataSourceSchemas: (id: string) => ['data-source-schemas', id],
  dataSourceScans: (id: string) => ['data-source-scans', id],
  connectionTest: (id: string) => ['connection-test', id],
  discovery: () => ['data-source-discovery'],
  bulkOperations: () => ['bulk-operations'],
  dataSourceStats: () => ['data-source-stats'],
  dataSourceHealth: (id: string) => ['data-source-health', id],
};

// Main hook for data sources list
export function useDataSources(filters?: DataSourceFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.dataSources(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.set(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get<DataSourcesResponse>(
        `/api/v1/data-sources?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for single data source details
export function useDataSource(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.dataSource(id),
    queryFn: async () => {
      const response = await apiClient.get<DataSourceDetailsResponse>(
        `/api/v1/data-sources/${id}`
      );
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for data source schemas
export function useDataSourceSchemas(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.dataSourceSchemas(id),
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/data-sources/${id}/schemas`);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for data source scans
export function useDataSourceScans(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.dataSourceScans(id),
    queryFn: async () => {
      const response = await apiClient.get<DataSourceScan[]>(
        `/api/v1/data-sources/${id}/scans`
      );
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for active scans
  });
}

// Hook for data source health monitoring
export function useDataSourceHealth(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.dataSourceHealth(id),
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/data-sources/${id}/health`);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

// Hook for overall data source statistics
export function useDataSourceStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dataSourceStats(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/data-sources/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation hooks for CRUD operations
export function useCreateDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DataSourceFormData) => {
      const response = await apiClient.post<DataSource>('/api/v1/data-sources', data);
      return response.data;
    },
    onSuccess: (newDataSource) => {
      // Invalidate and refetch data sources list
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSourceStats() });
      
      toast.success(`Data source "${newDataSource?.name}" created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create data source');
    },
  });
}

export function useUpdateDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DataSourceFormData> }) => {
      const response = await apiClient.put<DataSource>(`/api/v1/data-sources/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedDataSource, { id }) => {
      // Update the specific data source in cache
      queryClient.setQueryData(QUERY_KEYS.dataSource(id), updatedDataSource);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSourceStats() });
      
      toast.success(`Data source "${updatedDataSource?.name}" updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update data source');
    },
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/data-sources/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.dataSource(deletedId) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSourceStats() });
      
      toast.success('Data source deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete data source');
    },
  });
}

// Connection testing
export function useTestConnection() {
  return useMutation({
    mutationFn: async (connectionConfig: any) => {
      const response = await apiClient.post<ConnectionTest>(
        '/api/v1/data-sources/test-connection',
        connectionConfig
      );
      return response.data;
    },
    onSuccess: (result) => {
      if (result?.success) {
        toast.success(`Connection successful (${result.response_time_ms}ms)`);
      } else {
        toast.error(result?.error_message || 'Connection failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to test connection');
    },
  });
}

// Data source discovery
export function useDataSourceDiscovery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: any) => {
      const response = await apiClient.post<DataSourceDiscovery>(
        '/api/v1/data-sources/discover',
        config
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discovery() });
      toast.success('Discovery process started');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start discovery');
    },
  });
}

// Scan operations
export function useStartScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scanType, config }: { 
      id: string; 
      scanType: ScanType; 
      config?: any 
    }) => {
      const response = await apiClient.post<DataSourceScan>(
        `/api/v1/data-sources/${id}/scan`,
        { scan_type: scanType, configuration: config }
      );
      return response.data;
    },
    onSuccess: (scan, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSourceScans(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSource(id) });
      
      toast.success('Scan started successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start scan');
    },
  });
}

export function useCancelScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dataSourceId, scanId }: { dataSourceId: string; scanId: string }) => {
      await apiClient.post(`/api/v1/data-sources/${dataSourceId}/scans/${scanId}/cancel`);
      return { dataSourceId, scanId };
    },
    onSuccess: ({ dataSourceId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSourceScans(dataSourceId) });
      toast.success('Scan cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel scan');
    },
  });
}

// Bulk operations
export function useBulkOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      operation, 
      dataSourceIds, 
      config 
    }: { 
      operation: string; 
      dataSourceIds: string[]; 
      config?: any 
    }) => {
      const response = await apiClient.post<BulkOperation>(
        '/api/v1/data-sources/bulk',
        {
          operation,
          data_source_ids: dataSourceIds,
          configuration: config,
        }
      );
      return response.data;
    },
    onSuccess: (operation) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bulkOperations() });
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      
      toast.success(`Bulk ${operation?.type} operation started`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start bulk operation');
    },
  });
}

// Data source synchronization
export function useSyncDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/data-sources/${id}/sync`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSource(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSourceSchemas(id) });
      
      toast.success('Data source synchronization started');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sync data source');
    },
  });
}

// Export data source configuration
export function useExportDataSource() {
  return useMutation({
    mutationFn: async ({ ids, format }: { ids: string[]; format: 'json' | 'yaml' | 'csv' }) => {
      const response = await apiClient.post(
        '/api/v1/data-sources/export',
        { data_source_ids: ids, format },
        { responseType: 'blob' }
      );
      return response.data;
    },
    onSuccess: (blob, { format }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data-sources.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data sources exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export data sources');
    },
  });
}

// Import data source configuration
export function useImportDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/api/v1/data-sources/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dataSourceStats() });
      
      toast.success(`Successfully imported ${result?.imported_count || 0} data sources`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import data sources');
    },
  });
}

// Custom hook for real-time data source monitoring
export function useDataSourceRealtime(id: string) {
  const queryClient = useQueryClient();

  // This would integrate with WebSocket for real-time updates
  // For now, we'll use polling for critical data
  return useQuery({
    queryKey: ['data-source-realtime', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/data-sources/${id}/realtime`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 10 * 1000, // Poll every 10 seconds
    refetchIntervalInBackground: true,
  });
}