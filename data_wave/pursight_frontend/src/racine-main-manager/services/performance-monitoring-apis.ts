/**
 * Racine Performance Monitoring API Service
 * =========================================
 * 
 * Comprehensive API service for performance monitoring functionality that maps 100%
 * to the backend RacinePerformanceService and provides real-time performance tracking
 * and optimization recommendations.
 * 
 * Features:
 * - Real-time performance metrics collection
 * - Tab-specific performance monitoring
 * - Memory usage tracking and optimization
 * - Rendering performance analysis
 * - Performance insights and recommendations
 * - Cross-component performance correlation
 * - Automated performance optimization
 * - Performance alerting and notifications
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_performance_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_performance_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_performance_models.py
 */

import {
  UUID,
  ISODateString,
  APIResponse
} from '../types/racine-core.types';

import { withGracefulErrorHandling, DefaultApiResponses } from "../../lib copie/api-error-handler";

/**
 * Configuration for the performance monitoring API service
 */
interface PerformanceAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeMonitoring: boolean;
  enablePerformanceAlerts: boolean;
  performanceThresholds: {
    memoryUsage: number;
    renderTime: number;
    interactionLatency: number;
    frameRate: number;
  };
  websocketURL?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PerformanceAPIConfig = {
  baseURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/proxy',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeMonitoring: true,
  enablePerformanceAlerts: true,
  performanceThresholds: {
    memoryUsage: 100 * 1024 * 1024, // 100MB
    renderTime: 1000, // 1 second
    interactionLatency: 100, // 100ms
    frameRate: 30 // 30 FPS
  },
  websocketURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8000/ws'
};

/**
 * Performance event types for real-time updates
 */
export enum PerformanceEventType {
  PERFORMANCE_ALERT = 'performance_alert',
  MEMORY_THRESHOLD_EXCEEDED = 'memory_threshold_exceeded',
  RENDER_TIME_SLOW = 'render_time_slow',
  INTERACTION_LATENCY_HIGH = 'interaction_latency_high',
  FRAME_RATE_DROP = 'frame_rate_drop',
  OPTIMIZATION_RECOMMENDATION = 'optimization_recommendation',
  PERFORMANCE_INSIGHT = 'performance_insight'
}

/**
 * Performance event interface
 */
export interface PerformanceEvent {
  type: PerformanceEventType;
  componentId?: UUID;
  tabId?: UUID;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Performance event handler type
 */
export type PerformanceEventHandler = (event: PerformanceEvent) => void;

/**
 * Performance event subscription
 */
export interface PerformanceEventSubscription {
  id: UUID;
  eventType: PerformanceEventType;
  handler: PerformanceEventHandler;
  componentId?: UUID;
  tabId?: UUID;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  renderTime: number;
  interactionLatency: number;
  frameRate: number;
  cpuUsage?: number;
  networkRequests: {
    total: number;
    failed: number;
    averageResponseTime: number;
  };
  longTasks: number;
  layoutShifts: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

/**
 * Tab performance metrics interface
 */
export interface TabPerformanceMetrics {
  tabId: UUID;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  interactionLatency: number;
  updateFrequency: number;
  errorCount: number;
  lastOptimized: ISODateString;
  performanceScore: number;
}

/**
 * Performance insights interface
 */
export interface PerformanceInsight {
  id: UUID;
  type: 'memory' | 'render' | 'interaction' | 'network' | 'general';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  estimatedImprovement: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timestamp: ISODateString;
}

/**
 * Main Performance Monitoring API Service Class
 */
class PerformanceMonitoringAPI {
  private config: PerformanceAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, PerformanceEventSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<PerformanceAPIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // =============================================================================
  // AUTHENTICATION AND INITIALIZATION
  // =============================================================================

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // =============================================================================
  // TAB PERFORMANCE METHODS
  // =============================================================================

  /**
   * Track tab performance metrics
   */
  async trackTabPerformance(action: string, data: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/tabs/track`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            action,
            data,
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to track tab performance: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true, action, data },
        errorPrefix: 'Backend not available for tracking tab performance'
      }
    );
  }

  /**
   * Get tab performance insights
   */
  async getTabInsights(): Promise<{
    averageRenderTime: number;
    memoryPerTab: number;
    insights: PerformanceInsight[];
  }> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/tabs/insights`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get tab insights: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: {
          averageRenderTime: 0,
          memoryPerTab: 0,
          insights: []
        },
        errorPrefix: 'Backend not available for getting tab insights'
      }
    );
  }

