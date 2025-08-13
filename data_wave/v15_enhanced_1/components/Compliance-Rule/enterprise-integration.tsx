"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { EventEmitter } from 'events'
import { ComplianceAPIs } from './services/enterprise-apis'

// Advanced Types for Enterprise Compliance
interface ComplianceConfig {
  analytics: {
    enableRealTimeAnalytics: boolean
    enableAiInsights: boolean
    enablePredictiveAnalytics: boolean
    enableAnomalyDetection: boolean
    enableComplianceTrends: boolean
    enableRiskCorrelation: boolean
    aiInsightRefreshInterval: number
    analyticsRetentionDays: number
  }
  collaboration: {
    enableRealTimeCollaboration: boolean
    maxConcurrentUsers: number
    enableComments: boolean
    enableAnnotations: boolean
    enableLiveCursors: boolean
    enablePresenceIndicators: boolean
    enableSharedWorkspaces: boolean
    collaborationTimeout: number
  }
  workflows: {
    enableWorkflowAutomation: boolean
    enableApprovalWorkflows: boolean
    enableBulkOperations: boolean
    enableTaskAutomation: boolean
    enableWorkflowTemplates: boolean
    enableConditionalLogic: boolean
    enableEscalationRules: boolean
    workflowExecutionTimeout: number
  }
  monitoring: {
    enableRealTimeMonitoring: boolean
    enableComplianceAlerts: boolean
    enableRiskAssessment: boolean
    enableAuditTrail: boolean
    enablePerformanceMetrics: boolean
    enableSystemHealth: boolean
    enableDeadlineTracking: boolean
    monitoringInterval: number
    alertThresholds: {
      criticalRisk: number
      highRisk: number
      mediumRisk: number
      complianceScore: number
      deadlineDays: number
    }
  }
  frameworks: {
    enabledFrameworks: string[]
    autoImportRequirements: boolean
    enableCrosswalk: boolean
    enableFrameworkMapping: boolean
    customFrameworks: boolean
  }
  security: {
    enableDataEncryption: boolean
    enableAccessControl: boolean
    enableAuditLogging: boolean
    enableDataMasking: boolean
    sessionTimeout: number
    maxLoginAttempts: number
  }
}

interface ComplianceMetrics {
  totalRequirements: number
  compliantRequirements: number
  nonCompliantRequirements: number
  partiallyCompliantRequirements: number
  notAssessedRequirements: number
  complianceScore: number
  riskScore: number
  activeAssessments: number
  completedAssessments: number
  failedAssessments: number
  openGaps: number
  criticalGaps: number
  highRiskGaps: number
  mediumRiskGaps: number
  lowRiskGaps: number
  upcomingDeadlines: number
  overdueDeadlines: number
  frameworkCoverage: Record<string, number>
  trendData: {
    complianceScoreHistory: Array<{ date: string; score: number }>
    riskScoreHistory: Array<{ date: string; score: number }>
    requirementTrends: Array<{ date: string; compliant: number; nonCompliant: number }>
  }
  performanceMetrics: {
    avgAssessmentTime: number
    avgRemediationTime: number
    assessmentSuccessRate: number
    onTimeCompletionRate: number
  }
}

interface ComplianceEvent {
  id: string
  type: 'requirement_updated' | 'assessment_started' | 'assessment_completed' | 'gap_identified' | 
        'gap_resolved' | 'deadline_approaching' | 'deadline_missed' | 'compliance_alert' | 
        'risk_threshold_exceeded' | 'framework_updated' | 'workflow_started' | 'workflow_completed' |
        'user_action' | 'system_event' | 'integration_sync' | 'notification_sent'
  data: any
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  userId?: string
  entityId?: string
  entityType?: string
  metadata: Record<string, any>
  acknowledged: boolean
  tags: string[]
}

interface ComplianceUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  lastActive: Date
  isOnline: boolean
  currentWorkspace?: string
  preferences: Record<string, any>
}

interface ComplianceWorkspace {
  id: string
  name: string
  description: string
  type: 'assessment' | 'remediation' | 'review' | 'collaboration'
  participants: ComplianceUser[]
  createdAt: Date
  lastActivity: Date
  settings: Record<string, any>
}

interface ComplianceNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: Array<{ label: string; action: string }>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  expiresAt?: Date
}

interface ComplianceInsight {
  id: string
  type: 'risk_prediction' | 'compliance_recommendation' | 'anomaly_detection' | 
        'trend_analysis' | 'optimization_suggestion' | 'deadline_forecast'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  category: string
  recommendations: string[]
  data: any
  generatedAt: Date
  validUntil?: Date
  tags: string[]
}

interface EnterpriseComplianceContextType {
  // Core Configuration
  config: ComplianceConfig
  updateConfig: (updates: Partial<ComplianceConfig>) => Promise<void>
  resetConfig: () => Promise<void>
  
  // Real-time Data
  metrics: ComplianceMetrics
  events: ComplianceEvent[]
  notifications: ComplianceNotification[]
  insights: ComplianceInsight[]
  
  // Connection & Status
  isConnected: boolean
  isInitialized: boolean
  lastSync: Date | null
  systemHealth: {
    status: 'healthy' | 'degraded' | 'critical'
    uptime: number
    latency: number
    errorRate: number
  }
  
  // Actions & Operations
  executeAction: (action: string, params: any) => Promise<any>
  batchExecuteActions: (actions: Array<{ action: string; params: any }>) => Promise<any[]>
  scheduleAction: (action: string, params: any, scheduledFor: Date) => Promise<string>
  cancelScheduledAction: (actionId: string) => Promise<void>
  
