"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Shield, Database, Activity, Zap, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ComponentValidator } from "./ComponentValidator"
import { PerformanceMonitor } from "./PerformanceMonitor"

interface SystemHealthProps {
  onHealthCheck?: (status: "healthy" | "warning" | "critical") => void
}

export const SystemHealthDashboard: React.FC<SystemHealthProps> = ({ onHealthCheck }) => {
  const [healthStatus, setHealthStatus] = useState<"healthy" | "warning" | "critical">("healthy")
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "validation" | "performance">("overview")

  const systemChecks = [
    {
      name: "Component Integrity",
      status: "healthy" as const,
      description: "All components loaded successfully",
      icon: Shield,
    },
    {
      name: "Hook Orchestration",
      status: "healthy" as const,
      description: "All hooks initialized and functioning",
      icon: Activity,
    },
    {
      name: "Error Boundaries",
      status: "healthy" as const,
      description: "Error handling systems active",
      icon: Shield,
    },
    {
      name: "Performance Metrics",
      status: "warning" as const,
      description: "Some performance optimizations recommended",
      icon: Zap,
    },
    {
      name: "Backend Integration",
      status: "healthy" as const,
      description: "All backend services connected",
      icon: Database,
    },
  ]

  const runHealthCheck = () => {
    setLastCheck(new Date())
    // Simulate health check logic
    const criticalIssues = systemChecks.filter((check) => check.status === "critical").length
    const warningIssues = systemChecks.filter((check) => check.status === "warning").length

    let status: "healthy" | "warning" | "critical" = "healthy"
    if (criticalIssues > 0) status = "critical"
    else if (warningIssues > 0) status = "warning"

    setHealthStatus(status)
    onHealthCheck?.(status)
  }

  useEffect(() => {
    // Run initial health check
    runHealthCheck()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
      case "warning":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-500" />
              <CardTitle>System Health Dashboard</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={healthStatus === "healthy" ? "default" : "destructive"}>
                {healthStatus.toUpperCase()}
              </Badge>
              <Button onClick={runHealthCheck} size="sm">
                Run Health Check
              </Button>
            </div>
          </div>
          {lastCheck && <p className="text-sm text-muted-foreground">Last check: {lastCheck.toLocaleString()}</p>}
        </CardHeader>
      </Card>

      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
          size="sm"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "validation" ? "default" : "outline"}
          onClick={() => setActiveTab("validation")}
          size="sm"
        >
          Component Validation
        </Button>
        <Button
          variant={activeTab === "performance" ? "default" : "outline"}
          onClick={() => setActiveTab("performance")}
          size="sm"
        >
          Performance Monitor
        </Button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemChecks.map((check, index) => {
            const IconComponent = check.icon
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{check.name}</span>
                    </div>
                    {getStatusIcon(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                  <Badge className={`mt-2 ${getStatusColor(check.status)}`} variant="outline">
                    {check.status}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === "validation" && <ComponentValidator />}

      {activeTab === "performance" && <PerformanceMonitor />}
    </div>
  )
}
