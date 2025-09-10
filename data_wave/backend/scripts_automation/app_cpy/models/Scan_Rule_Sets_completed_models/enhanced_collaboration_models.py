"""
Enhanced Collaboration Models for Scan-Rule-Sets Group
====================================================

Advanced collaboration system for scan rule development with enterprise features:
- Team collaboration hubs with role-based access
- Comprehensive review workflows with approvals
- Advanced commenting and annotation systems
- Knowledge base and expert consultation
- Real-time collaboration with presence awareness
- Advanced discussion threads and decision tracking
- Expert advisory system with skill matching
- Collaborative rule development workflows

Production Features:
- Multi-dimensional collaboration spaces
- AI-powered expert matching and recommendations
- Advanced notification and alerting systems
- Comprehensive audit trails and activity tracking
- Integration with external collaboration tools
- Real-time presence and activity indicators
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum
import uuid

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text
from sqlalchemy import Index, UniqueConstraint, CheckConstraint
from pydantic import BaseModel, validator

# ===================== ENUMS AND TYPES =====================

class CollaborationSpaceType(str, Enum):
    """Collaboration space types"""
    RULE_DEVELOPMENT = "rule_development"
    REVIEW_BOARD = "review_board"
    KNOWLEDGE_HUB = "knowledge_hub"
    EXPERT_CONSULTATION = "expert_consultation"
    TRAINING_CENTER = "training_center"
    INNOVATION_LAB = "innovation_lab"
    COMPLIANCE_REVIEW = "compliance_review"
    COMMUNITY = "community"

class RoleType(str, Enum):
    """Collaboration role types"""
    RULE_ARCHITECT = "rule_architect"          # Senior rule designer
    RULE_DEVELOPER = "rule_developer"          # Rule implementer
    RULE_REVIEWER = "rule_reviewer"            # Code reviewer
    DOMAIN_EXPERT = "domain_expert"            # Subject matter expert
    COMPLIANCE_OFFICER = "compliance_officer"  # Compliance specialist
    QA_ENGINEER = "qa_engineer"                # Quality assurance
    PRODUCT_OWNER = "product_owner"            # Product manager
    TEAM_LEAD = "team_lead"                    # Team leadership
    GUEST_CONTRIBUTOR = "guest_contributor"    # External contributor
    OBSERVER = "observer"                      # Read-only access

class ReviewType(str, Enum):
    """Review type classifications"""
    CODE_REVIEW = "code_review"                # Technical code review
    DESIGN_REVIEW = "design_review"            # Architecture review
    SECURITY_REVIEW = "security_review"        # Security assessment
    COMPLIANCE_REVIEW = "compliance_review"    # Compliance check
    PERFORMANCE_REVIEW = "performance_review"  # Performance analysis
    BUSINESS_REVIEW = "business_review"        # Business validation
    PEER_REVIEW = "peer_review"                # Peer assessment
    EXPERT_REVIEW = "expert_review"            # Expert evaluation

class CommentType(str, Enum):
    """Comment type classifications"""
    GENERAL = "general"                        # General comment
    SUGGESTION = "suggestion"                  # Improvement suggestion
    ISSUE = "issue"                           # Problem identification
    QUESTION = "question"                      # Clarification request
    PRAISE = "praise"                         # Positive feedback
    CONCERN = "concern"                       # Concern raised
    TECHNICAL = "technical"                   # Technical discussion
    BUSINESS = "business"                     # Business discussion
    ANNOTATION = "annotation"                 # Code annotation
    DECISION = "decision"                     # Decision record

class KnowledgeItemType(str, Enum):
    """Knowledge item types"""
    BEST_PRACTICE = "best_practice"
    TUTORIAL = "tutorial"
    GUIDE = "guide"
    TEMPLATE = "template"
    EXAMPLE = "example"
    CASE_STUDY = "case_study"
    TROUBLESHOOTING = "troubleshooting"
    FAQ = "faq"
    REFERENCE = "reference"
    PATTERN = "pattern"

class ExpertiseLevel(str, Enum):
    """Expertise level classifications"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    MASTER = "master"

