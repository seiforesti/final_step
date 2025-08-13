"""
🏢 Enterprise Intelligent Scanning Routes (Scan Logic Group)
===========================================================

This module provides comprehensive API endpoints for intelligent scanning within the Scan Logic group with:
- Advanced scan logic orchestration and management
- AI-powered scan workflow optimization
- Intelligent scan execution and monitoring
- Cross-system scan logic coordination
- Enterprise-grade scan logic analytics

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
from ...models.scan_models import ScanRule, ScanExecution, ScanResult
from ...models.scan_intelligence_models import ScanIntelligenceEngine, ScanPrediction
from ...models.scan_workflow_models import ScanWorkflow, WorkflowStage, WorkflowTask

# Service dependencies
from ...services.unified_scan_manager import UnifiedScanManager
from ...services.scan_intelligence_service import ScanIntelligenceService
from ...services.scan_workflow_engine import ScanWorkflowEngine
from ...services.intelligent_scan_coordinator import IntelligentScanCoordinator

# Authentication and authorization
from ...api.security.rbac import get_current_user, require_permission
from ...core.rbac import Permission

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/api/v1/scan-logic/intelligent-scanning",
    tags=["Intelligent Scanning Logic", "Scan Logic", "AI/ML"],
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

# Request/Response Models

class IntelligentScanLogicRequest(BaseModel):
    """Request model for intelligent scan logic operations"""
    logic_type: str = Field(..., description="Type of scan logic: workflow, orchestration, coordination")
    execution_strategy: str = Field("adaptive", description="Execution strategy: adaptive, predictive, optimized")
    target_scope: str = Field("system", description="Target scope: system, domain, custom")
    scan_parameters: Dict[str, Any] = Field(..., description="Scan execution parameters")
    intelligence_level: str = Field("advanced", description="Intelligence level: basic, advanced, expert")
    auto_optimization: bool = Field(True, description="Enable automatic optimization")

class ScanLogicWorkflowRequest(BaseModel):
    """Request model for scan logic workflow operations"""
    workflow_type: str = Field(..., description="Workflow type: sequential, parallel, conditional")
    workflow_steps: List[Dict[str, Any]] = Field(..., description="Workflow step definitions")
    execution_conditions: Optional[Dict[str, Any]] = Field(None, description="Execution conditions")
    failure_handling: str = Field("smart_retry", description="Failure handling strategy")
    monitoring_level: str = Field("comprehensive", description="Monitoring detail level")

class ScanLogicOrchestrationRequest(BaseModel):
    """Request model for scan logic orchestration"""
    orchestration_scope: str = Field("enterprise", description="Orchestration scope")
    resource_allocation: Dict[str, Any] = Field(..., description="Resource allocation strategy")
    priority_management: Dict[str, Any] = Field(..., description="Priority management configuration")
    performance_targets: Dict[str, float] = Field(..., description="Performance target metrics")
    optimization_goals: List[str] = Field(..., description="Optimization objectives")

class ScanLogicAnalysisRequest(BaseModel):
    """Request model for scan logic analysis"""
    analysis_dimensions: List[str] = Field(..., description="Analysis dimensions")
    analysis_depth: str = Field("deep", description="Analysis depth: surface, deep, comprehensive")
    include_predictions: bool = Field(True, description="Include predictive analysis")
    comparison_baseline: Optional[str] = Field(None, description="Baseline for comparison")
    intelligence_insights: bool = Field(True, description="Include AI insights")

# Service Dependencies

def get_unified_manager() -> UnifiedScanManager:
    """Get unified scan manager"""
    return UnifiedScanManager()

def get_intelligence_service() -> ScanIntelligenceService:
    """Get scan intelligence service"""
    return ScanIntelligenceService()

def get_workflow_engine() -> ScanWorkflowEngine:
    """Get scan workflow engine"""
    return ScanWorkflowEngine()

def get_scan_coordinator() -> IntelligentScanCoordinator:
    """Get intelligent scan coordinator"""
    return IntelligentScanCoordinator()

# API Endpoints

@router.post("/execute")
async def execute_intelligent_scan_logic(
    request: IntelligentScanLogicRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service)
):
    """
    Execute intelligent scan logic with advanced AI optimization
    
    This endpoint provides:
    - Advanced scan logic execution with AI optimization
    - Adaptive execution strategies based on real-time conditions
    - Intelligent resource allocation and management
    - Comprehensive monitoring and analytics
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_EXECUTE, Permission.SCAN_LOGIC_MANAGE])
        
        # Validate scan logic request
        validation_result = await _validate_scan_logic_request(request, session)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid scan logic request: {validation_result['error']}"
            )
        
        # Create intelligent execution plan
        execution_plan = await intelligence_service.create_intelligent_execution_plan({
            "logic_type": request.logic_type,
            "execution_strategy": request.execution_strategy,
            "target_scope": request.target_scope,
            "scan_parameters": request.scan_parameters,
            "intelligence_level": request.intelligence_level,
            "auto_optimization": request.auto_optimization,
            "user_id": current_user.id
        }, session)
        
        if not execution_plan["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create execution plan: {execution_plan['error']}"
            )
        
        # Execute scan logic
        execution_result = await unified_manager.execute_intelligent_scan_logic({
            "execution_plan_id": execution_plan["plan_id"],
            "logic_type": request.logic_type,
            "parameters": request.scan_parameters,
            "optimization_enabled": request.auto_optimization
        }, session)
        
        if not execution_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Scan logic execution failed: {execution_result['error']}"
            )
        
        # Start background monitoring and optimization
        background_tasks.add_task(
            _monitor_scan_logic_execution,
            execution_result["execution_id"],
            execution_plan["plan_id"],
            session
        )
        
        return {
            "success": True,
            "execution_id": execution_result["execution_id"],
            "execution_plan_id": execution_plan["plan_id"],
            "logic_type": request.logic_type,
            "execution_strategy": request.execution_strategy,
            "intelligence_level": request.intelligence_level,
            "estimated_completion": execution_result["estimated_completion"],
            "resource_allocation": execution_result["resource_allocation"],
            "monitoring_enabled": True,
            "optimization_active": request.auto_optimization,
            "status": "executing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing intelligent scan logic: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflow")
