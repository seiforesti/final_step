"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type {
  ComplianceRequirement, ComplianceAssessment, ComplianceGap, ComplianceEvidence,
  ComplianceWorkflow, ComplianceReport, ComplianceIntegration, ComplianceFramework
} from '../types'

// Core enterprise features hook for compliance components
export function useEnterpriseFeatures({
  componentName,
  complianceId,
  dataSourceId,
  enableAnalytics = true,
  enableCollaboration = true,
  enableWorkflows = true,
  enableMonitoring = true
}: {
  componentName: string
  complianceId?: number
  dataSourceId?: number
  enableAnalytics?: boolean
  enableCollaboration?: boolean
  enableWorkflows?: boolean
  enableMonitoring?: boolean
}) {
  const enterprise = useEnterpriseCompliance()
  
  // Enhanced state management with caching
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Performance monitoring
  const performanceRef = useRef({
    actionCount: 0,
    averageResponseTime: 0,
    errorRate: 0
  })
  
  // Execute enterprise actions with caching and performance monitoring
  const executeAction = useCallback(async (action: string, params: any = {}) => {
    const startTime = Date.now()
    const cacheKey = `${action}_${JSON.stringify(params)}`
    
    try {
      setLoading(true)
      setError(null)
      
      // Check cache for read operations
      if (action.startsWith('get')) {
        const cached = cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
          return cached.data
        }
      }
      
      // Execute the action through enterprise integration
      const result = await enterprise.executeAction(action, {
        ...params,
        componentName,
        complianceId,
        dataSourceId
      })
      
      // Cache the result for read operations
      if (action.startsWith('get')) {
        setCache((prev: Map<string, { data: any; timestamp: number }>) => new Map(prev).set(cacheKey, {
          data: result,
          timestamp: Date.now()
        }))
      }
      
      // Update performance metrics
      const responseTime = Date.now() - startTime
      performanceRef.current.actionCount++
      performanceRef.current.averageResponseTime = 
        (performanceRef.current.averageResponseTime + responseTime) / 2
      
      return result
      
    } catch (err: any) {
      setError(err.message || 'Action failed')
      performanceRef.current.errorRate = 
        (performanceRef.current.errorRate + 1) / performanceRef.current.actionCount
      throw err
    } finally {
      setLoading(false)
    }
  }, [enterprise, componentName, complianceId, dataSourceId, cache])
  
  // Batch operations for improved performance
  const batchExecuteActions = useCallback(async (actions: Array<{ action: string; params: any }>) => {
    try {
      setLoading(true)
      const results = await enterprise.batchExecuteActions(actions.map(({ action, params }) => ({
        action,
        params: { ...params, componentName, complianceId, dataSourceId }
      })))
      return results
    } catch (err: any) {
      setError(err.message || 'Batch operation failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [enterprise, componentName, complianceId, dataSourceId])
  
  // Real-time data subscription
  const subscribeToUpdates = useCallback((eventTypes: string[]) => {
    const unsubscribers = eventTypes.map(eventType => 
      enterprise.addEventListener(eventType, (event: any) => {
        // Invalidate relevant cache entries
        const keysToInvalidate = Array.from(cache.keys()).filter(key => 
          key.includes(eventType) || key.includes(event.entityType)
        )
        
        setCache((prev: Map<string, { data: any; timestamp: number }>) => {
          const newCache = new Map(prev)
          keysToInvalidate.forEach(key => newCache.delete(key))
          return newCache
        })
      })
    )
    
    return () => unsubscribers.forEach(unsub => unsub())
  }, [enterprise, cache])
  
  // Analytics integration
  const analytics = useMemo(() => ({
    getInsights: () => executeAction('getAnalyticsInsights', { enableAnalytics }),
    getTrends: () => executeAction('getAnalyticsTrends', { enableAnalytics }),
    getMetrics: () => executeAction('getAnalyticsMetrics', { enableAnalytics }),
    generateReport: (reportType: string) => executeAction('generateAnalyticsReport', { reportType, enableAnalytics })
  }), [executeAction, enableAnalytics])
  
  // Collaboration features
  const collaboration = useMemo(() => ({
    startSession: () => executeAction('startCollaborationSession', { enableCollaboration }),
    joinSession: (sessionId: string) => executeAction('joinCollaborationSession', { sessionId, enableCollaboration }),
    leaveSession: () => executeAction('leaveCollaborationSession', { enableCollaboration }),
    shareComponent: (shareOptions: any) => executeAction('shareComponent', { shareOptions, enableCollaboration })
  }), [executeAction, enableCollaboration])
  
  // Workflow automation
  const workflows = useMemo(() => ({
    execute: (workflowId: string) => executeAction('executeWorkflow', { workflowId, enableWorkflows }),
    schedule: (workflowId: string, schedule: any) => executeAction('scheduleWorkflow', { workflowId, schedule, enableWorkflows }),
    monitor: () => executeAction('monitorWorkflows', { enableWorkflows }),
    getTemplates: () => executeAction('getWorkflowTemplates', { enableWorkflows })
  }), [executeAction, enableWorkflows])
  
  // Monitoring and alerting
  const monitoring = useMemo(() => ({
    getStatus: () => executeAction('getMonitoringStatus', { enableMonitoring }),
    getAlerts: () => executeAction('getMonitoringAlerts', { enableMonitoring }),
    createAlert: (alertConfig: any) => executeAction('createMonitoringAlert', { alertConfig, enableMonitoring }),
    getMetrics: () => executeAction('getMonitoringMetrics', { enableMonitoring })
  }), [executeAction, enableMonitoring])
  
  // Performance metrics
  const getPerformanceMetrics = useCallback(() => ({
    ...performanceRef.current,
    cacheSize: cache.size,
    cacheHitRate: cache.size > 0 ? 1 - performanceRef.current.errorRate : 0
  }), [cache.size])
  
  // Cleanup cache periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      setCache((prev: Map<string, { data: any; timestamp: number }>) => {
        const newCache = new Map()
        prev.forEach((value, key) => {
          if (now - value.timestamp < 600000) { // Keep for 10 minutes
            newCache.set(key, value)
          }
        })
        return newCache
      })
    }, 300000) // Cleanup every 5 minutes
    
    return () => clearInterval(cleanup)
  }, [])
  
  return {
    executeAction,
    batchExecuteActions,
    subscribeToUpdates,
    analytics,
    collaboration,
    workflows,
    monitoring,
    loading,
    error,
    getPerformanceMetrics,
    // Feature flags
    features: {
      analytics: enableAnalytics,
      collaboration: enableCollaboration,
      workflows: enableWorkflows,
      monitoring: enableMonitoring
    }
  }
}

