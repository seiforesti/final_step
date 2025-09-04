# ============================================================================
# HEALTH ROUTES - DATABASE HEALTH MONITORING AND FRONTEND INTEGRATION
# ============================================================================

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

from app.db_session import get_db
from app.core.database_health_monitor import DatabaseHealthMonitor, DatabaseHealthStatus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["Health Monitoring"])

# Global health monitor instance
health_monitor: DatabaseHealthMonitor = None

def get_health_monitor():
    """Get or create the global health monitor instance."""
    global health_monitor
    if health_monitor is None:
        from app.db_session import engine
        health_monitor = DatabaseHealthMonitor(engine)
    return health_monitor

@router.get("/database")
async def get_database_health(
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
) -> Dict[str, Any]:
    """
    Get current database health status.
    This endpoint is used by the frontend to determine if emergency mode should be enabled.
    """
    try:
        monitor = get_health_monitor()
        
        # Get current health metrics
        current_health = monitor.get_current_health()
        
        if not current_health:
            # Perform initial health check if none exists
            background_tasks.add_task(monitor.check_database_health)
            return {
                "status": "unknown",
                "message": "Initializing health monitoring",
                "timestamp": None,
                "recommendations": ["Health monitoring is starting up"]
            }
        
        # Return health summary
        health_summary = monitor.get_health_summary()
        
        # Add additional context for frontend
        response = {
            "status": health_summary["status"],
            "message": f"Database health: {health_summary['status']}",
            "timestamp": health_summary["last_check"],
            "pool_usage": health_summary["pool_usage"],
            "error_rate": health_summary["error_rate"],
            "response_time": health_summary["response_time"],
            "recommendations": health_summary["recommendations"],
            
            # Frontend-specific flags
            "frontend_actions": {
                "enable_emergency_mode": current_health.status == DatabaseHealthStatus.CRITICAL,
                "enable_circuit_breaker": current_health.status == DatabaseHealthStatus.DEGRADED,
                "throttle_requests": current_health.status != DatabaseHealthStatus.HEALTHY,
                "max_concurrent_requests": 1 if current_health.status == DatabaseHealthStatus.CRITICAL else 3,
                "request_delay_ms": 5000 if current_health.status == DatabaseHealthStatus.CRITICAL else 1000
            }
        }
        
        logger.info(f"Database health check requested: {health_summary['status']}")
        return response
        
    except Exception as e:
        logger.error(f"Error getting database health: {e}")
        # Return critical status on error
        return {
            "status": "critical",
            "message": f"Health check failed: {str(e)}",
            "timestamp": None,
            "pool_usage": "0/0",
            "error_rate": "100%",
            "response_time": "0ms",
            "recommendations": ["Health monitoring system error - investigate immediately"],
            "frontend_actions": {
                "enable_emergency_mode": True,
                "enable_circuit_breaker": True,
                "throttle_requests": True,
                "max_concurrent_requests": 1,
                "request_delay_ms": 10000
            }
        }

