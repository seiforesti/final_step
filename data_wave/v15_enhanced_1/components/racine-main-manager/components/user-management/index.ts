// ============================================================================
// USER MANAGEMENT COMPONENTS - INDEX EXPORTS
// ============================================================================
// Central export file for all user management components
// Enables proper module resolution for app pages

export { default as UserProfileManager } from './UserProfileManager';
export { default as UserPreferencesEngine } from './UserPreferencesEngine';
export { default as UserAnalyticsDashboard } from './UserAnalyticsDashboard';
export { default as SecurityAuditDashboard } from './SecurityAuditDashboard';
export { default as RBACVisualizationDashboard } from './RBACVisualizationDashboard';
export { default as NotificationPreferencesCenter } from './NotificationPreferencesCenter';
export { default as EnterpriseAuthenticationCenter } from './EnterpriseAuthenticationCenter';
export { default as CrossGroupAccessManager } from './CrossGroupAccessManager';
export { default as APIKeyManagementCenter } from './APIKeyManagementCenter';

// Re-export types and utilities
export type { 
  UserProfile, 
  UserPreferences, 
  UserPermissions,
  SecurityAudit,
  RBACRole
} from '../../types/racine-core.types';
