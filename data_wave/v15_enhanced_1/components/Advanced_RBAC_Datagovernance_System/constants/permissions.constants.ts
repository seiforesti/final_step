// Permission Constants - Maps to backend rbac.py permission definitions

// Scan permissions
export const PERMISSION_SCAN_VIEW = "scan.view";
export const PERMISSION_SCAN_CREATE = "scan.create";
export const PERMISSION_SCAN_EDIT = "scan.edit";
export const PERMISSION_SCAN_DELETE = "scan.delete";

// Dashboard permissions
export const PERMISSION_DASHBOARD_VIEW = "dashboard.view";
export const PERMISSION_DASHBOARD_EXPORT = "dashboard.export";

// Lineage permissions
export const PERMISSION_LINEAGE_VIEW = "lineage.view";
export const PERMISSION_LINEAGE_EXPORT = "lineage.export";

// Compliance permissions
export const PERMISSION_COMPLIANCE_VIEW = "compliance.view";
export const PERMISSION_COMPLIANCE_EXPORT = "compliance.export";
export const PERMISSION_COMPLIANCE_MANAGE = "compliance.manage";
export const PERMISSION_COMPLIANCE_AUDIT = "compliance.audit";

// Data profiling permissions
export const PERMISSION_DATA_PROFILING_VIEW = "data_profiling.view";
export const PERMISSION_DATA_PROFILING_RUN = "data_profiling.run";

// Custom scan rules permissions
export const PERMISSION_CUSTOM_SCAN_RULES_VIEW = "custom_scan_rules.view";
export const PERMISSION_CUSTOM_SCAN_RULES_CREATE = "custom_scan_rules.create";
export const PERMISSION_CUSTOM_SCAN_RULES_EDIT = "custom_scan_rules.edit";
export const PERMISSION_CUSTOM_SCAN_RULES_DELETE = "custom_scan_rules.delete";

// Incremental scan permissions
export const PERMISSION_INCREMENTAL_SCAN_VIEW = "incremental_scan.view";
export const PERMISSION_INCREMENTAL_SCAN_RUN = "incremental_scan.run";
export const PERMISSION_INCREMENTAL_SCAN_CREATE = "incremental_scan.create";

// Data source permissions
export const PERMISSION_DATASOURCE_VIEW = "datasource.view";
export const PERMISSION_DATASOURCE_CREATE = "datasource.create";
export const PERMISSION_DATASOURCE_EDIT = "datasource.edit";
export const PERMISSION_DATASOURCE_DELETE = "datasource.delete";

// Scan ruleset permissions
export const PERMISSION_SCAN_RULESET_VIEW = "scan.ruleset.view";
export const PERMISSION_SCAN_RULESET_CREATE = "scan.ruleset.create";
export const PERMISSION_SCAN_RULESET_EDIT = "scan.ruleset.edit";
export const PERMISSION_SCAN_RULESET_DELETE = "scan.ruleset.delete";

// Enterprise Analytics permissions
export const PERMISSION_ANALYTICS_VIEW = "analytics.view";
export const PERMISSION_ANALYTICS_MANAGE = "analytics.manage";

// Collaboration permissions
export const PERMISSION_COLLABORATION_VIEW = "collaboration.view";
export const PERMISSION_COLLABORATION_MANAGE = "collaboration.manage";
export const PERMISSION_WORKSPACE_CREATE = "workspace.create";
export const PERMISSION_WORKSPACE_EDIT = "workspace.edit";

// Workflow permissions
export const PERMISSION_WORKFLOW_VIEW = "workflow.view";
export const PERMISSION_WORKFLOW_MANAGE = "workflow.manage";
export const PERMISSION_WORKFLOW_CREATE = "workflow.create";
export const PERMISSION_WORKFLOW_EXECUTE = "workflow.execute";

