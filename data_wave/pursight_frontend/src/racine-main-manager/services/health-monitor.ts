/**
 * Health Monitoring Service
 * ========================
 * 
 * Prevents excessive health checks and provides intelligent backend health monitoring
 * with exponential backoff and circuit breaker patterns.
 */

export interface HealthStatus {
  isHealthy: boolean;
  lastCheck: number;
  consecutiveFailures: number;
  nextCheckTime: number;
  responseTime?: number;
}

export interface HealthMonitorConfig {
  checkInterval: number;        // Base interval between checks (ms)
  maxInterval: number;          // Maximum interval between checks (ms)
  failureThreshold: number;     // Failures before increasing interval
  successThreshold: number;     // Successes before resetting interval
  timeout: number;              // Request timeout (ms)
  enableExponentialBackoff: boolean;
}

const DEFAULT_CONFIG: HealthMonitorConfig = {
  checkInterval: 30000,         // 30 seconds base interval
  maxInterval: 300000,          // 5 minutes max interval
  failureThreshold: 3,          // 3 failures before backoff
  successThreshold: 2,          // 2 successes to reset
  timeout: 5000,                // 5 second timeout
  enableExponentialBackoff: true
};

export class HealthMonitor {
  private config: HealthMonitorConfig;
  private status: HealthStatus = {
    isHealthy: true,
    lastCheck: 0,
    consecutiveFailures: 0,
    nextCheckTime: 0
  };
  private checkTimer: NodeJS.Timeout | null = null;
  private isChecking = false;
  private listeners: Array<(status: HealthStatus) => void> = [];

  constructor(config: Partial<HealthMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start health monitoring
   */
  start(baseURL: string): void {
    if (this.checkTimer) {
      this.stop();
    }

    this.scheduleNextCheck(baseURL);
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * Get current health status
   */
  getStatus(): HealthStatus {
    return { ...this.status };
  }

  /**
   * Check if backend is healthy
   */
  isBackendHealthy(): boolean {
    return this.status.isHealthy && 
           (Date.now() - this.status.lastCheck) < this.getCurrentInterval();
  }

  /**
   * Add health status listener
   */
  addListener(listener: (status: HealthStatus) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove health status listener
   */
  removeListener(listener: (status: HealthStatus) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Schedule next health check
   */
  private scheduleNextCheck(baseURL: string): void {
    const interval = this.getCurrentInterval();
    this.status.nextCheckTime = Date.now() + interval;

    this.checkTimer = setTimeout(() => {
      this.performHealthCheck(baseURL);
    }, interval);
  }

  /**
   * Perform actual health check
   */
  private async performHealthCheck(baseURL: string): Promise<void> {
    if (this.isChecking) {
      return;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.onHealthCheckSuccess(responseTime);
      } else {
        this.onHealthCheckFailure();
      }
    } catch (error) {
      this.onHealthCheckFailure();
    } finally {
      this.isChecking = false;
      this.scheduleNextCheck(baseURL);
    }
  }

  /**
   * Handle successful health check
   */
  private onHealthCheckSuccess(responseTime: number): void {
    const wasUnhealthy = !this.status.isHealthy;
    
    this.status.isHealthy = true;
    this.status.lastCheck = Date.now();
    this.status.responseTime = responseTime;
    
    if (wasUnhealthy) {
      this.status.consecutiveFailures = 0;
    } else if (this.status.consecutiveFailures > 0) {
      this.status.consecutiveFailures = Math.max(0, this.status.consecutiveFailures - 1);
    }

    this.notifyListeners();
  }

  /**
   * Handle failed health check
   */
  private onHealthCheckFailure(): void {
    this.status.isHealthy = false;
    this.status.lastCheck = Date.now();
    this.status.consecutiveFailures++;
    this.status.responseTime = undefined;

    this.notifyListeners();
  }

  /**
   * Get current check interval based on failure count
   */
  private getCurrentInterval(): number {
    if (!this.config.enableExponentialBackoff) {
      return this.config.checkInterval;
    }

    const backoffMultiplier = Math.min(
      Math.pow(2, Math.floor(this.status.consecutiveFailures / this.config.failureThreshold)),
      this.config.maxInterval / this.config.checkInterval
    );

    return Math.min(
      this.config.checkInterval * backoffMultiplier,
      this.config.maxInterval
    );
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus());
      } catch (error) {
        console.error('Health monitor listener error:', error);
      }
    });
  }

  /**
   * Force immediate health check
   */
  async forceCheck(baseURL: string): Promise<boolean> {
    if (this.isChecking) {
      return this.status.isHealthy;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.onHealthCheckSuccess(responseTime);
        return true;
      } else {
        this.onHealthCheckFailure();
        return false;
      }
    } catch (error) {
      this.onHealthCheckFailure();
      return false;
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Reset health monitor to initial state
   */
  reset(): void {
    this.stop();
    this.status = {
      isHealthy: true,
      lastCheck: 0,
      consecutiveFailures: 0,
      nextCheckTime: 0
    };
    this.isChecking = false;
  }
}

/**
 * Global health monitor instance
 */
export const globalHealthMonitor = new HealthMonitor({
  checkInterval: 60000,         // 1 minute base interval
  maxInterval: 600000,          // 10 minutes max interval
  failureThreshold: 2,          // 2 failures before backoff
  successThreshold: 1,          // 1 success to reset
  timeout: 3000,                // 3 second timeout
  enableExponentialBackoff: true
});
