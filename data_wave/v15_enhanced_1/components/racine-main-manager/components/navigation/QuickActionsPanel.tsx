'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap,
  X,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Plus,
  Play,
  Pause,
  Stop,
  Edit3,
  Copy,
  Share2,
  Download,
  Upload,
  Refresh,
  Settings,
  Star,
  Heart,
  Bookmark,
  Clock,
  History,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Workflow,
  Bot,
  MessageSquare,
  Globe,
  User,
  Tag,
  Hash,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Archive,
  Trash2,
  ExternalLink,
  Command,
  Layers,
  Folder,
  FolderOpen,
  Save,
  Send,
  Mail,
  Phone,
  Link2,
  Image,
  Video,
  File,
  Code,
  Terminal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import racine foundation layers (already implemented)
import { useQuickActions } from '../../hooks/useQuickActions'
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement'
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { useAIAssistant } from '../../hooks/useAIAssistant'
import { useUserPreferences } from '../../hooks/useUserPreferences'
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration'

// Import types (already implemented)
import {
  QuickAction,
  ActionCategory,
  ActionContext,
  UserContext,
  WorkspaceState,
  SPAContext,
  ActionHistory,
  ContextualAction,
  ActionTemplate,
  ActionShortcut
} from '../../types/racine-core.types'

// Import utils (already implemented)
import { 
  getContextualActions,
  executeQuickAction,
  categorizeActions,
  filterActionsByPermissions,
  getActionShortcuts
} from '../../utils/quick-actions-utils'
import { checkPermissions } from '../../utils/security-utils'
import { formatActionTime, getActionIcon } from '../../utils/navigation-utils'

// Import constants (already implemented)
import {
  QUICK_ACTION_CATEGORIES,
  ACTION_SHORTCUTS,
  MAX_RECENT_ACTIONS,
  DEFAULT_ACTION_CONFIGS
} from '../../constants/cross-group-configs'

// Import subcomponents
import { ActionSearchBar } from './subcomponents/ActionSearchBar'
import { ActionCategoryFilter } from './subcomponents/ActionCategoryFilter'
import { ActionTemplateManager } from './subcomponents/ActionTemplateManager'
import { ActionHistoryViewer } from './subcomponents/ActionHistoryViewer'
import { ActionShortcutManager } from './subcomponents/ActionShortcutManager'

