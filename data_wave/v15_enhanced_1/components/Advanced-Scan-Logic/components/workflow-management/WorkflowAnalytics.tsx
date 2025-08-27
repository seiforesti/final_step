"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, LineChart, PieChart, Activity, TrendingUp, TrendingDown, Target, Calendar, Clock, Timer, Zap, Eye, Filter, Search, Download, Upload, RefreshCw, Settings, MoreHorizontal, Play, Pause, Square, RotateCcw, FastForward, Rewind, CheckCircle, XCircle, AlertTriangle, Info, Workflow, GitBranch, Database, Server, Cloud, Cpu, HardDrive, Network, Route, Layers, Package, Component, Code, Terminal, Monitor, Users, User, Crown, Award, Star, Bookmark, Tag, Hash, Percent, DollarSign, Calculator, Plus, Minus, X, Check, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Maximize2, Minimize2, ZoomIn, ZoomOut, Grid, List, Map, Navigation, Compass, MapPin, Globe, Wifi, Link, Unlink, Share2, Copy, Edit, Trash2, Save, FileText, File, Folder, Archive, History, Bell, BellOff, MessageSquare, Mail, Send, Phone, Video, Mic, MicOff, Volume2, VolumeX, Camera, CameraOff, Image, Film, Music, Headphones, Radio, Tv, Smartphone, Tablet, Laptop, Desktop, Watch, Gamepad2, Keyboard, Mouse, Printer, Scanner, Fax, Projector, Lightbulb, Flame, Snowflake, Sun, Moon, Cloud as CloudIcon, CloudRain, CloudSnow, CloudLightning, Umbrella, Rainbow, Sunrise, Sunset, Wind, Thermometer, Gauge, Ruler, Scale, Timer as TimerIcon, Stopwatch, AlarmClock, Calendar as CalendarIcon, CalendarDays, CalendarClock, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Chart components for analytics
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Brush
} from 'recharts'

// Import types and services
import {
  WorkflowAnalytics as WorkflowAnalyticsType,
  WorkflowMetrics,
  WorkflowPerformance,
  WorkflowTrends,
  WorkflowInsights,
  WorkflowRecommendations,
  WorkflowStatistics,
  WorkflowKPIs,
  WorkflowDashboard,
  WorkflowReport,
  WorkflowBenchmark,
  WorkflowOptimization,
  WorkflowPrediction,
  WorkflowAnomaly,
  WorkflowAlert,
  WorkflowNotification,
  WorkflowAudit,
  WorkflowHistory,
  WorkflowComparison,
  WorkflowCorrelation,
  WorkflowSegmentation,
  WorkflowCohort,
  WorkflowFunnel,
  WorkflowJourney,
  WorkflowTimeline,
  WorkflowHeatmap,
  WorkflowDistribution,
  WorkflowRegression,
  WorkflowClustering,
  WorkflowClassification,
  WorkflowForecasting,
  AnalyticsFilter,
  AnalyticsQuery,
  AnalyticsVisualization,
  AnalyticsExport,
  AnalyticsConfiguration
} from '../../types/workflow.types'

import {
  useWorkflowAnalytics,
  useWorkflowMetrics,
  useWorkflowPerformance,
  useWorkflowTrends,
  useWorkflowInsights,
  useWorkflowRecommendations,
  useWorkflowStatistics,
  useWorkflowKPIs,
  useWorkflowDashboard,
  useWorkflowReports,
  useWorkflowBenchmarks,
  useWorkflowOptimization,
  useWorkflowPredictions,
  useWorkflowAnomalies,
  useWorkflowAlerts,
  useWorkflowNotifications,
  useWorkflowAudits,
  useWorkflowHistory,
  useWorkflowComparisons,
  useWorkflowCorrelations,
  useWorkflowSegmentation,
  useWorkflowCohorts,
  useWorkflowFunnels,
  useWorkflowJourneys,
  useWorkflowTimelines,
  useWorkflowHeatmaps,
  useWorkflowDistributions,
  useWorkflowRegression,
  useWorkflowClustering,
  useWorkflowClassification,
  useWorkflowForecasting,
  useAnalyticsFilters,
  useAnalyticsQueries,
  useAnalyticsVisualizations,
  useAnalyticsExports,
  useAnalyticsConfiguration
} from '../../hooks/useWorkflowManagement'

