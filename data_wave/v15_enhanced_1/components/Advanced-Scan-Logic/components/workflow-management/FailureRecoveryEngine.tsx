"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldAlert, ShieldCheckIcon, ShieldX, AlertTriangle, AlertCircle, Info, Warning, CheckCircle, XCircle, Clock, Timer, Stopwatch, RotateCcw, RefreshCw, Rewind, FastForward, Play, Pause, Square, StopCircle, Activity, Zap, Target, TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Settings, Sliders, Filter, Search, Sort, Eye, EyeOff, Edit, Trash2, Copy, Download, Upload, Save, FileText, File, Folder, Archive, History, GitBranch, GitCommit, GitMerge, GitPullRequest, Share2, Link, Unlink, Network, Route, Split, Merge, Shuffle, Layers, Component, Package, Code, Terminal, Database, Server, Cloud, Cpu, HardDrive, Wifi, Globe, MapPin, Navigation, Compass, Map, Plus, Minus, X, Check, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, MoreHorizontal, MoreVertical, Maximize2, Minimize2, ZoomIn, ZoomOut, Move, MousePointer, Hand, Crosshair, Grid, List, Calendar, CalendarDays, CalendarClock, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, Bell, BellOff, BellRing, Notification, MessageSquare, MessageCircle, Mail, Send, Users, User, UserCheck, UserX, UserPlus, UserMinus, Crown, Award, Medal, Trophy, Star, Heart, ThumbsUp, ThumbsDown, Flag, Bookmark, Tag, Hash, AtSign, Percent, DollarSign, PoundSterling, Euro, Yen, Bitcoin, CreditCard, Banknote, Coins, Calculator, Lock, Unlock, Key, ShieldClose, ShieldEllipsis, ShieldHalf, ShieldMinus, ShieldOff, ShieldPlus, ShieldQuestion, Smile, Frown, Meh, Angry, Laughing, HelpCircle, QuestionMark, ExclamationMark } from 'lucide-react'

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
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Import types and services
import {
  WorkflowFailure,
  WorkflowRecovery,
  FailureType,
  FailureSeverity,
  RecoveryStrategy,
  RecoveryAction,
  RecoveryStatus,
  FailurePattern,
  FailureThreshold,
  RecoveryPolicy,
  CircuitBreakerState,
  RetryConfiguration,
  FallbackConfiguration,
  FailoverConfiguration,
  RollbackConfiguration,
  CompensationConfiguration,
  FailureDetection,
  FailureAnalysis,
  FailureMetrics,
  RecoveryMetrics,
  FailureReport,
  RecoveryReport,
  FailureAlert,
  RecoveryAlert,
  FailureNotification,
  RecoveryNotification,
  FailureAudit,
  RecoveryAudit,
  FailureHistory,
  RecoveryHistory,
  FailureInsight,
  RecoveryInsight,
  FailureRecommendation,
  RecoveryRecommendation,
  FailureConfiguration,
  RecoveryConfiguration,
  FailureTemplate,
  RecoveryTemplate,
  FailureContext,
  RecoveryContext
} from '../../types/workflow.types'

import {
  useFailureRecovery,
  useFailureDetection,
  useFailureAnalysis,
  useRecoveryStrategies,
  useCircuitBreaker,
  useRetryPolicies,
  useFallbackPolicies,
  useFailoverPolicies,
  useRollbackPolicies,
  useCompensationPolicies,
  useFailureMonitoring,
  useRecoveryMonitoring,
  useFailureReporting,
  useRecoveryReporting,
  useFailureAlerting,
  useRecoveryAlerting,
  useFailureNotifications,
  useRecoveryNotifications,
  useFailureAuditing,
  useRecoveryAuditing,
  useFailureHistory,
  useRecoveryHistory,
  useFailureInsights,
  useRecoveryInsights,
  useFailureRecommendations,
  useRecoveryRecommendations,
  useFailureTemplates,
  useRecoveryTemplates
} from '../../hooks/useWorkflowManagement'

import {
  detectFailure,
  analyzeFailure,
  triggerRecovery,
  executeRecovery,
  validateRecovery,
  monitorRecovery,
  reportFailure,
  reportRecovery,
  alertFailure,
  alertRecovery,
  notifyFailure,
  notifyRecovery,
  auditFailure,
  auditRecovery,
  logFailure,
  logRecovery,
  trackFailure,
  trackRecovery,
  createFailureTemplate,
  createRecoveryTemplate,
  applyFailureTemplate,
  applyRecoveryTemplate,
  configureFailurePolicy,
  configureRecoveryPolicy,
  executeRetryStrategy,
  executeFallbackStrategy,
  executeFailoverStrategy,
  executeRollbackStrategy,
  executeCompensationStrategy,
  manageCircuitBreaker,
  openCircuitBreaker,
  closeCircuitBreaker,
  halfOpenCircuitBreaker,
  resetCircuitBreaker,
  calculateFailureMetrics,
  calculateRecoveryMetrics,
  generateFailureReport,
  generateRecoveryReport,
  analyzeFailurePattern,
  analyzeRecoveryPattern,
  predictFailure,
  predictRecovery,
  recommendFailureAction,
  recommendRecoveryAction,
  optimizeFailureHandling,
  optimizeRecoveryHandling,
  scheduleFailureCheck,
  scheduleRecoveryCheck,
  backupWorkflowState,
  restoreWorkflowState,
  validateWorkflowState,
  compareWorkflowStates,
  mergeWorkflowStates,
  isolateFailedComponent,
  replaceFailedComponent,
  repairFailedComponent,
  testRecoveredComponent,
  verifyRecoveryCompletion
} from '../../services/scan-workflow-apis'

