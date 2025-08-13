'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock,
  Filter,
  Settings,
  Archive,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Activity,
  Zap,
  Bot,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertOctagon,
  Download,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Volume2,
  VolumeX,
  Dot,
  Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'

// Import racine foundation layers (already implemented)
import { useNotificationManager } from '../../../hooks/useNotificationManager'
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration'
import { useUserManagement } from '../../../hooks/useUserManagement'
import { useActivityTracker } from '../../../hooks/useActivityTracker'
import { useUserPreferences } from '../../../hooks/useUserPreferences'

// Import types (already implemented)
import {
  NotificationItem,
  NotificationCategory,
  NotificationPriority,
  NotificationAction,
  UserContext,
  SPAContext,
  NotificationPreferences,
  NotificationFilter,
  NotificationSound
} from '../../../types/racine-core.types'

// Import utils (already implemented)
import { formatNotificationTime, getNotificationIcon, playNotificationSound } from '../../../utils/notification-utils'
import { groupNotifications, sortNotifications } from '../../../utils/data-utils'

// Import constants (already implemented)
import { NOTIFICATION_CATEGORIES, NOTIFICATION_SOUNDS, MAX_VISIBLE_NOTIFICATIONS } from '../../../constants/notification-constants'

interface QuickNotificationsProps {
  isOpen?: boolean
  onClose?: () => void
  onNotificationClick?: (notification: NotificationItem) => void
  maxHeight?: number
  showBadge?: boolean
  autoClose?: boolean
  className?: string
}

