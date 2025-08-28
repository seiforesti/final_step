'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useDragControls, Reorder } from 'framer-motion'
import { ChevronRight, ChevronLeft, X, Pin, PinOff as Unpin, Settings, Search, Filter, MoreHorizontal, Maximize2, Minimize2, RotateCcw, Zap, Star, Clock, TrendingUp, Activity, Database, Shield, FileText, BookOpen, Scan, Users, Bot, MessageSquare, Workflow, BarChart3, Globe, Layers, Target, Briefcase, Archive, Bookmark, Eye, EyeOff, Hash, Calendar, Code, Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX, Wifi, WifiOff, Battery, Cpu, HardDrive, Server, Monitor, Smartphone, Tablet, Laptop, MousePointer, Keyboard, Headphones, Camera, Mic, Speaker, Printer, Gamepad2, Joystick, Radio, Tv, Watch, MapPin, Navigation, Compass, Map, Route, Car, Truck, Bus, Train, Plane, Ship, Rocket, Satellite, Radar, Power, Antenna, Signal, SignalHigh, SignalLow, SignalMedium, Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, XCircle, HelpCircle, DollarSign, Fullscreen, Sunrise, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind, Umbrella, Droplets, Thermometer, Snowflake } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Import racine foundation layers (already implemented)
import { useQuickActions } from '../hooks/optimized/useOptimizedQuickActions'
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration'
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement'
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement'
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker'
import { useUserPreferences } from '../hooks/optimized/useOptimizedUserPreferences'
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration'

// Import types (already implemented)
import {
  QuickAction,
  QuickActionCategory,
  QuickActionContext,
  QuickActionComponent,
  UserContext,
  SPAContext,
  WorkspaceState,
  UserPermissions,
  ActionResult,
  ComponentRegistry,
  ContextualAction,
  ActionHistory,
  ActionAnalytics,
  QuickActionLayout,
  SidebarConfiguration,
  AnimationPreset,
  ComponentDependency
} from '../../types/racine-core.types'

// Import utils (already implemented)
import { 
  getQuickActionIcon, 
  validateQuickActionContext, 
  optimizeComponentLoading,
  calculateComponentMetrics,
  generateActionId
} from '../../utils/quick-action-utils'
import { 
  checkActionPermissions, 
  validateUserAccess,
  getPermissionLevel 
} from '../../utils/security-utils'
import { 
  formatActionTime, 
  formatActionDescription,
  truncateText 
} from '../../utils/formatting-utils'

// Import constants (already implemented)
import { 
  QUICK_ACTION_CATEGORIES,
  SIDEBAR_ANIMATIONS,
  COMPONENT_SIZES,
  LAYOUT_PRESETS,
  PERFORMANCE_THRESHOLDS
} from '../../constants/quick-action-constants'

// Import subcomponents (will be implemented)
import { QuickActionsRegistry } from './QuickActionsRegistry'
import { ContextualActionsManager } from './ContextualActionsManager'
import { QuickActionsAnimations } from './QuickActionsAnimations'

// SPA Quick Components imports (will be implemented)
// Data Sources
import QuickDataSourceCreate from './quick-components/data-sources/QuickDataSourceCreate'
import QuickConnectionTest from './quick-components/data-sources/QuickConnectionTest'
import QuickDataSourceStatus from './quick-components/data-sources/QuickDataSourceStatus'
import QuickDataSourceMetrics from './quick-components/data-sources/QuickDataSourceMetrics'

// Scan Rule Sets
import QuickRuleCreate from './quick-components/scan-rule-sets/QuickRuleCreate'
import QuickRuleTest from './quick-components/scan-rule-sets/QuickRuleTest'
import QuickRuleStatus from './quick-components/scan-rule-sets/QuickRuleStatus'
import QuickRuleMetrics from './quick-components/scan-rule-sets/QuickRuleMetrics'

// Classifications
import QuickClassificationCreate from './quick-components/classifications/QuickClassificationCreate'
import QuickClassificationApply from './quick-components/classifications/QuickClassificationApply'
import QuickClassificationStatus from './quick-components/classifications/QuickClassificationStatus'
import QuickClassificationMetrics from './quick-components/classifications/QuickClassificationMetrics'

// Compliance Rule
import QuickComplianceCheck from './quick-components/compliance-rule/QuickComplianceCheck'
import QuickAuditReport from './quick-components/compliance-rule/QuickAuditReport'
import QuickComplianceStatus from './quick-components/compliance-rule/QuickComplianceStatus'
import QuickComplianceMetrics from './quick-components/compliance-rule/QuickComplianceMetrics'

