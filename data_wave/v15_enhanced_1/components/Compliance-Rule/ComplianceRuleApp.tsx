"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComplianceRuleList } from "./components/ComplianceRuleList"
import { ComplianceRuleCreateModal } from "./components/ComplianceRuleCreateModal"
import { ComplianceRuleEditModal } from "./components/ComplianceRuleEditModal"
import { ComplianceRuleDetails } from "./components/ComplianceRuleDetails"
import { ComplianceDashboard } from "./components/ComplianceDashboard"
import { ComplianceIssueList } from "./components/ComplianceIssueList"
import { ComplianceReports } from "./components/ComplianceReports"
import { ComplianceIntegrations } from "./components/ComplianceIntegrations"
import { ComplianceWorkflows } from "./components/ComplianceWorkflows"
import { 
  useComplianceRules, 
  useComplianceIssues, 
  useComplianceAnalytics as useComplianceDashboard,
  useIntegrationManagement as useIntegrations 
} from "./hooks/use-enterprise-features"
import { useNotifications } from "@/components/Scan-Rule-Sets/hooks/useNotifications"
import { useWorkflows } from "./hooks/useWorkflows"
import { useReports } from "./hooks/useReports" // Import for reports hooks
import type { ComplianceRule, ComplianceReport, IntegrationConfig, ComplianceWorkflow } from "./types"
import { LayoutDashboard, ShieldCheck, AlertTriangle, FileText, Plug, Zap } from "lucide-react"
import { ErrorBoundary } from "../Scan-Rule-Sets/components/ErrorBoundary"
import { ReportCreateModal } from "./components/ReportCreateModal"
import { ReportEditModal } from "./components/ReportEditModal"
import { IntegrationCreateModal } from "./components/IntegrationCreateModal"
import { IntegrationEditModal } from "./components/IntegrationEditModal"
import { WorkflowCreateModal } from "./components/WorkflowCreateModal"
import { WorkflowEditModal } from "./components/WorkflowEditModal"

