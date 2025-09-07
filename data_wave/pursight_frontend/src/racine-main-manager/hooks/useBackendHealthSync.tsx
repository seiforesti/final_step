// ============================================================================
// BACKEND HEALTH SYNC - AUTOMATICALLY SYNC BACKEND HEALTH WITH FRONTEND ORCHESTRATOR
// ============================================================================

import { useEffect, useRef, useCallback } from 'react'
import { useGlobalAPIInterceptor } from './useGlobalAPIInterceptor'
import { globalHealthMonitor } from '../services/health-monitor'

interface BackendHealthConfig {
  api_throttling: {
    enabled: boolean
    max_concurrent_requests: number
    max_requests_per_minute: number
    request_delay_ms: number
    batch_size: number
    batch_delay_ms: number
  }
  emergency_mode: {
    enabled: boolean
    reason: string
  }
  circuit_breaker: {
    enabled: boolean
    failure_threshold: number
    timeout_ms: number
  }
  health_context: {
    status: string
    pool_usage: string
    error_rate: string
    response_time: string
    last_check: string | null
  }
}

export const useBackendHealthSync = () => {
  const {
    globalState,
    enableEmergencyMode,
    disableEmergencyMode,
    updateDatabaseHealth,
    config
  } = useGlobalAPIInterceptor()
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastHealthCheckRef = useRef<Date | null>(null)
  const healthCheckCountRef = useRef(0)
  const consecutiveFailuresRef = useRef(0)
  const maxConsecutiveFailures = 3
  const baseURL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/proxy'
  
  // Fetch backend health configuration
  const fetchBackendHealth = useCallback(async () => {
    try {
      // Check if we've had too many consecutive failures
      if (consecutiveFailuresRef.current >= maxConsecutiveFailures) {
        console.warn('🚨 Too many consecutive health check failures, skipping this check')
        return
      }

      // Try the main health endpoint first, fallback to basic health check
      let response
      try {
        response = await fetch('/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(3000)
        })
      } catch (error) {
        // Fallback to basic health check if main endpoint fails
        console.warn('Main health endpoint failed, trying basic health check')
        response = await fetch('/proxy/health/frontend-config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(3000)
        })
      }
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      const healthData = await response.json()
      
      // Handle different response formats
      let healthConfig: BackendHealthConfig
      if (healthData.health_context) {
        // Full health config response
        healthConfig = healthData
      } else {
        // Basic health response - create minimal config
        healthConfig = {
          api_throttling: {
            enabled: true,
            max_concurrent_requests: 3,
            max_requests_per_minute: 10,
            request_delay_ms: 1000,
            batch_size: 2,
            batch_delay_ms: 1500
          },
          emergency_mode: {
            enabled: healthData.status === 'critical',
            reason: healthData.status === 'critical' ? 'Database health critical' : 'Normal operation'
          },
          circuit_breaker: {
            enabled: healthData.status !== 'healthy',
            failure_threshold: 3,
            timeout_ms: 30000
          },
          health_context: {
            status: healthData.status || 'unknown',
            pool_usage: healthData.database?.connection_pool?.pool_healthy ? 'healthy' : 'unknown',
            error_rate: '0%',
            response_time: '0ms',
            last_check: new Date().toISOString()
          }
        }
      }
      
      // Update frontend orchestrator based on backend health
      await syncFrontendWithBackend(healthConfig)
      
      // Reset failure counter on success
      consecutiveFailuresRef.current = 0
      
      // Update last health check time
      lastHealthCheckRef.current = new Date()
      healthCheckCountRef.current++
      
      console.log('🔄 Backend health synced:', healthConfig.health_context.status)
      
    } catch (error) {
      console.error('❌ Backend health sync failed:', error)
      
      // Increment failure counter
      consecutiveFailuresRef.current++
      
      // If we've had too many failures, enable emergency mode
      if (consecutiveFailuresRef.current >= maxConsecutiveFailures) {
        console.warn('🚨 Enabling emergency mode due to repeated health check failures')
        enableEmergencyMode()
      }
    }
  }, [enableEmergencyMode, updateDatabaseHealth, globalState.isEmergencyMode])
  
  // Sync frontend orchestrator with backend health status
  const syncFrontendWithBackend = useCallback(async (healthConfig: BackendHealthConfig) => {
    try {
      // Update database health status
      const healthStatus = healthConfig.health_context.status
      if (healthStatus === 'critical') {
        updateDatabaseHealth('critical')
      } else if (healthStatus === 'degraded') {
        updateDatabaseHealth('degraded')
      } else {
        updateDatabaseHealth('healthy')
      }
      
      // Handle emergency mode
      if (healthConfig.emergency_mode.enabled && !globalState.isEmergencyMode) {
        console.warn(`🚨 Backend requested emergency mode: ${healthConfig.emergency_mode.reason}`)
        enableEmergencyMode()
      } else if (!healthConfig.emergency_mode.enabled && globalState.isEmergencyMode) {
        console.log('🟢 Backend cleared emergency mode')
        disableEmergencyMode()
      }
      
      // Log health context
      console.log('📊 Backend Health Context:', {
        status: healthConfig.health_context.status,
        pool_usage: healthConfig.health_context.pool_usage,
        error_rate: healthConfig.health_context.error_rate,
        response_time: healthConfig.health_context.response_time,
        emergency_mode: healthConfig.emergency_mode.enabled,
        reason: healthConfig.emergency_mode.reason
      })
      
    } catch (error) {
      console.error('❌ Frontend-backend sync failed:', error)
    }
  }, [globalState.isEmergencyMode, enableEmergencyMode, disableEmergencyMode, updateDatabaseHealth])
  
  // Start health monitoring
  useEffect(() => {
    // Start the health monitor
    globalHealthMonitor.start(baseURL)
    
    // Add listener for health status changes
    const handleHealthChange = (status: any) => {
      updateDatabaseHealth({
        isHealthy: status.isHealthy,
        lastCheck: new Date().toISOString(),
        poolUsage: status.isHealthy ? 'healthy' : 'unhealthy',
        errorRate: status.isHealthy ? '0%' : 'high',
        responseTime: status.responseTime ? `${status.responseTime}ms` : 'unknown',
        status: status.isHealthy ? 'healthy' : 'unhealthy'
      })
    }
    
    globalHealthMonitor.addListener(handleHealthChange)
    
    // Initial health check
    fetchBackendHealth()
    
    return () => {
      globalHealthMonitor.removeListener(handleHealthChange)
      globalHealthMonitor.stop()
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [fetchBackendHealth, baseURL, updateDatabaseHealth])
  
  // Manual health check trigger
  const triggerHealthCheck = useCallback(() => {
    fetchBackendHealth()
  }, [fetchBackendHealth])
  
  // Get sync status
  const getSyncStatus = useCallback(() => {
    return {
      lastCheck: lastHealthCheckRef.current,
      checkCount: healthCheckCountRef.current,
      isHealthy: globalState.databaseHealth !== 'critical',
      backendStatus: globalState.databaseHealth,
      emergencyMode: globalState.isEmergencyMode
    }
  }, [globalState.databaseHealth, globalState.isEmergencyMode])
  
  return {
    // Sync status
    getSyncStatus,
    
    // Manual control
    triggerHealthCheck,
    
    // Current state
    backendHealth: globalState.databaseHealth,
    isEmergencyMode: globalState.isEmergencyMode,
    
    // Sync info
    lastHealthCheck: lastHealthCheckRef.current,
    healthCheckCount: healthCheckCountRef.current
  }
}
