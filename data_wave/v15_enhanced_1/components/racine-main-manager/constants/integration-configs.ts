/**
 * Integration Configuration Constants
 * ==================================
 * 
 * Comprehensive configuration constants for cross-group integration functionality,
 * including endpoint configurations, synchronization patterns, integration templates,
 * conflict resolution strategies, and monitoring thresholds.
 * 
 * These constants support seamless coordination across all 7 data governance groups.
 */

import { SystemStatus, OperationStatus } from '../types/racine-core.types';

// ============================================================================
// INTEGRATION GROUP CONFIGURATIONS
// ============================================================================

export const INTEGRATION_GROUPS = {
  DATA_SOURCES: {
    id: 'data_sources',
    name: 'Data Sources',
    endpoints: [
      '/api/datasources',
      '/api/connections',
      '/api/schemas'
    ],
    syncCapabilities: ['schema', 'metadata', 'lineage'],
    priority: 1,
    maxConcurrentConnections: 50
  },
  SCAN_RULE_SETS: {
    id: 'scan_rule_sets',
    name: 'Advanced Scan Rule Sets',
    endpoints: [
      '/api/scan-rules',
      '/api/patterns',
      '/api/classifications'
    ],
    syncCapabilities: ['rules', 'patterns', 'results'],
    priority: 2,
    maxConcurrentConnections: 30
  },
  CLASSIFICATIONS: {
    id: 'classifications',
    name: 'Classifications',
    endpoints: [
      '/api/classifications',
      '/api/labels',
      '/api/taxonomies'
    ],
    syncCapabilities: ['labels', 'hierarchies', 'rules'],
    priority: 3,
    maxConcurrentConnections: 40
  },
  COMPLIANCE_RULES: {
    id: 'compliance_rules',
    name: 'Compliance Rules',
    endpoints: [
      '/api/compliance',
      '/api/policies',
      '/api/violations'
    ],
    syncCapabilities: ['policies', 'assessments', 'violations'],
    priority: 4,
    maxConcurrentConnections: 25
  },
  ADVANCED_CATALOG: {
    id: 'advanced_catalog',
    name: 'Advanced Catalog',
    endpoints: [
      '/api/catalog',
      '/api/assets',
      '/api/lineage'
    ],
    syncCapabilities: ['assets', 'metadata', 'relationships'],
    priority: 5,
    maxConcurrentConnections: 60
  },
  ADVANCED_SCAN_LOGIC: {
    id: 'advanced_scan_logic',
    name: 'Advanced Scan Logic',
    endpoints: [
      '/api/scan-logic',
      '/api/executions',
      '/api/results'
    ],
    syncCapabilities: ['logic', 'executions', 'results'],
    priority: 6,
    maxConcurrentConnections: 35
  },
  RBAC_SYSTEM: {
    id: 'rbac_system',
    name: 'RBAC System',
    endpoints: [
      '/api/users',
      '/api/roles',
      '/api/permissions'
    ],
    syncCapabilities: ['users', 'roles', 'permissions'],
    priority: 7,
    maxConcurrentConnections: 20
  }
} as const;

export const GROUP_IDS = Object.keys(INTEGRATION_GROUPS) as Array<keyof typeof INTEGRATION_GROUPS>;
export const GROUP_PRIORITIES = Object.values(INTEGRATION_GROUPS).map(g => ({ id: g.id, priority: g.priority }));

// ============================================================================
// INTEGRATION API ENDPOINTS
// ============================================================================

export const INTEGRATION_API_ENDPOINTS = {
  // Cross-group search
  CROSS_GROUP_SEARCH: '/api/racine/integration/search',
  UNIFIED_SEARCH: '/api/racine/integration/search/unified',
  
  // Resource linking
  RESOURCE_LINKING: '/api/racine/integration/linking',
  LINK_MANAGEMENT: '/api/racine/integration/links',
  DEPENDENCY_MAPPING: '/api/racine/integration/dependencies',
  
  // Synchronization
  SYNC_ORCHESTRATION: '/api/racine/integration/sync',
  SYNC_JOBS: '/api/racine/integration/sync/jobs',
  SYNC_MONITORING: '/api/racine/integration/sync/monitor',
  
  // Health monitoring
  INTEGRATION_HEALTH: '/api/racine/integration/health',
  GROUP_HEALTH: '/api/racine/integration/health/groups',
  METRICS: '/api/racine/integration/metrics',
  
  // Analytics
  CROSS_GROUP_ANALYTICS: '/api/racine/integration/analytics',
  TREND_ANALYSIS: '/api/racine/integration/analytics/trends',
  INSIGHTS: '/api/racine/integration/analytics/insights',
  
  // Conflict resolution
  CONFLICT_DETECTION: '/api/racine/integration/conflicts',
  CONFLICT_RESOLUTION: '/api/racine/integration/conflicts/resolve',
  
  // Service registry
  SERVICE_REGISTRY: '/api/racine/integration/services',
  SERVICE_HEARTBEAT: '/api/racine/integration/services/heartbeat',
  
  // Integration endpoints
  ENDPOINT_MANAGEMENT: '/api/racine/integration/endpoints',
  ENDPOINT_TESTING: '/api/racine/integration/endpoints/test',
  
  // Integration jobs
  JOB_MANAGEMENT: '/api/racine/integration/jobs',
  JOB_EXECUTION: '/api/racine/integration/jobs/execute',
  JOB_SCHEDULING: '/api/racine/integration/jobs/schedule'
} as const;

