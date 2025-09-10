"""
Rate Limiting Middleware
========================
Prevents API loops and excessive requests by implementing rate limiting.
This middleware helps prevent the frontend from making too many requests.
"""

import time
import logging
from typing import Dict, Tuple
from collections import defaultdict, deque
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
import asyncio

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.cleanup_interval = 60  # Clean up old entries every 60 seconds
        self.last_cleanup = time.time()
    
    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Check if request is allowed based on rate limit"""
        now = time.time()
        
        # Clean up old entries periodically
        if now - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_entries(now)
            self.last_cleanup = now
        
        # Get request history for this key
        request_times = self.requests[key]
        
        # Remove requests outside the window
        cutoff_time = now - window_seconds
        while request_times and request_times[0] < cutoff_time:
            request_times.popleft()
        
        # Check if we're under the limit
        if len(request_times) < max_requests:
            request_times.append(now)
            return True
        
        return False
    
    def _cleanup_old_entries(self, now: float):
        """Clean up old entries to prevent memory leaks"""
        cutoff_time = now - 3600  # Remove entries older than 1 hour
        keys_to_remove = []
        
        for key, request_times in self.requests.items():
            while request_times and request_times[0] < cutoff_time:
                request_times.popleft()
            
            if not request_times:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.requests[key]

# Global rate limiter instance
rate_limiter = RateLimiter()

# Rate limit configurations
RATE_LIMITS = {
    # Global search endpoints
    "/api/v1/global-search/saved-searches": (50, 60),  # 50 requests per minute
    "/api/v1/global-search/popular-searches": (100, 60),  # 100 requests per minute
    "/api/v1/global-search/search": (200, 60),  # 200 requests per minute
    # Catalog endpoints (can trigger heavy metadata reflection)
    "/api/v1/catalog": (30, 60),
    # Data discovery/schema endpoints (noisy under polling)
    "/data-discovery": (20, 60),  # prefix match via startswith
    # Data sources routes (multiple routers use this prefix)
    "/data-sources": (60, 60),  # prefix match via startswith
    
    # Racine orchestration endpoints
    "/racine/orchestration/active": (100, 60),  # 100 requests per minute
    "/racine/orchestration/recommendations": (50, 60),  # 50 requests per minute
    "/racine/orchestration/health": (200, 60),  # 200 requests per minute
    "/racine/orchestration/metrics": (100, 60),  # 100 requests per minute
    "/racine/orchestration/alerts": (100, 60),  # 100 requests per minute
    
    # Auth endpoints
    "/auth/profile": (100, 60),  # 100 requests per minute
    "/auth/preferences": (100, 60),  # 100 requests per minute
    "/auth/notifications": (100, 60),  # 100 requests per minute
    "/auth/analytics": (100, 60),  # 100 requests per minute
    "/auth/activity/summary": (100, 60),  # 100 requests per minute
    "/auth/usage/statistics": (100, 60),  # 100 requests per minute
    "/auth/api-keys": (50, 60),  # 50 requests per minute
    "/auth/custom-themes": (50, 60),  # 50 requests per minute
    "/auth/custom-layouts": (50, 60),  # 50 requests per minute
    "/auth/device-preferences": (100, 60),  # 100 requests per minute
    
    # RBAC endpoints
    "/rbac/user/permissions": (100, 60),  # 100 requests per minute
    "/rbac/roles": (100, 60),  # 100 requests per minute
    "/rbac/user/roles": (100, 60),  # 100 requests per minute
    "/rbac/permissions": (100, 60),  # 100 requests per minute
    "/rbac/access-requests": (50, 60),  # 50 requests per minute
    
    # Performance endpoints
    "/performance/alerts": (100, 60),  # 100 requests per minute
    "/performance/thresholds": (100, 60),  # 100 requests per minute
    "/performance/metrics": (200, 60),  # 200 requests per minute
    
    # Default rate limit for all other endpoints (tighten to reduce floods)
    "default": (300, 60),  # 300 requests per minute per-IP per-path
}

def get_rate_limit_for_path(path: str) -> Tuple[int, int]:
    """Get rate limit configuration for a given path"""
    # Check for exact match first
    if path in RATE_LIMITS:
        return RATE_LIMITS[path]
    
    # Check for prefix matches
    for pattern, limits in RATE_LIMITS.items():
        if pattern != "default" and path.startswith(pattern):
            return limits
    
    # Return default rate limit
    return RATE_LIMITS["default"]

async def rate_limiting_middleware(request: Request, call_next):
    """Rate limiting middleware function"""
    try:
        # Get client identifier (IP address)
        client_ip = request.client.host if request.client else "unknown"
        
        # Get the request path
        path = str(request.url.path)
        
        # Get rate limit configuration
        max_requests, window_seconds = get_rate_limit_for_path(path)
        
        # Create rate limit key
        rate_limit_key = f"{client_ip}:{path}"
        
        # Check if request is allowed
        if not rate_limiter.is_allowed(rate_limit_key, max_requests, window_seconds):
            logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {max_requests} requests per {window_seconds} seconds",
                    "retry_after": window_seconds
                },
                headers={"Retry-After": str(window_seconds)}
            )
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Window"] = str(window_seconds)
        
        return response
        
    except Exception as e:
        logger.error(f"Error in rate limiting middleware: {e}")
        # If rate limiting fails, allow the request to proceed
        return await call_next(request)

# Circuit breaker for failed endpoints
class CircuitBreaker:
    """Simple circuit breaker to prevent cascading failures"""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count: Dict[str, int] = defaultdict(int)
        self.last_failure_time: Dict[str, float] = {}
        self.circuit_open: Dict[str, bool] = defaultdict(bool)
    
    def is_circuit_open(self, endpoint: str) -> bool:
        """Check if circuit breaker is open for an endpoint"""
        if not self.circuit_open[endpoint]:
            return False
        
        # Check if recovery timeout has passed
        last_failure = self.last_failure_time.get(endpoint, 0)
        if time.time() - last_failure > self.recovery_timeout:
            # Reset circuit breaker
            self.circuit_open[endpoint] = False
            self.failure_count[endpoint] = 0
            return False
        
        return True
    
    def record_success(self, endpoint: str):
        """Record a successful request"""
        self.failure_count[endpoint] = 0
        self.circuit_open[endpoint] = False
    
    def record_failure(self, endpoint: str):
        """Record a failed request"""
        self.failure_count[endpoint] += 1
        self.last_failure_time[endpoint] = time.time()
        
        if self.failure_count[endpoint] >= self.failure_threshold:
            self.circuit_open[endpoint] = True
            logger.warning(f"Circuit breaker opened for {endpoint}")

# Global circuit breaker instance
circuit_breaker = CircuitBreaker()

async def circuit_breaker_middleware(request: Request, call_next):
    """Circuit breaker middleware function"""
    try:
        endpoint = str(request.url.path)
        
        # Check if circuit breaker is open
        if circuit_breaker.is_circuit_open(endpoint):
            logger.warning(f"Circuit breaker is open for {endpoint}")
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Service temporarily unavailable",
                    "message": "Endpoint is temporarily unavailable due to recent failures",
                    "retry_after": 60
                },
                headers={"Retry-After": "60"}
            )
        
        # Process the request
        response = await call_next(request)
        
        # Record success or failure
        if response.status_code < 500:
            circuit_breaker.record_success(endpoint)
        else:
            circuit_breaker.record_failure(endpoint)
        
        return response
        
    except Exception as e:
        logger.error(f"Error in circuit breaker middleware: {e}")
        # If circuit breaker fails, allow the request to proceed
        return await call_next(request)


