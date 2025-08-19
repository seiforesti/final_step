import os
import fnmatch
import asyncio
from typing import Dict, Any, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class FileSystemService:
    """Enterprise file system service with access checks and sync capabilities."""

    async def test_file_system_access(self, path: str) -> Dict[str, Any]:
        try:
            exists = os.path.exists(path)
            is_dir = os.path.isdir(path)
            readable = os.access(path, os.R_OK)
            writable = os.access(path, os.W_OK)
            return {
                "success": exists and readable,
                "exists": exists,
                "is_dir": is_dir,
                "readable": readable,
                "writable": writable,
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"File system access test failed for {path}: {e}")
            return {"success": False, "error": str(e)}

    async def close_file_system_connection(self, provider_id: str) -> Dict[str, Any]:
        # Stateless in this context; return success for compatibility
        return {"success": True, "provider_id": provider_id}

    async def sync_file_system_data(
        self,
        file_path: str,
        sync_type: str = "full",
        file_patterns: List[str] | None = None,
        recursive: bool = True,
    ) -> Dict[str, Any]:
        try:
            if not os.path.exists(file_path):
                return {"success": False, "error": f"Path does not exist: {file_path}"}

            matched_files: List[str] = []
            total_size = 0

            def match(name: str) -> bool:
                if not file_patterns:
                    return True
                return any(fnmatch.fnmatch(name, pattern) for pattern in file_patterns)

            if os.path.isfile(file_path):
                if match(os.path.basename(file_path)):
                    matched_files.append(file_path)
                    total_size += os.path.getsize(file_path)
            else:
                if recursive:
                    for root, _dirs, files in os.walk(file_path):
                        for f in files:
                            if match(f):
                                fp = os.path.join(root, f)
                                matched_files.append(fp)
                                try:
                                    total_size += os.path.getsize(fp)
                                except OSError:
                                    pass
                else:
                    for f in os.listdir(file_path):
                        fp = os.path.join(file_path, f)
                        if os.path.isfile(fp) and match(f):
                            matched_files.append(fp)
                            try:
                                total_size += os.path.getsize(fp)
                            except OSError:
                                pass

            # Simulate IO-bound indexing without blocking event loop
            await asyncio.sleep(0)  # yield control

            return {
                "success": True,
                "files_processed": len(matched_files),
                "data_size_mb": round(total_size / (1024 * 1024), 4),
                "details": {
                    "sync_type": sync_type,
                    "file_patterns": file_patterns or ["*"]
                },
            }
        except Exception as e:
            logger.error(f"File system sync failed: {e}")
            return {"success": False, "error": str(e)}

    async def check_file_system_health(self, path: str) -> Dict[str, Any]:
        try:
            stats = await self.test_file_system_access(path)
            if not stats.get("success"):
                return {"healthy": False, "error": stats.get("error", "access failed")}

            # Gather basic metrics
            is_dir = os.path.isdir(path)
            item_count = 1
            total_size = 0
            if is_dir:
                item_count = 0
                for root, dirs, files in os.walk(path):
                    item_count += len(dirs) + len(files)
                    for f in files:
                        fp = os.path.join(root, f)
                        try:
                            total_size += os.path.getsize(fp)
                        except OSError:
                            pass
            else:
                try:
                    total_size = os.path.getsize(path)
                except OSError:
                    total_size = 0

            return {
                "healthy": True,
                "metrics": {
                    "is_dir": is_dir,
                    "item_count": item_count,
                    "total_size_mb": round(total_size / (1024 * 1024), 4),
                },
            }
        except Exception as e:
            logger.error(f"File system health check failed: {e}")
            return {"healthy": False, "error": str(e)}



