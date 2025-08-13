"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Timer,
  Zap,
  TrendingDown,
  Activity,
  Target,
  Gauge,
  BarChart3,
  LineChart,
  PieChart,
  Clock,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Server,
  Cpu,
  MemoryStick,
  Network,
  Database,
  Calendar,
  Users,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Flag,
  Star,
  Shield,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  Copy,
  Code,
  FileText,
  Archive,
  History,
  Award,
  Crown,
  Hash,
  Percent,
  DollarSign,
  TrendingUpDown,
  Maximize,
  Minimize,
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  BatteryLow,
  Thermometer,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Package,
  Layers,
  Globe
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
  LatencyMetric,
  LatencyTarget,
  LatencyOptimization,
  LatencyAnalysis,
  LatencyConfiguration,
  LatencyProfile,
  LatencyThreshold,
  LatencyAlert,
  LatencyEvent,
  LatencyLog,
  LatencyReport,
  LatencyBenchmark,
  LatencyTest,
  LatencyReduction,
  LatencyPrediction,
  LatencyRecommendation,
  LatencyStrategy,
  LatencyMonitoring,
  LatencyStatistics,
  LatencyTrend,
  LatencyPattern,
  LatencyAnomaly,
  LatencyBaseline,
  LatencyForecast,
  LatencyBottleneck,
  LatencyOptimizer,
  LatencyEngine,
  LatencyController,
  LatencyProcessor,
  LatencyDistribution,
  LatencyPercentile,
  LatencyHistogram,
  LatencyHeatmap
} from '../../types/latency.types'

import {
  useLatencyReducer,
  useLatencyMetrics,
  useLatencyConfiguration,
  useLatencyMonitoring,
  useLatencyAnalysis,
  useLatencyOptimization,
  useLatencyTargets,
  useLatencyBenchmarks,
  useLatencyTests,
  useLatencyPredictions,
  useLatencyRecommendations,
  useLatencyAudit
} from '../../hooks/useLatencyReducer'

import {
  createLatencyReducer,
  updateLatencyReducer,
  deleteLatencyReducer,
  startLatencyReducer,
  stopLatencyReducer,
  restartLatencyReducer,
  pauseLatencyReducer,
  resumeLatencyReducer,
  optimizeLatency,
  analyzeLatency,
  monitorLatency,
  benchmarkLatency,
  testLatency,
  measureLatency,
  calculateLatency,
  predictLatency,
  forecastLatency,
  reduceLatency,
  minimizeLatency,
  eliminateLatency,
  compressLatency,
  accelerateLatency,
  streamlineLatency,
  optimizeLatencyPath,
  cacheLatency,
  preloadLatency,
  pipelineLatency,
  parallelizeLatency,
  batchLatency,
  queueLatency,
  bufferLatency,
  validateLatency,
  verifyLatency,
  auditLatency,
  reportLatency,
  visualizeLatency,
  alertLatency,
  notifyLatency,
  escalateLatency,
  resolveLatency,
  mitigateLatency,
  preventLatency,
  recoverLatency,
  restoreLatency,
  backupLatency,
  archiveLatency,
  exportLatency,
  importLatency,
  migrateLatency,
  upgradeLatency,
  downgradeFe
} from '../../services/latency-reducer-apis'

// Enhanced interfaces for advanced latency reduction
interface LatencyReducerState {
  // Core reducer state
  isRunning: boolean
  isOptimizing: boolean
  isAnalyzing: boolean
  isMonitoring: boolean
  isBenchmarking: boolean
  isTesting: boolean
  isPredicting: boolean
  isReducing: boolean
  
  // Latency data
  metrics: LatencyMetric[]
  targets: LatencyTarget[]
  optimizations: LatencyOptimization[]
  analyses: LatencyAnalysis[]
  profiles: LatencyProfile[]
  thresholds: LatencyThreshold[]
  
  // Selected items
  selectedMetric: LatencyMetric | null
  selectedTarget: LatencyTarget | null
  selectedOptimization: LatencyOptimization | null
  selectedProfile: LatencyProfile | null
  
  // Configuration
  configuration: LatencyConfiguration
  benchmarks: LatencyBenchmark[]
  tests: LatencyTest[]
  reductions: LatencyReduction[]
  
  // Monitoring and alerts
  alerts: LatencyAlert[]
  events: LatencyEvent[]
  logs: LatencyLog[]
  reports: LatencyReport[]
  
