from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db_session import get_session
from app.services.advanced_collaboration_service import AdvancedCollaborationService
# Align route model imports with actual enterprise collaboration models
from app.models.collaboration_models import (
    Workspace as CollaborativeWorkspace,
    CollaborativeDocument as SharedDocument,
    Discussion as CollaborationSession,
)
from app.api.security import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_COLLABORATION_VIEW, PERMISSION_COLLABORATION_MANAGE,
    PERMISSION_WORKSPACE_CREATE, PERMISSION_WORKSPACE_EDIT
)

router = APIRouter(prefix="/collaboration", tags=["Collaboration"])

@router.get("/workspaces")
async def get_collaboration_workspaces(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    workspace_type: Optional[str] = Query(None, description="Filter by workspace type"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
) -> Dict[str, Any]:
    """
    Get collaborative workspaces and shared projects
    
    Features:
    - Multi-user collaborative workspaces
    - Real-time document sharing
    - Project-based collaboration
    - Permission-based access control
    """
    try:
        result = AdvancedCollaborationService.get_user_workspaces(
            session=session,
            user_id=user_id or current_user.get("user_id"),
            workspace_type=workspace_type
        )
        
        return {
            "success": True,
            "data": result,
            "collaboration_features": [
                "real_time_editing",
                "multi_user_sessions",
                "permission_management",
                "workspace_templates"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workspaces: {str(e)}"
        )

@router.post("/workspaces")
async def create_collaboration_workspace(
    workspace_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKSPACE_CREATE))
) -> Dict[str, Any]:
    """Create a new collaborative workspace"""
    try:
        result = AdvancedCollaborationService.create_workspace(
            session=session,
            workspace_data=workspace_data,
            creator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Workspace created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workspace: {str(e)}"
        )

@router.get("/workspaces/{workspace_id}/documents")
async def get_collaboration_documents(
    workspace_id: str,
    document_type: Optional[str] = Query(None, description="Filter by document type"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
) -> Dict[str, Any]:
    """
    Get shared documents and collaborative content
    
    Features:
    - Real-time collaborative editing
    - Version history tracking
    - Comment and annotation system
    - Document templates and workflows
    """
    try:
        result = AdvancedCollaborationService.get_workspace_documents(
            session=session,
            workspace_id=workspace_id,
            document_type=document_type,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "collaboration_features": [
                "real_time_editing",
                "conflict_resolution",
                "version_tracking",
                "collaborative_annotations"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get documents: {str(e)}"
        )

@router.post("/workspaces/{workspace_id}/documents")
async def create_shared_document(
    workspace_id: str,
    document_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_MANAGE))
) -> Dict[str, Any]:
    """Create a new shared document in the workspace"""
    try:
        result = AdvancedCollaborationService.create_shared_document(
            session=session,
            workspace_id=workspace_id,
            document_data=document_data,
            creator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Document created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create document: {str(e)}"
        )

@router.get("/sessions/active")
async def get_active_collaboration_sessions(
    workspace_id: Optional[str] = Query(None, description="Filter by workspace"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
) -> Dict[str, Any]:
    """
    Get active real-time collaboration sessions
    
    Features:
    - Live user presence
    - Real-time cursor tracking
    - Session activity monitoring
    - Concurrent editing management
    """
    try:
        result = AdvancedCollaborationService.get_active_sessions(
            session=session,
            workspace_id=workspace_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "real_time_features": [
                "live_cursors",
                "user_presence",
                "activity_tracking",
                "conflict_resolution"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get active sessions: {str(e)}"
        )

@router.post("/documents/{document_id}/comments")
async def add_collaboration_comment(
    document_id: str,
    comment_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_MANAGE))
) -> Dict[str, Any]:
    """Add a comment or annotation to a collaborative document"""
    try:
        result = AdvancedCollaborationService.add_document_comment(
            session=session,
            document_id=document_id,
            comment_data=comment_data,
            author_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Comment added successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add comment: {str(e)}"
        )

@router.get("/documents/{document_id}/comments")
async def get_collaboration_comments(
    document_id: str,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
) -> Dict[str, Any]:
    """Get comments and annotations for a collaborative document"""
    try:
        result = AdvancedCollaborationService.get_document_comments(
            session=session,
            document_id=document_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get comments: {str(e)}"
        )

@router.post("/workspaces/{workspace_id}/invite")
async def invite_to_workspace(
    workspace_id: str,
    invitation_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKSPACE_EDIT))
) -> Dict[str, Any]:
    """Invite users to a collaborative workspace"""
    try:
        result = AdvancedCollaborationService.invite_to_workspace(
            session=session,
            workspace_id=workspace_id,
            invitation_data=invitation_data,
            inviter_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Invitation sent successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send invitation: {str(e)}"
        )

@router.get("/workspaces/{workspace_id}/activity")
async def get_workspace_activity(
    workspace_id: str,
    days: int = Query(7, description="Number of days to look back"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
) -> Dict[str, Any]:
    """
    Get workspace activity and collaboration analytics
    
    Features:
    - User activity tracking
    - Collaboration metrics
    - Document usage statistics
    - Real-time activity feeds
    """
    try:
        result = AdvancedCollaborationService.get_workspace_activity(
            session=session,
            workspace_id=workspace_id,
            days=days,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "analytics_features": [
                "activity_timeline",
                "collaboration_metrics",
                "usage_statistics",
                "performance_insights"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workspace activity: {str(e)}"
        )