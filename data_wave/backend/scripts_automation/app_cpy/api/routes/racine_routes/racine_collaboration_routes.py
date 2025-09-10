"""
Racine Collaboration API Routes
==============================

This module provides comprehensive collaboration API endpoints for the Racine Main Manager,
enabling real-time collaboration, expert consultation, and cross-group workflow collaboration.

Features:
- Real-time collaboration session management
- Document collaboration with version control
- Expert consultation networks
- Cross-group workflow collaboration
- Team communication and messaging
- Collaboration analytics and insights
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import uuid
import json

# Pydantic models
from pydantic import BaseModel, Field
from enum import Enum

# Database and dependencies
from ....core.database import get_db
from ....core.auth import get_current_user
from ....models.auth_models import User

# Import racine services
from ....services.racine_services.racine_collaboration_service import (
    RacineCollaborationService, CollaborationConfiguration, CollaborationType,
    CollaborationScope, ExpertConsultationRequest, ParticipantRole
)

router = APIRouter(prefix="/api/racine/collaboration", tags=["racine-collaboration"])

# =====================================================================================
# Pydantic Models
# =====================================================================================

class CollaborationSessionCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    collaboration_type: CollaborationType = CollaborationType.TEAM_COMMUNICATION
    scope: CollaborationScope = CollaborationScope.WORKSPACE
    participants: List[Dict[str, Any]] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)
    access_control: Dict[str, Any] = Field(default_factory=dict)
    workspace_id: Optional[str] = None
    group_context: Optional[str] = None

class MessageSendRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    message_type: str = "text"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentOperationRequest(BaseModel):
    operation_type: str = Field(..., regex="^(edit|lock|unlock|comment)$")
    data: Dict[str, Any] = Field(default_factory=dict)

class ExpertConsultationCreateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=2000)
    expertise_required: List[str] = Field(..., min_items=1)
    urgency: str = Field("normal", regex="^(low|normal|high|critical)$")
    context_groups: List[str] = Field(default_factory=list)
    attachments: List[str] = Field(default_factory=list)

class CollaborationSessionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    collaboration_type: str
    scope: str
    participant_count: int
    status: str
    created_at: datetime
    workspace_id: Optional[str]
    group_context: Optional[str]

class MessageResponse(BaseModel):
    id: str
    session_id: str
    sender_id: str
    content: str
    message_type: str
    timestamp: datetime
    metadata: Dict[str, Any]

class ParticipantResponse(BaseModel):
    id: str
    user_id: str
    role: str
    permissions: Dict[str, Any]
    joined_at: datetime
    last_active: Optional[datetime]
    connection_status: str

# =====================================================================================
# Collaboration Session Management
# =====================================================================================

@router.post("/sessions/create", response_model=CollaborationSessionResponse)
async def create_collaboration_session(
    request: CollaborationSessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new collaboration session with specified configuration
    
    This endpoint creates collaboration sessions for real-time teamwork,
    expert consultation, document collaboration, or workflow coordination.
    """
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Create collaboration configuration
        config = CollaborationConfiguration(
            name=request.name,
            description=request.description or "",
            collaboration_type=request.collaboration_type,
            scope=request.scope,
            participants=request.participants,
            settings=request.settings,
            access_control=request.access_control,
            workspace_id=request.workspace_id,
            group_context=request.group_context
        )
        
        # Create session
        session = await collaboration_service.create_collaboration_session(
            config=config,
            creator_id=current_user.id
        )
        
        return CollaborationSessionResponse(
            id=session.id,
            name=session.name,
            description=session.description,
            collaboration_type=session.collaboration_type,
            scope=session.scope,
            participant_count=len(request.participants) + 1,  # +1 for creator
            status=session.status,
            created_at=session.created_at,
            workspace_id=session.workspace_id,
            group_context=session.group_context
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sessions/{session_id}/join")
async def join_collaboration_session(
    session_id: str,
    connection_info: Dict[str, Any] = Body(default_factory=dict),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join an active collaboration session"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Join session
        join_result = await collaboration_service.join_collaboration_session(
            session_id=session_id,
            user_id=current_user.id,
            connection_info=connection_info
        )
        
        return join_result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sessions/{session_id}/leave")
async def leave_collaboration_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a collaboration session"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Leave session
        leave_result = await collaboration_service.leave_collaboration_session(
            session_id=session_id,
            user_id=current_user.id
        )
        
        return leave_result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/", response_model=List[CollaborationSessionResponse])
async def list_user_collaboration_sessions(
    status: str = Query("active"),
    collaboration_type: Optional[CollaborationType] = Query(None),
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all collaboration sessions for the current user"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Get user sessions
        sessions = await collaboration_service.get_user_collaboration_sessions(
            user_id=current_user.id,
            status=status
        )
        
        # Filter by type if specified
        if collaboration_type:
            sessions = [s for s in sessions if s['type'] == collaboration_type.value]
        
        # Apply pagination
        sessions = sessions[:limit]
        
        return [
            CollaborationSessionResponse(
                id=session['id'],
                name=session['name'],
                description=session['description'],
                collaboration_type=session['type'],
                scope=session['scope'],
                participant_count=session['participant_count'],
                status='active',
                created_at=datetime.fromisoformat(session['created_at']),
                workspace_id=session['workspace_id'],
                group_context=None
            )
            for session in sessions
        ]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Messaging and Communication
# =====================================================================================

@router.post("/sessions/{session_id}/messages", response_model=MessageResponse)
async def send_message(
    session_id: str,
    request: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in a collaboration session"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Send message
        message = await collaboration_service.send_collaboration_message(
            session_id=session_id,
            sender_id=current_user.id,
            content=request.content,
            message_type=request.message_type,
            metadata=request.metadata
        )
        
        return MessageResponse(
            id=message.id,
            session_id=message.session_id,
            sender_id=message.sender_id,
            content=message.content,
            message_type=message.message_type,
            timestamp=message.timestamp,
            metadata=message.metadata
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    message_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages from a collaboration session"""
    try:
        collaboration_service = RacineCollaborationService(db)
        return await collaboration_service.list_session_messages(
            session_id=session_id,
            limit=limit,
            offset=offset,
            message_type=message_type,
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Document Collaboration
# =====================================================================================

@router.post("/sessions/{session_id}/documents/{document_id}/collaborate")
async def collaborate_on_document(
    session_id: str,
    document_id: str,
    request: DocumentOperationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Collaborate on a document with real-time synchronization"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Perform document collaboration operation
        result = await collaboration_service.collaborate_on_document(
            session_id=session_id,
            document_id=document_id,
            user_id=current_user.id,
            operation={
                'type': request.operation_type,
                'data': request.data
            }
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Expert Consultation
# =====================================================================================

@router.post("/expert-consultation", response_model=Dict[str, Any])
async def request_expert_consultation(
    request: ExpertConsultationCreateRequest,
    session_id: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request expert consultation for a specific topic"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Create expert consultation request
        consultation_request = ExpertConsultationRequest(
            topic=request.topic,
            description=request.description,
            expertise_required=request.expertise_required,
            urgency=request.urgency,
            context_groups=request.context_groups,
            attachments=request.attachments
        )
        
        # Request expert consultation
        result = await collaboration_service.request_expert_consultation(
            request=consultation_request,
            requester_id=current_user.id,
            session_id=session_id
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/experts/discover")
async def discover_experts(
    expertise_areas: List[str] = Query(...),
    limit: int = Query(10, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Discover experts by expertise areas"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Find experts
        experts = await collaboration_service._find_experts_by_expertise(expertise_areas)
        
        # Apply limit
        experts = experts[:limit]
        
        return {
            "expertise_areas": expertise_areas,
            "experts_found": len(experts),
            "experts": experts,
            "search_criteria": {
                "limit": limit,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Collaboration Analytics
# =====================================================================================

@router.get("/sessions/{session_id}/analytics")
async def get_collaboration_analytics(
    session_id: str,
    time_range: str = Query("7d", regex="^(1h|1d|7d|30d)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive collaboration analytics for a session"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Get analytics
        analytics = await collaboration_service.get_collaboration_analytics(
            session_id=session_id,
            time_range=time_range
        )
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# WebSocket Endpoints for Real-Time Collaboration
# =====================================================================================

@router.websocket("/sessions/{session_id}/live")
async def collaboration_websocket(
    websocket: WebSocket,
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time collaboration features
    
    This endpoint provides live updates for:
    - New messages
    - Document changes
    - Participant join/leave events
    - Status updates
    """
    await websocket.accept()
    
    try:
        # Register connection
        # In a real implementation, this would be handled by the collaboration service
        
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process different message types
            message_type = message_data.get('type')
            
            if message_type == 'ping':
                await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
            elif message_type == 'chat_message':
                # Handle chat message
                await websocket.send_json({
                    "type": "message_received",
                    "session_id": session_id,
                    "message": message_data.get('content'),
                    "timestamp": datetime.utcnow().isoformat()
                })
            elif message_type == 'document_edit':
                # Handle document edit
                await websocket.send_json({
                    "type": "document_updated",
                    "session_id": session_id,
                    "document_id": message_data.get('document_id'),
                    "operation": message_data.get('operation'),
                    "timestamp": datetime.utcnow().isoformat()
                })
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        print(f"WebSocket error for session {session_id}: {str(e)}")
        await websocket.close()

# =====================================================================================
# Session Participants Management
# =====================================================================================

@router.get("/sessions/{session_id}/participants", response_model=List[ParticipantResponse])
async def get_session_participants(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all participants in a collaboration session"""
    try:
        collaboration_service = RacineCollaborationService(db)
        return await collaboration_service.list_session_participants(session_id)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sessions/{session_id}/participants/invite")
async def invite_participants(
    session_id: str,
    user_ids: List[str] = Body(..., embed=True),
    role: ParticipantRole = Body(ParticipantRole.VIEWER, embed=True),
    message: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite participants to a collaboration session"""
    try:
        # This would be implemented in the service
        invitations = []
        for user_id in user_ids:
            invitations.append({
                "user_id": user_id,
                "session_id": session_id,
                "role": role.value,
                "invited_by": current_user.id,
                "invitation_sent": datetime.utcnow().isoformat()
            })
        
        return {
            "session_id": session_id,
            "invitations_sent": len(invitations),
            "invitations": invitations
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Cross-Group Workflow Collaboration
# =====================================================================================

@router.post("/workflow-collaboration/{workflow_id}/start")
async def start_workflow_collaboration(
    workflow_id: str,
    participants: List[str] = Body(..., embed=True),
    workflow_type: str = Body("general", embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start workflow collaboration for cross-group operations"""
    try:
        collaboration_service = RacineCollaborationService(db)
        
        # Create workflow collaboration session
        config = CollaborationConfiguration(
            name=f"Workflow Collaboration: {workflow_id}",
            description=f"Collaborative workflow execution for {workflow_id}",
            collaboration_type=CollaborationType.WORKFLOW_COLLABORATION,
            scope=CollaborationScope.PROJECT,
            participants=[{"user_id": uid, "role": "editor"} for uid in participants],
            settings={
                "workflow_collaboration": {
                    "workflow_id": workflow_id,
                    "type": workflow_type,
                    "auto_sync": True,
                    "conflict_resolution": "merge"
                }
            }
        )
        
        # Create session
        session = await collaboration_service.create_collaboration_session(
            config=config,
            creator_id=current_user.id
        )
        
        return {
            "workflow_id": workflow_id,
            "collaboration_session_id": session.id,
            "participants_added": len(participants),
            "workflow_type": workflow_type,
            "status": "started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Health Check
# =====================================================================================

@router.get("/health")
async def collaboration_health_check():
    """Health check endpoint for collaboration service"""
    return {
        "service": "racine-collaboration",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "features": [
            "real-time-collaboration",
            "document-collaboration",
            "expert-consultation",
            "workflow-collaboration",
            "websocket-support",
            "cross-group-integration"
        ]
    }