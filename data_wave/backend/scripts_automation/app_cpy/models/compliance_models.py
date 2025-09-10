from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum
import json


class ComplianceFramework(str, Enum):
    SOC2 = "soc2"
    GDPR = "gdpr"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"
    ISO27001 = "iso27001"
    NIST = "nist"
    CCPA = "ccpa"
    SOX = "sox"
    CUSTOM = "custom"


class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIALLY_COMPLIANT = "partially_compliant"
    NOT_ASSESSED = "not_assessed"
    IN_PROGRESS = "in_progress"


class AssessmentStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class ComplianceRequirement(SQLModel, table=True):
    """Compliance requirement model for tracking regulatory requirements"""
    __tablename__ = "compliance_requirements"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # **INTERCONNECTED: Organization Management for Multi-Tenant Enterprise Governance**
    organization_id: Optional[int] = Field(default=None, foreign_key="organizations.id", index=True)
    
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Requirement details
    framework: ComplianceFramework
    requirement_id: str = Field(index=True)  # e.g., "SOC2-CC6.1"
    title: str
    description: str
    category: str  # e.g., "Access Control", "Data Protection"
    
    # Status
    status: ComplianceStatus = Field(default=ComplianceStatus.NOT_ASSESSED)
    compliance_percentage: float = Field(default=0.0)
    
    # Assessment details
    last_assessed: Optional[datetime] = None
    next_assessment: Optional[datetime] = None
    assessor: Optional[str] = None
    assessment_notes: Optional[str] = None
    
    # Evidence and documentation
    evidence_files: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    documentation_links: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Risk assessment
    risk_level: str = Field(default="medium")  # low, medium, high, critical
    impact_description: Optional[str] = None
    
    # Remediation
    remediation_plan: Optional[str] = None
    remediation_deadline: Optional[datetime] = None
    remediation_owner: Optional[str] = None
    
    # Metadata
    requirement_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # **INTERCONNECTED: Organization Management for Multi-Tenant Enterprise Governance**
    organization: Optional["Organization"] = Relationship(back_populates="compliance_requirements")


class ComplianceAssessment(SQLModel, table=True):
    """Compliance assessment model for tracking compliance assessments"""
    __tablename__ = "compliance_assessments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Assessment details
    framework: ComplianceFramework
    assessment_type: str  # e.g., "annual", "quarterly", "ad-hoc"
    title: str
    description: Optional[str] = None
    
    # Status and timing
    status: AssessmentStatus = Field(default=AssessmentStatus.PENDING)
    scheduled_date: Optional[datetime] = None
    started_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    
    # Assessor information
    assessor: Optional[str] = None
    assessment_firm: Optional[str] = None
    
    # Results
    overall_score: Optional[float] = None
    compliant_requirements: int = Field(default=0)
    non_compliant_requirements: int = Field(default=0)
    total_requirements: int = Field(default=0)
    
    # Findings
    findings: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Documentation
    report_file: Optional[str] = None
    certificate_file: Optional[str] = None
    
    # Metadata
    assessment_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ComplianceGap(SQLModel, table=True):
    """Compliance gap model for tracking compliance gaps and remediation"""
    __tablename__ = "compliance_gaps"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    requirement_id: int = Field(foreign_key="compliance_requirements.id")
    
    # Gap details
    gap_title: str
    gap_description: str
    severity: str = Field(default="medium")  # low, medium, high, critical
    
    # Status
    status: str = Field(default="open")  # open, in_progress, resolved, accepted_risk
    
    # Remediation
    remediation_plan: Optional[str] = None
    remediation_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    
    # Progress tracking
    progress_percentage: float = Field(default=0.0)
    last_updated_by: Optional[str] = None
    
    # Impact assessment
    business_impact: Optional[str] = None
    technical_impact: Optional[str] = None
    
    # Metadata
    gap_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ComplianceEvidence(SQLModel, table=True):
    """Compliance evidence model for storing compliance evidence"""
    __tablename__ = "compliance_evidence"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    requirement_id: int = Field(foreign_key="compliance_requirements.id")
    
    # Evidence details
    title: str
    description: Optional[str] = None
    evidence_type: str  # e.g., "document", "screenshot", "log", "certificate"
    
    # File information
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_hash: Optional[str] = None
    
    # Validity
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_current: bool = Field(default=True)
    
    # Metadata
    collected_by: Optional[str] = None
    collection_method: Optional[str] = None
    evidence_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Response Models
