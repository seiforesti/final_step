"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  GitBranch,
  Share2,
  Link,
  Unlink,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Circle,
  Square,
  Triangle,
  Diamond,
  Hexagon,
  Star,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
  Warning,
  Clock,
  Calendar,
  Timer,
  Zap,
  Target,
  Layers,
  Network,
  Route,
  Shuffle,
  Split,
  Merge,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Code,
  Database,
  Server,
  Cloud,
  Package,
  Component,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Settings,
  Filter,
  Search,
  Sort,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square as StopIcon,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  Hand,
  Crosshair,
  Grid,
  List,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Map,
  Bookmark,
  Tag,
  Flag,
  Bell,
  BellOff,
  MessageSquare,
  MessageCircle,
  Mail,
  Send,
  Share,
  ExternalLink,
  LinkIcon,
  Anchor,
  Paperclip,
  Attachment,
  File,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  Inbox,
  Outbox,
  Trash,
  Delete,
  Ban,
  Slash,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Key,
  User,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Crown,
  Award,
  Medal,
  Trophy,
  Gem,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Angry,
  Laughing,
  HelpCircle,
  QuestionMark,
  ExclamationMark,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  PoundSterling,
  Euro,
  Yen,
  Bitcoin,
  CreditCard,
  Banknote,
  Coins,
  Calculator,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Watch,
  Hourglass,
  Stopwatch,
  AlarmClock,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Stars,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  Umbrella,
  Wind,
  Waves,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Seedling,
  Apple,
  Cherry,
  Grape,
  Banana,
  Orange,
  Lemon,
  Strawberry,
  Carrot,
  Corn,
  Pepper,
  Tomato,
  Potato,
  Onion,
  Garlic,
  Mushroom,
  Cheese,
  Egg,
  Milk,
  Bread,
  Cookie,
  Cake,
  Pizza,
  Hamburger,
  Hotdog,
  Taco,
  Burrito,
  Salad,
  Soup,
  Popcorn,
  Candy,
  Chocolate,
  IceCream,
  Donut,
  Coffee,
  Tea,
  Wine,
  Beer,
  Cocktail,
  Juice,
  Water,
  Soda
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Import types and services
import {
  WorkflowDependency,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStage,
  WorkflowTask,
  DependencyType,
  DependencyStatus,
  DependencyPriority,
  DependencyCondition,
  DependencyConstraint,
  DependencyRelationship,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  DependencyPath,
  DependencyLoop,
  DependencyConflict,
  DependencyResolution,
  DependencyValidation,
  DependencyOptimization,
  DependencyAnalysis,
  DependencyMetrics,
  DependencyInsight,
  DependencyRecommendation,
  DependencyImpact,
  DependencyRisk,
  DependencyCompliance,
  DependencySecurity,
  DependencyGovernance,
  DependencyAudit,
  DependencyEvent,
  DependencyAlert,
  DependencyNotification,
  DependencySchedule,
  DependencyResource,
  DependencyConfiguration,
  DependencyTemplate,
  DependencyVersion,
  DependencyHistory
} from '../../types/workflow.types'

import {
  useDependencyResolver,
  useDependencyAnalysis,
  useDependencyValidation,
  useDependencyOptimization,
  useDependencyMonitoring,
  useDependencyScheduling,
  useDependencyConflictResolution,
  useDependencyImpactAnalysis,
  useDependencyRiskAssessment,
  useDependencyCompliance,
  useDependencySecurity,
  useDependencyGovernance,
  useDependencyAuditing,
  useDependencyNotifications,
  useDependencyTemplates,
  useDependencyVersioning,
  useDependencyHistory,
  useDependencyMetrics,
  useDependencyInsights,
  useDependencyRecommendations
} from '../../hooks/useWorkflowManagement'

