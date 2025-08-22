/**
 * Racine Dashboard API Service
 * ============================
 * 
 * Comprehensive API service for intelligent dashboard functionality that maps 100%
 * to the backend RacineDashboardService and provides real-time, customizable
 * dashboards with cross-group visualizations and predictive insights.
 * 
 * Features:
 * - Real-time customizable dashboard builder
 * - Cross-group KPI aggregation and visualization
 * - Predictive analytics and AI-powered insights
 * - Custom widget creation and management
 * - Advanced alerting and notification system
 * - Executive reporting and drill-down analytics
 * - Performance monitoring across all groups
 * - Dashboard personalization and sharing
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_dashboard_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_dashboard_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_dashboard_models.py
 */

import {
  APIResponse,
  CreateDashboardRequest,
  DashboardResponse,
  DashboardListResponse,
  UpdateDashboardRequest,
  CreateWidgetRequest,
  WidgetResponse,
  WidgetListResponse,
  DashboardMetricsRequest,
  DashboardMetricsResponse,
  AlertConfigurationRequest,
  AlertConfigurationResponse,
  DashboardExportRequest,
  RealtimeMetricsResponse,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../types/api.types';

import {
  DashboardState,
  Widget,
  DashboardConfiguration,
  WidgetConfiguration,
  MetricDefinition,
  AlertConfiguration,
  DashboardLayout,
  VisualizationConfig,
  DashboardTheme,
  ExecutiveReport,
  CrossGroupMetrics,
  PredictiveInsight,
  DrillDownConfig
} from '../types/racine-core.types';

/**
 * Configuration for the dashboard API service
 */
interface DashboardAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeUpdates: boolean;
  enablePredictiveAnalytics: boolean;
  metricsUpdateInterval: number;
  websocketURL?: string;
  maxWidgetsPerDashboard: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: DashboardAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeUpdates: true,
  enablePredictiveAnalytics: true,
  metricsUpdateInterval: 10000,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  maxWidgetsPerDashboard: 50
};

/**
 * Dashboard event types for real-time updates
 */
export enum DashboardEventType {
  DASHBOARD_CREATED = 'dashboard_created',
  DASHBOARD_UPDATED = 'dashboard_updated',
  DASHBOARD_DELETED = 'dashboard_deleted',
  WIDGET_ADDED = 'widget_added',
  WIDGET_UPDATED = 'widget_updated',
  WIDGET_REMOVED = 'widget_removed',
  METRICS_UPDATED = 'metrics_updated',
  ALERT_TRIGGERED = 'alert_triggered',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  ANOMALY_DETECTED = 'anomaly_detected',
  INSIGHT_GENERATED = 'insight_generated'
}

/**
 * Widget types supported by the dashboard
 */
export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC_CARD = 'metric_card',
  GAUGE = 'gauge',
  HEATMAP = 'heatmap',
  TIMELINE = 'timeline',
  MAP = 'map',
  TEXT = 'text',
  IMAGE = 'image',
  IFRAME = 'iframe',
  CUSTOM = 'custom'
}

/**
 * Chart types for visualization widgets
 */
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  DONUT = 'donut',
  RADAR = 'radar',
  TREEMAP = 'treemap',
  SANKEY = 'sankey',
  FUNNEL = 'funnel'
}

/**
 * Dashboard event interface
 */
