"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface HookState<T = any> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isInitialized: boolean
}

export interface HookConfig {
  name: string
  priority: "critical" | "high" | "medium" | "low"
  lazy?: boolean
  retryCount?: number
  timeout?: number
}

export interface HookOrchestrator {
  hooks: Record<string, HookState>
  loadHook: (name: string) => Promise<void>
  isReady: boolean
  criticalHooksLoaded: boolean
  errors: Record<string, Error>
  loadingProgress: number
}

const DEFAULT_HOOK_CONFIG: Partial<HookConfig> = {
  priority: "medium",
  lazy: false,
  retryCount: 3,
  timeout: 5000,
}

export const useHookOrchestrator = (configs: HookConfig[]): HookOrchestrator => {
  const [hooks, setHooks] = useState<Record<string, HookState>>({})
  const [isReady, setIsReady] = useState(false)
  const [criticalHooksLoaded, setCriticalHooksLoaded] = useState(false)
  const [errors, setErrors] = useState<Record<string, Error>>({})
  const [loadingProgress, setLoadingProgress] = useState(0)

  const loadingRef = useRef<Set<string>>(new Set())
  const retryCountRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const initialHooks: Record<string, HookState> = {}
    configs.forEach((config) => {
      initialHooks[config.name] = {
        data: null,
        isLoading: false,
        error: null,
        isInitialized: false,
      }
    })
    setHooks(initialHooks)
  }, [configs])

  const updateHookState = useCallback(
    (name: string, updates: Partial<HookState>) => {
      setHooks((prev) => {
        const newHooks = {
          ...prev,
          [name]: { ...prev[name], ...updates },
        }

        const totalHooks = configs.length
        const initializedHooks = Object.values(newHooks).filter((hook) => hook.isInitialized).length
        setLoadingProgress(totalHooks > 0 ? (initializedHooks / totalHooks) * 100 : 0)

        return newHooks
      })
    },
    [configs.length],
  )

  const loadHook = useCallback(
    async (name: string) => {
      const config = configs.find((c) => c.name === name)
      if (!config || loadingRef.current.has(name)) return

      loadingRef.current.add(name)
      updateHookState(name, { isLoading: true, error: null })

      try {
        const timeout = config.timeout || DEFAULT_HOOK_CONFIG.timeout!
        const loadPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({ mockData: `${name}_data` })
          }, Math.random() * 1000)
        })

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Hook ${name} timed out`)), timeout)
        })

        const result = await Promise.race([loadPromise, timeoutPromise])

        updateHookState(name, {
          data: result,
          isLoading: false,
          isInitialized: true,
        })

        delete retryCountRef.current[name]
      } catch (error) {
        const currentRetries = retryCountRef.current[name] || 0
        const maxRetries = config.retryCount || DEFAULT_HOOK_CONFIG.retryCount!

        if (currentRetries < maxRetries) {
          retryCountRef.current[name] = currentRetries + 1
          setTimeout(() => loadHook(name), 1000 * (currentRetries + 1))
        } else {
          updateHookState(name, {
            isLoading: false,
            error: error as Error,
            isInitialized: true,
          })
          setErrors((prev) => ({ ...prev, [name]: error as Error }))
        }
      } finally {
        loadingRef.current.delete(name)
      }
    },
    [configs], // Removed updateHookState to prevent infinite loops
  )

  useEffect(() => {
    const loadHooksByPriority = async () => {
      const criticalHooks = configs.filter((c) => c.priority === "critical" && !c.lazy)
      await Promise.all(criticalHooks.map((config) => loadHook(config.name)))
      setCriticalHooksLoaded(true)

      const highPriorityHooks = configs.filter((c) => c.priority === "high" && !c.lazy)
      await Promise.all(highPriorityHooks.map((config) => loadHook(config.name)))

      setTimeout(() => {
        const mediumPriorityHooks = configs.filter((c) => c.priority === "medium" && !c.lazy)
        mediumPriorityHooks.forEach((config) => loadHook(config.name))
      }, 500)

      setTimeout(() => {
        const lowPriorityHooks = configs.filter((c) => c.priority === "low" && !c.lazy)
        lowPriorityHooks.forEach((config) => loadHook(config.name))
      }, 2000)

      setIsReady(true)
    }

    if (configs.length > 0) {
      loadHooksByPriority()
    }
  }, [configs]) // Removed loadHook from dependencies to prevent infinite loops

  return {
    hooks,
    loadHook,
    isReady,
    criticalHooksLoaded,
    errors,
    loadingProgress,
  }
}

export default useHookOrchestrator
