"use client"

import { useState } from "react"
import { Database, Activity, TrendingUp, Clock, AlertTriangle, CheckCircle, Eye, BarChart3, Zap, Target, HardDrive, Network, Settings } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

import { DataSource } from "./types"
import { 
  useDataSourceQuery,
  useDataSourceStatsQuery,
  useDataSourceHealthQuery 
} from "./services/apis"

interface DataSourceOverviewProps {
  dataSourceId: number
  onEdit: (dataSource: DataSource) => void
  onDelete: (id: number) => void
  onTestConnection: (id: number) => Promise<any>
  onStartScan: (id: number) => void
}

export function DataSourceOverview({
  dataSourceId,
  onTestConnection
}: DataSourceOverviewProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null)

  // Fetch data source details, stats, and health
  const { 
    data: dataSource, 
    isLoading: isLoadingDataSource, 
    error: dataSourceError
  } = useDataSourceQuery(dataSourceId, { enabled: !!dataSourceId })

  const { 
    data: stats, 
    isLoading: isLoadingStats
  } = useDataSourceStatsQuery(dataSourceId, { enabled: !!dataSourceId })

  const { 
    data: health, 
    isLoading: isLoadingHealth
  } = useDataSourceHealthQuery(dataSourceId, { enabled: !!dataSourceId })

  const handleTestConnection = async () => {
    if (!dataSource) return
    
    setIsTestingConnection(true)
    try {
      const result = await onTestConnection(dataSource.id)
      setConnectionTestResult(result)
    } catch (error) {
      setConnectionTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsTestingConnection(false)
    }
  }


  if (isLoadingDataSource) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (dataSourceError || !dataSource) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load data source overview. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-red-500'
      case 'maintenance': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{dataSource.name}</h1>
            <p className="text-muted-foreground">{dataSource.description || 'No description available'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(dataSource.status)}
          <Badge variant={dataSource.status === 'active' ? 'default' : 'secondary'}>
            {dataSource.status}
          </Badge>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(dataSource.status)}`} />
              <span className="text-sm font-medium capitalize">{dataSource.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Volume</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.size_stats?.total_size_formatted || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.entity_stats?.tables || 0} tables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.latency_ms ? `${health.latency_ms}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.metrics?.health_score ? `${health.metrics.health_score}%` : 'N/A'}
            </div>
            <Progress 
              value={health?.metrics?.health_score || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Type:</span>
                    <p className="font-medium">{dataSource.source_type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Location:</span>
                    <p className="font-medium capitalize">{dataSource.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Host:</span>
                    <p className="font-medium">{dataSource.host}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Port:</span>
                    <p className="font-medium">{dataSource.port}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Database:</span>
                    <p className="font-medium">{dataSource.database_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Username:</span>
                    <p className="font-medium">{dataSource.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Connection Test</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                
                {connectionTestResult && (
                  <Alert variant={connectionTestResult.success ? "default" : "destructive"}>
                    {connectionTestResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {connectionTestResult.success 
                        ? 'Connection test successful!' 
                        : `Connection failed: ${connectionTestResult.error}`
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingHealth ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Error Rate</span>
                        <span>{health?.metrics?.error_rate || 0}%</span>
                      </div>
                      <Progress value={health?.metrics?.error_rate || 0} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uptime</span>
                        <span>{health?.metrics?.uptime || 0}%</span>
                      </div>
                      <Progress value={health?.metrics?.uptime || 0} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Used</span>
                        <span>{health?.metrics?.storage_used || 0}%</span>
                      </div>
                      <Progress value={health?.metrics?.storage_used || 0} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Tables:</span>
                      <span className="font-medium">{stats?.entity_stats?.tables || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Entities:</span>
                      <span className="font-medium">{stats?.entity_stats?.total_entities || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Scan:</span>
                      <span className="font-medium">
                        {stats?.last_scan_time ? new Date(stats.last_scan_time).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data Size:</span>
                      <span className="font-medium">
                        {stats?.size_stats?.total_size_formatted || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuration Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Connection Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connection Pool Size:</span>
                      <span>{dataSource.connection_pool_size || 'Default'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <span>30s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SSL Enabled:</span>
                      <span>No</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Metadata</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(dataSource.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(dataSource.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tags:</span>
                      <span>{dataSource.tags?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity recorded</p>
                <p className="text-sm">Activity will appear here as you interact with the data source</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
