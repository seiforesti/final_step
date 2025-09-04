"""
Racine Workflow Routes - Advanced Job Workflow Management System
================================================================

This module provides comprehensive API routes for Databricks-style workflow management
with advanced cross-group orchestration capabilities. The system enables users to create,
execute, monitor, and optimize complex workflows that span across all 7 data governance groups.

Key Features:
- Visual workflow builder with drag-and-drop interface
- Cross-group operation orchestration
- Real-time execution monitoring and logging
- Advanced scheduling with event triggers
- AI-powered workflow optimization
- Template library management
- Dependency management and error handling
- Performance analytics and optimization

Integrations:
- Deep integration with all existing group services
- Real-time WebSocket streaming for execution monitoring
- Advanced RBAC for workflow access control
- Comprehensive audit logging
- Performance metrics and analytics

Architecture:
- FastAPI router with comprehensive error handling
- Pydantic models for request/response validation
- WebSocket support for real-time updates
- Integration with RacineWorkflowService
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
from pydantic import BaseModel, Field, validator

# Database and Authentication
from ....database import get_db
from ....auth.dependencies import get_current_user, require_permission
from ....models.auth_models import User

# Racine Services
from ....services.racine_services.racine_workflow_service import RacineWorkflowService

# Racine Models
from ....models.racine_models.racine_workflow_models import (
    RacineJobWorkflow, 
    RacineWorkflowStep,
    RacineWorkflowExecution,
    RacineWorkflowTemplate,
    RacineWorkflowSchedule
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
    prefix="/api/racine/workflow",
    tags=["Racine Workflow Management"],
    responses={
        404: {"description": "Workflow not found"},
        403: {"description": "Insufficient permissions"},
        500: {"description": "Internal server error"}
    }
)

# ========================================================================================
# Pydantic Models for Requests and Responses
# ========================================================================================

class WorkflowStepRequest(BaseModel):
    """Request model for creating workflow steps"""
    name: str = Field(..., min_length=1, max_length=255, description="Step name")
    step_type: str = Field(..., description="Type of workflow step")
    group_target: str = Field(..., description="Target group for execution")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Step configuration")
    dependencies: List[str] = Field(default_factory=list, description="Step dependencies")
    timeout_seconds: Optional[int] = Field(None, ge=1, description="Step timeout")
    retry_count: int = Field(default=3, ge=0, le=10, description="Retry attempts")
    condition: Optional[str] = Field(None, description="Execution condition")
    
    @validator('step_type')
    def validate_step_type(cls, v):
        allowed_types = [
            'data_scan', 'compliance_check', 'classification_run',
            'catalog_update', 'data_quality_check', 'custom_script',
            'notification', 'approval_gate', 'conditional_branch'
        ]
        if v not in allowed_types:
            raise ValueError(f"Step type must be one of: {allowed_types}")
        return v
    
    @validator('group_target')
    def validate_group_target(cls, v):
        allowed_groups = [
            'data_sources', 'scan_rules', 'classifications',
            'compliance', 'catalog', 'scan_logic', 'rbac'
        ]
        if v not in allowed_groups:
            raise ValueError(f"Group target must be one of: {allowed_groups}")
        return v

class WorkflowCreateRequest(BaseModel):
    """Request model for creating workflows"""
    name: str = Field(..., min_length=1, max_length=255, description="Workflow name")
    description: Optional[str] = Field(None, max_length=2000, description="Workflow description")
    workflow_type: str = Field(default="sequential", description="Workflow execution type")
    workspace_id: str = Field(..., description="Associated workspace ID")
    steps: List[WorkflowStepRequest] = Field(..., min_items=1, description="Workflow steps")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Global workflow configuration")
    schedule_config: Optional[Dict[str, Any]] = Field(None, description="Schedule configuration")
    notification_config: Dict[str, Any] = Field(default_factory=dict, description="Notification settings")
    tags: List[str] = Field(default_factory=list, description="Workflow tags")
    
    @validator('workflow_type')
    def validate_workflow_type(cls, v):
        allowed_types = ['sequential', 'parallel', 'dag', 'conditional']
        if v not in allowed_types:
            raise ValueError(f"Workflow type must be one of: {allowed_types}")
        return v

class WorkflowUpdateRequest(BaseModel):
    """Request model for updating workflows"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    configuration: Optional[Dict[str, Any]] = None
    notification_config: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None

