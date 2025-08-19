import { EventEmitter } from 'events';

// WebSocket connection states
export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket event types
export enum WebSocketEventType {
  // Classification events
  CLASSIFICATION_UPDATE = 'classification_update',
  BULK_OPERATION_PROGRESS = 'bulk_operation_progress',
  AUDIT_TRAIL_UPDATE = 'audit_trail_update',
  COMPLIANCE_ALERT = 'compliance_alert',
  
  // ML events
  TRAINING_PROGRESS = 'training_progress',
  MODEL_UPDATE = 'model_update',
  PREDICTION_RESULT = 'prediction_result',
  DRIFT_DETECTED = 'drift_detected',
  HYPERPARAMETER_UPDATE = 'hyperparameter_update',
  
  // AI events
  AI_INFERENCE_STREAM = 'ai_inference_stream',
  CONVERSATION_UPDATE = 'conversation_update',
  KNOWLEDGE_SYNTHESIS = 'knowledge_synthesis',
  INTELLIGENCE_ALERT = 'intelligence_alert',
  REAL_TIME_INSIGHT = 'real_time_insight',
  
  // System events
  SYSTEM_STATUS = 'system_status',
  PERFORMANCE_METRICS = 'performance_metrics',
  RESOURCE_USAGE = 'resource_usage',
  WORKFLOW_STATUS = 'workflow_status',
  
  // Connection events
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_LOST = 'connection_lost',
  RECONNECTION_ATTEMPT = 'reconnection_attempt',
  AUTHENTICATION_REQUIRED = 'authentication_required'
}

// WebSocket message interface
export interface WebSocketMessage {
  id: string;
  type: WebSocketEventType;
  timestamp: string;
  payload: any;
  metadata?: {
    source: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    ttl?: number;
    retryCount?: number;
  };
}

// WebSocket subscription interface
export interface WebSocketSubscription {
  id: string;
  eventType: WebSocketEventType;
  filter?: (message: WebSocketMessage) => boolean;
  callback: (message: WebSocketMessage) => void;
  options?: {
    once?: boolean;
    priority?: number;
    buffer?: boolean;
  };
}

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageQueueSize: number;
  compression: boolean;
  binaryType: 'blob' | 'arraybuffer';
  authentication?: {
    token: string;
    refreshCallback?: () => Promise<string>;
  };
}

// WebSocket statistics
export interface WebSocketStats {
  connectionCount: number;
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  reconnectionAttempts: number;
  lastConnected: string | null;
  lastDisconnected: string | null;
  averageLatency: number;
  errorCount: number;
}

// WebSocket performance metrics
export interface WebSocketPerformance {
  latency: number;
  throughput: number;
  errorRate: number;
  connectionStability: number;
  messageDeliveryRate: number;
}

