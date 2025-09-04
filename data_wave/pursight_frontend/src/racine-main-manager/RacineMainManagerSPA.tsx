"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import { useReducedMotion, motion, AnimatePresence } from "framer-motion"
import { EnterpriseErrorBoundary } from "./components/error-boundaries/EnterpriseErrorBoundary"
import { EnterpriseLoadingState } from "./components/loading/EnterpriseLoadingStates"

// Import types
import {
  ViewMode,
  LayoutMode,
  type QuickActionContext,
  type UUID,
  type SystemHealth,
} from "./types/racine-core.types"

// Import advanced analytics types
import {
  type DataGovernanceNode,
  type SystemOverview,
} from "./types/advanced-analytics.types"

// Import hooks
import {
  useOptimizedRacineOrchestration,
  useOptimizedWorkspaceManagement,
  useOptimizedUserManagement,
} from "./hooks/useOptimizedHooks"

// Import global API control
import { useGlobalAPIInterceptor } from "./hooks/useGlobalAPIInterceptor"
import { GlobalRequestMonitor } from "./components/GlobalRequestMonitor"
import { useBackendHealthSync } from "./hooks/useBackendHealthSync"
import { setupAxiosInterception } from "./hooks/setupAxiosInterception"

// Import icons for data governance nodes and AI interface
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
} from 'lucide-react'

// Import lazy components
const RacineMainLayout = React.lazy(() => import("./components/layout/RacineMainLayout").then(module => ({ default: module.RacineMainLayout })))

// Import enhanced DataGovernanceSchema
const DataGovernanceSchema = React.lazy(() => import("./components/visualizations/DataGovernanceSchema").then(module => ({ default: module.DataGovernanceSchema })))

// Global error tracking
let errorCount = 0
const MAX_ERRORS = 3

// Global window type extensions
declare global {
  interface Window {
    __RACINE_ERROR_COUNT__?: number
  }
}