// ============================================================================
// SYNCHRONIZATION CONFIGURATIONS
// ============================================================================

export const SYNC_PATTERNS = {
  REAL_TIME: {
    name: 'Real-time Sync',
    description: 'Immediate synchronization using event-driven architecture',
    latency: 'ms',
    reliability: 'high',
    resourceUsage: 'high',
    useCases: ['critical data', 'user permissions', 'security policies']
  },
  NEAR_REAL_TIME: {
    name: 'Near Real-time Sync',
    description: 'Sub-minute synchronization with batching',
    latency: 'seconds',
    reliability: 'high',
    resourceUsage: 'medium',
    useCases: ['metadata updates', 'classification changes', 'catalog updates']
  },
  SCHEDULED: {
    name: 'Scheduled Sync',
    description: 'Periodic synchronization at defined intervals',
    latency: 'minutes/hours',
    reliability: 'medium',
    resourceUsage: 'low',
    useCases: ['bulk data transfers', 'analytical reports', 'archival operations']
  },
  ON_DEMAND: {
    name: 'On-demand Sync',
    description: 'Manual triggering of synchronization',
    latency: 'variable',
    reliability: 'medium',
    resourceUsage: 'variable',
    useCases: ['migrations', 'one-time transfers', 'testing scenarios']
  }
} as const;

export const SYNC_DIRECTIONS = {
  UNIDIRECTIONAL: 'unidirectional',
  BIDIRECTIONAL: 'bidirectional',
  MULTI_DIRECTIONAL: 'multi_directional'
} as const;

export const SYNC_SCOPES = {
  FULL: {
    name: 'Full Synchronization',
    description: 'Complete data synchronization across all resources',
    performance: 'low',
    accuracy: 'highest'
  },
  INCREMENTAL: {
    name: 'Incremental Synchronization',
    description: 'Only synchronize changes since last sync',
    performance: 'high',
    accuracy: 'high'
  },
  SELECTIVE: {
    name: 'Selective Synchronization',
    description: 'Synchronize specific resources based on filters',
    performance: 'medium',
    accuracy: 'medium'
  },
  DELTA: {
    name: 'Delta Synchronization',
    description: 'Synchronize only differential changes',
    performance: 'highest',
    accuracy: 'high'
  }
} as const;

// ============================================================================
// CONFLICT RESOLUTION STRATEGIES
// ============================================================================

export const CONFLICT_RESOLUTION_STRATEGIES = {
  MERGE: {
    name: 'Merge Strategy',
    description: 'Combine conflicting data intelligently',
    complexity: 'high',
    accuracy: 'high',
    applicability: ['metadata conflicts', 'schema differences', 'classification overlaps']
  },
  OVERRIDE_SOURCE: {
    name: 'Source Override',
    description: 'Source data takes precedence',
    complexity: 'low',
    accuracy: 'medium',
    applicability: ['master data scenarios', 'authoritative sources', 'system migrations']
  },
  OVERRIDE_TARGET: {
    name: 'Target Override',
    description: 'Target data takes precedence',
    complexity: 'low',
    accuracy: 'medium',
    applicability: ['local customizations', 'user preferences', 'regional variations']
  },
  TIMESTAMP_BASED: {
    name: 'Timestamp Resolution',
    description: 'Most recent data wins',
    complexity: 'medium',
    accuracy: 'medium',
    applicability: ['frequent updates', 'real-time systems', 'activity logs']
  },
  MANUAL_REVIEW: {
    name: 'Manual Review',
    description: 'Require human intervention',
    complexity: 'low',
    accuracy: 'highest',
    applicability: ['critical decisions', 'complex business logic', 'compliance requirements']
  },
  RULE_BASED: {
    name: 'Rule-based Resolution',
    description: 'Apply predefined business rules',
    complexity: 'medium',
    accuracy: 'high',
    applicability: ['standardized processes', 'policy enforcement', 'automated workflows']
  }
} as const;

