/**
 * Cross-Group Configuration Constants
 * ==================================
 *
 * Comprehensive configuration constants for all 7 data governance groups,
 * API endpoints, performance thresholds, layout presets, and integration
 * settings for the Racine Main Manager.
 */

import { SystemStatus, OperationStatus, HealthStatus } from '../types/racine-core.types';

// ============================================================================
// VIEW AND LAYOUT MODES
// ============================================================================

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
  CARD: 'card',
  DETAIL: 'detail',
  COMPACT: 'compact',
  EXPANDED: 'expanded',
  CUSTOM: 'custom'
} as const;

export const LAYOUT_MODES = {
  SIDEBAR: 'sidebar',
  TOPBAR: 'topbar',
  FULLSCREEN: 'fullscreen',
  SPLIT: 'split',
  DOCKED: 'docked',
  FLOATING: 'floating',
  RESPONSIVE: 'responsive',
  CUSTOM: 'custom'
} as const;

// Sidebar dimensions
export const DEFAULT_SIDEBAR_WIDTH = 280;
export const COLLAPSED_SIDEBAR_WIDTH = 64;
export const MIN_SIDEBAR_WIDTH = 200;
export const MAX_SIDEBAR_WIDTH = 400;

// Layout configuration
export const DEFAULT_LAYOUT_CONFIG = {
  sidebar: {
    width: DEFAULT_SIDEBAR_WIDTH,
    collapsedWidth: COLLAPSED_SIDEBAR_WIDTH,
    minWidth: MIN_SIDEBAR_WIDTH,
    maxWidth: MAX_SIDEBAR_WIDTH,
  },
  header: {
    height: 64,
    collapsedHeight: 48,
  },
  content: {
    padding: 24,
    maxWidth: 1200,
  },
};

