// ============================================================================
// ANALYTICS UTILITIES - USER MANAGEMENT
// ============================================================================
// Advanced analytics utilities for tracking and analyzing user activities
// Provides comprehensive analytics functionality with backend integration

import { APIResponse } from '../types/racine-core.types';

// ============================================================================
// ANALYTICS INTERFACES
// ============================================================================

export interface APIKeyActivity {
  id: string;
  apiKeyId: string;
  action: string;
  timestamp: Date;
  endpoint: string;
  responseTime: number;
  statusCode: number;
  userAgent: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'api_access' | 'permission_change' | 'security_violation';
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalyticsMetrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  uniqueUsers: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  timeSeries: Array<{ timestamp: Date; metrics: Record<string, number> }>;
}

// ============================================================================
// ANALYTICS UTILITY FUNCTIONS
// ============================================================================

/**
 * Track API key activity with backend integration
 */
export async function trackAPIKeyActivity(
  activity: Omit<APIKeyActivity, 'id' | 'timestamp'>
): Promise<APIResponse<APIKeyActivity>> {
  try {
    const response = await fetch('/api/analytics/track-api-key-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });

    if (!response.ok) {
      throw new Error(`API key activity tracking failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API key activity tracking failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        id: '',
        apiKeyId: activity.apiKeyId,
        action: activity.action,
        timestamp: new Date(),
        endpoint: activity.endpoint,
        responseTime: activity.responseTime,
        statusCode: activity.statusCode,
        userAgent: activity.userAgent,
        ipAddress: activity.ipAddress,
        metadata: activity.metadata
      }
    };
  }
}

/**
 * Track security event with backend integration
 */
export async function trackSecurityEvent(
  event: Omit<SecurityEvent, 'id' | 'timestamp'>
): Promise<APIResponse<SecurityEvent>> {
  try {
    const response = await fetch('/api/analytics/track-security-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Security event tracking failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Security event tracking failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        id: '',
        type: event.type,
        userId: event.userId,
        timestamp: new Date(),
        details: event.details,
        severity: event.severity
      }
    };
  }
}

/**
 * Get analytics metrics with backend integration
 */
export async function getAnalyticsMetrics(
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h',
  filters?: Record<string, any>
): Promise<APIResponse<AnalyticsMetrics>> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('timeRange', timeRange);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }

    const response = await fetch(`/api/analytics/metrics?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Analytics metrics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analytics metrics fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        uniqueUsers: 0,
        topEndpoints: [],
        timeSeries: []
      }
    };
  }
}

/**
 * Get user activity analytics with backend integration
 */
export async function getUserActivityAnalytics(
  userId: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/analytics/user-activity/${userId}?timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`User activity analytics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('User activity analytics fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Get endpoint performance analytics with backend integration
 */
export async function getEndpointPerformanceAnalytics(
  endpoint: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/analytics/endpoint-performance/${encodeURIComponent(endpoint)}?timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Endpoint performance analytics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Endpoint performance analytics fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Generate analytics report with backend integration
 */
export async function generateAnalyticsReport(
  reportType: 'summary' | 'detailed' | 'custom',
  parameters: Record<string, any>
): Promise<APIResponse<any>> {
  try {
    const response = await fetch('/api/analytics/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportType, parameters })
    });

    if (!response.ok) {
      throw new Error(`Analytics report generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analytics report generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Export analytics data with backend integration
 */
export async function exportAnalyticsData(
  dataType: 'metrics' | 'events' | 'user_activity' | 'all',
  format: 'json' | 'csv' | 'excel',
  filters?: Record<string, any>
): Promise<APIResponse<{ downloadUrl: string; expiresAt: Date }>> {
  try {
    const response = await fetch('/api/analytics/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType, format, filters })
    });

    if (!response.ok) {
      throw new Error(`Analytics data export failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analytics data export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { downloadUrl: '', expiresAt: new Date() }
    };
  }
}

// Additional utility functions for analytics
export function trackUserActivity(
  userId: string,
  action: string,
  resource?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Implementation for tracking user activity
    const activityData = {
      userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    // This would typically send data to analytics backend
    console.log('Tracking user activity:', activityData);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to track user activity:', error);
    return Promise.resolve();
  }
}



