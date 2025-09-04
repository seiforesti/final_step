/**
 * Secure Racine Main Manager SPA
 * ===============================
 * 
 * Enhanced version of RacineMainManagerSPA with comprehensive loop prevention:
 * - Circuit breaker protection for all API calls
 * - Intelligent request management and deduplication
 * - Health-aware component rendering
 * - Graceful degradation under system stress
 * - Emergency mode support
 * 
 * This component replaces the problematic original that was causing infinite loops.
 */

"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense, useRef } from "react"
import { useReducedMotion, motion, AnimatePresence } from "framer-motion"
import { EnterpriseErrorBoundary } from "./components/error-boundaries/EnterpriseErrorBoundary"
import { EnterpriseLoadingState } from "./components/loading/EnterpriseLoadingStates"

// Import secure providers and hooks
import { useSecureRBACContext } from "../providers/SecureRBACProvider"
import { globalRequestManager } from "../lib/api-request-manager"
import { globalCircuitBreaker } from "../lib/api-circuit-breaker"

// Import types
import {
  ViewMode,
  LayoutMode,
  type QuickActionContext,
  type UUID,
  type SystemHealth,
} from "./types/racine-core.types"

import {
  type DataGovernanceNode,
  type SystemOverview,
} from "./types/advanced-analytics.types"

// Import icons
import {
  Database,
  Shield,
  Target,
  CheckCircle,
  Building2,
  Radar,
  Bot,
  Network,
  Maximize2,
  Sidebar,
  Monitor,
  X,
  Sparkles,
  Zap,
  Brain,
  Activity,
  AlertTriangle,
  RefreshCw,
  Settings,
} from 'lucide-react'

// Lazy load components to improve performance
const RacineMainLayout = React.lazy(() => 
  import("./components/layout/RacineMainLayout")
    .then(module => ({ default: module.RacineMainLayout }))
    .catch(() => ({ default: () => <div>Layout unavailable</div> }))
)

const DataGovernanceSchema = React.lazy(() => 
  import("./components/visualizations/DataGovernanceSchema")
    .then(module => ({ default: module.DataGovernanceSchema }))
    .catch(() => ({ default: () => <div>Schema unavailable</div> }))
)

// System health thresholds
const HEALTH_THRESHOLDS = {
  CRITICAL_ERROR_RATE: 0.8,
  DEGRADED_ERROR_RATE: 0.5,
  MAX_PENDING_REQUESTS: 20,
  MAX_OPEN_CIRCUITS: 5
}

interface SecureSystemState {
  systemHealth: 'healthy' | 'degraded' | 'critical';
  errorRate: number;
  pendingRequests: number;
  openCircuits: number;
  lastHealthCheck: Date;
  emergencyMode: boolean;
  performanceScore: number;
}

