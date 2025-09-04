/**
 * ⚡ Scan Performance APIs - Advanced Scan Logic
 * ============================================
 * 
 * Comprehensive API integration for scan performance operations
 * Maps to: backend/api/routes/scan_performance_routes.py
 * 
 * Features:
 * - Advanced performance monitoring and analytics
 * - Real-time performance metrics and insights
 * - Intelligent performance optimization
 * - Resource utilization tracking and analysis
 * - Performance bottleneck detection and resolution
 * - Enterprise performance reporting and benchmarking
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib copie/api-client';
import {
  PerformanceMetric,
  PerformanceHistory,
  PerformanceBottleneck,
  PerformanceOptimization,
  PerformanceAlert,
  PerformanceBenchmark,
  ResourceUtilization,
  PerformanceReport,
  PerformanceMetricType,
  PerformanceStatus,
  BottleneckType,
  OptimizationType,
  MonitoringScope,
  AlertSeverity,
  TrendDirection,
  BenchmarkType,
  PerformanceAnalyticsRequest,
  PerformanceOptimizationRequest,
  PerformanceReportRequest,
  PerformanceThreshold,
  PerformanceBaseline,
  ScalingRecommendation,
  CostOptimization
} from '../types/performance.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/scan-performance';

const ENDPOINTS = {
  // Core performance metrics
  GET_PERFORMANCE_METRICS: `${API_BASE}/metrics`,
  GET_REAL_TIME_METRICS: `${API_BASE}/metrics/real-time`,
  GET_PERFORMANCE_HISTORY: `${API_BASE}/metrics/history`,
  GET_PERFORMANCE_SUMMARY: `${API_BASE}/metrics/summary`,
  
  // Performance analytics
  ANALYZE_PERFORMANCE: `${API_BASE}/analytics/analyze`,
  GET_PERFORMANCE_INSIGHTS: `${API_BASE}/analytics/insights`,
  GET_TREND_ANALYSIS: `${API_BASE}/analytics/trends`,
  GET_COMPARATIVE_ANALYSIS: `${API_BASE}/analytics/compare`,
  
  // Bottleneck detection
  DETECT_BOTTLENECKS: `${API_BASE}/bottlenecks/detect`,
  ANALYZE_BOTTLENECKS: `${API_BASE}/bottlenecks/analyze`,
  GET_BOTTLENECK_HISTORY: `${API_BASE}/bottlenecks/history`,
  
  // Performance optimization
  OPTIMIZE_PERFORMANCE: `${API_BASE}/optimization/optimize`,
  GET_OPTIMIZATION_RECOMMENDATIONS: `${API_BASE}/optimization/recommendations`,
  APPLY_OPTIMIZATION: `${API_BASE}/optimization/apply`,
  
  // Resource utilization
  GET_RESOURCE_UTILIZATION: `${API_BASE}/resources/utilization`,
  GET_RESOURCE_TRENDS: `${API_BASE}/resources/trends`,
  GET_CAPACITY_PLANNING: `${API_BASE}/resources/capacity`,
  
  // Performance alerts
  GET_PERFORMANCE_ALERTS: `${API_BASE}/alerts`,
  CREATE_PERFORMANCE_ALERT: `${API_BASE}/alerts/create`,
  UPDATE_ALERT_THRESHOLDS: `${API_BASE}/alerts/thresholds`,
  
  // Benchmarking
  GET_PERFORMANCE_BENCHMARKS: `${API_BASE}/benchmarks`,
  CREATE_BENCHMARK: `${API_BASE}/benchmarks/create`,
  COMPARE_BENCHMARKS: `${API_BASE}/benchmarks/compare`,
  
  // Reporting
  GENERATE_PERFORMANCE_REPORT: `${API_BASE}/reports/generate`,
  GET_PERFORMANCE_REPORTS: `${API_BASE}/reports`,
  EXPORT_PERFORMANCE_DATA: `${API_BASE}/reports/export`
} as const;

/**
 * Scan Performance API Service Class
 * Provides comprehensive integration with scan performance backend
 */
