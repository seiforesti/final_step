// ============================================================================
// GLOBAL API REQUEST ORCHESTRATOR - PREVENTING BURST REQUESTS ACROSS ALL COMPONENTS
// ============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// Global request state management
interface GlobalRequestState {
  totalRequests: number
  activeRequests: number
  queuedRequests: number
  lastRequestTime: number
  isEmergencyMode: boolean
  circuitBreakerOpen: boolean
  databaseHealth: 'healthy' | 'degraded' | 'critical'
}

// Request priority levels
export enum RequestPriority {
  CRITICAL = 'critical',      // Authentication, core functionality
  HIGH = 'high',             // User interactions, real-time data
  MEDIUM = 'medium',         // Background updates, periodic refreshes
  LOW = 'low',               // Analytics, non-essential features
  BULK = 'bulk'              // Batch operations, data imports
}

// Request configuration
interface RequestConfig {
  priority: RequestPriority
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  estimatedDuration: number
  retryCount?: number
  timeout?: number
}

// Request queue item
interface QueuedRequest {
  id: string
  config: RequestConfig
  execute: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
  timestamp: number
  attempts: number
}

export const useGlobalAPIOrchestrator = () => {
  // Global state
  const [globalState, setGlobalState] = useState<GlobalRequestState>({
    totalRequests: 0,
    activeRequests: 0,
    queuedRequests: 0,
    lastRequestTime: 0,
    isEmergencyMode: false,
    circuitBreakerOpen: false,
    databaseHealth: 'healthy'
  })

  // Request queues by priority
  const requestQueues = useRef<Map<RequestPriority, QueuedRequest[]>>(new Map())
  
  // Active requests tracking
  const activeRequests = useRef<Set<string>>(new Set())
  
  // Circuit breaker state
  const circuitBreakerFailures = useRef(0)
  const lastFailureTime = useRef(0)
  
  // Configuration
  const config = useMemo(() => ({
    // Request limits
    maxConcurrentRequests: 3,           // Maximum 3 concurrent requests
    maxRequestsPerMinute: 10,           // Maximum 10 requests per minute
    maxRequestsPerSecond: 2,            // Maximum 2 requests per second
    
    // Circuit breaker
    maxFailures: 3,                     // Open circuit after 3 failures
    circuitBreakerTimeout: 30000,       // 30 seconds cooldown
    
    // Emergency mode
    emergencyModeThreshold: 5,          // Enable emergency mode after 5 failures
    emergencyModeTimeout: 60000,        // 1 minute emergency mode
    
    // Request delays
    minDelayBetweenRequests: 500,      // 500ms minimum between requests
    priorityDelays: {
      [RequestPriority.CRITICAL]: 0,   // No delay for critical requests
      [RequestPriority.HIGH]: 200,     // 200ms delay for high priority
      [RequestPriority.MEDIUM]: 1000,  // 1 second delay for medium
      [RequestPriority.LOW]: 2000,     // 2 seconds delay for low
      [RequestPriority.BULK]: 5000,    // 5 seconds delay for bulk
    },
    
    // Batch processing
    batchSize: 2,                       // Process 2 requests at a time
    batchDelay: 1500,                   // 1.5 seconds between batches
  }), [])

  // Initialize queues
  useEffect(() => {
    Object.values(RequestPriority).forEach(priority => {
      requestQueues.current.set(priority, [])
    })
  }, [])

  // Database health monitoring
  const updateDatabaseHealth = useCallback((health: GlobalRequestState['databaseHealth']) => {
    setGlobalState(prev => ({ ...prev, databaseHealth: health }))
    
    if (health === 'critical') {
      setGlobalState(prev => ({ ...prev, isEmergencyMode: true }))
      console.warn('🚨 EMERGENCY MODE: Database health critical - blocking all non-critical requests')
    }
  }, [])

  // Circuit breaker management
  const handleRequestFailure = useCallback((endpoint: string, error: any) => {
    circuitBreakerFailures.current++
    lastFailureTime.current = Date.now()
    
    console.warn(`🔴 Request failed: ${endpoint}`, error)
    
    // Check if we should open circuit breaker
    if (circuitBreakerFailures.current >= config.maxFailures) {
      setGlobalState(prev => ({ ...prev, circuitBreakerOpen: true }))
      console.error('🔴 CIRCUIT BREAKER OPEN: Too many failures, blocking all requests')
      
      // Auto-reset after timeout
      setTimeout(() => {
        setGlobalState(prev => ({ ...prev, circuitBreakerOpen: false }))
        circuitBreakerFailures.current = 0
        console.log('🟢 CIRCUIT BREAKER RESET: Requests allowed again')
      }, config.circuitBreakerTimeout)
    }
    
    // Check if we should enable emergency mode
    if (circuitBreakerFailures.current >= config.emergencyModeThreshold) {
      setGlobalState(prev => ({ ...prev, isEmergencyMode: true }))
      console.error('🚨 EMERGENCY MODE: Critical failure threshold reached')
      
      // Auto-disable emergency mode after timeout
      setTimeout(() => {
        setGlobalState(prev => ({ ...prev, isEmergencyMode: false }))
        console.log('🟢 EMERGENCY MODE DISABLED: Normal operation resumed')
      }, config.emergencyModeTimeout)
    }
  }, [config])

  const handleRequestSuccess = useCallback(() => {
    // Reset failure count on success
    if (circuitBreakerFailures.current > 0) {
      circuitBreakerFailures.current = Math.max(0, circuitBreakerFailures.current - 1)
    }
  }, [])

  // Request queue processing
  const processQueue = useCallback(async (priority: RequestPriority) => {
    const queue = requestQueues.current.get(priority)
    if (!queue || queue.length === 0) return
    
    // Process requests in batches
    const batch = queue.splice(0, config.batchSize)
    
    for (const request of batch) {
      // Check if we can make the request
      if (globalState.isEmergencyMode && request.config.priority !== RequestPriority.CRITICAL) {
        request.reject(new Error('Emergency mode active - only critical requests allowed'))
        continue
      }
      
      if (globalState.circuitBreakerOpen) {
        request.reject(new Error('Circuit breaker open - requests temporarily blocked'))
        continue
      }
      
      if (activeRequests.current.size >= config.maxConcurrentRequests) {
        // Re-queue the request
        queue.unshift(request)
        continue
      }
      
      // Execute the request
      try {
        activeRequests.current.add(request.id)
        setGlobalState(prev => ({ 
          ...prev, 
          activeRequests: prev.activeRequests + 1,
          totalRequests: prev.totalRequests + 1,
          lastRequestTime: Date.now()
        }))
        
        const result = await request.execute()
        request.resolve(result)
        handleRequestSuccess()
        
      } catch (error) {
        request.reject(error)
        handleRequestFailure(request.config.endpoint, error)
        
      } finally {
        activeRequests.current.delete(request.id)
        setGlobalState(prev => ({ 
          ...prev, 
          activeRequests: prev.activeRequests - 1,
          queuedRequests: prev.queuedRequests - 1
        }))
      }
      
      // Add delay between requests
      if (request.config.priority !== RequestPriority.CRITICAL) {
        await new Promise(resolve => setTimeout(resolve, config.minDelayBetweenRequests))
      }
    }
    
    // Process next batch after delay
    if (queue.length > 0) {
      setTimeout(() => processQueue(priority), config.batchDelay)
    }
  }, [globalState, config, handleRequestFailure, handleRequestSuccess])

  // Main request orchestrator
  const executeRequest = useCallback(async <T>(
    config: RequestConfig,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const requestId = `${config.method}:${config.endpoint}:${Date.now()}:${Math.random()}`
      
      const queuedRequest: QueuedRequest = {
        id: requestId,
        config,
        execute: requestFn,
        resolve,
        reject,
        timestamp: Date.now(),
        attempts: 0
      }
      
      // Add to appropriate priority queue
      const queue = requestQueues.current.get(config.priority)
      if (queue) {
        queue.push(queuedRequest)
        setGlobalState(prev => ({ ...prev, queuedRequests: prev.queuedRequests + 1 }))
        
        // Process queue if not already processing
        if (queue.length === 1) {
          processQueue(config.priority)
        }
      }
    })
  }, [processQueue])

  // Priority-specific request methods
  const criticalRequest = useCallback(<T>(endpoint: string, requestFn: () => Promise<T>) => {
    return executeRequest({
      priority: RequestPriority.CRITICAL,
      endpoint,
      method: 'GET',
      estimatedDuration: 1000
    }, requestFn)
  }, [executeRequest])

  const highPriorityRequest = useCallback(<T>(endpoint: string, requestFn: () => Promise<T>) => {
    return executeRequest({
      priority: RequestPriority.HIGH,
      endpoint,
      method: 'GET',
      estimatedDuration: 2000
    }, requestFn)
  }, [executeRequest])

  const mediumPriorityRequest = useCallback(<T>(endpoint: string, requestFn: () => Promise<T>) => {
    return executeRequest({
      priority: RequestPriority.MEDIUM,
      endpoint,
      method: 'GET',
      estimatedDuration: 3000
    }, requestFn)
  }, [executeRequest])

  const lowPriorityRequest = useCallback(<T>(endpoint: string, requestFn: () => Promise<T>) => {
    return executeRequest({
      priority: RequestPriority.LOW,
      endpoint,
      method: 'GET',
      estimatedDuration: 5000
    }, requestFn)
  }, [executeRequest])

  const bulkRequest = useCallback(<T>(endpoint: string, requestFn: () => Promise<T>) => {
    return executeRequest({
      priority: RequestPriority.BULK,
      endpoint,
      method: 'GET',
      estimatedDuration: 10000
    }, requestFn)
  }, [executeRequest])

  // Manual emergency mode control
  const enableEmergencyMode = useCallback(() => {
    setGlobalState(prev => ({ ...prev, isEmergencyMode: true }))
    console.warn('🚨 EMERGENCY MODE MANUALLY ENABLED')
  }, [])

  const disableEmergencyMode = useCallback(() => {
    setGlobalState(prev => ({ ...prev, isEmergencyMode: false }))
    console.log('🟢 EMERGENCY MODE MANUALLY DISABLED')
  }, [])

  // Queue management
  const clearQueue = useCallback((priority?: RequestPriority) => {
    if (priority) {
      const queue = requestQueues.current.get(priority)
      if (queue) {
        queue.length = 0
        setGlobalState(prev => ({ ...prev, queuedRequests: prev.queuedRequests - queue.length }))
      }
    } else {
      // Clear all queues
      requestQueues.current.forEach(queue => queue.length = 0)
      setGlobalState(prev => ({ ...prev, queuedRequests: 0 }))
    }
  }, [])

  const getQueueStatus = useCallback(() => {
    const status: Record<RequestPriority, number> = {} as any
    requestQueues.current.forEach((queue, priority) => {
      status[priority] = queue.length
    })
    return status
  }, [])

  // Health check
  const isHealthy = useCallback(() => {
    return !globalState.isEmergencyMode && 
           !globalState.circuitBreakerOpen && 
           globalState.databaseHealth !== 'critical'
  }, [globalState])

  return {
    // State
    globalState,
    
    // Request methods
    executeRequest,
    criticalRequest,
    highPriorityRequest,
    mediumPriorityRequest,
    lowPriorityRequest,
    bulkRequest,
    
    // Control methods
    enableEmergencyMode,
    disableEmergencyMode,
    clearQueue,
    getQueueStatus,
    isHealthy,
    
    // Health monitoring
    updateDatabaseHealth,
    
    // Configuration
    config
  }
}
