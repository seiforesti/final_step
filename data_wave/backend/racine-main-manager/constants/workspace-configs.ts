/**
 * Workspace Management Configuration Constants
 * =============================================
 * 
 * Comprehensive configuration constants for workspace management that map
 * to backend workspace settings and provide default values, templates,
 * and validation rules for workspace operations.
 */

import { WorkspaceTemplate, WorkspaceConfiguration } from '../types/racine-core.types';

// =============================================================================
// WORKSPACE TYPES AND CATEGORIES
// =============================================================================

export const WORKSPACE_TYPES = {
  PROJECT: 'project',
  ENVIRONMENT: 'environment', 
  DEPARTMENT: 'department',
  TEMPORARY: 'temporary',
  SANDBOX: 'sandbox',
  PRODUCTION: 'production'
} as const;

export const WORKSPACE_CATEGORIES = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  STAGING: 'staging',
  PRODUCTION: 'production',
  RESEARCH: 'research',
  COLLABORATION: 'collaboration'
} as const;

export const WORKSPACE_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  SUSPENDED: 'suspended',
  MAINTENANCE: 'maintenance'
} as const;

// =============================================================================
// WORKSPACE PERMISSIONS AND ROLES
// =============================================================================

export const WORKSPACE_PERMISSIONS = {
  // Workspace permissions
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_WRITE: 'workspace:write',
  WORKSPACE_ADMIN: 'workspace:admin',
  WORKSPACE_DELETE: 'workspace:delete',
  
  // Resource permissions
  RESOURCES_READ: 'resources:read',
  RESOURCES_WRITE: 'resources:write',
  RESOURCES_LINK: 'resources:link',
  RESOURCES_UNLINK: 'resources:unlink',
  RESOURCES_ADMIN: 'resources:admin',
  
  // Member permissions
  MEMBERS_READ: 'members:read',
  MEMBERS_INVITE: 'members:invite',
  MEMBERS_REMOVE: 'members:remove',
  MEMBERS_ADMIN: 'members:admin',
  
  // Analytics permissions
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Collaboration permissions
  COLLABORATION_READ: 'collaboration:read',
  COLLABORATION_WRITE: 'collaboration:write',
  COLLABORATION_MODERATE: 'collaboration:moderate'
} as const;

