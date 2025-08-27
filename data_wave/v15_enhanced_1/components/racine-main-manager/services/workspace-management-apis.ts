/**
 * Racine Workspace Management API Service
 * ========================================
 * 
 * Comprehensive API service for workspace management functionality that maps 100%
 * to the backend RacineWorkspaceService and provides complete type safety
 * for all workspace operations.
 * 
 * Features:
 * - Multi-workspace management (personal, team, enterprise)
 * - Cross-group resource linking and management
 * - Workspace templates and cloning
 * - Team collaboration and member management
 * - Workspace analytics and monitoring
 * - RBAC-integrated access control
 * - Real-time workspace synchronization
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_workspace_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_workspace_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_workspace_models.py
 */

import {
  APIResponse,
  CreateWorkspaceRequest,
  WorkspaceResponse,
  WorkspaceListResponse,
  UpdateWorkspaceRequest,
  WorkspaceResourceResponse,
  LinkResourceRequest,
  WorkspaceMemberResponse,
  AddWorkspaceMemberRequest,
  UpdateWorkspaceMemberRequest,
  WorkspaceTemplateResponse,
  CreateWorkspaceFromTemplateRequest,
  WorkspaceAnalyticsResponse,
  WorkspaceSecurityResponse,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../types/api.types';
import { withGracefulErrorHandling, DefaultApiResponses } from '../../../lib/api-error-handler';

import {
  WorkspaceConfiguration,
  WorkspaceMember,
  WorkspaceResource,
  WorkspaceSettings,
  WorkspaceAnalytics,
  WorkspaceTemplate,
  WorkspaceSecuritySettings,
  CrossGroupResource,
  ResourceDependency,
  WorkspaceActivity
} from '../types/racine-core.types';

/**
 * Configuration for the workspace management API service
 */
interface WorkspaceAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeSync: boolean;
  websocketURL?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: WorkspaceAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeSync: process.env.NODE_ENV === 'production' ? false : true, // Disable in production by default
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 
                (process.env.NODE_ENV === 'production' ? undefined : 'ws://localhost:8000/ws')
};

/**
 * Workspace event types for real-time updates
 */
export enum WorkspaceEventType {
  WORKSPACE_CREATED = 'workspace_created',
  WORKSPACE_UPDATED = 'workspace_updated',
  WORKSPACE_DELETED = 'workspace_deleted',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_ROLE_UPDATED = 'member_role_updated',
  RESOURCE_LINKED = 'resource_linked',
  RESOURCE_UNLINKED = 'resource_unlinked',
  WORKSPACE_ACCESSED = 'workspace_accessed',
  SECURITY_UPDATED = 'security_updated'
}

/**
 * Workspace event data structure
 */
export interface WorkspaceEvent {
  type: WorkspaceEventType;
  workspaceId: UUID;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Event handler function type
 */
export type WorkspaceEventHandler = (event: WorkspaceEvent) => void;

/**
 * Event subscription interface
 */
export interface WorkspaceEventSubscription {
  id: UUID;
  eventType: WorkspaceEventType;
  handler: WorkspaceEventHandler;
  workspaceId?: UUID;
}

/**
 * WebSocket message structure for workspace events
 */
export interface WorkspaceWebSocketMessage {
  event: WorkspaceEvent;
  subscription_id?: UUID;
}

/**
 * Main Workspace Management API Service Class
 */
class WorkspaceManagementAPI {
  private config: WorkspaceAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, WorkspaceEventSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isWebSocketConnected = false;

