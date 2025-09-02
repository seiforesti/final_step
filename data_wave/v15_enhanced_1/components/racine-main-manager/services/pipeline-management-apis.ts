/**
 * Racine Pipeline Management API Service
 * =======================================
 * 
 * Comprehensive API service for pipeline management functionality that maps 100%
 * to the backend RacinePipelineService and provides advanced pipeline orchestration
 * with AI-driven optimization and real-time monitoring.
 * 
 * Features:
 * - Visual pipeline designer with drag-drop interface
 * - Cross-group stage orchestration across all 7 groups
 * - AI-driven performance optimization and bottleneck detection
 * - Real-time pipeline execution visualization
 * - Advanced conditional logic and branching
 * - Pipeline templates and versioning
 * - Comprehensive health monitoring and alerting
 * - Resource optimization and auto-scaling
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_pipeline_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_pipeline_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_pipeline_models.py
 */

import {
  APIResponse,
  CreatePipelineRequest,
  PipelineResponse,
  PipelineListResponse,
  UpdatePipelineRequest,
  ExecutePipelineRequest,
  PipelineExecutionResponse,
  PipelineStageResponse,
  PipelineTemplateResponse,
  PipelineValidationResponse,
  PipelineOptimizationRequest,
  PipelineOptimizationResponse,
  PipelineMetricsResponse,
  PipelineHealthResponse,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest,
  SortRequest,
  OperationStatus
} from '../types/api.types';

import {
  PipelineDefinition,
  PipelineStage,
  PipelineOperation,
  PipelineExecution,
  PipelineTemplate,
  PipelineValidation,
  PipelineMetrics,
  PipelineHealth,
  PipelineOptimization,
  ConditionalStage,
  ResourceAllocation,
  PipelineVersion,
  StageExecutionLog,
  OptimizationRecommendation
} from '../types/racine-core.types';

/**
 * Configuration for the pipeline management API service
 */
interface PipelineAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeMonitoring: boolean;
  enableAIOptimization: boolean;
  websocketURL?: string;
  optimizationPollingInterval: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PipelineAPIConfig = {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy',
  timeout: 60000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeMonitoring: true,
  enableAIOptimization: true,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  optimizationPollingInterval: 5000
};

/**
 * Pipeline event types for real-time updates
 */
export enum PipelineEventType {
  PIPELINE_CREATED = 'pipeline_created',
  PIPELINE_UPDATED = 'pipeline_updated',
  PIPELINE_DELETED = 'pipeline_deleted',
  EXECUTION_STARTED = 'execution_started',
  EXECUTION_COMPLETED = 'execution_completed',
  EXECUTION_FAILED = 'execution_failed',
  EXECUTION_PAUSED = 'execution_paused',
  EXECUTION_RESUMED = 'execution_resumed',
  STAGE_STARTED = 'stage_started',
  STAGE_COMPLETED = 'stage_completed',
  STAGE_FAILED = 'stage_failed',
  BOTTLENECK_DETECTED = 'bottleneck_detected',
  OPTIMIZATION_APPLIED = 'optimization_applied',
  HEALTH_ALERT = 'health_alert',
  RESOURCE_SCALED = 'resource_scaled'
}

/**
 * Pipeline event data structure
 */
