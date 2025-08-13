from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class TagType(str, Enum):
    SYSTEM = "system"
    USER = "user"
    AUTOMATED = "automated"
    COMPLIANCE = "compliance"


class TagScope(str, Enum):
    GLOBAL = "global"
    ORGANIZATION = "organization"
    TEAM = "team"
    PERSONAL = "personal"


class Tag(SQLModel, table=True):
    """Tag model"""
    __tablename__ = "tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Tag details
    name: str = Field(index=True, unique=True)
    display_name: Optional[str] = None
    description: Optional[str] = None
    color: str = Field(default="#6B7280")  # Hex color code
    
    # Classification
    tag_type: TagType = Field(default=TagType.USER)
    scope: TagScope = Field(default=TagScope.ORGANIZATION)
    category_id: Optional[int] = Field(foreign_key="tag_categories.id")
    
    # Metadata
    icon: Optional[str] = None  # Icon name or URL
    tag_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Status and usage
    is_active: bool = Field(default=True)
    usage_count: int = Field(default=0)
    last_used: Optional[datetime] = None
    
    # Audit fields
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class TagCategory(SQLModel, table=True):
    """Tag category model"""
    __tablename__ = "tag_categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Category details
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    color: str = Field(default="#6B7280")
    
    # Hierarchy
    parent_id: Optional[int] = Field(foreign_key="tag_categories.id")
    sort_order: int = Field(default=0)
    
    # Status
    is_active: bool = Field(default=True)
    
    # Audit
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class DataSourceTag(SQLModel, table=True):
    """Data source tag association model"""
    __tablename__ = "data_source_tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    tag_id: int = Field(foreign_key="tags.id", index=True)
    
    # Assignment details
    assigned_by: str
    assigned_at: datetime = Field(default_factory=datetime.now)
    
    # Context
    context: Optional[str] = None  # Why this tag was applied
    confidence_score: Optional[float] = None  # For automated tags
    
    # Auto-removal rules
    auto_assigned: bool = Field(default=False)
    expires_at: Optional[datetime] = None


class TagRule(SQLModel, table=True):
    """Tag rule model for automated tagging"""
    __tablename__ = "tag_rules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tag_id: int = Field(foreign_key="tags.id")
    
    # Rule details
    name: str
    description: Optional[str] = None
    
    # Conditions
    conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution
    is_active: bool = Field(default=True)
    priority: int = Field(default=0)  # Higher priority executes first
    last_executed: Optional[datetime] = None
    
    # Statistics
    execution_count: int = Field(default=0)
    matches_count: int = Field(default=0)
    
    # Audit
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class TagUsage(SQLModel, table=True):
    """Tag usage tracking model"""
    __tablename__ = "tag_usage"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", index=True)
    
    # Usage details
    used_by: str
    action: str = Field(default="applied")  # applied, removed, searched
    resource_type: str = Field(default="data_source")
    resource_id: str
    
    # Context
    context: Optional[str] = None
    usage_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timestamp
    created_at: datetime = Field(default_factory=datetime.now)


# Response Models
class TagResponse(BaseModel):
    """Tag response model"""
    id: int
    name: str
    display_name: Optional[str]
    description: Optional[str]
    color: str
    tag_type: TagType
    scope: TagScope
    category_id: Optional[int]
    icon: Optional[str]
    tag_metadata: Dict[str, Any]
    is_active: bool
    usage_count: int
    last_used: Optional[datetime]
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TagCategoryResponse(BaseModel):
    """Tag category response model"""
    id: int
    name: str
    description: Optional[str]
    color: str
    parent_id: Optional[int]
    sort_order: int
    is_active: bool
    created_by: str
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True


class DataSourceTagResponse(BaseModel):
    """Data source tag response model"""
    id: int
    data_source_id: int
    tag_id: int
    assigned_by: str
    assigned_at: datetime
    context: Optional[str]
    confidence_score: Optional[float]
    auto_assigned: bool
    expires_at: Optional[datetime]
    tag: TagResponse

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    """Tag creation model"""
    name: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    color: str = "#6B7280"
    tag_type: TagType = TagType.USER
    scope: TagScope = TagScope.ORGANIZATION
    category_id: Optional[int] = None
    icon: Optional[str] = None
    tag_metadata: Dict[str, Any] = {}


class TagUpdate(BaseModel):
    """Tag update model"""
    name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    tag_type: Optional[TagType] = None
    scope: Optional[TagScope] = None
    category_id: Optional[int] = None
    icon: Optional[str] = None
    tag_metadata: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class TagAssignRequest(BaseModel):
    """Tag assignment request model"""
    tag_ids: List[int]
    context: Optional[str] = None


class TagStats(BaseModel):
    """Tag statistics model"""
    total_tags: int
    active_tags: int
    system_tags: int
    user_tags: int
    automated_tags: int
    total_assignments: int
    most_used_tags: List[Dict[str, Any]]
    recent_tags: List[TagResponse]
    categories_count: int