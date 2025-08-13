"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Users,
  UserCheck,
  UserX,
  Send,
  MessageSquare,
  FileText,
  Calendar,
  Bell,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play,
  SkipForward,
  RotateCcw,
  Flag,
  Star,
  Shield,
  Lock,
  Unlock,
  Key,
  Crown,
  Award,
  Target,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Hash,
  Percent,
  Timer,
  StopCircle,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ExternalLink,
  Link,
  Unlink,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Workflow,
  Layers,
  Package,
  Code,
  Database,
  Server,
  Cloud,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

// Import types and services
import {
  ApprovalWorkflow,
  ApprovalStep,
  ApprovalRequest,
  ApprovalResponse,
  Approver,
  ApprovalRule,
  ApprovalPolicy,
  ApprovalTemplate,
  ApprovalHistory,
  ApprovalNotification,
  ApprovalMetrics,
  ApprovalAudit,
  ApprovalConfiguration,
  ApprovalPermission,
  ApprovalEscalation,
  ApprovalDelegation,
  ApprovalCondition,
  ApprovalAction,
  ApprovalTrigger,
  ApprovalCriteria,
  ApprovalThreshold,
  ApprovalTimeline,
  ApprovalSchedule,
  ApprovalReminder,
  ApprovalReport,
  ApprovalDashboard,
  ApprovalAnalytics,
  ApprovalInsights,
  ApprovalRecommendation,
  ApprovalOptimization,
  ApprovalIntegration,
  ApprovalWebhook,
  ApprovalAPI,
  ApprovalEvent,
  ApprovalLog,
  ApprovalTrace,
  ApprovalContext,
  ApprovalMetadata,
  ApprovalTag,
  ApprovalCategory,
  ApprovalPriority,
  ApprovalStatus,
  ApprovalState,
  ApprovalOutcome
} from '../../types/approval.types'

import {
  useApprovalWorkflows,
  useApprovalRequests,
  useApprovalPolicies,
  useApprovalTemplates,
  useApprovalMetrics,
  useApprovalNotifications,
  useApprovalAudit,
  useApprovalConfiguration,
  useApprovalPermissions,
  useApprovalEscalation,
  useApprovalDelegation,
  useApprovalAnalytics,
  useApprovalReports,
  useApprovalIntegrations
} from '../../hooks/useApprovalManagement'

import {
  createApprovalWorkflow,
  updateApprovalWorkflow,
  deleteApprovalWorkflow,
  executeApprovalWorkflow,
  pauseApprovalWorkflow,
  resumeApprovalWorkflow,
  cancelApprovalWorkflow,
  restartApprovalWorkflow,
  cloneApprovalWorkflow,
  submitApprovalRequest,
  processApprovalRequest,
  approveRequest,
  rejectRequest,
  delegateRequest,
  escalateRequest,
  withdrawRequest,
  reassignRequest,
  addApprover,
  removeApprover,
  updateApprover,
  setApprovalPolicy,
  createApprovalTemplate,
  applyApprovalTemplate,
  configureApprovalRules,
  validateApprovalWorkflow,
  testApprovalWorkflow,
  optimizeApprovalWorkflow,
  analyzeApprovalPerformance,
  generateApprovalReport,
  exportApprovalData,
  importApprovalData,
  syncApprovalData,
  backupApprovalData,
  restoreApprovalData,
  monitorApprovalWorkflows,
  trackApprovalMetrics,
  alertApprovalIssues,
  scheduleApprovalTasks,
  automateApprovalProcesses,
  orchestrateApprovalFlows,
  manageApprovalQueues,
  balanceApprovalLoads,
  optimizeApprovalRouting,
  enhanceApprovalSecurity,
  enforceApprovalCompliance,
  auditApprovalActivities,
  reportApprovalViolations,
  calculateApprovalSLA,
  measureApprovalEfficiency,
  benchmarkApprovalPerformance,
  predictApprovalOutcomes,
  recommendApprovalImprovements,
  personalizeApprovalExperience,
  customizeApprovalInterface,
  integrateApprovalSystems,
  connectApprovalServices,
  bridgeApprovalPlatforms,
  unifyApprovalData,
  standardizeApprovalFormats,
  normalizeApprovalStructures,
  validateApprovalInputs,
  sanitizeApprovalData,
  encryptApprovalContent,
  decryptApprovalContent,
  signApprovalDocuments,
  verifyApprovalSignatures,
  timestampApprovalEvents,
  hashApprovalRecords,
  compressApprovalArchives,
  decompressApprovalArchives,
  indexApprovalContent,
  searchApprovalHistory,
  filterApprovalResults,
  sortApprovalData,
  paginateApprovalLists,
  groupApprovalItems,
  aggregateApprovalMetrics,
  summarizeApprovalData,
  visualizeApprovalTrends,
  chartApprovalStatistics,
  graphApprovalRelationships,
  mapApprovalProcesses,
  diagramApprovalFlows,
  modelApprovalBehaviors,
  simulateApprovalScenarios,
  forecastApprovalDemand,
  projectApprovalCapacity,
  estimateApprovalDuration,
  calculateApprovalCosts,
  evaluateApprovalROI,
  assessApprovalRisks,
  mitigateApprovalThreats,
  contingencyApprovalPlanning,
  disasterApprovalRecovery,
  businessApprovalContinuity,
  scalabilityApprovalTesting,
  performanceApprovalTuning,
  reliabilityApprovalEngineering,
  availabilityApprovalManagement,
  consistencyApprovalControl,
  integrityApprovalValidation,
  confidentialityApprovalProtection,
  authenticationApprovalServices,
  authorizationApprovalPolicies,
  accountabilityApprovalAuditing,
  nonRepudiationApprovalLogging,
  privacyApprovalCompliance,
  gdprApprovalImplementation,
  hipaaApprovalEnforcement,
  soxApprovalCompliance,
  isoApprovalCertification,
  cmmApprovalAssessment,
  itilApprovalAlignment,
  cobitApprovalGovernance,
  togafApprovalArchitecture,
  zachmanApprovalFramework,
  devOpsApprovalIntegration,
  cicdApprovalPipelines,
  containerApprovalManagement,
  microserviceApprovalOrchestration,
  serverlessApprovalComputing,
  cloudApprovalDeployment,
  edgeApprovalComputing,
  iotApprovalIntegration,
  aiApprovalIntelligence,
  mlApprovalLearning,
  nlpApprovalProcessing,
  blockchainApprovalLedger,
  cryptoApprovalSecurity,
  quantumApprovalComputing,
  immersiveApprovalExperiences,
  virtualApprovalReality,
  augmentedApprovalReality,
  mixedApprovalReality,
  extendedApprovalReality
} from '../../services/approval-workflow-apis'