// Enhanced Performance permissions
export const PERMISSION_PERFORMANCE_VIEW = "performance.view";
export const PERMISSION_PERFORMANCE_MANAGE = "performance.manage";
export const PERMISSION_ALERTS_VIEW = "alerts.view";
export const PERMISSION_ALERTS_MANAGE = "alerts.manage";

// Enhanced Security permissions
export const PERMISSION_SECURITY_VIEW = "security.view";
export const PERMISSION_SECURITY_MANAGE = "security.manage";
export const PERMISSION_AUDIT_VIEW = "audit.view";
export const PERMISSION_AUDIT_MANAGE = "audit.manage";

// RBAC management permissions
export const PERMISSION_RBAC_MANAGE = "rbac.manage";
export const PERMISSION_USERS_MANAGE = "users.manage";
export const PERMISSION_ROLES_MANAGE = "roles.manage";
export const PERMISSION_PERMISSIONS_MANAGE = "permissions.manage";
export const PERMISSION_GROUPS_MANAGE = "groups.manage";
export const PERMISSION_RESOURCES_MANAGE = "resources.manage";

// Classification permissions
export const PERMISSION_CLASSIFICATION_VIEW = "classification.view";
export const PERMISSION_CLASSIFICATION_CREATE = "classification.create";
export const PERMISSION_CLASSIFICATION_ASSIGN = "classification.assign";
export const PERMISSION_CLASSIFICATION_EDIT = "classification.edit";
export const PERMISSION_CLASSIFICATION_DELETE = "classification.delete";

// Catalog permissions
export const PERMISSION_CATALOG_VIEW = "catalog.view";
export const PERMISSION_CATALOG_SEARCH = "catalog.search";
export const PERMISSION_CATALOG_EXPORT = "catalog.export";
export const PERMISSION_CATALOG_EDIT = "catalog.edit";
export const PERMISSION_CATALOG_MANAGE = "catalog.manage";

