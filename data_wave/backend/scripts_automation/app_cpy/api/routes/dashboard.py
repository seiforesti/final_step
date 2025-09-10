from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.db_session import get_session
from app.services.dashboard_service import DashboardService
from app.services.lineage_service import LineageService
from app.services.compliance_service import ComplianceService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_DASHBOARD_VIEW, PERMISSION_DASHBOARD_EXPORT,
    PERMISSION_LINEAGE_VIEW, PERMISSION_LINEAGE_EXPORT,
    PERMISSION_COMPLIANCE_VIEW, PERMISSION_COMPLIANCE_EXPORT
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def get_scan_summary_stats(
    days: int = Query(30, description="Number of days to look back"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DASHBOARD_VIEW))
) -> Dict[str, Any]:
    """Get summary statistics for scans."""
    return DashboardService.get_scan_summary_stats(session, days)

@router.get("/trends")
async def get_scan_trend_data(
    days: int = Query(30, description="Number of days to look back"),
    interval: str = Query("day", description="Interval for grouping (day, week, month)"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DASHBOARD_VIEW))
) -> Dict[str, Any]:
    """Get trend data for scans over time."""
    return DashboardService.get_scan_trend_data(session, days, interval)

@router.get("/data-sources")
async def get_data_source_stats(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DASHBOARD_VIEW))
) -> Dict[str, Any]:
    """Get statistics for data sources."""
    return DashboardService.get_data_source_stats(session)

@router.get("/metadata")
async def get_metadata_stats(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_DASHBOARD_VIEW))
) -> Dict[str, Any]:
    """Get statistics for metadata collected from scans."""
    return DashboardService.get_metadata_stats(session)

@router.get("/lineage")
async def get_data_lineage(
    data_source_id: Optional[int] = Query(None, description="ID of the data source to filter by"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_LINEAGE_VIEW))
) -> Dict[str, Any]:
    """Get data lineage information."""
    return DashboardService.get_data_lineage(session, data_source_id)

@router.get("/compliance")
async def get_compliance_report(
    data_source_id: Optional[int] = Query(None, description="ID of the data source to filter by"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW))
) -> Dict[str, Any]:
    """Generate a compliance report."""
    return DashboardService.get_compliance_report(session, data_source_id)

# Lineage endpoints
@router.get("/lineage/graph")
async def get_lineage_graph(
    data_source_id: Optional[int] = Query(None, description="ID of the data source to filter by"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_LINEAGE_VIEW))
) -> Dict[str, Any]:
    """Generate a data lineage graph."""
    return LineageService.generate_lineage_graph(session, data_source_id)

@router.get("/lineage/entity/{entity_type}/{entity_id}")
async def get_lineage_for_entity(
    entity_type: str,
    entity_id: str,
    depth: int = Query(2, description="Depth of lineage to retrieve"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_LINEAGE_VIEW))
) -> Dict[str, Any]:
    """Get lineage for a specific entity."""
    return LineageService.get_lineage_for_entity(session, entity_type, entity_id, depth)

@router.post("/lineage/export-to-purview")
async def export_lineage_to_purview(
    data_source_id: Optional[int] = Query(None, description="ID of the data source to filter by"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_LINEAGE_EXPORT))
) -> Dict[str, Any]:
    """Export lineage information to Microsoft Purview."""
    return LineageService.export_lineage_to_purview(session, data_source_id)

# Compliance endpoints
@router.get("/compliance/standards")
async def get_compliance_standards(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW))
) -> Dict[str, Any]:
    """Get all supported compliance standards."""
    return ComplianceService.get_compliance_standards()

@router.get("/compliance/sensitivity-levels")
async def get_sensitivity_levels(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW))
) -> Dict[str, Any]:
    """Get all supported data sensitivity levels."""
    return ComplianceService.get_sensitivity_levels()

@router.get("/compliance/report/{standard_id}")
async def generate_compliance_report(
    standard_id: str,
    data_source_id: Optional[int] = Query(None, description="ID of the data source to filter by"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW))
) -> Dict[str, Any]:
    """Generate a compliance report for a specific standard."""
    return ComplianceService.generate_compliance_report(session, standard_id, data_source_id)

@router.get("/compliance/sensitivity-report")
async def generate_data_sensitivity_report(
    data_source_id: Optional[int] = Query(None, description="ID of the data source to filter by"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW))
) -> Dict[str, Any]:
    """Generate a data sensitivity report."""
    return ComplianceService.generate_data_sensitivity_report(session, data_source_id)