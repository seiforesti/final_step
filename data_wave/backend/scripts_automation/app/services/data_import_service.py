from typing import Dict, Any, List
from datetime import datetime
import csv
import json
import logging

from .data_source_service import DataSourceService
from ..db_session import get_session

logger = logging.getLogger(__name__)


class DataImportService:
    """Enterprise data import service."""

    async def import_data(
        self,
        import_source: str,
        import_format: str = "json",
        import_options: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        try:
            import_options = import_options or {}

            # Read file/URL
            if import_source.startswith("http://") or import_source.startswith("https://"):
                # Fetch via HTTP
                import aiohttp
                async with aiohttp.ClientSession() as session:
                    async with session.get(import_source, timeout=30) as resp:
                        resp.raise_for_status()
                        content = await resp.text()
            else:
                # Local file
                with open(import_source, "r", encoding="utf-8") as f:
                    content = f.read()

            # Parse content by format
            if import_format.lower() == "json":
                data = json.loads(content)
            elif import_format.lower() == "csv":
                reader = csv.DictReader(content.splitlines())
                data = list(reader)
            else:
                return {"success": False, "error": f"Unsupported import format: {import_format}"}

            records_imported = len(data) if isinstance(data, list) else 1

            # Optionally persist or link to a data source context (no-op here)
            return {
                "success": True,
                "records_imported": records_imported,
                "data": data,
                "details": {"format": import_format, "source": import_source},
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Import failed: {e}")
            return {"success": False, "error": str(e)}



