/**
 * Racine Orchestration API Service
 * =================================
 * 
 * Comprehensive API service for master orchestration functionality that maps 100%
 * to the backend RacineOrchestrationService and provides complete type safety
 * for all orchestration operations.
 * 
 * Features:
 * - Master orchestration management
 * - Cross-group workflow execution
 * - System health monitoring
 * - Performance optimization
 * - Real-time metrics and analytics
 * - Error handling and retry logic
 * - WebSocket integration for live updates
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_orchestration_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_orchestration_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_orchestration_models.py
 */

import {
  APIResponse,
  CreateOrchestrationRequest,
  OrchestrationResponse,
  SystemHealthResponse,
  ExecuteWorkflowRequest,
  WorkflowExecutionResponse,
  OptimizePerformanceRequest,
  PerformanceOptimizationResponse,
  WorkflowDefinitionInput,
  WorkflowExecutionResponse as CrossGroupWorkflowResponse,
  SystemAlert,
  GroupHealthStatus,
  ServiceHealthStatus,
  IntegrationHealthStatus,
  PerformanceHealthStatus,
  OptimizationRecommendation,
  UUID,
  ISODateString,
  JSONValue,
  SystemStatus,
  OperationStatus,
  PaginationRequest,
  FilterRequest,
  UpdateOrchestrationRequest,
  BulkOperationRequest,
  BulkOperationResponse,
  ServiceRegistryResponse,
  EmergencyShutdownRequest,
  CrossGroupDependencyResponse,
  ValidateOrchestrationRequest,
  OrchestrationValidationResponse,
  PerformanceInsightsResponse,
  OrchestrationReportRequest,
  OrchestrationReportResponse
} from '../types/api.types';

import {
  SystemHealth,
  PerformanceMetrics,
  CrossGroupState,
  WorkflowExecution,
  ExecutionLog,
  ExecutionError
} from '../types/racine-core.types';

/**
 * Configuration for the orchestration API service
 */
interface OrchestrationAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableWebSocket: boolean;
  websocketURL?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: OrchestrationAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableWebSocket: true,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
};

/**
 * WebSocket event types for real-time updates
 */
export enum OrchestrationEventType {
  HEALTH_UPDATE = 'health_update',
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  PERFORMANCE_ALERT = 'performance_alert',
  SYSTEM_ALERT = 'system_alert',
  METRICS_UPDATE = 'metrics_update'
}

/**
 * WebSocket event data structure
 */
export interface OrchestrationEvent {
  type: OrchestrationEventType;
  timestamp: ISODateString;
  data: JSONValue;
  orchestrationId?: UUID;
  workflowId?: UUID;
  correlationId?: UUID;
}

/**
 * Event handler type for WebSocket events
 */
export type OrchestrationEventHandler = (event: OrchestrationEvent) => void;

/**
 * Subscription management for WebSocket events
 */
interface EventSubscription {
  id: UUID;
  eventType: OrchestrationEventType;
  handler: OrchestrationEventHandler;
  filter?: (event: OrchestrationEvent) => boolean;
}

/**
 * Request options for API calls
 */
interface RequestOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

/**
 * Main Racine Orchestration API Service Class
 */
