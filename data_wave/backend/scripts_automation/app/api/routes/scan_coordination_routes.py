"""
🏢 Enterprise Scan Coordination Routes (Scan Logic Group)
========================================================

This module provides comprehensive API endpoints for scan coordination with:
- Advanced multi-system scan coordination and orchestration
- Intelligent resource allocation and load balancing
- Real-time scan monitoring and management
- Cross-system dependency tracking and resolution
- Enterprise-grade scan workflow coordination

Authors: Enterprise Data Governance Team
Version: 1.0.0 (Production-Ready)
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Body, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from pydantic import BaseModel, Field

# Core dependencies
from ...db_session import get_session
from ...models.scan_models import ScanRule, ScanExecution
from ...models.scan_orchestration_models import ScanOrchestration, OrchestrationStep
from ...models.scan_workflow_models import ScanWorkflow, WorkflowStage

# Service dependencies
from ...services.intelligent_scan_coordinator import IntelligentScanCoordinator
from ...services.unified_scan_manager import UnifiedScanManager
from ...services.enterprise_scan_orchestrator import EnterpriseScanOrchestrator
from ...services.scan_workflow_engine import ScanWorkflowEngine

# Authentication and authorization
from ...api.security.rbac import (
    get_current_user,
    require_permission,
    PERMISSION_ANALYTICS_VIEW as Permission_ANALYTICS_VIEW,
    PERMISSION_WORKFLOW_EXECUTE as Permission_WORKFLOW_EXECUTE,
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/api/v1/scan-coordination",
    tags=["Scan Coordination", "Scan Logic", "Orchestration"],
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

# Request/Response Models

class CoordinationRequest(BaseModel):
    """Request model for scan coordination"""
    coordination_type: str = Field(..., description="Type of coordination: parallel, sequential, hybrid")
    scan_groups: List[Dict[str, Any]] = Field(..., description="Groups of scans to coordinate")
    priority_strategy: str = Field("balanced", description="Priority strategy: balanced, performance, accuracy")
    resource_allocation: str = Field("dynamic", description="Resource allocation strategy")
    dependencies: Optional[List[Dict[str, str]]] = Field(None, description="Inter-scan dependencies")
    coordination_parameters: Optional[Dict[str, Any]] = Field(None, description="Custom coordination parameters")

class MultiSystemScanRequest(BaseModel):
    """Request model for multi-system scan coordination"""
    target_systems: List[str] = Field(..., description="Target systems to scan")
    scan_configuration: Dict[str, Any] = Field(..., description="Scan configuration per system")
    synchronization_mode: str = Field("coordinated", description="Synchronization mode")
    failure_handling: str = Field("continue", description="Failure handling strategy")
    completion_criteria: Dict[str, Any] = Field(..., description="Completion criteria")

class WorkflowCoordinationRequest(BaseModel):
    """Request model for workflow coordination"""
    workflow_template_id: Optional[str] = Field(None, description="Workflow template ID")
    workflow_definition: Optional[Dict[str, Any]] = Field(None, description="Custom workflow definition")
    execution_mode: str = Field("standard", description="Execution mode: standard, fast_track, comprehensive")
    approval_required: bool = Field(False, description="Require approval for execution")
    notification_settings: Dict[str, bool] = Field(..., description="Notification preferences")

class ResourceCoordinationRequest(BaseModel):
    """Request model for resource coordination"""
    resource_pools: List[str] = Field(..., description="Resource pools to coordinate")
    allocation_strategy: str = Field("fair_share", description="Allocation strategy")
    priority_weights: Dict[str, float] = Field(..., description="Priority weights for allocation")
    monitoring_interval: int = Field(30, description="Monitoring interval in seconds")

# Service Dependencies

def get_scan_coordinator() -> IntelligentScanCoordinator:
    """Get intelligent scan coordinator service"""
    return IntelligentScanCoordinator()

def get_unified_manager() -> UnifiedScanManager:
    """Get unified scan manager service"""
    return UnifiedScanManager()

def get_scan_orchestrator() -> EnterpriseScanOrchestrator:
    """Get enterprise scan orchestrator service"""
    return EnterpriseScanOrchestrator()

def get_workflow_engine() -> ScanWorkflowEngine:
    """Get scan workflow engine service"""
    return ScanWorkflowEngine()

# API Endpoints

@router.post("/execute")
async def execute_coordinated_scan(
    request: CoordinationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_scan_orchestrator)
):
    """
    Execute coordinated scan across multiple systems
    
    This endpoint provides:
    - Advanced multi-system scan coordination
    - Intelligent resource allocation and scheduling
    - Dependency-aware execution planning
    - Real-time coordination monitoring
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_EXECUTE, Permission.SCAN_COORDINATE])
        
        # Validate coordination request
        validation_result = await _validate_coordination_request(request, session)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid coordination request: {validation_result['error']}"
            )
        
        # Create coordination plan
        coordination_plan = await coordinator.create_coordination_plan({
            "coordination_type": request.coordination_type,
            "scan_groups": request.scan_groups,
            "priority_strategy": request.priority_strategy,
            "resource_allocation": request.resource_allocation,
            "dependencies": request.dependencies or [],
            "parameters": request.coordination_parameters or {},
            "user_id": current_user.id
        }, session)
        
        if not coordination_plan["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create coordination plan: {coordination_plan['error']}"
            )
        
        # Execute coordinated scan
        execution_result = await coordinator.execute_coordinated_scan({
            "coordination_plan_id": coordination_plan["plan_id"],
            "execution_mode": "intelligent",
            "monitoring_enabled": True,
            "auto_optimization": True
        }, session)
        
        if not execution_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Coordinated scan execution failed: {execution_result['error']}"
            )
        
        # Start background monitoring
        background_tasks.add_task(
            _monitor_coordinated_execution,
            execution_result["execution_id"],
            coordination_plan["plan_id"],
            session
        )
        
        return {
            "success": True,
            "execution_id": execution_result["execution_id"],
            "coordination_plan_id": coordination_plan["plan_id"],
            "coordination_type": request.coordination_type,
            "scan_groups": len(request.scan_groups),
            "estimated_completion": execution_result["estimated_completion"],
            "resource_allocation": execution_result["resource_allocation"],
            "monitoring_enabled": True,
            "execution_status": "initializing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing coordinated scan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-system")
