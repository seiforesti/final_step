"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Archive, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw,
  Calendar,
  Settings,
  Trash2,
  Eye,
  Shield,
  Database,
  HardDrive,
  Timer,
  Activity,
  TrendingUp,
  FileText,
  Zap,
  RefreshCw,
  Plus
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Import RBAC integration
import { useRBACIntegration, DATA_SOURCE_PERMISSIONS } from "./hooks/use-rbac-integration"

// Import enterprise hooks for backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"

interface BackupRestoreProps {
  dataSourceId: number
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface Backup {
  id: string
  name: string
  size: number
  status: "completed" | "in_progress" | "failed" | "scheduled" | "cancelled"
  createdAt: string
  completedAt?: string
  type: "full" | "incremental" | "differential"
  retentionDays: number
  location: string
  encryptionEnabled: boolean
  compressionRatio?: number
  creator: string
  metadata?: Record<string, any>
  duration?: number
  errorMessage?: string
}

interface BackupSchedule {
  id: string
  name: string
  type: "full" | "incremental" | "differential"
  cronExpression: string
  enabled: boolean
  retentionDays: number
  nextRun?: string
  lastRun?: string
  description?: string
}

interface BackupStats {
  totalBackups: number
  successfulBackups: number
  failedBackups: number
  totalSizeGB: number
  successRate: number
  averageDuration: number
  lastBackup?: string
  nextScheduledBackup?: string
}

// API functions for backup operations
const backupApi = {
  async getBackupStatus(dataSourceId: number) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backup-status`)
    if (!response.ok) throw new Error('Failed to fetch backup status')
    return response.json()
  },

  async startBackup(dataSourceId: number, backupData: any) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData)
    })
    if (!response.ok) throw new Error('Failed to start backup')
    return response.json()
  },

  async cancelBackup(dataSourceId: number, backupId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backups/${backupId}/cancel`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to cancel backup')
    return response.json()
  },

  async deleteBackup(dataSourceId: number, backupId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backups/${backupId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete backup')
    return response.json()
  },

  async restoreBackup(dataSourceId: number, backupId: string, options: any) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backups/${backupId}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })
    if (!response.ok) throw new Error('Failed to start restore')
    return response.json()
  },

  async getBackupSchedules(dataSourceId: number) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backup-schedules`)
    if (!response.ok) throw new Error('Failed to fetch backup schedules')
    return response.json()
  },

  async createSchedule(dataSourceId: number, schedule: any) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backup-schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    })
    if (!response.ok) throw new Error('Failed to create backup schedule')
    return response.json()
  },

  async updateSchedule(dataSourceId: number, scheduleId: string, schedule: any) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backup-schedules/${scheduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    })
    if (!response.ok) throw new Error('Failed to update backup schedule')
    return response.json()
  },

  async deleteSchedule(dataSourceId: number, scheduleId: string) {
    const response = await fetch(`/api/data-sources/${dataSourceId}/backup-schedules/${scheduleId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete backup schedule')
    return response.json()
  }
}

