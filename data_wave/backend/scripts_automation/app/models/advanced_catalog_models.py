"""
Advanced Data Catalog Models for Enterprise Data Governance System
================================================================

This module contains sophisticated models for intelligent data catalog management,
AI-powered asset discovery, comprehensive lineage tracking, and advanced
data quality management with seamless integration across all data governance systems.

Features:
- Intelligent data asset discovery with AI/ML capabilities
- Advanced lineage tracking with column-level granularity
- Comprehensive quality management and profiling
- Business glossary integration with semantic understanding
- Real-time asset monitoring and alerting
- Enterprise audit trails and compliance tracking
- Deep integration with scan rules, compliance, and classification systems
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

# AI/ML imports for semantic understanding
import numpy as np
from typing_extensions import Annotated

# ===================== ENUMS AND CONSTANTS =====================

class AssetType(str, Enum):
    """Types of data assets in the catalog"""
    TABLE = "table"
    VIEW = "view"
    STORED_PROCEDURE = "stored_procedure"
    FUNCTION = "function"
    DATASET = "dataset"
    FILE = "file"
    STREAM = "stream"
    API = "api"
    REPORT = "report"
    DASHBOARD = "dashboard"
    MODEL = "model"
    PIPELINE = "pipeline"
    SCHEMA = "schema"
    DATABASE = "database"

class AssetStatus(str, Enum):
    """Lifecycle status of data assets"""
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    QUARANTINED = "quarantined"
    MIGRATING = "migrating"
    DELETED = "deleted"

class DataQuality(str, Enum):
    """Data quality levels"""
    EXCELLENT = "excellent"      # 95-100%
    GOOD = "good"               # 85-94%
    FAIR = "fair"               # 70-84%
    POOR = "poor"               # 50-69%
    CRITICAL = "critical"       # <50%
    UNKNOWN = "unknown"

class LineageDirection(str, Enum):
    """Direction of lineage relationships"""
    UPSTREAM = "upstream"       # Data flows from this asset
    DOWNSTREAM = "downstream"   # Data flows to this asset
    BIDIRECTIONAL = "bidirectional"

class LineageType(str, Enum):
    """Types of lineage relationships"""
    TABLE_TO_TABLE = "table_to_table"
    COLUMN_TO_COLUMN = "column_to_column"
    TRANSFORMATION = "transformation"
    AGGREGATION = "aggregation"
    JOIN = "join"
    FILTER = "filter"
    COMPUTED = "computed"
    DERIVED = "derived"
    COPY = "copy"
    ETL_PROCESS = "etl_process"

class DiscoveryMethod(str, Enum):
    """Methods used for asset discovery"""
    AUTOMATED_SCAN = "automated_scan"
    AI_DETECTION = "ai_detection"
    PATTERN_MATCHING = "pattern_matching"
    METADATA_IMPORT = "metadata_import"
    MANUAL_ENTRY = "manual_entry"
    API_INTEGRATION = "api_integration"
    LINEAGE_INFERENCE = "lineage_inference"
    ML_CLASSIFICATION = "ml_classification"

class AssetCriticality(str, Enum):
    """Business criticality levels"""
    MISSION_CRITICAL = "mission_critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    EXPERIMENTAL = "experimental"

class DataSensitivity(str, Enum):
    """Data sensitivity classifications"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"

class UsageFrequency(str, Enum):
    """Asset usage frequency patterns"""
    REAL_TIME = "real_time"     # Continuous usage
    HOURLY = "hourly"           # Multiple times per hour
    DAILY = "daily"             # Daily usage
    WEEKLY = "weekly"           # Weekly usage
    MONTHLY = "monthly"         # Monthly usage
    QUARTERLY = "quarterly"     # Quarterly usage
    RARELY = "rarely"           # Infrequent usage
    UNKNOWN = "unknown"


# ===================== CORE CATALOG MODELS =====================

