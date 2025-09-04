// Role Constants - Default role definitions and mappings

import { PERMISSION_GROUPS, ALL_PERMISSIONS } from './permissions.constants';

// Default role definitions that map to backend ROLE_PERMISSIONS
export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  DATA_STEWARD: 'data_steward', 
  DATA_ANALYST: 'data_analyst',
  VIEWER: 'viewer',
  RBAC_ADMIN: 'rbac_admin',
  COMPLIANCE_OFFICER: 'compliance_officer',
  DATA_ENGINEER: 'data_engineer',
  SECURITY_ADMIN: 'security_admin'
} as const;

// Role to permission mapping - mirrors backend ROLE_PERMISSIONS
export const ROLE_PERMISSIONS = {
  [DEFAULT_ROLES.ADMIN]: [
    ...PERMISSION_GROUPS.SCAN,
    ...PERMISSION_GROUPS.DASHBOARD,
    ...PERMISSION_GROUPS.LINEAGE,
    ...PERMISSION_GROUPS.COMPLIANCE,
    ...PERMISSION_GROUPS.DATA_PROFILING,
    ...PERMISSION_GROUPS.CUSTOM_SCAN_RULES,
    ...PERMISSION_GROUPS.DATASOURCE,
    ...PERMISSION_GROUPS.SCAN_RULESET,
    ...PERMISSION_GROUPS.ANALYTICS,
    ...PERMISSION_GROUPS.COLLABORATION,
    ...PERMISSION_GROUPS.WORKFLOW,
    ...PERMISSION_GROUPS.PERFORMANCE,
    ...PERMISSION_GROUPS.SECURITY,
    ...PERMISSION_GROUPS.RBAC,
    ...PERMISSION_GROUPS.CLASSIFICATION,
    ...PERMISSION_GROUPS.CATALOG
  ],
  
  [DEFAULT_ROLES.DATA_STEWARD]: [
    'scan.view', 'scan.create',
    'dashboard.view', 'dashboard.export',
    'lineage.view', 'lineage.export',
    'compliance.view', 'compliance.export',
    'data_profiling.view', 'data_profiling.run',
    'custom_scan_rules.view',
    'incremental_scan.view', 'incremental_scan.create',
    'datasource.view', 'datasource.create',
    'scan.ruleset.view', 'scan.ruleset.create',
    'analytics.view',
    'collaboration.view', 'collaboration.manage',
    'workspace.create',
    'workflow.view', 'workflow.create', 'workflow.execute',
    'performance.view', 'alerts.view',
    'security.view', 'audit.view',
    'classification.view', 'classification.create', 'classification.assign',
    'catalog.view', 'catalog.search'
  ],
  
  [DEFAULT_ROLES.DATA_ANALYST]: [
    'scan.view',
    'dashboard.view',
    'lineage.view',
    'compliance.view',
    'data_profiling.view',
    'datasource.view',
    'scan.ruleset.view',
    'analytics.view',
    'collaboration.view',
    'workflow.view',
    'performance.view', 'alerts.view',
    'security.view', 'audit.view',
    'classification.view',
    'catalog.view', 'catalog.search'
  ],
  
  [DEFAULT_ROLES.VIEWER]: [
    'scan.view',
    'dashboard.view',
    'lineage.view',
    'datasource.view',
    'scan.ruleset.view',
    'analytics.view',
    'collaboration.view',
    'workflow.view',
    'performance.view',
    'security.view',
    'classification.view',
    'catalog.view'
  ],
  
  [DEFAULT_ROLES.RBAC_ADMIN]: [
    ...PERMISSION_GROUPS.RBAC,
    'audit.view', 'audit.manage',
    'security.view', 'security.manage'
  ],
  
  [DEFAULT_ROLES.COMPLIANCE_OFFICER]: [
    ...PERMISSION_GROUPS.COMPLIANCE,
    'audit.view', 'audit.manage',
    'classification.view', 'classification.create', 'classification.assign',
    'scan.view', 'dashboard.view',
    'lineage.view', 'lineage.export'
  ],
  
  [DEFAULT_ROLES.DATA_ENGINEER]: [
    ...PERMISSION_GROUPS.DATASOURCE,
    ...PERMISSION_GROUPS.SCAN,
    ...PERMISSION_GROUPS.SCAN_RULESET,
    'workflow.view', 'workflow.create', 'workflow.execute',
    'performance.view', 'performance.manage',
    'lineage.view', 'data_profiling.view', 'data_profiling.run'
  ],
  
  [DEFAULT_ROLES.SECURITY_ADMIN]: [
    ...PERMISSION_GROUPS.SECURITY,
    ...PERMISSION_GROUPS.RBAC,
    'audit.view', 'audit.manage',
    'compliance.view', 'compliance.manage',
    'classification.view', 'classification.create', 'classification.assign'
  ]
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS = {
  [DEFAULT_ROLES.ADMIN]: 'Full system administrator with all permissions',
  [DEFAULT_ROLES.DATA_STEWARD]: 'Manages data quality, governance, and compliance',
  [DEFAULT_ROLES.DATA_ANALYST]: 'Analyzes data and creates reports',
  [DEFAULT_ROLES.VIEWER]: 'Read-only access to system resources',
  [DEFAULT_ROLES.RBAC_ADMIN]: 'Manages user access and permissions',
  [DEFAULT_ROLES.COMPLIANCE_OFFICER]: 'Ensures regulatory compliance and audit',
  [DEFAULT_ROLES.DATA_ENGINEER]: 'Manages data infrastructure and pipelines',
  [DEFAULT_ROLES.SECURITY_ADMIN]: 'Manages security policies and access controls'
};

// Role hierarchy levels
export const ROLE_HIERARCHY = {
  [DEFAULT_ROLES.ADMIN]: 1,
  [DEFAULT_ROLES.SECURITY_ADMIN]: 2,
  [DEFAULT_ROLES.RBAC_ADMIN]: 2,
  [DEFAULT_ROLES.COMPLIANCE_OFFICER]: 3,
  [DEFAULT_ROLES.DATA_STEWARD]: 4,
  [DEFAULT_ROLES.DATA_ENGINEER]: 4,
  [DEFAULT_ROLES.DATA_ANALYST]: 5,
  [DEFAULT_ROLES.VIEWER]: 6
};

// Role colors for UI
export const ROLE_COLORS = {
  [DEFAULT_ROLES.ADMIN]: '#dc2626', // red-600
  [DEFAULT_ROLES.SECURITY_ADMIN]: '#ea580c', // orange-600
  [DEFAULT_ROLES.RBAC_ADMIN]: '#d97706', // amber-600
  [DEFAULT_ROLES.COMPLIANCE_OFFICER]: '#7c3aed', // violet-600
  [DEFAULT_ROLES.DATA_STEWARD]: '#2563eb', // blue-600
  [DEFAULT_ROLES.DATA_ENGINEER]: '#059669', // emerald-600
  [DEFAULT_ROLES.DATA_ANALYST]: '#0891b2', // cyan-600
  [DEFAULT_ROLES.VIEWER]: '#6b7280' // gray-500
};

// Built-in roles that cannot be deleted
export const BUILTIN_ROLES = [
  DEFAULT_ROLES.ADMIN,
  DEFAULT_ROLES.VIEWER
];

// Role categories for organization
export const ROLE_CATEGORIES = {
  ADMINISTRATIVE: [DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.RBAC_ADMIN, DEFAULT_ROLES.SECURITY_ADMIN],
  GOVERNANCE: [DEFAULT_ROLES.DATA_STEWARD, DEFAULT_ROLES.COMPLIANCE_OFFICER],
  TECHNICAL: [DEFAULT_ROLES.DATA_ENGINEER, DEFAULT_ROLES.DATA_ANALYST],
  BASIC: [DEFAULT_ROLES.VIEWER]
};

// Role templates for quick role creation
export const ROLE_TEMPLATES = [
  {
    name: 'Database Administrator',
    description: 'Full database management permissions',
    permissions: [
      ...PERMISSION_GROUPS.DATASOURCE,
      'scan.view', 'scan.create', 'scan.execute',
      'performance.view', 'performance.manage'
    ],
    category: 'technical'
  },
  {
    name: 'Report Viewer',
    description: 'View reports and dashboards only',
    permissions: [
      'dashboard.view',
      'lineage.view',
      'catalog.view'
    ],
    category: 'basic'
  },
  {
    name: 'Data Quality Manager',
    description: 'Manages data quality and profiling',
    permissions: [
      'data_profiling.view', 'data_profiling.run',
      'scan.view', 'scan.create',
      'compliance.view', 'compliance.manage',
      'classification.view', 'classification.assign'
    ],
    category: 'governance'
  }
];