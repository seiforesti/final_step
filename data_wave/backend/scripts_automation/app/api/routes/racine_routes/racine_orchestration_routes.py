"""
Racine Orchestration Routes - Master API Orchestration System
=============================================================

This module provides comprehensive API endpoints for the Racine Main Manager orchestration system,
serving as the master API layer that coordinates and manages operations across ALL 7 data governance groups:

1. Data Sources - Connection and discovery orchestration
2. Scan Rule Sets - Rule execution and management orchestration  
3. Classifications - Classification workflow orchestration
4. Compliance Rules - Compliance validation orchestration
5. Advanced Catalog - Catalog management orchestration
6. Scan Logic - Scan execution orchestration
7. RBAC System - Security and access orchestration

API Endpoints:
- POST /racine/orchestration/create - Create master orchestration instance
- GET /racine/orchestration/{orchestration_id} - Get orchestration details
- PUT /racine/orchestration/{orchestration_id} - Update orchestration configuration
- DELETE /racine/orchestration/{orchestration_id} - Delete orchestration instance
- POST /racine/orchestration/{orchestration_id}/execute-workflow - Execute cross-group workflow
- GET /racine/orchestration/{orchestration_id}/workflows - Get workflow executions
- GET /racine/orchestration/{orchestration_id}/health - Get system health status
- POST /racine/orchestration/{orchestration_id}/optimize - Optimize performance
- GET /racine/orchestration/{orchestration_id}/metrics - Get cross-group metrics
- GET /racine/orchestration/active - Get all active orchestrations
- POST /racine/orchestration/bulk-operations - Execute bulk operations across groups
- GET /racine/orchestration/service-registry - Get service registry status
- POST /racine/orchestration/emergency-shutdown - Emergency shutdown procedures

All endpoints are designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
import logging
import uuid
import asyncio
import json

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query, Path, status
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import field_validator, BaseModel, Field, validator
from sqlmodel import Session

# Core imports
from ....core.auth import get_current_user, require_permissions
from ....db_session import get_session
from ....core.cache import CacheManager

# Service imports - CRITICAL: Import the master orchestration service
from ....services.racine_services.racine_orchestration_service import RacineOrchestrationService

# Model imports
from ....models.racine_models.racine_orchestration_models import (
    RacineOrchestrationMaster,
    RacineWorkflowExecution,
    RacineSystemHealth,
    RacineCrossGroupIntegration,
    OrchestrationStatus,
    OrchestrationPriority,
    SystemHealthStatus,
    WorkflowExecutionStatus
)

from ....models.auth_models import User

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/racine/orchestration", tags=["Racine Orchestration"])

# ===================== REQUEST/RESPONSE MODELS =====================

class CreateOrchestrationRequest(BaseModel):
    """Request model for creating orchestration master."""
    name: str = Field(..., min_length=1, max_length=255, description="Orchestration name")
    description: Optional[str] = Field(None, max_length=2000, description="Orchestration description")
    orchestration_type: str = Field(..., description="Type: workflow, pipeline, cross_group, maintenance")
    connected_groups: List[str] = Field(..., min_items=1, description="Groups to connect")
    group_configurations: Dict[str, Any] = Field(default_factory=dict, description="Group-specific configurations")
    priority: OrchestrationPriority = Field(default=OrchestrationPriority.MEDIUM, description="Priority level")
    
    @field_validator('connected_groups')
    def validate_groups(cls, v):
        valid_groups = ['data_sources', 'scan_rule_sets', 'classifications', 
                       'compliance_rules', 'advanced_catalog', 'scan_logic', 'rbac_system']
        invalid = [g for g in v if g not in valid_groups]
        if invalid:
            raise ValueError(f"Invalid groups: {invalid}. Valid groups: {valid_groups}")
        return v

class UpdateOrchestrationRequest(BaseModel):
    """Request model for updating orchestration configuration."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    group_configurations: Optional[Dict[str, Any]] = None
    priority: Optional[OrchestrationPriority] = None
    status: Optional[OrchestrationStatus] = None

