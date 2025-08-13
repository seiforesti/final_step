/**
 * Racine Collaboration API Service
 * =================================
 * 
 * Comprehensive API service for collaboration functionality that maps 100%
 * to the backend RacineCollaborationService and provides real-time team
 * collaboration with co-authoring, communication, and knowledge sharing.
 * 
 * Features:
 * - Real-time co-authoring and collaborative editing
 * - Multi-role collaboration spaces (system-wide, group-specific, private)
 * - Team communication center with chat and comments
 * - Document collaboration and version management
 * - Expert consultation network and knowledge sharing
 * - External collaborator integration with granular access
 * - Collaboration analytics and engagement metrics
 * - Workflow co-authoring and shared task management
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/racine_services/racine_collaboration_service.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_routes/racine_collaboration_routes.py
 * - Models: backend/scripts_automation/app/models/racine_models/racine_collaboration_models.py
 */

import {
  APIResponse,
  CreateCollaborationSpaceRequest,
  CollaborationSpaceResponse,
  CollaborationSpaceListResponse,
  UpdateCollaborationSpaceRequest,
  StartCoAuthoringSessionRequest,
  CoAuthoringSessionResponse,
  SendMessageRequest,
  MessageResponse,
  MessageListResponse,
  CreateCommentRequest,
  CommentResponse,
  ShareDocumentRequest,
  DocumentShareResponse,
  InviteCollaboratorRequest,
  CollaboratorResponse,
  CollaborationAnalyticsRequest,
  CollaborationAnalyticsResponse,
  UUID,
  ISODateString,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../types/api.types';

import {
  CollaborationState,
  CollaborationSession,
  CollaborationSpace,
  CoAuthoringSession,
  CollaborationMessage,
  CollaborationComment,
  DocumentCollaboration,
  ExpertConsultation,
  KnowledgeArticle,
  CollaborationMetrics,
  PresenceInfo,
  ConflictResolution,
  CollaborationPermissions
} from '../types/racine-core.types';

/**
 * Configuration for the collaboration API service
 */
interface CollaborationAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTimeCollaboration: boolean;
  enablePresenceTracking: boolean;
  presenceUpdateInterval: number;
  websocketURL?: string;
  maxCollaboratorsPerSession: number;
  conflictResolutionStrategy: 'merge' | 'lock' | 'branch';
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: CollaborationAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableRealTimeCollaboration: true,
  enablePresenceTracking: true,
  presenceUpdateInterval: 5000,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  maxCollaboratorsPerSession: 20,
  conflictResolutionStrategy: 'merge'
};

/**
 * Collaboration event types for real-time updates
 */
export enum CollaborationEventType {
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  CONTENT_CHANGED = 'content_changed',
  CURSOR_MOVED = 'cursor_moved',
  SELECTION_CHANGED = 'selection_changed',
  MESSAGE_SENT = 'message_sent',
  COMMENT_ADDED = 'comment_added',
  COMMENT_RESOLVED = 'comment_resolved',
  DOCUMENT_SHARED = 'document_shared',
  CONFLICT_DETECTED = 'conflict_detected',
  CONFLICT_RESOLVED = 'conflict_resolved',
  PRESENCE_UPDATED = 'presence_updated'
}

/**
 * Collaboration space types
 */
export enum CollaborationSpaceType {
  SYSTEM_WIDE = 'system_wide',
  GROUP_SPECIFIC = 'group_specific',
  PROJECT = 'project',
  WORKSPACE = 'workspace',
  PRIVATE = 'private',
  EXTERNAL = 'external'
}

/**
 * Co-authoring operation types
 */
export enum OperationType {
  INSERT = 'insert',
  DELETE = 'delete',
  REPLACE = 'replace',
  FORMAT = 'format',
  MOVE = 'move'
}

/**
 * Collaboration event interface
 */
