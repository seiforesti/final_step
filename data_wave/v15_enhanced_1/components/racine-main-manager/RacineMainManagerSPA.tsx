"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ErrorBoundary } from "react-error-boundary"

// Import types
import type {
  ViewMode,
  LayoutMode,
  QuickActionContext,
  SystemHealth,
  UUID,
} from "./types/racine-core.types"

// Import hooks
import { useRacineOrchestration } from "./hooks/useRacineOrchestration"
import { useWorkspaceManagement } from "./hooks/useWorkspaceManagement"
import { useUserManagement } from "./hooks/useUserManagement"
import { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring"

// Import components
import { EnterpriseLayoutOrchestrator } from "./components/layout"
import { AppSidebar } from "./components/navigation/AppSidebar"
import { GlobalQuickActionsSidebar } from "./components/quick-actions-sidebar/GlobalQuickActionsSidebar"
import { IntelligentDashboard } from "./components/intelligent-dashboard/IntelligentDashboard"
import { AIAssistant } from "./components/ai-assistant/AIAssistant"
import { ActivityTracker } from "./components/activity-tracker/ActivityTracker"
import { DataGovernanceSchema } from "./components/visualizations/DataGovernanceSchema"
import { WorkflowManager } from "./components/workflow/WorkflowManager"
import { PipelineManager } from "./components/pipeline-manager/PipelineManager"
import { CollaborationSpace } from "./components/collaboration/CollaborationSpace"

// Import utilities
import { cn } from "./utils/cn"
import { generateId } from "./utils/id-utils"

// Import icons
import {
  Database,
  Shield,
  FileText,
  BarChart3,
  Workflow,
  Zap,
  Bot,
  Activity,
  Users,
  Settings,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

// Import UI components
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip"
import { Alert, AlertDescription } from "./components/ui/alert"

// SPA Orchestrators
import { DataSourcesSPAOrchestrator } from "./components/spa-orchestrators/DataSourcesSPAOrchestrator"
import { ScanRuleSetsSPAOrchestrator } from "./components/spa-orchestrators/ScanRuleSetsSPAOrchestrator"
import { ClassificationsSPAOrchestrator } from "./components/spa-orchestrators/ClassificationsSPAOrchestrator"
import { ComplianceRuleSPAOrchestrator } from "./components/spa-orchestrators/ComplianceRuleSPAOrchestrator"
import { AdvancedCatalogSPAOrchestrator } from "./components/spa-orchestrators/AdvancedCatalogSPAOrchestrator"
import { ScanLogicSPAOrchestrator } from "./components/spa-orchestrators/ScanLogicSPAOrchestrator"
import { RBACSystemSPAOrchestrator } from "./components/spa-orchestrators/RBACSystemSPAOrchestrator"

// View mode enum
export enum ViewModeEnum {
  DASHBOARD = "dashboard",
  WORKFLOWS = "workflows", 
  PIPELINES = "pipelines",
  ACTIVITY = "activity",
  COLLABORATION = "collaboration",
  AI_ASSISTANT = "ai-assistant",
  DATA_GOVERNANCE = "data-governance",
  DATA_SOURCES = "data-sources",
  SCAN_RULE_SETS = "scan-rule-sets",
  CLASSIFICATIONS = "classifications",
  COMPLIANCE_RULE = "compliance-rule",
  ADVANCED_CATALOG = "advanced-catalog",
  SCAN_LOGIC = "scan-logic",
  RBAC_SYSTEM = "rbac-system",
  WORKSPACE = "workspace",
  SETTINGS = "settings"
}

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Application Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {error.message || "An unexpected error occurred"}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={resetErrorBoundary} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => window.location.reload()} className="flex-1">
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading Racine Platform...</p>
      </CardContent>
    </Card>
  </div>
)

