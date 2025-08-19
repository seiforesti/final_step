'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight,
  Home,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Pin,
  Unpin,
  Bookmark,
  Share2,
  History,
  Clock,
  Navigation,
  MapPin,
  Compass,
  Route,
  Map,
  FileText,
  Database,
  Shield,
  BookOpen,
  Scan,
  Activity,
  Users,
  BarChart3,
  Workflow,
  Zap,
  Bot,
  MessageSquare,
  Settings,
  Globe,
  Target,
  Layers,
  Folder,
  FolderOpen,
  Hash,
  Tag,
  Calendar,
  User,
  Building,
  Search,
  Filter,
  Star,
  Edit3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// Import racine foundation layers (already implemented)
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement'
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { useNavigationAnalytics } from '../../hooks/useNavigationAnalytics'
import { useBreadcrumbManager } from '../../hooks/useBreadcrumbManager'
import { useUserPreferences } from '../../hooks/useUserPreferences'

// Import types (already implemented)
import {
  BreadcrumbItem,
  NavigationContext,
  UserContext,
  WorkspaceState,
  SPAContext,
  BreadcrumbConfig,
  NavigationHistory,
  ContextualAction
} from '../../types/racine-core.types'

// Import utils (already implemented)
import { 
  parseBreadcrumbPath, 
  generateBreadcrumbItems,
  getContextualActions,
  formatBreadcrumbLabel
} from '../../utils/navigation-utils'
import { checkPermissions } from '../../utils/security-utils'
import { extractPathMetadata, generateSEOFriendlyPath } from '../../utils/path-utils'

// Import constants (already implemented)
import {
  BREADCRUMB_CONFIGS,
  MAX_BREADCRUMB_ITEMS,
  BREADCRUMB_SEPARATOR_TYPES
} from '../../constants/cross-group-configs'

// SPA route configurations for breadcrumb parsing
const SPA_ROUTE_CONFIGS = {
  'data-sources': {
    name: 'Data Sources',
    icon: Database,
    color: 'text-blue-600',
    basePath: '/v15_enhanced_1/components/data-sources',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/connections': { label: 'Connections', icon: Database },
      '/connections/:id': { label: 'Connection Details', icon: Database, dynamic: true },
      '/monitoring': { label: 'Monitoring', icon: Activity },
      '/performance': { label: 'Performance', icon: BarChart3 },
      '/settings': { label: 'Settings', icon: Settings }
    },
    contextExtractors: {
      connection: (path: string) => {
        const match = path.match(/\/connections\/([^\/]+)/)
        return match ? { type: 'connection', id: match[1] } : null
      }
    }
  },
  'scan-rule-sets': {
    name: 'Scan Rule Sets',
    icon: Shield,
    color: 'text-purple-600',
    basePath: '/v15_enhanced_1/components/Advanced-Scan-Rule-Sets',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/rules': { label: 'Rules', icon: Shield },
      '/rules/:id': { label: 'Rule Details', icon: Shield, dynamic: true },
      '/policies': { label: 'Policies', icon: BookOpen },
      '/templates': { label: 'Templates', icon: FileText },
      '/validation': { label: 'Validation', icon: CheckCircle }
    },
    contextExtractors: {
      rule: (path: string) => {
        const match = path.match(/\/rules\/([^\/]+)/)
        return match ? { type: 'rule', id: match[1] } : null
      }
    }
  },
  'classifications': {
    name: 'Classifications',
    icon: FileText,
    color: 'text-green-600',
    basePath: '/v15_enhanced_1/components/classifications',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/labels': { label: 'Labels', icon: Tag },
      '/labels/:id': { label: 'Label Details', icon: Tag, dynamic: true },
      '/categories': { label: 'Categories', icon: Folder },
      '/taxonomies': { label: 'Taxonomies', icon: Layers },
      '/hierarchies': { label: 'Hierarchies', icon: Route }
    },
    contextExtractors: {
      label: (path: string) => {
        const match = path.match(/\/labels\/([^\/]+)/)
        return match ? { type: 'label', id: match[1] } : null
      }
    }
  },
  'compliance-rule': {
    name: 'Compliance Rules',
    icon: BookOpen,
    color: 'text-orange-600',
    basePath: '/v15_enhanced_1/components/Compliance-Rule',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/regulations': { label: 'Regulations', icon: BookOpen },
      '/audits': { label: 'Audits', icon: Search },
      '/reports': { label: 'Reports', icon: FileText },
      '/violations': { label: 'Violations', icon: AlertTriangle }
    }
  },
  'advanced-catalog': {
    name: 'Advanced Catalog',
    icon: Scan,
    color: 'text-teal-600',
    basePath: '/v15_enhanced_1/components/Advanced-Catalog',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/assets': { label: 'Assets', icon: Database },
      '/assets/:id': { label: 'Asset Details', icon: Database, dynamic: true },
      '/metadata': { label: 'Metadata', icon: Tag },
      '/lineage': { label: 'Lineage', icon: Route },
      '/schemas': { label: 'Schemas', icon: Layers },
      '/glossary': { label: 'Glossary', icon: BookOpen }
    },
    contextExtractors: {
      asset: (path: string) => {
        const match = path.match(/\/assets\/([^\/]+)/)
        return match ? { type: 'asset', id: match[1] } : null
      }
    }
  },
  'scan-logic': {
    name: 'Scan Logic',
    icon: Activity,
    color: 'text-indigo-600',
    basePath: '/v15_enhanced_1/components/Advanced-Scan-Logic',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/scans': { label: 'Scans', icon: Activity },
      '/scans/:id': { label: 'Scan Details', icon: Activity, dynamic: true },
      '/jobs': { label: 'Jobs', icon: Zap },
      '/workflows': { label: 'Workflows', icon: Workflow },
      '/results': { label: 'Results', icon: BarChart3 },
      '/logs': { label: 'Logs', icon: FileText }
    },
    contextExtractors: {
      scan: (path: string) => {
        const match = path.match(/\/scans\/([^\/]+)/)
        return match ? { type: 'scan', id: match[1] } : null
      }
    }
  },
  'rbac-system': {
    name: 'RBAC System',
    icon: Users,
    color: 'text-red-600',
    basePath: '/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/users': { label: 'Users', icon: Users },
      '/users/:id': { label: 'User Details', icon: User, dynamic: true },
      '/roles': { label: 'Roles', icon: Shield },
      '/permissions': { label: 'Permissions', icon: Lock },
      '/groups': { label: 'Groups', icon: Users },
      '/policies': { label: 'Policies', icon: BookOpen }
    },
    contextExtractors: {
      user: (path: string) => {
        const match = path.match(/\/users\/([^\/]+)/)
        return match ? { type: 'user', id: match[1] } : null
      }
    },
    adminOnly: true
  }
} as const

