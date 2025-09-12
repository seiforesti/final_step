// Global WebSocket Manager for Data Sources SPA
// This replaces ALL polling with real-time WebSocket communication

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  source?: string
}

export interface WebSocketSubscription {
  id: string
  type: string
  callback: (data: any) => void
  filters?: Record<string, any>
}

export class GlobalWebSocketManager {
  private static instance: GlobalWebSocketManager
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private pingInterval: NodeJS.Timeout | null = null
  private subscriptions: Map<string, WebSocketSubscription> = new Map()
  private messageQueue: WebSocketMessage[] = []
  private isConnected = false
  private connectionUrl: string
  private onConnectionChange: ((connected: boolean) => void) | null = null
  private onError: ((error: any) => void) | null = null

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    this.connectionUrl = `${protocol}//${window.location.host}/ws/data-sources/global`
  }

  static getInstance(): GlobalWebSocketManager {
    if (!GlobalWebSocketManager.instance) {
      GlobalWebSocketManager.instance = new GlobalWebSocketManager()
    }
    return GlobalWebSocketManager.instance
  }

  // Connection Management
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to Global WebSocket:', this.connectionUrl)
        
        this.ws = new WebSocket(this.connectionUrl)
        
        this.ws.onopen = () => {
          console.log('✅ Global WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.startPingInterval()
          this.processMessageQueue()
          this.onConnectionChange?.(true)
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('🔌 Global WebSocket disconnected:', event.code, event.reason)
          this.isConnected = false
          this.stopPingInterval()
          this.onConnectionChange?.(false)
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            setTimeout(() => {
              this.connect().catch(console.error)
            }, this.reconnectDelay * this.reconnectAttempts)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('❌ Global WebSocket error:', error)
          this.onError?.(error)
          reject(error)
        }
        
      } catch (error) {
        console.error('❌ Failed to create Global WebSocket connection:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    console.log('🔌 Disconnecting Global WebSocket')
    this.stopPingInterval()
    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect')
      this.ws = null
    }
    this.isConnected = false
    this.onConnectionChange?.(false)
  }

  // Message Handling
  private handleMessage(message: WebSocketMessage): void {
    console.log('📨 Global WebSocket message received:', message)
    
    // Process all subscriptions
    this.subscriptions.forEach((subscription) => {
      if (this.matchesSubscription(message, subscription)) {
        try {
          subscription.callback(message.data)
        } catch (error) {
          console.error('❌ Error in subscription callback:', error)
        }
      }
    })
  }

  private matchesSubscription(message: WebSocketMessage, subscription: WebSocketSubscription): boolean {
    // Check type match
    if (subscription.type !== '*' && message.type !== subscription.type) {
      return false
    }

    // Check filters
    if (subscription.filters) {
      for (const [key, value] of Object.entries(subscription.filters)) {
        if (message.data?.[key] !== value) {
          return false
        }
      }
    }

    return true
  }

  // Subscription Management
  subscribe(
    type: string, 
    callback: (data: any) => void, 
    filters?: Record<string, any>
  ): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const subscription: WebSocketSubscription = {
      id,
      type,
      callback,
      filters
    }
    
    this.subscriptions.set(id, subscription)
    console.log(`📡 Subscribed to ${type} with ID: ${id}`)
    
    return id
  }

  unsubscribe(id: string): void {
    if (this.subscriptions.has(id)) {
      this.subscriptions.delete(id)
      console.log(`📡 Unsubscribed from ID: ${id}`)
    }
  }

  // Message Sending
  sendMessage(type: string, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString()
    }

    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message))
        console.log('📤 Sent WebSocket message:', message)
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error)
        this.messageQueue.push(message)
      }
    } else {
      console.warn('⚠️ WebSocket not connected, queuing message:', message)
      this.messageQueue.push(message)
    }
  }

  // Queue Management
  private processMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log(`📤 Processing ${this.messageQueue.length} queued messages`)
      const messages = [...this.messageQueue]
      this.messageQueue = []
      
      messages.forEach(message => {
        this.sendMessage(message.type, message.data)
      })
    }
  }

  // Ping/Pong for Connection Health
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage('ping', { timestamp: Date.now() })
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // Event Handlers
  onConnectionChangeCallback(callback: (connected: boolean) => void): void {
    this.onConnectionChange = callback
  }

  onErrorCallback(callback: (error: any) => void): void {
    this.onError = callback
  }

  // Getters
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size
  }

  getQueueSize(): number {
    return this.messageQueue.length
  }

  // Request specific data types
  requestDataSources(): void {
    this.sendMessage('request_data_sources', {})
  }

  requestUserData(): void {
    this.sendMessage('request_user_data', {})
  }

  requestNotifications(): void {
    this.sendMessage('request_notifications', {})
  }

  requestWorkspaceData(): void {
    this.sendMessage('request_workspace_data', {})
  }

  requestDataSourceMetrics(dataSourceId: number): void {
    this.sendMessage('request_data_source_metrics', { dataSourceId })
  }

  requestDataSourceHealth(dataSourceId: number): void {
    this.sendMessage('request_data_source_health', { dataSourceId })
  }

  requestDiscoveryHistory(dataSourceId: number): void {
    this.sendMessage('request_discovery_history', { dataSourceId })
  }

  requestScanResults(dataSourceId: number): void {
    this.sendMessage('request_scan_results', { dataSourceId })
  }

  requestQualityMetrics(dataSourceId: number): void {
    this.sendMessage('request_quality_metrics', { dataSourceId })
  }

  requestGrowthMetrics(dataSourceId: number): void {
    this.sendMessage('request_growth_metrics', { dataSourceId })
  }

  requestSchemaDiscovery(dataSourceId: number): void {
    this.sendMessage('request_schema_discovery', { dataSourceId })
  }

  requestDataLineage(dataSourceId: number): void {
    this.sendMessage('request_data_lineage', { dataSourceId })
  }

  requestBackupStatus(dataSourceId: number): void {
    this.sendMessage('request_backup_status', { dataSourceId })
  }

  requestScheduledTasks(dataSourceId: number): void {
    this.sendMessage('request_scheduled_tasks', { dataSourceId })
  }

  requestAuditLogs(dataSourceId: number): void {
    this.sendMessage('request_audit_logs', { dataSourceId })
  }

  requestUserPermissions(): void {
    this.sendMessage('request_user_permissions', {})
  }

  requestDataCatalog(): void {
    this.sendMessage('request_data_catalog', {})
  }

  // Collaboration requests
  requestCollaborationWorkspaces(): void {
    this.sendMessage('request_collaboration_workspaces', {})
  }

  requestActiveCollaborationSessions(): void {
    this.sendMessage('request_active_collaboration_sessions', {})
  }

  requestSharedDocuments(dataSourceId: number, documentType: string): void {
    this.sendMessage('request_shared_documents', { dataSourceId, documentType })
  }

  requestDocumentComments(documentId: string): void {
    this.sendMessage('request_document_comments', { documentId })
  }

  requestWorkspaceActivity(workspaceId: string, days: number): void {
    this.sendMessage('request_workspace_activity', { workspaceId, days })
  }

  // Workflow requests
  requestWorkflowDefinitions(): void {
    this.sendMessage('request_workflow_definitions', {})
  }

  requestWorkflowExecutions(days: number): void {
    this.sendMessage('request_workflow_executions', { days })
  }

  requestPendingApprovals(): void {
    this.sendMessage('request_pending_approvals', {})
  }

  requestWorkflowTemplates(): void {
    this.sendMessage('request_workflow_templates', {})
  }

  requestBulkOperationStatus(): void {
    this.sendMessage('request_bulk_operation_status', {})
  }

  // Performance requests
  requestSystemHealth(): void {
    this.sendMessage('request_system_health', {})
  }

  requestEnhancedPerformanceMetrics(dataSourceId: number, timeRange: string, metricTypes: string[]): void {
    this.sendMessage('request_enhanced_performance_metrics', { dataSourceId, timeRange, metricTypes })
  }

  requestPerformanceAlerts(severity: string, days: number): void {
    this.sendMessage('request_performance_alerts', { severity, days })
  }

  requestPerformanceTrends(dataSourceId: number, period: string): void {
    this.sendMessage('request_performance_trends', { dataSourceId, period })
  }

  requestOptimizationRecommendations(dataSourceId: number): void {
    this.sendMessage('request_optimization_recommendations', { dataSourceId })
  }

  requestPerformanceSummaryReport(timeRange: string): void {
    this.sendMessage('request_performance_summary_report', { timeRange })
  }

  requestPerformanceThresholds(dataSourceId: number): void {
    this.sendMessage('request_performance_thresholds', { dataSourceId })
  }

  // Security requests
  requestEnhancedSecurityAudit(dataSourceId: number, includeVulnerabilities: boolean, includeCompliance: boolean): void {
    this.sendMessage('request_enhanced_security_audit', { dataSourceId, includeVulnerabilities, includeCompliance })
  }

  requestVulnerabilityAssessments(severity: string): void {
    this.sendMessage('request_vulnerability_assessments', { severity })
  }

  requestSecurityIncidents(days: number): void {
    this.sendMessage('request_security_incidents', { days })
  }

  requestComplianceChecks(): void {
    this.sendMessage('request_compliance_checks', {})
  }

  requestThreatDetection(days: number): void {
    this.sendMessage('request_threat_detection', { days })
  }

  requestSecurityAnalyticsDashboard(period: string): void {
    this.sendMessage('request_security_analytics_dashboard', { period })
  }

  requestRiskAssessmentReport(): void {
    this.sendMessage('request_risk_assessment_report', {})
  }

  requestSecurityScans(days: number): void {
    this.sendMessage('request_security_scans', { days })
  }
}

// Export singleton instance
export const globalWebSocketManager = GlobalWebSocketManager.getInstance()

