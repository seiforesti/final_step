"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp,
  Activity,
  Zap,
  Target,
  Gauge,
  BarChart3,
  LineChart,
  PieChart,
  Server,
  Cpu,
  MemoryStick,
  Network,
  Database,
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
  TrendingDown,
  Clock,
  Timer,
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
  ThroughputMetric,
  ThroughputTarget,
  ThroughputOptimization,
  ThroughputAnalysis,
  ThroughputConfiguration,
  ThroughputPolicy,
  ThroughputThreshold,
  ThroughputAlert,
  ThroughputEvent,
  ThroughputLog,
  ThroughputReport,
  ThroughputProfile,
  ThroughputBenchmark,
  ThroughputTest,
  ThroughputLimit,
  ThroughputCapacity,
  ThroughputBottleneck,
  ThroughputPrediction,
  ThroughputRecommendation,
  ThroughputStrategy,
  ThroughputMonitoring,
  ThroughputStatistics,
  ThroughputTrend,
  ThroughputPattern,
  ThroughputAnomaly,
  ThroughputBaseline,
  ThroughputForecast,
  ThroughputScaling,
  ThroughputOptimizer as ThroughputOptimizerType,
  ThroughputEngine,
  ThroughputController,
  ThroughputProcessor,
  ThroughputQueue,
  ThroughputBuffer,
  ThroughputPipeline,
  ThroughputStream,
  ThroughputBatch,
  ThroughputParallel,
  ThroughputConcurrency,
  ThroughputAsynchronous,
  ThroughputSynchronous,
  ThroughputBlocking,
  ThroughputNonBlocking
} from '../../types/throughput.types'

import {
  useThroughputOptimizer,
  useThroughputMetrics,
  useThroughputConfiguration,
  useThroughputMonitoring,
  useThroughputAnalysis,
  useThroughputPolicies,
  useThroughputTargets,
  useThroughputBenchmarks,
  useThroughputTests,
  useThroughputPredictions,
  useThroughputRecommendations,
  useThroughputScaling,
  useThroughputAudit
} from '../../hooks/useThroughputOptimizer'

import {
  createThroughputOptimizer,
  updateThroughputOptimizer,
  deleteThroughputOptimizer,
  startThroughputOptimizer,
  stopThroughputOptimizer,
  restartThroughputOptimizer,
  pauseThroughputOptimizer,
  resumeThroughputOptimizer,
  optimizeThroughput,
  analyzeThroughput,
  monitorThroughput,
  benchmarkThroughput,
  testThroughput,
  measureThroughput,
  calculateThroughput,
  predictThroughput,
  forecastThroughput,
  scaleThroughput,
  tuneThroughput,
  enhanceThroughput,
  maximizeThroughput,
  balanceThroughput,
  distributeThroughput,
  parallelizeThroughput,
  pipelineThroughput,
  streamThroughput,
  batchThroughput,
  queueThroughput,
  bufferThroughput,
  cacheThroughput,
  compressThroughput,
  decompressThroughput,
  encryptThroughput,
  decryptThroughput,
  validateThroughput,
  verifyThroughput,
  auditThroughput,
  reportThroughput,
  visualizeThroughput,
  alertThroughput,
  notifyThroughput,
  escalateThroughput,
  resolveThroughput,
  mitigateThroughput,
  preventThroughput,
  recoverThroughput,
  restoreThroughput,
  backupThroughput,
  archiveThroughput,
  exportThroughput,
  importThroughput,
  migrateThroughput,
  upgradeThroughput,
  downgradeThroughput,
  rollbackThroughput,
  commitThroughput,
  lockThroughput,
  unlockThroughput,
  reserveThroughput,
  releaseThroughput,
  allocateThroughput,
  deallocateThroughput,
  scheduleThroughput,
  executeThroughput,
  cancelThroughput,
  pauseThroughputTask,
  resumeThroughputTask,
  retryThroughput,
  timeoutThroughput,
  rateLimitThroughput,
  throttleThroughput,
  debounceThroughput,
  samplethroughput,
  filterThroughput,
  sortThroughput,
  groupThroughput,
  aggregateThroughput,
  summarizeThroughput,
  indexThroughput,
  searchThroughput,
  queryThroughput,
  joinThroughput,
  unionThroughput,
  intersectThroughput,
  mergeThroughput,
  splitThroughput,
  partitionThroughput,
  shardThroughput,
  replicateThroughput,
  synchronizeThroughput,
  consistThroughput,
  integrateThroughput,
  validateThroughputData,
  sanitizeThroughputData,
  normalizeThroughputData,
  standardizeThroughputData,
  encodeThroughputData,
  decodeThroughputData,
  serializeThroughputData,
  deserializeThroughputData,
  hashThroughputData,
  checksumThroughputData,
  signThroughputData,
  verifyThroughputSignature,
  timestampThroughputData,
  versionThroughputData,
  tagThroughputData,
  categorizeThroughputData,
  classifyThroughputData,
  rankThroughputData,
  scoreThroughputData,
  rateThroughputData,
  reviewThroughputData,
  approveThroughputData,
  rejectThroughputData,
  publishThroughputData,
  unpublishThroughputData,
  shareThroughputData,
  copyThroughputData,
  moveThroughputData,
  deleteThroughputData,
  purgeThroughputData,
  recycleThroughputData,
  restoreThroughputData,
  optimizeThroughputCpu,
  optimizeThroughputMemory,
  optimizeThroughputDisk,
  optimizeThroughputNetwork,
  optimizeThroughputDatabase,
  optimizeThroughputApplication,
  optimizeThroughputService,
  optimizeThroughputEndpoint,
  optimizeThroughputRequest,
  optimizeThroughputResponse,
  optimizeThroughputSession,
  optimizeThroughputConnection,
  optimizeThroughputTransaction,
  optimizeThroughputOperation,
  optimizeThroughputProcess,
  optimizeThroughputThread,
  optimizeThroughputJob,
  optimizeThroughputTask,
  optimizeThroughputWorkflow,
  optimizeThroughputPipeline,
  optimizeThroughputStreaming,
  optimizeThroughputBatching,
  optimizeThroughputQueuing,
  optimizeThroughputBuffering,
  optimizeThroughputCaching,
  optimizeThroughputCompression,
  optimizeThroughputEncryption,
  optimizeThroughputSerialization,
  optimizeThroughputDeserialization
} from '../../services/throughput-optimizer-apis'

