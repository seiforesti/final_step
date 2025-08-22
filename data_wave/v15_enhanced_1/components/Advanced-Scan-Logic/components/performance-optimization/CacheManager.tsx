"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database,
  Server,
  Layers,
  Package,
  HardDrive,
  MemoryStick,
  Zap,
  RefreshCw,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Clock,
  Timer,
  Target,
  Gauge,
  Settings,
  Trash2,
  Archive,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  EyeOff,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Plus,
  Minus,
  Edit,
  Copy,
  Share2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Flag,
  Star,
  Hash,
  Percent,
  Users,
  User,
  Calendar,
  Shield,
  Lock,
  Unlock,
  Key,
  Code,
  FileText,
  History,
  Award,
  Crown,
  DollarSign,
  TrendingUpDown,
  Maximize,
  Minimize,
  ArrowUp,
  ArrowDown,
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
  CacheInstance,
  CachePool,
  CacheEntry,
  CachePolicy,
  CacheMetrics,
  CacheConfiguration,
  CacheStatistics,
  CacheOperation,
  CacheEviction,
  CacheReplication,
  CachePartition,
  CacheIndex,
  CacheQuery,
  CacheTransaction,
  CacheCluster,
  CacheNode,
  CacheRegion,
  CacheNamespace,
  CacheKey,
  CacheValue,
  CacheExpiry,
  CacheTTL,
  CacheHit,
  CacheMiss,
  CacheLoad,
  CacheStore,
  CacheInvalidation,
  CacheRefresh,
  CacheWarmup,
  CachePersistence,
  CacheConsistency,
  CacheCoherence,
  CacheReliability,
  CacheAvailability,
  CacheDurability,
  CacheScalability,
  CachePerformance,
  CacheLatency,
  CacheThroughput,
  CacheBandwidth,
  CacheMemory,
  CacheDisk,
  CacheNetwork,
  CacheCompression,
  CacheEncryption,
  CacheSerialization,
  CacheDeserialization,
  CacheOptimization,
  CacheAnalysis,
  CacheReport,
  CacheAlert,
  CacheEvent,
  CacheLog,
  CacheAudit,
  CacheBackup,
  CacheRestore,
  CacheMigration,
  CacheUpgrade,
  CacheMonitoring,
  CacheHealthCheck
} from '../../types/cache.types'

import {
  useCacheManagement,
  useCacheInstances,
  useCachePools,
  useCacheMetrics,
  useCacheOperations,
  useCacheConfiguration,
  useCacheMonitoring,
  useCacheOptimization,
  useCacheAnalysis,
  useCacheReplication,
  useCachePartitioning,
  useCacheEviction,
  useCacheStatistics,
  useCacheHealthChecks,
  useCacheBackup,
  useCacheAudit
} from '../../hooks/useCacheManagement'

