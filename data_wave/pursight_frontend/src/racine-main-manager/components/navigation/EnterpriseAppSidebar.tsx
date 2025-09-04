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
  Suspense
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FixedSizeList as List } from 'react-window'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Database, 
  Shield, 
  FileText, 
  BookOpen, 
  Scan, 
  Users, 
  Activity, 
  BarChart3, 
  Workflow, 
  Zap, 
  Bot, 
  Settings, 
  Star, 
  Clock, 
  Search, 
  Pin, 
  PinOff,
  RefreshCw,
  ExternalLink,
  Heart,
  Globe,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib copie/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Import optimized hooks with error boundaries
import { useOptimizedCrossGroupIntegration } from '../../hooks/optimized/useOptimizedCrossGroupIntegration'
import { useOptimizedUserManagement } from '../../hooks/optimized/useOptimizedUserManagement'
import { useOptimizedWorkspaceManagement } from '../../hooks/optimized/useOptimizedWorkspaceManagement'
import { useOptimizedActivityTracker } from '../../hooks/optimized/useOptimizedActivityTracker'
import { useOptimizedUserPreferences } from '../../hooks/optimized/useOptimizedUserPreferences'
import { useOptimizedNavigationAnalytics } from '../../hooks/optimized/useOptimizedNavigationAnalytics'

// Performance monitoring utilities
import { usePerformanceMonitor } from '../../hooks/performance/usePerformanceMonitor'
import { useMemoryOptimization } from '../../hooks/performance/useMemoryOptimization'
import { useRenderOptimization } from '../../hooks/performance/useRenderOptimization'

// Enterprise error boundary
import { EnterpriseSidebarErrorBoundary } from '../error-boundaries/EnterpriseSidebarErrorBoundary'

// Types
interface NavigationItem {
  id: string
  name: string
  icon: React.ComponentType<any>
  route: string
  category: string
  description: string
  shortDescription: string
  color: string
  textColor: string
  keywords: string[]
  priority: number
  status?: 'healthy' | 'warning' | 'error' | 'unknown'
  isRacineFeature?: boolean
  adminOnly?: boolean
  lastAccessed?: Date
  accessCount?: number
}

interface FavoriteItem {
  id: string
  itemId: string
  name: string
  route: string
  addedAt: Date
}

interface SidebarState {
  isCollapsed: boolean
  isPinned: boolean
  searchQuery: string
  selectedCategory: string | null
  expandedSections: Record<string, boolean>
  favorites: FavoriteItem[]
  recentItems: NavigationItem[]
  isSearching: boolean
}

type SidebarAction = 
  | { type: 'SET_COLLAPSED'; payload: boolean }
  | { type: 'SET_PINNED'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'SET_FAVORITES'; payload: FavoriteItem[] }
  | { type: 'SET_RECENT_ITEMS'; payload: NavigationItem[] }
  | { type: 'SET_SEARCHING'; payload: boolean }

const sidebarReducer = (state: SidebarState, action: SidebarAction): SidebarState => {
  switch (action.type) {
    case 'SET_COLLAPSED':
      return { ...state, isCollapsed: action.payload }
    case 'SET_PINNED':
      return { ...state, isPinned: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload }
    case 'TOGGLE_SECTION':
      return {
        ...state,
        expandedSections: {
          ...state.expandedSections,
          [action.payload]: !state.expandedSections[action.payload]
        }
      }
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload }
    case 'SET_RECENT_ITEMS':
      return { ...state, recentItems: action.payload }
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload }
    default:
      return state
  }
}