// Compliance monitoring hook with advanced features
export function useComplianceMonitoring(dataSourceId?: number, complianceId?: number) {
  const enterprise = useEnterpriseCompliance()
  
  const [monitoringData, setMonitoringData] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [loading, setLoading] = useState(false)

  // Load monitoring data
  const loadMonitoringData = useCallback(async () => {
    setLoading(true)
    try {
      const [status, metrics, riskData] = await Promise.all([
        enterprise.getComplianceStatus({ data_source_id: dataSourceId }),
        enterprise.getAnalytics('30d', { data_source_id: dataSourceId }),
        enterprise.getRiskAssessment(dataSourceId?.toString() || '', 'data_source')
      ])
      
      setMonitoringData({ status, metrics, riskData })
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
      enterprise.sendNotification('error', 'Failed to load monitoring data')
    } finally {
      setLoading(false)
    }
  }, [enterprise, dataSourceId])

  // Monitor compliance status with real-time updates
  const startMonitoring = useCallback(() => {
    if (!realTimeUpdates) return

    const checkAlerts = () => {
      const newAlerts = enterprise.events.filter((event: any) => 
        (event.type === 'compliance_alert' || event.type === 'risk_threshold_exceeded') &&
        (event.severity === 'high' || event.severity === 'critical')
      )
      
      if (newAlerts.length > 0) {
        setAlerts((prev: any[]) => [...prev, ...newAlerts])
      }
    }

    // Check alerts every 30 seconds
    const alertInterval = setInterval(checkAlerts, 30000)

    // Subscribe to real-time events
    const unsubscribeCompliance = enterprise.addEventListener('compliance_alert', (event: any) => {
      setAlerts((prev: any[]) => [...prev, event])
    })

    const unsubscribeRisk = enterprise.addEventListener('risk_threshold_exceeded', (event: any) => {
      setAlerts((prev: any[]) => [...prev, event])
    })

    return () => {
      clearInterval(alertInterval)
      unsubscribeCompliance()
      unsubscribeRisk()
    }
  }, [enterprise, realTimeUpdates])

  useEffect(() => {
    loadMonitoringData()
    const cleanup = startMonitoring()
    return cleanup
  }, [loadMonitoringData, startMonitoring])

  return {
    monitoringData,
    alerts,
    loading,
    realTimeUpdates,
    setRealTimeUpdates,
    loadMonitoringData,
    clearAlerts: () => setAlerts([])
  }
}

