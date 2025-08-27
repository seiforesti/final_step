# app/models/organization_models.py

from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from sqlalchemy import Column, ARRAY, String, JSON

class Organization(SQLModel, table=True):
    """
    Enterprise organization model for multi-tenant data governance.
    Supports hierarchical organizational structures and advanced governance policies.
    """
    __tablename__ = "organizations"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    organization_uuid: uuid.UUID = Field(default_factory=uuid.uuid4, unique=True, index=True)
    
    # Basic information
    name: str = Field(description="Organization name")
    display_name: Optional[str] = Field(default=None, description="Display name for UI")
    description: Optional[str] = Field(default=None, description="Organization description")
    
    # Organizational structure
    parent_organization_id: Optional[int] = Field(default=None, foreign_key="organizations.id", index=True)
    organization_type: str = Field(default="enterprise", description="Type of organization")
    industry: Optional[str] = Field(default=None, description="Industry classification")
    sector: Optional[str] = Field(default=None, description="Business sector")
    
    # Contact and location
    contact_email: Optional[str] = Field(default=None, description="Primary contact email")
    contact_phone: Optional[str] = Field(default=None, description="Primary contact phone")
    website: Optional[str] = Field(default=None, description="Organization website")
    address: Optional[str] = Field(default=None, description="Physical address")
    country: Optional[str] = Field(default=None, description="Country")
    region: Optional[str] = Field(default=None, description="Geographic region")
    timezone: Optional[str] = Field(default="UTC", description="Primary timezone")
    
    # Governance and compliance
    compliance_framework: Optional[str] = Field(default=None, description="Primary compliance framework")
    data_residency: Optional[str] = Field(default=None, description="Data residency requirements")
    privacy_regulations: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    security_level: str = Field(default="standard", description="Security classification level")
    
    # Business context
    employee_count: Optional[int] = Field(default=None, description="Number of employees")
    annual_revenue: Optional[float] = Field(default=None, description="Annual revenue")
    founding_year: Optional[int] = Field(default=None, description="Year founded")
    legal_entity_type: Optional[str] = Field(default=None, description="Legal entity type")
    
    # System configuration
    max_users: Optional[int] = Field(default=None, description="Maximum number of users")
    max_projects: Optional[int] = Field(default=None, description="Maximum number of projects")
    max_storage_gb: Optional[int] = Field(default=None, description="Maximum storage in GB")
    feature_flags: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Status and lifecycle
    status: str = Field(default="active", description="Organization status")
    lifecycle_stage: str = Field(default="production", description="Lifecycle stage")
    onboarding_completed: bool = Field(default=False, description="Onboarding completion status")
    
    # Metadata and audit - CRITICAL: Break circular dependency by making these nullable without foreign key
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[int] = Field(default=None, description="User ID who created the organization")
    updated_by: Optional[int] = Field(default=None, description="User ID who last updated the organization")
    
    # Relationships
    parent_organization: Optional["Organization"] = Relationship(
        back_populates="child_organizations",
        sa_relationship_kwargs={"remote_side": "Organization.id"}
    )
    child_organizations: List["Organization"] = Relationship(back_populates="parent_organization")
    
    # Users and members - Advanced enterprise relationship with explicit foreign key specification
    users: List["User"] = Relationship(
        back_populates="organization",
        sa_relationship_kwargs={
            "primaryjoin": "and_(User.organization_id == Organization.id, User.organization_id.isnot(None))"
        }
    )
    
    # Data sources and assets
    data_sources: List["DataSource"] = Relationship(back_populates="organization")
    catalog_items: List["CatalogItem"] = Relationship(back_populates="organization")
    
    # Compliance and governance
    compliance_rules: List["ComplianceRule"] = Relationship(back_populates="organization")
    compliance_requirements: List["ComplianceRequirement"] = Relationship(back_populates="organization")
    
    # Analytics and reporting
    usage_analytics: List["UsageAnalytics"] = Relationship(back_populates="organization")
    trend_analytics: List["TrendAnalysis"] = Relationship(back_populates="organization")
    roi_metrics: List["ROIMetrics"] = Relationship(back_populates="organization")
    compliance_framework_integrations: List["ComplianceFrameworkIntegration"] = Relationship(back_populates="organization")
    marketplace_analytics: List["MarketplaceAnalytics"] = Relationship(back_populates="organization")
    usage_metrics: List["UsageMetrics"] = Relationship(back_populates="organization")
    
    # Workflows and processes
    workflows: List["Workflow"] = Relationship(back_populates="organization")
    scan_orchestration_jobs: List["ScanOrchestrationJob"] = Relationship(back_populates="organization")
    
    # Settings and configuration
    organization_settings: List["OrganizationSetting"] = Relationship(back_populates="organization")
    
    class Config:
        arbitrary_types_allowed = True

class OrganizationSetting(SQLModel, table=True):
    """
    Organization-specific configuration and settings.
    """
    __tablename__ = "organization_settings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    organization_id: int = Field(foreign_key="organizations.id", index=True)
    
    # Setting categories
    setting_key: str = Field(description="Setting identifier")
    setting_value: str = Field(description="Setting value")
    setting_type: str = Field(default="string", description="Data type of setting")
    category: str = Field(default="general", description="Setting category")
    
    # Metadata
    description: Optional[str] = Field(default=None, description="Setting description")
    is_encrypted: bool = Field(default=False, description="Whether value is encrypted")
    is_required: bool = Field(default=False, description="Whether setting is required")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[int] = Field(default=None, foreign_key="users.id")
    
    # Relationships
    organization: "Organization" = Relationship(back_populates="organization_settings")
    
    class Config:
        arbitrary_types_allowed = True

# Import necessary types for forward references
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .auth_models import User
    from .scan_models import DataSource
    from .catalog_models import CatalogItem
    from .compliance_rule_models import ComplianceRule
    from .compliance_requirement_models import ComplianceRequirement
    from .Scan_Rule_Sets_completed_models.analytics_reporting_models import (
        UsageAnalytics, TrendAnalysis, ROIMetrics, 
        ComplianceFrameworkIntegration, MarketplaceAnalytics, UsageMetrics
    )
    from .workflow_models import Workflow
    from .scan_models import ScanOrchestrationJob

# Runtime imports to ensure relationship target classes are registered with SQLModel/SQLAlchemy
# while avoiding hard circular imports. Wrapped in try/except to be resilient at import time.
try:
    from .Scan_Rule_Sets_completed_models.analytics_reporting_models import (
        UsageAnalytics, TrendAnalysis, ROIMetrics,
        ComplianceFrameworkIntegration, MarketplaceAnalytics, UsageMetrics,
    )
except Exception:
    # Defer resolution; SQLAlchemy will evaluate string-based relationships later if available
    pass

try:
    from .auth_models import User  # noqa: F401
except Exception:
    pass

try:
    from .scan_models import DataSource, ScanOrchestrationJob  # noqa: F401
except Exception:
    pass

try:
    from .catalog_models import CatalogItem  # noqa: F401
except Exception:
    pass

try:
    from .compliance_rule_models import ComplianceRule  # noqa: F401
except Exception:
    pass

try:
    from .compliance_requirement_models import ComplianceRequirement  # noqa: F401
except Exception:
    pass

try:
    from .workflow_models import Workflow  # noqa: F401
except Exception:
    pass
