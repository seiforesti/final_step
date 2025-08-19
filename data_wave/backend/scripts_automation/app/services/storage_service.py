import os
import shutil
from typing import Dict, Any, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """Enterprise storage operations for cleanup/export flows."""

    async def delete_paths(self, targets: List[str]) -> Dict[str, Any]:
        deleted = 0
        errors: List[str] = []
        for t in targets:
            try:
                if os.path.isdir(t):
                    shutil.rmtree(t, ignore_errors=False)
                    deleted += 1
                elif os.path.isfile(t):
                    os.remove(t)
                    deleted += 1
            except Exception as e:
                errors.append(f"{t}: {e}")
        return {"success": len(errors) == 0, "deleted": deleted, "errors": errors, "timestamp": datetime.utcnow().isoformat()}

    async def ensure_directory(self, path: str) -> Dict[str, Any]:
        try:
            os.makedirs(path, exist_ok=True)
            return {"success": True, "path": path}
        except Exception as e:
            return {"success": False, "error": str(e)}