// Advanced Catalog
import QuickCatalogSearch from './quick-components/advanced-catalog/QuickCatalogSearch'
import QuickAssetCreate from './quick-components/advanced-catalog/QuickAssetCreate'
import QuickLineageView from './quick-components/advanced-catalog/QuickLineageView'
import QuickCatalogMetrics from './quick-components/advanced-catalog/QuickCatalogMetrics'

// Scan Logic
import QuickScanStart from './quick-components/scan-logic/QuickScanStart'
import QuickScanStatus from './quick-components/scan-logic/QuickScanStatus'
import QuickScanResults from './quick-components/scan-logic/QuickScanResults'
import QuickScanMetrics from './quick-components/scan-logic/QuickScanMetrics'

// RBAC System
import QuickUserCreate from './quick-components/rbac-system/QuickUserCreate'
import QuickRoleAssign from './quick-components/rbac-system/QuickRoleAssign'
import QuickPermissionCheck from './quick-components/rbac-system/QuickPermissionCheck'
import QuickRBACMetrics from './quick-components/rbac-system/QuickRBACMetrics'

// Racine Features
import QuickWorkflowCreate from './quick-components/racine-features/QuickWorkflowCreate'
import QuickPipelineCreate from './quick-components/racine-features/QuickPipelineCreate'
import QuickAIChat from './quick-components/racine-features/QuickAIChat'
import QuickDashboardCreate from './quick-components/racine-features/QuickDashboardCreate'
import QuickTeamChat from './quick-components/racine-features/QuickTeamChat'
import QuickWorkspaceCreate from './quick-components/racine-features/QuickWorkspaceCreate'
import QuickActivityView from './quick-components/racine-features/QuickActivityView'

// Component registry for dynamic loading
const COMPONENT_REGISTRY: ComponentRegistry = {
  // Data Sources Components
  'data-sources-create': QuickDataSourceCreate,
  'data-sources-test': QuickConnectionTest,
  'data-sources-status': QuickDataSourceStatus,
  'data-sources-metrics': QuickDataSourceMetrics,
  
  // Scan Rule Sets Components
  'scan-rules-create': QuickRuleCreate,
  'scan-rules-test': QuickRuleTest,
  'scan-rules-status': QuickRuleStatus,
  'scan-rules-metrics': QuickRuleMetrics,
  
  // Classifications Components
  'classifications-create': QuickClassificationCreate,
  'classifications-apply': QuickClassificationApply,
  'classifications-status': QuickClassificationStatus,
  'classifications-metrics': QuickClassificationMetrics,
  
  // Compliance Rule Components
  'compliance-check': QuickComplianceCheck,
  'compliance-audit': QuickAuditReport,
  'compliance-status': QuickComplianceStatus,
  'compliance-metrics': QuickComplianceMetrics,
  
  // Advanced Catalog Components
  'catalog-search': QuickCatalogSearch,
  'catalog-asset': QuickAssetCreate,
  'catalog-lineage': QuickLineageView,
  'catalog-metrics': QuickCatalogMetrics,
  
  // Scan Logic Components
  'scan-start': QuickScanStart,
  'scan-status': QuickScanStatus,
  'scan-results': QuickScanResults,
  'scan-metrics': QuickScanMetrics,
  
  // RBAC System Components
  'rbac-user': QuickUserCreate,
  'rbac-role': QuickRoleAssign,
  'rbac-permission': QuickPermissionCheck,
  'rbac-metrics': QuickRBACMetrics,
  
  // Racine Features Components
  'racine-workflow': QuickWorkflowCreate,
  'racine-pipeline': QuickPipelineCreate,
  'racine-ai': QuickAIChat,
  'racine-dashboard': QuickDashboardCreate,
  'racine-chat': QuickTeamChat,
  'racine-workspace': QuickWorkspaceCreate,
  'racine-activity': QuickActivityView
}

