from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json


class CatalogItemType(str, Enum):
    DATABASE = "database"
    SCHEMA = "schema"
    TABLE = "table"
    VIEW = "view"
    COLUMN = "column"
    INDEX = "index"
    PROCEDURE = "procedure"
    FUNCTION = "function"


class DataClassification(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class CatalogItem(SQLModel, table=True):
    """Catalog item model for data assets"""
    __tablename__ = "catalog_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    type: CatalogItemType
    description: Optional[str] = None
    
    # Metadata
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    column_name: Optional[str] = None
    
    # Classification and ownership
    classification: DataClassification = Field(default=DataClassification.INTERNAL)
    owner: Optional[str] = None
    steward: Optional[str] = None
    
    # Quality and popularity metrics
    quality_score: float = Field(default=0.0)
    popularity_score: float = Field(default=0.0)
    
    # Technical metadata
    data_type: Optional[str] = None
    size_bytes: Optional[int] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    
    # Data profiling
    null_percentage: Optional[float] = None
    unique_values: Optional[int] = None
    min_value: Optional[str] = None
    max_value: Optional[str] = None
    avg_value: Optional[str] = None
    
    # Usage statistics
    query_count: int = Field(default=0)
    user_count: int = Field(default=0)
    avg_response_time: Optional[float] = None
    
    # Lineage and relationships
    parent_id: Optional[int] = Field(foreign_key="catalog_items.id")
    parent: Optional["CatalogItem"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "CatalogItem.id"}
    )
    children: List["CatalogItem"] = Relationship(back_populates="parent")
    
    # Organization linkage for multi-tenant enterprise governance
    organization_id: Optional[int] = Field(default=None, foreign_key="organizations.id", index=True)
    
    # Organization relationship for enterprise governance
    organization: Optional["Organization"] = Relationship(back_populates="catalog_items")
    
    # Data source relationship
    data_source_id: int = Field(foreign_key="datasource.id")
    data_source: Optional["DataSource"] = Relationship(back_populates="catalog_items")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None


class CatalogTag(SQLModel, table=True):
    """Tags for catalog items"""
    __tablename__ = "catalog_tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    color: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None


class CatalogItemTag(SQLModel, table=True):
    """Many-to-many relationship between catalog items and tags"""
    __tablename__ = "catalog_item_tags"
    
    catalog_item_id: int = Field(foreign_key="catalog_items.id", primary_key=True)
    tag_id: int = Field(foreign_key="catalog_tags.id", primary_key=True)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None


class DataLineage(SQLModel, table=True):
    """Data lineage relationships"""
    __tablename__ = "data_lineage"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    source_item_id: int = Field(foreign_key="catalog_items.id")
    target_item_id: int = Field(foreign_key="catalog_items.id")
    
    # Lineage details
    lineage_type: str  # "read", "write", "transform", "copy"
    transformation_logic: Optional[str] = None
    confidence_score: float = Field(default=1.0)
    
    # Relationships
    source_item: Optional[CatalogItem] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "DataLineage.source_item_id"}
    )
    target_item: Optional[CatalogItem] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "DataLineage.target_item_id"}
    )
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: Optional[datetime] = None
    created_by: Optional[str] = None


class CatalogUsageLog(SQLModel, table=True):
    """Usage logs for catalog items"""
    __tablename__ = "catalog_usage_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    catalog_item_id: int = Field(foreign_key="catalog_items.id")
    
    # Usage details
    user_id: Optional[str] = None
    query_text: Optional[str] = None
    operation_type: str  # "select", "insert", "update", "delete"
    response_time_ms: Optional[int] = None
    rows_returned: Optional[int] = None
    
    # Audit fields
    accessed_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    catalog_item: Optional[CatalogItem] = Relationship()


class CatalogQualityRule(SQLModel, table=True):
    """Data quality rules for catalog items"""
    __tablename__ = "catalog_quality_rules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    catalog_item_id: int = Field(foreign_key="catalog_items.id")
    
    # Rule details
    name: str
    description: Optional[str] = None
    rule_type: str  # "completeness", "accuracy", "consistency", "validity"
    rule_expression: str
    threshold: float = Field(default=0.0)
    
    # Execution details
    is_active: bool = Field(default=True)
    last_executed: Optional[datetime] = None
    last_score: Optional[float] = None
    
    # Relationships
    catalog_item: Optional[CatalogItem] = Relationship()
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None


# Response models
class CatalogItemResponse(SQLModel):
    id: int
    name: str
    type: CatalogItemType
    description: Optional[str] = None
    classification: DataClassification
    owner: Optional[str] = None
    quality_score: float
    popularity_score: float
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    query_count: int
    user_count: int
    avg_response_time: Optional[float] = None
    data_source_id: int
    created_at: datetime
    updated_at: datetime
    last_accessed: Optional[datetime] = None
    tags: List[str] = []


class CatalogTagResponse(SQLModel):
    """Response model for catalog tags"""
    id: int
    name: str
    color: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime
    created_by: Optional[str] = None
    usage_count: int = 0


class DataLineageResponse(SQLModel):
    """Response model for data lineage"""
    id: int
    source_item_id: int
    target_item_id: int
    lineage_type: str
    transformation_logic: Optional[str] = None
    confidence_score: float
    created_at: datetime
    last_accessed: Optional[datetime] = None
    created_by: Optional[str] = None
    source_item_name: Optional[str] = None
    target_item_name: Optional[str] = None


class CatalogItemCreate(SQLModel):
    name: str
    type: CatalogItemType
    description: Optional[str] = None
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    column_name: Optional[str] = None
    classification: DataClassification = Field(default=DataClassification.INTERNAL)
    owner: Optional[str] = None
    data_source_id: int
    parent_id: Optional[int] = None


class CatalogItemUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    classification: Optional[DataClassification] = None
    owner: Optional[str] = None
    quality_score: Optional[float] = None
    popularity_score: Optional[float] = None


class CatalogStats(SQLModel):
    total_items: int
    items_by_type: Dict[str, int]
    items_by_classification: Dict[str, int]
    avg_quality_score: float
    total_queries: int
    unique_users: int
    last_updated: Optional[datetime] = None


class CatalogSearchRequest(SQLModel):
    query: Optional[str] = None
    type_filter: Optional[CatalogItemType] = None
    classification_filter: Optional[DataClassification] = None
    owner_filter: Optional[str] = None
    tag_filter: Optional[List[str]] = None
    min_quality_score: Optional[float] = None
    limit: int = Field(default=50)
    offset: int = Field(default=0)

# Import necessary types for forward references
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .organization_models import Organization