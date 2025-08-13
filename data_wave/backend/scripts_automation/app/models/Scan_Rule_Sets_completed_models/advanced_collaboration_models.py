"""
Advanced Collaboration Models for Scan Rule Sets

Enhanced collaboration models for enterprise-grade team collaboration and knowledge management.
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

class ReviewStatus(str, Enum):
    """Review status types."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_CHANGES = "requires_changes"
    CANCELLED = "cancelled"

class CommentType(str, Enum):
    """Comment types."""
    GENERAL = "general"
    SUGGESTION = "suggestion"
    ISSUE = "issue"
    QUESTION = "question"
    APPROVAL = "approval"
    REJECTION = "rejection"

class Priority(str, Enum):
    """Priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class WorkflowStatus(str, Enum):
    """Workflow status types."""
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"

class ApprovalType(str, Enum):
    """Approval types."""
    TECHNICAL = "technical"
    BUSINESS = "business"
    COMPLIANCE = "compliance"
    SECURITY = "security"
    FINAL = "final"

class ExpertiseLevel(str, Enum):
    """Expertise levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class ConsultationStatus(str, Enum):
    """Consultation status."""
    REQUESTED = "requested"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# ===================================
# COLLABORATION MODELS
# ===================================

class RuleReview(SQLModel, table=True):
    """Advanced rule review system with comprehensive workflow management."""
    __tablename__ = "rule_reviews"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)
    rule_version_id: Optional[str] = Field(default=None, index=True)
    
    # Review Details
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    review_type: str = Field(max_length=50)  # code_review, design_review, security_review, etc.
    
    # Review Scope
    scope_areas: List[str] = Field(default_factory=list, sa_column=Column(JSON))  # logic, performance, security, etc.
    specific_files: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    review_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Review Process
    status: ReviewStatus = Field(default=ReviewStatus.PENDING, index=True)
    priority: Priority = Field(default=Priority.MEDIUM)
    is_required: bool = Field(default=False)
    is_blocking: bool = Field(default=False)
    
    # Participants
    requested_by: str = Field(max_length=100, index=True)
    assigned_reviewers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    completed_reviewers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    pending_reviewers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Review Configuration
    requires_all_approvals: bool = Field(default=False)
    min_approvals_required: int = Field(default=1, ge=0)
    max_reviewers: Optional[int] = Field(default=None, ge=1)
    auto_assign_experts: bool = Field(default=True)
    
    # Deadlines and SLA
    due_date: Optional[datetime] = Field(default=None)
    sla_hours: Optional[int] = Field(default=None, ge=0)
    escalation_hours: Optional[int] = Field(default=None, ge=0)
    escalation_recipients: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Review Results
    overall_decision: Optional[str] = Field(default=None, max_length=50)  # approved, rejected, needs_work
    decision_rationale: Optional[str] = Field(default=None, sa_column=Column(Text))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    action_items: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality Metrics
    quality_score: Optional[float] = Field(default=None, ge=0, le=100)
    complexity_score: Optional[float] = Field(default=None, ge=0, le=100)
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Notification and Communication
    notification_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    communication_channel: Optional[str] = Field(default=None, max_length=200)
    meeting_scheduled: bool = Field(default=False)
    meeting_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Performance Tracking
    review_duration_hours: Optional[float] = Field(default=None, ge=0)
    reviewer_efficiency: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    cycle_time_hours: Optional[float] = Field(default=None, ge=0)
    
    # Relationships
    comments: List["RuleComment"] = Relationship(back_populates="review")
    approval_workflow: Optional["ApprovalWorkflow"] = Relationship(back_populates="review")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_review_rule_status", "rule_id", "status"),
        Index("idx_review_requested_by", "requested_by"),
        Index("idx_review_priority", "priority"),
        Index("idx_review_due_date", "due_date"),
    )
    
    class Config:
        arbitrary_types_allowed = True

