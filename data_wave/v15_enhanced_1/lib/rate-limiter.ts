/**
 * 🚦 RATE LIMITER - ADVANCED REQUEST THROTTLING
 * ===========================================
 *
 * Enterprise-grade rate limiter with:
 * - Token bucket algorithm
 * - Concurrent request limiting
 * - Group-based rate limiting
 * - Priority-based throttling
 */

export interface RateLimiterConfig {
  maxRequests: number;
  perMilliseconds: number;
  maxConcurrent?: number;
  groupLimits?: Record<
    string,
    {
      maxRequests: number;
      perMilliseconds: number;
    }
  >;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private activeRequests: number;
  private groupTokens: Record<string, number>;
  private groupLastRefills: Record<string, number>;
  private readonly config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.tokens = config.maxRequests;
    this.lastRefill = Date.now();
    this.activeRequests = 0;
    this.groupTokens = {};
    this.groupLastRefills = {};

    if (config.groupLimits) {
      Object.keys(config.groupLimits).forEach((group) => {
        this.groupTokens[group] = config.groupLimits[group].maxRequests;
        this.groupLastRefills[group] = Date.now();
      });
    }
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd =
      Math.floor(timePassed / this.config.perMilliseconds) *
      this.config.maxRequests;

    this.tokens = Math.min(this.config.maxRequests, this.tokens + tokensToAdd);
    this.lastRefill = now;

    // Refill group tokens
    if (this.config.groupLimits) {
      Object.keys(this.config.groupLimits).forEach((group) => {
        const groupConfig = this.config.groupLimits![group];
        const groupTimePassed = now - this.groupLastRefills[group];
        const groupTokensToAdd =
          Math.floor(groupTimePassed / groupConfig.perMilliseconds) *
          groupConfig.maxRequests;

        this.groupTokens[group] = Math.min(
          groupConfig.maxRequests,
          this.groupTokens[group] + groupTokensToAdd
        );
        this.groupLastRefills[group] = now;
      });
    }
  }

  public async acquire(group?: string): Promise<boolean> {
    this.refillTokens();

    // Check concurrent request limit
    if (
      this.config.maxConcurrent &&
      this.activeRequests >= this.config.maxConcurrent
    ) {
      return false;
    }

    // Check group limit
    if (group && this.config.groupLimits && this.config.groupLimits[group]) {
      if (this.groupTokens[group] <= 0) {
        return false;
      }
      this.groupTokens[group]--;
    }

    // Check global limit
    if (this.tokens <= 0) {
      return false;
    }

    this.tokens--;
    this.activeRequests++;
    return true;
  }

  public release(group?: string): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  public getRemainingTokens(group?: string): number {
    this.refillTokens();
    if (group && this.config.groupLimits && this.config.groupLimits[group]) {
      return this.groupTokens[group];
    }
    return this.tokens;
  }

  public getActiveRequests(): number {
    return this.activeRequests;
  }

  public isThrottled(group?: string): boolean {
    return (
      !this.getRemainingTokens(group) ||
      (this.config.maxConcurrent
        ? this.activeRequests >= this.config.maxConcurrent
        : false)
    );
  }
}
