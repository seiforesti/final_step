// ============================================================================
// ADVANCED CATALOG TYPES INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export for all Advanced-Catalog TypeScript types
// ============================================================================

// =============================================================================
// CORE CATALOG TYPES
// =============================================================================
export * from './catalog-core.types';

// =============================================================================
// DISCOVERY TYPES
// =============================================================================
export * from './discovery.types';

// =============================================================================
// QUALITY TYPES
// =============================================================================
export * from './quality.types';

// =============================================================================
// ANALYTICS TYPES
// =============================================================================
export * from './analytics.types';

// =============================================================================
// LINEAGE TYPES
// =============================================================================
export * from './lineage.types';

// =============================================================================
// SEARCH TYPES
// =============================================================================
export * from './search.types';

// =============================================================================
// COLLABORATION TYPES
// =============================================================================
export * from './collaboration.types';

// =============================================================================
// METADATA & GOVERNANCE TYPES
// =============================================================================
export * from './metadata.types';

// =============================================================================
// COMMON UTILITY TYPES
// =============================================================================

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: Date;
  requestId: string;
}

// Generic Pagination
export interface Pagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Generic Sort Options
export interface SortOption {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Generic Filter
export interface GenericFilter {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'IN' | 'BETWEEN' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
}

// Time Range
export interface TimeRange {
  start: Date;
  end: Date;
}

// User Context
export interface UserContext {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  preferences: Record<string, any>;
}

// System Context
export interface SystemContext {
  environment: string;
  version: string;
  buildNumber: string;
  deploymentId: string;
  region: string;
}

// Error Details
export interface ErrorDetail {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// Validation Result
export interface ValidationResult {
  valid: boolean;
  errors: ErrorDetail[];
  warnings: ErrorDetail[];
}

// Progress Indicator
export interface ProgressIndicator {
  percentage: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  estimatedTimeRemaining?: number;
  message?: string;
}

// Health Check Result
export interface HealthCheckResult {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  checks: HealthCheck[];
  timestamp: Date;
  version: string;
}

export interface HealthCheck {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  duration: number;
  message?: string;
  details?: Record<string, any>;
}

// Notification
export interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  primary?: boolean;
}

// Audit Entry
export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Configuration Setting
export interface ConfigurationSetting {
  key: string;
  value: any;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ARRAY';
  description?: string;
  required: boolean;
  sensitive: boolean;
  category: string;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'REQUIRED' | 'MIN_LENGTH' | 'MAX_LENGTH' | 'PATTERN' | 'RANGE' | 'ENUM';
  value?: any;
  message?: string;
}

// Feature Flag
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  conditions?: FeatureFlagCondition[];
  metadata?: Record<string, any>;
}

export interface FeatureFlagCondition {
  type: 'USER' | 'ROLE' | 'ENVIRONMENT' | 'REGION' | 'CUSTOM';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'CONTAINS';
  value: any;
}

// Performance Metrics
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
  threshold?: {
    warning: number;
    critical: number;
  };
}

// Resource Usage
export interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  timestamp: Date;
}

// Cache Statistics
export interface CacheStatistics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  size: number;
  maxSize: number;
  memoryUsage: number;
}

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

// Type guard for checking if an object is an API response
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj === 'object' && 'success' in obj && 'data' in obj;
}

// Type guard for checking if an object is an error
export function isErrorDetail(obj: any): obj is ErrorDetail {
  return obj && typeof obj === 'object' && 'code' in obj && 'message' in obj;
}

// Type guard for checking if an object is a validation result
export function isValidationResult(obj: any): obj is ValidationResult {
  return obj && typeof obj === 'object' && 'valid' in obj && 'errors' in obj;
}

// Utility type for making all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Utility type for making all properties required recursively
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Utility type for picking properties by value type
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

// Utility type for omitting properties by value type
export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// Utility type for creating a union of all possible key paths
export type KeyPath<T> = T extends object ? {
  [K in keyof T]: K extends string ? K | `${K}.${KeyPath<T[K]>}` : never;
}[keyof T] : never;

// Utility type for getting the value type at a specific key path
export type ValueAtPath<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? ValueAtPath<T[K], Rest>
    : never
  : never;

// =============================================================================
// CONSTANTS
// =============================================================================

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  size: 20,
  maxSize: 100
} as const;

// Common date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  HUMAN_READABLE: 'MMM DD, YYYY HH:mm:ss',
  SHORT: 'MM/DD/YYYY'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// Common MIME types
export const MIME_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  CSV: 'text/csv',
  PDF: 'application/pdf',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ZIP: 'application/zip',
  TEXT: 'text/plain'
} as const;

// =============================================================================
// BRAND TYPES FOR TYPE SAFETY
// =============================================================================

// Branded types for preventing accidental mixing of similar primitive types
export type AssetId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };
export type SessionId = string & { readonly brand: unique symbol };
export type RequestId = string & { readonly brand: unique symbol };
export type CorrelationId = string & { readonly brand: unique symbol };

// Helper functions to create branded types
export const createAssetId = (id: string): AssetId => id as AssetId;
export const createUserId = (id: string): UserId => id as UserId;
export const createSessionId = (id: string): SessionId => id as SessionId;
export const createRequestId = (id: string): RequestId => id as RequestId;
export const createCorrelationId = (id: string): CorrelationId => id as CorrelationId;

// =============================================================================
// ENVIRONMENT TYPES
// =============================================================================

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface EnvironmentConfig {
  name: Environment;
  apiBaseUrl: string;
  wsBaseUrl: string;
  enableDebug: boolean;
  enableAnalytics: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  features: Record<string, boolean>;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  data: Record<string, any>;
  metadata: EventMetadata;
  timestamp: Date;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  traceId?: string;
  source: string;
}

// =============================================================================
// COMMAND TYPES
// =============================================================================

export interface Command {
  id: string;
  type: string;
  aggregateId: string;
  payload: Record<string, any>;
  metadata: CommandMetadata;
}

export interface CommandMetadata {
  correlationId?: string;
  userId?: string;
  timestamp: Date;
  version?: number;
}

export interface CommandResult<T = any> {
  success: boolean;
  data?: T;
  events?: DomainEvent[];
  errors?: ErrorDetail[];
}

// =============================================================================
// QUERY TYPES
// =============================================================================

export interface Query {
  type: string;
  parameters: Record<string, any>;
  metadata: QueryMetadata;
}

export interface QueryMetadata {
  correlationId?: string;
  userId?: string;
  timestamp: Date;
  timeout?: number;
}

export interface QueryResult<T = any> {
  data: T;
  metadata: QueryResultMetadata;
}

export interface QueryResultMetadata {
  executionTime: number;
  cacheHit: boolean;
  pagination?: Pagination;
  totalCount?: number;
}