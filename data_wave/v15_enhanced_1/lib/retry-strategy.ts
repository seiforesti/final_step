/**
 * 🔄 RETRY STRATEGY - ADVANCED RETRY POLICIES
 * =======================================
 *
 * Enterprise-grade retry strategy management with:
 * - Multiple retry strategies
 * - Group-specific retry policies
 * - Timeout handling
 * - Backoff algorithms
 */

export type RetryStrategy =
  | "linear"
  | "exponential"
  | "fibonacci"
  | "decorrelated"
  | "custom";

export interface RetryConfig {
  strategy: RetryStrategy;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  timeout?: number;
  jitter?: boolean;
  groupPolicies?: Record<string, RetryGroupPolicy>;
}

export interface RetryGroupPolicy {
  strategy: RetryStrategy;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  timeout?: number;
  jitter?: boolean;
}

export interface RetryContext {
  attempt: number;
  previousDelay?: number;
  error?: any;
  startTime: number;
  group?: string;
}

export class RetryStrategyFactory {
  private readonly config: RetryConfig;
  private readonly defaultStrategy: RetryStrategy;

  constructor(config: RetryConfig) {
    this.config = {
      ...config,
      jitter: config.jitter ?? true, // Enable jitter by default
    };
    this.defaultStrategy = config.strategy;
  }

  public getStrategy(group?: string): (context: RetryContext) => number {
    const policy = group && this.config.groupPolicies?.[group];
    const strategy = policy?.strategy || this.defaultStrategy;

    switch (strategy) {
      case "linear":
        return this.linearBackoff(policy);
      case "exponential":
        return this.exponentialBackoff(policy);
      case "fibonacci":
        return this.fibonacciBackoff(policy);
      case "decorrelated":
        return this.decorrelatedJitter(policy);
      case "custom":
        return this.customBackoff(policy);
      default:
        return this.linearBackoff(policy);
    }
  }

  private linearBackoff(policy?: RetryGroupPolicy) {
    return (context: RetryContext): number => {
      const config = policy || this.config;
      const delay = config.baseDelay * context.attempt;
      return this.applyJitterAndBounds(delay, config);
    };
  }

  private exponentialBackoff(policy?: RetryGroupPolicy) {
    return (context: RetryContext): number => {
      const config = policy || this.config;
      const delay = config.baseDelay * Math.pow(2, context.attempt - 1);
      return this.applyJitterAndBounds(delay, config);
    };
  }

  private fibonacciBackoff(policy?: RetryGroupPolicy) {
    return (context: RetryContext): number => {
      const config = policy || this.config;
      const fib = this.fibonacci(context.attempt);
      const delay = config.baseDelay * fib;
      return this.applyJitterAndBounds(delay, config);
    };
  }

  private decorrelatedJitter(policy?: RetryGroupPolicy) {
    return (context: RetryContext): number => {
      const config = policy || this.config;
      const previousDelay = context.previousDelay || config.baseDelay;
      const delay = Math.random() * (previousDelay * 3 - config.baseDelay);
      return this.applyJitterAndBounds(delay, config);
    };
  }

  private customBackoff(policy?: RetryGroupPolicy) {
    return (context: RetryContext): number => {
      const config = policy || this.config;
      // Implement custom backoff strategy here
      // This is a placeholder implementation combining exponential and fibonacci
      const exponential = config.baseDelay * Math.pow(2, context.attempt - 1);
      const fibonacci = config.baseDelay * this.fibonacci(context.attempt);
      const delay = (exponential + fibonacci) / 2;
      return this.applyJitterAndBounds(delay, config);
    };
  }

  private applyJitterAndBounds(
    delay: number,
    config: RetryConfig | RetryGroupPolicy
  ): number {
    let finalDelay = delay;

    // Apply jitter if enabled
    if (config.jitter) {
      const jitterFactor = 0.2; // 20% jitter
      const jitterRange = finalDelay * jitterFactor;
      finalDelay += (Math.random() * 2 - 1) * jitterRange;
    }

    // Apply bounds
    finalDelay = Math.max(
      config.baseDelay,
      Math.min(config.maxDelay, finalDelay)
    );

    return Math.floor(finalDelay);
  }

  private fibonacci(n: number): number {
    if (n <= 1) return n;
    let prev = 0,
      curr = 1;
    for (let i = 2; i <= n; i++) {
      const temp = curr;
      curr = prev + curr;
      prev = temp;
    }
    return curr;
  }

  public shouldRetry(context: RetryContext, group?: string): boolean {
    const policy = group && this.config.groupPolicies?.[group];
    const maxAttempts = policy?.maxAttempts || this.config.maxAttempts;
    const timeout = policy?.timeout || this.config.timeout;

    // Check max attempts
    if (context.attempt >= maxAttempts) {
      return false;
    }

    // Check timeout if specified
    if (timeout && Date.now() - context.startTime >= timeout) {
      return false;
    }

    return true;
  }

  public getMaxAttempts(group?: string): number {
    return (
      (group && this.config.groupPolicies?.[group]?.maxAttempts) ||
      this.config.maxAttempts
    );
  }

  public getTimeout(group?: string): number | undefined {
    return (
      (group && this.config.groupPolicies?.[group]?.timeout) ||
      this.config.timeout
    );
  }
}