// SPA-specific quick actions configuration
const SPA_QUICK_ACTIONS = {
  'data-sources': {
    name: 'Data Sources',
    icon: Database,
    color: 'bg-blue-500',
    actions: [
      {
        id: 'create-connection',
        label: 'Create Connection',
        icon: Plus,
        description: 'Add a new data source connection',
        category: 'create',
        permissions: ['spa:data-sources', 'action:create'],
        shortcut: 'c',
        url: '/v15_enhanced_1/components/data-sources/connections/new'
      },
      {
        id: 'test-connections',
        label: 'Test All Connections',
        icon: Activity,
        description: 'Test connectivity for all data sources',
        category: 'manage',
        permissions: ['spa:data-sources', 'action:test'],
        action: 'test-connections'
      },
      {
        id: 'view-monitoring',
        label: 'View Monitoring',
        icon: BarChart3,
        description: 'Open data source monitoring dashboard',
        category: 'view',
        permissions: ['spa:data-sources'],
        url: '/v15_enhanced_1/components/data-sources/monitoring'
      },
      {
        id: 'sync-metadata',
        label: 'Sync Metadata',
        icon: Refresh,
        description: 'Synchronize metadata for all sources',
        category: 'manage',
        permissions: ['spa:data-sources', 'action:sync'],
        action: 'sync-metadata'
      }
    ]
  },
  'scan-rule-sets': {
    name: 'Scan Rule Sets',
    icon: Shield,
    color: 'bg-purple-500',
    actions: [
      {
        id: 'create-rule',
        label: 'Create Rule',
        icon: Plus,
        description: 'Create a new scanning rule',
        category: 'create',
        permissions: ['spa:scan-rule-sets', 'action:create'],
        shortcut: 'r',
        url: '/v15_enhanced_1/components/Advanced-Scan-Rule-Sets/rules/new'
      },
      {
        id: 'validate-rules',
        label: 'Validate Rules',
        icon: Shield,
        description: 'Validate all scanning rules',
        category: 'manage',
        permissions: ['spa:scan-rule-sets', 'action:validate'],
        action: 'validate-rules'
      },
      {
        id: 'export-rules',
        label: 'Export Rules',
        icon: Download,
        description: 'Export rules configuration',
        category: 'export',
        permissions: ['spa:scan-rule-sets', 'action:export'],
        action: 'export-rules'
      }
    ]
  },
  'classifications': {
    name: 'Classifications',
    icon: FileText,
    color: 'bg-green-500',
    actions: [
      {
        id: 'create-label',
        label: 'Create Label',
        icon: Tag,
        description: 'Create a new classification label',
        category: 'create',
        permissions: ['spa:classifications', 'action:create'],
        shortcut: 'l',
        url: '/v15_enhanced_1/components/classifications/labels/new'
      },
      {
        id: 'auto-classify',
        label: 'Auto Classify',
        icon: Bot,
        description: 'Run automatic classification',
        category: 'ai',
        permissions: ['spa:classifications', 'action:auto-classify'],
        action: 'auto-classify'
      },
      {
        id: 'view-taxonomies',
        label: 'View Taxonomies',
        icon: Layers,
        description: 'Browse classification taxonomies',
        category: 'view',
        permissions: ['spa:classifications'],
        url: '/v15_enhanced_1/components/classifications/taxonomies'
      }
    ]
  },
  'compliance-rule': {
    name: 'Compliance Rules',
    icon: BookOpen,
    color: 'bg-orange-500',
    actions: [
      {
        id: 'create-regulation',
        label: 'Create Regulation',
        icon: BookOpen,
        description: 'Define a new compliance regulation',
        category: 'create',
        permissions: ['spa:compliance-rule', 'action:create'],
        url: '/v15_enhanced_1/components/Compliance-Rule/regulations/new'
      },
      {
        id: 'run-audit',
        label: 'Run Audit',
        icon: Search,
        description: 'Execute compliance audit',
        category: 'manage',
        permissions: ['spa:compliance-rule', 'action:audit'],
        action: 'run-audit'
      },
      {
        id: 'generate-report',
        label: 'Generate Report',
        icon: FileText,
        description: 'Create compliance report',
        category: 'export',
        permissions: ['spa:compliance-rule', 'action:report'],
        action: 'generate-report'
      }
    ]
  },
  'advanced-catalog': {
    name: 'Advanced Catalog',
    icon: Scan,
    color: 'bg-teal-500',
    actions: [
      {
        id: 'discover-assets',
        label: 'Discover Assets',
        icon: Search,
        description: 'Run asset discovery scan',
        category: 'manage',
        permissions: ['spa:advanced-catalog', 'action:discover'],
        action: 'discover-assets'
      },
      {
        id: 'view-lineage',
        label: 'View Lineage',
        icon: Workflow,
        description: 'Open data lineage viewer',
        category: 'view',
        permissions: ['spa:advanced-catalog'],
        url: '/v15_enhanced_1/components/Advanced-Catalog/lineage'
      },
      {
        id: 'update-metadata',
        label: 'Update Metadata',
        icon: Refresh,
        description: 'Refresh asset metadata',
        category: 'manage',
        permissions: ['spa:advanced-catalog', 'action:update'],
        action: 'update-metadata'
      }
    ]
  },
  'scan-logic': {
    name: 'Scan Logic',
    icon: Activity,
    color: 'bg-indigo-500',
    actions: [
      {
        id: 'create-workflow',
        label: 'Create Workflow',
        icon: Workflow,
        description: 'Design a new scan workflow',
        category: 'create',
        permissions: ['spa:scan-logic', 'action:create'],
        url: '/v15_enhanced_1/components/Advanced-Scan-Logic/workflows/new'
      },
      {
        id: 'execute-scan',
        label: 'Execute Scan',
        icon: Play,
        description: 'Run a scan job',
        category: 'manage',
        permissions: ['spa:scan-logic', 'action:execute'],
        action: 'execute-scan'
      },
      {
        id: 'view-results',
        label: 'View Results',
        icon: BarChart3,
        description: 'Check scan results',
        category: 'view',
        permissions: ['spa:scan-logic'],
        url: '/v15_enhanced_1/components/Advanced-Scan-Logic/results'
      }
    ]
  },
  'rbac-system': {
    name: 'RBAC System',
    icon: Users,
    color: 'bg-red-500',
    actions: [
      {
        id: 'create-user',
        label: 'Create User',
        icon: User,
        description: 'Add a new user',
        category: 'create',
        permissions: ['spa:rbac-system', 'rbac:admin', 'action:create'],
        url: '/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System/users/new'
      },
      {
        id: 'manage-roles',
        label: 'Manage Roles',
        icon: Shield,
        description: 'Configure user roles',
        category: 'manage',
        permissions: ['spa:rbac-system', 'rbac:admin'],
        url: '/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System/roles'
      },
      {
        id: 'audit-permissions',
        label: 'Audit Permissions',
        icon: Search,
        description: 'Review permission assignments',
        category: 'manage',
        permissions: ['spa:rbac-system', 'rbac:admin', 'action:audit'],
        action: 'audit-permissions'
      }
    ],
    adminOnly: true
  }
} as const

