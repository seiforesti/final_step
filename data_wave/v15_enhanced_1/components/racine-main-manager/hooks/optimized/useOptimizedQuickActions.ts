'use client'

import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { usePerformanceMonitor } from '../performance/usePerformanceMonitor'
import { useMemoryOptimization } from '../performance/useMemoryOptimization'
import { useRenderOptimization } from '../performance/useRenderOptimization'

interface QuickAction {
  id: string
  name: string
  description: string
  category: string
  component: string
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  permissions?: string[]
  lastUsed?: Date
  usageCount?: number
  favorited?: boolean
  contextual?: boolean
}

interface ExecutionResult {
  success: boolean
  executionTime: number
  error?: Error
  result?: any
}

interface QuickActionsState {
  actions: QuickAction[]
  favoriteActions: string[]
  recentActions: string[]
  contextualActions: QuickAction[]
  userPreferences: Record<string, any>
  analytics: Record<string, any>
}

interface QuickActionsOperations {
  executeAction: (actionId: string, params?: any) => Promise<ExecutionResult>
  getContextualActions: (context: any) => Promise<QuickAction[]>
  getFavoriteActions: () => Promise<QuickAction[]>
  getRecentActions: (limit?: number) => Promise<QuickAction[]>
  trackActionUsage: (actionId: string) => void
  getActionAnalytics: () => Promise<Record<string, any>>
  saveUserPreferences: (preferences: any) => Promise<void>
  saveFavoriteAction: (actionId: string) => Promise<void>
  removeFavoriteAction: (actionId: string) => Promise<void>
}

const DEFAULT_STATE: QuickActionsState = {
  actions: [],
  favoriteActions: [],
  recentActions: [],
  contextualActions: [],
  userPreferences: {},
  analytics: {}
}

