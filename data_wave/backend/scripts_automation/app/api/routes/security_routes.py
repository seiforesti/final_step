from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db_session import get_session
from app.services.security_service import SecurityService
from app.models.security_models import (
    SecurityScan, VulnerabilityAssessment, SecurityIncident,
    ComplianceCheck, SecurityAudit, ThreatDetection
)
from app.api.security import get_current_user, require_permission
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
    scan_type: Optional[str] = Query(None, description="Filter by scan type"),
    status: Optional[str] = Query(None, description="Filter by scan status"),
    days: int = Query(30, description="Number of days to look back"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """Get security scan history and results"""
    try:
        result = SecurityService.get_security_scans(
            session=session,
            data_source_id=data_source_id,
            scan_type=scan_type,
            status=status,
            days=days,
            user_id=current_user.get("user_id")
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security scans: {str(e)}"
        )

@router.get("/vulnerabilities")
async def get_vulnerability_assessments(
    severity: Optional[str] = Query(None, description="Filter by vulnerability severity"),
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    status: Optional[str] = Query(None, description="Filter by remediation status"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get vulnerability assessments with risk prioritization
    
    Features:
    - CVSS scoring and risk analysis
    - Vulnerability trend tracking
    - Remediation planning
    - Impact assessment
    """
    try:
        result = SecurityService.get_vulnerability_assessments(
            session=session,
            severity=severity,
            data_source_id=data_source_id,
            status=status
        )
        
        return {
            "success": True,
            "data": result,
            "vulnerability_features": [
                "cvss_scoring",
                "trend_tracking",
                "remediation_planning",
                "impact_assessment"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get vulnerabilities: {str(e)}"
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
    status: Optional[str] = Query(None, description="Filter by incident status"),
    days: int = Query(30, description="Number of days to look back"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get security incidents with threat intelligence
    
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
            status=status,
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
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
    status: Optional[str] = Query(None, description="Filter by check status"),
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
        result = SecurityService.get_compliance_checks(
            session=session,
            framework=framework,
            data_source_id=data_source_id,
            status=status
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
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SECURITY_VIEW))
) -> Dict[str, Any]:
    """
    Get comprehensive security analytics dashboard
    
    Features:
    - Security posture overview
    - Risk trend analysis
    - Threat landscape insights
    - Executive security reporting
    """
    try:
        result = SecurityService.get_security_analytics_dashboard(
            session=session,
            time_range=time_range
        )
        
        return {
            "success": True,
            "data": result,
            "analytics_features": [
                "posture_overview",
                "risk_trends",
                "threat_insights",
                "executive_reporting"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security analytics: {str(e)}"
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