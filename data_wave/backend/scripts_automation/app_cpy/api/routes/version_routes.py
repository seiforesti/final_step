"""
Version History API Routes
Provides endpoints for data source version management and history tracking
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.version_service import VersionService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE
)
from app.models.version_models import (
    DataSourceVersionResponse, VersionChangeResponse, VersionCreate, VersionUpdate,
    VersionStats, VersionStatus, ChangeType
)
from app.models.scan_models import DataSource

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/data-sources", tags=["version-history"])

# ============================================================================
# VERSION HISTORY ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/version-history", response_model=List[DataSourceVersionResponse])
async def get_version_history(
    data_source_id: int,
    limit: int = Query(50, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get version history for a data source"""
    try:
        versions = VersionService.get_versions_by_data_source(session, data_source_id)
        return versions[:limit]
    except Exception as e:
        logger.error(f"Error getting version history: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{data_source_id}/version-history/current", response_model=DataSourceVersionResponse)
async def get_current_version(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get current active version for a data source"""
    try:
        version = VersionService.get_current_version(session, data_source_id)
        if not version:
            raise HTTPException(status_code=404, detail="No current version found")
        return version
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current version: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{data_source_id}/version-history", response_model=DataSourceVersionResponse)
async def create_version(
    data_source_id: int,
    version_data: VersionCreate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Create a new version"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        return VersionService.create_version(session, data_source_id, version_data, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating version: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{data_source_id}/version-history/{version_id}", response_model=DataSourceVersionResponse)
async def update_version(
    data_source_id: int,
    version_id: int,
    version_data: VersionUpdate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update a version"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        result = VersionService.update_version(session, version_id, version_data, user_id)
        if not result:
            raise HTTPException(status_code=404, detail="Version not found")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating version: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{data_source_id}/version-history/{version_id}")
async def delete_version(
    data_source_id: int,
    version_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Delete a version"""
    try:
        success = VersionService.delete_version(session, version_id)
        if not success:
            raise HTTPException(status_code=404, detail="Version not found")
        return {"message": "Version deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting version: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# VERSION RESTORE ENDPOINTS
# ============================================================================

@router.post("/{data_source_id}/version-history/restore")
async def restore_version(
    data_source_id: int,
    restore_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Restore to a specific version"""
    try:
        version_id = restore_data.get("version_id")
        if not version_id:
            raise HTTPException(status_code=400, detail="version_id is required")
        
        user_id = current_user.get("username") or current_user.get("email")
        success = VersionService.restore_version(session, data_source_id, version_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Version not found or cannot be restored")
        return {"message": "Version restored successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring version: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{data_source_id}/version-history/rollback")
async def rollback_version(
    data_source_id: int,
    rollback_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Rollback to previous version"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        success = VersionService.rollback_version(session, data_source_id, user_id)
        if not success:
            raise HTTPException(status_code=400, detail="Cannot rollback version")
        return {"message": "Version rolled back successfully"}
    except Exception as e:
        logger.error(f"Error rolling back version: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# VERSION COMPARISON ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/version-history/compare")
async def compare_versions(
    data_source_id: int,
    version1_id: int = Query(..., description="First version ID"),
    version2_id: int = Query(..., description="Second version ID"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Compare two versions"""
    try:
        comparison = VersionService.compare_versions(session, version1_id, version2_id)
        if not comparison:
            raise HTTPException(status_code=404, detail="One or both versions not found")
        return comparison
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing versions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# VERSION STATISTICS ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/version-history/stats", response_model=VersionStats)
async def get_version_stats(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get version statistics for a data source"""
    try:
        return VersionService.get_version_stats(session, data_source_id)
    except Exception as e:
        logger.error(f"Error getting version stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# VERSION CHANGES ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/version-history/{version_id}/changes", response_model=List[VersionChangeResponse])
async def get_version_changes(
    data_source_id: int,
    version_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get changes for a specific version"""
    try:
        changes = VersionService.get_version_changes(session, version_id)
        return changes
    except Exception as e:
        logger.error(f"Error getting version changes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