// SPA Categories with enhanced metadata
const SPA_CATEGORIES = [
  {
    id: 'data-sources',
    name: 'Data Sources',
    icon: Database,
    color: 'bg-blue-500',
    description: 'Manage and configure data source connections',
    components: ['data-sources-create', 'data-sources-test', 'data-sources-status', 'data-sources-metrics'],
    priority: 1,
    permissions: ['datasource:read', 'datasource:write']
  },
  {
    id: 'scan-rule-sets',
    name: 'Scan Rules',
    icon: Shield,
    color: 'bg-green-500',
    description: 'Create and manage data scanning rules',
    components: ['scan-rules-create', 'scan-rules-test', 'scan-rules-status', 'scan-rules-metrics'],
    priority: 2,
    permissions: ['scanrules:read', 'scanrules:write']
  },
  {
    id: 'classifications',
    name: 'Classifications',
    icon: FileText,
    color: 'bg-purple-500',
    description: 'Apply and manage data classifications',
    components: ['classifications-create', 'classifications-apply', 'classifications-status', 'classifications-metrics'],
    priority: 3,
    permissions: ['classifications:read', 'classifications:write']
  },
  {
    id: 'compliance-rule',
    name: 'Compliance',
    icon: BookOpen,
    color: 'bg-red-500',
    description: 'Monitor and enforce compliance rules',
    components: ['compliance-check', 'compliance-audit', 'compliance-status', 'compliance-metrics'],
    priority: 4,
    permissions: ['compliance:read', 'compliance:write']
  },
  {
    id: 'advanced-catalog',
    name: 'Data Catalog',
    icon: Scan,
    color: 'bg-orange-500',
    description: 'Browse and manage data catalog assets',
    components: ['catalog-search', 'catalog-asset', 'catalog-lineage', 'catalog-metrics'],
    priority: 5,
    permissions: ['catalog:read', 'catalog:write']
  },
  {
    id: 'scan-logic',
    name: 'Scan Engine',
    icon: Activity,
    color: 'bg-indigo-500',
    description: 'Execute and monitor data scans',
    components: ['scan-start', 'scan-status', 'scan-results', 'scan-metrics'],
    priority: 6,
    permissions: ['scanning:read', 'scanning:execute']
  },
  {
    id: 'rbac-system',
    name: 'Access Control',
    icon: Users,
    color: 'bg-gray-500',
    description: 'Manage users, roles, and permissions',
    components: ['rbac-user', 'rbac-role', 'rbac-permission', 'rbac-metrics'],
    priority: 7,
    permissions: ['rbac:admin'],
    adminOnly: true
  },
  {
    id: 'racine-features',
    name: 'Racine Tools',
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Advanced workflow and orchestration tools',
    components: ['racine-workflow', 'racine-pipeline', 'racine-ai', 'racine-dashboard', 'racine-chat', 'racine-workspace', 'racine-activity'],
    priority: 8,
    permissions: ['racine:advanced']
  }
] as const

interface GlobalQuickActionsSidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentContext?: QuickActionContext
  className?: string
  position?: 'left' | 'right'
  mode?: 'overlay' | 'push' | 'mini'
  animationPreset?: keyof typeof SIDEBAR_ANIMATIONS
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
  enableGrouping?: boolean
  showComponentMetrics?: boolean
  onComponentLoad?: (componentId: string) => void
  onComponentError?: (componentId: string, error: Error) => void
  onActionExecute?: (action: QuickAction, result: ActionResult) => void
}

