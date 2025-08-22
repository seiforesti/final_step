/**
 * Enterprise Error Handling and Logging System
 * ==========================================
 *
 * Advanced error management with:
 * - Structured error logging
 * - Error categorization
 * - Error recovery strategies
 * - Performance monitoring
 * - Audit trails
 * - Error aggregation
 * - Alert system
 * - Error analytics
 */

import { EventEmitter } from "events";
import { websocketService } from "./websocket-service";

export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

export type ErrorContext = {
  timestamp: string;
  service: string;
  operation: string;
  userId?: string;
  groupId?: string;
  sessionId?: string;
  environment: string;
  component?: string;
  metadata: Record<string, any>;
};

export type ErrorRecord = {
  id: string;
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  stack?: string;
  handled: boolean;
  recoveryAttempts: number;
  resolved: boolean;
  resolutionTime?: string;
};

export type ErrorMetrics = {
  totalErrors: number;
  unresolvedErrors: number;
  errorsByService: Record<string, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  averageResolutionTime: number;
  recoveryRate: number;
};

export type ErrorSubscription = {
  id: string;
  filter: (error: ErrorRecord) => boolean;
  callback: (error: ErrorRecord) => void;
  options: {
    batchSize?: number;
    severityThreshold?: ErrorSeverity;
  };
};

export class EnterpriseErrorSystem {
  private readonly errors = new Map<string, ErrorRecord>();
  private readonly subscriptions = new Map<string, ErrorSubscription>();
  private readonly eventEmitter = new EventEmitter();
  private readonly recoveryStrategies = new Map<
    string,
    (error: ErrorRecord) => Promise<boolean>
  >();
  private readonly errorBatches = new Map<string, ErrorRecord[]>();
  private readonly batchTimers = new Map<string, NodeJS.Timeout>();
  private metricsInterval: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly severityLevels: Record<ErrorSeverity, number> = {
    fatal: 4,
    error: 3,
    warning: 2,
    info: 1,
  };

  constructor() {
    this.initializeSystem();
    this.startMetricsCollection();
  }

  /**
   * Handle and log an error
   */
  public async handleError(
    error: Error,
    severity: ErrorSeverity,
    context: Omit<ErrorContext, "timestamp">
  ): Promise<ErrorRecord> {
    const errorRecord: ErrorRecord = {
      id: crypto.randomUUID(),
      error,
      severity,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      stack: error.stack,
      handled: false,
      recoveryAttempts: 0,
      resolved: false,
    };

    this.errors.set(errorRecord.id, errorRecord);

    try {
      // Attempt recovery based on error type and context
      await this.attemptRecovery(errorRecord);

      // Notify subscribers
      this.notifySubscribers(errorRecord);

      // Send to remote logging if severe enough
      if (this.severityLevels[severity] >= this.severityLevels.error) {
        await this.logToRemote(errorRecord);
      }

      // Update metrics
      this.updateErrorMetrics(errorRecord);

      return errorRecord;
    } catch (handlingError) {
      console.error("Error while handling error:", handlingError);
      throw handlingError;
    }
  }

  /**
   * Subscribe to specific error types
   */
  public subscribe(
    filter: ErrorSubscription["filter"],
    callback: ErrorSubscription["callback"],
    options: ErrorSubscription["options"] = {}
  ): () => void {
    const subscription: ErrorSubscription = {
      id: crypto.randomUUID(),
      filter,
      callback,
      options,
    };

    this.subscriptions.set(subscription.id, subscription);

    if (subscription.options.batchSize) {
      this.errorBatches.set(subscription.id, []);
    }

    return () => {
      this.subscriptions.delete(subscription.id);
      this.errorBatches.delete(subscription.id);
      const timer = this.batchTimers.get(subscription.id);
      if (timer) {
        clearTimeout(timer);
        this.batchTimers.delete(subscription.id);
      }
    };
  }

  /**
   * Register a recovery strategy for specific error types
   */
  public registerRecoveryStrategy(
    errorType: string,
    strategy: (error: ErrorRecord) => Promise<boolean>
  ): void {
    this.recoveryStrategies.set(errorType, strategy);
  }

