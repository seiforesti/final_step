/**
 * Secure RBAC Hook with Circuit Breaker Protection
 * =================================================
 * 
 * Replacement for the problematic useRbacMe and useRBACPermissions hooks.
 * Features:
 * - Circuit breaker protection against infinite loops
 * - Intelligent fallback and error recovery
 * - Optimized caching and state management
 * - Health-aware authentication flow
 * - Graceful degradation under system stress
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { globalRequestManager } from '../lib/api-request-manager';

export interface RbacUser {
  id: string | number;
  email: string;
  username?: string;
  displayName?: string;
  roles: Array<{
    id: string;
    name: string;
    description?: string;
    isBuiltIn?: boolean;
    permissions: string[];
    createdAt?: string;
    updatedAt?: string;
  }>;
  permissions: Array<{
    id: number;
    action: string;
    resource: string;
    conditions?: string | Record<string, any>;
    is_effective?: boolean;
    note?: string;
  }>;
  isActive?: boolean;
}

export interface SecureRBACState {
  user: RbacUser | null;
  flatPermissions: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  authenticationAttempts: number;
  lastAuthAttempt: Date | null;
  healthStatus: 'healthy' | 'degraded' | 'critical';
}

interface UseSecureRBACOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  fallbackMode?: boolean;
  enableHealthMonitoring?: boolean;
}

const DEFAULT_OPTIONS: UseSecureRBACOptions = {
  enableAutoRefresh: true,
  refreshInterval: 300000, // 5 minutes
  maxRetries: 2,
  fallbackMode: true,
  enableHealthMonitoring: true
};

// Fallback user for when authentication fails but app needs to function
const FALLBACK_USER: RbacUser = {
  id: 'fallback-user',
  email: 'fallback@system.local',
  username: 'fallback',
  displayName: 'Fallback User',
  roles: [{
    id: 'guest',
    name: 'guest',
    description: 'Fallback guest role',
    isBuiltIn: true,
    permissions: ['read:basic']
  }],
  permissions: [{
    id: 0,
    action: 'read',
    resource: 'basic',
    is_effective: true,
    note: 'Fallback permission'
  }],
  isActive: true
};

export function useSecureRBAC(options: UseSecureRBACOptions = {}): SecureRBACState & {
  refreshAuth: () => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getHealthStatus: () => any;
} {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<SecureRBACState>({
    user: null,
    flatPermissions: [],
    isLoading: true,
    isError: false,
    error: null,
    isAuthenticated: false,
    authenticationAttempts: 0,
    lastAuthAttempt: null,
    healthStatus: 'healthy'
  });

  const authAttemptsRef = useRef(0);
  const lastAuthAttemptRef = useRef<Date | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Main authentication query with circuit breaker protection
  const authQuery: UseQueryResult<RbacUser, Error> = useQuery({
    queryKey: ['secure-rbac-auth'],
    queryFn: async (): Promise<RbacUser> => {
      authAttemptsRef.current++;
      lastAuthAttemptRef.current = new Date();

      try {
        console.log(`🔐 Attempting secure authentication (attempt ${authAttemptsRef.current})`);
        
        const userData = await globalRequestManager.authenticateUser();
        
        // Validate and transform user data
        const user: RbacUser = {
          id: userData.id || 'unknown',
          email: userData.email || 'unknown@system.local',
          username: userData.username || userData.email || 'unknown',
          displayName: userData.displayName || userData.email || 'Unknown User',
          roles: Array.isArray(userData.roles) ? userData.roles.map((role: any) => ({
            id: role.id || role.name || 'unknown',
            name: role.name || 'unknown',
            description: role.description,
            isBuiltIn: role.isBuiltIn || false,
            permissions: Array.isArray(role.permissions) ? role.permissions : [],
            createdAt: role.createdAt,
            updatedAt: role.updatedAt
          })) : [],
          permissions: Array.isArray(userData.permissions) ? userData.permissions : [],
          isActive: userData.isActive !== false
        };

        console.log('✅ Secure authentication successful:', user.email);
        authAttemptsRef.current = 0; // Reset attempts on success
        
        return user;

      } catch (error: any) {
        console.warn(`❌ Authentication attempt ${authAttemptsRef.current} failed:`, error.message);
        
        // After max retries, use fallback if enabled
        if (authAttemptsRef.current >= config.maxRetries && config.fallbackMode) {
          console.warn('🔄 Using fallback authentication mode');
          return FALLBACK_USER;
        }
        
        throw error;
      }
    },
    staleTime: config.refreshInterval,
    cacheTime: config.refreshInterval * 2,
    retry: (failureCount, error) => {
      // Custom retry logic with circuit breaker awareness
      if (failureCount >= config.maxRetries) {
        return false;
      }
      
      // Don't retry on certain errors
      if (error?.message?.includes('Circuit breaker OPEN')) {
        return false;
      }
      
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchInterval: config.enableAutoRefresh ? config.refreshInterval : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

  // Flat permissions query with dependency on auth success
  const permissionsQuery: UseQueryResult<string[], Error> = useQuery({
    queryKey: ['secure-rbac-flat-permissions'],
    queryFn: async (): Promise<string[]> => {
      try {
        console.log('🔑 Fetching flat permissions');
        
        const response = await globalRequestManager.request('/sensitivity-labels/rbac/me/flat-permissions', {
          method: 'GET',
          cache: true,
          cacheTTL: config.refreshInterval,
          retries: 1,
          priority: 'high'
        });
        
        const permissions = response?.flatPermissions || response?.data || [];
        console.log(`✅ Retrieved ${permissions.length} flat permissions`);
        
        return Array.isArray(permissions) ? permissions : [];
        
      } catch (error: any) {
        console.warn('❌ Failed to fetch flat permissions:', error.message);
        
        // Extract permissions from user roles as fallback
        if (authQuery.data?.roles) {
          const fallbackPermissions = authQuery.data.roles.flatMap(role => 
            role.permissions || []
          );
          console.log(`🔄 Using ${fallbackPermissions.length} fallback permissions from roles`);
          return fallbackPermissions;
        }
        
        return [];
      }
    },
    enabled: !!authQuery.data && !authQuery.isLoading,
    staleTime: config.refreshInterval,
    cacheTime: config.refreshInterval * 2,
    retry: 1,
    retryDelay: 2000
  });

  // Update state based on query results
  useEffect(() => {
    const healthStatus = globalRequestManager.getHealthStatus().status;
    
    setState(prev => ({
      ...prev,
      user: authQuery.data || null,
      flatPermissions: permissionsQuery.data || [],
      isLoading: authQuery.isLoading || (authQuery.data && permissionsQuery.isLoading),
      isError: authQuery.isError || permissionsQuery.isError,
      error: authQuery.error || permissionsQuery.error,
      isAuthenticated: !!authQuery.data && authQuery.data.id !== 'fallback-user',
      authenticationAttempts: authAttemptsRef.current,
      lastAuthAttempt: lastAuthAttemptRef.current,
      healthStatus: healthStatus as 'healthy' | 'degraded' | 'critical'
    }));
  }, [
    authQuery.data,
    authQuery.isLoading,
    authQuery.isError,
    authQuery.error,
    permissionsQuery.data,
    permissionsQuery.isLoading,
    permissionsQuery.isError,
    permissionsQuery.error
  ]);

  // Health monitoring
  useEffect(() => {
    if (!config.enableHealthMonitoring) return;

    healthCheckIntervalRef.current = setInterval(() => {
      const health = globalRequestManager.getHealthStatus();
      setState(prev => ({
        ...prev,
        healthStatus: health.status as 'healthy' | 'degraded' | 'critical'
      }));
    }, 10000); // Check every 10 seconds

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [config.enableHealthMonitoring]);

  // Permission checking utilities
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.flatPermissions || state.flatPermissions.length === 0) {
      return false;
    }
    return state.flatPermissions.includes(permission);
  }, [state.flatPermissions]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!state.flatPermissions || state.flatPermissions.length === 0) {
      return false;
    }
    return permissions.some(permission => state.flatPermissions.includes(permission));
  }, [state.flatPermissions]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!state.flatPermissions || state.flatPermissions.length === 0) {
      return false;
    }
    return permissions.every(permission => state.flatPermissions.includes(permission));
  }, [state.flatPermissions]);

  // Manual refresh
  const refreshAuth = useCallback(() => {
    console.log('🔄 Manual authentication refresh requested');
    authQuery.refetch();
    permissionsQuery.refetch();
  }, [authQuery, permissionsQuery]);

  // Clear authentication
  const clearAuth = useCallback(() => {
    console.log('🔐 Clearing authentication');
    setState(prev => ({
      ...prev,
      user: null,
      flatPermissions: [],
      isAuthenticated: false,
      isError: false,
      error: null
    }));
    authAttemptsRef.current = 0;
    lastAuthAttemptRef.current = null;
  }, []);

  // Get health status
  const getHealthStatus = useCallback(() => {
    return {
      ...globalRequestManager.getHealthStatus(),
      authenticationAttempts: authAttemptsRef.current,
      lastAuthAttempt: lastAuthAttemptRef.current,
      isAuthenticated: state.isAuthenticated,
      userEmail: state.user?.email
    };
  }, [state.isAuthenticated, state.user?.email]);

  return {
    ...state,
    refreshAuth,
    clearAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getHealthStatus
  };
}

// Context-aware permission hook
export function usePermissionCheck(permission: string | string[]) {
  const rbac = useSecureRBAC();
  
  const hasAccess = useCallback(() => {
    if (Array.isArray(permission)) {
      return rbac.hasAnyPermission(permission);
    }
    return rbac.hasPermission(permission);
  }, [rbac, permission]);

  return {
    hasAccess: hasAccess(),
    isLoading: rbac.isLoading,
    isAuthenticated: rbac.isAuthenticated,
    healthStatus: rbac.healthStatus
  };
}