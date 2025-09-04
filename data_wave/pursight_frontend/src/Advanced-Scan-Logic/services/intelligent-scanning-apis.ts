/**
 * 🧠 Intelligent Scanning APIs - Advanced Scan Logic
 * ==================================================
 * 
 * Comprehensive API integration for intelligent scanning logic operations
 * Maps to: backend/api/routes/intelligent_scanning_routes.py
 * 
 * Features:
 * - AI-powered scan workflow optimization
 * - Intelligent scan execution and monitoring  
 * - Cross-system scan logic coordination
 * - Enterprise-grade scan logic analytics
 * - Advanced pattern recognition and analysis
 * - Real-time scan intelligence insights
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib copie/api-client';
import {
  IntelligentScanLogicRequest,
  ScanLogicWorkflowRequest,
  ScanLogicOrchestrationRequest,
  ScanLogicAnalysisRequest,
  IntelligentScanResponse,
  ScanWorkflowResponse,
  ScanOrchestrationResponse,
  ScanAnalysisResponse,
  ScanIntelligenceInsight,
  ScanPrediction,
  ScanPatternAnalysis,
  RealTimeScanEvent,
  ScanLogicMetrics,
  IntelligentScanConfiguration,
  ScanLogicOptimization,
  CrossSystemCoordination,
  ScanLogicRecommendation,
  ScanIntelligenceReport
} from '../types/intelligence.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/scan-logic/intelligent-scanning';

const ENDPOINTS = {
  // Core intelligent scanning operations
  EXECUTE_INTELLIGENT_SCAN: `${API_BASE}/execute`,
  OPTIMIZE_SCAN_LOGIC: `${API_BASE}/optimize`,
  ANALYZE_SCAN_PATTERNS: `${API_BASE}/analyze`,
  COORDINATE_CROSS_SYSTEM: `${API_BASE}/coordinate`,
  
  // Workflow management
  CREATE_SCAN_WORKFLOW: `${API_BASE}/workflows/create`,
  EXECUTE_SCAN_WORKFLOW: `${API_BASE}/workflows/execute`,
  MONITOR_WORKFLOW_EXECUTION: `${API_BASE}/workflows/monitor`,
  OPTIMIZE_WORKFLOW_PERFORMANCE: `${API_BASE}/workflows/optimize`,
  
  // Orchestration operations
  ORCHESTRATE_SCAN_LOGIC: `${API_BASE}/orchestration/execute`,
  MANAGE_RESOURCE_ALLOCATION: `${API_BASE}/orchestration/resources`,
  COORDINATE_PRIORITY_MANAGEMENT: `${API_BASE}/orchestration/priorities`,
  MONITOR_ORCHESTRATION_HEALTH: `${API_BASE}/orchestration/health`,
  
  // Intelligence and analytics
  GENERATE_SCAN_INTELLIGENCE: `${API_BASE}/intelligence/generate`,
  ANALYZE_SCAN_BEHAVIOR: `${API_BASE}/intelligence/behavior`,
  PREDICT_SCAN_OUTCOMES: `${API_BASE}/intelligence/predictions`,
  DETECT_SCAN_ANOMALIES: `${API_BASE}/intelligence/anomalies`,
  
  // Real-time monitoring
  STREAM_REAL_TIME_EVENTS: `${API_BASE}/monitoring/stream`,
  GET_LIVE_METRICS: `${API_BASE}/monitoring/metrics`,
  SUBSCRIBE_TO_ALERTS: `${API_BASE}/monitoring/alerts`,
  GET_PERFORMANCE_INSIGHTS: `${API_BASE}/monitoring/insights`,
  
  // Configuration and optimization
  UPDATE_SCAN_CONFIGURATION: `${API_BASE}/configuration/update`,
  GET_OPTIMIZATION_RECOMMENDATIONS: `${API_BASE}/optimization/recommendations`,
  APPLY_ML_OPTIMIZATIONS: `${API_BASE}/optimization/ml-apply`,
  VALIDATE_SCAN_LOGIC: `${API_BASE}/validation/validate`,
  
  // Advanced features
  EXECUTE_PREDICTIVE_ANALYSIS: `${API_BASE}/advanced/predictive`,
  PERFORM_CONTEXTUAL_ANALYSIS: `${API_BASE}/advanced/contextual`,
  GENERATE_INTELLIGENCE_REPORTS: `${API_BASE}/advanced/reports`,
  COORDINATE_ENTERPRISE_SCANS: `${API_BASE}/advanced/enterprise`
} as const;

/**
 * Intelligent Scanning API Service Class
 * Provides comprehensive integration with intelligent scanning backend
 */