// Risk assessment hook with advanced analytics
export function useRiskAssessment(dataSourceId?: number, entityType: string = 'data_source') {
  const enterprise = useEnterpriseCompliance()
  
  const [riskData, setRiskData] = useState<any>(null)
  const [riskFactors, setRiskFactors] = useState<any[]>([])
  const [riskMatrix, setRiskMatrix] = useState<any>(null)

  // Calculate comprehensive risk score
  const calculateRiskScore = useCallback(async (factors?: Record<string, any>) => {
    try {
      if (!dataSourceId) return null
      const result = await ComplianceAPIs.Risk.calculateRiskScore(
        dataSourceId.toString(), 
        entityType, 
        factors
      )
      setRiskData(result)
      return result
    } catch (err) {
      console.error('Failed to calculate risk score:', err)
      return null
    }
  }, [dataSourceId, entityType])

  // Get risk factors with detailed analysis
  const getRiskFactors = useCallback(async () => {
    try {
      if (!dataSourceId) return []
      const factors = await ComplianceAPIs.Risk.getRiskFactors(dataSourceId.toString(), entityType)
      setRiskFactors(factors)
      return factors
    } catch (err) {
      console.error('Failed to get risk factors:', err)
      return []
    }
  }, [dataSourceId, entityType])

  // Update risk factors with validation
  const updateRiskFactors = useCallback(async (factors: any[]) => {
    try {
      if (!dataSourceId) return
      await ComplianceAPIs.Risk.updateRiskFactors(dataSourceId.toString(), entityType, factors)
      setRiskFactors(factors)
      enterprise.sendNotification('success', 'Risk factors updated successfully')
      
      // Recalculate risk score after update
      await calculateRiskScore()
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to update risk factors')
      throw err
    }
  }, [dataSourceId, entityType, enterprise, calculateRiskScore])

  // Get risk matrix configuration
  const getRiskMatrix = useCallback(async () => {
    try {
      const matrix = await ComplianceAPIs.Risk.getRiskMatrix()
      setRiskMatrix(matrix)
      return matrix
    } catch (err) {
      console.error('Failed to get risk matrix:', err)
      return null
    }
  }, [])

  // Generate risk report
  const generateRiskReport = useCallback(async (reportType: string = 'detailed') => {
    try {
      if (!dataSourceId) return null
      const report = await ComplianceAPIs.Risk.generateRiskReport(
        dataSourceId.toString(), 
        entityType, 
        reportType
      )
      enterprise.sendNotification('success', 'Risk report generated successfully')
      return report
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to generate risk report')
      throw err
    }
  }, [dataSourceId, entityType, enterprise])

  return {
    calculateRiskScore,
    getRiskFactors,
    updateRiskFactors,
    getRiskMatrix,
    generateRiskReport,
    riskData,
    riskFactors,
    riskMatrix
  }
}

// Framework integration hook with multi-framework support
export function useFrameworkIntegration() {
  const enterprise = useEnterpriseCompliance()
  
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [frameworkMappings, setFrameworkMappings] = useState<Record<string, any>>({})

  // Get available frameworks with filtering
  const getFrameworks = useCallback(async (filters?: {
    category?: string
    status?: string
    jurisdiction?: string
    search?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Framework.getFrameworks(filters)
      setFrameworks(result)
      return result
    } catch (err) {
      console.error('Failed to get frameworks:', err)
      return []
    }
  }, [])

  // Get framework details
  const getFramework = useCallback(async (frameworkId: string) => {
    try {
      const framework = await ComplianceAPIs.Framework.getFramework(frameworkId)
      return framework
    } catch (err) {
      console.error('Failed to get framework:', err)
      return null
    }
  }, [])

  // Import framework requirements with options
  const importFrameworkRequirements = useCallback(async (
    framework: string, 
    dataSourceId: number,
    options?: {
      overwrite_existing?: boolean
      import_controls?: boolean
      import_evidence_templates?: boolean
    }
  ) => {
    try {
      const result = await ComplianceAPIs.Framework.importFrameworkRequirements(
        framework, 
        dataSourceId, 
        options
      )
      enterprise.sendNotification('success', 
        `Imported ${result.imported_count} requirements from ${framework}`
      )
      return result
    } catch (err) {
      enterprise.sendNotification('error', `Failed to import ${framework} requirements`)
      throw err
    }
  }, [enterprise])

  // Validate framework compliance
  const validateFrameworkCompliance = useCallback(async (framework: string, entityId: string) => {
    try {
      const result = await ComplianceAPIs.Framework.validateFrameworkCompliance(
        framework, 
        entityId
      )
      return result
    } catch (err) {
      console.error('Failed to validate framework compliance:', err)
      return null
    }
  }, [])

  // Create framework mapping
  const createFrameworkMapping = useCallback(async (
    sourceFramework: string, 
    targetFramework: string, 
    mappings: Record<string, string[]>
  ) => {
    try {
      await ComplianceAPIs.Framework.createFrameworkMapping(
        sourceFramework, 
        targetFramework, 
        mappings
      )
      setFrameworkMappings(prev => ({
        ...prev,
        [`${sourceFramework}_${targetFramework}`]: mappings
      }))
      enterprise.sendNotification('success', 
        `Framework mapping created: ${sourceFramework} → ${targetFramework}`
      )
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to create framework mapping')
      throw err
    }
  }, [enterprise])

  // Get framework crosswalk
  const getFrameworkCrosswalk = useCallback(async (frameworkId: string) => {
    try {
      const crosswalk = await ComplianceAPIs.Framework.getFrameworkCrosswalk(frameworkId)
      return crosswalk
    } catch (err) {
      console.error('Failed to get framework crosswalk:', err)
      return null
    }
  }, [])

  return {
    getFrameworks,
    getFramework,
    importFrameworkRequirements,
    validateFrameworkCompliance,
    createFrameworkMapping,
    getFrameworkCrosswalk,
    frameworks,
    selectedFramework,
    setSelectedFramework,
    frameworkMappings
  }
}

