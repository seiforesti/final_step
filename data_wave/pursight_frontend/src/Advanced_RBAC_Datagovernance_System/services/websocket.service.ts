// WebSocket Service - Provides real-time RBAC events and notifications
// Handles live updates for permissions, access requests, audit events, and system notifications

import { WEBSOCKET_ENDPOINTS } from '../constants/api.constants';

export interface RBACWebSocketEvent {
  type: 'permission_changed' | 'role_assigned' | 'access_request' | 'audit_alert' | 'user_activity' | 'system_notification';
  data: any;
  timestamp: string;
  userId?: number;
  correlationId?: string;
}

export interface WebSocketConnectionOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  enableCompression?: boolean;
  protocols?: string[];
}

export interface SubscriptionOptions {
  userId?: number;
  entityTypes?: string[];
  actions?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  filters?: Record<string, any>;
}

export type EventHandler = (event: RBACWebSocketEvent) => void;
export type ConnectionHandler = () => void;
export type ErrorHandler = (error: Error) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private subscriptions = new Map<string, SubscriptionOptions>();
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private connectionHandlers = new Set<ConnectionHandler>();
  private disconnectionHandlers = new Set<ConnectionHandler>();
  private errorHandlers = new Set<ErrorHandler>();
  private messageQueue: any[] = [];
  private connectionId: string | null = null;
  private authToken: string | null = null;

  constructor(private options: WebSocketConnectionOptions = {}) {
    this.maxReconnectAttempts = options.reconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
  }

  // === Connection Management ===

  /**
   * Connect to RBAC WebSocket server
   */
  async connect(authToken?: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.authToken = authToken || this.getAuthToken();

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.buildWebSocketUrl();
        this.ws = new WebSocket(wsUrl, this.options.protocols);

        this.ws.onopen = () => {
          console.log('RBAC WebSocket connected');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.startHeartbeat();
          this.resubscribeAll();
          this.flushMessageQueue();
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('RBAC WebSocket disconnected', event.code, event.reason);
          this.stopHeartbeat();
          this.disconnectionHandlers.forEach(handler => handler());
          
          if (!event.wasClean && !this.isReconnecting) {
            this.handleReconnection();
          }
        };

        this.ws.onerror = (error) => {
          console.error('RBAC WebSocket error:', error);
          this.errorHandlers.forEach(handler => handler(new Error('WebSocket connection error')));
          reject(new Error('WebSocket connection failed'));
        };

        // Connection timeout
        setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isReconnecting = false;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.connectionId = null;
    this.subscriptions.clear();
    this.messageQueue = [];
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    readyState: number | null;
    connectionId: string | null;
    subscriptionCount: number;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      readyState: this.ws?.readyState || null,
      connectionId: this.connectionId,
      subscriptionCount: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // === Event Subscription ===

  /**
   * Subscribe to RBAC events
   */
  subscribe(
    eventType: string,
    handler: EventHandler,
    options: SubscriptionOptions = {}
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    // Store event handler
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
    
    // Store subscription options
    this.subscriptions.set(subscriptionId, {
      ...options,
      eventType
    });
    
    // Send subscription to server
    if (this.isConnected()) {
      this.sendMessage({
        type: 'subscribe',
        subscriptionId,
        eventType,
        options
      });
    }
    
    return subscriptionId;
  }

  /**
   * Subscribe to multiple event types
   */
  subscribeToMultiple(
    eventTypes: string[],
    handler: EventHandler,
    options: SubscriptionOptions = {}
  ): string[] {
    return eventTypes.map(eventType => 
      this.subscribe(eventType, handler, options)
    );
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;
    
    this.subscriptions.delete(subscriptionId);
    
    if (this.isConnected()) {
      this.sendMessage({
        type: 'unsubscribe',
        subscriptionId
      });
    }
  }

  /**
   * Unsubscribe from all events of a specific type
   */
  unsubscribeFromEventType(eventType: string): void {
    this.eventHandlers.delete(eventType);
    
    // Remove all subscriptions for this event type
    const subscriptionsToRemove: string[] = [];
    this.subscriptions.forEach((options, subscriptionId) => {
      if (options.eventType === eventType) {
        subscriptionsToRemove.push(subscriptionId);
      }
    });
    
    subscriptionsToRemove.forEach(subscriptionId => {
      this.unsubscribe(subscriptionId);
    });
  }

  /**
   * Clear all subscriptions
   */
  unsubscribeAll(): void {
    this.eventHandlers.clear();
    this.subscriptions.clear();
    
    if (this.isConnected()) {
      this.sendMessage({
        type: 'unsubscribe_all'
      });
    }
  }

  // === Specific RBAC Event Subscriptions ===

  /**
   * Subscribe to permission changes
   */
  onPermissionChanged(
    handler: (event: { userId: number; permission: string; action: 'granted' | 'revoked'; resource?: string }) => void,
    options: { userId?: number; resourceType?: string } = {}
  ): string {
    return this.subscribe('permission_changed', (event) => {
      handler(event.data);
    }, options);
  }

  /**
   * Subscribe to role assignments
   */
  onRoleAssigned(
    handler: (event: { userId: number; roleId: number; action: 'assigned' | 'removed'; assignedBy: number }) => void,
    options: { userId?: number; roleId?: number } = {}
  ): string {
    return this.subscribe('role_assigned', (event) => {
      handler(event.data);
    }, options);
  }

  /**
   * Subscribe to access requests
   */
  onAccessRequest(
    handler: (event: { requestId: number; status: string; requesterId: number; reviewerId?: number }) => void,
    options: { requesterId?: number; reviewerId?: number } = {}
  ): string {
    return this.subscribe('access_request', (event) => {
      handler(event.data);
    }, options);
  }

  /**
   * Subscribe to audit alerts
   */
  onAuditAlert(
    handler: (event: { alertId: number; severity: string; message: string; entityType?: string; entityId?: number }) => void,
    options: { severity?: string; entityType?: string } = {}
  ): string {
    return this.subscribe('audit_alert', (event) => {
      handler(event.data);
    }, options);
  }

  /**
   * Subscribe to user activity
   */
  onUserActivity(
    handler: (event: { userId: number; action: string; resource?: string; timestamp: string }) => void,
    options: { userId?: number; actions?: string[] } = {}
  ): string {
    return this.subscribe('user_activity', (event) => {
      handler(event.data);
    }, options);
  }

  /**
   * Subscribe to system notifications
   */
  onSystemNotification(
    handler: (event: { id: string; type: string; message: string; priority: string; data?: any }) => void,
    options: { priority?: string; types?: string[] } = {}
  ): string {
    return this.subscribe('system_notification', (event) => {
      handler(event.data);
    }, options);
  }

  // === Connection Event Handlers ===

  /**
   * Add connection event handler
   */
  onConnect(handler: ConnectionHandler): void {
    this.connectionHandlers.add(handler);
  }

  /**
   * Add disconnection event handler
   */
  onDisconnect(handler: ConnectionHandler): void {
    this.disconnectionHandlers.add(handler);
  }

  /**
   * Add error event handler
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  /**
   * Remove connection event handler
   */
  removeConnectionHandler(handler: ConnectionHandler): void {
    this.connectionHandlers.delete(handler);
  }

  /**
   * Remove disconnection event handler
   */
  removeDisconnectionHandler(handler: ConnectionHandler): void {
    this.disconnectionHandlers.delete(handler);
  }

  /**
   * Remove error event handler
   */
  removeErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler);
  }

  // === Message Handling ===

  /**
   * Send message to server
   */
  private sendMessage(message: any): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'connection_established':
          this.connectionId = message.connectionId;
          break;
          
        case 'event':
          this.handleRBACEvent(message);
          break;
          
        case 'subscription_confirmed':
          console.log('Subscription confirmed:', message.subscriptionId);
          break;
          
        case 'subscription_error':
          console.error('Subscription error:', message.error);
          this.errorHandlers.forEach(handler => 
            handler(new Error(`Subscription error: ${message.error}`))
          );
          break;
          
        case 'heartbeat':
          this.sendMessage({ type: 'heartbeat_response' });
          break;
          
        case 'error':
          console.error('WebSocket server error:', message.error);
          this.errorHandlers.forEach(handler => 
            handler(new Error(message.error))
          );
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.errorHandlers.forEach(handler => 
        handler(new Error('Failed to parse WebSocket message'))
      );
    }
  }

  /**
   * Handle RBAC event
   */
  private handleRBACEvent(message: any): void {
    const rbacEvent: RBACWebSocketEvent = {
      type: message.eventType,
      data: message.data,
      timestamp: message.timestamp,
      userId: message.userId,
      correlationId: message.correlationId
    };
    
    // Trigger handlers for this event type
    const handlers = this.eventHandlers.get(message.eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(rbacEvent);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  // === Connection Recovery ===

  /**
   * Handle reconnection logic
   */
  private handleReconnection(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(async () => {
      try {
        await this.connect(this.authToken || undefined);
      } catch (error) {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnection();
        } else {
          console.error('Max reconnection attempts reached');
          this.errorHandlers.forEach(handler => 
            handler(new Error('Failed to reconnect after maximum attempts'))
          );
        }
      }
    }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
  }

  /**
   * Resubscribe to all events after reconnection
   */
  private resubscribeAll(): void {
    this.subscriptions.forEach((options, subscriptionId) => {
      this.sendMessage({
        type: 'subscribe',
        subscriptionId,
        eventType: options.eventType,
        options
      });
    });
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  // === Heartbeat ===

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({ type: 'heartbeat' });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // === Utility Methods ===

  /**
   * Build WebSocket URL
   */
  private buildWebSocketUrl(): string {
    // Prefer proxy path (matches data-sources behavior) so auth can be handled by gateway/cookies
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      // Default RBAC events proxy path; adjust if your backend expects a different mount
      const proxyPath = '/proxy/rbac/permissions';
      const url = `${protocol}//${host}${proxyPath}`;
      // When using proxy path, we avoid query param tokens; gateway should attach cookies/headers
      return url;
    }

    // Fallback to configured WS base (non-browser env)
    const baseUrl = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8000';
    const wsUrl = new URL(WEBSOCKET_ENDPOINTS.RBAC_EVENTS, baseUrl);
    if (this.authToken) wsUrl.searchParams.append('token', this.authToken);
    return wsUrl.toString();
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    // Try to get token from various sources
    if (typeof window !== 'undefined') {
      // Align with data-sources: prefer authToken, then session_token cookie; include other common keys
      const token = localStorage.getItem('authToken') ||
                   localStorage.getItem('auth_token') ||
                   sessionStorage.getItem('session_token') ||
                   sessionStorage.getItem('authToken') ||
                   sessionStorage.getItem('auth_token') ||
                   this.getCookieValue('session_token') ||
                   this.getCookieValue('auth_token');
      return token;
    }
    return null;
  }

  /**
   * Get cookie value
   */
  private getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // === Advanced Features ===

  /**
   * Send custom message to server
   */
  sendCustomMessage(type: string, data: any): void {
    this.sendMessage({
      type: 'custom',
      customType: type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request current user permissions
   */
  requestCurrentPermissions(): void {
    this.sendMessage({
      type: 'request_permissions',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request system status
   */
  requestSystemStatus(): void {
    this.sendMessage({
      type: 'request_status',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update subscription filters
   */
  updateSubscriptionFilters(subscriptionId: string, filters: Record<string, any>): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.filters = { ...subscription.filters, ...filters };
      
      this.sendMessage({
        type: 'update_subscription',
        subscriptionId,
        filters: subscription.filters
      });
    }
  }

  /**
   * Get subscription statistics
   */
  getSubscriptionStats(): {
    totalSubscriptions: number;
    eventTypeBreakdown: Record<string, number>;
    activeHandlers: number;
  } {
    const eventTypeBreakdown: Record<string, number> = {};
    
    this.subscriptions.forEach(subscription => {
      const eventType = subscription.eventType || 'unknown';
      eventTypeBreakdown[eventType] = (eventTypeBreakdown[eventType] || 0) + 1;
    });
    
    let activeHandlers = 0;
    this.eventHandlers.forEach(handlerSet => {
      activeHandlers += handlerSet.size;
    });
    
    return {
      totalSubscriptions: this.subscriptions.size,
      eventTypeBreakdown,
      activeHandlers
    };
  }
}

// Export singleton instance
export const rbacWebSocketService = new WebSocketService();
export default rbacWebSocketService;