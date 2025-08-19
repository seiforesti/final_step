// ============================================================================
// CONSTANTS INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export for all Advanced Catalog constants and configurations
// ============================================================================

// Export all endpoints
export * from './endpoints';
export { default as endpoints, ALL_ENDPOINTS } from './endpoints';

// Export all configurations
export * from './config';
export { default as config, ALL_CONFIG } from './config';

// Export collaboration constants
export * from './collaboration-constants';
export { default as collaborationConstants } from './collaboration-constants';

// ============================================================================
// COMMON CONSTANTS
// ============================================================================

/**
 * Asset types supported by the catalog
 */
export const ASSET_TYPES = {
  TABLE: 'TABLE',
  VIEW: 'VIEW',
  FILE: 'FILE',
  API: 'API',
  STREAM: 'STREAM',
  SCHEMA: 'SCHEMA',
  DATABASE: 'DATABASE',
  DASHBOARD: 'DASHBOARD',
  REPORT: 'REPORT',
  MODEL: 'MODEL'
} as const;

export type AssetType = keyof typeof ASSET_TYPES;

/**
 * Data source types
 */
export const DATA_SOURCE_TYPES = {
  POSTGRESQL: 'POSTGRESQL',
  MYSQL: 'MYSQL',
  MONGODB: 'MONGODB',
  SNOWFLAKE: 'SNOWFLAKE',
  DATABRICKS: 'DATABRICKS',
  S3: 'S3',
  AZURE_BLOB: 'AZURE_BLOB',
  GCS: 'GCS',
  REDSHIFT: 'REDSHIFT',
  BIGQUERY: 'BIGQUERY',
  ORACLE: 'ORACLE',
  SQL_SERVER: 'SQL_SERVER',
  API: 'API',
  FILE_SYSTEM: 'FILE_SYSTEM'
} as const;

export type DataSourceType = keyof typeof DATA_SOURCE_TYPES;

/**
 * Job statuses
 */
export const JOB_STATUSES = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  SCHEDULED: 'SCHEDULED',
  PAUSED: 'PAUSED'
} as const;

export type JobStatus = keyof typeof JOB_STATUSES;

/**
 * Quality rule types
 */
export const QUALITY_RULE_TYPES = {
  COMPLETENESS: 'COMPLETENESS',
  UNIQUENESS: 'UNIQUENESS',
  VALIDITY: 'VALIDITY',
  CONSISTENCY: 'CONSISTENCY',
  ACCURACY: 'ACCURACY',
  TIMELINESS: 'TIMELINESS',
  CONFORMITY: 'CONFORMITY'
} as const;

export type QualityRuleType = keyof typeof QUALITY_RULE_TYPES;

/**
 * Lineage directions
 */
export const LINEAGE_DIRECTIONS = {
  UPSTREAM: 'UPSTREAM',
  DOWNSTREAM: 'DOWNSTREAM',
  BOTH: 'BOTH'
} as const;

export type LineageDirection = keyof typeof LINEAGE_DIRECTIONS;

/**
 * Search filters
 */
export const SEARCH_FILTER_TYPES = {
  ASSET_TYPE: 'ASSET_TYPE',
  DATA_SOURCE: 'DATA_SOURCE',
  OWNER: 'OWNER',
  STEWARD: 'STEWARD',
  TAG: 'TAG',
  CLASSIFICATION: 'CLASSIFICATION',
  QUALITY_SCORE: 'QUALITY_SCORE',
  CREATED_DATE: 'CREATED_DATE',
  MODIFIED_DATE: 'MODIFIED_DATE',
  USAGE_FREQUENCY: 'USAGE_FREQUENCY'
} as const;

export type SearchFilterType = keyof typeof SEARCH_FILTER_TYPES;

/**
 * Sort orders
 */
export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC'
} as const;

export type SortOrder = keyof typeof SORT_ORDERS;

/**
 * Time ranges
 */
export const TIME_RANGES = {
  LAST_HOUR: 'LAST_HOUR',
  LAST_24_HOURS: 'LAST_24_HOURS',
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  LAST_90_DAYS: 'LAST_90_DAYS',
  LAST_YEAR: 'LAST_YEAR',
  CUSTOM: 'CUSTOM'
} as const;

export type TimeRangeType = keyof typeof TIME_RANGES;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'SUCCESS',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

/**
 * Permission levels
 */
export const PERMISSION_LEVELS = {
  READ: 'READ',
  WRITE: 'WRITE',
  DELETE: 'DELETE',
  ADMIN: 'ADMIN'
} as const;

