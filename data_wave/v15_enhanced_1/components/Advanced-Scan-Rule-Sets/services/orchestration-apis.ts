// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE ORCHESTRATION API SERVICE
// Enterprise-Core Implementation with Full Backend Integration
// Maps to: unified_scan_orchestrator.py (55KB), scan_orchestration_service.py (61KB)
//          scan_workflow_engine.py (34KB), enterprise_scan_orchestrator.py (33KB)
// ============================================================================

import { 
  OrchestrationEngine,
  OrchestrationCapability,
  ResourcePool,
  WorkflowOrchestrator,
  WorkflowTemplate,
  ActiveWorkflow,
  ScanOrchestrationJob,
  WorkflowDefinition,
  WorkflowStep,
  ExecutionContext,
  ResourceAllocation,
  JobProgress,
  JobDependency,
  SchedulingEngine,
  Schedule,
  OrchestrationMonitoring,
  RealTimeMetrics,
  OrchestrationOptimization,
  OrchestrationIntegration,
  APIResponse,
  APIError
} from '../types/orchestration.types';

// Enterprise API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const ORCHESTRATION_ENDPOINT = `${API_BASE_URL}/scan-orchestration`;

/**
 * Enterprise-Grade Orchestration API Service
 * Comprehensive integration with backend orchestration services
 * Features: Unified Orchestration, Workflow Management, Resource Optimization
 */
export class OrchestrationAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  private wsConnections: Map<string, WebSocket>;
  private retryConfig: { attempts: number; delay: number };

  constructor() {
    this.baseURL = ORCHESTRATION_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '2.0.0',
      'X-Feature-Flags': 'unified-orchestration,advanced-scheduling,real-time-monitoring'
    };
    this.wsConnections = new Map();
    this.retryConfig = { attempts: 3, delay: 1000 };
  }

  // ============================================================================
  // AUTHENTICATION & REQUEST HANDLING
  // ============================================================================

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const orgId = localStorage.getItem('organization_id');
    const userId = localStorage.getItem('user_id');
    
    return {
      ...this.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(orgId && { 'X-Organization-ID': orgId }),
      ...(userId && { 'X-User-ID': userId }),
      'X-Request-ID': this.generateRequestId(),
      'X-Timestamp': new Date().toISOString()
    };
  }

  private generateRequestId(): string {
    return `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError({
        code: response.status.toString(),
        message: errorData.message || response.statusText,
        details: errorData.details || {},
        timestamp: new Date().toISOString(),
      });
    }
    return response.json();
  }

  // ============================================================================
  // ORCHESTRATION ENGINE MANAGEMENT
  // Maps to unified_scan_orchestrator.py and enterprise_scan_orchestrator.py
  // ============================================================================

  /**
   * Get all orchestration engines with capabilities
   * Endpoint: GET /scan-orchestration/engines
   */
  async getOrchestrationEngines(options: {
    includeCapabilities?: boolean;
    includeMetrics?: boolean;
    status?: 'active' | 'inactive' | 'maintenance';
  } = {}): Promise<APIResponse<OrchestrationEngine[]>> {
    const params = new URLSearchParams();
    
    if (options.includeCapabilities) params.append('include_capabilities', 'true');
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.status) params.append('status', options.status);

    const response = await fetch(`${this.baseURL}/engines?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<OrchestrationEngine[]>>(response);
  }

  /**
   * Get specific orchestration engine with detailed information
   * Endpoint: GET /scan-orchestration/engines/{id}
   */
  async getOrchestrationEngine(
    id: string,
    options: {
      includeResourcePools?: boolean;
      includeActiveJobs?: boolean;
      includePerformanceMetrics?: boolean;
    } = {}
  ): Promise<APIResponse<OrchestrationEngine & {
    resourcePools?: ResourcePool[];
    activeJobs?: ScanOrchestrationJob[];
    performanceMetrics?: any;
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeResourcePools) params.append('include_resource_pools', 'true');
    if (options.includeActiveJobs) params.append('include_active_jobs', 'true');
    if (options.includePerformanceMetrics) params.append('include_performance_metrics', 'true');

    const response = await fetch(`${this.baseURL}/engines/${id}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<OrchestrationEngine & {
      resourcePools?: ResourcePool[];
      activeJobs?: ScanOrchestrationJob[];
      performanceMetrics?: any;
    }>>(response);
  }

  /**
   * Create new orchestration engine
   * Endpoint: POST /scan-orchestration/engines
   */
  async createOrchestrationEngine(
    engine: Omit<OrchestrationEngine, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      autoConfigureResources?: boolean;
      enableMonitoring?: boolean;
      setupIntegrations?: boolean;
    } = {}
  ): Promise<APIResponse<OrchestrationEngine & {
    setupResults?: any;
    resourceConfiguration?: any;
  }>> {
    const requestBody = {
      ...engine,
      options: {
        auto_configure_resources: options.autoConfigureResources,
        enable_monitoring: options.enableMonitoring,
        setup_integrations: options.setupIntegrations
      }
    };

    const response = await fetch(`${this.baseURL}/engines`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<OrchestrationEngine & {
      setupResults?: any;
      resourceConfiguration?: any;
    }>>(response);
  }

  /**
   * Update orchestration engine configuration
   * Endpoint: PUT /scan-orchestration/engines/{id}
   */
  async updateOrchestrationEngine(
    id: string,
    updates: Partial<OrchestrationEngine>,
    options: {
      validateConfiguration?: boolean;
      applyImmediately?: boolean;
      notifyDependentJobs?: boolean;
    } = {}
  ): Promise<APIResponse<OrchestrationEngine & {
    validationResults?: any;
    impactAnalysis?: any;
  }>> {
    const requestBody = {
      updates,
      options: {
        validate_configuration: options.validateConfiguration,
        apply_immediately: options.applyImmediately,
        notify_dependent_jobs: options.notifyDependentJobs
      }
    };

    const response = await fetch(`${this.baseURL}/engines/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<OrchestrationEngine & {
      validationResults?: any;
      impactAnalysis?: any;
    }>>(response);
  }

  // ============================================================================
  // WORKFLOW ORCHESTRATION MANAGEMENT
  // Maps to scan_workflow_engine.py
  // ============================================================================

  /**
   * Get workflow orchestrators with templates and active workflows
   * Endpoint: GET /scan-orchestration/workflows
   */
  async getWorkflowOrchestrators(options: {
    includeTemplates?: boolean;
    includeActiveWorkflows?: boolean;
    engineId?: string;
  } = {}): Promise<APIResponse<WorkflowOrchestrator[]>> {
    const params = new URLSearchParams();
    
    if (options.includeTemplates) params.append('include_templates', 'true');
    if (options.includeActiveWorkflows) params.append('include_active_workflows', 'true');
    if (options.engineId) params.append('engine_id', options.engineId);

    const response = await fetch(`${this.baseURL}/workflows?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<WorkflowOrchestrator[]>>(response);
  }

  /**
   * Create workflow orchestrator with advanced configuration
   * Endpoint: POST /scan-orchestration/workflows
   */
  async createWorkflowOrchestrator(
    orchestrator: Omit<WorkflowOrchestrator, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      createDefaultTemplates?: boolean;
      enableAdvancedFeatures?: boolean;
      setupMonitoring?: boolean;
    } = {}
  ): Promise<APIResponse<WorkflowOrchestrator & {
    defaultTemplates?: WorkflowTemplate[];
    monitoringSetup?: any;
  }>> {
    const requestBody = {
      ...orchestrator,
      options: {
        create_default_templates: options.createDefaultTemplates,
        enable_advanced_features: options.enableAdvancedFeatures,
        setup_monitoring: options.setupMonitoring
      }
    };

    const response = await fetch(`${this.baseURL}/workflows`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<WorkflowOrchestrator & {
      defaultTemplates?: WorkflowTemplate[];
      monitoringSetup?: any;
    }>>(response);
  }

  // ============================================================================
  // WORKFLOW TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Get workflow templates with usage statistics
   * Endpoint: GET /scan-orchestration/workflow-templates
   */
  async getWorkflowTemplates(options: {
    category?: string;
    complexity?: 'simple' | 'moderate' | 'complex' | 'advanced';
    includeUsageStats?: boolean;
    includeVersionHistory?: boolean;
  } = {}): Promise<APIResponse<WorkflowTemplate[]>> {
    const params = new URLSearchParams();
    
    if (options.category) params.append('category', options.category);
    if (options.complexity) params.append('complexity', options.complexity);
    if (options.includeUsageStats) params.append('include_usage_stats', 'true');
    if (options.includeVersionHistory) params.append('include_version_history', 'true');

    const response = await fetch(`${this.baseURL}/workflow-templates?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<WorkflowTemplate[]>>(response);
  }

  /**
   * Create workflow template with validation
   * Endpoint: POST /scan-orchestration/workflow-templates
   */
  async createWorkflowTemplate(
    template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      validateWorkflow?: boolean;
      createFromExisting?: string;
      enableVersioning?: boolean;
    } = {}
  ): Promise<APIResponse<WorkflowTemplate & {
    validationResults?: any;
    versionInfo?: any;
  }>> {
    const requestBody = {
      ...template,
      options: {
        validate_workflow: options.validateWorkflow,
        create_from_existing: options.createFromExisting,
        enable_versioning: options.enableVersioning
      }
    };

    const response = await fetch(`${this.baseURL}/workflow-templates`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<WorkflowTemplate & {
      validationResults?: any;
      versionInfo?: any;
    }>>(response);
  }

  // ============================================================================
  // JOB ORCHESTRATION & EXECUTION
  // Maps to scan_orchestration_service.py
  // ============================================================================

  /**
   * Get orchestration jobs with filtering and monitoring
   * Endpoint: GET /scan-orchestration/jobs
   */
  async getOrchestrationJobs(options: {
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    engineId?: string;
    workflowId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    page?: number;
    limit?: number;
    includeProgress?: boolean;
    includeMetrics?: boolean;
  } = {}): Promise<APIResponse<ScanOrchestrationJob[]> & {
    pagination: any;
    aggregatedMetrics?: any;
  }> {
    const params = new URLSearchParams();
    
    if (options.status) params.append('status', options.status);
    if (options.engineId) params.append('engine_id', options.engineId);
    if (options.workflowId) params.append('workflow_id', options.workflowId);
    if (options.priority) params.append('priority', options.priority);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.includeProgress) params.append('include_progress', 'true');
    if (options.includeMetrics) params.append('include_metrics', 'true');

    const response = await fetch(`${this.baseURL}/jobs?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<ScanOrchestrationJob[]> & {
      pagination: any;
      aggregatedMetrics?: any;
    }>(response);
  }

  /**
   * Create orchestration job with advanced configuration
   * Endpoint: POST /scan-orchestration/jobs
   */
  async createOrchestrationJob(
    job: Omit<ScanOrchestrationJob, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      validateDependencies?: boolean;
      optimizeResources?: boolean;
      enableRealTimeMonitoring?: boolean;
      autoRetry?: boolean;
    } = {}
  ): Promise<APIResponse<ScanOrchestrationJob & {
    dependencyValidation?: any;
    resourceOptimization?: any;
    monitoringSetup?: any;
  }>> {
    const requestBody = {
      ...job,
      options: {
        validate_dependencies: options.validateDependencies,
        optimize_resources: options.optimizeResources,
        enable_real_time_monitoring: options.enableRealTimeMonitoring,
        auto_retry: options.autoRetry
      }
    };

    const response = await fetch(`${this.baseURL}/jobs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<ScanOrchestrationJob & {
      dependencyValidation?: any;
      resourceOptimization?: any;
      monitoringSetup?: any;
    }>>(response);
  }

  // ============================================================================
  // JOB EXECUTION CONTROL & MONITORING
  // ============================================================================

  /**
   * Start orchestration job execution
   * Endpoint: POST /scan-orchestration/jobs/{id}/start
   */
  async startOrchestrationJob(
    id: string,
    executionConfig: {
      context?: ExecutionContext;
      overrideResources?: ResourceAllocation;
      notificationSettings?: any;
      checkpointConfig?: any;
    } = {}
  ): Promise<APIResponse<{
    executionId: string;
    estimatedDuration: number;
    resourceAllocation: ResourceAllocation;
    monitoringUrls: string[];
  }>> {
    const response = await fetch(`${this.baseURL}/jobs/${id}/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(executionConfig),
    });

    return this.handleResponse<APIResponse<{
      executionId: string;
      estimatedDuration: number;
      resourceAllocation: ResourceAllocation;
      monitoringUrls: string[];
    }>>(response);
  }

  /**
   * Get real-time job progress and metrics
   * Endpoint: GET /scan-orchestration/jobs/{id}/progress
   */
  async getJobProgress(
    id: string,
    options: {
      includeDetailedMetrics?: boolean;
      includeResourceUsage?: boolean;
      includeLogs?: boolean;
    } = {}
  ): Promise<APIResponse<JobProgress & {
    detailedMetrics?: any;
    resourceUsage?: any;
    recentLogs?: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeDetailedMetrics) params.append('include_detailed_metrics', 'true');
    if (options.includeResourceUsage) params.append('include_resource_usage', 'true');
    if (options.includeLogs) params.append('include_logs', 'true');

    const response = await fetch(`${this.baseURL}/jobs/${id}/progress?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<JobProgress & {
      detailedMetrics?: any;
      resourceUsage?: any;
      recentLogs?: any[];
    }>>(response);
  }

  /**
   * Control job execution (pause, resume, cancel)
   * Endpoint: POST /scan-orchestration/jobs/{id}/control
   */
  async controlJobExecution(
    id: string,
    action: 'pause' | 'resume' | 'cancel' | 'restart',
    options: {
      gracefulShutdown?: boolean;
      saveCheckpoint?: boolean;
      notifyStakeholders?: boolean;
    } = {}
  ): Promise<APIResponse<{
    success: boolean;
    newStatus: string;
    checkpointId?: string;
    notifications?: any[];
  }>> {
    const requestBody = {
      action,
      options: {
        graceful_shutdown: options.gracefulShutdown,
        save_checkpoint: options.saveCheckpoint,
        notify_stakeholders: options.notifyStakeholders
      }
    };

    const response = await fetch(`${this.baseURL}/jobs/${id}/control`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      success: boolean;
      newStatus: string;
      checkpointId?: string;
      notifications?: any[];
    }>>(response);
  }

  // ============================================================================
  // RESOURCE MANAGEMENT & OPTIMIZATION
  // ============================================================================

  /**
   * Get resource pools with utilization metrics
   * Endpoint: GET /scan-orchestration/resources/pools
   */
  async getResourcePools(options: {
    includeUtilization?: boolean;
    includeCapacity?: boolean;
    poolType?: string;
  } = {}): Promise<APIResponse<ResourcePool[]>> {
    const params = new URLSearchParams();
    
    if (options.includeUtilization) params.append('include_utilization', 'true');
    if (options.includeCapacity) params.append('include_capacity', 'true');
    if (options.poolType) params.append('pool_type', options.poolType);

    const response = await fetch(`${this.baseURL}/resources/pools?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<ResourcePool[]>>(response);
  }

  /**
   * Allocate resources for job execution
   * Endpoint: POST /scan-orchestration/resources/allocate
   */
  async allocateResources(
    allocationRequest: {
      jobId: string;
      resourceRequirements: any;
      priority: 'low' | 'medium' | 'high' | 'critical';
      duration?: number;
      constraints?: any;
    }
  ): Promise<APIResponse<ResourceAllocation & {
    allocationStrategy: any;
    estimatedCost: number;
    alternatives?: any[];
  }>> {
    const response = await fetch(`${this.baseURL}/resources/allocate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(allocationRequest),
    });

    return this.handleResponse<APIResponse<ResourceAllocation & {
      allocationStrategy: any;
      estimatedCost: number;
      alternatives?: any[];
    }>>(response);
  }

  /**
   * Optimize resource allocation across jobs
   * Endpoint: POST /scan-orchestration/resources/optimize
   */
  async optimizeResourceAllocation(
    optimizationConfig: {
      scope: 'global' | 'engine' | 'workflow';
      objectives: ('cost' | 'performance' | 'utilization' | 'fairness')[];
      constraints?: any;
      timeHorizon?: number;
    }
  ): Promise<APIResponse<{
    optimizationId: string;
    recommendations: any[];
    projectedSavings: number;
    impactAnalysis: any;
  }>> {
    const response = await fetch(`${this.baseURL}/resources/optimize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(optimizationConfig),
    });

    return this.handleResponse<APIResponse<{
      optimizationId: string;
      recommendations: any[];
      projectedSavings: number;
      impactAnalysis: any;
    }>>(response);
  }

  // ============================================================================
  // SCHEDULING & AUTOMATION
  // ============================================================================

  /**
   * Get scheduling engines and their configurations
   * Endpoint: GET /scan-orchestration/scheduling/engines
   */
  async getSchedulingEngines(): Promise<APIResponse<SchedulingEngine[]>> {
    const response = await fetch(`${this.baseURL}/scheduling/engines`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<SchedulingEngine[]>>(response);
  }

  /**
   * Create advanced schedule for job execution
   * Endpoint: POST /scan-orchestration/scheduling/schedules
   */
  async createSchedule(
    schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      validateSchedule?: boolean;
      optimizeForResources?: boolean;
      enableConflictDetection?: boolean;
    } = {}
  ): Promise<APIResponse<Schedule & {
    validationResults?: any;
    conflictAnalysis?: any;
    optimizationSuggestions?: any[];
  }>> {
    const requestBody = {
      ...schedule,
      options: {
        validate_schedule: options.validateSchedule,
        optimize_for_resources: options.optimizeForResources,
        enable_conflict_detection: options.enableConflictDetection
      }
    };

    const response = await fetch(`${this.baseURL}/scheduling/schedules`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<Schedule & {
      validationResults?: any;
      conflictAnalysis?: any;
      optimizationSuggestions?: any[];
    }>>(response);
  }

  // ============================================================================
  // MONITORING & ANALYTICS
  // ============================================================================

  /**
   * Get real-time orchestration metrics
   * Endpoint: GET /scan-orchestration/monitoring/real-time
   */
  async getRealTimeMetrics(options: {
    engineIds?: string[];
    metricTypes?: string[];
    timeWindow?: number;
  } = {}): Promise<APIResponse<RealTimeMetrics>> {
    const params = new URLSearchParams();
    
    if (options.engineIds) params.append('engine_ids', options.engineIds.join(','));
    if (options.metricTypes) params.append('metric_types', options.metricTypes.join(','));
    if (options.timeWindow) params.append('time_window', options.timeWindow.toString());

    const response = await fetch(`${this.baseURL}/monitoring/real-time?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<RealTimeMetrics>>(response);
  }

  /**
   * Get orchestration analytics and insights
   * Endpoint: GET /scan-orchestration/analytics
   */
  async getOrchestrationAnalytics(options: {
    timeRange?: { start: string; end: string };
    aggregationLevel?: 'minute' | 'hour' | 'day' | 'week';
    includeForecasting?: boolean;
    includeTrends?: boolean;
  } = {}): Promise<APIResponse<{
    performanceMetrics: any;
    utilizationStats: any;
    trends?: any[];
    forecasts?: any[];
    insights: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.aggregationLevel) params.append('aggregation_level', options.aggregationLevel);
    if (options.includeForecasting) params.append('include_forecasting', 'true');
    if (options.includeTrends) params.append('include_trends', 'true');

    const response = await fetch(`${this.baseURL}/analytics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      performanceMetrics: any;
      utilizationStats: any;
      trends?: any[];
      forecasts?: any[];
      insights: any[];
    }>>(response);
  }

  // ============================================================================
  // INTEGRATION & EXTERNAL SYSTEMS
  // ============================================================================

  /**
   * Get integration configurations
   * Endpoint: GET /scan-orchestration/integrations
   */
  async getIntegrations(): Promise<APIResponse<OrchestrationIntegration[]>> {
    const response = await fetch(`${this.baseURL}/integrations`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<OrchestrationIntegration[]>>(response);
  }

  /**
   * Configure external system integration
   * Endpoint: POST /scan-orchestration/integrations
   */
  async configureIntegration(
    integration: Omit<OrchestrationIntegration, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      testConnection?: boolean;
      enableSync?: boolean;
      setupWebhooks?: boolean;
    } = {}
  ): Promise<APIResponse<OrchestrationIntegration & {
    connectionTest?: any;
    syncConfiguration?: any;
    webhookSetup?: any;
  }>> {
    const requestBody = {
      ...integration,
      options: {
        test_connection: options.testConnection,
        enable_sync: options.enableSync,
        setup_webhooks: options.setupWebhooks
      }
    };

    const response = await fetch(`${this.baseURL}/integrations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<OrchestrationIntegration & {
      connectionTest?: any;
      syncConfiguration?: any;
      webhookSetup?: any;
    }>>(response);
  }

  // ============================================================================
  // REAL-TIME COMMUNICATION & WEBSOCKETS
  // ============================================================================

  /**
   * Subscribe to real-time orchestration events
   */
  subscribeToOrchestrationEvents(
    subscriptionConfig: {
      engineIds?: string[];
      jobIds?: string[];
      eventTypes: string[];
      callback: (event: any) => void;
    }
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/events/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        config: subscriptionConfig
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (subscriptionConfig.eventTypes.includes(data.type)) {
        subscriptionConfig.callback(data);
      }
    };

    const connectionId = this.generateRequestId();
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to job progress updates
   */
  subscribeToJobProgress(
    jobId: string,
    callback: (progress: JobProgress) => void
  ): () => void {
    return this.subscribeToOrchestrationEvents({
      jobIds: [jobId],
      eventTypes: ['job_progress', 'job_status_change', 'job_metrics_update'],
      callback: (event) => {
        if (event.jobId === jobId) {
          callback(event.data);
        }
      }
    });
  }

  // ============================================================================
  // CLEANUP & UTILITIES
  // ============================================================================

  /**
   * Close all WebSocket connections
   */
  closeAllConnections(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE & UTILITIES
// ============================================================================

export const orchestrationAPI = new OrchestrationAPIService();

/**
 * Enterprise utilities for orchestration management
 */
export const OrchestrationAPIUtils = {
  /**
   * Validate orchestration job configuration
   */
  validateJobConfig: (job: Partial<ScanOrchestrationJob>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!job.name?.trim()) errors.push('Job name is required');
    if (!job.workflowDefinition) errors.push('Workflow definition is required');
    if (!job.executionContext) errors.push('Execution context is required');

    return { valid: errors.length === 0, errors };
  },

  /**
   * Calculate resource requirements
   */
  calculateResourceRequirements: (workflow: WorkflowDefinition): any => {
    // Implementation would analyze workflow steps and calculate requirements
    return {
      cpu: 2,
      memory: '4GB',
      storage: '10GB',
      estimatedDuration: 3600 // seconds
    };
  },

  /**
   * Generate orchestration summary
   */
  generateOrchestrationSummary: (jobs: ScanOrchestrationJob[]) => ({
    total: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    avgDuration: jobs.reduce((acc, j) => acc + (j.duration || 0), 0) / jobs.length
  })
};

export default orchestrationAPI;