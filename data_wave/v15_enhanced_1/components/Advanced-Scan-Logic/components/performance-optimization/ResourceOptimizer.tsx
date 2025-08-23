"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, MemoryStick, HardDrive, Network, Database, Server, Cloud, Zap, Target, Gauge, Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Settings, Sliders, RotateCcw, RefreshCw, Play, Pause, Square, CheckCircle, AlertTriangle, XCircle, Clock, Timer, Calendar, Users, User, Shield, Lock, Unlock, Key, Eye, EyeOff, Search, Filter, Download, Upload, Share2, Copy, Edit, Trash2, Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize, Minimize, Layers, Package, Code, FileText, Archive, History, Flag, Star, Award, Crown, Hash, Percent, DollarSign, TrendingUpDown, Battery, BatteryLow, Thermometer, Wifi, WifiOff, Signal, Volume2, VolumeX, Monitor, Smartphone, Tablet, Laptop, Desktop } from 'lucide-react'

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
  ResourcePool,
  ResourceAllocation,
  ResourceQuota,
  ResourcePolicy,
  ResourceMetric,
  ResourceOptimization,
  ResourceRecommendation,
  ResourceAnalysis,
  ResourcePlan,
  ResourceSchedule,
  ResourceBalance,
  ResourceConstraint,
  ResourceCapacity,
  ResourceDemand,
  ResourceSupply,
  ResourceEfficiency,
  ResourceUtilization,
  ResourceThreshold,
  ResourceAlert,
  ResourceEvent,
  ResourceLog,
  ResourceAudit,
  ResourceConfiguration,
  ResourceProfile,
  ResourceTemplate,
  ResourceWorkload,
  ResourceService,
  ResourceInstance,
  ResourceCluster,
  ResourceNode,
  ResourceContainer,
  ResourceProcess,
  ResourceThread,
  ResourceSession,
  ResourceConnection,
  ResourceTransaction,
  ResourceOperation,
  ResourceTask,
  ResourceJob,
  ResourceQueue,
  ResourceCache,
  ResourceBuffer,
  ResourceHeap,
  ResourceStack,
  ResourceMemory,
  ResourceCpu,
  ResourceDisk,
  ResourceNetworking,
  ResourceStorage,
  ResourceBandwidth,
  ResourceLatency,
  ResourceThroughput
} from '../../types/resource.types'

import {
  useResourceOptimization,
  useResourceMonitoring,
  useResourceAllocation,
  useResourcePools,
  useResourceQuotas,
  useResourcePolicies,
  useResourceMetrics,
  useResourceAnalysis,
  useResourcePlanning,
  useResourceScheduling,
  useResourceBalancing,
  useResourceProfiles,
  useResourceTemplates,
  useResourceWorkloads,
  useResourceConfiguration,
  useResourceAudit
} from '../../hooks/useResourceOptimization'

import {
  optimizeResourceAllocation,
  analyzeResourceUsage,
  predictResourceDemand,
  balanceResourceLoad,
  scaleResourceCapacity,
  allocateResources,
  deallocateResources,
  reallocateResources,
  reserveResources,
  releaseResources,
  migrateResources,
  consolidateResources,
  partitionResources,
  isolateResources,
  shareResources,
  poolResources,
  queueResources,
  cacheResources,
  bufferResources,
  compressResources,
  decompressResources,
  encryptResources,
  decryptResources,
  validateResources,
  verifyResources,
  auditResources,
  monitorResources,
  profileResources,
  benchmarkResources,
  testResources,
  simulateResources,
  modelResources,
  forecastResources,
  planResources,
  scheduleResources,
  orchestrateResources,
  automateResources,
  governResources,
  secureResources,
  backupResources,
  restoreResources,
  replicateResources,
  synchronizeResources,
  indexResources,
  searchResources,
  filterResources,
  sortResources,
  aggregateResources,
  summarizeResources,
  reportResources,
  visualizeResources,
  dashboardResources,
  alertResources,
  notifyResources,
  escalateResources,
  resolveResources,
  optimizeResourceCpu,
  optimizeResourceMemory,
  optimizeResourceDisk,
  optimizeResourceNetwork,
  optimizeResourceStorage,
  optimizeResourceBandwidth,
  optimizeResourceLatency,
  optimizeResourceThroughput,
  optimizeResourceEfficiency,
  optimizeResourceUtilization,
  optimizeResourceCapacity,
  optimizeResourceDemand,
  optimizeResourceSupply,
  optimizeResourceBalance,
  optimizeResourceConstraints,
  optimizeResourcePolicies,
  optimizeResourceQuotas,
  optimizeResourcePools,
  optimizeResourceAllocations,
  optimizeResourceSchedules,
  optimizeResourceWorkloads,
  optimizeResourceServices,
  optimizeResourceInstances,
  optimizeResourceClusters,
  optimizeResourceNodes,
  optimizeResourceContainers,
  optimizeResourceProcesses,
  optimizeResourceThreads,
  optimizeResourceSessions,
  optimizeResourceConnections,
  optimizeResourceTransactions,
  optimizeResourceOperations,
  optimizeResourceTasks,
  optimizeResourceJobs,
  optimizeResourceQueues,
  optimizeResourceCaches,
  optimizeResourceBuffers,
  optimizeResourceHeaps,
  optimizeResourceStacks,
  calculateResourceEfficiency,
  calculateResourceUtilization,
  calculateResourceCapacity,
  calculateResourceDemand,
  calculateResourceSupply,
  calculateResourceBalance,
  calculateResourceCosts,
  calculateResourceROI,
  calculateResourceSavings,
  calculateResourceWaste,
  calculateResourceFragmentation,
  calculateResourceOverhead,
  calculateResourceBottlenecks,
  calculateResourceConstraints,
  calculateResourcePressure,
  calculateResourceStress,
  calculateResourceHealth,
  calculateResourceScore,
  calculateResourceRisk,
  calculateResourceCompliance,
  calculateResourceGovernance
} from '../../services/resource-optimization-apis'

