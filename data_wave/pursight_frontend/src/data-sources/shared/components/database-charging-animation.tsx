"use client"

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Activity, Zap, Cpu, HardDrive, Atom, Brain, Database } from 'lucide-react'

interface DatabaseChargingAnimationProps {
  progress: number
  status: string
  isVisible: boolean
  isDiscoveryRunning: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  opacity: number
  type: 'neutron' | 'proton' | 'electron'
  color: string
  angle: number
  radius: number
  speed: number
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
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize particles for advanced 3D animation
  const initializeParticles = useMemo(() => {
    const particleCount = 24
    const newParticles: Particle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const type = i % 3 === 0 ? 'neutron' : i % 3 === 1 ? 'proton' : 'electron'
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 60 + (i % 3) * 20
      
      newParticles.push({
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        vz: 0,
        size: type === 'neutron' ? 6 : type === 'proton' ? 5 : 3,
        opacity: 0.8 + Math.random() * 0.2,
        type,
        color: type === 'neutron' ? '#ffffff' : type === 'proton' ? '#e5e5e5' : '#d4d4d4',
        angle: angle,
        radius: radius,
        speed: 0.5 + Math.random() * 0.5
      })
    }
    
    return newParticles
  }, [])

  // Enhanced progress tracking with precise simulation
  useEffect(() => {
    if (!isVisible || !isDiscoveryRunning || progress === 0 || progress < 5) {
      setRealProgress(0)
      setIsAnimating(false)
      setAnimationTime(0)
      setParticles([])
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    setIsAnimating(true)
    setParticles(initializeParticles)
    
    // Precise progress tracking that simulates actual discovery time
    const trackProgress = () => {
      const targetProgress = progress
      const currentProgress = realProgress
      
      if (currentProgress < targetProgress) {
        // Dynamic increment based on discovery phase
        let increment = 1.2
        if (targetProgress > 20) increment = 0.8  // Schema discovery phase
        if (targetProgress > 50) increment = 0.6  // Table analysis phase
        if (targetProgress > 75) increment = 0.4  // Relationship mapping
        if (targetProgress > 90) increment = 0.15 // Final optimization
        if (targetProgress > 97) increment = 0.05 // Completion
        
        const newProgress = Math.min(currentProgress + increment, targetProgress)
        setRealProgress(newProgress)
        
        if (newProgress < targetProgress) {
          setTimeout(trackProgress, 60) // 60ms for smoother animation
        } else {
          setTimeout(() => setIsAnimating(false), 1000) // Keep animating briefly after completion
        }
      }
    }

    trackProgress()
  }, [progress, isVisible, isDiscoveryRunning, realProgress, initializeParticles])

  // Advanced 3D particle animation system
  useEffect(() => {
    if (!isAnimating || particles.length === 0) return

    const animate = () => {
      setAnimationTime(prev => prev + 0.016) // 60fps
      
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          const time = animationTime * particle.speed
          const progressFactor = realProgress / 100
          
          // 3D orbital motion with progress-based acceleration
          const newAngle = particle.angle + time * (0.5 + progressFactor * 1.5)
          const radiusVariation = Math.sin(time * 2) * 8 * progressFactor
          const currentRadius = particle.radius + radiusVariation
          
          // 3D positioning with Z-axis movement
          const x = Math.cos(newAngle) * currentRadius
          const y = Math.sin(newAngle) * currentRadius
          const z = particle.z + Math.sin(time * 1.5 + particle.id) * 12 * progressFactor
          
          // Dynamic size and opacity based on progress and 3D position
          const depthFactor = (z + 40) / 80 // Normalize z to 0-1
          const size = particle.size * (0.7 + depthFactor * 0.6) * (0.8 + progressFactor * 0.4)
          const opacity = particle.opacity * depthFactor * (0.6 + progressFactor * 0.4)
          
          return {
            ...particle,
            x,
            y,
            z,
            size,
            opacity: Math.max(0.2, Math.min(1, opacity)),
            angle: newAngle
          }
        })
      )
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, particles.length, animationTime, realProgress])

  // Canvas-based 3D particle rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || particles.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Sort particles by z-depth for proper 3D rendering
      const sortedParticles = [...particles].sort((a, b) => b.z - a.z)
      
      sortedParticles.forEach(particle => {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 8 + particle.size
        
        // Draw particle with 3D effect
        ctx.beginPath()
        ctx.arc(
          centerX + particle.x,
          centerY + particle.y,
          particle.size,
          0,
          Math.PI * 2
        )
        ctx.fill()
        
        // Add inner glow for depth
        ctx.globalAlpha = particle.opacity * 0.6
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(
          centerX + particle.x,
          centerY + particle.y,
          particle.size * 0.5,
          0,
          Math.PI * 2
        )
        ctx.fill()
        
        ctx.restore()
      })
      
      if (isAnimating) {
        requestAnimationFrame(render)
      }
    }
    
    render()
  }, [particles, isAnimating])

  // Only show when enterprise discovery is actually running
  if (!isVisible || !isDiscoveryRunning || realProgress === 0 || progress === 0 || progress < 5) return null

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.8) 50%, rgba(0,0,0,0.9) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Advanced 3D Neutron Atom Animation */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Canvas for 3D Particle System */}
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="absolute inset-0"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
              transform: 'perspective(1000px) rotateX(10deg)'
            }}
          />
          
          {/* Central Nucleus - Pulsing Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="relative"
              style={{
                transform: `scale(${0.8 + (realProgress / 100) * 0.4}) rotate(${animationTime * 20}deg)`
              }}
            >
              {/* Main nucleus */}
              <div 
                className="w-12 h-12 bg-white rounded-full shadow-2xl"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #ffffff, #e5e5e5, #d4d4d4)',
                  boxShadow: `0 0 ${20 + realProgress/5}px rgba(255,255,255,${0.6 + realProgress/200}), 
                             inset 0 0 10px rgba(255,255,255,0.8)`,
                  animation: 'nucleusPulse 2s ease-in-out infinite alternate'
                }}
              >
                {/* Inner energy core */}
                <div 
                  className="absolute inset-2 bg-white rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.9), transparent)',
                    boxShadow: '0 0 15px rgba(255,255,255,0.8)'
                  }}
                />
              </div>
              
              {/* Energy field rings */}
              {[1, 2, 3].map(ring => (
                <div
                  key={ring}
                  className="absolute inset-0 border border-white/20 rounded-full animate-ping"
                  style={{
                    width: `${48 + ring * 20}px`,
                    height: `${48 + ring * 20}px`,
                    left: `${-ring * 10}px`,
                    top: `${-ring * 10}px`,
                    animationDelay: `${ring * 0.3}s`,
                    animationDuration: `${2 + ring}s`,
                    opacity: 0.3 + (realProgress / 300)
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Orbital Energy Rings */}
          {[1, 2, 3, 4].map(orbit => (
            <div
              key={orbit}
              className="absolute border border-white/10 rounded-full animate-spin"
              style={{
                width: `${120 + orbit * 30}px`,
                height: `${120 + orbit * 30}px`,
                left: `${-60 - orbit * 15}px`,
                top: `${-60 - orbit * 15}px`,
                animationDuration: `${8 + orbit * 2}s`,
                animationDirection: orbit % 2 === 0 ? 'reverse' : 'normal',
                transform: `rotateX(${orbit * 15}deg) rotateY(${orbit * 10}deg)`,
                boxShadow: `0 0 ${5 + orbit}px rgba(255,255,255,${0.1 + realProgress/500})`,
                opacity: 0.4 + (realProgress / 250)
              }}
            />
          ))}
          
          {/* Precision Progress Indicator */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center gap-2">
              <div 
                className="text-white text-2xl font-bold text-center bg-black/95 rounded-2xl px-6 py-3 border border-gray-400 shadow-2xl backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(40,40,40,0.9))',
                  boxShadow: `0 0 25px rgba(255,255,255,${realProgress/150}), 
                             inset 0 1px 0 rgba(255,255,255,0.1)`,
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px'
                }}
              >
                {Math.round(realProgress * 100) / 100}%
              </div>
              <div className="text-white/80 text-xs font-mono">
                NEURAL MATRIX SYNC
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Status Display with Cursor Style */}
        <div className="text-center max-w-lg">
          <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-2xl flex items-center justify-center gap-3">
            <Brain className="w-6 h-6 animate-pulse" style={{ 
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' 
            }} />
            <span style={{
              background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255,255,255,0.3)'
            }}>
              ENTERPRISE QUANTUM DISCOVERY
            </span>
          </h3>
          
          <div 
            className="text-gray-200 text-base mb-6 drop-shadow-lg font-mono"
            style={{
              textShadow: '0 0 10px rgba(255,255,255,0.2)',
              letterSpacing: '0.5px'
            }}
          >
            {status}
          </div>
          
          {/* Advanced Progress Indicators */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
              <Database className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white text-xs font-mono">NEURAL</span>
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${Math.min(realProgress * 1.2, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
              <Cpu className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white text-xs font-mono">QUANTUM</span>
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${Math.min(realProgress * 0.9, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
              <Activity className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white text-xs font-mono">MATRIX</span>
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${realProgress}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Main Progress Bar */}
          <div className="w-96 bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-600 shadow-inner mb-4">
            <div 
              className="h-full bg-gradient-to-r from-white via-gray-200 to-white transition-all duration-700 ease-out rounded-full relative overflow-hidden"
              style={{ 
                width: `${realProgress}%`,
                boxShadow: `0 0 20px rgba(255,255,255,${realProgress/100})`,
                background: `linear-gradient(90deg, 
                  rgba(255,255,255,0.9) 0%, 
                  rgba(255,255,255,1) 50%, 
                  rgba(255,255,255,0.9) 100%)`
              }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"
                style={{
                  animation: 'progressShimmer 2s ease-in-out infinite'
                }}
              />
            </div>
          </div>
          
          {/* Dynamic Status Text */}
          <div 
            className="text-white text-sm font-mono"
            style={{
              textShadow: '0 0 8px rgba(255,255,255,0.3)',
              letterSpacing: '0.3px'
            }}
          >
            {realProgress < 10 && "► INITIALIZING QUANTUM NEURAL MATRIX..."}
            {realProgress >= 10 && realProgress < 25 && "► SCANNING DIMENSIONAL DATABASE STRUCTURES..."}
            {realProgress >= 25 && realProgress < 45 && "► ANALYZING SCHEMA QUANTUM SIGNATURES..."}
            {realProgress >= 45 && realProgress < 65 && "► PROCESSING TABLE RELATIONSHIP MATRICES..."}
            {realProgress >= 65 && realProgress < 80 && "► MAPPING DATA CONNECTION NETWORKS..."}
            {realProgress >= 80 && realProgress < 95 && "► SYNCHRONIZING DISCOVERY ALGORITHMS..."}
            {realProgress >= 95 && realProgress < 100 && "► FINALIZING ENTERPRISE NEURAL MATRIX..."}
            {realProgress >= 100 && "► QUANTUM DISCOVERY MATRIX COMPLETE!"}
          </div>
        </div>
      </div>
      
      {/* Advanced CSS for 3D animations and cursor styling */}
      <style jsx>{`
        @keyframes nucleusPulse {
          0% { 
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 20px rgba(255,255,255,0.6), inset 0 0 10px rgba(255,255,255,0.8);
          }
          50% { 
            transform: scale(1.1) rotate(180deg);
            box-shadow: 0 0 30px rgba(255,255,255,0.8), inset 0 0 15px rgba(255,255,255,1);
          }
          100% { 
            transform: scale(1) rotate(360deg);
            box-shadow: 0 0 20px rgba(255,255,255,0.6), inset 0 0 10px rgba(255,255,255,0.8);
          }
        }
        
        @keyframes progressShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes particleOrbit {
          0% { transform: rotateZ(0deg) rotateY(0deg) rotateX(0deg); }
          100% { transform: rotateZ(360deg) rotateY(360deg) rotateX(360deg); }
        }
        
        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  )
}