export function DataSourceBackupRestore({ 
  dataSourceId, 
  onNavigateToComponent, 
  className = "" 
}: BackupRestoreProps) {
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
    componentName: 'DataSourceBackupRestore',
    dataSourceId,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // State management
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [showCreateBackup, setShowCreateBackup] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("backups")

  // Backend data queries - Real API integration
  const { 
    data: backupStatusData, 
    isLoading: backupLoading,
    error: backupError,
    refetch: refetchBackups 
  } = useQuery({
    queryKey: ['backup-status', dataSourceId],
    queryFn: () => backupApi.getBackupStatus(dataSourceId),
    enabled: dataSourcePermissions.canManageBackup,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000
  })

  const { 
    data: schedulesData, 
    isLoading: schedulesLoading 
  } = useQuery({
    queryKey: ['backup-schedules', dataSourceId],
    queryFn: () => backupApi.getBackupSchedules(dataSourceId),
    enabled: dataSourcePermissions.canManageBackup,
    staleTime: 60000
  })

  // Transform backend data to component format
  const backups: Backup[] = useMemo(() => {
    if (!backupStatusData?.data?.backups) return []
    
    return backupStatusData.data.backups.map((backup: any) => ({
      id: backup.id,
      name: backup.name || `Backup ${backup.id}`,
      type: backup.type || 'full',
      status: backup.status,
      createdAt: backup.created_at,
      completedAt: backup.completed_at,
      size: backup.size_bytes || 0,
      duration: backup.duration_seconds || 0,
      location: backup.location || '',
      retentionDays: backup.retention_days || 30,
      encryptionEnabled: backup.encrypted || false,
      compressionRatio: backup.compression_ratio || 1.0,
      creator: backup.created_by || 'System',
      metadata: backup.metadata || {},
      errorMessage: backup.error_message
    }))
  }, [backupStatusData])

  const schedules: BackupSchedule[] = useMemo(() => {
    if (!schedulesData?.data?.schedules) return []
    
    return schedulesData.data.schedules.map((schedule: any) => ({
      id: schedule.id,
      name: schedule.name,
      type: schedule.backup_type,
      cronExpression: schedule.cron_expression,
      enabled: schedule.enabled,
      retentionDays: schedule.retention_days,
      nextRun: schedule.next_run,
      lastRun: schedule.last_run,
      description: schedule.description
    }))
  }, [schedulesData])

  const stats: BackupStats = useMemo(() => {
    if (!backupStatusData?.data?.stats) return {
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      totalSizeGB: 0,
      successRate: 0,
      averageDuration: 0
    }
    
    const statsData = backupStatusData.data.stats
    return {
      totalBackups: statsData.total_backups || 0,
      successfulBackups: statsData.successful_backups || 0,
      failedBackups: statsData.failed_backups || 0,
      totalSizeGB: statsData.total_size_gb || 0,
      successRate: statsData.success_rate || 0,
      averageDuration: statsData.average_duration_seconds || 0,
      lastBackup: backups[0]?.createdAt,
      nextScheduledBackup: schedules.find(s => s.enabled)?.nextRun
    }
  }, [backupStatusData, backups, schedules])

  // Mutations for backup operations
  const startBackupMutation = useMutation({
    mutationFn: (backupData: any) => backupApi.startBackup(dataSourceId, backupData),
    onSuccess: () => {
      toast.success('Backup started successfully')
      queryClient.invalidateQueries({ queryKey: ['backup-status', dataSourceId] })
      logUserAction('backup_started', 'datasource', dataSourceId)
      setShowCreateBackup(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to start backup: ${error.message}`)
      logUserAction('backup_start_failed', 'datasource', dataSourceId, { error: error.message })
    }
  })

  const cancelBackupMutation = useMutation({
    mutationFn: (backupId: string) => backupApi.cancelBackup(dataSourceId, backupId),
    onSuccess: () => {
      toast.success('Backup cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['backup-status', dataSourceId] })
      logUserAction('backup_cancelled', 'datasource', dataSourceId)
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel backup: ${error.message}`)
    }
  })

  const deleteBackupMutation = useMutation({
    mutationFn: (backupId: string) => backupApi.deleteBackup(dataSourceId, backupId),
    onSuccess: () => {
      toast.success('Backup deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['backup-status', dataSourceId] })
      logUserAction('backup_deleted', 'datasource', dataSourceId)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete backup: ${error.message}`)
    }
  })

  const restoreBackupMutation = useMutation({
    mutationFn: ({ backupId, options }: { backupId: string; options: any }) => 
      backupApi.restoreBackup(dataSourceId, backupId, options),
    onSuccess: () => {
      toast.success('Restore started successfully')
      logUserAction('backup_restore_started', 'datasource', dataSourceId)
      setShowRestoreDialog(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to start restore: ${error.message}`)
    }
  })

  const createScheduleMutation = useMutation({
    mutationFn: (schedule: any) => backupApi.createSchedule(dataSourceId, schedule),
    onSuccess: () => {
      toast.success('Backup schedule created successfully')
      queryClient.invalidateQueries({ queryKey: ['backup-schedules', dataSourceId] })
      logUserAction('backup_schedule_created', 'datasource', dataSourceId)
      setShowScheduleDialog(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to create schedule: ${error.message}`)
    }
  })

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50"
      case "in_progress": return "text-yellow-600 bg-yellow-50"
      case "failed": return "text-red-600 bg-red-50"
      case "scheduled": return "text-blue-600 bg-blue-50"
      case "cancelled": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
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
  if (rbacLoading || backupLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            <CardTitle>Backup & Restore</CardTitle>
          </div>
          <CardDescription>
            Manage data source backups and restore operations
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
  if (!dataSourcePermissions.canManageBackup) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            <CardTitle>Backup & Restore</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to manage backups for this data source.
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
            <Archive className="h-5 w-5" />
            <div>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>
                Manage data source backups and restore operations
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchBackups()}
              disabled={backupLoading}
            >
              <RefreshCw className={`h-4 w-4 ${backupLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP}>
              <Button onClick={() => setShowCreateBackup(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start Backup
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="backups" className="space-y-4">
            {backupError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load backup data: {backupError.message}
                </AlertDescription>
              </Alert>
            )}
            
            {backups.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
                <p className="text-gray-500 mb-4">Start your first backup to see it here</p>
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP}>
                  <Button onClick={() => setShowCreateBackup(true)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Backup
                  </Button>
                </PermissionGuard>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {backup.type === 'full' ? (
                            <Database className="h-4 w-4 text-blue-500" />
                          ) : (
                            <HardDrive className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-medium">{backup.name}</span>
                        </div>
                        <Badge className={getStatusColor(backup.status)} variant="secondary">
                          {backup.status}
                        </Badge>
                        <Badge variant="outline">{backup.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {backup.status === 'in_progress' && (
                          <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelBackupMutation.mutate(backup.id)}
                              disabled={cancelBackupMutation.isPending}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        )}
                        {backup.status === 'completed' && (
                          <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBackup(backup.id)
                                setShowRestoreDialog(true)
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        )}
                        <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBackupMutation.mutate(backup.id)}
                            disabled={deleteBackupMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{formatFileSize(backup.size)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{backup.duration ? formatDuration(backup.duration) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(backup.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        <span>{backup.retentionDays} days</span>
                      </div>
                    </div>

                    {backup.status === 'in_progress' && (
                      <div className="mt-3">
                        <Progress value={65} className="w-full" />
                        <p className="text-sm text-gray-500 mt-1">Processing...</p>
                      </div>
                    )}

                    {backup.errorMessage && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{backup.errorMessage}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Backup Schedules</h3>
              <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP}>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </PermissionGuard>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules configured</h3>
                <p className="text-gray-500 mb-4">Set up automated backup schedules</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{schedule.name}</span>
                        <Badge variant={schedule.enabled ? "default" : "secondary"}>
                          {schedule.enabled ? "Active" : "Disabled"}
                        </Badge>
                        <Badge variant="outline">{schedule.type}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Schedule:</span> {schedule.cronExpression}
                      </div>
                      <div>
                        <span className="font-medium">Next Run:</span> {
                          schedule.nextRun 
                            ? new Date(schedule.nextRun).toLocaleString()
                            : 'Not scheduled'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Last Run:</span> {
                          schedule.lastRun 
                            ? new Date(schedule.lastRun).toLocaleString()
                            : 'Never'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Retention:</span> {schedule.retentionDays} days
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
                      <p className="text-sm font-medium text-gray-600">Total Backups</p>
                      <p className="text-2xl font-bold">{stats.totalBackups}</p>
                    </div>
                    <Archive className="h-8 w-8 text-blue-500" />
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
                      <p className="text-2xl font-bold">{stats.totalSizeGB.toFixed(1)} GB</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                      <p className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</p>
                    </div>
                    <Timer className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="text-sm font-medium">
                        {stats.lastBackup 
                          ? new Date(stats.lastBackup).toLocaleString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Next Scheduled</span>
                      <span className="text-sm font-medium">
                        {stats.nextScheduledBackup 
                          ? new Date(stats.nextScheduledBackup).toLocaleString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Backup Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Successful</span>
                      <span className="text-sm font-medium text-green-600">
                        {stats.successfulBackups}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failed</span>
                      <span className="text-sm font-medium text-red-600">
                        {stats.failedBackups}
                      </span>
                    </div>
                    <Progress 
                      value={stats.successRate} 
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure default backup settings and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PermissionGuard permission={DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-backup">Automatic Backups</Label>
                        <p className="text-sm text-gray-500">
                          Enable automatic backup scheduling
                        </p>
                      </div>
                      <Switch id="auto-backup" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="encryption">Encryption</Label>
                        <p className="text-sm text-gray-500">
                          Encrypt backup files at rest
                        </p>
                      </div>
                      <Switch id="encryption" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="compression">Compression</Label>
                        <p className="text-sm text-gray-500">
                          Compress backup files to save space
                        </p>
                      </div>
                      <Switch id="compression" defaultChecked />
                    </div>
                  </div>
                </PermissionGuard>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Backup Dialog */}
        <Dialog open={showCreateBackup} onOpenChange={setShowCreateBackup}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Start New Backup</DialogTitle>
              <DialogDescription>
                Configure and start a new backup operation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-name">Backup Name</Label>
                <Input 
                  id="backup-name" 
                  placeholder="Enter backup name"
                  defaultValue={`Backup ${new Date().toISOString().split('T')[0]}`}
                />
              </div>
              
              <div>
                <Label htmlFor="backup-type">Backup Type</Label>
                <Select defaultValue="full">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Backup</SelectItem>
                    <SelectItem value="incremental">Incremental Backup</SelectItem>
                    <SelectItem value="differential">Differential Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="retention">Retention Period (days)</Label>
                <Input 
                  id="retention" 
                  type="number" 
                  defaultValue="30"
                  min="1"
                  max="365"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter backup description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateBackup(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const form = document.querySelector('form') as HTMLFormElement
                  const formData = new FormData(form)
                  startBackupMutation.mutate({
                    name: formData.get('backup-name'),
                    type: formData.get('backup-type'),
                    retention_days: parseInt(formData.get('retention') as string),
                    description: formData.get('description')
                  })
                }}
                disabled={startBackupMutation.isPending}
              >
                {startBackupMutation.isPending && (
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                )}
                Start Backup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restore Dialog */}
        <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Restore from Backup</DialogTitle>
              <DialogDescription>
                Restore data from the selected backup
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This operation will overwrite existing data. Please ensure you have a recent backup before proceeding.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="restore-target">Restore Target</Label>
                <Select defaultValue="original">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original Location</SelectItem>
                    <SelectItem value="new">New Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="verify-restore" defaultChecked />
                <Label htmlFor="verify-restore">Verify data integrity after restore</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedBackup) {
                    restoreBackupMutation.mutate({
                      backupId: selectedBackup,
                      options: {
                        target: 'original',
                        verify: true
                      }
                    })
                  }
                }}
                disabled={restoreBackupMutation.isPending}
              >
                {restoreBackupMutation.isPending && (
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                )}
                Start Restore
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}