// Enhanced interfaces for advanced resource optimization
interface ResourceOptimizerState {
  // Core optimization state
  isOptimizing: boolean
  isPaused: boolean
  isAnalyzing: boolean
  optimizationSession: any | null
  
  // Resource data
  resourcePools: ResourcePool[]
  allocations: ResourceAllocation[]
  quotas: ResourceQuota[]
  policies: ResourcePolicy[]
  metrics: ResourceMetric[]
  workloads: ResourceWorkload[]
  
  // Selected items
  selectedPool: ResourcePool | null
  selectedAllocation: ResourceAllocation | null
  selectedWorkload: ResourceWorkload | null
  selectedPolicy: ResourcePolicy | null
  
  // Analysis and optimization
  analysis: ResourceAnalysis | null
  optimizations: ResourceOptimization[]
  recommendations: ResourceRecommendation[]
  plans: ResourcePlan[]
  schedules: ResourceSchedule[]
  
  // Resource types and components
  cpuResources: ResourceCpu[]
  memoryResources: ResourceMemory[]
  diskResources: ResourceDisk[]
  networkResources: ResourceNetworking[]
  storageResources: ResourceStorage[]
  
  // Profiles and templates
  profiles: ResourceProfile[]
  templates: ResourceTemplate[]
  configurations: ResourceConfiguration[]
  
  // Monitoring and alerting
  alerts: ResourceAlert[]
  events: ResourceEvent[]
  logs: ResourceLog[]
  
  // View and UI state
  view: 'dashboard' | 'allocation' | 'optimization' | 'analysis' | 'policies' | 'workloads' | 'monitoring' | 'settings'
  resourceView: 'cpu' | 'memory' | 'disk' | 'network' | 'storage' | 'all'
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | '90d'
  optimizationMode: 'automatic' | 'manual' | 'hybrid'
  optimizationGoal: 'efficiency' | 'performance' | 'cost' | 'balance'
  
  // Display preferences
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'gauge' | 'heatmap'
  displayMode: 'grid' | 'list' | 'detailed' | 'compact'
  showRecommendations: boolean
  showPredictions: boolean
  showTrends: boolean
  showThresholds: boolean
  showAlerts: boolean
  
  // Filter and search
  searchQuery: string
  statusFilter: 'all' | 'healthy' | 'warning' | 'critical' | 'optimizing'
  typeFilter: string[]
  poolFilter: string[]
  workloadFilter: string[]
  
  // Configuration
  configuration: {
    autoOptimization: boolean
    optimizationInterval: number
    analysisInterval: number
    alertThreshold: number
    warningThreshold: number
    criticalThreshold: number
    maxCpuUtilization: number
    maxMemoryUtilization: number
    maxDiskUtilization: number
    maxNetworkUtilization: number
    enablePredictions: boolean
    enableRecommendations: boolean
    enableAutoScaling: boolean
    enableLoadBalancing: boolean
    enableResourceMigration: boolean
    enableResourceConsolidation: boolean
    costOptimization: boolean
    performanceOptimization: boolean
    efficiencyOptimization: boolean
    sustainabilityOptimization: boolean
  }
  
