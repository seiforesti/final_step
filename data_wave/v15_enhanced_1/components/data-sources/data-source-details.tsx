"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Database, Play, Pause, Edit, Trash2, RefreshCw, Settings, Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Clock, Shield, FileText, HardDrive, Users, Star, ExternalLink, Download, Copy, MoreHorizontal, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

import { DataSource } from "./types"
import { 
  useDataSourceQuery,
  useDataSourceStatsQuery,
  useDataSourceHealthQuery 
} from "./services/apis"
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace"
import { Eye, GitBranch } from "lucide-react"

interface DataSourceDetailsProps {
  dataSourceId: number
  onEdit: (dataSource: DataSource) => void
  onDelete: (id: number) => void
  onTestConnection: (id: number) => Promise<any>
  onStartScan: (id: number) => void
}

export function DataSourceDetails({
  dataSourceId,
  onEdit,
  onDelete,
  onTestConnection,
  onStartScan
}: DataSourceDetailsProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null)
  const [showDiscovery, setShowDiscovery] = useState(false)

  // Fetch data source details, stats, and health
  const { 
    data: dataSource, 
    isLoading: isLoadingDataSource, 
    error: dataSourceError,
    refetch: refetchDataSource 
  } = useDataSourceQuery(dataSourceId)

  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    error: statsError,
    refetch: refetchStats 
  } = useDataSourceStatsQuery(dataSourceId)

  const { 
    data: health, 
    isLoading: isLoadingHealth, 
    error: healthError,
    refetch: refetchHealth 
  } = useDataSourceHealthQuery(dataSourceId)

  const isLoading = isLoadingDataSource || isLoadingStats || isLoadingHealth
  const hasError = dataSourceError || statsError || healthError

  const handleTestConnection = async () => {
    if (!dataSource) return
    
    setIsTestingConnection(true)
    try {
      const result = await onTestConnection(dataSource.id)
      setConnectionTestResult(result)
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: "Connection test failed",
        error: error
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleRefresh = () => {
    refetchDataSource()
    refetchStats()
    refetchHealth()
  }

  const handleStartDiscovery = () => {
    setShowDiscovery(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Activity className="h-5 w-5 text-yellow-500" />
      case "syncing":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case "maintenance":
        return <Settings className="h-5 w-5 text-orange-500" />
      default:
        return <Database className="h-5 w-5 text-gray-500" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load data source details. Please try again later.
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading || !dataSource) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {getStatusIcon(dataSource.status || 'pending')}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{dataSource.name}</h1>
                <p className="text-muted-foreground">
                  {dataSource.source_type.toUpperCase()} • {dataSource.host}:{dataSource.port}
                  {dataSource.database_name && ` • ${dataSource.database_name}`}
                </p>
              </div>
            </div>
            {dataSource.description && (
              <p className="text-muted-foreground max-w-2xl">{dataSource.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(dataSource)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTestConnection} disabled={isTestingConnection}>
                  <Activity className="h-4 w-4 mr-2" />
                  Test Connection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStartScan(dataSource.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Scan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStartDiscovery}>
                  <Eye className="h-4 w-4 mr-2" />
                  Start Discovery
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Connection String
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(dataSource.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Data Source
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status and Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(dataSource.status || 'pending')}
                <Badge variant={dataSource.status === 'active' ? 'default' : dataSource.status === 'error' ? 'destructive' : 'secondary'}>
                  {dataSource.status || 'pending'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(dataSource.updated_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">
                  {dataSource.health_score || 0}%
                </div>
                <Progress value={dataSource.health_score || 0} className="flex-1" />
              </div>
              {health && (
                <p className={`text-xs mt-2 ${getHealthColor(health.status)}`}>
                  {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">
                  {dataSource.compliance_score || 0}%
                </div>
                <Progress value={dataSource.compliance_score || 0} className="flex-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {dataSource.data_classification || 'Not classified'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dataSource.entity_count || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Size: {dataSource.size_gb ? `${dataSource.size_gb}GB` : 'Unknown'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Connection Test Result */}
        {connectionTestResult && (
          <Alert variant={connectionTestResult.success ? "default" : "destructive"}>
            {connectionTestResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              {connectionTestResult.message}
              {connectionTestResult.connection_time_ms && (
                <span className="ml-2">({connectionTestResult.connection_time_ms}ms)</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Information */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Entity Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Entity Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Entities</span>
                        <span className="font-medium">{stats.entity_stats.total_entities.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tables</span>
                        <span className="font-medium">{stats.entity_stats.tables.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Views</span>
                        <span className="font-medium">{stats.entity_stats.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stored Procedures</span>
                        <span className="font-medium">{stats.entity_stats.stored_procedures.toLocaleString()}</span>
                      </div>
                      {stats.last_scan_time && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Last Scan</span>
                            <span>{new Date(stats.last_scan_time).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No statistics available</p>
                  )}
                </CardContent>
              </Card>

              {/* Data Classification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Data Classification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.classification_stats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Classified Columns</span>
                        <span className="font-medium">{stats.classification_stats.classified_columns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sensitive Columns</span>
                        <span className="font-medium">{stats.classification_stats.sensitive_columns}</span>
                      </div>
                      {stats.sensitivity_stats && (
                        <>
                          <div className="flex justify-between">
                            <span>PII Columns</span>
                            <span className="font-medium">{stats.sensitivity_stats.pii_columns || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Financial Columns</span>
                            <span className="font-medium">{stats.sensitivity_stats.financial_columns || 0}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No classification data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Health Issues */}
            {health?.issues && health.issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Health Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {health.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          issue.severity === 'critical' ? 'bg-red-500' :
                          issue.severity === 'high' ? 'bg-orange-500' :
                          issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{issue.message}</p>
                          {issue.recommendation && (
                            <p className="text-sm text-muted-foreground mt-1">{issue.recommendation}</p>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {issue.type} • {issue.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <span className="font-medium">{dataSource.avg_response_time || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate</span>
                      <span className="font-medium">{((dataSource.error_rate || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime</span>
                      <span className="font-medium">{dataSource.uptime_percentage || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queries per Second</span>
                      <span className="font-medium">{(dataSource.queries_per_second || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Active Connections</span>
                      <span className="font-medium">{dataSource.active_connections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection Pool Size</span>
                      <span className="font-medium">{dataSource.connection_pool_size || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Used</span>
                      <span className="font-medium">{dataSource.storage_used_percentage || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Cost</span>
                      <span className="font-medium">${(dataSource.cost_per_month || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Encryption Enabled</span>
                      <Badge variant={dataSource.encryption_enabled ? "default" : "destructive"}>
                        {dataSource.encryption_enabled ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Backup Enabled</span>
                      <Badge variant={dataSource.backup_enabled ? "default" : "secondary"}>
                        {dataSource.backup_enabled ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Monitoring Enabled</span>
                      <Badge variant={dataSource.monitoring_enabled ? "default" : "secondary"}>
                        {dataSource.monitoring_enabled ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Classification</span>
                      <Badge variant="outline">{dataSource.data_classification || 'Not set'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Owner</span>
                      <span className="font-medium">{dataSource.owner || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team</span>
                      <span className="font-medium">{dataSource.team || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment</span>
                      <Badge variant={dataSource.environment === 'production' ? 'destructive' : 'secondary'}>
                        {dataSource.environment || 'Not set'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Criticality</span>
                      <Badge variant={dataSource.criticality === 'critical' ? 'destructive' : 'default'}>
                        {dataSource.criticality || 'Not set'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Host</label>
                      <p className="font-mono">{dataSource.host}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Port</label>
                      <p className="font-mono">{dataSource.port}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Username</label>
                      <p className="font-mono">{dataSource.username}</p>
                    </div>
                    {dataSource.database_name && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Database</label>
                        <p className="font-mono">{dataSource.database_name}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Source Type</label>
                      <p>{dataSource.source_type.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p>{dataSource.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Scan Frequency</label>
                      <p>{dataSource.scan_frequency || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p>{new Date(dataSource.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {dataSource.tags && dataSource.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dataSource.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Data Discovery Workspace */}
      <DataDiscoveryWorkspace
        dataSource={dataSource}
        isOpen={showDiscovery}
        onClose={() => setShowDiscovery(false)}
      />
    </>
  )
}
