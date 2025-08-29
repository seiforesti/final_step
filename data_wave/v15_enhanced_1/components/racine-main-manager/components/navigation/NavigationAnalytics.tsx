'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Activity, Eye, Clock, Users, MousePointer, Navigation, Map, Target, Zap, Filter, Search, Download, Share2, Settings, RefreshCw, Calendar, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, MoreHorizontal, Database, Shield, FileText, BookOpen, Scan, Workflow, Bot, MessageSquare, Globe, Hash, Layers, Pie, LineChart, AreaChart, Gauge, HelpCircle, Info, AlertCircle, CheckCircle, XCircle, Star, Heart, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

// Import racine foundation layers (already implemented)
import { useNavigationAnalytics } from '../../hooks/useNavigationAnalytics'
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { useAIAssistant } from '../../hooks/useAIAssistant'
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration'

// Import types (already implemented)
import {
  NavigationAnalytics as NavigationAnalyticsType,
  NavigationMetrics,
  UserJourney,
  SPAUsageStats,
  NavigationPattern,
  UserBehavior,
  PerformanceMetrics,
  AnalyticsFilter,
  AnalyticsTimeRange
} from '../../types/racine-core.types'

// Import utils (already implemented)
import { 
  calculateNavigationMetrics,
  analyzeUserJourneys,
  identifyNavigationPatterns,
  generateAnalyticsInsights,
  formatAnalyticsData
} from '../../utils/analytics-utils'
import { formatTimeRange, formatMetricValue } from '../../utils/format-utils'

// Import constants (already implemented)
import {
  ANALYTICS_TIME_RANGES,
  NAVIGATION_METRICS_CONFIG,
  SPA_ANALYTICS_CONFIG,
  DEFAULT_ANALYTICS_FILTERS
} from '../../constants/cross-group-configs'

// SPA configurations for analytics
const SPA_ANALYTICS_METADATA = {
  'data-sources': {
    name: 'Data Sources',
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    category: 'Data Management'
  },
  'scan-rule-sets': {
    name: 'Scan Rule Sets',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    category: 'Security & Compliance'
  },
  'classifications': {
    name: 'Classifications',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    category: 'Data Governance'
  },
  'compliance-rule': {
    name: 'Compliance Rules',
    icon: BookOpen,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    category: 'Security & Compliance'
  },
  'advanced-catalog': {
    name: 'Advanced Catalog',
    icon: Scan,
    color: 'text-teal-600',
    bgColor: 'bg-teal-500',
    category: 'Data Management'
  },
  'scan-logic': {
    name: 'Scan Logic',
    icon: Activity,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500',
    category: 'Processing'
  },
  'rbac-system': {
    name: 'RBAC System',
    icon: Users,
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    category: 'Security & Compliance'
  }
} as const

// Metric configurations
const METRIC_CONFIGS = {
  pageViews: {
    label: 'Page Views',
    icon: Eye,
    format: 'number',
    color: 'text-blue-600'
  },
  uniqueUsers: {
    label: 'Unique Users',
    icon: Users,
    format: 'number',
    color: 'text-green-600'
  },
  avgSessionDuration: {
    label: 'Avg Session Duration',
    icon: Clock,
    format: 'duration',
    color: 'text-purple-600'
  },
  bounceRate: {
    label: 'Bounce Rate',
    icon: TrendingDown,
    format: 'percentage',
    color: 'text-red-600'
  },
  clickThroughRate: {
    label: 'Click Through Rate',
    icon: MousePointer,
    format: 'percentage',
    color: 'text-orange-600'
  },
  conversionRate: {
    label: 'Conversion Rate',
    icon: Target,
    format: 'percentage',
    color: 'text-teal-600'
  }
} as const

interface NavigationAnalyticsProps {
  className?: string
  showFilters?: boolean
  defaultTimeRange?: AnalyticsTimeRange
}

