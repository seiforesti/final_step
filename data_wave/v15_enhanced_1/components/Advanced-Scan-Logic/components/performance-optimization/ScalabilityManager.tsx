"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Maximize, Layers, Activity, Target, Gauge, BarChart3, LineChart, PieChart, Server, Cpu, MemoryStick, Network, Database, RefreshCw, Settings, Play, Pause, Square, RotateCcw, Plus, Minus, ArrowUp, ArrowDown, TrendingDown, Clock, Timer, Calendar, Users, User, CheckCircle, AlertTriangle, XCircle, Info, Flag, Star, Shield, Lock, Unlock, Key, Eye, EyeOff, Search, Filter, Download, Upload, Share2, Edit, Trash2, Copy, Code, FileText, Archive, History, Award, Crown, Hash, Percent, DollarSign, TrendingUpDown, Minimize, ArrowLeft, ArrowRight, Volume2, VolumeX, Wifi, WifiOff, Signal, Battery, BatteryLow, Thermometer, Monitor, Smartphone, Tablet, Laptop, Desktop, Package, Globe, Zap } from 'lucide-react'

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
  ScalabilityMetric,
  ScalabilityTarget,
  ScalabilityPlan,
  ScalabilityPolicy,
  ScalabilityConfiguration,
  ScalabilityProfile,
  ScalabilityThreshold,
  ScalabilityAlert,
  ScalabilityEvent,
  ScalabilityLog,
  ScalabilityReport,
  ScalabilityTest,
  ScalabilityBenchmark,
  ScalabilityPrediction,
  ScalabilityRecommendation,
  ScalabilityStrategy,
  ScalabilityMonitoring,
  ScalabilityStatistics,
  ScalabilityTrend,
  ScalabilityPattern,
  ScalabilityAnomaly,
  ScalabilityBaseline,
  ScalabilityForecast,
  ScalabilityBottleneck,
  ScalabilityCapacity,
  ScalabilityUtilization,
  ScalabilityResource,
  ScalabilityCluster,
  ScalabilityNode,
  ScalabilityService,
  ScalabilityWorkload,
  ScalabilityLoad,
  ScalabilityTraffic,
  ScalabilityDemand,
  ScalabilitySupply,
  ScalabilityElasticity,
  ScalabilityAutoscaling,
  ScalabilityHorizontal,
  ScalabilityVertical,
  ScalabilityHybrid
} from '../../types/scalability.types'

import {
  useScalabilityManager,
  useScalabilityMetrics,
  useScalabilityConfiguration,
  useScalabilityMonitoring,
  useScalabilityPolicies,
  useScalabilityPlans,
  useScalabilityTargets,
  useScalabilityTests,
  useScalabilityBenchmarks,
  useScalabilityPredictions,
  useScalabilityRecommendations,
  useScalabilityAutoscaling,
  useScalabilityAudit
} from '../../hooks/useScalabilityManager'

import {
  createScalabilityManager,
  updateScalabilityManager,
  deleteScalabilityManager,
  startScalabilityManager,
  stopScalabilityManager,
  restartScalabilityManager,
  pauseScalabilityManager,
  resumeScalabilityManager,
  scaleUp,
  scaleDown,
  scaleOut,
  scaleIn,
  autoScale,
  manualScale,
  elasticScale,
  predictiveScale,
  reactiveScale,
  proactiveScale,
  scheduleScale,
  triggerScale,
  analyzeScalability,
  monitorScalability,
  benchmarkScalability,
  testScalability,
  measureScalability,
  calculateScalability,
  predictScalability,
  forecastScalability,
  optimizeScalability,
  planScalability,
  validateScalability,
  verifyScalability,
  auditScalability,
  reportScalability,
  visualizeScalability,
  alertScalability,
  notifyScalability,
  escalateScalability,
  resolveScalability,
  mitigateScalability,
  preventScalability,
  recoverScalability,
  restoreScalability,
  backupScalability,
  archiveScalability,
  exportScalability,
  importScalability,
  migrateScalability,
  upgradeScalability,
  downgradeScalability,
  rollbackScalability,
  commitScalability
} from '../../services/scalability-manager-apis'

