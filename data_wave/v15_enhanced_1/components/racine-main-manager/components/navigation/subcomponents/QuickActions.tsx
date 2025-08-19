'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Activity,
  Bot,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Share2,
  Copy,
  Edit3,
  Trash2,
  Archive,
  Bookmark,
  Star,
  Eye,
  Search,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Globe,
  ExternalLink,
  ChevronRight,
  Command,
  Workflow,
  GitBranch,
  Layers,
  Target,
  Briefcase,
  Code,
  Hash,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

// Import racine foundation layers (already implemented)
import { useQuickActions } from '../../../hooks/useQuickActions'
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../../hooks/useUserManagement'
import { useActivityTracker } from '../../../hooks/useActivityTracker'
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement'

// Import types (already implemented)
import {
  QuickAction,
  QuickActionCategory,
  QuickActionContext,
  UserContext,
  SPAContext,
  WorkspaceState,
  SystemHealth,
  ActionPermission,
  ActionResult
} from '../../../types/racine-core.types'

// Import utils (already implemented)
import { executeQuickAction, getContextualActions } from '../../../utils/quick-action-utils'
import { checkActionPermissions } from '../../../utils/security-utils'

// Import constants (already implemented)
import { QUICK_ACTION_CATEGORIES, DEFAULT_QUICK_ACTIONS } from '../../../constants/quick-action-constants'

