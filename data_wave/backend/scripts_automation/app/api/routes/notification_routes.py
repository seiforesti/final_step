"""
Notification Enhancement API Routes
Provides endpoints for enhanced notification operations
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.notification_service import NotificationService
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SCAN_VIEW, PERMISSION_SCAN_EDIT, PERMISSION_SCAN_DELETE
)
from app.models.notification_models import (
    NotificationResponse, NotificationCreate, NotificationUpdate,
    NotificationStats, NotificationType, NotificationStatus
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["notifications"])

# ============================================================================
# NOTIFICATION MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    notification_type: Optional[NotificationType] = Query(None),
    status: Optional[NotificationStatus] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get notifications for the current user"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        notifications = NotificationService.get_user_notifications(session, user_id)
        
        # Apply filters
        if notification_type:
            notifications = [n for n in notifications if n.notification_type == notification_type]
        if status:
            notifications = [n for n in notifications if n.status == status]
        
        return notifications[:limit]
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# NOTIFICATION PREFERENCES ENDPOINTS (MUST BE BEFORE /{notification_id} ROUTE)
# ============================================================================

@router.get("/preferences")
async def get_notification_preferences(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get notification preferences for the current user"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        preferences = NotificationService.get_notification_preferences(session, user_id)
        return preferences
    except Exception as e:
        logger.error(f"Error getting notification preferences: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/preferences")
async def update_notification_preferences(
    preferences_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Update notification preferences for the current user"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        success = NotificationService.update_notification_preferences(session, user_id, preferences_data)
        if not success:
            raise HTTPException(status_code=400, detail="Invalid preferences data")
        return {"message": "Notification preferences updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating notification preferences: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get a specific notification by ID"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        notification = NotificationService.get_notification_by_id(session, notification_id, user_id)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        return notification
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Mark a notification as read"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        success = NotificationService.mark_notification_read(session, notification_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/mark-read")
async def mark_all_notifications_read(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Mark all notifications as read for the current user"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        count = NotificationService.mark_all_notifications_read(session, user_id)
        return {"message": f"Marked {count} notifications as read"}
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{notification_id}/acknowledge")
async def acknowledge_notification(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Acknowledge a notification"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        success = NotificationService.acknowledge_notification(session, notification_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification acknowledged"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error acknowledging notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_DELETE))
):
    """Delete a notification"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        success = NotificationService.delete_notification(session, notification_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# NOTIFICATION STATISTICS ENDPOINTS
# ============================================================================

@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get notification statistics for the current user"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        return NotificationService.get_notification_stats(session, user_id)
    except Exception as e:
        logger.error(f"Error getting notification stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# NOTIFICATION PREFERENCES ENDPOINTS (MOVED ABOVE TO AVOID ROUTE CONFLICTS)
# ============================================================================

# ============================================================================
# NOTIFICATION TEMPLATES ENDPOINTS
# ============================================================================

@router.get("/templates")
async def get_notification_templates(
    template_type: Optional[NotificationType] = Query(None),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get notification templates"""
    try:
        templates = NotificationService.get_notification_templates(session, template_type)
        return templates
    except Exception as e:
        logger.error(f"Error getting notification templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# NOTIFICATION CHANNELS ENDPOINTS
# ============================================================================

@router.get("/channels")
async def get_notification_channels(
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get available notification channels"""
    try:
        channels = NotificationService.get_notification_channels(session)
        return channels
    except Exception as e:
        logger.error(f"Error getting notification channels: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/channels/test")
async def test_notification_channel(
    channel_data: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_EDIT))
):
    """Test a notification channel"""
    try:
        user_id = current_user.get("username") or current_user.get("email")
        result = NotificationService.test_notification_channel(session, channel_data, user_id)
        return result
    except Exception as e:
        logger.error(f"Error testing notification channel: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
