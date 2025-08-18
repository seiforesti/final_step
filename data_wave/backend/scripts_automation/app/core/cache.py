"""
Cache Implementation for Enterprise Services

This module provides cache implementations for various enterprise services.
"""

import asyncio
import json
import logging
from typing import Any, Optional, Dict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RedisCache:
    """Simple Redis-like cache implementation for enterprise services"""
    
    def __init__(self):
        self._cache = {}
        self._expiry = {}
        self._lock = asyncio.Lock()
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache"""
        try:
            if key in self._cache:
                if key in self._expiry and datetime.now() > self._expiry[key]:
                    # Expired, remove it
                    del self._cache[key]
                    del self._expiry[key]
                    return default
                return self._cache[key]
            return default
        except Exception as e:
            logger.error(f"Cache get error: {str(e)}")
            return default
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        try:
            async with self._lock:
                self._cache[key] = value
                if ttl:
                    self._expiry[key] = datetime.now() + timedelta(seconds=ttl)
                else:
                    # No expiry
                    if key in self._expiry:
                        del self._expiry[key]
            return True
        except Exception as e:
            logger.error(f"Cache set error: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            async with self._lock:
                if key in self._cache:
                    del self._cache[key]
                if key in self._expiry:
                    del self._expiry[key]
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {str(e)}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            if key in self._cache:
                if key in self._expiry and datetime.now() > self._expiry[key]:
                    # Expired, remove it
                    del self._cache[key]
                    del self._expiry[key]
                    return False
                return True
            return False
        except Exception as e:
            logger.error(f"Cache exists error: {str(e)}")
            return False
    
    async def clear(self) -> bool:
        """Clear all cache entries"""
        try:
            async with self._lock:
                self._cache.clear()
                self._expiry.clear()
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {str(e)}")
            return False
    
    async def get_keys(self, pattern: str = "*") -> list:
        """Get all keys matching pattern with enterprise-level pattern matching"""
        try:
            if pattern == "*":
                return list(self._cache.keys())
            
            # Enterprise-level pattern matching with regex support
            import re
            import fnmatch
            
            keys = []
            for key in self._cache.keys():
                # Support multiple pattern types
                if pattern.startswith("regex:"):
                    # Regex pattern matching
                    regex_pattern = pattern[6:]  # Remove "regex:" prefix
                    try:
                        if re.search(regex_pattern, key):
                            keys.append(key)
                    except re.error:
                        logger.warning(f"Invalid regex pattern: {regex_pattern}")
                elif "*" in pattern or "?" in pattern:
                    # Wildcard pattern matching
                    if fnmatch.fnmatch(key, pattern):
                        keys.append(key)
                elif "|" in pattern:
                    # Multiple patterns separated by |
                    patterns = pattern.split("|")
                    if any(fnmatch.fnmatch(key, p.strip()) for p in patterns):
                        keys.append(key)
                else:
                    # Enhanced substring/word-boundary matching
                    pat = pattern.lower()
                    kl = key.lower()
                    if pat in kl:
                        keys.append(key)
                    else:
                        # try whole-word boundary match
                        import re
                        try:
                            if re.search(rf"\b{re.escape(pat)}\b", kl):
                                keys.append(key)
                        except re.error:
                            pass
            
            return keys
        except Exception as e:
            logger.error(f"Cache get_keys error: {str(e)}")
            return []
    
    async def get_size(self) -> int:
        """Get current cache size"""
        return len(self._cache)
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get enterprise-level cache statistics with advanced metrics"""
        try:
            import sys
            import psutil
            import json
            
            # Calculate expired keys
            expired_count = len([k for k, v in self._expiry.items() if datetime.now() > v])
            active_keys = len(self._cache) - expired_count
            
            # Enterprise-level memory usage calculation
            memory_usage = {}
            try:
                # Calculate actual memory usage of cache objects
                total_size = 0
                key_sizes = {}
                
                for key, value in self._cache.items():
                    # Estimate size of key and value
                    key_size = sys.getsizeof(key)
                    if hasattr(value, '__sizeof__'):
                        value_size = value.__sizeof__()
                    else:
                        # Estimate based on type
                        if isinstance(value, (str, bytes)):
                            value_size = sys.getsizeof(value)
                        elif isinstance(value, (dict, list)):
                            value_size = sys.getsizeof(json.dumps(value))
                        else:
                            value_size = sys.getsizeof(value)
                    
                    total_size += key_size + value_size
                    key_sizes[key] = key_size + value_size
                
                # Get system memory info
                process = psutil.Process()
                process_memory = process.memory_info()
                system_memory = psutil.virtual_memory()
                
                memory_usage = {
                    "cache_size_bytes": total_size,
                    "cache_size_mb": round(total_size / (1024 * 1024), 2),
                    "largest_key": max(key_sizes.items(), key=lambda x: x[1])[0] if key_sizes else None,
                    "largest_key_size_bytes": max(key_sizes.values()) if key_sizes else 0,
                    "average_key_size_bytes": round(total_size / len(self._cache), 2) if self._cache else 0,
                    "process_memory_mb": round(process_memory.rss / (1024 * 1024), 2),
                    "system_memory_available_mb": round(system_memory.available / (1024 * 1024), 2),
                    "system_memory_percent": round(system_memory.percent, 2),
                    "memory_efficiency": round((total_size / process_memory.rss) * 100, 2) if process_memory.rss > 0 else 0
                }
            except Exception as mem_error:
                logger.warning(f"Memory calculation failed: {mem_error}")
                memory_usage = {"error": "Memory calculation unavailable"}
            
            # Calculate cache performance metrics
            hit_rate = 0.0
            if hasattr(self, '_hits') and hasattr(self, '_misses'):
                total_requests = self._hits + self._misses
                hit_rate = (self._hits / total_requests * 100) if total_requests > 0 else 0
            
            # Calculate key distribution by type
            key_types = {}
            for key in self._cache.keys():
                key_type = type(self._cache[key]).__name__
                key_types[key_type] = key_types.get(key_type, 0) + 1
            
            return {
                "total_keys": len(self._cache),
                "expired_keys": expired_count,
                "active_keys": active_keys,
                "memory_usage": memory_usage,
                "performance": {
                    "hit_rate_percent": round(hit_rate, 2),
                    "cache_efficiency": round((active_keys / len(self._cache)) * 100, 2) if self._cache else 0,
                    "expiry_rate_percent": round((expired_count / len(self._cache)) * 100, 2) if self._cache else 0
                },
                "key_distribution": key_types,
                "cache_health": "healthy" if active_keys > expired_count else "degraded" if active_keys > 0 else "critical"
            }
        except Exception as e:
            logger.error(f"Cache stats error: {str(e)}")
            return {"error": str(e)}


def cache_response(ttl: int = 60):
    """Route-level response cache decorator shim (no-op core wrapper).

    The real caching decorator lives in utils.cache as 'cache_response'. This provides
    compatibility for routes importing from app.core.cache.
    """
    try:
        from ..utils.cache import cache_response as _cr  # type: ignore
        return _cr(ttl=ttl)
    except Exception:
        def _noop(func):
            return func
        return _noop
