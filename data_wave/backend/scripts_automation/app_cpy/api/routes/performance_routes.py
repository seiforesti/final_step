from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session
from datetime import datetime, timedelta
import logging

from app.db_session import get_session
from app.services.performance_service import PerformanceService
from app.models.performance_models import (
    PerformanceMetric, PerformanceAlert,
)
from app.api.security.rbac import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_PERFORMANCE_VIEW, PERMISSION_PERFORMANCE_MANAGE,
    PERMISSION_ALERTS_VIEW, PERMISSION_ALERTS_MANAGE
)

router = APIRouter(prefix="/performance", tags=["Performance"])

@router.get("/metrics/{data_source_id}")
async def get_enhanced_performance_metrics(
    data_source_id: int,
    time_range: str = Query("24h", description="Time range (1h, 24h, 7d, 30d)"),
    metric_types: List[str] = Query(default=["cpu", "memory", "io", "network"], description="Metric types to include"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_VIEW))
) -> Dict[str, Any]:
    """
    Enhanced performance metrics with real-time monitoring
    
    Features:
    - Real-time performance tracking
    - Historical trend analysis
    - Predictive performance insights
    - Resource optimization recommendations
    """
    try:
        result = PerformanceService.get_enhanced_performance_metrics(
            session=session,
            data_source_id=data_source_id,
            time_range=time_range,
            metric_types=metric_types
        )
        
        return {
            "success": True,
            "data": result,
            "monitoring_features": [
                "real_time_tracking",
                "trend_analysis",
                "predictive_insights",
                "optimization_recommendations"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance metrics: {str(e)}"
        )

@router.get("/system/health")
async def get_system_health_metrics(
    include_detailed: bool = Query(False, description="Include detailed health metrics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_VIEW))
) -> Dict[str, Any]:
    """
    Get comprehensive system health metrics
    
    Features:
    - Overall system health score
    - Component-level health tracking
    - Service availability monitoring
    - Performance degradation detection
    """
    try:
        result = PerformanceService.get_system_health_metrics(
            session=session,
            include_detailed=include_detailed
        )
        
        return {
            "success": True,
            "data": result,
            "health_features": [
                "health_scoring",
                "component_tracking",
                "availability_monitoring",
                "degradation_detection"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system health: {str(e)}"
        )

@router.get("/alerts")
async def get_performance_alerts(
    severity: str = Query("all", description="Filter by alert severity"),
    days: int = Query(7, description="Number of days to look back"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get performance alerts and notifications
    
    Features:
    - Alert severity filtering
    - Time-based filtering
    - Data source filtering
    - Alert management
    """
    try:
        from app.services.performance_service import PerformanceService
        
        performance_service = PerformanceService()
        alerts = performance_service.get_performance_alerts(
            session=session,
            severity=severity,
            days=days,
            data_source_id=data_source_id
        )
        
        return {
            "success": True,
            "data": alerts,
            "filters": {
                "severity": severity,
                "days": days,
                "data_source_id": data_source_id
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance alerts: {str(e)}"
        )

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_performance_alert(
    alert_id: int,
    acknowledgment_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ALERTS_MANAGE))
) -> Dict[str, Any]:
    """
    Acknowledge performance alerts
    
    Features:
    - Alert acknowledgment tracking
    - Escalation prevention
    - Team notification system
    - Response time analytics
    """
    try:
        result = PerformanceService.acknowledge_alert(
            session=session,
            alert_id=alert_id,
            acknowledgment_data=acknowledgment_data,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Alert acknowledged successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to acknowledge alert: {str(e)}"
        )

@router.post("/alerts/{alert_id}/resolve")
async def resolve_performance_alert(
    alert_id: int,
    resolution_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ALERTS_MANAGE))
) -> Dict[str, Any]:
    """Resolve a performance alert with resolution details"""
    try:
        result = PerformanceService.resolve_alert(
            session=session,
            alert_id=alert_id,
            resolution_data=resolution_data,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Alert resolved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resolve alert: {str(e)}"
        )

@router.get("/thresholds")
async def get_performance_thresholds(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    threshold_type: Optional[str] = Query(None, description="Filter by threshold type"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get performance thresholds and limits
    
    Features:
    - Threshold configuration
    - Data source filtering
    - Threshold type filtering
    - Configuration management
    """
    try:
        from app.services.performance_service import PerformanceService
        
        performance_service = PerformanceService()
        thresholds = performance_service.get_performance_thresholds(
            session=session,
            data_source_id=data_source_id,
            threshold_type=threshold_type
        )
        
        return {
            "success": True,
            "data": thresholds,
            "filters": {
                "data_source_id": data_source_id,
                "threshold_type": threshold_type
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance thresholds: {str(e)}"
        )

@router.post("/thresholds")
async def create_performance_threshold(
    threshold_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_MANAGE))
) -> Dict[str, Any]:
    """
    Create custom performance thresholds
    
    Features:
    - Dynamic threshold management
    - Adaptive threshold learning
    - Multi-condition thresholds
    - Business impact scoring
    """
    try:
        result = PerformanceService.create_performance_threshold(
            session=session,
            threshold_data=threshold_data,
            creator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Threshold created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create threshold: {str(e)}"
        )

@router.get("/analytics/trends")
async def get_performance_trends(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    time_range: str = Query("30d", description="Time range for trend analysis"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_VIEW))
) -> Dict[str, Any]:
    """
    Get performance trend analysis
    
    Features:
    - Long-term performance trends
    - Seasonal pattern detection
    - Performance forecasting
    - Capacity planning insights
    """
    try:
        result = PerformanceService.get_performance_trends(
            session=session,
            data_source_id=data_source_id,
            time_range=time_range
        )
        
        return {
            "success": True,
            "data": result,
            "analytics_features": [
                "trend_analysis",
                "pattern_detection",
                "forecasting",
                "capacity_planning"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance trends: {str(e)}"
        )

@router.get("/optimization/recommendations")
async def get_optimization_recommendations(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_VIEW))
) -> Dict[str, Any]:
    """
    Get AI-powered performance optimization recommendations
    
    Features:
    - Intelligent performance analysis
    - Resource optimization suggestions
    - Cost-benefit analysis
    - Implementation guidance
    """
    try:
        result = PerformanceService.get_optimization_recommendations(
            session=session,
            data_source_id=data_source_id
        )
        
        return {
            "success": True,
            "data": result,
            "optimization_features": [
                "ai_analysis",
                "resource_optimization",
                "cost_benefit_analysis",
                "implementation_guidance"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )

@router.post("/monitoring/start")
async def start_real_time_monitoring(
    monitoring_config: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_MANAGE))
) -> Dict[str, Any]:
    """
    Start real-time performance monitoring
    
    Features:
    - Real-time metric collection
    - Streaming performance data
    - Instant alerting
    - Live performance dashboards
    """
    try:
        result = PerformanceService.start_real_time_monitoring(
            session=session,
            monitoring_config=monitoring_config,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Real-time monitoring started",
            "monitoring_features": [
                "real_time_collection",
                "streaming_data",
                "instant_alerts",
                "live_dashboards"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start monitoring: {str(e)}"
        )

@router.post("/monitoring/stop")
async def stop_real_time_monitoring(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_MANAGE))
) -> Dict[str, Any]:
    """Stop real-time performance monitoring for a data source"""
    try:
        result = PerformanceService.stop_real_time_monitoring(
            session=session,
            data_source_id=data_source_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Real-time monitoring stopped"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stop monitoring: {str(e)}"
        )

@router.get("/reports/summary")
async def get_performance_summary_report(
    time_range: str = Query("7d", description="Time range for the report"),
    data_sources: Optional[List[int]] = Query(None, description="Filter by data source IDs"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_VIEW))
) -> Dict[str, Any]:
    """
    Get comprehensive performance summary report
    
    Features:
    - Executive performance summary
    - Key performance indicators
    - Performance comparison analysis
    - Actionable insights and recommendations
    """
    try:
        result = PerformanceService.get_performance_summary_report(
            session=session,
            time_range=time_range,
            data_sources=data_sources
        )
        
        return {
            "success": True,
            "data": result,
            "report_features": [
                "executive_summary",
                "kpi_tracking",
                "comparison_analysis",
                "actionable_insights"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance report: {str(e)}"
        )