// Enhanced interfaces for advanced approval workflow management
interface ApprovalWorkflowEngineState {
  // Core approval state
  workflows: ApprovalWorkflow[]
  requests: ApprovalRequest[]
  responses: ApprovalResponse[]
  approvers: Approver[]
  policies: ApprovalPolicy[]
  templates: ApprovalTemplate[]
  
  // Selected items
  selectedWorkflow: ApprovalWorkflow | null
  selectedRequest: ApprovalRequest | null
  selectedApprover: Approver | null
  selectedPolicy: ApprovalPolicy | null
  selectedTemplate: ApprovalTemplate | null
  
  // Workflow operations
  isCreating: boolean
  isExecuting: boolean
  isPausing: boolean
  isResuming: boolean
  isCanceling: boolean
  isRestarting: boolean
  isCloning: boolean
  isValidating: boolean
  isOptimizing: boolean
  isTesting: boolean
  
  // Request operations
  isSubmitting: boolean
  isProcessing: boolean
  isApproving: boolean
  isRejecting: boolean
  isDelegating: boolean
  isEscalating: boolean
  isWithdrawing: boolean
  isReassigning: boolean
  
  // View state
  view: 'dashboard' | 'workflows' | 'requests' | 'approvers' | 'policies' | 'templates' | 'analytics' | 'audit' | 'settings'
  subView: 'overview' | 'details' | 'history' | 'metrics' | 'configuration' | 'permissions' | 'integrations'
  displayMode: 'grid' | 'list' | 'kanban' | 'timeline' | 'calendar' | 'chart'
  filterMode: 'all' | 'pending' | 'approved' | 'rejected' | 'expired' | 'escalated' | 'delegated'
  sortMode: 'created' | 'updated' | 'priority' | 'deadline' | 'status' | 'approver'
  groupMode: 'none' | 'status' | 'priority' | 'approver' | 'category' | 'deadline'
  
  // Search and filters
  searchQuery: string
  selectedCategories: string[]
  selectedPriorities: string[]
  selectedStatuses: string[]
  selectedApprovers: string[]
  selectedDates: { from: Date | null; to: Date | null }
  selectedTags: string[]
  
  // Analytics and metrics
  metrics: ApprovalMetrics | null
  analytics: ApprovalAnalytics | null
  insights: ApprovalInsights[]
  recommendations: ApprovalRecommendation[]
  reports: ApprovalReport[]
  
  // Configuration
  configuration: ApprovalConfiguration
  permissions: ApprovalPermission[]
  escalationRules: ApprovalEscalation[]
  delegationRules: ApprovalDelegation[]
  
