"""
Enterprise Scan Workflow API Routes
Comprehensive API endpoints for workflow management including template creation,
workflow execution, monitoring, approval management, and workflow analytics.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.security.rbac import get_current_user
from ...db_session import get_session
from ...core.rate_limiter import rate_limiter
from ...core.audit_log import audit_log
from ...models.scan_workflow_models import *
from ...services.scan_workflow_engine import ScanWorkflowEngine
from ...utils.response_models import SuccessResponse, ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scan-workflows", tags=["scan-workflows"])

# Request Models
class WorkflowTemplateRequest(BaseModel):
    """Request model for workflow template creation"""
    name: str = Field(description="Template name")
    type: str = Field(description="Workflow type")
    description: Optional[str] = Field(default=None, description="Template description")
    version: str = Field(default="1.0", description="Template version")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Template configuration")
    stages: List[Dict[str, Any]] = Field(description="Stage definitions")
    default_parameters: Dict[str, Any] = Field(default_factory=dict, description="Default parameters")
    is_active: bool = Field(default=True, description="Template active status")

class WorkflowExecutionRequest(BaseModel):
    """Request model for workflow execution"""
    template_id: str = Field(description="Template identifier")
    name: Optional[str] = Field(default=None, description="Workflow instance name")
    description: Optional[str] = Field(default=None, description="Workflow description")
    priority: str = Field(default="normal", description="Workflow priority")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Workflow parameters")
    variables: Dict[str, Any] = Field(default_factory=dict, description="Initial variables")
    scheduled_at: Optional[datetime] = Field(default=None, description="Scheduled execution time")

class WorkflowApprovalRequest(BaseModel):
    """Request model for workflow approval"""
    workflow_id: str = Field(description="Workflow identifier")
    approval_type: str = Field(description="Type of approval")
    decision: str = Field(description="Approval decision (approve/reject)")
    comments: Optional[str] = Field(default=None, description="Approval comments")
    approval_data: Optional[Dict[str, Any]] = Field(default=None, description="Additional approval data")

class WorkflowControlRequest(BaseModel):
    """Request model for workflow control operations"""
    action: str = Field(description="Control action (pause, resume, cancel)")
    reason: Optional[str] = Field(default=None, description="Reason for action")

class WorkflowAnalyticsRequest(BaseModel):
    """Request model for workflow analytics"""
    time_range: str = Field(description="Time range for analytics")
    template_ids: Optional[List[str]] = Field(default=None, description="Filter by template IDs")
    status_filter: Optional[List[str]] = Field(default=None, description="Filter by workflow status")
    metrics: Optional[List[str]] = Field(default=None, description="Specific metrics to include")

# Response Models
class WorkflowStatusResponse(BaseModel):
    """Workflow status response model"""
    workflow_id: str
    status: str
    progress_percentage: float
    current_stage_id: Optional[str]
    stages: List[Dict[str, Any]]
    started_at: Optional[datetime]
    estimated_completion: Optional[datetime]

# Dependency injection
async def get_workflow_engine() -> ScanWorkflowEngine:
    """Get workflow engine instance"""
    return ScanWorkflowEngine()

@router.post("/templates")
@rate_limiter.limit("20/minute")
async def create_workflow_template(
    request: WorkflowTemplateRequest,
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new workflow template.
    
    Features:
    - Template structure validation
    - Stage and task configuration
    - Conditional logic setup
    - Performance optimization suggestions
    """
    try:
        await audit_log(
            action="workflow_template_created",
            user_id=current_user.get("user_id"),
            resource_type="workflow_template",
            resource_id=None,
            metadata={
                "template_name": request.name,
                "template_type": request.type,
                "stages_count": len(request.stages)
            }
        )
        
        # Prepare template data
        template_data = {
            "name": request.name,
            "type": request.type,
            "description": request.description,
            "version": request.version,
            "configuration": request.configuration,
            "stages": request.stages,
            "default_parameters": request.default_parameters,
            "is_active": request.is_active,
            "created_by": current_user.get("user_id")
        }
        
        # Create template
        template_result = await workflow_engine.create_workflow_template(template_data)
        
        if template_result["status"] == "validation_failed":
            raise HTTPException(
                status_code=400, 
                detail=f"Template validation failed: {template_result.get('errors')}"
            )
        
        if template_result["status"] == "failed":
            raise HTTPException(
                status_code=500, 
                detail=f"Template creation failed: {template_result.get('error')}"
            )
        
        return SuccessResponse(
            message="Workflow template created successfully",
            data={
                "template_id": template_result["template_id"],
                "template_name": request.name,
                "template_type": request.type,
                "validation_result": template_result.get("validation_result"),
                "optimization_suggestions": template_result.get("optimization_suggestions", [])
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workflow template creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Template creation failed: {str(e)}")

@router.get("/templates")
@rate_limiter.limit("100/minute")
async def list_workflow_templates(
    template_type: Optional[str] = Query(default=None, description="Filter by template type"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    limit: int = Query(default=50, ge=1, le=100, description="Maximum number of templates"),
    offset: int = Query(default=0, ge=0, description="Number of templates to skip"),
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user)
):
    """
    List available workflow templates with filtering options.
    """
    try:
        # Get templates from workflow engine
        templates = []
        for template_id, template in workflow_engine.workflow_templates.items():
            # Apply filters
            if template_type and template.workflow_type.value != template_type:
                continue
            if is_active is not None and template.is_active != is_active:
                continue
            
            template_data = {
                "template_id": template_id,
                "template_name": template.template_name,
                "workflow_type": template.workflow_type.value,
                "description": template.description,
                "version": template.version,
                "is_active": template.is_active,
                "created_at": template.created_at.isoformat() if template.created_at else None,
                "created_by": template.created_by,
                "usage_count": workflow_engine.template_usage_stats.get(template_id, 0),
                "stage_count": len(template.stage_definitions)
            }
            templates.append(template_data)
        
        # Apply pagination
        total_templates = len(templates)
        paginated_templates = templates[offset:offset + limit]
        
        return SuccessResponse(
            message="Workflow templates retrieved successfully",
            data={
                "templates": paginated_templates,
                "total_count": total_templates,
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total_templates
            }
        )
        
    except Exception as e:
        logger.error(f"Template listing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Template listing failed: {str(e)}")

@router.post("/execute")
@rate_limiter.limit("50/minute")
async def execute_workflow(
    request: WorkflowExecutionRequest,
    background_tasks: BackgroundTasks,
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Execute a workflow based on a template.
    
    Features:
    - Template-based workflow instantiation
    - Parameter validation and merging
    - Intelligent scheduling and queuing
    - Real-time progress tracking
    """
    try:
        await audit_log(
            action="workflow_executed",
            user_id=current_user.get("user_id"),
            resource_type="workflow",
            resource_id=None,
            metadata={
                "template_id": request.template_id,
                "workflow_name": request.name,
                "priority": request.priority
            }
        )
        
        # Prepare workflow execution data
        execution_context = {
            "user_id": current_user.get("user_id"),
            "execution_time": datetime.utcnow().isoformat(),
            "client_info": {
                "user_agent": "api_client",
                "ip_address": "unknown"
            }
        }
        
        workflow_data = {
            "name": request.name,
            "description": request.description,
            "priority": request.priority,
            "parameters": request.parameters,
            "variables": request.variables,
            "created_by": current_user.get("user_id")
        }
        
        # Execute workflow
        execution_result = await workflow_engine.execute_workflow(
            template_id=request.template_id,
            workflow_data=workflow_data,
            execution_context=execution_context
        )
        
        if execution_result["status"] == "failed":
            raise HTTPException(
                status_code=400, 
                detail=f"Workflow execution failed: {execution_result.get('error')}"
            )
        
        return SuccessResponse(
            message="Workflow execution initiated successfully",
            data={
                "workflow_id": execution_result["workflow_id"],
                "template_id": request.template_id,
                "status": execution_result["status"],
                "estimated_duration": execution_result.get("estimated_duration"),
                "queue_position": execution_result.get("queue_position"),
                "workflow_details": {
                    "name": workflow_data.get("name"),
                    "priority": workflow_data.get("priority"),
                    "created_by": workflow_data.get("created_by")
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@router.get("/status/{workflow_id}")
@rate_limiter.limit("200/minute")
async def get_workflow_status(
    workflow_id: str,
    include_stages: bool = Query(default=True, description="Include stage details"),
    include_tasks: bool = Query(default=False, description="Include task details"),
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed workflow execution status.
    
    Features:
    - Real-time status updates
    - Stage and task progress
    - Performance metrics
    - Error details and recovery options
    """
    try:
        # Get workflow from active or completed workflows
        workflow = workflow_engine.active_workflows.get(workflow_id)
        
        if not workflow:
            # Check completed workflows
            for completed_workflow in workflow_engine.completed_workflows:
                if completed_workflow.workflow_id == workflow_id:
                    workflow = completed_workflow
                    break
        
        if not workflow:
            # Check failed workflows
            for failed_workflow in workflow_engine.failed_workflows:
                if failed_workflow.workflow_id == workflow_id:
                    workflow = failed_workflow
                    break
        
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow not found: {workflow_id}")
        
        # Build status response
        status_data = {
            "workflow_id": workflow.workflow_id,
            "workflow_name": workflow.workflow_name,
            "template_id": workflow.template_id,
            "status": workflow.status.value,
            "priority": workflow.priority.value,
            "progress_percentage": workflow.progress_percentage,
            "current_stage_id": workflow.current_stage_id,
            "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
            "started_at": workflow.started_at.isoformat() if workflow.started_at else None,
            "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None,
            "error_message": workflow.error_message,
            "parameters": workflow.parameters,
            "variables": workflow.variables,
            "context": workflow.context
        }
        
        # Include stage details if requested
        if include_stages and workflow.stages:
            stages_data = []
            for stage in workflow.stages:
                stage_data = {
                    "stage_id": stage.stage_id,
                    "stage_name": stage.stage_name,
                    "stage_type": stage.stage_type.value,
                    "stage_order": stage.stage_order,
                    "status": stage.status.value,
                    "started_at": stage.started_at.isoformat() if stage.started_at else None,
                    "completed_at": stage.completed_at.isoformat() if stage.completed_at else None,
                    "execution_time_seconds": stage.execution_time_seconds,
                    "error_message": stage.error_message,
                    "is_optional": stage.is_optional,
                    "dependencies": stage.dependencies
                }
                
                # Include task details if requested
                if include_tasks and stage.tasks:
                    tasks_data = []
                    for task in stage.tasks:
                        task_data = {
                            "task_id": task.task_id,
                            "task_name": task.task_name,
                            "task_type": task.task_type.value,
                            "status": task.status.value,
                            "started_at": task.started_at.isoformat() if task.started_at else None,
                            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                            "execution_time_seconds": task.execution_time_seconds,
                            "error_message": task.error_message,
                            "is_critical": task.is_critical,
                            "retry_strategy": task.retry_strategy.value,
                            "output": task.output
                        }
                        tasks_data.append(task_data)
                    stage_data["tasks"] = tasks_data
                
                stages_data.append(stage_data)
            
            status_data["stages"] = stages_data
        
        return SuccessResponse(
            message="Workflow status retrieved successfully",
            data=status_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workflow status retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")

@router.get("/stream/progress/{workflow_id}")
async def stream_workflow_progress(
    workflow_id: str,
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time workflow progress updates.
    """
    try:
        async def generate_progress():
            """Generate workflow progress updates"""
            while True:
                # Get current workflow status
                workflow = workflow_engine.active_workflows.get(workflow_id)
                
                if not workflow:
                    # Check if workflow completed
                    for completed_workflow in workflow_engine.completed_workflows:
                        if completed_workflow.workflow_id == workflow_id:
                            workflow = completed_workflow
                            break
                    
                    if not workflow:
                        # Check if workflow failed
                        for failed_workflow in workflow_engine.failed_workflows:
                            if failed_workflow.workflow_id == workflow_id:
                                workflow = failed_workflow
                                break
                
                if workflow:
                    progress_data = {
                        "workflow_id": workflow_id,
                        "status": workflow.status.value,
                        "progress_percentage": workflow.progress_percentage,
                        "current_stage_id": workflow.current_stage_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    # Add current stage info if available
                    if workflow.current_stage_id and workflow.stages:
                        current_stage = next(
                            (s for s in workflow.stages if s.stage_id == workflow.current_stage_id),
                            None
                        )
                        if current_stage:
                            progress_data["current_stage"] = {
                                "stage_name": current_stage.stage_name,
                                "stage_type": current_stage.stage_type.value,
                                "status": current_stage.status.value
                            }
                    
                    yield f"data: {json.dumps(progress_data)}\n\n"
                    
                    # Stop streaming if workflow is completed or failed
                    if workflow.status in [WorkflowStatus.COMPLETED, WorkflowStatus.FAILED, WorkflowStatus.CANCELLED]:
                        break
                else:
                    # Workflow not found
                    error_data = {
                        "workflow_id": workflow_id,
                        "error": "Workflow not found",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    yield f"data: {json.dumps(error_data)}\n\n"
                    break
                
                await asyncio.sleep(2)  # Update every 2 seconds
        
        return StreamingResponse(
            generate_progress(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except Exception as e:
        logger.error(f"Workflow progress streaming failed: {e}")
        raise HTTPException(status_code=500, detail=f"Progress streaming failed: {str(e)}")

@router.post("/control/{workflow_id}")
@rate_limiter.limit("50/minute")
async def control_workflow(
    workflow_id: str,
    request: WorkflowControlRequest,
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Control workflow execution (pause, resume, cancel).
    
    Features:
    - Graceful workflow pausing and resuming
    - Safe workflow cancellation
    - Audit trail for control actions
    """
    try:
        await audit_log(
            action=f"workflow_{request.action}",
            user_id=current_user.get("user_id"),
            resource_type="workflow",
            resource_id=workflow_id,
            metadata={
                "action": request.action,
                "reason": request.reason
            }
        )
        
        # Get workflow
        workflow = workflow_engine.active_workflows.get(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Active workflow not found: {workflow_id}")
        
        # Apply control action
        control_result = await _apply_workflow_control_action(
            workflow, request.action, request.reason, current_user
        )
        
        return SuccessResponse(
            message=f"Workflow {request.action} applied successfully",
            data={
                "workflow_id": workflow_id,
                "action": request.action,
                "previous_status": control_result["previous_status"],
                "new_status": control_result["new_status"],
                "applied_by": current_user.get("user_id"),
                "applied_at": datetime.utcnow().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workflow control failed: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow control failed: {str(e)}")

@router.get("/list")
@rate_limiter.limit("100/minute")
async def list_workflows(
    status: Optional[str] = Query(default=None, description="Filter by workflow status"),
    template_id: Optional[str] = Query(default=None, description="Filter by template ID"),
    priority: Optional[str] = Query(default=None, description="Filter by priority"),
    created_by: Optional[str] = Query(default=None, description="Filter by creator"),
    limit: int = Query(default=50, ge=1, le=100, description="Maximum number of workflows"),
    offset: int = Query(default=0, ge=0, description="Number of workflows to skip"),
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user)
):
    """
    List workflows with filtering and pagination options.
    """
    try:
        workflows = []
        
        # Collect workflows from active, completed, and failed collections
        all_workflows = list(workflow_engine.active_workflows.values())
        all_workflows.extend(workflow_engine.completed_workflows)
        all_workflows.extend(workflow_engine.failed_workflows)
        
        for workflow in all_workflows:
            # Apply filters
            if status and workflow.status.value != status:
                continue
            if template_id and workflow.template_id != template_id:
                continue
            if priority and workflow.priority.value != priority:
                continue
            if created_by and workflow.created_by != created_by:
                continue
            
            workflow_data = {
                "workflow_id": workflow.workflow_id,
                "workflow_name": workflow.workflow_name,
                "template_id": workflow.template_id,
                "status": workflow.status.value,
                "priority": workflow.priority.value,
                "progress_percentage": workflow.progress_percentage,
                "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
                "started_at": workflow.started_at.isoformat() if workflow.started_at else None,
                "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None,
                "created_by": workflow.created_by,
                "error_message": workflow.error_message
            }
            workflows.append(workflow_data)
        
        # Sort by creation time (newest first)
        workflows.sort(key=lambda w: w["created_at"] or "", reverse=True)
        
        # Apply pagination
        total_workflows = len(workflows)
        paginated_workflows = workflows[offset:offset + limit]
        
        return SuccessResponse(
            message="Workflows retrieved successfully",
            data={
                "workflows": paginated_workflows,
                "total_count": total_workflows,
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total_workflows
            }
        )
        
    except Exception as e:
        logger.error(f"Workflow listing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Workflow listing failed: {str(e)}")

@router.get("/analytics")
@rate_limiter.limit("20/minute")
async def get_workflow_analytics(
    time_range: str = Query(default="1d", description="Time range for analytics"),
    template_ids: Optional[str] = Query(default=None, description="Comma-separated template IDs"),
    status_filter: Optional[str] = Query(default=None, description="Comma-separated status values"),
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get comprehensive workflow analytics and insights.
    
    Features:
    - Workflow performance metrics
    - Template usage statistics
    - Success/failure rates
    - Execution time analysis
    """
    try:
        await audit_log(
            action="workflow_analytics_accessed",
            user_id=current_user.get("user_id"),
            resource_type="analytics",
            resource_id=None,
            metadata={
                "time_range": time_range,
                "template_filter": template_ids,
                "status_filter": status_filter
            }
        )
        
        # Get workflow insights
        workflow_insights = await workflow_engine.get_workflow_insights()
        
        # Generate analytics based on filters
        analytics_data = await _generate_workflow_analytics(
            workflow_insights, time_range, template_ids, status_filter, workflow_engine
        )
        
        return SuccessResponse(
            message="Workflow analytics retrieved successfully",
            data=analytics_data
        )
        
    except Exception as e:
        logger.error(f"Workflow analytics failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

@router.get("/health")
async def get_workflow_engine_health(
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine)
):
    """
    Get workflow engine health status and metrics.
    """
    try:
        health_data = await workflow_engine.get_workflow_insights()
        
        return SuccessResponse(
            message="Workflow engine health retrieved successfully",
            data={
                "engine_status": "healthy",
                "active_workflows": health_data["active_workflows"],
                "workflow_queue_size": health_data["workflow_queue_size"],
                "workflow_templates": health_data["workflow_templates"],
                "pending_approvals": health_data["pending_approvals"],
                "performance_metrics": {
                    "successful_workflows": health_data["workflow_metrics"]["successful_workflows"],
                    "failed_workflows": health_data["workflow_metrics"]["failed_workflows"],
                    "average_execution_time": health_data["workflow_metrics"]["average_execution_time"],
                    "workflow_throughput": health_data["workflow_metrics"]["workflow_throughput"]
                },
                "engine_configuration": health_data["engine_status"]
            }
        )
        
    except Exception as e:
        logger.error(f"Workflow engine health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Helper functions
async def _apply_workflow_control_action(
    workflow: ScanWorkflow,
    action: str,
    reason: Optional[str],
    current_user: dict
) -> Dict[str, Any]:
    """Apply control action to workflow"""
    
    previous_status = workflow.status.value
    
    if action == "pause":
        if workflow.status == WorkflowStatus.RUNNING:
            workflow.status = WorkflowStatus.PAUSED
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot pause workflow in {workflow.status.value} status"
            )
    
    elif action == "resume":
        if workflow.status == WorkflowStatus.PAUSED:
            workflow.status = WorkflowStatus.RUNNING
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot resume workflow in {workflow.status.value} status"
            )
    
    elif action == "cancel":
        if workflow.status in [WorkflowStatus.PENDING, WorkflowStatus.RUNNING, WorkflowStatus.PAUSED]:
            workflow.status = WorkflowStatus.CANCELLED
            workflow.completed_at = datetime.utcnow()
            workflow.error_message = f"Cancelled by user: {reason or 'No reason provided'}"
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot cancel workflow in {workflow.status.value} status"
            )
    
    else:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
    
    return {
        "previous_status": previous_status,
        "new_status": workflow.status.value,
        "action_applied": action,
        "reason": reason
    }

async def _generate_workflow_analytics(
    workflow_insights: Dict[str, Any],
    time_range: str,
    template_ids: Optional[str],
    status_filter: Optional[str],
    workflow_engine: ScanWorkflowEngine
) -> Dict[str, Any]:
    """Generate workflow analytics data"""
    
    # Parse filters
    template_filter = template_ids.split(",") if template_ids else None
    status_filter_list = status_filter.split(",") if status_filter else None
    
    analytics = {
        "time_range": time_range,
        "summary": {
            "total_workflows": workflow_insights["workflow_metrics"]["total_workflows_executed"],
            "successful_workflows": workflow_insights["workflow_metrics"]["successful_workflows"],
            "failed_workflows": workflow_insights["workflow_metrics"]["failed_workflows"],
            "active_workflows": workflow_insights["active_workflows"],
            "average_execution_time": workflow_insights["workflow_metrics"]["average_execution_time"]
        },
        "performance_metrics": {
            "success_rate": (
                workflow_insights["workflow_metrics"]["successful_workflows"] /
                max(workflow_insights["workflow_metrics"]["total_workflows_executed"], 1)
            ),
            "workflow_throughput": workflow_insights["workflow_metrics"]["workflow_throughput"],
            "queue_efficiency": (
                workflow_insights["active_workflows"] /
                max(workflow_insights["workflow_queue_size"] + workflow_insights["active_workflows"], 1)
            )
        },
        "template_usage": workflow_insights["template_usage_stats"],
        "stage_performance": workflow_insights["workflow_metrics"]["stage_success_rate"],
        "approval_statistics": workflow_insights["workflow_metrics"]["approval_stats"],
        "trending_templates": [
            {
                "template_id": template_id,
                "usage_count": count,
                "template_name": workflow_engine.workflow_templates.get(template_id, {}).get("template_name", "Unknown")
            }
            for template_id, count in sorted(
                workflow_insights["template_usage_stats"].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
        ]
    }
    
    return analytics