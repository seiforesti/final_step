'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Home,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Workflow,
  BarChart3,
  Bot,
  MessageSquare,
  Zap,
  Globe,
  Command,
  Plus,
  Star,
  History,
  Filter,
  ArrowRight,
  ExternalLink,
  Refresh
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

// Import racine foundation layers (already implemented)
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement'
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration'
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { useNotificationManager } from '../../hooks/useNotificationManager'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { useQuickActions } from '../../hooks/useQuickActions'

// Router Integration - ENHANCED: Complete routing integration
import { useRacineRouter } from '../routing/RacineRouter'

// Import types (already implemented)
import {
  RacineState,
  SystemHealth,
  UserContext,
  WorkspaceState,
  CrossGroupState,
  NavigationContext,
  NotificationItem,
  QuickAction,
  SearchQuery,
  HealthStatus,
  SPAStatus,
  UserPermissions
} from '../../types/racine-core.types'

// Import utils (already implemented)
import { coordinateNavigation, orchestrateExistingSPAs } from '../../utils/cross-group-orchestrator'
import { checkPermissions, validateAccess } from '../../utils/security-utils'
import { formatNotificationTime, getHealthStatusColor, getStatusIcon } from '../../utils/navigation-utils'

// Import constants (already implemented)
import {
  SUPPORTED_GROUPS,
  SPA_ROUTES,
  HEALTH_CHECK_INTERVAL,
  NOTIFICATION_TYPES,
  QUICK_ACTION_CATEGORIES
} from '../../constants/cross-group-configs'

// Import new subcomponents for enhanced functionality
import { QuickSearch } from './subcomponents/QuickSearch'
import { QuickNotifications } from './subcomponents/QuickNotifications'
import { QuickActions } from './subcomponents/QuickActions'
import { QuickWorkspaceSwitch } from './subcomponents/QuickWorkspaceSwitch'
import { QuickHealthStatus } from './subcomponents/QuickHealthStatus'

// Existing SPA route mappings for deep integration
const EXISTING_SPA_ROUTES = {
  'data-sources': '/v15_enhanced_1/components/data-sources',
  'scan-rule-sets': '/v15_enhanced_1/components/Advanced-Scan-Rule-Sets',
  'classifications': '/v15_enhanced_1/components/classifications',
  'compliance-rule': '/v15_enhanced_1/components/Compliance-Rule',
  'advanced-catalog': '/v15_enhanced_1/components/Advanced-Catalog',
  'scan-logic': '/v15_enhanced_1/components/Advanced-Scan-Logic',
  'rbac-system': '/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System'
} as const

// SPA metadata for navigation
const SPA_METADATA = {
  'data-sources': {
    name: 'Data Sources',
    icon: Database,
    description: 'Manage and monitor data source connections',
    color: 'bg-blue-500',
    category: 'Data Management'
  },
  'scan-rule-sets': {
    name: 'Scan Rule Sets',
    icon: Shield,
    description: 'Configure and manage scanning rules',
    color: 'bg-purple-500',
    category: 'Security & Compliance'
  },
  'classifications': {
    name: 'Classifications',
    icon: FileText,
    description: 'Data classification and tagging',
    color: 'bg-green-500',
    category: 'Data Governance'
  },
  'compliance-rule': {
    name: 'Compliance Rules',
    icon: BookOpen,
    description: 'Compliance policies and rules management',
    color: 'bg-orange-500',
    category: 'Security & Compliance'
  },
  'advanced-catalog': {
    name: 'Advanced Catalog',
    icon: Scan,
    description: 'Data catalog and metadata management',
    color: 'bg-teal-500',
    category: 'Data Management'
  },
  'scan-logic': {
    name: 'Scan Logic',
    icon: Activity,
    description: 'Advanced scanning and processing logic',
    color: 'bg-indigo-500',
    category: 'Processing'
  },
  'rbac-system': {
    name: 'RBAC System',
    icon: Users,
    description: 'Role-based access control management',
    color: 'bg-red-500',
    category: 'Security & Compliance'
  }
} as const

