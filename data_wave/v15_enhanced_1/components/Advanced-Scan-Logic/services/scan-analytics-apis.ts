/**
 * 📊 Scan Analytics APIs - Advanced Scan Logic
 * ============================================
 * 
 * Comprehensive API integration for scan analytics operations
 * Maps to: backend/api/routes/intelligent_scanning_routes.py (analytics endpoints)
 * 
 * Features:
 * - Advanced scan analytics and insights
 * - Performance analytics and metrics
 * - Predictive analytics and forecasting
 * - Business intelligence and reporting
 * - Real-time analytics monitoring
 * - Cross-system analytics coordination
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib/api-client';
import {
  ScanAnalytics,
  AnalyticsMetric,
  AnalyticsInsight,
  AnalyticsReport,
  TrendAnalysis,
  PredictiveAnalytics,
  PerformanceAnalytics,
  BusinessInsight,
  AnalyticsScope,
  AnalyticsGranularity,
  InsightType,
  InsightPriority,
  ReportType,
  ReportFormat
} from '../types/analytics.types';

// Correct API base paths matching backend routes
const API_BASE = '/api/v1/scan-logic/intelligent-scanning';
const MONITORING_BASE = '/api/v1/monitoring';

const ENDPOINTS = {
  // Analytics from intelligent scanning routes
  ANALYZE_SCAN_PATTERNS: `${API_BASE}/analyze`,
  GENERATE_SCAN_INTELLIGENCE: `${API_BASE}/intelligence/generate`,
  ANALYZE_SCAN_BEHAVIOR: `${API_BASE}/intelligence/behavior`,
  PREDICT_SCAN_OUTCOMES: `${API_BASE}/intelligence/predictions`,
  DETECT_SCAN_ANOMALIES: `${API_BASE}/intelligence/anomalies`,
  GET_PERFORMANCE_INSIGHTS: `${API_BASE}/monitoring/insights`,
  EXECUTE_PREDICTIVE_ANALYSIS: `${API_BASE}/advanced/predictive`,
  PERFORM_CONTEXTUAL_ANALYSIS: `${API_BASE}/advanced/contextual`,
  GENERATE_INTELLIGENCE_REPORTS: `${API_BASE}/advanced/reports`,
  
  // Analytics from monitoring routes
  GET_MONITORING_ANALYTICS: `${MONITORING_BASE}/analytics/monitoring`,
  GET_TREND_ANALYSIS: `${MONITORING_BASE}/analytics/trends`,
  GET_ANOMALY_DETECTION: `${MONITORING_BASE}/analytics/anomalies`,
  GET_PREDICTIVE_INSIGHTS: `${MONITORING_BASE}/analytics/predictions`,
  GET_PERFORMANCE_METRICS: `${MONITORING_BASE}/performance/metrics`,
  GET_PERFORMANCE_TRENDS: `${MONITORING_BASE}/performance/trends`,
  GET_PERFORMANCE_INSIGHTS: `${MONITORING_BASE}/performance/insights`
} as const;

export class ScanAnalyticsAPIService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Analyze scan patterns using intelligent scanning backend
   */
  async analyzeScanPatterns(
    request: {
      analysis_dimensions: string[];
      analysis_depth?: string;
      include_predictions?: boolean;
      comparison_baseline?: string;
      intelligence_insights?: boolean;
    }
  ): Promise<AnalyticsReport> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.ANALYZE_SCAN_PATTERNS,
        request
      );
      
      return {
        report_id: response.analysis_id || `analysis_${Date.now()}`,
        report_type: 'pattern_analysis',
        scope: 'scan_patterns',
        analytics_data: response.analysis_results || {},
        insights: response.insights || [],
        metrics: response.metrics || {},
        trends: response.trends || [],
        predictions: response.predictions || [],
        generated_at: response.timestamp || new Date().toISOString(),
        report_format: 'json'
      } as AnalyticsReport;
    } catch (error) {
      console.error('Error analyzing scan patterns:', error);
      throw new Error(`Failed to analyze scan patterns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate scan intelligence insights
   */
  async generateScanIntelligence(
    request: {
      intelligence_type?: string;
      analysis_scope?: string;
      insight_depth?: string;
      include_recommendations?: boolean;
    }
  ): Promise<AnalyticsInsight[]> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.GENERATE_SCAN_INTELLIGENCE,
        request
      );
      
      return (response.intelligence_insights || []).map((insight: any) => ({
        id: insight.insight_id || `insight_${Date.now()}`,
        type: insight.insight_type || 'intelligence',
        priority: insight.priority || 'medium',
        title: insight.title || 'Scan Intelligence Insight',
        description: insight.description || '',
        confidence_score: insight.confidence_score || 0,
        impact_assessment: insight.impact_assessment || {},
        recommendations: insight.recommendations || [],
        data_sources: insight.data_sources || [],
        generated_at: insight.timestamp || new Date().toISOString()
      })) as AnalyticsInsight[];
    } catch (error) {
      console.error('Error generating scan intelligence:', error);
      throw new Error(`Failed to generate scan intelligence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze scan behavior patterns
   */
  async analyzeScanBehavior(
    request: {
      behavior_dimensions?: string[];
      time_range?: { start: string; end: string };
      pattern_detection?: boolean;
      anomaly_detection?: boolean;
    }
  ): Promise<AnalyticsReport> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.ANALYZE_SCAN_BEHAVIOR,
        request
      );
      
      return {
        report_id: response.analysis_id || `behavior_${Date.now()}`,
        report_type: 'behavior_analysis',
        scope: 'scan_behavior',
        analytics_data: response.behavior_analysis || {},
        insights: response.behavioral_insights || [],
        metrics: response.behavior_metrics || {},
        patterns: response.detected_patterns || [],
        anomalies: response.detected_anomalies || [],
        generated_at: response.timestamp || new Date().toISOString(),
        report_format: 'json'
      } as AnalyticsReport;
    } catch (error) {
      console.error('Error analyzing scan behavior:', error);
      throw new Error(`Failed to analyze scan behavior: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Predict scan outcomes using ML models
   */
  async predictScanOutcomes(
    request: {
      prediction_horizon?: string;
      prediction_models?: string[];
      confidence_threshold?: number;
      include_scenarios?: boolean;
    }
  ): Promise<PredictiveAnalytics> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.PREDICT_SCAN_OUTCOMES,
        request
      );
      
      return {
        prediction_id: response.prediction_id || `pred_${Date.now()}`,
        prediction_type: 'scan_outcomes',
        model_version: response.model_version || 'v1.0',
        predictions: response.predictions || [],
        confidence_scores: response.confidence_scores || {},
        prediction_horizon: response.prediction_horizon || '24h',
        scenarios: response.scenarios || [],
        model_accuracy: response.model_accuracy || 0,
        generated_at: response.timestamp || new Date().toISOString()
      } as PredictiveAnalytics;
    } catch (error) {
      console.error('Error predicting scan outcomes:', error);
      throw new Error(`Failed to predict scan outcomes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect scan anomalies
   */
  async detectScanAnomalies(
    request: {
      anomaly_types?: string[];
      detection_sensitivity?: string;
      time_window?: string;
      baseline_comparison?: boolean;
    }
  ): Promise<AnalyticsInsight[]> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.DETECT_SCAN_ANOMALIES,
        request
      );
      
      return (response.detected_anomalies || []).map((anomaly: any) => ({
        id: anomaly.anomaly_id || `anomaly_${Date.now()}`,
        type: 'anomaly_detection',
        priority: anomaly.severity || 'medium',
        title: anomaly.title || 'Scan Anomaly Detected',
        description: anomaly.description || '',
        confidence_score: anomaly.confidence_score || 0,
        anomaly_score: anomaly.anomaly_score || 0,
        affected_components: anomaly.affected_components || [],
        detection_method: anomaly.detection_method || 'statistical',
        recommendations: anomaly.recommendations || [],
        detected_at: anomaly.timestamp || new Date().toISOString()
      })) as AnalyticsInsight[];
    } catch (error) {
      console.error('Error detecting scan anomalies:', error);
      throw new Error(`Failed to detect scan anomalies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance insights from monitoring
   */
  async getPerformanceInsights(
    request: {
      insight_scope?: string;
      metrics?: string[];
      time_range?: { start: string; end: string };
      analysis_depth?: string;
    }
  ): Promise<PerformanceAnalytics> {
    try {
      const response = await this.apiClient.get<any>(
        ENDPOINTS.GET_PERFORMANCE_INSIGHTS,
        {
          params: {
            insight_scope: request.insight_scope || 'comprehensive',
            metrics: request.metrics?.join(','),
            start_time: request.time_range?.start,
            end_time: request.time_range?.end,
            analysis_depth: request.analysis_depth || 'standard'
          }
        }
      );
      
      return {
        analytics_id: response.insights_id || `perf_${Date.now()}`,
        analytics_type: 'performance',
        scope: request.insight_scope || 'comprehensive',
        metrics: response.performance_metrics || {},
        insights: response.insights || [],
        bottlenecks: response.bottlenecks || [],
        optimization_opportunities: response.optimization_opportunities || [],
        performance_trends: response.performance_trends || [],
        efficiency_score: response.efficiency_score || 0,
        generated_at: response.timestamp || new Date().toISOString()
      } as PerformanceAnalytics;
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw new Error(`Failed to get performance insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute predictive analysis
   */
  async executePredictiveAnalysis(
    request: {
      analysis_type?: string;
      prediction_models?: string[];
      data_sources?: string[];
      prediction_horizon?: string;
    }
  ): Promise<PredictiveAnalytics> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.EXECUTE_PREDICTIVE_ANALYSIS,
        request
      );
      
      return {
        prediction_id: response.analysis_id || `pred_analysis_${Date.now()}`,
        prediction_type: request.analysis_type || 'comprehensive',
        model_version: response.model_version || 'latest',
        predictions: response.predictions || [],
        confidence_scores: response.confidence_scores || {},
        prediction_horizon: response.prediction_horizon || request.prediction_horizon || '24h',
        model_accuracy: response.model_accuracy || 0,
        data_quality_score: response.data_quality_score || 0,
        generated_at: response.timestamp || new Date().toISOString()
      } as PredictiveAnalytics;
    } catch (error) {
      console.error('Error executing predictive analysis:', error);
      throw new Error(`Failed to execute predictive analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform contextual analysis
   */
  async performContextualAnalysis(
    request: {
      context_dimensions?: string[];
      analysis_depth?: string;
      cross_reference?: boolean;
      temporal_analysis?: boolean;
    }
  ): Promise<AnalyticsReport> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.PERFORM_CONTEXTUAL_ANALYSIS,
        request
      );
      
      return {
        report_id: response.analysis_id || `contextual_${Date.now()}`,
        report_type: 'contextual_analysis',
        scope: 'contextual',
        analytics_data: response.contextual_analysis || {},
        insights: response.contextual_insights || [],
        correlations: response.correlations || [],
        context_factors: response.context_factors || [],
        temporal_patterns: response.temporal_patterns || [],
        generated_at: response.timestamp || new Date().toISOString(),
        report_format: 'json'
      } as AnalyticsReport;
    } catch (error) {
      console.error('Error performing contextual analysis:', error);
      throw new Error(`Failed to perform contextual analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate intelligence reports
   */
  async generateIntelligenceReports(
    request: {
      report_type?: string;
      scope?: string;
      include_predictions?: boolean;
      include_recommendations?: boolean;
      format?: string;
    }
  ): Promise<AnalyticsReport> {
    try {
      const response = await this.apiClient.post<any>(
        ENDPOINTS.GENERATE_INTELLIGENCE_REPORTS,
        request
      );
      
      return {
        report_id: response.report_id || `intel_report_${Date.now()}`,
        report_type: request.report_type || 'intelligence',
        scope: request.scope || 'comprehensive',
        analytics_data: response.report_data || {},
        insights: response.intelligence_insights || [],
        recommendations: response.recommendations || [],
        executive_summary: response.executive_summary || '',
        detailed_findings: response.detailed_findings || [],
        generated_at: response.timestamp || new Date().toISOString(),
        report_format: request.format || 'json'
      } as AnalyticsReport;
    } catch (error) {
      console.error('Error generating intelligence reports:', error);
      throw new Error(`Failed to generate intelligence reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get monitoring analytics from monitoring service
   */
  async getMonitoringAnalytics(
    request: {
      analytics_type?: string;
      time_range?: { start: string; end: string };
      aggregation_level?: string;
    }
  ): Promise<AnalyticsReport> {
    try {
      const response = await this.apiClient.get<any>(
        ENDPOINTS.GET_MONITORING_ANALYTICS,
        {
          params: {
            analytics_type: request.analytics_type || 'comprehensive',
            start_time: request.time_range?.start,
            end_time: request.time_range?.end,
            aggregation_level: request.aggregation_level || 'detailed'
          }
        }
      );
      
      return {
        report_id: response.analytics_id || `monitoring_${Date.now()}`,
        report_type: 'monitoring_analytics',
        scope: 'monitoring',
        analytics_data: response.analytics_data || {},
        metrics: response.metrics || {},
        trends: response.trends || [],
        alerts: response.alerts || [],
        generated_at: response.timestamp || new Date().toISOString(),
        report_format: 'json'
      } as AnalyticsReport;
    } catch (error) {
      console.error('Error getting monitoring analytics:', error);
      throw new Error(`Failed to get monitoring analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trend analysis from monitoring service
   */
  async getTrendAnalysis(
    request: {
      metrics?: string[];
      timeRange?: { start: string; end: string };
      analysis_depth?: string;
    }
  ): Promise<TrendAnalysis> {
    try {
      const response = await this.apiClient.get<any>(
        ENDPOINTS.GET_TREND_ANALYSIS,
        {
          params: {
            metrics: request.metrics?.join(','),
            start_time: request.timeRange?.start,
            end_time: request.timeRange?.end,
            analysis_depth: request.analysis_depth || 'comprehensive'
          }
        }
      );
      
      return {
        analysis_id: response.trend_analysis_id || `trend_${Date.now()}`,
        analysis_type: 'trend_analysis',
        metrics_analyzed: request.metrics || [],
        time_range: request.timeRange || { start: '', end: '' },
        trends: response.trends || [],
        trend_direction: response.trend_direction || 'stable',
        trend_strength: response.trend_strength || 0,
        seasonality: response.seasonality || {},
        forecasts: response.forecasts || [],
        confidence_intervals: response.confidence_intervals || {},
        generated_at: response.timestamp || new Date().toISOString()
      } as TrendAnalysis;
    } catch (error) {
      console.error('Error getting trend analysis:', error);
      throw new Error(`Failed to get trend analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance metrics from monitoring service
   */
  async getPerformanceMetrics(
    request: {
      metrics?: string[];
      time_range?: { start: string; end: string };
      aggregation?: string;
    }
  ): Promise<PerformanceAnalytics> {
    try {
      const response = await this.apiClient.get<any>(
        ENDPOINTS.GET_PERFORMANCE_METRICS,
        {
          params: {
            metrics: request.metrics?.join(','),
            start_time: request.time_range?.start,
            end_time: request.time_range?.end,
            aggregation: request.aggregation || 'average'
          }
        }
      );
      
      return {
        analytics_id: response.metrics_id || `perf_metrics_${Date.now()}`,
        analytics_type: 'performance_metrics',
        scope: 'performance',
        metrics: response.metrics || {},
        performance_scores: response.performance_scores || {},
        efficiency_metrics: response.efficiency_metrics || {},
        resource_utilization: response.resource_utilization || {},
        throughput_analysis: response.throughput_analysis || {},
        latency_analysis: response.latency_analysis || {},
        generated_at: response.timestamp || new Date().toISOString()
      } as PerformanceAnalytics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const scanAnalyticsAPI = new ScanAnalyticsAPIService();
export default scanAnalyticsAPI;