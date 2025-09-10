"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, TrendingUp, AlertTriangle, Shield, Zap, Target, BarChart3, PieChart, LineChart, Activity, Eye, Bell, CheckCircle2, XCircle, Clock, Users, Database, Server, Cpu, HardDrive, Network, Gauge, Sparkles, Lightbulb, Radar, Focus, Layers, GitBranch, Workflow, Calendar, Star, Award, Trophy, Flag, Bookmark, Heart, ThumbsUp, Smile, Frown, Info, Plus, Minus, ArrowRight, ArrowDown, ArrowUp, ChevronRight, ChevronDown, ChevronUp, MoreHorizontal, Settings, Filter, Download, Upload, RefreshCw, Maximize2, Minimize2, Grid, List, Search, Command, Palette, Globe, Lock, Building, FileText, MessageSquare, Share2, ExternalLink, Copy, Edit, Trash2, Play, Pause, Square } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

// Import hooks
import { useAIAnalyticsIntegration } from "../../hooks/use-ai-analytics-integration"
import { useWebSocketIntegration } from "../../hooks/use-websocket-integration"
import { useRBACIntegration } from "../../hooks/use-rbac-integration"
import { useEnterpriseFeatures } from "../../hooks/use-enterprise-features"

// Import types
import { DataSource } from "../../types"

interface AIPoweredDashboardProps {
  dataSources?: DataSource[]
  className?: string
}

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  changeType: "increase" | "decrease" | "neutral"
  icon: React.ComponentType<any>
  color: string
  description: string
  trend: number[]
}

interface InsightCard {
  id: string
  type: "recommendation" | "alert" | "insight" | "pattern"
  title: string
  description: string
  confidence: number
  priority: "low" | "medium" | "high" | "critical"
  category: string
  timestamp: string
  actions?: Array<{
    label: string
    action: () => void
    variant?: "default" | "destructive" | "outline" | "secondary"
  }>
}

interface RealtimeMetric {
  id: string
  name: string
  value: number
  unit: string
  status: "healthy" | "warning" | "critical"
  history: number[]
}

