from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
import json

# ============================================================================
# ADVANCED CATALOG COLLABORATION MODELS
# ============================================================================
# Extends the general collaboration_models.py with Advanced-Catalog specific
# collaboration features for data stewardship, annotations, reviews, and 
# community-driven governance
# ============================================================================

class TeamType(str, Enum):
    DATA_STEWARDSHIP = "DATA_STEWARDSHIP"
    QUALITY_ASSURANCE = "QUALITY_ASSURANCE"
    COMPLIANCE = "COMPLIANCE"
    ANALYTICS = "ANALYTICS"
    ENGINEERING = "ENGINEERING"
    BUSINESS = "BUSINESS"
    CROSS_FUNCTIONAL = "CROSS_FUNCTIONAL"

class TeamPurpose(str, Enum):
    ASSET_MANAGEMENT = "ASSET_MANAGEMENT"
    QUALITY_CONTROL = "QUALITY_CONTROL"
    COMPLIANCE_MONITORING = "COMPLIANCE_MONITORING"
    INNOVATION = "INNOVATION"
    OPERATIONAL_SUPPORT = "OPERATIONAL_SUPPORT"
    STRATEGIC_PLANNING = "STRATEGIC_PLANNING"

class AnnotationTargetType(str, Enum):
    ASSET = "ASSET"
    COLUMN = "COLUMN"
    SCHEMA = "SCHEMA"
    BUSINESS_TERM = "BUSINESS_TERM"
    RELATIONSHIP = "RELATIONSHIP"
    TRANSFORMATION = "TRANSFORMATION"

class AnnotationType(str, Enum):
    COMMENT = "COMMENT"
    DOCUMENTATION = "DOCUMENTATION"
    BUSINESS_CONTEXT = "BUSINESS_CONTEXT"
    TECHNICAL_NOTE = "TECHNICAL_NOTE"
    QUALITY_NOTE = "QUALITY_NOTE"
    COMPLIANCE_NOTE = "COMPLIANCE_NOTE"
    WARNING = "WARNING"
    RECOMMENDATION = "RECOMMENDATION"

class AnnotationStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"

class ReviewType(str, Enum):
    QUALITY_REVIEW = "QUALITY_REVIEW"
    COMPLIANCE_REVIEW = "COMPLIANCE_REVIEW"
    BUSINESS_REVIEW = "BUSINESS_REVIEW"
    TECHNICAL_REVIEW = "TECHNICAL_REVIEW"
    METADATA_REVIEW = "METADATA_REVIEW"
    CLASSIFICATION_REVIEW = "CLASSIFICATION_REVIEW"

class ReviewStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    UNDER_REVIEW = "UNDER_REVIEW"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class ContributionType(str, Enum):
    ANNOTATION = "ANNOTATION"
    DOCUMENTATION = "DOCUMENTATION"
    QUALITY_IMPROVEMENT = "QUALITY_IMPROVEMENT"
    CLASSIFICATION = "CLASSIFICATION"
    RELATIONSHIP_MAPPING = "RELATIONSHIP_MAPPING"
    REVIEW = "REVIEW"

class ExpertiseLevel(str, Enum):
    NOVICE = "NOVICE"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"
    THOUGHT_LEADER = "THOUGHT_LEADER"

# ============================================================================
# COLLABORATION HUB MODELS
# ============================================================================

class CatalogCollaborationHub(SQLModel, table=True):
    """Main collaboration hub for catalog teams and governance"""
    __tablename__ = "catalog_collaboration_hubs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Hub Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Governance
    governance_enabled: bool = Field(default=True)
    auto_approval_rules: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    escalation_rules: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics_config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    teams: List["CollaborationTeam"] = Relationship(back_populates="hub")
    workspaces: List["CollaborationWorkspace"] = Relationship(back_populates="hub")
    activities: List["CollaborationActivity"] = Relationship(back_populates="hub")

