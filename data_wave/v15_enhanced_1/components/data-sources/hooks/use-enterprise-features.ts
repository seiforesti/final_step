// ============================================================================
// ENTERPRISE FEATURE HOOKS - COMPONENT INTEGRATION LAYER
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Import enterprise context and APIs
import { useEnterpriseContext, createEnterpriseEvent } from '../enterprise-integration'
import { 
  SecurityAuditResponse,
  PerformanceMetricsResponse,
  BackupStatusResponse,
  TaskResponse,
  NotificationResponse,
  IntegrationResponse,
  ReportResponse,
  VersionResponse,
  createApiErrorHandler,
  withApiRetry
} from '../services/enterprise-apis'

// Import types
import { DataSource } from '../types'

// ============================================================================
// CORE ENTERPRISE HOOK - MAIN INTEGRATION POINT
// ============================================================================

export interface EnterpriseFeatureConfig {
  enableAnalytics?: boolean
  enableCollaboration?: boolean
  enableWorkflows?: boolean
  enableRealTimeUpdates?: boolean
  enableNotifications?: boolean
  enableAuditLogging?: boolean
  componentName: string
  dataSourceId?: number
}

export function useEnterpriseFeatures(config: EnterpriseFeatureConfig) {
  const {
    core,
    analytics,
    collaboration,
    workflows,
    backendData,
    systemHealth,
    emitEvent,
    config: enterpriseConfig
  } = useEnterpriseContext()

  const [componentState, setComponentState] = useState({
    loading: false,
    error: null as any,
    initialized: false,
    lastAction: null as any,
    metrics: {},
    insights: [],
    collaborators: [],
    activeWorkflows: [],
    notifications: []
  })

  // Component registration with core infrastructure
  useEffect(() => {
    if (core?.componentRegistry && !componentState.initialized) {
      const registerComponent = async () => {
        try {
          await core.componentRegistry.registerComponent({
            id: `${config.componentName}-${Date.now()}`,
            name: config.componentName,
            type: 'data-source-component',
            version: '1.0.0',
            capabilities: {
              analytics: config.enableAnalytics ?? true,
              collaboration: config.enableCollaboration ?? true,
              workflows: config.enableWorkflows ?? true,
              realTime: config.enableRealTimeUpdates ?? true
            },
            dependencies: [],
            healthEndpoint: `/health/${config.componentName}`,
            metadata: {
              dataSourceId: config.dataSourceId,
              registeredAt: new Date().toISOString()
            }
          })

          setComponentState(prev => ({ ...prev, initialized: true }))

          // Emit component ready event
          emitEvent(createEnterpriseEvent(
            'component:ready',
            config.componentName,
            { 
              componentName: config.componentName,
              dataSourceId: config.dataSourceId,
              capabilities: {
                analytics: config.enableAnalytics,
                collaboration: config.enableCollaboration,
                workflows: config.enableWorkflows
              }
            },
            'medium'
          ))

        } catch (error) {
          console.error(`Failed to register component ${config.componentName}:`, error)
          setComponentState(prev => ({ ...prev, error }))
        }
      }

      registerComponent()
    }
  }, [core, config, componentState.initialized, emitEvent])

  // Real-time updates subscription
  useEffect(() => {
    if (core?.eventBus && config.enableRealTimeUpdates) {
      const handleDataUpdate = (event: any) => {
        if (event.payload.dataSourceId === config.dataSourceId || !config.dataSourceId) {
          setComponentState(prev => ({
            ...prev,
            lastAction: {
              type: 'data-updated',
              timestamp: new Date(),
              data: event.payload
            }
          }))

          // Trigger component refresh if needed
          if (config.enableAnalytics && analytics) {
            analytics.processNewData(event.payload)
          }
        }
      }

      const handleInsightGenerated = (event: any) => {
        if (event.payload.dataSourceId === config.dataSourceId || event.payload.global) {
          setComponentState(prev => ({
            ...prev,
            insights: [...prev.insights.slice(-9), event.payload] // Keep last 10 insights
          }))
        }
      }

      const handleWorkflowUpdate = (event: any) => {
        if (event.payload.dataSourceId === config.dataSourceId) {
          setComponentState(prev => ({
            ...prev,
            activeWorkflows: prev.activeWorkflows.map(wf => 
              wf.id === event.payload.workflowId 
                ? { ...wf, ...event.payload.updates }
                : wf
            )
          }))
        }
      }

      const handleCollaboratorJoin = (event: any) => {
        if (config.enableCollaboration) {
          setComponentState(prev => ({
            ...prev,
            collaborators: [...prev.collaborators, event.payload.user]
          }))
        }
      }

      const handleCollaboratorLeave = (event: any) => {
        if (config.enableCollaboration) {
          setComponentState(prev => ({
            ...prev,
            collaborators: prev.collaborators.filter(c => c.id !== event.payload.userId)
          }))
        }
      }

      // Subscribe to events
      core.eventBus.subscribe('backend:data:updated', handleDataUpdate)
      core.eventBus.subscribe('analytics:insight:generated', handleInsightGenerated)
      core.eventBus.subscribe('workflow:updated', handleWorkflowUpdate)
      core.eventBus.subscribe('collaboration:user:joined', handleCollaboratorJoin)
      core.eventBus.subscribe('collaboration:user:left', handleCollaboratorLeave)

      return () => {
        core.eventBus.unsubscribe('backend:data:updated', handleDataUpdate)
        core.eventBus.unsubscribe('analytics:insight:generated', handleInsightGenerated)
        core.eventBus.unsubscribe('workflow:updated', handleWorkflowUpdate)
        core.eventBus.unsubscribe('collaboration:user:joined', handleCollaboratorJoin)
        core.eventBus.unsubscribe('collaboration:user:left', handleCollaboratorLeave)
      }
    }
  }, [core, config, analytics])

  // Component action handlers
  const executeAction = useCallback(async (actionType: string, payload: any) => {
    setComponentState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Emit action start event
      emitEvent(createEnterpriseEvent(
        `component:action:${actionType}`,
        config.componentName,
        { actionType, payload, dataSourceId: config.dataSourceId },
        'medium'
      ))

      let result: any

      // Handle different action types
      switch (actionType) {
        case 'create':
        case 'update':
        case 'delete':
          // Trigger workflow if enabled
          if (config.enableWorkflows && workflows) {
            result = await workflows.createWorkflow({
              type: 'data-source-modification',
              name: `${actionType.toUpperCase()} ${config.componentName}`,
              steps: [
                {
                  id: 'validation',
                  type: 'validation',
                  config: { payload }
                },
                {
                  id: 'execution',
                  type: 'api-call',
                  config: { action: actionType, payload }
                },
                {
                  id: 'notification',
                  type: 'notification',
                  config: { type: 'success', message: `${actionType} completed successfully` }
                }
              ],
              metadata: {
                componentName: config.componentName,
                dataSourceId: config.dataSourceId
              }
            })
          }
          break

        case 'analyze':
          // Trigger analytics if enabled
          if (config.enableAnalytics && analytics) {
            result = await analytics.analyzeDataSource(config.dataSourceId!, {
              includeInsights: true,
              includePredictions: true,
              includeRecommendations: true
            })
          }
          break

        case 'collaborate':
          // Start collaboration session if enabled
          if (config.enableCollaboration && collaboration) {
            result = await collaboration.createSession({
              name: `${config.componentName} Collaboration`,
              type: 'component-collaboration',
              dataSourceId: config.dataSourceId,
              metadata: payload
            })
          }
          break

        default:
          throw new Error(`Unknown action type: ${actionType}`)
      }

      setComponentState(prev => ({
        ...prev,
        loading: false,
        lastAction: {
          type: actionType,
          timestamp: new Date(),
          result,
          success: true
        }
      }))

      // Emit success event
      emitEvent(createEnterpriseEvent(
        `component:action:${actionType}:success`,
        config.componentName,
        { actionType, result, dataSourceId: config.dataSourceId },
        'medium'
      ))

      return result

    } catch (error) {
      const errorHandler = createApiErrorHandler(config.componentName)
      errorHandler(error)

      setComponentState(prev => ({
        ...prev,
        loading: false,
        error,
        lastAction: {
          type: actionType,
          timestamp: new Date(),
          error,
          success: false
        }
      }))

      // Emit error event
      emitEvent(createEnterpriseEvent(
        `component:action:${actionType}:error`,
        config.componentName,
        { actionType, error: error.message, dataSourceId: config.dataSourceId },
        'high'
      ))

      throw error
    }
  }, [config, workflows, analytics, collaboration, emitEvent])

  // Get component metrics
  const getMetrics = useCallback(async () => {
    if (config.enableAnalytics && analytics && config.dataSourceId) {
      try {
        const metrics = await analytics.getComponentMetrics(config.componentName, config.dataSourceId)
        setComponentState(prev => ({ ...prev, metrics }))
        return metrics
      } catch (error) {
        console.error(`Failed to get metrics for ${config.componentName}:`, error)
      }
    }
    return {}
  }, [config, analytics])

  // Send notification
  const sendNotification = useCallback(async (
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    options: any = {}
  ) => {
    if (config.enableNotifications) {
      try {
        // Show toast notification
        toast[type](title, { description: message, ...options })

        // Emit notification event
        emitEvent(createEnterpriseEvent(
          'component:notification',
          config.componentName,
          { type, title, message, dataSourceId: config.dataSourceId },
          type === 'error' ? 'high' : 'medium'
        ))

        // Update component state
        setComponentState(prev => ({
          ...prev,
          notifications: [...prev.notifications.slice(-9), {
            type,
            title,
            message,
            timestamp: new Date(),
            id: Math.random().toString(36)
          }]
        }))

      } catch (error) {
        console.error(`Failed to send notification from ${config.componentName}:`, error)
      }
    }
  }, [config, emitEvent])

  // Get collaboration status
  const getCollaborationStatus = useCallback(() => {
    if (config.enableCollaboration && collaboration) {
      return {
        isActive: componentState.collaborators.length > 0,
        collaborators: componentState.collaborators,
        canCollaborate: true
      }
    }
    return { isActive: false, collaborators: [], canCollaborate: false }
  }, [config, collaboration, componentState.collaborators])

  // Get workflow status
  const getWorkflowStatus = useCallback(() => {
    if (config.enableWorkflows) {
      return {
        hasActiveWorkflows: componentState.activeWorkflows.length > 0,
        workflows: componentState.activeWorkflows,
        canCreateWorkflow: true
      }
    }
    return { hasActiveWorkflows: false, workflows: [], canCreateWorkflow: false }
  }, [config, componentState.activeWorkflows])

  return {
    // State
    ...componentState,
    
    // Backend data
    backendData,
    systemHealth,
    
    // Actions
    executeAction,
    getMetrics,
    sendNotification,
    
    // Status
    getCollaborationStatus,
    getWorkflowStatus,
    
    // Feature flags
    features: {
      analytics: config.enableAnalytics && !!analytics,
      collaboration: config.enableCollaboration && !!collaboration,
      workflows: config.enableWorkflows && !!workflows,
      realTime: config.enableRealTimeUpdates,
      notifications: config.enableNotifications
    },
    
    // System references
    core,
    analytics,
    collaboration,
    workflows
  }
}

