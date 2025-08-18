"""
AdvancedMonitoringService
Provides system and model monitoring utilities used by ML and SSE routes.
"""

import logging
from typing import Any, Dict, List
from datetime import datetime, timedelta

try:
    import psutil  # type: ignore
except Exception:  # pragma: no cover
    psutil = None

logger = logging.getLogger(__name__)


class AdvancedMonitoringService:
    """Enterprise monitoring utilities."""

    async def get_system_metrics(self) -> Dict[str, Any]:
        """Return current system metrics (CPU, memory, storage)."""
        try:
            cpu = psutil.cpu_percent(interval=None) if psutil else 0.0
            mem = psutil.virtual_memory()._asdict() if psutil else {"percent": 0.0}
            disk = psutil.disk_usage("/")._asdict() if psutil else {"percent": 0.0}
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "cpu_percent": float(cpu),
                "memory": {"percent": float(mem.get("percent", 0.0))},
                "disk": {"percent": float(disk.get("percent", 0.0))},
            }
        except Exception as exc:
            logger.warning(f"get_system_metrics fallback: {exc}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "cpu_percent": 0.0,
                "memory": {"percent": 0.0},
                "disk": {"percent": 0.0},
            }

    async def get_model_uptime_events(self, model_id: str, start_time, end_time) -> List[Dict[str, Any]]:
        """
        Provide a synthesized list of uptime/downtime windows for a model.
        Each event: { start, end, status } where status in { 'up', 'down' }.
        """
        try:
            # Generate 4 windows alternating up/down ending at end_time
            windows: List[Dict[str, Any]] = []
            window_len = max(1, int((end_time - start_time).total_seconds() // 4))
            cursor = start_time
            status = "up"
            for _ in range(4):
                nxt = cursor + timedelta(seconds=window_len)
                windows.append({
                    "start": cursor.isoformat(),
                    "end": min(nxt, end_time).isoformat(),
                    "status": status,
                })
                cursor = nxt
                status = "down" if status == "up" else "up"
                if cursor >= end_time:
                    break
            return windows
        except Exception as exc:
            logger.warning(f"get_model_uptime_events fallback: {exc}")
            return []


