"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Shield,
  Database,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Brain,
  GitBranch,
  Eye,
  RefreshCw,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  trend: number[]
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface RecentActivity {
  id: string
  type: 'workflow' | 'pipeline' | 'scan' | 'compliance'
  title: string
  status: 'success' | 'warning' | 'error' | 'running'
  timestamp: string
  user: string
  impact: 'low' | 'medium' | 'high'
}

interface SystemAlert {
  id: string
  type: 'security' | 'performance' | 'compliance' | 'data-quality'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  resolved: boolean
}

const mockMetrics: DashboardMetric[] = [
  {
    id: "data-sources",
    title: "Data Sources",
    value: "47",
    change: 8.2,
    changeType: "increase",
    trend: [20, 25, 30, 35, 42, 47],
    icon: Database,
    color: "text-blue-600"
  },
  {
    id: "compliance-score",
    title: "Compliance Score",
    value: "94.8%",
    change: 2.1,
    changeType: "increase", 
    trend: [88, 90, 91, 93, 94, 94.8],
    icon: Shield,
    color: "text-green-600"
  },
  {
    id: "active-workflows",
    title: "Active Workflows",
    value: "23",
    change: -5.3,
    changeType: "decrease",
    trend: [28, 26, 25, 24, 23, 23],
    icon: GitBranch,
    color: "text-purple-600"
  },
  {
    id: "data-quality",
    title: "Data Quality",
    value: "98.2%",
    change: 0.5,
    changeType: "increase",
    trend: [97.1, 97.5, 97.8, 98.0, 98.1, 98.2],
    icon: Target,
    color: "text-emerald-600"
  },
  {
    id: "user-activity",
    title: "Active Users",
    value: "156",
    change: 12.5,
    changeType: "increase",
    trend: [120, 135, 142, 148, 152, 156],
    icon: Users,
    color: "text-orange-600"
  },
  {
    id: "processing-speed",
    title: "Avg Processing",
    value: "2.3s",
    change: -15.2,
    changeType: "decrease",
    trend: [2.8, 2.6, 2.5, 2.4, 2.3, 2.3],
    icon: Zap,
    color: "text-yellow-600"
  }
]

const mockActivities: RecentActivity[] = [
  {
    id: "act-1",
    type: "workflow",
    title: "Daily Data Quality Check completed",
    status: "success",
    timestamp: "2024-01-20T14:30:00Z",
    user: "Sarah Chen",
    impact: "medium"
  },
  {
    id: "act-2", 
    type: "pipeline",
    title: "Customer ETL pipeline started",
    status: "running",
    timestamp: "2024-01-20T14:15:00Z",
    user: "Mike Johnson",
    impact: "high"
  },
  {
    id: "act-3",
    type: "scan",
    title: "PCI DSS compliance scan triggered",
    status: "warning",
    timestamp: "2024-01-20T14:00:00Z",
    user: "Alex Rivera",
    impact: "high"
  },
  {
    id: "act-4",
    type: "compliance",
    title: "GDPR audit report generated",
    status: "success",
    timestamp: "2024-01-20T13:45:00Z",
    user: "Dr. Emily Watson",
    impact: "medium"
  }
]

const mockAlerts: SystemAlert[] = [
  {
    id: "alert-1",
    type: "security",
    title: "Unusual access pattern detected",
    description: "Multiple failed login attempts from unknown IP addresses",
    severity: "medium",
    timestamp: "2024-01-20T14:20:00Z",
    resolved: false
  },
  {
    id: "alert-2",
    type: "performance", 
    title: "High memory usage on data processing cluster",
    description: "Memory utilization is at 87% and trending upward",
    severity: "high",
    timestamp: "2024-01-20T14:10:00Z",
    resolved: false
  },
  {
    id: "alert-3",
    type: "data-quality",
    title: "Data drift detected in customer dataset",
    description: "Statistical properties have changed beyond acceptable thresholds",
    severity: "medium",
    timestamp: "2024-01-20T13:55:00Z",
    resolved: true
  }
]

const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle, 
  error: AlertTriangle,
  running: Clock
}

const statusColors = {
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  running: "text-blue-600"
}

const severityColors = {
  low: "border-gray-300 bg-gray-50",
  medium: "border-yellow-300 bg-yellow-50",
  high: "border-orange-300 bg-orange-50", 
  critical: "border-red-300 bg-red-50"
}

export const IntelligentDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Format relative time
  const formatRelativeTime = useCallback((timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    return `${diffHours}h ago`
  }, [])

  // Render metric card
  const renderMetricCard = useCallback((metric: DashboardMetric) => {
    const Icon = metric.icon
    const changeIcon = metric.changeType === 'increase' ? ArrowUpRight :
                      metric.changeType === 'decrease' ? ArrowDownRight : Minus
    const changeColor = metric.changeType === 'increase' ? 'text-green-600' :
                       metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'

    return (
      <Card key={metric.id} className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg bg-accent", metric.color)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            </div>
            <div className={cn("flex items-center gap-1 text-xs", changeColor)}>
              {changeIcon && <changeIcon className="h-3 w-3" />}
              {Math.abs(metric.change)}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{metric.value}</div>
          <div className="text-xs text-muted-foreground">
            vs last period
          </div>
        </CardContent>
      </Card>
    )
  }, [])

  // Render activity item
  const renderActivityItem = useCallback((activity: RecentActivity) => {
    const StatusIcon = statusIcons[activity.status]
    const statusColor = statusColors[activity.status]

    return (
      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
        <div className={cn("p-1.5 rounded-lg bg-accent/20", statusColor)}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{activity.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatRelativeTime(activity.timestamp)}</span>
            <span>•</span>
            <span>{activity.user}</span>
            <span>•</span>
            <Badge variant="outline" className="h-4 px-1 text-xs">
              {activity.impact}
            </Badge>
          </div>
        </div>
      </div>
    )
  }, [formatRelativeTime])

  // Render alert item
  const renderAlertItem = useCallback((alert: SystemAlert) => {
    return (
      <div 
        key={alert.id} 
        className={cn(
          "p-3 rounded-lg border",
          severityColors[alert.severity],
          alert.resolved && "opacity-60"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-medium">{alert.title}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {alert.severity}
            </Badge>
            {alert.resolved && (
              <Badge variant="secondary" className="text-xs">
                Resolved
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(alert.timestamp)}
          </span>
          {!alert.resolved && (
            <Button size="sm" variant="outline" className="h-6 text-xs">
              Investigate
            </Button>
          )}
        </div>
      </div>
    )
  }, [formatRelativeTime])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Intelligent Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time insights into your data governance platform
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={autoRefresh ? "default" : "outline"} 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", autoRefresh && "animate-spin")} />
              Auto Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="flex-1 px-6 pb-6">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockMetrics.map(renderMetricCard)}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activities */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Recent Activities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {mockActivities.map(renderActivityItem)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Alerts */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          System Alerts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockAlerts.map(renderAlertItem)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <GitBranch className="h-6 w-6" />
                        <span className="text-xs">New Workflow</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <Database className="h-6 w-6" />
                        <span className="text-xs">Add Data Source</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <Shield className="h-6 w-6" />
                        <span className="text-xs">Run Compliance</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <Brain className="h-6 w-6" />
                        <span className="text-xs">AI Assistant</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="performance" className="flex-1 px-6 pb-6">
            <div className="text-center py-20">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="flex-1 px-6 pb-6">
            <div className="text-center py-20">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">Security Overview</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="flex-1 px-6 pb-6">
            <div className="text-center py-20">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default IntelligentDashboard