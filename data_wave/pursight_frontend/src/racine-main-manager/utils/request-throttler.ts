/**
 * Request Throttling Utility
 * ==========================
 * 
 * Prevents excessive API calls by implementing rate limiting and request queuing.
 */

export interface ThrottleConfig {
  maxRequests: number;        // Maximum requests per window
  windowMs: number;          // Time window in milliseconds
  queueSize: number;         // Maximum queue size
  retryDelay: number;        // Delay between retries
}

export interface ThrottleStats {
  requestsInWindow: number;
  queueSize: number;
  lastRequestTime: number;
  isThrottled: boolean;
}

const DEFAULT_CONFIG: ThrottleConfig = {
  maxRequests: 50,           // 50 requests per window (much more permissive)
  windowMs: 30000,          // 30 second window (shorter window)
  queueSize: 200,           // Max 200 queued requests (much larger queue)
  retryDelay: 200           // 200ms delay (faster retry)
};

export class RequestThrottler {
  private config: ThrottleConfig;
  private requests: number[] = []; // Track request timestamps
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  constructor(config: Partial<ThrottleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Throttle a request
   */
  async throttle<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.canMakeRequest()) {
        this.recordRequest();
        executeRequest();
      } else {
        // If queue is getting full, try to process it more aggressively
        if (this.queue.length >= this.config.queueSize * 0.8) {
          this.processQueue();
        }
        
        if (this.queue.length >= this.config.queueSize) {
          // Instead of rejecting immediately, try to process queue once more
          this.processQueue();
          if (this.queue.length >= this.config.queueSize) {
            reject(new Error('Request queue is full. Please try again later.'));
            return;
          }
        }
        
        this.queue.push(executeRequest);
        this.processQueue();
      }
    });
  }

  /**
   * Check if a request can be made
   */
  private canMakeRequest(): boolean {
    this.cleanOldRequests();
    return this.requests.length < this.config.maxRequests;
  }

  /**
   * Record a request timestamp
   */
  private recordRequest(): void {
    this.requests.push(Date.now());
  }

  /**
   * Remove old requests outside the window
   */
  private cleanOldRequests(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      if (this.canMakeRequest()) {
        const request = this.queue.shift();
        if (request) {
          this.recordRequest();
          // Execute request without awaiting to process queue faster
          request().catch(error => {
            console.error('Throttled request failed:', error);
          });
        }
      } else {
        // Wait before trying again, but shorter delay
        await this.delay(Math.min(this.config.retryDelay, 100));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get throttling statistics
   */
  getStats(): ThrottleStats {
    this.cleanOldRequests();
    return {
      requestsInWindow: this.requests.length,
      queueSize: this.queue.length,
      lastRequestTime: this.requests[this.requests.length - 1] || 0,
      isThrottled: this.requests.length >= this.config.maxRequests
    };
  }

  /**
   * Reset throttler
   */
  reset(): void {
    this.requests = [];
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Clear queue when it gets too full (for hot reloads)
   */
  clearQueue(): void {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { length: number; isFull: boolean; isProcessing: boolean } {
    return {
      length: this.queue.length,
      isFull: this.queue.length >= this.config.queueSize,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global throttler instances for different API services
 */
export const requestThrottlers = {
  userManagement: new RequestThrottler({
    maxRequests: 60,         // Much more permissive for initial load
    windowMs: 30000,         // 30 second window
    queueSize: 200           // Much larger queue to prevent early saturation
  }),
  
  orchestration: new RequestThrottler({
    maxRequests: 40,         // Much more permissive
    windowMs: 30000,         // 30 second window
    queueSize: 150           // Much larger queue
  }),
  
  aiAssistant: new RequestThrottler({
    maxRequests: 20,         // More permissive
    windowMs: 30000,         // 30 second window
    queueSize: 60            // Larger queue
  }),
  
  quickActions: new RequestThrottler({
    maxRequests: 50,         // Much more permissive
    windowMs: 30000,         // 30 second window
    queueSize: 100           // Much larger queue
  })
};

/**
 * Decorator function to wrap API calls with throttling
 */
export function withThrottling<T extends any[], R>(
  throttler: RequestThrottler,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    return throttler.throttle(() => fn(...args));
  };
}

/**
 * Global queue management for hot reloads and emergency situations
 */
export function clearAllThrottlerQueues(): void {
  Object.values(requestThrottlers).forEach(throttler => {
    throttler.clearQueue();
  });
}

/**
 * Get global throttler status
 */
export function getGlobalThrottlerStatus(): Record<string, any> {
  const status: Record<string, any> = {};
  Object.entries(requestThrottlers).forEach(([name, throttler]) => {
    status[name] = {
      ...throttler.getStats(),
      queueStatus: throttler.getQueueStatus()
    };
  });
  return status;
}

// Clear queues on hot reload (if in development)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Listen for hot reload events
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('Request queue is full')) {
      console.warn('Clearing throttler queues due to hot reload...');
      clearAllThrottlerQueues();
    }
    originalConsoleError.apply(console, args);
  };
}