class NotificationPriority(str, Enum):
    """Notification priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

# Additional enums needed by rule_reviews_routes.py
class ReviewStatus(str, Enum):
    """Review status values"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_CHANGES = "needs_changes"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Priority(str, Enum):
    """Priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Additional enums needed by knowledge_base_routes.py
class KnowledgeType(str, Enum):
    """Knowledge item types"""
    BEST_PRACTICE = "best_practice"
    TUTORIAL = "tutorial"
    GUIDE = "guide"
    TEMPLATE = "template"
    EXAMPLE = "example"
    CASE_STUDY = "case_study"
    TROUBLESHOOTING = "troubleshooting"
    FAQ = "faq"
    REFERENCE = "reference"
    PATTERN = "pattern"
    WHITEPAPER = "whitepaper"
    RESEARCH = "research"

class ConsultationStatus(str, Enum):
    """Expert consultation status values"""
    REQUESTED = "requested"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

# ===================== CORE COLLABORATION MODELS =====================

class TeamCollaborationHub(SQLModel, table=True):
    """
    Advanced team collaboration hub for scan rule development.
    Supports multiple collaboration spaces with rich feature sets.
    """
    __tablename__ = "team_collaboration_hubs"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    hub_id: str = Field(index=True, unique=True, description="Unique hub identifier")
    name: str = Field(index=True, max_length=255, description="Hub name")
    display_name: Optional[str] = Field(max_length=255, description="Human-readable name")
    description: Optional[str] = Field(sa_column=Column(Text), description="Hub description")
    
    # Hub classification
    space_type: CollaborationSpaceType = Field(index=True, description="Collaboration space type")
    is_public: bool = Field(default=False, index=True, description="Public accessibility")
    is_active: bool = Field(default=True, index=True, description="Active status")
    is_archived: bool = Field(default=False, index=True, description="Archived status")
    
    # Hub configuration
    max_members: int = Field(default=50, ge=1, le=1000, description="Maximum members allowed")
    invite_only: bool = Field(default=True, description="Invitation-only access")
    require_approval: bool = Field(default=True, description="Require approval for join requests")
    allow_guests: bool = Field(default=False, description="Allow guest access")
    
    # Collaboration features
    real_time_editing: bool = Field(default=True, description="Real-time collaborative editing")
    version_control: bool = Field(default=True, description="Version control integration")
    ai_assistance: bool = Field(default=True, description="AI-powered assistance")
    expert_matching: bool = Field(default=True, description="Automatic expert matching")
    
    # Communication settings
    discussion_enabled: bool = Field(default=True, description="Enable discussions")
    notifications_enabled: bool = Field(default=True, description="Enable notifications")
    video_meetings: bool = Field(default=True, description="Video meeting integration")
    screen_sharing: bool = Field(default=True, description="Screen sharing capability")
    
    # Governance and security
    security_level: str = Field(default="internal", max_length=50, description="Security classification")
    data_governance_policy: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    audit_trail_enabled: bool = Field(default=True, description="Enable audit trail")
    
    # Analytics and insights
    activity_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    collaboration_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Collaboration effectiveness score")
    productivity_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    engagement_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Integration configuration
    external_integrations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    webhook_endpoints: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    api_access_enabled: bool = Field(default=False, description="API access enabled")
    
    # Customization
    custom_fields: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    ui_customization: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    workflow_templates: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_activity: datetime = Field(default_factory=datetime.utcnow, index=True)
    archived_at: Optional[datetime] = None
    
    # User tracking
    created_by: str = Field(max_length=255, index=True)
    owner: str = Field(max_length=255, index=True, description="Hub owner")
    moderators: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    members: List["RuleTeamMember"] = Relationship(back_populates="hub")
    reviews: List["EnhancedRuleReview"] = Relationship(back_populates="collaboration_hub")
    discussions: List["RuleDiscussion"] = Relationship(back_populates="hub")
    knowledge_items: List["KnowledgeItem"] = Relationship(back_populates="hub")
    
    # Table constraints
    __table_args__ = (
        Index("idx_hub_type_active", "space_type", "is_active"),
        Index("idx_hub_public_archived", "is_public", "is_archived"),
        Index("idx_hub_activity", "last_activity"),
        UniqueConstraint("hub_id", name="uq_team_collaboration_hub_id"),
    )

class RuleTeamMember(SQLModel, table=True):
    """
    Rule team member management with advanced role-based permissions.
    Supports skill tracking, activity monitoring, and contribution analytics.
    """
    __tablename__ = "rule_team_members"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    member_id: str = Field(index=True, unique=True, description="Unique member identifier")
    hub_id: str = Field(foreign_key="team_collaboration_hubs.hub_id", index=True)
    user_id: str = Field(max_length=255, index=True, description="User identifier")
    
    # Role and permissions
    role: RoleType = Field(index=True, description="Primary role")
    secondary_roles: List[RoleType] = Field(default_factory=list, sa_column=Column(JSON))
    permission_level: str = Field(default="standard", max_length=50, description="Permission level")
    custom_permissions: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Member status
    status: str = Field(default="active", max_length=50, index=True)  # active, inactive, suspended, pending
    is_moderator: bool = Field(default=False, index=True)
    is_expert: bool = Field(default=False, index=True)
    is_mentor: bool = Field(default=False, index=True)
    
    # Skills and expertise
    skills: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    expertise_areas: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    expertise_level: ExpertiseLevel = Field(default=ExpertiseLevel.INTERMEDIATE)
    certifications: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    specializations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Activity and engagement
    last_active: datetime = Field(default_factory=datetime.utcnow, index=True)
    total_contributions: int = Field(default=0, ge=0, description="Total contributions")
    reviews_completed: int = Field(default=0, ge=0, description="Reviews completed")
    comments_made: int = Field(default=0, ge=0, description="Comments made")
    knowledge_shared: int = Field(default=0, ge=0, description="Knowledge items shared")
    
    # Performance metrics
    contribution_score: float = Field(default=0.0, ge=0.0, description="Contribution score")
    collaboration_rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Collaboration rating")
    expertise_rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Expertise rating")
    mentorship_rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Mentorship rating")
    
    # Preferences and settings
    notification_preferences: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    communication_preferences: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    availability_schedule: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    time_zone: Optional[str] = Field(max_length=50)
    
    # AI and automation
    ai_assistant_enabled: bool = Field(default=True, description="AI assistant enabled")
    auto_suggestions_enabled: bool = Field(default=True, description="Auto suggestions enabled")
    smart_notifications: bool = Field(default=True, description="Smart notifications enabled")
    
    # Temporal fields
    joined_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_contribution: Optional[datetime] = None
    
    # Invitation and approval
    invited_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    invitation_token: Optional[str] = Field(max_length=255)
    
    # Relationships
    hub: Optional[TeamCollaborationHub] = Relationship(back_populates="members")
    reviews: List["EnhancedRuleReview"] = Relationship(back_populates="reviewer")
    comments: List["EnhancedRuleComment"] = Relationship(back_populates="author")
    
    # Table constraints
    __table_args__ = (
        Index("idx_member_hub_user", "hub_id", "user_id"),
        Index("idx_member_role_status", "role", "status"),
        Index("idx_member_expert_mentor", "is_expert", "is_mentor"),
        Index("idx_member_activity", "last_active", "total_contributions"),
        UniqueConstraint("member_id", name="uq_team_member_id"),
        UniqueConstraint("hub_id", "user_id", name="uq_hub_user_membership"),
    )

class EnhancedRuleReview(SQLModel, table=True):
    """
    Comprehensive rule review system with multi-stage workflows.
    Supports various review types with detailed feedback and approvals.
    """
    __tablename__ = "enhanced_rule_reviews"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: str = Field(index=True, unique=True, description="Unique review identifier")
    rule_id: str = Field(index=True, description="Rule being reviewed")
    collaboration_hub_id: str = Field(foreign_key="team_collaboration_hubs.hub_id", index=True)
    
    # Review details
    title: str = Field(max_length=255, description="Review title")
    description: Optional[str] = Field(sa_column=Column(Text), description="Review description")
    review_type: ReviewType = Field(index=True, description="Type of review")
    priority: str = Field(default="normal", max_length=20, index=True)
    
    # Review scope and context
    review_scope: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    context_information: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    related_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dependencies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Review status and workflow
    status: str = Field(default="pending", max_length=50, index=True)  # pending, in_progress, completed, cancelled
    stage: str = Field(default="initial", max_length=50, description="Current review stage")
    approval_required: bool = Field(default=True, description="Requires approval")
    required_reviewers: int = Field(default=1, ge=1, description="Number of required reviewers")
    current_reviewers: int = Field(default=0, ge=0, description="Current number of reviewers")
    
    # Review criteria and checklist
    review_criteria: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    checklist_items: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_gates: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_checks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Review outcomes
    overall_decision: Optional[str] = Field(max_length=50)  # approved, rejected, conditional, needs_revision
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Review confidence")
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Review metrics and analytics
    review_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    time_spent_minutes: int = Field(default=0, ge=0, description="Total review time")
    complexity_score: float = Field(default=0.0, ge=0.0, description="Review complexity")
    thoroughness_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Review thoroughness")
    
    # Reviewer assignment
    assigned_reviewers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    optional_reviewers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    reviewer_expertise_match: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    auto_assigned: bool = Field(default=False, description="Automatically assigned reviewers")
    
    # Review lifecycle
    due_date: Optional[datetime] = Field(description="Review due date")
    escalation_date: Optional[datetime] = Field(description="Escalation date")
    auto_approve_date: Optional[datetime] = Field(description="Auto-approval date")
    
    # Integration and automation
    automated_checks: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    ai_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    external_tool_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # User tracking
    requested_by: str = Field(max_length=255, index=True, description="Review requester")
    reviewer_id: str = Field(foreign_key="rule_team_members.member_id", index=True)
    approved_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    collaboration_hub: Optional[TeamCollaborationHub] = Relationship(back_populates="reviews")
    reviewer: Optional[RuleTeamMember] = Relationship(back_populates="reviews")
    comments: List["EnhancedRuleComment"] = Relationship(back_populates="review")
    
    # Table constraints
    __table_args__ = (
        Index("idx_review_rule_type", "rule_id", "review_type"),
        Index("idx_review_status_priority", "status", "priority"),
        Index("idx_review_dates", "due_date", "escalation_date"),
        Index("idx_review_requester", "requested_by", "created_at"),
        UniqueConstraint("review_id", name="uq_rule_review_id"),
    )

class EnhancedRuleComment(SQLModel, table=True):
    """
    Advanced commenting system with threading and rich features.
    Supports annotations, suggestions, and collaborative discussions.
    """
    __tablename__ = "enhanced_rule_comments"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    comment_id: str = Field(index=True, unique=True, description="Unique comment identifier")
    
    # Comment context
    target_type: str = Field(max_length=50, index=True, description="Target entity type")
    target_id: str = Field(index=True, description="Target entity ID")
    review_id: Optional[str] = Field(foreign_key="enhanced_rule_reviews.review_id", index=True)
    
    # Comment content
    content: str = Field(sa_column=Column(Text), description="Comment content")
    comment_type: CommentType = Field(index=True, description="Comment type")
    format: str = Field(default="markdown", max_length=20, description="Content format")
    
    # Threading and hierarchy
    parent_comment_id: Optional[str] = Field(index=True, description="Parent comment for threading")
    thread_id: str = Field(index=True, description="Thread identifier")
    depth_level: int = Field(default=0, ge=0, le=10, description="Thread depth level")
    is_thread_root: bool = Field(default=False, index=True, description="Root of discussion thread")
    
    # Comment metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    mentions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    attachments: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    references: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Code annotation (for code-specific comments)
    line_number: Optional[int] = Field(ge=0, description="Line number for code comments")
    line_range: Optional[Dict[str, int]] = Field(default=None, sa_column=Column(JSON))
    code_snippet: Optional[str] = Field(sa_column=Column(Text), description="Referenced code snippet")
    suggested_change: Optional[str] = Field(sa_column=Column(Text), description="Suggested code change")
    
    # Comment status and lifecycle
    status: str = Field(default="active", max_length=50, index=True)  # active, resolved, archived, deleted
    is_resolved: bool = Field(default=False, index=True)
    is_suggestion: bool = Field(default=False, index=True)
    is_accepted: bool = Field(default=False, index=True)
    resolution_details: Optional[str] = Field(sa_column=Column(Text))
    
    # Engagement and reactions
    upvotes: int = Field(default=0, ge=0, description="Upvote count")
    downvotes: int = Field(default=0, ge=0, description="Downvote count")
    reactions: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    helpfulness_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Helpfulness rating")
    
    # AI and automation
    ai_generated: bool = Field(default=False, description="AI-generated comment")
    ai_confidence: Optional[float] = Field(ge=0.0, le=1.0, description="AI confidence score")
    automated_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    sentiment_score: Optional[float] = Field(ge=-1.0, le=1.0, description="Sentiment analysis score")
    
    # Visibility and permissions
    visibility: str = Field(default="public", max_length=20, description="Comment visibility")
    edit_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    last_edited: Optional[datetime] = None
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    resolved_at: Optional[datetime] = None
    
    # User tracking
    author_id: str = Field(foreign_key="rule_team_members.member_id", index=True)
    resolver: Optional[str] = Field(max_length=255)
    last_editor: Optional[str] = Field(max_length=255)
    
    # Relationships
    author: Optional[RuleTeamMember] = Relationship(back_populates="comments")
    review: Optional[EnhancedRuleReview] = Relationship(back_populates="comments")
    
    # Table constraints
    __table_args__ = (
        Index("idx_comment_target", "target_type", "target_id"),
        Index("idx_comment_thread", "thread_id", "depth_level"),
        Index("idx_comment_type_status", "comment_type", "status"),
        Index("idx_comment_author_created", "author_id", "created_at"),
        UniqueConstraint("comment_id", name="uq_comment_id"),
    )

class KnowledgeItem(SQLModel, table=True):
    """
    Knowledge base system for best practices and documentation.
    Supports various content types with advanced search and categorization.
    """
    __tablename__ = "knowledge_items"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: str = Field(index=True, unique=True, description="Unique knowledge item ID")
    hub_id: str = Field(foreign_key="team_collaboration_hubs.hub_id", index=True)
    
    # Content information
    title: str = Field(index=True, max_length=255, description="Knowledge item title")
    summary: Optional[str] = Field(max_length=500, description="Brief summary")
    content: str = Field(sa_column=Column(Text), description="Full content")
    content_format: str = Field(default="markdown", max_length=20, description="Content format")
    
    # Classification and categorization
    item_type: KnowledgeItemType = Field(index=True, description="Knowledge item type")
    category: str = Field(index=True, max_length=100, description="Primary category")
    subcategories: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Content metadata
    difficulty_level: ExpertiseLevel = Field(default=ExpertiseLevel.INTERMEDIATE, index=True)
    estimated_read_time: int = Field(default=5, ge=1, description="Estimated reading time in minutes")
    prerequisites: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    related_items: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality and validation
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Content accuracy score")
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Content completeness")
    relevance_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Content relevance")
    freshness_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Content freshness")
    
    # Engagement and usage
    view_count: int = Field(default=0, ge=0, description="Total views")
    like_count: int = Field(default=0, ge=0, description="Like count")
    bookmark_count: int = Field(default=0, ge=0, description="Bookmark count")
    share_count: int = Field(default=0, ge=0, description="Share count")
    usage_frequency: float = Field(default=0.0, ge=0.0, description="Usage frequency score")
    
    # Review and approval
    review_status: str = Field(default="draft", max_length=50, index=True)  # draft, review, approved, published
    reviewed_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    review_comments: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Versioning and maintenance
    version: str = Field(default="1.0", max_length=20, description="Content version")
    is_current: bool = Field(default=True, index=True, description="Current version")
    outdated: bool = Field(default=False, index=True, description="Content is outdated")
    last_reviewed: Optional[datetime] = Field(description="Last review date")
    next_review_due: Optional[datetime] = Field(description="Next review due date")
    
    # AI and automation
    ai_generated: bool = Field(default=False, description="AI-generated content")
    ai_enhanced: bool = Field(default=False, description="AI-enhanced content")
    auto_update_enabled: bool = Field(default=False, description="Auto-update enabled")
    ml_recommendations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Access and permissions
    visibility: str = Field(default="internal", max_length=20, description="Content visibility")
    access_level: str = Field(default="standard", max_length=20, description="Access level required")
    download_allowed: bool = Field(default=True, description="Download permitted")
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    published_at: Optional[datetime] = None
    last_accessed: Optional[datetime] = None
    
    # User tracking
    author: str = Field(max_length=255, index=True, description="Content author")
    contributors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    maintainer: Optional[str] = Field(max_length=255, description="Content maintainer")
    
    # Relationships
    hub: Optional[TeamCollaborationHub] = Relationship(back_populates="knowledge_items")
    
    # Table constraints
    __table_args__ = (
        Index("idx_knowledge_type_category", "item_type", "category"),
        Index("idx_knowledge_status_current", "review_status", "is_current"),
        Index("idx_knowledge_difficulty", "difficulty_level"),
        Index("idx_knowledge_engagement", "view_count", "like_count"),
        UniqueConstraint("item_id", name="uq_knowledge_item_id"),
    )

class RuleDiscussion(SQLModel, table=True):
    """
    Advanced rule discussion threads with decision tracking.
    Supports structured discussions with outcomes and action items.
    """
    __tablename__ = "rule_discussions"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    discussion_id: str = Field(index=True, unique=True, description="Unique discussion identifier")
    hub_id: str = Field(foreign_key="team_collaboration_hubs.hub_id", index=True)
    
    # Discussion details
    title: str = Field(index=True, max_length=255, description="Discussion title")
    description: Optional[str] = Field(sa_column=Column(Text), description="Discussion description")
    topic: str = Field(index=True, max_length=100, description="Discussion topic")
    purpose: str = Field(max_length=100, description="Discussion purpose")
    
    # Discussion classification
    discussion_type: str = Field(max_length=50, index=True, description="Discussion type")
    priority: str = Field(default="normal", max_length=20, index=True)
    urgency: str = Field(default="normal", max_length=20, description="Discussion urgency")
    scope: str = Field(max_length=50, description="Discussion scope")
    
    # Discussion status and lifecycle
    status: str = Field(default="open", max_length=50, index=True)  # open, active, paused, closed, archived
    stage: str = Field(default="discussion", max_length=50, description="Current discussion stage")
    requires_decision: bool = Field(default=False, index=True, description="Requires a decision")
    decision_deadline: Optional[datetime] = Field(description="Decision deadline")
    
    # Participation and engagement
    participant_count: int = Field(default=0, ge=0, description="Number of participants")
    message_count: int = Field(default=0, ge=0, description="Total messages")
    active_participants: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    moderators: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Decision tracking
    decision_made: bool = Field(default=False, index=True, description="Decision reached")
    decision_summary: Optional[str] = Field(sa_column=Column(Text), description="Decision summary")
    decision_rationale: Optional[str] = Field(sa_column=Column(Text), description="Decision rationale")
    consensus_level: Optional[float] = Field(ge=0.0, le=1.0, description="Consensus level reached")
    
    # Action items and outcomes
    action_items: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    outcomes: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    follow_up_required: bool = Field(default=False, description="Follow-up required")
    follow_up_date: Optional[datetime] = Field(description="Follow-up scheduled date")
    
    # Analytics and insights
    engagement_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Engagement level")
    productivity_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Productivity score")
    sentiment_analysis: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    key_insights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_activity: datetime = Field(default_factory=datetime.utcnow, index=True)
    closed_at: Optional[datetime] = None
    
    # User tracking
    initiated_by: str = Field(max_length=255, index=True, description="Discussion initiator")
    facilitator: Optional[str] = Field(max_length=255, description="Discussion facilitator")
    decision_maker: Optional[str] = Field(max_length=255, description="Final decision maker")
    
    # Relationships
    hub: Optional[TeamCollaborationHub] = Relationship(back_populates="discussions")
    
    # Table constraints
    __table_args__ = (
        Index("idx_discussion_topic_type", "topic", "discussion_type"),
        Index("idx_discussion_status_priority", "status", "priority"),
        Index("idx_discussion_decision", "requires_decision", "decision_made"),
        Index("idx_discussion_activity", "last_activity", "status"),
        UniqueConstraint("discussion_id", name="uq_discussion_id"),
    )

# ===================== REQUEST/RESPONSE MODELS =====================

class TeamHubCreateRequest(BaseModel):
    """Request model for creating collaboration hubs"""
    name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    space_type: CollaborationSpaceType = CollaborationSpaceType.RULE_DEVELOPMENT
    is_public: bool = False
    max_members: int = Field(default=50, ge=1, le=1000)
    
class ReviewCreateRequest(BaseModel):
    """Request model for creating rule reviews"""
    rule_id: str
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    review_type: ReviewType = ReviewType.CODE_REVIEW
    priority: str = "normal"
    assigned_reviewers: Optional[List[str]] = []
    
class RuleCommentCreateRequest(BaseModel):
    """Request model for creating comments"""
    target_type: str
    target_id: str
    content: str = Field(min_length=1)
    comment_type: CommentType = CommentType.GENERAL
    parent_comment_id: Optional[str] = None
    
class KnowledgeItemCreateRequest(BaseModel):
    """Request model for creating knowledge items"""
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    item_type: KnowledgeItemType = KnowledgeItemType.BEST_PRACTICE
    category: str = Field(min_length=1, max_length=100)
    tags: Optional[List[str]] = []
    difficulty_level: ExpertiseLevel = ExpertiseLevel.INTERMEDIATE
    knowledge_type: Optional[str] = None
    related_rules: Optional[List[str]] = []
    attachments: Optional[List[str]] = []
    visibility: Optional[str] = "team"

# Additional missing create request models
class TeamMemberCreate(BaseModel):
    """Request model for adding team members"""
    user_id: str
    role: RoleType
    permissions: List[str] = []
    join_date: Optional[datetime] = None

class RuleReviewCreate(BaseModel):
    """Request model for creating rule reviews"""
    rule_id: str
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    review_type: ReviewType
    priority: str = "normal"
    assigned_reviewers: List[str] = []
    deadline: Optional[datetime] = None

class CommentCreate(BaseModel):
    """Request model for creating comments"""
    target_type: str
    target_id: str
    content: str = Field(min_length=1)
    comment_type: CommentType = CommentType.GENERAL
    parent_comment_id: Optional[str] = None
    mentions: List[str] = []
    attachments: List[str] = []
    annotations: Dict[str, Any] = {}

class DiscussionCreate(BaseModel):
    """Request model for creating discussions"""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    topic: str
    purpose: str
    discussion_type: str
    priority: str = "normal"
    urgency: str = "normal"
    scope: str
    requires_decision: bool = False
    decision_deadline: Optional[datetime] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    related_entities: Optional[List[str]] = []
    is_pinned: Optional[bool] = False

# ===================== RESPONSE MODELS =====================

class TeamHubResponse(BaseModel):
    """Response model for team collaboration hub"""
    id: int
    hub_id: str
    name: str
    display_name: Optional[str]
    description: Optional[str]
    space_type: str
    is_public: bool
    is_active: bool
    member_count: int
    created_at: datetime
    owner: str
    collaboration_score: float
    
    class Config:
        from_attributes = True

class RuleReviewResponse(BaseModel):
    """Response model for rule review"""
    id: int
    review_id: str
    title: str
    description: Optional[str]
    review_type: str
    status: str
    priority: str
    created_at: datetime
    assigned_reviewers: List[str]
    
    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    """Response model for comments"""
    id: int
    content: str
    comment_type: str
    author: str
    created_at: datetime
    parent_comment_id: Optional[str]
    
    class Config:
        from_attributes = True

class KnowledgeItemResponse(BaseModel):
    """Response model for knowledge items"""
    id: int
    title: str
    content: str
    item_type: str
    category: str
    tags: List[str]
    difficulty_level: str
    created_at: datetime
    author: str
    knowledge_type: Optional[str] = None
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    related_rules: Optional[List[str]] = []
    attachments: Optional[List[str]] = []
    visibility: Optional[str] = None
    views_count: Optional[int] = 0
    likes_count: Optional[int] = 0
    is_featured: Optional[bool] = False
    last_updated: Optional[datetime] = None
    relevance_score: Optional[float] = 0.0
    
    class Config:
        from_attributes = True

class DiscussionResponse(BaseModel):
    """Response model for discussions"""
    id: int
    title: str
    description: Optional[str]
    topic: str
    status: str
    participant_count: int
    message_count: int
    created_at: datetime
    initiated_by: str
    content: Optional[str] = None
    category: Optional[str] = None
    discussion_type: Optional[str] = None
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    tags: Optional[List[str]] = []
    related_entities: Optional[List[str]] = []
    is_pinned: Optional[bool] = False
    is_locked: Optional[bool] = False
    views_count: Optional[int] = 0
    replies_count: Optional[int] = 0
    last_reply_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CollaborationAnalyticsResponse(BaseModel):
    """Response model for collaboration analytics"""
    team_id: int
    collaboration_score: float
    productivity_score: float
    engagement_score: float
    member_count: int
    active_members: int
    total_reviews: int
    total_comments: int
    total_knowledge_items: int
    recent_activity: List[Dict[str, Any]]
    
    class Config:
        from_attributes = True

# Additional models needed by rule_reviews_routes.py
class RuleReviewRequest(BaseModel):
    """Request model for creating rule reviews"""
    rule_id: str
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    review_type: ReviewType
    priority: Priority = Priority.MEDIUM
    assigned_reviewers: List[str] = []
    deadline: Optional[datetime] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class RuleCommentRequest(BaseModel):
    """Request model for rule review comments"""
    content: str = Field(min_length=1)
    comment_type: CommentType = CommentType.GENERAL
    parent_comment_id: Optional[str] = None
    mentions: List[str] = []
    attachments: List[str] = []
    is_resolved: bool = False

class RuleCommentResponse(BaseModel):
    """Response model for rule review comments"""
    id: str
    content: str
    comment_type: str
    author_id: str
    author_name: str
    created_at: datetime
    parent_comment_id: Optional[str] = None
    mentions: List[str] = []
    attachments: List[str] = []
    is_resolved: bool = False
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    
    class Config:
        from_attributes = True

# Additional models needed by knowledge_base_routes.py
class KnowledgeBaseRequest(BaseModel):
    """Request model for creating knowledge base items"""
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    knowledge_type: KnowledgeType
    category: str = Field(min_length=1, max_length=100)
    tags: List[str] = []
    difficulty_level: ExpertiseLevel = ExpertiseLevel.INTERMEDIATE
    related_rules: List[str] = []
    attachments: List[str] = []
    visibility: str = "team"
    metadata: Dict[str, Any] = {}

class KnowledgeBaseResponse(BaseModel):
    """Response model for knowledge base items"""
    id: str
    title: str
    content: str
    knowledge_type: str
    category: str
    tags: List[str]
    difficulty_level: str
    author_id: str
    author_name: str
    created_at: datetime
    updated_at: datetime
    views_count: int = 0
    likes_count: int = 0
    is_featured: bool = False
    related_rules: List[str] = []
    attachments: List[str] = []
    visibility: str
    metadata: Dict[str, Any] = {}
    
    class Config:
        from_attributes = True

class ExpertConsultationRequest(BaseModel):
    """Request model for expert consultation"""
    knowledge_item_id: str
    consultation_type: str
    description: str
    urgency: str = "normal"
    preferred_experts: List[str] = []
    scheduled_time: Optional[datetime] = None
    duration_minutes: int = 60
    additional_context: Dict[str, Any] = {}

class ExpertConsultationResponse(BaseModel):
    """Response model for expert consultation"""
    id: str
    knowledge_item_id: str
    consultation_type: str
    description: str
    status: ConsultationStatus
    requester_id: str
    requester_name: str
    assigned_expert_id: Optional[str] = None
    assigned_expert_name: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    duration_minutes: int
    created_at: datetime
    updated_at: datetime
    additional_context: Dict[str, Any] = {}
    
    class Config:
        from_attributes = True