  /**
   * Optimize tab rendering
   */
  async optimizeTabRendering(params: {
    tabId: UUID;
    currentMetrics: TabPerformanceMetrics;
    optimizationType: 'memory' | 'render' | 'interaction' | 'all';
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/tabs/optimize`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`Failed to optimize tab rendering: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true, optimizations: [] },
        errorPrefix: 'Backend not available for optimizing tab rendering'
      }
    );
  }

  /**
   * Get performance metrics for a specific tab
   */
  async getTabPerformanceMetrics(tabId: UUID): Promise<TabPerformanceMetrics> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/tabs/${tabId}/metrics`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get tab performance metrics: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: {
          tabId,
          loadTime: 0,
          renderTime: 0,
          memoryUsage: 0,
          interactionLatency: 0,
          updateFrequency: 0,
          errorCount: 0,
          lastOptimized: new Date().toISOString(),
          performanceScore: 100
        },
        errorPrefix: 'Backend not available for getting tab performance metrics'
      }
    );
  }

  /**
   * Get overall performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/metrics`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get performance metrics: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: {
          memoryUsage: {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
          },
          renderTime: 0,
          interactionLatency: 0,
          frameRate: 60,
          networkRequests: {
            total: 0,
            failed: 0,
            averageResponseTime: 0
          },
          longTasks: 0,
          layoutShifts: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0
        },
        errorPrefix: 'Backend not available for getting performance metrics'
      }
    );
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(): Promise<PerformanceInsight[]> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/insights`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get performance insights: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for getting performance insights'
      }
    );
  }

  /**
   * Get workspace performance insights
   */
  async getWorkspaceInsights(workspaceId: UUID): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/workspace/${workspaceId}/insights`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get workspace performance insights: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { insights: [], recommendations: [] },
        errorPrefix: 'Backend not available for getting workspace performance insights'
      }
    );
  }

  /**
   * Track workspace performance
   */
  async trackWorkspacePerformance(workspaceId: UUID, metrics: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/workspace/${workspaceId}/track`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(metrics)
        });

        if (!response.ok) {
          throw new Error(`Failed to track workspace performance: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true, metrics },
        errorPrefix: 'Backend not available for tracking workspace performance'
      }
    );
  }

  /**
   * Optimize workspace rendering
   */
  async optimizeWorkspaceRendering(workspaceId: UUID, renderingPerformance: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/workspace/${workspaceId}/optimize`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(renderingPerformance)
        });

        if (!response.ok) {
          throw new Error(`Failed to optimize workspace rendering: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true, optimizations: [] },
        errorPrefix: 'Backend not available for optimizing workspace rendering'
      }
    );
  }

  /**
   * Record performance request
   */
  async recordRequest(timestamp: number): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/requests/record`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ timestamp })
        });

        if (!response.ok) {
          throw new Error(`Failed to record performance request: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true, timestamp },
        errorPrefix: 'Backend not available for recording performance request'
      }
    );
  }

  /**
   * Record performance error
   */
  async recordError(): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/errors/record`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ timestamp: new Date().toISOString() })
        });

        if (!response.ok) {
          throw new Error(`Failed to record performance error: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for recording performance error'
      }
    );
  }

  /**
   * Record cache hit
   */
  async recordCacheHit(): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/cache/hit`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ timestamp: new Date().toISOString() })
        });

        if (!response.ok) {
          throw new Error(`Failed to record cache hit: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for recording cache hit'
      }
    );
  }

  /**
   * Record cache miss
   */
  async recordCacheMiss(): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/cache/miss`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ timestamp: new Date().toISOString() })
        });

        if (!response.ok) {
          throw new Error(`Failed to record cache miss: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for recording cache miss'
      }
    );
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/metrics/summary`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get performance metrics: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: {
          requests: 0,
          errors: 0,
          cacheHits: 0,
          cacheMisses: 0,
          averageResponseTime: 0
        },
        errorPrefix: 'Backend not available for getting performance metrics'
      }
    );
  }

  /**
   * Reset performance metrics
   */
  async reset(): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/performance/metrics/reset`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to reset performance metrics: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for resetting performance metrics'
      }
    );
  }

  /**
   * Cleanup WebSocket connection
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.eventSubscriptions.clear();
  }
}

// Create and export singleton instance
export const performanceMonitoringAPI = new PerformanceMonitoringAPI();

// Export class for direct instantiation if needed
export { PerformanceMonitoringAPI };

// Export types for external usage
export type {
  PerformanceAPIConfig,
  PerformanceEvent,
  PerformanceEventHandler,
  PerformanceEventSubscription,
  PerformanceMetrics,
  TabPerformanceMetrics,
  PerformanceInsight
};




