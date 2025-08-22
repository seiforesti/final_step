/**
 * 🎯 Scan Orchestration APIs - Advanced Scan Logic
 * ===============================================
 * 
 * Comprehensive API integration for scan orchestration operations
 * Maps to: backend/api/routes/enterprise_scan_orchestration_routes.py
 * 
 * Features:
 * - Enterprise-grade scan orchestration and coordination
 * - Advanced resource allocation and load balancing
 * - Cross-system scan coordination and synchronization
 * - Intelligent workflow orchestration and management
 * - Real-time orchestration monitoring and analytics
 * - Dynamic priority management and optimization
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib/api-client';
import {
  ScanOrchestrationJob,
  OrchestrationJobStatus,
  OrchestrationJobType,
  OrchestrationPriority,
  CreateOrchestrationJobRequest,
  UpdateOrchestrationJobRequest,
  OrchestrationJobListResponse,
  OrchestrationJobFilters,
  OrchestrationJobSort,
  WorkflowTemplate,
  ExecutionPipeline,
  ResourcePool,
  OrchestrationAnalytics,
  RecurringSchedule,
  CrossSystemCoordination
} from '../types/orchestration.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/scan-orchestration';

const ENDPOINTS = {
  // Core orchestration operations
  CREATE_ORCHESTRATION_JOB: `${API_BASE}/jobs`,
  GET_ORCHESTRATION_JOB: `${API_BASE}/jobs`,
  UPDATE_ORCHESTRATION_JOB: `${API_BASE}/jobs`,
  DELETE_ORCHESTRATION_JOB: `${API_BASE}/jobs`,
  LIST_ORCHESTRATION_JOBS: `${API_BASE}/jobs/list`,
  
  // Job execution and control
  START_ORCHESTRATION_JOB: `${API_BASE}/jobs/start`,
  PAUSE_ORCHESTRATION_JOB: `${API_BASE}/jobs/pause`,
  RESUME_ORCHESTRATION_JOB: `${API_BASE}/jobs/resume`,
  CANCEL_ORCHESTRATION_JOB: `${API_BASE}/jobs/cancel`,
  GET_JOB_STATUS: `${API_BASE}/jobs/status`,
  
  // Resource management
  GET_RESOURCE_POOLS: `${API_BASE}/resources/pools`,
  ALLOCATE_RESOURCES: `${API_BASE}/resources/allocate`,
  DEALLOCATE_RESOURCES: `${API_BASE}/resources/deallocate`,
  GET_RESOURCE_UTILIZATION: `${API_BASE}/resources/utilization`,
  
  // Workflow templates
  GET_WORKFLOW_TEMPLATES: `${API_BASE}/templates`,
  CREATE_WORKFLOW_TEMPLATE: `${API_BASE}/templates/create`,
  UPDATE_WORKFLOW_TEMPLATE: `${API_BASE}/templates/update`,
  
  // Analytics and monitoring
  GET_ORCHESTRATION_ANALYTICS: `${API_BASE}/analytics`,
  GET_ORCHESTRATION_METRICS: `${API_BASE}/metrics`,
  GET_PERFORMANCE_INSIGHTS: `${API_BASE}/insights`,
  
  // Cross-system coordination
  COORDINATE_CROSS_SYSTEM: `${API_BASE}/coordination/cross-system`,
  SYNCHRONIZE_SYSTEMS: `${API_BASE}/coordination/synchronize`,
  GET_SYSTEM_STATUS: `${API_BASE}/coordination/status`
} as const;

/**
 * Scan Orchestration API Service Class
 * Provides comprehensive integration with scan orchestration backend
 */