import {
  calculateWorkflowMetrics,
  calculateWorkflowPerformance,
  calculateWorkflowTrends,
  generateWorkflowInsights,
  generateWorkflowRecommendations,
  calculateWorkflowStatistics,
  calculateWorkflowKPIs,
  generateWorkflowDashboard,
  generateWorkflowReport,
  calculateWorkflowBenchmarks,
  optimizeWorkflowPerformance,
  predictWorkflowOutcomes,
  detectWorkflowAnomalies,
  generateWorkflowAlerts,
  sendWorkflowNotifications,
  auditWorkflowChanges,
  trackWorkflowHistory,
  compareWorkflows,
  calculateWorkflowCorrelations,
  segmentWorkflowData,
  analyzeWorkflowCohorts,
  analyzeWorkflowFunnels,
  mapWorkflowJourneys,
  createWorkflowTimelines,
  generateWorkflowHeatmaps,
  analyzeWorkflowDistributions,
  performWorkflowRegression,
  clusterWorkflowData,
  classifyWorkflowPatterns,
  forecastWorkflowTrends,
  applyAnalyticsFilters,
  executeAnalyticsQueries,
  createAnalyticsVisualizations,
  exportAnalyticsData,
  configureAnalyticsSettings,
  aggregateWorkflowData,
  normalizeWorkflowData,
  transformWorkflowData,
  validateWorkflowData,
  enrichWorkflowData,
  anonymizeWorkflowData,
  compressWorkflowData,
  cacheWorkflowData,
  indexWorkflowData,
  searchWorkflowData,
  backupWorkflowData,
  restoreWorkflowData,
  syncWorkflowData,
  streamWorkflowData,
  batchWorkflowData,
  scheduleWorkflowAnalytics,
  monitorWorkflowAnalytics,
  alertWorkflowAnalytics,
  optimizeWorkflowQueries,
  benchmarkWorkflowPerformance,
  profileWorkflowExecution,
  debugWorkflowIssues,
  testWorkflowScenarios,
  simulateWorkflowLoad,
  visualizeWorkflowData,
  animateWorkflowCharts,
  interactiveWorkflowDashboard,
  customizeWorkflowReports,
  shareWorkflowInsights,
  collaborateWorkflowAnalysis
} from '../../services/scan-workflow-apis'

import {
  WorkflowMetricsPanel,
  WorkflowPerformancePanel,
  WorkflowTrendsPanel,
  WorkflowInsightsPanel,
  WorkflowRecommendationsPanel,
  WorkflowStatisticsPanel,
  WorkflowKPIsPanel,
  WorkflowDashboardPanel,
  WorkflowReportsPanel,
  WorkflowBenchmarksPanel,
  WorkflowOptimizationPanel,
  WorkflowPredictionsPanel,
  WorkflowAnomaliesPanel,
  WorkflowAlertsPanel,
  WorkflowNotificationsPanel,
  WorkflowAuditsPanel,
  WorkflowHistoryPanel,
  WorkflowComparisonsPanel,
  WorkflowCorrelationsPanel,
  WorkflowSegmentationPanel,
  WorkflowCohortsPanel,
  WorkflowFunnelsPanel,
  WorkflowJourneysPanel,
  WorkflowTimelinesPanel,
  WorkflowHeatmapsPanel,
  WorkflowDistributionsPanel,
  WorkflowRegressionPanel,
  WorkflowClusteringPanel,
  WorkflowClassificationPanel,
  WorkflowForecastingPanel,
  AnalyticsFiltersPanel,
  AnalyticsQueriesPanel,
  AnalyticsVisualizationsPanel,
  AnalyticsExportsPanel,
  AnalyticsConfigurationPanel
} from '../../components/workflow-analytics'

import {
  formatMetricValue,
  formatPercentage,
  formatDuration,
  formatTimestamp,
  formatNumber,
  formatCurrency,
  formatBytes,
  formatRate,
  formatThroughput,
  formatLatency,
  formatErrorRate,
  formatSuccessRate,
  formatAvailability,
  formatReliability,
  formatEfficiency,
  formatProductivity,
  formatQuality,
  formatSatisfaction,
  formatEngagement,
  formatRetention,
  formatConversion,
  formatGrowth,
  formatTrend,
  formatVariance,
  formatCorrelation,
  formatSignificance,
  formatConfidence,
  formatPrediction,
  formatAnomaly,
  formatAlert,
  formatNotification,
  formatRecommendation,
  formatInsight,
  formatBenchmark,
  formatOptimization,
  calculatePercentChange,
  calculateGrowthRate,
  calculateMovingAverage,
  calculateStandardDeviation,
  calculateVariance,
  calculateCorrelation,
  calculateRegression,
  calculateForecast,
  calculateAnomaly,
  calculateOutlier,
  calculateTrend,
  calculateSeasonality,
  calculateCyclicality,
  calculateVolatility,
  calculateStability,
  calculateConsistency,
  calculateReliability,
  calculateAccuracy,
  calculatePrecision,
  calculateRecall,
  calculateF1Score,
  calculateAUC,
  calculateRMSE,
  calculateMAE,
  calculateMAPE,
  calculateR2Score,
  validateAnalyticsData,
  sanitizeAnalyticsInput,
  optimizeAnalyticsQuery,
  compressAnalyticsData,
  encryptAnalyticsData,
  anonymizeAnalyticsData
} from '../../utils/workflow-analytics'

