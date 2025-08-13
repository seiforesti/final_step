"use client"

import { useCallback } from "react"

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface PageViewEvent {
  page: string
  properties?: Record<string, any>
  timestamp?: Date
}

// Mock analytics service
const mockAnalytics = {
  track: (event: AnalyticsEvent) => {
    console.log("Analytics Event:", event)
    // In real app, send to analytics service
  },

  page: (pageView: PageViewEvent) => {
    console.log("Page View:", pageView)
    // In real app, send to analytics service
  },
}

export const useAnalytics = () => {
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    mockAnalytics.track({
      event,
      properties,
      timestamp: new Date(),
    })
  }, [])

  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    mockAnalytics.page({
      page,
      properties,
      timestamp: new Date(),
    })
  }, [])

  const trackUserAction = useCallback(
    (action: string, target: string, properties?: Record<string, any>) => {
      trackEvent("user_action", {
        action,
        target,
        ...properties,
      })
    },
    [trackEvent],
  )

  const trackPerformance = useCallback(
    (metric: string, value: number, properties?: Record<string, any>) => {
      trackEvent("performance_metric", {
        metric,
        value,
        ...properties,
      })
    },
    [trackEvent],
  )

  const trackError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      trackEvent("error", {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      })
    },
    [trackEvent],
  )

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackPerformance,
    trackError,
  }
}