  // Notifications & Alerts
  sendNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string, options?: any) => void
  markNotificationRead: (notificationId: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  subscribeToAlerts: (alertType: string, callback: (alert: any) => void) => () => void
  
  // Analytics & Insights
  getAnalytics: (timeRange?: string, filters?: any) => Promise<any>
  getInsights: (category?: string, limit?: number) => Promise<ComplianceInsight[]>
  generateInsight: (type: string, params: any) => Promise<ComplianceInsight>
  dismissInsight: (insightId: string) => Promise<void>
  
  // Collaboration
  joinCollaboration: (workspaceId: string) => Promise<void>
  leaveCollaboration: (workspaceId: string) => Promise<void>
  createWorkspace: (workspace: Partial<ComplianceWorkspace>) => Promise<ComplianceWorkspace>
  getActiveWorkspaces: () => Promise<ComplianceWorkspace[]>
  inviteToWorkspace: (workspaceId: string, userIds: string[]) => Promise<void>
  
  // Workflows
  startWorkflow: (workflowId: string, params: any) => Promise<string>
  pauseWorkflow: (instanceId: string) => Promise<void>
  resumeWorkflow: (instanceId: string) => Promise<void>
  cancelWorkflow: (instanceId: string) => Promise<void>
  approveWorkflow: (instanceId: string, decision: 'approve' | 'reject', notes?: string) => Promise<void>
  getWorkflowStatus: (instanceId: string) => Promise<any>
  
  // Monitoring & Assessment
  getComplianceStatus: (filters?: any) => Promise<any>
  getRiskAssessment: (entityId?: string, entityType?: string) => Promise<any>
  triggerAssessment: (assessmentId: string, params?: any) => Promise<string>
  getAssessmentResults: (assessmentInstanceId: string) => Promise<any>
  
  // Framework Management
  getFrameworks: () => Promise<any[]>
  importFrameworkRequirements: (framework: string, dataSourceId: number) => Promise<void>
  validateFrameworkCompliance: (framework: string, entityId: string) => Promise<any>
  createFrameworkMapping: (sourceFramework: string, targetFramework: string, mappings: any) => Promise<void>
  
  // Data Management
  backendData: any
  refreshData: (force?: boolean) => Promise<void>
  exportData: (format: 'json' | 'csv' | 'excel', filters?: any) => Promise<Blob>
  importData: (file: File, options?: any) => Promise<void>
  
  // Event Management
  addEventListener: (eventType: string, callback: (event: ComplianceEvent) => void) => () => void
  removeEventListener: (eventType: string, callback: (event: ComplianceEvent) => void) => void
  emitEvent: (event: Partial<ComplianceEvent>) => void
  getEventHistory: (filters?: any, limit?: number) => Promise<ComplianceEvent[]>
  
  // Feature Flags & Capabilities
  features: {
    analytics: boolean
    collaboration: boolean
    workflows: boolean
    monitoring: boolean
    frameworks: boolean
    security: boolean
  }
  capabilities: {
    realTimeUpdates: boolean
    bulkOperations: boolean
    advancedAnalytics: boolean
    workflowAutomation: boolean
    multiFramework: boolean
    integrations: boolean
  }
  
  // Performance & Optimization
  performanceMetrics: {
    responseTime: number
    throughput: number
    errorRate: number
    cacheHitRate: number
  }
  optimizePerformance: () => Promise<void>
  clearCache: (cacheType?: string) => Promise<void>
}

// Advanced Event Bus Implementation
class ComplianceEventBus extends EventEmitter {
  private eventHistory: ComplianceEvent[] = []
  private maxHistorySize = 1000
  
  emitComplianceEvent(event: Partial<ComplianceEvent>) {
    const fullEvent: ComplianceEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      acknowledged: false,
      tags: [],
      metadata: {},
      ...event
    } as ComplianceEvent
    
    this.eventHistory.unshift(fullEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop()
    }
    
    this.emit(fullEvent.type, fullEvent)
    this.emit('*', fullEvent)
  }
  
  getEventHistory(filters?: any, limit = 100): ComplianceEvent[] {
    let filtered = this.eventHistory
    
    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type)
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity)
      }
      if (filters.source) {
        filtered = filtered.filter(e => e.source === filters.source)
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(e => e.timestamp >= new Date(filters.dateFrom))
      }
      if (filters.dateTo) {
        filtered = filtered.filter(e => e.timestamp <= new Date(filters.dateTo))
      }
    }
    
    return filtered.slice(0, limit)
  }
}

// WebSocket Manager for Real-time Updates
class ComplianceWebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private eventBus: ComplianceEventBus
  
  constructor(eventBus: ComplianceEventBus) {
    this.eventBus = eventBus
  }
  
  connect(url: string, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = token ? `${url}?token=${token}` : url
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('Compliance WebSocket connected')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
        
        this.ws.onclose = () => {
          console.log('Compliance WebSocket disconnected')
          this.stopHeartbeat()
          this.attemptReconnect(url, token)
        }
        
        this.ws.onerror = (error) => {
          console.error('Compliance WebSocket error:', error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  
  private handleMessage(data: any) {
    switch (data.type) {
      case 'compliance_event':
        this.eventBus.emitComplianceEvent(data.payload)
        break
      case 'metrics_update':
        this.eventBus.emit('metrics_update', data.payload)
        break
      case 'notification':
        this.eventBus.emit('notification', data.payload)
        break
      case 'insight':
        this.eventBus.emit('insight', data.payload)
        break
      case 'heartbeat':
        // Handle heartbeat response
        break
      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }))
      }
    }, 30000) // 30 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
  
  private attemptReconnect(url: string, token?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect(url, token)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
  
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  
  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Performance Monitor
class CompliancePerformanceMonitor {
  private metrics = {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    cacheHitRate: 0
  }
  
  private requestTimes: number[] = []
  private errorCount = 0
  private requestCount = 0
  private cacheHits = 0
  private cacheRequests = 0
  
  recordRequest(startTime: number) {
    const responseTime = Date.now() - startTime
    this.requestTimes.push(responseTime)
    this.requestCount++
    
    // Keep only last 100 requests
    if (this.requestTimes.length > 100) {
      this.requestTimes.shift()
    }
    
    this.updateMetrics()
  }
  
  recordError() {
    this.errorCount++
    this.updateMetrics()
  }
  
  recordCacheHit() {
    this.cacheHits++
    this.cacheRequests++
    this.updateMetrics()
  }
  
  recordCacheMiss() {
    this.cacheRequests++
    this.updateMetrics()
  }
  
  private updateMetrics() {
    this.metrics.responseTime = this.requestTimes.length > 0 
      ? this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length 
      : 0
    
    this.metrics.throughput = this.requestCount
    this.metrics.errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
    this.metrics.cacheHitRate = this.cacheRequests > 0 ? (this.cacheHits / this.cacheRequests) * 100 : 0
  }
  
  getMetrics() {
    return { ...this.metrics }
  }
  
  reset() {
    this.requestTimes = []
    this.errorCount = 0
    this.requestCount = 0
    this.cacheHits = 0
    this.cacheRequests = 0
    this.updateMetrics()
  }
}

// Cache Management
class ComplianceCacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 1000
  
  set(key: string, data: any, ttl = 300000) { // 5 minutes default TTL
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need to track hits/misses for actual rate
    }
  }
}

