'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertCircle, CheckCircle2, Clock, Database, RefreshCw, TrendingUp, TrendingDown, Zap, WifiOff, Signal, AlertTriangle, Heart, Monitor, BarChart3, Timer, Target, Gauge, Cpu, HardDrive, Network, Server, Globe, Eye, Settings, Filter, Calendar, MapPin, Shield, Lock, Key, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Import foundation layers (100% backend integration)
import { useDataSources } from '../../../../hooks/useDataSources'
import { useConnectionValidator } from '../../../../hooks/useConnectionValidator'
import { useUserManagement } from '../../../../hooks/useUserManagement'
import { useActivityTracker } from '../../../../hooks/useActivityTracker'
import { useNotificationManager } from '../../../../hooks/useNotificationManager'
import { useRacineOrchestration } from '../../../../hooks/useRacineOrchestration'

// Import types (already implemented and validated)
import {
  DataSource,
  DataSourceHealth,
  HealthStatus,
  PerformanceMetrics,
  ConnectionPool,
  SecurityStatus,
  DataSourceStats,
  HealthCheck,
  AlertLevel,
  StatusHistory
} from '../../../../types/racine-core.types'

// Import utilities (already implemented and validated)
import { 
  formatTimestamp,
  formatDuration,
  formatFileSize,
  formatLatency,
  formatThroughput,
  formatPercent
} from '../../../../utils/formatting-utils'
import {
  calculateHealthScore,
  determineHealthStatus,
  analyzePerformanceTrends,
  generateHealthReport,
  getHealthColorScheme,
  classifyHealthIssues
} from '../../../../utils/health-monitoring-utils'

// Health status configurations
const HEALTH_STATUS_CONFIG = {
  healthy: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200',
    icon: CheckCircle2,
    label: 'Healthy',
    description: 'All systems operational'
  },
  warning: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    icon: AlertTriangle,
    label: 'Warning',
    description: 'Some issues detected'
  },
  critical: {
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200',
    icon: AlertCircle,
    label: 'Critical',
    description: 'Immediate attention required'
  },
  unknown: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    icon: Clock,
    label: 'Unknown',
    description: 'Status unavailable'
  },
  offline: {
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    icon: WifiOff,
    label: 'Offline',
    description: 'Not responding'
  }
} as const

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  latency: { good: 100, warning: 500, critical: 1000 },
  cpu: { good: 70, warning: 85, critical: 95 },
  memory: { good: 80, warning: 90, critical: 95 },
  connections: { good: 70, warning: 85, critical: 95 },
  throughput: { good: 80, warning: 90, critical: 95 }
} as const

interface QuickDataSourceStatusProps {
  dataSourceId?: string
  defaultDataSource?: DataSource
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
  showDetailedMetrics?: boolean
  compactView?: boolean
  onStatusChange?: (status: HealthStatus) => void
  className?: string
}