// Enhanced interfaces for advanced throughput optimization
interface ThroughputOptimizerState {
  // Core optimizer state
  isRunning: boolean
  isOptimizing: boolean
  isAnalyzing: boolean
  isMonitoring: boolean
  isBenchmarking: boolean
  isTesting: boolean
  isPredicting: boolean
  isScaling: boolean
  
  // Throughput data
  metrics: ThroughputMetric[]
  targets: ThroughputTarget[]
  optimizations: ThroughputOptimization[]
  analyses: ThroughputAnalysis[]
  policies: ThroughputPolicy[]
  thresholds: ThroughputThreshold[]
  
  // Selected items
  selectedMetric: ThroughputMetric | null
  selectedTarget: ThroughputTarget | null
  selectedOptimization: ThroughputOptimization | null
  selectedPolicy: ThroughputPolicy | null
  
  // Configuration
  configuration: ThroughputConfiguration
  profiles: ThroughputProfile[]
  benchmarks: ThroughputBenchmark[]
  tests: ThroughputTest[]
  
  // Monitoring and alerts
  alerts: ThroughputAlert[]
  events: ThroughputEvent[]
  logs: ThroughputLog[]
  reports: ThroughputReport[]
  
  // Analysis and predictions
  statistics: ThroughputStatistics | null
  trends: ThroughputTrend[]
  patterns: ThroughputPattern[]
  anomalies: ThroughputAnomaly[]
  baselines: ThroughputBaseline[]
  forecasts: ThroughputForecast[]
  predictions: ThroughputPrediction[]
  recommendations: ThroughputRecommendation[]
  
  // View and UI state
  view: 'dashboard' | 'metrics' | 'optimization' | 'analysis' | 'monitoring' | 'benchmarks' | 'tests' | 'settings'
  timeRange: '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
  granularity: 'second' | 'minute' | 'hour' | 'day'
  aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count' | 'percentile'
  
  // Display preferences
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'gauge' | 'heatmap'
  displayMode: 'grid' | 'list' | 'detailed' | 'compact'
  showTargets: boolean
  showThresholds: boolean
  showAlerts: boolean
  showTrends: boolean
  showPredictions: boolean
  autoRefresh: boolean
  refreshInterval: number
  
  // Filter and search
  searchQuery: string
  statusFilter: 'all' | 'healthy' | 'warning' | 'critical' | 'unknown'
  typeFilter: string[]
  sourceFilter: string[]
  targetFilter: string[]
  