// Layout animations
export const LAYOUT_ANIMATIONS = {
  sidebar: {
    expand: { width: DEFAULT_SIDEBAR_WIDTH },
    collapse: { width: COLLAPSED_SIDEBAR_WIDTH },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  content: {
    slide: { x: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

// Responsive breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Health check configuration
export const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// ============================================================================
// SUPPORTED GROUPS CONFIGURATION
// ============================================================================

export const SUPPORTED_GROUPS = {
  DATA_SOURCES: {
    id: 'data_sources',
    name: 'Data Sources',
    description: 'Comprehensive data source management and connectivity',
    icon: 'Database',
    color: '#3B82F6',
    priority: 1,
    enabled: true,
    services: [
      'DataSourceService',
      'ConnectionPoolService',
      'CredentialManagementService'
    ],
    capabilities: [
      'connection_management',
      'schema_discovery',
      'data_profiling',
      'health_monitoring',
      'performance_optimization'
    ]
  },
  SCAN_RULE_SETS: {
    id: 'scan_rule_sets',
    name: 'Advanced Scan Rule Sets',
    description: 'Enterprise-grade scanning rules and patterns',
    icon: 'Search',
    color: '#10B981',
    priority: 2,
    enabled: true,
    services: [
      'EnterpriseScanRuleService',
      'PatternMatchingService',
      'RegexOptimizationService'
    ],
    capabilities: [
      'pattern_management',
      'rule_validation',
      'performance_tuning',
      'custom_rules',
      'rule_versioning'
    ]
  },
  CLASSIFICATIONS: {
    id: 'classifications',
    name: 'Classifications',
    description: 'Intelligent data classification and tagging',
    icon: 'Tag',
    color: '#8B5CF6',
    priority: 3,
    enabled: true,
    services: [
      'EnterpriseClassificationService',
      'MLClassificationService',
      'AutoTaggingService'
    ],
    capabilities: [
      'auto_classification',
      'custom_taxonomies',
      'ml_suggestions',
      'compliance_mapping',
      'sensitivity_detection'
    ]
  },
  COMPLIANCE_RULES: {
    id: 'compliance_rules',
    name: 'Compliance Rules',
    description: 'Advanced compliance and regulatory management',
    icon: 'Shield',
    color: '#F59E0B',
    priority: 4,
    enabled: true,
    services: [
      'ComplianceRuleService',
      'RegulatoryFrameworkService',
      'AuditTrailService'
    ],
    capabilities: [
      'regulatory_frameworks',
      'policy_enforcement',
      'audit_trails',
      'violation_detection',
      'remediation_workflows'
    ]
  },
  ADVANCED_CATALOG: {
    id: 'advanced_catalog',
    name: 'Advanced Catalog',
    description: 'Intelligent enterprise data catalog',
    icon: 'BookOpen',
    color: '#EF4444',
    priority: 5,
    enabled: true,
    services: [
      'EnterpriseIntelligentCatalogService',
      'MetadataManagementService',
      'LineageTrackingService'
    ],
    capabilities: [
      'metadata_management',
      'data_lineage',
      'impact_analysis',
      'search_discovery',
      'business_glossary'
    ]
  },
  SCAN_LOGIC: {
    id: 'scan_logic',
    name: 'Advanced Scan Logic',
    description: 'Unified scanning orchestration and execution',
    icon: 'Zap',
    color: '#06B6D4',
    priority: 6,
    enabled: true,
    services: [
      'UnifiedScanOrchestrator',
      'ScanExecutionService',
      'ResultAggregationService'
    ],
    capabilities: [
      'scan_orchestration',
      'parallel_execution',
      'result_aggregation',
      'performance_optimization',
      'incremental_scanning'
    ]
  },
  RBAC_SYSTEM: {
    id: 'rbac_system',
    name: 'RBAC System',
    description: 'Role-based access control and security',
    icon: 'Lock',
    color: '#84CC16',
    priority: 7,
    enabled: true,
    services: [
      'RBACService',
      'PermissionManagementService',
      'AccessControlService'
    ],
    capabilities: [
      'role_management',
      'permission_enforcement',
      'access_auditing',
      'policy_administration',
      'delegation_support'
    ]
  }
} as const;

export const GROUP_IDS = Object.keys(SUPPORTED_GROUPS) as Array<keyof typeof SUPPORTED_GROUPS>;

export const GROUP_PRIORITIES = Object.values(SUPPORTED_GROUPS)
  .sort((a, b) => a.priority - b.priority)
  .map(group => group.id);

// ============================================================================
// API ENDPOINTS CONFIGURATION
// ============================================================================

export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // Racine Main Manager Endpoints
  RACINE: {
    ORCHESTRATION: {
      BASE: '/api/racine/orchestration',
      CREATE: '/api/racine/orchestration/create',
      UPDATE: '/api/racine/orchestration/{id}/update',
      DELETE: '/api/racine/orchestration/{id}/delete',
      GET: '/api/racine/orchestration/{id}',
      LIST: '/api/racine/orchestration/list',
      HEALTH: '/api/racine/orchestration/health',
      EXECUTE: '/api/racine/orchestration/{id}/execute',
      STATUS: '/api/racine/orchestration/{id}/status',
      LOGS: '/api/racine/orchestration/{id}/logs',
      METRICS: '/api/racine/orchestration/{id}/metrics',
      OPTIMIZE: '/api/racine/orchestration/{id}/optimize'
    },
    WORKSPACE: {
      BASE: '/api/racine/workspace',
      CREATE: '/api/racine/workspace/create',
      UPDATE: '/api/racine/workspace/{id}/update',
      DELETE: '/api/racine/workspace/{id}/delete',
      GET: '/api/racine/workspace/{id}',
      LIST: '/api/racine/workspace/list',
      RESOURCES: '/api/racine/workspace/{id}/resources',
      MEMBERS: '/api/racine/workspace/{id}/members',
      ANALYTICS: '/api/racine/workspace/{id}/analytics',
      TEMPLATES: '/api/racine/workspace/templates'
    },
    WORKFLOW: {
      BASE: '/api/racine/workflows',
      CREATE: '/api/racine/workflows/create',
      UPDATE: '/api/racine/workflows/{id}/update',
      DELETE: '/api/racine/workflows/{id}/delete',
      GET: '/api/racine/workflows/{id}',
      LIST: '/api/racine/workflows/list',
      EXECUTE: '/api/racine/workflows/{id}/execute',
      STATUS: '/api/racine/workflows/{id}/status',
      CONTROL: '/api/racine/workflows/{id}/control',
      HISTORY: '/api/racine/workflows/{id}/history',
      LOGS: '/api/racine/workflows/{id}/logs',
      VALIDATE: '/api/racine/workflows/{id}/validate',
      OPTIMIZE: '/api/racine/workflows/{id}/optimize'
    },
    PIPELINE: {
      BASE: '/api/racine/pipelines',
      CREATE: '/api/racine/pipelines/create',
      UPDATE: '/api/racine/pipelines/{id}/update',
      DELETE: '/api/racine/pipelines/{id}/delete',
      GET: '/api/racine/pipelines/{id}',
      LIST: '/api/racine/pipelines/list',
      EXECUTE: '/api/racine/pipelines/{id}/execute',
      STATUS: '/api/racine/pipelines/{id}/status',
      HEALTH: '/api/racine/pipelines/{id}/health',
      OPTIMIZE: '/api/racine/pipelines/{id}/optimize',
      MONITORING: '/api/racine/pipelines/{id}/monitoring'
    },
    AI_ASSISTANT: {
      BASE: '/api/racine/ai-assistant',
      CHAT: '/api/racine/ai-assistant/chat',
      ANALYZE: '/api/racine/ai-assistant/analyze',
      RECOMMEND: '/api/racine/ai-assistant/recommend',
      OPTIMIZE: '/api/racine/ai-assistant/optimize',
      CONTEXT: '/api/racine/ai-assistant/context',
      HISTORY: '/api/racine/ai-assistant/history'
    },
    ACTIVITY: {
      BASE: '/api/racine/activity',
      LIST: '/api/racine/activity/list',
      GET: '/api/racine/activity/{id}',
      ANALYTICS: '/api/racine/activity/analytics',
      EXPORT: '/api/racine/activity/export',
      CORRELATE: '/api/racine/activity/correlate'
    },
    DASHBOARD: {
      BASE: '/api/racine/dashboards',
      CREATE: '/api/racine/dashboards/create',
      UPDATE: '/api/racine/dashboards/{id}/update',
      DELETE: '/api/racine/dashboards/{id}/delete',
      GET: '/api/racine/dashboards/{id}',
      LIST: '/api/racine/dashboards/list',
      WIDGETS: '/api/racine/dashboards/{id}/widgets',
      ANALYTICS: '/api/racine/dashboards/{id}/analytics',
      EXPORT: '/api/racine/dashboards/{id}/export'
    },
    COLLABORATION: {
      BASE: '/api/racine/collaboration',
      START: '/api/racine/collaboration/start',
      JOIN: '/api/racine/collaboration/{id}/join',
      LEAVE: '/api/racine/collaboration/{id}/leave',
      MESSAGE: '/api/racine/collaboration/{id}/message',
      SHARE: '/api/racine/collaboration/{id}/share',
      HISTORY: '/api/racine/collaboration/{id}/history'
    },
    INTEGRATION: {
      BASE: '/api/racine/integration',
      CREATE: '/api/racine/integration/create',
      UPDATE: '/api/racine/integration/{id}/update',
      DELETE: '/api/racine/integration/{id}/delete',
      GET: '/api/racine/integration/{id}',
      LIST: '/api/racine/integration/list',
      EXECUTE: '/api/racine/integration/{id}/execute',
      SYNC: '/api/racine/integration/{id}/sync',
      HEALTH: '/api/racine/integration/{id}/health',
      RESOURCES: '/api/racine/integration/resources'
    }
  },

  // Group-Specific Endpoints
  DATA_SOURCES: {
    BASE: '/api/data-sources',
    LIST: '/api/data-sources',
    CREATE: '/api/data-sources',
    GET: '/api/data-sources/{id}',
    UPDATE: '/api/data-sources/{id}',
    DELETE: '/api/data-sources/{id}',
    TEST: '/api/data-sources/{id}/test',
    SCHEMA: '/api/data-sources/{id}/schema',
    STATS: '/api/data-sources/{id}/stats'
  },

  SCAN_RULES: {
    BASE: '/api/enterprise-scan-rules',
    LIST: '/api/enterprise-scan-rules',
    CREATE: '/api/enterprise-scan-rules',
    GET: '/api/enterprise-scan-rules/{id}',
    UPDATE: '/api/enterprise-scan-rules/{id}',
    DELETE: '/api/enterprise-scan-rules/{id}',
    TEST: '/api/enterprise-scan-rules/{id}/test',
    VALIDATE: '/api/enterprise-scan-rules/{id}/validate'
  },

  CLASSIFICATIONS: {
    BASE: '/api/enterprise-classifications',
    LIST: '/api/enterprise-classifications',
    CREATE: '/api/enterprise-classifications',
    GET: '/api/enterprise-classifications/{id}',
    UPDATE: '/api/enterprise-classifications/{id}',
    DELETE: '/api/enterprise-classifications/{id}',
    SUGGEST: '/api/enterprise-classifications/suggest',
    APPLY: '/api/enterprise-classifications/{id}/apply'
  },

  COMPLIANCE: {
    BASE: '/api/compliance-rules',
    LIST: '/api/compliance-rules',
    CREATE: '/api/compliance-rules',
    GET: '/api/compliance-rules/{id}',
    UPDATE: '/api/compliance-rules/{id}',
    DELETE: '/api/compliance-rules/{id}',
    VALIDATE: '/api/compliance-rules/{id}/validate',
    AUDIT: '/api/compliance-rules/{id}/audit'
  },

  CATALOG: {
    BASE: '/api/enterprise-catalog',
    SEARCH: '/api/enterprise-catalog/search',
    GET: '/api/enterprise-catalog/{id}',
    UPDATE: '/api/enterprise-catalog/{id}',
    LINEAGE: '/api/enterprise-catalog/{id}/lineage',
    IMPACT: '/api/enterprise-catalog/{id}/impact',
    STATS: '/api/enterprise-catalog/stats'
  },

  SCAN_ORCHESTRATOR: {
    BASE: '/api/unified-scan',
    EXECUTE: '/api/unified-scan/execute',
    STATUS: '/api/unified-scan/{id}/status',
    RESULTS: '/api/unified-scan/{id}/results',
    HISTORY: '/api/unified-scan/history',
    CANCEL: '/api/unified-scan/{id}/cancel'
  },

  RBAC: {
    BASE: '/api/rbac',
    ROLES: '/api/rbac/roles',
    PERMISSIONS: '/api/rbac/permissions',
    ASSIGN: '/api/rbac/assign',
    REVOKE: '/api/rbac/revoke',
    CHECK: '/api/rbac/check',
    AUDIT: '/api/rbac/audit'
  }
} as const;

// ============================================================================
// COLLABORATION CONFIGURATION
// ============================================================================

export const COLLABORATION_CONFIG = {
  REAL_TIME_SYNC: {
    enabled: true,
    interval: 1000,
    maxRetries: 3,
    timeout: 5000
  },
  
  CONFLICT_RESOLUTION: {
    strategy: 'last-write-wins',
    autoResolve: true,
    notifyOnConflict: true,
    backupOnConflict: true
  },
  
  SHARING: {
    allowPublicSharing: false,
    allowExternalSharing: false,
    requireApproval: true,
    expirationEnabled: true,
    defaultExpirationDays: 30
  },
  
  PERMISSIONS: {
    read: ['view', 'comment'],
    write: ['edit', 'delete'],
    admin: ['share', 'manage', 'delete']
  }
};

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIMES: {
    EXCELLENT: 100,
    GOOD: 300,
    ACCEPTABLE: 1000,
    POOR: 3000,
    CRITICAL: 5000
  },
  
  THROUGHPUT: {
    HIGH: 1000,
    MEDIUM: 500,
    LOW: 100,
    MINIMAL: 10
  },
  
  ERROR_RATES: {
    EXCELLENT: 0.001,
    GOOD: 0.01,
    ACCEPTABLE: 0.05,
    POOR: 0.1,
    CRITICAL: 0.2
  },
  
  RESOURCE_UTILIZATION: {
    CPU: {
      WARNING: 70,
      CRITICAL: 90
    },
    MEMORY: {
      WARNING: 80,
      CRITICAL: 95
    },
    DISK: {
      WARNING: 85,
      CRITICAL: 95
    }
  },
  
  NETWORK: {
    LATENCY: {
      EXCELLENT: 10,
      GOOD: 50,
      ACCEPTABLE: 100,
      POOR: 300,
      CRITICAL: 1000
    },
    BANDWIDTH: {
      HIGH: 100,
      MEDIUM: 50,
      LOW: 10,
      MINIMAL: 1
    }
  }
};

// ============================================================================
// ACCESSIBILITY STANDARDS
// ============================================================================

export const ACCESSIBILITY_STANDARDS = {
  WCAG_2_1_AAA: {
    contrastRatio: 7.0,
    fontSize: 18,
    lineHeight: 1.5,
    focusIndicator: true,
    keyboardNavigation: true,
    screenReaderSupport: true
  },
  
  KEYBOARD_NAVIGATION: {
    tabOrder: 'logical',
    focusTrapping: true,
    escapeKey: true,
    arrowKeys: true,
    enterKey: true,
    spaceKey: true
  },
  
  SCREEN_READER: {
    ariaLabels: true,
    ariaDescribedby: true,
    ariaLive: true,
    ariaAtomic: true,
    roleAttributes: true,
    semanticHTML: true
  },
  
  VISUAL_ACCESSIBILITY: {
    highContrast: true,
    largeText: true,
    reducedMotion: true,
    colorBlindness: true,
    focusIndicators: true
  },
  
  AUDIO_ACCESSIBILITY: {
    captions: true,
    transcripts: true,
    audioDescriptions: true,
    volumeControl: true,
    muteOption: true
  }
};

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

export const LAYOUT_PRESETS = {
  DEFAULT: {
    id: 'default',
    name: 'Default Layout',
    description: 'Standard layout for general use',
    sidebar: {
      width: 280,
      collapsed: false,
      position: 'left'
    },
    navbar: {
      height: 64,
      fixed: true,
      transparent: false
    },
    content: {
      padding: 24,
      maxWidth: '100%',
      centered: false
    },
    footer: {
      height: 48,
      visible: true
    }
  },

  COMPACT: {
    id: 'compact',
    name: 'Compact Layout',
    description: 'Space-efficient layout for smaller screens',
    sidebar: {
      width: 240,
      collapsed: true,
      position: 'left'
    },
    navbar: {
      height: 56,
      fixed: true,
      transparent: false
    },
    content: {
      padding: 16,
      maxWidth: '100%',
      centered: false
    },
    footer: {
      height: 40,
      visible: false
    }
  },

  DASHBOARD: {
    id: 'dashboard',
    name: 'Dashboard Layout',
    description: 'Optimized for dashboard and analytics views',
    sidebar: {
      width: 320,
      collapsed: false,
      position: 'left'
    },
    navbar: {
      height: 72,
      fixed: true,
      transparent: true
    },
    content: {
      padding: 32,
      maxWidth: '100%',
      centered: false
    },
    footer: {
      height: 0,
      visible: false
    }
  },

  WORKFLOW: {
    id: 'workflow',
    name: 'Workflow Layout',
    description: 'Optimized for workflow and pipeline management',
    sidebar: {
      width: 300,
      collapsed: false,
      position: 'left'
    },
    navbar: {
      height: 64,
      fixed: true,
      transparent: false
    },
    content: {
      padding: 20,
      maxWidth: '100%',
      centered: false
    },
    footer: {
      height: 56,
      visible: true
    }
  },

  MOBILE: {
    id: 'mobile',
    name: 'Mobile Layout',
    description: 'Mobile-optimized layout',
    sidebar: {
      width: '100%',
      collapsed: true,
      position: 'left'
    },
    navbar: {
      height: 56,
      fixed: true,
      transparent: false
    },
    content: {
      padding: 12,
      maxWidth: '100%',
      centered: false
    },
    footer: {
      height: 48,
      visible: true
    }
  }
} as const;

export const LAYOUT_BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
} as const;

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

export const STATUS_CONFIGS = {
  SYSTEM_STATUS: {
    [SystemStatus.HEALTHY]: {
      color: '#10B981',
      icon: 'CheckCircle',
      label: 'Healthy',
      description: 'All systems operating normally'
    },
    [SystemStatus.DEGRADED]: {
      color: '#F59E0B',
      icon: 'AlertTriangle',
      label: 'Degraded',
      description: 'Some systems experiencing issues'
    },
    [SystemStatus.FAILED]: {
      color: '#EF4444',
      icon: 'XCircle',
      label: 'Failed',
      description: 'Critical system failures detected'
    },
    [SystemStatus.MAINTENANCE]: {
      color: '#8B5CF6',
      icon: 'Tool',
      label: 'Maintenance',
      description: 'System under maintenance'
    },
    [SystemStatus.INITIALIZING]: {
      color: '#06B6D4',
      icon: 'Loader',
      label: 'Initializing',
      description: 'System starting up'
    }
  },

  OPERATION_STATUS: {
    [OperationStatus.PENDING]: {
      color: '#6B7280',
      icon: 'Clock',
      label: 'Pending',
      description: 'Operation waiting to start'
    },
    [OperationStatus.RUNNING]: {
      color: '#06B6D4',
      icon: 'Play',
      label: 'Running',
      description: 'Operation in progress'
    },
    [OperationStatus.COMPLETED]: {
      color: '#10B981',
      icon: 'CheckCircle',
      label: 'Completed',
      description: 'Operation completed successfully'
    },
    [OperationStatus.FAILED]: {
      color: '#EF4444',
      icon: 'XCircle',
      label: 'Failed',
      description: 'Operation failed with errors'
    },
    [OperationStatus.CANCELLED]: {
      color: '#F59E0B',
      icon: 'StopCircle',
      label: 'Cancelled',
      description: 'Operation was cancelled'
    },
    [OperationStatus.PAUSED]: {
      color: '#8B5CF6',
      icon: 'Pause',
      label: 'Paused',
      description: 'Operation is paused'
    }
  },

  HEALTH_STATUS: {
    [HealthStatus.HEALTHY]: {
      color: '#10B981',
      icon: 'Heart',
      label: 'Healthy',
      description: 'Component is healthy'
    },
    [HealthStatus.WARNING]: {
      color: '#F59E0B',
      icon: 'AlertTriangle',
      label: 'Warning',
      description: 'Component has warnings'
    },
    [HealthStatus.CRITICAL]: {
      color: '#EF4444',
      icon: 'AlertCircle',
      label: 'Critical',
      description: 'Component is in critical state'
    },
    [HealthStatus.UNKNOWN]: {
      color: '#6B7280',
      icon: 'HelpCircle',
      label: 'Unknown',
      description: 'Component status unknown'
    }
  }
} as const;

// ============================================================================
// RETRY AND TIMEOUT CONFIGURATIONS
// ============================================================================

export const RETRY_CONFIGS = {
  DEFAULT: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffStrategy: 'exponential' as const,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMIT_EXCEEDED'
    ]
  },
  
  CRITICAL: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 30000,
    backoffStrategy: 'exponential' as const,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMIT_EXCEEDED',
      'TEMPORARY_FAILURE'
    ]
  },
  
  BACKGROUND: {
    maxRetries: 10,
    baseDelay: 2000,
    maxDelay: 60000,
    backoffStrategy: 'linear' as const,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMIT_EXCEEDED',
      'TEMPORARY_FAILURE'
    ]
  }
} as const;