class IntelligentDataAsset(SQLModel, table=True):
    """
    Advanced data asset model with AI-powered discovery, comprehensive metadata,
    and intelligent quality management.
    
    This model represents a sophisticated approach to data asset management with:
    - AI-enhanced metadata extraction and enrichment
    - Real-time quality monitoring and profiling
    - Semantic understanding and auto-tagging
    - Business context awareness
    - Comprehensive lineage integration
    """
    __tablename__ = "intelligent_data_assets"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_uuid: str = Field(index=True, unique=True, description="Globally unique asset identifier")
    qualified_name: str = Field(index=True, unique=True, description="Fully qualified asset name")
    display_name: str = Field(max_length=255, description="Human-readable display name")
    description: Optional[str] = Field(sa_column=Column(Text), description="Asset description")
    
    # Asset Classification
    asset_type: AssetType = Field(index=True, description="Type of data asset")
    asset_status: AssetStatus = Field(default=AssetStatus.ACTIVE, index=True)
    asset_criticality: AssetCriticality = Field(default=AssetCriticality.MEDIUM, index=True)
    data_sensitivity: DataSensitivity = Field(default=DataSensitivity.INTERNAL, index=True)
    
    # Location and Source Information
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    database_name: Optional[str] = Field(max_length=255, index=True)
    schema_name: Optional[str] = Field(max_length=255, index=True)
    table_name: Optional[str] = Field(max_length=255, index=True)
    full_path: str = Field(max_length=1000, description="Complete path to the asset")
    
    # Discovery and Metadata
    discovery_method: DiscoveryMethod = Field(index=True)
    discovered_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_profiled: Optional[datetime] = Field(index=True)
    last_scanned: Optional[datetime] = Field(index=True)
    
    # Technical Metadata
    columns_info: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    schema_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    constraints: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    indexes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    partitioning_info: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # AI-Enhanced Metadata
    ai_generated_description: Optional[str] = Field(sa_column=Column(Text))
    semantic_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    suggested_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    ai_confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
    semantic_embedding: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    
    # Data Quality Metrics
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0, index=True)
    quality_level: DataQuality = Field(default=DataQuality.UNKNOWN, index=True)
    completeness: float = Field(default=0.0, ge=0.0, le=1.0)
    accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    consistency: float = Field(default=0.0, ge=0.0, le=1.0)
    validity: float = Field(default=0.0, ge=0.0, le=1.0)
    uniqueness: float = Field(default=0.0, ge=0.0, le=1.0)
    timeliness: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Statistical Profiling
    record_count: Optional[int] = Field(default=None, ge=0)
    size_bytes: Optional[int] = Field(default=None, ge=0)
    null_percentage: float = Field(default=0.0, ge=0.0, le=1.0)
    distinct_values: Optional[int] = Field(default=None, ge=0)
    data_distribution: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    value_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_summary: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage Analytics
    usage_frequency: UsageFrequency = Field(default=UsageFrequency.UNKNOWN, index=True)
    access_count_daily: int = Field(default=0, ge=0)
    access_count_weekly: int = Field(default=0, ge=0)
    access_count_monthly: int = Field(default=0, ge=0)
    unique_users_count: int = Field(default=0, ge=0)
    last_accessed: Optional[datetime] = Field(index=True)
    peak_usage_time: Optional[datetime] = None
    usage_trends: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Context
    business_domain: Optional[str] = Field(max_length=100, index=True)
    business_purpose: Optional[str] = Field(sa_column=Column(Text))
    business_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    key_performance_indicators: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    
    # Ownership and Stewardship
    owner: Optional[str] = Field(max_length=255, index=True)
    steward: Optional[str] = Field(max_length=255, index=True)
    custodian: Optional[str] = Field(max_length=255)
    owner_contact: Optional[str] = Field(max_length=255)
    steward_contact: Optional[str] = Field(max_length=255)
    owning_team: Optional[str] = Field(max_length=100)
    responsible_department: Optional[str] = Field(max_length=100)
    
    # Compliance and Governance
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    retention_policy: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    privacy_impact_level: str = Field(default="low", max_length=20)
    gdpr_applicable: bool = Field(default=False)
    pii_detected: bool = Field(default=False, index=True)
    encryption_status: str = Field(default="unknown", max_length=20)
    compliance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Classification Integration
    classification_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    sensitivity_labels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    auto_classification_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    manual_classification_override: bool = Field(default=False)
    
    # Performance and Cost
    query_performance_avg: Optional[float] = Field(default=None, ge=0.0)
    storage_cost_monthly: Optional[float] = Field(default=None, ge=0.0)
    compute_cost_monthly: Optional[float] = Field(default=None, ge=0.0)
    total_cost_monthly: Optional[float] = Field(default=None, ge=0.0)
    cost_per_query: Optional[float] = Field(default=None, ge=0.0)
    performance_benchmarks: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships and Dependencies
    parent_asset_id: Optional[int] = Field(foreign_key="intelligent_data_assets.id", index=True)
    related_assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dependency_count: int = Field(default=0, ge=0)
    dependent_assets_count: int = Field(default=0, ge=0)
    
    # Change Management
    version: str = Field(default="1.0.0", max_length=20)
    version_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    last_modified: Optional[datetime] = Field(index=True)
    change_frequency: str = Field(default="unknown", max_length=20)
    schema_evolution: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Monitoring and Alerting
    monitoring_enabled: bool = Field(default=True)
    alert_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    health_score: float = Field(default=1.0, ge=0.0, le=1.0, index=True)
    uptime_percentage: float = Field(default=100.0, ge=0.0, le=100.0)
    availability_sla: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    
    # Tags and Labels
    user_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    system_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    custom_properties: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    metadata_extensions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit Information
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    access_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    modification_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: Optional[str] = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    data_source: Optional["DataSource"] = Relationship()
    parent_asset: Optional["IntelligentDataAsset"] = Relationship(sa_relationship_kwargs={"remote_side": "IntelligentDataAsset.id"})
    child_assets: List["IntelligentDataAsset"] = Relationship()
    lineage_sources: List["EnterpriseDataLineage"] = Relationship(back_populates="target_asset")
    lineage_targets: List["EnterpriseDataLineage"] = Relationship(back_populates="source_asset")
    quality_assessments: List["DataQualityAssessment"] = Relationship(back_populates="asset")
    usage_metrics: List["AssetUsageMetrics"] = Relationship(back_populates="asset")
    profiling_results: List["DataProfilingResult"] = Relationship(back_populates="asset")
    business_glossary_terms: List["BusinessGlossaryAssociation"] = Relationship(back_populates="asset")
    
    # Model Configuration
    class Config:
        schema_extra = {
            "example": {
                "asset_uuid": "asset_customer_data_v2_001",
                "qualified_name": "production.analytics.customer_demographics",
                "display_name": "Customer Demographics",
                "description": "Comprehensive customer demographic data including age, location, and preferences",
                "asset_type": "table",
                "asset_criticality": "high",
                "data_sensitivity": "confidential",
                "quality_score": 0.92,
                "business_value_score": 8.5,
                "ai_generated_description": "Table containing customer demographic information with high data quality and business value",
                "semantic_tags": ["customer", "demographics", "analytics", "pii"],
                "business_domain": "Customer Analytics",
                "compliance_requirements": ["GDPR", "CCPA"]
            }
        }
    
    # Table Constraints
    __table_args__ = (
        Index('ix_asset_quality_criticality', 'quality_score', 'asset_criticality'),
        Index('ix_asset_business_value', 'business_value_score', 'business_domain'),
        Index('ix_asset_discovery_status', 'discovery_method', 'asset_status'),
        Index('ix_asset_usage_patterns', 'usage_frequency', 'last_accessed'),
        Index('ix_asset_compliance', 'pii_detected', 'compliance_score'),
        UniqueConstraint('asset_uuid', name='uq_asset_uuid'),
        CheckConstraint('quality_score >= 0.0 AND quality_score <= 1.0'),
        CheckConstraint('business_value_score >= 0.0 AND business_value_score <= 10.0'),
    )


