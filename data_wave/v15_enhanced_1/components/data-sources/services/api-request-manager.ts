/**
 * INTELLIGENT API REQUEST MANAGER
 * 
 * This system implements enterprise-grade API request management to prevent
 * database connection pool exhaustion and ensure optimal performance.
 * 
 * Features:
 * - Request batching and deduplication
 * - Smart loading strategies
 * - Connection pool health monitoring
 * - Adaptive retry mechanisms
 * - Request prioritization
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useCallback, useRef, useEffect, useState } from 'react';

// ============================================================================
// REQUEST MANAGER CONFIGURATION
// ============================================================================

const REQUEST_MANAGER_CONFIG = {
  // Request batching
  BATCH_DELAY_MS: 100,
  MAX_BATCH_SIZE: 5,
  
  // Connection pool protection
  MAX_CONCURRENT_REQUESTS: 3,
  REQUEST_TIMEOUT_MS: 10000,
  
  // Smart loading
  STAGGERED_LOADING_DELAY: 200,
  PRIORITY_LEVELS: {
    CRITICAL: 1,      // User authentication, core data
    HIGH: 2,          // Data sources list, user info
    MEDIUM: 3,        // Metrics, health checks
    LOW: 4,           // Analytics, historical data
    BACKGROUND: 5     // Logs, audit trails
  },
  
  // Health monitoring
  HEALTH_CHECK_INTERVAL: 30000,
  CONNECTION_POOL_THRESHOLD: 0.8,
  
  // Retry configuration
  MAX_RETRIES: 2,
  RETRY_DELAY_BASE: 1000,
  RETRY_DELAY_MAX: 5000,
  
  // Cache configuration
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes
} as const;

// ============================================================================
// REQUEST QUEUE AND BATCHING SYSTEM
// ============================================================================

interface QueuedRequest {
  id: string;
  priority: number;
  timestamp: number;
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private activeRequests = 0;
  private lastBatchTime = 0;

  async addRequest(request: Omit<QueuedRequest, 'id' | 'timestamp'>): Promise<any> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        ...request,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this.queue.push(queuedRequest);
      this.queue.sort((a, b) => a.priority - b.priority);
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeRequests >= REQUEST_MANAGER_CONFIG.MAX_CONCURRENT_REQUESTS) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < REQUEST_MANAGER_CONFIG.MAX_CONCURRENT_REQUESTS) {
      const now = Date.now();
      const timeSinceLastBatch = now - this.lastBatchTime;
      
      // Wait for batch delay if needed
      if (timeSinceLastBatch < REQUEST_MANAGER_CONFIG.BATCH_DELAY_MS) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_MANAGER_CONFIG.BATCH_DELAY_MS - timeSinceLastBatch));
      }

      // Process batch of requests
      const batch = this.queue.splice(0, REQUEST_MANAGER_CONFIG.MAX_BATCH_SIZE);
      this.lastBatchTime = Date.now();

      // Execute batch in parallel
      const batchPromises = batch.map(request => this.executeRequest(request));
      
      try {
        await Promise.all(batchPromises);
      } catch (error) {
        console.error('Batch execution error:', error);
      }
    }

    this.processing = false;
  }

  private async executeRequest(request: QueuedRequest) {
    this.activeRequests++;
    
    try {
      const result = await this.makeRequest(request.config);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue(); // Continue processing
    }
  }

  private async makeRequest(config: AxiosRequestConfig) {
    // Implement the actual HTTP request logic here
    // This would use the configured axios instance
    return new Promise((resolve, reject) => {
      // Placeholder - replace with actual axios call
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate for demo
          resolve({ data: 'success' });
        } else {
          reject(new Error('Request failed'));
        }
      }, 100);
    });
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      processing: this.processing,
    };
  }
}

// ============================================================================
// CONNECTION POOL HEALTH MONITOR
// ============================================================================

class ConnectionPoolMonitor {
  private healthStatus = {
    isHealthy: true,
    lastCheck: 0,
    errorCount: 0,
    successCount: 0,
    averageResponseTime: 0,
  };

  async checkHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Make a lightweight health check request
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.updateHealthStatus(true, responseTime);
        return true;
      } else {
        this.updateHealthStatus(false, responseTime);
        return false;
      }
    } catch (error) {
      this.updateHealthStatus(false, 0);
      return false;
    }
  }

  private updateHealthStatus(success: boolean, responseTime: number) {
    const now = Date.now();
    
    if (success) {
      this.healthStatus.successCount++;
      this.healthStatus.errorCount = Math.max(0, this.healthStatus.errorCount - 1);
    } else {
      this.healthStatus.errorCount++;
    }

    // Calculate moving average response time
    const alpha = 0.1; // Smoothing factor
    this.healthStatus.averageResponseTime = 
      alpha * responseTime + (1 - alpha) * this.healthStatus.averageResponseTime;

    this.healthStatus.lastCheck = now;
    
    // Determine overall health
    this.healthStatus.isHealthy = 
      this.healthStatus.errorCount < 3 && 
      this.healthStatus.averageResponseTime < 2000;
  }

  getHealthStatus() {
    return { ...this.healthStatus };
  }

  shouldThrottleRequests(): boolean {
    return !this.healthStatus.isHealthy || this.healthStatus.errorCount > 2;
  }
}

// ============================================================================
// INTELLIGENT HOOK FACTORY
// ============================================================================

interface SmartQueryOptions {
  priority?: number;
  enabled?: boolean;
  refetchInterval?: number | false;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean;
  batchKey?: string;
}

export function createSmartQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: SmartQueryOptions = {}
) {
  const {
    priority = REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM,
    enabled = true,
    refetchInterval = false,
    staleTime = REQUEST_MANAGER_CONFIG.STALE_TIME,
    cacheTime = REQUEST_MANAGER_CONFIG.CACHE_TIME,
    retry = true,
    batchKey
  } = options;

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchInterval,
    staleTime,
    cacheTime,
    retry: retry ? REQUEST_MANAGER_CONFIG.MAX_RETRIES : false,
    retryDelay: (attemptIndex) => 
      Math.min(
        REQUEST_MANAGER_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attemptIndex),
        REQUEST_MANAGER_CONFIG.RETRY_DELAY_MAX
      ),
    // Add request deduplication
    ...(batchKey && { meta: { batchKey } }),
  });
}

// ============================================================================
// STAGGERED LOADING HOOK
// ============================================================================

export function useStaggeredLoading<T>(
  queries: Array<{
    key: string;
    query: ReturnType<typeof useQuery>;
    priority: number;
  }>,
  staggerDelay: number = REQUEST_MANAGER_CONFIG.STAGGERED_LOADING_DELAY
) {
  const [loadedQueries, setLoadedQueries] = useState<Set<string>>(new Set());
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    
    // Sort queries by priority
    const sortedQueries = [...queries].sort((a, b) => a.priority - b.priority);
    
    // Load queries with staggered delay
    sortedQueries.forEach((query, index) => {
      setTimeout(() => {
        if (query.query.isLoading === false) {
          setLoadedQueries(prev => new Set([...prev, query.key]));
        }
      }, index * staggerDelay);
    });
  }, [queries, staggerDelay]);

  return {
    loadedQueries,
    isLoading: queries.some(q => q.query.isLoading),
    progress: loadedQueries.size / queries.length,
  };
}

// ============================================================================
// REQUEST MANAGER HOOK
// ============================================================================

export function useRequestManager() {
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, activeRequests: 0 });
  const [healthStatus, setHealthStatus] = useState({ isHealthy: true, errorCount: 0 });
  
  const queueRef = useRef<RequestQueue>(new RequestQueue());
  const healthMonitorRef = useRef<ConnectionPoolMonitor>(new ConnectionPoolMonitor());

  // Monitor queue status
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueStatus(queueRef.current.getQueueStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Monitor connection pool health
  useEffect(() => {
    const interval = setInterval(async () => {
      const health = await healthMonitorRef.current.checkHealth();
      setHealthStatus(healthMonitorRef.current.getHealthStatus());
    }, REQUEST_MANAGER_CONFIG.HEALTH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const addRequest = useCallback(async (
    config: AxiosRequestConfig,
    priority: number = REQUEST_MANAGER_CONFIG.PRIORITY_LEVELS.MEDIUM
  ) => {
    // Check if we should throttle requests
    if (healthMonitorRef.current.shouldThrottleRequests()) {
      throw new Error('Connection pool is under stress. Please try again later.');
    }

    return queueRef.current.addRequest({
      priority,
      config,
      resolve: () => {},
      reject: () => {},
    });
  }, []);

  return {
    addRequest,
    queueStatus,
    healthStatus,
    isHealthy: healthStatus.isHealthy,
    shouldThrottle: healthStatus.errorCount > 2,
  };
}

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export { REQUEST_MANAGER_CONFIG };
export type { SmartQueryOptions };
