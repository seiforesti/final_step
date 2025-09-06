// A shared WebSocket manager with exponential backoff, single connection per key,
// ref-counted subscriptions, and simple message fan-out.

type MessageHandler = (data: any) => void;

interface ConnectionEntry {
  url: string;
  ws: WebSocket | null;
  subscribers: Set<MessageHandler>;
  isConnecting: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number; // Circuit breaker limit
  backoffBaseMs: number;
  maxBackoffMs: number;
  lastCloseCode?: number;
  heartbeatTimerId?: number;
  circuitBreakerOpen: boolean; // Circuit breaker state
  lastFailureTime: number; // For circuit breaker timeout
}

class WebSocketManager {
  private static singleton: WebSocketManager | null = null;
  private connections: Map<string, ConnectionEntry> = new Map();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.singleton) {
      WebSocketManager.singleton = new WebSocketManager();
    }
    return WebSocketManager.singleton;
  }

  private constructor() {}
  
  // Ensure we gracefully close all sockets on page unload to avoid abrupt disconnects
  private ensureUnloadHandler(): void {
    if (typeof window === 'undefined') return;
    const handler = () => {
      for (const entry of this.connections.values()) {
        try {
          if (entry.ws && entry.ws.readyState === WebSocket.OPEN) {
            entry.ws.close(1000, 'Page unload');
          }
        } catch {}
      }
    };
    // Register once
    // @ts-ignore - attach only once by stamping a symbol on window
    if (!window.__RACINE_WS_UNLOAD_BOUND__) {
      window.addEventListener('beforeunload', handler);
      // @ts-ignore
      window.__RACINE_WS_UNLOAD_BOUND__ = true;
    }
  }

  private getKey(url: string): string {
    return url;
  }

  subscribe(url: string, handler: MessageHandler): () => void {
    this.ensureUnloadHandler();
    const key = this.getKey(url);
    let entry = this.connections.get(key);
    if (!entry) {
      entry = {
        url,
        ws: null,
        subscribers: new Set(),
        isConnecting: false,
        reconnectAttempts: 0,
        maxReconnectAttempts: 3, // Circuit breaker limit
        backoffBaseMs: 1000,
        maxBackoffMs: 30000,
        circuitBreakerOpen: false,
        lastFailureTime: 0,
      };
      this.connections.set(key, entry);
    }

    entry.subscribers.add(handler);
    if (!entry.ws && !entry.isConnecting) {
      this.open(entry);
    }

    return () => {
      this.unsubscribe(url, handler);
    };
  }

  send(url: string, payload: any): void {
    const entry = this.connections.get(this.getKey(url));
    if (entry?.ws && entry.ws.readyState === WebSocket.OPEN) {
      entry.ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }
  }

  private open(entry: ConnectionEntry): void {
    if (typeof window === 'undefined') return;
    if (entry.isConnecting) return;
    
    // Circuit breaker check
    if (entry.circuitBreakerOpen) {
      const now = Date.now();
      const circuitBreakerTimeout = 60000; // 1 minute timeout
      
      if (now - entry.lastFailureTime < circuitBreakerTimeout) {
        console.warn(`WebSocket circuit breaker is OPEN for ${entry.url}. Blocking connection attempt.`);
        return;
      } else {
        // Reset circuit breaker after timeout
        console.log(`WebSocket circuit breaker timeout expired for ${entry.url}. Attempting to reconnect.`);
        entry.circuitBreakerOpen = false;
        entry.reconnectAttempts = 0;
      }
    }

    entry.isConnecting = true;
    try {
      const ws = new WebSocket(entry.url);
      entry.ws = ws;

      ws.onopen = () => {
        entry.isConnecting = false;
        entry.reconnectAttempts = 0;
        // Start heartbeat to keep the connection alive and inform backend
        if (entry.heartbeatTimerId) {
          window.clearInterval(entry.heartbeatTimerId);
        }
        entry.heartbeatTimerId = window.setInterval(() => {
          try {
            if (entry.ws && entry.ws.readyState === WebSocket.OPEN) {
              entry.ws.send(JSON.stringify({ type: 'heartbeat', ts: Date.now() }));
            }
          } catch {}
        }, 20000);
      };

      ws.onmessage = (event) => {
        let data: any = event.data;
        try {
          data = JSON.parse(event.data);
        } catch (_) {
          // keep raw if not JSON
        }
        for (const sub of entry.subscribers) {
          try { sub(data); } catch (e) { /* ignore subscriber errors */ }
        }
      };

      ws.onclose = (ev) => {
        entry.lastCloseCode = ev.code;
        entry.ws = null;
        entry.isConnecting = false;
        if (entry.heartbeatTimerId) {
          window.clearInterval(entry.heartbeatTimerId);
          entry.heartbeatTimerId = undefined;
        }
        if (entry.subscribers.size > 0) {
          this.scheduleReconnect(entry);
        }
      };

      ws.onerror = () => {
        // Error will be followed by close in most browsers; let backoff handle it
      };
    } catch (_) {
      entry.isConnecting = false;
      this.scheduleReconnect(entry);
    }
  }

  private scheduleReconnect(entry: ConnectionEntry): void {
    entry.reconnectAttempts += 1;
    entry.lastFailureTime = Date.now();
    
    // Circuit breaker: Stop reconnecting after max attempts
    if (entry.reconnectAttempts >= entry.maxReconnectAttempts) {
      console.warn(`WebSocket circuit breaker OPENED for ${entry.url} after ${entry.reconnectAttempts} failed attempts`);
      entry.circuitBreakerOpen = true;
      return;
    }
    
    const delay = Math.min(
      entry.maxBackoffMs,
      entry.backoffBaseMs * Math.pow(2, entry.reconnectAttempts)
    );
    
    console.log(`WebSocket reconnection attempt ${entry.reconnectAttempts}/${entry.maxReconnectAttempts} for ${entry.url} in ${delay}ms`);
    
    setTimeout(() => {
      if (entry.subscribers.size > 0 && !entry.ws && !entry.circuitBreakerOpen) {
        this.open(entry);
      }
    }, delay);
  }

  unsubscribe(url: string, handler: MessageHandler): void {
    const key = this.getKey(url);
    const entry = this.connections.get(key);
    if (!entry) return;
    entry.subscribers.delete(handler);
    if (entry.subscribers.size === 0) {
      if (entry.ws && entry.ws.readyState === WebSocket.OPEN) {
        entry.ws.close(1000, 'Normal Closure');
      }
      entry.ws = null;
      this.connections.delete(key);
    }
  }
}

export const globalWebSocketManager = WebSocketManager.getInstance();
export type { MessageHandler };