// Advanced Configuration Manager
class ComplianceConfigManager {
  private defaultConfig: ComplianceConfig = {
    analytics: {
      enableRealTimeAnalytics: true,
      enableAiInsights: true,
      enablePredictiveAnalytics: true,
      enableAnomalyDetection: true,
      enableComplianceTrends: true,
      enableRiskCorrelation: true,
      aiInsightRefreshInterval: 60,
      analyticsRetentionDays: 30
    },
    collaboration: {
      enableRealTimeCollaboration: true,
      maxConcurrentUsers: 50,
      enableComments: true,
      enableAnnotations: true,
      enableLiveCursors: true,
      enablePresenceIndicators: true,
      enableSharedWorkspaces: true,
      collaborationTimeout: 300
    },
    workflows: {
      enableWorkflowAutomation: true,
      enableApprovalWorkflows: true,
      enableBulkOperations: true,
      enableTaskAutomation: true,
      enableWorkflowTemplates: true,
      enableConditionalLogic: true,
      enableEscalationRules: true,
      workflowExecutionTimeout: 3600
    },
    monitoring: {
      enableRealTimeMonitoring: true,
      enableComplianceAlerts: true,
      enableRiskAssessment: true,
      enableAuditTrail: true,
      enablePerformanceMetrics: true,
      enableSystemHealth: true,
      enableDeadlineTracking: true,
      monitoringInterval: 60,
      alertThresholds: {
        criticalRisk: 90,
        highRisk: 70,
        mediumRisk: 50,
        complianceScore: 95,
        deadlineDays: 7
      }
    },
    frameworks: {
      enabledFrameworks: ['SOC2', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001', 'NIST'],
      autoImportRequirements: true,
      enableCrosswalk: true,
      enableFrameworkMapping: true,
      customFrameworks: false
    },
    security: {
      enableDataEncryption: true,
      enableAccessControl: true,
      enableAuditLogging: true,
      enableDataMasking: true,
      sessionTimeout: 1800,
      maxLoginAttempts: 5
    }
  }
  
  mergeConfig(userConfig?: Partial<ComplianceConfig>): ComplianceConfig {
    if (!userConfig) return this.defaultConfig
    
    return {
      analytics: { ...this.defaultConfig.analytics, ...userConfig.analytics },
      collaboration: { ...this.defaultConfig.collaboration, ...userConfig.collaboration },
      workflows: { ...this.defaultConfig.workflows, ...userConfig.workflows },
      monitoring: { ...this.defaultConfig.monitoring, ...userConfig.monitoring },
      frameworks: { ...this.defaultConfig.frameworks, ...userConfig.frameworks },
      security: { ...this.defaultConfig.security, ...userConfig.security }
    }
  }
  
  validateConfig(config: ComplianceConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Validate analytics config
    if (config.analytics.aiInsightRefreshInterval < 30) {
      errors.push('AI insight refresh interval must be at least 30 seconds')
    }
    
    // Validate collaboration config
    if (config.collaboration.maxConcurrentUsers < 1) {
      errors.push('Max concurrent users must be at least 1')
    }
    
    // Validate monitoring config
    if (config.monitoring.monitoringInterval < 10) {
      errors.push('Monitoring interval must be at least 10 seconds')
    }
    
    // Validate security config
    if (config.security.sessionTimeout < 300) {
      errors.push('Session timeout must be at least 5 minutes')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

const EnterpriseComplianceContext = createContext<EnterpriseComplianceContextType | null>(null)

export function EnterpriseComplianceProvider({ 
  children, 
  initialConfig 
}: { 
  children: React.ReactNode
  initialConfig?: Partial<ComplianceConfig>
}) {
  const router = useRouter()
  const configManager = useMemo(() => new ComplianceConfigManager(), [])
  const cacheManager = useMemo(() => new ComplianceCacheManager(), [])
  
  // Configuration state
  const [config, setConfig] = useState<ComplianceConfig>(() => 
    configManager.mergeConfig(initialConfig)
  )
  
  // Real-time state
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalRequirements: 0,
    compliantRequirements: 0,
    nonCompliantRequirements: 0,
    partiallyCompliantRequirements: 0,
    notAssessedRequirements: 0,
    complianceScore: 0,
    riskScore: 0,
    activeAssessments: 0,
    completedAssessments: 0,
    failedAssessments: 0,
    openGaps: 0,
    criticalGaps: 0,
    highRiskGaps: 0,
    mediumRiskGaps: 0,
    lowRiskGaps: 0,
    upcomingDeadlines: 0,
    overdueDeadlines: 0,
    frameworkCoverage: {},
    trendData: {
      complianceScoreHistory: [],
      riskScoreHistory: [],
      requirementTrends: []
    },
    performanceMetrics: {
      avgAssessmentTime: 0,
      avgRemediationTime: 0,
      assessmentSuccessRate: 0,
      onTimeCompletionRate: 0
    }
  })
  
  const [events, setEvents] = useState<ComplianceEvent[]>([])
  const [notifications, setNotifications] = useState<ComplianceNotification[]>([])
  const [insights, setInsights] = useState<ComplianceInsight[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [systemHealth, setSystemHealth] = useState<{
    status: 'healthy' | 'degraded' | 'critical'
    uptime: number
    latency: number
    errorRate: number
  }>({ status: 'healthy', uptime: 0, latency: 0, errorRate: 0 })
  const [backendData, setBackendData] = useState<any>(null)
  
  // Event Bus and WebSocket
  const eventBus = useMemo(() => new ComplianceEventBus(), [])
  const wsManager = useMemo(() => new ComplianceWebSocketManager(eventBus), [])
  const performanceMonitor = useMemo(() => new CompliancePerformanceMonitor(), [])
  
  // Feature flags
  const features = useMemo(() => ({
    analytics: config.analytics.enableRealTimeAnalytics,
    collaboration: config.collaboration.enableRealTimeCollaboration,
    workflows: config.workflows.enableWorkflowAutomation,
    monitoring: config.monitoring.enableRealTimeMonitoring,
    frameworks: config.frameworks.enabledFrameworks.length > 0,
    security: config.security.enableAccessControl
  }), [config])
  
  // Update configuration
  const updateConfig = useCallback(async (updates: Partial<ComplianceConfig>) => {
    try {
      const response = await fetch('/api/compliance/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })
      if (!response.ok) throw new Error('Failed to update config')
      const updatedConfig = await response.json()
      setConfig(prev => ({ ...prev, ...updatedConfig }))
      toast.success('Configuration updated successfully')
    } catch (error) {
      console.error('Failed to update config:', error)
      toast.error('Failed to update configuration')
    }
  }, [])

  const resetConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/config/reset', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to reset config')
      const resetConfig = await response.json()
      setConfig(resetConfig)
      toast.success('Configuration reset successfully')
    } catch (error) {
      console.error('Failed to reset config:', error)
      toast.error('Failed to reset configuration')
    }
  }, [])
  