export function ComplianceRuleApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isRuleCreateModalOpen, setIsRuleCreateModalOpen] = useState(false)
  const [isRuleEditModalOpen, setIsRuleEditModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null)

  const [isReportCreateModalOpen, setIsReportCreateModalOpen] = useState(false)
  const [isReportEditModalOpen, setIsReportEditModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null) // For editing reports

  const [isIntegrationCreateModalOpen, setIsIntegrationCreateModalOpen] = useState(false)
  const [isIntegrationEditModalOpen, setIsIntegrationEditModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null) // For editing integrations

  const [isWorkflowCreateModalOpen, setIsWorkflowCreateModalOpen] = useState(false)
  const [isWorkflowEditModalOpen, setIsWorkflowEditModalOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<ComplianceWorkflow | null>(null) // For editing workflows

  const {
    rules,
    isLoading: isLoadingRules,
    error: rulesError,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    validateRule,
  } = useComplianceRules()

  const {
    issues,
    isLoading: isLoadingIssues,
    error: issuesError,
    fetchIssues,
    updateIssue, // Changed from updateIssueStatus
    assignIssue,
    changeIssueStatus, // New function for status updates
  } = useComplianceIssues()

  const {
    summary,
    isLoading: isLoadingSummary,
    error: summaryError,
    refreshData: fetchSummary,
  } = useComplianceDashboard()

  const {
    integrations,
    isLoading: isLoadingIntegrations,
    error: integrationsError,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
    toggleIntegrationStatus,
  } = useIntegrations()

  const {
    workflows,
    isLoading: isLoadingWorkflows,
    error: workflowsError,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    toggleWorkflowStatus,
  } = useWorkflows()

  const { createReport, updateReport, deleteReport, generateReport } = useReports() // Use reports hooks

  const { showNotification } = useNotifications()

  // --- Rule Handlers ---
  const handleCreateRuleSuccess = async (
    newRuleData: Omit<
      ComplianceRule,
      | "id"
      | "created_at"
      | "updated_at"
      | "pass_rate"
      | "total_entities"
      | "passing_entities"
      | "failing_entities"
      | "last_validation"
      | "escalation_rules"
      | "audit_trail"
    >,
  ) => {
    await createRule(newRuleData)
    setIsRuleCreateModalOpen(false)
  }

  const handleEditRuleSuccess = async (updatedRule: ComplianceRule) => {
    await updateRule(updatedRule.id, updatedRule)
    setIsRuleEditModalOpen(false)
    setSelectedRule(null)
  }

  const handleDeleteRuleConfirmed = async (ruleToDelete: ComplianceRule) => {
    await deleteRule(ruleToDelete.id)
    setSelectedRule(null) // Close details if open for deleted rule
  }

  const handleViewRuleDetails = (rule: ComplianceRule) => {
    setSelectedRule(rule)
    setActiveTab("rules")
  }

  const handleEditRuleClick = (rule: ComplianceRule) => {
    setSelectedRule(rule)
    setIsRuleEditModalOpen(true)
  }

  // --- Report Handlers ---
  const handleCreateReportSuccess = async (
    newReportData: Omit<
      ComplianceReport,
      "id" | "created_at" | "status" | "generated_by" | "updated_at" | "updated_by" | "last_generated_at" | "file_url"
    >,
  ) => {
    await createReport(newReportData)
    setIsReportCreateModalOpen(false)
  }

  const handleEditReportSuccess = async (updatedReport: ComplianceReport) => {
    await updateReport(updatedReport.id, updatedReport)
    setIsReportEditModalOpen(false)
    setSelectedReport(null)
  }

  const handleDeleteReportConfirmed = async (reportId: number) => {
    await deleteReport(reportId)
  }

  const handleGenerateReport = async (reportId: number) => {
    await generateReport(reportId)
  }

  // --- Integration Handlers ---
  const handleCreateIntegrationSuccess = async (
    newIntegrationData: Omit<
      IntegrationConfig,
      "id" | "created_at" | "status" | "last_synced_at" | "updated_at" | "updated_by" | "error_message"
    >,
  ) => {
    await createIntegration(newIntegrationData)
    setIsIntegrationCreateModalOpen(false)
  }

  const handleEditIntegrationSuccess = async (updatedIntegration: IntegrationConfig) => {
    await updateIntegration(updatedIntegration.id, updatedIntegration)
    setIsIntegrationEditModalOpen(false)
    setSelectedIntegration(null)
  }

  const handleDeleteIntegrationConfirmed = async (integrationId: number) => {
    await deleteIntegration(integrationId)
  }

  // --- Workflow Handlers ---
  const handleCreateWorkflowSuccess = async (
    newWorkflowData: Omit<
      ComplianceWorkflow,
      "id" | "created_at" | "last_run_at" | "last_run_status" | "updated_at" | "updated_by" | "execution_history"
    >,
  ) => {
    await createWorkflow(newWorkflowData)
    setIsWorkflowCreateModalOpen(false)
  }

  const handleEditWorkflowSuccess = async (updatedWorkflow: ComplianceWorkflow) => {
    await updateWorkflow(updatedWorkflow.id, updatedWorkflow)
    setIsWorkflowEditModalOpen(false)
    setSelectedWorkflow(null)
  }

  const handleDeleteWorkflowConfirmed = async (workflowId: number) => {
    await deleteWorkflow(workflowId)
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
          <TabsList className="grid w-full grid-cols-6 border-b">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="rules">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="issues">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Plug className="mr-2 h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Zap className="mr-2 h-4 w-4" />
              Workflows
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto py-4">
            <TabsContent value="dashboard" className="h-full">
              <ComplianceDashboard
                summary={summary}
                isLoading={isLoadingSummary}
                error={summaryError}
                onRefresh={fetchSummary}
              />
            </TabsContent>

            <TabsContent value="rules" className="h-full">
              {selectedRule ? (
                <ComplianceRuleDetails
                  rule={selectedRule}
                  onBack={() => setSelectedRule(null)}
                  onEdit={handleEditRuleClick}
                  onDelete={handleDeleteRuleConfirmed}
                />
              ) : (
                <ComplianceRuleList
                  onViewDetails={handleViewRuleDetails}
                  onEditRule={handleEditRuleClick}
                  onDeleteRule={handleDeleteRuleConfirmed}
                  onCreateRule={() => setIsRuleCreateModalOpen(true)}
                  onValidateRule={validateRule}
                  onRefresh={fetchRules}
                />
              )}
            </TabsContent>

            <TabsContent value="issues" className="h-full">
              <ComplianceIssueList
                issues={issues}
                isLoading={isLoadingIssues}
                error={issuesError}
                onRefresh={fetchIssues}
                onUpdateIssueStatus={changeIssueStatus} // Use new function
                onAssignIssue={assignIssue}
                onEscalateIssue={updateIssue} // Reusing updateIssue for escalation
              />
            </TabsContent>

            <TabsContent value="reports" className="h-full">
              <ComplianceReports /> {/* All logic moved inside ComplianceReports */}
            </TabsContent>

            <TabsContent value="integrations" className="h-full">
              <ComplianceIntegrations /> {/* All logic moved inside ComplianceIntegrations */}
            </TabsContent>

            <TabsContent value="workflows" className="h-full">
              <ComplianceWorkflows /> {/* All logic moved inside ComplianceWorkflows */}
            </TabsContent>
          </div>
        </Tabs>

        <ComplianceRuleCreateModal
          isOpen={isRuleCreateModalOpen}
          onClose={() => setIsRuleCreateModalOpen(false)}
          onSuccess={handleCreateRuleSuccess}
        />

        {selectedRule && (
          <ComplianceRuleEditModal
            isOpen={isRuleEditModalOpen}
            onClose={() => {
              setIsRuleEditModalOpen(false)
              setSelectedRule(null)
            }}
            rule={selectedRule}
            onSuccess={handleEditRuleSuccess}
          />
        )}

        {/* Modals for Reports */}
        <ReportCreateModal
          isOpen={isReportCreateModalOpen}
          onClose={() => setIsReportCreateModalOpen(false)}
          onSuccess={handleCreateReportSuccess}
        />
        {selectedReport && (
          <ReportEditModal
            isOpen={isReportEditModalOpen}
            onClose={() => {
              setIsReportEditModalOpen(false)
              setSelectedReport(null)
            }}
            report={selectedReport}
            onSuccess={handleEditReportSuccess}
          />
        )}

        {/* Modals for Integrations */}
        <IntegrationCreateModal
          isOpen={isIntegrationCreateModalOpen}
          onClose={() => setIsIntegrationCreateModalOpen(false)}
          onSuccess={handleCreateIntegrationSuccess}
        />
        {selectedIntegration && (
          <IntegrationEditModal
            isOpen={isIntegrationEditModalOpen}
            onClose={() => {
              setIsIntegrationEditModalOpen(false)
              setSelectedIntegration(null)
            }}
            integration={selectedIntegration}
            onSuccess={handleEditIntegrationSuccess}
          />
        )}

        {/* Modals for Workflows */}
        <WorkflowCreateModal
          isOpen={isWorkflowCreateModalOpen}
          onClose={() => setIsWorkflowCreateModalOpen(false)}
          onSuccess={handleCreateWorkflowSuccess}
        />
        {selectedWorkflow && (
          <WorkflowEditModal
            isOpen={isWorkflowEditModalOpen}
            onClose={() => {
              setIsWorkflowEditModalOpen(false)
              setSelectedWorkflow(null)
            }}
            workflow={selectedWorkflow}
            onSuccess={handleEditWorkflowSuccess}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