// Audit features hook with comprehensive tracking
export function useAuditFeatures(entityType: string = 'compliance', entityId?: string) {
  const enterprise = useEnterpriseCompliance()
  
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [certifications, setCertifications] = useState<any[]>([])

  // Get comprehensive audit trail
  const getAuditTrail = useCallback(async (filters?: {
    action_type?: string
    user_id?: string
    date_from?: string
    date_to?: string
    page?: number
    limit?: number
  }) => {
    try {
      if (!entityId) return []
      const trail = await ComplianceAPIs.Audit.getAuditTrail(entityType, entityId, filters)
      setAuditTrail(trail.data)
      return trail.data
    } catch (err) {
      console.error('Failed to get audit trail:', err)
      return []
    }
  }, [entityType, entityId])

  // Generate compliance report with advanced options
  const generateReport = useCallback(async (
    reportType: string, 
    params?: any,
    schedule?: any
  ) => {
    try {
      const reportData = {
        name: `${reportType.replace('_', ' ').toUpperCase()} Report`,
        description: `Generated ${reportType} report`,
        report_type: reportType,
        file_format: 'pdf',
        parameters: params || {},
        filters: { entity_type: entityType, entity_id: entityId },
        schedule,
        recipients: [],
        distribution_method: 'download',
        access_level: 'internal',
        metadata: {}
      }
      
      // Create and generate report through enterprise API
      const reportResult = await enterprise.executeAction('generateAuditReport', {
        reportType,
        entityType,
        entityId,
        schedule,
        recipients
      })
      
              enterprise.sendNotification('success', 'Report generated successfully')
        return reportResult
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to generate report')
      throw err
    }
  }, [entityType, entityId, enterprise])

  // Get compliance reports with filtering
  const getReports = useCallback(async (filters?: {
    framework?: string
    report_type?: string
    status?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Audit.getComplianceReports({
        ...filters,
        page: 1,
        limit: 100
      })
      setReports(result.data)
      return result.data
    } catch (err) {
      console.error('Failed to get reports:', err)
      return []
    }
  }, [])

  // Get certifications
  const getCertifications = useCallback(async () => {
    try {
      if (!entityId) return []
      const certs = await ComplianceAPIs.Audit.getCertifications(entityId, entityType)
      setCertifications(certs)
      return certs
    } catch (err) {
      console.error('Failed to get certifications:', err)
      return []
    }
  }, [entityId, entityType])

  // Upload certification
  const uploadCertification = useCallback(async (certification: any, file?: File) => {
    try {
      if (!entityId) return null
      const result = await ComplianceAPIs.Audit.uploadCertification(entityId, certification, file)
      enterprise.sendNotification('success', 'Certification uploaded successfully')
      await getCertifications() // Refresh list
      return result
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to upload certification')
      throw err
    }
  }, [entityId, enterprise, getCertifications])

  return {
    getAuditTrail,
    generateReport,
    getReports,
    getCertifications,
    uploadCertification,
    auditTrail,
    reports,
    certifications
  }
}