class RuleComment(SQLModel, table=True):
    """Advanced commenting system for rule collaboration."""
    __tablename__ = "rule_comments"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    comment_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)
    review_id: Optional[str] = Field(default=None, foreign_key="rule_reviews.review_id", index=True)
    
    # Comment Hierarchy
    parent_comment_id: Optional[str] = Field(default=None, foreign_key="rule_comments.comment_id")
    thread_id: str = Field(index=True)  # Groups related comments
    depth_level: int = Field(default=0, ge=0)
    
    # Comment Content
    comment_type: CommentType = Field(default=CommentType.GENERAL)
    title: Optional[str] = Field(default=None, max_length=200)
    content: str = Field(sa_column=Column(Text))
    formatted_content: Optional[str] = Field(default=None, sa_column=Column(Text))  # HTML/Markdown formatted
    
    # Context and Location
    context_type: str = Field(max_length=50)  # rule_logic, parameters, documentation, etc.
    context_reference: Optional[str] = Field(default=None, max_length=500)  # specific location in rule
    line_number: Optional[int] = Field(default=None, ge=0)
    code_snippet: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Suggestions and Recommendations
    is_suggestion: bool = Field(default=False)
    suggested_change: Optional[str] = Field(default=None, sa_column=Column(Text))
    change_rationale: Optional[str] = Field(default=None, sa_column=Column(Text))
    implementation_effort: Optional[str] = Field(default=None, max_length=50)  # low, medium, high
    
    # Author and Attribution
    author: str = Field(max_length=100, index=True)
    author_role: str = Field(max_length=100)
    author_expertise: ExpertiseLevel = Field(default=ExpertiseLevel.INTERMEDIATE)
    
    # Comment Status and Resolution
    status: str = Field(default="active", max_length=50)  # active, resolved, outdated, archived
    is_resolved: bool = Field(default=False)
    resolved_by: Optional[str] = Field(default=None, max_length=100)
    resolved_at: Optional[datetime] = Field(default=None)
    resolution_note: Optional[str] = Field(default=None, max_length=1000)
    
    # Priority and Impact
    priority: Priority = Field(default=Priority.MEDIUM)
    impact_level: Optional[str] = Field(default=None, max_length=50)  # low, medium, high, critical
    requires_action: bool = Field(default=False)
    action_deadline: Optional[datetime] = Field(default=None)
    
    # Engagement and Feedback
    upvotes: int = Field(default=0, ge=0)
    downvotes: int = Field(default=0, ge=0)
    helpful_count: int = Field(default=0, ge=0)
    flag_count: int = Field(default=0, ge=0)
    
    # Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    attachments: List[Dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))
    references: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Visibility and Permissions
    visibility: str = Field(default="public", max_length=50)  # public, private, team, reviewers_only
    restricted_to: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = Field(default=None)
    edit_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Notification and Follow-up
    mentioned_users: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    watchers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    notification_sent: bool = Field(default=False)
    
    # Relationships
    review: Optional[RuleReview] = Relationship(back_populates="comments")
    parent_comment: Optional["RuleComment"] = Relationship(back_populates="child_comments")
    child_comments: List["RuleComment"] = Relationship(back_populates="parent_comment")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_comment_rule_created", "rule_id", "created_at"),
        Index("idx_comment_author", "author"),
        Index("idx_comment_thread", "thread_id"),
        Index("idx_comment_status", "status"),
        Index("idx_comment_resolved", "is_resolved"),
    )
    
    class Config:
        arbitrary_types_allowed = True

class ApprovalWorkflow(SQLModel, table=True):
    """Enterprise approval workflow management."""
    __tablename__ = "approval_workflows"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)
    review_id: Optional[str] = Field(default=None, foreign_key="rule_reviews.review_id")
    
    # Workflow Definition
    workflow_name: str = Field(max_length=200)
    workflow_description: Optional[str] = Field(default=None, sa_column=Column(Text))
    workflow_type: str = Field(max_length=50)  # sequential, parallel, conditional
    
    # Approval Stages
    approval_stages: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    current_stage: int = Field(default=0, ge=0)
    total_stages: int = Field(ge=1)
    
    # Workflow Status
    status: WorkflowStatus = Field(default=WorkflowStatus.DRAFT, index=True)
    overall_decision: Optional[str] = Field(default=None, max_length=50)
    
    # Participants and Roles
    initiator: str = Field(max_length=100, index=True)
    approvers: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))  # stage -> approver details
    current_approvers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    completed_approvals: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Workflow Rules
    requires_unanimous: bool = Field(default=False)
    allows_delegation: bool = Field(default=True)
    auto_escalation_enabled: bool = Field(default=True)
    escalation_rules: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timing and SLA
    sla_hours: Optional[int] = Field(default=None, ge=0)
    stage_deadlines: Dict[str, datetime] = Field(default_factory=dict, sa_column=Column(JSON))
    escalation_schedule: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Decision Tracking
    stage_decisions: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    decision_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    rejection_reasons: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Context
    business_justification: Optional[str] = Field(default=None, sa_column=Column(Text))
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    regulatory_impact: Optional[str] = Field(default=None, max_length=500)
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Performance Metrics
    total_duration_hours: Optional[float] = Field(default=None, ge=0)
    stage_durations: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    efficiency_score: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Communication
    notification_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    communication_log: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    review: Optional[RuleReview] = Relationship(back_populates="approval_workflow")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_workflow_rule_status", "rule_id", "status"),
        Index("idx_workflow_initiator", "initiator"),
        Index("idx_workflow_stage", "current_stage"),
    )
    
    class Config:
        arbitrary_types_allowed = True

