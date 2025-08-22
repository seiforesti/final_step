import { AxiosError, AxiosResponse } from "axios";

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  rateLimits?: RateLimitConfig;
  circuitBreaker?: CircuitBreakerConfig;
  queueConfig?: QueueConfig;
  metrics?: MetricsConfig;
  errorHandling?: ErrorHandlingConfig;
  auth?: AuthConfig;
  groups?: string[];
}

export interface RateLimitConfig {
  maxRequests: number;
  perMilliseconds: number;
  maxConcurrent?: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitorInterval?: number;
}

export interface QueueConfig {
  maxSize: number;
  timeout: number;
  priorityLevels: number;
}

export interface MetricsConfig {
  enabled: boolean;
  sampleRate: number;
  customMetrics?: string[];
}

export interface ErrorHandlingConfig {
  retryableStatuses: number[];
  maxRetries: number;
  retryStrategy: "linear" | "exponential" | "custom";
  errorCallback?: (error: unknown) => void;
}

export interface AuthConfig {
  tokenRefreshThreshold: number;
  tokenRefreshRetries: number;
  autoRefreshEnabled: boolean;
}

export interface RequestMetadata {
  startTime: number;
  group?: string;
  requestId: string;
}

export interface RetryContext {
  attempt: number;
  previousDelay?: number;
  error: ApiError;
  startTime?: number;
  group?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly retryable: boolean = false,
    public readonly originalError?: Error | AxiosError
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Extend Axios types to include our custom properties
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: RequestMetadata;
    _retry?: boolean;
    _retryCount?: number;
    _retryDelay?: number;
  }
}
