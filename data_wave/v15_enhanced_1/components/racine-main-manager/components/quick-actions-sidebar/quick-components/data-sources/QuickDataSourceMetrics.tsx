'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Activity, Database, RefreshCw, Download, Calendar, Clock, Zap, Target, Gauge, Timer, Signal, Cpu, HardDrive, Network, Users, Eye, Settings, Filter, ArrowUp, ArrowDown, AlertTriangle, CheckCircle2, Info, LineChart, PieChart, BarChart, Area, Layers, Globe, Server, Shield } from 'lucide-react'
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
  DataSourceMetrics,
  PerformanceMetrics,
  UsageStatistics,
  MetricPoint,
  TimeRange,
  MetricType,
  AggregationMethod,
  MetricTrend,
  PerformanceReport,
  MetricAlert,
  MetricThreshold
} from '../../../../types/racine-core.types'

// Import utilities (already implemented and validated)
import { 
  formatTimestamp,
  formatDuration,
  formatFileSize,
  formatLatency,
  formatThroughput,
  formatPercent,
  formatNumber
} from '../../../../utils/formatting-utils'
import {
  calculateMetricTrend,
  aggregateMetrics,
  analyzePerformancePattern,
  generateMetricReport,
  detectAnomalies,
  predictMetricTrend,
  calculateMetricScore,
  normalizeMetricValue
} from '../../../../utils/metrics-analytics-utils'

// Metric configurations
const METRIC_TYPES = {
  performance: {
    id: 'performance',
    label: 'Performance',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    metrics: ['latency', 'throughput', 'response_time', 'cpu_usage', 'memory_usage']
  },
  usage: {
    id: 'usage',
    label: 'Usage',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    metrics: ['connections', 'queries', 'data_transfer', 'active_users']
  },
  reliability: {
    id: 'reliability',
    label: 'Reliability',
    icon: CheckCircle2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    metrics: ['uptime', 'error_rate', 'availability', 'failover_count']
  },
  security: {
    id: 'security',
    label: 'Security',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    metrics: ['authentication_rate', 'failed_logins', 'security_events', 'compliance_score']
  }
} as const

// Time range configurations
const TIME_RANGES = {
  '1h': { label: '1 Hour', value: '1h', duration: 3600000 },
  '24h': { label: '24 Hours', value: '24h', duration: 86400000 },
  '7d': { label: '7 Days', value: '7d', duration: 604800000 },
  '30d': { label: '30 Days', value: '30d', duration: 2592000000 },
  '90d': { label: '90 Days', value: '90d', duration: 7776000000 }
} as const

// Metric thresholds for performance scoring
const METRIC_THRESHOLDS = {
  latency: { excellent: 50, good: 100, warning: 500, critical: 1000 },
  throughput: { excellent: 1000, good: 500, warning: 100, critical: 50 },
  cpu_usage: { excellent: 30, good: 50, warning: 80, critical: 95 },
  memory_usage: { excellent: 40, good: 60, warning: 85, critical: 95 },
  error_rate: { excellent: 0.1, good: 1, warning: 5, critical: 10 },
  uptime: { excellent: 99.9, good: 99.5, warning: 99, critical: 95 }
} as const

interface QuickDataSourceMetricsProps {
  dataSourceId?: string
  defaultDataSource?: DataSource
  defaultMetricType?: keyof typeof METRIC_TYPES
  defaultTimeRange?: keyof typeof TIME_RANGES
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
  compactView?: boolean
  onMetricAlert?: (alert: MetricAlert) => void
  className?: string
}