class ComplianceRequirementResponse(SQLModel):
    id: int
    data_source_id: int
    framework: ComplianceFramework
    requirement_id: str
    title: str
    description: str
    category: str
    status: ComplianceStatus
    compliance_percentage: float
    last_assessed: Optional[datetime]
    next_assessment: Optional[datetime]
    assessor: Optional[str]
    assessment_notes: Optional[str]
    risk_level: str
    remediation_plan: Optional[str]
    remediation_deadline: Optional[datetime]
    remediation_owner: Optional[str]


class ComplianceAssessmentResponse(SQLModel):
    id: int
    data_source_id: int
    framework: ComplianceFramework
    assessment_type: str
    title: str
    status: AssessmentStatus
    scheduled_date: Optional[datetime]
    started_date: Optional[datetime]
    completed_date: Optional[datetime]
    assessor: Optional[str]
    overall_score: Optional[float]
    compliant_requirements: int
    non_compliant_requirements: int
    total_requirements: int
    findings: List[Dict[str, Any]]
    recommendations: List[str]


class ComplianceGapResponse(SQLModel):
    id: int
    data_source_id: int
    requirement_id: int
    gap_title: str
    gap_description: str
    severity: str
    status: str
    remediation_plan: Optional[str]
    assigned_to: Optional[str]
    due_date: Optional[datetime]
    progress_percentage: float
    business_impact: Optional[str]
    technical_impact: Optional[str]


class ComplianceStatusResponse(SQLModel):
    overall_score: float
    frameworks: List[Dict[str, Any]]
    requirements: List[ComplianceRequirementResponse]
    recent_assessments: List[ComplianceAssessmentResponse]
    gaps: List[ComplianceGapResponse]
    recommendations: List[str]
    next_assessment_due: Optional[datetime]


# Create Models
class ComplianceRequirementCreate(SQLModel):
    data_source_id: int
    framework: ComplianceFramework
    requirement_id: str
    title: str
    description: str
    category: str
    risk_level: str = "medium"
    remediation_plan: Optional[str] = None
    remediation_deadline: Optional[datetime] = None
    requirement_metadata: Dict[str, Any] = Field(default_factory=dict)


class ComplianceAssessmentCreate(SQLModel):
    data_source_id: int
    framework: ComplianceFramework
    assessment_type: str
    title: str
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    assessor: Optional[str] = None


class ComplianceGapCreate(SQLModel):
    data_source_id: int
    requirement_id: int
    gap_title: str
    gap_description: str
    severity: str = "medium"
    remediation_plan: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None


# Update Models
class ComplianceRequirementUpdate(SQLModel):
    status: Optional[ComplianceStatus] = None
    compliance_percentage: Optional[float] = None
    assessment_notes: Optional[str] = None
    remediation_plan: Optional[str] = None
    remediation_deadline: Optional[datetime] = None
    remediation_owner: Optional[str] = None


class ComplianceGapUpdate(SQLModel):
    status: Optional[str] = None
    remediation_plan: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    progress_percentage: Optional[float] = None


class ComplianceValidation(SQLModel, table=True):
    """Compliance validation model for tracking validation results"""
    __tablename__ = "compliance_validations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    requirement_id: int = Field(foreign_key="compliance_requirements.id")
    
    # Validation details
    validation_type: str  # e.g., "automated", "manual", "scheduled", "ad-hoc"
    validation_method: str  # e.g., "scan", "audit", "review", "test"
    
    # Validation status
    validation_status: str = Field(default="pending", index=True)  # pending, passed, failed, in_progress
    validation_score: Optional[float] = None  # 0-100 score
    
    # Validation results
    passed_checks: int = Field(default=0)
    failed_checks: int = Field(default=0)
    total_checks: int = Field(default=0)
    
    # Details
    validation_details: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    error_messages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Validation metadata
    validation_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: datetime = Field(default_factory=datetime.now)
    validated_by: Optional[str] = None
    validation_duration: Optional[int] = None  # Duration in seconds


# Import necessary types for forward references
if TYPE_CHECKING:
    from .organization_models import Organization