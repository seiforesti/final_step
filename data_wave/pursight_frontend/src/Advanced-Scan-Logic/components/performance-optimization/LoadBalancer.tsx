"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Network, Server, Globe, Activity, Cpu, MemoryStick, HardDrive, Gauge, Target, Zap, RefreshCw, BarChart3, PieChart, LineChart, TrendingUp, TrendingDown, Settings, Play, Pause, Square, RotateCcw, Plus, Minus, Edit, Trash2, Copy, Eye, EyeOff, Search, Filter, Download, Upload, Share2, Clock, Timer, Calendar, Users, User, CheckCircle, AlertTriangle, XCircle, Info, Flag, Star, Shield, Lock, Unlock, Key, Code, FileText, Archive, History, Award, Crown, Hash, Percent, DollarSign, TrendingUpDown, Maximize, Minimize, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX, Wifi, WifiOff, Signal, Battery, BatteryLow, Thermometer, Monitor, Smartphone, Tablet, Laptop, Desktop, Package, Layers, Database } from 'lucide-react'

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
  LoadBalancer as LoadBalancerType,
  LoadBalancerPool,
  LoadBalancerNode,
  LoadBalancerRule,
  LoadBalancerPolicy,
  LoadBalancerAlgorithm,
  LoadBalancerHealthCheck,
  LoadBalancerMetrics,
  LoadBalancerStatistics,
  LoadBalancerConfiguration,
  LoadBalancerSession,
  LoadBalancerConnection,
  LoadBalancerEndpoint,
  LoadBalancerTarget,
  LoadBalancerListener,
  LoadBalancerRoute,
  LoadBalancerBackend,
  LoadBalancerFrontend,
  LoadBalancerCluster,
  LoadBalancerRegion,
  LoadBalancerZone,
  LoadBalancerFailover,
  LoadBalancerStickiness,
  LoadBalancerSSL,
  LoadBalancerCertificate,
  LoadBalancerSecurity,
  LoadBalancerMonitoring,
  LoadBalancerAlert,
  LoadBalancerEvent,
  LoadBalancerLog,
  LoadBalancerAudit,
  LoadBalancerReport,
  LoadBalancerAnalysis,
  LoadBalancerOptimization,
  LoadBalancerPerformance,
  LoadBalancerLatency,
  LoadBalancerThroughput,
  LoadBalancerCapacity,
  LoadBalancerScaling,
  LoadBalancerReplication,
  LoadBalancerDistribution,
  LoadBalancerWeighting,
  LoadBalancerPriority,
  LoadBalancerThreshold,
  LoadBalancerQuota,
  LoadBalancerLimit,
  LoadBalancerBandwidth,
  LoadBalancerTimeout,
  LoadBalancerRetry,
  LoadBalancerCircuitBreaker,
  LoadBalancerRateLimit
} from '../../types/loadbalancer.types'

import {
  useLoadBalancer,
  useLoadBalancerPools,
  useLoadBalancerNodes,
  useLoadBalancerRules,
  useLoadBalancerPolicies,
  useLoadBalancerHealthChecks,
  useLoadBalancerMetrics,
  useLoadBalancerConfiguration,
  useLoadBalancerMonitoring,
  useLoadBalancerOptimization,
  useLoadBalancerAnalysis,
  useLoadBalancerSecurity,
  useLoadBalancerSSL,
  useLoadBalancerScaling,
  useLoadBalancerFailover,
  useLoadBalancerAudit
} from '../../hooks/useLoadBalancer'

