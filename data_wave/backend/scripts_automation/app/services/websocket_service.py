"""
WebSocket Service - Enterprise wrapper over the platform WebSocket manager
Provides a simple service interface for broadcasting and targeted messaging
without coupling callers to the API layer implementation.
"""

from typing import Any, Dict, List, Optional


class WebSocketService:
    """Facade for broadcasting messages to connected clients."""

    async def broadcast_json(self, payload: Dict[str, Any], exclude_user: Optional[str] = None) -> None:
        """Broadcast a JSON payload to all clients, optionally excluding a user."""
        try:
            # Lazy import to avoid circular imports at module load time
            from app.api.routes.websocket_routes import ws_manager
            if exclude_user:
                # Send to all except the excluded user by iterating user connections
                for user_id, connections in list(ws_manager.user_connections.items()):
                    if user_id == exclude_user:
                        continue
                    for connection_id in list(connections):
                        await ws_manager.send_personal_message(payload, connection_id)
            else:
                await ws_manager.broadcast(payload)
        except Exception:
            # Silently ignore if websocket layer is unavailable
            return

    async def send_to_user(self, user_id: str, payload: Dict[str, Any]) -> None:
        try:
            from app.api.routes.websocket_routes import ws_manager
            await ws_manager.send_to_user(payload, user_id)
        except Exception:
            return

    async def send_to_room(self, room_id: str, payload: Dict[str, Any]) -> None:
        try:
            from app.api.routes.websocket_routes import ws_manager
            await ws_manager.send_to_room(payload, room_id)
        except Exception:
            return


class ConnectionManager:
    """Compatibility shim for modules that import ConnectionManager from services.
    Note: The API layer maintains the authoritative connection manager. This shim is a no-op
    to satisfy imports without affecting runtime behavior.
    """

    def __init__(self) -> None:
        self._noop = True

    async def connect(self, *args, **kwargs) -> None:  # pragma: no cover - compatibility
        return None

    async def disconnect(self, *args, **kwargs) -> None:  # pragma: no cover - compatibility
        return None

    async def broadcast(self, *args, **kwargs) -> None:  # pragma: no cover - compatibility
        return None