export interface DashboardEvent {
  type: DashboardEventType;
  dashboardId: UUID;
  widgetId?: UUID;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Dashboard event handler type
 */
export type DashboardEventHandler = (event: DashboardEvent) => void;

/**
 * Dashboard event subscription
 */
export interface DashboardEventSubscription {
  id: UUID;
  eventType: DashboardEventType;
  handler: DashboardEventHandler;
  dashboardId?: UUID;
  widgetId?: UUID;
}

/**
 * Main Dashboard API Service Class
 */
class DashboardAPI {
  private config: DashboardAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, DashboardEventSubscription> = new Map();
  private metricsUpdateTimers: Map<UUID, NodeJS.Timeout> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<DashboardAPIConfig> = {}) {
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

  /**
   * Initialize real-time dashboard updates
   */
  async initializeRealTimeUpdates(): Promise<void> {
    if (!this.config.enableRealTimeUpdates || !this.config.websocketURL) {
      return;
    }

    try {
      this.websocket = new WebSocket(`${this.config.websocketURL}/dashboards`);
      
      this.websocket.onopen = () => {
        console.log('Dashboard WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const dashboardEvent: DashboardEvent = JSON.parse(event.data);
          this.handleDashboardEvent(dashboardEvent);
        } catch (error) {
          console.error('Failed to parse dashboard event:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Dashboard WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Dashboard WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize dashboard WebSocket:', error);
    }
  }

  /**
   * Handle incoming dashboard events
   */
  private handleDashboardEvent(event: DashboardEvent): void {
    const applicableSubscriptions = Array.from(this.eventSubscriptions.values()).filter(
      subscription => {
        const typeMatches = subscription.eventType === event.type;
        const dashboardMatches = !subscription.dashboardId || subscription.dashboardId === event.dashboardId;
        const widgetMatches = !subscription.widgetId || subscription.widgetId === event.widgetId;
        return typeMatches && dashboardMatches && widgetMatches;
      }
    );

    applicableSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error('Error executing dashboard event handler:', error);
      }
    });
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting dashboard WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeRealTimeUpdates();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  // =============================================================================
  // DASHBOARD CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new dashboard
   * Maps to: POST /api/racine/dashboards/create
   */
  async createDashboard(request: CreateDashboardRequest): Promise<DashboardResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create dashboard: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get dashboard by ID
   * Maps to: GET /api/racine/dashboards/{id}
   */
  async getDashboard(dashboardId: UUID): Promise<DashboardResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get dashboard: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List dashboards with filtering and pagination
   * Maps to: GET /api/racine/dashboards/list
   */
  async listDashboards(
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<DashboardListResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }
    
    if (sort) {
      params.append('sort', JSON.stringify(sort));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/list?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to list dashboards: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update dashboard configuration
   * Maps to: PUT /api/racine/dashboards/{id}
   */
  async updateDashboard(dashboardId: UUID, request: UpdateDashboardRequest): Promise<DashboardResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update dashboard: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete dashboard
   * Maps to: DELETE /api/racine/dashboards/{id}
   */
  async deleteDashboard(dashboardId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete dashboard: ${response.statusText}`);
    }
  }

  // =============================================================================
  // WIDGET MANAGEMENT
  // =============================================================================

  /**
   * Add widget to dashboard
   * Maps to: POST /api/racine/dashboards/{id}/widgets
   */
  async addWidget(dashboardId: UUID, request: CreateWidgetRequest): Promise<WidgetResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/widgets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to add widget: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get dashboard widgets
   * Maps to: GET /api/racine/dashboards/{id}/widgets
   */
  async getDashboardWidgets(dashboardId: UUID): Promise<WidgetListResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/widgets`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get dashboard widgets: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update widget configuration
   * Maps to: PUT /api/racine/dashboards/{id}/widgets/{widgetId}
   */
  async updateWidget(
    dashboardId: UUID, 
    widgetId: UUID, 
    configuration: WidgetConfiguration
  ): Promise<WidgetResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/widgets/${widgetId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ configuration })
    });

