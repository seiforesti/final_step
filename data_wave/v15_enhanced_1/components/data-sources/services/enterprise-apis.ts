// ============================================================================
// ENTERPRISE BACKEND API INTEGRATION - COMPREHENSIVE BACKEND BINDING
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Extend axios config to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number
      requestId: string
      duration?: number
      success?: boolean
    }
  }
}

// Import specific APIs to avoid conflicts
// export * from './apis'  // Commented out to prevent duplicate exports
export {
  useDataSourcesQuery,
  useDataSourceHealthQuery,
  useConnectionPoolStatsQuery,
  useDiscoveryHistoryQuery,
  useScanResultsQuery,
  useQualityMetricsQuery,
  useGrowthMetricsQuery,
  useSchemaDiscoveryQuery,
  useDataLineageQuery,
  useDataCatalogQuery,
  useTagsQuery
  // Removed useComplianceStatusQuery to avoid duplicate export
} from './apis'

// Import types from backend models
// Note: These types are imported but may not be used in this file
// They are kept for potential future use and type consistency

// ============================================================================
// EXTENDED API CONFIGURATION
// ============================================================================

// In enterprise-apis.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy'
const enterpriseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for enterprise operations
})

// Burst control and error suppression
const REQUEST_MIN_INTERVAL_MS = 800
const ERROR_SUPPRESS_WINDOW_MS = 10000
const lastRequestAtByKey: Record<string, number> = {}
const lastErrorAtByKey: Record<string, number> = {}

function buildRequestKey(config: any): string {
  const method = (config?.method || 'get').toLowerCase()
  const url = config?.url || ''
  const params = config?.params ? JSON.stringify(config.params) : ''
  const data = method === 'get' ? '' : (config?.data ? JSON.stringify(config.data) : '')
  return `${method}:${url}|p=${params}|d=${data}`
}

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

  // Throttle duplicate GETs and pause when tab hidden
  try {
    const key = buildRequestKey(config)
    const now = Date.now()
    if ((config.method || 'get').toLowerCase() === 'get') {
      const lastAt = lastRequestAtByKey[key] || 0
      if (now - lastAt < REQUEST_MIN_INTERVAL_MS) {
        const cancel: any = new axios.Cancel('Throttled duplicate GET request')
        cancel.__throttled = true
        throw cancel
      }
      lastRequestAtByKey[key] = now
      if (typeof document !== 'undefined' && document.hidden) {
        const cancelHidden: any = new axios.Cancel('Skipped GET while tab hidden')
        cancelHidden.__skippedHidden = true
        throw cancelHidden
      }
    }
  } catch (_) {}
  
  return config
})

// Enhanced response interceptor with enterprise error handling
enterpriseApi.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now())
    if (response.config.metadata) {
      (response.config.metadata as any) = {
        ...response.config.metadata,
        duration,
        success: true
      }
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
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now())
    
    // Enhanced error handling with graceful recovery
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      duration,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code,
      details: error.response?.data?.details,
      success: false,
      isGraceful: false,
      canRetry: false,
      retryAfter: 0
    }
    
    // Suppress noisy repeated identical errors within window
    try {
      const key = buildRequestKey(error?.config || {}) + `|s=${error?.response?.status}`
      const now = Date.now()
      const lastAt = lastErrorAtByKey[key] || 0
      const shouldEmit = now - lastAt > ERROR_SUPPRESS_WINDOW_MS
      if (shouldEmit && typeof window !== 'undefined' && (window as any).enterpriseEventBus) {
        lastErrorAtByKey[key] = now
        ;(window as any).enterpriseEventBus.emit('api:request:failed', {
          url: error?.config?.url,
          method: error?.config?.method,
          duration,
          status: error?.response?.status,
          success: false
        })
      }
    } catch (_) {}

    // Classify errors for graceful handling
    if (error.response?.status === 502 || error.response?.status === 503) {
      // Bad Gateway or Service Unavailable - can retry
      errorDetails.isGraceful = true
      errorDetails.canRetry = true
      errorDetails.retryAfter = 2000 // 2 seconds
      errorDetails.message = 'Backend service temporarily unavailable. Retrying...'
    } else if (error.response?.status === 504) {
      // Gateway Timeout - can retry with longer delay
      errorDetails.isGraceful = true
      errorDetails.canRetry = true
      errorDetails.retryAfter = 5000 // 5 seconds
      errorDetails.message = 'Backend service timeout. Retrying...'
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      // Connection refused or not found - can retry
      errorDetails.isGraceful = true
      errorDetails.canRetry = true
      errorDetails.retryAfter = 3000 // 3 seconds
      errorDetails.message = 'Connection refused. Retrying...'
    } else if (error.response?.status >= 500) {
      // Server errors - can retry
      errorDetails.isGraceful = true
      errorDetails.canRetry = true
      errorDetails.retryAfter = 1000 // 1 second
      errorDetails.message = 'Server error. Retrying...'
    } else if (error.response?.status === 401) {
      // Authentication error - can retry after token refresh
      errorDetails.isGraceful = true
      errorDetails.canRetry = true
      errorDetails.retryAfter = 1000
      errorDetails.message = 'Authentication required. Refreshing...'
    } else if (error.response?.status === 403) {
      // Permission error - show user-friendly message
      errorDetails.isGraceful = true
      errorDetails.canRetry = false
      errorDetails.message = 'Access denied. Please check your permissions.'
    } else if (!error.response) {
      // Network error - can retry
      errorDetails.isGraceful = true
      errorDetails.canRetry = true
      errorDetails.retryAfter = 2000
      errorDetails.message = 'Network error. Retrying...'
    }
    
    // Emit telemetry event with safety check
    try {
      if (typeof window !== 'undefined' && window.enterpriseEventBus && typeof window.enterpriseEventBus.emit === 'function') {
        window.enterpriseEventBus.emit('api:request:failed', errorDetails)
      }
    } catch (telemetryError) {
      console.warn('Failed to emit telemetry event:', telemetryError)
    }
    
    // Log enterprise-grade error details
    if (errorDetails.isGraceful) {
      console.warn('Enterprise API Error (Graceful):', {
        url: errorDetails.url,
        method: errorDetails.method,
        status: errorDetails.status,
        message: errorDetails.message,
        duration: errorDetails.duration
      })
    } else {
      console.error('Enterprise API Error:', {
        url: errorDetails.url,
        method: errorDetails.method,
        status: errorDetails.status,
        message: errorDetails.message,
        duration: errorDetails.duration,
        details: errorDetails.details
      })
    }
    
    // Return graceful error for retry logic
    const gracefulError = {
      ...error,
      ...errorDetails,
      originalError: error
    }
    
    return Promise.reject(gracefulError)
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