export class RacineOrchestrationAPI {
  private config: OrchestrationAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private subscriptions: Map<UUID, EventSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor(config?: Partial<OrchestrationAPIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeWebSocket();
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with retry logic and error handling
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      timeout = this.config.timeout,
      retryAttempts = this.config.retryAttempts,
      retryDelay = this.config.retryDelay,
      signal,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const headers = {
      ...this.getAuthHeaders(),
      ...customHeaders
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.config.baseURL}${url}`, {
          ...fetchOptions,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as APIResponse<T>;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retryAttempts && this.shouldRetry(error as Error)) {
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        break;
      }
    }

    clearTimeout(timeoutId);
    throw lastError!;
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: Error): boolean {
    // Retry on network errors, timeouts, and 5xx status codes
    return error.message.includes('fetch') || 
           error.message.includes('timeout') ||
           error.message.includes('HTTP 5');
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // =============================================================================
  // CORE ORCHESTRATION API METHODS
  // =============================================================================

  /**
   * Create a new orchestration master instance
   */
  async createOrchestration(request: CreateOrchestrationRequest, options?: RequestOptions): Promise<APIResponse<OrchestrationResponse>> {
    return this.makeRequest<OrchestrationResponse>('/api/racine/orchestration/create', {
      method: 'POST',
      body: JSON.stringify(request),
      ...options
    });
  }

  /**
   * Get orchestration details by ID
   */
  async getOrchestration(orchestrationId: UUID, options?: RequestOptions): Promise<APIResponse<OrchestrationResponse>> {
    return this.makeRequest<OrchestrationResponse>(`/api/racine/orchestration/${orchestrationId}`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Update orchestration configuration
   */
  async updateOrchestration(
    orchestrationId: UUID, 
    request: UpdateOrchestrationRequest, 
    options?: RequestOptions
  ): Promise<APIResponse<OrchestrationResponse>> {
    return this.makeRequest<OrchestrationResponse>(`/api/racine/orchestration/${orchestrationId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
      ...options
    });
  }

  /**
   * Delete orchestration instance
   */
  async deleteOrchestration(orchestrationId: UUID, options?: RequestOptions): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/racine/orchestration/${orchestrationId}`, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Execute cross-group workflow
   */
  async executeWorkflow(
    orchestrationId: UUID, 
    request: ExecuteWorkflowRequest, 
    options?: RequestOptions
  ): Promise<APIResponse<WorkflowExecutionResponse>> {
    return this.makeRequest<WorkflowExecutionResponse>(`/api/racine/orchestration/${orchestrationId}/execute-workflow`, {
      method: 'POST',
      body: JSON.stringify(request),
      ...options
    });
  }

  /**
   * Get workflow executions for an orchestration
   */
  async getWorkflowExecutions(
    orchestrationId: UUID, 
    pagination?: PaginationRequest,
    options?: RequestOptions
  ): Promise<APIResponse<WorkflowExecutionResponse[]>> {
    const queryParams = pagination ? `?${new URLSearchParams(pagination as any).toString()}` : '';
    return this.makeRequest<WorkflowExecutionResponse[]>(`/api/racine/orchestration/${orchestrationId}/workflows${queryParams}`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Get system health status
   */
  async getSystemHealth(
    orchestrationId: UUID, 
    options?: RequestOptions
  ): Promise<APIResponse<SystemHealthResponse>> {
    return this.makeRequest<SystemHealthResponse>(`/api/racine/orchestration/${orchestrationId}/health`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Optimize system performance
   */
  async optimizePerformance(
    orchestrationId: UUID, 
    request: OptimizePerformanceRequest, 
    options?: RequestOptions
  ): Promise<APIResponse<PerformanceOptimizationResponse>> {
    return this.makeRequest<PerformanceOptimizationResponse>(`/api/racine/orchestration/${orchestrationId}/optimize`, {
      method: 'POST',
      body: JSON.stringify(request),
      ...options
    });
  }

  /**
   * Get cross-group metrics
   */
  async getCrossGroupMetrics(
    orchestrationId: UUID, 
    options?: RequestOptions
  ): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/api/racine/orchestration/${orchestrationId}/metrics`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Get all active orchestrations
   */
  async getActiveOrchestrations(
    filters?: FilterRequest,
    pagination?: PaginationRequest,
    options?: RequestOptions
  ): Promise<APIResponse<OrchestrationResponse[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/racine/orchestration/active?${queryString}` : '/api/racine/orchestration/active';
    
    return this.makeRequest<OrchestrationResponse[]>(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Execute bulk operations across groups
   */
  async executeBulkOperations(
    request: BulkOperationRequest, 
    options?: RequestOptions
  ): Promise<APIResponse<BulkOperationResponse>> {
    return this.makeRequest<BulkOperationResponse>('/api/racine/orchestration/bulk-operations', {
      method: 'POST',
      body: JSON.stringify(request),
      ...options
    });
  }

  /**
   * Get service registry status
   */
  async getServiceRegistry(options?: RequestOptions): Promise<APIResponse<ServiceRegistryResponse>> {
    return this.makeRequest<ServiceRegistryResponse>('/api/racine/orchestration/service-registry', {
      method: 'GET',
      ...options
    });
  }

  /**
   * Emergency shutdown procedures
   */
  async emergencyShutdown(
    request: EmergencyShutdownRequest, 
    options?: RequestOptions
  ): Promise<APIResponse<void>> {
    return this.makeRequest<void>('/api/racine/orchestration/emergency-shutdown', {
      method: 'POST',
      body: JSON.stringify(request),
      ...options
    });
  }

  // =============================================================================
  // WORKFLOW EXECUTION MONITORING
  // =============================================================================

  /**
   * Get workflow execution status with real-time updates
   */
  async getWorkflowExecutionStatus(
    orchestrationId: UUID,
    executionId: UUID,
    options?: RequestOptions
  ): Promise<APIResponse<WorkflowExecutionResponse>> {
    return this.makeRequest<WorkflowExecutionResponse>(`/api/racine/orchestration/${orchestrationId}/workflows/${executionId}/status`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Stream workflow execution logs
   */
  async streamWorkflowLogs(
    orchestrationId: UUID,
    executionId: UUID,
    onLogReceived: (log: ExecutionLog) => void,
    options?: RequestOptions
  ): Promise<EventSource> {
    const url = `${this.config.baseURL}/api/racine/orchestration/${orchestrationId}/workflows/${executionId}/logs/stream`;
    
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data) as ExecutionLog;
        onLogReceived(log);
      } catch (error) {
        console.error('Failed to parse log stream:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Log stream error:', error);
    };

    return eventSource;
  }

  /**
   * Control workflow execution (pause, resume, cancel)
   */
  async controlWorkflowExecution(
    orchestrationId: UUID,
    executionId: UUID,
    action: 'pause' | 'resume' | 'cancel',
    options?: RequestOptions
  ): Promise<APIResponse<WorkflowExecutionResponse>> {
    return this.makeRequest<WorkflowExecutionResponse>(`/api/racine/orchestration/${orchestrationId}/workflows/${executionId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action }),
      ...options
    });
  }

  // =============================================================================
  // ADVANCED ORCHESTRATION FEATURES
  // =============================================================================

  /**
   * Get cross-group dependencies analysis
   */
  async getCrossGroupDependencies(
    orchestrationId: UUID,
    options?: RequestOptions
  ): Promise<APIResponse<CrossGroupDependencyResponse>> {
    return this.makeRequest<CrossGroupDependencyResponse>(`/api/racine/orchestration/${orchestrationId}/dependencies`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Validate orchestration configuration
   */
  async validateOrchestrationConfig(
    request: ValidateOrchestrationRequest,
    options?: RequestOptions
  ): Promise<APIResponse<OrchestrationValidationResponse>> {
    return this.makeRequest<OrchestrationValidationResponse>('/api/racine/orchestration/validate', {
      method: 'POST',
      body: JSON.stringify(request),
      ...options
    });
  }

  /**
   * Get orchestration performance insights
   */
  async getPerformanceInsights(
    orchestrationId: UUID,
    timeRange?: { start: ISODateString; end: ISODateString },
    options?: RequestOptions
  ): Promise<APIResponse<PerformanceInsightsResponse>> {
    const params = timeRange ? `?start=${timeRange.start}&end=${timeRange.end}` : '';
    return this.makeRequest<PerformanceInsightsResponse>(`/api/racine/orchestration/${orchestrationId}/insights${params}`, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Generate orchestration report
   */
  async generateOrchestrationReport(
    orchestrationId: UUID,
    request: OrchestrationReportRequest,
    options?: RequestOptions
  ): Promise<APIResponse<OrchestrationReportResponse>> {
    return this.makeRequest<OrchestrationReportResponse>(`/api/racine/orchestration/${orchestrationId}/report`, {
      method: 'POST',
      body: JSON.stringify(request),
      ...options
    });
  }

  // =============================================================================
  // SYSTEM HEALTH MONITORING
  // =============================================================================

  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(
    options?: RequestOptions
  ): Promise<APIResponse<SystemHealthResponse>> {
    return this.makeRequest<SystemHealthResponse>('/api/racine/orchestration/health', {
      method: 'GET',
      ...options
    });
  }

  /**
   * Get health status for specific group
   */
  async getGroupHealth(
    groupId: string,
    options?: RequestOptions
  ): Promise<APIResponse<GroupHealthStatus>> {
    return this.makeRequest<GroupHealthStatus>(
      `/api/racine/orchestration/health/groups/${groupId}`,
      { method: 'GET', ...options }
    );
  }

  /**
   * Get health status for specific service
   */
  async getServiceHealth(
    serviceId: string,
    options?: RequestOptions
  ): Promise<APIResponse<ServiceHealthStatus>> {
    return this.makeRequest<ServiceHealthStatus>(
      `/api/racine/orchestration/health/services/${serviceId}`,
      { method: 'GET', ...options }
    );
  }

  /**
   * Get health status for specific integration
   */
  async getIntegrationHealth(
    integrationId: UUID,
    options?: RequestOptions
  ): Promise<APIResponse<IntegrationHealthStatus>> {
    return this.makeRequest<IntegrationHealthStatus>(
      `/api/racine/orchestration/health/integrations/${integrationId}`,
      { method: 'GET', ...options }
    );
  }

  /**
   * Get performance health metrics
   */
  async getPerformanceHealth(
    options?: RequestOptions
  ): Promise<APIResponse<PerformanceHealthStatus>> {
    return this.makeRequest<PerformanceHealthStatus>(
      '/api/racine/orchestration/health/performance',
      { method: 'GET', ...options }
    );
  }

  /**
   * Get system alerts
   */
  async getSystemAlerts(
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    options?: RequestOptions
  ): Promise<APIResponse<SystemAlert[]>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.pageSize) params.append('pageSize', pagination.pageSize.toString());
    }

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.filters) {
        Object.entries(filters.filters).forEach(([key, value]) => {
          params.append(`filter.${key}`, String(value));
        });
      }
    }

    const queryString = params.toString();
    const url = `/api/racine/orchestration/alerts${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<SystemAlert[]>(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Acknowledge system alert
   */
  async acknowledgeAlert(
    alertId: UUID,
    options?: RequestOptions
  ): Promise<APIResponse<void>> {
    return this.makeRequest<void>(
      `/api/racine/orchestration/alerts/${alertId}/acknowledge`,
      { method: 'POST', ...options }
    );
  }

  /**
   * Resolve system alert
   */
  async resolveAlert(
    alertId: UUID,
    resolution?: string,
    options?: RequestOptions
  ): Promise<APIResponse<void>> {
    return this.makeRequest<void>(
      `/api/racine/orchestration/alerts/${alertId}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify({ resolution }),
        ...options
      }
    );
  }

  // =============================================================================
  // CROSS-GROUP WORKFLOW EXECUTION
  // =============================================================================

  /**
   * Execute cross-group workflow
   */
  async executeWorkflow(
    request: ExecuteWorkflowRequest,
    options?: RequestOptions
  ): Promise<APIResponse<CrossGroupWorkflowResponse>> {
    return this.makeRequest<CrossGroupWorkflowResponse>(
      '/api/racine/orchestration/execute-workflow',
      {
        method: 'POST',
        body: JSON.stringify(request),
        ...options
      }
    );
  }

  /**
   * Get workflow execution status
   */
  async getWorkflowStatus(
    executionId: UUID,
    options?: RequestOptions
  ): Promise<APIResponse<CrossGroupWorkflowResponse>> {
    return this.makeRequest<CrossGroupWorkflowResponse>(
      `/api/racine/orchestration/workflows/${executionId}/status`,
      { method: 'GET', ...options }
    );
  }

  /**
   * Get workflow execution logs (streaming)
   */
  async *getWorkflowLogs(
    executionId: UUID,
    options?: RequestOptions
  ): AsyncGenerator<ExecutionLog, void, unknown> {
    const response = await fetch(
      `${this.config.baseURL}/api/racine/orchestration/workflows/${executionId}/logs/stream`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: options?.signal
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to stream logs: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const log = JSON.parse(line) as ExecutionLog;
              yield log;
            } catch (error) {
              console.warn('Failed to parse log line:', line, error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Control workflow execution (pause, resume, cancel)
   */
  async controlWorkflow(
    executionId: UUID,
    action: 'pause' | 'resume' | 'cancel',
    options?: RequestOptions
  ): Promise<APIResponse<void>> {
    return this.makeRequest<void>(
      `/api/racine/orchestration/workflows/${executionId}/control`,
      {
        method: 'POST',
        body: JSON.stringify({ action }),
        ...options
      }
    );
  }

  /**
   * Get workflow execution history
   */
  async getWorkflowHistory(
    workflowId?: UUID,
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    options?: RequestOptions
  ): Promise<APIResponse<CrossGroupWorkflowResponse[]>> {
    const params = new URLSearchParams();
    
    if (workflowId) params.append('workflowId', workflowId);
    if (pagination) {
      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.pageSize) params.append('pageSize', pagination.pageSize.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    }

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
      if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
    }

    const queryString = params.toString();
    const url = `/api/racine/orchestration/workflows/history${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<CrossGroupWorkflowResponse[]>(url, {
      method: 'GET',
      ...options
    });
  }

  // =============================================================================
  // PERFORMANCE OPTIMIZATION
  // =============================================================================

  /**
   * Request performance optimization analysis
   */
  async optimizePerformance(
    request: OptimizePerformanceRequest,
    options?: RequestOptions
  ): Promise<APIResponse<PerformanceOptimizationResponse>> {
    return this.makeRequest<PerformanceOptimizationResponse>(
      '/api/racine/orchestration/optimize-performance',
      {
        method: 'POST',
        body: JSON.stringify(request),
        ...options
      }
    );
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(
    orchestrationId?: UUID,
    pagination?: PaginationRequest,
    options?: RequestOptions
  ): Promise<APIResponse<OptimizationRecommendation[]>> {
    const params = new URLSearchParams();
    
    if (orchestrationId) params.append('orchestrationId', orchestrationId);
    if (pagination) {
      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.pageSize) params.append('pageSize', pagination.pageSize.toString());
    }

    const queryString = params.toString();
    const url = `/api/racine/orchestration/recommendations${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<OptimizationRecommendation[]>(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Implement optimization recommendation
   */
  async implementOptimization(
    recommendationId: UUID,
    dryRun: boolean = false,
    options?: RequestOptions
  ): Promise<APIResponse<any>> {
    return this.makeRequest(
      `/api/racine/orchestration/recommendations/${recommendationId}/implement`,
      {
        method: 'POST',
        body: JSON.stringify({ dryRun }),
        ...options
      }
    );
  }

  // =============================================================================
  // METRICS AND ANALYTICS
  // =============================================================================

  /**
   * Get cross-group metrics
   */
  async getMetrics(
    timeRange?: { start: ISODateString; end: ISODateString },
    groupIds?: string[],
    options?: RequestOptions
  ): Promise<APIResponse<PerformanceMetrics>> {
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('startDate', timeRange.start);
      params.append('endDate', timeRange.end);
    }
    
    if (groupIds && groupIds.length > 0) {
      groupIds.forEach(id => params.append('groupIds', id));
    }

    const queryString = params.toString();
    const url = `/api/racine/orchestration/metrics${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PerformanceMetrics>(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Get real-time metrics (streaming)
   */
  async *getMetricsStream(
    groupIds?: string[],
    options?: RequestOptions
  ): AsyncGenerator<PerformanceMetrics, void, unknown> {
    const params = new URLSearchParams();
    if (groupIds && groupIds.length > 0) {
      groupIds.forEach(id => params.append('groupIds', id));
    }

    const queryString = params.toString();
    const url = `/api/racine/orchestration/metrics/stream${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(`${this.config.baseURL}${url}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      signal: options?.signal
    });

    if (!response.ok) {
      throw new Error(`Failed to stream metrics: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const metrics = JSON.parse(line) as PerformanceMetrics;
              yield metrics;
            } catch (error) {
              console.warn('Failed to parse metrics line:', line, error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // =============================================================================
  // WEBSOCKET INTEGRATION FOR REAL-TIME UPDATES
  // =============================================================================

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    if (!this.config.enableWebSocket || !this.config.websocketURL) {
      return;
    }

    this.connectWebSocket();
  }

  /**
   * Connect to WebSocket
   */
  private connectWebSocket(): void {
    try {
      const wsUrl = `${this.config.websocketURL}/orchestration`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('Orchestration WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send authentication if available
        if (this.authToken) {
          this.websocket?.send(JSON.stringify({
            type: 'auth',
            token: this.authToken
          }));
        }
      };

      this.websocket.onmessage = (event) => {
        try {
          const orchestrationEvent = JSON.parse(event.data) as OrchestrationEvent;
          this.handleWebSocketEvent(orchestrationEvent);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', event.data, error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Orchestration WebSocket disconnected');
        this.handleWebSocketReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Orchestration WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Handle WebSocket reconnection
   */
  private handleWebSocketReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectWebSocket();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  /**
   * Handle incoming WebSocket events
   */
  private handleWebSocketEvent(event: OrchestrationEvent): void {
    // Notify all relevant subscribers
    for (const subscription of this.subscriptions.values()) {
      if (subscription.eventType === event.type) {
        if (!subscription.filter || subscription.filter(event)) {
          try {
            subscription.handler(event);
          } catch (error) {
            console.error('Error in event handler:', error);
          }
        }
      }
    }
  }

  /**
   * Subscribe to orchestration events
   */
  subscribeToEvents(
    eventType: OrchestrationEventType,
    handler: OrchestrationEventHandler,
    filter?: (event: OrchestrationEvent) => boolean
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    
    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      eventType,
      handler,
      filter
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from orchestration events
   */
  unsubscribeFromEvents(subscriptionId: UUID): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Send message via WebSocket
   */
  sendWebSocketMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Close WebSocket connection
   */
  closeWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.subscriptions.clear();
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Test connection to the orchestration API
   */
  async testConnection(options?: RequestOptions): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string }>('/api/racine/orchestration/ping', {
        method: 'GET',
        ...options
      });
      return response.success && response.data?.status === 'ok';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API version information
   */
  async getVersion(options?: RequestOptions): Promise<APIResponse<{ version: string; build: string }>> {
    return this.makeRequest<{ version: string; build: string }>('/api/racine/orchestration/version', {
      method: 'GET',
      ...options
    });
  }

  // =============================================================================
  // SCAN LOGIC INTEGRATION METHODS
  // =============================================================================

  /**
   * Get cross-group scans for workspace
   */
  async getCrossGroupScans(workspaceId: string): Promise<any[]> {
    const response = await this.makeRequest(`/workspaces/${workspaceId}/cross-group-scans`, {
      method: 'GET'
    });
    return response.success ? response.data : [];
  }

  /**
   * Coordinate cross-group scan execution
   */
  async coordinateCrossGroupScan(coordination: any): Promise<any> {
    return this.makeRequest('/scans/coordinate', {
      method: 'POST',
      data: coordination
    });
  }

  /**
   * Initialize scan logic integration for workspace
   */
  async initializeScanLogicIntegration(workspaceId: string): Promise<void> {
    await this.makeRequest(`/workspaces/${workspaceId}/scan-logic/initialize`, {
      method: 'POST'
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.closeWebSocket();
    this.subscriptions.clear();
  }
}

/**
 * Default orchestration API instance
 */
export const racineOrchestrationAPI = new RacineOrchestrationAPI();

/**
 * Data Source API Service
 * Maps to backend data source service endpoints
 */
export const dataSourceApis = {
  // Core CRUD operations
  async getAllDataSources(filters?: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources', {
      method: 'GET',
      params: filters
    });
  },

  async getDataSourceById(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}`, {
      method: 'GET'
    });
  },

  async getDataSourceByName(name: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/by-name/${name}`, {
      method: 'GET'
    });
  },

  async createDataSource(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources', {
      method: 'POST',
      data: config
    });
  },

  async updateDataSource(id: string, updates: any) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}`, {
      method: 'PUT',
      data: updates
    });
  },

  async deleteDataSource(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}`, {
      method: 'DELETE'
    });
  },

  // Templates and configuration
  async getDataSourceTemplates() {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/templates', {
      method: 'GET'
    });
  },

  async validateDataSourceConfig(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/validate', {
      method: 'POST',
      data: config
    });
  },

  async getConnectionRequirements(type: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/requirements/${type}`, {
      method: 'GET'
    });
  },

  async optimizeConnectionSettings(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/optimize', {
      method: 'POST',
      data: config
    });
  },

  // Performance and analytics
  async estimatePerformance(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/estimate-performance', {
      method: 'POST',
      data: config
    });
  },

  async getDataSourceMetrics(id: string, timeRange?: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/metrics`, {
      method: 'GET',
      params: { timeRange }
    });
  },

  async getDataSourceHealth(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/health`, {
      method: 'GET'
    });
  },

  async getDataSourceStats(filters?: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/stats', {
      method: 'GET',
      params: filters
    });
  },

  // Connection testing and validation
  async testConnection(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/test-connection', {
      method: 'POST',
      data: config
    });
  },

  async validateConnection(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/validate-connection', {
      method: 'POST',
      data: config
    });
  },

  async validateCredentials(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/validate-credentials', {
      method: 'POST',
      data: config
    });
  },

  async checkConnectivity(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/connectivity`, {
      method: 'GET'
    });
  },

  async performDiagnostics(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/diagnostics', {
      method: 'POST',
      data: config
    });
  },

  async analyzePerformance(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/analyze-performance', {
      method: 'POST',
      data: config
    });
  },

  async testSecurity(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/test-security', {
      method: 'POST',
      data: config
    });
  },

  async optimizeConnection(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/optimize-connection', {
      method: 'POST',
      data: config
    });
  },

  async runTestSuite(config: any, suite: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/test-suite', {
      method: 'POST',
      data: { config, suite }
    });
  },

  async getBestPractices(dataSourceType: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/best-practices/${dataSourceType}`, {
      method: 'GET'
    });
  },

  // Real-time monitoring
  async startRealTimeMonitoring(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/monitoring/start`, {
      method: 'POST'
    });
  },

  async stopRealTimeMonitoring(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/monitoring/stop`, {
      method: 'POST'
    });
  },

  async getRealTimeStatus(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/status`, {
      method: 'GET'
    });
  },

  // Historical data
  async getConnectionHistory(id?: string, timeRange?: string) {
    const endpoint = id 
      ? `/api/v1/data-sources/${id}/connection-history`
      : '/api/v1/data-sources/connection-history';
    return racineOrchestrationAPI.makeRequest(endpoint, {
      method: 'GET',
      params: { timeRange }
    });
  },

  async getPerformanceHistory(id: string, timeRange?: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/performance-history`, {
      method: 'GET',
      params: { timeRange }
    });
  },

  // Security and compliance
  async validateSecurityCompliance(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/validate-security', {
      method: 'POST',
      data: config
    });
  },

  async encryptCredentials(credentials: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/encrypt-credentials', {
      method: 'POST',
      data: credentials
    });
  },

  async testConnectionSecurity(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/test-security`, {
      method: 'POST'
    });
  },

  async refreshDataSourceStatus(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/refresh-status`, {
      method: 'POST'
    });
  },

  // Advanced operations
  async cloneDataSource(id: string, newName: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/clone`, {
      method: 'POST',
      data: { newName }
    });
  },

  async exportDataSourceConfig(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/data-sources/${id}/export`, {
      method: 'GET'
    });
  },

  async importDataSourceConfig(config: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/import', {
      method: 'POST',
      data: config
    });
  },

  // Troubleshooting
  async troubleshootConnection(config: any, error?: string) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/troubleshoot', {
      method: 'POST',
      data: { config, error }
    });
  },

  async getSuggestedFixes(error: string, dataSourceType: string) {
    return racineOrchestrationAPI.makeRequest('/api/v1/data-sources/suggested-fixes', {
      method: 'POST',
      data: { error, dataSourceType }
    });
  }
};

/**
 * Scan Rule Set API Service
 * Maps to backend scan rule set service endpoints
 */
export const scanRuleSetApis = {
  // Core CRUD operations
  async getAllRuleSets(filters?: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets', {
      method: 'GET',
      params: filters
    });
  },

  async getRuleSetById(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}`, {
      method: 'GET'
    });
  },

  async createRuleSet(ruleSet: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets', {
      method: 'POST',
      data: ruleSet
    });
  },

  async updateRuleSet(id: string, updates: any) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}`, {
      method: 'PUT',
      data: updates
    });
  },

  async deleteRuleSet(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}`, {
      method: 'DELETE'
    });
  },

  async duplicateRuleSet(id: string, newName: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/duplicate`, {
      method: 'POST',
      data: { newName }
    });
  },

  // Rule management
  async addRule(ruleSetId: string, rule: any) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${ruleSetId}/rules`, {
      method: 'POST',
      data: rule
    });
  },

  async updateRule(ruleSetId: string, ruleId: string, updates: any) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${ruleSetId}/rules/${ruleId}`, {
      method: 'PUT',
      data: updates
    });
  },

  async deleteRule(ruleSetId: string, ruleId: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${ruleSetId}/rules/${ruleId}`, {
      method: 'DELETE'
    });
  },

  async reorderRules(ruleSetId: string, ruleIds: string[]) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${ruleSetId}/rules/reorder`, {
      method: 'PUT',
      data: { ruleIds }
    });
  },

  // Rule validation and testing
  async validateRule(rule: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/validate-rule', {
      method: 'POST',
      data: rule
    });
  },

  async testRule(rule: any, testData: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/test-rule', {
      method: 'POST',
      data: { rule, testData }
    });
  },

  async validateRuleSet(ruleSet: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/validate', {
      method: 'POST',
      data: ruleSet
    });
  },

  // Execution operations
  async executeRuleSet(id: string, dataSourceId: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/execute`, {
      method: 'POST',
      data: { dataSourceId }
    });
  },

  async scheduleRuleSet(id: string, schedule: any) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/schedule`, {
      method: 'POST',
      data: schedule
    });
  },

  async cancelExecution(executionId: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/executions/${executionId}/cancel`, {
      method: 'POST'
    });
  },

  async getActiveExecutions() {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/executions/active', {
      method: 'GET'
    });
  },

  // Analytics and metrics
  async getRuleSetMetrics(id: string, timeRange?: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/metrics`, {
      method: 'GET',
      params: { timeRange }
    });
  },

  async getExecutionHistory(id: string, limit?: number) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/executions`, {
      method: 'GET',
      params: { limit }
    });
  },

  async getRuleSetStats(filters?: any) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/stats', {
      method: 'GET',
      params: filters
    });
  },

  // Templates and optimization
  async getRuleTemplates() {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/templates', {
      method: 'GET'
    });
  },

  async createFromTemplate(templateId: string, name: string) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/templates/create', {
      method: 'POST',
      data: { templateId, name }
    });
  },

  async optimizeRuleSet(id: string) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/optimize`, {
      method: 'POST'
    });
  },

  async applyOptimization(id: string, optimization: any) {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/optimize/apply`, {
      method: 'POST',
      data: optimization
    });
  },

  // Import/Export
  async exportRuleSet(id: string, format: 'json' | 'yaml' = 'json') {
    return racineOrchestrationAPI.makeRequest(`/api/v1/scan-rule-sets/${id}/export`, {
      method: 'GET',
      params: { format },
      responseType: 'blob'
    });
  },

  async importRuleSet(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/import', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Bulk operations
  async bulkUpdateRuleSets(updates: { id: string; updates: any }[]) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/bulk-update', {
      method: 'PUT',
      data: { updates }
    });
  },

  async bulkDeleteRuleSets(ids: string[]) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/bulk-delete', {
      method: 'DELETE',
      data: { ids }
    });
  },

  async bulkExecuteRuleSets(ids: string[], dataSourceId: string) {
    return racineOrchestrationAPI.makeRequest('/api/v1/scan-rule-sets/bulk-execute', {
      method: 'POST',
      data: { ids, dataSourceId }
    });
  }
};

/**
 * Export types for external use
 */
export type {
  OrchestrationAPIConfig,
  OrchestrationEvent,
  OrchestrationEventHandler,
  RequestOptions
};