"use client"

import React, { useState, useRef, useCallback } from 'react'
import { 
  GripVertical, 
  Maximize2, 
  Minimize2, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchemaDiscovery } from '../shared/contexts/schema-discovery-context'
import { getProgressStatus } from '../shared/utils/schema-discovery-progress'

interface SchemaDiscoverySplitViewProps {
  tempComponent: React.ReactNode
  enterpriseComponent: React.ReactNode
  className?: string
}

export function SchemaDiscoverySplitView({ 
  tempComponent, 
  enterpriseComponent, 
  className = "" 
}: SchemaDiscoverySplitViewProps) {
  const { state } = useSchemaDiscovery()
  const [splitPosition, setSplitPosition] = useState(50) // Percentage
  const [isDragging, setIsDragging] = useState(false)
  const [tempFullscreen, setTempFullscreen] = useState(false)
  const [enterpriseFullscreen, setEnterpriseFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const tempStatus = getProgressStatus(state, 'temp')
  const enterpriseStatus = getProgressStatus(state, 'enterprise')

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    const clampedPercentage = Math.min(95, Math.max(5, percentage))
    setSplitPosition(clampedPercentage)
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const toggleTempFullscreen = () => {
    setTempFullscreen(!tempFullscreen)
    setEnterpriseFullscreen(false)
  }

  const toggleEnterpriseFullscreen = () => {
    setEnterpriseFullscreen(!enterpriseFullscreen)
    setTempFullscreen(false)
  }

  const getStatusIcon = (status: any) => {
    if (status.isRunning) return <Clock className="h-4 w-4 text-blue-500" />
    if (status.isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status.isError) return <X className="h-4 w-4 text-red-500" />
    if (status.isBlocked) return <Lock className="h-4 w-4 text-gray-500" />
    return null
  }

  const getStatusText = (status: any) => {
    if (status.isRunning) return 'Running'
    if (status.isCompleted) return 'Completed'
    if (status.isError) return 'Error'
    if (status.isBlocked) return 'Blocked'
    return 'Ready'
  }

  const getStatusColor = (status: any) => {
    if (status.isRunning) return 'bg-blue-500'
    if (status.isCompleted) return 'bg-green-500'
    if (status.isError) return 'bg-red-500'
    if (status.isBlocked) return 'bg-gray-500'
    return 'bg-gray-300'
  }

  if (tempFullscreen) {
    return (
      <div className={`h-full flex flex-col ${className}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Schema Discovery (Temp)</h3>
            {getStatusIcon(tempStatus)}
            <Badge variant={tempStatus.isBlocked ? "secondary" : "default"}>
              {getStatusText(tempStatus)}
            </Badge>
            {tempStatus.isRunning && (
              <div className="flex items-center gap-2">
                <Progress value={tempStatus.progress} className="w-32" />
                <span className="text-sm text-muted-foreground">{tempStatus.progress}%</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTempFullscreen}
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
        <div className="flex-1 relative">
          {tempStatus.isBlocked && (
            <div className="absolute inset-0 bg-gray-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
              <Alert className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This component is blocked because the Enterprise Schema Discovery is currently running.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {tempComponent}
        </div>
      </div>
    )
  }

  if (enterpriseFullscreen) {
    return (
      <div className={`h-full flex flex-col ${className}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Schema Discovery (Enterprise)</h3>
            {getStatusIcon(enterpriseStatus)}
            <Badge variant={enterpriseStatus.isBlocked ? "secondary" : "default"}>
              {getStatusText(enterpriseStatus)}
            </Badge>
            {enterpriseStatus.isRunning && (
              <div className="flex items-center gap-2">
                <Progress value={enterpriseStatus.progress} className="w-32" />
                <span className="text-sm text-muted-foreground">{enterpriseStatus.progress}%</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleEnterpriseFullscreen}
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
        <div className="flex-1 relative">
          {enterpriseStatus.isBlocked && (
            <div className="absolute inset-0 bg-gray-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
              <Alert className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This component is blocked because the Temp Schema Discovery is currently running.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {enterpriseComponent}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`h-full flex ${className}`}>
      {/* Temp Component */}
      <div 
        className="flex flex-col relative"
        style={{ width: `${splitPosition}%` }}
      >
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Schema Discovery (Temp)</h4>
            {getStatusIcon(tempStatus)}
            <Badge variant={tempStatus.isBlocked ? "secondary" : "default"} className="text-xs">
              {getStatusText(tempStatus)}
            </Badge>
            {tempStatus.isRunning && (
              <div className="flex items-center gap-1">
                <Progress value={tempStatus.progress} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground">{tempStatus.progress}%</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTempFullscreen}
            className="h-6 w-6 p-0"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-1 relative">
          {tempStatus.isBlocked && (
            <div className="absolute inset-0 bg-gray-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
              <Alert className="max-w-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Blocked - Enterprise discovery running
                </AlertDescription>
              </Alert>
            </div>
          )}
          {tempComponent}
        </div>
      </div>

      {/* Split Handle */}
      <div
        className="w-2 bg-border hover:bg-blue-200 dark:hover:bg-blue-800 cursor-col-resize flex items-center justify-center group transition-colors"
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none' }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>

      {/* Enterprise Component */}
      <div 
        className="flex flex-col relative"
        style={{ width: `${100 - splitPosition}%` }}
      >
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Schema Discovery (Enterprise)</h4>
            {getStatusIcon(enterpriseStatus)}
            <Badge variant={enterpriseStatus.isBlocked ? "secondary" : "default"} className="text-xs">
              {getStatusText(enterpriseStatus)}
            </Badge>
            {enterpriseStatus.isRunning && (
              <div className="flex items-center gap-1">
                <Progress value={enterpriseStatus.progress} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground">{enterpriseStatus.progress}%</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleEnterpriseFullscreen}
            className="h-6 w-6 p-0"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-1 relative">
          {enterpriseStatus.isBlocked && (
            <div className="absolute inset-0 bg-gray-500/20 backdrop-blur-sm z-10 flex items-center justify-center">
              <Alert className="max-w-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Blocked - Temp discovery running
                </AlertDescription>
              </Alert>
            </div>
          )}
          {enterpriseComponent}
        </div>
      </div>
    </div>
  )
}
