/**
 * 🔌 ENTERPRISE API CLIENT - ADVANCED HTTP CLIENT WITH CIRCUIT BREAKER
 * =================================================================
 * 
 * Advanced enterprise-grade API client for the data governance platform.
 * Features:
 * - Circuit breaker pattern for fault tolerance
 * - Advanced retry strategies with exponential backoff
 * - Request queueing and rate limiting
 * - Comprehensive error handling and logging
 * - Sophisticated auth token management
 * - Request/Response transformation pipeline
 * - Metrics collection and performance monitoring
 * - Cross-group request coordination
 */

// IMPORTANT: Remove previous implementations of these interfaces as they are now in api-client.types.ts

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiClientConfig, ApiError } from './api-client.types';
import { RateLimiter } from './rate-limiter';
import { CircuitBreaker } from './circuit-breaker';
import { RequestQueue } from './request-queue';
import { MetricsCollector } from './metrics-collector';
import { ErrorHandler } from './error-handler';
import { RetryStrategyFactory } from './retry-strategy';

export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly rateLimiter: RateLimiter;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly requestQueue: RequestQueue;
  private readonly metricsCollector: MetricsCollector;
  private readonly errorHandler: ErrorHandler;
  private readonly retryStrategy: RetryStrategyFactory;
  private readonly retries: number = 3;
  private readonly retryDelay: number = 1000;

  private extractGroupFromUrl(url?: string): string | undefined {
    if (!url) return undefined;
    const groupPatterns = {
      'data-sources': /\/api\/(?:v1\/)?data-sources/,
      'scan-rules': /\/api\/(?:v1\/)?scan-rules/,
      'classifications': /\/api\/(?:v1\/)?classifications/
    };

    for (const [group, pattern] of Object.entries(groupPatterns)) {
      if (pattern.test(url)) return group;
    }
    return undefined;
  }

  private shouldTripCircuitBreaker(error: AxiosError): boolean {
    // Trip on 5xx errors or network issues
    if (!error.response) return true; // Network error
    return error.response.status >= 500;
  }

  constructor(config: ApiClientConfig = {}) {
    // Initialize core HTTP client
    this.client = axios.create({
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': process.env.NEXT_PUBLIC_VERSION || '1.0.0',
      },
    });

    // Initialize advanced features
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      perMilliseconds: 1000,
      maxConcurrent: 10,
      groupLimits: {
        'data-sources': { maxRequests: 50, perMilliseconds: 1000 },
        'scan-rules': { maxRequests: 30, perMilliseconds: 1000 },
        'classifications': { maxRequests: 40, perMilliseconds: 1000 }
      }
    });

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000,
      monitorInterval: 5000,
      groupSpecific: true
    });

    this.requestQueue = new RequestQueue({
      maxSize: 1000,
      timeout: 60000,
      priorityLevels: 3,
      groupQueues: ['data-sources', 'scan-rules', 'classifications']
    });

    this.metricsCollector = new MetricsCollector({
      enabled: true,
      sampleRate: 0.1,
      customMetrics: ['requestSize', 'responseSize', 'processingTime'],
      retentionPeriod: 24 * 60 * 60 * 1000
    });

    this.errorHandler = new ErrorHandler({
      retryableStatuses: [408, 429, 500, 502, 503, 504],
      maxRetries: 3,
      retryStrategy: 'exponential',
      errorCallback: (error: unknown) => {
        console.error('[API Error]', error);
        // TODO: Add error monitoring integration when available
      }
    });

    this.retryStrategy = new RetryStrategyFactory({
      strategy: 'exponential',
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      timeout: 90000,
      jitter: true,
      groupPolicies: {
        'data-sources': {
          strategy: 'exponential',
          maxAttempts: 5,
          baseDelay: 500,
          maxDelay: 15000,
          timeout: 60000,
          jitter: true
        },
        'scan-rules': {
          strategy: 'decorrelated',
          maxAttempts: 3,
          baseDelay: 1000,
          maxDelay: 20000,
          timeout: 45000,
          jitter: true
        }
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for authentication and preprocessing
    this.client.interceptors.request.use(
      async (config) => {
        const requestId = crypto.randomUUID();
        const group = this.extractGroupFromUrl(config.url);

        // Start metrics collection
        this.metricsCollector.startRequest(requestId, config.url!, config.method!, group);

        // Check circuit breaker
        if (this.circuitBreaker.isOpen(group)) {
          const message = group ? `Circuit breaker is open for group ${group}` : 'Circuit breaker is open';
          throw new Error(message);
        }

        // Apply rate limiting
        if (!await this.rateLimiter.acquire(group)) {
          const message = group ? `Rate limit exceeded for group ${group}` : 'Rate limit exceeded';
          throw new Error(message);
        }

        // Add authentication
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request metadata
        config.headers['X-Request-ID'] = requestId;
        config.headers['X-Group'] = group;
        config.metadata = {
          startTime: Date.now(),
          group,
          requestId
        };

        return config;
      },
      (error) => {
        this.rateLimiter.release(this.extractGroupFromUrl(error.config?.url));
        return Promise.reject(this.errorHandler.handleError(error));
      }
    );

    // Response interceptor for error handling and postprocessing
    this.client.interceptors.response.use(
      this.handleSuccessResponse.bind(this),
      this.handleErrorResponse.bind(this)
    );
  }

  private handleSuccessResponse(response: AxiosResponse): AxiosResponse {
    const { config } = response;
    const group = this.extractGroupFromUrl(config.url);
    const requestId = config.headers['X-Request-ID'];

    // Record metrics
    this.metricsCollector.endRequest(requestId, response.status);
    
    // Release rate limiter
    this.rateLimiter.release(group);

    return response;
  }

  private async handleTokenRefresh(error: AxiosError): Promise<AxiosResponse> {
    const { config } = error;
    if (!config) throw error;

    config._retry = true;
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('/api/auth/refresh', {
        refresh_token: refreshToken
      });
      
      const { access_token } = response.data;
      localStorage.setItem('auth_token', access_token);
      config.headers.Authorization = `Bearer ${access_token}`;
      
      return this.client(config);
    } catch (refreshError: unknown) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      // If running in browser, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new ApiError(
        'Token refresh failed, please log in again',
        401,
        'TOKEN_REFRESH_FAILED',
        false,
        refreshError instanceof Error ? refreshError : undefined
      );
    }
  }

  private async handleErrorResponse(error: AxiosError): Promise<never> {
    const { config } = error;
    if (!config) throw error;

    const group = this.extractGroupFromUrl(config?.url);
    const requestId = config?.headers?.['X-Request-ID'];

    // Record metrics
    this.metricsCollector.endRequest(requestId, error.response?.status, error.message);
    
    // Release rate limiter
    this.rateLimiter.release(group);

    // Handle 401 unauthorized
    if (error.response?.status === 401 && !config._retry) {
      return this.handleTokenRefresh(error);
    }

    // Update circuit breaker
    if (this.shouldTripCircuitBreaker(error)) {
      this.circuitBreaker.recordFailure(group);
    }

    // Handle error with error handler
    const handledError = this.errorHandler.handleError(error, group);

    // Check if we should retry
    if (this.shouldRetryRequest(handledError, config, group)) {
      return this.executeRetry(config, handledError, group);
    }

    return Promise.reject(handledError);
  }

  private shouldRetryRequest(handledError: ApiError, config: AxiosRequestConfig, group?: string): boolean {
    if (!handledError.retryable) return false;

    const retryContext = {
      attempt: (config._retryCount || 0) + 1,
      previousDelay: config._retryDelay,
      error: handledError,
      startTime: config.metadata?.startTime,
      group
    };

    return this.retryStrategy.shouldRetry(retryContext, group);
  }

  private executeRetry(
    config: AxiosRequestConfig, 
    handledError: ApiError, 
    group?: string
  ): Promise<AxiosResponse> {
    const retryContext = {
      attempt: (config._retryCount || 0) + 1,
      previousDelay: config._retryDelay,
      error: handledError,
      startTime: config.metadata?.startTime,
      group
    };

    config._retryCount = retryContext.attempt;
    config._retryDelay = this.retryStrategy.getStrategy(group)(retryContext);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.client(config).then(resolve).catch(reject);
      }, config._retryDelay);
    });
  }

  // ============================================================================
  // HTTP METHODS
  // ============================================================================

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.get<T>(url, config));
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.post<T>(url, data, config));
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.put<T>(url, data, config));
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.patch<T>(url, data, config));
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithRetry(() => this.client.delete<T>(url, config));
  }

  // ============================================================================
  // RETRY LOGIC
  // ============================================================================

  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        if (attempt === this.retries) {
          break;
        }

        // Don't retry on client errors (4xx) except 401
        if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 401) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
      }
    }

    throw lastError;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const apiClient = new ApiClient();
export default ApiClient;