// ============================================================================
// UPDATED ENTERPRISE API CALLS TO MATCH REAL BACKEND ENDPOINTS
// ============================================================================

// Security APIs - UPDATED TO USE CORRECT ENDPOINTS
export const getSecurityAudit = async (dataSourceId: number): Promise<any> => {
  const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/security-audit`);
  return data;
};

export const getSecurityScans = async (): Promise<any[]> => {
  const { data } = await enterpriseApi.get('/security/scans');
  return data;
};

export const getComplianceChecks = async (): Promise<any[]> => {
  const { data } = await enterpriseApi.get('/security/compliance/checks');
  return data;
};

export const getThreatDetection = async (): Promise<any[]> => {
  const { data } = await enterpriseApi.get('/security/threat-detection');
  return data;
};

export const getSecurityAnalytics = async (): Promise<any> => {
  const { data } = await enterpriseApi.get('/security/analytics/dashboard');
  return data;
};

export const getRiskAssessment = async (): Promise<any> => {
  const { data } = await enterpriseApi.get('/security/reports/risk-assessment');
  return data;
};

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

// Performance APIs - UPDATED TO USE CORRECT ENDPOINTS
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

// ============================================================================
// BACKUP & RESTORE APIs
// ============================================================================

export interface BackupStatusResponse {
  data_source_id: number
  last_backup?: BackupOperation
  next_scheduled_backup?: BackupSchedule
  backup_history: BackupOperation[]
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

// Backup APIs - UPDATED TO USE CORRECT ENDPOINTS
export const getBackupStatus = async (data_source_id: number): Promise<BackupStatusResponse> => {
  const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/backup-status`)
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
  const { data } = await enterpriseApi.post('/backups/restore', restore)
  return data
}

