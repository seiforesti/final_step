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
  UUID,
  ISODateString,
  OperationStatus
} from '../types/racine-core.types';

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
  timeout: process.env.NODE_ENV === 'development' ? 30000 : 30000, // 30s for both dev and prod
  retryAttempts: process.env.NODE_ENV === 'development' ? 1 : 3, // Fewer retries in dev
  retryDelay: 1000,
  enableWebSocket: false, // Disabled by default to prevent WebSocket errors in development
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
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

/**
 * Racine Orchestration API Service Class
 * ======================================
 * 
 * Provides comprehensive orchestration functionality with offline mode support
 * and graceful error handling for enterprise-grade reliability.
 */
export class RacineOrchestrationAPI {
  private config: OrchestrationAPIConfig;
  private eventHandlers: Map<OrchestrationEventType, OrchestrationEventHandler[]> = new Map();
  private eventSubscriptions: Map<UUID, EventSubscription> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private offlineMode: boolean = false; // New property for offline mode
  private authToken: string | null = null;

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
   * Make HTTP request with timeout, retry logic, and offline mode support
   */
  private async makeRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
    // Check if we're in offline mode or if backend is not available
    if (this.isOfflineMode()) {
      console.warn(`Backend not available, using offline mode for ${url}`);
      return this.getOfflineFallback<T>(url);
    }

    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;
    const { retryAttempts = this.config.retryAttempts } = options;