  // Optimization settings
  optimizationGoal: 'maximize' | 'minimize' | 'stabilize' | 'target'
  optimizationStrategy: 'aggressive' | 'conservative' | 'balanced' | 'adaptive'
  optimizationMode: 'automatic' | 'manual' | 'hybrid' | 'scheduled'
  
  // Throughput-specific settings
  targetThroughput: number
  maxThroughput: number
  minThroughput: number
  averageThroughput: number
  currentThroughput: number
  throughputUnit: 'rps' | 'tps' | 'qps' | 'ops' | 'bps' | 'pps'
  
  // Performance thresholds
  warningThreshold: number
  criticalThreshold: number
  targetThreshold: number
  baselineThreshold: number
  
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
 * ThroughputOptimizer Component
 * 
 * Enterprise-grade throughput optimization component that provides comprehensive
 * throughput management and optimization capabilities including:
 * - Real-time throughput monitoring and measurement
 * - Intelligent throughput optimization and tuning
 * - Throughput target management and tracking
 * - Advanced throughput analysis and prediction
 * - Throughput bottleneck detection and resolution
 * - Performance benchmarking and testing
 * - Throughput scaling and capacity planning
 * - Throughput pattern recognition and anomaly detection
 * - Multi-dimensional throughput visualization
 * - Comprehensive throughput reporting and analytics
 * - Automated throughput optimization strategies
 * - Throughput SLA monitoring and compliance
 * 
 * This component integrates with the backend throughput optimization system and provides
 * a sophisticated user interface for comprehensive throughput management.
 */
export const ThroughputOptimizer: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onThroughputOptimized?: (optimization: ThroughputOptimization) => void
  onTargetAchieved?: (target: ThroughputTarget) => void
  autoOptimize?: boolean
  enablePredictions?: boolean
  enableRecommendations?: boolean
  enableScaling?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onThroughputOptimized,
  onTargetAchieved,
  autoOptimize = false,
  enablePredictions = true,
  enableRecommendations = true,
  enableScaling = false,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<ThroughputOptimizerState>({
    // Core optimizer state
    isRunning: false,
    isOptimizing: false,
    isAnalyzing: false,
    isMonitoring: true,
    isBenchmarking: false,
    isTesting: false,
    isPredicting: false,
    isScaling: false,
    
    // Throughput data
    metrics: [],
    targets: [],
    optimizations: [],
    analyses: [],
    policies: [],
    thresholds: [],
    
    // Selected items
    selectedMetric: null,
    selectedTarget: null,
    selectedOptimization: null,
    selectedPolicy: null,
    
    // Configuration
    configuration: {
      targetThroughput: 1000, // 1000 RPS
      maxThroughput: 10000, // 10000 RPS
      minThroughput: 10, // 10 RPS
      unit: 'rps',
      samplingInterval: 1000, // 1 second
      aggregationWindow: 60000, // 1 minute
      optimizationInterval: 300000, // 5 minutes
      analysisInterval: 900000, // 15 minutes
      enableAutoOptimization: autoOptimize,
      enablePredictions: enablePredictions,
      enableRecommendations: enableRecommendations,
      enableScaling: enableScaling,
      enableMonitoring: true,
      enableAlerting: true,
      enableLogging: true,
      retentionPeriod: 2592000000, // 30 days
      warningThreshold: 0.8, // 80%
      criticalThreshold: 0.95, // 95%
      targetThreshold: 1.0, // 100%
      baselineThreshold: 0.5, // 50%
      adaptiveThresholds: true,
      smartAlerting: true,
      anomalyDetection: true,
      patternRecognition: true,
      trendAnalysis: true,
      forecastingEnabled: true,
      optimizationStrategy: 'balanced',
      scalingPolicy: 'auto',
      loadBalancing: true,
      circuitBreaker: true,
      rateLimiting: false,
      throttling: false,
      compression: true,
      encryption: false,
      caching: true,
      prefetching: false,
      parallelization: true,
      pipelining: true,
      batching: true,
      streaming: false,
      asynchronous: true,
      nonBlocking: true
    } as ThroughputConfiguration,
    profiles: [],
    benchmarks: [],
    tests: [],
    
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
    autoRefresh: true,
    refreshInterval: 5000, // 5 seconds
    
    // Filter and search
    searchQuery: '',
    statusFilter: 'all',
    typeFilter: [],
    sourceFilter: [],
    targetFilter: [],
    
    // Optimization settings
    optimizationGoal: 'maximize',
    optimizationStrategy: 'balanced',
    optimizationMode: autoOptimize ? 'automatic' : 'manual',
    
    // Throughput-specific settings
    targetThroughput: 1000,
    maxThroughput: 10000,
    minThroughput: 10,
    averageThroughput: 0,
    currentThroughput: 0,
    throughputUnit: 'rps',
    
    // Performance thresholds
    warningThreshold: 800, // 80% of target
    criticalThreshold: 950, // 95% of target
    targetThreshold: 1000, // 100% of target
    baselineThreshold: 500, // 50% of target
    
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
    optimizer,
    isActive,
    start,
    stop,
    restart,
    refresh
  } = useThroughputOptimizer(workflowId)

  const {
    metrics,
    latestMetrics,
    refreshMetrics,
    collectMetrics
  } = useThroughputMetrics()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration
  } = useThroughputConfiguration()