export class ScanOrchestrationAPIService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor() {
    this.apiClient = new ApiClient();
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  }

  // ==================== CORE ORCHESTRATION JOBS ====================
  
  /**
   * Create a new scan orchestration job
   * Maps to: POST /api/v1/scan-orchestration/jobs
   * Backend: enterprise_scan_orchestration_routes.py -> create_orchestration_job
   */
  async createOrchestrationJob(request: CreateOrchestrationJobRequest): Promise<ScanOrchestrationJob> {
    try {
      const response = await this.apiClient.post<ScanOrchestrationJob>(
        ENDPOINTS.CREATE_ORCHESTRATION_JOB,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create orchestration job: ${error}`);
    }
  }

  /**
   * Get orchestration job by ID
   * Maps to: GET /scan-orchestration/jobs/{job_id}
   * Backend: enterprise_scan_orchestration_routes.py -> get_orchestration_job
   */
  async getOrchestrationJob(jobId: string): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update orchestration job
   * Maps to: PUT /scan-orchestration/jobs/{job_id}
   * Backend: enterprise_scan_orchestration_routes.py -> update_orchestration_job
   */
  async updateOrchestrationJob(jobId: string, request: UpdateOrchestrationJobRequest): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete orchestration job
   * Maps to: DELETE /scan-orchestration/jobs/{job_id}
   * Backend: enterprise_scan_orchestration_routes.py -> delete_orchestration_job
   */
  async deleteOrchestrationJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete orchestration job: ${response.statusText}`);
    }
  }

  /**
   * List orchestration jobs with filtering and pagination
   * Maps to: GET /scan-orchestration/jobs
   * Backend: enterprise_scan_orchestration_routes.py -> list_orchestration_jobs
   */
  async listOrchestrationJobs(
    filters?: OrchestrationJobFilters,
    sort?: OrchestrationJobSort,
    page: number = 1,
    pageSize: number = 20
  ): Promise<OrchestrationJobListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    if (sort) {
      params.append('sort_field', sort.field);
      params.append('sort_direction', sort.direction);
    }

    const response = await fetch(`${this.baseUrl}/jobs?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list orchestration jobs: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== JOB EXECUTION CONTROL ====================

  /**
   * Start orchestration job execution
   * Maps to: POST /scan-orchestration/jobs/{job_id}/start
   * Backend: enterprise_scan_orchestration_routes.py -> start_orchestration_job
   */
  async startOrchestrationJob(jobId: string): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to start orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stop orchestration job execution
   * Maps to: POST /scan-orchestration/jobs/{job_id}/stop
   * Backend: enterprise_scan_orchestration_routes.py -> stop_orchestration_job
   */
  async stopOrchestrationJob(jobId: string): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to stop orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Pause orchestration job execution
   * Maps to: POST /scan-orchestration/jobs/{job_id}/pause
   * Backend: enterprise_scan_orchestration_routes.py -> pause_orchestration_job
   */
  async pauseOrchestrationJob(jobId: string): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/pause`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to pause orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Resume orchestration job execution
   * Maps to: POST /scan-orchestration/jobs/{job_id}/resume
   * Backend: enterprise_scan_orchestration_routes.py -> resume_orchestration_job
   */
  async resumeOrchestrationJob(jobId: string): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to resume orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Retry failed orchestration job
   * Maps to: POST /scan-orchestration/jobs/{job_id}/retry
   * Backend: enterprise_scan_orchestration_routes.py -> retry_orchestration_job
   */
  async retryOrchestrationJob(jobId: string): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/retry`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to retry orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== WORKFLOW TEMPLATES ====================

  /**
   * Get workflow templates
   * Maps to: GET /scan-orchestration/workflow-templates
   * Backend: enterprise_scan_orchestration_routes.py -> get_workflow_templates
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    const response = await fetch(`${this.baseUrl}/workflow-templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workflow template by ID
   * Maps to: GET /scan-orchestration/workflow-templates/{template_id}
   * Backend: enterprise_scan_orchestration_routes.py -> get_workflow_template
   */
  async getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate> {
    const response = await fetch(`${this.baseUrl}/workflow-templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow template: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create workflow template
   * Maps to: POST /scan-orchestration/workflow-templates
   * Backend: enterprise_scan_orchestration_routes.py -> create_workflow_template
   */
  async createWorkflowTemplate(template: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const response = await fetch(`${this.baseUrl}/workflow-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(template)
    });

    if (!response.ok) {
      throw new Error(`Failed to create workflow template: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== EXECUTION PIPELINES ====================

  /**
   * Get execution pipelines
   * Maps to: GET /scan-orchestration/pipelines
   * Backend: enterprise_scan_orchestration_routes.py -> get_execution_pipelines
   */
  async getExecutionPipelines(): Promise<ExecutionPipeline[]> {
    const response = await fetch(`${this.baseUrl}/pipelines`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution pipelines: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get execution pipeline by ID
   * Maps to: GET /scan-orchestration/pipelines/{pipeline_id}
   * Backend: enterprise_scan_orchestration_routes.py -> get_execution_pipeline
   */
  async getExecutionPipeline(pipelineId: string): Promise<ExecutionPipeline> {
    const response = await fetch(`${this.baseUrl}/pipelines/${pipelineId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution pipeline: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== RESOURCE MANAGEMENT ====================

  /**
   * Get resource pools
   * Maps to: GET /scan-orchestration/resource-pools
   * Backend: enterprise_scan_orchestration_routes.py -> get_resource_pools
   */
  async getResourcePools(): Promise<ResourcePool[]> {
    const response = await fetch(`${this.baseUrl}/resource-pools`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get resource pools: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get resource pool by ID
   * Maps to: GET /scan-orchestration/resource-pools/{pool_id}
   * Backend: enterprise_scan_orchestration_routes.py -> get_resource_pool
   */
  async getResourcePool(poolId: string): Promise<ResourcePool> {
    const response = await fetch(`${this.baseUrl}/resource-pools/${poolId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get resource pool: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Allocate resources for orchestration job
   * Maps to: POST /scan-orchestration/jobs/{job_id}/allocate-resources
   * Backend: enterprise_scan_orchestration_routes.py -> allocate_resources
   */
  async allocateResources(jobId: string, resourceRequirements: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/allocate-resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(resourceRequirements)
    });

    if (!response.ok) {
      throw new Error(`Failed to allocate resources: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Deallocate resources for orchestration job
   * Maps to: POST /scan-orchestration/jobs/{job_id}/deallocate-resources
   * Backend: enterprise_scan_orchestration_routes.py -> deallocate_resources
   */
  async deallocateResources(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/deallocate-resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to deallocate resources: ${response.statusText}`);
    }
  }

  // ==================== SCHEDULING ====================

  /**
   * Schedule orchestration job
   * Maps to: POST /scan-orchestration/jobs/{job_id}/schedule
   * Backend: enterprise_scan_orchestration_routes.py -> schedule_orchestration_job
   */
  async scheduleOrchestrationJob(jobId: string, schedule: RecurringSchedule): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(schedule)
    });

    if (!response.ok) {
      throw new Error(`Failed to schedule orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Unschedule orchestration job
   * Maps to: DELETE /scan-orchestration/jobs/{job_id}/schedule
   * Backend: enterprise_scan_orchestration_routes.py -> unschedule_orchestration_job
   */
  async unscheduleOrchestrationJob(jobId: string): Promise<ScanOrchestrationJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/schedule`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to unschedule orchestration job: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== CROSS-SYSTEM COORDINATION ====================

  /**
   * Configure cross-system coordination
   * Maps to: POST /scan-orchestration/cross-system-coordination
   * Backend: enterprise_scan_orchestration_routes.py -> configure_cross_system_coordination
   */
  async configureCrossSystemCoordination(coordination: CrossSystemCoordination): Promise<CrossSystemCoordination> {
    const response = await fetch(`${this.baseUrl}/cross-system-coordination`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(coordination)
    });

    if (!response.ok) {
      throw new Error(`Failed to configure cross-system coordination: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get cross-system coordination status
   * Maps to: GET /scan-orchestration/cross-system-coordination/status
   * Backend: enterprise_scan_orchestration_routes.py -> get_cross_system_coordination_status
   */
  async getCrossSystemCoordinationStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/cross-system-coordination/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get cross-system coordination status: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== ANALYTICS & MONITORING ====================

  /**
   * Get orchestration analytics
   * Maps to: GET /scan-orchestration/analytics
   * Backend: enterprise_scan_orchestration_routes.py -> get_orchestration_analytics
   */
  async getOrchestrationAnalytics(
    timeRange?: { start: string; end: string },
    aggregation?: string
  ): Promise<OrchestrationAnalytics> {
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    if (aggregation) {
      params.append('aggregation', aggregation);
    }

    const response = await fetch(`${this.baseUrl}/analytics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get orchestration analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get job execution logs
   * Maps to: GET /scan-orchestration/jobs/{job_id}/logs
   * Backend: enterprise_scan_orchestration_routes.py -> get_job_logs
   */
  async getJobLogs(jobId: string, level?: string, limit?: number): Promise<any[]> {
    const params = new URLSearchParams();
    
    if (level) {
      params.append('level', level);
    }
    
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/logs?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get job logs: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get real-time job status
   * Maps to: GET /scan-orchestration/jobs/{job_id}/status
   * Backend: enterprise_scan_orchestration_routes.py -> get_job_status
   */
  async getJobStatus(jobId: string): Promise<{ status: OrchestrationJobStatus; progress: number; currentStage?: string }> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== OPTIMIZATION ====================

  /**
   * Optimize orchestration performance
   * Maps to: POST /scan-orchestration/optimize
   * Backend: enterprise_scan_orchestration_routes.py -> optimize_orchestration
   */
  async optimizeOrchestration(optimizationParameters: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(optimizationParameters)
    });

    if (!response.ok) {
      throw new Error(`Failed to optimize orchestration: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get optimization recommendations
   * Maps to: GET /scan-orchestration/optimization-recommendations
   * Backend: enterprise_scan_orchestration_routes.py -> get_optimization_recommendations
   */
  async getOptimizationRecommendations(jobId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    
    if (jobId) {
      params.append('job_id', jobId);
    }

    const response = await fetch(`${this.baseUrl}/optimization-recommendations?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get optimization recommendations: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== UTILITY METHODS ====================



  /**
   * Handle WebSocket connection for real-time updates
   * Maps to: WebSocket /scan-orchestration/ws/jobs/{job_id}
   */
  subscribeToJobUpdates(jobId: string, onUpdate: (data: any) => void): WebSocket {
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/scan-orchestration/ws/jobs/${jobId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }

  /**
   * Validate job configuration before submission
   */
  validateJobConfiguration(request: CreateOrchestrationJobRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Job name is required');
    }

    if (!request.data_source_id) {
      errors.push('Data source ID is required');
    }

    if (!request.scan_rule_set_id) {
      errors.push('Scan rule set ID is required');
    }

    if (request.priority < 1 || request.priority > 5) {
      errors.push('Priority must be between 1 and 5');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Bulk operations for multiple jobs
   */
  async bulkStartJobs(jobIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const response = await fetch(`${this.baseUrl}/jobs/bulk/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ job_ids: jobIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk start jobs: ${response.statusText}`);
    }

    return response.json();
  }

  async bulkStopJobs(jobIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const response = await fetch(`${this.baseUrl}/jobs/bulk/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ job_ids: jobIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk stop jobs: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const scanOrchestrationAPI = new ScanOrchestrationAPIService();
export default scanOrchestrationAPI;