  // Notifications and alerts
  notifications: ApprovalNotification[]
  reminders: ApprovalReminder[]
  alerts: any[]
  
  // Audit and history
  auditLog: ApprovalAudit[]
  history: ApprovalHistory[]
  traces: ApprovalTrace[]
  
  // Integration and automation
  integrations: ApprovalIntegration[]
  webhooks: ApprovalWebhook[]
  events: ApprovalEvent[]
  
  // UI preferences
  showNotifications: boolean
  showMetrics: boolean
  showHistory: boolean
  showAudit: boolean
  autoRefresh: boolean
  refreshInterval: number
  theme: 'light' | 'dark' | 'auto'
  density: 'compact' | 'normal' | 'comfortable'
  
  // Error and loading states
  error: string | null
  warnings: string[]
  isLoading: boolean
  progress: number
}

/**
 * ApprovalWorkflowEngine Component
 * 
 * Enterprise-grade approval workflow management component that provides comprehensive
 * approval process automation and management capabilities including:
 * - Workflow design and execution
 * - Multi-step approval processes
 * - Dynamic approval routing
 * - Escalation and delegation management
 * - Policy-based approval rules
 * - Real-time status tracking
 * - Analytics and reporting
 * - Audit trail and compliance
 * - Integration capabilities
 * - Notification management
 * - Performance optimization
 * - Security and permissions
 * 
 * This component integrates with the backend approval management system and provides
 * a sophisticated user interface for managing complex approval workflows.
 */
