"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// WEBSOCKET INTEGRATION TYPES
// ============================================================================

export interface WebSocketMessage {
  id: string
  type: WebSocketMessageType
  source: string
  target?: string
  timestamp: string
  payload: any
  metadata: WebSocketMetadata
  priority: WebSocketPriority
  retry?: RetryConfig
}

export interface WebSocketMetadata {
  userId?: string
  sessionId?: string
  dataSourceId?: number
  componentId?: string
  workflowId?: string
  correlationId?: string
  tags: string[]
  headers: Record<string, string>
}

export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
}

export enum WebSocketMessageType {
  // Data Source Events
  DATA_SOURCE_CREATED = 'data_source_created',
  DATA_SOURCE_UPDATED = 'data_source_updated',
  DATA_SOURCE_DELETED = 'data_source_deleted',
  DATA_SOURCE_STATUS_CHANGED = 'data_source_status_changed',
  DATA_SOURCE_HEALTH_UPDATED = 'data_source_health_updated',
  
  // Discovery Events
  DISCOVERY_STARTED = 'discovery_started',
  DISCOVERY_COMPLETED = 'discovery_completed',
  DISCOVERY_FAILED = 'discovery_failed',
  DISCOVERY_PROGRESS = 'discovery_progress',
  ASSET_DISCOVERED = 'asset_discovered',
  ASSET_UPDATED = 'asset_updated',
  
  // Backup Events
  BACKUP_STARTED = 'backup_started',
  BACKUP_COMPLETED = 'backup_completed',
  BACKUP_FAILED = 'backup_failed',
  BACKUP_PROGRESS = 'backup_progress',
  RESTORE_STARTED = 'restore_started',
  RESTORE_COMPLETED = 'restore_completed',
  
  // Report Events
  REPORT_GENERATED = 'report_generated',
  REPORT_FAILED = 'report_failed',
  REPORT_PROGRESS = 'report_progress',
  REPORT_SCHEDULED = 'report_scheduled',
  
  // Quality Events
  QUALITY_CHECK_STARTED = 'quality_check_started',
  QUALITY_CHECK_COMPLETED = 'quality_check_completed',
  QUALITY_SCORE_UPDATED = 'quality_score_updated',
  QUALITY_ALERT = 'quality_alert',
  
  // Security Events
  SECURITY_SCAN_STARTED = 'security_scan_started',
  SECURITY_SCAN_COMPLETED = 'security_scan_completed',
  SECURITY_ALERT = 'security_alert',
  VULNERABILITY_DETECTED = 'vulnerability_detected',
  
  // Collaboration Events
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  USER_ACTIVITY = 'user_activity',
  COMMENT_ADDED = 'comment_added',
  DOCUMENT_SHARED = 'document_shared',
  
  // System Events
  SYSTEM_ALERT = 'system_alert',
  PERFORMANCE_ALERT = 'performance_alert',
  MAINTENANCE_STARTED = 'maintenance_started',
  MAINTENANCE_COMPLETED = 'maintenance_completed',
  
  // Workflow Events
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  WORKFLOW_STEP_COMPLETED = 'workflow_step_completed',
  
  // Real-time Updates
  METRICS_UPDATE = 'metrics_update',
  STATUS_UPDATE = 'status_update',
  NOTIFICATION = 'notification',
  BROADCAST = 'broadcast'
}

export enum WebSocketPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

export interface WebSocketSubscription {
  id: string
  pattern: string | RegExp | WebSocketMessageType[]
  handler: WebSocketMessageHandler
  options: SubscriptionOptions
}

export interface WebSocketMessageHandler {
  (message: WebSocketMessage, context: WebSocketContext): Promise<void> | void
}

export interface WebSocketContext {
  subscriptionId: string
  connection: WebSocket | null
  queryClient: any
  reconnect: () => void
  unsubscribe: () => void
}

export interface SubscriptionOptions {
  priority?: WebSocketPriority
  filter?: (message: WebSocketMessage) => boolean
  transform?: (message: WebSocketMessage) => WebSocketMessage
  throttle?: number
  debounce?: number
  persistent?: boolean
}

export interface WebSocketConfig {
  url?: string
  protocols?: string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  enableCompression?: boolean
  enableDebugLogging?: boolean
  bufferMaxSize?: number
  messageTimeout?: number
}

export interface WebSocketStats {
  connected: boolean
  connectionCount: number
  messagesReceived: number
  messagesSent: number
  errors: number
  lastError?: string
  lastConnected?: Date
  lastDisconnected?: Date
  averageLatency: number
  subscriptionCount: number
}

