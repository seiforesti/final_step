'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import notification APIs
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis'
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis'

// Import types
import {
  UUID,
  ISODateString
} from '../types/racine-core.types'

interface Notification {
  id: UUID
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  persistent: boolean
  actions?: NotificationAction[]
  data?: Record<string, any>
  userId?: string
  groupId?: string
  resourceId?: string
  resourceType?: string
  createdAt: ISODateString
  expiresAt?: ISODateString
  readAt?: ISODateString
}

interface NotificationAction {
  id: string
  label: string
  action: string
  style?: 'primary' | 'secondary' | 'danger'
  url?: string
  callback?: () => void
}

interface NotificationSettings {
  email: boolean
  browser: boolean
  desktop: boolean
  mobile: boolean
  sound: boolean
  vibration: boolean
  frequency: 'immediate' | 'digest' | 'disabled'
  digestTime?: string
  categories: Record<string, boolean>
}

interface ShowNotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
  data?: Record<string, any>
  sound?: boolean
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface ProgressNotificationOptions {
  id?: string
  title: string
  message: string
  progress: number
  total?: number
  estimatedTime?: number
  canCancel?: boolean
  onCancel?: () => void
}

interface UseNotificationManagerOptions {
  autoMarkAsRead?: boolean
  maxNotifications?: number
  enableBrowserNotifications?: boolean
  enableSound?: boolean
  defaultDuration?: number
}

interface NotificationManagerOperations {
  // Show notifications
  showNotification: (options: ShowNotificationOptions) => string
  showSuccess: (title: string, message: string, duration?: number) => string
  showError: (title: string, message: string, duration?: number) => string
  showWarning: (title: string, message: string, duration?: number) => string
  showInfo: (title: string, message: string, duration?: number) => string
  
  // Progress notifications
  showProgress: (options: ProgressNotificationOptions) => string
  updateProgress: (id: string, progress: number, message?: string) => void
  completeProgress: (id: string, message?: string) => void
  cancelProgress: (id: string, message?: string) => void
  
  // Notification management
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  dismissNotification: (id: string) => void
  dismissAll: () => void
  clearExpired: () => void
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>
  getSettings: () => Promise<NotificationSettings>
  
  // Browser notifications
  requestPermission: () => Promise<NotificationPermission>
  showBrowserNotification: (title: string, options?: NotificationOptions) => void
  
  // Real-time notifications
  subscribeToNotifications: (userId: string) => void
  unsubscribeFromNotifications: () => void
  
  // Bulk operations
  bulkMarkAsRead: (ids: string[]) => Promise<void>
  bulkDismiss: (ids: string[]) => void
  exportNotifications: (filters?: any) => Promise<Blob>
}