class EnterpriseDataLineage(SQLModel, table=True):
    """
    Advanced data lineage model with column-level tracking, transformation logic,
    and AI-powered relationship detection.
    
    This model provides comprehensive lineage tracking with:
    - Column-level granularity
    - Transformation logic capture
    - Impact analysis capabilities
    - Real-time lineage updates
    - Graph-based relationship modeling
    """
    __tablename__ = "enterprise_data_lineage"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    lineage_id: str = Field(index=True, unique=True)
    lineage_name: Optional[str] = Field(max_length=255)
    
    # Source and Target Assets
    source_asset_id: int = Field(foreign_key="intelligent_data_assets.id", index=True)
    target_asset_id: int = Field(foreign_key="intelligent_data_assets.id", index=True)
    
    # Lineage Characteristics
    lineage_type: LineageType = Field(index=True)
    lineage_direction: LineageDirection = Field(default=LineageDirection.DOWNSTREAM)
    confidence_score: float = Field(ge=0.0, le=1.0, description="AI confidence in lineage relationship")
    detection_method: DiscoveryMethod = Field(index=True)
    
    # Column-Level Lineage
    source_columns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    target_columns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    column_mappings: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    transformation_functions: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Transformation Details
    transformation_logic: Optional[str] = Field(sa_column=Column(Text), description="SQL or transformation code")
    transformation_type: str = Field(default="unknown", max_length=100)
    business_logic: Optional[str] = Field(sa_column=Column(Text))
    calculation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    aggregation_level: Optional[str] = Field(max_length=100)
    
    # Process Information
    process_name: Optional[str] = Field(max_length=255)
    process_type: str = Field(default="etl", max_length=100)  # etl, elt, streaming, batch, etc.
    process_owner: Optional[str] = Field(max_length=255)
    process_schedule: Optional[str] = Field(max_length=255)
    execution_frequency: Optional[str] = Field(max_length=100)
    
    # Quality and Validation
    data_quality_impact: float = Field(default=0.0, ge=-1.0, le=1.0)
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_checks: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    error_handling: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Metrics
    processing_time_avg: Optional[float] = Field(ge=0.0, description="Average processing time in seconds")
    data_volume_avg: Optional[int] = Field(ge=0, description="Average data volume processed")
    success_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    last_execution: Optional[datetime] = None
    next_execution: Optional[datetime] = None
    
    # Impact Analysis
    downstream_impact_score: float = Field(default=0.0, ge=0.0, le=10.0)
    critical_path: bool = Field(default=False, index=True)
    business_impact: str = Field(default="medium", max_length=20)
    affected_reports: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    affected_users: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Graph Properties
    graph_depth: int = Field(default=1, ge=1)
    path_complexity: float = Field(default=1.0, ge=1.0)
    node_importance: float = Field(default=1.0, ge=0.0, le=10.0)
    centrality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Monitoring and Alerting
    monitoring_enabled: bool = Field(default=True)
    alert_on_failure: bool = Field(default=True)
    alert_on_delay: bool = Field(default=False)
    sla_threshold_minutes: Optional[int] = Field(ge=1)
    escalation_policy: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Compliance and Governance
    data_classification_inheritance: bool = Field(default=True)
    privacy_preservation: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_validations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    audit_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata and Context
    technical_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    business_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    operational_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    custom_attributes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle Management
    is_active: bool = Field(default=True, index=True)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    deprecation_reason: Optional[str] = Field(max_length=500)
    replacement_lineage_id: Optional[str] = None
    
    # Audit Information
    discovery_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    change_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    discovered_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_validated: Optional[datetime] = None
    created_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    source_asset: Optional[IntelligentDataAsset] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[EnterpriseDataLineage.source_asset_id]"}
    )
    target_asset: Optional[IntelligentDataAsset] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[EnterpriseDataLineage.target_asset_id]"}
    )
    
    # Table Constraints
    __table_args__ = (
        Index('ix_lineage_source_target', 'source_asset_id', 'target_asset_id'),
        Index('ix_lineage_type_confidence', 'lineage_type', 'confidence_score'),
        Index('ix_lineage_critical_path', 'critical_path', 'business_impact'),
        Index('ix_lineage_performance', 'success_rate', 'processing_time_avg'),
        UniqueConstraint('source_asset_id', 'target_asset_id', 'lineage_type', name='uq_lineage_relationship'),
        CheckConstraint('confidence_score >= 0.0 AND confidence_score <= 1.0'),
        CheckConstraint('source_asset_id != target_asset_id', name='ck_no_self_reference'),
    )


