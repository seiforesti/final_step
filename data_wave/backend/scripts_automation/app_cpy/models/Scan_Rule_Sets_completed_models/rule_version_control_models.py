"""
Advanced Rule Version Control Models for Scan-Rule-Sets Group
===========================================================

Enterprise-grade version control system for scan rules with Git-like functionality:
- Rule versioning with semantic versioning
- Branch and merge management
- Change tracking and diff analysis
- Conflict resolution and merge strategies
- Version comparison and rollback
- Collaborative development workflows
- Change approval and release management

Production Features:
- Distributed version control
- Advanced branching strategies
- Automated conflict detection and resolution
- Version analytics and insights
- Integration with CI/CD pipelines
- Audit trails and compliance tracking
"""

from typing import List, Dict, Any, Optional, Union, Tuple
from datetime import datetime
from enum import Enum
import uuid

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from pydantic import BaseModel, validator

# ===================== ENUMS AND TYPES =====================

class VersionType(str, Enum):
    """Version type classifications"""
    MAJOR = "major"                    # Breaking changes
    MINOR = "minor"                    # New features
    PATCH = "patch"                    # Bug fixes
    HOTFIX = "hotfix"                  # Critical fixes
    PRERELEASE = "prerelease"          # Pre-release versions
    BUILD = "build"                    # Build metadata

class BranchType(str, Enum):
    """Branch type classifications"""
    MAIN = "main"                      # Main/master branch
    DEVELOP = "develop"                # Development branch
    FEATURE = "feature"                # Feature branches
    RELEASE = "release"                # Release branches
    HOTFIX = "hotfix"                  # Hotfix branches
    EXPERIMENTAL = "experimental"      # Experimental branches
    PERSONAL = "personal"              # Personal branches

class ChangeType(str, Enum):
    """Change type classifications"""
    CREATE = "create"                  # New rule creation
    UPDATE = "update"                  # Rule modification
    DELETE = "delete"                  # Rule deletion
    RENAME = "rename"                  # Rule renaming
    MOVE = "move"                      # Rule reorganization
    MERGE = "merge"                    # Branch merge
    REVERT = "revert"                  # Change reversion
    ROLLBACK = "rollback"              # Version rollback

class MergeStrategy(str, Enum):
    """Merge strategy types"""
    MERGE = "merge"                    # Standard merge
    REBASE = "rebase"                  # Rebase and merge
    SQUASH = "squash"                  # Squash and merge
    FAST_FORWARD = "fast_forward"      # Fast-forward merge
    CHERRY_PICK = "cherry_pick"        # Cherry-pick merge

class ConflictResolutionStrategy(str, Enum):
    """Conflict resolution strategies"""
    MANUAL = "manual"                  # Manual resolution
    ACCEPT_CURRENT = "accept_current"  # Accept current version
    ACCEPT_INCOMING = "accept_incoming" # Accept incoming changes
    AUTO_MERGE = "auto_merge"          # Automatic merge
    AI_ASSISTED = "ai_assisted"        # AI-assisted resolution

class ApprovalStatus(str, Enum):
    """Change approval status"""
    PENDING = "pending"                # Awaiting approval
    APPROVED = "approved"              # Approved for merge
    REJECTED = "rejected"              # Rejected changes
    REQUIRES_CHANGES = "requires_changes" # Needs modifications
    AUTO_APPROVED = "auto_approved"    # Automatically approved

# ===================== CORE VERSION CONTROL MODELS =====================