import {
  FailureRecoveryDashboard,
  FailureAnalyticsDashboard,
  RecoveryAnalyticsDashboard,
  FailureMonitoringPanel,
  RecoveryMonitoringPanel,
  CircuitBreakerPanel,
  RetryPolicyPanel,
  FallbackPolicyPanel,
  FailoverPolicyPanel,
  RollbackPolicyPanel,
  CompensationPolicyPanel,
  FailureTimelineView,
  RecoveryTimelineView,
  FailurePatternView,
  RecoveryPatternView,
  FailureMetricsView,
  RecoveryMetricsView,
  FailureReportView,
  RecoveryReportView,
  FailureAlertView,
  RecoveryAlertView,
  FailureNotificationView,
  RecoveryNotificationView,
  FailureAuditView,
  RecoveryAuditView,
  FailureHistoryView,
  RecoveryHistoryView,
  FailureInsightsView,
  RecoveryInsightsView,
  FailureRecommendationsView,
  RecoveryRecommendationsView,
  FailureConfigurationPanel,
  RecoveryConfigurationPanel,
  FailureTemplatePanel,
  RecoveryTemplatePanel
} from '../../components/failure-recovery'

import {
  formatFailureType,
  formatFailureSeverity,
  formatRecoveryStrategy,
  formatRecoveryAction,
  formatRecoveryStatus,
  formatCircuitBreakerState,
  formatFailurePattern,
  formatRecoveryPattern,
  calculateFailureRate,
  calculateRecoveryTime,
  calculateMTTR,
  calculateMTBF,
  calculateAvailability,
  calculateReliability,
  calculateRecoverySuccess,
  calculateFailureImpact,
  calculateRecoveryEffectiveness,
  validateFailureConfiguration,
  validateRecoveryConfiguration,
  optimizeRetryPolicy,
  optimizeFallbackPolicy,
  optimizeFailoverPolicy,
  optimizeRollbackPolicy,
  optimizeCompensationPolicy,
  detectFailureAnomaly,
  detectRecoveryAnomaly,
  classifyFailure,
  classifyRecovery,
  prioritizeFailure,
  prioritizeRecovery,
  escalateFailure,
  escalateRecovery,
  resolveFailure,
  resolveRecovery,
  closeFailure,
  closeRecovery,
  archiveFailure,
  archiveRecovery,
  exportFailureData,
  exportRecoveryData,
  importFailureConfiguration,
  importRecoveryConfiguration,
  simulateFailure,
  simulateRecovery,
  testFailureScenario,
  testRecoveryScenario,
  benchmarkFailureHandling,
  benchmarkRecoveryHandling
} from '../../utils/failure-recovery'

import {
  FAILURE_TYPES,
  FAILURE_SEVERITIES,
  RECOVERY_STRATEGIES,
  RECOVERY_ACTIONS,
  RECOVERY_STATUSES,
  CIRCUIT_BREAKER_STATES,
  FAILURE_PATTERNS,
  RECOVERY_PATTERNS,
  FAILURE_THRESHOLDS,
  RECOVERY_THRESHOLDS,
  RETRY_CONFIGURATIONS,
  FALLBACK_CONFIGURATIONS,
  FAILOVER_CONFIGURATIONS,
  ROLLBACK_CONFIGURATIONS,
  COMPENSATION_CONFIGURATIONS,
  FAILURE_DETECTION_RULES,
  RECOVERY_DETECTION_RULES,
  FAILURE_ANALYSIS_ALGORITHMS,
  RECOVERY_ANALYSIS_ALGORITHMS,
  FAILURE_POLICY_TEMPLATES,
  RECOVERY_POLICY_TEMPLATES,
  FAILURE_NOTIFICATION_TEMPLATES,
  RECOVERY_NOTIFICATION_TEMPLATES,
  FAILURE_DEFAULT_CONFIGURATION,
  RECOVERY_DEFAULT_CONFIGURATION
} from '../../constants/workflow-templates'

// Enhanced interfaces for advanced failure recovery
interface FailureRecoveryEngineState {
  // Core state
  failures: WorkflowFailure[]
  recoveries: WorkflowRecovery[]
  selectedFailure: WorkflowFailure | null
  selectedRecovery: WorkflowRecovery | null
  activeFailures: WorkflowFailure[]
  activeRecoveries: WorkflowRecovery[]
  
  // Configuration state
  failureConfiguration: FailureConfiguration
  recoveryConfiguration: RecoveryConfiguration
  retryConfigs: RetryConfiguration[]
  fallbackConfigs: FallbackConfiguration[]
  failoverConfigs: FailoverConfiguration[]
  rollbackConfigs: RollbackConfiguration[]
  compensationConfigs: CompensationConfiguration[]
  
  // Policy state
  failurePolicies: RecoveryPolicy[]
  recoveryPolicies: RecoveryPolicy[]
  circuitBreakers: Map<string, CircuitBreakerState>
  