export const RacineMainManagerSPA: React.FC = () => {
  const reducedMotion = useReducedMotion()
  
  // Secure RBAC context
  const rbac = useSecureRBACContext()
  
  // System state monitoring
  const [systemState, setSystemState] = useState<SecureSystemState>({
    systemHealth: 'healthy',
    errorRate: 0,
    pendingRequests: 0,
    openCircuits: 0,
    lastHealthCheck: new Date(),
    emergencyMode: false,
    performanceScore: 100
  })

  // Component state
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quickActionsSidebarOpen, setQuickActionsSidebarOpen] = useState(false)
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false)
  const [showSystemMonitor, setShowSystemMonitor] = useState(false)
  
  // Performance monitoring
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef(Date.now())
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Increment render count for performance monitoring
  useEffect(() => {
    renderCountRef.current++
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTimeRef.current
    lastRenderTimeRef.current = now
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎭 RacineMainManagerSPA render #${renderCountRef.current} (${timeSinceLastRender}ms since last)`)
    }
  })

  // System health monitoring
  useEffect(() => {
    const checkSystemHealth = () => {
      try {
        const requestMetrics = globalRequestManager.getMetrics()
        const circuitStatus = globalCircuitBreaker.getStatus()
        
        // Calculate system metrics
        const errorRate = requestMetrics.totalRequests > 0 
          ? requestMetrics.failedRequests / requestMetrics.totalRequests 
          : 0
        
        const openCircuits = Object.values(circuitStatus.endpoints).filter(
          (endpoint: any) => endpoint.state === 'OPEN'
        ).length

        // Determine system health
        let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy'
        let performanceScore = 100

        if (errorRate > HEALTH_THRESHOLDS.CRITICAL_ERROR_RATE || 
            openCircuits > HEALTH_THRESHOLDS.MAX_OPEN_CIRCUITS ||
            requestMetrics.averageResponseTime > 10000) {
          systemHealth = 'critical'
          performanceScore = 25
        } else if (errorRate > HEALTH_THRESHOLDS.DEGRADED_ERROR_RATE || 
                   openCircuits > 2 ||
                   requestMetrics.averageResponseTime > 5000) {
          systemHealth = 'degraded'
          performanceScore = 60
        } else {
          performanceScore = Math.max(25, 100 - (errorRate * 100) - (openCircuits * 10))
        }

        setSystemState(prev => ({
          ...prev,
          systemHealth,
          errorRate,
          pendingRequests: circuitStatus.activeRequests,
          openCircuits,
          lastHealthCheck: new Date(),
          emergencyMode: rbac.emergencyMode,
          performanceScore
        }))

        // Log health status changes
        if (systemHealth !== prev.systemHealth) {
          console.log(`🏥 System health changed: ${prev.systemHealth} → ${systemHealth}`)
        }

      } catch (error) {
        console.error('❌ Health check failed:', error)
        setSystemState(prev => ({
          ...prev,
          systemHealth: 'critical',
          lastHealthCheck: new Date()
        }))
      }
    }

    // Initial health check
    checkSystemHealth()
    
    // Set up periodic health monitoring
    healthCheckIntervalRef.current = setInterval(checkSystemHealth, 15000) // Every 15 seconds
    
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current)
      }
    }
  }, [rbac.emergencyMode])

  // Safe data fetching with circuit breaker protection
  const fetchDataSources = useCallback(async () => {
    if (systemState.emergencyMode || systemState.systemHealth === 'critical') {
      console.warn('🚨 Skipping data sources fetch - system in emergency mode')
      return []
    }

    try {
      return await globalRequestManager.getDataSources()
    } catch (error) {
      console.warn('📊 Data sources fetch failed:', error)
      return []
    }
  }, [systemState.emergencyMode, systemState.systemHealth])

  const fetchOrchestrationData = useCallback(async () => {
    if (systemState.emergencyMode || systemState.systemHealth === 'critical') {
      console.warn('🚨 Skipping orchestration fetch - system in emergency mode')
      return []
    }

    try {
      return await globalRequestManager.getOrchestrationMasters()
    } catch (error) {
      console.warn('🎭 Orchestration fetch failed:', error)
      return []
    }
  }, [systemState.emergencyMode, systemState.systemHealth])

  // Emergency mode handlers
  const handleEmergencyMode = useCallback(() => {
    console.warn('🚨 Emergency mode activated by user')
    rbac.enableEmergencyMode()
    setCurrentView(ViewMode.DASHBOARD) // Switch to safe view
  }, [rbac])

  const handleRecoveryMode = useCallback(() => {
    console.log('🟢 Recovery mode activated by user')
    rbac.disableEmergencyMode()
    // Reset circuit breakers
    const circuitStatus = globalCircuitBreaker.getStatus()
    Object.keys(circuitStatus.endpoints).forEach(endpoint => {
      if (circuitStatus.endpoints[endpoint].state === 'OPEN') {
        globalCircuitBreaker.resetCircuit(endpoint)
      }
    })
  }, [rbac])

  // Performance-optimized data governance nodes
  const dataGovernanceNodes = useMemo<DataGovernanceNode[]>(() => {
    if (systemState.emergencyMode) {
      // Return minimal nodes in emergency mode
      return [
        {
          id: 'emergency-mode',
          name: 'Emergency Mode',
          type: 'system',
          status: 'critical',
          description: 'System running in emergency mode',
          metrics: { health: 0, performance: 0 }
        }
      ]
    }

    return [
      {
        id: 'data-sources',
        name: 'Data Sources',
        type: 'data_source',
        status: systemState.systemHealth === 'healthy' ? 'active' : 'degraded',
        description: 'Data source connections and management',
        icon: Database,
        metrics: { 
          health: systemState.performanceScore,
          performance: Math.max(0, 100 - (systemState.errorRate * 100))
        }
      },
      {
        id: 'security',
        name: 'Security & RBAC',
        type: 'security',
        status: rbac.isAuthenticated ? 'active' : 'warning',
        description: 'Role-based access control and security',
        icon: Shield,
        metrics: { 
          health: rbac.isAuthenticated ? 90 : 50,
          performance: rbac.authenticationAttempts > 3 ? 30 : 90
        }
      },
      {
        id: 'compliance',
        name: 'Compliance',
        type: 'compliance',
        status: systemState.openCircuits > 2 ? 'warning' : 'active',
        description: 'Compliance rules and validation',
        icon: CheckCircle,
        metrics: { 
          health: systemState.openCircuits > 2 ? 60 : 85,
          performance: systemState.performanceScore
        }
      },
      {
        id: 'catalog',
        name: 'Advanced Catalog',
        type: 'catalog',
        status: systemState.pendingRequests > 10 ? 'degraded' : 'active',
        description: 'Data catalog and metadata management',
        icon: Building2,
        metrics: { 
          health: systemState.pendingRequests > 10 ? 40 : 80,
          performance: systemState.performanceScore
        }
      }
    ]
  }, [
    systemState.emergencyMode,
    systemState.systemHealth,
    systemState.performanceScore,
    systemState.errorRate,
    systemState.openCircuits,
    systemState.pendingRequests,
    rbac.isAuthenticated,
    rbac.authenticationAttempts
  ])

  // System overview with health metrics
  const systemOverview = useMemo<SystemOverview>(() => ({
    totalNodes: dataGovernanceNodes.length,
    activeNodes: dataGovernanceNodes.filter(node => node.status === 'active').length,
    warningNodes: dataGovernanceNodes.filter(node => node.status === 'warning').length,
    criticalNodes: dataGovernanceNodes.filter(node => node.status === 'critical').length,
    overallHealth: systemState.performanceScore,
    lastUpdate: systemState.lastHealthCheck.toISOString(),
    systemMetrics: {
      errorRate: systemState.errorRate,
      pendingRequests: systemState.pendingRequests,
      openCircuits: systemState.openCircuits,
      authenticationStatus: rbac.isAuthenticated ? 'authenticated' : 'unauthenticated',
      emergencyMode: systemState.emergencyMode
    }
  }), [dataGovernanceNodes, systemState, rbac.isAuthenticated])

  // Render loading state during initial authentication
  if (rbac.isLoading && !rbac.user) {
    return (
      <EnterpriseLoadingState 
        message="Initializing secure authentication..."
        subMessage="Setting up circuit breakers and health monitoring"
      />
    )
  }

  // Emergency mode UI
  if (systemState.emergencyMode) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Emergency Mode Active
          </h1>
          <p className="text-gray-600 mb-6">
            System performance is severely degraded. Most features are temporarily disabled 
            to prevent database exhaustion and ensure system stability.
          </p>
          <div className="space-y-4">
            <div className="bg-red-100 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">System Status</h3>
              <div className="text-sm text-red-700 space-y-1">
                <div>Health: {systemState.systemHealth}</div>
                <div>Error Rate: {(systemState.errorRate * 100).toFixed(1)}%</div>
                <div>Open Circuits: {systemState.openCircuits}</div>
                <div>Pending Requests: {systemState.pendingRequests}</div>
              </div>
            </div>
            <button
              onClick={handleRecoveryMode}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Attempt Recovery
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <EnterpriseErrorBoundary>
      <div className="racine-main-manager-spa min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* System Health Indicator */}
        <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium ${
          systemState.systemHealth === 'healthy' ? 'bg-green-100 text-green-800' :
          systemState.systemHealth === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemState.systemHealth === 'healthy' ? 'bg-green-500' :
              systemState.systemHealth === 'degraded' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            System {systemState.systemHealth} ({systemState.performanceScore}%)
          </div>
        </div>

        {/* System Monitor Toggle */}
        <button
          onClick={() => setShowSystemMonitor(!showSystemMonitor)}
          className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors"
          title="System Monitor"
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* System Monitor Panel */}
        {showSystemMonitor && (
          <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">System Monitor</h3>
              <button 
                onClick={() => setShowSystemMonitor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Health Status:</span>
                <span className={`font-medium ${
                  systemState.systemHealth === 'healthy' ? 'text-green-600' :
                  systemState.systemHealth === 'degraded' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {systemState.systemHealth}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span>{(systemState.errorRate * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span>Open Circuits:</span>
                <span>{systemState.openCircuits}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Pending Requests:</span>
                <span>{systemState.pendingRequests}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Auth Status:</span>
                <span className={rbac.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {rbac.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              
              <div className="pt-2 border-t">
                <button
                  onClick={rbac.refreshAuth}
                  className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  disabled={rbac.isLoading}
                >
                  {rbac.isLoading ? 'Refreshing...' : 'Refresh Auth'}
                </button>
              </div>
              
              {systemState.systemHealth === 'critical' && (
                <div className="pt-2">
                  <button
                    onClick={handleEmergencyMode}
                    className="w-full bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Activate Emergency Mode
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <Suspense fallback={
          <EnterpriseLoadingState 
            message="Loading secure interface..."
            subMessage={`System health: ${systemState.systemHealth}`}
          />
        }>
          <RacineMainLayout
            currentView={currentView}
            onViewChange={setCurrentView}
            sidebarCollapsed={sidebarCollapsed}
            onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            systemOverview={systemOverview}
            dataGovernanceNodes={dataGovernanceNodes}
            healthStatus={systemState.systemHealth}
            emergencyMode={systemState.emergencyMode}
          />
        </Suspense>

        {/* Data Governance Visualization */}
        {currentView === ViewMode.SCHEMA && (
          <Suspense fallback={
            <EnterpriseLoadingState message="Loading data governance schema..." />
          }>
            <DataGovernanceSchema
              nodes={dataGovernanceNodes}
              systemOverview={systemOverview}
              healthStatus={systemState.systemHealth}
            />
          </Suspense>
        )}
      </div>
    </EnterpriseErrorBoundary>
  )
}

export default RacineMainManagerSPA