export const ApprovalWorkflowEngine: React.FC<{
  workflowId?: string
  organizationId?: string
  userId?: string
  permissions?: string[]
  onApprovalCompleted?: (request: ApprovalRequest) => void
  onWorkflowChanged?: (workflow: ApprovalWorkflow) => void
  allowCreation?: boolean
  allowModification?: boolean
  allowExecution?: boolean
  showAnalytics?: boolean
  enableNotifications?: boolean
  enableAudit?: boolean
  multiTenant?: boolean
}> = ({
  workflowId,
  organizationId,
  userId,
  permissions = [],
  onApprovalCompleted,
  onWorkflowChanged,
  allowCreation = true,
  allowModification = true,
  allowExecution = true,
  showAnalytics = true,
  enableNotifications = true,
  enableAudit = true,
  multiTenant = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<ApprovalWorkflowEngineState>({
    // Core approval state
    workflows: [],
    requests: [],
    responses: [],
    approvers: [],
    policies: [],
    templates: [],
    
    // Selected items
    selectedWorkflow: null,
    selectedRequest: null,
    selectedApprover: null,
    selectedPolicy: null,
    selectedTemplate: null,
    
    // Workflow operations
    isCreating: false,
    isExecuting: false,
    isPausing: false,
    isResuming: false,
    isCanceling: false,
    isRestarting: false,
    isCloning: false,
    isValidating: false,
    isOptimizing: false,
    isTesting: false,
    
    // Request operations
    isSubmitting: false,
    isProcessing: false,
    isApproving: false,
    isRejecting: false,
    isDelegating: false,
    isEscalating: false,
    isWithdrawing: false,
    isReassigning: false,
    
    // View state
    view: 'dashboard',
    subView: 'overview',
    displayMode: 'grid',
    filterMode: 'all',
    sortMode: 'created',
    groupMode: 'status',
    
    // Search and filters
    searchQuery: '',
    selectedCategories: [],
    selectedPriorities: [],
    selectedStatuses: [],
    selectedApprovers: [],
    selectedDates: { from: null, to: null },
    selectedTags: [],
    
    // Analytics and metrics
    metrics: null,
    analytics: null,
    insights: [],
    recommendations: [],
    reports: [],
    
    // Configuration
    configuration: {
      defaultTimeout: 7200, // 2 hours
      escalationTimeout: 14400, // 4 hours
      reminderInterval: 3600, // 1 hour
      maxApprovers: 10,
      requireComments: false,
      allowDelegation: true,
      allowWithdrawal: true,
      autoEscalation: true,
      parallelApproval: false,
      sequentialApproval: true,
      consensusRequired: false,
      majorityRequired: false,
      unanimousRequired: false,
      enableNotifications: enableNotifications,
      enableAudit: enableAudit,
      enableAnalytics: showAnalytics,
      enableIntegrations: true,
      enableWebhooks: true,
      enableAPI: true,
      securityLevel: 'high',
      complianceMode: 'strict',
      retentionPeriod: 2592000, // 30 days
      archivePeriod: 7776000, // 90 days
      encryptionEnabled: true,
      compressionEnabled: true,
      indexingEnabled: true,
      searchEnabled: true,
      reportingEnabled: true,
      monitoringEnabled: true,
      alertingEnabled: true,
      schedulingEnabled: true,
      automationEnabled: true,
      optimizationEnabled: true,
      mlEnabled: false,
      aiEnabled: false
    } as ApprovalConfiguration,
    permissions: [],
    escalationRules: [],
    delegationRules: [],
    
    // Notifications and alerts
    notifications: [],
    reminders: [],
    alerts: [],
    
    // Audit and history
    auditLog: [],
    history: [],
    traces: [],
    
    // Integration and automation
    integrations: [],
    webhooks: [],
    events: [],
    
    // UI preferences
    showNotifications: enableNotifications,
    showMetrics: showAnalytics,
    showHistory: true,
    showAudit: enableAudit,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    theme: 'auto',
    density: 'normal',
    
    // Error and loading states
    error: null,
    warnings: [],
    isLoading: false,
    progress: 0
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const workflowBuilderRef = useRef<any>(null)
  const dashboardRef = useRef<any>(null)
  const analyticsRef = useRef<any>(null)
  const auditRef = useRef<any>(null)

  // Hook integrations
  const {
    workflows,
    loading: workflowsLoading,
    error: workflowsError,
    refreshWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    cloneWorkflow
  } = useApprovalWorkflows(organizationId)

  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    refreshRequests,
    submitRequest,
    processRequest,
    approveRequest: approveRequestHook,
    rejectRequest: rejectRequestHook,
    delegateRequest: delegateRequestHook,
    escalateRequest: escalateRequestHook,
    withdrawRequest: withdrawRequestHook
  } = useApprovalRequests()

  const {
    policies,
    refreshPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    validatePolicy
  } = useApprovalPolicies()

  const {
    templates,
    refreshTemplates,
    createTemplate: createTemplateHook,
    updateTemplate: updateTemplateHook,
    deleteTemplate: deleteTemplateHook,
    applyTemplate: applyTemplateHook
  } = useApprovalTemplates()

  const {
    metrics,
    analytics,
    refreshMetrics,
    refreshAnalytics,
    generateReport: generateReportHook,
    calculateSLA,
    measureEfficiency
  } = useApprovalMetrics()

  const {
    notifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useApprovalNotifications(userId)

  const {
    auditLog,
    refreshAudit,
    logEvent,
    generateAuditReport
  } = useApprovalAudit()

  const {
    configuration,
    updateConfiguration,
    resetConfiguration
  } = useApprovalConfiguration()

  const {
    userPermissions,
    checkPermission,
    grantPermission,
    revokePermission
  } = useApprovalPermissions(userId)

  const {
    escalationRules,
    delegationRules,
    updateEscalationRules,
    updateDelegationRules
  } = useApprovalEscalation()

  const {
    reports,
    generateReport,
    scheduleReport,
    exportReport
  } = useApprovalReports()

  const {
    integrations,
    webhooks,
    refreshIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration
  } = useApprovalIntegrations()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredRequests = useMemo(() => {
    let result = state.requests

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(request =>
        request.title?.toLowerCase().includes(query) ||
        request.description?.toLowerCase().includes(query) ||
        request.category?.toLowerCase().includes(query) ||
        request.requester?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (state.filterMode !== 'all') {
      result = result.filter(request => {
        switch (state.filterMode) {
          case 'pending':
            return request.status === 'pending' || request.status === 'in_progress'
          case 'approved':
            return request.status === 'approved'
          case 'rejected':
            return request.status === 'rejected'
          case 'expired':
            return request.status === 'expired'
          case 'escalated':
            return request.isEscalated
          case 'delegated':
            return request.isDelegated
          default:
            return true
        }
      })
    }

    // Apply category filter
    if (state.selectedCategories.length > 0) {
      result = result.filter(request =>
        state.selectedCategories.includes(request.category || '')
      )
    }

    // Apply priority filter
    if (state.selectedPriorities.length > 0) {
      result = result.filter(request =>
        state.selectedPriorities.includes(request.priority)
      )
    }

    // Apply status filter
    if (state.selectedStatuses.length > 0) {
      result = result.filter(request =>
        state.selectedStatuses.includes(request.status)
      )
    }

    // Apply approver filter
    if (state.selectedApprovers.length > 0) {
      result = result.filter(request =>
        request.currentApprovers?.some(approver =>
          state.selectedApprovers.includes(approver.id)
        )
      )
    }

    // Apply date filter
    if (state.selectedDates.from || state.selectedDates.to) {
      result = result.filter(request => {
        const requestDate = new Date(request.createdAt)
        if (state.selectedDates.from && requestDate < state.selectedDates.from) {
          return false
        }
        if (state.selectedDates.to && requestDate > state.selectedDates.to) {
          return false
        }
        return true
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (state.sortMode) {
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          comparison = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          break
        case 'deadline':
          if (!a.deadline && !b.deadline) comparison = 0
          else if (!a.deadline) comparison = 1
          else if (!b.deadline) comparison = -1
          else comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'approver':
          const aApprover = a.currentApprovers?.[0]?.name || ''
          const bApprover = b.currentApprovers?.[0]?.name || ''
          comparison = aApprover.localeCompare(bApprover)
          break
        default:
          comparison = 0
      }
      return comparison
    })

    return result
  }, [
    state.requests, state.searchQuery, state.filterMode, state.selectedCategories,
    state.selectedPriorities, state.selectedStatuses, state.selectedApprovers,
    state.selectedDates, state.sortMode
  ])

  const requestStatistics = useMemo(() => {
    const requests = state.requests
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending' || r.status === 'in_progress').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      expired: requests.filter(r => r.status === 'expired').length,
      escalated: requests.filter(r => r.isEscalated).length,
      delegated: requests.filter(r => r.isDelegated).length,
      avgProcessingTime: requests.reduce((sum, r) => sum + (r.processingTime || 0), 0) / requests.length,
      slaCompliance: requests.filter(r => r.slaCompliant).length / requests.length * 100,
      approvalRate: requests.filter(r => r.status === 'approved').length / requests.length * 100,
      rejectionRate: requests.filter(r => r.status === 'rejected').length / requests.length * 100
    }
  }, [state.requests])

  const workflowStatistics = useMemo(() => {
    const workflows = state.workflows
    return {
      total: workflows.length,
      active: workflows.filter(w => w.status === 'active').length,
      inactive: workflows.filter(w => w.status === 'inactive').length,
      draft: workflows.filter(w => w.status === 'draft').length,
      avgSteps: workflows.reduce((sum, w) => sum + (w.steps?.length || 0), 0) / workflows.length,
      avgApprovers: workflows.reduce((sum, w) => sum + (w.approvers?.length || 0), 0) / workflows.length,
      avgDuration: workflows.reduce((sum, w) => sum + (w.avgDuration || 0), 0) / workflows.length,
      successRate: workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length
    }
  }, [state.workflows])

  const canCreateWorkflow = useMemo(() => {
    return allowCreation && checkPermission('create_workflow') && !state.isCreating
  }, [allowCreation, checkPermission, state.isCreating])

  const canModifyWorkflow = useMemo(() => {
    return allowModification && 
           state.selectedWorkflow && 
           checkPermission('modify_workflow') && 
           !state.isExecuting
  }, [allowModification, state.selectedWorkflow, checkPermission, state.isExecuting])

  const canExecuteWorkflow = useMemo(() => {
    return allowExecution && 
           state.selectedWorkflow && 
           checkPermission('execute_workflow') && 
           state.selectedWorkflow.status === 'active'
  }, [allowExecution, state.selectedWorkflow, checkPermission])

  const canApproveRequest = useMemo(() => {
    return state.selectedRequest && 
           checkPermission('approve_request') && 
           state.selectedRequest.currentApprovers?.some(a => a.id === userId) &&
           (state.selectedRequest.status === 'pending' || state.selectedRequest.status === 'in_progress')
  }, [state.selectedRequest, checkPermission, userId])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
      case 'in_progress': return 'text-blue-600'
      case 'expired': return 'text-gray-600'
      case 'escalated': return 'text-orange-600'
      case 'delegated': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'pending': return 'secondary'
      case 'in_progress': return 'outline'
      case 'expired': return 'outline'
      case 'escalated': return 'default'
      case 'delegated': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
    logEvent('view_changed', { view, userId })
  }, [logEvent, userId])

  const handleSubViewChange = useCallback((subView: typeof state.subView) => {
    setState(prev => ({ ...prev, subView }))
  }, [])

  const handleDisplayModeChange = useCallback((mode: typeof state.displayMode) => {
    setState(prev => ({ ...prev, displayMode: mode }))
  }, [])

  const handleWorkflowSelect = useCallback((workflow: ApprovalWorkflow) => {
    setState(prev => ({ ...prev, selectedWorkflow: workflow }))
    onWorkflowChanged?.(workflow)
    logEvent('workflow_selected', { workflowId: workflow.id, userId })
  }, [onWorkflowChanged, logEvent, userId])

  const handleRequestSelect = useCallback((request: ApprovalRequest) => {
    setState(prev => ({ ...prev, selectedRequest: request }))
    logEvent('request_selected', { requestId: request.id, userId })
  }, [logEvent, userId])

  const handleWorkflowCreate = useCallback(async (workflowData: Partial<ApprovalWorkflow>) => {
    if (!canCreateWorkflow) return

    try {
      setState(prev => ({ ...prev, isCreating: true, progress: 0 }))
      
      setState(prev => ({ ...prev, progress: 25 }))
      
      const newWorkflow = await createWorkflow({
        ...workflowData,
        organizationId: multiTenant ? organizationId : undefined,
        createdBy: userId,
        createdAt: new Date().toISOString()
      })
      
      setState(prev => ({ ...prev, progress: 75 }))
      
      setState(prev => ({
        ...prev,
        workflows: [...prev.workflows, newWorkflow],
        selectedWorkflow: newWorkflow,
        progress: 100
      }))
      
      logEvent('workflow_created', { workflowId: newWorkflow.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create workflow'
      }))
    } finally {
      setState(prev => ({ ...prev, isCreating: false, progress: 0 }))
    }
  }, [canCreateWorkflow, createWorkflow, multiTenant, organizationId, userId, logEvent])

  const handleWorkflowExecute = useCallback(async (workflow: ApprovalWorkflow, requestData: any) => {
    if (!canExecuteWorkflow) return

    try {
      setState(prev => ({ ...prev, isExecuting: true }))
      
      const request = await executeWorkflow(workflow.id, requestData)
      
      setState(prev => ({
        ...prev,
        requests: [...prev.requests, request]
      }))
      
      logEvent('workflow_executed', { workflowId: workflow.id, requestId: request.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute workflow'
      }))
    } finally {
      setState(prev => ({ ...prev, isExecuting: false }))
    }
  }, [canExecuteWorkflow, executeWorkflow, logEvent, userId])

  const handleRequestApprove = useCallback(async (request: ApprovalRequest, comment?: string) => {
    if (!canApproveRequest) return

    try {
      setState(prev => ({ ...prev, isApproving: true }))
      
      const updatedRequest = await approveRequestHook(request.id, {
        approverId: userId,
        comment,
        timestamp: new Date().toISOString()
      })
      
      setState(prev => ({
        ...prev,
        requests: prev.requests.map(r => r.id === request.id ? updatedRequest : r),
        selectedRequest: updatedRequest
      }))
      
      if (updatedRequest.status === 'approved') {
        onApprovalCompleted?.(updatedRequest)
      }
      
      logEvent('request_approved', { requestId: request.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to approve request'
      }))
    } finally {
      setState(prev => ({ ...prev, isApproving: false }))
    }
  }, [canApproveRequest, approveRequestHook, userId, onApprovalCompleted, logEvent])

  const handleRequestReject = useCallback(async (request: ApprovalRequest, comment: string) => {
    if (!canApproveRequest) return

    try {
      setState(prev => ({ ...prev, isRejecting: true }))
      
      const updatedRequest = await rejectRequestHook(request.id, {
        approverId: userId,
        comment,
        timestamp: new Date().toISOString()
      })
      
      setState(prev => ({
        ...prev,
        requests: prev.requests.map(r => r.id === request.id ? updatedRequest : r),
        selectedRequest: updatedRequest
      }))
      
      if (updatedRequest.status === 'rejected') {
        onApprovalCompleted?.(updatedRequest)
      }
      
      logEvent('request_rejected', { requestId: request.id, userId })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to reject request'
      }))
    } finally {
      setState(prev => ({ ...prev, isRejecting: false }))
    }
  }, [canApproveRequest, rejectRequestHook, userId, onApprovalCompleted, logEvent])

  const handleRequestDelegate = useCallback(async (request: ApprovalRequest, delegateeTo: string, comment?: string) => {
    try {
      setState(prev => ({ ...prev, isDelegating: true }))
      
      const updatedRequest = await delegateRequestHook(request.id, {
        fromApproverId: userId,
        toApproverId: delegateeTo,
        comment,
        timestamp: new Date().toISOString()
      })
      
      setState(prev => ({
        ...prev,
        requests: prev.requests.map(r => r.id === request.id ? updatedRequest : r),
        selectedRequest: updatedRequest
      }))
      
      logEvent('request_delegated', { requestId: request.id, fromUserId: userId, toUserId: delegateeTo })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delegate request'
      }))
    } finally {
      setState(prev => ({ ...prev, isDelegating: false }))
    }
  }, [delegateRequestHook, userId, logEvent])

  const handleRequestEscalate = useCallback(async (request: ApprovalRequest, escalateTo: string, comment?: string) => {
    try {
      setState(prev => ({ ...prev, isEscalating: true }))
      
      const updatedRequest = await escalateRequestHook(request.id, {
        escalatedBy: userId,
        escalatedTo: escalateTo,
        comment,
        timestamp: new Date().toISOString()
      })
      
      setState(prev => ({
        ...prev,
        requests: prev.requests.map(r => r.id === request.id ? updatedRequest : r),
        selectedRequest: updatedRequest
      }))
      
      logEvent('request_escalated', { requestId: request.id, escalatedBy: userId, escalatedTo })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to escalate request'
      }))
    } finally {
      setState(prev => ({ ...prev, isEscalating: false }))
    }
  }, [escalateRequestHook, userId, logEvent])

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const handleFilterChange = useCallback((filterType: string, values: string[]) => {
    setState(prev => {
      const newState = { ...prev }
      switch (filterType) {
        case 'categories':
          newState.selectedCategories = values
          break
        case 'priorities':
          newState.selectedPriorities = values
          break
        case 'statuses':
          newState.selectedStatuses = values
          break
        case 'approvers':
          newState.selectedApprovers = values
          break
        case 'tags':
          newState.selectedTags = values
          break
      }
      return newState
    })
  }, [])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        await Promise.all([
          refreshWorkflows(),
          refreshRequests(),
          refreshPolicies(),
          refreshTemplates(),
          showAnalytics ? refreshMetrics() : Promise.resolve(),
          enableNotifications ? refreshNotifications() : Promise.resolve(),
          enableAudit ? refreshAudit() : Promise.resolve()
        ])
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize data' 
        }))
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    initializeData()
  }, [
    organizationId, refreshWorkflows, refreshRequests, refreshPolicies, 
    refreshTemplates, refreshMetrics, refreshNotifications, refreshAudit,
    showAnalytics, enableNotifications, enableAudit
  ])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      workflows: workflows || [],
      requests: requests || [],
      policies: policies || [],
      templates: templates || [],
      metrics: metrics || null,
      analytics: analytics || null,
      notifications: notifications || [],
      auditLog: auditLog || [],
      integrations: integrations || [],
      webhooks: webhooks || []
    }))
  }, [workflows, requests, policies, templates, metrics, analytics, notifications, auditLog, integrations, webhooks])

  useEffect(() => {
    // Auto-refresh data
    if (state.autoRefresh) {
      const intervalId = setInterval(() => {
        refreshRequests()
        if (enableNotifications) refreshNotifications()
      }, state.refreshInterval)
      
      return () => clearInterval(intervalId)
    }
  }, [state.autoRefresh, state.refreshInterval, refreshRequests, refreshNotifications, enableNotifications])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Approval Workflows</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="approvers">Approvers</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            {showAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            {enableAudit && <TabsTrigger value="audit">Audit</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search..."
          value={state.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-64"
        />
        
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {canCreateWorkflow && (
          <Button onClick={() => handleWorkflowCreate({})}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        )}

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>

        {state.showNotifications && (
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {state.notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            )}
          </Button>
        )}
      </div>
    </div>
  )

  const renderDashboardCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total Requests</p>
              <p className="text-2xl font-bold">{requestStatistics.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{requestStatistics.pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold">{requestStatistics.approved}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold">{requestStatistics.rejected}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Approval Rate</p>
              <p className="text-2xl font-bold">{formatPercentage(requestStatistics.approvalRate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Avg Time</p>
              <p className="text-2xl font-bold">{formatDuration(requestStatistics.avgProcessingTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRequestCard = (request: ApprovalRequest) => (
    <Card 
      key={request.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        state.selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleRequestSelect(request)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base truncate">{request.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusVariant(request.status)}>
                {request.status}
              </Badge>
              <Badge variant={getPriorityVariant(request.priority)}>
                {request.priority}
              </Badge>
              {request.isEscalated && (
                <Badge variant="destructive">
                  <Flag className="h-3 w-3 mr-1" />
                  Escalated
                </Badge>
              )}
              {request.isDelegated && (
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  Delegated
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canApproveRequest && (
                <>
                  <DropdownMenuItem onClick={() => handleRequestApprove(request)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* Handle reject with comment */}}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </DropdownMenuItem>
              {request.currentApprovers?.some(a => a.id === userId) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="h-4 w-4 mr-2" />
                    Delegate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Escalate
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription className="text-sm line-clamp-2 mt-2">
          {request.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Requester and Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {request.requester?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{request.requester}</span>
            </div>
            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Current Approvers */}
          {request.currentApprovers && request.currentApprovers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Approvers:</span>
              <div className="flex -space-x-2">
                {request.currentApprovers.slice(0, 3).map((approver, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {approver.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {request.currentApprovers.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+{request.currentApprovers.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deadline */}
          {request.deadline && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`${
                new Date(request.deadline) < new Date() ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                Due: {new Date(request.deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Progress */}
          {request.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{request.progress}%</span>
              </div>
              <Progress value={request.progress} className="h-1" />
            </div>
          )}

          {/* Action buttons */}
          {canApproveRequest && (
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleRequestApprove(request)
                }}
                className="flex-1"
                disabled={state.isApproving}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle reject with comment dialog
                }}
                disabled={state.isRejecting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-background" ref={containerRef}>
      {renderToolbar()}
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={state.view} className="h-full flex flex-col">
          {/* Dashboard View */}
          <TabsContent value="dashboard" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              {renderDashboardCards()}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Requests</CardTitle>
                      <CardDescription>Latest approval requests requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-4">
                          {filteredRequests.slice(0, 5).map(renderRequestCard)}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">SLA Compliance</span>
                        <span className="text-sm font-medium">{formatPercentage(requestStatistics.slaCompliance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Processing Time</span>
                        <span className="text-sm font-medium">{formatDuration(requestStatistics.avgProcessingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Workflows</span>
                        <span className="text-sm font-medium">{workflowStatistics.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Approvers</span>
                        <span className="text-sm font-medium">{state.approvers.length}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notifications */}
                  {state.showNotifications && state.notifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Notifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {state.notifications.slice(0, 5).map((notification, index) => (
                              <div key={index} className={`p-2 rounded text-sm ${
                                notification.isRead ? 'bg-muted/50' : 'bg-muted'
                              }`}>
                                <p className="font-medium">{notification.title}</p>
                                <p className="text-muted-foreground text-xs">{notification.message}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Requests View */}
          <TabsContent value="requests" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                <div className="lg:col-span-3">
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    {state.displayMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequests.map(renderRequestCard)}
                      </div>
                    ) : state.displayMode === 'list' ? (
                      <div className="space-y-4">
                        {filteredRequests.map(renderRequestCard)}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredRequests.map(renderRequestCard)}
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                <div className="space-y-4">
                  {/* Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={state.filterMode} onValueChange={(value) => setState(prev => ({ ...prev, filterMode: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                            <SelectItem value="delegated">Delegated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Sort By</Label>
                        <Select value={state.sortMode} onValueChange={(value) => setState(prev => ({ ...prev, sortMode: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created">Created Date</SelectItem>
                            <SelectItem value="updated">Updated Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="deadline">Deadline</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="approver">Approver</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Selected Request Details */}
                  {state.selectedRequest && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Request Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label>Title</Label>
                            <p className="text-sm font-medium">{state.selectedRequest.title}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Badge variant={getStatusVariant(state.selectedRequest.status)}>
                              {state.selectedRequest.status}
                            </Badge>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Badge variant={getPriorityVariant(state.selectedRequest.priority)}>
                              {state.selectedRequest.priority}
                            </Badge>
                          </div>
                          <div>
                            <Label>Requester</Label>
                            <p className="text-sm">{state.selectedRequest.requester}</p>
                          </div>
                          <div>
                            <Label>Created</Label>
                            <p className="text-sm">{new Date(state.selectedRequest.createdAt).toLocaleDateString()}</p>
                          </div>
                          {state.selectedRequest.deadline && (
                            <div>
                              <Label>Deadline</Label>
                              <p className="text-sm">{new Date(state.selectedRequest.deadline).toLocaleDateString()}</p>
                            </div>
                          )}
                          {state.selectedRequest.description && (
                            <div>
                              <Label>Description</Label>
                              <p className="text-sm text-muted-foreground">
                                {state.selectedRequest.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other views would be implemented here */}
          <TabsContent value="workflows" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Management</CardTitle>
                  <CardDescription>
                    Design and manage approval workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 border rounded-md p-4">
                    <p className="text-muted-foreground text-center">Workflow designer will be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isLoading || state.isExecuting || state.isApproving || state.isRejecting) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="text-center">
              <p className="font-medium">
                {state.isLoading ? 'Loading data...' :
                 state.isExecuting ? 'Executing workflow...' :
                 state.isApproving ? 'Processing approval...' :
                 'Processing request...'}
              </p>
              {state.progress > 0 && (
                <div className="mt-2 w-64">
                  <Progress value={state.progress} />
                  <p className="text-sm text-muted-foreground mt-1">{state.progress}% complete</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="fixed bottom-4 left-4 w-80">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
            >
              Dismiss
            </Button>
          </Alert>
        </div>
      )}
    </div>
  )
}

export default ApprovalWorkflowEngine