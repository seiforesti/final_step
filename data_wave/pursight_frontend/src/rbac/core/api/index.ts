/**
 * RBAC API Module
 * 
 * This is the main entry point for the RBAC API module.
 * It exports all the hooks and models for interacting with the RBAC API.
 */

// Export all models
export * from './models';

// Export all hooks
export * from './hooks';
export * from './userHooks';
export * from './resourceHooks';
export * from './auditHooks';
export * from './auditLogsApi';
export * from './accessRequestsApi';
export * from './resourceRolesApi';
export * from './roleManagementApi';
export * from './permissionsApi';

// Export API constants
export const RBAC_API_PREFIX = '/sensitivity-labels/rbac';