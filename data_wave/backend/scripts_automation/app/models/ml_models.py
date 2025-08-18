"""
Advanced ML Models for Enterprise Classification System - Version 2
Production-grade ML infrastructure surpassing Databricks and Microsoft Purview
Deep integration with existing data governance ecosystem
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text, Index
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, LargeBinary
import enum
from enum import Enum
import json

# Import base classification models for integration
from .classification_models import (
    SensitivityLevel, ClassificationConfidenceLevel, 
    ClassificationScope, ClassificationStatus, ClassificationFramework,
    ClassificationRule, ClassificationResult
)

# Enhanced ML-specific Enums
class MLModelType(str, Enum):
    """Advanced ML Model Types for Enterprise Classification"""
    # Traditional ML
    RANDOM_FOREST = "random_forest"
    GRADIENT_BOOSTING = "gradient_boosting"
    SVM = "svm"
    LOGISTIC_REGRESSION = "logistic_regression"
    NAIVE_BAYES = "naive_bayes"
    KNN = "knn"
    
    # Deep Learning
    NEURAL_NETWORK = "neural_network"
    DEEP_NEURAL_NETWORK = "deep_neural_network"
    CONVOLUTIONAL_NN = "convolutional_nn"
    RECURRENT_NN = "recurrent_nn"
    LSTM = "lstm"
    GRU = "gru"
    
    # NLP & Text Processing
    TRANSFORMER = "transformer"
    BERT = "bert"
    ROBERTA = "roberta"
    DISTILBERT = "distilbert"
    WORD2VEC = "word2vec"
    TFIDF_CLASSIFIER = "tfidf_classifier"
    
    # Ensemble Methods
    ENSEMBLE = "ensemble"
    VOTING_CLASSIFIER = "voting_classifier"
    STACKING = "stacking"
    BAGGING = "bagging"
    
    # AutoML & Advanced
    AUTOML = "automl"
    XGBOOST = "xgboost"
    LIGHTGBM = "lightgbm"
    CATBOOST = "catboost"
    
    # Specialized
    ANOMALY_DETECTION = "anomaly_detection"
    CLUSTERING = "clustering"
    REINFORCEMENT_LEARNING = "reinforcement_learning"

class MLTaskType(str, Enum):
    """ML Task Types for Classification"""
    BINARY_CLASSIFICATION = "binary_classification"
    MULTICLASS_CLASSIFICATION = "multiclass_classification"
    MULTILABEL_CLASSIFICATION = "multilabel_classification"
    REGRESSION = "regression"
    RANKING = "ranking"
    ANOMALY_DETECTION = "anomaly_detection"
    CLUSTERING = "clustering"
    FEATURE_EXTRACTION = "feature_extraction"
    DIMENSIONALITY_REDUCTION = "dimensionality_reduction"

class MLModelStatus(str, Enum):
    """ML Model Lifecycle Status"""
    DRAFT = "draft"
    TRAINING = "training"
    VALIDATING = "validating"
    TRAINED = "trained"
    TESTING = "testing"
    DEPLOYING = "deploying"
    DEPLOYED = "deployed"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    FAILED = "failed"
    ARCHIVED = "archived"

class MLDataType(str, Enum):
    """Types of data for ML processing"""
    STRUCTURED = "structured"
    SEMI_STRUCTURED = "semi_structured"
    UNSTRUCTURED = "unstructured"
    TEXT = "text"
    NUMERIC = "numeric"
    CATEGORICAL = "categorical"
    TEMPORAL = "temporal"
    GEOSPATIAL = "geospatial"
    MIXED = "mixed"

class MLFeatureType(str, Enum):
    """ML Feature Types"""
    NUMERICAL = "numerical"
    CATEGORICAL = "categorical"
    TEXT = "text"
    BOOLEAN = "boolean"
    DATETIME = "datetime"
    EMBEDDED = "embedded"
    ENGINEERED = "engineered"
    DERIVED = "derived"

class MLModelFramework(str, Enum):
    """ML Framework Support"""
    SCIKIT_LEARN = "scikit_learn"
    TENSORFLOW = "tensorflow"
    PYTORCH = "pytorch"
    XGBOOST = "xgboost"
    LIGHTGBM = "lightgbm"
    CATBOOST = "catboost"
    KERAS = "keras"
    HUGGINGFACE = "huggingface"
    SPACY = "spacy"
    NLTK = "nltk"
    CUSTOM = "custom"

# Advanced ML Model Configuration
class MLModelConfiguration(SQLModel, table=True):
    """Enterprise ML Model Configuration with Advanced Features"""
    __tablename__ = "ml_model_configurations"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    model_type: MLModelType = Field(sa_column=Column(SQLEnum(MLModelType)))
    task_type: MLTaskType = Field(sa_column=Column(SQLEnum(MLTaskType)))
    framework: MLModelFramework = Field(sa_column=Column(SQLEnum(MLModelFramework)))
    
    # Model Architecture & Configuration
    model_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    hyperparameters: Dict[str, Any] = Field(sa_column=Column(JSON))
    architecture_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Training Configuration
    training_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    validation_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    optimization_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Feature Engineering
    feature_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    preprocessing_pipeline: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    feature_selection: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Model Lifecycle
    model_version: str = Field(default="1.0.0")
    model_path: Optional[str] = Field(default=None, max_length=1000)
    model_artifacts_path: Optional[str] = Field(default=None, max_length=1000)
    status: MLModelStatus = Field(default=MLModelStatus.DRAFT, sa_column=Column(SQLEnum(MLModelStatus)))
    
    # Performance Metrics
    performance_metrics: Dict[str, Any] = Field(sa_column=Column(JSON))
    validation_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    benchmark_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Training Information
    training_data_hash: Optional[str] = Field(default=None, max_length=64)
    training_duration_seconds: Optional[int] = Field(default=None)
    training_samples_count: Optional[int] = Field(default=None)
    validation_samples_count: Optional[int] = Field(default=None)
    test_samples_count: Optional[int] = Field(default=None)
    
    # Scheduling & Automation
    last_trained: Optional[datetime] = Field(default=None)
    next_training_scheduled: Optional[datetime] = Field(default=None)
    auto_retrain: bool = Field(default=False)
    retrain_threshold: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Deployment Configuration
    deployment_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    scaling_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    monitoring_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Integration with Classification System
    classification_framework_id: Optional[int] = Field(default=None, foreign_key="classification_frameworks.id")
    target_sensitivity_levels: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    classification_scope: Optional[ClassificationScope] = Field(default=None, sa_column=Column(SQLEnum(ClassificationScope)))
    
    # Relationships
    classification_framework: Optional[ClassificationFramework] = Relationship()
    training_jobs: List["MLTrainingJob"] = Relationship(back_populates="model_config")
    predictions: List["MLPrediction"] = Relationship(back_populates="model_config")
    experiments: List["MLExperiment"] = Relationship(back_populates="model_config")
    
    __table_args__ = (
        Index("idx_ml_model_name_type", "name", "model_type"),
        Index("idx_ml_model_status", "status"),
        Index("idx_ml_model_framework", "framework"),
    )

# Advanced Training Data Management
class MLTrainingDataset(SQLModel, table=True):
    """Advanced Training Dataset Management with Lineage Tracking"""
    __tablename__ = "ml_training_datasets"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    dataset_type: MLDataType = Field(sa_column=Column(SQLEnum(MLDataType)))
    
    # Data Source Integration
    data_source_ids: List[int] = Field(sa_column=Column(JSON))
    catalog_item_ids: Optional[List[int]] = Field(default_factory=list, sa_column=Column(JSON))
    scan_result_ids: Optional[List[int]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Dataset Configuration
    data_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    schema_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    sampling_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Labels and Ground Truth
    labeling_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    ground_truth_labels: Dict[str, Any] = Field(sa_column=Column(JSON))
    label_quality_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Quality and Validation
    quality_metrics: Dict[str, Any] = Field(sa_column=Column(JSON))
    validation_rules: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    data_drift_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Dataset Statistics
    total_samples: int = Field(default=0)
    training_samples: int = Field(default=0)
    validation_samples: int = Field(default=0)
    test_samples: int = Field(default=0)
    
    # Feature Information
    feature_count: int = Field(default=0)
    feature_schema: Dict[str, Any] = Field(sa_column=Column(JSON))
    feature_statistics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Lineage and Governance
    data_lineage: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    privacy_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage Tracking
    usage_count: int = Field(default=0)
    last_used: Optional[datetime] = Field(default=None)
    
    # Relationships
    training_jobs: List["MLTrainingJob"] = Relationship(back_populates="training_dataset")
    
    __table_args__ = (
        Index("idx_ml_dataset_name_type", "name", "dataset_type"),
    )

# Enhanced ML Training Job Management
class MLTrainingJob(SQLModel, table=True):
    """Advanced ML Training Job with Comprehensive Tracking"""
    __tablename__ = "ml_training_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    job_name: str = Field(index=True, max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Job Configuration
    model_config_id: int = Field(foreign_key="ml_model_configurations.id")
    training_dataset_id: int = Field(foreign_key="ml_training_datasets.id")
    job_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    
    # Training Parameters
    training_parameters: Dict[str, Any] = Field(sa_column=Column(JSON))
    hyperparameter_tuning: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_strategy: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Information
    status: MLModelStatus = Field(default=MLModelStatus.DRAFT, sa_column=Column(SQLEnum(MLModelStatus)))
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[int] = Field(default=None)
    
    # Resource Utilization
    compute_resources: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_usage_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Training Progress and Metrics
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    current_epoch: Optional[int] = Field(default=None)
    total_epochs: Optional[int] = Field(default=None)
    training_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Model Artifacts
    model_artifacts: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    model_checkpoints: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    final_model_path: Optional[str] = Field(default=None, max_length=1000)
    
    # Error Handling and Debugging
    error_messages: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    debug_logs: Optional[str] = Field(default=None, sa_column=Column(Text))
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)
    
    # Integration Context
    triggered_by: str = Field(default="manual", max_length=100)  # manual, scheduled, threshold, api
    trigger_context: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    model_config: Optional[MLModelConfiguration] = Relationship(back_populates="training_jobs")
    training_dataset: Optional[MLTrainingDataset] = Relationship(back_populates="training_jobs")
    predictions: List["MLPrediction"] = Relationship(back_populates="training_job")
    
    __table_args__ = (
        Index("idx_ml_job_status", "status"),
        Index("idx_ml_job_started", "started_at"),
        Index("idx_ml_job_model", "model_config_id"),
    )

# Advanced ML Prediction and Inference
class MLPrediction(SQLModel, table=True):
    """Advanced ML Prediction with Comprehensive Tracking"""
    __tablename__ = "ml_predictions"

    id: Optional[int] = Field(default=None, primary_key=True)
    prediction_id: str = Field(unique=True, index=True, max_length=255)
    
    # Model and Job Information
    model_config_id: int = Field(foreign_key="ml_model_configurations.id")
    training_job_id: Optional[int] = Field(default=None, foreign_key="ml_training_jobs.id")
    model_version: str = Field(max_length=50)
    
    # Target Information
    target_type: str = Field(max_length=100)  # data_source, table, column, scan_result, catalog_item
    target_id: str = Field(max_length=500, index=True)
    target_identifier: str = Field(max_length=500)
    target_path: Optional[str] = Field(default=None, max_length=1000)
    
    # Input Data
    input_data: Dict[str, Any] = Field(sa_column=Column(JSON))
    input_features: Dict[str, Any] = Field(sa_column=Column(JSON))
    preprocessing_applied: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Prediction Results
    prediction_result: Dict[str, Any] = Field(sa_column=Column(JSON))
    predicted_class: Optional[str] = Field(default=None, max_length=255)
    prediction_probabilities: Optional[Dict[str, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    confidence_score: float = Field(ge=0.0, le=1.0)
    confidence_level: ClassificationConfidenceLevel = Field(sa_column=Column(SQLEnum(ClassificationConfidenceLevel)))
    
    # Classification Integration
    sensitivity_prediction: Optional[SensitivityLevel] = Field(default=None, sa_column=Column(SQLEnum(SensitivityLevel)))
    classification_tags: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    risk_assessment: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance and Quality
    prediction_quality_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    uncertainty_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    explainability_data: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Information
    inference_time_ms: Optional[int] = Field(default=None)
    processing_timestamp: datetime = Field(default_factory=datetime.utcnow)
    batch_id: Optional[str] = Field(default=None, max_length=255)
    
    # Validation and Feedback
    ground_truth_label: Optional[str] = Field(default=None, max_length=255)
    is_correct: Optional[bool] = Field(default=None)
    feedback_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    human_validation: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Integration with Classification Results
    classification_result_id: Optional[int] = Field(default=None, foreign_key="classification_results.id")
    
    # Relationships
    model_config: Optional[MLModelConfiguration] = Relationship(back_populates="predictions")
    training_job: Optional[MLTrainingJob] = Relationship(back_populates="predictions")
    classification_result: Optional[ClassificationResult] = Relationship()
    feedback_entries: List["MLFeedback"] = Relationship(back_populates="prediction")
    
    __table_args__ = (
        Index("idx_ml_prediction_target", "target_type", "target_id"),
        Index("idx_ml_prediction_model", "model_config_id"),
        Index("idx_ml_prediction_timestamp", "processing_timestamp"),
        Index("idx_ml_prediction_confidence", "confidence_score"),
    )

# Advanced ML Feedback and Active Learning
class MLFeedback(SQLModel, table=True):
    """Advanced ML Feedback System for Active Learning"""
    __tablename__ = "ml_feedback"

    id: Optional[int] = Field(default=None, primary_key=True)
    prediction_id: int = Field(foreign_key="ml_predictions.id")
    
    # Feedback Information
    feedback_type: str = Field(max_length=100)  # correction, validation, enhancement, dispute
    feedback_source: str = Field(max_length=100)  # human_expert, automated_validation, user_input
    feedback_quality: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Feedback Content
    original_prediction: Dict[str, Any] = Field(sa_column=Column(JSON))
    corrected_prediction: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    feedback_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Context and Reasoning
    correction_reasoning: Optional[str] = Field(default=None, sa_column=Column(Text))
    domain_context: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    business_context: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Expert Information
    expert_id: Optional[int] = Field(default=None, foreign_key="users.id")
    expert_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    expert_domain: Optional[str] = Field(default=None, max_length=255)
    
    # Impact and Processing
    is_processed: bool = Field(default=False)
    processing_status: str = Field(default="pending", max_length=100)
    impact_on_model: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    retraining_triggered: bool = Field(default=False)
    
    # Validation and Quality Control
    is_validated: bool = Field(default=False)
    validation_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    consensus_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Relationships
    prediction: Optional[MLPrediction] = Relationship(back_populates="feedback_entries")
    
    __table_args__ = (
        Index("idx_ml_feedback_prediction", "prediction_id"),
        Index("idx_ml_feedback_type", "feedback_type"),
        Index("idx_ml_feedback_processed", "is_processed"),
        Index("idx_ml_feedback_expert", "expert_id"),
    )

# Advanced ML Experiment Management
class MLExperiment(SQLModel, table=True):
    """Advanced ML Experiment Tracking and Management"""
    __tablename__ = "ml_experiments"

    id: Optional[int] = Field(default=None, primary_key=True)
    experiment_name: str = Field(index=True, max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Experiment Configuration
    model_config_id: int = Field(foreign_key="ml_model_configurations.id")
    experiment_type: str = Field(max_length=100)  # hyperparameter_tuning, architecture_search, feature_selection
    experiment_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    
    # Experiment Parameters
    parameter_space: Dict[str, Any] = Field(sa_column=Column(JSON))
    search_strategy: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_objective: str = Field(max_length=255)
    
    # Execution Status
    status: MLModelStatus = Field(default=MLModelStatus.DRAFT, sa_column=Column(SQLEnum(MLModelStatus)))
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    total_runs: int = Field(default=0)
    completed_runs: int = Field(default=0)
    
    # Results and Analysis
    best_run_config: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    best_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    all_runs_summary: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Analysis and Insights
    statistical_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    feature_importance: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    model_interpretability: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource Usage
    total_compute_time: Optional[int] = Field(default=None)
    resource_utilization: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    model_config: Optional[MLModelConfiguration] = Relationship(back_populates="experiments")
    experiment_runs: List["MLExperimentRun"] = Relationship(back_populates="experiment")
    
    __table_args__ = (
        Index("idx_ml_experiment_status", "status"),
        Index("idx_ml_experiment_model", "model_config_id"),
        Index("idx_ml_experiment_started", "started_at"),
    )

# Individual Experiment Run Tracking
class MLExperimentRun(SQLModel, table=True):
    """Individual ML Experiment Run with Detailed Tracking"""
    __tablename__ = "ml_experiment_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    experiment_id: int = Field(foreign_key="ml_experiments.id")
    run_name: str = Field(max_length=255)
    run_number: int = Field(default=1)
    
    # Run Configuration
    run_parameters: Dict[str, Any] = Field(sa_column=Column(JSON))
    hyperparameters: Dict[str, Any] = Field(sa_column=Column(JSON))
    model_architecture: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Information
    status: MLModelStatus = Field(default=MLModelStatus.DRAFT, sa_column=Column(SQLEnum(MLModelStatus)))
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[int] = Field(default=None)
    
    # Training Metrics
    training_metrics: Dict[str, Any] = Field(sa_column=Column(JSON))
    validation_metrics: Dict[str, Any] = Field(sa_column=Column(JSON))
    test_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Analysis
    convergence_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    overfitting_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    feature_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Model Artifacts
    model_artifacts: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    checkpoint_paths: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    final_model_path: Optional[str] = Field(default=None, max_length=1000)
    
    # Resource and Performance
    resource_usage: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    memory_usage: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    gpu_utilization: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error Handling
    error_logs: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    warnings: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    experiment: Optional[MLExperiment] = Relationship(back_populates="experiment_runs")
    
    __table_args__ = (
        Index("idx_ml_run_experiment", "experiment_id"),
        Index("idx_ml_run_status", "status"),
        Index("idx_ml_run_started", "started_at"),
    )

# Advanced ML Feature Store
class MLFeatureStore(SQLModel, table=True):
    """Advanced Feature Store for ML Pipeline"""
    __tablename__ = "ml_feature_store"

    id: Optional[int] = Field(default=None, primary_key=True)
    feature_name: str = Field(index=True, max_length=255)
    feature_group: str = Field(max_length=255, index=True)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Feature Configuration
    feature_type: MLFeatureType = Field(sa_column=Column(SQLEnum(MLFeatureType)))
    data_type: str = Field(max_length=100)
    feature_config: Dict[str, Any] = Field(sa_column=Column(JSON))
    
    # Feature Engineering
    transformation_logic: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    aggregation_logic: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    derivation_logic: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Feature Statistics
    statistical_properties: Dict[str, Any] = Field(sa_column=Column(JSON))
    distribution_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    correlation_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Lineage
    source_tables: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    source_columns: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    lineage_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and Monitoring
    quality_metrics: Dict[str, Any] = Field(sa_column=Column(JSON))
    drift_detection: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_thresholds: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage and Performance
    usage_statistics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_impact: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    importance_scores: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Governance
    business_definition: Optional[str] = Field(default=None, sa_column=Column(Text))
    data_owner: Optional[str] = Field(default=None, max_length=255)
    privacy_classification: Optional[SensitivityLevel] = Field(default=None, sa_column=Column(SQLEnum(SensitivityLevel)))
    
    __table_args__ = (
        Index("idx_ml_feature_name_group", "feature_name", "feature_group"),
        Index("idx_ml_feature_type", "feature_type"),
    )

# ML Model Performance Monitoring
class MLModelMonitoring(SQLModel, table=True):
    """Advanced ML Model Performance Monitoring"""
    __tablename__ = "ml_model_monitoring"

    id: Optional[int] = Field(default=None, primary_key=True)
    model_config_id: int = Field(foreign_key="ml_model_configurations.id")
    monitoring_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Performance Metrics
    accuracy_metrics: Dict[str, float] = Field(sa_column=Column(JSON))
    precision_recall_metrics: Dict[str, float] = Field(sa_column=Column(JSON))
    prediction_distribution: Dict[str, Any] = Field(sa_column=Column(JSON))
    
    # Data Drift Detection
    input_drift_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    prediction_drift_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    concept_drift_indicators: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Model Behavior Analysis
    confidence_distribution: Dict[str, Any] = Field(sa_column=Column(JSON))
    error_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    bias_detection: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource and Performance
    inference_latency_metrics: Dict[str, float] = Field(sa_column=Column(JSON))
    throughput_metrics: Dict[str, float] = Field(sa_column=Column(JSON))
    resource_utilization: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Alerts and Recommendations
    alert_status: str = Field(default="normal", max_length=100)
    alerts_triggered: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Impact
    business_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    roi_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    __table_args__ = (
        Index("idx_ml_monitoring_model_timestamp", "model_config_id", "monitoring_timestamp"),
        Index("idx_ml_monitoring_alert", "alert_status"),
    )

# System Performance Log for Real-time ML Model Monitoring
class SystemPerformanceLog(SQLModel, table=True):
    """Enterprise System Performance Log for ML Model Monitoring"""
    __tablename__ = "system_performance_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    log_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # System Resource Metrics
    cpu_utilization: float = Field(default=0.0, ge=0.0, le=100.0)
    memory_utilization: float = Field(default=0.0, ge=0.0, le=100.0)
    gpu_utilization: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    storage_utilization: float = Field(default=0.0, ge=0.0, le=100.0)
    network_bandwidth_utilization: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    
    # ML Model Specific Metrics
    active_model_count: int = Field(default=0, ge=0)
    total_inference_requests: int = Field(default=0, ge=0)
    successful_inferences: int = Field(default=0, ge=0)
    failed_inferences: int = Field(default=0, ge=0)
    average_inference_latency_ms: float = Field(default=0.0, ge=0.0)
    p95_inference_latency_ms: float = Field(default=0.0, ge=0.0)
    p99_inference_latency_ms: float = Field(default=0.0, ge=0.0)
    
    # Resource Allocation
    cpu_cores_allocated: int = Field(default=0, ge=0)
    memory_gb_allocated: float = Field(default=0.0, ge=0.0)
    gpu_count_allocated: int = Field(default=0, ge=0)
    storage_gb_allocated: float = Field(default=0.0, ge=0.0)
    
    # Performance Indicators
    throughput_requests_per_second: float = Field(default=0.0, ge=0.0)
    error_rate_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    availability_percentage: float = Field(default=100.0, ge=0.0, le=100.0)
    
    # Model Performance Details
    model_performance_metrics: Dict[str, Any] = Field(sa_column=Column(JSON))
    resource_usage_by_model: Dict[str, Any] = Field(sa_column=Column(JSON))
    bottleneck_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # System Health
    system_health_score: float = Field(default=100.0, ge=0.0, le=100.0)
    critical_alerts: int = Field(default=0, ge=0)
    warning_alerts: int = Field(default=0, ge=0)
    performance_degradation_indicators: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Environmental Context
    peak_usage_period: bool = Field(default=False)
    maintenance_mode: bool = Field(default=False)
    scaling_events: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata
    node_id: Optional[str] = Field(default=None, max_length=255)
    cluster_id: Optional[str] = Field(default=None, max_length=255)
    deployment_environment: Optional[str] = Field(default=None, max_length=100)
    
    __table_args__ = (
        Index("idx_system_perf_timestamp", "log_timestamp"),
        Index("idx_system_perf_health", "system_health_score"),
        Index("idx_system_perf_alerts", "critical_alerts", "warning_alerts"),
    )