// ============================================================================
// CENTRALIZED API ERROR TYPE DEFINITIONS
// ============================================================================

/**
 * Centralized API Error interface for all Advanced Scan Rule Sets services
 * This resolves circular dependency issues and provides consistent error handling
 */

export interface APIError {
  message: string;
  code: string;
  status: number;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedAPIResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

export interface ValidationAPIError extends APIError {
  validationErrors: ValidationError[];
}

export interface RateLimitError extends APIError {
  retryAfter: number;
  limit: number;
  remaining: number;
  resetTime: string;
}

export interface AuthenticationError extends APIError {
  authType: 'token_expired' | 'invalid_credentials' | 'insufficient_permissions' | 'account_locked';
  redirectUrl?: string;
}

export interface NetworkError extends APIError {
  networkType: 'timeout' | 'connection_failed' | 'server_unavailable' | 'cors_error';
  retryable: boolean;
  retryDelay?: number;
}

// Error code constants
export const ERROR_CODES = {
  // Authentication errors
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_CONSTRAINT_VIOLATION: 'VALIDATION_CONSTRAINT_VIOLATION',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_DELETED: 'RESOURCE_DELETED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_QUOTA_EXCEEDED: 'RATE_LIMIT_QUOTA_EXCEEDED',
  
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_FAILED: 'NETWORK_CONNECTION_FAILED',
  NETWORK_SERVER_UNAVAILABLE: 'NETWORK_SERVER_UNAVAILABLE',
  NETWORK_CORS_ERROR: 'NETWORK_CORS_ERROR',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  WORKFLOW_STATE_INVALID: 'WORKFLOW_STATE_INVALID',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  
  // Collaboration errors
  COLLABORATION_CONFLICT: 'COLLABORATION_CONFLICT',
  COLLABORATION_LOCKED: 'COLLABORATION_LOCKED',
  COLLABORATION_PERMISSION_DENIED: 'COLLABORATION_PERMISSION_DENIED',
  
  // AI/ML errors
  AI_MODEL_ERROR: 'AI_MODEL_ERROR',
  AI_PREDICTION_FAILED: 'AI_PREDICTION_FAILED',
  AI_TRAINING_ERROR: 'AI_TRAINING_ERROR',
  AI_INSUFFICIENT_DATA: 'AI_INSUFFICIENT_DATA'
} as const;

// Error status codes
export const ERROR_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Error factory functions
export const createAPIError = (
  message: string,
  code: string,
  status: number = 500,
  details?: any
): APIError => ({
  message,
  code,
  status,
  details,
  timestamp: new Date().toISOString(),
  requestId: generateRequestId()
});

export const createValidationError = (
  message: string,
  validationErrors: ValidationError[]
): ValidationAPIError => ({
  message,
  code: ERROR_CODES.VALIDATION_FAILED,
  status: ERROR_STATUS_CODES.UNPROCESSABLE_ENTITY,
  validationErrors,
  timestamp: new Date().toISOString(),
  requestId: generateRequestId()
});

export const createRateLimitError = (
  message: string,
  retryAfter: number,
  limit: number,
  remaining: number
): RateLimitError => ({
  message,
  code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  status: ERROR_STATUS_CODES.TOO_MANY_REQUESTS,
  retryAfter,
  limit,
  remaining,
  resetTime: new Date(Date.now() + retryAfter * 1000).toISOString(),
  timestamp: new Date().toISOString(),
  requestId: generateRequestId()
});

export const createAuthenticationError = (
  message: string,
  authType: AuthenticationError['authType'],
  redirectUrl?: string
): AuthenticationError => ({
  message,
  code: ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
  status: ERROR_STATUS_CODES.UNAUTHORIZED,
  authType,
  redirectUrl,
  timestamp: new Date().toISOString(),
  requestId: generateRequestId()
});

// Utility functions
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isAPIError = (error: any): error is APIError => {
  return error && typeof error === 'object' && 'message' in error && 'code' in error && 'status' in error;
};

export const isValidationError = (error: any): error is ValidationAPIError => {
  return isAPIError(error) && 'validationErrors' in error;
};

export const isRateLimitError = (error: any): error is RateLimitError => {
  return isAPIError(error) && 'retryAfter' in error;
};

export const isAuthenticationError = (error: any): error is AuthenticationError => {
  return isAPIError(error) && 'authType' in error;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return isAPIError(error) && 'networkType' in error;
};

