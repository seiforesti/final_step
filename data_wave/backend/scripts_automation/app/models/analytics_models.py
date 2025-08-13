from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
import json

class AnalyticsModelType(str, Enum):
    CORRELATION = "correlation"
    PREDICTION = "prediction" 
    ANOMALY_DETECTION = "anomaly_detection"
    PATTERN_RECOGNITION = "pattern_recognition"
    TREND_ANALYSIS = "trend_analysis"
    CAUSALITY = "causality"
    CLUSTERING = "clustering"
    RECOMMENDATION = "recommendation"

class InsightSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AnalyticsDataset(SQLModel, table=True):
    """Advanced dataset model for analytics processing"""
    __tablename__ = "analytics_datasets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    name: str = Field(index=True)
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    dataset_type: str = Field(default="table")  # table, view, query, stream
    
    # Advanced metadata
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    data_quality_score: Optional[float] = Field(default=0.0, ge=0.0, le=1.0)
    business_criticality: str = Field(default="medium")  # low, medium, high, critical
    
    # ML-ready features
    is_ml_ready: bool = Field(default=False)
    feature_engineering_applied: bool = Field(default=False)
    ml_model_compatibility: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Real-time capabilities
    supports_streaming: bool = Field(default=False)
    real_time_processing: bool = Field(default=False)
    latency_requirements_ms: Optional[int] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    correlations: List["DataCorrelation"] = Relationship(back_populates="dataset")
    insights: List["AnalyticsInsight"] = Relationship(back_populates="dataset")
    models: List["MLModel"] = Relationship(back_populates="dataset")

class DataCorrelation(SQLModel, table=True):
    """Advanced correlation analysis between datasets/columns"""
    __tablename__ = "data_correlations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    dataset_id: int = Field(foreign_key="analytics_datasets.id", index=True)
    
    # Correlation details
    source_column: str
    target_column: Optional[str] = None
    target_dataset_id: Optional[int] = Field(foreign_key="analytics_datasets.id")
    
    # Advanced correlation metrics
    correlation_coefficient: float = Field(ge=-1.0, le=1.0)
    correlation_type: str  # pearson, spearman, kendall, mutual_information, causality
    p_value: Optional[float] = None
    confidence_interval: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal analysis
    temporal_stability: Optional[float] = Field(ge=0.0, le=1.0)
    seasonal_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    trend_direction: Optional[str] = None  # increasing, decreasing, stable, cyclic
    
    # Advanced insights
    business_impact_score: Optional[float] = Field(ge=0.0, le=1.0)
    actionability_score: Optional[float] = Field(ge=0.0, le=1.0)
    causality_confidence: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Metadata
    analysis_method: str = Field(default="statistical")
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    sample_size: Optional[int] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    dataset: Optional["AnalyticsDataset"] = Relationship(back_populates="correlations")

class AnalyticsInsight(SQLModel, table=True):
    """AI-powered insights and recommendations"""
    __tablename__ = "analytics_insights"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    dataset_id: int = Field(foreign_key="analytics_datasets.id", index=True)
    
    # Insight classification
    insight_type: str  # anomaly, pattern, trend, opportunity, risk, prediction
    category: str  # data_quality, business_value, performance, security, compliance
    severity: InsightSeverity = Field(default=InsightSeverity.MEDIUM)
    
    # Content
    title: str
    description: str
    technical_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # AI-powered analysis
    confidence_score: float = Field(ge=0.0, le=1.0)
    ai_model_used: str = Field(default="hybrid_analytics")
    evidence: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_significance: Optional[float] = None
    
    # Business impact
    business_impact: str  # low, medium, high, critical
    estimated_value: Optional[float] = None
    estimated_risk: Optional[float] = None
    
    # Recommendations
    recommendations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    action_items: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    implementation_effort: str = Field(default="medium")  # low, medium, high
    
    # Validation and feedback
    is_validated: bool = Field(default=False)
    validation_score: Optional[float] = Field(ge=0.0, le=1.0)
    user_feedback: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal aspects
    trend_period_days: Optional[int] = None
    prediction_horizon_days: Optional[int] = None
    expires_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    dataset: Optional["AnalyticsDataset"] = Relationship(back_populates="insights")

