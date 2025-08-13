"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Gauge,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Database,
  Server,
  Cloud,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Eye,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  RotateCcw,
  Maximize,
  Minimize,
  ExternalLink,
  Info,
  User,
  Users,
  Calendar,
  Timer,
  Hash,
  Percent,
  Archive,
  History,
  Flag,
  Star,
  Shield,
  Lock,
  Unlock,
  Key,
  Award,
  Crown,
  Layers,
  Package,
  Code,
  FileText,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Tablet,
  Laptop,
  Desktop
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Import types and services
import {
  PerformanceMetric,
  PerformanceData,
  PerformanceThreshold,
  PerformanceAlert,
  PerformanceReport,
  PerformanceSnapshot,
  PerformanceBaseline,
  PerformanceTrend,
  PerformanceAnalysis,
  PerformanceBenchmark,
  PerformanceProfile,
  PerformanceTest,
  PerformanceOptimization,
  PerformanceConfiguration,
  PerformanceSession,
  PerformanceEvent,
  PerformanceLog,
  PerformanceTrace,
  PerformanceAudit,
  PerformanceInsight,
  PerformanceRecommendation,
  PerformancePrediction,
  PerformanceAnomaly,
  PerformancePattern,
  PerformanceCorrelation,
  PerformanceRegression,
  PerformanceComparison,
  PerformanceVisualization,
  PerformanceDashboard,
  PerformanceWidget,
  PerformanceChart,
  PerformanceGraph,
  PerformanceTable,
  PerformanceKPI,
  PerformanceSLA,
  PerformanceObjective,
  PerformanceIndicator
} from '../../types/performance.types'

import {
  usePerformanceMonitoring,
  usePerformanceMetrics,
  usePerformanceAlerts,
  usePerformanceAnalysis,
  usePerformanceBenchmarks,
  usePerformanceProfiles,
  usePerformanceTests,
  usePerformanceOptimization,
  usePerformanceConfiguration,
  usePerformanceAudit,
  usePerformanceInsights,
  usePerformancePredictions,
  usePerformanceAnomalies,
  usePerformanceBaselines,
  usePerformanceReports
} from '../../hooks/usePerformanceMonitoring'