export class ScanPerformanceAPIService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor() {
    this.apiClient = new ApiClient();
    this.baseUrl = '/api/v1/scan-performance';
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================== PERFORMANCE METRICS ====================

  /**
   * Get real-time performance metrics across all scan operations
   * Maps to: GET /scan-performance/metrics
   * Backend: scan_performance_routes.py -> get_performance_metrics
   */
  async getPerformanceMetrics(params: {
    scope?: MonitoringScope;
    resource_type?: string;
    metric_types?: PerformanceMetricType[];
    time_range?: string;
    aggregation?: string;
    include_history?: boolean;
  } = {}): Promise<{
    metrics: PerformanceMetric[];
    summary: any;
    trends?: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.scope) queryParams.append('scope', params.scope);
    if (params.resource_type) queryParams.append('resource_type', params.resource_type);
    if (params.metric_types) {
      params.metric_types.forEach(type => queryParams.append('metric_types', type));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.aggregation) queryParams.append('aggregation', params.aggregation);
    if (params.include_history !== undefined) queryParams.append('include_history', params.include_history.toString());

    const response = await fetch(`${this.baseUrl}/metrics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get detailed performance metrics for specific scan
   * Maps to: GET /scan-performance/metrics/{scan_id}
   * Backend: scan_performance_routes.py -> get_scan_metrics
   */
  async getScanMetrics(scanId: string, params: {
    include_breakdown?: boolean;
    metric_types?: PerformanceMetricType[];
  } = {}): Promise<{
    scan_id: string;
    metrics: PerformanceMetric[];
    breakdown?: any;
    recommendations?: string[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.include_breakdown !== undefined) queryParams.append('include_breakdown', params.include_breakdown.toString());
    if (params.metric_types) {
      params.metric_types.forEach(type => queryParams.append('metric_types', type));
    }

    const response = await fetch(`${this.baseUrl}/metrics/${scanId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Create custom performance metric
   * Maps to: POST /scan-performance/metrics
   * Backend: scan_performance_routes.py -> create_performance_metric
   */
  async createPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceMetric> {
    const response = await fetch(`${this.baseUrl}/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(metric)
    });

    return this.handleResponse(response);
  }

  /**
   * Record performance metric data
   * Maps to: POST /scan-performance/metrics/{metric_id}/record
   * Backend: scan_performance_routes.py -> record_metric_data
   */
  async recordMetricData(metricId: string, data: {
    value: number;
    timestamp?: string;
    context?: Record<string, any>;
    tags?: Record<string, string>;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/metrics/${metricId}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // ==================== PERFORMANCE HISTORY ====================

  /**
   * Get performance history for trends analysis
   * Maps to: GET /scan-performance/history
   * Backend: scan_performance_routes.py -> get_performance_history
   */
  async getPerformanceHistory(params: {
    time_range: string;
    granularity?: string;
    metric_types?: PerformanceMetricType[];
    scan_ids?: string[];
    aggregation?: string;
  }): Promise<{
    history: PerformanceHistory[];
    trends: any;
    patterns: any;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('time_range', params.time_range);
    
    if (params.granularity) queryParams.append('granularity', params.granularity);
    if (params.metric_types) {
      params.metric_types.forEach(type => queryParams.append('metric_types', type));
    }
    if (params.scan_ids) {
      params.scan_ids.forEach(id => queryParams.append('scan_ids', id));
    }
    if (params.aggregation) queryParams.append('aggregation', params.aggregation);

    const response = await fetch(`${this.baseUrl}/history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== BOTTLENECK DETECTION ====================

  /**
   * Detect performance bottlenecks
   * Maps to: POST /scan-performance/bottlenecks/detect
   * Backend: scan_performance_routes.py -> detect_bottlenecks
   */
  async detectBottlenecks(request: {
    scope: MonitoringScope;
    analysis_depth?: string;
    time_range?: string;
    threshold_sensitivity?: number;
  }): Promise<{
    bottlenecks: PerformanceBottleneck[];
    analysis_summary: any;
    recommendations: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/bottlenecks/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get active bottlenecks
   * Maps to: GET /scan-performance/bottlenecks
   * Backend: scan_performance_routes.py -> get_active_bottlenecks
   */
  async getActiveBottlenecks(params: {
    severity?: string[];
    bottleneck_types?: BottleneckType[];
    scope?: MonitoringScope;
  } = {}): Promise<{
    bottlenecks: PerformanceBottleneck[];
    summary: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.severity) {
      params.severity.forEach(s => queryParams.append('severity', s));
    }
    if (params.bottleneck_types) {
      params.bottleneck_types.forEach(type => queryParams.append('bottleneck_types', type));
    }
    if (params.scope) queryParams.append('scope', params.scope);

    const response = await fetch(`${this.baseUrl}/bottlenecks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Resolve performance bottleneck
   * Maps to: POST /scan-performance/bottlenecks/{bottleneck_id}/resolve
   * Backend: scan_performance_routes.py -> resolve_bottleneck
   */
  async resolveBottleneck(bottleneckId: string, resolution: {
    action: string;
    parameters?: Record<string, any>;
    auto_resolve?: boolean;
  }): Promise<{ success: boolean; message: string; result?: any }> {
    const response = await fetch(`${this.baseUrl}/bottlenecks/${bottleneckId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(resolution)
    });

    return this.handleResponse(response);
  }

  // ==================== PERFORMANCE OPTIMIZATION ====================

  /**
   * Generate performance optimization recommendations
   * Maps to: POST /scan-performance/optimize/analyze
   * Backend: scan_performance_routes.py -> analyze_optimization
   */
  async analyzeOptimization(request: PerformanceAnalyticsRequest): Promise<{
    optimizations: PerformanceOptimization[];
    analysis: any;
    recommendations: string[];
    impact_estimates: any;
  }> {
    const response = await fetch(`${this.baseUrl}/optimize/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Apply performance optimization
   * Maps to: POST /scan-performance/optimize/apply
   * Backend: scan_performance_routes.py -> apply_optimization
   */
  async applyOptimization(request: PerformanceOptimizationRequest): Promise<{
    success: boolean;
    optimization_id: string;
    changes_applied: any[];
    monitoring_plan: any;
  }> {
    const response = await fetch(`${this.baseUrl}/optimize/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get optimization history
   * Maps to: GET /scan-performance/optimize/history
   * Backend: scan_performance_routes.py -> get_optimization_history
   */
  async getOptimizationHistory(params: {
    time_range?: string;
    optimization_types?: OptimizationType[];
    status?: string[];
  } = {}): Promise<{
    optimizations: PerformanceOptimization[];
    summary: any;
    trends: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.optimization_types) {
      params.optimization_types.forEach(type => queryParams.append('optimization_types', type));
    }
    if (params.status) {
      params.status.forEach(s => queryParams.append('status', s));
    }

    const response = await fetch(`${this.baseUrl}/optimize/history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== RESOURCE UTILIZATION ====================

  /**
   * Get resource utilization metrics
   * Maps to: GET /scan-performance/resources
   * Backend: scan_performance_routes.py -> get_resource_utilization
   */
  async getResourceUtilization(params: {
    resource_types?: string[];
    time_range?: string;
    include_predictions?: boolean;
  } = {}): Promise<{
    utilization: ResourceUtilization[];
    summary: any;
    predictions?: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.resource_types) {
      params.resource_types.forEach(type => queryParams.append('resource_types', type));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.include_predictions !== undefined) queryParams.append('include_predictions', params.include_predictions.toString());

    const response = await fetch(`${this.baseUrl}/resources?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get scaling recommendations
   * Maps to: GET /scan-performance/resources/scaling
   * Backend: scan_performance_routes.py -> get_scaling_recommendations
   */
  async getScalingRecommendations(params: {
    resource_types?: string[];
    forecast_horizon?: string;
  } = {}): Promise<{
    recommendations: ScalingRecommendation[];
    analysis: any;
    cost_impact: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.resource_types) {
      params.resource_types.forEach(type => queryParams.append('resource_types', type));
    }
    if (params.forecast_horizon) queryParams.append('forecast_horizon', params.forecast_horizon);

    const response = await fetch(`${this.baseUrl}/resources/scaling?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== PERFORMANCE ALERTS ====================

  /**
   * Get performance alerts
   * Maps to: GET /scan-performance/alerts
   * Backend: scan_performance_routes.py -> get_performance_alerts
   */
  async getPerformanceAlerts(params: {
    severity?: AlertSeverity[];
    status?: string[];
    time_range?: string;
  } = {}): Promise<{
    alerts: PerformanceAlert[];
    summary: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.severity) {
      params.severity.forEach(s => queryParams.append('severity', s));
    }
    if (params.status) {
      params.status.forEach(s => queryParams.append('status', s));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);

    const response = await fetch(`${this.baseUrl}/alerts?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Create performance alert
   * Maps to: POST /scan-performance/alerts
   * Backend: scan_performance_routes.py -> create_performance_alert
   */
  async createPerformanceAlert(alert: Omit<PerformanceAlert, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceAlert> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(alert)
    });

    return this.handleResponse(response);
  }

  /**
   * Acknowledge performance alert
   * Maps to: POST /scan-performance/alerts/{alert_id}/acknowledge
   * Backend: scan_performance_routes.py -> acknowledge_alert
   */
  async acknowledgeAlert(alertId: string, acknowledgment: {
    acknowledged_by: string;
    comments?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(acknowledgment)
    });

    return this.handleResponse(response);
  }

  // ==================== PERFORMANCE BENCHMARKS ====================

  /**
   * Get performance benchmarks
   * Maps to: GET /scan-performance/benchmarks
   * Backend: scan_performance_routes.py -> get_performance_benchmarks
   */
  async getPerformanceBenchmarks(params: {
    benchmark_types?: BenchmarkType[];
    scope?: MonitoringScope;
  } = {}): Promise<{
    benchmarks: PerformanceBenchmark[];
    comparisons: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.benchmark_types) {
      params.benchmark_types.forEach(type => queryParams.append('benchmark_types', type));
    }
    if (params.scope) queryParams.append('scope', params.scope);

    const response = await fetch(`${this.baseUrl}/benchmarks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Create performance benchmark
   * Maps to: POST /scan-performance/benchmarks
   * Backend: scan_performance_routes.py -> create_benchmark
   */
  async createBenchmark(benchmark: Omit<PerformanceBenchmark, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceBenchmark> {
    const response = await fetch(`${this.baseUrl}/benchmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(benchmark)
    });

    return this.handleResponse(response);
  }

  // ==================== PERFORMANCE REPORTS ====================

  /**
   * Generate performance report
   * Maps to: POST /scan-performance/reports/generate
   * Backend: scan_performance_routes.py -> generate_performance_report
   */
  async generatePerformanceReport(request: PerformanceReportRequest): Promise<{
    report_id: string;
    report: PerformanceReport;
    generation_status: string;
  }> {
    const response = await fetch(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get performance report
   * Maps to: GET /scan-performance/reports/{report_id}
   * Backend: scan_performance_routes.py -> get_performance_report
   */
  async getPerformanceReport(reportId: string): Promise<PerformanceReport> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== REAL-TIME MONITORING ====================

  /**
   * Subscribe to real-time performance updates
   * Maps to: WebSocket /scan-performance/ws/metrics
   * Backend: scan_performance_routes.py -> websocket_metrics_stream
   */
  subscribeToPerformanceUpdates(
    params: { metric_types?: PerformanceMetricType[]; scope?: MonitoringScope },
    onUpdate: (data: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/metrics`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Send subscription parameters
      ws.send(JSON.stringify({ type: 'subscribe', ...params }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }

  /**
   * Subscribe to performance alerts
   * Maps to: WebSocket /scan-performance/ws/alerts
   * Backend: scan_performance_routes.py -> websocket_alerts_stream
   */
  subscribeToPerformanceAlerts(
    onAlert: (alert: PerformanceAlert) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/alerts`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data);
        onAlert(alert);
      } catch (error) {
        console.error('Failed to parse alert message:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }
}

// Export singleton instance
export const scanPerformanceAPI = new ScanPerformanceAPIService();
export default scanPerformanceAPI;