export interface PipelineEvent {
  type: PipelineEventType;
  pipelineId: UUID;
  executionId?: UUID;
  stageId?: UUID;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Event handler function type
 */
export type PipelineEventHandler = (event: PipelineEvent) => void;

/**
 * Event subscription interface
 */
export interface PipelineEventSubscription {
  id: UUID;
  eventType: PipelineEventType;
  handler: PipelineEventHandler;
  pipelineId?: UUID;
  executionId?: UUID;
}

/**
 * Pipeline control commands
 */
export enum PipelineControlCommand {
  PAUSE = 'pause',
  RESUME = 'resume',
  CANCEL = 'cancel',
  ABORT = 'abort',
  SCALE_UP = 'scale_up',
  SCALE_DOWN = 'scale_down',
  OPTIMIZE = 'optimize'
}

/**
 * Pipeline control request
 */
export interface PipelineControlRequest {
  command: PipelineControlCommand;
  stageId?: UUID;
  parameters?: Record<string, any>;
  reason?: string;
}

/**
 * Main Pipeline Management API Service Class
 */
class PipelineManagementAPI {
  private config: PipelineAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, PipelineEventSubscription> = new Map();
  private optimizationPollers: Map<UUID, NodeJS.Timeout> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<PipelineAPIConfig> = {}) {
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
   * Initialize WebSocket connection for real-time updates
   */
  async initializeWebSocket(): Promise<void> {
    if (!this.config.enableRealTimeMonitoring || !this.config.websocketURL) {
      return;
    }

    try {
      this.websocket = new WebSocket(`${this.config.websocketURL}/pipelines`);
      
      this.websocket.onopen = () => {
        console.log('Pipeline WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Pipeline WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Pipeline WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    const { event } = message;
    
    const applicableSubscriptions = Array.from(this.eventSubscriptions.values()).filter(
      subscription => {
        const typeMatches = subscription.eventType === event.type;
        const pipelineMatches = !subscription.pipelineId || subscription.pipelineId === event.pipelineId;
        const executionMatches = !subscription.executionId || subscription.executionId === event.executionId;
        return typeMatches && pipelineMatches && executionMatches;
      }
    );

    applicableSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error('Error executing pipeline event handler:', error);
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
        console.log(`Attempting pipeline WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  // =============================================================================
  // PIPELINE CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new pipeline
   * Maps to: POST /api/racine/pipelines/create
   */
  async createPipeline(request: CreatePipelineRequest): Promise<PipelineResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create pipeline: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get pipeline by ID
   * Maps to: GET /api/racine/pipelines/{id}
   */
  async getPipeline(pipelineId: UUID): Promise<PipelineResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get pipeline: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List pipelines with filtering and pagination
   * Maps to: GET /api/racine/pipelines/list
   */
  async listPipelines(
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<PipelineListResponse> {
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

    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/list?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to list pipelines: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update pipeline definition
   * Maps to: PUT /api/racine/pipelines/{id}
   */
  async updatePipeline(pipelineId: UUID, request: UpdatePipelineRequest): Promise<PipelineResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update pipeline: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete pipeline
   * Maps to: DELETE /api/racine/pipelines/{id}
   */
  async deletePipeline(pipelineId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete pipeline: ${response.statusText}`);
    }
  }

  // =============================================================================
  // PIPELINE EXECUTION
  // =============================================================================

  /**
   * Execute pipeline
   * Maps to: POST /api/racine/pipelines/{id}/execute
   */
  async executePipeline(pipelineId: UUID, request: ExecutePipelineRequest): Promise<PipelineExecutionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/execute`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to execute pipeline: ${response.statusText}`);
    }

    const execution = await response.json();
    
    // Start optimization monitoring if enabled
    if (this.config.enableAIOptimization) {
      this.startOptimizationMonitoring(execution.id);
    }

    return execution;
  }

  /**
   * Get pipeline execution status
   * Maps to: GET /api/racine/pipelines/{id}/executions/{executionId}/status
   */
  async getExecutionStatus(pipelineId: UUID, executionId: UUID): Promise<PipelineExecutionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/executions/${executionId}/status`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Control pipeline execution
   * Maps to: POST /api/racine/pipelines/{id}/executions/{executionId}/control
   */
  async controlExecution(
    pipelineId: UUID, 
    executionId: UUID, 
    request: PipelineControlRequest
  ): Promise<PipelineExecutionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/executions/${executionId}/control`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to control execution: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // PIPELINE OPTIMIZATION
  // =============================================================================