class RuleVersion(SQLModel, table=True):
    """
    Core rule version model with comprehensive version tracking.
    Supports semantic versioning, change history, and Git-like operations.
    """
    __tablename__ = "rule_versions"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: str = Field(index=True, unique=True, description="Unique version identifier")
    rule_id: str = Field(index=True, description="Associated rule identifier")
    
    # Version information
    version_number: str = Field(index=True, max_length=50, description="Semantic version number")
    version_type: VersionType = Field(index=True, description="Version type")
    is_current: bool = Field(default=False, index=True, description="Current active version")
    is_stable: bool = Field(default=False, index=True, description="Stable release version")
    is_draft: bool = Field(default=True, index=True, description="Draft version")
    
    # Version content
    rule_content: Dict[str, Any] = Field(sa_column=Column(JSON), description="Rule definition")
    rule_metadata: Dict[str, Any] = Field(sa_column=Column(JSON), description="Rule metadata")
    configuration: Dict[str, Any] = Field(sa_column=Column(JSON), description="Rule configuration")
    dependencies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Change information
    change_summary: str = Field(max_length=500, description="Summary of changes")
    change_description: Optional[str] = Field(sa_column=Column(Text), description="Detailed change description")
    change_type: ChangeType = Field(index=True, description="Type of change")
    breaking_changes: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    migration_notes: Optional[str] = Field(sa_column=Column(Text), description="Migration instructions")
    
    # Version relationships
    parent_version_id: Optional[str] = Field(index=True, description="Parent version")
    base_version_id: Optional[str] = Field(index=True, description="Base version for merge")
    merged_from_versions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Branch information
    branch_id: str = Field(foreign_key="rule_branches.branch_id", index=True)
    commit_hash: str = Field(index=True, max_length=64, description="Unique commit hash")
    tree_hash: str = Field(max_length=64, description="Content tree hash")
    
    # Performance and quality metrics
    performance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    test_coverage: float = Field(default=0.0, ge=0.0, le=1.0)
    complexity_score: float = Field(default=0.0, ge=0.0)
    
    # Validation and testing
    validation_status: str = Field(default="pending", max_length=50)
    test_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_errors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    security_scan_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Approval and release
    approval_status: ApprovalStatus = Field(default=ApprovalStatus.PENDING, index=True)
    approved_by: Optional[str] = Field(max_length=255)
    approved_at: Optional[datetime] = None
    release_notes: Optional[str] = Field(sa_column=Column(Text))
    
    # Tags and labels
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    labels: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    committed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    released_at: Optional[datetime] = None
    
    # User tracking
    author: str = Field(max_length=255, index=True, description="Change author")
    committer: Optional[str] = Field(max_length=255, description="Change committer")
    reviewer: Optional[str] = Field(max_length=255, description="Code reviewer")
    
    # Relationships
    branch: Optional["RuleBranch"] = Relationship(back_populates="versions")
    changes: List["RuleChange"] = Relationship(back_populates="version")
    comparisons: List["VersionComparison"] = Relationship(back_populates="version")
    
    # Table constraints
    __table_args__ = (
        Index("idx_version_rule_number", "rule_id", "version_number"),
        Index("idx_version_branch_current", "branch_id", "is_current"),
        Index("idx_version_type_stable", "version_type", "is_stable"),
        Index("idx_version_commit_hash", "commit_hash"),
        UniqueConstraint("version_id", name="uq_rule_version_id"),
        UniqueConstraint("rule_id", "version_number", name="uq_rule_version_number"),
        UniqueConstraint("commit_hash", name="uq_commit_hash"),
    )

class RuleBranch(SQLModel, table=True):
    """
    Rule branch management with Git-like branching functionality.
    Supports feature branches, merge management, and branch policies.
    """
    __tablename__ = "rule_branches"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    branch_id: str = Field(index=True, unique=True, description="Unique branch identifier")
    rule_id: str = Field(index=True, description="Associated rule identifier")
    
    # Branch information
    branch_name: str = Field(index=True, max_length=255, description="Branch name")
    branch_type: BranchType = Field(index=True, description="Branch type")
    display_name: Optional[str] = Field(max_length=255, description="Human-readable name")
    description: Optional[str] = Field(sa_column=Column(Text), description="Branch description")
    
    # Branch hierarchy
    parent_branch_id: Optional[str] = Field(index=True, description="Parent branch")
    base_branch_id: Optional[str] = Field(index=True, description="Base branch for merge")
    protected: bool = Field(default=False, index=True, description="Protected branch")
    default_branch: bool = Field(default=False, index=True, description="Default branch")
    
    # Branch status
    is_active: bool = Field(default=True, index=True)
    is_merged: bool = Field(default=False, index=True)
    is_deleted: bool = Field(default=False, index=True)
    merge_strategy: Optional[MergeStrategy] = Field(description="Preferred merge strategy")
    
    # Head and tracking
    head_version_id: Optional[str] = Field(index=True, description="Current head version")
    tracking_branch_id: Optional[str] = Field(index=True, description="Tracking remote branch")
    commits_ahead: int = Field(default=0, ge=0, description="Commits ahead of base")
    commits_behind: int = Field(default=0, ge=0, description="Commits behind base")
    
    # Branch policies and rules
    require_review: bool = Field(default=True, description="Require code review")
    require_tests: bool = Field(default=True, description="Require passing tests")
    require_approval: bool = Field(default=True, description="Require approval")
    min_reviewers: int = Field(default=1, ge=0, description="Minimum reviewers required")
    
    # Branch metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    labels: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    custom_properties: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Branch analytics
    commit_count: int = Field(default=0, ge=0, description="Total commits")
    contributor_count: int = Field(default=0, ge=0, description="Number of contributors")
    activity_score: float = Field(default=0.0, ge=0.0, description="Branch activity score")
    last_activity: Optional[datetime] = Field(description="Last activity timestamp")
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    merged_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    
    # User tracking
    created_by: str = Field(max_length=255, index=True)
    owner: str = Field(max_length=255, index=True, description="Branch owner")
    last_committer: Optional[str] = Field(max_length=255)
    
    # Relationships
    versions: List[RuleVersion] = Relationship(back_populates="branch")
    merge_requests: List["MergeRequest"] = Relationship(back_populates="source_branch")
    
    # Table constraints
    __table_args__ = (
        Index("idx_branch_rule_name", "rule_id", "branch_name"),
        Index("idx_branch_type_active", "branch_type", "is_active"),
        Index("idx_branch_parent", "parent_branch_id"),
        UniqueConstraint("branch_id", name="uq_rule_branch_id"),
        UniqueConstraint("rule_id", "branch_name", name="uq_rule_branch_name"),
    )

