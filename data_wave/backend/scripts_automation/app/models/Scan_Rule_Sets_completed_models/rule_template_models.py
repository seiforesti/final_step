"""
Advanced Rule Template Models for Scan-Rule-Sets Group
====================================================

Enterprise-grade template management system for scan rules with advanced features:
- Hierarchical template categorization
- Template versioning and lifecycle management
- AI-powered template recommendations
- Template performance analytics
- Template sharing and collaboration
- Template validation and compliance
- Template usage tracking and optimization

Production Features:
- Complex template inheritance and composition
- Template marketplace and rating system
- Template security and access control
- Template deployment and rollback
- Template analytics and insights
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum
import uuid

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text
from sqlalchemy import Index, UniqueConstraint, CheckConstraint
from pydantic import BaseModel, validator

# ===================== ENUMS AND TYPES =====================

class TemplateCategoryType(str, Enum):
    """Template category classifications"""
    DATA_QUALITY = "data_quality"
    COMPLIANCE = "compliance"
    SECURITY = "security"
    PERFORMANCE = "performance"
    CLASSIFICATION = "classification"
    LINEAGE = "lineage"
    DISCOVERY = "discovery"
    MONITORING = "monitoring"
    CUSTOM = "custom"
    MARKETPLACE = "marketplace"

class TemplateType(str, Enum):
    """Template type classifications"""
    BASIC = "basic"                    # Simple rule templates
    ADVANCED = "advanced"              # Complex rule templates
    COMPOSITE = "composite"            # Multi-rule templates
    CONDITIONAL = "conditional"        # Logic-based templates
    DYNAMIC = "dynamic"                # AI-generated templates
    INDUSTRY = "industry"              # Industry-specific templates
    REGULATORY = "regulatory"          # Regulatory compliance templates

class TemplateStatus(str, Enum):
    """Template lifecycle status"""
    DRAFT = "draft"                    # Under development
    REVIEW = "review"                  # Under review
    APPROVED = "approved"              # Approved for use
    PUBLISHED = "published"            # Available in marketplace
    DEPRECATED = "deprecated"          # No longer recommended
    ARCHIVED = "archived"              # Archived for reference
    RETIRED = "retired"                # Completely removed

class TemplateComplexity(str, Enum):
    """Template complexity levels"""
    BEGINNER = "beginner"              # Easy to use
    INTERMEDIATE = "intermediate"      # Moderate complexity
    ADVANCED = "advanced"              # High complexity
    EXPERT = "expert"                  # Expert-level only
    ENTERPRISE = "enterprise"          # Enterprise-grade

class TemplateUsageScope(str, Enum):
    """Template usage scope"""
    PERSONAL = "personal"              # Personal use only
    TEAM = "team"                      # Team sharing
    ORGANIZATION = "organization"      # Organization-wide
    PUBLIC = "public"                  # Publicly available
    MARKETPLACE = "marketplace"        # Commercial marketplace

# ===================== CORE TEMPLATE MODELS =====================

class RuleTemplate(SQLModel, table=True):
    """
    Core rule template model with comprehensive metadata and features.
    Supports advanced template management, AI recommendations, and enterprise integration.
    """
    __tablename__ = "rule_templates"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: str = Field(index=True, unique=True, description="Unique template identifier")
    name: str = Field(index=True, max_length=255, description="Template name")
    display_name: Optional[str] = Field(max_length=255, description="Human-readable display name")
    description: Optional[str] = Field(sa_column=Column(Text), description="Detailed template description")
    
    # Template classification
    category: TemplateCategoryType = Field(index=True, description="Template category")
    template_category_id: Optional[int] = Field(default=None, foreign_key="template_categories.id", index=True, description="Reference to template category")
    template_type: TemplateType = Field(index=True, description="Template type")
    complexity_level: TemplateComplexity = Field(index=True, description="Complexity level")
    usage_scope: TemplateUsageScope = Field(index=True, description="Usage scope")
    
    # Template content and structure
    template_content: Dict[str, Any] = Field(sa_column=Column(JSON), description="Template rule definition")
    template_schema: Dict[str, Any] = Field(sa_column=Column(JSON), description="Template structure schema")
    parameter_definitions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    default_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Template metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    industry_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    regulatory_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Template relationships and dependencies
    parent_template_id: Optional[str] = Field(index=True, description="Parent template for inheritance")
    derived_templates: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    required_templates: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    optional_templates: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    conflicting_templates: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # AI and ML features
    ai_generated: bool = Field(default=False, description="Whether template was AI-generated")
    ml_model_version: Optional[str] = Field(max_length=50, description="ML model version used")
    similarity_embeddings: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    recommendation_score: float = Field(default=0.0, ge=0.0, le=1.0, description="AI recommendation score")
    
    # Performance and analytics
    usage_count: int = Field(default=0, ge=0, description="Total usage count")
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="Success rate")
    average_performance: float = Field(default=0.0, ge=0.0, description="Average performance score")
    user_rating: float = Field(default=0.0, ge=0.0, le=5.0, description="User rating")
    performance_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Template lifecycle and status
    status: TemplateStatus = Field(default=TemplateStatus.DRAFT, index=True)
    version: str = Field(default="1.0.0", max_length=20, description="Template version")
    is_active: bool = Field(default=True, index=True)
    is_featured: bool = Field(default=False, index=True)
    is_verified: bool = Field(default=False, index=True)
    
    # Access control and security
    visibility_level: str = Field(default="private", max_length=50)
    access_permissions: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    security_classification: Optional[str] = Field(max_length=50)
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business and commercial
    license_type: str = Field(default="internal", max_length=50)
    cost_per_use: Optional[float] = Field(ge=0.0, description="Cost per template use")
    commercial_value: Optional[float] = Field(ge=0.0, description="Commercial value")
    roi_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and validation
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    validation_status: str = Field(default="pending", max_length=50)
    last_validation: Optional[datetime] = None
    validation_errors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Documentation and help
    documentation: Optional[str] = Field(sa_column=Column(Text))
    examples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    use_cases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    best_practices: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    troubleshooting: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    published_at: Optional[datetime] = None
    deprecated_at: Optional[datetime] = None
    last_used: Optional[datetime] = None
    
    # User tracking
    created_by: str = Field(max_length=255, index=True)
    updated_by: Optional[str] = Field(max_length=255)
    reviewed_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    template_category: Optional["TemplateCategory"] = Relationship(back_populates="templates")
    template_versions: List["TemplateVersion"] = Relationship(back_populates="template")
    template_usages: List["TemplateUsage"] = Relationship(back_populates="template")
    template_reviews: List["TemplateReview"] = Relationship(back_populates="template")
    template_analytics: List["TemplateAnalytics"] = Relationship(back_populates="template")
    
    # Table constraints
    __table_args__ = (
        Index("idx_template_category_type", "category", "template_type"),
        Index("idx_template_status_active", "status", "is_active"),
        Index("idx_template_performance", "success_rate", "user_rating"),
        Index("idx_template_created", "created_at", "created_by"),
        UniqueConstraint("template_id", name="uq_rule_template_id"),
        CheckConstraint("success_rate >= 0 AND success_rate <= 1", name="chk_success_rate"),
        CheckConstraint("user_rating >= 0 AND user_rating <= 5", name="chk_user_rating"),
    )

class TemplateCategory(SQLModel, table=True):
    """
    Template category management with hierarchical organization.
    Supports nested categories, category analytics, and intelligent categorization.
    """
    __tablename__ = "template_categories"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: str = Field(index=True, unique=True)
    name: str = Field(index=True, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    
    # Hierarchical structure
    parent_category_id: Optional[str] = Field(index=True)
    category_path: str = Field(index=True, max_length=500)
    category_level: int = Field(default=1, ge=1, le=10)
    sort_order: int = Field(default=0)
    
    # Category metadata
    icon: Optional[str] = Field(max_length=100)
    color: Optional[str] = Field(max_length=20)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Category analytics
    template_count: int = Field(default=0, ge=0)
    usage_count: int = Field(default=0, ge=0)
    popularity_score: float = Field(default=0.0, ge=0.0, le=1.0)
    average_rating: float = Field(default=0.0, ge=0.0, le=5.0)
    
    # Category configuration
    is_active: bool = Field(default=True, index=True)
    is_featured: bool = Field(default=False)
    requires_approval: bool = Field(default=False)
    access_level: str = Field(default="public", max_length=50)
    
    # AI and ML features
    auto_categorization_enabled: bool = Field(default=True)
    ml_classification_model: Optional[str] = Field(max_length=100)
    similarity_threshold: float = Field(default=0.8, ge=0.0, le=1.0)
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: str = Field(max_length=255)
    
    # Relationships
    templates: List[RuleTemplate] = Relationship(back_populates="template_category")
    
    # Table constraints
    __table_args__ = (
        Index("idx_category_parent_level", "parent_category_id", "category_level"),
        Index("idx_category_path", "category_path"),
        UniqueConstraint("category_id", name="uq_template_category_id"),
    )

class TemplateVersion(SQLModel, table=True):
    """
    Template version management with comprehensive change tracking.
    Supports semantic versioning, change history, and rollback capabilities.
    """
    __tablename__ = "template_versions"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: str = Field(index=True, unique=True)
    template_id: str = Field(foreign_key="rule_templates.template_id", index=True)
    
    # Version information
    version_number: str = Field(index=True, max_length=20)
    version_type: str = Field(max_length=20)  # major, minor, patch, hotfix
    is_current: bool = Field(default=False, index=True)
    is_stable: bool = Field(default=False)
    
    # Version content
    template_content: Dict[str, Any] = Field(sa_column=Column(JSON))
    parameter_definitions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Change tracking
    change_summary: str = Field(max_length=500)
    change_details: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    breaking_changes: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    migration_notes: Optional[str] = Field(sa_column=Column(Text))
    
    # Version metrics
    usage_count: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    performance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    user_feedback: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Approval and validation
    approval_status: str = Field(default="pending", max_length=50)
    approved_by: Optional[str] = Field(max_length=255)
    approved_at: Optional[datetime] = None
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: str = Field(max_length=255, index=True)
    
    # Relationships
    template: Optional[RuleTemplate] = Relationship(back_populates="template_versions")
    
    # Table constraints
    __table_args__ = (
        Index("idx_version_template_number", "template_id", "version_number"),
        Index("idx_version_current_stable", "is_current", "is_stable"),
        UniqueConstraint("version_id", name="uq_template_version_id"),
        UniqueConstraint("template_id", "version_number", name="uq_template_version_number"),
    )

class TemplateUsage(SQLModel, table=True):
    """
    Template usage tracking with comprehensive analytics.
    Tracks usage patterns, performance, and user behavior.
    """
    __tablename__ = "template_usages"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    usage_id: str = Field(index=True, unique=True)
    template_id: str = Field(foreign_key="rule_templates.template_id", index=True)
    
    # Usage context
    user_id: str = Field(max_length=255, index=True)
    session_id: Optional[str] = Field(max_length=255, index=True)
    rule_id: Optional[str] = Field(max_length=255, index=True)
    project_id: Optional[str] = Field(max_length=255, index=True)
    
    # Usage details
    usage_type: str = Field(max_length=50, index=True)  # create, modify, copy, reference
    parameters_used: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    customizations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    usage_duration: Optional[int] = Field(ge=0, description="Usage duration in seconds")
    
    # Usage outcomes
    success: bool = Field(index=True)
    error_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    performance_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    user_satisfaction: Optional[float] = Field(ge=0.0, le=5.0)
    
    # Context information
    environment: str = Field(default="production", max_length=50)
    data_source_type: Optional[str] = Field(max_length=100)
    data_volume: Optional[int] = Field(ge=0)
    complexity_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Temporal fields
    started_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = None
    
    # Relationships
    template: Optional[RuleTemplate] = Relationship(back_populates="template_usages")
    
    # Table constraints
    __table_args__ = (
        Index("idx_usage_template_user", "template_id", "user_id"),
        Index("idx_usage_type_success", "usage_type", "success"),
        Index("idx_usage_started", "started_at"),
    )

class TemplateReview(SQLModel, table=True):
    """
    Template review and rating system with comprehensive feedback.
    Supports peer reviews, expert validation, and community ratings.
    """
    __tablename__ = "template_reviews"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: str = Field(index=True, unique=True)
    template_id: str = Field(foreign_key="rule_templates.template_id", index=True)
    
    # Review details
    reviewer_id: str = Field(max_length=255, index=True)
    review_type: str = Field(max_length=50, index=True)  # peer, expert, community, automated
    overall_rating: float = Field(ge=0.0, le=5.0, index=True)
    
    # Detailed ratings
    usability_rating: float = Field(ge=0.0, le=5.0)
    performance_rating: float = Field(ge=0.0, le=5.0)
    documentation_rating: float = Field(ge=0.0, le=5.0)
    reliability_rating: float = Field(ge=0.0, le=5.0)
    innovation_rating: float = Field(ge=0.0, le=5.0)
    
    # Review content
    title: str = Field(max_length=200)
    review_text: Optional[str] = Field(sa_column=Column(Text))
    pros: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    cons: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Review validation
    is_verified: bool = Field(default=False)
    helpful_votes: int = Field(default=0, ge=0)
    total_votes: int = Field(default=0, ge=0)
    review_quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    template: Optional[RuleTemplate] = Relationship(back_populates="template_reviews")
    
    # Table constraints
    __table_args__ = (
        Index("idx_review_template_rating", "template_id", "overall_rating"),
        Index("idx_review_type_verified", "review_type", "is_verified"),
        UniqueConstraint("review_id", name="uq_template_review_id"),
    )

class TemplateAnalytics(SQLModel, table=True):
    """
    Advanced template analytics with AI-powered insights.
    Provides comprehensive metrics, trends, and recommendations.
    """
    __tablename__ = "template_analytics"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    analytics_id: str = Field(index=True, unique=True)
    template_id: str = Field(foreign_key="rule_templates.template_id", index=True)
    
    # Analytics period
    period_start: datetime = Field(index=True)
    period_end: datetime = Field(index=True)
    period_type: str = Field(max_length=20, index=True)  # daily, weekly, monthly, quarterly
    
    # Usage metrics
    total_usages: int = Field(default=0, ge=0)
    unique_users: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    average_duration: float = Field(default=0.0, ge=0.0)
    
    # Performance metrics
    average_performance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    performance_trend: str = Field(default="stable", max_length=20)
    performance_percentiles: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # User engagement metrics
    average_rating: float = Field(default=0.0, ge=0.0, le=5.0)
    rating_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    user_retention_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    recommendation_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Business metrics
    cost_savings: Optional[float] = Field(ge=0.0)
    time_savings: Optional[float] = Field(ge=0.0)
    error_reduction: Optional[float] = Field(ge=0.0, le=1.0)
    roi_score: float = Field(default=0.0, ge=0.0)
    
    # AI insights
    usage_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    trend_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    predictive_insights: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    anomaly_detection: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    template: Optional[RuleTemplate] = Relationship(back_populates="template_analytics")
    
    # Table constraints
    __table_args__ = (
        Index("idx_analytics_template_period", "template_id", "period_type", "period_start"),
        Index("idx_analytics_metrics", "success_rate", "average_rating"),
        UniqueConstraint("analytics_id", name="uq_template_analytics_id"),
    )

# ===================== REQUEST/RESPONSE MODELS =====================

class TemplateCreateRequest(BaseModel):
    """Request model for creating new templates"""
    name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    category: TemplateCategoryType
    template_type: TemplateType = TemplateType.BASIC
    complexity_level: TemplateComplexity = TemplateComplexity.INTERMEDIATE
    template_content: Dict[str, Any]
    parameter_definitions: Optional[List[Dict[str, Any]]] = []
    tags: Optional[List[str]] = []
    keywords: Optional[List[str]] = []

class TemplateUpdateRequest(BaseModel):
    """Request model for updating templates"""
    name: Optional[str] = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    template_content: Optional[Dict[str, Any]] = None
    parameter_definitions: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    status: Optional[TemplateStatus] = None

class TemplateResponse(BaseModel):
    """Response model for template data"""
    id: int
    template_id: str
    name: str
    display_name: Optional[str]
    category: TemplateCategoryType
    template_type: TemplateType
    complexity_level: TemplateComplexity
    status: TemplateStatus
    version: str
    usage_count: int
    success_rate: float
    user_rating: float
    created_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

class TemplateSearchParams(BaseModel):
    """Search parameters for templates"""
    query: Optional[str] = None
    categories: Optional[List[TemplateCategoryType]] = None
    template_types: Optional[List[TemplateType]] = None
    complexity_levels: Optional[List[TemplateComplexity]] = None
    statuses: Optional[List[TemplateStatus]] = None
    tags: Optional[List[str]] = None
    min_rating: Optional[float] = Field(ge=0.0, le=5.0)
    created_by: Optional[str] = None
    created_after: Optional[datetime] = None