export const useNotificationManager = (options: UseNotificationManagerOptions = {}) => {
  const queryClient = useQueryClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [progressNotifications, setProgressNotifications] = useState<Map<string, ProgressNotificationOptions>>(new Map())

  // Query for user notifications
  const {
    data: serverNotifications = [],
    isLoading: notificationsLoading,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => racineOrchestrationAPI.makeRequest('/notifications', { method: 'GET' }),
    enabled: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000
  })

  // Query for notification settings
  const {
    data: userSettings,
    isLoading: settingsLoading,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: () => racineOrchestrationAPI.makeRequest('/notifications/preferences', { method: 'GET' }),
    enabled: true,
    staleTime: 300000 // 5 minutes
  })

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => racineOrchestrationAPI.makeRequest(`/notifications/${id}/read`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error: any) => {
      setError(`Failed to mark notification as read: ${error.message}`)
    }
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<NotificationSettings>) => 
      racineOrchestrationAPI.makeRequest('/notifications/preferences', {
        method: 'PUT',
        data: newSettings
      }),
    onSuccess: (updatedSettings) => {
      setSettings(updatedSettings)
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
    },
    onError: (error: any) => {
      setError(`Failed to update notification settings: ${error.message}`)
    }
  })

  // Generate unique notification ID
  const generateNotificationId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }, [])

  // Show notification
  const showNotification = useCallback((options: ShowNotificationOptions): string => {
    const id = generateNotificationId()
    
    const notification: Notification = {
      id,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      read: false,
      persistent: options.persistent || false,
      actions: options.actions,
      data: options.data,
      createdAt: new Date().toISOString(),
      expiresAt: options.duration && !options.persistent 
        ? new Date(Date.now() + options.duration).toISOString() 
        : undefined
    }

    setNotifications(prev => {
      const updated = [notification, ...prev]
      
      // Limit number of notifications
      const maxNotifications = options.maxNotifications || 50
      if (updated.length > maxNotifications) {
        return updated.slice(0, maxNotifications)
      }
      
      return updated
    })

    // Show browser notification if enabled
    if (options.enableBrowserNotifications !== false && settings?.browser) {
      showBrowserNotification(options.title, {
        body: options.message,
        icon: '/notification-icon.png',
        tag: id
      })
    }

    // Play sound if enabled
    if (options.sound !== false && settings?.sound) {
      playNotificationSound()
    }

    // Auto-dismiss if not persistent
    if (!options.persistent && options.duration !== 0) {
      const duration = options.duration || options.defaultDuration || 5000
      setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }

    // Track notification
    crossGroupIntegrationAPI.trackEvent('notification_shown', {
      id,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      persistent: options.persistent || false
    })

    return id
  }, [settings, options.maxNotifications, options.enableBrowserNotifications, options.defaultDuration])

  // Convenience methods for different notification types
  const showSuccess = useCallback((title: string, message: string, duration?: number): string => {
    return showNotification({ type: 'success', title, message, duration })
  }, [showNotification])

  const showError = useCallback((title: string, message: string, duration?: number): string => {
    return showNotification({ type: 'error', title, message, duration: duration || 0, persistent: duration === undefined })
  }, [showNotification])

  const showWarning = useCallback((title: string, message: string, duration?: number): string => {
    return showNotification({ type: 'warning', title, message, duration })
  }, [showNotification])

  const showInfo = useCallback((title: string, message: string, duration?: number): string => {
    return showNotification({ type: 'info', title, message, duration })
  }, [showNotification])

  // Progress notifications
  const showProgress = useCallback((options: ProgressNotificationOptions): string => {
    const id = options.id || generateNotificationId()
    
    setProgressNotifications(prev => new Map(prev.set(id, options)))
    
    const notificationId = showNotification({
      type: 'info',
      title: options.title,
      message: `${options.message} (${options.progress}%)`,
      persistent: true,
      actions: options.canCancel ? [
        {
          id: 'cancel',
          label: 'Cancel',
          action: 'cancel',
          style: 'secondary',
          callback: options.onCancel
        }
      ] : undefined,
      data: { progressId: id, progress: options.progress }
    })

    return id
  }, [generateNotificationId, showNotification])

  const updateProgress = useCallback((id: string, progress: number, message?: string) => {
    setProgressNotifications(prev => {
      const existing = prev.get(id)
      if (!existing) return prev
      
      const updated = new Map(prev)
      updated.set(id, { ...existing, progress, message: message || existing.message })
      return updated
    })

    // Update the actual notification
    setNotifications(prev => prev.map(notification => {
      if (notification.data?.progressId === id) {
        return {
          ...notification,
          message: `${message || notification.title} (${progress}%)`
        }
      }
      return notification
    }))
  }, [])

  const completeProgress = useCallback((id: string, message?: string) => {
    setProgressNotifications(prev => {
      const updated = new Map(prev)
      updated.delete(id)
      return updated
    })

    // Update notification to success
    setNotifications(prev => prev.map(notification => {
      if (notification.data?.progressId === id) {
        return {
          ...notification,
          type: 'success' as const,
          message: message || 'Completed successfully',
          persistent: false,
          actions: undefined
        }
      }
      return notification
    }))

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.data?.progressId !== id))
    }, 3000)
  }, [])

  const cancelProgress = useCallback((id: string, message?: string) => {
    setProgressNotifications(prev => {
      const updated = new Map(prev)
      updated.delete(id)
      return updated
    })

    // Update notification to cancelled
    setNotifications(prev => prev.map(notification => {
      if (notification.data?.progressId === id) {
        return {
          ...notification,
          type: 'warning' as const,
          message: message || 'Cancelled',
          persistent: false,
          actions: undefined
        }
      }
      return notification
    }))

    // Auto-dismiss after 2 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.data?.progressId !== id))
    }, 2000)
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      // Update local state immediately
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      
      // Update server
      await markAsReadMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Revert local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false, readAt: undefined } : n))
    }
  }, [markAsReadMutation])

  // Mark all as read
  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })))
      
      // Update server
      await racineOrchestrationAPI.makeRequest('/api/v1/notifications/mark-all-read', {
        method: 'POST'
      })
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      setError('Failed to mark all notifications as read')
    }
  }, [queryClient])

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    
    // Track dismissal
    crossGroupIntegrationAPI.trackEvent('notification_dismissed', { id })
  }, [])

  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    const count = notifications.length
    setNotifications([])
    
    // Track bulk dismissal
    crossGroupIntegrationAPI.trackEvent('notifications_dismissed_all', { count })
  }, [notifications.length])

  // Clear expired notifications
  const clearExpired = useCallback(() => {
    const now = new Date()
    setNotifications(prev => prev.filter(n => 
      !n.expiresAt || new Date(n.expiresAt) > now
    ))
  }, [])

  // Update notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<void> => {
    try {
      await updateSettingsMutation.mutateAsync(newSettings)
    } catch (error) {
      console.error('Error updating notification settings:', error)
      throw error
    }
  }, [updateSettingsMutation])

  // Get notification settings
  const getSettings = useCallback(async (): Promise<NotificationSettings> => {
    try {
      return await racineOrchestrationAPI.makeRequest('/api/v1/notifications/settings', {
        method: 'GET'
      })
    } catch (error) {
      console.error('Error getting notification settings:', error)
      throw error
    }
  }, [])

  // Request browser notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications")
    }

    const permission = await Notification.requestPermission()
    
    // Track permission request
    crossGroupIntegrationAPI.trackEvent('notification_permission_requested', {
      permission,
      userAgent: navigator.userAgent
    })
    
    return permission
  }, [])

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    try {
      const notification = new Notification(title, options)
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)
      
      // Track browser notification
      crossGroupIntegrationAPI.trackEvent('browser_notification_shown', {
        title,
        hasIcon: !!options?.icon,
        hasImage: !!options?.image
      })
    } catch (error) {
      console.error('Error showing browser notification:', error)
    }
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3')
      audio.volume = 0.3
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error)
      })
    } catch (error) {
      console.warn('Could not create notification audio:', error)
    }
  }, [])

  // Bulk operations
  const bulkMarkAsRead = useCallback(async (ids: string[]): Promise<void> => {
    try {
      // Update local state
      setNotifications(prev => prev.map(n => 
        ids.includes(n.id) ? { ...n, read: true, readAt: new Date().toISOString() } : n
      ))
      
      // Update server
      await racineOrchestrationAPI.makeRequest('/api/v1/notifications/bulk-read', {
        method: 'POST',
        data: { ids }
      })
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Error bulk marking notifications as read:', error)
      setError('Failed to mark notifications as read')
    }
  }, [queryClient])

  const bulkDismiss = useCallback((ids: string[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)))
    
    // Track bulk dismissal
    crossGroupIntegrationAPI.trackEvent('notifications_bulk_dismissed', {
      count: ids.length,
      ids
    })
  }, [])

  // Export notifications
  const exportNotifications = useCallback(async (filters?: any): Promise<Blob> => {
    try {
      return await racineOrchestrationAPI.makeRequest('/api/v1/notifications/export', {
        method: 'POST',
        data: filters,
        responseType: 'blob'
      })
    } catch (error) {
      console.error('Error exporting notifications:', error)
      throw error
    }
  }, [])

  // WebSocket subscription for real-time notifications
  const subscribeToNotifications = useCallback((userId: string) => {
    // This would integrate with the WebSocket system in racineOrchestrationAPI
    // Implementation depends on WebSocket setup
    console.log('Subscribing to notifications for user:', userId)
  }, [])

  const unsubscribeFromNotifications = useCallback(() => {
    console.log('Unsubscribing from notifications')
  }, [])

  // Clear expired notifications periodically
  useEffect(() => {
    const interval = setInterval(clearExpired, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [clearExpired])

  // Update settings when user settings change
  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings)
    }
  }, [userSettings])

  // Auto-mark as read if enabled
  useEffect(() => {
    if (options.autoMarkAsRead) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length > 0) {
        const timer = setTimeout(() => {
          bulkMarkAsRead(unreadIds)
        }, 3000) // Mark as read after 3 seconds of viewing
        
        return () => clearTimeout(timer)
      }
    }
  }, [notifications, options.autoMarkAsRead, bulkMarkAsRead])

  // Notification manager operations object
  const operations: NotificationManagerOperations = useMemo(() => ({
    // Show notifications
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Progress notifications
    showProgress,
    updateProgress,
    completeProgress,
    cancelProgress,
    
    // Notification management
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAll,
    clearExpired,
    
    // Settings
    updateSettings,
    getSettings,
    
    // Browser notifications
    requestPermission,
    showBrowserNotification,
    
    // Real-time notifications
    subscribeToNotifications,
    unsubscribeFromNotifications,
    
    // Bulk operations
    bulkMarkAsRead,
    bulkDismiss,
    exportNotifications
  }), [
    showNotification, showSuccess, showError, showWarning, showInfo,
    showProgress, updateProgress, completeProgress, cancelProgress,
    markAsRead, markAllAsRead, dismissNotification, dismissAll, clearExpired,
    updateSettings, getSettings, requestPermission, showBrowserNotification,
    subscribeToNotifications, unsubscribeFromNotifications,
    bulkMarkAsRead, bulkDismiss, exportNotifications
  ])

  // Computed values
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  )

  const criticalCount = useMemo(() => 
    notifications.filter(n => n.priority === 'critical' && !n.read).length, 
    [notifications]
  )

  return {
    // Data
    notifications,
    serverNotifications,
    settings,
    unreadCount,
    criticalCount,
    progressNotifications: Object.fromEntries(progressNotifications),
    
    // Loading states
    loading: loading || notificationsLoading || settingsLoading,
    isMarkingAsRead: markAsReadMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    
    // Error states
    error,
    
    // Operations
    ...operations,
    
    // Utility functions
    refetchNotifications,
    refetchSettings,
    clearError: () => setError(null)
  }
}

export default useNotificationManager
