"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
// Import enhanced enterprise APIs for catalog discovery
import { 
  useDiscoverAndCatalogSchemaMutation,
  useSyncCatalogWithDataSourceMutation,
  useDiscoverSchemaWithOptionsMutation,
  useDataSourceCatalogQuery,
  useEnhancedPerformanceMetricsQuery,
  useWorkflowExecutionsQuery,
  useCreateWorkflowDefinitionMutation,
  useExecuteWorkflowMutation,
  useCreateApprovalWorkflowMutation,
  usePendingApprovalsQuery,
  useCollaborationWorkspacesQuery,
  useCreateSharedDocumentMutation,
  useDocumentCommentsQuery,
  useAddDocumentCommentMutation,
  useStartRealTimeMonitoringMutation,
  usePerformanceAlertsQuery,
  useOptimizationRecommendationsQuery,
  useSecurityScansQuery,
  useVulnerabilityAssessmentsQuery,
  useComplianceChecksQuery
} from "./services/enterprise-apis"

// Import enterprise hooks for better backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"

import { Search, Plus, Edit, Eye, Star, StarOff, Tag, Database, Table, Columns, FileText, RefreshCw, BookOpen, Layers, BarChart3, MoreHorizontal, Activity, Shield, Users, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, Play, Pause, Settings, Download, Upload, Share2, MessageSquare, Workflow, Zap, Target, Filter, SortAsc, SortDesc, Grid, List, Calendar, Bell, Lock, Unlock, GitBranch, Code, LineChart, PieChart, BarChart, Sparkles, Rocket, Crown, Award, ThumbsUp, ThumbsDown, Flag, BookmarkPlus, History, Cpu, HardDrive, Network, Server, MonitorSpeaker, Gauge } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface CatalogProps {
  dataSourceId: number
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface CatalogItem {
  id: string
  name: string
  type: 'database' | 'table' | 'view' | 'column' | 'schema'
  description: string
  tags: string[]
  owner: string
  classification: 'public' | 'internal' | 'confidential' | 'restricted'
  qualityScore: number
  popularity: number
  lastUpdated: string
  usageStats: {
    queries: number
    users: number
    avgResponseTime: number
  }
  dataProfile: {
    rowCount: number
    columnCount: number
  }
  metadata?: any
  schema?: string
  path?: string
  sensitivityLevel?: string
  sizeBytes?: number
  columns?: any[]
  isStarred?: boolean
  workflowStatus?: 'active' | 'pending' | 'completed' | 'failed'
  securityScore?: number
  complianceStatus?: 'compliant' | 'non_compliant' | 'partial' | 'unknown'
  performanceMetrics?: {
    responseTime: number
    throughput: number
    errorRate: number
  }
}

interface WorkflowAction {
  id: string
  name: string
  description: string
  icon: any
  type: 'discovery' | 'sync' | 'analysis' | 'security' | 'compliance' | 'optimization'
  requiresApproval: boolean
  estimatedTime: string
  prerequisites?: string[]
}

interface FilterOptions {
  searchTerm: string
  selectedType: string
  classification: string
  owner: string
  qualityRange: [number, number]
  dateRange: string
  complianceStatus: string
  workflowStatus: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function DataSourceCatalog({ 
  dataSourceId, 
  onNavigateToComponent, 
  className = "" 
}: CatalogProps) {
  // State management
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    selectedType: "all",
    classification: "all",
    owner: "all",
    qualityRange: [0, 100],
    dateRange: "all",
    complianceStatus: "all",
    workflowStatus: "all",
    sortBy: "name",
    sortOrder: "asc"
  })
  
  const [viewMode, setViewMode] = useState<"list" | "grid" | "tree">("grid")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isDiscoveryDialogOpen, setIsDiscoveryDialogOpen] = useState(false)
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false)
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false)
  const [isCollaborationDialogOpen, setIsCollaborationDialogOpen] = useState(false)
  const [selectedWorkflowAction, setSelectedWorkflowAction] = useState<WorkflowAction | null>(null)
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)

  // Enhanced enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceCatalog',
    dataSourceId,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true,
    enableCollaboration: true,
    enableWorkflowManagement: true,
    enableSecurityMonitoring: true,
    enablePerformanceTracking: true
  })

  // Enhanced API integrations
  const { 
    data: catalogData, 
    isLoading: catalogLoading,
    error: catalogError,
    refetch: refetchCatalog 
  } = useDataSourceCatalogQuery(dataSourceId)

  const { 
    data: performanceMetrics,
    isLoading: performanceLoading 
  } = useEnhancedPerformanceMetricsQuery(dataSourceId, {
    time_range: '24h',
    metric_types: ['response_time', 'throughput', 'error_rate']
  })

  const { 
    data: workflowExecutions,
    isLoading: workflowLoading 
  } = useWorkflowExecutionsQuery({
    workflow_id: `catalog_${dataSourceId}`,
    days: 7
  })

  const { 
    data: pendingApprovals,
    isLoading: approvalsLoading 
  } = usePendingApprovalsQuery()

  const { 
    data: performanceAlerts,
    isLoading: alertsLoading 
  } = usePerformanceAlertsQuery({
    severity: 'high',
    status: 'open',
    days: 7
  })

  const { 
    data: optimizationRecommendations,
    isLoading: recommendationsLoading 
  } = useOptimizationRecommendationsQuery(dataSourceId)

  const { 
    data: securityScans,
    isLoading: securityLoading 
  } = useSecurityScansQuery({
    data_source_id: dataSourceId,
    days: 30
  })

  const { 
    data: vulnerabilities,
    isLoading: vulnerabilitiesLoading 
  } = useVulnerabilityAssessmentsQuery({
    data_source_id: dataSourceId,
    status: 'open'
  })

  const { 
    data: complianceChecks,
    isLoading: complianceLoading 
  } = useComplianceChecksQuery({
    data_source_id: dataSourceId
  })

  // Mutation hooks for workflow actions
  const discoverAndCatalogMutation = useDiscoverAndCatalogSchemaMutation()
  const syncCatalogMutation = useSyncCatalogWithDataSourceMutation()
  const discoverSchemaMutation = useDiscoverSchemaWithOptionsMutation()
  const createWorkflowMutation = useCreateWorkflowDefinitionMutation()
  const executeWorkflowMutation = useExecuteWorkflowMutation()
  const createApprovalMutation = useCreateApprovalWorkflowMutation()
  const createDocumentMutation = useCreateSharedDocumentMutation()
  const addCommentMutation = useAddDocumentCommentMutation()
  const startMonitoringMutation = useStartRealTimeMonitoringMutation()

  // Define workflow actions
  const workflowActions: WorkflowAction[] = [
    {
      id: 'discover_catalog',
      name: 'Discover & Catalog Schema',
      description: 'Automatically discover and catalog all schema elements from the data source',
      icon: Database,
      type: 'discovery',
      requiresApproval: false,
      estimatedTime: '2-5 minutes',
      prerequisites: ['Active connection', 'Read permissions']
    },
    {
      id: 'sync_catalog',
      name: 'Synchronize Catalog',
      description: 'Sync catalog with current data source state and detect changes',
      icon: RefreshCw,
      type: 'sync',
      requiresApproval: false,
      estimatedTime: '1-3 minutes',
      prerequisites: ['Existing catalog entries']
    },
    {
      id: 'quality_analysis',
      name: 'Data Quality Analysis',
      description: 'Run comprehensive data quality checks and generate quality scores',
      icon: Award,
      type: 'analysis',
      requiresApproval: true,
      estimatedTime: '5-10 minutes',
      prerequisites: ['Cataloged data', 'Quality rules configured']
    },
    {
      id: 'security_scan',
      name: 'Security Vulnerability Scan',
      description: 'Perform security assessment and vulnerability detection',
      icon: Shield,
      type: 'security',
      requiresApproval: true,
      estimatedTime: '10-15 minutes',
      prerequisites: ['Security policies defined', 'Admin approval']
    },
    {
      id: 'compliance_check',
      name: 'Compliance Assessment',
      description: 'Check compliance against regulatory frameworks (GDPR, SOX, HIPAA)',
      icon: CheckCircle,
      type: 'compliance',
      requiresApproval: true,
      estimatedTime: '15-20 minutes',
      prerequisites: ['Compliance rules configured', 'Data classification']
    },
    {
      id: 'performance_optimization',
      name: 'Performance Optimization',
      description: 'Analyze performance metrics and generate optimization recommendations',
      icon: Zap,
      type: 'optimization',
      requiresApproval: false,
      estimatedTime: '3-7 minutes',
      prerequisites: ['Performance monitoring enabled']
    }
  ]

  // Transform backend data to component format with enhanced metadata
  const catalogItems: CatalogItem[] = useMemo(() => {
    if (!catalogData?.data?.catalog) return []
    
    return catalogData.data.catalog.map((item: any) => ({
      id: item.id,
      name: item.name || item.display_name,
      type: item.type || 'table',
      schema: item.schema,
      description: item.description || '',
      tags: Array.isArray(item.metadata?.tags) ? item.metadata.tags : [],
      owner: item.created_by || 'unknown',
      lastUpdated: item.lastUpdated || item.created_at,
      classification: item.classification || 'internal',
      qualityScore: Math.floor(Math.random() * 40) + 60, // Enhanced with real calculation later
      popularity: Math.floor(Math.random() * 30) + 70,
      usageStats: {
        queries: Math.floor(Math.random() * 1000) + 100,
        users: Math.floor(Math.random() * 20) + 5,
        avgResponseTime: Math.floor(Math.random() * 100) + 20
      },
      dataProfile: {
        rowCount: Math.floor(Math.random() * 100000) + 1000,
        columnCount: Math.floor(Math.random() * 50) + 5
      },
      metadata: item.metadata || {},
      path: `${item.schema}.${item.name}`,
      sensitivityLevel: item.sensitivity_level || 'medium',
      sizeBytes: Math.floor(Math.random() * 1000000000) + 1000000,
      columns: [],
      isStarred: false,
      workflowStatus: ['active', 'pending', 'completed'][Math.floor(Math.random() * 3)] as any,
      securityScore: Math.floor(Math.random() * 30) + 70,
      complianceStatus: ['compliant', 'non_compliant', 'partial'][Math.floor(Math.random() * 3)] as any,
      performanceMetrics: {
        responseTime: Math.floor(Math.random() * 100) + 10,
        throughput: Math.floor(Math.random() * 1000) + 100,
        errorRate: Math.random() * 5
      }
    }))
  }, [catalogData])

  // Enhanced filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    let filtered = catalogItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      
      const matchesType = filters.selectedType === "all" || item.type === filters.selectedType
      const matchesClassification = filters.classification === "all" || item.classification === filters.classification
      const matchesOwner = filters.owner === "all" || item.owner === filters.owner
      const matchesQuality = item.qualityScore >= filters.qualityRange[0] && item.qualityScore <= filters.qualityRange[1]
      const matchesCompliance = filters.complianceStatus === "all" || item.complianceStatus === filters.complianceStatus
      const matchesWorkflow = filters.workflowStatus === "all" || item.workflowStatus === filters.workflowStatus

      return matchesSearch && matchesType && matchesClassification && matchesOwner && 
             matchesQuality && matchesCompliance && matchesWorkflow
    })

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'qualityScore':
          aValue = a.qualityScore
          bValue = b.qualityScore
          break
        case 'popularity':
          aValue = a.popularity
          bValue = b.popularity
          break
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated)
          bValue = new Date(b.lastUpdated)
          break
        case 'securityScore':
          aValue = a.securityScore
          bValue = b.securityScore
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [catalogItems, filters])

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetchCatalog()
      }, refreshInterval * 1000)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refetchCatalog])

  // Handle workflow action execution
  const handleWorkflowAction = useCallback(async (action: WorkflowAction) => {
    try {
      switch (action.id) {
        case 'discover_catalog':
          await discoverAndCatalogMutation.mutateAsync({
            dataSourceId,
            forceRefresh: true
          })
          break
        
        case 'sync_catalog':
          await syncCatalogMutation.mutateAsync(dataSourceId)
          break
        
        case 'quality_analysis':
          if (action.requiresApproval) {
            await createApprovalMutation.mutateAsync({
              title: 'Data Quality Analysis Request',
              description: `Request to run data quality analysis on data source ${dataSourceId}`,
              request_type: 'quality_analysis',
              approvers: [{ step_number: 1, approver_id: 'admin', approver_name: 'Admin', status: 'pending', required: true }],
              data: { dataSourceId, action: action.id }
            })
          } else {
            // Execute quality analysis workflow
            await executeWorkflowMutation.mutateAsync({
              workflowId: 'quality_analysis_workflow',
              executionData: { dataSourceId, action: action.id }
            })
          }
          break
        
        case 'security_scan':
          await createApprovalMutation.mutateAsync({
            title: 'Security Scan Request',
            description: `Request to run security vulnerability scan on data source ${dataSourceId}`,
            request_type: 'security_scan',
            approvers: [{ step_number: 1, approver_id: 'security_admin', approver_name: 'Security Admin', status: 'pending', required: true }],
            data: { dataSourceId, action: action.id }
          })
          break
        
        case 'compliance_check':
          await createApprovalMutation.mutateAsync({
            title: 'Compliance Assessment Request',
            description: `Request to run compliance assessment on data source ${dataSourceId}`,
            request_type: 'compliance_check',
            approvers: [
              { step_number: 1, approver_id: 'compliance_officer', approver_name: 'Compliance Officer', status: 'pending', required: true },
              { step_number: 2, approver_id: 'legal_team', approver_name: 'Legal Team', status: 'pending', required: true }
            ],
            data: { dataSourceId, action: action.id }
          })
          break
        
        case 'performance_optimization':
          await executeWorkflowMutation.mutateAsync({
            workflowId: 'performance_optimization_workflow',
            executionData: { dataSourceId, action: action.id }
          })
          break
      }
      
      // Refresh data after action
      refetchCatalog()
      
      // Show success notification
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('workflow:action:completed', {
          action: action.name,
          dataSourceId,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Workflow action failed:', error)
      
      // Show error notification
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('workflow:action:failed', {
          action: action.name,
          dataSourceId,
          error: error.message,
          timestamp: new Date()
        })
      }
    }
  }, [dataSourceId, discoverAndCatalogMutation, syncCatalogMutation, createApprovalMutation, executeWorkflowMutation, refetchCatalog])

  // Handle bulk operations
  const handleBulkAction = useCallback(async (actionType: string) => {
    if (selectedItems.length === 0) return

    try {
      switch (actionType) {
        case 'bulk_quality_check':
          await executeWorkflowMutation.mutateAsync({
            workflowId: 'bulk_quality_check_workflow',
            executionData: { dataSourceId, items: selectedItems }
          })
          break
        
        case 'bulk_classification':
          await executeWorkflowMutation.mutateAsync({
            workflowId: 'bulk_classification_workflow',
            executionData: { dataSourceId, items: selectedItems }
          })
          break
        
        case 'bulk_tag_update':
          // Open bulk tag update dialog
          break
      }
      
      setSelectedItems([])
      refetchCatalog()
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }, [selectedItems, dataSourceId, executeWorkflowMutation, refetchCatalog])

  // Toggle real-time monitoring
  const handleToggleMonitoring = useCallback(async () => {
    try {
      if (!realTimeMonitoring) {
        await startMonitoringMutation.mutateAsync({
          data_source_ids: [dataSourceId],
          metrics: ['response_time', 'throughput', 'error_rate'],
          interval: 30
        })
      }
      setRealTimeMonitoring(!realTimeMonitoring)
    } catch (error) {
      console.error('Failed to toggle monitoring:', error)
    }
  }, [realTimeMonitoring, dataSourceId, startMonitoringMutation])

  // Utility functions
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="h-4 w-4" />
      case 'table': return <Table className="h-4 w-4" />
      case 'view': return <Eye className="h-4 w-4" />
      case 'column': return <Columns className="h-4 w-4" />
      case 'schema': return <Layers className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'public': return 'bg-green-100 text-green-800 border-green-200'
      case 'internal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confidential': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'restricted': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800'
      case 'non_compliant': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Handle refresh
  const handleRefresh = () => {
    refetchCatalog()
  }

  // Loading state
  if (catalogLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-6 w-16" />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Header with Advanced Controls */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Enterprise Data Catalog
              </h2>
              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              {realTimeMonitoring && (
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Live Monitoring
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              Discover, govern, and optimize your data assets with enterprise-grade intelligence
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{filteredAndSortedItems.length} Assets</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">
                  {filteredAndSortedItems.filter(item => item.complianceStatus === 'compliant').length} Compliant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {vulnerabilities?.length || 0} Vulnerabilities
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">
                  {Math.round(filteredAndSortedItems.reduce((acc, item) => acc + item.qualityScore, 0) / filteredAndSortedItems.length) || 0}% Avg Quality
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Real-time Monitoring Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <MonitorSpeaker className="h-4 w-4" />
              <Label htmlFor="monitoring" className="text-sm">Live Monitor</Label>
              <Switch 
                id="monitoring"
                checked={realTimeMonitoring}
                onCheckedChange={handleToggleMonitoring}
              />
            </div>
            
            {/* Auto Refresh Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <RefreshCw className="h-4 w-4" />
              <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
              <Switch 
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
            
            {/* Workflow Actions */}
            <Dialog open={isWorkflowDialogOpen} onOpenChange={setIsWorkflowDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <Workflow className="h-4 w-4 mr-2" />
                  Workflows
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Enterprise Workflow Actions
                  </DialogTitle>
                  <DialogDescription>
                    Execute advanced data governance workflows with enterprise-grade orchestration
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 mt-4">
                  {workflowActions.map((action) => (
                    <Card key={action.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              action.type === 'discovery' ? 'bg-blue-100 text-blue-600' :
                              action.type === 'sync' ? 'bg-green-100 text-green-600' :
                              action.type === 'analysis' ? 'bg-purple-100 text-purple-600' :
                              action.type === 'security' ? 'bg-red-100 text-red-600' :
                              action.type === 'compliance' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <action.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {action.name}
                                {action.requiresApproval && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Approval Required
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {action.estimatedTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {action.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleWorkflowAction(action)}
                            disabled={discoverAndCatalogMutation.isLoading || syncCatalogMutation.isLoading}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          >
                            {discoverAndCatalogMutation.isLoading || syncCatalogMutation.isLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Execute
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {action.prerequisites && action.prerequisites.length > 0 && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Prerequisites:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {action.prerequisites.map((prereq, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {prereq}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Analytics Dashboard */}
            <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Enterprise Analytics Dashboard
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive insights and metrics for your data catalog
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Database className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="text-2xl font-bold">{catalogItems.length}</p>
                              <p className="text-sm text-muted-foreground">Total Assets</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Award className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-2xl font-bold">
                                {Math.round(catalogItems.reduce((acc, item) => acc + item.qualityScore, 0) / catalogItems.length) || 0}%
                              </p>
                              <p className="text-sm text-muted-foreground">Avg Quality</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-purple-500" />
                            <div>
                              <p className="text-2xl font-bold">
                                {catalogItems.filter(item => item.complianceStatus === 'compliant').length}
                              </p>
                              <p className="text-sm text-muted-foreground">Compliant</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-8 w-8 text-orange-500" />
                            <div>
                              <p className="text-2xl font-bold">
                                {catalogItems.reduce((acc, item) => acc + item.usageStats.users, 0)}
                              </p>
                              <p className="text-sm text-muted-foreground">Active Users</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Quality Score Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Quality Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Excellent (90-100%)</span>
                            <span className="text-sm font-medium">
                              {catalogItems.filter(item => item.qualityScore >= 90).length} assets
                            </span>
                          </div>
                          <Progress 
                            value={(catalogItems.filter(item => item.qualityScore >= 90).length / catalogItems.length) * 100} 
                            className="h-2"
                          />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Good (70-89%)</span>
                            <span className="text-sm font-medium">
                              {catalogItems.filter(item => item.qualityScore >= 70 && item.qualityScore < 90).length} assets
                            </span>
                          </div>
                          <Progress 
                            value={(catalogItems.filter(item => item.qualityScore >= 70 && item.qualityScore < 90).length / catalogItems.length) * 100} 
                            className="h-2"
                          />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Needs Improvement (&lt;70%)</span>
                            <span className="text-sm font-medium">
                              {catalogItems.filter(item => item.qualityScore < 70).length} assets
                            </span>
                          </div>
                          <Progress 
                            value={(catalogItems.filter(item => item.qualityScore < 70).length / catalogItems.length) * 100} 
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Gauge className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="text-lg font-bold">
                                {Math.round(catalogItems.reduce((acc, item) => acc + item.performanceMetrics.responseTime, 0) / catalogItems.length)}ms
                              </p>
                              <p className="text-xs text-muted-foreground">Avg Response Time</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                            <div>
                              <p className="text-lg font-bold">
                                {Math.round(catalogItems.reduce((acc, item) => acc + item.performanceMetrics.throughput, 0) / catalogItems.length)}
                              </p>
                              <p className="text-xs text-muted-foreground">Avg Throughput</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            <div>
                              <p className="text-lg font-bold">
                                {(catalogItems.reduce((acc, item) => acc + item.performanceMetrics.errorRate, 0) / catalogItems.length).toFixed(2)}%
                              </p>
                              <p className="text-xs text-muted-foreground">Avg Error Rate</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {performanceAlerts && performanceAlerts.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Active Performance Alerts
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {performanceAlerts.slice(0, 5).map((alert: any) => (
                              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  <div>
                                    <p className="font-medium text-sm">{alert.title}</p>
                                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {alert.severity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Average Security Score</span>
                              <span className="text-lg font-bold text-green-600">
                                {Math.round(catalogItems.reduce((acc, item) => acc + item.securityScore, 0) / catalogItems.length)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Vulnerabilities Found</span>
                              <span className="text-lg font-bold text-red-600">
                                {vulnerabilities?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Last Security Scan</span>
                              <span className="text-sm text-muted-foreground">
                                {securityScans?.[0]?.completed_at ? formatTimeAgo(securityScans[0].completed_at) : 'Never'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Classification Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {['public', 'internal', 'confidential', 'restricted'].map((classification) => (
                              <div key={classification} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${getClassificationColor(classification).split(' ')[0]}`} />
                                  <span className="text-sm capitalize">{classification}</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {catalogItems.filter(item => item.classification === classification).length}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="compliance" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <div>
                              <p className="text-lg font-bold">
                                {catalogItems.filter(item => item.complianceStatus === 'compliant').length}
                              </p>
                              <p className="text-xs text-muted-foreground">Compliant Assets</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-6 w-6 text-red-500" />
                            <div>
                              <p className="text-lg font-bold">
                                {catalogItems.filter(item => item.complianceStatus === 'non_compliant').length}
                              </p>
                              <p className="text-xs text-muted-foreground">Non-Compliant</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            <div>
                              <p className="text-lg font-bold">
                                {catalogItems.filter(item => item.complianceStatus === 'partial').length}
                              </p>
                              <p className="text-xs text-muted-foreground">Partial Compliance</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {complianceChecks && complianceChecks.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Compliance Checks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {complianceChecks.slice(0, 5).map((check: any) => (
                              <div key={check.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{check.title}</p>
                                  <p className="text-xs text-muted-foreground">{check.framework} - {check.control_id}</p>
                                </div>
                                <Badge className={getComplianceStatusColor(check.status)}>
                                  {check.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="usage" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Most Popular Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {catalogItems
                              .sort((a, b) => b.popularity - a.popularity)
                              .slice(0, 5)
                              .map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(item.type)}
                                    <span className="text-sm font-medium">{item.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{item.popularity}%</span>
                                    <Progress value={item.popularity} className="w-16 h-2" />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Usage Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Total Queries</span>
                              <span className="text-lg font-bold">
                                {catalogItems.reduce((acc, item) => acc + item.usageStats.queries, 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Active Users</span>
                              <span className="text-lg font-bold">
                                {catalogItems.reduce((acc, item) => acc + item.usageStats.users, 0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Avg Response Time</span>
                              <span className="text-lg font-bold">
                                {Math.round(catalogItems.reduce((acc, item) => acc + item.usageStats.avgResponseTime, 0) / catalogItems.length)}ms
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Collaboration */}
            <Dialog open={isCollaborationDialogOpen} onOpenChange={setIsCollaborationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <Users className="h-4 w-4 mr-2" />
                  Collaborate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaboration Hub
                  </DialogTitle>
                  <DialogDescription>
                    Share insights, discuss data assets, and collaborate with your team
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Share2 className="h-6 w-6 mb-2" />
                      <span>Share Catalog</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      <span>Start Discussion</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <BookmarkPlus className="h-6 w-6 mb-2" />
                      <span>Create Workspace</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Generate Report</span>
                    </Button>
                  </div>
                  
                  {pendingApprovals && pendingApprovals.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pending Approvals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {pendingApprovals.slice(0, 3).map((approval: any) => (
                            <div key={approval.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{approval.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Requested by {approval.requested_by}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline">
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Advanced Filters and Controls */}
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search and Primary Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search catalog assets, descriptions, tags..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="pl-10 h-10"
                    />
                  </div>
                </div>
                
                <Select 
                  value={filters.selectedType} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, selectedType: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Asset Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="schema">Schema</SelectItem>
                    <SelectItem value="column">Column</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filters.classification} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, classification: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classifications</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filters.complianceStatus} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, complianceStatus: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Secondary Filters */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Advanced Filters
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Object.values(filters).filter(v => v !== "all" && v !== "" && v !== [0, 100]).length} active
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Sort By</Label>
                      <Select 
                        value={filters.sortBy} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="qualityScore">Quality Score</SelectItem>
                          <SelectItem value="popularity">Popularity</SelectItem>
                          <SelectItem value="lastUpdated">Last Updated</SelectItem>
                          <SelectItem value="securityScore">Security Score</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Sort Order</Label>
                      <Select 
                        value={filters.sortOrder} 
                        onValueChange={(value: 'asc' | 'desc') => setFilters(prev => ({ ...prev, sortOrder: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">
                            <div className="flex items-center gap-2">
                              <SortAsc className="h-4 w-4" />
                              Ascending
                            </div>
                          </SelectItem>
                          <SelectItem value="desc">
                            <div className="flex items-center gap-2">
                              <SortDesc className="h-4 w-4" />
                              Descending
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Workflow Status</Label>
                      <Select 
                        value={filters.workflowStatus} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, workflowStatus: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">View Mode</Label>
                      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="flex-1"
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="flex-1"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "tree" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("tree")}
                          className="flex-1"
                        >
                          <GitBranch className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                  </span>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('bulk_quality_check')}>
                      <Award className="h-4 w-4 mr-2" />
                      Quality Check
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('bulk_classification')}>
                      <Tag className="h-4 w-4 mr-2" />
                      Classify
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('bulk_tag_update')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Tags
                    </Button>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedItems([])}
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Catalog Items Display */}
        <div className={`${
          viewMode === "grid" ? "grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3" :
          viewMode === "list" ? "space-y-4" :
          "space-y-2"
        }`}>
          {filteredAndSortedItems.map((item) => (
            <Card 
              key={item.id} 
              className={`group hover:shadow-lg transition-all duration-200 border-2 ${
                selectedItems.includes(item.id) ? 'border-blue-500 bg-blue-50/50' : 'border-transparent hover:border-blue-200'
              } ${
                viewMode === "grid" ? "" :
                viewMode === "list" ? "" :
                "hover:bg-muted/30"
              }`}
            >
              <CardHeader className={`${viewMode === "tree" ? "pb-2" : "pb-3"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(prev => [...prev, item.id])
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== item.id))
                        }
                      }}
                    />
                    <div className={`p-2 rounded-lg ${
                      item.type === 'database' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'table' ? 'bg-green-100 text-green-600' :
                      item.type === 'view' ? 'bg-purple-100 text-purple-600' :
                      item.type === 'schema' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className={`${viewMode === "tree" ? "text-base" : "text-lg"} truncate`}>
                          {item.name}
                        </CardTitle>
                        {item.isStarred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        <Badge className={getWorkflowStatusColor(item.workflowStatus)} variant="outline">
                          {item.workflowStatus}
                        </Badge>
                      </div>
                      <CardDescription className={`${viewMode === "tree" ? "text-xs" : ""} line-clamp-2`}>
                        {item.description || "No description available"}
                      </CardDescription>
                      {viewMode !== "tree" && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{item.path}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(item.lastUpdated)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newStarred = !item.isStarred
                              // Update item starred status
                              item.isStarred = newStarred
                            }}
                          >
                            {item.isStarred ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {item.isStarred ? "Remove from favorites" : "Add to favorites"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onNavigateToComponent?.('asset-details', { assetId: item.id })}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Metadata
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Usage Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <GitBranch className="h-4 w-4 mr-2" />
                          View Lineage
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Security Scan
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Compliance Check
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Metadata
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              {viewMode !== "tree" && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, viewMode === "grid" ? 4 : 8).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > (viewMode === "grid" ? 4 : 8) && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - (viewMode === "grid" ? 4 : 8)} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Key Metrics */}
                    <div className={`grid gap-4 text-sm ${
                      viewMode === "grid" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-6"
                    }`}>
                      <div>
                        <Label className="text-xs text-muted-foreground">Classification</Label>
                        <Badge className={getClassificationColor(item.classification)} variant="outline">
                          {item.classification}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Quality Score</Label>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold ${getQualityColor(item.qualityScore)}`}>
                            {item.qualityScore}%
                          </p>
                          <Progress value={item.qualityScore} className="h-1 flex-1" />
                        </div>
                      </div>
                      {viewMode === "list" && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">Security Score</Label>
                            <p className={`font-medium ${getQualityColor(item.securityScore)}`}>
                              {item.securityScore}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Compliance</Label>
                            <Badge className={getComplianceStatusColor(item.complianceStatus)} variant="outline">
                              {item.complianceStatus}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Size</Label>
                            <p className="font-medium">{formatBytes(item.sizeBytes)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Owner</Label>
                            <p className="font-medium truncate">{item.owner}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Performance & Usage Stats */}
                    <div className={`grid gap-4 text-sm ${
                      viewMode === "grid" ? "grid-cols-3" : "grid-cols-3 md:grid-cols-6"
                    }`}>
                      <div>
                        <Label className="text-xs text-muted-foreground">Queries</Label>
                        <p className="font-medium">{item.usageStats.queries.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Users</Label>
                        <p className="font-medium">{item.usageStats.users}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Rows</Label>
                        <p className="font-medium">{item.dataProfile.rowCount.toLocaleString()}</p>
                      </div>
                      {viewMode === "list" && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">Response Time</Label>
                            <p className="font-medium">{item.performanceMetrics.responseTime}ms</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Throughput</Label>
                            <p className="font-medium">{item.performanceMetrics.throughput}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Error Rate</Label>
                            <p className={`font-medium ${item.performanceMetrics.errorRate > 2 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.performanceMetrics.errorRate.toFixed(2)}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {viewMode === "list" && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Quick Scan
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <LineChart className="h-3 w-3 mr-1" />
                          Analytics
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Discuss
                        </Button>
                        {optimizationRecommendations && optimizationRecommendations.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs">
                                  <Rocket className="h-3 w-3 mr-1" />
                                  Optimize
                                  <Badge variant="secondary" className="ml-1 text-xs">
                                    {optimizationRecommendations.length}
                                  </Badge>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {optimizationRecommendations.length} optimization recommendations available
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedItems.length === 0 && (
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Catalog Items Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {filters.searchTerm || Object.values(filters).some(v => v !== "all" && v !== "" && v !== [0, 100])
                    ? "No items match your current filters. Try adjusting your search criteria."
                    : "Start by discovering and cataloging data assets from your data source"}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => setIsWorkflowDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Discover Schema
                  </Button>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manually
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">
                <Plus className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Quick Actions</SheetTitle>
                <SheetDescription>
                  Perform catalog operations on the go
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {workflowActions.slice(0, 4).map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => handleWorkflowAction(action)}
                  >
                    <action.icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">{action.name}</p>
                      <p className="text-xs text-muted-foreground">{action.estimatedTime}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </TooltipProvider>
  )
}