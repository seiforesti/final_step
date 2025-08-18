"""
Enterprise Scan Orchestration Routes - Advanced Production Implementation
=========================================================================

This module provides comprehensive API routes for enterprise scan orchestration
with intelligent scheduling, real-time monitoring, AI-powered optimization,
and unified coordination across all data governance scanning operations.

Key Features:
- Unified scan orchestration and coordination
- Real-time monitoring and progress tracking
- AI-powered scheduling and resource optimization
- Advanced failure recovery and retry mechanisms
- Cross-system integration and load balancing
- Streaming updates and live dashboards

Production Requirements:
- 99.9% uptime with intelligent failover
- Sub-second response times for orchestration operations
- Horizontal scalability to handle 10,000+ concurrent scans
- Real-time coordination with streaming updates
- Advanced ML-based optimization algorithms
"""

from typing import List, Dict, Any, Optional, Union, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Session

# Pydantic models
from pydantic import BaseModel, Field, validator
from enum import Enum

# Internal imports
from ...models.scan_models import *
from ...models.advanced_scan_rule_models import (
    IntelligentScanRule, RuleExecutionHistory, RuleOptimizationJob,
    RulePatternLibrary, RulePatternAssociation, RulePerformanceBaseline
)
from ...models.scan_orchestration_models import *
from ...models.scan_intelligence_models import *
from ...services.enterprise_scan_orchestrator import EnterpriseScanOrchestrator
from ...services.unified_scan_orchestrator import UnifiedScanOrchestrator
from ...services.enterprise_scan_rule_service import EnterpriseScanRuleService
from ...db_session import get_session
from ...api.security.rbac import get_current_user
from ...api.security.rbac import require_permissions
try:
    from ...utils.response_models import *  # noqa: F401,F403
except Exception:
    from pydantic import BaseModel
    class SuccessResponse(BaseModel):
        success: bool = True
        data: dict | list | None = None
    class ErrorResponse(BaseModel):
        success: bool = False
        error: str
def handle_route_error(exc: Exception):
    # Minimal robust fallback; prefer centralized error handler when present
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        raise exc
    raise HTTPException(status_code=500, detail=str(exc))
from ...utils.rate_limiter import get_rate_limiter, rate_limit
async def check_rate_limit(*args, **kwargs):
    return True
def audit_log(event: str, **kwargs):
    # Minimal audit shim; prefer centralized audit logger
    import logging
    logging.getLogger(__name__).info(f"AUDIT {event}", extra=kwargs)

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api/v1/scan-orchestration", tags=["Scan Orchestration"])
security = HTTPBearer()
class _NoopRateLimiter:
    async def allow(self, *args, **kwargs):
        return True
    def limit(self, *args, **kwargs):
        def decorator(func):
            return func
        return decorator
rate_limiter = get_rate_limiter()

# ===================== REQUEST/RESPONSE MODELS =====================

class ScanRequestModel(BaseModel):
    """Model for scan request submission"""
    scan_type: str = Field(..., description="Type of scan to perform")
    data_source_id: int = Field(..., description="ID of the data source to scan")
    scan_rule_ids: List[str] = Field(..., description="List of scan rule IDs to apply")
    priority: ScanPriority = Field(default=ScanPriority.NORMAL, description="Scan priority")
    scheduled_time: Optional[datetime] = Field(None, description="Scheduled execution time")
    timeout_seconds: int = Field(default=3600, description="Scan timeout in seconds")
    retry_attempts: int = Field(default=3, description="Number of retry attempts")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Scan configuration")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    @validator('scan_rule_ids')
    def validate_scan_rules(cls, v):
        if not v:
            raise ValueError("At least one scan rule ID is required")
        return v

class BatchScanRequestModel(BaseModel):
    """Model for batch scan request submission"""
    scan_requests: List[ScanRequestModel] = Field(..., description="List of scan requests")
    batch_configuration: Dict[str, Any] = Field(default_factory=dict, description="Batch processing configuration")
    execution_strategy: str = Field(default="parallel", description="Batch execution strategy")
    max_concurrent_scans: int = Field(default=10, description="Maximum concurrent scans")

