"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Atom } from 'lucide-react'

interface DatabaseChargingAnimationProps {
  progress: number
  status: string
  isVisible: boolean
  isDiscoveryRunning: boolean
}

// Advanced black & white 3D neutron/proton animation
// - Strictly follows provided progress (no fake increments)
// - Smoothly eases to target using rAF for performance
// - Minimal DOM, GPU-accelerated transforms only
export function DatabaseChargingAnimation({
  progress,
  status,
  isVisible,
  isDiscoveryRunning,
}: DatabaseChargingAnimationProps) {
  const frameRef = useRef<number>()
  const [displayProgress, setDisplayProgress] = useState(0)
  const [t, setT] = useState(0)

  // Smoothly interpolate towards incoming progress while remaining exact
  useEffect(() => {
    if (!isVisible || !isDiscoveryRunning || progress <= 0) {
      cancelAnimationFrame(frameRef.current as number)
      setDisplayProgress(0)
      setT(0)
      return
    }

    const animate = () => {
      // critically damped spring-ish interpolation for smoothness
      const delta = progress - displayProgress
      const step = Math.sign(delta) * Math.min(Math.abs(delta), Math.max(0.5, Math.abs(delta) * 0.2))
      const next = displayProgress + step
      setDisplayProgress(next)
      setT((prev) => prev + 0.016)
      if (Math.abs(progress - next) > 0.2) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayProgress(progress)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current as number)
  }, [progress, isVisible, isDiscoveryRunning, displayProgress])

  if (!isVisible || !isDiscoveryRunning || progress <= 0) return null

  // Derived sizes/angles
  const nucleusSize = 56
  const orbitCount = 3
  const electronsPerOrbit = 6

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Schema discovery in progress"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-8 select-none">
        {/* Atom scene */}
        <div className="relative" style={{ width: 240, height: 240 }}>
          {/* Nucleus (protons + neutrons) */}
          <div
            className="absolute rounded-full bg-white/95 shadow-2xl"
            style={{
              width: nucleusSize,
              height: nucleusSize,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${8 + displayProgress / 6}px rgba(255,255,255,${0.5 + displayProgress / 200})`,
            }}
          />

          {/* Proton/Neutron inner particles */}
          {[0, 1, 2, 3].map((i) => {
            const angle = t * (0.8 + i * 0.15) + i * Math.PI / 2
            const radius = 12 + (i % 2) * 6
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            return (
              <div
                key={`core-${i}`}
                className="absolute rounded-full bg-black"
                style={{
                  width: 8,
                  height: 8,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 6px rgba(255,255,255,0.6)',
                }}
              />
            )
          })}

          {/* Orbits */}
          {Array.from({ length: orbitCount }).map((_, orbitIndex) => {
            const base = 70 + orbitIndex * 28 + displayProgress * 0.1
            const thickness = 1 + orbitIndex
            return (
              <div
                key={`orbit-${orbitIndex}`}
                className="absolute rounded-full border border-white/30"
                style={{
                  width: base * 2,
                  height: base * 2,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%) rotateX(60deg)',
                  boxShadow: `inset 0 0 ${6 + orbitIndex * 2}px rgba(255,255,255,0.2)`,
                  borderWidth: thickness,
                }}
              />
            )
          })}

          {/* Electrons (neutrons visualized as orbiters for simplicity) */}
          {Array.from({ length: orbitCount }).map((_, orbitIndex) => {
            const base = 70 + orbitIndex * 28 + displayProgress * 0.1
            return Array.from({ length: electronsPerOrbit }).map((__, i) => {
              const speed = 0.8 + orbitIndex * 0.25
              const angle = (i * (360 / electronsPerOrbit) + displayProgress * 3.6 + t * 60 * speed) * (Math.PI / 180)
              const x = Math.cos(angle) * base
              const y = Math.sin(angle) * base * 0.5 // elliptic orbit (rotateX)
              const size = 5 + (orbitIndex % 2)
              const opacity = 0.7 + orbitIndex * 0.1
              return (
                <div
                  key={`e-${orbitIndex}-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: size,
                    height: size,
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    opacity,
                    boxShadow: `0 0 ${6 + orbitIndex * 2}px rgba(255,255,255,0.7)`,
                  }}
                />
              )
            })
          })}

          {/* Percentage badge */}
          <div
            className="absolute left-1/2 -bottom-10 -translate-x-1/2 rounded-full border border-white/30 px-4 py-1 bg-black/90 text-white text-sm font-semibold tracking-wider"
            aria-label={`Progress ${Math.round(displayProgress)} percent`}
          >
            {Math.round(displayProgress)}%
          </div>
        </div>

        {/* Status and bar */}
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center gap-2 mb-2 text-white">
            <Atom className="w-5 h-5" />
            <span className="text-sm uppercase tracking-widest">Enterprise Discovery</span>
          </div>
          <div className="text-xs text-gray-200 mb-4" role="status">{status}</div>
          <div className="w-72 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <div
              className="h-full bg-white transition-[width] duration-150 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  )
}
