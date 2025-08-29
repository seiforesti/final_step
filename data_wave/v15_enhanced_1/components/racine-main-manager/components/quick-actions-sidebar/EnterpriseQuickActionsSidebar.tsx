'use client'

import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect,
  memo,
  startTransition,
  useDeferredValue,
  lazy,
  Suspense,
  useReducer
} from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FixedSizeList as List, VariableSizeList as VariableList } from 'react-window'
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Pin, 
  PinOff, 
  Settings, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Zap, 
  Star, 
  Clock, 
  Activity, 
  Database, 
  Shield, 
  FileText, 
  BookOpen, 
  Scan, 
  Users, 
  Bot, 
  Workflow,
  BarChart3,
  TrendingUp,
  Target,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

// Performance-optimized hooks
import { useOptimizedQuickActions } from '../../hooks/optimized/useOptimizedQuickActions'
import { useOptimizedCrossGroupIntegration } from '../../hooks/optimized/useOptimizedCrossGroupIntegration'
import { useOptimizedUserManagement } from '../../hooks/optimized/useOptimizedUserManagement'
import { useOptimizedWorkspaceManagement } from '../../hooks/optimized/useOptimizedWorkspaceManagement'
import { useOptimizedActivityTracker } from '../../hooks/optimized/useOptimizedActivityTracker'
import { useOptimizedUserPreferences } from '../../hooks/optimized/useOptimizedUserPreferences'

// Performance monitoring
import { usePerformanceMonitor } from '../../hooks/performance/usePerformanceMonitor'
import { useMemoryOptimization } from '../../hooks/performance/useMemoryOptimization'
import { useComponentLazyLoading } from '../../hooks/performance/useComponentLazyLoading'
import { useVirtualization } from '../../hooks/performance/useVirtualization'

// Enterprise error boundary
import { EnterpriseQuickActionsErrorBoundary } from '../error-boundaries/EnterpriseQuickActionsErrorBoundary'

// Lazy loaded components for better performance
const LazyQuickComponent = lazy(() => import('./components/LazyQuickComponent'))

// Types
interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  subcategory?: string
  component: string
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  permissions?: string[]
  estimatedExecutionTime?: number
  dependencies?: string[]
  tags: string[]
  lastUsed?: Date
  usageCount?: number
  favorited?: boolean
  quickExecute?: boolean
  contextual?: boolean
}

interface ActionCategory {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  description: string
  actions: QuickAction[]
  priority: number
  permissions?: string[]
  adminOnly?: boolean
}

interface QuickActionsSidebarState {
  isOpen: boolean
  isPinned: boolean
  isExpanded: boolean
  activeCategory: string | null
  searchQuery: string
  isSearching: boolean
  selectedFilters: string[]
  sortBy: 'name' | 'usage' | 'recent' | 'priority'
  loadedComponents: Set<string>
  loadingComponents: Set<string>
  errorComponents: Set<string>
  favorites: Set<string>
  hiddenCategories: Set<string>
  compactMode: boolean
  showMetrics: boolean
  autoHide: boolean
  contextualActionsOnly: boolean
  maxComponentsPerCategory: number
  sidebarWidth: number
  animationSpeed: number
}

type SidebarAction = 
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'SET_PINNED'; payload: boolean }
  | { type: 'SET_EXPANDED'; payload: boolean }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_SELECTED_FILTERS'; payload: string[] }
  | { type: 'SET_SORT_BY'; payload: 'name' | 'usage' | 'recent' | 'priority' }
  | { type: 'ADD_LOADED_COMPONENT'; payload: string }
  | { type: 'ADD_LOADING_COMPONENT'; payload: string }
  | { type: 'REMOVE_LOADING_COMPONENT'; payload: string }
  | { type: 'ADD_ERROR_COMPONENT'; payload: string }
  | { type: 'REMOVE_ERROR_COMPONENT'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'TOGGLE_CATEGORY_VISIBILITY'; payload: string }
  | { type: 'SET_COMPACT_MODE'; payload: boolean }
  | { type: 'SET_SHOW_METRICS'; payload: boolean }
  | { type: 'SET_AUTO_HIDE'; payload: boolean }
  | { type: 'SET_CONTEXTUAL_ACTIONS_ONLY'; payload: boolean }
  | { type: 'SET_MAX_COMPONENTS_PER_CATEGORY'; payload: number }
  | { type: 'SET_SIDEBAR_WIDTH'; payload: number }
  | { type: 'SET_ANIMATION_SPEED'; payload: number }

const sidebarReducer = (state: QuickActionsSidebarState, action: SidebarAction): QuickActionsSidebarState => {
  switch (action.type) {
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload }
    case 'SET_PINNED':
      return { ...state, isPinned: action.payload }
    case 'SET_EXPANDED':
      return { ...state, isExpanded: action.payload }
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload }
    case 'SET_SELECTED_FILTERS':
      return { ...state, selectedFilters: action.payload }
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload }
    case 'ADD_LOADED_COMPONENT':
      return { ...state, loadedComponents: new Set(state.loadedComponents).add(action.payload) }
    case 'ADD_LOADING_COMPONENT':
      return { ...state, loadingComponents: new Set(state.loadingComponents).add(action.payload) }
    case 'REMOVE_LOADING_COMPONENT':
      const newLoadingComponents = new Set(state.loadingComponents)
      newLoadingComponents.delete(action.payload)
      return { ...state, loadingComponents: newLoadingComponents }
    case 'ADD_ERROR_COMPONENT':
      return { ...state, errorComponents: new Set(state.errorComponents).add(action.payload) }
    case 'REMOVE_ERROR_COMPONENT':
      const newErrorComponents = new Set(state.errorComponents)
      newErrorComponents.delete(action.payload)
      return { ...state, errorComponents: newErrorComponents }
    case 'TOGGLE_FAVORITE':
      const newFavorites = new Set(state.favorites)
      if (newFavorites.has(action.payload)) {
        newFavorites.delete(action.payload)
      } else {
        newFavorites.add(action.payload)
      }
      return { ...state, favorites: newFavorites }
    case 'TOGGLE_CATEGORY_VISIBILITY':
      const newHiddenCategories = new Set(state.hiddenCategories)
      if (newHiddenCategories.has(action.payload)) {
        newHiddenCategories.delete(action.payload)
      } else {
        newHiddenCategories.add(action.payload)
      }
      return { ...state, hiddenCategories: newHiddenCategories }
    case 'SET_COMPACT_MODE':
      return { ...state, compactMode: action.payload }
    case 'SET_SHOW_METRICS':
      return { ...state, showMetrics: action.payload }
    case 'SET_AUTO_HIDE':
      return { ...state, autoHide: action.payload }
    case 'SET_CONTEXTUAL_ACTIONS_ONLY':
      return { ...state, contextualActionsOnly: action.payload }
    case 'SET_MAX_COMPONENTS_PER_CATEGORY':
      return { ...state, maxComponentsPerCategory: action.payload }
    case 'SET_SIDEBAR_WIDTH':
      return { ...state, sidebarWidth: action.payload }
    case 'SET_ANIMATION_SPEED':
      return { ...state, animationSpeed: action.payload }
    default:
      return state
  }
}