class DataQualityAssessment(SQLModel, table=True):
    """
    Comprehensive data quality assessment with AI-powered analysis,
    automated profiling, and continuous monitoring capabilities.
    """
    __tablename__ = "data_quality_assessments"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: str = Field(index=True, unique=True)
    asset_id: int = Field(foreign_key="intelligent_data_assets.id", index=True)
    
    # Assessment Configuration
    assessment_name: str = Field(max_length=255)
    assessment_type: str = Field(max_length=100, index=True)  # automated, manual, scheduled, on_demand
    assessment_scope: str = Field(max_length=100)  # full, sample, column_specific, rule_based
    sample_percentage: float = Field(default=100.0, ge=0.0, le=100.0)
    
    # Quality Dimensions
    completeness_score: float = Field(ge=0.0, le=1.0, description="Percentage of non-null values")
    accuracy_score: float = Field(ge=0.0, le=1.0, description="Correctness of data values")
    consistency_score: float = Field(ge=0.0, le=1.0, description="Consistency across sources")
    validity_score: float = Field(ge=0.0, le=1.0, description="Conformance to business rules")
    uniqueness_score: float = Field(ge=0.0, le=1.0, description="Absence of duplicates")
    timeliness_score: float = Field(ge=0.0, le=1.0, description="Data freshness and currency")
    integrity_score: float = Field(ge=0.0, le=1.0, description="Referential integrity")
    
    # Overall Quality Metrics
    overall_quality_score: float = Field(ge=0.0, le=1.0, index=True)
    quality_grade: DataQuality = Field(index=True)
    quality_trend: str = Field(default="stable", max_length=20)  # improving, declining, stable
    
    # Detailed Quality Analysis
    null_value_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    duplicate_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    outlier_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    pattern_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Column-Level Quality
    column_quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    column_issues: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    column_recommendations: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality Rules and Validation
    quality_rules_applied: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    business_rule_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    data_constraints_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Issues and Remediation
    identified_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    critical_issues_count: int = Field(default=0, ge=0)
    high_priority_issues_count: int = Field(default=0, ge=0)
    remediation_suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    auto_fix_applied: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Assessment Execution
    records_assessed: int = Field(ge=0)
    assessment_duration_seconds: float = Field(ge=0.0)
    assessment_status: str = Field(default="completed", max_length=50)
    error_message: Optional[str] = Field(max_length=1000)
    
    # Historical Comparison
    previous_assessment_id: Optional[str] = None
    quality_score_change: Optional[float] = Field(ge=-1.0, le=1.0)
    improvement_areas: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    degradation_areas: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # AI-Powered Insights
    ai_quality_insights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    anomaly_detection_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    predictive_quality_trends: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    ml_model_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Business Impact
    business_impact_score: float = Field(default=0.0, ge=0.0, le=10.0)
    affected_processes: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    downstream_impact_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_of_poor_quality: Optional[float] = Field(ge=0.0)
    
    # Monitoring and Alerting
    alert_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    alerts_triggered: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_required: bool = Field(default=False)
    notification_sent: bool = Field(default=False)
    
    # Temporal and Context
    assessment_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    data_snapshot_date: datetime = Field(index=True)
    assessment_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    environmental_factors: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit Information
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: Optional[str] = Field(max_length=255)
    assessment_methodology: str = Field(default="automated", max_length=100)
    
    # Relationships
    asset: Optional[IntelligentDataAsset] = Relationship(back_populates="quality_assessments")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_quality_overall_score', 'overall_quality_score', 'quality_grade'),
        Index('ix_quality_assessment_date', 'assessment_date', 'asset_id'),
        Index('ix_quality_business_impact', 'business_impact_score', 'critical_issues_count'),
        CheckConstraint('overall_quality_score >= 0.0 AND overall_quality_score <= 1.0'),
        CheckConstraint('sample_percentage >= 0.0 AND sample_percentage <= 100.0'),
    )