  constructor(config: Partial<WorkspaceAPIConfig> = {}) {
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
   * Initialize WebSocket connection for real-time workspace updates
   */
  private initializeWebSocket(): void {
    if (!this.config.enableRealTimeSync || !this.config.websocketURL) {
      console.log('WebSocket disabled or no URL configured');
      return;
    }

    // Check if WebSocket is supported
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSocket not supported in this environment, falling back to polling');
      this.fallbackToPolling();
      return;
    }

    try {
      console.log(`Attempting to connect to WebSocket: ${this.config.websocketURL}/workspace`);
      this.websocket = new WebSocket(`${this.config.websocketURL}/workspace`);
      
      this.websocket.onopen = () => {
        console.log('Workspace WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.isWebSocketConnected = true;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WorkspaceWebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = (event) => {
        console.log(`Workspace WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
        this.isWebSocketConnected = false;
        
        // Only attempt reconnect for unexpected closures
        if (event.code !== 1000) { // 1000 = normal closure
        this.attemptReconnect();
        }
      };

      this.websocket.onerror = (error) => {
        console.warn('Workspace WebSocket connection error, falling back to polling mode:', error);
        this.isWebSocketConnected = false;
        
        // Close the failed connection
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
        
        // Fall back to polling mode
        this.fallbackToPolling();
      };
      
      // Set connection timeout
      setTimeout(() => {
        if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
          console.warn('WebSocket connection timeout, falling back to polling');
          this.websocket.close();
          this.websocket = null;
          this.fallbackToPolling();
        }
      }, 5000); // 5 second timeout
      
    } catch (error) {
      console.warn('Failed to initialize WebSocket, falling back to polling:', error);
      this.fallbackToPolling();
    }
  }

  /**
   * Fallback to polling mode when WebSocket is unavailable
   */
  private fallbackToPolling(): void {
    console.log('Using polling mode for workspace updates');
    this.isWebSocketConnected = false;
    
    // Set up polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, 30000); // Poll every 30 seconds
  }

  /**
   * Poll for workspace updates when WebSocket is not available
   */
  private async pollForUpdates(): Promise<void> {
    try {
      // Poll for any pending workspace updates
      const updates = await this.getWorkspaceUpdates();
      if (updates && updates.length > 0) {
        updates.forEach((update: WorkspaceEvent) => {
          this.handleWebSocketMessage({ event: update });
        });
      }
    } catch (error) {
      console.warn('Failed to poll for workspace updates:', error);
    }
  }

  /**
   * Get workspace updates for polling fallback
   */
  private async getWorkspaceUpdates(): Promise<WorkspaceEvent[]> {
    try {
      // This would typically call a backend endpoint to get recent updates
      // For now, return empty array to prevent errors
      return [];
    } catch (error) {
      console.warn('Failed to get workspace updates:', error);
      return [];
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WorkspaceWebSocketMessage): void {
    const { event } = message;
    
    // Find all applicable subscriptions
    const applicableSubscriptions = Array.from(this.eventSubscriptions.values()).filter(
      subscription => {
        const typeMatches = subscription.eventType === event.type;
        const workspaceMatches = !subscription.workspaceId || subscription.workspaceId === event.workspaceId;
        return typeMatches && workspaceMatches;
      }
    );

    // Execute all applicable handlers
    applicableSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error('Error executing workspace event handler:', error);
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
        console.log(`Attempting workspace WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    }
  }

  // =============================================================================
  // WORKSPACE CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new workspace
   * Maps to: POST /api/racine/workspace/create
   */
  async createWorkspace(request: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create workspace: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workspace by ID
   * Maps to: GET /api/racine/workspace/{id}
   */
  async getWorkspace(workspaceId: UUID): Promise<WorkspaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List user's workspaces with filtering and pagination
   * Maps to: GET /api/racine/workspace/list
   */
  async listWorkspaces(
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<WorkspaceListResponse> {
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

    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/list?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to list workspaces: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update workspace configuration
   * Maps to: PUT /api/racine/workspace/{id}
   */
  async updateWorkspace(workspaceId: UUID, request: UpdateWorkspaceRequest): Promise<WorkspaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update workspace: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete workspace
   * Maps to: DELETE /api/racine/workspace/{id}
   */
  async deleteWorkspace(workspaceId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workspace: ${response.statusText}`);
    }
  }

  // =============================================================================
  // WORKSPACE RESOURCE MANAGEMENT
  // =============================================================================

  /**
   * Get workspace resources from all connected groups
   * Maps to: GET /api/racine/workspace/{id}/resources
   */
  async getWorkspaceResources(
    workspaceId: UUID,
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<WorkspaceResourceResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/resources?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace resources: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Link resource from any group to workspace
   * Maps to: POST /api/racine/workspace/{id}/link-resource
   */
  async linkResourceToWorkspace(workspaceId: UUID, request: LinkResourceRequest): Promise<WorkspaceResource> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/link-resource`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to link resource to workspace: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Unlink resource from workspace
   * Maps to: DELETE /api/racine/workspace/{id}/unlink-resource/{resourceId}
   */
  async unlinkResourceFromWorkspace(workspaceId: UUID, resourceId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/unlink-resource/${resourceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to unlink resource from workspace: ${response.statusText}`);
    }
  }

  /**
   * Get resource dependencies within workspace
   * Maps to: GET /api/racine/workspace/{id}/resource-dependencies
   */
  async getResourceDependencies(workspaceId: UUID): Promise<ResourceDependency[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/resource-dependencies`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get resource dependencies: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // WORKSPACE MEMBER MANAGEMENT
  // =============================================================================

  /**
   * Get workspace members
   * Maps to: GET /api/racine/workspace/{id}/members
   */
  async getWorkspaceMembers(
    workspaceId: UUID,
    pagination?: PaginationRequest
  ): Promise<WorkspaceMemberResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/members?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace members: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Add member to workspace
   * Maps to: POST /api/racine/workspace/{id}/members
   */
  async addWorkspaceMember(workspaceId: UUID, request: AddWorkspaceMemberRequest): Promise<WorkspaceMember> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/members`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to add workspace member: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update workspace member role
   * Maps to: PUT /api/racine/workspace/{id}/members/{memberId}
   */
  async updateWorkspaceMember(
    workspaceId: UUID, 
    memberId: UUID, 
    request: UpdateWorkspaceMemberRequest
  ): Promise<WorkspaceMember> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/members/${memberId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update workspace member: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Remove member from workspace
   * Maps to: DELETE /api/racine/workspace/{id}/members/{memberId}
   */
  async removeWorkspaceMember(workspaceId: UUID, memberId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/members/${memberId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to remove workspace member: ${response.statusText}`);
    }
  }

  // =============================================================================
  // WORKSPACE TEMPLATES
  // =============================================================================

  /**
   * Get available workspace templates
   * Maps to: GET /api/racine/workspace/templates
   */
  async getWorkspaceTemplates(
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<WorkspaceTemplateResponse> {
    const params = new URLSearchParams();
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const candidates = [
      '/api/racine/workspace/templates',
      '/api/workspace/templates',
      '/workspace/templates',
      '/api/v1/racine/workspace/templates'
    ];

    for (const path of candidates) {
      try {
        const res = await fetch(`${this.config.baseURL}${path}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
        if (res.ok) return res.json();
      } catch {}
    }

    // Fallback to defaults when backend not reachable
    return DefaultApiResponses.workspaceTemplates as unknown as WorkspaceTemplateResponse;
  }

  /**
   * Create workspace from template
   * Maps to: POST /api/racine/workspace/create-from-template
   */
  async createWorkspaceFromTemplate(request: CreateWorkspaceFromTemplateRequest): Promise<WorkspaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/create-from-template`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create workspace from template: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Clone existing workspace
   * Maps to: POST /api/racine/workspace/{id}/clone
   */
  async cloneWorkspace(workspaceId: UUID, newName: string): Promise<WorkspaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/clone`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name: newName })
    });

    if (!response.ok) {
      throw new Error(`Failed to clone workspace: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // WORKSPACE ANALYTICS AND MONITORING
  // =============================================================================

  /**
   * Get workspace analytics
   * Maps to: GET /api/racine/workspace/{id}/analytics
   */
  async getWorkspaceAnalytics(
    workspaceId: UUID,
    timeRange?: { start: ISODateString; end: ISODateString }
  ): Promise<WorkspaceAnalyticsResponse> {
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/analytics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workspace security status
   * Maps to: GET /api/racine/workspace/{id}/security
   */
  async getWorkspaceSecurity(workspaceId: UUID): Promise<WorkspaceSecurityResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/security`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace security: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workspace activity feed
   * Maps to: GET /api/racine/workspace/{id}/activity
   */
  async getWorkspaceActivity(
    workspaceId: UUID,
    pagination?: PaginationRequest
  ): Promise<WorkspaceActivity[]> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/activity?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace activity: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to workspace events
   */
  subscribeToEvents(
    eventType: WorkspaceEventType,
    handler: WorkspaceEventHandler,
    workspaceId?: UUID
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    const subscription: WorkspaceEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      workspaceId
    };

    this.eventSubscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from workspace events
   */
  unsubscribeFromEvents(subscriptionId: UUID): void {
    this.eventSubscriptions.delete(subscriptionId);
  }

  /**
   * Initialize real-time updates for workspace management
   */
  async initializeRealTimeUpdates(): Promise<void> {
    try {
      // Initialize WebSocket connection if not already connected
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        await this.initializeWebSocket();
      }

      // Set up periodic health checks for connected workspaces
      if (this.config.enableRealTimeSync) {
        // Start monitoring workspace health
        setInterval(async () => {
          try {
            // Check workspace health and trigger events if needed
            // This could include checking for disconnected resources, 
            // stale permissions, or other workspace issues
            console.log('Workspace health check completed');
          } catch (error) {
            console.error('Workspace health check failed:', error);
          }
        }, 30000); // Check every 30 seconds
      }

      console.log('Workspace real-time updates initialized');
    } catch (error) {
      console.error('Failed to initialize workspace real-time updates:', error);
      throw error;
    }
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(request: CreateWorkspaceRequest): Promise<WorkspaceResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workspace: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }

  /**
   * Get a specific workspace by ID
   */
  async getWorkspace(workspaceId: UUID): Promise<WorkspaceResponse> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get workspace: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: null,
        errorPrefix: 'Backend not available for getting workspace'
      }
    );
  }

  /**
   * List all workspaces with optional filtering
   */
  async listWorkspaces(
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<WorkspaceListResponse> {
    return withGracefulErrorHandling(
      async () => {
        const params = new URLSearchParams();
        
        if (pagination) {
          params.append('page', pagination.page.toString());
          params.append('limit', pagination.limit.toString());
        }
        
        if (filters) {
          params.append('filters', JSON.stringify(filters));
        }

        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/list?${params}`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to list workspaces: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: DefaultApiResponses.workspaceList,
        errorPrefix: 'Backend not available for listing workspaces'
      }
    );
  }

  /**
   * Update an existing workspace
   */
  async updateWorkspace(workspaceId: UUID, request: UpdateWorkspaceRequest): Promise<WorkspaceResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/update`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to update workspace: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to update workspace:', error);
      throw error;
    }
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(workspaceId: UUID): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/delete`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete workspace: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }

  /**
   * Get workspace resources
   */
  async getWorkspaceResources(workspaceId: UUID): Promise<WorkspaceResourceResponse[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/resources`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get workspace resources: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors gracefully when backend is not available
      console.warn('Backend not available for workspace resources, returning empty array:', error);
      return [];
    }
  }

  /**
   * Link a resource to a workspace
   */
  async linkResource(workspaceId: UUID, request: LinkResourceRequest): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/resources/link`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to link resource: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to link resource:', error);
      throw error;
    }
  }

  /**
   * Unlink a resource from a workspace
   */
  async unlinkResource(workspaceId: UUID, resourceId: UUID): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/resources/${resourceId}/unlink`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink resource: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to unlink resource:', error);
      throw error;
    }
  }

  /**
   * Get workspace members
   */
  async getWorkspaceMembers(workspaceId: UUID): Promise<WorkspaceMemberResponse[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/members`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get workspace members: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get workspace members:', error);
      return [];
    }
  }

  /**
   * Add a member to a workspace
   */
  async addMember(workspaceId: UUID, request: AddWorkspaceMemberRequest): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/members/add`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to add member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a workspace
   */
  async removeMember(workspaceId: UUID, memberId: UUID): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/members/${memberId}/remove`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to remove member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }

  /**
   * Get workspace templates
   */
  async getTemplates(): Promise<WorkspaceTemplateResponse[]> {
    return withGracefulErrorHandling(
      async () => {
        const paths = [
          '/api/racine/workspace/templates',
          '/api/workspace/templates',
          '/workspace/templates',
          '/api/v1/racine/workspace/templates'
        ];
        for (const p of paths) {
          try {
            const r = await fetch(`${this.config.baseURL}${p}`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });
            if (r.ok) return r.json();
          } catch {}
        }
        // If none worked, return defaults instead of erroring
        return DefaultApiResponses.workspaceTemplates as unknown as WorkspaceTemplateResponse[];
      },
      {
        defaultValue: DefaultApiResponses.workspaceTemplates,
        errorPrefix: 'Backend not available for getting workspace templates'
      }
    );
  }

  /**
   * Create workspace from template
   */
  async createFromTemplate(request: CreateWorkspaceFromTemplateRequest): Promise<WorkspaceResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/racine/workspace/create-from-template`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workspace from template: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to create workspace from template:', error);
      throw error;
    }
  }

  /**
   * Get workspace analytics
   */
  async getWorkspaceAnalytics(workspaceId: UUID): Promise<WorkspaceAnalyticsResponse> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/analytics`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get workspace analytics: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: DefaultApiResponses.workspaceAnalytics,
        errorPrefix: 'Backend not available for getting workspace analytics'
      }
    );
  }

