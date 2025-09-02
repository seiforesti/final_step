from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json


class VulnerabilitySeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class VulnerabilityStatus(str, Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class SecurityControlStatus(str, Enum):
    ENABLED = "enabled"
    DISABLED = "disabled"
    PARTIAL = "partial"
    NOT_APPLICABLE = "not_applicable"


class SecurityVulnerability(SQLModel, table=True):
    """Security vulnerability model for tracking security issues"""
    __tablename__ = "security_vulnerabilities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Vulnerability details
    name: str = Field(index=True)
    description: str
    category: str  # e.g., "Application Security", "Network Security"
    severity: VulnerabilitySeverity
    status: VulnerabilityStatus = Field(default=VulnerabilityStatus.OPEN)
    
    # CVE information
    cve_id: Optional[str] = Field(index=True)
    cvss_score: Optional[float] = None
    cvss_vector: Optional[str] = None
    
    # Remediation
    remediation: Optional[str] = None
    affected_components: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Tracking
    discovered_at: datetime = Field(default_factory=datetime.now)
    last_updated: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    
    # Assignment
    assigned_to: Optional[str] = None
    
    # Additional metadata
    vulnerability_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class SecurityControl(SQLModel, table=True):
    """Security control model for tracking security controls"""
    __tablename__ = "security_controls"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Control details
    name: str = Field(index=True)
    description: str
    category: str  # e.g., "Access Control", "Encryption", "Monitoring"
    framework: str  # e.g., "NIST", "ISO27001", "SOC2"
    control_id: str  # Framework-specific ID
    
    # Status
    status: SecurityControlStatus = Field(default=SecurityControlStatus.DISABLED)
    compliance_status: str = Field(default="non_compliant")  # compliant, non_compliant, partial
    
    # Implementation details
    implementation_notes: Optional[str] = None
    evidence: Optional[str] = None
    
    # Assessment
    last_assessed: Optional[datetime] = None
    next_assessment: Optional[datetime] = None
    assessor: Optional[str] = None
    
    # Metadata
    control_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class SecurityScan(SQLModel, table=True):
    """Security scan model for tracking security scans"""
    __tablename__ = "security_scans"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Scan details
    scan_type: str  # e.g., "vulnerability", "compliance", "penetration"
    scan_tool: str  # e.g., "Nessus", "OpenVAS", "Custom"
    scan_version: Optional[str] = None
    
    # Status
    status: str = Field(default="pending")  # pending, running, completed, failed
    
    # Results
    vulnerabilities_found: int = Field(default=0)
    critical_count: int = Field(default=0)
    high_count: int = Field(default=0)
    medium_count: int = Field(default=0)
    low_count: int = Field(default=0)
    
    # Timing
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Results storage
    scan_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class SecurityIncident(SQLModel, table=True):
    """Security incident model for tracking security incidents"""
    __tablename__ = "security_incidents"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Incident details
    title: str
    description: str
    severity: VulnerabilitySeverity
    category: str  # e.g., "Data Breach", "Unauthorized Access"
    
    # Status
    status: str = Field(default="open")  # open, investigating, resolved, closed
    
    # Assignment
    assigned_to: Optional[str] = None
    reporter: Optional[str] = None
    
    # Timing
    occurred_at: datetime = Field(default_factory=datetime.now)
    detected_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    # Impact
    impact_assessment: Optional[str] = None
    affected_systems: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Response
    response_actions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata
    incident_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# SecurityThreat model removed - using SecurityIncident instead


# Response Models
class SecurityVulnerabilityResponse(SQLModel):
    id: int
    data_source_id: int
    name: str
    description: str
    category: str
    severity: VulnerabilitySeverity
    status: VulnerabilityStatus
    cve_id: Optional[str]
    cvss_score: Optional[float]
    remediation: Optional[str]
    affected_components: List[str]
    discovered_at: datetime
    last_updated: datetime
    resolved_at: Optional[datetime]
    assigned_to: Optional[str]


class SecurityControlResponse(SQLModel):
    id: int
    data_source_id: int
    name: str
    description: str
    category: str
    framework: str
    control_id: str
    status: SecurityControlStatus
    compliance_status: str
    implementation_notes: Optional[str]
    last_assessed: Optional[datetime]
    next_assessment: Optional[datetime]
    assessor: Optional[str]


class SecurityScanResponse(SQLModel):
    id: int
    data_source_id: int
    scan_type: str
    scan_tool: str
    status: str
    vulnerabilities_found: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]


