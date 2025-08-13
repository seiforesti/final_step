/**
 * 🚀 MAIN APP ENTRY POINT - DATA GOVERNANCE PLATFORM
 * ==================================================
 * 
 * This is the main entry point for the enterprise data governance platform.
 * It handles authentication routing, initial system checks, and redirects
 * users to the appropriate interface based on their authentication status.
 * 
 * Flow:
 * 1. Check authentication status
 * 2. If not authenticated → LoginForm
 * 3. If authenticated → RacineMainManagerSPA
 * 4. Handle system health checks and error states
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Authentication Components
import { LoginForm } from '@/components/Advanced_RBAC_Datagovernance_System/components/auth/LoginForm';

// Main System Components
import { RacineMainManagerSPA } from '@/components/racine-main-manager';

// Layout Components - REMOVED: Now handled by MasterLayoutOrchestrator
// Previous layout components are now orchestrated by MasterLayoutOrchestrator

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: string | null;
  sessionValid: boolean;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  services: {
    backend: boolean;
    database: boolean;
    auth: boolean;
    websocket: boolean;
  };
  lastCheck: string;
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function MainApp() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    sessionValid: false
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    services: {
      backend: false,
      database: false,
      auth: false,
      websocket: false
    },
    lastCheck: new Date().toISOString()
  });

  const [showSystemCheck, setShowSystemCheck] = useState(true);
  const router = useRouter();

  // ============================================================================
  // AUTHENTICATION & SYSTEM CHECKS
  // ============================================================================

  const checkAuthentication = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check for existing session
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!token) {
        setAuthState(prev => ({ 
          ...prev, 
          isAuthenticated: false, 
          isLoading: false,
          sessionValid: false 
        }));
        return;
      }

      // Validate session with backend
      const response = await fetch('/api/racine/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          user: userData.user,
          sessionValid: true
        }));
      } else {
        // Try refresh token
        if (refreshToken) {
          const refreshResponse = await fetch('/api/racine/auth/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('auth_token', refreshData.access_token);
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              isLoading: false,
              user: refreshData.user,
              sessionValid: true
            }));
          } else {
            // Clear invalid tokens
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: false,
              isLoading: false,
              sessionValid: false
            }));
          }
        } else {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            sessionValid: false
          }));
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication service unavailable',
        sessionValid: false
      }));
    }
  }, []);

  const checkSystemHealth = useCallback(async () => {
    try {
      const healthChecks = await Promise.allSettled([
        // Backend API Health
        fetch('/api/racine/health').then(r => r.ok),
        // Database Health
        fetch('/api/racine/database/health').then(r => r.ok),
        // Auth Service Health
        fetch('/api/racine/auth/health').then(r => r.ok),
        // WebSocket Health (simplified check)
        Promise.resolve(true) // WebSocket check would be more complex
      ]);

      const services = {
        backend: healthChecks[0].status === 'fulfilled' && healthChecks[0].value,
        database: healthChecks[1].status === 'fulfilled' && healthChecks[1].value,
        auth: healthChecks[2].status === 'fulfilled' && healthChecks[2].value,
        websocket: healthChecks[3].status === 'fulfilled' && healthChecks[3].value
      };

      const healthyServices = Object.values(services).filter(Boolean).length;
      const totalServices = Object.values(services).length;

      setSystemHealth({
        status: healthyServices === totalServices ? 'healthy' : 
                healthyServices >= totalServices * 0.75 ? 'degraded' : 'critical',
        services,
        lastCheck: new Date().toISOString()
      });

      // Auto-hide system check after 3 seconds if all healthy
      if (healthyServices === totalServices) {
        setTimeout(() => setShowSystemCheck(false), 3000);
      }
    } catch (error) {
      console.error('System health check failed:', error);
      setSystemHealth(prev => ({
        ...prev,
        status: 'critical',
        lastCheck: new Date().toISOString()
      }));
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initial system startup
    const initializeApp = async () => {
      await checkSystemHealth();
      await checkAuthentication();
    };

    initializeApp();

    // Set up periodic health checks
    const healthInterval = setInterval(checkSystemHealth, 60000); // Every minute
    const authInterval = setInterval(checkAuthentication, 300000); // Every 5 minutes

    return () => {
      clearInterval(healthInterval);
      clearInterval(authInterval);
    };
  }, [checkAuthentication, checkSystemHealth]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAuthSuccess = useCallback((user: any, tokens: any) => {
    localStorage.setItem('auth_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user,
      error: null,
      sessionValid: true
    });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      sessionValid: false
    });
  }, []);

  const handleRetryConnection = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
    checkSystemHealth();
    checkAuthentication();
  }, [checkAuthentication, checkSystemHealth]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderSystemHealthCheck = () => (
    <AnimatePresence>
      {showSystemCheck && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
        >
          <Card className={`bg-white/90 backdrop-blur-sm border-2 ${
            systemHealth.status === 'healthy' ? 'border-green-200' :
            systemHealth.status === 'degraded' ? 'border-yellow-200' :
            'border-red-200'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                {systemHealth.status === 'healthy' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : systemHealth.status === 'degraded' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                System Health Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(systemHealth.services).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{service.replace('_', ' ')}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      status ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span>Overall Status</span>
                    <Badge variant={
                      systemHealth.status === 'healthy' ? 'default' :
                      systemHealth.status === 'degraded' ? 'secondary' :
                      'destructive'
                    }>
                      {systemHealth.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto"
        >
          <div className="w-full h-full border-4 border-blue-500/30 border-t-blue-500 rounded-full" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Initializing Data Governance Platform
          </h2>
          <p className="text-gray-600">
            Checking authentication and system health...
          </p>
        </div>
      </motion.div>
    </div>
  );

  const renderErrorState = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md"
      >
        <AlertTriangle className="w-16 h-16 mx-auto text-red-500" />
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-red-900">
            System Connection Error
          </h2>
          <p className="text-red-700">
            {authState.error || 'Unable to connect to the data governance platform'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button 
              onClick={handleRetryConnection}
              variant="outline"
              className="bg-white/80"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Show loading state during initialization
  if (authState.isLoading) {
    return (
      <>
        {renderSystemHealthCheck()}
        {renderLoadingState()}
      </>
    );
  }

  // Show error state if there are critical errors
  if (authState.error && !authState.isAuthenticated) {
    return (
      <>
        {renderSystemHealthCheck()}
        {renderErrorState()}
      </>
    );
  }

  // Show login form if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <>
        {renderSystemHealthCheck()}
        <LoginForm />
      </>
    );
  }

  // Show main application if authenticated
  // Layout is now handled by MasterLayoutOrchestrator inside RacineMainManagerSPA
  return (
    <>
      {renderSystemHealthCheck()}
      <RacineMainManagerSPA />
    </>
  );
}

// ============================================================================
// APP METADATA
// ============================================================================

export const metadata = {
  title: 'Enterprise Data Governance Platform',
  description: 'Advanced data governance platform with AI-powered insights and enterprise security',
  keywords: 'data governance, enterprise, AI, security, compliance, analytics',
  authors: [{ name: 'Data Governance Team' }],
  openGraph: {
    title: 'Enterprise Data Governance Platform',
    description: 'Advanced data governance platform with AI-powered insights',
    type: 'website'
  }
};
