/**
 * OPTIMIZED QUERY HOOKS FOR DATA SOURCES
 * ======================================
 * 
 * This module provides React Query hooks with advanced optimizations
 * to prevent excessive API requests and database overload.
 * 
 * Key Features:
 * - Intelligent caching and stale-while-revalidate
 * - Request deduplication and batching
 * - Circuit breaker integration
 * - Performance monitoring
 * - Dependency-aware updates
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { getRequestOptimizer, useOptimizedRequest } from '../services/request-optimization-manager';
import type { 
  DataSource, 
  DataSourceFilters, 
  DataSourceStats,
  DataSourceHealth,
  ConnectionTestResult,
  PaginatedResponse 
} from '../types';

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

export const dataSourceQueryKeys = {
  all: ['data-sources'] as const,
  lists: () => [...dataSourceQueryKeys.all, 'list'] as const,
  list: (filters: DataSourceFilters) => [...dataSourceQueryKeys.lists(), { filters }] as const,
  details: () => [...dataSourceQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...dataSourceQueryKeys.details(), id] as const,
  stats: () => [...dataSourceQueryKeys.all, 'stats'] as const,
  health: () => [...dataSourceQueryKeys.all, 'health'] as const,
  healthDetail: (id: number) => [...dataSourceQueryKeys.health(), id] as const,
  connections: () => [...dataSourceQueryKeys.all, 'connections'] as const,
  connectionTest: (id: number) => [...dataSourceQueryKeys.connections(), 'test', id] as const,
  search: (query: string) => [...dataSourceQueryKeys.all, 'search', { query }] as const,
};

// ============================================================================
// OPTIMIZED QUERY CONFIGURATIONS
// ============================================================================

const QUERY_DEFAULTS = {
  // Conservative stale times to reduce unnecessary requests
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  
  // Retry configuration
  retry: (failureCount: number, error: any) => {
    // Don't retry on client errors (4xx)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    // Retry up to 3 times for server errors with exponential backoff
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  
  // Refetch configuration
  refetchOnWindowFocus: false, // Prevent excessive refetching
  refetchOnMount: 'always' as const,
  refetchOnReconnect: true,
  
  // Performance optimizations
  notifyOnChangeProps: ['data', 'error', 'isLoading'] as const,
  structuralSharing: true,
};

// ============================================================================
// DATA SOURCE LIST HOOK
// ============================================================================

export const useDataSources = (filters: DataSourceFilters = {}) => {
  const { makeRequest } = useOptimizedRequest();
  
  // Memoize filters to prevent unnecessary re-renders
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);
  
  return useQuery({
    queryKey: dataSourceQueryKeys.list(stableFilters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Build query parameters efficiently
      Object.entries(stableFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const url = `/api/data-sources${params.toString() ? `?${params.toString()}` : ''}`;
      
      return makeRequest<PaginatedResponse<DataSource>>(url, {
        method: 'GET',
      }, {
        cacheKey: `data-sources-list-${JSON.stringify(stableFilters)}`,
        cacheTTL: 3 * 60 * 1000, // 3 minutes for list data
        debounce: true,
        throttle: true,
      });
    },
    ...QUERY_DEFAULTS,
    staleTime: 3 * 60 * 1000, // Shorter stale time for frequently changing data
  });
};

// ============================================================================
// DATA SOURCE DETAIL HOOK
// ============================================================================

export const useDataSource = (id: number, enabled: boolean = true) => {
  const { makeRequest } = useOptimizedRequest();
  
  return useQuery({
    queryKey: dataSourceQueryKeys.detail(id),
    queryFn: async () => {
      return makeRequest<DataSource>(`/api/data-sources/${id}`, {
        method: 'GET',
      }, {
        cacheKey: `data-source-${id}`,
        cacheTTL: 5 * 60 * 1000, // 5 minutes for detail data
        priority: 1, // High priority for detail views
      });
    },
    enabled: enabled && !!id,
    ...QUERY_DEFAULTS,
  });
};

// ============================================================================
// DATA SOURCE STATS HOOK
// ============================================================================

export const useDataSourceStats = (refreshInterval?: number) => {
  const { makeRequest } = useOptimizedRequest();
  
  return useQuery({
    queryKey: dataSourceQueryKeys.stats(),
    queryFn: async () => {
      return makeRequest<DataSourceStats>('/api/data-sources/stats', {
        method: 'GET',
      }, {
        cacheKey: 'data-sources-stats',
        cacheTTL: 2 * 60 * 1000, // 2 minutes for stats
        throttle: true,
      });
    },
    ...QUERY_DEFAULTS,
    staleTime: 2 * 60 * 1000,
    refetchInterval: refreshInterval || 5 * 60 * 1000, // Default 5 minutes
    refetchIntervalInBackground: false,
  });
};

// ============================================================================
// DATA SOURCE HEALTH HOOK
// ============================================================================

export const useDataSourceHealth = (id?: number, enabled: boolean = true) => {
  const { makeRequest } = useOptimizedRequest();
  
  const queryKey = id 
    ? dataSourceQueryKeys.healthDetail(id)
    : dataSourceQueryKeys.health();
    
  const url = id 
    ? `/api/data-sources/${id}/health`
    : '/api/data-sources/health';
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      return makeRequest<DataSourceHealth | DataSourceHealth[]>(url, {
        method: 'GET',
      }, {
        cacheKey: id ? `data-source-health-${id}` : 'data-sources-health',
        cacheTTL: 1 * 60 * 1000, // 1 minute for health data
        throttle: true,
      });
    },
    enabled,
    ...QUERY_DEFAULTS,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// ============================================================================
// CONNECTION TEST HOOK
// ============================================================================

export const useConnectionTest = () => {
  const { makeRequest } = useOptimizedRequest();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, config }: { id: number; config?: any }) => {
      return makeRequest<ConnectionTestResult>(`/api/data-sources/${id}/test-connection`, {
        method: 'POST',
        body: JSON.stringify(config || {}),
        headers: { 'Content-Type': 'application/json' },
      }, {
        skipCache: true, // Always test fresh
        priority: 2, // High priority for user-initiated actions
      });
    },
    onSuccess: (data, variables) => {
      // Update the data source cache with connection status
      queryClient.setQueryData(
        dataSourceQueryKeys.detail(variables.id),
        (oldData: DataSource | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              connectionStatus: data.success ? 'connected' : 'failed',
              lastTestedAt: new Date().toISOString(),
            };
          }
          return oldData;
        }
      );
      
      // Show success/error toast
      if (data.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(`Connection test failed: ${data.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Connection test failed: ${error.message}`);
    },
  });
};

// ============================================================================
// OPTIMIZED SEARCH HOOK
// ============================================================================

export const useDataSourceSearch = (query: string, debounceMs: number = 500) => {
  const { makeRequest } = useOptimizedRequest();
  const debouncedQuery = useDebounce(query, debounceMs);
  
  return useQuery({
    queryKey: dataSourceQueryKeys.search(debouncedQuery),
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return [];
      }
      
      return makeRequest<DataSource[]>(`/api/data-sources/search`, {
        method: 'POST',
        body: JSON.stringify({ query: debouncedQuery }),
        headers: { 'Content-Type': 'application/json' },
      }, {
        cacheKey: `data-sources-search-${debouncedQuery}`,
        cacheTTL: 5 * 60 * 1000,
        debounce: true,
      });
    },
    enabled: debouncedQuery.length >= 2,
    ...QUERY_DEFAULTS,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// BATCH OPERATIONS HOOK
// ============================================================================

export const useBatchDataSourceOperations = () => {
  const { makeBatchRequests } = useOptimizedRequest();
  const queryClient = useQueryClient();
  
  const batchFetch = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return [];
    
    const requests = ids.map(id => ({
      url: `/api/data-sources/${id}`,
      options: { method: 'GET' },
      config: { 
        cacheKey: `data-source-${id}`,
        priority: 1,
      },
    }));
    
    try {
      const results = await makeBatchRequests<DataSource>(requests);
      
      // Update individual caches
      results.forEach((result, index) => {
        if (result) {
          queryClient.setQueryData(
            dataSourceQueryKeys.detail(ids[index]),
            result
          );
        }
      });
      
      return results.filter(Boolean); // Remove null results
    } catch (error) {
      console.error('Batch fetch failed:', error);
      throw error;
    }
  }, [makeBatchRequests, queryClient]);
  
  const batchHealthCheck = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return [];
    
    const requests = ids.map(id => ({
      url: `/api/data-sources/${id}/health`,
      options: { method: 'GET' },
      config: { 
        cacheKey: `data-source-health-${id}`,
        priority: 1,
      },
    }));
    
    try {
      const results = await makeBatchRequests<DataSourceHealth>(requests);
      
      // Update health caches
      results.forEach((result, index) => {
        if (result) {
          queryClient.setQueryData(
            dataSourceQueryKeys.healthDetail(ids[index]),
            result
          );
        }
      });
      
      return results.filter(Boolean);
    } catch (error) {
      console.error('Batch health check failed:', error);
      throw error;
    }
  }, [makeBatchRequests, queryClient]);
  
  return {
    batchFetch,
    batchHealthCheck,
  };
};

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

export const useQueryPerformanceMonitor = () => {
  const optimizer = getRequestOptimizer();
  
  const metrics = useQuery({
    queryKey: ['query-performance-metrics'],
    queryFn: () => optimizer.getMetrics(),
    refetchInterval: 30 * 1000, // Every 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });
  
  const clearCache = useCallback((pattern?: string) => {
    optimizer.clearCache(pattern);
  }, [optimizer]);
  
  return {
    metrics: metrics.data,
    isLoading: metrics.isLoading,
    clearCache,
  };
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Debounce hook
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

// Previous value hook for comparison
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// ============================================================================
// CACHE INVALIDATION UTILITIES
// ============================================================================

export const useDataSourceCacheUtils = () => {
  const queryClient = useQueryClient();
  
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dataSourceQueryKeys.all });
  }, [queryClient]);
  
  const invalidateList = useCallback((filters?: DataSourceFilters) => {
    if (filters) {
      queryClient.invalidateQueries({ 
        queryKey: dataSourceQueryKeys.list(filters) 
      });
    } else {
      queryClient.invalidateQueries({ 
        queryKey: dataSourceQueryKeys.lists() 
      });
    }
  }, [queryClient]);
  
  const invalidateDetail = useCallback((id: number) => {
    queryClient.invalidateQueries({ 
      queryKey: dataSourceQueryKeys.detail(id) 
    });
  }, [queryClient]);
  
  const invalidateStats = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: dataSourceQueryKeys.stats() 
    });
  }, [queryClient]);
  
  const invalidateHealth = useCallback((id?: number) => {
    if (id) {
      queryClient.invalidateQueries({ 
        queryKey: dataSourceQueryKeys.healthDetail(id) 
      });
    } else {
      queryClient.invalidateQueries({ 
        queryKey: dataSourceQueryKeys.health() 
      });
    }
  }, [queryClient]);
  
  return {
    invalidateAll,
    invalidateList,
    invalidateDetail,
    invalidateStats,
    invalidateHealth,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  QUERY_DEFAULTS,
  dataSourceQueryKeys,
};

// Import useState for debounce hook
import { useState } from 'react';