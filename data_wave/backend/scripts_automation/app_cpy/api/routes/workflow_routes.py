from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db_session import get_session
from app.services.advanced_workflow_service import AdvancedWorkflowService
from app.models.workflow_models import (
    Workflow, WorkflowExecution, WorkflowStep,
    WorkflowTemplate
)
from app.api.security.rbac import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_WORKFLOW_VIEW, PERMISSION_WORKFLOW_MANAGE,
    PERMISSION_WORKFLOW_CREATE, PERMISSION_WORKFLOW_EXECUTE
)

router = APIRouter(prefix="/workflow", tags=["Workflow"])

@router.get("/designer/workflows")
async def get_workflow_designer_workflows(
    workflow_type: Optional[str] = Query(None, description="Filter by workflow type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
) -> Dict[str, Any]:
    """
    Get workflow definitions for workflow designer
    
    Features:
    - Visual workflow designer
    - Drag-and-drop workflow builder
    - Template-based workflows
    - Conditional logic and branching
    """
    try:
        result = AdvancedWorkflowService.get_workflow_definitions(
            session=session,
            workflow_type=workflow_type,
            status=status,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "workflow_features": [
                "visual_designer",
                "template_system",
                "conditional_logic",
                "parallel_execution",
                "approval_workflows"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflows: {str(e)}"
        )

@router.post("/designer/workflows")
async def create_workflow(
    workflow_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_CREATE))
) -> Dict[str, Any]:
    """Create a new workflow definition"""
    try:
        result = AdvancedWorkflowService.create_workflow_definition(
            session=session,
            workflow_data=workflow_data,
            creator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Workflow created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workflow: {str(e)}"
        )

@router.get("/designer/workflows/{workflow_id}")
async def get_workflow_definition(
    workflow_id: str,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
) -> Dict[str, Any]:
    """Get detailed workflow definition for the designer"""
    try:
        result = AdvancedWorkflowService.get_workflow_definition(
            session=session,
            workflow_id=workflow_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow definition: {str(e)}"
        )

@router.put("/designer/workflows/{workflow_id}")
async def update_workflow_definition(
    workflow_id: str,
    workflow_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_MANAGE))
) -> Dict[str, Any]:
    """Update workflow definition in the designer"""
    try:
        result = AdvancedWorkflowService.update_workflow_definition(
            session=session,
            workflow_id=workflow_id,
            workflow_data=workflow_data,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Workflow updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update workflow: {str(e)}"
        )

@router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    execution_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_EXECUTE))
) -> Dict[str, Any]:
    """
    Execute a workflow with given parameters
    
    Features:
    - Parallel step execution
    - Conditional branching
    - Error handling and retry logic
    - Real-time execution monitoring
    """
    try:
        result = AdvancedWorkflowService.execute_workflow(
            session=session,
            workflow_id=workflow_id,
            execution_data=execution_data,
            executor_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "execution_features": [
                "parallel_execution",
                "real_time_monitoring",
                "error_handling",
                "step_by_step_tracking"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute workflow: {str(e)}"
        )

@router.get("/executions")
async def get_workflow_executions(
    days: int = Query(7, description="Number of days to look back"),
    status: Optional[str] = Query(None, description="Filter by execution status"),
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
) -> Dict[str, Any]:
    """
    Get workflow execution history
    
    Features:
    - Execution tracking
    - Status monitoring
    - Performance metrics
    - Error reporting
    """
    try:
        result = AdvancedWorkflowService.get_workflow_executions(
            session=session,
            days=days,
            status=status,
            workflow_id=workflow_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "execution_features": [
                "real_time_tracking",
                "status_monitoring",
                "performance_metrics",
                "error_reporting"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow executions: {str(e)}"
        )

@router.get("/executions/{execution_id}")
async def get_workflow_execution_details(
    execution_id: str,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
) -> Dict[str, Any]:
    """Get detailed workflow execution information"""
    try:
        result = AdvancedWorkflowService.get_execution_details(
            session=session,
            execution_id=execution_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get execution details: {str(e)}"
        )

@router.post("/approvals/workflows")
async def create_approval_workflow(
    approval_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_CREATE))
) -> Dict[str, Any]:
    """
    Create approval workflow for data governance operations
    
    Features:
    - Multi-step approval processes
    - Role-based approver assignment
    - Escalation and timeout handling
    - Approval analytics and tracking
    """
    try:
        result = AdvancedWorkflowService.create_approval_workflow(
            session=session,
            approval_data=approval_data,
            creator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "approval_features": [
                "multi_step_approval",
                "role_based_routing",
                "escalation_handling",
                "approval_analytics"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create approval workflow: {str(e)}"
        )

@router.get("/approvals/pending")
async def get_pending_workflow_approvals(
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    approver_id: Optional[str] = Query(None, description="Filter by approver ID"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
) -> Dict[str, Any]:
    """
    Get pending workflow approvals
    
    Features:
    - Approval queue management
    - Workflow status tracking
    - Approver assignment
    - Deadline monitoring
    """
    try:
        result = AdvancedWorkflowService.get_pending_approvals(
            session=session,
            workflow_id=workflow_id,
            approver_id=approver_id or current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "approval_features": [
                "queue_management",
                "status_tracking",
                "approver_assignment",
                "deadline_monitoring"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending approvals: {str(e)}"
        )

@router.post("/approvals/{approval_id}/approve")
async def approve_request(
    approval_id: str,
    approval_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_EXECUTE))
) -> Dict[str, Any]:
    """Approve a pending request"""
    try:
        result = AdvancedWorkflowService.approve_request(
            session=session,
            approval_id=approval_id,
            approval_data=approval_data,
            approver_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Request approved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve request: {str(e)}"
        )

@router.post("/approvals/{approval_id}/reject")
async def reject_request(
    approval_id: str,
    rejection_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_EXECUTE))
) -> Dict[str, Any]:
    """Reject a pending request"""
    try:
        result = AdvancedWorkflowService.reject_request(
            session=session,
            approval_id=approval_id,
            rejection_data=rejection_data,
            approver_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Request rejected successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject request: {str(e)}"
        )

@router.post("/bulk-operations")
async def create_bulk_operation(
    operation_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_EXECUTE))
) -> Dict[str, Any]:
    """
    Create and execute bulk operations on data sources
    
    Features:
    - Batch processing capabilities
    - Progress tracking and monitoring
    - Error handling and rollback
    - Resource optimization
    """
    try:
        result = AdvancedWorkflowService.create_bulk_operation(
            session=session,
            operation_data=operation_data,
            creator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "bulk_features": [
                "batch_processing",
                "progress_tracking",
                "error_handling",
                "resource_optimization"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create bulk operation: {str(e)}"
        )

@router.get("/bulk-operations/{operation_id}/status")
async def get_bulk_operation_status(
    operation_id: str,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
) -> Dict[str, Any]:
    """Get bulk operation status and progress"""
    try:
        result = AdvancedWorkflowService.get_bulk_operation_status(
            session=session,
            operation_id=operation_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get operation status: {str(e)}"
        )

@router.get("/templates")
async def get_workflow_templates(
    category: Optional[str] = Query(None, description="Filter by template category"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
) -> Dict[str, Any]:
    """
    Get workflow templates for quick workflow creation
    
    Features:
    - Pre-built workflow templates
    - Industry-specific workflows
    - Customizable template library
    - Template versioning and sharing
    """
    try:
        result = AdvancedWorkflowService.get_workflow_templates(
            session=session,
            category=category,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "template_features": [
                "pre_built_templates",
                "industry_specific",
                "customizable_library",
                "version_control"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get templates: {str(e)}"
        )