class CollaborationTeam(SQLModel, table=True):
    """Teams within the collaboration hub"""
    __tablename__ = "collaboration_teams"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hub_id: int = Field(foreign_key="catalog_collaboration_hubs.id", index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Team Configuration
    team_type: TeamType = Field(default=TeamType.DATA_STEWARDSHIP)
    purpose: TeamPurpose = Field(default=TeamPurpose.ASSET_MANAGEMENT)
    
    # Permissions
    permissions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Assets & Responsibilities
    assigned_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    responsibilities: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Goals & Metrics
    goals: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    metrics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    status: str = Field(default="active")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    hub: Optional["CatalogCollaborationHub"] = Relationship(back_populates="teams")
    members: List["TeamMember"] = Relationship(back_populates="team")

class TeamMember(SQLModel, table=True):
    """Team member details and roles"""
    __tablename__ = "team_members"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="collaboration_teams.id", index=True)
    user_id: str = Field(index=True)
    name: str
    email: str
    
    # Role & Permissions
    role: str = Field(default="member")
    permissions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    responsibilities: List[str] = Field(default=None, sa_column=Column(JSON))
    expertise: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    joined_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    team: Optional["CollaborationTeam"] = Relationship(back_populates="members")

class CollaborationWorkspace(SQLModel, table=True):
    """Collaboration workspaces for teams"""
    __tablename__ = "collaboration_workspaces"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hub_id: int = Field(foreign_key="catalog_collaboration_hubs.id", index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Workspace Configuration
    workspace_type: str = Field(default="PROJECT")
    visibility: str = Field(default="PRIVATE")
    
    # Access Control
    access_control: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Tools & Features
    tools: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    features: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Settings
    settings: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    hub: Optional["CatalogCollaborationHub"] = Relationship(back_populates="workspaces")
    members: List["CatalogWorkspaceMember"] = Relationship(back_populates="workspace")
    assets: List["WorkspaceAsset"] = Relationship(back_populates="workspace")
    discussions: List["WorkspaceDiscussion"] = Relationship(back_populates="workspace")

class CatalogWorkspaceMember(SQLModel, table=True):
    """Catalog workspace member details"""
    __tablename__ = "catalog_workspace_members"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="collaboration_workspaces.id", index=True)
    user_id: str = Field(index=True)
    role: str = Field(default="member")
    permissions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamps
    joined_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workspace: Optional["CollaborationWorkspace"] = Relationship(back_populates="members")

class WorkspaceAsset(SQLModel, table=True):
    """Assets within workspaces"""
    __tablename__ = "workspace_assets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="collaboration_workspaces.id", index=True)
    asset_id: str = Field(index=True)
    asset_type: str
    asset_name: str
    
    # Asset Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Permissions
    permissions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamps
    added_at: datetime = Field(default_factory=datetime.now)
    last_accessed: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workspace: Optional["CollaborationWorkspace"] = Relationship(back_populates="assets")

class WorkspaceDiscussion(SQLModel, table=True):
    """Workspace discussions"""
    __tablename__ = "workspace_discussions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="collaboration_workspaces.id", index=True)
    title: str
    content: str
    author_id: str = Field(index=True)
    
    # Discussion Type
    discussion_type: str = Field(default="general")
    priority: str = Field(default="medium")
    
    # Status
    status: str = Field(default="open")
    is_pinned: bool = Field(default=False)
    
    # Engagement
    views_count: int = Field(default=0)
    upvotes: int = Field(default=0)
    
    # Related Assets
    related_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workspace: Optional["CollaborationWorkspace"] = Relationship(back_populates="discussions")

class CollaborationActivity(SQLModel, table=True):
    """Activity tracking for collaboration"""
    __tablename__ = "collaboration_activities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hub_id: int = Field(foreign_key="catalog_collaboration_hubs.id", index=True)
    
    # Activity Details
    activity_type: str = Field(index=True)
    user_id: str = Field(index=True)
    description: str
    
    # Context
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    
    # Metadata
    activity_metadata: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamp
    timestamp: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    hub: Optional["CatalogCollaborationHub"] = Relationship(back_populates="activities")

# ============================================================================
# DATA STEWARDSHIP MODELS
# ============================================================================