import {
  createCacheInstance,
  deleteCacheInstance,
  updateCacheInstance,
  startCacheInstance,
  stopCacheInstance,
  restartCacheInstance,
  pauseCacheInstance,
  resumeCacheInstance,
  flushCache,
  clearCache,
  invalidateCache,
  refreshCache,
  warmupCache,
  preloadCache,
  evictCacheEntry,
  getCacheEntry,
  setCacheEntry,
  deleteCacheEntry,
  updateCacheEntry,
  searchCacheEntries,
  queryCacheEntries,
  indexCacheEntries,
  compressCacheData,
  decompressCacheData,
  encryptCacheData,
  decryptCacheData,
  serializeCacheData,
  deserializeCacheData,
  validateCacheData,
  verifyCacheIntegrity,
  repairCacheCorruption,
  optimizeCachePerformance,
  analyzeCacheUsage,
  benchmarkCachePerformance,
  profileCacheOperations,
  monitorCacheHealth,
  alertCacheIssues,
  reportCacheStatistics,
  exportCacheData,
  importCacheData,
  migrateCacheData,
  backupCacheData,
  restoreCacheData,
  replicateCacheData,
  syncCacheData,
  balanceCacheLoad,
  scaleCacheCapacity,
  partitionCacheData,
  shardCacheData,
  clusterCacheNodes,
  federateCacheRegions,
  distributeCacheData,
  aggregateCacheMetrics,
  summarizeCacheStatistics,
  visualizeCacheData,
  dashboardCacheMetrics,
  configureCachePolicy,
  enforceCachePolicy,
  auditCacheCompliance,
  governCacheAccess,
  secureCacheData,
  authenticateCacheUser,
  authorizeCacheOperation,
  logCacheActivity,
  traceCacheTransaction,
  debugCacheOperation,
  troubleshootCacheIssue,
  diagnoseCacheProblem,
  resolveCacheConflict,
  reconcileCacheState,
  recoverCacheFailure,
  rollbackCacheTransaction,
  commitCacheTransaction,
  lockCacheEntry,
  unlockCacheEntry,
  reserveCacheSpace,
  releaseCacheSpace,
  allocateCacheMemory,
  deallocateCacheMemory,
  defragmentCacheMemory,
  compactCacheStorage,
  archiveCacheData,
  purgeCacheData,
  sanitizeCacheData,
  anonymizeCacheData,
  hashCacheKey,
  checksumCacheValue,
  timestampCacheEntry,
  versionCacheData,
  tagCacheEntry,
  categorizeCache,
  classifyCacheData,
  rankCacheImportance,
  prioritizeCacheOperations,
  scheduleCacheTask,
  queueCacheOperation,
  batchCacheOperations,
  streamCacheData,
  pipelineCacheOperations,
  parallelizeCacheWork,
  concurrentCacheAccess,
  asyncCacheOperation,
  syncCacheOperation,
  blockingCacheRead,
  nonBlockingCacheWrite,
  lazyLoadCache,
  eagerLoadCache,
  demandLoadCache,
  predictiveCache,
  adaptiveCache,
  intelligentCache,
  learningCache,
  autoTuningCache,
  selfHealingCache,
  selfOptimizingCache
} from '../../services/cache-services'

// Enhanced interfaces for advanced cache management
interface CacheManagerState {
  // Core cache state
  instances: CacheInstance[]
  pools: CachePool[]
  entries: CacheEntry[]
  policies: CachePolicy[]
  clusters: CacheCluster[]
  
  // Selected items
  selectedInstance: CacheInstance | null
  selectedPool: CachePool | null
  selectedEntry: CacheEntry | null
  selectedPolicy: CachePolicy | null
  selectedCluster: CacheCluster | null
  
  // Cache operations
  isRunning: boolean
  isMonitoring: boolean
  isOptimizing: boolean
  isAnalyzing: boolean
  isBackingUp: boolean
  isRestoring: boolean
  isMigrating: boolean
  isReplicating: boolean
  
  // Metrics and statistics
  metrics: CacheMetrics | null
  statistics: CacheStatistics | null
  performance: CachePerformance | null
  healthChecks: CacheHealthCheck[]
  alerts: CacheAlert[]
  events: CacheEvent[]
  
  // Configuration and policies
  configuration: CacheConfiguration
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'LIFO' | 'TTL' | 'RANDOM' | 'CUSTOM'
  consistencyLevel: 'EVENTUAL' | 'STRONG' | 'BOUNDED' | 'MONOTONIC' | 'CAUSAL'
  replicationMode: 'SYNC' | 'ASYNC' | 'SEMI_SYNC' | 'MULTI_MASTER' | 'MASTER_SLAVE'
  
  // View and UI state
  view: 'dashboard' | 'instances' | 'pools' | 'entries' | 'policies' | 'clusters' | 'monitoring' | 'optimization' | 'analysis' | 'settings'
  cacheView: 'memory' | 'disk' | 'distributed' | 'hybrid' | 'all'
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
  statusFilter: 'all' | 'running' | 'stopped' | 'paused' | 'error' | 'maintenance'
  typeFilter: string[]
  poolFilter: string[]
  clusterFilter: string[]
  
  // Cache-specific settings
  maxMemorySize: number
  maxDiskSize: number
  maxEntries: number
  defaultTTL: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
  persistenceEnabled: boolean
  replicationEnabled: boolean
  monitoringEnabled: boolean
  