import {
  ANALYTICS_METRICS,
  ANALYTICS_DIMENSIONS,
  ANALYTICS_AGGREGATIONS,
  ANALYTICS_FILTERS,
  ANALYTICS_VISUALIZATIONS,
  ANALYTICS_REPORTS,
  ANALYTICS_DASHBOARDS,
  ANALYTICS_ALERTS,
  ANALYTICS_THRESHOLDS,
  ANALYTICS_BENCHMARKS,
  ANALYTICS_FORECASTS,
  ANALYTICS_ANOMALIES,
  ANALYTICS_INSIGHTS,
  ANALYTICS_RECOMMENDATIONS,
  ANALYTICS_COLORS,
  ANALYTICS_THEMES,
  ANALYTICS_LAYOUTS,
  ANALYTICS_TEMPLATES,
  ANALYTICS_CONFIGURATIONS,
  ANALYTICS_DEFAULTS
} from '../../constants/workflow-analytics'

// Enhanced interfaces for advanced workflow analytics
interface WorkflowAnalyticsState {
  // Core analytics state
  analytics: WorkflowAnalyticsType | null
  metrics: WorkflowMetrics[]
  performance: WorkflowPerformance[]
  trends: WorkflowTrends[]
  insights: WorkflowInsights[]
  recommendations: WorkflowRecommendations[]
  statistics: WorkflowStatistics | null
  kpis: WorkflowKPIs[]
  dashboard: WorkflowDashboard | null
  reports: WorkflowReport[]
  benchmarks: WorkflowBenchmark[]
  optimizations: WorkflowOptimization[]
  predictions: WorkflowPrediction[]
  anomalies: WorkflowAnomaly[]
  alerts: WorkflowAlert[]
  notifications: WorkflowNotification[]
  audits: WorkflowAudit[]
  history: WorkflowHistory[]
  comparisons: WorkflowComparison[]
  correlations: WorkflowCorrelation[]
  segmentations: WorkflowSegmentation[]
  cohorts: WorkflowCohort[]
  funnels: WorkflowFunnel[]
  journeys: WorkflowJourney[]
  timelines: WorkflowTimeline[]
  heatmaps: WorkflowHeatmap[]
  distributions: WorkflowDistribution[]
  regressions: WorkflowRegression[]
  clusterings: WorkflowClustering[]
  classifications: WorkflowClassification[]
  forecastings: WorkflowForecasting[]
  
  // Filter and query state
  filters: AnalyticsFilter[]
  queries: AnalyticsQuery[]
  visualizations: AnalyticsVisualization[]
  exports: AnalyticsExport[]
  configuration: AnalyticsConfiguration
  
  // UI state
  view: 'overview' | 'metrics' | 'performance' | 'trends' | 'insights' | 'reports' | 'config'
  selectedTimeRange: string
  selectedMetrics: string[]
  selectedDimensions: string[]
  selectedVisualization: string
  selectedDateRange: { start: Date; end: Date }
  isRealTime: boolean
  isAutoRefresh: boolean
  refreshInterval: number
  
  // Interaction state
  selectedDataPoint: any | null
  hoveredDataPoint: any | null
  zoomedRegion: any | null
  drillDownPath: string[]
  comparisonMode: boolean
  annotationMode: boolean
  exportMode: boolean
  shareMode: boolean
  
  // Loading and error state
  isLoading: boolean
  isCalculating: boolean
  isExporting: boolean
  error: string | null
  warnings: string[]
  
  // Display preferences
  showGrid: boolean
  showLegend: boolean
  showTooltips: boolean
  showAnnotations: boolean
  showTrends: boolean
  showAnomalies: boolean
  showPredictions: boolean
  showBenchmarks: boolean
  showInsights: boolean
  showRecommendations: boolean
  
  // Chart configuration
  chartType: string
  chartTheme: string
  chartColors: string[]
  chartAnimation: boolean
  chartInteraction: boolean
  chartResponsive: boolean
  
  // Data processing
  dataSource: string
  dataQuality: number
  dataCompleteness: number
  dataFreshness: number
  lastUpdated: Date | null
  nextUpdate: Date | null
}

interface AnalyticsPreferences {
  defaultView: string
  defaultTimeRange: string
  defaultMetrics: string[]
  defaultVisualization: string
  autoRefresh: boolean
  refreshInterval: number
  showNotifications: boolean
  showTooltips: boolean
  theme: string
  colorScheme: string[]
  layout: string
  density: string
}

interface AnalyticsContext {
  workflowId?: string
  executionId?: string
  organizationId?: string
  userId?: string
  environment: string
  permissions: string[]
  preferences: AnalyticsPreferences
}

/**
 * WorkflowAnalytics Component
 * 
 * Enterprise-grade workflow analytics component that provides comprehensive
 * data analysis and visualization capabilities including:
 * - Real-time metrics and KPI monitoring
 * - Advanced performance analytics and trends
 * - Predictive analytics and forecasting
 * - Anomaly detection and alerting
 * - Interactive dashboards and reports
 * - Statistical analysis and modeling
 * - Data mining and pattern recognition
 * - Business intelligence and insights
 * - Comparative analysis and benchmarking
 * - Export and sharing capabilities
 * - AI-powered recommendations
 * 
 * This component integrates with the backend analytics engine and provides
 * a sophisticated user interface for data-driven decision making.
 */