class DataStewardshipCenter(SQLModel, table=True):
    """Data stewardship center for governance workflows"""
    __tablename__ = "data_stewardship_centers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Quality Management
    quality_management: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Governance
    governance: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Metrics & Reporting
    metrics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    reporting: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    stewards: List["DataSteward"] = Relationship(back_populates="center")
    workflows: List["StewardshipWorkflow"] = Relationship(back_populates="center")

class DataSteward(SQLModel, table=True):
    """Data steward details and responsibilities"""
    __tablename__ = "data_stewards"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    center_id: int = Field(foreign_key="data_stewardship_centers.id", index=True)
    user_id: str = Field(index=True)
    name: str
    email: str
    
    # Role & Responsibilities
    role: str = Field(default="steward")
    responsibilities: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Areas of Expertise
    expertise_areas: List[str] = Field(default=None, sa_column=Column(JSON))
    domains: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Assigned Assets
    assigned_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    managed_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Performance
    performance: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Certification
    certifications: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    status: str = Field(default="active")
    
    # Timestamps
    assigned_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    center: Optional["DataStewardshipCenter"] = Relationship(back_populates="stewards")
    activities: List["StewardActivity"] = Relationship(back_populates="steward")

class StewardActivity(SQLModel, table=True):
    """Steward activity tracking"""
    __tablename__ = "steward_activities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    steward_id: int = Field(foreign_key="data_stewards.id", index=True)
    
    # Activity Details
    activity_type: str = Field(index=True)
    description: str
    
    # Context
    asset_id: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    
    # Results
    outcome: Optional[str] = None
    impact: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    steward_metadata: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamp
    timestamp: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    steward: Optional["DataSteward"] = Relationship(back_populates="activities")

