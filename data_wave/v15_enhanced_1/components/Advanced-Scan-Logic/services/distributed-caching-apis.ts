/**
 * 🗄️ Distributed Caching APIs - Advanced Scan Logic
 * ==================================================
 * 
 * Comprehensive API integration for distributed caching operations
 * Maps to: backend/api/routes/distributed_caching_routes.py
 * 
 * Features:
 * - Distributed cache management and coordination
 * - Performance monitoring and optimization
 * - Cache analytics and insights
 * - Cross-system cache synchronization
 * - Enterprise-scale cache operations
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { ApiClient } from '@/lib/api-client';
import {
  CacheConfiguration,
  CacheEntry,
  CacheMetrics,
  CacheNode,
  CacheStrategy,
  CachePartition,
  CacheSynchronization,
  CachePerformance,
  CacheAnalytics,
  CacheHealth,
  CacheReplication,
  CacheEvictionPolicy
} from '../types/caching.types';

/**
 * API endpoints configuration mapping to backend routes
 */
const API_BASE = '/api/v1/distributed-caching';

const ENDPOINTS = {
  // Cache initialization and management
  INITIALIZE_CACHE: `${API_BASE}/cache/initialize`,
  CONFIGURE_CACHE: `${API_BASE}/cache/configure`,
  DESTROY_CACHE: `${API_BASE}/cache/destroy`,
  RESET_CACHE: `${API_BASE}/cache/reset`,
  
  // Cache operations
  PUT_CACHE_ENTRY: `${API_BASE}/cache/put`,
  GET_CACHE_ENTRY: `${API_BASE}/cache/get`,
  DELETE_CACHE_ENTRY: `${API_BASE}/cache/delete`,
  BATCH_OPERATIONS: `${API_BASE}/cache/batch`,
  
  // Cache management
  GET_CACHE_STATISTICS: `${API_BASE}/cache/statistics`,
  GET_CACHE_HEALTH: `${API_BASE}/cache/health`,
  FLUSH_CACHE: `${API_BASE}/cache/flush`,
  COMPACT_CACHE: `${API_BASE}/cache/compact`,
  
  // Node management
  ADD_CACHE_NODE: `${API_BASE}/nodes/add`,
  REMOVE_CACHE_NODE: `${API_BASE}/nodes/remove`,
  GET_NODE_STATUS: `${API_BASE}/nodes/status`,
  REBALANCE_NODES: `${API_BASE}/nodes/rebalance`,
  
  // Partitioning
  CREATE_PARTITION: `${API_BASE}/partitions/create`,
  MERGE_PARTITIONS: `${API_BASE}/partitions/merge`,
  SPLIT_PARTITION: `${API_BASE}/partitions/split`,
  GET_PARTITION_INFO: `${API_BASE}/partitions/info`,
  
  // Synchronization
  SYNC_CACHE_NODES: `${API_BASE}/sync/nodes`,
  RESOLVE_CONFLICTS: `${API_BASE}/sync/conflicts`,
  GET_SYNC_STATUS: `${API_BASE}/sync/status`,
  FORCE_SYNC: `${API_BASE}/sync/force`,
  
  // Performance monitoring
  GET_PERFORMANCE_METRICS: `${API_BASE}/performance/metrics`,
  GET_CACHE_ANALYTICS: `${API_BASE}/performance/analytics`,
  GET_OPTIMIZATION_SUGGESTIONS: `${API_BASE}/performance/optimize`,
  BENCHMARK_CACHE: `${API_BASE}/performance/benchmark`,
  
  // Replication
  CONFIGURE_REPLICATION: `${API_BASE}/replication/configure`,
  GET_REPLICATION_STATUS: `${API_BASE}/replication/status`,
  FAILOVER_REPLICA: `${API_BASE}/replication/failover`,
  RESTORE_REPLICA: `${API_BASE}/replication/restore`,
  
  // Advanced features
  ENABLE_COMPRESSION: `${API_BASE}/advanced/compression`,
  CONFIGURE_ENCRYPTION: `${API_BASE}/advanced/encryption`,
  SET_EVICTION_POLICY: `${API_BASE}/advanced/eviction`,
  CONFIGURE_TTL: `${API_BASE}/advanced/ttl`
} as const;