export interface TaskResponse {
  id: number
  data_source_id: number
  task_name: string
  task_type: string
  description?: string
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

// Task APIs - UPDATED TO USE CORRECT ENDPOINTS
export const getScheduledTasks = async (data_source_id?: number): Promise<TaskResponse[]> => {
  try {
    if (data_source_id) {
      const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/scheduled-tasks`)
      return data
    } else {
      // If no data_source_id provided, get all scheduled tasks
      const { data } = await enterpriseApi.get('/scan/tasks?type=scheduled')
      return data
    }
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error)
    // Return mock data to prevent crashes while backend is down
    return [
      {
        id: 1,
        data_source_id: data_source_id || 1,
        task_name: 'System Maintenance',
        task_type: 'maintenance',
        description: 'Backend service unavailable - showing mock data',
        cron_expression: '0 2 * * *',
        is_enabled: true,
        next_run: undefined,
        last_run: undefined,
        configuration: {},
        retry_count: 0,
        max_retries: 3,
        timeout_minutes: 30,
        status: 'scheduled',
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
}

export const createTask = async (task: Omit<TaskResponse, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<TaskResponse> => {
  const { data } = await enterpriseApi.post('/scan/tasks', task)
  return data
}

export const updateTask = async (task_id: number, updates: Partial<TaskResponse>): Promise<TaskResponse> => {
  const { data } = await enterpriseApi.put(`/scan/tasks/${task_id}`, updates)
  return data
}

export const executeTask = async (task_id: number, triggered_by: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/scan/tasks/${task_id}/execute`, { triggered_by })
  return data.success
}

export const getTaskStats = async (data_source_id?: number): Promise<TaskStats> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/scan/tasks/stats${params}`)
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

// Notification APIs - UPDATED TO USE CORRECT ENDPOINTS
export const getNotifications = async (user_id?: string): Promise<NotificationResponse[]> => {
  const params = user_id ? `?user_id=${user_id}` : ''
  const { data } = await enterpriseApi.get(`/scan/notifications${params}`)  // Fixed: use correct backend route
  return data
}

export const markNotificationRead = async (notification_id: number): Promise<NotificationResponse> => {
  const { data } = await enterpriseApi.post(`/notifications/${notification_id}/read`)
  return data
}

export const createNotification = async (notification: Omit<NotificationResponse, 'id' | 'status' | 'created_at'>): Promise<NotificationResponse> => {
  const { data } = await enterpriseApi.post('/scan/notifications', notification)
  return data
}

export interface IntegrationResponse {
  id: number
  data_source_id: number
  integration_name: string
  integration_type: string
  description?: string
  configuration: Record<string, any>
  status: 'active' | 'inactive' | 'error' | 'pending'
  last_sync?: string
  next_sync?: string
  data_volume: number
  error_count: number
  success_rate: number
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

// Integration APIs - UPDATED TO USE CORRECT ENDPOINTS
export const getIntegrations = async (data_source_id?: number): Promise<IntegrationResponse[]> => {
  try {
    const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
    const { data } = await enterpriseApi.get(`/scan/integrations${params}`)
    return data
  } catch (error) {
    console.error('Error fetching integrations:', error)
    // Return empty array as fallback to prevent crashes
    return []
  }
}

export const createIntegration = async (integration: Omit<IntegrationResponse, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationResponse> => {
  try {
    const { data } = await enterpriseApi.post('/scan/integrations', integration)
    return data
  } catch (error) {
    console.error('Error creating integration:', error)
    throw error
  }
}

export const updateIntegration = async (integration_id: number, updates: Partial<IntegrationResponse>): Promise<IntegrationResponse> => {
  try {
    const { data } = await enterpriseApi.put(`/scan/integrations/${integration_id}`, updates)
    return data
  } catch (error) {
    console.error('Error updating integration:', error)
    throw error
  }
}

export const triggerIntegrationSync = async (integration_id: number, user_id: string): Promise<boolean> => {
  try {
    const { data } = await enterpriseApi.post(`/scan/integrations/${integration_id}/sync`, { user_id })
    return data.success
  } catch (error) {
    console.error('Error triggering integration sync:', error)
    return false
  }
}

export const getIntegrationStats = async (data_source_id: number): Promise<IntegrationStats> => {
  try {
    const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/integrations`)
    return data
  } catch (error) {
    console.error('Error fetching integration stats:', error)
    // Return default stats as fallback
    return {
      total_integrations: 0,
      active_integrations: 0,
      error_integrations: 0,
      total_data_volume: 0,
      avg_success_rate: 0
    }
  }
}

export interface ReportResponse {
  id: number
  data_source_id: number
  report_name: string
  report_type: string
  description?: string
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled'
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml'
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

// Report APIs - UPDATED TO USE CORRECT ENDPOINTS
export const getReports = async (data_source_id?: number): Promise<ReportResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
        const { data } = await enterpriseApi.get(`/reports${params}`)  // Fixed: use correct backend route
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
  const { data } = await enterpriseApi.get(`/reports/stats${params}`)  // Fixed: use correct backend route
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

// Version APIs - UPDATED TO USE CORRECT ENDPOINTS
export const getVersionHistory = async (data_source_id: number): Promise<VersionResponse[]> => {
        const { data } = await enterpriseApi.get(`/versions/${data_source_id}`)  // Fixed: use correct backend route
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
// DATA SOURCE VALIDATION & ACCESS CONTROL APIs
// ============================================================================

export const useValidateDataSourceMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dataSourceId: number) => {
      const { data } = await enterpriseApi.post(`/scan/data-sources/${dataSourceId}/validate`)
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
      const { data } = await enterpriseApi.post(`/data-discovery/data-sources/${dataSourceId}/test-connection`)  // Fixed: use data-discovery route
      return data
    },
  })
}

// Access Control APIs - UPDATED TO USE CORRECT ENDPOINTS
export const useDataSourceAccessControlQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-access-control', dataSourceId],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/access-control`)  // Fixed: use correct backend route
      return data
    },
    enabled: !!dataSourceId,
    ...options,
  })
}

export const useCreateDataSourceAccessControlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await enterpriseApi.post('/security/data-sources/access-control', params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-access-control'] })
    },
  })
}

export const useUpdateDataSourceAccessControlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ permission_id, params }: any) => {
      const { data } = await enterpriseApi.put(`/security/data-sources/access-control/${permission_id}`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-access-control'] })
    },
  })
}

export const useDeleteDataSourceAccessControlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (permissionId: string) => {
      const { data } = await enterpriseApi.delete(`/security/data-sources/access-control/${permissionId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-access-control'] })
    },
  })
}

// Export aliases for backward compatibility and component usage
export const useCreateAccessControlMutation = useCreateDataSourceAccessControlMutation
export const useUpdateAccessControlMutation = useUpdateDataSourceAccessControlMutation
export const useDeleteAccessControlMutation = useDeleteDataSourceAccessControlMutation

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
      const { data } = await enterpriseApi.post('/scan/versions', params)
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
      const { data } = await enterpriseApi.post('/scan/versions/restore', params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-source-version-history'] })
    },
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

// Removed duplicate function - see first definition above

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

// User and Workspace Hooks (linking to backend user management) - UPDATED TO USE CORRECT ENDPOINTS
export const useUserQuery = (options?: any) => {
  return useQuery({
    queryKey: ['user'],
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
      const { data } = await enterpriseApi.get(`/collaboration/workspaces/${workspace_id || 'current'}`)
      return data
    },
    ...options,
  })
}

// Audit Logs Hook - UPDATED TO USE CORRECT ENDPOINTS
export const useAuditLogsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['audit-logs', data_source_id],
    queryFn: async () => {
      try {
        const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
        // Try data-source scoped route first, then fallback to global
        try {
          const { data } = await enterpriseApi.get(`/scan/audit-logs${params}`)
          return data
        } catch (e: any) {
          if (e?.response?.status === 404) {
            const { data } = await enterpriseApi.get(`/audit-logs${params}`)
            return data
          }
          throw e
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error)
        // Return mock data to prevent crashes while backend is down
        return [
          {
            id: 1,
            action: 'system_check',
            user_id: 'system',
            timestamp: new Date().toISOString(),
            details: 'Backend service unavailable - showing mock data',
            ip_address: '127.0.0.1',
            user_agent: 'Frontend Fallback'
          }
        ]
      }
    },
    retry: 1, // Only retry once to avoid overwhelming the backend
    retryDelay: 5000, // Wait 5 seconds before retry
    ...options,
  })
}

// User Permissions Hook - UPDATED TO USE CORRECT ENDPOINTS
export const useUserPermissionsQuery = (options?: any) => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data } = await enterpriseApi.get('/rbac/permissions')  // Fixed: use correct backend route
      return data
    },
    ...options,
  })
}

// System Health Hook - UPDATED TO USE CORRECT ENDPOINTS
export const useSystemHealthQuery = (options = {}) => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const { data } = await enterpriseApi.get('/health/system')
        return data
      } catch (error) {
        console.error('Error fetching system health:', error)
        // Return mock health data to prevent crashes while backend is down
        return {
          status: 'degraded',
          message: 'Backend service unavailable - showing mock data',
          timestamp: new Date().toISOString(),
          services: {
            database: 'unknown',
            api: 'down',
            cache: 'unknown'
          },
          uptime: 0,
          memory_usage: 0,
          cpu_usage: 0
        }
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
    retryDelay: 10000,
    ...options,
  })
}

// Data Source Metrics Hook - UPDATED TO USE CORRECT ENDPOINTS
export const useDataSourceMetricsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-metrics', data_source_id],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/performance-metrics`)  // Fixed: use correct backend route
      return data
    },
    enabled: !!data_source_id,
    ...options,
  })
}

// ============================================================================
// EXPORT ALL ENTERPRISE API FUNCTIONS
// ============================================================================

// All functions are already exported individually above

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
      
      // Graceful error handling
      if (err?.isGraceful) {
        console.warn('Graceful error handled:', err.message)
        
        // Emit graceful error event
        if (window.enterpriseEventBus) {
          window.enterpriseEventBus.emit('api:mutation:graceful_error', {
            error: err.message,
            variables,
            timestamp: new Date(),
            canRetry: err.canRetry,
            retryAfter: err.retryAfter
          })
        }
        
        // Don't crash the app, just log the error
        return
      }
      
      // For non-graceful errors, emit failure event
      if (window.enterpriseEventBus) {
        window.enterpriseEventBus.emit('api:mutation:failed', {
          error: err.message,
          variables,
          timestamp: new Date()
        })
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
      // WebSocket management
      connectWebSocket: (endpoint: string) => WebSocket | null
      disconnectWebSocket: (endpoint: string) => void
      getWebSocketStatus: (endpoint: string) => 'connected' | 'connecting' | 'disconnected' | 'error'
    }
  }
}

// ============================================================================
// COLLABORATION ENTERPRISE APIs - NEW IMPLEMENTATION
// ============================================================================

export interface WorkspacePermissions {
  can_edit: boolean
  can_delete: boolean
  can_invite: boolean
  can_export: boolean
  can_share: boolean
}

