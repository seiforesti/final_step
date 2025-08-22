/**
 * ⚡ Scan Optimization APIs - Advanced Scan Logic
 * =============================================
 * 
 * Comprehensive API integration for scan optimization operations
 * Maps to: backend/api/routes/scan_optimization_routes.py
 * 
 * Features:
 * - Advanced scan performance optimization
 * - Intelligent resource allocation and scheduling
 * - AI-powered optimization algorithms and strategies
 * - Real-time optimization monitoring and analytics
 * - Enterprise optimization workflows and management
 * - Predictive optimization and cost analysis
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib/api-client';
import {
  OptimizationRecommendation,
  OptimizationState,
  ExpectedImprovement,
  ImplementationPlan,
  OptimizationRisk,
  OptimizationType,
  OptimizationStatus,
  OptimizationScope,
  OptimizationPriority,
  PerformanceBaseline,
  ResourceOptimization,
  CostOptimization,
  OptimizationMetrics
} from '../types/optimization.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/scan-optimization';

// Request types based on backend models
interface OptimizationRequest {
  optimization_type: string;
  target_scope?: string;
  target_ids?: string[];
  optimization_goals: Record<string, number>;
  constraints?: Record<string, any>;
  auto_apply?: boolean;
  dry_run?: boolean;
}

interface PerformanceAnalysisRequest {
  analysis_scope?: string;
  timeframe?: string;
  include_bottlenecks?: boolean;
  include_predictions?: boolean;
  detail_level?: string;
}

interface ResourceOptimizationRequest {
  resource_types: string[];
  allocation_strategy?: string;
  priority_weights?: Record<string, number>;
  efficiency_targets: Record<string, number>;
}

interface OptimizationScheduleRequest {
  optimization_frequency?: string;
  maintenance_windows: Record<string, string>[];
  auto_optimization?: boolean;
  notification_settings: Record<string, boolean>;
}

/**
 * Scan Optimization API Service Class
 * Provides comprehensive integration with scan optimization backend
 */
export class ScanOptimizationAPIService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor() {
    this.apiClient = new ApiClient();
    this.baseUrl = '/api/v1/scan-optimization';
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

  // ==================== OPTIMIZATION ANALYSIS ====================

  /**
   * Perform comprehensive optimization analysis
   * Maps to: POST /scan-optimization/analyze
   * Backend: scan_optimization_routes.py -> analyze_optimization_opportunities
   */
  async analyzeOptimizationOpportunities(request: OptimizationRequest): Promise<{
    analysis_id: string;
    recommendations: OptimizationRecommendation[];
    expected_improvements: ExpectedImprovement[];
    implementation_plans: ImplementationPlan[];
    risk_assessments: OptimizationRisk[];
    cost_benefit_analysis: any;
  }> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
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
   * Get optimization recommendations
   * Maps to: GET /scan-optimization/recommendations
   * Backend: scan_optimization_routes.py -> get_optimization_recommendations
   */
  async getOptimizationRecommendations(params: {
    optimization_type?: OptimizationType[];
    priority_filter?: OptimizationPriority[];
    scope?: OptimizationScope;
    status?: OptimizationStatus[];
    implementation_difficulty?: string[];
  } = {}): Promise<{
    recommendations: OptimizationRecommendation[];
    prioritized_list: any[];
    quick_wins: OptimizationRecommendation[];
    high_impact_items: OptimizationRecommendation[];
    summary: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.optimization_type) {
      params.optimization_type.forEach(type => queryParams.append('optimization_type', type));
    }
    if (params.priority_filter) {
      params.priority_filter.forEach(priority => queryParams.append('priority_filter', priority));
    }
    if (params.scope) queryParams.append('scope', params.scope);
    if (params.status) {
      params.status.forEach(status => queryParams.append('status', status));
    }
    if (params.implementation_difficulty) {
      params.implementation_difficulty.forEach(diff => queryParams.append('implementation_difficulty', diff));
    }

