"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, Filter, Database, Table, Eye, EyeOff, Download, Upload, RefreshCw, Settings, ChevronDown, ChevronRight, MoreHorizontal, Play, Pause, Square, Clock, CheckCircle, AlertTriangle, XCircle, Zap, BarChart3, TrendingUp, FileText, Tag, Users, Calendar, MapPin, Globe, Lock, Unlock, Star, StarOff, Share2, Copy, ExternalLink, History, Activity, Layers, Grid, List, TreePine, Network, Code, Hash, Type, Binary, Shield, Loader2, CheckCircle2, AlertCircle, Info, Plus, Minus, ArrowRight, ArrowDown, FolderOpen, Folder } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Import RBAC integration
import { useRBACIntegration, DATA_SOURCE_PERMISSIONS } from "./hooks/use-rbac-integration"

// Import enterprise hooks for backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"

import { DataSource } from "./types"

interface DataSourceDiscoveryProps {
  dataSource: DataSource
  className?: string
}

interface DiscoveryJob {
  id: string
  name: string
  status: "running" | "completed" | "failed" | "cancelled" | "scheduled"
  startedAt: string
  completedAt?: string
  progress: number
  assetsDiscovered: number
  errors: number
  config: DiscoveryConfig
  createdBy: string
  duration?: number
  errorMessage?: string
}

interface DiscoveredAsset {
  id: string
  name: string
  type: "table" | "view" | "procedure" | "function" | "schema" | "database"
  schema?: string
  database?: string
  description?: string
  tags: string[]
  columns: AssetColumn[]
  status: "active" | "deprecated" | "inactive"
  containsPII: boolean
  isFavorite: boolean
  size: number
  recordCount: number
  lastUpdated: string
  owner?: string
  location: string
  properties: Record<string, any>
  sensitivity: "public" | "internal" | "confidential" | "restricted"
  qualityScore: number
  lineage: {
    upstream: string[]
    downstream: string[]
  }
}

interface AssetColumn {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
  isForeignKey: boolean
  description?: string
  tags: string[]
  containsPII: boolean
  sensitivity: string
  qualityScore: number
}

interface DiscoveryConfig {
  enabled: boolean
  schedule: string
  depth: "shallow" | "full" | "custom"
  includePII: boolean
  includeMetadata: boolean
  sampleSize: number
  maxTables: number
  excludePatterns: string[]
  includePatterns: string[]
  enableProfiling: boolean
  enableLineage: boolean
  enableQualityChecks: boolean
  customScanRules: string[]
}

interface DiscoveryStats {
  totalAssets: number
  newAssets: number
  updatedAssets: number
  removedAssets: number
  piiAssets: number
  activeJobs: number
  completedJobs: number
  failedJobs: number
  averageQualityScore: number
  coveragePercentage: number
}

