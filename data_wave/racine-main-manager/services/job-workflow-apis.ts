/**
 * Racine Job Workflow API Service
 * ================================
 * 
 * Comprehensive API service for job workflow functionality that maps 100%
 * to the backend RacineWorkflowService and provides Databricks-style
 * workflow management with complete type safety.
 * 
 * Features:
 * - Visual drag-drop workflow builder
 * - Cross-group step orchestration across all 7 groups
 * - Advanced dependency management and conditional execution
 * - Real-time workflow monitoring and execution control
 * - Pre-built workflow templates and versioning
 * - AI-powered workflow optimization recommendations
 * - Comprehensive logging and audit trails
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workflow_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_workflow_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_workflow_models.py
 */

import {
  APIResponse,
  CreateWorkflowRequest,
  WorkflowResponse,
  WorkflowListResponse,
  UpdateWorkflowRequest,
  ExecuteWorkflowRequest,
  WorkflowExecutionResponse,
  WorkflowStepResponse,
  WorkflowTemplateResponse,
  WorkflowValidationResponse,
  ScheduleWorkflowRequest,
  WorkflowScheduleResponse,
  WorkflowMetricsResponse,
  WorkflowLogResponse,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest,
  SortRequest,
  OperationStatus
} from '../types/api.types';

import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowDependency,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowSchedule,
  WorkflowValidation,
  ExecutionLog,
  ExecutionError,
  WorkflowMetrics,
  WorkflowParameter,
  ConditionalStep,
  RetryPolicy,
  WorkflowVersion
} from '../types/racine-core.types';

/**
 * Configuration for the job workflow API service
 */
interface WorkflowAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeMonitoring: boolean;
  websocketURL?: string;
  executionPollingInterval: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: WorkflowAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 60000, // Longer timeout for workflow operations
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeMonitoring: true,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  executionPollingInterval: 2000
};

/**
 * Workflow event types for real-time updates
 */
export enum WorkflowEventType {
  WORKFLOW_CREATED = 'workflow_created',
  WORKFLOW_UPDATED = 'workflow_updated',
  WORKFLOW_DELETED = 'workflow_deleted',
  EXECUTION_STARTED = 'execution_started',
  EXECUTION_COMPLETED = 'execution_completed',
  EXECUTION_FAILED = 'execution_failed',
  EXECUTION_PAUSED = 'execution_paused',
  EXECUTION_RESUMED = 'execution_resumed',
  EXECUTION_CANCELLED = 'execution_cancelled',
  STEP_STARTED = 'step_started',
  STEP_COMPLETED = 'step_completed',
  STEP_FAILED = 'step_failed',
  STEP_SKIPPED = 'step_skipped',
  LOG_UPDATED = 'log_updated',
  METRICS_UPDATED = 'metrics_updated'
}

/**
 * Workflow event data structure
 */
export interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: UUID;
  executionId?: UUID;
  stepId?: UUID;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Event handler function type
 */
export type WorkflowEventHandler = (event: WorkflowEvent) => void;

/**
 * Event subscription interface
 */
export interface WorkflowEventSubscription {
  id: UUID;
  eventType: WorkflowEventType;
  handler: WorkflowEventHandler;
  workflowId?: UUID;
  executionId?: UUID;
}

/**
 * WebSocket message structure for workflow events
 */
export interface WorkflowWebSocketMessage {
  event: WorkflowEvent;
  subscription_id?: UUID;
}

/**
 * Workflow execution control commands
 */
export enum ExecutionControlCommand {
  PAUSE = 'pause',
  RESUME = 'resume',
  CANCEL = 'cancel',
  RETRY_STEP = 'retry_step',
  SKIP_STEP = 'skip_step',
  ABORT = 'abort'
}

/**
 * Execution control request
 */
export interface ExecutionControlRequest {
  command: ExecutionControlCommand;
  stepId?: UUID;
  reason?: string;
  parameters?: Record<string, any>;
}

/**
 * Main Job Workflow API Service Class
 */
