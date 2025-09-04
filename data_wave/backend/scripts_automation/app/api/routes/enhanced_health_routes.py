# ============================================================================
# ENHANCED HEALTH ROUTES - FRONTEND-BACKEND HEALTH SYNCHRONIZATION
# ============================================================================

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import logging
import time
from datetime import datetime

from app.core.enhanced_db_manager import get_enhanced_db_manager
from app.db_session import get_db
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/health", tags=["Enhanced Health Monitoring"])

@router.get("/database/status")
async def get_database_health_status():
    """
    Get real-time database connection pool health status.
    This endpoint is used by the frontend to adjust API throttling behavior.
    """
    try:
        db_manager = get_enhanced_db_manager()
        status = db_manager.get_connection_pool_status()
        
        # Add timestamp
        status["timestamp"] = datetime.utcnow().isoformat()
        status["server_time"] = time.time()
        
        # Determine recommended frontend action
        if status.get("frontend_emergency_mode"):
            status["frontend_action"] = "EMERGENCY_MODE"
            status["frontend_recommendation"] = "Stop all non-critical API calls immediately"
        elif status.get("usage_percentage", 0) > 80:
            status["frontend_action"] = "AGGRESSIVE_THROTTLING"
            status["frontend_recommendation"] = "Reduce API call frequency by 70%"
        elif status.get("usage_percentage", 0) > 60:
            status["frontend_action"] = "MODERATE_THROTTLING"
            status["frontend_recommendation"] = "Reduce API call frequency by 30%"
        else:
            status["frontend_action"] = "NORMAL_OPERATION"
            status["frontend_recommendation"] = "Normal API call frequency allowed"
        
        return JSONResponse(
            content=status,
            status_code=200,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting database health status: {e}")
        return JSONResponse(
            content={
                "error": "Failed to get database health status",
                "timestamp": datetime.utcnow().isoformat(),
                "frontend_action": "UNKNOWN",
                "frontend_recommendation": "Use conservative throttling until status is available"
            },
            status_code=500
        )

@router.get("/database/throttling-config")
async def get_frontend_throttling_config():
    """
    Get frontend throttling configuration based on current database health.
    This provides specific throttling parameters for the frontend to use.
    """
    try:
        db_manager = get_enhanced_db_manager()
        status = db_manager.get_connection_pool_status()
        
        # Calculate throttling parameters based on database health
        usage_percentage = status.get("usage_percentage", 0)
        
        if status.get("frontend_emergency_mode"):
            config = {
                "throttling_level": "EMERGENCY",
                "max_concurrent_requests": 1,
                "max_requests_per_minute": 5,
                "max_requests_per_second": 1,
                "request_delay_ms": 2000,
                "batch_size": 1,
                "batch_delay_ms": 5000,
                "circuit_breaker_open": True,
                "emergency_mode_active": True,
                "recommendation": "Database connection pool critical. Stop all non-critical operations."
            }
        elif usage_percentage > 80:
            config = {
                "throttling_level": "AGGRESSIVE",
                "max_concurrent_requests": 3,
                "max_requests_per_minute": 20,
                "max_requests_per_second": 2,
                "request_delay_ms": 1000,
                "batch_size": 2,
                "batch_delay_ms": 2000,
                "circuit_breaker_open": False,
                "emergency_mode_active": False,
                "recommendation": "Database connection pool degraded. Reduce API call frequency significantly."
            }
        elif usage_percentage > 60:
            config = {
                "throttling_level": "MODERATE",
                "max_concurrent_requests": 5,
                "max_requests_per_minute": 40,
                "max_requests_per_second": 4,
                "request_delay_ms": 500,
                "batch_size": 3,
                "batch_delay_ms": 1000,
                "circuit_breaker_open": False,
                "emergency_mode_active": False,
                "recommendation": "Database connection pool degraded. Reduce API call frequency moderately."
            }
        else:
            config = {
                "throttling_level": "NORMAL",
                "max_concurrent_requests": 10,
                "max_requests_per_minute": 100,
                "max_requests_per_second": 10,
                "request_delay_ms": 100,
                "batch_size": 5,
                "batch_delay_ms": 500,
                "circuit_breaker_open": False,
                "emergency_mode_active": False,
                "recommendation": "Database connection pool healthy. Normal API call frequency allowed."
            }
        
        # Add metadata
        config.update({
            "timestamp": datetime.utcnow().isoformat(),
            "database_usage_percentage": usage_percentage,
            "pool_healthy": status.get("pool_healthy", False),
            "last_updated": time.time()
        })
        
        return JSONResponse(
            content=config,
            status_code=200,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting throttling config: {e}")
        return JSONResponse(
            content={
                "throttling_level": "CONSERVATIVE",
                "max_concurrent_requests": 2,
                "max_requests_per_minute": 10,
                "max_requests_per_second": 1,
                "request_delay_ms": 2000,
                "batch_size": 1,
                "batch_delay_ms": 3000,
                "circuit_breaker_open": True,
                "emergency_mode_active": True,
                "recommendation": "Unable to determine database health. Use conservative throttling.",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            },
            status_code=500
        )

@router.post("/database/force-cleanup")
async def force_database_cleanup(background_tasks: BackgroundTasks):
    """
    Force immediate database connection pool cleanup.
    This can be called by the frontend when it detects severe throttling.
    """
    try:
        db_manager = get_enhanced_db_manager()
        
        # Perform cleanup in background to avoid blocking
        background_tasks.add_task(db_manager.force_connection_cleanup)
        
        return JSONResponse(
            content={
                "message": "Database connection pool cleanup initiated",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "cleanup_initiated"
            },
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Error initiating database cleanup: {e}")
        return JSONResponse(
            content={
                "error": "Failed to initiate database cleanup",
                "timestamp": datetime.utcnow().isoformat()
            },
            status_code=500
        )

@router.get("/ping")
async def health_ping():
    """Simple health check endpoint for load balancers and monitoring."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
