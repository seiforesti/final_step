"""
Enterprise Rate Limiter Utility

Production-grade rate limiting system with Redis backend, sliding window algorithm,
and distributed rate limiting capabilities for high-performance enterprise scenarios.
"""

import asyncio
import time
import redis
import hashlib
import json
from typing import Dict, Optional, List, Tuple, Any, Callable
import functools
from dataclasses import dataclass
from enum import Enum
import logging
from datetime import datetime, timedelta
import threading
from collections import defaultdict

logger = logging.getLogger(__name__)

class RateLimitStrategy(Enum):
    """Rate limiting strategies."""
    FIXED_WINDOW = "fixed_window"
    SLIDING_WINDOW = "sliding_window"
    TOKEN_BUCKET = "token_bucket"
    LEAKY_BUCKET = "leaky_bucket"

class RateLimitScope(Enum):
    """Rate limiting scopes."""
    GLOBAL = "global"
    USER = "user"
    IP = "ip"
    ENDPOINT = "endpoint"
    SERVICE = "service"
    TENANT = "tenant"

@dataclass
class RateLimitRule:
    """Rate limit rule configuration."""
    max_requests: int
    window_seconds: int
    strategy: RateLimitStrategy = RateLimitStrategy.SLIDING_WINDOW
    scope: RateLimitScope = RateLimitScope.USER
    burst_allowance: int = 0
    cooldown_seconds: int = 0

@dataclass
class RateLimitResult:
    """Rate limit check result."""
    allowed: bool
    remaining: int
    reset_time: datetime
    retry_after: Optional[int] = None
    current_usage: int = 0
    limit: int = 0