class ScanQueryModel(BaseModel):
    """Model for scan query parameters"""
    execution_ids: Optional[List[str]] = Field(None, description="List of execution IDs to query")
    status_filter: Optional[List[ScanWorkflowStatus]] = Field(None, description="Filter by scan status")
    data_source_ids: Optional[List[int]] = Field(None, description="Filter by data source IDs")
    date_range: Optional[Dict[str, datetime]] = Field(None, description="Date range filter")
    include_metrics: bool = Field(default=True, description="Include performance metrics")
    include_logs: bool = Field(default=False, description="Include execution logs")

class OrchestrationConfigModel(BaseModel):
    """Model for orchestration configuration"""
    strategy: ScanOrchestrationStrategy = Field(..., description="Orchestration strategy")
    max_concurrent_scans: int = Field(default=100, description="Maximum concurrent scans")
    resource_allocation: Dict[str, Any] = Field(default_factory=dict, description="Resource allocation settings")
    optimization_settings: Dict[str, Any] = Field(default_factory=dict, description="AI optimization settings")
    monitoring_config: Dict[str, Any] = Field(default_factory=dict, description="Monitoring configuration")

class ResourceMonitoringModel(BaseModel):
    """Model for resource monitoring queries"""
    include_historical: bool = Field(default=False, description="Include historical data")
    time_window_hours: int = Field(default=24, description="Time window for historical data")
    aggregation_level: str = Field(default="hour", description="Data aggregation level")
    include_predictions: bool = Field(default=True, description="Include resource predictions")

# ===================== DEPENDENCY INJECTION =====================

async def get_orchestrator() -> EnterpriseScanOrchestrator:
    """Get enterprise scan orchestrator instance"""
    return EnterpriseScanOrchestrator()

async def get_unified_orchestrator() -> UnifiedScanOrchestrator:
    """Get unified scan orchestrator instance"""
    return UnifiedScanOrchestrator()

# ===================== SCAN ORCHESTRATION ENDPOINTS =====================