// Racine feature route configurations
const RACINE_ROUTE_CONFIGS = {
  'dashboard': {
    name: 'Global Dashboard',
    icon: BarChart3,
    color: 'text-cyan-600',
    basePath: '/racine/dashboard',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/metrics': { label: 'Metrics', icon: BarChart3 },
      '/insights': { label: 'Insights', icon: Target },
      '/reports': { label: 'Reports', icon: FileText }
    }
  },
  'workspace': {
    name: 'Workspace Manager',
    icon: Globe,
    color: 'text-emerald-600',
    basePath: '/racine/workspace',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/projects': { label: 'Projects', icon: Folder },
      '/teams': { label: 'Teams', icon: Users },
      '/resources': { label: 'Resources', icon: Database }
    }
  },
  'job-workflow-space': {
    name: 'Job Workflows',
    icon: Workflow,
    color: 'text-violet-600',
    basePath: '/racine/job-workflow-space',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/workflows': { label: 'Workflows', icon: Workflow },
      '/workflows/:id': { label: 'Workflow Details', icon: Workflow, dynamic: true },
      '/jobs': { label: 'Jobs', icon: Zap },
      '/templates': { label: 'Templates', icon: FileText },
      '/schedules': { label: 'Schedules', icon: Calendar }
    }
  },
  'pipeline-manager': {
    name: 'Pipeline Manager',
    icon: Zap,
    color: 'text-yellow-600',
    basePath: '/racine/pipeline-manager',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/pipelines': { label: 'Pipelines', icon: Zap },
      '/stages': { label: 'Stages', icon: Layers },
      '/monitoring': { label: 'Monitoring', icon: Activity }
    }
  },
  'ai-assistant': {
    name: 'AI Assistant',
    icon: Bot,
    color: 'text-pink-600',
    basePath: '/racine/ai-assistant',
    pathPatterns: {
      '/': { label: 'Chat', icon: MessageSquare },
      '/recommendations': { label: 'Recommendations', icon: Star },
      '/insights': { label: 'Insights', icon: Target },
      '/history': { label: 'History', icon: History }
    }
  },
  'activity-tracker': {
    name: 'Activity Tracker',
    icon: Clock,
    color: 'text-slate-600',
    basePath: '/racine/activity-tracker',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/activities': { label: 'Activities', icon: Activity },
      '/analytics': { label: 'Analytics', icon: BarChart3 },
      '/reports': { label: 'Reports', icon: FileText }
    }
  },
  'intelligent-dashboard': {
    name: 'Intelligent Dashboard',
    icon: Target,
    color: 'text-lime-600',
    basePath: '/racine/intelligent-dashboard',
    pathPatterns: {
      '/': { label: 'Overview', icon: Home },
      '/widgets': { label: 'Widgets', icon: Layers },
      '/builder': { label: 'Builder', icon: Edit3 },
      '/templates': { label: 'Templates', icon: FileText }
    }
  },
  'collaboration': {
    name: 'Collaboration Hub',
    icon: MessageSquare,
    color: 'text-amber-600',
    basePath: '/racine/collaboration',
    pathPatterns: {
      '/': { label: 'Hub', icon: Home },
      '/chat': { label: 'Chat', icon: MessageSquare },
      '/sharing': { label: 'Sharing', icon: Share2 },
      '/teams': { label: 'Teams', icon: Users }
    }
  },
  'user-management': {
    name: 'User Settings',
    icon: Settings,
    color: 'text-gray-600',
    basePath: '/racine/user-management',
    pathPatterns: {
      '/': { label: 'Profile', icon: User },
      '/preferences': { label: 'Preferences', icon: Settings },
      '/security': { label: 'Security', icon: Shield },
      '/api-keys': { label: 'API Keys', icon: Hash }
    }
  }
} as const

