"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

interface SchemaDiscoveryState {
  isRunning: boolean
  activeComponent: 'temp' | 'enterprise' | null
  progress: number
  status: 'idle' | 'running' | 'completed' | 'error' | 'stopped'
  error?: string
  startTime?: number
  endTime?: number
}

interface SchemaDiscoveryContextType {
  state: SchemaDiscoveryState
  startDiscovery: (component: 'temp' | 'enterprise') => boolean
  stopDiscovery: () => void
  updateProgress: (progress: number) => void
  setError: (error: string) => void
  setCompleted: () => void
  reset: () => void
  isComponentBlocked: (component: 'temp' | 'enterprise') => boolean
}

const SchemaDiscoveryContext = createContext<SchemaDiscoveryContextType | undefined>(undefined)

export function SchemaDiscoveryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SchemaDiscoveryState>({
    isRunning: false,
    activeComponent: null,
    progress: 0,
    status: 'idle'
  })

  const timeoutRef = useRef<NodeJS.Timeout>()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startDiscovery = useCallback((component: 'temp' | 'enterprise'): boolean => {
    setState(prev => {
      // If already running, only allow if it's the same component
      if (prev.isRunning && prev.activeComponent !== component) {
        console.warn(`Schema discovery already running with ${prev.activeComponent}. Cannot start ${component}.`)
        return prev
      }

      // If already running with same component, allow restart
      if (prev.isRunning && prev.activeComponent === component) {
        console.log(`Restarting schema discovery for ${component}`)
        return {
          ...prev,
          progress: 0,
          status: 'running',
          startTime: Date.now(),
          error: undefined
        }
      }

      // Start new discovery
      console.log(`Starting schema discovery with ${component}`)
      return {
        isRunning: true,
        activeComponent: component,
        progress: 0,
        status: 'running',
        startTime: Date.now(),
        error: undefined
      }
    })
    return true
  }, [])

  const stopDiscovery = useCallback(() => {
    setState(prev => {
      if (!prev.isRunning) return prev

      console.log(`Stopping schema discovery for ${prev.activeComponent}`)
      return {
        ...prev,
        isRunning: false,
        status: 'stopped',
        endTime: Date.now()
      }
    })
  }, [])

  const updateProgress = useCallback((progress: number) => {
    setState(prev => {
      if (!prev.isRunning) return prev
      return {
        ...prev,
        progress: Math.min(100, Math.max(0, progress))
      }
    })
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      status: 'error',
      error,
      isRunning: false,
      endTime: Date.now()
    }))
  }, [])

  const setCompleted = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'completed',
      progress: 100,
      isRunning: false,
      endTime: Date.now()
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      activeComponent: null,
      progress: 0,
      status: 'idle'
    })
  }, [])

  const isComponentBlocked = useCallback((component: 'temp' | 'enterprise'): boolean => {
    return state.isRunning && state.activeComponent !== component
  }, [state.isRunning, state.activeComponent])

  const value: SchemaDiscoveryContextType = {
    state,
    startDiscovery,
    stopDiscovery,
    updateProgress,
    setError,
    setCompleted,
    reset,
    isComponentBlocked
  }

  return (
    <SchemaDiscoveryContext.Provider value={value}>
      {children}
    </SchemaDiscoveryContext.Provider>
  )
}

export function useSchemaDiscovery() {
  const context = useContext(SchemaDiscoveryContext)
  if (context === undefined) {
    console.error('useSchemaDiscovery must be used within a SchemaDiscoveryProvider')
    // Return a default context to prevent crashes during development
    return {
      state: {
        isRunning: false,
        activeComponent: null,
        progress: 0,
        status: 'idle' as const
      },
      startDiscovery: () => false,
      stopDiscovery: () => {},
      updateProgress: () => {},
      setError: () => {},
      setCompleted: () => {},
      reset: () => {},
      isComponentBlocked: () => false
    }
  }
  return context
}
