from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
import json

class WorkspaceType(str, Enum):
    PERSONAL = "personal"
    TEAM = "team"
    PROJECT = "project"
    ORGANIZATION = "organization"
    EXTERNAL = "external"

class DocumentType(str, Enum):
    NOTEBOOK = "notebook"
    DASHBOARD = "dashboard"
    REPORT = "report"
    ANALYSIS = "analysis"
    DATASET = "dataset"
    MODEL = "model"
    WORKFLOW = "workflow"
    DOCUMENTATION = "documentation"

class CollaborationRole(str, Enum):
    VIEWER = "viewer"
    CONTRIBUTOR = "contributor"
    EDITOR = "editor"
    ADMIN = "admin"
    OWNER = "owner"

class Workspace(SQLModel, table=True):
    """Advanced collaborative workspace"""
    __tablename__ = "workspaces"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    workspace_type: WorkspaceType = Field(default=WorkspaceType.TEAM)
    
    # Ownership and access
    owner_id: str = Field(index=True)
    organization_id: Optional[str] = Field(index=True)
    is_public: bool = Field(default=False)
    is_archived: bool = Field(default=False)
    
    # Advanced features
    ai_assistance_enabled: bool = Field(default=True)
    auto_versioning: bool = Field(default=True)
    real_time_collaboration: bool = Field(default=True)
    version_control_integration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Governance and compliance
    data_governance_policy: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    security_classification: str = Field(default="internal")  # public, internal, confidential, restricted
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    retention_policy_days: Optional[int] = None
    
    # Analytics and insights
    usage_analytics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    productivity_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    collaboration_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Integration settings
    external_integrations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    webhook_urls: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    api_access_enabled: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    members: List["WorkspaceMember"] = Relationship(back_populates="workspace")
    documents: List["CollaborativeDocument"] = Relationship(back_populates="workspace")
    discussions: List["Discussion"] = Relationship(back_populates="workspace")

class WorkspaceMember(SQLModel, table=True):
    """Workspace membership and roles"""
    __tablename__ = "workspace_members"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    user_id: str = Field(index=True)
    role: CollaborationRole = Field(default=CollaborationRole.CONTRIBUTOR)
    
    # Permissions
    can_invite: bool = Field(default=False)
    can_manage_data: bool = Field(default=False)
    can_export: bool = Field(default=False)
    can_delete: bool = Field(default=False)
    custom_permissions: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Activity tracking
    last_active: datetime = Field(default_factory=datetime.now)
    contributions_count: int = Field(default=0)
    time_spent_minutes: int = Field(default=0)
    
    # Preferences
    notification_preferences: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    workspace_preferences: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    joined_at: datetime = Field(default_factory=datetime.now)
    invited_by: Optional[str] = None
    
    # Relationships
    workspace: Optional["Workspace"] = Relationship(back_populates="members")

class CollaborationSession(SQLModel, table=True):
    """Real-time collaboration session model"""
    __tablename__ = "racine_collaboration_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(unique=True, index=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    
    # Session details
    session_name: str
    session_type: str  # e.g., "document_collaboration", "meeting", "workshop"
    description: Optional[str] = None
    
    # Status and timing
    status: str = Field(default="active")  # active, paused, ended
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None
    last_activity: datetime = Field(default_factory=datetime.now)
    
    # Session configuration
    session_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    max_participants: Optional[int] = None
    is_private: bool = Field(default=False)
    
    # Active content
    active_documents: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    current_activities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata
    session_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class SessionParticipant(SQLModel, table=True):
    """Session participant tracking"""
    __tablename__ = "racine_collaboration_participants"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="racine_collaboration_sessions.id", index=True)
    user_id: str = Field(index=True)
    
    # Participation details
    role: str = Field(default="participant")  # host, presenter, participant, observer
    joined_at: datetime = Field(default_factory=datetime.now)
    left_at: Optional[datetime] = None
    is_active: bool = Field(default=True)
    
    # Activity tracking
    last_activity: datetime = Field(default_factory=datetime.now)
    contributions_count: int = Field(default=0)
    time_spent_minutes: int = Field(default=0)
    
    # Permissions in session
    can_edit: bool = Field(default=True)
    can_share: bool = Field(default=True)
    can_record: bool = Field(default=False)
    
    # Metadata
    participant_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))


class CollaborativeDocument(SQLModel, table=True):
    """Advanced collaborative documents with real-time editing"""
    __tablename__ = "collaborative_documents"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    name: str = Field(index=True)
    document_type: DocumentType = Field(default=DocumentType.NOTEBOOK)
    
    # Content and versioning
    content: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    content_format: str = Field(default="json")  # json, markdown, jupyter, sql
    version: str = Field(default="1.0.0")
    is_template: bool = Field(default=False)
    
    # Authorship and editing
    created_by: str = Field(index=True)
    last_edited_by: str = Field(index=True)
    current_editors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    edit_lock: Optional[str] = None  # user_id who has edit lock
    
    # Advanced collaboration features
    real_time_cursors: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    comments: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    suggestions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    change_tracking: bool = Field(default=True)
    
    # AI-powered features
    ai_insights: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    auto_completion_enabled: bool = Field(default=True)
    smart_suggestions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Data lineage and dependencies
    data_sources: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    dependencies: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    output_artifacts: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality and governance
    quality_score: Optional[float] = Field(ge=0.0, le=1.0)
    review_status: str = Field(default="draft")  # draft, review, approved, published
    reviewed_by: Optional[str] = None
    review_comments: Optional[str] = None
    
    # Publishing and sharing
    is_published: bool = Field(default=False)
    published_url: Optional[str] = None
    sharing_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    access_count: int = Field(default=0)
    
    # Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    document_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_accessed: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workspace: Optional["Workspace"] = Relationship(back_populates="documents")
    versions: List["DocumentVersion"] = Relationship(back_populates="document")

class DocumentVersion(SQLModel, table=True):
    """Document version history and change tracking"""
    __tablename__ = "document_versions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="collaborative_documents.id", index=True)
    version: str
    
    # Version details
    content: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    change_summary: str
    author: str = Field(index=True)
    
    # Change tracking
    changes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    lines_added: int = Field(default=0)
    lines_removed: int = Field(default=0)
    files_changed: int = Field(default=0)
    
    # Review and approval
    is_major_version: bool = Field(default=False)
    approved_by: Optional[str] = None
    approval_date: Optional[datetime] = None
    
    # Metadata
    commit_message: Optional[str] = None
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    document: Optional["CollaborativeDocument"] = Relationship(back_populates="versions")

class Discussion(SQLModel, table=True):
    """Discussion threads and knowledge sharing"""
    __tablename__ = "discussions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    title: str
    
    # Discussion metadata
    discussion_type: str = Field(default="general")  # general, question, announcement, idea
    category: Optional[str] = None
    priority: str = Field(default="medium")  # low, medium, high, urgent
    
    # Content
    content: str
    author: str = Field(index=True)
    
    # Status and resolution
    status: str = Field(default="open")  # open, resolved, closed, archived
    resolved_by: Optional[str] = None
    resolution: Optional[str] = None
    
    # Engagement
    views_count: int = Field(default=0)
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    is_pinned: bool = Field(default=False)
    
    # AI features
    ai_summary: Optional[str] = None
    sentiment_score: Optional[float] = Field(ge=-1.0, le=1.0)
    topic_classification: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Related content
    related_documents: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    related_data_sources: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workspace: Optional["Workspace"] = Relationship(back_populates="discussions")
    replies: List["DiscussionReply"] = Relationship(back_populates="discussion")

class DiscussionReply(SQLModel, table=True):
    """Replies to discussion threads"""
    __tablename__ = "discussion_replies"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    discussion_id: int = Field(foreign_key="discussions.id", index=True)
    parent_reply_id: Optional[int] = Field(foreign_key="discussion_replies.id")
    
    # Content
    content: str
    author: str = Field(index=True)
    
    # Formatting and attachments
    content_format: str = Field(default="markdown")
    attachments: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    code_snippets: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Engagement
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    is_solution: bool = Field(default=False)
    is_helpful: bool = Field(default=False)
    
    # AI features
    sentiment_score: Optional[float] = Field(ge=-1.0, le=1.0)
    relevance_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    discussion: Optional["Discussion"] = Relationship(back_populates="replies")

class KnowledgeBase(SQLModel, table=True):
    """Organizational knowledge base and documentation"""
    __tablename__ = "knowledge_base"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    content: str
    
    # Classification
    category: str = Field(index=True)
    subcategory: Optional[str] = None
    knowledge_type: str = Field(default="documentation")  # documentation, faq, tutorial, best_practice
    
    # Authorship
    author: str = Field(index=True)
    maintainer: Optional[str] = None
    contributors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality and validation
    accuracy_score: Optional[float] = Field(ge=0.0, le=1.0)
    freshness_score: Optional[float] = Field(ge=0.0, le=1.0)
    usage_frequency: int = Field(default=0)
    feedback_score: Optional[float] = Field(ge=0.0, le=5.0)
    
    # AI-powered features
    auto_generated: bool = Field(default=False)
    ai_confidence: Optional[float] = Field(ge=0.0, le=1.0)
    semantic_embeddings: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    related_topics: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Access and sharing
    is_public: bool = Field(default=False)
    access_level: str = Field(default="organization")  # public, organization, team, private
    view_count: int = Field(default=0)
    
    # Version control
    version: str = Field(default="1.0.0")
    last_reviewed: Optional[datetime] = None
    review_due_date: Optional[datetime] = None
    
    # Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    knowledge_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_accessed: datetime = Field(default_factory=datetime.now)

class CollaborationEvent(SQLModel, table=True):
    """Real-time collaboration events and activity feed"""
    __tablename__ = "collaboration_events"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    user_id: str = Field(index=True)
    
    # Event details
    event_type: str = Field(index=True)  # document_edited, comment_added, user_joined, etc.
    entity_type: str  # document, discussion, workspace, member
    entity_id: int
    
    # Event data
    action: str
    description: str
    event_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Real-time features
    is_real_time: bool = Field(default=True)
    broadcast_to_users: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    notification_sent: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workspace: Optional["Workspace"] = Relationship()