export interface WorkspaceSettings {
  theme: string
  notifications_enabled: boolean
  auto_save: boolean
  collaboration_mode: 'real_time' | 'manual'
}

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
export const getCollaborationWorkspaces = async (): Promise<any[]> => {
  const { data } = await enterpriseApi.get('/collaboration/workspaces');
  return data;
};

export const getWorkspaceDocuments = async (workspaceId: number): Promise<any[]> => {
  const { data } = await enterpriseApi.get(`/collaboration/workspaces/${workspaceId}/documents`);
  return data;
};

export const inviteToWorkspace = async (workspaceId: string, invitationData: any): Promise<any> => {
  const { data } = await enterpriseApi.post(`/collaboration/workspaces/${workspaceId}/invite`, invitationData);
  return data;
};

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

export const getWorkspaceActivity = async (workspaceId: string, days: number = 7): Promise<any> => {
  const { data } = await enterpriseApi.get(`/collaboration/workspaces/${workspaceId}/activity?days=${days}`)
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

// ============================================================================
// WORKFLOW ENTERPRISE APIs - NEW IMPLEMENTATION
// ============================================================================

export interface WorkflowTrigger {
  id: string
  type: 'schedule' | 'event' | 'manual' | 'webhook'
  configuration: Record<string, any>
  enabled: boolean
}

export interface WorkflowPermissions {
  can_execute: boolean
  can_modify: boolean
  can_delete: boolean
  can_share: boolean
}

export interface RetryPolicy {
  max_attempts: number
  delay_ms: number
  backoff_multiplier: number
}

export interface ExecutionLogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  data?: any
}

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

export interface HealthIssue {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
}

export interface AlertCondition {
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'ne'
  threshold: number
  duration: number
}

export interface ThresholdCondition {
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'ne'
  value: number
  enabled: boolean
}

export interface TimeSeriesPoint {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

export interface ForecastPoint {
  timestamp: string
  predicted_value: number
  confidence_interval: [number, number]
}

export interface AnomalyPoint {
  timestamp: string
  value: number
  anomaly_score: number
  is_anomaly: boolean
}

export interface SeasonalityInfo {
  period: number
  strength: number
  pattern: string
}

export interface ImpactEstimate {
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  estimated_cost?: number
  estimated_time?: number
  affected_users?: number
}

export interface CostSavings {
  current_cost: number
  projected_cost: number
  savings_percentage: number
  payback_period_months: number
  roi_percentage: number
}

export interface ImplementationStep {
  step_number: number
  title: string
  description: string
  estimated_duration_hours: number
  dependencies: string[]
  resources_required: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
}

export interface ReportMetric {
  name: string
  value: number
  unit: string
  trend: 'increasing' | 'decreasing' | 'stable'
  threshold?: number
  status: 'good' | 'warning' | 'critical'
}

export interface ReportInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'recommendation'
  title: string
  description: string
  confidence: number
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface RemediationStep {
  step_number: number
  action: string
  description: string
  estimated_time_minutes: number
  tools_required: string[]
  verification_method: string
}

export interface BusinessImpact {
  financial_impact: number
  operational_impact: number
  reputational_impact: number
  compliance_impact: number
  customer_impact: number
  overall_risk_score: number
}

export interface IOC {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'registry_key'
  value: string
  confidence: number
  source: string
  first_seen: string
  last_seen: string
}

export interface IncidentTimelineEvent {
  timestamp: string
  event_type: string
  description: string
  actor?: string
  evidence?: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface ComplianceEvidence {
  evidence_type: string
  description: string
  source: string
  collected_at: string
  collector: string
  confidence: number
  supporting_documents?: string[]
}

export interface ComplianceGap {
  gap_id: string
  control_id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  remediation_required: boolean
  estimated_remediation_time: number
  cost_estimate?: number
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
  try {
    const params = new URLSearchParams()
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.days) params.append('days', filters.days.toString())
    