  // Execute actions
  const executeAction = useCallback(async (action: string, params: any) => {
    try {
      console.log(`Executing compliance action: ${action}`, params)
      performanceMonitor.recordRequest(Date.now())
      
      // Simulate backend call
      const response = await fetch('/api/compliance/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params })
      })
      
      if (!response.ok) {
        performanceMonitor.recordError()
        throw new Error('Action failed')
      }
      
      const result = await response.json()
      performanceMonitor.recordRequest(Date.now())
      
      // Add event
      eventBus.emitComplianceEvent({
        type: 'user_action',
        data: { action, params, result },
        source: 'user',
        userId: 'current_user', // Placeholder for actual user ID
        timestamp: new Date()
      })
      
      return result
    } catch (error) {
      console.error('Action execution failed:', error)
      performanceMonitor.recordError()
      throw error
    }
  }, [performanceMonitor, eventBus])

  const batchExecuteActions = useCallback(async (actions: Array<{ action: string; params: any }>) => {
    try {
      console.log('Executing batch actions:', actions)
      performanceMonitor.recordRequest(Date.now())

      const results: any[] = []
      for (const { action, params } of actions) {
        const response = await fetch('/api/compliance/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, params })
        })
        if (!response.ok) {
          performanceMonitor.recordError()
          throw new Error(`Action failed: ${action}`)
        }
        results.push(await response.json())
      }
      performanceMonitor.recordRequest(Date.now())
      return results
    } catch (error) {
      console.error('Batch action execution failed:', error)
      performanceMonitor.recordError()
      throw error
    }
  }, [performanceMonitor])

  const scheduleAction = useCallback(async (action: string, params: any, scheduledFor: Date) => {
    try {
      console.log(`Scheduling action: ${action} for ${scheduledFor}`, params)
      const response = await fetch('/api/compliance/actions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params, scheduledFor })
      })
      if (!response.ok) throw new Error('Failed to schedule action')
      const actionId = await response.json()
      return actionId
    } catch (error) {
      console.error('Failed to schedule action:', error)
      throw error
    }
  }, [])

  const cancelScheduledAction = useCallback(async (actionId: string) => {
    try {
      console.log(`Cancelling scheduled action with ID: ${actionId}`)
      const response = await fetch(`/api/compliance/actions/schedule/${actionId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to cancel scheduled action')
      toast.success('Scheduled action cancelled')
    } catch (error) {
      console.error('Failed to cancel scheduled action:', error)
      toast.error('Failed to cancel scheduled action')
    }
  }, [])
  
  // Send notifications
  const sendNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, options?: any) => {
    const notification: ComplianceNotification = {
      id: crypto.randomUUID(),
      type,
      title: type.toUpperCase(),
      message,
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      category: 'general',
      ...options
    }
    setNotifications(prev => [...prev, notification])
    toast[type](message)
  }, [])
  
  // Mark notifications
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/compliance/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/notifications/read-all', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark all notifications as read')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }, [])
  
  // Subscribe to alerts
  const subscribeToAlerts = useCallback((alertType: string, callback: (alert: any) => void) => {
    eventBus.on(alertType, callback)
    return () => eventBus.off(alertType, callback)
  }, [eventBus])
  
  // Analytics functions
  const getAnalytics = useCallback(async (timeRange?: string, filters?: any) => {
    try {
      const params = new URLSearchParams({})
      if (timeRange) params.append('timeRange', timeRange)
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
      }
      const response = await fetch(`/api/compliance/analytics?${params.toString()}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return null
    }
  }, [])
  
  const getInsights = useCallback(async (category?: string, limit?: number) => {
    try {
      const params = new URLSearchParams({})
      if (category) params.append('category', category)
      if (limit) params.append('limit', String(limit))
      const response = await fetch(`/api/compliance/insights?${params.toString()}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get insights:', error)
      return []
    }
  }, [])

  const generateInsight = useCallback(async (type: string, params: any) => {
    try {
      const response = await fetch('/api/compliance/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, params })
      })
      if (!response.ok) throw new Error('Failed to generate insight')
      return await response.json()
    } catch (error) {
      console.error('Failed to generate insight:', error)
      throw error
    }
  }, [])

  const dismissInsight = useCallback(async (insightId: string) => {
    try {
      const response = await fetch(`/api/compliance/insights/${insightId}/dismiss`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to dismiss insight')
      setInsights(prev => prev.filter(i => i.id !== insightId))
      toast.success('Insight dismissed')
    } catch (error) {
      console.error('Failed to dismiss insight:', error)
      toast.error('Failed to dismiss insight')
    }
  }, [])
  
  // Collaboration functions
  const joinCollaboration = useCallback(async (workspaceId: string) => {
    try {
      await fetch('/api/compliance/collaboration/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })
      eventBus.emitComplianceEvent({
        type: 'collaboration_event',
        data: { action: 'join', workspaceId },
        source: 'user',
        userId: 'current_user',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Failed to join collaboration:', error)
      eventBus.emitComplianceEvent({
        type: 'collaboration_event',
        data: { action: 'join_failed', workspaceId, error: error.message },
        source: 'system',
        severity: 'high',
        timestamp: new Date()
      })
    }
  }, [eventBus])
  
  const leaveCollaboration = useCallback(async (workspaceId: string) => {
    try {
      await fetch('/api/compliance/collaboration/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })
      eventBus.emitComplianceEvent({
        type: 'collaboration_event',
        data: { action: 'leave', workspaceId },
        source: 'user',
        userId: 'current_user',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Failed to leave collaboration:', error)
      eventBus.emitComplianceEvent({
        type: 'collaboration_event',
        data: { action: 'leave_failed', workspaceId, error: error.message },
        source: 'system',
        severity: 'high',
        timestamp: new Date()
      })
    }
  }, [eventBus])

  const createWorkspace = useCallback(async (workspace: Partial<ComplianceWorkspace>) => {
    try {
      const response = await fetch('/api/compliance/collaboration/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspace)
      })
      if (!response.ok) throw new Error('Failed to create workspace')
      const newWorkspace = await response.json()
      setNotifications(prev => [...prev, {
        id: newWorkspace.id,
        type: 'info',
        title: 'New Workspace',
        message: `Workspace "${newWorkspace.name}" created.`,
        timestamp: new Date(),
        read: false,
        priority: 'low',
        category: 'workspace'
      }])
      return newWorkspace
    } catch (error) {
      console.error('Failed to create workspace:', error)
      toast.error('Failed to create workspace')
      throw error
    }
  }, [])

  const getActiveWorkspaces = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/collaboration/workspaces')
      if (!response.ok) throw new Error('Failed to get workspaces')
      const workspaces = await response.json()
      return workspaces
    } catch (error) {
      console.error('Failed to get workspaces:', error)
      toast.error('Failed to get workspaces')
      throw error
    }
  }, [])

  const inviteToWorkspace = useCallback(async (workspaceId: string, userIds: string[]) => {
    try {
      const response = await fetch(`/api/compliance/collaboration/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds })
      })
      if (!response.ok) throw new Error('Failed to invite users to workspace')
      toast.success(`Users invited to workspace ${workspaceId}`)
    } catch (error) {
      console.error('Failed to invite users to workspace:', error)
      toast.error('Failed to invite users to workspace')
    }
  }, [])
  
  // Workflow functions
  const startWorkflow = useCallback(async (workflowId: string, params: any) => {
    try {
      const workflowInstanceId = await ComplianceAPIs.Workflow.startWorkflow(parseInt(workflowId), params)
      eventBus.emitComplianceEvent({
        type: 'workflow_started',
        data: { workflowId, params, workflowInstanceId },
        source: 'user',
        userId: 'current_user',
        timestamp: new Date()
      })
      return workflowInstanceId
    } catch (error) {
      console.error('Failed to start workflow:', error)
      eventBus.emitComplianceEvent({
        type: 'workflow_event',
        data: { workflowId, action: 'start_failed', error: error.message },
        source: 'system',
        severity: 'high',
        timestamp: new Date()
      })
      throw error
    }
  }, [eventBus])

  const pauseWorkflow = useCallback(async (instanceId: string) => {
    try {
      const response = await fetch(`/api/compliance/workflows/${instanceId}/pause`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to pause workflow')
      toast.info(`Workflow ${instanceId} paused`)
    } catch (error) {
      console.error('Failed to pause workflow:', error)
      toast.error('Failed to pause workflow')
    }
  }, [])

  const resumeWorkflow = useCallback(async (instanceId: string) => {
    try {
      const response = await fetch(`/api/compliance/workflows/${instanceId}/resume`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to resume workflow')
      toast.info(`Workflow ${instanceId} resumed`)
    } catch (error) {
      console.error('Failed to resume workflow:', error)
      toast.error('Failed to resume workflow')
    }
  }, [])

  const cancelWorkflow = useCallback(async (instanceId: string) => {
    try {
      const response = await fetch(`/api/compliance/workflows/${instanceId}/cancel`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to cancel workflow')
      toast.info(`Workflow ${instanceId} cancelled`)
    } catch (error) {
      console.error('Failed to cancel workflow:', error)
      toast.error('Failed to cancel workflow')
    }
  }, [])

  const approveWorkflow = useCallback(async (instanceId: string, decision: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch(`/api/compliance/workflows/${instanceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes })
      })
      if (!response.ok) throw new Error('Failed to approve workflow')
      eventBus.emitComplianceEvent({
        type: 'workflow_completed',
        data: { workflowInstanceId: instanceId, decision, notes },
        source: 'user',
        userId: 'current_user',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Failed to approve workflow:', error)
      eventBus.emitComplianceEvent({
        type: 'workflow_event',
        data: { workflowInstanceId: instanceId, action: 'approve_failed', error: error.message },
        source: 'system',
        severity: 'high',
        timestamp: new Date()
      })
      throw error
    }
  }, [eventBus])

  const getWorkflowStatus = useCallback(async (instanceId: string) => {
    try {
      const response = await fetch(`/api/compliance/workflows/${instanceId}/status`)
      if (!response.ok) throw new Error('Failed to get workflow status')
      return await response.json()
    } catch (error) {
      console.error('Failed to get workflow status:', error)
      throw error
    }
  }, [])
  
  // Monitoring & Assessment functions
  const getComplianceStatus = useCallback(async (filters?: any) => {
    try {
      const params = new URLSearchParams({})
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
      }
      const response = await fetch(`/api/compliance/status?${params.toString()}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get compliance status:', error)
      return null
    }
  }, [])

  const getRiskAssessment = useCallback(async (entityId?: string, entityType?: string) => {
    try {
      const params = new URLSearchParams({})
      if (entityId) params.append('entityId', entityId)
      if (entityType) params.append('entityType', entityType)
      const response = await fetch(`/api/compliance/risk-assessment?${params.toString()}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to get risk assessment:', error)
      return null
    }
  }, [])

  const triggerAssessment = useCallback(async (assessmentId: string, params?: any) => {
    try {
      const response = await fetch(`/api/compliance/assessments/${assessmentId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      if (!response.ok) throw new Error('Failed to trigger assessment')
      const assessmentInstanceId = await response.json()
      eventBus.emitComplianceEvent({
        type: 'assessment_started',
        data: { assessmentId, params, assessmentInstanceId },
        source: 'user',
        userId: 'current_user',
        timestamp: new Date()
      })
      return assessmentInstanceId
    } catch (error) {
      console.error('Failed to trigger assessment:', error)
      eventBus.emitComplianceEvent({
        type: 'assessment_event',
        data: { assessmentId, action: 'trigger_failed', error: error.message },
        source: 'system',
        severity: 'high',
        timestamp: new Date()
      })
      throw error
    }
  }, [eventBus])

  const getAssessmentResults = useCallback(async (assessmentInstanceId: string) => {
    try {
      const response = await fetch(`/api/compliance/assessments/${assessmentInstanceId}/results`)
      if (!response.ok) throw new Error('Failed to get assessment results')
      return await response.json()
    } catch (error) {
      console.error('Failed to get assessment results:', error)
      throw error
    }
  }, [])
  
  // Framework Management functions
  const getFrameworks = useCallback(async () => {
    try {
      const frameworks = await ComplianceAPIs.Framework.getFrameworks()
      return frameworks
    } catch (error) {
      console.error('Failed to get frameworks:', error)
      toast.error('Failed to get frameworks')
      throw error
    }
  }, [])

  const importFrameworkRequirements = useCallback(async (framework: string, dataSourceId: number) => {
    try {
      await ComplianceAPIs.Framework.importFrameworkRequirements(framework, dataSourceId)
      toast.success(`Framework "${framework}" requirements imported.`)
    } catch (error) {
      console.error('Failed to import framework requirements:', error)
      toast.error('Failed to import framework requirements')
    }
  }, [])

  const validateFrameworkCompliance = useCallback(async (framework: string, entityId: string) => {
    try {
      const result = await ComplianceAPIs.Framework.validateFrameworkCompliance(framework, entityId)
      return result
    } catch (error) {
      console.error('Failed to validate framework compliance:', error)
      throw error
    }
  }, [])

  const createFrameworkMapping = useCallback(async (sourceFramework: string, targetFramework: string, mappings: any) => {
    try {
      await ComplianceAPIs.Framework.createFrameworkMapping(sourceFramework, targetFramework, mappings)
      toast.success(`Framework mapping created for ${sourceFramework} to ${targetFramework}`)
    } catch (error) {
      console.error('Failed to create framework mapping:', error)
      toast.error('Failed to create framework mapping')
    }
  }, [])
  
     // Data Management
   const refreshData = useCallback(async (force?: boolean) => {
     try {
       const cacheKey = 'compliance_data'
       
       // Check cache first unless force refresh
       if (!force) {
         const cachedData = cacheManager.get(cacheKey)
         if (cachedData) {
           setBackendData(cachedData.status)
           setMetrics(cachedData.metrics)
           setEvents(cachedData.events)
           setNotifications(cachedData.notifications)
           setInsights(cachedData.insights)
           setLastSync(new Date(cachedData.timestamp))
           setIsInitialized(true)
           performanceMonitor.recordCacheHit()
           return
         }
         performanceMonitor.recordCacheMiss()
       }
       
       const startTime = Date.now()
       const [statusResponse, metricsResponse, eventsResponse, notificationsResponse, insightsResponse] = await Promise.all([
         fetch('/api/compliance/status'),
         fetch('/api/compliance/metrics'),
         fetch('/api/compliance/events'),
         fetch('/api/compliance/notifications'),
         fetch('/api/compliance/insights')
       ])
       
       const status = await statusResponse.json()
       const metricsData = await metricsResponse.json()
       const eventsData = await eventsResponse.json()
       const notificationsData = await notificationsResponse.json()
       const insightsData = await insightsResponse.json()
       
       // Cache the data
       const dataToCache = {
         status,
         metrics: metricsData,
         events: eventsData,
         notifications: notificationsData,
         insights: insightsData,
         timestamp: Date.now()
       }
       cacheManager.set(cacheKey, dataToCache, 60000) // Cache for 1 minute
       
       setBackendData(status)
       setMetrics(metricsData)
       setEvents(eventsData)
       setNotifications(notificationsData)
       setInsights(insightsData)
       setLastSync(new Date())
       setIsInitialized(true)
       
       performanceMonitor.recordRequest(startTime)
       
       // Emit refresh event
       eventBus.emitComplianceEvent({
         type: 'system_event',
         data: { action: 'data_refreshed', force },
         source: 'system',
         severity: 'low'
       })
       
     } catch (error) {
       console.error('Failed to refresh data:', error)
       performanceMonitor.recordError()
       setIsInitialized(false)
       
       // Emit error event
       eventBus.emitComplianceEvent({
         type: 'system_event',
         data: { action: 'data_refresh_failed', error: error.message },
         source: 'system',
         severity: 'high'
       })
     }
   }, [cacheManager, performanceMonitor, eventBus])
   
   // Export data functionality
   const exportData = useCallback(async (format: 'json' | 'csv' | 'excel', filters?: any) => {
     try {
       const params = new URLSearchParams({ format })
       if (filters) {
         Object.entries(filters).forEach(([key, value]) => {
           if (value !== undefined && value !== null) {
             params.append(key, String(value))
           }
         })
       }
       
       const response = await fetch(`/api/compliance/export?${params.toString()}`)
       if (!response.ok) throw new Error('Failed to export data')
       
       const blob = await response.blob()
       
       // Create download link
       const url = window.URL.createObjectURL(blob)
       const a = document.createElement('a')
       a.href = url
       a.download = `compliance_data_${new Date().toISOString().split('T')[0]}.${format}`
       document.body.appendChild(a)
       a.click()
       window.URL.revokeObjectURL(url)
       document.body.removeChild(a)
       
       toast.success(`Data exported as ${format.toUpperCase()}`)
       return blob
     } catch (error) {
       console.error('Failed to export data:', error)
       toast.error('Failed to export data')
       throw error
     }
   }, [])
   
   // Import data functionality
   const importData = useCallback(async (file: File, options?: any) => {
     try {
       const formData = new FormData()
       formData.append('file', file)
       if (options) {
         formData.append('options', JSON.stringify(options))
       }
       
       const response = await fetch('/api/compliance/import', {
         method: 'POST',
         body: formData
       })
       
       if (!response.ok) throw new Error('Failed to import data')
       
       const result = await response.json()
       toast.success(`Data imported successfully: ${result.recordsImported} records`)
       
       // Refresh data after import
       await refreshData(true)
       
       return result
     } catch (error) {
       console.error('Failed to import data:', error)
       toast.error('Failed to import data')
       throw error
     }
   }, [refreshData])
   
   // Performance optimization
   const optimizePerformance = useCallback(async () => {
     try {
       // Clear old cache entries
       cacheManager.clear()
       
       // Reset performance metrics
       performanceMonitor.reset()
       
       // Trigger garbage collection if available
       if (window.gc) {
         window.gc()
       }
       
       toast.success('Performance optimized')
     } catch (error) {
       console.error('Failed to optimize performance:', error)
       toast.error('Failed to optimize performance')
     }
   }, [cacheManager, performanceMonitor])
   
   // Clear cache
   const clearCache = useCallback(async (cacheType?: string) => {
     try {
       if (cacheType) {
         cacheManager.clear(cacheType)
         toast.success(`${cacheType} cache cleared`)
       } else {
         cacheManager.clear()
         toast.success('All cache cleared')
       }
     } catch (error) {
       console.error('Failed to clear cache:', error)
       toast.error('Failed to clear cache')
     }
   }, [cacheManager])
  
  // Event Management
  const addEventListener = useCallback((eventType: string, callback: (event: ComplianceEvent) => void) => {
    eventBus.on(eventType, callback)
    return () => eventBus.off(eventType, callback)
  }, [eventBus])

  const removeEventListener = useCallback((eventType: string, callback: (event: ComplianceEvent) => void) => {
    eventBus.off(eventType, callback)
  }, [eventBus])

  const emitEvent = useCallback((event: Partial<ComplianceEvent>) => {
    eventBus.emitComplianceEvent(event)
  }, [eventBus])

  const getEventHistory = useCallback(async (filters?: any, limit?: number) => {
    return eventBus.getEventHistory(filters, limit)
  }, [eventBus])
  
  // Initialize connection and data
  useEffect(() => {
    const initializeCompliance = async () => {
      try {
        setIsConnected(true)
        await refreshData()
        
        // Set up real-time updates if enabled
        if (config.monitoring.enableRealTimeMonitoring) {
          await wsManager.connect(`${window.location.origin}/api/compliance/ws`) // Replace with your WebSocket endpoint
          eventBus.on('*', (event) => {
            if (event.type === 'compliance_event') {
              // Simulate WebSocket event for context
              setEvents(prev => [...prev, event.payload])
            }
          })
        }
      } catch (error) {
        console.error('Failed to initialize compliance:', error)
        setIsConnected(false)
      }
    }
    
    initializeCompliance()
  }, [config.monitoring.enableRealTimeMonitoring, refreshData, wsManager, eventBus])

  // System Health Monitoring
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch('/api/compliance/health')
        if (response.ok) {
          setSystemHealth({ status: 'healthy', uptime: 0, latency: 0, errorRate: 0 }) // Placeholder, actual health check needed
        } else {
          setSystemHealth({ status: 'critical', uptime: 0, latency: 0, errorRate: 0 }) // Placeholder
        }
      } catch (error) {
        setSystemHealth({ status: 'critical', uptime: 0, latency: 0, errorRate: 0 }) // Placeholder
      }
    }

    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  // Performance Monitoring
  useEffect(() => {
    const recordPerformance = () => {
      performanceMonitor.recordRequest(Date.now())
    }

    // Record initial performance
    recordPerformance()

    // Record performance for all fetch calls
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = Date.now()
      const response = await originalFetch(...args)
      recordPerformance()
      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [performanceMonitor])
  
  const contextValue: EnterpriseComplianceContextType = {
    config,
    updateConfig,
    resetConfig,
    metrics,
    events,
    notifications,
    insights,
    isConnected,
    isInitialized,
    lastSync,
    systemHealth,
    executeAction,
    batchExecuteActions,
    scheduleAction,
    cancelScheduledAction,
    sendNotification,
    markNotificationRead,
    markAllNotificationsRead,
    subscribeToAlerts,
    getAnalytics,
    getInsights,
    generateInsight,
    dismissInsight,
    joinCollaboration,
    leaveCollaboration,
    createWorkspace,
    getActiveWorkspaces,
    inviteToWorkspace,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    approveWorkflow,
    getWorkflowStatus,
    getComplianceStatus,
    getRiskAssessment,
    triggerAssessment,
    getAssessmentResults,
    getFrameworks,
    importFrameworkRequirements,
    validateFrameworkCompliance,
    createFrameworkMapping,
         backendData,
     refreshData,
     exportData,
     importData,
     addEventListener,
     removeEventListener,
     emitEvent,
     getEventHistory,
     features,
     capabilities: {
       realTimeUpdates: config.monitoring.enableRealTimeMonitoring,
       bulkOperations: config.workflows.enableBulkOperations,
       advancedAnalytics: config.analytics.enableRealTimeAnalytics || config.analytics.enableComplianceTrends || config.analytics.enableRiskCorrelation,
       workflowAutomation: config.workflows.enableWorkflowAutomation,
       multiFramework: config.frameworks.enabledFrameworks.length > 0,
       integrations: true // Placeholder, actual integrations would be tracked here
     },
     performanceMetrics: performanceMonitor.getMetrics(),
     optimizePerformance,
     clearCache
  }
  
  return (
    <EnterpriseComplianceContext.Provider value={contextValue}>
      {children}
    </EnterpriseComplianceContext.Provider>
  )
}

export function useEnterpriseCompliance() {
  const context = useContext(EnterpriseComplianceContext)
  if (!context) {
    throw new Error('useEnterpriseCompliance must be used within EnterpriseComplianceProvider')
  }
  return context
}

// Additional utility hooks for specific compliance features
export function useComplianceMetrics() {
  const { metrics, refreshData, getAnalytics } = useEnterpriseCompliance()
  
  const refreshMetrics = useCallback(async () => {
    await refreshData(true)
  }, [refreshData])
  
  const getDetailedMetrics = useCallback(async (timeRange?: string) => {
    return await getAnalytics(timeRange)
  }, [getAnalytics])
  
  return {
    metrics,
    refreshMetrics,
    getDetailedMetrics
  }
}

export function useComplianceEvents() {
  const { events, addEventListener, removeEventListener, emitEvent, getEventHistory } = useEnterpriseCompliance()
  
  const subscribeToEvents = useCallback((eventType: string, callback: (event: ComplianceEvent) => void) => {
    return addEventListener(eventType, callback)
  }, [addEventListener])
  
  const publishEvent = useCallback((event: Partial<ComplianceEvent>) => {
    emitEvent(event)
  }, [emitEvent])
  
  const getFilteredEvents = useCallback(async (filters: any, limit?: number) => {
    return await getEventHistory(filters, limit)
  }, [getEventHistory])
  
  return {
    events,
    subscribeToEvents,
    publishEvent,
    getFilteredEvents
  }
}

export function useComplianceNotifications() {
  const { 
    notifications, 
    sendNotification, 
    markNotificationRead, 
    markAllNotificationsRead,
    subscribeToAlerts 
  } = useEnterpriseCompliance()
  
  const notify = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, options?: any) => {
    sendNotification(type, message, options)
  }, [sendNotification])
  
  const markAsRead = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId)
  }, [markNotificationRead])
  
  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsRead()
  }, [markAllNotificationsRead])
  
  const subscribeToAlertType = useCallback((alertType: string, callback: (alert: any) => void) => {
    return subscribeToAlerts(alertType, callback)
  }, [subscribeToAlerts])
  
  return {
    notifications,
    notify,
    markAsRead,
    markAllAsRead,
    subscribeToAlertType
  }
}

