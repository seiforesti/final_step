"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Plus, Eye, Calendar, BarChart3, PieChart, LineChart, Settings, Trash2, Play, Pause, RefreshCw, Shield, Clock, Activity, TrendingUp, Filter, Search, FileSpreadsheet, FileImage, FileText as FilePdf, Share2, Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Import RBAC integration
import { useRBACIntegration, DATA_SOURCE_PERMISSIONS } from "./hooks/use-rbac-integration"

// Import enterprise hooks for backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"

import { DataSource } from "./types"

interface ReportsProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface Report {
  id: string
  name: string
  type: "performance" | "security" | "compliance" | "usage" | "custom" | "analytics" | "audit" | "lineage"
  status: "draft" | "generating" | "completed" | "failed" | "scheduled" | "cancelled"
  createdAt: string
  generatedAt?: string
  scheduledAt?: string
  size: number
  format: "pdf" | "csv" | "json" | "html" | "xlsx" | "xml"
  description?: string
  creator: string
  downloadUrl?: string
  isScheduled: boolean
  scheduleExpression?: string
  parameters?: Record<string, any>
  tags?: string[]
  priority: "low" | "medium" | "high" | "critical"
  estimatedDuration?: number
  progress?: number
  errorMessage?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  format: string
  parameters: Record<string, any>
  isActive: boolean
  category: string
}

interface ReportStats {
  totalReports: number
  completedReports: number
  failedReports: number
  scheduledReports: number
  totalSizeMB: number
  avgGenerationTime: number
  successRate: number
  mostUsedType: string
}

// API functions for report operations
const reportsApi = {
  async getReports(dataSourceId: number, filters?: any) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports?${params}`)
    if (!response.ok) throw new Error('Failed to fetch reports')
    return response.json()
  },

  async getReport(dataSourceId: number, reportId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports/${reportId}`)
    if (!response.ok) throw new Error('Failed to fetch report')
    return response.json()
  },

  async createReport(dataSourceId: number, reportData: any) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    })
    if (!response.ok) throw new Error('Failed to create report')
    return response.json()
  },

  async generateReport(dataSourceId: number, reportId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports/${reportId}/generate`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to generate report')
    return response.json()
  },

  async cancelReport(dataSourceId: number, reportId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports/${reportId}/cancel`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to cancel report')
    return response.json()
  },

  async deleteReport(dataSourceId: number, reportId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports/${reportId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete report')
    return response.json()
  },

  async downloadReport(dataSourceId: number, reportId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports/${reportId}/download`)
    if (!response.ok) throw new Error('Failed to download report')
    return response.blob()
  },

  async getReportTemplates() {
    const response = await fetch('/proxy/reports/templates')
    if (!response.ok) throw new Error('Failed to fetch report templates')
    return response.json()
  },

  async getReportStats(dataSourceId: number) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports/stats`)
    if (!response.ok) throw new Error('Failed to fetch report statistics')
    return response.json()
  },

  async scheduleReport(dataSourceId: number, reportId: string, schedule: any) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/reports/${reportId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    })
    if (!response.ok) throw new Error('Failed to schedule report')
    return response.json()
  }
}

