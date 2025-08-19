// useRBACState Hook - Global RBAC state management and coordination
// Provides centralized state management for the entire RBAC system

import { useState, useEffect, useCallback, useMemo, useContext, createContext } from 'react';
import { useAuth } from './useAuth';
import { useCurrentUser } from './useCurrentUser';
import { useUsers } from './useUsers';
import { useRoles } from './useRoles';
import { usePermissions } from './usePermissions';
import { useResources } from './useResources';
import { useGroups } from './useGroups';
import { useAuditLogs } from './useAuditLogs';
import { useConditions } from './useConditions';
import { useAccessRequests } from './useAccessRequests';
import { useRBACWebSocket } from './useRBACWebSocket';
import { usePermissionCheck } from './usePermissionCheck';
import type { User } from '../types/user.types';

export interface RBACSystemState {
  // Authentication State
  isAuthenticated: boolean;
  currentUser: User | null;
  sessionStatus: 'active' | 'expired' | 'inactive';
  
  // System Status
  isInitialized: boolean;
  isLoading: boolean;
  hasErrors: boolean;
  lastSync: Date | null;
  
  // Entity Counts
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalResources: number;
  totalGroups: number;
  totalAccessRequests: number;
  
  // Real-time Status
  isConnected: boolean;
  pendingEvents: number;
  
  // System Health
  systemHealth: 'healthy' | 'warning' | 'critical';
  performanceMetrics: any;
}

export interface RBACSystemMethods {
  // System Operations
  initializeSystem: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  resetSystem: () => void;
  
  // Cross-Entity Operations
  performBulkOperation: (operation: string, data: any) => Promise<any>;
  syncWithBackend: () => Promise<void>;
  
  // System Analytics
  getSystemAnalytics: () => Promise<any>;
  getPerformanceMetrics: () => Promise<any>;
  getSystemHealth: () => Promise<any>;
  
  // State Management
  subscribeToStateChanges: (callback: (state: RBACSystemState) => void) => () => void;
  getEntityState: (entityType: string) => any;
  updateEntityState: (entityType: string, updates: any) => void;
  
  // Utility
  exportSystemState: () => Promise<any>;
  importSystemState: (data: any) => Promise<void>;
}

export interface RBACSystemContext extends RBACSystemState, RBACSystemMethods {
  // Sub-hooks
  auth: ReturnType<typeof useAuth>;
  currentUser: ReturnType<typeof useCurrentUser>;
  users: ReturnType<typeof useUsers>;
  roles: ReturnType<typeof useRoles>;
  permissions: ReturnType<typeof usePermissions>;
  resources: ReturnType<typeof useResources>;
  groups: ReturnType<typeof useGroups>;
  auditLogs: ReturnType<typeof useAuditLogs>;
  conditions: ReturnType<typeof useConditions>;
  accessRequests: ReturnType<typeof useAccessRequests>;
  webSocket: ReturnType<typeof useRBACWebSocket>;
  permissionCheck: ReturnType<typeof usePermissionCheck>;
}

const RBACStateContext = createContext<RBACSystemContext | null>(null);

export function useRBACState(): RBACSystemContext {
  const context = useContext(RBACStateContext);
  if (!context) {
    throw new Error('useRBACState must be used within an RBACStateProvider');
  }
  return context;
}