// ============================================================================
// WEBSOCKET INTEGRATION HOOK
// ============================================================================

export function useWebSocketIntegration(config: WebSocketConfig = {}) {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [stats, setStats] = useState<WebSocketStats>({
    connected: false,
    connectionCount: 0,
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0,
    averageLatency: 0,
    subscriptionCount: 0
  })

  const wsRef = useRef<WebSocket | null>(null)
  const subscriptionsRef = useRef<Map<string, WebSocketSubscription>>(new Map())
  const messageQueueRef = useRef<WebSocketMessage[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const defaultConfig: Required<WebSocketConfig> = {
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/data-sources',
    protocols: ['data-governance-v1'],
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    enableCompression: true,
    enableDebugLogging: process.env.NODE_ENV === 'development',
    bufferMaxSize: 1000,
    messageTimeout: 30000,
    ...config
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionState('connecting')
      
      const ws = new WebSocket(defaultConfig.url, defaultConfig.protocols)
      
      ws.onopen = (event) => {
        if (defaultConfig.enableDebugLogging) {
          console.log('[WebSocket] Connected:', event)
        }
        
        setConnectionState('connected')
        setStats(prev => ({
          ...prev,
          connected: true,
          connectionCount: prev.connectionCount + 1,
          lastConnected: new Date()
        }))
        
        reconnectAttemptsRef.current = 0
        
        // Start heartbeat
        startHeartbeat()
        
        // Process queued messages
        processMessageQueue()
        
        toast.success('Real-time connection established')
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleIncomingMessage(message)
          
          setStats(prev => ({
            ...prev,
            messagesReceived: prev.messagesReceived + 1
          }))
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
          setStats(prev => ({
            ...prev,
            errors: prev.errors + 1,
            lastError: 'Message parsing failed'
          }))
        }
      }

      ws.onclose = (event) => {
        if (defaultConfig.enableDebugLogging) {
          console.log('[WebSocket] Disconnected:', event.code, event.reason)
        }
        
        setConnectionState('disconnected')
        setStats(prev => ({
          ...prev,
          connected: false,
          lastDisconnected: new Date()
        }))
        
        stopHeartbeat()
        
        // Attempt reconnection if not intentional close
        if (event.code !== 1000 && reconnectAttemptsRef.current < defaultConfig.maxReconnectAttempts) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        setConnectionState('error')
        setStats(prev => ({
          ...prev,
          errors: prev.errors + 1,
          lastError: 'Connection error'
        }))
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error)
      setConnectionState('error')
      setStats(prev => ({
        ...prev,
        errors: prev.errors + 1,
        lastError: 'Connection failed'
      }))
    }
  }, [defaultConfig])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Intentional disconnect')
      wsRef.current = null
    }
    
    stopHeartbeat()
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    const delay = defaultConfig.reconnectInterval * Math.pow(2, reconnectAttemptsRef.current)
    reconnectAttemptsRef.current++
    
    if (defaultConfig.enableDebugLogging) {
      console.log(`[WebSocket] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`)
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, delay)
  }, [connect, defaultConfig])

  // ============================================================================
  // HEARTBEAT MANAGEMENT
  // ============================================================================

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const heartbeat: WebSocketMessage = {
          id: `heartbeat-${Date.now()}`,
          type: WebSocketMessageType.STATUS_UPDATE,
          source: 'client',
          timestamp: new Date().toISOString(),
          payload: { type: 'heartbeat' },
          metadata: {
            tags: ['heartbeat'],
            headers: {}
          },
          priority: WebSocketPriority.LOW
        }
        
        sendMessage(heartbeat)
      }
    }, defaultConfig.heartbeatInterval)
  }, [defaultConfig.heartbeatInterval])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    const fullMessage: WebSocketMessage = {
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: message.type!,
      source: message.source || 'client',
      timestamp: message.timestamp || new Date().toISOString(),
      payload: message.payload || {},
      metadata: {
        tags: [],
        headers: {},
        ...message.metadata
      },
      priority: message.priority || WebSocketPriority.NORMAL,
      ...message
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(fullMessage))
        setStats(prev => ({
          ...prev,
          messagesSent: prev.messagesSent + 1
        }))
      } catch (error) {
        console.error('[WebSocket] Failed to send message:', error)
        queueMessage(fullMessage)
      }
    } else {
      queueMessage(fullMessage)
    }
  }, [])

  const queueMessage = useCallback((message: WebSocketMessage) => {
    if (messageQueueRef.current.length < defaultConfig.bufferMaxSize) {
      messageQueueRef.current.push(message)
    } else {
      // Remove oldest message if buffer is full
      messageQueueRef.current.shift()
      messageQueueRef.current.push(message)
    }
  }, [defaultConfig.bufferMaxSize])

  const processMessageQueue = useCallback(() => {
    while (messageQueueRef.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
      const message = messageQueueRef.current.shift()!
      try {
        wsRef.current.send(JSON.stringify(message))
        setStats(prev => ({
          ...prev,
          messagesSent: prev.messagesSent + 1
        }))
      } catch (error) {
        console.error('[WebSocket] Failed to send queued message:', error)
        break
      }
    }
  }, [])

  const handleIncomingMessage = useCallback((message: WebSocketMessage) => {
    if (defaultConfig.enableDebugLogging) {
      console.log('[WebSocket] Received message:', message.type, message.payload)
    }

    // Process subscriptions
    subscriptionsRef.current.forEach((subscription) => {
      if (matchesSubscription(message, subscription)) {
        try {
          const context: WebSocketContext = {
            subscriptionId: subscription.id,
            connection: wsRef.current,
            queryClient,
            reconnect: connect,
            unsubscribe: () => unsubscribe(subscription.id)
          }

          // Apply filters and transforms
          let processedMessage = message
          if (subscription.options.filter && !subscription.options.filter(message)) {
            return
          }
          if (subscription.options.transform) {
            processedMessage = subscription.options.transform(message)
          }

          subscription.handler(processedMessage, context)
        } catch (error) {
          console.error('[WebSocket] Subscription handler error:', error)
        }
      }
    })

    // Handle system messages
    handleSystemMessage(message)
  }, [queryClient, connect, defaultConfig.enableDebugLogging])

  const matchesSubscription = useCallback((message: WebSocketMessage, subscription: WebSocketSubscription): boolean => {
    const { pattern } = subscription
    
    if (Array.isArray(pattern)) {
      return pattern.includes(message.type)
    }
    
    if (pattern instanceof RegExp) {
      return pattern.test(message.type)
    }
    
    if (typeof pattern === 'string') {
      return message.type === pattern || message.type.includes(pattern)
    }
    
    return false
  }, [])

  const handleSystemMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case WebSocketMessageType.DATA_SOURCE_UPDATED:
        // Invalidate data source queries
        queryClient.invalidateQueries({ queryKey: ['data-sources'] })
        queryClient.invalidateQueries({ queryKey: ['data-source', message.payload.dataSourceId] })
        break
        
      case WebSocketMessageType.DISCOVERY_COMPLETED:
        // Invalidate discovery queries
        queryClient.invalidateQueries({ queryKey: ['discovery-jobs'] })
        queryClient.invalidateQueries({ queryKey: ['discovered-assets'] })
        toast.success(`Discovery completed for ${message.payload.dataSourceName}`)
        break
        
      case WebSocketMessageType.BACKUP_COMPLETED:
        // Invalidate backup queries
        queryClient.invalidateQueries({ queryKey: ['backup-status'] })
        toast.success(`Backup completed for ${message.payload.dataSourceName}`)
        break
        
      case WebSocketMessageType.REPORT_GENERATED:
        // Invalidate report queries
        queryClient.invalidateQueries({ queryKey: ['reports'] })
        toast.success(`Report generated: ${message.payload.reportName}`)
        break
        
      case WebSocketMessageType.SECURITY_ALERT:
        // Show security alert
        toast.error(`Security Alert: ${message.payload.alertMessage}`, {
          duration: 10000
        })
        queryClient.invalidateQueries({ queryKey: ['security-alerts'] })
        break
        
      case WebSocketMessageType.QUALITY_ALERT:
        // Show quality alert
        toast.warning(`Quality Alert: ${message.payload.alertMessage}`)
        queryClient.invalidateQueries({ queryKey: ['quality-metrics'] })
        break
        
      case WebSocketMessageType.SYSTEM_ALERT:
        // Show system alert
        const alertType = message.payload.severity === 'critical' ? 'error' : 'warning'
        toast[alertType](`System Alert: ${message.payload.alertMessage}`)
        break
        
      case WebSocketMessageType.NOTIFICATION:
        // Show notification
        toast.info(message.payload.message)
        break
    }
  }, [queryClient])

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  const subscribe = useCallback((
    pattern: string | RegExp | WebSocketMessageType[],
    handler: WebSocketMessageHandler,
    options: SubscriptionOptions = {}
  ): string => {
    const subscription: WebSocketSubscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pattern,
      handler,
      options
    }
    
    subscriptionsRef.current.set(subscription.id, subscription)
    
    setStats(prev => ({
      ...prev,
      subscriptionCount: subscriptionsRef.current.size
    }))
    
    return subscription.id
  }, [])

  const unsubscribe = useCallback((subscriptionId: string) => {
    subscriptionsRef.current.delete(subscriptionId)
    
    setStats(prev => ({
      ...prev,
      subscriptionCount: subscriptionsRef.current.size
    }))
  }, [])

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.clear()
    
    setStats(prev => ({
      ...prev,
      subscriptionCount: 0
    }))
  }, [])

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  const subscribeToDataSourceEvents = useCallback((dataSourceId: number, handler: WebSocketMessageHandler) => {
    return subscribe(
      [
        WebSocketMessageType.DATA_SOURCE_UPDATED,
        WebSocketMessageType.DATA_SOURCE_STATUS_CHANGED,
        WebSocketMessageType.DATA_SOURCE_HEALTH_UPDATED
      ],
      handler,
      {
        filter: (message) => message.metadata.dataSourceId === dataSourceId
      }
    )
  }, [subscribe])

  const subscribeToDiscoveryEvents = useCallback((dataSourceId: number, handler: WebSocketMessageHandler) => {
    return subscribe(
      [
        WebSocketMessageType.DISCOVERY_STARTED,
        WebSocketMessageType.DISCOVERY_COMPLETED,
        WebSocketMessageType.DISCOVERY_PROGRESS,
        WebSocketMessageType.ASSET_DISCOVERED
      ],
      handler,
      {
        filter: (message) => message.metadata.dataSourceId === dataSourceId
      }
    )
  }, [subscribe])

  const subscribeToBackupEvents = useCallback((dataSourceId: number, handler: WebSocketMessageHandler) => {
    return subscribe(
      [
        WebSocketMessageType.BACKUP_STARTED,
        WebSocketMessageType.BACKUP_COMPLETED,
        WebSocketMessageType.BACKUP_PROGRESS,
        WebSocketMessageType.RESTORE_STARTED,
        WebSocketMessageType.RESTORE_COMPLETED
      ],
      handler,
      {
        filter: (message) => message.metadata.dataSourceId === dataSourceId
      }
    )
  }, [subscribe])

  const subscribeToReportEvents = useCallback((dataSourceId: number, handler: WebSocketMessageHandler) => {
    return subscribe(
      [
        WebSocketMessageType.REPORT_GENERATED,
        WebSocketMessageType.REPORT_PROGRESS,
        WebSocketMessageType.REPORT_SCHEDULED
      ],
      handler,
      {
        filter: (message) => message.metadata.dataSourceId === dataSourceId
      }
    )
  }, [subscribe])

  const subscribeToSecurityEvents = useCallback((handler: WebSocketMessageHandler) => {
    return subscribe(
      [
        WebSocketMessageType.SECURITY_SCAN_STARTED,
        WebSocketMessageType.SECURITY_SCAN_COMPLETED,
        WebSocketMessageType.SECURITY_ALERT,
        WebSocketMessageType.VULNERABILITY_DETECTED
      ],
      handler
    )
  }, [subscribe])

  const subscribeToCollaborationEvents = useCallback((sessionId: string, handler: WebSocketMessageHandler) => {
    return subscribe(
      [
        WebSocketMessageType.USER_JOINED,
        WebSocketMessageType.USER_LEFT,
        WebSocketMessageType.USER_ACTIVITY,
        WebSocketMessageType.COMMENT_ADDED,
        WebSocketMessageType.DOCUMENT_SHARED
      ],
      handler,
      {
        filter: (message) => message.metadata.sessionId === sessionId
      }
    )
  }, [subscribe])

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // Connection Management
    connect,
    disconnect,
    connectionState,
    isConnected: connectionState === 'connected',
    
    // Message Operations
    sendMessage,
    
    // Subscription Management
    subscribe,
    unsubscribe,
    unsubscribeAll,
    
    // Convenience Subscriptions
    subscribeToDataSourceEvents,
    subscribeToDiscoveryEvents,
    subscribeToBackupEvents,
    subscribeToReportEvents,
    subscribeToSecurityEvents,
    subscribeToCollaborationEvents,
    
    // Statistics
    stats,
    
    // Message Types (for convenience)
    MessageTypes: WebSocketMessageType,
    Priority: WebSocketPriority
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  WebSocketMessage,
  WebSocketMessageHandler,
  WebSocketContext,
  WebSocketSubscription,
  SubscriptionOptions,
  WebSocketConfig,
  WebSocketStats
}