// Optimized navigation metadata
const NAVIGATION_ITEMS: NavigationItem[] = [
  // Data Governance SPAs
  {
    id: 'data-sources',
    name: 'Data Sources',
    icon: Database,
    route: '/data-sources',
    category: 'Data Management',
    description: 'Manage and monitor data source connections',
    shortDescription: 'Data connections & monitoring',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    keywords: ['database', 'connection', 'source', 'data'],
    priority: 1,
    status: 'healthy'
  },
  {
    id: 'scan-rule-sets',
    name: 'Scan Rule Sets',
    icon: Shield,
    route: '/scan-rule-sets',
    category: 'Security & Compliance',
    description: 'Configure and manage advanced scanning rules',
    shortDescription: 'Scanning rules & policies',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    keywords: ['scan', 'rules', 'security', 'policy'],
    priority: 2,
    status: 'healthy'
  },
  {
    id: 'classifications',
    name: 'Classifications',
    icon: FileText,
    route: '/classifications',
    category: 'Data Governance',
    description: 'Data classification and intelligent tagging',
    shortDescription: 'Data classification & tagging',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    keywords: ['classification', 'tags', 'metadata', 'labels'],
    priority: 3,
    status: 'healthy'
  },
  {
    id: 'compliance-rules',
    name: 'Compliance Rules',
    icon: BookOpen,
    route: '/compliance-rules',
    category: 'Security & Compliance',
    description: 'Compliance policies and audit management',
    shortDescription: 'Compliance & audit rules',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    keywords: ['compliance', 'audit', 'policy', 'regulation'],
    priority: 4,
    status: 'healthy'
  },
  {
    id: 'advanced-catalog',
    name: 'Advanced Catalog',
    icon: Scan,
    route: '/advanced-catalog',
    category: 'Data Management',
    description: 'Data catalog and metadata management',
    shortDescription: 'Data catalog & metadata',
    color: 'bg-teal-500',
    textColor: 'text-teal-600',
    keywords: ['catalog', 'metadata', 'discovery', 'lineage'],
    priority: 5,
    status: 'healthy'
  },
  {
    id: 'scan-logic',
    name: 'Scan Logic',
    icon: Activity,
    route: '/scan-logic',
    category: 'Processing',
    description: 'Advanced scanning and processing logic',
    shortDescription: 'Scan orchestration & logic',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    keywords: ['scan', 'logic', 'processing', 'orchestration'],
    priority: 6,
    status: 'healthy'
  },
  {
    id: 'rbac-system',
    name: 'RBAC System',
    icon: Users,
    route: '/rbac-system',
    category: 'Security & Compliance',
    description: 'Role-based access control management',
    shortDescription: 'User & permission management',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    keywords: ['rbac', 'users', 'roles', 'permissions'],
    priority: 7,
    status: 'healthy',
    adminOnly: true
  },
  // Racine Features
  {
    id: 'dashboard',
    name: 'Global Dashboard',
    icon: BarChart3,
    route: '/dashboard',
    category: 'Analytics',
    description: 'Cross-SPA analytics and insights',
    shortDescription: 'Global insights & KPIs',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    keywords: ['dashboard', 'analytics', 'kpi', 'metrics'],
    priority: 8,
    isRacineFeature: true
  },
  {
    id: 'workspace',
    name: 'Workspace Manager',
    icon: Globe,
    route: '/workspace',
    category: 'Management',
    description: 'Multi-workspace orchestration',
    shortDescription: 'Workspace management',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    keywords: ['workspace', 'project', 'team', 'collaboration'],
    priority: 9,
    isRacineFeature: true
  },
  {
    id: 'workflows',
    name: 'Job Workflows',
    icon: Workflow,
    route: '/workflows',
    category: 'Automation',
    description: 'Databricks-style workflow builder',
    shortDescription: 'Workflow automation',
    color: 'bg-violet-500',
    textColor: 'text-violet-600',
    keywords: ['workflow', 'automation', 'jobs', 'pipeline'],
    priority: 10,
    isRacineFeature: true
  },
  {
    id: 'pipelines',
    name: 'Pipeline Manager',
    icon: Zap,
    route: '/pipelines',
    category: 'Processing',
    description: 'Advanced pipeline management',
    shortDescription: 'Data pipelines',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    keywords: ['pipeline', 'etl', 'processing', 'data'],
    priority: 11,
    isRacineFeature: true
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    icon: Bot,
    route: '/ai-assistant',
    category: 'AI & ML',
    description: 'Context-aware AI assistance',
    shortDescription: 'AI-powered help',
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    keywords: ['ai', 'assistant', 'help', 'automation'],
    priority: 12,
    isRacineFeature: true
  },
  {
    id: 'activity',
    name: 'Activity Tracker',
    icon: Clock,
    route: '/activity',
    category: 'Monitoring',
    description: 'Historic activities and audit trails',
    shortDescription: 'Activity monitoring',
    color: 'bg-slate-500',
    textColor: 'text-slate-600',
    keywords: ['activity', 'audit', 'history', 'tracking'],
    priority: 13,
    isRacineFeature: true
  },
  {
    id: 'collaboration',
    name: 'Collaboration Hub',
    icon: Users,
    route: '/collaboration',
    category: 'Collaboration',
    description: 'Team collaboration center',
    shortDescription: 'Team collaboration',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    keywords: ['collaboration', 'team', 'chat', 'sharing'],
    priority: 14,
    isRacineFeature: true
  },
  {
    id: 'settings',
    name: 'User Settings',
    icon: Settings,
    route: '/settings',
    category: 'Settings',
    description: 'Profile and preferences management',
    shortDescription: 'User preferences',
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    keywords: ['settings', 'profile', 'preferences', 'user'],
    priority: 15,
    isRacineFeature: true
  }
]