export const QuickDataSourceStatus: React.FC<QuickDataSourceStatusProps> = ({
  dataSourceId,
  defaultDataSource,
  refreshInterval = 30000,
  enableRealTimeUpdates = true,
  showDetailedMetrics = false,
  compactView = false,
  onStatusChange,
  className
}) => {
  // Core state management
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(defaultDataSource || null)
  const [availableDataSources, setAvailableDataSources] = useState<DataSource[]>([])
  const [healthData, setHealthData] = useState<DataSourceHealth | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [connectionPool, setConnectionPool] = useState<ConnectionPool | null>(null)
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])

  const [monitoringState, setMonitoringState] = useState<{
    isLoading: boolean
    lastUpdate: number | null
    nextUpdate: number | null
    error: string | null
    autoRefresh: boolean
  }>({
    isLoading: false,
    lastUpdate: null,
    nextUpdate: null,
    error: null,
    autoRefresh: enableRealTimeUpdates
  })

  const [alerts, setAlerts] = useState<Array<{
    id: string
    level: AlertLevel
    message: string
    timestamp: number
    resolved: boolean
  }>>([])

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'security' | 'history'>('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('1h')
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(showDetailedMetrics)
  const [filterCritical, setFilterCritical] = useState(false)

  // Custom hooks for comprehensive functionality
  const {
    getDataSources,
    getDataSourceById,
    getDataSourceHealth,
    getDataSourceStats,
    getConnectionPool,
    getDataSourceAlerts
  } = useDataSources()

  const {
    checkConnectionHealth,
    getPerformanceMetrics,
    getSecurityStatus,
    runHealthCheck
  } = useConnectionValidator()

  const {
    getCurrentUser,
    checkUserAccess
  } = useUserManagement()

  const {
    trackEvent,
    trackHealthCheck,
    getHealthHistory
  } = useActivityTracker()

  const {
    showNotification
  } = useNotificationManager()

  const {
    getSystemMetrics,
    optimizePerformance
  } = useRacineOrchestration()

  // Load available data sources
  useEffect(() => {
    const loadDataSources = async () => {
      try {
        const dataSources = await getDataSources()
        setAvailableDataSources(dataSources.filter(ds => ds.isActive))

        // Auto-select data source if provided
        if (dataSourceId && !selectedDataSource) {
          const dataSource = await getDataSourceById(dataSourceId)
          if (dataSource) {
            setSelectedDataSource(dataSource)
          }
        }
      } catch (error) {
        console.error('Failed to load data sources:', error)
        setMonitoringState(prev => ({
          ...prev,
          error: 'Failed to load data sources'
        }))
      }
    }

    loadDataSources()
  }, [dataSourceId, selectedDataSource])

  // Load health data for selected data source
  const loadHealthData = useCallback(async () => {
    if (!selectedDataSource) return

    setMonitoringState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [health, metrics, pool, security, alerts, history] = await Promise.all([
        getDataSourceHealth(selectedDataSource.id),
        getPerformanceMetrics(selectedDataSource.id),
        getConnectionPool(selectedDataSource.id),
        getSecurityStatus(selectedDataSource.id),
        getDataSourceAlerts(selectedDataSource.id),
        getHealthHistory(selectedDataSource.id, selectedTimeRange)
      ])

      setHealthData(health)
      setPerformanceMetrics(metrics)
      setConnectionPool(pool)
      setSecurityStatus(security)
      setAlerts(alerts || [])
      setStatusHistory(history || [])

      // Update monitoring state
      const now = Date.now()
      setMonitoringState(prev => ({
        ...prev,
        isLoading: false,
        lastUpdate: now,
        nextUpdate: now + refreshInterval
      }))

      // Track health check
      await trackHealthCheck(selectedDataSource.id, {
        status: health.status,
        score: health.score,
        issues: health.issues.length
      })

      // Call status change callback
      if (onStatusChange) {
        onStatusChange(health.status)
      }

    } catch (error) {
      console.error('Failed to load health data:', error)
      setMonitoringState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load health data: ${(error as Error).message}`
      }))

      showNotification({
        type: 'error',
        title: 'Health Check Failed',
        message: 'Unable to retrieve data source health information.',
        duration: 3000
      })
    }
  }, [selectedDataSource, selectedTimeRange, refreshInterval, onStatusChange])

  // Initial load and setup auto-refresh
  useEffect(() => {
    loadHealthData()

    let intervalId: NodeJS.Timeout
    if (monitoringState.autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(loadHealthData, refreshInterval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [loadHealthData, monitoringState.autoRefresh, refreshInterval])

  // Calculate overall health score
  const overallHealthScore = useMemo(() => {
    if (!healthData || !performanceMetrics) return 0

    const healthScore = healthData.score || 0
    const performanceScore = calculateHealthScore(performanceMetrics)
    const securityScore = securityStatus?.score || 100

    return Math.round((healthScore + performanceScore + securityScore) / 3)
  }, [healthData, performanceMetrics, securityStatus])

  // Determine current health status
  const currentHealthStatus = useMemo(() => {
    if (!healthData) return 'unknown'
    return healthData.status
  }, [healthData])

  // Get status configuration
  const statusConfig = useMemo(() => {
    return HEALTH_STATUS_CONFIG[currentHealthStatus as keyof typeof HEALTH_STATUS_CONFIG]
  }, [currentHealthStatus])

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    await loadHealthData()
    showNotification({
      type: 'info',
      title: 'Status Refreshed',
      message: 'Data source status has been updated.',
      duration: 2000
    })
  }, [loadHealthData])

  // Toggle auto-refresh
  const handleToggleAutoRefresh = useCallback(() => {
    setMonitoringState(prev => ({
      ...prev,
      autoRefresh: !prev.autoRefresh
    }))
  }, [])

  // Run manual health check
  const handleRunHealthCheck = useCallback(async () => {
    if (!selectedDataSource) return

    try {
      setMonitoringState(prev => ({ ...prev, isLoading: true }))
      
      const healthCheck = await runHealthCheck(selectedDataSource.id)
      setHealthChecks(prev => [healthCheck, ...prev.slice(0, 9)]) // Keep last 10 checks
      
      await loadHealthData()

      showNotification({
        type: 'success',
        title: 'Health Check Complete',
        message: `Health score: ${healthCheck.score}%`,
        duration: 3000
      })
    } catch (error) {
      console.error('Health check failed:', error)
      showNotification({
        type: 'error',
        title: 'Health Check Failed',
        message: 'Unable to perform health check.',
        duration: 3000
      })
    }
  }, [selectedDataSource, loadHealthData])

  // Render status indicator
  const renderStatusIndicator = () => {
    const IconComponent = statusConfig.icon
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border",
        statusConfig.bg,
        statusConfig.border
      )}>
        <IconComponent className={cn("w-4 h-4", statusConfig.color)} />
        <div>
          <div className={cn("font-medium text-sm", statusConfig.color)}>
            {statusConfig.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {statusConfig.description}
          </div>
        </div>
      </div>
    )
  }

  // Render performance metric
  const renderMetric = (
    label: string,
    value: number,
    threshold: { good: number; warning: number; critical: number },
    unit: string = '%',
    format?: (value: number) => string
  ) => {
    const formattedValue = format ? format(value) : `${value}${unit}`
    const status = value <= threshold.good ? 'good' : 
                 value <= threshold.warning ? 'warning' : 'critical'
    
    const statusColors = {
      good: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    }

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("font-medium", statusColors[status])}>
          {formattedValue}
        </span>
      </div>
    )
  }

  // Render alerts summary
  const renderAlertsSection = () => {
    const criticalAlerts = alerts.filter(alert => alert.level === 'critical' && !alert.resolved)
    const warningAlerts = alerts.filter(alert => alert.level === 'warning' && !alert.resolved)

    if (criticalAlerts.length === 0 && warningAlerts.length === 0) {
      return (
        <Alert>
          <CheckCircle2 className="w-4 h-4" />
          <AlertTitle>No Active Alerts</AlertTitle>
          <AlertDescription>All systems are operating normally.</AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="space-y-2">
        {criticalAlerts.map((alert) => (
          <Alert key={alert.id} variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Critical Alert</AlertTitle>
            <AlertDescription>
              {alert.message}
              <div className="text-xs mt-1">
                {formatTimestamp(alert.timestamp)}
              </div>
            </AlertDescription>
          </Alert>
        ))}
        {warningAlerts.map((alert) => (
          <Alert key={alert.id}>
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              {alert.message}
              <div className="text-xs mt-1">
                {formatTimestamp(alert.timestamp)}
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>
    )
  }

  if (!selectedDataSource) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Data Source Selected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a data source to view its health status
            </p>
            <Select
              value=""
              onValueChange={(value) => {
                const ds = availableDataSources.find(ds => ds.id === value)
                setSelectedDataSource(ds || null)
              }}
            >
              <SelectTrigger className="max-w-xs mx-auto">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {availableDataSources.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span>{ds.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {ds.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("space-y-6", compactView ? "max-w-md" : "max-w-4xl", className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Data Source Status</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDataSource.name} • {selectedDataSource.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStatusIndicator()}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={monitoringState.isLoading}
                >
                  <RefreshCw className={cn(
                    "w-4 h-4",
                    monitoringState.isLoading && "animate-spin"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Status</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {monitoringState.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Monitoring Error</AlertTitle>
                <AlertDescription>{monitoringState.error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{overallHealthScore}%</div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Signal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {performanceMetrics?.avgResponseTime ? 
                      formatLatency(performanceMetrics.avgResponseTime) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {connectionPool?.active || 0}/{connectionPool?.total || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={monitoringState.autoRefresh}
                    onCheckedChange={handleToggleAutoRefresh}
                  />
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-metrics"
                    checked={showAdvancedMetrics}
                    onCheckedChange={setShowAdvancedMetrics}
                  />
                  <Label htmlFor="advanced-metrics">Advanced Metrics</Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange as any}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleRunHealthCheck}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Health Check
                </Button>
              </div>
            </div>

            {monitoringState.lastUpdate && (
              <div className="mt-3 text-xs text-muted-foreground">
                Last updated: {formatTimestamp(monitoringState.lastUpdate, true)}
                {monitoringState.nextUpdate && monitoringState.autoRefresh && (
                  <span className="ml-4">
                    Next update: {formatDuration(monitoringState.nextUpdate - Date.now())}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab as any}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Alerts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {renderAlertsSection()}
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            {performanceMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {renderMetric('CPU Usage', performanceMetrics.cpuUsage || 0, PERFORMANCE_THRESHOLDS.cpu)}
                  {renderMetric('HardDrive Usage', performanceMetrics.memoryUsage || 0, PERFORMANCE_THRESHOLDS.memory)}
                  {renderMetric('Connection Pool', ((connectionPool?.active || 0) / (connectionPool?.total || 1)) * 100, PERFORMANCE_THRESHOLDS.connections)}
                  {renderMetric('Average Latency', performanceMetrics.avgResponseTime || 0, PERFORMANCE_THRESHOLDS.latency, 'ms', formatLatency)}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {performanceMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{formatPercent(performanceMetrics.cpuUsage || 0)}</span>
                      </div>
                      <Progress value={performanceMetrics.cpuUsage || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>HardDrive Usage</span>
                        <span>{formatPercent(performanceMetrics.memoryUsage || 0)}</span>
                      </div>
                      <Progress value={performanceMetrics.memoryUsage || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Disk Usage</span>
                        <span>{formatPercent(performanceMetrics.diskUsage || 0)}</span>
                      </div>
                      <Progress value={performanceMetrics.diskUsage || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Connection Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Connections</span>
                      <span className="font-medium">{connectionPool?.active || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Pool Size</span>
                      <span className="font-medium">{connectionPool?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Idle Connections</span>
                      <span className="font-medium">{(connectionPool?.total || 0) - (connectionPool?.active || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Peak Connections</span>
                      <span className="font-medium">{connectionPool?.peak || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {securityStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className={cn(
                        "w-4 h-4",
                        securityStatus.sslEnabled ? "text-green-500" : "text-red-500"
                      )} />
                      <span className="text-sm">SSL/TLS</span>
                      <Badge variant={securityStatus.sslEnabled ? "default" : "destructive"}>
                        {securityStatus.sslEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className={cn(
                        "w-4 h-4",
                        securityStatus.encryptionEnabled ? "text-green-500" : "text-red-500"
                      )} />
                      <span className="text-sm">Encryption</span>
                      <Badge variant={securityStatus.encryptionEnabled ? "default" : "destructive"}>
                        {securityStatus.encryptionEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Security Score</span>
                      <span className="font-medium">{securityStatus.score}%</span>
                    </div>
                    <Progress value={securityStatus.score} className="h-2" />
                  </div>

                  {securityStatus.lastAudit && (
                    <div className="text-xs text-muted-foreground">
                      Last security audit: {formatTimestamp(securityStatus.lastAudit)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Health History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {statusHistory.map((entry, index) => {
                      const entryStatusConfig = HEALTH_STATUS_CONFIG[entry.status as keyof typeof HEALTH_STATUS_CONFIG]
                      const IconComponent = entryStatusConfig.icon
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                          <IconComponent className={cn("w-4 h-4", entryStatusConfig.color)} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{entryStatusConfig.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(entry.timestamp)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Score: {entry.score}% • Duration: {formatDuration(entry.duration || 0)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </TooltipProvider>
  )
}

export default QuickDataSourceStatus
