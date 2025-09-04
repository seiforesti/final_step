"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useAnimation, useMotionValue, useReducedMotion, useInView } from "framer-motion"

export interface AnimationConfig {
  enabled: boolean
  performanceMode: "standard" | "high" | "ultra"
  respectReducedMotion: boolean
  throttleMs: number
}

export interface MouseTrackingConfig {
  enabled: boolean
  throttleMs: number
  bounds?: DOMRect
  sensitivity: number
}

export const useOptimizedAnimations = (config: AnimationConfig) => {
  const reducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(true)
  const animationRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(animationRef, { once: false, margin: "100px" })

  const shouldAnimate = useMemo(() => {
    if (config.respectReducedMotion && reducedMotion) return false
    if (!config.enabled) return false
    if (!isVisible || !isInView) return false
    return true
  }, [config.enabled, config.respectReducedMotion, reducedMotion, isVisible, isInView])

  const schemaAnimation = useAnimation()
  const pulseAnimation = useAnimation()
  const containerAnimation = useAnimation()

  const startSchemaAnimation = useCallback(async () => {
    if (!shouldAnimate) return

    const duration = config.performanceMode === "ultra" ? 60 : config.performanceMode === "high" ? 120 : 240

    await schemaAnimation.start({
      rotate: 360,
      transition: {
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
        repeatType: "loop",
      },
    })
  }, [schemaAnimation, shouldAnimate, config.performanceMode])

  const startPulseAnimation = useCallback(async () => {
    if (!shouldAnimate) return

    await pulseAnimation.start({
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        repeatType: "reverse",
      },
    })
  }, [pulseAnimation, shouldAnimate])

  const stopAllAnimations = useCallback(() => {
    schemaAnimation.stop()
    pulseAnimation.stop()
    containerAnimation.stop()
  }, [schemaAnimation, pulseAnimation, containerAnimation])

  useEffect(() => {
    if (shouldAnimate) {
      startSchemaAnimation()
      startPulseAnimation()
    } else {
      stopAllAnimations()
    }

    return () => stopAllAnimations()
  }, [shouldAnimate, startSchemaAnimation, startPulseAnimation, stopAllAnimations])

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  return {
    animationRef,
    schemaAnimation,
    pulseAnimation,
    containerAnimation,
    shouldAnimate,
    isInView,
    startSchemaAnimation,
    startPulseAnimation,
    stopAllAnimations,
  }
}

export const useOptimizedMouseTracking = (config: MouseTrackingConfig) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isTracking, setIsTracking] = useState(false)
  const lastUpdateRef = useRef<number>(0)
  const rafIdRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!config.enabled || !isTracking) return

      const now = performance.now()
      if (now - lastUpdateRef.current < config.throttleMs) return

      lastUpdateRef.current = now

      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()

      // Cancel previous RAF if still pending
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const clientX = e.clientX
        const clientY = e.clientY

        // Bounds checking
        if (config.bounds) {
          if (
            clientX < config.bounds.left ||
            clientX > config.bounds.right ||
            clientY < config.bounds.top ||
            clientY > config.bounds.bottom
          ) {
            return
          }
        }

        const x = (clientX - rect.left) / rect.width
        const y = (clientY - rect.top) / rect.height

        // Apply sensitivity
        const sensitiveX = x * config.sensitivity
        const sensitiveY = y * config.sensitivity

        setMousePosition({ x: sensitiveX * 100, y: sensitiveY * 100 })
        mouseX.set(clientX - rect.left)
        mouseY.set(clientY - rect.top)

        rafIdRef.current = null
      })
    },
    [config.enabled, config.throttleMs, config.bounds, config.sensitivity, isTracking, mouseX, mouseY],
  )

  useEffect(() => {
    if (!config.enabled) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTracking(entry.isIntersecting)
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [config.enabled])

  useEffect(() => {
    if (!config.enabled || !isTracking) return

    const container = containerRef.current
    if (!container) return

    container.addEventListener("mousemove", handleMouseMove, { passive: true })
    container.addEventListener("mouseenter", () => setIsTracking(true), { passive: true })
    container.addEventListener("mouseleave", () => setIsTracking(false), { passive: true })

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseenter", () => setIsTracking(true))
      container.removeEventListener("mouseleave", () => setIsTracking(false))

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [config.enabled, isTracking, handleMouseMove])

  return {
    containerRef,
    mousePosition,
    mouseX,
    mouseY,
    isTracking,
  }
}

export const useAnimationPerformance = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameDrops: 0,
    averageFrameTime: 16.67,
    isPerformant: true,
  })

  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const frameTimesRef = useRef<number[]>([])

  useEffect(() => {
    let rafId: number

    const measurePerformance = () => {
      const now = performance.now()
      const deltaTime = now - lastTimeRef.current

      frameCountRef.current++
      frameTimesRef.current.push(deltaTime)

      // Keep only last 60 frame times
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift()
      }

      // Update metrics every 60 frames
      if (frameCountRef.current % 60 === 0) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
        const fps = 1000 / avgFrameTime
        const frameDrops = frameTimesRef.current.filter((time) => time > 20).length
        const isPerformant = fps > 50 && frameDrops < 5

        setMetrics({
          fps: Math.round(fps),
          frameDrops,
          averageFrameTime: Math.round(avgFrameTime * 100) / 100,
          isPerformant,
        })
      }

      lastTimeRef.current = now
      rafId = requestAnimationFrame(measurePerformance)
    }

    rafId = requestAnimationFrame(measurePerformance)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return metrics
}

export default useOptimizedAnimations
