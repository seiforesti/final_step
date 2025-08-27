/**
 * 📊 Advanced Monitoring APIs - Advanced Scan Logic
 * =================================================
 * 
 * Comprehensive API integration for advanced monitoring operations
 * Maps to: backend/api/routes/advanced_monitoring_routes.py
 * 
 * Features:
 * - Advanced real-time monitoring dashboards
 * - Intelligent alerting and notification systems
 * - Enterprise observability and tracing
 * - Performance analytics and insights
 * - Cross-system monitoring coordination
 * - Advanced health checks and diagnostics
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib/api-client';
import {
  MonitoringDashboardConfig,
  RealTimeMetrics,
  AlertConfiguration,
  MonitoringEvent,
  ObservabilityConfig,
  PerformanceInsight,
  HealthCheckResult,
  MonitoringReport,
  AlertNotification,
  MetricsAggregation,
  TrendAnalysis,
  MonitoringThreshold,
  SystemHealthStatus,
  MonitoringStream
} from '../types/monitoring.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/monitoring';

const ENDPOINTS = {
  // Real-time dashboards
  GET_REAL_TIME_DASHBOARD: `${API_BASE}/dashboards/real-time`,
  CREATE_CUSTOM_DASHBOARD: `${API_BASE}/dashboards/create`,
  UPDATE_DASHBOARD_CONFIG: `${API_BASE}/dashboards/update`,
  GET_DASHBOARD_TEMPLATES: `${API_BASE}/dashboards/templates`,
  
  // Alerting system
  CREATE_ALERT_RULE: `${API_BASE}/alerts/create`,
  UPDATE_ALERT_RULE: `${API_BASE}/alerts/update`,
  GET_ACTIVE_ALERTS: `${API_BASE}/alerts/active`,
  GET_ALERT_HISTORY: `${API_BASE}/alerts/history`,
  ACKNOWLEDGE_ALERT: `${API_BASE}/alerts/acknowledge`,
  
  // Performance monitoring
  GET_PERFORMANCE_METRICS: `${API_BASE}/performance/metrics`,
  GET_PERFORMANCE_TRENDS: `${API_BASE}/performance/trends`,
  GET_PERFORMANCE_INSIGHTS: `${API_BASE}/performance/insights`,
  GET_RESOURCE_UTILIZATION: `${API_BASE}/performance/resources`,
  
  // Health monitoring
  GET_SYSTEM_HEALTH: `${API_BASE}/health/system`,
  GET_SERVICE_HEALTH: `${API_BASE}/health/services`,
  GET_COMPONENT_HEALTH: `${API_BASE}/health/components`,
  RUN_HEALTH_CHECK: `${API_BASE}/health/check`,
  
  // Observability
  GET_TRACE_DATA: `${API_BASE}/observability/traces`,
  GET_METRICS_DATA: `${API_BASE}/observability/metrics`,
  GET_LOGS_DATA: `${API_BASE}/observability/logs`,
  CREATE_OBSERVABILITY_CONFIG: `${API_BASE}/observability/config`,
  
  // Analytics and insights
  GET_MONITORING_ANALYTICS: `${API_BASE}/analytics/monitoring`,
  GET_TREND_ANALYSIS: `${API_BASE}/analytics/trends`,
  GET_ANOMALY_DETECTION: `${API_BASE}/analytics/anomalies`,
  GET_PREDICTIVE_INSIGHTS: `${API_BASE}/analytics/predictions`,
  
  // Streaming and real-time
  STREAM_METRICS: `${API_BASE}/stream/metrics`,
  STREAM_ALERTS: `${API_BASE}/stream/alerts`,
  STREAM_EVENTS: `${API_BASE}/stream/events`,
  STREAM_HEALTH_STATUS: `${API_BASE}/stream/health`,
  
  // Configuration
  GET_MONITORING_CONFIG: `${API_BASE}/config/monitoring`,
  UPDATE_MONITORING_CONFIG: `${API_BASE}/config/update`,
  GET_THRESHOLD_CONFIG: `${API_BASE}/config/thresholds`,
  UPDATE_THRESHOLD_CONFIG: `${API_BASE}/config/thresholds/update`
} as const;

/**
 * Advanced Monitoring API Service Class
 * Provides comprehensive integration with advanced monitoring backend
 */
export class AdvancedMonitoringAPIService {
  [x: string]: any;
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ==================== Real-time Dashboard Operations ====================

