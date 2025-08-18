from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.security_models import (
    SecurityVulnerability, SecurityControl, SecurityScan, SecurityIncident,
    SecurityVulnerabilityResponse, SecurityControlResponse, SecurityScanResponse,
    SecurityIncidentResponse, SecurityAuditResponse,
    SecurityVulnerabilityCreate, SecurityControlCreate, SecurityScanCreate,
    SecurityIncidentCreate, SecurityVulnerabilityUpdate, SecurityControlUpdate,
    SecurityIncidentUpdate, VulnerabilitySeverity, VulnerabilityStatus,
    SecurityControlStatus
)
from app.models.scan_models import DataSource
import logging
import statistics

logger = logging.getLogger(__name__)


class SecurityService:
    """Service layer for security management"""
    
    @staticmethod
    def get_security_audit(session: Session, data_source_id: int) -> SecurityAuditResponse:
        """Get comprehensive security audit for a data source"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source {data_source_id} not found")
            
            # Get vulnerabilities
            vulnerabilities = SecurityService.get_vulnerabilities(session, data_source_id)
            
            # Get security controls
            controls = SecurityService.get_security_controls(session, data_source_id)
            
            # Get recent scans
            recent_scans = SecurityService.get_recent_scans(session, data_source_id)
            
            # Get incidents
            incidents = SecurityService.get_incidents(session, data_source_id)
            
            # Calculate security score
            security_score = SecurityService._calculate_security_score(
                vulnerabilities, controls, incidents
            )
            
            # Get last scan date
            last_scan = SecurityService._get_last_scan_date(session, data_source_id)
            
            # Generate recommendations
            recommendations = SecurityService._generate_security_recommendations(
                vulnerabilities, controls, incidents
            )
            
            # Get compliance frameworks
            compliance_frameworks = SecurityService._get_compliance_frameworks(
                session, data_source_id
            )
            
            return SecurityAuditResponse(
                security_score=security_score,
                last_scan=last_scan,
                vulnerabilities=vulnerabilities,
                controls=controls,
                recent_scans=recent_scans,
                incidents=incidents,
                recommendations=recommendations,
                compliance_frameworks=compliance_frameworks
            )
            
        except Exception as e:
            logger.error(f"Error getting security audit for data source {data_source_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_vulnerabilities(
        session: Session, 
        data_source_id: int,
        status: Optional[VulnerabilityStatus] = None
    ) -> List[SecurityVulnerabilityResponse]:
        """Get vulnerabilities for a data source"""
        try:
            query = select(SecurityVulnerability).where(
                SecurityVulnerability.data_source_id == data_source_id
            )
            
            if status:
                query = query.where(SecurityVulnerability.status == status)
            
            vulnerabilities = session.exec(
                query.order_by(SecurityVulnerability.severity.desc(), SecurityVulnerability.discovered_at.desc())
            ).all()
            
            return [SecurityVulnerabilityResponse.from_orm(vuln) for vuln in vulnerabilities]
            
        except Exception as e:
            logger.error(f"Error getting vulnerabilities for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_security_controls(
        session: Session, 
        data_source_id: int,
        framework: Optional[str] = None
    ) -> List[SecurityControlResponse]:
        """Get security controls for a data source"""
        try:
            query = select(SecurityControl).where(
                SecurityControl.data_source_id == data_source_id
            )
            
            if framework:
                query = query.where(SecurityControl.framework == framework)
            
            controls = session.exec(query.order_by(SecurityControl.category, SecurityControl.name)).all()
            
            return [SecurityControlResponse.from_orm(control) for control in controls]
            
        except Exception as e:
            logger.error(f"Error getting security controls for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_recent_scans(
        session: Session, 
        data_source_id: int,
        limit: int = 10
    ) -> List[SecurityScanResponse]:
        """Get recent security scans for a data source"""
        try:
            query = select(SecurityScan).where(
                SecurityScan.data_source_id == data_source_id
            ).order_by(SecurityScan.created_at.desc()).limit(limit)
            
            scans = session.exec(query).all()
            
            return [SecurityScanResponse.from_orm(scan) for scan in scans]
            
        except Exception as e:
            logger.error(f"Error getting recent scans for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_incidents(
        session: Session, 
        data_source_id: int,
        status: Optional[str] = None
    ) -> List[SecurityIncidentResponse]:
        """Get security incidents for a data source"""
        try:
            query = select(SecurityIncident).where(
                SecurityIncident.data_source_id == data_source_id
            )
            
            if status:
                query = query.where(SecurityIncident.status == status)
            
            incidents = session.exec(
                query.order_by(SecurityIncident.severity.desc(), SecurityIncident.occurred_at.desc())
            ).all()
            
            return [SecurityIncidentResponse.from_orm(incident) for incident in incidents]
            
        except Exception as e:
            logger.error(f"Error getting incidents for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def create_vulnerability(
        session: Session,
        vuln_data: SecurityVulnerabilityCreate,
        user_id: str
    ) -> SecurityVulnerabilityResponse:
        """Create a new security vulnerability"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, vuln_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {vuln_data.data_source_id} not found")
            
            vulnerability = SecurityVulnerability(
                data_source_id=vuln_data.data_source_id,
                name=vuln_data.name,
                description=vuln_data.description,
                category=vuln_data.category,
                severity=vuln_data.severity,
                cve_id=vuln_data.cve_id,
                cvss_score=vuln_data.cvss_score,
                remediation=vuln_data.remediation,
                affected_components=vuln_data.affected_components,
                metadata=vuln_data.metadata
            )
            
            session.add(vulnerability)
            session.commit()
            session.refresh(vulnerability)
            
            return SecurityVulnerabilityResponse.from_orm(vulnerability)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating vulnerability: {str(e)}")
            raise
    
    @staticmethod
    def update_vulnerability(
        session: Session,
        vulnerability_id: int,
        update_data: SecurityVulnerabilityUpdate,
        user_id: str
    ) -> SecurityVulnerabilityResponse:
        """Update a security vulnerability"""
        try:
            vulnerability = session.get(SecurityVulnerability, vulnerability_id)
            if not vulnerability:
                raise ValueError(f"Vulnerability {vulnerability_id} not found")
            
            # Update fields
            if update_data.status is not None:
                vulnerability.status = update_data.status
                if update_data.status == VulnerabilityStatus.RESOLVED:
                    vulnerability.resolved_at = datetime.now()
            
            if update_data.assigned_to is not None:
                vulnerability.assigned_to = update_data.assigned_to
            
            if update_data.remediation is not None:
                vulnerability.remediation = update_data.remediation
            
            vulnerability.last_updated = datetime.now()
            vulnerability.updated_at = datetime.now()
            
            session.add(vulnerability)
            session.commit()
            session.refresh(vulnerability)
            
            return SecurityVulnerabilityResponse.from_orm(vulnerability)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating vulnerability {vulnerability_id}: {str(e)}")
            raise
    
    @staticmethod
    def create_security_control(
        session: Session,
        control_data: SecurityControlCreate,
        user_id: str
    ) -> SecurityControlResponse:
        """Create a new security control"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, control_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {control_data.data_source_id} not found")
            
            control = SecurityControl(
                data_source_id=control_data.data_source_id,
                name=control_data.name,
                description=control_data.description,
                category=control_data.category,
                framework=control_data.framework,
                control_id=control_data.control_id,
                status=control_data.status,
                implementation_notes=control_data.implementation_notes,
                metadata=control_data.metadata
            )
            
            session.add(control)
            session.commit()
            session.refresh(control)
            
            return SecurityControlResponse.from_orm(control)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating security control: {str(e)}")
            raise
    
    @staticmethod
    def start_security_scan(
        session: Session,
        scan_data: SecurityScanCreate,
        user_id: str
    ) -> SecurityScanResponse:
        """Start a new security scan"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, scan_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {scan_data.data_source_id} not found")
            
            scan = SecurityScan(
                data_source_id=scan_data.data_source_id,
                scan_type=scan_data.scan_type,
                scan_tool=scan_data.scan_tool,
                scan_version=scan_data.scan_version,
                status="running",
                started_at=datetime.now()
            )
            
            session.add(scan)
            session.commit()
            session.refresh(scan)
            
            # TODO: Trigger actual security scan in background
            
            return SecurityScanResponse.from_orm(scan)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error starting security scan: {str(e)}")
            raise
    
    @staticmethod
    def _calculate_security_score(
        vulnerabilities: List[SecurityVulnerabilityResponse],
        controls: List[SecurityControlResponse],
        incidents: List[SecurityIncidentResponse]
    ) -> float:
        """Calculate overall security score"""
        base_score = 100.0
        
        # Deduct points for vulnerabilities
        for vuln in vulnerabilities:
            if vuln.status == VulnerabilityStatus.OPEN:
                if vuln.severity == VulnerabilitySeverity.CRITICAL:
                    base_score -= 15
                elif vuln.severity == VulnerabilitySeverity.HIGH:
                    base_score -= 10
                elif vuln.severity == VulnerabilitySeverity.MEDIUM:
                    base_score -= 5
                elif vuln.severity == VulnerabilitySeverity.LOW:
                    base_score -= 2
        
        # Deduct points for disabled controls
        disabled_controls = [c for c in controls if c.status == SecurityControlStatus.DISABLED]
        base_score -= len(disabled_controls) * 2
        
        # Deduct points for recent incidents
        recent_incidents = [
            i for i in incidents 
            if i.occurred_at > datetime.now() - timedelta(days=30)
        ]
        base_score -= len(recent_incidents) * 5
        
        return max(0.0, min(100.0, base_score))
    
    @staticmethod
    def _get_last_scan_date(session: Session, data_source_id: int) -> Optional[datetime]:
        """Get the date of the last security scan"""
        try:
            query = select(SecurityScan).where(
                and_(
                    SecurityScan.data_source_id == data_source_id,
                    SecurityScan.status == "completed"
                )
            ).order_by(SecurityScan.completed_at.desc()).limit(1)
            
            scan = session.exec(query).first()
            return scan.completed_at if scan else None
            
        except Exception as e:
            logger.error(f"Error getting last scan date: {str(e)}")
            return None
    
    @staticmethod
    def _generate_security_recommendations(
        vulnerabilities: List[SecurityVulnerabilityResponse],
        controls: List[SecurityControlResponse],
        incidents: List[SecurityIncidentResponse]
    ) -> List[str]:
        """Generate security recommendations"""
        recommendations = []
        
        # Check for critical vulnerabilities
        critical_vulns = [v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL and v.status == VulnerabilityStatus.OPEN]
        if critical_vulns:
            recommendations.append("Address critical vulnerabilities immediately")
        
        # Check for disabled security controls
        disabled_controls = [c for c in controls if c.status == SecurityControlStatus.DISABLED]
        if disabled_controls:
            recommendations.append("Enable disabled security controls")
        
        # Check for recent incidents
        recent_incidents = [
            i for i in incidents 
            if i.occurred_at > datetime.now() - timedelta(days=30)
        ]
        if recent_incidents:
            recommendations.append("Review and address recent security incidents")
        
        # Check for outdated assessments
        outdated_controls = [
            c for c in controls 
            if c.last_assessed and c.last_assessed < datetime.now() - timedelta(days=90)
        ]
        if outdated_controls:
            recommendations.append("Update security control assessments")
        
        # Check for missing CVE information
        missing_cve = [v for v in vulnerabilities if not v.cve_id and v.severity in [VulnerabilitySeverity.HIGH, VulnerabilitySeverity.CRITICAL]]
        if missing_cve:
            recommendations.append("Update vulnerability records with CVE information")
        
        return recommendations
    
    @staticmethod
    def _get_compliance_frameworks(session: Session, data_source_id: int) -> List[Dict[str, Any]]:
        """Get compliance framework status"""
        try:
            # Get all controls grouped by framework
            query = select(SecurityControl).where(
                SecurityControl.data_source_id == data_source_id
            )
            
            controls = session.exec(query).all()
            
            frameworks = {}
            for control in controls:
                if control.framework not in frameworks:
                    frameworks[control.framework] = {
                        "name": control.framework,
                        "total_controls": 0,
                        "enabled_controls": 0,
                        "compliant_controls": 0,
                        "compliance_percentage": 0.0
                    }
                
                frameworks[control.framework]["total_controls"] += 1
                
                if control.status == SecurityControlStatus.ENABLED:
                    frameworks[control.framework]["enabled_controls"] += 1
                
                if control.compliance_status == "compliant":
                    frameworks[control.framework]["compliant_controls"] += 1
            
            # Calculate compliance percentages
            for framework in frameworks.values():
                if framework["total_controls"] > 0:
                    framework["compliance_percentage"] = (
                        framework["compliant_controls"] / framework["total_controls"]
                    ) * 100
            
            return list(frameworks.values())
            
        except Exception as e:
            logger.error(f"Error getting compliance frameworks: {str(e)}")
            return []