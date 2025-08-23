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