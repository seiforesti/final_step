"use client"

import { useState, useEffect, useMemo } from "react"
import { TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Activity, Database, Users, Clock, Calendar, Target, Zap, ArrowUp, ArrowDown, ArrowRight, Minus, Growth, Scale, Timer, FileText, DollarSign, Percent, Eye, Download, RefreshCw, Filter, Settings, AlertTriangle, CheckCircle, Info, Star, ThumbsUp, ThumbsDown, Share2, Bookmark,  } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts"

import { DataSource, GrowthMetrics, GrowthTrend, GrowthPrediction } from "./types"
import {
  useGrowthMetricsQuery,
  useGrowthTrendsQuery,
  useGrowthPredictionsQuery,
  useUsageAnalyticsQuery,
  usePerformanceMetricsQuery,
} from "./services/apis"

interface DataSourceGrowthAnalyticsProps {
  dataSource: DataSource
}

export function DataSourceGrowthAnalytics({ dataSource }: DataSourceGrowthAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30d")
  const [metricType, setMetricType] = useState("all")
  const [predictionPeriod, setPredictionPeriod] = useState("90d")

  // Queries
  const { data: growthMetrics, isLoading: metricsLoading } = useGrowthMetricsQuery(dataSource.id, timeRange)
  const { data: growthTrends, isLoading: trendsLoading } = useGrowthTrendsQuery(dataSource.id, timeRange)
  const { data: growthPredictions, isLoading: predictionsLoading } = useGrowthPredictionsQuery(dataSource.id, predictionPeriod)
  const { data: usageAnalytics, isLoading: usageLoading } = useUsageAnalyticsQuery(dataSource.id, timeRange)
  const { data: performanceMetrics, isLoading: performanceLoading } = usePerformanceMetricsQuery(dataSource.id, timeRange)

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return "text-green-500"
    if (rate < 0) return "text-red-500"
    return "text-gray-500"
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toString()
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Processed data for charts
  const volumeGrowthData = useMemo(() => {
    if (!growthTrends) return []
    return growthTrends.map(trend => ({
      date: trend.date,
      volume: trend.data_volume_gb,
      queries: trend.query_count,
      users: trend.active_users,
    }))
  }, [growthTrends])

  const usageDistributionData = useMemo(() => {
    if (!usageAnalytics) return []
    return [
      { name: 'Queries', value: usageAnalytics.total_queries, color: COLORS[0] },
      { name: 'Reads', value: usageAnalytics.total_reads, color: COLORS[1] },
      { name: 'Writes', value: usageAnalytics.total_writes, color: COLORS[2] },
      { name: 'Updates', value: usageAnalytics.total_updates, color: COLORS[3] },
    ]
  }, [usageAnalytics])

  const performanceOverTimeData = useMemo(() => {
    if (!performanceMetrics) return []
    return performanceMetrics.map(metric => ({
      date: metric.date,
      avgResponseTime: metric.avg_response_time,
      throughput: metric.throughput,
      errorRate: metric.error_rate * 100,
    }))
  }, [performanceMetrics])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Growth Analytics</h2>
          <p className="text-muted-foreground">
            Track growth patterns and trends for {dataSource.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="volume">Volume Growth</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Data Volume</p>
                        <p className="text-2xl font-bold">{formatBytes(growthMetrics?.current_volume_bytes || 0)}</p>
                      </div>
                      <Database className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(growthMetrics?.volume_growth_rate || 0)}
                      <span className={`text-sm ml-1 ${getGrowthColor(growthMetrics?.volume_growth_rate || 0)}`}>
                        {formatPercentage(growthMetrics?.volume_growth_rate || 0)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">{formatNumber(growthMetrics?.active_users || 0)}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(growthMetrics?.user_growth_rate || 0)}
                      <span className={`text-sm ml-1 ${getGrowthColor(growthMetrics?.user_growth_rate || 0)}`}>
                        {formatPercentage(growthMetrics?.user_growth_rate || 0)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Query Volume</p>
                        <p className="text-2xl font-bold">{formatNumber(growthMetrics?.query_count || 0)}</p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(growthMetrics?.query_growth_rate || 0)}
                      <span className={`text-sm ml-1 ${getGrowthColor(growthMetrics?.query_growth_rate || 0)}`}>
                        {formatPercentage(growthMetrics?.query_growth_rate || 0)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold">{growthMetrics?.avg_response_time || 0}ms</p>
                      </div>
                      <Timer className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(-(growthMetrics?.performance_change || 0))}
                      <span className={`text-sm ml-1 ${getGrowthColor(-(growthMetrics?.performance_change || 0))}`}>
                        {formatPercentage(-(growthMetrics?.performance_change || 0))}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Growth Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Overview
              </CardTitle>
              <CardDescription>Key metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={volumeGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="volume" fill={COLORS[0]} name="Volume (GB)" />
                    <Line yAxisId="right" type="monotone" dataKey="queries" stroke={COLORS[1]} name="Queries" />
                    <Line yAxisId="right" type="monotone" dataKey="users" stroke={COLORS[2]} name="Users" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Growth Rate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Data Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-500">
                    {formatPercentage(growthMetrics?.volume_growth_rate || 0)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes((growthMetrics?.current_volume_bytes || 0) - (growthMetrics?.previous_volume_bytes || 0))} added
                    </p>
                  </div>
                </div>
                <Progress value={Math.abs(growthMetrics?.volume_growth_rate || 0)} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">User Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-500">
                    {formatPercentage(growthMetrics?.user_growth_rate || 0)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-xs text-muted-foreground">
                      {((growthMetrics?.active_users || 0) - (growthMetrics?.previous_active_users || 0))} new users
                    </p>
                  </div>
                </div>
                <Progress value={Math.abs(growthMetrics?.user_growth_rate || 0)} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Query Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-500">
                    {formatPercentage(growthMetrics?.query_growth_rate || 0)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber((growthMetrics?.query_count || 0) - (growthMetrics?.previous_query_count || 0))} more queries
                    </p>
                  </div>
                </div>
                <Progress value={Math.abs(growthMetrics?.query_growth_rate || 0)} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Volume Growth Tab */}
        <TabsContent value="volume" className="space-y-4">
          {/* Volume Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Volume Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={volumeGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="volume" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tables</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-20 h-2" />
                      <span className="text-sm text-green-500">+15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Records</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm text-green-500">+22%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-20 h-2" />
                      <span className="text-sm text-green-500">+18%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Indexes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20 h-2" />
                      <span className="text-sm text-green-500">+8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Volume Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Volume Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{formatBytes(growthMetrics?.current_volume_bytes || 0)}</p>
                  <p className="text-sm text-muted-foreground">Current Volume</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{formatBytes((growthMetrics?.current_volume_bytes || 0) / 30)}</p>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">{formatBytes((growthMetrics?.current_volume_bytes || 0) * 1.5)}</p>
                  <p className="text-sm text-muted-foreground">Projected (90d)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">{formatNumber(growthMetrics?.total_tables || 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Tables</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Growth Patterns</CardTitle>
              <CardDescription>Analysis of growth patterns and seasonality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Peak Growth Days</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monday</span>
                      <Badge>+25%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tuesday</span>
                      <Badge>+18%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Wednesday</span>
                      <Badge>+22%</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Growth Drivers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">New Data Sources</span>
                      <Badge variant="secondary">35%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Increased Usage</span>
                      <Badge variant="secondary">40%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Data Retention</span>
                      <Badge variant="secondary">25%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Analytics Tab */}
        <TabsContent value="usage" className="space-y-4">
          {/* Usage Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={usageDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {usageDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={performanceOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="avgResponseTime" stroke={COLORS[0]} name="Response Time (ms)" />
                      <Bar yAxisId="right" dataKey="throughput" fill={COLORS[1]} name="Throughput" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Usage Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
                    <p className="text-2xl font-bold">{formatNumber(usageAnalytics?.total_queries || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">{formatNumber(usageAnalytics?.unique_users || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                    <p className="text-2xl font-bold">{usageAnalytics?.avg_session_duration || 0}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Peak Usage</p>
                    <p className="text-2xl font-bold">{formatNumber(usageAnalytics?.peak_concurrent_users || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Consumers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Data Consumers</CardTitle>
              <CardDescription>Users and applications with highest usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageAnalytics?.top_consumers?.map((consumer, index) => (
                  <div key={consumer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{consumer.name}</p>
                        <p className="text-sm text-muted-foreground">{consumer.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(consumer.query_count)} queries</p>
                      <p className="text-sm text-muted-foreground">{formatBytes(consumer.data_consumed)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {/* Prediction Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Prediction Period:</label>
                  <Select value={predictionPeriod} onValueChange={setPredictionPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="180d">6 months</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline" className="ml-auto">
                  <Target className="h-3 w-3 mr-1" />
                  85% Confidence
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Growth Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current</span>
                    <span className="font-medium">{formatBytes(growthPredictions?.current_volume || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Predicted</span>
                    <span className="font-medium text-blue-500">{formatBytes(growthPredictions?.predicted_volume || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Growth</span>
                    <span className="font-medium text-green-500">
                      {formatPercentage(growthPredictions?.volume_growth_percentage || 0)}
                    </span>
                  </div>
                </div>
                <Progress value={75} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current</span>
                    <span className="font-medium">{formatNumber(growthPredictions?.current_users || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Predicted</span>
                    <span className="font-medium text-blue-500">{formatNumber(growthPredictions?.predicted_users || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Growth</span>
                    <span className="font-medium text-green-500">
                      {formatPercentage(growthPredictions?.user_growth_percentage || 0)}
                    </span>
                  </div>
                </div>
                <Progress value={65} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Query Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current</span>
                    <span className="font-medium">{formatNumber(growthPredictions?.current_queries || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Predicted</span>
                    <span className="font-medium text-blue-500">{formatNumber(growthPredictions?.predicted_queries || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Growth</span>
                    <span className="font-medium text-green-500">
                      {formatPercentage(growthPredictions?.query_growth_percentage || 0)}
                    </span>
                  </div>
                </div>
                <Progress value={80} className="mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Prediction Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Predictions
              </CardTitle>
              <CardDescription>Forecasted growth based on historical trends</CardDescription>
            </CardHeader>
            <CardContent>
              {predictionsLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={growthPredictions?.prediction_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="historical" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} name="Historical" />
                    <Area type="monotone" dataKey="predicted" stackId="2" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.4} name="Predicted" />
                    <Line type="monotone" dataKey="confidence_upper" stroke={COLORS[2]} strokeDasharray="5 5" name="Upper Bound" />
                    <Line type="monotone" dataKey="confidence_lower" stroke={COLORS[2]} strokeDasharray="5 5" name="Lower Bound" />
                    <ReferenceLine x="today" stroke="red" strokeDasharray="2 2" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Prediction Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prediction Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Storage Capacity Planning</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on current growth trends, you'll need approximately {formatBytes((growthPredictions?.predicted_volume || 0) * 1.2)} of additional storage capacity within the next {predictionPeriod}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Performance Outlook</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Current performance metrics suggest the system can handle the predicted {formatPercentage(growthPredictions?.user_growth_percentage || 0)} increase in users without degradation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Scaling Recommendations</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Consider implementing connection pooling and query optimization as query volume is expected to grow by {formatPercentage(growthPredictions?.query_growth_percentage || 0)}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}