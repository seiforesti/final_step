"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  Network,
  Shield,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  BarChart3,
  Gauge,
  Thermometer,
  Cpu,
  Memory,
  HardDriveIcon,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  Target,
  AlertCircle,
  Info,
  ExternalLink,
  Download,
  Upload,
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  History,
  LineChart,
  PieChart,
  ScatterChart,
  AreaChart,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

import { DataSource, DataSourceHealth, DataSourceStats, ConnectionPoolStats } from "./types"
import {
  useDataSourceHealthQuery,
  useDataSourceStatsQuery,
  useConnectionPoolStatsQuery,
  useToggleMonitoringMutation,
  useReconfigureConnectionPoolMutation,
} from "./services/apis"

interface DataSourceMonitoringDashboardProps {
  dataSource: DataSource
  onRefresh?: () => void
  onConfigure?: () => void
  onViewDetails?: () => void
}

export function DataSourceMonitoringDashboard({
  dataSource,
  onRefresh,
  onConfigure,
  onViewDetails,
}: DataSourceMonitoringDashboardProps) {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h")

  // Queries
  const { data: health, isLoading: healthLoading } = useDataSourceHealthQuery(dataSource.id, {
    refetchInterval: autoRefresh ? 30000 : false,
  })

  const { data: stats, isLoading: statsLoading } = useDataSourceStatsQuery(dataSource.id, {
    refetchInterval: autoRefresh ? 60000 : false,
  })

  const { data: poolStats, isLoading: poolStatsLoading } = useConnectionPoolStatsQuery(dataSource.id, {
    refetchInterval: autoRefresh ? 15000 : false,
  })

  // Mutations
  const toggleMonitoringMutation = useToggleMonitoringMutation()
  const reconfigurePoolMutation = useReconfigureConnectionPoolMutation()

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "critical":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value >= threshold * 0.9) return "text-green-500"
    if (value >= threshold * 0.7) return "text-yellow-500"
    return "text-red-500"
  }

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const handleToggleMonitoring = async () => {
    try {
      await toggleMonitoringMutation.mutateAsync(dataSource.id)
    } catch (error) {
      console.error("Failed to toggle monitoring:", error)
    }
  }

  const handleReconfigurePool = async (config: any) => {
    try {
      await reconfigurePoolMutation.mutateAsync({
        dataSourceId: dataSource.id,
        config,
      })
    } catch (error) {
      console.error("Failed to reconfigure connection pool:", error)
    }
  }

  if (healthLoading || statsLoading || poolStatsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Monitoring Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time monitoring and analytics for {dataSource.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Monitoring Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={onConfigure}>
                  <Settings className="h-4 w-4 mr-2" />
                  Connection Pool
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}>
                  {showAdvancedMetrics ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showAdvancedMetrics ? "Hide" : "Show"} Advanced Metrics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleMonitoring}>
                  <Activity className="h-4 w-4 mr-2" />
                  {dataSource.monitoring_enabled ? "Disable" : "Enable"} Monitoring
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Health Status Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              {health && (
                <Badge variant={health.status === "healthy" ? "default" : health.status === "warning" ? "secondary" : "destructive"}>
                  {health.status}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {health && (
                  <div className={`${getHealthStatusColor(health.status)}`}>
                    {getHealthStatusIcon(health.status)}
                  </div>
                )}
                <div className="text-2xl font-bold">
                  {health?.status?.toUpperCase() || "UNKNOWN"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last checked: {health?.last_checked ? new Date(health.last_checked).toLocaleTimeString() : "Never"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {health?.latency_ms ? formatLatency(health.latency_ms) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dataSource.health_score ? `${dataSource.health_score}%` : "N/A"}
              </div>
              <Progress value={dataSource.health_score || 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Overall health rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dataSource.compliance_score ? `${dataSource.compliance_score}%` : "N/A"}
              </div>
              <Progress value={dataSource.compliance_score || 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Data compliance rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            {showAdvancedMetrics && <TabsTrigger value="advanced">Advanced</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Entity Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entity Statistics</CardTitle>
                  <CardDescription>Database objects and structure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{stats?.entity_stats?.total_entities || 0}</div>
                      <p className="text-xs text-muted-foreground">Total Entities</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats?.entity_stats?.tables || 0}</div>
                      <p className="text-xs text-muted-foreground">Tables</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats?.entity_stats?.views || 0}</div>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats?.entity_stats?.columns || 0}</div>
                      <p className="text-xs text-muted-foreground">Columns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Classification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Classification</CardTitle>
                  <CardDescription>Sensitivity and compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Classified Columns</span>
                      <span className="font-medium">{stats?.classification_stats?.classified_columns || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sensitive Data</span>
                      <span className="font-medium">{stats?.sensitivity_stats?.sensitive_columns || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PII Columns</span>
                      <span className="font-medium">{stats?.sensitivity_stats?.pii_columns || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Financial Data</span>
                      <span className="font-medium">{stats?.sensitivity_stats?.financial_columns || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Operational Status</CardTitle>
                  <CardDescription>System configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monitoring</span>
                      <Badge variant={dataSource.monitoring_enabled ? "default" : "secondary"}>
                        {dataSource.monitoring_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Backup</span>
                      <Badge variant={dataSource.backup_enabled ? "default" : "secondary"}>
                        {dataSource.backup_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Encryption</span>
                      <Badge variant={dataSource.encryption_enabled ? "default" : "secondary"}>
                        {dataSource.encryption_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Location</span>
                      <Badge variant="outline">{dataSource.location}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  <CardDescription>System performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Query Time</span>
                      <span className={`font-medium ${getPerformanceColor(dataSource.avg_response_time || 0, 1000)}`}>
                        {dataSource.avg_response_time ? formatLatency(dataSource.avg_response_time) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Queries/Second</span>
                      <span className="font-medium">{dataSource.queries_per_second || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <span className={`font-medium ${getPerformanceColor((dataSource.error_rate || 0) * 100, 5)}`}>
                        {dataSource.error_rate ? formatPercentage(dataSource.error_rate * 100) : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <span className="font-medium">{dataSource.uptime_percentage ? formatPercentage(dataSource.uptime_percentage) : "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Quality</CardTitle>
                  <CardDescription>Quality assessment metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quality Score</span>
                      <span className="font-medium">{stats?.quality_stats?.quality_score || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Issues Found</span>
                      <span className="font-medium">{stats?.quality_stats?.issues_found || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Freshness</span>
                      <Badge variant="outline">{stats?.quality_stats?.data_freshness || "Unknown"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cache Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cache Performance</CardTitle>
                  <CardDescription>Cache hit ratios and efficiency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Hit Ratio</span>
                      <span className="font-medium">{stats?.performance_stats?.cache_hit_ratio || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Connections</span>
                      <span className="font-medium">{stats?.performance_stats?.peak_connections || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Connection Pool Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connection Pool</CardTitle>
                  <CardDescription>Active and idle connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pool Size</span>
                      <span className="font-medium">{poolStats?.pool_size || dataSource.pool_size || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Connections</span>
                      <span className="font-medium">{poolStats?.active_connections || dataSource.active_connections || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Idle Connections</span>
                      <span className="font-medium">{poolStats?.idle_connections || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Overflow</span>
                      <span className="font-medium">{poolStats?.max_overflow || dataSource.max_overflow || 0}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pool Utilization</span>
                      <span>{poolStats ? Math.round((poolStats.active_connections / poolStats.pool_size) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      value={poolStats ? (poolStats.active_connections / poolStats.pool_size) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Connection Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connection Health</CardTitle>
                  <CardDescription>Connection performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Connection Time</span>
                      <span className="font-medium">{poolStats?.avg_connection_time ? formatLatency(poolStats.avg_connection_time) : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Connection Errors</span>
                      <span className="font-medium">{poolStats?.connection_errors || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pool Timeout</span>
                      <span className="font-medium">{poolStats?.pool_timeout || dataSource.pool_timeout || 0}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Connection Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connection Actions</CardTitle>
                  <CardDescription>Manage connection pool</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleReconfigurePool({ pool_size: 10 })}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Pool
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleReconfigurePool({ pool_size: Math.max(5, (poolStats?.active_connections || 0) + 2) })}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Increase Pool Size
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={onConfigure}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Pool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Storage Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Storage Overview</CardTitle>
                  <CardDescription>Data storage and growth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Size</span>
                      <span className="font-medium">{stats?.size_stats?.total_size_formatted || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Growth Rate</span>
                      <span className="font-medium">{stats?.size_stats?.growth_rate_gb_per_day || 0} GB/day</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Storage Used</span>
                      <span className="font-medium">{dataSource.storage_used_percentage ? formatPercentage(dataSource.storage_used_percentage) : "N/A"}</span>
                    </div>
                  </div>
                  {dataSource.storage_used_percentage && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Storage Utilization</span>
                          <span>{formatPercentage(dataSource.storage_used_percentage)}</span>
                        </div>
                        <Progress 
                          value={dataSource.storage_used_percentage} 
                          className="h-2" 
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Cost Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Analysis</CardTitle>
                  <CardDescription>Monthly cost breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Cost</span>
                      <span className="font-medium">${dataSource.cost_per_month || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cost per GB</span>
                      <span className="font-medium">
                        ${dataSource.cost_per_month && dataSource.size_gb 
                          ? (dataSource.cost_per_month / dataSource.size_gb).toFixed(2) 
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storage Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Storage Actions</CardTitle>
                  <CardDescription>Storage management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {showAdvancedMetrics && (
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Advanced Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced Performance</CardTitle>
                    <CardDescription>Detailed performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CPU Usage</span>
                        <span className="font-medium">N/A</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Memory Usage</span>
                        <span className="font-medium">N/A</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Network I/O</span>
                        <span className="font-medium">N/A</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Disk I/O</span>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Metrics</CardTitle>
                    <CardDescription>Security and compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">SSL Status</span>
                        <Badge variant={dataSource.ssl_config ? "default" : "secondary"}>
                          {dataSource.ssl_config ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Encryption</span>
                        <Badge variant={dataSource.encryption_enabled ? "default" : "secondary"}>
                          {dataSource.encryption_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Access Control</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Information</CardTitle>
                    <CardDescription>System configuration details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Database Type</span>
                        <span className="font-medium">{dataSource.source_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Version</span>
                        <span className="font-medium">N/A</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Backup</span>
                        <span className="font-medium">
                          {dataSource.last_backup ? new Date(dataSource.last_backup).toLocaleDateString() : "Never"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Scan</span>
                        <span className="font-medium">
                          {dataSource.next_scan ? new Date(dataSource.next_scan).toLocaleDateString() : "Not Scheduled"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Health Recommendations */}
        {health?.recommendations && health.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Health Recommendations</CardTitle>
              <CardDescription>Suggested actions to improve system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {health.recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}