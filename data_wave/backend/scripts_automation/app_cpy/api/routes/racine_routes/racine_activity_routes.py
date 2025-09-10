"""
Racine Activity Routes - Historic Activities Tracker System
==========================================================

This module provides comprehensive API routes for the historic activities tracker system that captures
all user and system actions across all 7 data governance groups with comprehensive logging, filtering,
search capabilities, cross-group correlation, visual analytics, and RBAC integration.

Key Features:
- Comprehensive real-time activity tracking across all groups
- Advanced filtering and search capabilities
- Cross-group activity correlation and analysis
- Visual analytics and trend analysis
- Real-time activity streaming
- RBAC-integrated access control for activity viewing
- Activity export and reporting
- Performance metrics and system monitoring

Integrations:
- Deep integration with all 7 data governance groups
- Real-time activity capture from all backend services
- Advanced RBAC for activity access control
- Comprehensive audit trail and compliance logging
- Integration with analytics and reporting systems

Architecture:
- FastAPI router with comprehensive error handling
- Pydantic models for request/response validation
- WebSocket support for real-time activity streaming
- Integration with RacineActivityService
- RBAC-integrated security at all endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, Path, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from uuid import UUID
import json
import asyncio
import csv
import io
from pydantic import BaseModel, Field, validator

# Database and Authentication
from ....database import get_db
from ....auth.dependencies import get_current_user, require_permission
from ....models.auth_models import User

# Racine Services
from ....services.racine_services.racine_activity_service import RacineActivityService

# Racine Models
from ....models.racine_models.racine_activity_models import (
    RacineActivityLog,
    RacineActivitySession,
    RacineActivityMetrics,
    RacineActivityCorrelation,
    RacineActivityAlert
)

# Cross-group models for integration
from ....models.scan_models import DataSource
from ....models.compliance_models import ComplianceRule
from ....models.classification_models import ClassificationRule

# Utilities
from ....core.logging_utils import get_logger
from ....core.exceptions import RacineException
from ....core.response_models import StandardResponse

# Initialize logger
logger = get_logger(__name__)

# Initialize router
router = APIRouter(
    prefix="/api/racine/activity",
    tags=["Racine Activity Tracker"],
    responses={
        404: {"description": "Activity not found"},
        403: {"description": "Insufficient permissions"},
        500: {"description": "Internal server error"}
    }
)

# ========================================================================================
# Pydantic Models for Requests and Responses
# ========================================================================================

class ActivityFilterRequest(BaseModel):
    """Request model for activity filtering"""
    groups: Optional[List[str]] = Field(None, description="Filter by specific groups")
    activity_types: Optional[List[str]] = Field(None, description="Filter by activity types")
    users: Optional[List[str]] = Field(None, description="Filter by specific users")
    resources: Optional[List[str]] = Field(None, description="Filter by specific resources")
    start_time: Optional[datetime] = Field(None, description="Start time for filtering")
    end_time: Optional[datetime] = Field(None, description="End time for filtering")
    severity_levels: Optional[List[str]] = Field(None, description="Filter by severity levels")
    status: Optional[List[str]] = Field(None, description="Filter by activity status")
    search_term: Optional[str] = Field(None, description="Search term for activity details")
    workspace_id: Optional[str] = Field(None, description="Filter by workspace")
    
    @validator('groups')
    def validate_groups(cls, v):
        if v:
            allowed_groups = [
                'data_sources', 'scan_rules', 'classifications',
                'compliance', 'catalog', 'scan_logic', 'rbac',
                'racine_orchestration', 'racine_workspace', 'racine_workflow',
                'racine_pipeline', 'racine_ai', 'racine_collaboration'
            ]
            for group in v:
                if group not in allowed_groups:
                    raise ValueError(f"Group must be one of: {allowed_groups}")
        return v
    
    @validator('activity_types')
    def validate_activity_types(cls, v):
        if v:
            allowed_types = [
                'create', 'read', 'update', 'delete', 'execute', 'configure',
                'authenticate', 'authorize', 'scan', 'classify', 'validate',
                'sync', 'backup', 'restore', 'monitor', 'alert', 'optimize'
            ]
            for activity_type in v:
                if activity_type not in allowed_types:
                    raise ValueError(f"Activity type must be one of: {allowed_types}")
        return v

class ActivityQueryRequest(BaseModel):
    """Request model for activity queries"""
    query_type: str = Field(..., description="Type of activity query")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Query parameters")
    aggregation: Optional[str] = Field(None, description="Aggregation method")
    time_window: Optional[str] = Field(None, description="Time window for analysis")
    
    @validator('query_type')
    def validate_query_type(cls, v):
        allowed_types = [
            'activity_timeline', 'user_activity_summary', 'resource_activity',
            'cross_group_correlation', 'activity_trends', 'performance_metrics',
            'security_events', 'compliance_audit', 'error_analysis'
        ]
        if v not in allowed_types:
            raise ValueError(f"Query type must be one of: {allowed_types}")
        return v

class ActivityCorrelationRequest(BaseModel):
    """Request model for activity correlation analysis"""
    correlation_type: str = Field(..., description="Type of correlation analysis")
    source_activities: List[str] = Field(..., description="Source activity IDs")
    analysis_scope: Dict[str, Any] = Field(default_factory=dict, description="Analysis scope")
    time_tolerance: Optional[int] = Field(None, description="Time tolerance in seconds")
    
    @validator('correlation_type')
    def validate_correlation_type(cls, v):
        allowed_types = [
            'causal_analysis', 'temporal_correlation', 'user_behavior_pattern',
            'resource_access_pattern', 'error_propagation', 'workflow_analysis'
        ]
        if v not in allowed_types:
            raise ValueError(f"Correlation type must be one of: {allowed_types}")
        return v

class ActivityReportRequest(BaseModel):
    """Request model for activity reports"""
    report_type: str = Field(..., description="Type of activity report")
    report_format: str = Field(default="json", description="Report output format")
    filters: ActivityFilterRequest = Field(default_factory=ActivityFilterRequest, description="Report filters")
    include_charts: bool = Field(default=False, description="Include chart data")
    include_details: bool = Field(default=True, description="Include detailed activities")
    
    @validator('report_type')
    def validate_report_type(cls, v):
        allowed_types = [
            'comprehensive_audit', 'user_activity_report', 'security_report',
            'compliance_report', 'performance_report', 'error_report',
            'workspace_activity', 'cross_group_summary'
        ]
        if v not in allowed_types:
            raise ValueError(f"Report type must be one of: {allowed_types}")
        return v
    
    @validator('report_format')
    def validate_report_format(cls, v):
        allowed_formats = ['json', 'csv', 'pdf', 'excel']
        if v not in allowed_formats:
            raise ValueError(f"Report format must be one of: {allowed_formats}")
        return v

# Response Models
class ActivityResponse(BaseModel):
    """Response model for activity logs"""
    activity_id: str
    timestamp: datetime
    user_id: str
    user_name: str
    group: str
    activity_type: str
    resource_type: str
    resource_id: str
    resource_name: Optional[str]
    action: str
    details: Dict[str, Any]
    ip_address: Optional[str]
    user_agent: Optional[str]
    session_id: Optional[str]
    workspace_id: Optional[str]
    success: bool
    error_message: Optional[str]
    duration_ms: Optional[int]
    metadata: Dict[str, Any]

class ActivityMetricsResponse(BaseModel):
    """Response model for activity metrics"""
    metric_id: str
    metric_type: str
    time_period: str
    total_activities: int
    unique_users: int
    unique_resources: int
    success_rate: float
    average_duration: float
    peak_activity_time: datetime
    group_breakdown: Dict[str, int]
    activity_type_breakdown: Dict[str, int]
    trends: Dict[str, Any]
    generated_at: datetime

class ActivityCorrelationResponse(BaseModel):
    """Response model for activity correlation"""
    correlation_id: str
    correlation_type: str
    source_activities: List[str]
    related_activities: List[str]
    correlation_strength: float
    correlation_patterns: List[Dict[str, Any]]
    insights: List[str]
    recommendations: List[str]
    confidence_score: float
    created_at: datetime

class ActivitySessionResponse(BaseModel):
    """Response model for activity sessions"""
    session_id: str
    user_id: str
    user_name: str
    workspace_id: Optional[str]
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[int]
    total_activities: int
    unique_resources: int
    groups_accessed: List[str]
    session_summary: Dict[str, Any]
    is_active: bool

# ========================================================================================
# WebSocket Connection Manager
# ========================================================================================

class ActivityConnectionManager:
    """Manages WebSocket connections for real-time activity streaming"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_filters: Dict[str, ActivityFilterRequest] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, filters: Optional[ActivityFilterRequest] = None):
        """Connect to activity stream"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        if filters:
            self.user_filters[user_id] = filters
        logger.info(f"WebSocket connected for activity streaming: {user_id}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect from activity stream"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                    if user_id in self.user_filters:
                        del self.user_filters[user_id]
        logger.info(f"WebSocket disconnected for activity streaming: {user_id}")
    
    async def broadcast_activity(self, activity: Dict[str, Any]):
        """Broadcast new activity to connected users"""
        disconnected_users = []
        
        for user_id, connections in self.active_connections.items():
            # Check if activity matches user's filters
            if user_id in self.user_filters:
                if not self._activity_matches_filter(activity, self.user_filters[user_id]):
                    continue
            
            disconnected_connections = []
            for connection in connections:
                try:
                    await connection.send_json({
                        "type": "new_activity",
                        "data": activity
                    })
                except:
                    disconnected_connections.append(connection)
            
            # Remove disconnected connections
            for connection in disconnected_connections:
                connections.remove(connection)
                
            if not connections:
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            del self.active_connections[user_id]
            if user_id in self.user_filters:
                del self.user_filters[user_id]
    
    def _activity_matches_filter(self, activity: Dict[str, Any], filters: ActivityFilterRequest) -> bool:
        """Check if activity matches user's filters"""
        if filters.groups and activity.get('group') not in filters.groups:
            return False
        if filters.activity_types and activity.get('activity_type') not in filters.activity_types:
            return False
        if filters.users and activity.get('user_id') not in filters.users:
            return False
        if filters.workspace_id and activity.get('workspace_id') != filters.workspace_id:
            return False
        return True