// Workflow integration hook with advanced automation
export function useWorkflowIntegration() {
  const enterprise = useEnterpriseCompliance()
  
  const [workflows, setWorkflows] = useState<ComplianceWorkflow[]>([])
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<any[]>([])

  // Get workflows with advanced filtering
  const getWorkflows = useCallback(async (filters?: {
    workflow_type?: string
    status?: string
    assigned_to?: string
    priority?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Workflow.getWorkflows(filters)
      setWorkflows(result.data)
      return result.data
    } catch (err) {
      console.error('Failed to get workflows:', err)
      return []
    }
  }, [])

  // Get workflow details
  const getWorkflow = useCallback(async (id: number) => {
    try {
      const workflow = await ComplianceAPIs.Workflow.getWorkflow(id)
      return workflow
    } catch (err) {
      console.error('Failed to get workflow:', err)
      return null
    }
  }, [])

  // Start workflow with advanced parameters
  const startWorkflow = useCallback(async (workflowId: number, params?: any) => {
    try {
      const result = await ComplianceAPIs.Workflow.startWorkflow(workflowId, params)
      enterprise.sendNotification('success', 'Workflow started successfully')
      
      // Refresh active workflows
      await getActiveWorkflows()
      
      return result.instance_id
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to start workflow')
      throw err
    }
  }, [enterprise])

  // Manage workflow instances
  const manageWorkflow = useCallback(async (instanceId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      switch (action) {
        case 'pause':
          await ComplianceAPIs.Workflow.pauseWorkflow(instanceId)
          break
        case 'resume':
          await ComplianceAPIs.Workflow.resumeWorkflow(instanceId)
          break
        case 'cancel':
          await ComplianceAPIs.Workflow.cancelWorkflow(instanceId)
          break
      }
      
      enterprise.sendNotification('success', `Workflow ${action}ed successfully`)
      await getActiveWorkflows() // Refresh list
    } catch (err) {
      enterprise.sendNotification('error', `Failed to ${action} workflow`)
      throw err
    }
  }, [enterprise])

  // Approve workflow step
  const approveWorkflowStep = useCallback(async (
    instanceId: string, 
    stepId: string, 
    decision: 'approve' | 'reject', 
    notes?: string
  ) => {
    try {
      await ComplianceAPIs.Workflow.approveWorkflowStep(instanceId, stepId, decision, notes)
      enterprise.sendNotification('success', `Workflow step ${decision}ed`)
      await getActiveWorkflows() // Refresh list
    } catch (err) {
      enterprise.sendNotification('error', `Failed to ${decision} workflow step`)
      throw err
    }
  }, [enterprise])

  // Get workflow status
  const getWorkflowStatus = useCallback(async (instanceId: string) => {
    try {
      const status = await ComplianceAPIs.Workflow.getWorkflowStatus(instanceId)
      return status
    } catch (err) {
      console.error('Failed to get workflow status:', err)
      return null
    }
  }, [])

  // Get active workflow instances
  const getActiveWorkflows = useCallback(async (filters?: {
    workflow_id?: number
    assigned_to?: string
    status?: string
  }) => {
    try {
      const instances = await ComplianceAPIs.Workflow.getActiveWorkflowInstances(filters)
      setActiveWorkflows(instances)
      return instances
    } catch (err) {
      console.error('Failed to get active workflows:', err)
      return []
    }
  }, [])

  // Get workflow templates
  const getWorkflowTemplates = useCallback(async () => {
    try {
      const templates = await ComplianceAPIs.Workflow.getWorkflowTemplates()
      setWorkflowTemplates(templates)
      return templates
    } catch (err) {
      console.error('Failed to get workflow templates:', err)
      return []
    }
  }, [])

  // Create workflow from template
  const createWorkflowFromTemplate = useCallback(async (templateId: string, customizations?: any) => {
    try {
      const template = workflowTemplates.find((t: any) => t.id === templateId)
      if (!template) throw new Error('Template not found')
      
      const workflowData = {
        ...template,
        ...customizations,
        id: undefined, // Remove template ID
        status: 'draft'
      }
      
      const workflow = await ComplianceAPIs.Workflow.createWorkflow(workflowData)
      enterprise.sendNotification('success', 'Workflow created from template')
      await getWorkflows() // Refresh list
      return workflow
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to create workflow from template')
      throw err
    }
  }, [workflowTemplates, enterprise])

  return {
    getWorkflows,
    getWorkflow,
    startWorkflow,
    manageWorkflow,
    approveWorkflowStep,
    getWorkflowStatus,
    getActiveWorkflows,
    getWorkflowTemplates,
    createWorkflowFromTemplate,
    workflows,
    activeWorkflows,
    workflowTemplates
  }
}

// Analytics integration hook with AI insights
export function useAnalyticsIntegration(dataSourceId?: number, complianceId?: number) {
  const enterprise = useEnterpriseCompliance()
  
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])

  // Get comprehensive analytics data
  const getAnalytics = useCallback(async (timeRange?: string, filters?: any) => {
    try {
      const data = await enterprise.getAnalytics(timeRange, {
        data_source_id: dataSourceId,
        compliance_id: complianceId,
        ...filters
      })
      setAnalyticsData(data)
      return data
    } catch (err) {
      console.error('Failed to get analytics:', err)
      return null
    }
  }, [enterprise, dataSourceId, complianceId])

  // Get AI-powered insights
  const getInsights = useCallback(async (category?: string, limit?: number) => {
    try {
      const data = await enterprise.getInsights(category, limit)
      setInsights(data)
      return data
    } catch (err) {
      console.error('Failed to get insights:', err)
      return []
    }
  }, [enterprise])

  // Generate specific insight
  const generateInsight = useCallback(async (type: string, params: any) => {
    try {
      const insight = await enterprise.generateInsight(type, {
        data_source_id: dataSourceId,
        compliance_id: complianceId,
        ...params
      })
      setInsights(prev => [insight, ...prev])
      enterprise.sendNotification('success', 'New insight generated')
      return insight
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to generate insight')
      throw err
    }
  }, [enterprise, dataSourceId, complianceId])

  // Get compliance trends
  const getComplianceTrends = useCallback(async (period: string = '90d') => {
    try {
      if (!dataSourceId) return []
      const trendData = await ComplianceAPIs.Risk.getRiskTrends(
        dataSourceId.toString(), 
        'data_source', 
        period
      )
      setTrends(trendData)
      return trendData
    } catch (err) {
      console.error('Failed to get compliance trends:', err)
      return []
    }
  }, [dataSourceId])

  // Get predictive analytics
  const getPredictiveAnalytics = useCallback(async () => {
    try {
      const result = await generateInsight('risk_prediction', {
        prediction_horizon: '30d',
        confidence_threshold: 0.8
      })
      setPredictions(prev => [result, ...prev])
      return result
    } catch (err) {
      console.error('Failed to get predictive analytics:', err)
      return null
    }
  }, [generateInsight])

  // Get anomaly detection
  const getAnomalyDetection = useCallback(async () => {
    try {
      const result = await generateInsight('anomaly_detection', {
        sensitivity: 'medium',
        lookback_period: '7d'
      })
      return result
    } catch (err) {
      console.error('Failed to get anomaly detection:', err)
      return null
    }
  }, [generateInsight])

  // Dismiss insight
  const dismissInsight = useCallback(async (insightId: string) => {
    try {
      await enterprise.dismissInsight(insightId)
      setInsights(prev => prev.filter(i => i.id !== insightId))
    } catch (err) {
      console.error('Failed to dismiss insight:', err)
    }
  }, [enterprise])

  return {
    getAnalytics,
    getInsights,
    generateInsight,
    getComplianceTrends,
    getPredictiveAnalytics,
    getAnomalyDetection,
    dismissInsight,
    analyticsData,
    insights,
    trends,
    predictions
  }
}

