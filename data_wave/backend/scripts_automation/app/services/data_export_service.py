from typing import Dict, Any
import logging

from .export_service import ExportService

logger = logging.getLogger(__name__)


class DataExportService:
    """Data export orchestrator built on top of ExportService."""

    async def export_data(
        self,
        data_source_id: int,
        export_format: str = "csv",
        export_options: Dict[str, Any] | None = None,
        filters: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        try:
            return await ExportService().export_data(
                data_source_id=data_source_id,
                export_format=export_format,
                export_options=export_options,
                filters=filters,
            )
        except Exception as e:
            logger.error(f"DataExportService export_data error: {e}")
            return {"success": False, "error": str(e)}



