/**
 * System Health Dashboard
 * ========================
 * 
 * Real-time monitoring dashboard for the secure API management system.
 * Displays circuit breaker status, request metrics, and system health.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Zap,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff
} from 'lucide-react';
import { globalRequestManager } from '../lib/api-request-manager';
import { globalCircuitBreaker } from '../lib/api-circuit-breaker';
import { useSecureRBACContext } from '../providers/SecureRBACProvider';

interface SystemMetrics {
  requestManager: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    cacheHits: number;
    cacheMisses: number;
    healthStatus: string;
    cacheSize: number;
  };
  circuitBreaker: {
    activeRequests: number;
    queuedRequests: number;
    endpoints: Record<string, any>;
  };
  rbac: {
    isAuthenticated: boolean;
    authenticationAttempts: number;
    lastAuthAttempt: Date | null;
    healthStatus: string;
    emergencyMode: boolean;
  };
}

export const SystemHealthDashboard: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const rbac = useSecureRBACContext();

  const fetchMetrics = useCallback(async () => {
    try {
      const requestMetrics = globalRequestManager.getMetrics();
      const circuitStatus = globalCircuitBreaker.getStatus();
      
      setMetrics({
        requestManager: requestMetrics,
        circuitBreaker: circuitStatus,
        rbac: {
          isAuthenticated: rbac.isAuthenticated,
          authenticationAttempts: rbac.authenticationAttempts,
          lastAuthAttempt: rbac.lastAuthAttempt,
          healthStatus: rbac.healthStatus,
          emergencyMode: rbac.emergencyMode
        }
      });
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  }, [rbac]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMetrics();
    setTimeout(() => setRefreshing(false), 500);
  }, [fetchMetrics]);

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
    }
  }, [isOpen, fetchMetrics]);

  useEffect(() => {
    if (!isOpen || !autoRefresh) return;

    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [isOpen, autoRefresh, fetchMetrics]);

  if (!isOpen) return null;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">System Health Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {!metrics ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-500">Loading system metrics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Request Manager</h3>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(metrics.requestManager.healthStatus)}`}>
                    {getHealthIcon(metrics.requestManager.healthStatus)}
                    {metrics.requestManager.healthStatus}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold">Circuit Breaker</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    {metrics.circuitBreaker.activeRequests} active, {metrics.circuitBreaker.queuedRequests} queued
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {metrics.rbac.isAuthenticated ? (
                      <Wifi className="w-5 h-5 text-green-600" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-600" />
                    )}
                    <h3 className="font-semibold">Authentication</h3>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(metrics.rbac.healthStatus)}`}>
                    {getHealthIcon(metrics.rbac.healthStatus)}
                    {metrics.rbac.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </div>
                </div>
              </div>

              {/* Request Manager Metrics */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Request Manager Metrics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.requestManager.totalRequests}
                    </div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.requestManager.successfulRequests}
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {metrics.requestManager.failedRequests}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(metrics.requestManager.averageResponseTime)}ms
                    </div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {metrics.requestManager.cacheHits}
                    </div>
                    <div className="text-sm text-gray-600">Cache Hits</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {metrics.requestManager.cacheSize}
                    </div>
                    <div className="text-sm text-gray-600">Cache Size</div>
                  </div>
                </div>
              </div>

              {/* Circuit Breaker Status */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Circuit Breaker Status
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(metrics.circuitBreaker.endpoints).map(([endpoint, status]) => (
                    <div key={endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{endpoint}</div>
                        <div className="text-xs text-gray-500">
                          {status.metrics.totalRequests} requests, {status.metrics.failures} failures
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status.state === 'CLOSED' ? 'bg-green-100 text-green-800' :
                        status.state === 'HALF_OPEN' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status.state}
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(metrics.circuitBreaker.endpoints).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No circuit breaker data available
                    </div>
                  )}
                </div>
              </div>

              {/* RBAC Status */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  RBAC Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Authentication Status:</span>
                      <span className={`font-medium ${metrics.rbac.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.rbac.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auth Attempts:</span>
                      <span className="font-medium">{metrics.rbac.authenticationAttempts}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Mode:</span>
                      <span className={`font-medium ${metrics.rbac.emergencyMode ? 'text-red-600' : 'text-green-600'}`}>
                        {metrics.rbac.emergencyMode ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health Status:</span>
                      <span className={`font-medium ${
                        metrics.rbac.healthStatus === 'healthy' ? 'text-green-600' :
                        metrics.rbac.healthStatus === 'degraded' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {metrics.rbac.healthStatus}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Auth Attempt:</span>
                      <span className="font-medium text-sm">
                        {metrics.rbac.lastAuthAttempt 
                          ? new Date(metrics.rbac.lastAuthAttempt).toLocaleTimeString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Actions */}
              {(metrics.rbac.emergencyMode || metrics.requestManager.healthStatus === 'critical') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Emergency Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        globalRequestManager.clearCache();
                        handleRefresh();
                      }}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Clear All Caches
                    </button>
                    
                    <button
                      onClick={() => {
                        rbac.enableEmergencyMode();
                        handleRefresh();
                      }}
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                      disabled={metrics.rbac.emergencyMode}
                    >
                      {metrics.rbac.emergencyMode ? 'Emergency Mode Active' : 'Activate Emergency Mode'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};