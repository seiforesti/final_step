/**
 * OPTIMIZED ENTERPRISE APIs WITH INTELLIGENT REQUEST MANAGEMENT
 * 
 * This file implements smart, intelligent API loading strategies to prevent
 * database connection pool exhaustion while maintaining optimal user experience.
 * 
 * Key Features:
 * - Staggered loading with priority-based sequencing
 * - Request batching and deduplication
 * - Connection pool health monitoring
 * - Conditional loading based on user interaction
 * - Smart caching and refetch strategies
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createSmartQuery, useStaggeredLoading, REQUEST_MANAGER_CONFIG } from './api-request-manager';
import axios from 'axios';
import {
  DataSource,
  DataSourceCreateParams,
  DataSourceUpdateParams,
  DataSourceFilters,
  DataSourceStats,
  DataSourceHealth,
  ConnectionTestResult,
  ApiResponse,
  PaginatedResponse,
  DiscoveryHistory,
  ScanRuleSet,
  Scan,
  ScanResult,
  QualityMetric,
  GrowthMetric,
  UserWorkspace,
  ConnectionPoolStats,
  DataSourceSummary,
  ConnectionInfo,
  BulkUpdateRequest,
  SchemaDiscoveryRequest,
  TablePreviewRequest,
  ColumnProfileRequest
} from '../types';

// ============================================================================
// OPTIMIZED AXIOS INSTANCE WITH CONNECTION POOL PROTECTION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy';

const optimizedApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_MANAGER_CONFIG.REQUEST_TIMEOUT_MS,
});

// Enhanced request interceptor with connection pool protection
optimizedApi.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add request deduplication key
  const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
  config.meta = { ...config.meta, requestKey };

  return config;
});

// Enhanced response interceptor with intelligent retry
optimizedApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config: any = error?.config || {};
    const status = error?.response?.status;
    const method = config.method?.toLowerCase();
    const url: string = config.url || '';

    // Don't retry if already retried
    if (config.__retryCount >= REQUEST_MANAGER_CONFIG.MAX_RETRIES) {
      return Promise.reject(error);
    }

    // Retry on 503 (Service Unavailable) with exponential backoff
    if (status === 503) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      
      const delay = Math.min(
        REQUEST_MANAGER_CONFIG.RETRY_DELAY_BASE * Math.pow(2, config.__retryCount - 1),
        REQUEST_MANAGER_CONFIG.RETRY_DELAY_MAX
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 100;
      const totalDelay = delay + jitter;

      await new Promise(resolve => setTimeout(resolve, totalDelay));
      
      return optimizedApi.request(config);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// OPTIMIZED API FUNCTIONS WITH BATCHING SUPPORT
// ============================================================================

// Batch multiple data source requests into a single call
export const getDataSourcesBatch = async (ids: number[]): Promise<DataSource[]> => {
  if (ids.length === 0) return [];
  
  try {
    // Use batch endpoint if available, otherwise fallback to individual calls
    if (ids.length <= 10) { // Small batches
      const params = new URLSearchParams();
      ids.forEach(id => params.append('ids', id.toString()));
      
      const { data } = await optimizedApi.get(`/scan/data-sources/batch?${params.toString()}`);
      return data;
    } else { // Large batches - split into chunks
      const chunkSize = 10;
      const chunks = [];
      
      for (let i = 0; i < ids.length; i += chunkSize) {
        chunks.push(ids.slice(i, i + chunkSize));
      }
      
      const results = await Promise.all(
        chunks.map(chunk => getDataSourcesBatch(chunk))
      );
      
      return results.flat();
    }
  } catch (error) {
    console.error('Batch data source fetch failed:', error);
    
    // Fallback to individual requests
    const results = await Promise.allSettled(
      ids.map(id => getDataSource(id))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<DataSource> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }
};

// Core API functions with optimized error handling
export const getDataSources = async (filters: DataSourceFilters = {}): Promise<DataSource[]> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const { data } = await optimizedApi.get(`/scan/data-sources?${params.toString()}`);
    return data;
  } catch (error: any) {
    console.error('Error fetching data sources:', error);
    return [];
  }
};

export const getDataSource = async (dataSourceId: number): Promise<DataSource> => {
  try {
    const { data } = await optimizedApi.get(`/scan/data-sources/${dataSourceId}`);
    return data;
  } catch (error: any) {
    console.error(`Error fetching data source ${dataSourceId}:`, error);
    
    // Return a default data source object to prevent crashes
    return {
      id: dataSourceId,
      name: 'Error Loading Data Source',
      type: 'unknown',
      host: 'N/A',
      port: 0,
      database_name: 'N/A',
      username: 'N/A',
      status: 'error',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_type: 'unknown',
      location: 'N/A',
      password_secret: 'N/A',
      use_encryption: false,
      ssl_mode: 'N/A',
      connection_timeout: 30,
      max_connections: 10
    } as unknown as DataSource;
  }
};

export const createDataSource = async (params: DataSourceCreateParams): Promise<DataSource> => {
  const { data } = await optimizedApi.post('/scan/data-sources', params);
  return data;
};

export const updateDataSource = async (id: number, params: DataSourceUpdateParams): Promise<DataSource> => {
  const { data } = await optimizedApi.put(`/scan/data-sources/${id}`, params);
  return data;
};

export const deleteDataSource = async (id: number): Promise<void> => {
  await optimizedApi.delete(`/scan/data-sources/${id}`);
};

// ============================================================================
// OPTIMIZED REACT QUERY HOOKS WITH INTELLIGENT LOADING
// ============================================================================

// Core Data Sources - HIGH PRIORITY (load immediately)
export const useDataSourcesQuery = (filters: DataSourceFilters = {}, options = {}) => {
  return createSmartQuery(
    ['data-sources', filters],
    () => getDataSources(filters),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.HIGH,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchInterval: false, // No auto-refresh
      ...options,
    }
  );
};

export const useDataSourceQuery = (dataSourceId: number, options = {}) => {
  return createSmartQuery(
    ['data-source', dataSourceId],
    () => getDataSource(dataSourceId),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.HIGH,
      enabled: !!dataSourceId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      ...options,
    }
  );
};

// Health & Stats - MEDIUM PRIORITY (load after core data)
export const useDataSourceHealthQuery = (dataSourceId: number, options = {}) => {
  return createSmartQuery(
    ['data-source-health', dataSourceId],
    () => optimizedApi.get(`/scan/data-sources/${dataSourceId}/health`).then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM,
      enabled: !!dataSourceId,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 60 * 1000, // 1 minute
      ...options,
    }
  );
};

export const useConnectionPoolStatsQuery = (dataSourceId: number, options = {}) => {
  return createSmartQuery(
    ['connection-pool-stats', dataSourceId],
    () => optimizedApi.get(`/scan/data-sources/${dataSourceId}/connection-pool-stats`).then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM,
      enabled: !!dataSourceId,
      staleTime: 15 * 1000, // 15 seconds
      cacheTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: 30 * 1000, // 30 seconds
      ...options,
    }
  );
};

// Metrics & Analytics - LOW PRIORITY (load when needed)
export const useDataSourceMetricsQuery = (dataSourceId: number, options = {}) => {
  return createSmartQuery(
    ['data-source-metrics', dataSourceId],
    () => optimizedApi.get(`/scan/data-sources/${dataSourceId}/metrics`).then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.LOW,
      enabled: !!dataSourceId && options.enabled !== false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchInterval: false, // No auto-refresh
      ...options,
    }
  );
};

export const useQualityMetricsQuery = (dataSourceId: number, options = {}) => {
  return createSmartQuery(
    ['quality-metrics', dataSourceId],
    () => optimizedApi.get(`/scan/data-sources/${dataSourceId}/quality-metrics`).then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.LOW,
      enabled: !!dataSourceId && options.enabled !== false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 20 * 60 * 1000, // 20 minutes
      refetchInterval: false,
      ...options,
    }
  );
};

export const useGrowthMetricsQuery = (dataSourceId: number, options = {}) => {
  return createSmartQuery(
    ['growth-metrics', dataSourceId],
    () => optimizedApi.get(`/scan/data-sources/${dataSourceId}/growth-metrics`).then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.LOW,
      enabled: !!dataSourceId && options.enabled !== false,
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchInterval: false,
      ...options,
    }
  );
};

// Discovery & Schema - BACKGROUND PRIORITY (load on demand)
export const useDiscoveryHistoryQuery = (dataSourceId: number, limit: number = 10, options = {}) => {
  return createSmartQuery(
    ['discovery-history', dataSourceId, limit],
    () => optimizedApi.get(`/scan/data-sources/${dataSourceId}/discovery-history?limit=${limit}`).then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.BACKGROUND,
      enabled: !!dataSourceId && options.enabled !== false,
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      refetchInterval: false,
      ...options,
    }
  );
};

export const useSchemaDiscoveryQuery = (dataSourceId: number, options = {}) => {
  return createSmartQuery(
    ['schema-discovery', dataSourceId],
    () => optimizedApi.get(`/scan/data-sources/${dataSourceId}/schema-discovery`).then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.BACKGROUND,
      enabled: !!dataSourceId && options.enabled !== false,
      staleTime: 60 * 60 * 1000, // 1 hour
      cacheTime: 2 * 60 * 60 * 1000, // 2 hours
      refetchInterval: false,
      ...options,
    }
  );
};

// User & Workspace - CRITICAL PRIORITY (load first)
export const useUserQuery = (options = {}) => {
  return createSmartQuery(
    ['user'],
    () => optimizedApi.get('/auth/user').then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.CRITICAL,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchInterval: false,
      ...options,
    }
  );
};

export const useWorkspaceQuery = (options = {}) => {
  return createSmartQuery(
    ['workspace'],
    () => optimizedApi.get('/auth/workspace').then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.CRITICAL,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchInterval: false,
      ...options,
    }
  );
};

// Notifications - MEDIUM PRIORITY (load after core data)
export const useNotificationsQuery = (options = {}) => {
  return createSmartQuery(
    ['notifications'],
    () => optimizedApi.get('/notifications').then(res => res.data),
    {
      priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 60 * 1000, // 1 minute
      ...options,
    }
  );
};

// ============================================================================
// OPTIMIZED MUTATIONS
// ============================================================================

export const useCreateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDataSource,
    onSuccess: () => {
      // Invalidate and refetch data sources
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
    onError: (error) => {
      console.error('Create data source failed:', error);
    },
  });
};

export const useUpdateDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: DataSourceUpdateParams }) => 
      updateDataSource(id, params),
    onSuccess: (data, variables) => {
      // Update cache immediately for better UX
      queryClient.setQueryData(['data-source', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
    onError: (error) => {
      console.error('Update data source failed:', error);
    },
  });
};

export const useDeleteDataSourceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDataSource,
    onSuccess: (_, variables) => {
      // Remove from cache immediately
      queryClient.removeQueries({ queryKey: ['data-source', variables] });
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
    onError: (error) => {
      console.error('Delete data source failed:', error);
    },
  });
};

// ============================================================================
// STAGGERED LOADING HOOK FOR COMPONENT INITIALIZATION
// ============================================================================

export function useOptimizedDataSourcesLoading(dataSourceId?: number) {
  // Core queries (load immediately)
  const dataSourcesQuery = useDataSourcesQuery();
  const userQuery = useUserQuery();
  const workspaceQuery = useWorkspaceQuery();

  // Secondary queries (load after core data)
  const healthQuery = useDataSourceHealthQuery(dataSourceId || 0, { enabled: !!dataSourceId });
  const poolStatsQuery = useConnectionPoolStatsQuery(dataSourceId || 0, { enabled: !!dataSourceId });
  const notificationsQuery = useNotificationsQuery();

  // Background queries (load when needed)
  const metricsQuery = useDataSourceMetricsQuery(dataSourceId || 0, { enabled: !!dataSourceId });
  const qualityQuery = useQualityMetricsQuery(dataSourceId || 0, { enabled: !!dataSourceId });
  const growthQuery = useGrowthMetricsQuery(dataSourceId || 0, { enabled: !!dataSourceId });

  // Use staggered loading for optimal performance
  const { loadedQueries, progress } = useStaggeredLoading([
    { key: 'dataSources', query: dataSourcesQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.HIGH },
    { key: 'user', query: userQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.CRITICAL },
    { key: 'workspace', query: workspaceQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.CRITICAL },
    { key: 'health', query: healthQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM },
    { key: 'poolStats', query: poolStatsQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM },
    { key: 'notifications', query: notificationsQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM },
    { key: 'metrics', query: metricsQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.LOW },
    { key: 'quality', query: qualityQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.LOW },
    { key: 'growth', query: growthQuery, priority: REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.LOW },
  ]);

  return {
    // Core data
    dataSources: dataSourcesQuery.data || [],
    dataSourcesLoading: dataSourcesQuery.isLoading,
    dataSourcesError: dataSourcesQuery.error,
    
    // User and workspace
    user: userQuery.data,
    userLoading: userQuery.isLoading,
    workspace: workspaceQuery.data,
    workspaceLoading: workspaceQuery.isLoading,
    
    // Health and monitoring
    health: healthQuery.data,
    poolStats: poolStatsQuery.data,
    notifications: notificationsQuery.data,
    
    // Metrics and analytics
    metrics: metricsQuery.data,
    qualityMetrics: qualityQuery.data,
    growthMetrics: growthQuery.data,
    
    // Loading state
    isLoading: dataSourcesQuery.isLoading || userQuery.isLoading || workspaceQuery.isLoading,
    progress,
    loadedQueries,
    
    // Refetch functions
    refetchDataSources: dataSourcesQuery.refetch,
    refetchUser: userQuery.refetch,
    refetchWorkspace: workspaceQuery.refetch,
  };
}

// ============================================================================
// EXPORT ALL OPTIMIZED HOOKS
// ============================================================================

export {
  getDataSources,
  getDataSource,
  getDataSourcesBatch,
  createDataSource,
  updateDataSource,
  deleteDataSource,
};
