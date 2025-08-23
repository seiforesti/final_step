"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle, Filter, Search, MoreHorizontal, RefreshCw, Download, Settings, Archive, Mark, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

// Import RBAC integration
import { useRBAC, DATA_SOURCE_PERMISSIONS } from './hooks/use-rbac-integration'

// Enhanced notification interface
interface DataSourceNotification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high" | "critical"
  category: "system" | "performance" | "security" | "backup" | "connectivity" | "compliance" | "maintenance"
  source: string
  dataSourceId?: number
  dataSourceName?: string
  createdAt: Date
  readAt?: Date
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  acknowledgedAt?: Date
  acknowledgedBy?: string
  expiresAt?: Date
  tags?: string[]
}

interface DataSourceNotificationsProps {
  dataSourceId?: number
  className?: string
  showFilters?: boolean
  compact?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Backend API functions
const notificationApi = {
  // Get notifications for specific data source or all
  getNotifications: async (dataSourceId?: number, filters?: any): Promise<DataSourceNotification[]> => {
    const params = new URLSearchParams()
    if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
    if (filters?.type) params.append('type', filters.type)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.unread_only) params.append('unread_only', 'true')
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const response = await fetch(`${API_BASE_URL}/api/notifications?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }
    
    const data = await response.json()
    return data.notifications || []
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (notificationIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notification_ids: notificationIds })
    })
    
    if (!response.ok) {
      throw new Error('Failed to mark notifications as read')
    }
  },

  // Acknowledge notification
  acknowledgeNotification: async (notificationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to acknowledge notification')
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete notification')
    }
  },

  // Get notification statistics
  getNotificationStats: async (dataSourceId?: number): Promise<any> => {
    const params = new URLSearchParams()
    if (dataSourceId) params.append('data_source_id', dataSourceId.toString())
    
    const response = await fetch(`${API_BASE_URL}/api/notifications/stats?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch notification statistics')
    }
    
    return response.json()
  },

  // Update notification preferences
  updatePreferences: async (preferences: any): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    })
    
    if (!response.ok) {
      throw new Error('Failed to update notification preferences')
    }
  }
}

