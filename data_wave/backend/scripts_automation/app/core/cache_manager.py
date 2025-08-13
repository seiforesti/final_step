"""
Enterprise Cache Manager

Centralized cache management system for coordinating multiple cache instances,
implementing advanced caching strategies, and providing enterprise-grade
cache orchestration for the Data Governance Platform.
"""

import asyncio
import json
import time
from typing import Dict, Any, Optional, List, Union, Callable, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import threading
import weakref
import logging
from collections import defaultdict, OrderedDict

from ..utils.cache import EnterpriseCache, CacheConfig, CacheStrategy
from .config import settings

logger = logging.getLogger(__name__)

class CacheRegion(Enum):
    """Cache regions for different data types."""
    USER_DATA = "user_data"
    SCAN_RESULTS = "scan_results"
    CLASSIFICATION_DATA = "classification_data"
    LINEAGE_DATA = "lineage_data"
    COMPLIANCE_DATA = "compliance_data"
    ANALYTICS_DATA = "analytics_data"
    AI_MODEL_CACHE = "ai_model_cache"
    METADATA_CACHE = "metadata_cache"
    SESSION_DATA = "session_data"
    TEMPORARY_DATA = "temporary_data"

class CacheLevel(Enum):
    """Cache performance levels."""
    L1_MEMORY = "l1_memory"     # Fastest, smallest
    L2_REDIS = "l2_redis"       # Fast, medium
    L3_DATABASE = "l3_database" # Slower, largest

@dataclass
class CacheMetrics:
    """Cache metrics for monitoring and optimization."""
    region: str
    hit_rate: float = 0.0
    miss_rate: float = 0.0
    total_requests: int = 0
    avg_response_time: float = 0.0
    memory_usage: int = 0
    eviction_count: int = 0
    error_count: int = 0
    last_updated: datetime = field(default_factory=datetime.now)

@dataclass
class CachePolicy:
    """Cache policy configuration."""
    ttl_seconds: int
    max_size: int
    strategy: CacheStrategy
    region: CacheRegion
    priority: int = 1
    enable_compression: bool = False
    enable_encryption: bool = False
    backup_levels: List[CacheLevel] = field(default_factory=list)

