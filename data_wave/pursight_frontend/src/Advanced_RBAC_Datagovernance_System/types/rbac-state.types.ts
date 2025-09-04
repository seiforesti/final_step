// Global RBAC State Types - For state management across the system

import type { User } from './user.types';
import type { Role } from './role.types';
import type { Permission } from './permission.types';
import type { Resource } from './resource.types';
import type { Group } from './group.types';
import type { RbacAuditLog } from './audit.types';
import type { ConditionTemplate } from './condition.types';
import type { AccessRequest } from './access-request.types';

export interface RBACState {
  // Current user context
  currentUser: User | null;
  isAuthenticated: boolean;
  permissions: string[];
  
  // Entity states
  users: {
    items: User[];
    loading: boolean;
    error: string | null;
    filters: any;
    pagination: PaginationState;
  };
  
  roles: {
    items: Role[];
    loading: boolean;
    error: string | null;
    filters: any;
    pagination: PaginationState;
  };
  
  permissions: {
    items: Permission[];
    loading: boolean;
    error: string | null;
    filters: any;
    pagination: PaginationState;
  };
  
  resources: {
    items: Resource[];
    tree: ResourceTree[];
    loading: boolean;
    error: string | null;
    filters: any;
    pagination: PaginationState;
  };
  
  groups: {
    items: Group[];
    loading: boolean;
    error: string | null;
    filters: any;
    pagination: PaginationState;
  };
  
  auditLogs: {
    items: RbacAuditLog[];
    loading: boolean;
    error: string | null;
    filters: any;
    pagination: PaginationState;
  };
  
  conditionTemplates: {
    items: ConditionTemplate[];
    loading: boolean;
    error: string | null;
  };
  
  accessRequests: {
    items: AccessRequest[];
    loading: boolean;
    error: string | null;
    filters: any;
    pagination: PaginationState;
  };
  
  // UI state
  ui: {
    activeModule: RBACModule;
    sidebarCollapsed: boolean;
    selectedItems: Record<string, number[]>;
    bulkActions: Record<string, boolean>;
    modals: Record<string, boolean>;
    notifications: Notification[];
  };
  
  // WebSocket state
  websocket: {
    connected: boolean;
    reconnecting: boolean;
    lastMessage: any;
    error: string | null;
  };
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ResourceTree {
  resource: Resource;
  children: ResourceTree[];
  level: number;
}

export type RBACModule = 
  | 'users' 
  | 'roles' 
  | 'permissions' 
  | 'resources' 
  | 'groups' 
  | 'conditions' 
  | 'access-requests' 
  | 'audit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

export interface RBACAction {
  type: string;
  payload?: any;
  meta?: {
    timestamp: string;
    user: string;
    correlation_id?: string;
  };
}

export interface RBACContextValue {
  state: RBACState;
  dispatch: (action: RBACAction) => void;
  
  // Helper functions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  
  // Convenience functions
  getCurrentUser: () => User | null;
  getEffectivePermissions: () => string[];
  isLoading: (module: RBACModule) => boolean;
  getError: (module: RBACModule) => string | null;
}

export interface WebSocketMessage {
  type: 'rbac_event';
  event: string;
  data?: any;
  timestamp: string;
  correlation_id?: string;
}

export interface RBACError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: {
    module: RBACModule;
    action: string;
    user: string;
  };
}