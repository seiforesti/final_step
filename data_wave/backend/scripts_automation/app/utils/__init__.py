"""
Utils Package for Enterprise Data Governance Platform
===================================================

This package contains utility modules for the enterprise data governance platform.
"""

# Import utility modules
from . import (
    cache,
    rate_limiter,
    purview_utils
)

__all__ = [
    "cache",
    "rate_limiter", 
    "purview_utils",
    "audit_logger"
]


# Backward-compatible audit logger shim (module-like object with audit_log)
from typing import Any, Dict, Optional
import logging
from datetime import datetime

class _AuditLogger:
    def __init__(self):
        self._logger = logging.getLogger("app.audit")
    async def audit_log(self, action: str, user_id: Optional[str] = None, resource_type: Optional[str] = None,
                        resource_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> None:
        self._logger.info("AUDIT", extra={
            "audit": True,
            "action": action,
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow().isoformat()
        })

audit_logger = _AuditLogger()