// Evidence management hook with advanced features
export function useEvidenceManagement(requirementId?: number, dataSourceId?: number) {
  const enterprise = useEnterpriseCompliance()
  
  const [evidence, setEvidence] = useState<ComplianceEvidence[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Get evidence with filtering
  const getEvidence = useCallback(async (filters?: {
    evidence_type?: string
    verification_status?: string
    page?: number
    limit?: number
  }) => {
    try {
      const result = await ComplianceAPIs.Management.getEvidence({
        data_source_id: dataSourceId,
        requirement_id: requirementId,
        ...filters
      })
      setEvidence(result.data)
      return result.data
    } catch (err) {
      console.error('Failed to get evidence:', err)
      return []
    }
  }, [dataSourceId, requirementId])

  // Create evidence entry
  const createEvidence = useCallback(async (evidenceData: Partial<ComplianceEvidence>) => {
    try {
      const evidence = await ComplianceAPIs.Management.createEvidence({
        data_source_id: dataSourceId!,
        requirement_id: requirementId!,
        collection_date: new Date().toISOString(),
        is_current: true,
        verification_status: 'pending',
        access_level: 'internal',
        metadata: {},
        ...evidenceData
      })
      
      setEvidence(prev => [evidence, ...prev])
      enterprise.sendNotification('success', 'Evidence created successfully')
      return evidence
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to create evidence')
      throw err
    }
  }, [dataSourceId, requirementId, enterprise])

  // Upload evidence file
  const uploadEvidenceFile = useCallback(async (evidenceId: number, file: File) => {
    try {
      const uploadId = `upload_${evidenceId}_${Date.now()}`
      
      const evidence = await ComplianceAPIs.Management.uploadEvidenceFile(
        evidenceId,
        file,
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [uploadId]: progress }))
        }
      )
      
      // Remove progress tracking
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[uploadId]
        return newProgress
      })
      
      // Update evidence list
      setEvidence(prev => prev.map(e => e.id === evidenceId ? evidence : e))
      enterprise.sendNotification('success', 'Evidence file uploaded successfully')
      return evidence
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to upload evidence file')
      throw err
    }
  }, [enterprise])

  // Verify evidence
  const verifyEvidence = useCallback(async (
    evidenceId: number, 
    status: ComplianceEvidence['verification_status'], 
    notes?: string
  ) => {
    try {
      const evidence = await ComplianceAPIs.Management.verifyEvidence(evidenceId, {
        verification_status: status,
        verification_notes: notes
      })
      
      setEvidence(prev => prev.map(e => e.id === evidenceId ? evidence : e))
      enterprise.sendNotification('success', `Evidence ${status}`)
      return evidence
    } catch (err) {
      enterprise.sendNotification('error', `Failed to ${status} evidence`)
      throw err
    }
  }, [enterprise])

  // Download evidence file
  const downloadEvidenceFile = useCallback(async (evidenceId: number) => {
    try {
      const blob = await ComplianceAPIs.Management.downloadEvidenceFile(evidenceId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evidence_${evidenceId}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      enterprise.sendNotification('success', 'Evidence file downloaded')
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to download evidence file')
      throw err
    }
  }, [enterprise])

  return {
    getEvidence,
    createEvidence,
    uploadEvidenceFile,
    verifyEvidence,
    downloadEvidenceFile,
    evidence,
    uploadProgress
  }
}