export const WorkflowAnalytics: React.FC<{
  workflowId?: string
  executionId?: string
  context?: Partial<AnalyticsContext>
  onInsightGenerated?: (insight: WorkflowInsights) => void
  onRecommendationGenerated?: (recommendation: WorkflowRecommendations) => void
  onAnomalyDetected?: (anomaly: WorkflowAnomaly) => void
  realTime?: boolean
  autoRefresh?: boolean
  interactive?: boolean
}> = ({
  workflowId,
  executionId,
  context = {},
  onInsightGenerated,
  onRecommendationGenerated,
  onAnomalyDetected,
  realTime = true,
  autoRefresh = true,
  interactive = true
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<WorkflowAnalyticsState>({
    // Core analytics state
    analytics: null,
    metrics: [],
    performance: [],
    trends: [],
    insights: [],
    recommendations: [],
    statistics: null,
    kpis: [],
    dashboard: null,
    reports: [],
    benchmarks: [],
    optimizations: [],
    predictions: [],
    anomalies: [],
    alerts: [],
    notifications: [],
    audits: [],
    history: [],
    comparisons: [],
    correlations: [],
    segmentations: [],
    cohorts: [],
    funnels: [],
    journeys: [],
    timelines: [],
    heatmaps: [],
    distributions: [],
    regressions: [],
    clusterings: [],
    classifications: [],
    forecastings: [],
    
    // Filter and query state
    filters: [],
    queries: [],
    visualizations: [],
    exports: [],
    configuration: ANALYTICS_DEFAULTS,
    
    // UI state
    view: 'overview',
    selectedTimeRange: '24h',
    selectedMetrics: ['execution_time', 'success_rate', 'throughput'],
    selectedDimensions: ['timestamp', 'workflow_id'],
    selectedVisualization: 'line',
    selectedDateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    },
    isRealTime: realTime,
    isAutoRefresh: autoRefresh,
    refreshInterval: 30000,
    
    // Interaction state
    selectedDataPoint: null,
    hoveredDataPoint: null,
    zoomedRegion: null,
    drillDownPath: [],
    comparisonMode: false,
    annotationMode: false,
    exportMode: false,
    shareMode: false,
    
    // Loading and error state
    isLoading: false,
    isCalculating: false,
    isExporting: false,
    error: null,
    warnings: [],
    
    // Display preferences
    showGrid: true,
    showLegend: true,
    showTooltips: true,
    showAnnotations: false,
    showTrends: true,
    showAnomalies: true,
    showPredictions: false,
    showBenchmarks: false,
    showInsights: true,
    showRecommendations: true,
    
    // Chart configuration
    chartType: 'line',
    chartTheme: 'default',
    chartColors: ANALYTICS_COLORS.default,
    chartAnimation: true,
    chartInteraction: interactive,
    chartResponsive: true,
    
    // Data processing
    dataSource: 'real-time',
    dataQuality: 0.95,
    dataCompleteness: 0.98,
    dataFreshness: 0.99,
    lastUpdated: null,
    nextUpdate: null
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const dashboardRef = useRef<any>(null)
  const exportRef = useRef<any>(null)
  const configRef = useRef<any>(null)

  // Hook integrations
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    refreshAnalytics,
    calculateAnalytics,
    optimizeAnalytics
  } = useWorkflowAnalytics(workflowId, executionId)

  const {
    metrics,
    loading: metricsLoading,
    refreshMetrics,
    calculateMetrics
  } = useWorkflowMetrics()

  const {
    performance,
    loading: performanceLoading,
    refreshPerformance,
    analyzePerformance
  } = useWorkflowPerformance()

  const {
    trends,
    loading: trendsLoading,
    refreshTrends,
    analyzeTrends
  } = useWorkflowTrends()

  const {
    insights,
    loading: insightsLoading,
    refreshInsights,
    generateInsights
  } = useWorkflowInsights()

  const {
    recommendations,
    loading: recommendationsLoading,
    refreshRecommendations,
    generateRecommendations
  } = useWorkflowRecommendations()

  const {
    statistics,
    loading: statisticsLoading,
    refreshStatistics,
    calculateStatistics
  } = useWorkflowStatistics()

  const {
    kpis,
    loading: kpisLoading,
    refreshKPIs,
    calculateKPIs
  } = useWorkflowKPIs()

  const {
    dashboard,
    loading: dashboardLoading,
    refreshDashboard,
    updateDashboard
  } = useWorkflowDashboard()

  const {
    reports,
    loading: reportsLoading,
    refreshReports,
    generateReport,
    exportReport
  } = useWorkflowReports()

  const {
    benchmarks,
    loading: benchmarksLoading,
    refreshBenchmarks,
    calculateBenchmarks
  } = useWorkflowBenchmarks()

  const {
    predictions,
    loading: predictionsLoading,
    refreshPredictions,
    generatePredictions
  } = useWorkflowPredictions()

  const {
    anomalies,
    loading: anomaliesLoading,
    refreshAnomalies,
    detectAnomalies
  } = useWorkflowAnomalies()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredMetrics = useMemo(() => {
    return state.metrics.filter(metric => {
      // Apply time range filter
      const metricDate = new Date(metric.timestamp)
      if (metricDate < state.selectedDateRange.start || metricDate > state.selectedDateRange.end) {
        return false
      }

      // Apply selected metrics filter
      if (state.selectedMetrics.length > 0 && !state.selectedMetrics.includes(metric.name)) {
        return false
      }

      return true
    })
  }, [state.metrics, state.selectedDateRange, state.selectedMetrics])

  const chartData = useMemo(() => {
    return aggregateWorkflowData(filteredMetrics, {
      groupBy: state.selectedDimensions,
      aggregations: ['avg', 'sum', 'count'],
      timeInterval: getTimeInterval(state.selectedTimeRange)
    })
  }, [filteredMetrics, state.selectedDimensions, state.selectedTimeRange])

  const summaryStatistics = useMemo(() => {
    return calculateSummaryStatistics(filteredMetrics)
  }, [filteredMetrics])

  const trendAnalysis = useMemo(() => {
    return analyzeTrendData(chartData)
  }, [chartData])

  const performanceMetrics = useMemo(() => {
    return calculatePerformanceMetrics(filteredMetrics)
  }, [filteredMetrics])

  const anomalyDetection = useMemo(() => {
    return detectAnomalyPatterns(chartData)
  }, [chartData])

  const predictiveInsights = useMemo(() => {
    return generatePredictiveInsights(chartData)
  }, [chartData])

  const chartConfig = useMemo(() => {
    return {
      type: state.chartType,
      theme: state.chartTheme,
      colors: state.chartColors,
      animation: state.chartAnimation,
      interaction: state.chartInteraction,
      responsive: state.chartResponsive,
      grid: state.showGrid,
      legend: state.showLegend,
      tooltips: state.showTooltips,
      annotations: state.showAnnotations
    }
  }, [state])

  const isDataAvailable = useMemo(() => {
    return filteredMetrics.length > 0
  }, [filteredMetrics])

  const canExport = useMemo(() => {
    return isDataAvailable && !state.isExporting
  }, [isDataAvailable, state.isExporting])

  const canGenerateInsights = useMemo(() => {
    return isDataAvailable && !state.isCalculating
  }, [isDataAvailable, state.isCalculating])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getTimeInterval = (timeRange: string): string => {
    switch (timeRange) {
      case '1h': return '1m'
      case '6h': return '5m'
      case '24h': return '1h'
      case '7d': return '1d'
      case '30d': return '1d'
      case '90d': return '1w'
      default: return '1h'
    }
  }

  const calculateSummaryStatistics = (metrics: WorkflowMetrics[]) => {
    if (metrics.length === 0) return null

    const values = metrics.map(m => m.value)
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      median: calculateMedian(values),
      stdDev: calculateStandardDeviation(values),
      variance: calculateVariance(values)
    }
  }

  const calculateMedian = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle]
  }

  const analyzeTrendData = (data: any[]) => {
    if (data.length < 2) return null

    const trend = calculateTrend(data)
    const seasonality = calculateSeasonality(data)
    const cyclicality = calculateCyclicality(data)
    
    return {
      direction: trend.direction,
      strength: trend.strength,
      confidence: trend.confidence,
      seasonality,
      cyclicality,
      forecast: calculateForecast(data, 5)
    }
  }

  const calculatePerformanceMetrics = (metrics: WorkflowMetrics[]) => {
    const executionTimes = metrics.filter(m => m.name === 'execution_time').map(m => m.value)
    const successRates = metrics.filter(m => m.name === 'success_rate').map(m => m.value)
    const throughputs = metrics.filter(m => m.name === 'throughput').map(m => m.value)

    return {
      averageExecutionTime: executionTimes.length > 0 ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length : 0,
      averageSuccessRate: successRates.length > 0 ? successRates.reduce((a, b) => a + b, 0) / successRates.length : 0,
      averageThroughput: throughputs.length > 0 ? throughputs.reduce((a, b) => a + b, 0) / throughputs.length : 0,
      reliability: calculateReliability(successRates),
      efficiency: calculateEfficiency(executionTimes, throughputs),
      stability: calculateStability(executionTimes)
    }
  }

  const detectAnomalyPatterns = (data: any[]) => {
    return detectWorkflowAnomalies(data, {
      method: 'statistical',
      threshold: 2.5,
      window: 10
    })
  }

  const generatePredictiveInsights = (data: any[]) => {
    if (data.length < 10) return null

    return predictWorkflowOutcomes(data, {
      horizon: 24,
      confidence: 0.95,
      method: 'ml'
    })
  }

  const formatChartData = (data: any[], type: string) => {
    switch (type) {
      case 'line':
      case 'area':
        return data.map(d => ({
          ...d,
          timestamp: new Date(d.timestamp).getTime()
        }))
      case 'bar':
      case 'column':
        return data.map(d => ({
          ...d,
          label: formatTimestamp(d.timestamp, 'short')
        }))
      case 'pie':
      case 'donut':
        return data.map(d => ({
          name: d.label || d.category,
          value: d.value,
          percentage: (d.value / data.reduce((sum, item) => sum + item.value, 0)) * 100
        }))
      default:
        return data
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleTimeRangeChange = useCallback((timeRange: string) => {
    const now = new Date()
    let start: Date

    switch (timeRange) {
      case '1h':
        start = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '6h':
        start = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        break
      case '24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    setState(prev => ({
      ...prev,
      selectedTimeRange: timeRange,
      selectedDateRange: { start, end: now }
    }))
  }, [])

  const handleMetricsChange = useCallback((metrics: string[]) => {
    setState(prev => ({ ...prev, selectedMetrics: metrics }))
  }, [])

  const handleVisualizationChange = useCallback((visualization: string) => {
    setState(prev => ({
      ...prev,
      selectedVisualization: visualization,
      chartType: visualization
    }))
  }, [])

  const handleDataPointClick = useCallback((dataPoint: any) => {
    setState(prev => ({ ...prev, selectedDataPoint: dataPoint }))
  }, [])

  const handleDataPointHover = useCallback((dataPoint: any) => {
    setState(prev => ({ ...prev, hoveredDataPoint: dataPoint }))
  }, [])

  const handleDrillDown = useCallback((dimension: string, value: string) => {
    setState(prev => ({
      ...prev,
      drillDownPath: [...prev.drillDownPath, `${dimension}:${value}`]
    }))
  }, [])

  const handleDrillUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      drillDownPath: prev.drillDownPath.slice(0, -1)
    }))
  }, [])

  const handleRefresh = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      await Promise.all([
        refreshMetrics(),
        refreshPerformance(),
        refreshTrends(),
        refreshInsights(),
        refreshRecommendations()
      ])
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data'
      }))
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [refreshMetrics, refreshPerformance, refreshTrends, refreshInsights, refreshRecommendations])

  const handleGenerateInsights = useCallback(async () => {
    if (!canGenerateInsights) return

    try {
      setState(prev => ({ ...prev, isCalculating: true }))
      
      const newInsights = await generateInsights(filteredMetrics)
      const newRecommendations = await generateRecommendations(filteredMetrics)
      
      setState(prev => ({
        ...prev,
        insights: newInsights,
        recommendations: newRecommendations
      }))
      
      newInsights.forEach(insight => onInsightGenerated?.(insight))
      newRecommendations.forEach(recommendation => onRecommendationGenerated?.(recommendation))
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate insights'
      }))
    } finally {
      setState(prev => ({ ...prev, isCalculating: false }))
    }
  }, [canGenerateInsights, filteredMetrics, generateInsights, generateRecommendations, onInsightGenerated, onRecommendationGenerated])

  const handleDetectAnomalies = useCallback(async () => {
    try {
      const detectedAnomalies = await detectAnomalies(filteredMetrics)
      
      setState(prev => ({ ...prev, anomalies: detectedAnomalies }))
      
      detectedAnomalies.forEach(anomaly => onAnomalyDetected?.(anomaly))
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to detect anomalies'
      }))
    }
  }, [filteredMetrics, detectAnomalies, onAnomalyDetected])

  const handleExportData = useCallback(async (format: string) => {
    if (!canExport) return

    try {
      setState(prev => ({ ...prev, isExporting: true }))
      
      const exportData = {
        metrics: filteredMetrics,
        statistics: summaryStatistics,
        trends: trendAnalysis,
        performance: performanceMetrics,
        anomalies: anomalyDetection,
        predictions: predictiveInsights
      }
      
      await exportAnalyticsData(exportData, format)
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export data'
      }))
    } finally {
      setState(prev => ({ ...prev, isExporting: false }))
    }
  }, [canExport, filteredMetrics, summaryStatistics, trendAnalysis, performanceMetrics, anomalyDetection, predictiveInsights])

  const handleToggleRealTime = useCallback(() => {
    setState(prev => ({ ...prev, isRealTime: !prev.isRealTime }))
  }, [])

  const handleToggleAutoRefresh = useCallback(() => {
    setState(prev => ({ ...prev, isAutoRefresh: !prev.isAutoRefresh }))
  }, [])

  const handleConfigurationChange = useCallback((config: Partial<AnalyticsConfiguration>) => {
    setState(prev => ({
      ...prev,
      configuration: { ...prev.configuration, ...config }
    }))
  }, [])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize data
    handleRefresh()
  }, [workflowId, executionId])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      analytics: analytics || null,
      metrics: metrics || [],
      performance: performance || [],
      trends: trends || [],
      insights: insights || [],
      recommendations: recommendations || [],
      statistics: statistics || null,
      kpis: kpis || [],
      dashboard: dashboard || null,
      reports: reports || [],
      benchmarks: benchmarks || [],
      predictions: predictions || [],
      anomalies: anomalies || []
    }))
  }, [analytics, metrics, performance, trends, insights, recommendations, statistics, kpis, dashboard, reports, benchmarks, predictions, anomalies])

  useEffect(() => {
    // Auto-refresh functionality
    if (state.isAutoRefresh && state.isRealTime) {
      const interval = setInterval(handleRefresh, state.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [state.isAutoRefresh, state.isRealTime, state.refreshInterval, handleRefresh])

  useEffect(() => {
    // Update data freshness
    setState(prev => ({
      ...prev,
      lastUpdated: new Date(),
      nextUpdate: state.isAutoRefresh ? new Date(Date.now() + state.refreshInterval) : null
    }))
  }, [filteredMetrics, state.isAutoRefresh, state.refreshInterval])

  useEffect(() => {
    // Automatic anomaly detection
    if (state.showAnomalies && filteredMetrics.length > 0) {
      handleDetectAnomalies()
    }
  }, [filteredMetrics, state.showAnomalies])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderMetricCard = (metric: any, index: number) => (
    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
            <p className="text-2xl font-bold">{formatMetricValue(metric.value, metric.unit)}</p>
            {metric.change && (
              <p className={`text-sm flex items-center ${
                metric.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {formatPercentage(Math.abs(metric.change))}
              </p>
            )}
          </div>
          <div className="text-right">
            {metric.trend && (
              <div className="w-20 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={metric.trend}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={metric.change > 0 ? '#22c55e' : '#ef4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderChart = () => {
    const data = formatChartData(chartData, state.chartType)
    
    if (!isDataAvailable) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data available for the selected time range</p>
          </div>
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        {state.chartType === 'line' && (
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={state.showGrid ? '#e2e8f0' : 'transparent'} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => formatTimestamp(value, 'short')}
            />
            <YAxis />
            {state.showTooltips && (
              <RechartsTooltip 
                formatter={(value, name) => [formatMetricValue(value, 'number'), name]}
                labelFormatter={(value) => formatTimestamp(value, 'long')}
              />
            )}
            {state.showLegend && <Legend />}
            {state.selectedMetrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={state.chartColors[index % state.chartColors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                animationDuration={state.chartAnimation ? 1000 : 0}
              />
            ))}
            {state.showTrends && trendAnalysis && (
              <ReferenceLine 
                stroke="#94a3b8" 
                strokeDasharray="5 5" 
                label="Trend"
              />
            )}
            {state.showAnomalies && anomalyDetection.map((anomaly: any, index: number) => (
              <ReferenceArea
                key={index}
                x1={anomaly.start}
                x2={anomaly.end}
                fill="#ef4444"
                fillOpacity={0.1}
                stroke="#ef4444"
              />
            ))}
          </RechartsLineChart>
        )}
        
        {state.chartType === 'area' && (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={state.showGrid ? '#e2e8f0' : 'transparent'} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => formatTimestamp(value, 'short')}
            />
            <YAxis />
            {state.showTooltips && (
              <RechartsTooltip 
                formatter={(value, name) => [formatMetricValue(value, 'number'), name]}
                labelFormatter={(value) => formatTimestamp(value, 'long')}
              />
            )}
            {state.showLegend && <Legend />}
            {state.selectedMetrics.map((metric, index) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stackId="1"
                stroke={state.chartColors[index % state.chartColors.length]}
                fill={state.chartColors[index % state.chartColors.length]}
                fillOpacity={0.6}
                animationDuration={state.chartAnimation ? 1000 : 0}
              />
            ))}
          </AreaChart>
        )}
        
        {state.chartType === 'bar' && (
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={state.showGrid ? '#e2e8f0' : 'transparent'} />
            <XAxis dataKey="label" />
            <YAxis />
            {state.showTooltips && (
              <RechartsTooltip 
                formatter={(value, name) => [formatMetricValue(value, 'number'), name]}
              />
            )}
            {state.showLegend && <Legend />}
            {state.selectedMetrics.map((metric, index) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={state.chartColors[index % state.chartColors.length]}
                animationDuration={state.chartAnimation ? 1000 : 0}
              />
            ))}
          </RechartsBarChart>
        )}
        
        {state.chartType === 'pie' && (
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              animationDuration={state.chartAnimation ? 1000 : 0}
            >
              {data.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={state.chartColors[index % state.chartColors.length]} 
                />
              ))}
              {state.showTooltips && <LabelList dataKey="name" position="outside" />}
            </Pie>
            {state.showTooltips && (
              <RechartsTooltip 
                formatter={(value, name) => [formatMetricValue(value, 'number'), name]}
              />
            )}
            {state.showLegend && <Legend />}
          </RechartsPieChart>
        )}
      </ResponsiveContainer>
    )
  }

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Workflow Analytics</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={state.selectedTimeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.selectedVisualization} onValueChange={handleVisualizationChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={state.isRealTime ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleRealTime}
              >
                <Activity className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.isRealTime ? 'Disable real-time' : 'Enable real-time'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={state.isAutoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleAutoRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.isAutoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={state.isLoading}>
          <RefreshCw className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportData('csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportData('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportData('xlsx')}>
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportData('pdf')}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderSummaryCards = () => {
    if (!summaryStatistics) return null

    const cards = [
      {
        title: 'Total Records',
        value: summaryStatistics.count,
        icon: Database,
        color: 'text-blue-600'
      },
      {
        title: 'Average Value',
        value: formatMetricValue(summaryStatistics.average, 'number'),
        icon: Target,
        color: 'text-green-600'
      },
      {
        title: 'Maximum Value',
        value: formatMetricValue(summaryStatistics.max, 'number'),
        icon: TrendingUp,
        color: 'text-orange-600'
      },
      {
        title: 'Standard Deviation',
        value: formatMetricValue(summaryStatistics.stdDev, 'number'),
        icon: Activity,
        color: 'text-purple-600'
      }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-background" ref={containerRef}>
      {renderToolbar()}
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={state.view} className="h-full flex flex-col">
          {/* Overview */}
          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              {renderSummaryCards()}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Metrics Visualization</CardTitle>
                      <CardDescription>
                        {state.selectedMetrics.join(', ')} over {state.selectedTimeRange}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderChart()}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  {performanceMetrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg Execution Time</span>
                            <span className="font-medium">{formatDuration(performanceMetrics.averageExecutionTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Success Rate</span>
                            <span className="font-medium">{formatPercentage(performanceMetrics.averageSuccessRate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Throughput</span>
                            <span className="font-medium">{formatNumber(performanceMetrics.averageThroughput)}/min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Reliability</span>
                            <span className="font-medium">{formatPercentage(performanceMetrics.reliability)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {trendAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Trend Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Direction</span>
                            <Badge variant={trendAnalysis.direction === 'up' ? 'default' : 'secondary'}>
                              {trendAnalysis.direction}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Strength</span>
                            <span className="font-medium">{formatPercentage(trendAnalysis.strength)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Confidence</span>
                            <span className="font-medium">{formatPercentage(trendAnalysis.confidence)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {state.insights.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {state.insights.slice(0, 5).map((insight, index) => (
                              <div key={index} className="p-2 rounded-lg bg-muted/50">
                                <p className="text-sm font-medium">{insight.title}</p>
                                <p className="text-xs text-muted-foreground">{insight.description}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Metrics */}
          <TabsContent value="metrics" className="flex-1 overflow-hidden">
            <WorkflowMetricsPanel 
              metrics={state.metrics}
              onMetricsChange={handleMetricsChange}
              onRefresh={refreshMetrics}
            />
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="flex-1 overflow-hidden">
            <WorkflowPerformancePanel 
              performance={state.performance}
              onAnalyze={analyzePerformance}
              onRefresh={refreshPerformance}
            />
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="flex-1 overflow-hidden">
            <WorkflowTrendsPanel 
              trends={state.trends}
              onAnalyze={analyzeTrends}
              onRefresh={refreshTrends}
            />
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <WorkflowInsightsPanel 
                  insights={state.insights}
                  onGenerate={handleGenerateInsights}
                  onRefresh={refreshInsights}
                />
                <WorkflowRecommendationsPanel 
                  recommendations={state.recommendations}
                  onGenerate={generateRecommendations}
                  onRefresh={refreshRecommendations}
                />
              </div>
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="flex-1 overflow-hidden">
            <WorkflowReportsPanel 
              reports={state.reports}
              onGenerate={generateReport}
              onExport={exportReport}
              onRefresh={refreshReports}
            />
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="config" className="flex-1 overflow-hidden">
            <AnalyticsConfigurationPanel 
              configuration={state.configuration}
              onChange={handleConfigurationChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isCalculating || state.isExporting) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>
              {state.isCalculating ? 'Calculating insights...' :
               state.isExporting ? 'Exporting data...' :
               'Loading analytics...'}
            </span>
          </div>
        </div>
      )}

      {/* Error States */}
      {state.error && (
        <Alert className="fixed bottom-4 left-4 w-80" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Data Quality Indicator */}
      {state.lastUpdated && (
        <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              state.dataQuality > 0.9 ? 'bg-green-500' : 
              state.dataQuality > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span>Last updated: {formatTimestamp(state.lastUpdated, 'short')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowAnalytics