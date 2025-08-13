// ============================================================================
// ENTERPRISE BACKEND API INTEGRATION - COMPREHENSIVE BACKEND BINDING
// ============================================================================

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { z } from 'zod'

// Import all existing APIs
export * from './apis'

// Import types from backend models
import {
  DataSource,
  DataSourceCreateParams,
  DataSourceUpdateParams,
  DataSourceFilters,
  DataSourceStats,
  DataSourceHealth,
  ConnectionTestResult,
  ApiResponse,
  PaginatedResponse
} from '../types'

// ============================================================================
// EXTENDED API CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const enterpriseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for enterprise operations
})

// Enhanced request interceptor with enterprise features
enterpriseApi.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add request tracking
  config.metadata = {
    startTime: Date.now(),
    requestId: Math.random().toString(36).substr(2, 9)
  }
  
  // Add enterprise headers
  config.headers['X-Client-Version'] = '1.0.0'
  config.headers['X-Feature-Set'] = 'enterprise'
  
  return config
})

// Enhanced response interceptor with enterprise error handling
enterpriseApi.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata?.startTime
    response.config.metadata = {
      ...response.config.metadata,
      duration,
      success: true
    }
    
    // Emit telemetry event
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('api:request:completed', {
        url: response.config.url,
        method: response.config.method,
        duration,
        status: response.status,
        success: true
      })
    }
    
    return response
  },
  (error) => {
    // Calculate request duration
    const duration = Date.now() - error.config?.metadata?.startTime
    
    // Enhanced error handling
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      duration,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code,
      details: error.response?.data?.details,
      success: false
    }
    
    // Emit telemetry event
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('api:request:failed', errorDetails)
    }
    
    // Log enterprise-grade error details
    console.error('Enterprise API Error:', errorDetails)
    
    return Promise.reject(error)
  }
)

// ============================================================================
// SECURITY & COMPLIANCE APIs
// ============================================================================

export interface SecurityAuditRequest {
  data_source_id: number
  scan_type?: 'vulnerability' | 'compliance' | 'penetration' | 'full'
  include_recommendations?: boolean
}

export interface SecurityAuditResponse {
  security_score: number
  last_scan: string | null
  vulnerabilities: SecurityVulnerability[]
  controls: SecurityControl[]
  recent_scans: SecurityScan[]
  incidents: SecurityIncident[]
  recommendations: string[]
  compliance_frameworks: ComplianceFramework[]
}

export interface SecurityVulnerability {
  id: number
  data_source_id: number
  name: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'false_positive'
  cve_id?: string
  cvss_score?: number
  remediation?: string
  affected_components: string[]
  discovered_at: string
  last_updated: string
  resolved_at?: string
  assigned_to?: string
}

export interface SecurityControl {
  id: number
  data_source_id: number
  name: string
  description: string
  category: string
  framework: string
  control_id: string
  status: 'enabled' | 'disabled' | 'partial' | 'not_applicable'
  compliance_status: string
  implementation_notes?: string
  last_assessed?: string
  next_assessment?: string
  assessor?: string
}

export interface SecurityScan {
  id: number
  data_source_id: number
  scan_type: string
  scan_tool: string
  status: string
  vulnerabilities_found: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  started_at?: string
  completed_at?: string
  duration_seconds?: number
}

export interface SecurityIncident {
  id: number
  data_source_id: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  status: string
  assigned_to?: string
  reporter?: string
  occurred_at: string
  detected_at?: string
  resolved_at?: string
  impact_assessment?: string
  affected_systems: string[]
  response_actions: string[]
}

export interface ComplianceFramework {
  framework: string
  score: number
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed'
  requirements_total: number
  requirements_compliant: number
  last_assessment?: string
}

// Security APIs
export const getSecurityAudit = async (data_source_id: number): Promise<SecurityAuditResponse> => {
  const { data } = await enterpriseApi.get(`/security/audit/${data_source_id}`)
  return data
}

export const createSecurityScan = async (request: SecurityAuditRequest): Promise<SecurityScan> => {
  const { data } = await enterpriseApi.post('/security/scans', request)
  return data
}

export const updateSecurityVulnerability = async (
  vulnerability_id: number, 
  updates: Partial<SecurityVulnerability>
): Promise<SecurityVulnerability> => {
  const { data } = await enterpriseApi.put(`/security/vulnerabilities/${vulnerability_id}`, updates)
  return data
}

// ============================================================================
// PERFORMANCE & ANALYTICS APIs
// ============================================================================

export interface PerformanceMetricsRequest {
  data_source_id: number
  time_range?: '1h' | '6h' | '24h' | '7d' | '30d'
  metric_types?: ('response_time' | 'throughput' | 'error_rate' | 'cpu_usage' | 'memory_usage')[]
}

export interface PerformanceMetricsResponse {
  overall_score: number
  metrics: PerformanceMetric[]
  alerts: PerformanceAlert[]
  trends: Record<string, any>
  recommendations: string[]
}

export interface PerformanceMetric {
  id: number
  data_source_id: number
  metric_type: string
  value: number
  unit: string
  threshold?: number
  status: 'good' | 'warning' | 'critical' | 'unknown'
  trend: string
  previous_value?: number
  change_percentage?: number
  measurement_time: string
  time_range: string
  metadata: Record<string, any>
}

export interface PerformanceAlert {
  id: number
  data_source_id: number
  metric_id: number
  alert_type: string
  severity: string
  title: string
  description: string
  status: string
  acknowledged_by?: string
  acknowledged_at?: string
  resolved_at?: string
  created_at: string
}

// Performance APIs
export const getPerformanceMetrics = async (request: PerformanceMetricsRequest): Promise<PerformanceMetricsResponse> => {
  const params = new URLSearchParams()
  if (request.time_range) params.append('time_range', request.time_range)
  if (request.metric_types) request.metric_types.forEach(type => params.append('metric_types', type))
  
  const { data } = await enterpriseApi.get(`/performance/metrics/${request.data_source_id}?${params.toString()}`)
  return data
}

export const createPerformanceMetric = async (metric: Omit<PerformanceMetric, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceMetric> => {
  const { data } = await enterpriseApi.post('/performance/metrics', metric)
  return data
}

export const acknowledgePerformanceAlert = async (alert_id: number, user_id: string): Promise<PerformanceAlert> => {
  const { data } = await enterpriseApi.post(`/performance/alerts/${alert_id}/acknowledge`, { user_id })
  return data
}

// ============================================================================
// BACKUP & RESTORE APIs
// ============================================================================

export interface BackupStatusResponse {
  recent_backups: BackupOperation[]
  scheduled_backups: BackupSchedule[]
  backup_statistics: Record<string, any>
  storage_usage: Record<string, any>
  recommendations: string[]
}

export interface BackupOperation {
  id: number
  data_source_id: number
  backup_type: 'full' | 'incremental' | 'differential' | 'snapshot' | 'transaction_log'
  backup_name: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  backup_size_bytes?: number
  backup_location?: string
  compression_ratio?: number
  created_by?: string
  created_at: string
}

export interface BackupSchedule {
  id: number
  data_source_id: number
  schedule_name: string
  backup_type: 'full' | 'incremental' | 'differential' | 'snapshot' | 'transaction_log'
  cron_expression: string
  is_enabled: boolean
  retention_days: number
  max_backups: number
  next_run?: string
  last_run?: string
  created_by?: string
  created_at: string
}

export interface RestoreOperation {
  id: number
  data_source_id: number
  backup_id: number
  restore_name: string
  description?: string
  target_location?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  progress_percentage: number
  created_by?: string
  created_at: string
}

// Backup APIs
export const getBackupStatus = async (data_source_id: number): Promise<BackupStatusResponse> => {
  const { data } = await enterpriseApi.get(`/backups/status/${data_source_id}`)
  return data
}

export const createBackup = async (backup: Omit<BackupOperation, 'id' | 'status' | 'created_at'>): Promise<BackupOperation> => {
  const { data } = await enterpriseApi.post('/backups', backup)
  return data
}

export const createBackupSchedule = async (schedule: Omit<BackupSchedule, 'id' | 'created_at'>): Promise<BackupSchedule> => {
  const { data } = await enterpriseApi.post('/backups/schedules', schedule)
  return data
}

export const createRestoreOperation = async (restore: Omit<RestoreOperation, 'id' | 'status' | 'progress_percentage' | 'created_at'>): Promise<RestoreOperation> => {
  const { data } = await enterpriseApi.post('/restores', restore)
  return data
}

// ============================================================================
// TASK MANAGEMENT APIs
// ============================================================================

export interface TaskResponse {
  id: number
  data_source_id?: number
  name: string
  description?: string
  task_type: 'scan' | 'backup' | 'cleanup' | 'sync' | 'report' | 'maintenance'
  cron_expression: string
  is_enabled: boolean
  next_run?: string
  last_run?: string
  configuration: Record<string, any>
  retry_count: number
  max_retries: number
  timeout_minutes: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'scheduled'
  created_by: string
  created_at: string
  updated_at: string
}

export interface TaskExecutionResponse {
  id: number
  task_id: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  duration_seconds?: number
  result_data?: Record<string, any>
  error_message?: string
  retry_attempt: number
}

export interface TaskStats {
  total_tasks: number
  enabled_tasks: number
  disabled_tasks: number
  running_tasks: number
  successful_executions: number
  failed_executions: number
  success_rate_percentage: number
  avg_execution_time_minutes: number
  next_scheduled_task?: string
  task_types_distribution: Record<string, number>
}

// Task APIs
export const getScheduledTasks = async (data_source_id?: number): Promise<TaskResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/tasks${params}`)
  return data
}

export const createTask = async (task: Omit<TaskResponse, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<TaskResponse> => {
  const { data } = await enterpriseApi.post('/tasks', task)
  return data
}

export const updateTask = async (task_id: number, updates: Partial<TaskResponse>): Promise<TaskResponse> => {
  const { data } = await enterpriseApi.put(`/tasks/${task_id}`, updates)
  return data
}

export const executeTask = async (task_id: number, triggered_by: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/tasks/${task_id}/execute`, { triggered_by })
  return data.success
}

export const getTaskStats = async (data_source_id?: number): Promise<TaskStats> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/tasks/stats${params}`)
  return data
}

// ============================================================================
// NOTIFICATION APIs
// ============================================================================

export interface NotificationResponse {
  id: number
  data_source_id?: number
  user_id: string
  title: string
  message: string
  notification_type: 'alert' | 'info' | 'warning' | 'error' | 'success'
  channel: 'email' | 'slack' | 'webhook' | 'sms' | 'in_app'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  sent_at?: string
  delivered_at?: string
  read_at?: string
  recipient: string
  created_at: string
}

// Notification APIs
export const getNotifications = async (user_id?: string): Promise<NotificationResponse[]> => {
  const params = user_id ? `?user_id=${user_id}` : ''
  const { data } = await enterpriseApi.get(`/notifications${params}`)
  return data
}

export const markNotificationRead = async (notification_id: number): Promise<NotificationResponse> => {
  const { data } = await enterpriseApi.post(`/notifications/${notification_id}/read`)
  return data
}

export const createNotification = async (notification: Omit<NotificationResponse, 'id' | 'status' | 'created_at'>): Promise<NotificationResponse> => {
  const { data } = await enterpriseApi.post('/notifications', notification)
  return data
}

// ============================================================================
// INTEGRATION APIs
// ============================================================================

export interface IntegrationResponse {
  id: number
  name: string
  type: 'crm' | 'storage' | 'notification' | 'security' | 'analytics' | 'api'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'connecting' | 'disabled'
  description?: string
  sync_frequency: string
  last_sync?: string
  next_sync?: string
  data_volume: number
  error_count: number
  success_rate: number
  data_source_id: number
  created_at: string
  updated_at: string
}

export interface IntegrationStats {
  total_integrations: number
  active_integrations: number
  error_integrations: number
  total_data_volume: number
  avg_success_rate: number
  last_sync_time?: string
}

// Integration APIs
export const getIntegrations = async (data_source_id?: number): Promise<IntegrationResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/integrations${params}`)
  return data
}

export const createIntegration = async (integration: Omit<IntegrationResponse, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationResponse> => {
  const { data } = await enterpriseApi.post('/integrations', integration)
  return data
}

export const updateIntegration = async (integration_id: number, updates: Partial<IntegrationResponse>): Promise<IntegrationResponse> => {
  const { data } = await enterpriseApi.put(`/integrations/${integration_id}`, updates)
  return data
}

export const triggerIntegrationSync = async (integration_id: number, user_id: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/integrations/${integration_id}/sync`, { user_id })
  return data.success
}

export const getIntegrationStats = async (data_source_id: number): Promise<IntegrationStats> => {
  const { data } = await enterpriseApi.get(`/integrations/stats/${data_source_id}`)
  return data
}

// ============================================================================
// REPORTING APIs
// ============================================================================

export interface ReportResponse {
  id: number
  data_source_id?: number
  name: string
  description?: string
  report_type: 'performance' | 'security' | 'compliance' | 'usage' | 'audit' | 'backup' | 'custom'
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html'
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'scheduled'
  generated_at?: string
  generated_by: string
  file_path?: string
  file_size?: number
  is_scheduled: boolean
  schedule_cron?: string
  next_run?: string
  parameters: Record<string, any>
  filters: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ReportStats {
  total_reports: number
  completed_reports: number
  failed_reports: number
  pending_reports: number
  scheduled_reports: number
  total_size_mb: number
  avg_generation_time_minutes: number
  most_used_type: string
  success_rate_percentage: number
}

// Report APIs
export const getReports = async (data_source_id?: number): Promise<ReportResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/reports${params}`)
  return data
}

export const createReport = async (report: Omit<ReportResponse, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ReportResponse> => {
  const { data } = await enterpriseApi.post('/reports', report)
  return data
}

export const generateReport = async (report_id: number, user_id: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/reports/${report_id}/generate`, { user_id })
  return data.success
}

export const getReportStats = async (data_source_id?: number): Promise<ReportStats> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/reports/stats${params}`)
  return data
}

// ============================================================================
// VERSION HISTORY APIs
// ============================================================================

export interface VersionResponse {
  id: number
  data_source_id: number
  version_number: string
  description?: string
  is_current: boolean
  changes: VersionChange[]
  created_by: string
  created_at: string
  activated_at?: string
  tags: string[]
  rollback_info?: RollbackInfo
}

export interface VersionChange {
  id: number
  change_type: 'created' | 'updated' | 'deleted' | 'migrated' | 'rollback'
  field_path: string
  old_value?: string
  new_value?: string
  description: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface RollbackInfo {
  can_rollback: boolean
  rollback_warnings: string[]
  estimated_downtime?: number
  dependencies: string[]
}

export interface VersionStats {
  total_versions: number
  major_versions: number
  minor_versions: number
  patch_versions: number
  avg_time_between_versions: number
  rollback_rate: number
  most_active_data_source: string
}

// Version APIs
export const getVersionHistory = async (data_source_id: number): Promise<VersionResponse[]> => {
  const { data } = await enterpriseApi.get(`/versions/${data_source_id}`)
  return data
}

export const createVersion = async (version: Omit<VersionResponse, 'id' | 'created_at' | 'is_current'>): Promise<VersionResponse> => {
  const { data } = await enterpriseApi.post('/versions', version)
  return data
}

export const activateVersion = async (version_id: number, activated_by: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/versions/${version_id}/activate`, { activated_by })
  return data.success
}

export const rollbackVersion = async (data_source_id: number, target_version_id: number, rolled_back_by: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/versions/rollback`, { data_source_id, target_version_id, rolled_back_by })
  return data.success
}

// ============================================================================
// DATA SOURCE MANAGEMENT APIs
// ============================================================================

// Data Source CRUD operations
export const useUpdateDataSourceMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, params }: { id: number, params: any }) => {
      const { data } = await enterpriseApi.put(`/scan/data-sources/${id}`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
    },
  })
}

export const useTestConnectionMutation = () => {
  return useMutation({
    mutationFn: async (dataSourceId: number) => {
      const { data } = await enterpriseApi.post(`/scan/data-sources/${dataSourceId}/test-connection`)
      return data
    },
  })
}

// Access Control APIs
export const useDataSourceAccessControlQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-access-control', dataSourceId],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/access-control`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

export const useCreateAccessControlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await enterpriseApi.post('/scan/data-sources/access-control', params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-access-control'] })
    },
  })
}

export const useUpdateAccessControlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ permission_id, ...params }: any) => {
      const { data } = await enterpriseApi.put(`/scan/data-sources/access-control/${permission_id}`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-access-control'] })
    },
  })
}

export const useDeleteAccessControlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (permissionId: string) => {
      const { data } = await enterpriseApi.delete(`/scan/data-sources/access-control/${permissionId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-access-control'] })
    },
  })
}

// Version History APIs
export const useDataSourceVersionHistoryQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-version-history', dataSourceId],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/version-history`)
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

export const useCreateVersionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await enterpriseApi.post('/scan/data-sources/version-history', params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-version-history'] })
    },
  })
}

export const useRestoreVersionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await enterpriseApi.post('/scan/data-sources/version-history/restore', params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-version-history'] })
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
    },
  })
}

// ============================================================================
// REACT QUERY HOOKS - ENTERPRISE FEATURES
// ============================================================================

// Security Hooks
export const useSecurityAuditQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['security-audit', data_source_id],
    queryFn: () => getSecurityAudit(data_source_id!),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreateSecurityScanMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSecurityScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audit'] })
    },
  })
}

// Performance Hooks
export const usePerformanceMetricsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['performance-metrics', data_source_id],
    queryFn: () => getPerformanceMetrics({ data_source_id: data_source_id! }),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreatePerformanceMetricMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPerformanceMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] })
    },
  })
}

// Backup Hooks
export const useBackupStatusQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['backup-status', data_source_id],
    queryFn: () => getBackupStatus(data_source_id!),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreateBackupMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-status'] })
    },
  })
}

// Task Management Hooks
export const useScheduledTasksQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['scheduled-tasks', data_source_id],
    queryFn: () => getScheduledTasks(data_source_id),
    ...options,
  })
}

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] })
    },
  })
}

export const useExecuteTaskMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ task_id, triggered_by }: { task_id: number; triggered_by: string }) => 
      executeTask(task_id, triggered_by),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] })
    },
  })
}

// Notification Hooks
export const useNotificationsQuery = (user_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['notifications', user_id],
    queryFn: () => getNotifications(user_id),
    ...options,
  })
}

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Integration Hooks
export const useIntegrationsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['integrations', data_source_id],
    queryFn: () => getIntegrations(data_source_id),
    ...options,
  })
}

export const useCreateIntegrationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}

export const useTriggerIntegrationSyncMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ integration_id, user_id }: { integration_id: number; user_id: string }) => 
      triggerIntegrationSync(integration_id, user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}

// Report Hooks
export const useReportsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['reports', data_source_id],
    queryFn: () => getReports(data_source_id),
    ...options,
  })
}

export const useCreateReportMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useGenerateReportMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ report_id, user_id }: { report_id: number; user_id: string }) => 
      generateReport(report_id, user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

// Version History Hooks
export const useVersionHistoryQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['version-history', data_source_id],
    queryFn: () => getVersionHistory(data_source_id!),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreateVersionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-history'] })
    },
  })
}

export const useActivateVersionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ version_id, activated_by }: { version_id: number; activated_by: string }) => 
      activateVersion(version_id, activated_by),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-history'] })
    },
  })
}

// ============================================================================
// ADDITIONAL ENTERPRISE QUERY HOOKS - LINKING TO EXISTING APIS
// ============================================================================

// User and Workspace Hooks (linking to backend user management)
export const useUserQuery = (options = {}) => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      // This would connect to your user management system
      const { data } = await enterpriseApi.get('/auth/me')
      return data
    },
    ...options,
  })
}

export const useWorkspaceQuery = (workspace_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['workspace', workspace_id],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/workspaces/${workspace_id || 'current'}`)
      return data
    },
    ...options,
  })
}

// Audit Logs Hook
export const useAuditLogsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['audit-logs', data_source_id],
    queryFn: async () => {
      const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
      const { data } = await enterpriseApi.get(`/audit/logs${params}`)
      return data
    },
    ...options,
  })
}

// User Permissions Hook
export const useUserPermissionsQuery = (user_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['user-permissions', user_id],
    queryFn: async () => {
      const params = user_id ? `?user_id=${user_id}` : ''
      const { data } = await enterpriseApi.get(`/auth/permissions${params}`)
      return data
    },
    ...options,
  })
}

// System Health Hook
export const useSystemHealthQuery = (options = {}) => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await enterpriseApi.get('/health/system')
      return data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    ...options,
  })
}

// Data Source Metrics Hook
export const useDataSourceMetricsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-metrics', data_source_id],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/metrics`)
      return data
    },
    enabled: !!data_source_id,
    ...options,
  })
}

// ============================================================================
// EXPORT ALL ENTERPRISE API FUNCTIONS
// ============================================================================

export {
  enterpriseApi,
  getSecurityAudit,
  createSecurityScan,
  updateSecurityVulnerability,
  getPerformanceMetrics,
  createPerformanceMetric,
  acknowledgePerformanceAlert,
  getBackupStatus,
  createBackup,
  createBackupSchedule,
  createRestoreOperation,
  getScheduledTasks,
  createTask,
  updateTask,
  executeTask,
  getTaskStats,
  getNotifications,
  markNotificationRead,
  createNotification,
  getIntegrations,
  createIntegration,
  updateIntegration,
  triggerIntegrationSync,
  getIntegrationStats,
  getReports,
  createReport,
  generateReport,
  getReportStats,
  getVersionHistory,
  createVersion,
  activateVersion,
  rollbackVersion
}

// ============================================================================
// UTILITY FUNCTIONS FOR API MANAGEMENT
// ============================================================================

export function createApiErrorHandler(componentName: string) {
  return (error: any) => {
    console.error(`API Error in ${componentName}:`, error)
    
    // Emit error event for enterprise monitoring
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('api:error', {
        component: componentName,
        error: error.message,
        timestamp: new Date(),
        url: error.config?.url,
        method: error.config?.method
      })
    }
    
    // You could also show user-friendly error messages here
    return error
  }
}

export function withApiRetry<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  maxRetries: number = 3,
  delayMs: number = 1000
): T {
  return (async (...args: Parameters<T>) => {
    let attempt = 0
    let lastError: any
    
    while (attempt < maxRetries) {
      try {
        return await apiFunction(...args)
      } catch (error) {
        lastError = error
        attempt++
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        }
      }
    }
    
    throw lastError
  }) as T
}

export function createOptimisticUpdate<TData, TVariables>(
  queryKey: string[],
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData
) {
  return {
    onMutate: async (variables: TVariables) => {
      const queryClient = useQueryClient()
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey })
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey)
      
      // Optimistically update to the new value
      queryClient.setQueryData<TData>(queryKey, oldData => updateFn(oldData, variables))
      
      // Return a context object with the snapshotted value
      return { previousData }
    },
    
    onError: (err: any, variables: TVariables, context: any) => {
      const queryClient = useQueryClient()
      
      // Rollback to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    
    onSettled: () => {
      const queryClient = useQueryClient()
      
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey })
    },
  }
}

// ============================================================================
// GLOBAL API EVENT BUS SETUP
// ============================================================================

declare global {
  interface Window {
    enterpriseEventBus: {
      emit: (event: string, data: any) => void
      on: (event: string, handler: (data: any) => void) => void
      off: (event: string, handler: (data: any) => void) => void
    }
  }
}

// ============================================================================
// COLLABORATION ENTERPRISE APIs - NEW IMPLEMENTATION
// ============================================================================

export interface CollaborationWorkspace {
  id: string
  name: string
  description?: string
  type: 'data_analysis' | 'data_governance' | 'compliance' | 'security'
  owner_id: string
  members: CollaborationMember[]
  documents: SharedDocument[]
  created_at: string
  updated_at: string
  last_activity: string
  permissions: WorkspacePermissions
  settings: WorkspaceSettings
}

export interface CollaborationMember {
  user_id: string
  username: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  joined_at: string
  last_active: string
  permissions: string[]
}

export interface SharedDocument {
  id: string
  workspace_id: string
  title: string
  type: 'report' | 'analysis' | 'dashboard' | 'workflow' | 'policy'
  content: any
  version: number
  author_id: string
  collaborators: string[]
  comments: DocumentComment[]
  created_at: string
  updated_at: string
  last_edited_by: string
}

export interface DocumentComment {
  id: string
  document_id: string
  author_id: string
  author_name: string
  content: string
  position?: { line: number; column: number }
  thread_id?: string
  replies: DocumentComment[]
  created_at: string
  updated_at: string
}

export interface ActiveCollaborationSession {
  id: string
  workspace_id: string
  document_id?: string
  participants: SessionParticipant[]
  activity_type: 'editing' | 'viewing' | 'commenting' | 'reviewing'
  started_at: string
  last_activity: string
}

export interface SessionParticipant {
  user_id: string
  username: string
  cursor_position?: { line: number; column: number }
  selection?: { start: any; end: any }
  status: 'active' | 'idle' | 'away'
  last_seen: string
}

// Collaboration API functions
export const getCollaborationWorkspaces = async (filters?: {
  user_id?: string
  workspace_type?: string
}): Promise<CollaborationWorkspace[]> => {
  const params = new URLSearchParams()
  if (filters?.user_id) params.append('user_id', filters.user_id)
  if (filters?.workspace_type) params.append('workspace_type', filters.workspace_type)
  
  const { data } = await enterpriseApi.get(`/collaboration/workspaces?${params.toString()}`)
  return data.data || data
}

export const createCollaborationWorkspace = async (workspaceData: {
  name: string
  description?: string
  type: string
  settings?: any
}): Promise<CollaborationWorkspace> => {
  const { data } = await enterpriseApi.post('/collaboration/workspaces', workspaceData)
  return data.data || data
}

export const getSharedDocuments = async (workspaceId: string, filters?: {
  document_type?: string
}): Promise<SharedDocument[]> => {
  const params = new URLSearchParams()
  if (filters?.document_type) params.append('document_type', filters.document_type)
  
  const { data } = await enterpriseApi.get(`/collaboration/workspaces/${workspaceId}/documents?${params.toString()}`)
  return data.data || data
}

export const createSharedDocument = async (workspaceId: string, documentData: {
  title: string
  type: string
  content: any
}): Promise<SharedDocument> => {
  const { data } = await enterpriseApi.post(`/collaboration/workspaces/${workspaceId}/documents`, documentData)
  return data.data || data
}

export const getActiveCollaborationSessions = async (filters?: {
  workspace_id?: string
}): Promise<ActiveCollaborationSession[]> => {
  const params = new URLSearchParams()
  if (filters?.workspace_id) params.append('workspace_id', filters.workspace_id)
  
  const { data } = await enterpriseApi.get(`/collaboration/sessions/active?${params.toString()}`)
  return data.data || data
}

export const addDocumentComment = async (documentId: string, commentData: {
  content: string
  position?: any
  thread_id?: string
}): Promise<DocumentComment> => {
  const { data } = await enterpriseApi.post(`/collaboration/documents/${documentId}/comments`, commentData)
  return data.data || data
}

export const getDocumentComments = async (documentId: string): Promise<DocumentComment[]> => {
  const { data } = await enterpriseApi.get(`/collaboration/documents/${documentId}/comments`)
  return data.data || data
}

export const inviteToWorkspace = async (workspaceId: string, invitationData: {
  email: string
  role: string
  message?: string
}): Promise<any> => {
  const { data } = await enterpriseApi.post(`/collaboration/workspaces/${workspaceId}/invite`, invitationData)
  return data.data || data
}

export const getWorkspaceActivity = async (workspaceId: string, days: number = 7): Promise<any> => {
  const { data } = await enterpriseApi.get(`/collaboration/workspaces/${workspaceId}/activity?days=${days}`)
  return data.data || data
}

// ============================================================================
// WORKFLOW ENTERPRISE APIs - NEW IMPLEMENTATION
// ============================================================================

export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  type: 'data_processing' | 'approval' | 'compliance' | 'security' | 'custom'
  status: 'draft' | 'active' | 'deprecated' | 'archived'
  version: number
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  permissions: WorkflowPermissions
  created_by: string
  created_at: string
  updated_at: string
  execution_count: number
  success_rate: number
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'action' | 'condition' | 'approval' | 'notification' | 'script'
  configuration: any
  dependencies: string[]
  timeout?: number
  retry_policy?: RetryPolicy
  position: { x: number; y: number }
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  triggered_by: string
  input_data: any
  output_data?: any
  steps_completed: number
  total_steps: number
  current_step?: string
  error_message?: string
  execution_log: ExecutionLogEntry[]
}

export interface ApprovalWorkflow {
  id: string
  title: string
  description: string
  request_type: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  requested_by: string
  approvers: ApprovalStep[]
  current_step: number
  data: any
  created_at: string
  due_date?: string
  completed_at?: string
}

export interface ApprovalStep {
  step_number: number
  approver_id: string
  approver_name: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  approved_at?: string
  required: boolean
}

export interface BulkOperation {
  id: string
  operation_type: 'update' | 'delete' | 'scan' | 'backup' | 'sync'
  target_type: 'data_sources' | 'scan_rules' | 'policies' | 'users'
  targets: string[]
  parameters: any
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  total_items: number
  completed_items: number
  failed_items: number
  started_at: string
  completed_at?: string
  created_by: string
  results: BulkOperationResult[]
}

export interface BulkOperationResult {
  target_id: string
  status: 'success' | 'failed' | 'skipped'
  message?: string
  details?: any
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  version: string
  template_data: WorkflowDefinition
  usage_count: number
  created_by: string
  created_at: string
}

// Workflow API functions
export const getWorkflowDefinitions = async (filters?: {
  workflow_type?: string
  status?: string
}): Promise<WorkflowDefinition[]> => {
  const params = new URLSearchParams()
  if (filters?.workflow_type) params.append('workflow_type', filters.workflow_type)
  if (filters?.status) params.append('status', filters.status)
  
  const { data } = await enterpriseApi.get(`/workflow/designer/workflows?${params.toString()}`)
  return data.data || data
}

export const createWorkflowDefinition = async (workflowData: {
  name: string
  description?: string
  type: string
  steps: any[]
  triggers: any[]
}): Promise<WorkflowDefinition> => {
  const { data } = await enterpriseApi.post('/workflow/designer/workflows', workflowData)
  return data.data || data
}

export const getWorkflowDefinition = async (workflowId: string): Promise<WorkflowDefinition> => {
  const { data } = await enterpriseApi.get(`/workflow/designer/workflows/${workflowId}`)
  return data.data || data
}

export const updateWorkflowDefinition = async (workflowId: string, workflowData: any): Promise<WorkflowDefinition> => {
  const { data } = await enterpriseApi.put(`/workflow/designer/workflows/${workflowId}`, workflowData)
  return data.data || data
}

export const executeWorkflow = async (workflowId: string, executionData: {
  input_data?: any
  parameters?: any
}): Promise<WorkflowExecution> => {
  const { data } = await enterpriseApi.post(`/workflow/workflows/${workflowId}/execute`, executionData)
  return data.data || data
}

export const getWorkflowExecutions = async (filters?: {
  workflow_id?: string
  status?: string
  days?: number
}): Promise<WorkflowExecution[]> => {
  const params = new URLSearchParams()
  if (filters?.workflow_id) params.append('workflow_id', filters.workflow_id)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.days) params.append('days', filters.days.toString())
  
  const { data } = await enterpriseApi.get(`/workflow/executions?${params.toString()}`)
  return data.data || data
}

export const getWorkflowExecutionDetails = async (executionId: string): Promise<WorkflowExecution> => {
  const { data } = await enterpriseApi.get(`/workflow/executions/${executionId}`)
  return data.data || data
}