  // Operations state
  isAllocating: boolean
  isDeallocating: boolean
  isReallocating: boolean
  isMigrating: boolean
  isScaling: boolean
  isBalancing: boolean
  isConsolidating: boolean
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * ResourceOptimizer Component
 * 
 * Enterprise-grade resource optimization component that provides comprehensive
 * resource management and optimization capabilities including:
 * - Intelligent resource allocation and reallocation
 * - Automated resource optimization and scaling
 * - Resource demand prediction and capacity planning
 * - Workload balancing and consolidation
 * - Resource efficiency and utilization analysis
 * - Cost optimization and waste reduction
 * - Performance optimization and bottleneck resolution
 * - Resource policy enforcement and governance
 * - Real-time resource monitoring and alerting
 * - Resource migration and consolidation
 * - Advanced analytics and reporting
 * - Multi-dimensional resource views
 * 
 * This component integrates with the backend resource optimization system and provides
 * a sophisticated user interface for comprehensive resource management.
 */
export const ResourceOptimizer: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onResourceOptimized?: (optimization: ResourceOptimization) => void
  onResourceAllocated?: (allocation: ResourceAllocation) => void
  autoOptimize?: boolean
  enablePredictions?: boolean
  enableRecommendations?: boolean
  enableAutoScaling?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onResourceOptimized,
  onResourceAllocated,
  autoOptimize = false,
  enablePredictions = true,
  enableRecommendations = true,
  enableAutoScaling = false,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<ResourceOptimizerState>({
    // Core optimization state
    isOptimizing: false,
    isPaused: false,
    isAnalyzing: false,
    optimizationSession: null,
    
    // Resource data
    resourcePools: [],
    allocations: [],
    quotas: [],
    policies: [],
    metrics: [],
    workloads: [],
    
    // Selected items
    selectedPool: null,
    selectedAllocation: null,
    selectedWorkload: null,
    selectedPolicy: null,
    
    // Analysis and optimization
    analysis: null,
    optimizations: [],
    recommendations: [],
    plans: [],
    schedules: [],
    
    // Resource types and components
    cpuResources: [],
    memoryResources: [],
    diskResources: [],
    networkResources: [],
    storageResources: [],
    
    // Profiles and templates
    profiles: [],
    templates: [],
    configurations: [],
    
    // Monitoring and alerting
    alerts: [],
    events: [],
    logs: [],
    
    // View and UI state
    view: 'dashboard',
    resourceView: 'all',
    timeRange: '24h',
    optimizationMode: 'hybrid',
    optimizationGoal: 'balance',
    
    // Display preferences
    chartType: 'line',
    displayMode: 'grid',
    showRecommendations: enableRecommendations,
    showPredictions: enablePredictions,
    showTrends: true,
    showThresholds: true,
    showAlerts: true,
    
    // Filter and search
    searchQuery: '',
    statusFilter: 'all',
    typeFilter: [],
    poolFilter: [],
    workloadFilter: [],
    
    // Configuration
    configuration: {
      autoOptimization: autoOptimize,
      optimizationInterval: 300000, // 5 minutes
      analysisInterval: 60000, // 1 minute
      alertThreshold: 0.8,
      warningThreshold: 0.7,
      criticalThreshold: 0.9,
      maxCpuUtilization: 80,
      maxMemoryUtilization: 85,
      maxDiskUtilization: 90,
      maxNetworkUtilization: 75,
      enablePredictions: enablePredictions,
      enableRecommendations: enableRecommendations,
      enableAutoScaling: enableAutoScaling,
      enableLoadBalancing: true,
      enableResourceMigration: true,
      enableResourceConsolidation: true,
      costOptimization: true,
      performanceOptimization: true,
      efficiencyOptimization: true,
      sustainabilityOptimization: false
    },
    
    // Operations state
    isAllocating: false,
    isDeallocating: false,
    isReallocating: false,
    isMigrating: false,
    isScaling: false,
    isBalancing: false,
    isConsolidating: false,
    
    // Error and loading states
    error: null,
    warnings: [],
    isLoading: false,
    progress: 0
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const optimizationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Hook integrations
  const {
    optimization,
    isOptimizing,
    startOptimization,
    stopOptimization,
    pauseOptimization,
    resumeOptimization
  } = useResourceOptimization(workflowId)

  const {
    monitoring,
    metrics,
    startMonitoring,
    stopMonitoring,
    refreshMetrics
  } = useResourceMonitoring()

  const {
    allocations,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    reallocateResource
  } = useResourceAllocation()

  const {
    resourcePools,
    activePool,
    createPool,
    updatePool,
    deletePool,
    refreshPools
  } = useResourcePools()

  const {
    quotas,
    refreshQuotas,
    createQuota,
    updateQuota,
    deleteQuota
  } = useResourceQuotas()

  const {
    policies,
    refreshPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    applyPolicy
  } = useResourcePolicies()

  const {
    resourceMetrics,
    latestMetrics,
    refreshResourceMetrics
  } = useResourceMetrics()

  const {
    analysis,
    analyzeResources,
    generateAnalysisReport
  } = useResourceAnalysis()

  const {
    plans,
    createPlan,
    updatePlan,
    executePlan,
    schedulePlan
  } = useResourcePlanning()

  const {
    schedules,
    createSchedule,
    updateSchedule,
    executeSchedule
  } = useResourceScheduling()

  const {
    balancing,
    balanceResources,
    rebalanceResources
  } = useResourceBalancing()

  const {
    profiles,
    createProfile,
    updateProfile,
    applyProfile
  } = useResourceProfiles()

  const {
    templates,
    createTemplate,
    updateTemplate,
    applyTemplate
  } = useResourceTemplates()

  const {
    workloads,
    activeWorkload,
    createWorkload,
    updateWorkload,
    optimizeWorkload
  } = useResourceWorkloads()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration
  } = useResourceConfiguration()

  const {
    auditLog,
    logResourceEvent,
    generateAuditReport
  } = useResourceAudit()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredAllocations = useMemo(() => {
    let result = state.allocations

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(allocation =>
        allocation.name?.toLowerCase().includes(query) ||
        allocation.resourceType?.toLowerCase().includes(query) ||
        allocation.workload?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (state.statusFilter !== 'all') {
      result = result.filter(allocation => {
        switch (state.statusFilter) {
          case 'healthy':
            return allocation.status === 'healthy'
          case 'warning':
            return allocation.status === 'warning'
          case 'critical':
            return allocation.status === 'critical'
          case 'optimizing':
            return allocation.status === 'optimizing'
          default:
            return true
        }
      })
    }

    // Apply type filter
    if (state.typeFilter.length > 0) {
      result = result.filter(allocation =>
        state.typeFilter.includes(allocation.resourceType)
      )
    }

    // Apply pool filter
    if (state.poolFilter.length > 0) {
      result = result.filter(allocation =>
        state.poolFilter.includes(allocation.poolId || '')
      )
    }

    // Apply workload filter
    if (state.workloadFilter.length > 0) {
      result = result.filter(allocation =>
        state.workloadFilter.includes(allocation.workload || '')
      )
    }

    return result
  }, [
    state.allocations, state.searchQuery, state.statusFilter,
    state.typeFilter, state.poolFilter, state.workloadFilter
  ])

  const resourceStatistics = useMemo(() => {
    const activeAllocations = state.allocations.filter(a => a.status !== 'inactive')
    
    const totalCpu = activeAllocations.reduce((sum, a) => sum + (a.cpuAllocation || 0), 0)
    const totalMemory = activeAllocations.reduce((sum, a) => sum + (a.memoryAllocation || 0), 0)
    const totalDisk = activeAllocations.reduce((sum, a) => sum + (a.diskAllocation || 0), 0)
    const totalNetwork = activeAllocations.reduce((sum, a) => sum + (a.networkAllocation || 0), 0)
    
    const usedCpu = activeAllocations.reduce((sum, a) => sum + (a.cpuUsage || 0), 0)
    const usedMemory = activeAllocations.reduce((sum, a) => sum + (a.memoryUsage || 0), 0)
    const usedDisk = activeAllocations.reduce((sum, a) => sum + (a.diskUsage || 0), 0)
    const usedNetwork = activeAllocations.reduce((sum, a) => sum + (a.networkUsage || 0), 0)

    return {
      totalAllocations: activeAllocations.length,
      healthyAllocations: activeAllocations.filter(a => a.status === 'healthy').length,
      warningAllocations: activeAllocations.filter(a => a.status === 'warning').length,
      criticalAllocations: activeAllocations.filter(a => a.status === 'critical').length,
      optimizingAllocations: activeAllocations.filter(a => a.status === 'optimizing').length,
      
      totalCpu,
      totalMemory,
      totalDisk,
      totalNetwork,
      
      usedCpu,
      usedMemory,
      usedDisk,
      usedNetwork,
      
      cpuUtilization: totalCpu > 0 ? (usedCpu / totalCpu) * 100 : 0,
      memoryUtilization: totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0,
      diskUtilization: totalDisk > 0 ? (usedDisk / totalDisk) * 100 : 0,
      networkUtilization: totalNetwork > 0 ? (usedNetwork / totalNetwork) * 100 : 0,
      
      totalPools: state.resourcePools.length,
      activePools: state.resourcePools.filter(p => p.status === 'active').length,
      
      totalWorkloads: state.workloads.length,
      activeWorkloads: state.workloads.filter(w => w.status === 'running').length,
      
      totalOptimizations: state.optimizations.length,
      activeOptimizations: state.optimizations.filter(o => o.status === 'running').length,
      
      totalRecommendations: state.recommendations.length,
      pendingRecommendations: state.recommendations.filter(r => r.status === 'pending').length,
      
      efficiency: activeAllocations.reduce((sum, a) => sum + (a.efficiency || 0), 0) / activeAllocations.length,
      waste: activeAllocations.reduce((sum, a) => sum + (a.waste || 0), 0),
      cost: activeAllocations.reduce((sum, a) => sum + (a.cost || 0), 0),
      savings: state.optimizations.reduce((sum, o) => sum + (o.savings || 0), 0)
    }
  }, [state.allocations, state.resourcePools, state.workloads, state.optimizations, state.recommendations])

  const optimizationOpportunities = useMemo(() => {
    const opportunities = []
    
    // CPU optimization opportunities
    if (resourceStatistics.cpuUtilization < 50) {
      opportunities.push({
        type: 'cpu',
        severity: 'medium',
        description: 'Low CPU utilization detected',
        recommendation: 'Consider consolidating workloads or reducing CPU allocation',
        impact: 'Cost reduction',
        savings: resourceStatistics.totalCpu * 0.3 * 0.1 // Estimated 30% reduction, 10 cents per core-hour
      })
    } else if (resourceStatistics.cpuUtilization > 85) {
      opportunities.push({
        type: 'cpu',
        severity: 'high',
        description: 'High CPU utilization detected',
        recommendation: 'Scale up CPU resources or optimize workload distribution',
        impact: 'Performance improvement',
        savings: 0
      })
    }
    
    // Memory optimization opportunities
    if (resourceStatistics.memoryUtilization < 60) {
      opportunities.push({
        type: 'memory',
        severity: 'medium',
        description: 'Low memory utilization detected',
        recommendation: 'Consider reducing memory allocation or consolidating workloads',
        impact: 'Cost reduction',
        savings: resourceStatistics.totalMemory * 0.25 * 0.05 // Estimated 25% reduction, 5 cents per GB-hour
      })
    } else if (resourceStatistics.memoryUtilization > 90) {
      opportunities.push({
        type: 'memory',
        severity: 'critical',
        description: 'High memory utilization detected',
        recommendation: 'Increase memory allocation immediately to prevent performance degradation',
        impact: 'Performance and stability improvement',
        savings: 0
      })
    }
    
    // Disk optimization opportunities
    if (resourceStatistics.diskUtilization > 95) {
      opportunities.push({
        type: 'disk',
        severity: 'critical',
        description: 'Very high disk utilization detected',
        recommendation: 'Increase disk capacity or implement data archiving',
        impact: 'System stability improvement',
        savings: 0
      })
    }
    
    // Network optimization opportunities
    if (resourceStatistics.networkUtilization > 80) {
      opportunities.push({
        type: 'network',
        severity: 'high',
        description: 'High network utilization detected',
        recommendation: 'Consider load balancing or bandwidth optimization',
        impact: 'Performance improvement',
        savings: 0
      })
    }
    
    return opportunities
  }, [resourceStatistics])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatResourceValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'cores':
        return `${value.toFixed(1)} cores`
      case 'gb':
        return `${value.toFixed(1)} GB`
      case 'tb':
        return `${value.toFixed(2)} TB`
      case 'mbps':
        return `${value.toFixed(0)} Mbps`
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'dollars':
        return `$${value.toFixed(2)}`
      default:
        return value.toFixed(2)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      case 'optimizing': return 'text-blue-600'
      case 'inactive': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default'
      case 'warning': return 'secondary'
      case 'critical': return 'destructive'
      case 'optimizing': return 'outline'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 80) return 'text-orange-600'
    if (utilization >= 70) return 'text-yellow-600'
    if (utilization >= 50) return 'text-green-600'
    return 'text-blue-600'
  }

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 80) return 'text-blue-600'
    if (efficiency >= 70) return 'text-yellow-600'
    if (efficiency >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartOptimization = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true, isLoading: true }))
      
      const session = await startOptimization({
        workflowId,
        userId,
        mode: state.optimizationMode,
        goal: state.optimizationGoal,
        configuration: state.configuration
      })
      
      setState(prev => ({
        ...prev,
        optimizationSession: session,
        isLoading: false
      }))
      
      logResourceEvent('optimization_started', { sessionId: session.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start optimization',
        isOptimizing: false,
        isLoading: false
      }))
    }
  }, [workflowId, userId, state.optimizationMode, state.optimizationGoal, state.configuration, startOptimization, logResourceEvent])

  const handleStopOptimization = useCallback(async () => {
    try {
      await stopOptimization()
      
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        isPaused: false,
        optimizationSession: null
      }))
      
      logResourceEvent('optimization_stopped', { userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop optimization'
      }))
    }
  }, [stopOptimization, logResourceEvent, userId])

  const handleOptimizeAllocation = useCallback(async (allocation: ResourceAllocation) => {
    try {
      setState(prev => ({ ...prev, isReallocating: true }))
      
      const optimizedAllocation = await optimizeResourceAllocation(allocation.id, {
        goal: state.optimizationGoal,
        constraints: {
          maxCpuUtilization: state.configuration.maxCpuUtilization,
          maxMemoryUtilization: state.configuration.maxMemoryUtilization,
          maxDiskUtilization: state.configuration.maxDiskUtilization,
          maxNetworkUtilization: state.configuration.maxNetworkUtilization
        }
      })
      
      setState(prev => ({
        ...prev,
        allocations: prev.allocations.map(a => 
          a.id === allocation.id ? optimizedAllocation : a
        ),
        isReallocating: false
      }))
      
      onResourceOptimized?.({
        id: `opt_${Date.now()}`,
        type: 'allocation',
        target: allocation.id,
        status: 'completed',
        improvements: optimizedAllocation.improvements,
        savings: optimizedAllocation.savings
      } as ResourceOptimization)
      
      logResourceEvent('allocation_optimized', { allocationId: allocation.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize allocation',
        isReallocating: false
      }))
    }
  }, [state.optimizationGoal, state.configuration, onResourceOptimized, logResourceEvent, userId])

  const handleCreateAllocation = useCallback(async (allocationData: Partial<ResourceAllocation>) => {
    try {
      setState(prev => ({ ...prev, isAllocating: true }))
      
      const newAllocation = await createAllocation({
        ...allocationData,
        organizationId: multiTenant ? organizationId : undefined,
        createdBy: userId,
        createdAt: new Date().toISOString()
      })
      
      setState(prev => ({
        ...prev,
        allocations: [...prev.allocations, newAllocation],
        isAllocating: false
      }))
      
      onResourceAllocated?.(newAllocation)
      logResourceEvent('allocation_created', { allocationId: newAllocation.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create allocation',
        isAllocating: false
      }))
    }
  }, [createAllocation, multiTenant, organizationId, userId, onResourceAllocated, logResourceEvent])

  const handleApplyRecommendation = useCallback(async (recommendation: ResourceRecommendation) => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      // Apply the recommendation based on its type
      let result
      switch (recommendation.type) {
        case 'scale_up':
          result = await scaleResourceCapacity(recommendation.target, 'up', recommendation.parameters)
          break
        case 'scale_down':
          result = await scaleResourceCapacity(recommendation.target, 'down', recommendation.parameters)
          break
        case 'migrate':
          result = await migrateResources(recommendation.target, recommendation.parameters.destination)
          break
        case 'consolidate':
          result = await consolidateResources(recommendation.parameters.sources, recommendation.parameters.destination)
          break
        case 'reallocate':
          result = await reallocateResource(recommendation.target, recommendation.parameters)
          break
        default:
          throw new Error(`Unknown recommendation type: ${recommendation.type}`)
      }
      
      setState(prev => ({
        ...prev,
        recommendations: prev.recommendations.map(r =>
          r.id === recommendation.id ? { ...r, status: 'applied', appliedAt: new Date().toISOString() } : r
        ),
        isOptimizing: false
      }))
      
      logResourceEvent('recommendation_applied', { recommendationId: recommendation.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply recommendation',
        isOptimizing: false
      }))
    }
  }, [userId, logResourceEvent])

  const handleAnalyzeResources = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyzeResources({
        timeRange: state.timeRange,
        includeOptimizations: true,
        includeRecommendations: state.showRecommendations,
        includePredictions: state.showPredictions
      })
      
      setState(prev => ({
        ...prev,
        analysis,
        isAnalyzing: false
      }))
      
      logResourceEvent('resources_analyzed', { analysisId: analysis.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze resources',
        isAnalyzing: false
      }))
    }
  }, [analyzeResources, state.timeRange, state.showRecommendations, state.showPredictions, logResourceEvent, userId])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleResourceViewChange = useCallback((resourceView: typeof state.resourceView) => {
    setState(prev => ({ ...prev, resourceView }))
  }, [])

  const handleOptimizationModeChange = useCallback((mode: typeof state.optimizationMode) => {
    setState(prev => ({ ...prev, optimizationMode: mode }))
  }, [])

  const handleOptimizationGoalChange = useCallback((goal: typeof state.optimizationGoal) => {
    setState(prev => ({ ...prev, optimizationGoal: goal }))
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
          refreshQuotas(),
          refreshPolicies(),
          refreshResourceMetrics(),
          refreshMetrics()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [workflowId, refreshPools, refreshQuotas, refreshPolicies, refreshResourceMetrics, refreshMetrics])

  useEffect(() => {
    // Set up auto-optimization
    if (state.configuration.autoOptimization && !state.isOptimizing) {
      optimizationIntervalRef.current = setInterval(() => {
        handleStartOptimization()
      }, state.configuration.optimizationInterval)
      
      return () => {
        if (optimizationIntervalRef.current) {
          clearInterval(optimizationIntervalRef.current)
        }
      }
    }
  }, [state.configuration.autoOptimization, state.configuration.optimizationInterval, state.isOptimizing, handleStartOptimization])

  useEffect(() => {
    // Set up analysis interval
    analysisIntervalRef.current = setInterval(() => {
      handleAnalyzeResources()
    }, state.configuration.analysisInterval)
    
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
      }
    }
  }, [state.configuration.analysisInterval, handleAnalyzeResources])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      resourcePools: resourcePools || [],
      allocations: allocations || [],
      quotas: quotas || [],
      policies: policies || [],
      metrics: resourceMetrics || [],
      workloads: workloads || [],
      profiles: profiles || [],
      templates: templates || [],
      plans: plans || [],
      schedules: schedules || []
    }))
  }, [resourcePools, allocations, quotas, policies, resourceMetrics, workloads, profiles, templates, plans, schedules])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Resource Optimizer</h1>
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-2">
          {!state.isOptimizing ? (
            <Button onClick={handleStartOptimization} disabled={state.isLoading}>
              <Play className="h-4 w-4 mr-2" />
              Start Optimization
            </Button>
          ) : (
            <Button onClick={handleStopOptimization} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Square Optimization
            </Button>
          )}
          
          <Button onClick={handleAnalyzeResources} disabled={state.isAnalyzing} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="workloads">Workloads</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={state.resourceView} onValueChange={handleResourceViewChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="cpu">CPU</SelectItem>
            <SelectItem value="memory">Memory</SelectItem>
            <SelectItem value="disk">Disk</SelectItem>
            <SelectItem value="network">Network</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.optimizationGoal} onValueChange={handleOptimizationGoalChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="efficiency">Efficiency</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="cost">Cost</SelectItem>
            <SelectItem value="balance">Balance</SelectItem>
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
            <Cpu className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">CPU Utilization</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(resourceStatistics.cpuUtilization)}`}>
                {formatResourceValue(resourceStatistics.cpuUtilization, 'percentage')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <MemoryStick className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Memory Utilization</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(resourceStatistics.memoryUtilization)}`}>
                {formatResourceValue(resourceStatistics.memoryUtilization, 'percentage')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Disk Utilization</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(resourceStatistics.diskUtilization)}`}>
                {formatResourceValue(resourceStatistics.diskUtilization, 'percentage')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Network Utilization</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(resourceStatistics.networkUtilization)}`}>
                {formatResourceValue(resourceStatistics.networkUtilization, 'percentage')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Efficiency</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(resourceStatistics.efficiency)}`}>
                {formatResourceValue(resourceStatistics.efficiency, 'percentage')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Cost Savings</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatResourceValue(resourceStatistics.savings, 'dollars')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAllocationCard = (allocation: ResourceAllocation) => (
    <Card key={allocation.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100">
              {allocation.resourceType === 'cpu' && <Cpu className="h-4 w-4 text-blue-600" />}
              {allocation.resourceType === 'memory' && <MemoryStick className="h-4 w-4 text-blue-600" />}
              {allocation.resourceType === 'disk' && <HardDrive className="h-4 w-4 text-blue-600" />}
              {allocation.resourceType === 'network' && <Network className="h-4 w-4 text-blue-600" />}
              {!['cpu', 'memory', 'disk', 'network'].includes(allocation.resourceType) && <Package className="h-4 w-4 text-blue-600" />}
            </div>
            <div>
              <CardTitle className="text-base">{allocation.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{allocation.workload}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusVariant(allocation.status)}>
              {allocation.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOptimizeAllocation(allocation)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
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
              <p className="text-sm text-muted-foreground">Allocated</p>
              <p className="font-medium">
                {formatResourceValue(allocation.allocated || 0, allocation.unit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Used</p>
              <p className="font-medium">
                {formatResourceValue(allocation.used || 0, allocation.unit)}
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Utilization</span>
              <span>{formatResourceValue((allocation.used || 0) / (allocation.allocated || 1) * 100, 'percentage')}</span>
            </div>
            <Progress value={(allocation.used || 0) / (allocation.allocated || 1) * 100} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <span>Efficiency: {formatResourceValue(allocation.efficiency || 0, 'percentage')}</span>
            </div>
            <div>
              <span>Cost: {formatResourceValue(allocation.cost || 0, 'dollars')}</span>
            </div>
            <div>
              <span>Pool: {allocation.poolName || 'Default'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderOpportunityCard = (opportunity: any, index: number) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              opportunity.severity === 'critical' ? 'bg-red-100' :
              opportunity.severity === 'high' ? 'bg-orange-100' :
              opportunity.severity === 'medium' ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              {opportunity.type === 'cpu' && <Cpu className="h-4 w-4" />}
              {opportunity.type === 'memory' && <MemoryStick className="h-4 w-4" />}
              {opportunity.type === 'disk' && <HardDrive className="h-4 w-4" />}
              {opportunity.type === 'network' && <Network className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-base capitalize">{opportunity.type} Optimization</CardTitle>
              <p className="text-sm text-muted-foreground">{opportunity.impact}</p>
            </div>
          </div>
          <Badge variant={
            opportunity.severity === 'critical' ? 'destructive' :
            opportunity.severity === 'high' ? 'default' :
            opportunity.severity === 'medium' ? 'secondary' :
            'outline'
          }>
            {opportunity.severity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm">{opportunity.description}</p>
          <p className="text-sm font-medium">{opportunity.recommendation}</p>
          {opportunity.savings > 0 && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                Potential savings: {formatResourceValue(opportunity.savings, 'dollars')}
              </span>
            </div>
          )}
          <Button size="sm" className="w-full">
            Apply Optimization
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
                      <CardTitle>Resource Overview</CardTitle>
                      <CardDescription>Current resource allocation and utilization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 border rounded-md p-4">
                        <p className="text-muted-foreground text-center">Resource utilization charts will be rendered here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optimization Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {optimizationOpportunities.slice(0, 3).map((opportunity, index) => (
                            <div key={index} className="p-2 rounded bg-muted">
                              <p className="font-medium text-sm">{opportunity.description}</p>
                              <p className="text-xs text-muted-foreground">{opportunity.recommendation}</p>
                              {opportunity.savings > 0 && (
                                <p className="text-xs text-green-600">
                                  Savings: {formatResourceValue(opportunity.savings, 'dollars')}
                                </p>
                              )}
                            </div>
                          ))}
                          {optimizationOpportunities.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center">No optimization opportunities found</p>
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
                        <span className="text-sm">Total Allocations</span>
                        <span className="text-sm font-medium">{resourceStatistics.totalAllocations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Pools</span>
                        <span className="text-sm font-medium">{resourceStatistics.activePools}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Running Workloads</span>
                        <span className="text-sm font-medium">{resourceStatistics.activeWorkloads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Cost</span>
                        <span className="text-sm font-medium">{formatResourceValue(resourceStatistics.cost, 'dollars')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Allocation View */}
          <TabsContent value="allocation" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAllocations.map(renderAllocationCard)}
              </div>
            </div>
          </TabsContent>

          {/* Optimization View */}
          <TabsContent value="optimization" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {optimizationOpportunities.map(renderOpportunityCard)}
              </div>
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isOptimizing || state.isAnalyzing || state.isAllocating) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading resource data...' :
                 state.isOptimizing ? 'Optimizing resources...' :
                 state.isAnalyzing ? 'Analyzing resources...' :
                 'Allocating resources...'}
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

export default ResourceOptimizer