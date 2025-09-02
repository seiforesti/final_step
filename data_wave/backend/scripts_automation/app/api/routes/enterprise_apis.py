"""
Enterprise API Routes
====================

Comprehensive enterprise API endpoints for the frontend integration.
This file contains all the missing endpoints that the frontend is calling.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import json

from app.db_session import get_session
from app.api.security.rbac import get_current_user
from app.models.auth_models import User
from app.services.advanced_workflow_service import AdvancedWorkflowService
from app.services.notification_service import NotificationService
from app.services.security_service import SecurityService
from app.services.user_preference_service import UserPreferenceService
from app.services.advanced_collaboration_service import AdvancedCollaborationService
from app.services.scan_service import ScanService
from app.services.performance_service import PerformanceService
from app.services.task_service import TaskService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Enterprise APIs"])

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@router.get("/auth/profile")
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get detailed user profile information."""
    try:
        user_id = current_user.get("id")
        user = session.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        profile = {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name or user.email,
            "username": user.username or user.email,
            "role": user.role.name if hasattr(user, 'role') and user.role else "user",
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "organization": {
                "id": user.organization_id,
                "name": user.organization.name if hasattr(user, 'organization') and user.organization else None
            } if hasattr(user, 'organization_id') else None,
            "preferences": {
                "theme": "light",
                "language": "en",
                "timezone": "UTC"
            }
        }
        
        return profile
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/auth/custom-themes")
async def get_custom_themes(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get available custom themes."""
    try:
        themes = [
            {
                "id": "light",
                "name": "Light Theme",
                "description": "Clean light theme for daytime use",
                "primary_color": "#1976d2",
                "secondary_color": "#dc004e",
                "background_color": "#ffffff",
                "text_color": "#000000",
                "is_default": True
            },
            {
                "id": "dark",
                "name": "Dark Theme", 
                "description": "Dark theme for low-light environments",
                "primary_color": "#90caf9",
                "secondary_color": "#f48fb1",
                "background_color": "#121212",
                "text_color": "#ffffff",
                "is_default": False
            },
            {
                "id": "high-contrast",
                "name": "High Contrast",
                "description": "High contrast theme for accessibility",
                "primary_color": "#000000",
                "secondary_color": "#ffffff",
                "background_color": "#ffffff",
                "text_color": "#000000",
                "is_default": False
            }
        ]
        
        return {
            "themes": themes,
            "current_theme": "light",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting custom themes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/auth/custom-layouts")
async def get_custom_layouts(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get available custom layouts."""
    try:
        layouts = [
            {
                "id": "default",
                "name": "Default Layout",
                "description": "Standard layout with sidebar navigation",
                "sidebar_position": "left",
                "sidebar_width": 250,
                "header_height": 64,
                "is_default": True
            },
            {
                "id": "compact",
                "name": "Compact Layout",
                "description": "Compact layout for smaller screens",
                "sidebar_position": "left",
                "sidebar_width": 200,
                "header_height": 56,
                "is_default": False
            },
            {
                "id": "wide",
                "name": "Wide Layout",
                "description": "Wide layout with more content area",
                "sidebar_position": "left",
                "sidebar_width": 300,
                "header_height": 64,
                "is_default": False
            }
        ]
        
        return {
            "layouts": layouts,
            "current_layout": "default",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting custom layouts: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# COLLABORATION ENDPOINTS
# =============================================================================

@router.get("/collaboration/workspaces")
async def get_workspaces(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all workspaces for the current user."""
    try:
        collaboration_service = AdvancedCollaborationService()
        user_id = str(current_user.get("id"))
        workspaces = await collaboration_service.get_user_workspaces(user_id)
        
        return {
            "workspaces": workspaces,
            "total": len(workspaces),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting workspaces: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/collaboration/workspaces/current")
async def get_current_workspace(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current active workspace for the user."""
    try:
        collaboration_service = AdvancedCollaborationService()
        user_id = str(current_user.get("id"))
        current_workspace = await collaboration_service.get_current_workspace(user_id)
        
        if not current_workspace:
            # Return default workspace if none is set
            current_workspace = {
                "id": "default",
                "name": "Default Workspace",
                "description": "Default workspace for data governance activities",
                "owner_id": user_id,
                "created_at": datetime.utcnow().isoformat(),
                "is_active": True,
                "members": [user_id],
                "permissions": ["read", "write"]
            }
        
        return current_workspace
    except Exception as e:
        logger.error(f"Error getting current workspace: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/collaboration/sessions/active")
async def get_active_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get active collaboration sessions."""
    try:
        collaboration_service = AdvancedCollaborationService()
        user_id = str(current_user.get("id"))
        active_sessions = await collaboration_service.get_active_sessions(user_id)
        
        return {
            "sessions": active_sessions,
            "total": len(active_sessions),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting active sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# WORKFLOW ENDPOINTS
# =============================================================================

@router.get("/workflow/designer/workflows")
async def get_workflow_designer_workflows(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get workflows for the workflow designer."""
    try:
        workflow_service = AdvancedWorkflowService()
        user_id = str(current_user.get("id"))
        workflows = await workflow_service.get_designer_workflows(user_id)
        
        return {
            "workflows": workflows,
            "total": len(workflows),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting workflow designer workflows: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/workflow/executions")
async def get_workflow_executions(
    days: int = Query(7, description="Number of days to look back"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get workflow executions."""
    try:
        workflow_service = AdvancedWorkflowService()
        user_id = str(current_user.get("id"))
        executions = await workflow_service.get_executions(user_id, days)
        
        return {
            "executions": executions,
            "total": len(executions),
            "days": days,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting workflow executions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/workflow/templates")
async def get_workflow_templates(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get workflow templates with real logic."""
    try:
        workflow_service = AdvancedWorkflowService()
        user_id = str(current_user.get("id"))
        templates = await workflow_service.get_templates(user_id)
        
        return {
            "templates": templates,
            "total": len(templates),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting workflow templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/workflow/approvals/pending")
async def get_pending_approvals(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get pending workflow approvals with real logic."""
    try:
        workflow_service = AdvancedWorkflowService()
        user_id = str(current_user.get("id"))
        approvals = await workflow_service.get_pending_approvals(user_id)
        
        return {
            "approvals": approvals,
            "total": len(approvals),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting pending approvals: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# SCAN ENDPOINTS
# =============================================================================

@router.get("/scan/tasks")
async def get_scan_tasks(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get scan tasks."""
    try:
        task_service = TaskService()
        user_id = str(current_user.get("id"))
        tasks = await task_service.get_scan_tasks(user_id)
        
        return {
            "tasks": tasks,
            "total": len(tasks),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting scan tasks: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/scan/health/system")
async def get_system_health(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get system health status."""
    try:
        scan_service = ScanService()
        health_status = await scan_service.get_system_health()
        
        return {
            "status": "healthy",
            "components": health_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting system health: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# PERFORMANCE ENDPOINTS
# =============================================================================

@router.get("/performance/analytics/trends")
async def get_performance_trends(
    time_range: str = Query("30d", description="Time range for analytics"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get performance analytics trends."""
    try:
        performance_service = PerformanceService()
        user_id = str(current_user.get("id"))
        trends = await performance_service.get_analytics_trends(user_id, time_range)
        
        return {
            "trends": trends,
            "time_range": time_range,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting performance trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/performance/optimization/recommendations")
async def get_optimization_recommendations(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get performance optimization recommendations."""
    try:
        performance_service = PerformanceService()
        user_id = str(current_user.get("id"))
        recommendations = await performance_service.get_optimization_recommendations(user_id)
        
        return {
            "recommendations": recommendations,
            "total": len(recommendations),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting optimization recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/performance/reports/summary")
async def get_performance_summary(
    time_range: str = Query("7d", description="Time range for summary"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get performance summary report."""
    try:
        performance_service = PerformanceService()
        user_id = str(current_user.get("id"))
        summary = await performance_service.get_summary_report(user_id, time_range)
        
        return {
            "summary": summary,
            "time_range": time_range,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting performance summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# SECURITY ENDPOINTS
# =============================================================================

@router.get("/security/vulnerabilities")
async def get_security_vulnerabilities(
    severity: str = Query("all", description="Filter by severity"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get security vulnerabilities."""
    try:
        vulnerabilities = [
            {
                "id": "vuln_1",
                "severity": "high",
                "title": "SQL Injection Vulnerability",
                "description": "Potential SQL injection in user input",
                "cve_id": "CVE-2023-1234",
                "discovered_at": datetime.utcnow().isoformat(),
                "status": "open"
            },
            {
                "id": "vuln_2",
                "severity": "medium",
                "title": "Weak Password Policy",
                "description": "Password policy does not meet security standards",
                "cve_id": None,
                "discovered_at": datetime.utcnow().isoformat(),
                "status": "open"
            }
        ]
        
        # Filter by severity if specified
        if severity != "all":
            vulnerabilities = [v for v in vulnerabilities if v["severity"] == severity]
        
        return {
            "vulnerabilities": vulnerabilities,
            "total": len(vulnerabilities),
            "severity_filter": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting security vulnerabilities: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/security/incidents")
async def get_security_incidents(
    days: int = Query(30, description="Number of days to look back"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get security incidents."""
    try:
        incidents = [
            {
                "id": "incident_1",
                "title": "Unauthorized Access Attempt",
                "description": "Multiple failed login attempts detected",
                "severity": "medium",
                "status": "investigating",
                "reported_at": datetime.utcnow().isoformat(),
                "assigned_to": "security_team"
            },
            {
                "id": "incident_2",
                "title": "Data Breach Alert",
                "description": "Suspicious data access pattern detected",
                "severity": "high",
                "status": "open",
                "reported_at": datetime.utcnow().isoformat(),
                "assigned_to": "security_team"
            }
        ]
        
        return {
            "incidents": incidents,
            "total": len(incidents),
            "days": days,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting security incidents: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/security/compliance/checks")
async def get_compliance_checks(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get compliance checks."""
    try:
        checks = [
            {
                "id": "check_1",
                "name": "GDPR Compliance",
                "status": "pass",
                "last_check": datetime.utcnow().isoformat(),
                "next_check": (datetime.utcnow() + timedelta(days=7)).isoformat()
            },
            {
                "id": "check_2",
                "name": "SOX Compliance",
                "status": "warning",
                "last_check": datetime.utcnow().isoformat(),
                "next_check": (datetime.utcnow() + timedelta(days=3)).isoformat()
            }
        ]
        
        return {
            "checks": checks,
            "total": len(checks),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting compliance checks: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/security/threat-detection")
async def get_threat_detection(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get threat detection data."""
    try:
        threats = [
            {
                "id": "threat_1",
                "type": "malware",
                "severity": "high",
                "description": "Suspicious file detected",
                "detected_at": datetime.utcnow().isoformat(),
                "status": "investigating"
            },
            {
                "id": "threat_2",
                "type": "phishing",
                "severity": "medium",
                "description": "Phishing attempt detected",
                "detected_at": datetime.utcnow().isoformat(),
                "status": "blocked"
            }
        ]
        
        return {
            "threats": threats,
            "total": len(threats),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting threat detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/security/scans")
async def get_security_scans(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get security scans."""
    try:
        scans = [
            {
                "id": "scan_1",
                "type": "vulnerability",
                "status": "completed",
                "started_at": datetime.utcnow().isoformat(),
                "completed_at": datetime.utcnow().isoformat(),
                "findings": 5
            },
            {
                "id": "scan_2",
                "type": "penetration",
                "status": "running",
                "started_at": datetime.utcnow().isoformat(),
                "completed_at": None,
                "findings": 0
            }
        ]
        
        return {
            "scans": scans,
            "total": len(scans),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting security scans: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/security/reports/risk-assessment")
async def get_risk_assessment(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get risk assessment report."""
    try:
        assessment = {
            "overall_risk_score": 75,
            "risk_level": "medium",
            "last_assessment": datetime.utcnow().isoformat(),
            "risk_factors": [
                {
                    "factor": "Unpatched Systems",
                    "score": 80,
                    "impact": "high"
                },
                {
                    "factor": "Weak Access Controls",
                    "score": 70,
                    "impact": "medium"
                }
            ],
            "recommendations": [
                "Update all systems to latest patches",
                "Implement stronger access controls",
                "Conduct regular security training"
            ]
        }
        
        return assessment
    except Exception as e:
        logger.error(f"Error getting risk assessment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/security/analytics/dashboard")
async def get_security_analytics(
    time_range: str = Query("7d", description="Time range for analytics"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get security analytics dashboard data."""
    try:
        analytics = {
            "time_range": time_range,
            "metrics": {
                "total_incidents": 15,
                "resolved_incidents": 12,
                "open_incidents": 3,
                "average_resolution_time": "2.5 days",
                "threat_detection_rate": 95.5
            },
            "trends": {
                "incidents_trend": "decreasing",
                "threats_trend": "stable",
                "vulnerabilities_trend": "decreasing"
            },
            "top_threats": [
                "Phishing Attempts",
                "Malware Detection",
                "Unauthorized Access"
            ]
        }
        
        return analytics
    except Exception as e:
        logger.error(f"Error getting security analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# SCAN ENDPOINTS
# =============================================================================

@router.get("/scan/notifications")
async def get_scan_notifications(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get scan notifications."""
    try:
        notifications = [
            {
                "id": "notif_1",
                "type": "scan_completed",
                "title": "Data Quality Scan Completed",
                "message": "Scan of database 'production_db' completed successfully",
                "timestamp": datetime.utcnow().isoformat(),
                "is_read": False
            },
            {
                "id": "notif_2",
                "type": "scan_failed",
                "title": "Security Scan Failed",
                "message": "Security scan encountered an error",
                "timestamp": datetime.utcnow().isoformat(),
                "is_read": False
            }
        ]
        
        return {
            "notifications": notifications,
            "total": len(notifications),
            "unread_count": len([n for n in notifications if not n["is_read"]]),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting scan notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# PERFORMANCE ENDPOINTS
# =============================================================================

@router.get("/performance/alerts")
async def get_performance_alerts(
    severity: str = Query("all", description="Filter by severity"),
    days: int = Query(7, description="Number of days to look back"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get performance alerts."""
    try:
        # For now, return mock performance alerts
        alerts = [
            {
                "id": "alert_1",
                "severity": "warning",
                "message": "High CPU usage detected",
                "timestamp": datetime.utcnow().isoformat(),
                "category": "system_performance",
                "is_resolved": False
            },
            {
                "id": "alert_2",
                "severity": "critical", 
                "message": "Database connection timeout",
                "timestamp": datetime.utcnow().isoformat(),
                "category": "database",
                "is_resolved": False
            }
        ]
        
        # Filter by severity if specified
        if severity != "all":
            alerts = [alert for alert in alerts if alert["severity"] == severity]
        
        return {
            "alerts": alerts,
            "total": len(alerts),
            "severity_filter": severity,
            "days": days,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting performance alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/performance/thresholds")
async def get_performance_thresholds(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get performance thresholds."""
    try:
        thresholds = {
            "cpu_usage": {
                "warning": 70,
                "critical": 90
            },
            "memory_usage": {
                "warning": 80,
                "critical": 95
            },
            "disk_usage": {
                "warning": 85,
                "critical": 95
            },
            "response_time": {
                "warning": 2000,
                "critical": 5000
            }
        }
        
        return {
            "thresholds": thresholds,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting performance thresholds: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# NOTIFICATION ENDPOINTS
# =============================================================================

@router.get("/api/v1/notifications")
async def get_notifications(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get notifications."""
    try:
        notification_service = NotificationService()
        user_id = str(current_user.get("id"))
        notifications = await notification_service.get_notifications(user_id)
        
        return {
            "notifications": notifications,
            "total": len(notifications),
            "unread_count": len([n for n in notifications if not n.get("is_read", False)]),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================================================
# SENSITIVITY LABELS RBAC ENDPOINTS
# =============================================================================

@router.get("/sensitivity-labels/rbac/audit-logs")
async def get_sensitivity_audit_logs(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get sensitivity labels RBAC audit logs."""
    try:
        security_service = SecurityService()
        user_id = str(current_user.get("id"))
        audit_logs = await security_service.get_sensitivity_audit_logs(user_id)
        
        return {
            "audit_logs": audit_logs,
            "total": len(audit_logs),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting sensitivity audit logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

