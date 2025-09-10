"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Database,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  Cloud,
  Activity,
  FileText,
  ExternalLink,
  RefreshCw,
  Grid3X3,
  List,
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Import RBAC integration
import { useRBACIntegration, DATA_SOURCE_PERMISSIONS } from "./hooks/use-rbac-integration"

// Import enterprise hooks for backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"

import type { DataSource, ViewMode } from "./types"

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
    type: "error" | "warning" | "info"
    message: string
    severity: "low" | "medium" | "high" | "critical"
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
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    badge: "default" as const,
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    badge: "destructive" as const,
  },
  warning: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    badge: "secondary" as const,
  },
  offline: {
    icon: AlertTriangle,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10 border-zinc-500/20",
    badge: "outline" as const,
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
      console.log("Fetching data sources with params:", params.toString())

      const response = await fetch(`/proxy/scan/data-sources?${params}`)
      if (!response.ok) {
        console.error("API response not ok:", response.status, response.statusText)
        throw new Error(`Failed to fetch data sources: ${response.status} ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching data sources:", error)

      // Return mock data to prevent crashes while backend is down
      toast.warning("Backend service unavailable - showing mock data for demonstration")

      return [
        {
          id: 1,
          name: "Sample Database (Mock)",
          source_type: "postgresql",
          host: "localhost",
          port: 5432,
          database_name: "sample_db",
          username: "user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: "on_prem",
          password_secret: "encrypted",
          use_encryption: true,
          backup_enabled: true,
          monitoring_enabled: true,
          encryption_enabled: true,
        },
        {
          id: 2,
          name: "Analytics Warehouse (Mock)",
          source_type: "snowflake",
          host: "account.snowflakecomputing.com",
          port: 443,
          database_name: "ANALYTICS_DB",
          username: "analytics_user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: "cloud",
          password_secret: "encrypted",
          use_encryption: true,
          backup_enabled: true,
          monitoring_enabled: true,
          encryption_enabled: true,
        },
      ]
    }
  },

  async getDataSourceHealth(dataSourceId: number) {
    try {
      const response = await fetch(`/proxy/scan/data-sources/${dataSourceId}/health`)
      if (!response.ok) throw new Error("Failed to fetch data source health")
      return response.json()
    } catch (error) {
      console.error(`Error fetching health for data source ${dataSourceId}:`, error)
      // Return mock health data
      return {
        status: "unknown",
        last_checked: new Date().toISOString(),
        response_time: 0,
        error_message: "Backend service unavailable",
      }
    }
  },

  async getDataSourceMetrics(dataSourceId: number) {
    const response = await fetch(`/proxy/scan/data-sources/${dataSourceId}/stats`)
    if (!response.ok) throw new Error("Failed to fetch data source metrics")
    return response.json()
  },

  async updateDataSource(dataSourceId: number, data: any) {
    const response = await fetch(`/proxy/scan/data-sources/${dataSourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update data source")
    return response.json()
  },

  async deleteDataSource(dataSourceId: number) {
    const response = await fetch(`/proxy/scan/data-sources/${dataSourceId}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete data source")
    return response.json()
  },

  async testConnection(dataSourceId: number) {
    const response = await fetch(`/proxy/scan/data-sources/${dataSourceId}/test-connection`, {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to test connection")
    return response.json()
  },

  async duplicateDataSource(dataSourceId: number) {
    const response = await fetch(`/proxy/scan/data-sources/${dataSourceId}/duplicate`, {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to duplicate data source")
    return response.json()
  },

  async bulkUpdate(dataSourceIds: number[], data: any) {
    const response = await fetch("/proxy/scan/data-sources/bulk-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: dataSourceIds, data }),
    })
    if (!response.ok) throw new Error("Failed to bulk update data sources")
    return response.json()
  },

  async bulkDelete(dataSourceIds: number[]) {
    const response = await fetch("/proxy/scan/data-sources/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: dataSourceIds }),
    })
    if (!response.ok) throw new Error("Failed to bulk delete data sources")
    return response.json()
  },
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
  className = "",
}: DataSourceGridProps) {
  const queryClient = useQueryClient()

  // RBAC Integration
  const {
    currentUser,
    hasPermission,
    dataSourcePermissions,
    logUserAction,
    PermissionGuard,
    isLoading: rbacLoading,
  } = useRBACIntegration()

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: "DataSourceGrid",
    dataSourceId: dataSource?.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true,
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
    refetch: refetchDataSources,
  } = useQuery({
    queryKey: ["data-sources", filters, searchQuery, sortBy, sortOrder],
    queryFn: () =>
      dataSourceApi.getDataSources({
        ...filters,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
      }),
    enabled: dataSourcePermissions.canView && dataSources.length === 0, // Only fetch if no props data
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000,
  })

  // Health data for each data source - INTELLIGENT BATCHING
  const healthQueries = useQuery({
    queryKey: ["data-sources-health", dataSources.map((ds) => ds.id)],
    queryFn: async () => {
      // BATCH PROCESSING: Process data sources in small batches to prevent burst
      const batchSize = 3 // Only 3 concurrent requests at a time
      const healthData: Record<number, DataSourceHealth> = {}

      for (let i = 0; i < dataSources.length; i += batchSize) {
        const batch = dataSources.slice(i, i + batchSize)

        // Process batch with delay between batches
        const batchPromises = batch.map(async (ds, index) => {
          // Add staggered delay within batch to prevent simultaneous requests
          await new Promise((resolve) => setTimeout(resolve, index * 200))
          try {
            const health = await dataSourceApi.getDataSourceHealth(ds.id)
            return { id: ds.id, health: health.data }
          } catch (error) {
            console.warn(`Failed to fetch health for data source ${ds.id}:`, error)
            return { id: ds.id, health: null }
          }
        })

        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach((result) => {
          if (result.health) {
            healthData[result.id] = result.health
          }
        })

        // Delay between batches to prevent overwhelming the backend
        if (i + batchSize < dataSources.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      return healthData
    },
    enabled: dataSources.length > 0 && dataSourcePermissions.canView,
    staleTime: 60000, // 1 minute cache
    refetchInterval: 120000, // 2 minutes refresh (much less frequent)
    retry: 2, // Limited retries
    retryDelay: 3000, // 3 second delay between retries
  })

  // Metrics data for each data source - INTELLIGENT BATCHING
  const metricsQueries = useQuery({
    queryKey: ["data-sources-metrics", dataSources.map((ds) => ds.id)],
    queryFn: async () => {
      // BATCH PROCESSING: Process data sources in small batches to prevent burst
      const batchSize = 2 // Only 2 concurrent requests at a time (more conservative)
      const metricsData: Record<number, DataSourceMetrics> = {}

      for (let i = 0; i < dataSources.length; i += batchSize) {
        const batch = dataSources.slice(i, i + batchSize)

        // Process batch with delay between batches
        const batchPromises = batch.map(async (ds, index) => {
          // Add staggered delay within batch to prevent simultaneous requests
          await new Promise((resolve) => setTimeout(resolve, index * 300))
          try {
            const metrics = await dataSourceApi.getDataSourceMetrics(ds.id)
            return { id: ds.id, metrics: metrics.data }
          } catch (error) {
            console.warn(`Failed to fetch metrics for data source ${ds.id}:`, error)
            return { id: ds.id, metrics: null }
          }
        })

        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach((result) => {
          if (result.metrics) {
            metricsData[result.id] = result.metrics
          }
        })

        // Longer delay between batches for metrics (more expensive operations)
        if (i + batchSize < dataSources.length) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      }

      return metricsData
    },
    enabled: dataSources.length > 0 && dataSourcePermissions.canView,
    staleTime: 30000, // 30 second cache
    refetchInterval: 180000, // 3 minutes refresh (even less frequent)
    retry: 1, // Very limited retries
    retryDelay: 5000, // 5 second delay between retries
  })

  // Mutations for data source operations
  const updateDataSourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => dataSourceApi.updateDataSource(id, data),
    onSuccess: () => {
      toast.success("Data source updated successfully")
      queryClient.invalidateQueries({ queryKey: ["data-sources"] })
      logUserAction("datasource_updated")
    },
    onError: (error: any) => {
      toast.error(`Failed to update data source: ${error.message}`)
    },
  })

  const deleteDataSourceMutation = useMutation({
    mutationFn: dataSourceApi.deleteDataSource,
    onSuccess: () => {
      toast.success("Data source deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["data-sources"] })
      logUserAction("datasource_deleted")
    },
    onError: (error: any) => {
      toast.error(`Failed to delete data source: ${error.message}`)
    },
  })

  const testConnectionMutation = useMutation({
    mutationFn: dataSourceApi.testConnection,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Connection test successful")
      } else {
        toast.error("Connection test failed")
      }
      logUserAction("connection_tested")
    },
    onError: (error: any) => {
      toast.error(`Connection test failed: ${error.message}`)
    },
  })

  const duplicateDataSourceMutation = useMutation({
    mutationFn: dataSourceApi.duplicateDataSource,
    onSuccess: () => {
      toast.success("Data source duplicated successfully")
      queryClient.invalidateQueries({ queryKey: ["data-sources"] })
      logUserAction("datasource_duplicated")
    },
    onError: (error: any) => {
      toast.error(`Failed to duplicate data source: ${error.message}`)
    },
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: number[]; data: any }) => dataSourceApi.bulkUpdate(ids, data),
    onSuccess: () => {
      toast.success("Data sources updated successfully")
      queryClient.invalidateQueries({ queryKey: ["data-sources"] })
      logUserAction("datasource_bulk_updated")
    },
    onError: (error: any) => {
      toast.error(`Failed to bulk update: ${error.message}`)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: dataSourceApi.bulkDelete,
    onSuccess: () => {
      toast.success("Data sources deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["data-sources"] })
      onSelectionChange?.([])
      logUserAction("datasource_bulk_deleted")
    },
    onError: (error: any) => {
      toast.error(`Failed to bulk delete: ${error.message}`)
    },
  })

  // Use backend data if available, fallback to props
  const effectiveDataSources = dataSourcesData?.data || dataSources

  // Filter and sort data sources
  const filteredDataSources = useMemo(() => {
    const filtered = effectiveDataSources.filter((ds: DataSource) => {
      const matchesSearch =
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.source_type.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = !filters.type || filters.type === "all" || ds.source_type === filters.type
      const matchesStatus = !filters.status || filters.status === "all" || ds.status === filters.status
      const matchesEnvironment =
        !filters.environment || filters.environment === "all" || ds.environment === filters.environment

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

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        onSelectionChange?.(filteredDataSources.map((ds: DataSource) => ds.id.toString()))
      } else {
        onSelectionChange?.([])
      }
    },
    [filteredDataSources, onSelectionChange],
  )

  const handleSelectItem = useCallback(
    (dataSourceId: string, checked: boolean) => {
      if (checked) {
        onSelectionChange?.([...selectedItems, dataSourceId])
      } else {
        onSelectionChange?.(selectedItems.filter((id) => id !== dataSourceId))
      }
    },
    [selectedItems, onSelectionChange],
  )

  const getGridColumns = () => {
    switch (gridSize) {
      case "small":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      case "medium":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      case "large":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    }
  }

  const getHealthScore = (dataSource: DataSource) => {
    // Use real backend health data instead of mock calculation
    const healthData = healthQueries.data?.[dataSource.id]
    return healthData?.overallScore || 0
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-emerald-400"
    if (score >= 75) return "text-amber-400"
    if (score >= 50) return "text-orange-400"
    return "text-red-400"
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
        className={`group hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm ${
          isSelected ? "border-blue-500/50 bg-blue-500/5" : "hover:border-zinc-700"
        }`}
        onClick={() => onSelectDataSource?.(dataSource)}
      >
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectItem(dataSource.id.toString(), checked as boolean)}
                onClick={(e) => e.stopPropagation()}
                className="border-zinc-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />

              <div className={`p-2 rounded-md border ${status?.bg}`}>
                <TypeIcon className="h-4 w-4 text-zinc-300" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm text-zinc-100 truncate mb-1">{dataSource.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-zinc-800 border-zinc-700 text-zinc-300">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {dataSource.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-zinc-800 border-zinc-700 text-zinc-400">
                    {dataSource.source_type}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                <DropdownMenuLabel className="text-zinc-300">Actions</DropdownMenuLabel>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.VIEW}>
                  <DropdownMenuItem
                    onClick={() => onSelectDataSource?.(dataSource)}
                    className="text-zinc-300 hover:bg-zinc-800"
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.EDIT}>
                  <DropdownMenuItem className="text-zinc-300 hover:bg-zinc-800">
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.TEST_CONNECTION}>
                  <DropdownMenuItem
                    onClick={() => testConnectionMutation.mutate(dataSource.id)}
                    disabled={testConnectionMutation.isPending}
                    className="text-zinc-300 hover:bg-zinc-800"
                  >
                    <Monitor className="h-3 w-3 mr-2" />
                    Test Connection
                  </DropdownMenuItem>
                </PermissionGuard>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.DELETE}>
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteDataSourceMutation.mutate(dataSource.id)}
                    disabled={deleteDataSourceMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </PermissionGuard>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-4 pb-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Health</span>
                <span className={`font-medium ${getHealthColor(healthScore)}`}>{Math.round(healthScore)}%</span>
              </div>
              <Progress value={healthScore} className="h-1.5 bg-zinc-800" />
              {healthData?.issues && healthData.issues.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  <span className="text-amber-400">
                    {healthData.issues.filter((i) => i.severity === "high" || i.severity === "critical").length} issues
                  </span>
                </div>
              )}
            </div>

            {metricsData && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Uptime:</span>
                  <span className="text-zinc-300 font-mono">{metricsData.uptime.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Response:</span>
                  <span className="text-zinc-300 font-mono">{metricsData.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Records:</span>
                  <span className="text-zinc-300 font-mono">{metricsData.recordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tables:</span>
                  <span className="text-zinc-300 font-mono">{metricsData.tableCount}</span>
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs text-zinc-500">
              <div className="flex justify-between">
                <span>Host:</span>
                <span className="truncate ml-2 max-w-[120px] font-mono text-zinc-400" title={dataSource.host}>
                  {dataSource.host}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Port:</span>
                <span className="font-mono text-zinc-400">{dataSource.port}</span>
              </div>
              {dataSource.database_name && (
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span
                    className="truncate ml-2 max-w-[120px] font-mono text-zinc-400"
                    title={dataSource.database_name}
                  >
                    {dataSource.database_name}
                  </span>
                </div>
              )}
            </div>

            {dataSource.description && (
              <p className="text-xs text-zinc-400 line-clamp-2" title={dataSource.description}>
                {dataSource.description}
              </p>
            )}

            {dataSource.updated_at && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                <span>Updated {new Date(dataSource.updated_at).toLocaleDateString()}</span>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.VIEW_PERFORMANCE}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
                      View real-time monitoring
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PermissionGuard>

              <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.TEST_CONNECTION}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          testConnectionMutation.mutate(dataSource.id)
                        }}
                        disabled={testConnectionMutation.isPending}
                      >
                        <Monitor className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
                      Test connection
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PermissionGuard>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-zinc-100">Data Sources</h2>
          <Badge variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
            {filteredDataSources.length} total
          </Badge>
          {selectedItems.length > 0 && (
            <Badge variant="default" className="text-xs bg-blue-500/20 border-blue-500/30 text-blue-300">
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
            className="h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          >
            <RefreshCw className={`h-3 w-3 ${dataSourcesLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <div className="flex items-center border border-zinc-700 rounded-md p-0.5 bg-zinc-800">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("grid")}
              className="h-6 w-6 p-0 text-xs"
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("list")}
              className="h-6 w-6 p-0 text-xs"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>

          {viewMode === "grid" && (
            <Select value={gridSize} onValueChange={(value: string) => setGridSize(value)}>
              <SelectTrigger className="w-24 h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="small" className="text-xs text-zinc-300">
                  Small
                </SelectItem>
                <SelectItem value="medium" className="text-xs text-zinc-300">
                  Medium
                </SelectItem>
                <SelectItem value="large" className="text-xs text-zinc-300">
                  Large
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => onFiltersChange?.({ ...filters, status: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-32 h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-xs text-zinc-300">
                All Status
              </SelectItem>
              <SelectItem value="connected" className="text-xs text-zinc-300">
                Connected
              </SelectItem>
              <SelectItem value="error" className="text-xs text-zinc-300">
                Error
              </SelectItem>
              <SelectItem value="warning" className="text-xs text-zinc-300">
                Warning
              </SelectItem>
              <SelectItem value="offline" className="text-xs text-zinc-300">
                Offline
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type || "all"}
            onValueChange={(value) => onFiltersChange?.({ ...filters, type: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-32 h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all" className="text-xs text-zinc-300">
                All Types
              </SelectItem>
              <SelectItem value="postgresql" className="text-xs text-zinc-300">
                PostgreSQL
              </SelectItem>
              <SelectItem value="mysql" className="text-xs text-zinc-300">
                MySQL
              </SelectItem>
              <SelectItem value="mongodb" className="text-xs text-zinc-300">
                MongoDB
              </SelectItem>
              <SelectItem value="redis" className="text-xs text-zinc-300">
                Redis
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {dataSourcesLoading ? (
        <div className={`grid ${getGridColumns()} gap-4`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                <Skeleton className="h-3 w-1/2 bg-zinc-800" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-2 bg-zinc-800" />
                <Skeleton className="h-3 w-2/3 bg-zinc-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDataSources.length === 0 ? (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No data sources found</h3>
          <p className="text-zinc-500 mb-4">
            {searchQuery || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "Get started by adding your first data source"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span>
              Showing {filteredDataSources.length} of {dataSources.length} data sources
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className={`grid ${getGridColumns()} gap-3`}>
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
                    className={`p-3 cursor-pointer hover:bg-zinc-800/50 transition-colors border border-zinc-800 bg-zinc-900/50 ${
                      isSelected ? "border-blue-500/50 bg-blue-500/5" : "hover:border-zinc-700"
                    }`}
                    onClick={() => onSelectDataSource?.(dataSource)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectItem(dataSource.id.toString(), checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        className="border-zinc-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />

                      <div className={`p-2 rounded-md border ${status?.bg}`}>
                        <TypeIcon className="h-4 w-4 text-zinc-300" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm text-zinc-100 truncate">{dataSource.name}</h3>
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0 h-5 bg-zinc-800 border-zinc-700 text-zinc-300"
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {dataSource.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0 h-5 bg-zinc-800 border-zinc-700 text-zinc-400"
                          >
                            {dataSource.source_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="font-mono">
                            {dataSource.host}:{dataSource.port}
                          </span>
                          <span>
                            Health: <span className={getHealthColor(healthScore)}>{Math.round(healthScore)}%</span>
                          </span>
                          {dataSource.updated_at && (
                            <span>Updated {new Date(dataSource.updated_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Progress value={healthScore} className="w-16 h-1.5 bg-zinc-800" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                            <DropdownMenuLabel className="text-zinc-300">Actions</DropdownMenuLabel>
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.VIEW}>
                              <DropdownMenuItem
                                onClick={() => onSelectDataSource?.(dataSource)}
                                className="text-zinc-300 hover:bg-zinc-800"
                              >
                                <Eye className="h-3 w-3 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.EDIT}>
                              <DropdownMenuItem className="text-zinc-300 hover:bg-zinc-800">
                                <Edit className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.TEST_CONNECTION}>
                              <DropdownMenuItem
                                onClick={() => testConnectionMutation.mutate(dataSource.id)}
                                disabled={testConnectionMutation.isPending}
                                className="text-zinc-300 hover:bg-zinc-800"
                              >
                                <Monitor className="h-3 w-3 mr-2" />
                                Test Connection
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.DELETE}>
                              <DropdownMenuItem
                                className="text-red-400 hover:bg-red-500/10"
                                onClick={() => deleteDataSourceMutation.mutate(dataSource.id)}
                                disabled={deleteDataSourceMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
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
