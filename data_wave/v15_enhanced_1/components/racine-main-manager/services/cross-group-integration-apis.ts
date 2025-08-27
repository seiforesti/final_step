/**
 * Racine Cross-Group Integration API Service
 * ===========================================
 * 
 * Comprehensive API service for cross-group integration functionality that maps 100%
 * to the backend RacineIntegrationService and provides seamless coordination
 * across all 7 groups in the racine ecosystem.
 * 
 * Features:
 * - Cross-group resource discovery and linking
 * - Inter-group dependency management and tracking
 * - Unified search across all groups simultaneously
 * - Cross-group workflow orchestration and execution
 * - Group health monitoring and status aggregation
 * - Resource synchronization and consistency management
 * - Cross-group analytics and insights generation
 * - Integration conflict detection and resolution
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_integration_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_integration_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_integration_models.py
 */

import {
  APIResponse,
  CrossGroupSearchRequest,
  CrossGroupSearchResponse,
  ResourceLinkRequest,
  ResourceLinkResponse,
  DependencyMappingRequest,
  DependencyMappingResponse,
  GroupSyncRequest,
  GroupSyncResponse,
  IntegrationHealthRequest,
  IntegrationHealthResponse,
  CrossGroupAnalyticsRequest,
  CrossGroupAnalyticsResponse,
  ConflictDetectionRequest,
  ConflictDetectionResponse,
  CreateIntegrationEndpointRequest,
  IntegrationEndpointResponse,
  IntegrationTestResult,
  ServiceRegistrationRequest,
  ServiceRegistryResponse,
  CreateIntegrationJobRequest,
  IntegrationJobResponse,
  IntegrationJobExecutionResponse,
  StartSyncRequest,
  SyncJobResponse,
  IntegrationSystemHealthResponse,
  IntegrationPerformanceAnalyticsResponse,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../types/api.types';

import {
  CrossGroupState,
  GroupConfiguration,
  Integration,
  SharedResource,
  CrossGroupWorkflow,
  SynchronizationStatus,
  ResourceDependency,
  IntegrationConflict,
  GroupHealthStatus,
  CrossGroupMetrics,
  ResourceMapping,
  IntegrationPolicy
} from '../types/racine-core.types';
import { withGracefulErrorHandling, DefaultApiResponses } from '../../../lib/api-error-handler';

/**
 * Configuration for the cross-group integration API service
 */
interface IntegrationAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeSync: boolean;
  enableConflictDetection: boolean;
  enableAutoResolution: boolean;
  syncInterval: number;
  healthCheckInterval: number;
  websocketURL?: string;
  maxRetryAttempts: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: IntegrationAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 45000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeSync: true,
  enableConflictDetection: true,
  enableAutoResolution: false,
  syncInterval: 15000,
  healthCheckInterval: 30000,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  maxRetryAttempts: 5
};

/**
 * Supported groups in the racine ecosystem
 */
export enum SupportedGroup {
  DATA_SOURCES = 'data_sources',
  SCAN_RULE_SETS = 'scan_rule_sets',
  CLASSIFICATIONS = 'classifications',
  COMPLIANCE_RULES = 'compliance_rules',
  ADVANCED_CATALOG = 'advanced_catalog',
  SCAN_LOGIC = 'scan_logic',
  RBAC_SYSTEM = 'rbac_system'
}

/**
 * Integration event types for real-time updates
 */
export enum IntegrationEventType {
  GROUP_CONNECTED = 'group_connected',
  GROUP_DISCONNECTED = 'group_disconnected',
  RESOURCE_LINKED = 'resource_linked',
  RESOURCE_UNLINKED = 'resource_unlinked',
  DEPENDENCY_CREATED = 'dependency_created',
  DEPENDENCY_REMOVED = 'dependency_removed',
  SYNC_STARTED = 'sync_started',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  CONFLICT_DETECTED = 'conflict_detected',
  CONFLICT_RESOLVED = 'conflict_resolved',
  HEALTH_CHANGED = 'health_changed',
  WORKFLOW_EXECUTED = 'workflow_executed'
}

