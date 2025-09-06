/**
 * Circuit Breaker Pattern Implementation
 * =====================================
 * 
 * Prevents cascading failures by monitoring API call success rates
 * and temporarily blocking requests when failure threshold is reached.
 */

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Blocking requests due to failures
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  recoveryTimeout: number;     // Time to wait before trying again (ms)
  monitoringWindow: number;    // Time window for failure tracking (ms)
  requestVolumeThreshold: number; // Minimum requests before checking failure rate
}

export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  requestCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 10,          // Open after 10 failures (less aggressive)
  recoveryTimeout: 10000,        // Wait 10 seconds before retry (shorter)
  monitoringWindow: 30000,       // 30 second monitoring window (shorter)
  requestVolumeThreshold: 5      // Need at least 5 requests to check failure rate
};

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private requestCount = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;
  private failures: number[] = []; // Track failure timestamps

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker is OPEN. Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`);
      }
      this.state = CircuitBreakerState.HALF_OPEN;
    }

    this.requestCount++;
    this.cleanOldFailures();

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.successCount++;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.failures.push(this.lastFailureTime);

    if (this.shouldOpen()) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
    }
  }

  /**
   * Check if circuit breaker should open
   */
  private shouldOpen(): boolean {
    // Need minimum request volume
    if (this.requestCount < this.config.requestVolumeThreshold) {
      return false;
    }

    // Check failure rate in monitoring window
    const recentFailures = this.failures.filter(
      timestamp => Date.now() - timestamp <= this.config.monitoringWindow
    );

    return recentFailures.length >= this.config.failureThreshold;
  }

  /**
   * Remove old failure timestamps outside monitoring window
   */
  private cleanOldFailures(): void {
    const cutoff = Date.now() - this.config.monitoringWindow;
    this.failures = this.failures.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      requestCount: this.requestCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.requestCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
    this.failures = [];
  }

  /**
   * Check if circuit breaker is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitBreakerState.CLOSED;
  }
}

/**
 * Global circuit breaker instances for different API services
 */
export const circuitBreakers = {
  userManagement: new CircuitBreaker({
    failureThreshold: 8,          // Less aggressive
    recoveryTimeout: 15000,       // 15 seconds recovery
    monitoringWindow: 45000       // 45 second window
  }),
  
  orchestration: new CircuitBreaker({
    failureThreshold: 8,          // Less aggressive
    recoveryTimeout: 15000,       // 15 seconds recovery
    monitoringWindow: 45000       // 45 second window
  }),
  
  aiAssistant: new CircuitBreaker({
    failureThreshold: 5,          // Less aggressive
    recoveryTimeout: 20000,       // 20 seconds recovery
    monitoringWindow: 60000       // 1 minute window
  }),
  
  quickActions: new CircuitBreaker({
    failureThreshold: 8,          // Less aggressive
    recoveryTimeout: 15000,       // 15 seconds recovery
    monitoringWindow: 45000       // 45 second window
  })
};

/**
 * Decorator function to wrap API calls with circuit breaker
 */
export function withCircuitBreaker<T extends any[], R>(
  circuitBreaker: CircuitBreaker,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    return circuitBreaker.execute(() => fn(...args));
  };
}