// Advanced WebSocket API class
class WebSocketAPI extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stats: WebSocketStats;
  private performanceMetrics: WebSocketPerformance;
  private messageBuffer: Map<string, WebSocketMessage[]> = new Map();
  private latencyMeasurements: number[] = [];

  constructor(config: WebSocketConfig) {
    super();
    this.config = config;
    this.stats = {
      connectionCount: 0,
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      reconnectionAttempts: 0,
      lastConnected: null,
      lastDisconnected: null,
      averageLatency: 0,
      errorCount: 0
    };
    this.performanceMetrics = {
      latency: 0,
      throughput: 0,
      errorRate: 0,
      connectionStability: 0,
      messageDeliveryRate: 0
    };
  }

  // Connect to WebSocket server
  public async connect(): Promise<void> {
    if (this.state === WebSocketState.CONNECTED || this.state === WebSocketState.CONNECTING) {
      return;
    }

    this.setState(WebSocketState.CONNECTING);

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.ws.binaryType = this.config.binaryType;

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          this.onConnectionEstablished();
          resolve();
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });
    } catch (error) {
      this.setState(WebSocketState.ERROR);
      throw error;
    }
  }

  // Disconnect from WebSocket server
  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
    this.cleanup();
  }

  // Send message through WebSocket
  public send(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      if (this.state !== WebSocketState.CONNECTED) {
        if (this.messageQueue.length < this.config.messageQueueSize) {
          this.messageQueue.push(fullMessage);
          resolve();
        } else {
          reject(new Error('WebSocket not connected and message queue is full'));
        }
        return;
      }

      try {
        const serialized = JSON.stringify(fullMessage);
        this.ws!.send(serialized);
        this.stats.messagesSent++;
        this.stats.bytesSent += serialized.length;
        resolve();
      } catch (error) {
        this.stats.errorCount++;
        reject(error);
      }
    });
  }

  // Subscribe to WebSocket events
  public subscribe(
    eventType: WebSocketEventType,
    callback: (message: WebSocketMessage) => void,
    options?: {
      filter?: (message: WebSocketMessage) => boolean;
      once?: boolean;
      priority?: number;
      buffer?: boolean;
    }
  ): string {
    const subscription: WebSocketSubscription = {
      id: this.generateSubscriptionId(),
      eventType,
      callback,
      filter: options?.filter,
      options
    };

    this.subscriptions.set(subscription.id, subscription);

    // Send buffered messages if buffer option is enabled
    if (options?.buffer && this.messageBuffer.has(eventType)) {
      const bufferedMessages = this.messageBuffer.get(eventType)!;
      bufferedMessages.forEach(message => {
        if (!subscription.filter || subscription.filter(message)) {
          callback(message);
        }
      });
    }

    return subscription.id;
  }

  // Unsubscribe from WebSocket events
  public unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  // Get current WebSocket state
  public getState(): WebSocketState {
    return this.state;
  }

  // Get WebSocket statistics
  public getStats(): WebSocketStats {
    return { ...this.stats };
  }

  // Get performance metrics
  public getPerformanceMetrics(): WebSocketPerformance {
    this.calculatePerformanceMetrics();
    return { ...this.performanceMetrics };
  }

  // Send heartbeat message
  public sendHeartbeat(): void {
    if (this.state === WebSocketState.CONNECTED) {
      const heartbeatMessage: WebSocketMessage = {
        id: this.generateMessageId(),
        type: WebSocketEventType.SYSTEM_STATUS,
        timestamp: new Date().toISOString(),
        payload: { type: 'heartbeat', timestamp: Date.now() }
      };
      
      this.send(heartbeatMessage).catch(() => {
        // Heartbeat failed, connection might be lost
        this.handleConnectionLoss();
      });
    }
  }

  // Setup WebSocket event handlers
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.onConnectionEstablished();
    };

    this.ws.onmessage = (event) => {
      this.onMessageReceived(event);
    };

    this.ws.onclose = (event) => {
      this.onConnectionClosed(event);
    };

    this.ws.onerror = (error) => {
      this.onError(error);
    };
  }

  // Handle connection established
  private onConnectionEstablished(): void {
    this.setState(WebSocketState.CONNECTED);
    this.stats.connectionCount++;
    this.stats.lastConnected = new Date().toISOString();
    this.reconnectAttempts = 0;

    // Start heartbeat
    this.startHeartbeat();

    // Send queued messages
    this.flushMessageQueue();

    // Authenticate if required
    if (this.config.authentication) {
      this.authenticate();
    }

    this.emit(WebSocketEventType.CONNECTION_ESTABLISHED);
  }

  // Handle message received
  private onMessageReceived(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;
      this.stats.bytesReceived += event.data.length;

      // Handle heartbeat response
      if (message.type === WebSocketEventType.SYSTEM_STATUS && 
          message.payload?.type === 'heartbeat_response') {
        this.handleHeartbeatResponse(message);
        return;
      }

      // Buffer message if needed
      this.bufferMessage(message);

      // Notify subscribers
      this.notifySubscribers(message);

      this.emit('message', message);
    } catch (error) {
      this.stats.errorCount++;
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  // Handle connection closed
  private onConnectionClosed(event: CloseEvent): void {
    this.setState(WebSocketState.DISCONNECTED);
    this.stats.lastDisconnected = new Date().toISOString();
    this.cleanup();

    if (event.code !== 1000) { // Not a normal closure
      this.handleConnectionLoss();
    }

    this.emit(WebSocketEventType.CONNECTION_LOST, { code: event.code, reason: event.reason });
  }

  // Handle WebSocket error
  private onError(error: Event): void {
    this.setState(WebSocketState.ERROR);
    this.stats.errorCount++;
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  // Handle connection loss and attempt reconnection
  private handleConnectionLoss(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.setState(WebSocketState.RECONNECTING);
      this.reconnectAttempts++;
      this.stats.reconnectionAttempts++;

      this.reconnectTimer = setTimeout(() => {
        this.emit(WebSocketEventType.RECONNECTION_ATTEMPT, { attempt: this.reconnectAttempts });
        this.connect().catch(() => {
          this.handleConnectionLoss();
        });
      }, this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
    } else {
      this.setState(WebSocketState.ERROR);
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Start heartbeat mechanism
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  // Handle heartbeat response
  private handleHeartbeatResponse(message: WebSocketMessage): void {
    const sentTime = message.payload.timestamp;
    const latency = Date.now() - sentTime;
    this.latencyMeasurements.push(latency);
    
    // Keep only last 100 measurements
    if (this.latencyMeasurements.length > 100) {
      this.latencyMeasurements.shift();
    }
  }

  // Flush queued messages
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state === WebSocketState.CONNECTED) {
      const message = this.messageQueue.shift()!;
      this.send(message).catch(error => {
        console.error('Failed to send queued message:', error);
      });
    }
  }

  // Authenticate with server
  private authenticate(): void {
    if (this.config.authentication) {
      const authMessage: WebSocketMessage = {
        id: this.generateMessageId(),
        type: WebSocketEventType.AUTHENTICATION_REQUIRED,
        timestamp: new Date().toISOString(),
        payload: {
          token: this.config.authentication.token
        }
      };

      this.send(authMessage).catch(error => {
        console.error('Authentication failed:', error);
      });
    }
  }

  // Buffer message for subscribers
  private bufferMessage(message: WebSocketMessage): void {
    if (!this.messageBuffer.has(message.type)) {
      this.messageBuffer.set(message.type, []);
    }

    const buffer = this.messageBuffer.get(message.type)!;
    buffer.push(message);

    // Keep only last 50 messages per type
    if (buffer.length > 50) {
      buffer.shift();
    }
  }

  // Notify subscribers
  private notifySubscribers(message: WebSocketMessage): void {
    const relevantSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.eventType === message.type)
      .sort((a, b) => (b.options?.priority || 0) - (a.options?.priority || 0));

    relevantSubscriptions.forEach(subscription => {
      try {
        if (!subscription.filter || subscription.filter(message)) {
          subscription.callback(message);

          if (subscription.options?.once) {
            this.unsubscribe(subscription.id);
          }
        }
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }

  // Calculate performance metrics
  private calculatePerformanceMetrics(): void {
    if (this.latencyMeasurements.length > 0) {
      this.performanceMetrics.latency = this.latencyMeasurements.reduce((a, b) => a + b, 0) / this.latencyMeasurements.length;
    }

    const totalMessages = this.stats.messagesReceived + this.stats.messagesSent;
    if (totalMessages > 0) {
      this.performanceMetrics.errorRate = this.stats.errorCount / totalMessages;
      this.performanceMetrics.messageDeliveryRate = this.stats.messagesSent / totalMessages;
    }

    if (this.stats.connectionCount > 0) {
      this.performanceMetrics.connectionStability = 1 - (this.stats.reconnectionAttempts / this.stats.connectionCount);
    }

    // Calculate throughput (messages per second)
    const now = Date.now();
    const startTime = this.stats.lastConnected ? new Date(this.stats.lastConnected).getTime() : now;
    const duration = (now - startTime) / 1000;
    if (duration > 0) {
      this.performanceMetrics.throughput = totalMessages / duration;
    }
  }

  // Set WebSocket state
  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.emit('stateChange', { oldState, newState });
    }
  }

  // Cleanup resources
  private cleanup(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws = null;
    }
  }

  // Generate unique message ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique subscription ID
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// WebSocket API singleton instance
let websocketInstance: WebSocketAPI | null = null;

// WebSocket API factory
export const createWebSocketAPI = (config: WebSocketConfig): WebSocketAPI => {
  if (!websocketInstance) {
    websocketInstance = new WebSocketAPI(config);
  }
  return websocketInstance;
};

// Default WebSocket configuration
export const defaultWebSocketConfig: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  messageQueueSize: 1000,
  compression: true,
  binaryType: 'arraybuffer'
};