// Integration management hook
export function useIntegrationManagement() {
  const enterprise = useEnterpriseCompliance()
  
  const [integrations, setIntegrations] = useState<ComplianceIntegration[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState<Record<number, any>>({})

  // Get integrations
  const getIntegrations = useCallback(async (filters?: {
    integration_type?: string
    provider?: string
    status?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Integration.getIntegrations(filters)
      setIntegrations(result)
      return result
    } catch (err) {
      console.error('Failed to get integrations:', err)
      return []
    }
  }, [])

  // Get available integrations
  const getAvailableIntegrations = useCallback(async () => {
    try {
      const result = await ComplianceAPIs.Integration.getAvailableIntegrations()
      setAvailableIntegrations(result)
      return result
    } catch (err) {
      console.error('Failed to get available integrations:', err)
      return []
    }
  }, [])

  // Test integration
  const testIntegration = useCallback(async (integrationId: number) => {
    try {
      const result = await ComplianceAPIs.Integration.testIntegration(integrationId)
      
      if (result.status === 'success') {
        enterprise.sendNotification('success', 'Integration test successful')
      } else {
        enterprise.sendNotification('error', `Integration test failed: ${result.error_message}`)
      }
      
      return result
    } catch (err) {
      enterprise.sendNotification('error', 'Integration test failed')
      throw err
    }
  }, [enterprise])

  // Sync integration
  const syncIntegration = useCallback(async (integrationId: number, fullSync: boolean = false) => {
    try {
      const result = await ComplianceAPIs.Integration.syncIntegration(integrationId, { full_sync: fullSync })
      
      setSyncStatus(prev => ({
        ...prev,
        [integrationId]: { status: 'syncing', sync_id: result.sync_id }
      }))
      
      enterprise.sendNotification('info', 'Integration sync started')
      return result
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to start integration sync')
      throw err
    }
  }, [enterprise])

  // Get integration status
  const getIntegrationStatus = useCallback(async (integrationId: number) => {
    try {
      const status = await ComplianceAPIs.Integration.getIntegrationStatus(integrationId)
      setSyncStatus(prev => ({ ...prev, [integrationId]: status }))
      return status
    } catch (err) {
      console.error('Failed to get integration status:', err)
      return null
    }
  }, [])

  return {
    getIntegrations,
    getAvailableIntegrations,
    testIntegration,
    syncIntegration,
    getIntegrationStatus,
    integrations,
    availableIntegrations,
    syncStatus
  }
}

// **COMPREHENSIVE: Enhanced Compliance Management Hooks**
export function useComplianceRules(options?: {
  rule_type?: string
  severity?: string
  status?: string
  scope?: string
  data_source_id?: number
  compliance_standard?: string
  tags?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
  sort_order?: string
  auto_refresh?: boolean
}) {
  const enterprise = useEnterpriseCompliance()
  
  const [rules, setRules] = useState<ComplianceRequirement[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ComplianceAPIs.ComplianceManagement.getRequirements(options)
      setRules(response.data || [])
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        pages: response.pages
      })
      
      enterprise.emitEvent({
        type: 'compliance_rules_loaded',
        data: { count: response.data?.length || 0, filters: options },
        source: 'useComplianceRules',
        severity: 'low'
      })
      
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance rules')
      enterprise.sendNotification('error', 'Failed to load compliance rules')
    } finally {
      setLoading(false)
    }
  }, [enterprise, JSON.stringify(options)])

  const createRule = useCallback(async (data: Partial<ComplianceRequirement>, created_by?: string) => {
    try {
      const rule = await ComplianceAPIs.ComplianceManagement.createRequirement(data, created_by)
      setRules(prev => [rule, ...prev])
      enterprise.sendNotification('success', `Rule "${rule.name}" created successfully`)
      return rule
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to create rule')
      throw err
    }
  }, [enterprise])

  const updateRule = useCallback(async (id: number, data: Partial<ComplianceRequirement>, updated_by?: string) => {
    try {
      const rule = await ComplianceAPIs.ComplianceManagement.updateRequirement(id, data, updated_by)
      setRules(prev => prev.map(r => r.id === id ? rule : r))
      enterprise.sendNotification('success', `Rule "${rule.name}" updated successfully`)
      return rule
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to update rule')
      throw err
    }
  }, [enterprise])

  const deleteRule = useCallback(async (id: number) => {
    try {
      await ComplianceAPIs.ComplianceManagement.deleteRequirement(id)
      setRules(prev => prev.filter(r => r.id !== id))
      enterprise.sendNotification('success', 'Rule deleted successfully')
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to delete rule')
      throw err
    }
  }, [enterprise])

  const evaluateRule = useCallback(async (id: number, params?: {
    data_source_ids?: number[]
    run_scans?: boolean
    include_performance_check?: boolean
    include_security_check?: boolean
  }) => {
    try {
      const result = await ComplianceAPIs.ComplianceManagement.evaluateRequirement(id, params)
      enterprise.sendNotification('success', 'Rule evaluation completed')
      return result
    } catch (err: any) {
      enterprise.sendNotification('error', 'Rule evaluation failed')
      throw err
    }
  }, [enterprise])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  // Auto-refresh if enabled
  useEffect(() => {
    if (options?.auto_refresh) {
      const interval = setInterval(loadRules, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [options?.auto_refresh, loadRules])

  return {
    rules,
    pagination,
    loading,
    error,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
    evaluateRule
  }
}

// **COMPREHENSIVE: Enhanced Rule Template Hooks**
export function useComplianceTemplates() {
  const enterprise = useEnterpriseCompliance()
  
  const [frameworks, setFrameworks] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadFrameworks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ComplianceAPIs.ComplianceManagement.getFrameworks()
      setFrameworks(response || [])
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to load frameworks')
    } finally {
      setLoading(false)
    }
  }, [enterprise])

  const loadTemplatesByFramework = useCallback(async (framework: string) => {
    setLoading(true)
    try {
      const response = await ComplianceAPIs.ComplianceManagement.getTemplatesByFramework(framework)
      setTemplates(response || [])
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [enterprise])

  const createRuleFromTemplate = useCallback(async (templateData: any, created_by?: string) => {
    try {
      const rule = await ComplianceAPIs.ComplianceManagement.createRuleFromTemplate(templateData, created_by)
      enterprise.sendNotification('success', `Rule created from template: ${rule.name}`)
      return rule
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to create rule from template')
      throw err
    }
  }, [enterprise])

  useEffect(() => {
    loadFrameworks()
  }, [loadFrameworks])

  return {
    frameworks,
    templates,
    loading,
    loadFrameworks,
    loadTemplatesByFramework,
    createRuleFromTemplate
  }
}

// **COMPREHENSIVE: Enhanced Issues Management Hooks**
export function useComplianceIssues(options?: {
  rule_id?: number
  status?: string
  severity?: string
  assigned_to?: string
  data_source_id?: number
  page?: number
  limit?: number
}) {
  const enterprise = useEnterpriseCompliance()
  
  const [issues, setIssues] = useState<ComplianceGap[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50
  })
  const [loading, setLoading] = useState(false)

  const loadIssues = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ComplianceAPIs.ComplianceManagement.getIssues(options)
      setIssues(response.data || [])
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit
      })
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }, [enterprise, JSON.stringify(options)])

  const createIssue = useCallback(async (data: Partial<ComplianceGap>) => {
    try {
      const issue = await ComplianceAPIs.ComplianceManagement.createIssue(data)
      setIssues(prev => [issue, ...prev])
      enterprise.sendNotification('success', 'Issue created successfully')
      return issue
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to create issue')
      throw err
    }
  }, [enterprise])

  const updateIssue = useCallback(async (id: number, data: Partial<ComplianceGap>) => {
    try {
      const issue = await ComplianceAPIs.ComplianceManagement.updateIssue(id, data)
      setIssues(prev => prev.map(i => i.id === id ? issue : i))
      enterprise.sendNotification('success', 'Issue updated successfully')
      return issue
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to update issue')
      throw err
    }
  }, [enterprise])

  useEffect(() => {
    loadIssues()
  }, [loadIssues])

  return {
    issues,
    pagination,
    loading,
    loadIssues,
    createIssue,
    updateIssue
  }
}

