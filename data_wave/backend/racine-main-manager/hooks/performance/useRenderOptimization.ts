'use client'

import { useCallback, useMemo, useRef, useEffect } from 'react'

interface RenderOptimizationOptions {
  enableMemoization?: boolean
  enableDebouncedCallbacks?: boolean
  debounceDelay?: number
  enableShallowComparison?: boolean
  maxMemoizedItems?: number
}

const DEFAULT_OPTIONS: Required<RenderOptimizationOptions> = {
  enableMemoization: true,
  enableDebouncedCallbacks: true,
  debounceDelay: 100,
  enableShallowComparison: true,
  maxMemoizedItems: 100
}

export const useRenderOptimization = (options: RenderOptimizationOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const memoizedValuesRef = useRef<Map<string, { value: any; deps: any[]; timestamp: number }>>(new Map())
  const memoizedCallbacksRef = useRef<Map<string, { callback: Function; deps: any[]; timestamp: number }>>(new Map())
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Shallow comparison utility
  const shallowEqual = useCallback((objA: any, objB: any): boolean => {
    if (objA === objB) return true
    
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false
    }
    
    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)
    
    if (keysA.length !== keysB.length) return false
    
    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i]
      if (!keysB.includes(key) || objA[key] !== objB[key]) {
        return false
      }
    }
    
    return true
  }, [])

  // Dependency comparison
  const areDepsEqual = useCallback((depsA: any[], depsB: any[]): boolean => {
    if (depsA.length !== depsB.length) return false
    
    for (let i = 0; i < depsA.length; i++) {
      if (opts.enableShallowComparison && typeof depsA[i] === 'object' && typeof depsB[i] === 'object') {
        if (!shallowEqual(depsA[i], depsB[i])) return false
      } else if (depsA[i] !== depsB[i]) {
        return false
      }
    }
    
    return true
  }, [opts.enableShallowComparison, shallowEqual])

  // Optimized useMemo replacement
  const memoizedValue = useCallback(<T>(
    factory: () => T,
    deps: any[],
    key?: string
  ): T => {
    if (!opts.enableMemoization) {
      return factory()
    }

    const memoKey = key || factory.toString()
    const cached = memoizedValuesRef.current.get(memoKey)
    
    if (cached && areDepsEqual(cached.deps, deps)) {
      return cached.value
    }
    
    const value = factory()
    
    // Clean up old entries if we're at the limit
    if (memoizedValuesRef.current.size >= opts.maxMemoizedItems) {
      const oldestKey = Array.from(memoizedValuesRef.current.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0]
      memoizedValuesRef.current.delete(oldestKey)
    }
    
    memoizedValuesRef.current.set(memoKey, {
      value,
      deps: [...deps],
      timestamp: Date.now()
    })
    
    return value
  }, [opts.enableMemoization, opts.maxMemoizedItems, areDepsEqual])

  // Optimized useCallback replacement
  const memoizedCallback = useCallback(<T extends Function>(
    callback: T,
    deps: any[],
    key?: string
  ): T => {
    if (!opts.enableMemoization) {
      return callback
    }

    const memoKey = key || callback.toString()
    const cached = memoizedCallbacksRef.current.get(memoKey)
    
    if (cached && areDepsEqual(cached.deps, deps)) {
      return cached.callback as T
    }
    
    // Clean up old entries if we're at the limit
    if (memoizedCallbacksRef.current.size >= opts.maxMemoizedItems) {
      const oldestKey = Array.from(memoizedCallbacksRef.current.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0]
      memoizedCallbacksRef.current.delete(oldestKey)
    }
    
    memoizedCallbacksRef.current.set(memoKey, {
      callback,
      deps: [...deps],
      timestamp: Date.now()
    })
    
    return callback
  }, [opts.enableMemoization, opts.maxMemoizedItems, areDepsEqual])

  // Debounced callback
  const debouncedCallback = useCallback(<T extends Function>(
    callback: T,
    delay?: number,
    key?: string
  ): T => {
    if (!opts.enableDebouncedCallbacks) {
      return callback
    }

    const debounceKey = key || callback.toString()
    const debounceDelay = delay ?? opts.debounceDelay
    
    const debouncedFn = ((...args: any[]) => {
      const existingTimer = debounceTimersRef.current.get(debounceKey)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      const timer = setTimeout(() => {
        callback(...args)
        debounceTimersRef.current.delete(debounceKey)
      }, debounceDelay)
      
      debounceTimersRef.current.set(debounceKey, timer)
    }) as T
    
    return debouncedFn
  }, [opts.enableDebouncedCallbacks, opts.debounceDelay])

  // Throttled callback
  const throttledCallback = useCallback(<T extends Function>(
    callback: T,
    delay?: number,
    key?: string
  ): T => {
    const throttleKey = key || callback.toString()
    const throttleDelay = delay ?? opts.debounceDelay
    let lastCallTime = 0
    
    const throttledFn = ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCallTime >= throttleDelay) {
        lastCallTime = now
        callback(...args)
      }
    }) as T
    
    return throttledFn
  }, [opts.debounceDelay])

  // Batch state updates
  const batchUpdates = useCallback((updates: (() => void)[]): void => {
    // Use React's automatic batching in React 18+
    updates.forEach(update => update())
  }, [])

  // Get memoization statistics
  const getMemoizationStats = useCallback(() => {
    return {
      memoizedValues: memoizedValuesRef.current.size,
      memoizedCallbacks: memoizedCallbacksRef.current.size,
      activeDebounceTimers: debounceTimersRef.current.size,
      memoryUsage: {
        values: JSON.stringify(Array.from(memoizedValuesRef.current.values())).length,
        callbacks: memoizedCallbacksRef.current.size * 100 // rough estimate
      }
    }
  }, [])

  // Clear memoization cache
  const clearMemoizationCache = useCallback((pattern?: string) => {
    if (pattern) {
      const regex = new RegExp(pattern)
      
      // Clear matching values
      Array.from(memoizedValuesRef.current.keys()).forEach(key => {
        if (regex.test(key)) {
          memoizedValuesRef.current.delete(key)
        }
      })
      
      // Clear matching callbacks
      Array.from(memoizedCallbacksRef.current.keys()).forEach(key => {
        if (regex.test(key)) {
          memoizedCallbacksRef.current.delete(key)
        }
      })
    } else {
      memoizedValuesRef.current.clear()
      memoizedCallbacksRef.current.clear()
    }
  }, [])

  // Cleanup debounce timers
  const clearDebounceTimers = useCallback(() => {
    debounceTimersRef.current.forEach(timer => clearTimeout(timer))
    debounceTimersRef.current.clear()
  }, [])

  // Optimize component for specific scenarios
  const optimizeForScenario = useCallback((scenario: 'heavy-computation' | 'frequent-updates' | 'large-lists' | 'animations') => {
    switch (scenario) {
      case 'heavy-computation':
        return {
          memoizedValue: (factory: () => any, deps: any[]) => memoizedValue(factory, deps),
          debouncedCallback: (callback: Function) => debouncedCallback(callback, 300)
        }
      
      case 'frequent-updates':
        return {
          throttledCallback: (callback: Function) => throttledCallback(callback, 16), // 60fps
          memoizedCallback: (callback: Function, deps: any[]) => memoizedCallback(callback, deps)
        }
      
      case 'large-lists':
        return {
          memoizedValue: (factory: () => any, deps: any[]) => memoizedValue(factory, deps),
          shallowEqual,
          batchUpdates
        }
      
      case 'animations':
        return {
          throttledCallback: (callback: Function) => throttledCallback(callback, 16),
          memoizedCallback: (callback: Function, deps: any[]) => memoizedCallback(callback, deps)
        }
      
      default:
        return {}
    }
  }, [memoizedValue, memoizedCallback, debouncedCallback, throttledCallback, shallowEqual, batchUpdates])

  // Performance monitoring
  const renderOptimizationMetrics = useMemo(() => {
    return {
      memoizedItemsCount: memoizedValuesRef.current.size + memoizedCallbacksRef.current.size,
      activeTimersCount: debounceTimersRef.current.size,
      cacheHitRate: 0, // Would need to track hits/misses for accurate calculation
      memoryFootprint: JSON.stringify({
        values: Array.from(memoizedValuesRef.current.values()),
        callbacks: Array.from(memoizedCallbacksRef.current.keys())
      }).length
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDebounceTimers()
      clearMemoizationCache()
    }
  }, [clearDebounceTimers, clearMemoizationCache])

  // Periodic cleanup of old memoized items
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      const maxAge = 5 * 60 * 1000 // 5 minutes
      
      // Clean up old values
      Array.from(memoizedValuesRef.current.entries()).forEach(([key, { timestamp }]) => {
        if (now - timestamp > maxAge) {
          memoizedValuesRef.current.delete(key)
        }
      })
      
      // Clean up old callbacks
      Array.from(memoizedCallbacksRef.current.entries()).forEach(([key, { timestamp }]) => {
        if (now - timestamp > maxAge) {
          memoizedCallbacksRef.current.delete(key)
        }
      })
    }, 60000) // Check every minute
    
    return () => clearInterval(cleanupInterval)
  }, [])

  return {
    memoizedValue,
    memoizedCallback,
    debouncedCallback,
    throttledCallback,
    batchUpdates,
    shallowEqual,
    areDepsEqual,
    getMemoizationStats,
    clearMemoizationCache,
    clearDebounceTimers,
    optimizeForScenario,
    renderOptimizationMetrics
  }
}