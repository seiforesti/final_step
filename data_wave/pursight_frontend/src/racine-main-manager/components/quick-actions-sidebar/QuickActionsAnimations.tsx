'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useAnimation, Variants, Transition, LayoutGroup } from 'framer-motion'
import { cn } from '@/lib copie/utils'

// Advanced animation presets and configurations
const ANIMATION_PRESETS = {
  smooth: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
    type: 'tween' as const
  },
  bouncy: {
    duration: 0.6,
    ease: [0.68, -0.55, 0.265, 1.55],
    type: 'tween' as const
  },
  spring: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 300,
    mass: 0.8
  },
  gentle: {
    duration: 0.4,
    ease: [0.25, 0.46, 0.45, 0.94],
    type: 'tween' as const
  },
  energetic: {
    duration: 0.2,
    ease: [0.25, 0.46, 0.45, 0.94],
    type: 'tween' as const
  },
  elegant: {
    duration: 0.8,
    ease: [0.23, 1, 0.32, 1],
    type: 'tween' as const
  }
} as const

// Sophisticated animation variants
const ANIMATION_VARIANTS: Record<string, Variants> = {
  // Sidebar animations
  sidebarSlide: {
    closed: { 
      x: '100%', 
      opacity: 0,
      scale: 0.95,
      filter: 'blur(4px)'
    },
    open: { 
      x: 0, 
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    }
  },
  
  // Component entrance animations
  componentFadeInUp: {
    hidden: { 
      y: 30, 
      opacity: 0,
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      rotateX: 0
    }
  },
  
  // Staggered grid animations
  staggeredGrid: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  // Card hover animations
  cardHover: {
    rest: { 
      scale: 1,
      y: 0,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      borderColor: 'rgb(229 231 235)'
    },
    hover: { 
      scale: 1.02,
      y: -4,
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
      borderColor: 'rgb(99 102 241)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: { 
      scale: 0.98,
      y: 0,
      transition: {
        duration: 0.1
      }
    }
  },
  
  // Loading animations
  loadingPulse: {
    hidden: { opacity: 0.5, scale: 0.95 },
    visible: {
      opacity: [0.5, 1, 0.5],
      scale: [0.95, 1, 0.95],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Success/Error feedback animations
  feedback: {
    success: {
      scale: [1, 1.1, 1],
      backgroundColor: ['#f3f4f6', '#10b981', '#f3f4f6'],
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    },
    error: {
      x: [0, -10, 10, -10, 10, 0],
      backgroundColor: ['#f3f4f6', '#ef4444', '#f3f4f6'],
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    }
  },
  
  // Notification animations
  notification: {
    initial: { 
      x: 300, 
      opacity: 0,
      scale: 0.8
    },
    animate: { 
      x: 0, 
      opacity: 1,
      scale: 1
    },
    exit: { 
      x: 300, 
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  },
  
  // Search results animations
  searchResults: {
    hidden: {
      opacity: 0,
      height: 0,
      overflow: 'hidden'
    },
    visible: {
      opacity: 1,
      height: 'auto',
      overflow: 'visible',
      transition: {
        height: {
          duration: 0.3,
          ease: 'easeOut'
        },
        opacity: {
          duration: 0.2,
          delay: 0.1
        }
      }
    }
  },
  
  // Modal animations
  modal: {
    hidden: {
      opacity: 0,
      scale: 0.75,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      scale: 0.75,
      y: 50
    }
  },
  
  // Progress bar animations
  progressBar: {
    initial: { 
      scaleX: 0,
      transformOrigin: 'left'
    },
    animate: { 
      scaleX: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  },
  
  // Button ripple effect
  buttonRipple: {
    initial: { 
      scale: 0,
      opacity: 0.7
    },
    animate: { 
      scale: 1,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }
}

// Advanced micro-interaction animations
const MICRO_INTERACTIONS = {
  buttonPress: {
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },
  iconSpin: {
    animate: { 
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity
      }
    }
  },
  iconBounce: {
    animate: { 
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  },
  iconPulse: {
    animate: { 
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  },
  textGlow: {
    animate: {
      textShadow: [
        '0 0 0px rgba(99, 102, 241, 0)',
        '0 0 10px rgba(99, 102, 241, 0.5)',
        '0 0 0px rgba(99, 102, 241, 0)'
      ],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  }
}

// Performance optimization settings
const PERFORMANCE_CONFIG = {
  enableReducedMotion: false,
  enableGPUAcceleration: true,
  maxConcurrentAnimations: 50,
  animationBudget: 16.67, // 60fps budget in ms
  priorityThresholds: {
    critical: 1,
    high: 5,
    medium: 10,
    low: 20
  }
}

interface AnimationContextType {
  preset: keyof typeof ANIMATION_PRESETS
  isReducedMotion: boolean
  performanceMode: 'auto' | 'performance' | 'quality'
  enableInteractions: boolean
  animationQueue: Array<{
    id: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    animation: () => Promise<void>
  }>
}

const AnimationContext = React.createContext<AnimationContextType>({
  preset: 'smooth',
  isReducedMotion: false,
  performanceMode: 'auto',
  enableInteractions: true,
  animationQueue: []
})

interface QuickActionsAnimationsProps {
  preset?: keyof typeof ANIMATION_PRESETS
  performanceMode?: 'auto' | 'performance' | 'quality'
  enableInteractions?: boolean
  enableAnalytics?: boolean
  className?: string
  children?: React.ReactNode
}

export const QuickActionsAnimations: React.FC<QuickActionsAnimationsProps> = ({
  preset = 'smooth',
  performanceMode = 'auto',
  enableInteractions = true,
  enableAnalytics = false,
  className,
  children
}) => {
  // Animation state management
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [animationQueue, setAnimationQueue] = useState<AnimationContextType['animationQueue']>([])
  const [performanceMetrics, setPerformanceMetrics] = useState({
    frameRate: 60,
    droppedFrames: 0,
    animationCount: 0,
    totalDuration: 0
  })
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set())

  // Performance monitoring refs
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const animationStartTimeRef = useRef<Record<string, number>>({})
  const performanceObserverRef = useRef<PerformanceObserver>()

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = () => setIsReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Initialize performance monitoring
  useEffect(() => {
    if (!enableAnalytics) return

    // Setup performance observer for animation metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name.includes('animation-')) {
            const animationId = entry.name.replace('animation-', '')
            const duration = entry.duration
            
            setPerformanceMetrics(prev => ({
              ...prev,
              totalDuration: prev.totalDuration + duration,
              animationCount: prev.animationCount + 1
            }))
          }
        })
      })

      observer.observe({ entryTypes: ['measure'] })
      performanceObserverRef.current = observer
    }

    // Monitor frame rate
    const monitorFrameRate = () => {
      const now = performance.now()
      const delta = now - lastTimeRef.current
      
      if (delta >= 1000) { // Update every second
        const fps = Math.round((frameCountRef.current * 1000) / delta)
        setPerformanceMetrics(prev => ({
          ...prev,
          frameRate: fps,
          droppedFrames: prev.droppedFrames + Math.max(0, 60 - fps)
        }))
        
        frameCountRef.current = 0
        lastTimeRef.current = now
      } else {
        frameCountRef.current++
      }
      
      requestAnimationFrame(monitorFrameRate)
    }

    requestAnimationFrame(monitorFrameRate)

    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect()
      }
    }
  }, [enableAnalytics])

  // Animation queue processor
  useEffect(() => {
    const processQueue = async () => {
      if (animationQueue.length === 0) return

      // Sort by priority
      const sortedQueue = [...animationQueue].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })

      // Process animations based on performance budget
      const maxConcurrent = performanceMode === 'performance' ? 10 : 
                           performanceMode === 'quality' ? 50 : 25

      const toProcess = sortedQueue.slice(0, maxConcurrent)
      const remaining = sortedQueue.slice(maxConcurrent)

      setAnimationQueue(remaining)

      // Execute animations
      await Promise.all(toProcess.map(async (item) => {
        try {
          const startTime = performance.now()
          animationStartTimeRef.current[item.id] = startTime

          setActiveAnimations(prev => new Set(prev).add(item.id))
          
          await item.animation()
          
          if (enableAnalytics) {
            const endTime = performance.now()
            performance.measure(`animation-${item.id}`, { start: startTime, end: endTime })
          }
        } catch (error) {
          console.error(`Animation ${item.id} failed:`, error)
        } finally {
          setActiveAnimations(prev => {
            const newSet = new Set(prev)
            newSet.delete(item.id)
            return newSet
          })
          delete animationStartTimeRef.current[item.id]
        }
      }))
    }

    processQueue()
  }, [animationQueue, performanceMode, enableAnalytics])

  // Context value
  const contextValue = useMemo(() => ({
    preset,
    isReducedMotion,
    performanceMode,
    enableInteractions,
    animationQueue
  }), [preset, isReducedMotion, performanceMode, enableInteractions, animationQueue])

  return (
    <AnimationContext.Provider value={contextValue}>
      <LayoutGroup>
        <div className={cn("relative", className)}>
          {children}
          
          {/* Performance metrics overlay (development only) */}
          {enableAnalytics && (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50"
            >
              <div>FPS: {performanceMetrics.frameRate}</div>
              <div>Dropped: {performanceMetrics.droppedFrames}</div>
              <div>Active: {activeAnimations.size}</div>
              <div>Total: {performanceMetrics.animationCount}</div>
            </motion.div>
          )}
        </div>
      </LayoutGroup>
    </AnimationContext.Provider>
  )
}

