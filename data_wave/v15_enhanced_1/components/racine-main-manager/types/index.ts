/**
 * Racine Main Manager Types - Index
 * =================================
 *
 * Central export for all TypeScript type definitions used throughout
 * the Racine Main Manager frontend components.
 */

// Core types that map 100% to backend models
export * from './racine-core.types';

// API request/response types
export * from './api.types';

// Advanced analytics and intelligence types
export * from './advanced-analytics.types';

// Cost optimization and budget management types
export * from './cost-optimization.types';

// Enterprise security and compliance types
export * from './enterprise-security.types';

// Collaboration and reporting types
export * from './collaboration-reporting.types';

// Streaming and integration types
export * from './streaming-integration.types';

// Re-export commonly used types for convenience
export type {
  UUID,
  ISODateString,
  JSONValue,
  JSONObject,
  JSONArray
} from './racine-core.types';

export type {
  APIResponse,
  APIError,
  PaginationRequest,
  PaginationInfo,
  FilterRequest,
  SortRequest,
  RequestOptions,
  ResponseMetadata
} from './api.types';