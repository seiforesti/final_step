"use client"

import type React from "react"
import { Suspense, lazy, useCallback } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { EnterpriseLoadingState } from "../loading/EnterpriseLoadingStates"
import { ViewMode } from "../../types/racine-core.types"

const WorkspaceOrchestrator = lazy(() => import("../workspace/WorkspaceOrchestrator"))
const JobWorkflowBuilder = lazy(() => import("../job-workflow-space/JobWorkflowBuilder"))
const PipelineDesigner = lazy(() => import("../pipeline-manager/PipelineDesigner"))
const AIAssistantInterface = lazy(() => import("../ai-assistant/AIAssistantInterface"))
const ActivityTrackingHub = lazy(() => import("../activity-tracker/ActivityTrackingHub"))
const MasterCollaborationHub = lazy(() => import("../collaboration/MasterCollaborationHub"))
const UserProfileManager = lazy(() => import("../user-management/UserProfileManager"))
const IntelligentDashboardOrchestrator = lazy(
  () => import("../intelligent-dashboard/IntelligentDashboardOrchestrator"),
)

// Data Governance SPAs - Lazy imports
const DataSourcesSPA = lazy(() => import("../../../data-sources/enhanced-data-sources-app"))
const ScanRuleSetsSPA = lazy(() => import("../../../Advanced-Scan-Rule-Sets/spa/ScanRuleSetsSPA"))
const ClassificationsSPA = lazy(() => import("../../../classifications/ClassificationsSPA"))
const ComplianceRulesSPA = lazy(() => import("../../../Compliance-Rule/enhanced-compliance-rule-app"))
const AdvancedCatalogSPA = lazy(() => import("../../../Advanced-Catalog/spa/AdvancedCatalogSPA"))
const ScanLogicSPA = lazy(() => import("../../../Advanced-Scan-Logic/spa/ScanLogicMasterSPA"))
const RBACSystemSPA = lazy(() => import("../../../Advanced_RBAC_Datagovernance_System/RBACSystemSPA"))

interface MainContentRendererProps {
  currentView: ViewMode
  systemOverview: any
  dataGovernanceNodes: any[]
  performanceMode: string
}

export const MainContentRenderer: React.FC<MainContentRendererProps> = ({
  currentView,
  systemOverview,
  dataGovernanceNodes,
  performanceMode,
}) => {
  const SuspenseWrapper = useCallback(
    ({ children, type = "default" }: { children: React.ReactNode; type?: string }) => (
      <Suspense
        fallback={
          <EnterpriseLoadingState
            type={type as any}
            message="Loading..."
            showProgress={false}
          />
        }
      >
        {children}
      </Suspense>
    ),
    [], // Removed currentView dependency to prevent re-creation
  )

  const renderDashboardOverview = useCallback(
    () => (
      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {systemOverview.totalAssets?.toLocaleString() || "0"}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {systemOverview.systemHealth || 0}%
              </div>
              <Progress value={systemOverview.systemHealth || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {systemOverview.activeWorkflows || 0}
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                <Activity className="w-4 h-4" />
                <span>Running smoothly</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {systemOverview.dataQuality || 0}%
              </div>
              <Progress value={systemOverview.dataQuality || 0} className="mt-2" />
            </CardContent>
          </Card>
        </motion.section>
      </div>
    ),
    [systemOverview],
  )

  switch (currentView) {
    case ViewMode.DASHBOARD:
      return renderDashboardOverview()

    case ViewMode.WORKSPACE:
      return (
        <SuspenseWrapper type="system">
          <WorkspaceOrchestrator />
        </SuspenseWrapper>
      )

    case ViewMode.WORKFLOWS:
      return (
        <SuspenseWrapper type="processing">
          <JobWorkflowBuilder />
        </SuspenseWrapper>
      )

    case ViewMode.PIPELINES:
      return (
        <SuspenseWrapper type="data">
          <PipelineDesigner />
        </SuspenseWrapper>
      )

    case ViewMode.AI_ASSISTANT:
      return (
        <SuspenseWrapper type="ai">
          <AIAssistantInterface />
        </SuspenseWrapper>
      )

    case ViewMode.ACTIVITY:
      return (
        <SuspenseWrapper type="processing">
          <ActivityTrackingHub />
        </SuspenseWrapper>
      )

    case ViewMode.COLLABORATION:
      return (
        <SuspenseWrapper type="system">
          <MasterCollaborationHub />
        </SuspenseWrapper>
      )

    case ViewMode.SETTINGS:
      return (
        <SuspenseWrapper type="security">
          <UserProfileManager />
        </SuspenseWrapper>
      )

    // Data Governance SPAs - New cases
    case ViewMode.DATA_SOURCES:
      return (
        <SuspenseWrapper type="data">
          <DataSourcesSPA />
        </SuspenseWrapper>
      )

    case ViewMode.SCAN_RULE_SETS:
      return (
        <SuspenseWrapper type="security">
          <ScanRuleSetsSPA />
        </SuspenseWrapper>
      )

    case ViewMode.CLASSIFICATIONS:
      return (
        <SuspenseWrapper type="governance">
          <ClassificationsSPA />
        </SuspenseWrapper>
      )

    case ViewMode.COMPLIANCE_RULES:
      return (
        <SuspenseWrapper type="compliance">
          <ComplianceRulesSPA />
        </SuspenseWrapper>
      )

    case ViewMode.ADVANCED_CATALOG:
      return (
        <SuspenseWrapper type="catalog">
          <AdvancedCatalogSPA />
        </SuspenseWrapper>
      )

    case ViewMode.SCAN_LOGIC:
      return (
        <SuspenseWrapper type="processing">
          <ScanLogicSPA />
        </SuspenseWrapper>
      )

    case ViewMode.RBAC_SYSTEM:
      return (
        <SuspenseWrapper type="security">
          <RBACSystemSPA />
        </SuspenseWrapper>
      )

    default:
      return (
        <SuspenseWrapper type="data">
          <IntelligentDashboardOrchestrator />
        </SuspenseWrapper>
      )
  }
}