    const response = await fetch(`${this.baseUrl}/recommendations?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get optimization status overview
   * Maps to: GET /scan-optimization/status
   * Backend: scan_optimization_routes.py -> get_optimization_status
   */
  async getOptimizationStatus(): Promise<{
    overall_status: OptimizationState;
    active_optimizations: any[];
    completed_optimizations: any[];
    pending_optimizations: any[];
    optimization_metrics: OptimizationMetrics;
    performance_trends: any;
  }> {
    const response = await fetch(`${this.baseUrl}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== PERFORMANCE OPTIMIZATION ====================

  /**
   * Analyze performance for optimization opportunities
   * Maps to: POST /scan-optimization/performance/analyze
   * Backend: scan_optimization_routes.py -> analyze_performance_optimization
   */
  async analyzePerformanceOptimization(request: PerformanceAnalysisRequest): Promise<{
    performance_analysis: any;
    bottleneck_identification: any[];
    optimization_targets: any[];
    performance_predictions: any;
    resource_recommendations: ResourceOptimization[];
  }> {
    const response = await fetch(`${this.baseUrl}/performance/analyze`, {
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
   * Maps to: POST /scan-optimization/performance/apply
   * Backend: scan_optimization_routes.py -> apply_performance_optimization
   */
  async applyPerformanceOptimization(optimizationId: string, params: {
    auto_rollback?: boolean;
    monitoring_period?: string;
    success_criteria?: Record<string, any>;
  } = {}): Promise<{
    application_id: string;
    applied_optimizations: any[];
    monitoring_plan: any;
    rollback_strategy: any;
    expected_timeline: any;
  }> {
    const response = await fetch(`${this.baseUrl}/performance/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ optimization_id: optimizationId, ...params })
    });

    return this.handleResponse(response);
  }

  /**
   * Get performance baselines
   * Maps to: GET /scan-optimization/performance/baselines
   * Backend: scan_optimization_routes.py -> get_performance_baselines
   */
  async getPerformanceBaselines(params: {
    baseline_type?: string[];
    time_range?: string;
    include_comparisons?: boolean;
  } = {}): Promise<{
    baselines: PerformanceBaseline[];
    current_performance: any;
    performance_gaps: any[];
    improvement_potential: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.baseline_type) {
      params.baseline_type.forEach(type => queryParams.append('baseline_type', type));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.include_comparisons !== undefined) queryParams.append('include_comparisons', params.include_comparisons.toString());

    const response = await fetch(`${this.baseUrl}/performance/baselines?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== RESOURCE OPTIMIZATION ====================

  /**
   * Optimize resource allocation
   * Maps to: POST /scan-optimization/resources/optimize
   * Backend: scan_optimization_routes.py -> optimize_resource_allocation
   */
  async optimizeResourceAllocation(request: ResourceOptimizationRequest): Promise<{
    optimization_id: string;
    resource_reallocation: any;
    efficiency_improvements: any;
    cost_savings: CostOptimization;
    implementation_steps: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/resources/optimize`, {
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
   * Get resource utilization analysis
   * Maps to: GET /scan-optimization/resources/utilization
   * Backend: scan_optimization_routes.py -> get_resource_utilization_analysis
   */
  async getResourceUtilizationAnalysis(params: {
    resource_types?: string[];
    analysis_period?: string;
    include_forecasts?: boolean;
    granularity?: string;
  } = {}): Promise<{
    utilization_metrics: any;
    efficiency_scores: any;
    underutilized_resources: any[];
    overutilized_resources: any[];
    optimization_opportunities: ResourceOptimization[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.resource_types) {
      params.resource_types.forEach(type => queryParams.append('resource_types', type));
    }
    if (params.analysis_period) queryParams.append('analysis_period', params.analysis_period);
    if (params.include_forecasts !== undefined) queryParams.append('include_forecasts', params.include_forecasts.toString());
    if (params.granularity) queryParams.append('granularity', params.granularity);

    const response = await fetch(`${this.baseUrl}/resources/utilization?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get resource scaling recommendations
   * Maps to: GET /scan-optimization/resources/scaling
   * Backend: scan_optimization_routes.py -> get_resource_scaling_recommendations
   */
  async getResourceScalingRecommendations(params: {
    forecast_horizon?: string;
    scaling_triggers?: string[];
    cost_constraints?: Record<string, number>;
  } = {}): Promise<{
    scaling_recommendations: any[];
    cost_impact_analysis: CostOptimization;
    implementation_timeline: any;
    risk_assessment: OptimizationRisk[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.forecast_horizon) queryParams.append('forecast_horizon', params.forecast_horizon);
    if (params.scaling_triggers) {
      params.scaling_triggers.forEach(trigger => queryParams.append('scaling_triggers', trigger));
    }

    const response = await fetch(`${this.baseUrl}/resources/scaling?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ cost_constraints: params.cost_constraints })
    });

    return this.handleResponse(response);
  }

  // ==================== COST OPTIMIZATION ====================

  /**
   * Analyze cost optimization opportunities
   * Maps to: POST /scan-optimization/costs/analyze
   * Backend: scan_optimization_routes.py -> analyze_cost_optimization
   */
  async analyzeCostOptimization(request: {
    analysis_scope: OptimizationScope;
    cost_categories?: string[];
    optimization_targets?: Record<string, number>;
    time_horizon?: string;
  }): Promise<{
    cost_analysis: any;
    savings_opportunities: CostOptimization[];
    roi_projections: any;
    implementation_costs: any;
    payback_periods: any;
  }> {
    const response = await fetch(`${this.baseUrl}/costs/analyze`, {
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
   * Get cost savings recommendations
   * Maps to: GET /scan-optimization/costs/savings
   * Backend: scan_optimization_routes.py -> get_cost_savings_recommendations
   */
  async getCostSavingsRecommendations(params: {
    cost_categories?: string[];
    savings_threshold?: number;
    implementation_effort?: string[];
    risk_tolerance?: string;
  } = {}): Promise<{
    savings_recommendations: CostOptimization[];
    quick_savings: CostOptimization[];
    long_term_savings: CostOptimization[];
    total_potential_savings: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.cost_categories) {
      params.cost_categories.forEach(cat => queryParams.append('cost_categories', cat));
    }
    if (params.savings_threshold) queryParams.append('savings_threshold', params.savings_threshold.toString());
    if (params.implementation_effort) {
      params.implementation_effort.forEach(effort => queryParams.append('implementation_effort', effort));
    }
    if (params.risk_tolerance) queryParams.append('risk_tolerance', params.risk_tolerance);

    const response = await fetch(`${this.baseUrl}/costs/savings?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== OPTIMIZATION SCHEDULING ====================

  /**
   * Schedule optimization execution
   * Maps to: POST /scan-optimization/schedule
   * Backend: scan_optimization_routes.py -> schedule_optimization
   */
  async scheduleOptimization(request: OptimizationScheduleRequest): Promise<{
    schedule_id: string;
    optimization_schedule: any;
    execution_plan: any;
    notification_setup: any;
  }> {
    const response = await fetch(`${this.baseUrl}/schedule`, {
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
   * Get optimization schedules
   * Maps to: GET /scan-optimization/schedules
   * Backend: scan_optimization_routes.py -> get_optimization_schedules
   */
  async getOptimizationSchedules(params: {
    schedule_status?: string[];
    optimization_types?: OptimizationType[];
    upcoming_only?: boolean;
  } = {}): Promise<{
    schedules: any[];
    upcoming_optimizations: any[];
    active_schedules: any[];
    schedule_conflicts: any[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.schedule_status) {
      params.schedule_status.forEach(status => queryParams.append('schedule_status', status));
    }
    if (params.optimization_types) {
      params.optimization_types.forEach(type => queryParams.append('optimization_types', type));
    }
    if (params.upcoming_only !== undefined) queryParams.append('upcoming_only', params.upcoming_only.toString());

    const response = await fetch(`${this.baseUrl}/schedules?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== OPTIMIZATION EXECUTION ====================

  /**
   * Execute optimization recommendation
   * Maps to: POST /scan-optimization/execute/{recommendation_id}
   * Backend: scan_optimization_routes.py -> execute_optimization
   */
  async executeOptimization(recommendationId: string, params: {
    execution_mode?: 'immediate' | 'scheduled' | 'staged';
    validation_checks?: boolean;
    rollback_plan?: any;
    monitoring_config?: any;
  } = {}): Promise<{
    execution_id: string;
    execution_status: OptimizationStatus;
    progress_tracking: any;
    estimated_completion: string;
    monitoring_endpoints: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/execute/${recommendationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(params)
    });

    return this.handleResponse(response);
  }

  /**
   * Monitor optimization execution
   * Maps to: GET /scan-optimization/executions/{execution_id}
   * Backend: scan_optimization_routes.py -> monitor_optimization_execution
   */
  async monitorOptimizationExecution(executionId: string): Promise<{
    execution_id: string;
    current_status: OptimizationStatus;
    progress_percentage: number;
    performance_impact: any;
    issues_encountered: any[];
    next_steps: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/executions/${executionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Rollback optimization
   * Maps to: POST /scan-optimization/executions/{execution_id}/rollback
   * Backend: scan_optimization_routes.py -> rollback_optimization
   */
  async rollbackOptimization(executionId: string, reason?: string): Promise<{
    rollback_id: string;
    rollback_status: string;
    restored_state: any;
    rollback_impact: any;
  }> {
    const response = await fetch(`${this.baseUrl}/executions/${executionId}/rollback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ reason })
    });

    return this.handleResponse(response);
  }

  // ==================== OPTIMIZATION METRICS ====================

  /**
   * Get optimization metrics
   * Maps to: GET /scan-optimization/metrics
   * Backend: scan_optimization_routes.py -> get_optimization_metrics
   */
  async getOptimizationMetrics(params: {
    metric_types?: string[];
    time_range?: string;
    aggregation_level?: string;
    include_trends?: boolean;
  } = {}): Promise<{
    metrics: OptimizationMetrics;
    performance_improvements: any;
    cost_savings_realized: any;
    efficiency_gains: any;
    optimization_roi: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.metric_types) {
      params.metric_types.forEach(type => queryParams.append('metric_types', type));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.aggregation_level) queryParams.append('aggregation_level', params.aggregation_level);
    if (params.include_trends !== undefined) queryParams.append('include_trends', params.include_trends.toString());

    const response = await fetch(`${this.baseUrl}/metrics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get optimization impact analysis
   * Maps to: GET /scan-optimization/impact
   * Backend: scan_optimization_routes.py -> get_optimization_impact
   */
  async getOptimizationImpact(params: {
    optimization_ids?: string[];
    impact_categories?: string[];
    time_range?: string;
  } = {}): Promise<{
    impact_analysis: any;
    performance_improvements: any;
    resource_savings: any;
    business_value: any;
    user_experience_impact: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.optimization_ids) {
      params.optimization_ids.forEach(id => queryParams.append('optimization_ids', id));
    }
    if (params.impact_categories) {
      params.impact_categories.forEach(cat => queryParams.append('impact_categories', cat));
    }
    if (params.time_range) queryParams.append('time_range', params.time_range);

    const response = await fetch(`${this.baseUrl}/impact?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  // ==================== REAL-TIME OPTIMIZATION ====================

  /**
   * Subscribe to optimization updates
   * Maps to: WebSocket /scan-optimization/ws/updates
   * Backend: scan_optimization_routes.py -> websocket_optimization_updates
   */
  subscribeToOptimizationUpdates(
    params: { optimization_types?: OptimizationType[]; execution_ids?: string[] },
    onUpdate: (data: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/updates`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', ...params }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Failed to parse optimization update:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }

  /**
   * Subscribe to optimization alerts
   * Maps to: WebSocket /scan-optimization/ws/alerts
   * Backend: scan_optimization_routes.py -> websocket_optimization_alerts
   */
  subscribeToOptimizationAlerts(
    onAlert: (alert: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/alerts`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data);
        onAlert(alert);
      } catch (error) {
        console.error('Failed to parse optimization alert:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }
}

// Export singleton instance
export const scanOptimizationAPI = new ScanOptimizationAPIService();
export default scanOptimizationAPI;