    const { data } = await enterpriseApi.get(`/performance/alerts?${params.toString()}`)
    return data.data || data
  } catch (error) {
    console.error('Error fetching performance alerts:', error)
    return []
  }
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
  try {
    const params = new URLSearchParams()
    if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
    
    const { data } = await enterpriseApi.get(`/performance/thresholds?${params.toString()}`)
    return data.data || data
  } catch (error) {
    console.error('Error fetching performance thresholds:', error)
    return []
  }
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
  try {
    const params = new URLSearchParams()
    if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
    params.append('time_range', time_range)
    
    const { data } = await enterpriseApi.get(`/performance/analytics/trends?${params.toString()}`)
    return data.data || data
  } catch (error) {
    console.error('Error fetching performance trends:', error)
    return []
  }
}

export const getOptimizationRecommendations = async (dataSourceId?: number): Promise<OptimizationRecommendation[]> => {
  try {
    const params = new URLSearchParams()
    if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
    
    const { data } = await enterpriseApi.get(`/performance/optimization/recommendations?${params.toString()}`)
    return data.data || data
  } catch (error) {
    console.error('Error fetching optimization recommendations:', error)
    return []
  }
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
  try {
    const params = new URLSearchParams()
    if (options?.time_range) params.append('time_range', options.time_range)
    if (options?.time_range) params.append('time_range', options.time_range)
    if (options?.data_sources) {
      options.data_sources.forEach(id => params.append('data_sources', id.toString()))
    }
    
    const { data } = await enterpriseApi.get(`/performance/reports/summary?${params.toString()}`)
    return data.data || data
  } catch (error) {
    console.error('Error fetching performance summary report:', error)
    return {
      id: 'error',
      report_type: 'summary',
      time_range: '30d',
      data_sources: [],
      metrics: [],
      insights: [],
      recommendations: ['Failed to generate report due to error'],
      generated_at: new Date().toISOString(),
      generated_by: 'system'
    }
  }
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

export interface EnhancedSecurityIncident {
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

export interface ThreatIndicator {
  id: string
  type: string
  value: string
  confidence: number
  source: string
  first_seen: string
  last_seen: string
}

export interface MitigationAction {
  id: string
  action_type: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  assigned_to?: string
  created_at: string
  completed_at?: string
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

export interface SecurityPosture {
  overall_score: number
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  last_assessment: string
  trends: Record<string, any>
}

export interface ThreatLandscape {
  active_threats: number
  threat_level: 'low' | 'medium' | 'high' | 'critical'
  recent_attacks: number
  attack_vectors: string[]
}

export interface RiskMetrics {
  overall_risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  mitigation_efforts: number
}

export interface ComplianceStatus {
  overall_compliance: number
  frameworks: Record<string, any>
  gaps: number
  next_assessment: string
}

export interface IncidentTrends {
  total_incidents: number
  resolved_incidents: number
  avg_resolution_time: number
  trend_direction: 'improving' | 'stable' | 'worsening'
}

export interface VulnerabilityTrends {
  total_vulnerabilities: number
  critical_vulnerabilities: number
  patched_vulnerabilities: number
  trend_direction: 'improving' | 'stable' | 'worsening'
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

export interface RiskCategory {
  id: string
  name: string
  description: string
  risk_score: number
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  likelihood: 'low' | 'medium' | 'high' | 'critical'
}

export interface RiskAppetite {
  level: 'conservative' | 'moderate' | 'aggressive'
  description: string
  thresholds: Record<string, number>
}

export interface MitigationStrategy {
  id: string
  name: string
  description: string
  effectiveness: number
  cost: number
  timeline: string
  status: 'planned' | 'in_progress' | 'completed'
}

export interface RecommendationItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  timeline: string
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
  
  const { data } = await enterpriseApi.get(`/scan/data-sources/${dataSourceId}/security-audit?${params.toString()}`)
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



export const getVulnerabilityAssessments = async (filters?: {
  severity?: string
  data_source_id?: number
  status?: string
}): Promise<EnhancedVulnerabilityAssessment[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.data_source_id) params.append('data_source_id', filters.data_source_id.toString())
    if (filters?.status) params.append('status', filters.status)
    
    const { data } = await enterpriseApi.get(`/security/vulnerabilities?${params.toString()}`)
    return data.data || data
  } catch (error) {
    console.error('Error fetching vulnerability assessments:', error)
    return []
  }
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
  try {
    const params = new URLSearchParams()
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.days) params.append('days', filters.days.toString())
    
    const { data } = await enterpriseApi.get(`/security/incidents?${params.toString()}`)
    return data.data || data
  } catch (error) {
    console.error('Error fetching security incidents:', error)
    return []
  }
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



export const runComplianceCheck = async (checkRequest: {
  framework: string
  controls?: string[]
  data_source_ids?: number[]
}): Promise<any> => {
  const { data } = await enterpriseApi.post('/security/compliance/checks', checkRequest)
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

// COLLABORATION HOOKS
export const useCollaborationWorkspacesQuery = (filters?: {
  user_id?: string
  workspace_type?: string
}, options = {}) => {
  return useQuery({
    queryKey: ['collaboration', 'workspaces', filters],
    queryFn: () => getCollaborationWorkspaces(),
    staleTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    ...options,
  })
}

// Create collaboration workspace function
const createCollaborationWorkspace = async (workspaceData: any) => {
  const response = await enterpriseApi.post('/collaboration/workspaces', workspaceData)
  return response.data
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
    staleTime: 60000, // 1 minute
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
export const useEnhancedSystemHealthQuery = (include_detailed: boolean = false, options = {}) => {
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
    queryFn: () => getSecurityScans(),
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
    queryFn: () => getComplianceChecks(),
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

// Compliance Status Query - Get overall compliance status for data sources
export const useComplianceStatusQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['compliance', 'status', dataSourceId],
    queryFn: async () => {
      // Mock compliance status for now - replace with real API call
      return {
        overall_status: 'compliant',
        frameworks: {
          'GDPR': { status: 'compliant', score: 95, last_check: new Date().toISOString() },
          'HIPAA': { status: 'compliant', score: 88, last_check: new Date().toISOString() },
          'SOX': { status: 'compliant', score: 92, last_check: new Date().toISOString() }
        },
        data_source_id: dataSourceId,
        last_updated: new Date().toISOString()
      }
    },
    enabled: true,
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // 10 minutes
    ...options,
  })
}

export const useThreatDetectionQuery = (filters?: {
  threat_type?: string
  severity?: string
  days?: number
}, options = {}) => {
  return useQuery({
    queryKey: ['security', 'threats', filters],
    queryFn: () => getThreatDetection(),
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
    onError: (error: any, variables) => {
      // Graceful error handling
      if (error?.isGraceful) {
        console.warn('Graceful catalog discovery error:', error.message)
        
        // Emit graceful error event
        if (window.enterpriseEventBus) {
          window.enterpriseEventBus.emit('catalog:discovery:graceful_error', {
            dataSourceId: variables.dataSourceId,
            error: error.message,
            timestamp: new Date(),
            canRetry: error.canRetry,
            retryAfter: error.retryAfter
          })
        }
        
        // Don't crash the app, just log the error
        return
      }
      
      // Emit error event for non-graceful errors
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
          dataSourceId: dataSourceId,
          result: data,
          timestamp: new Date()
        })
      }
    },
  })
}

