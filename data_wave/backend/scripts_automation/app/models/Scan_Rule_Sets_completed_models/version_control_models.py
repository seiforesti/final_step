"""
Version Control Models for Scan Rule Sets

Advanced version control models for enterprise-grade rule version management.
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import uuid
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint

# ===================================
# ENUMS
# ===================================

class VersionStatus(str, Enum):
    """Version status types."""
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"

class ChangeType(str, Enum):
    """Types of changes in versions."""
    MAJOR = "major"
    MINOR = "minor"
    PATCH = "patch"
    HOTFIX = "hotfix"

class MergeStatus(str, Enum):
    """Merge request status."""
    OPEN = "open"
    MERGED = "merged"
    CLOSED = "closed"
    REJECTED = "rejected"

class ConflictResolution(str, Enum):
    """Conflict resolution strategies."""
    MANUAL = "manual"
    AUTO_MERGE = "auto_merge"
    KEEP_SOURCE = "keep_source"
    KEEP_TARGET = "keep_target"

# ===================================
# VERSION CONTROL MODELS
# ===================================

class RuleVersion(SQLModel, table=True):
    """Advanced rule version management with Git-like functionality."""
    __tablename__ = "rule_versions"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)  # Reference to the scan rule
    
    # Version Information
    version_number: str = Field(max_length=50, index=True)  # e.g., "1.2.3", "1.2.3-beta.1"
    version_name: Optional[str] = Field(default=None, max_length=200)
    major_version: int = Field(ge=0)
    minor_version: int = Field(ge=0)
    patch_version: int = Field(ge=0)
    pre_release: Optional[str] = Field(default=None, max_length=50)
    
    # Version Content
    rule_definition: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    rule_logic: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    parameters: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    metadata: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Change Information
    change_type: ChangeType = Field(default=ChangeType.MINOR)
    change_summary: str = Field(max_length=1000)
    detailed_changes: List[str] = Field(default=None, sa_column=Column(JSON))
    breaking_changes: List[str] = Field(default=None, sa_column=Column(JSON))
    migration_notes: Optional[Text] = Field(default=None)
    
    # Version Relationships
    parent_version_id: Optional[str] = Field(default=None, foreign_key="rule_versions.version_id")
    base_version_id: Optional[str] = Field(default=None)  # For branches
    merged_from_version_id: Optional[str] = Field(default=None)
    
    # Branch Information
    branch_name: str = Field(default="main", max_length=100, index=True)
    is_branch_head: bool = Field(default=False)
    is_main_branch: bool = Field(default=True)
    
    # Version Status
    status: VersionStatus = Field(default=VersionStatus.DRAFT, index=True)
    is_current: bool = Field(default=False)
    is_stable: bool = Field(default=False)
    is_rollback_point: bool = Field(default=False)
    
    # Lifecycle Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: str = Field(max_length=100)
    activated_at: Optional[datetime] = Field(default=None)
    activated_by: Optional[str] = Field(default=None, max_length=100)
    deprecated_at: Optional[datetime] = Field(default=None)
    
    # Performance and Quality
    validation_status: str = Field(default="pending", max_length=50)
    test_results: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    performance_metrics: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    quality_score: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Approval and Review
    review_status: str = Field(default="pending", max_length=50)
    reviewed_by: List[str] = Field(default=None, sa_column=Column(JSON))
    approved_by: Optional[str] = Field(default=None, max_length=100)
    approved_at: Optional[datetime] = Field(default=None)
    approval_notes: Optional[str] = Field(default=None, max_length=2000)
    
    # Deployment Information
    deployment_environments: List[str] = Field(default=None, sa_column=Column(JSON))
    deployment_status: Dict[str, str] = Field(default=None, sa_column=Column(JSON))
    rollback_plan: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Usage Tracking
    usage_count: int = Field(default=0, ge=0)
    active_deployments: int = Field(default=0, ge=0)
    last_used_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    parent_version: Optional["RuleVersion"] = Relationship(back_populates="child_versions")
    child_versions: List["RuleVersion"] = Relationship(back_populates="parent_version")
    history_entries: List["RuleHistory"] = Relationship(back_populates="version")
    merge_requests_source: List["RuleMergeRequest"] = Relationship(back_populates="source_version", foreign_keys="RuleMergeRequest.source_version_id")
    merge_requests_target: List["RuleMergeRequest"] = Relationship(back_populates="target_version", foreign_keys="RuleMergeRequest.target_version_id")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_version_rule_number", "rule_id", "version_number"),
        Index("idx_version_branch", "rule_id", "branch_name"),
        Index("idx_version_status", "status"),
        Index("idx_version_current", "rule_id", "is_current"),
        UniqueConstraint("rule_id", "version_number", name="uq_rule_version_number"),
    )

class RuleHistory(SQLModel, table=True):
    """Comprehensive history tracking for rule changes."""
    __tablename__ = "rule_history"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    history_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)
    version_id: str = Field(foreign_key="rule_versions.version_id", index=True)
    
    # Action Information
    action_type: str = Field(max_length=50, index=True)  # create, update, delete, activate, deprecate, etc.
    action_description: str = Field(max_length=1000)
    action_category: str = Field(max_length=100)  # configuration, content, metadata, deployment
    
    # Change Details
    changes_made: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    field_changes: Dict[str, Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))  # field -> {old, new}
    impact_assessment: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Context Information
    triggered_by: str = Field(max_length=100, index=True)
    trigger_context: str = Field(max_length=200)  # user_action, automated_process, api_call, etc.
    session_id: Optional[str] = Field(default=None, max_length=100)
    request_id: Optional[str] = Field(default=None, max_length=100)
    
    # System Information
    system_version: Optional[str] = Field(default=None, max_length=50)
    client_info: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    environment: str = Field(default="production", max_length=50)
    
    # State Snapshots
    before_state: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    after_state: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    state_diff: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Compliance and Audit
    compliance_impact: Optional[str] = Field(default=None, max_length=500)
    audit_trail: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    retention_period_days: Optional[int] = Field(default=None, ge=0)
    
    # Performance Impact
    performance_impact: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    resource_changes: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Timing Information
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    duration_seconds: Optional[float] = Field(default=None, ge=0)
    
    # Rollback Information
    is_rollback: bool = Field(default=False)
    rollback_target_version_id: Optional[str] = Field(default=None)
    rollback_reason: Optional[str] = Field(default=None, max_length=1000)
    
    # Relationships
    version: RuleVersion = Relationship(back_populates="history_entries")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_history_rule_timestamp", "rule_id", "timestamp"),
        Index("idx_history_action_type", "action_type"),
        Index("idx_history_triggered_by", "triggered_by"),
        Index("idx_history_rollback", "is_rollback"),
    )

class RuleBranch(SQLModel, table=True):
    """Branch management for rule development workflows."""
    __tablename__ = "rule_branches"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    branch_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)
    
    # Branch Information
    branch_name: str = Field(max_length=100, index=True)
    branch_description: Optional[str] = Field(default=None, max_length=1000)
    branch_type: str = Field(max_length=50)  # feature, hotfix, release, experimental
    
    # Branch Relationships
    parent_branch_name: str = Field(default="main", max_length=100)
    base_version_id: str = Field(index=True)  # Version this branch was created from
    head_version_id: Optional[str] = Field(default=None)  # Current latest version in this branch
    
    # Branch Status
    is_active: bool = Field(default=True)
    is_protected: bool = Field(default=False)
    is_merged: bool = Field(default=False)
    is_deleted: bool = Field(default=False)
    
    # Branch Metadata
    purpose: Optional[str] = Field(default=None, max_length=500)
    target_release: Optional[str] = Field(default=None, max_length=100)
    priority: str = Field(default="medium", max_length=50)
    
    # Collaboration
    owner: str = Field(max_length=100)
    collaborators: List[str] = Field(default=None, sa_column=Column(JSON))
    reviewers: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Branch Rules
    merge_requirements: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    auto_merge_enabled: bool = Field(default=False)
    require_reviews: bool = Field(default=True)
    min_reviewers: int = Field(default=1, ge=0)
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    merged_at: Optional[datetime] = Field(default=None)
    merged_by: Optional[str] = Field(default=None, max_length=100)
    deleted_at: Optional[datetime] = Field(default=None)
    
    # Statistics
    commit_count: int = Field(default=0, ge=0)
    ahead_by: int = Field(default=0, ge=0)  # Commits ahead of parent
    behind_by: int = Field(default=0, ge=0)  # Commits behind parent
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_branch_rule_name", "rule_id", "branch_name"),
        Index("idx_branch_active", "is_active"),
        Index("idx_branch_merged", "is_merged"),
        UniqueConstraint("rule_id", "branch_name", name="uq_rule_branch_name"),
    )

class RuleMergeRequest(SQLModel, table=True):
    """Merge request management for rule version control."""
    __tablename__ = "rule_merge_requests"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    merge_request_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)
    
    # Merge Request Details
    title: str = Field(max_length=200)
    description: Optional[Text] = Field(default=None)
    merge_type: str = Field(default="standard", max_length=50)  # standard, fast_forward, squash
    
    # Source and Target
    source_version_id: str = Field(foreign_key="rule_versions.version_id", index=True)
    target_version_id: str = Field(foreign_key="rule_versions.version_id", index=True)
    source_branch: str = Field(max_length=100)
    target_branch: str = Field(max_length=100)
    
    # Merge Status
    status: MergeStatus = Field(default=MergeStatus.OPEN, index=True)
    is_draft: bool = Field(default=False)
    is_auto_merge: bool = Field(default=False)
    merge_when_ready: bool = Field(default=False)
    
    # Conflict Management
    has_conflicts: bool = Field(default=False)
    conflict_details: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    conflict_resolution: Optional[ConflictResolution] = Field(default=None)
    resolved_conflicts: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Review Process
    reviewers: List[str] = Field(default=None, sa_column=Column(JSON))
    required_reviewers: List[str] = Field(default=None, sa_column=Column(JSON))
    approved_by: List[str] = Field(default=None, sa_column=Column(JSON))
    rejected_by: List[str] = Field(default=None, sa_column=Column(JSON))
    review_comments: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Validation and Testing
    validation_status: str = Field(default="pending", max_length=50)
    test_results: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    ci_status: str = Field(default="pending", max_length=50)
    quality_checks: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Impact Analysis
    impact_analysis: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    breaking_changes: List[str] = Field(default=None, sa_column=Column(JSON))
    migration_required: bool = Field(default=False)
    rollback_plan: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    merged_at: Optional[datetime] = Field(default=None)
    merged_by: Optional[str] = Field(default=None, max_length=100)
    closed_at: Optional[datetime] = Field(default=None)
    
    # Automation
    auto_merge_criteria: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    auto_merge_scheduled_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    source_version: RuleVersion = Relationship(back_populates="merge_requests_source", foreign_keys=[source_version_id])
    target_version: RuleVersion = Relationship(back_populates="merge_requests_target", foreign_keys=[target_version_id])
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_merge_request_rule", "rule_id"),
        Index("idx_merge_request_status", "status"),
        Index("idx_merge_request_conflicts", "has_conflicts"),
        Index("idx_merge_request_created", "created_at"),
    )

class RuleComparison(SQLModel, table=True):
    """Store version comparison results for performance optimization."""
    __tablename__ = "rule_comparisons"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    comparison_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Comparison Details
    source_version_id: str = Field(index=True)
    target_version_id: str = Field(index=True)
    comparison_type: str = Field(max_length=50)  # diff, merge_preview, impact_analysis
    
    # Comparison Results
    differences: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    similarity_score: Optional[float] = Field(default=None, ge=0, le=100)
    change_summary: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Impact Analysis
    impact_assessment: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    compatibility_analysis: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    migration_complexity: Optional[str] = Field(default=None, max_length=50)
    
    # Comparison Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    computation_time_ms: Optional[float] = Field(default=None, ge=0)
    
    # Cache Management
    is_cached: bool = Field(default=True)
    cache_expires_at: Optional[datetime] = Field(default=None)
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_comparison_versions", "source_version_id", "target_version_id"),
        Index("idx_comparison_type", "comparison_type"),
        Index("idx_comparison_cached", "is_cached", "cache_expires_at"),
    )

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class VersionCreateRequest(BaseModel):
    """Request model for creating new versions."""
    rule_id: int
    change_type: ChangeType = ChangeType.MINOR
    change_summary: str
    detailed_changes: Optional[List[str]] = None
    breaking_changes: Optional[List[str]] = None
    branch_name: str = "main"
    parent_version_id: Optional[str] = None
    rule_definition: Dict[str, Any]
    rule_logic: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('change_summary')
    def validate_change_summary(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Change summary cannot be empty")
        return v.strip()

class BranchCreateRequest(BaseModel):
    """Request model for creating branches."""
    rule_id: int
    branch_name: str
    branch_description: Optional[str] = None
    branch_type: str = "feature"
    parent_branch_name: str = "main"
    base_version_id: str
    purpose: Optional[str] = None
    
    @validator('branch_name')
    def validate_branch_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Branch name cannot be empty")
        # Additional validation for branch name format
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("Branch name can only contain letters, numbers, underscores, and hyphens")
        return v.strip()

class MergeRequestCreateRequest(BaseModel):
    """Request model for creating merge requests."""
    rule_id: int
    title: str
    description: Optional[str] = None
    source_version_id: str
    target_version_id: str
    source_branch: str
    target_branch: str
    merge_type: str = "standard"
    reviewers: Optional[List[str]] = None
    auto_merge_enabled: bool = False
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Merge request title cannot be empty")
        return v.strip()

class VersionResponse(BaseModel):
    """Response model for version operations."""
    version_id: str
    rule_id: int
    version_number: str
    version_name: Optional[str]
    change_type: ChangeType
    change_summary: str
    branch_name: str
    status: VersionStatus
    is_current: bool
    created_at: datetime
    created_by: str
    usage_count: int
    
class BranchResponse(BaseModel):
    """Response model for branch operations."""
    branch_id: str
    rule_id: int
    branch_name: str
    branch_description: Optional[str]
    branch_type: str
    is_active: bool
    is_merged: bool
    commit_count: int
    ahead_by: int
    behind_by: int
    created_at: datetime
    owner: str
    
class MergeRequestResponse(BaseModel):
    """Response model for merge request operations."""
    merge_request_id: str
    rule_id: int
    title: str
    source_branch: str
    target_branch: str
    status: MergeStatus
    has_conflicts: bool
    created_at: datetime
    created_by: str
    approved_by: List[str]
    review_status: str