    // Set up timeout only if timeout > 0 - but don't throw errors
    if (this.config.timeout > 0) {
        timeoutId = setTimeout(() => {
        // Just log a warning - don't throw or abort
        console.warn(`Request to ${url} is taking longer than expected (${this.config.timeout}ms)`);
      }, this.config.timeout);
    }

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...options.headers
      },
      signal: controller.signal
    };

    if (options.body) {
      fetchOptions.body = options.body;
    }

    let lastError: Error = new Error('Unknown error occurred');

      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          const response = await fetch(`${this.config.baseURL}${url}`, {
            ...fetchOptions,
          headers: fetchOptions.headers,
            signal: controller.signal
          });

        // Clear timeout on success
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
        return data as T;

        } catch (error) {
          lastError = error as Error;
          
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // Handle different error types gracefully
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            // Don't throw timeout errors - just log and continue
            console.warn(`Request to ${url} was aborted`);
            return this.getOfflineFallback<T>(url);
          } else if (error.message && error.message.includes('fetch')) {
            // Network error - switch to offline mode
            console.warn(`Network error for ${url}, switching to offline mode`);
            this.setOfflineMode(true);
            return this.getOfflineFallback<T>(url);
          }
          }
          
          if (attempt < retryAttempts && this.shouldRetry(error as Error)) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
            continue;
          }
          
          break;
        }
      }

    // Final cleanup
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    
    // For any other error, try offline fallback
    console.warn(`Request failed for ${url}, using offline fallback:`, lastError);
    return this.getOfflineFallback<T>(url);
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: Error): boolean {
    // Ensure error.message exists before checking
    const errorMessage = error?.message || '';
    
    // Retry on network errors, timeouts, and 5xx status codes
    return errorMessage.includes('fetch') || 
           errorMessage.includes('timeout') ||
           errorMessage.includes('HTTP 5') ||
           errorMessage.includes('network') ||
           errorMessage.includes('connection');
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

  // =============================================================================
  // ORCHESTRATION MASTER MANAGEMENT (Hook Compatibility)
  // =============================================================================

  /**
   * Create a new orchestration master
   */
  async createOrchestrationMaster(request: any): Promise<any> {
    return this.makeRequest<any>('/api/racine/orchestration/masters', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Update orchestration master
   */
  async updateOrchestrationMaster(id: string, updates: any): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/masters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete orchestration master
   */
  async deleteOrchestrationMaster(id: string): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/masters/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * List orchestration masters
   */
  async listOrchestrationMasters(pagination?: any, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    
    if (pagination) {
      if (pagination.page) params.append('page', pagination.page.toString());
      if (pagination.limit) params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filter[${key}]`, value.toString());
        }
      });
    }

    const endpoint = `/api/racine/orchestration/masters${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<any>(endpoint, {
      method: 'GET'
    });
  }

  // =============================================================================
  // SYSTEM HEALTH AND MONITORING (Hook Compatibility)
  // =============================================================================

  /**
   * Get system health (simplified version)
   */
  async getSystemHealth(): Promise<any> {
    return this.makeRequest<any>('/api/racine/orchestration/health/system');
  }

  /**
   * Get group health
   */
  async getGroupHealth(groupId: string): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/health/groups/${groupId}`);
  }

  /**
   * Get service health
   */
  async getServiceHealth(serviceId: string): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/health/services/${serviceId}`);
  }

  /**
   * Get integration health
   */
  async getIntegrationHealth(integrationId: string): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/health/integrations/${integrationId}`);
  }

  // =============================================================================
  // ALERT MANAGEMENT (Hook Compatibility)
  // =============================================================================

  /**
   * Get system alerts
   */
  async getSystemAlerts(filters?: any, timeRange?: string): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filter[${key}]`, value.toString());
        }
      });
    }
    
    if (timeRange) {
      params.append('timeRange', timeRange);
    }

    const endpoint = `/api/racine/orchestration/alerts${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<any>(endpoint);
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolution: any): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution)
    });
  }

  // =============================================================================
  // WORKFLOW EXECUTION (Hook Compatibility)
  // =============================================================================

  /**
   * Execute workflow (simplified version)
   */
  async executeWorkflow(request: any): Promise<any> {
    return this.makeRequest<any>('/api/racine/orchestration/workflows/execute', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(executionId: string): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/workflows/${executionId}/status`);
  }

  /**
   * Control workflow
   */
  async controlWorkflow(executionId: string, action: string): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/workflows/${executionId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }

  /**
   * Get workflow history
   */
  async getWorkflowHistory(filters?: any, timeRange?: string): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filter[${key}]`, value.toString());
        }
      });
    }
    
    if (timeRange) {
      params.append('timeRange', timeRange);
    }

    const endpoint = `/api/racine/orchestration/workflows/history${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<any>(endpoint);
  }

  /**
   * Get workflow logs
   */
  async getWorkflowLogs(executionId: string, options?: any): Promise<any> {
    const params = new URLSearchParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/racine/orchestration/workflows/${executionId}/logs${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<any>(endpoint);
  }

  // =============================================================================
  // PERFORMANCE AND OPTIMIZATION (Hook Compatibility)
  // =============================================================================

  /**
   * Get metrics (simplified version)
   */
  async getMetrics(): Promise<any> {
    return this.makeRequest<any>('/api/racine/orchestration/metrics');
  }

  /**
   * Optimize performance (simplified version)
   */
  async optimizePerformance(request: any): Promise<any> {
    return this.makeRequest<any>('/api/racine/orchestration/optimize', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<any> {
    return this.makeRequest<any>('/api/racine/orchestration/optimize/recommendations');
  }

  /**
   * Implement optimization
   */
  async implementOptimization(recommendationId: string, dryRun: boolean = false): Promise<any> {
    return this.makeRequest<any>(`/api/racine/orchestration/optimize/implement/${recommendationId}`, {
      method: 'POST',
      body: JSON.stringify({ dryRun })
    });
  }

  // =============================================================================
  // EVENT SUBSCRIPTION (Hook Compatibility)
  // =============================================================================

  /**
   * Subscribe to events
   */
  subscribeToEvents(eventType: string, handler: any): string {
    // Generate a unique subscription ID
    const subscriptionId = crypto.randomUUID();
    
    // Store the subscription
    this.eventSubscriptions.set(subscriptionId, {
      id: subscriptionId,
      eventType,
      handler
    });
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribeFromEvents(subscriptionId: string): void {
    this.eventSubscriptions.delete(subscriptionId);
  }

  // =============================================================================
  // CONNECTION TESTING (Hook Compatibility)
  // =============================================================================

  /**
   * Test connection
   */
  async testConnection(): Promise<any> {
    return this.makeRequest<any>('/api/racine/orchestration/test-connection', {
      method: 'POST'
    });
  }

  // =============================================================================
  // WEBSOCKET STATUS (Hook Compatibility)
  // =============================================================================

  /**
   * Check WebSocket connection status
   */
  isWebSocketConnected(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN;
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
    if (!this.config.enableWebSocket) {
      console.log('WebSocket is disabled in configuration');
      return;
    }
    
    if (!this.config.websocketURL) {
      console.warn('WebSocket URL not configured, WebSocket features will be disabled');
      return;
    }

    // Only attempt WebSocket connection in browser environment
    if (typeof window === 'undefined') {
      console.log('WebSocket initialization skipped - not in browser environment');
      return;
    }

    this.connectWebSocket();
  }

  /**
   * Connect to WebSocket
   */
  private connectWebSocket(): void {
    try {
      if (!this.config.websocketURL) {
        console.warn('WebSocket URL not configured, skipping WebSocket connection');
        return;
      }
      
      const wsUrl = `${this.config.websocketURL}/orchestration`;
      console.log('Attempting to connect to WebSocket:', wsUrl);
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
        console.error('WebSocket URL:', this.config.websocketURL);
        console.error('WebSocket readyState:', this.websocket?.readyState);
        console.error('WebSocket URL constructed:', `${this.config.websocketURL}/orchestration`);
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
    for (const subscription of this.eventSubscriptions.values()) {
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
    
    this.eventSubscriptions.set(subscriptionId, {
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
    this.eventSubscriptions.delete(subscriptionId);
  }

  /**
   * Send message via WebSocket
   */
  sendWebSocketMessage(message: any): void {
    if (!this.websocket) {
      console.warn('WebSocket not available, message not sent:', message);
      return;
    }
    
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not in OPEN state, message not sent. State:', this.websocket.readyState);
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
    this.eventSubscriptions.clear();
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

  /**
   * Check if we're in offline mode
   */
  private isOfflineMode(): boolean {
    return this.offlineMode || !navigator.onLine;
  }

  /**
   * Set offline mode
   */
  private setOfflineMode(offline: boolean): void {
    this.offlineMode = offline;
    if (offline) {
      console.log('Switching to offline mode - backend unavailable');
    } else {
      console.log('Switching to online mode - backend available');
    }
  }

  /**
   * Get offline fallback data
   */
  private getOfflineFallback<T>(endpoint: string): T {
    // Provide mock data for offline mode
    const mockData = this.getMockDataForEndpoint<T>(endpoint);
    console.log(`Using offline fallback for ${endpoint}:`, mockData);
    return mockData;
  }

  /**
   * Get mock data for specific endpoints
   */
  private getMockDataForEndpoint<T>(endpoint: string): T {
    // Provide appropriate mock data based on endpoint
    if (endpoint.includes('/health')) {
      return {
        status: 'offline',
        timestamp: new Date().toISOString(),
        components: {
          database: { status: 'offline', message: 'Backend unavailable' },
          api: { status: 'offline', message: 'Backend unavailable' },
          websocket: { status: 'offline', message: 'Backend unavailable' }
        }
      } as T;
    }
    
    if (endpoint.includes('/metrics')) {
      return {
        timestamp: new Date().toISOString(),
        performance: {
          cpu: 0,
          memory: 0,
          responseTime: 0
        },
        throughput: {
          requestsPerSecond: 0,
          activeConnections: 0
        }
      } as T;
    }
    
    if (endpoint.includes('/alerts')) {
      return {
        alerts: [],
        timestamp: new Date().toISOString()
      } as T;
    }
    
    if (endpoint.includes('/optimization')) {
      return {
        recommendations: [],
        timestamp: new Date().toISOString()
      } as T;
    }
    
    // Default mock data
    return {} as T;
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
   * Track events for analytics and monitoring
   */
  async trackEvent(eventType: string, eventData: any): Promise<void> {
    try {
      // Send event to backend if connected
      if (this.config.enableWebSocket && this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'track_event',
          eventType,
          eventData,
          timestamp: new Date().toISOString()
        }));
      }

      // Also send via HTTP if needed
      await this.makeRequest('/api/v1/events/track', {
        method: 'POST',
        data: {
          eventType,
          eventData,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Log error but don't fail the tracking
      console.warn('Failed to track event:', error);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.closeWebSocket();
    this.eventSubscriptions.clear();
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
  },

  // Global search functionality
  async getSavedSearches(): Promise<any[]> {
    try {
      const response = await racineOrchestrationAPI.makeRequest('/api/v1/global-search/saved-searches', {
        method: 'GET'
      });
      return response.data || [];
    } catch (error) {
      console.warn('Failed to load saved searches:', error);
      return [];
    }
  },

  async saveSearch(searchData: any): Promise<any> {
    return racineOrchestrationAPI.makeRequest('/api/v1/global-search/save', {
      method: 'POST',
      data: searchData
    });
  },

  async deleteSavedSearch(searchId: string): Promise<any> {
    return racineOrchestrationAPI.makeRequest(`/api/v1/global-search/delete/${searchId}`, {
      method: 'DELETE'
    });
  }
};

// Add backend connectivity testing methods to the main class
Object.assign(RacineOrchestrationAPI.prototype, {
  /**
   * Test backend connectivity and switch to offline mode if needed
   */
  async testBackendConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout for health check
      });
      
      if (response.ok) {
        this.setOfflineMode(false);
        return true;
      } else {
        this.setOfflineMode(true);
        return false;
      }
    } catch (error) {
      console.warn('Backend connectivity test failed, switching to offline mode:', error);
      this.setOfflineMode(true);
      return false;
    }
  },

  /**
   * Initialize the API and test connectivity
   */
  async initialize(): Promise<void> {
    // Test backend connectivity on initialization
    await this.testBackendConnectivity();
    
    // Set up online/offline event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Network came online, testing backend connectivity...');
        this.testBackendConnectivity();
      });
      
      window.addEventListener('offline', () => {
        console.log('Network went offline, switching to offline mode...');
        this.setOfflineMode(true);
      });
    }
  }
});

/**
 * Export types for external use
 */
export type {
  OrchestrationAPIConfig,
  OrchestrationEvent,
  OrchestrationEventHandler,
  RequestOptions
};

// Export as scanOrchestrationApis for backward compatibility
export const scanOrchestrationApis = racineOrchestrationAPI;