export const TIMEOUT_CONFIGS = {
  API_REQUEST: 30000,        // ms
  WEBSOCKET_CONNECT: 10000,  // ms
  FILE_UPLOAD: 300000,       // ms
  EXPORT_OPERATION: 600000,  // ms
  HEALTH_CHECK: 5000,        // ms
  HEARTBEAT: 30000           // ms
} as const;

// ============================================================================
// WEBSOCKET CONFIGURATIONS
// ============================================================================

export const WEBSOCKET_CONFIGS = {
  ENDPOINTS: {
    ORCHESTRATION: '/ws/racine/orchestration',
    WORKFLOW: '/ws/racine/workflow',
    PIPELINE: '/ws/racine/pipeline',
    ACTIVITY: '/ws/racine/activity',
    COLLABORATION: '/ws/racine/collaboration',
    HEALTH: '/ws/racine/health'
  },
  
  RECONNECT: {
    maxAttempts: 10,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffStrategy: 'exponential' as const
  },
  
  HEARTBEAT: {
    interval: 30000,
    timeout: 5000,
    maxMissed: 3
  }
} as const;

// ============================================================================
// CACHE CONFIGURATIONS
// ============================================================================

export const CACHE_CONFIGS = {
  KEYS: {
    USER_PROFILE: 'user:profile:',
    SYSTEM_HEALTH: 'system:health',
    GROUP_STATUS: 'group:status:',
    WORKSPACE_DATA: 'workspace:data:',
    WORKFLOW_DEFINITION: 'workflow:definition:',
    PIPELINE_DEFINITION: 'pipeline:definition:',
    DASHBOARD_CONFIG: 'dashboard:config:',
    ACTIVITY_LOG: 'activity:log:'
  },
  
  TTL: {
    SHORT: 60,        // 1 minute
    MEDIUM: 300,      // 5 minutes
    LONG: 3600,       // 1 hour
    EXTENDED: 86400   // 24 hours
  },
  
  SIZES: {
    SMALL: 100,       // items
    MEDIUM: 500,      // items
    LARGE: 1000,      // items
    UNLIMITED: -1
  }
} as const;