export const QuickNotifications: React.FC<QuickNotificationsProps> = ({
  isOpen = false,
  onClose,
  onNotificationClick,
  maxHeight = 400,
  showBadge = true,
  autoClose = false,
  className
}) => {
  // State management
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  // Refs
  const popoverRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Custom hooks (already implemented)
  const { 
    getAllNotifications, 
    markAsRead, 
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    getNotificationsByCategory,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    getNotificationSound
  } = useNotificationManager()
  
  const { 
    getActiveSPAContext, 
    getAllSPAStatuses 
  } = useCrossGroupIntegration()
  
  const { getCurrentUser } = useUserManagement()
  const { trackEvent } = useActivityTracker()
  const { 
    getNotificationPreferences, 
    updateNotificationPreferences 
  } = useUserPreferences()

  // Get current context
  const currentUser = getCurrentUser()
  const activeSPAContext = getActiveSPAContext()
  const allSPAStatuses = getAllSPAStatuses()
  const notificationPreferences = getNotificationPreferences()

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const allNotifications = await getAllNotifications()
      setNotifications(allNotifications)
      setUnreadCount(allNotifications.filter(n => !n.isRead).length)
      setLastSync(new Date())
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getAllNotifications])

  // Initial load and subscription
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
      
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications((newNotification) => {
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Play notification sound if enabled
        if (soundEnabled && notificationPreferences.soundEnabled) {
          playNotificationSound(newNotification.priority)
        }
        
        // Track notification received
        trackEvent('notification_received', {
          notificationId: newNotification.id,
          category: newNotification.category,
          priority: newNotification.priority,
          spa: newNotification.spa
        })
      })

      return () => {
        unsubscribe()
      }
    }
  }, [isOpen, loadNotifications, subscribeToNotifications, soundEnabled, notificationPreferences, trackEvent])

  // Filter notifications based on current filters
  useEffect(() => {
    let filtered = [...notifications]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory)
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority)
    }

    // Filter by read status
    if (showOnlyUnread) {
      filtered = filtered.filter(n => !n.isRead)
    }

    // Sort by timestamp (newest first)
    filtered = sortNotifications(filtered, 'timestamp', 'desc')

    // Limit to max visible notifications
    filtered = filtered.slice(0, MAX_VISIBLE_NOTIFICATIONS)

    setFilteredNotifications(filtered)
  }, [notifications, selectedCategory, selectedPriority, showOnlyUnread])

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification: NotificationItem) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await markAsRead(notification.id)
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      // Track notification click
      trackEvent('notification_clicked', {
        notificationId: notification.id,
        category: notification.category,
        priority: notification.priority,
        spa: notification.spa
      })

      onNotificationClick?.(notification)
      
      if (autoClose) {
        onClose?.()
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error)
    }
  }, [markAsRead, trackEvent, onNotificationClick, autoClose, onClose])

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      
      trackEvent('notifications_mark_all_read', {
        count: unreadCount
      })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }, [markAllAsRead, trackEvent, unreadCount])

  // Handle delete notification
  const handleDeleteNotification = useCallback(async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      trackEvent('notification_deleted', {
        notificationId
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [deleteNotification, trackEvent])

  // Handle archive notification
  const handleArchiveNotification = useCallback(async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      await archiveNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      trackEvent('notification_archived', {
        notificationId
      })
    } catch (error) {
      console.error('Failed to archive notification:', error)
    }
  }, [archiveNotification, trackEvent])

  // Get notification icon and color
  const getNotificationDisplay = useCallback((notification: NotificationItem) => {
    const baseIcon = getNotificationIcon(notification.category)
    
    let priorityColor = 'text-muted-foreground'
    let bgColor = 'bg-muted/30'
    
    switch (notification.priority) {
      case 'critical':
        priorityColor = 'text-red-500'
        bgColor = 'bg-red-50 dark:bg-red-950/30'
        break
      case 'high':
        priorityColor = 'text-orange-500'
        bgColor = 'bg-orange-50 dark:bg-orange-950/30'
        break
      case 'medium':
        priorityColor = 'text-yellow-500'
        bgColor = 'bg-yellow-50 dark:bg-yellow-950/30'
        break
      case 'low':
        priorityColor = 'text-blue-500'
        bgColor = 'bg-blue-50 dark:bg-blue-950/30'
        break
    }

    return { baseIcon, priorityColor, bgColor }
  }, [])

  // Memoized category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length }
    
    NOTIFICATION_CATEGORIES.forEach(category => {
      counts[category.id] = notifications.filter(n => n.category === category.id).length
    })
    
    return counts
  }, [notifications])

  // Memoized priority counts
  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length }
    
    const priorities = ['critical', 'high', 'medium', 'low']
    priorities.forEach(priority => {
      counts[priority] = notifications.filter(n => n.priority === priority).length
    })
    
    return counts
  }, [notifications])

  // Render notification filters
  const renderFilters = () => (
    <div className="space-y-3 p-3 border-b">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Filters</h4>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{soundEnabled ? 'Disable' : 'Enable'} notification sounds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Show only unread</span>
        <Switch
          checked={showOnlyUnread}
          onCheckedChange={setShowOnlyUnread}
        />
      </div>

      <div className="space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              Category: {selectedCategory === 'all' ? 'All' : selectedCategory}
              <Filter className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuCheckboxItem
              checked={selectedCategory === 'all'}
              onCheckedChange={() => setSelectedCategory('all')}
            >
              All Categories ({categoryCounts.all})
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {NOTIFICATION_CATEGORIES.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={selectedCategory === category.id}
                onCheckedChange={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <category.icon className="w-3 h-3" />
                  <span>{category.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {categoryCounts[category.id] || 0}
                  </Badge>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              Priority: {selectedPriority === 'all' ? 'All' : selectedPriority}
              <AlertTriangle className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuCheckboxItem
              checked={selectedPriority === 'all'}
              onCheckedChange={() => setSelectedPriority('all')}
            >
              All Priorities ({priorityCounts.all})
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {['critical', 'high', 'medium', 'low'].map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={selectedPriority === priority}
                onCheckedChange={() => setSelectedPriority(priority)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Circle className={cn(
                    "w-3 h-3",
                    priority === 'critical' && 'text-red-500',
                    priority === 'high' && 'text-orange-500',
                    priority === 'medium' && 'text-yellow-500',
                    priority === 'low' && 'text-blue-500'
                  )} />
                  <span className="capitalize">{priority}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {priorityCounts[priority] || 0}
                  </Badge>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  // Render single notification
  const renderNotification = (notification: NotificationItem) => {
    const { baseIcon: Icon, priorityColor, bgColor } = getNotificationDisplay(notification)
    const isUnread = !notification.isRead

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={cn(
          "group relative p-3 border-b cursor-pointer transition-colors",
          bgColor,
          isUnread && "border-l-4 border-l-primary",
          "hover:bg-muted/50"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          {/* Notification Icon & Status */}
          <div className="flex-shrink-0 relative">
            <div className={cn(
              "p-2 rounded-full",
              isUnread ? "bg-primary/20" : "bg-muted"
            )}>
              <Icon className={cn("w-4 h-4", priorityColor)} />
            </div>
            {isUnread && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            )}
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  isUnread ? "font-semibold" : "font-medium"
                )}>
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                )}
              </div>
              
              {/* Priority Badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  notification.priority === 'critical' && "border-red-500 text-red-500",
                  notification.priority === 'high' && "border-orange-500 text-orange-500",
                  notification.priority === 'medium' && "border-yellow-500 text-yellow-500",
                  notification.priority === 'low' && "border-blue-500 text-blue-500"
                )}
              >
                {notification.priority}
              </Badge>
            </div>

            {/* Notification Meta */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {notification.spa}
                </Badge>
                <span>{formatNotificationTime(notification.timestamp)}</span>
              </div>

              {/* Notification Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {notification.hasActions && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleArchiveNotification(notification.id, e)}
                      >
                        <Archive className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archive</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {showBadge && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className={cn("w-96 p-0", className)}
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div ref={popoverRef}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <h3 className="text-sm font-semibold">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </h3>
            </div>
            
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={handleMarkAllAsRead}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark all as read</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={loadNotifications}
                    >
                      <Clock className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Notifications List */}
          <ScrollArea className="max-h-80">
            <AnimatePresence>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div>
                  {filteredNotifications.map(renderNotification)}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {showOnlyUnread ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs text-muted-foreground">
            <span>Last updated: {formatNotificationTime(lastSync.toISOString())}</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              View All
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default QuickNotifications