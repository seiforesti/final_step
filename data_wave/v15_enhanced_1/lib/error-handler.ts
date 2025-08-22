/**
 * ⚠️ ERROR HANDLER - ADVANCED ERROR MANAGEMENT
 * =======================================
 *
 * Enterprise-grade error handling with:
 * - Structured error classification
 * - Retry policy management
 * - Error reporting and analytics
 * - Group-specific error handling
 */

export interface ErrorHandlingConfig {
  retryableStatuses: number[];
  maxRetries: number;
  retryStrategy: "linear" | "exponential" | "custom";
  errorCallback?: (error: APIError) => void;
}

export interface APIError extends Error {
  code: string;
  status?: number;
  retryable: boolean;
  context?: Record<string, any>;
  timestamp: number;
  group?: string;
}

export class ErrorHandler {
  private readonly config: ErrorHandlingConfig;
  private groupConfigs: Map<string, ErrorHandlingConfig>;
  private errorLog: APIError[];
  private errorCallbacks: Set<(error: APIError) => void>;

  constructor(config: ErrorHandlingConfig) {
    this.config = config;
    this.groupConfigs = new Map();
    this.errorLog = [];
    this.errorCallbacks = new Set();

    if (config.errorCallback) {
      this.errorCallbacks.add(config.errorCallback);
    }
  }

  public setGroupConfig(
    group: string,
    config: Partial<ErrorHandlingConfig>
  ): void {
    const existingConfig = this.groupConfigs.get(group) || this.config;
    this.groupConfigs.set(group, { ...existingConfig, ...config });
  }

  public addErrorCallback(callback: (error: APIError) => void): void {
    this.errorCallbacks.add(callback);
  }

  public removeErrorCallback(callback: (error: APIError) => void): void {
    this.errorCallbacks.delete(callback);
  }

  public handleError(error: any, group?: string): APIError {
    const apiError = this.normalizeError(error, group);
    this.logError(apiError);
    this.notifyCallbacks(apiError);
    return apiError;
  }

  private normalizeError(error: any, group?: string): APIError {
    const apiError: APIError = {
      name: error.name || "Error",
      message: error.message || "An unknown error occurred",
      code: error.code || "UNKNOWN_ERROR",
      status: error.status || error.statusCode,
      retryable: this.isRetryable(error, group),
      stack: error.stack,
      context: {
        ...error.context,
        originalError: error,
      },
      timestamp: Date.now(),
      group,
    };

    return apiError;
  }

  private isRetryable(error: any, group?: string): boolean {
    const config = group
      ? this.groupConfigs.get(group) || this.config
      : this.config;

    // Check if status code is in retryable list
    if (error.status || error.statusCode) {
      return config.retryableStatuses.includes(
        error.status || error.statusCode
      );
    }

    // Network errors are typically retryable
    if (
      error.code === "ECONNABORTED" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT"
    ) {
      return true;
    }

    return false;
  }

  public calculateRetryDelay(attempt: number, group?: string): number {
    const config = group
      ? this.groupConfigs.get(group) || this.config
      : this.config;

    switch (config.retryStrategy) {
      case "linear":
        return attempt * 1000; // 1s, 2s, 3s...

      case "exponential":
        return Math.min(Math.pow(2, attempt) * 1000, 30000); // 1s, 2s, 4s, 8s... max 30s

      case "custom":
        return this.customRetryStrategy(attempt, group);

      default:
        return 1000; // Default 1s delay
    }
  }

  private customRetryStrategy(attempt: number, group?: string): number {
    // Implement custom retry strategy here
    // This is a placeholder implementation
    return Math.min(Math.pow(1.5, attempt) * 1000, 15000);
  }

  private logError(error: APIError): void {
    this.errorLog.push(error);

    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", {
        code: error.code,
        message: error.message,
        status: error.status,
        group: error.group,
        context: error.context,
        stack: error.stack,
      });
    }
  }

  private notifyCallbacks(error: APIError): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error("Error in error callback:", callbackError);
      }
    });
  }

  public getErrorLog(group?: string, limit?: number): APIError[] {
    let errors = this.errorLog;

    if (group) {
      errors = errors.filter((error) => error.group === group);
    }

    if (limit) {
      errors = errors.slice(-limit);
    }

    return errors;
  }

  public getErrorStats(group?: string): ErrorStats {
    const relevantErrors = group
      ? this.errorLog.filter((error) => error.group === group)
      : this.errorLog;

    const stats: ErrorStats = {
      total: relevantErrors.length,
      byCode: new Map(),
      byStatus: new Map(),
      retryable: 0,
      nonRetryable: 0,
    };

    relevantErrors.forEach((error) => {
      // Count by error code
      const codeCount = stats.byCode.get(error.code) || 0;
      stats.byCode.set(error.code, codeCount + 1);

      // Count by status code if present
      if (error.status) {
        const statusCount = stats.byStatus.get(error.status) || 0;
        stats.byStatus.set(error.status, statusCount + 1);
      }

      // Count retryable vs non-retryable
      if (error.retryable) {
        stats.retryable++;
      } else {
        stats.nonRetryable++;
      }
    });

    return stats;
  }

  public clearErrorLog(group?: string): void {
    if (group) {
      this.errorLog = this.errorLog.filter((error) => error.group !== group);
    } else {
      this.errorLog = [];
    }
  }
}

interface ErrorStats {
  total: number;
  byCode: Map<string, number>;
  byStatus: Map<number, number>;
  retryable: number;
  nonRetryable: number;
}
