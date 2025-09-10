"""
PRODUCTION-CRITICAL: Database Integrity Management API
=====================================================

This module provides comprehensive API endpoints for monitoring and managing
database integrity in production environments.

Endpoints:
- GET /api/database/health - Get current database health status
- GET /api/database/health/report - Get detailed health report
- POST /api/database/health/check - Force immediate health check
- POST /api/database/health/repair - Perform emergency repair
- GET /api/database/integrity/validate - Validate database integrity
- POST /api/database/integrity/repair - Repair integrity issues
- GET /api/database/status - Get comprehensive database status
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import logging
from datetime import datetime

from app.services.database_health_monitor import (
    get_database_health_status,
    get_database_health_report,
    perform_emergency_repair,
    start_database_monitoring,
    stop_database_monitoring
)
from app.db_session import validate_database_integrity, repair_database_integrity

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/database", tags=["Database Integrity Management"])

@router.get("/health")
async def get_database_health():
    """Get current database health status"""
    try:
        health_status = get_database_health_status()
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Database health status retrieved successfully",
                "data": health_status,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to get database health: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get database health: {str(e)}")

@router.get("/health/report")
async def get_database_health_report_endpoint():
    """Get comprehensive database health report"""
    try:
        health_report = get_database_health_report()
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Database health report retrieved successfully",
                "data": health_report,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to get database health report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get database health report: {str(e)}")

@router.post("/health/check")
async def force_health_check(background_tasks: BackgroundTasks):
    """Force immediate database health check"""
    try:
        logger.info("🔍 PRODUCTION-CRITICAL: API request to force database health check")
        
        # Perform health check in background
        from app.services.database_health_monitor import db_health_monitor
        background_tasks.add_task(db_health_monitor.force_health_check)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Database health check initiated successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to initiate health check: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate health check: {str(e)}")

@router.post("/health/repair")
async def emergency_database_repair(background_tasks: BackgroundTasks):
    """Perform emergency database repair"""
    try:
        logger.warning("🚨 PRODUCTION-CRITICAL: API request for emergency database repair")
        
        # Perform emergency repair in background
        background_tasks.add_task(perform_emergency_repair)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Emergency database repair initiated successfully",
                "warning": "This operation may take several minutes. Monitor health status for updates.",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to initiate emergency repair: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate emergency repair: {str(e)}")

@router.get("/integrity/validate")
async def validate_database_integrity_endpoint():
    """Validate database integrity"""
    try:
        logger.info("🔍 PRODUCTION-CRITICAL: API request to validate database integrity")
        
        integrity_valid, fk_fixes, constraint_errors = validate_database_integrity()
        
        validation_result = {
            "integrity_valid": integrity_valid,
            "total_issues": len(fk_fixes) + len(constraint_errors),
            "foreign_key_issues": len(fk_fixes),
            "constraint_issues": len(constraint_errors),
            "details": {
                "foreign_key_issues": [
                    {
                        "table": fk[0],
                        "constraint": fk[1].get('name', 'unknown'),
                        "referenced_table": fk[2]
                    }
                    for fk in fk_fixes
                ],
                "constraint_issues": constraint_errors
            }
        }
        
        status_code = 200 if integrity_valid else 422
        
        return JSONResponse(
            status_code=status_code,
            content={
                "success": integrity_valid,
                "message": "Database integrity validation completed",
                "data": validation_result,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to validate database integrity: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to validate database integrity: {str(e)}")

@router.post("/integrity/repair")
async def repair_database_integrity_endpoint(background_tasks: BackgroundTasks):
    """Repair database integrity issues"""
    try:
        logger.info("🔧 PRODUCTION-CRITICAL: API request to repair database integrity")
        
        # First validate to get issues
        integrity_valid, fk_fixes, constraint_errors = validate_database_integrity()
        
        if integrity_valid:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": "No database integrity issues found - repair not needed",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        # Perform repair in background
        def perform_repair():
            try:
                repairs_made, repair_errors = repair_database_integrity(fk_fixes, constraint_errors)
                logger.info(f"🔧 PRODUCTION-CRITICAL: Database integrity repair completed: {repairs_made} repairs made")
                if repair_errors:
                    logger.error(f"❌ PRODUCTION-CRITICAL: {len(repair_errors)} repair errors occurred")
            except Exception as repair_error:
                logger.error(f"❌ PRODUCTION-CRITICAL: Database integrity repair failed: {repair_error}")
        
        background_tasks.add_task(perform_repair)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Database integrity repair initiated successfully",
                "issues_found": {
                    "foreign_key_issues": len(fk_fixes),
                    "constraint_issues": len(constraint_errors)
                },
                "warning": "This operation may take several minutes. Monitor health status for updates.",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to initiate integrity repair: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate integrity repair: {str(e)}")

@router.get("/status")
async def get_comprehensive_database_status():
    """Get comprehensive database status"""
    try:
        logger.info("📊 PRODUCTION-CRITICAL: API request for comprehensive database status")
        
        # Get health status
        health_status = get_database_health_status()
        
        # Get integrity validation
        integrity_valid, fk_fixes, constraint_errors = validate_database_integrity()
        
        # Get health report
        try:
            health_report = get_database_health_report()
        except Exception as e:
            health_report = {"error": f"Failed to get health report: {str(e)}"}
        
        comprehensive_status = {
            "overall_status": "HEALTHY" if integrity_valid and health_status["health_score"] >= 90 else "DEGRADED",
            "health_monitoring": health_status,
            "integrity_validation": {
                "valid": integrity_valid,
                "total_issues": len(fk_fixes) + len(constraint_errors),
                "foreign_key_issues": len(fk_fixes),
                "constraint_issues": len(constraint_errors)
            },
            "health_trends": health_report,
            "recommendations": []
        }
        
        # Generate recommendations
        if not integrity_valid:
            comprehensive_status["recommendations"].append("Perform database integrity repair")
        
        if health_status["health_score"] < 90:
            comprehensive_status["recommendations"].append("Investigate database health issues")
        
        if health_status["error_count"] > 5:
            comprehensive_status["recommendations"].append("Review error logs and consider system restart")
        
        if not comprehensive_status["recommendations"]:
            comprehensive_status["recommendations"].append("System is operating normally - no action required")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Comprehensive database status retrieved successfully",
                "data": comprehensive_status,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to get comprehensive database status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get comprehensive database status: {str(e)}")

@router.post("/monitoring/start")
async def start_database_monitoring_endpoint():
    """Start database health monitoring"""
    try:
        logger.info("🚀 PRODUCTION-CRITICAL: API request to start database monitoring")
        
        await start_database_monitoring()
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Database health monitoring started successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to start database monitoring: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start database monitoring: {str(e)}")

@router.post("/monitoring/stop")
async def stop_database_monitoring_endpoint():
    """Stop database health monitoring"""
    try:
        logger.info("⏹️ PRODUCTION-CRITICAL: API request to stop database monitoring")
        
        await stop_database_monitoring()
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Database health monitoring stopped successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to stop database monitoring: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop database monitoring: {str(e)}")

@router.get("/monitoring/status")
async def get_monitoring_status():
    """Get database monitoring status"""
    try:
        health_status = get_database_health_status()
        
        monitoring_status = {
            "monitoring_active": health_status["is_monitoring"],
            "last_check": health_status["last_check"],
            "total_checks": health_status["total_checks"],
            "current_health": health_status["status"],
            "health_score": health_status["health_score"]
        }
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Database monitoring status retrieved successfully",
                "data": monitoring_status,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"❌ PRODUCTION-CRITICAL: Failed to get monitoring status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get monitoring status: {str(e)}")
