from typing import Dict, Any
import logging

from .data_import_service import DataImportService

logger = logging.getLogger(__name__)


class ImportService:
    """High-level import orchestrator that delegates to DataImportService."""

    async def import_data(self, *args, **kwargs) -> Dict[str, Any]:
        try:
            return await DataImportService().import_data(*args, **kwargs)
        except Exception as e:
            logger.error(f"ImportService import_data error: {e}")
            return {"success": False, "error": str(e)}