async def execute_scan_logic_workflow(
    request: ScanLogicWorkflowRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    workflow_engine: ScanWorkflowEngine = Depends(get_workflow_engine),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator)
):
    """
    Execute intelligent scan logic workflows
    
    This endpoint provides:
    - Advanced workflow-based scan logic execution
    - Conditional and adaptive workflow processing
    - Intelligent failure handling and recovery
    - Real-time workflow monitoring and optimization
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_EXECUTE, Permission.WORKFLOW_MANAGE])
        
        # Validate workflow steps
        if not request.workflow_steps:
            raise HTTPException(
                status_code=400,
                detail="At least one workflow step must be defined"
            )
        
        # Create scan logic workflow
        workflow_result = await workflow_engine.create_scan_logic_workflow({
            "workflow_type": request.workflow_type,
            "workflow_steps": request.workflow_steps,
            "execution_conditions": request.execution_conditions or {},
            "failure_handling": request.failure_handling,
            "monitoring_level": request.monitoring_level,
            "user_id": current_user.id
        }, session)
        
        if not workflow_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Workflow creation failed: {workflow_result['error']}"
            )
        
        # Execute workflow with coordination
        execution_result = await coordinator.execute_workflow_with_logic({
            "workflow_id": workflow_result["workflow_id"],
            "coordination_strategy": "intelligent",
            "monitoring_enabled": True,
            "optimization_enabled": True
        }, session)
        
        if not execution_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Workflow execution failed: {execution_result['error']}"
            )
        
        # Start background workflow monitoring
        background_tasks.add_task(
            _monitor_workflow_logic_execution,
            execution_result["execution_id"],
            workflow_result["workflow_id"],
            session
        )
        
        return {
            "success": True,
            "execution_id": execution_result["execution_id"],
            "workflow_id": workflow_result["workflow_id"],
            "workflow_type": request.workflow_type,
            "workflow_steps": len(request.workflow_steps),
            "current_step": execution_result["current_step"],
            "execution_conditions": request.execution_conditions,
            "failure_handling": request.failure_handling,
            "estimated_completion": execution_result["estimated_completion"],
            "monitoring_level": request.monitoring_level,
            "status": "executing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing scan logic workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orchestrate")
async def orchestrate_scan_logic(
    request: ScanLogicOrchestrationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    coordinator: IntelligentScanCoordinator = Depends(get_scan_coordinator),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager)
):
    """
    Orchestrate enterprise-wide scan logic operations
    
    This endpoint provides:
    - Enterprise-scale scan logic orchestration
    - Advanced resource allocation and management
    - Priority-based execution management
    - Performance-driven optimization
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_ORCHESTRATE, Permission.ENTERPRISE_MANAGE])
        
        # Validate performance targets
        if not request.performance_targets:
            raise HTTPException(
                status_code=400,
                detail="Performance targets must be specified for orchestration"
            )
        
        # Create orchestration plan
        orchestration_plan = await coordinator.create_scan_logic_orchestration({
            "orchestration_scope": request.orchestration_scope,
            "resource_allocation": request.resource_allocation,
            "priority_management": request.priority_management,
            "performance_targets": request.performance_targets,
            "optimization_goals": request.optimization_goals,
            "user_id": current_user.id
        }, session)
        
        if not orchestration_plan["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Orchestration plan creation failed: {orchestration_plan['error']}"
            )
        
        # Execute orchestration
        execution_result = await unified_manager.execute_scan_logic_orchestration({
            "orchestration_plan_id": orchestration_plan["plan_id"],
            "scope": request.orchestration_scope,
            "targets": request.performance_targets,
            "goals": request.optimization_goals
        }, session)
        
        if not execution_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Orchestration execution failed: {execution_result['error']}"
            )
        
        # Start background orchestration monitoring
        background_tasks.add_task(
            _monitor_orchestration_execution,
            execution_result["execution_id"],
            orchestration_plan["plan_id"],
            session
        )
        
        return {
            "success": True,
            "execution_id": execution_result["execution_id"],
            "orchestration_plan_id": orchestration_plan["plan_id"],
            "orchestration_scope": request.orchestration_scope,
            "resource_allocation": execution_result["resource_allocation"],
            "priority_management": execution_result["priority_management"],
            "performance_targets": request.performance_targets,
            "optimization_goals": request.optimization_goals,
            "estimated_completion": execution_result["estimated_completion"],
            "monitoring_enabled": True,
            "status": "orchestrating"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error orchestrating scan logic: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_scan_logic(
    request: ScanLogicAnalysisRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager)
):
    """
    Analyze scan logic performance and optimization opportunities
    
    This endpoint provides:
    - Comprehensive scan logic analysis
    - Performance optimization recommendations
    - Predictive insights and forecasting
    - Intelligence-driven improvement suggestions
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.SCAN_ANALYZE])
        
        # Perform scan logic analysis
        analysis_result = await intelligence_service.analyze_scan_logic_performance({
            "analysis_dimensions": request.analysis_dimensions,
            "analysis_depth": request.analysis_depth,
            "include_predictions": request.include_predictions,
            "comparison_baseline": request.comparison_baseline,
            "intelligence_insights": request.intelligence_insights
        }, session)
        
        if not analysis_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Scan logic analysis failed: {analysis_result['error']}"
            )
        
        # Generate optimization recommendations
        optimization_recommendations = await unified_manager.generate_logic_optimizations(
            analysis_result["analysis_data"],
            session
        )
        
        return {
            "success": True,
            "analysis_id": analysis_result["analysis_id"],
            "analysis_dimensions": request.analysis_dimensions,
            "analysis_depth": request.analysis_depth,
            "analysis_summary": analysis_result["analysis_summary"],
            "performance_metrics": analysis_result["performance_metrics"],
            "optimization_opportunities": analysis_result["optimization_opportunities"],
            "predictions": analysis_result.get("predictions", {}),
            "intelligence_insights": analysis_result.get("intelligence_insights", []),
            "optimization_recommendations": optimization_recommendations,
            "comparison_results": analysis_result.get("comparison_results", {}),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing scan logic: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{execution_id}")
async def get_scan_logic_status(
    execution_id: str,
    include_details: bool = Query(False, description="Include detailed status"),
    include_metrics: bool = Query(True, description="Include performance metrics"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager)
):
    """
    Get scan logic execution status and progress
    
    This endpoint provides:
    - Real-time scan logic execution status
    - Detailed progress metrics and analytics
    - Performance indicators and optimization status
    - Error detection and recovery information
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW])
        
        # Get scan logic status
        status_result = await unified_manager.get_scan_logic_status({
            "execution_id": execution_id,
            "include_details": include_details,
            "include_metrics": include_metrics,
            "include_logs": include_details
        }, session)
        
        if not status_result["success"]:
            raise HTTPException(
                status_code=404,
                detail=f"Scan logic execution not found: {execution_id}"
            )
        
        return {
            "success": True,
            "execution_id": execution_id,
            "logic_status": status_result["status"],
            "execution_progress": status_result["progress"],
            "current_stage": status_result["current_stage"],
            "started_at": status_result["started_at"],
            "estimated_completion": status_result["estimated_completion"],
            "performance_metrics": status_result.get("performance_metrics", {}) if include_metrics else None,
            "resource_utilization": status_result["resource_utilization"],
            "optimization_status": status_result["optimization_status"],
            "error_status": status_result.get("error_status"),
            "details": status_result.get("details") if include_details else None,
            "logs": status_result.get("logs") if include_details else None,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting scan logic status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/optimization/recommendations")
async def get_scan_logic_optimization_recommendations(
    scope: str = Query("system", description="Optimization scope"),
    priority_level: str = Query("high", description="Minimum priority level"),
    optimization_type: str = Query("all", description="Type of optimization"),
    limit: int = Query(20, ge=1, le=100, description="Maximum recommendations"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service)
):
    """
    Get AI-powered scan logic optimization recommendations
    
    This endpoint provides:
    - Intelligent optimization recommendations
    - Priority-based recommendation ranking
    - Performance impact assessment
    - Implementation guidance and strategies
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.OPTIMIZATION_VIEW])
        
        # Get optimization recommendations
        recommendations_result = await intelligence_service.get_scan_logic_optimizations({
            "scope": scope,
            "priority_level": priority_level,
            "optimization_type": optimization_type,
            "limit": limit,
            "include_impact_analysis": True,
            "include_implementation_guidance": True
        }, session)
        
        if not recommendations_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get optimization recommendations: {recommendations_result['error']}"
            )
        
        return {
            "success": True,
            "scope": scope,
            "priority_level": priority_level,
            "optimization_type": optimization_type,
            "recommendations_count": len(recommendations_result["recommendations"]),
            "recommendations": recommendations_result["recommendations"],
            "summary": {
                "critical": len([r for r in recommendations_result["recommendations"] if r["priority"] == "critical"]),
                "high": len([r for r in recommendations_result["recommendations"] if r["priority"] == "high"]),
                "medium": len([r for r in recommendations_result["recommendations"] if r["priority"] == "medium"]),
                "immediately_actionable": len([r for r in recommendations_result["recommendations"] if r.get("immediate_action", False)])
            },
            "total_impact_score": recommendations_result["total_impact_score"],
            "implementation_complexity": recommendations_result["implementation_complexity"],
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting optimization recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance/insights")
async def get_scan_logic_performance_insights(
    timeframe: str = Query("24h", description="Analysis timeframe"),
    insight_type: str = Query("comprehensive", description="Type of insights"),
    include_predictions: bool = Query(True, description="Include predictive insights"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service)
):
    """
    Get comprehensive scan logic performance insights
    
    This endpoint provides:
    - Advanced performance insights and analysis
    - Predictive performance forecasting
    - Bottleneck identification and resolution
    - Efficiency optimization opportunities
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.PERFORMANCE_INSIGHTS])
        
        # Get performance insights
        insights_result = await intelligence_service.get_scan_logic_performance_insights({
            "timeframe": timeframe,
            "insight_type": insight_type,
            "include_predictions": include_predictions,
            "include_trends": True,
            "include_anomalies": True
        }, session)
        
        if not insights_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get performance insights: {insights_result['error']}"
            )
        
        return {
            "success": True,
            "timeframe": timeframe,
            "insight_type": insight_type,
            "performance_overview": insights_result["performance_overview"],
            "key_insights": insights_result["key_insights"],
            "bottlenecks": insights_result["bottlenecks"],
            "efficiency_metrics": insights_result["efficiency_metrics"],
            "predictions": insights_result.get("predictions", {}) if include_predictions else None,
            "trends": insights_result["trends"],
            "anomalies": insights_result.get("anomalies", []),
            "optimization_opportunities": insights_result["optimization_opportunities"],
            "confidence_score": insights_result["confidence_score"],
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting performance insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream/logic-updates")
async def stream_scan_logic_updates(
    execution_id: Optional[str] = Query(None, description="Specific execution ID"),
    update_types: List[str] = Query(["status", "metrics", "insights"], description="Update types"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager)
):
    """
    Stream real-time scan logic updates and insights
    
    This endpoint provides:
    - Live scan logic execution updates
    - Real-time performance metrics streaming
    - Continuous insight and recommendation updates
    - Event-driven scan logic notifications
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.REAL_TIME_UPDATES])
        
        async def generate_logic_updates_stream():
            """Generate real-time scan logic updates"""
            while True:
                try:
                    # Get latest scan logic updates
                    updates = await unified_manager.get_real_time_logic_updates(
                        execution_id=execution_id,
                        update_types=update_types,
                        user_context={"id": current_user.id, "role": current_user.role},
                        session=session
                    )
                    
                    if updates:
                        # Format as Server-Sent Events
                        for update in updates:
                            yield f"data: {json.dumps(update)}\n\n"
                    
                    await asyncio.sleep(2)  # Update every 2 seconds
                    
                except Exception as e:
                    logger.error(f"Error in scan logic updates stream: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    break
        
        return StreamingResponse(
            generate_logic_updates_stream(),
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
        logger.error(f"Error starting scan logic updates stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Private Helper Functions

async def _validate_scan_logic_request(request: IntelligentScanLogicRequest, session: AsyncSession) -> Dict[str, Any]:
    """Validate scan logic request parameters"""
    try:
        # Validate logic type
        valid_types = ["workflow", "orchestration", "coordination"]
        if request.logic_type not in valid_types:
            return {"valid": False, "error": f"Invalid logic type. Must be one of: {valid_types}"}
        
        # Validate execution strategy
        valid_strategies = ["adaptive", "predictive", "optimized"]
        if request.execution_strategy not in valid_strategies:
            return {"valid": False, "error": f"Invalid execution strategy. Must be one of: {valid_strategies}"}
        
        # Validate scan parameters
        if not request.scan_parameters:
            return {"valid": False, "error": "Scan parameters must be specified"}
        
        return {"valid": True}
        
    except Exception as e:
        return {"valid": False, "error": f"Validation error: {str(e)}"}

# Background Tasks

async def _monitor_scan_logic_execution(
    execution_id: str,
    execution_plan_id: str,
    session: AsyncSession
):
    """Monitor scan logic execution in background"""
    try:
        unified_manager = UnifiedScanManager()
        
        while True:
            # Check execution status
            status = await unified_manager.get_scan_logic_status({
                "execution_id": execution_id,
                "include_details": True
            }, session)
            
            if status["status"] in ["completed", "failed", "cancelled"]:
                # Record final execution results
                await unified_manager.record_scan_logic_results(
                    execution_id,
                    execution_plan_id,
                    status["final_results"],
                    session
                )
                break
            
            # Apply real-time optimizations
            if status.get("optimization_needed"):
                await unified_manager.apply_scan_logic_optimizations(
                    execution_id,
                    status["optimization_params"],
                    session
                )
            
            await asyncio.sleep(10)  # Check every 10 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring scan logic execution {execution_id}: {str(e)}")

async def _monitor_workflow_logic_execution(
    execution_id: str,
    workflow_id: str,
    session: AsyncSession
):
    """Monitor workflow logic execution in background"""
    try:
        workflow_engine = ScanWorkflowEngine()
        
        while True:
            # Check workflow status
            status = await workflow_engine.get_scan_logic_workflow_status(workflow_id, session)
            
            if status["status"] in ["completed", "failed", "cancelled"]:
                # Finalize workflow logic execution
                await workflow_engine.finalize_scan_logic_workflow(
                    execution_id,
                    workflow_id,
                    status["final_state"],
                    session
                )
                break
            
            # Handle workflow logic optimizations
            if status.get("logic_optimization_needed"):
                await workflow_engine.optimize_workflow_logic(
                    workflow_id,
                    status["optimization_params"],
                    session
                )
            
            await asyncio.sleep(15)  # Check every 15 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring workflow logic execution {execution_id}: {str(e)}")

async def _monitor_orchestration_execution(
    execution_id: str,
    orchestration_plan_id: str,
    session: AsyncSession
):
    """Monitor orchestration execution in background"""
    try:
        coordinator = IntelligentScanCoordinator()
        
        while True:
            # Check orchestration status
            status = await coordinator.get_scan_logic_orchestration_status(
                execution_id,
                orchestration_plan_id,
                session
            )
            
            if status["status"] in ["completed", "failed", "cancelled"]:
                # Finalize orchestration results
                await coordinator.finalize_scan_logic_orchestration(
                    execution_id,
                    orchestration_plan_id,
                    status["final_results"],
                    session
                )
                break
            
            # Apply orchestration optimizations
            if status.get("orchestration_optimization_needed"):
                await coordinator.optimize_scan_logic_orchestration(
                    execution_id,
                    status["optimization_params"],
                    session
                )
            
            await asyncio.sleep(20)  # Check every 20 seconds
            
    except Exception as e:
        logger.error(f"Error monitoring orchestration execution {execution_id}: {str(e)}")

# Health Check
@router.get("/health")
async def health_check():
    """Health check for intelligent scanning logic service"""
    return {
        "status": "healthy",
        "service": "intelligent-scanning-logic",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "intelligent_scan_logic",
            "workflow_execution",
            "orchestration_management",
            "performance_optimization",
            "real_time_monitoring",
            "ai_powered_insights"
        ]
    }

@router.get("/models/predictive")
async def get_predictive_models(
    model_types: List[str] = Query(default=["time_series", "regression", "neural_network"]),
    status_filter: str = Query(default="active"),
    include_performance_metrics: bool = Query(default=True),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get predictive ML models for scan analytics"""
    try:
        # Permission check
        if not await require_permissions([Permission.SCAN_INTELLIGENCE_VIEW], current_user):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get scan intelligence service
        intelligence_service = ScanIntelligenceService(session)
        
        # Fetch predictive models
        models = await intelligence_service.get_predictive_models(
            model_types=model_types,
            status_filter=status_filter,
            include_performance_metrics=include_performance_metrics,
            user_id=current_user.id
        )
        
        return {"models": models, "total": len(models)}
        
    except Exception as e:
        logger.error(f"Error fetching predictive models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch predictive models: {str(e)}")