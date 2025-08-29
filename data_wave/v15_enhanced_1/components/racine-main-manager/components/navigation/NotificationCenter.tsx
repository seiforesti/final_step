'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, X, Check, AlertTriangle, Info, CheckCircle, XCircle, Clock, Eye, EyeOff, Star, Archive, Trash2, Filter, Search, MoreHorizontal, Settings, Volume2, VolumeX, Play, Pause, RotateCcw, ExternalLink, ChevronDown, ChevronUp, Calendar, User, Database, Shield, FileText, BookOpen, Scan, Activity, Users, BarChart3, Workflow, Zap, Bot, MessageSquare, Globe, Target, AlertCircle, TrendingUp, Layers, Tag, Hash, Reply, Forward, Copy, Share2, Pin, PinOff as Unpin, Bookmark, Flag, Mute, Unmute, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

// Import racine foundation layers (already implemented)
import { useNotificationManager } from '../../hooks/useNotificationManager'
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { useRealTimeSubscriptions } from '../../hooks/useRealTimeSubscriptions'
import { useUserPreferences } from '../../hooks/useUserPreferences'
import { useNotificationAnalytics } from '../../hooks/useNotificationAnalytics'

// Import types (already implemented)
import {
  NotificationItem,
  NotificationCategory,
  NotificationPriority,
  NotificationFilter,
  NotificationSettings,
  UserContext,
  SPANotificationConfig,
  NotificationAction,
  NotificationRule
} from '../../types/racine-core.types'

// Import utils (already implemented)
import { 
  formatNotificationTime, 
  getNotificationIcon, 
  getNotificationColor,
  groupNotificationsByDate,
  filterNotificationsByPermissions
} from '../../utils/navigation-utils'
import { checkPermissions } from '../../utils/security-utils'
import { sanitizeContent, truncateText } from '../../utils/text-utils'

// Import constants (already implemented)
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES,
  MAX_NOTIFICATION_DISPLAY,
  NOTIFICATION_SETTINGS
} from '../../constants/cross-group-configs'

// SPA notification metadata and endpoints
const SPA_NOTIFICATION_CONFIGS: Record<string, SPANotificationConfig> = {
  'data-sources': {
    name: 'Data Sources',
    icon: Database,
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    endpoint: '/api/data-sources/notifications',
    categories: ['connection', 'monitoring', 'performance', 'error', 'sync'],
    defaultEnabled: true,
    realTimeEnabled: true,
    permissions: ['spa:data-sources']
  },
  'scan-rule-sets': {
    name: 'Scan Rule Sets',
    icon: Shield,
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    endpoint: '/api/scan-rule-sets/notifications',
    categories: ['rule_created', 'rule_updated', 'validation', 'policy_change'],
    defaultEnabled: true,
    realTimeEnabled: true,
    permissions: ['spa:scan-rule-sets']
  },
  'classifications': {
    name: 'Classifications',
    icon: FileText,
    color: 'bg-green-500',
    textColor: 'text-green-600',
    endpoint: '/api/classifications/notifications',
    categories: ['classification_applied', 'taxonomy_update', 'label_change'],
    defaultEnabled: true,
    realTimeEnabled: true,
    permissions: ['spa:classifications']
  },
  'compliance-rule': {
    name: 'Compliance Rules',
    icon: BookOpen,
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    endpoint: '/api/compliance-rules/notifications',
    categories: ['violation', 'audit', 'regulation_update', 'compliance_check'],
    defaultEnabled: true,
    realTimeEnabled: true,
    permissions: ['spa:compliance-rule']
  },
  'advanced-catalog': {
    name: 'Advanced Catalog',
    icon: Scan,
    color: 'bg-teal-500',
    textColor: 'text-teal-600',
    endpoint: '/api/advanced-catalog/notifications',
    categories: ['asset_discovered', 'metadata_update', 'lineage_change', 'schema_drift'],
    defaultEnabled: true,
    realTimeEnabled: true,
    permissions: ['spa:advanced-catalog']
  },
  'scan-logic': {
    name: 'Scan Logic',
    icon: Activity,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    endpoint: '/api/scan-logic/notifications',
    categories: ['scan_completed', 'scan_failed', 'job_started', 'workflow_update'],
    defaultEnabled: true,
    realTimeEnabled: true,
    permissions: ['spa:scan-logic']
  },
  'rbac-system': {
    name: 'RBAC System',
    icon: Users,
    color: 'bg-red-500',
    textColor: 'text-red-600',
    endpoint: '/api/rbac/notifications',
    categories: ['user_created', 'role_assigned', 'permission_change', 'security_alert'],
    defaultEnabled: true,
    realTimeEnabled: true,
    permissions: ['spa:rbac-system', 'rbac:admin'],
    adminOnly: true
  }
} as const

