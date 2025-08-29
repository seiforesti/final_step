// ============================================================================
// NOTIFICATION SYSTEM HOOK - USER MANAGEMENT
// ============================================================================
// Advanced notification management hook with comprehensive notification preferences
// Provides real-time notification handling and user preference management

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  source: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  expiresAt?: Date;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'dismiss';
  url?: string;
  action?: () => void;
  metadata?: Record<string, any>;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  category: string;
  channels: NotificationChannel[];
  enabled: boolean;
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in-app' | 'webhook';
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  message: string;
  variables: string[];
  channels: string[];
  metadata?: Record<string, any>;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// NOTIFICATION SYSTEM HOOK
// ============================================================================

export function useNotificationSystem(userId?: string) {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Fetch user notifications
  const notificationsQuery = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/notifications/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch notification preferences
  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/notifications/preferences/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
    enabled: !!userId,
  });

  // Fetch notification templates
  const templatesQuery = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Acknowledge notification
  const acknowledgeNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/acknowledge`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to acknowledge notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<NotificationPreference>) => {
      const response = await fetch(`/api/notifications/preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', userId] });
    },
  });

  // Send test notification
  const sendTestNotificationMutation = useMutation({
    mutationFn: async (params: {
      templateId: string;
      channel: string;
      testData?: Record<string, any>;
    }) => {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to send test notification');
      return response.json();
    },
  });

  // ============================================================================
  // WEBSOCKET CONNECTION
  // ============================================================================

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket for real-time notifications
    const ws = new WebSocket(`ws://localhost:3001/notifications/${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Notification WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          handleNewNotification(data.notification);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Notification WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId]);

  // ============================================================================
  // NOTIFICATION HANDLERS
  // ============================================================================

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if enabled
    if (Notification.permission === 'granted' && notification.priority !== 'low') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [markAsReadMutation]);

  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    try {
      await acknowledgeNotificationMutation.mutateAsync(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, acknowledged: true } : n)
      );
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
    }
  }, [acknowledgeNotificationMutation]);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreference>) => {
    try {
      await updatePreferencesMutation.mutateAsync(updates);
      setPreferences(prev => 
        prev.map(p => p.id === updates.id ? { ...p, ...updates } : p)
      );
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }, [updatePreferencesMutation]);

  const sendTestNotification = useCallback(async (params: {
    templateId: string;
    channel: string;
    testData?: Record<string, any>;
  }) => {
    try {
      return await sendTestNotificationMutation.mutateAsync(params);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }, [sendTestNotificationMutation]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: string) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getAcknowledgedNotifications = useCallback(() => {
    return notifications.filter(n => n.acknowledged);
  }, [notifications]);

  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const acknowledged = notifications.filter(n => n.acknowledged).length;
    const byPriority = {
      low: notifications.filter(n => n.priority === 'low').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      high: notifications.filter(n => n.priority === 'high').length,
      critical: notifications.filter(n => n.priority === 'critical').length,
    };
    const byCategory = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      acknowledged,
      byPriority,
      byCategory,
    };
  }, [notifications]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    notifications: notificationsQuery.data || [],
    preferences: preferencesQuery.data || [],
    templates: templatesQuery.data || [],
    unreadCount,
    isConnected,
    
    // Loading states
    isLoading: notificationsQuery.isLoading || preferencesQuery.isLoading,
    isError: notificationsQuery.isError || preferencesQuery.isError,
    
    // Mutations
    markAsRead,
    acknowledgeNotification,
    dismissNotification,
    clearAllNotifications,
    updatePreferences,
    sendTestNotification,
    
    // Utility functions
    getNotificationsByCategory,
    getNotificationsByPriority,
    getUnreadNotifications,
    getAcknowledgedNotifications,
    getNotificationStats,
    
    // Refetch functions
    refetchNotifications: notificationsQuery.refetch,
    refetchPreferences: preferencesQuery.refetch,
  };
}
