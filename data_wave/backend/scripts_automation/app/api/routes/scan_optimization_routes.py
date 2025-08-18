"""
🏢 Enterprise Scan Optimization Routes (Scan-Rule-Sets Group)
============================================================

This module provides comprehensive API endpoints for scan optimization with:
- AI-powered performance optimization and tuning
- Advanced resource allocation and management
- Real-time optimization monitoring and analytics
- Automated bottleneck detection and resolution
- Enterprise-grade optimization orchestration

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
from pydantic import BaseModel, Field, validator

# Core dependencies
from ...db_session import get_session
from ...models.scan_models import ScanRule, ScanExecution
from ...models.scan_performance_models import PerformanceMetric, PerformanceBottleneck, PerformanceOptimization
from ...models.scan_intelligence_models import ScanOptimizationRecord

# Service dependencies
from ...services.scan_performance_optimizer import ScanPerformanceOptimizer
from ...services.rule_optimization_service import RuleOptimizationService
from ...services.scan_intelligence_service import ScanIntelligenceService
from ...services.advanced_scan_scheduler import AdvancedScanScheduler

# Authentication and authorization
from ...api.security.rbac import (
    get_current_user,
    require_permission,
    PERMISSION_ANALYTICS_MANAGE as Permission_ANALYTICS_MANAGE,
    PERMISSION_PERFORMANCE_MANAGE as Permission_PERFORMANCE_MANAGE,
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/api/v1/scan-optimization",
    tags=["Scan Optimization", "Scan-Rule-Sets", "Performance"],
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

# Request/Response Models

class OptimizationRequest(BaseModel):
    """Request model for scan optimization"""
    optimization_type: str = Field(..., description="Type of optimization: performance, resource, accuracy")
    target_scope: str = Field("system", description="Optimization scope: system, rule_set, individual")
    target_ids: Optional[List[str]] = Field(None, description="Specific IDs to optimize (rules, executions)")
    optimization_goals: Dict[str, float] = Field(..., description="Optimization targets and weights")
    constraints: Optional[Dict[str, Any]] = Field(None, description="Optimization constraints")
    auto_apply: bool = Field(False, description="Auto-apply optimizations if safe")
    dry_run: bool = Field(True, description="Perform dry run first")

class PerformanceAnalysisRequest(BaseModel):
    """Request model for performance analysis"""
    analysis_scope: str = Field("comprehensive", description="Analysis scope")
    timeframe: str = Field("24h", description="Analysis timeframe")
    include_bottlenecks: bool = Field(True, description="Include bottleneck analysis")
    include_predictions: bool = Field(True, description="Include performance predictions")
    detail_level: str = Field("detailed", description="Analysis detail level")

class ResourceOptimizationRequest(BaseModel):
    """Request model for resource optimization"""
    resource_types: List[str] = Field(..., description="Resource types to optimize")
    allocation_strategy: str = Field("balanced", description="Allocation strategy")
    priority_weights: Optional[Dict[str, float]] = Field(None, description="Priority weights")
    efficiency_targets: Dict[str, float] = Field(..., description="Efficiency targets")

class OptimizationScheduleRequest(BaseModel):
    """Request model for optimization scheduling"""
    optimization_frequency: str = Field("daily", description="Optimization frequency")
    maintenance_windows: List[Dict[str, str]] = Field(..., description="Maintenance time windows")
    auto_optimization: bool = Field(True, description="Enable automatic optimization")
    notification_settings: Dict[str, bool] = Field(..., description="Notification preferences")

# Service Dependencies

def get_performance_optimizer() -> ScanPerformanceOptimizer:
    """Get scan performance optimizer service"""
    return ScanPerformanceOptimizer()

def get_rule_optimizer() -> RuleOptimizationService:
    """Get rule optimization service"""
    return RuleOptimizationService()

def get_intelligence_service() -> ScanIntelligenceService:
    """Get scan intelligence service"""
    return ScanIntelligenceService()

def get_scheduler() -> AdvancedScanScheduler:
    """Get advanced scan scheduler"""
    return AdvancedScanScheduler()

# API Endpoints

@router.post("/execute")
async def execute_optimization(
    request: OptimizationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer),
    rule_optimizer: RuleOptimizationService = Depends(get_rule_optimizer),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service)
):
    """
    Execute comprehensive scan optimization
    
    This endpoint provides:
    - Multi-dimensional performance optimization
    - Resource allocation optimization
    - Rule parameter tuning and enhancement
    - Automated bottleneck resolution
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_OPTIMIZE, Permission.SCAN_CONFIGURE])
        
        # Validate optimization request
        validation_result = await _validate_optimization_request(request, session)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid optimization request: {validation_result['error']}"
            )
        
        # Perform dry run if requested
        dry_run_result = None
        if request.dry_run:
            dry_run_result = await _perform_optimization_dry_run(request, session, performance_optimizer)
            if not dry_run_result["safe_to_proceed"]:
                return {
                    "success": False,
                    "dry_run_completed": True,
                    "safe_to_proceed": False,
                    "risks_identified": dry_run_result["risks"],
                    "recommendations": dry_run_result["recommendations"]
                }
        
        # Create optimization strategy
        optimization_strategy = await _create_optimization_strategy(request, session, intelligence_service)
        
        # Execute optimization based on type
        if request.optimization_type == "performance":
            optimization_result = await performance_optimizer.optimize_performance({
                "scope": request.target_scope,
                "target_ids": request.target_ids,
                "goals": request.optimization_goals,
                "constraints": request.constraints,
                "strategy": optimization_strategy["strategy"],
                "user_id": current_user.id
            }, session)
        
        elif request.optimization_type == "resource":
            optimization_result = await performance_optimizer.optimize_resources({
                "scope": request.target_scope,
                "target_ids": request.target_ids,
                "goals": request.optimization_goals,
                "constraints": request.constraints,
                "strategy": optimization_strategy["strategy"],
                "user_id": current_user.id
            }, session)
        
        elif request.optimization_type == "accuracy":
            optimization_result = await rule_optimizer.optimize_accuracy({
                "scope": request.target_scope,
                "target_ids": request.target_ids,
                "goals": request.optimization_goals,
                "constraints": request.constraints,
                "strategy": optimization_strategy["strategy"],
                "user_id": current_user.id
            }, session)
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported optimization type: {request.optimization_type}"
            )
        
        if not optimization_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Optimization failed: {optimization_result['error']}"
            )
        
        # Auto-apply if requested and safe
        if request.auto_apply and optimization_result.get("safe_to_apply", False):
            apply_result = await _apply_optimization(
                optimization_result["optimization_id"],
                session,
                performance_optimizer
            )
            optimization_result["auto_applied"] = apply_result["success"]
        
        # Start background monitoring
        background_tasks.add_task(
            _monitor_optimization_execution,
            optimization_result["optimization_id"],
            request.optimization_type,
            session
        )
        
        return {
            "success": True,
            "optimization_id": optimization_result["optimization_id"],
            "optimization_type": request.optimization_type,
            "scope": request.target_scope,
            "dry_run_result": dry_run_result,
            "expected_improvements": optimization_result["expected_improvements"],
            "estimated_completion": optimization_result["estimated_completion"],
            "auto_applied": optimization_result.get("auto_applied", False),
            "monitoring_enabled": True,
            "optimization_status": "running"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/performance")
async def analyze_performance(
    request: PerformanceAnalysisRequest = Depends(),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer)
):
    """
    Perform comprehensive performance analysis
    
    This endpoint provides:
    - Detailed performance metric analysis
    - Bottleneck identification and impact assessment
    - Performance trend analysis and predictions
    - Optimization opportunity identification
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.SCAN_ANALYZE])
        
        # Perform performance analysis
        analysis_result = await performance_optimizer.analyze_performance({
            "scope": request.analysis_scope,
            "timeframe": request.timeframe,
            "include_bottlenecks": request.include_bottlenecks,
            "include_predictions": request.include_predictions,
            "detail_level": request.detail_level
        }, session)
        
        if not analysis_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Performance analysis failed: {analysis_result['error']}"
            )
        
        # Generate optimization recommendations
        recommendations = await performance_optimizer.generate_optimization_recommendations(
            analysis_result["analysis_data"],
            session
        )
        
        return {
            "success": True,
            "analysis_id": analysis_result["analysis_id"],
            "timeframe": request.timeframe,
            "scope": request.analysis_scope,
            "performance_metrics": analysis_result["metrics"],
            "bottlenecks": analysis_result.get("bottlenecks", []),
            "trends": analysis_result.get("trends", {}),
            "predictions": analysis_result.get("predictions", {}),
            "optimization_opportunities": analysis_result["optimization_opportunities"],
            "recommendations": recommendations["recommendations"],
            "priority_actions": recommendations["priority_actions"],
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources/optimize")
async def optimize_resources(
    request: ResourceOptimizationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer)
):
    """
    Optimize resource allocation and utilization
    
    This endpoint provides:
    - Intelligent resource allocation optimization
    - Dynamic load balancing and redistribution
    - Efficiency-focused resource management
    - Predictive resource planning and scaling
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_OPTIMIZE, Permission.RESOURCE_MANAGE])
        
        # Validate resource optimization request
        if not request.resource_types:
            raise HTTPException(
                status_code=400,
                detail="At least one resource type must be specified"
            )
        
        # Execute resource optimization
        optimization_result = await performance_optimizer.optimize_resource_allocation({
            "resource_types": request.resource_types,
            "allocation_strategy": request.allocation_strategy,
            "priority_weights": request.priority_weights or {},
            "efficiency_targets": request.efficiency_targets,
            "user_id": current_user.id
        }, session)
        
        if not optimization_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Resource optimization failed: {optimization_result['error']}"
            )
        
        # Start background monitoring
        background_tasks.add_task(
            _monitor_resource_optimization,
            optimization_result["optimization_id"],
            session
        )
        
        return {
            "success": True,
            "optimization_id": optimization_result["optimization_id"],
            "resource_types": request.resource_types,
            "allocation_strategy": request.allocation_strategy,
            "current_utilization": optimization_result["current_utilization"],
            "optimized_allocation": optimization_result["optimized_allocation"],
            "expected_efficiency_gains": optimization_result["expected_efficiency_gains"],
            "estimated_completion": optimization_result["estimated_completion"],
            "monitoring_enabled": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error optimizing resources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bottlenecks")
async def detect_bottlenecks(
    severity_threshold: float = Query(0.7, ge=0.1, le=1.0, description="Severity threshold"),
    include_predictions: bool = Query(True, description="Include bottleneck predictions"),
    timeframe: str = Query("24h", description="Analysis timeframe"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer)
):
    """
    Detect and analyze system bottlenecks
    
    This endpoint provides:
    - Real-time bottleneck detection and classification
    - Impact analysis and severity assessment
    - Root cause analysis and dependencies
    - Automated resolution recommendations
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.SCAN_ANALYZE])
        
        # Detect bottlenecks
        bottleneck_result = await performance_optimizer.detect_bottlenecks({
            "severity_threshold": severity_threshold,
            "timeframe": timeframe,
            "include_predictions": include_predictions,
            "include_root_cause": True,
            "include_impact_analysis": True
        }, session)
        
        if not bottleneck_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Bottleneck detection failed: {bottleneck_result['error']}"
            )
        
        # Generate resolution recommendations
        resolution_recommendations = await performance_optimizer.generate_bottleneck_resolutions(
            bottleneck_result["bottlenecks"],
            session
        )
        
        return {
            "success": True,
            "detection_timestamp": datetime.utcnow().isoformat(),
            "timeframe": timeframe,
            "severity_threshold": severity_threshold,
            "bottlenecks_detected": len(bottleneck_result["bottlenecks"]),
            "critical_bottlenecks": len([b for b in bottleneck_result["bottlenecks"] if b["severity"] >= 0.9]),
            "bottlenecks": bottleneck_result["bottlenecks"],
            "predictions": bottleneck_result.get("predictions", []),
            "resolution_recommendations": resolution_recommendations["recommendations"],
            "automated_fixes_available": resolution_recommendations["automated_fixes_count"],
            "estimated_resolution_time": resolution_recommendations["estimated_resolution_time"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error detecting bottlenecks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/schedule")
async def schedule_optimization(
    request: OptimizationScheduleRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    scheduler: AdvancedScanScheduler = Depends(get_scheduler)
):
    """
    Schedule automated optimization processes
    
    This endpoint provides:
    - Automated optimization scheduling and execution
    - Maintenance window management and coordination
    - Performance-aware optimization timing
    - Intelligent optimization frequency adjustment
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_CONFIGURE, Permission.SCAN_SCHEDULE])
        
        # Validate schedule request
        if not request.maintenance_windows:
            raise HTTPException(
                status_code=400,
                detail="At least one maintenance window must be specified"
            )
        
        # Create optimization schedule
        schedule_result = await scheduler.create_optimization_schedule({
            "frequency": request.optimization_frequency,
            "maintenance_windows": request.maintenance_windows,
            "auto_optimization": request.auto_optimization,
            "notification_settings": request.notification_settings,
            "user_id": current_user.id
        }, session)
        
        if not schedule_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Schedule creation failed: {schedule_result['error']}"
            )
        
        return {
            "success": True,
            "schedule_id": schedule_result["schedule_id"],
            "optimization_frequency": request.optimization_frequency,
            "auto_optimization_enabled": request.auto_optimization,
            "maintenance_windows": request.maintenance_windows,
            "next_optimization": schedule_result["next_optimization"],
            "estimated_duration": schedule_result["estimated_duration"],
            "notification_settings": request.notification_settings
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scheduling optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{optimization_id}")
async def get_optimization_status(
    optimization_id: str,
    include_details: bool = Query(False, description="Include detailed progress"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer)
):
    """
    Get optimization process status and progress
    
    This endpoint provides:
    - Real-time optimization progress tracking
    - Detailed performance metrics during optimization
    - Intermediate results and improvements
    - Error detection and recovery status
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW])
        
        # Get optimization status
        status_result = await performance_optimizer.get_optimization_status({
            "optimization_id": optimization_id,
            "include_details": include_details,
            "include_metrics": True,
            "include_logs": include_details
        }, session)
        
        if not status_result["success"]:
            raise HTTPException(
                status_code=404,
                detail=f"Optimization not found: {optimization_id}"
            )
        
        return {
            "success": True,
            "optimization_id": optimization_id,
            "status": status_result["status"],
            "progress": status_result["progress"],
            "started_at": status_result["started_at"],
            "estimated_completion": status_result["estimated_completion"],
            "current_metrics": status_result["current_metrics"],
            "improvements_achieved": status_result["improvements_achieved"],
            "details": status_result.get("details") if include_details else None,
            "logs": status_result.get("logs") if include_details else None,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting optimization status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations")
async def get_optimization_recommendations(
    recommendation_type: str = Query("all", description="Type of recommendations"),
    priority_level: str = Query("high", description="Minimum priority level"),
    limit: int = Query(20, ge=1, le=100, description="Maximum recommendations"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer)
):
    """
    Get AI-powered optimization recommendations
    
    This endpoint provides:
    - Intelligent optimization opportunity identification
    - Priority-based recommendation ranking
    - Impact assessment and effort estimation
    - Automated optimization suggestion generation
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.SCAN_ANALYZE])
        
        # Get optimization recommendations
        recommendations_result = await performance_optimizer.get_optimization_recommendations({
            "recommendation_type": recommendation_type,
            "priority_level": priority_level,
            "limit": limit,
            "include_impact_analysis": True,
            "include_effort_estimation": True
        }, session)
        
        if not recommendations_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get recommendations: {recommendations_result['error']}"
            )
        
        return {
            "success": True,
            "recommendation_type": recommendation_type,
            "priority_level": priority_level,
            "recommendations_count": len(recommendations_result["recommendations"]),
            "recommendations": recommendations_result["recommendations"],
            "summary": {
                "high_priority": len([r for r in recommendations_result["recommendations"] if r["priority"] == "high"]),
                "medium_priority": len([r for r in recommendations_result["recommendations"] if r["priority"] == "medium"]),
                "low_priority": len([r for r in recommendations_result["recommendations"] if r["priority"] == "low"]),
                "automated_eligible": len([r for r in recommendations_result["recommendations"] if r.get("automatable", False)])
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting optimization recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream/optimization")
async def stream_optimization_updates(
    optimization_id: Optional[str] = Query(None, description="Specific optimization ID"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer)
):
    """
    Stream real-time optimization updates and metrics
    
    This endpoint provides:
    - Live optimization progress streaming
    - Real-time performance metric updates
    - Instant notification of optimization events
    - Continuous monitoring data streaming
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW])
        
        async def generate_optimization_stream():
            """Generate real-time optimization updates"""
            while True:
                try:
                    # Get latest optimization updates
                    updates = await performance_optimizer.get_real_time_updates(
                        optimization_id=optimization_id,
                        session=session
                    )
                    
                    if updates:
                        # Format as Server-Sent Events
                        for update in updates:
                            yield f"data: {json.dumps(update)}\n\n"
                    
                    await asyncio.sleep(3)  # Update every 3 seconds
                    
                except Exception as e:
                    logger.error(f"Error in optimization stream: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    break
        
        return StreamingResponse(
            generate_optimization_stream(),
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
        logger.error(f"Error starting optimization stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Private Helper Functions

async def _validate_optimization_request(request: OptimizationRequest, session: AsyncSession) -> Dict[str, Any]:
    """Validate optimization request parameters"""
    try:
        # Validate optimization type
        valid_types = ["performance", "resource", "accuracy"]
        if request.optimization_type not in valid_types:
            return {"valid": False, "error": f"Invalid optimization type. Must be one of: {valid_types}"}
        
        # Validate scope
        valid_scopes = ["system", "rule_set", "individual"]
        if request.target_scope not in valid_scopes:
            return {"valid": False, "error": f"Invalid scope. Must be one of: {valid_scopes}"}
        
        # Validate target IDs if provided
        if request.target_ids and request.target_scope != "system":
            # Additional validation logic here
            pass
        
        # Validate optimization goals
        if not request.optimization_goals:
            return {"valid": False, "error": "Optimization goals must be specified"}
        
        return {"valid": True}
        
    except Exception as e:
        return {"valid": False, "error": f"Validation error: {str(e)}"}

async def _perform_optimization_dry_run(
    request: OptimizationRequest,
    session: AsyncSession,
    optimizer: ScanPerformanceOptimizer
) -> Dict[str, Any]:
    """Perform optimization dry run to assess safety and impact"""
    try:
        dry_run_result = await optimizer.perform_dry_run({
            "optimization_type": request.optimization_type,
            "scope": request.target_scope,
            "target_ids": request.target_ids,
            "goals": request.optimization_goals,
            "constraints": request.constraints
        }, session)
        
        return dry_run_result
        
    except Exception as e:
        logger.error(f"Error in optimization dry run: {str(e)}")
        return {
            "safe_to_proceed": False,
            "risks": [f"Dry run failed: {str(e)}"],
            "recommendations": ["Review optimization parameters and try again"]
        }

async def _create_optimization_strategy(
    request: OptimizationRequest,
    session: AsyncSession,
    intelligence_service: ScanIntelligenceService
) -> Dict[str, Any]:
    """Create optimization strategy using AI intelligence"""
    try:
        strategy_result = await intelligence_service.create_optimization_strategy({
            "optimization_type": request.optimization_type,
            "scope": request.target_scope,
            "goals": request.optimization_goals,
            "constraints": request.constraints,
            "historical_data": True
        }, session)
        
        return strategy_result
        
    except Exception as e:
        logger.error(f"Error creating optimization strategy: {str(e)}")
        return {
            "strategy": "default",
            "confidence": 0.5
        }

async def _apply_optimization(
    optimization_id: str,
    session: AsyncSession,
    optimizer: ScanPerformanceOptimizer
) -> Dict[str, Any]:
    """Apply optimization results"""
    try:
        apply_result = await optimizer.apply_optimization(optimization_id, session)
        return apply_result
        
    except Exception as e:
        logger.error(f"Error applying optimization: {str(e)}")
        return {"success": False, "error": str(e)}

# Background Tasks

async def _monitor_optimization_execution(
    optimization_id: str,
    optimization_type: str,
    session: AsyncSession
):
    """Monitor optimization execution in background"""
    try:
        optimizer = ScanPerformanceOptimizer()
        
        while True:
            # Check optimization status
            status = await optimizer.get_optimization_status({
                "optimization_id": optimization_id,
                "include_details": True
            }, session)
            
            if status["status"] in ["completed", "failed", "cancelled"]:
                # Record final results
                await optimizer.record_optimization_results(
                    optimization_id,
                    status["final_results"],
                    session
                )
                break
            
            await asyncio.sleep(10)  # Check every 10 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring optimization {optimization_id}: {str(e)}")

async def _monitor_resource_optimization(
    optimization_id: str,
    session: AsyncSession
):
    """Monitor resource optimization in background"""
    try:
        optimizer = ScanPerformanceOptimizer()
        
        while True:
            # Check optimization status
            status = await optimizer.get_resource_optimization_status(optimization_id, session)
            
            if status["status"] in ["completed", "failed", "cancelled"]:
                # Apply resource changes if successful
                if status["status"] == "completed":
                    await optimizer.apply_resource_optimizations(optimization_id, session)
                break
            
            await asyncio.sleep(15)  # Check every 15 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring resource optimization {optimization_id}: {str(e)}")

# Health Check
@router.get("/health")
async def health_check():
    """Health check for scan optimization service"""
    return {
        "status": "healthy",
        "service": "scan-optimization",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "performance_optimization",
            "resource_optimization",
            "bottleneck_detection",
            "automated_scheduling",
            "real_time_monitoring",
            "ai_powered_recommendations"
        ]
    }