export const RacineMainManagerSPA: React.FC = () => {
  const reducedMotion = useReducedMotion()
  
  // Global API control - INTERCEPTS ALL API REQUESTS ACROSS THE ENTIRE APPLICATION
  const globalAPIInterceptor = useGlobalAPIInterceptor()
  const [showRequestMonitor, setShowRequestMonitor] = useState(false)
  
  // Bridge axios -> orchestrator to throttle and queue axios-based clients
  useEffect(() => {
    try {
      setupAxiosInterception(globalAPIInterceptor)
      console.log('[Racine] Axios interception setup complete')
    } catch (e) {
      console.warn('[Racine] Axios interception setup skipped:', e)
    }
  }, [globalAPIInterceptor])
  
  // Backend health synchronization - AUTOMATICALLY SYNC WITH BACKEND DATABASE HEALTH
  const backendHealthSync = useBackendHealthSync()
  
  // Basic state management
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quickActionsSidebarOpen, setQuickActionsSidebarOpen] = useState(false)
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false)
  const [aiAssistantMode, setAIAssistantMode] = useState<"floating" | "docked" | "fullscreen">("floating")
  const [aiAssistantPosition, setAIAssistantPosition] = useState({ x: 100, y: 100 })
  const [aiContextualData, setAIContextualData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Critical hooks with error boundaries
  const [orchestrationError, setOrchestrationError] = useState<Error | null>(null)
  const [workspaceError, setWorkspaceError] = useState<Error | null>(null)
  const [userError, setUserError] = useState<Error | null>(null)

  let orchestration
  try {
    orchestration = useOptimizedRacineOrchestration()
  } catch (error) {
    console.error('[Racine] Orchestration hook error:', error)
    setOrchestrationError(error as Error)
    orchestration = {
      orchestrationState: {},
      systemHealth: { overall: "degraded" },
      performanceMetrics: {},
      isLoading: false,
      error: error as Error,
      executeWorkflow: () => {},
      optimizeSystem: () => {},
      refreshSystemHealth: () => {},
    }
  }

  let workspace
  try {
    workspace = useOptimizedWorkspaceManagement()
  } catch (error) {
    console.error('[Racine] Workspace hook error:', error)
    setWorkspaceError(error as Error)
    workspace = {
      workspaces: [],
      activeWorkspace: null,
      switchWorkspace: () => {},
      createWorkspace: () => {},
      isLoading: false,
    }
  }

  let user
  try {
    user = useOptimizedUserManagement()
  } catch (error) {
    console.error('[Racine] User hook error:', error)
    setUserError(error as Error)
    user = {
      currentUser: null,
      userPermissions: [],
      isLoading: false,
    }
  }

  // Safe destructuring with defaults
  const {
    orchestrationState = {},
    systemHealth = { overall: "degraded" },
    performanceMetrics = {},
    isLoading: orchestrationLoading = false,
    error: orchestrationHookError = null,
    executeWorkflow = () => {},
    optimizeSystem = () => {},
    refreshSystemHealth = () => {},
  } = orchestration

  const {
    workspaces = [],
    activeWorkspace = null,
    switchWorkspace = () => {},
    createWorkspace = () => {},
    isLoading: workspaceLoading = false,
  } = workspace

  const { currentUser = null, userPermissions = [], isLoading: userLoading = false } = user

  // Initialize system - set to true immediately since we're already mounted
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Listen for custom navigation events from the sidebar and handle URL parameters
  useEffect(() => {
    console.log('[Racine] Setting up navigation event listeners...')
    
    const handleViewChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ view: string }>
      const { view } = customEvent.detail
      console.log('[Racine] Received view change event:', view)
      
      // Map the view parameter to ViewMode enum values
      const viewModeMap: Record<string, ViewMode> = {
        'data_sources': ViewMode.DATA_SOURCES,
        'scan_rule_sets': ViewMode.SCAN_RULE_SETS,
        'classifications': ViewMode.CLASSIFICATIONS,
        'compliance_rules': ViewMode.COMPLIANCE_RULES,
        'advanced_catalog': ViewMode.ADVANCED_CATALOG,
        'scan_logic': ViewMode.SCAN_LOGIC,
        'rbac_system': ViewMode.RBAC_SYSTEM,
        'dashboard': ViewMode.DASHBOARD,
        'workspace': ViewMode.WORKSPACE,
        'workflows': ViewMode.WORKFLOWS,
        'pipelines': ViewMode.PIPELINES,
        'ai_assistant': ViewMode.AI_ASSISTANT,
        'activity': ViewMode.ACTIVITY,
        'collaboration': ViewMode.COLLABORATION,
        'settings': ViewMode.SETTINGS,
        'analytics': ViewMode.ANALYTICS,
        'monitoring': ViewMode.MONITORING,
        'streaming': ViewMode.STREAMING,
        'cost_optimization': ViewMode.COST_OPTIMIZATION,
        'reports': ViewMode.REPORTS,
        'search': ViewMode.SEARCH,
        'notifications': ViewMode.NOTIFICATIONS,
      }
      
      const newViewMode = viewModeMap[view]
      if (newViewMode) {
        console.log('[Racine] Changing view to:', newViewMode, 'from current view:', currentView)
        setCurrentView(newViewMode)
        
        // Force a re-render to ensure the view change is processed
        console.log('[Racine] View change processed, new view:', newViewMode)
        
        // Also update the URL to ensure consistency
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('view', view)
        window.history.pushState({}, '', newUrl.toString())
        console.log('[Racine] URL updated to:', newUrl.toString())
      } else {
        console.warn('[Racine] Unknown view mode:', view)
      }
    }

    // Handle URL parameters for direct navigation
    const handleUrlParams = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const viewParam = urlParams.get('view')
        
        console.log('[Racine] handleUrlParams called, viewParam:', viewParam, 'currentView:', currentView)
        
        if (viewParam) {
          console.log('[Racine] URL view parameter detected:', viewParam)
          const viewModeMap: Record<string, ViewMode> = {
            'data_sources': ViewMode.DATA_SOURCES,
            'scan_rule_sets': ViewMode.SCAN_RULE_SETS,
            'classifications': ViewMode.CLASSIFICATIONS,
            'compliance_rules': ViewMode.COMPLIANCE_RULES,
            'advanced_catalog': ViewMode.ADVANCED_CATALOG,
            'scan_logic': ViewMode.SCAN_LOGIC,
            'rbac_system': ViewMode.RBAC_SYSTEM,
            'dashboard': ViewMode.DASHBOARD,
            'workspace': ViewMode.WORKSPACE,
            'workflows': ViewMode.WORKFLOWS,
            'pipelines': ViewMode.PIPELINES,
            'ai_assistant': ViewMode.AI_ASSISTANT,
            'activity': ViewMode.ACTIVITY,
            'collaboration': ViewMode.COLLABORATION,
            'settings': ViewMode.SETTINGS,
            'analytics': ViewMode.ANALYTICS,
            'monitoring': ViewMode.MONITORING,
            'streaming': ViewMode.STREAMING,
            'cost_optimization': ViewMode.COST_OPTIMIZATION,
            'reports': ViewMode.REPORTS,
            'search': ViewMode.SEARCH,
            'notifications': ViewMode.NOTIFICATIONS,
          }
          
          const newViewMode = viewModeMap[viewParam]
          console.log('[Racine] Mapped view mode:', viewParam, '->', newViewMode)
          
          if (newViewMode && newViewMode !== currentView) {
            console.log('[Racine] Setting view from URL parameter:', newViewMode, 'from current view:', currentView)
            setCurrentView(newViewMode)
          } else if (newViewMode === currentView) {
            console.log('[Racine] View already matches URL parameter:', newViewMode)
          } else {
            console.warn('[Racine] Invalid view parameter or mapping failed:', viewParam, '->', newViewMode)
          }
        } else {
          console.log('[Racine] No view parameter in URL')
        }
      }
    }

    // Add event listener for custom navigation events
    console.log('[Racine] Adding event listener for racine-view-change');
    window.addEventListener('racine-view-change', handleViewChange as EventListener)
    
    // Also listen for the event on document for better compatibility
    document.addEventListener('racine-view-change', handleViewChange as EventListener)
    
    // Handle initial URL parameters
    console.log('[Racine] Handling initial URL parameters');
    handleUrlParams()
    
    // Listen for popstate events (back/forward navigation)
    console.log('[Racine] Adding popstate event listener');
    window.addEventListener('popstate', handleUrlParams)
    
    console.log('[Racine] Navigation event listeners setup complete');
    
    return () => {
      console.log('[Racine] Cleaning up navigation event listeners');
      window.removeEventListener('racine-view-change', handleViewChange as EventListener)
      document.removeEventListener('racine-view-change', handleViewChange as EventListener)
      window.removeEventListener('popstate', handleUrlParams)
    }
  }, []) // Removed currentView dependency to prevent re-initialization

  // Monitor currentView changes for debugging
  useEffect(() => {
    console.log('[Racine] currentView changed to:', currentView)
    console.log('[Racine] Component should re-render with new view')
    console.log('[Racine] View change timestamp:', new Date().toISOString())
  }, [currentView])

  // Global error handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleError = (event: ErrorEvent) => {
        errorCount++
        window.__RACINE_ERROR_COUNT__ = errorCount
        
        if (errorCount > MAX_ERRORS) {
          console.error('[Racine] Too many errors, preventing further execution')
          return
        }
        
        console.error("[Racine] Global error:", event.error)
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        errorCount++
        window.__RACINE_ERROR_COUNT__ = errorCount
        
        if (errorCount > MAX_ERRORS) {
          console.error('[Racine] Too many promise rejections, preventing further execution')
          return
        }
        
        console.error("[Racine] Unhandled promise rejection:", event.reason)
      }

      window.addEventListener("error", handleError)
      window.addEventListener("unhandledrejection", handleUnhandledRejection)

      return () => {
        window.removeEventListener("error", handleError)
        window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      }
    }
  }, [])

  // Memoized values
  const performanceMode = useMemo(() => {
    try {
      return "standard"
    } catch (error) {
      console.error('[Racine] Error calculating performance mode:', error)
      return "standard"
    }
  }, [])

  const systemOverview = useMemo(() => {
    try {
      return {
        totalAssets: 1247,
        activeWorkflows: 23,
        activePipelines: 8,
        systemHealth: 92,
        complianceScore: 94,
        performanceScore: 89,
        collaborationActivity: 156,
        aiInsights: 47,
      }
    } catch (error) {
      console.error('[Racine] Error creating system overview:', error)
      return {
        totalAssets: 0,
        activeWorkflows: 0,
        activePipelines: 0,
        systemHealth: 0,
        complianceScore: 0,
        performanceScore: 0,
        collaborationActivity: 0,
        aiInsights: 0,
      }
    }
  }, [])

  const dataGovernanceNodes = useMemo((): DataGovernanceNode[] => {
    try {
      return [
        {
          id: "data-sources",
          name: "Data Sources",
          type: "core",
          position: { x: 150, y: 150 },
          connections: ["scan-rule-sets", "classifications"],
          status: "healthy",
          metrics: { health: 95, performance: 88, activity: 12 },
          icon: Database,
          color: "#3B82F6",
        },
        {
          id: "scan-rule-sets",
          name: "Scan Rules",
          type: "monitoring",
          position: { x: 350, y: 150 },
          connections: ["compliance", "catalog"],
          status: "healthy",
          metrics: { health: 92, performance: 85, activity: 8 },
          icon: Shield,
          color: "#10B981",
        },
        {
          id: "classifications",
          name: "Classifications",
          type: "ai",
          position: { x: 550, y: 150 },
          connections: ["ai-engine", "catalog"],
          status: "healthy",
          metrics: { health: 89, performance: 92, activity: 15 },
          icon: Target,
          color: "#8B5CF6",
        },
        {
          id: "compliance",
          name: "Compliance",
          type: "monitoring",
          position: { x: 150, y: 350 },
          connections: ["orchestration", "scan-logic"],
          status: "healthy",
          metrics: { health: 94, performance: 87, activity: 6 },
          icon: CheckCircle,
          color: "#F59E0B",
        },
        {
          id: "catalog",
          name: "Data Catalog",
          type: "integration",
          position: { x: 350, y: 350 },
          connections: ["orchestration", "ai-engine"],
          status: "healthy",
          metrics: { health: 91, performance: 90, activity: 18 },
          icon: Building2,
          color: "#EF4444",
        },
        {
          id: "scan-logic",
          name: "Scan Logic",
          type: "monitoring",
          position: { x: 550, y: 350 },
          connections: ["ai-engine", "orchestration"],
          status: "healthy",
          metrics: { health: 88, performance: 93, activity: 10 },
          icon: Radar,
          color: "#06B6D4",
        },
        {
          id: "ai-engine",
          name: "AI Engine",
          type: "ai",
          position: { x: 350, y: 250 },
          connections: ["orchestration"],
          status: "healthy",
          metrics: { health: 96, performance: 95, activity: 22 },
          icon: Bot,
          color: "#EC4899",
        },
        {
          id: "orchestration",
          name: "Orchestration",
          type: "core",
          position: { x: 350, y: 450 },
          connections: [],
          status: "healthy",
          metrics: { health: 93, performance: 89, activity: 14 },
          icon: Network,
          color: "#84CC16",
        },
      ]
    } catch (error) {
      console.error('[Racine] Error creating data governance nodes:', error)
      return []
    }
  }, [])

  const quickActionsContext = useMemo<QuickActionContext>(() => {
    try {
      return {
        userId: (currentUser as any)?.id || 'anonymous',
        userRole: (currentUser as any)?.roles?.[0]?.name || 'user',
        workspaceId: selectedWorkspace || undefined,
        currentPage: currentView,
        systemState: {
          systemHealth,
          userPermissions,
        }
      }
    } catch (error) {
      console.error('[Racine] Error creating quick actions context:', error)
      return {
        userId: 'anonymous',
        userRole: 'user',
        workspaceId: undefined,
        currentPage: ViewMode.DASHBOARD,
        systemState: {
          systemHealth: { overall: "degraded" },
          userPermissions: [],
        }
      }
    }
  }, [currentView, selectedWorkspace, userPermissions, systemHealth, currentUser])

  // Loading state calculation
  const showLoading = useMemo(() => {
    try {
      return orchestrationLoading || workspaceLoading || userLoading || !isInitialized
    } catch (error) {
      console.error('[Racine] Error calculating loading state:', error)
      return true
    }
  }, [orchestrationLoading, workspaceLoading, userLoading, isInitialized])

  // Error state check
  const hasCriticalErrors = orchestrationError || workspaceError || userError || orchestrationHookError

  // Loading state
  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EnterpriseLoadingState
          type="system"
          message="Initializing Racine System..."
          showProgress={false}
        />
      </div>
    )
  }

  // Error state
  if (hasCriticalErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EnterpriseErrorBoundary level="critical" context="System Initialization">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Critical System Error</h2>
            <p className="text-muted-foreground mb-4">
              The system encountered critical errors during initialization.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload System
            </button>
          </div>
        </EnterpriseErrorBoundary>
      </div>
    )
  }

  // Main render with error boundary
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <EnterpriseLoadingState
          type="system"
          message="Loading Racine Interface..."
          showProgress={false}
        />
      </div>
    }>
      <EnterpriseErrorBoundary level="critical" context="Main Layout">
        <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
          <RacineMainLayout
            currentView={currentView}
            onViewChange={(view) => {
              console.log('[SPA] onViewChange called with ViewMode:', view);
              console.log('[SPA] Current view before change:', currentView);
              console.log('[SPA] Setting new view to:', view);
              setCurrentView(view);
              console.log('[SPA] View change completed');
            }}
            sidebarCollapsed={sidebarCollapsed}
            onSidebarCollapse={setSidebarCollapsed}
            currentUser={currentUser}
            systemHealth={systemHealth as SystemHealth}
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            userPermissions={userPermissions}
            recentNotifications={[]}
            quickActionsSidebarOpen={quickActionsSidebarOpen}
            onQuickActionsSidebarToggle={setQuickActionsSidebarOpen}
            quickActionsContext={quickActionsContext}
            onQuickAction={() => {}}
            aiAssistantOpen={aiAssistantOpen}
            onAIAssistantToggle={setAIAssistantOpen}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            onWorkspaceSwitch={async (workspaceId: UUID) => {
              try {
                await switchWorkspace(workspaceId)
                setSelectedWorkspace(workspaceId)
              } catch (error) {
                console.error("Failed to switch workspace:", error)
              }
            }}
            systemOverview={systemOverview}
            dataGovernanceNodes={dataGovernanceNodes}
            performanceMode={performanceMode}
            hookOrchestrator={{
              criticalHooksLoaded: true,
              isReady: true,
              loadingProgress: 100,
              errors: {},
              hooks: {}
            }}
            lazyHooksEnabled={true}
          />
          
          {/* Advanced AI Command Center Integration */}
          <AnimatePresence>
            {aiAssistantOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50"
              >
                {/* Dynamic Background Based on Mode */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  aiAssistantMode === "fullscreen" 
                    ? "bg-black/95 backdrop-blur-xl" 
                    : "bg-black/40 backdrop-blur-sm"
                }`} />
                
                {/* AI Assistant Container with Multiple Modes */}
                <div className={`relative h-full transition-all duration-500 ${
                  aiAssistantMode === "fullscreen" 
                    ? "p-0" 
                    : aiAssistantMode === "docked"
                    ? "p-4 flex justify-end"
                    : "p-8 flex items-center justify-center"
                }`}>
                  
                  {/* Enhanced AI Assistant Interface */}
                  <motion.div
                    initial={{
                      scale: aiAssistantMode === "fullscreen" ? 1 : 0.8,
                      opacity: 0,
                      x: aiAssistantMode === "docked" ? 400 : 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      scale: 0.8,
                      opacity: 0,
                      x: aiAssistantMode === "docked" ? 400 : 0,
                    }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={`relative overflow-hidden ${
                      aiAssistantMode === "fullscreen"
                        ? "w-full h-full rounded-none"
                        : aiAssistantMode === "docked"
                        ? "w-[600px] h-full rounded-l-3xl shadow-[0_0_100px_rgba(59,130,246,0.6)]"
                        : "w-full max-w-[1400px] h-full max-h-[90vh] rounded-3xl shadow-[0_0_150px_rgba(59,130,246,0.5)]"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0e4b99 100%)",
                      border: "2px solid rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    {/* Advanced Control Bar */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                      {/* Mode Switcher */}
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 border border-blue-500/30 backdrop-blur-xl">
                        <button
                          onClick={() => setAIAssistantMode("floating")}
                          className={`p-2 rounded-xl transition-all duration-300 ${
                            aiAssistantMode === "floating"
                              ? "bg-blue-600/40 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                              : "text-blue-400 hover:bg-blue-900/30"
                          }`}
                          title="Floating Mode"
                        >
                          <Maximize2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAIAssistantMode("docked")}
                          className={`p-2 rounded-xl transition-all duration-300 ${
                            aiAssistantMode === "docked"
                              ? "bg-purple-600/40 text-purple-200 shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                              : "text-purple-400 hover:bg-purple-900/30"
                          }`}
                          title="Docked Mode"
                        >
                          <Sidebar className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAIAssistantMode("fullscreen")}
                          className={`p-2 rounded-xl transition-all duration-300 ${
                            aiAssistantMode === "fullscreen"
                              ? "bg-emerald-600/40 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                              : "text-emerald-400 hover:bg-emerald-900/30"
                          }`}
                          title="Fullscreen Mode"
                        >
                          <Monitor className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {/* Close Button */}
                      <button
                        onClick={() => setAIAssistantOpen(false)}
                        className="p-3 rounded-2xl bg-red-600/30 text-red-200 border border-red-500/50 hover:bg-red-600/50 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* AI Assistant Interface */}
                    <Suspense fallback={
                      <div className="h-full flex items-center justify-center">
                        <EnterpriseLoadingState
                          type="system"
                          message="Initializing Neural Command Center..."
                          showProgress={true}
                        />
                      </div>
                    }>
                      {React.createElement(
                        React.lazy(() => import("./components/ai-assistant/AIAssistantInterface")),
                        {
                          className: "h-full w-full border-0",
                          onClose: () => setAIAssistantOpen(false),
                          isMaximized: aiAssistantMode === "fullscreen",
                          isExpanded: aiAssistantMode !== "docked",
                          onMaximizeToggle: () => {
                            setAIAssistantMode(aiAssistantMode === "fullscreen" ? "floating" : "fullscreen")
                          },
                          mode: "enterprise-full",
                          enableRealTimeMonitoring: true,
                          enableAdvancedAnalytics: true,
                          enableModelManagement: true,
                          enableWorkflowOrchestration: true,
                          enableSystemOptimization: true,
                          enableEnterpriseIntegrations: true,
                          enableAdvancedSecurity: true,
                          enableCustomDashboards: true,
                          enableAPIManagement: true,
                          enableDataGovernance: true,
                          theme: "enterprise",
                          layout: aiAssistantMode === "docked" ? "compact" : "expanded",
                          animationLevel: "cinematic",
                          performanceMode: "maximum",
                          initialContext: {
                            userId: (currentUser as any)?.id || 'anonymous',
                            user: currentUser,
                            workspace: activeWorkspace,
                            systemHealth,
                            userPermissions,
                            timestamp: new Date(),
                            sessionId: crypto.randomUUID(),
                          },
                        }
                      )}
                    </Suspense>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Global API Request Monitor - Controls ALL API requests across the entire application */}
        <GlobalRequestMonitor 
          isVisible={showRequestMonitor}
          onToggle={setShowRequestMonitor}
        />
        
        {/* Floating Toggle Button for Request Monitor */}
        <button
          onClick={() => setShowRequestMonitor(!showRequestMonitor)}
          className="fixed bottom-4 left-4 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Toggle API Request Monitor"
        >
          <Activity className="h-5 w-5" />
        </button>
      </EnterpriseErrorBoundary>
    </Suspense>
  )
}

// Component size metrics for monitoring
export const COMPONENT_METRICS = {
  totalLines: 833, // Approximate line count
  componentCount: 15, // Number of major components
  hookCount: 12, // Number of custom hooks
  apiIntegrationCount: 8, // Number of API integrations
  lastUpdated: new Date().toISOString()
};

export default RacineMainManagerSPA