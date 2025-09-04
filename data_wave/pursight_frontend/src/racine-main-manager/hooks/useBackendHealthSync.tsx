// ============================================================================
// BACKEND HEALTH SYNC - AUTOMATICALLY SYNC BACKEND HEALTH WITH FRONTEND ORCHESTRATOR
// ============================================================================

import { useEffect, useRef, useCallback } from 'react'
import { useGlobalAPIInterceptor } from './useGlobalAPIInterceptor'

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
  
  // Fetch backend health configuration
  const fetchBackendHealth = useCallback(async () => {
    try {
      // Use plain fetch and route through internal proxy to reach backend health router
      const response = await fetch('/api/proxy/health/frontend-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      })
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      const healthConfig: BackendHealthConfig = await response.json()
      
      // Update frontend orchestrator based on backend health
      await syncFrontendWithBackend(healthConfig)
      
      // Update last health check time
      lastHealthCheckRef.current = new Date()
      healthCheckCountRef.current++
      
      console.log('🔄 Backend health synced:', healthConfig.health_context.status)
      
    } catch (error) {
      console.error('❌ Backend health sync failed:', error)
      
      // Avoid immediately flipping to emergency on a single failure
      // Only escalate if we have consecutive failures handled elsewhere
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
    // Initial health check
    fetchBackendHealth()
    
    // Set up periodic health checks
    syncIntervalRef.current = setInterval(fetchBackendHealth, 30000) // Every 30 seconds
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [fetchBackendHealth])
  
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