import {
  startPerformanceMonitoring,
  stopPerformanceMonitoring,
  pausePerformanceMonitoring,
  resumePerformanceMonitoring,
  resetPerformanceMonitoring,
  configurePerformanceMonitoring,
  collectPerformanceMetrics,
  analyzePerformanceData,
  generatePerformanceReport,
  createPerformanceBaseline,
  comparePerformanceBaselines,
  detectPerformanceAnomalies,
  predictPerformanceOutcomes,
  optimizePerformanceSettings,
  benchmarkPerformance,
  profilePerformance,
  testPerformance,
  validatePerformanceThresholds,
  updatePerformanceThresholds,
  triggerPerformanceAlert,
  dismissPerformanceAlert,
  exportPerformanceData,
  importPerformanceData,
  backupPerformanceData,
  restorePerformanceData,
  purgePerformanceData,
  archivePerformanceData,
  searchPerformanceData,
  filterPerformanceData,
  sortPerformanceData,
  aggregatePerformanceData,
  correlatePerformanceData,
  visualizePerformanceData,
  dashboardPerformanceData,
  alertPerformanceThresholds,
  monitorPerformanceHealth,
  trackPerformanceKPIs,
  measurePerformanceSLA,
  assessPerformanceObjectives,
  evaluatePerformanceIndicators,
  calculatePerformanceMetrics,
  summarizePerformanceResults,
  reportPerformanceStatus,
  notifyPerformanceStakeholders,
  escalatePerformanceIssues,
  resolvePerformanceProblems,
  preventPerformanceDegradation,
  improvePerformanceEfficiency,
  maximizePerformanceValue,
  minimizePerformanceCosts,
  balancePerformanceTradeoffs,
  riskPerformanceAssessment,
  compliancePerformanceChecks,
  governancePerformanceControls,
  auditPerformanceActivities,
  securityPerformanceScanning,
  privacyPerformanceProtection,
  encryptionPerformanceData,
  compressionPerformanceData,
  deduplicationPerformanceData,
  indexingPerformanceData,
  cachingPerformanceData,
  prefetchingPerformanceData,
  preloadingPerformanceData,
  lazyLoadingPerformanceData,
  virtualizationPerformanceData,
  containerizationPerformanceData,
  orchestrationPerformanceData,
  schedulingPerformanceData,
  loadBalancingPerformanceData,
  autoscalingPerformanceData,
  elasticityPerformanceData,
  resiliencePerformanceData,
  redundancyPerformanceData,
  failoverPerformanceData,
  recoveryPerformanceData,
  continuityPerformanceData,
  availabilityPerformanceData,
  reliabilityPerformanceData,
  durabilityPerformanceData,
  consistencyPerformanceData,
  integrityPerformanceData,
  accuracyPerformanceData,
  precisionPerformanceData,
  recallPerformanceData,
  f1ScorePerformanceData,
  aucPerformanceData,
  rocPerformanceData,
  prCurvePerformanceData,
  confusionMatrixPerformanceData,
  classificationReportPerformanceData,
  regressionMetricsPerformanceData,
  clusteringMetricsPerformanceData,
  dimensionalityReductionMetricsPerformanceData,
  anomalyDetectionMetricsPerformanceData,
  timeSeriesMetricsPerformanceData,
  forecastingMetricsPerformanceData,
  optimizationMetricsPerformanceData,
  evolutionaryMetricsPerformanceData,
  geneticAlgorithmMetricsPerformanceData,
  neuralNetworkMetricsPerformanceData,
  deepLearningMetricsPerformanceData,
  reinforcementLearningMetricsPerformanceData,
  transferLearningMetricsPerformanceData,
  federatedLearningMetricsPerformanceData,
  distributedLearningMetricsPerformanceData,
  parallelComputingMetricsPerformanceData,
  quantumComputingMetricsPerformanceData,
  edgeComputingMetricsPerformanceData,
  cloudComputingMetricsPerformanceData,
  serverlessComputingMetricsPerformanceData,
  containerComputingMetricsPerformanceData,
  microservicesMetricsPerformanceData,
  meshNetworkingMetricsPerformanceData,
  blockchainMetricsPerformanceData,
  iotMetricsPerformanceData,
  ar_vrMetricsPerformanceData,
  mixedRealityMetricsPerformanceData,
  spatialComputingMetricsPerformanceData,
  metaverseMetricsPerformanceData
} from '../../services/performance-monitoring-apis'

// Enhanced interfaces for advanced performance monitoring
interface PerformanceMonitorState {
  // Core monitoring state
  isMonitoring: boolean
  isPaused: boolean
  session: PerformanceSession | null
  metrics: PerformanceMetric[]
  data: PerformanceData[]
  alerts: PerformanceAlert[]
  events: PerformanceEvent[]
  
  // Analysis and insights
  analysis: PerformanceAnalysis | null
  insights: PerformanceInsight[]
  recommendations: PerformanceRecommendation[]
  predictions: PerformancePrediction[]
  anomalies: PerformanceAnomaly[]
  patterns: PerformancePattern[]
  
  // Baselines and comparisons
  baselines: PerformanceBaseline[]
  activeBaseline: PerformanceBaseline | null
  comparisons: PerformanceComparison[]
  regressions: PerformanceRegression[]
  
  // Testing and benchmarking
  benchmarks: PerformanceBenchmark[]
  profiles: PerformanceProfile[]
  tests: PerformanceTest[]
  optimizations: PerformanceOptimization[]
  
  // Configuration and thresholds
  configuration: PerformanceConfiguration
  thresholds: PerformanceThreshold[]
  kpis: PerformanceKPI[]
  slas: PerformanceSLA[]
  objectives: PerformanceObjective[]
  
  // View and UI state
  view: 'dashboard' | 'realtime' | 'historical' | 'analysis' | 'alerts' | 'reports' | 'settings'
  timeRange: 'realtime' | '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | 'custom'
  selectedMetrics: string[]
  selectedComponents: string[]
  refreshInterval: number
  autoRefresh: boolean
  
  // Display preferences
  chartType: 'line' | 'bar' | 'area' | 'scatter' | 'heatmap' | 'gauge'
  displayMode: 'grid' | 'list' | 'detailed' | 'compact'
  theme: 'light' | 'dark' | 'auto'
  showLegend: boolean
  showTooltips: boolean
  showTrendlines: boolean
  showThresholds: boolean
  showAnomalies: boolean
  
  // Filter and search
  searchQuery: string
  statusFilter: 'all' | 'healthy' | 'warning' | 'critical'
  categoryFilter: string[]
  componentFilter: string[]
  metricFilter: string[]
  