// Racine feature quick actions
const RACINE_QUICK_ACTIONS = {
  'dashboard': [
    {
      id: 'create-dashboard',
      label: 'Create Dashboard',
      icon: Plus,
      description: 'Build a new dashboard',
      category: 'create',
      url: '/racine/dashboard/new'
    },
    {
      id: 'refresh-metrics',
      label: 'Refresh Metrics',
      icon: Refresh,
      description: 'Update all dashboard metrics',
      category: 'manage',
      action: 'refresh-metrics'
    }
  ],
  'workspace': [
    {
      id: 'create-workspace',
      label: 'Create Workspace',
      icon: Globe,
      description: 'Set up a new workspace',
      category: 'create',
      url: '/racine/workspace/new'
    },
    {
      id: 'switch-workspace',
      label: 'Switch Workspace',
      icon: Globe,
      description: 'Change current workspace',
      category: 'manage',
      action: 'switch-workspace'
    }
  ],
  'ai': [
    {
      id: 'ask-assistant',
      label: 'Ask AI Assistant',
      icon: Bot,
      description: 'Get AI-powered help',
      category: 'ai',
      url: '/racine/ai-assistant'
    },
    {
      id: 'get-recommendations',
      label: 'Get Recommendations',
      icon: Star,
      description: 'View AI recommendations',
      category: 'ai',
      action: 'get-recommendations'
    }
  ]
} as const

// Global quick actions (always available)
const GLOBAL_QUICK_ACTIONS = [
  {
    id: 'global-search',
    label: 'Global Search',
    icon: Search,
    description: 'Search across all SPAs',
    category: 'navigate',
    shortcut: 'cmd+k',
    action: 'open-global-search'
  },
  {
    id: 'command-palette',
    label: 'Command Palette',
    icon: Command,
    description: 'Open command palette',
    category: 'navigate',
    shortcut: 'cmd+p',
    action: 'open-command-palette'
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    icon: Eye,
    description: 'Switch between light/dark mode',
    category: 'settings',
    shortcut: 'cmd+shift+l',
    action: 'toggle-theme'
  },
  {
    id: 'user-settings',
    label: 'User Settings',
    icon: Settings,
    description: 'Open user preferences',
    category: 'settings',
    url: '/racine/user-management'
  }
] as const