@router.get("/database/trends")
async def get_database_health_trends(
    hours: int = 24,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get database health trends over time.
    """
    try:
        monitor = get_health_monitor()
        trends = monitor.get_health_trends(hours)
        
        return {
            "period_hours": hours,
            "trend": trends["trend"],
            "status_changes": trends["status_changes"],
            "avg_response_time": trends["avg_response_time"],
            "avg_error_rate": trends["avg_error_rate"],
            "data_points": trends["data_points"]
        }
        
    except Exception as e:
        logger.error(f"Error getting database health trends: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get health trends: {str(e)}")

@router.post("/database/force-check")
async def force_database_health_check(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Force an immediate database health check.
    """
    try:
        monitor = get_health_monitor()
        
        # Schedule health check in background
        background_tasks.add_task(monitor.check_database_health)
        
        return {
            "message": "Database health check scheduled",
            "timestamp": None,
            "status": "scheduled"
        }
        
    except Exception as e:
        logger.error(f"Error scheduling database health check: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to schedule health check: {str(e)}")

@router.get("/system")
async def get_system_health() -> Dict[str, Any]:
    """
    Get overall system health status.
    """
    try:
        monitor = get_health_monitor()
        
        # Get database health
        db_health = monitor.get_current_health()
        
        # Determine overall system health
        if db_health and db_health.status == DatabaseHealthStatus.CRITICAL:
            system_status = "critical"
            message = "Database health critical - system may be unstable"
        elif db_health and db_health.status == DatabaseHealthStatus.DEGRADED:
            system_status = "degraded"
            message = "Database health degraded - performance issues detected"
        elif db_health and db_health.status == DatabaseHealthStatus.HEALTHY:
            system_status = "healthy"
            message = "All systems operational"
        else:
            system_status = "unknown"
            message = "System health status unknown"
        
        return {
            "status": system_status,
            "message": message,
            "timestamp": None,
            "components": {
                "database": db_health.status.value if db_health else "unknown",
                "api": "healthy",
                "frontend": "healthy"
            },
            "recommendations": db_health.recommendations if db_health else []
        }
        
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return {
            "status": "error",
            "message": f"Health check failed: {str(e)}",
            "timestamp": None,
            "components": {
                "database": "error",
                "api": "error",
                "frontend": "unknown"
            },
            "recommendations": ["System health monitoring error - investigate immediately"]
        }

@router.post("/database/record-error")
async def record_database_error(
    error_type: str,
    error_message: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Record a database error for monitoring purposes.
    """
    try:
        monitor = get_health_monitor()
        monitor.record_error(error_type, error_message)
        
        logger.info(f"Database error recorded: {error_type} - {error_message}")
        
        return {
            "message": "Database error recorded",
            "error_type": error_type,
            "timestamp": None
        }
        
    except Exception as e:
        logger.error(f"Error recording database error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to record error: {str(e)}")

@router.get("/frontend-config")
async def get_frontend_config() -> Dict[str, Any]:
    """
    Get frontend configuration based on current database health.
    This endpoint provides the frontend with real-time configuration for API throttling.
    """
    try:
        monitor = get_health_monitor()
        current_health = monitor.get_current_health()
        
        if not current_health:
            # Default configuration if no health data
            return {
                "api_throttling": {
                    "enabled": True,
                    "max_concurrent_requests": 3,
                    "max_requests_per_minute": 10,
                    "request_delay_ms": 1000,
                    "batch_size": 2,
                    "batch_delay_ms": 1500
                },
                "emergency_mode": {
                    "enabled": False,
                    "reason": "Health monitoring not available"
                },
                "circuit_breaker": {
                    "enabled": False,
                    "failure_threshold": 3,
                    "timeout_ms": 30000
                }
            }
        
        # Determine configuration based on health status
        if current_health.status == DatabaseHealthStatus.CRITICAL:
            # Critical: Maximum throttling
            config = {
                "api_throttling": {
                    "enabled": True,
                    "max_concurrent_requests": 1,
                    "max_requests_per_minute": 5,
                    "request_delay_ms": 5000,
                    "batch_size": 1,
                    "batch_delay_ms": 5000
                },
                "emergency_mode": {
                    "enabled": True,
                    "reason": "Database health critical"
                },
                "circuit_breaker": {
                    "enabled": True,
                    "failure_threshold": 1,
                    "timeout_ms": 60000
                }
            }
        elif current_health.status == DatabaseHealthStatus.DEGRADED:
            # Degraded: Moderate throttling
            config = {
                "api_throttling": {
                    "enabled": True,
                    "max_concurrent_requests": 2,
                    "max_requests_per_minute": 8,
                    "request_delay_ms": 2000,
                    "batch_size": 2,
                    "batch_delay_ms": 2000
                },
                "emergency_mode": {
                    "enabled": False,
                    "reason": "Database health degraded but manageable"
                },
                "circuit_breaker": {
                    "enabled": True,
                    "failure_threshold": 2,
                    "timeout_ms": 45000
                }
            }
        else:
            # Healthy: Normal throttling
            config = {
                "api_throttling": {
                    "enabled": True,
                    "max_concurrent_requests": 3,
                    "max_requests_per_minute": 10,
                    "request_delay_ms": 1000,
                    "batch_size": 2,
                    "batch_delay_ms": 1500
                },
                "emergency_mode": {
                    "enabled": False,
                    "reason": "Database health optimal"
                },
                "circuit_breaker": {
                    "enabled": True,
                    "failure_threshold": 3,
                    "timeout_ms": 30000
                }
            }
        
        # Add health context
        config["health_context"] = {
            "status": current_health.status.value,
            "pool_usage": f"{current_health.active_connections}/{current_health.connection_pool_size}",
            "error_rate": f"{current_health.error_rate:.1%}",
            "response_time": f"{current_health.response_time_avg:.0f}ms",
            "last_check": current_health.last_check.isoformat() if current_health.last_check else None
        }
        
        return config
        
    except Exception as e:
        logger.error(f"Error getting frontend config: {e}")
        # Return conservative configuration on error
        return {
            "api_throttling": {
                "enabled": True,
                "max_concurrent_requests": 1,
                "max_requests_per_minute": 5,
                "request_delay_ms": 5000,
                "batch_size": 1,
                "batch_delay_ms": 5000
            },
            "emergency_mode": {
                "enabled": True,
                "reason": "Configuration error - enabling emergency mode"
            },
            "circuit_breaker": {
                "enabled": True,
                "failure_threshold": 1,
                "timeout_ms": 60000
            },
            "health_context": {
                "status": "error",
                "pool_usage": "0/0",
                "error_rate": "100%",
                "response_time": "0ms",
                "last_check": None
            }
        }