  // Operations state
  isCreating: boolean
  isDeleting: boolean
  isUpdating: boolean
  isStarting: boolean
  isStopping: boolean
  isRestarting: boolean
  isPausing: boolean
  isResuming: boolean
  isFlushing: boolean
  isClearing: boolean
  isInvalidating: boolean
  isRefreshing: boolean
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * CacheManager Component
 * 
 * Enterprise-grade cache management component that provides comprehensive
 * cache infrastructure management capabilities including:
 * - Multi-tier cache instance management
 * - Cache pool and cluster orchestration
 * - Real-time cache monitoring and analytics
 * - Advanced cache optimization and tuning
 * - Cache entry lifecycle management
 * - Cache policy enforcement and governance
 * - Cache replication and distribution
 * - Cache backup and disaster recovery
 * - Cache performance profiling and benchmarking
 * - Cache security and compliance
 * - Cache migration and upgrades
 * - Intelligent cache warming and preloading
 * 
 * This component integrates with the backend cache management system and provides
 * a sophisticated user interface for comprehensive cache operations.
 */
export const CacheManager: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onCacheInstanceCreated?: (instance: CacheInstance) => void
  onCacheInstanceDeleted?: (instanceId: string) => void
  autoMonitor?: boolean
  enableOptimization?: boolean
  enableReplication?: boolean
  enablePersistence?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onCacheInstanceCreated,
  onCacheInstanceDeleted,
  autoMonitor = true,
  enableOptimization = true,
  enableReplication = false,
  enablePersistence = true,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<CacheManagerState>({
    // Core cache state
    instances: [],
    pools: [],
    entries: [],
    policies: [],
    clusters: [],
    
    // Selected items
    selectedInstance: null,
    selectedPool: null,
    selectedEntry: null,
    selectedPolicy: null,
    selectedCluster: null,
    
    // Cache operations
    isRunning: false,
    isMonitoring: autoMonitor,
    isOptimizing: false,
    isAnalyzing: false,
    isBackingUp: false,
    isRestoring: false,
    isMigrating: false,
    isReplicating: false,
    
    // Metrics and statistics
    metrics: null,
    statistics: null,
    performance: null,
    healthChecks: [],
    alerts: [],
    events: [],
    
    // Configuration and policies
    configuration: {
      maxMemorySize: 1024 * 1024 * 1024, // 1GB
      maxDiskSize: 10 * 1024 * 1024 * 1024, // 10GB
      maxEntries: 1000000,
      defaultTTL: 3600, // 1 hour
      evictionPolicy: 'LRU',
      consistencyLevel: 'EVENTUAL',
      replicationFactor: 2,
      partitionCount: 16,
      compressionEnabled: true,
      encryptionEnabled: false,
      persistenceEnabled: enablePersistence,
      replicationEnabled: enableReplication,
      monitoringEnabled: autoMonitor,
      optimizationEnabled: enableOptimization,
      autoScaling: false,
      loadBalancing: true,
      failover: true,
      backup: true,
      audit: true,
      security: true
    } as CacheConfiguration,
    evictionPolicy: 'LRU',
    consistencyLevel: 'EVENTUAL',
    replicationMode: 'ASYNC',
    
    // View and UI state
    view: 'dashboard',
    cacheView: 'all',
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
    clusterFilter: [],
    
    // Cache-specific settings
    maxMemorySize: 1024 * 1024 * 1024, // 1GB
    maxDiskSize: 10 * 1024 * 1024 * 1024, // 10GB
    maxEntries: 1000000,
    defaultTTL: 3600, // 1 hour
    compressionEnabled: true,
    encryptionEnabled: false,
    persistenceEnabled: enablePersistence,
    replicationEnabled: enableReplication,
    monitoringEnabled: autoMonitor,
    
    // Operations state
    isCreating: false,
    isDeleting: false,
    isUpdating: false,
    isStarting: false,
    isStopping: false,
    isRestarting: false,
    isPausing: false,
    isResuming: false,
    isFlushing: false,
    isClearing: false,
    isInvalidating: false,
    isRefreshing: false,
    
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
    management,
    isManaging,
    startManagement,
    stopManagement,
    refreshManagement
  } = useCacheManagement(workflowId)

  const {
    instances,
    loading: instancesLoading,
    createInstance,
    updateInstance,
    deleteInstance,
    refreshInstances
  } = useCacheInstances()

  const {
    pools,
    activePools,
    createPool,
    updatePool,
    deletePool,
    refreshPools
  } = useCachePools()

  const {
    metrics,
    latestMetrics,
    refreshMetrics,
    collectMetrics
  } = useCacheMetrics()

  const {
    operations,
    pendingOperations,
    executeOperation,
    cancelOperation,
    scheduleOperation
  } = useCacheOperations()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration,
    validateConfiguration
  } = useCacheConfiguration()

