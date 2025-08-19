"use client"

import { useEffect } from "react"

// This component aggressively suppresses the ResizeObserver loop error.
// It should be rendered once at the root of your application layout.
export function FixResizeObserver() {
  useEffect(() => {
    const originalError = console.error
    const originalWarn = console.warn

    // Suppress specific console errors/warnings
    console.error = (...args: any[]) => {
      if (
        args[0] &&
        typeof args[0] === "string" &&
        args[0].includes("ResizeObserver loop completed with undelivered notifications")
      ) {
        return // Suppress the error
      }
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      if (args[0] && typeof args[0] === "string" && args[0].includes("ResizeObserver loop limit exceeded")) {
        return // Suppress the warning
      }
      originalWarn.apply(console, args)
    }

    // Global error handler for unhandled exceptions
    const globalErrorHandler = (event: ErrorEvent) => {
      if (event.message && typeof event.message === "string" && event.message.includes("ResizeObserver loop")) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return false
      }
      return true
    }

    // Global unhandled promise rejection handler
    const globalRejectionHandler = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        typeof event.reason.message === "string" &&
        event.reason.message.includes("ResizeObserver loop")
      ) {
        event.preventDefault()
        return false
      }
      return true
    }

    window.addEventListener("error", globalErrorHandler, { capture: true })
    window.addEventListener("unhandledrejection", globalRejectionHandler, { capture: true })

    // Fallback for older browsers or different error types
    const oldOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === "string" && message.includes("ResizeObserver loop")) {
        return true // Suppress the error
      }
      if (oldOnError) {
        return oldOnError(message, source, lineno, colno, error)
      }
      return false
    }

    return () => {
      // Restore original console methods on unmount
      console.error = originalError
      console.warn = originalWarn

      // Remove event listeners
      window.removeEventListener("error", globalErrorHandler, { capture: true })
      window.removeEventListener("unhandledrejection", globalRejectionHandler, { capture: true })
      window.onerror = oldOnError // Restore original onerror
    }
  }, [])

  return null // This component doesn't render anything visible
}

// Named export for consistency, though default is also provided
export default FixResizeObserver