// Racine feature routes
const RACINE_FEATURE_ROUTES = {
  dashboard: '/racine/dashboard',
  workspace: '/racine/workspace',
  workflows: '/racine/job-workflow-space',
  pipelines: '/racine/pipeline-manager',
  ai: '/racine/ai-assistant',
  activity: '/racine/activity-tracker',
  analytics: '/racine/intelligent-dashboard',
  collaboration: '/racine/collaboration',
  settings: '/racine/user-management'
} as const

interface AppNavbarProps {
  className?: string
  onQuickActionsTrigger?: () => void
  isQuickActionsSidebarOpen?: boolean
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  className,
  onQuickActionsTrigger,
  isQuickActionsSidebarOpen = false
}) => {
  // Core state management using foundation hooks
  const {
    orchestrationState,
    executeWorkflow,
    monitorHealth,
    optimizePerformance,
    getSystemMetrics
  } = useRacineOrchestration()

  const {
    userContext,
    getUserProfile,
    getUserPermissions,
    updateUserPreferences,
    checkUserAccess
  } = useUserManagement()

  const {
    workspaceState,
    switchWorkspace,
    getUserWorkspaces,
    createWorkspace,
    getWorkspaceContext
  } = useWorkspaceManagement()

  const {
    crossGroupState,
    getExistingSPAStatus,
    coordinateNavigation: coordinateSPANavigation,
    getAllGroupsStatus,
    navigateToSPA
  } = useCrossGroupIntegration()

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationsByType,
    subscribeToUpdates
  } = useNotificationManager()

  const {
    searchQuery,
    searchResults,
    isSearching,
    executeGlobalSearch,
    clearSearch,
    getSearchSuggestions,
    saveSearchQuery
  } = useGlobalSearch()

  const {
    quickActions,
    getContextualActions,
    executeQuickAction,
    getQuickActionHistory,
    customizeQuickActions
  } = useQuickActions()

  // Local state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [healthStatusExpanded, setHealthStatusExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Real-time system health monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      monitorHealth()
      setCurrentTime(new Date())
    }, HEALTH_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [monitorHealth])

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((notification) => {
      // Handle real-time notification updates
      console.log('New notification:', notification)
    })

    return unsubscribe
  }, [subscribeToUpdates])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global search shortcut (Cmd/Ctrl + K)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }

      // Quick actions trigger (Cmd/Ctrl + .)
      if ((event.metaKey || event.ctrlKey) && event.key === '.') {
        event.preventDefault()
        onQuickActionsTrigger?.()
      }

      // Escape to close modals
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setIsNotificationsOpen(false)
        setIsProfileOpen(false)
        setIsWorkspaceSwitcherOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onQuickActionsTrigger])

  // Get current SPA context
  const currentSPAContext = useMemo(() => {
    for (const [spaKey, route] of Object.entries(EXISTING_SPA_ROUTES)) {
      if (pathname.startsWith(route)) {
        return {
          spa: spaKey as keyof typeof EXISTING_SPA_ROUTES,
          metadata: SPA_METADATA[spaKey as keyof typeof SPA_METADATA],
          isActive: true
        }
      }
    }
    return null
  }, [pathname])

  // Calculate overall system health
  const systemHealthSummary = useMemo(() => {
    const healthData = orchestrationState.systemMetrics?.health || {}
    const statuses = Object.values(healthData)
    
    const healthyCount = statuses.filter(status => status === 'healthy').length
    const degradedCount = statuses.filter(status => status === 'degraded').length
    const failedCount = statuses.filter(status => status === 'failed').length
    
    const overallHealth: HealthStatus = 
      failedCount > 0 ? 'failed' : 
      degradedCount > 0 ? 'degraded' : 'healthy'

    return {
      overall: overallHealth,
      healthy: healthyCount,
      degraded: degradedCount,
      failed: failedCount,
      total: statuses.length
    }
  }, [orchestrationState.systemMetrics])

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    setSearchInput(query)
    await executeGlobalSearch({
      query,
      filters: {
        spas: Object.keys(EXISTING_SPA_ROUTES),
        includeRacineFeatures: true
      },
      limit: 50
    })
  }, [executeGlobalSearch])

  // Handle SPA navigation
  const handleSPANavigation = useCallback(async (spaKey: string) => {
    try {
      // Use cross-group integration to coordinate navigation
      await coordinateSPANavigation(spaKey, {
        preserveContext: true,
        updateHistory: true,
        trackAnalytics: true
      })

      // Navigate to the SPA
      const route = EXISTING_SPA_ROUTES[spaKey as keyof typeof EXISTING_SPA_ROUTES]
      if (route) {
        router.push(route)
      }
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }, [coordinateSPANavigation, router])

  // Handle workspace switching
  const handleWorkspaceSwitch = useCallback(async (workspaceId: string) => {
    try {
      await switchWorkspace(workspaceId)
      setIsWorkspaceSwitcherOpen(false)
    } catch (error) {
      console.error('Workspace switch error:', error)
    }
  }, [switchWorkspace])

  // Render system health indicator
  const renderHealthIndicator = () => {
    const { overall, healthy, degraded, failed, total } = systemHealthSummary
    const color = getHealthStatusColor(overall)
    const Icon = getStatusIcon(overall)

    return (
      <Popover open={healthStatusExpanded} onOpenChange={setHealthStatusExpanded}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 text-xs font-medium transition-all duration-200",
              color,
              "hover:scale-105"
            )}
          >
            <Icon className="w-3 h-3 mr-1" />
            {overall.toUpperCase()}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">System Health</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => monitorHealth()}
                className="h-6 px-2"
              >
                <Refresh className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Status</span>
                <Badge variant={overall === 'healthy' ? 'default' : overall === 'degraded' ? 'secondary' : 'destructive'}>
                  {overall}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Healthy: {healthy}</span>
                  <span>Degraded: {degraded}</span>
                  <span>Failed: {failed}</span>
                </div>
                <Progress 
                  value={(healthy / total) * 100} 
                  className="h-1"
                />
              </div>
            </div>

            {/* Individual SPA status */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">SPA Status</h5>
              <div className="space-y-1">
                {Object.entries(SPA_METADATA).map(([spaKey, metadata]) => {
                  const status = crossGroupState.groupStatuses?.[spaKey] || 'unknown'
                  const StatusIcon = getStatusIcon(status)
                  const statusColor = getHealthStatusColor(status)
                  
                  return (
                    <div key={spaKey} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <metadata.icon className="w-3 h-3" />
                        <span>{metadata.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={cn("w-3 h-3", statusColor)} />
                        <span className={statusColor}>{status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Last updated: {currentTime.toLocaleTimeString()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/racine/intelligent-dashboard')}
                className="h-6 px-2 text-xs"
              >
                View Details
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Render notification center
  const renderNotificationCenter = () => (
    <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="h-6 px-2 text-xs"
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/racine/activity-tracker')}
                className="h-6 px-2 text-xs"
              >
                View all
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  notification.read ? "bg-muted/30" : "bg-background border-primary/20",
                  "hover:bg-muted/50"
                )}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.actionUrl) {
                    router.push(notification.actionUrl)
                    setIsNotificationsOpen(false)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    notification.read ? "bg-muted-foreground/30" : "bg-primary"
                  )} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {notification.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )

  // Render workspace switcher
  const renderWorkspaceSwitcher = () => (
    <DropdownMenu open={isWorkspaceSwitcherOpen} onOpenChange={setIsWorkspaceSwitcherOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-3 text-sm font-medium"
        >
          <Globe className="w-4 h-4 mr-2" />
          {workspaceState.currentWorkspace?.name || 'Select Workspace'}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {workspaceState.availableWorkspaces?.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceSwitch(workspace.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                workspace.id === workspaceState.currentWorkspace?.id ? "bg-primary" : "bg-muted-foreground/30"
              )} />
              <span>{workspace.name}</span>
            </div>
            {workspace.id === workspaceState.currentWorkspace?.id && (
              <CheckCircle className="w-3 h-3" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/racine/workspace')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Render user profile menu
  const renderUserProfile = useCallback(() => {
    return (
    <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={userContext.profile?.avatarUrl} />
            <AvatarFallback>
              {userContext.profile?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="font-medium">{userContext.profile?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{userContext.profile?.email}</p>
            <div className="flex gap-1">
              {userContext.permissions?.roles?.map((role) => (
                <Badge key={role} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/racine/user-management')}>
          <User className="w-4 h-4 mr-2" />
          Profile Settings
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/racine/user-management/preferences')}>
          <Settings className="w-4 h-4 mr-2" />
          Preferences
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/racine/user-management/security')}>
          <Shield className="w-4 h-4 mr-2" />
          Security
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/racine/user-management/api-keys')}>
          <Command className="w-4 h-4 mr-2" />
          API Keys
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Admin-only RBAC access */}
        {checkUserAccess('rbac:admin') && (
          <>
            <DropdownMenuItem onClick={() => handleSPANavigation('rbac-system')}>
              <Users className="w-4 h-4 mr-2" />
              RBAC Management
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem 
          onClick={() => {
            // Handle sign out
            router.push('/auth/logout')
          }}
          className="text-destructive focus:text-destructive"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    )
  }, [isProfileOpen, userContext])

  // Render SPA navigation menu
  const renderSPANavigation = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-3 text-sm font-medium"
        >
          <Database className="w-4 h-4 mr-2" />
          SPAs
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Data Governance SPAs</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="grid grid-cols-1 gap-1 p-1">
          {Object.entries(SPA_METADATA).map(([spaKey, metadata]) => {
            const hasAccess = checkUserAccess(`spa:${spaKey}`)
            const status = crossGroupState.groupStatuses?.[spaKey] || 'unknown'
            const StatusIcon = getStatusIcon(status)
            const isActive = currentSPAContext?.spa === spaKey
            
            // Hide RBAC for non-admin users
            if (spaKey === 'rbac-system' && !checkUserAccess('rbac:admin')) {
              return null
            }
            
            return (
              <DropdownMenuItem
                key={spaKey}
                onClick={() => hasAccess && handleSPANavigation(spaKey)}
                disabled={!hasAccess}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer",
                  isActive && "bg-primary/10 border-l-2 border-l-primary"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  metadata.color
                )}>
                  <metadata.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{metadata.name}</h4>
                    <div className="flex items-center gap-1">
                      <StatusIcon className={cn("w-3 h-3", getHealthStatusColor(status))} />
                      {isActive && <Badge variant="outline" className="text-xs">Active</Badge>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{metadata.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metadata.category}</p>
                </div>
                <ArrowRight className="w-3 h-3 opacity-50" />
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <TooltipProvider>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-16",
          "bg-background/80 backdrop-blur-xl border-b border-border/50",
          "supports-[backdrop-filter]:bg-background/60",
          className
        )}
      >
        <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
          {/* Left section - Logo & Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Racine Data Governance
                </h1>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {renderSPANavigation()}
              
              <Separator orientation="vertical" className="h-4 mx-2" />
              
              {/* Racine Features */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-3 text-sm font-medium">
                    <Workflow className="w-4 h-4 mr-2" />
                    Features
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="start">
                  <DropdownMenuLabel>Racine Features</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => router.push('/racine/dashboard')}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Global Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => router.push('/racine/job-workflow-space')}>
                    <Workflow className="w-4 h-4 mr-2" />
                    Job Workflows
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => router.push('/racine/pipeline-manager')}>
                    <Zap className="w-4 h-4 mr-2" />
                    Pipeline Manager
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => router.push('/racine/ai-assistant')}>
                    <Bot className="w-4 h-4 mr-2" />
                    AI Assistant
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => router.push('/racine/collaboration')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Collaboration
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Center section - Enhanced Global Search */}
          <div className="flex-1 max-w-xl mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search across all SPAs... (⌘K)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchInput)
                    setIsSearchOpen(true)
                  }
                  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault()
                    setIsSearchOpen(true)
                  }
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="pl-10 pr-4 h-9 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
            
            {/* Enhanced Global Search Modal */}
            <QuickSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              defaultQuery={searchInput}
              onResultSelect={(result) => {
                // Navigate to the result
                if (result.url) {
                  router.push(result.url)
                } else if (result.spa) {
                  navigateToSPA(result.spa, result.path)
                }
                setIsSearchOpen(false)
              }}
              enableAIInsights={true}
              showCategories={true}
            />
          </div>

          {/* Right section - System Status, Notifications, User */}
          <div className="flex items-center gap-2">
            {/* Enhanced System Health Status */}
            <QuickHealthStatus
              compact={false}
              autoRefresh={true}
              refreshInterval={30000}
              onHealthClick={(health) => {
                // Navigate to detailed health dashboard
                router.push('/racine/health-dashboard')
              }}
            />

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Enhanced Workspace Switcher */}
            <QuickWorkspaceSwitch
              showCreateOption={true}
              showTemplates={true}
              onWorkspaceSwitch={(workspace) => {
                // Track workspace switch
                trackEvent('workspace_switched_from_navbar', {
                  workspaceId: workspace.id,
                  workspaceName: workspace.name
                })
              }}
              onWorkspaceCreate={(workspace) => {
                // Track workspace creation
                trackEvent('workspace_created_from_navbar', {
                  workspaceId: workspace.id,
                  workspaceName: workspace.name
                })
              }}
            />

            {/* Quick Actions Trigger */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onQuickActionsTrigger}
                  className={cn(
                    "h-8 w-8",
                    isQuickActionsSidebarOpen && "bg-primary/10 text-primary"
                  )}
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Actions (⌘.)</p>
              </TooltipContent>
            </Tooltip>

            {/* Enhanced Notifications */}
            <QuickNotifications
              showBadge={true}
              autoClose={false}
              onNotificationClick={(notification) => {
                // Handle notification click based on type
                if (notification.actionUrl) {
                  router.push(notification.actionUrl)
                } else if (notification.spa) {
                  navigateToSPA(notification.spa, notification.path)
                }
              }}
            />

            {/* User Profile */}
            {renderUserProfile()}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t bg-background/95 backdrop-blur-sm"
            >
              <div className="container py-4 space-y-4">
                {/* Mobile SPA Links */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Data Governance SPAs</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SPA_METADATA).map(([spaKey, metadata]) => {
                      const hasAccess = checkUserAccess(`spa:${spaKey}`)
                      
                      if (spaKey === 'rbac-system' && !checkUserAccess('rbac:admin')) {
                        return null
                      }
                      
                      return (
                        <Button
                          key={spaKey}
                          variant="ghost"
                          onClick={() => {
                            hasAccess && handleSPANavigation(spaKey)
                            setIsMobileMenuOpen(false)
                          }}
                          disabled={!hasAccess}
                          className="h-auto p-3 flex flex-col items-start gap-1"
                        >
                          <div className="flex items-center gap-2">
                            <metadata.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{metadata.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground text-left">
                            {metadata.description}
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile Racine Features */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Racine Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push('/racine/job-workflow-space')
                        setIsMobileMenuOpen(false)
                      }}
                      className="h-auto p-3 flex flex-col items-start gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <Workflow className="w-4 h-4" />
                        <span className="text-sm font-medium">Workflows</span>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push('/racine/ai-assistant')
                        setIsMobileMenuOpen(false)
                      }}
                      className="h-auto p-3 flex flex-col items-start gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-sm font-medium">AI Assistant</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Global Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Global Search Interface will be implemented in the next component */}
              <div className="bg-background border rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search across all SPAs and features..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchInput)
                      } else if (e.key === 'Escape') {
                        setIsSearchOpen(false)
                      }
                    }}
                    className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                    autoFocus
                  />
                </div>
                
                {/* Search results will be rendered here */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        router.push(result.url)
                        setIsSearchOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          {result.icon && <result.icon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{result.title}</h4>
                          <p className="text-xs text-muted-foreground">{result.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {result.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {searchInput && searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No results found</p>
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm">Searching...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}

export default AppNavbar