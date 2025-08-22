"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// INTERFACES
// ============================================================================

export interface EnterpriseNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  category: 'system' | 'security' | 'performance' | 'compliance' | 'data' | 'workflow' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  expiresAt?: Date;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  recipients?: string[];
  escalationLevel: number;
  autoEscalate: boolean;
  tags: string[];
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
  url?: string;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

export interface NotificationConfig {
  enabled: boolean;
  maxNotifications: number;
  retentionDays: number;
  autoAcknowledge: boolean;
  autoEscalate: boolean;
  escalationThreshold: number;
  categories: string[];
  priorities: string[];
  sources: string[];
  recipients: string[];
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  id: string;
  type: 'in-app' | 'email' | 'sms' | 'slack' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

export interface NotificationState {
  totalCount: number;
  unreadCount: number;
  unacknowledgedCount: number;
  criticalCount: number;
  lastNotification: Date | null;
  isConnected: boolean;
  performance: {
    deliveryRate: number;
    averageDeliveryTime: number;
    failedDeliveries: number;
  };
}

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

const mockNotificationAPI = {
  // Get all notifications
  getNotifications: async (filters?: Partial<NotificationConfig>): Promise<EnterpriseNotification[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockNotifications: EnterpriseNotification[] = [
      {
        id: 'notif_001',
        type: 'warning',
        title: 'Data Source Performance Alert',
        message: 'Database connection latency has increased by 45% in the last 5 minutes',
        category: 'performance',
        priority: 'high',
        source: 'data-sources',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        read: false,
        acknowledged: false,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        actions: [
          {
            id: 'action_001',
            label: 'Investigate',
            type: 'primary',
            action: 'investigate_performance',
            url: '/data-sources/performance',
            requiresConfirmation: false
          },
          {
            id: 'action_002',
            label: 'Acknowledge',
            type: 'secondary',
            action: 'acknowledge',
            requiresConfirmation: false
          }
        ],
        metadata: {
          dataSourceId: 'ds_001',
          latencyThreshold: 100,
          currentLatency: 145,
          affectedQueries: 12
        },
        recipients: ['admin', 'data-engineer'],
        escalationLevel: 1,
        autoEscalate: true,
        tags: ['performance', 'database', 'latency']
      },
      {
        id: 'notif_002',
        type: 'error',
        title: 'Compliance Rule Violation',
        message: 'PII data detected in non-compliant location',
        category: 'compliance',
        priority: 'critical',
        source: 'compliance-rules',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        read: false,
        acknowledged: false,
        actions: [
          {
            id: 'action_003',
            label: 'Review Violation',
            type: 'primary',
            action: 'review_violation',
            url: '/compliance/violations',
            requiresConfirmation: false
          },
          {
            id: 'action_004',
            label: 'Escalate',
            type: 'danger',
            action: 'escalate',
            requiresConfirmation: true,
            confirmationMessage: 'Are you sure you want to escalate this critical violation?'
          }
        ],
        metadata: {
          ruleId: 'rule_001',
          dataLocation: '/sensitive/pii/',
          dataType: 'PII',
          severity: 'critical'
        },
        recipients: ['admin', 'compliance-officer', 'security-team'],
        escalationLevel: 2,
        autoEscalate: true,
        tags: ['compliance', 'pii', 'violation', 'critical']
      },
      {
        id: 'notif_003',
        type: 'success',
        title: 'Scan Completed Successfully',
        message: 'Data source scan completed with 99.8% accuracy',
        category: 'data',
        priority: 'low',
        source: 'scan-logic',
        timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
        read: true,
        acknowledged: true,
        metadata: {
          scanId: 'scan_001',
          accuracy: 99.8,
          recordsProcessed: 150000,
          duration: 180
        },
        recipients: ['data-engineer'],
        escalationLevel: 0,
        autoEscalate: false,
        tags: ['scan', 'success', 'data-quality']
      }
    ];

    return mockNotifications;
  },

  // Create new notification
  createNotification: async (notification: Omit<EnterpriseNotification, 'id' | 'timestamp'>): Promise<EnterpriseNotification> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date()
    };
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  // Acknowledge notification
  acknowledgeNotification: async (notificationId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  // Get notification statistics
  getNotificationStats: async (): Promise<NotificationState> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      totalCount: 156,
      unreadCount: 23,
      unacknowledgedCount: 8,
      criticalCount: 2,
      lastNotification: new Date(Date.now() - 300000),
      isConnected: true,
      performance: {
        deliveryRate: 99.2,
        averageDeliveryTime: 150,
        failedDeliveries: 3
      }
    };
  },

  // Update notification configuration
  updateConfig: async (config: Partial<NotificationConfig>): Promise<NotificationConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      enabled: true,
      maxNotifications: 1000,
      retentionDays: 30,
      autoAcknowledge: false,
      autoEscalate: true,
      escalationThreshold: 300, // 5 minutes
      categories: ['system', 'security', 'performance', 'compliance', 'data', 'workflow', 'user'],
      priorities: ['low', 'medium', 'high', 'critical'],
      sources: [],
      recipients: [],
      channels: [
        {
          id: 'in-app',
          type: 'in-app',
          enabled: true,
          config: {}
        }
      ],
      ...config
    };
  }
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useEnterpriseNotifications = (config: Partial<NotificationConfig> = {}) => {
  const queryClient = useQueryClient();
  
  // Default configuration
  const defaultConfig: NotificationConfig = {
    enabled: true,
    maxNotifications: 1000,
    retentionDays: 30,
    autoAcknowledge: false,
    autoEscalate: true,
    escalationThreshold: 300,
    categories: ['system', 'security', 'performance', 'compliance', 'data', 'workflow', 'user'],
    priorities: ['low', 'medium', 'high', 'critical'],
    sources: [],
    recipients: [],
    channels: [
      {
        id: 'in-app',
        type: 'in-app',
        enabled: true,
        config: {}
      }
    ],
    ...config
  };

  // State management
  const [notifications, setNotifications] = useState<EnterpriseNotification[]>([]);
  const [configState, setConfigState] = useState<NotificationConfig>(defaultConfig);
  
  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Query for notifications
  const { data: fetchedNotifications = [], isLoading: isLoadingNotifications } = useQuery(
    ['enterprise-notifications', 'list'],
    () => mockNotificationAPI.getNotifications(configState),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000,
      cacheTime: 60000
    }
  );

  // Query for notification statistics
  const { data: stats } = useQuery(
    ['enterprise-notifications', 'stats'],
    mockNotificationAPI.getNotificationStats,
    {
      refetchInterval: 60000, // Refresh every minute
      staleTime: 30000,
      cacheTime: 120000
    }
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create notification mutation
  const createNotificationMutation = useMutation(
    mockNotificationAPI.createNotification,
    {
      onSuccess: (newNotification) => {
        setNotifications(prev => [newNotification, ...prev.slice(0, configState.maxNotifications - 1)]);
        queryClient.invalidateQueries(['enterprise-notifications', 'stats']);
      },
      onError: (error) => {
        console.error('Failed to create notification:', error);
      }
    }
  );

  // Mark as read mutation
  const markAsReadMutation = useMutation(
    mockNotificationAPI.markAsRead,
    {
      onSuccess: (_, notificationId) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        queryClient.invalidateQueries(['enterprise-notifications', 'stats']);
      },
      onError: (error) => {
        console.error('Failed to mark notification as read:', error);
      }
    }
  );

  // Acknowledge notification mutation
  const acknowledgeMutation = useMutation(
    mockNotificationAPI.acknowledgeNotification,
    {
      onSuccess: (_, notificationId) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, acknowledged: true }
              : notif
          )
        );
        queryClient.invalidateQueries(['enterprise-notifications', 'stats']);
      },
      onError: (error) => {
        console.error('Failed to acknowledge notification:', error);
      }
    }
  );

  // Delete notification mutation
  const deleteMutation = useMutation(
    mockNotificationAPI.deleteNotification,
    {
      onSuccess: (_, notificationId) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        queryClient.invalidateQueries(['enterprise-notifications', 'stats']);
      },
      onError: (error) => {
        console.error('Failed to delete notification:', error);
      }
    }
  );

  // Update config mutation
  const updateConfigMutation = useMutation(
    mockNotificationAPI.updateConfig,
    {
      onSuccess: (newConfig) => {
        setConfigState(newConfig);
        queryClient.invalidateQueries(['enterprise-notifications', 'list']);
      },
      onError: (error) => {
        console.error('Failed to update notification config:', error);
      }
    }
  );

  // ============================================================================
  // CORE FUNCTIONS
  // ============================================================================

  // Create a new notification
  const createNotification = useCallback(async (notificationData: Omit<EnterpriseNotification, 'id' | 'timestamp'>) => {
    try {
      await createNotificationMutation.mutateAsync(notificationData);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }, [createNotificationMutation]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [markAsReadMutation]);

  // Acknowledge notification
  const acknowledge = useCallback(async (notificationId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  }, [acknowledgeMutation]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await deleteMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [deleteMutation]);

  // Update configuration
  const updateConfig = useCallback(async (newConfig: Partial<NotificationConfig>) => {
    try {
      await updateConfigMutation.mutateAsync(newConfig);
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  }, [updateConfigMutation]);

  // Filter notifications
  const filterNotifications = useCallback((notificationsToFilter: EnterpriseNotification[]) => {
    return notificationsToFilter.filter(notification => {
      const categoryMatch = configState.categories.includes(notification.category);
      const priorityMatch = configState.priorities.includes(notification.priority);
      const sourceMatch = configState.sources.length === 0 || 
                         configState.sources.includes(notification.source);
      
      return categoryMatch && priorityMatch && sourceMatch;
    });
  }, [configState]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: EnterpriseNotification['type']) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: EnterpriseNotification['category']) => {
    return notifications.filter(notif => notif.category === category);
  }, [notifications]);

  // Get critical notifications
  const getCriticalNotifications = useCallback(() => {
    return notifications.filter(notif => notif.priority === 'critical');
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.read);
  }, [notifications]);

  // Get unacknowledged notifications
  const getUnacknowledgedNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.acknowledged);
  }, [notifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = getUnreadNotifications();
    await Promise.all(unreadNotifications.map(notif => markAsRead(notif.id)));
  }, [getUnreadNotifications, markAsRead]);

  // Acknowledge all notifications
  const acknowledgeAll = useCallback(async () => {
    const unacknowledgedNotifications = getUnacknowledgedNotifications();
    await Promise.all(unacknowledgedNotifications.map(notif => acknowledge(notif.id)));
  }, [getUnacknowledgedNotifications, acknowledge]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update notifications when fetched data changes
  useEffect(() => {
    setNotifications(fetchedNotifications);
  }, [fetchedNotifications]);

  // Auto-escalation effect
  useEffect(() => {
    if (configState.autoEscalate) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const notificationsToEscalate = notifications.filter(notif => 
          !notif.acknowledged && 
          notif.autoEscalate &&
          (now.getTime() - notif.timestamp.getTime()) > configState.escalationThreshold * 1000
        );

        notificationsToEscalate.forEach(notif => {
          // Auto-escalate logic
          if (notif.escalationLevel < 3) {
            createNotification({
              ...notif,
              escalationLevel: notif.escalationLevel + 1,
              title: `[ESCALATED] ${notif.title}`,
              priority: notif.priority === 'high' ? 'critical' : notif.priority,
              recipients: [...(notif.recipients || []), 'manager', 'admin']
            });
          }
        });
      }, 60000); // Check every minute

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [configState.autoEscalate, configState.escalationThreshold, notifications, createNotification]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  const filteredNotifications = filterNotifications(notifications);

  return {
    // Data
    notifications: filteredNotifications,
    stats,
    config: configState,
    
    // Loading states
    isLoading: isLoadingNotifications,
    
    // Actions
    createNotification,
    markAsRead,
    acknowledge,
    deleteNotification,
    updateConfig,
    clearAllNotifications,
    markAllAsRead,
    acknowledgeAll,
    
    // Filtered data
    getNotificationsByType,
    getNotificationsByCategory,
    getCriticalNotifications,
    getUnreadNotifications,
    getUnacknowledgedNotifications,
    
    // Mutations
    createNotificationMutation,
    markAsReadMutation,
    acknowledgeMutation,
    deleteMutation,
    updateConfigMutation,
    
    // Computed values
    unreadCount: stats?.unreadCount || 0,
    unacknowledgedCount: stats?.unacknowledgedCount || 0,
    criticalCount: stats?.criticalCount || 0,
    totalCount: stats?.totalCount || 0,
    hasNotifications: filteredNotifications.length > 0,
    hasUnread: (stats?.unreadCount || 0) > 0,
    hasCritical: (stats?.criticalCount || 0) > 0
  };
};

export default useEnterpriseNotifications;