  // Monitoring state
  isMonitoring: boolean
  detectionActive: boolean
  recoveryActive: boolean
  monitoringMetrics: FailureMetrics & RecoveryMetrics
  
  // Analysis state
  failureAnalysis: FailureAnalysis | null
  recoveryAnalysis: any | null
  failurePatterns: FailurePattern[]
  recoveryPatterns: RecoveryPattern[]
  failureInsights: FailureInsight[]
  recoveryInsights: RecoveryInsight[]
  failureRecommendations: FailureRecommendation[]
  recoveryRecommendations: RecoveryRecommendation[]
  
  // Execution state
  isExecutingRecovery: boolean
  isValidatingRecovery: boolean
  recoveryProgress: Map<string, number>
  recoveryStatus: Map<string, RecoveryStatus>
  recoveryErrors: Map<string, string[]>
  
  // Alert state
  failureAlerts: FailureAlert[]
  recoveryAlerts: RecoveryAlert[]
  notifications: Array<FailureNotification | RecoveryNotification>
  
  // History state
  failureHistory: FailureHistory[]
  recoveryHistory: RecoveryHistory[]
  auditTrail: Array<FailureAudit | RecoveryAudit>
  
  // Template state
  failureTemplates: FailureTemplate[]
  recoveryTemplates: RecoveryTemplate[]
  
  // View state
  view: 'dashboard' | 'monitoring' | 'analysis' | 'history' | 'configuration'
  showFailures: boolean
  showRecoveries: boolean
  showMetrics: boolean
  showAlerts: boolean
  showInsights: boolean
  showRecommendations: boolean
  
  // Filter state
  filters: any[]
  search: string
  dateRange: { start: Date; end: Date }
  severityFilter: FailureSeverity[]
  statusFilter: RecoveryStatus[]
  
  // UI state
  isEditing: boolean
  isDirty: boolean
  expandedSections: string[]
  selectedTab: string
}

interface FailureRecoveryAction {
  type: string
  payload?: any
  timestamp: number
  user: string
  context: any
}

interface FailureRecoveryContext {
  workflowId: string
  executionId?: string
  stageId?: string
  taskId?: string
  component?: string
  environment: string
  configuration: FailureConfiguration & RecoveryConfiguration
}

/**
 * FailureRecoveryEngine Component
 * 
 * Enterprise-grade failure recovery engine component that provides comprehensive
 * failure detection, analysis, and recovery capabilities including:
 * - Real-time failure detection and monitoring
 * - Advanced failure analysis and pattern recognition
 * - Multiple recovery strategies and policies
 * - Circuit breaker and resilience patterns
 * - Retry, fallback, failover, and rollback mechanisms
 * - Compensation and transaction recovery
 * - Automated recovery orchestration
 * - Performance metrics and analytics
 * - Alert management and notifications
 * - Audit trail and compliance
 * - AI-powered insights and recommendations
 * 
 * This component integrates with the backend failure recovery engine and provides
 * a sophisticated user interface for managing enterprise resilience patterns.
 */
