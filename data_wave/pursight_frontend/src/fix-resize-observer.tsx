"use client"

import { useEffect, useRef, useCallback } from "react"

// This component suppresses the ResizeObserver loop error without causing re-renders
export function FixResizeObserver() {
  const isInitialized = useRef(false)
  const originalError = useRef<typeof console.error | null>(null)
  const originalWarn = useRef<typeof console.warn | null>(null)

  const suppressResizeObserverErrors = useCallback(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    // Store original console methods
    originalError.current = console.error
    originalWarn.current = console.warn

    // Override console.error
    console.error = (...args: any[]) => {
      const message = args[0]
      if (typeof message === 'string' && 
          (message.includes('ResizeObserver loop completed with undelivered notifications') ||
           message.includes('ResizeObserver loop limit exceeded'))) {
        return // Suppress the error
      }
      // Call original method
      if (originalError.current) {
        originalError.current.apply(console, args)
      }
    }

    // Override console.warn
    console.warn = (...args: any[]) => {
      const message = args[0]
      if (typeof message === 'string' && 
          message.includes('ResizeObserver loop limit exceeded')) {
        return // Suppress the warning
      }
      // Call original method
      if (originalWarn.current) {
        originalWarn.current.apply(console, args)
      }
    }

    // Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message && typeof event.message === 'string' && 
          event.message.includes('ResizeObserver loop')) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return false
      }
      return true
    }

    // Global unhandled promise rejection handler
    const handleGlobalRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason.message === 'string' && 
          event.reason.message.includes('ResizeObserver loop')) {
        event.preventDefault()
        return false
      }
      return true
    }

    // Add event listeners
    window.addEventListener('error', handleGlobalError, { capture: true })
    window.addEventListener('unhandledrejection', handleGlobalRejection, { capture: true })

    // Store cleanup function
    const cleanup = () => {
      // Restore original console methods
      if (originalError.current) {
        console.error = originalError.current
      }
      if (originalWarn.current) {
        console.warn = originalWarn.current
      }

      // Remove event listeners
      window.removeEventListener('error', handleGlobalError, { capture: true })
      window.removeEventListener('unhandledrejection', handleGlobalRejection, { capture: true })
      
      // Reset initialization flag
      isInitialized.current = false
    }

    // Store cleanup function for later use
    ;(window as any).__resizeObserverCleanup = cleanup
  }, [])

  useEffect(() => {
    suppressResizeObserverErrors()
    
    // Cleanup on unmount
    return () => {
      if ((window as any).__resizeObserverCleanup) {
        ;(window as any).__resizeObserverCleanup()
      }
    }
  }, [suppressResizeObserverErrors])

  return null
}

export default FixResizeObserver