export function AIPoweredDashboard({ dataSources = [], className = "" }: AIPoweredDashboardProps) {
  // Hooks
  const {
    recommendations,
    predictiveInsights,
    anomalyDetections,
    patternInsights,
    optimizationSuggestions,
    summary,
    isLoading: analyticsLoading,
    generateDataSourceInsights
  } = useAIAnalyticsIntegration()

  const {
    isConnected,
    subscribeToDataSourceEvents,
    subscribeToSecurityEvents,
    subscribeToCollaborationEvents,
    stats: wsStats
  } = useWebSocketIntegration()

  const {
    currentUser,
    hasPermission,
    dataSourcePermissions,
    logUserAction
  } = useRBACIntegration()

  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'AIPoweredDashboard',
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // State
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [selectedView, setSelectedView] = useState<"overview" | "insights" | "analytics" | "monitoring">("overview")
  const [selectedDataSource, setSelectedDataSource] = useState<number | null>(null)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [dashboardLayout, setDashboardLayout] = useState<"grid" | "list">("grid")
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)

  // Computed metrics
  const keyMetrics: MetricCard[] = useMemo(() => [
    {
      id: "total_recommendations",
      title: "AI Recommendations",
      value: summary.totalRecommendations,
      change: 12.5,
      changeType: "increase",
      icon: Brain,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      description: "Active AI-powered recommendations",
      trend: [65, 78, 82, 95, 88, 92, summary.totalRecommendations]
    },
    {
      id: "predictive_insights",
      title: "Predictive Insights",
      value: summary.totalPredictiveInsights,
      change: 8.3,
      changeType: "increase",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      description: "Future trend predictions",
      trend: [45, 52, 48, 61, 58, 67, summary.totalPredictiveInsights]
    },
    {
      id: "active_anomalies",
      title: "Active Anomalies",
      value: summary.activeAnomalies,
      change: -15.2,
      changeType: "decrease",
      icon: AlertTriangle,
      color: "bg-gradient-to-r from-orange-500 to-red-500",
      description: "Anomalies requiring attention",
      trend: [28, 32, 25, 18, 22, 19, summary.activeAnomalies]
    },
    {
      id: "data_sources",
      title: "Data Sources",
      value: dataSources.length,
      change: 5.7,
      changeType: "increase",
      icon: Database,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      description: "Connected data sources",
      trend: [42, 45, 48, 51, 49, 52, dataSources.length]
    },
    {
      id: "quality_score",
      title: "Quality Score",
      value: `${Math.round(summary.averageConfidence * 100)}%`,
      change: 3.1,
      changeType: "increase",
      icon: Shield,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
      description: "Overall data quality",
      trend: [85, 87, 89, 91, 88, 92, Math.round(summary.averageConfidence * 100)]
    },
    {
      id: "optimization_opportunities",
      title: "Optimizations",
      value: summary.totalOptimizations,
      change: 22.4,
      changeType: "increase",
      icon: Zap,
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      description: "Performance optimizations",
      trend: [12, 15, 18, 22, 19, 25, summary.totalOptimizations]
    }
  ], [summary, dataSources.length])

  const realtimeMetrics: RealtimeMetric[] = useMemo(() => [
    {
      id: "throughput",
      name: "Data Throughput",
      value: 2847,
      unit: "MB/s",
      status: "healthy",
      history: [2100, 2300, 2500, 2700, 2600, 2800, 2847]
    },
    {
      id: "latency",
      name: "Query Latency",
      value: 45,
      unit: "ms",
      status: "healthy",
      history: [52, 48, 44, 46, 43, 47, 45]
    },
    {
      id: "connections",
      name: "Active Connections",
      value: wsStats.connected ? wsStats.subscriptionCount : 0,
      unit: "conn",
      status: isConnected ? "healthy" : "critical",
      history: [120, 135, 142, 138, 145, 152, wsStats.subscriptionCount]
    },
    {
      id: "error_rate",
      name: "Error Rate",
      value: 0.12,
      unit: "%",
      status: "healthy",
      history: [0.15, 0.18, 0.14, 0.11, 0.13, 0.10, 0.12]
    }
  ], [wsStats, isConnected])

  const insights: InsightCard[] = useMemo(() => {
    const cards: InsightCard[] = []

    // Add recommendations as insights
    recommendations.slice(0, 3).forEach(rec => {
      cards.push({
        id: rec.id,
        type: "recommendation",
        title: rec.title,
        description: rec.description,
        confidence: rec.confidence,
        priority: rec.priority as any,
        category: rec.category,
        timestamp: rec.createdAt,
        actions: [
          {
            label: "Accept",
            action: () => logUserAction("recommendation_accepted", "ai_analytics", rec.id),
            variant: "default"
          },
          {
            label: "Dismiss",
            action: () => logUserAction("recommendation_dismissed", "ai_analytics", rec.id),
            variant: "outline"
          }
        ]
      })
    })

    // Add anomalies as alerts
    anomalyDetections.slice(0, 2).forEach(anomaly => {
      cards.push({
        id: anomaly.id,
        type: "alert",
        title: anomaly.title,
        description: anomaly.description,
        confidence: 1.0,
        priority: anomaly.severity === "critical" ? "critical" : "high",
        category: "Security",
        timestamp: anomaly.detectedAt,
        actions: [
          {
            label: "Investigate",
            action: () => logUserAction("anomaly_investigated", "security", anomaly.id),
            variant: "default"
          },
          {
            label: "Acknowledge",
            action: () => logUserAction("anomaly_acknowledged", "security", anomaly.id),
            variant: "outline"
          }
        ]
      })
    })

    // Add patterns as insights
    patternInsights.slice(0, 2).forEach(pattern => {
      cards.push({
        id: pattern.id,
        type: "pattern",
        title: pattern.title,
        description: pattern.description,
        confidence: pattern.confidence,
        priority: "medium",
        category: "Analytics",
        timestamp: pattern.createdAt
      })
    })

    return cards.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [recommendations, anomalyDetections, patternInsights, logUserAction])

  // Effects
  useEffect(() => {
    if (isRealTimeEnabled && isConnected) {
      // Subscribe to real-time events
      const securitySub = subscribeToSecurityEvents((message) => {
        console.log("Security event received:", message)
      })

      const collaborationSub = subscribeToCollaborationEvents("dashboard", (message) => {
        console.log("Collaboration event received:", message)
      })

      return () => {
        // Cleanup subscriptions would go here
      }
    }
  }, [isRealTimeEnabled, isConnected, subscribeToSecurityEvents, subscribeToCollaborationEvents])

  // Handlers
  const handleRefreshInsights = useCallback(async () => {
    if (selectedDataSource) {
      await generateDataSourceInsights(selectedDataSource, ["comprehensive", "predictive", "anomaly"])
    }
    logUserAction("dashboard_refreshed", "dashboard", "ai_powered")
  }, [selectedDataSource, generateDataSourceInsights, logUserAction])

  const handleTimeRangeChange = useCallback((range: string) => {
    setSelectedTimeRange(range)
    logUserAction("time_range_changed", "dashboard", range)
  }, [logUserAction])

  const handleViewChange = useCallback((view: string) => {
    setSelectedView(view as any)
    logUserAction("view_changed", "dashboard", view)
  }, [logUserAction])

  // Render functions
  const renderMetricCard = (metric: MetricCard) => (
    <motion.div
      key={metric.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className={`absolute inset-0 ${metric.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${metric.color} bg-opacity-20`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{metric.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-sm">
                {metric.changeType === "increase" ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : metric.changeType === "decrease" ? (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                ) : (
                  <ArrowRight className="h-3 w-3 text-gray-500" />
                )}
                <span className={`${
                  metric.changeType === "increase" ? "text-green-500" : 
                  metric.changeType === "decrease" ? "text-red-500" : 
                  "text-gray-500"
                }`}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </div>
            <div className="w-16 h-8">
              {/* Mini trend chart would go here */}
              <div className="h-full bg-gradient-to-r from-transparent to-primary/20 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderInsightCard = (insight: InsightCard) => (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant={
                insight.type === "alert" ? "destructive" :
                insight.type === "recommendation" ? "default" :
                insight.type === "pattern" ? "secondary" : "outline"
              }>
                {insight.type === "recommendation" && <Brain className="h-3 w-3 mr-1" />}
                {insight.type === "alert" && <AlertTriangle className="h-3 w-3 mr-1" />}
                {insight.type === "pattern" && <TrendingUp className="h-3 w-3 mr-1" />}
                {insight.type === "insight" && <Lightbulb className="h-3 w-3 mr-1" />}
                {insight.type}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${
                  insight.priority === "critical" ? "border-red-500 text-red-500" :
                  insight.priority === "high" ? "border-orange-500 text-orange-500" :
                  insight.priority === "medium" ? "border-yellow-500 text-yellow-500" :
                  "border-green-500 text-green-500"
                }`}
              >
                {insight.priority}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(insight.timestamp).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{insight.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {insight.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <Progress value={insight.confidence * 100} className="w-16 h-2" />
                <span className="text-xs font-medium">{Math.round(insight.confidence * 100)}%</span>
              </div>
              {insight.actions && (
                <div className="flex space-x-1">
                  {insight.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "outline"}
                      size="sm"
                      onClick={action.action}
                      className="text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderRealtimeMetric = (metric: RealtimeMetric) => (
    <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          metric.status === "healthy" ? "bg-green-500" :
          metric.status === "warning" ? "bg-yellow-500" :
          "bg-red-500"
        }`} />
        <div>
          <div className="font-medium text-sm">{metric.name}</div>
          <div className="text-xs text-muted-foreground">
            {metric.value} {metric.unit}
          </div>
        </div>
      </div>
      <div className="w-12 h-6">
        {/* Mini sparkline would go here */}
        <div className="h-full bg-gradient-to-r from-primary/20 to-primary/40 rounded" />
      </div>
    </div>
  )

  if (analyticsLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI-Powered Dashboard
          </h1>
          <p className="text-muted-foreground">
            Intelligent insights and real-time analytics for your data governance platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefreshInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={isRealTimeEnabled}
                onCheckedChange={setIsRealTimeEnabled}
              >
                Real-time Updates
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showAdvancedMetrics}
                onCheckedChange={setShowAdvancedMetrics}
              >
                Advanced Metrics
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDashboardLayout("grid")}>
                <Grid className="h-4 w-4 mr-2" />
                Grid Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDashboardLayout("list")}>
                <List className="h-4 w-4 mr-2" />
                List Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {keyMetrics.map(renderMetricCard)}
      </div>

      {/* Main Content */}
      <Tabs value={selectedView} onValueChange={handleViewChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Insights */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Latest AI Insights</span>
                </CardTitle>
                <CardDescription>
                  Recent recommendations, alerts, and pattern discoveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {insights.map(renderInsightCard)}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Real-time Metrics</span>
                </CardTitle>
                <CardDescription>
                  Live system performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realtimeMetrics.map(renderRealtimeMetric)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map(renderInsightCard)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Comprehensive analytics dashboard coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Advanced analytics visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Predictive Models</CardTitle>
                <CardDescription>
                  AI model performance and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Predictive analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Real-time system monitoring and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realtimeMetrics.map(renderRealtimeMetric)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Alert Center</CardTitle>
                <CardDescription>
                  Active alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalyDetections.slice(0, 5).map(anomaly => (
                    <Alert key={anomaly.id} className={`${
                      anomaly.severity === "critical" ? "border-red-500" :
                      anomaly.severity === "warning" ? "border-yellow-500" :
                      "border-blue-500"
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-sm">{anomaly.title}</AlertTitle>
                      <AlertDescription className="text-xs">
                        {anomaly.description}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}