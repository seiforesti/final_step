"""
Racine AI Assistant Models
===========================

Advanced AI assistant models for context-aware assistance with comprehensive 
cross-group intelligence across all 7 groups.

These models provide:
- Context-aware AI conversation tracking and management
- Cross-group intelligent recommendations and insights
- Natural language processing and understanding
- Continuous learning and adaptation
- Proactive guidance and automation
- AI-driven workflow and pipeline optimization
- Knowledge discovery and analytics
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


# =========================
# Service-aligned Enumerations
# =========================

class ConversationType(str, enum.Enum):
    """Conversation type expected by services (aligned with RacineAIService usage)."""
    GENERAL = "general"
    SUPPORT = "support"
    ANALYSIS = "analysis"
    OPTIMIZATION = "optimization"
    DATA_DISCOVERY = "data_discovery"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"
    TROUBLESHOOTING = "troubleshooting"


class MessageType(str, enum.Enum):
    """Message type expected by services."""
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"
    ACTION = "action"
    SYSTEM = "system"


class MessageStatus(str, enum.Enum):
    """Message delivery/processing status."""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class RecommendationType(str, enum.Enum):
    """Recommendation categories aligned with service usage."""
    PERFORMANCE = "performance"
    COST = "cost"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    WORKFLOW = "workflow"
    DATA_QUALITY = "data_quality"
    RESOURCE = "resource"
    PROCESS = "process"
    ANOMALY = "anomaly"
    BEST_PRACTICE = "best_practice"


class InsightType(str, enum.Enum):
    """Insight categories aligned with service usage."""
    PERFORMANCE = "performance"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    OPTIMIZATION = "optimization"
    TREND = "trend"
    PATTERN = "pattern"
    ANOMALY = "anomaly"
    PREDICTIVE = "predictive"
    CORRELATION = "correlation"
    USAGE = "usage"
    RISK = "risk"
    OPPORTUNITY = "opportunity"
    CROSS_GROUP = "cross_group"


class LearningType(str, enum.Enum):
    """Learning types aligned with service usage."""
    USER_FEEDBACK = "user_feedback"
    USER_INTERACTION = "user_interaction"
    SYSTEM_BEHAVIOR = "system_behavior"
    PERFORMANCE_FEEDBACK = "performance_feedback"
    RECOMMENDATION_OUTCOME = "recommendation_outcome"
    WORKFLOW_EXECUTION = "workflow_execution"
    PIPELINE_PERFORMANCE = "pipeline_performance"
    ERROR_PATTERN = "error_pattern"
    OPTIMIZATION_RESULT = "optimization_result"
    USER_PREFERENCE = "user_preference"
    DOMAIN_KNOWLEDGE = "domain_knowledge"


class AIConversationType(enum.Enum):
    """AI conversation type enumeration"""
    GENERAL_QUERY = "general_query"
    TECHNICAL_SUPPORT = "technical_support"
    WORKFLOW_ASSISTANCE = "workflow_assistance"
    PIPELINE_OPTIMIZATION = "pipeline_optimization"
    DATA_DISCOVERY = "data_discovery"
    COMPLIANCE_GUIDANCE = "compliance_guidance"
    TROUBLESHOOTING = "troubleshooting"
    KNOWLEDGE_DISCOVERY = "knowledge_discovery"
    CROSS_GROUP_ANALYSIS = "cross_group_analysis"
    SYSTEM_MONITORING = "system_monitoring"


class AIRecommendationType(enum.Enum):
    """AI recommendation type enumeration"""
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    COST_OPTIMIZATION = "cost_optimization"
    SECURITY_IMPROVEMENT = "security_improvement"
    COMPLIANCE_ENHANCEMENT = "compliance_enhancement"
    WORKFLOW_AUTOMATION = "workflow_automation"
    DATA_QUALITY_IMPROVEMENT = "data_quality_improvement"
    RESOURCE_ALLOCATION = "resource_allocation"
    PROCESS_IMPROVEMENT = "process_improvement"
    ANOMALY_RESOLUTION = "anomaly_resolution"
    BEST_PRACTICE = "best_practice"


class AIInsightType(enum.Enum):
    """AI insight type enumeration"""
    TREND_ANALYSIS = "trend_analysis"
    PATTERN_DISCOVERY = "pattern_discovery"
    ANOMALY_DETECTION = "anomaly_detection"
    PREDICTIVE_ANALYSIS = "predictive_analysis"
    CORRELATION_DISCOVERY = "correlation_discovery"
    PERFORMANCE_ANALYSIS = "performance_analysis"
    USAGE_ANALYSIS = "usage_analysis"
    RISK_ASSESSMENT = "risk_assessment"
    OPPORTUNITY_IDENTIFICATION = "opportunity_identification"
    CROSS_GROUP_INSIGHTS = "cross_group_insights"


class AILearningType(enum.Enum):
    """AI learning type enumeration"""
    USER_INTERACTION = "user_interaction"
    SYSTEM_BEHAVIOR = "system_behavior"
    PERFORMANCE_FEEDBACK = "performance_feedback"
    RECOMMENDATION_OUTCOME = "recommendation_outcome"
    WORKFLOW_EXECUTION = "workflow_execution"
    PIPELINE_PERFORMANCE = "pipeline_performance"
    ERROR_PATTERN = "error_pattern"
    OPTIMIZATION_RESULT = "optimization_result"
    USER_PREFERENCE = "user_preference"
    DOMAIN_KNOWLEDGE = "domain_knowledge"


class RacineAIConversation(Base):
    """
    AI conversation tracking model for context-aware assistance
    with comprehensive interaction history.
    """
    __tablename__ = 'racine_ai_conversations'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Conversation basic information
    conversation_title = Column(String, index=True)
    # Service-aligned fields
    title = Column(String, index=True)  # Alias used by services
    conversation_type = Column(SQLEnum(ConversationType), nullable=False)
    status = Column(String, default="active")  # active, archived, resolved
    priority = Column(String, default="normal")  # low, normal, high, urgent
    
    # Context information
    user_context = Column(JSON)  # User's current context and state
    system_context = Column(JSON)  # System context at conversation start
    workspace_context = Column(JSON)  # Current workspace context
    group_context = Column(JSON)  # Involved groups and their states
    # Service-aligned unified context and metadata
    context = Column(JSON)
    conversation_metadata = Column(JSON)
    workspace_id = Column(String, nullable=True)
    
    # Conversation metadata
    conversation_summary = Column(Text)  # AI-generated conversation summary
    key_topics = Column(JSON)  # Identified key topics
    mentioned_entities = Column(JSON)  # Entities mentioned in conversation
    cross_group_references = Column(JSON)  # References to other groups
    
    # Resolution tracking
    is_resolved = Column(Boolean, default=False, index=True)
    resolution_type = Column(String)  # answered, escalated, automated, closed
    resolution_summary = Column(Text)  # Summary of resolution
    user_satisfaction = Column(Float)  # User satisfaction rating (1-10)
    
    # Learning and improvement
    learning_points = Column(JSON)  # Points for AI learning
    improvement_suggestions = Column(JSON)  # Suggestions for improvement
    knowledge_gaps = Column(JSON)  # Identified knowledge gaps
    
    # Analytics and metrics
    message_count = Column(Integer, default=0)
    duration_minutes = Column(Integer)  # Conversation duration
    response_time_avg = Column(Float)  # Average AI response time
    accuracy_score = Column(Float)  # AI accuracy assessment
    
    # Integration tracking
    workflows_triggered = Column(JSON)  # Workflows triggered during conversation
    pipelines_referenced = Column(JSON)  # Pipelines referenced or created
    resources_accessed = Column(JSON)  # Resources accessed during conversation
    actions_performed = Column(JSON)  # Actions performed by AI
    
    # User and timing
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_activity = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    messages = relationship("RacineAIMessage", back_populates="conversation", cascade="all, delete-orphan")
    recommendations = relationship("RacineAIRecommendation", back_populates="conversation")
    insights = relationship("RacineAIInsight", back_populates="conversation")


class RacineAIMessage(Base):
    """
    Individual AI message tracking with comprehensive analysis
    and context preservation.
    """
    __tablename__ = 'racine_ai_messages'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Message basic information (service-aligned)
    message_type = Column(SQLEnum(MessageType), nullable=False)
    content = Column(Text, nullable=False)
    sender_id = Column(String)
    sender_type = Column(String)  # user, assistant, system
    ai_processing_data = Column(JSON)  # Processing telemetry
    message_metadata = Column(JSON)
    status = Column(SQLEnum(MessageStatus), default=MessageStatus.SENT)

    # Backward-compatible fields (legacy)
    message_content = Column(Text)
    message_format = Column(String, default="text")  # text, json, code, markdown
    
    # Message metadata
    intent_detected = Column(String)  # Detected user intent
    entities_extracted = Column(JSON)  # Extracted entities
    sentiment_score = Column(Float)  # Sentiment analysis score
    confidence_score = Column(Float)  # AI confidence in response
    complexity_score = Column(Float)  # Query complexity score
    
    # Processing information
    processing_time_ms = Column(Integer)  # Time to process message
    ai_model_used = Column(String)  # AI model used for response
    processing_pipeline = Column(JSON)  # Processing pipeline used
    external_apis_called = Column(JSON)  # External APIs called
    
    # Context and references
    context_used = Column(JSON)  # Context information used
    referenced_documents = Column(JSON)  # Documents referenced
    cross_group_data_used = Column(JSON)  # Cross-group data referenced
    workflow_context = Column(JSON)  # Workflow context if applicable
    
    # Quality and feedback
    user_feedback = Column(String)  # User feedback (helpful, not_helpful, etc.)
    accuracy_rating = Column(Float)  # Accuracy rating from user
    relevance_score = Column(Float)  # Relevance score
    improvement_notes = Column(Text)  # Notes for improvement
    
    # Actions and results
    actions_suggested = Column(JSON)  # Actions suggested to user
    actions_executed = Column(JSON)  # Actions executed by AI
    follow_up_required = Column(Boolean, default=False)
    follow_up_actions = Column(JSON)  # Required follow-up actions
    
    # Conversation reference
    conversation_id = Column(String, ForeignKey('racine_ai_conversations.id'), nullable=False)
    message_order = Column(Integer, nullable=False)
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conversation = relationship("RacineAIConversation", back_populates="messages")


class RacineAIRecommendation(Base):
    """
    AI-generated recommendations with comprehensive tracking
    and outcome analysis.
    """
    __tablename__ = 'racine_ai_recommendations'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Recommendation basic information
    # Service-aligned
    title = Column(String, index=True)
    recommendation_title = Column(String, index=True)
    recommendation_type = Column(SQLEnum(RecommendationType), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium")  # low, medium, high, critical
    
    # Recommendation details
    detailed_analysis = Column(JSON)  # Detailed analysis and reasoning
    implementation_steps = Column(JSON)  # Steps to implement recommendation
    expected_benefits = Column(JSON)  # Expected benefits
    potential_risks = Column(JSON)  # Potential risks and mitigation
    resource_requirements = Column(JSON)  # Required resources
    
    # AI analysis
    confidence_score = Column(Float, nullable=False)  # AI confidence (0-1)
    evidence_data = Column(JSON)  # Evidence supporting recommendation
    similar_cases = Column(JSON)  # Similar cases in the system
    success_probability = Column(Float)  # Predicted success probability
    
    # Impact assessment
    impact_areas = Column(JSON)  # Areas that will be impacted
    performance_impact = Column(JSON)  # Expected performance impact
    cost_impact = Column(JSON)  # Expected cost impact
    user_impact = Column(JSON)  # Expected user impact
    compliance_impact = Column(JSON)  # Compliance implications
    
    # Cross-group implications
    affected_groups = Column(JSON)  # Groups affected by recommendation
    cross_group_benefits = Column(JSON)  # Benefits across groups
    integration_requirements = Column(JSON)  # Integration requirements
    coordination_needed = Column(JSON)  # Required coordination
    
    # Implementation tracking
    status = Column(String, default="pending")  # pending, approved, rejected, implemented
    implementation_date = Column(DateTime)
    implementation_progress = Column(Float, default=0.0)  # Implementation progress %
    implementation_notes = Column(Text)  # Implementation notes
    
    # Outcome tracking
    actual_results = Column(JSON)  # Actual results after implementation
    success_rating = Column(Float)  # Success rating (1-10)
    lessons_learned = Column(JSON)  # Lessons learned
    follow_up_recommendations = Column(JSON)  # Follow-up recommendations
    
    # Context and source
    generation_context = Column(JSON)  # Context when recommendation was generated
    source_data = Column(JSON)  # Source data used for generation
    recommendation_data = Column(JSON)  # Raw recommendation data (service)
    triggering_event = Column(JSON)  # Event that triggered recommendation
    related_workflows = Column(JSON)  # Related workflows
    related_pipelines = Column(JSON)  # Related pipelines
    
    # User interaction
    user_feedback = Column(JSON)  # User feedback on recommendation
    user_rating = Column(Float)  # User rating of recommendation
    user_notes = Column(Text)  # User notes
    
    # References
    conversation_id = Column(String, ForeignKey('racine_ai_conversations.id'))
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    orchestration_master_id = Column(String, ForeignKey('racine_orchestration_master.id'))
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime)  # Recommendation expiration
    
    # Relationships
    conversation = relationship("RacineAIConversation", back_populates="recommendations")
    user = relationship("User")
    orchestration_master = relationship("RacineOrchestrationMaster")


class RacineAIInsight(Base):
    """
    AI-generated insights with cross-group analysis
    and predictive capabilities.
    """
    __tablename__ = 'racine_ai_insights'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Insight basic information
    # Service-aligned
    title = Column(String, index=True)
    insight_title = Column(String, nullable=False, index=True)
    insight_type = Column(SQLEnum(InsightType), nullable=False)
    description = Column(Text, nullable=False)
    significance_level = Column(String, default="medium")  # low, medium, high, critical
    
    # Insight analysis
    detailed_analysis = Column(JSON, nullable=False)  # Comprehensive analysis
    insight_data = Column(JSON)  # Raw insight data (service)
    key_findings = Column(JSON)  # Key findings and discoveries
    supporting_evidence = Column(JSON)  # Supporting evidence
    statistical_data = Column(JSON)  # Statistical analysis data
    
    # Data and methodology
    data_sources = Column(JSON)  # Data sources used for insight
    analysis_methodology = Column(JSON)  # Analysis methodology used
    ai_models_used = Column(JSON)  # AI models used in analysis
    confidence_intervals = Column(JSON)  # Statistical confidence intervals
    
    # Cross-group analysis
    groups_analyzed = Column(JSON)  # Groups included in analysis
    cross_group_patterns = Column(JSON)  # Patterns across groups
    group_specific_insights = Column(JSON)  # Group-specific insights
    integration_opportunities = Column(JSON)  # Integration opportunities
    
    # Predictive elements
    predictions = Column(JSON)  # Predictions based on insight
    trend_analysis = Column(JSON)  # Trend analysis
    forecasts = Column(JSON)  # Forecasts and projections
    scenario_analysis = Column(JSON)  # Scenario analysis
    
    # Impact and implications
    business_impact = Column(JSON)  # Business impact assessment
    technical_implications = Column(JSON)  # Technical implications
    operational_impact = Column(JSON)  # Operational impact
    strategic_implications = Column(JSON)  # Strategic implications
    
    # Actionable information
    recommended_actions = Column(JSON)  # Recommended actions
    next_steps = Column(JSON)  # Suggested next steps
    monitoring_requirements = Column(JSON)  # Monitoring requirements
    success_metrics = Column(JSON)  # Success metrics to track
    
    # Quality and validation
    validation_status = Column(String, default="pending")  # pending, validated, disputed
    accuracy_score = Column(Float)  # Accuracy assessment
    reliability_score = Column(Float)  # Reliability assessment
    peer_review_notes = Column(JSON)  # Peer review notes
    
    # Usage and sharing
    is_public = Column(Boolean, default=False)
    access_level = Column(String, default="private")  # private, team, organization
    shared_with_groups = Column(JSON)  # Groups shared with
    usage_count = Column(Integer, default=0)  # Usage count
    
    # Context and generation
    generation_context = Column(JSON)  # Context during generation
    triggering_analysis = Column(JSON)  # Analysis that triggered insight
    related_insights = Column(JSON)  # Related insights
    
    # References
    conversation_id = Column(String, ForeignKey('racine_ai_conversations.id'))
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    orchestration_master_id = Column(String, ForeignKey('racine_orchestration_master.id'))
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conversation = relationship("RacineAIConversation", back_populates="insights")
    user = relationship("User")
    orchestration_master = relationship("RacineOrchestrationMaster")


class RacineAILearning(Base):
    """
    AI learning data tracking for continuous improvement
    and knowledge accumulation.
    """
    __tablename__ = 'racine_ai_learning'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Learning basic information
    learning_type = Column(SQLEnum(LearningType), nullable=False)
    learning_source = Column(String, nullable=False)  # Source of learning data
    description = Column(Text)
    importance_score = Column(Float, default=0.5)  # Learning importance (0-1)
    
    # Learning data
    learning_data = Column(JSON, nullable=False)  # Raw learning data
    processed_data = Column(JSON)  # Processed learning data
    patterns_identified = Column(JSON)  # Identified patterns
    correlations_found = Column(JSON)  # Found correlations
    
    # Context information
    context_data = Column(JSON)  # Context when learning occurred
    user_context = Column(JSON)  # User context
    system_context = Column(JSON)  # System context
    environmental_factors = Column(JSON)  # Environmental factors
    
    # Learning outcomes
    knowledge_gained = Column(JSON)  # Knowledge gained
    model_updates = Column(JSON)  # Model updates made
    behavior_changes = Column(JSON)  # Behavior changes implemented
    performance_impact = Column(JSON)  # Impact on performance
    
    # Validation and quality
    validation_status = Column(String, default="pending")  # pending, validated, rejected
    quality_score = Column(Float)  # Quality assessment of learning
    reliability_score = Column(Float)  # Reliability of learning data
    validation_notes = Column(Text)  # Validation notes
    
    # Application tracking
    times_applied = Column(Integer, default=0)  # Times learning was applied
    success_rate = Column(Float)  # Success rate when applied
    failure_cases = Column(JSON)  # Cases where learning failed
    improvement_suggestions = Column(JSON)  # Suggestions for improvement
    
    # Cross-group learning
    applicable_groups = Column(JSON)  # Groups where learning is applicable
    cross_group_patterns = Column(JSON)  # Cross-group patterns
    group_specific_adaptations = Column(JSON)  # Group-specific adaptations
    
    # Relationships and references
    related_conversations = Column(JSON)  # Related conversations
    related_recommendations = Column(JSON)  # Related recommendations
    related_insights = Column(JSON)  # Related insights
    source_user_id = Column(String, ForeignKey('users.id'))
    
    # Timing and lifecycle
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_applied = Column(DateTime)  # Last time learning was applied
    expires_at = Column(DateTime)  # Learning expiration date
    
    # Relationships
    source_user = relationship("User")


class RacineAIKnowledge(Base):
    """
    AI knowledge base with domain-specific information
    and cross-group expertise.
    """
    __tablename__ = 'racine_ai_knowledge'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Knowledge basic information
    knowledge_title = Column(String, nullable=False, index=True)
    knowledge_type = Column(String, nullable=False)  # concept, procedure, fact, rule
    domain = Column(String, nullable=False)  # Domain area
    category = Column(String, index=True)  # Knowledge category
    
    # Knowledge content
    knowledge_content = Column(JSON, nullable=False)  # Knowledge content
    formal_representation = Column(JSON)  # Formal knowledge representation
    examples = Column(JSON)  # Examples and use cases
    related_concepts = Column(JSON)  # Related concepts
    
    # Knowledge metadata
    confidence_level = Column(Float, default=0.8)  # Confidence in knowledge
    source_reliability = Column(Float, default=0.8)  # Source reliability
    last_validated = Column(DateTime)  # Last validation date
    validation_method = Column(String)  # Validation method used
    
    # Usage and application
    applicable_contexts = Column(JSON)  # Applicable contexts
    usage_examples = Column(JSON)  # Usage examples
    best_practices = Column(JSON)  # Best practices
    common_mistakes = Column(JSON)  # Common mistakes to avoid
    
    # Cross-group applicability
    applicable_groups = Column(JSON)  # Groups where knowledge applies
    group_specific_variations = Column(JSON)  # Group-specific variations
    integration_guidelines = Column(JSON)  # Integration guidelines
    
    # Quality and maintenance
    accuracy_score = Column(Float, default=0.8)  # Accuracy assessment
    completeness_score = Column(Float, default=0.8)  # Completeness assessment
    review_status = Column(String, default="pending")  # Review status
    update_frequency = Column(String, default="quarterly")  # Update frequency
    
    # Usage statistics
    usage_count = Column(Integer, default=0)  # Usage count
    success_rate = Column(Float)  # Success rate when applied
    user_ratings = Column(JSON)  # User ratings
    feedback = Column(JSON)  # User feedback
    
    # Knowledge evolution
    version = Column(String, default="1.0")  # Knowledge version
    previous_versions = Column(JSON)  # Previous versions
    change_history = Column(JSON)  # Change history
    evolution_notes = Column(Text)  # Evolution notes
    
    # References and sources
    sources = Column(JSON)  # Knowledge sources
    references = Column(JSON)  # References
    expert_contributors = Column(JSON)  # Expert contributors
    created_by = Column(String, ForeignKey('users.id'))
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User")


class RacineAIMetrics(Base):
    """
    AI system performance metrics and analytics.
    """
    __tablename__ = 'racine_ai_metrics'

    # Primary identifier
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Metric basic information
    metric_type = Column(String, nullable=False, index=True)  # response_time, accuracy, etc.
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String)
    metric_category = Column(String)  # performance, quality, usage, satisfaction
    
    # Metric context
    context_type = Column(String)  # conversation, recommendation, insight, learning
    context_id = Column(String)  # ID of the context object
    user_id = Column(String, ForeignKey('users.id'))
    group_context = Column(String)  # Group context
    
    # Temporal information
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    time_window_start = Column(DateTime)
    time_window_end = Column(DateTime)
    
    # Contextual data
    measurement_context = Column(JSON)  # Context during measurement
    baseline_value = Column(Float)  # Baseline value for comparison
    target_value = Column(Float)  # Target value
    variance_from_target = Column(Float)  # Variance from target
    
    # Additional metadata
    metric_metadata = Column(JSON)  # Additional metric metadata
    tags = Column(JSON)  # Metric tags for categorization
    
    # Relationships
    user = relationship("User")