"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Activity, Cpu, HardDrive, Zap, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  cpuUsage: number
  networkRequests: number
  errorCount: number
  timestamp: number
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  const collectMetrics = useCallback((): PerformanceMetrics => {
    const now = performance.now()
    const memory = (performance as any).memory

    return {
      renderTime: now,
      memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0, // MB
      cpuUsage: Math.random() * 100, // Simulated - would use real CPU monitoring in production
      networkRequests:
        (performance.getEntriesByType("navigation").length || 0) +
        (performance.getEntriesByType("resource").length || 0),
      errorCount: (window as any).__RACINE_ERROR_COUNT__ || 0,
      timestamp: Date.now(),
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isMonitoring) {
      interval = setInterval(() => {
        const newMetrics = collectMetrics()
        setMetrics((prev) => [...prev.slice(-19), newMetrics]) // Keep last 20 entries
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMonitoring, collectMetrics])

  const currentMetrics = metrics[metrics.length - 1]
  const previousMetrics = metrics[metrics.length - 2]

  const getTrend = (current: number, previous: number) => {
    if (!previous) return null
    return current > previous ? "up" : current < previous ? "down" : "stable"
  }

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-red-500" />
      case "down":
        return <TrendingDown className="w-3 h-3 text-green-500" />
      default:
        return null
    }
  }

  const getPerformanceStatus = (cpuUsage: number, memoryUsage: number) => {
    if (cpuUsage > 80 || memoryUsage > 100) return { status: "critical", color: "red" }
    if (cpuUsage > 60 || memoryUsage > 75) return { status: "warning", color: "yellow" }
    return { status: "good", color: "green" }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-500" />
              <CardTitle>Performance Monitor</CardTitle>
            </div>
            <Badge
              variant={isMonitoring ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? "Stop" : "Start"} Monitoring
            </Badge>
          </div>
        </CardHeader>

        {currentMetrics && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    {previousMetrics && getTrendIcon(getTrend(currentMetrics.cpuUsage, previousMetrics.cpuUsage))}
                  </div>
                  <div className="text-2xl font-bold">{currentMetrics.cpuUsage.toFixed(1)}%</div>
                  <Progress value={currentMetrics.cpuUsage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    {previousMetrics && getTrendIcon(getTrend(currentMetrics.memoryUsage, previousMetrics.memoryUsage))}
                  </div>
                  <div className="text-2xl font-bold">{currentMetrics.memoryUsage.toFixed(1)} MB</div>
                  <Progress value={(currentMetrics.memoryUsage / 200) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Network</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{currentMetrics.networkRequests}</div>
                  <div className="text-xs text-muted-foreground">Requests</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Errors</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{currentMetrics.errorCount}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>

            {currentMetrics && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">System Status:</span>
                <Badge
                  variant={
                    getPerformanceStatus(currentMetrics.cpuUsage, currentMetrics.memoryUsage).status === "good"
                      ? "default"
                      : "destructive"
                  }
                >
                  {getPerformanceStatus(currentMetrics.cpuUsage, currentMetrics.memoryUsage).status.toUpperCase()}
                </Badge>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
