import { useCallback, useRef, useEffect } from 'react'

interface PerformanceMetrics {
  renderCount: number
  renderTime: number
  lastRenderTime: number
  averageRenderTime: number
  slowRenders: number
  memoryUsage?: number
  componentName: string
}

interface PerformanceEvent {
  name: string
  duration?: number
  timestamp: number
  metadata?: Record<string, any>
}

const SLOW_RENDER_THRESHOLD = 16 // 16ms for 60fps
const MAX_RENDER_HISTORY = 100

export function usePerformanceMonitor(componentName: string) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    renderTime: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0,
    componentName
  })

  const renderTimesRef = useRef<number[]>([])
  const eventsRef = useRef<PerformanceEvent[]>([])
  const startTimeRef = useRef<number>(0)

  // Track render start
  const trackRenderStart = useCallback(() => {
    startTimeRef.current = performance.now()
  }, [])

  // Track render completion
  const trackRender = useCallback(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTimeRef.current
    
    const metrics = metricsRef.current
    metrics.renderCount++
    metrics.lastRenderTime = renderTime
    metrics.renderTime += renderTime

    // Track render times for average calculation
    renderTimesRef.current.push(renderTime)
    if (renderTimesRef.current.length > MAX_RENDER_HISTORY) {
      renderTimesRef.current.shift()
    }

    // Calculate average
    metrics.averageRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length

    // Track slow renders
    if (renderTime > SLOW_RENDER_THRESHOLD) {
      metrics.slowRenders++
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }

    // Track memory usage if available
    if ('memory' in performance) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize
    }

    // Log performance warning if needed
    if (metrics.slowRenders > 5 && metrics.slowRenders % 5 === 0) {
      console.warn(`Component ${componentName} has ${metrics.slowRenders} slow renders. Average: ${metrics.averageRenderTime.toFixed(2)}ms`)
    }
  }, [componentName])

  // Track custom events
  const trackEvent = useCallback((name: string, metadata?: Record<string, any>) => {
    const event: PerformanceEvent = {
      name,
      timestamp: performance.now(),
      metadata
    }

    eventsRef.current.push(event)
    
    // Keep only recent events
    if (eventsRef.current.length > MAX_RENDER_HISTORY) {
      eventsRef.current.shift()
    }
  }, [])

  // Track event with duration
  const trackEventWithDuration = useCallback((name: string, fn: () => void | Promise<void>, metadata?: Record<string, any>) => {
    const startTime = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime
        trackEvent(name, { ...metadata, duration })
      })
    } else {
      const duration = performance.now() - startTime
      trackEvent(name, { ...metadata, duration })
      return result
    }
  }, [trackEvent])

  // Get current metrics
  const getMetrics = (): PerformanceMetrics => {
    return { ...metricsRef.current }
  }

  // Get recent events
  const getEvents = (): PerformanceEvent[] => {
    return [...eventsRef.current]
  }

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      renderTime: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      slowRenders: 0,
      componentName
    }
    renderTimesRef.current = []
    eventsRef.current = []
  }, [componentName])

  // Auto-track renders
  useEffect(() => {
    trackRenderStart()
    return () => {
      trackRender()
    }
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const metrics = getMetrics()
      if (metrics.renderCount > 0) {
        console.info(`Performance summary for ${componentName}:`, {
          totalRenders: metrics.renderCount,
          averageRenderTime: metrics.averageRenderTime.toFixed(2) + 'ms',
          slowRenders: metrics.slowRenders,
          slowRenderPercentage: ((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1) + '%'
        })
      }
    }
  }, [componentName])

  return {
    trackRender,
    trackRenderStart,
    trackEvent,
    trackEventWithDuration,
    getMetrics,
    getEvents,
    resetMetrics
  }
}