export class IntelligentScanningAPIService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ==================== Core Intelligent Scanning Operations ====================

  /**
   * Execute intelligent scan logic with AI optimization
   */
  async executeIntelligentScan(
    request: IntelligentScanLogicRequest
  ): Promise<IntelligentScanResponse> {
    try {
      const response = await this.apiClient.post<IntelligentScanResponse>(
        ENDPOINTS.EXECUTE_INTELLIGENT_SCAN,
        request
      );

      return {
        ...response,
        execution_id: response.execution_id || `exec_${Date.now()}`,
        intelligence_insights: response.intelligence_insights || [],
        optimization_applied: response.optimization_applied || false,
        performance_metrics: response.performance_metrics || {},
        execution_timestamp: response.execution_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error executing intelligent scan:', error);
      throw new Error(`Failed to execute intelligent scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Optimize scan logic using AI and ML algorithms
   */
  async optimizeScanLogic(
    optimization_request: ScanLogicOptimization
  ): Promise<ScanLogicOptimization> {
    try {
      const response = await this.apiClient.post<ScanLogicOptimization>(
        ENDPOINTS.OPTIMIZE_SCAN_LOGIC,
        optimization_request
      );

      return {
        ...response,
        optimization_id: response.optimization_id || `opt_${Date.now()}`,
        applied_optimizations: response.applied_optimizations || [],
        performance_improvement: response.performance_improvement || 0,
        optimization_timestamp: response.optimization_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error optimizing scan logic:', error);
      throw new Error(`Failed to optimize scan logic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze scan patterns with advanced intelligence
   */
  async analyzeScanPatterns(
    analysis_request: ScanLogicAnalysisRequest
  ): Promise<ScanPatternAnalysis> {
    try {
      const response = await this.apiClient.post<ScanPatternAnalysis>(
        ENDPOINTS.ANALYZE_SCAN_PATTERNS,
        analysis_request
      );

      return {
        ...response,
        analysis_id: response.analysis_id || `analysis_${Date.now()}`,
        detected_patterns: response.detected_patterns || [],
        intelligence_insights: response.intelligence_insights || [],
        recommendations: response.recommendations || [],
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing scan patterns:', error);
      throw new Error(`Failed to analyze scan patterns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Coordinate cross-system scan operations
   */
  async coordinateCrossSystemScans(
    coordination_request: CrossSystemCoordination
  ): Promise<CrossSystemCoordination> {
    try {
      const response = await this.apiClient.post<CrossSystemCoordination>(
        ENDPOINTS.COORDINATE_CROSS_SYSTEM,
        coordination_request
      );

      return {
        ...response,
        coordination_id: response.coordination_id || `coord_${Date.now()}`,
        coordinated_systems: response.coordinated_systems || [],
        coordination_status: response.coordination_status || 'pending',
        coordination_timestamp: response.coordination_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error coordinating cross-system scans:', error);
      throw new Error(`Failed to coordinate cross-system scans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Workflow Management Operations ====================

  /**
   * Create intelligent scan workflow
   */
  async createScanWorkflow(
    workflow_request: ScanLogicWorkflowRequest
  ): Promise<ScanWorkflowResponse> {
    try {
      const response = await this.apiClient.post<ScanWorkflowResponse>(
        ENDPOINTS.CREATE_SCAN_WORKFLOW,
        workflow_request
      );

      return {
        ...response,
        workflow_id: response.workflow_id || `workflow_${Date.now()}`,
        workflow_steps: response.workflow_steps || [],
        estimated_duration: response.estimated_duration || 0,
        creation_timestamp: response.creation_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating scan workflow:', error);
      throw new Error(`Failed to create scan workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute scan workflow with intelligent coordination
   */
  async executeScanWorkflow(
    workflow_id: string,
    execution_parameters?: Record<string, any>
  ): Promise<ScanWorkflowResponse> {
    try {
      const response = await this.apiClient.post<ScanWorkflowResponse>(
        `${ENDPOINTS.EXECUTE_SCAN_WORKFLOW}/${workflow_id}`,
        { execution_parameters: execution_parameters || {} }
      );

      return {
        ...response,
        execution_id: response.execution_id || `exec_${Date.now()}`,
        execution_status: response.execution_status || 'running',
        progress_percentage: response.progress_percentage || 0,
        execution_timestamp: response.execution_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error executing scan workflow:', error);
      throw new Error(`Failed to execute scan workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Monitor workflow execution in real-time
   */
  async monitorWorkflowExecution(
    workflow_id: string
  ): Promise<ScanWorkflowResponse> {
    try {
      const response = await this.apiClient.get<ScanWorkflowResponse>(
        `${ENDPOINTS.MONITOR_WORKFLOW_EXECUTION}/${workflow_id}`
      );

      return {
        ...response,
        current_step: response.current_step || 0,
        progress_percentage: response.progress_percentage || 0,
        execution_metrics: response.execution_metrics || {},
        monitoring_timestamp: response.monitoring_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error monitoring workflow execution:', error);
      throw new Error(`Failed to monitor workflow execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Optimize workflow performance using AI
   */
  async optimizeWorkflowPerformance(
    workflow_id: string,
    optimization_goals: string[]
  ): Promise<ScanLogicOptimization> {
    try {
      const response = await this.apiClient.post<ScanLogicOptimization>(
        `${ENDPOINTS.OPTIMIZE_WORKFLOW_PERFORMANCE}/${workflow_id}`,
        { optimization_goals }
      );

      return {
        ...response,
        optimization_id: response.optimization_id || `opt_${Date.now()}`,
        applied_optimizations: response.applied_optimizations || [],
        performance_improvement: response.performance_improvement || 0,
        optimization_timestamp: response.optimization_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error optimizing workflow performance:', error);
      throw new Error(`Failed to optimize workflow performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Orchestration Operations ====================

  /**
   * Orchestrate scan logic with enterprise coordination
   */
  async orchestrateScanLogic(
    orchestration_request: ScanLogicOrchestrationRequest
  ): Promise<ScanOrchestrationResponse> {
    try {
      const response = await this.apiClient.post<ScanOrchestrationResponse>(
        ENDPOINTS.ORCHESTRATE_SCAN_LOGIC,
        orchestration_request
      );

      return {
        ...response,
        orchestration_id: response.orchestration_id || `orch_${Date.now()}`,
        resource_allocation: response.resource_allocation || {},
        priority_management: response.priority_management || {},
        orchestration_timestamp: response.orchestration_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error orchestrating scan logic:', error);
      throw new Error(`Failed to orchestrate scan logic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Manage resource allocation for scan operations
   */
  async manageResourceAllocation(
    allocation_request: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.post<Record<string, any>>(
        ENDPOINTS.MANAGE_RESOURCE_ALLOCATION,
        allocation_request
      );

      return {
        ...response,
        allocation_id: response.allocation_id || `alloc_${Date.now()}`,
        allocated_resources: response.allocated_resources || {},
        allocation_efficiency: response.allocation_efficiency || 0,
        allocation_timestamp: response.allocation_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error managing resource allocation:', error);
      throw new Error(`Failed to manage resource allocation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Coordinate priority management across scans
   */
  async coordinatePriorityManagement(
    priority_request: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.post<Record<string, any>>(
        ENDPOINTS.COORDINATE_PRIORITY_MANAGEMENT,
        priority_request
      );

      return {
        ...response,
        priority_id: response.priority_id || `priority_${Date.now()}`,
        priority_assignments: response.priority_assignments || {},
        coordination_effectiveness: response.coordination_effectiveness || 0,
        priority_timestamp: response.priority_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error coordinating priority management:', error);
      throw new Error(`Failed to coordinate priority management: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Monitor orchestration health and performance
   */
  async monitorOrchestrationHealth(): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.get<Record<string, any>>(
        ENDPOINTS.MONITOR_ORCHESTRATION_HEALTH
      );

      return {
        ...response,
        health_status: response.health_status || 'unknown',
        performance_metrics: response.performance_metrics || {},
        active_orchestrations: response.active_orchestrations || 0,
        health_timestamp: response.health_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error monitoring orchestration health:', error);
      throw new Error(`Failed to monitor orchestration health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Intelligence and Analytics Operations ====================

  /**
   * Generate comprehensive scan intelligence
   */
  async generateScanIntelligence(
    intelligence_request: Record<string, any>
  ): Promise<ScanIntelligenceInsight[]> {
    try {
      const response = await this.apiClient.post<ScanIntelligenceInsight[]>(
        ENDPOINTS.GENERATE_SCAN_INTELLIGENCE,
        intelligence_request
      );

      return response.map(insight => ({
        ...insight,
        insight_id: insight.insight_id || `insight_${Date.now()}_${Math.random()}`,
        confidence_score: insight.confidence_score || 0,
        intelligence_type: insight.intelligence_type || 'general',
        generated_timestamp: insight.generated_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error generating scan intelligence:', error);
      throw new Error(`Failed to generate scan intelligence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze scan behavior patterns
   */
  async analyzeScanBehavior(
    behavior_request: Record<string, any>
  ): Promise<ScanPatternAnalysis> {
    try {
      const response = await this.apiClient.post<ScanPatternAnalysis>(
        ENDPOINTS.ANALYZE_SCAN_BEHAVIOR,
        behavior_request
      );

      return {
        ...response,
        analysis_id: response.analysis_id || `behavior_${Date.now()}`,
        behavior_patterns: response.behavior_patterns || [],
        anomaly_indicators: response.anomaly_indicators || [],
        behavior_score: response.behavior_score || 0,
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing scan behavior:', error);
      throw new Error(`Failed to analyze scan behavior: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Predict scan outcomes using ML models
   */
  async predictScanOutcomes(
    prediction_request: Record<string, any>
  ): Promise<ScanPrediction[]> {
    try {
      const response = await this.apiClient.post<ScanPrediction[]>(
        ENDPOINTS.PREDICT_SCAN_OUTCOMES,
        prediction_request
      );

      return response.map(prediction => ({
        ...prediction,
        prediction_id: prediction.prediction_id || `pred_${Date.now()}_${Math.random()}`,
        confidence_level: prediction.confidence_level || 0,
        prediction_accuracy: prediction.prediction_accuracy || 0,
        prediction_timestamp: prediction.prediction_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error predicting scan outcomes:', error);
      throw new Error(`Failed to predict scan outcomes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect scan anomalies using advanced algorithms
   */
  async detectScanAnomalies(
    anomaly_request: Record<string, any>
  ): Promise<Record<string, any>[]> {
    try {
      const response = await this.apiClient.post<Record<string, any>[]>(
        ENDPOINTS.DETECT_SCAN_ANOMALIES,
        anomaly_request
      );

      return response.map(anomaly => ({
        ...anomaly,
        anomaly_id: anomaly.anomaly_id || `anomaly_${Date.now()}_${Math.random()}`,
        severity_level: anomaly.severity_level || 'low',
        anomaly_score: anomaly.anomaly_score || 0,
        detection_timestamp: anomaly.detection_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error detecting scan anomalies:', error);
      throw new Error(`Failed to detect scan anomalies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Real-time Monitoring Operations ====================

  /**
   * Stream real-time scan events
   */
  async streamRealTimeEvents(
    stream_config: Record<string, any>
  ): Promise<AsyncGenerator<RealTimeScanEvent, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<RealTimeScanEvent>(
        ENDPOINTS.STREAM_REAL_TIME_EVENTS,
        stream_config
      );

      return response;
    } catch (error) {
      console.error('Error streaming real-time events:', error);
      throw new Error(`Failed to stream real-time events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get live performance metrics
   */
  async getLiveMetrics(
    metrics_request?: Record<string, any>
  ): Promise<ScanLogicMetrics> {
    try {
      const response = await this.apiClient.get<ScanLogicMetrics>(
        ENDPOINTS.GET_LIVE_METRICS,
        { params: metrics_request }
      );

      return {
        ...response,
        metrics_id: response.metrics_id || `metrics_${Date.now()}`,
        collection_timestamp: response.collection_timestamp || new Date().toISOString(),
        metrics_accuracy: response.metrics_accuracy || 0,
        real_time_indicators: response.real_time_indicators || {}
      };
    } catch (error) {
      console.error('Error getting live metrics:', error);
      throw new Error(`Failed to get live metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Subscribe to intelligent alerts
   */
  async subscribeToAlerts(
    alert_config: Record<string, any>
  ): Promise<AsyncGenerator<Record<string, any>, void, unknown>> {
    try {
      const response = await this.apiClient.getStream<Record<string, any>>(
        ENDPOINTS.SUBSCRIBE_TO_ALERTS,
        alert_config
      );

      return response;
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      throw new Error(`Failed to subscribe to alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance insights and recommendations
   */
  async getPerformanceInsights(
    insights_request?: Record<string, any>
  ): Promise<ScanLogicRecommendation[]> {
    try {
      const response = await this.apiClient.get<ScanLogicRecommendation[]>(
        ENDPOINTS.GET_PERFORMANCE_INSIGHTS,
        { params: insights_request }
      );

      return response.map(insight => ({
        ...insight,
        recommendation_id: insight.recommendation_id || `rec_${Date.now()}_${Math.random()}`,
        priority_level: insight.priority_level || 'medium',
        expected_impact: insight.expected_impact || 0,
        insight_timestamp: insight.insight_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw new Error(`Failed to get performance insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Configuration and Optimization Operations ====================

  /**
   * Update intelligent scan configuration
   */
  async updateScanConfiguration(
    config_update: IntelligentScanConfiguration
  ): Promise<IntelligentScanConfiguration> {
    try {
      const response = await this.apiClient.patch<IntelligentScanConfiguration>(
        ENDPOINTS.UPDATE_SCAN_CONFIGURATION,
        config_update
      );

      return {
        ...response,
        configuration_id: response.configuration_id || `config_${Date.now()}`,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        configuration_version: response.configuration_version || '1.0.0',
        validation_status: response.validation_status || 'pending'
      };
    } catch (error) {
      console.error('Error updating scan configuration:', error);
      throw new Error(`Failed to update scan configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get AI-powered optimization recommendations
   */
  async getOptimizationRecommendations(
    optimization_scope?: string
  ): Promise<ScanLogicRecommendation[]> {
    try {
      const response = await this.apiClient.get<ScanLogicRecommendation[]>(
        ENDPOINTS.GET_OPTIMIZATION_RECOMMENDATIONS,
        { params: { scope: optimization_scope } }
      );

      return response.map(recommendation => ({
        ...recommendation,
        recommendation_id: recommendation.recommendation_id || `opt_rec_${Date.now()}_${Math.random()}`,
        confidence_score: recommendation.confidence_score || 0,
        implementation_complexity: recommendation.implementation_complexity || 'medium',
        recommendation_timestamp: recommendation.recommendation_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      throw new Error(`Failed to get optimization recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply ML-based optimizations
   */
  async applyMLOptimizations(
    ml_optimization_request: Record<string, any>
  ): Promise<ScanLogicOptimization> {
    try {
      const response = await this.apiClient.post<ScanLogicOptimization>(
        ENDPOINTS.APPLY_ML_OPTIMIZATIONS,
        ml_optimization_request
      );

      return {
        ...response,
        optimization_id: response.optimization_id || `ml_opt_${Date.now()}`,
        ml_model_used: response.ml_model_used || 'default',
        optimization_effectiveness: response.optimization_effectiveness || 0,
        optimization_timestamp: response.optimization_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error applying ML optimizations:', error);
      throw new Error(`Failed to apply ML optimizations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate scan logic configuration
   */
  async validateScanLogic(
    validation_request: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.post<Record<string, any>>(
        ENDPOINTS.VALIDATE_SCAN_LOGIC,
        validation_request
      );

      return {
        ...response,
        validation_id: response.validation_id || `validation_${Date.now()}`,
        validation_status: response.validation_status || 'pending',
        validation_errors: response.validation_errors || [],
        validation_timestamp: response.validation_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error validating scan logic:', error);
      throw new Error(`Failed to validate scan logic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Advanced Features ====================

  /**
   * Execute predictive analysis with advanced ML
   */
  async executePredictiveAnalysis(
    predictive_request: Record<string, any>
  ): Promise<ScanAnalysisResponse> {
    try {
      const response = await this.apiClient.post<ScanAnalysisResponse>(
        ENDPOINTS.EXECUTE_PREDICTIVE_ANALYSIS,
        predictive_request
      );

      return {
        ...response,
        analysis_id: response.analysis_id || `predictive_${Date.now()}`,
        prediction_accuracy: response.prediction_accuracy || 0,
        predictive_insights: response.predictive_insights || [],
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error executing predictive analysis:', error);
      throw new Error(`Failed to execute predictive analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform contextual analysis with AI
   */
  async performContextualAnalysis(
    contextual_request: Record<string, any>
  ): Promise<ScanAnalysisResponse> {
    try {
      const response = await this.apiClient.post<ScanAnalysisResponse>(
        ENDPOINTS.PERFORM_CONTEXTUAL_ANALYSIS,
        contextual_request
      );

      return {
        ...response,
        analysis_id: response.analysis_id || `contextual_${Date.now()}`,
        contextual_insights: response.contextual_insights || [],
        context_relevance: response.context_relevance || 0,
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error performing contextual analysis:', error);
      throw new Error(`Failed to perform contextual analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate comprehensive intelligence reports
   */
  async generateIntelligenceReports(
    report_request: Record<string, any>
  ): Promise<ScanIntelligenceReport[]> {
    try {
      const response = await this.apiClient.post<ScanIntelligenceReport[]>(
        ENDPOINTS.GENERATE_INTELLIGENCE_REPORTS,
        report_request
      );

      return response.map(report => ({
        ...report,
        report_id: report.report_id || `intel_report_${Date.now()}_${Math.random()}`,
        report_type: report.report_type || 'comprehensive',
        generation_timestamp: report.generation_timestamp || new Date().toISOString(),
        report_accuracy: report.report_accuracy || 0
      }));
    } catch (error) {
      console.error('Error generating intelligence reports:', error);
      throw new Error(`Failed to generate intelligence reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Coordinate enterprise-wide scan operations
   */
  async coordinateEnterpriseScans(
    enterprise_request: Record<string, any>
  ): Promise<CrossSystemCoordination> {
    try {
      const response = await this.apiClient.post<CrossSystemCoordination>(
        ENDPOINTS.COORDINATE_ENTERPRISE_SCANS,
        enterprise_request
      );

      return {
        ...response,
        coordination_id: response.coordination_id || `enterprise_${Date.now()}`,
        enterprise_scope: response.enterprise_scope || 'global',
        coordination_effectiveness: response.coordination_effectiveness || 0,
        coordination_timestamp: response.coordination_timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error coordinating enterprise scans:', error);
      throw new Error(`Failed to coordinate enterprise scans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Health check for intelligent scanning service
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
      console.error('Error checking service health:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: { intelligent_scanning: 'error' }
      };
    }
  }

  /**
   * Get service capabilities and features
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
      console.error('Error getting service capabilities:', error);
      throw new Error(`Failed to get service capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const intelligentScanningAPI = new IntelligentScanningAPIService();

// Export individual methods for tree-shaking
export const {
  executeIntelligentScan,
  optimizeScanLogic,
  analyzeScanPatterns,
  coordinateCrossSystemScans,
  createScanWorkflow,
  executeScanWorkflow,
  monitorWorkflowExecution,
  optimizeWorkflowPerformance,
  orchestrateScanLogic,
  manageResourceAllocation,
  coordinatePriorityManagement,
  monitorOrchestrationHealth,
  generateScanIntelligence,
  analyzeScanBehavior,
  predictScanOutcomes,
  detectScanAnomalies,
  streamRealTimeEvents,
  getLiveMetrics,
  subscribeToAlerts,
  getPerformanceInsights,
  updateScanConfiguration,
  getOptimizationRecommendations,
  applyMLOptimizations,
  validateScanLogic,
  executePredictiveAnalysis,
  performContextualAnalysis,
  generateIntelligenceReports,
  coordinateEnterpriseScans,
  healthCheck,
  getServiceCapabilities
} = intelligentScanningAPI;

export default intelligentScanningAPI;