import asyncio
import logging
from typing import Dict, Tuple
from fastapi import Request

logger = logging.getLogger(__name__)


class _InFlightRegistry:
    """Tracks in-flight GET requests by key with an Event.

    We avoid sharing Response objects (streaming) across awaiters to prevent
    'anext(): asynchronous generator is already running'. Instead, non-originators
    wait for the originator to complete, then continue to the next middleware,
    which should hit the response cache.
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._inflight: Dict[Tuple[str, str], asyncio.Event] = {}

    async def mark_start(self, key: Tuple[str, str]) -> bool:
        async with self._lock:
            if key in self._inflight:
                return False
            self._inflight[key] = asyncio.Event()
            return True

    async def wait_for_completion(self, key: Tuple[str, str], timeout: float | None = 10.0) -> None:
        async with self._lock:
            event = self._inflight.get(key)
        if event is None:
            return
        try:
            await asyncio.wait_for(event.wait(), timeout=timeout)
        except asyncio.TimeoutError:
            # Give up waiting; proceed independently
            pass

    async def mark_done(self, key: Tuple[str, str]) -> None:
        async with self._lock:
            event = self._inflight.pop(key, None)
            if event is not None:
                event.set()


_registry = _InFlightRegistry()


async def request_collapse_middleware(request: Request, call_next):
    # Only collapse idempotent GET requests
    if request.method != "GET":
        return await call_next(request)

    # Key by method + full path with query string
    key: Tuple[str, str] = (request.method, str(request.url))
    is_originator = await _registry.mark_start(key)

    if not is_originator:
        logger.debug(f"Collapsing duplicate request: {request.method} {request.url}")
        # Wait for originator to finish, then proceed (expect cache HIT)
        await _registry.wait_for_completion(key)
        return await call_next(request)

    try:
        response = await call_next(request)
        return response
    finally:
        await _registry.mark_done(key)


