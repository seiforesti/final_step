"use client"

import { useSchemaDiscovery } from '../contexts/schema-discovery-context'

export interface ProgressTracker {
  start: () => void
  update: (progress: number) => void
  complete: () => void
  error: (error: string) => void
  stop: () => void
}

export function useSchemaDiscoveryProgress(component: 'temp' | 'enterprise'): ProgressTracker {
  const { state, startDiscovery, updateProgress, setError, setCompleted, stopDiscovery, isComponentBlocked } = useSchemaDiscovery()

  const start = () => {
    if (isComponentBlocked(component)) {
      throw new Error(`Cannot start ${component} discovery: Another component is already running`)
    }
    return startDiscovery(component)
  }

  const update = (progress: number) => {
    if (state.activeComponent === component) {
      updateProgress(progress)
    }
  }

  const complete = () => {
    if (state.activeComponent === component) {
      setCompleted()
    }
  }

  const error = (error: string) => {
    if (state.activeComponent === component) {
      setError(error)
    }
  }

  const stop = () => {
    if (state.activeComponent === component) {
      stopDiscovery()
    }
  }

  return {
    start,
    update,
    complete,
    error,
    stop
  }
}

export function getProgressStatus(state: any, component: 'temp' | 'enterprise') {
  const isActive = state.activeComponent === component
  const isBlocked = state.isRunning && state.activeComponent !== component
  const isRunning = isActive && state.status === 'running'
  const isCompleted = isActive && state.status === 'completed'
  const isError = isActive && state.status === 'error'
  const isStopped = isActive && state.status === 'stopped'

  return {
    isActive,
    isBlocked,
    isRunning,
    isCompleted,
    isError,
    isStopped,
    progress: state.progress,
    error: state.error,
    canStart: !state.isRunning || isActive
  }
}
