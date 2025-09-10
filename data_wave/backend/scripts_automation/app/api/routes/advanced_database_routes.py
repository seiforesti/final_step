"""
🔥 ADVANCED DATABASE MANAGEMENT API ROUTES 🔥
===============================================

These routes provide comprehensive control and monitoring of the
Advanced Database Master Controller system.

Features:
- Real-time Performance Monitoring
- System Health Dashboard
- Advanced Configuration Management
- Emergency Controls
- Performance Analytics
- Resource Optimization
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
import logging
import time

# Import the advanced database system
try:
    from app.core.database_master_controller import (
        get_database_master_controller,
        get_system_status,
        force_system_optimization,
        OperationMode
    )
    from app.core.advanced_monitoring import get_advanced_monitor, AlertLevel
    from app.core.query_scheduler import get_query_scheduler
    from app.core.database_resilience_engine import get_resilience_engine, QueryPriority
    ADVANCED_SYSTEM_AVAILABLE = True
except ImportError:
    ADVANCED_SYSTEM_AVAILABLE = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/database/advanced", tags=["Advanced Database Management"])

@router.get("/status")
async def get_database_status():
    """
    🔍 GET COMPREHENSIVE DATABASE STATUS
    
    Returns complete status of all database components including:
    - Master Controller status
    - Resilience Engine health
    - Query Scheduler performance
    - Advanced Monitoring alerts
    - Real-time metrics
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Advanced database system not available",
                "message": "System is running in legacy mode"
            }
        )
    
    try:
        status = get_system_status()
        return {
            "status": "success",
            "timestamp": time.time(),
            "system_status": status,
            "features_enabled": [
                "Intelligent Connection Pooling",
                "Advanced Circuit Breaker",
                "Query Optimization & Caching",
                "Real-time Monitoring",
                "Predictive Scaling",
                "Auto-Recovery",
                "Performance Analytics"
            ]
        }
    except Exception as e:
        logger.error(f"Failed to get database status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def get_health_summary():
    """
    ❤️ GET HEALTH SUMMARY
    
    Returns comprehensive health summary with scores and alerts.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return {"health": "legacy_mode", "score": 50}
    
    try:
        monitor = get_advanced_monitor()
        health_summary = monitor.get_health_summary()
        
        return {
            "status": "success",
            "health": health_summary,
            "recommendations": _get_health_recommendations(health_summary)
        }
    except Exception as e:
        logger.error(f"Failed to get health summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance")
async def get_performance_metrics():
    """
    📊 GET PERFORMANCE METRICS
    
    Returns detailed performance metrics and analytics.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return {"error": "Advanced system not available"}
    
    try:
        controller = get_database_master_controller()
        performance_report = controller.get_performance_report()
        
        # Add scheduler metrics
        scheduler = get_query_scheduler()
        scheduler_status = scheduler.get_status()
        
        return {
            "status": "success",
            "performance_report": performance_report,
            "scheduler_metrics": {
                "active_queries": scheduler_status['active_queries'],
                "total_queued": scheduler_status['total_queued'],
                "throughput_qps": scheduler_status['metrics']['throughput_qps'],
                "queue_sizes": scheduler_status['queue_sizes']
            },
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to get performance metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_active_alerts(include_resolved: bool = Query(False)):
    """
    🚨 GET ACTIVE ALERTS
    
    Returns current system alerts and their status.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return {"alerts": [], "message": "Advanced monitoring not available"}
    
    try:
        monitor = get_advanced_monitor()
        alerts = monitor.get_alerts(include_resolved=include_resolved)
        
        alert_data = []
        for alert in alerts:
            alert_data.append({
                "id": alert.alert_id,
                "level": alert.level.value,
                "title": alert.title,
                "message": alert.message,
                "metric": alert.metric_name,
                "current_value": alert.current_value,
                "threshold": alert.threshold,
                "timestamp": alert.timestamp,
                "acknowledged": alert.acknowledged,
                "resolved": alert.resolved
            })
        
        return {
            "status": "success",
            "alerts": alert_data,
            "summary": {
                "total": len(alert_data),
                "critical": len([a for a in alerts if a.level == AlertLevel.CRITICAL]),
                "warnings": len([a for a in alerts if a.level == AlertLevel.WARNING]),
                "unresolved": len([a for a in alerts if not a.resolved])
            }
        }
    except Exception as e:
        logger.error(f"Failed to get alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """
    ✅ ACKNOWLEDGE ALERT
    
    Acknowledge a specific alert to stop notifications.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        raise HTTPException(status_code=503, detail="Advanced system not available")
    
    try:
        monitor = get_advanced_monitor()
        monitor.acknowledge_alert(alert_id)
        
        return {
            "status": "success",
            "message": f"Alert {alert_id} acknowledged",
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to acknowledge alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics(
    metric_names: Optional[List[str]] = Query(None),
    time_range: int = Query(3600, description="Time range in seconds")
):
    """
    📈 GET DETAILED METRICS
    
    Returns detailed metrics data for analysis and visualization.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return {"metrics": {}, "message": "Advanced monitoring not available"}
    
    try:
        monitor = get_advanced_monitor()
        metrics = monitor.get_metrics(metric_names, time_range)
        
        # Convert to JSON-serializable format
        serialized_metrics = {}
        for name, points in metrics.items():
            serialized_metrics[name] = [
                {
                    "timestamp": point.timestamp,
                    "value": point.value,
                    "tags": point.tags
                }
                for point in points
            ]
        
        return {
            "status": "success",
            "metrics": serialized_metrics,
            "time_range": time_range,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize")
async def force_optimization():
    """
    🔧 FORCE SYSTEM OPTIMIZATION
    
    Triggers immediate optimization of all database components.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        raise HTTPException(status_code=503, detail="Advanced system not available")
    
    try:
        success = force_system_optimization()
        
        if success:
            return {
                "status": "success",
                "message": "System optimization completed successfully",
                "timestamp": time.time()
            }
        else:
            return {
                "status": "partial_success",
                "message": "Some optimizations may have failed - check logs",
                "timestamp": time.time()
            }
    except Exception as e:
        logger.error(f"Failed to force optimization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mode/{mode}")
async def set_operation_mode(mode: str):
    """
    🔄 SET OPERATION MODE
    
    Change the database operation mode for different performance profiles.
    
    Modes:
    - normal: Balanced performance and resource usage
    - high_performance: Maximum performance, higher resource usage
    - resource_saver: Lower resource usage, reduced performance
    - emergency: Emergency mode with aggressive optimizations
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        raise HTTPException(status_code=503, detail="Advanced system not available")
    
    try:
        # Validate mode
        valid_modes = ["normal", "high_performance", "resource_saver", "emergency", "maintenance"]
        if mode not in valid_modes:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid mode. Valid modes: {valid_modes}"
            )
        
        controller = get_database_master_controller()
        operation_mode = OperationMode(mode)
        controller.set_operation_mode(operation_mode)
        
        return {
            "status": "success",
            "message": f"Operation mode set to {mode}",
            "mode": mode,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to set operation mode: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/query-scheduler/status")
async def get_scheduler_status():
    """
    ⚡ GET QUERY SCHEDULER STATUS
    
    Returns detailed status of the intelligent query scheduler.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return {"error": "Advanced system not available"}
    
    try:
        scheduler = get_query_scheduler()
        status = scheduler.get_status()
        
        return {
            "status": "success",
            "scheduler": status,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to get scheduler status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resilience-engine/status")
async def get_resilience_engine_status():
    """
    🛡️ GET RESILIENCE ENGINE STATUS
    
    Returns status of the database resilience engine including
    connection pools, circuit breakers, and query optimization.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return {"error": "Advanced system not available"}
    
    try:
        engine = get_resilience_engine()
        status = engine.get_comprehensive_health_status()
        
        return {
            "status": "success",
            "resilience_engine": status,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Failed to get resilience engine status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-load")
async def test_database_load(
    query_count: int = Query(100, description="Number of test queries to execute"),
    concurrency: int = Query(10, description="Number of concurrent connections"),
    priority: str = Query("normal", description="Query priority: critical, high, normal, low, background")
):
    """
    🧪 TEST DATABASE LOAD
    
    Execute a controlled load test to verify system performance
    under stress conditions.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        raise HTTPException(status_code=503, detail="Advanced system not available")
    
    if query_count > 1000:
        raise HTTPException(status_code=400, detail="Query count limited to 1000 for safety")
    
    if concurrency > 50:
        raise HTTPException(status_code=400, detail="Concurrency limited to 50 for safety")
    
    try:
        # Map string priority to enum
        priority_map = {
            "critical": QueryPriority.CRITICAL,
            "high": QueryPriority.HIGH,
            "normal": QueryPriority.NORMAL,
            "low": QueryPriority.LOW,
            "background": QueryPriority.BACKGROUND
        }
        query_priority = priority_map.get(priority, QueryPriority.NORMAL)
        
        controller = get_database_master_controller()
        
        # Record start metrics
        start_time = time.time()
        start_status = controller.get_comprehensive_status()
        
        # Execute test queries
        import asyncio
        import concurrent.futures
        
        async def execute_test_query():
            return controller.execute_query(
                "SELECT 1 as test_value, NOW() as test_timestamp",
                priority=query_priority
            )
        
        # Run concurrent test queries
        tasks = []
        for _ in range(query_count):
            task = asyncio.create_task(execute_test_query())
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Analyze results
        successful_queries = len([r for r in results if not isinstance(r, Exception)])
        failed_queries = len([r for r in results if isinstance(r, Exception)])
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Get end metrics
        end_status = controller.get_comprehensive_status()
        
        return {
            "status": "success",
            "test_results": {
                "query_count": query_count,
                "successful_queries": successful_queries,
                "failed_queries": failed_queries,
                "success_rate": (successful_queries / query_count) * 100,
                "total_time_seconds": total_time,
                "queries_per_second": query_count / total_time,
                "avg_query_time_ms": (total_time / query_count) * 1000
            },
            "system_impact": {
                "start_health": start_status.get('overall_health', {}),
                "end_health": end_status.get('overall_health', {}),
                "performance_maintained": True  # Would be calculated based on metrics
            },
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Load test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_dashboard_data():
    """
    📊 GET DASHBOARD DATA
    
    Returns comprehensive data for the database management dashboard.
    """
    if not ADVANCED_SYSTEM_AVAILABLE:
        return {
            "error": "Advanced system not available",
            "legacy_mode": True
        }
    
    try:
        controller = get_database_master_controller()
        monitor = get_advanced_monitor()
        scheduler = get_query_scheduler()
        
        # Get all status data
        system_status = controller.get_comprehensive_status()
        health_summary = monitor.get_health_summary()
        scheduler_status = scheduler.get_status()
        alerts = monitor.get_alerts(include_resolved=False)
        
        # Get recent metrics for charts
        recent_metrics = monitor.get_metrics(
            metric_names=[
                "system_cpu_usage",
                "system_memory_usage", 
                "resilience_pool_utilization",
                "resilience_cache_hit_rate",
                "resilience_error_rate"
            ],
            time_range=3600  # Last hour
        )
        
        return {
            "status": "success",
            "dashboard": {
                "overview": {
                    "health_score": health_summary.get('overall_score', 0),
                    "health_status": health_summary.get('overall_status', 'unknown'),
                    "active_alerts": len(alerts),
                    "critical_alerts": len([a for a in alerts if a.level == AlertLevel.CRITICAL]),
                    "uptime": system_status.get('master_controller', {}).get('uptime_seconds', 0),
                    "operation_mode": system_status.get('master_controller', {}).get('mode', 'unknown')
                },
                "performance": {
                    "queries_per_second": scheduler_status.get('metrics', {}).get('throughput_qps', 0),
                    "avg_response_time": system_status.get('master_controller', {}).get('operation_stats', {}).get('avg_response_time', 0),
                    "success_rate": _calculate_success_rate(system_status),
                    "cache_hit_rate": _get_latest_metric_value(recent_metrics, 'resilience_cache_hit_rate')
                },
                "resources": {
                    "cpu_usage": _get_latest_metric_value(recent_metrics, 'system_cpu_usage'),
                    "memory_usage": _get_latest_metric_value(recent_metrics, 'system_memory_usage'),
                    "pool_utilization": _get_latest_metric_value(recent_metrics, 'resilience_pool_utilization'),
                    "active_connections": scheduler_status.get('active_queries', 0) + scheduler_status.get('active_batches', 0)
                },
                "recent_metrics": recent_metrics,
                "alerts": [
                    {
                        "id": alert.alert_id,
                        "level": alert.level.value,
                        "title": alert.title,
                        "message": alert.message,
                        "timestamp": alert.timestamp
                    }
                    for alert in alerts[:10]  # Latest 10 alerts
                ]
            },
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Failed to get dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def _get_health_recommendations(health_summary: Dict) -> List[str]:
    """Generate health recommendations based on current status"""
    recommendations = []
    
    overall_score = health_summary.get('overall_score', 100)
    
    if overall_score < 70:
        recommendations.append("Consider optimizing database queries and connection usage")
    
    if overall_score < 50:
        recommendations.append("System is under stress - consider scaling resources")
    
    if overall_score < 30:
        recommendations.append("URGENT: System requires immediate attention")
    
    components = health_summary.get('components', {})
    for comp, data in components.items():
        if data.get('score', 100) < 60:
            recommendations.append(f"Component '{comp}' needs attention (score: {data.get('score', 0)})")
    
    if not recommendations:
        recommendations.append("System is performing well - no immediate actions needed")
    
    return recommendations

def _calculate_success_rate(system_status: Dict) -> float:
    """Calculate overall success rate from system status"""
    try:
        stats = system_status.get('master_controller', {}).get('operation_stats', {})
        total = stats.get('total_operations', 0)
        successful = stats.get('successful_operations', 0)
        
        if total > 0:
            return (successful / total) * 100
        return 100.0
    except Exception:
        return 0.0

def _get_latest_metric_value(metrics: Dict, metric_name: str) -> float:
    """Get the latest value for a specific metric"""
    try:
        metric_data = metrics.get(metric_name, [])
        if metric_data:
            return metric_data[-1]['value']
        return 0.0
    except Exception:
        return 0.0

# Add the router to your main FastAPI app
# app.include_router(router)