/**
 * Distributed Caching API Service Class
 * Provides comprehensive integration with distributed caching backend
 */
export class DistributedCachingAPIService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ==================== Cache Initialization and Management ====================

  /**
   * Initialize distributed cache infrastructure
   */
  async initializeDistributedCache(
    cacheConfig: CacheConfiguration,
    clusterConfig: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.post<Record<string, any>>(
        ENDPOINTS.INITIALIZE_CACHE,
        {
          cache_config: cacheConfig,
          cluster_config: clusterConfig
        }
      );

      return {
        ...response,
        initialization_id: response.initialization_id || `init_${Date.now()}`,
        cache_ready: response.cache_ready || false,
        initialization_timestamp: response.initialization_timestamp || new Date().toISOString(),
        nodes_initialized: response.nodes_initialized || 0
      };
    } catch (error) {
      console.error('Error initializing distributed cache:', error);
      throw new Error(`Failed to initialize distributed cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Configure cache settings
   */
  async configureCacheSettings(
    cacheId: string,
    configuration: Partial<CacheConfiguration>
  ): Promise<CacheConfiguration> {
    try {
      const response = await this.apiClient.patch<CacheConfiguration>(
        `${ENDPOINTS.CONFIGURE_CACHE}/${cacheId}`,
        configuration
      );

      return {
        ...response,
        config_id: response.config_id || `config_${Date.now()}`,
        update_timestamp: response.update_timestamp || new Date().toISOString(),
        version: response.version || '1.0.0'
      };
    } catch (error) {
      console.error('Error configuring cache settings:', error);
      throw new Error(`Failed to configure cache settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Destroy cache instance
   */
  async destroyCache(
    cacheId: string,
    force: boolean = false
  ): Promise<{ success: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.delete<{ success: boolean; timestamp: string }>(
        `${ENDPOINTS.DESTROY_CACHE}/${cacheId}`,
        { params: { force } }
      );

      return {
        success: response.success || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error destroying cache:', error);
      throw new Error(`Failed to destroy cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset cache to initial state
   */
  async resetCache(
    cacheId: string,
    preserveConfig: boolean = true
  ): Promise<{ success: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ success: boolean; timestamp: string }>(
        `${ENDPOINTS.RESET_CACHE}/${cacheId}`,
        { preserve_config: preserveConfig }
      );

      return {
        success: response.success || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error resetting cache:', error);
      throw new Error(`Failed to reset cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Cache Operations ====================

  /**
   * Store entry in distributed cache
   */
  async putCacheEntry(
    cacheRequest: {
      key: string;
      value: any;
      ttl?: number;
      options?: Record<string, any>;
    }
  ): Promise<CacheEntry> {
    try {
      const response = await this.apiClient.post<CacheEntry>(
        ENDPOINTS.PUT_CACHE_ENTRY,
        cacheRequest
      );

      return {
        ...response,
        entry_id: response.entry_id || `entry_${Date.now()}`,
        stored_timestamp: response.stored_timestamp || new Date().toISOString(),
        partition_id: response.partition_id || 'default',
        node_id: response.node_id || 'unknown'
      };
    } catch (error) {
      console.error('Error storing cache entry:', error);
      throw new Error(`Failed to store cache entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve entry from distributed cache
   */
  async getCacheEntry(
    key: string,
    options?: Record<string, any>
  ): Promise<CacheEntry | null> {
    try {
      const response = await this.apiClient.get<CacheEntry | null>(
        `${ENDPOINTS.GET_CACHE_ENTRY}/${encodeURIComponent(key)}`,
        { params: options }
      );

      if (!response) return null;

      return {
        ...response,
        retrieved_timestamp: response.retrieved_timestamp || new Date().toISOString(),
        hit: response.hit !== undefined ? response.hit : true,
        access_count: response.access_count || 1
      };
    } catch (error) {
      console.error('Error retrieving cache entry:', error);
      throw new Error(`Failed to retrieve cache entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete entry from distributed cache
   */
  async deleteCacheEntry(
    key: string,
    options?: Record<string, any>
  ): Promise<{ success: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.delete<{ success: boolean; timestamp: string }>(
        `${ENDPOINTS.DELETE_CACHE_ENTRY}/${encodeURIComponent(key)}`,
        { params: options }
      );

      return {
        success: response.success || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error deleting cache entry:', error);
      throw new Error(`Failed to delete cache entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform batch cache operations
   */
  async batchCacheOperations(
    operations: Array<{
      operation: 'put' | 'get' | 'delete';
      key: string;
      value?: any;
      options?: Record<string, any>;
    }>
  ): Promise<Record<string, any>[]> {
    try {
      const response = await this.apiClient.post<Record<string, any>[]>(
        ENDPOINTS.BATCH_OPERATIONS,
        { operations }
      );

      return response.map((result, index) => ({
        ...result,
        operation_id: result.operation_id || `batch_${Date.now()}_${index}`,
        execution_timestamp: result.execution_timestamp || new Date().toISOString(),
        success: result.success !== undefined ? result.success : true
      }));
    } catch (error) {
      console.error('Error performing batch operations:', error);
      throw new Error(`Failed to perform batch operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Cache Management ====================

  /**
   * Get cache statistics
   */
  async getCacheStatistics(
    cacheId?: string
  ): Promise<CacheMetrics> {
    try {
      const response = await this.apiClient.get<CacheMetrics>(
        ENDPOINTS.GET_CACHE_STATISTICS,
        { params: { cache_id: cacheId } }
      );

      return {
        ...response,
        metrics_id: response.metrics_id || `metrics_${Date.now()}`,
        collection_timestamp: response.collection_timestamp || new Date().toISOString(),
        hit_ratio: response.hit_ratio || 0,
        miss_ratio: response.miss_ratio || 0,
        total_entries: response.total_entries || 0
      };
    } catch (error) {
      console.error('Error getting cache statistics:', error);
      throw new Error(`Failed to get cache statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cache health status
   */
  async getCacheHealth(
    cacheId?: string
  ): Promise<CacheHealth> {
    try {
      const response = await this.apiClient.get<CacheHealth>(
        ENDPOINTS.GET_CACHE_HEALTH,
        { params: { cache_id: cacheId } }
      );

      return {
        ...response,
        health_id: response.health_id || `health_${Date.now()}`,
        overall_status: response.overall_status || 'unknown',
        check_timestamp: response.check_timestamp || new Date().toISOString(),
        node_health: response.node_health || {}
      };
    } catch (error) {
      console.error('Error getting cache health:', error);
      throw new Error(`Failed to get cache health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Flush cache contents
   */
  async flushCache(
    cacheId: string,
    flushType: 'all' | 'expired' | 'lru' = 'expired'
  ): Promise<{ flushed_entries: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ flushed_entries: number; timestamp: string }>(
        `${ENDPOINTS.FLUSH_CACHE}/${cacheId}`,
        { flush_type: flushType }
      );

      return {
        flushed_entries: response.flushed_entries || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error flushing cache:', error);
      throw new Error(`Failed to flush cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compact cache storage
   */
  async compactCache(
    cacheId: string,
    compactionLevel: 'light' | 'full' = 'light'
  ): Promise<{ compaction_ratio: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ compaction_ratio: number; timestamp: string }>(
        `${ENDPOINTS.COMPACT_CACHE}/${cacheId}`,
        { compaction_level: compactionLevel }
      );

      return {
        compaction_ratio: response.compaction_ratio || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error compacting cache:', error);
      throw new Error(`Failed to compact cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Node Management ====================

  /**
   * Add cache node to cluster
   */
  async addCacheNode(
    nodeConfig: {
      node_id: string;
      host: string;
      port: number;
      capacity: number;
      region?: string;
    }
  ): Promise<CacheNode> {
    try {
      const response = await this.apiClient.post<CacheNode>(
        ENDPOINTS.ADD_CACHE_NODE,
        nodeConfig
      );

      return {
        ...response,
        node_id: response.node_id || nodeConfig.node_id,
        status: response.status || 'initializing',
        added_timestamp: response.added_timestamp || new Date().toISOString(),
        health_status: response.health_status || 'unknown'
      };
    } catch (error) {
      console.error('Error adding cache node:', error);
      throw new Error(`Failed to add cache node: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove cache node from cluster
   */
  async removeCacheNode(
    nodeId: string,
    graceful: boolean = true
  ): Promise<{ success: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.delete<{ success: boolean; timestamp: string }>(
        `${ENDPOINTS.REMOVE_CACHE_NODE}/${nodeId}`,
        { params: { graceful } }
      );

      return {
        success: response.success || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error removing cache node:', error);
      throw new Error(`Failed to remove cache node: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get node status
   */
  async getNodeStatus(
    nodeId?: string
  ): Promise<CacheNode[]> {
    try {
      const response = await this.apiClient.get<CacheNode[]>(
        ENDPOINTS.GET_NODE_STATUS,
        { params: { node_id: nodeId } }
      );

      return response.map(node => ({
        ...node,
        status_timestamp: node.status_timestamp || new Date().toISOString(),
        uptime: node.uptime || 0,
        load_percentage: node.load_percentage || 0
      }));
    } catch (error) {
      console.error('Error getting node status:', error);
      throw new Error(`Failed to get node status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rebalance cache nodes
   */
  async rebalanceNodes(
    rebalanceConfig?: {
      strategy: 'even' | 'weighted' | 'performance';
      target_load?: number;
    }
  ): Promise<{ rebalance_id: string; estimated_duration: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ rebalance_id: string; estimated_duration: number; timestamp: string }>(
        ENDPOINTS.REBALANCE_NODES,
        rebalanceConfig
      );

      return {
        rebalance_id: response.rebalance_id || `rebalance_${Date.now()}`,
        estimated_duration: response.estimated_duration || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error rebalancing nodes:', error);
      throw new Error(`Failed to rebalance nodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Partitioning ====================

  /**
   * Create cache partition
   */
  async createPartition(
    partitionConfig: {
      partition_id: string;
      key_range: { start: string; end: string };
      replication_factor?: number;
      nodes?: string[];
    }
  ): Promise<CachePartition> {
    try {
      const response = await this.apiClient.post<CachePartition>(
        ENDPOINTS.CREATE_PARTITION,
        partitionConfig
      );

      return {
        ...response,
        partition_id: response.partition_id || partitionConfig.partition_id,
        status: response.status || 'creating',
        creation_timestamp: response.creation_timestamp || new Date().toISOString(),
        size: response.size || 0
      };
    } catch (error) {
      console.error('Error creating partition:', error);
      throw new Error(`Failed to create partition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Merge cache partitions
   */
  async mergePartitions(
    sourcePartitionIds: string[],
    targetPartitionId: string
  ): Promise<{ merge_id: string; estimated_duration: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ merge_id: string; estimated_duration: number; timestamp: string }>(
        ENDPOINTS.MERGE_PARTITIONS,
        {
          source_partitions: sourcePartitionIds,
          target_partition: targetPartitionId
        }
      );

      return {
        merge_id: response.merge_id || `merge_${Date.now()}`,
        estimated_duration: response.estimated_duration || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error merging partitions:', error);
      throw new Error(`Failed to merge partitions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Split cache partition
   */
  async splitPartition(
    partitionId: string,
    splitConfig: {
      split_key: string;
      new_partition_id: string;
    }
  ): Promise<{ split_id: string; new_partitions: string[]; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ split_id: string; new_partitions: string[]; timestamp: string }>(
        `${ENDPOINTS.SPLIT_PARTITION}/${partitionId}`,
        splitConfig
      );

      return {
        split_id: response.split_id || `split_${Date.now()}`,
        new_partitions: response.new_partitions || [],
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error splitting partition:', error);
      throw new Error(`Failed to split partition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get partition information
   */
  async getPartitionInfo(
    partitionId?: string
  ): Promise<CachePartition[]> {
    try {
      const response = await this.apiClient.get<CachePartition[]>(
        ENDPOINTS.GET_PARTITION_INFO,
        { params: { partition_id: partitionId } }
      );

      return response.map(partition => ({
        ...partition,
        last_updated: partition.last_updated || new Date().toISOString(),
        entry_count: partition.entry_count || 0,
        size_bytes: partition.size_bytes || 0
      }));
    } catch (error) {
      console.error('Error getting partition info:', error);
      throw new Error(`Failed to get partition info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Synchronization ====================

  /**
   * Synchronize cache nodes
   */
  async synchronizeCacheNodes(
    syncConfig?: {
      nodes?: string[];
      sync_type: 'full' | 'incremental' | 'conflict_resolution';
      priority?: 'high' | 'normal' | 'low';
    }
  ): Promise<CacheSynchronization> {
    try {
      const response = await this.apiClient.post<CacheSynchronization>(
        ENDPOINTS.SYNC_CACHE_NODES,
        syncConfig
      );

      return {
        ...response,
        sync_id: response.sync_id || `sync_${Date.now()}`,
        status: response.status || 'initiated',
        start_timestamp: response.start_timestamp || new Date().toISOString(),
        progress_percentage: response.progress_percentage || 0
      };
    } catch (error) {
      console.error('Error synchronizing cache nodes:', error);
      throw new Error(`Failed to synchronize cache nodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resolve cache conflicts
   */
  async resolveCacheConflicts(
    conflictResolution: {
      strategy: 'latest_wins' | 'merge' | 'manual';
      conflicts?: Array<{
        key: string;
        resolution: 'keep_local' | 'keep_remote' | 'merge';
      }>;
    }
  ): Promise<{ resolved_conflicts: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ resolved_conflicts: number; timestamp: string }>(
        ENDPOINTS.RESOLVE_CONFLICTS,
        conflictResolution
      );

      return {
        resolved_conflicts: response.resolved_conflicts || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error resolving cache conflicts:', error);
      throw new Error(`Failed to resolve cache conflicts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get synchronization status
   */
  async getSynchronizationStatus(
    syncId?: string
  ): Promise<CacheSynchronization[]> {
    try {
      const response = await this.apiClient.get<CacheSynchronization[]>(
        ENDPOINTS.GET_SYNC_STATUS,
        { params: { sync_id: syncId } }
      );

      return response.map(sync => ({
        ...sync,
        status_timestamp: sync.status_timestamp || new Date().toISOString(),
        estimated_completion: sync.estimated_completion || null,
        errors: sync.errors || []
      }));
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw new Error(`Failed to get sync status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Force cache synchronization
   */
  async forceSynchronization(
    nodes: string[],
    options?: { override_conflicts?: boolean; priority?: 'high' | 'critical' }
  ): Promise<{ sync_id: string; force_applied: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ sync_id: string; force_applied: boolean; timestamp: string }>(
        ENDPOINTS.FORCE_SYNC,
        { nodes, options }
      );

      return {
        sync_id: response.sync_id || `force_sync_${Date.now()}`,
        force_applied: response.force_applied || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error forcing synchronization:', error);
      throw new Error(`Failed to force synchronization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Performance Monitoring ====================

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    metricsRequest?: {
      metrics: string[];
      timeRange?: { start: string; end: string };
      granularity?: string;
    }
  ): Promise<CachePerformance> {
    try {
      const response = await this.apiClient.get<CachePerformance>(
        ENDPOINTS.GET_PERFORMANCE_METRICS,
        { params: metricsRequest }
      );

      return {
        ...response,
        performance_id: response.performance_id || `perf_${Date.now()}`,
        collection_timestamp: response.collection_timestamp || new Date().toISOString(),
        throughput_ops_per_sec: response.throughput_ops_per_sec || 0,
        latency_avg_ms: response.latency_avg_ms || 0
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cache analytics
   */
  async getCacheAnalytics(
    analyticsRequest?: {
      analysis_type: string;
      timeRange?: { start: string; end: string };
    }
  ): Promise<CacheAnalytics> {
    try {
      const response = await this.apiClient.get<CacheAnalytics>(
        ENDPOINTS.GET_CACHE_ANALYTICS,
        { params: analyticsRequest }
      );

      return {
        ...response,
        analytics_id: response.analytics_id || `analytics_${Date.now()}`,
        analysis_timestamp: response.analysis_timestamp || new Date().toISOString(),
        insights: response.insights || [],
        recommendations: response.recommendations || []
      };
    } catch (error) {
      console.error('Error getting cache analytics:', error);
      throw new Error(`Failed to get cache analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get optimization suggestions
   */
  async getOptimizationSuggestions(
    optimizationScope?: string
  ): Promise<Record<string, any>[]> {
    try {
      const response = await this.apiClient.get<Record<string, any>[]>(
        ENDPOINTS.GET_OPTIMIZATION_SUGGESTIONS,
        { params: { scope: optimizationScope } }
      );

      return response.map(suggestion => ({
        ...suggestion,
        suggestion_id: suggestion.suggestion_id || `opt_${Date.now()}_${Math.random()}`,
        priority: suggestion.priority || 'medium',
        expected_impact: suggestion.expected_impact || 0,
        generated_timestamp: suggestion.generated_timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting optimization suggestions:', error);
      throw new Error(`Failed to get optimization suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Benchmark cache performance
   */
  async benchmarkCache(
    benchmarkConfig: {
      test_type: 'read' | 'write' | 'mixed';
      duration_seconds: number;
      concurrency: number;
      data_size?: number;
    }
  ): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.post<Record<string, any>>(
        ENDPOINTS.BENCHMARK_CACHE,
        benchmarkConfig
      );

      return {
        ...response,
        benchmark_id: response.benchmark_id || `benchmark_${Date.now()}`,
        test_timestamp: response.test_timestamp || new Date().toISOString(),
        throughput: response.throughput || 0,
        latency_percentiles: response.latency_percentiles || {}
      };
    } catch (error) {
      console.error('Error benchmarking cache:', error);
      throw new Error(`Failed to benchmark cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Replication ====================

  /**
   * Configure cache replication
   */
  async configureReplication(
    replicationConfig: {
      replication_factor: number;
      strategy: 'sync' | 'async' | 'hybrid';
      regions?: string[];
      consistency_level?: 'strong' | 'eventual' | 'weak';
    }
  ): Promise<CacheReplication> {
    try {
      const response = await this.apiClient.post<CacheReplication>(
        ENDPOINTS.CONFIGURE_REPLICATION,
        replicationConfig
      );

      return {
        ...response,
        replication_id: response.replication_id || `repl_${Date.now()}`,
        status: response.status || 'configuring',
        configuration_timestamp: response.configuration_timestamp || new Date().toISOString(),
        active_replicas: response.active_replicas || 0
      };
    } catch (error) {
      console.error('Error configuring replication:', error);
      throw new Error(`Failed to configure replication: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get replication status
   */
  async getReplicationStatus(): Promise<CacheReplication[]> {
    try {
      const response = await this.apiClient.get<CacheReplication[]>(
        ENDPOINTS.GET_REPLICATION_STATUS
      );

      return response.map(replication => ({
        ...replication,
        status_timestamp: replication.status_timestamp || new Date().toISOString(),
        lag_seconds: replication.lag_seconds || 0,
        sync_percentage: replication.sync_percentage || 0
      }));
    } catch (error) {
      console.error('Error getting replication status:', error);
      throw new Error(`Failed to get replication status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Failover to replica
   */
  async failoverToReplica(
    primaryNodeId: string,
    replicaNodeId: string,
    force: boolean = false
  ): Promise<{ failover_id: string; success: boolean; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ failover_id: string; success: boolean; timestamp: string }>(
        ENDPOINTS.FAILOVER_REPLICA,
        {
          primary_node: primaryNodeId,
          replica_node: replicaNodeId,
          force
        }
      );

      return {
        failover_id: response.failover_id || `failover_${Date.now()}`,
        success: response.success || false,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error failing over to replica:', error);
      throw new Error(`Failed to failover to replica: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore replica
   */
  async restoreReplica(
    replicaNodeId: string,
    restoreConfig?: {
      source: 'primary' | 'backup';
      point_in_time?: string;
    }
  ): Promise<{ restore_id: string; estimated_duration: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ restore_id: string; estimated_duration: number; timestamp: string }>(
        `${ENDPOINTS.RESTORE_REPLICA}/${replicaNodeId}`,
        restoreConfig
      );

      return {
        restore_id: response.restore_id || `restore_${Date.now()}`,
        estimated_duration: response.estimated_duration || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error restoring replica:', error);
      throw new Error(`Failed to restore replica: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Advanced Features ====================

  /**
   * Enable cache compression
   */
  async enableCompression(
    compressionConfig: {
      algorithm: 'gzip' | 'lz4' | 'snappy';
      level?: number;
      threshold_bytes?: number;
    }
  ): Promise<{ success: boolean; compression_ratio: number; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ success: boolean; compression_ratio: number; timestamp: string }>(
        ENDPOINTS.ENABLE_COMPRESSION,
        compressionConfig
      );

      return {
        success: response.success || false,
        compression_ratio: response.compression_ratio || 0,
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error enabling compression:', error);
      throw new Error(`Failed to enable compression: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Configure cache encryption
   */
  async configureEncryption(
    encryptionConfig: {
      algorithm: 'AES-256' | 'ChaCha20';
      key_rotation_interval?: number;
      encrypt_in_transit?: boolean;
      encrypt_at_rest?: boolean;
    }
  ): Promise<{ success: boolean; encryption_status: string; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ success: boolean; encryption_status: string; timestamp: string }>(
        ENDPOINTS.CONFIGURE_ENCRYPTION,
        encryptionConfig
      );

      return {
        success: response.success || false,
        encryption_status: response.encryption_status || 'disabled',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error configuring encryption:', error);
      throw new Error(`Failed to configure encryption: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set eviction policy
   */
  async setEvictionPolicy(
    evictionConfig: {
      policy: 'lru' | 'lfu' | 'fifo' | 'ttl' | 'adaptive';
      parameters?: Record<string, any>;
    }
  ): Promise<CacheEvictionPolicy> {
    try {
      const response = await this.apiClient.post<CacheEvictionPolicy>(
        ENDPOINTS.SET_EVICTION_POLICY,
        evictionConfig
      );

      return {
        ...response,
        policy_id: response.policy_id || `policy_${Date.now()}`,
        configuration_timestamp: response.configuration_timestamp || new Date().toISOString(),
        status: response.status || 'active'
      };
    } catch (error) {
      console.error('Error setting eviction policy:', error);
      throw new Error(`Failed to set eviction policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Configure TTL settings
   */
  async configureTTL(
    ttlConfig: {
      default_ttl_seconds: number;
      max_ttl_seconds?: number;
      ttl_precision?: 'seconds' | 'milliseconds';
      auto_extend?: boolean;
    }
  ): Promise<{ success: boolean; ttl_settings: Record<string, any>; timestamp: string }> {
    try {
      const response = await this.apiClient.post<{ success: boolean; ttl_settings: Record<string, any>; timestamp: string }>(
        ENDPOINTS.CONFIGURE_TTL,
        ttlConfig
      );

      return {
        success: response.success || false,
        ttl_settings: response.ttl_settings || {},
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error configuring TTL:', error);
      throw new Error(`Failed to configure TTL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Health check for caching service
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; services: Record<string, string> }> {
    try {
      const response = await this.apiClient.get<{ status: string; timestamp: string; services: Record<string, string> }>(
        `${API_BASE}/health`
      );

      return {
        status: response.status || 'unknown',
        timestamp: response.timestamp || new Date().toISOString(),
        services: response.services || {}
      };
    } catch (error) {
      console.error('Error checking caching service health:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: { distributed_caching: 'error' }
      };
    }
  }

  /**
   * Get service capabilities
   */
  async getServiceCapabilities(): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.get<Record<string, any>>(
        `${API_BASE}/capabilities`
      );

      return {
        ...response,
        capabilities_timestamp: response.capabilities_timestamp || new Date().toISOString(),
        supported_features: response.supported_features || [],
        service_version: response.service_version || '1.0.0'
      };
    } catch (error) {
      console.error('Error getting caching service capabilities:', error);
      throw new Error(`Failed to get caching service capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const distributedCachingAPI = new DistributedCachingAPIService();

// Export individual methods for tree-shaking
export const {
  initializeDistributedCache,
  configureCacheSettings,
  destroyCache,
  resetCache,
  putCacheEntry,
  getCacheEntry,
  deleteCacheEntry,
  batchCacheOperations,
  getCacheStatistics,
  getCacheHealth,
  flushCache,
  compactCache,
  addCacheNode,
  removeCacheNode,
  getNodeStatus,
  rebalanceNodes,
  createPartition,
  mergePartitions,
  splitPartition,
  getPartitionInfo,
  synchronizeCacheNodes,
  resolveCacheConflicts,
  getSynchronizationStatus,
  forceSynchronization,
  getPerformanceMetrics,
  getCacheAnalytics,
  getOptimizationSuggestions,
  benchmarkCache,
  configureReplication,
  getReplicationStatus,
  failoverToReplica,
  restoreReplica,
  enableCompression,
  configureEncryption,
  setEvictionPolicy,
  configureTTL,
  healthCheck,
  getServiceCapabilities
} = distributedCachingAPI;

export default distributedCachingAPI;