// ============================================================================
// ENTERPRISE INTEGRATION FOUNDATION - PHASE ORCHESTRATION SYSTEM
// ============================================================================

"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

// Import all three phases
import { CoreInfrastructure } from './core/index'
import correlationEngine, { CorrelationEngine } from './analytics/correlation-engine'
import realTimeCollaborationManager, { RealTimeCollaborationManager } from './collaboration/realtime-collaboration'
import { WorkflowEngine } from './workflows/approval-system'
import bulkOperationsManager, { BulkOperationsManager } from './workflows/bulk-operations'

// Import UI components
import { EnterpriseDashboard } from './ui/dashboard/enterprise-dashboard'
import { AnalyticsWorkbench } from './ui/analytics/analytics-workbench'
import { CollaborationStudio } from './ui/collaboration/collaboration-studio'
import { WorkflowDesigner } from './ui/workflow/workflow-designer'

// Import backend services
import {
  useDataSourcesQuery,
  useDataSourceMetricsQuery,
  usePerformanceMetricsQuery,
  useSecurityAuditQuery,
  useComplianceStatusQuery,
  useBackupStatusQuery,
  useUserPermissionsQuery,
  useAuditLogsQuery,
  useNotificationsQuery,
  useWorkspaceQuery,
  useScheduledTasksQuery,
  useIntegrationsQuery,
  useReportsQuery,
  useVersionHistoryQuery,
  useTagsQuery,
  useCatalogQuery,
  useLineageQuery,
  useQualityMetricsQuery,
  useGrowthMetricsQuery,
  useDiscoveryHistoryQuery,
  useScanResultsQuery
} from './services/apis'

import { DataSource } from './types'

// ============================================================================
// ENTERPRISE CONTEXT INTERFACES
// ============================================================================

export interface EnterpriseContext {
  // Core Infrastructure
  core: CoreInfrastructure
  analytics: CorrelationEngine
  collaboration: RealTimeCollaborationManager
  workflows: WorkflowEngine
  bulkOps: BulkOperationsManager
  
  // State Management
  selectedDataSource: DataSource | null
  setSelectedDataSource: (dataSource: DataSource | null) => void
  activeWorkspace: string
  setActiveWorkspace: (workspace: string) => void
  
  // Real-time Features
  realTimeUpdates: boolean
  setRealTimeUpdates: (enabled: boolean) => void
  collaborativeMode: boolean
  setCollaborativeMode: (enabled: boolean) => void
  
  // Advanced Features
  aiInsightsEnabled: boolean
  setAiInsightsEnabled: (enabled: boolean) => void
  autoWorkflowsEnabled: boolean
  setAutoWorkflowsEnabled: (enabled: boolean) => void
  
  // Enterprise Configuration
  config: EnterpriseConfig
  updateConfig: (updates: Partial<EnterpriseConfig>) => void
  
  // System Status
  systemHealth: SystemHealth
  connectionStatus: ConnectionStatus
  
  // Event Handlers
  handleEvent: (event: EnterpriseEvent) => void
  emitEvent: (event: EnterpriseEvent) => void
  
  // Backend Data
  backendData: BackendDataState
}

export interface EnterpriseConfig {
  analytics: {
    enableRealTimeAnalytics: boolean
    enablePredictiveAnalytics: boolean
    enableAnomalyDetection: boolean
    autoInsightsGeneration: boolean
    correlationThreshold: number
    refreshInterval: number
  }
  collaboration: {
    enableRealTimeCollaboration: boolean
    enableComments: boolean
    enableNotifications: boolean
    enableWorkspaceSharing: boolean
    maxConcurrentUsers: number
    autoSaveInterval: number
  }
  workflows: {
    enableWorkflowAutomation: boolean
    enableApprovalWorkflows: boolean
    enableBulkOperations: boolean
    autoExecuteWorkflows: boolean
    maxConcurrentWorkflows: number
    defaultTimeout: number
  }
  security: {
    enableAccessControl: boolean
    enableAuditLogging: boolean
    enableEncryption: boolean
    sessionTimeout: number
    maxFailedAttempts: number
  }
  performance: {
    enablePerformanceMonitoring: boolean
    enableCaching: boolean
    cacheTimeout: number
    maxCacheSize: number
    compressionEnabled: boolean
  }
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  core: HealthStatus
  analytics: HealthStatus
  collaboration: HealthStatus
  workflows: HealthStatus
  backend: HealthStatus
  lastCheck: Date
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  latency: number
  errorRate: number
  uptime: number
  details: string[]
}