/**
 * Resource types across groups
 */
export enum CrossGroupResourceType {
  DATA_SOURCE = 'data_source',
  SCAN_RULE = 'scan_rule',
  CLASSIFICATION = 'classification',
  COMPLIANCE_RULE = 'compliance_rule',
  CATALOG_ITEM = 'catalog_item',
  SCAN_JOB = 'scan_job',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  WORKFLOW = 'workflow',
  PIPELINE = 'pipeline'
}

/**
 * Integration event interface
 */
export interface IntegrationEvent {
  type: IntegrationEventType;
  sourceGroup: SupportedGroup;
  targetGroup?: SupportedGroup;
  resourceId?: UUID;
  resourceType?: CrossGroupResourceType;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Integration event handler type
 */
export type IntegrationEventHandler = (event: IntegrationEvent) => void;

/**
 * Integration event subscription
 */
export interface IntegrationEventSubscription {
  id: UUID;
  eventType: IntegrationEventType;
  handler: IntegrationEventHandler;
  sourceGroup?: SupportedGroup;
  targetGroup?: SupportedGroup;
  resourceType?: CrossGroupResourceType;
}

/**
 * Cross-group search filters
 */
export interface CrossGroupSearchFilters {
  groups?: SupportedGroup[];
  resourceTypes?: CrossGroupResourceType[];
  dateRange?: { start: ISODateString; end: ISODateString };
  tags?: string[];
  permissions?: string[];
  status?: string[];
}

/**
 * Resource synchronization options
 */
export interface SyncOptions {
  bidirectional?: boolean;
  conflictResolution?: 'manual' | 'source_wins' | 'target_wins' | 'merge';
  validateBeforeSync?: boolean;
  preserveTimestamps?: boolean;
  notifyOnConflict?: boolean;
}

/**
 * Main Cross-Group Integration API Service Class
 */
class CrossGroupIntegrationAPI {
  private config: IntegrationAPIConfig;
  private authToken: string | null = null;
  private sessionId: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, IntegrationEventSubscription> = new Map();
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<IntegrationAPIConfig> = {}) {
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
   * Set session ID for tracking
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
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
   * Generic API request method
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        ...options,
        headers: { ...this.getAuthHeaders(), ...options.headers }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: 'Request successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  }

  /**
   * Initialize cross-group integration
   */
  async initializeIntegration(): Promise<void> {
    try {
      // Initialize WebSocket connection
      await this.initializeWebSocket();
      
      // Start health monitoring if enabled
      if (this.config.healthCheckInterval > 0) {
        this.startHealthMonitoring();
      }
      
      // Start real-time sync if enabled
      if (this.config.enableRealTimeSync) {
        this.startSyncMonitoring();
      }
      
      console.log('Cross-group integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize cross-group integration:', error);
      throw error;
    }
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  async initializeWebSocket(): Promise<void> {
    if (!this.config.websocketURL) {
      return;
    }

    try {
      this.websocket = new WebSocket(`${this.config.websocketURL}/integration`);
      
      this.websocket.onopen = () => {
        console.log('Integration WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const integrationEvent: IntegrationEvent = JSON.parse(event.data);
          this.handleIntegrationEvent(integrationEvent);
        } catch (error) {
          console.error('Failed to parse integration event:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Integration WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Integration WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize integration WebSocket:', error);
    }
  }

  /**
   * Handle incoming integration events
   */
  private handleIntegrationEvent(event: IntegrationEvent): void {
    const applicableSubscriptions = Array.from(this.eventSubscriptions.values()).filter(
      subscription => {
        const typeMatches = subscription.eventType === event.type;
        const sourceMatches = !subscription.sourceGroup || subscription.sourceGroup === event.sourceGroup;
        const targetMatches = !subscription.targetGroup || subscription.targetGroup === event.targetGroup;
        const resourceMatches = !subscription.resourceType || subscription.resourceType === event.resourceType;
        return typeMatches && sourceMatches && targetMatches && resourceMatches;
      }
    );

    applicableSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error('Error executing integration event handler:', error);
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
        console.log(`Attempting integration WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  // =============================================================================
  // CROSS-GROUP SEARCH
  // =============================================================================

  /**
   * Search across all groups
   * Maps to: POST /api/racine/integration/search
   */
  async searchAcrossGroups(request: CrossGroupSearchRequest): Promise<CrossGroupSearchResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/search`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to search across groups: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get unified search suggestions
   * Maps to: GET /api/racine/integration/search/suggestions
   */
  async getSearchSuggestions(
    query: string,
    groups?: SupportedGroup[],
    limit: number = 10
  ): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('limit', limit.toString());
    
    if (groups) {
      params.append('groups', JSON.stringify(groups));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/integration/search/suggestions?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get search suggestions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search with faceted filters
   * Maps to: POST /api/racine/integration/search/faceted
   */
  async facetedSearch(
    query: string,
    filters: CrossGroupSearchFilters,
    pagination?: PaginationRequest
  ): Promise<CrossGroupSearchResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/search/faceted`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        query,
        filters,
        pagination
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to perform faceted search: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // RESOURCE LINKING AND DEPENDENCIES
  // =============================================================================

  /**
   * Link resources across groups
   * Maps to: POST /api/racine/integration/resources/link
   */
  async linkResources(request: ResourceLinkRequest): Promise<ResourceLinkResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/resources/link`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to link resources: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get resource dependencies
   * Maps to: GET /api/racine/integration/resources/{resourceType}/{resourceId}/dependencies
   */
  async getResourceDependencies(
    resourceType: CrossGroupResourceType,
    resourceId: UUID
  ): Promise<ResourceDependency[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/resources/${resourceType}/${resourceId}/dependencies`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get resource dependencies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create dependency mapping
   * Maps to: POST /api/racine/integration/dependencies/create
   */
  async createDependencyMapping(request: DependencyMappingRequest): Promise<DependencyMappingResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/dependencies/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create dependency mapping: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get dependency graph for resource
   * Maps to: GET /api/racine/integration/dependencies/graph/{resourceType}/{resourceId}
   */
  async getDependencyGraph(
    resourceType: CrossGroupResourceType,
    resourceId: UUID,
    depth: number = 3
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append('depth', depth.toString());

    const response = await fetch(`${this.config.baseURL}/api/racine/integration/dependencies/graph/${resourceType}/${resourceId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get dependency graph: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // GROUP SYNCHRONIZATION
  // =============================================================================

  /**
   * Synchronize groups
   * Maps to: POST /api/racine/integration/sync
   */
  async synchronizeGroups(request: GroupSyncRequest): Promise<GroupSyncResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/sync`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to synchronize groups: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get synchronization status
   * Maps to: GET /api/racine/integration/sync/status
   */
  async getSyncStatus(groups?: SupportedGroup[]): Promise<SynchronizationStatus[]> {
    const params = new URLSearchParams();
    
    if (groups) {
      params.append('groups', JSON.stringify(groups));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/integration/sync/status?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get sync status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Force sync between specific groups
   * Maps to: POST /api/racine/integration/sync/force
   */
  async forceSyncBetweenGroups(
    sourceGroup: SupportedGroup,
    targetGroup: SupportedGroup,
    options?: SyncOptions
  ): Promise<GroupSyncResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/sync/force`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        source_group: sourceGroup,
        target_group: targetGroup,
        options: options || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to force sync between groups: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // HEALTH MONITORING
  // =============================================================================

  /**
   * Get integration health across all groups
   * Maps to: GET /api/racine/integration/health
   */
  async getIntegrationHealth(): Promise<IntegrationHealthResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/health`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get integration health: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get group-specific health status
   * Maps to: GET /api/racine/integration/health/{group}
   */
  async getGroupHealth(group: SupportedGroup): Promise<GroupHealthStatus> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/health/${group}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get group health: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Test connectivity between groups
   * Maps to: POST /api/racine/integration/connectivity/test
   */
  async testConnectivity(
    sourceGroup: SupportedGroup,
    targetGroup: SupportedGroup
  ): Promise<any> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/connectivity/test`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        source_group: sourceGroup,
        target_group: targetGroup
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to test connectivity: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // CONFLICT DETECTION AND RESOLUTION
  // =============================================================================

  /**
   * Detect integration conflicts
   * Maps to: POST /api/racine/integration/conflicts/detect
   */
  async detectConflicts(request: ConflictDetectionRequest): Promise<ConflictDetectionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/conflicts/detect`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to detect conflicts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get active conflicts
   * Maps to: GET /api/racine/integration/conflicts/active
   */
  async getActiveConflicts(): Promise<IntegrationConflict[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/conflicts/active`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get active conflicts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Resolve integration conflict
   * Maps to: POST /api/racine/integration/conflicts/{conflictId}/resolve
   */
  async resolveConflict(
    conflictId: UUID,
    resolution: 'accept_source' | 'accept_target' | 'merge' | 'custom',
    customResolution?: any
  ): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        resolution,
        custom_resolution: customResolution
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve conflict: ${response.statusText}`);
    }
  }

  // =============================================================================
  // INTEGRATION ENDPOINTS MANAGEMENT
  // =============================================================================

  /**
   * Create integration endpoint
   * Maps to: POST /api/racine/integration/endpoints
   */
  async createIntegrationEndpoint(request: CreateIntegrationEndpointRequest): Promise<APIResponse<IntegrationEndpointResponse>> {
    return this.makeRequest<IntegrationEndpointResponse>('/api/racine/integration/endpoints', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
  }

  /**
   * Get integration endpoints
   * Maps to: GET /api/racine/integration/endpoints
   */
  async getIntegrationEndpoints(
    options: {
      limit?: number;
      offset?: number;
      endpoint_type?: string;
      status?: string;
    } = {}
  ): Promise<APIResponse<IntegrationEndpointResponse[]>> {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.endpoint_type) params.append('endpoint_type', options.endpoint_type);
    if (options.status) params.append('status', options.status);

    const queryString = params.toString();
    const url = queryString ? `/api/racine/integration/endpoints?${queryString}` : '/api/racine/integration/endpoints';

    return this.makeRequest<IntegrationEndpointResponse[]>(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Test integration endpoint
   * Maps to: POST /api/racine/integration/endpoints/{endpoint_id}/test
   */
  async testIntegrationEndpoint(
    endpointId: UUID,
    testData?: Record<string, any>
  ): Promise<APIResponse<IntegrationTestResult>> {
    return this.makeRequest<IntegrationTestResult>(`/api/racine/integration/endpoints/${endpointId}/test`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ test_data: testData })
    });
  }

  // =============================================================================
  // SERVICE REGISTRY MANAGEMENT
  // =============================================================================

  /**
   * Register service in registry
   * Maps to: POST /api/racine/integration/services/register
   */
  async registerService(request: ServiceRegistrationRequest): Promise<APIResponse<ServiceRegistryResponse>> {
    return this.makeRequest<ServiceRegistryResponse>('/api/racine/integration/services/register', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
  }

  /**
   * Get registered services
   * Maps to: GET /api/racine/integration/services
   */
  async getRegisteredServices(
    options: {
      limit?: number;
      offset?: number;
      service_type?: string;
      status?: string;
    } = {}
  ): Promise<APIResponse<ServiceRegistryResponse[]>> {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.service_type) params.append('service_type', options.service_type);
    if (options.status) params.append('status', options.status);

    const queryString = params.toString();
    const url = queryString ? `/api/racine/integration/services?${queryString}` : '/api/racine/integration/services';

    return this.makeRequest<ServiceRegistryResponse[]>(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Send service heartbeat
   * Maps to: POST /api/racine/integration/services/{service_id}/heartbeat
   */
  async sendServiceHeartbeat(serviceId: UUID): Promise<APIResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/racine/integration/services/${serviceId}/heartbeat`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  // =============================================================================
  // CROSS-GROUP ANALYTICS
  // =============================================================================

  /**
   * Get cross-group analytics
   * Maps to: POST /api/racine/integration/analytics
   */
  async getCrossGroupAnalytics(request: CrossGroupAnalyticsRequest): Promise<CrossGroupAnalyticsResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/analytics`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to get cross-group analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get group relationship matrix
   * Maps to: GET /api/racine/integration/analytics/relationships
   */
  async getGroupRelationshipMatrix(): Promise<any> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/analytics/relationships`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get group relationship matrix: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get integration impact analysis
   * Maps to: POST /api/racine/integration/analytics/impact
   */
  async getImpactAnalysis(
    resourceType: CrossGroupResourceType,
    resourceId: UUID,
    changeType: 'update' | 'delete' | 'move'
  ): Promise<any> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/analytics/impact`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        resource_type: resourceType,
        resource_id: resourceId,
        change_type: changeType
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get impact analysis: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // MONITORING AND UTILITIES
  // =============================================================================

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const health = await this.getIntegrationHealth();
        
        // Trigger health update events for unhealthy groups
        if (health.groups) {
          Object.entries(health.groups).forEach(([group, status]) => {
            if (status.status !== 'healthy') {
              this.handleIntegrationEvent({
                type: IntegrationEventType.HEALTH_CHANGED,
                sourceGroup: group as SupportedGroup,
                userId: 'system',
                timestamp: new Date().toISOString(),
                data: { health: status },
                severity: status.status === 'failed' ? 'critical' : 'medium'
              });
            }
          });
        }
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Start sync monitoring
   */
  private startSyncMonitoring(): void {
    // Monitor sync status for all groups
    Object.values(SupportedGroup).forEach(group => {
      const syncTimer = setInterval(async () => {
        try {
          const syncStatus = await this.getSyncStatus([group]);
          
          // Handle sync events based on status
          syncStatus.forEach(status => {
            if (status.lastSyncStatus === 'failed') {
              this.handleIntegrationEvent({
                type: IntegrationEventType.SYNC_FAILED,
                sourceGroup: group,
                userId: 'system',
                timestamp: new Date().toISOString(),
                data: { syncStatus: status },
                severity: 'high'
              });
            }
          });
        } catch (error) {
          console.error(`Sync monitoring error for ${group}:`, error);
        }
      }, this.config.syncInterval);

      this.syncTimers.set(group, syncTimer);
    });
  }

  /**
   * Stop monitoring timers
   */
  private stopMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    this.syncTimers.forEach((timer) => clearInterval(timer));
    this.syncTimers.clear();
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to integration events
   */
  subscribeToEvents(
    eventType: IntegrationEventType,
    handler: IntegrationEventHandler,
    sourceGroup?: SupportedGroup,
    targetGroup?: SupportedGroup,
    resourceType?: CrossGroupResourceType
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    const subscription: IntegrationEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      sourceGroup,
      targetGroup,
      resourceType
    };

    this.eventSubscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from integration events
   */
  unsubscribeFromEvents(subscriptionId: UUID): void {
    this.eventSubscriptions.delete(subscriptionId);
  }

  // =============================================================================
  // ACTIVITY TRACKING METHODS
  // =============================================================================

  /**
   * Track integration events for activity monitoring
   */
  async trackEvent(eventType: string, eventData: any): Promise<void> {
    try {
      await fetch(`${this.config.baseURL}/api/racine/integration/events/track`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // =============================================================================
  // DATA SOURCE LINKING METHODS
  // =============================================================================

  /**
   * Link data source to scan rule sets
   */
  async linkDataSourceToScanRuleSets(dataSourceId: string, ruleSetIds: string[]): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/data-sources/${dataSourceId}/link-scan-rule-sets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ rule_set_ids: ruleSetIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to link data source to scan rule sets: ${response.statusText}`);
    }
  }

  /**
   * Link data source to classifications
   */
  async linkDataSourceToClassifications(dataSourceId: string, classificationIds: string[]): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/data-sources/${dataSourceId}/link-classifications`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ classification_ids: classificationIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to link data source to classifications: ${response.statusText}`);
    }
  }

  /**
   * Link data source to compliance rules
   */
  async linkDataSourceToComplianceRules(dataSourceId: string, ruleIds: string[]): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/data-sources/${dataSourceId}/link-compliance-rules`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ rule_ids: ruleIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to link data source to compliance rules: ${response.statusText}`);
    }
  }

