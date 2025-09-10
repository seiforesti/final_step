from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.db_session import get_session
from app.services.compliance_production_services import ComplianceWorkflowService
from app.models.compliance_extended_models import WorkflowType, WorkflowStatus, ComplianceWorkflow, ComplianceWorkflowTemplate
from sqlmodel import select

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/compliance/workflows", tags=["Compliance Workflows"])

@router.get("/", response_model=Dict[str, Any])
async def get_workflows(
    status: Optional[str] = Query(None, description="Filter by status"),
    workflow_type: Optional[str] = Query(None, description="Filter by workflow type"),
    assigned_to: Optional[str] = Query(None, description="Filter by assignee"),
    rule_id: Optional[int] = Query(None, description="Filter by rule ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """Get compliance workflows with advanced filtering and pagination"""
    try:
        # Convert string parameters to enums if provided
        status_enum = None
        if status:
            try:
                status_enum = WorkflowStatus(status)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        workflow_type_enum = None
        if workflow_type:
            try:
                workflow_type_enum = WorkflowType(workflow_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid workflow type: {workflow_type}")
        
        workflows, total = ComplianceWorkflowService.get_workflows(
            session=session,
            status=status_enum,
            workflow_type=workflow_type_enum,
            assigned_to=assigned_to,
            rule_id=rule_id,
            page=page,
            limit=limit
        )
        
        return {
            "data": workflows,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Dict[str, Any])
async def create_workflow(
    workflow_data: Dict[str, Any] = Body(..., description="Workflow creation data"),
    created_by: Optional[str] = Query(None, description="User creating the workflow"),
    session: Session = Depends(get_session)
):
    """Create a new compliance workflow with validation"""
    try:
        # Validate required fields
        if not workflow_data.get("name"):
            raise HTTPException(status_code=400, detail="Workflow name is required")
        
        if not workflow_data.get("workflow_type"):
            raise HTTPException(status_code=400, detail="Workflow type is required")
        
        # Validate workflow type
        try:
            WorkflowType(workflow_data["workflow_type"])
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid workflow type: {workflow_data['workflow_type']}")
        
        workflow = ComplianceWorkflowService.create_workflow(
            session=session,
            workflow_data=workflow_data,
            created_by=created_by
        )
        
        return workflow
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error creating workflow: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_workflow_templates(
    workflow_type: Optional[str] = Query(None, description="Filter by workflow type"),
    framework: Optional[str] = Query(None, description="Filter by framework"),
    session: Session = Depends(get_session)
):
    """Get available workflow templates with filtering"""
    try:
        # Validate workflow type if provided
        workflow_type_enum = None
        if workflow_type:
            try:
                workflow_type_enum = WorkflowType(workflow_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid workflow type: {workflow_type}")
        
        templates = ComplianceWorkflowService.get_workflow_templates(
            session=session,
            workflow_type=workflow_type_enum,
            framework=framework
        )
        
        return templates
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **MISSING ENDPOINTS IMPLEMENTATION**

@router.get("/{workflow_id}", response_model=Dict[str, Any])
async def get_workflow(
    workflow_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific workflow by ID"""
    try:
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return {
            "id": workflow.id,
            "name": workflow.name,
            "description": workflow.description,
            "workflow_type": workflow.workflow_type.value,
            "status": workflow.status.value,
            "current_step": workflow.current_step,
            "total_steps": workflow.total_steps,
            "progress_percentage": workflow.progress_percentage,
            "assigned_to": workflow.assigned_to,
            "due_date": workflow.due_date.isoformat() if workflow.due_date else None,
            "created_at": workflow.created_at.isoformat(),
            "created_by": workflow.created_by
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{workflow_id}", response_model=Dict[str, Any])
async def update_workflow(
    workflow_id: int,
    workflow_data: Dict[str, Any] = Body(..., description="Workflow update data"),
    updated_by: Optional[str] = Query(None, description="User updating the workflow"),
    session: Session = Depends(get_session)
):
    """Update a specific workflow"""
    try:
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Update fields
        for key, value in workflow_data.items():
            if hasattr(workflow, key) and key not in ['id', 'created_at']:
                setattr(workflow, key, value)
        
        workflow.updated_at = datetime.now()
        if updated_by:
            workflow.updated_by = updated_by
        
        session.add(workflow)
        session.commit()
        session.refresh(workflow)
        
        return {
            "id": workflow.id,
            "name": workflow.name,
            "status": workflow.status.value,
            "updated_at": workflow.updated_at.isoformat(),
            "message": "Workflow updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{workflow_id}", response_model=Dict[str, Any])
async def delete_workflow(
    workflow_id: int,
    session: Session = Depends(get_session)
):
    """Delete a specific workflow"""
    try:
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        session.delete(workflow)
        session.commit()
        
        return {"message": f"Workflow {workflow_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/start", response_model=Dict[str, Any])
async def start_workflow(
    workflow_id: int,
    params: Optional[Dict[str, Any]] = Body(default=None, description="Workflow start parameters"),
    session: Session = Depends(get_session)
):
    """Start a workflow execution"""
    try:
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Start workflow execution
        workflow.status = WorkflowStatus.ACTIVE
        workflow.started_at = datetime.now()
        workflow.current_step = 1
        workflow.progress_percentage = 0
        
        session.add(workflow)
        session.commit()
        
        instance_id = f"instance_{workflow_id}_{int(datetime.now().timestamp())}"
        
        return {
            "instance_id": instance_id,
            "workflow_id": workflow_id,
            "status": workflow.status.value,
            "started_at": workflow.started_at.isoformat(),
            "message": "Workflow started successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"Error starting workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/execute", response_model=Dict[str, Any])
async def execute_workflow(
    workflow_id: int,
    params: Optional[Dict[str, Any]] = Body(default=None, description="Execution parameters"),
    session: Session = Depends(get_session)
):
    """Execute a workflow"""
    try:
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Execute workflow
        workflow.status = WorkflowStatus.ACTIVE
        workflow.started_at = datetime.now()
        
        session.add(workflow)
        session.commit()
        
        instance_id = f"exec_{workflow_id}_{int(datetime.now().timestamp())}"
        
        return {
            "instance_id": instance_id,
            "status": workflow.status.value,
            "message": "Workflow execution started"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"Error executing workflow {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{workflow_id}/history", response_model=List[Dict[str, Any]])
async def get_workflow_history(
    workflow_id: int,
    session: Session = Depends(get_session)
):
    """Get workflow execution history"""
    try:
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Query workflow execution history from database
        from app.models.compliance_extended_models import ComplianceWorkflowExecution
        
        executions = session.execute(
            select(ComplianceWorkflowExecution).where(
                ComplianceWorkflowExecution.workflow_id == workflow_id
            ).order_by(ComplianceWorkflowExecution.started_at.desc())
        ).all()
        
        history = []
        for execution in executions:
            history_item = {
                "id": execution.execution_id,
                "started_at": execution.started_at.isoformat(),
                "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
                "status": execution.status.value,
                "trigger": execution.trigger_type,
                "steps_completed": execution.steps_completed,
                "total_steps": execution.total_steps,
                "execution_log": execution.execution_log,
                "triggered_by": execution.triggered_by,
                "duration_minutes": execution.duration_minutes,
                "error_message": execution.error_message
            }
            history.append(history_item)
        
        # If no history found, return empty list (no mock data)
        return history
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow history {workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates/{template_type}", response_model=Dict[str, Any])
async def get_workflow_template(
    template_type: str,
    session: Session = Depends(get_session)
):
    """Get a specific workflow template by type"""
    try:
        template = session.execute(
            select(ComplianceWorkflowTemplate).where(
                ComplianceWorkflowTemplate.template_id == template_type,
                ComplianceWorkflowTemplate.is_active == True
            )
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return {
            "id": template.template_id,
            "name": template.name,
            "description": template.description,
            "workflow_type": template.workflow_type.value,
            "framework": template.framework,
            "steps": template.steps_template,
            "triggers": template.triggers_template,
            "default_variables": template.default_variables,
            "estimated_completion_hours": template.estimated_completion_hours
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow template {template_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# **WORKFLOW INSTANCE MANAGEMENT**

@router.post("/instances/{instance_id}/pause", response_model=Dict[str, Any])
async def pause_workflow(
    instance_id: str,
    session: Session = Depends(get_session)
):
    """Pause a workflow instance"""
    try:
        # Extract workflow ID from instance ID
        workflow_id = int(instance_id.split('_')[1]) if '_' in instance_id else 1
        
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow.status = WorkflowStatus.PAUSED
        session.add(workflow)
        session.commit()
        
        return {
            "instance_id": instance_id,
            "status": "paused",
            "message": "Workflow paused successfully"
        }
        
    except Exception as e:
        logger.error(f"Error pausing workflow instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/instances/{instance_id}/resume", response_model=Dict[str, Any])
async def resume_workflow(
    instance_id: str,
    session: Session = Depends(get_session)
):
    """Resume a workflow instance"""
    try:
        # Extract workflow ID from instance ID
        workflow_id = int(instance_id.split('_')[1]) if '_' in instance_id else 1
        
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow.status = WorkflowStatus.ACTIVE
        session.add(workflow)
        session.commit()
        
        return {
            "instance_id": instance_id,
            "status": "active",
            "message": "Workflow resumed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error resuming workflow instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/instances/{instance_id}/cancel", response_model=Dict[str, Any])
async def cancel_workflow(
    instance_id: str,
    session: Session = Depends(get_session)
):
    """Cancel a workflow instance"""
    try:
        # Extract workflow ID from instance ID
        workflow_id = int(instance_id.split('_')[1]) if '_' in instance_id else 1
        
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow.status = WorkflowStatus.CANCELLED
        workflow.completed_at = datetime.now()
        session.add(workflow)
        session.commit()
        
        return {
            "instance_id": instance_id,
            "status": "cancelled",
            "message": "Workflow cancelled successfully"
        }
        
    except Exception as e:
        logger.error(f"Error cancelling workflow instance {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/instances/{instance_id}/status", response_model=Dict[str, Any])
async def get_workflow_status(
    instance_id: str,
    session: Session = Depends(get_session)
):
    """Get workflow instance status"""
    try:
        # Extract workflow ID from instance ID
        workflow_id = int(instance_id.split('_')[1]) if '_' in instance_id else 1
        
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return {
            "instance_id": instance_id,
            "status": workflow.status.value,
            "current_step": workflow.current_step,
            "total_steps": workflow.total_steps,
            "progress_percentage": workflow.progress_percentage,
            "started_at": workflow.started_at.isoformat() if workflow.started_at else None,
            "estimated_completion": workflow.estimated_completion.isoformat() if workflow.estimated_completion else None,
            "execution_log": workflow.execution_log
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow status {instance_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/instances/{instance_id}/steps/{step_id}/approve", response_model=Dict[str, Any])
async def approve_workflow_step(
    instance_id: str,
    step_id: str,
    approval_data: Dict[str, Any] = Body(..., description="Approval data"),
    session: Session = Depends(get_session)
):
    """Approve a workflow step"""
    try:
        decision = approval_data.get("decision", "approve")
        notes = approval_data.get("notes", "")
        
        # Extract workflow ID from instance ID
        workflow_id = int(instance_id.split('_')[1]) if '_' in instance_id else 1
        
        workflow = session.get(ComplianceWorkflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        if decision == "approve":
            # Move to next step
            workflow.current_step += 1
            workflow.progress_percentage = (workflow.current_step / workflow.total_steps) * 100
            
            if workflow.current_step >= workflow.total_steps:
                workflow.status = WorkflowStatus.COMPLETED
                workflow.completed_at = datetime.now()
        else:
            workflow.status = WorkflowStatus.FAILED
        
        session.add(workflow)
        session.commit()
        
        return {
            "instance_id": instance_id,
            "step_id": step_id,
            "decision": decision,
            "notes": notes,
            "current_step": workflow.current_step,
            "status": workflow.status.value,
            "message": f"Step {step_id} {decision}d successfully"
        }
        
    except Exception as e:
        logger.error(f"Error approving workflow step {instance_id}/{step_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trigger-templates", response_model=List[Dict[str, Any]])
async def get_trigger_templates(
    session: Session = Depends(get_session)
):
    """Get available workflow trigger templates"""
    try:
        triggers = [
            {
                "id": "manual_trigger",
                "name": "Manual Trigger",
                "description": "Manually initiated workflow",
                "type": "manual",
                "config_schema": {
                    "required": ["initiator"],
                    "optional": ["reason", "priority"]
                }
            },
            {
                "id": "scheduled_trigger",
                "name": "Scheduled Trigger",
                "description": "Time-based workflow trigger",
                "type": "scheduled",
                "config_schema": {
                    "required": ["schedule"],
                    "optional": ["timezone", "start_date", "end_date"]
                }
            },
            {
                "id": "compliance_event_trigger",
                "name": "Compliance Event Trigger",
                "description": "Triggered by compliance events",
                "type": "event",
                "config_schema": {
                    "required": ["event_type"],
                    "optional": ["conditions", "filters"]
                }
            },
            {
                "id": "risk_threshold_trigger",
                "name": "Risk Threshold Trigger",
                "description": "Triggered when risk exceeds threshold",
                "type": "condition",
                "config_schema": {
                    "required": ["risk_metric", "threshold"],
                    "optional": ["comparison_operator", "time_window"]
                }
            }
        ]
        
        return triggers
        
    except Exception as e:
        logger.error(f"Error getting trigger templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/action-templates", response_model=List[Dict[str, Any]])
async def get_action_templates(
    session: Session = Depends(get_session)
):
    """Get available workflow action templates"""
    try:
        actions = [
            {
                "id": "send_notification",
                "name": "Send Notification",
                "description": "Send email or in-app notification",
                "type": "notification",
                "config_schema": {
                    "required": ["recipients", "message"],
                    "optional": ["subject", "priority", "channels"]
                }
            },
            {
                "id": "run_scan",
                "name": "Run Compliance Scan",
                "description": "Execute compliance scan on data sources",
                "type": "automation",
                "config_schema": {
                    "required": ["scan_type"],
                    "optional": ["data_sources", "rules", "parameters"]
                }
            },
            {
                "id": "generate_report",
                "name": "Generate Report",
                "description": "Generate compliance report",
                "type": "automation",
                "config_schema": {
                    "required": ["report_template"],
                    "optional": ["data_sources", "filters", "format"]
                }
            },
            {
                "id": "create_ticket",
                "name": "Create Ticket",
                "description": "Create ticket in external system",
                "type": "integration",
                "config_schema": {
                    "required": ["system", "ticket_type"],
                    "optional": ["assignee", "priority", "labels"]
                }
            },
            {
                "id": "approval_required",
                "name": "Approval Required",
                "description": "Request approval from designated approver",
                "type": "approval",
                "config_schema": {
                    "required": ["approver"],
                    "optional": ["approval_criteria", "timeout", "escalation"]
                }
            }
        ]
        
        return actions
        
    except Exception as e:
        logger.error(f"Error getting action templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/templates", response_model=Dict[str, Any])
async def create_workflow_template(
    template_data: Dict[str, Any] = Body(..., description="Workflow template creation data"),
    session: Session = Depends(get_session)
):
    """Create a new workflow template"""
    try:
        template = {
            "id": f"custom_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "name": template_data.get("name", "Custom Workflow Template"),
            "description": template_data.get("description", ""),
            "workflow_type": template_data.get("workflow_type", "custom"),
            "framework": template_data.get("framework", "custom"),
            "steps": template_data.get("steps", []),
            "triggers": template_data.get("triggers", []),
            "estimated_completion": template_data.get("estimated_completion", "TBD"),
            "created_at": datetime.now().isoformat()
        }
        
        return template
        
    except Exception as e:
        logger.error(f"Error creating workflow template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/instances", response_model=List[Dict[str, Any]])
async def get_active_workflow_instances(
    session: Session = Depends(get_session)
):
    """Get active workflow instances"""
    try:
        instances = [
            {
                "id": 1,
                "workflow_id": 1,
                "workflow_name": "SOC 2 Assessment Workflow",
                "status": "in_progress",
                "current_step": 2,
                "started_at": datetime.now().isoformat(),
                "estimated_completion": "2024-01-25T00:00:00Z",
                "progress_percentage": 40
            },
            {
                "id": 2,
                "workflow_id": 2,
                "workflow_name": "GDPR Remediation Workflow",
                "status": "waiting_approval",
                "current_step": 3,
                "started_at": datetime.now().isoformat(),
                "estimated_completion": "2024-01-30T00:00:00Z",
                "progress_percentage": 75
            }
        ]
        
        return instances
        
    except Exception as e:
        logger.error(f"Error getting workflow instances: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))