const STATUS_ICONS = {
  healthy: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  unknown: Circle
} as const

const STATUS_COLORS = {
  healthy: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  unknown: 'text-gray-500'
} as const

interface EnterpriseAppSidebarProps {
  className?: string
  onQuickActionsTrigger?: () => void
  isQuickActionsSidebarOpen?: boolean
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

// Memoized NavigationItem component
const NavigationItemComponent = memo<{
  item: NavigationItem
  isActive: boolean
  isFavorite: boolean
  onNavigate: (item: NavigationItem) => void
  onToggleFavorite: (item: NavigationItem) => void
  onQuickActions: (item: NavigationItem) => void
  isCollapsed: boolean
  showQuickActions: boolean
}>(({ 
  item, 
  isActive, 
  isFavorite, 
  onNavigate, 
  onToggleFavorite, 
  onQuickActions, 
  isCollapsed,
  showQuickActions 
}) => {
  const StatusIcon = STATUS_ICONS[item.status || 'unknown']
  const statusColor = STATUS_COLORS[item.status || 'unknown']

  const handleClick = useCallback(() => {
    onNavigate(item)
  }, [item, onNavigate])

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(item)
  }, [item, onToggleFavorite])

  const handleQuickActionsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onQuickActions(item)
  }, [item, onQuickActions])

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "w-full p-3 rounded-lg transition-all duration-200",
              "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
              isActive && "bg-primary/10 border border-primary/20"
            )}
          >
            <div className="relative flex justify-center">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isActive ? "bg-primary text-primary-foreground" : item.color
              )}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              {!item.isRacineFeature && (
                <div className="absolute -bottom-1 -right-1">
                  <StatusIcon className={cn("w-3 h-3", statusColor)} />
                </div>
              )}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="space-y-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.shortDescription}</p>
            <Badge variant="outline" className="text-xs">{item.category}</Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-muted/50 focus:bg-muted/50",
        isActive && "bg-primary/10 border border-primary/20 text-primary"
      )}
      onClick={handleClick}
    >
      {/* Icon and status */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isActive ? "bg-primary text-primary-foreground" : item.color
        )}>
          <item.icon className="w-4 h-4 text-white" />
        </div>
        
        {!item.isRacineFeature && (
          <div className="absolute -bottom-1 -right-1">
            <StatusIcon className={cn("w-3 h-3", statusColor)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm truncate",
              isActive && "text-primary"
            )}>
              {item.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {item.shortDescription}
            </p>
          </div>

          {/* Badges and indicators */}
          <div className="flex items-center gap-1 ml-2">
            {isFavorite && (
              <Heart className="w-3 h-3 text-pink-500 fill-current" />
            )}
            {item.adminOnly && (
              <Shield className="w-3 h-3 text-orange-500" />
            )}
          </div>
        </div>

        {/* Category and status */}
        <div className="flex items-center justify-between mt-1">
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
          {!item.isRacineFeature && item.status && (
            <span className={cn("text-xs", statusColor)}>
              {item.status}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleFavoriteClick}
        >
          <Heart className={cn("w-3 h-3", isFavorite && "fill-current text-pink-500")} />
        </Button>
        
        {showQuickActions && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleQuickActionsClick}
          >
            <Zap className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
})

NavigationItemComponent.displayName = 'NavigationItemComponent'

// Virtualized list item component
const VirtualizedNavigationItem = memo<{
  index: number
  style: React.CSSProperties
  data: {
    items: NavigationItem[]
    activeItemId: string | null
    favorites: Set<string>
    onNavigate: (item: NavigationItem) => void
    onToggleFavorite: (item: NavigationItem) => void
    onQuickActions: (item: NavigationItem) => void
    isCollapsed: boolean
    showQuickActions: boolean
  }
}>(({ index, style, data }) => {
  const item = data.items[index]
  if (!item) return null

  return (
    <div style={style}>
      <NavigationItemComponent
        item={item}
        isActive={data.activeItemId === item.id}
        isFavorite={data.favorites.has(item.id)}
        onNavigate={data.onNavigate}
        onToggleFavorite={data.onToggleFavorite}
        onQuickActions={data.onQuickActions}
        isCollapsed={data.isCollapsed}
        showQuickActions={data.showQuickActions}
      />
    </div>
  )
})

VirtualizedNavigationItem.displayName = 'VirtualizedNavigationItem'

export const EnterpriseAppSidebar: React.FC<EnterpriseAppSidebarProps> = memo(({
  className,
  onQuickActionsTrigger,
  isQuickActionsSidebarOpen = false,
  isCollapsed: externalCollapsed,
  onCollapsedChange
}) => {
  // Performance monitoring
  const { trackRender, trackEvent } = usePerformanceMonitor('EnterpriseAppSidebar')
  const { optimizeMemory } = useMemoryOptimization()
  const { memoizedCallback, memoizedValue } = useRenderOptimization()

  // Reduced motion preference
  const shouldReduceMotion = useReducedMotion()

  // State management with reducer for better performance
  const [state, dispatch] = React.useReducer(sidebarReducer, {
    isCollapsed: externalCollapsed ?? false,
    isPinned: false,
    searchQuery: '',
    selectedCategory: null,
    expandedSections: {
      spas: true,
      racine: true,
      favorites: true,
      recent: false
    },
    favorites: [],
    recentItems: [],
    isSearching: false
  })

  // Deferred values for performance
  const deferredSearchQuery = useDeferredValue(state.searchQuery)
  const deferredIsCollapsed = useDeferredValue(state.isCollapsed)

  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<List>(null)

  // Router hooks
  const router = useRouter()
  const pathname = usePathname()

  // Optimized hooks with error boundaries
  const crossGroupIntegration = useOptimizedCrossGroupIntegration()
  const userManagement = useOptimizedUserManagement()
  const workspaceManagement = useOptimizedWorkspaceManagement()
  const activityTracker = useOptimizedActivityTracker()
  const userPreferences = useOptimizedUserPreferences()
  const navigationAnalytics = useOptimizedNavigationAnalytics()

  // Memoized current user and permissions
  const currentUser = useMemo(() => {
    return userManagement?.getCurrentUser?.() || null
  }, [userManagement])

  const userPermissions = useMemo(() => {
    return userManagement?.getUserPermissions?.() || []
  }, [userManagement])

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let items = NAVIGATION_ITEMS

    // Filter by search query
    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.includes(query))
      )
    }

    // Filter by permissions
    items = items.filter(item => {
      if (item.adminOnly && !userPermissions.includes('rbac:admin')) {
        return false
      }
      return true
    })

    return items
  }, [deferredSearchQuery, userPermissions])

  // Memoized active item
  const activeItem = useMemo(() => {
    return filteredItems.find(item => pathname.startsWith(item.route)) || null
  }, [filteredItems, pathname])

  // Memoized favorites set
  const favoritesSet = useMemo(() => {
    return new Set(state.favorites.map(fav => fav.itemId))
  }, [state.favorites])

  // Navigation handler
  const handleNavigation = useCallback(async (item: NavigationItem) => {
    try {
      trackEvent('navigation', { itemId: item.id, route: item.route })
      
      // Track in activity tracker
      activityTracker?.trackNavigation?.({
        type: item.isRacineFeature ? 'racine' : 'spa',
        key: item.id,
        destination: item.route,
        source: 'sidebar',
        timestamp: new Date()
      })

      // Track in analytics
      navigationAnalytics?.trackSidebarUsage?.({
        action: 'navigation',
        item: item.id,
        category: item.category,
        timestamp: new Date()
      })

      // Coordinate with cross-group integration if SPA
      if (!item.isRacineFeature && crossGroupIntegration?.coordinateNavigation) {
        await crossGroupIntegration.coordinateNavigation(item.id, {
          preserveContext: true,
          updateHistory: true,
          trackAnalytics: true
        })
      }

      // Navigate using Next.js router
      await startTransition(() => {
        router.push(item.route)
      })

    } catch (error) {
      console.error('Navigation error:', error)
    }
  }, [trackEvent, activityTracker, navigationAnalytics, crossGroupIntegration, router])

  // Favorite toggle handler
  const handleToggleFavorite = useCallback(async (item: NavigationItem) => {
    try {
      const isFavorite = favoritesSet.has(item.id)
      
      if (isFavorite) {
        const favorite = state.favorites.find(fav => fav.itemId === item.id)
        if (favorite) {
          await userPreferences?.removeFavoriteItem?.(favorite.id)
          dispatch({
            type: 'SET_FAVORITES',
            payload: state.favorites.filter(fav => fav.itemId !== item.id)
          })
        }
      } else {
        const newFavorite: FavoriteItem = {
          id: `fav_${item.id}_${Date.now()}`,
          itemId: item.id,
          name: item.name,
          route: item.route,
          addedAt: new Date()
        }
        
        await userPreferences?.saveFavoriteItem?.(newFavorite)
        dispatch({
          type: 'SET_FAVORITES',
          payload: [...state.favorites, newFavorite]
        })
      }

      trackEvent('favorite_toggle', { itemId: item.id, isFavorite: !isFavorite })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [favoritesSet, state.favorites, userPreferences, trackEvent])

  // Quick actions handler
  const handleQuickActions = useCallback((item: NavigationItem) => {
    if (onQuickActionsTrigger) {
      onQuickActionsTrigger()
    }
    
    trackEvent('quick_actions_trigger', { itemId: item.id })
    
    navigationAnalytics?.trackSidebarUsage?.({
      action: 'quick_actions_trigger',
      item: item.id,
      context: { type: item.isRacineFeature ? 'racine' : 'spa', metadata: item },
      timestamp: new Date()
    })
  }, [onQuickActionsTrigger, trackEvent, navigationAnalytics])

  // Collapsed state handler
  const handleCollapsedChange = useCallback((collapsed: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed)
    } else {
      dispatch({ type: 'SET_COLLAPSED', payload: collapsed })
    }
    
    trackEvent('sidebar_toggle', { collapsed })
  }, [onCollapsedChange, trackEvent])

  // Search handler with debouncing
  const handleSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
    dispatch({ type: 'SET_SEARCHING', payload: true })
    
    setTimeout(() => {
      dispatch({ type: 'SET_SEARCHING', payload: false })
    }, 300)
  }, [])

  // Load user preferences and favorites
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const sidebarPrefs = await userPreferences?.getSidebarPreferences?.()
        if (sidebarPrefs) {
          dispatch({ type: 'SET_PINNED', payload: sidebarPrefs.isPinned || false })
          dispatch({ type: 'SET_FAVORITES', payload: sidebarPrefs.favorites || [] })
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    }

    loadUserData()
  }, [userPreferences])

  // Load recent items
  useEffect(() => {
    const loadRecentItems = async () => {
      try {
        const recentNavigation = await activityTracker?.getRecentNavigationHistory?.(10)
        if (recentNavigation) {
          const recentItems = recentNavigation
            .map(nav => NAVIGATION_ITEMS.find(item => item.id === nav.key))
            .filter(Boolean) as NavigationItem[]
          
          dispatch({ type: 'SET_RECENT_ITEMS', payload: recentItems.slice(0, 5) })
        }
      } catch (error) {
        console.error('Failed to load recent items:', error)
      }
    }

    loadRecentItems()
  }, [activityTracker])

  // Track render performance
  useEffect(() => {
    trackRender()
  })

  // Memory cleanup
  useEffect(() => {
    return () => {
      optimizeMemory()
    }
  }, [optimizeMemory])

  // Determine if sidebar is collapsed
  const isCollapsed = externalCollapsed ?? state.isCollapsed

  // Section data for rendering
  const sections = useMemo(() => {
    const spaItems = filteredItems.filter(item => !item.isRacineFeature)
    const racineItems = filteredItems.filter(item => item.isRacineFeature)
    
    return [
      {
        id: 'favorites',
        title: 'Favorites',
        icon: Heart,
        items: state.favorites
          .map(fav => filteredItems.find(item => item.id === fav.itemId))
          .filter(Boolean) as NavigationItem[],
        expanded: state.expandedSections.favorites
      },
      {
        id: 'spas',
        title: 'Data Governance SPAs',
        icon: Database,
        items: spaItems,
        expanded: state.expandedSections.spas
      },
      {
        id: 'racine',
        title: 'Racine Features',
        icon: Workflow,
        items: racineItems,
        expanded: state.expandedSections.racine
      },
      {
        id: 'recent',
        title: 'Recently Visited',
        icon: Clock,
        items: state.recentItems,
        expanded: state.expandedSections.recent
      }
    ].filter(section => section.items.length > 0)
  }, [filteredItems, state.favorites, state.recentItems, state.expandedSections])

  // Virtualization data
  const virtualizationData = useMemo(() => ({
    items: filteredItems,
    activeItemId: activeItem?.id || null,
    favorites: favoritesSet,
    onNavigate: handleNavigation,
    onToggleFavorite: handleToggleFavorite,
    onQuickActions: handleQuickActions,
    isCollapsed,
    showQuickActions: !isCollapsed
  }), [
    filteredItems,
    activeItem?.id,
    favoritesSet,
    handleNavigation,
    handleToggleFavorite,
    handleQuickActions,
    isCollapsed
  ])

  const sidebarWidth = isCollapsed ? 72 : 280

  return (
    <EnterpriseSidebarErrorBoundary>
      <TooltipProvider>
        <motion.aside
          ref={sidebarRef}
          initial={shouldReduceMotion ? false : { x: -sidebarWidth, opacity: 0 }}
          animate={shouldReduceMotion ? {} : { 
            x: 0, 
            opacity: 1,
            width: sidebarWidth
          }}
          transition={shouldReduceMotion ? {} : {
            type: "spring",
            damping: 25,
            stiffness: 200,
            duration: 0.3
          }}
          className={cn(
            "fixed left-0 top-16 bottom-0 z-40",
            "bg-background/95 backdrop-blur-sm border-r border-border/50",
            "supports-[backdrop-filter]:bg-background/80",
            className
          )}
          style={{ width: sidebarWidth }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">Navigation</h2>
                  <Badge variant="outline" className="text-xs">
                    {filteredItems.length}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                {/* Pin/Unpin */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => dispatch({ type: 'SET_PINNED', payload: !state.isPinned })}
                    >
                      {state.isPinned ? (
                        <PinOff className="w-3 h-3" />
                      ) : (
                        <Pin className="w-3 h-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{state.isPinned ? 'Unpin sidebar' : 'Pin sidebar'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Collapse/Expand */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCollapsedChange(!isCollapsed)}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronLeft className="w-3 h-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Search */}
            {!isCollapsed && (
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search navigation..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                  {state.isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Content */}
            <div className="flex-1 overflow-hidden">
              {filteredItems.length > 20 ? (
                // Use virtualization for large lists
                <List
                  ref={listRef}
                  height={600}
                  itemCount={filteredItems.length}
                  itemSize={isCollapsed ? 56 : 80}
                  itemData={virtualizationData}
                  className="p-2"
                >
                  {VirtualizedNavigationItem}
                </List>
              ) : (
                // Regular rendering for smaller lists
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-4">
                    {sections.map((section) => (
                      <div key={section.id}>
                        {!isCollapsed && (
                          <div className="px-3 py-2">
                            <Collapsible
                              open={section.expanded}
                              onOpenChange={() => dispatch({ type: 'TOGGLE_SECTION', payload: section.id })}
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-full justify-start p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                  <section.icon className="w-3 h-3 mr-2" />
                                  {section.title}
                                  <span className="ml-auto text-xs">({section.items.length})</span>
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-1 mt-2">
                                <AnimatePresence>
                                  {section.items.map((item) => (
                                    <motion.div
                                      key={item.id}
                                      initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                                      exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                                      transition={shouldReduceMotion ? {} : { duration: 0.2 }}
                                    >
                                      <NavigationItemComponent
                                        item={item}
                                        isActive={activeItem?.id === item.id}
                                        isFavorite={favoritesSet.has(item.id)}
                                        onNavigate={handleNavigation}
                                        onToggleFavorite={handleToggleFavorite}
                                        onQuickActions={handleQuickActions}
                                        isCollapsed={false}
                                        showQuickActions={true}
                                      />
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}

                        {isCollapsed && section.items.map((item) => (
                          <NavigationItemComponent
                            key={item.id}
                            item={item}
                            isActive={activeItem?.id === item.id}
                            isFavorite={favoritesSet.has(item.id)}
                            onNavigate={handleNavigation}
                            onToggleFavorite={handleToggleFavorite}
                            onQuickActions={handleQuickActions}
                            isCollapsed={true}
                            showQuickActions={false}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border/50">
              {!isCollapsed && (
                <div className="space-y-2">
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{filteredItems.filter(item => !item.isRacineFeature).length} SPAs</span>
                    <span>{filteredItems.filter(item => item.isRacineFeature).length} Features</span>
                  </div>
                </div>
              )}
              
              {/* Global Quick Actions Trigger */}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full mt-2 justify-start",
                  isCollapsed && "px-2",
                  isQuickActionsSidebarOpen && "bg-primary/10 text-primary border-primary/30"
                )}
                onClick={() => handleQuickActions({ id: 'global', name: 'Quick Actions' } as NavigationItem)}
              >
                <Zap className="w-3 h-3" />
                {!isCollapsed && <span className="ml-2">Quick Actions</span>}
              </Button>
            </div>
          </div>
        </motion.aside>
      </TooltipProvider>
    </EnterpriseSidebarErrorBoundary>
  )
})

EnterpriseAppSidebar.displayName = 'EnterpriseAppSidebar'

export default EnterpriseAppSidebar