"""
Reports API Routes
Provides endpoints for data source report generation and management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.report_service import ReportService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE
)
from app.models.report_models import (
    ReportCreate, ReportUpdate, ReportResponse, ReportTemplateResponse,
    ReportStats, ReportType, ReportStatus, ReportFormat
)
from app.models.scan_models import DataSource

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/data-sources", tags=["reports"])

# ============================================================================
# REPORT MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/reports", response_model=List[ReportResponse])
async def get_reports(
    data_source_id: int,
    report_type: Optional[ReportType] = Query(None),
    status: Optional[ReportStatus] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get all reports for a data source"""
    try:
        reports = ReportService.get_reports_by_data_source(session, data_source_id)
        
        # Apply filters
        if report_type:
            reports = [r for r in reports if r.report_type == report_type]
        if status:
            reports = [r for r in reports if r.status == status]
        
        # Apply limit
        return reports[:limit]
    except Exception as e:
        logger.error(f"Error getting reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{data_source_id}/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    data_source_id: int,
    report_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get a specific report by ID"""
    try:
        report = ReportService.get_report_by_id(session, report_id)
        if not report or report.data_source_id != data_source_id:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{data_source_id}/reports", response_model=ReportResponse)
async def create_report(
    data_source_id: int,
    report_data: ReportCreate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Create a new report"""
    try:
        # Set data source ID from path
        report_data.data_source_id = data_source_id
        user_id = current_user.get("username") or current_user.get("email")
        return ReportService.create_report(session, report_data, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{data_source_id}/reports/{report_id}")
async def delete_report(
    data_source_id: int,
    report_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Delete a report"""
    try:
        # Verify report belongs to data source
        report = ReportService.get_report_by_id(session, report_id)
        if not report or report.data_source_id != data_source_id:
            raise HTTPException(status_code=404, detail="Report not found")
        
        user_id = current_user.get("username") or current_user.get("email")
        success = ReportService.delete_report(session, report_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Report deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# REPORT GENERATION ENDPOINTS
# ============================================================================

@router.post("/{data_source_id}/reports/{report_id}/generate")
async def generate_report(
    data_source_id: int,
    report_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Generate a report"""
    try:
        # Verify report belongs to data source
        report = ReportService.get_report_by_id(session, report_id)
        if not report or report.data_source_id != data_source_id:
            raise HTTPException(status_code=404, detail="Report not found")
        
        user_id = current_user.get("username") or current_user.get("email")
        success = ReportService.generate_report(session, report_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Report generation started successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{data_source_id}/reports/{report_id}/cancel")
async def cancel_report_generation(
    data_source_id: int,
    report_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Cancel report generation"""
    try:
        # Verify report belongs to data source
        report = ReportService.get_report_by_id(session, report_id)
        if not report or report.data_source_id != data_source_id:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # This would need to be implemented in ReportService
        # For now, return a placeholder response
        return {"message": "Report generation cancellation not implemented yet"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling report generation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{data_source_id}/reports/{report_id}/download")
async def download_report(
    data_source_id: int,
    report_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Download a generated report"""
    try:
        # Verify report belongs to data source
        report = ReportService.get_report_by_id(session, report_id)
        if not report or report.data_source_id != data_source_id:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if report.status != ReportStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Report not ready for download")
        
        # This would need to be implemented in ReportService
        # For now, return a placeholder response
        return {"message": "Report download not implemented yet", "file_path": report.file_path}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# REPORT SCHEDULING ENDPOINTS
# ============================================================================

@router.post("/{data_source_id}/reports/{report_id}/schedule")
async def schedule_report(
    data_source_id: int,
    report_id: int,
    schedule_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Schedule a report for periodic generation"""
    try:
        # Verify report belongs to data source
        report = ReportService.get_report_by_id(session, report_id)
        if not report or report.data_source_id != data_source_id:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Update report with schedule
        update_data = ReportUpdate(
            is_scheduled=True,
            schedule_cron=schedule_data.get("cron_expression")
        )
        user_id = current_user.get("username") or current_user.get("email")
        result = ReportService.update_report(session, report_id, update_data, user_id)
        if not result:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {"message": "Report scheduled successfully", "report": result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scheduling report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# REPORT STATISTICS ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/reports/stats", response_model=ReportStats)
async def get_report_stats(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get report statistics for a data source"""
    try:
        return ReportService.get_report_stats(session, data_source_id)
    except Exception as e:
        logger.error(f"Error getting report stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# REPORT TEMPLATES ENDPOINTS
# ============================================================================

@router.get("/report-templates", response_model=List[ReportTemplateResponse])
async def get_report_templates(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get all available report templates"""
    try:
        return ReportService.get_templates(session)
    except Exception as e:
        logger.error(f"Error getting report templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