import {
  createLoadBalancer,
  updateLoadBalancer,
  deleteLoadBalancer,
  startLoadBalancer,
  stopLoadBalancer,
  restartLoadBalancer,
  pauseLoadBalancer,
  resumeLoadBalancer,
  enableLoadBalancer,
  disableLoadBalancer,
  configureLoadBalancer,
  scaleLoadBalancer,
  optimizeLoadBalancer,
  monitorLoadBalancer,
  analyzeLoadBalancer,
  rebalanceLoadBalancer,
  redistributeLoadBalancer,
  failoverLoadBalancer,
  drainLoadBalancer,
  addLoadBalancerNode,
  removeLoadBalancerNode,
  updateLoadBalancerNode,
  enableLoadBalancerNode,
  disableLoadBalancerNode,
  healthCheckLoadBalancerNode,
  createLoadBalancerPool,
  updateLoadBalancerPool,
  deleteLoadBalancerPool,
  addNodeToPool,
  removeNodeFromPool,
  createLoadBalancerRule,
  updateLoadBalancerRule,
  deleteLoadBalancerRule,
  applyLoadBalancerRule,
  createLoadBalancerPolicy,
  updateLoadBalancerPolicy,
  deleteLoadBalancerPolicy,
  applyLoadBalancerPolicy,
  configureLoadBalancerAlgorithm,
  setLoadBalancerWeights,
  configureLoadBalancerStickiness,
  setupLoadBalancerSSL,
  configureLoadBalancerSecurity,
  enableLoadBalancerLogging,
  configureLoadBalancerMonitoring,
  setupLoadBalancerAlerting,
  generateLoadBalancerReport,
  exportLoadBalancerConfiguration,
  importLoadBalancerConfiguration,
  backupLoadBalancer,
  restoreLoadBalancer,
  migrateLoadBalancer,
  upgradeLoadBalancer,
  validateLoadBalancerConfiguration,
  testLoadBalancerConfiguration,
  benchmarkLoadBalancer,
  profileLoadBalancer,
  debugLoadBalancer,
  troubleshootLoadBalancer,
  auditLoadBalancer,
  complianceCheckLoadBalancer,
  securityScanLoadBalancer,
  performanceTestLoadBalancer,
  loadTestLoadBalancer,
  stressTestLoadBalancer,
  capacityTestLoadBalancer,
  failoverTestLoadBalancer,
  disasterRecoveryTestLoadBalancer,
  businessContinuityTestLoadBalancer,
  scalabilityTestLoadBalancer,
  reliabilityTestLoadBalancer,
  availabilityTestLoadBalancer,
  consistencyTestLoadBalancer,
  integrityTestLoadBalancer,
  confidentialityTestLoadBalancer,
  authenticationTestLoadBalancer,
  authorizationTestLoadBalancer,
  accountabilityTestLoadBalancer,
  nonRepudiationTestLoadBalancer,
  privacyTestLoadBalancer,
  gdprComplianceTestLoadBalancer,
  hipaaComplianceTestLoadBalancer,
  soxComplianceTestLoadBalancer,
  isoComplianceTestLoadBalancer,
  getLoadBalancerMetrics,
  getLoadBalancerStatistics,
  getLoadBalancerHealth,
  getLoadBalancerPerformance,
  getLoadBalancerCapacity,
  getLoadBalancerUtilization,
  getLoadBalancerThroughput,
  getLoadBalancerLatency,
  getLoadBalancerErrors,
  getLoadBalancerConnections,
  getLoadBalancerSessions,
  getLoadBalancerTraffic,
  getLoadBalancerBandwidth,
  getLoadBalancerCost,
  getLoadBalancerROI,
  getLoadBalancerEfficiency,
  getLoadBalancerReliability,
  getLoadBalancerAvailability,
  getLoadBalancerSLA,
  getLoadBalancerCompliance,
  getLoadBalancerSecurity,
  getLoadBalancerRisk,
  getLoadBalancerThreat,
  getLoadBalancerVulnerability,
  getLoadBalancerIncident,
  getLoadBalancerAlert,
  getLoadBalancerEvent,
  getLoadBalancerLog,
  getLoadBalancerAuditLog,
  getLoadBalancerReport
} from '../../services/load-balancer-apis'

// Enhanced interfaces for advanced load balancer management
interface LoadBalancerState {
  // Core load balancer state
  loadBalancers: LoadBalancerType[]
  pools: LoadBalancerPool[]
  nodes: LoadBalancerNode[]
  rules: LoadBalancerRule[]
  policies: LoadBalancerPolicy[]
  healthChecks: LoadBalancerHealthCheck[]
  
  // Selected items
  selectedLoadBalancer: LoadBalancerType | null
  selectedPool: LoadBalancerPool | null
  selectedNode: LoadBalancerNode | null
  selectedRule: LoadBalancerRule | null
  selectedPolicy: LoadBalancerPolicy | null
  
