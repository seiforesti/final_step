/**
 * 🎯 Scan Coordination APIs - Advanced Scan Logic
 * ==============================================
 * 
 * Comprehensive API integration for scan coordination operations
 * Maps to: backend/api/routes/scan_coordination_routes.py
 * 
 * Features:
 * - Advanced cross-system scan coordination
 * - Intelligent resource allocation and load balancing
 * - Real-time coordination monitoring and analytics
 * - Multi-system synchronization and orchestration
 * - Enterprise coordination workflows and management
 * - Coordination conflict detection and resolution
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib copie/api-client';
import {
  ScanCoordination,
  CoordinatedScan,
  CrossSystemDependency,
  ResourceConflict,
  CoordinationType,
  CoordinationStatus,
  SynchronizationMode,
  FailureHandling,
  PriorityStrategy,
  ResourceAllocationStrategy,
  CoordinationMetrics,
  SystemHealth,
  LoadBalancing
} from '../types/coordination.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/scan-coordination';

// Request types based on backend models
interface CoordinationRequest {
  coordination_type: string;
  scan_groups: Record<string, any>[];
  priority_strategy?: string;
  resource_allocation?: string;
  dependencies?: Record<string, string>[];
  coordination_parameters?: Record<string, any>;
}

interface MultiSystemScanRequest {
  target_systems: string[];
  scan_configuration: Record<string, any>;
  synchronization_mode?: string;
  failure_handling?: string;
  completion_criteria: Record<string, any>;
}

interface WorkflowCoordinationRequest {
  workflow_template_id?: string;
  workflow_definition?: Record<string, any>;
  execution_mode?: string;
  approval_required?: boolean;
  notification_settings: Record<string, boolean>;
}

interface ResourceCoordinationRequest {
  resource_pools: string[];
  allocation_strategy?: string;
  priority_weights: Record<string, number>;
  monitoring_interval?: number;
}

/**
 * Scan Coordination API Service Class
 * Provides comprehensive integration with scan coordination backend
 */
