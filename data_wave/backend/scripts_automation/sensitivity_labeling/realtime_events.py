from typing import Any, Dict
import json
import logging
import redis

from app.core.config import settings
from .websocket_manager import manager

logger = logging.getLogger(__name__)

_redis_client = None

def _get_redis_client() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(settings.redis.url, decode_responses=True)
        except Exception as e:
            logger.warning(f"Realtime events Redis initialization failed: {e}")
            # Fallback: in-memory no-op client
            class _Noop:
                def publish(self, *args, **kwargs):
                    return 0
            _redis_client = _Noop()
    return _redis_client

async def notify_realtime_event(event: Dict[str, Any]):
    """Broadcast a realtime event to websockets and publish to Redis channel.
    This enables Server-Sent Events (SSE) consumers and distributed workers to receive events.
    """
    try:
        # Publish to Redis Pub/Sub channel for SSE subscribers
        client = _get_redis_client()
        try:
            client.publish("sensitivity_events", json.dumps(event, default=str))
        except Exception as e:
            logger.warning(f"Realtime events Redis publish failed: {e}")

        # Broadcast to active WebSocket clients
        await manager.broadcast(event)
    except Exception as e:
        logger.error(f"Realtime notify failed: {e}")