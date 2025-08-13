"""
Advanced Data Lineage Models for Enterprise Data Governance System
================================================================

This module contains sophisticated models for tracking data lineage with column-level
granularity, impact analysis, and real-time lineage updates across complex
enterprise data ecosystems.

Features:
- Column-level lineage tracking with transformation logic
- Real-time lineage updates with streaming support
- Impact analysis and dependency mapping
- Cross-system lineage with cloud and hybrid support
- Advanced visualization models for complex graphs
- Performance optimization for large-scale lineage graphs
- Integration with all data governance components
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, ARRAY, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple, Generic, TypeVar
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator, Field as PydanticField
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
import networkx as nx

# ===================== ENUMS AND CONSTANTS =====================

class LineageType(str, Enum):
    """Types of data lineage relationships"""
    TABLE_TO_TABLE = "table_to_table"
    COLUMN_TO_COLUMN = "column_to_column"
    VIEW_DEPENDENCY = "view_dependency"
    ETL_TRANSFORMATION = "etl_transformation"
    API_CONSUMPTION = "api_consumption"
    REPORT_USAGE = "report_usage"
    ML_TRAINING = "ml_training"
    STREAM_PROCESSING = "stream_processing"
    CUSTOM_LOGIC = "custom_logic"

class LineageDirection(str, Enum):
    """Direction of lineage flow"""
    UPSTREAM = "upstream"      # Sources that feed into this asset
    DOWNSTREAM = "downstream"  # Assets that consume from this asset
    BIDIRECTIONAL = "bidirectional"  # Two-way relationship

class TransformationType(str, Enum):
    """Types of data transformations"""
    DIRECT_COPY = "direct_copy"
    AGGREGATION = "aggregation"
    JOIN = "join"
    FILTER = "filter"
    CALCULATION = "calculation"
    LOOKUP = "lookup"
    SPLIT = "split"
    MERGE = "merge"
    PIVOT = "pivot"
    UNPIVOT = "unpivot"
    CUSTOM_FUNCTION = "custom_function"
    ML_PREDICTION = "ml_prediction"

class LineageConfidence(str, Enum):
    """Confidence levels for lineage detection"""
    VERIFIED = "verified"      # Manually verified or 100% certain
    HIGH = "high"             # 95-99% confidence
    MEDIUM = "medium"         # 80-94% confidence
    LOW = "low"              # 60-79% confidence
    INFERRED = "inferred"     # Best guess based on patterns

class ImpactSeverity(str, Enum):
    """Severity levels for impact analysis"""
    CRITICAL = "critical"     # Business-critical impact
    HIGH = "high"            # High business impact
    MEDIUM = "medium"        # Moderate impact
    LOW = "low"             # Low impact
    MINIMAL = "minimal"      # Minimal impact

# ===================== BASE LINEAGE MODELS =====================

class DataLineageNode(SQLModel, table=True):
    """
    Represents a node in the data lineage graph.
    Can be tables, columns, views, or any data asset.
    """
    __tablename__ = "data_lineage_nodes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    node_id: str = Field(index=True, unique=True)  # Unique identifier
    asset_type: str = Field(index=True)  # table, column, view, etc.
    asset_name: str = Field(index=True)
    schema_name: Optional[str] = Field(default=None, index=True)
    database_name: Optional[str] = Field(default=None, index=True)
    data_source_id: Optional[int] = Field(default=None, foreign_key="data_sources.id")
    
    # Hierarchical relationships
    parent_node_id: Optional[str] = Field(default=None, index=True)
    root_node_id: Optional[str] = Field(default=None, index=True)
    
    # Asset metadata
    data_type: Optional[str] = Field(default=None)
    is_nullable: Optional[bool] = Field(default=None)
    default_value: Optional[str] = Field(default=None)
    column_position: Optional[int] = Field(default=None)
    
    # Classification and sensitivity
    classification_id: Optional[int] = Field(default=None, foreign_key="data_classifications.id")
    sensitivity_level: Optional[str] = Field(default=None)
    
    # Governance metadata
    business_name: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    business_glossary_id: Optional[int] = Field(default=None)
    data_steward: Optional[str] = Field(default=None)
    
    # Technical metadata
    physical_location: Optional[str] = Field(default=None)
    partitioning_info: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    indexing_info: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Quality and usage metrics
    quality_score: Optional[float] = Field(default=None)
    usage_frequency: Optional[int] = Field(default=0)
    last_accessed: Optional[datetime] = Field(default=None)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(default="system")
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    
    # Relationships
    outgoing_edges: List["DataLineageEdge"] = Relationship(
        back_populates="source_node",
        sa_relationship_kwargs={"foreign_keys": "DataLineageEdge.source_node_id"}
    )
    incoming_edges: List["DataLineageEdge"] = Relationship(
        back_populates="target_node",
        sa_relationship_kwargs={"foreign_keys": "DataLineageEdge.target_node_id"}
    )
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_lineage_node_asset', 'asset_type', 'asset_name'),
        Index('idx_lineage_node_hierarchy', 'parent_node_id', 'root_node_id'),
        Index('idx_lineage_node_source', 'data_source_id', 'schema_name'),
    )

class DataLineageEdge(SQLModel, table=True):
    """
    Represents a relationship between two data lineage nodes.
    Captures transformation logic and lineage metadata.
    """
    __tablename__ = "data_lineage_edges"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    edge_id: str = Field(index=True, unique=True)
    
    # Source and target nodes
    source_node_id: str = Field(foreign_key="data_lineage_nodes.node_id", index=True)
    target_node_id: str = Field(foreign_key="data_lineage_nodes.node_id", index=True)
    
    # Lineage metadata
    lineage_type: LineageType = Field(index=True)
    lineage_direction: LineageDirection = Field(default=LineageDirection.DOWNSTREAM)
    transformation_type: Optional[TransformationType] = Field(default=None)
    confidence_level: LineageConfidence = Field(default=LineageConfidence.INFERRED)
    
    # Transformation details
    transformation_logic: Optional[str] = Field(default=None, sa_column=Column(Text))
    transformation_sql: Optional[str] = Field(default=None, sa_column=Column(Text))
    transformation_parameters: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Processing information
    process_name: Optional[str] = Field(default=None)
    process_type: Optional[str] = Field(default=None)  # ETL, ELT, Stream, etc.
    process_id: Optional[str] = Field(default=None)
    job_name: Optional[str] = Field(default=None)
    
    # Timing information
    execution_frequency: Optional[str] = Field(default=None)  # daily, hourly, real-time
    last_execution: Optional[datetime] = Field(default=None)
    next_execution: Optional[datetime] = Field(default=None)
    execution_duration_seconds: Optional[int] = Field(default=None)
    
    # Quality and performance metrics
    success_rate: Optional[float] = Field(default=None)
    average_processing_time: Optional[float] = Field(default=None)
    data_volume_processed: Optional[int] = Field(default=None)
    
    # Business context
    business_rule: Optional[str] = Field(default=None, sa_column=Column(Text))
    business_justification: Optional[str] = Field(default=None, sa_column=Column(Text))
    data_owner: Optional[str] = Field(default=None)
    
    # Impact analysis
    impact_score: Optional[float] = Field(default=None)
    criticality_level: Optional[ImpactSeverity] = Field(default=None)
    downstream_count: Optional[int] = Field(default=0)
    
    # Validation and monitoring
    is_validated: bool = Field(default=False)
    validation_date: Optional[datetime] = Field(default=None)
    validation_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(default="system")
    discovery_method: Optional[str] = Field(default=None)  # scan, manual, import
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    
    # Relationships
    source_node: Optional[DataLineageNode] = Relationship(
        back_populates="outgoing_edges",
        sa_relationship_kwargs={"foreign_keys": "DataLineageEdge.source_node_id"}
    )
    target_node: Optional[DataLineageNode] = Relationship(
        back_populates="incoming_edges",
        sa_relationship_kwargs={"foreign_keys": "DataLineageEdge.target_node_id"}
    )
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_lineage_edge_source_target', 'source_node_id', 'target_node_id'),
        Index('idx_lineage_edge_type', 'lineage_type', 'transformation_type'),
        Index('idx_lineage_edge_process', 'process_name', 'process_type'),
        UniqueConstraint('source_node_id', 'target_node_id', 'lineage_type', 
                        name='uq_lineage_relationship'),
    )

class LineageImpactAnalysis(SQLModel, table=True):
    """
    Stores impact analysis results for lineage changes.
    Used for change impact assessment and risk analysis.
    """
    __tablename__ = "lineage_impact_analysis"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_id: str = Field(index=True, unique=True)
    
    # Source of change
    source_node_id: str = Field(foreign_key="data_lineage_nodes.node_id", index=True)
    change_type: str = Field(index=True)  # schema_change, data_change, deletion, etc.
    change_description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Impact scope
    total_downstream_assets: int = Field(default=0)
    critical_assets_affected: int = Field(default=0)
    reports_affected: int = Field(default=0)
    dashboards_affected: int = Field(default=0)
    ml_models_affected: int = Field(default=0)
    
    # Risk assessment
    overall_risk_score: float = Field(default=0.0)
    business_impact_score: float = Field(default=0.0)
    technical_complexity_score: float = Field(default=0.0)
    
    # Affected assets details
    affected_assets: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    critical_path_assets: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    
    # Recommendations
    recommended_actions: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    mitigation_strategies: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    estimated_effort_hours: Optional[int] = Field(default=None)
    
    # Stakeholder information
    affected_teams: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    notification_list: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    approvers_required: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    
    # Analysis metadata
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    analyst: str = Field(default="system")
    analysis_version: str = Field(default="1.0")
    confidence_score: float = Field(default=0.0)
    
    # Status tracking
    status: str = Field(default="draft", index=True)  # draft, approved, implemented
    approval_date: Optional[datetime] = Field(default=None)
    implementation_date: Optional[datetime] = Field(default=None)
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_impact_analysis_source', 'source_node_id', 'change_type'),
        Index('idx_impact_analysis_risk', 'overall_risk_score', 'business_impact_score'),
    )

class LineageVisualizationConfig(SQLModel, table=True):
    """
    Configuration for lineage visualization and graph rendering.
    Supports different layout algorithms and visualization options.
    """
    __tablename__ = "lineage_visualization_configs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    config_id: str = Field(index=True, unique=True)
    config_name: str = Field(index=True)
    
    # Visualization settings
    layout_algorithm: str = Field(default="hierarchical")  # hierarchical, force, circular
    max_depth: int = Field(default=5)
    max_nodes: int = Field(default=1000)
    show_column_lineage: bool = Field(default=True)
    show_transformation_details: bool = Field(default=True)
    
    # Node styling
    node_styling: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    edge_styling: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    # Filtering options
    asset_type_filters: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    confidence_threshold: float = Field(default=0.7)
    exclude_system_processes: bool = Field(default=True)
    
    # Performance settings
    enable_clustering: bool = Field(default=True)
    cluster_threshold: int = Field(default=50)
    lazy_loading: bool = Field(default=True)
    
    # User preferences
    created_by: str = Field(index=True)
    is_public: bool = Field(default=False)
    is_default: bool = Field(default=False)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True

# ===================== LINEAGE ANALYSIS MODELS =====================

class LineageMetrics(SQLModel, table=True):
    """
    Performance and quality metrics for lineage tracking.
    Used for monitoring and optimization of lineage systems.
    """
    __tablename__ = "lineage_metrics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str = Field(index=True, unique=True)
    
    # Scope
    node_id: Optional[str] = Field(default=None, foreign_key="data_lineage_nodes.node_id")
    edge_id: Optional[str] = Field(default=None, foreign_key="data_lineage_edges.edge_id")
    metric_scope: str = Field(index=True)  # node, edge, system, global
    
    # Metric details
    metric_name: str = Field(index=True)
    metric_value: float = Field(index=True)
    metric_unit: Optional[str] = Field(default=None)
    metric_category: str = Field(index=True)  # performance, quality, usage
    
    # Context
    measurement_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    measurement_period: Optional[str] = Field(default=None)  # hour, day, week, month
    
    # Comparison data
    previous_value: Optional[float] = Field(default=None)
    baseline_value: Optional[float] = Field(default=None)
    target_value: Optional[float] = Field(default=None)
    
    # Status
    is_within_threshold: Optional[bool] = Field(default=None)
    alert_threshold: Optional[float] = Field(default=None)
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_lineage_metrics_scope', 'metric_scope', 'metric_name'),
        Index('idx_lineage_metrics_date', 'measurement_date', 'metric_category'),
    )

# ===================== PYDANTIC MODELS FOR API =====================

class LineageNodeCreate(BaseModel):
    """Model for creating new lineage nodes"""
    node_id: str
    asset_type: str
    asset_name: str
    schema_name: Optional[str] = None
    database_name: Optional[str] = None
    data_source_id: Optional[int] = None
    parent_node_id: Optional[str] = None
    classification_id: Optional[int] = None
    business_name: Optional[str] = None
    description: Optional[str] = None
    custom_properties: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class LineageEdgeCreate(BaseModel):
    """Model for creating new lineage edges"""
    edge_id: str
    source_node_id: str
    target_node_id: str
    lineage_type: LineageType
    transformation_type: Optional[TransformationType] = None
    confidence_level: LineageConfidence = LineageConfidence.INFERRED
    transformation_logic: Optional[str] = None
    process_name: Optional[str] = None
    business_rule: Optional[str] = None
    custom_properties: Optional[Dict[str, Any]] = None

class LineageGraphResponse(BaseModel):
    """Response model for lineage graph queries"""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    total_nodes: int
    total_edges: int
    depth_levels: int
    has_more: bool
    query_metadata: Dict[str, Any]

class ImpactAnalysisResponse(BaseModel):
    """Response model for impact analysis"""
    analysis_id: str
    source_node_id: str
    total_affected_assets: int
    risk_score: float
    critical_assets: List[Dict[str, Any]]
    recommended_actions: List[str]
    affected_teams: List[str]
    analysis_date: datetime