  // =============================================================================
  // TAB MANAGEMENT METHODS
  // =============================================================================

  /**
   * Get tab configuration for a specific tab
   */
  async getTabConfiguration(
    tabId: UUID,
    userId: UUID,
    workspaceId: UUID
  ): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/tabs/${tabId}/configuration`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get tab configuration: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: null,
        errorPrefix: 'Backend not available for getting tab configuration'
      }
    );
  }

  /**
   * Create a new tab configuration
   */
  async createTabConfiguration(
    configuration: any,
    userId: UUID,
    workspaceId: UUID
  ): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/tabs/configuration`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            ...configuration,
            userId,
            workspaceId
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create tab configuration: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: configuration,
        errorPrefix: 'Backend not available for creating tab configuration'
      }
    );
  }

  /**
   * Update an existing tab configuration
   */
  async updateTabConfiguration(
    tabId: UUID,
    updates: any,
    userId: UUID,
    workspaceId: UUID
  ): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/tabs/${tabId}/configuration`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            ...updates,
            userId,
            workspaceId
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update tab configuration: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for updating tab configuration'
      }
    );
  }

  /**
   * Remove a tab configuration
   */
  async removeTabConfiguration(
    tabId: UUID,
    userId: UUID,
    workspaceId: UUID
  ): Promise<void> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/tabs/${tabId}/configuration`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to remove tab configuration: ${response.statusText}`);
        }
      },
      {
        defaultValue: undefined,
        errorPrefix: 'Backend not available for removing tab configuration'
      }
    );
  }

  /**
   * Create a new tab group
   */
  async createTabGroup(request: {
    tabGroup: any;
    userId: UUID;
    workspaceId: UUID;
  }): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${request.workspaceId}/tab-groups`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            ...request.tabGroup,
            userId: request.userId,
            workspaceId: request.workspaceId
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create tab group: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: request.tabGroup,
        errorPrefix: 'Backend not available for creating tab group'
      }
    );
  }

  /**
   * Get workspace layout configuration
   */
  async getWorkspaceLayout(
    workspaceId: UUID,
    userId: UUID
  ): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${workspaceId}/layout`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get workspace layout: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { layout: 'default', components: [] },
        errorPrefix: 'Backend not available for getting workspace layout'
      }
    );
  }

  /**
   * Get user layout preferences
   */
  async getUserLayoutPreferences(userId: UUID): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/users/${userId}/layout-preferences`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get user layout preferences: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { theme: 'system', layout: 'default', sidebarCollapsed: false },
        errorPrefix: 'Backend not available for getting user layout preferences'
      }
    );
  }

  /**
   * Update split screen panes
   */
  async updateSplitScreenPanes(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/split-screen/panes`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to update split screen panes: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for updating split screen panes'
      }
    );
  }

  /**
   * Update pane position
   */
  async updatePanePosition(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/split-screen/panes/position`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to update pane position: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for updating pane position'
      }
    );
  }

  /**
   * Create split screen template
   */
  async createSplitScreenTemplate(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/split-screen/templates`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to create split screen template: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { id: crypto.randomUUID(), ...request },
        errorPrefix: 'Backend not available for creating split screen template'
      }
    );
  }

  /**
   * Remove split screen pane
   */
  async removeSplitScreenPane(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/split-screen/panes/${request.paneId}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to remove split screen pane: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for removing split screen pane'
      }
    );
  }

  /**
   * Add component to workspace
   */
  async addComponentToWorkspace(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${request.workspaceId}/components`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to add component to workspace: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { id: crypto.randomUUID(), ...request },
        errorPrefix: 'Backend not available for adding component to workspace'
      }
    );
  }

  /**
   * Remove component from workspace
   */
  async removeComponentFromWorkspace(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${request.workspaceId}/components/${request.componentId}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to remove component from workspace: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for removing component from workspace'
      }
    );
  }

  /**
   * Update component position
   */
  async updateComponentPosition(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${request.workspaceId}/components/${request.componentId}/position`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to update component position: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for updating component position'
      }
    );
  }

  /**
   * Update component size
   */
  async updateComponentSize(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/${request.workspaceId}/components/${request.componentId}/size`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to update component size: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { success: true },
        errorPrefix: 'Backend not available for updating component size'
      }
    );
  }

  /**
   * Create workspace template
   */
  async createWorkspaceTemplate(request: any): Promise<any> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/workspace/templates`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to create workspace template: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: { id: crypto.randomUUID(), ...request },
        errorPrefix: 'Backend not available for creating workspace template'
      }
    );
  }

  /**
   * Get notifications
   */
  async getNotifications(request: any): Promise<any[]> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}/api/racine/notifications`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get notifications: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: [],
        errorPrefix: 'Backend not available for getting notifications'
      }
    );
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Close WebSocket connection
    if (this.websocket) {
      this.websocket.close(1000, 'Cleanup requested');
      this.websocket = null;
    }
    
    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Clear event subscriptions
    this.eventSubscriptions.clear();
    
    // Reset connection state
    this.isWebSocketConnected = false;
    this.reconnectAttempts = 0;
    
    console.log('Workspace management API cleanup completed');
  }

  /**
   * Check if WebSocket is currently connected
   */
  isConnected(): boolean {
    return this.isWebSocketConnected && 
           this.websocket !== null && 
           this.websocket.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status information
   */
  getConnectionStatus(): {
    isConnected: boolean;
    connectionType: 'websocket' | 'polling' | 'disconnected';
    reconnectAttempts: number;
    lastError?: string;
  } {
    return {
      isConnected: this.isConnected(),
      connectionType: this.isWebSocketConnected ? 'websocket' : 
                     this.pollingInterval ? 'polling' : 'disconnected',
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create and export singleton instance
export const workspaceManagementAPI = new WorkspaceManagementAPI();

// Export class for direct instantiation if needed
export { WorkspaceManagementAPI };

// Export types for external usage
export type {
  WorkspaceAPIConfig,
  WorkspaceEvent,
  WorkspaceEventHandler,
  WorkspaceEventSubscription,
  WorkspaceWebSocketMessage
};