export function DataSourceReports({
  dataSource,
  onNavigateToComponent,
  className = "" 
}: ReportsProps) {
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
    componentName: 'DataSourceReports',
    dataSourceId: dataSource.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // State management
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showCreateReport, setShowCreateReport] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("reports")
  const [filterType, setFilterType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Backend data queries - Real API integration
  const { 
    data: reportsData, 
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports 
  } = useQuery({
    queryKey: ['reports', dataSource.id, filterType, searchQuery, sortBy, sortOrder],
    queryFn: () => reportsApi.getReports(dataSource.id, {
      type: filterType !== 'all' ? filterType : undefined,
      search: searchQuery || undefined,
      sortBy,
      sortOrder
    }),
    enabled: dataSourcePermissions.canViewReports,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000
  })

  const { 
    data: templatesData, 
    isLoading: templatesLoading 
  } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => reportsApi.getReportTemplates(),
    enabled: dataSourcePermissions.canGenerateReports,
    staleTime: 300000 // 5 minutes
  })

  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['report-stats', dataSource.id],
    queryFn: () => reportsApi.getReportStats(dataSource.id),
    enabled: dataSourcePermissions.canViewReports,
    staleTime: 60000
  })

  // Transform backend data to component format
  const reports: Report[] = useMemo(() => {
    if (!reportsData?.data?.reports) return []
    
    return reportsData.data.reports.map((report: any) => ({
      id: report.id,
      name: report.name,
      type: report.report_type || 'performance',
      status: report.status || 'completed',
      format: report.format || 'pdf',
      createdAt: report.created_at,
      generatedAt: report.generated_at,
      scheduledAt: report.scheduled_at,
      creator: report.created_by || 'System',
      description: report.description || '',
      size: report.file_size || 0,
      downloadUrl: report.download_url || '',
      isScheduled: report.is_scheduled || false,
      scheduleExpression: report.schedule_expression,
      parameters: report.parameters || {},
      tags: report.tags || [],
      priority: report.priority || 'medium',
      estimatedDuration: report.estimated_duration,
      progress: report.progress,
      errorMessage: report.error_message
    }))
  }, [reportsData])

  const templates: ReportTemplate[] = useMemo(() => {
    if (!templatesData?.data?.templates) return []
    
    return templatesData.data.templates.map((template: any) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      format: template.format,
      parameters: template.parameters || {},
      isActive: template.is_active,
      category: template.category
    }))
  }, [templatesData])

  const stats: ReportStats = useMemo(() => {
    if (!statsData?.data?.stats) return {
      totalReports: 0,
      completedReports: 0,
      failedReports: 0,
      scheduledReports: 0,
      totalSizeMB: 0,
      avgGenerationTime: 0,
      successRate: 0,
      mostUsedType: 'none'
    }
    
    const statsInfo = statsData.data.stats
    return {
      totalReports: statsInfo.total_reports || 0,
      completedReports: statsInfo.completed_reports || 0,
      failedReports: statsInfo.failed_reports || 0,
      scheduledReports: statsInfo.scheduled_reports || 0,
      totalSizeMB: statsInfo.total_size_mb || 0,
      avgGenerationTime: statsInfo.avg_generation_time_minutes || 0,
      successRate: statsInfo.success_rate_percentage || 0,
      mostUsedType: statsInfo.most_used_type || 'none'
    }
  }, [statsData])

  // Mutations for report operations
  const createReportMutation = useMutation({
    mutationFn: (reportData: any) => reportsApi.createReport(dataSource.id, reportData),
    onSuccess: () => {
      toast.success('Report created successfully')
      queryClient.invalidateQueries({ queryKey: ['reports', dataSource.id] })
      logUserAction('report_created', 'datasource', dataSource.id)
      setShowCreateReport(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to create report: ${error.message}`)
      logUserAction('report_creation_failed', 'datasource', dataSource.id, { error: error.message })
    }
  })

  const generateReportMutation = useMutation({
    mutationFn: (reportId: string) => reportsApi.generateReport(dataSource.id, reportId),
    onSuccess: () => {
      toast.success('Report generation started')
      queryClient.invalidateQueries({ queryKey: ['reports', dataSource.id] })
      logUserAction('report_generation_started', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to generate report: ${error.message}`)
    }
  })

  const cancelReportMutation = useMutation({
    mutationFn: (reportId: string) => reportsApi.cancelReport(dataSource.id, reportId),
    onSuccess: () => {
      toast.success('Report cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['reports', dataSource.id] })
      logUserAction('report_cancelled', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel report: ${error.message}`)
    }
  })

  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => reportsApi.deleteReport(dataSource.id, reportId),
    onSuccess: () => {
      toast.success('Report deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['reports', dataSource.id] })
      logUserAction('report_deleted', 'datasource', dataSource.id)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete report: ${error.message}`)
    }
  })

  const scheduleReportMutation = useMutation({
    mutationFn: ({ reportId, schedule }: { reportId: string; schedule: any }) => 
      reportsApi.scheduleReport(dataSource.id, reportId, schedule),
    onSuccess: () => {
      toast.success('Report scheduled successfully')
      queryClient.invalidateQueries({ queryKey: ['reports', dataSource.id] })
      logUserAction('report_scheduled', 'datasource', dataSource.id)
      setShowScheduleDialog(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to schedule report: ${error.message}`)
    }
  })

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50"
      case "generating": return "text-yellow-600 bg-yellow-50"
      case "failed": return "text-red-600 bg-red-50"
      case "draft": return "text-gray-600 bg-gray-50"
      case "scheduled": return "text-blue-600 bg-blue-50"
      case "cancelled": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance": return BarChart3
      case "security": return Shield
      case "compliance": return FileText
      case "usage": return PieChart
      case "analytics": return LineChart
      case "audit": return Eye
      case "lineage": return Activity
      default: return FileText
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf": return FilePdf
      case "csv": return FileSpreadsheet
      case "xlsx": return FileSpreadsheet
      case "json": return FileText
      case "html": return FileText
      case "xml": return FileText
      default: return FileText
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
  }

  const handleDownloadReport = async (report: Report) => {
    try {
      const blob = await reportsApi.downloadReport(dataSource.id, report.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.name}.${report.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      logUserAction('report_downloaded', 'datasource', dataSource.id, { reportId: report.id })
    } catch (error: any) {
      toast.error(`Failed to download report: ${error.message}`)
    }
  }

  // Handle loading states
  if (rbacLoading || reportsLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Reports</CardTitle>
          </div>
          <CardDescription>
            Generate and manage data source reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  // Handle no permissions
  if (!dataSourcePermissions.canViewReports) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Reports</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to view reports for this data source.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and manage data source reports
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchReports()}
              disabled={reportsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${reportsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.GENERATE_REPORTS}>
              <Button onClick={() => setShowCreateReport(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {/* Filters and Search */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="lineage">Lineage</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('_')
                  setSortBy(field)
                  setSortOrder(order as "asc" | "desc")
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt_desc">Newest First</SelectItem>
                    <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                    <SelectItem value="name_asc">Name A-Z</SelectItem>
                    <SelectItem value="name_desc">Name Z-A</SelectItem>
                    <SelectItem value="size_desc">Largest First</SelectItem>
                    <SelectItem value="size_asc">Smallest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {reportsError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load reports: {reportsError.message}
                </AlertDescription>
              </Alert>
            )}
            
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-500 mb-4">Create your first report to see it here</p>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.GENERATE_REPORTS}>
                  <Button onClick={() => setShowCreateReport(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </PermissionGuard>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => {
                  const TypeIcon = getTypeIcon(report.type)
                  const FormatIcon = getFormatIcon(report.format)
                  
                  return (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{report.name}</span>
                          </div>
                          <Badge className={getStatusColor(report.status)} variant="secondary">
                            {report.status}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <FormatIcon className="h-3 w-3" />
                            {report.format.toUpperCase()}
                          </Badge>
                          {report.priority === 'high' || report.priority === 'critical' ? (
                            <Badge variant={report.priority === 'critical' ? 'destructive' : 'default'}>
                              {report.priority}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          {report.status === 'generating' && (
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.GENERATE_REPORTS}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelReportMutation.mutate(report.id)}
                                disabled={cancelReportMutation.isPending}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          )}
                          {report.status === 'draft' && (
                            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.GENERATE_REPORTS}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateReportMutation.mutate(report.id)}
                                disabled={generateReportMutation.isPending}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          )}
                          {report.status === 'completed' && report.downloadUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report)
                              setShowScheduleDialog(true)
                            }}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.GENERATE_REPORTS}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteReportMutation.mutate(report.id)}
                              disabled={deleteReportMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{formatFileSize(report.size)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>{report.creator}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{report.isScheduled ? 'Scheduled' : 'Manual'}</span>
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      )}

                      {report.status === 'generating' && report.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{report.progress}%</span>
                          </div>
                          <Progress value={report.progress} className="w-full" />
                        </div>
                      )}

                      {report.errorMessage && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{report.errorMessage}</AlertDescription>
                        </Alert>
                      )}

                      {report.tags && report.tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-sm text-gray-500">Tags:</span>
                          <div className="flex gap-1">
                            {report.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Report Templates</h3>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
                <p className="text-gray-500 mb-4">Templates will appear here when available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Format: {template.format.toUpperCase()}
                        </div>
                        <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.GENERATE_REPORTS}>
                          <Button
                            size="sm"
                            onClick={() => {
                              // Pre-fill create report form with template
                              setShowCreateReport(true)
                            }}
                          >
                            Use Template
                          </Button>
                        </PermissionGuard>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Scheduled Reports</h3>
            </div>

            {reports.filter(r => r.isScheduled).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled reports</h3>
                <p className="text-gray-500 mb-4">Set up automated report generation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.filter(r => r.isScheduled).map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{report.name}</span>
                        <Badge className={getStatusColor(report.status)} variant="secondary">
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Schedule:</span> {report.scheduleExpression || 'Daily'}
                      </div>
                      <div>
                        <span className="font-medium">Next Run:</span> {
                          report.scheduledAt 
                            ? new Date(report.scheduledAt).toLocaleString()
                            : 'Not scheduled'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Last Generated:</span> {
                          report.generatedAt 
                            ? new Date(report.generatedAt).toLocaleString()
                            : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold">{stats.totalReports}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Size</p>
                      <p className="text-2xl font-bold">{stats.totalSizeMB.toFixed(1)} MB</p>
                    </div>
                    <FileSpreadsheet className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Generation</p>
                      <p className="text-2xl font-bold">{stats.avgGenerationTime.toFixed(1)}m</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium text-green-600">
                        {stats.completedReports}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failed</span>
                      <span className="text-sm font-medium text-red-600">
                        {stats.failedReports}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scheduled</span>
                      <span className="text-sm font-medium text-blue-600">
                        {stats.scheduledReports}
                      </span>
                    </div>
                    <Progress 
                      value={stats.successRate} 
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most Used Type</span>
                      <span className="text-sm font-medium capitalize">
                        {stats.mostUsedType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage Used</span>
                      <span className="text-sm font-medium">
                        {stats.totalSizeMB.toFixed(1)} MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Size</span>
                      <span className="text-sm font-medium">
                        {stats.totalReports > 0 
                          ? (stats.totalSizeMB / stats.totalReports).toFixed(1) 
                          : '0'} MB
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Report Dialog */}
        <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Configure and create a new report for this data source
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input 
                  id="report-name" 
                  placeholder="Enter report name"
                  defaultValue={`${dataSource.name} Report ${new Date().toISOString().split('T')[0]}`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select defaultValue="performance">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="usage">Usage</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="lineage">Lineage</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="report-format">Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="report-priority">Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter report description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="schedule-report" />
                <Label htmlFor="schedule-report">Schedule this report</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateReport(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Get form data and create report
                  const formData = {
                    name: (document.getElementById('report-name') as HTMLInputElement)?.value,
                    type: 'performance', // Get from select
                    format: 'pdf', // Get from select
                    priority: 'medium', // Get from select
                    description: (document.getElementById('description') as HTMLTextAreaElement)?.value,
                    isScheduled: false // Get from switch
                  }
                  createReportMutation.mutate(formData)
                }}
                disabled={createReportMutation.isPending}
              >
                {createReportMutation.isPending && (
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Report Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Report</DialogTitle>
              <DialogDescription>
                Set up automated generation for this report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-frequency">Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom (Cron)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="schedule-time">Time</Label>
                <Input 
                  id="schedule-time" 
                  type="time"
                  defaultValue="09:00"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="schedule-enabled" defaultChecked />
                <Label htmlFor="schedule-enabled">Enable schedule</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedReport) {
                    scheduleReportMutation.mutate({
                      reportId: selectedReport.id,
                      schedule: {
                        frequency: 'daily',
                        time: '09:00',
                        enabled: true
                      }
                    })
                  }
                }}
                disabled={scheduleReportMutation.isPending}
              >
                {scheduleReportMutation.isPending && (
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                )}
                Schedule Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
