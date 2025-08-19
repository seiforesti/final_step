/**
 * User model representing a system user with roles and permissions
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  avatarUrl?: string;
  roles: Role[];
  permissions: Permission[];
  flatPermissions?: string[]; // Flat array of permission keys for RBACProvider
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

/**
 * Role model representing a collection of permissions
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  isBuiltIn: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission model representing a single permission in the system
 */
export interface Permission {
  id: string;
  key: string; // Unique identifier for the permission (e.g., 'data_source.view')
  name: string;
  description?: string;
  category: string; // Grouping category (e.g., 'data_source', 'sensitivity', 'admin')
  isBuiltIn: boolean;
  abacRules?: AbacRule[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Attribute-Based Access Control rule for context-aware permissions
 */
export interface AbacRule {
  id: string;
  condition: string; // JSON or expression string representing the condition
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User preferences for customizing the application experience
 */
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    digest: "none" | "daily" | "weekly";
  };
  dashboard: {
    defaultView: string;
    widgets: string[];
  };
  tableView: {
    pageSize: number;
    showFilters: boolean;
  };
}

/**
 * User session information
 */
export interface UserSession {
  userId: string;
  token: string;
  expiresAt: string;
  issuedAt: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

/**
 * Audit event for user actions
 */
export interface UserAuditEvent {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  status: "success" | "failure";
}