  const {
    monitoring,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshMonitoring
  } = useThroughputMonitoring()

  const {
    analysis,
    reports,
    analyzePerformance,
    generateReport,
    scheduleAnalysis
  } = useThroughputAnalysis()

  const {
    policies,
    activePolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    refreshPolicies
  } = useThroughputPolicies()

  const {
    targets,
    activeTargets,
    createTarget,
    updateTarget,
    deleteTarget,
    refreshTargets
  } = useThroughputTargets()

  const {
    benchmarks,
    latestBenchmarks,
    runBenchmark,
    compareBenchmarks,
    refreshBenchmarks
  } = useThroughputBenchmarks()

  const {
    tests,
    runningTests,
    runTest,
    stopTest,
    refreshTests
  } = useThroughputTests()

  const {
    predictions,
    forecasts,
    generatePredictions,
    updatePredictions,
    refreshPredictions
  } = useThroughputPredictions()

  const {
    recommendations,
    activeRecommendations,
    generateRecommendations,
    applyRecommendation,
    refreshRecommendations
  } = useThroughputRecommendations()

  const {
    scaling,
    scalingPolicies,
    scaleUp,
    scaleDown,
    autoScale,
    refreshScaling
  } = useThroughputScaling()

  const {
    auditLog,
    logEvent,
    generateAuditReport
  } = useThroughputAudit()

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

    // Apply type filter
    if (state.typeFilter.length > 0) {
      result = result.filter(metric =>
        state.typeFilter.includes(metric.type)
      )
    }

    // Apply source filter
    if (state.sourceFilter.length > 0) {
      result = result.filter(metric =>
        state.sourceFilter.includes(metric.source || '')
      )
    }

