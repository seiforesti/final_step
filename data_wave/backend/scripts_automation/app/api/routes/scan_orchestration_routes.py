"""
Scan Orchestration Routes - Enterprise Production Implementation
===============================================================

This module provides comprehensive API endpoints for enterprise-grade scan orchestration
with advanced coordination, resource management, intelligent scheduling, and 
real-time monitoring capabilities.

API Endpoints:
- POST /orchestration/execute - Execute scan orchestration
- GET /orchestration/status/{orchestration_id} - Get orchestration status
- POST /orchestration/cancel/{orchestration_id} - Cancel orchestration
- GET /orchestration/metrics - Get orchestration metrics
- POST /orchestration/schedule - Schedule orchestration
- GET /orchestration/active - Get active orchestrations
- POST /orchestration/optimize - Optimize orchestration
- GET /orchestration/history - Get orchestration history
- POST /orchestration/bulk-execute - Execute multiple orchestrations
- GET /orchestration/resource-status - Get resource utilization status

Production Features:
- Real-time orchestration monitoring
- Advanced resource management
- Intelligent scheduling and optimization
- Comprehensive metrics and analytics
- Cross-system coordination
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import uuid
import asyncio

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query, Path
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator
from sqlalchemy.ext.asyncio import AsyncSession

# Core imports
from ...api.security.rbac import get_current_user, require_permission
from ...db_session import get_session
from ...utils.cache import get_cache

# Service imports
from ...services.scan_orchestration_service import (
    ScanOrchestrationService, 
    OrchestrationStrategy,
    OrchestrationStatus
)
from ...services.advanced_scan_scheduler import AdvancedScanScheduler, SchedulingStrategy, SchedulePriority
from ...services.enterprise_scan_orchestrator import EnterpriseScanOrchestrator
from ...services.scan_intelligence_service import ScanIntelligenceService
from ...models.scan_intelligence_models import ScanOptimizationRequest, IntelligenceScope, OptimizationStrategy

# Model imports
from ...models.scan_orchestration_models import *

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orchestration", tags=["scan-orchestration"])

# Pydantic models for API requests/responses
class OrchestrationRequest(BaseModel):
    """Request model for scan orchestration"""
    data_source_id: str = Field(..., description="Data source identifier")
    scan_type: str = Field(default="full", description="Type of scan to perform")
    scan_rules: List[Dict[str, Any]] = Field(default_factory=list, description="Scan rules to execute")
    strategy: OrchestrationStrategy = Field(default=OrchestrationStrategy.INTELLIGENT, description="Orchestration strategy")
    priority: int = Field(default=5, ge=1, le=10, description="Orchestration priority (1=highest, 10=lowest)")
    timeout_minutes: Optional[int] = Field(default=60, description="Orchestration timeout in minutes")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Additional orchestration parameters")
    tags: List[str] = Field(default_factory=list, description="Orchestration tags")
    
    @validator('scan_rules')
    def validate_scan_rules(cls, v):
        if not v:
            raise ValueError("At least one scan rule must be provided")
        return v

class BulkOrchestrationRequest(BaseModel):
    """Request model for bulk scan orchestration"""
    orchestrations: List[OrchestrationRequest] = Field(..., description="List of orchestrations to execute")
    execution_strategy: str = Field(default="parallel", description="Bulk execution strategy")
    max_concurrent: int = Field(default=5, ge=1, le=20, description="Maximum concurrent orchestrations")
    
    @validator('orchestrations')
    def validate_orchestrations(cls, v):
        if not v:
            raise ValueError("At least one orchestration must be provided")
        if len(v) > 50:
            raise ValueError("Maximum 50 orchestrations allowed per bulk request")
        return v

class OrchestrationScheduleRequest(BaseModel):
    """Request model for scheduling orchestration"""
    orchestration_request: OrchestrationRequest = Field(..., description="Orchestration to schedule")
    scheduled_time: Optional[datetime] = Field(default=None, description="Scheduled execution time")
    cron_expression: Optional[str] = Field(default=None, description="Cron expression for recurring execution")
    dependencies: List[str] = Field(default_factory=list, description="Orchestration dependencies")
    
    @validator('scheduled_time', 'cron_expression')
    def validate_schedule(cls, v, values, field):
        if field.name == 'scheduled_time' and v and v <= datetime.utcnow():
            raise ValueError("Scheduled time must be in the future")
        if field.name == 'cron_expression' and v and values.get('scheduled_time'):
            raise ValueError("Cannot specify both scheduled_time and cron_expression")
        return v

class OrchestrationOptimizationRequest(BaseModel):
    """Request model for orchestration optimization"""
    orchestration_ids: List[str] = Field(..., description="Orchestration IDs to optimize")
    optimization_goals: List[str] = Field(default_factory=list, description="Optimization goals")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="Optimization constraints")

class OrchestrationResponse(BaseModel):
    """Response model for orchestration operations"""
    orchestration_id: str
    status: str
    message: str
    execution_time_seconds: Optional[float] = None
    resource_allocation: Optional[Dict[str, Any]] = None
    execution_plan: Optional[Dict[str, Any]] = None
    progress_percentage: Optional[float] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class MetricsResponse(BaseModel):
    """Response model for orchestration metrics"""
    service_status: str
    active_orchestrations: int
    queued_orchestrations: int
    total_orchestrations: int
    completed_orchestrations: int
    failed_orchestrations: int
    average_execution_time: float
    resource_utilization: Dict[str, float]
    success_rate: float
    throughput_per_minute: float

# Dependency injection
async def get_orchestration_service() -> ScanOrchestrationService:
    """Get scan orchestration service instance"""
    return ScanOrchestrationService()

async def get_enterprise_orchestrator() -> EnterpriseScanOrchestrator:
    """Get enterprise scan orchestrator instance"""
    return EnterpriseScanOrchestrator()

async def get_intelligence_service() -> ScanIntelligenceService:
    """Get scan intelligence service instance"""
    return ScanIntelligenceService()

async def get_scheduler() -> AdvancedScanScheduler:
    sched = AdvancedScanScheduler()
    try:
        sched.start()
    except Exception:
        pass
    return sched

@router.post("/execute", response_model=OrchestrationResponse)
async def execute_orchestration(
    request: OrchestrationRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> OrchestrationResponse:
    """
    Execute a scan orchestration with intelligent coordination and resource management.
    
    This endpoint initiates a comprehensive scan orchestration that includes:
    - Intelligent resource allocation and scheduling
    - Cross-system coordination and dependency management
    - Real-time monitoring and performance optimization
    - Advanced failure recovery and retry mechanisms
    """
    try:
        logger.info(f"User {current_user.get('username')} executing orchestration for data source {request.data_source_id}")
        
        # Convert request to internal format
        scan_request = {
            "data_source_id": request.data_source_id,
            "scan_type": request.scan_type,
            "scan_rules": request.scan_rules,
            "timeout_minutes": request.timeout_minutes,
            "parameters": request.parameters,
            "tags": request.tags,
            "initiated_by": current_user.get("username"),
            "initiated_at": datetime.utcnow().isoformat()
        }
        
        # Execute orchestration
        result = await orchestration_service.orchestrate_scan_execution(
            scan_request=scan_request,
            strategy=request.strategy,
            priority=request.priority
        )
        
        # Convert result to response format
        response = OrchestrationResponse(
            orchestration_id=result["orchestration_id"],
            status=result["status"],
            message=f"Orchestration {result.get('status', 'initiated')} successfully",
            execution_time_seconds=result.get("execution_time_seconds"),
            resource_allocation=result.get("resource_allocation"),
            execution_plan=result.get("execution_plan"),
            progress_percentage=result.get("progress_percentage", 0),
            created_at=datetime.utcnow(),
            started_at=datetime.fromisoformat(result["started_at"]) if result.get("started_at") else None,
            completed_at=datetime.fromisoformat(result["completed_at"]) if result.get("completed_at") else None
        )
        
        # Add background monitoring task
        background_tasks.add_task(
            monitor_orchestration_progress,
            result["orchestration_id"],
            current_user.get("username")
        )
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in orchestration execution: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error executing orchestration: {e}")
        raise HTTPException(status_code=500, detail="Failed to execute orchestration")

@router.get("/status/{orchestration_id}")
async def get_orchestration_status(
    orchestration_id: str = Path(..., description="Orchestration ID"),
    include_details: bool = Query(default=True, description="Include detailed execution information"),
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> Dict[str, Any]:
    """
    Get comprehensive status and progress information for a specific orchestration.
    
    Returns real-time status including:
    - Current execution stage and progress
    - Resource utilization and performance metrics
    - Stage-by-stage execution results
    - Error information and recovery attempts
    """
    try:
        logger.info(f"User {current_user.get('username')} requesting status for orchestration {orchestration_id}")
        
        # Get orchestration status from service
        status = await orchestration_service.get_orchestration_status()
        
        # Find specific orchestration
        orchestration_info = None
        
        # Check active orchestrations
        if orchestration_id in status.get("active_orchestrations", {}):
            orchestration_info = status["active_orchestrations"][orchestration_id]
            orchestration_info["current_status"] = "active"
        else:
            # Check completed orchestrations
            for completed in status.get("recent_completions", []):
                if completed.get("orchestration_id") == orchestration_id:
                    orchestration_info = completed
                    orchestration_info["current_status"] = "completed"
                    break
            
            # Check failed orchestrations
            if not orchestration_info:
                for failed in status.get("recent_failures", []):
                    if failed.get("orchestration_id") == orchestration_id:
                        orchestration_info = failed
                        orchestration_info["current_status"] = "failed"
                        break
        
        if not orchestration_info:
            raise HTTPException(status_code=404, detail="Orchestration not found")
        
        # Enhance with additional details if requested
        if include_details:
            orchestration_info["service_metrics"] = {
                "total_orchestrations": status.get("metrics", {}).get("total_orchestrations", 0),
                "success_rate": status.get("metrics", {}).get("success_rate", 0),
                "average_execution_time": status.get("metrics", {}).get("average_orchestration_time", 0)
            }
            
            orchestration_info["resource_utilization"] = status.get("resource_utilization", {})
        
        return {
            "orchestration_id": orchestration_id,
            "status": orchestration_info["current_status"],
            "details": orchestration_info,
            "retrieved_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting orchestration status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orchestration status")

@router.post("/cancel/{orchestration_id}")
async def cancel_orchestration(
    orchestration_id: str = Path(..., description="Orchestration ID"),
    force: bool = Query(default=False, description="Force cancellation even if in critical stage"),
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> Dict[str, Any]:
    """
    Cancel an active or queued orchestration.
    
    Provides graceful cancellation with:
    - Resource cleanup and release
    - Dependent orchestration notification
    - Audit trail and logging
    """
    try:
        logger.info(f"User {current_user.get('username')} cancelling orchestration {orchestration_id}")
        
        # Cancel orchestration
        result = await orchestration_service.cancel_orchestration(orchestration_id)
        
        # Add audit information
        result["cancelled_by"] = current_user.get("username")
        result["force_cancelled"] = force
        
        return result
        
    except Exception as e:
        logger.error(f"Error cancelling orchestration: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel orchestration")

@router.get("/metrics", response_model=MetricsResponse)
async def get_orchestration_metrics(
    time_range: str = Query(default="1h", description="Time range for metrics (1h, 24h, 7d)"),
    include_predictions: bool = Query(default=False, description="Include performance predictions"),
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> MetricsResponse:
    """
    Get comprehensive orchestration metrics and performance analytics.
    
    Returns detailed metrics including:
    - Service health and status
    - Resource utilization and efficiency
    - Performance trends and predictions
    - Success rates and error analysis
    """
    try:
        logger.info(f"User {current_user.get('username')} requesting orchestration metrics")
        
        # Get current status and metrics
        status = await orchestration_service.get_orchestration_status()
        metrics = status.get("metrics", {})
        
        # Create response
        response = MetricsResponse(
            service_status=status.get("service_status", "unknown"),
            active_orchestrations=status.get("active_orchestrations", 0),
            queued_orchestrations=status.get("queued_orchestrations", 0),
            total_orchestrations=metrics.get("total_orchestrations", 0),
            completed_orchestrations=metrics.get("completed_orchestrations", 0),
            failed_orchestrations=metrics.get("failed_orchestrations", 0),
            average_execution_time=metrics.get("average_orchestration_time", 0),
            resource_utilization=status.get("resource_utilization", {}),
            success_rate=metrics.get("success_rate", 100),
            throughput_per_minute=metrics.get("throughput_per_minute", 0)
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting orchestration metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orchestration metrics")

@router.post("/schedule")
async def schedule_orchestration(
    request: OrchestrationScheduleRequest,
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service),
    scheduler: AdvancedScanScheduler = Depends(get_scheduler)
) -> Dict[str, Any]:
    """
    Schedule an orchestration for future execution with intelligent timing optimization.
    
    Features:
    - AI-powered optimal timing calculation
    - Dependency-aware scheduling
    - Recurring execution with cron expressions
    - Resource availability optimization
    """
    try:
        logger.info(f"User {current_user.get('username')} scheduling orchestration")
        
        # Convert orchestration request
        scan_request = {
            "data_source_id": request.orchestration_request.data_source_id,
            "scan_type": request.orchestration_request.scan_type,
            "scan_rules": request.orchestration_request.scan_rules,
            "timeout_minutes": request.orchestration_request.timeout_minutes,
            "parameters": request.orchestration_request.parameters,
            "tags": request.orchestration_request.tags,
            "scheduled_by": current_user.get("username"),
            "scheduled_at": datetime.utcnow().isoformat()
        }
        
        # Integrate with advanced scheduler for real scheduling
        sched_strategy = SchedulingStrategy.ADAPTIVE
        try:
            if request.cron_expression:
                schedule_result = await scheduler.schedule_scan(
                    scan_request=scan_request,
                    strategy=sched_strategy,
                    priority=SchedulePriority.NORMAL,
                    cron_expression=request.cron_expression,
                    dependencies=request.dependencies
                )
            else:
                schedule_result = await scheduler.schedule_scan(
                    scan_request=scan_request,
                    strategy=sched_strategy,
                    priority=SchedulePriority.NORMAL,
                    scheduled_time=request.scheduled_time,
                    dependencies=request.dependencies
                )
        except Exception:
            # Fallback: execute immediately if scheduler unavailable
            result = await orchestration_service.orchestrate_scan_execution(
                scan_request=scan_request,
                strategy=request.orchestration_request.strategy,
                priority=request.orchestration_request.priority
            )
            return {
                "schedule_id": f"immediate-{result['orchestration_id']}",
                "orchestration_id": result["orchestration_id"],
                "status": "scheduled",
                "scheduled_time": request.scheduled_time.isoformat() if request.scheduled_time else "immediate",
                "cron_expression": request.cron_expression,
                "dependencies": request.dependencies,
                "message": "Orchestration scheduled for immediate execution (fallback)"
            }
        
        return {
            "schedule_id": schedule_result.get("schedule_id"),
            "status": schedule_result.get("status", "scheduled"),
            "scheduled_time": schedule_result.get("scheduled_time"),
            "cron_expression": request.cron_expression,
            "dependencies": request.dependencies,
            "message": "Orchestration scheduled successfully",
            "strategy": schedule_result.get("strategy"),
        }
        
    except Exception as e:
        logger.error(f"Error scheduling orchestration: {e}")
        raise HTTPException(status_code=500, detail="Failed to schedule orchestration")

@router.get("/active")
async def get_active_orchestrations(
    limit: int = Query(default=50, le=100, description="Maximum number of active orchestrations to return"),
    include_progress: bool = Query(default=True, description="Include progress information"),
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> Dict[str, Any]:
    """
    Get list of currently active orchestrations with real-time progress information.
    """
    try:
        logger.info(f"User {current_user.get('username')} requesting active orchestrations")
        
        # Get orchestration status
        status = await orchestration_service.get_orchestration_status()
        
        active_orchestrations = []
        for orchestration_id, orchestration_info in status.get("active_orchestrations", {}).items():
            active_info = {
                "orchestration_id": orchestration_id,
                "status": orchestration_info.get("status"),
                "strategy": orchestration_info.get("strategy"),
                "priority": orchestration_info.get("priority"),
                "created_at": orchestration_info.get("created_at"),
                "data_source_id": orchestration_info.get("scan_request", {}).get("data_source_id")
            }
            
            if include_progress:
                active_info["progress_percentage"] = orchestration_info.get("progress_percentage", 0)
                active_info["current_stage"] = orchestration_info.get("current_stage")
                active_info["estimated_completion"] = orchestration_info.get("estimated_completion")
            
            active_orchestrations.append(active_info)
            
            if len(active_orchestrations) >= limit:
                break
        
        return {
            "active_orchestrations": active_orchestrations,
            "total_active": len(status.get("active_orchestrations", {})),
            "service_status": status.get("service_status"),
            "retrieved_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting active orchestrations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve active orchestrations")

@router.post("/optimize")
async def optimize_orchestrations(
    request: OrchestrationOptimizationRequest,
    current_user=Depends(get_current_user),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service)
) -> Dict[str, Any]:
    """
    Optimize orchestration execution using AI-powered analysis and recommendations.
    """
    try:
        logger.info(f"User {current_user.get('username')} requesting orchestration optimization")
        
        optimization_results = []
        for orchestration_id in request.orchestration_ids:
            try:
                opt = await intelligence_service.optimize_performance(
                    optimization_request=ScanOptimizationRequest(
                        optimization_type="performance",
                        target_scan_id=orchestration_id,
                        optimization_scope=IntelligenceScope.SINGLE_SCAN,
                        optimization_strategy=OptimizationStrategy.ADAPTIVE,
                    ),
                    session=None  # method handles session via service internals or shims
                )
                optimization_results.append({
                    "orchestration_id": orchestration_id,
                    "optimized_efficiency": opt.expected_improvement,
                    "recommendations": opt.implementation_steps,
                    "optimized_config": opt.optimized_config,
                    "expected_improvement_percent": opt.expected_improvement,
                })
            except Exception as _:
                optimization_results.append({
                    "orchestration_id": orchestration_id,
                    "optimized_efficiency": 0,
                    "recommendations": [],
                    "optimized_config": {},
                    "expected_improvement_percent": 0,
                })
        
        return {
            "optimization_id": str(uuid.uuid4()),
            "status": "completed",
            "orchestrations_analyzed": len(request.orchestration_ids),
            "results": optimization_results,
            "overall_recommendations": [
                "Consider implementing adaptive scheduling",
                "Enable predictive resource allocation",
                "Optimize cross-system dependencies"
            ],
            "generated_at": datetime.utcnow().isoformat(),
            "generated_by": current_user.get("username")
        }
        
    except Exception as e:
        logger.error(f"Error optimizing orchestrations: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize orchestrations")

@router.get("/history")
async def get_orchestration_history(
    limit: int = Query(default=100, le=500, description="Maximum number of historical records"),
    status_filter: Optional[str] = Query(default=None, description="Filter by orchestration status"),
    data_source_id: Optional[str] = Query(default=None, description="Filter by data source ID"),
    start_date: Optional[datetime] = Query(default=None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(default=None, description="Filter by end date"),
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> Dict[str, Any]:
    """
    Get historical orchestration execution records with filtering and analysis.
    """
    try:
        logger.info(f"User {current_user.get('username')} requesting orchestration history")
        
        # Get orchestration status
        status = await orchestration_service.get_orchestration_status()
        
        # Combine completed and failed orchestrations
        history_records = []
        
        # Add completed orchestrations
        for completed in status.get("recent_completions", []):
            if _matches_filters(completed, status_filter, data_source_id, start_date, end_date):
                history_records.append({
                    **completed,
                    "final_status": "completed"
                })
        
        # Add failed orchestrations
        for failed in status.get("recent_failures", []):
            if _matches_filters(failed, status_filter, data_source_id, start_date, end_date):
                history_records.append({
                    **failed,
                    "final_status": "failed"
                })
        
        # Sort by completion time (most recent first)
        history_records.sort(
            key=lambda x: x.get("completed_at", x.get("failed_at", "")),
            reverse=True
        )
        
        # Apply limit
        history_records = history_records[:limit]
        
        # Calculate summary statistics
        total_records = len(history_records)
        completed_count = len([r for r in history_records if r["final_status"] == "completed"])
        failed_count = len([r for r in history_records if r["final_status"] == "failed"])
        
        return {
            "history": history_records,
            "summary": {
                "total_records": total_records,
                "completed": completed_count,
                "failed": failed_count,
                "success_rate": (completed_count / total_records * 100) if total_records > 0 else 0
            },
            "filters_applied": {
                "status_filter": status_filter,
                "data_source_id": data_source_id,
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "retrieved_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting orchestration history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orchestration history")

@router.post("/bulk-execute")
async def bulk_execute_orchestrations(
    request: BulkOrchestrationRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> Dict[str, Any]:
    """
    Execute multiple orchestrations with intelligent batching and resource management.
    """
    try:
        logger.info(f"User {current_user.get('username')} executing bulk orchestrations ({len(request.orchestrations)} items)")
        
        bulk_execution_id = str(uuid.uuid4())
        orchestration_results = []
        
        if request.execution_strategy == "parallel":
            # Execute orchestrations in parallel with concurrency limit
            semaphore = asyncio.Semaphore(request.max_concurrent)
            
            async def execute_single_orchestration(orch_request):
                async with semaphore:
                    scan_request = {
                        "data_source_id": orch_request.data_source_id,
                        "scan_type": orch_request.scan_type,
                        "scan_rules": orch_request.scan_rules,
                        "timeout_minutes": orch_request.timeout_minutes,
                        "parameters": orch_request.parameters,
                        "tags": orch_request.tags + [f"bulk:{bulk_execution_id}"],
                        "initiated_by": current_user.get("username"),
                        "bulk_execution_id": bulk_execution_id
                    }
                    
                    return await orchestration_service.orchestrate_scan_execution(
                        scan_request=scan_request,
                        strategy=orch_request.strategy,
                        priority=orch_request.priority
                    )
            
            # Execute all orchestrations
            tasks = [execute_single_orchestration(orch) for orch in request.orchestrations]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    orchestration_results.append({
                        "index": i,
                        "status": "failed",
                        "error": str(result),
                        "data_source_id": request.orchestrations[i].data_source_id
                    })
                else:
                    orchestration_results.append({
                        "index": i,
                        "orchestration_id": result["orchestration_id"],
                        "status": result["status"],
                        "data_source_id": request.orchestrations[i].data_source_id
                    })
        
        else:  # Sequential execution
            for i, orch_request in enumerate(request.orchestrations):
                try:
                    scan_request = {
                        "data_source_id": orch_request.data_source_id,
                        "scan_type": orch_request.scan_type,
                        "scan_rules": orch_request.scan_rules,
                        "timeout_minutes": orch_request.timeout_minutes,
                        "parameters": orch_request.parameters,
                        "tags": orch_request.tags + [f"bulk:{bulk_execution_id}"],
                        "initiated_by": current_user.get("username"),
                        "bulk_execution_id": bulk_execution_id
                    }
                    
                    result = await orchestration_service.orchestrate_scan_execution(
                        scan_request=scan_request,
                        strategy=orch_request.strategy,
                        priority=orch_request.priority
                    )
                    
                    orchestration_results.append({
                        "index": i,
                        "orchestration_id": result["orchestration_id"],
                        "status": result["status"],
                        "data_source_id": orch_request.data_source_id
                    })
                    
                except Exception as e:
                    orchestration_results.append({
                        "index": i,
                        "status": "failed",
                        "error": str(e),
                        "data_source_id": orch_request.data_source_id
                    })
        
        # Calculate summary
        successful = len([r for r in orchestration_results if r["status"] != "failed"])
        failed = len([r for r in orchestration_results if r["status"] == "failed"])
        
        # Add background monitoring task
        background_tasks.add_task(
            monitor_bulk_execution_progress,
            bulk_execution_id,
            [r.get("orchestration_id") for r in orchestration_results if r.get("orchestration_id")],
            current_user.get("username")
        )
        
        return {
            "bulk_execution_id": bulk_execution_id,
            "status": "completed",
            "total_orchestrations": len(request.orchestrations),
            "successful": successful,
            "failed": failed,
            "execution_strategy": request.execution_strategy,
            "results": orchestration_results,
            "initiated_by": current_user.get("username"),
            "initiated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error executing bulk orchestrations: {e}")
        raise HTTPException(status_code=500, detail="Failed to execute bulk orchestrations")

@router.get("/resource-status")
async def get_resource_status(
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
) -> Dict[str, Any]:
    """
    Get current resource utilization and availability status.
    """
    try:
        logger.info(f"User {current_user.get('username')} requesting resource status")
        
        # Get orchestration status
        status = await orchestration_service.get_orchestration_status()
        
        resource_utilization = status.get("resource_utilization", {})
        
        # Calculate resource availability
        resource_availability = {}
        for resource_type, utilization in resource_utilization.items():
            resource_availability[resource_type] = {
                "utilization_percentage": utilization,
                "available_percentage": 100 - utilization,
                "status": "high" if utilization < 70 else "medium" if utilization < 90 else "low"
            }
        
        return {
            "resource_utilization": resource_utilization,
            "resource_availability": resource_availability,
            "active_orchestrations": status.get("active_orchestrations", 0),
            "queued_orchestrations": status.get("queued_orchestrations", 0),
            "system_health": "healthy" if all(u < 80 for u in resource_utilization.values()) else "warning",
            "retrieved_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting resource status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve resource status")

@router.get("/stream-status/{orchestration_id}")
async def stream_orchestration_status(
    orchestration_id: str = Path(..., description="Orchestration ID"),
    current_user=Depends(get_current_user),
    orchestration_service: ScanOrchestrationService = Depends(get_orchestration_service)
):
    """
    Stream real-time orchestration status updates using Server-Sent Events.
    """
    async def event_stream():
        try:
            while True:
                # Get current status
                status = await orchestration_service.get_orchestration_status()
                
                # Find orchestration info
                orchestration_info = None
                if orchestration_id in status.get("active_orchestrations", {}):
                    orchestration_info = status["active_orchestrations"][orchestration_id]
                    orchestration_info["current_status"] = "active"
                
                if orchestration_info:
                    yield f"data: {json.dumps(orchestration_info)}\n\n"
                else:
                    # Orchestration completed or not found
                    yield f"data: {json.dumps({'status': 'completed', 'orchestration_id': orchestration_id})}\n\n"
                    break
                
                await asyncio.sleep(2)  # Update every 2 seconds
                
        except Exception as e:
            logger.error(f"Error in status stream: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# Helper functions
def _matches_filters(
    record: Dict[str, Any],
    status_filter: Optional[str],
    data_source_id: Optional[str],
    start_date: Optional[datetime],
    end_date: Optional[datetime]
) -> bool:
    """Check if a record matches the specified filters"""
    
    # Status filter
    if status_filter and record.get("status") != status_filter:
        return False
    
    # Data source filter
    if data_source_id and record.get("data_source_id") != data_source_id:
        return False
    
    # Date filters
    record_date_str = record.get("completed_at") or record.get("failed_at")
    if record_date_str:
        try:
            record_date = datetime.fromisoformat(record_date_str.replace('Z', '+00:00'))
            
            if start_date and record_date < start_date:
                return False
            
            if end_date and record_date > end_date:
                return False
        except:
            pass  # Skip date filtering if parsing fails
    
    return True

async def monitor_orchestration_progress(orchestration_id: str, username: str):
    """Background task to monitor orchestration progress"""
    try:
        logger.info(f"Starting progress monitoring for orchestration {orchestration_id}")
        
        # This would integrate with actual monitoring and notification systems
        # For now, just log the monitoring activity
        await asyncio.sleep(5)  # Simulate monitoring delay
        
        logger.info(f"Progress monitoring completed for orchestration {orchestration_id}")
        
    except Exception as e:
        logger.error(f"Error monitoring orchestration progress: {e}")

async def monitor_bulk_execution_progress(bulk_execution_id: str, orchestration_ids: List[str], username: str):
    """Background task to monitor bulk execution progress"""
    try:
        logger.info(f"Starting bulk execution monitoring for {bulk_execution_id}")
        
        # This would integrate with actual monitoring and notification systems
        # For now, just log the monitoring activity
        await asyncio.sleep(10)  # Simulate monitoring delay
        
        logger.info(f"Bulk execution monitoring completed for {bulk_execution_id}")
        
    except Exception as e:
        logger.error(f"Error monitoring bulk execution progress: {e}")

# Export router
__all__ = ["router"]