export function useRBACStateManager(): RBACSystemContext {
  // Initialize all sub-hooks
  const auth = useAuth();
  const currentUser = useCurrentUser();
  const users = useUsers({}, false); // Don't auto-load
  const roles = useRoles({}, false);
  const permissions = usePermissions({}, false);
  const resources = useResources({}, false);
  const groups = useGroups({}, false);
  const auditLogs = useAuditLogs({}, false);
  const conditions = useConditions({}, false);
  const accessRequests = useAccessRequests({}, false);
  const webSocket = useRBACWebSocket(false); // Don't auto-connect
  const permissionCheck = usePermissionCheck();

  const [systemState, setSystemState] = useState<RBACSystemState>({
    // Authentication State
    isAuthenticated: false,
    currentUser: null,
    sessionStatus: 'inactive',
    
    // System Status
    isInitialized: false,
    isLoading: false,
    hasErrors: false,
    lastSync: null,
    
    // Entity Counts
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    totalResources: 0,
    totalGroups: 0,
    totalAccessRequests: 0,
    
    // Real-time Status
    isConnected: false,
    pendingEvents: 0,
    
    // System Health
    systemHealth: 'healthy',
    performanceMetrics: null
  });

  const stateChangeCallbacks = useMemo(() => new Set<(state: RBACSystemState) => void>(), []);

  // Sync authentication state
  useEffect(() => {
    setSystemState(prev => ({
      ...prev,
      isAuthenticated: auth.isAuthenticated,
      currentUser: auth.user,
      sessionStatus: auth.isAuthenticated ? 'active' : 'inactive'
    }));
  }, [auth.isAuthenticated, auth.user]);

  // Sync entity counts
  useEffect(() => {
    setSystemState(prev => ({
      ...prev,
      totalUsers: users.totalCount,
      totalRoles: roles.totalCount,
      totalPermissions: permissions.totalCount,
      totalResources: resources.totalCount,
      totalGroups: groups.totalCount,
      totalAccessRequests: accessRequests.totalCount
    }));
  }, [
    users.totalCount,
    roles.totalCount,
    permissions.totalCount,
    resources.totalCount,
    groups.totalCount,
    accessRequests.totalCount
  ]);

  // Sync WebSocket connection status
  useEffect(() => {
    setSystemState(prev => ({
      ...prev,
      isConnected: webSocket.isConnected,
      pendingEvents: webSocket.eventHistory.length
    }));
  }, [webSocket.isConnected, webSocket.eventHistory.length]);

  // Monitor system health
  useEffect(() => {
    const hasErrors = [
      auth.error,
      users.error,
      roles.error,
      permissions.error,
      resources.error,
      groups.error,
      auditLogs.error,
      conditions.error,
      accessRequests.error,
      webSocket.error,
      permissionCheck.error
    ].some(error => error !== null);

    const isLoading = [
      auth.isLoading,
      users.isLoading,
      roles.isLoading,
      permissions.isLoading,
      resources.isLoading,
      groups.isLoading,
      auditLogs.isLoading,
      conditions.isLoading,
      accessRequests.isLoading,
      permissionCheck.isLoading
    ].some(loading => loading);

    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (hasErrors) {
      systemHealth = 'critical';
    } else if (!webSocket.isConnected && auth.isAuthenticated) {
      systemHealth = 'warning';
    }

    setSystemState(prev => ({
      ...prev,
      hasErrors,
      isLoading,
      systemHealth
    }));
  }, [
    auth.error, auth.isLoading,
    users.error, users.isLoading,
    roles.error, roles.isLoading,
    permissions.error, permissions.isLoading,
    resources.error, resources.isLoading,
    groups.error, groups.isLoading,
    auditLogs.error, auditLogs.isLoading,
    conditions.error, conditions.isLoading,
    accessRequests.error, accessRequests.isLoading,
    webSocket.error,
    permissionCheck.error, permissionCheck.isLoading
  ]);

  // Notify state change callbacks
  useEffect(() => {
    stateChangeCallbacks.forEach(callback => {
      try {
        callback(systemState);
      } catch (error) {
        console.error('Error in state change callback:', error);
      }
    });
  }, [systemState, stateChangeCallbacks]);

  // === System Operations ===

  const initializeSystem = useCallback(async (): Promise<void> => {
    try {
      setSystemState(prev => ({ ...prev, isLoading: true }));

      if (auth.isAuthenticated) {
        // Connect WebSocket
        webSocket.connect();

        // Load initial data in parallel
        await Promise.all([
          users.loadUsers(1),
          roles.loadRoles(1),
          permissions.loadPermissions(1),
          resources.loadResources(1),
          groups.loadGroups(1),
          auditLogs.loadAuditLogs(1),
          conditions.loadConditionTemplates(1),
          accessRequests.loadAccessRequests(1)
        ]);

        setSystemState(prev => ({
          ...prev,
          isInitialized: true,
          lastSync: new Date()
        }));
      }
    } catch (error) {
      console.error('Failed to initialize system:', error);
    } finally {
      setSystemState(prev => ({ ...prev, isLoading: false }));
    }
  }, [
    auth.isAuthenticated,
    webSocket,
    users,
    roles,
    permissions,
    resources,
    groups,
    auditLogs,
    conditions,
    accessRequests
  ]);

  const refreshAllData = useCallback(async (): Promise<void> => {
    try {
      setSystemState(prev => ({ ...prev, isLoading: true }));

      // Refresh all data sources
      await Promise.all([
        users.refreshUsers(),
        roles.refreshRoles(),
        permissions.refreshPermissions(),
        resources.refreshResources(),
        groups.refreshGroups(),
        auditLogs.refreshAuditLogs(),
        conditions.refreshConditionTemplates(),
        accessRequests.refreshAccessRequests(),
        currentUser.refresh()
      ]);

      setSystemState(prev => ({
        ...prev,
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Failed to refresh all data:', error);
    } finally {
      setSystemState(prev => ({ ...prev, isLoading: false }));
    }
  }, [
    users,
    roles,
    permissions,
    resources,
    groups,
    auditLogs,
    conditions,
    accessRequests,
    currentUser
  ]);

  const resetSystem = useCallback((): void => {
    // Clear all caches
    users.clearCache();
    roles.clearCache();
    permissions.clearCache();
    resources.clearCache();
    groups.clearCache();
    auditLogs.clearCache();
    conditions.clearCache();
    accessRequests.clearCache();
    permissionCheck.clearCache();

    // Disconnect WebSocket
    webSocket.disconnect();

    setSystemState(prev => ({
      ...prev,
      isInitialized: false,
      lastSync: null,
      totalUsers: 0,
      totalRoles: 0,
      totalPermissions: 0,
      totalResources: 0,
      totalGroups: 0,
      totalAccessRequests: 0,
      pendingEvents: 0
    }));
  }, [
    users,
    roles,
    permissions,
    resources,
    groups,
    auditLogs,
    conditions,
    accessRequests,
    permissionCheck,
    webSocket
  ]);

  // === Cross-Entity Operations ===

  const performBulkOperation = useCallback(async (operation: string, data: any): Promise<any> => {
    try {
      setSystemState(prev => ({ ...prev, isLoading: true }));

      switch (operation) {
        case 'bulk_assign_roles':
          return await users.bulkAssignRoles(data.userIds, data.roleIds);
        case 'bulk_create_users':
          return await users.bulkCreateUsers(data.users);
        case 'bulk_update_permissions':
          return await permissions.bulkUpdatePermissions(data.updates);
        default:
          throw new Error(`Unknown bulk operation: ${operation}`);
      }
    } catch (error) {
      console.error(`Failed to perform bulk operation ${operation}:`, error);
      throw error;
    } finally {
      setSystemState(prev => ({ ...prev, isLoading: false }));
    }
  }, [users, permissions]);

  const syncWithBackend = useCallback(async (): Promise<void> => {
    await refreshAllData();
  }, [refreshAllData]);

  // === System Analytics ===

  const getSystemAnalytics = useCallback(async (): Promise<any> => {
    try {
      const [userAnalytics, roleAnalytics, permissionAnalytics, auditAnalytics] = await Promise.all([
        users.getUserAnalytics(),
        roles.getRoleAnalytics(),
        permissions.getPermissionAnalytics(),
        auditLogs.getAuditAnalytics()
      ]);

      return {
        users: userAnalytics,
        roles: roleAnalytics,
        permissions: permissionAnalytics,
        audit: auditAnalytics,
        summary: {
          totalEntities: systemState.totalUsers + systemState.totalRoles + systemState.totalPermissions,
          systemHealth: systemState.systemHealth,
          lastSync: systemState.lastSync
        }
      };
    } catch (error) {
      console.error('Failed to get system analytics:', error);
      return null;
    }
  }, [users, roles, permissions, auditLogs, systemState]);

  const getPerformanceMetrics = useCallback(async (): Promise<any> => {
    try {
      const metrics = {
        responseTime: performance.now(),
        cacheHitRate: permissionCheck.cacheSize / Math.max(permissionCheck.cacheSize + 1, 1),
        entityCounts: {
          users: systemState.totalUsers,
          roles: systemState.totalRoles,
          permissions: systemState.totalPermissions,
          resources: systemState.totalResources,
          groups: systemState.totalGroups
        },
        realTimeStatus: {
          isConnected: systemState.isConnected,
          pendingEvents: systemState.pendingEvents,
          eventHistory: webSocket.eventHistory.length
        }
      };

      setSystemState(prev => ({
        ...prev,
        performanceMetrics: metrics
      }));

      return metrics;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return null;
    }
  }, [permissionCheck, systemState, webSocket]);

  const getSystemHealth = useCallback(async (): Promise<any> => {
    try {
      return {
        status: systemState.systemHealth,
        details: {
          authentication: auth.isAuthenticated ? 'healthy' : 'inactive',
          webSocket: webSocket.isConnected ? 'connected' : 'disconnected',
          dataLoading: systemState.isLoading ? 'loading' : 'idle',
          errors: systemState.hasErrors ? 'present' : 'none',
          lastSync: systemState.lastSync
        },
        recommendations: []
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      return null;
    }
  }, [systemState, auth, webSocket]);

  // === State Management ===

  const subscribeToStateChanges = useCallback((callback: (state: RBACSystemState) => void): (() => void) => {
    stateChangeCallbacks.add(callback);
    return () => {
      stateChangeCallbacks.delete(callback);
    };
  }, [stateChangeCallbacks]);

  const getEntityState = useCallback((entityType: string): any => {
    switch (entityType) {
      case 'users': return users;
      case 'roles': return roles;
      case 'permissions': return permissions;
      case 'resources': return resources;
      case 'groups': return groups;
      case 'auditLogs': return auditLogs;
      case 'conditions': return conditions;
      case 'accessRequests': return accessRequests;
      default: return null;
    }
  }, [users, roles, permissions, resources, groups, auditLogs, conditions, accessRequests]);

  const updateEntityState = useCallback((entityType: string, updates: any): void => {
    const entity = getEntityState(entityType);
    if (entity && typeof entity.updateState === 'function') {
      entity.updateState(updates);
    }
  }, [getEntityState]);

  // === Utility ===

  const exportSystemState = useCallback(async (): Promise<any> => {
    try {
      return {
        systemState,
        entities: {
          users: users.users,
          roles: roles.roles,
          permissions: permissions.permissions,
          resources: resources.resources,
          groups: groups.groups,
          conditions: conditions.conditionTemplates,
          accessRequests: accessRequests.accessRequests
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
      };
    } catch (error) {
      console.error('Failed to export system state:', error);
      throw error;
    }
  }, [systemState, users, roles, permissions, resources, groups, conditions, accessRequests]);

  const importSystemState = useCallback(async (data: any): Promise<void> => {
    try {
      setSystemState(prev => ({ ...prev, isLoading: true }));
      
      // Import would require careful validation and conflict resolution
      // This is a placeholder for the import logic
      console.log('Import system state:', data);
      
      await refreshAllData();
    } catch (error) {
      console.error('Failed to import system state:', error);
      throw error;
    } finally {
      setSystemState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshAllData]);

  // Auto-initialize when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && !systemState.isInitialized) {
      initializeSystem();
    }
  }, [auth.isAuthenticated, systemState.isInitialized, initializeSystem]);

  return {
    ...systemState,
    
    // Sub-hooks
    auth,
    currentUser,
    users,
    roles,
    permissions,
    resources,
    groups,
    auditLogs,
    conditions,
    accessRequests,
    webSocket,
    permissionCheck,
    
    // System Operations
    initializeSystem,
    refreshAllData,
    resetSystem,
    
    // Cross-Entity Operations
    performBulkOperation,
    syncWithBackend,
    
    // System Analytics
    getSystemAnalytics,
    getPerformanceMetrics,
    getSystemHealth,
    
    // State Management
    subscribeToStateChanges,
    getEntityState,
    updateEntityState,
    
    // Utility
    exportSystemState,
    importSystemState
  };
}

// RBAC State Provider Component
export function RBACStateProvider({ children }: { children: React.ReactNode }) {
  const rbacState = useRBACStateManager();
  
  return (
    <RBACStateContext.Provider value={rbacState}>
      {children}
    </RBACStateContext.Provider>
  );
}

export default useRBACState;