export const RacineMainManagerSPA: React.FC = () => {
  const reducedMotion = useReducedMotion()
  
  // Core state
  const [currentView, setCurrentView] = useState<ViewModeEnum>(ViewModeEnum.DASHBOARD)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quickActionsSidebarOpen, setQuickActionsSidebarOpen] = useState(false)
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hooks
  const { 
    orchestrationState, 
    systemHealth, 
    isLoading: orchestrationLoading,
    error: orchestrationError,
    executeWorkflow,
    refreshSystemHealth 
  } = useRacineOrchestration()

  const { 
    currentWorkspace, 
    workspaces, 
    switchWorkspace,
    isLoading: workspaceLoading 
  } = useWorkspaceManagement()

  const { 
    currentUser, 
    permissions,
    isLoading: userLoading 
  } = useUserManagement()

  const { 
    performanceMetrics,
    startMonitoring,
    stopMonitoring 
  } = usePerformanceMonitoring()

  // Initialize the application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Start performance monitoring
        startMonitoring()

        // Initialize system health check
        await refreshSystemHealth()

        setIsLoading(false)
      } catch (err) {
        console.error('App initialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize application')
        setIsLoading(false)
      }
    }

    initializeApp()

    // Cleanup on unmount
    return () => {
      stopMonitoring()
    }
  }, [startMonitoring, stopMonitoring, refreshSystemHealth])

  // Handle view changes
  const handleViewChange = useCallback((view: ViewModeEnum) => {
    setCurrentView(view)
    // Close quick actions sidebar when changing views
    setQuickActionsSidebarOpen(false)
  }, [])

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Handle quick actions toggle
  const handleQuickActionsToggle = useCallback(() => {
    setQuickActionsSidebarOpen(prev => !prev)
  }, [])

  // Handle AI assistant toggle
  const handleAIAssistantToggle = useCallback(() => {
    setAIAssistantOpen(prev => !prev)
  }, [])

  // Render the appropriate content based on current view
  const renderMainContent = useCallback(() => {
    switch (currentView) {
      case ViewModeEnum.DASHBOARD:
        return <IntelligentDashboard />
      
      case ViewModeEnum.WORKFLOWS:
        return <WorkflowManager />
      
      case ViewModeEnum.PIPELINES:
        return <PipelineManager />
      
      case ViewModeEnum.ACTIVITY:
        return <ActivityTracker />
      
      case ViewModeEnum.COLLABORATION:
        return <CollaborationSpace />
      
      case ViewModeEnum.AI_ASSISTANT:
        return <AIAssistant isFullscreen />
      
      case ViewModeEnum.DATA_GOVERNANCE:
        return <DataGovernanceSchema />

      case ViewModeEnum.DATA_SOURCES:
        return <DataSourcesSPAOrchestrator />

      case ViewModeEnum.SCAN_RULE_SETS:
        return <ScanRuleSetsSPAOrchestrator />

      case ViewModeEnum.CLASSIFICATIONS:
        return <ClassificationsSPAOrchestrator />

      case ViewModeEnum.COMPLIANCE_RULE:
        return <ComplianceRuleSPAOrchestrator />

      case ViewModeEnum.ADVANCED_CATALOG:
        return <AdvancedCatalogSPAOrchestrator />

      case ViewModeEnum.SCAN_LOGIC:
        return <ScanLogicSPAOrchestrator />

      case ViewModeEnum.RBAC_SYSTEM:
        return <RBACSystemSPAOrchestrator />
      
      default:
        return <IntelligentDashboard />
    }
  }, [currentView])

  // System health indicator
  const renderSystemHealthIndicator = useMemo(() => {
    if (!systemHealth) return null

    const healthColor = systemHealth.overall === 'healthy' ? 'bg-green-500' : 
                       systemHealth.overall === 'warning' ? 'bg-yellow-500' : 'bg-red-500'

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("w-2 h-2 rounded-full", healthColor)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>System Health: {systemHealth.overall}</p>
        </TooltipContent>
      </Tooltip>
    )
  }, [systemHealth])

  // Show loading state
  if (isLoading || orchestrationLoading || workspaceLoading || userLoading) {
    return <LoadingFallback />
  }

  // Show error state
  if (error || orchestrationError) {
    return (
      <ErrorFallback 
        error={new Error(error || orchestrationError?.message || 'Unknown error')}
        resetErrorBoundary={() => {
          setError(null)
          window.location.reload()
        }}
      />
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <TooltipProvider>
        <div className="flex h-screen bg-background overflow-hidden">
          {/* Main Sidebar */}
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
            currentView={currentView}
            onViewChange={handleViewChange}
            onQuickActionsToggle={handleQuickActionsToggle}
            systemHealth={systemHealth}
            currentUser={currentUser}
            currentWorkspace={currentWorkspace}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between px-4 h-full">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSidebarToggle}
                    className="lg:hidden"
                  >
                    {sidebarCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  
                  <h1 className="font-semibold text-foreground">
                    {currentView.charAt(0).toUpperCase() + currentView.slice(1).replace(/-/g, ' ')}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {renderSystemHealthIndicator}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAIAssistantToggle}
                    className="relative"
                  >
                    <Bot className="h-4 w-4" />
                    {aiAssistantOpen && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleQuickActionsToggle}
                    className="relative"
                  >
                    <Zap className="h-4 w-4" />
                    {quickActionsSidebarOpen && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Suspense fallback={<LoadingFallback />}>
                    {renderMainContent()}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Quick Actions Sidebar */}
          <AnimatePresence>
            {quickActionsSidebarOpen && (
              <GlobalQuickActionsSidebar
                isOpen={quickActionsSidebarOpen}
                onClose={() => setQuickActionsSidebarOpen(false)}
                currentView={currentView}
                onViewChange={handleViewChange}
                currentWorkspace={currentWorkspace}
                currentUser={currentUser}
              />
            )}
          </AnimatePresence>

          {/* AI Assistant */}
          <AnimatePresence>
            {aiAssistantOpen && (
              <AIAssistant 
                isOpen={aiAssistantOpen}
                onClose={() => setAIAssistantOpen(false)}
                mode="docked"
                currentView={currentView}
                contextData={{
                  workspace: currentWorkspace,
                  user: currentUser,
                  systemHealth,
                  performanceMetrics
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default RacineMainManagerSPA

// Export component metrics for monitoring
export const COMPONENT_METRICS = {
  name: 'RacineMainManagerSPA',
  version: '2.0.0',
  lastUpdated: new Date().toISOString(),
  features: [
    'Professional Dashboard',
    'Workflow Management',
    'Pipeline Management', 
    'Activity Tracking',
    'Collaboration',
    'AI Assistant',
    'Data Governance',
    'SPA Orchestration',
    'Real-time Monitoring'
  ]
}