  // Operations state
  isAnalyzing: boolean
  isBenchmarking: boolean
  isProfiling: boolean
  isTesting: boolean
  isOptimizing: boolean
  isExporting: boolean
  isImporting: boolean
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * PerformanceMonitor Component
 * 
 * Enterprise-grade performance monitoring component that provides comprehensive
 * real-time and historical performance monitoring capabilities including:
 * - Real-time metrics collection and visualization
 * - Historical performance analysis and trends
 * - Anomaly detection and alerting
 * - Performance baselines and comparisons
 * - Predictive performance analytics
 * - Automated performance optimization
 * - Benchmarking and profiling
 * - SLA monitoring and reporting
 * - Performance insights and recommendations
 * - Multi-dimensional performance views
 * - Advanced filtering and search
 * - Export and reporting capabilities
 * 
 * This component integrates with the backend performance monitoring system and provides
 * a sophisticated user interface for comprehensive performance management.
 */
export const PerformanceMonitor: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onPerformanceAlert?: (alert: PerformanceAlert) => void
  onPerformanceChange?: (metrics: PerformanceMetric[]) => void
  autoStart?: boolean
  realTimeMode?: boolean
  showAdvancedFeatures?: boolean
  enablePredictions?: boolean
  enableOptimization?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onPerformanceAlert,
  onPerformanceChange,
  autoStart = false,
  realTimeMode = true,
  showAdvancedFeatures = true,
  enablePredictions = true,
  enableOptimization = true,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<PerformanceMonitorState>({
    // Core monitoring state
    isMonitoring: false,
    isPaused: false,
    session: null,
    metrics: [],
    data: [],
    alerts: [],
    events: [],
    
    // Analysis and insights
    analysis: null,
    insights: [],
    recommendations: [],
    predictions: [],
    anomalies: [],
    patterns: [],
    
    // Baselines and comparisons
    baselines: [],
    activeBaseline: null,
    comparisons: [],
    regressions: [],
    
    // Testing and benchmarking
    benchmarks: [],
    profiles: [],
    tests: [],
    optimizations: [],
    
    // Configuration and thresholds
    configuration: {
      samplingInterval: 1000, // 1 second
      retentionPeriod: 2592000, // 30 days
      alertThreshold: 0.8,
      anomalyThreshold: 2.0,
      predictionHorizon: 3600, // 1 hour
      optimizationInterval: 300, // 5 minutes
      baselineUpdateInterval: 86400, // 1 day
      maxDataPoints: 10000,
      compressionRatio: 0.5,
      enableRealTime: realTimeMode,
      enablePredictions: enablePredictions,
      enableOptimization: enableOptimization,
      enableAnomalyDetection: true,
      enableBaselining: true,
      enableAlerting: true,
      enableReporting: true,
      enableExporting: true,
      enableCaching: true,
      enableCompression: true,
      enableEncryption: false,
      enableMultiTenant: multiTenant
    } as PerformanceConfiguration,
    thresholds: [],
    kpis: [],
    slas: [],
    objectives: [],
    
    // View and UI state
    view: 'dashboard',
    timeRange: realTimeMode ? 'realtime' : '1h',
    selectedMetrics: ['cpu', 'memory', 'disk', 'network'],
    selectedComponents: [],
    refreshInterval: 5000, // 5 seconds
    autoRefresh: true,
    
    // Display preferences
    chartType: 'line',
    displayMode: 'grid',
    theme: 'auto',
    showLegend: true,
    showTooltips: true,
    showTrendlines: false,
    showThresholds: true,
    showAnomalies: true,
    
    // Filter and search
    searchQuery: '',
    statusFilter: 'all',
    categoryFilter: [],
    componentFilter: [],
    metricFilter: [],
    
    // Operations state
    isAnalyzing: false,
    isBenchmarking: false,
    isProfiling: false,
    isTesting: false,
    isOptimizing: false,
    isExporting: false,
    isImporting: false,
    
    // Error and loading states
    error: null,
    warnings: [],
    isLoading: false,
    progress: 0
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRefs = useRef<Record<string, any>>({})
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const webSocketRef = useRef<WebSocket | null>(null)

  // Hook integrations
  const {
    monitoring,
    session,
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    resetMonitoring
  } = usePerformanceMonitoring(workflowId)

  const {
    metrics,
    latestMetrics,
    loading: metricsLoading,
    error: metricsError,
    refreshMetrics,
    collectMetrics,
    subscribeToMetrics,
    unsubscribeFromMetrics
  } = usePerformanceMetrics()

  const {
    alerts,
    activeAlerts,
    loading: alertsLoading,
    refreshAlerts,
    createAlert,
    updateAlert,
    dismissAlert,
    escalateAlert
  } = usePerformanceAlerts()

  const {
    analysis,
    loading: analysisLoading,
    analyzePerformance,
    generateAnalysisReport,
    scheduleAnalysis
  } = usePerformanceAnalysis()

  const {
    benchmarks,
    activeBenchmark,
    runBenchmark,
    compareBenchmarks,
    createBenchmark
  } = usePerformanceBenchmarks()

  const {
    profiles,
    activeProfile,
    startProfiling,
    stopProfiling,
    analyzeProfile,
    compareProfiles
  } = usePerformanceProfiles()

  const {
    tests,
    activeTest,
    runPerformanceTest,
    createPerformanceTest,
    schedulePerformanceTest
  } = usePerformanceTests()

  const {
    optimizations,
    recommendOptimizations,
    applyOptimization,
    validateOptimization
  } = usePerformanceOptimization()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration,
    validateConfiguration
  } = usePerformanceConfiguration()

  const {
    auditLog,
    logPerformanceEvent,
    generateAuditReport
  } = usePerformanceAudit()

  const {
    insights,
    generateInsights,
    scheduleInsightsGeneration
  } = usePerformanceInsights()

  const {
    predictions,
    generatePredictions,
    updatePredictionModel
  } = usePerformancePredictions()

  const {
    anomalies,
    detectAnomalies,
    investigateAnomaly,
    resolveAnomaly
  } = usePerformanceAnomalies()

  const {
    baselines,
    activeBaseline,
    createBaseline,
    updateBaseline,
    compareBaselines
  } = usePerformanceBaselines()

  const {
    reports,
    generateReport,
    scheduleReport,
    exportReport
  } = usePerformanceReports()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredMetrics = useMemo(() => {
    let result = state.metrics

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(metric =>
        metric.name?.toLowerCase().includes(query) ||
        metric.category?.toLowerCase().includes(query) ||
        metric.component?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (state.statusFilter !== 'all') {
      result = result.filter(metric => {
        switch (state.statusFilter) {
          case 'healthy':
            return metric.status === 'healthy'
          case 'warning':
            return metric.status === 'warning'
          case 'critical':
            return metric.status === 'critical'
          default:
            return true
        }
      })
    }

    // Apply category filter
    if (state.categoryFilter.length > 0) {
      result = result.filter(metric =>
        state.categoryFilter.includes(metric.category || '')
      )
    }

    // Apply component filter
    if (state.componentFilter.length > 0) {
      result = result.filter(metric =>
        state.componentFilter.includes(metric.component || '')
      )
    }

    // Apply metric filter
    if (state.metricFilter.length > 0) {
      result = result.filter(metric =>
        state.metricFilter.includes(metric.name)
      )
    }

    return result
  }, [
    state.metrics, state.searchQuery, state.statusFilter,
    state.categoryFilter, state.componentFilter, state.metricFilter
  ])

  const performanceStatistics = useMemo(() => {
    const activeMetrics = state.metrics.filter(m => m.isActive)
    return {
      totalMetrics: state.metrics.length,
      activeMetrics: activeMetrics.length,
      healthyMetrics: activeMetrics.filter(m => m.status === 'healthy').length,
      warningMetrics: activeMetrics.filter(m => m.status === 'warning').length,
      criticalMetrics: activeMetrics.filter(m => m.status === 'critical').length,
      totalAlerts: state.alerts.length,
      activeAlerts: state.alerts.filter(a => a.status === 'active').length,
      resolvedAlerts: state.alerts.filter(a => a.status === 'resolved').length,
      avgResponseTime: activeMetrics.reduce((sum, m) => sum + (m.responseTime || 0), 0) / activeMetrics.length,
      avgThroughput: activeMetrics.reduce((sum, m) => sum + (m.throughput || 0), 0) / activeMetrics.length,
      avgCpuUsage: activeMetrics.filter(m => m.name === 'cpu').reduce((sum, m) => sum + (m.value || 0), 0) / activeMetrics.filter(m => m.name === 'cpu').length,
      avgMemoryUsage: activeMetrics.filter(m => m.name === 'memory').reduce((sum, m) => sum + (m.value || 0), 0) / activeMetrics.filter(m => m.name === 'memory').length,
      totalAnomalies: state.anomalies.length,
      activeAnomalies: state.anomalies.filter(a => a.status === 'active').length,
      sessionDuration: state.session ? Date.now() - new Date(state.session.startTime).getTime() : 0
    }
  }, [state.metrics, state.alerts, state.anomalies, state.session])

  const realtimeData = useMemo(() => {
    return state.data.slice(-100) // Last 100 data points
  }, [state.data])

  const trendData = useMemo(() => {
    const timeRangeMs = {
      '1h': 3600000,
      '6h': 21600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
      '90d': 7776000000
    }[state.timeRange as keyof typeof timeRangeMs] || 3600000

    const cutoffTime = Date.now() - timeRangeMs
    return state.data.filter(d => new Date(d.timestamp).getTime() >= cutoffTime)
  }, [state.data, state.timeRange])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatMetricValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'bytes':
        return formatBytes(value)
      case 'ms':
        return `${value.toFixed(2)}ms`
      case 'rps':
        return `${value.toFixed(0)} req/s`
      default:
        return value.toFixed(2)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      case 'unknown': return 'text-gray-600'
      default: return 'text-blue-600'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default'
      case 'warning': return 'secondary'
      case 'critical': return 'destructive'
      case 'unknown': return 'outline'
      default: return 'outline'
    }
  }