  /**
   * Get real-time monitoring dashboard
   */
  async getRealTimeDashboard(
    scope: string = 'comprehensive',
    refreshInterval: number = 30,
    filters?: Record<string, any>
  ): Promise<MonitoringDashboardConfig> {
    try {
      const response = await this.apiClient.get<MonitoringDashboardConfig>(
        ENDPOINTS.GET_REAL_TIME_DASHBOARD,
        {
          params: {
            scope,
            refresh_interval: refreshInterval,
            filters: filters ? JSON.stringify(filters) : undefined
          }
        }
      );

      return {
        ...response,
        dashboard_id: response.dashboard_id || `dashboard_${Date.now()}`,
        refresh_interval: response.refresh_interval || refreshInterval,
        last_updated: response.last_updated || new Date().toISOString(),
        widgets: response.widgets || []
      };
    } catch (error) {
      console.error('Error getting real-time dashboard:', error);
      throw new Error(`Failed to get real-time dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create custom monitoring dashboard
   */
  async createCustomDashboard(
    dashboardConfig: MonitoringDashboardConfig
  ): Promise<MonitoringDashboardConfig> {
    try {
      const response = await this.apiClient.post<MonitoringDashboardConfig>(
        ENDPOINTS.CREATE_CUSTOM_DASHBOARD,
        dashboardConfig
      );

      return {
        ...response,
        dashboard_id: response.dashboard_id || `custom_${Date.now()}`,
        creation_timestamp: response.creation_timestamp || new Date().toISOString(),
        status: response.status || 'active'
      };
    } catch (error) {
      console.error('Error creating custom dashboard:', error);
      throw new Error(`Failed to create custom dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(
    dashboardId: string,
    configUpdate: Partial<MonitoringDashboardConfig>
  ): Promise<MonitoringDashboardConfig> {
    try {
      const response = await this.apiClient.patch<MonitoringDashboardConfig>(
        `${ENDPOINTS.UPDATE_DASHBOARD_CONFIG}/${dashboardId}`,
        configUpdate
      );

      return {
        ...response,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        version: response.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error updating dashboard config:', error);
      throw new Error(`Failed to update dashboard config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dashboard templates
   */
  async getDashboardTemplates(
    category?: string
  ): Promise<MonitoringDashboardConfig[]> {
    try {
      const response = await this.apiClient.get<MonitoringDashboardConfig[]>(
        ENDPOINTS.GET_DASHBOARD_TEMPLATES,
        { params: { category } }
      );

      return response.map(template => ({
        ...template,
        template_id: template.template_id || `template_${Date.now()}_${Math.random()}`,
        category: template.category || 'general',
        last_updated: template.last_updated || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting dashboard templates:', error);
      throw new Error(`Failed to get dashboard templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Alerting System Operations ====================

  /**
   * Create alert rule
   */
  async createAlertRule(
    alertConfig: AlertConfiguration
  ): Promise<AlertConfiguration> {
    try {
      const response = await this.apiClient.post<AlertConfiguration>(
        ENDPOINTS.CREATE_ALERT_RULE,
        alertConfig
      );

      return {
        ...response,
        alert_id: response.alert_id || `alert_${Date.now()}`,
        creation_timestamp: response.creation_timestamp || new Date().toISOString(),
        status: response.status || 'active'
      };
    } catch (error) {
      console.error('Error creating alert rule:', error);
      throw new Error(`Failed to create alert rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update alert rule
   */
  async updateAlertRule(
    alertId: string,
    alertUpdate: Partial<AlertConfiguration>
  ): Promise<AlertConfiguration> {
    try {
      const response = await this.apiClient.patch<AlertConfiguration>(
        `${ENDPOINTS.UPDATE_ALERT_RULE}/${alertId}`,
        alertUpdate
      );

      return {
        ...response,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        version: response.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error updating alert rule:', error);
      throw new Error(`Failed to update alert rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(
    severity?: string,
    category?: string
  ): Promise<AlertNotification[]> {
    try {
      const response = await this.apiClient.get<AlertNotification[]>(
        ENDPOINTS.GET_ACTIVE_ALERTS,
        { params: { severity, category } }
      );

      return response.map(alert => ({
        ...alert,
        alert_id: alert.alert_id || `active_${Date.now()}_${Math.random()}`,
        severity: alert.severity || 'medium',
        status: alert.status || 'active',
        timestamp: alert.timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw new Error(`Failed to get active alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(
    timeRange?: { start: string; end: string },
    filters?: Record<string, any>
  ): Promise<AlertNotification[]> {
    try {
      const response = await this.apiClient.get<AlertNotification[]>(
        ENDPOINTS.GET_ALERT_HISTORY,
        { params: { time_range: timeRange, filters } }
      );

      return response.map(alert => ({
        ...alert,
        alert_id: alert.alert_id || `history_${Date.now()}_${Math.random()}`,
        resolved_timestamp: alert.resolved_timestamp || null,
        duration: alert.duration || 0
      }));
    } catch (error) {
      console.error('Error getting alert history:', error);
      throw new Error(`Failed to get alert history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgment: { user_id: string; comment?: string }
  ): Promise<{ success: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ success: boolean; timestamp: string }>(
        `${ENDPOINTS.ACKNOWLEDGE_ALERT}/${alertId}`,
        acknowledgment
      );

      return {
        success: response.success || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw new Error(`Failed to acknowledge alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Performance Monitoring Operations ====================

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    metricsRequest?: {
      metrics: string[];
      timeRange?: { start: string; end: string };
      granularity?: string;
    }
  ): Promise<RealTimeMetrics> {
    try {
      const response = await this.apiClient.get<RealTimeMetrics>(
        ENDPOINTS.GET_PERFORMANCE_METRICS,
        { params: metricsRequest }
      );

      return {
        ...response,
        metrics_id: response.metrics_id || `metrics_${Date.now()}`,
        collection_timestamp: response.collection_timestamp || new Date().toISOString(),
        data_points: response.data_points || [],
        aggregation_level: response.aggregation_level || 'raw'
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance trends
   */
  async getPerformanceTrends(
    trendRequest?: {
      metrics: string[];
      timeRange: { start: string; end: string };
      trend_type?: string;
    }
  ): Promise<TrendAnalysis> {
    try {
      const response = await this.apiClient.get<TrendAnalysis>(
        ENDPOINTS.GET_PERFORMANCE_TRENDS,
        { params: trendRequest }
      );

      return {
        ...response,
        trend_id: response.trend_id || `trend_${Date.now()}`,
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString(),
        trend_direction: response.trend_direction || 'stable',
        confidence_level: response.confidence_level || 0
      };
    } catch (error) {
      console.error('Error getting performance trends:', error);
      throw new Error(`Failed to get performance trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(
    insightsRequest?: Record<string, any>
  ): Promise<PerformanceInsight[]> {
    try {
      const response = await this.apiClient.get<PerformanceInsight[]>(
        ENDPOINTS.GET_PERFORMANCE_INSIGHTS,
        { params: insightsRequest }
      );

      return response.map(insight => ({
        ...insight,
        insight_id: insight.insight_id || `insight_${Date.now()}_${Math.random()}`,
        confidence_score: insight.confidence_score || 0,
        priority: insight.priority || 'medium',
        generated_timestamp: insight.generated_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw new Error(`Failed to get performance insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get resource utilization
   */
  async getResourceUtilization(
    resourceRequest?: {
      resources: string[];
      timeRange?: { start: string; end: string };
    }
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.get<Record<string, any>>(
        ENDPOINTS.GET_RESOURCE_UTILIZATION,
        { params: resourceRequest }
      );

      return {
        ...response,
        utilization_id: response.utilization_id || `util_${Date.now()}`,
        measurement_timestamp: response.measurement_timestamp || new Date().toISOString(),
        resource_metrics: response.resource_metrics || {}
      };
    } catch (error) {
      console.error('Error getting resource utilization:', error);
      throw new Error(`Failed to get resource utilization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Health Monitoring Operations ====================

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealthStatus> {
    try {
      const response = await this.apiClient.get<SystemHealthStatus>(
        ENDPOINTS.GET_SYSTEM_HEALTH
      );

      return {
        ...response,
        health_id: response.health_id || `health_${Date.now()}`,
        overall_status: response.overall_status || 'unknown',
        check_timestamp: response.check_timestamp || new Date().toISOString(),
        components: response.components || {}
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      throw new Error(`Failed to get system health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(
    services?: string[]
  ): Promise<Record<string, HealthCheckResult>> {
    try {
      const response = await this.apiClient.get<Record<string, HealthCheckResult>>(
        ENDPOINTS.GET_SERVICE_HEALTH,
        { params: { services } }
      );

      const healthResults: Record<string, HealthCheckResult> = {};
      
      Object.entries(response).forEach(([service, result]) => {
        healthResults[service] = {
          ...result,
          service_name: result.service_name || service,
          status: result.status || 'unknown',
          check_timestamp: result.check_timestamp || new Date().toISOString(),
          response_time: result.response_time || 0
        };
      });

      return healthResults;
    } catch (error) {
      console.error('Error getting service health:', error);
      throw new Error(`Failed to get service health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get component health status
   */
  async getComponentHealth(
    components?: string[]
  ): Promise<Record<string, HealthCheckResult>> {
    try {
      const response = await this.apiClient.get<Record<string, HealthCheckResult>>(
        ENDPOINTS.GET_COMPONENT_HEALTH,
        { params: { components } }
      );

      const healthResults: Record<string, HealthCheckResult> = {};
      
      Object.entries(response).forEach(([component, result]) => {
        healthResults[component] = {
          ...result,
          component_name: result.component_name || component,
          status: result.status || 'unknown',
          check_timestamp: result.check_timestamp || new Date().toISOString(),
          details: result.details || {}
        };
      });

      return healthResults;
    } catch (error) {
      console.error('Error getting component health:', error);
      throw new Error(`Failed to get component health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck(
    checkConfig?: {
      scope: string;
      depth: string;
      include_performance: boolean;
    }
  ): Promise<HealthCheckResult> {
    try {
      const response = await this.apiClient.post<HealthCheckResult>(
        ENDPOINTS.RUN_HEALTH_CHECK,
        checkConfig
      );

      return {
        ...response,
        check_id: response.check_id || `check_${Date.now()}`,
        overall_status: response.overall_status || 'unknown',
        check_timestamp: response.check_timestamp || new Date().toISOString(),
        execution_time: response.execution_time || 0
      };
    } catch (error) {
      console.error('Error running health check:', error);
      throw new Error(`Failed to run health check: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Observability Operations ====================

  /**
   * Get trace data
   */
  async getTraceData(
    traceRequest: {
      trace_id?: string;
      service?: string;
      timeRange?: { start: string; end: string };
    }
  ): Promise<Record<string, any>[]> {
    try {
      const response = await this.apiClient.get<Record<string, any>[]>(
        ENDPOINTS.GET_TRACE_DATA,
        { params: traceRequest }
      );

      return response.map(trace => ({
        ...trace,
        trace_id: trace.trace_id || `trace_${Date.now()}_${Math.random()}`,
        timestamp: trace.timestamp || new Date().toISOString(),
        duration: trace.duration || 0
      }));
    } catch (error) {
      console.error('Error getting trace data:', error);
      throw new Error(`Failed to get trace data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get metrics data for observability
   */
  async getMetricsData(
    metricsRequest: {
      metrics: string[];
      labels?: Record<string, string>;
      timeRange?: { start: string; end: string };
    }
  ): Promise<MetricsAggregation> {
    try {
      const response = await this.apiClient.get<MetricsAggregation>(
        ENDPOINTS.GET_METRICS_DATA,
        { params: metricsRequest }
      );

      return {
        ...response,
        aggregation_id: response.aggregation_id || `agg_${Date.now()}`,
        collection_timestamp: response.collection_timestamp || new Date().toISOString(),
        data_points: response.data_points || [],
        aggregation_method: response.aggregation_method || 'average'
      };
    } catch (error) {
      console.error('Error getting metrics data:', error);
      throw new Error(`Failed to get metrics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get logs data
   */
  async getLogsData(
    logsRequest: {
      service?: string;
      level?: string;
      timeRange?: { start: string; end: string };
      query?: string;
    }
  ): Promise<Record<string, any>[]> {
    try {
      const response = await this.apiClient.get<Record<string, any>[]>(
        ENDPOINTS.GET_LOGS_DATA,
        { params: logsRequest }
      );

      return response.map(log => ({
        ...log,
        log_id: log.log_id || `log_${Date.now()}_${Math.random()}`,
        timestamp: log.timestamp || new Date().toISOString(),
        level: log.level || 'info'
      }));
    } catch (error) {
      console.error('Error getting logs data:', error);
      throw new Error(`Failed to get logs data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create observability configuration
   */
  async createObservabilityConfig(
    observabilityConfig: ObservabilityConfig
  ): Promise<ObservabilityConfig> {
    try {
      const response = await this.apiClient.post<ObservabilityConfig>(
        ENDPOINTS.CREATE_OBSERVABILITY_CONFIG,
        observabilityConfig
      );

      return {
        ...response,
        config_id: response.config_id || `obs_config_${Date.now()}`,
        creation_timestamp: response.creation_timestamp || new Date().toISOString(),
        status: response.status || 'active'
      };
    } catch (error) {
      console.error('Error creating observability config:', error);
      throw new Error(`Failed to create observability config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Analytics and Insights Operations ====================

  /**
   * Get monitoring analytics
   */
  async getMonitoringAnalytics(
    analyticsRequest?: {
      analysis_type: string;
      timeRange?: { start: string; end: string };
      metrics?: string[];
    }
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.get<Record<string, any>>(
        ENDPOINTS.GET_MONITORING_ANALYTICS,
        { params: analyticsRequest }
      );

      return {
        ...response,
        analytics_id: response.analytics_id || `analytics_${Date.now()}`,
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString(),
        insights: response.insights || [],
        recommendations: response.recommendations || []
      };
    } catch (error) {
      console.error('Error getting monitoring analytics:', error);
      throw new Error(`Failed to get monitoring analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(
    trendRequest: {
      metrics: string[];
      timeRange: { start: string; end: string };
      analysis_depth?: string;
    }
  ): Promise<TrendAnalysis> {
    try {
      const response = await this.apiClient.get<TrendAnalysis>(
        ENDPOINTS.GET_TREND_ANALYSIS,
        { params: trendRequest }
      );

      return {
        ...response,
        trend_id: response.trend_id || `trend_analysis_${Date.now()}`,
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString(),
        trend_patterns: response.trend_patterns || [],
        forecasts: response.forecasts || []
      };
    } catch (error) {
      console.error('Error getting trend analysis:', error);
      throw new Error(`Failed to get trend analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get anomaly detection results
   */
  async getAnomalyDetection(
    anomalyRequest?: {
      metrics: string[];
      sensitivity?: number;
      timeRange?: { start: string; end: string };
    }
  ): Promise<Record<string, any>[]> {
    try {
      const response = await this.apiClient.get<Record<string, any>[]>(
        ENDPOINTS.GET_ANOMALY_DETECTION,
        { params: anomalyRequest }
      );

      return response.map(anomaly => ({
        ...anomaly,
        anomaly_id: anomaly.anomaly_id || `anomaly_${Date.now()}_${Math.random()}`,
        detection_timestamp: anomaly.detection_timestamp || new Date().toISOString(),
        severity: anomaly.severity || 'medium',
        confidence_score: anomaly.confidence_score || 0
      }));
    } catch (error) {
      console.error('Error getting anomaly detection:', error);
      throw new Error(`Failed to get anomaly detection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get predictive insights
   */
  async getPredictiveInsights(
    predictiveRequest?: {
      metrics: string[];
      prediction_horizon?: string;
      confidence_level?: number;
    }
  ): Promise<Record<string, any>[]> {
    try {
      const response = await this.apiClient.get<Record<string, any>[]>(
        ENDPOINTS.GET_PREDICTIVE_INSIGHTS,
        { params: predictiveRequest }
      );

      return response.map(insight => ({
        ...insight,
        prediction_id: insight.prediction_id || `pred_${Date.now()}_${Math.random()}`,
        prediction_timestamp: insight.prediction_timestamp || new Date().toISOString(),
        confidence_level: insight.confidence_level || 0,
        prediction_accuracy: insight.prediction_accuracy || 0
      }));
    } catch (error) {
      console.error('Error getting predictive insights:', error);
      throw new Error(`Failed to get predictive insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Streaming Operations ====================

  /**
   * Stream real-time metrics
   */
  async streamMetrics(
    streamConfig: Record<string, any>
  ): Promise<AsyncGenerator<RealTimeMetrics, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<RealTimeMetrics>(
        ENDPOINTS.STREAM_METRICS,
        streamConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming metrics:', error);
      throw new Error(`Failed to stream metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream real-time alerts
   */
  async streamAlerts(
    streamConfig: Record<string, any>
  ): Promise<AsyncGenerator<AlertNotification, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<AlertNotification>(
        ENDPOINTS.STREAM_ALERTS,
        streamConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming alerts:', error);
      throw new Error(`Failed to stream alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream monitoring events
   */
  async streamEvents(
    streamConfig: Record<string, any>
  ): Promise<AsyncGenerator<MonitoringEvent, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<MonitoringEvent>(
        ENDPOINTS.STREAM_EVENTS,
        streamConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming events:', error);
      throw new Error(`Failed to stream events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream health status updates
   */
  async streamHealthStatus(
    streamConfig: Record<string, any>
  ): Promise<AsyncGenerator<SystemHealthStatus, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<SystemHealthStatus>(
        ENDPOINTS.STREAM_HEALTH_STATUS,
        streamConfig
      );

      return response;
    } catch (error) {
      console.error('Error streaming health status:', error);
      throw new Error(`Failed to stream health status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Configuration Operations ====================

  /**
   * Get monitoring configuration
   */
  async getMonitoringConfig(): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.get<Record<string, any>>(
        ENDPOINTS.GET_MONITORING_CONFIG
      );

      return {
        ...response,
        config_id: response.config_id || `mon_config_${Date.now()}`,
        last_updated: response.last_updated || new Date().toISOString(),
        version: response.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error getting monitoring config:', error);
      throw new Error(`Failed to get monitoring config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update monitoring configuration
   */
  async updateMonitoringConfig(
    configUpdate: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.patch<Record<string, any>>(
        ENDPOINTS.UPDATE_MONITORING_CONFIG,
        configUpdate
      );

      return {
        ...response,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        version: response.version || '1.0.1'
      };
    } catch (error) {
      console.error('Error updating monitoring config:', error);
      throw new Error(`Failed to update monitoring config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get threshold configuration
   */
  async getThresholdConfig(): Promise<MonitoringThreshold[]> {
    try {
      const response = await this.apiClient.get<MonitoringThreshold[]>(
        ENDPOINTS.GET_THRESHOLD_CONFIG
      );

      return response.map(threshold => ({
        ...threshold,
        threshold_id: threshold.threshold_id || `threshold_${Date.now()}_${Math.random()}`,
        last_updated: threshold.last_updated || new Date().toISOString(),
        status: threshold.status || 'active'
      }));
    } catch (error) {
      console.error('Error getting threshold config:', error);
      throw new Error(`Failed to get threshold config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update threshold configuration
   */
  async updateThresholdConfig(
    thresholdUpdates: MonitoringThreshold[]
  ): Promise<MonitoringThreshold[]> {
    try {
      const response = await this.apiClient.patch<MonitoringThreshold[]>(
        ENDPOINTS.UPDATE_THRESHOLD_CONFIG,
        { thresholds: thresholdUpdates }
      );

      return response.map(threshold => ({
        ...threshold,
        update_timestamp: threshold.update_timestamp || new Date().toISOString(),
        version: threshold.version || '1.0.1'
      }));
    } catch (error) {
      console.error('Error updating threshold config:', error);
      throw new Error(`Failed to update threshold config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Health check for monitoring service
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; services: Record<string, string> }> {
    try {
      const response = await this.apiClient.get<{ status: string; timestamp: string; services: Record<string, string> }>(
        `${API_BASE}/health`
      );

      return {
        status: response.status || 'unknown',
        timestamp: response.timestamp || new Date().toISOString(),
        services: response.services || {}
      };
    } catch (error) {
      console.error('Error checking monitoring service health:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: { advanced_monitoring: 'error' }
      };
    }
  }

  /**
   * Get service capabilities
   */
  async getServiceCapabilities(): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.get<Record<string, any>>(
        `${API_BASE}/capabilities`
      );

      return {
        ...response,
        capabilities_timestamp: response.capabilities_timestamp || new Date().toISOString(),
        supported_features: response.supported_features || [],
        service_version: response.service_version || '1.0.0'
      };
    } catch (error) {
      console.error('Error getting monitoring service capabilities:', error);
      throw new Error(`Failed to get monitoring service capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const advancedMonitoringAPI = new AdvancedMonitoringAPIService();

// Export individual methods for tree-shaking
export const {
  getRealTimeDashboard,
  createCustomDashboard,
  updateDashboardConfig,
  getDashboardTemplates,
  createAlertRule,
  updateAlertRule,
  getActiveAlerts,
  getAlertHistory,
  acknowledgeAlert,
  getPerformanceMetrics,
  getPerformanceTrends,
  getPerformanceInsights,
  getResourceUtilization,
  getSystemHealth,
  getServiceHealth,
  getComponentHealth,
  runHealthCheck,
  getTraceData,
  getMetricsData,
  getLogsData,
  createObservabilityConfig,
  getMonitoringAnalytics,
  getTrendAnalysis,
  getAnomalyDetection,
  getPredictiveInsights,
  streamMetrics,
  streamAlerts,
  streamEvents,
  streamHealthStatus,
  getMonitoringConfig,
  updateMonitoringConfig,
  getThresholdConfig,
  updateThresholdConfig,
  healthCheck,
  getServiceCapabilities
} = advancedMonitoringAPI;

export default advancedMonitoringAPI;