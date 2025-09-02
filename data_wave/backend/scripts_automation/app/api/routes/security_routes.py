from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session
from datetime import datetime, timedelta
import logging

from app.db_session import get_session
from app.services.security_service import SecurityService
from app.models.security_models import (
    SecurityScan, SecurityIncident, SecurityControl, SecurityVulnerability
)
from app.api.security.rbac import get_current_user, require_permission
from app.api.security.rbac import (
    PERMISSION_SECURITY_VIEW, PERMISSION_SECURITY_MANAGE,
    PERMISSION_AUDIT_VIEW, PERMISSION_AUDIT_MANAGE
)

router = APIRouter(prefix="/security", tags=["Security"])

@router.get("/audit/{data_source_id}")
async def get_comprehensive_security_audit(
    data_source_id: int,
    include_vulnerabilities: bool = Query(True, description="Include vulnerability assessment"),
    include_compliance: bool = Query(True, description="Include compliance checks"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_AUDIT_VIEW))
) -> Dict[str, Any]:
    """
    Comprehensive security audit with vulnerability assessment
    
    Features:
    - Multi-layered security scanning
    - Vulnerability risk assessment
    - Compliance gap analysis
    - Threat landscape mapping
    """
    try:
        result = SecurityService.get_comprehensive_security_audit(
            session=session,
            data_source_id=data_source_id,
            include_vulnerabilities=include_vulnerabilities,
            include_compliance=include_compliance
        )
        
        return {
            "success": True,
            "data": result,
            "security_features": [
                "multi_layer_scanning",
                "risk_assessment",
                "compliance_analysis",
                "threat_mapping"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security audit: {str(e)}"
        )

@router.post("/scans")
async def create_security_scan(
    scan_request: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """
    Create and schedule security scans
    
    Features:
    - Automated security scanning
    - Custom scan configurations
    - Scheduled scan management
    - Real-time scan monitoring
    """
    try:
        result = SecurityService.create_security_scan(
            session=session,
            scan_request=scan_request,
            creator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Security scan created successfully",
            "scan_features": [
                "automated_scanning",
                "custom_configuration",
                "scheduled_management",
                "real_time_monitoring"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create security scan: {str(e)}"
        )

@router.get("/scans")
async def get_security_scans(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get security scans and monitoring results
    
    Features:
    - Automated security scanning
    - Real-time monitoring
    - Scan history and trends
    - Performance analytics
    """
    try:
        result = SecurityService.get_security_scans(
            session=session,
            data_source_id=data_source_id
        )
        
        return {
            "success": True,
            "data": result,
            "scan_features": [
                "automated_scanning",
                "real_time_monitoring",
                "scan_history",
                "performance_analytics"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get security scans: {str(e)}"
        )

@router.get("/vulnerability-assessments")
async def get_vulnerability_assessments(
    severity: Optional[str] = Query(None, description="Filter by vulnerability severity"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get vulnerability assessments and risk analysis
    
    Features:
    - Vulnerability scanning and detection
    - Risk scoring and prioritization
    - Remediation recommendations
    - Trend analysis
    """
    try:
        result = SecurityService.get_vulnerabilities(
            session=session,
            data_source_id=data_source_id
        )
        
        # Filter by severity if provided
        if severity:
            result = [v for v in result if v.severity == severity]
        
        return {
            "success": True,
            "data": result,
            "vulnerability_features": [
                "scanning_detection",
                "risk_scoring",
                "remediation_recommendations",
                "trend_analysis"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get vulnerability assessments: {str(e)}"
        )

@router.post("/vulnerabilities/{vulnerability_id}/remediate")
async def remediate_vulnerability(
    vulnerability_id: str,
    remediation_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """Mark vulnerability as remediated with verification"""
    try:
        result = SecurityService.remediate_vulnerability(
            session=session,
            vulnerability_id=vulnerability_id,
            remediation_data=remediation_data,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Vulnerability remediated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remediate vulnerability: {str(e)}"
        )

@router.get("/incidents")
async def get_security_incidents(
    severity: Optional[str] = Query(None, description="Filter by incident severity"),
    days: int = Query(30, description="Number of days to look back"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get security incidents with advanced filtering
    
    Features:
    - Incident classification and tracking
    - Threat intelligence correlation
    - Response time analytics
    - Impact assessment
    """
    try:
        result = SecurityService.get_security_incidents(
            session=session,
            severity=severity,
            days=days
        )
        
        return {
            "success": True,
            "data": result,
            "incident_features": [
                "classification_tracking",
                "threat_intelligence",
                "response_analytics",
                "impact_assessment"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get incidents: {str(e)}"
        )

@router.post("/incidents")
async def create_security_incident(
    incident_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """Create a new security incident report"""
    try:
        result = SecurityService.create_security_incident(
            session=session,
            incident_data=incident_data,
            reporter_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Security incident created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create incident: {str(e)}"
        )

@router.get("/compliance/checks")
async def get_compliance_checks(
    framework: Optional[str] = Query(None, description="Filter by compliance framework"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get compliance checks and framework adherence
    
    Features:
    - Multi-framework compliance tracking
    - Automated compliance checking
    - Gap analysis and remediation
    - Regulatory reporting
    """
    try:
        if not data_source_id:
            raise HTTPException(status_code=400, detail="data_source_id is required")
            
        result = SecurityService.get_compliance_checks(
            session=session,
            data_source_id=data_source_id,
            framework=framework
        )
        
        return {
            "success": True,
            "data": result,
            "compliance_features": [
                "multi_framework_tracking",
                "automated_checking",
                "gap_analysis",
                "regulatory_reporting"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get compliance checks: {str(e)}"
        )

@router.post("/compliance/checks")
async def run_compliance_check(
    check_request: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """Run compliance checks against specified frameworks"""
    try:
        result = SecurityService.run_compliance_check(
            session=session,
            check_request=check_request,
            initiator_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Compliance check initiated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run compliance check: {str(e)}"
        )

@router.get("/threat-detection")
async def get_threat_detection_results(
    threat_type: Optional[str] = Query(None, description="Filter by threat type"),
    severity: Optional[str] = Query(None, description="Filter by threat severity"),
    days: int = Query(7, description="Number of days to look back"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get threat detection results and analytics
    
    Features:
    - AI-powered threat detection
    - Behavioral anomaly analysis
    - Threat intelligence integration
    - Real-time threat monitoring
    """
    try:
        result = SecurityService.get_threat_detection_results(
            session=session,
            threat_type=threat_type,
            severity=severity,
            days=days
        )
        
        return {
            "success": True,
            "data": result,
            "threat_features": [
                "ai_threat_detection",
                "anomaly_analysis",
                "threat_intelligence",
                "real_time_monitoring"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get threat detection: {str(e)}"
        )

@router.get("/analytics/dashboard")
async def get_security_analytics_dashboard(
    time_range: str = Query("7d", description="Time range for analytics"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get security analytics dashboard data
    
    Features:
    - Security metrics overview
    - Threat trend analysis
    - Vulnerability statistics
    - Incident reporting
    """
    try:
        from app.services.security_service import SecurityService
        
        security_service = SecurityService()
        dashboard_data = security_service.get_security_analytics_dashboard(
            session=session,
            time_range=time_range,
            data_source_id=data_source_id
        )
        
        return {
            "success": True,
            "data": dashboard_data,
            "filters": {
                "time_range": time_range,
                "data_source_id": data_source_id
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security analytics dashboard: {str(e)}"
        )

@router.get("/reports/risk-assessment")
async def get_risk_assessment_report(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get comprehensive risk assessment report
    
    Features:
    - Quantitative risk analysis
    - Business impact assessment
    - Risk mitigation recommendations
    - Regulatory compliance mapping
    """
    try:
        result = SecurityService.get_risk_assessment_report(
            session=session,
            data_source_id=data_source_id,
            risk_level=risk_level
        )
        
        return {
            "success": True,
            "data": result,
            "risk_features": [
                "quantitative_analysis",
                "business_impact",
                "mitigation_recommendations",
                "compliance_mapping"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get risk assessment: {str(e)}"
        )

@router.post("/monitoring/start")
async def start_security_monitoring(
    monitoring_config: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """
    Start real-time security monitoring
    
    Features:
    - Continuous security monitoring
    - Real-time threat detection
    - Automated incident response
    - Security event correlation
    """
    try:
        result = SecurityService.start_security_monitoring(
            session=session,
            monitoring_config=monitoring_config,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Security monitoring started",
            "monitoring_features": [
                "continuous_monitoring",
                "real_time_detection",
                "automated_response",
                "event_correlation"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start security monitoring: {str(e)}"
        )

# ============================================================================
# MISSING SECURITY & ACCESS CONTROL ENDPOINTS
# Appended to avoid damaging existing APIs
# ============================================================================

@router.get("/data-sources/{data_source_id}/security")
async def get_data_source_security(
    data_source_id: int,
    include_vulnerabilities: bool = Query(True, description="Include vulnerability assessment"),
    include_controls: bool = Query(True, description="Include security controls"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get comprehensive security information for a data source
    
    Features:
    - Security vulnerability assessment
    - Security controls overview
    - Risk scoring and analysis
    - Compliance status
    """
    try:
        # Get security vulnerabilities
        vulnerabilities = []
        if include_vulnerabilities:
            vulnerabilities = SecurityService.get_vulnerabilities(
                session=session,
                data_source_id=data_source_id
            )
        
        # Get security controls
        controls = []
        if include_controls:
            controls = SecurityService.get_security_controls(
                session=session,
                data_source_id=data_source_id
            )
        
        # Get security audit summary
        audit_summary = SecurityService.get_comprehensive_security_audit(
            session=session,
            data_source_id=data_source_id,
            include_vulnerabilities=False,
            include_compliance=False
        )
        
        return {
            "success": True,
            "data": {
                "data_source_id": data_source_id,
                "vulnerabilities": vulnerabilities,
                "security_controls": controls,
                "audit_summary": audit_summary,
                "security_score": len(vulnerabilities) * 10,  # Simple scoring
                "last_updated": datetime.now().isoformat()
            },
            "security_features": [
                "vulnerability_assessment",
                "security_controls",
                "risk_scoring",
                "compliance_status"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get data source security: {str(e)}"
        )

@router.get("/data-sources/{data_source_id}/access-control")
async def get_data_source_access_control(
    data_source_id: int,
    include_stats: bool = Query(False, description="Include access control statistics"),
    include_logs: bool = Query(False, description="Include recent access logs"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get access control information for a data source
    
    Features:
    - User and role permissions
    - Access control statistics
    - Recent access logs
    - Permission management
    """
    try:
        from app.services.access_control_service import AccessControlService
        
        # Get permissions
        permissions = AccessControlService.get_permissions_by_data_source(
            session=session,
            data_source_id=data_source_id
        )
        
        # Get access statistics if requested
        access_stats = None
        if include_stats:
            access_stats = AccessControlService.get_access_stats(
                session=session,
                data_source_id=data_source_id
            )
        
        # Get access logs if requested
        access_logs = []
        if include_logs:
            access_logs = AccessControlService.get_access_logs(
                session=session,
                data_source_id=data_source_id,
                limit=50
            )
        
        return {
            "success": True,
            "data": {
                "data_source_id": data_source_id,
                "permissions": permissions,
                "access_stats": access_stats,
                "access_logs": access_logs,
                "total_permissions": len(permissions),
                "last_updated": datetime.now().isoformat()
            },
            "access_control_features": [
                "permission_management",
                "access_statistics",
                "audit_logging",
                "role_based_access"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get access control: {str(e)}"
        )

@router.post("/data-sources/access-control")
async def create_access_control_permission(
    permission_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """
    Create a new access control permission
    
    Features:
    - User permission assignment
    - Role-based access control
    - Permission expiration management
    - Conditional access rules
    """
    try:
        from app.services.access_control_service import AccessControlService, PermissionCreate
        
        # Validate required fields
        required_fields = ["data_source_id", "permission_type", "access_level"]
        for field in required_fields:
            if field not in permission_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Create permission request
        permission_request = PermissionCreate(
            data_source_id=permission_data["data_source_id"],
            user_id=permission_data.get("user_id"),
            role_id=permission_data.get("role_id"),
            permission_type=permission_data["permission_type"],
            access_level=permission_data["access_level"],
            expires_at=permission_data.get("expires_at"),
            conditions=permission_data.get("conditions", {})
        )
        
        # Create permission
        permission = AccessControlService.create_permission(
            session=session,
            permission_data=permission_request,
            granted_by=current_user.get("username") or current_user.get("email")
        )
        
        return {
            "success": True,
            "data": permission,
            "message": "Access control permission created successfully",
            "permission_features": [
                "user_assignment",
                "role_based_access",
                "expiration_management",
                "conditional_rules"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create access control permission: {str(e)}"
        )

@router.put("/data-sources/access-control/{permission_id}")
async def update_access_control_permission(
    permission_id: int,
    permission_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """
    Update an existing access control permission
    
    Features:
    - Permission modification
    - Access level updates
    - Expiration management
    - Conditional rule updates
    """
    try:
        from app.services.access_control_service import AccessControlService, PermissionUpdate
        
        # Create update request
        update_request = PermissionUpdate(
            permission_type=permission_data.get("permission_type"),
            access_level=permission_data.get("access_level"),
            expires_at=permission_data.get("expires_at"),
            conditions=permission_data.get("conditions")
        )
        
        # Update permission
        updated_permission = AccessControlService.update_permission(
            session=session,
            permission_id=permission_id,
            permission_data=update_request,
            updated_by=current_user.get("username") or current_user.get("email")
        )
        
        if not updated_permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Permission {permission_id} not found"
            )
        
        return {
            "success": True,
            "data": updated_permission,
            "message": "Access control permission updated successfully",
            "update_features": [
                "permission_modification",
                "access_level_updates",
                "expiration_management",
                "conditional_rules"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update access control permission: {str(e)}"
        )

@router.delete("/data-sources/access-control/{permission_id}")
async def delete_access_control_permission(
    permission_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_MANAGE))
) -> Dict[str, Any]:
    """
    Delete an access control permission
    
    Features:
    - Permission revocation
    - Access removal
    - Audit logging
    - Security validation
    """
    try:
        from app.services.access_control_service import AccessControlService
        
        # Revoke permission
        success = AccessControlService.revoke_permission(
            session=session,
            permission_id=permission_id,
            revoked_by=current_user.get("username") or current_user.get("email")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Permission {permission_id} not found"
            )
        
        return {
            "success": True,
            "message": "Access control permission deleted successfully",
            "deletion_features": [
                "permission_revocation",
                "access_removal",
                "audit_logging",
                "security_validation"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete access control permission: {str(e)}"
        )

@router.get("/data-sources/{data_source_id}/access-control/stats")
async def get_access_control_stats(
    data_source_id: int,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get access control statistics for a data source
    
    Features:
    - Permission statistics
    - Access attempt analytics
    - Success rate metrics
    - Usage patterns
    """
    try:
        from app.services.access_control_service import AccessControlService
        
        # Get access statistics
        access_stats = AccessControlService.get_access_stats(
            session=session,
            data_source_id=data_source_id
        )
        
        return {
            "success": True,
            "data": access_stats,
            "stats_features": [
                "permission_statistics",
                "access_analytics",
                "success_metrics",
                "usage_patterns"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get access control stats: {str(e)}"
        )

@router.get("/data-sources/{data_source_id}/access-control/logs")
async def get_access_control_logs(
    data_source_id: int,
    limit: int = Query(100, description="Number of logs to return", ge=1, le=1000),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get access control logs for a data source
    
    Features:
    - Access attempt logging
    - User activity tracking
    - Security event monitoring
    - Audit trail
    """
    try:
        from app.services.access_control_service import AccessControlService
        
        # Get access logs
        access_logs = AccessControlService.get_access_logs(
            session=session,
            data_source_id=data_source_id,
            limit=limit
        )
        
        return {
            "success": True,
            "data": {
                "data_source_id": data_source_id,
                "access_logs": access_logs,
                "total_logs": len(access_logs),
                "limit": limit
            },
            "logging_features": [
                "access_attempt_logging",
                "user_activity_tracking",
                "security_event_monitoring",
                "audit_trail"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get access control logs: {str(e)}"
        )