export const FailureRecoveryEngine: React.FC<{
  workflowId?: string
  executionId?: string
  configuration?: Partial<FailureConfiguration & RecoveryConfiguration>
  onFailureDetected?: (failure: WorkflowFailure) => void
  onRecoveryTriggered?: (recovery: WorkflowRecovery) => void
  onRecoveryCompleted?: (recovery: WorkflowRecovery) => void
  realTime?: boolean
  autoRecovery?: boolean
}> = ({
  workflowId,
  executionId,
  configuration = {},
  onFailureDetected,
  onRecoveryTriggered,
  onRecoveryCompleted,
  realTime = true,
  autoRecovery = true
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<FailureRecoveryEngineState>({
    // Core state
    failures: [],
    recoveries: [],
    selectedFailure: null,
    selectedRecovery: null,
    activeFailures: [],
    activeRecoveries: [],
    
    // Configuration state
    failureConfiguration: { ...FAILURE_DEFAULT_CONFIGURATION, ...configuration },
    recoveryConfiguration: { ...RECOVERY_DEFAULT_CONFIGURATION, ...configuration },
    retryConfigs: [],
    fallbackConfigs: [],
    failoverConfigs: [],
    rollbackConfigs: [],
    compensationConfigs: [],
    
    // Policy state
    failurePolicies: [],
    recoveryPolicies: [],
    circuitBreakers: new Map(),
    
    // Monitoring state
    isMonitoring: realTime,
    detectionActive: true,
    recoveryActive: autoRecovery,
    monitoringMetrics: {} as FailureMetrics & RecoveryMetrics,
    
    // Analysis state
    failureAnalysis: null,
    recoveryAnalysis: null,
    failurePatterns: [],
    recoveryPatterns: [],
    failureInsights: [],
    recoveryInsights: [],
    failureRecommendations: [],
    recoveryRecommendations: [],
    
    // Execution state
    isExecutingRecovery: false,
    isValidatingRecovery: false,
    recoveryProgress: new Map(),
    recoveryStatus: new Map(),
    recoveryErrors: new Map(),
    
    // Alert state
    failureAlerts: [],
    recoveryAlerts: [],
    notifications: [],
    
    // History state
    failureHistory: [],
    recoveryHistory: [],
    auditTrail: [],
    
    // Template state
    failureTemplates: [],
    recoveryTemplates: [],
    
    // View state
    view: 'dashboard',
    showFailures: true,
    showRecoveries: true,
    showMetrics: true,
    showAlerts: true,
    showInsights: false,
    showRecommendations: false,
    
    // Filter state
    filters: [],
    search: '',
    dateRange: { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() },
    severityFilter: [],
    statusFilter: [],
    
    // UI state
    isEditing: false,
    isDirty: false,
    expandedSections: ['failures', 'recoveries'],
    selectedTab: 'overview'
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const monitoringRef = useRef<any>(null)
  const analysisRef = useRef<any>(null)
  const recoveryRef = useRef<any>(null)
  const alertsRef = useRef<any>(null)

  // Hook integrations
  const {
    failures,
    recoveries,
    loading: failureLoading,
    error: failureError,
    refreshFailures,
    refreshRecoveries,
    createFailure,
    updateFailure,
    deleteFailure,
    createRecovery,
    updateRecovery,
    deleteRecovery
  } = useFailureRecovery(workflowId, executionId)

  const {
    detection,
    isDetecting,
    detectionMetrics,
    startDetection,
    stopDetection,
    configureDetection
  } = useFailureDetection()

  const {
    analysis,
    isAnalyzing,
    analyzeFailure: analyzeFailureHook,
    analyzePattern,
    generateInsights,
    generateRecommendations
  } = useFailureAnalysis()

  const {
    strategies,
    executeStrategy,
    validateStrategy,
    optimizeStrategy
  } = useRecoveryStrategies()

  const {
    circuitBreakers,
    getCircuitBreakerState,
    openCircuitBreaker: openCB,
    closeCircuitBreaker: closeCB,
    halfOpenCircuitBreaker: halfOpenCB,
    resetCircuitBreaker: resetCB
  } = useCircuitBreaker()

  const {
    retryPolicies,
    executeRetry,
    configureRetry,
    optimizeRetry
  } = useRetryPolicies()

  const {
    fallbackPolicies,
    executeFallback,
    configureFallback,
    optimizeFallback
  } = useFallbackPolicies()

  const {
    failoverPolicies,
    executeFailover,
    configureFailover,
    optimizeFailover
  } = useFailoverPolicies()

  const {
    rollbackPolicies,
    executeRollback,
    configureRollback,
    optimizeRollback
  } = useRollbackPolicies()

  const {
    compensationPolicies,
    executeCompensation,
    configureCompensation,
    optimizeCompensation
  } = useCompensationPolicies()

  const {
    monitoring,
    metrics,
    isMonitoring: monitoringActive,
    startMonitoring,
    stopMonitoring,
    getMetrics
  } = useFailureMonitoring()

  const {
    recoveryMonitoring,
    recoveryMetrics,
    startRecoveryMonitoring,
    stopRecoveryMonitoring,
    getRecoveryMetrics
  } = useRecoveryMonitoring()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredFailures = useMemo(() => {
    let result = state.failures

    // Apply search filter
    if (state.search) {
      const searchLower = state.search.toLowerCase()
      result = result.filter(failure =>
        failure.message?.toLowerCase().includes(searchLower) ||
        failure.component?.toLowerCase().includes(searchLower) ||
        failure.type?.toLowerCase().includes(searchLower)
      )
    }

    // Apply severity filter
    if (state.severityFilter.length > 0) {
      result = result.filter(failure =>
        state.severityFilter.includes(failure.severity)
      )
    }

    // Apply date range filter
    result = result.filter(failure => {
      const failureDate = new Date(failure.timestamp)
      return failureDate >= state.dateRange.start && failureDate <= state.dateRange.end
    })

    return result
  }, [state.failures, state.search, state.severityFilter, state.dateRange])

  const filteredRecoveries = useMemo(() => {
    let result = state.recoveries

    // Apply search filter
    if (state.search) {
      const searchLower = state.search.toLowerCase()
      result = result.filter(recovery =>
        recovery.strategy?.toLowerCase().includes(searchLower) ||
        recovery.action?.toLowerCase().includes(searchLower) ||
        recovery.status?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (state.statusFilter.length > 0) {
      result = result.filter(recovery =>
        state.statusFilter.includes(recovery.status)
      )
    }

    // Apply date range filter
    result = result.filter(recovery => {
      const recoveryDate = new Date(recovery.startTime)
      return recoveryDate >= state.dateRange.start && recoveryDate <= state.dateRange.end
    })

    return result
  }, [state.recoveries, state.search, state.statusFilter, state.dateRange])

  const failureStatistics = useMemo(() => {
    const failures = filteredFailures
    const recoveries = filteredRecoveries

    return {
      totalFailures: failures.length,
      criticalFailures: failures.filter(f => f.severity === 'critical').length,
      highFailures: failures.filter(f => f.severity === 'high').length,
      mediumFailures: failures.filter(f => f.severity === 'medium').length,
      lowFailures: failures.filter(f => f.severity === 'low').length,
      totalRecoveries: recoveries.length,
      successfulRecoveries: recoveries.filter(r => r.status === 'completed').length,
      failedRecoveries: recoveries.filter(r => r.status === 'failed').length,
      inProgressRecoveries: recoveries.filter(r => r.status === 'in_progress').length,
      averageRecoveryTime: calculateAverageRecoveryTime(recoveries),
      failureRate: calculateFailureRate(failures),
      recoverySuccessRate: calculateRecoverySuccessRate(recoveries),
      mttr: calculateMTTR(failures, recoveries),
      mtbf: calculateMTBF(failures),
      availability: calculateAvailability(failures, recoveries),
      reliability: calculateReliability(failures)
    }
  }, [filteredFailures, filteredRecoveries])

  const canExecuteRecovery = useMemo(() => {
    return state.selectedFailure && 
           !state.isExecutingRecovery && 
           state.recoveryActive
  }, [state.selectedFailure, state.isExecutingRecovery, state.recoveryActive])

  const canValidateRecovery = useMemo(() => {
    return state.selectedRecovery && 
           state.selectedRecovery.status === 'completed' &&
           !state.isValidatingRecovery
  }, [state.selectedRecovery, state.isValidatingRecovery])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const calculateAverageRecoveryTime = (recoveries: WorkflowRecovery[]): number => {
    const completed = recoveries.filter(r => r.status === 'completed' && r.endTime)
    if (completed.length === 0) return 0
    
    const totalTime = completed.reduce((sum, recovery) => {
      const start = new Date(recovery.startTime).getTime()
      const end = new Date(recovery.endTime!).getTime()
      return sum + (end - start)
    }, 0)
    
    return totalTime / completed.length
  }

  const calculateRecoverySuccessRate = (recoveries: WorkflowRecovery[]): number => {
    if (recoveries.length === 0) return 0
    const successful = recoveries.filter(r => r.status === 'completed').length
    return (successful / recoveries.length) * 100
  }

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatRelativeTime = (date: string | Date): string => {
    const now = new Date()
    const target = new Date(date)
    const diffMs = now.getTime() - target.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return target.toLocaleDateString()
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFailureSelect = useCallback((failure: WorkflowFailure) => {
    setState(prev => ({
      ...prev,
      selectedFailure: failure
    }))
  }, [])

  const handleRecoverySelect = useCallback((recovery: WorkflowRecovery) => {
    setState(prev => ({
      ...prev,
      selectedRecovery: recovery
    }))
  }, [])

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({
      ...prev,
      view
    }))
  }, [])

  const handleSearchChange = useCallback((search: string) => {
    setState(prev => ({
      ...prev,
      search
    }))
  }, [])

  const handleSeverityFilterChange = useCallback((severities: FailureSeverity[]) => {
    setState(prev => ({
      ...prev,
      severityFilter: severities
    }))
  }, [])

  const handleStatusFilterChange = useCallback((statuses: RecoveryStatus[]) => {
    setState(prev => ({
      ...prev,
      statusFilter: statuses
    }))
  }, [])

  const handleDateRangeChange = useCallback((range: { start: Date; end: Date }) => {
    setState(prev => ({
      ...prev,
      dateRange: range
    }))
  }, [])

  const handleExecuteRecovery = useCallback(async (strategy: RecoveryStrategy) => {
    if (!state.selectedFailure || !canExecuteRecovery) return

    try {
      setState(prev => ({ ...prev, isExecutingRecovery: true }))
      
      const recovery = await triggerRecovery(state.selectedFailure.id, strategy)
      
      setState(prev => ({
        ...prev,
        recoveries: [...prev.recoveries, recovery],
        selectedRecovery: recovery,
        recoveryProgress: new Map(prev.recoveryProgress).set(recovery.id, 0),
        recoveryStatus: new Map(prev.recoveryStatus).set(recovery.id, 'in_progress')
      }))
      
      onRecoveryTriggered?.(recovery)
      
      // Execute the recovery strategy
      await executeRecovery(recovery.id)
      
      // Start monitoring recovery progress
      startRecoveryMonitoring(recovery.id)
      
    } catch (error) {
      console.error('Failed to execute recovery:', error)
      setState(prev => ({
        ...prev,
        recoveryErrors: new Map(prev.recoveryErrors).set(
          state.selectedFailure!.id,
          [error instanceof Error ? error.message : 'Recovery execution failed']
        )
      }))
    } finally {
      setState(prev => ({ ...prev, isExecutingRecovery: false }))
    }
  }, [state.selectedFailure, canExecuteRecovery, onRecoveryTriggered, startRecoveryMonitoring])

  const handleValidateRecovery = useCallback(async () => {
    if (!state.selectedRecovery || !canValidateRecovery) return

    try {
      setState(prev => ({ ...prev, isValidatingRecovery: true }))
      
      const validation = await validateRecovery(state.selectedRecovery.id)
      
      setState(prev => ({
        ...prev,
        selectedRecovery: {
          ...prev.selectedRecovery!,
          validation
        }
      }))
      
      if (validation.success) {
        onRecoveryCompleted?.(state.selectedRecovery)
      }
      
    } catch (error) {
      console.error('Failed to validate recovery:', error)
    } finally {
      setState(prev => ({ ...prev, isValidatingRecovery: false }))
    }
  }, [state.selectedRecovery, canValidateRecovery, onRecoveryCompleted])

  const handleRetryFailedRecovery = useCallback(async (recoveryId: string) => {
    try {
      const recovery = state.recoveries.find(r => r.id === recoveryId)
      if (!recovery) return

      setState(prev => ({
        ...prev,
        recoveryStatus: new Map(prev.recoveryStatus).set(recoveryId, 'retrying'),
        recoveryProgress: new Map(prev.recoveryProgress).set(recoveryId, 0)
      }))

      await executeRecovery(recoveryId)
      startRecoveryMonitoring(recoveryId)
      
    } catch (error) {
      console.error('Failed to retry recovery:', error)
    }
  }, [state.recoveries, startRecoveryMonitoring])

  const handleAnalyzeFailure = useCallback(async (failureId: string) => {
    try {
      const analysis = await analyzeFailureHook(failureId)
      const patterns = await analyzePattern(failureId)
      const insights = await generateInsights(failureId)
      const recommendations = await generateRecommendations(failureId)
      
      setState(prev => ({
        ...prev,
        failureAnalysis: analysis,
        failurePatterns: patterns,
        failureInsights: insights,
        failureRecommendations: recommendations
      }))
      
    } catch (error) {
      console.error('Failed to analyze failure:', error)
    }
  }, [analyzeFailureHook, analyzePattern, generateInsights, generateRecommendations])

  const handleConfigureCircuitBreaker = useCallback(async (component: string, threshold: number) => {
    try {
      await manageCircuitBreaker(component, { threshold })
      
      setState(prev => ({
        ...prev,
        circuitBreakers: new Map(prev.circuitBreakers).set(component, 'closed')
      }))
      
    } catch (error) {
      console.error('Failed to configure circuit breaker:', error)
    }
  }, [])

  const handleOpenCircuitBreaker = useCallback(async (component: string) => {
    try {
      await openCB(component)
      
      setState(prev => ({
        ...prev,
        circuitBreakers: new Map(prev.circuitBreakers).set(component, 'open')
      }))
      
    } catch (error) {
      console.error('Failed to open circuit breaker:', error)
    }
  }, [openCB])

  const handleCloseCircuitBreaker = useCallback(async (component: string) => {
    try {
      await closeCB(component)
      
      setState(prev => ({
        ...prev,
        circuitBreakers: new Map(prev.circuitBreakers).set(component, 'closed')
      }))
      
    } catch (error) {
      console.error('Failed to close circuit breaker:', error)
    }
  }, [closeCB])

  const handleToggleMonitoring = useCallback(async () => {
    try {
      if (state.isMonitoring) {
        await stopMonitoring()
        await stopRecoveryMonitoring()
      } else {
        await startMonitoring()
        await startRecoveryMonitoring()
      }
      
      setState(prev => ({
        ...prev,
        isMonitoring: !prev.isMonitoring
      }))
      
    } catch (error) {
      console.error('Failed to toggle monitoring:', error)
    }
  }, [state.isMonitoring, startMonitoring, stopMonitoring, startRecoveryMonitoring, stopRecoveryMonitoring])

  const handleToggleDetection = useCallback(async () => {
    try {
      if (state.detectionActive) {
        await stopDetection()
      } else {
        await startDetection()
      }
      
      setState(prev => ({
        ...prev,
        detectionActive: !prev.detectionActive
      }))
      
    } catch (error) {
      console.error('Failed to toggle detection:', error)
    }
  }, [state.detectionActive, startDetection, stopDetection])

  const handleToggleAutoRecovery = useCallback(() => {
    setState(prev => ({
      ...prev,
      recoveryActive: !prev.recoveryActive
    }))
  }, [])

  const handleDismissAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      failureAlerts: prev.failureAlerts.filter(alert => alert.id !== alertId),
      recoveryAlerts: prev.recoveryAlerts.filter(alert => alert.id !== alertId)
    }))
  }, [])

  const handleAcknowledgeFailure = useCallback(async (failureId: string) => {
    try {
      await updateFailure(failureId, { acknowledged: true })
      
      setState(prev => ({
        ...prev,
        failures: prev.failures.map(failure =>
          failure.id === failureId ? { ...failure, acknowledged: true } : failure
        )
      }))
      
    } catch (error) {
      console.error('Failed to acknowledge failure:', error)
    }
  }, [updateFailure])

  const handleResolveFailure = useCallback(async (failureId: string) => {
    try {
      await updateFailure(failureId, { resolved: true })
      
      setState(prev => ({
        ...prev,
        failures: prev.failures.map(failure =>
          failure.id === failureId ? { ...failure, resolved: true } : failure
        )
      }))
      
    } catch (error) {
      console.error('Failed to resolve failure:', error)
    }
  }, [updateFailure])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize data
    refreshFailures()
    refreshRecoveries()
    
    if (realTime) {
      startMonitoring()
      startDetection()
    }
  }, [workflowId, executionId, realTime])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      failures: failures || [],
      recoveries: recoveries || []
    }))
  }, [failures, recoveries])

  useEffect(() => {
    // Update monitoring metrics
    if (metrics) {
      setState(prev => ({
        ...prev,
        monitoringMetrics: { ...prev.monitoringMetrics, ...metrics }
      }))
    }
  }, [metrics])

  useEffect(() => {
    // Update recovery metrics
    if (recoveryMetrics) {
      setState(prev => ({
        ...prev,
        monitoringMetrics: { ...prev.monitoringMetrics, ...recoveryMetrics }
      }))
    }
  }, [recoveryMetrics])

  useEffect(() => {
    // Handle automatic failure detection
    if (state.detectionActive && onFailureDetected) {
      const unacknowledgedFailures = state.failures.filter(f => !f.acknowledged)
      unacknowledgedFailures.forEach(failure => {
        onFailureDetected(failure)
      })
    }
  }, [state.failures, state.detectionActive, onFailureDetected])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderFailureCard = (failure: WorkflowFailure) => (
    <Card 
      key={failure.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        state.selectedFailure?.id === failure.id ? 'ring-2 ring-red-500' : ''
      } ${failure.severity === 'critical' ? 'border-red-500' : ''}`}
      onClick={() => handleFailureSelect(failure)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${getSeverityColor(failure.severity)}`} />
            <CardTitle className="text-base">{failure.component || 'System'}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getSeverityVariant(failure.severity)}>
              {formatFailureSeverity(failure.severity)}
            </Badge>
            {failure.acknowledged && (
              <Badge variant="outline">
                <CheckCircle className="h-3 w-3 mr-1" />
                Acknowledged
              </Badge>
            )}
            {failure.resolved && (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-sm">
          {failure.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>{formatFailureType(failure.type)}</span>
            </span>
            {failure.retryCount && (
              <span className="flex items-center space-x-1">
                <RotateCcw className="h-4 w-4" />
                <span>{failure.retryCount} retries</span>
              </span>
            )}
          </div>
          <span className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeTime(failure.timestamp)}</span>
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            {!failure.acknowledged && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAcknowledgeFailure(failure.id)
                }}
              >
                Acknowledge
              </Button>
            )}
            {!failure.resolved && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleResolveFailure(failure.id)
                }}
              >
                Resolve
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleAnalyzeFailure(failure.id)
              }}
            >
              Analyze
            </Button>
          </div>
          {canExecuteRecovery && state.selectedFailure?.id === failure.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  Recover
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExecuteRecovery('retry')}>
                  Retry
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExecuteRecovery('fallback')}>
                  Fallback
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExecuteRecovery('failover')}>
                  Failover
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExecuteRecovery('rollback')}>
                  Rollback
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderRecoveryCard = (recovery: WorkflowRecovery) => (
    <Card 
      key={recovery.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        state.selectedRecovery?.id === recovery.id ? 'ring-2 ring-green-500' : ''
      }`}
      onClick={() => handleRecoverySelect(recovery)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">
              {formatRecoveryStrategy(recovery.strategy)}
            </CardTitle>
          </div>
          <Badge variant={getRecoveryStatusVariant(recovery.status)}>
            {formatRecoveryStatus(recovery.status)}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {recovery.description || `${formatRecoveryAction(recovery.action)} recovery`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {recovery.status === 'in_progress' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(state.recoveryProgress.get(recovery.id) || 0)}%</span>
              </div>
              <Progress value={state.recoveryProgress.get(recovery.id) || 0} className="h-2" />
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Started {formatRelativeTime(recovery.startTime)}</span>
            </span>
            {recovery.endTime && (
              <span className="flex items-center space-x-1">
                <Timer className="h-4 w-4" />
                <span>
                  Duration: {formatDuration(
                    new Date(recovery.endTime).getTime() - 
                    new Date(recovery.startTime).getTime()
                  )}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {recovery.status === 'failed' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRetryFailedRecovery(recovery.id)
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              )}
              {recovery.status === 'completed' && canValidateRecovery && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleValidateRecovery()
                  }}
                  disabled={state.isValidatingRecovery}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Validate
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Total Failures</p>
              <p className="text-2xl font-bold">{failureStatistics.totalFailures}</p>
              <p className="text-xs text-muted-foreground">
                {failureStatistics.criticalFailures} critical
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Recoveries</p>
              <p className="text-2xl font-bold">{failureStatistics.totalRecoveries}</p>
              <p className="text-xs text-muted-foreground">
                {failureStatistics.successfulRecoveries} successful
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Success Rate</p>
              <p className="text-2xl font-bold">
                {Math.round(failureStatistics.recoverySuccessRate)}%
              </p>
              <p className="text-xs text-muted-foreground">
                recovery success
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">MTTR</p>
              <p className="text-2xl font-bold">
                {formatDuration(failureStatistics.mttr)}
              </p>
              <p className="text-xs text-muted-foreground">
                mean time to recover
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
              <p className="text-sm font-medium">Availability</p>
              <p className="text-2xl font-bold">
                {Math.round(failureStatistics.availability * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">
                system uptime
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Reliability</p>
              <p className="text-2xl font-bold">
                {Math.round(failureStatistics.reliability * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">
                system reliability
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
        <h1 className="text-2xl font-bold">Failure Recovery Engine</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search failures and recoveries..."
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
                  variant={state.isMonitoring ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleMonitoring}
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {state.isMonitoring ? 'Stop monitoring' : 'Start monitoring'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={state.detectionActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleDetection}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {state.detectionActive ? 'Disable detection' : 'Enable detection'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={state.recoveryActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleAutoRecovery}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {state.recoveryActive ? 'Disable auto-recovery' : 'Enable auto-recovery'}
              </TooltipContent>
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
            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showFailures: !prev.showFailures }))}>
              {state.showFailures ? 'Hide' : 'Show'} Failures
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showRecoveries: !prev.showRecoveries }))}>
              {state.showRecoveries ? 'Hide' : 'Show'} Recoveries
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showMetrics: !prev.showMetrics }))}>
              {state.showMetrics ? 'Hide' : 'Show'} Metrics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showAlerts: !prev.showAlerts }))}>
              {state.showAlerts ? 'Hide' : 'Show'} Alerts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const getSeverityColor = (severity: FailureSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSeverityVariant = (severity: FailureSeverity) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRecoveryStatusVariant = (status: RecoveryStatus) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-background" ref={containerRef}>
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
              {/* Dashboard View */}
              <TabsContent value="dashboard" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Failures Section */}
                    {state.showFailures && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Recent Failures</h3>
                          <Badge variant="secondary">
                            {filteredFailures.length} failures
                          </Badge>
                        </div>
                        <ScrollArea className="h-[calc(100vh-400px)]">
                          <div className="space-y-4">
                            {filteredFailures.map(renderFailureCard)}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Recoveries Section */}
                    {state.showRecoveries && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Recovery Actions</h3>
                          <Badge variant="secondary">
                            {filteredRecoveries.length} recoveries
                          </Badge>
                        </div>
                        <ScrollArea className="h-[calc(100vh-400px)]">
                          <div className="space-y-4">
                            {filteredRecoveries.map(renderRecoveryCard)}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Monitoring View */}
              <TabsContent value="monitoring" className="flex-1 overflow-hidden">
                <div className="h-full">
                  <FailureRecoveryDashboard
                    failures={filteredFailures}
                    recoveries={filteredRecoveries}
                    metrics={state.monitoringMetrics}
                    isMonitoring={state.isMonitoring}
                    detectionActive={state.detectionActive}
                    recoveryActive={state.recoveryActive}
                    ref={monitoringRef}
                  />
                </div>
              </TabsContent>

              {/* Analysis View */}
              <TabsContent value="analysis" className="flex-1 overflow-hidden">
                <div className="h-full">
                  <FailureAnalyticsDashboard
                    analysis={state.failureAnalysis}
                    patterns={state.failurePatterns}
                    insights={state.failureInsights}
                    recommendations={state.failureRecommendations}
                    ref={analysisRef}
                  />
                </div>
              </TabsContent>

              {/* History View */}
              <TabsContent value="history" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <Tabs defaultValue="failures" className="h-full flex flex-col">
                    <TabsList>
                      <TabsTrigger value="failures">Failure History</TabsTrigger>
                      <TabsTrigger value="recoveries">Recovery History</TabsTrigger>
                      <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                    </TabsList>

                    <TabsContent value="failures" className="flex-1 overflow-hidden">
                      <FailureHistoryView history={state.failureHistory} />
                    </TabsContent>

                    <TabsContent value="recoveries" className="flex-1 overflow-hidden">
                      <RecoveryHistoryView history={state.recoveryHistory} />
                    </TabsContent>

                    <TabsContent value="audit" className="flex-1 overflow-hidden">
                      <FailureAuditView audit={state.auditTrail} />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              {/* Configuration View */}
              <TabsContent value="configuration" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <Tabs defaultValue="failure" className="h-full flex flex-col">
                    <TabsList>
                      <TabsTrigger value="failure">Failure Config</TabsTrigger>
                      <TabsTrigger value="recovery">Recovery Config</TabsTrigger>
                      <TabsTrigger value="policies">Policies</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="failure" className="flex-1 overflow-hidden">
                      <FailureConfigurationPanel 
                        configuration={state.failureConfiguration}
                        onConfigurationChange={(config) => 
                          setState(prev => ({ ...prev, failureConfiguration: config }))
                        }
                      />
                    </TabsContent>

                    <TabsContent value="recovery" className="flex-1 overflow-hidden">
                      <RecoveryConfigurationPanel 
                        configuration={state.recoveryConfiguration}
                        onConfigurationChange={(config) => 
                          setState(prev => ({ ...prev, recoveryConfiguration: config }))
                        }
                      />
                    </TabsContent>

                    <TabsContent value="policies" className="flex-1 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CircuitBreakerPanel 
                          circuitBreakers={state.circuitBreakers}
                          onOpen={handleOpenCircuitBreaker}
                          onClose={handleCloseCircuitBreaker}
                          onConfigure={handleConfigureCircuitBreaker}
                        />
                        <RetryPolicyPanel 
                          policies={retryPolicies}
                          onConfigureRetry={configureRetry}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="templates" className="flex-1 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FailureTemplatePanel templates={state.failureTemplates} />
                        <RecoveryTemplatePanel templates={state.recoveryTemplates} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {state.showAlerts && (
        <AnimatePresence>
          {state.failureAlerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-4 right-4 z-50"
            >
              <Alert className="w-80" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleDismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          ))}
          {state.recoveryAlerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-4 right-4 z-50"
            >
              <Alert className="w-80" variant="default">
                <Shield className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleDismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Loading States */}
      {(failureLoading || state.isExecutingRecovery || state.isValidatingRecovery) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>
              {state.isExecutingRecovery ? 'Executing recovery...' :
               state.isValidatingRecovery ? 'Validating recovery...' :
               'Loading...'}
            </span>
          </div>
        </div>
      )}

      {/* Error States */}
      {failureError && (
        <Alert className="fixed bottom-4 left-4 w-80" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{failureError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default FailureRecoveryEngine