// **COMPREHENSIVE: Enhanced Analytics Hooks**
export function useComplianceAnalytics(options?: {
  data_source_id?: number
  time_range?: string
  auto_refresh?: boolean
}) {
  const enterprise = useEnterpriseCompliance()
  
  const [analytics, setAnalytics] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [integrationStatus, setIntegrationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const [analyticsData, trendsData, insightsData, statsData, statusData] = await Promise.all([
        ComplianceAPIs.ComplianceManagement.getDashboardAnalytics(options),
        ComplianceAPIs.ComplianceManagement.getTrends(undefined, parseInt(options?.time_range?.replace('d', '') || '30')),
        ComplianceAPIs.ComplianceManagement.getInsights(undefined, parseInt(options?.time_range?.replace('d', '') || '30')),
        ComplianceAPIs.ComplianceManagement.getStatistics(),
        ComplianceAPIs.ComplianceManagement.getIntegrationStatus()
      ])
      
      setAnalytics(analyticsData)
      setTrends(trendsData || [])
      setInsights(insightsData || [])
      setStatistics(statsData)
      setIntegrationStatus(statusData)
      
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [enterprise, JSON.stringify(options)])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  // Auto-refresh if enabled
  useEffect(() => {
    if (options?.auto_refresh) {
      const interval = setInterval(loadAnalytics, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [options?.auto_refresh, loadAnalytics])

  return {
    analytics,
    trends,
    insights,
    statistics,
    integrationStatus,
    loading,
    loadAnalytics
  }
}

// **COMPREHENSIVE: Enhanced Data Source Integration Hooks**
export function useComplianceDataSources(options?: {
  rule_type?: string
  compliance_standard?: string
  environment?: string
  data_classification?: string
}) {
  const enterprise = useEnterpriseCompliance()
  
  const [dataSources, setDataSources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadDataSources = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ComplianceAPIs.ComplianceManagement.getDataSources()
      setDataSources(response || [])
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to load data sources')
    } finally {
      setLoading(false)
    }
  }, [enterprise])

  const getDataSourceCompliance = useCallback(async (id: number) => {
    try {
      return await ComplianceAPIs.ComplianceManagement.getDataSourceCompliance(id)
    } catch (err: any) {
      enterprise.sendNotification('error', 'Failed to get data source compliance')
      throw err
    }
  }, [enterprise])

  useEffect(() => {
    loadDataSources()
  }, [loadDataSources])

  return {
    dataSources,
    loading,
    loadDataSources,
    getDataSourceCompliance
  }
}

// Export all hooks as a collection
export const ComplianceHooks = {
  useEnterpriseFeatures,
  useComplianceMonitoring,
  useRiskAssessment,
  useFrameworkIntegration,
  useAuditFeatures,
  useWorkflowIntegration,
  useAnalyticsIntegration,
  useEvidenceManagement,
  useIntegrationManagement,
  useComplianceRules,
  useComplianceTemplates,
  useComplianceIssues,
  useComplianceAnalytics,
  useComplianceDataSources
}

// Individual hooks are already exported at their declaration points

export default ComplianceHooks