class AdvancedKnowledgeBase(SQLModel, table=True):
    """Enterprise knowledge base for rule development best practices."""
    __tablename__ = "advanced_knowledge_base"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    article_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Article Details
    title: str = Field(max_length=300, index=True)
    summary: Optional[str] = Field(default=None, max_length=1000)
    content: str = Field(sa_column=Column(Text))
    content_type: str = Field(default="markdown", max_length=50)  # markdown, html, plain_text
    
    # Classification and Organization
    category: str = Field(max_length=100, index=True)
    subcategory: Optional[str] = Field(default=None, max_length=100)
    article_type: str = Field(max_length=50)  # guide, tutorial, best_practice, troubleshooting, faq
    expertise_level: ExpertiseLevel = Field(default=ExpertiseLevel.INTERMEDIATE)
    
    # Tagging and Search
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    search_index: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Content Structure
    table_of_contents: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    sections: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    code_examples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    attachments: List[Dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Related Content
    related_rules: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    related_articles: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    prerequisites: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    see_also: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality and Validation
    accuracy_score: Optional[float] = Field(default=None, ge=0, le=100)
    completeness_score: Optional[float] = Field(default=None, ge=0, le=100)
    usefulness_score: Optional[float] = Field(default=None, ge=0, le=100)
    last_validated: Optional[datetime] = Field(default=None)
    validation_notes: Optional[str] = Field(default=None, max_length=1000)
    
    # User Engagement
    view_count: int = Field(default=0, ge=0)
    helpful_votes: int = Field(default=0, ge=0)
    not_helpful_votes: int = Field(default=0, ge=0)
    bookmark_count: int = Field(default=0, ge=0)
    share_count: int = Field(default=0, ge=0)
    
    # Content Management
    status: str = Field(default="draft", max_length=50)  # draft, published, archived, deprecated
    version: str = Field(default="1.0", max_length=20)
    is_featured: bool = Field(default=False)
    is_official: bool = Field(default=False)
    requires_review: bool = Field(default=True)
    
    # Author and Maintenance
    author: str = Field(max_length=100, index=True)
    contributors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    maintainers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    reviewer: Optional[str] = Field(default=None, max_length=100)
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = Field(default=None)
    last_accessed: Optional[datetime] = Field(default=None)
    
    # Usage Analytics
    access_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    user_feedback: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    improvement_suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    consultations: List["ExpertConsultation"] = Relationship(back_populates="knowledge_article")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_knowledge_category", "category", "subcategory"),
        Index("idx_knowledge_author", "author"),
        Index("idx_knowledge_status", "status"),
        Index("idx_knowledge_featured", "is_featured"),
        Index("idx_knowledge_views", "view_count"),
    )
    
    class Config:
        arbitrary_types_allowed = True