class MLModel(SQLModel, table=True):
    """Advanced ML model management and tracking"""
    __tablename__ = "ml_models"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    dataset_id: int = Field(foreign_key="analytics_datasets.id", index=True)
    
    # Model identification
    name: str
    model_type: AnalyticsModelType
    algorithm: str  # random_forest, xgboost, neural_network, transformer, etc.
    version: str = Field(default="1.0.0")
    
    # Model performance
    accuracy: Optional[float] = Field(ge=0.0, le=1.0)
    precision: Optional[float] = Field(ge=0.0, le=1.0)
    recall: Optional[float] = Field(ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(ge=0.0, le=1.0)
    auc_roc: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Advanced metrics
    feature_importance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    model_explainability: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    bias_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    fairness_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Training details
    training_data_size: Optional[int] = None
    training_duration_minutes: Optional[int] = None
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    cross_validation_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Deployment and monitoring
    is_deployed: bool = Field(default=False)
    deployment_environment: Optional[str] = None
    api_endpoint: Optional[str] = None
    prediction_latency_ms: Optional[float] = None
    throughput_predictions_per_second: Optional[float] = None
    
    # Model drift and monitoring
    data_drift_score: Optional[float] = Field(ge=0.0, le=1.0)
    model_drift_score: Optional[float] = Field(ge=0.0, le=1.0)
    performance_degradation: Optional[float] = None
    last_retrained: Optional[datetime] = None
    retrain_threshold: float = Field(default=0.1)
    
    # Governance
    approval_status: str = Field(default="pending")  # pending, approved, rejected, deprecated
    approved_by: Optional[str] = None
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_checks: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    dataset: Optional["AnalyticsDataset"] = Relationship(back_populates="models")

class AnalyticsAlert(SQLModel, table=True):
    """Real-time analytics alerts and notifications"""
    __tablename__ = "analytics_alerts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    dataset_id: Optional[int] = Field(foreign_key="analytics_datasets.id", index=True)
    model_id: Optional[int] = Field(foreign_key="ml_models.id", index=True)
    
    # Alert details
    alert_type: str  # drift, anomaly, performance, prediction, threshold
    severity: InsightSeverity = Field(default=InsightSeverity.MEDIUM)
    title: str
    description: str
    
    # Trigger conditions
    threshold_value: Optional[float] = None
    actual_value: Optional[float] = None
    trigger_condition: str  # greater_than, less_than, equals, anomaly_detected
    
    # Alert status
    status: str = Field(default="active")  # active, acknowledged, resolved, dismissed
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    # Metadata
    alert_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AnalyticsExperiment(SQLModel, table=True):
    """A/B testing and experimentation framework"""
    __tablename__ = "analytics_experiments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    
    # Experiment configuration
    experiment_type: str  # ab_test, multivariate, bandit, bayesian
    status: str = Field(default="draft")  # draft, running, completed, paused
    hypothesis: str
    success_metrics: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Statistical design
    sample_size: Optional[int] = None
    confidence_level: float = Field(default=0.95)
    minimum_detectable_effect: Optional[float] = None
    power: float = Field(default=0.8)
    
    # Results
    results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_significance: Optional[bool] = None
    p_value: Optional[float] = None
    effect_size: Optional[float] = None
    
    # Timeline
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration_days: Optional[int] = None
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AnalyticsQuery(SQLModel):
    """Analytics query model for comprehensive analytics service"""
    query_type: str  # cross_system, predictive, trend, roi, business_intelligence
    data_sources: List[str] = Field(default_factory=list)
    time_range: Dict[str, datetime] = Field(default_factory=dict)
    filters: Dict[str, Any] = Field(default_factory=dict)
    parameters: Dict[str, Any] = Field(default_factory=dict)
    user_id: Optional[str] = None
    priority: str = Field(default="normal")  # low, normal, high, critical
    cache_ttl_seconds: Optional[int] = None

class AnalyticsResult(SQLModel):
    """Analytics result model for comprehensive analytics service"""
    query_id: str
    query_hash: str
    query_type: str
    result_data: Dict[str, Any]
    execution_time_seconds: float
    generated_at: datetime
    generated_by: str
    result_metadata: Dict[str, Any] = Field(default_factory=dict)