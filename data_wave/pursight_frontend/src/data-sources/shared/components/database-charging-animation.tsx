"use client"

import React, { useEffect, useState, useRef } from 'react'
import { Activity, Zap, Cpu, HardDrive, Atom } from 'lucide-react'

interface DatabaseChargingAnimationProps {
  progress: number
  status: string
  isVisible: boolean
  isDiscoveryRunning: boolean // New prop to track if discovery is actually running
}

export function DatabaseChargingAnimation({ 
  progress, 
  status, 
  isVisible,
  isDiscoveryRunning
}: DatabaseChargingAnimationProps) {
  const [realProgress, setRealProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationTime, setAnimationTime] = useState(0)
  const animationRef = useRef<number>()

  // Enhanced 3D animation with realistic progress tracking
  useEffect(() => {
    // Only show when enterprise discovery is actually running
    if (!isVisible || !isDiscoveryRunning || progress === 0 || progress < 5) {
      setRealProgress(0)
      setIsAnimating(false)
      setAnimationTime(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    setIsAnimating(true)
    
    // Real progress tracking that depends exactly on discovery operation time
    const trackProgress = () => {
      const targetProgress = progress
      const currentProgress = realProgress
      
      if (currentProgress < targetProgress) {
        // More realistic progress increments based on actual discovery time
        let increment = 0.8
        if (targetProgress > 70) increment = 0.4 // Slower in middle phase
        if (targetProgress > 85) increment = 0.2 // Much slower near completion
        if (targetProgress > 95) increment = 0.05 // Very slow at the end
        
        const newProgress = Math.min(currentProgress + increment, targetProgress)
        setRealProgress(newProgress)
        
        // Continue tracking if not at target
        if (newProgress < targetProgress) {
          setTimeout(trackProgress, 80) // 80ms intervals for smoother tracking
        } else {
          setIsAnimating(false)
        }
      }
    }

    trackProgress()
  }, [progress, isVisible, isDiscoveryRunning, realProgress])

  // 3D animation loop for continuous neutron movement
  useEffect(() => {
    if (!isAnimating) return

    const animate = () => {
      setAnimationTime(prev => prev + 0.016) // ~60fps
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating])

  // Only show when enterprise discovery is actually running
  if (!isVisible || !isDiscoveryRunning || realProgress === 0 || progress === 0 || progress < 5) return null

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Enhanced 3D Neutron Circles Animation */}
        <div className="relative w-40 h-40 flex items-center justify-center perspective-1000">
          {/* Central Core - 3D pulsing atom */}
          <div className="absolute w-10 h-10 bg-white rounded-full shadow-2xl animate-pulse">
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
            {/* 3D Core Glow */}
            <div 
              className="absolute inset-0 bg-white rounded-full animate-pulse"
              style={{
                transform: 'translateZ(10px)',
                boxShadow: `0 0 20px rgba(255,255,255,${realProgress/100})`
              }}
            />
          </div>
          
          {/* 3D Orbiting Neutron Circles with floating motion */}
          {[...Array(8)].map((_, i) => {
            const baseAngle = (i * 45) + (animationTime * 30) // Continuous rotation
            const progressAngle = realProgress * 3.6 // Progress-based rotation
            const angle = baseAngle + progressAngle
            
            // 3D positioning with Z-axis variation
            const radius = 50 + (realProgress / 8) + Math.sin(animationTime * 2 + i) * 5 // Floating radius
            const zOffset = Math.sin(animationTime * 1.5 + i) * 15 // 3D floating motion
            const x = Math.cos(angle * Math.PI / 180) * radius
            const y = Math.sin(angle * Math.PI / 180) * radius
            
            // Size variation for 3D effect
            const size = 4 + Math.sin(animationTime * 3 + i) * 1.5
            const opacity = 0.7 + Math.sin(animationTime * 2 + i) * 0.3
            
            return (
              <div
                key={i}
                className="absolute bg-white rounded-full shadow-lg"
                style={{
                  left: `calc(50% + ${x}px - ${size/2}px)`,
                  top: `calc(50% + ${y}px - ${size/2}px)`,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: `translateZ(${zOffset}px)`,
                  opacity: opacity,
                  boxShadow: `0 0 ${8 + realProgress/10}px rgba(255,255,255,${realProgress/100})`,
                  animation: `neutronFloat ${2 + i * 0.2}s ease-in-out infinite alternate`
                }}
              >
                {/* Inner 3D glow */}
                <div 
                  className="absolute inset-0 bg-white rounded-full animate-ping opacity-60"
                  style={{
                    transform: 'translateZ(5px)',
                    animationDelay: `${i * 0.3}s`
                  }}
                />
                {/* Outer energy ring */}
                <div 
                  className="absolute inset-0 border border-white/40 rounded-full animate-ping"
                  style={{
                    transform: 'translateZ(-2px) scale(1.5)',
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '3s'
                  }}
                />
              </div>
            )
          })}
          
          {/* 3D Energy Rings with depth */}
          {isAnimating && (
            <>
              {/* Inner 3D Ring */}
              <div 
                className="absolute border-2 border-white/40 rounded-full animate-spin"
                style={{
                  width: `${25 + (realProgress / 3)}px`,
                  height: `${25 + (realProgress / 3)}px`,
                  animationDuration: '4s',
                  transform: 'translateZ(5px)',
                  boxShadow: `0 0 15px rgba(255,255,255,${realProgress/150})`
                }}
              />
              
              {/* Middle 3D Ring */}
              <div 
                className="absolute border border-white/30 rounded-full animate-spin"
                style={{
                  width: `${45 + (realProgress / 4)}px`,
                  height: `${45 + (realProgress / 4)}px`,
                  animationDuration: '6s',
                  animationDirection: 'reverse',
                  transform: 'translateZ(-5px)',
                  boxShadow: `0 0 20px rgba(255,255,255,${realProgress/200})`
                }}
              />
              
              {/* Outer 3D Ring */}
              <div 
                className="absolute border border-white/20 rounded-full animate-spin"
                style={{
                  width: `${70 + (realProgress / 5)}px`,
                  height: `${70 + (realProgress / 5)}px`,
                  animationDuration: '8s',
                  transform: 'translateZ(-10px)',
                  boxShadow: `0 0 25px rgba(255,255,255,${realProgress/250})`
                }}
              />
            </>
          )}
          
          {/* 3D Progress Indicator */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 translateZ(20px)">
            <div 
              className="text-white text-sm font-bold text-center bg-black/90 rounded-xl px-4 py-2 border border-gray-500 shadow-2xl"
              style={{
                transform: 'translateZ(10px)',
                boxShadow: `0 0 15px rgba(255,255,255,${realProgress/100})`
              }}
            >
              {Math.round(realProgress)}%
            </div>
          </div>
        </div>
        
        {/* Enhanced Status Display */}
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-white mb-3 drop-shadow-2xl flex items-center justify-center gap-2">
            <Atom className="w-5 h-5 animate-spin" />
            Enterprise Schema Discovery
          </h3>
          <p className="text-gray-200 text-sm mb-4 drop-shadow-lg">
            {status}
          </p>
          
          {/* Enhanced Progress Indicators */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-white animate-pulse" />
              <span className="text-white text-sm font-medium">Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-white animate-pulse" />
              <span className="text-white text-sm font-medium">Analyzing</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-white animate-pulse" />
              <span className="text-white text-sm font-medium">Active</span>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="w-64 bg-gray-800 rounded-full h-3 overflow-hidden border-2 border-gray-600 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-white via-gray-200 to-white transition-all duration-700 ease-out rounded-full shadow-lg"
              style={{ 
                width: `${realProgress}%`,
                boxShadow: `0 0 12px rgba(255,255,255,${realProgress/100})`
              }}
            />
          </div>
          
          {/* Enhanced Progress Text */}
          <div className="mt-3 text-white text-sm font-medium">
            {realProgress < 15 && "Initializing quantum discovery engine..."}
            {realProgress >= 15 && realProgress < 30 && "Scanning database dimensions..."}
            {realProgress >= 30 && realProgress < 50 && "Analyzing schema structures..."}
            {realProgress >= 50 && realProgress < 70 && "Processing table relationships..."}
            {realProgress >= 70 && realProgress < 85 && "Mapping data connections..."}
            {realProgress >= 85 && realProgress < 95 && "Synchronizing discovery results..."}
            {realProgress >= 95 && realProgress < 100 && "Finalizing enterprise matrix..."}
            {realProgress >= 100 && "Discovery matrix complete!"}
          </div>
        </div>
      </div>
      
      {/* Custom CSS for 3D animations */}
      <style>{`
        @keyframes neutronFloat {
          0% { transform: translateZ(0px) scale(1); }
          50% { transform: translateZ(10px) scale(1.1); }
          100% { transform: translateZ(0px) scale(1); }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}