// Racine system notifications
const RACINE_NOTIFICATION_CONFIGS = {
  'system': {
    name: 'System',
    icon: Settings,
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    categories: ['system_update', 'maintenance', 'performance', 'error']
  },
  'workflow': {
    name: 'Workflows',
    icon: Workflow,
    color: 'bg-violet-500',
    textColor: 'text-violet-600',
    categories: ['workflow_completed', 'workflow_failed', 'template_update']
  },
  'ai': {
    name: 'AI Assistant',
    icon: Bot,
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    categories: ['recommendation', 'insight', 'analysis_complete']
  }
} as const

// Notification priority metadata
const PRIORITY_METADATA = {
  'critical': {
    label: 'Critical',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle,
    soundEnabled: true,
    autoExpand: true
  },
  'high': {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: AlertCircle,
    soundEnabled: true,
    autoExpand: false
  },
  'medium': {
    label: 'Medium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    soundEnabled: false,
    autoExpand: false
  },
  'low': {
    label: 'Low',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    soundEnabled: false,
    autoExpand: false
  }
} as const

interface NotificationCenterProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  className?: string
  compact?: boolean
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen: externalIsOpen,
  onOpenChange,
  trigger,
  className,
  compact = false
}) => {
  // Core state management using foundation hooks
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    pinNotification,
    muteNotification,
    getNotificationsByCategory,
    getNotificationsBySource,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    bulkUpdateNotifications
  } = useNotificationManager()

  const {
    crossGroupState,
    subscribeToSPANotifications,
    unsubscribeFromSPANotifications
  } = useCrossGroupIntegration()

  const {
    userContext,
    checkUserAccess,
    getUserPermissions
  } = useUserManagement()

  const {
    trackNotificationInteraction,
    getNotificationUsageStats
  } = useActivityTracker()

  const {
    subscribe,
    unsubscribe,
    isConnected,
    connectionStatus
  } = useRealTimeSubscriptions()

  const {
    notificationPreferences,
    updateNotificationPreferences,
    getNotificationSettings
  } = useUserPreferences()

  const {
    notificationAnalytics,
    trackNotificationEvent,
    getNotificationMetrics
  } = useNotificationAnalytics()

  // Local state
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'source'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact')
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pausedSources, setPausedSources] = useState<Set<string>>(new Set())

  // Refs
  const notificationRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const audioRef = useRef<HTMLAudioElement>(null)

  const router = useRouter()

  // Determine if sheet is open
  const isOpen = externalIsOpen ?? internalIsOpen
  const setIsOpen = onOpenChange ?? setInternalIsOpen

  // Filter accessible SPAs based on permissions
  const accessibleSPAs = useMemo(() => {
    return Object.entries(SPA_NOTIFICATION_CONFIGS).filter(([spaKey, config]) => {
      if (config.adminOnly && !checkUserAccess('rbac:admin')) {
        return false
      }
      return config.permissions.some(permission => checkUserAccess(permission))
    })
  }, [checkUserAccess])

  // Filter notifications based on current filters and permissions
  const filteredNotifications = useMemo(() => {
    let filtered = filterNotificationsByPermissions(notifications, userContext)

    // Filter by tab
    switch (selectedTab) {
      case 'unread':
        filtered = filtered.filter(n => !n.read)
        break
      case 'pinned':
        filtered = filtered.filter(n => n.pinned)
        break
      case 'archived':
        filtered = filtered.filter(n => n.archived)
        break
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.source.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory)
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(n => n.source === selectedSource)
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority)
    }

    // Sort notifications
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'priority':
          const priorities = ['low', 'medium', 'high', 'critical']
          comparison = priorities.indexOf(a.priority) - priorities.indexOf(b.priority)
          break
        case 'source':
          comparison = a.source.localeCompare(b.source)
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered.slice(0, MAX_NOTIFICATION_DISPLAY)
  }, [
    notifications,
    userContext,
    selectedTab,
    searchQuery,
    selectedCategory,
    selectedSource,
    selectedPriority,
    sortBy,
    sortOrder
  ])

  // Group notifications by date for better organization
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications)
  }, [filteredNotifications])

  // Get notification categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', notifications.length)

    notifications.forEach(notification => {
      const current = counts.get(notification.category) || 0
      counts.set(notification.category, current + 1)
    })

    return Array.from(counts.entries()).map(([category, count]) => ({
      key: category,
      label: category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1),
      count
    }))
  }, [notifications])

  // Get notification sources with counts
  const sourcesWithCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', notifications.length)

    notifications.forEach(notification => {
      const current = counts.get(notification.source) || 0
      counts.set(notification.source, current + 1)
    })

    return Array.from(counts.entries()).map(([source, count]) => ({
      key: source,
      label: source === 'all' ? 'All Sources' : 
             SPA_NOTIFICATION_CONFIGS[source]?.name || 
             RACINE_NOTIFICATION_CONFIGS[source]?.name || 
             source.charAt(0).toUpperCase() + source.slice(1),
      count,
      icon: SPA_NOTIFICATION_CONFIGS[source]?.icon || 
            RACINE_NOTIFICATION_CONFIGS[source]?.icon
    }))
  }, [notifications])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (isOpen && autoRefresh) {
      // Subscribe to general notifications
      const unsubscribeGeneral = subscribeToUpdates((notification) => {
        if (soundEnabled && PRIORITY_METADATA[notification.priority]?.soundEnabled) {
          audioRef.current?.play()
        }
      })

      // Subscribe to SPA-specific notifications
      const spaUnsubscribers = accessibleSPAs.map(([spaKey]) => {
        if (!pausedSources.has(spaKey)) {
          return subscribeToSPANotifications(spaKey, {
            realTime: true,
            categories: SPA_NOTIFICATION_CONFIGS[spaKey].categories
          })
        }
        return null
      }).filter(Boolean)

      return () => {
        unsubscribeGeneral()
        spaUnsubscribers.forEach(unsub => unsub?.())
      }
    }
  }, [isOpen, autoRefresh, soundEnabled, accessibleSPAs, pausedSources, subscribeToUpdates, subscribeToSPANotifications])

  // Handle notification actions
  const handleNotificationAction = useCallback(async (
    notificationId: string, 
    action: 'read' | 'archive' | 'delete' | 'pin' | 'mute',
    notification?: NotificationItem
  ) => {
    try {
      switch (action) {
        case 'read':
          await markAsRead(notificationId)
          break
        case 'archive':
          await archiveNotification(notificationId)
          break
        case 'delete':
          await deleteNotification(notificationId)
          break
        case 'pin':
          await pinNotification(notificationId, !notification?.pinned)
          break
        case 'mute':
          await muteNotification(notificationId, !notification?.muted)
          break
      }

      // Track interaction
      trackNotificationInteraction({
        notificationId,
        action,
        source: notification?.source || 'unknown',
        timestamp: new Date()
      })

    } catch (error) {
      console.error(`Failed to ${action} notification:`, error)
    }
  }, [markAsRead, archiveNotification, deleteNotification, pinNotification, muteNotification, trackNotificationInteraction])

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: 'read' | 'archive' | 'delete') => {
    if (selectedNotifications.size === 0) return

    try {
      await bulkUpdateNotifications(Array.from(selectedNotifications), action)
      setSelectedNotifications(new Set())
      setIsSelectMode(false)
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error)
    }
  }, [selectedNotifications, bulkUpdateNotifications])

  // Handle notification click
  const handleNotificationClick = useCallback((notification: NotificationItem) => {
    // Mark as read
    if (!notification.read) {
      handleNotificationAction(notification.id, 'read', notification)
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setIsOpen(false)
    }

    // Track click
    trackNotificationEvent({
      type: 'click',
      notificationId: notification.id,
      source: notification.source,
      category: notification.category,
      timestamp: new Date()
    })
  }, [handleNotificationAction, router, setIsOpen, trackNotificationEvent])

  // Toggle notification expansion
  const toggleNotificationExpansion = useCallback((notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }, [])

  // Render notification item
  const renderNotificationItem = useCallback((notification: NotificationItem, index: number) => {
    const sourceConfig = SPA_NOTIFICATION_CONFIGS[notification.source] || 
                        RACINE_NOTIFICATION_CONFIGS[notification.source]
    const priorityConfig = PRIORITY_METADATA[notification.priority]
    const isSelected = selectedNotifications.has(notification.id)
    const isExpanded = expandedNotifications.has(notification.id)
    const SourceIcon = sourceConfig?.icon || Bell
    const PriorityIcon = priorityConfig?.icon || Info

    return (
      <motion.div
        key={notification.id}
        ref={(el) => {
          if (el) notificationRefs.current.set(notification.id, el)
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group relative p-4 border rounded-lg transition-all duration-200",
          "hover:shadow-md cursor-pointer",
          !notification.read && "bg-muted/30",
          notification.pinned && "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20",
          notification.muted && "opacity-60",
          isSelected && "ring-2 ring-primary",
          priorityConfig?.bgColor,
          priorityConfig?.borderColor
        )}
        onClick={() => !isSelectMode && handleNotificationClick(notification)}
      >
        {/* Selection checkbox (in select mode) */}
        {isSelectMode && (
          <div className="absolute top-3 left-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                setSelectedNotifications(prev => {
                  const newSet = new Set(prev)
                  if (checked) {
                    newSet.add(notification.id)
                  } else {
                    newSet.delete(notification.id)
                  }
                  return newSet
                })
              }}
            />
          </div>
        )}

        {/* Notification content */}
        <div className={cn("flex gap-3", isSelectMode && "ml-6")}>
          {/* Source icon and priority indicator */}
          <div className="flex-shrink-0 relative">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              sourceConfig?.color || "bg-muted"
            )}>
              <SourceIcon className="w-5 h-5 text-white" />
            </div>
            
            {/* Priority indicator */}
            <div className={cn(
              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
              priorityConfig?.color,
              "bg-background border-2 border-background"
            )}>
              <PriorityIcon className="w-3 h-3" />
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            )}
          </div>

          {/* Notification details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium text-sm line-clamp-1",
                  !notification.read && "font-semibold"
                )}>
                  {notification.title}
                </h4>
                <p className={cn(
                  "text-sm text-muted-foreground mt-1",
                  viewMode === 'compact' ? "line-clamp-1" : "line-clamp-2"
                )}>
                  {sanitizeContent(notification.message)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {notification.pinned && (
                  <Pin className="w-3 h-3 text-yellow-500" />
                )}
                {notification.muted && (
                  <VolumeX className="w-3 h-3 text-muted-foreground" />
                )}
                
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
                    {!notification.read && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNotificationAction(notification.id, 'read', notification)
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotificationAction(notification.id, 'pin', notification)
                      }}
                    >
                      {notification.pinned ? (
                        <>
                          <Unpin className="w-4 h-4 mr-2" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="w-4 h-4 mr-2" />
                          Pin
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotificationAction(notification.id, 'mute', notification)
                      }}
                    >
                      {notification.muted ? (
                        <>
                          <Unmute className="w-4 h-4 mr-2" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <Mute className="w-4 h-4 mr-2" />
                          Mute
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotificationAction(notification.id, 'archive', notification)
                      }}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(notification.message)
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    
                    {notification.actionUrl && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(notification.actionUrl, '_blank')
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotificationAction(notification.id, 'delete', notification)
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <SourceIcon className="w-3 h-3" />
                <span>{sourceConfig?.name || notification.source}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatNotificationTime(notification.timestamp)}</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {priorityConfig?.label || notification.priority}
              </Badge>
              
              {notification.category && (
                <Badge variant="secondary" className="text-xs">
                  {notification.category}
                </Badge>
              )}
            </div>

            {/* Expanded content */}
            {viewMode === 'detailed' && notification.details && (
              <div className="mt-3 p-3 bg-muted/50 rounded border">
                <p className="text-sm">{sanitizeContent(notification.details)}</p>
              </div>
            )}

            {/* Action buttons */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {notification.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant={action.primary ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (action.url) {
                        router.push(action.url)
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }, [
    selectedNotifications,
    expandedNotifications,
    isSelectMode,
    viewMode,
    handleNotificationClick,
    handleNotificationAction,
    router
  ])

  // Render filter controls
  const renderFilterControls = () => (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DropdownMenu open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel>Filter Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Source filter */}
          <div className="p-2 space-y-2">
            <label className="text-sm font-medium">Source</label>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourcesWithCounts.map(({ key, label, count, icon: Icon }) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{label}</span>
                      <span className="text-muted-foreground">({count})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority filter */}
          <div className="p-2 space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(PRIORITY_METADATA).map(([priority, config]) => (
                  <SelectItem key={priority} value={priority}>
                    <div className="flex items-center gap-2">
                      <config.icon className={cn("w-4 h-4", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DropdownMenuSeparator />
          
          {/* Sort options */}
          <div className="p-2 space-y-2">
            <label className="text-sm font-medium">Sort by</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="source">Source</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Button
                variant={sortOrder === 'desc' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOrder('desc')}
                className="flex-1"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                Desc
              </Button>
              <Button
                variant={sortOrder === 'asc' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOrder('asc')}
                className="flex-1"
              >
                <ChevronUp className="w-3 h-3 mr-1" />
                Asc
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSelectMode(!isSelectMode)}
      >
        <Checkbox className="w-4 h-4" />
      </Button>
    </div>
  )

  // Render bulk action controls
  const renderBulkActions = () => {
    if (!isSelectMode || selectedNotifications.size === 0) return null

    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mb-4">
        <span className="text-sm font-medium">
          {selectedNotifications.size} selected
        </span>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkAction('read')}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark Read
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkAction('archive')}
        >
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkAction('delete')}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedNotifications(new Set())
            setIsSelectMode(false)
          }}
        >
          Cancel
        </Button>
      </div>
    )
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
        <SheetContent className={cn("w-[500px] sm:w-[600px]", className)} side="right">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">
                    {unreadCount} unread
                  </Badge>
                )}
              </SheetTitle>
              
              <div className="flex items-center gap-2">
                {/* Real-time status indicator */}
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                
                {/* Settings */}
                <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuCheckboxItem
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Sound Notifications
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuCheckboxItem
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Auto Refresh
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => markAllAsRead()}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark All as Read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tab navigation */}
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Bell className="w-3 h-3" />
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center gap-2">
                  <Circle className="w-3 h-3" />
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pinned" className="flex items-center gap-2">
                  <Pin className="w-3 h-3" />
                  Pinned
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-2">
                  <Archive className="w-3 h-3" />
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Filter controls */}
            {renderFilterControls()}
            
            {/* Bulk actions */}
            {renderBulkActions()}
            
            {/* Notifications list */}
            <ScrollArea className="h-[calc(100vh-300px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTab === 'unread' 
                      ? "You're all caught up!" 
                      : "No notifications match your current filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {Object.entries(groupedNotifications).map(([date, notifications]) => (
                      <div key={date} className="space-y-3">
                        <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                          <h4 className="text-sm font-medium text-muted-foreground">{date}</h4>
                        </div>
                        {notifications.map((notification, index) => 
                          renderNotificationItem(notification, index)
                        )}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Audio element for notification sounds */}
          <audio
            ref={audioRef}
            preload="auto"
            src="/sounds/notification.mp3" // You would need to add this sound file
          />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}

export default NotificationCenter
