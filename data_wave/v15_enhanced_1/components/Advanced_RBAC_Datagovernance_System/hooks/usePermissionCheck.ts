// usePermissionCheck Hook - Declarative permission checking and access control
// Provides efficient, cached permission checking with real-time updates

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { permissionService } from '../services/permission.service';
import { rbacWebSocketService } from '../services/websocket.service';

export interface PermissionCheck {
  action: string;
  resource?: string;
  resourceId?: string;
  condition?: Record<string, any>;
}

export interface PermissionResult {
  hasPermission: boolean;
  reason?: string;
  conditions?: Record<string, any>;
  source?: 'direct' | 'role' | 'group' | 'inherited';
  timestamp: Date;
}

export interface PermissionCheckState {
  permissions: Record<string, PermissionResult>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface PermissionCheckMethods {
  // Basic Permission Checking
  hasPermission: (check: PermissionCheck) => boolean;
  hasPermissionAsync: (check: PermissionCheck) => Promise<boolean>;
  hasAnyPermission: (checks: PermissionCheck[]) => boolean;
  hasAllPermissions: (checks: PermissionCheck[]) => boolean;
  
  // Batch Operations
  checkPermissions: (checks: PermissionCheck[]) => Promise<Record<string, PermissionResult>>;
  checkPermissionsSync: (checks: PermissionCheck[]) => Record<string, boolean>;
  
  // Resource-Specific Checks
  canRead: (resource: string, resourceId?: string) => boolean;
  canWrite: (resource: string, resourceId?: string) => boolean;
  canDelete: (resource: string, resourceId?: string) => boolean;
  canExecute: (resource: string, resourceId?: string) => boolean;
  canManage: (resource: string, resourceId?: string) => boolean;
  
  // Advanced Checks
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  isMemberOf: (groupName: string) => boolean;
  
  // Conditional Permissions
  evaluateCondition: (condition: Record<string, any>, context?: Record<string, any>) => Promise<boolean>;
  checkWithCondition: (check: PermissionCheck, context?: Record<string, any>) => Promise<boolean>;
  
  // Cache Management
  enableCache: (ttl?: number) => void;
  disableCache: () => void;
  clearCache: () => void;
  invalidatePermission: (check: PermissionCheck) => void;
  
  // Utility
  getPermissionKey: (check: PermissionCheck) => string;
  getPermissionResult: (check: PermissionCheck) => PermissionResult | null;
  refreshPermissions: () => Promise<void>;
}

export interface UsePermissionCheckReturn extends PermissionCheckState, PermissionCheckMethods {}

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function usePermissionCheck(cacheEnabled = true, cacheTTL = DEFAULT_CACHE_TTL): UsePermissionCheckReturn {
  const { user, permissions: userPermissions, roles, groups, checkPermission } = useCurrentUser();
  
  const [state, setState] = useState<PermissionCheckState>({
    permissions: {},
    isLoading: false,
    error: null,
    lastUpdated: null,
    cacheEnabled,
    cacheTTL
  });

  // Set up real-time updates
  useEffect(() => {
    if (user) {
      // Subscribe to permission changes for current user
      const permissionSubscription = rbacWebSocketService.onPermissionChanged(
        (event) => {
          if (event.userId === user.id) {
            // Invalidate relevant cached permissions
            setState(prev => {
              const newPermissions = { ...prev.permissions };
              
              // Clear cache for affected permissions
              Object.keys(newPermissions).forEach(key => {
                const [action, resource] = key.split(':');
                if (event.action === action || event.resource === resource) {
                  delete newPermissions[key];
                }
              });
              
              return {
                ...prev,
                permissions: newPermissions,
                lastUpdated: new Date()
              };
            });
          }
        },
        { userId: user.id }
      );

      // Subscribe to role assignments
      const roleSubscription = rbacWebSocketService.onRoleAssigned(
        (event) => {
          if (event.userId === user.id) {
            // Clear all cached permissions when roles change
            clearCache();
          }
        },
        { userId: user.id }
      );

      return () => {
        rbacWebSocketService.unsubscribe(permissionSubscription);
        rbacWebSocketService.unsubscribe(roleSubscription);
      };
    }
  }, [user]);

  // Auto-cleanup expired cache entries
  useEffect(() => {
    if (state.cacheEnabled) {
      const interval = setInterval(() => {
        const now = Date.now();
        setState(prev => {
          const newPermissions = { ...prev.permissions };
          let hasChanges = false;
          
          Object.entries(newPermissions).forEach(([key, result]) => {
            if (now - result.timestamp.getTime() > prev.cacheTTL) {
              delete newPermissions[key];
              hasChanges = true;
            }
          });
          
          return hasChanges ? { ...prev, permissions: newPermissions } : prev;
        });
      }, Math.max(state.cacheTTL / 4, 30000)); // Check every quarter of TTL or 30 seconds minimum

      return () => clearInterval(interval);
    }
  }, [state.cacheEnabled, state.cacheTTL]);

  // === Basic Permission Checking ===

  const getPermissionKey = useCallback((check: PermissionCheck): string => {
    return `${check.action}:${check.resource || '*'}:${check.resourceId || '*'}`;
  }, []);

  const getPermissionResult = useCallback((check: PermissionCheck): PermissionResult | null => {
    const key = getPermissionKey(check);
    const cached = state.permissions[key];
    
    if (!state.cacheEnabled) return null;
    if (!cached) return null;
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp.getTime() > state.cacheTTL) {
      return null;
    }
    
    return cached;
  }, [state.permissions, state.cacheEnabled, state.cacheTTL, getPermissionKey]);