class BusinessGlossaryTerm(SQLModel, table=True):
    """
    Enterprise business glossary with semantic understanding,
    AI-powered term suggestions, and comprehensive relationship management.
    """
    __tablename__ = "business_glossary_terms"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    term_id: str = Field(index=True, unique=True)
    term_name: str = Field(index=True, max_length=255)
    display_name: str = Field(max_length=255)
    short_description: str = Field(max_length=500)
    detailed_description: Optional[str] = Field(sa_column=Column(Text))
    
    # Categorization and Hierarchy
    category: str = Field(max_length=100, index=True)
    subcategory: Optional[str] = Field(max_length=100, index=True)
    domain: str = Field(max_length=100, index=True)
    parent_term_id: Optional[int] = Field(foreign_key="business_glossary_terms.id", index=True)
    hierarchy_level: int = Field(default=1, ge=1, le=10)
    
    # Term Properties
    term_type: str = Field(default="concept", max_length=50)  # concept, metric, dimension, attribute
    status: str = Field(default="active", max_length=20, index=True)  # active, deprecated, draft, under_review
    maturity_level: str = Field(default="developing", max_length=20)  # developing, mature, declining
    
    # Semantic Understanding
    synonyms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    acronyms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    alternative_names: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    semantic_embedding: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    semantic_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Context
    business_definition: Optional[str] = Field(sa_column=Column(Text))
    technical_definition: Optional[str] = Field(sa_column=Column(Text))
    calculation_logic: Optional[str] = Field(sa_column=Column(Text))
    business_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    usage_examples: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships and References
    related_terms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    opposite_terms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    broader_terms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    narrower_terms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    see_also: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Data Asset Associations
    associated_data_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    common_patterns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    validation_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Usage and Analytics
    usage_frequency: int = Field(default=0, ge=0)
    search_frequency: int = Field(default=0, ge=0)
    association_count: int = Field(default=0, ge=0)
    popularity_score: float = Field(default=0.0, ge=0.0, le=10.0)
    relevance_score: float = Field(default=0.0, ge=0.0, le=10.0)
    
    # Quality and Validation
    definition_quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    consistency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    expert_validated: bool = Field(default=False)
    community_validated: bool = Field(default=False)
    
    # AI Enhancement
    ai_suggested: bool = Field(default=False)
    ai_confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
    auto_generated_synonyms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    ml_topic_classification: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Governance and Ownership
    owner: Optional[str] = Field(max_length=255, index=True)
    steward: Optional[str] = Field(max_length=255, index=True)
    subject_matter_expert: Optional[str] = Field(max_length=255)
    approver: Optional[str] = Field(max_length=255)
    approval_date: Optional[datetime] = None
    review_cycle_months: int = Field(default=12, ge=1, le=60)
    next_review_date: Optional[datetime] = None
    
    # Version and Change Management
    version: str = Field(default="1.0.0", max_length=20)
    version_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    change_reason: Optional[str] = Field(max_length=500)
    deprecation_reason: Optional[str] = Field(max_length=500)
    replacement_term_id: Optional[str] = None
    
    # External References
    external_references: List[Dict[str, str]] = Field(default_factory=list, sa_column=Column(JSON))
    regulatory_references: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    industry_standards: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    documentation_links: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Custom Attributes
    custom_attributes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    industry_specific_info: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_reviewed: Optional[datetime] = None
    created_by: Optional[str] = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    parent_term: Optional["BusinessGlossaryTerm"] = Relationship(sa_relationship_kwargs={"remote_side": "BusinessGlossaryTerm.id"})
    child_terms: List["BusinessGlossaryTerm"] = Relationship()
    asset_associations: List["BusinessGlossaryAssociation"] = Relationship(back_populates="term")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_glossary_category_domain', 'category', 'domain'),
        Index('ix_glossary_popularity', 'popularity_score', 'relevance_score'),
        Index('ix_glossary_quality', 'definition_quality_score', 'expert_validated'),
        CheckConstraint('popularity_score >= 0.0 AND popularity_score <= 10.0'),
        CheckConstraint('hierarchy_level >= 1 AND hierarchy_level <= 10'),
    )