  // Load balancer operations
  isRunning: boolean
  isMonitoring: boolean
  isOptimizing: boolean
  isAnalyzing: boolean
  isBalancing: boolean
  isRebalancing: boolean
  isFailingOver: boolean
  isScaling: boolean
  
  // Metrics and statistics
  metrics: LoadBalancerMetrics | null
  statistics: LoadBalancerStatistics | null
  performance: LoadBalancerPerformance | null
  alerts: LoadBalancerAlert[]
  events: LoadBalancerEvent[]
  
  // Configuration
  configuration: LoadBalancerConfiguration
  algorithm: LoadBalancerAlgorithm
  sslConfiguration: LoadBalancerSSL | null
  securityConfiguration: LoadBalancerSecurity | null
  
  // View and UI state
  view: 'dashboard' | 'load-balancers' | 'pools' | 'nodes' | 'rules' | 'policies' | 'monitoring' | 'optimization' | 'analysis' | 'settings'
  balancerView: 'application' | 'network' | 'dns' | 'global' | 'all'
  timeRange: '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
  
  // Display preferences
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'gauge' | 'heatmap'
  displayMode: 'grid' | 'list' | 'detailed' | 'compact'
  showMetrics: boolean
  showStatistics: boolean
  showAlerts: boolean
  showEvents: boolean
  autoRefresh: boolean
  refreshInterval: number
  
  // Filter and search
  searchQuery: string
  statusFilter: 'all' | 'active' | 'inactive' | 'error' | 'maintenance' | 'draining'
  typeFilter: string[]
  poolFilter: string[]
  algorithmFilter: string[]
  
  // Load balancer-specific settings
  defaultAlgorithm: 'round-robin' | 'least-connections' | 'least-response-time' | 'weighted' | 'ip-hash' | 'url-hash'
  enableStickySession: boolean
  enableHealthCheck: boolean
  enableSSL: boolean
  enableCompression: boolean
  enableCaching: boolean
  enableLogging: boolean
  enableMonitoring: boolean
  