class RuleChange(SQLModel, table=True):
    """
    Detailed change tracking with diff analysis.
    Records all modifications with comprehensive change metadata.
    """
    __tablename__ = "rule_changes"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    change_id: str = Field(index=True, unique=True, description="Unique change identifier")
    version_id: str = Field(foreign_key="rule_versions.version_id", index=True)
    
    # Change details
    change_type: ChangeType = Field(index=True, description="Type of change")
    change_scope: str = Field(max_length=100, description="Scope of change")
    file_path: Optional[str] = Field(max_length=500, description="File path for change")
    line_number: Optional[int] = Field(ge=0, description="Line number for change")
    
    # Change content
    old_content: Optional[str] = Field(sa_column=Column(Text), description="Original content")
    new_content: Optional[str] = Field(sa_column=Column(Text), description="Modified content")
    diff_content: Optional[str] = Field(sa_column=Column(Text), description="Diff representation")
    patch_content: Optional[str] = Field(sa_column=Column(Text), description="Patch content")
    
    # Change metadata
    change_summary: str = Field(max_length=200, description="Brief change summary")
    change_reason: Optional[str] = Field(max_length=500, description="Reason for change")
    impact_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Change metrics
    lines_added: int = Field(default=0, ge=0, description="Lines added")
    lines_removed: int = Field(default=0, ge=0, description="Lines removed")
    lines_modified: int = Field(default=0, ge=0, description="Lines modified")
    complexity_change: float = Field(default=0.0, description="Complexity delta")
    
    # Validation and testing
    validation_status: str = Field(default="pending", max_length=50)
    test_impact: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    breaking_change: bool = Field(default=False, index=True)
    requires_migration: bool = Field(default=False, description="Requires data migration")
    
    # Review and approval
    reviewed: bool = Field(default=False, index=True)
    reviewed_by: Optional[str] = Field(max_length=255)
    reviewed_at: Optional[datetime] = None
    review_comments: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    applied_at: Optional[datetime] = None
    
    # User tracking
    author: str = Field(max_length=255, index=True)
    
    # Relationships
    version: Optional[RuleVersion] = Relationship(back_populates="changes")
    
    # Table constraints
    __table_args__ = (
        Index("idx_change_version_type", "version_id", "change_type"),
        Index("idx_change_breaking", "breaking_change"),
        Index("idx_change_reviewed", "reviewed"),
        UniqueConstraint("change_id", name="uq_rule_change_id"),
    )