export type PermissionLevel = keyof typeof PERMISSION_LEVELS;

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  CSV: 'CSV',
  EXCEL: 'EXCEL',
  JSON: 'JSON',
  PDF: 'PDF',
  XML: 'XML'
} as const;

export type ExportFormat = keyof typeof EXPORT_FORMATS;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Component sizes
 */
export const COMPONENT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

export type ComponentSize = keyof typeof COMPONENT_SIZES;

/**
 * Button variants
 */
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link',
  DESTRUCTIVE: 'destructive'
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

/**
 * Modal sizes
 */
export const MODAL_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extraLarge',
  FULL_SCREEN: 'fullScreen'
} as const;

export type ModalSize = keyof typeof MODAL_SIZES;

/**
 * Loading states
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

export type LoadingState = keyof typeof LOADING_STATES;

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * API error codes
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED'
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

/**
 * HTTP status codes used by the API
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'catalog_auth_token',
  REFRESH_TOKEN: 'catalog_refresh_token',
  USER_PREFERENCES: 'catalog_user_preferences',
  THEME: 'catalog_theme',
  SIDEBAR_COLLAPSED: 'catalog_sidebar_collapsed',
  RECENT_SEARCHES: 'catalog_recent_searches',
  SAVED_FILTERS: 'catalog_saved_filters',
  DASHBOARD_LAYOUT: 'catalog_dashboard_layout',
  TOUR_COMPLETED: 'catalog_tour_completed',
  ANALYTICS_OPT_OUT: 'catalog_analytics_opt_out'
} as const;

/**
 * Session storage keys
 */
export const SESSION_STORAGE_KEYS = {
  CURRENT_TAB: 'catalog_current_tab',
  SEARCH_STATE: 'catalog_search_state',
  FILTER_STATE: 'catalog_filter_state',
  PAGINATION_STATE: 'catalog_pagination_state',
  FORM_DRAFT: 'catalog_form_draft'
} as const;

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

/**
 * Analytics event names
 */
export const ANALYTICS_EVENTS = {
  // Page Views
  PAGE_VIEW: 'page_view',
  
  // Search
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_FILTER_APPLIED: 'search_filter_applied',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  
  // Asset Interactions
  ASSET_VIEWED: 'asset_viewed',
  ASSET_EDITED: 'asset_edited',
  ASSET_DELETED: 'asset_deleted',
  ASSET_SHARED: 'asset_shared',
  ASSET_DOWNLOADED: 'asset_downloaded',
  
  // Discovery
  DISCOVERY_JOB_CREATED: 'discovery_job_created',
  DISCOVERY_JOB_EXECUTED: 'discovery_job_executed',
  
  // Quality
  QUALITY_RULE_CREATED: 'quality_rule_created',
  QUALITY_ASSESSMENT_RUN: 'quality_assessment_run',
  
  // Lineage
  LINEAGE_VIEWED: 'lineage_viewed',
  LINEAGE_EXPORTED: 'lineage_exported',
  
  // User Actions
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PREFERENCES_UPDATED: 'preferences_updated',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error'
} as const;

export type AnalyticsEvent = keyof typeof ANALYTICS_EVENTS;

// ============================================================================
// REGULAR EXPRESSIONS
// ============================================================================

/**
 * Common regex patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SQL_IDENTIFIER: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  CRON: /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([0-2]?\d|3[01])) (\*|([0-9]|1[012])) (\*|([0-6]))$/
} as const;

// ============================================================================
// MIME TYPES
// ============================================================================

/**
 * Supported MIME types for file uploads
 */
export const MIME_TYPES = {
  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Text
  TXT: 'text/plain',
  CSV: 'text/csv',
  JSON: 'application/json',
  XML: 'application/xml',
  YAML: 'application/x-yaml',
  
  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
  WEBP: 'image/webp',
  
  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  TAR: 'application/x-tar',
  GZIP: 'application/gzip'
} as const;

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================

export const ALL_CONSTANTS = {
  ASSET_TYPES,
  DATA_SOURCE_TYPES,
  JOB_STATUSES,
  QUALITY_RULE_TYPES,
  LINEAGE_DIRECTIONS,
  SEARCH_FILTER_TYPES,
  SORT_ORDERS,
  TIME_RANGES,
  NOTIFICATION_TYPES,
  PERMISSION_LEVELS,
  EXPORT_FORMATS,
  COMPONENT_SIZES,
  BUTTON_VARIANTS,
  MODAL_SIZES,
  LOADING_STATES,
  ERROR_CODES,
  HTTP_STATUS,
  STORAGE_KEYS,
  SESSION_STORAGE_KEYS,
  ANALYTICS_EVENTS,
  REGEX_PATTERNS,
  MIME_TYPES
} as const;

export default ALL_CONSTANTS;