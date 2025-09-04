// useCurrentUser Hook - Provides current user context and operations
// Maps to backend user management with real-time updates and comprehensive state management

import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '../services/user.service';
import { rbacWebSocketService } from '../services/websocket.service';
import { useAuth } from './useAuth';
import type { User } from '../types/user.types';
import type { Permission } from '../types/permission.types';
import type { Role } from '../types/role.types';
import type { Group } from '../types/group.types';

export interface UserPermissions {
  direct: Permission[];
  inherited: Permission[];
  effective: Permission[];
  source: Record<string, 'direct' | 'role' | 'group' | 'inherited'>;
  conditions: Record<string, any>;
}

export interface UserActivitySession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isCurrent: boolean;
}

export interface CurrentUserState {
  user: User | null;
  permissions: UserPermissions | null;
  roles: Role[];
  groups: Group[];
  sessions: UserActivitySession[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export interface CurrentUserMethods {
  // Profile Management
  updateProfile: (updates: Partial<User>) => Promise<User>;
  uploadProfilePicture: (file: File) => Promise<string>;
  removeProfilePicture: () => Promise<void>;
  
  // Permission Management
  refreshPermissions: () => Promise<UserPermissions>;
  checkPermission: (action: string, resource?: string, resourceId?: string) => boolean;
  checkPermissions: (checks: Array<{ action: string; resource?: string; resourceId?: string }>) => Record<string, boolean>;
  getEffectivePermissions: (resourceType?: string, resourceId?: string) => Promise<Permission[]>;
  
  // Role Management
  refreshRoles: () => Promise<Role[]>;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  
  // Group Management
  refreshGroups: () => Promise<Group[]>;
  isMemberOf: (groupName: string) => boolean;
  isMemberOfAny: (groupNames: string[]) => boolean;
  isMemberOfAll: (groupNames: string[]) => boolean;
  
  // Session Management
  refreshSessions: () => Promise<UserActivitySession[]>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllOtherSessions: () => Promise<void>;
  
  // Activity Tracking
  updateActivity: () => void;
  getActivitySummary: (days?: number) => Promise<any>;
  
  // Preferences & Settings
  updatePreferences: (preferences: Record<string, any>) => Promise<void>;
  getPreferences: () => Record<string, any>;
  resetPreferences: () => Promise<void>;
  
  // Security
  enableTwoFactor: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  disableTwoFactor: (password: string) => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  
  // Utility
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export interface UseCurrentUserReturn extends CurrentUserState, CurrentUserMethods {}

export function useCurrentUser(): UseCurrentUserReturn {
  const { user: authUser, isAuthenticated, sessionToken } = useAuth();
  
  const [state, setState] = useState<CurrentUserState>({
    user: null,
    permissions: null,
    roles: [],
    groups: [],
    sessions: [],
    isLoading: false,
    isRefreshing: false,
    lastUpdated: null,
    error: null
  });

  // Auto-refresh intervals
  const PERMISSIONS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const SESSIONS_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  // Initialize and sync with auth user
  useEffect(() => {
    if (isAuthenticated && authUser) {
      setState(prev => ({
        ...prev,
        user: authUser,
        isLoading: true
      }));
      
      // Initial data load
      loadUserData();
    } else {
      // Clear state when user logs out
      setState({
        user: null,
        permissions: null,
        roles: [],
        groups: [],
        sessions: [],
        isLoading: false,
        isRefreshing: false,
        lastUpdated: null,
        error: null
      });
    }
  }, [isAuthenticated, authUser]);

  // Set up real-time updates
  useEffect(() => {
    if (isAuthenticated && authUser) {
      // Subscribe to permission changes
      const permissionSubscription = rbacWebSocketService.onPermissionChanged(
        (event) => {
          if (event.userId === authUser.id) {
            refreshPermissions();
          }
        },
        { userId: authUser.id }
      );

      // Subscribe to role assignments
      const roleSubscription = rbacWebSocketService.onRoleAssigned(
        (event) => {
          if (event.userId === authUser.id) {
            refreshRoles();
            refreshPermissions(); // Permissions might change with role changes
          }
        },
        { userId: authUser.id }
      );

      // Subscribe to user activity
      const activitySubscription = rbacWebSocketService.onUserActivity(
        (event) => {
          if (event.userId === authUser.id) {
            updateActivity();
          }
        },
        { userId: authUser.id }
      );

      return () => {
        rbacWebSocketService.unsubscribe(permissionSubscription);
        rbacWebSocketService.unsubscribe(roleSubscription);
        rbacWebSocketService.unsubscribe(activitySubscription);
      };
    }
  }, [isAuthenticated, authUser]);

  // Auto-refresh permissions periodically
  useEffect(() => {
    if (isAuthenticated && authUser) {
      const interval = setInterval(() => {
        refreshPermissions();
      }, PERMISSIONS_REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, authUser]);

  // Auto-refresh sessions periodically
  useEffect(() => {
    if (isAuthenticated && authUser) {
      const interval = setInterval(() => {
        refreshSessions();
      }, SESSIONS_REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, authUser]);

  const loadUserData = useCallback(async () => {
    if (!authUser) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load all user data in parallel
      const [permissionsResult, rolesResult, groupsResult, sessionsResult] = await Promise.allSettled([
        refreshPermissions(),
        refreshRoles(),
        refreshGroups(),
        refreshSessions()
      ]);

      // Handle any errors
      const errors = [permissionsResult, rolesResult, groupsResult, sessionsResult]
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason);

      if (errors.length > 0) {
        console.warn('Some user data failed to load:', errors);
        setState(prev => ({ 
          ...prev, 
          error: `Failed to load some user data: ${errors.join(', ')}`,
          isLoading: false,
          lastUpdated: new Date()
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          lastUpdated: new Date(),
          error: null
        }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load user data'
      }));
    }
  }, [authUser]);

  // === Profile Management ===

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<User> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.updateUser(authUser.id, updates);
      const updatedUser = response.data;
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        lastUpdated: new Date()
      }));
      
      return updatedUser;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update profile'
      }));
      throw error;
    }
  }, [authUser]);

  const uploadProfilePicture = useCallback(async (file: File): Promise<string> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.uploadProfilePicture(authUser.id, file);
      const profilePictureUrl = response.data.url;
      
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, profilePictureUrl } : null,
        lastUpdated: new Date()
      }));
      
      return profilePictureUrl;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to upload profile picture'
      }));
      throw error;
    }
  }, [authUser]);

  const removeProfilePicture = useCallback(async (): Promise<void> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      await userService.removeProfilePicture(authUser.id);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, profilePictureUrl: null } : null,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to remove profile picture'
      }));
      throw error;
    }
  }, [authUser]);

  // === Permission Management ===

  const refreshPermissions = useCallback(async (): Promise<UserPermissions> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      
      const response = await userService.getUserEffectivePermissions(authUser.id);
      const permissions: UserPermissions = {
        direct: response.data.direct || [],
        inherited: response.data.inherited || [],
        effective: response.data.effective || [],
        source: response.data.source || {},
        conditions: response.data.conditions || {}
      };
      
      setState(prev => ({
        ...prev,
        permissions,
        isRefreshing: false,
        lastUpdated: new Date()
      }));
      
      return permissions;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Failed to refresh permissions'
      }));
      throw error;
    }
  }, [authUser]);

  const checkPermission = useCallback((
    action: string, 
    resource?: string, 
    resourceId?: string
  ): boolean => {
    if (!state.permissions) return false;
    
    return state.permissions.effective.some(permission => {
      const actionMatch = permission.action === action || permission.action === '*';
      const resourceMatch = !resource || permission.resource === resource || permission.resource === '*';
      const resourceIdMatch = !resourceId || permission.resourceId === resourceId || !permission.resourceId;
      
      return actionMatch && resourceMatch && resourceIdMatch;
    });
  }, [state.permissions]);

  const checkPermissions = useCallback((
    checks: Array<{ action: string; resource?: string; resourceId?: string }>
  ): Record<string, boolean> => {
    const results: Record<string, boolean> = {};
    
    checks.forEach((check, index) => {
      const key = `${check.action}_${check.resource || 'any'}_${check.resourceId || 'any'}`;
      results[key] = checkPermission(check.action, check.resource, check.resourceId);
    });
    
    return results;
  }, [checkPermission]);

  const getEffectivePermissions = useCallback(async (
    resourceType?: string, 
    resourceId?: string
  ): Promise<Permission[]> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.getUserEffectivePermissions(
        authUser.id,
        resourceType,
        resourceId,
        true,
        true
      );
      return response.data.effective || [];
    } catch (error) {
      console.error('Failed to get effective permissions:', error);
      return [];
    }
  }, [authUser]);

  // === Role Management ===

  const refreshRoles = useCallback(async (): Promise<Role[]> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.getUserRoles(authUser.id);
      const roles = response.data;
      
      setState(prev => ({
        ...prev,
        roles,
        lastUpdated: new Date()
      }));
      
      return roles;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to refresh roles'
      }));
      throw error;
    }
  }, [authUser]);

  const hasRole = useCallback((roleName: string): boolean => {
    return state.roles.some(role => role.name === roleName);
  }, [state.roles]);

  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  }, [hasRole]);

  const hasAllRoles = useCallback((roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  }, [hasRole]);

  // === Group Management ===

  const refreshGroups = useCallback(async (): Promise<Group[]> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.getUserGroups(authUser.id);
      const groups = response.data;
      
      setState(prev => ({
        ...prev,
        groups,
        lastUpdated: new Date()
      }));
      
      return groups;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to refresh groups'
      }));
      throw error;
    }
  }, [authUser]);

  const isMemberOf = useCallback((groupName: string): boolean => {
    return state.groups.some(group => group.name === groupName);
  }, [state.groups]);

  const isMemberOfAny = useCallback((groupNames: string[]): boolean => {
    return groupNames.some(groupName => isMemberOf(groupName));
  }, [isMemberOf]);

  const isMemberOfAll = useCallback((groupNames: string[]): boolean => {
    return groupNames.every(groupName => isMemberOf(groupName));
  }, [isMemberOf]);

  // === Session Management ===

  const refreshSessions = useCallback(async (): Promise<UserActivitySession[]> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.getUserSessions(authUser.id);
      const sessions: UserActivitySession[] = response.data.map((session: any) => ({
        id: session.id,
        startTime: new Date(session.createdAt),
        lastActivity: new Date(session.lastActivity),
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        isCurrent: session.id === sessionToken
      }));
      
      setState(prev => ({
        ...prev,
        sessions,
        lastUpdated: new Date()
      }));
      
      return sessions;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to refresh sessions'
      }));
      throw error;
    }
  }, [authUser, sessionToken]);

  const terminateSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      await userService.terminateSession(sessionId);
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(session => session.id !== sessionId),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to terminate session'
      }));
      throw error;
    }
  }, [authUser]);

  const terminateAllOtherSessions = useCallback(async (): Promise<void> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      await userService.terminateAllOtherSessions();
      
      // Keep only current session
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(session => session.isCurrent),
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to terminate other sessions'
      }));
      throw error;
    }
  }, [authUser]);

  // === Activity Tracking ===

  const updateActivity = useCallback((): void => {
    // This is typically called automatically or triggered by user actions
    setState(prev => ({
      ...prev,
      lastUpdated: new Date()
    }));
  }, []);

  const getActivitySummary = useCallback(async (days: number = 30): Promise<any> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.getUserActivitySummary(authUser.id, days);
      return response.data;
    } catch (error) {
      console.error('Failed to get activity summary:', error);
      return null;
    }
  }, [authUser]);

  // === Preferences & Settings ===

  const updatePreferences = useCallback(async (preferences: Record<string, any>): Promise<void> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      await userService.updateUserPreferences(authUser.id, preferences);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, preferences: { ...prev.user.preferences, ...preferences } } : null,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update preferences'
      }));
      throw error;
    }
  }, [authUser]);

  const getPreferences = useCallback((): Record<string, any> => {
    return state.user?.preferences || {};
  }, [state.user]);

  const resetPreferences = useCallback(async (): Promise<void> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      await userService.resetUserPreferences(authUser.id);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, preferences: {} } : null,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to reset preferences'
      }));
      throw error;
    }
  }, [authUser]);

  // === Security ===

  const enableTwoFactor = useCallback(async (): Promise<{ qrCode: string; backupCodes: string[] }> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.enableTwoFactor(authUser.id);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, mfaEnabled: true } : null,
        lastUpdated: new Date()
      }));
      
      return response.data;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to enable two-factor authentication'
      }));
      throw error;
    }
  }, [authUser]);

  const disableTwoFactor = useCallback(async (password: string): Promise<void> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      await userService.disableTwoFactor(authUser.id, password);
      
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, mfaEnabled: false } : null,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to disable two-factor authentication'
      }));
      throw error;
    }
  }, [authUser]);

  const generateBackupCodes = useCallback(async (): Promise<string[]> => {
    if (!authUser) throw new Error('User not authenticated');

    try {
      const response = await userService.generateBackupCodes(authUser.id);
      return response.data.codes;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to generate backup codes'
      }));
      throw error;
    }
  }, [authUser]);

  // === Utility ===

  const refresh = useCallback(async (): Promise<void> => {
    await loadUserData();
  }, [loadUserData]);

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      permissions: null,
      roles: [],
      groups: [],
      sessions: [],
      lastUpdated: null,
      error: null
    }));
  }, []);

  // Computed values
  const computedValues = useMemo(() => ({
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),
    hasAnyAdminRole: hasAnyRole(['admin', 'super_admin', 'system_admin']),
    totalPermissions: state.permissions?.effective.length || 0,
    totalRoles: state.roles.length,
    totalGroups: state.groups.length,
    activeSessions: state.sessions.length,
    isProfileComplete: state.user ? !!(state.user.firstName && state.user.lastName && state.user.email) : false
  }), [state, hasRole, hasAnyRole]);

  return {
    ...state,
    ...computedValues,
    
    // Profile Management
    updateProfile,
    uploadProfilePicture,
    removeProfilePicture,
    
    // Permission Management
    refreshPermissions,
    checkPermission,
    checkPermissions,
    getEffectivePermissions,
    
    // Role Management
    refreshRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Group Management
    refreshGroups,
    isMemberOf,
    isMemberOfAny,
    isMemberOfAll,
    
    // Session Management
    refreshSessions,
    terminateSession,
    terminateAllOtherSessions,
    
    // Activity Tracking
    updateActivity,
    getActivitySummary,
    
    // Preferences & Settings
    updatePreferences,
    getPreferences,
    resetPreferences,
    
    // Security
    enableTwoFactor,
    disableTwoFactor,
    generateBackupCodes,
    
    // Utility
    refresh,
    clearCache
  };
}

export default useCurrentUser;