class MergeRequest(SQLModel, table=True):
    """
    Merge request management with review workflows.
    Supports pull request-like functionality with approvals and discussions.
    """
    __tablename__ = "merge_requests"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    merge_request_id: str = Field(index=True, unique=True, description="Unique merge request ID")
    
    # Merge request details
    title: str = Field(max_length=255, description="Merge request title")
    description: Optional[str] = Field(sa_column=Column(Text), description="Detailed description")
    
    # Branch information
    source_branch_id: str = Field(foreign_key="rule_branches.branch_id", index=True)
    target_branch_id: str = Field(index=True, description="Target branch")
    
    # Merge strategy and options
    merge_strategy: MergeStrategy = Field(default=MergeStrategy.MERGE)
    squash_commits: bool = Field(default=False, description="Squash commits on merge")
    delete_source_branch: bool = Field(default=False, description="Delete source branch after merge")
    
    # Status and approval
    status: str = Field(default="open", max_length=50, index=True)  # open, merged, closed, draft
    approval_status: ApprovalStatus = Field(default=ApprovalStatus.PENDING, index=True)
    required_approvals: int = Field(default=1, ge=0)
    current_approvals: int = Field(default=0, ge=0)
    
    # Review and validation
    has_conflicts: bool = Field(default=False, index=True)
    conflicts_resolved: bool = Field(default=False)
    tests_passing: bool = Field(default=False, index=True)
    validation_passed: bool = Field(default=False, index=True)
    
    # Merge information
    merged: bool = Field(default=False, index=True)
    merged_at: Optional[datetime] = None
    merged_by: Optional[str] = Field(max_length=255)
    merge_commit_id: Optional[str] = Field(max_length=64)
    
    # Analytics and metrics
    commits_count: int = Field(default=0, ge=0)
    files_changed: int = Field(default=0, ge=0)
    lines_added: int = Field(default=0, ge=0)
    lines_removed: int = Field(default=0, ge=0)
    
    # Labels and tags
    labels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    milestone: Optional[str] = Field(max_length=100)
    priority: str = Field(default="medium", max_length=20)
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    closed_at: Optional[datetime] = None
    
    # User tracking
    created_by: str = Field(max_length=255, index=True)
    assigned_to: Optional[str] = Field(max_length=255)
    reviewers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    source_branch: Optional[RuleBranch] = Relationship(back_populates="merge_requests")
    reviews: List["MergeRequestReview"] = Relationship(back_populates="merge_request")
    
    # Table constraints
    __table_args__ = (
        Index("idx_merge_request_branches", "source_branch_id", "target_branch_id"),
        Index("idx_merge_request_status", "status", "approval_status"),
        Index("idx_merge_request_merged", "merged", "merged_at"),
        UniqueConstraint("merge_request_id", name="uq_merge_request_id"),
    )

class MergeRequestReview(SQLModel, table=True):
    """
    Merge request review system with detailed feedback.
    Supports code review workflows with comments and approvals.
    """
    __tablename__ = "merge_request_reviews"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: str = Field(index=True, unique=True, description="Unique review identifier")
    merge_request_id: str = Field(foreign_key="merge_requests.merge_request_id", index=True)
    
    # Review details
    review_type: str = Field(max_length=50, index=True)  # approve, request_changes, comment
    overall_decision: str = Field(max_length=50)  # approve, reject, conditional
    summary: Optional[str] = Field(max_length=500, description="Review summary")
    
    # Review content
    comments: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    suggestions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    issues_found: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Review metrics
    code_quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    security_score: float = Field(default=0.0, ge=0.0, le=1.0)
    performance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    maintainability_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Review status
    completed: bool = Field(default=False, index=True)
    submitted: bool = Field(default=False, index=True)
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    submitted_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # User tracking
    reviewer: str = Field(max_length=255, index=True)
    
    # Relationships
    merge_request: Optional[MergeRequest] = Relationship(back_populates="reviews")
    
    # Table constraints
    __table_args__ = (
        Index("idx_review_merge_request", "merge_request_id", "reviewer"),
        Index("idx_review_type_decision", "review_type", "overall_decision"),
        UniqueConstraint("review_id", name="uq_merge_request_review_id"),
    )

class VersionComparison(SQLModel, table=True):
    """
    Version comparison and diff analysis.
    Provides detailed comparison between rule versions.
    """
    __tablename__ = "version_comparisons"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    comparison_id: str = Field(index=True, unique=True, description="Unique comparison ID")
    version_id: str = Field(foreign_key="rule_versions.version_id", index=True)
    
    # Comparison details
    compared_with_version_id: str = Field(index=True, description="Version being compared against")
    comparison_type: str = Field(max_length=50)  # diff, merge_preview, impact_analysis
    
    # Comparison results
    differences_summary: Dict[str, Any] = Field(sa_column=Column(JSON), description="Summary of differences")
    detailed_diff: Dict[str, Any] = Field(sa_column=Column(JSON), description="Detailed diff analysis")
    impact_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compatibility_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Comparison metrics
    similarity_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Similarity percentage")
    change_complexity: float = Field(default=0.0, ge=0.0, description="Change complexity score")
    breaking_changes_count: int = Field(default=0, ge=0)
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # User tracking
    requested_by: str = Field(max_length=255, index=True)
    
    # Relationships
    version: Optional[RuleVersion] = Relationship(back_populates="comparisons")
    
    # Table constraints
    __table_args__ = (
        Index("idx_comparison_versions", "version_id", "compared_with_version_id"),
        Index("idx_comparison_type", "comparison_type"),
        UniqueConstraint("comparison_id", name="uq_version_comparison_id"),
    )

