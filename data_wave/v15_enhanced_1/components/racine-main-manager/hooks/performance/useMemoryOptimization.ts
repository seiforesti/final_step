'use client'

import { useCallback, useRef, useEffect } from 'react'

interface MemoryOptimizationOptions {
  enableGarbageCollection?: boolean
  memoryThreshold?: number // MB
  cleanupInterval?: number // ms
  enableMemoryLogging?: boolean
}

interface MemoryMetrics {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  timestamp: number
}

const DEFAULT_OPTIONS: Required<MemoryOptimizationOptions> = {
  enableGarbageCollection: true,
  memoryThreshold: 50, // 50MB
  cleanupInterval: 30000, // 30 seconds
  enableMemoryLogging: false
}

export const useMemoryOptimization = (options: MemoryOptimizationOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const cleanupIntervalRef = useRef<NodeJS.Timeout>()
  const memoryHistoryRef = useRef<MemoryMetrics[]>([])
  const objectRefsRef = useRef<Set<WeakRef<object>>>(new Set())
  const cacheRef = useRef<Map<string, any>>(new Map())
  const cacheTimestampsRef = useRef<Map<string, number>>(new Map())

  // Get current memory usage
  const getMemoryUsage = useCallback((): MemoryMetrics | null => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      }
    }
    return null
  }, [])

  // Force garbage collection (if available)
  const forceGarbageCollection = useCallback(() => {
    if (opts.enableGarbageCollection && 'gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc()
        if (opts.enableMemoryLogging) {
          console.info('Forced garbage collection executed')
        }
      } catch (error) {
        console.warn('Failed to force garbage collection:', error)
      }
    }
  }, [opts.enableGarbageCollection, opts.enableMemoryLogging])

  // Check if memory usage is above threshold
  const isMemoryAboveThreshold = useCallback((): boolean => {
    const memory = getMemoryUsage()
    if (!memory) return false
    
    const usedMB = memory.usedJSHeapSize / (1024 * 1024)
    return usedMB > opts.memoryThreshold
  }, [getMemoryUsage, opts.memoryThreshold])

  // Clean up weak references
  const cleanupWeakRefs = useCallback(() => {
    const toDelete: WeakRef<object>[] = []
    
    objectRefsRef.current.forEach(ref => {
      if (ref.deref() === undefined) {
        toDelete.push(ref)
      }
    })
    
    toDelete.forEach(ref => {
      objectRefsRef.current.delete(ref)
    })
    
    if (opts.enableMemoryLogging && toDelete.length > 0) {
      console.info(`Cleaned up ${toDelete.length} weak references`)
    }
  }, [opts.enableMemoryLogging])

  // Clean up cache based on age
  const cleanupCache = useCallback((maxAge: number = 300000) => { // 5 minutes default
    const now = Date.now()
    const toDelete: string[] = []
    
    cacheTimestampsRef.current.forEach((timestamp, key) => {
      if (now - timestamp > maxAge) {
        toDelete.push(key)
      }
    })
    
    toDelete.forEach(key => {
      cacheRef.current.delete(key)
      cacheTimestampsRef.current.delete(key)
    })
    
    if (opts.enableMemoryLogging && toDelete.length > 0) {
      console.info(`Cleaned up ${toDelete.length} cache entries`)
    }
  }, [opts.enableMemoryLogging])

  // Comprehensive memory optimization
  const optimizeMemory = useCallback(() => {
    const beforeMemory = getMemoryUsage()
    
    // Clean up weak references
    cleanupWeakRefs()
    
    // Clean up cache
    cleanupCache()
    
    // Force garbage collection if memory is above threshold
    if (isMemoryAboveThreshold()) {
      forceGarbageCollection()
    }
    
    // Log memory optimization results
    if (opts.enableMemoryLogging) {
      const afterMemory = getMemoryUsage()
      if (beforeMemory && afterMemory) {
        const beforeMB = beforeMemory.usedJSHeapSize / (1024 * 1024)
        const afterMB = afterMemory.usedJSHeapSize / (1024 * 1024)
        const freedMB = beforeMB - afterMB
        
        console.info(`Memory optimization completed:`, {
          before: `${beforeMB.toFixed(2)}MB`,
          after: `${afterMB.toFixed(2)}MB`,
          freed: `${freedMB.toFixed(2)}MB`,
          cacheSize: cacheRef.current.size,
          weakRefsCount: objectRefsRef.current.size
        })
      }
    }
  }, [
    getMemoryUsage,
    cleanupWeakRefs,
    cleanupCache,
    isMemoryAboveThreshold,
    forceGarbageCollection,
    opts.enableMemoryLogging
  ])

  // Track memory usage over time
  const trackMemoryUsage = useCallback(() => {
    const memory = getMemoryUsage()
    if (memory) {
      memoryHistoryRef.current.push(memory)
      
      // Keep only recent history (last 100 measurements)
      if (memoryHistoryRef.current.length > 100) {
        memoryHistoryRef.current.shift()
      }
    }
  }, [getMemoryUsage])

  // Get memory statistics
  const getMemoryStats = useCallback(() => {
    const history = memoryHistoryRef.current
    if (history.length === 0) return null
    
    const usedSizes = history.map(m => m.usedJSHeapSize)
    const latest = history[history.length - 1]
    
    return {
      current: {
        usedMB: (latest.usedJSHeapSize / (1024 * 1024)).toFixed(2),
        totalMB: (latest.totalJSHeapSize / (1024 * 1024)).toFixed(2),
        limitMB: (latest.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)
      },
      peak: {
        usedMB: (Math.max(...usedSizes) / (1024 * 1024)).toFixed(2)
      },
      average: {
        usedMB: (usedSizes.reduce((sum, size) => sum + size, 0) / usedSizes.length / (1024 * 1024)).toFixed(2)
      },
      measurements: history.length,
      cacheSize: cacheRef.current.size,
      weakRefsCount: objectRefsRef.current.size
    }
  }, [])

  // Add object to weak reference tracking
  const trackObject = useCallback((obj: object) => {
    const weakRef = new WeakRef(obj)
    objectRefsRef.current.add(weakRef)
    return weakRef
  }, [])

  // Cache management
  const setCache = useCallback((key: string, value: any, ttl?: number) => {
    cacheRef.current.set(key, value)
    cacheTimestampsRef.current.set(key, Date.now())
    
    // Set up automatic cleanup for this entry if TTL provided
    if (ttl) {
      setTimeout(() => {
        cacheRef.current.delete(key)
        cacheTimestampsRef.current.delete(key)
      }, ttl)
    }
  }, [])

  const getCache = useCallback((key: string) => {
    return cacheRef.current.get(key)
  }, [])

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      const regex = new RegExp(pattern)
      const toDelete: string[] = []
      
      cacheRef.current.forEach((_, key) => {
        if (regex.test(key)) {
          toDelete.push(key)
        }
      })
      
      toDelete.forEach(key => {
        cacheRef.current.delete(key)
        cacheTimestampsRef.current.delete(key)
      })
    } else {
      cacheRef.current.clear()
      cacheTimestampsRef.current.clear()
    }
  }, [])

  // Set up automatic memory optimization
  useEffect(() => {
    if (opts.cleanupInterval > 0) {
      cleanupIntervalRef.current = setInterval(() => {
        trackMemoryUsage()
        
        if (isMemoryAboveThreshold()) {
          optimizeMemory()
        } else {
          // Light cleanup even when below threshold
          cleanupWeakRefs()
          cleanupCache(600000) // 10 minutes for light cleanup
        }
      }, opts.cleanupInterval)
    }

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [opts.cleanupInterval, trackMemoryUsage, isMemoryAboveThreshold, optimizeMemory, cleanupWeakRefs, cleanupCache])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Final cleanup
      optimizeMemory()
      
      // Log final memory stats
      if (opts.enableMemoryLogging) {
        const stats = getMemoryStats()
        if (stats) {
          console.info('Final memory statistics:', stats)
        }
      }
    }
  }, [optimizeMemory, opts.enableMemoryLogging, getMemoryStats])

  return {
    optimizeMemory,
    getMemoryUsage,
    getMemoryStats,
    trackMemoryUsage,
    isMemoryAboveThreshold,
    forceGarbageCollection,
    trackObject,
    setCache,
    getCache,
    clearCache,
    cleanupWeakRefs,
    cleanupCache
  }
}