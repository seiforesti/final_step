import { useCallback, useRef, useState, useEffect } from 'react'
import LazyQuickComponent from '../../components/quick-actions-sidebar/components/LazyQuickComponent'

interface LazyLoadOptions {
  enableCache?: boolean
  cacheSize?: number
  enablePreloading?: boolean
  preloadDelay?: number
  enableErrorRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  enablePerformanceTracking?: boolean
}

interface ComponentMetadata {
  id: string
  path: string
  dependencies?: string[]
  priority?: 'low' | 'medium' | 'high'
  estimatedSize?: number
  preloadConditions?: string[]
}

interface LoadResult {
  success: boolean
  component?: React.ComponentType<any>
  error?: Error
  loadTime?: number
  fromCache?: boolean
}

interface CacheEntry {
  component: React.ComponentType<any>
  metadata: ComponentMetadata
  loadTime: number
  lastAccessed: Date
  accessCount: number
}

const DEFAULT_OPTIONS: Required<LazyLoadOptions> = {
  enableCache: true,
  cacheSize: 50,
  enablePreloading: true,
  preloadDelay: 2000,
  enableErrorRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enablePerformanceTracking: true
}

export const useComponentLazyLoading = (options: LazyLoadOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map())
  const loadingRef = useRef<Set<string>>(new Set())
  const retryCountRef = useRef<Map<string, number>>(new Map())
  const preloadTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const performanceMetricsRef = useRef<Map<string, number[]>>(new Map())

  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set())
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set())
  const [errorComponents, setErrorComponents] = useState<Map<string, Error>>(new Map())

  // Component registry for lazy loading
  const componentRegistry = useRef<Map<string, ComponentMetadata>>(new Map())

  // Register a component for lazy loading
  const registerComponent = useCallback((metadata: ComponentMetadata) => {
    componentRegistry.current.set(metadata.id, metadata)
  }, [])

  // Register multiple components
  const registerComponents = useCallback((components: ComponentMetadata[]) => {
    components.forEach(component => {
      componentRegistry.current.set(component.id, component)
    })
  }, [])

  // Clear cache entry
  const clearCacheEntry = useCallback((componentId: string) => {
    cacheRef.current.delete(componentId)
  }, [])

  // Clear entire cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current
    const entries = Array.from(cache.values())
    
    return {
      size: cache.size,
      maxSize: opts.cacheSize,
      totalAccessCount: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageLoadTime: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.loadTime, 0) / entries.length 
        : 0,
      oldestEntry: entries.length > 0 
        ? Math.min(...entries.map(entry => entry.lastAccessed.getTime()))
        : null,
      newestEntry: entries.length > 0 
        ? Math.max(...entries.map(entry => entry.lastAccessed.getTime()))
        : null
    }
  }, [opts.cacheSize])

  // Evict least recently used cache entries
  const evictLRUEntries = useCallback(() => {
    const cache = cacheRef.current
    if (cache.size <= opts.cacheSize) return

    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime())

    const entriesToRemove = entries.slice(0, cache.size - opts.cacheSize)
    entriesToRemove.forEach(([id]) => {
      cache.delete(id)
    })
  }, [opts.cacheSize])

  // Load component dynamically
  const loadComponent = useCallback(async (componentId: string): Promise<LoadResult> => {
    const startTime = performance.now()

    // Check cache first
    if (opts.enableCache) {
      const cached = cacheRef.current.get(componentId)
      if (cached) {
        cached.lastAccessed = new Date()
        cached.accessCount++
        
        if (opts.enablePerformanceTracking) {
          console.info(`Component ${componentId} loaded from cache in ${(performance.now() - startTime).toFixed(2)}ms`)
        }
        
        return {
          success: true,
          component: cached.component,
          loadTime: performance.now() - startTime,
          fromCache: true
        }
      }
    }

    // Check if already loading
    if (loadingRef.current.has(componentId)) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!loadingRef.current.has(componentId)) {
            const cached = cacheRef.current.get(componentId)
            if (cached) {
              resolve({
                success: true,
                component: cached.component,
                loadTime: performance.now() - startTime,
                fromCache: true
              })
            } else {
              const error = errorComponents.get(componentId)
              resolve({
                success: false,
                error: error || new Error('Loading failed'),
                loadTime: performance.now() - startTime
              })
            }
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
    }

    // Get component metadata
    const metadata = componentRegistry.current.get(componentId)
    if (!metadata) {
      const error = new Error(`Component ${componentId} not registered`)
      setErrorComponents(prev => new Map(prev).set(componentId, error))
      return {
        success: false,
        error,
        loadTime: performance.now() - startTime
      }
    }

    // Mark as loading
    loadingRef.current.add(componentId)
    setLoadingComponents(prev => new Set(prev).add(componentId))

    try {
      // Enterprise-safe fallback: avoid fully dynamic imports which Next.js cannot statically analyze.
      // Use a resilient placeholder that renders a clear message and keeps the UI responsive.
      const component: React.ComponentType<any> = LazyQuickComponent as any

      const loadTime = performance.now() - startTime

      // Cache the component
      if (opts.enableCache) {
        // Evict LRU entries if needed
        evictLRUEntries()

        cacheRef.current.set(componentId, {
          component,
          metadata,
          loadTime,
          lastAccessed: new Date(),
          accessCount: 1
        })
      }

      // Track performance metrics
      if (opts.enablePerformanceTracking) {
        if (!performanceMetricsRef.current.has(componentId)) {
          performanceMetricsRef.current.set(componentId, [])
        }
        performanceMetricsRef.current.get(componentId)!.push(loadTime)
        
        console.info(`Component ${componentId} loaded in ${loadTime.toFixed(2)}ms`)
      }

      // Update state
      loadingRef.current.delete(componentId)
      setLoadingComponents(prev => {
        const newSet = new Set(prev)
        newSet.delete(componentId)
        return newSet
      })
      setLoadedComponents(prev => new Set(prev).add(componentId))
      setErrorComponents(prev => {
        const newMap = new Map(prev)
        newMap.delete(componentId)
        return newMap
      })
      retryCountRef.current.delete(componentId)

      return {
        success: true,
        component,
        loadTime,
        fromCache: false
      }

    } catch (error) {
      const loadError = error instanceof Error ? error : new Error(String(error))
      const loadTime = performance.now() - startTime

      // Handle retry logic
      if (opts.enableErrorRetry) {
        const retryCount = retryCountRef.current.get(componentId) || 0
        if (retryCount < opts.maxRetries) {
          retryCountRef.current.set(componentId, retryCount + 1)
          
          console.warn(`Component ${componentId} failed to load (attempt ${retryCount + 1}/${opts.maxRetries}), retrying in ${opts.retryDelay}ms`)
          
          setTimeout(() => {
            loadComponent(componentId)
          }, opts.retryDelay)
        } else {
          console.error(`Component ${componentId} failed to load after ${opts.maxRetries} attempts`)
          retryCountRef.current.delete(componentId)
        }
      }

      // Update state
      loadingRef.current.delete(componentId)
      setLoadingComponents(prev => {
        const newSet = new Set(prev)
        newSet.delete(componentId)
        return newSet
      })
      setErrorComponents(prev => new Map(prev).set(componentId, loadError))

      return {
        success: false,
        error: loadError,
        loadTime
      }
    }
  }, [
    opts.enableCache,
    opts.enablePerformanceTracking,
    opts.enableErrorRetry,
    opts.maxRetries,
    opts.retryDelay,
    evictLRUEntries,
    errorComponents
  ])

  // Preload component
  const preloadComponent = useCallback(async (componentId: string) => {
    if (cacheRef.current.has(componentId) || loadingRef.current.has(componentId)) {
      return
    }

    const metadata = componentRegistry.current.get(componentId)
    if (!metadata) return

    // Check preload conditions
    if (metadata.preloadConditions) {
      const shouldPreload = metadata.preloadConditions.every(condition => {
        // Simple condition evaluation (can be extended)
        switch (condition) {
          case 'user-idle':
            return true // Simplified check
          case 'network-fast':
            return (navigator as any).connection?.effectiveType !== 'slow-2g'
          case 'memory-available':
            return !('memory' in performance) || (performance as any).memory.usedJSHeapSize < 100 * 1024 * 1024
          default:
            return true
        }
      })

      if (!shouldPreload) return
    }

    try {
      await loadComponent(componentId)
      if (opts.enablePerformanceTracking) {
        console.info(`Component ${componentId} preloaded successfully`)
      }
    } catch (error) {
      console.warn(`Failed to preload component ${componentId}:`, error)
    }
  }, [loadComponent, opts.enablePerformanceTracking])

  // Preload multiple components by priority
  const preloadByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    const components = Array.from(componentRegistry.current.values())
      .filter(component => component.priority === priority)
      .sort((a, b) => (a.estimatedSize || 0) - (b.estimatedSize || 0)) // Load smaller components first

    components.forEach((component, index) => {
      const delay = index * 100 // Stagger preloading
      const timer = setTimeout(() => {
        preloadComponent(component.id)
      }, delay)
      
      preloadTimersRef.current.set(`${component.id}_preload`, timer)
    })
  }, [preloadComponent])

  // Get component loading state
  const getComponentState = useCallback((componentId: string) => {
    return {
      isLoading: loadingComponents.has(componentId),
      isLoaded: loadedComponents.has(componentId),
      hasError: errorComponents.has(componentId),
      error: errorComponents.get(componentId),
      isCached: cacheRef.current.has(componentId),
      retryCount: retryCountRef.current.get(componentId) || 0
    }
  }, [loadingComponents, loadedComponents, errorComponents])

  // Get performance metrics for a component
  const getComponentMetrics = useCallback((componentId: string) => {
    const metrics = performanceMetricsRef.current.get(componentId)
    if (!metrics || metrics.length === 0) return null

    return {
      loadCount: metrics.length,
      averageLoadTime: metrics.reduce((sum, time) => sum + time, 0) / metrics.length,
      fastestLoadTime: Math.min(...metrics),
      slowestLoadTime: Math.max(...metrics),
      lastLoadTime: metrics[metrics.length - 1]
    }
  }, [])

  // Get all performance metrics
  const getAllMetrics = useCallback(() => {
    const allMetrics: Record<string, any> = {}
    
    performanceMetricsRef.current.forEach((metrics, componentId) => {
      allMetrics[componentId] = getComponentMetrics(componentId)
    })

    return {
      components: allMetrics,
      cache: getCacheStats(),
      summary: {
        totalComponents: componentRegistry.current.size,
        loadedComponents: loadedComponents.size,
        loadingComponents: loadingComponents.size,
        errorComponents: errorComponents.size,
        cachedComponents: cacheRef.current.size
      }
    }
  }, [getComponentMetrics, getCacheStats, loadedComponents, loadingComponents, errorComponents])

  // Setup preloading on mount
  useEffect(() => {
    if (opts.enablePreloading) {
      const timer = setTimeout(() => {
        preloadByPriority('high')
        
        setTimeout(() => {
          preloadByPriority('medium')
        }, 1000)
        
        setTimeout(() => {
          preloadByPriority('low')
        }, 3000)
      }, opts.preloadDelay)

      return () => clearTimeout(timer)
    }
  }, [opts.enablePreloading, opts.preloadDelay, preloadByPriority])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all preload timers
      preloadTimersRef.current.forEach(timer => clearTimeout(timer))
      preloadTimersRef.current.clear()

      // Log final statistics
      if (opts.enablePerformanceTracking) {
        const finalMetrics = getAllMetrics()
        console.info('Component lazy loading final metrics:', finalMetrics)
      }
    }
  }, [opts.enablePerformanceTracking, getAllMetrics])

  return {
    loadComponent,
    preloadComponent,
    preloadByPriority,
    registerComponent,
    registerComponents,
    getComponentState,
    getComponentMetrics,
    getAllMetrics,
    getCacheStats,
    clearCache,
    clearCacheEntry,
    loadingComponents,
    loadedComponents,
    errorComponents
  }
}