export interface ConnectionStatus {
  backend: 'connected' | 'disconnected' | 'reconnecting'
  realTime: 'connected' | 'disconnected' | 'reconnecting'
  collaboration: 'connected' | 'disconnected' | 'reconnecting'
  lastConnected: Date
}

export interface EnterpriseEvent {
  id: string
  type: string
  source: string
  target?: string
  payload: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  metadata: Record<string, any>
}

export interface BackendDataState {
  dataSources: DataSource[]
  metrics: any
  performance: any
  security: any
  compliance: any
  backups: any
  permissions: any
  auditLogs: any
  notifications: any
  workspace: any
  tasks: any
  integrations: any
  reports: any
  versions: any
  tags: any
  catalog: any
  lineage: any
  quality: any
  growth: any
  discovery: any
  scans: any
  loading: Record<string, boolean>
  errors: Record<string, any>
}

// ============================================================================
// ENTERPRISE INTEGRATION PROVIDER
// ============================================================================

const EnterpriseContextState = createContext<EnterpriseContext | null>(null)

export interface EnterpriseIntegrationProviderProps {
  children: React.ReactNode
  queryClient: QueryClient
  initialConfig?: Partial<EnterpriseConfig>
}

export function EnterpriseIntegrationProvider({
  children,
  queryClient,
  initialConfig = {}
}: EnterpriseIntegrationProviderProps) {
  // ========================================================================
  // CORE STATE MANAGEMENT
  // ========================================================================
  
  const [initialized, setInitialized] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [activeWorkspace, setActiveWorkspace] = useState('default')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [collaborativeMode, setCollaborativeMode] = useState(false)
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true)
  const [autoWorkflowsEnabled, setAutoWorkflowsEnabled] = useState(true)
  
  // ========================================================================
  // ENTERPRISE CONFIGURATION
  // ========================================================================
  
  const [config, setConfig] = useState<EnterpriseConfig>({
    analytics: {
      enableRealTimeAnalytics: true,
      enablePredictiveAnalytics: true,
      enableAnomalyDetection: true,
      autoInsightsGeneration: true,
      correlationThreshold: 0.7,
      refreshInterval: 30000,
      ...initialConfig.analytics
    },
    collaboration: {
      enableRealTimeCollaboration: true,
      enableComments: true,
      enableNotifications: true,
      enableWorkspaceSharing: true,
      maxConcurrentUsers: 50,
      autoSaveInterval: 5000,
      ...initialConfig.collaboration
    },
    workflows: {
      enableWorkflowAutomation: true,
      enableApprovalWorkflows: true,
      enableBulkOperations: true,
      autoExecuteWorkflows: false,
      maxConcurrentWorkflows: 20,
      defaultTimeout: 300000,
      ...initialConfig.workflows
    },
    security: {
      enableAccessControl: true,
      enableAuditLogging: true,
      enableEncryption: true,
      sessionTimeout: 3600000,
      maxFailedAttempts: 3,
      ...initialConfig.security
    },
    performance: {
      enablePerformanceMonitoring: true,
      enableCaching: true,
      cacheTimeout: 300000,
      maxCacheSize: 100,
      compressionEnabled: true,
      ...initialConfig.performance
    }
  })
  
  // ========================================================================
  // SYSTEM HEALTH MONITORING
  // ========================================================================
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    core: { status: 'healthy', latency: 0, errorRate: 0, uptime: 100, details: [] },
    analytics: { status: 'healthy', latency: 0, errorRate: 0, uptime: 100, details: [] },
    collaboration: { status: 'healthy', latency: 0, errorRate: 0, uptime: 100, details: [] },
    workflows: { status: 'healthy', latency: 0, errorRate: 0, uptime: 100, details: [] },
    backend: { status: 'healthy', latency: 0, errorRate: 0, uptime: 100, details: [] },
    lastCheck: new Date()
  })
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    backend: 'connected',
    realTime: 'connected',
    collaboration: 'connected',
    lastConnected: new Date()
  })
  
  // ========================================================================
  // PHASE INSTANCES
  // ========================================================================
  
  const coreRef = useRef<CoreInfrastructure>()
  const analyticsRef = useRef<AnalyticsEngine>()
  const collaborationRef = useRef<CollaborationEngine>()
  const workflowsRef = useRef<WorkflowEngine>()
  const bulkOpsRef = useRef<BulkOperationsEngine>()
  
  // ========================================================================
  // BACKEND DATA INTEGRATION
  // ========================================================================
  
  // Data Sources
  const { data: dataSources, isLoading: dataSourcesLoading, error: dataSourcesError } = useDataSourcesQuery({}, {
    refetchInterval: realTimeUpdates ? config.analytics.refreshInterval : false
  })
  
  // Metrics and Analytics
  const { data: metrics, isLoading: metricsLoading } = useDataSourceMetricsQuery(selectedDataSource?.id)
  const { data: performance, isLoading: performanceLoading } = usePerformanceMetricsQuery(selectedDataSource?.id)
  const { data: quality, isLoading: qualityLoading } = useQualityMetricsQuery(selectedDataSource?.id)
  const { data: growth, isLoading: growthLoading } = useGrowthMetricsQuery(selectedDataSource?.id)
  
  // Security and Compliance
  const { data: security, isLoading: securityLoading } = useSecurityAuditQuery(selectedDataSource?.id)
  const { data: compliance, isLoading: complianceLoading } = useComplianceStatusQuery(selectedDataSource?.id)
  
  // Operations
  const { data: backups, isLoading: backupsLoading } = useBackupStatusQuery(selectedDataSource?.id)
  const { data: permissions, isLoading: permissionsLoading } = useUserPermissionsQuery()
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogsQuery()
  
  // Collaboration
  const { data: notifications, isLoading: notificationsLoading } = useNotificationsQuery()
  const { data: workspace, isLoading: workspaceLoading } = useWorkspaceQuery()
  
  // Task Management
  const { data: tasks, isLoading: tasksLoading } = useScheduledTasksQuery()
  const { data: integrations, isLoading: integrationsLoading } = useIntegrationsQuery()
  
  // Reporting and Versioning
  const { data: reports, isLoading: reportsLoading } = useReportsQuery()
  const { data: versions, isLoading: versionsLoading } = useVersionHistoryQuery(selectedDataSource?.id)
  
  // Catalog and Discovery
  const { data: tags, isLoading: tagsLoading } = useTagsQuery()
  const { data: catalog, isLoading: catalogLoading } = useCatalogQuery()
  const { data: lineage, isLoading: lineageLoading } = useLineageQuery(selectedDataSource?.id)
  const { data: discovery, isLoading: discoveryLoading } = useDiscoveryHistoryQuery(selectedDataSource?.id)
  const { data: scans, isLoading: scansLoading } = useScanResultsQuery(selectedDataSource?.id)
  
  // Consolidated backend data state
  const backendData: BackendDataState = useMemo(() => ({
    dataSources: dataSources || [],
    metrics,
    performance,
    security,
    compliance,
    backups,
    permissions,
    auditLogs,
    notifications,
    workspace,
    tasks,
    integrations,
    reports,
    versions,
    tags,
    catalog,
    lineage,
    quality,
    growth,
    discovery,
    scans,
    loading: {
      dataSources: dataSourcesLoading,
      metrics: metricsLoading,
      performance: performanceLoading,
      security: securityLoading,
      compliance: complianceLoading,
      backups: backupsLoading,
      permissions: permissionsLoading,
      auditLogs: auditLoading,
      notifications: notificationsLoading,
      workspace: workspaceLoading,
      tasks: tasksLoading,
      integrations: integrationsLoading,
      reports: reportsLoading,
      versions: versionsLoading,
      tags: tagsLoading,
      catalog: catalogLoading,
      lineage: lineageLoading,
      quality: qualityLoading,
      growth: growthLoading,
      discovery: discoveryLoading,
      scans: scansLoading
    },
    errors: {
      dataSources: dataSourcesError
    }
  }), [
    dataSources, metrics, performance, security, compliance, backups, permissions, 
    auditLogs, notifications, workspace, tasks, integrations, reports, versions,
    tags, catalog, lineage, quality, growth, discovery, scans,
    dataSourcesLoading, metricsLoading, performanceLoading, securityLoading,
    complianceLoading, backupsLoading, permissionsLoading, auditLoading,
    notificationsLoading, workspaceLoading, tasksLoading, integrationsLoading,
    reportsLoading, versionsLoading, tagsLoading, catalogLoading, lineageLoading,
    qualityLoading, growthLoading, discoveryLoading, scansLoading, dataSourcesError
  ])
  
  // ========================================================================
  // INITIALIZATION LOGIC
  // ========================================================================
  
  useEffect(() => {
    async function initializeEnterpriseSystems() {
      if (initialized) return
      
      try {
        console.log('🚀 Initializing Enterprise Integration Systems...')
        
        // Initialize Core Infrastructure
        coreRef.current = CoreInfrastructure.getInstance(config)
        await coreRef.current.initialize()
        
        // Initialize Analytics Engine
        analyticsRef.current = new AnalyticsEngine({
          enableRealTime: config.analytics.enableRealTimeAnalytics,
          enablePredictive: config.analytics.enablePredictiveAnalytics,
          enableAnomalyDetection: config.analytics.enableAnomalyDetection,
          correlationThreshold: config.analytics.correlationThreshold
        })
        await analyticsRef.current.initialize()
        
        // Initialize Collaboration Engine
        collaborationRef.current = new CollaborationEngine({
          enableRealTime: config.collaboration.enableRealTimeCollaboration,
          maxConcurrentUsers: config.collaboration.maxConcurrentUsers,
          autoSaveInterval: config.collaboration.autoSaveInterval
        })
        await collaborationRef.current.initialize()
        
        // Initialize Workflow Engine
        workflowsRef.current = new WorkflowEngine({
          enableAutomation: config.workflows.enableWorkflowAutomation,
          enableApprovals: config.workflows.enableApprovalWorkflows,
          maxConcurrent: config.workflows.maxConcurrentWorkflows,
          defaultTimeout: config.workflows.defaultTimeout
        })
        await workflowsRef.current.initialize()
        
        // Initialize Bulk Operations Engine
        bulkOpsRef.current = new BulkOperationsEngine({
          enableBulkOps: config.workflows.enableBulkOperations,
          maxConcurrent: config.workflows.maxConcurrentWorkflows
        })
        await bulkOpsRef.current.initialize()
        
        // Setup cross-system integration
        await setupCrossSystemIntegration()
        
        // Start health monitoring
        startHealthMonitoring()
        
        setInitialized(true)
        console.log('✅ Enterprise Integration Systems initialized successfully')
        
      } catch (error) {
        console.error('❌ Failed to initialize enterprise systems:', error)
        setSystemHealth(prev => ({
          ...prev,
          overall: 'critical',
          lastCheck: new Date()
        }))
      }
    }
    
    initializeEnterpriseSystems()
  }, [config, initialized])
  
  // ========================================================================
  // CROSS-SYSTEM INTEGRATION
  // ========================================================================
  
  const setupCrossSystemIntegration = async () => {
    if (!coreRef.current?.eventBus) return
    
    const eventBus = coreRef.current.eventBus
    
    // Analytics → Collaboration Integration
    eventBus.subscribe('analytics:insight:generated', async (event) => {
      if (collaborationRef.current && config.collaboration.enableNotifications) {
        await collaborationRef.current.notifyParticipants({
          type: 'insight',
          content: event.payload,
          priority: event.priority === 'critical' ? 'high' : 'medium'
        })
      }
    })
    
    // Collaboration → Workflows Integration
    eventBus.subscribe('collaboration:approval:requested', async (event) => {
      if (workflowsRef.current && config.workflows.enableApprovalWorkflows) {
        await workflowsRef.current.createApprovalWorkflow(event.payload)
      }
    })
    
    // Workflows → Analytics Integration
    eventBus.subscribe('workflow:completed', async (event) => {
      if (analyticsRef.current && config.analytics.enableRealTimeAnalytics) {
        await analyticsRef.current.trackWorkflowCompletion(event.payload)
      }
    })
    
    // Backend Data → All Systems Integration
    eventBus.subscribe('backend:data:updated', async (event) => {
      // Update analytics with new data
      if (analyticsRef.current) {
        await analyticsRef.current.processNewData(event.payload)
      }
      
      // Notify collaboration sessions
      if (collaborationRef.current) {
        await collaborationRef.current.syncDataUpdates(event.payload)
      }
      
      // Trigger workflows if needed
      if (workflowsRef.current && autoWorkflowsEnabled) {
        await workflowsRef.current.evaluateAutoTriggers(event.payload)
      }
    })
  }
  
  // ========================================================================
  // HEALTH MONITORING
  // ========================================================================
  
  const startHealthMonitoring = () => {
    const checkHealth = async () => {
      try {
        const health: SystemHealth = {
          overall: 'healthy',
          core: await checkCoreHealth(),
          analytics: await checkAnalyticsHealth(),
          collaboration: await checkCollaborationHealth(),
          workflows: await checkWorkflowsHealth(),
          backend: await checkBackendHealth(),
          lastCheck: new Date()
        }
        
        // Determine overall health
        const statuses = [health.core.status, health.analytics.status, health.collaboration.status, health.workflows.status, health.backend.status]
        if (statuses.some(s => s === 'critical')) health.overall = 'critical'
        else if (statuses.some(s => s === 'warning')) health.overall = 'warning'
        
        setSystemHealth(health)
        
      } catch (error) {
        console.error('Health check failed:', error)
        setSystemHealth(prev => ({
          ...prev,
          overall: 'critical',
          lastCheck: new Date()
        }))
      }
    }
    
    // Initial health check
    checkHealth()
    
    // Schedule periodic health checks
    const interval = setInterval(checkHealth, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }
  
  const checkCoreHealth = async (): Promise<HealthStatus> => {
    if (!coreRef.current) return { status: 'offline', latency: 0, errorRate: 100, uptime: 0, details: ['Core not initialized'] }
    
    const start = Date.now()
    try {
      const status = await coreRef.current.getHealthStatus()
      const latency = Date.now() - start
      return {
        status: status.healthy ? 'healthy' : 'warning',
        latency,
        errorRate: status.errorRate || 0,
        uptime: status.uptime || 0,
        details: status.details || []
      }
    } catch (error) {
      return {
        status: 'critical',
        latency: Date.now() - start,
        errorRate: 100,
        uptime: 0,
        details: [`Error: ${error}`]
      }
    }
  }
  
  const checkAnalyticsHealth = async (): Promise<HealthStatus> => {
    if (!analyticsRef.current) return { status: 'offline', latency: 0, errorRate: 100, uptime: 0, details: ['Analytics not initialized'] }
    
    const start = Date.now()
    try {
      const status = await analyticsRef.current.getHealthStatus()
      const latency = Date.now() - start
      return {
        status: status.healthy ? 'healthy' : 'warning',
        latency,
        errorRate: status.errorRate || 0,
        uptime: status.uptime || 0,
        details: status.details || []
      }
    } catch (error) {
      return {
        status: 'critical',
        latency: Date.now() - start,
        errorRate: 100,
        uptime: 0,
        details: [`Error: ${error}`]
      }
    }
  }
  
  const checkCollaborationHealth = async (): Promise<HealthStatus> => {
    if (!collaborationRef.current) return { status: 'offline', latency: 0, errorRate: 100, uptime: 0, details: ['Collaboration not initialized'] }
    
    const start = Date.now()
    try {
      const status = await collaborationRef.current.getHealthStatus()
      const latency = Date.now() - start
      return {
        status: status.healthy ? 'healthy' : 'warning',
        latency,
        errorRate: status.errorRate || 0,
        uptime: status.uptime || 0,
        details: status.details || []
      }
    } catch (error) {
      return {
        status: 'critical',
        latency: Date.now() - start,
        errorRate: 100,
        uptime: 0,
        details: [`Error: ${error}`]
      }
    }
  }
  
  const checkWorkflowsHealth = async (): Promise<HealthStatus> => {
    if (!workflowsRef.current) return { status: 'offline', latency: 0, errorRate: 100, uptime: 0, details: ['Workflows not initialized'] }
    
    const start = Date.now()
    try {
      const status = await workflowsRef.current.getHealthStatus()
      const latency = Date.now() - start
      return {
        status: status.healthy ? 'healthy' : 'warning',
        latency,
        errorRate: status.errorRate || 0,
        uptime: status.uptime || 0,
        details: status.details || []
      }
    } catch (error) {
      return {
        status: 'critical',
        latency: Date.now() - start,
        errorRate: 100,
        uptime: 0,
        details: [`Error: ${error}`]
      }
    }
  }
  
  const checkBackendHealth = async (): Promise<HealthStatus> => {
    const start = Date.now()
    try {
      // Check if we have recent successful data fetches
      const hasErrors = Object.values(backendData.errors).some(error => error !== null && error !== undefined)
      const hasData = backendData.dataSources.length > 0
      const isLoading = Object.values(backendData.loading).some(loading => loading)
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      const details: string[] = []
      
      if (hasErrors) {
        status = 'critical'
        details.push('Backend API errors detected')
      } else if (!hasData && !isLoading) {
        status = 'warning'
        details.push('No data available from backend')
      } else if (isLoading) {
        details.push('Loading data from backend')
      }
      
      return {
        status,
        latency: Date.now() - start,
        errorRate: hasErrors ? 100 : 0,
        uptime: hasErrors ? 0 : 100,
        details
      }
    } catch (error) {
      return {
        status: 'critical',
        latency: Date.now() - start,
        errorRate: 100,
        uptime: 0,
        details: [`Error: ${error}`]
      }
    }
  }
  
  // ========================================================================
  // EVENT HANDLING
  // ========================================================================
  
  const handleEvent = useCallback((event: EnterpriseEvent) => {
    // Emit to core event bus
    if (coreRef.current?.eventBus) {
      coreRef.current.eventBus.publish({
        type: event.type,
        source: event.source,
        payload: event.payload,
        priority: event.priority === 'critical' ? 1 : event.priority === 'high' ? 2 : event.priority === 'medium' ? 3 : 4,
        metadata: {
          ...event.metadata,
          id: event.id,
          timestamp: event.timestamp
        }
      })
    }
  }, [])
  
  const emitEvent = useCallback((event: EnterpriseEvent) => {
    handleEvent(event)
  }, [handleEvent])
  
  // ========================================================================
  // CONFIGURATION UPDATES
  // ========================================================================
  
  const updateConfig = useCallback((updates: Partial<EnterpriseConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
      analytics: { ...prev.analytics, ...updates.analytics },
      collaboration: { ...prev.collaboration, ...updates.collaboration },
      workflows: { ...prev.workflows, ...updates.workflows },
      security: { ...prev.security, ...updates.security },
      performance: { ...prev.performance, ...updates.performance }
    }))
  }, [])
  
  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================
  
  const contextValue: EnterpriseContext = useMemo(() => ({
    // Core Infrastructure
    core: coreRef.current!,
    analytics: analyticsRef.current!,
    collaboration: collaborationRef.current!,
    workflows: workflowsRef.current!,
    bulkOps: bulkOpsRef.current!,
    
    // State Management
    selectedDataSource,
    setSelectedDataSource,
    activeWorkspace,
    setActiveWorkspace,
    
    // Real-time Features
    realTimeUpdates,
    setRealTimeUpdates,
    collaborativeMode,
    setCollaborativeMode,
    
    // Advanced Features
    aiInsightsEnabled,
    setAiInsightsEnabled,
    autoWorkflowsEnabled,
    setAutoWorkflowsEnabled,
    
    // Enterprise Configuration
    config,
    updateConfig,
    
    // System Status
    systemHealth,
    connectionStatus,
    
    // Event Handlers
    handleEvent,
    emitEvent,
    
    // Backend Data
    backendData
  }), [
    selectedDataSource, setSelectedDataSource, activeWorkspace, setActiveWorkspace,
    realTimeUpdates, setRealTimeUpdates, collaborativeMode, setCollaborativeMode,
    aiInsightsEnabled, setAiInsightsEnabled, autoWorkflowsEnabled, setAutoWorkflowsEnabled,
    config, updateConfig, systemHealth, connectionStatus, handleEvent, emitEvent, backendData
  ])
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Initializing Enterprise Systems</h2>
          <p className="text-gray-600">Setting up core infrastructure, analytics, collaboration, and workflows...</p>
        </div>
      </div>
    )
  }
  
  return (
    <EnterpriseContextState.Provider value={contextValue}>
      {children}
    </EnterpriseContextState.Provider>
  )
}