class ExpertConsultation(SQLModel, table=True):
    """Expert consultation system for complex rule development scenarios."""
    __tablename__ = "expert_consultations"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    rule_id: int = Field(index=True)
    
    # Consultation Request
    title: str = Field(max_length=200)
    description: str = Field(sa_column=Column(Text))
    consultation_type: str = Field(max_length=50)  # technical, business, compliance, architecture
    urgency: Priority = Field(default=Priority.MEDIUM)
    
    # Problem Context
    problem_domain: str = Field(max_length=100)
    complexity_level: str = Field(max_length=50)  # low, medium, high, expert
    current_approach: Optional[str] = Field(default=None, sa_column=Column(Text))
    attempted_solutions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    specific_challenges: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Required Expertise
    required_skills: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    expertise_areas: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    minimum_experience_years: Optional[int] = Field(default=None, ge=0)
    preferred_experts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Consultation Process
    status: ConsultationStatus = Field(default=ConsultationStatus.REQUESTED, index=True)
    assigned_expert: Optional[str] = Field(default=None, max_length=100, index=True)
    expert_pool: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    consultation_method: str = Field(default="async", max_length=50)  # async, meeting, pair_programming
    
    # Scheduling and Timing
    requested_by: str = Field(max_length=100, index=True)
    requested_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = Field(default=None)
    estimated_hours: Optional[float] = Field(default=None, ge=0)
    scheduled_sessions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Consultation Outcome
    expert_recommendations: Optional[str] = Field(default=None, sa_column=Column(Text))
    solution_approach: Optional[str] = Field(default=None, sa_column=Column(Text))
    implementation_plan: Optional[str] = Field(default=None, sa_column=Column(Text))
    best_practices: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    lessons_learned: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Knowledge Capture
    knowledge_article_id: Optional[str] = Field(default=None, foreign_key="knowledge_base.article_id")
    reusable_patterns: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    templates_created: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    documentation_updates: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality and Feedback
    consultation_quality: Optional[float] = Field(default=None, ge=0, le=10)
    client_satisfaction: Optional[float] = Field(default=None, ge=0, le=10)
    expert_feedback: Optional[str] = Field(default=None, sa_column=Column(Text))
    client_feedback: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Business Impact
    business_value: Optional[str] = Field(default=None, max_length=500)
    cost_savings: Optional[float] = Field(default=None, ge=0)
    risk_mitigation: Optional[str] = Field(default=None, max_length=500)
    innovation_level: Optional[str] = Field(default=None, max_length=50)
    
    # Communication and Collaboration
    communication_log: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    shared_resources: List[Dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))
    meeting_notes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Lifecycle
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    total_hours_spent: Optional[float] = Field(default=None, ge=0)
    
    # Follow-up and Monitoring
    follow_up_required: bool = Field(default=False)
    follow_up_date: Optional[datetime] = Field(default=None)
    success_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    implementation_status: Optional[str] = Field(default=None, max_length=50)
    
    # Relationships
    knowledge_article: Optional[AdvancedKnowledgeBase] = Relationship(back_populates="consultations")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_consultation_rule_status", "rule_id", "status"),
        Index("idx_consultation_expert", "assigned_expert"),
        Index("idx_consultation_requested", "requested_by"),
        Index("idx_consultation_urgency", "urgency"),
    )
    
    class Config:
        arbitrary_types_allowed = True

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class ReviewCreateRequest(BaseModel):
    """Request model for creating reviews."""
    rule_id: int
    title: str
    description: Optional[str] = None
    review_type: str = "code_review"
    scope_areas: Optional[List[str]] = None
    assigned_reviewers: Optional[List[str]] = None
    priority: Priority = Priority.MEDIUM
    due_date: Optional[datetime] = None
    requires_all_approvals: bool = False
    min_approvals_required: int = 1
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Review title cannot be empty")
        return v.strip()

class CommentCreateRequest(BaseModel):
    """Request model for creating comments."""
    rule_id: int
    review_id: Optional[str] = None
    parent_comment_id: Optional[str] = None
    comment_type: CommentType = CommentType.GENERAL
    title: Optional[str] = None
    content: str
    context_type: str = "general"
    context_reference: Optional[str] = None
    is_suggestion: bool = False
    suggested_change: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    
    @validator('content')
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Comment content cannot be empty")
        return v.strip()

class ConsultationRequest(BaseModel):
    """Request model for expert consultations."""
    rule_id: int
    title: str
    description: str
    consultation_type: str = "technical"
    urgency: Priority = Priority.MEDIUM
    problem_domain: str
    required_skills: Optional[List[str]] = None
    expertise_areas: Optional[List[str]] = None
    preferred_experts: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Consultation title cannot be empty")
        return v.strip()

class KnowledgeArticleRequest(BaseModel):
    """Request model for knowledge articles."""
    title: str
    summary: Optional[str] = None
    content: str
    category: str
    subcategory: Optional[str] = None
    article_type: str = "guide"
    expertise_level: ExpertiseLevel = ExpertiseLevel.INTERMEDIATE
    tags: Optional[List[str]] = None
    related_rules: Optional[List[int]] = None
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Article title cannot be empty")
        return v.strip()

class ReviewResponse(BaseModel):
    """Response model for review operations."""
    review_id: str
    rule_id: int
    title: str
    review_type: str
    status: ReviewStatus
    priority: Priority
    requested_by: str
    assigned_reviewers: List[str]
    created_at: datetime
    due_date: Optional[datetime]
    
class CommentResponse(BaseModel):
    """Response model for comment operations."""
    comment_id: str
    rule_id: int
    comment_type: CommentType
    content: str
    author: str
    created_at: datetime
    is_resolved: bool
    upvotes: int
    
class ConsultationResponse(BaseModel):
    """Response model for consultation operations."""
    consultation_id: str
    rule_id: int
    title: str
    consultation_type: str
    status: ConsultationStatus
    urgency: Priority
    requested_by: str
    assigned_expert: Optional[str]
    requested_at: datetime
    
class KnowledgeArticleResponse(BaseModel):
    """Response model for knowledge article operations."""
    article_id: str
    title: str
    category: str
    article_type: str
    author: str
    status: str
    view_count: int
    helpful_votes: int
    created_at: datetime