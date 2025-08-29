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
