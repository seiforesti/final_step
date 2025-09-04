"use client"

import { useState, useMemo, useCallback } from "react"
import { Database, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Play, Pause, AlertTriangle, CheckCircle, Clock, Settings, Monitor, Cloud, Shield, TrendingUp, Activity, FileText, Copy, ExternalLink, ChevronDown, RefreshCw, Grid3X3, List, Users, Calendar, MapPin, Globe, Lock, Unlock, Star, StarOff, Share2, History, Layers, Network, Code, Hash, Type, Binary,  } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Import RBAC integration
import { useRBACIntegration, DATA_SOURCE_PERMISSIONS } from "./hooks/use-rbac-integration"

// Import enterprise hooks for backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"

import { DataSource, ViewMode } from "./types"

interface DataSourceGridProps {
  dataSources?: DataSource[]
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
  filters?: any
  onFiltersChange?: (filters: any) => void
  onSelectDataSource?: (dataSource: DataSource) => void
  dataSource?: DataSource | null
  className?: string
}

interface DataSourceHealth {
  id: number
  overallScore: number
  connectionScore: number
  performanceScore: number
  securityScore: number
  complianceScore: number
  availabilityScore: number
  lastUpdated: string
  recommendations: string[]
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }>
}

interface DataSourceMetrics {
  id: number
  uptime: number
  responseTime: number
  throughput: number
  errorRate: number
  dataVolume: number
  lastScanAt: string
  scanStatus: string
  recordCount: number
  tableCount: number
}

const statusConfig = {
  connected: { 
    icon: CheckCircle, 
    color: "text-green-500", 
    bg: "bg-green-50 dark:bg-green-950",
    badge: "default" as const
  },
  error: { 
    icon: AlertTriangle, 
    color: "text-red-500", 
    bg: "bg-red-50 dark:bg-red-950",
    badge: "destructive" as const
  },
  warning: { 
    icon: Clock, 
    color: "text-yellow-500", 
    bg: "bg-yellow-50 dark:bg-yellow-950",
    badge: "secondary" as const
  },
  offline: { 
    icon: AlertTriangle, 
    color: "text-gray-500", 
    bg: "bg-gray-50 dark:bg-gray-950",
    badge: "outline" as const
  },
}

const typeIcons = {
  postgresql: Database,
  mysql: Database,
  mongodb: Database,
  redis: Database,
  elasticsearch: Search,
  s3: Cloud,
  azure: Cloud,
  gcp: Cloud,
  api: ExternalLink,
  file: FileText,
}

// API functions for data source operations
const dataSourceApi = {
  async getDataSources(filters?: any) {
    try {
      const params = new URLSearchParams(filters)
      console.log('Fetching data sources with params:', params.toString())
      
      const response = await fetch(`/api/data-sources?${params}`)
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText)
        throw new Error(`Failed to fetch data sources: ${response.status} ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching data sources:', error)
      
      // Return mock data to prevent crashes while backend is down
      toast.warning('Backend service unavailable - showing mock data for demonstration')
      
             return [
         {
           id: 1,
           name: 'Sample Database (Mock)',
           source_type: 'postgresql',
           host: 'localhost',
           port: 5432,
           database_name: 'sample_db',
           username: 'user',
           status: 'active',
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
           location: 'on_prem',
           password_secret: 'encrypted',
           use_encryption: true,
           backup_enabled: true,
           monitoring_enabled: true,
           encryption_enabled: true
         },
         {
           id: 2,
           name: 'Analytics Warehouse (Mock)',
           source_type: 'snowflake',
           host: 'account.snowflakecomputing.com',
           port: 443,
           database_name: 'ANALYTICS_DB',
           username: 'analytics_user',
           status: 'active',
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
           location: 'cloud',
           password_secret: 'encrypted',
           use_encryption: true,
           backup_enabled: true,
           monitoring_enabled: true,
           encryption_enabled: true
         }
       ]
    }
  },

  async getDataSourceHealth(dataSourceId: number) {
    try {
      const response = await fetch(`/api/data-sources/${dataSourceId}/health`)
      if (!response.ok) throw new Error('Failed to fetch data source health')
      return response.json()
    } catch (error) {
      console.error(`Error fetching health for data source ${dataSourceId}:`, error)
      // Return mock health data
      return {
        status: 'unknown',
        last_checked: new Date().toISOString(),
        response_time: 0,
        error_message: 'Backend service unavailable'
      }
    }
  },

  async getDataSourceMetrics(dataSourceId: number) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/metrics`)
    if (!response.ok) throw new Error('Failed to fetch data source metrics')
    return response.json()
  },

  async updateDataSource(dataSourceId: number, data: any) {
    const response = await fetch(`/api/data-sources/${dataSourceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update data source')
    return response.json()
  },

  async deleteDataSource(dataSourceId: number) {
    const response = await fetch(`/api/data-sources/${dataSourceId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete data source')
    return response.json()
  },

  async testConnection(dataSourceId: number) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/test-connection`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to test connection')
    return response.json()
  },

  async duplicateDataSource(dataSourceId: number) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/duplicate`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to duplicate data source')
    return response.json()
  },

  async bulkUpdate(dataSourceIds: number[], data: any) {
    const response = await fetch('/api/data-sources/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: dataSourceIds, data })
    })
    if (!response.ok) throw new Error('Failed to bulk update data sources')
    return response.json()
  },

  async bulkDelete(dataSourceIds: number[]) {
    const response = await fetch('/api/data-sources/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: dataSourceIds })
    })
    if (!response.ok) throw new Error('Failed to bulk delete data sources')
    return response.json()
  }
}

