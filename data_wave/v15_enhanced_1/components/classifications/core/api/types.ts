// Export type definitions from core types
export * from "../types";

// API-specific type definitions
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface ApiInstance {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface ApiRequestConfig {
  method?: string;
  url?: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  signal?: AbortSignal;
}

export interface ApiResponseInterceptor {
  onSuccess?: (response: any) => any;
  onError?: (error: any) => any;
}

export interface ApiRequestInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig;
  onRequestError?: (error: any) => any;
}

// WebSocket API types
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  autoReconnect?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id: string;
}

export interface WebSocketSubscription {
  channel: string;
  callback: (message: WebSocketMessage) => void;
  filters?: Record<string, any>;
}

// AI API specific types
export interface AIModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface AIStreamConfig extends AIModelConfig {
  onProgress?: (chunk: string) => void;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
}

// ML API specific types
export interface MLPredictionConfig {
  modelId: string;
  version?: string;
  batchSize?: number;
  threshold?: number;
  includeMetadata?: boolean;
  includeConfidence?: boolean;
}

export interface MLTrainingConfig {
  modelId: string;
  datasetId: string;
  hyperparameters?: Record<string, any>;
  validationSplit?: number;
  epochs?: number;
  batchSize?: number;
  callbacks?: Array<(metrics: any) => void>;
}

// Classification API specific types
export interface ClassificationConfig {
  frameworkId?: string;
  rules?: string[];
  confidence?: number;
  includeMetadata?: boolean;
  async?: boolean;
}

export interface ClassificationBatchConfig extends ClassificationConfig {
  concurrency?: number;
  chunkSize?: number;
  onProgress?: (progress: number) => void;
}

// Middleware types
export interface MiddlewareConfig {
  order?: number;
  enabled?: boolean;
  options?: Record<string, any>;
}

export interface AuthMiddlewareConfig extends MiddlewareConfig {
  tokenKey?: string;
  tokenType?: string;
  refreshToken?: boolean;
  refreshThreshold?: number;
}

export interface CacheMiddlewareConfig extends MiddlewareConfig {
  ttl?: number;
  maxSize?: number;
  invalidateOnMutation?: boolean;
}

export interface RetryMiddlewareConfig extends MiddlewareConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

// Response transformer types
export interface TransformerConfig {
  enabled?: boolean;
  options?: Record<string, any>;
}

export interface DataTransformer {
  transform: (data: any) => any;
  reverse?: (data: any) => any;
}
