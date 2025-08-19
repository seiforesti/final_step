"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Gauge,
  TrendingUp,
  TrendingDown,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  Pause,
  Play,
  Settings,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Server,
  HardDrive,
  Cpu,
  Network,
  AlertCircle,
  Info,
  XCircle,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DataSource } from "./types"

interface DataSourceMonitoringProps {
  dataSource: DataSource
  health?: any
  metrics?: any
  connectionPoolStats?: any
}

interface MetricData {
  timestamp: string
  value: number
  status: "normal" | "warning" | "critical"
}

interface RealTimeMetrics {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_io: number
  connection_count: number
  query_rate: number
  error_rate: number
  response_time: number
  throughput: number
  availability: number
}

export function DataSourceMonitoring({
  dataSource,
  health,
  metrics,
  connectionPoolStats
}: DataSourceMonitoringProps) {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    cpu_usage: 45,
    memory_usage: 68,
    disk_usage: 32,
    network_io: 156,
    connection_count: 24,
    query_rate: 1250,
    error_rate: 0.2,
    response_time: 85,
    throughput: 2340,
    availability: 99.8
  })

  // Simulate real-time data updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        cpu_usage: Math.max(0, Math.min(100, prev.cpu_usage + (Math.random() - 0.5) * 10)),
        memory_usage: Math.max(0, Math.min(100, prev.memory_usage + (Math.random() - 0.5) * 8)),
        disk_usage: Math.max(0, Math.min(100, prev.disk_usage + (Math.random() - 0.5) * 2)),
        network_io: Math.max(0, prev.network_io + (Math.random() - 0.5) * 50),
        connection_count: Math.max(0, Math.round(prev.connection_count + (Math.random() - 0.5) * 6)),
        query_rate: Math.max(0, Math.round(prev.query_rate + (Math.random() - 0.5) * 200)),
        error_rate: Math.max(0, Math.min(100, prev.error_rate + (Math.random() - 0.5) * 0.1)),
        response_time: Math.max(0, Math.round(prev.response_time + (Math.random() - 0.5) * 20)),
        throughput: Math.max(0, Math.round(prev.throughput + (Math.random() - 0.5) * 300)),
        availability: Math.max(95, Math.min(100, prev.availability + (Math.random() - 0.5) * 0.2))
      }))
    }, parseInt(refreshInterval) * 1000)

    return () => clearInterval(interval)
  }, [isMonitoring, refreshInterval])

  const getStatusColor = (value: number, thresholds: { warning: number, critical: number }, inverse = false) => {
    if (inverse) {
      if (value < thresholds.critical) return "text-red-500"
      if (value < thresholds.warning) return "text-yellow-500"
      return "text-green-500"
    } else {
      if (value > thresholds.critical) return "text-red-500"
      if (value > thresholds.warning) return "text-yellow-500"
      return "text-green-500"
    }
  }

  const getStatusIcon = (value: number, thresholds: { warning: number, critical: number }, inverse = false) => {
    if (inverse) {
      if (value < thresholds.critical) return XCircle
      if (value < thresholds.warning) return AlertTriangle
      return CheckCircle
    } else {
      if (value > thresholds.critical) return XCircle
      if (value > thresholds.warning) return AlertTriangle
      return CheckCircle
    }
  }

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    trend, 
    thresholds, 
    inverse = false 
  }: {
    title: string
    value: number
    unit: string
    icon: any
    trend?: number
    thresholds: { warning: number, critical: number }
    inverse?: boolean
  }) => {
    const statusColor = getStatusColor(value, thresholds, inverse)
    const StatusIcon = getStatusIcon(value, thresholds, inverse)
    const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {typeof value === "number" ? value.toFixed(1) : value}
                <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
              </div>
              {trend !== undefined && (
                <div className={`flex items-center text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {Math.abs(trend).toFixed(1)}%
                </div>
              )}
            </div>
            <StatusIcon className={`h-5 w-5 ${statusColor}`} />
          </div>
          {title.toLowerCase().includes("usage") && (
            <Progress 
              value={value} 
              className="mt-2 h-2" 
              indicatorClassName={
                value > thresholds.critical ? "bg-red-500" :
                value > thresholds.warning ? "bg-yellow-500" : "bg-green-500"
              }
            />
          )}
        </CardContent>
      </Card>
    )
  }

  const ConnectionStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dataSource.status === "connected" ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium">{dataSource.name}</span>
          </div>
          <Badge variant={dataSource.status === "connected" ? "default" : "destructive"}>
            {dataSource.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Host:</span>
            <div className="font-medium">{dataSource.host}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Port:</span>
            <div className="font-medium">{dataSource.port}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Database:</span>
            <div className="font-medium">{dataSource.database_name || "N/A"}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <div className="font-medium">{dataSource.type}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uptime</span>
            <span className="font-medium">99.8%</span>
          </div>
          <Progress value={99.8} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )

  const AlertsPanel = () => {
    const alerts = [
      {
        id: 1,
        level: "warning",
        message: "High memory usage detected",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        resolved: false
      },
      {
        id: 2,
        level: "info",
        message: "Connection pool optimized",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        resolved: true
      },
      {
        id: 3,
        level: "critical",
        message: "Query timeout threshold exceeded",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        resolved: true
      }
    ]

    const getAlertIcon = (level: string) => {
      switch (level) {
        case "critical": return XCircle
        case "warning": return AlertTriangle
        case "info": return Info
        default: return Info
      }
    }

    const getAlertColor = (level: string) => {
      switch (level) {
        case "critical": return "text-red-500"
        case "warning": return "text-yellow-500"
        case "info": return "text-blue-500"
        default: return "text-gray-500"
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.level)
              const alertColor = getAlertColor(alert.level)
              
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.resolved ? "opacity-60" : ""
                }`}>
                  <AlertIcon className={`h-4 w-4 mt-0.5 ${alertColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant={alert.resolved ? "outline" : "secondary"}>
                    {alert.resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Monitoring</h2>
          <p className="text-muted-foreground">
            Live performance metrics for {dataSource.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="monitoring-toggle">Live Updates</Label>
            <Switch
              id="monitoring-toggle"
              checked={isMonitoring}
              onCheckedChange={setIsMonitoring}
            />
          </div>
          
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {dataSource.status !== "connected" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            Data source is currently {dataSource.status}. Some metrics may not be available.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="CPU Usage"
              value={realTimeMetrics.cpu_usage}
              unit="%"
              icon={Cpu}
              trend={2.1}
              thresholds={{ warning: 70, critical: 90 }}
            />
            <MetricCard
              title="Memory Usage"
              value={realTimeMetrics.memory_usage}
              unit="%"
              icon={HardDrive}
              trend={-1.3}
              thresholds={{ warning: 80, critical: 95 }}
            />
            <MetricCard
              title="Query Rate"
              value={realTimeMetrics.query_rate}
              unit="qps"
              icon={Activity}
              trend={5.2}
              thresholds={{ warning: 2000, critical: 3000 }}
            />
            <MetricCard
              title="Response Time"
              value={realTimeMetrics.response_time}
              unit="ms"
              icon={Zap}
              trend={-0.8}
              thresholds={{ warning: 100, critical: 200 }}
            />
          </div>

          {/* Connection Status and Alerts */}
          <div className="grid gap-6 md:grid-cols-2">
            <ConnectionStatus />
            <AlertsPanel />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Throughput"
              value={realTimeMetrics.throughput}
              unit="ops/sec"
              icon={TrendingUp}
              trend={3.2}
              thresholds={{ warning: 3000, critical: 4000 }}
            />
            <MetricCard
              title="Error Rate"
              value={realTimeMetrics.error_rate}
              unit="%"
              icon={AlertTriangle}
              trend={0.1}
              thresholds={{ warning: 1, critical: 5 }}
            />
            <MetricCard
              title="Availability"
              value={realTimeMetrics.availability}
              unit="%"
              icon={CheckCircle}
              trend={0.02}
              thresholds={{ warning: 99, critical: 95 }}
              inverse={true}
            />
          </div>

          {/* Performance Charts Placeholder */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Response Time Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Real-time response time data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-8 w-8 mx-auto mb-2" />
                    <p>Pie chart visualization would go here</p>
                    <p className="text-sm">CPU, Memory, Disk usage breakdown</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Active Connections"
              value={realTimeMetrics.connection_count}
              unit="connections"
              icon={Network}
              trend={1.2}
              thresholds={{ warning: 50, critical: 80 }}
            />
            <MetricCard
              title="Pool Utilization"
              value={75}
              unit="%"
              icon={Database}
              trend={-2.1}
              thresholds={{ warning: 80, critical: 95 }}
            />
            <MetricCard
              title="Network I/O"
              value={realTimeMetrics.network_io}
              unit="MB/s"
              icon={Activity}
              trend={4.3}
              thresholds={{ warning: 200, critical: 300 }}
            />
          </div>

          {/* Connection Pool Details */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Pool Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pool Size</span>
                    <span className="font-medium">50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-medium">{realTimeMetrics.connection_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Idle</span>
                    <span className="font-medium">{50 - realTimeMetrics.connection_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Waiting</span>
                    <span className="font-medium">2</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Lifetime</span>
                    <span className="font-medium">30 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Idle Timeout</span>
                    <span className="font-medium">10 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Validation Query</span>
                    <span className="font-medium">SELECT 1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Health Check</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Alert Configuration</h3>
            <div className="flex items-center space-x-2">
              <Label htmlFor="alerts-toggle">Enable Alerts</Label>
              <Switch
                id="alerts-toggle"
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
            </div>
          </div>

          <AlertsPanel />

          {/* Alert Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>
                Configure when alerts should be triggered for various metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>CPU Usage Warning (%)</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground w-8">70%</span>
                      <div className="flex-1 border rounded p-2 text-sm">Warning threshold</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>CPU Usage Critical (%)</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground w-8">90%</span>
                      <div className="flex-1 border rounded p-2 text-sm">Critical threshold</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure All Thresholds
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}