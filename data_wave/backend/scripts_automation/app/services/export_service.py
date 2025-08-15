from typing import List, Dict, Any
from io import StringIO
import csv

from .enterprise_catalog_service import EnterpriseIntelligentCatalogService, get_enterprise_catalog_service
from ..db_session import get_session
from sqlalchemy.ext.asyncio import AsyncSession

async def export_schema_to_csv(data_source_id: int, session: AsyncSession) -> str:
    service: EnterpriseIntelligentCatalogService = await get_enterprise_catalog_service()
    # Load discovered assets for the data source; fallback to simple query via service internals if needed
    # For robustness, we export minimal schema fields available from the service
    discovery = await service.discover_assets_intelligent(
        data_source_id=data_source_id,
        discovery_config={"mode": "schema_export", "limit": 1000},
        session=session,
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