class BusinessGlossaryAssociation(SQLModel, table=True):
    """
    Association model linking data assets with business glossary terms.
    Enables semantic understanding and business context enrichment.
    """
    __tablename__ = "business_glossary_associations"
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_id: int = Field(foreign_key="intelligent_data_assets.id", index=True)
    term_id: int = Field(foreign_key="business_glossary_terms.id", index=True)
    
    # Association Details
    association_type: str = Field(max_length=100)  # primary, secondary, contextual, derived
    association_strength: float = Field(ge=0.0, le=1.0)
    detection_method: str = Field(max_length=100)  # manual, ai_suggested, pattern_matching, semantic_analysis
    confidence_score: float = Field(ge=0.0, le=1.0)
    
    # Context and Validation
    business_context: Optional[str] = Field(max_length=500)
    validation_status: str = Field(default="pending", max_length=50)
    validated_by: Optional[str] = Field(max_length=255)
    validation_date: Optional[datetime] = None
    
    # Usage and Quality
    usage_frequency: int = Field(default=0, ge=0)
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    business_value: float = Field(default=0.0, ge=0.0, le=10.0)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    asset: Optional[IntelligentDataAsset] = Relationship(back_populates="business_glossary_terms")
    term: Optional[BusinessGlossaryTerm] = Relationship(back_populates="asset_associations")
    
    # Table Constraints
    __table_args__ = (
        UniqueConstraint('asset_id', 'term_id', name='uq_asset_term'),
        Index('ix_association_strength_confidence', 'association_strength', 'confidence_score'),
    )


class AssetUsageMetrics(SQLModel, table=True):
    """
    Comprehensive usage analytics for data assets with user behavior tracking,
    performance monitoring, and business value measurement.
    """
    __tablename__ = "asset_usage_metrics"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str = Field(index=True, unique=True)
    asset_id: int = Field(foreign_key="intelligent_data_assets.id", index=True)
    
    # Time Period
    metric_date: datetime = Field(index=True)
    period_type: str = Field(max_length=20, index=True)  # hourly, daily, weekly, monthly
    period_start: datetime = Field(index=True)
    period_end: datetime = Field(index=True)
    
    # Access Metrics
    total_accesses: int = Field(default=0, ge=0)
    unique_users: int = Field(default=0, ge=0)
    unique_sessions: int = Field(default=0, ge=0)
    read_operations: int = Field(default=0, ge=0)
    write_operations: int = Field(default=0, ge=0)
    query_count: int = Field(default=0, ge=0)
    
    # Performance Metrics
    avg_response_time: Optional[float] = Field(ge=0.0)
    max_response_time: Optional[float] = Field(ge=0.0)
    min_response_time: Optional[float] = Field(ge=0.0)
    total_processing_time: Optional[float] = Field(ge=0.0)
    throughput_records_per_second: Optional[float] = Field(ge=0.0)
    
    # Data Volume Metrics
    bytes_read: int = Field(default=0, ge=0)
    bytes_written: int = Field(default=0, ge=0)
    records_processed: int = Field(default=0, ge=0)
    peak_concurrent_users: int = Field(default=0, ge=0)
    
    # Quality and Error Metrics
    error_count: int = Field(default=0, ge=0)
    error_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    timeout_count: int = Field(default=0, ge=0)
    success_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # User Behavior Analysis
    user_segments: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    access_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    peak_usage_hours: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    popular_queries: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Value Metrics
    business_value_generated: Optional[float] = Field(ge=0.0)
    cost_savings: Optional[float] = Field(ge=0.0)
    revenue_impact: Optional[float] = None
    productivity_improvement: Optional[float] = None
    
    # Trend Analysis
    usage_trend: str = Field(default="stable", max_length=20)  # increasing, decreasing, stable, volatile
    growth_rate: Optional[float] = None
    seasonality_pattern: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    anomaly_detected: bool = Field(default=False)
    
    # Resource Utilization
    cpu_usage_avg: Optional[float] = Field(ge=0.0, le=100.0)
    memory_usage_avg: Optional[float] = Field(ge=0.0)
    storage_usage_gb: Optional[float] = Field(ge=0.0)
    network_io_mb: Optional[float] = Field(ge=0.0)
    
    # Predictive Analytics
    predicted_next_period: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    forecast_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    capacity_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    calculation_timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    asset: Optional[IntelligentDataAsset] = Relationship(back_populates="usage_metrics")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_usage_metrics_date_asset', 'metric_date', 'asset_id'),
        Index('ix_usage_metrics_performance', 'avg_response_time', 'success_rate'),
        Index('ix_usage_metrics_volume', 'total_accesses', 'unique_users'),
        UniqueConstraint('asset_id', 'metric_date', 'period_type', name='uq_asset_metric_period'),
    )