// Animated wrapper components
export const AnimatedCard: React.FC<{
  children: React.ReactNode
  variant?: keyof typeof ANIMATION_VARIANTS
  className?: string
  hoverEffect?: boolean
  onClick?: () => void
}> = ({ 
  children, 
  variant = 'cardHover', 
  className, 
  hoverEffect = true,
  onClick 
}) => {
  const { preset, isReducedMotion } = React.useContext(AnimationContext)
  const controls = useAnimation()

  if (isReducedMotion) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={ANIMATION_VARIANTS[variant]}
      initial="rest"
      whileHover={hoverEffect ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      animate={controls}
      transition={ANIMATION_PRESETS[preset]}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedList: React.FC<{
  children: React.ReactNode
  className?: string
  stagger?: boolean
  delay?: number
}> = ({ 
  children, 
  className, 
  stagger = true,
  delay = 0 
}) => {
  const { preset, isReducedMotion } = React.useContext(AnimationContext)

  if (isReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={stagger ? ANIMATION_VARIANTS.staggeredGrid : undefined}
      initial="hidden"
      animate="visible"
      transition={{
        ...ANIMATION_PRESETS[preset],
        delayChildren: delay,
        staggerChildren: stagger ? 0.1 : 0
      }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedListItem: React.FC<{
  children: React.ReactNode
  className?: string
  index?: number
}> = ({ children, className, index = 0 }) => {
  const { preset, isReducedMotion } = React.useContext(AnimationContext)

  if (isReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={ANIMATION_VARIANTS.componentFadeInUp}
      transition={{
        ...ANIMATION_PRESETS[preset],
        delay: index * 0.1
      }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}> = ({ 
  children, 
  className, 
  onClick, 
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false
}) => {
  const { isReducedMotion, enableInteractions } = React.useContext(AnimationContext)
  const [isPressed, setIsPressed] = useState(false)
  const rippleRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled || loading) return

    // Create ripple effect
    if (enableInteractions && !isReducedMotion && rippleRef.current) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const ripple = document.createElement('div')
      ripple.className = 'absolute rounded-full bg-white/30 pointer-events-none'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.style.transform = 'translate(-50%, -50%)'
      ripple.style.width = '0px'
      ripple.style.height = '0px'

      rippleRef.current.appendChild(ripple)

      // Animate ripple
      ripple.animate([
        { width: '0px', height: '0px', opacity: 0.7 },
        { width: '100px', height: '100px', opacity: 0 }
      ], {
        duration: 600,
        easing: 'ease-out'
      }).onfinish = () => {
        ripple.remove()
      }
    }

    onClick?.()
  }, [disabled, loading, onClick, enableInteractions, isReducedMotion])

  if (isReducedMotion) {
    return (
      <button 
        className={className} 
        onClick={handleClick}
        disabled={disabled || loading}
      >
        {children}
      </button>
    )
  }

  return (
    <motion.button
      ref={rippleRef}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={enableInteractions && !disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={enableInteractions && !disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-current/10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  )
}

export const AnimatedProgress: React.FC<{
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
  animate?: boolean
}> = ({ 
  value, 
  max = 100, 
  className, 
  showPercentage = false,
  animate = true 
}) => {
  const { preset, isReducedMotion } = React.useContext(AnimationContext)
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn("relative overflow-hidden rounded-full bg-gray-200", className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        initial={animate && !isReducedMotion ? { width: 0 } : { width: `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={isReducedMotion ? { duration: 0 } : ANIMATION_PRESETS[preset]}
      />
      {showPercentage && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference"
          initial={animate && !isReducedMotion ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={isReducedMotion ? { duration: 0 } : { ...ANIMATION_PRESETS[preset], delay: 0.2 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  )
}

export const AnimatedModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  overlayClassName?: string
}> = ({ 
  isOpen, 
  onClose, 
  children, 
  className,
  overlayClassName 
}) => {
  const { preset, isReducedMotion } = React.useContext(AnimationContext)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={cn("fixed inset-0 bg-black/50 z-40", overlayClassName)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={isReducedMotion ? { duration: 0 } : ANIMATION_PRESETS[preset]}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={cn("bg-white rounded-lg shadow-xl max-w-md w-full", className)}
              variants={ANIMATION_VARIANTS.modal}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={isReducedMotion ? { duration: 0 } : ANIMATION_PRESETS[preset]}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export const AnimatedNotification: React.FC<{
  notification: {
    id: string
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }
  onDismiss: (id: string) => void
  className?: string
}> = ({ notification, onDismiss, className }) => {
  const { preset, isReducedMotion } = React.useContext(AnimationContext)

  const typeColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  return (
    <motion.div
      layout
      className={cn("relative overflow-hidden rounded-lg bg-white shadow-lg border p-4", className)}
      variants={ANIMATION_VARIANTS.notification}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={isReducedMotion ? { duration: 0 } : ANIMATION_PRESETS[preset]}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", typeColors[notification.type])} />
      <div className="ml-3">
        <h4 className="font-medium text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
      </div>
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        onClick={() => onDismiss(notification.id)}
      >
        ✕
      </button>
    </motion.div>
  )
}

// Animation utility hooks
export const useAnimationControls = () => {
  const controls = useAnimation()
  const { preset, isReducedMotion } = React.useContext(AnimationContext)

  const animate = useCallback((animation: string | object, options?: any) => {
    if (isReducedMotion) return Promise.resolve()
    
    return controls.start(animation, {
      ...ANIMATION_PRESETS[preset],
      ...options
    })
  }, [controls, preset, isReducedMotion])

  return { controls, animate }
}

export const useSpringAnimation = (value: number, config?: any) => {
  const { isReducedMotion } = React.useContext(AnimationContext)
  
  const spring = useSpring(value, {
    stiffness: 300,
    damping: 25,
    ...config
  })

  return isReducedMotion ? value : spring
}

export const useScrollAnimation = () => {
  const scrollY = useMotionValue(0)
  const { isReducedMotion } = React.useContext(AnimationContext)

  useEffect(() => {
    if (isReducedMotion) return

    const updateScrollY = () => scrollY.set(window.scrollY)
    window.addEventListener('scroll', updateScrollY)
    return () => window.removeEventListener('scroll', updateScrollY)
  }, [scrollY, isReducedMotion])

  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])

  return { scrollY, opacity, scale }
}

// Performance monitoring hook
export const useAnimationPerformance = () => {
  const [metrics, setMetrics] = useState({
    frameRate: 60,
    droppedFrames: 0,
    memoryUsage: 0
  })

  useEffect(() => {
    const monitor = () => {
      // Monitor performance metrics
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        }))
      }
    }

    const interval = setInterval(monitor, 1000)
    return () => clearInterval(interval)
  }, [])

  return metrics
}

export default QuickActionsAnimations
