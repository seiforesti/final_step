"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  FastForward,
  Workflow,
  GitBranch,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Monitor,
  TrendingUp,
  Users,
  Calendar,
  Database,
  Zap,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Bookmark,
  Tag,
  Link,
  Share2,
  MessageSquare,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Code,
  Terminal,
  Layers,
  Route,
  Shuffle,
  Split,
  Merge,
  GitCommit,
  GitPullRequest,
  History,
  Archive,
  Package,
  Shield,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Server,
  Globe,
  Cloud,
  Smartphone,
  Tablet,
  Laptop,
  Desktop
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Import types and services
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStage,
  WorkflowTask,
  WorkflowStatus,
  WorkflowType,
  StageStatus,
  TaskStatus,
  WorkflowTemplate,
  WorkflowMetrics,
  WorkflowNode,
  WorkflowEdge,
  WorkflowCondition,
  WorkflowTrigger,
  WorkflowApproval,
  WorkflowNotification,
  WorkflowVariable,
  WorkflowSchedule,
  WorkflowDependency,
  WorkflowResource,
  WorkflowError,
  WorkflowEvent,
  WorkflowAudit,
  WorkflowVersion,
  WorkflowComparison,
  WorkflowBenchmark,
  WorkflowOptimization,
  WorkflowPrediction,
  WorkflowInsight,
  WorkflowRecommendation,
  WorkflowAnalytics,
  WorkflowCollaboration,
  WorkflowSecurity,
  WorkflowCompliance,
  WorkflowGovernance
} from '../../types/workflow.types'

import {
  useWorkflowOrchestration,
  useWorkflowExecution,
  useWorkflowTemplates,
  useWorkflowMetrics,
  useWorkflowAnalytics,
  useWorkflowOptimization,
  useWorkflowCollaboration,
  useWorkflowSecurity,
  useWorkflowCompliance,
  useWorkflowGovernance,
  useWorkflowNotifications,
  useWorkflowScheduling,
  useWorkflowDependencies,
  useWorkflowResources,
  useWorkflowVersioning,
  useWorkflowAuditing,
  useWorkflowBenchmarking,
  useWorkflowPrediction,
  useWorkflowInsights,
  useWorkflowRecommendations
} from '../../hooks/useWorkflowManagement'

import {
  orchestrateWorkflow,
  executeWorkflow,
  pauseWorkflow,
  resumeWorkflow,
  cancelWorkflow,
  retryWorkflow,
  validateWorkflow,
  optimizeWorkflow,
  analyzeWorkflow,
  benchmarkWorkflow,
  predictWorkflow,
  recommendWorkflow,
  collaborateWorkflow,
  secureWorkflow,
  compliantWorkflow,
  governWorkflow,
  monitorWorkflow,
  alertWorkflow,
  scheduleWorkflow,
  dependWorkflow,
  resourceWorkflow,
  versionWorkflow,
  auditWorkflow,
  templateWorkflow,
  cloneWorkflow,
  exportWorkflow,
  importWorkflow,
  shareWorkflow,
  approveWorkflow,
  rejectWorkflow,
  escalateWorkflow,
  delegateWorkflow,
  notifyWorkflow,
  logWorkflow,
  traceWorkflow,
  debugWorkflow,
  profileWorkflow,
  tuneWorkflow,
  scaleWorkflow,
  migrateWorkflow,
  backupWorkflow,
  restoreWorkflow,
  archiveWorkflow,
  deleteWorkflow
} from '../../services/scan-workflow-apis'

import {
  WorkflowCanvas,
  WorkflowNodeEditor,
  WorkflowEdgeEditor,
  WorkflowPropertiesPanel,
  WorkflowToolbar,
  WorkflowMinimap,
  WorkflowZoomControls,
  WorkflowSearchPanel,
  WorkflowLayersPanel,
  WorkflowHistoryPanel,
  WorkflowVariablesPanel,
  WorkflowTriggersPanel,
  WorkflowConditionsPanel,
  WorkflowApprovalsPanel,
  WorkflowNotificationsPanel,
  WorkflowSchedulePanel,
  WorkflowDependenciesPanel,
  WorkflowResourcesPanel,
  WorkflowErrorsPanel,
  WorkflowEventsPanel,
  WorkflowAuditPanel,
  WorkflowVersionsPanel,
  WorkflowComparisonPanel,
  WorkflowBenchmarkPanel,
  WorkflowOptimizationPanel,
  WorkflowPredictionPanel,
  WorkflowInsightsPanel,
  WorkflowRecommendationsPanel,
  WorkflowAnalyticsPanel,
  WorkflowCollaborationPanel,
  WorkflowSecurityPanel,
  WorkflowCompliancePanel,
  WorkflowGovernancePanel
} from '../../components/workflow-canvas'

import {
  WorkflowExecutionMonitor,
  WorkflowExecutionTimeline,
  WorkflowExecutionLogs,
  WorkflowExecutionMetrics,
  WorkflowExecutionTrace,
  WorkflowExecutionProfile,
  WorkflowExecutionAlerts,
  WorkflowExecutionDashboard,
  WorkflowExecutionReports,
  WorkflowExecutionInsights
} from '../../components/workflow-execution'

import {
  WorkflowTemplate as TemplateComponent,
  WorkflowTemplateLibrary,
  WorkflowTemplateEditor,
  WorkflowTemplateValidator,
  WorkflowTemplatePublisher,
  WorkflowTemplateMarketplace,
  WorkflowTemplateReviews,
  WorkflowTemplateVersions,
  WorkflowTemplateAnalytics,
  WorkflowTemplateRecommendations
} from '../../components/workflow-templates'