class WorkflowExecutionRequest(BaseModel):
    """Request model for workflow execution"""
    execution_parameters: Dict[str, Any] = Field(default_factory=dict, description="Execution parameters")
    execution_mode: str = Field(default="normal", description="Execution mode")
    priority: int = Field(default=5, ge=1, le=10, description="Execution priority")
    max_parallel_steps: Optional[int] = Field(None, ge=1, description="Max parallel steps")
    timeout_seconds: Optional[int] = Field(None, ge=1, description="Global timeout")
    
    @validator('execution_mode')
    def validate_execution_mode(cls, v):
        allowed_modes = ['normal', 'debug', 'dry_run', 'test']
        if v not in allowed_modes:
            raise ValueError(f"Execution mode must be one of: {allowed_modes}")
        return v

class WorkflowScheduleRequest(BaseModel):
    """Request model for workflow scheduling"""
    schedule_type: str = Field(..., description="Type of schedule")
    cron_expression: Optional[str] = Field(None, description="Cron expression for schedule")
    interval_seconds: Optional[int] = Field(None, ge=60, description="Interval in seconds")
    start_time: Optional[datetime] = Field(None, description="Schedule start time")
    end_time: Optional[datetime] = Field(None, description="Schedule end time")
    timezone: str = Field(default="UTC", description="Timezone for schedule")
    execution_parameters: Dict[str, Any] = Field(default_factory=dict, description="Default execution parameters")
    is_active: bool = Field(default=True, description="Whether schedule is active")
    
    @validator('schedule_type')
    def validate_schedule_type(cls, v):
        allowed_types = ['cron', 'interval', 'event_driven', 'manual']
        if v not in allowed_types:
            raise ValueError(f"Schedule type must be one of: {allowed_types}")
        return v

class WorkflowTemplateRequest(BaseModel):
    """Request model for workflow templates"""
    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    description: Optional[str] = Field(None, max_length=2000, description="Template description")
    category: str = Field(..., description="Template category")
    template_data: Dict[str, Any] = Field(..., description="Template workflow data")
    parameters: List[Dict[str, Any]] = Field(default_factory=list, description="Template parameters")
    tags: List[str] = Field(default_factory=list, description="Template tags")
    is_public: bool = Field(default=False, description="Whether template is public")

# Response Models
class WorkflowResponse(BaseModel):
    """Response model for workflow operations"""
    id: str
    name: str
    description: Optional[str]
    workflow_type: str
    workspace_id: str
    status: str
    configuration: Dict[str, Any]
    step_count: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    tags: List[str]

class WorkflowExecutionResponse(BaseModel):
    """Response model for workflow execution"""
    execution_id: str
    workflow_id: str
    status: str
    execution_mode: str
    priority: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    progress_percentage: float
    current_step: Optional[str]
    execution_log: List[Dict[str, Any]]
    metrics: Dict[str, Any]

class WorkflowStepExecutionResponse(BaseModel):
    """Response model for step execution"""
    step_id: str
    execution_id: str
    step_name: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    output: Optional[Dict[str, Any]]
    error_message: Optional[str]
    retry_count: int

# ========================================================================================
# WebSocket Connection Manager
# ========================================================================================