async def coordinate_multi_system_scan(
    request: MultiSystemScanRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager)
):
    """
    Coordinate scans across multiple systems simultaneously
    
    This endpoint provides:
    - Cross-system scan synchronization
    - Unified progress tracking and reporting
    - Intelligent failure recovery and continuity
    - System-specific optimization and adaptation
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_EXECUTE, Permission.MULTI_SYSTEM_ACCESS])
        
        # Validate system access
        system_validation = await coordinator.validate_system_access(
            request.target_systems,
            current_user,
            session
        )
        
        if not system_validation["all_accessible"]:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied to systems: {system_validation['inaccessible_systems']}"
            )
        
        # Create multi-system coordination
        coordination_result = await coordinator.create_multi_system_coordination({
            "target_systems": request.target_systems,
            "scan_configuration": request.scan_configuration,
            "synchronization_mode": request.synchronization_mode,
            "failure_handling": request.failure_handling,
            "completion_criteria": request.completion_criteria,
            "user_id": current_user.id
        }, session)
        
        if not coordination_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Multi-system coordination failed: {coordination_result['error']}"
            )
        
        # Execute multi-system scan
        execution_result = await unified_manager.execute_multi_system_scan({
            "coordination_id": coordination_result["coordination_id"],
            "systems": request.target_systems,
            "configuration": request.scan_configuration,
            "synchronization": request.synchronization_mode
        }, session)
        
        if not execution_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Multi-system scan execution failed: {execution_result['error']}"
            )
        
        # Start background coordination monitoring
        background_tasks.add_task(
            _monitor_multi_system_execution,
            execution_result["execution_id"],
            request.target_systems,
            session
        )
        
        return {
            "success": True,
            "execution_id": execution_result["execution_id"],
            "coordination_id": coordination_result["coordination_id"],
            "target_systems": request.target_systems,
            "synchronization_mode": request.synchronization_mode,
            "system_statuses": execution_result["system_statuses"],
            "overall_progress": execution_result["overall_progress"],
            "estimated_completion": execution_result["estimated_completion"],
            "monitoring_enabled": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error coordinating multi-system scan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflow")
async def coordinate_scan_workflow(
    request: WorkflowCoordinationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator)
):
    """
    Coordinate complex scan workflows with approval processes
    
    This endpoint provides:
    - Multi-stage workflow coordination and execution
    - Approval-based workflow management
    - Conditional workflow branching and logic
    - Automated workflow optimization
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_EXECUTE, Permission.WORKFLOW_MANAGE])
        
        # Create or validate workflow definition
        if request.workflow_template_id:
            workflow_result = await workflow_engine.instantiate_workflow_template({
                "template_id": request.workflow_template_id,
                "execution_mode": request.execution_mode,
                "user_id": current_user.id
            }, session)
        else:
            workflow_result = await workflow_engine.create_custom_workflow({
                "workflow_definition": request.workflow_definition,
                "execution_mode": request.execution_mode,
                "user_id": current_user.id
            }, session)
        
        if not workflow_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Workflow creation failed: {workflow_result['error']}"
            )
        
        # Handle approval requirement
        if request.approval_required:
            approval_result = await workflow_engine.request_workflow_approval({
                "workflow_id": workflow_result["workflow_id"],
                "approver_roles": ["workflow_approver", "admin"],
                "notification_settings": request.notification_settings
            }, session)
            
            if approval_result["approval_required"]:
                return {
                    "success": True,
                    "workflow_id": workflow_result["workflow_id"],
                    "status": "pending_approval",
                    "approval_request_id": approval_result["approval_request_id"],
                    "pending_approvers": approval_result["pending_approvers"],
                    "estimated_approval_time": approval_result["estimated_approval_time"]
                }
        
        # Execute workflow coordination
        execution_result = await coordinator.execute_workflow_coordination({
            "workflow_id": workflow_result["workflow_id"],
            "execution_parameters": {
                "mode": request.execution_mode,
                "notifications": request.notification_settings
            }
        }, session)
        
        if not execution_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Workflow execution failed: {execution_result['error']}"
            )
        
        # Start background workflow monitoring
        background_tasks.add_task(
            _monitor_workflow_execution,
            execution_result["execution_id"],
            workflow_result["workflow_id"],
            session
        )
        
        return {
            "success": True,
            "execution_id": execution_result["execution_id"],
            "workflow_id": workflow_result["workflow_id"],
            "execution_mode": request.execution_mode,
            "workflow_stages": execution_result["workflow_stages"],
            "current_stage": execution_result["current_stage"],
            "estimated_completion": execution_result["estimated_completion"],
            "monitoring_enabled": True,
            "status": "executing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error coordinating scan workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources/coordinate")
