import time
import hashlib
import logging
from typing import Dict, Tuple
from fastapi import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class _CacheEntry:
    __slots__ = ("expires_at", "stale_until", "bytes", "headers", "status_code", "media_type")

    def __init__(self, expires_at: float, stale_until: float, bytes_data: bytes, headers: Dict[str, str], status_code: int, media_type: str | None) -> None:
        self.expires_at = expires_at
        self.stale_until = stale_until
        self.bytes = bytes_data
        self.headers = headers
        self.status_code = status_code
        self.media_type = media_type


class _LRUCache:
    def __init__(self, max_items: int = 512) -> None:
        from collections import OrderedDict
        self.max_items = max_items
        self._store: "OrderedDict[str, _CacheEntry]" = OrderedDict()

    def get(self, key: str) -> _CacheEntry | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        # Move to end (most recent)
        self._store.move_to_end(key)
        return entry

    def set(self, key: str, entry: _CacheEntry) -> None:
        self._store[key] = entry
        self._store.move_to_end(key)
        if len(self._store) > self.max_items:
            self._store.popitem(last=False)


_cache = _LRUCache(max_items=1024)
_refreshing_keys: set[str] = set()


def _cache_key(request: Request) -> str:
    # Include path + sorted query + accept header (basic content negotiation)
    url = str(request.url)
    accept = request.headers.get("accept", "")
    key_raw = f"GET|{url}|{accept}"
    return hashlib.sha256(key_raw.encode("utf-8")).hexdigest()


HEAVY_WHITELIST_PREFIXES = (
    "/api/v1/catalog",
    "/data-discovery",
    "/data-sources",
    "/performance",
)


async def response_cache_middleware(request: Request, call_next):
    # Cache only idempotent GET requests
    if request.method != "GET":
        return await call_next(request)

    # Do not cache authenticated requests unless path is whitelisted (heavy endpoints)
    auth = request.headers.get("authorization")
    path = str(request.url.path)
    if auth and not any(path.startswith(p) for p in HEAVY_WHITELIST_PREFIXES):
        return await call_next(request)

    key = _cache_key(request)
    now = time.time()
    entry = _cache.get(key)
    if entry and entry.expires_at > now:
        logger.debug(f"Cache HIT for {request.url}")
        return Response(content=entry.bytes, status_code=entry.status_code, media_type=entry.media_type, headers=dict(entry.headers))

    # Serve stale within grace and refresh in background
    if entry and entry.stale_until > now:
        logger.debug(f"Cache STALE for {request.url} - serving stale and refreshing")
        if key not in _refreshing_keys:
            _refreshing_keys.add(key)

            async def _refresh():
                try:
                    resp: Response = await call_next(request)
                    try:
                        body = b"" if resp.body is None else resp.body
                    except Exception:
                        return
                    if resp.status_code == 200 and len(body) <= 512 * 1024:
                        ttl_seconds = 5.0
                        if path.startswith("/performance/") or path.startswith("/api/v1/global-search/"):
                            ttl_seconds = 10.0
                        if any(path.startswith(p) for p in HEAVY_WHITELIST_PREFIXES):
                            ttl_seconds = max(ttl_seconds, 15.0)
                        expires_at_i = time.time() + ttl_seconds
                        stale_grace_i = max(30.0, ttl_seconds * 4)
                        new_entry = _CacheEntry(expires_at_i, expires_at_i + stale_grace_i, body, dict(resp.headers), resp.status_code, resp.media_type)
                        _cache.set(key, new_entry)
                finally:
                    _refreshing_keys.discard(key)

            try:
                import asyncio as _asyncio
                _asyncio.create_task(_refresh())
            except Exception:
                pass

        stale_resp = Response(content=entry.bytes, status_code=entry.status_code, media_type=entry.media_type, headers=dict(entry.headers))
        stale_resp.headers["X-Response-Cache"] = "STALE"
        return stale_resp

    # Compute fresh; on failure serve stale if available
    try:
        response: Response = await call_next(request)
    except Exception as e:
        logger.warning(f"Downstream error for {request.url}: {e}. Serving stale if available.")
        if entry:
            stale_resp = Response(content=entry.bytes, status_code=entry.status_code, media_type=entry.media_type, headers=dict(entry.headers))
            stale_resp.headers["X-Response-Cache"] = "STALE_ON_ERROR"
            return stale_resp
        raise

    # Only cache successful, small-ish responses
    try:
        body = b"" if response.body is None else response.body
    except Exception:
        return response

    if response.status_code == 200 and len(body) <= 512 * 1024:
        ttl_seconds = 5.0
        if path.startswith("/performance/") or path.startswith("/api/v1/global-search/"):
            ttl_seconds = 10.0
        if any(path.startswith(p) for p in HEAVY_WHITELIST_PREFIXES):
            ttl_seconds = max(ttl_seconds, 15.0)
        expires_at = now + ttl_seconds
        stale_grace = max(30.0, ttl_seconds * 4)
        entry = _CacheEntry(expires_at, expires_at + stale_grace, body, dict(response.headers), response.status_code, response.media_type)
        _cache.set(key, entry)

        response.headers["X-Response-Cache"] = "MISS"
        response.headers["Cache-Control"] = f"public, max-age={int(ttl_seconds)}"

    return response