import {
  formatDuration,
  formatBytes,
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  calculateWorkflowMetrics,
  calculateWorkflowEfficiency,
  calculateWorkflowROI,
  calculateWorkflowCost,
  calculateWorkflowRisk,
  calculateWorkflowComplexity,
  calculateWorkflowQuality,
  calculateWorkflowPerformance,
  optimizeWorkflowPath,
  predictWorkflowOutcome,
  recommendWorkflowImprovements,
  validateWorkflowCompliance,
  ensureWorkflowSecurity,
  enforceWorkflowGovernance,
  monitorWorkflowHealth,
  trackWorkflowProgress,
  logWorkflowActivity,
  auditWorkflowChanges,
  backupWorkflowState,
  restoreWorkflowState
} from '../../utils/workflow-engine'

import {
  WORKFLOW_TYPES,
  WORKFLOW_STATUSES,
  STAGE_TYPES,
  STAGE_STATUSES,
  TASK_TYPES,
  TASK_STATUSES,
  CONDITION_OPERATORS,
  TRIGGER_TYPES,
  APPROVAL_TYPES,
  NOTIFICATION_TYPES,
  SCHEDULE_TYPES,
  DEPENDENCY_TYPES,
  RESOURCE_TYPES,
  ERROR_TYPES,
  EVENT_TYPES,
  AUDIT_TYPES,
  VERSION_TYPES,
  COMPARISON_TYPES,
  BENCHMARK_TYPES,
  OPTIMIZATION_TYPES,
  PREDICTION_TYPES,
  INSIGHT_TYPES,
  RECOMMENDATION_TYPES,
  ANALYTICS_TYPES,
  COLLABORATION_TYPES,
  SECURITY_TYPES,
  COMPLIANCE_TYPES,
  GOVERNANCE_TYPES,
  DEFAULT_WORKFLOW_CONFIG,
  WORKFLOW_PERFORMANCE_THRESHOLDS,
  WORKFLOW_QUALITY_METRICS,
  WORKFLOW_SECURITY_POLICIES,
  WORKFLOW_COMPLIANCE_RULES,
  WORKFLOW_GOVERNANCE_STANDARDS
} from '../../constants/workflow-templates'

// Enhanced interfaces for advanced workflow orchestration
interface WorkflowOrchestratorState {
  // Core state
  workflows: WorkflowDefinition[]
  executions: WorkflowExecution[]
  templates: WorkflowTemplate[]
  selectedWorkflow: WorkflowDefinition | null
  selectedExecution: WorkflowExecution | null
  selectedTemplate: WorkflowTemplate | null
  
  // View state
  view: 'canvas' | 'list' | 'timeline' | 'analytics' | 'templates'
  layout: 'horizontal' | 'vertical' | 'grid' | 'auto'
  zoom: number
  pan: { x: number; y: number }
  selection: string[]
  filters: WorkflowFilter[]
  search: string
  sorting: WorkflowSorting
  grouping: WorkflowGrouping
  
  // Execution state
  isExecuting: boolean
  isPaused: boolean
  isCancelled: boolean
  isRetrying: boolean
  executionContext: any
  executionHistory: WorkflowEvent[]
  executionMetrics: WorkflowMetrics
  executionLogs: any[]
  executionTrace: any[]
  executionProfile: any
  executionAlerts: any[]
  
  // Editor state
  isEditing: boolean
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
  undoStack: any[]
  redoStack: any[]
  clipboard: any[]
  
  // Collaboration state
  collaborators: any[]
  comments: any[]
  reviews: any[]
  approvals: any[]
  notifications: any[]
  
  // Analytics state
  analytics: WorkflowAnalytics
  insights: WorkflowInsight[]
  recommendations: WorkflowRecommendation[]
  predictions: WorkflowPrediction[]
  benchmarks: WorkflowBenchmark[]
  optimizations: WorkflowOptimization[]
  
  // Security state
  permissions: any
  accessControl: any
  auditTrail: WorkflowAudit[]
  compliance: any
  governance: any
  
  // Performance state
  performance: any
  monitoring: any
  alerting: any
  health: any
  status: any
  
  // Configuration state
  config: any
  preferences: any
  settings: any
  themes: any
  plugins: any[]
}

interface WorkflowFilter {
  field: string
  operator: string
  value: any
  enabled: boolean
}

interface WorkflowSorting {
  field: string
  direction: 'asc' | 'desc'
  secondary?: WorkflowSorting
}

interface WorkflowGrouping {
  field: string
  direction: 'asc' | 'desc'
  expanded: string[]
}

interface WorkflowAction {
  type: string
  payload?: any
  timestamp: number
  user: string
  source: string
}

interface WorkflowEvent {
  id: string
  type: string
  timestamp: number
  source: string
  data: any
  metadata: any
}

interface WorkflowContext {
  workflow: WorkflowDefinition
  execution: WorkflowExecution
  variables: Record<string, any>
  resources: Record<string, any>
  dependencies: Record<string, any>
  security: any
  compliance: any
  governance: any
}

/**
 * WorkflowOrchestrator Component
 * 
 * Enterprise-grade workflow orchestration component that provides comprehensive
 * workflow management capabilities including:
 * - Visual workflow design and editing
 * - Real-time execution monitoring
 * - Advanced analytics and insights
 * - Collaboration and approval workflows
 * - Security and compliance enforcement
 * - Performance optimization
 * - Template management
 * - Version control
 * - Audit trail
 * - AI-powered recommendations
 * 
 * This component integrates with the backend workflow engine and provides
 * a sophisticated user interface for managing complex enterprise workflows.
 */