  // Operations state
  isCreating: boolean
  isDeleting: boolean
  isUpdating: boolean
  isStarting: boolean
  isStopping: boolean
  isRestarting: boolean
  isPausing: boolean
  isResuming: boolean
  isEnabling: boolean
  isDisabling: boolean
  isConfiguring: boolean
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * LoadBalancer Component
 * 
 * Enterprise-grade load balancer management component that provides comprehensive
 * load balancing infrastructure management capabilities including:
 * - Multi-tier load balancer orchestration
 * - Dynamic load balancing algorithms
 * - Real-time traffic distribution and monitoring
 * - Advanced health checking and failover
 * - SSL/TLS termination and security
 * - Session affinity and sticky sessions
 * - Traffic routing and rule management
 * - Performance optimization and scaling
 * - Load balancer pool and node management
 * - Comprehensive analytics and reporting
 * - Disaster recovery and business continuity
 * - Compliance and security monitoring
 * 
 * This component integrates with the backend load balancer management system and provides
 * a sophisticated user interface for comprehensive load balancing operations.
 */
export const LoadBalancer: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onLoadBalancerCreated?: (loadBalancer: LoadBalancerType) => void
  onLoadBalancerDeleted?: (loadBalancerId: string) => void
  autoMonitor?: boolean
  enableOptimization?: boolean
  enableSecurity?: boolean
  enableSSL?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onLoadBalancerCreated,
  onLoadBalancerDeleted,
  autoMonitor = true,
  enableOptimization = true,
  enableSecurity = true,
  enableSSL = false,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<LoadBalancerState>({
    // Core load balancer state
    loadBalancers: [],
    pools: [],
    nodes: [],
    rules: [],
    policies: [],
    healthChecks: [],
    
    // Selected items
    selectedLoadBalancer: null,
    selectedPool: null,
    selectedNode: null,
    selectedRule: null,
    selectedPolicy: null,
    
    // Load balancer operations
    isRunning: false,
    isMonitoring: autoMonitor,
    isOptimizing: false,
    isAnalyzing: false,
    isBalancing: false,
    isRebalancing: false,
    isFailingOver: false,
    isScaling: false,
    
    // Metrics and statistics
    metrics: null,
    statistics: null,
    performance: null,
    alerts: [],
    events: [],
    
    // Configuration
    configuration: {
      algorithm: 'round-robin',
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 5000, // 5 seconds
      maxConnections: 10000,
      connectionTimeout: 30000, // 30 seconds
      sessionTimeout: 3600000, // 1 hour
      enableStickySessions: false,
      enableHealthChecks: true,
      enableSSL: enableSSL,
      enableCompression: true,
      enableCaching: false,
      enableLogging: true,
      enableMonitoring: autoMonitor,
      enableSecurity: enableSecurity,
      enableOptimization: enableOptimization,
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000, // 1 minute
      rateLimitRequests: 1000,
      rateLimitWindow: 60000, // 1 minute
      bandwidthLimit: 1000000000, // 1 Gbps
      bufferSize: 65536, // 64 KB
      keepAliveTimeout: 75000, // 75 seconds
      maxRequestSize: 1048576, // 1 MB
      compressionLevel: 6,
      sslCipherSuite: 'ECDHE-RSA-AES256-GCM-SHA384',
      sslProtocolVersion: 'TLSv1.2'
    } as LoadBalancerConfiguration,
    algorithm: {
      type: 'round-robin',
      weights: {},
      parameters: {},
      metadata: {}
    } as LoadBalancerAlgorithm,
    sslConfiguration: null,
    securityConfiguration: null,
    
    // View and UI state
    view: 'dashboard',
    balancerView: 'all',
    timeRange: '1h',
    
    // Display preferences
    chartType: 'line',
    displayMode: 'grid',
    showMetrics: true,
    showStatistics: true,
    showAlerts: true,
    showEvents: true,
    autoRefresh: true,
    refreshInterval: 5000, // 5 seconds
    
    // Filter and search
    searchQuery: '',
    statusFilter: 'all',
    typeFilter: [],
    poolFilter: [],
    algorithmFilter: [],
    
    // Load balancer-specific settings
    defaultAlgorithm: 'round-robin',
    enableStickySession: false,
    enableHealthCheck: true,
    enableSSL: enableSSL,
    enableCompression: true,
    enableCaching: false,
    enableLogging: true,
    enableMonitoring: autoMonitor,
    
    // Operations state
    isCreating: false,
    isDeleting: false,
    isUpdating: false,
    isStarting: false,
    isStopping: false,
    isRestarting: false,
    isPausing: false,
    isResuming: false,
    isEnabling: false,
    isDisabling: false,
    isConfiguring: false,
    
    // Error and loading states
    error: null,
    warnings: [],
    isLoading: false,
    progress: 0
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Hook integrations
  const {
    loadBalancer,
    isActive,
    start,
    stop,
    restart,
    refresh
  } = useLoadBalancer(workflowId)

  const {
    pools,
    activePools,
    createPool,
    updatePool,
    deletePool,
    refreshPools
  } = useLoadBalancerPools()

  const {
    nodes,
    activeNodes,
    createNode,
    updateNode,
    deleteNode,
    refreshNodes
  } = useLoadBalancerNodes()

  const {
    rules,
    activeRules,
    createRule,
    updateRule,
    deleteRule,
    refreshRules
  } = useLoadBalancerRules()

  const {
    policies,
    activePolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    refreshPolicies
  } = useLoadBalancerPolicies()

  const {
    healthChecks,
    healthStatus,
    createHealthCheck,
    updateHealthCheck,
    deleteHealthCheck,
    refreshHealthChecks
  } = useLoadBalancerHealthChecks()

  const {
    metrics,
    latestMetrics,
    refreshMetrics,
    collectMetrics
  } = useLoadBalancerMetrics()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration,
    validateConfiguration
  } = useLoadBalancerConfiguration()

  const {
    monitoring,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshMonitoring
  } = useLoadBalancerMonitoring()

  const {
    optimization,
    recommendations,
    optimize,
    applyOptimization,
    scheduleOptimization
  } = useLoadBalancerOptimization()

  const {
    analysis,
    reports,
    analyze,
    generateReport,
    scheduleAnalysis
  } = useLoadBalancerAnalysis()

  const {
    security,
    threats,
    vulnerabilities,
    configureSecurity,
    scanSecurity,
    updateSecurity
  } = useLoadBalancerSecurity()

  const {
    ssl,
    certificates,
    configureSSL,
    renewCertificate,
    validateCertificate
  } = useLoadBalancerSSL()

  const {
    scaling,
    scalingPolicies,
    autoScale,
    manualScale,
    configureScaling
  } = useLoadBalancerScaling()

  const {
    failover,
    failoverPolicies,
    triggerFailover,
    configureFailover,
    testFailover
  } = useLoadBalancerFailover()

  const {
    auditLog,
    logEvent,
    generateAuditReport
  } = useLoadBalancerAudit()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredLoadBalancers = useMemo(() => {
    let result = state.loadBalancers

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(lb =>
        lb.name?.toLowerCase().includes(query) ||
        lb.type?.toLowerCase().includes(query) ||
        lb.algorithm?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (state.statusFilter !== 'all') {
      result = result.filter(lb => {
        switch (state.statusFilter) {
          case 'active':
            return lb.status === 'active'
          case 'inactive':
            return lb.status === 'inactive'
          case 'error':
            return lb.status === 'error'
          case 'maintenance':
            return lb.status === 'maintenance'
          case 'draining':
            return lb.status === 'draining'
          default:
            return true
        }
      })
    }

    // Apply type filter
    if (state.typeFilter.length > 0) {
      result = result.filter(lb =>
        state.typeFilter.includes(lb.type)
      )
    }

    // Apply algorithm filter
    if (state.algorithmFilter.length > 0) {
      result = result.filter(lb =>
        state.algorithmFilter.includes(lb.algorithm)
      )
    }

    return result
  }, [
    state.loadBalancers, state.searchQuery, state.statusFilter,
    state.typeFilter, state.algorithmFilter
  ])

  const loadBalancerStatistics = useMemo(() => {
    const activeLoadBalancers = state.loadBalancers.filter(lb => lb.status === 'active')
    const totalConnections = activeLoadBalancers.reduce((sum, lb) => sum + (lb.activeConnections || 0), 0)
    const totalThroughput = activeLoadBalancers.reduce((sum, lb) => sum + (lb.throughput || 0), 0)
    const totalLatency = activeLoadBalancers.reduce((sum, lb) => sum + (lb.avgLatency || 0), 0)
    const avgLatency = activeLoadBalancers.length > 0 ? totalLatency / activeLoadBalancers.length : 0
    const totalNodes = state.nodes.length
    const healthyNodes = state.nodes.filter(n => n.health === 'healthy').length
    const unhealthyNodes = state.nodes.filter(n => n.health === 'unhealthy').length

    return {
      totalLoadBalancers: state.loadBalancers.length,
      activeLoadBalancers: activeLoadBalancers.length,
      inactiveLoadBalancers: state.loadBalancers.filter(lb => lb.status === 'inactive').length,
      errorLoadBalancers: state.loadBalancers.filter(lb => lb.status === 'error').length,
      drainingLoadBalancers: state.loadBalancers.filter(lb => lb.status === 'draining').length,
      
      totalPools: state.pools.length,
      activePools: state.pools.filter(p => p.status === 'active').length,
      
      totalNodes,
      healthyNodes,
      unhealthyNodes,
      nodeHealthRatio: totalNodes > 0 ? (healthyNodes / totalNodes) * 100 : 0,
      
      totalConnections,
      totalThroughput,
      avgLatency,
      
      totalRequests: activeLoadBalancers.reduce((sum, lb) => sum + (lb.totalRequests || 0), 0),
      successfulRequests: activeLoadBalancers.reduce((sum, lb) => sum + (lb.successfulRequests || 0), 0),
      failedRequests: activeLoadBalancers.reduce((sum, lb) => sum + (lb.failedRequests || 0), 0),
      
      totalRules: state.rules.length,
      activeRules: state.rules.filter(r => r.status === 'active').length,
      
      totalPolicies: state.policies.length,
      activePolicies: state.policies.filter(p => p.status === 'active').length,
      
      totalHealthChecks: state.healthChecks.length,
      passingHealthChecks: state.healthChecks.filter(hc => hc.status === 'passing').length,
      failingHealthChecks: state.healthChecks.filter(hc => hc.status === 'failing').length,
      
      totalAlerts: state.alerts.length,
      activeAlerts: state.alerts.filter(a => a.status === 'active').length,
      criticalAlerts: state.alerts.filter(a => a.severity === 'critical').length,
      
      totalEvents: state.events.length,
      recentEvents: state.events.filter(e => 
        new Date(e.timestamp).getTime() > Date.now() - 3600000 // Last hour
      ).length,
      
      avgCpuUsage: activeLoadBalancers.reduce((sum, lb) => sum + (lb.cpuUsage || 0), 0) / activeLoadBalancers.length,
      avgMemoryUsage: activeLoadBalancers.reduce((sum, lb) => sum + (lb.memoryUsage || 0), 0) / activeLoadBalancers.length,
      avgNetworkUsage: activeLoadBalancers.reduce((sum, lb) => sum + (lb.networkUsage || 0), 0) / activeLoadBalancers.length
    }
  }, [state.loadBalancers, state.pools, state.nodes, state.rules, state.policies, state.healthChecks, state.alerts, state.events])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
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

  const formatLatency = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'inactive': return 'text-gray-600'
      case 'error': return 'text-red-600'
      case 'maintenance': return 'text-blue-600'
      case 'draining': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'outline'
      case 'error': return 'destructive'
      case 'maintenance': return 'outline'
      case 'draining': return 'secondary'
      default: return 'outline'
    }
  }

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'healthy': return 'text-green-600'
      case 'unhealthy': return 'text-red-600'
      case 'degraded': return 'text-yellow-600'
      case 'unknown': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getAlgorithmIcon = (algorithm: string) => {
    switch (algorithm) {
      case 'round-robin': return <RotateCcw className="h-4 w-4" />
      case 'least-connections': return <Network className="h-4 w-4" />
      case 'least-response-time': return <Timer className="h-4 w-4" />
      case 'weighted': return <Target className="h-4 w-4" />
      case 'ip-hash': return <Hash className="h-4 w-4" />
      case 'url-hash': return <Globe className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateLoadBalancer = useCallback(async (loadBalancerData: Partial<LoadBalancerType>) => {
    try {
      setState(prev => ({ ...prev, isCreating: true }))
      
      const newLoadBalancer = await createLoadBalancer({
        ...loadBalancerData,
        organizationId: multiTenant ? organizationId : undefined,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        configuration: state.configuration
      })
      
      setState(prev => ({
        ...prev,
        loadBalancers: [...prev.loadBalancers, newLoadBalancer],
        isCreating: false
      }))
      
      onLoadBalancerCreated?.(newLoadBalancer)
      logEvent('load_balancer_created', { loadBalancerId: newLoadBalancer.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create load balancer',
        isCreating: false
      }))
    }
  }, [createLoadBalancer, multiTenant, organizationId, userId, state.configuration, onLoadBalancerCreated, logEvent])

  const handleDeleteLoadBalancer = useCallback(async (loadBalancerId: string) => {
    try {
      setState(prev => ({ ...prev, isDeleting: true }))
      
      await deleteLoadBalancer(loadBalancerId)
      
      setState(prev => ({
        ...prev,
        loadBalancers: prev.loadBalancers.filter(lb => lb.id !== loadBalancerId),
        selectedLoadBalancer: prev.selectedLoadBalancer?.id === loadBalancerId ? null : prev.selectedLoadBalancer,
        isDeleting: false
      }))
      
      onLoadBalancerDeleted?.(loadBalancerId)
      logEvent('load_balancer_deleted', { loadBalancerId, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete load balancer',
        isDeleting: false
      }))
    }
  }, [deleteLoadBalancer, onLoadBalancerDeleted, logEvent, userId])