// Removed duplicate function declarations

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

// Removed duplicate function declaration

// Initialize global event bus if not already present
if (typeof window !== 'undefined' && !window.enterpriseEventBus) {
  const listeners: Record<string, ((data: any) => void)[]> = {}
  
  // WebSocket connection management
  let wsConnections: Record<string, WebSocket> = {}
  const wsBaseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:3000/proxy'
  
  const createWebSocketConnection = (endpoint: string) => {
    try {
      const wsUrl = `${wsBaseUrl}${endpoint}`
      console.log(`Attempting WebSocket connection to: ${wsUrl}`)
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log(`WebSocket connected to ${endpoint}`)
        // Emit connection event
        if (window.enterpriseEventBus) {
          window.enterpriseEventBus.emit('websocket:connected', { endpoint })
        }
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Emit message event
          if (window.enterpriseEventBus) {
            window.enterpriseEventBus.emit('websocket:message', { endpoint, data })
          }
        } catch (error) {
          console.warn(`Failed to parse WebSocket message from ${endpoint}:`, error)
        }
      }
      
      ws.onerror = (error) => {
        console.warn(`WebSocket error for ${endpoint} (handled gracefully):`, error)
        // Emit error event
        if (window.enterpriseEventBus) {
          window.enterpriseEventBus.emit('websocket:error', { endpoint, error })
        }
      }
      
      ws.onclose = () => {
        console.log(`WebSocket disconnected from ${endpoint}`)
        // Emit disconnect event
        if (window.enterpriseEventBus) {
          window.enterpriseEventBus.emit('websocket:disconnected', { endpoint })
        }
        // Remove from connections
        delete wsConnections[endpoint]
      }
      
      wsConnections[endpoint] = ws
      return ws
    } catch (error) {
      console.error(`Failed to create WebSocket connection to ${endpoint}:`, error)
      return null
    }
  }
  
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
    },
    
    // WebSocket management methods
    connectWebSocket: (endpoint: string) => {
      return createWebSocketConnection(endpoint)
    },
    
    disconnectWebSocket: (endpoint: string) => {
      if (wsConnections[endpoint]) {
        wsConnections[endpoint].close()
        delete wsConnections[endpoint]
      }
    },
    
    getWebSocketStatus: (endpoint: string) => {
      if (!wsConnections[endpoint]) return 'disconnected'
      const ws = wsConnections[endpoint]
      if (ws.readyState === WebSocket.CONNECTING) return 'connecting'
      if (ws.readyState === WebSocket.OPEN) return 'connected'
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) return 'disconnected'
      return 'error'
    }
  }
}

// ============================================================================
// ENTERPRISE ANALYTICS & METADATA HOOKS
// ============================================================================