  // =============================================================================
  // WORKSPACE INTEGRATION METHODS
  // =============================================================================

  /**
   * Add data source to workspace
   */
  async addDataSourceToWorkspace(dataSourceId: string, workspaceId: string): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/workspaces/${workspaceId}/data-sources`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ data_source_id: dataSourceId })
    });

    if (!response.ok) {
      throw new Error(`Failed to add data source to workspace: ${response.statusText}`);
    }
  }

  /**
   * Remove data source from workspace
   */
  async removeDataSourceFromWorkspace(dataSourceId: string, workspaceId: string): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/workspaces/${workspaceId}/data-sources/${dataSourceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to remove data source from workspace: ${response.statusText}`);
    }
  }

  /**
   * Get workspace data sources
   */
  async getWorkspaceDataSources(workspaceId: string): Promise<any[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/integration/workspaces/${workspaceId}/data-sources`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace data sources: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check integration health across all groups
   */
  async checkIntegrationHealth(): Promise<IntegrationHealthResponse> {
    return withGracefulErrorHandling(
      async () => {
        const candidates = [
          '/api/racine/integration/health',
          '/api/integration/health',
          '/integration/health',
          '/api/v1/racine/integration/health'
        ];

        let healthData: any | null = null;
        let lastStatusText = '';
        for (const path of candidates) {
          try {
            const res = await fetch(`${this.config.baseURL}${path}`, {
              method: 'GET',
              headers: this.getAuthHeaders()
            });
            if (res.ok) {
              healthData = await res.json();
              break;
            } else {
              lastStatusText = res.statusText;
            }
          } catch (e: any) {
            lastStatusText = e?.message || 'network_error';
          }
        }

        if (!healthData) {
          // Fallback to platform status as a minimal health signal
          try {
            const res = await fetch(`${this.config.baseURL}/api/v1/platform/status`, {
              method: 'GET',
              headers: this.getAuthHeaders()
            });
            if (res.ok) {
              const status = await res.json();
              healthData = {
                overall_status: 'degraded',
                group_health: {},
                integration_status: { platform: status?.platform || 'unknown' },
                issues: ['Integration health endpoint unavailable'],
                recommendations: ['Verify backend integration routes'],
                metrics: {}
              };
            }
          } catch {}
        }

        if (!healthData) {
          // Return default here to avoid throwing and noisy console errors
          return {
            overallStatus: 'backend_unavailable',
            groupHealth: {},
            integrationStatus: {},
            lastCheck: new Date().toISOString(),
            issues: [`Failed to check integration health: ${lastStatusText || 'unknown'}`],
            recommendations: ['Wait for backend to start up', 'Check backend health'],
            metrics: {}
          } as IntegrationHealthResponse;
        }
        
        // Return comprehensive health status
        return {
          overallStatus: healthData.overall_status || 'unknown',
          groupHealth: healthData.group_health || {},
          integrationStatus: healthData.integration_status || {},
          lastCheck: new Date().toISOString(),
          issues: healthData.issues || [],
          recommendations: healthData.recommendations || [],
          metrics: healthData.metrics || {}
        };
      },
      {
        defaultValue: {
          overallStatus: 'backend_unavailable',
          groupHealth: {},
          integrationStatus: {},
          lastCheck: new Date().toISOString(),
          issues: ['Backend service not available'],
          recommendations: ['Wait for backend to start up', 'Check backend health'],
          metrics: {}
        },
        errorPrefix: 'Backend not available for integration health check'
      }
    );
  }

  /**
   * Search across all groups
   */
  async searchCrossGroups(request: CrossGroupSearchRequest): Promise<CrossGroupSearchResponse> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/integration/search`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to search across groups: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { results: [], total: 0, groups: [] },
        errorPrefix: 'Backend not available for cross-group search'
      }
    );
  }

  /**
   * Link resources across groups
   */
  async linkResources(request: ResourceLinkRequest): Promise<ResourceLinkResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/resources/link`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to link resources: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to link resources:', error);
      throw error;
    }
  }

  /**
   * Map dependencies between groups
   */
  async mapDependencies(request: DependencyMappingRequest): Promise<DependencyMappingResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/dependencies/map`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to map dependencies: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to map dependencies:', error);
      throw error;
    }
  }

  /**
   * Start group synchronization
   */
  async startGroupSync(request: GroupSyncRequest): Promise<GroupSyncResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/sync/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to start group sync: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to start group sync:', error);
      throw error;
    }
  }

  /**
   * Generate cross-group analytics
   */
  async generateAnalytics(request: CrossGroupAnalyticsRequest): Promise<CrossGroupAnalyticsResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/analytics/generate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate analytics: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      throw error;
    }
  }

  /**
   * Link cross-group resource
   */
  async linkCrossGroupResource(params: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/resources/link-cross-group`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Failed to link cross-group resource: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to link cross-group resource:', error);
      throw error;
    }
  }

  /**
   * Unlink cross-group resource
   */
  async unlinkCrossGroupResource(resourceId: string, targetGroup: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/resources/unlink-cross-group`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ resource_id: resourceId, target_group: targetGroup })
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink cross-group resource: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to unlink cross-group resource:', error);
      throw error;
    }
  }

  /**
   * Unlink resources
   */
  async unlinkResources(linkId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/resources/unlink/${linkId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink resources: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to unlink resources:', error);
      throw error;
    }
  }

  /**
   * Get resource links
   */
  async getResourceLinks(resourceId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/resources/${resourceId}/links`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get resource links: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get resource links:', error);
      return [];
    }
  }

  /**
   * Validate dependencies for a group
   */
  async validateDependencies(groupId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/dependencies/validate/${groupId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to validate dependencies: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to validate dependencies:', error);
      throw error;
    }
  }

  /**
   * Resolve dependency conflicts
   */
  async resolveDependencyConflicts(conflicts: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/dependencies/resolve-conflicts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ conflicts })
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve dependency conflicts: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to resolve dependency conflicts:', error);
      throw error;
    }
  }

  /**
   * Monitor sync progress
   */
  async monitorSyncProgress(jobId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/sync/progress/${jobId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to monitor sync progress: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to monitor sync progress:', error);
      throw error;
    }
  }

  /**
   * Cancel sync job
   */
  async cancelSync(jobId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/sync/cancel/${jobId}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel sync: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to cancel sync:', error);
      throw error;
    }
  }

  /**
   * Get group health status
   */
  async getGroupHealth(groupId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/groups/${groupId}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get group health: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get group health:', error);
      throw error;
    }
  }

  /**
   * Get cross-group insights
   */
  async getInsights(timeRange: any): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/insights?time_range=${JSON.stringify(timeRange)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get insights: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get insights:', error);
      return [];
    }
  }

  /**
   * Get cross-group trends
   */
  async getTrends(metric: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/trends?metric=${metric}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get trends: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get trends:', error);
      return [];
    }
  }

  /**
   * Detect conflicts between groups
   */
  async detectConflicts(request: ConflictDetectionRequest): Promise<ConflictDetectionResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/conflicts/detect`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to detect conflicts: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to detect conflicts:', error);
      throw error;
    }
  }

  /**
   * Resolve a specific conflict
   */
  async resolveConflict(conflictId: string, resolution: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/conflicts/${conflictId}/resolve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(resolution)
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve conflict: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }

  /**
   * Get active conflicts
   */
  async getActiveConflicts(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/conflicts/active`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get active conflicts: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get active conflicts:', error);
      return [];
    }
  }

  /**
   * Create integration endpoint
   */
  async createIntegrationEndpoint(request: CreateIntegrationEndpointRequest): Promise<IntegrationEndpointResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/endpoints/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to create integration endpoint: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to create integration endpoint:', error);
      throw error;
    }
  }

  /**
   * Test integration endpoint
   */
  async testIntegrationEndpoint(endpointId: string): Promise<IntegrationTestResult> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/endpoints/${endpointId}/test`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to test integration endpoint: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to test integration endpoint:', error);
      throw error;
    }
  }

  /**
   * Get integration endpoints
   */
  async getIntegrationEndpoints(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/endpoints`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get integration endpoints: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get integration endpoints:', error);
      return [];
    }
  }

  /**
   * Register service
   */
  async registerService(request: ServiceRegistrationRequest): Promise<ServiceRegistryResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/services/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to register service: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to register service:', error);
      throw error;
    }
  }

  /**
   * Get registered services
   */
  async getRegisteredServices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/services`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get registered services: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get registered services:', error);
      return [];
    }
  }

  /**
   * Send service heartbeat
   */
  async sendServiceHeartbeat(serviceId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/services/${serviceId}/heartbeat`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to send service heartbeat: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to send service heartbeat:', error);
      throw error;
    }
  }

  /**
   * Create integration job
   */
  async createIntegrationJob(request: CreateIntegrationJobRequest): Promise<IntegrationJobResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/jobs/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to create integration job: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to create integration job:', error);
      throw error;
    }
  }

  /**
   * Execute integration job
   */
  async executeIntegrationJob(jobId: string): Promise<IntegrationJobExecutionResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/jobs/${jobId}/execute`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to execute integration job: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to execute integration job:', error);
      throw error;
    }
  }

  /**
   * Schedule integration job
   */
  async scheduleIntegrationJob(jobId: string, schedule: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/jobs/${jobId}/schedule`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(schedule)
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule integration job: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to schedule integration job:', error);
      throw error;
    }
  }

  /**
   * Track navigation and other events for analytics
   * Maps to: POST /api/racine/integration/analytics/track
   */
  async trackEvent(eventType: string, eventData: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/integration/analytics/track`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData,
          timestamp: new Date().toISOString(),
          session_id: this.sessionId || 'anonymous'
        })
      });

      // Return true for successful tracking, false for failed
      return response.ok;
    } catch (error) {
      console.warn('Event tracking failed:', error);
      // Don't throw - tracking is non-critical
      return false;
    }
  }

  /**
   * Cleanup all connections and monitoring
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.stopMonitoring();
    this.eventSubscriptions.clear();
  }
}

// Create and export singleton instance
export const crossGroupIntegrationAPI = new CrossGroupIntegrationAPI();

// Export as crossGroupIntegrationApis for backward compatibility
export const crossGroupIntegrationApis = crossGroupIntegrationAPI;

// Export class for direct instantiation if needed
export { CrossGroupIntegrationAPI };

// Export types for external usage
export type {
  IntegrationAPIConfig,
  IntegrationEvent,
  IntegrationEventHandler,
  IntegrationEventSubscription,
  CrossGroupSearchFilters,
  SyncOptions
};