class StewardshipWorkflow(SQLModel, table=True):
    """Stewardship workflow definitions"""
    __tablename__ = "stewardship_workflows"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    center_id: int = Field(foreign_key="data_stewardship_centers.id", index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Workflow Configuration
    workflow_type: str = Field(default="approval")
    steps: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Triggers
    triggers: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Business Rules
    business_rules: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # SLAs
    slas: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    status: str = Field(default="active")
    
    # Metrics
    metrics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    center: Optional["DataStewardshipCenter"] = Relationship(back_populates="workflows")

# ============================================================================
# ANNOTATION MODELS
# ============================================================================

class AnnotationManager(SQLModel, table=True):
    """Annotation manager for data assets"""
    __tablename__ = "annotation_managers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Approval Process
    approval_process: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Search Configuration
    search_config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    annotation_types: List["AnnotationTypeConfig"] = Relationship(back_populates="manager")
    annotations: List["DataAnnotation"] = Relationship(back_populates="manager")

class AnnotationTypeConfig(SQLModel, table=True):
    """Annotation type configuration"""
    __tablename__ = "annotation_type_configs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    manager_id: int = Field(foreign_key="annotation_managers.id", index=True)
    
    # Type Details
    type_name: str = Field(index=True)
    display_name: str
    description: Optional[str] = None
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Validation Rules
    validation_rules: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Permissions
    permissions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    manager: Optional["AnnotationManager"] = Relationship(back_populates="annotation_types")

class DataAnnotation(SQLModel, table=True):
    """Data asset annotations"""
    __tablename__ = "data_annotations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    manager_id: int = Field(foreign_key="annotation_managers.id", index=True)
    
    # Target Information
    target_id: str = Field(index=True)
    target_type: AnnotationTargetType = Field(default=AnnotationTargetType.ASSET)
    
    # Annotation Content
    title: Optional[str] = None
    content: str
    content_format: str = Field(default="markdown")
    
    # Author Information
    author_id: str = Field(index=True)
    author_name: str
    
    # Classification
    annotation_type: AnnotationType = Field(default=AnnotationType.COMMENT)
    category: Optional[str] = None
    tags: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Visibility & Access
    visibility: str = Field(default="public")
    permissions: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Lifecycle
    status: AnnotationStatus = Field(default=AnnotationStatus.DRAFT)
    approval_status: str = Field(default="pending")
    
    # Relationships
    parent_annotation_id: Optional[int] = Field(foreign_key="data_annotations.id")
    related_annotations: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Metrics
    views_count: int = Field(default=0)
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    approved_at: Optional[datetime] = None
    
    # Relationships
    manager: Optional["AnnotationManager"] = Relationship(back_populates="annotations")
    parent_annotation: Optional["DataAnnotation"] = Relationship(back_populates="child_annotations", sa_relationship_kwargs={"remote_side": "DataAnnotation.id"})
    child_annotations: List["DataAnnotation"] = Relationship(back_populates="parent_annotation")

# ============================================================================
# REVIEW WORKFLOW MODELS
# ============================================================================

class ReviewWorkflowEngine(SQLModel, table=True):
    """Review workflow engine for asset reviews"""
    __tablename__ = "review_workflow_engines"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Escalation Rules
    escalation_rules: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    review_types: List["ReviewTypeConfig"] = Relationship(back_populates="engine")
    active_reviews: List["AssetReview"] = Relationship(back_populates="engine")
    reviewers: List["Reviewer"] = Relationship(back_populates="engine")

class ReviewTypeConfig(SQLModel, table=True):
    """Review type configuration"""
    __tablename__ = "review_type_configs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    engine_id: int = Field(foreign_key="review_workflow_engines.id", index=True)
    
    # Type Details
    review_type: ReviewType = Field(default=ReviewType.QUALITY_REVIEW)
    name: str
    description: Optional[str] = None
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Workflow Steps
    workflow_steps: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Criteria
    criteria: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # SLAs
    sla_hours: int = Field(default=72)
    escalation_hours: int = Field(default=168)
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    engine: Optional["ReviewWorkflowEngine"] = Relationship(back_populates="review_types")

class AssetReview(SQLModel, table=True):
    """Asset review instances"""
    __tablename__ = "asset_reviews"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    engine_id: int = Field(foreign_key="review_workflow_engines.id", index=True)
    
    # Review Information
    asset_id: str = Field(index=True)
    review_type: ReviewType = Field(default=ReviewType.QUALITY_REVIEW)
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Requester
    requester_id: str = Field(index=True)
    requester_name: str
    
    # Review Content
    review_items: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    criteria: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Status & Progress
    status: ReviewStatus = Field(default=ReviewStatus.PENDING)
    progress: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Results
    results: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    decision: Optional[str] = None
    decision_rationale: Optional[str] = None
    
    # Timeline
    timeline: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # SLA Tracking
    due_date: Optional[datetime] = None
    escalation_date: Optional[datetime] = None
    
    # Metrics
    metrics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    
    # Relationships
    engine: Optional["ReviewWorkflowEngine"] = Relationship(back_populates="active_reviews")
    review_assignments: List["ReviewAssignment"] = Relationship(back_populates="review")
    comments: List["ReviewComment"] = Relationship(back_populates="review")

class Reviewer(SQLModel, table=True):
    """Reviewer details and capabilities"""
    __tablename__ = "reviewers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    engine_id: int = Field(foreign_key="review_workflow_engines.id", index=True)
    user_id: str = Field(index=True)
    name: str
    email: str
    
    # Expertise
    expertise_areas: List[str] = Field(default=None, sa_column=Column(JSON))
    review_types: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Availability
    availability: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    workload_limit: int = Field(default=10)
    
    # Performance
    performance: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    status: str = Field(default="active")
    
    # Timestamps
    joined_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    engine: Optional["ReviewWorkflowEngine"] = Relationship(back_populates="reviewers")
    assignments: List["ReviewAssignment"] = Relationship(back_populates="reviewer")

class ReviewAssignment(SQLModel, table=True):
    """Review assignments to reviewers"""
    __tablename__ = "review_assignments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: int = Field(foreign_key="asset_reviews.id", index=True)
    reviewer_id: int = Field(foreign_key="reviewers.id", index=True)
    
    # Assignment Details
    role: str = Field(default="reviewer")  # reviewer, approver, observer
    assignment_type: str = Field(default="manual")  # manual, automatic, escalated
    
    # Status
    status: str = Field(default="assigned")  # assigned, accepted, declined, completed
    
    # Progress
    progress: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timeline
    assigned_at: datetime = Field(default_factory=datetime.now)
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    
    # Relationships
    review: Optional["AssetReview"] = Relationship(back_populates="review_assignments")
    reviewer: Optional["Reviewer"] = Relationship(back_populates="assignments")

class ReviewComment(SQLModel, table=True):
    """Review comments and feedback"""
    __tablename__ = "review_comments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: int = Field(foreign_key="asset_reviews.id", index=True)
    author_id: str = Field(index=True)
    author_name: str
    
    # Comment Content
    content: str
    comment_type: str = Field(default="general")  # general, question, suggestion, issue
    
    # Context
    context: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Thread
    parent_comment_id: Optional[int] = Field(foreign_key="review_comments.id")
    
    # Status
    is_resolved: bool = Field(default=False)
    resolution: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    
    # Relationships
    review: Optional["AssetReview"] = Relationship(back_populates="comments")
    parent_comment: Optional["ReviewComment"] = Relationship(back_populates="replies", sa_relationship_kwargs={"remote_side": "ReviewComment.id"})
    replies: List["ReviewComment"] = Relationship(back_populates="parent_comment")

# ============================================================================
# COMMUNITY & CROWDSOURCING MODELS
# ============================================================================

class CrowdsourcingPlatform(SQLModel, table=True):
    """Crowdsourcing platform for community contributions"""
    __tablename__ = "crowdsourcing_platforms"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Quality Control
    quality_control: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Governance
    governance: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    campaigns: List["CrowdsourcingCampaign"] = Relationship(back_populates="platform")
    contributors: List["CommunityContributor"] = Relationship(back_populates="platform")
    contributions: List["CommunityContribution"] = Relationship(back_populates="platform")

class CrowdsourcingCampaign(SQLModel, table=True):
    """Crowdsourcing campaigns"""
    __tablename__ = "crowdsourcing_campaigns"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    platform_id: int = Field(foreign_key="crowdsourcing_platforms.id", index=True)
    name: str = Field(index=True)
    description: str
    
    # Campaign Details
    campaign_type: str = Field(default="annotation")
    goals: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Target Assets
    target_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    asset_criteria: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Incentives
    incentives: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Progress
    progress: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Timeline
    start_date: datetime = Field(default_factory=datetime.now)
    end_date: Optional[datetime] = None
    
    # Status
    status: str = Field(default="active")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    platform: Optional["CrowdsourcingPlatform"] = Relationship(back_populates="campaigns")

class CommunityContributor(SQLModel, table=True):
    """Community contributors"""
    __tablename__ = "community_contributors"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    platform_id: int = Field(foreign_key="crowdsourcing_platforms.id", index=True)
    user_id: str = Field(index=True)
    
    # Profile Information
    name: str
    email: str
    bio: Optional[str] = None
    
    # Reputation
    reputation_score: float = Field(default=0.0)
    trust_level: str = Field(default="novice")
    
    # Expertise
    expertise: List[str] = Field(default=None, sa_column=Column(JSON))
    expertise_level: ExpertiseLevel = Field(default=ExpertiseLevel.NOVICE)
    
    # Contribution Stats
    contribution_count: int = Field(default=0)
    quality_score: float = Field(default=0.0)
    
    # Rewards & Recognition
    rewards: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    badges: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Activity
    last_contribution: Optional[datetime] = None
    activity_level: str = Field(default="low")
    
    # Status
    status: str = Field(default="active")
    
    # Timestamps
    joined_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    platform: Optional["CrowdsourcingPlatform"] = Relationship(back_populates="contributors")
    contributions: List["CommunityContribution"] = Relationship(back_populates="contributor")

class CommunityContribution(SQLModel, table=True):
    """Community contributions"""
    __tablename__ = "community_contributions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    platform_id: int = Field(foreign_key="crowdsourcing_platforms.id", index=True)
    contributor_id: int = Field(foreign_key="community_contributors.id", index=True)
    
    # Contribution Details
    contribution_type: ContributionType = Field(default=ContributionType.ANNOTATION)
    title: str
    description: Optional[str] = None
    content: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Target
    target_asset_id: str = Field(index=True)
    target_context: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Quality
    quality_score: float = Field(default=0.0)
    validation_status: str = Field(default="pending")
    
    # Impact
    impact_score: float = Field(default=0.0)
    usage_count: int = Field(default=0)
    
    # Recognition
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    featured: bool = Field(default=False)
    
    # Status
    status: str = Field(default="submitted")
    
    # Timestamps
    submitted_at: datetime = Field(default_factory=datetime.now)
    reviewed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    
    # Relationships
    platform: Optional["CrowdsourcingPlatform"] = Relationship(back_populates="contributions")
    contributor: Optional["CommunityContributor"] = Relationship(back_populates="contributions")

# ============================================================================
# EXPERT NETWORKING MODELS
# ============================================================================

class ExpertNetworking(SQLModel, table=True):
    """Expert networking platform"""
    __tablename__ = "expert_networking"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Matching Algorithm
    matching_algorithm: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Quality Assurance
    quality_assurance: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    experts: List["DomainExpert"] = Relationship(back_populates="network")
    domains: List["ExpertiseDomain"] = Relationship(back_populates="network")
    consultation_requests: List["ConsultationRequest"] = Relationship(back_populates="network")

class ExpertiseDomain(SQLModel, table=True):
    """Expertise domains"""
    __tablename__ = "expertise_domains"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    network_id: int = Field(foreign_key="expert_networking.id", index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Domain Details
    category: str
    keywords: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    domain_metadata: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    network: Optional["ExpertNetworking"] = Relationship(back_populates="domains")

class DomainExpert(SQLModel, table=True):
    """Domain experts"""
    __tablename__ = "domain_experts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    network_id: int = Field(foreign_key="expert_networking.id", index=True)
    user_id: str = Field(index=True)
    
    # Expert Profile
    name: str
    email: str
    title: Optional[str] = None
    bio: Optional[str] = None
    
    # Expertise
    expertise_domains: List[str] = Field(default=None, sa_column=Column(JSON))
    expertise_level: ExpertiseLevel = Field(default=ExpertiseLevel.INTERMEDIATE)
    
    # Credentials
    credentials: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    certifications: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Availability
    availability: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Performance
    performance: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Reputation
    reputation_score: float = Field(default=0.0)
    consultation_count: int = Field(default=0)
    average_rating: float = Field(default=0.0)
    
    # Status
    status: str = Field(default="active")
    
    # Timestamps
    joined_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    network: Optional["ExpertNetworking"] = Relationship(back_populates="experts")
    consultations: List["ConsultationRequest"] = Relationship(back_populates="expert")

class ConsultationRequest(SQLModel, table=True):
    """Expert consultation requests"""
    __tablename__ = "consultation_requests"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    network_id: int = Field(foreign_key="expert_networking.id", index=True)
    requester_id: str = Field(index=True)
    expert_id: Optional[int] = Field(foreign_key="domain_experts.id", index=True)
    
    # Request Details
    topic: str
    description: str
    urgency: str = Field(default="medium")
    
    # Context
    context: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    related_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    status: str = Field(default="requested")
    
    # Outcome
    outcome: Optional[str] = None
    feedback: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    rating: Optional[float] = None
    
    # Timeline
    requested_at: datetime = Field(default_factory=datetime.now)
    matched_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Relationships
    network: Optional["ExpertNetworking"] = Relationship(back_populates="consultation_requests")
    expert: Optional["DomainExpert"] = Relationship(back_populates="consultations")

# ============================================================================
# KNOWLEDGE BASE MODELS
# ============================================================================

class KnowledgeBase(SQLModel, table=True):
    """Knowledge base for collaborative learning"""
    __tablename__ = "knowledge_bases"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Search Configuration
    search_config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Collaboration
    collaboration: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Quality Control
    quality_control: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    categories: List["KnowledgeCategory"] = Relationship(back_populates="knowledge_base")
    articles: List["KnowledgeArticle"] = Relationship(back_populates="knowledge_base")

class KnowledgeCategory(SQLModel, table=True):
    """Knowledge categories"""
    __tablename__ = "knowledge_categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    knowledge_base_id: int = Field(foreign_key="knowledge_bases.id", index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Hierarchy
    parent_category_id: Optional[int] = Field(foreign_key="knowledge_categories.id")
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    knowledge_base: Optional["KnowledgeBase"] = Relationship(back_populates="categories")
    parent_category: Optional["KnowledgeCategory"] = Relationship(back_populates="subcategories", sa_relationship_kwargs={"remote_side": "KnowledgeCategory.id"})
    subcategories: List["KnowledgeCategory"] = Relationship(back_populates="parent_category")

class KnowledgeArticle(SQLModel, table=True):
    """Knowledge articles"""
    __tablename__ = "knowledge_articles"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    knowledge_base_id: int = Field(foreign_key="knowledge_bases.id", index=True)
    title: str = Field(index=True)
    content: str
    
    # Metadata
    summary: Optional[str] = None
    keywords: List[str] = Field(default=None, sa_column=Column(JSON))
    tags: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Authors & Contributors
    authors: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    contributors: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Related Content
    related_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    related_articles: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Lifecycle
    status: str = Field(default="draft")
    version: str = Field(default="1.0")
    
    # Quality & Approval
    quality_score: float = Field(default=0.0)
    approval_status: str = Field(default="pending")
    
    # Usage & Feedback
    view_count: int = Field(default=0)
    like_count: int = Field(default=0)
    share_count: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    published_at: Optional[datetime] = None
    
    # Relationships
    knowledge_base: Optional["KnowledgeBase"] = Relationship(back_populates="articles")

# ============================================================================
# COMMUNITY FORUM MODELS
# ============================================================================

class CommunityForum(SQLModel, table=True):
    """Community forum for discussions"""
    __tablename__ = "community_forums"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Moderation
    moderation: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Analytics
    analytics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Gamification
    gamification: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    categories: List["ForumCategory"] = Relationship(back_populates="forum")
    discussions: List["ForumDiscussion"] = Relationship(back_populates="forum")
    members: List["ForumMember"] = Relationship(back_populates="forum")

class ForumCategory(SQLModel, table=True):
    """Forum categories"""
    __tablename__ = "forum_categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    forum_id: int = Field(foreign_key="community_forums.id", index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Configuration
    config: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    forum: Optional["CommunityForum"] = Relationship(back_populates="categories")

class ForumDiscussion(SQLModel, table=True):
    """Forum discussions"""
    __tablename__ = "forum_discussions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    forum_id: int = Field(foreign_key="community_forums.id", index=True)
    title: str = Field(index=True)
    content: str
    author_id: str = Field(index=True)
    
    # Discussion Details
    discussion_type: str = Field(default="general")
    priority: str = Field(default="medium")
    
    # Status
    status: str = Field(default="open")
    is_pinned: bool = Field(default=False)
    is_locked: bool = Field(default=False)
    
    # Engagement
    view_count: int = Field(default=0)
    reply_count: int = Field(default=0)
    like_count: int = Field(default=0)
    
    # Related Content
    related_assets: List[str] = Field(default=None, sa_column=Column(JSON))
    tags: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    forum: Optional["CommunityForum"] = Relationship(back_populates="discussions")

class ForumMember(SQLModel, table=True):
    """Forum members"""
    __tablename__ = "forum_members"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    forum_id: int = Field(foreign_key="community_forums.id", index=True)
    user_id: str = Field(index=True)
    name: str
    
    # Member Details
    role: str = Field(default="member")
    reputation: int = Field(default=0)
    
    # Activity
    post_count: int = Field(default=0)
    like_count: int = Field(default=0)
    
    # Status
    status: str = Field(default="active")
    
    # Timestamps
    joined_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    forum: Optional["CommunityForum"] = Relationship(back_populates="members")