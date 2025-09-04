"""
Racine Pipeline Routes - Intelligent Pipeline Creation and Management System
===========================================================================

This module provides comprehensive API routes for creating, designing, visualizing, and executing 
intelligent pipelines tailored to the platform's data governance services. The system enables
users to build custom data processing pipelines with advanced features like drag-and-drop design,
AI optimization, real-time monitoring, and cross-group integration.

Key Features:
- Visual pipeline designer with drag-and-drop interface
- Cross-group data processing orchestration
- AI-powered pipeline optimization and recommendations
- Real-time execution monitoring and debugging
- Template library for common pipeline patterns
- Advanced error handling and recovery mechanisms
- Pipeline versioning and change management
- Performance analytics and optimization insights

Integrations:
- Deep integration with all 7 data governance groups
- Real-time WebSocket streaming for execution monitoring
- Advanced RBAC for pipeline access control
- Comprehensive audit logging and lineage tracking
- AI-driven optimization recommendations

Architecture:
- FastAPI router with comprehensive error handling
- Pydantic models for request/response validation
- WebSocket support for real-time updates
- Integration with RacinePipelineService
- RBAC-integrated security at all endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, Path, Body, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from uuid import UUID
import json
import asyncio
from pydantic import BaseModel, Field, validator

# Database and Authentication
from ....database import get_db
from ....auth.dependencies import get_current_user, require_permission
from ....models.auth_models import User

# Racine Services
from ....services.racine_services.racine_pipeline_service import RacinePipelineService

# Racine Models
from ....models.racine_models.racine_pipeline_models import (
    RacinePipeline,
    RacinePipelineNode,
    RacinePipelineExecution,
    RacinePipelineTemplate,
    RacinePipelineVersion
)

# Cross-group models for integration
from ....models.scan_models import DataSource
from ....models.compliance_models import ComplianceRule
from ....models.classification_models import ClassificationRule
from ....models.advanced_catalog_models import CatalogItem

# Utilities
from ....core.logging_utils import get_logger
from ....core.exceptions import RacineException
from ....core.response_models import StandardResponse

# Initialize logger
logger = get_logger(__name__)

# Initialize router
router = APIRouter(
    prefix="/api/racine/pipeline",
    tags=["Racine Pipeline Management"],
    responses={
        404: {"description": "Pipeline not found"},
        403: {"description": "Insufficient permissions"},
        500: {"description": "Internal server error"}
    }
)

# ========================================================================================
# Pydantic Models for Requests and Responses
# ========================================================================================

class PipelineNodeRequest(BaseModel):
    """Request model for creating pipeline nodes"""
    name: str = Field(..., min_length=1, max_length=255, description="Node name")
    node_type: str = Field(..., description="Type of pipeline node")
    group_target: str = Field(..., description="Target group for execution")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Node configuration")
    input_connections: List[str] = Field(default_factory=list, description="Input node connections")
    output_connections: List[str] = Field(default_factory=list, description="Output node connections")
    position: Dict[str, float] = Field(..., description="Node position in designer")
    timeout_seconds: Optional[int] = Field(None, ge=1, description="Node timeout")
    retry_policy: Dict[str, Any] = Field(default_factory=dict, description="Retry configuration")
    condition: Optional[str] = Field(None, description="Execution condition")
    
    @validator('node_type')
    def validate_node_type(cls, v):
        allowed_types = [
            'data_source', 'data_transformation', 'data_validation',
            'classification_node', 'compliance_check', 'catalog_update',
            'custom_script', 'ml_model', 'notification', 'branch',
            'merge', 'filter', 'aggregation', 'export'
        ]
        if v not in allowed_types:
            raise ValueError(f"Node type must be one of: {allowed_types}")
        return v
    
    @validator('group_target')
    def validate_group_target(cls, v):
        allowed_groups = [
            'data_sources', 'scan_rules', 'classifications',
            'compliance', 'catalog', 'scan_logic', 'rbac', 'custom'
        ]
        if v not in allowed_groups:
            raise ValueError(f"Group target must be one of: {allowed_groups}")
        return v

class PipelineCreateRequest(BaseModel):
    """Request model for creating pipelines"""
    name: str = Field(..., min_length=1, max_length=255, description="Pipeline name")
    description: Optional[str] = Field(None, max_length=2000, description="Pipeline description")
    pipeline_type: str = Field(default="data_processing", description="Pipeline type")
    workspace_id: str = Field(..., description="Associated workspace ID")
    nodes: List[PipelineNodeRequest] = Field(..., min_items=1, description="Pipeline nodes")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Global pipeline configuration")
    schedule_config: Optional[Dict[str, Any]] = Field(None, description="Schedule configuration")
    notification_config: Dict[str, Any] = Field(default_factory=dict, description="Notification settings")
    tags: List[str] = Field(default_factory=list, description="Pipeline tags")
    enable_ai_optimization: bool = Field(default=True, description="Enable AI optimization")
    
    @validator('pipeline_type')
    def validate_pipeline_type(cls, v):
        allowed_types = [
            'data_processing', 'data_quality', 'compliance_check',
            'classification_pipeline', 'catalog_sync', 'custom'
        ]
        if v not in allowed_types:
            raise ValueError(f"Pipeline type must be one of: {allowed_types}")
        return v

class PipelineUpdateRequest(BaseModel):
    """Request model for updating pipelines"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    configuration: Optional[Dict[str, Any]] = None
    notification_config: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    enable_ai_optimization: Optional[bool] = None

