"""
Template Models for Scan Rule Sets

Advanced template management models for enterprise-grade rule template system.
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import uuid
from pydantic import field_validator, BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint

# ===================================
# ENUMS
# ===================================

class TemplateStatus(str, Enum):
    """Template status types."""
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"

class TemplateComplexity(str, Enum):
    """Template complexity levels."""
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    EXPERT = "expert"

class TemplateType(str, Enum):
    """Template types."""
    DATA_QUALITY = "data_quality"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"
    CUSTOM = "custom"

# ===================================
# TEMPLATE MODELS
# ===================================

class TemplateCategory(SQLModel, table=True):
    """Template categories for organization and classification."""
    __tablename__ = "template_categories"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    name: str = Field(max_length=200, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    
    # Hierarchy
    parent_category_id: Optional[str] = Field(default=None, foreign_key="template_categories.category_id")
    category_path: str = Field(max_length=500, index=True)  # e.g., "/security/data_protection"
    level: int = Field(default=0, ge=0)
    
    # Category Configuration
    category_type: TemplateType = Field(default=TemplateType.CUSTOM)
    is_system_category: bool = Field(default=False)
    sort_order: int = Field(default=100)
    
    # Metadata
    icon: Optional[str] = Field(default=None, max_length=100)
    color: Optional[str] = Field(default=None, max_length=20)
    tags: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Usage Statistics
    template_count: int = Field(default=0, ge=0)
    usage_count: int = Field(default=0, ge=0)
    
    # Lifecycle
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    parent_category: Optional["TemplateCategory"] = Relationship(back_populates="child_categories")
    child_categories: List["TemplateCategory"] = Relationship(back_populates="parent_category")
    templates: List["RuleTemplate"] = Relationship(back_populates="category")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_category_path", "category_path"),
        Index("idx_category_type_active", "category_type", "is_active"),
        Index("idx_category_parent", "parent_category_id"),
    )

class RuleTemplate(SQLModel, table=True):
    """Advanced rule templates with enterprise features."""
    __tablename__ = "rule_templates"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    name: str = Field(max_length=200, index=True)
    description: Optional[str] = Field(default=None, max_length=2000)
    
    # Template Classification
    category_id: str = Field(foreign_key="template_categories.category_id", index=True)
    template_type: TemplateType = Field(default=TemplateType.CUSTOM, index=True)
    complexity: TemplateComplexity = Field(default=TemplateComplexity.MODERATE)
    
    # Template Definition
    template_definition: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    parameter_schema: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    default_parameters: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    validation_rules: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Requirements
    minimum_requirements: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    supported_data_sources: List[str] = Field(default=None, sa_column=Column(JSON))
    compliance_frameworks: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Template Metadata
    version: str = Field(default="1.0.0", max_length=20)
    status: TemplateStatus = Field(default=TemplateStatus.DRAFT, index=True)
    is_featured: bool = Field(default=False)
    is_premium: bool = Field(default=False)
    
    # Usage and Performance
    usage_count: int = Field(default=0, ge=0)
    success_rate: Optional[float] = Field(default=None, ge=0, le=100)
    average_execution_time: Optional[float] = Field(default=None, ge=0)
    performance_score: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Documentation
    documentation: Optional[Text] = Field(default=None)
    examples: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    best_practices: List[str] = Field(default=None, sa_column=Column(JSON))
    common_issues: List[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Collaboration
    created_by: str = Field(max_length=100)
    maintained_by: List[str] = Field(default=None, sa_column=Column(JSON))
    review_status: str = Field(default="pending", max_length=50)
    approved_by: Optional[str] = Field(default=None, max_length=100)
    approved_at: Optional[datetime] = Field(default=None)
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deprecated_at: Optional[datetime] = Field(default=None)
    replacement_template_id: Optional[str] = Field(default=None)
    
    # Tagging and Search
    tags: List[str] = Field(default=None, sa_column=Column(JSON))
    keywords: List[str] = Field(default=None, sa_column=Column(JSON))
    search_index: Optional[Text] = Field(default=None)
    
    # Relationships
    category: TemplateCategory = Relationship(back_populates="templates")
    versions: List["TemplateVersion"] = Relationship(back_populates="template")
    usage_records: List["TemplateUsage"] = Relationship(back_populates="template")
    reviews: List["TemplateReview"] = Relationship(back_populates="template")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_template_type_status", "template_type", "status"),
        Index("idx_template_category", "category_id"),
        Index("idx_template_usage", "usage_count"),
        Index("idx_template_featured", "is_featured"),
        CheckConstraint("success_rate >= 0 AND success_rate <= 100", name="check_success_rate"),
        CheckConstraint("performance_score >= 0 AND performance_score <= 100", name="check_performance_score"),
    )

class TemplateVersion(SQLModel, table=True):
    """Version control for rule templates."""
    __tablename__ = "template_versions"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    version_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    template_id: str = Field(foreign_key="rule_templates.template_id", index=True)
    
    # Version Information
    version_number: str = Field(max_length=20, index=True)
    version_name: Optional[str] = Field(default=None, max_length=200)
    version_description: Optional[str] = Field(default=None, max_length=1000)
    
    # Version Content
    template_definition: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    parameter_schema: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    change_summary: List[str] = Field(default=None, sa_column=Column(JSON))
    breaking_changes: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Version Metadata
    is_current: bool = Field(default=False)
    is_stable: bool = Field(default=False)
    is_deprecated: bool = Field(default=False)
    compatibility_version: Optional[str] = Field(default=None, max_length=20)
    
    # Version Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    released_at: Optional[datetime] = Field(default=None)
    deprecated_at: Optional[datetime] = Field(default=None)
    
    # Performance Tracking
    usage_count: int = Field(default=0, ge=0)
    success_rate: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Relationships
    template: RuleTemplate = Relationship(back_populates="versions")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_version_template", "template_id", "version_number"),
        Index("idx_version_current", "template_id", "is_current"),
        UniqueConstraint("template_id", "version_number", name="uq_template_version"),
    )

class TemplateUsage(SQLModel, table=True):
    """Track template usage for analytics and optimization."""
    __tablename__ = "template_usage"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    usage_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    template_id: str = Field(foreign_key="rule_templates.template_id", index=True)
    
    # Usage Context
    used_by: str = Field(max_length=100, index=True)
    usage_context: str = Field(max_length=200)  # rule_creation, rule_modification, etc.
    rule_id: Optional[int] = Field(default=None, index=True)
    
    # Usage Details
    parameters_used: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    customizations: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    success: bool = Field(default=True)
    
    # Performance Metrics
    execution_time_seconds: Optional[float] = Field(default=None, ge=0)
    resource_usage: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Feedback
    user_rating: Optional[int] = Field(default=None, ge=1, le=5)
    user_feedback: Optional[str] = Field(default=None, max_length=2000)
    issues_encountered: List[str] = Field(default=None, sa_column=Column(JSON))
    
    # Timing
    used_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = Field(default=None)
    
    # Environment
    environment: str = Field(default="production", max_length=50)
    client_info: Dict[str, Any] = Field(default=None, sa_column=Column(JSON))
    
    # Relationships
    template: RuleTemplate = Relationship(back_populates="usage_records")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_usage_template_user", "template_id", "used_by"),
        Index("idx_usage_date", "used_at"),
        Index("idx_usage_success", "success"),
    )

class TemplateReview(SQLModel, table=True):
    """Template reviews and ratings system."""
    __tablename__ = "template_reviews"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    template_id: str = Field(foreign_key="rule_templates.template_id", index=True)
    
    # Review Details
    reviewer: str = Field(max_length=100, index=True)
    rating: int = Field(ge=1, le=5)
    title: str = Field(max_length=200)
    review_text: Optional[Text] = Field(default=None)
    
    # Review Categories
    ease_of_use: Optional[int] = Field(default=None, ge=1, le=5)
    documentation_quality: Optional[int] = Field(default=None, ge=1, le=5)
    performance: Optional[int] = Field(default=None, ge=1, le=5)
    reliability: Optional[int] = Field(default=None, ge=1, le=5)
    
    # Review Context
    use_case: Optional[str] = Field(default=None, max_length=500)
    environment: str = Field(default="production", max_length=50)
    version_reviewed: str = Field(max_length=20)
    
    # Review Status
    is_verified: bool = Field(default=False)
    is_featured: bool = Field(default=False)
    helpful_count: int = Field(default=0, ge=0)
    
    # Moderation
    status: str = Field(default="published", max_length=50)  # pending, published, hidden
    moderated_by: Optional[str] = Field(default=None, max_length=100)
    moderated_at: Optional[datetime] = Field(default=None)
    moderation_notes: Optional[str] = Field(default=None, max_length=1000)
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    template: RuleTemplate = Relationship(back_populates="reviews")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_review_template_rating", "template_id", "rating"),
        Index("idx_review_reviewer", "reviewer"),
        Index("idx_review_status", "status"),
        UniqueConstraint("template_id", "reviewer", name="uq_template_reviewer"),
    )

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class TemplateCreateRequest(BaseModel):
    """Request model for creating templates."""
    name: str
    description: Optional[str] = None
    category_id: str
    template_type: TemplateType
    complexity: TemplateComplexity = TemplateComplexity.MODERATE
    template_definition: Dict[str, Any]
    parameter_schema: Dict[str, Any]
    default_parameters: Optional[Dict[str, Any]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    supported_data_sources: Optional[List[str]] = None
    compliance_frameworks: Optional[List[str]] = None
    documentation: Optional[str] = None
    tags: Optional[List[str]] = None
    
    @field_validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Template name cannot be empty")
        return v.strip()

class TemplateUpdateRequest(BaseModel):
    """Request model for updating templates."""
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    template_definition: Optional[Dict[str, Any]] = None
    parameter_schema: Optional[Dict[str, Any]] = None
    default_parameters: Optional[Dict[str, Any]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    documentation: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[TemplateStatus] = None

class TemplateUsageRequest(BaseModel):
    """Request model for recording template usage."""
    template_id: str
    usage_context: str
    rule_id: Optional[int] = None
    parameters_used: Dict[str, Any]
    customizations: Optional[Dict[str, Any]] = None
    environment: str = "production"

class TemplateReviewRequest(BaseModel):
    """Request model for template reviews."""
    template_id: str
    rating: int = Field(ge=1, le=5)
    title: str
    review_text: Optional[str] = None
    ease_of_use: Optional[int] = Field(default=None, ge=1, le=5)
    documentation_quality: Optional[int] = Field(default=None, ge=1, le=5)
    performance: Optional[int] = Field(default=None, ge=1, le=5)
    reliability: Optional[int] = Field(default=None, ge=1, le=5)
    use_case: Optional[str] = None
    version_reviewed: str

class TemplateResponse(BaseModel):
    """Response model for template operations."""
    template_id: str
    name: str
    description: Optional[str]
    category_name: str
    template_type: TemplateType
    complexity: TemplateComplexity
    status: TemplateStatus
    version: str
    usage_count: int
    success_rate: Optional[float]
    created_at: datetime
    created_by: str
    tags: List[str]
    
class CategoryResponse(BaseModel):
    """Response model for category operations."""
    category_id: str
    name: str
    description: Optional[str]
    category_path: str
    template_count: int
    usage_count: int
    is_active: bool