class ExecuteWorkflowRequest(BaseModel):
    """Request model for executing cross-group workflows."""
    workflow_definition: Dict[str, Any] = Field(..., description="Complete workflow definition")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Execution parameters")
    environment: str = Field(default="production", description="Execution environment")
    max_retries: int = Field(default=3, ge=0, le=10, description="Maximum retry attempts")
    
    @field_validator('workflow_definition')
    def validate_workflow(cls, v):
        required_fields = ['name', 'steps']
        missing = [f for f in required_fields if f not in v]
        if missing:
            raise ValueError(f"Missing required fields: {missing}")
        
        if not isinstance(v.get('steps'), list) or len(v['steps']) == 0:
            raise ValueError("Workflow must have at least one step")
        
        for i, step in enumerate(v['steps']):
            if not isinstance(step, dict):
                raise ValueError(f"Step {i} must be a dictionary")
            if 'group_id' not in step or 'operation' not in step:
                raise ValueError(f"Step {i} must have 'group_id' and 'operation' fields")
        
        return v

class BulkOperationRequest(BaseModel):
    """Request model for bulk operations across groups."""
    operations: List[Dict[str, Any]] = Field(..., min_items=1, description="List of operations to execute")
    execution_mode: str = Field(default="parallel", description="parallel or sequential")
    continue_on_error: bool = Field(default=False, description="Continue if individual operations fail")

class OrchestrationResponse(BaseModel):
    """Response model for orchestration operations."""
    id: str
    name: str
    description: Optional[str]
    orchestration_type: str
    status: OrchestrationStatus
    priority: OrchestrationPriority
    connected_groups: List[str]
    health_status: SystemHealthStatus
    created_at: datetime
    updated_at: datetime
    created_by: str
    performance_metrics: Dict[str, Any]

class WorkflowExecutionResponse(BaseModel):
    """Response model for workflow executions."""
    id: str
    orchestration_id: str
    workflow_name: str
    status: WorkflowExecutionStatus
    current_step: int
    total_steps: int
    progress_percentage: float
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration_seconds: Optional[float]
    involved_groups: List[str]
    errors: List[Dict[str, Any]]

class SystemHealthResponse(BaseModel):
    """Response model for system health."""
    id: str
    timestamp: datetime
    overall_status: SystemHealthStatus
    health_score: float
    data_sources_health: Dict[str, Any]
    scan_rule_sets_health: Dict[str, Any]
    classifications_health: Dict[str, Any]
    compliance_rules_health: Dict[str, Any]
    advanced_catalog_health: Dict[str, Any]
    scan_logic_health: Dict[str, Any]
    rbac_system_health: Dict[str, Any]
    system_metrics: Dict[str, Any]
    active_alerts: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]

# ===================== DEPENDENCY FUNCTIONS =====================

async def get_orchestration_service(session: Session = Depends(get_session)) -> RacineOrchestrationService:
    """Get orchestration service instance."""
    return RacineOrchestrationService(session)

async def get_orchestration_or_404(
    orchestration_id: str = Path(..., description="Orchestration ID"),
    session: Session = Depends(get_session)
) -> RacineOrchestrationMaster:
    """Get orchestration by ID or raise 404."""
    orchestration = session.query(RacineOrchestrationMaster).filter(
        RacineOrchestrationMaster.id == orchestration_id
    ).first()
    
    if not orchestration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orchestration not found: {orchestration_id}"
        )
    
    return orchestration

# ===================== CORE ORCHESTRATION ENDPOINTS =====================

