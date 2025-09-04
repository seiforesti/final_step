// ============================================================================
// NOTIFICATION UTILITIES - USER MANAGEMENT
// ============================================================================
// Advanced notification utilities for managing user notification preferences
// Provides comprehensive notification functionality with backend integration

import { APIResponse } from '../types/racine-core.types';

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

export interface NotificationSettings {
  id: string;
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  channels: {
    email: EmailNotificationSettings;
    push: PushNotificationSettings;
    sms: SMSNotificationSettings;
    inApp: InAppNotificationSettings;
  };
  preferences: {
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    categories: Record<string, boolean>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  digest: boolean;
  digestTime: string;
  templates: Record<string, boolean>;
}

export interface PushNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  sound: boolean;
  vibration: boolean;
  categories: Record<string, boolean>;
}

export interface SMSNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  emergencyOnly: boolean;
  categories: Record<string, boolean>;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  duration: number;
  categories: Record<string, boolean>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'inApp';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTIFICATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate notification settings with backend integration
 */
export async function validateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<APIResponse<{ valid: boolean; errors: string[]; warnings: string[] }>> {
  try {
    const response = await fetch('/api/notifications/validate-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error(`Notification settings validation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Notification settings validation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { valid: false, errors: ['Validation failed'], warnings: [] }
    };
  }
}

/**
 * Generate notification template with backend integration
 */
export async function generateNotificationTemplate(
  request: {
    type: 'email' | 'push' | 'sms' | 'inApp';
    category: string;
    language: string;
    variables: string[];
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<NotificationTemplate>> {
  try {
    const response = await fetch('/api/notifications/generate-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Notification template generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Notification template generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        id: '',
        name: '',
        type: request.type,
        content: '',
        variables: request.variables,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }
}

/**
 * Send notification with backend integration
 */
export async function sendNotification(
  request: {
    userId: string;
    type: 'email' | 'push' | 'sms' | 'inApp';
    template: string;
    variables: Record<string, any>;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<{ notificationId: string; status: string }>> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Notification sending failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Notification sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { notificationId: '', status: 'failed' }
    };
  }
}

/**
 * Get notification history with backend integration
 */
export async function getNotificationHistory(
  userId: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h',
  filters?: Record<string, any>
): Promise<APIResponse<any[]>> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('timeRange', timeRange);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }

    const response = await fetch(`/api/notifications/history/${userId}?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Notification history fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Notification history fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Update notification preferences with backend integration
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationSettings['preferences']>
): Promise<APIResponse<NotificationSettings>> {
  try {
    const response = await fetch(`/api/notifications/preferences/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error(`Notification preferences update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Notification preferences update failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {} as NotificationSettings
    };
  }
}

/**
 * Test notification delivery with backend integration
 */
export async function testNotificationDelivery(
  userId: string,
  type: 'email' | 'push' | 'sms' | 'inApp',
  template: string
): Promise<APIResponse<{ success: boolean; message: string }>> {
  try {
    const response = await fetch('/api/notifications/test-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, template })
    });

    if (!response.ok) {
      throw new Error(`Notification delivery test failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Notification delivery test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { success: false, message: 'Test failed' }
    };
  }
}

// Additional utility functions for notification management
export function formatNotificationTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function getNotificationIcon(
  category: string,
  priority: string = 'normal'
): React.ComponentType<any> {
  // This would need to be implemented with actual icon components
  // For now, returning a generic icon type
  return () => null;
}

export function playNotificationSound(sound: string): void {
  try {
    // Implementation for playing notification sounds
    // This would typically involve Web Audio API or HTML5 Audio
    console.log(`Playing notification sound: ${sound}`);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}
