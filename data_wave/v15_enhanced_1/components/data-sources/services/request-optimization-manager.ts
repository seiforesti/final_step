/**
 * ADVANCED REQUEST OPTIMIZATION MANAGER
 * ====================================
 * 
 * This module provides intelligent request management to prevent API loops,
 * database pool exhaustion, and excessive concurrent requests.
 * 
 * Key Features:
 * - Request deduplication and caching
 * - Intelligent debouncing and throttling
 * - Circuit breaker pattern
 * - Request queue management
 * - Performance monitoring
 */

import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface RequestCacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  requestKey: string;
  status: 'pending' | 'resolved' | 'rejected';
  promise?: Promise<any>;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

interface RequestQueueItem {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  priority: number;
}

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  circuitBreakerTrips: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Cache settings
  DEFAULT_CACHE_TTL: 30000, // 30 seconds
  MAX_CACHE_SIZE: 1000,
  CACHE_CLEANUP_INTERVAL: 60000, // 1 minute
  
  // Request throttling
  MAX_CONCURRENT_REQUESTS: 6,
  REQUEST_DEBOUNCE_TIME: 300,
  REQUEST_THROTTLE_TIME: 100,
  
  // Circuit breaker
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 30000, // 30 seconds
  CIRCUIT_BREAKER_RESET_TIMEOUT: 60000, // 1 minute
  
  // Queue management
  MAX_QUEUE_SIZE: 100,
  QUEUE_PROCESSING_INTERVAL: 50,
  HIGH_PRIORITY_THRESHOLD: 1000,
  
  // Performance monitoring
  METRICS_RESET_INTERVAL: 300000, // 5 minutes
  SLOW_REQUEST_THRESHOLD: 5000, // 5 seconds
};

// ============================================================================
// MAIN REQUEST OPTIMIZATION MANAGER CLASS
// ============================================================================

