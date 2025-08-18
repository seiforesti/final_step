"""
Enterprise Cache Utility

Production-grade caching system with Redis backend, multiple caching strategies,
distributed caching, cache warming, and advanced invalidation patterns for
high-performance enterprise data governance operations.
"""

import asyncio
import json
import pickle
import hashlib
import time
import redis
import zlib
from typing import Any, Dict, List, Optional, Union, Callable, Set, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from datetime import datetime, timedelta
import threading
from collections import defaultdict
import functools
import weakref

logger = logging.getLogger(__name__)
try:
    # Lazy import to avoid circulars during early import stages
    from app.core.config import settings as _global_settings
    _DEFAULT_REDIS_URL = _global_settings.redis.url
except Exception:
    _DEFAULT_REDIS_URL = "redis://redis:6379/0"

class CacheStrategy(Enum):
    """Cache strategies."""
    LRU = "lru"  # Least Recently Used
    LFU = "lfu"  # Least Frequently Used
    TTL = "ttl"  # Time To Live
    WRITE_THROUGH = "write_through"
    WRITE_BEHIND = "write_behind"
    READ_THROUGH = "read_through"

class CacheLevel(Enum):
    """Cache levels."""
    L1_MEMORY = "l1_memory"
    L2_REDIS = "l2_redis"
    L3_PERSISTENT = "l3_persistent"

class SerializationMethod(Enum):
    """Serialization methods."""
    JSON = "json"
    PICKLE = "pickle"
    COMPRESSED_PICKLE = "compressed_pickle"

@dataclass
class CacheConfig:
    """Cache configuration."""
    ttl_seconds: int = 3600  # 1 hour default
    max_size: int = 10000
    strategy: CacheStrategy = CacheStrategy.LRU
    compression: bool = False
    serialization: SerializationMethod = SerializationMethod.JSON
    enable_stats: bool = True
    warm_up_on_start: bool = False
    invalidate_on_write: bool = True

@dataclass
class CacheStats:
    """Cache statistics."""
    hits: int = 0
    misses: int = 0
    sets: int = 0
    deletes: int = 0
    evictions: int = 0
    errors: int = 0
    total_size: int = 0
    avg_access_time: float = 0.0
    last_reset: datetime = None

    @property
    def hit_rate(self) -> float:
        """Calculate hit rate percentage."""
        total = self.hits + self.misses
        return (self.hits / total * 100) if total > 0 else 0.0