  // Analysis and predictions
  statistics: LatencyStatistics | null
  trends: LatencyTrend[]
  patterns: LatencyPattern[]
  anomalies: LatencyAnomaly[]
  baselines: LatencyBaseline[]
  forecasts: LatencyForecast[]
  predictions: LatencyPrediction[]
  recommendations: LatencyRecommendation[]
  bottlenecks: LatencyBottleneck[]
  
  // View and UI state
  view: 'dashboard' | 'metrics' | 'optimization' | 'analysis' | 'monitoring' | 'benchmarks' | 'tests' | 'settings'
  timeRange: '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
  granularity: 'second' | 'minute' | 'hour' | 'day'
  aggregation: 'avg' | 'min' | 'max' | 'p50' | 'p95' | 'p99'
  
  // Display preferences
  chartType: 'line' | 'bar' | 'area' | 'histogram' | 'heatmap' | 'distribution'
  displayMode: 'grid' | 'list' | 'detailed' | 'compact'
  showTargets: boolean
  showThresholds: boolean
  showAlerts: boolean
  showTrends: boolean
  showPredictions: boolean
  showBottlenecks: boolean
  autoRefresh: boolean
  refreshInterval: number
  
  // Filter and search
  searchQuery: string
  statusFilter: 'all' | 'healthy' | 'warning' | 'critical' | 'unknown'
  typeFilter: string[]
  sourceFilter: string[]
  targetFilter: string[]
  
  // Optimization settings
  optimizationGoal: 'minimize' | 'stabilize' | 'target' | 'percentile'
  optimizationStrategy: 'aggressive' | 'conservative' | 'balanced' | 'adaptive'
  optimizationMode: 'automatic' | 'manual' | 'hybrid' | 'scheduled'
  
  // Latency-specific settings
  targetLatency: number
  maxLatency: number
  minLatency: number
  averageLatency: number
  currentLatency: number
  latencyUnit: 'ms' | 'us' | 'ns' | 's'
  
  // Performance thresholds
  warningThreshold: number
  criticalThreshold: number
  targetThreshold: number
  baselineThreshold: number
  
  // Percentile settings
  p50Threshold: number
  p95Threshold: number
  p99Threshold: number
  p999Threshold: number
  
