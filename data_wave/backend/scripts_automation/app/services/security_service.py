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
            
            vulnerabilities = session.execute(
                query.order_by(SecurityVulnerability.severity.desc(), SecurityVulnerability.discovered_at.desc())
            ).scalars().all()
            
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
            
            controls = session.execute(query.order_by(SecurityControl.category, SecurityControl.name)).scalars().all()
            
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
            
            scans = session.execute(query).scalars().all()
            
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
            
            incidents = session.execute(
                query.order_by(SecurityIncident.severity.desc(), SecurityIncident.occurred_at.desc())
            ).scalars().all()
            
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
            
            scan = session.execute(query).scalars().first()
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
            
            controls = session.execute(query).scalars().all()
            
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

        except Exception as e:
            logger.error(f"Error getting compliance frameworks: {str(e)}")
            return []

    # ========================================================================================
    # Missing Methods for Route Integration
    # ========================================================================================

    @staticmethod
    def get_comprehensive_security_audit(
        session: Session,
        data_source_id: int,
        include_vulnerabilities: bool = True,
        include_compliance: bool = True
    ) -> Dict[str, Any]:
        """Get comprehensive security audit with vulnerability assessment"""
        try:
            # Get basic security audit
            audit = SecurityService.get_security_audit(session, data_source_id)
            
            # Get additional data if requested
            additional_data = {}
            
            if include_vulnerabilities:
                additional_data["vulnerabilities"] = SecurityService.get_vulnerability_assessments(
                    session, data_source_id
                )
            
            if include_compliance:
                additional_data["compliance"] = SecurityService.get_compliance_checks(
                    session, data_source_id
                )
            
            # Get threat detection results
            additional_data["threat_detection"] = SecurityService.get_threat_detection_results(
                session, data_source_id
            )
            
            return {
                "audit": audit.dict() if hasattr(audit, 'dict') else audit,
                "additional_data": additional_data,
                "audit_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting comprehensive security audit: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def get_threat_detection_results(
        session: Session,
        data_source_id: int
    ) -> Dict[str, Any]:
        """Get threat detection results using SecurityIncident model"""
        try:
            # Query actual security incidents from the database
            incidents = session.execute(
                select(SecurityIncident).where(
                    and_(
                        SecurityIncident.data_source_id == data_source_id,
                        SecurityIncident.status.in_(["open", "investigating"])
                    )
                ).order_by(SecurityIncident.occurred_at.desc())
            ).scalars().all()
            
            # Convert to response format
            threat_data = []
            for incident in incidents:
                threat_data.append({
                    "threat_id": f"incident_{incident.id}",
                    "threat_type": incident.category,
                    "title": incident.title,
                    "description": incident.description,
                    "severity": incident.severity.value if incident.severity else "unknown",
                    "detection_method": "incident_reporting",
                    "confidence_score": 0.8,  # Default confidence for incidents
                    "status": incident.status,
                    "detected_at": incident.occurred_at.isoformat() if incident.occurred_at else None,
                    "first_seen": incident.occurred_at.isoformat() if incident.occurred_at else None,
                    "last_seen": incident.updated_at.isoformat() if incident.updated_at else None,
                    "ioc_indicators": incident.incident_metadata.get("ioc_indicators", []),
                    "threat_actors": incident.incident_metadata.get("threat_actors", []),
                    "attack_vectors": incident.incident_metadata.get("attack_vectors", []),
                    "affected_assets": incident.affected_systems,
                    "potential_impact": incident.impact_assessment or "unknown",
                    "response_actions": incident.response_actions,
                    "assigned_to": incident.assigned_to
                })
            
            # Calculate threat statistics
            total_threats = len(incidents)
            active_threats = len([i for i in incidents if i.status in ["open", "investigating"]])
            
            # Determine threat level based on severity
            critical_threats = [i for i in incidents if i.severity == VulnerabilitySeverity.CRITICAL]
            high_threats = [i for i in incidents if i.severity == VulnerabilitySeverity.HIGH]
            
            if critical_threats:
                threat_level = "critical"
            elif high_threats:
                threat_level = "high"
            elif active_threats > 5:
                threat_level = "medium"
            else:
                threat_level = "low"
            
            return {
                "threats": threat_data,
                "total_threats": total_threats,
                "active_threats": active_threats,
                "threat_level": threat_level,
                "statistics": {
                    "critical": len(critical_threats),
                    "high": len(high_threats),
                    "medium": len([i for i in incidents if i.severity == VulnerabilitySeverity.MEDIUM]),
                    "low": len([i for i in incidents if i.severity == VulnerabilitySeverity.LOW])
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting threat detection results: {str(e)}")
            return {
                "threats": [],
                "total_threats": 0,
                "active_threats": 0,
                "threat_level": "low",
                "statistics": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "error": str(e)
            }

    @staticmethod
    def create_security_scan(
        session: Session,
        scan_request: Dict[str, Any],
        creator_id: str
    ) -> Dict[str, Any]:
        """Create and schedule security scans"""
        try:
            scan = SecurityScan(
                data_source_id=scan_request.get("data_source_id"),
                scan_type=scan_request.get("scan_type", "comprehensive"),
                scan_configuration=scan_request.get("configuration", {}),
                scheduled_at=scan_request.get("scheduled_at"),
                created_by=creator_id,
                status="scheduled"
            )
            
            session.add(scan)
            session.commit()
            session.refresh(scan)
            
            return {
                "scan_id": scan.id,
                "status": "scheduled",
                "message": "Security scan created successfully"
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating security scan: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def get_security_scans(
        session: Session,
        data_source_id: Optional[int] = None,
        status: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get security scans with filtering"""
        try:
            query = select(SecurityScan)
            
            if data_source_id:
                query = query.where(SecurityScan.data_source_id == data_source_id)
            
            if status:
                query = query.where(SecurityScan.status == status)
            
            # Filter by date
            cutoff_date = datetime.now() - timedelta(days=days)
            query = query.where(SecurityScan.created_at >= cutoff_date)
            
            scans = session.execute(query.order_by(SecurityScan.created_at.desc())).scalars().all()
            
            scan_data = []
            for scan in scans:
                scan_data.append({
                    "scan_id": scan.id,
                    "data_source_id": scan.data_source_id,
                    "scan_type": scan.scan_type,
                    "status": scan.status,
                    "created_at": scan.created_at.isoformat() if scan.created_at else None,
                    "scheduled_at": scan.scheduled_at.isoformat() if scan.scheduled_at else None,
                    "started_at": scan.started_at.isoformat() if scan.started_at else None,
                    "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
                    "created_by": scan.created_by
                })
            
            return {
                "scans": scan_data,
                "total_count": len(scan_data)
            }
            
        except Exception as e:
            logger.error(f"Error getting security scans: {str(e)}")
            return {
                "scans": [],
                "total_count": 0,
                "error": str(e)
            }

    @staticmethod
    def get_vulnerability_assessments(
        session: Session,
        data_source_id: int,
        severity: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get vulnerability assessments"""
        try:
            query = select(SecurityVulnerability).where(
                SecurityVulnerability.data_source_id == data_source_id
            )
            
            if severity:
                query = query.where(SecurityVulnerability.severity == VulnerabilitySeverity(severity))
            
            vulnerabilities = session.execute(query.order_by(SecurityVulnerability.severity.desc())).scalars().all()
            
            vuln_data = []
            for vuln in vulnerabilities:
                vuln_data.append({
                    "vulnerability_id": vuln.id,
                    "title": vuln.name,
                    "description": vuln.description,
                    "severity": vuln.severity.value if vuln.severity else "unknown",
                    "status": vuln.status.value if vuln.status else "unknown",
                    "cve_id": vuln.cve_id,
                    "discovered_at": vuln.discovered_at.isoformat() if vuln.discovered_at else None,
                    "remediation_notes": vuln.remediation
                })
            
            return {
                "vulnerabilities": vuln_data,
                "total_count": len(vuln_data),
                "critical_count": len([v for v in vuln_data if v["severity"] == "critical"]),
                "high_count": len([v for v in vuln_data if v["severity"] == "high"]),
                "medium_count": len([v for v in vuln_data if v["severity"] == "medium"]),
                "low_count": len([v for v in vuln_data if v["severity"] == "low"])
            }
            
        except Exception as e:
            logger.error(f"Error getting vulnerability assessments: {str(e)}")
            return {
                "vulnerabilities": [],
                "total_count": 0,
                "critical_count": 0,
                "high_count": 0,
                "medium_count": 0,
                "low_count": 0,
                "error": str(e)
            }

    @staticmethod
    def remediate_vulnerability(
        session: Session,
        vulnerability_id: int,
        remediation_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Remediate a vulnerability"""
        try:
            vuln = session.get(SecurityVulnerability, vulnerability_id)
            if not vuln:
                return {"error": "Vulnerability not found"}
            
            # Update vulnerability
            vuln.status = VulnerabilityStatus.RESOLVED
            vuln.remediation = remediation_data.get("notes", "")
            vuln.resolved_at = datetime.now()
            vuln.assigned_to = remediation_data.get("resolved_by")
            
            session.commit()
            
            return {
                "vulnerability_id": vuln.id,
                "status": "resolved",
                "resolved_at": vuln.resolved_at.isoformat(),
                "message": "Vulnerability remediated successfully"
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error remediating vulnerability: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def get_security_incidents(
        session: Session,
        data_source_id: Optional[int] = None,
        severity: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get security incidents"""
        try:
            query = select(SecurityIncident)
            
            if data_source_id:
                query = query.where(SecurityIncident.data_source_id == data_source_id)
            
            if severity:
                query = query.where(SecurityIncident.severity == VulnerabilitySeverity(severity))
            
            # Filter by date
            cutoff_date = datetime.now() - timedelta(days=days)
            query = query.where(SecurityIncident.occurred_at >= cutoff_date)
            
            result = session.execute(query.order_by(SecurityIncident.occurred_at.desc())).scalars().all()
            
            incident_data = []
            for incident in result:
                incident_data.append({
                    "incident_id": incident.id,
                    "data_source_id": incident.data_source_id,
                    "title": incident.title,
                    "description": incident.description,
                    "severity": incident.severity.value if incident.severity else "unknown",
                    "status": incident.status,
                    "occurred_at": incident.occurred_at.isoformat() if incident.occurred_at else None,
                    "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None,
                    "reporter": incident.reporter
                })
            
            return {
                "incidents": incident_data,
                "total_count": len(incident_data)
            }
            
        except Exception as e:
            logger.error(f"Error getting security incidents: {str(e)}")
            return {
                "incidents": [],
                "total_count": 0,
                "error": str(e)
            }

    @staticmethod
    def create_security_incident(
        session: Session,
        incident_data: Dict[str, Any],
        creator_id: str
    ) -> Dict[str, Any]:
        """Create a security incident"""
        try:
            incident = SecurityIncident(
                data_source_id=incident_data.get("data_source_id"),
                title=incident_data.get("title"),
                description=incident_data.get("description"),
                severity=VulnerabilitySeverity(incident_data.get("severity", "medium")),
                status="open",
                occurred_at=incident_data.get("occurred_at", datetime.now()),
                reporter=creator_id
            )
            
            session.add(incident)
            session.commit()
            session.refresh(incident)
            
            return {
                "incident_id": incident.id,
                "status": "created",
                "message": "Security incident created successfully"
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating security incident: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def get_compliance_checks(
        session: Session,
        data_source_id: int,
        framework: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get compliance checks"""
        try:
            query = select(SecurityControl).where(
                SecurityControl.data_source_id == data_source_id
            )
            
            if framework:
                query = query.where(SecurityControl.framework == framework)
            
            controls = session.execute(query).scalars().all()
            
            control_data = []
            for control in controls:
                control_data.append({
                    "control_id": control.id,
                    "name": control.name,
                    "description": control.description,
                    "framework": control.framework,
                    "status": control.status.value if control.status else "unknown",
                    "compliance_status": control.compliance_status,
                    "last_assessed": control.last_assessed.isoformat() if control.last_assessed else None,
                    "assessment_notes": control.implementation_notes
                })
            
            return {
                "controls": control_data,
                "total_count": len(control_data),
                "compliant_count": len([c for c in control_data if c["compliance_status"] == "compliant"]),
                "non_compliant_count": len([c for c in control_data if c["compliance_status"] == "non_compliant"])
            }
            
        except Exception as e:
            logger.error(f"Error getting compliance checks: {str(e)}")
            return {
                "controls": [],
                "total_count": 0,
                "compliant_count": 0,
                "non_compliant_count": 0,
                "error": str(e)
            }

    @staticmethod
    def run_compliance_check(
        session: Session,
        data_source_id: int,
        framework: str
    ) -> Dict[str, Any]:
        """Run compliance check for a specific framework"""
        try:
            # Get controls for the framework
            controls = session.execute(
                select(SecurityControl).where(
                    and_(
                        SecurityControl.data_source_id == data_source_id,
                        SecurityControl.framework == framework
                    )
                )
            ).scalars().all()
            
            # Perform compliance assessment
            compliant_count = 0
            for control in controls:
                # Update assessment timestamp
                control.last_assessed = datetime.now()
                
                # Assess compliance based on control status
                if control.status == SecurityControlStatus.ENABLED:
                    control.compliance_status = "compliant"
                    compliant_count += 1
                elif control.status == SecurityControlStatus.PARTIAL:
                    control.compliance_status = "partial"
                else:
                    control.compliance_status = "non_compliant"
            
            session.commit()
            
            return {
                "framework": framework,
                "total_controls": len(controls),
                "compliant_controls": compliant_count,
                "compliance_percentage": (compliant_count / len(controls) * 100) if controls else 0,
                "assessment_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error running compliance check: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def get_security_analytics_dashboard(
        session: Session,
        time_range: str = "7d"
    ) -> Dict[str, Any]:
        """Get security analytics dashboard data"""
        try:
            # Calculate time range
            time_delta = timedelta(days=7) if time_range == "7d" else timedelta(days=30)
            since_time = datetime.now() - time_delta
            
            # Get recent incidents
            incidents = session.execute(
                select(SecurityIncident).where(SecurityIncident.occurred_at >= since_time)
            ).scalars().all()
            
            # Get recent vulnerabilities
            vulnerabilities = session.execute(
                select(SecurityVulnerability).where(SecurityVulnerability.discovered_at >= since_time)
            ).scalars().all()
            
            # Get recent threats
            threats = session.execute(
                select(SecurityThreat).where(SecurityThreat.detected_at >= since_time)
            ).scalars().all()
            
            # Calculate statistics
            critical_incidents = len([i for i in incidents if i.severity == VulnerabilitySeverity.CRITICAL])
            high_incidents = len([i for i in incidents if i.severity == VulnerabilitySeverity.HIGH])
            medium_incidents = len([i for i in incidents if i.severity == VulnerabilitySeverity.MEDIUM])
            
            critical_vulns = len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL])
            high_vulns = len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.HIGH])
            
            critical_threats = len([t for t in threats if t.severity == VulnerabilitySeverity.CRITICAL])
            high_threats = len([t for t in threats if t.severity == VulnerabilitySeverity.HIGH])
            
            return {
                "time_range": time_range,
                "incidents": {
                    "total": len(incidents),
                    "critical": critical_incidents,
                    "high": high_incidents,
                    "medium": medium_incidents
                },
                "vulnerabilities": {
                    "total": len(vulnerabilities),
                    "critical": critical_vulns,
                    "high": high_vulns
                },
                "threats": {
                    "total": len(threats),
                    "critical": critical_threats,
                    "high": high_threats
                },
                "security_score": max(0, 100 - (critical_incidents * 10) - (critical_vulns * 5) - (critical_threats * 3)),
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting security analytics dashboard: {str(e)}")
            return {
                "time_range": time_range,
                "incidents": {"total": 0, "critical": 0, "high": 0, "medium": 0},
                "vulnerabilities": {"total": 0, "critical": 0, "high": 0},
                "threats": {"total": 0, "critical": 0, "high": 0},
                "security_score": 0,
                "error": str(e)
            }

    @staticmethod
    def get_risk_assessment_report(
        session: Session,
        data_source_id: int
    ) -> Dict[str, Any]:
        """Get risk assessment report"""
        try:
            # Get vulnerabilities
            vulnerabilities = SecurityService.get_vulnerabilities(session, data_source_id)
            
            # Get incidents
            incidents = SecurityService.get_incidents(session, data_source_id)
            
            # Get threats
            threats = session.execute(
                select(SecurityThreat).where(SecurityThreat.data_source_id == data_source_id)
            ).scalars().all()
            
            # Calculate risk score
            risk_score = 0
            risk_factors = []
            
            # Factor in critical vulnerabilities
            critical_vulns = [v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL]
            if critical_vulns:
                risk_score += len(critical_vulns) * 20
                risk_factors.append(f"{len(critical_vulns)} critical vulnerabilities")
            
            # Factor in high vulnerabilities
            high_vulns = [v for v in vulnerabilities if v.severity == VulnerabilitySeverity.HIGH]
            if high_vulns:
                risk_score += len(high_vulns) * 10
                risk_factors.append(f"{len(high_vulns)} high vulnerabilities")
            
            # Factor in recent incidents
            recent_incidents = [i for i in incidents if i.occurred_at > datetime.now() - timedelta(days=30)]
            if recent_incidents:
                risk_score += len(recent_incidents) * 5
                risk_factors.append(f"{len(recent_incidents)} recent incidents")
            
            # Factor in active threats
            active_threats = [t for t in threats if t.status in ["detected", "investigating", "confirmed"]]
            if active_threats:
                risk_score += len(active_threats) * 8
                risk_factors.append(f"{len(active_threats)} active threats")
            
            risk_level = "low" if risk_score < 30 else "medium" if risk_score < 60 else "high"
            
            return {
                "data_source_id": data_source_id,
                "risk_score": min(100, risk_score),
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "vulnerabilities_count": len(vulnerabilities),
                "incidents_count": len(incidents),
                "threats_count": len(threats),
                "assessment_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting risk assessment report: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def start_security_monitoring(
        session: Session,
        data_source_id: int,
        monitoring_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Start security monitoring for a data source"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                return {"error": "Data source not found"}
            
            # Create monitoring configuration record
            monitoring_id = f"monitor_{data_source_id}_{int(datetime.now().timestamp())}"
            
            # Validate monitoring configuration
            required_configs = ["scan_interval", "alert_threshold", "monitoring_types"]
            for config in required_configs:
                if config not in monitoring_config:
                    return {"error": f"Missing required configuration: {config}"}
            
            # Create security scan for continuous monitoring
            scan = SecurityScan(
                data_source_id=data_source_id,
                scan_type="continuous_monitoring",
                scan_tool="security_monitor",
                scan_version="1.0",
                status="running",
                started_at=datetime.now(),
                scan_configuration={
                    "monitoring_id": monitoring_id,
                    "config": monitoring_config,
                    "continuous": True,
                    "alert_enabled": monitoring_config.get("alert_enabled", True)
                }
            )
            
            session.add(scan)
            session.commit()
            session.refresh(scan)
            
            # Create initial security controls if not exist
            existing_controls = session.execute(select(SecurityControl).where(
                SecurityControl.data_source_id == data_source_id
            )).scalars().all()
            
            if not existing_controls:
                # Create basic security controls
                basic_controls = [
                    {
                        "name": "Access Control Monitoring",
                        "description": "Monitor user access patterns and permissions",
                        "category": "access_control",
                        "framework": "NIST"
                    },
                    {
                        "name": "Data Encryption Monitoring",
                        "description": "Monitor encryption status and key management",
                        "category": "encryption",
                        "framework": "NIST"
                    },
                    {
                        "name": "Network Security Monitoring",
                        "description": "Monitor network traffic and security events",
                        "category": "network_security",
                        "framework": "NIST"
                    }
                ]
                
                for control_data in basic_controls:
                    control = SecurityControl(
                        data_source_id=data_source_id,
                        name=control_data["name"],
                        description=control_data["description"],
                        category=control_data["category"],
                        framework=control_data["framework"],
                        status=SecurityControlStatus.ENABLED,
                        compliance_status="compliant"
                    )
                    session.add(control)
            
            session.commit()
            
            # Log monitoring start event
            SecurityService._log_security_event(
                session, data_source_id, "monitoring_started",
                f"Started security monitoring for data source {data_source_id}",
                {"monitoring_id": monitoring_id, "config": monitoring_config}
            )
            
            return {
                "monitoring_id": monitoring_id,
                "data_source_id": data_source_id,
                "scan_id": scan.id,
                "status": "active",
                "config": monitoring_config,
                "started_at": datetime.now().isoformat(),
                "message": "Security monitoring started successfully",
                "controls_created": len(basic_controls) if 'basic_controls' in locals() else 0
            }
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error starting security monitoring: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def _log_security_event(
        session: Session,
        data_source_id: int,
        event_type: str,
        description: str,
        metadata: Dict[str, Any] = None
    ) -> None:
        """Log security events for audit and analytics"""
        try:
            # Create a security incident record for logging
            incident = SecurityIncident(
                data_source_id=data_source_id,
                title=f"Security Event: {event_type}",
                description=description,
                severity=VulnerabilitySeverity.LOW,  # Default to low for logging events
                status="logged",
                occurred_at=datetime.now(),
                reporter="system",
                metadata=metadata or {}
            )
            session.add(incident)
            session.commit()
        except Exception as e:
            logger.error(f"Failed to log security event: {e}")
            session.rollback()