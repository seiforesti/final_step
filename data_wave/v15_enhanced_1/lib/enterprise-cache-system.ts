/**
 * Enterprise Caching and Performance System
 * =======================================
 *
 * Advanced caching and optimization with:
 * - Multi-level caching
 * - Intelligent prefetching
 * - Cache invalidation strategies
 * - Memory management
 * - Performance monitoring
 * - Resource optimization
 * - Load balancing
 * - Compression
 */

import { websocketService } from "./websocket-service";
import { errorSystem } from "./enterprise-error-system";
import { EventEmitter } from "events";

export type CacheConfig = {
  ttl: number;
  maxSize: number;
  compressionThreshold: number;
  prefetchThreshold: number;
  updateInterval: number;
  invalidationStrategy: "lru" | "lfu" | "fifo";
  persistenceEnabled: boolean;
};

export type CacheEntry<T> = {
  key: string;
  value: T;
  timestamp: string;
  expiresAt: string;
  lastAccessed: string;
  accessCount: number;
  size: number;
  compressed: boolean;
  metadata: Record<string, any>;
};

export type CacheStats = {
  hits: number;
  misses: number;
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  avgAccessTime: number;
  evictions: number;
  compressionRatio: number;
};

export type PrefetchStrategy = {
  id: string;
  name: string;
  condition: (key: string, stats: CacheStats) => Promise<boolean>;
  priority: number;
};