// ============================================================================
// CONTEXT HOOK
// ============================================================================

export function useEnterpriseContext(): EnterpriseContext {
  const context = useContext(EnterpriseContextState)
  if (!context) {
    throw new Error('useEnterpriseContext must be used within EnterpriseIntegrationProvider')
  }
  return context
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createEnterpriseEvent(
  type: string,
  source: string,
  payload: any,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  metadata: Record<string, any> = {}
): EnterpriseEvent {
  return {
    id: uuidv4(),
    type,
    source,
    payload,
    timestamp: new Date(),
    priority,
    metadata: {
      ...metadata,
      version: '1.0'
    }
  }
}

export function isEnterpriseFeatureEnabled(
  config: EnterpriseConfig,
  feature: string
): boolean {
  const [section, key] = feature.split('.')
  return config[section as keyof EnterpriseConfig]?.[key as any] === true
}

export function getSystemHealthScore(health: SystemHealth): number {
  const weights = {
    core: 0.3,
    analytics: 0.2,
    collaboration: 0.15,
    workflows: 0.15,
    backend: 0.2
  }
  
  const getStatusScore = (status: string): number => {
    switch (status) {
      case 'healthy': return 100
      case 'warning': return 60
      case 'critical': return 20
      case 'offline': return 0
      default: return 0
    }
  }
  
  const score = 
    weights.core * getStatusScore(health.core.status) +
    weights.analytics * getStatusScore(health.analytics.status) +
    weights.collaboration * getStatusScore(health.collaboration.status) +
    weights.workflows * getStatusScore(health.workflows.status) +
    weights.backend * getStatusScore(health.backend.status)
  
  return Math.round(score)
}