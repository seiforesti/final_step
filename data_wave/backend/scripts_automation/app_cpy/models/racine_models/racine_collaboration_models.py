"""
Racine Collaboration Models
===========================

Advanced collaboration models for master collaboration system with real-time features,
cross-group workflow collaboration, and comprehensive team coordination across all 7 groups.

These models provide:
- Real-time collaboration and co-authoring
- Cross-group workflow collaboration and coordination
- Team communication and messaging
- Document collaboration and version control
- Expert consultation networks
- Knowledge sharing platforms
- Collaboration analytics and insights
- Integration with all existing group services

All models are designed for enterprise-grade scalability, performance, and security.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, Float, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
import enum
from typing import Dict, List, Any, Optional

from ..db_models import Base
from ..auth_models import User
from .racine_orchestration_models import RacineOrchestrationMaster


class CollaborationType(enum.Enum):
    """Collaboration type enumeration"""
    WORKFLOW_COLLABORATION = "workflow_collaboration"
    DOCUMENT_COLLABORATION = "document_collaboration"
    PROJECT_COLLABORATION = "project_collaboration"
    EXPERT_CONSULTATION = "expert_consultation"
    KNOWLEDGE_SHARING = "knowledge_sharing"
    TEAM_COMMUNICATION = "team_communication"
    CROSS_GROUP_COORDINATION = "cross_group_coordination"
    REAL_TIME_EDITING = "real_time_editing"


class CollaborationStatus(enum.Enum):
    """Collaboration status enumeration"""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"
    ARCHIVED = "archived"


class MessageType(enum.Enum):
    """Message type enumeration"""
    TEXT = "text"
    MEDIA = "media"
    DOCUMENT = "document"
    CODE = "code"
    WORKFLOW = "workflow"
    ANNOTATION = "annotation"
    SYSTEM = "system"
    NOTIFICATION = "notification"


class ParticipantRole(enum.Enum):
    """Participant role enumeration"""
    OWNER = "owner"
    ADMIN = "admin"
    CONTRIBUTOR = "contributor"
    REVIEWER = "reviewer"
    OBSERVER = "observer"
    EXPERT = "expert"
    GUEST = "guest"


class RacineCollaboration(Base):
    """
    Master collaboration model for comprehensive collaboration management
    with cross-group coordination and real-time features.
    """
    __tablename__ = 'racine_collaborations'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Collaboration basic information
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    collaboration_type = Column(SQLEnum(CollaborationType), nullable=False, index=True)
    status = Column(SQLEnum(CollaborationStatus), default=CollaborationStatus.ACTIVE, index=True)
    
    # Collaboration scope and context
    scope_definition = Column(JSON)  # Collaboration scope definition
    objectives = Column(JSON)  # Collaboration objectives
    success_criteria = Column(JSON)  # Success criteria
    deliverables = Column(JSON)  # Expected deliverables
    
    # Cross-group collaboration
    involved_groups = Column(JSON)  # Groups involved in collaboration
    group_responsibilities = Column(JSON)  # Responsibilities per group
    cross_group_workflows = Column(JSON)  # Cross-group workflows
    coordination_requirements = Column(JSON)  # Coordination requirements
    
    # Real-time collaboration features
    real_time_enabled = Column(Boolean, default=True)
    co_authoring_enabled = Column(Boolean, default=True)
    live_cursors_enabled = Column(Boolean, default=True)
    presence_tracking_enabled = Column(Boolean, default=True)
    
    # Communication configuration
    communication_channels = Column(JSON)  # Communication channels
    notification_settings = Column(JSON)  # Notification settings
    escalation_rules = Column(JSON)  # Escalation rules
    
    # Access control and permissions
    access_level = Column(String, default="private")  # private, team, organization, public
    join_policy = Column(String, default="invite_only")  # open, invite_only, approval_required
    permissions_config = Column(JSON)  # Permissions configuration
    external_participants_allowed = Column(Boolean, default=False)
    
    # Document and resource management
    shared_documents = Column(JSON)  # Shared documents
    shared_resources = Column(JSON)  # Shared resources
    version_control_enabled = Column(Boolean, default=True)
    document_locking_enabled = Column(Boolean, default=True)
    
    # Workflow integration
    integrated_workflows = Column(JSON)  # Integrated workflows
    workflow_permissions = Column(JSON)  # Workflow permissions
    workflow_notifications = Column(JSON)  # Workflow notifications
    
    # Analytics and tracking
    analytics_enabled = Column(Boolean, default=True)
    activity_tracking_enabled = Column(Boolean, default=True)
    performance_metrics = Column(JSON)  # Performance metrics
    engagement_metrics = Column(JSON)  # Engagement metrics
    
    # Timeline and milestones
    start_date = Column(DateTime, default=datetime.utcnow)
    target_end_date = Column(DateTime)
    actual_end_date = Column(DateTime)
    milestones = Column(JSON)  # Project milestones
    
    # Expert network integration
    expert_consultation_enabled = Column(Boolean, default=False)
    expert_categories = Column(JSON)  # Expert categories needed
    consultation_history = Column(JSON)  # Consultation history
    
    # Knowledge sharing
    knowledge_base_integration = Column(JSON)  # Knowledge base integration
    learning_objectives = Column(JSON)  # Learning objectives
    knowledge_artifacts = Column(JSON)  # Generated knowledge artifacts
    
    # Integration with orchestration
    orchestration_master_id = Column(String, ForeignKey('racine_orchestration_master.id'))
    
    # Audit and tracking fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = relationship("User")
    orchestration_master = relationship("RacineOrchestrationMaster")
    participants = relationship("RacineCollaborationParticipant", back_populates="collaboration", cascade="all, delete-orphan")
    sessions = relationship("RacineCollaborationSession", back_populates="collaboration", cascade="all, delete-orphan")
    messages = relationship("RacineCollaborationMessage", back_populates="collaboration", cascade="all, delete-orphan")
    documents = relationship("RacineCollaborationDocument", back_populates="collaboration", cascade="all, delete-orphan")


class RacineCollaborationParticipant(Base):
    """
    Collaboration participant model for managing team members
    and their roles in collaborations.
    """
    __tablename__ = 'racine_collaboration_participants'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Participant information
    role = Column(SQLEnum(ParticipantRole), nullable=False)
    status = Column(String, default="active")  # active, inactive, pending, blocked
    invitation_status = Column(String, default="accepted")  # pending, accepted, declined
    
    # Permissions and access
    permissions = Column(JSON)  # Specific permissions for this participant
    access_level = Column(String, default="standard")  # standard, elevated, restricted
    group_access = Column(JSON)  # Access to specific groups
    
    # Participation tracking (augmented)
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    activity_level = Column(String, default="medium")  # low, medium, high
    contribution_score = Column(Float, default=0.0)
    connection_status = Column(String, default="disconnected")
    
    # Expertise and specialization
    expertise_areas = Column(JSON)  # Areas of expertise
    specializations = Column(JSON)  # Specializations
    preferred_groups = Column(JSON)  # Preferred groups to work with
    
    # Communication preferences
    notification_preferences = Column(JSON)  # Notification preferences
    communication_preferences = Column(JSON)  # Communication preferences
    availability_schedule = Column(JSON)  # Availability schedule
    
    # Performance and analytics
    contributions = Column(JSON)  # Contributions made
    feedback_received = Column(JSON)  # Feedback received
    peer_ratings = Column(JSON)  # Peer ratings
    
    # Collaboration and user references (augmented)
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), nullable=False)
    session_id = Column(String, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    invited_by = Column(String, ForeignKey('users.id'))
    
    # Relationships
    collaboration = relationship("RacineCollaboration", back_populates="participants")
    user = relationship("User", foreign_keys=[user_id])
    inviter = relationship("User", foreign_keys=[invited_by])


class RacineCollaborationSession(Base):
    """
    Collaboration session model for tracking real-time collaboration sessions
    and presence information.
    """
    __tablename__ = 'racine_collaboration_sessions'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Session information (augmented for service compatibility)
    session_name = Column(String, index=True)
    name = Column(String, index=True)
    session_type = Column(String, nullable=False)  # meeting, workshop, review, brainstorm
    collaboration_type = Column(String, index=True)
    scope = Column(String, index=True)
    status = Column(String, default="active", index=True)
    description = Column(Text)
    
    # Session timing
    scheduled_start = Column(DateTime)
    actual_start = Column(DateTime)
    scheduled_end = Column(DateTime)
    actual_end = Column(DateTime)
    duration_minutes = Column(Integer)
    
    # Session configuration
    session_config = Column(JSON)  # Session configuration
    recording_enabled = Column(Boolean, default=False)
    transcription_enabled = Column(Boolean, default=False)
    screen_sharing_enabled = Column(Boolean, default=True)
    
    # Participants and presence
    expected_participants = Column(JSON)  # Expected participants
    actual_participants = Column(JSON)  # Actual participants
    presence_data = Column(JSON)  # Real-time presence data
    attendance_summary = Column(JSON)  # Attendance summary
    
    # Content and activities
    agenda = Column(JSON)  # Session agenda
    activities = Column(JSON)  # Activities during session
    decisions_made = Column(JSON)  # Decisions made
    action_items = Column(JSON)  # Action items generated
    
    # Cross-group coordination
    group_representatives = Column(JSON)  # Group representatives
    cross_group_discussions = Column(JSON)  # Cross-group discussions
    coordination_outcomes = Column(JSON)  # Coordination outcomes
    
    # Documentation and outputs
    session_notes = Column(Text)  # Session notes
    recordings = Column(JSON)  # Session recordings
    transcriptions = Column(Text)  # Session transcriptions
    artifacts_created = Column(JSON)  # Artifacts created during session
    
    # Quality and feedback
    quality_rating = Column(Float)  # Session quality rating
    participant_feedback = Column(JSON)  # Participant feedback
    effectiveness_score = Column(Float)  # Session effectiveness score
    
    # Follow-up and continuity
    follow_up_actions = Column(JSON)  # Follow-up actions
    next_session_planned = Column(Boolean, default=False)
    next_session_date = Column(DateTime)
    
    # Collaboration reference
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), nullable=False)
    facilitator_id = Column(String, ForeignKey('users.id'))
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    collaboration = relationship("RacineCollaboration", back_populates="sessions")
    facilitator = relationship("User")


class RacineCollaborationMessage(Base):
    """
    Collaboration message model for team communication
    and threaded discussions.
    """
    __tablename__ = 'racine_collaboration_messages'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Message content (augmented)
    message_type = Column(SQLEnum(MessageType), nullable=False)
    content = Column(Text, nullable=False)
    formatted_content = Column(Text)  # Rich text formatted content
    attachments = Column(JSON)  # Message attachments
    message_metadata = Column(JSON)
    status = Column(String, default="sent", index=True)
    
    # Message context
    thread_id = Column(String, index=True)  # Thread ID for threaded discussions
    parent_message_id = Column(String, ForeignKey('racine_collaboration_messages.id'))
    subject = Column(String)  # Message subject
    tags = Column(JSON)  # Message tags
    
    # Cross-group context
    related_groups = Column(JSON)  # Related groups
    group_mentions = Column(JSON)  # Group mentions
    workflow_references = Column(JSON)  # Workflow references
    resource_references = Column(JSON)  # Resource references
    
    # Message metadata
    priority = Column(String, default="normal")  # low, normal, high, urgent
    is_announcement = Column(Boolean, default=False)
    is_confidential = Column(Boolean, default=False)
    requires_response = Column(Boolean, default=False)
    
    # Interaction tracking
    read_by = Column(JSON)  # Users who have read the message
    reactions = Column(JSON)  # Message reactions
    mentions = Column(JSON)  # User mentions in message
    replies_count = Column(Integer, default=0)
    
    # AI and automation
    ai_generated = Column(Boolean, default=False)
    ai_suggestions = Column(JSON)  # AI-generated suggestions
    auto_translation = Column(JSON)  # Auto-translation data
    sentiment_score = Column(Float)  # Sentiment analysis score
    
    # Moderation and compliance
    moderation_status = Column(String, default="approved")  # pending, approved, flagged
    compliance_flags = Column(JSON)  # Compliance flags
    moderation_notes = Column(Text)  # Moderation notes
    
    # Edit history
    edit_history = Column(JSON)  # Edit history
    last_edited_at = Column(DateTime)
    last_edited_by = Column(String, ForeignKey('users.id'))
    
    # Collaboration reference
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), nullable=False)
    sender_id = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Timing
    sent_at = Column(DateTime, default=datetime.utcnow, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    collaboration = relationship("RacineCollaboration", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    editor = relationship("User", foreign_keys=[last_edited_by])
    parent_message = relationship("RacineCollaborationMessage", remote_side=[id])
    replies = relationship("RacineCollaborationMessage", back_populates="parent_message")
    # Session reference (augmented)
    session_id = Column(String, index=True)


class RacineCollaborationDocument(Base):
    """
    Collaboration document model for shared document management
    with version control and real-time editing.
    """
    __tablename__ = 'racine_collaboration_documents'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Document basic information (augmented)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    document_type = Column(String, nullable=False)  # text, spreadsheet, presentation, code, workflow
    file_extension = Column(String)
    status = Column(String, default="active", index=True)
    
    # Document content and storage
    content = Column(Text)  # Document content
    content_format = Column(String, default="plain_text")  # plain_text, markdown, html, json
    file_path = Column(String)  # File storage path
    file_size = Column(Integer)  # File size in bytes
    
    # Version control
    version = Column(String, default="1.0.0")
    current_version = Column(String, default="1.0.0")
    version_history = Column(JSON)  # Version history
    is_current_version = Column(Boolean, default=True, index=True)
    parent_version_id = Column(String, ForeignKey('racine_collaboration_documents.id'))
    
    # Real-time collaboration
    real_time_editing_enabled = Column(Boolean, default=True)
    current_editors = Column(JSON)  # Currently editing users
    edit_locks = Column(JSON)  # Edit locks on document sections
    operational_transforms = Column(JSON)  # Operational transform history
    
    # Access control
    access_level = Column(String, default="collaboration")  # private, collaboration, public
    edit_permissions = Column(JSON)  # Edit permissions
    view_permissions = Column(JSON)  # View permissions
    download_permissions = Column(JSON)  # Download permissions
    
    # Cross-group integration
    related_groups = Column(JSON)  # Related groups
    group_sections = Column(JSON)  # Group-specific sections
    cross_group_references = Column(JSON)  # Cross-group references
    workflow_integration = Column(JSON)  # Workflow integration
    
    # Document metadata
    tags = Column(JSON)  # Document tags
    categories = Column(JSON)  # Document categories
    keywords = Column(JSON)  # Keywords for search
    custom_metadata = Column(JSON)  # Custom metadata
    
    # Review and approval
    review_status = Column(String, default="draft")  # draft, under_review, approved, rejected
    reviewers = Column(JSON)  # Document reviewers
    approval_workflow = Column(JSON)  # Approval workflow
    review_comments = Column(JSON)  # Review comments
    
    # Analytics and tracking
    view_count = Column(Integer, default=0)
    edit_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    last_accessed = Column(DateTime)
    
    # AI and automation
    ai_suggestions = Column(JSON)  # AI-generated suggestions
    auto_saved_versions = Column(JSON)  # Auto-saved versions
    smart_formatting = Column(Boolean, default=False)
    
    # Collaboration reference (augmented)
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), nullable=False)
    session_id = Column(String, index=True)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    last_modified_by = Column(String, ForeignKey('users.id'))
    
    # Relationships
    collaboration = relationship("RacineCollaboration", back_populates="documents")
    creator = relationship("User", foreign_keys=[created_by])
    last_modifier = relationship("User", foreign_keys=[last_modified_by])
    parent_version = relationship("RacineCollaborationDocument", remote_side=[id])
    document_edits = relationship("RacineCollaborationDocumentEdit", back_populates="document", cascade="all, delete-orphan")


class RacineCollaborationDocumentEdit(Base):
    """
    Document edit tracking model for detailed change history
    and real-time collaboration support.
    """
    __tablename__ = 'racine_collaboration_document_edits'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Edit information
    edit_type = Column(String, nullable=False)  # insert, delete, replace, format
    operation_data = Column(JSON, nullable=False)  # Operational transform data
    content_delta = Column(JSON)  # Content changes delta
    
    # Edit context
    section_id = Column(String)  # Document section ID
    start_position = Column(Integer)  # Start position of edit
    end_position = Column(Integer)  # End position of edit
    affected_lines = Column(JSON)  # Affected line numbers
    
    # Change details
    previous_content = Column(Text)  # Previous content
    new_content = Column(Text)  # New content
    change_summary = Column(Text)  # Summary of changes
    
    # Collaboration context
    edit_session_id = Column(String)  # Real-time edit session ID
    collaborative_edit = Column(Boolean, default=False)  # Part of collaborative edit
    conflict_resolution = Column(JSON)  # Conflict resolution data
    
    # Review and approval
    needs_review = Column(Boolean, default=False)
    reviewed_by = Column(String, ForeignKey('users.id'))
    reviewed_at = Column(DateTime)
    review_status = Column(String, default="pending")  # pending, approved, rejected
    
    # Document and user references
    document_id = Column(String, ForeignKey('racine_collaboration_documents.id'), nullable=False)
    editor_id = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Timing
    edit_timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    document = relationship("RacineCollaborationDocument", back_populates="document_edits")
    editor = relationship("User", foreign_keys=[editor_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class RacineExpertConsultation(Base):
    """
    Expert consultation model for connecting teams with domain experts
    and managing expert advisory networks.
    """
    __tablename__ = 'racine_expert_consultations'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Consultation request information
    consultation_title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    expertise_required = Column(JSON)  # Required expertise areas
    urgency = Column(String, default="medium")  # low, medium, high, critical
    
    # Request details
    problem_statement = Column(Text)  # Detailed problem statement
    context_information = Column(JSON)  # Context information
    expected_outcomes = Column(JSON)  # Expected outcomes
    time_constraints = Column(JSON)  # Time constraints
    
    # Cross-group context
    related_groups = Column(JSON)  # Related groups
    group_specific_questions = Column(JSON)  # Group-specific questions
    cross_group_implications = Column(JSON)  # Cross-group implications
    
    # Expert matching
    matched_experts = Column(JSON)  # Matched experts
    expert_selection_criteria = Column(JSON)  # Expert selection criteria
    matching_algorithm_used = Column(String)  # Matching algorithm
    matching_confidence = Column(Float)  # Matching confidence score
    
    # Consultation execution
    consultation_format = Column(String, default="discussion")  # discussion, review, workshop
    scheduled_sessions = Column(JSON)  # Scheduled consultation sessions
    consultation_materials = Column(JSON)  # Materials provided to expert
    
    # Expert feedback and recommendations
    expert_recommendations = Column(JSON)  # Expert recommendations
    expert_assessment = Column(JSON)  # Expert assessment
    follow_up_recommendations = Column(JSON)  # Follow-up recommendations
    knowledge_transfer = Column(JSON)  # Knowledge transfer outcomes
    
    # Quality and satisfaction
    consultation_rating = Column(Float)  # Consultation quality rating
    expert_rating = Column(Float)  # Expert performance rating
    client_satisfaction = Column(Float)  # Client satisfaction rating
    effectiveness_score = Column(Float)  # Overall effectiveness
    
    # Status tracking
    status = Column(String, default="requested")  # requested, matched, scheduled, in_progress, completed, cancelled
    resolution_status = Column(String)  # resolved, partially_resolved, unresolved
    completion_date = Column(DateTime)
    
    # Collaboration and expert references
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'))
    requester_id = Column(String, ForeignKey('users.id'), nullable=False)
    assigned_expert_id = Column(String, ForeignKey('users.id'))
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    collaboration = relationship("RacineCollaboration")
    requester = relationship("User", foreign_keys=[requester_id])
    assigned_expert = relationship("User", foreign_keys=[assigned_expert_id])


class RacineKnowledgeSharing(Base):
    """
    Knowledge sharing model for capturing and distributing knowledge
    generated through collaborations.
    """
    __tablename__ = 'racine_knowledge_sharing'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Knowledge artifact information
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    knowledge_type = Column(String, nullable=False)  # best_practice, lesson_learned, solution, process
    content_format = Column(String, default="document")  # document, video, interactive, code
    
    # Knowledge content
    content = Column(Text)  # Knowledge content
    structured_content = Column(JSON)  # Structured knowledge content
    attachments = Column(JSON)  # Knowledge attachments
    multimedia_content = Column(JSON)  # Multimedia content
    
    # Knowledge context
    domain_areas = Column(JSON)  # Domain areas covered
    applicable_groups = Column(JSON)  # Groups where knowledge applies
    use_cases = Column(JSON)  # Use cases and applications
    prerequisites = Column(JSON)  # Prerequisites for understanding
    
    # Source and attribution
    source_collaboration = Column(JSON)  # Source collaboration
    contributors = Column(JSON)  # Knowledge contributors
    expert_validation = Column(JSON)  # Expert validation
    peer_review = Column(JSON)  # Peer review information
    
    # Quality and validation
    quality_score = Column(Float, default=0.0)  # Knowledge quality score
    validation_status = Column(String, default="pending")  # pending, validated, disputed
    accuracy_rating = Column(Float)  # Accuracy rating
    completeness_score = Column(Float)  # Completeness score
    
    # Usage and impact
    usage_count = Column(Integer, default=0)
    success_stories = Column(JSON)  # Success stories
    impact_metrics = Column(JSON)  # Impact metrics
    feedback_summary = Column(JSON)  # Feedback summary
    
    # Access and sharing
    visibility = Column(String, default="organization")  # private, team, organization, public
    sharing_restrictions = Column(JSON)  # Sharing restrictions
    access_requirements = Column(JSON)  # Access requirements
    
    # Knowledge evolution
    version = Column(String, default="1.0.0")
    update_history = Column(JSON)  # Update history
    related_knowledge = Column(JSON)  # Related knowledge items
    superseded_by = Column(String, ForeignKey('racine_knowledge_sharing.id'))
    
    # Collaboration reference
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'))
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    collaboration = relationship("RacineCollaboration")
    creator = relationship("User")
    superseding_knowledge = relationship("RacineKnowledgeSharing", remote_side=[id])


class RacineCollaborationAnalytics(Base):
    """
    Collaboration analytics model for tracking collaboration effectiveness
    and generating insights.
    """
    __tablename__ = 'racine_collaboration_analytics'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Analytics basic information
    analytics_type = Column(String, nullable=False, index=True)  # participation, effectiveness, outcome
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String)
    
    # Analytics data
    analytics_data = Column(JSON)  # Detailed analytics data
    context_data = Column(JSON)  # Context information
    calculation_method = Column(String)  # Calculation method used
    
    # Participation analytics
    participant_engagement = Column(JSON)  # Participant engagement metrics
    communication_patterns = Column(JSON)  # Communication patterns
    contribution_distribution = Column(JSON)  # Contribution distribution
    
    # Effectiveness analytics
    goal_achievement = Column(Float)  # Goal achievement percentage
    timeline_adherence = Column(Float)  # Timeline adherence
    quality_metrics = Column(JSON)  # Quality metrics
    innovation_index = Column(Float)  # Innovation index
    
    # Cross-group analytics
    cross_group_interactions = Column(JSON)  # Cross-group interactions
    coordination_effectiveness = Column(Float)  # Coordination effectiveness
    knowledge_transfer_metrics = Column(JSON)  # Knowledge transfer metrics
    
    # Collaboration reference (augmented)
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), nullable=False)
    session_id = Column(String, index=True)
    
    # Temporal information
    measurement_period_start = Column(DateTime)
    measurement_period_end = Column(DateTime)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    collaboration = relationship("RacineCollaboration")


class RacineCollaborationAudit(Base):
    """
    Comprehensive audit trail for collaboration operations.
    """
    __tablename__ = 'racine_collaboration_audit'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Audit event information
    event_type = Column(String, nullable=False, index=True)  # created, joined, contributed, completed
    event_description = Column(Text)
    event_data = Column(JSON)  # Detailed event data
    
    # Context information
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'))
    user_id = Column(String, ForeignKey('users.id'))
    session_id = Column(String)
    
    # Change tracking
    changes_made = Column(JSON)  # Detailed changes made
    previous_values = Column(JSON)  # Previous values
    new_values = Column(JSON)  # New values
    
    # System information
    ip_address = Column(String)
    user_agent = Column(String)
    device_info = Column(JSON)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    collaboration = relationship("RacineCollaboration")
    user = relationship("User")


# Added models to match service imports
class RacineCollaborationWorkflow(Base):
    __tablename__ = 'racine_collaboration_workflows'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, index=True, nullable=False)
    workflow_type = Column(String, default="general", index=True)
    workflow_definition = Column(JSON)
    collaboration_rules = Column(JSON)
    approval_workflow = Column(JSON)
    task_assignments = Column(JSON)
    status = Column(String, default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RacineCollaborationComment(Base):
    __tablename__ = 'racine_collaboration_comments'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, index=True, nullable=False)
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'))
    target_type = Column(String, index=True)
    target_id = Column(String, index=True)
    author_id = Column(String, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    mentions = Column(JSON)
    comment_metadata = Column(JSON)
    status = Column(String, default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RacineCollaborationNotification(Base):
    __tablename__ = 'racine_collaboration_notifications'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, index=True)
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'))
    target_user_id = Column(String, ForeignKey('users.id'), index=True)
    event_type = Column(String, index=True)
    payload = Column(JSON)
    delivery_channels = Column(JSON)
    delivery_status = Column(String, default="pending", index=True)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    delivered_at = Column(DateTime)


class RacineCollaborationSpace(Base):
    __tablename__ = 'racine_collaboration_spaces'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), nullable=False)
    name = Column(String, index=True)
    description = Column(Text)
    space_type = Column(String, default="channel", index=True)
    visibility = Column(String, default="private")
    participant_ids = Column(JSON)
    settings = Column(JSON)
    status = Column(String, default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RacineExpertNetwork(Base):
    __tablename__ = 'racine_expert_network'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, index=True)
    expert_user_id = Column(String, ForeignKey('users.id'), index=True)
    expertise_areas = Column(JSON)
    availability_status = Column(String, default="available", index=True)
    consultation_history = Column(JSON)
    rating = Column(Float, default=0.0)
    specializations = Column(JSON)
    status = Column(String, default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class RacineKnowledgeBase(Base):
    __tablename__ = 'racine_knowledge_base'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), index=True)
    session_id = Column(String, index=True)
    entry_type = Column(String, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    knowledge_metadata = Column(JSON)
    tags = Column(JSON)
    status = Column(String, default="published", index=True)
    created_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RacineExternalCollaborator(Base):
    __tablename__ = 'racine_external_collaborators'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    collaboration_id = Column(String, ForeignKey('racine_collaborations.id'), index=True)
    external_id = Column(String, index=True)
    identity_provider = Column(String, index=True)
    display_name = Column(String)
    email = Column(String, index=True)
    role = Column(String, default="guest", index=True)
    access_scopes = Column(JSON)
    invite_status = Column(String, default="pending", index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)