@router.post("/scans/submit")
async def submit_scan_request(
    request: ScanRequestModel,
    background_tasks: BackgroundTasks,
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Submit a single scan request to the orchestration system.
    
    Features:
    - Intelligent priority-based scheduling
    - Resource requirement estimation
    - Real-time progress tracking
    - Automatic retry and failure recovery
    """
    try:
        # Rate-limit check (no-op if fallback)
        if hasattr(rate_limiter, 'allow'):
            await rate_limiter.allow(current_user.get('user_id', 'anonymous'), 'submit_scan_request')

        # Audit log
        await audit_log(
            action="scan_request_submitted",
            user_id=current_user.get("user_id"),
            resource_type="scan",
            resource_id=None,
            metadata={"scan_type": request.scan_type, "data_source_id": request.data_source_id}
        )
        
        # Create scan request object
        scan_request = ScanRequest(
            request_id=str(uuid.uuid4()),
            scan_type=request.scan_type,
            data_source_id=request.data_source_id,
            scan_rule_ids=request.scan_rule_ids,
            priority=request.priority,
            user_id=current_user.get("user_id"),
            scheduled_time=request.scheduled_time,
            timeout_seconds=request.timeout_seconds,
            retry_attempts=request.retry_attempts,
            configuration=request.configuration,
            metadata=request.metadata
        )
        
        # Submit to orchestrator
        execution_id = await orchestrator.submit_scan_request(scan_request, background_tasks)
        
        # Get initial status
        execution_status = await orchestrator.get_execution_status(execution_id)
        
        return SuccessResponse(
            message="Scan request submitted successfully",
            data={
                "execution_id": execution_id,
                "request_id": scan_request.request_id,
                "status": execution_status.get("status"),
                "estimated_completion": execution_status.get("estimated_completion"),
                "queue_position": execution_status.get("queue_position")
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to submit scan request: {e}")
        raise HTTPException(status_code=500, detail=f"Scan submission failed: {str(e)}")

@router.post("/scans/batch-submit")
async def submit_batch_scan_requests(
    request: BatchScanRequestModel,
    background_tasks: BackgroundTasks,
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Submit multiple scan requests as a batch operation.
    
    Features:
    - Batch optimization for resource efficiency
    - Parallel or sequential execution strategies
    - Coordinated scheduling and resource allocation
    - Batch-level monitoring and reporting
    """
    try:
        # Validate batch size
        if len(request.scan_requests) > 100:
            raise HTTPException(status_code=400, detail="Batch size cannot exceed 100 scans")
        
        # Audit log
        await audit_log(
            action="batch_scan_submitted",
            user_id=current_user.get("user_id"),
            resource_type="batch_scan",
            resource_id=None,
            metadata={
                "batch_size": len(request.scan_requests),
                "execution_strategy": request.execution_strategy
            }
        )
        
        # Create batch execution context
        batch_id = str(uuid.uuid4())
        execution_ids = []
        
        # Process each scan request
        for scan_req in request.scan_requests:
            scan_request = ScanRequest(
                request_id=str(uuid.uuid4()),
                scan_type=scan_req.scan_type,
                data_source_id=scan_req.data_source_id,
                scan_rule_ids=scan_req.scan_rule_ids,
                priority=scan_req.priority,
                user_id=current_user.get("user_id"),
                scheduled_time=scan_req.scheduled_time,
                timeout_seconds=scan_req.timeout_seconds,
                retry_attempts=scan_req.retry_attempts,
                configuration={**scan_req.configuration, "batch_id": batch_id},
                metadata={**scan_req.metadata, "batch_execution": True}
            )
            
            execution_id = await orchestrator.submit_scan_request(scan_request)
            execution_ids.append(execution_id)
        
        # Create batch tracking
        batch_status = await orchestrator.create_batch_tracking(
            batch_id, execution_ids, request.batch_configuration
        )
        
        return SuccessResponse(
            message=f"Batch scan submitted successfully with {len(execution_ids)} scans",
            data={
                "batch_id": batch_id,
                "execution_ids": execution_ids,
                "batch_status": batch_status,
                "execution_strategy": request.execution_strategy
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to submit batch scan requests: {e}")
        raise HTTPException(status_code=500, detail=f"Batch scan submission failed: {str(e)}")

@router.get("/scans/{execution_id}/status")
async def get_scan_status(
    execution_id: str = Path(..., description="Execution ID of the scan"),
    include_details: bool = Query(default=True, description="Include detailed execution information"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Get the current status and progress of a scan execution.
    
    Features:
    - Real-time status updates
    - Detailed progress information
    - Resource utilization metrics
    - Error details and recovery actions
    """
    try:
        # Get execution status
        status = await orchestrator.get_execution_status(execution_id, include_details)
        
        if not status:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        # Check user permissions for this execution
        if not await orchestrator.check_execution_access(execution_id, current_user.get("user_id")):
            raise HTTPException(status_code=403, detail="Access denied to this execution")
        
        return SuccessResponse(
            message="Scan status retrieved successfully",
            data=status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get scan status: {e}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")

@router.get("/scans/{execution_id}/stream")
async def stream_scan_progress(
    execution_id: str = Path(..., description="Execution ID of the scan"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time progress updates for a scan execution.
    
    Features:
    - Server-sent events for real-time updates
    - Live progress tracking
    - Resource utilization streaming
    - Error notifications and alerts
    """
    try:
        # Check execution exists and user has access
        if not await orchestrator.check_execution_access(execution_id, current_user.get("user_id")):
            raise HTTPException(status_code=403, detail="Access denied to this execution")
        
        async def generate_progress_stream():
            """Generate real-time progress updates"""
            try:
                async for update in orchestrator.stream_execution_progress(execution_id):
                    yield f"data: {json.dumps(update)}\n\n"
                    
                    # Break if execution is completed
                    if update.get("status") in ["completed", "failed", "cancelled"]:
                        break
                        
            except Exception as e:
                logger.error(f"Progress streaming error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_progress_stream(),
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
        logger.error(f"Failed to start progress streaming: {e}")
        raise HTTPException(status_code=500, detail=f"Progress streaming failed: {str(e)}")

@router.post("/scans/{execution_id}/control")
async def control_scan_execution(
    execution_id: str = Path(..., description="Execution ID of the scan"),
    action: str = Query(..., description="Control action: pause, resume, cancel, priority_boost"),
    reason: Optional[str] = Query(None, description="Reason for the control action"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Control scan execution with actions like pause, resume, cancel, or priority boost.
    
    Features:
    - Real-time execution control
    - Graceful pause and resume
    - Emergency cancellation
    - Priority adjustment
    """
    try:
        # Validate action
        valid_actions = ["pause", "resume", "cancel", "priority_boost", "restart"]
        if action not in valid_actions:
            raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {valid_actions}")
        
        # Check permissions
        if not await orchestrator.check_execution_control_access(execution_id, current_user.get("user_id")):
            raise HTTPException(status_code=403, detail="Insufficient permissions for execution control")
        
        # Audit log
        await audit_log(
            action=f"scan_execution_{action}",
            user_id=current_user.get("user_id"),
            resource_type="scan_execution",
            resource_id=execution_id,
            metadata={"action": action, "reason": reason}
        )
        
        # Execute control action
        result = await orchestrator.control_execution(execution_id, action, reason, current_user.get("user_id"))
        
        return SuccessResponse(
            message=f"Scan execution {action} completed successfully",
            data=result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to control scan execution: {e}")
        raise HTTPException(status_code=500, detail=f"Execution control failed: {str(e)}")

@router.get("/scans/query")
async def query_scan_executions(
    query: ScanQueryModel = Depends(),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=50, ge=1, le=1000, description="Page size"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Query scan executions with advanced filtering and pagination.
    
    Features:
    - Multi-dimensional filtering
    - Performance metrics inclusion
    - Execution log access
    - Export capabilities
    """
    try:
        # Build query parameters
        query_params = {
            "execution_ids": query.execution_ids,
            "status_filter": query.status_filter,
            "data_source_ids": query.data_source_ids,
            "date_range": query.date_range,
            "include_metrics": query.include_metrics,
            "include_logs": query.include_logs,
            "user_id": current_user.get("user_id"),
            "page": page,
            "page_size": page_size
        }
        
        # Execute query
        results = await orchestrator.query_executions(query_params)
        
        return PaginatedResponse(
            message="Scan executions retrieved successfully",
            data=results.get("executions", []),
            total=results.get("total", 0),
            page=page,
            page_size=page_size,
            metadata={
                "query_time": results.get("query_time"),
                "filters_applied": results.get("filters_applied")
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to query scan executions: {e}")
        raise HTTPException(status_code=500, detail=f"Execution query failed: {str(e)}")

@router.get("/scans/{execution_id}/results")
async def get_scan_results(
    execution_id: str = Path(..., description="Execution ID of the scan"),
    include_raw_data: bool = Query(default=False, description="Include raw scan data"),
    format: str = Query(default="json", description="Result format: json, csv, excel"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed results from a completed scan execution.
    
    Features:
    - Multiple output formats
    - Raw data access
    - Result analytics and insights
    - Export capabilities
    """
    try:
        # Check execution exists and is completed
        execution = await orchestrator.get_execution(execution_id)
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        if execution.status != ScanWorkflowStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Scan execution not completed")
        
        # Check access permissions
        if not await orchestrator.check_execution_access(execution_id, current_user.get("user_id")):
            raise HTTPException(status_code=403, detail="Access denied to this execution")
        
        # Get results
        results = await orchestrator.get_execution_results(
            execution_id, 
            include_raw_data=include_raw_data,
            format=format
        )
        
        # Return appropriate response based on format
        if format == "json":
            return SuccessResponse(
                message="Scan results retrieved successfully",
                data=results
            )
        elif format == "csv":
            return StreamingResponse(
                results.get("csv_stream"),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=scan_results_{execution_id}.csv"}
            )
        elif format == "excel":
            return StreamingResponse(
                results.get("excel_stream"),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename=scan_results_{execution_id}.xlsx"}
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get scan results: {e}")
        raise HTTPException(status_code=500, detail=f"Results retrieval failed: {str(e)}")

# ===================== ORCHESTRATION MANAGEMENT ENDPOINTS =====================

@router.post("/orchestration/start")
@require_permissions(["orchestration_admin"])
async def start_orchestration_system(
    config: Optional[OrchestrationConfigModel] = None,
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Start the orchestration system with optional configuration.
    
    Features:
    - System initialization
    - Configuration validation
    - Resource allocation
    - Health check verification
    """
    try:
        # Audit log
        await audit_log(
            action="orchestration_system_start",
            user_id=current_user.get("user_id"),
            resource_type="orchestration_system",
            resource_id="global",
            metadata={"config": config.dict() if config else None}
        )
        
        # Apply configuration if provided
        if config:
            await orchestrator.apply_configuration(config.dict())
        
        # Start orchestration system
        await orchestrator.start_orchestration()
        
        # Get system status
        status = await orchestrator.health_check()
        
        return SuccessResponse(
            message="Orchestration system started successfully",
            data=status
        )
        
    except Exception as e:
        logger.error(f"Failed to start orchestration system: {e}")
        raise HTTPException(status_code=500, detail=f"System startup failed: {str(e)}")

@router.post("/orchestration/stop")
@require_permissions(["orchestration_admin"])
async def stop_orchestration_system(
    graceful: bool = Query(default=True, description="Graceful shutdown"),
    timeout_seconds: int = Query(default=300, description="Shutdown timeout"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Stop the orchestration system gracefully or forcefully.
    
    Features:
    - Graceful shutdown with active execution completion
    - Force shutdown for emergency situations
    - Resource cleanup
    - Status reporting
    """
    try:
        # Audit log
        await audit_log(
            action="orchestration_system_stop",
            user_id=current_user.get("user_id"),
            resource_type="orchestration_system",
            resource_id="global",
            metadata={"graceful": graceful, "timeout": timeout_seconds}
        )
        
        # Stop orchestration system
        result = await orchestrator.stop_orchestration(graceful, timeout_seconds)
        
        return SuccessResponse(
            message="Orchestration system stopped successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to stop orchestration system: {e}")
        raise HTTPException(status_code=500, detail=f"System shutdown failed: {str(e)}")

@router.get("/orchestration/status")
async def get_orchestration_status(
    include_workers: bool = Query(default=True, description="Include worker status"),
    include_queue: bool = Query(default=True, description="Include queue information"),
    include_metrics: bool = Query(default=True, description="Include performance metrics"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive orchestration system status.
    
    Features:
    - System health monitoring
    - Worker status and performance
    - Queue state and statistics
    - Performance metrics and trends
    """
    try:
        # Get system status
        status = await orchestrator.get_system_status(
            include_workers=include_workers,
            include_queue=include_queue,
            include_metrics=include_metrics
        )
        
        return SuccessResponse(
            message="Orchestration status retrieved successfully",
            data=status
        )
        
    except Exception as e:
        logger.error(f"Failed to get orchestration status: {e}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")

@router.get("/orchestration/metrics/stream")
async def stream_orchestration_metrics(
    interval_seconds: int = Query(default=5, ge=1, le=60, description="Update interval in seconds"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time orchestration metrics and system performance data.
    
    Features:
    - Real-time metrics streaming
    - Configurable update intervals
    - Performance analytics
    - Alert notifications
    """
    try:
        async def generate_metrics_stream():
            """Generate real-time metrics updates"""
            try:
                async for metrics in orchestrator.stream_system_metrics(interval_seconds):
                    yield f"data: {json.dumps(metrics)}\n\n"
                    await asyncio.sleep(interval_seconds)
                    
            except Exception as e:
                logger.error(f"Metrics streaming error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_metrics_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to start metrics streaming: {e}")
        raise HTTPException(status_code=500, detail=f"Metrics streaming failed: {str(e)}")

@router.get("/orchestration/resource-monitoring")
async def get_resource_monitoring(
    monitoring: ResourceMonitoringModel = Depends(),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive resource monitoring and utilization data.
    
    Features:
    - Real-time resource utilization
    - Historical usage patterns
    - Predictive analytics
    - Capacity planning insights
    """
    try:
        # Get resource monitoring data
        monitoring_data = await orchestrator.get_resource_monitoring(
            include_historical=monitoring.include_historical,
            time_window_hours=monitoring.time_window_hours,
            aggregation_level=monitoring.aggregation_level,
            include_predictions=monitoring.include_predictions
        )
        
        return SuccessResponse(
            message="Resource monitoring data retrieved successfully",
            data=monitoring_data
        )
        
    except Exception as e:
        logger.error(f"Failed to get resource monitoring data: {e}")
        raise HTTPException(status_code=500, detail=f"Resource monitoring failed: {str(e)}")

@router.post("/orchestration/optimize")
@require_permissions(["orchestration_admin"])
async def trigger_optimization(
    optimization_type: str = Query(..., description="Type of optimization: schedule, resources, performance"),
    target_metrics: Optional[Dict[str, float]] = None,
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Trigger AI-powered optimization of the orchestration system.
    
    Features:
    - Schedule optimization
    - Resource allocation optimization
    - Performance tuning
    - Predictive optimization
    """
    try:
        # Validate optimization type
        valid_types = ["schedule", "resources", "performance", "predictive", "comprehensive"]
        if optimization_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid optimization type. Must be one of: {valid_types}")
        
        # Audit log
        await audit_log(
            action="orchestration_optimization_triggered",
            user_id=current_user.get("user_id"),
            resource_type="orchestration_system",
            resource_id="global",
            metadata={"optimization_type": optimization_type, "target_metrics": target_metrics}
        )
        
        # Trigger optimization
        result = await orchestrator.trigger_optimization(optimization_type, target_metrics)
        
        return SuccessResponse(
            message=f"Orchestration {optimization_type} optimization completed successfully",
            data=result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to trigger optimization: {e}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

# ===================== ANALYTICS AND REPORTING ENDPOINTS =====================

@router.get("/analytics/performance")
async def get_performance_analytics(
    time_range: str = Query(default="24h", description="Time range: 1h, 6h, 24h, 7d, 30d"),
    aggregation: str = Query(default="hour", description="Data aggregation: minute, hour, day"),
    include_predictions: bool = Query(default=True, description="Include performance predictions"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive performance analytics and insights.
    
    Features:
    - Historical performance trends
    - Predictive analytics
    - Bottleneck identification
    - Optimization recommendations
    """
    try:
        # Get performance analytics
        analytics = await orchestrator.get_performance_analytics(
            time_range=time_range,
            aggregation=aggregation,
            include_predictions=include_predictions
        )
        
        return SuccessResponse(
            message="Performance analytics retrieved successfully",
            data=analytics
        )
        
    except Exception as e:
        logger.error(f"Failed to get performance analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Analytics retrieval failed: {str(e)}")

@router.get("/analytics/execution-insights")
async def get_execution_insights(
    analysis_period: str = Query(default="7d", description="Analysis period: 1d, 7d, 30d, 90d"),
    include_recommendations: bool = Query(default=True, description="Include optimization recommendations"),
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """
    Get advanced execution insights and patterns analysis.
    
    Features:
    - Execution pattern analysis
    - Success/failure rate analysis
    - Resource utilization patterns
    - Optimization recommendations
    """
    try:
        # Get execution insights
        insights = await orchestrator.get_execution_insights(
            analysis_period=analysis_period,
            include_recommendations=include_recommendations,
            user_context=current_user
        )
        
        return SuccessResponse(
            message="Execution insights retrieved successfully",
            data=insights
        )
        
    except Exception as e:
        logger.error(f"Failed to get execution insights: {e}")
        raise HTTPException(status_code=500, detail=f"Insights retrieval failed: {str(e)}")

# ===================== HEALTH CHECK AND MONITORING =====================

@router.get("/health")
async def health_check(
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator)
):
    """
    Comprehensive health check for the orchestration system.
    
    Features:
    - System component health
    - Performance metrics
    - Resource availability
    - Alert status
    """
    try:
        health_status = await orchestrator.health_check()
        
        return SuccessResponse(
            message="Health check completed",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# ===================== UTILITY ENDPOINTS =====================

@router.get("/configuration")
@require_permissions(["orchestration_view"])
async def get_current_configuration(
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """Get current orchestration system configuration."""
    try:
        config = await orchestrator.get_current_configuration()
        
        return SuccessResponse(
            message="Configuration retrieved successfully",
            data=config
        )
        
    except Exception as e:
        logger.error(f"Failed to get configuration: {e}")
        raise HTTPException(status_code=500, detail=f"Configuration retrieval failed: {str(e)}")

@router.post("/configuration")
@require_permissions(["orchestration_admin"])
async def update_configuration(
    config: OrchestrationConfigModel,
    orchestrator: EnterpriseScanOrchestrator = Depends(get_orchestrator),
    current_user: dict = Depends(get_current_user)
):
    """Update orchestration system configuration."""
    try:
        # Audit log
        await audit_log(
            action="orchestration_configuration_updated",
            user_id=current_user.get("user_id"),
            resource_type="orchestration_system",
            resource_id="global",
            metadata=config.dict()
        )
        
        # Update configuration
        result = await orchestrator.update_configuration(config.dict())
        
        return SuccessResponse(
            message="Configuration updated successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to update configuration: {e}")
        raise HTTPException(status_code=500, detail=f"Configuration update failed: {str(e)}")