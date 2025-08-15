"""
Advanced Scan Rule Models for Enterprise Data Governance System
========================================================

This module contains sophisticated models for intelligent scan rule management,
AI-powered pattern recognition, and enterprise-grade rule optimization.

Features:
- Intelligent rule engine with AI/ML capabilities
- Advanced pattern recognition and matching
- Real-time performance optimization
- Enterprise audit trails and compliance integration
- Interconnection with all data governance groups
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, ARRAY, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple, TYPE_CHECKING
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
import re
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint

# Forward references to avoid circular imports
if TYPE_CHECKING:
    from .racine_models.racine_orchestration_models import RacineOrchestrationMaster


# ===================== ENUMS AND CONSTANTS =====================

class RuleComplexityLevel(str, Enum):
    """Rule complexity classification for AI optimization"""
    SIMPLE = "simple"              # Basic regex, single condition
    INTERMEDIATE = "intermediate"   # Multiple conditions, basic logic
    ADVANCED = "advanced"          # Complex logic, nested conditions
    EXPERT = "expert"              # AI/ML patterns, dynamic rules
    ENTERPRISE = "enterprise"      # Multi-system integration rules

class PatternRecognitionType(str, Enum):
    """Types of pattern recognition algorithms"""
    REGEX = "regex"                    # Traditional regex patterns
    ML_PATTERN = "ml_pattern"          # Machine learning patterns
    AI_SEMANTIC = "ai_semantic"        # NLP/semantic analysis
    STATISTICAL = "statistical"       # Statistical pattern detection
    GRAPH_BASED = "graph_based"       # Graph-based relationship patterns
    BEHAVIORAL = "behavioral"          # User behavior patterns
    TEMPORAL = "temporal"              # Time-series patterns
    ANOMALY = "anomaly"               # Anomaly detection patterns

class RuleOptimizationStrategy(str, Enum):
    """Optimization strategies for rule execution"""
    PERFORMANCE = "performance"        # Optimize for speed
    ACCURACY = "accuracy"             # Optimize for precision
    COST = "cost"                     # Optimize for resource usage
    BALANCED = "balanced"             # Balance all factors
    CUSTOM = "custom"                 # Custom optimization parameters
    ADAPTIVE = "adaptive"             # AI-driven adaptive optimization

class RuleExecutionStrategy(str, Enum):
    """Execution strategies for rule processing"""
    PARALLEL = "parallel"             # Parallel execution
    SEQUENTIAL = "sequential"         # Sequential execution
    ADAPTIVE = "adaptive"             # AI-determined execution
    PIPELINE = "pipeline"             # Pipeline processing
    BATCH = "batch"                   # Batch processing
    STREAMING = "streaming"           # Real-time streaming

class RuleValidationStatus(str, Enum):
    """Rule validation states"""
    DRAFT = "draft"                   # Under development
    VALIDATING = "validating"         # Being validated
    VALIDATED = "validated"           # Passed validation
    FAILED = "failed"                 # Failed validation
    DEPRECATED = "deprecated"         # No longer used
    ARCHIVED = "archived"             # Archived for reference

class RuleBusinessImpact(str, Enum):
    """Business impact classification"""
    CRITICAL = "critical"             # Mission-critical systems
    HIGH = "high"                     # High business value
    MEDIUM = "medium"                 # Standard business operations
    LOW = "low"                       # Support functions
    EXPERIMENTAL = "experimental"     # Experimental/testing


# ===================== CORE MODELS =====================

class IntelligentScanRule(SQLModel, table=True):
    """
    Advanced AI-powered scan rules with comprehensive metadata,
    performance tracking, and enterprise integration capabilities.
    
    This model represents the next generation of scan rules that incorporate:
    - AI/ML pattern recognition
    - Real-time performance optimization
    - Business context awareness
    - Compliance integration
    - Multi-system coordination
    """
    __tablename__ = "intelligent_scan_rules"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: str = Field(index=True, unique=True, description="Unique rule identifier")
    name: str = Field(index=True, max_length=255, description="Human-readable rule name")
    display_name: Optional[str] = Field(max_length=255, description="UI display name")
    description: Optional[str] = Field(sa_column=Column(Text), description="Detailed rule description")
    
    # **INTERCONNECTED: Enhanced Rule Set Integration**
    enhanced_rule_set_id: Optional[int] = Field(default=None, foreign_key="enhancedscanruleset.id", index=True)

    # **INTERCONNECTED: Racine Orchestrator Integration (FK)**
    racine_orchestrator_id: Optional[str] = Field(default=None, foreign_key="racine_orchestration_master.id", index=True)
    
    # Rule Classification
    complexity_level: RuleComplexityLevel = Field(default=RuleComplexityLevel.INTERMEDIATE, index=True)
    pattern_type: PatternRecognitionType = Field(default=PatternRecognitionType.REGEX, index=True)
    optimization_strategy: RuleOptimizationStrategy = Field(default=RuleOptimizationStrategy.BALANCED)
    execution_strategy: RuleExecutionStrategy = Field(default=RuleExecutionStrategy.ADAPTIVE)
    
    # Rule Logic Core
    rule_expression: str = Field(sa_column=Column(Text), description="Core rule logic expression")
    conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Advanced Pattern Configuration
    pattern_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="Pattern-specific configuration")
    regex_patterns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    ml_model_references: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    semantic_keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # AI/ML Configuration
    ml_model_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    ai_context_awareness: bool = Field(default=False, description="Enable AI context analysis")
    learning_enabled: bool = Field(default=True, description="Enable continuous learning")
    confidence_threshold: float = Field(default=0.85, ge=0.0, le=1.0, description="Minimum confidence for rule execution")
    adaptive_learning_rate: float = Field(default=0.01, ge=0.001, le=0.1)
    
    # Performance Configuration
    parallel_execution: bool = Field(default=True, description="Enable parallel processing")
    max_parallel_threads: int = Field(default=4, ge=1, le=32)
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    timeout_seconds: int = Field(default=300, ge=1, le=3600)
    memory_limit_mb: Optional[int] = Field(default=None, ge=128, le=8192)
    cpu_limit_percent: Optional[float] = Field(default=None, ge=10.0, le=100.0)
    
    # Execution Context
    target_data_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    supported_databases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    cloud_compatibility: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    data_source_filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Context
    business_impact_level: RuleBusinessImpact = Field(default=RuleBusinessImpact.MEDIUM)
    business_domain: Optional[str] = Field(max_length=100, index=True)
    cost_per_execution: Optional[float] = Field(default=None, ge=0.0)
    roi_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    sla_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and Performance Metrics
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Rule accuracy score")
    precision_score: float = Field(default=0.0, ge=0.0, le=1.0)
    recall_score: float = Field(default=0.0, ge=0.0, le=1.0)
    f1_score: float = Field(default=0.0, ge=0.0, le=1.0)
    execution_success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    average_execution_time_ms: float = Field(default=0.0, ge=0.0)
    
    # Usage Statistics
    total_executions: int = Field(default=0, ge=0, description="Total number of executions")
    successful_executions: int = Field(default=0, ge=0)
    failed_executions: int = Field(default=0, ge=0)
    last_execution_time: Optional[datetime] = None
    total_data_processed_gb: float = Field(default=0.0, ge=0.0)
    
    # Audit and Compliance
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    last_compliance_check: Optional[datetime] = None
    
    # Validation and Testing
    validation_status: RuleValidationStatus = Field(default=RuleValidationStatus.DRAFT, index=True)
    test_cases: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    benchmark_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Advanced Features
    auto_optimization_enabled: bool = Field(default=True)
    anomaly_detection_enabled: bool = Field(default=False)
    real_time_monitoring: bool = Field(default=True)
    alert_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Integration Points
    data_source_integrations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    classification_mappings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_mappings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    catalog_enrichments: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle Management
    version: str = Field(default="1.0.0", max_length=20)
    previous_versions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    deprecation_date: Optional[datetime] = None
    replacement_rule_id: Optional[str] = None
    is_active: bool = Field(default=True, index=True)
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_optimized_at: Optional[datetime] = None
    created_by: Optional[str] = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    executions: List["RuleExecutionHistory"] = Relationship(back_populates="rule")
    optimizations: List["RuleOptimizationJob"] = Relationship(back_populates="rule")
    pattern_associations: List["RulePatternAssociation"] = Relationship(back_populates="rule")
    performance_baselines: List["RulePerformanceBaseline"] = Relationship(back_populates="rule")
    
    # **INTERCONNECTED: Enhanced Rule Set Integration**
    enhanced_rule_set: Optional["EnhancedScanRuleSet"] = Relationship(back_populates="intelligent_rules")
    
    # **INTERCONNECTED: Racine Orchestrator Integration**
    racine_orchestrator: Optional["RacineOrchestrationMaster"] = Relationship(back_populates="managed_scan_rules")
    
    # Model Configuration
    class Config:
        schema_extra = {
            "example": {
                "rule_id": "rule_pii_detection_v2",
                "name": "Advanced PII Detection Rule",
                "description": "AI-powered rule for detecting personally identifiable information",
                "complexity_level": "advanced",
                "pattern_type": "ai_semantic",
                "rule_expression": "DETECT_PII_PATTERNS(column_content) WITH confidence > 0.9",
                "conditions": [
                    {
                        "type": "semantic_analysis",
                        "parameters": {"context_window": 50, "entity_types": ["PERSON", "EMAIL", "PHONE"]}
                    }
                ],
                "ml_model_config": {
                    "model_type": "transformer",
                    "model_path": "/models/pii_detection_v2.pkl",
                    "preprocessing": {"tokenization": "bert", "normalization": True}
                }
            }
        }
    
    # Table Constraints
    __table_args__ = (
        Index('ix_rule_performance', 'accuracy_score', 'execution_success_rate'),
        Index('ix_rule_business', 'business_impact_level', 'business_domain'),
        Index('ix_rule_complexity_pattern', 'complexity_level', 'pattern_type'),
        UniqueConstraint('rule_id', 'version', name='uq_rule_version'),
        CheckConstraint('confidence_threshold >= 0.0 AND confidence_threshold <= 1.0', name='ck_confidence_threshold'),
        CheckConstraint('timeout_seconds > 0', name='ck_timeout_positive'),
    )


class RulePatternLibrary(SQLModel, table=True):
    """
    Comprehensive library of reusable patterns for intelligent rule creation.
    
    This library serves as a knowledge base of proven patterns that can be:
    - Reused across multiple rules
    - Evolved through machine learning
    - Optimized for performance
    - Shared across the organization
    """
    __tablename__ = "rule_pattern_library"
    
    # Core Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    pattern_id: str = Field(index=True, unique=True)
    name: str = Field(index=True, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    category: str = Field(index=True, max_length=100)
    subcategory: Optional[str] = Field(max_length=100, index=True)
    
    # Pattern Definition
    pattern_expression: str = Field(sa_column=Column(Text), description="Core pattern expression")
    pattern_type: PatternRecognitionType = Field(index=True)
    complexity_score: float = Field(ge=0.0, le=10.0, description="Pattern complexity rating")
    difficulty_level: RuleComplexityLevel = Field(default=RuleComplexityLevel.INTERMEDIATE)
    
    # Pattern Variants
    variants: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    alternatives: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    optimized_versions: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # ML/AI Enhancement
    ml_enhanced: bool = Field(default=False)
    ai_training_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    model_references: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    embedding_vectors: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    
    # Usage Statistics
    usage_count: int = Field(default=0, ge=0, index=True)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0, index=True)
    average_accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    adoption_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Business Metrics
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    cost_effectiveness: float = Field(default=0.0, ge=0.0, le=10.0)
    roi_calculation: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Pattern Metadata
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    keywords: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    source_systems: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    target_domains: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Technical Specifications
    required_libraries: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dependencies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    performance_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality Assurance
    test_coverage: float = Field(default=0.0, ge=0.0, le=1.0)
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Documentation
    documentation: Optional[str] = Field(sa_column=Column(Text))
    examples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    tutorials: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    best_practices: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Lifecycle Management
    version: str = Field(default="1.0.0", max_length=20)
    version_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    is_public: bool = Field(default=True, index=True)
    is_deprecated: bool = Field(default=False, index=True)
    deprecation_reason: Optional[str] = None
    replacement_pattern_id: Optional[str] = None
    
    # Access Control
    visibility_level: str = Field(default="organization", max_length=50)  # public, organization, team, private
    access_permissions: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    owner_team: Optional[str] = Field(max_length=100)
    contributors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Analytics and Insights
    trend_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    usage_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    effectiveness_trends: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Integration Mappings
    classification_integration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_mappings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_source_compatibility: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_used: Optional[datetime] = Field(index=True)
    last_optimized: Optional[datetime] = None
    created_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    rule_associations: List["RulePatternAssociation"] = Relationship(back_populates="pattern")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_pattern_usage_success', 'usage_count', 'success_rate'),
        Index('ix_pattern_category_type', 'category', 'pattern_type'),
        Index('ix_pattern_performance', 'average_accuracy', 'business_value_score'),
    )


class RuleExecutionHistory(SQLModel, table=True):
    """
    Comprehensive historical execution data for rules with detailed
    performance metrics, error analysis, and optimization insights.
    """
    __tablename__ = "rule_execution_history"
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Execution Context
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    scan_job_id: Optional[str] = Field(index=True, max_length=255)
    orchestration_id: Optional[str] = Field(index=True, max_length=255)
    triggered_by: str = Field(max_length=255)  # user_id, system, schedule, api, etc.
    trigger_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Configuration
    execution_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    runtime_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Results
    execution_status: str = Field(index=True, max_length=50)  # success, failed, partial, timeout, cancelled
    exit_code: Optional[int] = None
    status_message: Optional[str] = Field(max_length=500)
    error_category: Optional[str] = Field(max_length=100, index=True)
    
    # Timing Metrics
    start_time: datetime = Field(index=True)
    end_time: Optional[datetime] = Field(index=True)
    duration_seconds: Optional[float] = Field(ge=0.0)
    queue_time_seconds: Optional[float] = Field(ge=0.0)
    initialization_time_seconds: Optional[float] = Field(ge=0.0)
    processing_time_seconds: Optional[float] = Field(ge=0.0)
    cleanup_time_seconds: Optional[float] = Field(ge=0.0)
    
    # Data Processing Metrics
    records_processed: Optional[int] = Field(ge=0)
    records_matched: Optional[int] = Field(ge=0)
    records_flagged: Optional[int] = Field(ge=0)
    false_positives: Optional[int] = Field(ge=0)
    false_negatives: Optional[int] = Field(ge=0)
    true_positives: Optional[int] = Field(ge=0)
    true_negatives: Optional[int] = Field(ge=0)
    
    # Quality Metrics
    precision: Optional[float] = Field(ge=0.0, le=1.0)
    recall: Optional[float] = Field(ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(ge=0.0, le=1.0)
    accuracy: Optional[float] = Field(ge=0.0, le=1.0)
    confidence_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Resource Usage Metrics
    cpu_usage_percent: Optional[float] = Field(ge=0.0, le=100.0)
    memory_usage_mb: Optional[float] = Field(ge=0.0)
    peak_memory_mb: Optional[float] = Field(ge=0.0)
    network_io_mb: Optional[float] = Field(ge=0.0)
    storage_io_mb: Optional[float] = Field(ge=0.0)
    temp_storage_used_mb: Optional[float] = Field(ge=0.0)
    
    # Performance Analysis
    throughput_records_per_second: Optional[float] = Field(ge=0.0)
    latency_percentiles: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_baseline_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    bottleneck_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Results and Outputs
    execution_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_artifacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    generated_reports: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    data_samples: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error and Warning Analysis
    error_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    warning_messages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    exception_stack_trace: Optional[str] = Field(sa_column=Column(Text))
    error_recovery_actions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Optimization and Learning
    optimization_suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    learning_insights: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    pattern_adaptations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    feedback_score: Optional[float] = Field(ge=0.0, le=10.0)
    
    # Business Impact
    business_value_generated: Optional[float] = None
    cost_savings: Optional[float] = None
    risk_mitigation_score: Optional[float] = Field(ge=0.0, le=10.0)
    compliance_contribution: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Integration Results
    classification_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_validations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    catalog_enrichments: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_source_insights: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Environment and Context
    execution_environment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    system_state: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    concurrent_executions: int = Field(default=1, ge=1)
    resource_contention_level: Optional[str] = Field(max_length=50)
    
    # Audit and Compliance
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_checks: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    security_validations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="executions")
    data_source: Optional["DataSource"] = Relationship()
    
    # Table Constraints
    __table_args__ = (
        Index('ix_execution_performance', 'duration_seconds', 'throughput_records_per_second'),
        Index('ix_execution_quality', 'precision', 'recall', 'f1_score'),
        Index('ix_execution_status_time', 'execution_status', 'start_time'),
        Index('ix_execution_resource_usage', 'cpu_usage_percent', 'memory_usage_mb'),
    )


class RuleOptimizationJob(SQLModel, table=True):
    """
    Advanced rule optimization jobs with AI/ML-driven improvements,
    performance tuning, and continuous learning capabilities.
    """
    __tablename__ = "rule_optimization_jobs"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    optimization_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Optimization Configuration
    optimization_type: str = Field(max_length=100, index=True)  # performance, accuracy, cost, pattern, ml_tuning
    optimization_strategy: RuleOptimizationStrategy = Field(index=True)
    target_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # AI/ML Configuration
    ml_optimization_enabled: bool = Field(default=True)
    algorithm_type: str = Field(default="genetic_algorithm", max_length=100)
    hyperparameter_tuning: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    training_data_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Job Status and Progress
    job_status: str = Field(index=True, max_length=50, default="pending")  # pending, running, completed, failed, cancelled
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    current_phase: str = Field(default="initialization", max_length=100)
    estimated_completion: Optional[datetime] = None
    
    # Baseline Metrics (Before Optimization)
    baseline_performance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    baseline_accuracy: Optional[float] = Field(ge=0.0, le=1.0)
    baseline_execution_time: Optional[float] = Field(ge=0.0)
    baseline_resource_usage: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Optimization Results
    optimized_performance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    optimized_accuracy: Optional[float] = Field(ge=0.0, le=1.0)
    optimized_execution_time: Optional[float] = Field(ge=0.0)
    optimized_resource_usage: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Improvement Metrics
    performance_improvement: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    accuracy_improvement: Optional[float] = None
    speed_improvement_percent: Optional[float] = None
    resource_efficiency_gain: Optional[float] = None
    
    # Optimization Process Details
    iterations_performed: int = Field(default=0, ge=0)
    max_iterations: int = Field(default=100, ge=1)
    convergence_criteria: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    early_stopping: bool = Field(default=True)
    
    # Generated Optimizations
    rule_modifications: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    parameter_adjustments: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    pattern_improvements: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Validation and Testing
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    test_case_results: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    cross_validation_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    statistical_significance: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Business Impact Analysis
    cost_benefit_analysis: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    roi_projection: Optional[float] = None
    business_value_improvement: Optional[float] = None
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Implementation Status
    is_applied: bool = Field(default=False, index=True)
    applied_at: Optional[datetime] = None
    rollback_available: bool = Field(default=True)
    rollback_plan: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Monitoring and Feedback
    post_optimization_monitoring: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    feedback_collection: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    user_satisfaction_score: Optional[float] = Field(ge=0.0, le=10.0)
    
    # Error Handling
    error_messages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    warnings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    failure_analysis: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Resource Usage
    computational_cost: Optional[float] = Field(ge=0.0)
    optimization_duration: Optional[float] = Field(ge=0.0)
    resources_consumed: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by: str = Field(max_length=255)
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="optimizations")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_optimization_status_progress', 'job_status', 'progress_percentage'),
        Index('ix_optimization_improvement', 'speed_improvement_percent', 'accuracy_improvement'),
        Index('ix_optimization_roi', 'roi_projection', 'business_value_improvement'),
    )


class AITuningConfiguration(SQLModel, table=True):
    """
    AI tuning configuration stored for reproducible optimization runs.
    """
    __tablename__ = "ai_tuning_configurations"

    id: Optional[int] = Field(default=None, primary_key=True)
    config_id: str = Field(index=True, unique=True)
    rule_id: Optional[int] = Field(default=None, foreign_key="intelligent_scan_rules.id", index=True)

    # Tuning strategy
    optimization_method: str = Field(default="bayesian", max_length=100)
    objective_type: str = Field(default="single", max_length=50)  # single, multi, pareto

    # Tuning parameters
    max_trials: int = Field(default=100, ge=1)
    timeout_seconds: int = Field(default=3600, ge=1)
    cross_validation_folds: int = Field(default=5, ge=1)
    early_stopping_patience: int = Field(default=10, ge=0)
    use_pruning: bool = Field(default=True)
    parallel_jobs: int = Field(default=4, ge=1)

    # Extra config
    additional_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    # Audit
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(default=None, max_length=255)


class HyperparameterSpace(SQLModel, table=True):
    """
    Search space definition for hyperparameter optimization.
    """
    __tablename__ = "hyperparameter_spaces"

    id: Optional[int] = Field(default=None, primary_key=True)
    space_id: str = Field(index=True, unique=True)
    rule_id: Optional[int] = Field(default=None, foreign_key="intelligent_scan_rules.id", index=True)

    search_space: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    version: str = Field(default="1.0", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: Optional[str] = Field(default=None, max_length=255)


class OptimizationObjective(SQLModel, table=True):
    """
    Optimization objectives and their properties for tuning.
    """
    __tablename__ = "optimization_objectives"

    id: Optional[int] = Field(default=None, primary_key=True)
    objective_id: str = Field(index=True, unique=True)
    rule_id: Optional[int] = Field(default=None, foreign_key="intelligent_scan_rules.id", index=True)

    objective_name: str = Field(max_length=100)  # e.g., accuracy, f1_score, execution_time
    direction: str = Field(default="maximize", max_length=20)  # maximize|minimize
    weight: float = Field(default=1.0)
    metric_key: Optional[str] = Field(default=None, max_length=100)
    threshold: Optional[float] = None

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class RulePerformanceMetric(SQLModel, table=True):
    """
    Detailed performance metric measurements for rules across executions.
    """
    __tablename__ = "rule_performance_metrics"

    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    execution_id: Optional[str] = Field(default=None, index=True, max_length=255)

    measured_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Quality metrics
    accuracy: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    precision: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    recall: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    # Performance metrics
    execution_time_ms: Optional[float] = Field(default=None, ge=0.0)
    throughput_records_per_second: Optional[float] = Field(default=None, ge=0.0)
    error_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    # Resource metrics
    cpu_usage_percent: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    memory_usage_mb: Optional[float] = Field(default=None, ge=0.0)

    # Custom payload
    custom_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    # Audit
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    __table_args__ = (
        Index('ix_rule_metric_time', 'rule_id', 'measured_at'),
        Index('ix_rule_metric_quality', 'accuracy', 'f1_score'),
    )

class RulePatternAssociation(SQLModel, table=True):
    """
    Association model linking rules with patterns from the pattern library.
    Tracks usage, effectiveness, and optimization opportunities.
    """
    __tablename__ = "rule_pattern_associations"
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    pattern_id: int = Field(foreign_key="rule_pattern_library.id", index=True)
    
    # Association Details
    association_type: str = Field(max_length=100)  # primary, secondary, fallback, enhancement
    usage_context: str = Field(max_length=200)
    weight: float = Field(default=1.0, ge=0.0, le=1.0)
    priority: int = Field(default=1, ge=1, le=10)
    
    # Performance Metrics
    effectiveness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    usage_frequency: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    contribution_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Optimization Data
    optimization_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    performance_trends: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    adaptation_log: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Status and Lifecycle
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_used: Optional[datetime] = None
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="pattern_associations")
    pattern: Optional[RulePatternLibrary] = Relationship(back_populates="rule_associations")
    
    # Table Constraints
    __table_args__ = (
        UniqueConstraint('rule_id', 'pattern_id', name='uq_rule_pattern'),
        Index('ix_association_effectiveness', 'effectiveness_score', 'success_rate'),
    )


class RulePerformanceBaseline(SQLModel, table=True):
    """
    Performance baselines for rules to track improvements and regressions.
    Enables continuous performance monitoring and optimization.
    """
    __tablename__ = "rule_performance_baselines"
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    baseline_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Baseline Configuration
    baseline_name: str = Field(max_length=255)
    baseline_type: str = Field(max_length=100)  # initial, quarterly, post_optimization, manual
    measurement_period_days: int = Field(default=30, ge=1)
    sample_size: int = Field(ge=1)
    
    # Performance Metrics
    average_execution_time_ms: float = Field(ge=0.0)
    percentile_95_time_ms: float = Field(ge=0.0)
    throughput_records_per_second: float = Field(ge=0.0)
    error_rate: float = Field(ge=0.0, le=1.0)
    accuracy_score: float = Field(ge=0.0, le=1.0)
    
    # Resource Usage Baselines
    average_cpu_usage: float = Field(ge=0.0, le=100.0)
    average_memory_usage_mb: float = Field(ge=0.0)
    network_io_baseline: float = Field(ge=0.0)
    storage_io_baseline: float = Field(ge=0.0)
    
    # Quality Baselines
    precision_baseline: float = Field(ge=0.0, le=1.0)
    recall_baseline: float = Field(ge=0.0, le=1.0)
    f1_score_baseline: float = Field(ge=0.0, le=1.0)
    false_positive_rate: float = Field(ge=0.0, le=1.0)
    
    # Statistical Measures
    standard_deviation: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    confidence_intervals: Dict[str, Tuple[float, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_significance: float = Field(ge=0.0, le=1.0)
    
    # Business Metrics
    business_value_baseline: Optional[float] = None
    cost_per_execution: Optional[float] = Field(ge=0.0)
    roi_baseline: Optional[float] = None
    
    # Data Collection Details
    measurement_start: datetime = Field(index=True)
    measurement_end: datetime = Field(index=True)
    data_points_collected: int = Field(ge=1)
    collection_methodology: str = Field(max_length=200)
    
    # Validation and Quality
    is_validated: bool = Field(default=False)
    validation_method: Optional[str] = Field(max_length=100)
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    outliers_removed: int = Field(default=0, ge=0)
    
    # Comparison Data
    previous_baseline_id: Optional[str] = None
    improvement_percentage: Optional[float] = None
    regression_indicators: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Status and Lifecycle
    is_current: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: str = Field(max_length=255)
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="performance_baselines")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_baseline_performance', 'average_execution_time_ms', 'accuracy_score'),
        Index('ix_baseline_period', 'measurement_start', 'measurement_end'),
    )


# ===================== RESPONSE AND REQUEST MODELS =====================

class IntelligentRuleResponse(BaseModel):
    """Response model for intelligent scan rules with comprehensive metadata."""
    id: int
    rule_id: str
    name: str
    display_name: Optional[str]
    description: Optional[str]
    complexity_level: RuleComplexityLevel
    pattern_type: PatternRecognitionType
    optimization_strategy: RuleOptimizationStrategy
    execution_strategy: RuleExecutionStrategy
    validation_status: RuleValidationStatus
    business_impact_level: RuleBusinessImpact
    
    # Performance Metrics
    accuracy_score: float
    execution_success_rate: float
    average_execution_time_ms: float
    total_executions: int
    
    # Configuration Summary
    ai_context_awareness: bool
    learning_enabled: bool
    parallel_execution: bool
    auto_optimization_enabled: bool
    
    # Status Information
    is_active: bool
    version: str
    created_at: datetime
    updated_at: datetime
    last_execution_time: Optional[datetime]
    
    class Config:
        from_attributes = True


class RuleCreateRequest(BaseModel):
    """Request model for creating new intelligent scan rules."""
    name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    rule_expression: str = Field(min_length=1)
    
    # Optional Configuration
    complexity_level: Optional[RuleComplexityLevel] = RuleComplexityLevel.INTERMEDIATE
    pattern_type: Optional[PatternRecognitionType] = PatternRecognitionType.REGEX
    optimization_strategy: Optional[RuleOptimizationStrategy] = RuleOptimizationStrategy.BALANCED
    business_impact_level: Optional[RuleBusinessImpact] = RuleBusinessImpact.MEDIUM
    
    # Advanced Options
    conditions: Optional[List[Dict[str, Any]]] = []
    actions: Optional[List[Dict[str, Any]]] = []
    parameters: Optional[Dict[str, Any]] = {}
    ml_model_config: Optional[Dict[str, Any]] = None
    
    # Performance Settings
    timeout_seconds: Optional[int] = Field(default=300, ge=1, le=3600)
    parallel_execution: Optional[bool] = True
    ai_context_awareness: Optional[bool] = False
    learning_enabled: Optional[bool] = True
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @validator('rule_expression')
    def validate_rule_expression(cls, v):
        if not v.strip():
            raise ValueError('Rule expression cannot be empty')
        # Additional validation logic could be added here
        return v.strip()


class RuleUpdateRequest(BaseModel):
    """Request model for updating existing intelligent scan rules."""
    name: Optional[str] = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    rule_expression: Optional[str] = Field(min_length=1)
    
    # Configuration Updates
    optimization_strategy: Optional[RuleOptimizationStrategy] = None
    business_impact_level: Optional[RuleBusinessImpact] = None
    timeout_seconds: Optional[int] = Field(ge=1, le=3600)
    
    # Feature Toggles
    ai_context_awareness: Optional[bool] = None
    learning_enabled: Optional[bool] = None
    parallel_execution: Optional[bool] = None
    auto_optimization_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class RuleExecutionRequest(BaseModel):
    """Request model for executing scan rules."""
    rule_ids: List[int] = Field(min_items=1)
    data_source_ids: List[int] = Field(min_items=1)
    
    # Execution Configuration
    execution_mode: Optional[str] = "parallel"  # parallel, sequential, adaptive
    priority: Optional[int] = Field(default=5, ge=1, le=10)
    timeout_override: Optional[int] = Field(ge=1, le=7200)
    
    # Advanced Options
    optimization_enabled: Optional[bool] = True
    monitoring_enabled: Optional[bool] = True
    classification_aware: Optional[bool] = True
    compliance_mode: Optional[bool] = True
    
    # Context Information
    triggered_by: Optional[str] = "user"
    execution_context: Optional[Dict[str, Any]] = {}


class PatternLibraryResponse(BaseModel):
    """Response model for pattern library entries."""
    id: int
    pattern_id: str
    name: str
    category: str
    subcategory: Optional[str]
    pattern_type: PatternRecognitionType
    complexity_score: float
    
    # Usage Statistics
    usage_count: int
    success_rate: float
    average_accuracy: float
    business_value_score: float
    
    # Metadata
    tags: List[str]
    data_types: List[str]
    is_public: bool
    version: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===================== MARKETPLACE AND COLLABORATION MODELS =====================

class ScanRuleTemplate(SQLModel, table=True):
    """Enterprise scan rule template model for marketplace and collaboration"""
    
    __tablename__ = "scan_rule_templates"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    template_id: str = Field(..., description="Unique template identifier")
    template_name: str = Field(..., description="Template name")
    template_version: str = Field(..., description="Template version")
    template_category: str = Field(..., description="Template category")
    template_description: Optional[str] = Field(default=None, description="Template description")
    
    # Template content and configuration
    template_content: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="Template content and configuration")
    template_schema: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="Template schema definition")
    template_parameters: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON), description="Template parameters")
    
    # Quality and certification
    quality_score: float = Field(default=0.0, ge=0.0, le=10.0, description="Template quality score")
    certification_level: str = Field(default="basic", description="Certification level")
    validation_status: str = Field(default="pending", description="Validation status")
    review_count: int = Field(default=0, description="Number of reviews")
    average_rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Average rating")
    
    # Usage and popularity
    download_count: int = Field(default=0, description="Number of downloads")
    usage_count: int = Field(default=0, description="Number of active usages")
    popularity_score: float = Field(default=0.0, description="Popularity score")
    trending_score: float = Field(default=0.0, description="Trending score")
    
    # Business and licensing
    license_type: str = Field(default="free", description="License type")
    pricing_tier: str = Field(default="basic", description="Pricing tier")
    revenue_generated: float = Field(default=0.0, description="Revenue generated")
    business_impact: str = Field(default="low", description="Business impact level")
    
    # Author and organization
    author_id: str = Field(..., description="Template author identifier")
    organization_id: str = Field(..., description="Organization identifier")
    author_reputation: float = Field(default=0.0, description="Author reputation score")
    organization_tier: str = Field(default="standard", description="Organization tier")
    
    # Metadata and lifecycle
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Template tags")
    supported_data_types: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Supported data types")
    compliance_frameworks: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Compliance frameworks")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    published_at: Optional[datetime] = Field(default=None, description="Publication timestamp")
    last_modified: Optional[datetime] = Field(default=None, description="Last modification timestamp")
    
    class Config:
        arbitrary_types_allowed = True

class RuleMarketplaceListing(SQLModel, table=True):
    """Enterprise rule marketplace listing model for commercial rule distribution"""
    
    __tablename__ = "rule_marketplace_listings"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    listing_id: str = Field(..., description="Unique listing identifier")
    template_id: str = Field(..., description="Associated template identifier")
    listing_title: str = Field(..., description="Listing title")
    listing_description: str = Field(..., description="Listing description")
    
    # Marketplace configuration
    marketplace_visibility: str = Field(default="public", description="Marketplace visibility level")
    listing_status: str = Field(default="active", description="Listing status")
    featured_status: bool = Field(default=False, description="Whether listing is featured")
    promotion_level: str = Field(default="none", description="Promotion level")
    
    # Pricing and licensing
    pricing_model: str = Field(..., description="Pricing model (subscription, one_time, usage_based)")
    base_price: float = Field(..., description="Base price")
    currency: str = Field(default="USD", description="Currency")
    discount_percentage: float = Field(default=0.0, description="Discount percentage")
    promotional_price: Optional[float] = Field(default=None, description="Promotional price")
    
    # Performance metrics
    conversion_rate: float = Field(default=0.0, description="Conversion rate percentage")
    click_through_rate: float = Field(default=0.0, description="Click-through rate")
    revenue_per_listing: float = Field(default=0.0, description="Revenue per listing")
    market_share: float = Field(default=0.0, description="Market share percentage")
    
    # Quality indicators
    customer_satisfaction: float = Field(default=0.0, ge=0.0, le=5.0, description="Customer satisfaction score")
    support_quality: float = Field(default=0.0, ge=0.0, le=5.0, description="Support quality score")
    documentation_quality: float = Field(default=0.0, ge=0.0, le=5.0, description="Documentation quality score")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Listing creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    published_at: Optional[datetime] = Field(default=None, description="Publication timestamp")
    featured_at: Optional[datetime] = Field(default=None, description="Featured timestamp")
    
    class Config:
        arbitrary_types_allowed = True

class RuleCollaboration(SQLModel, table=True):
    """Enterprise rule collaboration model for team-based rule development"""
    
    __tablename__ = "rule_collaborations"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    collaboration_id: str = Field(..., description="Unique collaboration identifier")
    template_id: str = Field(..., description="Associated template identifier")
    collaboration_type: str = Field(..., description="Type of collaboration")
    collaboration_status: str = Field(default="active", description="Collaboration status")
    
    # Team and participants
    team_id: str = Field(..., description="Team identifier")
    lead_user_id: str = Field(..., description="Lead user identifier")
    participant_ids: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Participant user IDs")
    stakeholder_ids: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Stakeholder user IDs")
    
    # Collaboration features
    shared_workspace: str = Field(..., description="Shared workspace identifier")
    version_control_enabled: bool = Field(default=True, description="Whether version control is enabled")
    review_process_enabled: bool = Field(default=True, description="Whether review process is enabled")
    approval_workflow_enabled: bool = Field(default=True, description="Whether approval workflow is enabled")
    
    # Communication and coordination
    communication_channels: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Communication channels")
    meeting_schedule: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="Meeting schedule")
    notification_preferences: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="Notification preferences")
    
    # Progress tracking
    milestones: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON), description="Project milestones")
    current_phase: str = Field(default="planning", description="Current collaboration phase")
    completion_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Completion percentage")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Collaboration creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    started_at: Optional[datetime] = Field(default=None, description="Start timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Completion timestamp")
    
    class Config:
        arbitrary_types_allowed = True

class RuleLicense(SQLModel, table=True):
    """Enterprise rule licensing model for commercial rule distribution"""
    
    __tablename__ = "rule_licenses"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    license_id: str = Field(..., description="Unique license identifier")
    template_id: str = Field(..., description="Associated template identifier")
    license_type: str = Field(..., description="License type")
    license_version: str = Field(..., description="License version")
    
    # License terms and conditions
    license_terms: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="License terms and conditions")
    usage_restrictions: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Usage restrictions")
    modification_allowed: bool = Field(default=False, description="Whether modifications are allowed")
    redistribution_allowed: bool = Field(default=False, description="Whether redistribution is allowed")
    
    # Pricing and billing
    pricing_model: str = Field(..., description="Pricing model")
    base_price: float = Field(..., description="Base license price")
    billing_cycle: str = Field(default="monthly", description="Billing cycle")
    volume_discounts: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON), description="Volume discount tiers")
    
    # Compliance and legal
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Compliance requirements")
    legal_terms: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="Legal terms and conditions")
    warranty_disclaimer: str = Field(default="", description="Warranty disclaimer")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="License creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    effective_date: Optional[datetime] = Field(default=None, description="Effective date")
    expiration_date: Optional[datetime] = Field(default=None, description="Expiration date")
    
    class Config:
        arbitrary_types_allowed = True

class RuleRating(SQLModel, table=True):
    """Enterprise rule rating model for quality assessment and feedback"""
    
    __tablename__ = "rule_ratings"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    rating_id: str = Field(..., description="Unique rating identifier")
    template_id: str = Field(..., description="Associated template identifier")
    user_id: str = Field(..., description="User who provided the rating")
    organization_id: str = Field(..., description="Organization identifier")
    
    # Rating details
    overall_rating: float = Field(..., ge=1.0, le=5.0, description="Overall rating (1-5)")
    accuracy_rating: float = Field(..., ge=1.0, le=5.0, description="Accuracy rating (1-5)")
    performance_rating: float = Field(..., ge=1.0, le=5.0, description="Performance rating (1-5)")
    ease_of_use_rating: float = Field(..., ge=1.0, le=5.0, description="Ease of use rating (1-5)")
    documentation_rating: float = Field(..., ge=1.0, le=5.0, description="Documentation rating (1-5)")
    
    # Feedback and comments
    rating_comment: Optional[str] = Field(default=None, description="Rating comment")
    improvement_suggestions: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Improvement suggestions")
    use_case_description: Optional[str] = Field(default=None, description="Use case description")
    
    # Rating context
    rating_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON), description="Rating context")
    rating_confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Rating confidence level")
    verified_purchase: bool = Field(default=False, description="Whether rating is from verified purchase")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Rating creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    class Config:
        arbitrary_types_allowed = True

class RuleUsageAnalytics(SQLModel, table=True):
    """Enterprise rule usage analytics model for performance tracking and optimization"""
    
    __tablename__ = "rule_usage_analytics"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    analytics_id: str = Field(..., description="Unique analytics identifier")
    template_id: str = Field(..., description="Associated template identifier")
    organization_id: str = Field(..., description="Organization identifier")
    analytics_period: str = Field(..., description="Analytics period (daily, weekly, monthly)")
    
    # Usage metrics
    total_executions: int = Field(default=0, description="Total rule executions")
    successful_executions: int = Field(default=0, description="Successful executions")
    failed_executions: int = Field(default=0, description="Failed executions")
    execution_success_rate: float = Field(default=0.0, ge=0.0, le=100.0, description="Execution success rate percentage")
    
    # Performance metrics
    average_execution_time_ms: float = Field(default=0.0, description="Average execution time in milliseconds")
    peak_execution_time_ms: float = Field(default=0.0, description="Peak execution time in milliseconds")
    total_execution_time_ms: float = Field(default=0.0, description="Total execution time in milliseconds")
    
    # Resource utilization
    cpu_usage_percentage: float = Field(default=0.0, description="CPU usage percentage")
    memory_usage_mb: float = Field(default=0.0, description="Memory usage in MB")
    network_io_mb: float = Field(default=0.0, description="Network I/O in MB")
    disk_io_mb: float = Field(default=0.0, description="Disk I/O in MB")
    
    # Business impact metrics
    data_records_processed: int = Field(default=0, description="Number of data records processed")
    compliance_violations_detected: int = Field(default=0, description="Compliance violations detected")
    risk_mitigation_score: float = Field(default=0.0, description="Risk mitigation score")
    cost_savings: float = Field(default=0.0, description="Cost savings achieved")
    
    # User engagement
    unique_users: int = Field(default=0, description="Number of unique users")
    active_sessions: int = Field(default=0, description="Number of active sessions")
    user_satisfaction_score: float = Field(default=0.0, ge=0.0, le=5.0, description="User satisfaction score")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Analytics creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    analytics_date: datetime = Field(..., description="Analytics date")
    
    class Config:
        arbitrary_types_allowed = True

# ===================== UTILITY MODELS =====================

class RuleValidationResult(BaseModel):
    """Model for rule validation results."""
    is_valid: bool
    validation_score: float
    issues: List[Dict[str, Any]]
    recommendations: List[str]
    performance_estimate: Dict[str, float]


class RuleOptimizationResult(BaseModel):
    """Model for rule optimization results."""
    optimization_id: str
    improvements: Dict[str, float]
    applied_changes: List[Dict[str, Any]]
    performance_gain: float
    confidence_score: float


class RuleBenchmarkResult(BaseModel):
    """Model for rule benchmarking results."""
    rule_id: str
    benchmark_type: str
    performance_metrics: Dict[str, float]
    comparison_baseline: Dict[str, float]
    improvement_percentage: Dict[str, float]
    statistical_significance: float


# ===================== MODEL REGISTRATION =====================

# Register all models for SQLModel metadata
__all__ = [
    "IntelligentScanRule",
    "RulePatternLibrary", 
    "RuleExecutionHistory",
    "RuleOptimizationJob",
    "RulePatternAssociation",
    "RulePerformanceBaseline",
    "IntelligentRuleResponse",
    "RuleCreateRequest",
    "RuleUpdateRequest", 
    "RuleExecutionRequest",
    "PatternLibraryResponse",
    "RuleValidationResult",
    "RuleOptimizationResult",
    "RuleBenchmarkResult",
    # Marketplace and collaboration models
    "ScanRuleTemplate",
    "RuleMarketplaceListing",
    "RuleCollaboration",
    "RuleLicense",
    "RuleRating",
    "RuleUsageAnalytics",
    # Enums
    "RuleComplexityLevel",
    "PatternRecognitionType",
    "RuleOptimizationStrategy",
    "RuleExecutionStrategy",
    "RuleValidationStatus",
    "RuleBusinessImpact",
]

# ===================== BACKWARD COMPATIBILITY =====================
# Forward references to avoid circular imports - these will be resolved at runtime
# Type annotations for backward compatibility without creating new tables
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..scan_models import ScanRuleSet, EnhancedScanRuleSet

# Export the names for backward compatibility
__all__ += ["ScanRuleSet", "EnhancedScanRuleSet"]