// ============================================================================
// MONITORING CONFIGURATIONS
// ============================================================================

export const MONITORING_CONFIGS = {
  METRICS: {
    COLLECTION_INTERVAL: 30000,    // ms
    RETENTION_PERIOD: 2592000,     // 30 days in seconds
    BATCH_SIZE: 100,
    COMPRESSION: true
  },
  
  ALERTS: {
    EVALUATION_INTERVAL: 60000,    // ms
    NOTIFICATION_COOLDOWN: 300000, // ms
    MAX_ALERTS_PER_HOUR: 50,
    ESCALATION_DELAY: 900000       // ms
  },
  
  LOGS: {
    MAX_LOG_SIZE: 10485760,        // 10MB
    ROTATION_COUNT: 5,
    COMPRESSION: true,
    STRUCTURED: true
  }
} as const;

// ============================================================================
// SECURITY CONFIGURATIONS
// ============================================================================

export const SECURITY_CONFIGS = {
  JWT: {
    EXPIRY: 3600,                  // seconds
    REFRESH_THRESHOLD: 300,        // seconds
    ALGORITHM: 'HS256'
  },
  
  API_KEYS: {
    LENGTH: 32,
    EXPIRY: 7776000,               // 90 days
    ROTATION_WARNING: 604800       // 7 days
  },
  
  RATE_LIMITING: {
    WINDOW_SIZE: 60000,            // ms
    MAX_REQUESTS: 1000,
    BURST_LIMIT: 100
  },
  
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    KEY_ROTATION: 2592000          // 30 days
  }
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  BETA_FEATURES: process.env.NEXT_PUBLIC_ENABLE_BETA === 'true',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  REAL_TIME_UPDATES: true,
  AI_ASSISTANT: true,
  ADVANCED_WORKFLOWS: true,
  COLLABORATION: true,
  EXPORT_FEATURES: true,
  MOBILE_SUPPORT: true
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getGroupById(groupId: string) {
  return Object.values(SUPPORTED_GROUPS).find(group => group.id === groupId);
}