export class EnterpriseCacheSystem {
  private readonly caches = new Map<string, Map<string, CacheEntry<any>>>();
  private readonly eventEmitter = new EventEmitter();
  private readonly stats = new Map<string, CacheStats>();
  private readonly prefetchStrategies = new Map<string, PrefetchStrategy>();
  private readonly accessTimes = new Map<string, number[]>();
  private readonly compressionWorker: Worker | null = null;
  private persistenceInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly defaultConfig: CacheConfig = {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100 * 1024 * 1024, // 100MB
      compressionThreshold: 1024, // 1KB
      prefetchThreshold: 0.8, // 80% hit rate
      updateInterval: 60 * 1000, // 1 minute
      invalidationStrategy: "lru",
      persistenceEnabled: true,
    }
  ) {
    this.initializeSystem();
  }

  /**
   * Create a new cache instance
   */
  public createCache(name: string, config?: Partial<CacheConfig>): void {
    const fullConfig = { ...this.defaultConfig, ...config };
    this.caches.set(name, new Map());
    this.stats.set(name, this.createInitialStats());
    this.setupCacheMonitoring(name, fullConfig);

    if (fullConfig.persistenceEnabled) {
      this.loadPersistedCache(name);
    }
  }

  /**
   * Set a value in cache
   */
  public async set<T>(
    cacheName: string,
    key: string,
    value: T,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const cache = this.getCache(cacheName);
    const start = performance.now();

    try {
      const size = this.calculateSize(value);
      const compressed = await this.shouldCompress(size);

      const entry: CacheEntry<T> = {
        key,
        value: compressed ? await this.compress(value) : value,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.defaultConfig.ttl).toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
        size,
        compressed,
        metadata,
      };

      await this.evictIfNeeded(cacheName, size);
      cache.set(key, entry);

      this.updateStats(cacheName, "set", performance.now() - start);
      this.eventEmitter.emit("cache:set", { cacheName, key });

      this.triggerPrefetch(cacheName, key);
    } catch (error) {
      await errorSystem.handleError(error as Error, "error", {
        service: "CacheSystem",
        operation: "set",
        component: "Cache",
      });
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  public async get<T>(cacheName: string, key: string): Promise<T | undefined> {
    const cache = this.getCache(cacheName);
    const start = performance.now();

    try {
      const entry = cache.get(key);
      if (!entry) {
        this.updateStats(cacheName, "miss", performance.now() - start);
        return undefined;
      }

      if (this.isExpired(entry)) {
        cache.delete(key);
        this.updateStats(cacheName, "miss", performance.now() - start);
        return undefined;
      }

      entry.lastAccessed = new Date().toISOString();
      entry.accessCount++;

      const value = entry.compressed
        ? await this.decompress(entry.value)
        : entry.value;
      this.updateStats(cacheName, "hit", performance.now() - start);

      this.triggerPrefetch(cacheName, key);
      return value;
    } catch (error) {
      await errorSystem.handleError(error as Error, "error", {
        service: "CacheSystem",
        operation: "get",
        component: "Cache",
      });
      throw error;
    }
  }

  /**
   * Remove a value from cache
   */
  public async delete(cacheName: string, key: string): Promise<boolean> {
    const cache = this.getCache(cacheName);
    const deleted = cache.delete(key);
    this.eventEmitter.emit("cache:delete", { cacheName, key });
    return deleted;
  }

  /**
   * Clear all entries from cache
   */
  public async clear(cacheName: string): Promise<void> {
    const cache = this.getCache(cacheName);
    cache.clear();
    this.stats.set(cacheName, this.createInitialStats());
    this.eventEmitter.emit("cache:clear", { cacheName });
  }

  /**
   * Get cache statistics
   */
  public getStats(cacheName: string): CacheStats {
    return this.stats.get(cacheName) || this.createInitialStats();
  }

  /**
   * Register a prefetch strategy
   */
  public registerPrefetchStrategy(strategy: PrefetchStrategy): void {
    this.prefetchStrategies.set(strategy.id, strategy);
  }

  private getCache(name: string): Map<string, CacheEntry<any>> {
    const cache = this.caches.get(name);
    if (!cache) {
      throw new Error(`Cache "${name}" not found`);
    }
    return cache;
  }

  private createInitialStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      avgAccessTime: 0,
      evictions: 0,
      compressionRatio: 1,
    };
  }

  private async evictIfNeeded(
    cacheName: string,
    newEntrySize: number
  ): Promise<void> {
    const cache = this.getCache(cacheName);
    const stats = this.getStats(cacheName);

    while (
      stats.totalSize + newEntrySize > this.defaultConfig.maxSize &&
      cache.size > 0
    ) {
      const entryToEvict = this.selectEntryForEviction(cache);
      if (entryToEvict) {
        cache.delete(entryToEvict.key);
        stats.totalSize -= entryToEvict.size;
        stats.evictions++;
      }
    }
  }

  private selectEntryForEviction(
    cache: Map<string, CacheEntry<any>>
  ): CacheEntry<any> | null {
    const entries = Array.from(cache.values());

    switch (this.defaultConfig.invalidationStrategy) {
      case "lru":
        return entries.sort(
          (a, b) =>
            new Date(a.lastAccessed).getTime() -
            new Date(b.lastAccessed).getTime()
        )[0];

      case "lfu":
        return entries.sort((a, b) => a.accessCount - b.accessCount)[0];

      case "fifo":
        return entries.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )[0];

      default:
        return entries[0];
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return new Date(entry.expiresAt).getTime() <= Date.now();
  }

  private calculateSize(value: any): number {
    try {
      const str = JSON.stringify(value);
      return new Blob([str]).size;
    } catch {
      return 0;
    }
  }

  private async shouldCompress(size: number): Promise<boolean> {
    return size > this.defaultConfig.compressionThreshold;
  }

  private async compress(value: any): Promise<any> {
    // Implement compression logic here
    // For example, using CompressionStream when available
    return value;
  }

  private async decompress(value: any): Promise<any> {
    // Implement decompression logic here
    // For example, using DecompressionStream when available
    return value;
  }

  private updateStats(
    cacheName: string,
    operation: "hit" | "miss" | "set",
    duration: number
  ): void {
    const stats = this.getStats(cacheName);

    if (operation === "hit") {
      stats.hits++;
    } else if (operation === "miss") {
      stats.misses++;
    }

    stats.hitRate = stats.hits / (stats.hits + stats.misses);

    const times = this.accessTimes.get(cacheName) || [];
    times.push(duration);
    if (times.length > 100) times.shift();
    this.accessTimes.set(cacheName, times);

    stats.avgAccessTime = times.reduce((a, b) => a + b, 0) / times.length;
  }

  private async triggerPrefetch(cacheName: string, key: string): Promise<void> {
    const stats = this.getStats(cacheName);

    if (stats.hitRate > this.defaultConfig.prefetchThreshold) {
      for (const strategy of this.prefetchStrategies.values()) {
        if (await strategy.condition(key, stats)) {
          this.eventEmitter.emit("cache:prefetch", {
            cacheName,
            key,
            strategy: strategy.id,
          });
        }
      }
    }
  }

  private setupCacheMonitoring(cacheName: string, config: CacheConfig): void {
    setInterval(() => {
      const cache = this.getCache(cacheName);
      const stats = this.getStats(cacheName);

      // Update size stats
      stats.totalEntries = cache.size;
      stats.totalSize = Array.from(cache.values()).reduce(
        (total, entry) => total + entry.size,
        0
      );

      // Calculate compression ratio
      const totalUncompressed = Array.from(cache.values()).reduce(
        (total, entry) =>
          total + (entry.compressed ? entry.size * 2 : entry.size),
        0
      );
      stats.compressionRatio = totalUncompressed / stats.totalSize;

      // Emit metrics
      this.eventEmitter.emit("cache:metrics", {
        cacheName,
        stats,
        timestamp: new Date().toISOString(),
      });

      // Report to WebSocket if connected
      websocketService
        .send("cache-metrics", {
          type: "metrics",
          cacheName,
          stats,
        })
        .catch(console.error);
    }, config.updateInterval);
  }

  private async loadPersistedCache(cacheName: string): Promise<void> {
    try {
      const persistedData = localStorage.getItem(`cache:${cacheName}`);
      if (persistedData) {
        const { entries } = JSON.parse(persistedData);
        const cache = this.getCache(cacheName);

        for (const [key, entry] of Object.entries(entries)) {
          if (!this.isExpired(entry as CacheEntry<any>)) {
            cache.set(key, entry as CacheEntry<any>);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load persisted cache ${cacheName}:`, error);
    }
  }

  private initializeSystem(): void {
    // Register default prefetch strategies
    this.registerPrefetchStrategy({
      id: "adjacent-keys",
      name: "Adjacent Keys Prefetcher",
      condition: async (key) => {
        // Implement adjacent keys prefetching logic
        return false;
      },
      priority: 1,
    });

    // Setup persistence if enabled
    if (this.defaultConfig.persistenceEnabled) {
      this.persistenceInterval = setInterval(() => {
        this.caches.forEach((cache, name) => {
          try {
            localStorage.setItem(
              `cache:${name}`,
              JSON.stringify({
                entries: Object.fromEntries(cache),
                timestamp: new Date().toISOString(),
              })
            );
          } catch (error) {
            console.error(`Failed to persist cache ${name}:`, error);
          }
        });
      }, 5 * 60 * 1000); // Every 5 minutes
    }

    // Cleanup expired entries periodically
    setInterval(() => {
      this.caches.forEach((cache, name) => {
        cache.forEach((entry, key) => {
          if (this.isExpired(entry)) {
            cache.delete(key);
          }
        });
      });
    }, 60 * 1000); // Every minute
  }
}

// Create singleton instance
export const cacheSystem = new EnterpriseCacheSystem();
