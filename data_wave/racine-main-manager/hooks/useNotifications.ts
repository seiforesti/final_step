/**
 * useNotifications Hook - Notification management for Racine system
 * ===============================================================
 * 
 * Comprehensive notification management hook that provides:
 * - Real-time notification handling
 * - Notification preferences management
 * - Notification history and analytics
 * - Cross-group notification coordination
 * - Enterprise notification integration
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { userManagementAPI } from '../services/user-management-apis';
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis';
import { quickActionsAPI } from '../services/quick-actions-apis';

import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationPreferences,
  NotificationAnalytics,
  UUID,
  ISODateString
} from '../types/api.types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  hasErrors: boolean;
  lastSync: Date | null;
  preferences: NotificationPreferences | null;
  analytics: NotificationAnalytics | null;
}

export interface NotificationMethods {
  // CRUD Operations
  markAsRead: (notificationId: UUID) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: UUID) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  getPreferences: () => Promise<NotificationPreferences>;
  
  // Analytics
  getAnalytics: (timeRange?: string) => Promise<NotificationAnalytics>;
  
  // Real-time
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
  
  // Utility
  refreshNotifications: () => Promise<void>;
  exportNotifications: (format?: 'json' | 'csv') => Promise<any>;
}

export interface UseNotificationsReturn extends NotificationState, NotificationMethods {}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useNotifications(
  filters?: {
    type?: NotificationType;
    priority?: NotificationPriority;
    status?: NotificationStatus;
    read?: boolean;
  },
  options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableWebSocket?: boolean;
  }
): UseNotificationsReturn {
  const queryClient = useQueryClient();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    isLoading: false,
    hasErrors: false,
    lastSync: null,
    preferences: null,
    analytics: null
  });

  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enableWebSocket = true
  } = options || {};

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Get notifications
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.read !== undefined) params.append('read', String(filters.read));

      return userManagementAPI.getNotifications(params.toString());
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Get notification preferences
  const {
    data: preferences = null,
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => userManagementAPI.getNotificationPreferences(),
    enabled: true
  });

  // Get notification analytics
  const {
    data: analytics = null,
    isLoading: isLoadingAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['notification-analytics'],
    queryFn: () => userManagementAPI.getNotificationAnalytics(),
    enabled: true
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: UUID) => {
      await userManagementAPI.markNotificationAsRead(notificationId);
      return notificationId;
    },
    onSuccess: (notificationId) => {
      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-analytics'] });

      toast.success('Notification marked as read');
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await userManagementAPI.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      // Update local state
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString()
        })),
        unreadCount: 0
      }));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-analytics'] });

      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: UUID) => {
      await userManagementAPI.deleteNotification(notificationId);
      return notificationId;
    },
    onSuccess: (notificationId) => {
      // Update local state
      setState(prev => {
        const deletedNotification = prev.notifications.find(n => n.id === notificationId);
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          totalCount: prev.totalCount - 1,
          unreadCount: deletedNotification?.read ? prev.unreadCount : Math.max(0, prev.unreadCount - 1)
        };
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-analytics'] });

      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  });

  // Delete all notifications
  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      await userManagementAPI.deleteAllNotifications();
    },
    onSuccess: () => {
      // Update local state
      setState(prev => ({
        ...prev,
        notifications: [],
        totalCount: 0,
        unreadCount: 0
      }));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-analytics'] });

      toast.success('All notifications deleted');
    },
    onError: (error) => {
      console.error('Failed to delete all notifications:', error);
      toast.error('Failed to delete all notifications');
    }
  });

  // Update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      return userManagementAPI.updateNotificationPreferences(preferences);
    },
    onSuccess: (updatedPreferences) => {
      // Update local state
      setState(prev => ({
        ...prev,
        preferences: updatedPreferences
      }));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });

      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      console.error('Failed to update notification preferences:', error);
      toast.error('Failed to update notification preferences');
    }
  });

  // ============================================================================
  // METHODS
  // ============================================================================

  const markAsRead = useCallback(async (notificationId: UUID) => {
    await markAsReadMutation.mutateAsync(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback(async (notificationId: UUID) => {
    await deleteNotificationMutation.mutateAsync(notificationId);
  }, [deleteNotificationMutation]);

  const deleteAllNotifications = useCallback(async () => {
    await deleteAllNotificationsMutation.mutateAsync();
  }, [deleteAllNotificationsMutation]);

  const updatePreferences = useCallback(async (preferences: Partial<NotificationPreferences>) => {
    await updatePreferencesMutation.mutateAsync(preferences);
  }, [updatePreferencesMutation]);

  const getPreferences = useCallback(async () => {
    return userManagementAPI.getNotificationPreferences();
  }, []);

  const getAnalytics = useCallback(async (timeRange?: string) => {
    return userManagementAPI.getNotificationAnalytics(timeRange);
  }, []);

  const refreshNotifications = useCallback(async () => {
    await refetchNotifications();
    setState(prev => ({
      ...prev,
      lastSync: new Date()
    }));
  }, [refetchNotifications]);

  const exportNotifications = useCallback(async (format: 'json' | 'csv' = 'json') => {
    return userManagementAPI.exportNotifications(format);
  }, []);

  // ============================================================================
  // WEBSOCKET HANDLING
  // ============================================================================

  const subscribeToNotifications = useCallback(() => {
    if (!enableWebSocket) return;

    // Subscribe to real-time notifications
    userManagementAPI.on('notificationReceived', (notification: Notification) => {
      setState(prev => ({
        ...prev,
        notifications: [notification, ...prev.notifications],
        totalCount: prev.totalCount + 1,
        unreadCount: prev.unreadCount + 1
      }));

      // Show toast for high priority notifications
      if (notification.priority === 'high' || notification.priority === 'critical') {
        toast(notification.title, {
          description: notification.message,
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to notification details
              console.log('Navigate to notification:', notification.id);
            }
          }
        });
      }
    });

    userManagementAPI.on('notificationUpdated', (notification: Notification) => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notification.id ? notification : n
        )
      }));
    });

    userManagementAPI.on('notificationDeleted', (notificationId: UUID) => {
      setState(prev => {
        const deletedNotification = prev.notifications.find(n => n.id === notificationId);
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          totalCount: prev.totalCount - 1,
          unreadCount: deletedNotification?.read ? prev.unreadCount : Math.max(0, prev.unreadCount - 1)
        };
      });
    });
  }, [enableWebSocket]);

  const unsubscribeFromNotifications = useCallback(() => {
    userManagementAPI.off('notificationReceived', () => {});
    userManagementAPI.off('notificationUpdated', () => {});
    userManagementAPI.off('notificationDeleted', () => {});
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update state when data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      totalCount: notifications.length,
      isLoading: isLoadingNotifications || isLoadingPreferences || isLoadingAnalytics,
      hasErrors: !!(notificationsError || preferencesError || analyticsError),
      preferences,
      analytics
    }));
  }, [
    notifications,
    isLoadingNotifications,
    isLoadingPreferences,
    isLoadingAnalytics,
    notificationsError,
    preferencesError,
    analyticsError,
    preferences,
    analytics
  ]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (enableWebSocket) {
      subscribeToNotifications();
      return () => {
        unsubscribeFromNotifications();
      };
    }
  }, [enableWebSocket, subscribeToNotifications, unsubscribeFromNotifications]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    updatePreferences,
    getPreferences,
    getAnalytics,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    refreshNotifications,
    exportNotifications
  };
}


