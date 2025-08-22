/**
 * 🔌 CIRCUIT BREAKER - ADVANCED FAULT TOLERANCE
 * =========================================
 *
 * Enterprise-grade circuit breaker with:
 * - State machine implementation
 * - Half-open state retry mechanism
 * - Group-specific circuit breaking
 * - Health monitoring and metrics
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitorInterval?: number;
  groupSpecific?: boolean;
}

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

interface CircuitHealthSnapshot {
  state: CircuitState;
  metrics: CircuitMetrics;
  healthScore: number;
  lastStateChange: number;
  predictionData: CircuitPredictionData;
}

interface CircuitMetrics {
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  totalRequests: number;
  errorRate: number;
  latency: {
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    current: number;
    avg: number;
    peak: number;
  };
}

interface CircuitPredictionData {
  predictedFailureRate: number;
  predictedLatency: number;
  reliabilityScore: number;
  nextStateChangePrediction: {
    state: CircuitState;
    confidence: number;
    estimatedTime: number;
  };
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private readonly config: CircuitBreakerConfig;
  private readonly metrics: Map<string, CircuitMetrics> = new Map();
  private readonly groupStates: Map<string, CircuitState> = new Map();
  private readonly latencyWindow: number[] = [];
  private readonly healthSnapshots: CircuitHealthSnapshot[] = [];
  private monitorInterval?: NodeJS.Timeout;
  private lastStateChangeTime: number = Date.now();

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold,
      resetTimeout: config.resetTimeout,
      monitorInterval: config.monitorInterval || 5000,
      groupSpecific: config.groupSpecific || false,
    };

    if (this.config.monitorInterval) {
      this.startMonitoring();
    }
  }

  private startMonitoring(): void {
    this.monitorInterval = setInterval(() => {
      this.checkCircuitHealth();
    }, this.config.monitorInterval);
  }

  private checkCircuitHealth(): void {
    const now = Date.now();

    // Check global circuit
    if (
      this.state === CircuitState.OPEN &&
      now - this.lastFailureTime >= this.config.resetTimeout
    ) {
      this.state = CircuitState.HALF_OPEN;
    }

    // Check group circuits
    if (this.config.groupSpecific) {
      this.groupStates.forEach((state, group) => {
        const metrics = this.metrics.get(group);
        if (
          metrics &&
          state === CircuitState.OPEN &&
          metrics.lastFailure &&
          now - metrics.lastFailure >= this.config.resetTimeout
        ) {
          this.groupStates.set(group, CircuitState.HALF_OPEN);
        }
      });
    }
  }

  public async execute<T>(
    command: () => Promise<T>,
    group?: string
  ): Promise<T> {
    if (this.isOpen(group)) {
      const message = group
        ? `Circuit is OPEN for group: ${group}`
        : "Circuit is OPEN";
      throw new Error(message);
    }

    const startTime = Date.now();
    const metrics = group
      ? this.getOrCreateMetrics(group)
      : this.getDefaultMetrics();

    try {
      const result = await command();
      const latency = Date.now() - startTime;

      this.updateLatencyMetrics(latency, metrics);
      this.recordSuccess(group);
      this.updateMetrics(metrics, true, latency);
      this.updateHealthSnapshot(group);

      return result;
    } catch (error) {
      const latency = Date.now() - startTime;

      this.updateLatencyMetrics(latency, metrics);
      this.recordFailure(group);
      this.updateMetrics(metrics, false, latency);
      this.updateHealthSnapshot(group);

      throw error;
    }
  }

  private getDefaultMetrics(): CircuitMetrics {
    return {
      failures: this.failures,
      successes: 0,
      lastFailure: this.lastFailureTime || null,
      lastSuccess: null,
      totalRequests: this.failures,
      errorRate: this.failures > 0 ? 1 : 0,
      latency: {
        avg: 0,
        p95: 0,
        p99: 0,
      },
      throughput: {
        current: 0,
        avg: 0,
        peak: 0,
      },
    };
  }

  private updateMetrics(
    metrics: CircuitMetrics,
    _success: boolean,
    latency: number
  ): void {
    // Update throughput
    const now = Date.now();
    const currentThroughput = 1000 / Math.max(1, latency); // Requests per second

    metrics.throughput.current = currentThroughput;
    metrics.throughput.avg =
      (metrics.throughput.avg * metrics.totalRequests + currentThroughput) /
      (metrics.totalRequests + 1);
    metrics.throughput.peak = Math.max(
      metrics.throughput.peak,
      currentThroughput
    );

    // Update error rate
    metrics.errorRate = metrics.failures / Math.max(1, metrics.totalRequests);

    // Update state change time if needed
    const newState = this.getState();
    if (newState !== this.state) {
      this.lastStateChangeTime = now;
      this.state = newState;
    }
  }

  private recordSuccess(group?: string): void {
    if (this.config.groupSpecific && group) {
      const metrics = this.getOrCreateMetrics(group);
      metrics.successes++;
      metrics.lastSuccess = Date.now();
      metrics.totalRequests++;

      if (this.groupStates.get(group) === CircuitState.HALF_OPEN) {
        this.groupStates.set(group, CircuitState.CLOSED);
      }
    } else {
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
      }
      this.failures = 0;
    }
  }

  private recordFailure(group?: string): void {
    const now = Date.now();

    if (this.config.groupSpecific && group) {
      const metrics = this.getOrCreateMetrics(group);
      metrics.failures++;
      metrics.lastFailure = now;
      metrics.totalRequests++;

      if (metrics.failures >= this.config.failureThreshold) {
        this.groupStates.set(group, CircuitState.OPEN);
      }
    } else {
      this.failures++;
      this.lastFailureTime = now;

      if (this.failures >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN;
      }
    }
  }

  private getOrCreateMetrics(group: string): CircuitMetrics {
    if (!this.metrics.has(group)) {
      this.metrics.set(group, {
        failures: 0,
        successes: 0,
        lastFailure: null,
        lastSuccess: null,
        totalRequests: 0,
        errorRate: 0,
        latency: {
          avg: 0,
          p95: 0,
          p99: 0,
        },
        throughput: {
          current: 0,
          avg: 0,
          peak: 0,
        },
      });
    }
    return this.metrics.get(group)!;
  }

  private updateLatencyMetrics(latency: number, metrics: CircuitMetrics): void {
    this.latencyWindow.push(latency);
    if (this.latencyWindow.length > 100) {
      this.latencyWindow.shift();
    }

    const sortedLatencies = [...this.latencyWindow].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);

    metrics.latency = {
      avg:
        sortedLatencies.reduce((sum, val) => sum + val, 0) /
        sortedLatencies.length,
      p95: sortedLatencies[p95Index] || 0,
      p99: sortedLatencies[p99Index] || 0,
    };
  }

  private calculateHealthScore(metrics: CircuitMetrics): number {
    const errorRateWeight = 0.4;
    const latencyWeight = 0.3;
    const throughputWeight = 0.3;

    const errorRateScore = Math.max(0, 1 - metrics.errorRate);
    const latencyScore = Math.max(0, 1 - metrics.latency.p95 / 1000); // Normalized to 1 second
    const throughputScore = Math.min(
      1,
      metrics.throughput.current / metrics.throughput.peak
    );

    return (
      errorRateWeight * errorRateScore +
      latencyWeight * latencyScore +
      throughputWeight * throughputScore
    );
  }

  private updateHealthSnapshot(group?: string): void {
    const metrics = group
      ? this.getOrCreateMetrics(group)
      : this.getDefaultMetrics();
    const state = this.getState(group);
    const healthScore = this.calculateHealthScore(metrics);

    const predictionData: CircuitPredictionData = {
      predictedFailureRate: this.predictFailureRate(metrics),
      predictedLatency: this.predictLatency(metrics),
      reliabilityScore: this.calculateReliabilityScore(metrics),
      nextStateChangePrediction: this.predictNextStateChange(
        state,
        healthScore,
        metrics
      ),
    };

    const snapshot: CircuitHealthSnapshot = {
      state,
      metrics,
      healthScore,
      lastStateChange: this.lastStateChangeTime,
      predictionData,
    };

    this.healthSnapshots.push(snapshot);
    if (this.healthSnapshots.length > 100) {
      this.healthSnapshots.shift();
    }
  }

  private predictFailureRate(metrics: CircuitMetrics): number {
    // Simple exponential moving average prediction
    const alpha = 0.7;
    const currentRate = metrics.failures / Math.max(1, metrics.totalRequests);
    const previousRate = metrics.errorRate;
    return alpha * currentRate + (1 - alpha) * previousRate;
  }

  private predictLatency(metrics: CircuitMetrics): number {
    // Use recent trend in p95 latency
    const recentLatencies = this.latencyWindow.slice(-10);
    if (recentLatencies.length === 0) return metrics.latency.avg;

    const latencyTrend =
      recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length;
    return (latencyTrend + metrics.latency.p95) / 2;
  }

  private calculateReliabilityScore(metrics: CircuitMetrics): number {
    const successRate = metrics.successes / Math.max(1, metrics.totalRequests);
    const latencyFactor = Math.max(0, 1 - metrics.latency.p99 / 2000); // Normalize to 2 seconds
    const throughputFactor =
      metrics.throughput.current / Math.max(1, metrics.throughput.peak);

    return successRate * 0.5 + latencyFactor * 0.3 + throughputFactor * 0.2;
  }

  private predictNextStateChange(
    currentState: CircuitState,
    healthScore: number,
    metrics: CircuitMetrics
  ): { state: CircuitState; confidence: number; estimatedTime: number } {
    const now = Date.now();
    let prediction = {
      state: currentState,
      confidence: 0.8,
      estimatedTime: now + this.config.resetTimeout,
    };

    if (currentState === CircuitState.OPEN) {
      prediction.state = CircuitState.HALF_OPEN;
      prediction.confidence = 0.9;
      prediction.estimatedTime = now + this.config.resetTimeout;
    } else if (currentState === CircuitState.HALF_OPEN) {
      const willSucceed = healthScore > 0.7;
      prediction.state = willSucceed ? CircuitState.CLOSED : CircuitState.OPEN;
      prediction.confidence = healthScore;
      prediction.estimatedTime = now + (willSucceed ? 5000 : 0);
    } else {
      const willFail = healthScore < 0.3 || metrics.errorRate > 0.5;
      prediction.state = willFail ? CircuitState.OPEN : CircuitState.CLOSED;
      prediction.confidence = willFail ? 1 - healthScore : healthScore;
      prediction.estimatedTime =
        now + (willFail ? 0 : this.config.resetTimeout);
    }

    return prediction;
  }

  public isOpen(group?: string): boolean {
    if (this.config.groupSpecific && group) {
      return this.groupStates.get(group) === CircuitState.OPEN;
    }
    return this.state === CircuitState.OPEN;
  }

  public getState(group?: string): CircuitState {
    if (this.config.groupSpecific && group) {
      return this.groupStates.get(group) || CircuitState.CLOSED;
    }
    return this.state;
  }

  public getMetrics(group?: string): CircuitMetrics | null {
    if (this.config.groupSpecific && group) {
      return this.metrics.get(group) || null;
    }
    return this.getDefaultMetrics();
  }

  public reset(group?: string): void {
    if (this.config.groupSpecific && group) {
      this.groupStates.delete(group);
      this.metrics.delete(group);
    } else {
      this.state = CircuitState.CLOSED;
      this.failures = 0;
      this.lastFailureTime = 0;
    }
  }

  public dispose(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }
}
