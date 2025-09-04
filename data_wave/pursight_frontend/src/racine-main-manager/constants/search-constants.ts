/**
 * Search Constants for Advanced Search Functionality
 * Provides comprehensive search categories, hotkeys, and endpoint configurations
 */

// Search Categories for Advanced Filtering
export const SEARCH_CATEGORIES = {
  ALL: 'all',
  USERS: 'users',
  GROUPS: 'groups',
  WORKFLOWS: 'workflows',
  PIPELINES: 'pipelines',
  ACTIVITIES: 'activities',
  INTEGRATIONS: 'integrations',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  DOCUMENTS: 'documents',
  DATASETS: 'datasets',
  MODELS: 'models',
  JOBS: 'jobs',
  TASKS: 'tasks',
  EVENTS: 'events',
  ALERTS: 'alerts',
  CONFIGURATIONS: 'configurations',
  TEMPLATES: 'templates',
  POLICIES: 'policies',
  COMPLIANCE: 'compliance'
} as const;

// Search Hotkeys for Quick Access
export const SEARCH_HOTKEYS = {
  QUICK_SEARCH: 'ctrl+k',
  ADVANCED_SEARCH: 'ctrl+shift+k',
  SEARCH_FILTERS: 'ctrl+shift+f',
  SEARCH_HISTORY: 'ctrl+shift+h',
  CLEAR_SEARCH: 'escape',
  NEXT_RESULT: 'enter',
  PREVIOUS_RESULT: 'shift+enter',
  EXPAND_RESULTS: 'ctrl+shift+e',
  COLLAPSE_RESULTS: 'ctrl+shift+c'
} as const;

// SPA Search Endpoints Configuration
export const SPA_SEARCH_ENDPOINTS = {
  // User Management
  USERS: '/api/v1/users/search',
  USER_PROFILES: '/api/v1/users/profiles/search',
  USER_ACTIVITIES: '/api/v1/users/activities/search',
  USER_PERMISSIONS: '/api/v1/users/permissions/search',
  
  // Group Management
  GROUPS: '/api/v1/groups/search',
  GROUP_MEMBERS: '/api/v1/groups/members/search',
  GROUP_ACTIVITIES: '/api/v1/groups/activities/search',
  GROUP_PERMISSIONS: '/api/v1/groups/permissions/search',
  
  // Workflow Management
  WORKFLOWS: '/api/v1/workflows/search',
  WORKFLOW_EXECUTIONS: '/api/v1/workflows/executions/search',
  WORKFLOW_TEMPLATES: '/api/v1/workflows/templates/search',
  WORKFLOW_ANALYTICS: '/api/v1/workflows/analytics/search',
  
  // Pipeline Management
  PIPELINES: '/api/v1/pipelines/search',
  PIPELINE_EXECUTIONS: '/api/v1/pipelines/executions/search',
  PIPELINE_TEMPLATES: '/api/v1/pipelines/templates/search',
  PIPELINE_HEALTH: '/api/v1/pipelines/health/search',
  
  // Activity Tracking
  ACTIVITIES: '/api/v1/activities/search',
  ACTIVITY_SESSIONS: '/api/v1/activities/sessions/search',
  ACTIVITY_CORRELATIONS: '/api/v1/activities/correlations/search',
  ACTIVITY_REPORTS: '/api/v1/activities/reports/search',
  
  // Integration Management
  INTEGRATIONS: '/api/v1/integrations/search',
  INTEGRATION_ENDPOINTS: '/api/v1/integrations/endpoints/search',
  INTEGRATION_JOBS: '/api/v1/integrations/jobs/search',
  INTEGRATION_LOGS: '/api/v1/integrations/logs/search',
  
  // Analytics and Reporting
  REPORTS: '/api/v1/reports/search',
  ANALYTICS: '/api/v1/analytics/search',
  DASHBOARDS: '/api/v1/dashboards/search',
  METRICS: '/api/v1/metrics/search',
  
  // Data Management
  DOCUMENTS: '/api/v1/documents/search',
  DATASETS: '/api/v1/datasets/search',
  MODELS: '/api/v1/models/search',
  CATALOGS: '/api/v1/catalogs/search',
  
  // Job and Task Management
  JOBS: '/api/v1/jobs/search',
  TASKS: '/api/v1/tasks/search',
  SCHEDULES: '/api/v1/schedules/search',
  QUEUES: '/api/v1/queues/search',
  
  // System Management
  EVENTS: '/api/v1/events/search',
  ALERTS: '/api/v1/alerts/search',
  CONFIGURATIONS: '/api/v1/configurations/search',
  TEMPLATES: '/api/v1/templates/search',
  POLICIES: '/api/v1/policies/search',
  COMPLIANCE: '/api/v1/compliance/search'
} as const;