// Enhanced interfaces for advanced scalability management
interface ScalabilityManagerState {
  // Core manager state
  isRunning: boolean
  isScaling: boolean
  isAnalyzing: boolean
  isMonitoring: boolean
  isTesting: boolean
  isBenchmarking: boolean
  isPredicting: boolean
  isOptimizing: boolean
  
  // Scalability data
  metrics: ScalabilityMetric[]
  targets: ScalabilityTarget[]
  plans: ScalabilityPlan[]
  policies: ScalabilityPolicy[]
  profiles: ScalabilityProfile[]
  thresholds: ScalabilityThreshold[]
  
  // Selected items
  selectedMetric: ScalabilityMetric | null
  selectedTarget: ScalabilityTarget | null
  selectedPlan: ScalabilityPlan | null
  selectedPolicy: ScalabilityPolicy | null
  
  // Configuration
  configuration: ScalabilityConfiguration
  tests: ScalabilityTest[]
  benchmarks: ScalabilityBenchmark[]
  
  // Monitoring and alerts
  alerts: ScalabilityAlert[]
  events: ScalabilityEvent[]
  logs: ScalabilityLog[]
  reports: ScalabilityReport[]
  
  // Analysis and predictions
  statistics: ScalabilityStatistics | null
  trends: ScalabilityTrend[]
  patterns: ScalabilityPattern[]
  anomalies: ScalabilityAnomaly[]
  baselines: ScalabilityBaseline[]
  forecasts: ScalabilityForecast[]
  predictions: ScalabilityPrediction[]
  recommendations: ScalabilityRecommendation[]
  bottlenecks: ScalabilityBottleneck[]
  
  // Capacity and utilization
  capacity: ScalabilityCapacity | null
  utilization: ScalabilityUtilization | null
  resources: ScalabilityResource[]
  clusters: ScalabilityCluster[]
  nodes: ScalabilityNode[]
  services: ScalabilityService[]
  workloads: ScalabilityWorkload[]
  
  // View and UI state
  view: 'dashboard' | 'metrics' | 'scaling' | 'analysis' | 'monitoring' | 'capacity' | 'policies' | 'settings'
  timeRange: '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
  granularity: 'second' | 'minute' | 'hour' | 'day'
  aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count'
  
  // Display preferences
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'gauge' | 'heatmap'
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
  
  // Scaling settings
  scalingMode: 'automatic' | 'manual' | 'hybrid' | 'scheduled'
  scalingStrategy: 'reactive' | 'proactive' | 'predictive' | 'elastic'
  scalingType: 'horizontal' | 'vertical' | 'hybrid'
  scalingPolicy: 'target-tracking' | 'step-scaling' | 'simple-scaling' | 'predictive-scaling'
  
  // Scalability-specific settings
  minInstances: number
  maxInstances: number
  targetInstances: number
  currentInstances: number
  targetUtilization: number
  currentUtilization: number
  scalingFactor: number
  