async def coordinate_resource_allocation(
    request: ResourceCoordinationRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager)
):
    """
    Coordinate resource allocation across scan operations
    
    This endpoint provides:
    - Intelligent resource pool coordination
    - Dynamic load balancing and optimization
    - Priority-based resource allocation
    - Real-time resource monitoring and adjustment
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.RESOURCE_MANAGE, Permission.SCAN_COORDINATE])
        
        # Validate resource pools
        if not request.resource_pools:
            raise HTTPException(
                status_code=400,
                detail="At least one resource pool must be specified"
            )
        
        # Create resource coordination
        coordination_result = await coordinator.create_resource_coordination({
            "resource_pools": request.resource_pools,
            "allocation_strategy": request.allocation_strategy,
            "priority_weights": request.priority_weights,
            "monitoring_interval": request.monitoring_interval,
            "user_id": current_user.id
        }, session)
        
        if not coordination_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Resource coordination failed: {coordination_result['error']}"
            )
        
        # Apply resource coordination
        allocation_result = await unified_manager.apply_resource_coordination({
            "coordination_id": coordination_result["coordination_id"],
            "immediate_effect": True,
            "optimization_enabled": True
        }, session)
        
        if not allocation_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Resource allocation failed: {allocation_result['error']}"
            )
        
        return {
            "success": True,
            "coordination_id": coordination_result["coordination_id"],
            "resource_pools": request.resource_pools,
            "allocation_strategy": request.allocation_strategy,
            "current_allocation": allocation_result["current_allocation"],
            "optimization_applied": allocation_result["optimization_applied"],
            "monitoring_interval": request.monitoring_interval,
            "coordination_status": "active"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error coordinating resource allocation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{execution_id}")
async def get_coordination_status(
    execution_id: str,
    include_details: bool = Query(False, description="Include detailed status"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator)
):
    """
    Get coordination execution status and progress
    
    This endpoint provides:
    - Real-time coordination status tracking
    - Detailed progress metrics and timelines
    - Error detection and recovery status
    - Performance metrics and optimization status
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW])
        
        # Get coordination status
        status_result = await coordinator.get_coordination_status({
            "execution_id": execution_id,
            "include_details": include_details,
            "include_metrics": True,
            "include_logs": include_details
        }, session)
        
        if not status_result["success"]:
            raise HTTPException(
                status_code=404,
                detail=f"Coordination execution not found: {execution_id}"
            )
        
        return {
            "success": True,
            "execution_id": execution_id,
            "coordination_status": status_result["status"],
            "overall_progress": status_result["overall_progress"],
            "stage_progress": status_result["stage_progress"],
            "started_at": status_result["started_at"],
            "estimated_completion": status_result["estimated_completion"],
            "resource_utilization": status_result["resource_utilization"],
            "performance_metrics": status_result["performance_metrics"],
            "active_scans": status_result["active_scans"],
            "completed_scans": status_result["completed_scans"],
            "failed_scans": status_result["failed_scans"],
            "details": status_result.get("details") if include_details else None,
            "logs": status_result.get("logs") if include_details else None,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting coordination status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel/{execution_id}")
async def cancel_coordination(
    execution_id: str,
    cancel_mode: str = Query("graceful", description="Cancellation mode: graceful, immediate"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator)
):
    """
    Cancel ongoing coordination execution
    
    This endpoint provides:
    - Graceful or immediate coordination cancellation
    - Resource cleanup and recovery
    - Partial result preservation
    - Coordination state restoration
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_CANCEL, Permission.SCAN_COORDINATE])
        
        # Cancel coordination
        cancellation_result = await coordinator.cancel_coordination({
            "execution_id": execution_id,
            "cancel_mode": cancel_mode,
            "user_id": current_user.id,
            "preserve_partial_results": True,
            "cleanup_resources": True
        }, session)
        
        if not cancellation_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Coordination cancellation failed: {cancellation_result['error']}"
            )
        
        return {
            "success": True,
            "execution_id": execution_id,
            "cancellation_mode": cancel_mode,
            "cancellation_status": cancellation_result["status"],
            "partial_results_preserved": cancellation_result["partial_results_preserved"],
            "resources_cleaned": cancellation_result["resources_cleaned"],
            "affected_scans": cancellation_result["affected_scans"],
            "cancellation_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling coordination: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active")
async def get_active_coordinations(
    limit: int = Query(50, ge=1, le=200, description="Maximum coordinations to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    coordination_type: Optional[str] = Query(None, description="Filter by coordination type"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator)
):
    """
    Get list of active coordination executions
    
    This endpoint provides:
    - Overview of all active coordinations
    - Filterable and paginated coordination list
    - Summary metrics and status information
    - Quick access to coordination controls
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.SCAN_COORDINATE])
        
        # Get active coordinations
        coordinations_result = await coordinator.get_active_coordinations({
            "limit": limit,
            "offset": offset,
            "coordination_type": coordination_type,
            "user_filter": current_user.id if not current_user.is_admin else None,
            "include_summary": True
        }, session)
        
        if not coordinations_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve active coordinations: {coordinations_result['error']}"
            )
        
        return {
            "success": True,
            "coordinations": coordinations_result["coordinations"],
            "total_count": coordinations_result["total_count"],
            "active_count": coordinations_result["active_count"],
            "limit": limit,
            "offset": offset,
            "coordination_type": coordination_type,
            "summary": {
                "total_active": coordinations_result["active_count"],
                "total_resources_used": coordinations_result["total_resources_used"],
                "average_progress": coordinations_result["average_progress"],
                "estimated_completions": coordinations_result["estimated_completions"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting active coordinations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream/coordination")
async def stream_coordination_updates(
    execution_id: Optional[str] = Query(None, description="Specific execution ID"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator)
):
    """
    Stream real-time coordination updates and events
    
    This endpoint provides:
    - Live coordination status streaming
    - Real-time progress and metric updates
    - Event-driven coordination notifications
    - Continuous monitoring data streaming
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.REAL_TIME_UPDATES])
        
        async def generate_coordination_stream():
            """Generate real-time coordination updates"""
            while True:
                try:
                    # Get latest coordination updates
                    updates = await coordinator.get_real_time_updates(
                        execution_id=execution_id,
                        user_context={"id": current_user.id, "role": current_user.role},
                        session=session
                    )
                    
                    if updates:
                        # Format as Server-Sent Events
                        for update in updates:
                            yield f"data: {json.dumps(update)}\n\n"
                    
                    await asyncio.sleep(2)  # Update every 2 seconds
                    
                except Exception as e:
                    logger.error(f"Error in coordination stream: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    break
        
        return StreamingResponse(
            generate_coordination_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting coordination stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Private Helper Functions

async def _validate_coordination_request(request: CoordinationRequest, session: AsyncSession) -> Dict[str, Any]:
    """Validate coordination request parameters"""
    try:
        # Validate coordination type
        valid_types = ["parallel", "sequential", "hybrid"]
        if request.coordination_type not in valid_types:
            return {"valid": False, "error": f"Invalid coordination type. Must be one of: {valid_types}"}
        
        # Validate scan groups
        if not request.scan_groups:
            return {"valid": False, "error": "At least one scan group must be specified"}
        
        # Validate priority strategy
        valid_strategies = ["balanced", "performance", "accuracy"]
        if request.priority_strategy not in valid_strategies:
            return {"valid": False, "error": f"Invalid priority strategy. Must be one of: {valid_strategies}"}
        
        return {"valid": True}
        
    except Exception as e:
        return {"valid": False, "error": f"Validation error: {str(e)}"}

# Background Tasks

async def _monitor_coordinated_execution(
    execution_id: str,
    coordination_plan_id: str,
    session: AsyncSession
):
    """Monitor coordinated execution in background"""
    try:
        coordinator = IntelligentScanCoordinator()
        
        while True:
            # Check execution status
            status = await coordinator.get_coordination_status({
                "execution_id": execution_id,
                "include_details": True
            }, session)
            
            if status["status"] in ["completed", "failed", "cancelled"]:
                # Record final coordination results
                await coordinator.record_coordination_results(
                    execution_id,
                    coordination_plan_id,
                    status["final_results"],
                    session
                )
                break
            
            # Apply real-time optimizations if needed
            if status.get("optimization_needed"):
                await coordinator.apply_runtime_optimizations(
                    execution_id,
                    status["optimization_params"],
                    session
                )
            
            await asyncio.sleep(10)  # Check every 10 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring coordinated execution {execution_id}: {str(e)}")

async def _monitor_multi_system_execution(
    execution_id: str,
    target_systems: List[str],
    session: AsyncSession
):
    """Monitor multi-system execution in background"""
    try:
        coordinator = IntelligentScanCoordinator()
        
        while True:
            # Check multi-system status
            status = await coordinator.get_multi_system_status(execution_id, session)
            
            if status["overall_status"] in ["completed", "failed", "cancelled"]:
                # Consolidate results from all systems
                await coordinator.consolidate_multi_system_results(
                    execution_id,
                    target_systems,
                    session
                )
                break
            
            # Handle system-specific issues
            for system in target_systems:
                system_status = status["system_statuses"].get(system)
                if system_status and system_status.get("needs_intervention"):
                    await coordinator.handle_system_intervention(
                        execution_id,
                        system,
                        system_status["intervention_params"],
                        session
                    )
            
            await asyncio.sleep(15)  # Check every 15 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring multi-system execution {execution_id}: {str(e)}")

async def _monitor_workflow_execution(
    execution_id: str,
    workflow_id: str,
    session: AsyncSession
):
    """Monitor workflow execution in background"""
    try:
        workflow_engine = ScanWorkflowEngine()
        
        while True:
            # Check workflow status
            status = await workflow_engine.get_workflow_status(workflow_id, session)
            
            if status["status"] in ["completed", "failed", "cancelled"]:
                # Finalize workflow execution
                await workflow_engine.finalize_workflow_execution(
                    execution_id,
                    workflow_id,
                    status["final_state"],
                    session
                )
                break
            
            # Handle workflow stage transitions
            if status.get("stage_transition_needed"):
                await workflow_engine.handle_stage_transition(
                    workflow_id,
                    status["transition_params"],
                    session
                )
            
            await asyncio.sleep(20)  # Check every 20 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring workflow execution {execution_id}: {str(e)}")

# Health Check
@router.get("/health")
async def health_check():
    """Health check for scan coordination service"""
    return {
        "status": "healthy",
        "service": "scan-coordination",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "multi_system_coordination",
            "workflow_orchestration",
            "resource_coordination",
            "intelligent_scheduling",
            "real_time_monitoring",
            "dependency_management"
        ]
    }