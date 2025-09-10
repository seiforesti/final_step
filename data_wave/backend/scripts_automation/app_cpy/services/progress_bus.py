import asyncio
from typing import Any, Dict, Optional, AsyncGenerator


class ProgressBus:
    """In-process async bus for streaming progress events per data source.

    Each data_source_id is associated with an asyncio.Queue of JSON-serializable
    dict events. Producers publish events; consumers subscribe and await items.
    """

    _queues: Dict[int, asyncio.Queue] = {}
    _last_event: Dict[int, Dict[str, Any]] = {}

    @classmethod
    def _get_queue(cls, data_source_id: int) -> asyncio.Queue:
        if data_source_id not in cls._queues:
            cls._queues[data_source_id] = asyncio.Queue(maxsize=1000)
        return cls._queues[data_source_id]

    @classmethod
    async def publish(cls, data_source_id: int, event: Dict[str, Any]) -> None:
        queue = cls._get_queue(data_source_id)
        try:
            await queue.put(event)
            cls._last_event[data_source_id] = event
        except Exception:
            # Best-effort: drop event on error
            pass

    @classmethod
    async def subscribe(
        cls,
        data_source_id: int,
        *,
        stop_on_completed: bool = True,
        idle_keepalive_seconds: float = 10.0,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Yield events as they arrive; optionally yield keep-alives when idle.

        Terminates automatically when an event has status == 'completed' and
        stop_on_completed is True.
        """
        queue = cls._get_queue(data_source_id)
        completed = False
        while not completed:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=idle_keepalive_seconds)
                yield event
                if stop_on_completed and event.get("status") == "completed":
                    completed = True
            except asyncio.TimeoutError:
                # Emit keepalive ping
                yield {"type": "keepalive", "timestamp": asyncio.get_event_loop().time()}

    @classmethod
    def last_event(cls, data_source_id: int) -> Optional[Dict[str, Any]]:
        return cls._last_event.get(data_source_id)


