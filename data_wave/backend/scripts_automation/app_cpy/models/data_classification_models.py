"""
Advanced Data Classification Models for Enterprise Data Governance System
=======================================================================

This module contains sophisticated models for managing data classifications
with comprehensive sensitivity levels, compliance frameworks, and automated
classification capabilities for enterprise data governance.

Features:
- Multi-level classification system with inheritance
- Regulatory compliance mapping
- AI-powered classification suggestions
- Classification impact analysis
- Audit and history tracking
- Integration with data lineage and catalog systems
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, ARRAY, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime
from enum import Enum
import uuid
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

# ===================== ENUMS AND CONSTANTS =====================

class ClassificationLevel(str, Enum):
    """Standard classification levels for data sensitivity"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    CLASSIFIED = "classified"

class ComplianceFramework(str, Enum):
    """Major compliance frameworks for classification mapping"""
    GDPR = "gdpr"
    CCPA = "ccpa"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"
    SOX = "sox"
    GLBA = "glba"
    FERPA = "ferpa"
    FISMA = "fisma"
    ISO27001 = "iso27001"
    CUSTOM = "custom"

class ClassificationSource(str, Enum):
    """Source of the classification assignment"""
    MANUAL = "manual"
    AUTOMATED = "automated"
    ML_SUGGESTED = "ml_suggested"
    PATTERN_BASED = "pattern_based"
    INHERITED = "inherited"
    THIRD_PARTY = "third_party"

# ===================== BASE CLASSIFICATION MODELS =====================

class DataClassification(SQLModel, table=True):
    """
    Primary classification model for data assets.
    Provides comprehensive classification capabilities with
    regulatory mapping and inheritance.
    """
    __tablename__ = "data_classifications"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    classification_id: str = Field(index=True, unique=True)
    
    # Classification details
    name: str = Field(index=True)
    display_name: str = Field(index=True)
    level: ClassificationLevel = Field(default=ClassificationLevel.INTERNAL, index=True)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Hierarchical structure
    parent_id: Optional[int] = Field(default=None, foreign_key="data_classifications.id")
    is_system_default: bool = Field(default=False)
    
    # Compliance and regulatory mapping
    compliance_frameworks: Optional[str] = Field(default=None, sa_column=Column(JSON))
    regulatory_references: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage controls
    data_handling_requirements: Optional[str] = Field(default=None, sa_column=Column(Text))
    access_restrictions: Optional[str] = Field(default=None, sa_column=Column(JSON))
    retention_period_days: Optional[int] = Field(default=None)
    requires_approval: bool = Field(default=False)
    
    # Visual representation
    color_code: Optional[str] = Field(default=None)
    icon: Optional[str] = Field(default=None)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(default="system")
    updated_by: Optional[str] = Field(default=None)
    
    # Additional properties
    custom_properties: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    lineage_nodes: List["DataLineageNode"] = Relationship(back_populates="classification")
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_classification_level', 'level'),
        Index('idx_classification_system', 'is_system_default'),
    )

class DataClassificationRule(SQLModel, table=True):
    """
    Rules for automated classification of data assets.
    Supports pattern matching, ML-based classification, and custom logic.
    """
    __tablename__ = "data_classification_rules"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: str = Field(index=True, unique=True)
    
    # Rule details
    name: str = Field(index=True)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    classification_id: int = Field(foreign_key="data_classifications.id", index=True)
    
    # Rule configuration
    rule_type: str = Field(index=True)  # pattern, ml, custom
    rule_pattern: Optional[str] = Field(default=None, sa_column=Column(Text))
    rule_logic: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Scope and applicability
    applies_to_schemas: Optional[str] = Field(default=None, sa_column=Column(JSON))
    applies_to_tables: Optional[str] = Field(default=None, sa_column=Column(JSON))
    applies_to_columns: Optional[str] = Field(default=None, sa_column=Column(JSON))
    exclude_patterns: Optional[str] = Field(default=None, sa_column=Column(JSON))
    
    # Rule behavior
    priority: int = Field(default=100)
    confidence_threshold: float = Field(default=0.8)
    is_active: bool = Field(default=True)
    requires_approval: bool = Field(default=True)
    
    # Performance and metrics
    execution_order: int = Field(default=0)
    last_execution_time_ms: Optional[int] = Field(default=None)
    match_count: int = Field(default=0)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(default="system")
    updated_by: Optional[str] = Field(default=None)
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_classification_rule_type', 'rule_type'),
        Index('idx_classification_rule_active', 'is_active', 'priority'),
    )

class ClassificationAssignment(SQLModel, table=True):
    """
    Records of classification assignments to data assets.
    Tracks the history and provenance of classifications.
    """
    __tablename__ = "classification_assignments"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: str = Field(index=True, unique=True)
    
    # Asset identification
    asset_type: str = Field(index=True)  # table, column, schema, etc.
    asset_id: str = Field(index=True)
    asset_name: str = Field(index=True)
    
    # Classification details
    classification_id: int = Field(foreign_key="data_classifications.id", index=True)
    rule_id: Optional[str] = Field(default=None, index=True)
    
    # Assignment metadata
    source: ClassificationSource = Field(default=ClassificationSource.MANUAL)
    confidence_score: Optional[float] = Field(default=None)
    justification: Optional[str] = Field(default=None, sa_column=Column(Text))
    evidence: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Approval workflow
    status: str = Field(default="active", index=True)  # pending, active, rejected, superseded
    approved_by: Optional[str] = Field(default=None)
    approval_date: Optional[datetime] = Field(default=None)
    
    # Temporal tracking
    effective_from: datetime = Field(default_factory=datetime.utcnow)
    effective_to: Optional[datetime] = Field(default=None)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(default="system")
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_classification_assignment_asset', 'asset_type', 'asset_id'),
        Index('idx_classification_assignment_status', 'status', 'effective_from'),
    )

# ===================== PYDANTIC MODELS FOR API =====================

class ClassificationCreate(BaseModel):
    """Model for creating new classifications"""
    name: str
    display_name: str
    level: ClassificationLevel
    description: Optional[str] = None
    parent_id: Optional[int] = None
    compliance_frameworks: List[ComplianceFramework] = []
    data_handling_requirements: Optional[str] = None
    access_restrictions: List[str] = []
    retention_period_days: Optional[int] = None
    custom_properties: Dict[str, Any] = {}

class DataClassificationRuleCreate(BaseModel):
    """Model for creating new classification rules"""
    name: str
    description: Optional[str] = None
    classification_id: int
    rule_type: str
    rule_pattern: Optional[str] = None
    rule_logic: Dict[str, Any] = {}
    applies_to_schemas: List[str] = []
    applies_to_tables: List[str] = []
    applies_to_columns: List[str] = []
    priority: int = 100
    confidence_threshold: float = 0.8
    is_active: bool = True

class ClassificationAssignmentCreate(BaseModel):
    """Model for creating new classification assignments"""
    asset_type: str
    asset_id: str
    asset_name: str
    classification_id: int
    rule_id: Optional[str] = None
    source: ClassificationSource = ClassificationSource.MANUAL
    confidence_score: Optional[float] = None
    justification: Optional[str] = None
    evidence: Dict[str, Any] = {}