// ============================================================================
// SPECIALIZED HOOKS FOR DIFFERENT COMPONENT TYPES
// ============================================================================

// Hook for monitoring and dashboard components
export function useMonitoringFeatures(dataSourceId?: number) {
  const enterprise = useEnterpriseFeatures({
    componentName: 'monitoring',
    dataSourceId,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true
  })

  const [monitoringData, setMonitoringData] = useState({
    metrics: {},
    alerts: [],
    healthScore: 0,
    trends: {},
    recommendations: []
  })

  // Real-time metrics updates
  useEffect(() => {
    if (enterprise.features.realTime && dataSourceId) {
      const interval = setInterval(async () => {
        try {
          const metrics = await enterprise.getMetrics()
          setMonitoringData(prev => ({
            ...prev,
            metrics,
            healthScore: calculateHealthScore(metrics),
            lastUpdated: new Date()
          }))
        } catch (error) {
          console.error('Failed to update monitoring metrics:', error)
        }
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [enterprise, dataSourceId])

  const calculateHealthScore = (metrics: any): number => {
    // Implement health score calculation logic
    if (!metrics || Object.keys(metrics).length === 0) return 0
    
    // Example calculation - customize based on your metrics
    const weights = {
      performance: 0.3,
      availability: 0.3,
      security: 0.2,
      compliance: 0.2
    }
    
    const scores = {
      performance: metrics.responseTime ? Math.max(0, 100 - (metrics.responseTime / 10)) : 50,
      availability: metrics.uptime || 95,
      security: metrics.securityScore || 80,
      compliance: metrics.complianceScore || 75
    }
    
    return Math.round(
      weights.performance * scores.performance +
      weights.availability * scores.availability +
      weights.security * scores.security +
      weights.compliance * scores.compliance
    )
  }

  const triggerAlert = useCallback(async (alertType: string, severity: 'low' | 'medium' | 'high' | 'critical', message: string) => {
    const alert = {
      id: Math.random().toString(36),
      type: alertType,
      severity,
      message,
      timestamp: new Date(),
      dataSourceId
    }

    setMonitoringData(prev => ({
      ...prev,
      alerts: [...prev.alerts.slice(-19), alert] // Keep last 20 alerts
    }))

    await enterprise.sendNotification(
      severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'info',
      `${alertType.toUpperCase()} Alert`,
      message
    )

    // Emit alert event
    enterprise.core?.eventBus?.publish({
      type: 'monitoring:alert:triggered',
      source: 'monitoring-component',
      payload: alert,
      priority: severity === 'critical' ? 1 : severity === 'high' ? 2 : 3,
      metadata: { dataSourceId, alertType, severity }
    })
  }, [enterprise, dataSourceId])

  return {
    ...enterprise,
    monitoring: {
      ...monitoringData,
      triggerAlert,
      calculateHealthScore
    }
  }
}

// Hook for security and compliance components
export function useSecurityFeatures(dataSourceId?: number) {
  const enterprise = useEnterpriseFeatures({
    componentName: 'security',
    dataSourceId,
    enableAnalytics: true,
    enableWorkflows: true,
    enableAuditLogging: true
  })

  const [securityData, setSecurityData] = useState({
    vulnerabilities: [],
    controls: [],
    incidents: [],
    complianceScore: 0,
    lastScan: null as Date | null,
    riskLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  })

  const triggerSecurityScan = useCallback(async (scanType: 'vulnerability' | 'compliance' | 'full' = 'full') => {
    if (!dataSourceId) return

    try {
      const result = await enterprise.executeAction('security-scan', {
        dataSourceId,
        scanType,
        triggeredBy: 'user'
      })

      setSecurityData(prev => ({
        ...prev,
        lastScan: new Date(),
        vulnerabilities: result.vulnerabilities || [],
        controls: result.controls || [],
        complianceScore: result.complianceScore || 0,
        riskLevel: calculateRiskLevel(result)
      }))

      await enterprise.sendNotification(
        'success',
        'Security Scan Completed',
        `${scanType.charAt(0).toUpperCase() + scanType.slice(1)} scan completed successfully`
      )

      return result
    } catch (error) {
      await enterprise.sendNotification(
        'error',
        'Security Scan Failed',
        `Failed to complete ${scanType} scan: ${error.message}`
      )
      throw error
    }
  }, [enterprise, dataSourceId])

  const calculateRiskLevel = (scanResult: any): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalVulns = scanResult.vulnerabilities?.filter((v: any) => v.severity === 'critical').length || 0
    const highVulns = scanResult.vulnerabilities?.filter((v: any) => v.severity === 'high').length || 0
    
    if (criticalVulns > 0) return 'critical'
    if (highVulns > 3) return 'high'
    if (highVulns > 0 || scanResult.complianceScore < 70) return 'medium'
    return 'low'
  }

  const reportIncident = useCallback(async (incident: {
    title: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    category: string
  }) => {
    const newIncident = {
      id: Math.random().toString(36),
      ...incident,
      dataSourceId,
      timestamp: new Date(),
      status: 'open',
      reporter: 'user' // Get from user context
    }

    setSecurityData(prev => ({
      ...prev,
      incidents: [...prev.incidents, newIncident]
    }))

    // Create workflow for incident response
    if (enterprise.features.workflows) {
      await enterprise.executeAction('create-incident-workflow', {
        incident: newIncident,
        autoAssign: true,
        notifyTeam: true
      })
    }

    await enterprise.sendNotification(
      incident.severity === 'critical' ? 'error' : 'warning',
      'Security Incident Reported',
      `${incident.title} has been reported and assigned for investigation`
    )

    return newIncident
  }, [enterprise, dataSourceId])

  return {
    ...enterprise,
    security: {
      ...securityData,
      triggerSecurityScan,
      reportIncident,
      calculateRiskLevel
    }
  }
}

// Hook for backup and operations components
export function useOperationsFeatures(dataSourceId?: number) {
  const enterprise = useEnterpriseFeatures({
    componentName: 'operations',
    dataSourceId,
    enableWorkflows: true,
    enableNotifications: true
  })

  const [operationsData, setOperationsData] = useState({
    backups: [],
    tasks: [],
    schedules: [],
    operationHistory: []
  })

  const createBackup = useCallback(async (backupConfig: {
    type: 'full' | 'incremental' | 'differential'
    name: string
    description?: string
  }) => {
    if (!dataSourceId) return

    try {
      const result = await enterprise.executeAction('create-backup', {
        dataSourceId,
        ...backupConfig,
        triggeredBy: 'user'
      })

      setOperationsData(prev => ({
        ...prev,
        backups: [...prev.backups, result],
        operationHistory: [...prev.operationHistory, {
          type: 'backup-created',
          timestamp: new Date(),
          details: result
        }]
      }))

      await enterprise.sendNotification(
        'success',
        'Backup Started',
        `${backupConfig.type} backup "${backupConfig.name}" has been initiated`
      )

      return result
    } catch (error) {
      await enterprise.sendNotification(
        'error',
        'Backup Failed',
        `Failed to create backup: ${error.message}`
      )
      throw error
    }
  }, [enterprise, dataSourceId])

  const scheduleTask = useCallback(async (taskConfig: {
    name: string
    type: string
    cronExpression: string
    config: any
  }) => {
    if (!dataSourceId) return

    try {
      const result = await enterprise.executeAction('schedule-task', {
        dataSourceId,
        ...taskConfig,
        scheduledBy: 'user'
      })

      setOperationsData(prev => ({
        ...prev,
        schedules: [...prev.schedules, result],
        operationHistory: [...prev.operationHistory, {
          type: 'task-scheduled',
          timestamp: new Date(),
          details: result
        }]
      }))

      await enterprise.sendNotification(
        'success',
        'Task Scheduled',
        `Task "${taskConfig.name}" has been scheduled successfully`
      )

      return result
    } catch (error) {
      await enterprise.sendNotification(
        'error',
        'Task Scheduling Failed',
        `Failed to schedule task: ${error.message}`
      )
      throw error
    }
  }, [enterprise, dataSourceId])

  return {
    ...enterprise,
    operations: {
      ...operationsData,
      createBackup,
      scheduleTask
    }
  }
}

// Hook for collaboration features across components
export function useCollaborationFeatures(componentName: string, dataSourceId?: number) {
  const enterprise = useEnterpriseFeatures({
    componentName,
    dataSourceId,
    enableCollaboration: true,
    enableRealTimeUpdates: true,
    enableNotifications: true
  })

  const [collaborationState, setCollaborationState] = useState({
    session: null as any,
    participants: [],
    comments: [],
    sharedCursor: null,
    realTimeChanges: []
  })

  const startCollaboration = useCallback(async (sessionName?: string) => {
    if (!enterprise.features.collaboration) return

    try {
      const session = await enterprise.collaboration.createSession({
        name: sessionName || `${componentName} Collaboration`,
        type: 'component-collaboration',
        dataSourceId,
        metadata: {
          componentName,
          startedAt: new Date()
        }
      })

      setCollaborationState(prev => ({ ...prev, session }))

      await enterprise.sendNotification(
        'info',
        'Collaboration Started',
        'Real-time collaboration session has been started'
      )

      return session
    } catch (error) {
      await enterprise.sendNotification(
        'error',
        'Collaboration Failed',
        `Failed to start collaboration: ${error.message}`
      )
      throw error
    }
  }, [enterprise, componentName, dataSourceId])

  const addComment = useCallback(async (text: string, context?: any) => {
    if (!collaborationState.session) return

    try {
      const comment = await enterprise.collaboration.addComment(
        collaborationState.session.id,
        {
          text,
          context,
          author: 'current-user', // Get from user context
          timestamp: new Date()
        }
      )

      setCollaborationState(prev => ({
        ...prev,
        comments: [...prev.comments, comment]
      }))

      return comment
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }, [enterprise, collaborationState.session])

  const endCollaboration = useCallback(async () => {
    if (!collaborationState.session) return

    try {
      await enterprise.collaboration.endSession(collaborationState.session.id)
      
      setCollaborationState({
        session: null,
        participants: [],
        comments: [],
        sharedCursor: null,
        realTimeChanges: []
      })

      await enterprise.sendNotification(
        'info',
        'Collaboration Ended',
        'Real-time collaboration session has been ended'
      )
    } catch (error) {
      console.error('Failed to end collaboration:', error)
    }
  }, [enterprise, collaborationState.session])

  return {
    ...enterprise,
    collaboration: {
      ...collaborationState,
      startCollaboration,
      addComment,
      endCollaboration,
      isActive: !!collaborationState.session
    }
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Hook for managing component-specific workflows
export function useWorkflowIntegration(componentName: string, dataSourceId?: number) {
  const { workflows, emitEvent } = useEnterpriseContext()
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])

  const createWorkflow = useCallback(async (workflowConfig: any) => {
    if (!workflows) return

    try {
      const workflow = await workflows.createWorkflow({
        ...workflowConfig,
        metadata: {
          ...workflowConfig.metadata,
          componentName,
          dataSourceId
        }
      })

      setActiveWorkflows(prev => [...prev, workflow])

      emitEvent(createEnterpriseEvent(
        'workflow:created',
        componentName,
        { workflowId: workflow.id, dataSourceId },
        'medium'
      ))

      return workflow
    } catch (error) {
      console.error(`Failed to create workflow from ${componentName}:`, error)
      throw error
    }
  }, [workflows, componentName, dataSourceId, emitEvent])

  const executeWorkflow = useCallback(async (workflowId: string, input?: any) => {
    if (!workflows) return

    try {
      const result = await workflows.executeWorkflow(workflowId, input)

      setActiveWorkflows(prev => 
        prev.map(wf => wf.id === workflowId ? { ...wf, status: 'completed', result } : wf)
      )

      emitEvent(createEnterpriseEvent(
        'workflow:completed',
        componentName,
        { workflowId, result, dataSourceId },
        'medium'
      ))

      return result
    } catch (error) {
      setActiveWorkflows(prev => 
        prev.map(wf => wf.id === workflowId ? { ...wf, status: 'failed', error } : wf)
      )

      emitEvent(createEnterpriseEvent(
        'workflow:failed',
        componentName,
        { workflowId, error: error.message, dataSourceId },
        'high'
      ))

      throw error
    }
  }, [workflows, componentName, dataSourceId, emitEvent])

  return {
    activeWorkflows,
    createWorkflow,
    executeWorkflow,
    canCreateWorkflow: !!workflows
  }
}

// Hook for real-time analytics integration
export function useAnalyticsIntegration(componentName: string, dataSourceId?: number) {
  const { analytics, emitEvent } = useEnterpriseContext()
  const [analyticsData, setAnalyticsData] = useState({
    insights: [],
    predictions: [],
    recommendations: [],
    correlations: []
  })

  const trackEvent = useCallback(async (eventType: string, eventData: any) => {
    if (!analytics) return

    try {
      await analytics.trackEvent({
        type: eventType,
        source: componentName,
        dataSourceId,
        timestamp: new Date(),
        data: eventData
      })

      emitEvent(createEnterpriseEvent(
        'analytics:event:tracked',
        componentName,
        { eventType, eventData, dataSourceId },
        'low'
      ))
    } catch (error) {
      console.error(`Failed to track analytics event from ${componentName}:`, error)
    }
  }, [analytics, componentName, dataSourceId, emitEvent])

  const generateInsights = useCallback(async (options?: any) => {
    if (!analytics || !dataSourceId) return []

    try {
      const insights = await analytics.generateInsights(dataSourceId, {
        includeRecommendations: true,
        includePredictions: true,
        ...options
      })

      setAnalyticsData(prev => ({
        ...prev,
        insights: insights.insights || [],
        predictions: insights.predictions || [],
        recommendations: insights.recommendations || []
      }))

      return insights
    } catch (error) {
      console.error(`Failed to generate insights from ${componentName}:`, error)
      return []
    }
  }, [analytics, componentName, dataSourceId])

  return {
    ...analyticsData,
    trackEvent,
    generateInsights,
    canAnalyze: !!analytics && !!dataSourceId
  }
}

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export {
  useEnterpriseFeatures,
  useMonitoringFeatures,
  useSecurityFeatures,
  useOperationsFeatures,
  useCollaborationFeatures,
  useWorkflowIntegration,
  useAnalyticsIntegration
}