export function DataSourceGrid({
  dataSources = [],
  viewMode = "grid",
  onViewModeChange,
  selectedItems = [],
  onSelectionChange,
  filters = {},
  onFiltersChange,
  onSelectDataSource,
  dataSource,
  className = ""
}: DataSourceGridProps) {
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
    componentName: 'DataSourceGrid',
    dataSourceId: dataSource?.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // State management
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium")
  const [showHealthDetails, setShowHealthDetails] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Backend data queries - Real API integration
  const { 
    data: dataSourcesData, 
    isLoading: dataSourcesLoading,
    error: dataSourcesError,
    refetch: refetchDataSources 
  } = useQuery({
    queryKey: ['data-sources', filters, searchQuery, sortBy, sortOrder],
    queryFn: () => dataSourceApi.getDataSources({
      ...filters,
      search: searchQuery || undefined,
      sortBy,
      sortOrder
    }),
    enabled: dataSourcePermissions.canView && dataSources.length === 0, // Only fetch if no props data
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000
  })

  // Health data for each data source - INTELLIGENT BATCHING
  const healthQueries = useQuery({
    queryKey: ['data-sources-health', dataSources.map(ds => ds.id)],
    queryFn: async () => {
      // BATCH PROCESSING: Process data sources in small batches to prevent burst
      const batchSize = 3 // Only 3 concurrent requests at a time
      const healthData: Record<number, DataSourceHealth> = {}
      
      for (let i: number = 0; i < dataSources.length; i += batchSize) {
        const batch = dataSources.slice(i, i + batchSize)
        
        // Process batch with delay between batches
        const batchPromises = batch.map(async (ds, index) => {
          // Add staggered delay within batch to prevent simultaneous requests
          await new Promise(resolve => setTimeout(resolve, index * 200))
          try {
            const health = await dataSourceApi.getDataSourceHealth(ds.id)
            return { id: ds.id, health: health.data }
          } catch (error) {
            console.warn(`Failed to fetch health for data source ${ds.id}:`, error)
            return { id: ds.id, health: null }
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach(result => {
          if (result.health) {
            healthData[result.id] = result.health
          }
        })
        
        // Delay between batches to prevent overwhelming the backend
        if (i + batchSize < dataSources.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      return healthData
    },
    enabled: dataSources.length > 0 && dataSourcePermissions.canView,
    staleTime: 60000, // 1 minute cache
    refetchInterval: 120000, // 2 minutes refresh (much less frequent)
    retry: 2, // Limited retries
    retryDelay: 3000 // 3 second delay between retries
  })

  // Metrics data for each data source - INTELLIGENT BATCHING
  const metricsQueries = useQuery({
    queryKey: ['data-sources-metrics', dataSources.map(ds => ds.id)],
    queryFn: async () => {
      // BATCH PROCESSING: Process data sources in small batches to prevent burst
      const batchSize = 2 // Only 2 concurrent requests at a time (more conservative)
      const metricsData: Record<number, DataSourceMetrics> = {}
      
      for (let i: number = 0; i < dataSources.length; i += batchSize) {
        const batch = dataSources.slice(i, i + batchSize)
        
        // Process batch with delay between batches
        const batchPromises = batch.map(async (ds, index) => {
          // Add staggered delay within batch to prevent simultaneous requests
          await new Promise(resolve => setTimeout(resolve, index * 300))
          try {
            const metrics = await dataSourceApi.getDataSourceMetrics(ds.id)
            return { id: ds.id, metrics: metrics.data }
          } catch (error) {
            console.warn(`Failed to fetch metrics for data source ${ds.id}:`, error)
            return { id: ds.id, metrics: null }
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach(result => {
          if (result.metrics) {
            metricsData[result.id] = result.metrics
          }
        })
        
        // Longer delay between batches for metrics (more expensive operations)
        if (i + batchSize < dataSources.length) {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
      }
      
      return metricsData
    },
    enabled: dataSources.length > 0 && dataSourcePermissions.canView,
    staleTime: 30000, // 30 second cache
    refetchInterval: 180000, // 3 minutes refresh (even less frequent)
    retry: 1, // Very limited retries
    retryDelay: 5000 // 5 second delay between retries
  })

  // Mutations for data source operations
  const updateDataSourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      dataSourceApi.updateDataSource(id, data),
    onSuccess: () => {
      toast.success('Data source updated successfully')
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
      logUserAction('datasource_updated')
    },
    onError: (error: any) => {
      toast.error(`Failed to update data source: ${error.message}`)
    }
  })

  const deleteDataSourceMutation = useMutation({
    mutationFn: dataSourceApi.deleteDataSource,
    onSuccess: () => {
      toast.success('Data source deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
      logUserAction('datasource_deleted')
    },
    onError: (error: any) => {
      toast.error(`Failed to delete data source: ${error.message}`)
    }
  })

  const testConnectionMutation = useMutation({
    mutationFn: dataSourceApi.testConnection,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Connection test successful')
      } else {
        toast.error('Connection test failed')
      }
      logUserAction('connection_tested')
    },
    onError: (error: any) => {
      toast.error(`Connection test failed: ${error.message}`)
    }
  })

  const duplicateDataSourceMutation = useMutation({
    mutationFn: dataSourceApi.duplicateDataSource,
    onSuccess: () => {
      toast.success('Data source duplicated successfully')
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
      logUserAction('datasource_duplicated')
    },
    onError: (error: any) => {
      toast.error(`Failed to duplicate data source: ${error.message}`)
    }
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: number[]; data: any }) => 
      dataSourceApi.bulkUpdate(ids, data),
    onSuccess: () => {
      toast.success('Data sources updated successfully')
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
      logUserAction('datasource_bulk_updated')
    },
    onError: (error: any) => {
      toast.error(`Failed to bulk update: ${error.message}`)
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: dataSourceApi.bulkDelete,
    onSuccess: () => {
      toast.success('Data sources deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
      onSelectionChange?.([])
      logUserAction('datasource_bulk_deleted')
    },
    onError: (error: any) => {
      toast.error(`Failed to bulk delete: ${error.message}`)
    }
  })

  // Use backend data if available, fallback to props
  const effectiveDataSources = dataSourcesData?.data || dataSources

  // Filter and sort data sources
  const filteredDataSources = useMemo(() => {
    let filtered = effectiveDataSources.filter((ds: DataSource) => {
             const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ds.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ds.source_type.toLowerCase().includes(searchQuery.toLowerCase())
       
       const matchesType = !filters.type || filters.type === "all" || ds.source_type === filters.type
      const matchesStatus = !filters.status || filters.status === "all" || ds.status === filters.status
      const matchesEnvironment = !filters.environment || filters.environment === "all" || ds.environment === filters.environment
      
      return matchesSearch && matchesType && matchesStatus && matchesEnvironment
    })

    // Sort
    filtered.sort((a: DataSource, b: DataSource) => {
      let valueA: any, valueB: any
      
      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
                 case "type":
           valueA = a.source_type
           valueB = b.source_type
           break
        case "status":
          valueA = a.status
          valueB = b.status
          break
        case "health":
          const healthA = healthQueries.data?.[a.id]?.overallScore || 0
          const healthB = healthQueries.data?.[b.id]?.overallScore || 0
          valueA = healthA
          valueB = healthB
          break
        case "updated":
          valueA = new Date(a.updated_at || 0)
          valueB = new Date(b.updated_at || 0)
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
      }
    })

    return filtered
  }, [effectiveDataSources, searchQuery, filters, sortBy, sortOrder, healthQueries.data])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      onSelectionChange?.(filteredDataSources.map((ds: DataSource) => ds.id.toString()))
    } else {
      onSelectionChange?.([])
    }
  }, [filteredDataSources, onSelectionChange])

  const handleSelectItem = useCallback((dataSourceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedItems, dataSourceId])
    } else {
      onSelectionChange?.(selectedItems.filter(id => id !== dataSourceId))
    }
  }, [selectedItems, onSelectionChange])

  const getGridColumns = () => {
    switch (gridSize) {
      case "small": return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      case "medium": return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      case "large": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      default: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    }
  }

  const getHealthScore = (dataSource: DataSource) => {
    // Use real backend health data instead of mock calculation
    const healthData = healthQueries.data?.[dataSource.id]
    return healthData?.overallScore || 0
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600" 
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const DataSourceCard = ({ dataSource }: { dataSource: DataSource }) => {
    const StatusIcon = statusConfig[dataSource.status as keyof typeof statusConfig]?.icon || AlertTriangle
            const TypeIcon = typeIcons[dataSource.source_type as keyof typeof typeIcons] || Database
    const status = statusConfig[dataSource.status as keyof typeof statusConfig]
    const healthScore = getHealthScore(dataSource)
    const healthData = healthQueries.data?.[dataSource.id]
    const metricsData = metricsQueries.data?.[dataSource.id]
    const isSelected = selectedItems.includes(dataSource.id.toString())

    return (
      <Card 
        className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${
          isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/50"
        }`}
        onClick={() => onSelectDataSource?.(dataSource)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectItem(dataSource.id.toString(), checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className={`p-2 rounded-lg ${status?.bg}`}>
                <TypeIcon className="h-4 w-4" />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.VIEW}>
                  <DropdownMenuItem onClick={() => onSelectDataSource?.(dataSource)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.EDIT}>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.TEST_CONNECTION}>
                  <DropdownMenuItem 
                    onClick={() => testConnectionMutation.mutate(dataSource.id)}
                    disabled={testConnectionMutation.isPending}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Test Connection
                  </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.CREATE}>
                  <DropdownMenuItem 
                    onClick={() => duplicateDataSourceMutation.mutate(dataSource.id)}
                    disabled={duplicateDataSourceMutation.isPending}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                </PermissionGuard>
                <DropdownMenuSeparator />
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.DELETE}>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => deleteDataSourceMutation.mutate(dataSource.id)}
                    disabled={deleteDataSourceMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </PermissionGuard>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-lg truncate" title={dataSource.name}>
              {dataSource.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={status?.badge} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {dataSource.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dataSource.source_type}
              </Badge>
              {dataSource.environment && (
                <Badge variant="secondary" className="text-xs">
                  {dataSource.environment}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Health Score - Real backend data */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Health Score</span>
                <span className={`font-medium ${getHealthColor(healthScore)}`}>
                  {Math.round(healthScore)}%
                </span>
              </div>
              <Progress value={healthScore} className="h-2" />
              {healthData?.issues && healthData.issues.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  <span className="text-yellow-600">
                    {healthData.issues.filter(i => i.severity === 'high' || i.severity === 'critical').length} issues
                  </span>
                </div>
              )}
            </div>

            {/* Real-time Metrics */}
            {metricsData && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-medium">{metricsData.uptime.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response:</span>
                  <span className="font-medium">{metricsData.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Records:</span>
                  <span className="font-medium">{metricsData.recordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tables:</span>
                  <span className="font-medium">{metricsData.tableCount}</span>
                </div>
              </div>
            )}

            {/* Connection Info */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Host:</span>
                <span className="truncate ml-2 max-w-[120px]" title={dataSource.host}>
                  {dataSource.host}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Port:</span>
                <span>{dataSource.port}</span>
              </div>
                             {dataSource.database_name && (
                 <div className="flex justify-between">
                   <span>Database:</span>
                   <span className="truncate ml-2 max-w-[120px]" title={dataSource.database_name}>
                     {dataSource.database_name}
                   </span>
                 </div>
               )}
            </div>

            {/* Description */}
            {dataSource.description && (
              <p className="text-sm text-muted-foreground line-clamp-2" title={dataSource.description}>
                {dataSource.description}
              </p>
            )}

            {/* Last Updated */}
            {dataSource.updated_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Updated {new Date(dataSource.updated_at).toLocaleDateString()}</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-2 pt-2">
              <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.VIEW_PERFORMANCE}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Activity className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View real-time monitoring</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PermissionGuard>
              
              <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.VIEW_REPORTS}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View analytics dashboard</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PermissionGuard>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle loading states
  if (rbacLoading || dataSourcesLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Handle no permissions
  if (!dataSourcePermissions.canView) {
    return (
      <div className={className}>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view data sources.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Data Sources</h2>
          <Badge variant="outline" className="text-sm">
            {filteredDataSources.length} total
          </Badge>
          {selectedItems.length > 0 && (
            <Badge variant="default" className="text-sm">
              {selectedItems.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDataSources()}
            disabled={dataSourcesLoading}
          >
            <RefreshCw className={`h-4 w-4 ${dataSourcesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid Size Control */}
          {viewMode === "grid" && (
            <Select value={gridSize} onValueChange={(value: string) => setGridSize(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="health">Health Score</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex gap-2 ml-auto">
            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.EDIT}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Open bulk edit dialog
                  toast.info('Bulk edit functionality coming soon')
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.DELETE}>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const ids = selectedItems.map(id => parseInt(id))
                  bulkDeleteMutation.mutate(ids)
                }}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </PermissionGuard>
          </div>
        </div>
      )}

      {/* Error Display */}
      {dataSourcesError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load data sources: {(dataSourcesError as any)?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Sources Grid/List */}
      {filteredDataSources.length === 0 ? (
        <div className="text-center py-12">
          <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || Object.values(filters).some(f => f && f !== 'all') 
              ? "Try adjusting your search or filters" 
              : "Get started by adding your first data source"
            }
          </p>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 pb-2">
            <Checkbox
              checked={selectedItems.length === filteredDataSources.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select all ({filteredDataSources.length})
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className={`grid ${getGridColumns()} gap-4`}>
              {filteredDataSources.map((dataSource: DataSource) => (
                <DataSourceCard key={dataSource.id} dataSource={dataSource} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDataSources.map((dataSource: DataSource) => {
                const StatusIcon = statusConfig[dataSource.status as keyof typeof statusConfig]?.icon || AlertTriangle
                const TypeIcon = typeIcons[dataSource.source_type as keyof typeof typeIcons] || Database
                const status = statusConfig[dataSource.status as keyof typeof statusConfig]
                const healthScore = getHealthScore(dataSource)
                const isSelected = selectedItems.includes(dataSource.id.toString())

                return (
                  <Card 
                    key={dataSource.id}
                    className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      isSelected ? "border-primary shadow-sm" : ""
                    }`}
                    onClick={() => onSelectDataSource?.(dataSource)}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectItem(dataSource.id.toString(), checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className={`p-2 rounded-lg ${status?.bg}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{dataSource.name}</h3>
                          <Badge variant={status?.badge} className="text-xs">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {dataSource.status}
                          </Badge>
                                                     <Badge variant="outline" className="text-xs">
                             {dataSource.source_type}
                           </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{dataSource.host}:{dataSource.port}</span>
                          <span>Health: {Math.round(healthScore)}%</span>
                          {dataSource.updated_at && (
                            <span>Updated {new Date(dataSource.updated_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Progress value={healthScore} className="w-20 h-2" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.VIEW}>
                              <DropdownMenuItem onClick={() => onSelectDataSource?.(dataSource)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.EDIT}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.TEST_CONNECTION}>
                              <DropdownMenuItem 
                                onClick={() => testConnectionMutation.mutate(dataSource.id)}
                                disabled={testConnectionMutation.isPending}
                              >
                                <Monitor className="h-4 w-4 mr-2" />
                                Test Connection
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <DropdownMenuSeparator />
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.DELETE}>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteDataSourceMutation.mutate(dataSource.id)}
                                disabled={deleteDataSourceMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}