interface ContextualBreadcrumbsProps {
  className?: string
  maxItems?: number
  showHome?: boolean
  showWorkspace?: boolean
  separator?: 'chevron' | 'slash' | 'arrow'
  compact?: boolean
  onNavigate?: (path: string) => void
}

export const ContextualBreadcrumbs: React.FC<ContextualBreadcrumbsProps> = ({
  className,
  maxItems = MAX_BREADCRUMB_ITEMS,
  showHome = true,
  showWorkspace = true,
  separator = 'chevron',
  compact = false,
  onNavigate
}) => {
  // Core state management using foundation hooks
  const {
    breadcrumbHistory,
    currentBreadcrumbs,
    generateBreadcrumbs,
    addBreadcrumb,
    navigateToBreadcrumb,
    clearBreadcrumbHistory,
    getBreadcrumbContext
  } = useBreadcrumbManager()

  const {
    crossGroupState,
    getCurrentSPAContext,
    getNavigationContext
  } = useCrossGroupIntegration()

  const {
    userContext,
    checkUserAccess
  } = useUserManagement()

  const {
    workspaceState,
    currentWorkspace,
    getWorkspaceContext
  } = useWorkspaceManagement()

  const {
    trackNavigation,
    getBreadcrumbAnalytics
  } = useActivityTracker()

  const {
    navigationStats,
    trackBreadcrumbUsage,
    getNavigationPatterns
  } = useNavigationAnalytics()

  const {
    breadcrumbPreferences,
    updateBreadcrumbPreferences,
    getPinnedPaths
  } = useUserPreferences()

  // Local state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isPinMenuOpen, setIsPinMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [contextMenuOpen, setContextMenuOpen] = useState<string | null>(null)
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([])
  const [recentPaths, setRecentPaths] = useState<string[]>([])

  const router = useRouter()
  const pathname = usePathname()

  // Parse current path into breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items: BreadcrumbItem[] = []

    // Add home if requested
    if (showHome) {
      items.push({
        id: 'home',
        label: 'Home',
        path: '/',
        icon: Home,
        isClickable: true
      })
    }

    // Add workspace context if requested and available
    if (showWorkspace && currentWorkspace) {
      items.push({
        id: 'workspace',
        label: currentWorkspace.name,
        path: `/workspace/${currentWorkspace.id}`,
        icon: Globe,
        isClickable: true,
        metadata: {
          type: 'workspace',
          workspace: currentWorkspace
        }
      })
    }

    // Parse the current path
    const pathItems = parseBreadcrumbPath(pathname, {
      spaConfigs: SPA_ROUTE_CONFIGS,
      racineConfigs: RACINE_ROUTE_CONFIGS,
      userContext,
      checkAccess: checkUserAccess
    })

    items.push(...pathItems)

    // Limit items if necessary
    if (items.length > maxItems) {
      const startItems = items.slice(0, 2) // Keep home and workspace
      const endItems = items.slice(-(maxItems - 3)) // Keep last few items
      
      return [
        ...startItems,
        {
          id: 'ellipsis',
          label: '...',
          path: '',
          icon: MoreHorizontal,
          isClickable: false,
          isEllipsis: true,
          hiddenItems: items.slice(2, -(maxItems - 3))
        },
        ...endItems
      ]
    }

    return items
  }, [pathname, showHome, showWorkspace, currentWorkspace, maxItems, userContext, checkUserAccess])

  // Get contextual actions for current path
  const contextualActions = useMemo(() => {
    return getContextualActions(pathname, {
      userContext,
      workspaceContext: getWorkspaceContext(),
      spaContext: getCurrentSPAContext()
    })
  }, [pathname, userContext, getWorkspaceContext, getCurrentSPAContext])

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pinned = await getPinnedPaths()
        setPinnedPaths(pinned)
        
        const patterns = await getNavigationPatterns('recent', 20)
        setRecentPaths(patterns.map(p => p.path))
      } catch (error) {
        console.error('Failed to load breadcrumb preferences:', error)
      }
    }

    loadPreferences()
  }, [getPinnedPaths, getNavigationPatterns])

  // Track breadcrumb navigation
  const handleBreadcrumbClick = useCallback(async (item: BreadcrumbItem, index: number) => {
    if (!item.isClickable || !item.path) return

    try {
      // Track navigation analytics
      trackBreadcrumbUsage({
        action: 'navigate',
        itemId: item.id,
        itemLabel: item.label,
        itemPath: item.path,
        position: index,
        totalItems: breadcrumbItems.length,
        timestamp: new Date()
      })

      // Execute navigation
      if (onNavigate) {
        onNavigate(item.path)
      } else {
        router.push(item.path)
      }

      // Add to breadcrumb history
      addBreadcrumb(item)

    } catch (error) {
      console.error('Breadcrumb navigation error:', error)
    }
  }, [breadcrumbItems.length, trackBreadcrumbUsage, onNavigate, router, addBreadcrumb])

  // Handle path pinning
  const handlePinPath = useCallback(async (item: BreadcrumbItem) => {
    try {
      const newPinnedPaths = pinnedPaths.includes(item.path)
        ? pinnedPaths.filter(p => p !== item.path)
        : [...pinnedPaths, item.path]

      setPinnedPaths(newPinnedPaths)
      await updateBreadcrumbPreferences({ pinnedPaths: newPinnedPaths })

      trackBreadcrumbUsage({
        action: pinnedPaths.includes(item.path) ? 'unpin' : 'pin',
        itemId: item.id,
        itemPath: item.path,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Failed to pin/unpin path:', error)
    }
  }, [pinnedPaths, updateBreadcrumbPreferences, trackBreadcrumbUsage])

  // Render separator
  const renderSeparator = () => {
    switch (separator) {
      case 'slash':
        return <span className="text-muted-foreground mx-2">/</span>
      case 'arrow':
        return <ArrowRight className="w-3 h-3 text-muted-foreground mx-2" />
      case 'chevron':
      default:
        return <ChevronRight className="w-3 h-3 text-muted-foreground mx-2" />
    }
  }

  // Render breadcrumb item
  const renderBreadcrumbItem = useCallback((item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isPinned = pinnedPaths.includes(item.path)
    const isHovered = hoveredItem === item.id

    if (item.isEllipsis) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Hidden Items</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.hiddenItems?.map((hiddenItem, hiddenIndex) => (
              <DropdownMenuItem
                key={hiddenItem.id}
                onClick={() => handleBreadcrumbClick(hiddenItem, index + hiddenIndex)}
                className="flex items-center gap-2"
              >
                {hiddenItem.icon && <hiddenItem.icon className="w-4 h-4" />}
                <span>{hiddenItem.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <div
        key={item.id}
        className="flex items-center"
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <DropdownMenu
          open={contextMenuOpen === item.id}
          onOpenChange={(open) => setContextMenuOpen(open ? item.id : null)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-sm transition-colors",
                item.isClickable ? "hover:text-primary hover:bg-primary/10" : "cursor-default",
                isLast ? "font-semibold text-foreground" : "text-muted-foreground",
                isPinned && "text-yellow-600",
                compact && "text-xs px-1"
              )}
              onClick={() => handleBreadcrumbClick(item, index)}
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenuOpen(item.id)
              }}
            >
              <div className="flex items-center gap-1.5">
                {item.icon && !compact && (
                  <item.icon className="w-3 h-3 flex-shrink-0" />
                )}
                <span className="truncate max-w-[120px]">{item.label}</span>
                {isPinned && (
                  <Pin className="w-2 h-2 text-yellow-500 flex-shrink-0" />
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {item.isClickable && (
              <DropdownMenuItem onClick={() => handleBreadcrumbClick(item, index)}>
                <Navigation className="w-4 h-4 mr-2" />
                Navigate Here
                <DropdownMenuShortcut>Click</DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => handlePinPath(item)}>
              {isPinned ? (
                <>
                  <Unpin className="w-4 h-4 mr-2" />
                  Unpin Path
                </>
              ) : (
                <>
                  <Pin className="w-4 h-4 mr-2" />
                  Pin Path
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.path)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Path
            </DropdownMenuItem>
            
            {item.isClickable && (
              <DropdownMenuItem onClick={() => window.open(item.path, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
            )}
            
            {item.metadata && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Metadata</DropdownMenuLabel>
                {Object.entries(item.metadata).map(([key, value]) => (
                  <DropdownMenuItem key={key} className="text-xs" disabled>
                    {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator (except for last item) */}
        {!isLast && renderSeparator()}
      </div>
    )
  }, [
    pinnedPaths,
    hoveredItem,
    contextMenuOpen,
    compact,
    handleBreadcrumbClick,
    handlePinPath,
    renderSeparator
  ])

  // Render contextual actions
  const renderContextualActions = () => {
    if (contextualActions.length === 0) return null

    return (
      <div className="flex items-center gap-1 ml-4">
        <Separator orientation="vertical" className="h-4" />
        {contextualActions.slice(0, 3).map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  if (action.onClick) {
                    action.onClick()
                  } else if (action.url) {
                    router.push(action.url)
                  }
                }}
              >
                <action.icon className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {contextualActions.length > 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {contextualActions.slice(3).map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => {
                    if (action.onClick) {
                      action.onClick()
                    } else if (action.url) {
                      router.push(action.url)
                    }
                  }}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  // Render navigation history
  const renderNavigationHistory = () => (
    <Popover open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2"
        >
          <History className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Navigation History</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearBreadcrumbHistory()}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>

          {/* Recent paths */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground">Recent</h5>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {recentPaths.slice(0, 10).map((path, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2 text-xs"
                    onClick={() => {
                      router.push(path)
                      setIsHistoryOpen(false)
                    }}
                  >
                    <Clock className="w-3 h-3 mr-2" />
                    <span className="truncate">{path}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Pinned paths */}
          {pinnedPaths.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Pinned</h5>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {pinnedPaths.map((path, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 px-2 text-xs"
                      onClick={() => {
                        router.push(path)
                        setIsHistoryOpen(false)
                      }}
                    >
                      <Pin className="w-3 h-3 mr-2 text-yellow-500" />
                      <span className="truncate">{path}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )

  return (
    <TooltipProvider>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center min-h-[32px] px-4 py-2",
          "bg-background/80 backdrop-blur-sm border-b border-border/50",
          "supports-[backdrop-filter]:bg-background/60",
          className
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          {/* Breadcrumb items */}
          <div className="flex items-center min-w-0">
            <AnimatePresence mode="wait">
              {breadcrumbItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {renderBreadcrumbItem(item, index, index === breadcrumbItems.length - 1)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Contextual actions */}
          {renderContextualActions()}
        </div>

        {/* Navigation controls */}
        <div className="flex items-center gap-1 ml-4">
          {/* Back/Forward buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go Back</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => router.forward()}
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go Forward</p>
            </TooltipContent>
          </Tooltip>

          {/* Navigation history */}
          <Tooltip>
            <TooltipTrigger asChild>
              {renderNavigationHistory()}
            </TooltipTrigger>
            <TooltipContent>
              <p>Navigation History</p>
            </TooltipContent>
          </Tooltip>

          {/* Share current path */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  // You could add a toast notification here
                }}
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share Current Path</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.nav>
    </TooltipProvider>
  )
}

export default ContextualBreadcrumbs