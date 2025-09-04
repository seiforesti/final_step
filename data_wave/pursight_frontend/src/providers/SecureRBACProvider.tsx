/**
 * Secure RBAC Provider with Advanced Error Handling
 * ==================================================
 * 
 * Replacement for the problematic RBACProvider that was causing infinite loops.
 * Features:
 * - Circuit breaker protection
 * - Graceful error recovery
 * - Health-aware authentication
 * - Performance monitoring
 * - Fallback user support
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSecureRBAC, RbacUser } from '../hooks/useSecureRBAC';
import { globalRequestManager } from '../lib/api-request-manager';
import { globalCircuitBreaker } from '../lib/api-circuit-breaker';

export interface SecureRBACContextType {
  // User state
  user: RbacUser | null;
  flatPermissions: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  
  // Health monitoring
  healthStatus: 'healthy' | 'degraded' | 'critical';
  authenticationAttempts: number;
  lastAuthAttempt: Date | null;
  
  // Permission methods
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Control methods
  refreshAuth: () => void;
  clearAuth: () => void;
  getHealthStatus: () => any;
  
  // System control
  emergencyMode: boolean;
  enableEmergencyMode: () => void;
  disableEmergencyMode: () => void;
}

const SecureRBACContext = createContext<SecureRBACContextType | null>(null);

interface SecureRBACProviderProps {
  children: React.ReactNode;
  enableRouteProtection?: boolean;
  enableHealthMonitoring?: boolean;
  enableEmergencyMode?: boolean;
  fallbackMode?: boolean;
}

export function SecureRBACProvider({ 
  children, 
  enableRouteProtection = true,
  enableHealthMonitoring = true,
  enableEmergencyMode = true,
  fallbackMode = true
}: SecureRBACProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Emergency mode state
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);
  
  // Secure RBAC hook
  const rbac = useSecureRBAC({
    enableAutoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    maxRetries: 2,
    fallbackMode,
    enableHealthMonitoring
  });

  // Emergency mode controls
  const enableEmergencyModeHandler = useCallback(() => {
    console.warn('🚨 Emergency mode activated');
    setEmergencyMode(true);
    globalRequestManager.emergencyStop();
    setSystemAlerts(prev => [...prev, `Emergency mode activated at ${new Date().toISOString()}`]);
  }, []);

  const disableEmergencyModeHandler = useCallback(() => {
    console.log('🟢 Emergency mode deactivated');
    setEmergencyMode(false);
    setSystemAlerts(prev => [...prev, `Emergency mode deactivated at ${new Date().toISOString()}`]);
  }, []);

  // Health monitoring and automatic emergency mode
  useEffect(() => {
    if (!enableHealthMonitoring || !enableEmergencyMode) return;

    const checkSystemHealth = () => {
      const health = rbac.getHealthStatus();
      const circuitStatus = globalCircuitBreaker.getStatus();
      
      // Count open circuits
      const openCircuits = Object.values(circuitStatus.endpoints).filter(
        (endpoint: any) => endpoint.state === 'OPEN'
      ).length;

      // Activate emergency mode if system is severely degraded
      if (
        (health.status === 'critical' && rbac.authenticationAttempts > 5) ||
        openCircuits > 3 ||
        (health.pendingRequests > 20)
      ) {
        if (!emergencyMode) {
          enableEmergencyModeHandler();
        }
      } else if (
        health.status === 'healthy' && 
        openCircuits === 0 && 
        rbac.authenticationAttempts === 0
      ) {
        if (emergencyMode) {
          disableEmergencyModeHandler();
        }
      }
    };

    const interval = setInterval(checkSystemHealth, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [
    enableHealthMonitoring, 
    enableEmergencyMode, 
    emergencyMode, 
    rbac.authenticationAttempts, 
    rbac.healthStatus,
    enableEmergencyModeHandler,
    disableEmergencyModeHandler
  ]);

  // Route protection
  useEffect(() => {
    if (!enableRouteProtection) return;
    
    // Skip protection during loading or in emergency mode
    if (rbac.isLoading || emergencyMode) return;
    
    // Protected routes that require authentication
    const protectedRoutes = [
      '/rbac-admin',
      '/data-governance',
      '/profile'
    ];
    
    const isProtectedRoute = protectedRoutes.some(route => 
      location.pathname.startsWith(route)
    );
    
    if (isProtectedRoute && !rbac.isAuthenticated) {
      console.log(`🔒 Redirecting to sign-in from protected route: ${location.pathname}`);
      navigate('/signin', { 
        replace: true, 
        state: { from: location.pathname } 
      });
    }
  }, [
    location.pathname, 
    rbac.isAuthenticated, 
    rbac.isLoading, 
    emergencyMode, 
    enableRouteProtection,
    navigate
  ]);

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 SecureRBACProvider State:', {
        user: rbac.user?.email || 'None',
        isAuthenticated: rbac.isAuthenticated,
        isLoading: rbac.isLoading,
        healthStatus: rbac.healthStatus,
        authAttempts: rbac.authenticationAttempts,
        emergencyMode,
        location: location.pathname
      });
    }
  }, [
    rbac.user,
    rbac.isAuthenticated,
    rbac.isLoading,
    rbac.healthStatus,
    rbac.authenticationAttempts,
    emergencyMode,
    location.pathname
  ]);

  // Context value
  const contextValue: SecureRBACContextType = {
    // User state
    user: rbac.user,
    flatPermissions: rbac.flatPermissions,
    isLoading: rbac.isLoading,
    isError: rbac.isError,
    error: rbac.error,
    isAuthenticated: rbac.isAuthenticated,
    
    // Health monitoring
    healthStatus: rbac.healthStatus,
    authenticationAttempts: rbac.authenticationAttempts,
    lastAuthAttempt: rbac.lastAuthAttempt,
    
    // Permission methods
    hasPermission: rbac.hasPermission,
    hasAnyPermission: rbac.hasAnyPermission,
    hasAllPermissions: rbac.hasAllPermissions,
    
    // Control methods
    refreshAuth: rbac.refreshAuth,
    clearAuth: rbac.clearAuth,
    getHealthStatus: rbac.getHealthStatus,
    
    // System control
    emergencyMode,
    enableEmergencyMode: enableEmergencyModeHandler,
    disableEmergencyMode: disableEmergencyModeHandler
  };

  return (
    <SecureRBACContext.Provider value={contextValue}>
      {children}
      {/* Emergency Mode Indicator */}
      {emergencyMode && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '8px 16px',
            textAlign: 'center',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🚨 EMERGENCY MODE ACTIVE - System performance degraded, some features may be limited
        </div>
      )}
    </SecureRBACContext.Provider>
  );
}

// Hook to use the secure RBAC context
export function useSecureRBACContext(): SecureRBACContextType {
  const context = useContext(SecureRBACContext);
  if (!context) {
    throw new Error('useSecureRBACContext must be used within a SecureRBACProvider');
  }
  return context;
}

// Backward compatibility hook (replaces the old RBACContext)
export function useRBAC() {
  return useSecureRBACContext();
}

// Export the context for direct access if needed
export { SecureRBACContext };