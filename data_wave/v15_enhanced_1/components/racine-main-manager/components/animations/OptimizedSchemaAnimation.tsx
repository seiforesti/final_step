"use client"

import React from "react"
import { motion } from "framer-motion"
import { useOptimizedAnimations, useOptimizedMouseTracking } from "../../hooks/useOptimizedAnimations"
import { useAnimationContext } from "./OptimizedAnimationProvider"

interface OptimizedSchemaAnimationProps {
  children: React.ReactNode
  className?: string
}

export const OptimizedSchemaAnimation: React.FC<OptimizedSchemaAnimationProps> = ({ children, className = "" }) => {
  const { performanceMode, animationsEnabled, mouseTrackingEnabled } = useAnimationContext()

  const animationConfig = {
    enabled: animationsEnabled,
    performanceMode,
    respectReducedMotion: true,
    throttleMs: performanceMode === "ultra" ? 8 : performanceMode === "high" ? 16 : 32,
  }

  const mouseConfig = {
    enabled: mouseTrackingEnabled && performanceMode !== "standard",
    throttleMs: performanceMode === "ultra" ? 8 : 16,
    sensitivity: performanceMode === "ultra" ? 1.2 : 1.0,
  }

  const { animationRef, schemaAnimation, shouldAnimate, isInView } = useOptimizedAnimations(animationConfig)

  const { containerRef, mousePosition, mouseX, mouseY, isTracking } = useOptimizedMouseTracking(mouseConfig)

  const combinedRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (animationRef.current !== node) {
        // @ts-ignore
        animationRef.current = node
      }
      if (containerRef.current !== node) {
        containerRef.current = node
      }
    },
    [animationRef, containerRef],
  )

  return (
    <motion.div
      ref={combinedRef}
      className={`relative ${className}`}
      animate={schemaAnimation}
      style={{
        ...(isTracking &&
          mouseTrackingEnabled && {
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          }),
      }}
    >
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 right-2 z-10 text-xs bg-black/50 text-white px-2 py-1 rounded">
          <div>Animate: {shouldAnimate ? "✅" : "❌"}</div>
          <div>InView: {isInView ? "✅" : "❌"}</div>
          <div>Tracking: {isTracking ? "✅" : "❌"}</div>
          <div>Mode: {performanceMode}</div>
        </div>
      )}

      {isTracking && mouseTrackingEnabled && performanceMode === "ultra" && (
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{
            left: mouseX,
            top: mouseY,
            width: 100,
            height: 100,
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      )}

      {children}
    </motion.div>
  )
}

export default OptimizedSchemaAnimation
