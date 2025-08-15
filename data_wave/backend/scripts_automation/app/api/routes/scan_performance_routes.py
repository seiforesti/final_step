"""
Enterprise Scan Performance Monitoring API Routes

Provides comprehensive API endpoints for:
- Real-time performance monitoring
- Performance metrics and analytics
- Bottleneck detection and optimization
- Resource utilization tracking
- Performance alerts and reporting
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Body
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from typing import List, Optional, Dict, Any, Union
import asyncio
import json
import logging
from datetime import datetime, timedelta
import uuid

from ...db_session import get_session
from ...api.security.rbac import get_current_user, require_permission
from ...core.response_models import SuccessResponse, ErrorResponse
from ...core.cache import cache_response
from ...utils.rate_limiter import get_rate_limiter, rate_limit
try:
    from ...utils import audit_logger as _audit
    audit_log = _audit.audit_log
except Exception:
    import logging as _logging
    async def audit_log(**kwargs):
        _logging.getLogger(__name__).info("AUDIT_FALLBACK", extra=kwargs)
from ...services.scan_performance_service import ScanPerformanceService
from ...models.scan_performance_models import (
    PerformanceMetric, PerformanceHistory, PerformanceBottleneck, PerformanceOptimization,
    PerformanceAlert, PerformanceBenchmark, ResourceUtilization, PerformanceReport,
    PerformanceMetricType, PerformanceStatus, BottleneckType, OptimizationType,
    MonitoringScope, AlertSeverity, ResourceType, TrendDirection, BenchmarkType
)
from ...models.api import (
    PerformanceMetricRequest, PerformanceMetricResponse,
    PerformanceOptimizationRequest, PerformanceOptimizationResponse,
    PerformanceAlertRequest, PerformanceAlertResponse,
    PerformanceBenchmarkRequest, PerformanceBenchmarkResponse,
    PerformanceReportRequest, PerformanceReportResponse,
    PerformanceAnalyticsRequest, PerformanceAnalyticsResponse,
    PerformanceMetricsResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/scan-performance", tags=["Scan Performance"])
rate_limiter = get_rate_limiter()

def get_performance_service() -> ScanPerformanceService:
    """Dependency to get scan performance service instance"""
    return ScanPerformanceService()

# Performance Metrics Routes

@router.get("/metrics")
@rate_limit(requests=300, window=60)
@cache_response(ttl=30)
async def get_performance_metrics(
    scope: Optional[MonitoringScope] = Query(default=None, description="Monitoring scope"),
    resource_type: Optional[ResourceType] = Query(default=None, description="Resource type filter"),
    metric_types: Optional[List[PerformanceMetricType]] = Query(default=None, description="Metric types to retrieve"),
    time_range: Optional[str] = Query(default="1h", description="Time range (5m, 1h, 24h, 7d)"),
    aggregation: Optional[str] = Query(default="avg", description="Aggregation method (avg, min, max, sum)"),
    include_history: bool = Query(default=False, description="Include historical data"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get real-time performance metrics across all scan operations.
    
    Features:
    - Real-time metrics collection
    - Multiple aggregation methods
    - Historical data inclusion
    - Cross-resource monitoring
    """
    try:
        metrics = await performance_service.get_performance_metrics(
            scope=scope,
            resource_type=resource_type,
            metric_types=metric_types,
            time_range=time_range,
            aggregation=aggregation,
            include_history=include_history
        )
        
        return SuccessResponse(
            message="Performance metrics retrieved successfully",
            data={
                "metrics": [PerformanceMetricResponse.from_orm(metric) for metric in metrics],
                "summary": await performance_service.get_metrics_summary(metrics),
                "trends": await performance_service.get_metrics_trends(metrics) if include_history else None
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get performance metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Metrics retrieval failed: {str(e)}")

@router.post("/metrics")
@rate_limit(requests=200, window=60)
async def record_performance_metric(
    request: PerformanceMetricRequest,
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Record a new performance metric.
    
    Features:
    - Custom metric recording
    - Automatic threshold evaluation
    - Real-time alerting
    - Historical tracking
    """
    try:
        await audit_log(
            action="performance_metric_recorded",
            user_id=current_user.get("user_id"),
            resource_type="performance_metric",
            resource_id=None,
            metadata={"metric_type": request.metric_type, "resource_id": request.resource_id}
        )
        
        metric = await performance_service.record_performance_metric(
            metric_name=request.metric_name,
            metric_type=request.metric_type,
            scope=request.scope,
            resource_id=request.resource_id,
            resource_type=request.resource_type,
            component=request.component,
            current_value=request.current_value,
            unit=request.unit,
            warning_threshold=request.warning_threshold,
            critical_threshold=request.critical_threshold,
            target_value=request.target_value,
            tags=request.tags,
            recorded_by=current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Performance metric recorded successfully",
            data={
                "metric": PerformanceMetricResponse.from_orm(metric),
                "status": metric.status.value,
                "alerts_triggered": await performance_service.check_metric_alerts(metric.metric_id)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to record performance metric: {e}")
        raise HTTPException(status_code=500, detail=f"Metric recording failed: {str(e)}")

@router.get("/metrics/{metric_id}")
@rate_limit(requests=400, window=60)
@cache_response(ttl=60)
async def get_performance_metric(
    metric_id: str,
    include_history: bool = Query(default=True, description="Include historical data"),
    include_alerts: bool = Query(default=True, description="Include related alerts"),
    time_range: Optional[str] = Query(default="24h", description="History time range"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get detailed information about a specific performance metric.
    
    Features:
    - Complete metric details and configuration
    - Historical performance data
    - Related alerts and notifications
    - Trend analysis and forecasting
    """
    try:
        metric = await performance_service.get_performance_metric(
            metric_id=metric_id,
            include_history=include_history,
            include_alerts=include_alerts,
            time_range=time_range
        )
        
        if not metric:
            raise HTTPException(status_code=404, detail="Performance metric not found")
        
        return SuccessResponse(
            message="Performance metric retrieved successfully",
            data={"metric": PerformanceMetricResponse.from_orm(metric)}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get performance metric {metric_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Metric retrieval failed: {str(e)}")

# Performance Optimization Routes

@router.post("/optimizations")
@rate_limit(requests=50, window=60)
async def create_performance_optimization(
    request: PerformanceOptimizationRequest,
    background_tasks: BackgroundTasks,
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create and execute performance optimization.
    
    Features:
    - Multiple optimization types (resource, throughput, latency)
    - AI-powered optimization strategies
    - Impact prediction and validation
    - Rollback capabilities
    """
    try:
        await audit_log(
            action="performance_optimization_created",
            user_id=current_user.get("user_id"),
            resource_type="performance_optimization",
            resource_id=None,
            metadata={"optimization_type": request.optimization_type, "target_id": request.target_id}
        )
        
        optimization = await performance_service.create_performance_optimization(
            optimization_name=request.optimization_name,
            optimization_type=request.optimization_type,
            target_id=request.target_id,
            target_type=request.target_type,
            optimization_strategy=request.optimization_strategy,
            parameters=request.parameters,
            constraints=request.constraints,
            auto_execute=request.auto_execute,
            created_by=current_user.get("user_id")
        )
        
        # Execute optimization in background if auto_execute is True
        if request.auto_execute:
            background_tasks.add_task(
                performance_service.execute_optimization,
                optimization.optimization_id
            )
        
        return SuccessResponse(
            message="Performance optimization created successfully",
            data={
                "optimization": PerformanceOptimizationResponse.from_orm(optimization),
                "execution_status": "started" if request.auto_execute else "pending",
                "estimated_impact": optimization.estimated_impact
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create performance optimization: {e}")
        raise HTTPException(status_code=500, detail=f"Optimization creation failed: {str(e)}")

@router.post("/optimizations/{optimization_id}/execute")
@rate_limit(requests=30, window=60)
async def execute_performance_optimization(
    optimization_id: str,
    background_tasks: BackgroundTasks,
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Execute a pending performance optimization.
    
    Features:
    - Safe execution with impact monitoring
    - Real-time progress tracking
    - Automatic rollback on failure
    - Performance validation
    """
    try:
        await audit_log(
            action="performance_optimization_executed",
            user_id=current_user.get("user_id"),
            resource_type="performance_optimization",
            resource_id=optimization_id
        )
        
        result = await performance_service.execute_optimization(optimization_id)
        
        background_tasks.add_task(
            performance_service.monitor_optimization_impact,
            optimization_id
        )
        
        return SuccessResponse(
            message="Performance optimization execution started",
            data={
                "optimization_id": optimization_id,
                "execution_status": result.get("status"),
                "estimated_completion": result.get("estimated_completion"),
                "monitoring_url": f"/api/v1/scan-performance/optimizations/{optimization_id}/stream"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to execute performance optimization {optimization_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Optimization execution failed: {str(e)}")

@router.get("/optimizations")
@rate_limit(requests=200, window=60)
@cache_response(ttl=180)
async def list_performance_optimizations(
    optimization_type: Optional[OptimizationType] = Query(default=None, description="Filter by optimization type"),
    status: Optional[str] = Query(default=None, description="Filter by execution status"),
    target_type: Optional[str] = Query(default=None, description="Filter by target type"),
    time_range: Optional[str] = Query(default="7d", description="Time range (1h, 24h, 7d, 30d)"),
    include_results: bool = Query(default=False, description="Include optimization results"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List performance optimizations with filtering and pagination.
    
    Features:
    - Advanced filtering options
    - Result inclusion for completed optimizations
    - Summary statistics and trends
    - Export capabilities
    """
    try:
        optimizations = await performance_service.list_performance_optimizations(
            optimization_type=optimization_type,
            status=status,
            target_type=target_type,
            time_range=time_range,
            include_results=include_results,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await performance_service.count_performance_optimizations(
            optimization_type=optimization_type,
            status=status,
            target_type=target_type,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Performance optimizations retrieved successfully",
            data={
                "optimizations": [PerformanceOptimizationResponse.from_orm(opt) for opt in optimizations],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                },
                "summary": await performance_service.get_optimization_summary(
                    optimization_type=optimization_type,
                    time_range=time_range
                )
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list performance optimizations: {e}")
        raise HTTPException(status_code=500, detail=f"Optimization listing failed: {str(e)}")

# Bottleneck Detection Routes

@router.post("/bottlenecks/detect")
@rate_limit(requests=100, window=60)
async def detect_performance_bottlenecks(
    scope: Optional[MonitoringScope] = Query(default=MonitoringScope.GLOBAL, description="Detection scope"),
    resource_types: Optional[List[ResourceType]] = Query(default=None, description="Resource types to analyze"),
    time_range: Optional[str] = Query(default="1h", description="Analysis time range"),
    sensitivity: Optional[float] = Query(default=0.8, ge=0.1, le=1.0, description="Detection sensitivity"),
    include_recommendations: bool = Query(default=True, description="Include optimization recommendations"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Detect performance bottlenecks using AI-powered analysis.
    
    Features:
    - Multi-dimensional bottleneck detection
    - Root cause analysis
    - Impact assessment
    - Optimization recommendations
    """
    try:
        await audit_log(
            action="bottleneck_detection_started",
            user_id=current_user.get("user_id"),
            resource_type="bottleneck_detection",
            resource_id=None,
            metadata={"scope": scope.value if scope else "global", "time_range": time_range}
        )
        
        bottlenecks = await performance_service.detect_performance_bottlenecks(
            scope=scope,
            resource_types=resource_types,
            time_range=time_range,
            sensitivity=sensitivity,
            include_recommendations=include_recommendations,
            user_id=current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Bottleneck detection completed successfully",
            data={
                "bottlenecks": bottlenecks,
                "total_bottlenecks": len(bottlenecks),
                "severity_distribution": await performance_service.get_bottleneck_severity_distribution(bottlenecks),
                "recommendations": await performance_service.get_bottleneck_recommendations(bottlenecks) if include_recommendations else None
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to detect performance bottlenecks: {e}")
        raise HTTPException(status_code=500, detail=f"Bottleneck detection failed: {str(e)}")

@router.get("/bottlenecks")
@rate_limit(requests=200, window=60)
@cache_response(ttl=120)
async def list_performance_bottlenecks(
    bottleneck_type: Optional[BottleneckType] = Query(default=None, description="Filter by bottleneck type"),
    severity: Optional[AlertSeverity] = Query(default=None, description="Filter by severity"),
    status: Optional[str] = Query(default=None, description="Filter by resolution status"),
    time_range: Optional[str] = Query(default="24h", description="Time range (1h, 24h, 7d, 30d)"),
    include_recommendations: bool = Query(default=True, description="Include recommendations"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=50, ge=1, le=200, description="Page size"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List detected performance bottlenecks with filtering.
    
    Features:
    - Advanced filtering by type, severity, and status
    - Time-based filtering
    - Recommendation inclusion
    - Trend analysis
    """
    try:
        bottlenecks = await performance_service.list_performance_bottlenecks(
            bottleneck_type=bottleneck_type,
            severity=severity,
            status=status,
            time_range=time_range,
            include_recommendations=include_recommendations,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await performance_service.count_performance_bottlenecks(
            bottleneck_type=bottleneck_type,
            severity=severity,
            status=status,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Performance bottlenecks retrieved successfully",
            data={
                "bottlenecks": bottlenecks,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                },
                "analytics": await performance_service.get_bottleneck_analytics(
                    bottleneck_type=bottleneck_type,
                    time_range=time_range
                )
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list performance bottlenecks: {e}")
        raise HTTPException(status_code=500, detail=f"Bottleneck listing failed: {str(e)}")

# Performance Alerts Routes

@router.post("/alerts")
@rate_limit(requests=100, window=60)
async def create_performance_alert(
    request: PerformanceAlertRequest,
    background_tasks: BackgroundTasks,
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a performance alert configuration.
    
    Features:
    - Customizable alert conditions
    - Multiple notification channels
    - Escalation policies
    - Automated response actions
    """
    try:
        await audit_log(
            action="performance_alert_created",
            user_id=current_user.get("user_id"),
            resource_type="performance_alert",
            resource_id=None,
            metadata={"alert_name": request.alert_name, "metric_id": request.metric_id}
        )
        
        alert = await performance_service.create_performance_alert(
            alert_name=request.alert_name,
            metric_id=request.metric_id,
            alert_condition=request.alert_condition,
            threshold_value=request.threshold_value,
            severity=request.severity,
            notification_channels=request.notification_channels,
            escalation_policy=request.escalation_policy,
            auto_response=request.auto_response,
            is_active=request.is_active,
            created_by=current_user.get("user_id")
        )
        
        # Activate alert monitoring if enabled
        if request.is_active:
            background_tasks.add_task(
                performance_service.activate_alert_monitoring,
                alert.alert_id
            )
        
        return SuccessResponse(
            message="Performance alert created successfully",
            data={
                "alert": PerformanceAlertResponse.from_orm(alert),
                "monitoring_status": "active" if request.is_active else "inactive"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create performance alert: {e}")
        raise HTTPException(status_code=500, detail=f"Alert creation failed: {str(e)}")

@router.get("/alerts")
@rate_limit(requests=200, window=60)
@cache_response(ttl=180)
async def list_performance_alerts(
    severity: Optional[AlertSeverity] = Query(default=None, description="Filter by severity"),
    status: Optional[str] = Query(default=None, description="Filter by alert status"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    time_range: Optional[str] = Query(default="24h", description="Time range for triggered alerts"),
    include_history: bool = Query(default=False, description="Include alert history"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=50, ge=1, le=200, description="Page size"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List performance alerts with filtering and history.
    
    Features:
    - Advanced filtering options
    - Alert history inclusion
    - Status tracking
    - Performance analytics
    """
    try:
        alerts = await performance_service.list_performance_alerts(
            severity=severity,
            status=status,
            is_active=is_active,
            time_range=time_range,
            include_history=include_history,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await performance_service.count_performance_alerts(
            severity=severity,
            status=status,
            is_active=is_active,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Performance alerts retrieved successfully",
            data={
                "alerts": [PerformanceAlertResponse.from_orm(alert) for alert in alerts],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                },
                "summary": await performance_service.get_alert_summary(
                    severity=severity,
                    time_range=time_range
                )
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list performance alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Alert listing failed: {str(e)}")

# Performance Benchmarks Routes

@router.post("/benchmarks")
@rate_limit(requests=30, window=60)
async def create_performance_benchmark(
    request: PerformanceBenchmarkRequest,
    background_tasks: BackgroundTasks,
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a performance benchmark for comparison.
    
    Features:
    - Multiple benchmark types (baseline, target, industry)
    - Automated benchmark updates
    - Comparative analysis
    - Trend tracking
    """
    try:
        await audit_log(
            action="performance_benchmark_created",
            user_id=current_user.get("user_id"),
            resource_type="performance_benchmark",
            resource_id=None,
            metadata={"benchmark_name": request.benchmark_name, "benchmark_type": request.benchmark_type}
        )
        
        benchmark = await performance_service.create_performance_benchmark(
            benchmark_name=request.benchmark_name,
            benchmark_type=request.benchmark_type,
            scope=request.scope,
            metrics=request.metrics,
            target_values=request.target_values,
            baseline_period=request.baseline_period,
            auto_update=request.auto_update,
            created_by=current_user.get("user_id")
        )
        
        # Calculate initial benchmark values if auto_update is enabled
        if request.auto_update:
            background_tasks.add_task(
                performance_service.calculate_benchmark_values,
                benchmark.benchmark_id
            )
        
        return SuccessResponse(
            message="Performance benchmark created successfully",
            data={"benchmark": PerformanceBenchmarkResponse.from_orm(benchmark)}
        )
        
    except Exception as e:
        logger.error(f"Failed to create performance benchmark: {e}")
        raise HTTPException(status_code=500, detail=f"Benchmark creation failed: {str(e)}")

@router.get("/benchmarks")
@rate_limit(requests=200, window=60)
@cache_response(ttl=300)
async def list_performance_benchmarks(
    benchmark_type: Optional[BenchmarkType] = Query(default=None, description="Filter by benchmark type"),
    scope: Optional[MonitoringScope] = Query(default=None, description="Filter by scope"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    include_values: bool = Query(default=True, description="Include current benchmark values"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List performance benchmarks with current values.
    
    Features:
    - Advanced filtering options
    - Current value inclusion
    - Comparative analysis
    - Trend indicators
    """
    try:
        benchmarks = await performance_service.list_performance_benchmarks(
            benchmark_type=benchmark_type,
            scope=scope,
            is_active=is_active,
            include_values=include_values,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await performance_service.count_performance_benchmarks(
            benchmark_type=benchmark_type,
            scope=scope,
            is_active=is_active
        )
        
        return SuccessResponse(
            message="Performance benchmarks retrieved successfully",
            data={
                "benchmarks": [PerformanceBenchmarkResponse.from_orm(benchmark) for benchmark in benchmarks],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list performance benchmarks: {e}")
        raise HTTPException(status_code=500, detail=f"Benchmark listing failed: {str(e)}")

# Performance Analytics Routes

@router.get("/analytics")
@rate_limit(requests=100, window=60)
@cache_response(ttl=600)
async def get_performance_analytics(
    scope: Optional[MonitoringScope] = Query(default=MonitoringScope.GLOBAL, description="Analytics scope"),
    time_range: Optional[str] = Query(default="7d", description="Time range for analytics"),
    include_trends: bool = Query(default=True, description="Include trend analysis"),
    include_predictions: bool = Query(default=False, description="Include performance predictions"),
    include_comparisons: bool = Query(default=True, description="Include benchmark comparisons"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get comprehensive performance analytics and insights.
    
    Features:
    - Cross-dimensional performance analysis
    - Trend identification and forecasting
    - Benchmark comparisons
    - Predictive performance insights
    """
    try:
        analytics = await performance_service.get_performance_analytics(
            scope=scope,
            time_range=time_range,
            include_trends=include_trends,
            include_predictions=include_predictions,
            include_comparisons=include_comparisons
        )
        
        return SuccessResponse(
            message="Performance analytics retrieved successfully",
            data=PerformanceAnalyticsResponse(**analytics)
        )
        
    except Exception as e:
        logger.error(f"Failed to get performance analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Performance analytics retrieval failed: {str(e)}")

@router.get("/resource-utilization")
@rate_limit(requests=300, window=60)
@cache_response(ttl=60)
async def get_resource_utilization(
    resource_types: Optional[List[ResourceType]] = Query(default=None, description="Resource types to monitor"),
    time_range: Optional[str] = Query(default="1h", description="Time range for utilization data"),
    aggregation: Optional[str] = Query(default="avg", description="Aggregation method"),
    include_forecasts: bool = Query(default=False, description="Include utilization forecasts"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get real-time resource utilization metrics.
    
    Features:
    - Multi-resource monitoring
    - Real-time utilization tracking
    - Usage forecasting
    - Capacity planning insights
    """
    try:
        utilization = await performance_service.get_resource_utilization(
            resource_types=resource_types,
            time_range=time_range,
            aggregation=aggregation,
            include_forecasts=include_forecasts
        )
        
        return SuccessResponse(
            message="Resource utilization retrieved successfully",
            data={
                "utilization": utilization,
                "summary": await performance_service.get_utilization_summary(utilization),
                "recommendations": await performance_service.get_capacity_recommendations(utilization)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get resource utilization: {e}")
        raise HTTPException(status_code=500, detail=f"Resource utilization retrieval failed: {str(e)}")

# Performance Reports Routes

@router.post("/reports")
@rate_limit(requests=30, window=60)
async def generate_performance_report(
    request: PerformanceReportRequest,
    background_tasks: BackgroundTasks,
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Generate comprehensive performance reports.
    
    Features:
    - Multiple report types (summary, detailed, trend, compliance)
    - Customizable time ranges and filters
    - Export formats (PDF, Excel, JSON)
    - Automated report scheduling
    """
    try:
        await audit_log(
            action="performance_report_generated",
            user_id=current_user.get("user_id"),
            resource_type="performance_report",
            resource_id=None,
            metadata={"report_type": request.report_type, "scope": request.scope}
        )
        
        report = await performance_service.generate_performance_report(
            report_type=request.report_type,
            scope=request.scope,
            filters=request.filters,
            time_range=request.time_range,
            output_format=request.output_format,
            include_recommendations=request.include_recommendations,
            auto_generate=request.auto_generate,
            user_id=current_user.get("user_id")
        )
        
        # Generate report in background if auto_generate is True
        if request.auto_generate:
            background_tasks.add_task(
                performance_service.generate_report_content,
                report.report_id
            )
        
        return SuccessResponse(
            message="Performance report generation started",
            data={
                "report": PerformanceReportResponse.from_orm(report),
                "generation_status": "started" if request.auto_generate else "pending"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to generate performance report: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.get("/system-health")
@rate_limit(requests=400, window=60)
async def get_system_health(
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get real-time system health and performance indicators.
    
    Features:
    - Overall system health score
    - Critical performance indicators
    - Active alerts and warnings
    - Resource availability status
    """
    try:
        health = await performance_service.get_system_health()
        
        return SuccessResponse(
            message="System health retrieved successfully",
            data=PerformanceMetricsResponse(**health)
        )
        
    except Exception as e:
        logger.error(f"Failed to get system health: {e}")
        raise HTTPException(status_code=500, detail=f"System health retrieval failed: {str(e)}")

# Streaming and Real-time Routes

@router.get("/stream/metrics")
async def stream_performance_metrics(
    metric_types: Optional[List[PerformanceMetricType]] = Query(default=None, description="Metric types to stream"),
    scope: Optional[MonitoringScope] = Query(default=MonitoringScope.GLOBAL, description="Monitoring scope"),
    update_interval: Optional[int] = Query(default=5, ge=1, le=60, description="Update interval in seconds"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time performance metrics.
    
    Features:
    - Live metrics streaming
    - Configurable update intervals
    - Multiple metric types
    - Real-time alerting
    """
    async def metrics_stream():
        try:
            async for metrics_data in performance_service.stream_performance_metrics(
                metric_types=metric_types,
                scope=scope,
                update_interval=update_interval,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(metrics_data)}\n\n"
                await asyncio.sleep(update_interval)
        except Exception as e:
            logger.error(f"Metrics stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        metrics_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@router.get("/stream/alerts")
async def stream_performance_alerts(
    severity_min: Optional[AlertSeverity] = Query(default=AlertSeverity.MEDIUM, description="Minimum alert severity"),
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time performance alerts.
    
    Features:
    - Live alert notifications
    - Severity-based filtering
    - Automated response triggers
    - Alert correlation
    """
    async def alert_stream():
        try:
            async for alert_data in performance_service.stream_performance_alerts(
                severity_min=severity_min,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(alert_data)}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"Alert stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        alert_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@router.get("/stream/optimizations/{optimization_id}")
async def stream_optimization_progress(
    optimization_id: str,
    performance_service: ScanPerformanceService = Depends(get_performance_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time optimization progress and results.
    
    Features:
    - Live optimization progress
    - Impact monitoring
    - Performance validation
    - Rollback notifications
    """
    async def optimization_stream():
        try:
            async for progress_data in performance_service.stream_optimization_progress(
                optimization_id=optimization_id,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(progress_data)}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"Optimization stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        optimization_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )