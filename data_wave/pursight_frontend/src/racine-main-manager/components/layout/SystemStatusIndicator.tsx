"use client"

import type React from "react"
import { useReducedMotion } from "framer-motion"

interface SystemStatusIndicatorProps {
  hookOrchestrator: any
  lazyHooksEnabled: boolean
  performanceMode: string
}

export const SystemStatusIndicator: React.FC<SystemStatusIndicatorProps> = ({
  hookOrchestrator,
  lazyHooksEnabled,
  performanceMode,
}) => {
  const reducedMotion = useReducedMotion()

  return (
    <div className="fixed top-4 left-4 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50 text-xs">
      <div className="space-y-1">
        <div>Critical Hooks: {hookOrchestrator.criticalHooksLoaded ? "✅" : "⏳"}</div>
        <div>Lazy Hooks: {lazyHooksEnabled ? "✅" : "⏳"}</div>
        <div>Ready: {hookOrchestrator.isReady ? "✅" : "⏳"}</div>
        <div>Performance: {performanceMode}</div>
        <div>Reduced Motion: {reducedMotion ? "✅" : "❌"}</div>
        {Object.keys(hookOrchestrator.errors).length > 0 && (
          <div className="text-red-500">Errors: {Object.keys(hookOrchestrator.errors).length}</div>
        )}
      </div>
    </div>
  )
}
