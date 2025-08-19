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
  enableRealTimeSync: true,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
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
   * Initialize WebSocket connection for real-time updates
   */
  async initializeWebSocket(): Promise<void> {
    if (!this.config.enableRealTimeSync || !this.config.websocketURL) {
      return;
    }

    try {
      this.websocket = new WebSocket(`${this.config.websocketURL}/workspace`);
      
      this.websocket.onopen = () => {
        console.log('Workspace WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WorkspaceWebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Workspace WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Workspace WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
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

    const response = await fetch(`${this.config.baseURL}/api/racine/workspace/templates?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace templates: ${response.statusText}`);
    }

    return response.json();
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
   * Cleanup WebSocket connection
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.eventSubscriptions.clear();
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