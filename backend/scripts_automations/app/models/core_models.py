"""
Core Model Classes

Base classes and mixins for all data models in the system.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBaseModel, Field
from enum import Enum

Base = declarative_base()


class BaseModel(Base):
    """Base model class with common fields and methods."""
    
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary."""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Update model instance from dictionary."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SoftDeleteMixin:
    """Mixin for soft delete functionality."""
    
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
    
    def soft_delete(self):
        """Mark record as deleted."""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
    
    def restore(self):
        """Restore soft deleted record."""
        self.is_deleted = False
        self.deleted_at = None


class AuditMixin:
    """Mixin for audit trail fields."""
    
    created_by = Column(UUID(as_uuid=True), nullable=True, index=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True, index=True)
    version = Column(Integer, default=1, nullable=False)
    
    def increment_version(self):
        """Increment version number."""
        self.version += 1


class MetadataMixin:
    """Mixin for flexible metadata storage."""
    
    metadata = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    
    def add_metadata(self, key: str, value: Any):
        """Add metadata key-value pair."""
        if self.metadata is None:
            self.metadata = {}
        self.metadata[key] = value
    
    def get_metadata(self, key: str, default: Any = None):
        """Get metadata value by key."""
        if self.metadata is None:
            return default
        return self.metadata.get(key, default)
    
    def add_tag(self, tag: str):
        """Add tag to the record."""
        if self.tags is None:
            self.tags = []
        if tag not in self.tags:
            self.tags.append(tag)
    
    def remove_tag(self, tag: str):
        """Remove tag from the record."""
        if self.tags and tag in self.tags:
            self.tags.remove(tag)


# Pydantic Base Models for API Schemas

class BaseSchema(PydanticBaseModel):
    """Base Pydantic schema with common configuration."""
    
    class Config:
        from_attributes = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            uuid.UUID: lambda v: str(v)
        }


class TimestampSchema(BaseSchema):
    """Schema mixin for timestamp fields."""
    
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class AuditSchema(BaseSchema):
    """Schema mixin for audit fields."""
    
    created_by: Optional[uuid.UUID] = Field(None, description="User who created the record")
    updated_by: Optional[uuid.UUID] = Field(None, description="User who last updated the record")
    version: int = Field(1, description="Record version number")


class MetadataSchema(BaseSchema):
    """Schema mixin for metadata fields."""
    
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Flexible metadata storage")
    tags: Optional[list[str]] = Field(default_factory=list, description="Tags associated with the record")


# Enums for common status fields

class RecordStatus(str, Enum):
    """Common status enumeration."""
    
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    ARCHIVED = "archived"
    DELETED = "deleted"


class ProcessingStatus(str, Enum):
    """Processing status enumeration."""
    
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"


class SeverityLevel(str, Enum):
    """Severity level enumeration."""
    
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Priority(str, Enum):
    """Priority level enumeration."""
    
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"