export const WORKSPACE_ROLES = {
  OWNER: {
    name: 'owner',
    displayName: 'Owner',
    permissions: [
      WORKSPACE_PERMISSIONS.WORKSPACE_READ,
      WORKSPACE_PERMISSIONS.WORKSPACE_WRITE,
      WORKSPACE_PERMISSIONS.WORKSPACE_ADMIN,
      WORKSPACE_PERMISSIONS.WORKSPACE_DELETE,
      WORKSPACE_PERMISSIONS.RESOURCES_READ,
      WORKSPACE_PERMISSIONS.RESOURCES_WRITE,
      WORKSPACE_PERMISSIONS.RESOURCES_LINK,
      WORKSPACE_PERMISSIONS.RESOURCES_UNLINK,
      WORKSPACE_PERMISSIONS.RESOURCES_ADMIN,
      WORKSPACE_PERMISSIONS.MEMBERS_READ,
      WORKSPACE_PERMISSIONS.MEMBERS_INVITE,
      WORKSPACE_PERMISSIONS.MEMBERS_REMOVE,
      WORKSPACE_PERMISSIONS.MEMBERS_ADMIN,
      WORKSPACE_PERMISSIONS.ANALYTICS_READ,
      WORKSPACE_PERMISSIONS.ANALYTICS_EXPORT,
      WORKSPACE_PERMISSIONS.COLLABORATION_READ,
      WORKSPACE_PERMISSIONS.COLLABORATION_WRITE,
      WORKSPACE_PERMISSIONS.COLLABORATION_MODERATE
    ]
  },
  ADMIN: {
    name: 'admin',
    displayName: 'Administrator',
    permissions: [
      WORKSPACE_PERMISSIONS.WORKSPACE_READ,
      WORKSPACE_PERMISSIONS.WORKSPACE_WRITE,
      WORKSPACE_PERMISSIONS.WORKSPACE_ADMIN,
      WORKSPACE_PERMISSIONS.RESOURCES_READ,
      WORKSPACE_PERMISSIONS.RESOURCES_WRITE,
      WORKSPACE_PERMISSIONS.RESOURCES_LINK,
      WORKSPACE_PERMISSIONS.RESOURCES_UNLINK,
      WORKSPACE_PERMISSIONS.MEMBERS_READ,
      WORKSPACE_PERMISSIONS.MEMBERS_INVITE,
      WORKSPACE_PERMISSIONS.MEMBERS_REMOVE,
      WORKSPACE_PERMISSIONS.ANALYTICS_READ,
      WORKSPACE_PERMISSIONS.COLLABORATION_READ,
      WORKSPACE_PERMISSIONS.COLLABORATION_WRITE,
      WORKSPACE_PERMISSIONS.COLLABORATION_MODERATE
    ]
  },
  EDITOR: {
    name: 'editor',
    displayName: 'Editor',
    permissions: [
      WORKSPACE_PERMISSIONS.WORKSPACE_READ,
      WORKSPACE_PERMISSIONS.WORKSPACE_WRITE,
      WORKSPACE_PERMISSIONS.RESOURCES_READ,
      WORKSPACE_PERMISSIONS.RESOURCES_WRITE,
      WORKSPACE_PERMISSIONS.RESOURCES_LINK,
      WORKSPACE_PERMISSIONS.MEMBERS_READ,
      WORKSPACE_PERMISSIONS.ANALYTICS_READ,
      WORKSPACE_PERMISSIONS.COLLABORATION_READ,
      WORKSPACE_PERMISSIONS.COLLABORATION_WRITE
    ]
  },
  VIEWER: {
    name: 'viewer',
    displayName: 'Viewer',
    permissions: [
      WORKSPACE_PERMISSIONS.WORKSPACE_READ,
      WORKSPACE_PERMISSIONS.RESOURCES_READ,
      WORKSPACE_PERMISSIONS.MEMBERS_READ,
      WORKSPACE_PERMISSIONS.ANALYTICS_READ,
      WORKSPACE_PERMISSIONS.COLLABORATION_READ
    ]
  },
  GUEST: {
    name: 'guest',
    displayName: 'Guest',
    permissions: [
      WORKSPACE_PERMISSIONS.WORKSPACE_READ,
      WORKSPACE_PERMISSIONS.RESOURCES_READ,
      WORKSPACE_PERMISSIONS.COLLABORATION_READ
    ]
  }
} as const;

// =============================================================================
// WORKSPACE LIMITS AND QUOTAS
// =============================================================================

export const WORKSPACE_LIMITS = {
  // Basic limits
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  
  // Member limits
  MIN_MEMBERS: 1,
  MAX_MEMBERS_FREE: 10,
  MAX_MEMBERS_PRO: 100,
  MAX_MEMBERS_ENTERPRISE: 1000,
  
  // Resource limits
  MAX_RESOURCES_FREE: 50,
  MAX_RESOURCES_PRO: 500,
  MAX_RESOURCES_ENTERPRISE: 5000,
  
  // Storage limits (in GB)
  STORAGE_FREE: 10,
  STORAGE_PRO: 100,
  STORAGE_ENTERPRISE: 1000,
  
  // API limits
  API_CALLS_PER_HOUR_FREE: 1000,
  API_CALLS_PER_HOUR_PRO: 10000,
  API_CALLS_PER_HOUR_ENTERPRISE: 100000,
  
  // Collaboration limits
  MAX_ACTIVE_SESSIONS: 50,
  MAX_CONCURRENT_EDITORS: 20,
  
  // Archive limits
  ARCHIVE_AFTER_DAYS: 90,
  DELETE_AFTER_DAYS: 365
} as const;