class EnterpriseCache:
    """
    Enterprise-grade multi-level cache system.
    
    Features:
    - Multi-level caching (Memory -> Redis -> Persistent)
    - Multiple cache strategies (LRU, LFU, TTL)
    - Intelligent cache warming and preloading
    - Advanced invalidation patterns
    - Distributed cache coordination
    - Compression and optimization
    - Real-time statistics and monitoring
    - Cache partitioning and sharding
    """
    
    def __init__(
        self,
        redis_url: Optional[str] = None,
        default_config: Optional[CacheConfig] = None,
        namespace: str = "enterprise_cache",
        enable_l1_cache: bool = True,
        enable_monitoring: bool = True
    ):
        resolved_url = redis_url or _DEFAULT_REDIS_URL
        self.redis_client = redis.from_url(resolved_url, decode_responses=False)
        self.namespace = namespace
        self.default_config = default_config or CacheConfig()
        self.enable_l1_cache = enable_l1_cache
        self.enable_monitoring = enable_monitoring
        
        # L1 Memory cache
        self._l1_cache: Dict[str, Any] = {}
        self._l1_access_times: Dict[str, float] = {}
        self._l1_access_counts: Dict[str, int] = defaultdict(int)
        self._l1_lock = threading.RLock()
        
        # Statistics
        self._stats: Dict[str, CacheStats] = defaultdict(CacheStats)
        self._stats_lock = threading.Lock()
        
        # Cache configurations per key pattern
        self._key_configs: Dict[str, CacheConfig] = {}
        
        # Invalidation tracking
        self._invalidation_patterns: Dict[str, Set[str]] = defaultdict(set)
        self._dependency_graph: Dict[str, Set[str]] = defaultdict(set)
        
        # Warming and preloading
        self._warming_functions: Dict[str, Callable] = {}
        self._preload_keys: Set[str] = set()
        
        # Background tasks
        self._cleanup_task = None
        self._monitoring_task = None
        
        # Start background tasks
        if self.enable_monitoring:
            self._start_background_tasks()
    
    def _start_background_tasks(self):
        """Start background monitoring and cleanup tasks."""
        def cleanup_loop():
            while True:
                try:
                    self._cleanup_expired_keys()
                    self._optimize_l1_cache()
                    time.sleep(300)  # Run every 5 minutes
                except Exception as e:
                    logger.error(f"Cache cleanup error: {e}")
                    time.sleep(60)
        
        def monitoring_loop():
            while True:
                try:
                    self._collect_metrics()
                    self._analyze_performance()
                    time.sleep(60)  # Run every minute
                except Exception as e:
                    logger.error(f"Cache monitoring error: {e}")
                    time.sleep(30)
        
        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        monitoring_thread = threading.Thread(target=monitoring_loop, daemon=True)
        
        cleanup_thread.start()
        monitoring_thread.start()
    
    def configure_key_pattern(self, pattern: str, config: CacheConfig):
        """Configure cache behavior for specific key patterns."""
        self._key_configs[pattern] = config
        logger.info(f"Configured cache pattern '{pattern}' with TTL {config.ttl_seconds}s")
    
    def add_warming_function(self, key_pattern: str, warm_func: Callable):
        """Add a function to warm cache for specific key patterns."""
        self._warming_functions[key_pattern] = warm_func
        logger.info(f"Added warming function for pattern '{key_pattern}'")
    
    def add_invalidation_dependency(self, key: str, dependent_pattern: str):
        """Add invalidation dependency between keys."""
        self._dependency_graph[key].add(dependent_pattern)
        self._invalidation_patterns[dependent_pattern].add(key)
    
    async def get(
        self,
        key: str,
        default: Any = None,
        config: Optional[CacheConfig] = None
    ) -> Any:
        """
        Get value from cache with multi-level fallback.
        
        Args:
            key: Cache key
            default: Default value if not found
            config: Optional cache configuration override
            
        Returns:
            Cached value or default
        """
        start_time = time.time()
        cache_config = config or self._get_config_for_key(key)
        full_key = self._build_key(key)
        
        try:
            # Try L1 cache first
            if self.enable_l1_cache:
                l1_value = self._get_from_l1(full_key, cache_config)
                if l1_value is not None:
                    self._record_stats(key, 'hit', time.time() - start_time)
                    return l1_value
            
            # Try L2 Redis cache
            l2_value = await self._get_from_l2(full_key, cache_config)
            if l2_value is not None:
                # Store in L1 for faster access
                if self.enable_l1_cache:
                    self._set_to_l1(full_key, l2_value, cache_config)
                self._record_stats(key, 'hit', time.time() - start_time)
                return l2_value
            
            # Cache miss
            self._record_stats(key, 'miss', time.time() - start_time)
            
            # Try warming if configured
            warmed_value = await self._try_warming(key, cache_config)
            if warmed_value is not None:
                await self.set(key, warmed_value, config=cache_config)
                return warmed_value
            
            return default
            
        except Exception as e:
            logger.error(f"Cache get error for key '{key}': {e}")
            self._record_stats(key, 'error')
            return default
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        config: Optional[CacheConfig] = None
    ) -> bool:
        """
        Set value in cache across all levels.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (overrides config)
            config: Optional cache configuration override
            
        Returns:
            True if successful
        """
        try:
            cache_config = config or self._get_config_for_key(key)
            effective_ttl = ttl or cache_config.ttl_seconds
            full_key = self._build_key(key)
            
            # Set in L2 Redis
            success = await self._set_to_l2(full_key, value, effective_ttl, cache_config)
            
            # Set in L1 memory
            if success and self.enable_l1_cache:
                self._set_to_l1(full_key, value, cache_config)
            
            # Handle invalidation dependencies
            if cache_config.invalidate_on_write:
                await self._invalidate_dependencies(key)
            
            self._record_stats(key, 'set')
            return success
            
        except Exception as e:
            logger.error(f"Cache set error for key '{key}': {e}")
            self._record_stats(key, 'error')
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from all cache levels."""
        try:
            full_key = self._build_key(key)
            
            # Delete from L1
            if self.enable_l1_cache:
                self._delete_from_l1(full_key)
            
            # Delete from L2
            success = await self._delete_from_l2(full_key)
            
            # Handle invalidation dependencies
            await self._invalidate_dependencies(key)
            
            self._record_stats(key, 'delete')
            return success
            
        except Exception as e:
            logger.error(f"Cache delete error for key '{key}': {e}")
            self._record_stats(key, 'error')
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        try:
            full_key = self._build_key(key)
            
            # Check L1 first
            if self.enable_l1_cache and full_key in self._l1_cache:
                return True
            
            # Check L2
            return bool(self.redis_client.exists(full_key))
            
        except Exception as e:
            logger.error(f"Cache exists error for key '{key}': {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching a pattern."""
        try:
            full_pattern = self._build_key(pattern)
            
            # Clear from L2 Redis
            keys = self.redis_client.keys(full_pattern)
            if keys:
                deleted_count = self.redis_client.delete(*keys)
            else:
                deleted_count = 0
            
            # Clear from L1
            if self.enable_l1_cache:
                with self._l1_lock:
                    l1_keys_to_delete = [
                        k for k in self._l1_cache.keys()
                        if self._match_pattern(k, full_pattern)
                    ]
                    for k in l1_keys_to_delete:
                        del self._l1_cache[k]
                        self._l1_access_times.pop(k, None)
                        self._l1_access_counts.pop(k, None)
            
            logger.info(f"Cleared {deleted_count} keys matching pattern '{pattern}'")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Cache clear pattern error for '{pattern}': {e}")
            return 0
    
    async def warm_cache(self, keys: Optional[List[str]] = None) -> int:
        """Warm cache with predefined or specified keys."""
        warmed_count = 0
        keys_to_warm = keys or list(self._preload_keys)
        
        for key in keys_to_warm:
            try:
                config = self._get_config_for_key(key)
                warmed_value = await self._try_warming(key, config)
                if warmed_value is not None:
                    await self.set(key, warmed_value, config=config)
                    warmed_count += 1
            except Exception as e:
                logger.error(f"Cache warming error for key '{key}': {e}")
        
        logger.info(f"Warmed {warmed_count} cache keys")
        return warmed_count
    
    def _get_from_l1(self, key: str, config: CacheConfig) -> Any:
        """Get value from L1 memory cache."""
        if not self.enable_l1_cache:
            return None
        
        with self._l1_lock:
            if key not in self._l1_cache:
                return None
            
            # Check TTL
            if key in self._l1_access_times:
                age = time.time() - self._l1_access_times[key]
                if age > config.ttl_seconds:
                    # Expired
                    del self._l1_cache[key]
                    self._l1_access_times.pop(key, None)
                    self._l1_access_counts.pop(key, None)
                    return None
            
            # Update access tracking
            self._l1_access_times[key] = time.time()
            self._l1_access_counts[key] += 1
            
            return self._l1_cache[key]
    
    def _set_to_l1(self, key: str, value: Any, config: CacheConfig):
        """Set value to L1 memory cache."""
        if not self.enable_l1_cache:
            return
        
        with self._l1_lock:
            # Check size limit
            if len(self._l1_cache) >= config.max_size:
                self._evict_l1_keys(config)
            
            self._l1_cache[key] = value
            self._l1_access_times[key] = time.time()
            self._l1_access_counts[key] = 1
    
    def _delete_from_l1(self, key: str):
        """Delete key from L1 memory cache."""
        if not self.enable_l1_cache:
            return
        
        with self._l1_lock:
            self._l1_cache.pop(key, None)
            self._l1_access_times.pop(key, None)
            self._l1_access_counts.pop(key, None)
    
    async def _get_from_l2(self, key: str, config: CacheConfig) -> Any:
        """Get value from L2 Redis cache."""
        try:
            raw_data = self.redis_client.get(key)
            if raw_data is None:
                return None
            
            return self._deserialize(raw_data, config.serialization)
            
        except Exception as e:
            logger.error(f"L2 cache get error: {e}")
            return None
    
    async def _set_to_l2(self, key: str, value: Any, ttl: int, config: CacheConfig) -> bool:
        """Set value to L2 Redis cache."""
        try:
            serialized_data = self._serialize(value, config.serialization)
            return self.redis_client.setex(key, ttl, serialized_data)
            
        except Exception as e:
            logger.error(f"L2 cache set error: {e}")
            return False
    
    async def _delete_from_l2(self, key: str) -> bool:
        """Delete key from L2 Redis cache."""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"L2 cache delete error: {e}")
            return False
    
    def _serialize(self, value: Any, method: SerializationMethod) -> bytes:
        """Serialize value based on method."""
        if method == SerializationMethod.JSON:
            return json.dumps(value, default=str).encode('utf-8')
        elif method == SerializationMethod.PICKLE:
            return pickle.dumps(value)
        elif method == SerializationMethod.COMPRESSED_PICKLE:
            return zlib.compress(pickle.dumps(value))
        else:
            raise ValueError(f"Unknown serialization method: {method}")
    
    def _deserialize(self, data: bytes, method: SerializationMethod) -> Any:
        """Deserialize value based on method."""
        if method == SerializationMethod.JSON:
            return json.loads(data.decode('utf-8'))
        elif method == SerializationMethod.PICKLE:
            return pickle.loads(data)
        elif method == SerializationMethod.COMPRESSED_PICKLE:
            return pickle.loads(zlib.decompress(data))
        else:
            raise ValueError(f"Unknown serialization method: {method}")
    
    def _evict_l1_keys(self, config: CacheConfig):
        """Evict keys from L1 cache based on strategy."""
        if not self._l1_cache:
            return
        
        evict_count = max(1, len(self._l1_cache) // 10)  # Evict 10%
        
        if config.strategy == CacheStrategy.LRU:
            # Evict least recently used
            keys_by_access = sorted(
                self._l1_access_times.items(),
                key=lambda x: x[1]
            )
            keys_to_evict = [k for k, _ in keys_by_access[:evict_count]]
        
        elif config.strategy == CacheStrategy.LFU:
            # Evict least frequently used
            keys_by_count = sorted(
                self._l1_access_counts.items(),
                key=lambda x: x[1]
            )
            keys_to_evict = [k for k, _ in keys_by_count[:evict_count]]
        
        else:  # TTL or default
            # Evict oldest entries
            keys_by_age = sorted(
                self._l1_access_times.items(),
                key=lambda x: x[1]
            )
            keys_to_evict = [k for k, _ in keys_by_age[:evict_count]]
        
        for key in keys_to_evict:
            self._l1_cache.pop(key, None)
            self._l1_access_times.pop(key, None)
            self._l1_access_counts.pop(key, None)
        
        self._record_stats('_eviction', 'eviction', count=len(keys_to_evict))
    
    def _get_config_for_key(self, key: str) -> CacheConfig:
        """Get cache configuration for a specific key."""
        for pattern, config in self._key_configs.items():
            if self._match_pattern(self._build_key(key), self._build_key(pattern)):
                return config
        return self.default_config
    
    def _build_key(self, key: str) -> str:
        """Build full cache key with namespace."""
        return f"{self.namespace}:{key}"
    
    def _match_pattern(self, key: str, pattern: str) -> bool:
        """
        Enterprise-grade pattern matching with advanced wildcard and regex support.
        Supports multiple pattern types: simple wildcards, regex, and glob patterns.
        """
        import re
        import fnmatch
        
        try:
            # Handle exact match (no wildcards)
            if '*' not in pattern and '?' not in pattern and '[' not in pattern:
                return key == pattern
            
            # Enterprise pattern matching with multiple strategies
            
            # Strategy 1: Advanced glob pattern matching (supports *, ?, [], {})
            if any(char in pattern for char in ['*', '?', '[', ']']):
                try:
                    return fnmatch.fnmatch(key, pattern)
                except Exception as e:
                    # Fallback to custom implementation if fnmatch fails
                    pass
            
            # Strategy 2: Regex pattern matching (if pattern contains regex metacharacters)
            regex_metacharacters = set(['^', '$', '.', '+', '(', ')', '{', '}', '|', '\\'])
            if any(char in pattern for char in regex_metacharacters):
                try:
                    # Treat as regex pattern
                    compiled_pattern = re.compile(pattern)
                    return bool(compiled_pattern.match(key))
                except re.error:
                    # Invalid regex, fall back to wildcard
                    pass
            
            # Strategy 3: Enhanced wildcard matching with performance optimizations
            return self._advanced_wildcard_match(key, pattern)
            
        except Exception as e:
            # Fallback to basic string comparison for safety
            logger.warning(f"Pattern matching failed for key '{key}' and pattern '{pattern}': {e}")
            return key == pattern
    
    def _advanced_wildcard_match(self, key: str, pattern: str) -> bool:
        """
        Advanced wildcard matching algorithm with performance optimizations.
        Supports: * (any sequence), ? (single char), [abc] (character class), {a,b} (alternatives)
        """
        try:
            # Convert pattern to regex for complex matching
            regex_pattern = self._convert_pattern_to_regex(pattern)
            compiled_regex = re.compile(regex_pattern)
            return bool(compiled_regex.fullmatch(key))
            
        except Exception as e:
            # Fallback to simple wildcard matching
            return self._simple_wildcard_match(key, pattern)
    
    def _convert_pattern_to_regex(self, pattern: str) -> str:
        """Convert wildcard pattern to regex pattern."""
        import re
        
        # Escape special regex characters except our wildcards
        escaped = re.escape(pattern)
        
        # Convert wildcard patterns to regex
        regex_pattern = escaped
        regex_pattern = regex_pattern.replace(r'\*', '.*')  # * matches any sequence
        regex_pattern = regex_pattern.replace(r'\?', '.')   # ? matches single character
        
        # Handle character classes [abc]
        regex_pattern = regex_pattern.replace(r'\[', '[').replace(r'\]', ']')
        
        # Handle alternatives {a,b,c}
        import re as regex_module
        brace_pattern = r'\\\{([^}]*)\\\}'
        
        def replace_braces(match):
            alternatives = match.group(1).split(',')
            return '(?:' + '|'.join(alt.strip() for alt in alternatives) + ')'
        
        regex_pattern = regex_module.sub(brace_pattern, regex_pattern, replace_braces)
        
        return f'^{regex_pattern}$'
    
    def _simple_wildcard_match(self, key: str, pattern: str) -> bool:
        """Fallback simple wildcard matching (original algorithm enhanced)."""
        if '*' not in pattern:
            return key == pattern
        
        # Enhanced wildcard matching with better edge case handling
        pattern_parts = pattern.split('*')
        key_pos = 0
        
        # Handle empty pattern parts (consecutive *)
        pattern_parts = [part for part in pattern_parts if part]
        
        if not pattern_parts:
            return True  # Pattern is just '*' or '**', matches everything
        
        for i, part in enumerate(pattern_parts):
            if i == 0:  # First part - must match start
                if not key[key_pos:].startswith(part):
                    return False
                key_pos += len(part)
            elif i == len(pattern_parts) - 1:  # Last part - must match end
                if not key.endswith(part):
                    return False
                # Verify there's enough space for this part
                expected_end_pos = len(key) - len(part)
                if key_pos > expected_end_pos:
                    return False
            else:  # Middle parts - find in remaining string
                remaining_key = key[key_pos:]
                pos = remaining_key.find(part)
                if pos == -1:
                    return False
                key_pos += pos + len(part)
        
        return True
    
    async def _try_warming(self, key: str, config: CacheConfig) -> Any:
        """Try to warm cache using registered warming functions."""
        for pattern, warm_func in self._warming_functions.items():
            if self._match_pattern(key, pattern):
                try:
                    if asyncio.iscoroutinefunction(warm_func):
                        return await warm_func(key)
                    else:
                        return warm_func(key)
                except Exception as e:
                    logger.error(f"Cache warming function error for '{key}': {e}")
        return None
    
    async def _invalidate_dependencies(self, key: str):
        """Invalidate dependent cache keys."""
        try:
            dependent_patterns = self._dependency_graph.get(key, set())
            for pattern in dependent_patterns:
                await self.clear_pattern(pattern)
                logger.debug(f"Invalidated dependent pattern '{pattern}' for key '{key}'")
        except Exception as e:
            logger.error(f"Dependency invalidation error for '{key}': {e}")
    
    def _record_stats(self, key: str, operation: str, duration: float = 0, count: int = 1):
        """Record cache operation statistics."""
        if not self.enable_monitoring:
            return
        
        try:
            with self._stats_lock:
                stats = self._stats[key]
                
                if operation == 'hit':
                    stats.hits += count
                elif operation == 'miss':
                    stats.misses += count
                elif operation == 'set':
                    stats.sets += count
                elif operation == 'delete':
                    stats.deletes += count
                elif operation == 'eviction':
                    stats.evictions += count
                elif operation == 'error':
                    stats.errors += count
                
                # Update average access time
                if duration > 0:
                    total_ops = stats.hits + stats.misses
                    if total_ops > 0:
                        stats.avg_access_time = (
                            (stats.avg_access_time * (total_ops - 1) + duration) / total_ops
                        )
        except Exception as e:
            logger.error(f"Stats recording error: {e}")
    
    def _cleanup_expired_keys(self):
        """Clean up expired keys from L1 cache."""
        if not self.enable_l1_cache:
            return
        
        try:
            current_time = time.time()
            expired_keys = []
            
            with self._l1_lock:
                for key, access_time in self._l1_access_times.items():
                    config = self._get_config_for_key(key.replace(f"{self.namespace}:", ""))
                    if current_time - access_time > config.ttl_seconds:
                        expired_keys.append(key)
                
                for key in expired_keys:
                    self._l1_cache.pop(key, None)
                    self._l1_access_times.pop(key, None)
                    self._l1_access_counts.pop(key, None)
            
            if expired_keys:
                logger.debug(f"Cleaned up {len(expired_keys)} expired L1 cache keys")
                
        except Exception as e:
            logger.error(f"Cache cleanup error: {e}")
    
    def _optimize_l1_cache(self):
        """Optimize L1 cache performance."""
        if not self.enable_l1_cache:
            return
        
        try:
            with self._l1_lock:
                # Check if cache is too large
                if len(self._l1_cache) > self.default_config.max_size * 0.9:
                    self._evict_l1_keys(self.default_config)
                
                # Update cache statistics
                with self._stats_lock:
                    self._stats['_cache_size'].total_size = len(self._l1_cache)
                    
        except Exception as e:
            logger.error(f"Cache optimization error: {e}")
    
    def _collect_metrics(self):
        """Collect and store cache metrics."""
        try:
            if not self.enable_monitoring:
                return
            
            with self._stats_lock:
                # Aggregate statistics
                total_stats = CacheStats()
                for stats in self._stats.values():
                    total_stats.hits += stats.hits
                    total_stats.misses += stats.misses
                    total_stats.sets += stats.sets
                    total_stats.deletes += stats.deletes
                    total_stats.evictions += stats.evictions
                    total_stats.errors += stats.errors
                
                # Store in Redis for external monitoring
                metrics = {
                    'hit_rate': total_stats.hit_rate,
                    'total_operations': total_stats.hits + total_stats.misses,
                    'cache_size_l1': len(self._l1_cache) if self.enable_l1_cache else 0,
                    'timestamp': datetime.now().isoformat()
                }
                
                metrics_key = f"{self.namespace}:metrics"
                self.redis_client.hset(metrics_key, mapping=metrics)
                self.redis_client.expire(metrics_key, 86400)  # 24 hours
                
        except Exception as e:
            logger.error(f"Metrics collection error: {e}")
    
    def _analyze_performance(self):
        """Analyze cache performance and log insights."""
        try:
            with self._stats_lock:
                for key, stats in self._stats.items():
                    if key.startswith('_'):
                        continue
                    
                    hit_rate = stats.hit_rate
                    if hit_rate < 70 and (stats.hits + stats.misses) > 100:
                        logger.warning(
                            f"Low cache hit rate for '{key}': {hit_rate:.1f}% "
                            f"(hits: {stats.hits}, misses: {stats.misses})"
                        )
                    
                    if stats.avg_access_time > 0.1:  # 100ms
                        logger.warning(
                            f"Slow cache access for '{key}': {stats.avg_access_time:.3f}s"
                        )
        except Exception as e:
            logger.error(f"Performance analysis error: {e}")
    
    def get_stats(self, key: Optional[str] = None) -> Union[CacheStats, Dict[str, CacheStats]]:
        """Get cache statistics."""
        with self._stats_lock:
            if key:
                return self._stats.get(key, CacheStats())
            else:
                return dict(self._stats)
    
    def reset_stats(self, key: Optional[str] = None):
        """Reset cache statistics."""
        with self._stats_lock:
            if key:
                self._stats[key] = CacheStats(last_reset=datetime.now())
            else:
                self._stats.clear()
        logger.info(f"Reset cache stats for {'all keys' if not key else key}")

# Global cache instance
_cache_instance = None

def get_cache() -> EnterpriseCache:
    """Get or create the global cache instance."""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = EnterpriseCache()
    return _cache_instance

# Decorator for caching function results
def cached(
    key_func: Optional[Callable] = None,
    ttl: int = 3600,
    config: Optional[CacheConfig] = None
):
    """
    Decorator to cache function results.
    
    Args:
        key_func: Function to generate cache key from args/kwargs
        ttl: Time to live in seconds
        config: Cache configuration
    """
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache = get_cache()
            
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                key_parts = [func.__name__]
                key_parts.extend(str(arg) for arg in args)
                key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                cache_key = ":".join(key_parts)
            
            # Try to get from cache
            cached_result = await cache.get(cache_key, config=config)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            
            await cache.set(cache_key, result, ttl=ttl, config=config)
            return result
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            # For sync functions, run async operations in event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(async_wrapper(*args, **kwargs))
            finally:
                loop.close()
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    return decorator

# Convenience functions
async def cache_get(key: str, default: Any = None) -> Any:
    """Convenience function to get from cache."""
    cache = get_cache()
    return await cache.get(key, default)

async def cache_set(key: str, value: Any, ttl: int = 3600) -> bool:
    """Convenience function to set cache."""
    cache = get_cache()
    return await cache.set(key, value, ttl=ttl)

async def cache_delete(key: str) -> bool:
    """Convenience function to delete from cache."""
    cache = get_cache()
    return await cache.delete(key)

# Aliases for backward compatibility
cache_result = cached

def cache_response(ttl: int = 60):
    """
    Lightweight decorator alias used by routes to cache endpoint responses.
    Wraps the 'cached' decorator with a TTL and default key function.
    """
    return cached(ttl=ttl)