# Initialize connection manager
connection_manager = ActivityConnectionManager()

# ========================================================================================
# Utility Functions
# ========================================================================================

def get_activity_service(db: Session = Depends(get_db)) -> RacineActivityService:
    """Get activity service instance"""
    return RacineActivityService(db)

# ========================================================================================
# Activity Tracking Routes
# ========================================================================================

@router.get("/activities", response_model=StandardResponse[List[ActivityResponse]])
async def get_activities(
    limit: int = Query(default=100, ge=1, le=1000, description="Number of activities to return"),
    offset: int = Query(default=0, ge=0, description="Activity offset"),
    filters: ActivityFilterRequest = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """
    Get filtered activity logs with comprehensive search capabilities.
    
    Features:
    - Advanced filtering by groups, users, resources, time ranges
    - Full-text search across activity details
    - RBAC-integrated access control
    - Cross-group activity correlation
    - Performance optimized queries
    """
    try:
        logger.info(f"Getting activities for user: {current_user.id}")
        
        activities = await activity_service.get_activities(
            user_id=current_user.id,
            filters=filters,
            limit=limit,
            offset=offset
        )
        
        activity_responses = [
            ActivityResponse(
                activity_id=activity.id,
                timestamp=activity.timestamp,
                user_id=activity.user_id,
                user_name=activity.user_name or "",
                group=activity.group,
                activity_type=activity.activity_type,
                resource_type=activity.resource_type,
                resource_id=activity.resource_id,
                resource_name=activity.resource_name,
                action=activity.action,
                details=activity.details or {},
                ip_address=activity.ip_address,
                user_agent=activity.user_agent,
                session_id=activity.session_id,
                workspace_id=activity.workspace_id,
                success=activity.success,
                error_message=activity.error_message,
                duration_ms=activity.duration_ms,
                metadata=activity.metadata or {}
            )
            for activity in activities
        ]
        
        return StandardResponse(
            success=True,
            message="Activities retrieved successfully",
            data=activity_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting activities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get activities: {str(e)}")

@router.get("/activities/{activity_id}", response_model=StandardResponse[ActivityResponse])
async def get_activity_details(
    activity_id: str = Path(..., description="Activity ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Get detailed information about a specific activity"""
    try:
        activity = await activity_service.get_activity_details(activity_id, current_user.id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        activity_response = ActivityResponse(
            activity_id=activity.id,
            timestamp=activity.timestamp,
            user_id=activity.user_id,
            user_name=activity.user_name or "",
            group=activity.group,
            activity_type=activity.activity_type,
            resource_type=activity.resource_type,
            resource_id=activity.resource_id,
            resource_name=activity.resource_name,
            action=activity.action,
            details=activity.details or {},
            ip_address=activity.ip_address,
            user_agent=activity.user_agent,
            session_id=activity.session_id,
            workspace_id=activity.workspace_id,
            success=activity.success,
            error_message=activity.error_message,
            duration_ms=activity.duration_ms,
            metadata=activity.metadata or {}
        )
        
        return StandardResponse(
            success=True,
            message="Activity details retrieved successfully",
            data=activity_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting activity details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get activity details: {str(e)}")

# ========================================================================================
# Activity Analytics Routes
# ========================================================================================

@router.post("/analytics/query", response_model=StandardResponse[Dict[str, Any]])
async def query_activity_analytics(
    request: ActivityQueryRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """
    Execute complex activity analytics queries.
    
    Features:
    - Activity timeline analysis
    - User behavior patterns
    - Resource access analytics
    - Cross-group correlations
    - Performance trend analysis
    """
    try:
        logger.info(f"Executing activity analytics query for user: {current_user.id}")
        
        analytics_result = await activity_service.execute_analytics_query(
            user_id=current_user.id,
            query_type=request.query_type,
            parameters=request.parameters,
            aggregation=request.aggregation,
            time_window=request.time_window
        )
        
        return StandardResponse(
            success=True,
            message="Activity analytics query executed successfully",
            data=analytics_result
        )
        
    except Exception as e:
        logger.error(f"Error executing analytics query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute query: {str(e)}")

@router.get("/metrics", response_model=StandardResponse[ActivityMetricsResponse])
async def get_activity_metrics(
    time_period: str = Query(default="24h", description="Time period for metrics"),
    groups: Optional[List[str]] = Query(None, description="Filter by specific groups"),
    workspace_id: Optional[str] = Query(None, description="Filter by workspace"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Get comprehensive activity metrics and statistics"""
    try:
        metrics = await activity_service.get_activity_metrics(
            user_id=current_user.id,
            time_period=time_period,
            groups=groups,
            workspace_id=workspace_id
        )
        
        metrics_response = ActivityMetricsResponse(
            metric_id=metrics.id,
            metric_type=metrics.metric_type,
            time_period=metrics.time_period,
            total_activities=metrics.total_activities,
            unique_users=metrics.unique_users,
            unique_resources=metrics.unique_resources,
            success_rate=metrics.success_rate,
            average_duration=metrics.average_duration,
            peak_activity_time=metrics.peak_activity_time,
            group_breakdown=metrics.group_breakdown or {},
            activity_type_breakdown=metrics.activity_type_breakdown or {},
            trends=metrics.trends or {},
            generated_at=metrics.generated_at
        )
        
        return StandardResponse(
            success=True,
            message="Activity metrics retrieved successfully",
            data=metrics_response
        )
        
    except Exception as e:
        logger.error(f"Error getting activity metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

# ========================================================================================
# Activity Correlation Routes
# ========================================================================================

@router.post("/correlation", response_model=StandardResponse[ActivityCorrelationResponse])
async def analyze_activity_correlation(
    request: ActivityCorrelationRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """
    Analyze correlations between activities for pattern detection.
    
    Features:
    - Causal relationship analysis
    - Temporal correlation detection
    - User behavior pattern recognition
    - Error propagation tracking
    - Workflow analysis
    """
    try:
        logger.info(f"Analyzing activity correlation for user: {current_user.id}")
        
        correlation = await activity_service.analyze_correlation(
            user_id=current_user.id,
            correlation_type=request.correlation_type,
            source_activities=request.source_activities,
            analysis_scope=request.analysis_scope,
            time_tolerance=request.time_tolerance
        )
        
        correlation_response = ActivityCorrelationResponse(
            correlation_id=correlation.id,
            correlation_type=correlation.correlation_type,
            source_activities=correlation.source_activities,
            related_activities=correlation.related_activities or [],
            correlation_strength=correlation.correlation_strength,
            correlation_patterns=correlation.correlation_patterns or [],
            insights=correlation.insights or [],
            recommendations=correlation.recommendations or [],
            confidence_score=correlation.confidence_score,
            created_at=correlation.created_at
        )
        
        return StandardResponse(
            success=True,
            message="Activity correlation analysis completed",
            data=correlation_response
        )
        
    except Exception as e:
        logger.error(f"Error analyzing correlation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze correlation: {str(e)}")

@router.get("/correlation/{correlation_id}", response_model=StandardResponse[ActivityCorrelationResponse])
async def get_correlation_results(
    correlation_id: str = Path(..., description="Correlation ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Get activity correlation analysis results"""
    try:
        correlation = await activity_service.get_correlation_results(correlation_id, current_user.id)
        if not correlation:
            raise HTTPException(status_code=404, detail="Correlation analysis not found")
        
        correlation_response = ActivityCorrelationResponse(
            correlation_id=correlation.id,
            correlation_type=correlation.correlation_type,
            source_activities=correlation.source_activities,
            related_activities=correlation.related_activities or [],
            correlation_strength=correlation.correlation_strength,
            correlation_patterns=correlation.correlation_patterns or [],
            insights=correlation.insights or [],
            recommendations=correlation.recommendations or [],
            confidence_score=correlation.confidence_score,
            created_at=correlation.created_at
        )
        
        return StandardResponse(
            success=True,
            message="Correlation results retrieved successfully",
            data=correlation_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting correlation results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get correlation: {str(e)}")

# ========================================================================================
# Real-time Activity Streaming WebSocket
# ========================================================================================

@router.websocket("/stream")
async def activity_stream(
    websocket: WebSocket,
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time activity streaming.
    
    Provides:
    - Real-time activity notifications
    - Filtered activity streams
    - Cross-group activity monitoring
    - Performance metrics streaming
    - Alert notifications
    """
    activity_service = RacineActivityService(db)
    
    await connection_manager.connect(websocket, user_id)
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "message": "Real-time activity stream connected",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        while True:
            try:
                # Wait for messages from client
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                message_data = json.loads(data)
                
                if message_data.get("type") == "set_filters":
                    # Update user's activity filters
                    filters_data = message_data.get("filters", {})
                    filters = ActivityFilterRequest(**filters_data)
                    connection_manager.user_filters[user_id] = filters
                    
                    await websocket.send_json({
                        "type": "filters_updated",
                        "message": "Activity filters updated successfully"
                    })
                    
                elif message_data.get("type") == "get_recent":
                    # Send recent activities
                    limit = message_data.get("limit", 50)
                    filters = connection_manager.user_filters.get(user_id)
                    
                    recent_activities = await activity_service.get_activities(
                        user_id=user_id,
                        filters=filters,
                        limit=limit,
                        offset=0
                    )
                    
                    await websocket.send_json({
                        "type": "recent_activities",
                        "data": [
                            {
                                "activity_id": activity.id,
                                "timestamp": activity.timestamp.isoformat(),
                                "user_name": activity.user_name,
                                "group": activity.group,
                                "activity_type": activity.activity_type,
                                "action": activity.action,
                                "resource_name": activity.resource_name,
                                "success": activity.success
                            }
                            for activity in recent_activities
                        ]
                    })
                    
                elif message_data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat()
                })
                continue
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, user_id)
        logger.info(f"Activity stream disconnected for user: {user_id}")
    except Exception as e:
        logger.error(f"Activity stream error for user {user_id}: {str(e)}")
        connection_manager.disconnect(websocket, user_id)

# ========================================================================================
# Session Management Routes
# ========================================================================================

@router.get("/sessions", response_model=StandardResponse[List[ActivitySessionResponse]])
async def get_activity_sessions(
    limit: int = Query(default=50, ge=1, le=200, description="Number of sessions to return"),
    offset: int = Query(default=0, ge=0, description="Session offset"),
    user_filter: Optional[str] = Query(None, description="Filter by specific user"),
    workspace_filter: Optional[str] = Query(None, description="Filter by workspace"),
    active_only: bool = Query(default=False, description="Show only active sessions"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Get activity sessions with filtering options"""
    try:
        sessions = await activity_service.get_activity_sessions(
            requesting_user_id=current_user.id,
            limit=limit,
            offset=offset,
            user_filter=user_filter,
            workspace_filter=workspace_filter,
            active_only=active_only
        )
        
        session_responses = [
            ActivitySessionResponse(
                session_id=session.id,
                user_id=session.user_id,
                user_name=session.user_name or "",
                workspace_id=session.workspace_id,
                start_time=session.start_time,
                end_time=session.end_time,
                duration_minutes=session.duration_minutes,
                total_activities=session.total_activities,
                unique_resources=session.unique_resources,
                groups_accessed=session.groups_accessed or [],
                session_summary=session.session_summary or {},
                is_active=session.is_active
            )
            for session in sessions
        ]
        
        return StandardResponse(
            success=True,
            message="Activity sessions retrieved successfully",
            data=session_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting activity sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@router.get("/sessions/{session_id}", response_model=StandardResponse[ActivitySessionResponse])
async def get_session_details(
    session_id: str = Path(..., description="Session ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Get detailed information about a specific activity session"""
    try:
        session = await activity_service.get_session_details(session_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session_response = ActivitySessionResponse(
            session_id=session.id,
            user_id=session.user_id,
            user_name=session.user_name or "",
            workspace_id=session.workspace_id,
            start_time=session.start_time,
            end_time=session.end_time,
            duration_minutes=session.duration_minutes,
            total_activities=session.total_activities,
            unique_resources=session.unique_resources,
            groups_accessed=session.groups_accessed or [],
            session_summary=session.session_summary or {},
            is_active=session.is_active
        )
        
        return StandardResponse(
            success=True,
            message="Session details retrieved successfully",
            data=session_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

# ========================================================================================
# Reporting Routes
# ========================================================================================

@router.post("/reports", response_model=StandardResponse[Dict[str, str]])
async def generate_activity_report(
    request: ActivityReportRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """
    Generate comprehensive activity reports.
    
    Features:
    - Multiple report formats (JSON, CSV, PDF, Excel)
    - Customizable filtering and aggregation
    - Chart and visualization data
    - Compliance audit reports
    - Performance analysis reports
    """
    try:
        logger.info(f"Generating activity report for user: {current_user.id}")
        
        report = await activity_service.generate_report(
            user_id=current_user.id,
            report_type=request.report_type,
            report_format=request.report_format,
            filters=request.filters,
            include_charts=request.include_charts,
            include_details=request.include_details
        )
        
        return StandardResponse(
            success=True,
            message="Activity report generated successfully",
            data={
                "report_id": report["report_id"],
                "download_url": report["download_url"],
                "format": request.report_format,
                "expires_at": report["expires_at"]
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/reports/{report_id}/download")
async def download_activity_report(
    report_id: str = Path(..., description="Report ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Download generated activity report"""
    try:
        report_data = await activity_service.get_report_data(report_id, current_user.id)
        if not report_data:
            raise HTTPException(status_code=404, detail="Report not found or expired")
        
        # Create streaming response based on format
        if report_data["format"] == "csv":
            def generate_csv():
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=report_data["data"][0].keys())
                writer.writeheader()
                for row in report_data["data"]:
                    writer.writerow(row)
                    yield output.getvalue()
                    output.seek(0)
                    output.truncate(0)
            
            return StreamingResponse(
                generate_csv(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=activity_report_{report_id}.csv"}
            )
        else:
            return StandardResponse(
                success=True,
                message="Report data retrieved",
                data=report_data["data"]
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to download report: {str(e)}")

# ========================================================================================
# Search and Discovery Routes
# ========================================================================================

@router.get("/search", response_model=StandardResponse[List[ActivityResponse]])
async def search_activities(
    query: str = Query(..., description="Search query"),
    search_fields: Optional[List[str]] = Query(None, description="Fields to search in"),
    limit: int = Query(default=50, ge=1, le=200, description="Number of results"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Advanced search across activity logs"""
    try:
        activities = await activity_service.search_activities(
            user_id=current_user.id,
            query=query,
            search_fields=search_fields,
            limit=limit
        )
        
        activity_responses = [
            ActivityResponse(
                activity_id=activity.id,
                timestamp=activity.timestamp,
                user_id=activity.user_id,
                user_name=activity.user_name or "",
                group=activity.group,
                activity_type=activity.activity_type,
                resource_type=activity.resource_type,
                resource_id=activity.resource_id,
                resource_name=activity.resource_name,
                action=activity.action,
                details=activity.details or {},
                ip_address=activity.ip_address,
                user_agent=activity.user_agent,
                session_id=activity.session_id,
                workspace_id=activity.workspace_id,
                success=activity.success,
                error_message=activity.error_message,
                duration_ms=activity.duration_ms,
                metadata=activity.metadata or {}
            )
            for activity in activities
        ]
        
        return StandardResponse(
            success=True,
            message="Activity search completed successfully",
            data=activity_responses
        )
        
    except Exception as e:
        logger.error(f"Error searching activities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search activities: {str(e)}")

# ========================================================================================
# Health and Monitoring Routes
# ========================================================================================

@router.get("/health", response_model=StandardResponse[Dict[str, Any]])
async def activity_health_check(
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Health check for activity tracking service"""
    try:
        health_status = await activity_service.get_service_health()
        
        return StandardResponse(
            success=True,
            message="Activity service health check completed",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"Activity service health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.get("/system-stats", response_model=StandardResponse[Dict[str, Any]])
async def get_system_activity_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    activity_service: RacineActivityService = Depends(get_activity_service)
):
    """Get system-wide activity statistics"""
    try:
        stats = await activity_service.get_system_stats(current_user.id)
        
        return StandardResponse(
            success=True,
            message="System activity statistics retrieved successfully",
            data=stats
        )
        
    except Exception as e:
        logger.error(f"Error getting system stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get system stats: {str(e)}")

# ========================================================================================
# Error Handlers and Middleware
# ========================================================================================

@router.exception_handler(RacineException)
async def racine_exception_handler(request, exc: RacineException):
    """Handle Racine-specific exceptions"""
    logger.error(f"Racine activity error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "error_code": exc.error_code}
    )

# Export router
__all__ = ["router", "connection_manager"]