  const {
    monitoring,
    healthChecks,
    startMonitoring,
    stopMonitoring,
    refreshMonitoring
  } = useCacheMonitoring()

  const {
    optimization,
    recommendations,
    optimizeCache,
    applyOptimization,
    scheduleOptimization
  } = useCacheOptimization()

  const {
    analysis,
    reports,
    analyzeCache,
    generateReport,
    scheduleAnalysis
  } = useCacheAnalysis()

  const {
    replication,
    replicas,
    setupReplication,
    syncReplicas,
    failoverReplica
  } = useCacheReplication()

  const {
    partitioning,
    partitions,
    createPartition,
    rebalancePartitions,
    migratePartition
  } = useCachePartitioning()

  const {
    eviction,
    evictionStats,
    configureEviction,
    forceEviction,
    previewEviction
  } = useCacheEviction()

  const {
    statistics,
    historicalStats,
    refreshStatistics,
    aggregateStatistics
  } = useCacheStatistics()

  const {
    backup,
    backups,
    createBackup,
    restoreBackup,
    scheduleBackup
  } = useCacheBackup()

  const {
    auditLog,
    logCacheEvent,
    generateAuditReport
  } = useCacheAudit()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredInstances = useMemo(() => {
    let result = state.instances

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(instance =>
        instance.name?.toLowerCase().includes(query) ||
        instance.type?.toLowerCase().includes(query) ||
        instance.cluster?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (state.statusFilter !== 'all') {
      result = result.filter(instance => {
        switch (state.statusFilter) {
          case 'running':
            return instance.status === 'running'
          case 'stopped':
            return instance.status === 'stopped'
          case 'paused':
            return instance.status === 'paused'
          case 'error':
            return instance.status === 'error'
          case 'maintenance':
            return instance.status === 'maintenance'
          default:
            return true
        }
      })
    }

    // Apply type filter
    if (state.typeFilter.length > 0) {
      result = result.filter(instance =>
        state.typeFilter.includes(instance.type)
      )
    }

    // Apply pool filter
    if (state.poolFilter.length > 0) {
      result = result.filter(instance =>
        state.poolFilter.includes(instance.poolId || '')
      )
    }

    // Apply cluster filter
    if (state.clusterFilter.length > 0) {
      result = result.filter(instance =>
        state.clusterFilter.includes(instance.cluster || '')
      )
    }

    return result
  }, [
    state.instances, state.searchQuery, state.statusFilter,
    state.typeFilter, state.poolFilter, state.clusterFilter
  ])

  const cacheStatistics = useMemo(() => {
    const runningInstances = state.instances.filter(i => i.status === 'running')
    const totalMemoryUsed = runningInstances.reduce((sum, i) => sum + (i.memoryUsed || 0), 0)
    const totalMemoryAllocated = runningInstances.reduce((sum, i) => sum + (i.memoryAllocated || 0), 0)
    const totalDiskUsed = runningInstances.reduce((sum, i) => sum + (i.diskUsed || 0), 0)
    const totalDiskAllocated = runningInstances.reduce((sum, i) => sum + (i.diskAllocated || 0), 0)
    const totalEntries = runningInstances.reduce((sum, i) => sum + (i.entryCount || 0), 0)
    const totalHits = runningInstances.reduce((sum, i) => sum + (i.hitCount || 0), 0)
    const totalMisses = runningInstances.reduce((sum, i) => sum + (i.missCount || 0), 0)
    const totalRequests = totalHits + totalMisses

    return {
      totalInstances: state.instances.length,
      runningInstances: runningInstances.length,
      stoppedInstances: state.instances.filter(i => i.status === 'stopped').length,
      pausedInstances: state.instances.filter(i => i.status === 'paused').length,
      errorInstances: state.instances.filter(i => i.status === 'error').length,
      
      totalPools: state.pools.length,
      activePools: state.pools.filter(p => p.status === 'active').length,
      
      totalClusters: state.clusters.length,
      activeClusters: state.clusters.filter(c => c.status === 'active').length,
      
      totalMemoryUsed,
      totalMemoryAllocated,
      totalDiskUsed,
      totalDiskAllocated,
      totalEntries,
      totalHits,
      totalMisses,
      totalRequests,
      
      memoryUtilization: totalMemoryAllocated > 0 ? (totalMemoryUsed / totalMemoryAllocated) * 100 : 0,
      diskUtilization: totalDiskAllocated > 0 ? (totalDiskUsed / totalDiskAllocated) * 100 : 0,
      hitRatio: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      missRatio: totalRequests > 0 ? (totalMisses / totalRequests) * 100 : 0,
      
      avgResponseTime: runningInstances.reduce((sum, i) => sum + (i.avgResponseTime || 0), 0) / runningInstances.length,
      avgThroughput: runningInstances.reduce((sum, i) => sum + (i.throughput || 0), 0),
      
      totalAlerts: state.alerts.length,
      activeAlerts: state.alerts.filter(a => a.status === 'active').length,
      criticalAlerts: state.alerts.filter(a => a.severity === 'critical').length,
      
      totalEvents: state.events.length,
      recentEvents: state.events.filter(e => 
        new Date(e.timestamp).getTime() > Date.now() - 3600000 // Last hour
      ).length,
      
      healthScore: runningInstances.reduce((sum, i) => sum + (i.healthScore || 0), 0) / runningInstances.length
    }
  }, [state.instances, state.pools, state.clusters, state.alerts, state.events])

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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return 'text-green-600'
      case 'stopped': return 'text-gray-600'
      case 'paused': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      case 'maintenance': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'running': return 'default'
      case 'stopped': return 'outline'
      case 'paused': return 'secondary'
      case 'error': return 'destructive'
      case 'maintenance': return 'outline'
      default: return 'outline'
    }
  }

  const getHealthColor = (health: number): string => {
    if (health >= 90) return 'text-green-600'
    if (health >= 70) return 'text-yellow-600'
    if (health >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 80) return 'text-orange-600'
    if (utilization >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateInstance = useCallback(async (instanceData: Partial<CacheInstance>) => {
    try {
      setState(prev => ({ ...prev, isCreating: true }))
      
      const newInstance = await createInstance({
        ...instanceData,
        organizationId: multiTenant ? organizationId : undefined,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        configuration: state.configuration
      })
      
      setState(prev => ({
        ...prev,
        instances: [...prev.instances, newInstance],
        isCreating: false
      }))
      
      onCacheInstanceCreated?.(newInstance)
      logCacheEvent('instance_created', { instanceId: newInstance.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create cache instance',
        isCreating: false
      }))
    }
  }, [createInstance, multiTenant, organizationId, userId, state.configuration, onCacheInstanceCreated, logCacheEvent])

  const handleDeleteInstance = useCallback(async (instanceId: string) => {
    try {
      setState(prev => ({ ...prev, isDeleting: true }))
      
      await deleteInstance(instanceId)
      
      setState(prev => ({
        ...prev,
        instances: prev.instances.filter(i => i.id !== instanceId),
        selectedInstance: prev.selectedInstance?.id === instanceId ? null : prev.selectedInstance,
        isDeleting: false
      }))
      
      onCacheInstanceDeleted?.(instanceId)
      logCacheEvent('instance_deleted', { instanceId, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete cache instance',
        isDeleting: false
      }))
    }
  }, [deleteInstance, onCacheInstanceDeleted, logCacheEvent, userId])

  const handleStartInstance = useCallback(async (instance: CacheInstance) => {
    try {
      setState(prev => ({ ...prev, isStarting: true }))
      
      await startCacheInstance(instance.id)
      
      setState(prev => ({
        ...prev,
        instances: prev.instances.map(i => 
          i.id === instance.id ? { ...i, status: 'running' } : i
        ),
        isStarting: false
      }))
      
      logCacheEvent('instance_started', { instanceId: instance.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start cache instance',
        isStarting: false
      }))
    }
  }, [logCacheEvent, userId])

  const handleStopInstance = useCallback(async (instance: CacheInstance) => {
    try {
      setState(prev => ({ ...prev, isStopping: true }))
      
      await stopCacheInstance(instance.id)
      
      setState(prev => ({
        ...prev,
        instances: prev.instances.map(i => 
          i.id === instance.id ? { ...i, status: 'stopped' } : i
        ),
        isStopping: false
      }))
      
      logCacheEvent('instance_stopped', { instanceId: instance.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop cache instance',
        isStopping: false
      }))
    }
  }, [logCacheEvent, userId])

  const handleRestartInstance = useCallback(async (instance: CacheInstance) => {
    try {
      setState(prev => ({ ...prev, isRestarting: true }))
      
      await restartCacheInstance(instance.id)
      
      setState(prev => ({
        ...prev,
        instances: prev.instances.map(i => 
          i.id === instance.id ? { ...i, status: 'running' } : i
        ),
        isRestarting: false
      }))
      
      logCacheEvent('instance_restarted', { instanceId: instance.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to restart cache instance',
        isRestarting: false
      }))
    }
  }, [logCacheEvent, userId])

  const handleFlushCache = useCallback(async (instance: CacheInstance) => {
    try {
      setState(prev => ({ ...prev, isFlushing: true }))
      
      await flushCache(instance.id)
      
      setState(prev => ({
        ...prev,
        instances: prev.instances.map(i => 
          i.id === instance.id ? { ...i, entryCount: 0, memoryUsed: 0 } : i
        ),
        isFlushing: false
      }))
      
      logCacheEvent('cache_flushed', { instanceId: instance.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to flush cache',
        isFlushing: false
      }))
    }
  }, [logCacheEvent, userId])

  const handleOptimizeCache = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      const optimization = await optimizeCache({
        instances: state.instances.filter(i => i.status === 'running'),
        goals: ['performance', 'memory', 'hit-ratio'],
        constraints: {
          maxMemoryUsage: state.maxMemorySize,
          maxDiskUsage: state.maxDiskSize
        }
      })
      
      setState(prev => ({
        ...prev,
        isOptimizing: false
      }))
      
      logCacheEvent('cache_optimized', { optimizationId: optimization.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize cache',
        isOptimizing: false
      }))
    }
  }, [optimizeCache, state.instances, state.maxMemorySize, state.maxDiskSize, logCacheEvent, userId])

  const handleAnalyzeCache = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyzeCache({
        timeRange: state.timeRange,
        instances: state.instances,
        includePerformance: true,
        includeUsage: true,
        includeOptimizations: true
      })
      
      setState(prev => ({
        ...prev,
        analysis,
        isAnalyzing: false
      }))
      
      logCacheEvent('cache_analyzed', { analysisId: analysis.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze cache',
        isAnalyzing: false
      }))
    }
  }, [analyzeCache, state.timeRange, state.instances, logCacheEvent, userId])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleInstanceSelect = useCallback((instance: CacheInstance) => {
    setState(prev => ({ ...prev, selectedInstance: instance }))
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
          refreshInstances(),
          refreshPools(),
          refreshMetrics(),
          refreshMonitoring()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize cache data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [workflowId, refreshInstances, refreshPools, refreshMetrics, refreshMonitoring])

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
      instances: instances || [],
      pools: pools || [],
      metrics: metrics || null,
      healthChecks: healthChecks || []
    }))
  }, [instances, pools, metrics, healthChecks])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Cache Manager</h1>
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleCreateInstance({})} disabled={state.isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Create Instance
          </Button>
          
          <Button onClick={handleOptimizeCache} disabled={state.isOptimizing} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Optimize
          </Button>
          
          <Button onClick={handleAnalyzeCache} disabled={state.isAnalyzing} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="instances">Instances</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="entries">Entries</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
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
            <Server className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Running Instances</p>
              <p className="text-2xl font-bold">{cacheStatistics.runningInstances}</p>
              <p className="text-xs text-muted-foreground">of {cacheStatistics.totalInstances}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <MemoryStick className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Memory Usage</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(cacheStatistics.memoryUtilization)}`}>
                {formatPercentage(cacheStatistics.memoryUtilization)}
              </p>
              <p className="text-xs text-muted-foreground">{formatBytes(cacheStatistics.totalMemoryUsed)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Disk Usage</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(cacheStatistics.diskUtilization)}`}>
                {formatPercentage(cacheStatistics.diskUtilization)}
              </p>
              <p className="text-xs text-muted-foreground">{formatBytes(cacheStatistics.totalDiskUsed)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Hit Ratio</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(cacheStatistics.hitRatio)}
              </p>
              <p className="text-xs text-muted-foreground">{formatNumber(cacheStatistics.totalHits)} hits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Total Entries</p>
              <p className="text-2xl font-bold">{formatNumber(cacheStatistics.totalEntries)}</p>
              <p className="text-xs text-muted-foreground">across all instances</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium">Health Score</p>
              <p className={`text-2xl font-bold ${getHealthColor(cacheStatistics.healthScore)}`}>
                {formatPercentage(cacheStatistics.healthScore)}
              </p>
              <p className="text-xs text-muted-foreground">overall system</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInstanceCard = (instance: CacheInstance) => (
    <Card 
      key={instance.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        state.selectedInstance?.id === instance.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleInstanceSelect(instance)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Server className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">{instance.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{instance.type} • {instance.cluster}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusVariant(instance.status)}>
              {instance.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {instance.status === 'stopped' ? (
                  <DropdownMenuItem onClick={() => handleStartInstance(instance)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleStopInstance(instance)}>
                    <Stop className="h-4 w-4 mr-2" />
                    Stop
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleRestartInstance(instance)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFlushCache(instance)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Flush
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
                  onClick={() => handleDeleteInstance(instance.id)}
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
              <p className="text-sm text-muted-foreground">Memory</p>
              <p className="font-medium">{formatBytes(instance.memoryUsed || 0)} / {formatBytes(instance.memoryAllocated || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entries</p>
              <p className="font-medium">{formatNumber(instance.entryCount || 0)}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Memory Usage</span>
              <span>{formatPercentage((instance.memoryUsed || 0) / (instance.memoryAllocated || 1) * 100)}</span>
            </div>
            <Progress value={(instance.memoryUsed || 0) / (instance.memoryAllocated || 1) * 100} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <span>Hits: {formatNumber(instance.hitCount || 0)}</span>
            </div>
            <div>
              <span>Misses: {formatNumber(instance.missCount || 0)}</span>
            </div>
            <div>
              <span>Health: {formatPercentage(instance.healthScore || 0)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Response: {formatDuration(instance.avgResponseTime || 0)}</span>
            <span>Throughput: {formatNumber(instance.throughput || 0)}/s</span>
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
                      <CardTitle>Cache Overview</CardTitle>
                      <CardDescription>Real-time cache performance and utilization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 border rounded-md p-4">
                        <p className="text-muted-foreground text-center">Cache performance charts will be rendered here</p>
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
                        <span className="text-sm font-medium">{formatNumber(cacheStatistics.totalRequests)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Miss Ratio</span>
                        <span className="text-sm font-medium">{formatPercentage(cacheStatistics.missRatio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="text-sm font-medium">{formatDuration(cacheStatistics.avgResponseTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Throughput</span>
                        <span className="text-sm font-medium">{formatNumber(cacheStatistics.avgThroughput)}/s</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Instances View */}
          <TabsContent value="instances" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInstances.map(renderInstanceCard)}
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
                {state.isLoading ? 'Loading cache data...' :
                 state.isOptimizing ? 'Optimizing cache...' :
                 state.isAnalyzing ? 'Analyzing cache...' :
                 'Creating cache instance...'}
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

export default CacheManager