interface QuickActionsProps {
  context?: QuickActionContext
  showCategories?: boolean
  maxActionsPerCategory?: number
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'buttons' | 'dropdown' | 'grid'
  className?: string
  onActionExecute?: (action: QuickAction, result: ActionResult) => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  context = 'global',
  showCategories = true,
  maxActionsPerCategory = 6,
  orientation = 'horizontal',
  size = 'md',
  variant = 'buttons',
  className,
  onActionExecute
}) => {
  // State management
  const [availableActions, setAvailableActions] = useState<QuickAction[]>([])
  const [categorizedActions, setCategorizedActions] = useState<Record<string, QuickAction[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set())
  const [recentActions, setRecentActions] = useState<QuickAction[]>([])
  const [favoriteActions, setFavoriteActions] = useState<string[]>([])

  // Custom hooks (already implemented)
  const { 
    getQuickActions, 
    executeAction, 
    getContextualActions: getContextActions,
    getFavoriteActions,
    addToFavorites,
    removeFromFavorites,
    getRecentActions,
    trackActionUsage
  } = useQuickActions()
  
  const { 
    getActiveSPAContext, 
    getAllSPAStatuses,
    canExecuteAction 
  } = useCrossGroupIntegration()
  
  const { getCurrentUser, getUserPermissions } = useUserManagement()
  const { trackEvent } = useActivityTracker()
  const { getActiveWorkspace } = useWorkspaceManagement()

  // Get current context
  const currentUser = getCurrentUser()
  const userPermissions = getUserPermissions()
  const activeSPAContext = getActiveSPAContext()
  const allSPAStatuses = getAllSPAStatuses()
  const activeWorkspace = getActiveWorkspace()

  // Load available actions based on context
  const loadAvailableActions = useCallback(async () => {
    setIsLoading(true)
    try {
      let actions: QuickAction[] = []

      // Get actions based on context
      switch (context) {
        case 'global':
          actions = await getQuickActions('global')
          break
        case 'spa-specific':
          actions = await getContextActions(activeSPAContext)
          break
        case 'workspace':
          actions = await getQuickActions('workspace', activeWorkspace?.id)
          break
        default:
          actions = await getContextActions(context)
      }

      // Filter actions based on permissions
      const permittedActions = actions.filter(action => 
        checkActionPermissions(action, userPermissions) &&
        canExecuteAction(action.id, activeSPAContext)
      )

      setAvailableActions(permittedActions)

      // Categorize actions
      const categorized = QUICK_ACTION_CATEGORIES.reduce((acc, category) => {
        acc[category.id] = permittedActions
          .filter(action => action.category === category.id)
          .slice(0, maxActionsPerCategory)
        return acc
      }, {} as Record<string, QuickAction[]>)

      setCategorizedActions(categorized)

      // Load favorites and recent actions
      const [favorites, recent] = await Promise.all([
        getFavoriteActions(),
        getRecentActions(10)
      ])
      
      setFavoriteActions(favorites)
      setRecentActions(recent)

    } catch (error) {
      console.error('Failed to load quick actions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [
    context, 
    activeSPAContext, 
    activeWorkspace?.id, 
    userPermissions, 
    maxActionsPerCategory,
    getQuickActions,
    getContextActions,
    checkActionPermissions,
    canExecuteAction,
    getFavoriteActions,
    getRecentActions
  ])

  // Load actions on mount and context change
  useEffect(() => {
    loadAvailableActions()
  }, [loadAvailableActions])

  // Handle action execution
  const handleActionExecute = useCallback(async (action: QuickAction) => {
    if (executingActions.has(action.id)) return

    setExecutingActions(prev => new Set(prev).add(action.id))

    try {
      // Execute the action
      const result = await executeAction(action.id, {
        context: activeSPAContext,
        workspace: activeWorkspace,
        user: currentUser
      })

      // Track action execution
      trackActionUsage(action.id)
      trackEvent('quick_action_executed', {
        actionId: action.id,
        actionType: action.type,
        category: action.category,
        context: context,
        spa: activeSPAContext,
        success: result.success
      })

      // Update recent actions
      setRecentActions(prev => {
        const updated = [action, ...prev.filter(a => a.id !== action.id)]
        return updated.slice(0, 10)
      })

      onActionExecute?.(action, result)

      return result
    } catch (error) {
      console.error('Failed to execute action:', error)
      trackEvent('quick_action_failed', {
        actionId: action.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setExecutingActions(prev => {
        const updated = new Set(prev)
        updated.delete(action.id)
        return updated
      })
    }
  }, [
    executingActions,
    executeAction,
    activeSPAContext,
    activeWorkspace,
    currentUser,
    trackActionUsage,
    trackEvent,
    context,
    onActionExecute
  ])

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (actionId: string) => {
    try {
      if (favoriteActions.includes(actionId)) {
        await removeFromFavorites(actionId)
        setFavoriteActions(prev => prev.filter(id => id !== actionId))
      } else {
        await addToFavorites(actionId)
        setFavoriteActions(prev => [...prev, actionId])
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [favoriteActions, addToFavorites, removeFromFavorites])

  // Get action button size classes
  const getSizeClasses = useCallback(() => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs'
      case 'lg':
        return 'h-12 px-6 text-base'
      default:
        return 'h-10 px-4 text-sm'
    }
  }, [size])

  // Render action button
  const renderActionButton = useCallback((action: QuickAction, showLabel = true) => {
    const isExecuting = executingActions.has(action.id)
    const isFavorite = favoriteActions.includes(action.id)
    const Icon = action.icon || Zap

    return (
      <TooltipProvider key={action.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={action.variant || 'outline'}
              size={size}
              className={cn(
                getSizeClasses(),
                "gap-2 transition-all duration-200 hover:scale-105",
                action.urgent && "border-red-500 text-red-500 hover:bg-red-50",
                isFavorite && "ring-2 ring-yellow-400"
              )}
              disabled={isExecuting || !action.enabled}
              onClick={() => handleActionExecute(action)}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {showLabel && <span className="truncate">{action.label}</span>}
              {action.shortcut && (
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  {action.shortcut}
                </kbd>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-center">
              <p className="font-medium">{action.label}</p>
              {action.description && (
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              )}
              {action.shortcut && (
                <p className="text-xs text-muted-foreground mt-1">
                  Shortcut: {action.shortcut}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }, [
    executingActions,
    favoriteActions,
    size,
    getSizeClasses,
    handleActionExecute
  ])

  // Render actions as buttons
  const renderButtonVariant = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading actions...</span>
        </div>
      )
    }

    if (availableActions.length === 0) {
      return (
        <div className="text-center py-4">
          <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No quick actions available</p>
        </div>
      )
    }

    if (showCategories) {
      return (
        <div className={cn(
          "space-y-4",
          orientation === 'horizontal' && "space-y-0 space-x-4 flex",
          orientation === 'vertical' && "space-y-4"
        )}>
          {QUICK_ACTION_CATEGORIES.map(category => {
            const actions = categorizedActions[category.id] || []
            if (actions.length === 0) return null

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <category.icon className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">{category.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {actions.length}
                  </Badge>
                </div>
                <div className={cn(
                  "flex flex-wrap gap-2",
                  orientation === 'vertical' && "flex-col"
                )}>
                  {actions.map(action => renderActionButton(action))}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div className={cn(
        "flex flex-wrap gap-2",
        orientation === 'vertical' && "flex-col"
      )}>
        {availableActions.slice(0, 12).map(action => renderActionButton(action))}
      </div>
    )
  }

  // Render actions as dropdown
  const renderDropdownVariant = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={cn(getSizeClasses(), "gap-2")}>
          <Zap className="w-4 h-4" />
          Quick Actions
          <Badge variant="secondary" className="ml-2">
            {availableActions.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {recentActions.length > 0 && (
          <>
            <DropdownMenuLabel>Recent Actions</DropdownMenuLabel>
            {recentActions.slice(0, 3).map(action => (
              <DropdownMenuItem
                key={`recent-${action.id}`}
                onClick={() => handleActionExecute(action)}
                disabled={executingActions.has(action.id)}
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
                {action.shortcut && (
                  <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {QUICK_ACTION_CATEGORIES.map(category => {
          const actions = categorizedActions[category.id] || []
          if (actions.length === 0) return null

          return (
            <DropdownMenuSub key={category.id}>
              <DropdownMenuSubTrigger>
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
                <Badge variant="outline" className="ml-auto">
                  {actions.length}
                </Badge>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {actions.map(action => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => handleActionExecute(action)}
                    disabled={executingActions.has(action.id) || !action.enabled}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                    {action.shortcut && (
                      <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Render actions as grid
  const renderGridVariant = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {availableActions.slice(0, 12).map(action => (
        <Card key={action.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="text-center space-y-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-16 p-0"
                  disabled={executingActions.has(action.id) || !action.enabled}
                  onClick={() => handleActionExecute(action)}
                >
                  {executingActions.has(action.id) ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <action.icon className="w-8 h-8" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-6 w-6 p-0"
                  onClick={() => handleFavoriteToggle(action.id)}
                >
                  <Star className={cn(
                    "w-3 h-3",
                    favoriteActions.includes(action.id) && "fill-yellow-400 text-yellow-400"
                  )} />
                </Button>
              </div>
              <div>
                <p className="text-xs font-medium truncate">{action.label}</p>
                {action.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {action.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className={cn("quick-actions", className)}>
      {variant === 'buttons' && renderButtonVariant()}
      {variant === 'dropdown' && renderDropdownVariant()}
      {variant === 'grid' && renderGridVariant()}
    </div>
  )
}

export default QuickActions