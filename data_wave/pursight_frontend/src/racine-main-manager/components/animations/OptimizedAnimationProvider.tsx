"use client"

import React, { createContext, useContext, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { useAnimationPerformance } from "../../hooks/useOptimizedAnimations"

interface AnimationContextType {
  performanceMode: "standard" | "high" | "ultra"
  setPerformanceMode: (mode: "standard" | "high" | "ultra") => void
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
  mouseTrackingEnabled: boolean
  setMouseTrackingEnabled: (enabled: boolean) => void
  performanceMetrics: {
    fps: number
    frameDrops: number
    averageFrameTime: number
    isPerformant: boolean
  }
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export const useAnimationContext = () => {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error("useAnimationContext must be used within AnimationProvider")
  }
  return context
}

interface AnimationProviderProps {
  children: React.ReactNode
  defaultPerformanceMode?: "standard" | "high" | "ultra"
}

export const OptimizedAnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  defaultPerformanceMode = "standard",
}) => {
  const reducedMotion = useReducedMotion()
  const performanceMetrics = useAnimationPerformance()

  const [performanceMode, setPerformanceMode] = useState<"standard" | "high" | "ultra">(defaultPerformanceMode)
  const [animationsEnabled, setAnimationsEnabled] = useState(!reducedMotion)
  const [mouseTrackingEnabled, setMouseTrackingEnabled] = useState(true)

  React.useEffect(() => {
    if (!performanceMetrics.isPerformant && performanceMode === "ultra") {
      console.log("[v0] Performance degraded, switching to high mode")
      setPerformanceMode("high")
    } else if (!performanceMetrics.isPerformant && performanceMode === "high") {
      console.log("[v0] Performance degraded, switching to standard mode")
      setPerformanceMode("standard")
    }
  }, [performanceMetrics.isPerformant, performanceMode])

  React.useEffect(() => {
    if (reducedMotion) {
      setAnimationsEnabled(false)
      setMouseTrackingEnabled(false)
    }
  }, [reducedMotion])

  const contextValue: AnimationContextType = {
    performanceMode,
    setPerformanceMode,
    animationsEnabled,
    setAnimationsEnabled,
    mouseTrackingEnabled,
    setMouseTrackingEnabled,
    performanceMetrics,
  }

  return <AnimationContext.Provider value={contextValue}>{children}</AnimationContext.Provider>
}

export default OptimizedAnimationProvider
