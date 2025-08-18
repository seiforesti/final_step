from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session

from app.db_session import get_session
from app.services.incremental_scan_service import IncrementalScanService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_INCREMENTAL_SCAN_VIEW, PERMISSION_INCREMENTAL_SCAN_CREATE
)
from app.models.scan_models import Scan

router = APIRouter(prefix="/incremental-scan", tags=["incremental-scan"])

@router.post("/", response_model=Scan)
async def create_incremental_scan(
    data_source_id: int = Query(..., description="ID of the data source to scan"),
    base_scan_id: Optional[int] = Query(None, description="ID of the base scan to compare against (if None, a full scan will be performed)"),
    scan_rule_set_id: Optional[int] = Query(None, description="ID of the scan rule set to use"),
    custom_scan_rule_ids: List[int] = Query([], description="IDs of custom scan rules to apply"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_INCREMENTAL_SCAN_CREATE))
) -> Scan:
    """Create a new incremental scan."""
    try:
        service = IncrementalScanService(session)
        return service.create_incremental_scan(
            data_source_id=data_source_id,
            base_scan_id=base_scan_id,
            scan_rule_set_id=scan_rule_set_id,
            custom_scan_rule_ids=custom_scan_rule_ids,
            created_by=current_user.get("username", "system")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating incremental scan: {str(e)}")

@router.get("/{scan_id}/changes", response_model=Dict[str, Any])
async def get_incremental_changes(
    scan_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_INCREMENTAL_SCAN_VIEW))
) -> Dict[str, Any]:
    """Get the changes detected in an incremental scan."""
    try:
        service = IncrementalScanService(session)
        changes = service.get_incremental_changes(scan_id)
        if not changes:
            raise HTTPException(status_code=404, detail="Incremental scan not found or no changes detected")
        return changes
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving incremental changes: {str(e)}")

@router.get("/{scan_id}/summary", response_model=Dict[str, Any])
async def get_incremental_scan_summary(
    scan_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_INCREMENTAL_SCAN_VIEW))
) -> Dict[str, Any]:
    """Get a summary of changes detected in an incremental scan."""
    try:
        service = IncrementalScanService(session)
        summary = service.get_incremental_scan_summary(scan_id)
        if not summary:
            raise HTTPException(status_code=404, detail="Incremental scan not found or no summary available")
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving incremental scan summary: {str(e)}")

@router.get("/history/{data_source_id}", response_model=List[Dict[str, Any]])
async def get_incremental_scan_history(
    data_source_id: int,
    limit: int = Query(10, description="Maximum number of scans to return"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_INCREMENTAL_SCAN_VIEW))
) -> List[Dict[str, Any]]:
    """Get the incremental scan history for a data source."""
    try:
        service = IncrementalScanService(session)
        return service.get_incremental_scan_history(data_source_id, limit)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving incremental scan history: {str(e)}")