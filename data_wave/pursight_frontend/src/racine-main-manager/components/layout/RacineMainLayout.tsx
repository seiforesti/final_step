"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TooltipProvider } from "../ui/tooltip"
import { OptimizedAnimationProvider } from "../animations/OptimizedAnimationProvider"
import { EnterpriseErrorBoundary } from "../error-boundaries/EnterpriseErrorBoundary"

import { AppNavbar } from "../navigation/AppNavbar"
import { AdvancedNavigationSidebar } from "../navigation/AdvancedNavigationSidebar"
import {  AdvancedQuickActionsSidebar } from "../quick-actions-sidebar/AdvancedQuickActionsSidebar"
import { AIAssistantModal } from "../modals/AIAssistantModal"
import { FloatingActionMenu } from "../ui/FloatingActionMenu"
import { MainContentRenderer } from "./MainContentRenderer"
import { SystemStatusIndicator } from "./SystemStatusIndicator"

import { ViewMode, SystemHealth, QuickActionContext } from "../../types/racine-core.types"

interface RacineMainLayoutProps {
  // Navigation props
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void

  // Sidebar props
  sidebarCollapsed: boolean
  onSidebarCollapse: (collapsed: boolean) => void

  // User and system data
  currentUser: any
  systemHealth: SystemHealth
  workspaces: any[]
  activeWorkspace: any
  userPermissions: string[]
  recentNotifications: any[]

  // Quick actions
  quickActionsSidebarOpen: boolean
  onQuickActionsSidebarToggle: (open: boolean) => void
  quickActionsContext: QuickActionContext
  onQuickAction: (action: string, context?: any) => void

  // AI Assistant
  aiAssistantOpen: boolean
  onAIAssistantToggle: (open: boolean) => void

  // Search
  searchQuery: string
  onSearch: (query: string) => void

  // Workspace management
  onWorkspaceSwitch: (workspaceId: string) => void

  // System overview data for main content
  systemOverview: any
  dataGovernanceNodes: any[]
  performanceMode: string

  // Hook orchestrator status
  hookOrchestrator: any
  lazyHooksEnabled: boolean
}

export const RacineMainLayout: React.FC<RacineMainLayoutProps> = ({
  currentView,
  onViewChange,
  sidebarCollapsed,
  onSidebarCollapse,
  currentUser,
  systemHealth,
  workspaces,
  activeWorkspace,
  userPermissions,
  recentNotifications,
  quickActionsSidebarOpen,
  onQuickActionsSidebarToggle,
  quickActionsContext,
  onQuickAction,
  aiAssistantOpen,
  onAIAssistantToggle,
  searchQuery,
  onSearch,
  onWorkspaceSwitch,
  systemOverview,
  dataGovernanceNodes,
  performanceMode,
  hookOrchestrator,
  lazyHooksEnabled,
}) => {
  const SAFE_MODE = (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === "development"

  return (
    <EnterpriseErrorBoundary level="critical" context="Main Layout">
      <OptimizedAnimationProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/20 relative overflow-hidden">
            {performanceMode === "ultra" && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            )}

            {performanceMode !== "ultra" && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
                animate={{
                  background: [
                    "linear-gradient(0deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                    "linear-gradient(120deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                    "linear-gradient(240deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                    "linear-gradient(360deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                  ],
                }}
                transition={{
                  duration: performanceMode === "high" ? 40 : 60,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            )}

            {SAFE_MODE && (
              <SystemStatusIndicator
                hookOrchestrator={hookOrchestrator}
                lazyHooksEnabled={lazyHooksEnabled}
                performanceMode={performanceMode}
              />
            )}

            <AppNavbar
              onQuickActionsTrigger={() => onQuickActionsSidebarToggle(true)}
              isQuickActionsSidebarOpen={quickActionsSidebarOpen}
            />

            <div
              className="flex h-screen pt-16 w-full overflow-hidden"
              style={{ paddingLeft: sidebarCollapsed ? 64 : 280 }}
            >
              <AdvancedNavigationSidebar
                collapsed={sidebarCollapsed}
                onCollapsedChange={onSidebarCollapse}
                onQuickActionsTrigger={() => onQuickActionsSidebarToggle(true)}
                onViewChange={(view) => {
                  console.log('[Layout] onViewChange called with view:', view);
                  console.log('[Layout] onViewChange prop type:', typeof onViewChange);
                  
                  // Convert string view to ViewMode - the string IS the ViewMode value
                  const newViewMode = view as ViewMode
                  console.log('[Layout] View string directly as ViewMode:', view)
                  console.log('[Layout] ViewMode.DATA_SOURCES value:', ViewMode.DATA_SOURCES);
                  console.log('[Layout] ViewMode enum values:', Object.values(ViewMode));
                  
                  if (newViewMode) {
                    console.log('[Layout] Using view string directly as ViewMode:', view)
                    try {
                      onViewChange(newViewMode)
                      console.log('[Layout] onViewChange called successfully with ViewMode:', newViewMode)
                    } catch (error) {
                      console.error('[Layout] Error calling onViewChange:', error)
                    }
                  } else {
                    console.warn('[Layout] Invalid view string:', view)
                  }
                }}
              />

              <main className="flex-1 min-w-0">
                <div className={`h-full ${currentView !== ViewMode.DASHBOARD ? 'overflow-hidden bg-black' : 'overflow-auto'}`}>
                  <div className={currentView !== ViewMode.DASHBOARD ? 'h-full w-full p-0' : 'px-6 py-6 space-y-6'}>
                    <motion.div
                      className={currentView !== ViewMode.DASHBOARD ? 'h-full w-full' : ''}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={currentView !== ViewMode.DASHBOARD ? 'h-full w-full' : ''}>
                        <MainContentRenderer
                          currentView={currentView}
                          systemOverview={systemOverview}
                          dataGovernanceNodes={dataGovernanceNodes}
                          performanceMode={performanceMode}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </main>
            </div>

            <AdvancedQuickActionsSidebar
              isOpen={quickActionsSidebarOpen}
              onToggle={() => onQuickActionsSidebarToggle(!quickActionsSidebarOpen)}
              currentContext={quickActionsContext?.userId || "global"}
              onActionExecute={(actionId, categoryId) => onQuickAction(actionId, { categoryId })}
            />

            <AIAssistantModal isOpen={aiAssistantOpen} onClose={() => onAIAssistantToggle(false)} />

            <FloatingActionMenu onQuickAction={onQuickAction} onAIAssistant={() => onAIAssistantToggle(true)} />
          </div>
        </TooltipProvider>
      </OptimizedAnimationProvider>
    </EnterpriseErrorBoundary>
  )
}
