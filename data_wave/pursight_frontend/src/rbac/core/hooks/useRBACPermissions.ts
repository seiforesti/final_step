/**
 * useRBACPermissions Hook
 * 
 * This hook provides utilities for working with RBAC permissions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Permission } from '../api/models';
import { permissionsApi } from '../api/permissionsApi';
import { useAuth } from '../../../auth/hooks/useAuth';

/**
 * Interface for the useRBACPermissions hook return value
 */
interface UseRBACPermissionsReturn {
  // Check if the current user has a specific permission
  hasPermission: (action: string, resource: string, conditions?: Record<string, any>) => boolean;
  
  // Check if the current user has any of the specified permissions
  hasAnyPermission: (permissions: Array<{ action: string; resource: string }>) => boolean;
  
  // Check if the current user has all of the specified permissions
  hasAllPermissions: (permissions: Array<{ action: string; resource: string }>) => boolean;
  
  // Get all permissions of the current user
  getUserPermissions: () => Permission[];
  
  // Check if the current user has a specific role
  hasRole: (roleName: string) => boolean;
  
  // Check if the current user has any of the specified roles
  hasAnyRole: (roleNames: string[]) => boolean;
  
  // Get all roles of the current user
  getUserRoles: () => string[];
  
  // Check if the current user is an admin
  isAdmin: () => boolean;
}

/**
 * Hook for working with RBAC permissions
 */
export const useRBACPermissions = (): UseRBACPermissionsReturn => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user permissions
   */
  const fetchUserPermissions = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userPermissions = await permissionsApi.getUserPermissions(userId);
      setPermissions(userPermissions);
      
      const userRoles = await permissionsApi.getUserRoles(userId);
      setRoles(userRoles);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching user permissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load permissions on mount and when userId changes
  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = useCallback(async (action: string, resource: string, conditions?: Record<string, any>): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      return await permissionsApi.checkUserPermission(userId, action, resource, conditions);
    } catch (err) {
      console.error(`Error checking permission ${action}:${resource}:`, err);
      return false;
    }
  }, [userId]);

  /**
   * Synchronous version of hasPermission that uses cached permissions
   * This is less accurate but faster for UI rendering
   */
  const hasPermissionSync = useCallback((action: string, resource: string): boolean => {
    return permissions.some(p => 
      (p.action === action || p.action === '*') && 
      (p.resource === resource || p.resource === '*')
    );
  }, [permissions]);

  /**
   * Check if the current user has any of the specified permissions
   */
  const hasAnyPermission = useCallback((permissionList: Array<{ action: string; resource: string }>): boolean => {
    if (!permissionList.length) return false;
    return permissionList.some(({ action, resource }) => hasPermissionSync(action, resource));
  }, [hasPermissionSync]);

  /**
   * Check if the current user has all of the specified permissions
   */
  const hasAllPermissions = useCallback((permissionList: Array<{ action: string; resource: string }>): boolean => {
    if (!permissionList.length) return true;
    return permissionList.every(({ action, resource }) => hasPermissionSync(action, resource));
  }, [hasPermissionSync]);

  /**
   * Get all permissions of the current user
   */
  const getUserPermissions = useCallback((): Permission[] => {
    return permissions;
  }, [permissions]);

  /**
   * Check if the current user has a specific role
   */
  const hasRole = useCallback(async (roleName: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      return await permissionsApi.checkUserRole(userId, roleName);
    } catch (err) {
      console.error(`Error checking role ${roleName}:`, err);
      return false;
    }
  }, [userId]);

  /**
   * Synchronous version of hasRole that uses cached roles
   * This is less accurate but faster for UI rendering
   */
  const hasRoleSync = useCallback((roleName: string): boolean => {
    return roles.includes(roleName);
  }, [roles]);

  /**
   * Check if the current user has any of the specified roles
   */
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    if (!roleNames.length) return false;
    return roleNames.some((roleName) => hasRoleSync(roleName));
  }, [hasRoleSync]);

  /**
   * Get all roles of the current user
   */
  const getUserRoles = useCallback((): string[] => {
    return roles;
  }, [roles]);

  /**
   * Check if the current user is an admin
   */
  const isAdmin = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      return await permissionsApi.isAdmin(userId);
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }, [userId]);

  /**
   * Synchronous version of isAdmin that uses cached roles and permissions
   * This is less accurate but faster for UI rendering
   */
  const isAdminSync = useCallback((): boolean => {
    return hasRoleSync('admin') || hasPermissionSync('*', '*');
  }, [hasRoleSync, hasPermissionSync]);

  return {
    hasPermission: hasPermissionSync, // Use sync version for component rendering
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    hasRole: hasRoleSync, // Use sync version for component rendering
    hasAnyRole,
    getUserRoles,
    isAdmin: isAdminSync, // Use sync version for component rendering
    // Async versions for when accuracy is more important than speed
    hasPermissionAsync: hasPermission,
    hasRoleAsync: hasRole,
    isAdminAsync: isAdmin,
    // Loading state
    isLoading,
    error,
    // Refresh function
    refreshPermissions: fetchUserPermissions
  };
};
};