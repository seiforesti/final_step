// Advanced Notifications Hook for RBAC System
// Maps to: /api/v1/rbac/notifications

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib copie/api-client';
import { toast } from 'sonner';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'security' | 'audit';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'permission' | 'role' | 'user' | 'audit' | 'security' | 'system';
  source: string;
  targetUserId?: string;
  targetRoleId?: string;
  targetResourceId?: string;
  metadata?: Record<string, any>;
  read: boolean;
  acknowledged: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  url?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface NotificationFilters {
  type?: string[];
  severity?: string[];
  category?: string[];
  read?: boolean;
  acknowledged?: boolean;
  priority?: string[];
  tags?: string[];
  source?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: string[];
  categories: string[];
  severity: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// API functions
const notificationAPI = {
  // Get notifications
  getNotifications: async (filters?: NotificationFilters): Promise<{ notifications: Notification[]; total: number }> => {
    const response = await apiClient.get('/api/v1/rbac/notifications', { params: filters });
    return response.data;
  },

  // Get notification by ID
  getNotification: async (id: string): Promise<Notification> => {
    const response = await apiClient.get(`/api/v1/rbac/notifications/${id}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/v1/rbac/notifications/${id}/read`, {});
  },

  // Mark notification as acknowledged
  markAsAcknowledged: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/v1/rbac/notifications/${id}/acknowledge`, {});
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (ids: string[]): Promise<void> => {
    await apiClient.patch('/api/v1/rbac/notifications/read-multiple', { ids });
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/rbac/notifications/${id}`);
  },

  // Delete multiple notifications
  deleteMultipleNotifications: async (ids: string[]): Promise<void> => {
    await apiClient.delete('/api/v1/rbac/notifications/multiple', { data: { ids } });
  },

  // Create notification
  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> => {
    const response = await apiClient.post('/api/v1/rbac/notifications', notification);
    return response.data;
  },

  // Update notification
  updateNotification: async (id: string, updates: Partial<Notification>): Promise<Notification> => {
    const response = await apiClient.patch(`/api/v1/rbac/notifications/${id}`, updates);
    return response.data;
  },

  // Get notification preferences
  getPreferences: async (userId: string): Promise<NotificationPreferences> => {
    const response = await apiClient.get(`/api/v1/rbac/notifications/preferences/${userId}`);
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await apiClient.patch(`/api/v1/rbac/notifications/preferences/${userId}`, preferences);
    return response.data;
  },

  // Subscribe to notification types
  subscribe: async (userId: string, types: string[]): Promise<void> => {
    await apiClient.post(`/api/v1/rbac/notifications/subscribe`, { userId, types });
  },

  // Unsubscribe from notification types
  unsubscribe: async (userId: string, types: string[]): Promise<void> => {
    await apiClient.post(`/api/v1/rbac/notifications/unsubscribe`, { userId, types });
  },

  // Get notification statistics
  getStatistics: async (filters?: NotificationFilters): Promise<any> => {
    const response = await apiClient.get('/api/v1/rbac/notifications/statistics', { params: filters });
    return response.data;
  },

  // Export notifications
  exportNotifications: async (filters?: NotificationFilters, format: 'csv' | 'json' | 'pdf' = 'json'): Promise<any> => {
    const response = await apiClient.get('/api/v1/rbac/notifications/export', { 
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Bulk operations
  bulkOperation: async (operation: string, ids: string[], options?: any): Promise<void> => {
    await apiClient.post('/api/v1/rbac/notifications/bulk-operation', { operation, ids, options });
  }
};

// Hook
export const useNotifications = (filters?: NotificationFilters) => {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Query for notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationAPI.getNotifications(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    },
    onError: (error) => {
      toast.error('Failed to mark notification as read');
      console.error('Mark as read error:', error);
    }
  });

  const markAsAcknowledgedMutation = useMutation({
    mutationFn: notificationAPI.markAsAcknowledged,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification acknowledged');
    },
    onError: (error) => {
      toast.error('Failed to acknowledge notification');
      console.error('Acknowledge error:', error);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete notification');
      console.error('Delete error:', error);
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: notificationAPI.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification created');
    },
    onError: (error) => {
      toast.error('Failed to create notification');
      console.error('Create error:', error);
    }
  });

  // Update unread count
  useEffect(() => {
    if (notificationsData?.notifications) {
      const unread = notificationsData.notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [notificationsData]);

  // Real-time notifications via WebSocket
  const enableRealTime = useCallback(() => {
    if (wsRef.current || realTimeEnabled) return;

    try {
      const ws = new WebSocket(`${(typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8000'}/ws/notifications`);
      
      ws.onopen = () => {
        setRealTimeEnabled(true);
        console.log('WebSocket connected for notifications');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            // Add new notification to the list
            queryClient.setQueryData(['notifications', filters], (old: any) => {
              if (!old) return old;
              return {
                ...old,
                notifications: [data.notification, ...old.notifications],
                total: old.total + 1
              };
            });
            
            // Update unread count
            setUnreadCount(prev => prev + 1);
            
            // Show toast for high priority notifications
            if (data.notification.priority === 'high' || data.notification.priority === 'urgent') {
              toast(data.notification.title, {
                description: data.notification.message,
                action: {
                  label: 'View',
                  onClick: () => {
                    // Navigate to notification or open modal
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setRealTimeEnabled(false);
      };

      ws.onclose = () => {
        setRealTimeEnabled(false);
        console.log('WebSocket disconnected');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }, [filters, realTimeEnabled, queryClient]);

  const disableRealTime = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setRealTimeEnabled(false);
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Utility functions
  const markAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const markAsAcknowledged = useCallback((id: string) => {
    markAsAcknowledgedMutation.mutate(id);
  }, [markAsAcknowledgedMutation]);

  const deleteNotification = useCallback((id: string) => {
    deleteNotificationMutation.mutate(id);
  }, [deleteNotificationMutation]);

  const createNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    createNotificationMutation.mutate(notification);
  }, [createNotificationMutation]);

  const markAllAsRead = useCallback(() => {
    if (notificationsData?.notifications) {
      const unreadIds = notificationsData.notifications
        .filter(n => !n.read)
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        notificationAPI.markMultipleAsRead(unreadIds).then(() => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          setUnreadCount(0);
          toast.success('All notifications marked as read');
        }).catch((error) => {
          toast.error('Failed to mark all notifications as read');
          console.error('Mark all as read error:', error);
        });
      }
    }
  }, [notificationsData, queryClient]);

  const clearAll = useCallback(() => {
    if (notificationsData?.notifications) {
      const allIds = notificationsData.notifications.map(n => n.id);
      
      if (allIds.length > 0) {
        notificationAPI.deleteMultipleNotifications(allIds).then(() => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          setUnreadCount(0);
          toast.success('All notifications cleared');
        }).catch((error) => {
          toast.error('Failed to clear all notifications');
          console.error('Clear all error:', error);
        });
      }
    }
  }, [notificationsData, queryClient]);

  return {
    // Data
    notifications: notificationsData?.notifications || [],
    total: notificationsData?.total || 0,
    unreadCount,
    isLoading,
    error,
    
    // Real-time
    realTimeEnabled,
    enableRealTime,
    disableRealTime,
    
    // Actions
    markAsRead,
    markAsAcknowledged,
    deleteNotification,
    createNotification,
    markAllAsRead,
    clearAll,
    refetch,
    
    // API functions
    api: notificationAPI
  };
};

export default useNotifications;