  // Operations state
  isCreating: boolean
  isDeleting: boolean
  isUpdating: boolean
  isStarting: boolean
  isStopping: boolean
  isRestarting: boolean
  isPausing: boolean
  isResuming: boolean
  isConfiguring: boolean
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * LatencyReducer Component
 * 
 * Enterprise-grade latency reduction component that provides comprehensive
 * latency management and optimization capabilities including:
 * - Real-time latency monitoring and measurement
 * - Intelligent latency optimization and reduction
 * - Latency target management and tracking
 * - Advanced latency analysis and prediction
 * - Latency bottleneck detection and resolution
 * - Performance benchmarking and testing
 * - Latency pattern recognition and anomaly detection
 * - Multi-percentile latency visualization
 * - Comprehensive latency reporting and analytics
 * - Automated latency optimization strategies
 * - Latency SLA monitoring and compliance
 * - Latency distribution analysis
 * 
 * This component integrates with the backend latency reduction system and provides
 * a sophisticated user interface for comprehensive latency management.
 */
export const LatencyReducer: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onLatencyOptimized?: (optimization: LatencyOptimization) => void
  onTargetAchieved?: (target: LatencyTarget) => void
  autoOptimize?: boolean
  enablePredictions?: boolean
  enableRecommendations?: boolean
  enableBottleneckDetection?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onLatencyOptimized,
  onTargetAchieved,
  autoOptimize = false,
  enablePredictions = true,
  enableRecommendations = true,
  enableBottleneckDetection = true,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<LatencyReducerState>({
    // Core reducer state
    isRunning: false,
    isOptimizing: false,
    isAnalyzing: false,
    isMonitoring: true,
    isBenchmarking: false,
    isTesting: false,
    isPredicting: false,
    isReducing: false,
    
    // Latency data
    metrics: [],
    targets: [],
    optimizations: [],
    analyses: [],
    profiles: [],
    thresholds: [],
    
    // Selected items
    selectedMetric: null,
    selectedTarget: null,
    selectedOptimization: null,
    selectedProfile: null,
    
    // Configuration
    configuration: {
      targetLatency: 100, // 100ms
      maxLatency: 1000, // 1s
      minLatency: 1, // 1ms
      unit: 'ms',
      samplingInterval: 1000, // 1 second
      aggregationWindow: 60000, // 1 minute
      optimizationInterval: 300000, // 5 minutes
      analysisInterval: 900000, // 15 minutes
      enableAutoOptimization: autoOptimize,
      enablePredictions: enablePredictions,
      enableRecommendations: enableRecommendations,
      enableBottleneckDetection: enableBottleneckDetection,
      enableMonitoring: true,
      enableAlerting: true,
      enableLogging: true,
      retentionPeriod: 2592000000, // 30 days
      warningThreshold: 150, // 150ms
      criticalThreshold: 500, // 500ms
      targetThreshold: 100, // 100ms
      baselineThreshold: 50, // 50ms
      p50Threshold: 80, // 80ms
      p95Threshold: 200, // 200ms
      p99Threshold: 500, // 500ms
      p999Threshold: 1000, // 1s
      adaptiveThresholds: true,
      smartAlerting: true,
      anomalyDetection: true,
      patternRecognition: true,
      trendAnalysis: true,
      forecastingEnabled: true,
      optimizationStrategy: 'balanced',
      compressionEnabled: true,
      cachingEnabled: true,
      pipeliningEnabled: true,
      parallelizationEnabled: true,
      batchingEnabled: true,
      streamingEnabled: false,
      preloadingEnabled: false,
      prefetchingEnabled: false,
      asynchronousEnabled: true,
      nonBlockingEnabled: true,
      circuitBreakerEnabled: true,
      retryEnabled: true,
      timeoutEnabled: true,
      rateLimitingEnabled: false,
      throttlingEnabled: false,
      loadBalancingEnabled: true,
      connectionPoolingEnabled: true,
      keepAliveEnabled: true
    } as LatencyConfiguration,
    benchmarks: [],
    tests: [],
    reductions: [],
    
    // Monitoring and alerts
    alerts: [],
    events: [],
    logs: [],
    reports: [],
    
    // Analysis and predictions
    statistics: null,
    trends: [],
    patterns: [],
    anomalies: [],
    baselines: [],
    forecasts: [],
    predictions: [],
    recommendations: [],
    bottlenecks: [],
    
    // View and UI state
    view: 'dashboard',
    timeRange: '1h',
    granularity: 'minute',
    aggregation: 'avg',
    
    // Display preferences
    chartType: 'line',
    displayMode: 'grid',
    showTargets: true,
    showThresholds: true,
    showAlerts: true,
    showTrends: true,
    showPredictions: enablePredictions,
    showBottlenecks: enableBottleneckDetection,
    autoRefresh: true,
    refreshInterval: 5000, // 5 seconds
    
    // Filter and search
    searchQuery: '',
    statusFilter: 'all',
    typeFilter: [],
    sourceFilter: [],
    targetFilter: [],
    
    // Optimization settings
    optimizationGoal: 'minimize',
    optimizationStrategy: 'balanced',
    optimizationMode: autoOptimize ? 'automatic' : 'manual',
    
    // Latency-specific settings
    targetLatency: 100,
    maxLatency: 1000,
    minLatency: 1,
    averageLatency: 0,
    currentLatency: 0,
    latencyUnit: 'ms',
    
    // Performance thresholds
    warningThreshold: 150,
    criticalThreshold: 500,
    targetThreshold: 100,
    baselineThreshold: 50,
    
    // Percentile settings
    p50Threshold: 80,
    p95Threshold: 200,
    p99Threshold: 500,
    p999Threshold: 1000,
    
    // Operations state
    isCreating: false,
    isDeleting: false,
    isUpdating: false,
    isStarting: false,
    isStopping: false,
    isRestarting: false,
    isPausing: false,
    isResuming: false,
    isConfiguring: false,
    
    // Error and loading states
    error: null,
    warnings: [],
    isLoading: false,
    progress: 0
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const optimizationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Hook integrations
  const {
    reducer,
    isActive,
    start,
    stop,
    restart,
    refresh
  } = useLatencyReducer(workflowId)

  const {
    metrics,
    latestMetrics,
    refreshMetrics,
    collectMetrics
  } = useLatencyMetrics()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration
  } = useLatencyConfiguration()

  const {
    monitoring,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshMonitoring
  } = useLatencyMonitoring()

  const {
    analysis,
    reports,
    analyzePerformance,
    generateReport,
    scheduleAnalysis
  } = useLatencyAnalysis()

  const {
    optimization,
    optimizations,
    startOptimization,
    stopOptimization,
    scheduleOptimization
  } = useLatencyOptimization()

  const {
    targets,
    activeTargets,
    createTarget,
    updateTarget,
    deleteTarget,
    refreshTargets
  } = useLatencyTargets()

  const {
    benchmarks,
    latestBenchmarks,
    runBenchmark,
    compareBenchmarks,
    refreshBenchmarks
  } = useLatencyBenchmarks()

  const {
    tests,
    runningTests,
    runTest,
    stopTest,
    refreshTests
  } = useLatencyTests()

  const {
    predictions,
    forecasts,
    generatePredictions,
    updatePredictions,
    refreshPredictions
  } = useLatencyPredictions()

  const {
    recommendations,
    activeRecommendations,
    generateRecommendations,
    applyRecommendation,
    refreshRecommendations
  } = useLatencyRecommendations()

  const {
    auditLog,
    logEvent,
    generateAuditReport
  } = useLatencyAudit()

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
        metric.type?.toLowerCase().includes(query) ||
        metric.source?.toLowerCase().includes(query)
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
          case 'unknown':
            return metric.status === 'unknown'
          default:
            return true
        }
      })
    }

    return result
  }, [state.metrics, state.searchQuery, state.statusFilter])

  const latencyStatistics = useMemo(() => {
    const activeMetrics = state.metrics.filter(m => m.status !== 'unknown')
    
    if (activeMetrics.length === 0) {
      return {
        totalMetrics: 0,
        healthyMetrics: 0,
        warningMetrics: 0,
        criticalMetrics: 0,
        averageLatency: 0,
        currentLatency: 0,
        maxLatency: 0,
        minLatency: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        targetAchievement: 0,
        reductionOpportunities: 0,
        bottlenecks: 0,
        trends: 'stable',
        prediction: 'stable'
      }
    }

    const currentValues = activeMetrics.map(m => m.currentValue || 0)
    const targetValues = activeMetrics.map(m => m.targetValue || 0)
    
    const totalLatency = currentValues.reduce((sum, val) => sum + val, 0)
    const averageLatency = totalLatency / activeMetrics.length
    const maxLatency = Math.max(...currentValues)
    const minLatency = Math.min(...currentValues)
    
    // Calculate percentiles
    const sortedValues = [...currentValues].sort((a, b) => a - b)
    const p50Index = Math.floor(sortedValues.length * 0.5)
    const p95Index = Math.floor(sortedValues.length * 0.95)
    const p99Index = Math.floor(sortedValues.length * 0.99)
    
    const p50Latency = sortedValues[p50Index] || 0
    const p95Latency = sortedValues[p95Index] || 0
    const p99Latency = sortedValues[p99Index] || 0
    
    const targetAchievement = targetValues.length > 0 
      ? (currentValues.filter((val, idx) => val <= (targetValues[idx] || Infinity)).length / currentValues.length) * 100
      : 0

    return {
      totalMetrics: state.metrics.length,
      healthyMetrics: state.metrics.filter(m => m.status === 'healthy').length,
      warningMetrics: state.metrics.filter(m => m.status === 'warning').length,
      criticalMetrics: state.metrics.filter(m => m.status === 'critical').length,
      averageLatency,
      currentLatency: state.currentLatency || averageLatency,
      maxLatency,
      minLatency,
      p50Latency,
      p95Latency,
      p99Latency,
      targetAchievement,
      reductionOpportunities: state.recommendations.filter(r => r.status === 'pending').length,
      bottlenecks: state.bottlenecks.length,
      trends: state.trends.length > 0 ? state.trends[0].direction : 'stable',
      prediction: state.predictions.length > 0 ? state.predictions[0].trend : 'stable'
    }
  }, [state.metrics, state.currentLatency, state.recommendations, state.bottlenecks, state.trends, state.predictions])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatLatency = (value: number, unit: string = state.latencyUnit): string => {
    if (unit === 'ns') {
      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}s`
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}ms`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}μs`
      return `${value.toFixed(0)}ns`
    }
    if (unit === 'us') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}s`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}ms`
      return `${value.toFixed(1)}μs`
    }
    if (unit === 'ms') {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}s`
      return `${value.toFixed(1)}ms`
    }
    if (unit === 's') {
      return `${value.toFixed(2)}s`
    }
    return `${value.toFixed(1)} ${unit}`
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      case 'unknown': return 'text-gray-600'
      default: return 'text-gray-600'
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

  const getLatencyColor = (latency: number): string => {
    if (latency <= state.baselineThreshold) return 'text-green-600'
    if (latency <= state.targetThreshold) return 'text-blue-600'
    if (latency <= state.warningThreshold) return 'text-yellow-600'
    if (latency <= state.criticalThreshold) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'decreasing': return 'text-green-600'
      case 'increasing': return 'text-red-600'
      case 'stable': return 'text-blue-600'
      case 'volatile': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'decreasing': return <TrendingDown className="h-4 w-4" />
      case 'increasing': return <TrendingUp className="h-4 w-4" />
      case 'stable': return <TrendingUpDown className="h-4 w-4" />
      case 'volatile': return <Activity className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartOptimization = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true, isLoading: true }))
      
      const optimization = await optimizeLatency({
        goal: state.optimizationGoal,
        strategy: state.optimizationStrategy,
        targets: state.targets,
        constraints: {
          maxLatency: state.maxLatency,
          minLatency: state.minLatency
        }
      })
      
      setState(prev => ({
        ...prev,
        optimizations: [...prev.optimizations, optimization],
        isOptimizing: false,
        isLoading: false
      }))
      
      onLatencyOptimized?.(optimization)
      logEvent('latency_optimization_started', { optimizationId: optimization.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start optimization',
        isOptimizing: false,
        isLoading: false
      }))
    }
  }, [optimizeLatency, state.optimizationGoal, state.optimizationStrategy, state.targets, state.maxLatency, state.minLatency, onLatencyOptimized, logEvent, userId])

  const handleStopOptimization = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: false }))
      logEvent('latency_optimization_stopped', { userId })
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop optimization'
      }))
    }
  }, [logEvent, userId])

  const handleAnalyzeLatency = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyzePerformance({
        timeRange: state.timeRange,
        granularity: state.granularity,
        metrics: state.metrics,
        includeBottlenecks: state.showBottlenecks,
        includePatterns: true,
        includeAnomalies: true
      })
      
      setState(prev => ({
        ...prev,
        analyses: [...prev.analyses, analysis],
        isAnalyzing: false
      }))
      
      logEvent('latency_analysis_completed', { analysisId: analysis.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze latency',
        isAnalyzing: false
      }))
    }
  }, [analyzePerformance, state.timeRange, state.granularity, state.metrics, state.showBottlenecks, logEvent, userId])

  const handleRunBenchmark = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isBenchmarking: true }))
      
      const benchmark = await runBenchmark({
        duration: 300000, // 5 minutes
        targetLatency: state.targetLatency,
        concurrency: 100,
        requestPattern: 'constant'
      })
      
      setState(prev => ({
        ...prev,
        benchmarks: [...prev.benchmarks, benchmark],
        isBenchmarking: false
      }))
      
      logEvent('latency_benchmark_completed', { benchmarkId: benchmark.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to run benchmark',
        isBenchmarking: false
      }))
    }
  }, [runBenchmark, state.targetLatency, logEvent, userId])

  const handleCreateTarget = useCallback(async (targetData: Partial<LatencyTarget>) => {
    try {
      setState(prev => ({ ...prev, isCreating: true }))
      
      const newTarget = await createTarget({
        ...targetData,
        organizationId: multiTenant ? organizationId : undefined,
        createdBy: userId,
        createdAt: new Date().toISOString()
      })
      
      setState(prev => ({
        ...prev,
        targets: [...prev.targets, newTarget],
        isCreating: false
      }))
      
      logEvent('latency_target_created', { targetId: newTarget.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create target',
        isCreating: false
      }))
    }
  }, [createTarget, multiTenant, organizationId, userId, logEvent])

  const handleApplyRecommendation = useCallback(async (recommendation: LatencyRecommendation) => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      await applyRecommendation(recommendation.id)
      
      setState(prev => ({
        ...prev,
        recommendations: prev.recommendations.map(r =>
          r.id === recommendation.id ? { ...r, status: 'applied' } : r
        ),
        isOptimizing: false
      }))
      
      logEvent('latency_recommendation_applied', { recommendationId: recommendation.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply recommendation',
        isOptimizing: false
      }))
    }
  }, [applyRecommendation, logEvent, userId])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleLatencyTargetChange = useCallback((target: number) => {
    setState(prev => ({
      ...prev,
      targetLatency: target,
      warningThreshold: target * 1.5,
      criticalThreshold: target * 5,
      targetThreshold: target,
      baselineThreshold: target * 0.5
    }))
  }, [])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        await Promise.all([
          refreshMetrics(),
          refreshTargets(),
          refreshBenchmarks(),
          refreshTests(),
          enablePredictions ? refreshPredictions() : Promise.resolve(),
          enableRecommendations ? refreshRecommendations() : Promise.resolve()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize latency data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [workflowId, refreshMetrics, refreshTargets, refreshBenchmarks, refreshTests, refreshPredictions, refreshRecommendations, enablePredictions, enableRecommendations])

  useEffect(() => {
    // Set up auto-refresh
    if (state.autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        refreshMetrics()
        refreshMonitoring()
      }, state.refreshInterval)
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [state.autoRefresh, state.refreshInterval, refreshMetrics, refreshMonitoring])

  useEffect(() => {
    // Set up monitoring
    if (state.isMonitoring) {
      monitoringIntervalRef.current = setInterval(() => {
        collectMetrics()
      }, 10000) // Every 10 seconds
      
      return () => {
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current)
        }
      }
    }
  }, [state.isMonitoring, collectMetrics])

  useEffect(() => {
    // Set up auto-optimization
    if (state.optimizationMode === 'automatic' && !state.isOptimizing) {
      optimizationIntervalRef.current = setInterval(() => {
        handleStartOptimization()
      }, state.configuration.optimizationInterval)
      
      return () => {
        if (optimizationIntervalRef.current) {
          clearInterval(optimizationIntervalRef.current)
        }
      }
    }
  }, [state.optimizationMode, state.isOptimizing, state.configuration.optimizationInterval, handleStartOptimization])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      metrics: metrics || [],
      targets: targets || [],
      benchmarks: benchmarks || [],
      tests: tests || [],
      predictions: predictions || [],
      recommendations: recommendations || []
    }))
  }, [metrics, targets, benchmarks, tests, predictions, recommendations])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Latency Reducer</h1>
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-2">
          {!state.isOptimizing ? (
            <Button onClick={handleStartOptimization} disabled={state.isLoading}>
              <Play className="h-4 w-4 mr-2" />
              Start Optimization
            </Button>
          ) : (
            <Button onClick={handleStopOptimization} variant="destructive">
              <Stop className="h-4 w-4 mr-2" />
              Stop Optimization
            </Button>
          )}
          
          <Button onClick={handleAnalyzeLatency} disabled={state.isAnalyzing} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
          
          <Button onClick={handleRunBenchmark} disabled={state.isBenchmarking} variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Benchmark
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Label>Target:</Label>
          <Input
            type="number"
            value={state.targetLatency}
            onChange={(e) => handleLatencyTargetChange(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">{state.latencyUnit}</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Select value={state.timeRange} onValueChange={(value) => setState(prev => ({ ...prev, timeRange: value as any }))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5m">5 Minutes</SelectItem>
            <SelectItem value="15m">15 Minutes</SelectItem>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="6h">6 Hours</SelectItem>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>

        {state.isOptimizing && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Reducing</span>
          </div>
        )}
      </div>
    </div>
  )

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Current Latency</p>
              <p className={`text-2xl font-bold ${getLatencyColor(latencyStatistics.currentLatency)}`}>
                {formatLatency(latencyStatistics.currentLatency)}
              </p>
              <p className="text-xs text-muted-foreground">real-time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Target Achievement</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(latencyStatistics.targetAchievement)}
              </p>
              <p className="text-xs text-muted-foreground">within target</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">P95 Latency</p>
              <p className={`text-2xl font-bold ${getLatencyColor(latencyStatistics.p95Latency)}`}>
                {formatLatency(latencyStatistics.p95Latency)}
              </p>
              <p className="text-xs text-muted-foreground">95th percentile</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">P99 Latency</p>
              <p className={`text-2xl font-bold ${getLatencyColor(latencyStatistics.p99Latency)}`}>
                {formatLatency(latencyStatistics.p99Latency)}
              </p>
              <p className="text-xs text-muted-foreground">99th percentile</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Opportunities</p>
              <p className="text-2xl font-bold">{latencyStatistics.reductionOpportunities}</p>
              <p className="text-xs text-muted-foreground">for reduction</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className={getTrendColor(latencyStatistics.trends)}>
              {getTrendIcon(latencyStatistics.trends)}
            </div>
            <div>
              <p className="text-sm font-medium">Trend</p>
              <p className={`text-2xl font-bold ${getTrendColor(latencyStatistics.trends)}`}>
                {latencyStatistics.trends}
              </p>
              <p className="text-xs text-muted-foreground">direction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMetricCard = (metric: LatencyMetric) => (
    <Card key={metric.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Timer className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">{metric.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{metric.type} • {metric.source}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(metric.status)}>
            {metric.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current</p>
              <p className={`font-medium ${getLatencyColor(metric.currentValue || 0)}`}>
                {formatLatency(metric.currentValue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="font-medium">{formatLatency(metric.targetValue || 0)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">P50</p>
              <p className="font-medium">{formatLatency(metric.p50Value || 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">P95</p>
              <p className="font-medium">{formatLatency(metric.p95Value || 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">P99</p>
              <p className="font-medium">{formatLatency(metric.p99Value || 0)}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Target Achievement</span>
              <span>{formatPercentage((metric.currentValue || 0) <= (metric.targetValue || Infinity) ? 100 : 0)}</span>
            </div>
            <Progress 
              value={(metric.currentValue || 0) <= (metric.targetValue || Infinity) ? 100 : 0} 
              className="h-2" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderRecommendationCard = (recommendation: LatencyRecommendation, index: number) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-green-100">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{recommendation.category}</p>
            </div>
          </div>
          <Badge variant={recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'default' : 'secondary'}>
            {recommendation.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm">{recommendation.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Expected Reduction</p>
              <p className="font-medium text-green-600">-{formatLatency(recommendation.expectedReduction || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effort</p>
              <p className="font-medium">{recommendation.effort || 'Medium'}</p>
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => handleApplyRecommendation(recommendation)}
            disabled={recommendation.status === 'applied'}
          >
            {recommendation.status === 'applied' ? 'Applied' : 'Apply Optimization'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

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
              {renderStatisticsCards()}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Latency Overview</CardTitle>
                      <CardDescription>Real-time latency metrics and reduction progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 border rounded-md p-4">
                        <p className="text-muted-foreground text-center">Latency performance charts will be rendered here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Reduction Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {state.recommendations.filter(r => r.status === 'pending').slice(0, 3).map((recommendation, index) => (
                            <div key={index} className="p-2 rounded bg-muted">
                              <p className="font-medium text-sm">{recommendation.title}</p>
                              <p className="text-xs text-muted-foreground">{recommendation.description}</p>
                              <p className="text-xs text-green-600">
                                Reduction: -{formatLatency(recommendation.expectedReduction || 0)}
                              </p>
                            </div>
                          ))}
                          {state.recommendations.filter(r => r.status === 'pending').length === 0 && (
                            <p className="text-sm text-muted-foreground text-center">No recommendations available</p>
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
                        <span className="text-sm">Total Metrics</span>
                        <span className="text-sm font-medium">{latencyStatistics.totalMetrics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Healthy Metrics</span>
                        <span className="text-sm font-medium">{latencyStatistics.healthyMetrics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Bottlenecks</span>
                        <span className="text-sm font-medium">{latencyStatistics.bottlenecks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Latency</span>
                        <span className={`text-sm font-medium ${getLatencyColor(latencyStatistics.averageLatency)}`}>
                          {formatLatency(latencyStatistics.averageLatency)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Metrics View */}
          <TabsContent value="metrics" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMetrics.map(renderMetricCard)}
              </div>
            </div>
          </TabsContent>

          {/* Optimization View */}
          <TabsContent value="optimization" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.recommendations.map(renderRecommendationCard)}
              </div>
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isOptimizing || state.isAnalyzing || state.isBenchmarking) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading latency data...' :
                 state.isOptimizing ? 'Reducing latency...' :
                 state.isAnalyzing ? 'Analyzing latency...' :
                 'Running benchmark...'}
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

export default LatencyReducer