// Search Result Types
export const SEARCH_RESULT_TYPES = {
  USER: 'user',
  GROUP: 'group',
  WORKFLOW: 'workflow',
  PIPELINE: 'pipeline',
  ACTIVITY: 'activity',
  INTEGRATION: 'integration',
  REPORT: 'report',
  ANALYTIC: 'analytic',
  DOCUMENT: 'document',
  DATASET: 'dataset',
  MODEL: 'model',
  JOB: 'job',
  TASK: 'task',
  EVENT: 'event',
  ALERT: 'alert',
  CONFIGURATION: 'configuration',
  TEMPLATE: 'template',
  POLICY: 'policy',
  COMPLIANCE: 'compliance'
} as const;

// Search Filter Types
export const SEARCH_FILTER_TYPES = {
  TEXT: 'text',
  DATE_RANGE: 'date_range',
  NUMERIC_RANGE: 'numeric_range',
  CATEGORY: 'category',
  STATUS: 'status',
  PRIORITY: 'priority',
  USER: 'user',
  GROUP: 'group',
  TAG: 'tag',
  CUSTOM: 'custom'
} as const;

// Search Sort Options
export const SEARCH_SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  DATE_CREATED: 'date_created',
  DATE_MODIFIED: 'date_modified',
  NAME: 'name',
  TYPE: 'type',
  STATUS: 'status',
  PRIORITY: 'priority',
  USER: 'user',
  GROUP: 'group'
} as const;

// Search Result Limits
export const SEARCH_RESULT_LIMITS = {
  QUICK_SEARCH: 10,
  STANDARD_SEARCH: 50,
  ADVANCED_SEARCH: 100,
  EXPORT_SEARCH: 1000,
  MAX_SEARCH: 10000
} as const;

// Search Highlighting Configuration
export const SEARCH_HIGHLIGHT_CONFIG = {
  MAX_FRAGMENTS: 3,
  FRAGMENT_SIZE: 150,
  PRE_TAG: '<mark>',
  POST_TAG: '</mark>',
  HIGHLIGHT_FIELDS: ['title', 'description', 'content', 'tags', 'metadata']
} as const;

// Search Analytics Configuration
export const SEARCH_ANALYTICS_CONFIG = {
  TRACK_SEARCHES: true,
  TRACK_CLICKS: true,
  TRACK_DWELL_TIME: true,
  TRACK_CONVERSION: true,
  SESSION_TIMEOUT: 30000, // 30 seconds
  MAX_HISTORY_ITEMS: 100
} as const;

// Export all constants
export type SearchCategory = typeof SEARCH_CATEGORIES[keyof typeof SEARCH_CATEGORIES];
export type SearchHotkey = typeof SEARCH_HOTKEYS[keyof typeof SEARCH_HOTKEYS];
export type SearchEndpoint = typeof SPA_SEARCH_ENDPOINTS[keyof typeof SPA_SEARCH_ENDPOINTS];
export type SearchResultType = typeof SEARCH_RESULT_TYPES[keyof typeof SEARCH_RESULT_TYPES];
export type SearchFilterType = typeof SEARCH_FILTER_TYPES[keyof typeof SEARCH_FILTER_TYPES];
export type SearchSortOption = typeof SEARCH_SORT_OPTIONS[keyof typeof SEARCH_SORT_OPTIONS]; 