export function useComplianceWorkflows() {
  const { 
    startWorkflow, 
    pauseWorkflow, 
    resumeWorkflow, 
    cancelWorkflow, 
    approveWorkflow,
    getWorkflowStatus 
  } = useEnterpriseCompliance()
  
  const executeWorkflow = useCallback(async (workflowId: string, params: any) => {
    return await startWorkflow(workflowId, params)
  }, [startWorkflow])
  
  const manageWorkflow = useCallback(async (instanceId: string, action: 'pause' | 'resume' | 'cancel') => {
    switch (action) {
      case 'pause':
        await pauseWorkflow(instanceId)
        break
      case 'resume':
        await resumeWorkflow(instanceId)
        break
      case 'cancel':
        await cancelWorkflow(instanceId)
        break
    }
  }, [pauseWorkflow, resumeWorkflow, cancelWorkflow])
  
  const approveWorkflowInstance = useCallback(async (instanceId: string, decision: 'approve' | 'reject', notes?: string) => {
    await approveWorkflow(instanceId, decision, notes)
  }, [approveWorkflow])
  
  const getWorkflowInstanceStatus = useCallback(async (instanceId: string) => {
    return await getWorkflowStatus(instanceId)
  }, [getWorkflowStatus])
  
  return {
    executeWorkflow,
    manageWorkflow,
    approveWorkflowInstance,
    getWorkflowInstanceStatus
  }
}

