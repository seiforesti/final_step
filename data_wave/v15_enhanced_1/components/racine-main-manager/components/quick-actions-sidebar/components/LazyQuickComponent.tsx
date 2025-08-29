'use client'

import React from 'react'

interface LazyQuickComponentProps {
  componentId: string
  params?: Record<string, any>
  onLoaded?: (componentId: string) => void
  onError?: (componentId: string, error: Error) => void
}

// Minimal fallback loader to satisfy dynamic import requirements and keep UI responsive.
// This can be expanded to map component IDs to concrete quick components using dynamic imports.
const LazyQuickComponent: React.FC<LazyQuickComponentProps> = ({ componentId }) => {
  return (
    <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-300">
      Quick action component "{componentId}" is not registered in the lazy loader.
    </div>
  )
}

export default LazyQuickComponent