class DataProfilingResult(SQLModel, table=True):
    """
    Comprehensive data profiling results with statistical analysis,
    pattern detection, and AI-powered insights.
    """
    __tablename__ = "data_profiling_results"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    profiling_id: str = Field(index=True, unique=True)
    asset_id: int = Field(foreign_key="intelligent_data_assets.id", index=True)
    
    # Profiling Configuration
    profiling_type: str = Field(max_length=100, index=True)  # full, sample, incremental, column_specific
    sample_size: int = Field(ge=1)
    sample_percentage: float = Field(ge=0.0, le=100.0)
    profiling_scope: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Dataset Overview
    total_records: int = Field(ge=0)
    total_columns: int = Field(ge=0)
    data_size_bytes: int = Field(ge=0)
    null_percentage_overall: float = Field(ge=0.0, le=100.0)
    duplicate_records_count: int = Field(default=0, ge=0)
    duplicate_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Column-Level Profiling
    column_profiles: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    data_type_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    null_counts_per_column: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    unique_counts_per_column: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Statistical Analysis
    numerical_statistics: Dict[str, Dict[str, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    categorical_statistics: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    correlation_matrix: Dict[str, Dict[str, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    distribution_analysis: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Pattern Detection
    data_patterns: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    format_patterns: Dict[str, Dict[str, int]] = Field(default_factory=dict, sa_column=Column(JSON))
    value_patterns: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    regex_patterns: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Anomaly Detection
    outliers_detected: Dict[str, List[Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    anomaly_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_outliers: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    business_rule_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Data Relationships
    primary_key_candidates: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    foreign_key_relationships: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    functional_dependencies: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    referential_integrity_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # AI-Powered Insights
    ai_insights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    semantic_classification: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    pii_detection_results: Dict[str, Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    data_sensitivity_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality Assessment
    overall_quality_score: float = Field(ge=0.0, le=1.0)
    quality_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    improvement_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_completeness_by_column: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Metrics
    profiling_duration_seconds: float = Field(ge=0.0)
    processing_speed_records_per_second: float = Field(ge=0.0)
    memory_usage_peak_mb: float = Field(ge=0.0)
    cpu_usage_avg_percent: float = Field(ge=0.0, le=100.0)
    
    # Business Impact
    business_relevance_score: float = Field(default=0.0, ge=0.0, le=10.0)
    data_value_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    usage_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    monetization_opportunities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Historical Comparison
    previous_profiling_id: Optional[str] = None
    changes_detected: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    schema_evolution: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    trend_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Context
    profiling_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    data_snapshot_timestamp: datetime = Field(index=True)
    profiling_status: str = Field(default="completed", max_length=50)
    error_details: Optional[str] = Field(max_length=2000)
    
    # Metadata and Configuration
    profiling_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    environment_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tool_metadata: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    asset: Optional[IntelligentDataAsset] = Relationship(back_populates="profiling_results")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_profiling_timestamp_asset', 'profiling_timestamp', 'asset_id'),
        Index('ix_profiling_quality_score', 'overall_quality_score', 'business_relevance_score'),
        Index('ix_profiling_performance', 'profiling_duration_seconds', 'processing_speed_records_per_second'),
    )


# ===================== RESPONSE AND REQUEST MODELS =====================

class IntelligentAssetResponse(BaseModel):
    """Response model for intelligent data assets"""
    id: int
    asset_uuid: str
    qualified_name: str
    display_name: str
    description: Optional[str]
    asset_type: AssetType
    asset_status: AssetStatus
    asset_criticality: AssetCriticality
    data_sensitivity: DataSensitivity
    
    # Quality and Business Metrics
    quality_score: float
    quality_level: DataQuality
    business_value_score: float
    health_score: float
    
    # Discovery and Metadata
    discovery_method: DiscoveryMethod
    discovered_at: datetime
    last_profiled: Optional[datetime]
    
    # Usage Information
    usage_frequency: UsageFrequency
    last_accessed: Optional[datetime]
    access_count_daily: int
    unique_users_count: int
    
    # Ownership
    owner: Optional[str]
    steward: Optional[str]
    business_domain: Optional[str]
    
    # Compliance
    pii_detected: bool
    compliance_score: float
    compliance_requirements: List[str]
    
    # AI Enhancement
    ai_confidence_score: float
    semantic_tags: List[str]
    
    # Temporal
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AssetCreateRequest(BaseModel):
    """Request model for creating data assets"""
    qualified_name: str = Field(min_length=1, max_length=1000)
    display_name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    asset_type: AssetType
    asset_criticality: AssetCriticality = AssetCriticality.MEDIUM
    data_sensitivity: DataSensitivity = DataSensitivity.INTERNAL
    
    # Location
    data_source_id: int
    database_name: Optional[str] = Field(max_length=255)
    schema_name: Optional[str] = Field(max_length=255)
    table_name: Optional[str] = Field(max_length=255)
    
    # Business Context
    business_domain: Optional[str] = Field(max_length=100)
    business_purpose: Optional[str] = None
    owner: Optional[str] = Field(max_length=255)
    steward: Optional[str] = Field(max_length=255)
    
    # Tags and Metadata
    user_tags: Optional[List[str]] = []
    custom_properties: Optional[Dict[str, Any]] = {}
    
    @validator('qualified_name')
    def validate_qualified_name(cls, v):
        if not v.strip():
            raise ValueError('Qualified name cannot be empty')
        return v.strip()


class AssetUpdateRequest(BaseModel):
    """Request model for updating data assets"""
    display_name: Optional[str] = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    asset_criticality: Optional[AssetCriticality] = None
    data_sensitivity: Optional[DataSensitivity] = None
    business_domain: Optional[str] = Field(max_length=100)
    business_purpose: Optional[str] = None
    owner: Optional[str] = Field(max_length=255)
    steward: Optional[str] = Field(max_length=255)
    user_tags: Optional[List[str]] = None
    custom_properties: Optional[Dict[str, Any]] = None


class AssetSearchRequest(BaseModel):
    """Advanced search request for data assets"""
    query: Optional[str] = None
    asset_types: Optional[List[AssetType]] = None
    asset_statuses: Optional[List[AssetStatus]] = None
    criticality_levels: Optional[List[AssetCriticality]] = None
    sensitivity_levels: Optional[List[DataSensitivity]] = None
    business_domains: Optional[List[str]] = None
    data_source_ids: Optional[List[int]] = None
    owners: Optional[List[str]] = None
    stewards: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    min_quality_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    min_business_value: Optional[float] = Field(None, ge=0.0, le=10.0)
    has_pii: Optional[bool] = None
    discovered_after: Optional[datetime] = None
    last_accessed_after: Optional[datetime] = None


class LineageResponse(BaseModel):
    """Response model for data lineage"""
    id: int
    lineage_id: str
    lineage_type: LineageType
    confidence_score: float
    
    # Assets
    source_asset_id: int
    target_asset_id: int
    source_asset_name: Optional[str]
    target_asset_name: Optional[str]
    
    # Details
    transformation_logic: Optional[str]
    transformation_type: str
    column_mappings: Dict[str, List[str]]
    
    # Impact
    downstream_impact_score: float
    critical_path: bool
    business_impact: str
    
    # Status
    is_active: bool
    last_validated: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class QualityAssessmentResponse(BaseModel):
    """Response model for quality assessments"""
    id: int
    assessment_id: str
    asset_id: int
    assessment_type: str
    
    # Quality Scores
    overall_quality_score: float
    quality_grade: DataQuality
    completeness_score: float
    accuracy_score: float
    consistency_score: float
    validity_score: float
    
    # Issues
    critical_issues_count: int
    high_priority_issues_count: int
    
    # Assessment Info
    records_assessed: int
    assessment_duration_seconds: float
    assessment_date: datetime
    
    class Config:
        from_attributes = True


class BusinessGlossaryResponse(BaseModel):
    """Response model for business glossary terms"""
    id: int
    term_id: str
    term_name: str
    display_name: str
    short_description: str
    category: str
    domain: str
    
    # Properties
    synonyms: List[str]
    status: str
    popularity_score: float
    definition_quality_score: float
    
    # Governance
    owner: Optional[str]
    expert_validated: bool
    
    # Usage
    usage_frequency: int
    association_count: int
    
    # Temporal
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ===================== UTILITY AND ANALYTICS MODELS =====================

class AssetDiscoveryEvent(BaseModel):
    """Model for asset discovery events"""
    discovery_id: str
    asset_uuid: str
    discovery_method: DiscoveryMethod
    discovery_timestamp: datetime
    confidence_score: float
    metadata_extracted: Dict[str, Any]
    quality_indicators: Dict[str, float]
    business_relevance: float
    recommendations: List[str]


class LineageGraph(BaseModel):
    """Model for lineage graph representation"""
    graph_id: str
    root_asset_id: int
    direction: LineageDirection
    max_depth: int
    
    # Graph Structure
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    graph_metrics: Dict[str, float]
    
    # Analysis Results
    critical_paths: List[List[int]]
    bottlenecks: List[int]
    impact_analysis: Dict[str, Any]
    complexity_score: float


class CatalogAnalytics(BaseModel):
    """Model for catalog analytics and insights"""
    analytics_id: str
    generated_at: datetime
    
    # Coverage Metrics
    total_assets: int
    assets_by_type: Dict[AssetType, int]
    coverage_by_source: Dict[int, Dict[str, int]]
    quality_distribution: Dict[DataQuality, int]
    
    # Business Value
    high_value_assets: int
    business_critical_assets: int
    total_business_value: float
    avg_business_value: float
    
    # Usage Patterns
    most_accessed_assets: List[Dict[str, Any]]
    usage_trends: Dict[str, List[float]]
    user_engagement_metrics: Dict[str, float]
    
    # Quality Insights
    quality_trends: Dict[str, List[float]]
    common_issues: List[Dict[str, Any]]
    improvement_opportunities: List[str]
    
    # Compliance Status
    pii_asset_count: int
    compliance_coverage: Dict[str, int]
    risk_assessment: Dict[str, Any]


# ===================== MODEL REGISTRATION =====================

__all__ = [
    # Core Models
    "IntelligentDataAsset",
    "EnterpriseDataLineage", 
    "DataQualityAssessment",
    "BusinessGlossaryTerm",
    "BusinessGlossaryAssociation",
    "AssetUsageMetrics",
    "DataProfilingResult",
    
    # Enums
    "AssetType",
    "AssetStatus", 
    "DataQuality",
    "LineageDirection",
    "LineageType",
    "DiscoveryMethod",
    "AssetCriticality",
    "DataSensitivity",
    "UsageFrequency",
    
    # Request/Response Models
    "IntelligentAssetResponse",
    "AssetCreateRequest",
    "AssetUpdateRequest", 
    "AssetSearchRequest",
    "LineageResponse",
    "QualityAssessmentResponse",
    "BusinessGlossaryResponse",
    
    # Utility Models
    "AssetDiscoveryEvent",
    "LineageGraph",
    "CatalogAnalytics"
]