  const setCachedResult = useCallback((check: PermissionCheck, result: PermissionResult): void => {
    if (!state.cacheEnabled) return;
    
    const key = getPermissionKey(check);
    setState(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: result
      }
    }));
  }, [state.cacheEnabled, getPermissionKey]);

  const hasPermission = useCallback((check: PermissionCheck): boolean => {
    // Check cache first
    const cached = getPermissionResult(check);
    if (cached) {
      return cached.hasPermission;
    }

    // Use current user's permission check if available
    if (userPermissions) {
      const hasAccess = checkPermission(check.action, check.resource, check.resourceId);
      
      // Cache the result
      setCachedResult(check, {
        hasPermission: hasAccess,
        source: 'direct',
        timestamp: new Date()
      });
      
      return hasAccess;
    }

    return false;
  }, [getPermissionResult, userPermissions, checkPermission, setCachedResult]);

  const hasPermissionAsync = useCallback(async (check: PermissionCheck): Promise<boolean> => {
    // Check cache first
    const cached = getPermissionResult(check);
    if (cached) {
      return cached.hasPermission;
    }

    if (!user) return false;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await permissionService.checkUserPermission(
        user.id,
        check.action,
        check.resource,
        check.resourceId
      );
      
      const result: PermissionResult = {
        hasPermission: response.data.hasPermission,
        reason: response.data.reason,
        conditions: response.data.conditions,
        source: response.data.source,
        timestamp: new Date()
      };
      
      setCachedResult(check, result);
      setState(prev => ({ ...prev, isLoading: false }));
      
      return result.hasPermission;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Permission check failed'
      }));
      return false;
    }
  }, [getPermissionResult, user, setCachedResult]);

  const hasAnyPermission = useCallback((checks: PermissionCheck[]): boolean => {
    return checks.some(check => hasPermission(check));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((checks: PermissionCheck[]): boolean => {
    return checks.every(check => hasPermission(check));
  }, [hasPermission]);

  // === Batch Operations ===

  const checkPermissions = useCallback(async (checks: PermissionCheck[]): Promise<Record<string, PermissionResult>> => {
    if (!user) return {};

    // Separate cached and uncached checks
    const cachedResults: Record<string, PermissionResult> = {};
    const uncachedChecks: PermissionCheck[] = [];

    checks.forEach(check => {
      const cached = getPermissionResult(check);
      if (cached) {
        cachedResults[getPermissionKey(check)] = cached;
      } else {
        uncachedChecks.push(check);
      }
    });

    // Batch check uncached permissions
    if (uncachedChecks.length > 0) {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const batchChecks = uncachedChecks.map(check => ({
          action: check.action,
          resource: check.resource,
          resourceId: check.resourceId
        }));
        
        const response = await permissionService.batchCheckUserPermissions(user.id, batchChecks);
        
        uncachedChecks.forEach((check, index) => {
          const key = getPermissionKey(check);
          const hasAccess = response.data[index] || false;
          
          const result: PermissionResult = {
            hasPermission: hasAccess,
            timestamp: new Date()
          };
          
          cachedResults[key] = result;
          setCachedResult(check, result);
        });
        
        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Batch permission check failed'
        }));
      }
    }

    return cachedResults;
  }, [user, getPermissionResult, getPermissionKey, setCachedResult]);

  const checkPermissionsSync = useCallback((checks: PermissionCheck[]): Record<string, boolean> => {
    const results: Record<string, boolean> = {};
    
    checks.forEach(check => {
      const key = getPermissionKey(check);
      results[key] = hasPermission(check);
    });
    
    return results;
  }, [getPermissionKey, hasPermission]);

  // === Resource-Specific Checks ===

  const canRead = useCallback((resource: string, resourceId?: string): boolean => {
    return hasPermission({ action: 'read', resource, resourceId });
  }, [hasPermission]);

  const canWrite = useCallback((resource: string, resourceId?: string): boolean => {
    return hasPermission({ action: 'write', resource, resourceId });
  }, [hasPermission]);

  const canDelete = useCallback((resource: string, resourceId?: string): boolean => {
    return hasPermission({ action: 'delete', resource, resourceId });
  }, [hasPermission]);

  const canExecute = useCallback((resource: string, resourceId?: string): boolean => {
    return hasPermission({ action: 'execute', resource, resourceId });
  }, [hasPermission]);

  const canManage = useCallback((resource: string, resourceId?: string): boolean => {
    return hasPermission({ action: 'manage', resource, resourceId });
  }, [hasPermission]);

  // === Advanced Checks ===

  const hasRole = useCallback((roleName: string): boolean => {
    return roles.some(role => role.name === roleName);
  }, [roles]);

  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  }, [hasRole]);

  const hasAllRoles = useCallback((roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  }, [hasRole]);

  const isMemberOf = useCallback((groupName: string): boolean => {
    return groups.some(group => group.name === groupName);
  }, [groups]);

  // === Conditional Permissions ===

  const evaluateCondition = useCallback(async (
    condition: Record<string, any>, 
    context: Record<string, any> = {}
  ): Promise<boolean> => {
    try {
      const response = await permissionService.testCondition(JSON.stringify(condition), context);
      return response;
    } catch (error) {
      console.error('Failed to evaluate condition:', error);
      return false;
    }
  }, []);

  const checkWithCondition = useCallback(async (
    check: PermissionCheck, 
    context: Record<string, any> = {}
  ): Promise<boolean> => {
    const basePermission = await hasPermissionAsync(check);
    if (!basePermission) return false;

    if (check.condition) {
      return await evaluateCondition(check.condition, context);
    }

    return true;
  }, [hasPermissionAsync, evaluateCondition]);

  // === Cache Management ===

  const enableCache = useCallback((ttl: number = DEFAULT_CACHE_TTL): void => {
    setState(prev => ({
      ...prev,
      cacheEnabled: true,
      cacheTTL: ttl
    }));
  }, []);

  const disableCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      cacheEnabled: false,
      permissions: {}
    }));
  }, []);

  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      permissions: {}
    }));
  }, []);

  const invalidatePermission = useCallback((check: PermissionCheck): void => {
    const key = getPermissionKey(check);
    setState(prev => {
      const newPermissions = { ...prev.permissions };
      delete newPermissions[key];
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  }, [getPermissionKey]);

  // === Utility ===

  const refreshPermissions = useCallback(async (): Promise<void> => {
    clearCache();
    if (userPermissions) {
      await userPermissions.refreshPermissions();
    }
  }, [clearCache, userPermissions]);

  // Computed values
  const computedValues = useMemo(() => ({
    cacheSize: Object.keys(state.permissions).length,
    hasAnyPermissions: Object.values(state.permissions).some(result => result.hasPermission),
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),
    canManageUsers: canManage('users'),
    canManageRoles: canManage('roles'),
    canManagePermissions: canManage('permissions'),
    canViewAuditLogs: canRead('audit_logs')
  }), [state.permissions, hasRole, canManage, canRead]);

  return {
    ...state,
    ...computedValues,
    
    // Basic Permission Checking
    hasPermission,
    hasPermissionAsync,
    hasAnyPermission,
    hasAllPermissions,
    
    // Batch Operations
    checkPermissions,
    checkPermissionsSync,
    
    // Resource-Specific Checks
    canRead,
    canWrite,
    canDelete,
    canExecute,
    canManage,
    
    // Advanced Checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isMemberOf,
    
    // Conditional Permissions
    evaluateCondition,
    checkWithCondition,
    
    // Cache Management
    enableCache,
    disableCache,
    clearCache,
    invalidatePermission,
    
    // Utility
    getPermissionKey,
    getPermissionResult,
    refreshPermissions
  };
}

export default usePermissionCheck;