import {
  resolveDependencies,
  analyzeDependencies,
  validateDependencies,
  optimizeDependencies,
  buildDependencyGraph,
  findDependencyPaths,
  detectDependencyLoops,
  detectDependencyConflicts,
  calculateDependencyImpact,
  assessDependencyRisk,
  enforceDependencyCompliance,
  secureDependencyChain,
  governDependencyLifecycle,
  auditDependencyChanges,
  scheduleDependencyExecution,
  monitorDependencyHealth,
  alertDependencyIssues,
  notifyDependencyEvents,
  templateDependencyPattern,
  versionDependencyConfiguration,
  historyDependencyChanges,
  metrifyDependencyPerformance,
  insightDependencyTrends,
  recommendDependencyImprovements,
  configDependencySettings,
  resourceDependencyAllocation,
  constraintDependencyValidation,
  relationshipDependencyMapping,
  pathDependencyOptimization,
  loopDependencyBreaking,
  conflictDependencyResolution,
  impactDependencyAssessment,
  riskDependencyMitigation,
  complianceDependencyEnforcement,
  securityDependencyValidation,
  governanceDependencyControl,
  auditDependencyReporting,
  eventDependencyTracking,
  alertDependencyManagement,
  notificationDependencyDelivery,
  scheduleDependencyCoordination,
  resourceDependencyManagement,
  configurationDependencySetup,
  templateDependencyCreation,
  versionDependencyControl,
  historyDependencyTracking
} from '../../services/scan-workflow-apis'

import {
  DependencyGraphVisualization,
  DependencyTreeView,
  DependencyListView,
  DependencyTimelineView,
  DependencyMatrixView,
  DependencyFlowChart,
  DependencyNetworkDiagram,
  DependencyHierarchyView,
  DependencyDashboard,
  DependencyAnalyticsDashboard,
  DependencyMonitoringDashboard,
  DependencyReportingDashboard,
  DependencyConfigurationPanel,
  DependencyValidationPanel,
  DependencyOptimizationPanel,
  DependencyConflictPanel,
  DependencyImpactPanel,
  DependencyRiskPanel,
  DependencyCompliancePanel,
  DependencySecurityPanel,
  DependencyGovernancePanel,
  DependencyAuditPanel,
  DependencyNotificationPanel,
  DependencySchedulePanel,
  DependencyResourcePanel,
  DependencyTemplatePanel,
  DependencyVersionPanel,
  DependencyHistoryPanel,
  DependencyMetricsPanel,
  DependencyInsightsPanel,
  DependencyRecommendationsPanel
} from '../../components/dependency-visualization'

import {
  formatDependencyType,
  formatDependencyStatus,
  formatDependencyPriority,
  formatDependencyImpact,
  formatDependencyRisk,
  calculateDependencyMetrics,
  calculateDependencyComplexity,
  calculateDependencyEfficiency,
  calculateDependencyReliability,
  calculateDependencyPerformance,
  optimizeDependencyOrder,
  resolveDependencyConflicts,
  validateDependencyConstraints,
  enforceDependencyPolicies,
  monitorDependencyExecution,
  trackDependencyProgress,
  logDependencyEvents,
  auditDependencyActivity,
  notifyDependencyUpdates,
  scheduleDependencyTasks,
  allocateDependencyResources,
  configureDependencySettings,
  templateDependencyStructure,
  versionDependencyState,
  historyDependencyEvolution,
  analyzeDependencyTrends,
  predictDependencyOutcomes,
  recommendDependencyActions,
  benchmarkDependencyPerformance,
  compareDependencyConfigurations,
  exportDependencyData,
  importDependencyConfiguration,
  backupDependencyState,
  restoreDependencyConfiguration
} from '../../utils/dependency-resolver'

import {
  DEPENDENCY_TYPES,
  DEPENDENCY_STATUSES,
  DEPENDENCY_PRIORITIES,
  DEPENDENCY_CONDITIONS,
  DEPENDENCY_CONSTRAINTS,
  DEPENDENCY_RELATIONSHIPS,
  DEPENDENCY_CONFIGURATIONS,
  DEPENDENCY_TEMPLATES,
  DEPENDENCY_VALIDATION_RULES,
  DEPENDENCY_OPTIMIZATION_ALGORITHMS,
  DEPENDENCY_CONFLICT_RESOLUTION_STRATEGIES,
  DEPENDENCY_IMPACT_ASSESSMENT_METHODS,
  DEPENDENCY_RISK_MITIGATION_STRATEGIES,
  DEPENDENCY_COMPLIANCE_FRAMEWORKS,
  DEPENDENCY_SECURITY_POLICIES,
  DEPENDENCY_GOVERNANCE_STANDARDS,
  DEPENDENCY_AUDIT_PROCEDURES,
  DEPENDENCY_NOTIFICATION_TEMPLATES,
  DEPENDENCY_SCHEDULING_STRATEGIES,
  DEPENDENCY_RESOURCE_ALLOCATION_POLICIES,
  DEPENDENCY_PERFORMANCE_THRESHOLDS,
  DEPENDENCY_QUALITY_METRICS,
  DEPENDENCY_DEFAULT_CONFIGURATION
} from '../../constants/workflow-templates'