export interface CollaborationEvent {
  type: CollaborationEventType;
  sessionId: UUID;
  spaceId?: UUID;
  userId: UUID;
  timestamp: ISODateString;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Collaboration event handler type
 */
export type CollaborationEventHandler = (event: CollaborationEvent) => void;

/**
 * Collaboration event subscription
 */
export interface CollaborationEventSubscription {
  id: UUID;
  eventType: CollaborationEventType;
  handler: CollaborationEventHandler;
  sessionId?: UUID;
  spaceId?: UUID;
}

/**
 * Co-authoring operation interface
 */
export interface CoAuthoringOperation {
  id: UUID;
  type: OperationType;
  position: number;
  content: string;
  length?: number;
  userId: UUID;
  timestamp: ISODateString;
  metadata?: Record<string, any>;
}

/**
 * Presence information interface
 */
export interface UserPresence {
  userId: UUID;
  userName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
  currentDocument?: UUID;
  lastSeen: ISODateString;
}

/**
 * Main Collaboration API Service Class
 */
class CollaborationAPI {
  private config: CollaborationAPIConfig;
  private authToken: string | null = null;
  private websocket: WebSocket | null = null;
  private eventSubscriptions: Map<UUID, CollaborationEventSubscription> = new Map();
  private activeSessions: Map<UUID, CoAuthoringSession> = new Map();
  private presenceMap: Map<UUID, UserPresence> = new Map();
  private presenceTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<CollaborationAPIConfig> = {}) {
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
   * Initialize real-time collaboration
   */
  async initializeRealTimeCollaboration(): Promise<void> {
    if (!this.config.enableRealTimeCollaboration || !this.config.websocketURL) {
      return;
    }

    try {
      this.websocket = new WebSocket(`${this.config.websocketURL}/collaboration`);
      
      this.websocket.onopen = () => {
        console.log('Collaboration WebSocket connected');
        this.reconnectAttempts = 0;
        
        if (this.config.enablePresenceTracking) {
          this.startPresenceTracking();
        }
      };

      this.websocket.onmessage = (event) => {
        try {
          const collaborationEvent: CollaborationEvent = JSON.parse(event.data);
          this.handleCollaborationEvent(collaborationEvent);
        } catch (error) {
          console.error('Failed to parse collaboration event:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Collaboration WebSocket disconnected');
        this.stopPresenceTracking();
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize collaboration WebSocket:', error);
    }
  }

  /**
   * Handle incoming collaboration events
   */
  private handleCollaborationEvent(event: CollaborationEvent): void {
    // Update presence information
    if (event.type === CollaborationEventType.PRESENCE_UPDATED && event.data.presence) {
      this.presenceMap.set(event.userId, event.data.presence);
    }

    const applicableSubscriptions = Array.from(this.eventSubscriptions.values()).filter(
      subscription => {
        const typeMatches = subscription.eventType === event.type;
        const sessionMatches = !subscription.sessionId || subscription.sessionId === event.sessionId;
        const spaceMatches = !subscription.spaceId || subscription.spaceId === event.spaceId;
        return typeMatches && sessionMatches && spaceMatches;
      }
    );

    applicableSubscriptions.forEach(subscription => {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error('Error executing collaboration event handler:', error);
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
        console.log(`Attempting collaboration WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeRealTimeCollaboration();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  // =============================================================================
  // COLLABORATION SPACES
  // =============================================================================

  /**
   * Create collaboration space
   * Maps to: POST /api/racine/collaboration/spaces/create
   */
  async createCollaborationSpace(request: CreateCollaborationSpaceRequest): Promise<CollaborationSpaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create collaboration space: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get collaboration space
   * Maps to: GET /api/racine/collaboration/spaces/{id}
   */
  async getCollaborationSpace(spaceId: UUID): Promise<CollaborationSpaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/${spaceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get collaboration space: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List collaboration spaces
   * Maps to: GET /api/racine/collaboration/spaces/list
   */
  async listCollaborationSpaces(
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<CollaborationSpaceListResponse> {
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

    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/list?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to list collaboration spaces: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update collaboration space
   * Maps to: PUT /api/racine/collaboration/spaces/{id}
   */
  async updateCollaborationSpace(spaceId: UUID, request: UpdateCollaborationSpaceRequest): Promise<CollaborationSpaceResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/${spaceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update collaboration space: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // CO-AUTHORING SESSIONS
  // =============================================================================

  /**
   * Start co-authoring session
   * Maps to: POST /api/racine/collaboration/co-authoring/start
   */
  async startCoAuthoringSession(request: StartCoAuthoringSessionRequest): Promise<CoAuthoringSessionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/co-authoring/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to start co-authoring session: ${response.statusText}`);
    }

    const session = await response.json();
    this.activeSessions.set(session.id, session);
    return session;
  }

  /**
   * Join co-authoring session
   * Maps to: POST /api/racine/collaboration/co-authoring/{sessionId}/join
   */
  async joinCoAuthoringSession(sessionId: UUID): Promise<CoAuthoringSessionResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/co-authoring/${sessionId}/join`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to join co-authoring session: ${response.statusText}`);
    }

    const session = await response.json();
    this.activeSessions.set(session.id, session);
    return session;
  }

  /**
   * Apply co-authoring operation
   * Maps to: POST /api/racine/collaboration/co-authoring/{sessionId}/operation
   */
  async applyOperation(sessionId: UUID, operation: CoAuthoringOperation): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/co-authoring/${sessionId}/operation`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ operation })
    });

    if (!response.ok) {
      throw new Error(`Failed to apply operation: ${response.statusText}`);
    }

    // Broadcast operation to other collaborators via WebSocket
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'operation',
        sessionId,
        operation
      }));
    }
  }

  /**
   * Leave co-authoring session
   * Maps to: POST /api/racine/collaboration/co-authoring/{sessionId}/leave
   */
  async leaveCoAuthoringSession(sessionId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/co-authoring/${sessionId}/leave`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to leave co-authoring session: ${response.statusText}`);
    }

    this.activeSessions.delete(sessionId);
  }

  // =============================================================================
  // COMMUNICATION
  // =============================================================================

  /**
   * Send message in collaboration space
   * Maps to: POST /api/racine/collaboration/spaces/{spaceId}/messages
   */
  async sendMessage(spaceId: UUID, request: SendMessageRequest): Promise<MessageResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/${spaceId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get messages from collaboration space
   * Maps to: GET /api/racine/collaboration/spaces/{spaceId}/messages
   */
  async getMessages(
    spaceId: UUID,
    pagination?: PaginationRequest,
    filters?: FilterRequest
  ): Promise<MessageListResponse> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }
    
    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/${spaceId}/messages?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Add comment to document/resource
   * Maps to: POST /api/racine/collaboration/comments
   */
  async addComment(request: CreateCommentRequest): Promise<CommentResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get comments for resource
   * Maps to: GET /api/racine/collaboration/comments/{resourceType}/{resourceId}
   */
  async getComments(
    resourceType: string,
    resourceId: UUID,
    pagination?: PaginationRequest
  ): Promise<CommentResponse[]> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/comments/${resourceType}/${resourceId}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get comments: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Resolve comment
   * Maps to: PUT /api/racine/collaboration/comments/{commentId}/resolve
   */
  async resolveComment(commentId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/comments/${commentId}/resolve`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve comment: ${response.statusText}`);
    }
  }

  // =============================================================================
  // DOCUMENT COLLABORATION
  // =============================================================================

  /**
   * Share document for collaboration
   * Maps to: POST /api/racine/collaboration/documents/share
   */
  async shareDocument(request: ShareDocumentRequest): Promise<DocumentShareResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/documents/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to share document: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get document collaboration info
   * Maps to: GET /api/racine/collaboration/documents/{documentId}
   */
  async getDocumentCollaboration(documentId: UUID): Promise<DocumentCollaboration> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/documents/${documentId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get document collaboration: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get document version history
   * Maps to: GET /api/racine/collaboration/documents/{documentId}/versions
   */
  async getDocumentVersions(documentId: UUID): Promise<any[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/documents/${documentId}/versions`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get document versions: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // COLLABORATOR MANAGEMENT
  // =============================================================================

  /**
   * Invite collaborator
   * Maps to: POST /api/racine/collaboration/invite
   */
  async inviteCollaborator(request: InviteCollaboratorRequest): Promise<CollaboratorResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/invite`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to invite collaborator: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get collaborators for space/session
   * Maps to: GET /api/racine/collaboration/spaces/{spaceId}/collaborators
   */
  async getCollaborators(spaceId: UUID): Promise<CollaboratorResponse[]> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/${spaceId}/collaborators`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get collaborators: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Remove collaborator
   * Maps to: DELETE /api/racine/collaboration/spaces/{spaceId}/collaborators/{collaboratorId}
   */
  async removeCollaborator(spaceId: UUID, collaboratorId: UUID): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/spaces/${spaceId}/collaborators/${collaboratorId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to remove collaborator: ${response.statusText}`);
    }
  }

  // =============================================================================
  // PRESENCE TRACKING
  // =============================================================================

  /**
   * Start presence tracking
   */
  private startPresenceTracking(): void {
    this.presenceTimer = setInterval(() => {
      this.updatePresence();
    }, this.config.presenceUpdateInterval);
  }

  /**
   * Stop presence tracking
   */
  private stopPresenceTracking(): void {
    if (this.presenceTimer) {
      clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }
  }

  /**
   * Update user presence
   */
  private updatePresence(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'presence_update',
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Get current presence information
   */
  getPresenceInfo(): Map<UUID, UserPresence> {
    return new Map(this.presenceMap);
  }

  /**
   * Update cursor position
   */
  updateCursor(line: number, column: number): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'cursor_update',
        cursor: { line, column },
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Update selection
   */
  updateSelection(start: number, end: number): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'selection_update',
        selection: { start, end },
        timestamp: new Date().toISOString()
      }));
    }
  }

  // =============================================================================
  // ANALYTICS
  // =============================================================================

  /**
   * Get collaboration analytics
   * Maps to: POST /api/racine/collaboration/analytics
   */
  async getCollaborationAnalytics(request: CollaborationAnalyticsRequest): Promise<CollaborationAnalyticsResponse> {
    const response = await fetch(`${this.config.baseURL}/api/racine/collaboration/analytics`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to get collaboration analytics: ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // EVENT MANAGEMENT
  // =============================================================================

  /**
   * Subscribe to collaboration events
   */
  subscribeToEvents(
    eventType: CollaborationEventType,
    handler: CollaborationEventHandler,
    sessionId?: UUID,
    spaceId?: UUID
  ): UUID {
    const subscriptionId = crypto.randomUUID();
    const subscription: CollaborationEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      sessionId,
      spaceId
    };

    this.eventSubscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from collaboration events
   */
  unsubscribeFromEvents(subscriptionId: UUID): void {
    this.eventSubscriptions.delete(subscriptionId);
  }

  /**
   * Cleanup all connections and sessions
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.stopPresenceTracking();
    
    // End all active sessions
    this.activeSessions.forEach(async (session, sessionId) => {
      try {
        await this.leaveCoAuthoringSession(sessionId);
      } catch (error) {
        console.error('Error leaving session during cleanup:', error);
      }
    });
    
    this.activeSessions.clear();
    this.eventSubscriptions.clear();
    this.presenceMap.clear();
  }
}

// Create and export singleton instance
export const collaborationAPI = new CollaborationAPI();

// Export class for direct instantiation if needed
export { CollaborationAPI };

// Export types for external usage
export type {
  CollaborationAPIConfig,
  CollaborationEvent,
  CollaborationEventHandler,
  CollaborationEventSubscription,
  CoAuthoringOperation,
  UserPresence
};