export function DataSourceNotifications({
  dataSourceId,
  className = "",
  showFilters = true,
  compact = false,
  autoRefresh = true,
  refreshInterval = 30000
}: DataSourceNotificationsProps) {
  const queryClient = useQueryClient()
  const { currentUser, hasPermission, logUserAction } = useRBAC()
  
  // State management
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filters, setFilters] = useState({
    type: "all",
    priority: "all",
    category: "all",
    unreadOnly: false,
    search: ""
  })

  // Check permissions
  const canManageNotifications = hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_AUDIT)
  const canDeleteNotifications = hasPermission('notifications.delete')

  // Fetch notifications with real backend integration
  const { 
    data: notifications = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dataSourceNotifications', dataSourceId, filters],
    queryFn: () => notificationApi.getNotifications(dataSourceId, {
      type: filters.type !== 'all' ? filters.type : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      unread_only: filters.unreadOnly,
      limit: 100
    }),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5000,
    enabled: canManageNotifications
  })

  // Fetch notification statistics
  const { data: notificationStats } = useQuery({
    queryKey: ['notificationStats', dataSourceId],
    queryFn: () => notificationApi.getNotificationStats(dataSourceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000,
    enabled: canManageNotifications
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSourceNotifications'] })
      toast.success('Notification marked as read')
    },
    onError: (error) => {
      toast.error('Failed to mark notification as read')
      console.error('Mark as read error:', error)
    }
  })

  // Mark multiple as read mutation
  const markMultipleAsReadMutation = useMutation({
    mutationFn: notificationApi.markMultipleAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSourceNotifications'] })
      setSelectedNotifications([])
      toast.success('Notifications marked as read')
    },
    onError: (error) => {
      toast.error('Failed to mark notifications as read')
      console.error('Mark multiple as read error:', error)
    }
  })

  // Acknowledge notification mutation
  const acknowledgeMutation = useMutation({
    mutationFn: notificationApi.acknowledgeNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSourceNotifications'] })
      toast.success('Notification acknowledged')
    },
    onError: (error) => {
      toast.error('Failed to acknowledge notification')
      console.error('Acknowledge error:', error)
    }
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSourceNotifications'] })
      toast.success('Notification deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete notification')
      console.error('Delete error:', error)
    }
  })

  // Transform notifications data from backend
  const transformedNotifications = useMemo(() => {
    if (!notifications) return []
    
    return notifications.map(notification => ({
      ...notification,
      createdAt: new Date(notification.created_at),
      readAt: notification.read_at ? new Date(notification.read_at) : null,
      acknowledgedAt: notification.acknowledged_at ? new Date(notification.acknowledged_at) : null,
      expiresAt: notification.expires_at ? new Date(notification.expires_at) : null,
      read: !!notification.read_at
    }))
  }, [notifications])

  // Filter notifications based on search and filters
  const filteredNotifications = useMemo(() => {
    return transformedNotifications.filter(notification => {
      const matchesType = filters.type === "all" || notification.type === filters.type
      const matchesPriority = filters.priority === "all" || notification.priority === filters.priority
      const matchesCategory = filters.category === "all" || notification.category === filters.category
      const matchesUnread = !filters.unreadOnly || !notification.read
      const matchesSearch = !filters.search || 
        notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        notification.message.toLowerCase().includes(filters.search.toLowerCase())
      
      return matchesType && matchesPriority && matchesCategory && matchesUnread && matchesSearch
    })
  }, [transformedNotifications, filters])

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification: DataSourceNotification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification.id)
      
      // Log user action
      await logUserAction('notification_viewed', 'notification', undefined, {
        notificationId: notification.id,
        notificationType: notification.type,
        category: notification.category
      })
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }, [markAsReadMutation, logUserAction])

  // Handle bulk actions
  const handleMarkSelectedAsRead = useCallback(async () => {
    if (selectedNotifications.length === 0) return
    
    await markMultipleAsReadMutation.mutateAsync(selectedNotifications)
    await logUserAction('notifications_bulk_read', 'notification', undefined, {
      count: selectedNotifications.length
    })
  }, [selectedNotifications, markMultipleAsReadMutation, logUserAction])

  // Handle acknowledge notification
  const handleAcknowledge = useCallback(async (notificationId: string) => {
    await acknowledgeMutation.mutateAsync(notificationId)
    await logUserAction('notification_acknowledged', 'notification', undefined, {
      notificationId
    })
  }, [acknowledgeMutation, logUserAction])

  // Handle delete notification
  const handleDelete = useCallback(async (notificationId: string) => {
    if (!canDeleteNotifications) {
      toast.error('You do not have permission to delete notifications')
      return
    }
    
    await deleteNotificationMutation.mutateAsync(notificationId)
    await logUserAction('notification_deleted', 'notification', undefined, {
      notificationId
    })
  }, [deleteNotificationMutation, canDeleteNotifications, logUserAction])

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  // Get priority badge variant
  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load notifications. {error instanceof Error ? error.message : 'Unknown error occurred.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Show access denied
  if (!canManageNotifications) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to view notifications.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {notificationStats?.unread_count > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notificationStats.unread_count}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedNotifications.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkSelectedAsRead}
                  disabled={markMultipleAsReadMutation.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mark Read ({selectedNotifications.length})
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Input
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-64"
              />
              
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="backup">Backup</SelectItem>
                  <SelectItem value="connectivity">Connectivity</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unread-only"
                  checked={filters.unreadOnly}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, unreadOnly: !!checked }))
                  }
                />
                <label htmlFor="unread-only" className="text-sm">
                  Unread only
                </label>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
              {filters.unreadOnly && (
                <p className="text-sm">Try changing your filters to see more notifications</p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                      ${notification.read ? 'bg-muted/30' : 'bg-background border-l-4 border-l-blue-500'}
                      hover:bg-muted/50
                    `}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotifications(prev => [...prev, notification.id])
                          } else {
                            setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getPriorityVariant(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                            {notification.dataSourceName && (
                              <Badge variant="secondary" className="text-xs">
                                {notification.dataSourceName}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => markAsReadMutation.mutate(notification.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              
                              {!notification.acknowledgedAt && (
                                <DropdownMenuItem onClick={() => handleAcknowledge(notification.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Acknowledge
                                </DropdownMenuItem>
                              )}
                              
                              {notification.actionUrl && (
                                <DropdownMenuItem onClick={() => window.open(notification.actionUrl!, '_blank')}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              {canDeleteNotifications && (
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(notification.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}