export const WorkflowOrchestrator: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<WorkflowOrchestratorState>({
    // Core state
    workflows: [],
    executions: [],
    templates: [],
    selectedWorkflow: null,
    selectedExecution: null,
    selectedTemplate: null,
    
    // View state
    view: 'canvas',
    layout: 'horizontal',
    zoom: 100,
    pan: { x: 0, y: 0 },
    selection: [],
    filters: [],
    search: '',
    sorting: { field: 'name', direction: 'asc' },
    grouping: { field: 'type', direction: 'asc', expanded: [] },
    
    // Execution state
    isExecuting: false,
    isPaused: false,
    isCancelled: false,
    isRetrying: false,
    executionContext: null,
    executionHistory: [],
    executionMetrics: {} as WorkflowMetrics,
    executionLogs: [],
    executionTrace: [],
    executionProfile: null,
    executionAlerts: [],
    
    // Editor state
    isEditing: false,
    isDirty: false,
    canUndo: false,
    canRedo: false,
    undoStack: [],
    redoStack: [],
    clipboard: [],
    
    // Collaboration state
    collaborators: [],
    comments: [],
    reviews: [],
    approvals: [],
    notifications: [],
    
    // Analytics state
    analytics: {} as WorkflowAnalytics,
    insights: [],
    recommendations: [],
    predictions: [],
    benchmarks: [],
    optimizations: [],
    
    // Security state
    permissions: null,
    accessControl: null,
    auditTrail: [],
    compliance: null,
    governance: null,
    
    // Performance state
    performance: null,
    monitoring: null,
    alerting: null,
    health: null,
    status: null,
    
    // Configuration state
    config: DEFAULT_WORKFLOW_CONFIG,
    preferences: {},
    settings: {},
    themes: {},
    plugins: []
  })

  // Refs for advanced functionality
  const canvasRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const monitorRef = useRef<any>(null)
  const analyticsRef = useRef<any>(null)
  const collaborationRef = useRef<any>(null)
  const securityRef = useRef<any>(null)
  const performanceRef = useRef<any>(null)
  const configRef = useRef<any>(null)

  // Hook integrations
  const {
    workflows,
    loading: workflowsLoading,
    error: workflowsError,
    refreshWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    cloneWorkflow,
    validateWorkflow: validateWorkflowHook,
    optimizeWorkflow: optimizeWorkflowHook
  } = useWorkflowOrchestration()

  const {
    executions,
    loading: executionsLoading,
    error: executionsError,
    refreshExecutions,
    executeWorkflow: executeWorkflowHook,
    pauseWorkflow: pauseWorkflowHook,
    resumeWorkflow: resumeWorkflowHook,
    cancelWorkflow: cancelWorkflowHook,
    retryWorkflow: retryWorkflowHook
  } = useWorkflowExecution()

  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    publishTemplate,
    installTemplate
  } = useWorkflowTemplates()

  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
    refreshMetrics,
    calculateMetrics,
    analyzePerformance,
    generateReport
  } = useWorkflowMetrics()

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    refreshAnalytics,
    generateInsights,
    predictOutcomes,
    recommendImprovements
  } = useWorkflowAnalytics()

  const {
    optimizations,
    loading: optimizationsLoading,
    error: optimizationsError,
    refreshOptimizations,
    optimizePerformance,
    optimizeResources,
    optimizeCosts
  } = useWorkflowOptimization()

  const {
    collaborators,
    loading: collaborationLoading,
    error: collaborationError,
    refreshCollaboration,
    inviteCollaborator,
    removeCollaborator,
    shareWorkflow,
    reviewWorkflow,
    approveWorkflow: approveWorkflowHook,
    rejectWorkflow: rejectWorkflowHook
  } = useWorkflowCollaboration()

  const {
    security,
    loading: securityLoading,
    error: securityError,
    refreshSecurity,
    validateSecurity,
    enforcePolicies,
    auditAccess
  } = useWorkflowSecurity()

  const {
    compliance,
    loading: complianceLoading,
    error: complianceError,
    refreshCompliance,
    validateCompliance,
    enforceCompliance,
    auditCompliance
  } = useWorkflowCompliance()

  const {
    governance,
    loading: governanceLoading,
    error: governanceError,
    refreshGovernance,
    validateGovernance,
    enforceGovernance,
    auditGovernance
  } = useWorkflowGovernance()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredWorkflows = useMemo(() => {
    let result = workflows || []

    // Apply search filter
    if (state.search) {
      const searchLower = state.search.toLowerCase()
      result = result.filter(workflow =>
        workflow.name.toLowerCase().includes(searchLower) ||
        workflow.description?.toLowerCase().includes(searchLower) ||
        workflow.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply field filters
    state.filters.forEach(filter => {
      if (filter.enabled) {
        result = result.filter(workflow => {
          const value = getNestedValue(workflow, filter.field)
          return applyFilter(value, filter.operator, filter.value)
        })
      }
    })

    // Apply sorting
    result.sort((a, b) => {
      const aValue = getNestedValue(a, state.sorting.field)
      const bValue = getNestedValue(b, state.sorting.field)
      const comparison = compareValues(aValue, bValue)
      return state.sorting.direction === 'asc' ? comparison : -comparison
    })

    return result
  }, [workflows, state.search, state.filters, state.sorting])

  const filteredExecutions = useMemo(() => {
    let result = executions || []

    // Apply workflow filter
    if (state.selectedWorkflow) {
      result = result.filter(execution => 
        execution.workflowId === state.selectedWorkflow?.id
      )
    }

    // Apply search filter
    if (state.search) {
      const searchLower = state.search.toLowerCase()
      result = result.filter(execution =>
        execution.id.toLowerCase().includes(searchLower) ||
        execution.status.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [executions, state.selectedWorkflow, state.search])

  const workflowStatistics = useMemo(() => {
    const workflows = filteredWorkflows
    const executions = filteredExecutions

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'active').length,
      totalExecutions: executions.length,
      runningExecutions: executions.filter(e => e.status === 'running').length,
      completedExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      averageExecutionTime: calculateAverageExecutionTime(executions),
      successRate: calculateSuccessRate(executions),
      totalDuration: calculateTotalDuration(executions),
      totalCost: calculateTotalCost(executions),
      efficiency: calculateEfficiency(executions),
      complexity: calculateComplexity(workflows),
      quality: calculateQuality(workflows),
      risk: calculateRisk(workflows),
      compliance: calculateCompliance(workflows),
      security: calculateSecurity(workflows),
      governance: calculateGovernance(workflows)
    }
  }, [filteredWorkflows, filteredExecutions])

  const currentExecution = useMemo(() => {
    if (!state.selectedWorkflow) return null
    return executions?.find(e => 
      e.workflowId === state.selectedWorkflow?.id && 
      e.status === 'running'
    ) || null
  }, [state.selectedWorkflow, executions])

  const executionProgress = useMemo(() => {
    if (!currentExecution) return 0
    const totalStages = currentExecution.stages?.length || 0
    const completedStages = currentExecution.stages?.filter(s => 
      s.status === 'completed'
    ).length || 0
    return totalStages > 0 ? (completedStages / totalStages) * 100 : 0
  }, [currentExecution])

  const canExecute = useMemo(() => {
    return state.selectedWorkflow &&
           state.selectedWorkflow.status === 'active' &&
           !state.isExecuting &&
           state.selectedWorkflow.stages?.length > 0
  }, [state.selectedWorkflow, state.isExecuting])

  const canPause = useMemo(() => {
    return currentExecution && 
           currentExecution.status === 'running' &&
           !state.isPaused
  }, [currentExecution, state.isPaused])

  const canResume = useMemo(() => {
    return currentExecution && 
           currentExecution.status === 'paused' &&
           state.isPaused
  }, [currentExecution, state.isPaused])

  const canCancel = useMemo(() => {
    return currentExecution && 
           ['running', 'paused'].includes(currentExecution.status)
  }, [currentExecution])

  const canRetry = useMemo(() => {
    return state.selectedExecution && 
           state.selectedExecution.status === 'failed'
  }, [state.selectedExecution])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const applyFilter = (value: any, operator: string, filterValue: any): boolean => {
    switch (operator) {
      case 'equals':
        return value === filterValue
      case 'not_equals':
        return value !== filterValue
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'starts_with':
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
      case 'ends_with':
        return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())
      case 'greater_than':
        return Number(value) > Number(filterValue)
      case 'less_than':
        return Number(value) < Number(filterValue)
      case 'greater_equal':
        return Number(value) >= Number(filterValue)
      case 'less_equal':
        return Number(value) <= Number(filterValue)
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value)
      case 'not_in':
        return Array.isArray(filterValue) && !filterValue.includes(value)
      case 'is_null':
        return value == null
      case 'is_not_null':
        return value != null
      case 'is_empty':
        return !value || (Array.isArray(value) && value.length === 0)
      case 'is_not_empty':
        return value && (!Array.isArray(value) || value.length > 0)
      default:
        return true
    }
  }

  const compareValues = (a: any, b: any): number => {
    if (a === b) return 0
    if (a == null) return -1
    if (b == null) return 1
    
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b)
    }
    
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b
    }
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime()
    }
    
    return String(a).localeCompare(String(b))
  }

  const calculateAverageExecutionTime = (executions: WorkflowExecution[]): number => {
    const completed = executions.filter(e => e.status === 'completed')
    if (completed.length === 0) return 0
    
    const totalTime = completed.reduce((sum, execution) => {
      const start = new Date(execution.startTime).getTime()
      const end = new Date(execution.endTime || execution.updatedAt).getTime()
      return sum + (end - start)
    }, 0)
    
    return totalTime / completed.length
  }

  const calculateSuccessRate = (executions: WorkflowExecution[]): number => {
    if (executions.length === 0) return 0
    const successful = executions.filter(e => e.status === 'completed').length
    return (successful / executions.length) * 100
  }

  const calculateTotalDuration = (executions: WorkflowExecution[]): number => {
    return executions.reduce((sum, execution) => {
      if (execution.status === 'completed') {
        const start = new Date(execution.startTime).getTime()
        const end = new Date(execution.endTime || execution.updatedAt).getTime()
        return sum + (end - start)
      }
      return sum
    }, 0)
  }

  const calculateTotalCost = (executions: WorkflowExecution[]): number => {
    return executions.reduce((sum, execution) => sum + (execution.cost || 0), 0)
  }

  const calculateEfficiency = (executions: WorkflowExecution[]): number => {
    const completed = executions.filter(e => e.status === 'completed')
    if (completed.length === 0) return 0
    
    const totalEfficiency = completed.reduce((sum, execution) => {
      return sum + (execution.efficiency || 0)
    }, 0)
    
    return totalEfficiency / completed.length
  }

  const calculateComplexity = (workflows: WorkflowDefinition[]): number => {
    if (workflows.length === 0) return 0
    
    const totalComplexity = workflows.reduce((sum, workflow) => {
      const stageCount = workflow.stages?.length || 0
      const taskCount = workflow.stages?.reduce((taskSum, stage) => 
        taskSum + (stage.tasks?.length || 0), 0) || 0
      const conditionCount = workflow.conditions?.length || 0
      const dependencyCount = workflow.dependencies?.length || 0
      
      return sum + (stageCount + taskCount + conditionCount + dependencyCount)
    }, 0)
    
    return totalComplexity / workflows.length
  }

  const calculateQuality = (workflows: WorkflowDefinition[]): number => {
    if (workflows.length === 0) return 0
    
    const totalQuality = workflows.reduce((sum, workflow) => {
      let qualityScore = 0
      
      // Check for documentation
      if (workflow.description) qualityScore += 20
      if (workflow.tags && workflow.tags.length > 0) qualityScore += 10
      
      // Check for error handling
      const hasErrorHandling = workflow.stages?.some(stage =>
        stage.tasks?.some(task => task.errorHandling)
      )
      if (hasErrorHandling) qualityScore += 20
      
      // Check for validation
      if (workflow.validation) qualityScore += 20
      
      // Check for monitoring
      if (workflow.monitoring) qualityScore += 15
      
      // Check for security
      if (workflow.security) qualityScore += 15
      
      return sum + qualityScore
    }, 0)
    
    return totalQuality / workflows.length
  }

  const calculateRisk = (workflows: WorkflowDefinition[]): number => {
    if (workflows.length === 0) return 0
    
    const totalRisk = workflows.reduce((sum, workflow) => {
      let riskScore = 0
      
      // High complexity increases risk
      const complexity = (workflow.stages?.length || 0) + 
                        (workflow.conditions?.length || 0) +
                        (workflow.dependencies?.length || 0)
      riskScore += Math.min(complexity * 5, 50)
      
      // External dependencies increase risk
      const externalDeps = workflow.dependencies?.filter(dep => 
        dep.type === 'external'
      ).length || 0
      riskScore += externalDeps * 10
      
      // Lack of error handling increases risk
      const hasErrorHandling = workflow.stages?.some(stage =>
        stage.tasks?.some(task => task.errorHandling)
      )
      if (!hasErrorHandling) riskScore += 30
      
      // Lack of monitoring increases risk
      if (!workflow.monitoring) riskScore += 20
      
      return sum + Math.min(riskScore, 100)
    }, 0)
    
    return totalRisk / workflows.length
  }

  const calculateCompliance = (workflows: WorkflowDefinition[]): number => {
    if (workflows.length === 0) return 0
    
    const totalCompliance = workflows.reduce((sum, workflow) => {
      let complianceScore = 0
      
      // Check for audit trail
      if (workflow.auditTrail) complianceScore += 25
      
      // Check for access control
      if (workflow.accessControl) complianceScore += 25
      
      // Check for data protection
      if (workflow.dataProtection) complianceScore += 25
      
      // Check for regulatory compliance
      if (workflow.regulatoryCompliance) complianceScore += 25
      
      return sum + complianceScore
    }, 0)
    
    return totalCompliance / workflows.length
  }

  const calculateSecurity = (workflows: WorkflowDefinition[]): number => {
    if (workflows.length === 0) return 0
    
    const totalSecurity = workflows.reduce((sum, workflow) => {
      let securityScore = 0
      
      // Check for encryption
      if (workflow.encryption) securityScore += 20
      
      // Check for authentication
      if (workflow.authentication) securityScore += 20
      
      // Check for authorization
      if (workflow.authorization) securityScore += 20
      
      // Check for input validation
      if (workflow.inputValidation) securityScore += 20
      
      // Check for secure communication
      if (workflow.secureCommunication) securityScore += 20
      
      return sum + securityScore
    }, 0)
    
    return totalSecurity / workflows.length
  }

  const calculateGovernance = (workflows: WorkflowDefinition[]): number => {
    if (workflows.length === 0) return 0
    
    const totalGovernance = workflows.reduce((sum, workflow) => {
      let governanceScore = 0
      
      // Check for policy compliance
      if (workflow.policyCompliance) governanceScore += 20
      
      // Check for approval workflow
      if (workflow.approvalWorkflow) governanceScore += 20
      
      // Check for change management
      if (workflow.changeManagement) governanceScore += 20
      
      // Check for documentation
      if (workflow.documentation) governanceScore += 20
      
      // Check for versioning
      if (workflow.versioning) governanceScore += 20
      
      return sum + governanceScore
    }, 0)
    
    return totalGovernance / workflows.length
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleWorkflowSelect = useCallback((workflow: WorkflowDefinition) => {
    setState(prev => ({
      ...prev,
      selectedWorkflow: workflow,
      selectedExecution: null
    }))
  }, [])

  const handleExecutionSelect = useCallback((execution: WorkflowExecution) => {
    setState(prev => ({
      ...prev,
      selectedExecution: execution
    }))
  }, [])

  const handleTemplateSelect = useCallback((template: WorkflowTemplate) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template
    }))
  }, [])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({
      ...prev,
      view
    }))
  }, [])

  const handleLayoutChange = useCallback((layout: typeof state.layout) => {
    setState(prev => ({
      ...prev,
      layout
    }))
  }, [])

  const handleZoomChange = useCallback((zoom: number) => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(10, Math.min(500, zoom))
    }))
  }, [])

  const handlePanChange = useCallback((pan: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      pan
    }))
  }, [])

  const handleSelectionChange = useCallback((selection: string[]) => {
    setState(prev => ({
      ...prev,
      selection
    }))
  }, [])

  const handleFilterChange = useCallback((filters: WorkflowFilter[]) => {
    setState(prev => ({
      ...prev,
      filters
    }))
  }, [])

  const handleSearchChange = useCallback((search: string) => {
    setState(prev => ({
      ...prev,
      search
    }))
  }, [])

  const handleSortingChange = useCallback((sorting: WorkflowSorting) => {
    setState(prev => ({
      ...prev,
      sorting
    }))
  }, [])

  const handleGroupingChange = useCallback((grouping: WorkflowGrouping) => {
    setState(prev => ({
      ...prev,
      grouping
    }))
  }, [])

  const handleExecuteWorkflow = useCallback(async () => {
    if (!state.selectedWorkflow || !canExecute) return

    try {
      setState(prev => ({ ...prev, isExecuting: true }))
      
      const execution = await executeWorkflowHook(state.selectedWorkflow.id, {
        variables: state.executionContext?.variables || {},
        resources: state.executionContext?.resources || {},
        options: state.executionContext?.options || {}
      })

      setState(prev => ({
        ...prev,
        selectedExecution: execution,
        executionHistory: [
          ...prev.executionHistory,
          {
            id: `${Date.now()}`,
            type: 'execution_started',
            timestamp: Date.now(),
            source: 'orchestrator',
            data: { executionId: execution.id, workflowId: state.selectedWorkflow?.id },
            metadata: { user: 'current_user' }
          }
        ]
      }))

      // Start real-time monitoring
      startExecutionMonitoring(execution.id)
      
    } catch (error) {
      console.error('Failed to execute workflow:', error)
      // Handle error
    } finally {
      setState(prev => ({ ...prev, isExecuting: false }))
    }
  }, [state.selectedWorkflow, canExecute, executeWorkflowHook, state.executionContext])

  const handlePauseWorkflow = useCallback(async () => {
    if (!currentExecution || !canPause) return

    try {
      await pauseWorkflowHook(currentExecution.id)
      setState(prev => ({ ...prev, isPaused: true }))
    } catch (error) {
      console.error('Failed to pause workflow:', error)
    }
  }, [currentExecution, canPause, pauseWorkflowHook])

  const handleResumeWorkflow = useCallback(async () => {
    if (!currentExecution || !canResume) return

    try {
      await resumeWorkflowHook(currentExecution.id)
      setState(prev => ({ ...prev, isPaused: false }))
    } catch (error) {
      console.error('Failed to resume workflow:', error)
    }
  }, [currentExecution, canResume, resumeWorkflowHook])

  const handleCancelWorkflow = useCallback(async () => {
    if (!currentExecution || !canCancel) return

    try {
      await cancelWorkflowHook(currentExecution.id)
      setState(prev => ({ ...prev, isCancelled: true }))
      stopExecutionMonitoring()
    } catch (error) {
      console.error('Failed to cancel workflow:', error)
    }
  }, [currentExecution, canCancel, cancelWorkflowHook])

  const handleRetryWorkflow = useCallback(async () => {
    if (!state.selectedExecution || !canRetry) return

    try {
      setState(prev => ({ ...prev, isRetrying: true }))
      const execution = await retryWorkflowHook(state.selectedExecution.id)
      setState(prev => ({ ...prev, selectedExecution: execution }))
      startExecutionMonitoring(execution.id)
    } catch (error) {
      console.error('Failed to retry workflow:', error)
    } finally {
      setState(prev => ({ ...prev, isRetrying: false }))
    }
  }, [state.selectedExecution, canRetry, retryWorkflowHook])

  const handleCreateWorkflow = useCallback(async () => {
    try {
      const workflow = await createWorkflow({
        name: 'New Workflow',
        type: WorkflowType.SIMPLE,
        description: 'A new workflow',
        stages: [],
        conditions: [],
        dependencies: [],
        variables: {},
        configuration: DEFAULT_WORKFLOW_CONFIG
      })
      
      setState(prev => ({
        ...prev,
        selectedWorkflow: workflow,
        isEditing: true
      }))
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }, [createWorkflow])

  const handleUpdateWorkflow = useCallback(async (updates: Partial<WorkflowDefinition>) => {
    if (!state.selectedWorkflow) return

    try {
      const workflow = await updateWorkflow(state.selectedWorkflow.id, updates)
      setState(prev => ({
        ...prev,
        selectedWorkflow: workflow,
        isDirty: false
      }))
    } catch (error) {
      console.error('Failed to update workflow:', error)
    }
  }, [state.selectedWorkflow, updateWorkflow])

  const handleDeleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId)
      setState(prev => ({
        ...prev,
        selectedWorkflow: prev.selectedWorkflow?.id === workflowId ? null : prev.selectedWorkflow
      }))
    } catch (error) {
      console.error('Failed to delete workflow:', error)
    }
  }, [deleteWorkflow])

  const handleCloneWorkflow = useCallback(async (workflowId: string) => {
    try {
      const workflow = await cloneWorkflow(workflowId)
      setState(prev => ({
        ...prev,
        selectedWorkflow: workflow,
        isEditing: true
      }))
    } catch (error) {
      console.error('Failed to clone workflow:', error)
    }
  }, [cloneWorkflow])

  const handleValidateWorkflow = useCallback(async () => {
    if (!state.selectedWorkflow) return

    try {
      const validation = await validateWorkflowHook(state.selectedWorkflow.id)
      // Handle validation results
      setState(prev => ({
        ...prev,
        executionContext: {
          ...prev.executionContext,
          validation
        }
      }))
    } catch (error) {
      console.error('Failed to validate workflow:', error)
    }
  }, [state.selectedWorkflow, validateWorkflowHook])

  const handleOptimizeWorkflow = useCallback(async () => {
    if (!state.selectedWorkflow) return

    try {
      const optimization = await optimizeWorkflowHook(state.selectedWorkflow.id)
      // Handle optimization results
      setState(prev => ({
        ...prev,
        optimizations: [...prev.optimizations, optimization]
      }))
    } catch (error) {
      console.error('Failed to optimize workflow:', error)
    }
  }, [state.selectedWorkflow, optimizeWorkflowHook])

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  const startExecutionMonitoring = useCallback((executionId: string) => {
    // Implementation for real-time execution monitoring
    // This would typically involve WebSocket connections or Server-Sent Events
    const monitoringInterval = setInterval(async () => {
      try {
        // Fetch updated execution data
        const updatedExecution = await fetchExecutionDetails(executionId)
        setState(prev => ({
          ...prev,
          selectedExecution: updatedExecution,
          executionMetrics: calculateWorkflowMetrics(updatedExecution),
          executionLogs: [...prev.executionLogs, ...updatedExecution.logs || []],
          executionTrace: [...prev.executionTrace, ...updatedExecution.trace || []],
          executionAlerts: [...prev.executionAlerts, ...updatedExecution.alerts || []]
        }))

        // Stop monitoring if execution is complete
        if (['completed', 'failed', 'cancelled'].includes(updatedExecution.status)) {
          clearInterval(monitoringInterval)
          setState(prev => ({ ...prev, isExecuting: false }))
        }
      } catch (error) {
        console.error('Failed to fetch execution details:', error)
      }
    }, 1000)

    // Store interval ID for cleanup
    setState(prev => ({
      ...prev,
      monitoring: { ...prev.monitoring, interval: monitoringInterval }
    }))
  }, [])

  const stopExecutionMonitoring = useCallback(() => {
    if (state.monitoring?.interval) {
      clearInterval(state.monitoring.interval)
      setState(prev => ({
        ...prev,
        monitoring: { ...prev.monitoring, interval: null }
      }))
    }
  }, [state.monitoring])

  const fetchExecutionDetails = async (executionId: string): Promise<WorkflowExecution> => {
    // This would be implemented to fetch real-time execution data
    // For now, return a placeholder
    return {} as WorkflowExecution
  }

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize component
    refreshWorkflows()
    refreshExecutions()
    refreshTemplates()
    refreshMetrics()
    refreshAnalytics()
  }, [])

  useEffect(() => {
    // Update workflows state
    setState(prev => ({
      ...prev,
      workflows: workflows || []
    }))
  }, [workflows])

  useEffect(() => {
    // Update executions state
    setState(prev => ({
      ...prev,
      executions: executions || []
    }))
  }, [executions])

  useEffect(() => {
    // Update templates state
    setState(prev => ({
      ...prev,
      templates: templates || []
    }))
  }, [templates])

  useEffect(() => {
    // Update metrics state
    setState(prev => ({
      ...prev,
      executionMetrics: metrics || {}
    }))
  }, [metrics])

  useEffect(() => {
    // Update analytics state
    setState(prev => ({
      ...prev,
      analytics: analytics || {}
    }))
  }, [analytics])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopExecutionMonitoring()
    }
  }, [stopExecutionMonitoring])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderWorkflowCard = (workflow: WorkflowDefinition) => (
    <Card 
      key={workflow.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        state.selectedWorkflow?.id === workflow.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleWorkflowSelect(workflow)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Workflow className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">{workflow.name}</CardTitle>
          </div>
          <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
            {workflow.status}
          </Badge>
        </div>
        {workflow.description && (
          <CardDescription className="text-sm">
            {workflow.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Layers className="h-4 w-4" />
              <span>{workflow.stages?.length || 0} stages</span>
            </span>
            <span className="flex items-center space-x-1">
              <GitBranch className="h-4 w-4" />
              <span>{workflow.conditions?.length || 0} conditions</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeTime(workflow.updatedAt)}</span>
          </span>
        </div>
        {workflow.tags && workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {workflow.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {workflow.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{workflow.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderExecutionCard = (execution: WorkflowExecution) => (
    <Card 
      key={execution.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        state.selectedExecution?.id === execution.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleExecutionSelect(execution)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">
              Execution {execution.id.slice(-8)}
            </CardTitle>
          </div>
          <Badge 
            variant={
              execution.status === 'completed' ? 'default' :
              execution.status === 'running' ? 'secondary' :
              execution.status === 'failed' ? 'destructive' :
              'outline'
            }
          >
            {execution.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {execution.status === 'running' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(executionProgress)}%</span>
              </div>
              <Progress value={executionProgress} className="h-2" />
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Started {formatRelativeTime(execution.startTime)}</span>
            </span>
            {execution.endTime && (
              <span className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Duration: {formatDuration(
                    new Date(execution.endTime).getTime() - 
                    new Date(execution.startTime).getTime()
                  )}
                </span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTemplateCard = (template: WorkflowTemplate) => (
    <Card 
      key={template.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        state.selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleTemplateSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">{template.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{template.rating || 0}</span>
          </div>
        </div>
        {template.description && (
          <CardDescription className="text-sm">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{template.downloads || 0} downloads</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeTime(template.updatedAt)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Workflow className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Workflows</p>
              <p className="text-2xl font-bold">{workflowStatistics.totalWorkflows}</p>
              <p className="text-xs text-muted-foreground">
                {workflowStatistics.activeWorkflows} active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Executions</p>
              <p className="text-2xl font-bold">{workflowStatistics.totalExecutions}</p>
              <p className="text-xs text-muted-foreground">
                {workflowStatistics.runningExecutions} running
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Success Rate</p>
              <p className="text-2xl font-bold">
                {formatPercentage(workflowStatistics.successRate)}
              </p>
              <p className="text-xs text-muted-foreground">
                {workflowStatistics.completedExecutions} completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Avg Duration</p>
              <p className="text-2xl font-bold">
                {formatDuration(workflowStatistics.averageExecutionTime)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDuration(workflowStatistics.totalDuration)} total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Efficiency</p>
              <p className="text-2xl font-bold">
                {formatPercentage(workflowStatistics.efficiency)}
              </p>
              <p className="text-xs text-muted-foreground">
                Quality: {formatPercentage(workflowStatistics.quality)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Risk Score</p>
              <p className="text-2xl font-bold">
                {formatPercentage(workflowStatistics.risk)}
              </p>
              <p className="text-xs text-muted-foreground">
                Security: {formatPercentage(workflowStatistics.security)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Workflow Orchestrator</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search workflows..."
            value={state.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateWorkflow}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create new workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExecuteWorkflow}
                  disabled={!canExecute}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Execute workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseWorkflow}
                  disabled={!canPause}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pause workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResumeWorkflow}
                  disabled={!canResume}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resume workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelWorkflow}
                  disabled={!canCancel}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cancel workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryWorkflow}
                  disabled={!canRetry}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Retry workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>View Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleLayoutChange('horizontal')}>
              Horizontal Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLayoutChange('vertical')}>
              Vertical Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLayoutChange('grid')}>
              Grid Layout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleZoomChange(state.zoom + 25)}>
              Zoom In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleZoomChange(state.zoom - 25)}>
              Zoom Out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleZoomChange(100)}>
              Reset Zoom
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-screen flex flex-col bg-background">
      {renderToolbar()}
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Statistics Overview */}
          <div className="p-4 border-b">
            {renderStatisticsCards()}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={state.view} className="h-full flex flex-col">
              {/* Canvas View */}
              <TabsContent value="canvas" className="flex-1 overflow-hidden">
                <div className="h-full flex">
                  {/* Workflow Canvas */}
                  <div className="flex-1 relative" ref={canvasRef}>
                    {state.selectedWorkflow ? (
                      <WorkflowCanvas
                        workflow={state.selectedWorkflow}
                        execution={currentExecution}
                        zoom={state.zoom}
                        pan={state.pan}
                        selection={state.selection}
                        onZoomChange={handleZoomChange}
                        onPanChange={handlePanChange}
                        onSelectionChange={handleSelectionChange}
                        onWorkflowChange={handleUpdateWorkflow}
                        editable={state.isEditing}
                        theme={state.themes.canvas}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Workflow className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-lg font-medium">No workflow selected</p>
                          <p className="text-sm">Select a workflow to view its canvas</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Panels */}
                  <div className="w-80 border-l flex flex-col">
                    <Tabs defaultValue="workflows" className="flex-1 flex flex-col">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="workflows">Workflows</TabsTrigger>
                        <TabsTrigger value="executions">Executions</TabsTrigger>
                        <TabsTrigger value="properties">Properties</TabsTrigger>
                      </TabsList>

                      <TabsContent value="workflows" className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                          <div className="space-y-4">
                            {filteredWorkflows.map(renderWorkflowCard)}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="executions" className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                          <div className="space-y-4">
                            {filteredExecutions.map(renderExecutionCard)}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="properties" className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                          {state.selectedWorkflow && (
                            <WorkflowPropertiesPanel
                              workflow={state.selectedWorkflow}
                              execution={currentExecution}
                              onWorkflowChange={handleUpdateWorkflow}
                              editable={state.isEditing}
                            />
                          )}
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWorkflows.map(renderWorkflowCard)}
                  </div>
                </div>
              </TabsContent>

              {/* Timeline View */}
              <TabsContent value="timeline" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <WorkflowExecutionTimeline
                    executions={filteredExecutions}
                    selectedExecution={state.selectedExecution}
                    onExecutionSelect={handleExecutionSelect}
                  />
                </div>
              </TabsContent>

              {/* Analytics View */}
              <TabsContent value="analytics" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <WorkflowAnalyticsPanel
                    workflows={filteredWorkflows}
                    executions={filteredExecutions}
                    analytics={state.analytics}
                    insights={state.insights}
                    recommendations={state.recommendations}
                    predictions={state.predictions}
                    benchmarks={state.benchmarks}
                    optimizations={state.optimizations}
                  />
                </div>
              </TabsContent>

              {/* Templates View */}
              <TabsContent value="templates" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <WorkflowTemplateLibrary
                    templates={templates}
                    selectedTemplate={state.selectedTemplate}
                    onTemplateSelect={handleTemplateSelect}
                    onTemplateInstall={installTemplate}
                    onTemplateCreate={createTemplate}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Execution Monitor Overlay */}
      <AnimatePresence>
        {currentExecution && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 w-80"
          >
            <WorkflowExecutionMonitor
              execution={currentExecution}
              metrics={state.executionMetrics}
              logs={state.executionLogs}
              trace={state.executionTrace}
              alerts={state.executionAlerts}
              onPause={handlePauseWorkflow}
              onResume={handleResumeWorkflow}
              onCancel={handleCancelWorkflow}
              onClose={() => setState(prev => ({ ...prev, selectedExecution: null }))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading States */}
      {(workflowsLoading || executionsLoading || templatesLoading) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading workflows...</span>
          </div>
        </div>
      )}

      {/* Error States */}
      {(workflowsError || executionsError || templatesError) && (
        <Alert className="fixed bottom-4 left-4 w-80" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {workflowsError || executionsError || templatesError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default WorkflowOrchestrator