class EnterpriseCacheManager:
    """
    Enterprise cache manager for coordinating multiple cache instances.
    
    Features:
    - Multi-level cache hierarchy (L1 Memory -> L2 Redis -> L3 Database)
    - Region-based cache management
    - Advanced cache policies and strategies
    - Intelligent cache warming and preloading
    - Cache analytics and optimization
    - Cross-cache invalidation
    - Distributed cache coordination
    - Performance monitoring and alerting
    """
    
    def __init__(self):
        # Cache instances by region and level
        self._cache_instances: Dict[str, Dict[str, EnterpriseCache]] = {}
        self._cache_policies: Dict[CacheRegion, CachePolicy] = {}
        self._cache_metrics: Dict[str, CacheMetrics] = {}
        
        # Coordination and monitoring
        self._invalidation_patterns: Dict[str, Set[str]] = defaultdict(set)
        self._dependency_graph: Dict[str, Set[str]] = defaultdict(set)
        self._warming_tasks: Dict[str, asyncio.Task] = {}
        self._metrics_lock = threading.Lock()
        
        # Performance tracking
        self._performance_history: Dict[str, List[float]] = defaultdict(list)
        self._optimization_suggestions: List[str] = []
        
        # Initialize default policies
        self._setup_default_policies()
        self._initialize_cache_instances()
        
        # Start background tasks
        self._start_monitoring_tasks()
    
    def _setup_default_policies(self):
        """Setup default cache policies for different regions."""
        self._cache_policies = {
            CacheRegion.USER_DATA: CachePolicy(
                ttl_seconds=3600,  # 1 hour
                max_size=10000,
                strategy=CacheStrategy.LRU,
                region=CacheRegion.USER_DATA,
                priority=2,
                backup_levels=[CacheLevel.L2_REDIS]
            ),
            CacheRegion.SCAN_RESULTS: CachePolicy(
                ttl_seconds=7200,  # 2 hours
                max_size=5000,
                strategy=CacheStrategy.LFU,
                region=CacheRegion.SCAN_RESULTS,
                priority=3,
                enable_compression=True,
                backup_levels=[CacheLevel.L2_REDIS, CacheLevel.L3_DATABASE]
            ),
            CacheRegion.CLASSIFICATION_DATA: CachePolicy(
                ttl_seconds=14400,  # 4 hours
                max_size=8000,
                strategy=CacheStrategy.LRU,
                region=CacheRegion.CLASSIFICATION_DATA,
                priority=2,
                backup_levels=[CacheLevel.L2_REDIS]
            ),
            CacheRegion.LINEAGE_DATA: CachePolicy(
                ttl_seconds=10800,  # 3 hours
                max_size=6000,
                strategy=CacheStrategy.LFU,
                region=CacheRegion.LINEAGE_DATA,
                priority=3,
                enable_compression=True,
                backup_levels=[CacheLevel.L2_REDIS, CacheLevel.L3_DATABASE]
            ),
            CacheRegion.COMPLIANCE_DATA: CachePolicy(
                ttl_seconds=21600,  # 6 hours
                max_size=4000,
                strategy=CacheStrategy.TTL,
                region=CacheRegion.COMPLIANCE_DATA,
                priority=1,
                backup_levels=[CacheLevel.L2_REDIS, CacheLevel.L3_DATABASE]
            ),
            CacheRegion.ANALYTICS_DATA: CachePolicy(
                ttl_seconds=1800,  # 30 minutes
                max_size=3000,
                strategy=CacheStrategy.LRU,
                region=CacheRegion.ANALYTICS_DATA,
                priority=2,
                enable_compression=True,
                backup_levels=[CacheLevel.L2_REDIS]
            ),
            CacheRegion.AI_MODEL_CACHE: CachePolicy(
                ttl_seconds=86400,  # 24 hours
                max_size=100,
                strategy=CacheStrategy.LFU,
                region=CacheRegion.AI_MODEL_CACHE,
                priority=1,
                enable_compression=True,
                backup_levels=[CacheLevel.L2_REDIS, CacheLevel.L3_DATABASE]
            ),
            CacheRegion.METADATA_CACHE: CachePolicy(
                ttl_seconds=7200,  # 2 hours
                max_size=15000,
                strategy=CacheStrategy.LRU,
                region=CacheRegion.METADATA_CACHE,
                priority=2,
                backup_levels=[CacheLevel.L2_REDIS]
            ),
            CacheRegion.SESSION_DATA: CachePolicy(
                ttl_seconds=3600,  # 1 hour
                max_size=20000,
                strategy=CacheStrategy.TTL,
                region=CacheRegion.SESSION_DATA,
                priority=1,
                backup_levels=[CacheLevel.L2_REDIS]
            ),
            CacheRegion.TEMPORARY_DATA: CachePolicy(
                ttl_seconds=300,  # 5 minutes
                max_size=5000,
                strategy=CacheStrategy.LRU,
                region=CacheRegion.TEMPORARY_DATA,
                priority=3
            )
        }
    
    def _initialize_cache_instances(self):
        """Initialize cache instances for each region and level."""
        for region, policy in self._cache_policies.items():
            region_name = region.value
            self._cache_instances[region_name] = {}
            
            # L1 Memory cache (always enabled)
            l1_config = CacheConfig(
                ttl_seconds=policy.ttl_seconds,
                max_size=policy.max_size,
                strategy=policy.strategy,
                compression=policy.enable_compression,
                enable_stats=True
            )
            
            self._cache_instances[region_name][CacheLevel.L1_MEMORY.value] = EnterpriseCache(
                namespace=f"l1_{region_name}",
                default_config=l1_config,
                enable_l1_cache=True
            )
            
            # L2 Redis cache (if in backup levels)
            if CacheLevel.L2_REDIS in policy.backup_levels:
                l2_config = CacheConfig(
                    ttl_seconds=policy.ttl_seconds * 2,  # Longer TTL for L2
                    max_size=policy.max_size * 2,
                    strategy=policy.strategy,
                    compression=policy.enable_compression,
                    enable_stats=True
                )
                
                self._cache_instances[region_name][CacheLevel.L2_REDIS.value] = EnterpriseCache(
                    namespace=f"l2_{region_name}",
                    default_config=l2_config,
                    enable_l1_cache=False
                )
            
            # Initialize metrics
            self._cache_metrics[region_name] = CacheMetrics(region=region_name)
    
    def _start_monitoring_tasks(self):
        """Start background monitoring and optimization tasks."""
        def monitoring_loop():
            while True:
                try:
                    self._collect_metrics()
                    self._analyze_performance()
                    self._optimize_cache_policies()
                    time.sleep(60)  # Run every minute
                except Exception as e:
                    logger.error(f"Cache monitoring error: {e}")
                    time.sleep(30)
        
        def cleanup_loop():
            while True:
                try:
                    self._cleanup_expired_data()
                    self._rebalance_cache_sizes()
                    time.sleep(300)  # Run every 5 minutes
                except Exception as e:
                    logger.error(f"Cache cleanup error: {e}")
                    time.sleep(60)
        
        monitoring_thread = threading.Thread(target=monitoring_loop, daemon=True)
        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        
        monitoring_thread.start()
        cleanup_thread.start()
        
        logger.info("Started cache monitoring and cleanup tasks")
    
    async def get(
        self,
        key: str,
        region: CacheRegion = CacheRegion.TEMPORARY_DATA,
        default: Any = None,
        levels: Optional[List[CacheLevel]] = None
    ) -> Any:
        """
        Get value from cache with multi-level fallback.
        
        Args:
            key: Cache key
            region: Cache region
            default: Default value if not found
            levels: Specific cache levels to check (optional)
            
        Returns:
            Cached value or default
        """
        start_time = time.time()
        region_name = region.value
        
        try:
            # Determine cache levels to check
            if levels is None:
                policy = self._cache_policies.get(region)
                check_levels = [CacheLevel.L1_MEMORY]
                if policy and policy.backup_levels:
                    check_levels.extend(policy.backup_levels)
            else:
                check_levels = levels
            
            # Try each cache level in order
            for level in check_levels:
                level_name = level.value
                cache_instances = self._cache_instances.get(region_name, {})
                cache_instance = cache_instances.get(level_name)
                
                if cache_instance:
                    value = await cache_instance.get(key, default=None)
                    if value is not None:
                        # Update metrics
                        self._record_cache_hit(region_name, level_name, time.time() - start_time)
                        
                        # Promote to higher levels if not L1
                        if level != CacheLevel.L1_MEMORY:
                            await self._promote_to_higher_levels(key, value, region, level)
                        
                        return value
            
            # Cache miss across all levels
            self._record_cache_miss(region_name, time.time() - start_time)
            return default
            
        except Exception as e:
            logger.error(f"Cache get error for {region_name}:{key}: {e}")
            self._record_cache_error(region_name)
            return default
    
    async def set(
        self,
        key: str,
        value: Any,
        region: CacheRegion = CacheRegion.TEMPORARY_DATA,
        ttl: Optional[int] = None,
        levels: Optional[List[CacheLevel]] = None
    ) -> bool:
        """
        Set value in cache across specified levels.
        
        Args:
            key: Cache key
            value: Value to cache
            region: Cache region
            ttl: Time to live (overrides policy default)
            levels: Specific cache levels to set (optional)
            
        Returns:
            True if successful
        """
        region_name = region.value
        success = True
        
        try:
            # Determine cache levels to set
            if levels is None:
                policy = self._cache_policies.get(region)
                set_levels = [CacheLevel.L1_MEMORY]
                if policy and policy.backup_levels:
                    set_levels.extend(policy.backup_levels)
            else:
                set_levels = levels
            
            # Set in all specified levels
            for level in set_levels:
                level_name = level.value
                cache_instances = self._cache_instances.get(region_name, {})
                cache_instance = cache_instances.get(level_name)
                
                if cache_instance:
                    level_success = await cache_instance.set(key, value, ttl=ttl)
                    success = success and level_success
            
            # Handle cache dependencies and invalidation
            await self._handle_cache_dependencies(key, region)
            
            self._record_cache_set(region_name)
            return success
            
        except Exception as e:
            logger.error(f"Cache set error for {region_name}:{key}: {e}")
            self._record_cache_error(region_name)
            return False
    
    async def delete(
        self,
        key: str,
        region: CacheRegion = CacheRegion.TEMPORARY_DATA,
        levels: Optional[List[CacheLevel]] = None
    ) -> bool:
        """Delete key from cache across specified levels."""
        region_name = region.value
        success = True
        
        try:
            # Determine cache levels to delete from
            if levels is None:
                policy = self._cache_policies.get(region)
                delete_levels = [CacheLevel.L1_MEMORY]
                if policy and policy.backup_levels:
                    delete_levels.extend(policy.backup_levels)
            else:
                delete_levels = levels
            
            # Delete from all specified levels
            for level in delete_levels:
                level_name = level.value
                cache_instances = self._cache_instances.get(region_name, {})
                cache_instance = cache_instances.get(level_name)
                
                if cache_instance:
                    level_success = await cache_instance.delete(key)
                    success = success and level_success
            
            # Handle dependent cache invalidation
            await self._invalidate_dependencies(key, region)
            
            return success
            
        except Exception as e:
            logger.error(f"Cache delete error for {region_name}:{key}: {e}")
            self._record_cache_error(region_name)
            return False
    
    async def clear_region(self, region: CacheRegion) -> bool:
        """Clear all cache data for a specific region."""
        region_name = region.value
        success = True
        
        try:
            cache_instances = self._cache_instances.get(region_name, {})
            
            for level_name, cache_instance in cache_instances.items():
                if cache_instance:
                    # Clear all keys with region pattern
                    pattern_success = await cache_instance.clear_pattern("*")
                    success = success and (pattern_success >= 0)
            
            logger.info(f"Cleared cache region: {region_name}")
            return success
            
        except Exception as e:
            logger.error(f"Failed to clear cache region {region_name}: {e}")
            return False
    
    async def warm_cache(
        self,
        region: CacheRegion,
        warm_func: Callable,
        keys: Optional[List[str]] = None
    ) -> int:
        """Warm cache for a specific region using a warming function."""
        region_name = region.value
        warmed_count = 0
        
        try:
            keys_to_warm = keys or []
            
            # If no specific keys provided, use a general warming approach
            if not keys_to_warm and hasattr(warm_func, '__call__'):
                # Call warming function to get keys and values
                if asyncio.iscoroutinefunction(warm_func):
                    warm_data = await warm_func()
                else:
                    warm_data = warm_func()
                
                if isinstance(warm_data, dict):
                    for key, value in warm_data.items():
                        await self.set(key, value, region)
                        warmed_count += 1
            else:
                # Warm specific keys
                for key in keys_to_warm:
                    try:
                        if asyncio.iscoroutinefunction(warm_func):
                            value = await warm_func(key)
                        else:
                            value = warm_func(key)
                        
                        if value is not None:
                            await self.set(key, value, region)
                            warmed_count += 1
                    except Exception as e:
                        logger.error(f"Cache warming error for key {key}: {e}")
            
            logger.info(f"Warmed {warmed_count} keys for region {region_name}")
            return warmed_count
            
        except Exception as e:
            logger.error(f"Cache warming failed for region {region_name}: {e}")
            return 0
    
    def add_invalidation_dependency(self, source_key: str, dependent_pattern: str, region: CacheRegion):
        """Add invalidation dependency between cache keys."""
        region_name = region.value
        full_source_key = f"{region_name}:{source_key}"
        self._dependency_graph[full_source_key].add(dependent_pattern)
        self._invalidation_patterns[dependent_pattern].add(full_source_key)
        
        logger.debug(f"Added invalidation dependency: {full_source_key} -> {dependent_pattern}")
    
    async def _promote_to_higher_levels(
        self,
        key: str,
        value: Any,
        region: CacheRegion,
        found_level: CacheLevel
    ):
        """Promote cache value to higher (faster) cache levels."""
        try:
            region_name = region.value
            policy = self._cache_policies.get(region)
            
            if not policy:
                return
            
            # Determine which levels to promote to
            all_levels = [CacheLevel.L1_MEMORY] + policy.backup_levels
            promote_to_levels = []
            
            for level in all_levels:
                if level == found_level:
                    break
                promote_to_levels.append(level)
            
            # Promote to higher levels
            for level in promote_to_levels:
                level_name = level.value
                cache_instances = self._cache_instances.get(region_name, {})
                cache_instance = cache_instances.get(level_name)
                
                if cache_instance:
                    await cache_instance.set(key, value)
            
            if promote_to_levels:
                logger.debug(f"Promoted {key} to levels: {[l.value for l in promote_to_levels]}")
                
        except Exception as e:
            logger.error(f"Cache promotion error: {e}")
    
    async def _handle_cache_dependencies(self, key: str, region: CacheRegion):
        """Handle cache dependencies and invalidation patterns."""
        try:
            region_name = region.value
            full_key = f"{region_name}:{key}"
            
            # Check for any patterns that should be invalidated
            dependent_patterns = self._dependency_graph.get(full_key, set())
            
            for pattern in dependent_patterns:
                await self._invalidate_pattern(pattern, region)
                
        except Exception as e:
            logger.error(f"Cache dependency handling error: {e}")
    
    async def _invalidate_dependencies(self, key: str, region: CacheRegion):
        """Invalidate dependent cache entries."""
        try:
            region_name = region.value
            full_key = f"{region_name}:{key}"
            
            # Find and invalidate dependent patterns
            dependent_patterns = self._dependency_graph.get(full_key, set())
            
            for pattern in dependent_patterns:
                await self._invalidate_pattern(pattern, region)
                
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
    
    async def _invalidate_pattern(self, pattern: str, region: CacheRegion):
        """Invalidate cache entries matching a pattern."""
        try:
            region_name = region.value
            cache_instances = self._cache_instances.get(region_name, {})
            
            for level_name, cache_instance in cache_instances.items():
                if cache_instance:
                    await cache_instance.clear_pattern(pattern)
            
            logger.debug(f"Invalidated pattern {pattern} in region {region_name}")
            
        except Exception as e:
            logger.error(f"Pattern invalidation error: {e}")
    
    def _record_cache_hit(self, region: str, level: str, response_time: float):
        """Record cache hit metrics."""
        with self._metrics_lock:
            metrics = self._cache_metrics.get(region)
            if metrics:
                metrics.total_requests += 1
                
                # Update hit rate
                hit_rate = (metrics.hit_rate * (metrics.total_requests - 1) + 100) / metrics.total_requests
                metrics.hit_rate = hit_rate
                metrics.miss_rate = 100 - hit_rate
                
                # Update response time
                total_time = metrics.avg_response_time * (metrics.total_requests - 1) + response_time
                metrics.avg_response_time = total_time / metrics.total_requests
                
                metrics.last_updated = datetime.now()
                
                # Track performance history
                self._performance_history[f"{region}_{level}"].append(response_time)
                if len(self._performance_history[f"{region}_{level}"]) > 1000:
                    self._performance_history[f"{region}_{level}"] = self._performance_history[f"{region}_{level}"][-1000:]
    
    def _record_cache_miss(self, region: str, response_time: float):
        """Record cache miss metrics."""
        with self._metrics_lock:
            metrics = self._cache_metrics.get(region)
            if metrics:
                metrics.total_requests += 1
                
                # Update miss rate
                miss_rate = (metrics.miss_rate * (metrics.total_requests - 1) + 100) / metrics.total_requests
                metrics.miss_rate = miss_rate
                metrics.hit_rate = 100 - miss_rate
                
                # Update response time
                total_time = metrics.avg_response_time * (metrics.total_requests - 1) + response_time
                metrics.avg_response_time = total_time / metrics.total_requests
                
                metrics.last_updated = datetime.now()
    
    def _record_cache_set(self, region: str):
        """Record cache set operation."""
        with self._metrics_lock:
            metrics = self._cache_metrics.get(region)
            if metrics:
                # Cache set operations don't affect hit/miss rates directly
                metrics.last_updated = datetime.now()
    
    def _record_cache_error(self, region: str):
        """Record cache error."""
        with self._metrics_lock:
            metrics = self._cache_metrics.get(region)
            if metrics:
                metrics.error_count += 1
                metrics.last_updated = datetime.now()
    
    def _collect_metrics(self):
        """Collect detailed cache metrics from all instances."""
        try:
            for region_name, cache_instances in self._cache_instances.items():
                total_memory = 0
                total_evictions = 0
                
                for level_name, cache_instance in cache_instances.items():
                    if cache_instance:
                        instance_stats = cache_instance.get_stats()
                        if hasattr(instance_stats, 'total_size'):
                            total_memory += instance_stats.total_size
                        if hasattr(instance_stats, 'evictions'):
                            total_evictions += instance_stats.evictions
                
                with self._metrics_lock:
                    metrics = self._cache_metrics.get(region_name)
                    if metrics:
                        metrics.memory_usage = total_memory
                        metrics.eviction_count = total_evictions
                        
        except Exception as e:
            logger.error(f"Metrics collection error: {e}")
    
    def _analyze_performance(self):
        """Analyze cache performance and generate optimization suggestions."""
        try:
            self._optimization_suggestions.clear()
            
            with self._metrics_lock:
                for region_name, metrics in self._cache_metrics.items():
                    # Check hit rate
                    if metrics.hit_rate < 70 and metrics.total_requests > 100:
                        self._optimization_suggestions.append(
                            f"Low hit rate ({metrics.hit_rate:.1f}%) for region {region_name}. "
                            f"Consider increasing cache size or TTL."
                        )
                    
                    # Check response time
                    if metrics.avg_response_time > 0.1:  # 100ms
                        self._optimization_suggestions.append(
                            f"Slow cache response ({metrics.avg_response_time:.3f}s) for region {region_name}. "
                            f"Consider optimizing cache configuration."
                        )
                    
                    # Check error rate
                    error_rate = (metrics.error_count / max(metrics.total_requests, 1)) * 100
                    if error_rate > 5:  # More than 5% errors
                        self._optimization_suggestions.append(
                            f"High error rate ({error_rate:.1f}%) for region {region_name}. "
                            f"Check cache infrastructure and configuration."
                        )
            
            # Log optimization suggestions
            if self._optimization_suggestions:
                for suggestion in self._optimization_suggestions[:3]:  # Log top 3
                    logger.warning(f"Cache optimization suggestion: {suggestion}")
                    
        except Exception as e:
            logger.error(f"Performance analysis error: {e}")
    
    def _optimize_cache_policies(self):
        """Optimize cache policies based on performance metrics."""
        try:
            for region, policy in self._cache_policies.items():
                region_name = region.value
                metrics = self._cache_metrics.get(region_name)
                
                if not metrics or metrics.total_requests < 100:
                    continue
                
                # Adjust TTL based on hit rate
                if metrics.hit_rate < 60:
                    # Low hit rate, try increasing TTL
                    new_ttl = min(policy.ttl_seconds * 1.2, 86400)  # Max 24 hours
                    if new_ttl != policy.ttl_seconds:
                        policy.ttl_seconds = int(new_ttl)
                        logger.info(f"Increased TTL for {region_name} to {policy.ttl_seconds}s")
                
                elif metrics.hit_rate > 90 and metrics.memory_usage > policy.max_size * 0.8:
                    # High hit rate but high memory usage, try decreasing TTL
                    new_ttl = max(policy.ttl_seconds * 0.8, 300)  # Min 5 minutes
                    if new_ttl != policy.ttl_seconds:
                        policy.ttl_seconds = int(new_ttl)
                        logger.info(f"Decreased TTL for {region_name} to {policy.ttl_seconds}s")
                
                # Adjust cache size based on eviction rate
                if metrics.eviction_count > metrics.total_requests * 0.1:
                    # High eviction rate, try increasing cache size
                    new_size = min(policy.max_size * 1.2, 50000)  # Max 50k entries
                    if new_size != policy.max_size:
                        policy.max_size = int(new_size)
                        logger.info(f"Increased cache size for {region_name} to {policy.max_size}")
                        
        except Exception as e:
            logger.error(f"Cache policy optimization error: {e}")
    
    def _cleanup_expired_data(self):
        """Clean up expired data across all cache instances."""
        try:
            for region_name, cache_instances in self._cache_instances.items():
                for level_name, cache_instance in cache_instances.items():
                    if cache_instance and hasattr(cache_instance, '_cleanup_expired_keys'):
                        cache_instance._cleanup_expired_keys()
        except Exception as e:
            logger.error(f"Cache cleanup error: {e}")
    
    def _rebalance_cache_sizes(self):
        """Rebalance cache sizes based on usage patterns."""
        try:
            # Calculate total memory usage across all regions
            total_memory = sum(metrics.memory_usage for metrics in self._cache_metrics.values())
            
            # If total memory is too high, reduce sizes for less active regions
            max_total_memory = 1000000  # 1M entries total
            
            if total_memory > max_total_memory:
                with self._metrics_lock:
                    # Sort regions by hit rate (ascending)
                    sorted_regions = sorted(
                        self._cache_metrics.items(),
                        key=lambda x: x[1].hit_rate
                    )
                    
                    # Reduce sizes for low-performing regions
                    for region_name, metrics in sorted_regions[:3]:  # Bottom 3
                        if metrics.hit_rate < 70:
                            region_enum = None
                            for r in CacheRegion:
                                if r.value == region_name:
                                    region_enum = r
                                    break
                            
                            if region_enum and region_enum in self._cache_policies:
                                policy = self._cache_policies[region_enum]
                                new_size = max(policy.max_size * 0.8, 1000)  # Min 1k entries
                                if new_size != policy.max_size:
                                    policy.max_size = int(new_size)
                                    logger.info(f"Reduced cache size for {region_name} to {policy.max_size}")
                                    
        except Exception as e:
            logger.error(f"Cache rebalancing error: {e}")
    
    def get_metrics(self, region: Optional[CacheRegion] = None) -> Union[CacheMetrics, Dict[str, CacheMetrics]]:
        """Get cache metrics for a specific region or all regions."""
        with self._metrics_lock:
            if region:
                return self._cache_metrics.get(region.value, CacheMetrics(region=region.value))
            else:
                return dict(self._cache_metrics)
    
    def get_optimization_suggestions(self) -> List[str]:
        """Get current optimization suggestions."""
        return list(self._optimization_suggestions)
    
    def get_performance_history(self, region: CacheRegion, level: CacheLevel) -> List[float]:
        """Get performance history for a specific region and level."""
        key = f"{region.value}_{level.value}"
        return list(self._performance_history.get(key, []))
    
    def update_policy(self, region: CacheRegion, policy: CachePolicy):
        """Update cache policy for a specific region."""
        self._cache_policies[region] = policy
        logger.info(f"Updated cache policy for region {region.value}")
    
    def get_policy(self, region: CacheRegion) -> Optional[CachePolicy]:
        """Get cache policy for a specific region."""
        return self._cache_policies.get(region)

# Global cache manager instance
_cache_manager = None

def get_cache_manager() -> EnterpriseCacheManager:
    """Get or create the global cache manager."""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = EnterpriseCacheManager()
    return _cache_manager

# Convenience functions
async def cache_get(key: str, region: CacheRegion = CacheRegion.TEMPORARY_DATA, default: Any = None) -> Any:
    """Convenience function to get from cache."""
    manager = get_cache_manager()
    return await manager.get(key, region, default)

async def cache_set(key: str, value: Any, region: CacheRegion = CacheRegion.TEMPORARY_DATA, ttl: Optional[int] = None) -> bool:
    """Convenience function to set cache."""
    manager = get_cache_manager()
    return await manager.set(key, value, region, ttl)

async def cache_delete(key: str, region: CacheRegion = CacheRegion.TEMPORARY_DATA) -> bool:
    """Convenience function to delete from cache."""
    manager = get_cache_manager()
    return await manager.delete(key, region)

async def cache_clear_region(region: CacheRegion) -> bool:
    """Convenience function to clear cache region."""
    manager = get_cache_manager()
    return await manager.clear_region(region)

# Export cache manager for direct access
cache_manager = get_cache_manager()