export function getEnabledGroups() {
  return Object.values(SUPPORTED_GROUPS).filter(group => group.enabled);
}

export function getGroupsByPriority() {
  return Object.values(SUPPORTED_GROUPS)
    .filter(group => group.enabled)
    .sort((a, b) => a.priority - b.priority);
}

export function buildApiUrl(endpoint: string, params?: Record<string, string>) {
  let url = `${API_ENDPOINTS.BASE_URL}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
  }
  
  return url;
}

export function getStatusConfig(status: SystemStatus | OperationStatus | HealthStatus) {
  if (Object.values(SystemStatus).includes(status as SystemStatus)) {
    return STATUS_CONFIGS.SYSTEM_STATUS[status as SystemStatus];
  }
  if (Object.values(OperationStatus).includes(status as OperationStatus)) {
    return STATUS_CONFIGS.OPERATION_STATUS[status as OperationStatus];
  }
  if (Object.values(HealthStatus).includes(status as HealthStatus)) {
    return STATUS_CONFIGS.HEALTH_STATUS[status as HealthStatus];
  }
  return null;
}

export function getPerformanceLevel(value: number, thresholds: any) {
  if (value <= thresholds.EXCELLENT) return 'excellent';
  if (value <= thresholds.GOOD) return 'good';
  if (value <= thresholds.ACCEPTABLE) return 'acceptable';
  if (value <= thresholds.POOR) return 'poor';
  return 'critical';
}

export function getCacheKey(prefix: string, ...parts: string[]) {
  return `${prefix}${parts.join(':')}`;
}

export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS) {
  return FEATURE_FLAGS[feature];
}