export const useOptimizedQuickActions = () => {
  // Performance monitoring
  const { trackEvent, trackEventWithDuration } = usePerformanceMonitor('OptimizedQuickActions')
  const { optimizeMemory, setCache, getCache } = useMemoryOptimization({ enableMemoryLogging: false })
  const { memoizedCallback, memoizedValue, debouncedCallback } = useRenderOptimization()

  // State management
  const [state, setState] = useState<QuickActionsState>(DEFAULT_STATE)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Refs for caching and optimization
  const actionsRef = useRef<Map<string, QuickAction>>(new Map())
  const executionCacheRef = useRef<Map<string, ExecutionResult>>(new Map())
  const analyticsRef = useRef<Map<string, any>>(new Map())
  const initializationRef = useRef<Promise<void> | null>(null)

  // Initialize the hook
  const initialize = useCallback(async () => {
    if (initializationRef.current) {
      return initializationRef.current
    }

    initializationRef.current = trackEventWithDuration('quick_actions_initialization', async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load from cache first
        const cachedState = getCache('quick_actions_state')
        if (cachedState) {
          setState(cachedState)
        }

        // Load actions from API or local storage
        const actions = await loadActions()
        const favoriteActions = await loadFavoriteActions()
        const userPreferences = await loadUserPreferences()

        // Build actions map for quick lookup
        actions.forEach(action => {
          actionsRef.current.set(action.id, action)
        })

        const newState: QuickActionsState = {
          actions,
          favoriteActions,
          recentActions: [],
          contextualActions: [],
          userPreferences,
          analytics: {}
        }

        setState(newState)
        setCache('quick_actions_state', newState, 300000) // Cache for 5 minutes

        trackEvent('quick_actions_initialized', { 
          actionsCount: actions.length,
          favoritesCount: favoriteActions.length 
        })

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize quick actions')
        setError(error)
        trackEvent('quick_actions_initialization_failed', { error: error.message })
      } finally {
        setIsLoading(false)
      }
    })

    return initializationRef.current
  }, [trackEvent, trackEventWithDuration, getCache, setCache])

  // Load actions from storage/API
  const loadActions = useCallback(async (): Promise<QuickAction[]> => {
    try {
      // Try local storage first
      const stored = localStorage.getItem('quick_actions_data')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }

      // Fallback to API
      const response = await fetch('/api/quick-actions')
      if (response.ok) {
        const actions = await response.json()
        localStorage.setItem('quick_actions_data', JSON.stringify(actions))
        return actions
      }

      // Final fallback to default actions
      return getDefaultActions()
    } catch (error) {
      console.warn('Failed to load actions, using defaults:', error)
      return getDefaultActions()
    }
  }, [])

  // Load favorite actions
  const loadFavoriteActions = useCallback(async (): Promise<string[]> => {
    try {
      const stored = localStorage.getItem('quick_actions_favorites')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }, [])

  // Load user preferences
  const loadUserPreferences = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const stored = localStorage.getItem('quick_actions_preferences')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }, [])

  // Get default actions
  const getDefaultActions = useCallback((): QuickAction[] => {
    return [
      {
        id: 'data-sources-create',
        name: 'Create Data Source',
        description: 'Add a new data source connection',
        category: 'data-sources',
        component: 'QuickDataSourceCreate',
        enabled: true,
        priority: 'high',
        permissions: ['datasource:write']
      },
      {
        id: 'scan-rules-create',
        name: 'Create Scan Rule',
        description: 'Create a new scanning rule',
        category: 'scan-rules',
        component: 'QuickRuleCreate',
        enabled: true,
        priority: 'high',
        permissions: ['scanrules:write']
      },
      {
        id: 'compliance-check',
        name: 'Compliance Check',
        description: 'Run compliance validation checks',
        category: 'compliance',
        component: 'QuickComplianceCheck',
        enabled: true,
        priority: 'critical',
        permissions: ['compliance:read']
      }
    ]
  }, [])

  // Execute action with optimization
  const executeAction = memoizedCallback(async (actionId: string, params?: any): Promise<ExecutionResult> => {
    const cacheKey = `execution_${actionId}_${JSON.stringify(params || {})}`
    
    // Check cache for recent executions
    const cached = executionCacheRef.current.get(cacheKey)
    if (cached && Date.now() - (cached as any).timestamp < 30000) { // 30 second cache
      trackEvent('action_execution_cached', { actionId })
      return cached
    }

    return trackEventWithDuration('action_execution', async () => {
      try {
        const action = actionsRef.current.get(actionId)
        if (!action) {
          throw new Error(`Action ${actionId} not found`)
        }

        if (!action.enabled) {
          throw new Error(`Action ${actionId} is disabled`)
        }

        const startTime = performance.now()

        // Simulate execution (replace with actual implementation)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100))

        const executionTime = performance.now() - startTime
        const result: ExecutionResult = {
          success: true,
          executionTime,
          result: { actionId, params, timestamp: Date.now() }
        }

        // Cache result
        executionCacheRef.current.set(cacheKey, { ...result, timestamp: Date.now() })

        // Update usage tracking
        trackActionUsage(actionId)

        trackEvent('action_executed_successfully', { 
          actionId, 
          executionTime,
          category: action.category 
        })

        return result

      } catch (error) {
        const err = error instanceof Error ? error : new Error('Execution failed')
        const result: ExecutionResult = {
          success: false,
          executionTime: 0,
          error: err
        }

        trackEvent('action_execution_failed', { 
          actionId, 
          error: err.message 
        })

        return result
      }
    }, { actionId, params })
  }, [trackEvent, trackEventWithDuration])

  // Get contextual actions
  const getContextualActions = memoizedCallback(async (context: any): Promise<QuickAction[]> => {
    const cacheKey = `contextual_${JSON.stringify(context)}`
    const cached = getCache(cacheKey)
    if (cached) {
      return cached
    }

    return trackEventWithDuration('get_contextual_actions', async () => {
      try {
        // Filter actions based on context
        const actions = Array.from(actionsRef.current.values())
        const contextualActions = actions.filter(action => {
          // Simple context matching (can be enhanced)
          if (context.category && action.category === context.category) {
            return true
          }
          if (context.permissions && action.permissions) {
            return action.permissions.some(permission => 
              context.permissions.includes(permission)
            )
          }
          return action.contextual === true
        })

        // Sort by priority and usage
        contextualActions.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          }
          return (b.usageCount || 0) - (a.usageCount || 0)
        })

        setCache(cacheKey, contextualActions, 60000) // Cache for 1 minute
        return contextualActions.slice(0, 10) // Return top 10

      } catch (error) {
        console.error('Failed to get contextual actions:', error)
        return []
      }
    }, { context })
  }, [getCache, setCache, trackEventWithDuration])

  // Get favorite actions
  const getFavoriteActions = memoizedCallback(async (): Promise<QuickAction[]> => {
    const cached = getCache('favorite_actions')
    if (cached) {
      return cached
    }

    try {
      const favoriteIds = await loadFavoriteActions()
      const favoriteActions = favoriteIds
        .map(id => actionsRef.current.get(id))
        .filter(Boolean) as QuickAction[]

      setCache('favorite_actions', favoriteActions, 300000) // Cache for 5 minutes
      return favoriteActions
    } catch (error) {
      console.error('Failed to get favorite actions:', error)
      return []
    }
  }, [getCache, setCache, loadFavoriteActions])

  // Get recent actions
  const getRecentActions = memoizedCallback(async (limit: number = 10): Promise<QuickAction[]> => {
    try {
      const recentIds = JSON.parse(localStorage.getItem('quick_actions_recent') || '[]')
      const recentActions = recentIds
        .slice(0, limit)
        .map((id: string) => actionsRef.current.get(id))
        .filter(Boolean) as QuickAction[]

      return recentActions
    } catch (error) {
      console.error('Failed to get recent actions:', error)
      return []
    }
  }, [])

  // Track action usage
  const trackActionUsage = debouncedCallback((actionId: string) => {
    try {
      const action = actionsRef.current.get(actionId)
      if (action) {
        // Update action metadata
        action.lastUsed = new Date()
        action.usageCount = (action.usageCount || 0) + 1

        // Update recent actions
        const recentIds = JSON.parse(localStorage.getItem('quick_actions_recent') || '[]')
        const newRecent = [actionId, ...recentIds.filter((id: string) => id !== actionId)].slice(0, 20)
        localStorage.setItem('quick_actions_recent', JSON.stringify(newRecent))

        // Update analytics
        const analytics = analyticsRef.current.get(actionId) || { usageCount: 0, lastUsed: null }
        analytics.usageCount++
        analytics.lastUsed = new Date()
        analyticsRef.current.set(actionId, analytics)

        trackEvent('action_usage_tracked', { actionId })
      }
    } catch (error) {
      console.error('Failed to track action usage:', error)
    }
  }, 1000)

  // Get action analytics
  const getActionAnalytics = memoizedCallback(async (): Promise<Record<string, any>> => {
    const cached = getCache('action_analytics')
    if (cached) {
      return cached
    }

    try {
      const analytics: Record<string, any> = {}
      
      analyticsRef.current.forEach((data, actionId) => {
        analytics[actionId] = data
      })

      setCache('action_analytics', analytics, 300000) // Cache for 5 minutes
      return analytics
    } catch (error) {
      console.error('Failed to get action analytics:', error)
      return {}
    }
  }, [getCache, setCache])

  // Save user preferences
  const saveUserPreferences = memoizedCallback(async (preferences: any): Promise<void> => {
    try {
      localStorage.setItem('quick_actions_preferences', JSON.stringify(preferences))
      setState(prev => ({ ...prev, userPreferences: preferences }))
      setCache('quick_actions_state', null) // Invalidate state cache
      trackEvent('user_preferences_saved')
    } catch (error) {
      console.error('Failed to save user preferences:', error)
      throw error
    }
  }, [setCache, trackEvent])

  // Save favorite action
  const saveFavoriteAction = memoizedCallback(async (actionId: string): Promise<void> => {
    try {
      const favorites = await loadFavoriteActions()
      if (!favorites.includes(actionId)) {
        const newFavorites = [...favorites, actionId]
        localStorage.setItem('quick_actions_favorites', JSON.stringify(newFavorites))
        setState(prev => ({ ...prev, favoriteActions: newFavorites }))
        setCache('favorite_actions', null) // Invalidate cache
        trackEvent('favorite_action_added', { actionId })
      }
    } catch (error) {
      console.error('Failed to save favorite action:', error)
      throw error
    }
  }, [loadFavoriteActions, setCache, trackEvent])

  // Remove favorite action
  const removeFavoriteAction = memoizedCallback(async (actionId: string): Promise<void> => {
    try {
      const favorites = await loadFavoriteActions()
      const newFavorites = favorites.filter(id => id !== actionId)
      localStorage.setItem('quick_actions_favorites', JSON.stringify(newFavorites))
      setState(prev => ({ ...prev, favoriteActions: newFavorites }))
      setCache('favorite_actions', null) // Invalidate cache
      trackEvent('favorite_action_removed', { actionId })
    } catch (error) {
      console.error('Failed to remove favorite action:', error)
      throw error
    }
  }, [loadFavoriteActions, setCache, trackEvent])

  // Memoized operations object
  const operations = useMemo((): QuickActionsOperations => ({
    executeAction,
    getContextualActions,
    getFavoriteActions,
    getRecentActions,
    trackActionUsage,
    getActionAnalytics,
    saveUserPreferences,
    saveFavoriteAction,
    removeFavoriteAction
  }), [
    executeAction,
    getContextualActions,
    getFavoriteActions,
    getRecentActions,
    trackActionUsage,
    getActionAnalytics,
    saveUserPreferences,
    saveFavoriteAction,
    removeFavoriteAction
  ])

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Memory optimization on unmount
  useEffect(() => {
    return () => {
      optimizeMemory()
      executionCacheRef.current.clear()
      analyticsRef.current.clear()
    }
  }, [optimizeMemory])

  return {
    state,
    operations,
    isLoading,
    error,
    // Legacy support for existing components
    ...operations
  }
}