// Enhanced action categories with better organization
const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'data-sources',
    name: 'Data Sources',
    icon: Database,
    color: 'bg-blue-500',
    description: 'Manage and configure data source connections',
    priority: 1,
    permissions: ['datasource:read', 'datasource:write'],
    actions: [
      {
        id: 'data-sources-create',
        name: 'Create Data Source',
        description: 'Add a new data source connection',
        icon: Database,
        category: 'data-sources',
        component: 'QuickDataSourceCreate',
        enabled: true,
        priority: 'high',
        permissions: ['datasource:write'],
        tags: ['create', 'connection', 'setup'],
        quickExecute: true
      },
      {
        id: 'data-sources-test',
        name: 'Test Connection',
        description: 'Test existing data source connections',
        icon: Activity,
        category: 'data-sources',
        component: 'QuickConnectionTest',
        enabled: true,
        priority: 'medium',
        permissions: ['datasource:read'],
        tags: ['test', 'verify', 'health'],
        quickExecute: true
      },
      {
        id: 'data-sources-status',
        name: 'Status Monitor',
        description: 'Monitor data source health and status',
        icon: BarChart3,
        category: 'data-sources',
        component: 'QuickDataSourceStatus',
        enabled: true,
        priority: 'medium',
        permissions: ['datasource:read'],
        tags: ['monitor', 'status', 'health']
      },
      {
        id: 'data-sources-metrics',
        name: 'Performance Metrics',
        description: 'View data source performance metrics',
        icon: TrendingUp,
        category: 'data-sources',
        component: 'QuickDataSourceMetrics',
        enabled: true,
        priority: 'low',
        permissions: ['datasource:read'],
        tags: ['metrics', 'performance', 'analytics']
      }
    ]
  },
  {
    id: 'scan-rules',
    name: 'Scan Rules',
    icon: Shield,
    color: 'bg-green-500',
    description: 'Create and manage data scanning rules',
    priority: 2,
    permissions: ['scanrules:read', 'scanrules:write'],
    actions: [
      {
        id: 'scan-rules-create',
        name: 'Create Rule',
        description: 'Create a new scanning rule',
        icon: Shield,
        category: 'scan-rules',
        component: 'QuickRuleCreate',
        enabled: true,
        priority: 'high',
        permissions: ['scanrules:write'],
        tags: ['create', 'rule', 'security'],
        quickExecute: true
      },
      {
        id: 'scan-rules-test',
        name: 'Test Rule',
        description: 'Test scanning rule effectiveness',
        icon: Target,
        category: 'scan-rules',
        component: 'QuickRuleTest',
        enabled: true,
        priority: 'medium',
        permissions: ['scanrules:read'],
        tags: ['test', 'validate', 'rule'],
        quickExecute: true
      },
      {
        id: 'scan-rules-status',
        name: 'Rule Status',
        description: 'Monitor rule execution status',
        icon: Activity,
        category: 'scan-rules',
        component: 'QuickRuleStatus',
        enabled: true,
        priority: 'medium',
        permissions: ['scanrules:read'],
        tags: ['status', 'monitor', 'execution']
      },
      {
        id: 'scan-rules-metrics',
        name: 'Rule Analytics',
        description: 'View rule performance analytics',
        icon: BarChart3,
        category: 'scan-rules',
        component: 'QuickRuleMetrics',
        enabled: true,
        priority: 'low',
        permissions: ['scanrules:read'],
        tags: ['analytics', 'performance', 'metrics']
      }
    ]
  },
  {
    id: 'classifications',
    name: 'Classifications',
    icon: FileText,
    color: 'bg-purple-500',
    description: 'Apply and manage data classifications',
    priority: 3,
    permissions: ['classifications:read', 'classifications:write'],
    actions: [
      {
        id: 'classifications-create',
        name: 'Create Classification',
        description: 'Create new data classification',
        icon: FileText,
        category: 'classifications',
        component: 'QuickClassificationCreate',
        enabled: true,
        priority: 'high',
        permissions: ['classifications:write'],
        tags: ['create', 'classify', 'label'],
        quickExecute: true
      },
      {
        id: 'classifications-apply',
        name: 'Apply Classification',
        description: 'Apply classification to data assets',
        icon: Target,
        category: 'classifications',
        component: 'QuickClassificationApply',
        enabled: true,
        priority: 'medium',
        permissions: ['classifications:write'],
        tags: ['apply', 'assign', 'tag'],
        quickExecute: true
      },
      {
        id: 'classifications-status',
        name: 'Classification Status',
        description: 'Monitor classification progress',
        icon: Activity,
        category: 'classifications',
        component: 'QuickClassificationStatus',
        enabled: true,
        priority: 'medium',
        permissions: ['classifications:read'],
        tags: ['status', 'progress', 'monitor']
      },
      {
        id: 'classifications-metrics',
        name: 'Classification Analytics',
        description: 'View classification metrics and insights',
        icon: BarChart3,
        category: 'classifications',
        component: 'QuickClassificationMetrics',
        enabled: true,
        priority: 'low',
        permissions: ['classifications:read'],
        tags: ['analytics', 'insights', 'metrics']
      }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: BookOpen,
    color: 'bg-red-500',
    description: 'Monitor and enforce compliance rules',
    priority: 4,
    permissions: ['compliance:read', 'compliance:write'],
    actions: [
      {
        id: 'compliance-check',
        name: 'Compliance Check',
        description: 'Run compliance validation checks',
        icon: BookOpen,
        category: 'compliance',
        component: 'QuickComplianceCheck',
        enabled: true,
        priority: 'critical',
        permissions: ['compliance:read'],
        tags: ['check', 'validate', 'compliance'],
        quickExecute: true
      },
      {
        id: 'compliance-audit',
        name: 'Generate Audit Report',
        description: 'Generate compliance audit reports',
        icon: FileText,
        category: 'compliance',
        component: 'QuickAuditReport',
        enabled: true,
        priority: 'high',
        permissions: ['compliance:read'],
        tags: ['audit', 'report', 'compliance'],
        quickExecute: true
      },
      {
        id: 'compliance-status',
        name: 'Compliance Status',
        description: 'Monitor overall compliance status',
        icon: Activity,
        category: 'compliance',
        component: 'QuickComplianceStatus',
        enabled: true,
        priority: 'medium',
        permissions: ['compliance:read'],
        tags: ['status', 'monitor', 'overview']
      },
      {
        id: 'compliance-metrics',
        name: 'Compliance Metrics',
        description: 'View compliance metrics and trends',
        icon: TrendingUp,
        category: 'compliance',
        component: 'QuickComplianceMetrics',
        enabled: true,
        priority: 'low',
        permissions: ['compliance:read'],
        tags: ['metrics', 'trends', 'analytics']
      }
    ]
  },
  {
    id: 'catalog',
    name: 'Data Catalog',
    icon: Scan,
    color: 'bg-orange-500',
    description: 'Browse and manage data catalog assets',
    priority: 5,
    permissions: ['catalog:read', 'catalog:write'],
    actions: [
      {
        id: 'catalog-search',
        name: 'Quick Search',
        description: 'Search data catalog assets',
        icon: Search,
        category: 'catalog',
        component: 'QuickCatalogSearch',
        enabled: true,
        priority: 'high',
        permissions: ['catalog:read'],
        tags: ['search', 'find', 'discover'],
        quickExecute: true
      },
      {
        id: 'catalog-asset',
        name: 'Create Asset',
        description: 'Add new asset to catalog',
        icon: Scan,
        category: 'catalog',
        component: 'QuickAssetCreate',
        enabled: true,
        priority: 'medium',
        permissions: ['catalog:write'],
        tags: ['create', 'asset', 'add'],
        quickExecute: true
      },
      {
        id: 'catalog-lineage',
        name: 'View Lineage',
        description: 'Explore data lineage relationships',
        icon: Workflow,
        category: 'catalog',
        component: 'QuickLineageView',
        enabled: true,
        priority: 'medium',
        permissions: ['catalog:read'],
        tags: ['lineage', 'relationships', 'graph']
      },
      {
        id: 'catalog-metrics',
        name: 'Catalog Metrics',
        description: 'View catalog usage and health metrics',
        icon: BarChart3,
        category: 'catalog',
        component: 'QuickCatalogMetrics',
        enabled: true,
        priority: 'low',
        permissions: ['catalog:read'],
        tags: ['metrics', 'usage', 'health']
      }
    ]
  },
  {
    id: 'scan-engine',
    name: 'Scan Engine',
    icon: Activity,
    color: 'bg-indigo-500',
    description: 'Execute and monitor data scans',
    priority: 6,
    permissions: ['scanning:read', 'scanning:execute'],
    actions: [
      {
        id: 'scan-start',
        name: 'Start Scan',
        description: 'Initiate a new data scan',
        icon: Play,
        category: 'scan-engine',
        component: 'QuickScanStart',
        enabled: true,
        priority: 'high',
        permissions: ['scanning:execute'],
        tags: ['start', 'initiate', 'scan'],
        quickExecute: true
      },
      {
        id: 'scan-status',
        name: 'Scan Status',
        description: 'Monitor active scan progress',
        icon: Activity,
        category: 'scan-engine',
        component: 'QuickScanStatus',
        enabled: true,
        priority: 'medium',
        permissions: ['scanning:read'],
        tags: ['status', 'progress', 'monitor']
      },
      {
        id: 'scan-results',
        name: 'Scan Results',
        description: 'View latest scan results',
        icon: CheckCircle2,
        category: 'scan-engine',
        component: 'QuickScanResults',
        enabled: true,
        priority: 'medium',
        permissions: ['scanning:read'],
        tags: ['results', 'findings', 'output']
      },
      {
        id: 'scan-metrics',
        name: 'Scan Analytics',
        description: 'View scan performance metrics',
        icon: TrendingUp,
        category: 'scan-engine',
        component: 'QuickScanMetrics',
        enabled: true,
        priority: 'low',
        permissions: ['scanning:read'],
        tags: ['analytics', 'performance', 'metrics']
      }
    ]
  },
  {
    id: 'rbac',
    name: 'Access Control',
    icon: Users,
    color: 'bg-gray-500',
    description: 'Manage users, roles, and permissions',
    priority: 7,
    permissions: ['rbac:admin'],
    adminOnly: true,
    actions: [
      {
        id: 'rbac-user',
        name: 'Create User',
        description: 'Add new user to the system',
        icon: Users,
        category: 'rbac',
        component: 'QuickUserCreate',
        enabled: true,
        priority: 'high',
        permissions: ['rbac:admin'],
        tags: ['create', 'user', 'account'],
        quickExecute: true
      },
      {
        id: 'rbac-role',
        name: 'Assign Role',
        description: 'Assign roles to users',
        icon: Shield,
        category: 'rbac',
        component: 'QuickRoleAssign',
        enabled: true,
        priority: 'medium',
        permissions: ['rbac:admin'],
        tags: ['assign', 'role', 'permission'],
        quickExecute: true
      },
      {
        id: 'rbac-permission',
        name: 'Check Permissions',
        description: 'Validate user permissions',
        icon: Target,
        category: 'rbac',
        component: 'QuickPermissionCheck',
        enabled: true,
        priority: 'medium',
        permissions: ['rbac:admin'],
        tags: ['check', 'validate', 'permission']
      },
      {
        id: 'rbac-metrics',
        name: 'RBAC Analytics',
        description: 'View user and role analytics',
        icon: BarChart3,
        category: 'rbac',
        component: 'QuickRBACMetrics',
        enabled: true,
        priority: 'low',
        permissions: ['rbac:admin'],
        tags: ['analytics', 'users', 'roles']
      }
    ]
  },
  {
    id: 'racine-tools',
    name: 'Racine Tools',
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Advanced workflow and orchestration tools',
    priority: 8,
    permissions: ['racine:advanced'],
    actions: [
      {
        id: 'racine-workflow',
        name: 'Create Workflow',
        description: 'Build new automation workflow',
        icon: Workflow,
        category: 'racine-tools',
        component: 'QuickWorkflowCreate',
        enabled: true,
        priority: 'high',
        permissions: ['racine:advanced'],
        tags: ['create', 'workflow', 'automation'],
        quickExecute: true
      },
      {
        id: 'racine-pipeline',
        name: 'Create Pipeline',
        description: 'Build new data pipeline',
        icon: Zap,
        category: 'racine-tools',
        component: 'QuickPipelineCreate',
        enabled: true,
        priority: 'high',
        permissions: ['racine:advanced'],
        tags: ['create', 'pipeline', 'etl'],
        quickExecute: true
      },
      {
        id: 'racine-ai',
        name: 'AI Assistant',
        description: 'Chat with AI assistant',
        icon: Bot,
        category: 'racine-tools',
        component: 'QuickAIChat',
        enabled: true,
        priority: 'medium',
        permissions: ['racine:advanced'],
        tags: ['ai', 'chat', 'assistant']
      },
      {
        id: 'racine-dashboard',
        name: 'Create Dashboard',
        description: 'Build custom dashboard',
        icon: BarChart3,
        category: 'racine-tools',
        component: 'QuickDashboardCreate',
        enabled: true,
        priority: 'medium',
        permissions: ['racine:advanced'],
        tags: ['create', 'dashboard', 'visualization'],
        quickExecute: true
      },
      {
        id: 'racine-workspace',
        name: 'Create Workspace',
        description: 'Set up new workspace',
        icon: Target,
        category: 'racine-tools',
        component: 'QuickWorkspaceCreate',
        enabled: true,
        priority: 'medium',
        permissions: ['racine:advanced'],
        tags: ['create', 'workspace', 'setup'],
        quickExecute: true
      },
      {
        id: 'racine-activity',
        name: 'Activity Tracker',
        description: 'View system activity and logs',
        icon: Clock,
        category: 'racine-tools',
        component: 'QuickActivityView',
        enabled: true,
        priority: 'low',
        permissions: ['racine:advanced'],
        tags: ['activity', 'logs', 'tracking']
      }
    ]
  }
]

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500'
} as const

interface EnterpriseQuickActionsSidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentContext?: string
  className?: string
  position?: 'left' | 'right'
  mode?: 'overlay' | 'push' | 'mini'
  enableDragAndDrop?: boolean
  enableCustomization?: boolean
  enableContextualActions?: boolean
  enableAnalytics?: boolean
  maxComponentsPerCategory?: number
  sidebarWidth?: number
  compactMode?: boolean
  autoHide?: boolean
  persistLayout?: boolean
  enableSearch?: boolean
  enableFiltering?: boolean
  showComponentMetrics?: boolean
}

// Memoized Quick Action Component
const QuickActionComponent = memo<{
  action: QuickAction
  isLoaded: boolean
  isLoading: boolean
  hasError: boolean
  isFavorited: boolean
  compactMode: boolean
  showMetrics: boolean
  onExecute: (action: QuickAction) => void
  onLoad: (action: QuickAction) => void
  onToggleFavorite: (action: QuickAction) => void
  onRetry: (action: QuickAction) => void
}>(({ 
  action, 
  isLoaded, 
  isLoading, 
  hasError, 
  isFavorited, 
  compactMode, 
  showMetrics,
  onExecute, 
  onLoad, 
  onToggleFavorite, 
  onRetry 
}) => {
  const handleExecute = useCallback(() => {
    onExecute(action)
  }, [action, onExecute])

  const handleLoad = useCallback(() => {
    onLoad(action)
  }, [action, onLoad])

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(action)
  }, [action, onToggleFavorite])

  const handleRetry = useCallback(() => {
    onRetry(action)
  }, [action, onRetry])

  const priorityColor = PRIORITY_COLORS[action.priority]

  return (
    <Card className={cn(
      "group relative cursor-pointer transition-all duration-200 hover:shadow-md",
      compactMode && "p-2",
      hasError && "border-red-200 bg-red-50/50",
      isLoading && "opacity-70"
    )}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {!compactMode && "Loading..."}
          </div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-red-50/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="text-center p-2">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            {!compactMode && (
              <>
                <p className="text-xs text-red-600 font-medium">Failed to load</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 h-6 text-xs"
                  onClick={handleRetry}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <CardContent className={cn("p-3", compactMode && "p-2")}>
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10",
                compactMode && "w-6 h-6"
              )}>
                <action.icon className={cn("w-4 h-4 text-primary", compactMode && "w-3 h-3")} />
              </div>
              
              {!compactMode && (
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm truncate">{action.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {action.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleToggleFavorite}
              >
                <Star className={cn(
                  "w-3 h-3",
                  isFavorited && "fill-current text-yellow-500"
                )} />
              </Button>
              
              {action.quickExecute && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleExecute}
                  disabled={!isLoaded}
                >
                  <Play className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Badges and metadata */}
          {!compactMode && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={cn("text-xs h-4 px-1", priorityColor)}
                >
                  {action.priority}
                </Badge>
                
                {action.quickExecute && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    <Zap className="w-2 h-2 mr-1" />
                    Quick
                  </Badge>
                )}
                
                {action.contextual && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    <Target className="w-2 h-2 mr-1" />
                    Smart
                  </Badge>
                )}
              </div>

              {showMetrics && action.usageCount && (
                <span className="text-xs text-muted-foreground">
                  Used {action.usageCount} times
                </span>
              )}
            </div>
          )}

          {/* Action button */}
          <Button
            variant={isLoaded ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={isLoaded ? handleExecute : handleLoad}
            disabled={isLoading || hasError}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            ) : isLoaded ? (
              <>
                <Play className="w-3 h-3 mr-2" />
                {compactMode ? "Run" : "Execute"}
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-2" />
                {compactMode ? "Load" : "Load Component"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

QuickActionComponent.displayName = 'QuickActionComponent'

// Virtualized action list item
const VirtualizedActionItem = memo<{
  index: number
  style: React.CSSProperties
  data: {
    actions: QuickAction[]
    loadedComponents: Set<string>
    loadingComponents: Set<string>
    errorComponents: Set<string>
    favorites: Set<string>
    compactMode: boolean
    showMetrics: boolean
    onExecute: (action: QuickAction) => void
    onLoad: (action: QuickAction) => void
    onToggleFavorite: (action: QuickAction) => void
    onRetry: (action: QuickAction) => void
  }
}>(({ index, style, data }) => {
  const action = data.actions[index]
  if (!action) return null

  return (
    <div style={style} className="px-2 pb-2">
      <QuickActionComponent
        action={action}
        isLoaded={data.loadedComponents.has(action.id)}
        isLoading={data.loadingComponents.has(action.id)}
        hasError={data.errorComponents.has(action.id)}
        isFavorited={data.favorites.has(action.id)}
        compactMode={data.compactMode}
        showMetrics={data.showMetrics}
        onExecute={data.onExecute}
        onLoad={data.onLoad}
        onToggleFavorite={data.onToggleFavorite}
        onRetry={data.onRetry}
      />
    </div>
  )
})

VirtualizedActionItem.displayName = 'VirtualizedActionItem'

export const EnterpriseQuickActionsSidebar: React.FC<EnterpriseQuickActionsSidebarProps> = memo(({
  isOpen,
  onToggle,
  currentContext = 'global',
  className,
  position = 'right',
  mode = 'overlay',
  enableDragAndDrop = false,
  enableCustomization = true,
  enableContextualActions = true,
  enableAnalytics = true,
  maxComponentsPerCategory = 10,
  sidebarWidth = 400,
  compactMode = false,
  autoHide = false,
  persistLayout = true,
  enableSearch = true,
  enableFiltering = true,
  showComponentMetrics = true
}) => {
  // Performance monitoring
  const { trackRender, trackEvent } = usePerformanceMonitor('EnterpriseQuickActionsSidebar')
  const { optimizeMemory } = useMemoryOptimization()
  const { loadComponent, registerComponentFactory } = useComponentLazyLoading()
  const { createVirtualizedList } = useVirtualization()

  // Reduced motion preference
  const shouldReduceMotion = useReducedMotion()

  // State management with reducer for better performance
  const [state, dispatch] = useReducer(sidebarReducer, {
    isOpen,
    isPinned: false,
    isExpanded: true,
    activeCategory: 'data-sources',
    searchQuery: '',
    isSearching: false,
    selectedFilters: [],
    sortBy: 'priority',
    loadedComponents: new Set(),
    loadingComponents: new Set(),
    errorComponents: new Set(),
    favorites: new Set(),
    hiddenCategories: new Set(),
    compactMode,
    showMetrics: showComponentMetrics,
    autoHide,
    contextualActionsOnly: false,
    maxComponentsPerCategory,
    sidebarWidth,
    animationSpeed: 300
  })

  // Deferred values for performance
  const deferredSearchQuery = useDeferredValue(state.searchQuery)
  const deferredActiveCategory = useDeferredValue(state.activeCategory)

  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<List>(null)
  const autoHideTimeoutRef = useRef<NodeJS.Timeout>()

  // Register component factories for Next.js compatibility
  useEffect(() => {
    // Register all quick action components with factory functions (only existing components)
    const componentFactories = [
      // Data Sources
      { id: 'QuickDataSourceCreate', factory: () => import('./quick-components/data-sources/QuickDataSourceCreate') },
      { id: 'QuickConnectionTest', factory: () => import('./quick-components/data-sources/QuickConnectionTest') },
      { id: 'QuickDataSourceStatus', factory: () => import('./quick-components/data-sources/QuickDataSourceStatus') },
      { id: 'QuickDataSourceMetrics', factory: () => import('./quick-components/data-sources/QuickDataSourceMetrics') },
      
      // Scan Rules
      { id: 'QuickRuleCreate', factory: () => import('./quick-components/scan-rule-sets/QuickRuleCreate') },
      { id: 'QuickRuleTest', factory: () => import('./quick-components/scan-rule-sets/QuickRuleTest') },
      { id: 'QuickRuleStatus', factory: () => import('./quick-components/scan-rule-sets/QuickRuleStatus') },
      { id: 'QuickRuleMetrics', factory: () => import('./quick-components/scan-rule-sets/QuickRuleMetrics') },
      
      // Classifications
      { id: 'QuickClassificationCreate', factory: () => import('./quick-components/classifications/QuickClassificationCreate') },
      { id: 'QuickClassificationApply', factory: () => import('./quick-components/classifications/QuickClassificationApply') },
      { id: 'QuickClassificationStatus', factory: () => import('./quick-components/classifications/QuickClassificationStatus') },
      { id: 'QuickClassificationMetrics', factory: () => import('./quick-components/classifications/QuickClassificationMetrics') },
      
      // Compliance
      { id: 'QuickComplianceCheck', factory: () => import('./quick-components/compliance-rule/QuickComplianceCheck') },
      { id: 'QuickAuditReport', factory: () => import('./quick-components/compliance-rule/QuickAuditReport') },
      { id: 'QuickComplianceStatus', factory: () => import('./quick-components/compliance-rule/QuickComplianceStatus') },
      { id: 'QuickComplianceMetrics', factory: () => import('./quick-components/compliance-rule/QuickComplianceMetrics') },
      
      // Advanced Catalog
      { id: 'QuickCatalogSearch', factory: () => import('./quick-components/advanced-catalog/QuickCatalogSearch') },
      { id: 'QuickAssetCreate', factory: () => import('./quick-components/advanced-catalog/QuickAssetCreate') },
      { id: 'QuickLineageView', factory: () => import('./quick-components/advanced-catalog/QuickLineageView') },
      { id: 'QuickCatalogMetrics', factory: () => import('./quick-components/advanced-catalog/QuickCatalogMetrics') },
      
      // Scan Logic
      { id: 'QuickScanStart', factory: () => import('./quick-components/scan-logic/QuickScanStart') },
      { id: 'QuickScanStatus', factory: () => import('./quick-components/scan-logic/QuickScanStatus') },
      { id: 'QuickScanResults', factory: () => import('./quick-components/scan-logic/QuickScanResults') },
      { id: 'QuickScanMetrics', factory: () => import('./quick-components/scan-logic/QuickScanMetrics') },
      
      // RBAC System
      { id: 'QuickUserCreate', factory: () => import('./quick-components/rbac-system/QuickUserCreate') },
      { id: 'QuickRoleAssign', factory: () => import('./quick-components/rbac-system/QuickRoleAssign') },
      { id: 'QuickPermissionCheck', factory: () => import('./quick-components/rbac-system/QuickPermissionCheck') },
      { id: 'QuickRBACMetrics', factory: () => import('./quick-components/rbac-system/QuickRBACMetrics') },
      
      // Racine Features (only existing components)
      { id: 'QuickAIChat', factory: () => import('./quick-components/racine-features/QuickAIChat') },
      { id: 'QuickDashboardCreate', factory: () => import('./quick-components/racine-features/QuickDashboardCreate') },
      { id: 'QuickActivityView', factory: () => import('./quick-components/racine-features/QuickActivityView') }
    ]

    componentFactories.forEach(({ id, factory }) => {
      registerComponentFactory(id, factory, {
        priority: 'medium',
        estimatedSize: 50000, // 50KB estimated
        preloadConditions: ['user-idle']
      })
    })
  }, [registerComponentFactory])

  // Optimized hooks
  const quickActions = useOptimizedQuickActions()
  const crossGroupIntegration = useOptimizedCrossGroupIntegration()
  const userManagement = useOptimizedUserManagement()
  const workspaceManagement = useOptimizedWorkspaceManagement()
  const activityTracker = useOptimizedActivityTracker()
  const userPreferences = useOptimizedUserPreferences()

  // Sync isOpen state with prop
  useEffect(() => {
    dispatch({ type: 'SET_OPEN', payload: isOpen })
  }, [isOpen])

  // Memoized user permissions
  const userPermissions = useMemo(() => {
    return userManagement?.getUserPermissions?.() || []
  }, [userManagement])

  // Memoized filtered categories
  const filteredCategories = useMemo(() => {
    return ACTION_CATEGORIES.filter(category => {
      // Check if user has permissions for this category
      if (category.adminOnly && !userPermissions.includes('rbac:admin')) {
        return false
      }
      
      if (category.permissions) {
        const hasPermission = category.permissions.some(permission =>
          userPermissions.includes(permission)
        )
        if (!hasPermission) {
          return false
        }
      }

      // Check if category is hidden
      if (state.hiddenCategories.has(category.id)) {
        return false
      }

      return true
    })
  }, [userPermissions, state.hiddenCategories])

  // Memoized filtered actions for active category
  const filteredActions = useMemo(() => {
    const activeCategory = filteredCategories.find(cat => cat.id === deferredActiveCategory)
    if (!activeCategory) return []

    let actions = activeCategory.actions

    // Filter by search query
    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase()
      actions = actions.filter(action =>
        action.name.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        action.tags.some(tag => tag.includes(query))
      )
    }

    // Filter by permissions
    actions = actions.filter(action => {
      if (action.permissions) {
        return action.permissions.some(permission =>
          userPermissions.includes(permission)
        )
      }
      return true
    })

    // Filter by selected filters
    if (state.selectedFilters.length > 0) {
      actions = actions.filter(action => {
        if (state.selectedFilters.includes('favorites') && !state.favorites.has(action.id)) {
          return false
        }
        if (state.selectedFilters.includes('quick') && !action.quickExecute) {
          return false
        }
        if (state.selectedFilters.includes('contextual') && !action.contextual) {
          return false
        }
        return true
      })
    }

    // Sort actions
    switch (state.sortBy) {
      case 'name':
        actions.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'usage':
        actions.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        break
      case 'recent':
        actions.sort((a, b) => {
          const aTime = a.lastUsed?.getTime() || 0
          const bTime = b.lastUsed?.getTime() || 0
          return bTime - aTime
        })
        break
      case 'priority':
      default:
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        actions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
        break
    }

    return actions.slice(0, state.maxComponentsPerCategory)
  }, [
    filteredCategories,
    deferredActiveCategory,
    deferredSearchQuery,
    userPermissions,
    state.selectedFilters,
    state.sortBy,
    state.maxComponentsPerCategory,
    state.favorites
  ])

  // Component loading handler
  const handleLoadComponent = useCallback(async (action: QuickAction) => {
    if (state.loadedComponents.has(action.id) || state.loadingComponents.has(action.id)) {
      return
    }

    dispatch({ type: 'ADD_LOADING_COMPONENT', payload: action.id })
    dispatch({ type: 'REMOVE_ERROR_COMPONENT', payload: action.id })

    try {
      await loadComponent(action.component)
      
      dispatch({ type: 'ADD_LOADED_COMPONENT', payload: action.id })
      
      if (enableAnalytics) {
        trackEvent('component_loaded', { 
          actionId: action.id, 
          component: action.component,
          context: currentContext 
        })
        
        activityTracker?.trackComponentUsage?.(action.id, 'load')
      }

    } catch (error) {
      console.error(`Failed to load component ${action.component}:`, error)
      dispatch({ type: 'ADD_ERROR_COMPONENT', payload: action.id })
      
      if (enableAnalytics) {
        trackEvent('component_load_failed', { 
          actionId: action.id, 
          component: action.component,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    } finally {
      dispatch({ type: 'REMOVE_LOADING_COMPONENT', payload: action.id })
    }
  }, [
    state.loadedComponents, 
    state.loadingComponents,
    loadComponent,
    enableAnalytics,
    trackEvent,
    activityTracker,
    currentContext
  ])

  // Action execution handler
  const handleExecuteAction = useCallback(async (action: QuickAction) => {
    try {
      // Load component if not already loaded
      if (!state.loadedComponents.has(action.id)) {
        await handleLoadComponent(action)
      }

      // Execute the action
      const result = await quickActions?.executeAction?.(action.id, {
        context: currentContext,
        workspace: workspaceManagement?.getActiveWorkspace?.(),
        user: userManagement?.getCurrentUser?.()
      })

      if (enableAnalytics) {
        trackEvent('action_executed', {
          actionId: action.id,
          context: currentContext,
          success: result?.success ?? false,
          executionTime: result?.executionTime ?? 0
        })

        activityTracker?.trackActionUsage?.(action.id)
      }

      // Update usage count
      action.usageCount = (action.usageCount || 0) + 1
      action.lastUsed = new Date()

    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error)
      
      if (enableAnalytics) {
        trackEvent('action_execution_failed', {
          actionId: action.id,
          context: currentContext,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }, [
    state.loadedComponents,
    handleLoadComponent,
    quickActions,
    currentContext,
    workspaceManagement,
    userManagement,
    enableAnalytics,
    trackEvent,
    activityTracker
  ])

  // Favorite toggle handler
  const handleToggleFavorite = useCallback(async (action: QuickAction) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: action.id })
    
    const isFavorited = state.favorites.has(action.id)
    
    if (persistLayout) {
      if (isFavorited) {
        await userPreferences?.removeFavoriteAction?.(action.id)
      } else {
        await userPreferences?.saveFavoriteAction?.(action.id)
      }
    }

    if (enableAnalytics) {
      trackEvent('favorite_toggled', { 
        actionId: action.id, 
        isFavorited: !isFavorited 
      })
    }
  }, [state.favorites, persistLayout, userPreferences, enableAnalytics, trackEvent])

  // Retry handler
  const handleRetry = useCallback((action: QuickAction) => {
    dispatch({ type: 'REMOVE_ERROR_COMPONENT', payload: action.id })
    handleLoadComponent(action)
  }, [handleLoadComponent])

  // Search handler
  const handleSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
    dispatch({ type: 'SET_SEARCHING', payload: true })
    
    setTimeout(() => {
      dispatch({ type: 'SET_SEARCHING', payload: false })
    }, 300)

    if (enableAnalytics) {
      trackEvent('search_performed', { query, context: currentContext })
    }
  }, [enableAnalytics, trackEvent, currentContext])

  // Auto-hide functionality
  useEffect(() => {
    if (state.autoHide && state.isOpen && !state.isPinned) {
      autoHideTimeoutRef.current = setTimeout(() => {
        onToggle()
      }, 10000) // Hide after 10 seconds of inactivity

      return () => {
        if (autoHideTimeoutRef.current) {
          clearTimeout(autoHideTimeoutRef.current)
        }
      }
    }
  }, [state.autoHide, state.isOpen, state.isPinned, onToggle])

  // Load user preferences
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const prefs = await userPreferences?.getQuickActionPreferences?.()
        if (prefs) {
          dispatch({ type: 'SET_PINNED', payload: prefs.isPinned || false })
          dispatch({ type: 'SET_COMPACT_MODE', payload: prefs.compactMode || false })
          dispatch({ type: 'SET_SHOW_METRICS', payload: prefs.showMetrics ?? true })
          dispatch({ type: 'SET_SIDEBAR_WIDTH', payload: prefs.sidebarWidth || sidebarWidth })
          
          if (prefs.favorites) {
            prefs.favorites.forEach((actionId: string) => {
              dispatch({ type: 'TOGGLE_FAVORITE', payload: actionId })
            })
          }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    }

    loadUserPreferences()
  }, [userPreferences, sidebarWidth])

  // Track render performance
  useEffect(() => {
    trackRender()
  })

  // Memory cleanup
  useEffect(() => {
    return () => {
      optimizeMemory()
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current)
      }
    }
  }, [optimizeMemory])

  // Virtualization data
  const virtualizationData = useMemo(() => ({
    actions: filteredActions,
    loadedComponents: state.loadedComponents,
    loadingComponents: state.loadingComponents,
    errorComponents: state.errorComponents,
    favorites: state.favorites,
    compactMode: state.compactMode,
    showMetrics: state.showMetrics,
    onExecute: handleExecuteAction,
    onLoad: handleLoadComponent,
    onToggleFavorite: handleToggleFavorite,
    onRetry: handleRetry
  }), [
    filteredActions,
    state.loadedComponents,
    state.loadingComponents,
    state.errorComponents,
    state.favorites,
    state.compactMode,
    state.showMetrics,
    handleExecuteAction,
    handleLoadComponent,
    handleToggleFavorite,
    handleRetry
  ])

  if (!state.isOpen) return null

  return (
    <EnterpriseQuickActionsErrorBoundary>
      <TooltipProvider>
        <AnimatePresence mode="wait">
          {state.isOpen && (
            <>
              {/* Backdrop for overlay mode */}
              {mode === 'overlay' && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                  onClick={!state.isPinned ? onToggle : undefined}
                />
              )}

              {/* Main sidebar */}
              <motion.div
                ref={sidebarRef}
                initial={shouldReduceMotion ? {} : {
                  x: position === 'right' ? state.sidebarWidth : -state.sidebarWidth,
                  opacity: 0
                }}
                animate={shouldReduceMotion ? {} : {
                  x: 0,
                  opacity: 1
                }}
                exit={shouldReduceMotion ? {} : {
                  x: position === 'right' ? state.sidebarWidth : -state.sidebarWidth,
                  opacity: 0
                }}
                transition={shouldReduceMotion ? {} : {
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                  duration: state.animationSpeed / 1000
                }}
                className={cn(
                  "fixed top-0 bottom-0 z-50 flex flex-col bg-background border-l border-border shadow-2xl",
                  position === 'left' && "left-0 border-l-0 border-r",
                  position === 'right' && "right-0",
                  mode === 'mini' && "w-16",
                  className
                )}
                style={{
                  width: mode === 'mini' ? 64 : state.sidebarWidth
                }}
                onMouseEnter={() => {
                  if (autoHideTimeoutRef.current) {
                    clearTimeout(autoHideTimeoutRef.current)
                  }
                }}
                onMouseLeave={() => {
                  if (state.autoHide && !state.isPinned) {
                    autoHideTimeoutRef.current = setTimeout(onToggle, 3000)
                  }
                }}
              >
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary-foreground" />
                      </div>
                      {mode !== 'mini' && (
                        <div>
                          <h2 className="font-semibold text-sm">Quick Actions</h2>
                          <p className="text-xs text-muted-foreground">
                            {filteredCategories.length} categories
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Pin/Unpin toggle */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => dispatch({ type: 'SET_PINNED', payload: !state.isPinned })}
                          >
                            {state.isPinned ? (
                              <PinOff className="w-4 h-4" />
                            ) : (
                              <Pin className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {state.isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                        </TooltipContent>
                      </Tooltip>

                      {/* Settings */}
                      {enableCustomization && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Customize sidebar
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Close button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={onToggle}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Close sidebar
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Search bar */}
                  {enableSearch && mode !== 'mini' && (
                    <div className="relative mt-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search quick actions..."
                        value={state.searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-4 h-9"
                      />
                      {state.isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Filter and sort controls */}
                  {enableFiltering && mode !== 'mini' && (
                    <div className="flex items-center gap-2 mt-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 flex-1">
                            <Filter className="w-3 h-3 mr-2" />
                            Filter
                            {state.selectedFilters.length > 0 && (
                              <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                                {state.selectedFilters.length}
                              </Badge>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuLabel>Filter Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={state.selectedFilters.includes('favorites')}
                            onCheckedChange={(checked) => {
                              const filters = checked 
                                ? [...state.selectedFilters, 'favorites']
                                : state.selectedFilters.filter(f => f !== 'favorites')
                              dispatch({ type: 'SET_SELECTED_FILTERS', payload: filters })
                            }}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Favorites only
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={state.selectedFilters.includes('quick')}
                            onCheckedChange={(checked) => {
                              const filters = checked 
                                ? [...state.selectedFilters, 'quick']
                                : state.selectedFilters.filter(f => f !== 'quick')
                              dispatch({ type: 'SET_SELECTED_FILTERS', payload: filters })
                            }}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Quick execute
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={state.selectedFilters.includes('contextual')}
                            onCheckedChange={(checked) => {
                              const filters = checked 
                                ? [...state.selectedFilters, 'contextual']
                                : state.selectedFilters.filter(f => f !== 'contextual')
                              dispatch({ type: 'SET_SELECTED_FILTERS', payload: filters })
                            }}
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Contextual
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-3">
                            <TrendingUp className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'priority' })}>
                            <Target className="w-4 h-4 mr-2" />
                            Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'name' })}>
                            <Hash className="w-4 h-4 mr-2" />
                            Name
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'usage' })}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Usage
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'recent' })}>
                            <Clock className="w-4 h-4 mr-2" />
                            Recent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Category tabs */}
                {mode !== 'mini' && (
                  <div className="flex-shrink-0 border-b border-border">
                    <Tabs 
                      value={state.activeCategory || undefined} 
                      onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: value })}
                    >
                      <TabsList className="w-full justify-start rounded-none border-none bg-transparent p-0">
                        <ScrollArea className="w-full">
                          <div className="flex w-max">
                            {filteredCategories.map((category) => (
                              <TabsTrigger
                                key={category.id}
                                value={category.id}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                              >
                                <category.icon className="w-4 h-4 mr-2" />
                                {category.name}
                                <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                                  {category.actions.length}
                                </Badge>
                              </TabsTrigger>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsList>
                    </Tabs>
                  </div>
                )}

                {/* Content area */}
                <div className="flex-1 overflow-hidden">
                  {filteredActions.length > 20 ? (
                    // Use virtualization for large lists
                    <List
                      ref={listRef}
                      height={600}
                      itemCount={filteredActions.length}
                      itemSize={state.compactMode ? 100 : 140}
                      itemData={virtualizationData}
                      className="p-2"
                    >
                      {VirtualizedActionItem}
                    </List>
                  ) : (
                    // Regular rendering for smaller lists
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-3">
                        <AnimatePresence>
                          {filteredActions.map((action, index) => (
                            <motion.div
                              key={action.id}
                              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                              exit={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
                              transition={shouldReduceMotion ? {} : { 
                                duration: 0.2, 
                                delay: index * 0.05,
                                ease: "easeOut"
                              }}
                            >
                              <QuickActionComponent
                                action={action}
                                isLoaded={state.loadedComponents.has(action.id)}
                                isLoading={state.loadingComponents.has(action.id)}
                                hasError={state.errorComponents.has(action.id)}
                                isFavorited={state.favorites.has(action.id)}
                                compactMode={state.compactMode}
                                showMetrics={state.showMetrics}
                                onExecute={handleExecuteAction}
                                onLoad={handleLoadComponent}
                                onToggleFavorite={handleToggleFavorite}
                                onRetry={handleRetry}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {filteredActions.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No actions available</p>
                            {state.searchQuery && (
                              <p className="text-xs mt-1">Try adjusting your search or filters</p>
                            )}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {state.loadedComponents.size} components loaded
                    </span>
                    {enableAnalytics && (
                      <span>
                        {filteredActions.reduce((sum, action) => sum + (action.usageCount || 0), 0)} executions
                      </span>
                    )}
                  </div>
                  
                  {state.loadingComponents.size > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading {state.loadingComponents.size} components...
                      </div>
                      <Progress 
                        value={(state.loadedComponents.size / (state.loadedComponents.size + state.loadingComponents.size)) * 100} 
                        className="h-1 mt-1"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </EnterpriseQuickActionsErrorBoundary>
  )
})

EnterpriseQuickActionsSidebar.displayName = 'EnterpriseQuickActionsSidebar'

export default EnterpriseQuickActionsSidebar