// Convenience methods
export const websocketApi = {
  // Initialize WebSocket connection
  initialize: (config?: Partial<WebSocketConfig>) => {
    const finalConfig = { ...defaultWebSocketConfig, ...config };
    return createWebSocketAPI(finalConfig);
  },

  // Get current instance
  getInstance: () => websocketInstance,

  // Quick subscription methods
  subscribeToClassification: (callback: (data: any) => void) => {
    return websocketInstance?.subscribe(WebSocketEventType.CLASSIFICATION_UPDATE, callback);
  },

  subscribeToTraining: (callback: (data: any) => void) => {
    return websocketInstance?.subscribe(WebSocketEventType.TRAINING_PROGRESS, callback);
  },

  subscribeToAIInference: (callback: (data: any) => void) => {
    return websocketInstance?.subscribe(WebSocketEventType.AI_INFERENCE_STREAM, callback);
  },

  subscribeToSystemStatus: (callback: (data: any) => void) => {
    return websocketInstance?.subscribe(WebSocketEventType.SYSTEM_STATUS, callback);
  },

  // Broadcast methods
  broadcastClassificationUpdate: (data: any) => {
    return websocketInstance?.send({
      type: WebSocketEventType.CLASSIFICATION_UPDATE,
      payload: data
    });
  },

  broadcastTrainingProgress: (data: any) => {
    return websocketInstance?.send({
      type: WebSocketEventType.TRAINING_PROGRESS,
      payload: data
    });
  },

  broadcastAIInference: (data: any) => {
    return websocketInstance?.send({
      type: WebSocketEventType.AI_INFERENCE_STREAM,
      payload: data
    });
  }
};

export default websocketApi;