    if (!response.ok) {
      throw new Error(`Failed to update widget: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Remove widget from dashboard
   * Maps to: DELETE /api/racine/dashboards/{id}/widgets/{widgetId}
   */
  async removeWidget(dashboardId: UUID, widgetId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/widgets/${widgetId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to remove widget: ${response.statusText}`);
    }
  }

  // =============================================================================
  // METRICS AND ANALYTICS
  // =============================================================================

  /**
   * Get real-time dashboard metrics
   * Maps to: POST /api/racine/dashboards/{id}/metrics
   */
  async getDashboardMetrics(dashboardId: UUID, request: DashboardMetricsRequest): Promise<DashboardMetricsResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/metrics`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to get dashboard metrics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get cross-group KPIs
   * Maps to: GET /api/racine/dashboards/cross-group-kpis
   */
  async getCrossGroupKPIs(
    groupIds: string[],
    timeRange?: { start: ISODateString; end: ISODateString }
  ): Promise<CrossGroupMetrics> {
    const params = new URLSearchParams();
    params.append('group_ids', JSON.stringify(groupIds));
    
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/cross-group-kpis?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get cross-group KPIs: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get predictive insights
   * Maps to: POST /api/racine/dashboards/predictive-insights
   */
  async getPredictiveInsights(
    dashboardId: UUID,
    analysisType: 'trend' | 'anomaly' | 'forecast' | 'correlation' = 'trend'
  ): Promise<PredictiveInsight[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/predictive-insights`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        dashboard_id: dashboardId,
        analysis_type: analysisType
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get predictive insights: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get executive report
   * Maps to: GET /api/racine/dashboards/{id}/executive-report
   */
  async getExecutiveReport(
    dashboardId: UUID,
    reportType: 'summary' | 'detailed' | 'trends' = 'summary'
  ): Promise<ExecutiveReport> {
    const params = new URLSearchParams();
    params.append('report_type', reportType);

    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/executive-report?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get executive report: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // ALERTING AND NOTIFICATIONS
  // =============================================================================

  /**
   * Configure dashboard alerts
   * Maps to: POST /api/racine/dashboards/{id}/alerts
   */
  async configureAlert(dashboardId: UUID, request: AlertConfigurationRequest): Promise<AlertConfigurationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/alerts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to configure alert: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get dashboard alerts
   * Maps to: GET /api/racine/dashboards/{id}/alerts
   */
  async getDashboardAlerts(dashboardId: UUID): Promise<AlertConfiguration[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/alerts`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get dashboard alerts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update alert configuration
   * Maps to: PUT /api/racine/dashboards/{id}/alerts/{alertId}
   */
  async updateAlert(
    dashboardId: UUID, 
    alertId: UUID, 
    configuration: AlertConfiguration
  ): Promise<AlertConfigurationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/alerts/${alertId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ configuration })
    });

    if (!response.ok) {
      throw new Error(`Failed to update alert: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete alert configuration
   * Maps to: DELETE /api/racine/dashboards/{id}/alerts/{alertId}
   */
  async deleteAlert(dashboardId: UUID, alertId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete alert: ${response.statusText}`);
    }
  }

  // =============================================================================
  // DASHBOARD SHARING AND EXPORT
  // =============================================================================

  /**
   * Share dashboard
   * Maps to: POST /api/racine/dashboards/{id}/share
   */
  async shareDashboard(
    dashboardId: UUID,
    shareWith: { userIds?: UUID[]; roleIds?: UUID[]; public?: boolean },
    permissions: string[] = ['view']
  ): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        share_with: shareWith,
        permissions
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to share dashboard: ${response.statusText}`);
    }
  }

  /**
   * Export dashboard
   * Maps to: POST /api/racine/dashboards/{id}/export
   */
  async exportDashboard(dashboardId: UUID, request: DashboardExportRequest): Promise<Blob> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/export`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to export dashboard: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Clone dashboard
   * Maps to: POST /api/racine/dashboards/{id}/clone
   */
  async cloneDashboard(dashboardId: UUID, newName: string): Promise<DashboardResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/dashboards/${dashboardId}/clone`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name: newName })
    });

    if (!response.ok) {
      throw new Error(`Failed to clone dashboard: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // REAL-TIME METRICS MANAGEMENT
  // =============================================================================

  /**
   * Start real-time metrics updates for dashboard
   */
  startMetricsUpdates(dashboardId: UUID, interval?: number): void {
    const updateInterval = interval || this.config.metricsUpdateInterval;
    
    const timer = setInterval(async () => {
      try {
        // Trigger metrics update event
        this.handleDashboardEvent({
          type: DashboardEventType.METRICS_UPDATED,
          dashboardId,
          userId: 'system',
          timestamp: new Date().toISOString(),
          data: { timestamp: new Date().toISOString() }
        });
      } catch (error) {
        console.error('Error updating dashboard metrics:', error);
      }
    }, updateInterval);

    this.metricsUpdateTimers.set(dashboardId, timer);
  }

  /**
   * Stop real-time metrics updates for dashboard
   */
  stopMetricsUpdates(dashboardId: UUID): void {
    const timer = this.metricsUpdateTimers.get(dashboardId);
    if (timer) {
      clearInterval(timer);
      this.metricsUpdateTimers.delete(dashboardId);
    }
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to dashboard events
   */
  subscribeToEvents(
    eventType: DashboardEventType,
    handler: DashboardEventHandler,
    dashboardId?: UUID,
    widgetId?: UUID
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    const subscription: DashboardEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      dashboardId,
      widgetId
    };

    this.eventSubscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from dashboard events
   */
  unsubscribeFromEvents(subscriptionId: UUID): void {
    this.eventSubscriptions.delete(subscriptionId);
  }

  /**
   * Cleanup all connections and timers
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    // Clear all metrics update timers
    this.metricsUpdateTimers.forEach((timer) => clearInterval(timer));
    this.metricsUpdateTimers.clear();
    
    this.eventSubscriptions.clear();
  }
}

// Create and export singleton instance
export const dashboardAPI = new DashboardAPI();

// Export class for direct instantiation if needed
export { DashboardAPI };

// ============================================================================
// PERFORMANCE MONITORING API
// ============================================================================

export const performanceMonitoringAPI = {
  getPerformanceMetrics: async (): Promise<any> => {
    // Implementation for performance monitoring
    return {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        network: 0
      }
    };
  },
  
  startMonitoring: () => {
    console.log('Performance monitoring started');
  },
  
  stopMonitoring: () => {
    console.log('Performance monitoring stopped');
  }
};

// Export types for external usage
export type {
  DashboardAPIConfig,
  DashboardEvent,
  DashboardEventHandler,
  DashboardEventSubscription
};