export const createApprovalWorkflow = async (approvalData: {
  title: string
  description: string
  request_type: string
  approvers: any[]
  data: any
}): Promise<ApprovalWorkflow> => {
  const { data } = await enterpriseApi.post('/workflow/approvals/workflows', approvalData)
  return data.data || data
}

export const getPendingApprovals = async (approver_id?: string): Promise<ApprovalWorkflow[]> => {
  const params = new URLSearchParams()
  if (approver_id) params.append('approver_id', approver_id)
  
  const { data } = await enterpriseApi.get(`/workflow/approvals/pending?${params.toString()}`)
  return data.data || data
}

export const approveRequest = async (approvalId: string, approvalData: {
  comments?: string
}): Promise<ApprovalWorkflow> => {
  const { data } = await enterpriseApi.post(`/workflow/approvals/${approvalId}/approve`, approvalData)
  return data.data || data
}

export const rejectRequest = async (approvalId: string, rejectionData: {
  comments: string
  reason?: string
}): Promise<ApprovalWorkflow> => {
  const { data } = await enterpriseApi.post(`/workflow/approvals/${approvalId}/reject`, rejectionData)
  return data.data || data
}

export const createBulkOperation = async (operationData: {
  operation_type: string
  target_type: string
  targets: string[]
  parameters: any
}): Promise<BulkOperation> => {
  const { data } = await enterpriseApi.post('/workflow/bulk-operations', operationData)
  return data.data || data
}

export const getBulkOperationStatus = async (operationId: string): Promise<BulkOperation> => {
  const { data } = await enterpriseApi.get(`/workflow/bulk-operations/${operationId}/status`)
  return data.data || data
}

export const getWorkflowTemplates = async (category?: string): Promise<WorkflowTemplate[]> => {
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  
  const { data } = await enterpriseApi.get(`/workflow/templates?${params.toString()}`)
  return data.data || data
}

// ============================================================================
// ENHANCED PERFORMANCE ENTERPRISE APIs - NEW IMPLEMENTATION
// ============================================================================

export interface SystemHealth {
  overall_score: number
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  components: ComponentHealth[]
  last_updated: string
  uptime: number
  performance_summary: PerformanceSummary
}

export interface ComponentHealth {
  component: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  score: number
  metrics: Record<string, number>
  last_check: string
  issues: HealthIssue[]
}

export interface PerformanceSummary {
  response_time: number
  throughput: number
  error_rate: number
  cpu_usage: number
  memory_usage: number
  disk_usage: number
}

export interface EnhancedPerformanceAlert {
  id: number
  data_source_id?: number
  alert_type: string
  severity: 'info' | 'warning' | 'critical' | 'error'
  title: string
  description: string
  status: 'open' | 'acknowledged' | 'resolved' | 'closed'
  tags: string[]
  conditions: AlertCondition[]
  triggered_at: string
  acknowledged_at?: string
  acknowledged_by?: string
  resolved_at?: string
  escalation_level: number
  correlation_id?: string
}

export interface PerformanceThreshold {
  id: number
  metric_name: string
  data_source_id?: number
  warning_threshold: number
  critical_threshold: number
  operator: 'gt' | 'lt' | 'eq' | 'ne'
  enabled: boolean
  conditions: ThresholdCondition[]
  created_by: string
  created_at: string
}

export interface PerformanceTrend {
  metric_name: string
  time_series: TimeSeriesPoint[]
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  forecast: ForecastPoint[]
  anomalies: AnomalyPoint[]
  seasonality: SeasonalityInfo
}

export interface OptimizationRecommendation {
  id: string
  category: 'performance' | 'resource' | 'cost' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  current_state: any
  recommended_state: any
  expected_impact: ImpactEstimate
  implementation_effort: 'low' | 'medium' | 'high'
  estimated_savings: CostSavings
  prerequisites: string[]
  implementation_steps: ImplementationStep[]
}

export interface PerformanceReport {
  id: string
  report_type: 'summary' | 'detailed' | 'trend' | 'comparison'
  time_range: string
  data_sources: number[]
  metrics: ReportMetric[]
  insights: ReportInsight[]
  recommendations: string[]
  generated_at: string
  generated_by: string
}

// Enhanced Performance API functions
export const getSystemHealth = async (include_detailed: boolean = false): Promise<SystemHealth> => {
  const params = new URLSearchParams()
  if (include_detailed) params.append('include_detailed', 'true')
  
  const { data } = await enterpriseApi.get(`/performance/system/health?${params.toString()}`)
  return data.data || data
}

export const getEnhancedPerformanceMetrics = async (dataSourceId: number, options?: {
  time_range?: string
  metric_types?: string[]
}): Promise<any> => {
  const params = new URLSearchParams()
  if (options?.time_range) params.append('time_range', options.time_range)
  if (options?.metric_types) {
    options.metric_types.forEach(type => params.append('metric_types', type))
  }
  
  const { data } = await enterpriseApi.get(`/performance/metrics/${dataSourceId}?${params.toString()}`)
  return data.data || data
}

export const getPerformanceAlerts = async (filters?: {
  severity?: string
  status?: string
  days?: number
}): Promise<EnhancedPerformanceAlert[]> => {
  const params = new URLSearchParams()
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.days) params.append('days', filters.days.toString())
  
  const { data } = await enterpriseApi.get(`/performance/alerts?${params.toString()}`)
  return data.data || data
}

export const acknowledgePerformanceAlert = async (alertId: number, acknowledgmentData: {
  comments?: string
}): Promise<EnhancedPerformanceAlert> => {
  const { data } = await enterpriseApi.post(`/performance/alerts/${alertId}/acknowledge`, acknowledgmentData)
  return data.data || data
}

export const resolvePerformanceAlert = async (alertId: number, resolutionData: {
  resolution: string
  comments?: string
}): Promise<EnhancedPerformanceAlert> => {
  const { data } = await enterpriseApi.post(`/performance/alerts/${alertId}/resolve`, resolutionData)
  return data.data || data
}

export const getPerformanceThresholds = async (dataSourceId?: number): Promise<PerformanceThreshold[]> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  
  const { data } = await enterpriseApi.get(`/performance/thresholds?${params.toString()}`)
  return data.data || data
}

export const createPerformanceThreshold = async (thresholdData: {
  metric_name: string
  data_source_id?: number
  warning_threshold: number
  critical_threshold: number
  operator: string
}): Promise<PerformanceThreshold> => {
  const { data } = await enterpriseApi.post('/performance/thresholds', thresholdData)
  return data.data || data
}

export const getPerformanceTrends = async (dataSourceId?: number, time_range: string = '30d'): Promise<PerformanceTrend[]> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  params.append('time_range', time_range)
  
  const { data } = await enterpriseApi.get(`/performance/analytics/trends?${params.toString()}`)
  return data.data || data
}

export const getOptimizationRecommendations = async (dataSourceId?: number): Promise<OptimizationRecommendation[]> => {
  const params = new URLSearchParams()
  if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
  
  const { data } = await enterpriseApi.get(`/performance/optimization/recommendations?${params.toString()}`)
  return data.data || data
}

export const startRealTimeMonitoring = async (monitoringConfig: {
  data_source_ids?: number[]
  metrics?: string[]
  interval?: number
}): Promise<any> => {
  const { data } = await enterpriseApi.post('/performance/monitoring/start', monitoringConfig)
  return data.data || data
}

export const stopRealTimeMonitoring = async (dataSourceId: number): Promise<any> => {
  const { data } = await enterpriseApi.post('/performance/monitoring/stop', { data_source_id: dataSourceId })
  return data.data || data
}

export const getPerformanceSummaryReport = async (options?: {
  time_range?: string
  data_sources?: number[]
}): Promise<PerformanceReport> => {
  const params = new URLSearchParams()
  if (options?.time_range) params.append('time_range', options.time_range)
  if (options?.data_sources) {
    options.data_sources.forEach(id => params.append('data_sources', id.toString()))
  }
  
  const { data } = await enterpriseApi.get(`/performance/reports/summary?${params.toString()}`)
  return data.data || data
}