export const WORKSPACE_QUOTAS = {
  FREE_TIER: {
    members: WORKSPACE_LIMITS.MAX_MEMBERS_FREE,
    resources: WORKSPACE_LIMITS.MAX_RESOURCES_FREE,
    storage: WORKSPACE_LIMITS.STORAGE_FREE,
    apiCalls: WORKSPACE_LIMITS.API_CALLS_PER_HOUR_FREE,
    workspaces: 3
  },
  PRO_TIER: {
    members: WORKSPACE_LIMITS.MAX_MEMBERS_PRO,
    resources: WORKSPACE_LIMITS.MAX_RESOURCES_PRO,
    storage: WORKSPACE_LIMITS.STORAGE_PRO,
    apiCalls: WORKSPACE_LIMITS.API_CALLS_PER_HOUR_PRO,
    workspaces: 25
  },
  ENTERPRISE_TIER: {
    members: WORKSPACE_LIMITS.MAX_MEMBERS_ENTERPRISE,
    resources: WORKSPACE_LIMITS.MAX_RESOURCES_ENTERPRISE,
    storage: WORKSPACE_LIMITS.STORAGE_ENTERPRISE,
    apiCalls: WORKSPACE_LIMITS.API_CALLS_PER_HOUR_ENTERPRISE,
    workspaces: -1 // Unlimited
  }
} as const;

// =============================================================================
// WORKSPACE TEMPLATES
// =============================================================================