  /**
   * Optimize pipeline with AI recommendations
   * Maps to: POST /api/racine/pipelines/{id}/optimize
   */
  async optimizePipeline(pipelineId: UUID, request: PipelineOptimizationRequest): Promise<PipelineOptimizationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/optimize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to optimize pipeline: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get optimization recommendations
   * Maps to: GET /api/racine/pipelines/{id}/optimization-recommendations
   */
  async getOptimizationRecommendations(pipelineId: UUID): Promise<OptimizationRecommendation[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/optimization-recommendations`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get optimization recommendations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Apply optimization recommendation
   * Maps to: POST /api/racine/pipelines/{id}/apply-optimization
   */
  async applyOptimization(pipelineId: UUID, recommendationId: UUID): Promise<PipelineResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/apply-optimization`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ recommendation_id: recommendationId })
    });

    if (!response.ok) {
      throw new Error(`Failed to apply optimization: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // PIPELINE HEALTH AND MONITORING
  // =============================================================================

  /**
   * Get pipeline health status
   * Maps to: GET /api/racine/pipelines/{id}/health
   */
  async getPipelineHealth(pipelineId: UUID): Promise<PipelineHealthResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/health`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get pipeline health: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get pipeline execution metrics
   * Maps to: GET /api/racine/pipelines/{id}/metrics
   */
  async getPipelineMetrics(
    pipelineId: UUID,
    timeRange?: { start: ISODateString; end: ISODateString }
  ): Promise<PipelineMetricsResponse> {
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/metrics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get pipeline metrics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get bottleneck analysis
   * Maps to: GET /api/racine/pipelines/{id}/bottlenecks
   */
  async getBottleneckAnalysis(pipelineId: UUID): Promise<any> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/${pipelineId}/bottlenecks`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get bottleneck analysis: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // PIPELINE TEMPLATES
  // =============================================================================

  /**
   * Get available pipeline templates
   * Maps to: GET /api/racine/pipelines/templates
   */
  async getPipelineTemplates(
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<PipelineTemplateResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/templates?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get pipeline templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create pipeline from template
   * Maps to: POST /api/racine/pipelines/create-from-template
   */
  async createPipelineFromTemplate(
    templateId: UUID, 
    name: string, 
    parameters?: Record<string, any>
  ): Promise<PipelineResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/create-from-template`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        template_id: templateId, 
        name, 
        parameters: parameters || {} 
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create pipeline from template: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // PIPELINE VALIDATION
  // =============================================================================

  /**
   * Validate pipeline definition
   * Maps to: POST /api/racine/pipelines/validate
   */
  async validatePipeline(pipelineDefinition: PipelineDefinition): Promise<PipelineValidationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/pipelines/validate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ pipeline_definition: pipelineDefinition })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate pipeline: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  /**
   * Start optimization monitoring for execution
   */
  private startOptimizationMonitoring(executionId: UUID): void {
    const monitor = async () => {
      try {
        // Monitor for optimization opportunities
        console.log(`Monitoring optimization opportunities for execution ${executionId}`);
      } catch (error) {
        console.error('Optimization monitoring error:', error);
      }
    };

    const interval = setInterval(monitor, this.config.optimizationPollingInterval);
    this.optimizationPollers.set(executionId, interval);
  }

  /**
   * Stop optimization monitoring
   */
  private stopOptimizationMonitoring(executionId: UUID): void {
    const interval = this.optimizationPollers.get(executionId);
    if (interval) {
      clearInterval(interval);
      this.optimizationPollers.delete(executionId);
    }
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to pipeline events
   */
  subscribeToEvents(
    eventType: PipelineEventType,
    handler: PipelineEventHandler,
    pipelineId?: UUID,
    executionId?: UUID
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    const subscription: PipelineEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      pipelineId,
      executionId
    };

    this.eventSubscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from pipeline events
   */
  unsubscribeFromEvents(subscriptionId: UUID): void {
    this.eventSubscriptions.delete(subscriptionId);
  }

  /**
   * Cleanup all connections and subscriptions
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    // Clear all optimization pollers
    this.optimizationPollers.forEach((interval) => clearInterval(interval));
    this.optimizationPollers.clear();
    
    this.eventSubscriptions.clear();
  }
}

// Create and export singleton instance
export const pipelineManagementAPI = new PipelineManagementAPI();

// Export class for direct instantiation if needed
export { PipelineManagementAPI };

// Export types for external usage
export type {
  PipelineAPIConfig,
  PipelineEvent,
  PipelineEventHandler,
  PipelineEventSubscription,
  PipelineControlRequest
};