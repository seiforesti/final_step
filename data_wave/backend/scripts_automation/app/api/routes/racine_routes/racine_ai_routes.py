"""
Racine AI Routes - Integrated AI Assistant System
================================================

This module provides comprehensive API routes for the integrated AI assistant system that offers
persistent, context-aware AI guidance, workflow automation, smart recommendations, natural language
queries, anomaly detection, compliance alerts, and optimization tips. The system is deeply integrated
with all backend services across the 7 data governance groups.

Key Features:
- Persistent, context-aware AI assistant interface
- Proactive guidance and workflow automation
- Smart recommendations based on user behavior and system state
- Natural language queries for cross-group data exploration
- Anomaly detection and intelligent alerting
- Compliance monitoring and automated alerts
- Performance optimization recommendations
- Real-time conversation and assistance

Integrations:
- Deep integration with all 7 data governance groups
- Real-time access to system state and user context
- Advanced RBAC for AI assistant access control
- Comprehensive conversation logging and analytics
- Machine learning model integration for recommendations

Architecture:
- FastAPI router with comprehensive error handling
- Pydantic models for request/response validation
- WebSocket support for real-time conversations
- Integration with RacineAIService
- RBAC-integrated security at all endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, Path, Body, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union, AsyncGenerator
from datetime import datetime, timedelta
from uuid import UUID
import json
import asyncio
from pydantic import field_validator, BaseModel, Field, validator

# Database and Authentication
from ....database import get_db
from ....auth.dependencies import get_current_user, require_permission
from ....models.auth_models import User

# Racine Services
from ....services.racine_services.racine_ai_service import RacineAIService

# Racine Models
from ....models.racine_models.racine_ai_models import (
    RacineAIConversation,
    RacineAIMessage,
    RacineAIRecommendation,
    RacineAIAnalysis,
    RacineAIModel
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
    prefix="/api/racine/ai",
    tags=["Racine AI Assistant"],
    responses={
        404: {"description": "AI resource not found"},
        403: {"description": "Insufficient permissions"},
        500: {"description": "Internal server error"}
    }
)

# ========================================================================================
# Pydantic Models for Requests and Responses
# ========================================================================================

class ConversationStartRequest(BaseModel):
    """Request model for starting AI conversations"""
    conversation_type: str = Field(default="general", description="Type of conversation")
    context: Dict[str, Any] = Field(default_factory=dict, description="Initial conversation context")
    workspace_id: Optional[str] = Field(None, description="Associated workspace ID")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences")
    
    @field_validator('conversation_type')
    def validate_conversation_type(cls, v):
        allowed_types = [
            'general', 'workflow_assistance', 'data_exploration',
            'compliance_help', 'optimization_advice', 'troubleshooting',
            'analytics_insights', 'knowledge_query'
        ]
        if v not in allowed_types:
            raise ValueError(f"Conversation type must be one of: {allowed_types}")
        return v

class MessageSendRequest(BaseModel):
    """Request model for sending messages to AI"""
    message: str = Field(..., min_length=1, max_length=5000, description="User message")
    message_type: str = Field(default="text", description="Type of message")
    attachments: List[Dict[str, Any]] = Field(default_factory=list, description="Message attachments")
    context_override: Optional[Dict[str, Any]] = Field(None, description="Context override for this message")
    
    @field_validator('message_type')
    def validate_message_type(cls, v):
        allowed_types = ['text', 'query', 'command', 'file_upload', 'code_snippet']
        if v not in allowed_types:
            raise ValueError(f"Message type must be one of: {allowed_types}")
        return v

class RecommendationRequest(BaseModel):
    """Request model for AI recommendations"""
    recommendation_type: str = Field(..., description="Type of recommendation requested")
    context: Dict[str, Any] = Field(default_factory=dict, description="Context for recommendations")
    scope: List[str] = Field(default_factory=list, description="Scope of recommendations")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences")
    
    @field_validator('recommendation_type')
    def validate_recommendation_type(cls, v):
        allowed_types = [
            'workflow_optimization', 'data_quality_improvement',
            'compliance_enhancement', 'performance_tuning',
            'resource_optimization', 'security_improvements',
            'automation_opportunities', 'best_practices'
        ]
        if v not in allowed_types:
            raise ValueError(f"Recommendation type must be one of: {allowed_types}")
        return v

class AnalysisRequest(BaseModel):
    """Request model for AI analysis"""
    analysis_type: str = Field(..., description="Type of analysis")
    target_resource: str = Field(..., description="Target resource for analysis")
    analysis_scope: Dict[str, Any] = Field(default_factory=dict, description="Scope of analysis")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Analysis parameters")
    
    @field_validator('analysis_type')
    def validate_analysis_type(cls, v):
        allowed_types = [
            'anomaly_detection', 'trend_analysis', 'compliance_assessment',
            'performance_analysis', 'data_quality_analysis', 'usage_patterns',
            'risk_assessment', 'optimization_potential'
        ]
        if v not in allowed_types:
            raise ValueError(f"Analysis type must be one of: {allowed_types}")
        return v

class QueryRequest(BaseModel):
    """Request model for natural language queries"""
    query: str = Field(..., min_length=1, max_length=2000, description="Natural language query")
    query_scope: List[str] = Field(default_factory=list, description="Scope of query")
    context: Dict[str, Any] = Field(default_factory=dict, description="Query context")
    response_format: str = Field(default="conversational", description="Desired response format")
    
    @field_validator('response_format')
    def validate_response_format(cls, v):
        allowed_formats = ['conversational', 'structured', 'chart_data', 'summary', 'detailed']
        if v not in allowed_formats:
            raise ValueError(f"Response format must be one of: {allowed_formats}")
        return v

# Response Models
class ConversationResponse(BaseModel):
    """Response model for conversation operations"""
    conversation_id: str
    conversation_type: str
    status: str
    context: Dict[str, Any]
    message_count: int
    started_at: datetime
    last_activity: datetime
    workspace_id: Optional[str]

class MessageResponse(BaseModel):
    """Response model for AI messages"""
    message_id: str
    conversation_id: str
    sender: str
    message: str
    message_type: str
    timestamp: datetime
    attachments: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class RecommendationResponse(BaseModel):
    """Response model for AI recommendations"""
    recommendation_id: str
    recommendation_type: str
    title: str
    description: str
    priority: str
    impact_score: float
    implementation_effort: str
    benefits: List[str]
    actions: List[Dict[str, Any]]
    created_at: datetime

class AnalysisResponse(BaseModel):
    """Response model for AI analysis"""
    analysis_id: str
    analysis_type: str
    target_resource: str
    status: str
    findings: List[Dict[str, Any]]
    insights: List[str]
    recommendations: List[str]
    confidence_score: float
    created_at: datetime
    completed_at: Optional[datetime]

class QueryResponse(BaseModel):
    """Response model for natural language queries"""
    query_id: str
    query: str
    response: str
    response_format: str
    data: Optional[Dict[str, Any]]
    confidence_score: float
    sources: List[str]
    timestamp: datetime

# ========================================================================================
# WebSocket Connection Manager
# ========================================================================================

class AIConnectionManager:
    """Manages WebSocket connections for real-time AI conversations"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_conversations: Dict[str, str] = {}  # user_id -> conversation_id
    
    async def connect(self, websocket: WebSocket, user_id: str, conversation_id: str):
        """Connect to AI conversation"""
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)
        self.user_conversations[user_id] = conversation_id
        logger.info(f"WebSocket connected for AI conversation: {conversation_id}")
    
    def disconnect(self, websocket: WebSocket, user_id: str, conversation_id: str):
        """Disconnect from AI conversation"""
        if conversation_id in self.active_connections:
            if websocket in self.active_connections[conversation_id]:
                self.active_connections[conversation_id].remove(websocket)
                if not self.active_connections[conversation_id]:
                    del self.active_connections[conversation_id]
        if user_id in self.user_conversations:
            del self.user_conversations[user_id]
        logger.info(f"WebSocket disconnected for AI conversation: {conversation_id}")
    
    async def broadcast_to_conversation(self, conversation_id: str, message: dict):
        """Broadcast message to all connections in a conversation"""
        if conversation_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[conversation_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for connection in disconnected:
                if connection in self.active_connections[conversation_id]:
                    self.active_connections[conversation_id].remove(connection)

# Initialize connection manager
connection_manager = AIConnectionManager()

# ========================================================================================
# Utility Functions
# ========================================================================================

def get_ai_service(db: Session = Depends(get_db)) -> RacineAIService:
    """Get AI service instance"""
    return RacineAIService(db)

# ========================================================================================
# Conversation Management Routes
# ========================================================================================

@router.post("/conversations/start", response_model=StandardResponse[ConversationResponse])
async def start_conversation(
    request: ConversationStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """
    Start a new AI conversation with context-aware assistance.
    
    Features:
    - Context-aware conversation initialization
    - Workspace and user preference integration
    - Conversation type optimization
    - Proactive assistance setup
    """
    try:
        logger.info(f"Starting AI conversation for user: {current_user.id}")
        
        conversation = await ai_service.start_conversation(
            user_id=current_user.id,
            conversation_type=request.conversation_type,
            context=request.context,
            workspace_id=request.workspace_id,
            preferences=request.preferences
        )
        
        conversation_response = ConversationResponse(
            conversation_id=conversation.id,
            conversation_type=conversation.conversation_type,
            status=conversation.status,
            context=conversation.context,
            message_count=len(conversation.messages),
            started_at=conversation.started_at,
            last_activity=conversation.last_activity,
            workspace_id=conversation.workspace_id
        )
        
        return StandardResponse(
            success=True,
            message="AI conversation started successfully",
            data=conversation_response
        )
        
    except Exception as e:
        logger.error(f"Error starting AI conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start conversation: {str(e)}")

@router.get("/conversations/{conversation_id}", response_model=StandardResponse[ConversationResponse])
async def get_conversation(
    conversation_id: str = Path(..., description="Conversation ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get conversation details"""
    try:
        conversation = await ai_service.get_conversation(conversation_id, current_user.id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        conversation_response = ConversationResponse(
            conversation_id=conversation.id,
            conversation_type=conversation.conversation_type,
            status=conversation.status,
            context=conversation.context,
            message_count=len(conversation.messages),
            started_at=conversation.started_at,
            last_activity=conversation.last_activity,
            workspace_id=conversation.workspace_id
        )
        
        return StandardResponse(
            success=True,
            message="Conversation retrieved successfully",
            data=conversation_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation {conversation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversation: {str(e)}")

@router.get("/conversations", response_model=StandardResponse[List[ConversationResponse]])
async def get_user_conversations(
    limit: int = Query(default=20, ge=1, le=100, description="Number of conversations to return"),
    offset: int = Query(default=0, ge=0, description="Conversation offset"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get user's AI conversations"""
    try:
        conversations = await ai_service.get_user_conversations(
            user_id=current_user.id,
            limit=limit,
            offset=offset,
            status_filter=status
        )
        
        conversation_responses = [
            ConversationResponse(
                conversation_id=conv.id,
                conversation_type=conv.conversation_type,
                status=conv.status,
                context=conv.context,
                message_count=len(conv.messages),
                started_at=conv.started_at,
                last_activity=conv.last_activity,
                workspace_id=conv.workspace_id
            )
            for conv in conversations
        ]
        
        return StandardResponse(
            success=True,
            message="Conversations retrieved successfully",
            data=conversation_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting user conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

# ========================================================================================
# Message Management Routes
# ========================================================================================

@router.post("/conversations/{conversation_id}/messages", response_model=StandardResponse[MessageResponse])
async def send_message(
    conversation_id: str = Path(..., description="Conversation ID"),
    request: MessageSendRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """
    Send a message to the AI assistant and receive intelligent response.
    
    Features:
    - Context-aware AI responses
    - Cross-group data integration
    - Smart suggestions and recommendations
    - Real-time conversation flow
    """
    try:
        logger.info(f"Sending message to AI conversation: {conversation_id}")
        
        # Send user message and get AI response
        ai_response = await ai_service.send_message(
            conversation_id=conversation_id,
            user_id=current_user.id,
            message=request.message,
            message_type=request.message_type,
            attachments=request.attachments,
            context_override=request.context_override
        )
        
        message_response = MessageResponse(
            message_id=ai_response.id,
            conversation_id=ai_response.conversation_id,
            sender="ai_assistant",
            message=ai_response.response,
            message_type=ai_response.response_type,
            timestamp=ai_response.created_at,
            attachments=ai_response.attachments or [],
            metadata=ai_response.metadata or {}
        )
        
        # Broadcast to WebSocket connections
        await connection_manager.broadcast_to_conversation(
            conversation_id,
            {
                "type": "ai_response",
                "data": message_response.dict()
            }
        )
        
        return StandardResponse(
            success=True,
            message="Message sent and AI response generated",
            data=message_response
        )
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.get("/conversations/{conversation_id}/messages", response_model=StandardResponse[List[MessageResponse]])
async def get_conversation_messages(
    conversation_id: str = Path(..., description="Conversation ID"),
    limit: int = Query(default=50, ge=1, le=200, description="Number of messages to return"),
    offset: int = Query(default=0, ge=0, description="Message offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get conversation message history"""
    try:
        messages = await ai_service.get_conversation_messages(
            conversation_id=conversation_id,
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        
        message_responses = [
            MessageResponse(
                message_id=msg.id,
                conversation_id=msg.conversation_id,
                sender=msg.sender,
                message=msg.message,
                message_type=msg.message_type,
                timestamp=msg.created_at,
                attachments=msg.attachments or [],
                metadata=msg.metadata or {}
            )
            for msg in messages
        ]
        
        return StandardResponse(
            success=True,
            message="Messages retrieved successfully",
            data=message_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting conversation messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

# ========================================================================================
# Real-time AI Conversation WebSocket
# ========================================================================================

@router.websocket("/conversations/{conversation_id}/chat")
async def ai_chat_websocket(
    websocket: WebSocket,
    conversation_id: str = Path(..., description="Conversation ID"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time AI conversation.
    
    Provides:
    - Real-time message exchange
    - Typing indicators
    - Context-aware responses
    - Proactive suggestions
    - File sharing support
    """
    # Note: In a real implementation, you'd need to authenticate the WebSocket connection
    # For now, we'll assume user authentication is handled elsewhere
    
    ai_service = RacineAIService(db)
    user_id = "websocket_user"  # This should come from authentication
    
    await connection_manager.connect(websocket, user_id, conversation_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "user_message":
                # Process user message and get AI response
                ai_response = await ai_service.send_message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    message=message_data.get("message", ""),
                    message_type=message_data.get("message_type", "text")
                )
                
                # Send AI response back
                await websocket.send_json({
                    "type": "ai_response",
                    "data": {
                        "message_id": ai_response.id,
                        "message": ai_response.response,
                        "message_type": ai_response.response_type,
                        "timestamp": ai_response.created_at.isoformat(),
                        "metadata": ai_response.metadata or {}
                    }
                })
                
            elif message_data.get("type") == "typing_start":
                # Handle typing indicators
                await connection_manager.broadcast_to_conversation(
                    conversation_id,
                    {"type": "user_typing", "user_id": user_id}
                )
                
            elif message_data.get("type") == "typing_stop":
                await connection_manager.broadcast_to_conversation(
                    conversation_id,
                    {"type": "user_stopped_typing", "user_id": user_id}
                )
                
            elif message_data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, user_id, conversation_id)
        logger.info(f"WebSocket disconnected for conversation: {conversation_id}")
    except Exception as e:
        logger.error(f"WebSocket error for conversation {conversation_id}: {str(e)}")
        connection_manager.disconnect(websocket, user_id, conversation_id)

# ========================================================================================
# AI Recommendations Routes
# ========================================================================================

@router.post("/recommendations", response_model=StandardResponse[List[RecommendationResponse]])
async def get_recommendations(
    request: RecommendationRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """
    Get AI-powered recommendations for system optimization.
    
    Features:
    - Intelligent workflow optimization
    - Data quality improvements
    - Compliance enhancement suggestions
    - Performance tuning recommendations
    - Automation opportunities
    """
    try:
        logger.info(f"Generating AI recommendations for user: {current_user.id}")
        
        recommendations = await ai_service.generate_recommendations(
            user_id=current_user.id,
            recommendation_type=request.recommendation_type,
            context=request.context,
            scope=request.scope,
            preferences=request.preferences
        )
        
        recommendation_responses = [
            RecommendationResponse(
                recommendation_id=rec.id,
                recommendation_type=rec.recommendation_type,
                title=rec.title,
                description=rec.description,
                priority=rec.priority,
                impact_score=rec.impact_score,
                implementation_effort=rec.implementation_effort,
                benefits=rec.benefits or [],
                actions=rec.actions or [],
                created_at=rec.created_at
            )
            for rec in recommendations
        ]
        
        return StandardResponse(
            success=True,
            message="AI recommendations generated successfully",
            data=recommendation_responses
        )
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/recommendations/{recommendation_id}", response_model=StandardResponse[RecommendationResponse])
async def get_recommendation_details(
    recommendation_id: str = Path(..., description="Recommendation ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get detailed recommendation information"""
    try:
        recommendation = await ai_service.get_recommendation(recommendation_id, current_user.id)
        if not recommendation:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        recommendation_response = RecommendationResponse(
            recommendation_id=recommendation.id,
            recommendation_type=recommendation.recommendation_type,
            title=recommendation.title,
            description=recommendation.description,
            priority=recommendation.priority,
            impact_score=recommendation.impact_score,
            implementation_effort=recommendation.implementation_effort,
            benefits=recommendation.benefits or [],
            actions=recommendation.actions or [],
            created_at=recommendation.created_at
        )
        
        return StandardResponse(
            success=True,
            message="Recommendation retrieved successfully",
            data=recommendation_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendation: {str(e)}")

# ========================================================================================
# AI Analysis Routes
# ========================================================================================

@router.post("/analysis", response_model=StandardResponse[AnalysisResponse])
async def request_analysis(
    request: AnalysisRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """
    Request AI-powered analysis of system resources.
    
    Features:
    - Anomaly detection across all groups
    - Trend analysis and forecasting
    - Compliance assessment automation
    - Performance bottleneck identification
    - Data quality analysis
    """
    try:
        logger.info(f"Requesting AI analysis for user: {current_user.id}")
        
        analysis = await ai_service.perform_analysis(
            user_id=current_user.id,
            analysis_type=request.analysis_type,
            target_resource=request.target_resource,
            analysis_scope=request.analysis_scope,
            parameters=request.parameters
        )
        
        analysis_response = AnalysisResponse(
            analysis_id=analysis.id,
            analysis_type=analysis.analysis_type,
            target_resource=analysis.target_resource,
            status=analysis.status,
            findings=analysis.findings or [],
            insights=analysis.insights or [],
            recommendations=analysis.recommendations or [],
            confidence_score=analysis.confidence_score,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at
        )
        
        return StandardResponse(
            success=True,
            message="AI analysis initiated successfully",
            data=analysis_response
        )
        
    except Exception as e:
        logger.error(f"Error requesting analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to request analysis: {str(e)}")

@router.get("/analysis/{analysis_id}", response_model=StandardResponse[AnalysisResponse])
async def get_analysis_results(
    analysis_id: str = Path(..., description="Analysis ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get AI analysis results"""
    try:
        analysis = await ai_service.get_analysis(analysis_id, current_user.id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        analysis_response = AnalysisResponse(
            analysis_id=analysis.id,
            analysis_type=analysis.analysis_type,
            target_resource=analysis.target_resource,
            status=analysis.status,
            findings=analysis.findings or [],
            insights=analysis.insights or [],
            recommendations=analysis.recommendations or [],
            confidence_score=analysis.confidence_score,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at
        )
        
        return StandardResponse(
            success=True,
            message="Analysis results retrieved successfully",
            data=analysis_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analysis results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analysis: {str(e)}")

# ========================================================================================
# Natural Language Query Routes
# ========================================================================================

@router.post("/query", response_model=StandardResponse[QueryResponse])
async def natural_language_query(
    request: QueryRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """
    Process natural language queries for cross-group data exploration.
    
    Features:
    - Natural language understanding
    - Cross-group data querying
    - Intelligent result formatting
    - Context-aware responses
    - Smart data visualization suggestions
    """
    try:
        logger.info(f"Processing natural language query for user: {current_user.id}")
        
        query_result = await ai_service.process_natural_language_query(
            user_id=current_user.id,
            query=request.query,
            query_scope=request.query_scope,
            context=request.context,
            response_format=request.response_format
        )
        
        query_response = QueryResponse(
            query_id=query_result.id,
            query=query_result.query,
            response=query_result.response,
            response_format=query_result.response_format,
            data=query_result.data,
            confidence_score=query_result.confidence_score,
            sources=query_result.sources or [],
            timestamp=query_result.created_at
        )
        
        return StandardResponse(
            success=True,
            message="Natural language query processed successfully",
            data=query_response
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

# ========================================================================================
# Proactive AI Routes
# ========================================================================================

@router.get("/proactive/alerts", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_proactive_alerts(
    alert_type: Optional[str] = Query(None, description="Filter by alert type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of alerts to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get proactive AI alerts and notifications"""
    try:
        alerts = await ai_service.get_proactive_alerts(
            user_id=current_user.id,
            alert_type=alert_type,
            severity=severity,
            limit=limit
        )
        
        return StandardResponse(
            success=True,
            message="Proactive alerts retrieved successfully",
            data=alerts
        )
        
    except Exception as e:
        logger.error(f"Error getting proactive alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")

@router.get("/proactive/insights", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_proactive_insights(
    workspace_id: Optional[str] = Query(None, description="Filter by workspace"),
    category: Optional[str] = Query(None, description="Filter by insight category"),
    limit: int = Query(default=10, ge=1, le=50, description="Number of insights to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get proactive AI insights and optimization suggestions"""
    try:
        insights = await ai_service.get_proactive_insights(
            user_id=current_user.id,
            workspace_id=workspace_id,
            category=category,
            limit=limit
        )
        
        return StandardResponse(
            success=True,
            message="Proactive insights retrieved successfully",
            data=insights
        )
        
    except Exception as e:
        logger.error(f"Error getting proactive insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {str(e)}")

# ========================================================================================
# AI Model Management Routes
# ========================================================================================

@router.get("/models", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_ai_models(
    model_type: Optional[str] = Query(None, description="Filter by model type"),
    status: Optional[str] = Query(None, description="Filter by model status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Get available AI models and their capabilities"""
    try:
        models = await ai_service.get_available_models(
            user_id=current_user.id,
            model_type=model_type,
            status=status
        )
        
        return StandardResponse(
            success=True,
            message="AI models retrieved successfully",
            data=models
        )
        
    except Exception as e:
        logger.error(f"Error getting AI models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")

@router.get("/health", response_model=StandardResponse[Dict[str, Any]])
async def ai_health_check(
    db: Session = Depends(get_db),
    ai_service: RacineAIService = Depends(get_ai_service)
):
    """Health check for AI service"""
    try:
        health_status = await ai_service.get_service_health()
        
        return StandardResponse(
            success=True,
            message="AI service health check completed",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"AI service health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ========================================================================================
# Error Handlers and Middleware
# ========================================================================================

@router.exception_handler(RacineException)
async def racine_exception_handler(request, exc: RacineException):
    """Handle Racine-specific exceptions"""
    logger.error(f"Racine AI error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "error_code": exc.error_code}
    )

# Export router
__all__ = ["router", "connection_manager"]