  // Performance thresholds
  cpuThreshold: number
  memoryThreshold: number
  networkThreshold: number
  diskThreshold: number
  latencyThreshold: number
  throughputThreshold: number
  
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
 * ScalabilityManager Component
 * 
 * Enterprise-grade scalability management component that provides comprehensive
 * scalability management and optimization capabilities including:
 * - Real-time scalability monitoring and measurement
 * - Intelligent auto-scaling and manual scaling
 * - Scalability target management and tracking
 * - Advanced scalability analysis and prediction
 * - Scalability bottleneck detection and resolution
 * - Performance benchmarking and testing
 * - Scalability pattern recognition and anomaly detection
 * - Multi-dimensional scalability visualization
 * - Comprehensive scalability reporting and analytics
 * - Automated scalability strategies and policies
 * - Scalability SLA monitoring and compliance
 * - Capacity planning and resource optimization
 * 
 * This component integrates with the backend scalability management system and provides
 * a sophisticated user interface for comprehensive scalability management.
 */
export const ScalabilityManager: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onScalingEvent?: (event: ScalabilityEvent) => void
  onTargetAchieved?: (target: ScalabilityTarget) => void
  autoScale?: boolean
  enablePredictions?: boolean
  enableRecommendations?: boolean
  enableBottleneckDetection?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onScalingEvent,
  onTargetAchieved,
  autoScale = false,
  enablePredictions = true,
  enableRecommendations = true,
  enableBottleneckDetection = true,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<ScalabilityManagerState>({
    // Core manager state
    isRunning: false,
    isScaling: false,
    isAnalyzing: false,
    isMonitoring: true,
    isTesting: false,
    isBenchmarking: false,
    isPredicting: false,
    isOptimizing: false,
    
    // Scalability data
    metrics: [],
    targets: [],
    plans: [],
    policies: [],
    profiles: [],
    thresholds: [],
    
    // Selected items
    selectedMetric: null,
    selectedTarget: null,
    selectedPlan: null,
    selectedPolicy: null,
    
    // Configuration
    configuration: {
      minInstances: 1,
      maxInstances: 100,
      targetUtilization: 70, // 70%
      scalingFactor: 2,
      scaleUpCooldown: 300000, // 5 minutes
      scaleDownCooldown: 600000, // 10 minutes
      samplingInterval: 60000, // 1 minute
      evaluationPeriods: 2,
      enableAutoScaling: autoScale,
      enablePredictions: enablePredictions,
      enableRecommendations: enableRecommendations,
      enableBottleneckDetection: enableBottleneckDetection,
      enableMonitoring: true,
      enableAlerting: true,
      enableLogging: true,
      retentionPeriod: 2592000000, // 30 days
      cpuThreshold: 80, // 80%
      memoryThreshold: 85, // 85%
      networkThreshold: 90, // 90%
      diskThreshold: 80, // 80%
      latencyThreshold: 200, // 200ms
      throughputThreshold: 1000, // 1000 rps
      adaptiveThresholds: true,
      smartScaling: true,
      anomalyDetection: true,
      patternRecognition: true,
      trendAnalysis: true,
      forecastingEnabled: true,
      scalingStrategy: 'reactive',
      scalingType: 'horizontal',
      scalingPolicy: 'target-tracking',
      loadBalancing: true,
      healthChecks: true,
      circuitBreaker: true,
      gracefulShutdown: true,
      warmupPeriod: 300000, // 5 minutes
      drainTimeout: 300000, // 5 minutes
      terminationGracePeriod: 30000, // 30 seconds
      preemptionPolicy: 'least-recently-used',
      resourceQuotas: true,
      resourceLimits: true,
      priorityClasses: true,
      nodeAffinity: false,
      podAntiAffinity: false,
      tolerations: false
    } as ScalabilityConfiguration,
    tests: [],
    benchmarks: [],
    
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
    
    // Capacity and utilization
    capacity: null,
    utilization: null,
    resources: [],
    clusters: [],
    nodes: [],
    services: [],
    workloads: [],
    
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
    
    // Scaling settings
    scalingMode: autoScale ? 'automatic' : 'manual',
    scalingStrategy: 'reactive',
    scalingType: 'horizontal',
    scalingPolicy: 'target-tracking',
    
    // Scalability-specific settings
    minInstances: 1,
    maxInstances: 100,
    targetInstances: 5,
    currentInstances: 3,
    targetUtilization: 70,
    currentUtilization: 0,
    scalingFactor: 2,
    
    // Performance thresholds
    cpuThreshold: 80,
    memoryThreshold: 85,
    networkThreshold: 90,
    diskThreshold: 80,
    latencyThreshold: 200,
    throughputThreshold: 1000,
    
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
  const scalingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Hook integrations
  const {
    manager,
    isActive,
    start,
    stop,
    restart,
    refresh
  } = useScalabilityManager(workflowId)

  const {
    metrics,
    latestMetrics,
    refreshMetrics,
    collectMetrics
  } = useScalabilityMetrics()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration
  } = useScalabilityConfiguration()

  const {
    monitoring,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshMonitoring
  } = useScalabilityMonitoring()

  const {
    policies,
    activePolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    refreshPolicies
  } = useScalabilityPolicies()

  const {
    plans,
    activePlans,
    createPlan,
    updatePlan,
    deletePlan,
    refreshPlans
  } = useScalabilityPlans()

  const {
    targets,
    activeTargets,
    createTarget,
    updateTarget,
    deleteTarget,
    refreshTargets
  } = useScalabilityTargets()

  const {
    tests,
    runningTests,
    runTest,
    stopTest,
    refreshTests
  } = useScalabilityTests()

  const {
    benchmarks,
    latestBenchmarks,
    runBenchmark,
    compareBenchmarks,
    refreshBenchmarks
  } = useScalabilityBenchmarks()

  const {
    predictions,
    forecasts,
    generatePredictions,
    updatePredictions,
    refreshPredictions
  } = useScalabilityPredictions()

  const {
    recommendations,
    activeRecommendations,
    generateRecommendations,
    applyRecommendation,
    refreshRecommendations
  } = useScalabilityRecommendations()

  const {
    autoscaling,
    scalingRules,
    enableAutoscaling,
    disableAutoscaling,
    updateScalingRules
  } = useScalabilityAutoscaling()

  const {
    auditLog,
    logEvent,
    generateAuditReport
  } = useScalabilityAudit()

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

  const scalabilityStatistics = useMemo(() => {
    const activeMetrics = state.metrics.filter(m => m.status !== 'unknown')
    
    if (activeMetrics.length === 0) {
      return {
        totalMetrics: 0,
        healthyMetrics: 0,
        warningMetrics: 0,
        criticalMetrics: 0,
        currentInstances: 0,
        targetInstances: 0,
        minInstances: 0,
        maxInstances: 0,
        currentUtilization: 0,
        targetUtilization: 0,
        scalingEvents: 0,
        scalingOpportunities: 0,
        bottlenecks: 0,
        trends: 'stable',
        prediction: 'stable',
        capacity: 0,
        efficiency: 0
      }
    }

    const utilizationValues = activeMetrics.map(m => m.utilization || 0)
    const avgUtilization = utilizationValues.reduce((sum, val) => sum + val, 0) / utilizationValues.length

    return {
      totalMetrics: state.metrics.length,
      healthyMetrics: state.metrics.filter(m => m.status === 'healthy').length,
      warningMetrics: state.metrics.filter(m => m.status === 'warning').length,
      criticalMetrics: state.metrics.filter(m => m.status === 'critical').length,
      currentInstances: state.currentInstances,
      targetInstances: state.targetInstances,
      minInstances: state.minInstances,
      maxInstances: state.maxInstances,
      currentUtilization: state.currentUtilization || avgUtilization,
      targetUtilization: state.targetUtilization,
      scalingEvents: state.events.filter(e => e.type === 'scaling').length,
      scalingOpportunities: state.recommendations.filter(r => r.status === 'pending').length,
      bottlenecks: state.bottlenecks.length,
      trends: state.trends.length > 0 ? state.trends[0].direction : 'stable',
      prediction: state.predictions.length > 0 ? state.predictions[0].trend : 'stable',
      capacity: state.capacity?.totalCapacity || 0,
      efficiency: state.capacity ? (state.capacity.usedCapacity / state.capacity.totalCapacity) * 100 : 0
    }
  }, [
    state.metrics, state.currentInstances, state.targetInstances, state.minInstances, state.maxInstances,
    state.currentUtilization, state.targetUtilization, state.events, state.recommendations,
    state.bottlenecks, state.trends, state.predictions, state.capacity
  ])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
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

  const getUtilizationColor = (utilization: number): string => {
    if (utilization < 50) return 'text-green-600'
    if (utilization < 70) return 'text-blue-600'
    if (utilization < 85) return 'text-yellow-600'
    if (utilization < 95) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'increasing': return 'text-orange-600'
      case 'decreasing': return 'text-green-600'
      case 'stable': return 'text-blue-600'
      case 'volatile': return 'text-red-600'
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

  const getScalingTypeIcon = (type: string) => {
    switch (type) {
      case 'horizontal': return <ArrowRight className="h-4 w-4" />
      case 'vertical': return <ArrowUp className="h-4 w-4" />
      case 'hybrid': return <Maximize className="h-4 w-4" />
      default: return <Layers className="h-4 w-4" />
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleScaleUp = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isScaling: true }))
      
      const scalingEvent = await scaleUp({
        targetInstances: Math.min(state.currentInstances + state.scalingFactor, state.maxInstances),
        reason: 'manual-scale-up',
        triggeredBy: userId
      })
      
      setState(prev => ({
        ...prev,
        currentInstances: scalingEvent.newInstanceCount,
        events: [...prev.events, scalingEvent],
        isScaling: false
      }))
      
      onScalingEvent?.(scalingEvent)
      logEvent('scale_up_triggered', { instanceCount: scalingEvent.newInstanceCount, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to scale up',
        isScaling: false
      }))
    }
  }, [scaleUp, state.currentInstances, state.scalingFactor, state.maxInstances, userId, onScalingEvent, logEvent])

  const handleScaleDown = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isScaling: true }))
      
      const scalingEvent = await scaleDown({
        targetInstances: Math.max(state.currentInstances - state.scalingFactor, state.minInstances),
        reason: 'manual-scale-down',
        triggeredBy: userId
      })
      
      setState(prev => ({
        ...prev,
        currentInstances: scalingEvent.newInstanceCount,
        events: [...prev.events, scalingEvent],
        isScaling: false
      }))
      
      onScalingEvent?.(scalingEvent)
      logEvent('scale_down_triggered', { instanceCount: scalingEvent.newInstanceCount, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to scale down',
        isScaling: false
      }))
    }
  }, [scaleDown, state.currentInstances, state.scalingFactor, state.minInstances, userId, onScalingEvent, logEvent])

  const handleAnalyzeScalability = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyzeScalability({
        timeRange: state.timeRange,
        granularity: state.granularity,
        metrics: state.metrics,
        includeBottlenecks: state.showBottlenecks,
        includePatterns: true,
        includeAnomalies: true
      })
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false
      }))
      
      logEvent('scalability_analysis_completed', { analysisId: analysis.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze scalability',
        isAnalyzing: false
      }))
    }
  }, [analyzeScalability, state.timeRange, state.granularity, state.metrics, state.showBottlenecks, logEvent, userId])

  const handleRunBenchmark = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isBenchmarking: true }))
      
      const benchmark = await runBenchmark({
        duration: 300000, // 5 minutes
        targetLoad: 1000, // 1000 concurrent users
        scalingConfig: {
          minInstances: state.minInstances,
          maxInstances: state.maxInstances,
          targetUtilization: state.targetUtilization
        }
      })
      
      setState(prev => ({
        ...prev,
        benchmarks: [...prev.benchmarks, benchmark],
        isBenchmarking: false
      }))
      
      logEvent('scalability_benchmark_completed', { benchmarkId: benchmark.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to run benchmark',
        isBenchmarking: false
      }))
    }
  }, [runBenchmark, state.minInstances, state.maxInstances, state.targetUtilization, logEvent, userId])

  const handleCreateTarget = useCallback(async (targetData: Partial<ScalabilityTarget>) => {
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
      
      logEvent('scalability_target_created', { targetId: newTarget.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create target',
        isCreating: false
      }))
    }
  }, [createTarget, multiTenant, organizationId, userId, logEvent])

  const handleApplyRecommendation = useCallback(async (recommendation: ScalabilityRecommendation) => {
    try {
      setState(prev => ({ ...prev, isScaling: true }))
      
      await applyRecommendation(recommendation.id)
      
      setState(prev => ({
        ...prev,
        recommendations: prev.recommendations.map(r =>
          r.id === recommendation.id ? { ...r, status: 'applied' } : r
        ),
        isScaling: false
      }))
      
      logEvent('scalability_recommendation_applied', { recommendationId: recommendation.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply recommendation',
        isScaling: false
      }))
    }
  }, [applyRecommendation, logEvent, userId])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleTargetInstancesChange = useCallback((target: number) => {
    setState(prev => ({
      ...prev,
      targetInstances: Math.max(state.minInstances, Math.min(target, state.maxInstances))
    }))
  }, [state.minInstances, state.maxInstances])

  const handleTargetUtilizationChange = useCallback((utilization: number) => {
    setState(prev => ({
      ...prev,
      targetUtilization: Math.max(1, Math.min(utilization, 100))
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
          refreshPlans(),
          refreshTests(),
          refreshBenchmarks(),
          enablePredictions ? refreshPredictions() : Promise.resolve(),
          enableRecommendations ? refreshRecommendations() : Promise.resolve()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize scalability data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [
    workflowId, refreshMetrics, refreshTargets, refreshPolicies, refreshPlans,
    refreshTests, refreshBenchmarks, refreshPredictions, refreshRecommendations,
    enablePredictions, enableRecommendations
  ])

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
    // Set up auto-scaling
    if (state.scalingMode === 'automatic' && !state.isScaling) {
      scalingIntervalRef.current = setInterval(() => {
        // Check if scaling is needed based on current utilization
        if (state.currentUtilization > state.targetUtilization * 1.2) {
          handleScaleUp()
        } else if (state.currentUtilization < state.targetUtilization * 0.8) {
          handleScaleDown()
        }
      }, 60000) // Every minute
      
      return () => {
        if (scalingIntervalRef.current) {
          clearInterval(scalingIntervalRef.current)
        }
      }
    }
  }, [state.scalingMode, state.isScaling, state.currentUtilization, state.targetUtilization, handleScaleUp, handleScaleDown])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      metrics: metrics || [],
      targets: targets || [],
      policies: policies || [],
      plans: plans || [],
      tests: tests || [],
      benchmarks: benchmarks || [],
      predictions: predictions || [],
      recommendations: recommendations || []
    }))
  }, [metrics, targets, policies, plans, tests, benchmarks, predictions, recommendations])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Scalability Manager</h1>
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleScaleUp} disabled={state.isScaling || state.currentInstances >= state.maxInstances}>
            <ArrowUp className="h-4 w-4 mr-2" />
            Scale Up
          </Button>
          
          <Button onClick={handleScaleDown} disabled={state.isScaling || state.currentInstances <= state.minInstances} variant="outline">
            <ArrowDown className="h-4 w-4 mr-2" />
            Scale Down
          </Button>
          
          <Button onClick={handleAnalyzeScalability} disabled={state.isAnalyzing} variant="outline">
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
            <TabsTrigger value="scaling">Scaling</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Label>Instances:</Label>
          <Input
            type="number"
            value={state.targetInstances}
            onChange={(e) => handleTargetInstancesChange(Number(e.target.value))}
            className="w-20"
            min={state.minInstances}
            max={state.maxInstances}
          />
          <span className="text-sm text-muted-foreground">of {state.maxInstances}</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center space-x-2">
          <Label>Target:</Label>
          <Input
            type="number"
            value={state.targetUtilization}
            onChange={(e) => handleTargetUtilizationChange(Number(e.target.value))}
            className="w-20"
            min={1}
            max={100}
          />
          <span className="text-sm text-muted-foreground">%</span>
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

        {state.isScaling && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Scaling</span>
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
            <Server className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Current Instances</p>
              <p className="text-2xl font-bold">{scalabilityStatistics.currentInstances}</p>
              <p className="text-xs text-muted-foreground">of {scalabilityStatistics.targetInstances} target</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Utilization</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(scalabilityStatistics.currentUtilization)}`}>
                {formatPercentage(scalabilityStatistics.currentUtilization)}
              </p>
              <p className="text-xs text-muted-foreground">target {formatPercentage(scalabilityStatistics.targetUtilization)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Scaling Events</p>
              <p className="text-2xl font-bold">{scalabilityStatistics.scalingEvents}</p>
              <p className="text-xs text-muted-foreground">in timeframe</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Capacity</p>
              <p className="text-2xl font-bold">{formatNumber(scalabilityStatistics.capacity)}</p>
              <p className="text-xs text-muted-foreground">total available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Efficiency</p>
              <p className="text-2xl font-bold">{formatPercentage(scalabilityStatistics.efficiency)}</p>
              <p className="text-xs text-muted-foreground">resource usage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className={getTrendColor(scalabilityStatistics.trends)}>
              {getTrendIcon(scalabilityStatistics.trends)}
            </div>
            <div>
              <p className="text-sm font-medium">Trend</p>
              <p className={`text-2xl font-bold ${getTrendColor(scalabilityStatistics.trends)}`}>
                {scalabilityStatistics.trends}
              </p>
              <p className="text-xs text-muted-foreground">demand pattern</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMetricCard = (metric: ScalabilityMetric) => (
    <Card key={metric.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Layers className="h-4 w-4 text-blue-600" />
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
              <p className="font-medium">{formatNumber(metric.currentValue || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="font-medium">{formatNumber(metric.targetValue || 0)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Utilization</p>
              <p className={`font-medium ${getUtilizationColor(metric.utilization || 0)}`}>
                {formatPercentage(metric.utilization || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="font-medium">{formatNumber(metric.capacity || 0)}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Efficiency</span>
              <span>{formatPercentage(metric.efficiency || 0)}</span>
            </div>
            <Progress value={metric.efficiency || 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderRecommendationCard = (recommendation: ScalabilityRecommendation, index: number) => (
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
              <p className="font-medium text-green-600">+{formatPercentage(recommendation.expectedImprovement || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Impact</p>
              <p className="font-medium">{recommendation.impact || 'Medium'}</p>
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => handleApplyRecommendation(recommendation)}
            disabled={recommendation.status === 'applied'}
          >
            {recommendation.status === 'applied' ? 'Applied' : 'Apply Scaling'}
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
                      <CardTitle>Scalability Overview</CardTitle>
                      <CardDescription>Real-time scalability metrics and scaling events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 border rounded-md p-4">
                        <p className="text-muted-foreground text-center">Scalability performance charts will be rendered here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Scaling Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {state.recommendations.filter(r => r.status === 'pending').slice(0, 3).map((recommendation, index) => (
                            <div key={index} className="p-2 rounded bg-muted">
                              <p className="font-medium text-sm">{recommendation.title}</p>
                              <p className="text-xs text-muted-foreground">{recommendation.description}</p>
                              <p className="text-xs text-green-600">
                                Improvement: +{formatPercentage(recommendation.expectedImprovement || 0)}
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
                        <span className="text-sm font-medium">{scalabilityStatistics.totalMetrics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Healthy Metrics</span>
                        <span className="text-sm font-medium">{scalabilityStatistics.healthyMetrics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Bottlenecks</span>
                        <span className="text-sm font-medium">{scalabilityStatistics.bottlenecks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Opportunities</span>
                        <span className="text-sm font-medium">{scalabilityStatistics.scalingOpportunities}</span>
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

          {/* Scaling View */}
          <TabsContent value="scaling" className="flex-1 overflow-hidden">
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
      {(state.isLoading || state.isScaling || state.isAnalyzing || state.isBenchmarking) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading scalability data...' :
                 state.isScaling ? 'Scaling resources...' :
                 state.isAnalyzing ? 'Analyzing scalability...' :
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

export default ScalabilityManager