# ===================== REQUEST/RESPONSE MODELS =====================

class VersionCreateRequest(BaseModel):
    """Request model for creating new versions"""
    rule_id: str
    branch_id: str
    version_type: VersionType = VersionType.PATCH
    change_summary: str = Field(min_length=1, max_length=500)
    change_description: Optional[str] = None
    rule_content: Dict[str, Any]
    breaking_changes: Optional[List[str]] = []
    tags: Optional[List[str]] = []

class RuleVersionCreate(BaseModel):
    """Request model for creating new rule versions"""
    rule_id: str
    content: str
    commit_message: str
    author: str
    branch_name: Optional[str] = None
    parent_version_id: Optional[str] = None

class BranchCreateRequest(BaseModel):
    """Request model for creating new branches"""
    rule_id: str
    branch_name: str = Field(min_length=1, max_length=255)
    branch_type: BranchType = BranchType.FEATURE
    parent_branch_id: Optional[str] = None
    description: Optional[str] = None
    
class RuleBranchCreate(BaseModel):
    """Request model for creating new rule branches"""
    rule_id: str
    branch_name: str
    description: Optional[str] = None
    
class MergeRequestCreateRequest(BaseModel):
    """Request model for creating merge requests"""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    source_branch_id: str
    target_branch_id: str
    merge_strategy: MergeStrategy = MergeStrategy.MERGE
    reviewers: Optional[List[str]] = []

class MergeRequestCreate(BaseModel):
    """Request model for creating merge requests"""
    title: str
    description: Optional[str] = None
    source_branch_id: str
    target_branch_id: str
    merge_strategy: MergeStrategy = MergeStrategy.MERGE
    reviewers: Optional[List[str]] = []

class MergeRequestReviewCreate(BaseModel):
    """Request model for creating merge request reviews"""
    merge_request_id: str
    reviewer_id: str
    status: ApprovalStatus
    comments: Optional[str] = None
    suggested_changes: Optional[Dict[str, Any]] = None

class VersionComparisonRequest(BaseModel):
    """Request model for version comparison"""
    version_id_1: str
    version_id_2: str
    comparison_type: str = "diff"

class VersionComparisonResponse(BaseModel):
    """Response model for version comparison"""
    comparison_id: str
    version_id_1: str
    version_id_2: str
    differences_summary: Dict[str, Any]
    similarity_score: float
    change_complexity: float
    breaking_changes_count: int
    created_at: datetime

class VersionResponse(BaseModel):
    """Response model for version data"""
    id: int
    version_id: str
    rule_id: str
    version_number: str
    version_type: VersionType
    is_current: bool
    is_stable: bool
    change_summary: str
    created_at: datetime
    author: str
    
    class Config:
        from_attributes = True

class RuleVersionResponse(BaseModel):
    """Response model for rule version data"""
    id: int
    version_id: str
    rule_id: str
    version_number: str
    version_type: VersionType
    is_current: bool
    is_stable: bool
    change_summary: str
    created_at: datetime
    author: str
    
    class Config:
        from_attributes = True

class BranchResponse(BaseModel):
    """Response model for branch data"""
    id: int
    branch_id: str
    rule_id: str
    branch_name: str
    branch_type: BranchType
    is_active: bool
    commits_ahead: int
    commits_behind: int
    created_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

class RuleBranchResponse(BaseModel):
    """Response model for rule branch data"""
    id: int
    branch_id: str
    rule_id: str
    branch_name: str
    branch_type: BranchType
    is_active: bool
    commits_ahead: int
    commits_behind: int
    created_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

class MergeRequestResponse(BaseModel):
    """Response model for merge request data"""
    id: int
    merge_request_id: str
    title: str
    description: Optional[str]
    source_branch_id: str
    target_branch_id: str
    status: str
    merge_strategy: MergeStrategy
    created_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

class ConflictResolutionRequest(BaseModel):
    """Request model for conflict resolution"""
    merge_request_id: str
    resolution_strategy: ConflictResolutionStrategy
    manual_resolution: Optional[Dict[str, Any]] = None
    auto_resolve_conflicts: bool = False

class ConflictResolutionResponse(BaseModel):
    """Response model for conflict resolution"""
    resolution_id: str
    merge_request_id: str
    resolution_strategy: ConflictResolutionStrategy
    conflicts_resolved: int
    resolution_status: str
    created_at: datetime