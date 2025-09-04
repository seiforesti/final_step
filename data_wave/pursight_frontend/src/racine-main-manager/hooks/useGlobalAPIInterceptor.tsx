// ============================================================================
// GLOBAL API INTERCEPTOR - AUTOMATICALLY INTERCEPTS ALL FETCH REQUESTS
// ============================================================================

import { useEffect, useRef } from 'react'
import { useGlobalAPIOrchestrator, RequestPriority } from './useGlobalAPIOrchestrator'

// Original fetch function
const originalFetch = globalThis.fetch

// Request pattern matcher
interface RequestPattern {
  pattern: RegExp | string
  priority: RequestPriority
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  estimatedDuration: number
}

// Default request patterns
const DEFAULT_REQUEST_PATTERNS: RequestPattern[] = [
  // Critical requests - Authentication, core functionality (narrowly scoped)
  { pattern: /\/auth\/(me|token|refresh)/, priority: RequestPriority.CRITICAL, estimatedDuration: 1000 },
  { pattern: /\/health/, priority: RequestPriority.CRITICAL, estimatedDuration: 500 },
  { pattern: /\/ping/, priority: RequestPriority.CRITICAL, estimatedDuration: 500 },
  
  // High priority - User interactions, real-time data
  { pattern: /\/data-sources\/\d+\/health/, priority: RequestPriority.HIGH, estimatedDuration: 2000 },
  { pattern: /\/data-sources\/\d+\/stats/, priority: RequestPriority.HIGH, estimatedDuration: 2000 },
  { pattern: /\/notifications/, priority: RequestPriority.HIGH, estimatedDuration: 1500 },
  { pattern: /\/user\//, priority: RequestPriority.HIGH, estimatedDuration: 1500 },
  
  // Medium priority - Background updates, periodic refreshes
  { pattern: /\/data-sources/, priority: RequestPriority.MEDIUM, estimatedDuration: 3000 },
  { pattern: /\/scans/, priority: RequestPriority.MEDIUM, estimatedDuration: 3000 },
  { pattern: /\/reports/, priority: RequestPriority.MEDIUM, estimatedDuration: 3000 },
  { pattern: /\/tasks/, priority: RequestPriority.MEDIUM, estimatedDuration: 3000 },
  
  // Low priority - Analytics, non-essential features
  { pattern: /\/analytics/, priority: RequestPriority.LOW, estimatedDuration: 5000 },
  { pattern: /\/metrics/, priority: RequestPriority.LOW, estimatedDuration: 5000 },
  { pattern: /\/logs/, priority: RequestPriority.LOW, estimatedDuration: 5000 },
  
  // Bulk operations - Batch operations, data imports
  { pattern: /\/bulk/, priority: RequestPriority.BULK, estimatedDuration: 10000 },
  { pattern: /\/import/, priority: RequestPriority.BULK, estimatedDuration: 10000 },
  { pattern: /\/export/, priority: RequestPriority.BULK, estimatedDuration: 10000 },
]

export const useGlobalAPIInterceptor = () => {
  const orchestrator = useGlobalAPIOrchestrator()
  const isIntercepted = useRef(false)
  const activationId = useRef<string | null>(null)
  
  // Determine request priority based on URL and method
  const getRequestPriority = (url: string, method: string): RequestPriority => {
    for (const pattern of DEFAULT_REQUEST_PATTERNS) {
      if (pattern.method && pattern.method !== method) continue
      
      if (typeof pattern.pattern === 'string') {
        if (url.includes(pattern.pattern)) {
          return pattern.priority
        }
      } else if (pattern.pattern.test(url)) {
        return pattern.priority
      }
    }
    
    // Default to medium priority for unknown endpoints
    return RequestPriority.MEDIUM
  }
  
  // Get estimated duration for a request
  const getEstimatedDuration = (url: string, method: string): number => {
    for (const pattern of DEFAULT_REQUEST_PATTERNS) {
      if (pattern.method && pattern.method !== method) continue
      
      if (typeof pattern.pattern === 'string') {
        if (url.includes(pattern.pattern)) {
          return pattern.estimatedDuration
        }
      } else if (pattern.pattern.test(url)) {
        return pattern.estimatedDuration
      }
    }
    
    // Default duration
    return 3000
  }
  
  // Intercept fetch requests (once); handle StrictMode double-invoke
  useEffect(() => {
    if (isIntercepted.current) return
    const id = `${Date.now()}-${Math.random()}`
    activationId.current = id
    
    const original = originalFetch
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const method = (init?.method || 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE'
      
      // Skip interception for certain requests
      if (shouldSkipInterception(url, method)) {
        return original(input, init)
      }
      
      // Determine priority and duration
      const priority = getRequestPriority(url, method)
      const estimatedDuration = getEstimatedDuration(url, method)
      
      // Log request for debugging
      console.log(`🌐 [${priority.toUpperCase()}] ${method} ${url}`)
      
      try {
        // Route through orchestrator
        const result = await orchestrator.executeRequest({
          priority,
          endpoint: url,
          method,
          estimatedDuration
        }, () => original(input, init))
        
        return result
        
      } catch (error) {
        console.error(`❌ Request failed: ${method} ${url}`, error)
        throw error
      }
    }
    
    isIntercepted.current = true
    if ((globalThis as any).__RACINE_VERBOSE_LOGS__) {
      console.log('🚀 Global API Interceptor activated')
    }
    
    // Cleanup function
    return () => {
      // Only deactivate if this hook instance activated it (avoid StrictMode flicker)
      if (activationId.current === id) {
        globalThis.fetch = original
        isIntercepted.current = false
        if ((globalThis as any).__RACINE_VERBOSE_LOGS__) {
          console.log('🔄 Global API Interceptor deactivated')
        }
      }
    }
  }, [orchestrator])
  
  // Check if request should skip interception
  const shouldSkipInterception = (url: string, method: string): boolean => {
    // Skip health checks to prevent infinite loops
    if (url.includes('/health') || url.includes('/ping')) {
      return true
    }
    
    // Skip internal orchestrator requests
    if (url.includes('/orchestrator/')) {
      return true
    }
    
    // Skip static assets
    if (url.includes('.js') || url.includes('.css') || url.includes('.png') || url.includes('.jpg')) {
      return true
    }
    
    // Skip WebSocket connections
    if (url.startsWith('ws://') || url.startsWith('wss://')) {
      return true
    }
    
    return false
  }
  
  // Manual request execution (for components that need direct control)
  const executeRequest = async <T,>(
    url: string,
    options?: RequestInit,
    priority?: RequestPriority
  ): Promise<T> => {
    const method = (options?.method || 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE'
    const requestPriority = priority || getRequestPriority(url, method)
    const estimatedDuration = getEstimatedDuration(url, method)
    
    return orchestrator.executeRequest({
      priority: requestPriority,
      endpoint: url,
      method,
      estimatedDuration
    }, () => originalFetch(url, options))
  }
  
  // Debug logging (opt-in to reduce console noise)
  if ((globalThis as any).__RACINE_VERBOSE_LOGS__) {
    console.log('🔍 useGlobalAPIInterceptor - orchestrator methods:', Object.keys(orchestrator))
    console.log('🔍 useGlobalAPIInterceptor - orchestrator state:', orchestrator.globalState)
  }
  
  const result = {
    // Orchestrator methods - spread all methods from the orchestrator
    ...orchestrator,
    
    // Manual request execution
    executeRequest,
    
    // Request priority helpers
    getRequestPriority,
    getEstimatedDuration,
    
    // Interceptor status
    isIntercepted: isIntercepted.current
  }
  
  if ((globalThis as any).__RACINE_VERBOSE_LOGS__) {
    console.log('🔍 useGlobalAPIInterceptor - returning methods:', Object.keys(result))
  }
  return result
}
