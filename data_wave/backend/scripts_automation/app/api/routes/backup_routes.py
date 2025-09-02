"""
Backup & Restore API Routes
Provides endpoints for data source backup and restore operations
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.backup_service import BackupService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE
)
from app.models.backup_models import (
    BackupOperationCreate, RestoreOperationCreate, BackupScheduleCreate,
    BackupOperationUpdate, RestoreOperationUpdate, BackupScheduleUpdate,
    BackupOperationResponse, RestoreOperationResponse, BackupScheduleResponse,
    BackupStatusResponse, BackupType, BackupStatus, RestoreStatus
)
from app.models.scan_models import DataSource

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/data-sources", tags=["backup-restore"])

# ============================================================================
# BACKUP STATUS ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/backup-status", response_model=BackupStatusResponse)
async def get_backup_status(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get comprehensive backup status for a data source
    
    Features:
    - Backup status overview
    - Recent backup operations
    - Scheduled backups
    - Storage usage statistics
    - Backup recommendations
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Get backup status using real service
        backup_status = BackupService.get_backup_status(session, data_source_id)
        return backup_status
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get backup status for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# ============================================================================
# BACKUP OPERATIONS ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/backups", response_model=List[BackupOperationResponse])
async def get_backups(
    data_source_id: int,
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get recent backup operations for a data source
    
    Features:
    - Recent backup operations
    - Configurable limit
    - Backup status tracking
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Get backups using real service
        backups = BackupService.get_recent_backups(session, data_source_id, limit)
        return backups
        
    except Exception as e:
        logger.error(f"Failed to get backups for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/{data_source_id}/backups", response_model=BackupOperationResponse)
async def create_backup(
    data_source_id: int,
    backup_data: BackupOperationCreate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Create a new backup operation
    
    Features:
    - Backup operation creation
    - Background execution
    - Status tracking
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Set data source ID from path
        backup_data.data_source_id = data_source_id
        user_id = current_user.get("username") or current_user.get("email")
        
        # Start backup using real service
        backup = BackupService.start_backup(session, backup_data, user_id)
        return backup
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create backup for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/{data_source_id}/backups/{backup_id}/cancel")
async def cancel_backup(
    data_source_id: int,
    backup_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Cancel a running backup operation
    
    Features:
    - Backup cancellation
    - Status update
    - Resource cleanup
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Cancel backup using real service
        success = BackupService.cancel_backup(session, backup_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backup not found or cannot be cancelled"
            )
        
        return {
            "success": True,
            "message": "Backup cancelled successfully",
            "backup_id": backup_id,
            "data_source_id": data_source_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel backup {backup_id} for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/{data_source_id}/backups/{backup_id}")
async def delete_backup(
    data_source_id: int,
    backup_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """
    Delete a backup operation
    
    Features:
    - Backup deletion
    - Resource cleanup
    - Storage reclamation
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Delete backup using real service
        success = BackupService.delete_backup(session, backup_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backup not found"
            )
        
        return {
            "success": True,
            "message": "Backup deleted successfully",
            "backup_id": backup_id,
            "data_source_id": data_source_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete backup {backup_id} for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# ============================================================================
# RESTORE OPERATIONS ENDPOINTS
# ============================================================================

@router.post("/{data_source_id}/backups/{backup_id}/restore", response_model=RestoreOperationResponse)
async def restore_backup(
    data_source_id: int,
    backup_id: int,
    restore_data: RestoreOperationCreate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Restore from a backup
    
    Features:
    - Backup restoration
    - Progress tracking
    - Status monitoring
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Set backup ID from path
        restore_data.backup_id = backup_id
        user_id = current_user.get("username") or current_user.get("email")
        
        # Start restore using real service
        restore = BackupService.start_restore(session, restore_data, user_id)
        return restore
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to start restore for backup {backup_id} in data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# ============================================================================
# BACKUP SCHEDULES ENDPOINTS
# ============================================================================

@router.get("/{data_source_id}/backup-schedules", response_model=List[BackupScheduleResponse])
async def get_backup_schedules(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get backup schedules for a data source
    
    Features:
    - Backup schedule management
    - Automated backup configuration
    - Schedule monitoring
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Get backup schedules using real service
        schedules = BackupService.get_backup_schedules(session, data_source_id)
        return schedules
        
    except Exception as e:
        logger.error(f"Failed to get backup schedules for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/{data_source_id}/backup-schedules", response_model=BackupScheduleResponse)
async def create_backup_schedule(
    data_source_id: int,
    schedule_data: BackupScheduleCreate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Create a new backup schedule
    
    Features:
    - Automated backup scheduling
    - Cron expression support
    - Retention policy configuration
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Set data source ID from path
        schedule_data.data_source_id = data_source_id
        user_id = current_user.get("username") or current_user.get("email")
        
        # Create backup schedule using real service
        schedule = BackupService.create_backup_schedule(session, schedule_data, user_id)
        return schedule
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create backup schedule for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/{data_source_id}/backup-schedules/{schedule_id}", response_model=BackupScheduleResponse)
async def update_backup_schedule(
    data_source_id: int,
    schedule_id: int,
    schedule_data: BackupScheduleUpdate = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """
    Update a backup schedule
    
    Features:
    - Schedule modification
    - Configuration updates
    - Policy adjustments
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        user_id = current_user.get("username") or current_user.get("email")
        
        # Update backup schedule using real service
        result = BackupService.update_backup_schedule(session, schedule_id, schedule_data, user_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backup schedule not found"
            )
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update backup schedule {schedule_id} for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/{data_source_id}/backup-schedules/{schedule_id}")
async def delete_backup_schedule(
    data_source_id: int,
    schedule_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """
    Delete a backup schedule
    
    Features:
    - Schedule removal
    - Resource cleanup
    - Policy termination
    """
    try:
        # Validate data source exists
        from app.models.scan_models import DataSource
        data_source = session.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {data_source_id} not found"
            )
        
        # Delete backup schedule using real service
        success = BackupService.delete_backup_schedule(session, schedule_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backup schedule not found"
            )
        
        return {
            "success": True,
            "message": "Backup schedule deleted successfully",
            "schedule_id": schedule_id,
            "data_source_id": data_source_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete backup schedule {schedule_id} for data source {data_source_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