export const GlobalQuickActionsSidebar: React.FC<EnterpriseQuickActionsSidebarProps> = ({
  isOpen,
  onToggle,
  currentContext = 'global',
  className,
  position = 'right',
  mode = 'overlay',
  animationPreset = 'smooth',
  enableDragAndDrop = true,
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
  enableGrouping = true,
  showComponentMetrics = true,
  onComponentLoad,
  onComponentError,
  onActionExecute
}) => {
  // State management for comprehensive sidebar functionality
  const [activeCategory, setActiveCategory] = useState<string>('data-sources')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [filteredComponents, setFilteredComponents] = useState<string[]>([])
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set())
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set())
  const [errorComponents, setErrorComponents] = useState<Set<string>>(new Set())
  const [componentLayout, setComponentLayout] = useState<QuickActionLayout[]>([])
  const [customizedLayout, setCustomizedLayout] = useState<Record<string, QuickActionLayout[]>>({})
  const [isPinned, setIsPinned] = useState(false)
  const [isExpanded, setIsExpanded] = useState(!compactMode)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent' | 'priority'>('priority')
  const [componentMetrics, setComponentMetrics] = useState<Record<string, ActionAnalytics>>({})
  const [contextualActions, setContextualActions] = useState<ContextualAction[]>([])
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([])
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null)
  const [dropZone, setDropZone] = useState<string | null>(null)
  const [animationState, setAnimationState] = useState<'idle' | 'entering' | 'exiting'>('idle')
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfiguration>({
    width: sidebarWidth,
    position,
    mode,
    animationPreset,
    autoHide,
    compactMode,
    enableContextualActions,
    maxComponentsPerCategory,
    persistLayout
  })

  // Refs for DOM manipulation and performance optimization
  const sidebarRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver>()
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()
  const autoHideTimeoutRef = useRef<NodeJS.Timeout>()
  const analyticsIntervalRef = useRef<NodeJS.Timeout>()

  // Drag controls for reordering
  const dragControls = useDragControls()

  // Custom hooks for comprehensive functionality
  const quickActionsHook = useQuickActions() as any
  const qaOps = quickActionsHook?.operations ?? quickActionsHook?.[1] ?? quickActionsHook ?? {}
  const getContextActions = async (ctx: any) => { try { return await qaOps?.getContextualActions?.(ctx) ?? [] } catch { return [] } }
  const getFavoriteActions = async () => { try { return await qaOps?.getFavoriteActions?.() ?? [] } catch { return [] } }
  const getRecentActions = async (limit?: number) => { try { return await qaOps?.getRecentActions?.(limit) ?? [] } catch { return [] } }
  const executeAction = async (id: string, params?: any) => { try { return await qaOps?.executeAction?.(id, params) } catch { return { success: false, executionTime: 0 } } }
  const trackActionUsage = (id: string) => { try { qaOps?.trackActionUsage?.(id) } catch { /* noop */ } }
  const getActionAnalytics = async () => { try { return await qaOps?.getActionAnalytics?.() ?? {} } catch { return {} } }
  const saveActionPreferences = async (p: any) => { try { await qaOps?.saveUserPreferences?.(p) } catch { /* noop */ } }

  // Normalize cross-group integration hook (tuple or object)
  const crossGroup = useCrossGroupIntegration() as any
  const crossGroupState = crossGroup?.state ?? crossGroup?.[0] ?? {}
  const crossGroupOps = crossGroup?.operations ?? crossGroup?.[1] ?? crossGroup ?? {}
  const getActiveSPAContext = () => crossGroupState?.activeSPAContext || null
  const getAllSPAStatuses = () => crossGroupState?.groupStatuses || {}
  const canExecuteAction = (...args: any[]) => { try { return crossGroupOps?.canExecuteAction?.(...args) } catch { return false } }
  const getSPAPermissions = (...args: any[]) => { try { return crossGroupOps?.getSPAPermissions?.(...args) } catch { return [] } }
  const coordinateAction = async (...args: any[]) => { try { return await crossGroupOps?.coordinateAction?.(...args) } catch { /* noop */ } }

  // Normalize user management (tuple or object)
  const userHook = useUserManagement() as any
  const userState = userHook?.state ?? userHook?.[0] ?? {}
  const userOps = userHook?.operations ?? userHook?.[1] ?? userHook ?? {}
  const getCurrentUser = () => { try { return userOps?.getCurrentUser?.() ?? userState?.currentUser ?? null } catch { return null } }
  const getUserPermissions = () => { try { return userOps?.getUserPermissions?.() ?? (userState?.userPermissions || []) } catch { return [] } }
  const checkUserAccess = (permission: string, perms?: any[]) => {
    try {
      if (userOps?.checkUserAccess) return userOps.checkUserAccess(permission)
      const effective = perms || (userState?.userPermissions || [])
      return Array.isArray(effective) ? effective.includes(permission) : true
    } catch { return true }
  }

  // Normalize workspace management (tuple or object)
  const workspaceHook = useWorkspaceManagement() as any
  const workspaceState = workspaceHook?.state ?? workspaceHook?.[0] ?? {}
  const workspaceOps = workspaceHook?.operations ?? workspaceHook?.[1] ?? workspaceHook ?? {}
  const getActiveWorkspace = () => workspaceState?.currentWorkspace || null
  const getWorkspaceContext = () => { try { return workspaceOps?.getWorkspaceContext?.() ?? null } catch { return null } }

  const activityHook = useActivityTracker() as any
  const trackEvent = (name: string, payload?: any) => { try { activityHook?.operations?.trackEvent?.(name, payload) } catch { /* noop */ } }
  const trackComponentUsage = (id: string, action: string) => { try { activityHook?.operations?.trackComponentUsage?.(id, action) } catch { /* noop */ } }
  const getUsageAnalytics = async () => { try { return await activityHook?.operations?.getUsageAnalytics?.() ?? {} } catch { return {} } }

  // Normalize user preferences (tuple or object)
  const prefs = useUserPreferences() as any
  const prefsState = prefs?.state ?? prefs?.[0] ?? {}
  const prefsOps = prefs?.operations ?? prefs?.[1] ?? prefs ?? {}
  const getUserPreferences = () => { try { return prefsOps?.getUserPreferences?.() ?? prefsState?.userPreferences ?? {} } catch { return {} } }
  const updateUserPreferences = async (p: any) => { try { await prefsOps?.updateUserPreferences?.(p) } catch { /* noop */ } }
  const getSidebarPreferences = () => { try { return prefsOps?.getSidebarPreferences?.() ?? prefsState?.sidebarPreferences ?? {} } catch { return {} } }
  const updateSidebarPreferences = async (p: any) => { try { await prefsOps?.updateSidebarPreferences?.(p) } catch { /* noop */ } }

  const {
    getSystemMetrics,
    optimizePerformance
  } = useRacineOrchestration()

  // Get current context and user data
  const currentUser = getCurrentUser()
  const userPermissions: string[] = Array.isArray(getUserPermissions()) ? (getUserPermissions() as string[]) : []
  const activeSPAContext = getActiveSPAContext()
  const activeWorkspace = getActiveWorkspace()
  const workspaceContext = getWorkspaceContext()
  const userPreferences = getUserPreferences()
  const sidebarPreferences = getSidebarPreferences()

  // Load initial data and setup
  useEffect(() => {
    const initializeSidebar = async () => {
      try {
        // Load user preferences and restore layout
        if (persistLayout && sidebarPreferences.customLayout) {
          setCustomizedLayout(sidebarPreferences.customLayout)
        }

        // Load contextual actions if enabled
        if (enableContextualActions) {
          const contextActions = await getContextActions(currentContext)
          setContextualActions(contextActions)
        }

        // Load action analytics if enabled
        if (enableAnalytics) {
          try {
            const analytics = await getActionAnalytics()
            setComponentMetrics(analytics)
          } catch (e) {
            console.warn('getActionAnalytics failed, using defaults')
            setComponentMetrics(prev => ({ ...prev }))
          }
        }

        // Load recent actions and favorites
        const [recentActions, favoriteActions] = await Promise.all([
          getRecentActions(20),
          getFavoriteActions()
        ])

        setActionHistory(recentActions)

        // Setup performance monitoring
        if (enableAnalytics) {
          analyticsIntervalRef.current = setInterval(async () => {
            try {
              const metrics = await getUsageAnalytics()
              setComponentMetrics(prev => ({ ...prev, ...metrics }))
            } catch {
              // keep UI responsive
            }
          }, 30000) // Update every 30 seconds
        }

      } catch (error) {
        console.error('Failed to initialize sidebar:', error)
      }
    }

    initializeSidebar()

    return () => {
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current)
      }
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current)
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [
    currentContext,
    enableContextualActions,
    enableAnalytics,
    persistLayout,
    sidebarPreferences,
    getContextActions,
    getActionAnalytics,
    getRecentActions,
    getFavoriteActions,
    getUsageAnalytics
  ])

  // Handle component loading with error handling and performance optimization
  const loadComponent = useCallback(async (componentId: string) => {
    if (loadedComponents.has(componentId) || loadingComponents.has(componentId)) {
      return
    }

    setLoadingComponents(prev => new Set(prev).add(componentId))

    try {
      // Simulate component loading with proper error handling
      await new Promise(resolve => setTimeout(resolve, 200))

      // Check if component exists in registry
      if (!COMPONENT_REGISTRY[componentId]) {
        throw new Error(`Component ${componentId} not found in registry`)
      }

      // Validate user permissions
      const hasPermission = await checkUserAccess(componentId, userPermissions)
      if (!hasPermission) {
        throw new Error(`Insufficient permissions for component ${componentId}`)
      }

      setLoadedComponents(prev => new Set(prev).add(componentId))
      setErrorComponents(prev => {
        const newSet = new Set(prev)
        newSet.delete(componentId)
        return newSet
      })

      // Track component load
      if (enableAnalytics) {
        trackComponentUsage(componentId, 'load')
      }

      onComponentLoad?.(componentId)

    } catch (error) {
      console.error(`Failed to load component ${componentId}:`, error)
      setErrorComponents(prev => new Set(prev).add(componentId))
      onComponentError?.(componentId, error as Error)
    } finally {
      setLoadingComponents(prev => {
        const newSet = new Set(prev)
        newSet.delete(componentId)
        return newSet
      })
    }
  }, [
    loadedComponents,
    loadingComponents,
    userPermissions,
    enableAnalytics,
    checkUserAccess,
    trackComponentUsage,
    onComponentLoad,
    onComponentError
  ])

  // Handle search with debouncing and smart filtering
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)

    try {
      if (!query.trim()) {
        setFilteredComponents([])
        return
      }

      // Smart search across component names, descriptions, and categories
      const allComponents = Object.keys(COMPONENT_REGISTRY)
      const filtered = allComponents.filter(componentId => {
        const component = COMPONENT_REGISTRY[componentId]
        const category = SPA_CATEGORIES.find(cat => 
          cat.components.includes(componentId)
        )

        const searchText = `${componentId} ${category?.name} ${category?.description}`.toLowerCase()
        return searchText.includes(query.toLowerCase())
      })

      setFilteredComponents(filtered)

      // Track search analytics
      if (enableAnalytics) {
        trackEvent('quick_actions_search', {
          query,
          resultCount: filtered.length,
          context: currentContext
        })
      }

    } finally {
      setIsSearching(false)
    }
  }, [currentContext, enableAnalytics, trackEvent])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch])

  // Handle component execution with comprehensive tracking
  const executeComponent = useCallback(async (componentId: string, params?: any) => {
    try {
      // Load component if not already loaded
      if (!loadedComponents.has(componentId)) {
        await loadComponent(componentId)
      }

      // Execute the action
      const result = await executeAction(componentId, {
        context: currentContext,
        workspace: activeWorkspace,
        user: currentUser,
        spa: activeSPAContext,
        ...params
      })

      // Track execution
      if (enableAnalytics) {
        trackActionUsage(componentId)
        trackEvent('quick_action_executed', {
          componentId,
          context: currentContext,
          success: result.success,
          executionTime: result.executionTime
        })
      }

      // Update action history
      setActionHistory(prev => [{
        id: generateActionId(),
        componentId,
        timestamp: new Date().toISOString(),
        context: currentContext,
        result
      }, ...prev.slice(0, 19)])

      onActionExecute?.({
        id: componentId,
        label: componentId,
        description: '',
        icon: getQuickActionIcon(componentId),
        category: 'component',
        context: currentContext,
        enabled: true,
        priority: 'medium'
      }, result)

      return result

    } catch (error) {
      console.error(`Failed to execute component ${componentId}:`, error)
      
      if (enableAnalytics) {
        trackEvent('quick_action_failed', {
          componentId,
          context: currentContext,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      throw error
    }
  }, [
    loadedComponents,
    loadComponent,
    executeAction,
    currentContext,
    activeWorkspace,
    currentUser,
    activeSPAContext,
    enableAnalytics,
    trackActionUsage,
    trackEvent,
    onActionExecute
  ])

  // Handle drag and drop for component reordering
  const handleDragStart = useCallback((componentId: string) => {
    if (!enableDragAndDrop) return
    
    setDraggedComponent(componentId)
    setIsCustomizing(true)
  }, [enableDragAndDrop])

  const handleDragEnd = useCallback(() => {
    setDraggedComponent(null)
    setDropZone(null)
    setIsCustomizing(false)
  }, [])

  const handleDrop = useCallback((targetZone: string) => {
    if (!draggedComponent || !enableDragAndDrop) return

    // Update layout based on drop zone
    const newLayout = { ...customizedLayout }
    // Implementation would depend on specific layout logic
    
    setCustomizedLayout(newLayout)

    if (persistLayout) {
      updateSidebarPreferences({ customLayout: newLayout })
    }

    if (enableAnalytics) {
      trackEvent('quick_actions_reorder', {
        componentId: draggedComponent,
        targetZone,
        context: currentContext
      })
    }

    handleDragEnd()
  }, [
    draggedComponent,
    enableDragAndDrop,
    customizedLayout,
    persistLayout,
    updateSidebarPreferences,
    enableAnalytics,
    trackEvent,
    currentContext,
    handleDragEnd
  ])

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && isOpen && !isPinned) {
      autoHideTimeoutRef.current = setTimeout(() => {
        onToggle()
      }, 10000) // Hide after 10 seconds of inactivity

      return () => {
        if (autoHideTimeoutRef.current) {
          clearTimeout(autoHideTimeoutRef.current)
        }
      }
    }
  }, [autoHide, isOpen, isPinned, onToggle])

  // Filter components based on current category and search
  const getFilteredComponents = useCallback((categoryId: string) => {
    const category = SPA_CATEGORIES.find(cat => cat.id === categoryId)
    if (!category) return []

    let components = category.components

    // Apply search filter
    if (searchQuery.trim()) {
      components = components.filter(componentId =>
        filteredComponents.includes(componentId)
      )
    }

    // Apply permission filters
    components = components.filter(componentId => {
      return checkActionPermissions(componentId, userPermissions)
    })

    // Apply user-selected filters
    if (selectedFilters.length > 0) {
      components = components.filter(componentId => {
        // Implementation would depend on filter criteria
        return true
      })
    }

    // Sort components
    switch (sortBy) {
      case 'usage':
        components.sort((a, b) => {
          const aMetrics = componentMetrics[a]?.usageCount || 0
          const bMetrics = componentMetrics[b]?.usageCount || 0
          return bMetrics - aMetrics
        })
        break
      case 'recent':
        components.sort((a, b) => {
          const aTime = componentMetrics[a]?.lastUsed || 0
          const bTime = componentMetrics[b]?.lastUsed || 0
          return bTime - aTime
        })
        break
      case 'name':
        components.sort((a, b) => a.localeCompare(b))
        break
      case 'priority':
      default:
        // Keep original order for priority sorting
        break
    }

    return components.slice(0, maxComponentsPerCategory)
  }, [
    searchQuery,
    filteredComponents,
    userPermissions,
    selectedFilters,
    sortBy,
    componentMetrics,
    maxComponentsPerCategory,
    checkActionPermissions
  ])

  // Render component with error boundary and loading states
  const renderComponent = useCallback((componentId: string, index: number) => {
    const isLoading = loadingComponents.has(componentId)
    const hasError = errorComponents.has(componentId)
    const isLoaded = loadedComponents.has(componentId)
    const Component = COMPONENT_REGISTRY[componentId]
    const metrics = componentMetrics[componentId]

    return (
      <motion.div
        key={componentId}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.2, 
          delay: index * 0.05,
          ease: "easeOut"
        }}
        className={cn(
          "relative group",
          isCustomizing && "cursor-move",
          draggedComponent === componentId && "opacity-50"
        )}
        draggable={enableDragAndDrop}
        onDragStart={() => handleDragStart(componentId)}
        onDragEnd={handleDragEnd}
      >
        <div className="relative overflow-hidden rounded-lg border border-border/50 bg-card hover:border-border transition-all duration-200 hover:shadow-md">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            </div>
          )}

          {/* Error overlay */}
          {hasError && (
            <div className="absolute inset-0 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => loadComponent(componentId)}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Component content */}
          <div className="p-4">
            {isLoaded && Component ? (
              <Component
                onExecute={(params) => executeComponent(componentId, params)}
                context={currentContext}
                workspace={activeWorkspace}
                user={currentUser}
                compactMode={compactMode}
                showMetrics={showComponentMetrics}
                metrics={metrics}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{componentId}</h4>
                    <p className="text-xs text-muted-foreground">Quick action component</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => loadComponent(componentId)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 mr-2" />
                  )}
                  Load Component
                </Button>
              </div>
            )}
          </div>

          {/* Component metrics overlay */}
          {showComponentMetrics && metrics && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-muted-foreground">
                Used {metrics.usageCount || 0} times
              </div>
            </div>
          )}

          {/* Drag handle */}
          {enableDragAndDrop && isCustomizing && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
              <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                <MoreHorizontal className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }, [
    loadingComponents,
    errorComponents,
    loadedComponents,
    componentMetrics,
    isCustomizing,
    draggedComponent,
    enableDragAndDrop,
    handleDragStart,
    handleDragEnd,
    loadComponent,
    executeComponent,
    currentContext,
    activeWorkspace,
    currentUser,
    compactMode,
    showComponentMetrics
  ])

  // Render category section
  const renderCategory = useCallback((category: typeof SPA_CATEGORIES[0]) => {
    // Check if user has permission to access this category
    if (category.adminOnly && !userPermissions.includes('rbac:admin')) {
      return null
    }

    const hasRequiredPermissions = category.permissions.some(permission =>
      Array.isArray(userPermissions) && userPermissions.includes(permission)
    )

    if (!hasRequiredPermissions) {
      return null
    }

    const components = getFilteredComponents(category.id)
    const isActive = activeCategory === category.id

    if (!isActive && components.length === 0) {
      return null
    }

    return (
      <div key={category.id} className="space-y-3">
        <Collapsible open={isActive} onOpenChange={() => setActiveCategory(isActive ? '' : category.id)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between p-3 h-auto",
                isActive && "bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                  category.color
                )}>
                  <category.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {category.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {components.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {components.length}
                    </Badge>
                  )}
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    isActive && "rotate-90"
                  )} />
                </div>
              </div>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 pt-2">
            <AnimatePresence>
              {components.map((componentId, index) => 
                renderComponent(componentId, index)
              )}
            </AnimatePresence>
            
            {components.length === 0 && isActive && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No components available</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }, [
    userPermissions,
    activeCategory,
    getFilteredComponents,
    renderComponent
  ])

  // Handle sidebar visibility animation
  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering')
      const timer = setTimeout(() => setAnimationState('idle'), 300)
      return () => clearTimeout(timer)
    } else {
      setAnimationState('exiting')
    }
  }, [isOpen])

  if (!isOpen && animationState !== 'exiting') {
    return null
  }

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        {(isOpen || animationState === 'exiting') && (
          <>
            {/* Backdrop for overlay mode */}
            {mode === 'overlay' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                onClick={!isPinned ? onToggle : undefined}
              />
            )}

            {/* Main sidebar */}
            <motion.div
              ref={sidebarRef}
              initial={{
                x: position === 'right' ? sidebarConfig.width : -sidebarConfig.width,
                opacity: 0
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: position === 'right' ? sidebarConfig.width : -sidebarConfig.width,
                opacity: 0
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                duration: 0.3
              }}
              className={cn(
                "fixed top-0 bottom-0 z-50 flex flex-col bg-background border-l border-border shadow-2xl",
                position === 'left' && "left-0 border-l-0 border-r",
                position === 'right' && "right-0",
                mode === 'mini' && "w-16",
                className
              )}
              style={{
                width: mode === 'mini' ? 64 : sidebarConfig.width
              }}
              onMouseEnter={() => {
                if (autoHideTimeoutRef.current) {
                  clearTimeout(autoHideTimeoutRef.current)
                }
              }}
              onMouseLeave={() => {
                if (autoHide && !isPinned) {
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
                          {SPA_CATEGORIES.filter(cat => 
                            !cat.adminOnly || (Array.isArray(userPermissions) && userPermissions.includes('rbac:admin'))
                          ).length} categories
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
                          onClick={() => setIsPinned(!isPinned)}
                        >
                          {isPinned ? (
                            <Unpin className="w-4 h-4" />
                          ) : (
                            <Pin className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
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
                            onClick={() => setShowSettings(!showSettings)}
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-9"
                    />
                    {isSearching && (
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
                          {selectedFilters.length > 0 && (
                            <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                              {selectedFilters.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Filter Components</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={selectedFilters.includes('favorites')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFilters(prev => [...prev, 'favorites'])
                            } else {
                              setSelectedFilters(prev => prev.filter(f => f !== 'favorites'))
                            }
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Favorites only
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={selectedFilters.includes('recent')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFilters(prev => [...prev, 'recent'])
                            } else {
                              setSelectedFilters(prev => prev.filter(f => f !== 'recent'))
                            }
                          }}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Recently used
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
                        <DropdownMenuItem onClick={() => setSortBy('priority')}>
                          <Target className="w-4 h-4 mr-2" />
                          Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('name')}>
                          <Hash className="w-4 h-4 mr-2" />
                          Name
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('usage')}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Usage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('recent')}>
                          <Clock className="w-4 h-4 mr-2" />
                          Recent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Contextual actions */}
                    {enableContextualActions && contextualActions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-primary" />
                          <h3 className="font-medium text-sm">Suggested Actions</h3>
                        </div>
                        <div className="space-y-2">
                          {contextualActions.slice(0, 3).map((action, index) => (
                            <Card key={action.id} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <action.icon className="w-5 h-5 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{action.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </Card>
                          ))}
                        </div>
                        <Separator />
                      </div>
                    )}

                    {/* Recent actions */}
                    {actionHistory.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-medium text-sm">Recent Actions</h3>
                        </div>
                        <div className="space-y-1">
                          {actionHistory.slice(0, 3).map((action) => (
                            <div
                              key={action.id}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => executeComponent(action.componentId)}
                            >
                              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                                <Activity className="w-3 h-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{action.componentId}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatActionTime(action.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator />
                      </div>
                    )}

                    {/* SPA Categories */}
                    <div className="space-y-2">
                      {SPA_CATEGORIES.map(renderCategory)}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {loadedComponents.size} components loaded
                  </span>
                  {enableAnalytics && (
                    <span>
                      {Object.values(componentMetrics).reduce((sum, metrics) => sum + (metrics.usageCount || 0), 0)} actions
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Settings panel */}
            {showSettings && enableCustomization && (
              <Sheet open={showSettings} onOpenChange={setShowSettings}>
                <SheetContent side={position === 'right' ? 'left' : 'right'} className="w-80">
                  <SheetHeader>
                    <SheetTitle>Sidebar Settings</SheetTitle>
                    <SheetDescription>
                      Customize your quick actions sidebar experience
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    {/* Layout options */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Layout</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Compact mode</label>
                          <Switch
                            checked={compactMode}
                            onCheckedChange={(checked) => {
                              setSidebarConfig(prev => ({ ...prev, compactMode: checked }))
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm">Sidebar width</label>
                          <Slider
                            value={[sidebarConfig.width]}
                            onValueChange={([value]) => {
                              setSidebarConfig(prev => ({ ...prev, width: value }))
                            }}
                            min={320}
                            max={600}
                            step={20}
                            className="w-full"
                          />
                          <div className="text-xs text-muted-foreground">
                            {sidebarConfig.width}px
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Behavior options */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Behavior</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Auto-hide</label>
                          <Switch
                            checked={sidebarConfig.autoHide}
                            onCheckedChange={(checked) => {
                              setSidebarConfig(prev => ({ ...prev, autoHide: checked }))
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Contextual actions</label>
                          <Switch
                            checked={sidebarConfig.enableContextualActions}
                            onCheckedChange={(checked) => {
                              setSidebarConfig(prev => ({ ...prev, enableContextualActions: checked }))
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Persist layout</label>
                          <Switch
                            checked={sidebarConfig.persistLayout}
                            onCheckedChange={(checked) => {
                              setSidebarConfig(prev => ({ ...prev, persistLayout: checked }))
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reset button */}
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSidebarConfig({
                            width: sidebarWidth,
                            position,
                            mode,
                            animationPreset,
                            autoHide,
                            compactMode,
                            enableContextualActions,
                            maxComponentsPerCategory,
                            persistLayout
                          })
                          setCustomizedLayout({})
                          if (persistLayout) {
                            updateSidebarPreferences({ customLayout: {} })
                          }
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset to defaults
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}

export default GlobalQuickActionsSidebar