export class ScanCoordinationAPIService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
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

  // ==================== SCAN COORDINATION ====================

  /**
   * Initiate scan coordination across multiple systems
   * Maps to: POST /scan-coordination/coordinate
   * Backend: scan_coordination_routes.py -> coordinate_scans
   */
  async coordinateScans(request: CoordinationRequest): Promise<{
    coordination_id: string;
    coordination: ScanCoordination;
    execution_plan: any;
    estimated_completion: string;
  }> {
    const response = await fetch(`${this.baseUrl}/coordinate`, {
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
   * Get coordination status and progress
   * Maps to: GET /scan-coordination/{coordination_id}/status
   * Backend: scan_coordination_routes.py -> get_coordination_status
   */
  async getCoordinationStatus(coordinationId: string): Promise<{
    coordination_id: string;
    status: CoordinationStatus;
    progress: any;
    active_scans: CoordinatedScan[];
    resource_usage: any;
    performance_metrics: CoordinationMetrics;
  }> {
    const response = await fetch(`${this.baseUrl}/${coordinationId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get all active coordinations
   * Maps to: GET /scan-coordination/active
   * Backend: scan_coordination_routes.py -> get_active_coordinations
   */
  async getActiveCoordinations(params: {
    coordination_type?: CoordinationType[];
    status?: CoordinationStatus[];
    priority?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    coordinations: ScanCoordination[];
    total: number;
    summary: any;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.coordination_type) {
      params.coordination_type.forEach(type => queryParams.append('coordination_type', type));
    }
    if (params.status) {
      params.status.forEach(status => queryParams.append('status', status));
    }
    if (params.priority) {
      params.priority.forEach(priority => queryParams.append('priority', priority));
    }
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/active?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Control coordination execution (pause, resume, cancel)
   * Maps to: POST /scan-coordination/{coordination_id}/control
   * Backend: scan_coordination_routes.py -> control_coordination
   */
  async controlCoordination(coordinationId: string, action: {
    action: 'pause' | 'resume' | 'cancel' | 'rebalance';
    parameters?: Record<string, any>;
    reason?: string;
  }): Promise<{
    success: boolean;
    message: string;
    new_status: CoordinationStatus;
    coordination_id: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${coordinationId}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(action)
    });

    return this.handleResponse(response);
  }

  // ==================== MULTI-SYSTEM COORDINATION ====================

  /**
   * Coordinate scans across multiple heterogeneous systems
   * Maps to: POST /scan-coordination/multi-system
   * Backend: scan_coordination_routes.py -> coordinate_multi_system_scans
   */
  async coordinateMultiSystemScans(request: MultiSystemScanRequest): Promise<{
    coordination_id: string;
    system_assignments: any;
    synchronization_plan: any;
    monitoring_endpoints: any;
  }> {
    const response = await fetch(`${this.baseUrl}/multi-system`, {
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
   * Get multi-system coordination health
   * Maps to: GET /scan-coordination/multi-system/{coordination_id}/health
   * Backend: scan_coordination_routes.py -> get_multi_system_health
   */
  async getMultiSystemHealth(coordinationId: string): Promise<{
    overall_health: SystemHealth;
    system_status: Record<string, SystemHealth>;
    connectivity_matrix: any;
    performance_indicators: any;
  }> {
    const response = await fetch(`${this.baseUrl}/multi-system/${coordinationId}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Synchronize cross-system operations
   * Maps to: POST /scan-coordination/multi-system/{coordination_id}/sync
   * Backend: scan_coordination_routes.py -> synchronize_systems
   */
  async synchronizeSystems(coordinationId: string, syncParams: {
    sync_points?: string[];
    timeout_seconds?: number;
    retry_policy?: any;
  } = {}): Promise<{
    sync_id: string;
    synchronized_systems: string[];
    sync_status: any;
    completion_time: string;
  }> {
    const response = await fetch(`${this.baseUrl}/multi-system/${coordinationId}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(syncParams)
    });

    return this.handleResponse(response);
  }

  // ==================== WORKFLOW COORDINATION ====================

  /**
   * Coordinate complex scan workflows
   * Maps to: POST /scan-coordination/workflows
   * Backend: scan_coordination_routes.py -> coordinate_scan_workflows
   */
  async coordinateWorkflows(request: WorkflowCoordinationRequest): Promise<{
    workflow_coordination_id: string;
    execution_plan: any;
    approval_requirements: any;
    monitoring_plan: any;
  }> {
    const response = await fetch(`${this.baseUrl}/workflows`, {
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
   * Get workflow coordination details
   * Maps to: GET /scan-coordination/workflows/{workflow_id}
   * Backend: scan_coordination_routes.py -> get_workflow_coordination
   */
  async getWorkflowCoordination(workflowId: string): Promise<{
    workflow_id: string;
    coordination_details: any;
    execution_status: any;
    dependencies: CrossSystemDependency[];
    bottlenecks: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/workflows/${workflowId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Optimize workflow coordination
   * Maps to: POST /scan-coordination/workflows/{workflow_id}/optimize
   * Backend: scan_coordination_routes.py -> optimize_workflow_coordination
   */
  async optimizeWorkflowCoordination(workflowId: string, optimization: {
    optimization_goals: string[];
    constraints?: Record<string, any>;
    auto_apply?: boolean;
  }): Promise<{
    optimization_id: string;
    recommendations: any[];
    impact_analysis: any;
    implementation_plan: any;
  }> {
    const response = await fetch(`${this.baseUrl}/workflows/${workflowId}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(optimization)
    });

    return this.handleResponse(response);
  }

  // ==================== RESOURCE COORDINATION ====================

  /**
   * Coordinate resource allocation across systems
   * Maps to: POST /scan-coordination/resources
   * Backend: scan_coordination_routes.py -> coordinate_resources
   */
  async coordinateResources(request: ResourceCoordinationRequest): Promise<{
    coordination_id: string;
    allocation_plan: any;
    resource_reservations: any;
    monitoring_schedule: any;
  }> {
    const response = await fetch(`${this.baseUrl}/resources`, {
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
   * Get resource coordination status
   * Maps to: GET /scan-coordination/resources/{coordination_id}
   * Backend: scan_coordination_routes.py -> get_resource_coordination_status
   */
  async getResourceCoordinationStatus(coordinationId: string): Promise<{
    coordination_id: string;
    resource_status: any;
    utilization_metrics: any;
    conflicts: ResourceConflict[];
    optimization_opportunities: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/resources/${coordinationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Rebalance resource allocation
   * Maps to: POST /scan-coordination/resources/{coordination_id}/rebalance
   * Backend: scan_coordination_routes.py -> rebalance_resources
   */
  async rebalanceResources(coordinationId: string, rebalancing: {
    strategy?: ResourceAllocationStrategy;
    priority_adjustments?: Record<string, number>;
    force_rebalance?: boolean;
  } = {}): Promise<{
    rebalance_id: string;
    new_allocation: any;
    migration_plan: any;
    impact_assessment: any;
  }> {
    const response = await fetch(`${this.baseUrl}/resources/${coordinationId}/rebalance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(rebalancing)
    });

    return this.handleResponse(response);
  }

  // ==================== DEPENDENCY MANAGEMENT ====================

  /**
   * Get cross-system dependencies
   * Maps to: GET /scan-coordination/dependencies
   * Backend: scan_coordination_routes.py -> get_cross_system_dependencies
   */
  async getCrossSystemDependencies(params: {
    coordination_id?: string;
    system_ids?: string[];
    dependency_types?: string[];
  } = {}): Promise<{
    dependencies: CrossSystemDependency[];
    dependency_graph: any;
    critical_paths: any[];
    potential_conflicts: ResourceConflict[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.coordination_id) queryParams.append('coordination_id', params.coordination_id);
    if (params.system_ids) {
      params.system_ids.forEach(id => queryParams.append('system_ids', id));
    }
    if (params.dependency_types) {
      params.dependency_types.forEach(type => queryParams.append('dependency_types', type));
    }

    const response = await fetch(`${this.baseUrl}/dependencies?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Resolve dependency conflicts
   * Maps to: POST /scan-coordination/dependencies/resolve
   * Backend: scan_coordination_routes.py -> resolve_dependency_conflicts
   */
  async resolveDependencyConflicts(resolution: {
    conflict_ids: string[];
    resolution_strategy: string;
    parameters?: Record<string, any>;
    auto_apply?: boolean;
  }): Promise<{
    resolution_id: string;
    resolved_conflicts: string[];
    new_dependencies: CrossSystemDependency[];
    coordination_adjustments: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/dependencies/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(resolution)
    });

    return this.handleResponse(response);
  }

  // ==================== COORDINATION ANALYTICS ====================

  /**
   * Get coordination performance analytics
   * Maps to: GET /scan-coordination/analytics/performance
   * Backend: scan_coordination_routes.py -> get_coordination_analytics
   */
  async getCoordinationAnalytics(params: {
    time_range?: string;
    coordination_types?: CoordinationType[];
    include_predictions?: boolean;
    granularity?: string;
  } = {}): Promise<{
    metrics: CoordinationMetrics[];
    performance_trends: any;
    efficiency_analysis: any;
    optimization_recommendations: string[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.time_range) queryParams.append('time_range', params.time_range);
    if (params.coordination_types) {
      params.coordination_types.forEach(type => queryParams.append('coordination_types', type));
    }
    if (params.include_predictions !== undefined) queryParams.append('include_predictions', params.include_predictions.toString());
    if (params.granularity) queryParams.append('granularity', params.granularity);

    const response = await fetch(`${this.baseUrl}/analytics/performance?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Get coordination efficiency report
   * Maps to: POST /scan-coordination/analytics/efficiency
   * Backend: scan_coordination_routes.py -> generate_efficiency_report
   */
  async generateEfficiencyReport(request: {
    analysis_period: string;
    coordination_scope?: string[];
    metrics_focus?: string[];
    comparison_baseline?: string;
  }): Promise<{
    report_id: string;
    efficiency_metrics: any;
    bottleneck_analysis: any;
    improvement_opportunities: any[];
    cost_benefit_analysis: any;
  }> {
    const response = await fetch(`${this.baseUrl}/analytics/efficiency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  // ==================== LOAD BALANCING ====================

  /**
   * Get load balancing status
   * Maps to: GET /scan-coordination/load-balancing/status
   * Backend: scan_coordination_routes.py -> get_load_balancing_status
   */
  async getLoadBalancingStatus(): Promise<{
    overall_balance: LoadBalancing;
    system_loads: Record<string, any>;
    rebalancing_recommendations: any[];
    projected_improvements: any;
  }> {
    const response = await fetch(`${this.baseUrl}/load-balancing/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Trigger load rebalancing
   * Maps to: POST /scan-coordination/load-balancing/rebalance
   * Backend: scan_coordination_routes.py -> trigger_load_rebalancing
   */
  async triggerLoadRebalancing(params: {
    strategy?: string;
    target_balance?: number;
    migration_window?: string;
    dry_run?: boolean;
  } = {}): Promise<{
    rebalancing_id: string;
    migration_plan: any;
    estimated_impact: any;
    execution_timeline: any;
  }> {
    const response = await fetch(`${this.baseUrl}/load-balancing/rebalance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(params)
    });

    return this.handleResponse(response);
  }

  // ==================== REAL-TIME COORDINATION ====================

  /**
   * Subscribe to coordination status updates
   * Maps to: WebSocket /scan-coordination/ws/status
   * Backend: scan_coordination_routes.py -> websocket_coordination_updates
   */
  subscribeToCoordinationUpdates(
    coordinationId: string,
    onUpdate: (data: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/status/${coordinationId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Failed to parse coordination update:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }

  /**
   * Subscribe to resource conflict alerts
   * Maps to: WebSocket /scan-coordination/ws/conflicts
   * Backend: scan_coordination_routes.py -> websocket_conflict_alerts
   */
  subscribeToConflictAlerts(
    onAlert: (conflict: ResourceConflict) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/conflicts`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const conflict = JSON.parse(event.data);
        onAlert(conflict);
      } catch (error) {
        console.error('Failed to parse conflict alert:', error);
      }
    };

    ws.onerror = (error) => {
      if (onError) onError(error);
    };

    return ws;
  }
}

// Export singleton instance
export const scanCoordinationAPI = new ScanCoordinationAPIService();
export default scanCoordinationAPI;