// Enhanced interfaces for advanced dependency resolution
interface DependencyResolverState {
  // Core state
  dependencies: WorkflowDependency[]
  selectedDependency: WorkflowDependency | null
  dependencyGraph: DependencyGraph | null
  dependencyPaths: DependencyPath[]
  dependencyLoops: DependencyLoop[]
  dependencyConflicts: DependencyConflict[]
  
  // View state
  view: 'graph' | 'tree' | 'list' | 'timeline' | 'matrix' | 'flow' | 'network' | 'hierarchy'
  layout: 'hierarchical' | 'circular' | 'force' | 'grid' | 'tree' | 'radial' | 'organic'
  zoom: number
  pan: { x: number; y: number }
  selection: string[]
  filters: DependencyFilter[]
  search: string
  sorting: DependencySorting
  grouping: DependencyGrouping
  
  // Analysis state
  analysis: DependencyAnalysis | null
  validation: DependencyValidation | null
  optimization: DependencyOptimization | null
  metrics: DependencyMetrics | null
  insights: DependencyInsight[]
  recommendations: DependencyRecommendation[]
  
  // Execution state
  isResolving: boolean
  isAnalyzing: boolean
  isValidating: boolean
  isOptimizing: boolean
  executionOrder: string[]
  executionProgress: Record<string, number>
  executionStatus: Record<string, DependencyStatus>
  executionErrors: Record<string, string[]>
  
  // Configuration state
  configuration: DependencyConfiguration
  templates: DependencyTemplate[]
  constraints: DependencyConstraint[]
  policies: any[]
  rules: any[]
  
  // Monitoring state
  monitoring: boolean
  events: DependencyEvent[]
  alerts: DependencyAlert[]
  notifications: DependencyNotification[]
  schedule: DependencySchedule | null
  resources: DependencyResource[]
  
  // Security state
  security: DependencySecurity | null
  compliance: DependencyCompliance | null
  governance: DependencyGovernance | null
  audit: DependencyAudit[]
  
  // Version state
  versions: DependencyVersion[]
  history: DependencyHistory[]
  changes: any[]
  
  // UI state
  isEditing: boolean
  isDirty: boolean
  showDetails: boolean
  showConflicts: boolean
  showMetrics: boolean
  showRecommendations: boolean
  expandedNodes: string[]
  highlightedNodes: string[]
  hoveredNode: string | null
  draggedNode: string | null
}

interface DependencyFilter {
  field: string
  operator: string
  value: any
  enabled: boolean
}

interface DependencySorting {
  field: string
  direction: 'asc' | 'desc'
}

interface DependencyGrouping {
  field: string
  direction: 'asc' | 'desc'
  expanded: string[]
}

interface DependencyAction {
  type: string
  payload?: any
  timestamp: number
  user: string
}

interface DependencyContext {
  workflow: WorkflowDefinition
  execution?: WorkflowExecution
  dependencies: WorkflowDependency[]
  constraints: DependencyConstraint[]
  configuration: DependencyConfiguration
}

/**
 * DependencyResolver Component
 * 
 * Enterprise-grade dependency resolution component that provides comprehensive
 * dependency management capabilities including:
 * - Visual dependency graph visualization
 * - Advanced dependency analysis and validation
 * - Conflict detection and resolution
 * - Performance optimization and scheduling
 * - Impact assessment and risk analysis
 * - Compliance enforcement and governance
 * - Real-time monitoring and alerting
 * - Template management and versioning
 * - Audit trail and history tracking
 * - AI-powered recommendations
 * 
 * This component integrates with the backend dependency engine and provides
 * a sophisticated user interface for managing complex dependency relationships.
 */
