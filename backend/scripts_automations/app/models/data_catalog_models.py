"""
Data Catalog Models

Models for data catalog management including data sources, assets, schemas, and lineage.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import Column, String, Text, Boolean, Integer, Float, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship, backref
from pydantic import Field, validator
import uuid
from enum import Enum

from .core_models import (
    BaseModel, TimestampMixin, SoftDeleteMixin, AuditMixin, MetadataMixin,
    BaseSchema, TimestampSchema, AuditSchema, MetadataSchema, RecordStatus
)


class DataSourceType(str, Enum):
    """Data source type enumeration."""
    
    DATABASE = "database"
    FILE_SYSTEM = "file_system"
    CLOUD_STORAGE = "cloud_storage"
    API = "api"
    STREAMING = "streaming"
    DATA_LAKE = "data_lake"
    DATA_WAREHOUSE = "data_warehouse"
    NOSQL = "nosql"
    MESSAGE_QUEUE = "message_queue"


class DataFormat(str, Enum):
    """Data format enumeration."""
    
    CSV = "csv"
    JSON = "json"
    XML = "xml"
    PARQUET = "parquet"
    AVRO = "avro"
    ORC = "orc"
    DELTA = "delta"
    EXCEL = "excel"
    TEXT = "text"
    BINARY = "binary"


class DataQualityScore(str, Enum):
    """Data quality score enumeration."""
    
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNKNOWN = "unknown"


# SQLAlchemy Models

class DataSource(BaseModel, TimestampMixin, SoftDeleteMixin, AuditMixin, MetadataMixin):
    """Data source model representing external data systems."""
    
    __tablename__ = "data_sources"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    type = Column(SQLEnum(DataSourceType), nullable=False, index=True)
    status = Column(SQLEnum(RecordStatus), default=RecordStatus.ACTIVE, index=True)
    
    # Connection details
    connection_string = Column(Text)
    host = Column(String(255))
    port = Column(Integer)
    database_name = Column(String(255))
    schema_name = Column(String(255))
    
    # Authentication
    username = Column(String(255))
    password_encrypted = Column(Text)
    auth_method = Column(String(100))
    
    # Configuration
    config = Column(JSON, default=dict)
    capabilities = Column(ARRAY(String), default=list)
    
    # Statistics
    total_assets = Column(Integer, default=0)
    last_scan_date = Column(DateTime)
    scan_frequency = Column(String(50))  # daily, weekly, monthly
    
    # Relationships
    data_assets = relationship("DataAsset", back_populates="data_source", cascade="all, delete-orphan")
    scan_jobs = relationship("ScanJob", back_populates="data_source")


class DataAsset(BaseModel, TimestampMixin, SoftDeleteMixin, AuditMixin, MetadataMixin):
    """Data asset model representing discoverable data entities."""
    
    __tablename__ = "data_assets"
    
    name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255))
    description = Column(Text)
    type = Column(String(100), nullable=False, index=True)  # table, view, file, etc.
    status = Column(SQLEnum(RecordStatus), default=RecordStatus.ACTIVE, index=True)
    
    # Source reference
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=False, index=True)
    external_id = Column(String(500))  # ID in the source system
    
    # Asset details
    format = Column(SQLEnum(DataFormat))
    size_bytes = Column(Integer)
    row_count = Column(Integer)
    column_count = Column(Integer)
    
    # Quality and governance
    quality_score = Column(SQLEnum(DataQualityScore), default=DataQualityScore.UNKNOWN)
    classification_level = Column(String(50))
    sensitivity_labels = Column(ARRAY(String), default=list)
    
    # Business context
    business_owner = Column(String(255))
    technical_owner = Column(String(255))
    steward = Column(String(255))
    
    # Lineage
    upstream_assets = Column(ARRAY(UUID), default=list)
    downstream_assets = Column(ARRAY(UUID), default=list)
    
    # Statistics
    access_count = Column(Integer, default=0)
    last_accessed = Column(DateTime)
    
    # Relationships
    data_source = relationship("DataSource", back_populates="data_assets")
    schemas = relationship("Schema", back_populates="data_asset", cascade="all, delete-orphan")
    lineage_source = relationship("DataLineage", foreign_keys="DataLineage.source_asset_id", back_populates="source_asset")
    lineage_target = relationship("DataLineage", foreign_keys="DataLineage.target_asset_id", back_populates="target_asset")


class Schema(BaseModel, TimestampMixin, SoftDeleteMixin, AuditMixin, MetadataMixin):
    """Schema model representing data structure."""
    
    __tablename__ = "schemas"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    version = Column(String(50))
    status = Column(SQLEnum(RecordStatus), default=RecordStatus.ACTIVE, index=True)
    
    # Asset reference
    data_asset_id = Column(UUID(as_uuid=True), ForeignKey("data_assets.id"), nullable=False, index=True)
    
    # Schema details
    schema_definition = Column(JSON)  # JSON schema or similar
    validation_rules = Column(JSON, default=list)
    
    # Relationships
    data_asset = relationship("DataAsset", back_populates="schemas")
    tables = relationship("Table", back_populates="schema", cascade="all, delete-orphan")


class Table(BaseModel, TimestampMixin, SoftDeleteMixin, AuditMixin, MetadataMixin):
    """Table model representing tabular data structures."""
    
    __tablename__ = "tables"
    
    name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255))
    description = Column(Text)
    type = Column(String(50))  # table, view, materialized_view
    status = Column(SQLEnum(RecordStatus), default=RecordStatus.ACTIVE, index=True)
    
    # Schema reference
    schema_id = Column(UUID(as_uuid=True), ForeignKey("schemas.id"), nullable=False, index=True)
    
    # Table details
    row_count = Column(Integer)
    size_bytes = Column(Integer)
    partition_info = Column(JSON)
    indexes = Column(JSON, default=list)
    
    # Quality metrics
    completeness_score = Column(Float)
    accuracy_score = Column(Float)
    consistency_score = Column(Float)
    
    # Relationships
    schema = relationship("Schema", back_populates="tables")
    columns = relationship("Column", back_populates="table", cascade="all, delete-orphan")


class Column(BaseModel, TimestampMixin, SoftDeleteMixin, AuditMixin, MetadataMixin):
    """Column model representing individual data fields."""
    
    __tablename__ = "columns"
    
    name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255))
    description = Column(Text)
    data_type = Column(String(100), nullable=False)
    status = Column(SQLEnum(RecordStatus), default=RecordStatus.ACTIVE, index=True)
    
    # Table reference
    table_id = Column(UUID(as_uuid=True), ForeignKey("tables.id"), nullable=False, index=True)
    
    # Column properties
    is_nullable = Column(Boolean, default=True)
    is_primary_key = Column(Boolean, default=False)
    is_foreign_key = Column(Boolean, default=False)
    is_unique = Column(Boolean, default=False)
    default_value = Column(String(500))
    max_length = Column(Integer)
    precision = Column(Integer)
    scale = Column(Integer)
    
    # Data profiling
    distinct_count = Column(Integer)
    null_count = Column(Integer)
    min_value = Column(String(500))
    max_value = Column(String(500))
    avg_value = Column(Float)
    std_deviation = Column(Float)
    
    # Classification
    classification = Column(String(100))
    sensitivity_level = Column(String(50))
    contains_pii = Column(Boolean, default=False)
    
    # Sample data
    sample_values = Column(ARRAY(String), default=list)
    
    # Relationships
    table = relationship("Table", back_populates="columns")


class DataLineage(BaseModel, TimestampMixin, AuditMixin):
    """Data lineage model representing data flow relationships."""
    
    __tablename__ = "data_lineage"
    
    source_asset_id = Column(UUID(as_uuid=True), ForeignKey("data_assets.id"), nullable=False, index=True)
    target_asset_id = Column(UUID(as_uuid=True), ForeignKey("data_assets.id"), nullable=False, index=True)
    
    # Lineage details
    lineage_type = Column(String(50))  # direct, derived, aggregated, etc.
    transformation_logic = Column(Text)
    confidence_score = Column(Float)
    
    # Process information
    process_name = Column(String(255))
    process_type = Column(String(100))  # etl, pipeline, query, etc.
    process_id = Column(String(255))
    
    # Timing information
    frequency = Column(String(50))  # batch, streaming, on-demand
    last_run = Column(DateTime)
    next_run = Column(DateTime)
    
    # Relationships
    source_asset = relationship("DataAsset", foreign_keys=[source_asset_id], back_populates="lineage_source")
    target_asset = relationship("DataAsset", foreign_keys=[target_asset_id], back_populates="lineage_target")


# Pydantic Schemas

class DataSourceBase(BaseSchema):
    """Base data source schema."""
    
    name: str = Field(..., description="Data source name")
    description: Optional[str] = Field(None, description="Data source description")
    type: DataSourceType = Field(..., description="Data source type")
    status: RecordStatus = Field(RecordStatus.ACTIVE, description="Data source status")
    
    host: Optional[str] = Field(None, description="Host address")
    port: Optional[int] = Field(None, description="Port number")
    database_name: Optional[str] = Field(None, description="Database name")
    schema_name: Optional[str] = Field(None, description="Schema name")
    
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Configuration settings")
    capabilities: Optional[List[str]] = Field(default_factory=list, description="Supported capabilities")


class DataSourceCreate(DataSourceBase, MetadataSchema):
    """Schema for creating data sources."""
    
    connection_string: Optional[str] = Field(None, description="Connection string")
    username: Optional[str] = Field(None, description="Username for authentication")
    password: Optional[str] = Field(None, description="Password for authentication")
    auth_method: Optional[str] = Field(None, description="Authentication method")


class DataSourceUpdate(BaseSchema):
    """Schema for updating data sources."""
    
    name: Optional[str] = Field(None, description="Data source name")
    description: Optional[str] = Field(None, description="Data source description")
    status: Optional[RecordStatus] = Field(None, description="Data source status")
    config: Optional[Dict[str, Any]] = Field(None, description="Configuration settings")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata")
    tags: Optional[List[str]] = Field(None, description="Tags")


class DataSourceResponse(DataSourceBase, TimestampSchema, AuditSchema, MetadataSchema):
    """Schema for data source responses."""
    
    id: uuid.UUID = Field(..., description="Unique identifier")
    total_assets: int = Field(0, description="Total number of assets")
    last_scan_date: Optional[datetime] = Field(None, description="Last scan date")
    scan_frequency: Optional[str] = Field(None, description="Scan frequency")


class DataAssetBase(BaseSchema):
    """Base data asset schema."""
    
    name: str = Field(..., description="Asset name")
    display_name: Optional[str] = Field(None, description="Display name")
    description: Optional[str] = Field(None, description="Asset description")
    type: str = Field(..., description="Asset type")
    status: RecordStatus = Field(RecordStatus.ACTIVE, description="Asset status")
    
    format: Optional[DataFormat] = Field(None, description="Data format")
    size_bytes: Optional[int] = Field(None, description="Size in bytes")
    row_count: Optional[int] = Field(None, description="Number of rows")
    column_count: Optional[int] = Field(None, description="Number of columns")
    
    quality_score: DataQualityScore = Field(DataQualityScore.UNKNOWN, description="Quality score")
    classification_level: Optional[str] = Field(None, description="Classification level")
    sensitivity_labels: Optional[List[str]] = Field(default_factory=list, description="Sensitivity labels")
    
    business_owner: Optional[str] = Field(None, description="Business owner")
    technical_owner: Optional[str] = Field(None, description="Technical owner")
    steward: Optional[str] = Field(None, description="Data steward")


class DataAssetCreate(DataAssetBase, MetadataSchema):
    """Schema for creating data assets."""
    
    data_source_id: uuid.UUID = Field(..., description="Data source ID")
    external_id: Optional[str] = Field(None, description="External system ID")


class DataAssetUpdate(BaseSchema):
    """Schema for updating data assets."""
    
    display_name: Optional[str] = Field(None, description="Display name")
    description: Optional[str] = Field(None, description="Asset description")
    status: Optional[RecordStatus] = Field(None, description="Asset status")
    classification_level: Optional[str] = Field(None, description="Classification level")
    sensitivity_labels: Optional[List[str]] = Field(None, description="Sensitivity labels")
    business_owner: Optional[str] = Field(None, description="Business owner")
    technical_owner: Optional[str] = Field(None, description="Technical owner")
    steward: Optional[str] = Field(None, description="Data steward")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata")
    tags: Optional[List[str]] = Field(None, description="Tags")


class DataAssetResponse(DataAssetBase, TimestampSchema, AuditSchema, MetadataSchema):
    """Schema for data asset responses."""
    
    id: uuid.UUID = Field(..., description="Unique identifier")
    data_source_id: uuid.UUID = Field(..., description="Data source ID")
    external_id: Optional[str] = Field(None, description="External system ID")
    access_count: int = Field(0, description="Access count")
    last_accessed: Optional[datetime] = Field(None, description="Last accessed date")


class DataLineageBase(BaseSchema):
    """Base data lineage schema."""
    
    source_asset_id: uuid.UUID = Field(..., description="Source asset ID")
    target_asset_id: uuid.UUID = Field(..., description="Target asset ID")
    lineage_type: str = Field(..., description="Lineage type")
    transformation_logic: Optional[str] = Field(None, description="Transformation logic")
    confidence_score: Optional[float] = Field(None, description="Confidence score")
    process_name: Optional[str] = Field(None, description="Process name")
    process_type: Optional[str] = Field(None, description="Process type")
    frequency: Optional[str] = Field(None, description="Execution frequency")


class DataLineageCreate(DataLineageBase):
    """Schema for creating data lineage."""
    pass


class DataLineageResponse(DataLineageBase, TimestampSchema, AuditSchema):
    """Schema for data lineage responses."""
    
    id: uuid.UUID = Field(..., description="Unique identifier")
    last_run: Optional[datetime] = Field(None, description="Last run date")
    next_run: Optional[datetime] = Field(None, description="Next run date")