    return result
  }, [
    state.metrics, state.searchQuery, state.statusFilter,
    state.typeFilter, state.sourceFilter
  ])

  const throughputStatistics = useMemo(() => {
    const activeMetrics = state.metrics.filter(m => m.status !== 'unknown')
    
    if (activeMetrics.length === 0) {
      return {
        totalMetrics: 0,
        healthyMetrics: 0,
        warningMetrics: 0,
        criticalMetrics: 0,
        averageThroughput: 0,
        currentThroughput: 0,
        maxThroughput: 0,
        minThroughput: 0,
        targetAchievement: 0,
        performanceScore: 0,
        optimizationOpportunities: 0,
        bottlenecks: 0,
        trends: 'stable',
        prediction: 'stable'
      }
    }

    const currentValues = activeMetrics.map(m => m.currentValue || 0)
    const targetValues = activeMetrics.map(m => m.targetValue || 0)
    
    const totalThroughput = currentValues.reduce((sum, val) => sum + val, 0)
    const averageThroughput = totalThroughput / activeMetrics.length
    const maxThroughput = Math.max(...currentValues)
    const minThroughput = Math.min(...currentValues)
    
    const targetAchievement = targetValues.length > 0 
      ? (currentValues.reduce((sum, val, idx) => sum + (val / (targetValues[idx] || 1)), 0) / activeMetrics.length) * 100
      : 0

    return {
      totalMetrics: state.metrics.length,
      healthyMetrics: state.metrics.filter(m => m.status === 'healthy').length,
      warningMetrics: state.metrics.filter(m => m.status === 'warning').length,
      criticalMetrics: state.metrics.filter(m => m.status === 'critical').length,
      averageThroughput,
      currentThroughput: state.currentThroughput || averageThroughput,
      maxThroughput,
      minThroughput,
      targetAchievement,
      performanceScore: Math.min(100, Math.max(0, targetAchievement)),
      optimizationOpportunities: state.recommendations.filter(r => r.status === 'pending').length,
      bottlenecks: state.anomalies.filter(a => a.type === 'bottleneck').length,
      trends: state.trends.length > 0 ? state.trends[0].direction : 'stable',
      prediction: state.predictions.length > 0 ? state.predictions[0].trend : 'stable'
    }
  }, [state.metrics, state.currentThroughput, state.recommendations, state.anomalies, state.trends, state.predictions])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatThroughput = (value: number, unit: string = state.throughputUnit): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ${unit.toUpperCase()}`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K ${unit.toUpperCase()}`
    return `${value.toFixed(1)} ${unit.toUpperCase()}`
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
    return `${(ms / 3600000).toFixed(1)}h`
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

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'increasing': return 'text-green-600'
      case 'decreasing': return 'text-red-600'
      case 'stable': return 'text-blue-600'
      case 'volatile': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4" />
      case 'decreasing': return <TrendingDown className="h-4 w-4" />
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
      
      const optimization = await optimizeThroughput({
        goal: state.optimizationGoal,
        strategy: state.optimizationStrategy,
        targets: state.targets,
        constraints: {
          maxThroughput: state.maxThroughput,
          minThroughput: state.minThroughput
        }
      })
      
      setState(prev => ({
        ...prev,
        optimizations: [...prev.optimizations, optimization],
        isOptimizing: false,
        isLoading: false
      }))
      
      onThroughputOptimized?.(optimization)
      logEvent('throughput_optimization_started', { optimizationId: optimization.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start optimization',
        isOptimizing: false,
        isLoading: false
      }))
    }
  }, [optimizeThroughput, state.optimizationGoal, state.optimizationStrategy, state.targets, state.maxThroughput, state.minThroughput, onThroughputOptimized, logEvent, userId])

  const handleStopOptimization = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: false }))
      logEvent('throughput_optimization_stopped', { userId })
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop optimization'
      }))
    }
  }, [logEvent, userId])

  const handleAnalyzeThroughput = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyzePerformance({
        timeRange: state.timeRange,
        granularity: state.granularity,
        metrics: state.metrics,
        includeBottlenecks: true,
        includePatterns: true,
        includeAnomalies: true
      })
      
      setState(prev => ({
        ...prev,
        analyses: [...prev.analyses, analysis],
        isAnalyzing: false
      }))
      
      logEvent('throughput_analysis_completed', { analysisId: analysis.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze throughput',
        isAnalyzing: false
      }))
    }
  }, [analyzePerformance, state.timeRange, state.granularity, state.metrics, logEvent, userId])

  const handleRunBenchmark = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isBenchmarking: true }))
      
      const benchmark = await runBenchmark({
        duration: 300000, // 5 minutes
        targetThroughput: state.targetThroughput,
        rampUpTime: 60000, // 1 minute
        coolDownTime: 60000 // 1 minute
      })
      
      setState(prev => ({
        ...prev,
        benchmarks: [...prev.benchmarks, benchmark],
        isBenchmarking: false
      }))
      
      logEvent('throughput_benchmark_completed', { benchmarkId: benchmark.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to run benchmark',
        isBenchmarking: false
      }))
    }
  }, [runBenchmark, state.targetThroughput, logEvent, userId])

  const handleCreateTarget = useCallback(async (targetData: Partial<ThroughputTarget>) => {
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
      
      logEvent('throughput_target_created', { targetId: newTarget.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create target',
        isCreating: false
      }))
    }
  }, [createTarget, multiTenant, organizationId, userId, logEvent])

  const handleApplyRecommendation = useCallback(async (recommendation: ThroughputRecommendation) => {
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
      
      logEvent('throughput_recommendation_applied', { recommendationId: recommendation.id, userId })
      
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

  const handleThroughputTargetChange = useCallback((target: number) => {
    setState(prev => ({
      ...prev,
      targetThroughput: target,
      warningThreshold: target * 0.8,
      criticalThreshold: target * 0.95,
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
          refreshPolicies(),
          refreshBenchmarks(),
          refreshTests(),
          enablePredictions ? refreshPredictions() : Promise.resolve(),
          enableRecommendations ? refreshRecommendations() : Promise.resolve()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize throughput data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [workflowId, refreshMetrics, refreshTargets, refreshPolicies, refreshBenchmarks, refreshTests, refreshPredictions, refreshRecommendations, enablePredictions, enableRecommendations])

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
      policies: policies || [],
      benchmarks: benchmarks || [],
      tests: tests || [],
      predictions: predictions || [],
      recommendations: recommendations || []
    }))
  }, [metrics, targets, policies, benchmarks, tests, predictions, recommendations])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Throughput Optimizer</h1>
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
          
          <Button onClick={handleAnalyzeThroughput} disabled={state.isAnalyzing} variant="outline">
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
            value={state.targetThroughput}
            onChange={(e) => handleThroughputTargetChange(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">{state.throughputUnit.toUpperCase()}</span>
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
            <span className="text-sm text-muted-foreground">Optimizing</span>
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
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Current Throughput</p>
              <p className="text-2xl font-bold">
                {formatThroughput(throughputStatistics.currentThroughput)}
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
                {formatPercentage(throughputStatistics.targetAchievement)}
              </p>
              <p className="text-xs text-muted-foreground">of target</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Performance Score</p>
              <p className="text-2xl font-bold">
                {formatPercentage(throughputStatistics.performanceScore)}
              </p>
              <p className="text-xs text-muted-foreground">overall</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Max Throughput</p>
              <p className="text-2xl font-bold">
                {formatThroughput(throughputStatistics.maxThroughput)}
              </p>
              <p className="text-xs text-muted-foreground">peak performance</p>
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
              <p className="text-2xl font-bold">{throughputStatistics.optimizationOpportunities}</p>
              <p className="text-xs text-muted-foreground">available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className={getTrendColor(throughputStatistics.trends)}>
              {getTrendIcon(throughputStatistics.trends)}
            </div>
            <div>
              <p className="text-sm font-medium">Trend</p>
              <p className={`text-2xl font-bold ${getTrendColor(throughputStatistics.trends)}`}>
                {throughputStatistics.trends}
              </p>
              <p className="text-xs text-muted-foreground">direction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMetricCard = (metric: ThroughputMetric) => (
    <Card key={metric.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <TrendingUp className="h-4 w-4 text-blue-600" />
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
              <p className="font-medium">{formatThroughput(metric.currentValue || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="font-medium">{formatThroughput(metric.targetValue || 0)}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Achievement</span>
              <span>{formatPercentage((metric.currentValue || 0) / (metric.targetValue || 1) * 100)}</span>
            </div>
            <Progress value={(metric.currentValue || 0) / (metric.targetValue || 1) * 100} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <span>Min: {formatThroughput(metric.minValue || 0)}</span>
            </div>
            <div>
              <span>Avg: {formatThroughput(metric.avgValue || 0)}</span>
            </div>
            <div>
              <span>Max: {formatThroughput(metric.maxValue || 0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderRecommendationCard = (recommendation: ThroughputRecommendation, index: number) => (
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
              <p className="text-sm text-muted-foreground">Expected Improvement</p>
              <p className="font-medium text-green-600">+{formatThroughput(recommendation.expectedImprovement || 0)}</p>
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
            {recommendation.status === 'applied' ? 'Applied' : 'Apply Recommendation'}
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
                      <CardTitle>Throughput Overview</CardTitle>
                      <CardDescription>Real-time throughput metrics and performance trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 border rounded-md p-4">
                        <p className="text-muted-foreground text-center">Throughput performance charts will be rendered here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optimization Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {state.recommendations.filter(r => r.status === 'pending').slice(0, 3).map((recommendation, index) => (
                            <div key={index} className="p-2 rounded bg-muted">
                              <p className="font-medium text-sm">{recommendation.title}</p>
                              <p className="text-xs text-muted-foreground">{recommendation.description}</p>
                              <p className="text-xs text-green-600">
                                Expected: +{formatThroughput(recommendation.expectedImprovement || 0)}
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
                        <span className="text-sm font-medium">{throughputStatistics.totalMetrics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Healthy Metrics</span>
                        <span className="text-sm font-medium">{throughputStatistics.healthyMetrics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Bottlenecks</span>
                        <span className="text-sm font-medium">{throughputStatistics.bottlenecks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Prediction</span>
                        <span className={`text-sm font-medium ${getTrendColor(throughputStatistics.prediction)}`}>
                          {throughputStatistics.prediction}
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
                {state.isLoading ? 'Loading throughput data...' :
                 state.isOptimizing ? 'Optimizing throughput...' :
                 state.isAnalyzing ? 'Analyzing throughput...' :
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

export default ThroughputOptimizer