export const DependencyResolver: React.FC<{
  workflowId?: string
  executionId?: string
  dependencies?: WorkflowDependency[]
  onDependenciesChange?: (dependencies: WorkflowDependency[]) => void
  onResolutionComplete?: (order: string[]) => void
  onConflictDetected?: (conflicts: DependencyConflict[]) => void
  editable?: boolean
  realTime?: boolean
}> = ({
  workflowId,
  executionId,
  dependencies: initialDependencies = [],
  onDependenciesChange,
  onResolutionComplete,
  onConflictDetected,
  editable = true,
  realTime = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<DependencyResolverState>({
    // Core state
    dependencies: initialDependencies,
    selectedDependency: null,
    dependencyGraph: null,
    dependencyPaths: [],
    dependencyLoops: [],
    dependencyConflicts: [],
    
    // View state
    view: 'graph',
    layout: 'hierarchical',
    zoom: 100,
    pan: { x: 0, y: 0 },
    selection: [],
    filters: [],
    search: '',
    sorting: { field: 'name', direction: 'asc' },
    grouping: { field: 'type', direction: 'asc', expanded: [] },
    
    // Analysis state
    analysis: null,
    validation: null,
    optimization: null,
    metrics: null,
    insights: [],
    recommendations: [],
    
    // Execution state
    isResolving: false,
    isAnalyzing: false,
    isValidating: false,
    isOptimizing: false,
    executionOrder: [],
    executionProgress: {},
    executionStatus: {},
    executionErrors: {},
    
    // Configuration state
    configuration: DEPENDENCY_DEFAULT_CONFIGURATION,
    templates: [],
    constraints: [],
    policies: [],
    rules: [],
    
    // Monitoring state
    monitoring: realTime,
    events: [],
    alerts: [],
    notifications: [],
    schedule: null,
    resources: [],
    
    // Security state
    security: null,
    compliance: null,
    governance: null,
    audit: [],
    
    // Version state
    versions: [],
    history: [],
    changes: [],
    
    // UI state
    isEditing: false,
    isDirty: false,
    showDetails: true,
    showConflicts: true,
    showMetrics: false,
    showRecommendations: false,
    expandedNodes: [],
    highlightedNodes: [],
    hoveredNode: null,
    draggedNode: null
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const treeRef = useRef<any>(null)
  const listRef = useRef<any>(null)
  const timelineRef = useRef<any>(null)
  const matrixRef = useRef<any>(null)

  // Hook integrations
  const {
    dependencies,
    loading: dependenciesLoading,
    error: dependenciesError,
    refreshDependencies,
    createDependency,
    updateDependency,
    deleteDependency,
    resolveDependencies: resolveDependenciesHook,
    validateDependencies: validateDependenciesHook
  } = useDependencyResolver(workflowId)

  const {
    analysis,
    loading: analysisLoading,
    error: analysisError,
    analyzeDependencies: analyzeDependenciesHook,
    buildGraph,
    findPaths,
    detectLoops,
    detectConflicts,
    calculateImpact
  } = useDependencyAnalysis()

  const {
    validation,
    loading: validationLoading,
    error: validationError,
    validateConstraints,
    validatePolicies,
    validateCompliance,
    validateSecurity
  } = useDependencyValidation()

  const {
    optimization,
    loading: optimizationLoading,
    error: optimizationError,
    optimizeOrder,
    optimizeResources,
    optimizeSchedule,
    optimizePerformance
  } = useDependencyOptimization()

  const {
    monitoring,
    events,
    alerts,
    loading: monitoringLoading,
    startMonitoring,
    stopMonitoring,
    acknowledgeAlert
  } = useDependencyMonitoring()

  const {
    schedule,
    loading: schedulingLoading,
    createSchedule,
    updateSchedule,
    executeSchedule
  } = useDependencyScheduling()

  const {
    conflicts,
    loading: conflictLoading,
    resolveConflict,
    suggestResolution,
    applyResolution
  } = useDependencyConflictResolution()

  const {
    impact,
    loading: impactLoading,
    assessImpact,
    predictImpact,
    mitigateImpact
  } = useDependencyImpactAnalysis()

  const {
    risk,
    loading: riskLoading,
    assessRisk,
    mitigateRisk,
    monitorRisk
  } = useDependencyRiskAssessment()

  const {
    compliance,
    loading: complianceLoading,
    checkCompliance,
    enforceCompliance,
    reportCompliance
  } = useDependencyCompliance()

  const {
    security,
    loading: securityLoading,
    validateSecurity: validateSecurityHook,
    enforceSecurityPolicies,
    auditSecurityAccess
  } = useDependencySecurity()

  const {
    governance,
    loading: governanceLoading,
    enforceGovernance,
    auditGovernance,
    reportGovernance
  } = useDependencyGovernance()

  const {
    audit,
    loading: auditLoading,
    createAuditEntry,
    getAuditTrail,
    exportAuditReport
  } = useDependencyAuditing()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredDependencies = useMemo(() => {
    let result = state.dependencies

    // Apply search filter
    if (state.search) {
      const searchLower = state.search.toLowerCase()
      result = result.filter(dep =>
        dep.name?.toLowerCase().includes(searchLower) ||
        dep.description?.toLowerCase().includes(searchLower) ||
        dep.source?.toLowerCase().includes(searchLower) ||
        dep.target?.toLowerCase().includes(searchLower)
      )
    }

    // Apply field filters
    state.filters.forEach(filter => {
      if (filter.enabled) {
        result = result.filter(dep => {
          const value = getNestedValue(dep, filter.field)
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
  }, [state.dependencies, state.search, state.filters, state.sorting])

  const dependencyStatistics = useMemo(() => {
    const deps = filteredDependencies
    
    return {
      total: deps.length,
      byType: groupBy(deps, 'type'),
      byStatus: groupBy(deps, 'status'),
      byPriority: groupBy(deps, 'priority'),
      conflicts: state.dependencyConflicts.length,
      loops: state.dependencyLoops.length,
      paths: state.dependencyPaths.length,
      resolved: deps.filter(d => d.status === 'resolved').length,
      pending: deps.filter(d => d.status === 'pending').length,
      failed: deps.filter(d => d.status === 'failed').length,
      critical: deps.filter(d => d.priority === 'critical').length,
      high: deps.filter(d => d.priority === 'high').length,
      medium: deps.filter(d => d.priority === 'medium').length,
      low: deps.filter(d => d.priority === 'low').length,
      complexity: calculateDependencyComplexity(deps),
      efficiency: calculateDependencyEfficiency(deps),
      reliability: calculateDependencyReliability(deps),
      performance: calculateDependencyPerformance(deps)
    }
  }, [filteredDependencies, state.dependencyConflicts, state.dependencyLoops, state.dependencyPaths])

  const canResolve = useMemo(() => {
    return state.dependencies.length > 0 && 
           !state.isResolving && 
           state.dependencyConflicts.length === 0
  }, [state.dependencies, state.isResolving, state.dependencyConflicts])

  const canOptimize = useMemo(() => {
    return state.dependencies.length > 0 && 
           !state.isOptimizing && 
           state.executionOrder.length > 0
  }, [state.dependencies, state.isOptimizing, state.executionOrder])

  const canValidate = useMemo(() => {
    return state.dependencies.length > 0 && !state.isValidating
  }, [state.dependencies, state.isValidating])

  const canAnalyze = useMemo(() => {
    return state.dependencies.length > 0 && !state.isAnalyzing
  }, [state.dependencies, state.isAnalyzing])

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
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value)
      case 'not_in':
        return Array.isArray(filterValue) && !filterValue.includes(value)
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

  const groupBy = <T,>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDependencySelect = useCallback((dependency: WorkflowDependency) => {
    setState(prev => ({
      ...prev,
      selectedDependency: dependency
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

  const handleSearchChange = useCallback((search: string) => {
    setState(prev => ({
      ...prev,
      search
    }))
  }, [])

  const handleFilterChange = useCallback((filters: DependencyFilter[]) => {
    setState(prev => ({
      ...prev,
      filters
    }))
  }, [])

  const handleSortingChange = useCallback((sorting: DependencySorting) => {
    setState(prev => ({
      ...prev,
      sorting
    }))
  }, [])

  const handleCreateDependency = useCallback(async (dependencyData: Partial<WorkflowDependency>) => {
    if (!editable) return

    try {
      const dependency = await createDependency(dependencyData)
      setState(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, dependency],
        isDirty: true
      }))
      
      onDependenciesChange?.(state.dependencies)
    } catch (error) {
      console.error('Failed to create dependency:', error)
    }
  }, [editable, createDependency, onDependenciesChange, state.dependencies])

  const handleUpdateDependency = useCallback(async (id: string, updates: Partial<WorkflowDependency>) => {
    if (!editable) return

    try {
      const dependency = await updateDependency(id, updates)
      setState(prev => ({
        ...prev,
        dependencies: prev.dependencies.map(d => d.id === id ? dependency : d),
        isDirty: true
      }))
      
      onDependenciesChange?.(state.dependencies)
    } catch (error) {
      console.error('Failed to update dependency:', error)
    }
  }, [editable, updateDependency, onDependenciesChange, state.dependencies])

  const handleDeleteDependency = useCallback(async (id: string) => {
    if (!editable) return

    try {
      await deleteDependency(id)
      setState(prev => ({
        ...prev,
        dependencies: prev.dependencies.filter(d => d.id !== id),
        isDirty: true
      }))
      
      onDependenciesChange?.(state.dependencies)
    } catch (error) {
      console.error('Failed to delete dependency:', error)
    }
  }, [editable, deleteDependency, onDependenciesChange])

  const handleResolveDependencies = useCallback(async () => {
    if (!canResolve) return

    try {
      setState(prev => ({ ...prev, isResolving: true }))
      
      const result = await resolveDependenciesHook(state.dependencies)
      
      setState(prev => ({
        ...prev,
        executionOrder: result.order,
        executionStatus: result.status,
        isResolving: false
      }))
      
      onResolutionComplete?.(result.order)
    } catch (error) {
      console.error('Failed to resolve dependencies:', error)
      setState(prev => ({ ...prev, isResolving: false }))
    }
  }, [canResolve, resolveDependenciesHook, state.dependencies, onResolutionComplete])

  const handleAnalyzeDependencies = useCallback(async () => {
    if (!canAnalyze) return

    try {
      setState(prev => ({ ...prev, isAnalyzing: true }))
      
      const analysis = await analyzeDependenciesHook(state.dependencies)
      const graph = await buildGraph(state.dependencies)
      const paths = await findPaths(state.dependencies)
      const loops = await detectLoops(state.dependencies)
      const conflicts = await detectConflicts(state.dependencies)
      
      setState(prev => ({
        ...prev,
        analysis,
        dependencyGraph: graph,
        dependencyPaths: paths,
        dependencyLoops: loops,
        dependencyConflicts: conflicts,
        isAnalyzing: false
      }))
      
      onConflictDetected?.(conflicts)
    } catch (error) {
      console.error('Failed to analyze dependencies:', error)
      setState(prev => ({ ...prev, isAnalyzing: false }))
    }
  }, [canAnalyze, analyzeDependenciesHook, buildGraph, findPaths, detectLoops, detectConflicts, state.dependencies, onConflictDetected])

  const handleValidateDependencies = useCallback(async () => {
    if (!canValidate) return

    try {
      setState(prev => ({ ...prev, isValidating: true }))
      
      const validation = await validateDependenciesHook(state.dependencies)
      
      setState(prev => ({
        ...prev,
        validation,
        isValidating: false
      }))
    } catch (error) {
      console.error('Failed to validate dependencies:', error)
      setState(prev => ({ ...prev, isValidating: false }))
    }
  }, [canValidate, validateDependenciesHook, state.dependencies])

  const handleOptimizeDependencies = useCallback(async () => {
    if (!canOptimize) return

    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      const optimization = await optimizeOrder(state.dependencies, state.executionOrder)
      
      setState(prev => ({
        ...prev,
        optimization,
        executionOrder: optimization.optimizedOrder,
        isOptimizing: false
      }))
    } catch (error) {
      console.error('Failed to optimize dependencies:', error)
      setState(prev => ({ ...prev, isOptimizing: false }))
    }
  }, [canOptimize, optimizeOrder, state.dependencies, state.executionOrder])

  const handleConflictResolution = useCallback(async (conflict: DependencyConflict, resolution: DependencyResolution) => {
    try {
      await applyResolution(conflict, resolution)
      
      // Refresh analysis after resolution
      await handleAnalyzeDependencies()
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
  }, [applyResolution, handleAnalyzeDependencies])

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredNode: nodeId
    }))
  }, [])

  const handleNodeDrag = useCallback((nodeId: string | null) => {
    setState(prev => ({
      ...prev,
      draggedNode: nodeId
    }))
  }, [])

  const handleNodeExpand = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      expandedNodes: prev.expandedNodes.includes(nodeId)
        ? prev.expandedNodes.filter(id => id !== nodeId)
        : [...prev.expandedNodes, nodeId]
    }))
  }, [])

  const handleNodeHighlight = useCallback((nodeIds: string[]) => {
    setState(prev => ({
      ...prev,
      highlightedNodes: nodeIds
    }))
  }, [])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize dependencies
    if (workflowId) {
      refreshDependencies()
    }
  }, [workflowId, refreshDependencies])

  useEffect(() => {
    // Update dependencies from props
    setState(prev => ({
      ...prev,
      dependencies: initialDependencies
    }))
  }, [initialDependencies])

  useEffect(() => {
    // Auto-analyze when dependencies change
    if (state.dependencies.length > 0) {
      handleAnalyzeDependencies()
    }
  }, [state.dependencies.length])

  useEffect(() => {
    // Start/stop monitoring based on realTime prop
    if (realTime && !state.monitoring) {
      startMonitoring()
      setState(prev => ({ ...prev, monitoring: true }))
    } else if (!realTime && state.monitoring) {
      stopMonitoring()
      setState(prev => ({ ...prev, monitoring: false }))
    }
  }, [realTime, state.monitoring, startMonitoring, stopMonitoring])

  useEffect(() => {
    // Update events and alerts from monitoring
    if (monitoring) {
      setState(prev => ({
        ...prev,
        events: events || [],
        alerts: alerts || []
      }))
    }
  }, [monitoring, events, alerts])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderDependencyCard = (dependency: WorkflowDependency) => (
    <Card 
      key={dependency.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        state.selectedDependency?.id === dependency.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleDependencySelect(dependency)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">{dependency.name || `${dependency.source} → ${dependency.target}`}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getDependencyStatusVariant(dependency.status)}>
              {formatDependencyStatus(dependency.status)}
            </Badge>
            <Badge variant={getDependencyPriorityVariant(dependency.priority)}>
              {formatDependencyPriority(dependency.priority)}
            </Badge>
          </div>
        </div>
        {dependency.description && (
          <CardDescription className="text-sm">
            {dependency.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Share2 className="h-4 w-4" />
              <span>{formatDependencyType(dependency.type)}</span>
            </span>
            {dependency.condition && (
              <span className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{dependency.condition}</span>
              </span>
            )}
          </div>
          <span className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeTime(dependency.updatedAt)}</span>
          </span>
        </div>
        {dependency.constraints && dependency.constraints.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dependency.constraints.slice(0, 3).map((constraint, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {constraint.type}
              </Badge>
            ))}
            {dependency.constraints.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{dependency.constraints.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderConflictCard = (conflict: DependencyConflict) => (
    <Card key={conflict.id} className="border-red-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Dependency Conflict</CardTitle>
          </div>
          <Badge variant="destructive">
            {conflict.severity}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {conflict.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Conflicting Dependencies:</span>
            <span>{conflict.dependencies.length}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {conflict.dependencies.map(depId => {
              const dep = state.dependencies.find(d => d.id === depId)
              return dep ? (
                <Badge key={depId} variant="outline" className="text-xs">
                  {dep.source} → {dep.target}
                </Badge>
              ) : null
            })}
          </div>
          {conflict.suggestedResolutions && conflict.suggestedResolutions.length > 0 && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConflictResolution(conflict, conflict.suggestedResolutions[0])}
              >
                Apply Suggested Resolution
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">{dependencyStatistics.total}</p>
              <p className="text-xs text-muted-foreground">
                {dependencyStatistics.resolved} resolved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Conflicts</p>
              <p className="text-2xl font-bold">{dependencyStatistics.conflicts}</p>
              <p className="text-xs text-muted-foreground">
                {dependencyStatistics.loops} loops
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Paths</p>
              <p className="text-2xl font-bold">{dependencyStatistics.paths}</p>
              <p className="text-xs text-muted-foreground">
                execution paths
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Critical</p>
              <p className="text-2xl font-bold">{dependencyStatistics.critical}</p>
              <p className="text-xs text-muted-foreground">
                {dependencyStatistics.high} high priority
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
              <p className="text-sm font-medium">Efficiency</p>
              <p className="text-2xl font-bold">{Math.round(dependencyStatistics.efficiency)}%</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(dependencyStatistics.reliability)}% reliable
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
              <p className="text-sm font-medium">Performance</p>
              <p className="text-2xl font-bold">{Math.round(dependencyStatistics.performance)}%</p>
              <p className="text-xs text-muted-foreground">
                complexity: {Math.round(dependencyStatistics.complexity)}
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
        <h1 className="text-2xl font-bold">Dependency Resolver</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="graph">Graph</TabsTrigger>
            <TabsTrigger value="tree">Tree</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search dependencies..."
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
                  onClick={handleAnalyzeDependencies}
                  disabled={!canAnalyze}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Analyze dependencies</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidateDependencies}
                  disabled={!canValidate}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Validate dependencies</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResolveDependencies}
                  disabled={!canResolve}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resolve dependencies</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOptimizeDependencies}
                  disabled={!canOptimize}
                >
                  <Target className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Optimize dependencies</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {editable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateDependency({})}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add dependency</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
            <DropdownMenuItem onClick={() => handleLayoutChange('hierarchical')}>
              Hierarchical Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLayoutChange('circular')}>
              Circular Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLayoutChange('force')}>
              Force Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLayoutChange('grid')}>
              Grid Layout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showDetails: !prev.showDetails }))}>
              {state.showDetails ? 'Hide' : 'Show'} Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showConflicts: !prev.showConflicts }))}>
              {state.showConflicts ? 'Hide' : 'Show'} Conflicts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showMetrics: !prev.showMetrics }))}>
              {state.showMetrics ? 'Hide' : 'Show'} Metrics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const getDependencyStatusVariant = (status: DependencyStatus) => {
    switch (status) {
      case 'resolved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getDependencyPriorityVariant = (priority: DependencyPriority) => {
    switch (priority) {
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
              {/* Graph View */}
              <TabsContent value="graph" className="flex-1 overflow-hidden">
                <div className="h-full">
                  <DependencyGraphVisualization
                    dependencies={filteredDependencies}
                    graph={state.dependencyGraph}
                    conflicts={state.dependencyConflicts}
                    loops={state.dependencyLoops}
                    paths={state.dependencyPaths}
                    selectedDependency={state.selectedDependency}
                    hoveredNode={state.hoveredNode}
                    highlightedNodes={state.highlightedNodes}
                    expandedNodes={state.expandedNodes}
                    layout={state.layout}
                    zoom={state.zoom}
                    pan={state.pan}
                    onNodeSelect={handleDependencySelect}
                    onNodeHover={handleNodeHover}
                    onNodeExpand={handleNodeExpand}
                    onNodeHighlight={handleNodeHighlight}
                    onZoomChange={handleZoomChange}
                    onPanChange={handlePanChange}
                    editable={editable}
                    showConflicts={state.showConflicts}
                    showMetrics={state.showMetrics}
                    ref={graphRef}
                  />
                </div>
              </TabsContent>

              {/* Tree View */}
              <TabsContent value="tree" className="flex-1 overflow-hidden">
                <div className="h-full">
                  <DependencyTreeView
                    dependencies={filteredDependencies}
                    selectedDependency={state.selectedDependency}
                    expandedNodes={state.expandedNodes}
                    onNodeSelect={handleDependencySelect}
                    onNodeExpand={handleNodeExpand}
                    editable={editable}
                    ref={treeRef}
                  />
                </div>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list" className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {filteredDependencies.map(renderDependencyCard)}
                      
                      {state.showConflicts && state.dependencyConflicts.length > 0 && (
                        <div className="space-y-4">
                          <Separator />
                          <h3 className="text-lg font-semibold text-red-600">Conflicts</h3>
                          {state.dependencyConflicts.map(renderConflictCard)}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Timeline View */}
              <TabsContent value="timeline" className="flex-1 overflow-hidden">
                <div className="h-full">
                  <DependencyTimelineView
                    dependencies={filteredDependencies}
                    executionOrder={state.executionOrder}
                    executionProgress={state.executionProgress}
                    executionStatus={state.executionStatus}
                    selectedDependency={state.selectedDependency}
                    onDependencySelect={handleDependencySelect}
                    ref={timelineRef}
                  />
                </div>
              </TabsContent>

              {/* Matrix View */}
              <TabsContent value="matrix" className="flex-1 overflow-hidden">
                <div className="h-full">
                  <DependencyMatrixView
                    dependencies={filteredDependencies}
                    selectedDependency={state.selectedDependency}
                    onDependencySelect={handleDependencySelect}
                    editable={editable}
                    ref={matrixRef}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Side Panel */}
        {state.showDetails && (
          <div className="w-80 border-l flex flex-col">
            <Tabs defaultValue="details" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {state.selectedDependency ? (
                    <DependencyConfigurationPanel
                      dependency={state.selectedDependency}
                      onUpdate={handleUpdateDependency}
                      onDelete={handleDeleteDependency}
                      editable={editable}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground mt-8">
                      <GitBranch className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a dependency to view details</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analysis" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <DependencyAnalyticsDashboard
                    analysis={state.analysis}
                    validation={state.validation}
                    optimization={state.optimization}
                    insights={state.insights}
                    recommendations={state.recommendations}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="metrics" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <DependencyMetricsPanel
                    metrics={state.metrics}
                    statistics={dependencyStatistics}
                    performance={state.performance}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Loading States */}
      {(dependenciesLoading || analysisLoading || validationLoading || optimizationLoading) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Processing dependencies...</span>
          </div>
        </div>
      )}

      {/* Error States */}
      {(dependenciesError || analysisError || validationError || optimizationError) && (
        <Alert className="fixed bottom-4 left-4 w-80" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {dependenciesError || analysisError || validationError || optimizationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Alert Notifications */}
      <AnimatePresence>
        {state.alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert className="w-80" variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => acknowledgeAlert(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default DependencyResolver