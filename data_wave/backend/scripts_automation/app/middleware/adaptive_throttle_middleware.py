import time
import asyncio
import logging
from typing import Dict, Tuple
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class TokenBucket:
    def __init__(self, rate_per_sec: float, capacity: int) -> None:
        self.rate = max(0.1, rate_per_sec)
        self.capacity = max(1, capacity)
        self.tokens = float(capacity)
        self.timestamp = time.time()
        self._lock = asyncio.Lock()

    async def allow(self) -> bool:
        async with self._lock:
            now = time.time()
            elapsed = now - self.timestamp
            self.timestamp = now
            # Refill
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
            if self.tokens >= 1.0:
                self.tokens -= 1.0
                return True
            return False

    def reconfigure(self, rate_per_sec: float, capacity: int) -> None:
        # Non-strict; safe to call occasionally
        self.rate = max(0.1, rate_per_sec)
        self.capacity = max(1, capacity)
        self.tokens = min(self.tokens, float(self.capacity))


class AdaptiveThrottle:
    def __init__(self) -> None:
        # Global bucket (defaults; can be tuned via env later)
        self.global_bucket = TokenBucket(rate_per_sec=150.0, capacity=300)
        # Per-path buckets (lazy)
        self.path_buckets: Dict[str, TokenBucket] = {}
        # Per-IP buckets to avoid single client flooding
        self.ip_buckets: Dict[str, TokenBucket] = {}
        # Last adapt time
        self._last_adapt = 0.0

    def _get_path_bucket(self, path: str) -> TokenBucket:
        # Default per-path: 20 rps burst 40
        bucket = self.path_buckets.get(path)
        if bucket is None:
            bucket = TokenBucket(rate_per_sec=20.0, capacity=40)
            self.path_buckets[path] = bucket
        return bucket

    def _get_ip_bucket(self, ip: str) -> TokenBucket:
        # Default per-IP: 30 rps burst 60 across all paths
        bucket = self.ip_buckets.get(ip)
        if bucket is None:
            bucket = TokenBucket(rate_per_sec=30.0, capacity=60)
            self.ip_buckets[ip] = bucket
        return bucket

    def _adapt_from_db(self) -> None:
        now = time.time()
        if now - self._last_adapt < 2.0:
            return
        self._last_adapt = now
        try:
            from app.db_session import get_connection_pool_status
            status = get_connection_pool_status()
            util = status.get("utilization_percentage", 0)
            if isinstance(util, (int, float)):
                # If DB pool is hot, reduce allowed rates; if cool, gradually restore
                if util >= 85.0:
                    self.global_bucket.reconfigure(rate_per_sec=60.0, capacity=120)
                elif util >= 70.0:
                    self.global_bucket.reconfigure(rate_per_sec=90.0, capacity=180)
                else:
                    self.global_bucket.reconfigure(rate_per_sec=150.0, capacity=300)
        except Exception:
            # If introspection fails, do nothing
            pass


_throttle = AdaptiveThrottle()


async def adaptive_throttle_middleware(request: Request, call_next):
    # Skip WebSocket and non-HTTP
    if request.scope.get("type") != "http":
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    path = str(request.url.path)

    # Adapt rates based on DB utilization
    _throttle._adapt_from_db()

    # Global gate
    if not await _throttle.global_bucket.allow():
        return JSONResponse(status_code=429, content={"error": "Too Many Requests", "message": "Global throttle active", "retry_after": 1}, headers={"Retry-After": "1"})

    # Per-IP gate
    if not await _throttle._get_ip_bucket(client_ip).allow():
        return JSONResponse(status_code=429, content={"error": "Too Many Requests", "message": "Per-IP throttle active", "retry_after": 1}, headers={"Retry-After": "1"})

    # Per-path gate
    if not await _throttle._get_path_bucket(path).allow():
        return JSONResponse(status_code=429, content={"error": "Too Many Requests", "message": "Per-path throttle active", "retry_after": 1}, headers={"Retry-After": "1"})

    return await call_next(request)