// ============================================================================
// ENHANCED SECURITY ENTERPRISE APIs - NEW IMPLEMENTATION
// ============================================================================

export interface EnhancedVulnerabilityAssessment {
  id: string
  data_source_id?: number
  vulnerability_type: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  cvss_score?: number
  cve_id?: string
  title: string
  description: string
  affected_components: string[]
  discovery_method: string
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive'
  remediation_steps: RemediationStep[]
  business_impact: BusinessImpact
  discovered_at: string
  last_updated: string
  remediated_at?: string
  remediated_by?: string
}

export interface SecurityIncident {
  id: string
  incident_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed'
  title: string
  description: string
  affected_systems: string[]
  attack_vector?: string
  indicators_of_compromise: IOC[]
  timeline: IncidentTimelineEvent[]
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface ComplianceCheck {
  id: string
  framework: string
  control_id: string
  title: string
  description: string
  data_source_id?: number
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed'
  evidence: ComplianceEvidence[]
  gaps: ComplianceGap[]
  last_assessment: string
  next_assessment: string
  assessor: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface ThreatDetection {
  id: string
  threat_type: string
  confidence_score: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  detection_method: 'signature' | 'behavioral' | 'ml' | 'heuristic'
  threat_indicators: ThreatIndicator[]
  affected_assets: string[]
  mitigation_actions: MitigationAction[]
  detected_at: string
  status: 'active' | 'mitigated' | 'false_positive'
}

export interface SecurityAnalyticsDashboard {
  security_posture: SecurityPosture
  threat_landscape: ThreatLandscape
  risk_metrics: RiskMetrics
  compliance_status: ComplianceStatus
  incident_trends: IncidentTrends
  vulnerability_trends: VulnerabilityTrends
  generated_at: string
}

export interface RiskAssessmentReport {
  id: string
  assessment_type: 'comprehensive' | 'targeted' | 'periodic'
  scope: string[]
  risk_categories: RiskCategory[]
  overall_risk_score: number
  risk_appetite: RiskAppetite
  mitigation_strategies: MitigationStrategy[]
  executive_summary: string
  recommendations: RecommendationItem[]
  assessed_by: string
  assessed_at: string
}

// Enhanced Security API functions
export const getEnhancedSecurityAudit = async (dataSourceId: number, options?: {
  include_vulnerabilities?: boolean
  include_compliance?: boolean
}): Promise<any> => {
  const params = new URLSearchParams()
  if (options?.include_vulnerabilities) params.append('include_vulnerabilities', 'true')
  if (options?.include_compliance) params.append('include_compliance', 'true')
  
  const { data } = await enterpriseApi.get(`/security/audit/${dataSourceId}?${params.toString()}`)
  return data.data || data
}

export const createEnhancedSecurityScan = async (scanRequest: {
  data_source_ids?: number[]
  scan_types?: string[]
  priority?: string
  schedule?: any
}): Promise<any> => {
  const { data } = await enterpriseApi.post('/security/scans', scanRequest)
  return data.data || data
}

export const getSecurityScans = async (filters?: {
  data_source_id?: number
  scan_type?: string
  status?: string
  days?: number
}): Promise<any[]> => {
  const params = new URLSearchParams()
  if (filters?.data_source_id) params.append('data_source_id', filters.data_source_id.toString())
  if (filters?.scan_type) params.append('scan_type', filters.scan_type)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.days) params.append('days', filters.days.toString())
  
  const { data } = await enterpriseApi.get(`/security/scans?${params.toString()}`)
  return data.data || data
}

export const getVulnerabilityAssessments = async (filters?: {
  severity?: string
  data_source_id?: number
  status?: string
}): Promise<EnhancedVulnerabilityAssessment[]> => {
  const params = new URLSearchParams()
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.data_source_id) params.append('data_source_id', filters.data_source_id.toString())
  if (filters?.status) params.append('status', filters.status)
  
  const { data } = await enterpriseApi.get(`/security/vulnerabilities?${params.toString()}`)
  return data.data || data
}

export const remediateVulnerability = async (vulnerabilityId: string, remediationData: {
  remediation_method: string
  comments?: string
  verification_required?: boolean
}): Promise<EnhancedVulnerabilityAssessment> => {
  const { data } = await enterpriseApi.post(`/security/vulnerabilities/${vulnerabilityId}/remediate`, remediationData)
  return data.data || data
}

export const getSecurityIncidents = async (filters?: {
  severity?: string
  status?: string
  days?: number
}): Promise<SecurityIncident[]> => {
  const params = new URLSearchParams()
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.days) params.append('days', filters.days.toString())
  
  const { data } = await enterpriseApi.get(`/security/incidents?${params.toString()}`)
  return data.data || data
}

export const createSecurityIncident = async (incidentData: {
  incident_type: string
  severity: string
  title: string
  description: string
  affected_systems?: string[]
}): Promise<SecurityIncident> => {
  const { data } = await enterpriseApi.post('/security/incidents', incidentData)
  return data.data || data
}

export const getComplianceChecks = async (filters?: {
  framework?: string
  data_source_id?: number
  status?: string
}): Promise<ComplianceCheck[]> => {
  const params = new URLSearchParams()
  if (filters?.framework) params.append('framework', filters.framework)
  if (filters?.data_source_id) params.append('data_source_id', filters.data_source_id.toString())
  if (filters?.status) params.append('status', filters.status)
  
  const { data } = await enterpriseApi.get(`/security/compliance/checks?${params.toString()}`)
  return data.data || data
}

export const runComplianceCheck = async (checkRequest: {
  framework: string
  controls?: string[]
  data_source_ids?: number[]
}): Promise<any> => {
  const { data } = await enterpriseApi.post('/security/compliance/checks', checkRequest)
  return data.data || data
}

export const getThreatDetection = async (filters?: {
  threat_type?: string
  severity?: string
  days?: number
}): Promise<ThreatDetection[]> => {
  const params = new URLSearchParams()
  if (filters?.threat_type) params.append('threat_type', filters.threat_type)
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.days) params.append('days', filters.days.toString())
  
  const { data } = await enterpriseApi.get(`/security/threat-detection?${params.toString()}`)
  return data.data || data
}

export const getSecurityAnalyticsDashboard = async (time_range: string = '7d'): Promise<SecurityAnalyticsDashboard> => {
  const { data } = await enterpriseApi.get(`/security/analytics/dashboard?time_range=${time_range}`)
  return data.data || data
}

export const getRiskAssessmentReport = async (filters?: {
  data_source_id?: number
  risk_level?: string
}): Promise<RiskAssessmentReport> => {
  const params = new URLSearchParams()
  if (filters?.data_source_id) params.append('data_source_id', filters.data_source_id.toString())
  if (filters?.risk_level) params.append('risk_level', filters.risk_level)
  
  const { data } = await enterpriseApi.get(`/security/reports/risk-assessment?${params.toString()}`)
  return data.data || data
}

export const startSecurityMonitoring = async (monitoringConfig: {
  data_source_ids?: number[]
  monitoring_types?: string[]
  alert_thresholds?: any
}): Promise<any> => {
  const { data } = await enterpriseApi.post('/security/monitoring/start', monitoringConfig)
  return data.data || data
}

// ============================================================================
// COMPREHENSIVE REACT QUERY HOOKS - ENTERPRISE INTEGRATION
// ============================================================================

// COLLABORATION HOOKS
export const useCollaborationWorkspacesQuery = (filters?: {
  user_id?: string
  workspace_type?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['collaboration', 'workspaces', filters],
    queryFn: () => getCollaborationWorkspaces(filters),
    staleTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    ...options,
  })
}

export const useCreateCollaborationWorkspaceMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCollaborationWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', 'workspaces'] })
    },
  })
}

export const useSharedDocumentsQuery = (workspaceId: string, filters?: {
  document_type?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['collaboration', 'documents', workspaceId, filters],
    queryFn: () => getSharedDocuments(workspaceId, filters),
    enabled: !!workspaceId,
    staleTime: 180000, // 3 minutes
    ...options,
  })
}

export const useCreateSharedDocumentMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ workspaceId, documentData }: { workspaceId: string; documentData: any }) =>
      createSharedDocument(workspaceId, documentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', 'documents', variables.workspaceId] })
    },
  })
}

export const useActiveCollaborationSessionsQuery = (filters?: {
  workspace_id?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['collaboration', 'sessions', 'active', filters],
    queryFn: () => getActiveCollaborationSessions(filters),
    refetchInterval: 5000, // 5 seconds for real-time updates
    staleTime: 10000, // 10 seconds
    ...options,
  })
}

export const useDocumentCommentsQuery = (documentId: string, options = {}) => {
  return useQuery({
    queryKey: ['collaboration', 'comments', documentId],
    queryFn: () => getDocumentComments(documentId),
    enabled: !!documentId,
    staleTime: 60000, // 1 minute
    ...options,
  })
}

export const useAddDocumentCommentMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, commentData }: { documentId: string; commentData: any }) =>
      addDocumentComment(documentId, commentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', 'comments', variables.documentId] })
    },
  })
}

export const useInviteToWorkspaceMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ workspaceId, invitationData }: { workspaceId: string; invitationData: any }) =>
      inviteToWorkspace(workspaceId, invitationData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', 'workspaces'] })
    },
  })
}

export const useWorkspaceActivityQuery = (workspaceId: string, days: number = 7, options = {}) => {
  return useQuery({
    queryKey: ['collaboration', 'activity', workspaceId, days],
    queryFn: () => getWorkspaceActivity(workspaceId, days),
    enabled: !!workspaceId,
    staleTime: 300000, // 5 minutes
    ...options,
  })
}

// WORKFLOW HOOKS
export const useWorkflowDefinitionsQuery = (filters?: {
  workflow_type?: string
  status?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['workflow', 'definitions', filters],
    queryFn: () => getWorkflowDefinitions(filters),
    staleTime: 600000, // 10 minutes
    ...options,
  })
}

export const useCreateWorkflowDefinitionMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createWorkflowDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'definitions'] })
    },
  })
}

export const useWorkflowDefinitionQuery = (workflowId: string, options = {}) => {
  return useQuery({
    queryKey: ['workflow', 'definition', workflowId],
    queryFn: () => getWorkflowDefinition(workflowId),
    enabled: !!workflowId,
    staleTime: 300000, // 5 minutes
    ...options,
  })
}

export const useUpdateWorkflowDefinitionMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ workflowId, workflowData }: { workflowId: string; workflowData: any }) =>
      updateWorkflowDefinition(workflowId, workflowData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'definition', variables.workflowId] })
      queryClient.invalidateQueries({ queryKey: ['workflow', 'definitions'] })
    },
  })
}

export const useExecuteWorkflowMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ workflowId, executionData }: { workflowId: string; executionData: any }) =>
      executeWorkflow(workflowId, executionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'executions'] })
    },
  })
}

export const useWorkflowExecutionsQuery = (filters?: {
  workflow_id?: string
  status?: string
  days?: number
}, options = {}) => {
  return useQuery({
    queryKey: ['workflow', 'executions', filters],
    queryFn: () => getWorkflowExecutions(filters),
    staleTime: 120000, // 2 minutes
    refetchInterval: 30000, // 30 seconds
    ...options,
  })
}

export const useWorkflowExecutionDetailsQuery = (executionId: string, options = {}) => {
  return useQuery({
    queryKey: ['workflow', 'execution', executionId],
    queryFn: () => getWorkflowExecutionDetails(executionId),
    enabled: !!executionId,
    staleTime: 60000, // 1 minute
    refetchInterval: 10000, // 10 seconds for running executions
    ...options,
  })
}

export const useCreateApprovalWorkflowMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createApprovalWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'approvals'] })
    },
  })
}

export const usePendingApprovalsQuery = (approver_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['workflow', 'approvals', 'pending', approver_id],
    queryFn: () => getPendingApprovals(approver_id),
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // 30 seconds
    ...options,
  })
}

export const useApproveRequestMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ approvalId, approvalData }: { approvalId: string; approvalData: any }) =>
      approveRequest(approvalId, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'approvals'] })
    },
  })
}

export const useRejectRequestMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ approvalId, rejectionData }: { approvalId: string; rejectionData: any }) =>
      rejectRequest(approvalId, rejectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'approvals'] })
    },
  })
}

export const useCreateBulkOperationMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createBulkOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'bulk-operations'] })
    },
  })
}

export const useBulkOperationStatusQuery = (operationId: string, options = {}) => {
  return useQuery({
    queryKey: ['workflow', 'bulk-operation', operationId],
    queryFn: () => getBulkOperationStatus(operationId),
    enabled: !!operationId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 3000, // 3 seconds for active operations
    ...options,
  })
}

export const useWorkflowTemplatesQuery = (category?: string, options = {}) => {
  return useQuery({
    queryKey: ['workflow', 'templates', category],
    queryFn: () => getWorkflowTemplates(category),
    staleTime: 1800000, // 30 minutes
    ...options,
  })
}

// ENHANCED PERFORMANCE HOOKS
export const useSystemHealthQuery = (include_detailed: boolean = false, options = {}) => {
  return useQuery({
    queryKey: ['performance', 'system', 'health', include_detailed],
    queryFn: () => getSystemHealth(include_detailed),
    staleTime: 30000, // 30 seconds
    refetchInterval: 15000, // 15 seconds
    ...options,
  })
}

export const useEnhancedPerformanceMetricsQuery = (dataSourceId: number, queryOptions?: {
  time_range?: string
  metric_types?: string[]
}, options = {}) => {
  return useQuery({
    queryKey: ['performance', 'metrics', 'enhanced', dataSourceId, queryOptions],
    queryFn: () => getEnhancedPerformanceMetrics(dataSourceId, queryOptions),
    enabled: !!dataSourceId,
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // 30 seconds
    ...options,
  })
}

export const usePerformanceAlertsQuery = (filters?: {
  severity?: string
  status?: string
  days?: number
}, options = {}) => {
  return useQuery({
    queryKey: ['performance', 'alerts', filters],
    queryFn: () => getPerformanceAlerts(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 15000, // 15 seconds
    ...options,
  })
}

export const useAcknowledgePerformanceAlertMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ alertId, acknowledgmentData }: { alertId: number; acknowledgmentData: any }) =>
      acknowledgePerformanceAlert(alertId, acknowledgmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance', 'alerts'] })
    },
  })
}

export const useResolvePerformanceAlertMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ alertId, resolutionData }: { alertId: number; resolutionData: any }) =>
      resolvePerformanceAlert(alertId, resolutionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance', 'alerts'] })
    },
  })
}

export const usePerformanceThresholdsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['performance', 'thresholds', dataSourceId],
    queryFn: () => getPerformanceThresholds(dataSourceId),
    staleTime: 600000, // 10 minutes
    ...options,
  })
}

export const useCreatePerformanceThresholdMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createPerformanceThreshold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance', 'thresholds'] })
    },
  })
}

export const usePerformanceTrendsQuery = (dataSourceId?: number, time_range: string = '30d', options = {}) => {
  return useQuery({
    queryKey: ['performance', 'trends', dataSourceId, time_range],
    queryFn: () => getPerformanceTrends(dataSourceId, time_range),
    staleTime: 300000, // 5 minutes
    ...options,
  })
}

export const useOptimizationRecommendationsQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['performance', 'optimization', 'recommendations', dataSourceId],
    queryFn: () => getOptimizationRecommendations(dataSourceId),
    staleTime: 1800000, // 30 minutes
    ...options,
  })
}

export const useStartRealTimeMonitoringMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: startRealTimeMonitoring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] })
    },
  })
}

export const useStopRealTimeMonitoringMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: stopRealTimeMonitoring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] })
    },
  })
}

export const usePerformanceSummaryReportQuery = (queryOptions?: {
  time_range?: string
  data_sources?: number[]
}, options = {}) => {
  return useQuery({
    queryKey: ['performance', 'reports', 'summary', queryOptions],
    queryFn: () => getPerformanceSummaryReport(queryOptions),
    staleTime: 600000, // 10 minutes
    ...options,
  })
}

// ENHANCED SECURITY HOOKS
export const useEnhancedSecurityAuditQuery = (dataSourceId: number, queryOptions?: {
  include_vulnerabilities?: boolean
  include_compliance?: boolean
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'audit', 'enhanced', dataSourceId, queryOptions],
    queryFn: () => getEnhancedSecurityAudit(dataSourceId, queryOptions),
    enabled: !!dataSourceId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    ...options,
  })
}

export const useCreateEnhancedSecurityScanMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createEnhancedSecurityScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'scans'] })
    },
  })
}

export const useSecurityScansQuery = (filters?: {
  data_source_id?: number
  scan_type?: string
  status?: string
  days?: number
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'scans', filters],
    queryFn: () => getSecurityScans(filters),
    staleTime: 180000, // 3 minutes
    refetchInterval: 120000, // 2 minutes
    ...options,
  })
}

export const useVulnerabilityAssessmentsQuery = (filters?: {
  severity?: string
  data_source_id?: number
  status?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'vulnerabilities', filters],
    queryFn: () => getVulnerabilityAssessments(filters),
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    ...options,
  })
}

export const useRemediateVulnerabilityMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ vulnerabilityId, remediationData }: { vulnerabilityId: string; remediationData: any }) =>
      remediateVulnerability(vulnerabilityId, remediationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'vulnerabilities'] })
    },
  })
}

export const useSecurityIncidentsQuery = (filters?: {
  severity?: string
  status?: string
  days?: number
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'incidents', filters],
    queryFn: () => getSecurityIncidents(filters),
    staleTime: 120000, // 2 minutes
    refetchInterval: 60000, // 1 minute
    ...options,
  })
}

export const useCreateSecurityIncidentMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createSecurityIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'incidents'] })
    },
  })
}

export const useComplianceChecksQuery = (filters?: {
  framework?: string
  data_source_id?: number
  status?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'compliance', 'checks', filters],
    queryFn: () => getComplianceChecks(filters),
    staleTime: 600000, // 10 minutes
    refetchInterval: 1800000, // 30 minutes
    ...options,
  })
}

export const useRunComplianceCheckMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: runComplianceCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'compliance'] })
    },
  })
}

export const useThreatDetectionQuery = (filters?: {
  threat_type?: string
  severity?: string
  days?: number
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'threats', filters],
    queryFn: () => getThreatDetection(filters),
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // 30 seconds
    ...options,
  })
}

export const useSecurityAnalyticsDashboardQuery = (time_range: string = '7d', options = {}) => {
  return useQuery({
    queryKey: ['security', 'analytics', 'dashboard', time_range],
    queryFn: () => getSecurityAnalyticsDashboard(time_range),
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    ...options,
  })
}

export const useRiskAssessmentReportQuery = (filters?: {
  data_source_id?: number
  risk_level?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'risk', 'assessment', filters],
    queryFn: () => getRiskAssessmentReport(filters),
    staleTime: 1800000, // 30 minutes
    ...options,
  })
}

export const useStartSecurityMonitoringMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: startSecurityMonitoring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] })
    },
  })
}

// ============================================================================
// ENHANCED CATALOG DISCOVERY APIS - NEW IMPLEMENTATION
// ============================================================================

export interface SchemaDiscoveryRequest {
  data_source_id: number
  include_data_preview?: boolean
  auto_catalog?: boolean
  max_tables_per_schema?: number
}

export interface SchemaDiscoveryResult {
  success: boolean
  discovered_items: number
  errors: string[]
  warnings: string[]
  processing_time_seconds: number
  data_source_info: {
    name: string
    type: string
    host: string
    connection_time_ms: number
  }
}

export interface CatalogSyncResult {
  success: boolean
  items_created: number
  items_updated: number
  items_deleted: number
  errors: string[]
  sync_duration_seconds: number
}

export interface StandardResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

// Enhanced Catalog Discovery API functions
export const discoverAndCatalogSchema = async (
  dataSourceId: number, 
  forceRefresh: boolean = false
): Promise<StandardResponse> => {
  const params = new URLSearchParams()
  if (forceRefresh) params.append('force_refresh', 'true')
  
  const { data } = await enterpriseApi.post(
    `/data-discovery/data-sources/${dataSourceId}/discover-and-catalog?${params.toString()}`
  )
  return data
}

export const syncCatalogWithDataSource = async (dataSourceId: number): Promise<StandardResponse> => {
  const { data } = await enterpriseApi.post(`/data-discovery/data-sources/${dataSourceId}/sync-catalog`)
  return data
}

export const discoverSchemaWithOptions = async (
  dataSourceId: number, 
  options: SchemaDiscoveryRequest
): Promise<StandardResponse> => {
  const { data } = await enterpriseApi.post(
    `/data-discovery/data-sources/${dataSourceId}/discover-schema`,
    options
  )
  return data
}

export const getDataSourceCatalog = async (dataSourceId: number): Promise<any> => {
  const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/catalog`)
  return data
}

// Enhanced Catalog Discovery React Query Hooks
export const useDiscoverAndCatalogSchemaMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ dataSourceId, forceRefresh }: { dataSourceId: number; forceRefresh?: boolean }) =>
      discoverAndCatalogSchema(dataSourceId, forceRefresh),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['data-source-catalog', variables.dataSourceId] })
      queryClient.invalidateQueries({ queryKey: ['data-source-metrics', variables.dataSourceId] })
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] })
      
      // Emit success event
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('catalog:discovery:completed', {
          dataSourceId: variables.dataSourceId,
          result: data,
          timestamp: new Date()
        })
      }
    },
    onError: (error, variables) => {
      // Emit error event
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('catalog:discovery:failed', {
          dataSourceId: variables.dataSourceId,
          error: error.message,
          timestamp: new Date()
        })
      }
    },
  })
}

export const useSyncCatalogWithDataSourceMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (dataSourceId: number) => syncCatalogWithDataSource(dataSourceId),
    onSuccess: (data, dataSourceId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['data-source-catalog', dataSourceId] })
      queryClient.invalidateQueries({ queryKey: ['data-source-metrics', dataSourceId] })
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] })
      
      // Emit success event
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('catalog:sync:completed', {
          dataSourceId,
          result: data,
          timestamp: new Date()
        })
      }
    },
    onError: (error, dataSourceId) => {
      // Emit error event
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('catalog:sync:failed', {
          dataSourceId,
          error: error.message,
          timestamp: new Date()
        })
      }
    },
  })
}

export const useDiscoverSchemaWithOptionsMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ dataSourceId, options }: { dataSourceId: number; options: SchemaDiscoveryRequest }) =>
      discoverSchemaWithOptions(dataSourceId, options),
    onSuccess: (data, variables) => {
      // Invalidate related queries if auto_catalog was enabled
      if (variables.options.auto_catalog) {
        queryClient.invalidateQueries({ queryKey: ['data-source-catalog', variables.dataSourceId] })
        queryClient.invalidateQueries({ queryKey: ['catalog-stats'] })
      }
      
      // Emit success event
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('schema:discovery:completed', {
          dataSourceId: variables.dataSourceId,
          options: variables.options,
          result: data,
          timestamp: new Date()
        })
      }
    },
  })
}

export const useDataSourceCatalogQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-catalog', dataSourceId],
    queryFn: () => getDataSourceCatalog(dataSourceId),
    enabled: !!dataSourceId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // 10 minutes
    ...options,
  })
}

// Initialize global event bus if not already present
if (typeof window !== 'undefined' && !window.enterpriseEventBus) {
  const listeners: Record<string, ((data: any) => void)[]> = {}
  
  window.enterpriseEventBus = {
    emit: (event: string, data: any) => {
      const eventListeners = listeners[event] || []
      eventListeners.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    },
    
    on: (event: string, handler: (data: any) => void) => {
      if (!listeners[event]) {
        listeners[event] = []
      }
      listeners[event].push(handler)
    },
    
    off: (event: string, handler: (data: any) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler)
      }
    }
  }
}