  const handleStartLoadBalancer = useCallback(async (loadBalancer: LoadBalancerType) => {
    try {
      setState(prev => ({ ...prev, isStarting: true }))
      
      await startLoadBalancer(loadBalancer.id)
      
      setState(prev => ({
        ...prev,
        loadBalancers: prev.loadBalancers.map(lb => 
          lb.id === loadBalancer.id ? { ...lb, status: 'active' } : lb
        ),
        isStarting: false
      }))
      
      logEvent('load_balancer_started', { loadBalancerId: loadBalancer.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start load balancer',
        isStarting: false
      }))
    }
  }, [logEvent, userId])

  const handleStopLoadBalancer = useCallback(async (loadBalancer: LoadBalancerType) => {
    try {
      setState(prev => ({ ...prev, isStopping: true }))
      
      await stopLoadBalancer(loadBalancer.id)
      
      setState(prev => ({
        ...prev,
        loadBalancers: prev.loadBalancers.map(lb => 
          lb.id === loadBalancer.id ? { ...lb, status: 'inactive' } : lb
        ),
        isStopping: false
      }))
      
      logEvent('load_balancer_stopped', { loadBalancerId: loadBalancer.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop load balancer',
        isStopping: false
      }))
    }
  }, [logEvent, userId])

  const handleOptimizeLoadBalancer = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      const optimization = await optimize({
        loadBalancers: state.loadBalancers.filter(lb => lb.status === 'active'),
        goals: ['performance', 'latency', 'throughput'],
        constraints: {
          maxLatency: 100, // 100ms
          minThroughput: 1000 // 1000 requests/sec
        }
      })
      
      setState(prev => ({
        ...prev,
        isOptimizing: false
      }))
      
      logEvent('load_balancer_optimized', { optimizationId: optimization.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize load balancer',
        isOptimizing: false
      }))
    }
  }, [optimize, state.loadBalancers, logEvent, userId])

  const handleAnalyzeLoadBalancer = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyze({
        timeRange: state.timeRange,
        loadBalancers: state.loadBalancers,
        includePerformance: true,
        includeTraffic: true,
        includeOptimizations: true
      })
      
      setState(prev => ({
        ...prev,
        analysis,
        isAnalyzing: false
      }))
      
      logEvent('load_balancer_analyzed', { analysisId: analysis.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze load balancer',
        isAnalyzing: false
      }))
    }
  }, [analyze, state.timeRange, state.loadBalancers, logEvent, userId])

  const handleRebalance = useCallback(async (loadBalancer: LoadBalancerType) => {
    try {
      setState(prev => ({ ...prev, isRebalancing: true }))
      
      await rebalanceLoadBalancer(loadBalancer.id)
      
      setState(prev => ({ ...prev, isRebalancing: false }))
      
      logEvent('load_balancer_rebalanced', { loadBalancerId: loadBalancer.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to rebalance load balancer',
        isRebalancing: false
      }))
    }
  }, [logEvent, userId])

  const handleFailover = useCallback(async (loadBalancer: LoadBalancerType) => {
    try {
      setState(prev => ({ ...prev, isFailingOver: true }))
      
      await failoverLoadBalancer(loadBalancer.id)
      
      setState(prev => ({ ...prev, isFailingOver: false }))
      
      logEvent('load_balancer_failover', { loadBalancerId: loadBalancer.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to failover load balancer',
        isFailingOver: false
      }))
    }
  }, [logEvent, userId])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleLoadBalancerSelect = useCallback((loadBalancer: LoadBalancerType) => {
    setState(prev => ({ ...prev, selectedLoadBalancer: loadBalancer }))
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
          refreshPools(),
          refreshNodes(),
          refreshRules(),
          refreshPolicies(),
          refreshHealthChecks(),
          refreshMetrics(),
          refreshMonitoring()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize load balancer data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [workflowId, refreshPools, refreshNodes, refreshRules, refreshPolicies, refreshHealthChecks, refreshMetrics, refreshMonitoring])

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
    // Update state from hooks
    setState(prev => ({
      ...prev,
      pools: pools || [],
      nodes: nodes || [],
      rules: rules || [],
      policies: policies || [],
      healthChecks: healthChecks || [],
      metrics: metrics || null
    }))
  }, [pools, nodes, rules, policies, healthChecks, metrics])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Load Balancer</h1>
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleCreateLoadBalancer({})} disabled={state.isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Create Load Balancer
          </Button>
          
          <Button onClick={handleOptimizeLoadBalancer} disabled={state.isOptimizing} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Optimize
          </Button>
          
          <Button onClick={handleAnalyzeLoadBalancer} disabled={state.isAnalyzing} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="load-balancers">Load Balancers</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
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

        {state.isMonitoring && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
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
            <Network className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Active Load Balancers</p>
              <p className="text-2xl font-bold">{loadBalancerStatistics.activeLoadBalancers}</p>
              <p className="text-xs text-muted-foreground">of {loadBalancerStatistics.totalLoadBalancers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Healthy Nodes</p>
              <p className="text-2xl font-bold">{loadBalancerStatistics.healthyNodes}</p>
              <p className="text-xs text-muted-foreground">of {loadBalancerStatistics.totalNodes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Active Connections</p>
              <p className="text-2xl font-bold">{formatNumber(loadBalancerStatistics.totalConnections)}</p>
              <p className="text-xs text-muted-foreground">real-time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Throughput</p>
              <p className="text-2xl font-bold">{formatNumber(loadBalancerStatistics.totalThroughput)}/s</p>
              <p className="text-xs text-muted-foreground">requests per second</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Avg Latency</p>
              <p className="text-2xl font-bold">{formatLatency(loadBalancerStatistics.avgLatency)}</p>
              <p className="text-xs text-muted-foreground">response time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium">Node Health</p>
              <p className="text-2xl font-bold">{formatPercentage(loadBalancerStatistics.nodeHealthRatio)}</p>
              <p className="text-xs text-muted-foreground">overall health</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLoadBalancerCard = (loadBalancer: LoadBalancerType) => (
    <Card 
      key={loadBalancer.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        state.selectedLoadBalancer?.id === loadBalancer.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleLoadBalancerSelect(loadBalancer)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Network className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">{loadBalancer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{loadBalancer.type} • {loadBalancer.algorithm}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusVariant(loadBalancer.status)}>
              {loadBalancer.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {loadBalancer.status === 'inactive' ? (
                  <DropdownMenuItem onClick={() => handleStartLoadBalancer(loadBalancer)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleStopLoadBalancer(loadBalancer)}>
                    <Square className="h-4 w-4 mr-2" />
                    Square
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleRebalance(loadBalancer)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rebalance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFailover(loadBalancer)}>
                  <Activity className="h-4 w-4 mr-2" />
                  Failover
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteLoadBalancer(loadBalancer.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Connections</p>
              <p className="font-medium">{formatNumber(loadBalancer.activeConnections || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Throughput</p>
              <p className="font-medium">{formatNumber(loadBalancer.throughput || 0)}/s</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Latency</p>
              <p className="font-medium">{formatLatency(loadBalancer.avgLatency || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Algorithm</p>
              <div className="flex items-center space-x-1">
                {getAlgorithmIcon(loadBalancer.algorithm)}
                <span className="text-sm font-medium">{loadBalancer.algorithm}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <span>CPU: {formatPercentage(loadBalancer.cpuUsage || 0)}</span>
            </div>
            <div>
              <span>Memory: {formatPercentage(loadBalancer.memoryUsage || 0)}</span>
            </div>
            <div>
              <span>Network: {formatPercentage(loadBalancer.networkUsage || 0)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Success Rate: {formatPercentage(loadBalancer.successRate || 0)}</span>
            <span>Uptime: {formatPercentage(loadBalancer.uptime || 0)}</span>
          </div>
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
                      <CardTitle>Load Balancer Overview</CardTitle>
                      <CardDescription>Real-time traffic distribution and performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 border rounded-md p-4">
                        <p className="text-muted-foreground text-center">Load balancer performance charts will be rendered here</p>
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
                        <span className="text-sm">Total Requests</span>
                        <span className="text-sm font-medium">{formatNumber(loadBalancerStatistics.totalRequests)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Failed Requests</span>
                        <span className="text-sm font-medium">{formatNumber(loadBalancerStatistics.failedRequests)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Pools</span>
                        <span className="text-sm font-medium">{loadBalancerStatistics.activePools}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Health Checks</span>
                        <span className="text-sm font-medium">{loadBalancerStatistics.passingHealthChecks}/{loadBalancerStatistics.totalHealthChecks}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Load Balancers View */}
          <TabsContent value="load-balancers" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLoadBalancers.map(renderLoadBalancerCard)}
              </div>
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isOptimizing || state.isAnalyzing || state.isCreating) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading load balancer data...' :
                 state.isOptimizing ? 'Optimizing load balancer...' :
                 state.isAnalyzing ? 'Analyzing load balancer...' :
                 'Creating load balancer...'}
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

export default LoadBalancer