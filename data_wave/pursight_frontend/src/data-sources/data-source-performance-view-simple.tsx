"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Zap,
  Target,
  HardDrive,
  Network
} from 'lucide-react'

import { DataSource } from "./types"
import { 
  useDataSourceStatsQuery,
  useDataSourceHealthQuery 
} from "./services/apis"

interface PerformanceViewProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

export function DataSourcePerformanceView({
  dataSource,
  className = ""
}: PerformanceViewProps) {
  const [refreshing, setRefreshing] = useState(false)

  // Fetch real data from working APIs
  const {
    data: dataSourceStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDataSourceStatsQuery(dataSource.id, {
    refetchInterval: 30000, // 30 seconds
  })

  const {
    data: dataSourceHealth,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useDataSourceHealthQuery(dataSource.id, {
    refetchInterval: 30000, // 30 seconds
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchStats(), refetchHealth()])
    } finally {
      setRefreshing(false)
    }
  }

  // Process real data into performance metrics
  const performanceData = useMemo(() => {
    if (!dataSourceStats && !dataSourceHealth) return null

    const stats = dataSourceStats || {}
    const health = dataSourceHealth || {}
    
    return {
      overallScore: health.metrics?.health_score || 0,
      responseTime: health.latency_ms || 0,
      errorRate: health.metrics?.error_rate || 0,
      uptime: health.metrics?.uptime || 0,
      cpuUsage: health.metrics?.cpu_usage || 0,
      memoryUsage: health.metrics?.memory_usage || 0,
      storageUsage: health.metrics?.storage_used || 0,
      queryTime: stats.performance_stats?.avg_query_time || 0,
      peakConnections: stats.performance_stats?.peak_connections || 0,
      cacheHitRatio: stats.performance_stats?.cache_hit_ratio || 0,
      totalEntities: stats.entity_stats?.total_entities || 0,
      tables: stats.entity_stats?.tables || 0,
      dataSize: stats.size_stats?.total_size_formatted || '0 B',
      lastScan: stats.last_scan_time || null,
      status: health.status || 'unknown'
    }
  }, [dataSourceStats, dataSourceHealth])

  const isLoading = statsLoading || healthLoading
  const error = statsError || healthError

  if (isLoading && !performanceData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load performance data: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!performanceData) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No performance data available</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <p className="text-muted-foreground">Real-time performance metrics for {dataSource.name}</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
        {getStatusIcon(performanceData.status)}
        <div>
          <p className="font-medium">System Status: <span className={getStatusColor(performanceData.status)}>{performanceData.status}</span></p>
          <p className="text-sm text-muted-foreground">Last checked: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.overallScore}%</div>
            <Progress value={performanceData.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average latency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Failed requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.uptime}%</div>
            <p className="text-xs text-muted-foreground">System availability</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="data">Data Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Query Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Query Time:</span>
                  <span className="font-medium">{performanceData.queryTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Peak Connections:</span>
                  <span className="font-medium">{performanceData.peakConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cache Hit Ratio:</span>
                  <span className="font-medium">{performanceData.cacheHitRatio.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5" />
                  <span>Network Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Response Time:</span>
                  <span className="font-medium">{performanceData.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Error Rate:</span>
                  <span className="font-medium">{performanceData.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uptime:</span>
                  <span className="font-medium">{performanceData.uptime}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>{performanceData.cpuUsage}%</span>
                  </div>
                  <Progress value={performanceData.cpuUsage} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{performanceData.memoryUsage}%</span>
                  </div>
                  <Progress value={performanceData.memoryUsage} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage Usage</span>
                    <span>{performanceData.storageUsage}%</span>
                  </div>
                  <Progress value={performanceData.storageUsage} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Storage Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Size:</span>
                  <span className="font-medium">{performanceData.dataSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Storage Used:</span>
                  <span className="font-medium">{performanceData.storageUsage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Scan:</span>
                  <span className="font-medium">
                    {performanceData.lastScan ? new Date(performanceData.lastScan).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Data Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Entities:</span>
                  <span className="font-medium">{performanceData.totalEntities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tables:</span>
                  <span className="font-medium">{performanceData.tables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Size:</span>
                  <span className="font-medium">{performanceData.dataSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Scan:</span>
                  <span className="font-medium">
                    {performanceData.lastScan ? new Date(performanceData.lastScan).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Performance Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Health Score:</span>
                  <span className="font-medium">{performanceData.overallScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Response Time:</span>
                  <span className="font-medium">{performanceData.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Error Rate:</span>
                  <span className="font-medium">{performanceData.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uptime:</span>
                  <span className="font-medium">{performanceData.uptime}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