export const NavigationAnalytics: React.FC<NavigationAnalyticsProps> = ({
  className,
  showFilters = true,
  defaultTimeRange = '7d'
}) => {
  // Core state management using foundation hooks
  const {
    navigationMetrics,
    userJourneys,
    spaUsageStats,
    navigationPatterns,
    performanceMetrics,
    getNavigationAnalytics,
    getUserBehaviorInsights,
    generateAnalyticsReport,
    exportAnalyticsData,
    trackAnalyticsView
  } = useNavigationAnalytics()

  const {
    crossGroupState,
    getAllSPAMetrics,
    getPerformanceData
  } = useCrossGroupIntegration()

  const {
    userContext,
    getUserMetrics
  } = useUserManagement()

  const {
    getActivityMetrics,
    getNavigationHistory
  } = useActivityTracker()

  const {
    aiInsights,
    generateNavigationInsights,
    predictUserBehavior
  } = useAIAssistant()

  const {
    orchestrationState,
    getSystemPerformance
  } = useRacineOrchestration()

  // Local state
  const [selectedTimeRange, setSelectedTimeRange] = useState<AnalyticsTimeRange>(defaultTimeRange)
  const [selectedSPAs, setSelectedSPAs] = useState<string[]>(['all'])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['pageViews', 'uniqueUsers', 'avgSessionDuration'])
  const [activeTab, setActiveTab] = useState<'overview' | 'journeys' | 'patterns' | 'performance'>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [filters, setFilters] = useState<AnalyticsFilter>(DEFAULT_ANALYTICS_FILTERS)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    spas: true,
    insights: true
  })

  // Calculated metrics
  const overallMetrics = useMemo(() => {
    if (!navigationMetrics) return null

    return {
      totalPageViews: navigationMetrics.pageViews,
      totalUsers: navigationMetrics.uniqueUsers,
      avgSessionDuration: navigationMetrics.avgSessionDuration,
      totalSessions: navigationMetrics.sessions,
      bounceRate: navigationMetrics.bounceRate,
      conversionRate: navigationMetrics.conversionRate
    }
  }, [navigationMetrics])

  // SPA usage statistics
  const spaStats = useMemo(() => {
    if (!spaUsageStats) return []

    return Object.entries(SPA_ANALYTICS_METADATA).map(([spaKey, metadata]) => {
      const stats = spaUsageStats[spaKey] || {
        pageViews: 0,
        uniqueUsers: 0,
        avgSessionDuration: 0,
        bounceRate: 0
      }

      return {
        ...metadata,
        key: spaKey,
        ...stats,
        trend: stats.pageViews > 0 ? 'up' : 'stable'
      }
    }).sort((a, b) => b.pageViews - a.pageViews)
  }, [spaUsageStats])

  // Top navigation patterns
  const topPatterns = useMemo(() => {
    if (!navigationPatterns) return []

    return navigationPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
  }, [navigationPatterns])

  // Performance insights
  const performanceInsights = useMemo(() => {
    if (!performanceMetrics) return []

    const insights = []

    // Slow loading pages
    if (performanceMetrics.avgLoadTime > 3000) {
      insights.push({
        type: 'warning',
        title: 'Slow Page Load Times',
        message: `Average load time is ${performanceMetrics.avgLoadTime}ms`,
        action: 'Optimize performance'
      })
    }

    // High bounce rate
    if (overallMetrics?.bounceRate > 70) {
      insights.push({
        type: 'error',
        title: 'High Bounce Rate',
        message: `${overallMetrics.bounceRate}% of users leave quickly`,
        action: 'Improve user experience'
      })
    }

    // Popular SPAs
    const mostUsedSPA = spaStats[0]
    if (mostUsedSPA) {
      insights.push({
        type: 'success',
        title: 'Most Popular SPA',
        message: `${mostUsedSPA.name} has ${mostUsedSPA.pageViews} views`,
        action: 'Analyze success factors'
      })
    }

    return insights
  }, [performanceMetrics, overallMetrics, spaStats])

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true)
    try {
      await getNavigationAnalytics({
        timeRange: selectedTimeRange,
        spas: selectedSPAs,
        filters
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTimeRange, selectedSPAs, filters, getNavigationAnalytics])

  // Load data on mount and when filters change
  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  // Track analytics view
  useEffect(() => {
    trackAnalyticsView({
      section: activeTab,
      timeRange: selectedTimeRange,
      timestamp: new Date()
    })
  }, [activeTab, selectedTimeRange, trackAnalyticsView])

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: AnalyticsTimeRange) => {
    setSelectedTimeRange(range)
  }, [])

  // Handle SPA selection change
  const handleSPASelectionChange = useCallback((spas: string[]) => {
    setSelectedSPAs(spas)
  }, [])

  // Handle export
  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      await exportAnalyticsData({
        timeRange: selectedTimeRange,
        spas: selectedSPAs,
        format,
        includeCharts: format === 'pdf'
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [selectedTimeRange, selectedSPAs, exportAnalyticsData])

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  // Render metric card
  const renderMetricCard = useCallback((metricKey: string, value: number | string, trend?: 'up' | 'down' | 'stable') => {
    const config = METRIC_CONFIGS[metricKey as keyof typeof METRIC_CONFIGS]
    if (!config) return null

    const Icon = config.icon
    const formattedValue = typeof value === 'number' ? formatMetricValue(value, config.format) : value

    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
              <p className={cn("text-2xl font-bold", config.color)}>{formattedValue}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", config.color.replace('text-', 'bg-') + '/10')}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              {trend && (
                <div className="flex items-center">
                  {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                  {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                  {trend === 'stable' && <Activity className="w-4 h-4 text-gray-600" />}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }, [])

  // Render SPA usage chart
  const renderSPAUsageChart = useCallback(() => {
    const maxViews = Math.max(...spaStats.map(spa => spa.pageViews))

    return (
      <div className="space-y-4">
        {spaStats.map((spa, index) => (
          <motion.div
            key={spa.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", spa.bgColor)}>
              <spa.icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{spa.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{spa.pageViews.toLocaleString()}</span>
                  {spa.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={(spa.pageViews / maxViews) * 100} 
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{spa.uniqueUsers} users</span>
                  <span>{spa.bounceRate}% bounce rate</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }, [spaStats])

  // Render navigation patterns
  const renderNavigationPatterns = useCallback(() => {
    return (
      <div className="space-y-3">
        {topPatterns.map((pattern, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Journey Pattern #{index + 1}</h4>
              <Badge variant="outline">{pattern.frequency} occurrences</Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {pattern.path.map((step, stepIndex) => (
                <React.Fragment key={stepIndex}>
                  <span className="px-2 py-1 bg-muted rounded text-xs">{step}</span>
                  {stepIndex < pattern.path.length - 1 && (
                    <ArrowRight className="w-3 h-3" />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Avg duration: {pattern.avgDuration}ms | Success rate: {pattern.successRate}%
            </div>
          </motion.div>
        ))}
      </div>
    )
  }, [topPatterns])

  // Render insights
  const renderInsights = useCallback(() => {
    return (
      <div className="space-y-3">
        {performanceInsights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-lg border-l-4",
              insight.type === 'success' && "border-l-green-500 bg-green-50 dark:bg-green-950/20",
              insight.type === 'warning' && "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
              insight.type === 'error' && "border-l-red-500 bg-red-50 dark:bg-red-950/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {insight.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {insight.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                {insight.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{insight.message}</p>
                <Button variant="outline" size="sm">
                  {insight.action}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* AI-generated insights */}
        {aiInsights?.navigationInsights && (
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border-l-4 border-l-purple-500">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">AI Insights</h4>
                <p className="text-sm text-muted-foreground mb-2">{aiInsights.navigationInsights}</p>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }, [performanceInsights, aiInsights])

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Navigation Analytics</h2>
            <p className="text-muted-foreground">
              Insights into user behavior and navigation patterns across SPAs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAnalyticsData()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Time Range:</label>
                  <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">SPAs:</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {selectedSPAs.includes('all') ? 'All SPAs' : `${selectedSPAs.length} selected`}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuCheckboxItem
                        checked={selectedSPAs.includes('all')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSPAs(['all'])
                          }
                        }}
                      >
                        All SPAs
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {Object.entries(SPA_ANALYTICS_METADATA).map(([key, spa]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={selectedSPAs.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSPAs(prev => [...prev.filter(s => s !== 'all'), key])
                            } else {
                              setSelectedSPAs(prev => prev.filter(s => s !== key))
                            }
                          }}
                        >
                          <spa.icon className="w-4 h-4 mr-2" />
                          {spa.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="journeys">User Journeys</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overallMetrics && Object.entries(overallMetrics).map(([key, value]) => 
                renderMetricCard(key, value)
              )}
            </div>

            {/* SPA Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  SPA Usage Statistics
                </CardTitle>
                <CardDescription>
                  Page views and engagement across all SPAs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSPAUsageChart()}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  AI-powered insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderInsights()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Journeys Tab */}
          <TabsContent value="journeys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  User Journey Analysis
                </CardTitle>
                <CardDescription>
                  Common paths and navigation flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userJourneys?.map((journey, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Journey #{index + 1}</h4>
                        <Badge variant="outline">{journey.frequency} users</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        {journey.steps.map((step, stepIndex) => (
                          <React.Fragment key={stepIndex}>
                            <div className="px-3 py-1 bg-muted rounded">
                              {step.page}
                            </div>
                            {stepIndex < journey.steps.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {journey.avgDuration}s</span>
                        <span>Conversion: {journey.conversionRate}%</span>
                        <span>Drop-off: {journey.dropOffRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Navigation Patterns
                </CardTitle>
                <CardDescription>
                  Most common navigation behaviors and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderNavigationPatterns()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Load Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Load Time</span>
                      <span className="font-medium">{performanceMetrics?.avgLoadTime}ms</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Time to Interactive</span>
                      <span className="font-medium">{performanceMetrics?.timeToInteractive}ms</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Server Response Time</span>
                      <span className="font-medium">{performanceMetrics?.serverResponseTime}ms</span>
                    </div>
                    <Progress value={90} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <span className="font-medium">{performanceMetrics?.errorRate}%</span>
                    </div>
                    <Progress value={performanceMetrics?.errorRate || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

export default NavigationAnalytics