export const QuickDataSourceMetrics: React.FC<QuickDataSourceMetricsProps> = ({
  dataSourceId,
  defaultDataSource,
  defaultMetricType = 'performance',
  defaultTimeRange = '24h',
  refreshInterval = 60000,
  enableRealTimeUpdates = true,
  compactView = false,
  onMetricAlert,
  className
}) => {
  // Core state management
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(defaultDataSource || null)
  const [availableDataSources, setAvailableDataSources] = useState<DataSource[]>([])
  const [selectedMetricType, setSelectedMetricType] = useState<keyof typeof METRIC_TYPES>(defaultMetricType)
  const [selectedTimeRange, setSelectedTimeRange] = useState<keyof typeof TIME_RANGES>(defaultTimeRange)
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('avg')

  const [metricsData, setMetricsData] = useState<DataSourceMetrics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [usageStatistics, setUsageStatistics] = useState<UsageStatistics | null>(null)
  const [metricHistory, setMetricHistory] = useState<MetricPoint[]>([])
  const [metricTrends, setMetricTrends] = useState<Record<string, MetricTrend>>({})
  const [metricAlerts, setMetricAlerts] = useState<MetricAlert[]>([])

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

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts' | 'reports'>('overview')
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [enablePredictions, setEnablePredictions] = useState(false)
  const [filterByThreshold, setFilterByThreshold] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set())

  // Custom hooks for comprehensive functionality
  const {
    getDataSources,
    getDataSourceById,
    getDataSourceMetrics,
    getDataSourceStats,
    getUsageStatistics
  } = useDataSources()

  const {
    getPerformanceMetrics,
    getMetricHistory,
    getMetricTrends,
    generatePerformanceReport
  } = useConnectionValidator()

  const {
    getCurrentUser,
    checkUserAccess
  } = useUserManagement()

  const {
    trackEvent,
    trackMetricAccess,
    getMetricAlerts
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

  // Load metrics data for selected data source
  const loadMetricsData = useCallback(async () => {
    if (!selectedDataSource) return

    setMonitoringState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const timeRange = TIME_RANGES[selectedTimeRange]
      const endTime = Date.now()
      const startTime = endTime - timeRange.duration

      const [metrics, performance, usage, history, trends, alerts] = await Promise.all([
        getDataSourceMetrics(selectedDataSource.id, selectedTimeRange),
        getPerformanceMetrics(selectedDataSource.id),
        getUsageStatistics(selectedDataSource.id, selectedTimeRange),
        getMetricHistory(selectedDataSource.id, startTime, endTime, aggregationMethod),
        getMetricTrends(selectedDataSource.id, selectedTimeRange),
        getMetricAlerts(selectedDataSource.id)
      ])

      setMetricsData(metrics)
      setPerformanceMetrics(performance)
      setUsageStatistics(usage)
      setMetricHistory(history || [])
      setMetricTrends(trends || {})
      setMetricAlerts(alerts || [])

      // Update monitoring state
      const now = Date.now()
      setMonitoringState(prev => ({
        ...prev,
        isLoading: false,
        lastUpdate: now,
        nextUpdate: now + refreshInterval
      }))

      // Track metric access
      await trackMetricAccess(selectedDataSource.id, {
        metricType: selectedMetricType,
        timeRange: selectedTimeRange,
        aggregation: aggregationMethod
      })

      // Process alerts
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
      if (criticalAlerts.length > 0 && onMetricAlert) {
        criticalAlerts.forEach(alert => onMetricAlert(alert))
      }

    } catch (error) {
      console.error('Failed to load metrics data:', error)
      setMonitoringState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load metrics: ${(error as Error).message}`
      }))

      showNotification({
        type: 'error',
        title: 'Metrics Loading Failed',
        message: 'Unable to retrieve data source metrics.',
        duration: 3000
      })
    }
  }, [
    selectedDataSource,
    selectedTimeRange,
    aggregationMethod,
    selectedMetricType,
    refreshInterval,
    onMetricAlert
  ])

  // Initial load and setup auto-refresh
  useEffect(() => {
    loadMetricsData()

    let intervalId: NodeJS.Timeout
    if (monitoringState.autoRefresh && refreshInterval > 0) {
      intervalId = setInterval(loadMetricsData, refreshInterval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [loadMetricsData, monitoringState.autoRefresh, refreshInterval])

  // Current metric type configuration
  const currentMetricType = useMemo(() => {
    return METRIC_TYPES[selectedMetricType]
  }, [selectedMetricType])

  // Calculate metric summary statistics
  const metricSummary = useMemo(() => {
    if (!metricsData || !performanceMetrics) return null

    const summary = {
      totalQueries: usageStatistics?.totalQueries || 0,
      avgLatency: performanceMetrics.avgResponseTime || 0,
      throughput: performanceMetrics.throughput || 0,
      errorRate: performanceMetrics.errorRate || 0,
      uptime: metricsData.uptime || 0,
      performance: calculateMetricScore(performanceMetrics),
      trend: calculateMetricTrend(metricHistory, 'performance')
    }

    return summary
  }, [metricsData, performanceMetrics, usageStatistics, metricHistory])

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    await loadMetricsData()
    showNotification({
      type: 'info',
      title: 'Metrics Refreshed',
      message: 'Data source metrics have been updated.',
      duration: 2000
    })
  }, [loadMetricsData])

  // Toggle auto-refresh
  const handleToggleAutoRefresh = useCallback(() => {
    setMonitoringState(prev => ({
      ...prev,
      autoRefresh: !prev.autoRefresh
    }))
  }, [])

  // ArrowDownTrayIcon metrics report
  const handleDownloadReport = useCallback(async () => {
    if (!selectedDataSource || !metricsData) return

    try {
      const report = await generatePerformanceReport(selectedDataSource.id, {
        timeRange: selectedTimeRange,
        metricType: selectedMetricType,
        includeHistory: true,
        includePredictions: enablePredictions
      })

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `metrics-report-${selectedDataSource.name}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showNotification({
        type: 'success',
        title: 'Report Downloaded',
        message: 'Metrics report has been downloaded successfully.',
        duration: 3000
      })
    } catch (error) {
      console.error('Failed to download report:', error)
      showNotification({
        type: 'error',
        title: 'ArrowDownTrayIcon Failed',
        message: 'Failed to generate metrics report.',
        duration: 3000
      })
    }
  }, [selectedDataSource, metricsData, selectedTimeRange, selectedMetricType, enablePredictions])

  // Render metric card
  const renderMetricCard = (title: string, value: number | string, icon: React.ComponentType<any>, trend?: MetricTrend, unit?: string) => {
    const IconComponent = icon
    const formattedValue = typeof value === 'number' && unit ? `${formatNumber(value)}${unit}` : value
    
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formattedValue}</div>
                <div className="text-sm text-muted-foreground">{title}</div>
              </div>
            </div>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-sm",
                trend.direction === 'up' ? "text-green-600" : 
                trend.direction === 'down' ? "text-red-600" : "text-gray-600"
              )}>
                {trend.direction === 'up' ? (
                  <ArrowUp className="w-4 h-4" />
                ) : trend.direction === 'down' ? (
                  <ArrowDown className="w-4 h-4" />
                ) : null}
                <span>{Math.abs(trend.change)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render metric threshold indicator
  const renderThresholdIndicator = (value: number, thresholds: any, label: string) => {
    const getThresholdStatus = (val: number, thresh: any) => {
      if (val <= thresh.excellent) return 'excellent'
      if (val <= thresh.good) return 'good'
      if (val <= thresh.warning) return 'warning'
      return 'critical'
    }

    const status = getThresholdStatus(value, thresholds)
    const statusColors = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500'
    }

    const statusLabels = {
      excellent: 'Excellent',
      good: 'Good',
      warning: 'Warning',
      critical: 'Critical'
    }

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm">{formatNumber(value)}</span>
          <Badge 
            variant="secondary" 
            className={cn("text-white", statusColors[status])}
          >
            {statusLabels[status]}
          </Badge>
        </div>
      </div>
    )
  }

  // Render simple chart visualization (placeholder for actual chart library)
  const renderSimpleChart = (data: MetricPoint[], title: string) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end justify-between gap-1">
            {data.slice(-20).map((point, index) => {
              const height = ((point.value - minValue) / (maxValue - minValue)) * 100
              return (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <div
                      className="bg-blue-500 rounded-sm flex-1 transition-all duration-300 min-h-[2px]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div>{formatNumber(point.value)}</div>
                      <div>{formatTimestamp(point.timestamp, true)}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Min: {formatNumber(minValue)}</span>
            <span>Max: {formatNumber(maxValue)}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedDataSource) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Data Source Selected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a data source to view its metrics
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
        className={cn("space-y-6", compactView ? "max-w-2xl" : "max-w-6xl", className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Data Source Metrics</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDataSource.name} • {currentMetricType.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              <TooltipContent>Refresh Metrics</TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Report
            </Button>
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
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Metrics Error</AlertTitle>
                <AlertDescription>{monitoringState.error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Metric Type</Label>
                <Select value={selectedMetricType} onValueChange={setSelectedMetricType as any}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METRIC_TYPES).map(([key, type]) => {
                      const IconComponent = type.icon
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <IconComponent className={cn("w-4 h-4", type.color)} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange as any}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIME_RANGES).map(([key, range]) => (
                      <SelectItem key={key} value={key}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aggregation</Label>
                <Select value={aggregationMethod} onValueChange={setAggregationMethod as any}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={monitoringState.autoRefresh}
                    onCheckedChange={handleToggleAutoRefresh}
                  />
                  <Label htmlFor="auto-refresh" className="text-xs">Auto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="predictions"
                    checked={enablePredictions}
                    onCheckedChange={setEnablePredictions}
                  />
                  <Label htmlFor="predictions" className="text-xs">Predict</Label>
                </div>
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

        {/* Key Metrics Overview */}
        {metricSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderMetricCard(
              'Total Queries',
              metricSummary.totalQueries,
              Database,
              metricTrends.queries
            )}
            {renderMetricCard(
              'Avg Latency',
              formatLatency(metricSummary.avgLatency),
              Timer,
              metricTrends.latency
            )}
            {renderMetricCard(
              'Throughput',
              metricSummary.throughput,
              Zap,
              metricTrends.throughput,
              '/s'
            )}
            {renderMetricCard(
              'Uptime',
              formatPercent(metricSummary.uptime),
              CheckCircle2,
              metricTrends.uptime
            )}
          </div>
        )}

        {/* Detailed Metrics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab as any}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Performance Thresholds */}
            {performanceMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {renderThresholdIndicator(
                    performanceMetrics.avgResponseTime || 0,
                    METRIC_THRESHOLDS.latency,
                    'Average Latency (ms)'
                  )}
                  {renderThresholdIndicator(
                    performanceMetrics.cpuUsage || 0,
                    METRIC_THRESHOLDS.cpu_usage,
                    'CPU Usage (%)'
                  )}
                  {renderThresholdIndicator(
                    performanceMetrics.memoryUsage || 0,
                    METRIC_THRESHOLDS.memory_usage,
                    'HardDrive Usage (%)'
                  )}
                  {renderThresholdIndicator(
                    performanceMetrics.errorRate || 0,
                    METRIC_THRESHOLDS.error_rate,
                    'Error Rate (%)'
                  )}
                </CardContent>
              </Card>
            )}

            {/* Current Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMetricType.metrics.map((metric) => {
                const metricData = metricHistory.filter(point => point.metric === metric)
                return renderSimpleChart(metricData, `${metric.replace('_', ' ')} Trend`)
              })}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(metricTrends).map(([metric, trend]) => (
                <Card key={metric}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize">
                      {metric.replace('_', ' ')} Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {trend.direction === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : trend.direction === 'down' ? (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="font-medium">{Math.abs(trend.change)}% change</span>
                      </div>
                      <Badge 
                        variant={trend.direction === 'up' ? 'default' : 'secondary'}
                        className={cn(
                          trend.direction === 'up' ? 'bg-green-100 text-green-800' :
                          trend.direction === 'down' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        )}
                      >
                        {trend.direction === 'up' ? 'Increasing' : 
                         trend.direction === 'down' ? 'Decreasing' : 'Stable'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {trend.description || `${metric} has been ${trend.direction === 'stable' ? 'stable' : trend.direction === 'up' ? 'increasing' : 'decreasing'} over the selected time period.`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Metric Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {metricAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-medium mb-2">No Active Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      All metrics are within acceptable thresholds.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metricAlerts.map((alert, index) => (
                      <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Info className="w-4 h-4" />
                        )}
                        <AlertTitle>
                          {alert.severity === 'critical' ? 'Critical Alert' : 'Warning Alert'}
                        </AlertTitle>
                        <AlertDescription>
                          <div>{alert.message}</div>
                          <div className="text-xs mt-1">
                            Metric: {alert.metric} • Threshold: {alert.threshold} • Current: {alert.currentValue}
                          </div>
                          <div className="text-xs">
                            {formatTimestamp(alert.timestamp)}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metric Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <LineChart className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">Performance Report</div>
                        <div className="text-xs text-muted-foreground">
                          Detailed performance analysis
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <BarChart className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">Usage Report</div>
                        <div className="text-xs text-muted-foreground">
                          Usage patterns and statistics
                        </div>
                      </div>
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include Predictions</span>
                    <Switch
                      checked={enablePredictions}
                      onCheckedChange={setEnablePredictions}
                    />
                  </div>

                  <Button onClick={handleDownloadReport} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    ArrowDownTrayIcon Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </TooltipProvider>
  )
}

export default QuickDataSourceMetrics