class EnterpriseRateLimiter:
    """
    Enterprise-grade rate limiter with Redis backend and multiple strategies.
    
    Features:
    - Multiple rate limiting strategies (sliding window, token bucket, etc.)
    - Distributed rate limiting with Redis
    - Per-user, per-IP, per-endpoint, and global rate limiting
    - Burst allowance and cooldown periods
    - Real-time monitoring and analytics
    - Automatic rule optimization
    """
    
    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        default_rules: Optional[Dict[str, RateLimitRule]] = None,
        enable_monitoring: bool = True
    ):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.default_rules = default_rules or self._get_default_rules()
        self.enable_monitoring = enable_monitoring
        self.local_cache = {}
        self.cache_ttl = 60  # seconds
        self._monitoring_data = defaultdict(list)
        self._lock = threading.Lock()
        
        # Initialize monitoring
        if self.enable_monitoring:
            self._start_monitoring()
    
    def _get_default_rules(self) -> Dict[str, RateLimitRule]:
        """Get default rate limiting rules for enterprise scenarios."""
        return {
            "api_general": RateLimitRule(
                max_requests=1000,
                window_seconds=3600,  # 1 hour
                strategy=RateLimitStrategy.SLIDING_WINDOW,
                scope=RateLimitScope.USER
            ),
            "api_heavy": RateLimitRule(
                max_requests=100,
                window_seconds=3600,
                strategy=RateLimitStrategy.SLIDING_WINDOW,
                scope=RateLimitScope.USER,
                burst_allowance=20,
                cooldown_seconds=300
            ),
            "scan_operations": RateLimitRule(
                max_requests=50,
                window_seconds=3600,
                strategy=RateLimitStrategy.TOKEN_BUCKET,
                scope=RateLimitScope.USER,
                burst_allowance=10
            ),
            "data_export": RateLimitRule(
                max_requests=10,
                window_seconds=3600,
                strategy=RateLimitStrategy.LEAKY_BUCKET,
                scope=RateLimitScope.USER,
                cooldown_seconds=600
            ),
            "ip_global": RateLimitRule(
                max_requests=5000,
                window_seconds=3600,
                strategy=RateLimitStrategy.SLIDING_WINDOW,
                scope=RateLimitScope.IP
            ),
            "service_internal": RateLimitRule(
                max_requests=10000,
                window_seconds=3600,
                strategy=RateLimitStrategy.FIXED_WINDOW,
                scope=RateLimitScope.SERVICE
            )
        }
    
    async def check_rate_limit(
        self,
        identifier: str,
        rule_name: str = "api_general",
        context: Optional[Dict[str, Any]] = None
    ) -> RateLimitResult:
        """
        Check if a request should be rate limited.
        
        Args:
            identifier: Unique identifier (user_id, ip, etc.)
            rule_name: Name of the rate limiting rule to apply
            context: Additional context for rate limiting decisions
            
        Returns:
            RateLimitResult with decision and metadata
        """
        try:
            rule = self.default_rules.get(rule_name)
            if not rule:
                logger.warning(f"Unknown rate limit rule: {rule_name}")
                return RateLimitResult(
                    allowed=True,
                    remaining=999,
                    reset_time=datetime.now() + timedelta(hours=1)
                )
            
            # Generate cache key
            cache_key = self._generate_cache_key(identifier, rule_name, rule.scope)
            
            # Apply rate limiting strategy
            if rule.strategy == RateLimitStrategy.SLIDING_WINDOW:
                result = await self._sliding_window_check(cache_key, rule)
            elif rule.strategy == RateLimitStrategy.TOKEN_BUCKET:
                result = await self._token_bucket_check(cache_key, rule)
            elif rule.strategy == RateLimitStrategy.LEAKY_BUCKET:
                result = await self._leaky_bucket_check(cache_key, rule)
            else:  # FIXED_WINDOW
                result = await self._fixed_window_check(cache_key, rule)
            
            # Apply burst allowance if configured
            if not result.allowed and rule.burst_allowance > 0:
                result = await self._check_burst_allowance(cache_key, rule, result)
            
            # Record monitoring data
            if self.enable_monitoring:
                self._record_usage(identifier, rule_name, result, context)
            
            return result
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            # Fail open in case of errors
            return RateLimitResult(
                allowed=True,
                remaining=999,
                reset_time=datetime.now() + timedelta(hours=1)
            )
    
    async def _sliding_window_check(self, cache_key: str, rule: RateLimitRule) -> RateLimitResult:
        """Implement sliding window rate limiting."""
        current_time = time.time()
        window_start = current_time - rule.window_seconds
        
        # Use Redis sorted set for sliding window
        pipe = self.redis_client.pipeline()
        
        # Remove old entries
        pipe.zremrangebyscore(cache_key, 0, window_start)
        
        # Count current requests
        pipe.zcard(cache_key)
        
        # Add current request
        pipe.zadd(cache_key, {str(current_time): current_time})
        
        # Set expiration
        pipe.expire(cache_key, rule.window_seconds + 1)
        
        results = pipe.execute()
        current_count = results[1]
        
        allowed = current_count < rule.max_requests
        remaining = max(0, rule.max_requests - current_count - 1)
        reset_time = datetime.fromtimestamp(current_time + rule.window_seconds)
        
        return RateLimitResult(
            allowed=allowed,
            remaining=remaining,
            reset_time=reset_time,
            current_usage=current_count + 1,
            limit=rule.max_requests,
            retry_after=rule.window_seconds if not allowed else None
        )
    
    async def _token_bucket_check(self, cache_key: str, rule: RateLimitRule) -> RateLimitResult:
        """Implement token bucket rate limiting."""
        current_time = time.time()
        bucket_key = f"{cache_key}:bucket"
        
        # Get current bucket state
        bucket_data = self.redis_client.hgetall(bucket_key)
        
        if bucket_data:
            last_refill = float(bucket_data.get('last_refill', current_time))
            tokens = float(bucket_data.get('tokens', rule.max_requests))
        else:
            last_refill = current_time
            tokens = rule.max_requests
        
        # Calculate tokens to add based on time elapsed
        time_elapsed = current_time - last_refill
        refill_rate = rule.max_requests / rule.window_seconds
        tokens_to_add = time_elapsed * refill_rate
        tokens = min(rule.max_requests, tokens + tokens_to_add)
        
        # Check if request can be allowed
        allowed = tokens >= 1
        if allowed:
            tokens -= 1
        
        # Update bucket state
        self.redis_client.hset(bucket_key, mapping={
            'tokens': tokens,
            'last_refill': current_time
        })
        self.redis_client.expire(bucket_key, rule.window_seconds * 2)
        
        remaining = int(tokens)
        reset_time = datetime.fromtimestamp(
            current_time + (rule.max_requests - tokens) / refill_rate
        )
        
        return RateLimitResult(
            allowed=allowed,
            remaining=remaining,
            reset_time=reset_time,
            current_usage=rule.max_requests - remaining,
            limit=rule.max_requests,
            retry_after=int(1 / refill_rate) if not allowed else None
        )
    
    async def _leaky_bucket_check(self, cache_key: str, rule: RateLimitRule) -> RateLimitResult:
        """Implement leaky bucket rate limiting."""
        current_time = time.time()
        bucket_key = f"{cache_key}:leaky"
        
        # Get current queue length
        queue_length = self.redis_client.llen(bucket_key)
        
        # Calculate leak rate
        leak_rate = rule.max_requests / rule.window_seconds
        
        # Remove leaked items based on time
        last_leak_key = f"{bucket_key}:last_leak"
        last_leak = float(self.redis_client.get(last_leak_key) or current_time)
        time_elapsed = current_time - last_leak
        items_to_leak = int(time_elapsed * leak_rate)
        
        if items_to_leak > 0:
            # Remove leaked items
            for _ in range(min(items_to_leak, queue_length)):
                self.redis_client.lpop(bucket_key)
            self.redis_client.set(last_leak_key, current_time)
            queue_length = self.redis_client.llen(bucket_key)
        
        # Check if we can add new request
        allowed = queue_length < rule.max_requests
        
        if allowed:
            # Add request to queue
            self.redis_client.rpush(bucket_key, current_time)
            self.redis_client.expire(bucket_key, rule.window_seconds * 2)
            queue_length += 1
        
        remaining = max(0, rule.max_requests - queue_length)
        reset_time = datetime.fromtimestamp(
            current_time + queue_length / leak_rate
        )
        
        return RateLimitResult(
            allowed=allowed,
            remaining=remaining,
            reset_time=reset_time,
            current_usage=queue_length,
            limit=rule.max_requests,
            retry_after=int(1 / leak_rate) if not allowed else None
        )
    
    async def _fixed_window_check(self, cache_key: str, rule: RateLimitRule) -> RateLimitResult:
        """Implement fixed window rate limiting."""
        current_time = time.time()
        window_start = int(current_time // rule.window_seconds) * rule.window_seconds
        window_key = f"{cache_key}:{window_start}"
        
        # Increment counter for current window
        current_count = self.redis_client.incr(window_key)
        self.redis_client.expire(window_key, rule.window_seconds)
        
        allowed = current_count <= rule.max_requests
        remaining = max(0, rule.max_requests - current_count)
        reset_time = datetime.fromtimestamp(window_start + rule.window_seconds)
        
        return RateLimitResult(
            allowed=allowed,
            remaining=remaining,
            reset_time=reset_time,
            current_usage=current_count,
            limit=rule.max_requests,
            retry_after=int(reset_time.timestamp() - current_time) if not allowed else None
        )
    
    async def _check_burst_allowance(
        self,
        cache_key: str,
        rule: RateLimitRule,
        original_result: RateLimitResult
    ) -> RateLimitResult:
        """Check if burst allowance can be applied."""
        burst_key = f"{cache_key}:burst"
        burst_used = int(self.redis_client.get(burst_key) or 0)
        
        if burst_used < rule.burst_allowance:
            # Allow burst request
            self.redis_client.incr(burst_key)
            self.redis_client.expire(burst_key, rule.window_seconds)
            
            return RateLimitResult(
                allowed=True,
                remaining=rule.burst_allowance - burst_used - 1,
                reset_time=original_result.reset_time,
                current_usage=original_result.current_usage,
                limit=rule.max_requests + rule.burst_allowance,
                retry_after=None
            )
        
        return original_result
    
    def _generate_cache_key(self, identifier: str, rule_name: str, scope: RateLimitScope) -> str:
        """Generate cache key for rate limiting."""
        scope_prefix = scope.value
        key_components = [scope_prefix, rule_name, identifier]
        key_string = ":".join(key_components)
        
        # Use hash for consistent key length
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        return f"rate_limit:{scope_prefix}:{key_hash}"
    
    def _record_usage(
        self,
        identifier: str,
        rule_name: str,
        result: RateLimitResult,
        context: Optional[Dict[str, Any]]
    ):
        """Record usage data for monitoring and analytics."""
        try:
            with self._lock:
                timestamp = datetime.now()
                usage_record = {
                    'timestamp': timestamp.isoformat(),
                    'identifier': identifier,
                    'rule_name': rule_name,
                    'allowed': result.allowed,
                    'current_usage': result.current_usage,
                    'limit': result.limit,
                    'remaining': result.remaining,
                    'context': context or {}
                }
                
                self._monitoring_data[rule_name].append(usage_record)
                
                # Keep only recent data
                cutoff_time = timestamp - timedelta(hours=24)
                self._monitoring_data[rule_name] = [
                    record for record in self._monitoring_data[rule_name]
                    if datetime.fromisoformat(record['timestamp']) > cutoff_time
                ]
        except Exception as e:
            logger.error(f"Failed to record usage data: {e}")
    
    def _start_monitoring(self):
        """Start background monitoring tasks."""
        def monitor_loop():
            while True:
                try:
                    self._analyze_usage_patterns()
                    time.sleep(300)  # Run every 5 minutes
                except Exception as e:
                    logger.error(f"Monitoring loop error: {e}")
                    time.sleep(60)
        
        monitoring_thread = threading.Thread(target=monitor_loop, daemon=True)
        monitoring_thread.start()
    
    def _analyze_usage_patterns(self):
        """Analyze usage patterns for optimization suggestions."""
        try:
            with self._lock:
                for rule_name, records in self._monitoring_data.items():
                    if not records:
                        continue
                    
                    # Calculate metrics
                    total_requests = len(records)
                    blocked_requests = sum(1 for r in records if not r['allowed'])
                    block_rate = blocked_requests / total_requests if total_requests > 0 else 0
                    
                    # Log insights
                    if block_rate > 0.1:  # More than 10% blocked
                        logger.warning(
                            f"High block rate for {rule_name}: {block_rate:.2%} "
                            f"({blocked_requests}/{total_requests})"
                        )
                    
                    # Store metrics in Redis for external monitoring
                    metrics_key = f"rate_limit_metrics:{rule_name}"
                    metrics = {
                        'total_requests': total_requests,
                        'blocked_requests': blocked_requests,
                        'block_rate': block_rate,
                        'last_updated': datetime.now().isoformat()
                    }
                    self.redis_client.hset(metrics_key, mapping=metrics)
                    self.redis_client.expire(metrics_key, 86400)  # 24 hours
                    
        except Exception as e:
            logger.error(f"Usage pattern analysis failed: {e}")
    
    def get_usage_stats(self, rule_name: str) -> Dict[str, Any]:
        """Get usage statistics for a specific rule."""
        try:
            with self._lock:
                records = self._monitoring_data.get(rule_name, [])
                if not records:
                    return {'total_requests': 0, 'blocked_requests': 0, 'block_rate': 0}
                
                total_requests = len(records)
                blocked_requests = sum(1 for r in records if not r['allowed'])
                block_rate = blocked_requests / total_requests if total_requests > 0 else 0
                
                # Recent usage (last hour)
                cutoff_time = datetime.now() - timedelta(hours=1)
                recent_records = [
                    r for r in records
                    if datetime.fromisoformat(r['timestamp']) > cutoff_time
                ]
                recent_requests = len(recent_records)
                recent_blocked = sum(1 for r in recent_records if not r['allowed'])
                
                return {
                    'total_requests': total_requests,
                    'blocked_requests': blocked_requests,
                    'block_rate': block_rate,
                    'recent_requests_1h': recent_requests,
                    'recent_blocked_1h': recent_blocked,
                    'recent_block_rate_1h': recent_blocked / recent_requests if recent_requests > 0 else 0
                }
        except Exception as e:
            logger.error(f"Failed to get usage stats: {e}")
            return {'error': str(e)}
    
    def add_rule(self, name: str, rule: RateLimitRule):
        """Add a new rate limiting rule."""
        self.default_rules[name] = rule
        logger.info(f"Added rate limiting rule: {name}")
    
    def remove_rule(self, name: str):
        """Remove a rate limiting rule."""
        if name in self.default_rules:
            del self.default_rules[name]
            logger.info(f"Removed rate limiting rule: {name}")
    
    def clear_rate_limit(self, identifier: str, rule_name: str = None):
        """Clear rate limit for a specific identifier."""
        try:
            if rule_name:
                rule = self.default_rules.get(rule_name)
                if rule:
                    cache_key = self._generate_cache_key(identifier, rule_name, rule.scope)
                    self.redis_client.delete(cache_key)
                    self.redis_client.delete(f"{cache_key}:bucket")
                    self.redis_client.delete(f"{cache_key}:leaky")
                    self.redis_client.delete(f"{cache_key}:burst")
            else:
                # Clear all rate limits for identifier
                for rule_name, rule in self.default_rules.items():
                    cache_key = self._generate_cache_key(identifier, rule_name, rule.scope)
                    self.redis_client.delete(cache_key)
                    self.redis_client.delete(f"{cache_key}:bucket")
                    self.redis_client.delete(f"{cache_key}:leaky")
                    self.redis_client.delete(f"{cache_key}:burst")
            
            logger.info(f"Cleared rate limits for {identifier} (rule: {rule_name or 'all'})")
        except Exception as e:
            logger.error(f"Failed to clear rate limit: {e}")

    # Backward-compatibility: support @rate_limiter.limit("100/minute") usage
    def limit(self, spec: str):
        """Return a decorator based on string spec like '100/minute', '10/second', '1000/hour'."""
        try:
            value, unit = spec.split("/")
            requests = int(value.strip())
            unit = unit.strip().lower()
            if unit in ("minute", "min", "per_minute"):
                window = 60
            elif unit in ("second", "sec", "per_second"):
                window = 1
            elif unit in ("hour", "per_hour"):
                window = 3600
            else:
                # Default to minute if unknown
                window = 60
            # Register rule name deterministically
            rule_name = f"api_custom_{requests}_{window}"
            try:
                self.add_rule(rule_name, RateLimitRule(max_requests=requests, window_seconds=window))
            except Exception:
                pass
            from functools import wraps
            def _decorator(func):
                @wraps(func)
                async def _wrapper(*args, **kwargs):
                    # Reuse standalone decorator implementation
                    from .rate_limiter import rate_limit as _rate_limit  # type: ignore
                    return await _rate_limit(requests=requests, window=window)(func)(*args, **kwargs)
                return _wrapper
            return _decorator
        except Exception:
            # Fallback to pass-through
            def _noop(func):
                return func
            return _noop

# Global rate limiter instance
_rate_limiter_instance = None

def get_rate_limiter() -> EnterpriseRateLimiter:
    """Get or create the global rate limiter instance."""
    global _rate_limiter_instance
    if _rate_limiter_instance is None:
        _rate_limiter_instance = EnterpriseRateLimiter()
    return _rate_limiter_instance

# Convenience functions
async def check_rate_limit(
    identifier: str,
    rule_name: str = "api_general",
    context: Optional[Dict[str, Any]] = None
) -> RateLimitResult:
    """Convenience function to check rate limit."""
    limiter = get_rate_limiter()
    return await limiter.check_rate_limit(identifier, rule_name, context)

def clear_rate_limit(identifier: str, rule_name: str = None):
    """Convenience function to clear rate limit."""
    limiter = get_rate_limiter()
    limiter.clear_rate_limit(identifier, rule_name)


def rate_limit(requests: int = 60, window: int = 60, rule_name: Optional[str] = None) -> Callable:
    """
    FastAPI-compatible decorator to rate-limit endpoints.
    Usage:
        @router.get("/path")
        @rate_limit(requests=10, window=60)
        async def handler(current_user: dict = Depends(get_current_user)):
            ...
    """
    custom_rule_name = rule_name or f"api_custom_{requests}_{window}"
    limiter = get_rate_limiter()
    try:
        limiter.add_rule(custom_rule_name, RateLimitRule(max_requests=requests, window_seconds=window))
    except Exception:
        pass

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Try to identify the caller
            identifier = "anonymous"
            # Common name used across routes
            cu = kwargs.get("current_user")
            if isinstance(cu, dict):
                identifier = cu.get("id") or cu.get("user_id") or identifier
            # Fallback: scan kwargs for dict-like with id
            if identifier == "anonymous":
                for v in kwargs.values():
                    if isinstance(v, dict) and ("id" in v or "user_id" in v):
                        identifier = v.get("id") or v.get("user_id") or identifier
                        break
            result = await check_rate_limit(identifier=str(identifier), rule_name=custom_rule_name)
            if not result.allowed:
                from fastapi import HTTPException
                raise HTTPException(status_code=429, detail="Rate limit exceeded", headers={"Retry-After": str(result.retry_after or 1)})
            return await func(*args, **kwargs)

        # Support sync endpoints too
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            loop = asyncio.new_event_loop()
            try:
                asyncio.set_event_loop(loop)
                return loop.run_until_complete(async_wrapper(*args, **kwargs))
            finally:
                loop.close()
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator