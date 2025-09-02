// API Endpoint Constants - Maps to backend route definitions

// Base API URL - should be configurable via environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  GOOGLE_LOGIN: '/auth/google',
  GOOGLE_CALLBACK: '/auth/google/callback',
  MICROSOFT_LOGIN: '/auth/microsoft',
  MICROSOFT_CALLBACK: '/auth/microsoft/callback',
  EMAIL_LOGIN: '/auth/email',
  EMAIL_SIGNUP: '/auth/signup',
  EMAIL_VERIFY: '/auth/verify',
  MFA_VERIFY: '/auth/mfa/verify',
  REGISTER_WITH_INVITE: '/auth/register'
};

// RBAC endpoints
export const RBAC_ENDPOINTS = {
  // Current user
  ME: '/auth/me',
  ME_FLAT_PERMISSIONS: '/rbac/me/flat-permissions',
  
  // Users
  USERS: '/rbac/users',
  USER_DEACTIVATE: (userId: number) => `/rbac/users/${userId}/deactivate`,
  USER_ACTIVATE: (userId: number) => `/rbac/users/${userId}/activate`,
  USER_REACTIVATE: (userId: number) => `/rbac/users/${userId}/reactivate`,
  USER_REMOVE_ROLE: (userId: number) => `/rbac/users/${userId}/remove-role`,
  USERS_BULK_ASSIGN_ROLES: '/rbac/users/bulk-assign-roles',
  USERS_BULK_REMOVE_ROLES: '/rbac/users/bulk-remove-roles',
  USERS_BULK_ASSIGN_ROLES_EFFICIENT: '/rbac/users/bulk-assign-roles-efficient',
  USERS_BULK_REMOVE_ROLES_EFFICIENT: '/rbac/users/bulk-remove-roles-efficient',
  
  // Roles
  ROLES: '/rbac/roles',
  ROLE: (roleId: number) => `/rbac/roles/${roleId}`,
  ROLE_PARENTS: (roleId: number) => `/rbac/roles/${roleId}/parents`,
  ROLE_CHILDREN: (roleId: number) => `/rbac/roles/${roleId}/children`,
  ROLE_EFFECTIVE_PERMISSIONS: (roleId: number) => `/rbac/roles/${roleId}/effective-permissions`,
  ROLE_REMOVE_PARENT: (roleId: number, parentId: number) => `/rbac/roles/${roleId}/parents/${parentId}`,
  ROLES_SELECTED_PERMISSIONS: '/rbac/roles/selected-permissions',
  ROLES_BULK_PERMISSIONS: '/rbac/roles/bulk-permissions',
  ROLES_BULK_ASSIGN_PERMISSIONS: '/rbac/roles/bulk-assign-permissions',
  ROLES_BULK_REMOVE_PERMISSIONS: '/rbac/roles/bulk-remove-permissions',
  ROLES_BULK_ASSIGN_PERMISSIONS_EFFICIENT: '/rbac/roles/bulk-assign-permissions-efficient',
  ROLES_BULK_REMOVE_PERMISSIONS_EFFICIENT: '/rbac/roles/bulk-remove-permissions-efficient',
  
  // Permissions
  PERMISSIONS: '/rbac/permissions',
  PERMISSION: (permissionId: number) => `/rbac/permissions/${permissionId}`,
  
  // Groups
  GROUPS: '/rbac/groups',
  GROUP: (groupId: number) => `/rbac/groups/${groupId}`,
  GROUP_ADD_USER: (groupId: number) => `/rbac/groups/${groupId}/add-user`,
  GROUP_REMOVE_USER: (groupId: number) => `/rbac/groups/${groupId}/remove-user`,
  GROUP_ASSIGN_ROLE: (groupId: number) => `/rbac/groups/${groupId}/assign-role`,
  GROUP_REMOVE_ROLE: (groupId: number) => `/rbac/groups/${groupId}/remove-role`,
  GROUP_MEMBERS: (groupId: number) => `/rbac/groups/${groupId}/members`,
  GROUP_ROLES: (groupId: number) => `/rbac/groups/${groupId}/roles`,
  
  // Resources
  RESOURCES: '/rbac/resources',
  RESOURCE: (resourceId: number) => `/rbac/resources/${resourceId}`,
  RESOURCE_TREE: '/rbac/resources/tree',
  RESOURCE_ANCESTORS: (resourceId: number) => `/rbac/resources/${resourceId}/ancestors`,
  RESOURCE_DESCENDANTS: (resourceId: number) => `/rbac/resources/${resourceId}/descendants`,
  RESOURCE_ASSIGN_ROLE: (resourceId: number) => `/rbac/resources/${resourceId}/assign-role`,
  RESOURCE_ROLES: (resourceId: number) => `/rbac/resources/${resourceId}/roles`,
  RESOURCE_EFFECTIVE_PERMISSIONS: (resourceId: number) => `/rbac/resources/${resourceId}/effective-permissions`,
  RESOURCE_EFFECTIVE_USER_PERMISSIONS: (resourceId: number) => `/rbac/resources/${resourceId}/effective-user-permissions`,
  
  // Data Source Integration
  RESOURCES_SYNC_DATA_SOURCES: '/rbac/resources/sync-data-sources',
  RESOURCES_DATA_SOURCE: (dataSourceId: number) => `/rbac/resources/data-source/${dataSourceId}`,
  RESOURCES_DATA_SOURCE_HIERARCHY: (dataSourceId: number) => `/rbac/resources/data-source/${dataSourceId}/hierarchy`,
  RESOURCES_DATA_SOURCE_SCHEMAS: (dataSourceId: number) => `/rbac/resources/data-source/${dataSourceId}/schemas`,
  RESOURCES_SCHEMA_TABLES: (schemaResourceId: number) => `/rbac/resources/schema/${schemaResourceId}/tables`,
  
  // Deny Assignments
  DENY_ASSIGNMENTS: '/rbac/deny-assignments',
  DENY_ASSIGNMENT: (denyId: number) => `/rbac/deny-assignments/${denyId}`,
  
  // Condition Templates
  CONDITION_TEMPLATES: '/rbac/condition-templates',
  CONDITION_TEMPLATE: (templateId: number) => `/rbac/condition-templates/${templateId}`,
  CONDITION_TEMPLATES_HELPERS: '/rbac/condition-templates/helpers',
  VALIDATE_CONDITION: '/rbac/validate-condition',
  
  // Access Requests
  ACCESS_REQUESTS: '/rbac/access-requests',
  REQUEST_ACCESS: '/rbac/request-access',
  ACCESS_REVIEW: '/rbac/access-review',
  ACCESS_REVIEW_TRIGGER: '/rbac/access-review/trigger',
  
  // Audit Logs
  AUDIT_LOGS: '/rbac/audit-logs',
  AUDIT_LOGS_FILTER: '/rbac/audit-logs/filter',
  AUDIT_LOGS_ENTITY_HISTORY: '/rbac/audit-logs/entity-history',
  
  // Role Assignments
  ROLE_ASSIGNMENTS: '/rbac/role-assignments',
  ASSIGN_ROLE_SCOPE: '/rbac/assign-role-scope',
  RESOURCE_ROLES_LIST: '/rbac/resource-roles',
  
  // Built-in Roles
  BUILTIN_ROLES: '/rbac/builtin-roles',
  
  // ABAC Testing
  TEST_ABAC: '/rbac/test-abac',
  
  // User Effective Permissions
  USER_EFFECTIVE_PERMISSIONS_V2: (userId: number) => `/rbac/users/${userId}/effective-permissions-v2`,
  
  // Permission Diff
  PERMISSION_DIFF: '/rbac/permission-diff'
};

// WebSocket endpoints
export const WEBSOCKET_ENDPOINTS = {
  RBAC_EVENTS: '/ws/rbac'
};

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;

// Request headers
export const REQUEST_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept'
};

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded'
};

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// API timeout settings
export const API_TIMEOUT = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 120000, // 2 minutes
  LONG_RUNNING: 300000 // 5 minutes
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100
};

// Export format options
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
  EXCEL: 'xlsx'
} as const;