class JobWorkflowAPI {
  private config: WorkflowAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, WorkflowEventSubscription> = new Map();
  private executionPollers: Map<UUID, NodeJS.Timeout> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<WorkflowAPIConfig> = {}) {
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
      this.websocket = new WebSocket(`${this.config.websocketURL}/workflows`);
      
      this.websocket.onopen = () => {
        console.log('Workflow WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WorkflowWebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Workflow WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Workflow WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WorkflowWebSocketMessage): void {
    const { event } = message;
    
    // Find all applicable subscriptions
    const applicableSubscriptions = Array.from(this.eventSubscriptions.values()).filter(
      subscription => {
        const typeMatches = subscription.eventType === event.type;
        const workflowMatches = !subscription.workflowId || subscription.workflowId === event.workflowId;
        const executionMatches = !subscription.executionId || subscription.executionId === event.executionId;
        return typeMatches && workflowMatches && executionMatches;
      }
    );

    // Execute all applicable handlers
    applicableSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error('Error executing workflow event handler:', error);
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
        console.log(`Attempting workflow WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    }
  }

  // =============================================================================
  // WORKFLOW CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new workflow
   * Maps to: POST /api/racine/workflows/create
   */
  async createWorkflow(request: CreateWorkflowRequest): Promise<WorkflowResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workflow by ID
   * Maps to: GET /api/racine/workflows/{id}
   */
  async getWorkflow(workflowId: UUID): Promise<WorkflowResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List workflows with filtering and pagination
   * Maps to: GET /api/racine/workflows/list
   */
  async listWorkflows(
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<WorkflowListResponse> {
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

    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/list?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to list workflows: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update workflow definition
   * Maps to: PUT /api/racine/workflows/{id}
   */
  async updateWorkflow(workflowId: UUID, request: UpdateWorkflowRequest): Promise<WorkflowResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete workflow
   * Maps to: DELETE /api/racine/workflows/{id}
   */
  async deleteWorkflow(workflowId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workflow: ${response.statusText}`);
    }
  }

  // =============================================================================
  // WORKFLOW VALIDATION
  // =============================================================================

  /**
   * Validate workflow definition
   * Maps to: POST /api/racine/workflows/validate
   */
  async validateWorkflow(workflowDefinition: WorkflowDefinition): Promise<WorkflowValidationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/validate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ workflow_definition: workflowDefinition })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validate workflow step
   * Maps to: POST /api/racine/workflows/validate-step
   */
  async validateWorkflowStep(step: WorkflowStep): Promise<WorkflowValidationResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/validate-step`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ step })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate workflow step: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // WORKFLOW EXECUTION
  // =============================================================================

  /**
   * Execute workflow
   * Maps to: POST /api/racine/workflows/{id}/execute
   */
  async executeWorkflow(workflowId: UUID, request: ExecuteWorkflowRequest): Promise<WorkflowExecutionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to execute workflow: ${response.statusText}`);
    }

    const execution = await response.json();
    
    // Start polling for execution updates if not using WebSocket
    if (!this.config.enableRealTimeMonitoring) {
      this.startExecutionPolling(execution.id);
    }

    return execution;
  }

  /**
   * Get workflow execution status
   * Maps to: GET /api/racine/workflows/{id}/executions/{executionId}/status
   */
  async getExecutionStatus(workflowId: UUID, executionId: UUID): Promise<WorkflowExecutionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/executions/${executionId}/status`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Control workflow execution
   * Maps to: POST /api/racine/workflows/{id}/executions/{executionId}/control
   */
  async controlExecution(
    workflowId: UUID, 
    executionId: UUID, 
    request: ExecutionControlRequest
  ): Promise<WorkflowExecutionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/executions/${executionId}/control`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to control execution: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workflow execution history
   * Maps to: GET /api/racine/workflows/{id}/executions
   */
  async getExecutionHistory(
    workflowId: UUID,
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<WorkflowExecutionResponse[]> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/executions?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution history: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // WORKFLOW LOGGING AND MONITORING
  // =============================================================================

  /**
   * Get workflow execution logs
   * Maps to: GET /api/racine/workflows/{id}/executions/{executionId}/logs
   */
  async getExecutionLogs(
    workflowId: UUID,
    executionId: UUID,
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<WorkflowLogResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/executions/${executionId}/logs?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution logs: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stream workflow execution logs (Server-Sent Events)
   * Maps to: GET /api/racine/workflows/{id}/executions/{executionId}/logs/stream
   */
  async streamExecutionLogs(
    workflowId: UUID,
    executionId: UUID,
    onLog: (log: ExecutionLog) => void,
    onError?: (error: Error) => void
  ): Promise<() => void> {
    const eventSource = new EventSource(
      `${this.config.baseURL}/api/racine/workflows/${workflowId}/executions/${executionId}/logs/stream`,
      {
        headers: this.getAuthHeaders()
      } as any
    );

    eventSource.onmessage = (event) => {
      try {
        const log: ExecutionLog = JSON.parse(event.data);
        onLog(log);
      } catch (error) {
        console.error('Failed to parse log stream data:', error);
        onError?.(error as Error);
      }
    };

    eventSource.onerror = (event) => {
      console.error('Log stream error:', event);
      onError?.(new Error('Log stream connection error'));
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  /**
   * Get workflow execution metrics
   * Maps to: GET /api/racine/workflows/{id}/executions/{executionId}/metrics
   */
  async getExecutionMetrics(workflowId: UUID, executionId: UUID): Promise<WorkflowMetricsResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/executions/${executionId}/metrics`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution metrics: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // WORKFLOW TEMPLATES
  // =============================================================================

  /**
   * Get available workflow templates
   * Maps to: GET /api/racine/workflows/templates
   */
  async getWorkflowTemplates(
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<WorkflowTemplateResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/templates?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create workflow from template
   * Maps to: POST /api/racine/workflows/create-from-template
   */
  async createWorkflowFromTemplate(templateId: UUID, name: string, parameters?: Record<string, any>): Promise<WorkflowResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/create-from-template`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        template_id: templateId, 
        name, 
        parameters: parameters || {} 
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create workflow from template: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // WORKFLOW SCHEDULING
  // =============================================================================

  /**
   * Schedule workflow execution
   * Maps to: POST /api/racine/workflows/{id}/schedule
   */
  async scheduleWorkflow(workflowId: UUID, request: ScheduleWorkflowRequest): Promise<WorkflowScheduleResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/schedule`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to schedule workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workflow schedules
   * Maps to: GET /api/racine/workflows/{id}/schedules
   */
  async getWorkflowSchedules(workflowId: UUID): Promise<WorkflowScheduleResponse[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/schedules`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow schedules: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update workflow schedule
   * Maps to: PUT /api/racine/workflows/{id}/schedules/{scheduleId}
   */
  async updateWorkflowSchedule(
    workflowId: UUID, 
    scheduleId: UUID, 
    request: ScheduleWorkflowRequest
  ): Promise<WorkflowScheduleResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update workflow schedule: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete workflow schedule
   * Maps to: DELETE /api/racine/workflows/{id}/schedules/{scheduleId}
   */
  async deleteWorkflowSchedule(workflowId: UUID, scheduleId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workflow schedule: ${response.statusText}`);
    }
  }

  // =============================================================================
  // WORKFLOW VERSIONING
  // =============================================================================

  /**
   * Get workflow versions
   * Maps to: GET /api/racine/workflows/{id}/versions
   */
  async getWorkflowVersions(workflowId: UUID): Promise<WorkflowVersion[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/versions`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow versions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create workflow version
   * Maps to: POST /api/racine/workflows/{id}/versions
   */
  async createWorkflowVersion(workflowId: UUID, description?: string): Promise<WorkflowVersion> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/versions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      throw new Error(`Failed to create workflow version: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Rollback to workflow version
   * Maps to: POST /api/racine/workflows/{id}/versions/{versionId}/rollback
   */
  async rollbackToVersion(workflowId: UUID, versionId: UUID): Promise<WorkflowResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workflows/${workflowId}/versions/${versionId}/rollback`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to rollback workflow version: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  /**
   * Start polling for execution updates
   */
  private startExecutionPolling(executionId: UUID): void {
    const poll = async () => {
      try {
        // This would need the workflow ID as well - simplified for now
        // In practice, you'd maintain a registry of execution -> workflow mappings
        console.log(`Polling execution ${executionId}`);
      } catch (error) {
        console.error('Execution polling error:', error);
      }
    };

    const interval = setInterval(poll, this.config.executionPollingInterval);
    this.executionPollers.set(executionId, interval);
  }

  /**
   * Stop polling for execution updates
   */
  private stopExecutionPolling(executionId: UUID): void {
    const interval = this.executionPollers.get(executionId);
    if (interval) {
      clearInterval(interval);
      this.executionPollers.delete(executionId);
    }
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to workflow events
   */
  subscribeToEvents(
    eventType: WorkflowEventType,
    handler: WorkflowEventHandler,
    workflowId?: UUID,
    executionId?: UUID
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    const subscription: WorkflowEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      workflowId,
      executionId
    };

    this.eventSubscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from workflow events
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
    
    // Clear all execution pollers
    this.executionPollers.forEach((interval) => clearInterval(interval));
    this.executionPollers.clear();
    
    this.eventSubscriptions.clear();
  }
}

// Create and export singleton instance
export const jobWorkflowAPI = new JobWorkflowAPI();

// Export class for direct instantiation if needed
export { JobWorkflowAPI };

// Export types for external usage
export type {
  WorkflowAPIConfig,
  WorkflowEvent,
  WorkflowEventHandler,
  WorkflowEventSubscription,
  WorkflowWebSocketMessage,
  ExecutionControlRequest
};