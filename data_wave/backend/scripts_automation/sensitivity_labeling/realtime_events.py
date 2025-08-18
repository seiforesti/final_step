from typing import Any, Dict
from .websocket_manager import manager

async def notify_realtime_event(event: Dict[str, Any]):
    await manager.broadcast(event)