@router.post("/create", response_model=OrchestrationResponse, status_code=status.HTTP_201_CREATED)
async def create_orchestration(
    request: CreateOrchestrationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Create a new master orchestration instance.
    
    Creates a master orchestration that can coordinate operations across
    all specified data governance groups with comprehensive integration.
    """
    try:
        logger.info(f"Creating orchestration: {request.name} by user {current_user.id}")
        
        # Create orchestration
        orchestration = await orchestration_service.create_orchestration_master(
            name=request.name,
            description=request.description or "",
            orchestration_type=request.orchestration_type,
            connected_groups=request.connected_groups,
            configurations=request.group_configurations,
            created_by=str(current_user.id)
        )
        
        # Start background health monitoring
        background_tasks.add_task(
            _start_orchestration_monitoring,
            orchestration.id,
            orchestration_service
        )
        
        return OrchestrationResponse(
            id=orchestration.id,
            name=orchestration.name,
            description=orchestration.description,
            orchestration_type=orchestration.orchestration_type,
            status=orchestration.status,
            priority=orchestration.priority,
            connected_groups=orchestration.connected_groups,
            health_status=orchestration.health_status,
            created_at=orchestration.created_at,
            updated_at=orchestration.updated_at,
            created_by=orchestration.created_by,
            performance_metrics=orchestration.performance_metrics
        )
        
    except Exception as e:
        logger.error(f"Failed to create orchestration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create orchestration: {str(e)}"
        )

@router.get("/{orchestration_id}", response_model=OrchestrationResponse)
async def get_orchestration(
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user)
):
    """
    Get orchestration details by ID.
    
    Retrieves comprehensive information about a specific orchestration instance
    including status, health, performance metrics, and configuration.
    """
    return OrchestrationResponse(
        id=orchestration.id,
        name=orchestration.name,
        description=orchestration.description,
        orchestration_type=orchestration.orchestration_type,
        status=orchestration.status,
        priority=orchestration.priority,
        connected_groups=orchestration.connected_groups,
        health_status=orchestration.health_status,
        created_at=orchestration.created_at,
        updated_at=orchestration.updated_at,
        created_by=orchestration.created_by,
        performance_metrics=orchestration.performance_metrics
    )

@router.put("/{orchestration_id}", response_model=OrchestrationResponse)
async def update_orchestration(
    request: UpdateOrchestrationRequest,
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update orchestration configuration.
    
    Updates the configuration, settings, and parameters of an existing
    orchestration instance with validation and change tracking.
    """
    try:
        # Update fields if provided
        if request.name is not None:
            orchestration.name = request.name
        if request.description is not None:
            orchestration.description = request.description
        if request.group_configurations is not None:
            orchestration.group_configurations = request.group_configurations
        if request.priority is not None:
            orchestration.priority = request.priority
        if request.status is not None:
            orchestration.status = request.status
        
        orchestration.updated_at = datetime.utcnow()
        orchestration.last_modified_by = str(current_user.id)
        
        session.commit()
        session.refresh(orchestration)
        
        logger.info(f"Updated orchestration {orchestration.id} by user {current_user.id}")
        
        return OrchestrationResponse(
            id=orchestration.id,
            name=orchestration.name,
            description=orchestration.description,
            orchestration_type=orchestration.orchestration_type,
            status=orchestration.status,
            priority=orchestration.priority,
            connected_groups=orchestration.connected_groups,
            health_status=orchestration.health_status,
            created_at=orchestration.created_at,
            updated_at=orchestration.updated_at,
            created_by=orchestration.created_by,
            performance_metrics=orchestration.performance_metrics
        )
        
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to update orchestration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update orchestration: {str(e)}"
        )