// Scan logic permissions
export const PERMISSION_SCAN_CONFIGURE = "scan.configure";
export const PERMISSION_SCAN_EXECUTE = "scan.execute";
export const PERMISSION_SCAN_MONITOR = "scan.monitor";

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  SCAN: [
    PERMISSION_SCAN_VIEW,
    PERMISSION_SCAN_CREATE,
    PERMISSION_SCAN_EDIT,
    PERMISSION_SCAN_DELETE,
    PERMISSION_SCAN_CONFIGURE,
    PERMISSION_SCAN_EXECUTE,
    PERMISSION_SCAN_MONITOR
  ],
  DASHBOARD: [
    PERMISSION_DASHBOARD_VIEW,
    PERMISSION_DASHBOARD_EXPORT
  ],
  LINEAGE: [
    PERMISSION_LINEAGE_VIEW,
    PERMISSION_LINEAGE_EXPORT
  ],
  COMPLIANCE: [
    PERMISSION_COMPLIANCE_VIEW,
    PERMISSION_COMPLIANCE_EXPORT,
    PERMISSION_COMPLIANCE_MANAGE,
    PERMISSION_COMPLIANCE_AUDIT
  ],
  DATA_PROFILING: [
    PERMISSION_DATA_PROFILING_VIEW,
    PERMISSION_DATA_PROFILING_RUN
  ],
  CUSTOM_SCAN_RULES: [
    PERMISSION_CUSTOM_SCAN_RULES_VIEW,
    PERMISSION_CUSTOM_SCAN_RULES_CREATE,
    PERMISSION_CUSTOM_SCAN_RULES_EDIT,
    PERMISSION_CUSTOM_SCAN_RULES_DELETE
  ],
  DATASOURCE: [
    PERMISSION_DATASOURCE_VIEW,
    PERMISSION_DATASOURCE_CREATE,
    PERMISSION_DATASOURCE_EDIT,
    PERMISSION_DATASOURCE_DELETE
  ],
  SCAN_RULESET: [
    PERMISSION_SCAN_RULESET_VIEW,
    PERMISSION_SCAN_RULESET_CREATE,
    PERMISSION_SCAN_RULESET_EDIT,
    PERMISSION_SCAN_RULESET_DELETE
  ],
  ANALYTICS: [
    PERMISSION_ANALYTICS_VIEW,
    PERMISSION_ANALYTICS_MANAGE
  ],
  COLLABORATION: [
    PERMISSION_COLLABORATION_VIEW,
    PERMISSION_COLLABORATION_MANAGE,
    PERMISSION_WORKSPACE_CREATE,
    PERMISSION_WORKSPACE_EDIT
  ],
  WORKFLOW: [
    PERMISSION_WORKFLOW_VIEW,
    PERMISSION_WORKFLOW_MANAGE,
    PERMISSION_WORKFLOW_CREATE,
    PERMISSION_WORKFLOW_EXECUTE
  ],
  PERFORMANCE: [
    PERMISSION_PERFORMANCE_VIEW,
    PERMISSION_PERFORMANCE_MANAGE,
    PERMISSION_ALERTS_VIEW,
    PERMISSION_ALERTS_MANAGE
  ],
  SECURITY: [
    PERMISSION_SECURITY_VIEW,
    PERMISSION_SECURITY_MANAGE,
    PERMISSION_AUDIT_VIEW,
    PERMISSION_AUDIT_MANAGE
  ],
  RBAC: [
    PERMISSION_RBAC_MANAGE,
    PERMISSION_USERS_MANAGE,
    PERMISSION_ROLES_MANAGE,
    PERMISSION_PERMISSIONS_MANAGE,
    PERMISSION_GROUPS_MANAGE,
    PERMISSION_RESOURCES_MANAGE
  ],
  CLASSIFICATION: [
    PERMISSION_CLASSIFICATION_VIEW,
    PERMISSION_CLASSIFICATION_CREATE,
    PERMISSION_CLASSIFICATION_ASSIGN,
    PERMISSION_CLASSIFICATION_EDIT,
    PERMISSION_CLASSIFICATION_DELETE
  ],
  CATALOG: [
    PERMISSION_CATALOG_VIEW,
    PERMISSION_CATALOG_SEARCH,
    PERMISSION_CATALOG_EXPORT,
    PERMISSION_CATALOG_EDIT,
    PERMISSION_CATALOG_MANAGE
  ]
};

// All permissions array for easier iteration
export const ALL_PERMISSIONS = [
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
];

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSION_SCAN_VIEW]: "View scan results and configurations",
  [PERMISSION_SCAN_CREATE]: "Create new scans",
  [PERMISSION_SCAN_EDIT]: "Edit existing scans",
  [PERMISSION_SCAN_DELETE]: "Delete scans",
  [PERMISSION_SCAN_CONFIGURE]: "Configure scan settings",
  [PERMISSION_SCAN_EXECUTE]: "Execute scans",
  [PERMISSION_SCAN_MONITOR]: "Monitor scan progress",
  [PERMISSION_DASHBOARD_VIEW]: "View dashboards",
  [PERMISSION_DASHBOARD_EXPORT]: "Export dashboard data",
  [PERMISSION_LINEAGE_VIEW]: "View data lineage",
  [PERMISSION_LINEAGE_EXPORT]: "Export lineage data",
  [PERMISSION_COMPLIANCE_VIEW]: "View compliance reports",
  [PERMISSION_COMPLIANCE_EXPORT]: "Export compliance data",
  [PERMISSION_COMPLIANCE_MANAGE]: "Manage compliance rules",
  [PERMISSION_COMPLIANCE_AUDIT]: "Access compliance audit logs",
  [PERMISSION_RBAC_MANAGE]: "Manage RBAC system",
  [PERMISSION_USERS_MANAGE]: "Manage users",
  [PERMISSION_ROLES_MANAGE]: "Manage roles",
  [PERMISSION_PERMISSIONS_MANAGE]: "Manage permissions",
  [PERMISSION_GROUPS_MANAGE]: "Manage groups",
  [PERMISSION_RESOURCES_MANAGE]: "Manage resources"
};