class PipelineExecutionRequest(BaseModel):
    """Request model for pipeline execution"""
    execution_parameters: Dict[str, Any] = Field(default_factory=dict, description="Execution parameters")
    execution_mode: str = Field(default="normal", description="Execution mode")
    priority: int = Field(default=5, ge=1, le=10, description="Execution priority")
    timeout_seconds: Optional[int] = Field(None, ge=1, description="Global timeout")
    enable_debugging: bool = Field(default=False, description="Enable debugging mode")
    checkpoint_enabled: bool = Field(default=True, description="Enable checkpointing")
    
    @validator('execution_mode')
    def validate_execution_mode(cls, v):
        allowed_modes = ['normal', 'debug', 'dry_run', 'test', 'validation']
        if v not in allowed_modes:
            raise ValueError(f"Execution mode must be one of: {allowed_modes}")
        return v

class PipelineOptimizationRequest(BaseModel):
    """Request model for AI-powered pipeline optimization"""
    optimization_goals: List[str] = Field(..., description="Optimization objectives")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="Optimization constraints")
    performance_data: Optional[Dict[str, Any]] = Field(None, description="Historical performance data")
    
    @validator('optimization_goals')
    def validate_optimization_goals(cls, v):
        allowed_goals = [
            'performance', 'cost', 'reliability', 'accuracy',
            'latency', 'throughput', 'resource_usage'
        ]
        for goal in v:
            if goal not in allowed_goals:
                raise ValueError(f"Optimization goal must be one of: {allowed_goals}")
        return v

class PipelineTemplateRequest(BaseModel):
    """Request model for pipeline templates"""
    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    description: Optional[str] = Field(None, max_length=2000, description="Template description")
    category: str = Field(..., description="Template category")
    template_data: Dict[str, Any] = Field(..., description="Template pipeline data")
    parameters: List[Dict[str, Any]] = Field(default_factory=list, description="Template parameters")
    tags: List[str] = Field(default_factory=list, description="Template tags")
    is_public: bool = Field(default=False, description="Whether template is public")

# Response Models
class PipelineResponse(BaseModel):
    """Response model for pipeline operations"""
    id: str
    name: str
    description: Optional[str]
    pipeline_type: str
    workspace_id: str
    status: str
    configuration: Dict[str, Any]
    node_count: int
    version: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    tags: List[str]
    ai_optimization_enabled: bool

class PipelineExecutionResponse(BaseModel):
    """Response model for pipeline execution"""
    execution_id: str
    pipeline_id: str
    status: str
    execution_mode: str
    priority: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    progress_percentage: float
    current_node: Optional[str]
    execution_log: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    checkpoint_data: Optional[Dict[str, Any]]

class PipelineNodeExecutionResponse(BaseModel):
    """Response model for node execution"""
    node_id: str
    execution_id: str
    node_name: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    input_data: Optional[Dict[str, Any]]
    output_data: Optional[Dict[str, Any]]
    error_message: Optional[str]
    retry_count: int

class PipelineOptimizationResponse(BaseModel):
    """Response model for pipeline optimization"""
    optimization_id: str
    pipeline_id: str
    recommendations: List[Dict[str, Any]]
    expected_improvements: Dict[str, Any]
    optimization_score: float
    applied: bool
    created_at: datetime

# ========================================================================================
# WebSocket Connection Manager
# ========================================================================================

class PipelineConnectionManager:
    """Manages WebSocket connections for real-time pipeline monitoring"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, execution_id: str):
        """Connect to pipeline execution monitoring"""
        await websocket.accept()
        if execution_id not in self.active_connections:
            self.active_connections[execution_id] = []
        self.active_connections[execution_id].append(websocket)
        logger.info(f"WebSocket connected for pipeline execution: {execution_id}")
    
    def disconnect(self, websocket: WebSocket, execution_id: str):
        """Disconnect from pipeline execution monitoring"""
        if execution_id in self.active_connections:
            if websocket in self.active_connections[execution_id]:
                self.active_connections[execution_id].remove(websocket)
                if not self.active_connections[execution_id]:
                    del self.active_connections[execution_id]
        logger.info(f"WebSocket disconnected for pipeline execution: {execution_id}")
    
    async def broadcast_to_execution(self, execution_id: str, message: dict):
        """Broadcast message to all connections monitoring an execution"""
        if execution_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[execution_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for connection in disconnected:
                self.disconnect(connection, execution_id)

# Initialize connection manager
connection_manager = PipelineConnectionManager()

# ========================================================================================
# Utility Functions
# ========================================================================================

def get_pipeline_service(db: Session = Depends(get_db)) -> RacinePipelineService:
    """Get pipeline service instance"""
    return RacinePipelineService(db)

# ========================================================================================
# Pipeline Management Routes
# ========================================================================================

@router.post("/create", response_model=StandardResponse[PipelineResponse])
async def create_pipeline(
    request: PipelineCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """
    Create a new intelligent pipeline with cross-group integration capabilities.
    
    Features:
    - Visual pipeline designer support
    - Cross-group node orchestration
    - AI-powered optimization
    - Template-based creation
    """
    try:
        logger.info(f"Creating pipeline: {request.name} by user: {current_user.id}")
        
        # Create the pipeline
        pipeline = await pipeline_service.create_pipeline(
            name=request.name,
            description=request.description,
            pipeline_type=request.pipeline_type,
            workspace_id=request.workspace_id,
            nodes_data=request.nodes,
            configuration=request.configuration,
            schedule_config=request.schedule_config,
            notification_config=request.notification_config,
            tags=request.tags,
            enable_ai_optimization=request.enable_ai_optimization,
            created_by=current_user.id
        )
        
        # Convert to response model
        pipeline_response = PipelineResponse(
            id=pipeline.id,
            name=pipeline.name,
            description=pipeline.description,
            pipeline_type=pipeline.pipeline_type,
            workspace_id=pipeline.workspace_id,
            status=pipeline.status,
            configuration=pipeline.configuration,
            node_count=len(pipeline.nodes),
            version=pipeline.version,
            created_at=pipeline.created_at,
            updated_at=pipeline.updated_at,
            created_by=pipeline.created_by,
            tags=pipeline.tags or [],
            ai_optimization_enabled=pipeline.ai_optimization_enabled
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline created successfully",
            data=pipeline_response
        )
        
    except Exception as e:
        logger.error(f"Error creating pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create pipeline: {str(e)}")

@router.get("/{pipeline_id}", response_model=StandardResponse[PipelineResponse])
async def get_pipeline(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Get pipeline details by ID"""
    try:
        pipeline = await pipeline_service.get_pipeline(pipeline_id, current_user.id)
        if not pipeline:
            raise HTTPException(status_code=404, detail="Pipeline not found")
        
        pipeline_response = PipelineResponse(
            id=pipeline.id,
            name=pipeline.name,
            description=pipeline.description,
            pipeline_type=pipeline.pipeline_type,
            workspace_id=pipeline.workspace_id,
            status=pipeline.status,
            configuration=pipeline.configuration,
            node_count=len(pipeline.nodes),
            version=pipeline.version,
            created_at=pipeline.created_at,
            updated_at=pipeline.updated_at,
            created_by=pipeline.created_by,
            tags=pipeline.tags or [],
            ai_optimization_enabled=pipeline.ai_optimization_enabled
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline retrieved successfully",
            data=pipeline_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting pipeline {pipeline_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get pipeline: {str(e)}")

@router.put("/{pipeline_id}", response_model=StandardResponse[PipelineResponse])
async def update_pipeline(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    request: PipelineUpdateRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Update pipeline configuration"""
    try:
        logger.info(f"Updating pipeline: {pipeline_id} by user: {current_user.id}")
        
        update_data = {k: v for k, v in request.model_dump().items() if v is not None}
        
        pipeline = await pipeline_service.update_pipeline(
            pipeline_id=pipeline_id,
            update_data=update_data,
            updated_by=current_user.id
        )
        
        pipeline_response = PipelineResponse(
            id=pipeline.id,
            name=pipeline.name,
            description=pipeline.description,
            pipeline_type=pipeline.pipeline_type,
            workspace_id=pipeline.workspace_id,
            status=pipeline.status,
            configuration=pipeline.configuration,
            node_count=len(pipeline.nodes),
            version=pipeline.version,
            created_at=pipeline.created_at,
            updated_at=pipeline.updated_at,
            created_by=pipeline.created_by,
            tags=pipeline.tags or [],
            ai_optimization_enabled=pipeline.ai_optimization_enabled
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline updated successfully",
            data=pipeline_response
        )
        
    except Exception as e:
        logger.error(f"Error updating pipeline {pipeline_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update pipeline: {str(e)}")

@router.delete("/{pipeline_id}", response_model=StandardResponse[Dict[str, str]])
async def delete_pipeline(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Delete a pipeline"""
    try:
        logger.info(f"Deleting pipeline: {pipeline_id} by user: {current_user.id}")
        
        await pipeline_service.delete_pipeline(pipeline_id, current_user.id)
        
        return StandardResponse(
            success=True,
            message="Pipeline deleted successfully",
            data={"pipeline_id": pipeline_id}
        )
        
    except Exception as e:
        logger.error(f"Error deleting pipeline {pipeline_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete pipeline: {str(e)}")

# ========================================================================================
# Pipeline Execution Routes
# ========================================================================================

@router.post("/{pipeline_id}/execute", response_model=StandardResponse[PipelineExecutionResponse])
async def execute_pipeline(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    request: PipelineExecutionRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """
    Execute a pipeline with real-time monitoring capabilities.
    
    Features:
    - Asynchronous execution with progress tracking
    - Real-time WebSocket updates
    - Cross-group node orchestration
    - Advanced error handling and recovery
    - Checkpointing for fault tolerance
    """
    try:
        logger.info(f"Executing pipeline: {pipeline_id} by user: {current_user.id}")
        
        execution = await pipeline_service.execute_pipeline(
            pipeline_id=pipeline_id,
            execution_parameters=request.execution_parameters,
            execution_mode=request.execution_mode,
            priority=request.priority,
            timeout_seconds=request.timeout_seconds,
            enable_debugging=request.enable_debugging,
            checkpoint_enabled=request.checkpoint_enabled,
            executed_by=current_user.id
        )
        
        execution_response = PipelineExecutionResponse(
            execution_id=execution.id,
            pipeline_id=execution.pipeline_id,
            status=execution.status,
            execution_mode=execution.execution_mode,
            priority=execution.priority,
            started_at=execution.started_at,
            completed_at=execution.completed_at,
            progress_percentage=execution.progress_percentage,
            current_node=execution.current_node,
            execution_log=execution.execution_log or [],
            metrics=execution.metrics or {},
            checkpoint_data=execution.checkpoint_data
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline execution started",
            data=execution_response
        )
        
    except Exception as e:
        logger.error(f"Error executing pipeline {pipeline_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute pipeline: {str(e)}")

@router.get("/{pipeline_id}/executions", response_model=StandardResponse[List[PipelineExecutionResponse]])
async def get_pipeline_executions(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of executions to return"),
    offset: int = Query(default=0, ge=0, description="Execution offset"),
    status: Optional[str] = Query(None, description="Filter by execution status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Get pipeline execution history"""
    try:
        executions = await pipeline_service.get_pipeline_executions(
            pipeline_id=pipeline_id,
            limit=limit,
            offset=offset,
            status_filter=status,
            user_id=current_user.id
        )
        
        execution_responses = [
            PipelineExecutionResponse(
                execution_id=execution.id,
                pipeline_id=execution.pipeline_id,
                status=execution.status,
                execution_mode=execution.execution_mode,
                priority=execution.priority,
                started_at=execution.started_at,
                completed_at=execution.completed_at,
                progress_percentage=execution.progress_percentage,
                current_node=execution.current_node,
                execution_log=execution.execution_log or [],
                metrics=execution.metrics or {},
                checkpoint_data=execution.checkpoint_data
            )
            for execution in executions
        ]
        
        return StandardResponse(
            success=True,
            message="Pipeline executions retrieved successfully",
            data=execution_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting pipeline executions for {pipeline_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get pipeline executions: {str(e)}")

@router.get("/executions/{execution_id}", response_model=StandardResponse[PipelineExecutionResponse])
async def get_execution_details(
    execution_id: str = Path(..., description="Execution ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Get detailed execution information"""
    try:
        execution = await pipeline_service.get_execution_details(execution_id, current_user.id)
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        execution_response = PipelineExecutionResponse(
            execution_id=execution.id,
            pipeline_id=execution.pipeline_id,
            status=execution.status,
            execution_mode=execution.execution_mode,
            priority=execution.priority,
            started_at=execution.started_at,
            completed_at=execution.completed_at,
            progress_percentage=execution.progress_percentage,
            current_node=execution.current_node,
            execution_log=execution.execution_log or [],
            metrics=execution.metrics or {},
            checkpoint_data=execution.checkpoint_data
        )
        
        return StandardResponse(
            success=True,
            message="Execution details retrieved successfully",
            data=execution_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting execution details {execution_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get execution details: {str(e)}")

@router.post("/executions/{execution_id}/control", response_model=StandardResponse[Dict[str, str]])
async def control_execution(
    execution_id: str = Path(..., description="Execution ID"),
    action: str = Body(..., embed=True, description="Control action"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Control pipeline execution (pause, resume, cancel)"""
    try:
        logger.info(f"Controlling execution: {execution_id} action: {action} by user: {current_user.id}")
        
        if action not in ['pause', 'resume', 'cancel', 'retry', 'restart_from_checkpoint']:
            raise HTTPException(status_code=400, detail="Invalid control action")
        
        result = await pipeline_service.control_execution(
            execution_id=execution_id,
            action=action,
            controlled_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message=f"Execution {action} command executed successfully",
            data={"execution_id": execution_id, "action": action, "result": result}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error controlling execution {execution_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to control execution: {str(e)}")

# ========================================================================================
# Real-time Monitoring WebSocket
# ========================================================================================

@router.websocket("/executions/{execution_id}/monitor")
async def monitor_execution(
    websocket: WebSocket,
    execution_id: str = Path(..., description="Execution ID"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time pipeline execution monitoring.
    
    Provides:
    - Real-time execution status updates
    - Node progress monitoring
    - Log streaming
    - Performance metrics
    - Error notifications
    - Debug information
    """
    await connection_manager.connect(websocket, execution_id)
    pipeline_service = RacinePipelineService(db)
    
    try:
        # Send initial execution status
        execution = await pipeline_service.get_execution_details(execution_id)
        if execution:
            await websocket.send_json({
                "type": "execution_status",
                "data": {
                    "execution_id": execution_id,
                    "status": execution.status,
                    "progress": execution.progress_percentage,
                    "current_node": execution.current_node,
                    "started_at": execution.started_at.isoformat() if execution.started_at else None,
                    "metrics": execution.metrics or {},
                    "checkpoint_data": execution.checkpoint_data
                }
            })
        
        # Keep connection alive and handle real-time updates
        while True:
            try:
                # Wait for messages (with timeout to check for updates)
                data = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
                
                # Handle client messages if needed
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message.get("type") == "get_node_details":
                    node_id = message.get("node_id")
                    if node_id:
                        node_details = await pipeline_service.get_node_execution_details(
                            execution_id, node_id
                        )
                        await websocket.send_json({
                            "type": "node_details",
                            "data": node_details
                        })
                    
            except asyncio.TimeoutError:
                # Check for execution updates
                execution = await pipeline_service.get_execution_details(execution_id)
                if execution:
                    await websocket.send_json({
                        "type": "execution_update",
                        "data": {
                            "execution_id": execution_id,
                            "status": execution.status,
                            "progress": execution.progress_percentage,
                            "current_node": execution.current_node,
                            "metrics": execution.metrics or {}
                        }
                    })
                continue
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, execution_id)
        logger.info(f"WebSocket disconnected for execution: {execution_id}")
    except Exception as e:
        logger.error(f"WebSocket error for execution {execution_id}: {str(e)}")
        connection_manager.disconnect(websocket, execution_id)

# ========================================================================================
# AI Optimization Routes
# ========================================================================================

@router.post("/{pipeline_id}/optimize", response_model=StandardResponse[PipelineOptimizationResponse])
async def optimize_pipeline(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    request: PipelineOptimizationRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """
    Apply AI-powered optimization to improve pipeline performance.
    
    Features:
    - Performance optimization recommendations
    - Cost optimization analysis
    - Resource usage optimization
    - Reliability improvements
    - Custom optimization goals
    """
    try:
        logger.info(f"Optimizing pipeline: {pipeline_id} by user: {current_user.id}")
        
        optimization = await pipeline_service.optimize_pipeline(
            pipeline_id=pipeline_id,
            optimization_goals=request.optimization_goals,
            constraints=request.constraints,
            performance_data=request.performance_data,
            optimized_by=current_user.id
        )
        
        optimization_response = PipelineOptimizationResponse(
            optimization_id=optimization.id,
            pipeline_id=optimization.pipeline_id,
            recommendations=optimization.recommendations,
            expected_improvements=optimization.expected_improvements,
            optimization_score=optimization.optimization_score,
            applied=optimization.applied,
            created_at=optimization.created_at
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline optimization completed",
            data=optimization_response
        )
        
    except Exception as e:
        logger.error(f"Error optimizing pipeline {pipeline_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize pipeline: {str(e)}")

@router.post("/{pipeline_id}/apply-optimization/{optimization_id}", response_model=StandardResponse[Dict[str, str]])
async def apply_optimization(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    optimization_id: str = Path(..., description="Optimization ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Apply optimization recommendations to the pipeline"""
    try:
        logger.info(f"Applying optimization {optimization_id} to pipeline: {pipeline_id} by user: {current_user.id}")
        
        result = await pipeline_service.apply_optimization(
            pipeline_id=pipeline_id,
            optimization_id=optimization_id,
            applied_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Optimization applied successfully",
            data={
                "pipeline_id": pipeline_id,
                "optimization_id": optimization_id,
                "result": result
            }
        )
        
    except Exception as e:
        logger.error(f"Error applying optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to apply optimization: {str(e)}")

# ========================================================================================
# Pipeline Versioning Routes
# ========================================================================================

@router.post("/{pipeline_id}/version", response_model=StandardResponse[Dict[str, str]])
async def create_pipeline_version(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    version_notes: str = Body(..., embed=True, description="Version notes"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Create a new version of the pipeline"""
    try:
        logger.info(f"Creating version for pipeline: {pipeline_id} by user: {current_user.id}")
        
        version = await pipeline_service.create_pipeline_version(
            pipeline_id=pipeline_id,
            version_notes=version_notes,
            created_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline version created successfully",
            data={"version_id": version.id, "version_number": str(version.version_number)}
        )
        
    except Exception as e:
        logger.error(f"Error creating pipeline version: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create version: {str(e)}")

@router.get("/{pipeline_id}/versions", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_pipeline_versions(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Get pipeline version history"""
    try:
        versions = await pipeline_service.get_pipeline_versions(pipeline_id, current_user.id)
        
        return StandardResponse(
            success=True,
            message="Pipeline versions retrieved successfully",
            data=versions
        )
        
    except Exception as e:
        logger.error(f"Error getting pipeline versions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get versions: {str(e)}")

# ========================================================================================
# Template Management Routes
# ========================================================================================

@router.post("/templates", response_model=StandardResponse[Dict[str, str]])
async def create_pipeline_template(
    request: PipelineTemplateRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Create a pipeline template"""
    try:
        logger.info(f"Creating pipeline template: {request.name} by user: {current_user.id}")
        
        template = await pipeline_service.create_pipeline_template(
            name=request.name,
            description=request.description,
            category=request.category,
            template_data=request.template_data,
            parameters=request.parameters,
            tags=request.tags,
            is_public=request.is_public,
            created_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline template created successfully",
            data={"template_id": template.id}
        )
        
    except Exception as e:
        logger.error(f"Error creating pipeline template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@router.get("/templates", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_pipeline_templates(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of templates to return"),
    offset: int = Query(default=0, ge=0, description="Template offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Get pipeline templates"""
    try:
        templates = await pipeline_service.get_pipeline_templates(
            category_filter=category,
            limit=limit,
            offset=offset,
            user_id=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline templates retrieved successfully",
            data=templates
        )
        
    except Exception as e:
        logger.error(f"Error getting pipeline templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")

# ========================================================================================
# Analytics and Monitoring Routes
# ========================================================================================

@router.get("/{pipeline_id}/analytics", response_model=StandardResponse[Dict[str, Any]])
async def get_pipeline_analytics(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    days: int = Query(default=30, ge=1, le=365, description="Number of days for analytics"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Get comprehensive pipeline analytics"""
    try:
        analytics = await pipeline_service.get_pipeline_analytics(
            pipeline_id=pipeline_id,
            days=days,
            user_id=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline analytics retrieved successfully",
            data=analytics
        )
        
    except Exception as e:
        logger.error(f"Error getting pipeline analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.get("/health", response_model=StandardResponse[Dict[str, Any]])
async def pipeline_health_check(
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Health check for pipeline service"""
    try:
        health_status = await pipeline_service.get_service_health()
        
        return StandardResponse(
            success=True,
            message="Pipeline service health check completed",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"Pipeline service health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ========================================================================================
# Import/Export Routes
# ========================================================================================

@router.post("/{pipeline_id}/export", response_model=StandardResponse[Dict[str, str]])
async def export_pipeline(
    pipeline_id: str = Path(..., description="Pipeline ID"),
    format: str = Query(default="json", description="Export format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Export pipeline configuration"""
    try:
        export_data = await pipeline_service.export_pipeline(
            pipeline_id=pipeline_id,
            format=format,
            user_id=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline exported successfully",
            data={"export_url": export_data["url"], "format": format}
        )
        
    except Exception as e:
        logger.error(f"Error exporting pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export pipeline: {str(e)}")

@router.post("/import", response_model=StandardResponse[Dict[str, str]])
async def import_pipeline(
    file: UploadFile = File(..., description="Pipeline file to import"),
    workspace_id: str = Body(..., embed=True, description="Target workspace ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    pipeline_service: RacinePipelineService = Depends(get_pipeline_service)
):
    """Import pipeline from file"""
    try:
        logger.info(f"Importing pipeline from file: {file.filename} by user: {current_user.id}")
        
        file_content = await file.read()
        
        pipeline = await pipeline_service.import_pipeline(
            file_content=file_content,
            filename=file.filename,
            workspace_id=workspace_id,
            imported_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Pipeline imported successfully",
            data={"pipeline_id": pipeline.id, "name": pipeline.name}
        )
        
    except Exception as e:
        logger.error(f"Error importing pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to import pipeline: {str(e)}")

# ========================================================================================
# Error Handlers and Middleware
# ========================================================================================

@router.exception_handler(RacineException)
async def racine_exception_handler(request, exc: RacineException):
    """Handle Racine-specific exceptions"""
    logger.error(f"Racine pipeline error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "error_code": exc.error_code}
    )

# Export router
__all__ = ["router", "connection_manager"]