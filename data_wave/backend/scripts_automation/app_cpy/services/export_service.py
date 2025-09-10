from typing import List, Dict, Any
from io import StringIO
import csv
import logging

from .enterprise_catalog_service import EnterpriseIntelligentCatalogService, get_enterprise_catalog_service
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class ExportService:
    """High-level export service."""

    async def export_data(self, data_source_id: int, export_format: str = "csv", export_options: Dict[str, Any] | None = None, filters: Dict[str, Any] | None = None) -> Dict[str, Any]:
        try:
            export_options = export_options or {}
            filters = filters or {}
            if export_format.lower() != "csv":
                return {"success": False, "error": f"Unsupported export format: {export_format}"}
            csv_text = await export_schema_to_csv(data_source_id)
            return {
                "success": True,
                "records_exported": csv_text.count("\n") - 1 if csv_text else 0,
                "file_size_mb": round(len(csv_text.encode("utf-8")) / (1024 * 1024), 4),
                "details": {"format": export_format, "filters": filters, "options": export_options},
                "content": csv_text,
            }
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return {"success": False, "error": str(e)}


async def export_schema_to_csv(data_source_id: int) -> str:
    service: EnterpriseIntelligentCatalogService = await get_enterprise_catalog_service()
    discovery = await service.discover_assets_intelligent(
        data_source_id=data_source_id,
        discovery_config={"mode": "schema_export", "limit": 1000},
        session=None,
        user_id="system"
    )
    assets: List[Dict[str, Any]] = discovery.get("discovered_assets", [])

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "asset_id", "qualified_name", "display_name", "asset_type",
        "columns_count", "business_criticality", "quality_score"
    ])
    for asset in assets:
        writer.writerow([
            asset.get("id") or asset.get("asset_id"),
            asset.get("qualified_name") or asset.get("fqdn"),
            asset.get("display_name") or asset.get("name"),
            asset.get("asset_type"),
            len(asset.get("columns_info", []) or []),
            asset.get("business_criticality", "medium"),
            asset.get("quality_score", 0.0),
        ])
    return output.getvalue()