class SecurityIncidentResponse(SQLModel):
    id: int
    data_source_id: int
    title: str
    description: str
    severity: VulnerabilitySeverity
    category: str
    status: str
    assigned_to: Optional[str]
    reporter: Optional[str]
    occurred_at: datetime
    detected_at: Optional[datetime]
    resolved_at: Optional[datetime]
    impact_assessment: Optional[str]
    affected_systems: List[str]
    response_actions: List[str]


class SecurityThreatResponse(SQLModel):
    id: int
    data_source_id: int
    threat_id: str
    threat_type: str
    title: str
    description: str
    severity: VulnerabilitySeverity
    detection_method: str
    confidence_score: float
    status: str
    detected_at: datetime
    first_seen: Optional[datetime]
    last_seen: Optional[datetime]
    resolved_at: Optional[datetime]
    ioc_indicators: List[str]
    threat_actors: List[str]
    attack_vectors: List[str]
    affected_assets: List[str]
    potential_impact: str
    response_actions: List[str]
    assigned_to: Optional[str]


class SecurityAuditResponse(SQLModel):
    security_score: float
    last_scan: Optional[datetime]
    vulnerabilities: List[SecurityVulnerabilityResponse]
    controls: List[SecurityControlResponse]
    recent_scans: List[SecurityScanResponse]
    incidents: List[SecurityIncidentResponse]
    recommendations: List[str]
    compliance_frameworks: List[Dict[str, Any]]


# Create Models
class SecurityVulnerabilityCreate(SQLModel):
    data_source_id: int
    name: str
    description: str
    category: str
    severity: VulnerabilitySeverity
    cve_id: Optional[str] = None
    cvss_score: Optional[float] = None
    remediation: Optional[str] = None
    affected_components: List[str] = Field(default_factory=list)
    vulnerability_metadata: Dict[str, Any] = Field(default_factory=dict)


class SecurityControlCreate(SQLModel):
    data_source_id: int
    name: str
    description: str
    category: str
    framework: str
    control_id: str
    status: SecurityControlStatus = SecurityControlStatus.DISABLED
    implementation_notes: Optional[str] = None
    control_metadata: Dict[str, Any] = Field(default_factory=dict)


class SecurityScanCreate(SQLModel):
    data_source_id: int
    scan_type: str
    scan_tool: str
    scan_version: Optional[str] = None


class SecurityIncidentCreate(SQLModel):
    data_source_id: int
    title: str
    description: str
    severity: VulnerabilitySeverity
    category: str
    reporter: Optional[str] = None
    impact_assessment: Optional[str] = None
    affected_systems: List[str] = Field(default_factory=list)


# Update Models
class SecurityVulnerabilityUpdate(SQLModel):
    status: Optional[VulnerabilityStatus] = None
    assigned_to: Optional[str] = None
    remediation: Optional[str] = None
    resolved_at: Optional[datetime] = None


class SecurityControlUpdate(SQLModel):
    status: Optional[SecurityControlStatus] = None
    compliance_status: Optional[str] = None
    implementation_notes: Optional[str] = None
    last_assessed: Optional[datetime] = None
    assessor: Optional[str] = None


class SecurityIncidentUpdate(SQLModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None
    impact_assessment: Optional[str] = None
    response_actions: Optional[List[str]] = None