import asyncio
import logging
from typing import Dict, Tuple
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class _EndpointConcurrencyController:
    def __init__(self, limits: Dict[str, int], default_limit: int = 50) -> None:
        # Prefix -> semaphore
        self._limits = limits
        self._default_limit = default_limit
        self._semaphores: Dict[str, asyncio.Semaphore] = {}
        for prefix, limit in limits.items():
            self._semaphores[prefix] = asyncio.Semaphore(value=max(1, limit))

    def _match_prefix(self, path: str) -> Tuple[str, asyncio.Semaphore]:
        for prefix, sem in self._semaphores.items():
            if path.startswith(prefix):
                return prefix, sem
        # Fallback: a shared default semaphore per default bucket
        if "__default__" not in self._semaphores:
            self._semaphores["__default__"] = asyncio.Semaphore(value=max(1, self._default_limit))
        return "__default__", self._semaphores["__default__"]

    async def acquire(self, path: str, timeout: float = 2.0) -> Tuple[str, bool]:
        prefix, sem = self._match_prefix(path)
        try:
            await asyncio.wait_for(sem.acquire(), timeout=timeout)
            return prefix, True
        except asyncio.TimeoutError:
            return prefix, False

    def release(self, prefix: str) -> None:
        sem = self._semaphores.get(prefix)
        if sem:
            try:
                sem.release()
            except ValueError:
                pass


# Conservative per-prefix limits to protect DB under bursts
CONCURRENCY_LIMITS = {
    "/api/v1/catalog": 6,
    "/data-discovery": 5,  # Allow multiple discovery operations for enterprise features
    "/data-sources": 8,
    "/performance": 6,
}

controller = _EndpointConcurrencyController(CONCURRENCY_LIMITS, default_limit=80)


async def endpoint_concurrency_middleware(request: Request, call_next):
    # Skip WebSocket connections
    if request.scope.get("type") == "websocket":
        return await call_next(request)

    path = str(request.url.path)
    prefix, ok = await controller.acquire(path)
    if not ok:
        logger.warning(f"Endpoint concurrency limit reached for prefix {prefix} on {path}")
        return JSONResponse(
            status_code=429,
            content={
                "error": "Too Many Requests",
                "message": "Endpoint is receiving too many concurrent requests",
                "retry_after": 2
            },
            headers={"Retry-After": "2"}
        )

    try:
        response = await call_next(request)
        return response
    finally:
        controller.release(prefix)