// Metadata Stats Hook
export const useMetadataStatsQuery = (dataSourceId?: number, timeRange: string = '30d', options = {}) => {
  return useQuery({
    queryKey: ['metadata-stats', dataSourceId, timeRange],
    queryFn: async () => {
      const endpoint = dataSourceId 
        ? `/dashboard/metadata?timeRange=${timeRange}`
        : `/dashboard/metadata?timeRange=${timeRange}`;
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Analytics Correlations Hook
export const useAnalyticsCorrelationsQuery = (dataSourceId?: number, metricType: string = 'all', options = {}) => {
  return useQuery({
    queryKey: ['analytics-correlations', dataSourceId, metricType],
    queryFn: async () => {
      const endpoint = dataSourceId 
        ? `/enterprise/data-sources/${dataSourceId}/analytics/correlations?metricType=${metricType}`
        : `/enterprise/analytics/correlations?metricType=${metricType}`;
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Analytics Insights Hook
export const useAnalyticsInsightsQuery = (dataSourceId?: number, insightType: string = 'all', options = {}) => {
  return useQuery({
    queryKey: ['analytics-insights', dataSourceId, insightType],
    queryFn: async () => {
      const endpoint = dataSourceId 
        ? `/enterprise/data-sources/${dataSourceId}/analytics/insights?insightType=${insightType}`
        : `/enterprise/analytics/insights?insightType=${insightType}`;
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Analytics Predictions Hook
export const useAnalyticsPredictionsQuery = (dataSourceId?: number, predictionHorizon: string = '30d', options = {}) => {
  return useQuery({
    queryKey: ['analytics-predictions', dataSourceId, predictionHorizon],
    queryFn: async () => {
      const endpoint = dataSourceId 
        ? `/enterprise/data-sources/${dataSourceId}/analytics/predictions?horizon=${predictionHorizon}`
        : `/enterprise/analytics/predictions?horizon=${predictionHorizon}`;
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Analytics Patterns Hook
export const useAnalyticsPatternsQuery = (dataSourceId?: number, patternType: string = 'all', options = {}) => {
  return useQuery({
    queryKey: ['analytics-patterns', dataSourceId, patternType],
    queryFn: async () => {
      const endpoint = dataSourceId 
          ? `/scan/data-sources/${dataSourceId}/analytics/patterns?patternType=${patternType}`
  : `/analytics/patterns?patternType=${patternType}`;
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Collaboration Sessions Hook
export const useCollaborationSessionsQuery = (workspaceId?: string, options = {}) => {
  return useQuery({
    queryKey: ['collaboration-sessions', workspaceId],
    queryFn: async () => {
      const endpoint = workspaceId 
        ? `/collaboration/sessions?workspaceId=${workspaceId}`
        : '/collaboration/sessions';
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Collaboration Operations Hook
export const useCollaborationOperationsQuery = (sessionId?: string, options = {}) => {
  return useQuery({
    queryKey: ['collaboration-operations', sessionId],
    queryFn: async () => {
      const endpoint = sessionId 
        ? `/collaboration/operations?sessionId=${sessionId}`
        : '/enterprise/collaboration/operations';
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Workflow Integration Hook
export const useWorkflowIntegrationQuery = (workflowId?: string, options = {}) => {
  return useQuery({
    queryKey: ['workflow-integration', workflowId],
    queryFn: async () => {
      const endpoint = workflowId 
          ? `/workflows/integration?workflowId=${workflowId}`
  : '/workflows/integration';
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Dashboard Summary Hook
export const useDashboardSummaryQuery = (timeRange: string = '30d', options = {}) => {
  return useQuery({
    queryKey: ['dashboard-summary', timeRange],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/dashboard/summary?timeRange=${timeRange}`);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Dashboard Trends Hook
export const useDashboardTrendsQuery = (timeRange: string = '30d', trendType: string = 'all', options = {}) => {
  return useQuery({
    queryKey: ['dashboard-trends', timeRange, trendType],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/dashboard/trends?timeRange=${timeRange}&trendType=${trendType}`);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Data Source Stats Hook
export const useDataSourceStatsQuery = (dataSourceId?: number, timeRange: string = '30d', options = {}) => {
  return useQuery({
    queryKey: ['data-source-stats', dataSourceId, timeRange],
    queryFn: async () => {
      const endpoint = dataSourceId 
        ? `/scan/data-sources/${dataSourceId}/stats?timeRange=${timeRange}`
        : `/scan/data-sources/1/stats?timeRange=${timeRange}`; // Use default data source ID 1
      const { data } = await enterpriseApi.get(endpoint);
      return data;
    },
    enabled: true,
    ...options,
  });
};

// ============================================================================
// CATALOG & LINEAGE QUERY HOOKS
// ============================================================================

// Catalog Query Hook - UPDATED TO USE CORRECT ENDPOINTS
export const useCatalogQuery = (filters: any = {}, options = {}) => {
  return useQuery({
    queryKey: ['catalog', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const { data } = await enterpriseApi.get(`/catalog?${params.toString()}`);  // Fixed: use correct backend route
      return data;
    },
    enabled: true,
    ...options,
  });
};

// Lineage Query Hook - UPDATED TO USE CORRECT ENDPOINTS
export const useLineageQuery = (entityId: string, entityType: string = 'table', depth: number = 3, options = {}) => {
  return useQuery({
    queryKey: ['lineage', entityId, entityType, depth],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/lineage/entity/${entityType}/${entityId}?depth=${depth}`);  // Fixed: use correct backend route
      return data;
    },
    enabled: !!entityId,
    ...options,
  });
};