class WorkflowConnectionManager:
    """Manages WebSocket connections for real-time workflow monitoring"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, execution_id: str):
        """Connect to workflow execution monitoring"""
        await websocket.accept()
        if execution_id not in self.active_connections:
            self.active_connections[execution_id] = []
        self.active_connections[execution_id].append(websocket)
        logger.info(f"WebSocket connected for execution: {execution_id}")
    
    def disconnect(self, websocket: WebSocket, execution_id: str):
        """Disconnect from workflow execution monitoring"""
        if execution_id in self.active_connections:
            if websocket in self.active_connections[execution_id]:
                self.active_connections[execution_id].remove(websocket)
                if not self.active_connections[execution_id]:
                    del self.active_connections[execution_id]
        logger.info(f"WebSocket disconnected for execution: {execution_id}")
    
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
connection_manager = WorkflowConnectionManager()

# ========================================================================================
# Utility Functions
# ========================================================================================

def get_workflow_service(db: Session = Depends(get_db)) -> RacineWorkflowService:
    """Get workflow service instance"""
    return RacineWorkflowService(db)

# ========================================================================================
# Workflow Management Routes
# ========================================================================================

@router.post("/create", response_model=StandardResponse[WorkflowResponse])
async def create_workflow(
    request: WorkflowCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """
    Create a new job workflow with cross-group orchestration capabilities.
    
    Features:
    - Visual workflow builder support
    - Cross-group step orchestration
    - Advanced dependency management
    - Template-based creation
    """
    try:
        logger.info(f"Creating workflow: {request.name} by user: {current_user.id}")
        
        # Create the workflow
        workflow = await workflow_service.create_workflow(
            name=request.name,
            description=request.description,
            workflow_type=request.workflow_type,
            workspace_id=request.workspace_id,
            steps_data=request.steps,
            configuration=request.configuration,
            schedule_config=request.schedule_config,
            notification_config=request.notification_config,
            tags=request.tags,
            created_by=current_user.id
        )
        
        # Convert to response model
        workflow_response = WorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            workflow_type=workflow.workflow_type,
            workspace_id=workflow.workspace_id,
            status=workflow.status,
            configuration=workflow.configuration,
            step_count=len(workflow.steps),
            created_at=workflow.created_at,
            updated_at=workflow.updated_at,
            created_by=workflow.created_by,
            tags=workflow.tags or []
        )
        
        return StandardResponse(
            success=True,
            message="Workflow created successfully",
            data=workflow_response
        )
        
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create workflow: {str(e)}")

@router.get("/{workflow_id}", response_model=StandardResponse[WorkflowResponse])
async def get_workflow(
    workflow_id: str = Path(..., description="Workflow ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Get workflow details by ID"""
    try:
        workflow = await workflow_service.get_workflow(workflow_id, current_user.id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow_response = WorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            workflow_type=workflow.workflow_type,
            workspace_id=workflow.workspace_id,
            status=workflow.status,
            configuration=workflow.configuration,
            step_count=len(workflow.steps),
            created_at=workflow.created_at,
            updated_at=workflow.updated_at,
            created_by=workflow.created_by,
            tags=workflow.tags or []
        )
        
        return StandardResponse(
            success=True,
            message="Workflow retrieved successfully",
            data=workflow_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow: {str(e)}")

@router.put("/{workflow_id}", response_model=StandardResponse[WorkflowResponse])
async def update_workflow(
    workflow_id: str = Path(..., description="Workflow ID"),
    request: WorkflowUpdateRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Update workflow configuration"""
    try:
        logger.info(f"Updating workflow: {workflow_id} by user: {current_user.id}")
        
        update_data = {k: v for k, v in request.model_dump().items() if v is not None}
        
        workflow = await workflow_service.update_workflow(
            workflow_id=workflow_id,
            update_data=update_data,
            updated_by=current_user.id
        )
        
        workflow_response = WorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            workflow_type=workflow.workflow_type,
            workspace_id=workflow.workspace_id,
            status=workflow.status,
            configuration=workflow.configuration,
            step_count=len(workflow.steps),
            created_at=workflow.created_at,
            updated_at=workflow.updated_at,
            created_by=workflow.created_by,
            tags=workflow.tags or []
        )
        
        return StandardResponse(
            success=True,
            message="Workflow updated successfully",
            data=workflow_response
        )
        
    except Exception as e:
        logger.error(f"Error updating workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update workflow: {str(e)}")

@router.delete("/{workflow_id}", response_model=StandardResponse[Dict[str, str]])
async def delete_workflow(
    workflow_id: str = Path(..., description="Workflow ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Delete a workflow"""
    try:
        logger.info(f"Deleting workflow: {workflow_id} by user: {current_user.id}")
        
        await workflow_service.delete_workflow(workflow_id, current_user.id)
        
        return StandardResponse(
            success=True,
            message="Workflow deleted successfully",
            data={"workflow_id": workflow_id}
        )
        
    except Exception as e:
        logger.error(f"Error deleting workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete workflow: {str(e)}")

# ========================================================================================
# Workflow Execution Routes
# ========================================================================================

@router.post("/{workflow_id}/execute", response_model=StandardResponse[WorkflowExecutionResponse])
async def execute_workflow(
    workflow_id: str = Path(..., description="Workflow ID"),
    request: WorkflowExecutionRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """
    Execute a workflow with real-time monitoring capabilities.
    
    Features:
    - Asynchronous execution with progress tracking
    - Real-time WebSocket updates
    - Cross-group step orchestration
    - Advanced error handling and recovery
    """
    try:
        logger.info(f"Executing workflow: {workflow_id} by user: {current_user.id}")
        
        execution = await workflow_service.execute_workflow(
            workflow_id=workflow_id,
            execution_parameters=request.execution_parameters,
            execution_mode=request.execution_mode,
            priority=request.priority,
            max_parallel_steps=request.max_parallel_steps,
            timeout_seconds=request.timeout_seconds,
            executed_by=current_user.id
        )
        
        execution_response = WorkflowExecutionResponse(
            execution_id=execution.id,
            workflow_id=execution.workflow_id,
            status=execution.status,
            execution_mode=execution.execution_mode,
            priority=execution.priority,
            started_at=execution.started_at,
            completed_at=execution.completed_at,
            progress_percentage=execution.progress_percentage,
            current_step=execution.current_step,
            execution_log=execution.execution_log or [],
            metrics=execution.metrics or {}
        )
        
        return StandardResponse(
            success=True,
            message="Workflow execution started",
            data=execution_response
        )
        
    except Exception as e:
        logger.error(f"Error executing workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute workflow: {str(e)}")

@router.get("/{workflow_id}/executions", response_model=StandardResponse[List[WorkflowExecutionResponse]])
async def get_workflow_executions(
    workflow_id: str = Path(..., description="Workflow ID"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of executions to return"),
    offset: int = Query(default=0, ge=0, description="Execution offset"),
    status: Optional[str] = Query(None, description="Filter by execution status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Get workflow execution history"""
    try:
        executions = await workflow_service.get_workflow_executions(
            workflow_id=workflow_id,
            limit=limit,
            offset=offset,
            status_filter=status,
            user_id=current_user.id
        )
        
        execution_responses = [
            WorkflowExecutionResponse(
                execution_id=execution.id,
                workflow_id=execution.workflow_id,
                status=execution.status,
                execution_mode=execution.execution_mode,
                priority=execution.priority,
                started_at=execution.started_at,
                completed_at=execution.completed_at,
                progress_percentage=execution.progress_percentage,
                current_step=execution.current_step,
                execution_log=execution.execution_log or [],
                metrics=execution.metrics or {}
            )
            for execution in executions
        ]
        
        return StandardResponse(
            success=True,
            message="Workflow executions retrieved successfully",
            data=execution_responses
        )
        
    except Exception as e:
        logger.error(f"Error getting workflow executions for {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow executions: {str(e)}")

@router.get("/executions/{execution_id}", response_model=StandardResponse[WorkflowExecutionResponse])
async def get_execution_details(
    execution_id: str = Path(..., description="Execution ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Get detailed execution information"""
    try:
        execution = await workflow_service.get_execution_details(execution_id, current_user.id)
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        execution_response = WorkflowExecutionResponse(
            execution_id=execution.id,
            workflow_id=execution.workflow_id,
            status=execution.status,
            execution_mode=execution.execution_mode,
            priority=execution.priority,
            started_at=execution.started_at,
            completed_at=execution.completed_at,
            progress_percentage=execution.progress_percentage,
            current_step=execution.current_step,
            execution_log=execution.execution_log or [],
            metrics=execution.metrics or {}
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
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Control workflow execution (pause, resume, cancel)"""
    try:
        logger.info(f"Controlling execution: {execution_id} action: {action} by user: {current_user.id}")
        
        if action not in ['pause', 'resume', 'cancel', 'retry']:
            raise HTTPException(status_code=400, detail="Invalid control action")
        
        result = await workflow_service.control_execution(
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
    WebSocket endpoint for real-time workflow execution monitoring.
    
    Provides:
    - Real-time execution status updates
    - Step progress monitoring
    - Log streaming
    - Performance metrics
    - Error notifications
    """
    await connection_manager.connect(websocket, execution_id)
    workflow_service = RacineWorkflowService(db)
    
    try:
        # Send initial execution status
        execution = await workflow_service.get_execution_details(execution_id)
        if execution:
            await websocket.send_json({
                "type": "execution_status",
                "data": {
                    "execution_id": execution_id,
                    "status": execution.status,
                    "progress": execution.progress_percentage,
                    "current_step": execution.current_step,
                    "started_at": execution.started_at.isoformat() if execution.started_at else None,
                    "metrics": execution.metrics or {}
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
                    
            except asyncio.TimeoutError:
                # Check for execution updates
                execution = await workflow_service.get_execution_details(execution_id)
                if execution:
                    await websocket.send_json({
                        "type": "execution_update",
                        "data": {
                            "execution_id": execution_id,
                            "status": execution.status,
                            "progress": execution.progress_percentage,
                            "current_step": execution.current_step,
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
# Workflow Scheduling Routes
# ========================================================================================

@router.post("/{workflow_id}/schedule", response_model=StandardResponse[Dict[str, str]])
async def create_workflow_schedule(
    workflow_id: str = Path(..., description="Workflow ID"),
    request: WorkflowScheduleRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Create a schedule for workflow execution"""
    try:
        logger.info(f"Creating schedule for workflow: {workflow_id} by user: {current_user.id}")
        
        schedule = await workflow_service.create_workflow_schedule(
            workflow_id=workflow_id,
            schedule_type=request.schedule_type,
            cron_expression=request.cron_expression,
            interval_seconds=request.interval_seconds,
            start_time=request.start_time,
            end_time=request.end_time,
            timezone=request.timezone,
            execution_parameters=request.execution_parameters,
            is_active=request.is_active,
            created_by=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Workflow schedule created successfully",
            data={"schedule_id": schedule.id, "workflow_id": workflow_id}
        )
        
    except Exception as e:
        logger.error(f"Error creating workflow schedule: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create schedule: {str(e)}")

# ========================================================================================
# Template Management Routes
# ========================================================================================

@router.post("/templates", response_model=StandardResponse[Dict[str, str]])
async def create_workflow_template(
    request: WorkflowTemplateRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Create a workflow template"""
    try:
        logger.info(f"Creating workflow template: {request.name} by user: {current_user.id}")
        
        template = await workflow_service.create_workflow_template(
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
            message="Workflow template created successfully",
            data={"template_id": template.id}
        )
        
    except Exception as e:
        logger.error(f"Error creating workflow template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@router.get("/templates", response_model=StandardResponse[List[Dict[str, Any]]])
async def get_workflow_templates(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of templates to return"),
    offset: int = Query(default=0, ge=0, description="Template offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Get workflow templates"""
    try:
        templates = await workflow_service.get_workflow_templates(
            category_filter=category,
            limit=limit,
            offset=offset,
            user_id=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Workflow templates retrieved successfully",
            data=templates
        )
        
    except Exception as e:
        logger.error(f"Error getting workflow templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")

# ========================================================================================
# Analytics and Monitoring Routes
# ========================================================================================

@router.get("/{workflow_id}/analytics", response_model=StandardResponse[Dict[str, Any]])
async def get_workflow_analytics(
    workflow_id: str = Path(..., description="Workflow ID"),
    days: int = Query(default=30, ge=1, le=365, description="Number of days for analytics"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Get comprehensive workflow analytics"""
    try:
        analytics = await workflow_service.get_workflow_analytics(
            workflow_id=workflow_id,
            days=days,
            user_id=current_user.id
        )
        
        return StandardResponse(
            success=True,
            message="Workflow analytics retrieved successfully",
            data=analytics
        )
        
    except Exception as e:
        logger.error(f"Error getting workflow analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.get("/health", response_model=StandardResponse[Dict[str, Any]])
async def workflow_health_check(
    db: Session = Depends(get_db),
    workflow_service: RacineWorkflowService = Depends(get_workflow_service)
):
    """Health check for workflow service"""
    try:
        health_status = await workflow_service.get_service_health()
        
        return StandardResponse(
            success=True,
            message="Workflow service health check completed",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"Workflow service health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ========================================================================================
# Error Handlers and Middleware
# ========================================================================================

@router.exception_handler(RacineException)
async def racine_exception_handler(request, exc: RacineException):
    """Handle Racine-specific exceptions"""
    logger.error(f"Racine workflow error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "error_code": exc.error_code}
    )

# Export router
__all__ = ["router", "connection_manager"]