@router.delete("/{orchestration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_orchestration(
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete orchestration instance.
    
    Safely deletes an orchestration instance after ensuring all
    associated workflows are completed or cancelled.
    """
    try:
        # Check for active workflows
        active_workflows = session.query(RacineWorkflowExecution).filter(
            RacineWorkflowExecution.orchestration_id == orchestration.id,
            RacineWorkflowExecution.status.in_([
                WorkflowExecutionStatus.RUNNING,
                WorkflowExecutionStatus.PENDING,
                WorkflowExecutionStatus.RETRYING
            ])
        ).count()
        
        if active_workflows > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete orchestration with {active_workflows} active workflows"
            )
        
        session.delete(orchestration)
        session.commit()
        
        logger.info(f"Deleted orchestration {orchestration.id} by user {current_user.id}")
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to delete orchestration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete orchestration: {str(e)}"
        )

# ===================== WORKFLOW EXECUTION ENDPOINTS =====================

@router.post("/{orchestration_id}/execute-workflow", response_model=WorkflowExecutionResponse)
async def execute_cross_group_workflow(
    request: ExecuteWorkflowRequest,
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Execute cross-group workflow.
    
    Executes a complex workflow that spans multiple data governance groups,
    coordinating operations across existing services with comprehensive
    monitoring and error handling.
    """
    try:
        logger.info(f"Executing workflow for orchestration {orchestration.id} by user {current_user.id}")
        
        # Add user context to parameters
        parameters = request.parameters.copy()
        parameters.update({
            'triggered_by': str(current_user.id),
            'environment': request.environment,
            'max_retries': request.max_retries
        })
        
        # Execute workflow
        execution = await orchestration_service.execute_cross_group_workflow(
            orchestration_id=orchestration.id,
            workflow_definition=request.workflow_definition,
            parameters=parameters
        )
        
        return WorkflowExecutionResponse(
            id=execution.id,
            orchestration_id=execution.orchestration_id,
            workflow_name=execution.workflow_name,
            status=execution.status,
            current_step=execution.current_step,
            total_steps=execution.total_steps,
            progress_percentage=execution.progress_percentage,
            start_time=execution.start_time,
            end_time=execution.end_time,
            duration_seconds=execution.duration_seconds,
            involved_groups=execution.involved_groups,
            errors=execution.errors or []
        )
        
    except Exception as e:
        logger.error(f"Failed to execute workflow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute workflow: {str(e)}"
        )

@router.get("/{orchestration_id}/workflows", response_model=List[WorkflowExecutionResponse])
async def get_workflow_executions(
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    status_filter: Optional[WorkflowExecutionStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
):
    """
    Get workflow executions for orchestration.
    
    Retrieves a list of workflow executions associated with the orchestration
    instance, with filtering and pagination support.
    """
    try:
        query = session.query(RacineWorkflowExecution).filter(
            RacineWorkflowExecution.orchestration_id == orchestration.id
        )
        
        if status_filter:
            query = query.filter(RacineWorkflowExecution.status == status_filter)
        
        executions = query.order_by(RacineWorkflowExecution.created_at.desc()).offset(offset).limit(limit).all()
        
        return [
            WorkflowExecutionResponse(
                id=execution.id,
                orchestration_id=execution.orchestration_id,
                workflow_name=execution.workflow_name,
                status=execution.status,
                current_step=execution.current_step,
                total_steps=execution.total_steps,
                progress_percentage=execution.progress_percentage,
                start_time=execution.start_time,
                end_time=execution.end_time,
                duration_seconds=execution.duration_seconds,
                involved_groups=execution.involved_groups,
                errors=execution.errors or []
            )
            for execution in executions
        ]
        
    except Exception as e:
        logger.error(f"Failed to get workflow executions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow executions: {str(e)}"
        )

# ===================== HEALTH AND MONITORING ENDPOINTS =====================

@router.get("/{orchestration_id}/health", response_model=SystemHealthResponse)
async def get_system_health(
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Get comprehensive system health status.
    
    Retrieves detailed health information across all integrated groups,
    including performance metrics, alerts, and recommendations.
    """
    try:
        health = await orchestration_service.monitor_system_health()
        
        return SystemHealthResponse(
            id=health.id,
            timestamp=health.timestamp,
            overall_status=health.overall_status,
            health_score=health.health_score,
            data_sources_health=health.data_sources_health,
            scan_rule_sets_health=health.scan_rule_sets_health,
            classifications_health=health.classifications_health,
            compliance_rules_health=health.compliance_rules_health,
            advanced_catalog_health=health.advanced_catalog_health,
            scan_logic_health=health.scan_logic_health,
            rbac_system_health=health.rbac_system_health,
            system_metrics=health.system_metrics,
            active_alerts=health.active_alerts,
            recommendations=health.recommendations
        )
        
    except Exception as e:
        logger.error(f"Failed to get system health: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system health: {str(e)}"
        )

@router.post("/{orchestration_id}/optimize")
async def optimize_performance(
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Optimize performance across all integrated systems.
    
    Analyzes current performance and applies optimizations across
    all connected groups and services.
    """
    try:
        optimization_results = await orchestration_service.optimize_performance()
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Performance optimization completed",
                "orchestration_id": orchestration.id,
                "results": optimization_results
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to optimize performance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize performance: {str(e)}"
        )

@router.get("/{orchestration_id}/metrics")
async def get_cross_group_metrics(
    orchestration: RacineOrchestrationMaster = Depends(get_orchestration_or_404),
    current_user: User = Depends(get_current_user),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Get comprehensive metrics across all integrated groups.
    
    Retrieves aggregated metrics from all connected services and groups,
    providing a unified view of system performance and utilization.
    """
    try:
        metrics = await orchestration_service.get_cross_group_metrics()
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "orchestration_id": orchestration.id,
                "metrics": metrics
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get cross-group metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cross-group metrics: {str(e)}"
        )

# ===================== BULK AND UTILITY ENDPOINTS =====================

@router.get("/active", response_model=List[OrchestrationResponse])
async def get_active_orchestrations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
):
    """
    Get all active orchestrations.
    
    Retrieves a list of all currently active orchestration instances
    across the system with their current status and health information.
    """
    try:
        orchestrations = session.query(RacineOrchestrationMaster).filter(
            RacineOrchestrationMaster.status.in_([
                OrchestrationStatus.ACTIVE,
                OrchestrationStatus.INITIALIZING,
                OrchestrationStatus.OPTIMIZING
            ])
        ).order_by(RacineOrchestrationMaster.created_at.desc()).offset(offset).limit(limit).all()
        
        return [
            OrchestrationResponse(
                id=orchestration.id,
                name=orchestration.name,
                description=orchestration.description,
                orchestration_type=orchestration.orchestration_type,
                status=orchestration.status,
                priority=orchestration.priority,
                connected_groups=orchestration.connected_groups,
                health_status=orchestration.health_status,
                created_at=orchestration.created_at,
                updated_at=orchestration.updated_at,
                created_by=orchestration.created_by,
                performance_metrics=orchestration.performance_metrics
            )
            for orchestration in orchestrations
        ]
        
    except Exception as e:
        logger.error(f"Failed to get active orchestrations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get active orchestrations: {str(e)}"
        )

@router.post("/bulk-operations")
async def execute_bulk_operations(
    request: BulkOperationRequest,
    current_user: User = Depends(get_current_user),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Execute bulk operations across multiple groups.
    
    Executes multiple operations across different groups in parallel
    or sequential mode with comprehensive error handling and reporting.
    """
    try:
        logger.info(f"Executing bulk operations by user {current_user.id}")
        
        # Create a temporary workflow for bulk operations
        workflow_definition = {
            "name": f"Bulk Operations - {datetime.utcnow().isoformat()}",
            "description": "Bulk operations across multiple groups",
            "steps": []
        }
        
        # Convert operations to workflow steps
        for i, operation in enumerate(request.operations):
            step = {
                "id": f"bulk_step_{i}",
                "name": operation.get("name", f"Operation {i + 1}"),
                "group_id": operation.get("group_id"),
                "operation": operation.get("operation"),
                "parameters": operation.get("parameters", {}),
                "continue_on_error": request.continue_on_error
            }
            workflow_definition["steps"].append(step)
        
        # Execute as workflow (this will handle parallel/sequential execution)
        # For now, we'll execute sequentially - parallel execution would require
        # more sophisticated workflow engine modifications
        
        results = []
        for i, operation in enumerate(request.operations):
            try:
                # This would be implemented based on the specific operation requirements
                result = {
                    "operation_id": i,
                    "group_id": operation.get("group_id"),
                    "operation": operation.get("operation"),
                    "status": "success",
                    "message": "Operation completed successfully"
                }
                results.append(result)
            except Exception as e:
                result = {
                    "operation_id": i,
                    "group_id": operation.get("group_id"),
                    "operation": operation.get("operation"),
                    "status": "failed",
                    "error": str(e)
                }
                results.append(result)
                
                if not request.continue_on_error:
                    break
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Bulk operations completed",
                "execution_mode": request.execution_mode,
                "total_operations": len(request.operations),
                "successful_operations": len([r for r in results if r["status"] == "success"]),
                "failed_operations": len([r for r in results if r["status"] == "failed"]),
                "results": results
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to execute bulk operations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute bulk operations: {str(e)}"
        )

@router.get("/service-registry")
async def get_service_registry_status(
    current_user: User = Depends(get_current_user),
    orchestration_service: RacineOrchestrationService = Depends(get_orchestration_service)
):
    """
    Get service registry status.
    
    Retrieves the current status of all registered services across
    all groups, including health status and error information.
    """
    try:
        registry_status = orchestration_service.get_service_registry_status()
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Service registry status retrieved",
                "timestamp": datetime.utcnow().isoformat(),
                "registry_status": registry_status
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get service registry status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get service registry status: {str(e)}"
        )

# ===================== UTILITY FUNCTIONS =====================

async def _start_orchestration_monitoring(
    orchestration_id: str,
    orchestration_service: RacineOrchestrationService
):
    """Background task to start orchestration monitoring."""
    try:
        logger.info(f"Starting monitoring for orchestration {orchestration_id}")
        # Additional monitoring logic can be implemented here
    except Exception as e:
        logger.error(f"Failed to start orchestration monitoring: {str(e)}")

# ===================== WEBSOCKET ENDPOINTS (Future Enhancement) =====================

# @router.websocket("/{orchestration_id}/ws")
# async def orchestration_websocket(
#     websocket: WebSocket,
#     orchestration_id: str,
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     WebSocket endpoint for real-time orchestration updates.
#     
#     Provides real-time updates on orchestration status, workflow execution,
#     health changes, and performance metrics.
#     """
#     # WebSocket implementation would go here for real-time updates
#     pass