class RequestOptimizationManager {
  private cache = new Map<string, RequestCacheEntry>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private requestQueue: RequestQueueItem[] = [];
  private activeRequests = new Set<string>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private throttleTimers = new Map<string, NodeJS.Timeout>();
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    circuitBreakerTrips: 0,
  };
  
  private queryClient?: QueryClient;
  private isProcessingQueue = false;
  private performanceHistory: number[] = [];

  constructor(queryClient?: QueryClient) {
    this.queryClient = queryClient;
    this.startCacheCleanup();
    this.startQueueProcessor();
    this.startMetricsReset();
  }

  // ========================================================================
  // PUBLIC API METHODS
  // ========================================================================

  /**
   * Main method to make optimized requests
   */
  async makeOptimizedRequest<T = any>(
    url: string,
    options: RequestInit = {},
    config: {
      cacheKey?: string;
      cacheTTL?: number;
      priority?: number;
      skipCache?: boolean;
      skipCircuitBreaker?: boolean;
      debounce?: boolean;
      throttle?: boolean;
    } = {}
  ): Promise<T> {
    const requestKey = config.cacheKey || this.generateRequestKey(url, options);
    const startTime = Date.now();

    try {
      // Check circuit breaker
      if (!config.skipCircuitBreaker && this.isCircuitBreakerOpen(url)) {
        throw new Error('Circuit breaker is open for this endpoint');
      }

      // Check cache first
      if (!config.skipCache) {
        const cachedResult = this.getCachedResult<T>(requestKey);
        if (cachedResult !== null) {
          this.updateMetrics('cache_hit', Date.now() - startTime);
          return cachedResult;
        }
      }

      // Check if request is already in progress (deduplication)
      const existingRequest = this.getExistingRequest<T>(requestKey);
      if (existingRequest) {
        return await existingRequest;
      }

      // Apply debouncing if requested
      if (config.debounce) {
        await this.applyDebounce(requestKey);
      }

      // Apply throttling if requested
      if (config.throttle) {
        await this.applyThrottle(requestKey);
      }

      // Check if we're at max concurrent requests
      if (this.activeRequests.size >= CONFIG.MAX_CONCURRENT_REQUESTS) {
        return await this.queueRequest<T>(url, options, config, requestKey);
      }

      // Make the actual request
      const result = await this.executeRequest<T>(url, options, requestKey, config);
      
      this.updateMetrics('success', Date.now() - startTime);
      this.resetCircuitBreaker(url);
      
      return result;

    } catch (error) {
      this.updateMetrics('error', Date.now() - startTime);
      this.recordCircuitBreakerFailure(url);
      throw error;
    }
  }

  /**
   * Batch multiple requests with intelligent scheduling
   */
  async makeBatchRequests<T = any>(
    requests: Array<{
      url: string;
      options?: RequestInit;
      config?: any;
    }>
  ): Promise<T[]> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[RequestOptimizer] Starting batch request ${batchId} with ${requests.length} requests`);

    // Sort requests by priority and group similar ones
    const sortedRequests = this.optimizeBatchOrder(requests);
    const results: T[] = [];

    // Process in smaller chunks to prevent overwhelming the server
    const chunkSize = Math.min(CONFIG.MAX_CONCURRENT_REQUESTS, 3);
    for (let i = 0; i < sortedRequests.length; i += chunkSize) {
      const chunk = sortedRequests.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async (request, index) => {
        try {
          // Add small delay between requests in the same chunk
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.REQUEST_THROTTLE_TIME));
          }
          
          return await this.makeOptimizedRequest<T>(
            request.url,
            request.options || {},
            {
              ...request.config,
              priority: 1, // High priority for batch requests
              throttle: true,
              debounce: false, // Skip debounce for batch
            }
          );
        } catch (error) {
          console.error(`[RequestOptimizer] Batch request failed for ${request.url}:`, error);
          return null; // Return null for failed requests instead of throwing
        }
      });

      const chunkResults = await Promise.allSettled(chunkPromises);
      chunkResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push(null as any);
        }
      });

      // Add delay between chunks to prevent overwhelming
      if (i + chunkSize < sortedRequests.length) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.REQUEST_THROTTLE_TIME * 2));
      }
    }

    console.log(`[RequestOptimizer] Batch request ${batchId} completed: ${results.filter(r => r !== null).length}/${requests.length} successful`);
    return results;
  }

  /**
   * Clear cache and reset state
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    // Also clear React Query cache if available
    if (this.queryClient) {
      if (pattern) {
        this.queryClient.invalidateQueries({ predicate: (query) => 
          query.queryKey.some(key => typeof key === 'string' && new RegExp(pattern).test(key))
        });
      } else {
        this.queryClient.clear();
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics & { 
    activeRequests: number;
    queueSize: number;
    cacheSize: number;
    circuitBreakersOpen: number;
  } {
    return {
      ...this.metrics,
      activeRequests: this.activeRequests.size,
      queueSize: this.requestQueue.length,
      cacheSize: this.cache.size,
      circuitBreakersOpen: Array.from(this.circuitBreakers.values()).filter(cb => cb.isOpen).length,
    };
  }

  // ========================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ========================================================================

  private generateRequestKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    const headers = options.headers ? JSON.stringify(options.headers) : '';
    return `${method}:${url}:${body}:${headers}`;
  }

  private getCachedResult<T>(requestKey: string): T | null {
    const entry = this.cache.get(requestKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(requestKey);
      return null;
    }

    if (entry.status === 'resolved') {
      return entry.data;
    }

    return null;
  }

  private getExistingRequest<T>(requestKey: string): Promise<T> | null {
    const entry = this.cache.get(requestKey);
    if (entry && entry.status === 'pending' && entry.promise) {
      return entry.promise;
    }
    return null;
  }

  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    requestKey: string,
    config: any
  ): Promise<T> {
    this.activeRequests.add(requestKey);

    // Create cache entry for pending request
    const promise = this.performActualRequest<T>(url, options);
    
    const cacheEntry: RequestCacheEntry = {
      data: null,
      timestamp: Date.now(),
      expiresAt: Date.now() + (config.cacheTTL || CONFIG.DEFAULT_CACHE_TTL),
      requestKey,
      status: 'pending',
      promise,
    };

    this.cache.set(requestKey, cacheEntry);

    try {
      const result = await promise;
      
      // Update cache with result
      cacheEntry.data = result;
      cacheEntry.status = 'resolved';
      cacheEntry.promise = undefined;

      return result;
    } catch (error) {
      cacheEntry.status = 'rejected';
      cacheEntry.promise = undefined;
      this.cache.delete(requestKey); // Don't cache errors
      throw error;
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }

  private async performActualRequest<T>(url: string, options: RequestInit): Promise<T> {
    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as any;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async queueRequest<T>(
    url: string,
    options: RequestInit,
    config: any,
    requestKey: string
  ): Promise<T> {
    if (this.requestQueue.length >= CONFIG.MAX_QUEUE_SIZE) {
      throw new Error('Request queue is full');
    }

    return new Promise((resolve, reject) => {
      const queueItem: RequestQueueItem = {
        id: requestKey,
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
        priority: config.priority || 0,
      };

      this.requestQueue.push(queueItem);
      this.requestQueue.sort((a, b) => b.priority - a.priority); // Higher priority first
    });
  }

  private async applyDebounce(requestKey: string): Promise<void> {
    return new Promise((resolve) => {
      const existingTimer = this.debounceTimers.get(requestKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        this.debounceTimers.delete(requestKey);
        resolve();
      }, CONFIG.REQUEST_DEBOUNCE_TIME);

      this.debounceTimers.set(requestKey, timer);
    });
  }

  private async applyThrottle(requestKey: string): Promise<void> {
    const existingTimer = this.throttleTimers.get(requestKey);
    if (existingTimer) {
      return new Promise((resolve) => {
        setTimeout(resolve, CONFIG.REQUEST_THROTTLE_TIME);
      });
    }

    const timer = setTimeout(() => {
      this.throttleTimers.delete(requestKey);
    }, CONFIG.REQUEST_THROTTLE_TIME);

    this.throttleTimers.set(requestKey, timer);
  }

  private isCircuitBreakerOpen(url: string): boolean {
    const breaker = this.circuitBreakers.get(url);
    if (!breaker) return false;

    if (breaker.isOpen && Date.now() > breaker.nextAttemptTime) {
      breaker.isOpen = false;
      breaker.failureCount = 0;
    }

    return breaker.isOpen;
  }

  private recordCircuitBreakerFailure(url: string): void {
    const breaker = this.circuitBreakers.get(url) || {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
      breaker.isOpen = true;
      breaker.nextAttemptTime = Date.now() + CONFIG.CIRCUIT_BREAKER_TIMEOUT;
      this.metrics.circuitBreakerTrips++;
      console.warn(`[RequestOptimizer] Circuit breaker opened for ${url} after ${breaker.failureCount} failures`);
    }

    this.circuitBreakers.set(url, breaker);
  }

  private resetCircuitBreaker(url: string): void {
    const breaker = this.circuitBreakers.get(url);
    if (breaker) {
      breaker.failureCount = 0;
      breaker.isOpen = false;
    }
  }

  private optimizeBatchOrder(requests: any[]): any[] {
    // Group similar requests together and sort by priority
    return requests.sort((a, b) => {
      const priorityA = a.config?.priority || 0;
      const priorityB = b.config?.priority || 0;
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      
      // Group by URL pattern
      const urlA = new URL(a.url, 'http://localhost').pathname;
      const urlB = new URL(b.url, 'http://localhost').pathname;
      
      return urlA.localeCompare(urlB);
    });
  }

  private updateMetrics(type: 'success' | 'error' | 'cache_hit', responseTime: number): void {
    this.metrics.totalRequests++;
    
    if (type === 'success') {
      this.metrics.successfulRequests++;
    } else if (type === 'error') {
      this.metrics.failedRequests++;
    }

    if (type === 'cache_hit') {
      this.metrics.cacheHitRate = (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
    } else {
      this.metrics.cacheHitRate = (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1)) / this.metrics.totalRequests;
    }

    // Update average response time
    this.performanceHistory.push(responseTime);
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }
    
    this.metrics.averageResponseTime = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }

      // Limit cache size
      if (this.cache.size > CONFIG.MAX_CACHE_SIZE) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toDelete = entries.slice(0, entries.length - CONFIG.MAX_CACHE_SIZE);
        toDelete.forEach(([key]) => this.cache.delete(key));
      }
    }, CONFIG.CACHE_CLEANUP_INTERVAL);
  }

  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.isProcessingQueue || this.requestQueue.length === 0) return;
      if (this.activeRequests.size >= CONFIG.MAX_CONCURRENT_REQUESTS) return;

      this.isProcessingQueue = true;

      try {
        const availableSlots = CONFIG.MAX_CONCURRENT_REQUESTS - this.activeRequests.size;
        const itemsToProcess = this.requestQueue.splice(0, availableSlots);

        for (const item of itemsToProcess) {
          try {
            const result = await this.executeRequest(
              item.url,
              item.options,
              item.id,
              { priority: item.priority }
            );
            item.resolve(result);
          } catch (error) {
            item.reject(error);
          }
        }
      } finally {
        this.isProcessingQueue = false;
      }
    }, CONFIG.QUEUE_PROCESSING_INTERVAL);
  }

  private startMetricsReset(): void {
    setInterval(() => {
      // Reset metrics periodically but keep some history
      this.metrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: this.metrics.averageResponseTime,
        cacheHitRate: this.metrics.cacheHitRate,
        circuitBreakerTrips: 0,
      };
    }, CONFIG.METRICS_RESET_INTERVAL);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let requestOptimizer: RequestOptimizationManager | null = null;

export const getRequestOptimizer = (queryClient?: QueryClient): RequestOptimizationManager => {
  if (!requestOptimizer) {
    requestOptimizer = new RequestOptimizationManager(queryClient);
  }
  return requestOptimizer;
};

// ============================================================================
// CONVENIENCE HOOKS AND FUNCTIONS
// ============================================================================

/**
 * React hook for optimized API requests
 */
export const useOptimizedRequest = () => {
  const optimizer = getRequestOptimizer();
  
  return {
    makeRequest: optimizer.makeOptimizedRequest.bind(optimizer),
    makeBatchRequests: optimizer.makeBatchRequests.bind(optimizer),
    clearCache: optimizer.clearCache.bind(optimizer),
    getMetrics: optimizer.getMetrics.bind(optimizer),
  };
};

/**
 * Wrapper for axios-like requests with optimization
 */
export const optimizedFetch = {
  get: <T = any>(url: string, config?: any) => 
    getRequestOptimizer().makeOptimizedRequest<T>(url, { method: 'GET' }, { 
      ...config, 
      debounce: true, 
      throttle: true 
    }),
    
  post: <T = any>(url: string, data?: any, config?: any) =>
    getRequestOptimizer().makeOptimizedRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }, { ...config, skipCache: true }),
    
  put: <T = any>(url: string, data?: any, config?: any) =>
    getRequestOptimizer().makeOptimizedRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }, { ...config, skipCache: true }),
    
  delete: <T = any>(url: string, config?: any) =>
    getRequestOptimizer().makeOptimizedRequest<T>(url, { method: 'DELETE' }, { 
      ...config, 
      skipCache: true 
    }),
};

export default RequestOptimizationManager;