interface QuickActionsPanelProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  trigger?: React.ReactNode
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  isOpen,
  onClose,
  className,
  trigger
}) => {
  // Core state management using foundation hooks
  const {
    quickActions,
    contextualActions,
    recentActions,
    favoriteActions,
    getContextualActions,
    executeQuickAction,
    addToFavorites,
    removeFromFavorites,
    getActionHistory,
    createActionTemplate,
    getActionShortcuts,
    updateActionShortcuts
  } = useQuickActions()

  const {
    crossGroupState,
    getCurrentSPAContext,
    getNavigationContext,
    orchestrateAction
  } = useCrossGroupIntegration()

  const {
    userContext,
    checkUserAccess,
    getUserPermissions
  } = useUserManagement()

  const {
    workspaceState,
    currentWorkspace,
    getWorkspaceContext
  } = useWorkspaceManagement()

  const {
    trackActionUsage,
    getActionAnalytics,
    recordActionExecution
  } = useActivityTracker()

  const {
    aiInsights,
    getActionRecommendations,
    analyzeUserPatterns
  } = useAIAssistant()

  const {
    actionPreferences,
    updateActionPreferences,
    getCustomShortcuts
  } = useUserPreferences()

  const {
    orchestrationState,
    executeWorkflow
  } = useRacineOrchestration()

  // Local state
  const [selectedTab, setSelectedTab] = useState<'contextual' | 'recent' | 'favorites' | 'all'>('contextual')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contextual: true,
    spa: true,
    racine: true,
    global: true
  })
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([])
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({})
  const [templates, setTemplates] = useState<ActionTemplate[]>([])
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const [isShortcutManagerOpen, setIsShortcutManagerOpen] = useState(false)
  const [draggedAction, setDraggedAction] = useState<QuickAction | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  // Get current SPA context
  const currentSPAContext = useMemo(() => {
    return getCurrentSPAContext()
  }, [getCurrentSPAContext])

  // Get current SPA actions
  const currentSPAActions = useMemo(() => {
    if (!currentSPAContext?.spaKey) return []
    
    const spaConfig = SPA_QUICK_ACTIONS[currentSPAContext.spaKey as keyof typeof SPA_QUICK_ACTIONS]
    if (!spaConfig) return []

    return spaConfig.actions.filter(action => 
      filterActionsByPermissions(action, userContext, checkUserAccess)
    )
  }, [currentSPAContext, userContext, checkUserAccess])

  // Get contextual actions based on current location
  const currentContextualActions = useMemo(() => {
    const actions: QuickAction[] = []

    // Add current SPA actions
    actions.push(...currentSPAActions)

    // Add global actions
    actions.push(...GLOBAL_QUICK_ACTIONS.filter(action => 
      filterActionsByPermissions(action, userContext, checkUserAccess)
    ))

    // Add AI-recommended actions
    if (aiInsights?.recommendedActions) {
      actions.push(...aiInsights.recommendedActions)
    }

    return actions
  }, [currentSPAActions, userContext, checkUserAccess, aiInsights])

  // Filter actions based on search and category
  const filteredActions = useMemo(() => {
    let actions = selectedTab === 'contextual' ? currentContextualActions :
                 selectedTab === 'recent' ? recentActions :
                 selectedTab === 'favorites' ? favoriteActions :
                 [...currentContextualActions, ...recentActions, ...favoriteActions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      actions = actions.filter(action =>
        action.label.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        action.category.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      actions = actions.filter(action => action.category === selectedCategory)
    }

    return actions
  }, [selectedTab, currentContextualActions, recentActions, favoriteActions, searchQuery, selectedCategory])

  // Group actions by category
  const groupedActions = useMemo(() => {
    return categorizeActions(filteredActions)
  }, [filteredActions])

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [history, customShortcuts, userTemplates] = await Promise.all([
          getActionHistory(50),
          getCustomShortcuts(),
          // getActionTemplates() - would be implemented
        ])

        setActionHistory(history)
        setShortcuts(customShortcuts)
        // setTemplates(userTemplates)
      } catch (error) {
        console.error('Failed to load user action data:', error)
      }
    }

    if (isOpen) {
      loadUserData()
    }
  }, [isOpen, getActionHistory, getCustomShortcuts])

  // Handle action execution
  const handleActionExecution = useCallback(async (action: QuickAction) => {
    try {
      // Track action usage
      trackActionUsage({
        actionId: action.id,
        source: 'quick_actions_panel',
        context: currentSPAContext,
        timestamp: new Date()
      })

      // Execute the action
      if (action.url) {
        router.push(action.url)
        onClose()
      } else if (action.action) {
        await executeQuickAction(action.action, {
          context: currentSPAContext,
          workspace: currentWorkspace,
          user: userContext
        })
      }

      // Record execution
      recordActionExecution({
        actionId: action.id,
        executionTime: new Date(),
        success: true,
        context: currentSPAContext
      })

    } catch (error) {
      console.error('Action execution failed:', error)
      recordActionExecution({
        actionId: action.id,
        executionTime: new Date(),
        success: false,
        error: error.message,
        context: currentSPAContext
      })
    }
  }, [
    trackActionUsage,
    currentSPAContext,
    router,
    onClose,
    executeQuickAction,
    currentWorkspace,
    userContext,
    recordActionExecution
  ])

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (action: QuickAction) => {
    try {
      const isFavorite = favoriteActions.some(fav => fav.id === action.id)
      
      if (isFavorite) {
        await removeFromFavorites(action.id)
      } else {
        await addToFavorites(action)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [favoriteActions, removeFromFavorites, addToFavorites])

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  // Render action item
  const renderActionItem = useCallback((action: QuickAction, index: number) => {
    const isFavorite = favoriteActions.some(fav => fav.id === action.id)
    const shortcut = shortcuts[action.id] || action.shortcut
    const ActionIcon = action.icon || Zap

    return (
      <motion.div
        key={action.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
          "hover:border-primary/30 hover:shadow-md hover:bg-muted/50"
        )}
        onClick={() => handleActionExecution(action)}
        draggable
        onDragStart={() => setDraggedAction(action)}
        onDragEnd={() => setDraggedAction(null)}
      >
        <div className="flex items-start gap-3">
          {/* Action icon */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            )}>
              <ActionIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Action content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {action.label}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {action.description}
                </p>
              </div>

              {/* Action controls */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFavoriteToggle(action)
                      }}
                    >
                      <Heart className={cn(
                        "w-3 h-3",
                        isFavorite ? "fill-current text-red-500" : "text-muted-foreground"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleActionExecution(action)}>
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => handleFavoriteToggle(action)}>
                      <Heart className="w-4 h-4 mr-2" />
                      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => {
                      // Copy action details
                      navigator.clipboard.writeText(JSON.stringify(action, null, 2))
                    }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Details
                    </DropdownMenuItem>
                    
                    {action.url && (
                      <DropdownMenuItem onClick={() => window.open(action.url, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => {
                      // Create template from action
                      setIsTemplateManagerOpen(true)
                    }}>
                      <Save className="w-4 h-4 mr-2" />
                      Save as Template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Action metadata */}
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-xs">
                {action.category}
              </Badge>
              
              {shortcut && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                  {shortcut}
                </kbd>
              )}
              
              {action.permissions && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {action.permissions.length} permissions
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {action.permissions.map((permission, index) => (
                        <p key={index} className="text-xs">{permission}</p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }, [favoriteActions, shortcuts, handleActionExecution, handleFavoriteToggle, setIsTemplateManagerOpen])

  // Render section header
  const renderSectionHeader = useCallback((title: string, sectionKey: string, actions: QuickAction[]) => {
    const isExpanded = expandedSections[sectionKey]
    const count = actions.length

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionKey)}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-2">
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                !isExpanded && "-rotate-90"
              )} />
              <h3 className="font-semibold text-sm">{title}</h3>
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-2">
          {actions.map((action, index) => renderActionItem(action, index))}
        </CollapsibleContent>
      </Collapsible>
    )
  }, [expandedSections, toggleSection, renderActionItem])

  // Render actions by category
  const renderActionsByCategory = useCallback(() => {
    if (filteredActions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Zap className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No actions found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or category filters
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {Object.entries(groupedActions).map(([category, actions]) => 
          renderSectionHeader(
            category.charAt(0).toUpperCase() + category.slice(1),
            category,
            actions
          )
        )}
      </div>
    )
  }, [filteredActions, groupedActions, renderSectionHeader])

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className={cn("w-[400px] sm:w-[500px]", className)} side="right">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </SheetTitle>
              
              <div className="flex items-center gap-2">
                {/* Templates manager */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsTemplateManagerOpen(true)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage Templates</p>
                  </TooltipContent>
                </Tooltip>

                {/* Shortcuts manager */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsShortcutManagerOpen(true)}
                    >
                      <Command className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage Shortcuts</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Search and filters */}
            <div className="space-y-3">
              <ActionSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search actions..."
              />
              
              <ActionCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={QUICK_ACTION_CATEGORIES}
              />
            </div>

            {/* Tab navigation */}
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="contextual" className="text-xs">
                  Contextual
                </TabsTrigger>
                <TabsTrigger value="recent" className="text-xs">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="favorites" className="text-xs">
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </SheetHeader>

          {/* Actions content */}
          <div className="mt-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {/* Current context info */}
                {currentSPAContext && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center",
                        SPA_QUICK_ACTIONS[currentSPAContext.spaKey as keyof typeof SPA_QUICK_ACTIONS]?.color || "bg-muted"
                      )}>
                        {SPA_QUICK_ACTIONS[currentSPAContext.spaKey as keyof typeof SPA_QUICK_ACTIONS]?.icon && (
                          React.createElement(SPA_QUICK_ACTIONS[currentSPAContext.spaKey as keyof typeof SPA_QUICK_ACTIONS].icon, { className: "w-4 h-4 text-white" })
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">
                          {SPA_QUICK_ACTIONS[currentSPAContext.spaKey as keyof typeof SPA_QUICK_ACTIONS]?.name || 'Current Context'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {currentContextualActions.length} actions available
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions list */}
                {renderActionsByCategory()}
              </div>
            </ScrollArea>
          </div>

          {/* Action Templates Manager Modal */}
          <ActionTemplateManager
            isOpen={isTemplateManagerOpen}
            onClose={() => setIsTemplateManagerOpen(false)}
            templates={templates}
            onTemplateCreate={createActionTemplate}
          />

          {/* Action Shortcuts Manager Modal */}
          <ActionShortcutManager
            isOpen={isShortcutManagerOpen}
            onClose={() => setIsShortcutManagerOpen(false)}
            shortcuts={shortcuts}
            onShortcutsUpdate={updateActionShortcuts}
          />

          {/* Action History Viewer */}
          <ActionHistoryViewer
            history={actionHistory}
            onActionReplay={handleActionExecution}
          />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}

export default QuickActionsPanel