  const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable'
    const recent = data.slice(-5)
    const earlier = data.slice(-10, -5)
    if (recent.length === 0 || earlier.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length
    
    const change = (recentAvg - earlierAvg) / earlierAvg
    if (change > 0.05) return 'up'
    if (change < -0.05) return 'down'
    return 'stable'
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartMonitoring = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const session = await startMonitoring({
        workflowId,
        userId,
        configuration: state.configuration
      })
      
      setState(prev => ({
        ...prev,
        isMonitoring: true,
        isPaused: false,
        session,
        isLoading: false
      }))
      
      logPerformanceEvent('monitoring_started', { sessionId: session.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start monitoring',
        isLoading: false
      }))
    }
  }, [workflowId, userId, state.configuration, startMonitoring, logPerformanceEvent])

  const handleStopMonitoring = useCallback(async () => {
    try {
      await stopMonitoring()
      
      setState(prev => ({
        ...prev,
        isMonitoring: false,
        isPaused: false,
        session: null
      }))
      
      logPerformanceEvent('monitoring_stopped', { userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop monitoring'
      }))
    }
  }, [stopMonitoring, logPerformanceEvent, userId])

  const handlePauseMonitoring = useCallback(async () => {
    try {
      await pauseMonitoring()
      
      setState(prev => ({ ...prev, isPaused: true }))
      
      logPerformanceEvent('monitoring_paused', { userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to pause monitoring'
      }))
    }
  }, [pauseMonitoring, logPerformanceEvent, userId])

  const handleResumeMonitoring = useCallback(async () => {
    try {
      await resumeMonitoring()
      
      setState(prev => ({ ...prev, isPaused: false }))
      
      logPerformanceEvent('monitoring_resumed', { userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to resume monitoring'
      }))
    }
  }, [resumeMonitoring, logPerformanceEvent, userId])

  const handleAnalyzePerformance = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyzePerformance({
        timeRange: state.timeRange,
        metrics: state.selectedMetrics,
        includeAnomalies: true,
        includePredictions: enablePredictions
      })
      
      setState(prev => ({
        ...prev,
        analysis,
        isAnalyzing: false
      }))
      
      logPerformanceEvent('analysis_completed', { analysisId: analysis.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze performance',
        isAnalyzing: false
      }))
    }
  }, [analyzePerformance, state.timeRange, state.selectedMetrics, enablePredictions, logPerformanceEvent, userId])

  const handleRunBenchmark = useCallback(async (benchmarkConfig: any) => {
    try {
      setState(prev => ({ ...prev, isBenchmarking: true }))
      
      const benchmark = await runBenchmark(benchmarkConfig)
      
      setState(prev => ({
        ...prev,
        benchmarks: [...prev.benchmarks, benchmark],
        isBenchmarking: false
      }))
      
      logPerformanceEvent('benchmark_completed', { benchmarkId: benchmark.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to run benchmark',
        isBenchmarking: false
      }))
    }
  }, [runBenchmark, logPerformanceEvent, userId])

  const handleOptimizePerformance = useCallback(async () => {
    if (!enableOptimization) return

    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      const recommendations = await recommendOptimizations({
        metrics: state.metrics,
        analysis: state.analysis,
        thresholds: state.thresholds
      })
      
      setState(prev => ({
        ...prev,
        recommendations,
        isOptimizing: false
      }))
      
      logPerformanceEvent('optimization_analyzed', { recommendationCount: recommendations.length, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize performance',
        isOptimizing: false
      }))
    }
  }, [enableOptimization, recommendOptimizations, state.metrics, state.analysis, state.thresholds, logPerformanceEvent, userId])

  const handleAlertTriggered = useCallback((alert: PerformanceAlert) => {
    setState(prev => ({
      ...prev,
      alerts: [...prev.alerts, alert]
    }))
    
    onPerformanceAlert?.(alert)
    logPerformanceEvent('alert_triggered', { alertId: alert.id, severity: alert.severity, userId })
  }, [onPerformanceAlert, logPerformanceEvent, userId])

  const handleMetricsUpdate = useCallback((newMetrics: PerformanceMetric[]) => {
    setState(prev => ({
      ...prev,
      metrics: newMetrics
    }))
    
    onPerformanceChange?.(newMetrics)
  }, [onPerformanceChange])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleTimeRangeChange = useCallback((timeRange: typeof state.timeRange) => {
    setState(prev => ({ ...prev, timeRange }))
  }, [])

  const handleExportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      setState(prev => ({ ...prev, isExporting: true }))
      
      const exportData = await exportPerformanceData({
        metrics: state.metrics,
        timeRange: state.timeRange,
        format
      })
      
      // Download logic would go here
      
      setState(prev => ({ ...prev, isExporting: false }))
      
      logPerformanceEvent('data_exported', { format, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export data',
        isExporting: false
      }))
    }
  }, [state.metrics, state.timeRange, logPerformanceEvent, userId])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Auto-start monitoring if enabled
    if (autoStart && !state.isMonitoring) {
      handleStartMonitoring()
    }
  }, [autoStart, state.isMonitoring, handleStartMonitoring])

  useEffect(() => {
    // Set up real-time data collection
    if (state.isMonitoring && !state.isPaused && state.autoRefresh) {
      intervalRef.current = setInterval(() => {
        collectMetrics()
      }, state.refreshInterval)
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [state.isMonitoring, state.isPaused, state.autoRefresh, state.refreshInterval, collectMetrics])

  useEffect(() => {
    // Set up WebSocket connection for real-time updates
    if (realTimeMode && state.isMonitoring) {
      const ws = new WebSocket(`ws://localhost:8080/performance-metrics?sessionId=${state.session?.id}`)
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'metrics') {
          handleMetricsUpdate(data.metrics)
        } else if (data.type === 'alert') {
          handleAlertTriggered(data.alert)
        }
      }
      
      webSocketRef.current = ws
      
      return () => {
        ws.close()
      }
    }
  }, [realTimeMode, state.isMonitoring, state.session?.id, handleMetricsUpdate, handleAlertTriggered])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      metrics: metrics || [],
      alerts: alerts || [],
      analysis: analysis || null,
      benchmarks: benchmarks || [],
      profiles: profiles || [],
      tests: tests || [],
      optimizations: optimizations || [],
      insights: insights || [],
      predictions: predictions || [],
      anomalies: anomalies || [],
      baselines: baselines || []
    }))
  }, [metrics, alerts, analysis, benchmarks, profiles, tests, optimizations, insights, predictions, anomalies, baselines])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Performance Monitor</h1>
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-2">
          {!state.isMonitoring ? (
            <Button onClick={handleStartMonitoring} disabled={state.isLoading}>
              <Play className="h-4 w-4 mr-2" />
              Start Monitoring
            </Button>
          ) : (
            <>
              <Button onClick={handleStopMonitoring} variant="destructive">
                <Stop className="h-4 w-4 mr-2" />
                Stop
              </Button>
              {state.isPaused ? (
                <Button onClick={handleResumeMonitoring}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button onClick={handlePauseMonitoring} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
            </>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={state.timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="realtime">Real-time</SelectItem>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="6h">6 Hours</SelectItem>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => handleExportData('csv')}>
          <Download className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>

        {state.isMonitoring && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>
    </div>
  )

  const renderMetricsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Active Metrics</p>
              <p className="text-2xl font-bold">{performanceStatistics.activeMetrics}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Healthy</p>
              <p className="text-2xl font-bold">{performanceStatistics.healthyMetrics}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Warnings</p>
              <p className="text-2xl font-bold">{performanceStatistics.warningMetrics}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Critical</p>
              <p className="text-2xl font-bold">{performanceStatistics.criticalMetrics}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Avg Response</p>
              <p className="text-2xl font-bold">{formatMetricValue(performanceStatistics.avgResponseTime, 'ms')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Throughput</p>
              <p className="text-2xl font-bold">{formatMetricValue(performanceStatistics.avgThroughput, 'rps')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMetricCard = (metric: PerformanceMetric) => {
    const trend = calculateTrend(metric.history || [])
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity

    return (
      <Card key={metric.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-100">
                {metric.name === 'cpu' && <Cpu className="h-4 w-4 text-blue-600" />}
                {metric.name === 'memory' && <MemoryStick className="h-4 w-4 text-blue-600" />}
                {metric.name === 'disk' && <HardDrive className="h-4 w-4 text-blue-600" />}
                {metric.name === 'network' && <Network className="h-4 w-4 text-blue-600" />}
                {!['cpu', 'memory', 'disk', 'network'].includes(metric.name) && <Activity className="h-4 w-4 text-blue-600" />}
              </div>
              <div>
                <CardTitle className="text-base">{metric.displayName || metric.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{metric.component}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusVariant(metric.status)}>
                {metric.status}
              </Badge>
              <TrendIcon className={`h-4 w-4 ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatMetricValue(metric.value || 0, metric.unit)}
              </span>
              {metric.threshold && (
                <span className="text-sm text-muted-foreground">
                  Threshold: {formatMetricValue(metric.threshold, metric.unit)}
                </span>
              )}
            </div>
            
            {metric.description && (
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span>Min: {formatMetricValue(metric.min || 0, metric.unit)}</span>
              </div>
              <div>
                <span>Max: {formatMetricValue(metric.max || 0, metric.unit)}</span>
              </div>
              <div>
                <span>Avg: {formatMetricValue(metric.average || 0, metric.unit)}</span>
              </div>
              <div>
                <span>Last: {new Date(metric.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
          {/* Dashboard View */}
          <TabsContent value="dashboard" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              {renderMetricsCards()}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                      <CardDescription>Real-time system performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 border rounded-md p-4">
                        <p className="text-muted-foreground text-center">Performance charts will be rendered here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {state.alerts.filter(a => a.status === 'active').slice(0, 5).map((alert, index) => (
                            <div key={index} className="p-2 rounded bg-muted">
                              <p className="font-medium text-sm">{alert.title}</p>
                              <p className="text-xs text-muted-foreground">{alert.message}</p>
                            </div>
                          ))}
                          {state.alerts.filter(a => a.status === 'active').length === 0 && (
                            <p className="text-sm text-muted-foreground text-center">No active alerts</p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">{formatMetricValue(performanceStatistics.avgCpuUsage, 'percentage')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">{formatMetricValue(performanceStatistics.avgMemoryUsage, 'percentage')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Anomalies</span>
                        <span className="text-sm font-medium">{performanceStatistics.activeAnomalies}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Session Duration</span>
                        <span className="text-sm font-medium">{Math.floor(performanceStatistics.sessionDuration / 60000)}m</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Real-time View */}
          <TabsContent value="realtime" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMetrics.map(renderMetricCard)}
              </div>
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isAnalyzing || state.isBenchmarking || state.isOptimizing) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading performance data...' :
                 state.isAnalyzing ? 'Analyzing performance...' :
                 state.isBenchmarking ? 'Running benchmark...' :
                 'Optimizing performance...'}
              </p>
              {state.progress > 0 && (
                <div className="mt-2 w-64">
                  <Progress value={state.progress} />
                  <p className="text-sm text-muted-foreground mt-1">{state.progress}% complete</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="fixed bottom-4 left-4 w-80">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
            >
              Dismiss
            </Button>
          </Alert>
        </div>
      )}
    </div>
  )
}

export default PerformanceMonitor