export const CONFLICT_TYPES = {
  DATA_MISMATCH: 'data_mismatch',
  SCHEMA_INCOMPATIBILITY: 'schema_incompatibility',
  PERMISSION_CONFLICT: 'permission_conflict',
  BUSINESS_RULE_VIOLATION: 'business_rule_violation',
  DUPLICATE_RESOURCE: 'duplicate_resource',
  DEPENDENCY_VIOLATION: 'dependency_violation',
  VERSION_CONFLICT: 'version_conflict'
} as const;

// ============================================================================
// INTEGRATION PERFORMANCE THRESHOLDS
// ============================================================================

export const INTEGRATION_PERFORMANCE_THRESHOLDS = {
  SYNC_LATENCY: {
    excellent: 100, // ms
    good: 500,
    acceptable: 2000,
    poor: 5000
  },
  THROUGHPUT: {
    excellent: 10000, // operations/second
    good: 5000,
    acceptable: 1000,
    poor: 100
  },
  ERROR_RATE: {
    excellent: 0.001, // 0.1%
    good: 0.01, // 1%
    acceptable: 0.05, // 5%
    poor: 0.1 // 10%
  },
  AVAILABILITY: {
    excellent: 0.999, // 99.9%
    good: 0.995, // 99.5%
    acceptable: 0.99, // 99%
    poor: 0.95 // 95%
  },
  RESOURCE_UTILIZATION: {
    excellent: 0.7, // 70%
    good: 0.8, // 80%
    acceptable: 0.9, // 90%
    poor: 0.95 // 95%
  }
} as const;

// ============================================================================
// INTEGRATION MONITORING CONFIGURATIONS
// ============================================================================

export const MONITORING_CONFIGS = {
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  METRICS_COLLECTION_INTERVAL: 60000, // 1 minute
  ALERT_THRESHOLD_CHECK_INTERVAL: 10000, // 10 seconds
  PERFORMANCE_SAMPLING_RATE: 0.1, // 10%
  LOG_RETENTION_DAYS: 30,
  METRICS_RETENTION_DAYS: 90,
  DASHBOARD_REFRESH_INTERVAL: 5000, // 5 seconds
  REAL_TIME_EVENTS_BUFFER_SIZE: 1000
} as const;

export const ALERT_CONFIGURATIONS = {
  CRITICAL: {
    threshold: 0.95,
    escalationTime: 300, // 5 minutes
    recipients: ['admin', 'operations'],
    channels: ['email', 'slack', 'webhook']
  },
  WARNING: {
    threshold: 0.8,
    escalationTime: 900, // 15 minutes
    recipients: ['operations'],
    channels: ['email', 'dashboard']
  },
  INFO: {
    threshold: 0.6,
    escalationTime: 3600, // 1 hour
    recipients: ['monitoring'],
    channels: ['dashboard', 'log']
  }
} as const;

// ============================================================================
// INTEGRATION TEMPLATES
// ============================================================================

export const INTEGRATION_TEMPLATES = {
  DATA_SOURCE_TO_CATALOG: {
    name: 'Data Source to Catalog Integration',
    description: 'Synchronize data source metadata with catalog',
    sourceGroup: 'data_sources',
    targetGroup: 'advanced_catalog',
    syncPattern: 'NEAR_REAL_TIME',
    conflictResolution: 'MERGE',
    transformations: [
      { field: 'schema_name', target: 'asset_name', type: 'direct' },
      { field: 'table_columns', target: 'asset_attributes', type: 'array_transform' },
      { field: 'data_types', target: 'attribute_types', type: 'mapping' }
    ],
    filters: [
      { field: 'status', operator: 'equals', value: 'active' },
      { field: 'visibility', operator: 'not_equals', value: 'hidden' }
    ]
  },
  CLASSIFICATION_TO_COMPLIANCE: {
    name: 'Classification to Compliance Integration',
    description: 'Apply compliance rules based on data classifications',
    sourceGroup: 'classifications',
    targetGroup: 'compliance_rules',
    syncPattern: 'REAL_TIME',
    conflictResolution: 'RULE_BASED',
    transformations: [
      { field: 'classification_level', target: 'compliance_level', type: 'mapping' },
      { field: 'sensitivity_tags', target: 'protection_requirements', type: 'array_transform' }
    ]
  },
  SCAN_RESULTS_TO_CATALOG: {
    name: 'Scan Results to Catalog Integration',
    description: 'Update catalog with scan results and classifications',
    sourceGroup: 'advanced_scan_logic',
    targetGroup: 'advanced_catalog',
    syncPattern: 'SCHEDULED',
    conflictResolution: 'TIMESTAMP_BASED',
    schedule: '0 */6 * * *', // Every 6 hours
    transformations: [
      { field: 'discovered_assets', target: 'catalog_assets', type: 'merge' },
      { field: 'quality_scores', target: 'asset_quality', type: 'direct' }
    ]
  },
  RBAC_TO_ALL_GROUPS: {
    name: 'RBAC to All Groups Integration',
    description: 'Propagate user permissions across all groups',
    sourceGroup: 'rbac_system',
    targetGroups: ['data_sources', 'classifications', 'compliance_rules', 'advanced_catalog', 'advanced_scan_logic'],
    syncPattern: 'REAL_TIME',
    conflictResolution: 'OVERRIDE_SOURCE',
    transformations: [
      { field: 'user_roles', target: 'access_permissions', type: 'role_mapping' },
      { field: 'group_permissions', target: 'resource_access', type: 'permission_mapping' }
    ]
  }
} as const;

// ============================================================================
// RETRY AND TIMEOUT CONFIGURATIONS
// ============================================================================

export const RETRY_CONFIGS = {
  DEFAULT: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffStrategy: 'exponential' as const,
    retryConditions: ['network_error', 'timeout', 'rate_limit', 'temporary_failure']
  },
  CRITICAL_OPERATIONS: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 60000, // 1 minute
    backoffStrategy: 'exponential' as const,
    retryConditions: ['network_error', 'timeout', 'rate_limit', 'temporary_failure', 'service_unavailable']
  },
  BACKGROUND_SYNC: {
    maxAttempts: 10,
    baseDelay: 5000, // 5 seconds
    maxDelay: 300000, // 5 minutes
    backoffStrategy: 'linear' as const,
    retryConditions: ['any']
  }
} as const;

export const TIMEOUT_CONFIGS = {
  API_REQUEST: 30000, // 30 seconds
  SYNC_OPERATION: 300000, // 5 minutes
  HEALTH_CHECK: 10000, // 10 seconds
  AUTHENTICATION: 15000, // 15 seconds
  FILE_UPLOAD: 600000, // 10 minutes
  BULK_OPERATION: 1800000, // 30 minutes
  REAL_TIME_CONNECTION: 5000 // 5 seconds
} as const;

// ============================================================================
// WEBSOCKET CONFIGURATIONS
// ============================================================================

export const WEBSOCKET_CONFIGS = {
  INTEGRATION_EVENTS: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/integration',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    subscriptionTopics: [
      'sync.progress',
      'health.update',
      'conflict.detected',
      'resolution.completed',
      'analytics.update'
    ]
  },
  MONITORING: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/monitoring',
    reconnectInterval: 3000,
    maxReconnectAttempts: 15,
    heartbeatInterval: 15000,
    subscriptionTopics: [
      'metrics.update',
      'alert.triggered',
      'performance.threshold',
      'system.status'
    ]
  }
} as const;

// ============================================================================
// CACHE CONFIGURATIONS
// ============================================================================

export const CACHE_CONFIGS = {
  INTEGRATION_METADATA: {
    ttl: 300000, // 5 minutes
    maxSize: 1000,
    strategy: 'lru'
  },
  SYNC_STATUS: {
    ttl: 60000, // 1 minute
    maxSize: 500,
    strategy: 'lru'
  },
  HEALTH_METRICS: {
    ttl: 30000, // 30 seconds
    maxSize: 200,
    strategy: 'fifo'
  },
  CONFLICT_RESOLUTIONS: {
    ttl: 600000, // 10 minutes
    maxSize: 100,
    strategy: 'lru'
  },
  ANALYTICS_DATA: {
    ttl: 900000, // 15 minutes
    maxSize: 50,
    strategy: 'lru'
  }
} as const;

// ============================================================================
// SECURITY CONFIGURATIONS
// ============================================================================

export const SECURITY_CONFIGS = {
  INTEGRATION_ENCRYPTION: {
    algorithm: 'AES-256-GCM',
    keyRotationInterval: 86400000, // 24 hours
    encryptionRequired: true
  },
  API_AUTHENTICATION: {
    tokenType: 'Bearer',
    tokenExpiration: 3600000, // 1 hour
    refreshThreshold: 300000, // 5 minutes before expiration
    requireMFA: false
  },
  AUDIT_LOGGING: {
    enabled: true,
    logLevel: 'info',
    retentionDays: 365,
    encryptLogs: true,
    includePII: false
  },
  RATE_LIMITING: {
    requestsPerMinute: 1000,
    burstLimit: 100,
    bypassRoles: ['admin', 'system']
  }
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  REAL_TIME_SYNC: true,
  ADVANCED_CONFLICT_RESOLUTION: true,
  PREDICTIVE_ANALYTICS: true,
  AUTOMATED_HEALING: false,
  EXPERIMENTAL_ALGORITHMS: false,
  PERFORMANCE_OPTIMIZATION: true,
  ENHANCED_MONITORING: true,
  MULTI_TENANT_SUPPORT: false,
  ADVANCED_SECURITY: true,
  AI_RECOMMENDATIONS: true
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getIntegrationGroupById = (id: string) => {
  return Object.values(INTEGRATION_GROUPS).find(group => group.id === id);
};

export const getEnabledIntegrationGroups = () => {
  return Object.values(INTEGRATION_GROUPS); // All groups are enabled by default
};

export const getIntegrationGroupsByPriority = () => {
  return Object.values(INTEGRATION_GROUPS).sort((a, b) => a.priority - b.priority);
};

export const buildIntegrationApiUrl = (endpoint: string, params?: Record<string, string>) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let url = `${baseUrl}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

export const getPerformanceLevel = (metric: string, value: number): string => {
  const thresholds = INTEGRATION_PERFORMANCE_THRESHOLDS[metric as keyof typeof INTEGRATION_PERFORMANCE_THRESHOLDS];
  
  if (!thresholds) return 'unknown';
  
  if (value <= thresholds.excellent) return 'excellent';
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.acceptable) return 'acceptable';
  return 'poor';
};

export const getIntegrationCacheKey = (operation: string, ...params: string[]): string => {
  return `integration:${operation}:${params.join(':')}`;
};

export const isIntegrationFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature] === true;
};

export const getSyncTemplate = (templateName: keyof typeof INTEGRATION_TEMPLATES) => {
  return INTEGRATION_TEMPLATES[templateName];
};

export const getConflictResolutionStrategy = (strategyName: keyof typeof CONFLICT_RESOLUTION_STRATEGIES) => {
  return CONFLICT_RESOLUTION_STRATEGIES[strategyName];
};

export const getRetryConfig = (operationType: keyof typeof RETRY_CONFIGS) => {
  return RETRY_CONFIGS[operationType];
};

export const getTimeoutConfig = (operationType: keyof typeof TIMEOUT_CONFIGS): number => {
  return TIMEOUT_CONFIGS[operationType];
};

export const getWebSocketConfig = (connectionType: keyof typeof WEBSOCKET_CONFIGS) => {
  return WEBSOCKET_CONFIGS[connectionType];
};

export const getCacheConfig = (cacheType: keyof typeof CACHE_CONFIGS) => {
  return CACHE_CONFIGS[cacheType];
};

export const getSecurityConfig = (securityType: keyof typeof SECURITY_CONFIGS) => {
  return SECURITY_CONFIGS[securityType];
};

export default {
  INTEGRATION_GROUPS,
  GROUP_IDS,
  GROUP_PRIORITIES,
  INTEGRATION_API_ENDPOINTS,
  SYNC_PATTERNS,
  SYNC_DIRECTIONS,
  SYNC_SCOPES,
  CONFLICT_RESOLUTION_STRATEGIES,
  CONFLICT_TYPES,
  INTEGRATION_PERFORMANCE_THRESHOLDS,
  MONITORING_CONFIGS,
  ALERT_CONFIGURATIONS,
  INTEGRATION_TEMPLATES,
  RETRY_CONFIGS,
  TIMEOUT_CONFIGS,
  WEBSOCKET_CONFIGS,
  CACHE_CONFIGS,
  SECURITY_CONFIGS,
  FEATURE_FLAGS,
  // Utility functions
  getIntegrationGroupById,
  getEnabledIntegrationGroups,
  getIntegrationGroupsByPriority,
  buildIntegrationApiUrl,
  getPerformanceLevel,
  getIntegrationCacheKey,
  isIntegrationFeatureEnabled,
  getSyncTemplate,
  getConflictResolutionStrategy,
  getRetryConfig,
  getTimeoutConfig,
  getWebSocketConfig,
  getCacheConfig,
  getSecurityConfig
};