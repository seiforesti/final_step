/**
 * 📊 METRICS COLLECTOR - ADVANCED PERFORMANCE MONITORING
 * ================================================
 *
 * Enterprise-grade metrics collection with:
 * - Request timing and performance metrics
 * - Error rate tracking
 * - Circuit breaker state monitoring
 * - Queue size and latency tracking
 * - Group-specific metrics
 */

export interface MetricsConfig {
  enabled: boolean;
  sampleRate: number;
  customMetrics?: string[];
  retentionPeriod?: number;
}

export interface RequestMetrics {
  requestId: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: string;
  group?: string;
  circuitBreakerState?: string;
  queueTime?: number;
  retryCount?: number;
}

export interface GroupMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalLatency: number;
  maxLatency: number;
  minLatency: number;
  circuitBreakerTrips: number;
  queueSize: number;
  activeRequests: number;
}

export class MetricsCollector {
  private metrics: Map<string, RequestMetrics[]>;
  private groupMetrics: Map<string, GroupMetrics>;
  private readonly config: MetricsConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: MetricsConfig) {
    this.config = {
      ...config,
      retentionPeriod: config.retentionPeriod || 24 * 60 * 60 * 1000, // 24 hours default
    };
    this.metrics = new Map();
    this.groupMetrics = new Map();

    if (this.config.enabled) {
      this.startCleanup();
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Cleanup every hour
  }

  private cleanup(): void {
    const cutoff = Date.now() - (this.config.retentionPeriod || 0);

    // Cleanup request metrics
    this.metrics.forEach((requests, key) => {
      const filtered = requests.filter((r) => r.startTime >= cutoff);
      if (filtered.length === 0) {
        this.metrics.delete(key);
      } else {
        this.metrics.set(key, filtered);
      }
    });

    // Reset group metrics older than retention period
    this.groupMetrics.forEach((metrics, group) => {
      this.groupMetrics.set(group, this.initializeGroupMetrics());
    });
  }

  private initializeGroupMetrics(): GroupMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalLatency: 0,
      maxLatency: 0,
      minLatency: Number.MAX_VALUE,
      circuitBreakerTrips: 0,
      queueSize: 0,
      activeRequests: 0,
    };
  }

  public startRequest(
    requestId: string,
    url: string,
    method: string,
    group?: string
  ): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    const metrics: RequestMetrics = {
      requestId,
      url,
      method,
      startTime: Date.now(),
      group,
    };

    if (!this.metrics.has(requestId)) {
      this.metrics.set(requestId, []);
    }
    this.metrics.get(requestId)!.push(metrics);

    // Update group metrics
    if (group) {
      if (!this.groupMetrics.has(group)) {
        this.groupMetrics.set(group, this.initializeGroupMetrics());
      }
      const groupMetric = this.groupMetrics.get(group)!;
      groupMetric.totalRequests++;
      groupMetric.activeRequests++;
    }
  }

  public endRequest(requestId: string, status?: number, error?: string): void {
    if (!this.config.enabled) {
      return;
    }

    const requests = this.metrics.get(requestId);
    if (!requests || requests.length === 0) {
      return;
    }

    const currentRequest = requests[requests.length - 1];
    currentRequest.endTime = Date.now();
    currentRequest.duration = currentRequest.endTime - currentRequest.startTime;
    currentRequest.status = status;
    currentRequest.error = error;

    // Update group metrics
    if (currentRequest.group) {
      const groupMetric = this.groupMetrics.get(currentRequest.group);
      if (groupMetric) {
        groupMetric.activeRequests--;
        if (status && status < 400) {
          groupMetric.successfulRequests++;
        } else {
          groupMetric.failedRequests++;
        }
        if (currentRequest.duration) {
          groupMetric.totalLatency += currentRequest.duration;
          groupMetric.maxLatency = Math.max(
            groupMetric.maxLatency,
            currentRequest.duration
          );
          groupMetric.minLatency = Math.min(
            groupMetric.minLatency,
            currentRequest.duration
          );
        }
      }
    }
  }

  public recordCircuitBreakerTrip(group?: string): void {
    if (!this.config.enabled) {
      return;
    }

    if (group && this.groupMetrics.has(group)) {
      this.groupMetrics.get(group)!.circuitBreakerTrips++;
    }
  }

  public updateQueueSize(size: number, group?: string): void {
    if (!this.config.enabled) {
      return;
    }

    if (group && this.groupMetrics.has(group)) {
      this.groupMetrics.get(group)!.queueSize = size;
    }
  }

  public getMetrics(
    group?: string,
    startTime?: number,
    endTime?: number
  ): RequestMetrics[] {
    if (!this.config.enabled) {
      return [];
    }

    const allMetrics: RequestMetrics[] = [];
    this.metrics.forEach((requests) => {
      requests.forEach((request) => {
        if (
          (!group || request.group === group) &&
          (!startTime || request.startTime >= startTime) &&
          (!endTime || request.startTime <= endTime)
        ) {
          allMetrics.push(request);
        }
      });
    });

    return allMetrics;
  }

  public getGroupMetrics(group?: string): GroupMetrics | null {
    if (!this.config.enabled) {
      return null;
    }

    if (group) {
      return this.groupMetrics.get(group) || null;
    }

    // Aggregate metrics across all groups
    const aggregate = this.initializeGroupMetrics();
    this.groupMetrics.forEach((metrics) => {
      aggregate.totalRequests += metrics.totalRequests;
      aggregate.successfulRequests += metrics.successfulRequests;
      aggregate.failedRequests += metrics.failedRequests;
      aggregate.totalLatency += metrics.totalLatency;
      aggregate.maxLatency = Math.max(aggregate.maxLatency, metrics.maxLatency);
      aggregate.minLatency = Math.min(aggregate.minLatency, metrics.minLatency);
      aggregate.circuitBreakerTrips += metrics.circuitBreakerTrips;
      aggregate.queueSize += metrics.queueSize;
      aggregate.activeRequests += metrics.activeRequests;
    });

    return aggregate;
  }

  public getErrorRate(group?: string): number {
    const metrics = this.getGroupMetrics(group);
    if (!metrics || metrics.totalRequests === 0) {
      return 0;
    }
    return metrics.failedRequests / metrics.totalRequests;
  }

  public getAverageLatency(group?: string): number {
    const metrics = this.getGroupMetrics(group);
    if (!metrics || metrics.successfulRequests === 0) {
      return 0;
    }
    return metrics.totalLatency / metrics.successfulRequests;
  }

  public dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
