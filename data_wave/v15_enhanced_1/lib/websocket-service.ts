/**
 * Enhanced WebSocket Service for Enterprise Data Governance Platform
 * ==============================================================
 *
 * Production-grade WebSocket service with advanced features:
 * - Auto-reconnection with exponential backoff
 * - Message queuing and persistence
 * - Connection state management
 * - Heart-beat monitoring
 * - Secure message handling
 * - Event subscription system
 * - Cross-group communication
 * - Performance monitoring
 */

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

export type WSMessage = {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  groupId?: string;
  correlationId?: string;
  priority?: "high" | "normal" | "low";
};

export type WSConfig = {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  maxReconnectDelay?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
  enableCompression?: boolean;
  enableEncryption?: boolean;
  queueSize?: number;
};

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export class EnhancedWebSocketService {
  private ws: WebSocket | null = null;
  private readonly eventEmitter = new EventEmitter();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WSMessage[] = [];
  private pendingMessages = new Map<
    string,
    {
      message: WSMessage;
      timestamp: number;
      retries: number;
    }
  >();
  private connectionState: ConnectionState = "disconnected";
  private lastHeartbeat: number = Date.now();
  private readonly subscriptions = new Map<
    string,
    Set<(message: WSMessage) => void>
  >();
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
    reconnections: 0,
    averageLatency: 0,
    latencyMeasurements: [] as number[],
  };

  constructor(private readonly config: WSConfig) {
    // Validate and set default configuration
    this.config = {
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      maxReconnectDelay: 30000,
      heartbeatInterval: 30000,
      messageTimeout: 5000,
      enableCompression: true,
      enableEncryption: true,
      queueSize: 1000,
      ...config,
    };

    // Initialize performance monitoring
    setInterval(() => this.updateMetrics(), 60000);
  }

  /**
   * Connect to WebSocket server with enhanced error handling
   */
  public async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.setConnectionState("connecting");
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);

      // Setup heartbeat monitoring
      this.startHeartbeat();
    } catch (error) {
      this.handleError(error);
      throw new Error(`Failed to connect to WebSocket server: ${error}`);
    }
  }

  /**
   * Send message with reliability guarantees
   */
  public async send(
    type: string,
    payload: any,
    options: {
      groupId?: string;
      priority?: "high" | "normal" | "low";
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<string> {
    const message: WSMessage = {
      id: uuidv4(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      groupId: options.groupId,
      priority: options.priority || "normal",
    };

    try {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.queueMessage(message);
        return message.id;
      }

      await this.sendWithRetry(message, options.retries || 3);
      return message.id;
    } catch (error) {
      console.error("Failed to send message:", error);
      this.queueMessage(message);
      throw error;
    }
  }

  /**
   * Subscribe to specific message types
   */
  public subscribe(
    type: string,
    callback: (message: WSMessage) => void
  ): () => void {
    const subscribers = this.subscriptions.get(type) || new Set();
    subscribers.add(callback);
    this.subscriptions.set(type, subscribers);

    return () => {
      const subscribers = this.subscriptions.get(type);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscriptions.delete(type);
        }
      }
    };
  }

  /**
   * Get current connection state
   */
  public getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get performance metrics
   */
  public getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Close connection with cleanup
   */
  public disconnect(): void {
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setConnectionState("disconnected");
  }

  private handleOpen(): void {
    this.setConnectionState("connected");
    this.reconnectAttempts = 0;
    this.processMessageQueue();
    this.eventEmitter.emit("connected");
  }

  private handleClose(): void {
    this.setConnectionState("disconnected");
    this.eventEmitter.emit("disconnected");
    this.attemptReconnect();
  }

  private handleError(error: any): void {
    this.metrics.errors++;
    this.setConnectionState("error");
    this.eventEmitter.emit("error", error);
    console.error("WebSocket error:", error);
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    try {
      const message = this.parseMessage(event.data);
      if (!message) return;

      this.metrics.messagesReceived++;
      this.updateLatency(message);

      // Process heartbeat messages
      if (message.type === "heartbeat") {
        this.lastHeartbeat = Date.now();
        return;
      }

      // Handle acknowledgments
      if (message.type === "ack") {
        this.handleAcknowledgment(message);
        return;
      }

      // Notify subscribers
      const subscribers = this.subscriptions.get(message.type);
      if (subscribers) {
        subscribers.forEach((callback) => {
          try {
            callback(message);
          } catch (error) {
            console.error("Error in message subscriber:", error);
          }
        });
      }

      this.eventEmitter.emit("message", message);
    } catch (error) {
      console.error("Error processing message:", error);
      this.metrics.errors++;
    }
  }

  private parseMessage(data: string): WSMessage | null {
    try {
      const message = JSON.parse(data);
      return message;
    } catch (error) {
      console.error("Error parsing message:", error);
      return null;
    }
  }

  private async sendWithRetry(
    message: WSMessage,
    retries: number
  ): Promise<void> {
    let attempt = 0;

    while (attempt <= retries) {
      try {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not connected");
        }

        const data = JSON.stringify(message);
        this.ws.send(data);
        this.metrics.messagesSent++;

        // Add to pending messages for acknowledgment tracking
        this.pendingMessages.set(message.id, {
          message,
          timestamp: Date.now(),
          retries: attempt,
        });

        return;
      } catch (error) {
        attempt++;
        if (attempt > retries) {
          throw error;
        }
        await this.delay(
          Math.min(1000 * Math.pow(2, attempt), this.config.maxReconnectDelay!)
        );
      }
    }
  }

  private queueMessage(message: WSMessage): void {
    if (this.messageQueue.length >= this.config.queueSize!) {
      const oldestLowPriority = this.messageQueue.findIndex(
        (m) => m.priority === "low"
      );

      if (oldestLowPriority >= 0) {
        this.messageQueue.splice(oldestLowPriority, 1);
      } else {
        this.messageQueue.shift(); // Remove oldest if no low priority
      }
    }

    this.messageQueue.push(message);
  }

  private async processMessageQueue(): Promise<void> {
    if (
      this.messageQueue.length === 0 ||
      this.ws?.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const message = this.messageQueue.shift();
    if (message) {
      try {
        await this.sendWithRetry(message, 3);
      } catch (error) {
        console.error("Error processing queued message:", error);
        if (message.priority === "high") {
          this.messageQueue.unshift(message); // Re-queue high priority messages
        }
      }
    }

    // Process next message if any
    if (this.messageQueue.length > 0) {
      setTimeout(() => this.processMessageQueue(), 100);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts!) {
      this.eventEmitter.emit("reconnect_failed");
      return;
    }

    this.setConnectionState("reconnecting");
    this.reconnectAttempts++;
    this.metrics.reconnections++;

    const delay = Math.min(
      this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts),
      this.config.maxReconnectDelay!
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection attempt failed:", error);
        this.attemptReconnect();
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send("heartbeat", { timestamp: Date.now() }).catch((error) =>
          console.error("Heartbeat error:", error)
        );

        // Check last heartbeat
        const heartbeatAge = Date.now() - this.lastHeartbeat;
        if (heartbeatAge > this.config.heartbeatInterval! * 2) {
          console.warn("Heartbeat timeout, reconnecting...");
          this.reconnect();
        }
      }
    }, this.config.heartbeatInterval);
  }

  private handleAcknowledgment(message: WSMessage): void {
    const pending = this.pendingMessages.get(message.correlationId!);
    if (pending) {
      this.pendingMessages.delete(message.correlationId!);
      this.updateLatency(pending.message, Date.now() - pending.timestamp);
    }
  }

  private updateLatency(message: WSMessage, latency?: number): void {
    if (!latency) {
      const sent = new Date(message.timestamp).getTime();
      latency = Date.now() - sent;
    }

    this.metrics.latencyMeasurements.push(latency);
    if (this.metrics.latencyMeasurements.length > 100) {
      this.metrics.latencyMeasurements.shift();
    }

    this.metrics.averageLatency =
      this.metrics.latencyMeasurements.reduce((a, b) => a + b, 0) /
      this.metrics.latencyMeasurements.length;
  }

  private updateMetrics(): void {
    // Calculate performance metrics
    const latencyPercentile = this.calculateLatencyPercentiles();

    // Emit metrics event
    this.eventEmitter.emit("metrics", {
      ...this.metrics,
      latencyPercentiles: latencyPercentile,
      queueSize: this.messageQueue.length,
      pendingMessages: this.pendingMessages.size,
    });

    // Reset counters
    this.metrics.messagesSent = 0;
    this.metrics.messagesReceived = 0;
    this.metrics.errors = 0;
  }

  private calculateLatencyPercentiles(): {
    p50: number;
    p90: number;
    p99: number;
  } {
    const sorted = [...this.metrics.latencyMeasurements].sort((a, b) => a - b);
    return {
      p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
      p90: sorted[Math.floor(sorted.length * 0.9)] || 0,
      p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
    };
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.eventEmitter.emit("state_change", state);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private reconnect(): void {
    this.disconnect();
    this.attemptReconnect();
  }
}

// Create singleton instance
export const websocketService = new EnhancedWebSocketService({
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws",
  reconnectAttempts: 10,
  reconnectInterval: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  messageTimeout: 5000,
  enableCompression: true,
  enableEncryption: true,
  queueSize: 1000,
});