export function useComplianceFrameworks() {
  const { 
    getFrameworks, 
    importFrameworkRequirements, 
    validateFrameworkCompliance,
    createFrameworkMapping 
  } = useEnterpriseCompliance()
  
  const loadFrameworks = useCallback(async () => {
    return await getFrameworks()
  }, [getFrameworks])
  
  const importRequirements = useCallback(async (framework: string, dataSourceId: number) => {
    await importFrameworkRequirements(framework, dataSourceId)
  }, [importFrameworkRequirements])
  
  const validateCompliance = useCallback(async (framework: string, entityId: string) => {
    return await validateFrameworkCompliance(framework, entityId)
  }, [validateFrameworkCompliance])
  
  const createMapping = useCallback(async (sourceFramework: string, targetFramework: string, mappings: any) => {
    await createFrameworkMapping(sourceFramework, targetFramework, mappings)
  }, [createFrameworkMapping])
  
  return {
    loadFrameworks,
    importRequirements,
    validateCompliance,
    createMapping
  }
}

export function useCompliancePerformance() {
  const { performanceMetrics, optimizePerformance, clearCache, systemHealth } = useEnterpriseCompliance()
  
  const optimize = useCallback(async () => {
    await optimizePerformance()
  }, [optimizePerformance])
  
  const clearCacheData = useCallback(async (cacheType?: string) => {
    await clearCache(cacheType)
  }, [clearCache])
  
  return {
    performanceMetrics,
    systemHealth,
    optimize,
    clearCacheData
  }
}

// Export all hooks as a collection
export const ComplianceHooks = {
  useEnterpriseCompliance,
  useComplianceMetrics,
  useComplianceEvents,
  useComplianceNotifications,
  useComplianceWorkflows,
  useComplianceFrameworks,
  useCompliancePerformance
}