export const DEFAULT_WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'template-data-science-project',
    name: 'Data Science Project',
    description: 'Complete workspace setup for data science projects with ML workflows',
    category: 'data-science',
    isPublic: true,
    configuration: {
      type: WORKSPACE_TYPES.PROJECT,
      category: WORKSPACE_CATEGORIES.DEVELOPMENT,
      features: {
        enableCollaboration: true,
        enableVersionControl: true,
        enableNotebooks: true,
        enablePipelines: true,
        enableAI: true
      },
      integrations: ['jupyter', 'git', 'mlflow', 'tensorboard'],
      resourceQuota: {
        compute: 'medium',
        storage: '50GB',
        bandwidth: '100GB'
      }
    },
    defaultMembers: [
      { role: 'data_scientist', permissions: [WORKSPACE_PERMISSIONS.RESOURCES_READ, WORKSPACE_PERMISSIONS.RESOURCES_WRITE] },
      { role: 'ml_engineer', permissions: [WORKSPACE_PERMISSIONS.RESOURCES_READ, WORKSPACE_PERMISSIONS.RESOURCES_WRITE, WORKSPACE_PERMISSIONS.RESOURCES_LINK] }
    ],
    defaultResources: [
      { type: 'dataset', name: 'Training Data' },
      { type: 'notebook', name: 'Exploratory Analysis' },
      { type: 'pipeline', name: 'ML Training Pipeline' },
      { type: 'model', name: 'Production Model' }
    ],
    tags: ['data-science', 'machine-learning', 'analytics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-compliance-audit',
    name: 'Compliance Audit Workspace',
    description: 'Workspace for compliance auditing with enhanced security and tracking',
    category: 'compliance',
    isPublic: true,
    configuration: {
      type: WORKSPACE_TYPES.DEPARTMENT,
      category: WORKSPACE_CATEGORIES.PRODUCTION,
      features: {
        enableAuditTrail: true,
        enableCompliance: true,
        enableSecurity: true,
        enableReporting: true
      },
      securitySettings: {
        requireMFA: true,
        sessionTimeout: 30,
        ipWhitelist: true,
        auditAllActions: true
      },
      complianceSettings: {
        dataRetentionPolicy: '7_years',
        encryptionRequired: true,
        accessLogging: true
      }
    },
    defaultMembers: [
      { role: 'compliance_officer', permissions: [WORKSPACE_PERMISSIONS.WORKSPACE_ADMIN, WORKSPACE_PERMISSIONS.ANALYTICS_READ] },
      { role: 'auditor', permissions: [WORKSPACE_PERMISSIONS.WORKSPACE_READ, WORKSPACE_PERMISSIONS.ANALYTICS_READ] }
    ],
    defaultResources: [
      { type: 'policy', name: 'Data Governance Policy' },
      { type: 'checklist', name: 'Compliance Checklist' },
      { type: 'report', name: 'Audit Report Template' }
    ],
    tags: ['compliance', 'audit', 'security', 'governance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-team-collaboration',
    name: 'Team Collaboration Hub',
    description: 'General-purpose workspace for team collaboration and project management',
    category: 'collaboration',
    isPublic: true,
    configuration: {
      type: WORKSPACE_TYPES.PROJECT,
      category: WORKSPACE_CATEGORIES.COLLABORATION,
      features: {
        enableCollaboration: true,
        enableChat: true,
        enableTaskManagement: true,
        enableFileSharing: true,
        enableCalendar: true
      },
      collaborationSettings: {
        realTimeEditing: true,
        commentingEnabled: true,
        mentionsEnabled: true,
        notificationsEnabled: true
      }
    },
    defaultMembers: [
      { role: 'project_manager', permissions: [WORKSPACE_PERMISSIONS.WORKSPACE_ADMIN] },
      { role: 'team_member', permissions: [WORKSPACE_PERMISSIONS.WORKSPACE_READ, WORKSPACE_PERMISSIONS.WORKSPACE_WRITE] }
    ],
    defaultResources: [
      { type: 'document', name: 'Project Plan' },
      { type: 'kanban_board', name: 'Task Board' },
      { type: 'calendar', name: 'Team Calendar' },
      { type: 'chat_room', name: 'Team Chat' }
    ],
    tags: ['collaboration', 'project-management', 'team'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// =============================================================================
// WORKSPACE CONFIGURATION DEFAULTS
// =============================================================================

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfiguration = {
  type: WORKSPACE_TYPES.PROJECT,
  category: WORKSPACE_CATEGORIES.DEVELOPMENT,
  status: WORKSPACE_STATUS.ACTIVE,
  
  features: {
    enableCollaboration: true,
    enableVersionControl: false,
    enableNotebooks: false,
    enablePipelines: false,
    enableAI: false,
    enableChat: true,
    enableTaskManagement: false,
    enableFileSharing: true,
    enableCalendar: false,
    enableAuditTrail: false,
    enableCompliance: false,
    enableSecurity: true,
    enableReporting: false
  },
  
  securitySettings: {
    requireMFA: false,
    sessionTimeout: 120, // 2 hours
    ipWhitelist: false,
    auditAllActions: false,
    passwordPolicy: 'standard',
    encryptionLevel: 'standard'
  },
  
  collaborationSettings: {
    realTimeEditing: true,
    commentingEnabled: true,
    mentionsEnabled: true,
    notificationsEnabled: true,
    maxConcurrentEditors: 10
  },
  
  resourceQuota: {
    compute: 'small',
    storage: '10GB',
    bandwidth: '50GB',
    apiCalls: 1000
  },
  
  retentionPolicy: {
    archiveAfterDays: WORKSPACE_LIMITS.ARCHIVE_AFTER_DAYS,
    deleteAfterDays: WORKSPACE_LIMITS.DELETE_AFTER_DAYS,
    backupFrequency: 'daily',
    versionRetention: 30
  },
  
  integrationSettings: {
    enabledIntegrations: [],
    webhookUrls: [],
    apiKeys: {},
    externalConnections: []
  }
};

// =============================================================================
// WORKSPACE VALIDATION RULES
// =============================================================================

export const WORKSPACE_VALIDATION_RULES = {
  name: {
    required: true,
    minLength: WORKSPACE_LIMITS.MIN_NAME_LENGTH,
    maxLength: WORKSPACE_LIMITS.MAX_NAME_LENGTH,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
    reservedNames: ['admin', 'api', 'www', 'mail', 'ftp', 'system', 'root']
  },
  
  description: {
    required: false,
    maxLength: WORKSPACE_LIMITS.MAX_DESCRIPTION_LENGTH
  },
  
  type: {
    required: true,
    allowedValues: Object.values(WORKSPACE_TYPES)
  },
  
  category: {
    required: true,
    allowedValues: Object.values(WORKSPACE_CATEGORIES)
  },
  
  members: {
    minCount: WORKSPACE_LIMITS.MIN_MEMBERS,
    maxCount: WORKSPACE_LIMITS.MAX_MEMBERS_ENTERPRISE // Will be adjusted based on tier
  },
  
  resources: {
    maxCount: WORKSPACE_LIMITS.MAX_RESOURCES_ENTERPRISE // Will be adjusted based on tier
  }
} as const;

// =============================================================================
// WORKSPACE FEATURE FLAGS
// =============================================================================

export const WORKSPACE_FEATURES = {
  // Core features
  COLLABORATION: 'enableCollaboration',
  VERSION_CONTROL: 'enableVersionControl',
  REAL_TIME_EDITING: 'enableRealTimeEditing',
  
  // Advanced features
  NOTEBOOKS: 'enableNotebooks',
  PIPELINES: 'enablePipelines',
  AI_ASSISTANCE: 'enableAI',
  
  // Communication features
  CHAT: 'enableChat',
  VIDEO_CALLS: 'enableVideoCalls',
  COMMENTS: 'enableComments',
  
  // Management features
  TASK_MANAGEMENT: 'enableTaskManagement',
  TIME_TRACKING: 'enableTimeTracking',
  REPORTING: 'enableReporting',
  
  // Security features
  AUDIT_TRAIL: 'enableAuditTrail',
  COMPLIANCE: 'enableCompliance',
  ADVANCED_SECURITY: 'enableSecurity',
  
  // Integration features
  FILE_SHARING: 'enableFileSharing',
  CALENDAR: 'enableCalendar',
  EMAIL_INTEGRATION: 'enableEmailIntegration',
  
  // Analytics features
  ANALYTICS: 'enableAnalytics',
  CUSTOM_DASHBOARDS: 'enableCustomDashboards',
  EXPORT_DATA: 'enableExportData'
} as const;

// =============================================================================
// WORKSPACE NOTIFICATION SETTINGS
// =============================================================================

export const WORKSPACE_NOTIFICATIONS = {
  TYPES: {
    MEMBER_JOINED: 'member_joined',
    MEMBER_LEFT: 'member_left',
    RESOURCE_ADDED: 'resource_added',
    RESOURCE_REMOVED: 'resource_removed',
    WORKSPACE_UPDATED: 'workspace_updated',
    COLLABORATION_ACTIVITY: 'collaboration_activity',
    SECURITY_ALERT: 'security_alert',
    QUOTA_WARNING: 'quota_warning',
    DEADLINE_REMINDER: 'deadline_reminder'
  },
  
  CHANNELS: {
    EMAIL: 'email',
    IN_APP: 'in_app',
    PUSH: 'push',
    WEBHOOK: 'webhook',
    SLACK: 'slack',
    TEAMS: 'teams'
  },
  
  FREQUENCIES: {
    IMMEDIATE: 'immediate',
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    NEVER: 'never'
  }
} as const;

// =============================================================================
// WORKSPACE ANALYTICS METRICS
// =============================================================================

export const WORKSPACE_ANALYTICS_METRICS = {
  ACTIVITY: {
    MEMBER_ACTIVITY: 'member_activity',
    RESOURCE_USAGE: 'resource_usage',
    COLLABORATION_FREQUENCY: 'collaboration_frequency',
    SESSION_DURATION: 'session_duration'
  },
  
  PERFORMANCE: {
    RESPONSE_TIME: 'response_time',
    UPTIME: 'uptime',
    ERROR_RATE: 'error_rate',
    THROUGHPUT: 'throughput'
  },
  
  SECURITY: {
    LOGIN_ATTEMPTS: 'login_attempts',
    FAILED_AUTHENTICATIONS: 'failed_authentications',
    PERMISSION_VIOLATIONS: 'permission_violations',
    SECURITY_SCORE: 'security_score'
  },
  
  COMPLIANCE: {
    AUDIT_COMPLIANCE: 'audit_compliance',
    DATA_RETENTION: 'data_retention',
    ACCESS_REVIEWS: 'access_reviews',
    POLICY_VIOLATIONS: 'policy_violations'
  }
} as const;

// =============================================================================
// EXPORT ALL CONSTANTS
// =============================================================================

export const WORKSPACE_CONSTANTS = {
  TYPES: WORKSPACE_TYPES,
  CATEGORIES: WORKSPACE_CATEGORIES,
  STATUS: WORKSPACE_STATUS,
  PERMISSIONS: WORKSPACE_PERMISSIONS,
  ROLES: WORKSPACE_ROLES,
  LIMITS: WORKSPACE_LIMITS,
  QUOTAS: WORKSPACE_QUOTAS,
  TEMPLATES: DEFAULT_WORKSPACE_TEMPLATES,
  DEFAULT_CONFIG: DEFAULT_WORKSPACE_CONFIG,
  VALIDATION_RULES: WORKSPACE_VALIDATION_RULES,
  FEATURES: WORKSPACE_FEATURES,
  NOTIFICATIONS: WORKSPACE_NOTIFICATIONS,
  ANALYTICS_METRICS: WORKSPACE_ANALYTICS_METRICS
} as const;