// API functions for discovery operations
const discoveryApi = {
  async getDiscoveryJobs(dataSourceId: number) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/jobs`)
    if (!response.ok) throw new Error('Failed to fetch discovery jobs')
    return response.json()
  },

  async getDiscoveredAssets(dataSourceId: number, filters?: any) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/assets?${params}`)
    if (!response.ok) throw new Error('Failed to fetch discovered assets')
    return response.json()
  },

  async getDiscoveryStats(dataSourceId: number) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/stats`)
    if (!response.ok) {
      if (response.status === 404 || response.status === 500) {
        return {
          success: true,
          data_source_id: dataSourceId,
          stats: {
            total_assets: 0,
            total_jobs: 0,
            asset_type_breakdown: {},
            last_discovery_job: null,
            last_asset_discovered: null,
            recent_activity: { last_30_days: 0, last_7_days: 0, discovery_trend: 'stable' }
          }
        }
      }
      throw new Error('Failed to fetch discovery stats')
    }
    return response.json()
  },

  async startDiscovery(dataSourceId: number, config: DiscoveryConfig) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    if (!response.ok) {
      if (response.status === 409) {
        return { success: true, alreadyRunning: true }
      }
      throw new Error('Failed to start discovery')
    }
    return response.json()
  },

  async stopDiscovery(dataSourceId: number, jobId: string) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/jobs/${jobId}/stop`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to stop discovery')
    return response.json()
  },

  async toggleAssetFavorite(dataSourceId: number, assetId: string) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/assets/${assetId}/favorite`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to toggle asset favorite')
    return response.json()
  },

  async updateAssetTags(dataSourceId: number, assetId: string, tags: string[]) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/assets/${assetId}/tags`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags })
    })
    if (!response.ok) throw new Error('Failed to update asset tags')
    return response.json()
  },

  async updateDiscoveryConfig(dataSourceId: number, config: DiscoveryConfig) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    if (!response.ok) throw new Error('Failed to update discovery config')
    return response.json()
  },

  async exportAssets(dataSourceId: number, assetIds: string[], format: 'csv' | 'json' | 'xlsx') {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/assets/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetIds, format })
    })
    if (!response.ok) throw new Error('Failed to export assets')
    return response.blob()
  },

  async getAssetLineage(dataSourceId: number, assetId: string) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/assets/${assetId}/lineage`)
    if (!response.ok) throw new Error('Failed to fetch asset lineage')
    return response.json()
  },

  async runQualityCheck(dataSourceId: number, assetId: string) {
    const response = await fetch(`/proxy/data-sources/${dataSourceId}/discovery/assets/${assetId}/quality-check`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to run quality check')
    return response.json()
  }
}

export function DataSourceDiscovery({ 
  dataSource, 
  className = "" 
}: DataSourceDiscoveryProps) {
  const queryClient = useQueryClient()

  // RBAC Integration
  const { 
    currentUser, 
    hasPermission, 
    dataSourcePermissions, 
    logUserAction, 
    PermissionGuard,
    isLoading: rbacLoading 
  } = useRBACIntegration()

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceDiscovery',
    dataSourceId: dataSource.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // State management
  const [activeTab, setActiveTab] = useState("discovery")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "tree">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showLineageDialog, setShowLineageDialog] = useState(false)
  const [selectedAssetForLineage, setSelectedAssetForLineage] = useState<string | null>(null)

  // Real backend configuration instead of mock
  const [discoveryConfig, setDiscoveryConfig] = useState<DiscoveryConfig>({
    enabled: true,
    schedule: "0 2 * * *", // Daily at 2 AM
    depth: "full",
    includePII: true,
    includeMetadata: true,
    sampleSize: 10000,
    maxTables: 1000,
    excludePatterns: [],
    includePatterns: ["*"],
    enableProfiling: true,
    enableLineage: true,
    enableQualityChecks: true,
    customScanRules: []
  })

  // Backend data queries - Real API integration
  const { 
    data: discoveryJobsData, 
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs 
  } = useQuery({
    queryKey: ['discovery-jobs', dataSource.id],
    queryFn: () => discoveryApi.getDiscoveryJobs(dataSource.id),
    enabled: dataSourcePermissions.canViewDiscovery,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 1000
  })

  const { 
    data: discoveredAssetsData, 
    isLoading: assetsLoading,
    error: assetsError,
    refetch: refetchAssets 
  } = useQuery({
    queryKey: ['discovered-assets', dataSource.id, searchQuery, selectedFilters],
    queryFn: () => discoveryApi.getDiscoveredAssets(dataSource.id, {
      search: searchQuery || undefined,
      ...selectedFilters
    }),
    enabled: dataSourcePermissions.canViewDiscovery,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000
  })

  const { 
    data: discoveryStatsData, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['discovery-stats', dataSource.id],
    queryFn: () => discoveryApi.getDiscoveryStats(dataSource.id),
    enabled: dataSourcePermissions.canViewDiscovery,
    staleTime: 60000
  })

  // Transform backend data to component format
  const discoveryJobs: DiscoveryJob[] = useMemo(() => {
    if (!discoveryJobsData?.data?.jobs) return []
    
    return discoveryJobsData.data.jobs.map((job: any) => ({
      id: job.id,
      name: job.name || `Discovery Job ${job.id}`,
      status: job.status,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      progress: job.progress || 0,
      assetsDiscovered: job.assets_discovered || 0,
      errors: job.error_count || 0,
      config: job.config || discoveryConfig,
      createdBy: job.created_by || 'System',
      duration: job.duration_seconds,
      errorMessage: job.error_message
    }))
  }, [discoveryJobsData, discoveryConfig])

  const discoveredAssets: DiscoveredAsset[] = useMemo(() => {
    if (!discoveredAssetsData?.data?.assets) return []
    
    return discoveredAssetsData.data.assets.map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      type: asset.asset_type,
      schema: asset.schema_name,
      database: asset.database_name,
      description: asset.description,
      tags: asset.tags || [],
      columns: asset.columns || [],
      status: asset.status || 'active',
      containsPII: asset.contains_pii || false,
      isFavorite: asset.is_favorite || false,
      size: asset.size_bytes || 0,
      recordCount: asset.record_count || 0,
      lastUpdated: asset.last_updated,
      owner: asset.owner,
      location: asset.location || '',
      properties: asset.properties || {},
      sensitivity: asset.sensitivity || 'public',
      qualityScore: asset.quality_score || 0,
      lineage: asset.lineage || { upstream: [], downstream: [] }
    }))
  }, [discoveredAssetsData])

  const discoveryStats: DiscoveryStats = useMemo(() => {
    if (!discoveryStatsData?.data?.stats) return {
      totalAssets: 0,
      newAssets: 0,
      updatedAssets: 0,
      removedAssets: 0,
      piiAssets: 0,
      activeJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageQualityScore: 0,
      coveragePercentage: 0
    }
    
    const stats = discoveryStatsData.data.stats
    return {
      totalAssets: stats.total_assets || 0,
      newAssets: stats.new_assets || 0,
      updatedAssets: stats.updated_assets || 0,
      removedAssets: stats.removed_assets || 0,
      piiAssets: stats.pii_assets || 0,
      activeJobs: stats.active_jobs || 0,
      completedJobs: stats.completed_jobs || 0,
      failedJobs: stats.failed_jobs || 0,
      averageQualityScore: stats.average_quality_score || 0,
      coveragePercentage: stats.coverage_percentage || 0
    }
  }, [discoveryStatsData])

  // Mutations for discovery operations
  const startDiscoveryMutation = useMutation({
    mutationFn: (config: DiscoveryConfig) => discoveryApi.startDiscovery(dataSource.id, config),
    onSuccess: () => {
      toast.success('Discovery job started successfully')
      queryClient.invalidateQueries({ queryKey: ['discovery-jobs', dataSource.id] })
      logUserAction('discovery_started', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to start discovery: ${error.message}`)
    }
  })

  const stopDiscoveryMutation = useMutation({
    mutationFn: (jobId: string) => discoveryApi.stopDiscovery(dataSource.id, jobId),
    onSuccess: () => {
      toast.success('Discovery job stopped successfully')
      queryClient.invalidateQueries({ queryKey: ['discovery-jobs', dataSource.id] })
      logUserAction('discovery_stopped', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to stop discovery: ${error.message}`)
    }
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: (assetId: string) => discoveryApi.toggleAssetFavorite(dataSource.id, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovered-assets', dataSource.id] })
      logUserAction('asset_favorite_toggled', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to toggle favorite: ${error.message}`)
    }
  })

  const updateConfigMutation = useMutation({
    mutationFn: (config: DiscoveryConfig) => discoveryApi.updateDiscoveryConfig(dataSource.id, config),
    onSuccess: () => {
      toast.success('Discovery configuration updated successfully')
      setShowConfigDialog(false)
      logUserAction('discovery_config_updated', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to update configuration: ${error.message}`)
    }
  })

  const runQualityCheckMutation = useMutation({
    mutationFn: (assetId: string) => discoveryApi.runQualityCheck(dataSource.id, assetId),
    onSuccess: () => {
      toast.success('Quality check started successfully')
      queryClient.invalidateQueries({ queryKey: ['discovered-assets', dataSource.id] })
      logUserAction('quality_check_started', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to start quality check: ${error.message}`)
    }
  })

  // Filtered and sorted assets with real backend data
  const filteredAssets = useMemo(() => {
    if (!discoveredAssets) return []
    
    let filtered = discoveredAssets.filter(asset => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          asset.name.toLowerCase().includes(query) ||
          asset.schema?.toLowerCase().includes(query) ||
          asset.description?.toLowerCase().includes(query) ||
          asset.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      return true
    })

    // Apply filters
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(asset => {
          switch (key) {
            case "type":
              return values.includes(asset.type)
            case "schema":
              return values.includes(asset.schema || "")
            case "status":
              return values.includes(asset.status)
            case "pii":
              return values.includes(asset.containsPII ? "yes" : "no")
            case "sensitivity":
              return values.includes(asset.sensitivity)
            default:
              return true
          }
        })
      }
    })

    return filtered
  }, [discoveredAssets, searchQuery, selectedFilters])

  // Event handlers
  const handleStartDiscovery = useCallback(async () => {
    try {
      await startDiscoveryMutation.mutateAsync(discoveryConfig)
    } catch (error) {
      console.error("Failed to start discovery:", error)
    }
  }, [startDiscoveryMutation, discoveryConfig])

  const handleStopDiscovery = useCallback(async (jobId: string) => {
    try {
      await stopDiscoveryMutation.mutateAsync(jobId)
    } catch (error) {
      console.error("Failed to stop discovery:", error)
    }
  }, [stopDiscoveryMutation])

  const handleToggleFavorite = useCallback(async (assetId: string) => {
    try {
      await toggleFavoriteMutation.mutateAsync(assetId)
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }, [toggleFavoriteMutation])

  const handleExportAssets = useCallback(async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      const assetIds = selectedAssets.length > 0 ? selectedAssets : filteredAssets.map(a => a.id)
      const blob = await discoveryApi.exportAssets(dataSource.id, assetIds, format)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `discovery-assets-${dataSource.name}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Assets exported successfully')
      logUserAction('assets_exported', 'datasource', dataSource.id, { format, count: assetIds.length })
    } catch (error: any) {
      toast.error(`Failed to export assets: ${error.message}`)
    }
  }, [selectedAssets, filteredAssets, dataSource.id, dataSource.name, logUserAction])

  // Utility functions
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "table": return <Table className="h-4 w-4 text-blue-500" />
      case "view": return <Eye className="h-4 w-4 text-green-500" />
      case "procedure": return <Code className="h-4 w-4 text-purple-500" />
      case "function": return <Zap className="h-4 w-4 text-yellow-500" />
      case "schema": return <Folder className="h-4 w-4 text-orange-500" />
      case "database": return <Database className="h-4 w-4 text-gray-500" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "deprecated": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "inactive": return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "cancelled": return <XCircle className="h-4 w-4 text-gray-500" />
      case "scheduled": return <Clock className="h-4 w-4 text-orange-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case "public": return "bg-green-100 text-green-800"
      case "internal": return "bg-blue-100 text-blue-800"
      case "confidential": return "bg-yellow-100 text-yellow-800"
      case "restricted": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A"
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return "N/A"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  // Handle loading states
  if (rbacLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Handle no permissions
  if (!dataSourcePermissions.canViewDiscovery) {
    return (
      <div className={className}>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view data discovery for this data source.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Discovery</h2>
          <p className="text-muted-foreground">
            Discover, catalog, and manage data assets from {dataSource.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAssets()}
            disabled={assetsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${assetsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_DISCOVERY}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfigDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button 
              onClick={handleStartDiscovery} 
              disabled={startDiscoveryMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {startDiscoveryMutation.isPending ? "Starting..." : "Start Discovery"}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Discovery Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold">{discoveryStats.totalAssets}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PII Assets</p>
                <p className="text-2xl font-bold">{discoveryStats.piiAssets}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">{discoveryStats.activeJobs}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold">{discoveryStats.averageQualityScore.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold">{discoveryStats.coveragePercentage.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discovery">Discovery Jobs</TabsTrigger>
          <TabsTrigger value="assets">Discovered Assets</TabsTrigger>
          <TabsTrigger value="lineage">Data Lineage</TabsTrigger>
          <TabsTrigger value="quality">Quality Reports</TabsTrigger>
        </TabsList>

        {/* Discovery Jobs Tab */}
        <TabsContent value="discovery" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discovery Jobs</CardTitle>
                  <CardDescription>
                    Monitor and manage data discovery operations
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchJobs()}
                    disabled={jobsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${jobsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {jobsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load discovery jobs: {jobsError.message}
                  </AlertDescription>
                </Alert>
              )}

              {jobsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <Skeleton className="h-6 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : discoveryJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discovery jobs found</h3>
                  <p className="text-gray-500 mb-4">Start your first discovery job to see it here</p>
                  <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_DISCOVERY}>
                    <Button onClick={handleStartDiscovery}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Discovery
                    </Button>
                  </PermissionGuard>
                </div>
              ) : (
                <div className="space-y-4">
                  {discoveryJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getJobStatusIcon(job.status)}
                          <div>
                            <h4 className="font-medium">{job.name}</h4>
                            <p className="text-sm text-gray-500">
                              Started {new Date(job.startedAt).toLocaleString()} by {job.createdBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{job.status}</Badge>
                          {job.status === 'running' && (
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_DISCOVERY}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStopDiscovery(job.id)}
                                disabled={stopDiscoveryMutation.isPending}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          )}
                        </div>
                      </div>

                      {job.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="w-full" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Assets Found:</span>
                          <span className="ml-2 font-medium">{job.assetsDiscovered}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Errors:</span>
                          <span className="ml-2 font-medium text-red-600">{job.errors}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-2 font-medium">
                            {job.duration ? formatDuration(job.duration) : 'Running...'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Depth:</span>
                          <span className="ml-2 font-medium capitalize">{job.config.depth}</span>
                        </div>
                      </div>

                      {job.errorMessage && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{job.errorMessage}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discovered Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="tree">Tree</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportAssets('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAssets('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportAssets('xlsx')}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Asset Type</Label>
                    <Select
                      value={selectedFilters.type?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          type: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="table">Tables</SelectItem>
                        <SelectItem value="view">Views</SelectItem>
                        <SelectItem value="procedure">Procedures</SelectItem>
                        <SelectItem value="function">Functions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Contains PII</Label>
                    <Select
                      value={selectedFilters.pii?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          pii: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All assets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All assets</SelectItem>
                        <SelectItem value="yes">Contains PII</SelectItem>
                        <SelectItem value="no">No PII</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select
                      value={selectedFilters.status?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          status: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Sensitivity</Label>
                    <Select
                      value={selectedFilters.sensitivity?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          sensitivity: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assets Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discovered Assets</CardTitle>
                  <CardDescription>
                    {filteredAssets.length} assets found
                    {selectedAssets.length > 0 && ` • ${selectedAssets.length} selected`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assetsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load discovered assets: {assetsError.message}
                  </AlertDescription>
                </Alert>
              )}

              {assetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || Object.values(selectedFilters).some(f => f.length > 0)
                      ? "Try adjusting your search or filters"
                      : "Run a discovery job to find data assets"
                    }
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map((asset) => (
                    <Card key={asset.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getAssetIcon(asset.type)}
                            <h4 className="font-medium truncate">{asset.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFavorite(asset.id)}
                              disabled={toggleFavoriteMutation.isPending}
                            >
                              {asset.isFavorite ? (
                                <Star className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAssetForLineage(asset.id)
                                    setShowLineageDialog(true)
                                  }}
                                >
                                  <Network className="h-4 w-4 mr-2" />
                                  View Lineage
                                </DropdownMenuItem>
                                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_DISCOVERY}>
                                  <DropdownMenuItem
                                    onClick={() => runQualityCheckMutation.mutate(asset.id)}
                                    disabled={runQualityCheckMutation.isPending}
                                  >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Run Quality Check
                                  </DropdownMenuItem>
                                </PermissionGuard>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(asset.status)}
                          <Badge variant="outline" className="text-xs">
                            {asset.type}
                          </Badge>
                          {asset.containsPII && (
                            <Badge variant="destructive" className="text-xs">
                              PII
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getSensitivityColor(asset.sensitivity)}`}>
                            {asset.sensitivity}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {asset.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {asset.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Schema:</span>
                              <span className="ml-1 font-medium">{asset.schema || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Records:</span>
                              <span className="ml-1 font-medium">{asset.recordCount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Size:</span>
                              <span className="ml-1 font-medium">{formatFileSize(asset.size)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quality:</span>
                              <span className="ml-1 font-medium">{asset.qualityScore.toFixed(1)}%</span>
                            </div>
                          </div>

                          {asset.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {asset.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {asset.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{asset.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Updated {new Date(asset.lastUpdated).toLocaleDateString()}</span>
                            {asset.owner && <span>Owner: {asset.owner}</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedAssets.includes(asset.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAssets([...selectedAssets, asset.id])
                              } else {
                                setSelectedAssets(selectedAssets.filter(id => id !== asset.id))
                              }
                            }}
                          />
                          {getAssetIcon(asset.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{asset.name}</h4>
                              {getStatusIcon(asset.status)}
                              <Badge variant="outline" className="text-xs">
                                {asset.type}
                              </Badge>
                              {asset.containsPII && (
                                <Badge variant="destructive" className="text-xs">
                                  PII
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{asset.schema ? `${asset.schema}.${asset.name}` : asset.name}</span>
                              <span>{asset.recordCount.toLocaleString()} records</span>
                              <span>{formatFileSize(asset.size)}</span>
                              <span>Quality: {asset.qualityScore.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={asset.qualityScore} className="w-16 h-2" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(asset.id)}
                            disabled={toggleFavoriteMutation.isPending}
                          >
                            {asset.isFavorite ? (
                              <Star className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAssetForLineage(asset.id)
                                  setShowLineageDialog(true)
                                }}
                              >
                                <Network className="h-4 w-4 mr-2" />
                                View Lineage
                              </DropdownMenuItem>
                              <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_DISCOVERY}>
                                <DropdownMenuItem
                                  onClick={() => runQualityCheckMutation.mutate(asset.id)}
                                  disabled={runQualityCheckMutation.isPending}
                                >
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  Run Quality Check
                                </DropdownMenuItem>
                              </PermissionGuard>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Lineage Tab */}
        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Lineage</CardTitle>
                  <CardDescription>
                    Visualize data flow and dependencies across assets
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Network className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Lineage Visualization</h3>
                <p className="text-gray-500 mb-4">
                  Select an asset from the Discovered Assets tab to view its lineage
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Reports Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Quality Reports</CardTitle>
                  <CardDescription>
                    Monitor data quality metrics and trends
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quality Analytics</h3>
                <p className="text-gray-500 mb-4">
                  Quality reports and analytics will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Discovery Configuration</DialogTitle>
            <DialogDescription>
              Configure data discovery settings and schedules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="discovery-enabled">Enable Discovery</Label>
                <p className="text-sm text-gray-500">
                  Automatically discover new data assets
                </p>
              </div>
              <Switch
                id="discovery-enabled"
                checked={discoveryConfig.enabled}
                onCheckedChange={(enabled) =>
                  setDiscoveryConfig(prev => ({ ...prev, enabled }))
                }
              />
            </div>

            <div>
              <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
              <Input
                id="schedule"
                value={discoveryConfig.schedule}
                onChange={(e) =>
                  setDiscoveryConfig(prev => ({ ...prev, schedule: e.target.value }))
                }
                placeholder="0 2 * * *"
              />
              <p className="text-sm text-gray-500 mt-1">
                Default: Daily at 2 AM (0 2 * * *)
              </p>
            </div>

            <div>
              <Label htmlFor="depth">Discovery Depth</Label>
              <Select
                value={discoveryConfig.depth}
                onValueChange={(depth: any) =>
                  setDiscoveryConfig(prev => ({ ...prev, depth }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shallow">Shallow (Schema only)</SelectItem>
                  <SelectItem value="full">Full (Schema + Metadata)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sample-size">Sample Size</Label>
              <Input
                id="sample-size"
                type="number"
                value={discoveryConfig.sampleSize}
                onChange={(e) =>
                  setDiscoveryConfig(prev => ({ ...prev, sampleSize: parseInt(e.target.value) }))
                }
                min="100"
                max="100000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-pii">Include PII Detection</Label>
                <Switch
                  id="include-pii"
                  checked={discoveryConfig.includePII}
                  onCheckedChange={(includePII) =>
                    setDiscoveryConfig(prev => ({ ...prev, includePII }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-profiling">Enable Profiling</Label>
                <Switch
                  id="enable-profiling"
                  checked={discoveryConfig.enableProfiling}
                  onCheckedChange={(enableProfiling) =>
                    setDiscoveryConfig(prev => ({ ...prev, enableProfiling }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-lineage">Enable Lineage</Label>
                <Switch
                  id="enable-lineage"
                  checked={discoveryConfig.enableLineage}
                  onCheckedChange={(enableLineage) =>
                    setDiscoveryConfig(prev => ({ ...prev, enableLineage }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-quality">Enable Quality Checks</Label>
                <Switch
                  id="enable-quality"
                  checked={discoveryConfig.enableQualityChecks}
                  onCheckedChange={(enableQualityChecks) =>
                    setDiscoveryConfig(prev => ({ ...prev, enableQualityChecks }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateConfigMutation.mutate(discoveryConfig)}
              disabled={updateConfigMutation.isPending}
            >
              {updateConfigMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}