  /**
   * Get error metrics
   */
  public getMetrics(): ErrorMetrics {
    const metrics: ErrorMetrics = {
      totalErrors: this.errors.size,
      unresolvedErrors: Array.from(this.errors.values()).filter(
        (e) => !e.resolved
      ).length,
      errorsByService: {},
      errorsBySeverity: {
        fatal: 0,
        error: 0,
        warning: 0,
        info: 0,
      },
      averageResolutionTime: 0,
      recoveryRate: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    this.errors.forEach((error) => {
      // Count by service
      const service = error.context.service;
      metrics.errorsByService[service] =
        (metrics.errorsByService[service] || 0) + 1;

      // Count by severity
      metrics.errorsBySeverity[error.severity]++;

      // Calculate resolution metrics
      if (error.resolved && error.resolutionTime) {
        const resolutionTime =
          new Date(error.resolutionTime).getTime() -
          new Date(error.context.timestamp).getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    if (resolvedCount > 0) {
      metrics.averageResolutionTime = totalResolutionTime / resolvedCount;
      metrics.recoveryRate = (resolvedCount / this.errors.size) * 100;
    }

    return metrics;
  }

  /**
   * Get error history for analysis
   */
  public getErrorHistory(
    options: {
      startDate?: string;
      endDate?: string;
      severity?: ErrorSeverity[];
      service?: string[];
    } = {}
  ): ErrorRecord[] {
    return Array.from(this.errors.values())
      .filter((error) => {
        const timestamp = new Date(error.context.timestamp).getTime();
        const startTime = options.startDate
          ? new Date(options.startDate).getTime()
          : 0;
        const endTime = options.endDate
          ? new Date(options.endDate).getTime()
          : Infinity;

        return (
          timestamp >= startTime &&
          timestamp <= endTime &&
          (!options.severity || options.severity.includes(error.severity)) &&
          (!options.service || options.service.includes(error.context.service))
        );
      })
      .sort(
        (a, b) =>
          new Date(b.context.timestamp).getTime() -
          new Date(a.context.timestamp).getTime()
      );
  }

  private async attemptRecovery(errorRecord: ErrorRecord): Promise<void> {
    const strategy = this.recoveryStrategies.get(errorRecord.error.name);

    if (!strategy) {
      return;
    }

    while (
      errorRecord.recoveryAttempts < this.MAX_RETRIES &&
      !errorRecord.resolved
    ) {
      try {
        errorRecord.recoveryAttempts++;
        const success = await strategy(errorRecord);

        if (success) {
          errorRecord.resolved = true;
          errorRecord.resolutionTime = new Date().toISOString();
          break;
        }

        await this.delay(
          this.RETRY_DELAY * Math.pow(2, errorRecord.recoveryAttempts - 1)
        );
      } catch (recoveryError) {
        console.error("Recovery attempt failed:", recoveryError);
      }
    }
  }

  private notifySubscribers(errorRecord: ErrorRecord): void {
    this.subscriptions.forEach((subscription) => {
      if (!subscription.filter(errorRecord)) {
        return;
      }

      if (
        subscription.options.severityThreshold &&
        this.severityLevels[errorRecord.severity] <
          this.severityLevels[subscription.options.severityThreshold]
      ) {
        return;
      }

      if (subscription.options.batchSize) {
        this.addToBatch(subscription, errorRecord);
      } else {
        subscription.callback(errorRecord);
      }
    });
  }

  private addToBatch(
    subscription: ErrorSubscription,
    errorRecord: ErrorRecord
  ): void {
    const batch = this.errorBatches.get(subscription.id) || [];
    batch.push(errorRecord);

    if (batch.length >= (subscription.options.batchSize || 1)) {
      this.flushBatch(subscription.id);
    } else {
      // Set timer to flush batch if not full
      const existingTimer = this.batchTimers.get(subscription.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      this.batchTimers.set(
        subscription.id,
        setTimeout(() => this.flushBatch(subscription.id), 5000)
      );
    }
  }

  private flushBatch(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    const batch = this.errorBatches.get(subscriptionId);

    if (subscription && batch && batch.length > 0) {
      subscription.callback(batch[batch.length - 1]); // Send most recent error
      this.errorBatches.set(subscriptionId, []);
    }
  }

  private async logToRemote(errorRecord: ErrorRecord): Promise<void> {
    try {
      await websocketService.send("error-log", {
        type: "error-report",
        error: {
          message: errorRecord.error.message,
          name: errorRecord.error.name,
          severity: errorRecord.severity,
          context: errorRecord.context,
          stack: errorRecord.stack,
        },
      });
    } catch (error) {
      console.error("Failed to send error to remote logging:", error);
    }
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      const metrics = this.getMetrics();
      this.eventEmitter.emit("metrics", metrics);

      // Alert on high error rates
      if (metrics.unresolvedErrors > 10 || metrics.errorsBySeverity.fatal > 0) {
        this.triggerAlert(metrics);
      }
    }, 60000);
  }

  private async triggerAlert(metrics: ErrorMetrics): Promise<void> {
    try {
      await websocketService.send("error-alert", {
        type: "high-error-rate",
        metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to send error alert:", error);
    }
  }

  private initializeSystem(): void {
    // Register default recovery strategies
    this.registerRecoveryStrategy("NetworkError", async (error) => {
      // Implement network error recovery
      return false;
    });

    this.registerRecoveryStrategy("TimeoutError", async (error) => {
      // Implement timeout recovery
      return false;
    });

    // Clean up old errors periodically
    setInterval(() => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      this.errors.forEach((error, id) => {
        if (new Date(error.context.timestamp) < thirtyDaysAgo) {
          this.errors.delete(id);
        }
      });
    }, 24 * 60 * 60 * 1000);
  }

  private updateErrorMetrics(errorRecord: ErrorRecord): void {
    this.eventEmitter.emit("error-recorded", errorRecord);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const errorSystem = new EnterpriseErrorSystem();
