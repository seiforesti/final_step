'use client'

import { useCallback, useState } from 'react'

export const useOptimizedWorkspaceManagement = () => {
  const [currentWorkspace] = useState({ id: '1', name: 'Default Workspace' })

  const getActiveWorkspace = useCallback(() => {
    return currentWorkspace
  }, [currentWorkspace])

  const getWorkspaceContext = useCallback(() => {
    return currentWorkspace
  }, [currentWorkspace])

  return {
    getActiveWorkspace,
    getWorkspaceContext
  }
}