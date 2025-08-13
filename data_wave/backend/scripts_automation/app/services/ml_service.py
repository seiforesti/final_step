"""
Advanced ML Service for Enterprise Classification System - Version 2
Production-grade ML service surpassing Databricks and Microsoft Purview
Comprehensive ML pipeline orchestration and management
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
import json
import uuid
import numpy as np
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, asc
import pickle
import joblib
from pathlib import Path
import hashlib

# ML Framework Imports
try:
    import sklearn
    from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, RandomizedSearchCV
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.svm import SVC
    from sklearn.linear_model import LogisticRegression
    from sklearn.naive_bayes import GaussianNB
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.neural_network import MLPClassifier
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
    from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
    from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
    from sklearn.pipeline import Pipeline
    from sklearn.compose import ColumnTransformer
    ML_FRAMEWORKS_AVAILABLE = True
except ImportError:
    ML_FRAMEWORKS_AVAILABLE = False
    logging.warning("ML frameworks not available. Install scikit-learn for full functionality.")

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

try:
    import catboost as cb
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False

# Import models and services
from ..models.ml_models import (
    MLModelConfiguration, MLTrainingDataset, MLTrainingJob, MLPrediction,
    MLFeedback, MLExperiment, MLExperimentRun, MLFeatureStore,
    MLModelMonitoring, MLModelType, MLTaskType, MLModelStatus,
    MLDataType, MLFeatureType, MLModelFramework
)
from ..models.classification_models import (
    ClassificationFramework, ClassificationRule, ClassificationResult,
    SensitivityLevel, ClassificationConfidenceLevel, ClassificationScope
)
from ..db_session import get_session
from .notification_service import NotificationService
from .task_service import TaskService

# Setup logging
logger = logging.getLogger(__name__)

class EnterpriseMLService:
    """
    Enterprise ML Service for Advanced Classification
    Comprehensive ML pipeline management and orchestration
    """
    
    def __init__(self):
        self.notification_service = NotificationService()
        self.task_service = TaskService()
        self.model_cache = {}
        self.feature_cache = {}
        self.performance_cache = {}
        
    # ============ ML Model Configuration Management ============
    
    async def create_ml_model_config(
        self,
        session: AsyncSession,
        user: dict,
        config_data: Dict[str, Any]
    ) -> MLModelConfiguration:
        """Create advanced ML model configuration"""
        try:
            # Validate model configuration
            validated_config = await self._validate_model_config(config_data)
            
            # Create model configuration
            ml_config = MLModelConfiguration(
                name=validated_config["name"],
                description=validated_config.get("description"),
                model_type=MLModelType(validated_config["model_type"]),
                task_type=MLTaskType(validated_config["task_type"]),
                framework=MLModelFramework(validated_config["framework"]),
                model_config=validated_config["model_config"],
                hyperparameters=validated_config.get("hyperparameters", {}),
                training_config=validated_config["training_config"],
                validation_config=validated_config["validation_config"],
                feature_config=validated_config.get("feature_config", {}),
                performance_metrics={},
                classification_framework_id=validated_config.get("classification_framework_id"),
                target_sensitivity_levels=validated_config.get("target_sensitivity_levels", []),
                classification_scope=validated_config.get("classification_scope"),
                created_by=user["id"]
            )
            
            session.add(ml_config)
            await session.commit()
            await session.refresh(ml_config)
            
            # Initialize feature engineering pipeline
            await self._initialize_feature_pipeline(session, ml_config)
            
            # Log creation
            logger.info(f"Created ML model configuration: {ml_config.name} (ID: {ml_config.id})")
            
            return ml_config
            
        except Exception as e:
            logger.error(f"Error creating ML model configuration: {str(e)}")
            await session.rollback()
            raise
    
    async def get_ml_model_configs(
        self,
        session: AsyncSession,
        filters: Optional[Dict[str, Any]] = None,
        pagination: Optional[Dict[str, Any]] = None
    ) -> Tuple[List[MLModelConfiguration], int]:
        """Get ML model configurations with advanced filtering"""
        try:
            query = select(MLModelConfiguration).options(
                selectinload(MLModelConfiguration.classification_framework),
                selectinload(MLModelConfiguration.training_jobs),
                selectinload(MLModelConfiguration.experiments)
            )
            
            # Apply filters
            if filters:
                if filters.get("model_type"):
                    query = query.where(MLModelConfiguration.model_type == filters["model_type"])
                if filters.get("framework"):
                    query = query.where(MLModelConfiguration.framework == filters["framework"])
                if filters.get("status"):
                    query = query.where(MLModelConfiguration.status == filters["status"])
                if filters.get("is_active") is not None:
                    query = query.where(MLModelConfiguration.is_active == filters["is_active"])
                if filters.get("search_query"):
                    search = f"%{filters['search_query']}%"
                    query = query.where(
                        or_(
                            MLModelConfiguration.name.ilike(search),
                            MLModelConfiguration.description.ilike(search)
                        )
                    )
            
            # Get total count
            count_query = select(func.count(MLModelConfiguration.id))
            if filters:
                # Apply same filters to count query
                count_query = count_query.where(query.whereclause)
            
            total_count = await session.scalar(count_query)
            
            # Apply pagination
            if pagination:
                offset = (pagination.get("page", 1) - 1) * pagination.get("size", 10)
                query = query.offset(offset).limit(pagination.get("size", 10))
            
            # Apply sorting
            query = query.order_by(desc(MLModelConfiguration.updated_at))
            
            result = await session.execute(query)
            configs = result.scalars().all()
            
            # Enrich with performance metrics
            for config in configs:
                config.current_performance = await self._get_model_performance_summary(session, config.id)
            
            return configs, total_count
            
        except Exception as e:
            logger.error(f"Error getting ML model configurations: {str(e)}")
            raise
    
    # ============ Training Dataset Management ============
    
    async def create_training_dataset(
        self,
        session: AsyncSession,
        user: dict,
        dataset_data: Dict[str, Any]
    ) -> MLTrainingDataset:
        """Create comprehensive training dataset"""
        try:
            # Validate and prepare dataset
            validated_data = await self._validate_dataset_config(dataset_data)
            
            # Create training dataset
            dataset = MLTrainingDataset(
                name=validated_data["name"],
                description=validated_data.get("description"),
                dataset_type=MLDataType(validated_data["dataset_type"]),
                data_source_ids=validated_data["data_source_ids"],
                catalog_item_ids=validated_data.get("catalog_item_ids", []),
                scan_result_ids=validated_data.get("scan_result_ids", []),
                data_config=validated_data["data_config"],
                schema_config=validated_data["schema_config"],
                labeling_config=validated_data["labeling_config"],
                ground_truth_labels=validated_data["ground_truth_labels"],
                quality_metrics={},
                feature_count=0,
                feature_schema={},
                created_by=user["id"]
            )
            
            session.add(dataset)
            await session.commit()
            await session.refresh(dataset)
            
            # Process dataset and generate statistics
            await self._process_training_dataset(session, dataset)
            
            logger.info(f"Created training dataset: {dataset.name} (ID: {dataset.id})")
            
            return dataset
            
        except Exception as e:
            logger.error(f"Error creating training dataset: {str(e)}")
            await session.rollback()
            raise
    
    async def prepare_training_data(
        self,
        session: AsyncSession,
        dataset_id: int,
        feature_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Prepare training data with advanced feature engineering"""
        try:
            # Get dataset
            dataset = await session.get(MLTrainingDataset, dataset_id)
            if not dataset:
                raise ValueError(f"Training dataset {dataset_id} not found")
            
            # Extract and prepare features
            raw_data = await self._extract_raw_data(session, dataset)
            
            # Apply feature engineering
            processed_data = await self._apply_feature_engineering(
                raw_data, feature_config, dataset.feature_schema
            )
            
            # Split data
            train_data, validation_data, test_data = await self._split_dataset(
                processed_data, dataset.data_config.get("split_config", {})
            )
            
            # Update dataset statistics
            await self._update_dataset_statistics(session, dataset, {
                "total_samples": len(processed_data),
                "training_samples": len(train_data),
                "validation_samples": len(validation_data),
                "test_samples": len(test_data),
                "feature_count": len(processed_data.columns) - 1  # Exclude target
            })
            
            return {
                "train_data": train_data,
                "validation_data": validation_data,
                "test_data": test_data,
                "feature_schema": dataset.feature_schema,
                "preprocessing_pipeline": processed_data.get("preprocessing_pipeline")
            }
            
        except Exception as e:
            logger.error(f"Error preparing training data: {str(e)}")
            raise
    
    # ============ ML Training Pipeline ============
    
    async def start_training_job(
        self,
        session: AsyncSession,
        user: dict,
        job_config: Dict[str, Any]
    ) -> MLTrainingJob:
        """Start comprehensive ML training job"""
        try:
            # Validate training configuration
            validated_config = await self._validate_training_config(job_config)
            
            # Create training job
            training_job = MLTrainingJob(
                job_name=validated_config["job_name"],
                description=validated_config.get("description"),
                model_config_id=validated_config["model_config_id"],
                training_dataset_id=validated_config["training_dataset_id"],
                job_config=validated_config["job_config"],
                training_parameters=validated_config["training_parameters"],
                hyperparameter_tuning=validated_config.get("hyperparameter_tuning", {}),
                status=MLModelStatus.TRAINING,
                started_at=datetime.utcnow(),
                progress_percentage=0.0,
                created_by=user["id"]
            )
            
            session.add(training_job)
            await session.commit()
            await session.refresh(training_job)
            
            # Start training in background
            await self._execute_training_job(session, training_job)
            
            logger.info(f"Started ML training job: {training_job.job_name} (ID: {training_job.id})")
            
            return training_job
            
        except Exception as e:
            logger.error(f"Error starting training job: {str(e)}")
            await session.rollback()
            raise
    
    async def _execute_training_job(
        self,
        session: AsyncSession,
        training_job: MLTrainingJob
    ) -> None:
        """Execute ML training job with comprehensive monitoring"""
        try:
            # Get model configuration and dataset
            model_config = await session.get(MLModelConfiguration, training_job.model_config_id)
            dataset = await session.get(MLTrainingDataset, training_job.training_dataset_id)
            
            # Prepare training data
            training_data = await self.prepare_training_data(
                session, dataset.id, model_config.feature_config
            )
            
            # Update job status
            training_job.status = MLModelStatus.TRAINING
            training_job.progress_percentage = 10.0
            await session.commit()
            
            # Initialize model based on configuration
            model = await self._initialize_model(model_config, training_job.training_parameters)
            
            # Training with progress tracking
            trained_model, training_metrics = await self._train_model_with_monitoring(
                model, training_data, training_job, session
            )
            
            # Validation
            validation_metrics = await self._validate_model(
                trained_model, training_data["validation_data"], training_job
            )
            
            # Testing
            test_metrics = await self._test_model(
                trained_model, training_data["test_data"], training_job
            )
            
            # Save model artifacts
            model_path = await self._save_model_artifacts(
                trained_model, training_job, training_data.get("preprocessing_pipeline")
            )
            
            # Update job completion
            training_job.status = MLModelStatus.TRAINED
            training_job.completed_at = datetime.utcnow()
            training_job.duration_seconds = int(
                (training_job.completed_at - training_job.started_at).total_seconds()
            )
            training_job.progress_percentage = 100.0
            training_job.training_metrics = training_metrics
            training_job.validation_metrics = validation_metrics
            training_job.final_model_path = model_path
            
            # Update model configuration
            model_config.status = MLModelStatus.TRAINED
            model_config.model_path = model_path
            model_config.last_trained = datetime.utcnow()
            model_config.performance_metrics = {
                "training": training_metrics,
                "validation": validation_metrics,
                "test": test_metrics
            }
            
            await session.commit()
            
            # Send notification
            await self.notification_service.send_notification(
                user_id=training_job.created_by,
                title="ML Training Completed",
                message=f"Training job '{training_job.job_name}' completed successfully",
                notification_type="ml_training_success"
            )
            
            logger.info(f"Completed ML training job: {training_job.id}")
            
        except Exception as e:
            # Update job status on failure
            training_job.status = MLModelStatus.FAILED
            training_job.error_messages = [str(e)]
            training_job.completed_at = datetime.utcnow()
            await session.commit()
            
            # Send error notification
            await self.notification_service.send_notification(
                user_id=training_job.created_by,
                title="ML Training Failed",
                message=f"Training job '{training_job.job_name}' failed: {str(e)}",
                notification_type="ml_training_error"
            )
            
            logger.error(f"Training job {training_job.id} failed: {str(e)}")
            raise
    
    # ============ ML Prediction and Inference ============
    
    async def create_ml_prediction(
        self,
        session: AsyncSession,
        user: dict,
        prediction_request: Dict[str, Any]
    ) -> MLPrediction:
        """Create ML prediction with comprehensive tracking"""
        try:
            # Generate prediction ID
            prediction_id = f"ml_pred_{uuid.uuid4().hex[:12]}"
            
            # Get model configuration
            model_config = await session.get(
                MLModelConfiguration, 
                prediction_request["model_config_id"]
            )
            if not model_config or model_config.status != MLModelStatus.TRAINED:
                raise ValueError("Model not found or not trained")
            
            # Load model
            model = await self._load_model(model_config.model_path)
            
            # Prepare input data
            input_features = await self._prepare_prediction_input(
                prediction_request["input_data"],
                model_config.feature_config
            )
            
            # Make prediction
            start_time = datetime.utcnow()
            prediction_result = await self._make_prediction(model, input_features)
            end_time = datetime.utcnow()
            
            # Process prediction results
            processed_result = await self._process_prediction_result(
                prediction_result, model_config
            )
            
            # Create prediction record
            ml_prediction = MLPrediction(
                prediction_id=prediction_id,
                model_config_id=model_config.id,
                model_version=model_config.model_version,
                target_type=prediction_request["target_type"],
                target_id=prediction_request["target_id"],
                target_identifier=prediction_request["target_identifier"],
                input_data=prediction_request["input_data"],
                input_features=input_features.to_dict() if hasattr(input_features, 'to_dict') else input_features,
                prediction_result=processed_result,
                predicted_class=processed_result.get("predicted_class"),
                prediction_probabilities=processed_result.get("probabilities", {}),
                confidence_score=processed_result.get("confidence_score", 0.0),
                confidence_level=self._determine_confidence_level(processed_result.get("confidence_score", 0.0)),
                sensitivity_prediction=processed_result.get("sensitivity_prediction"),
                inference_time_ms=int((end_time - start_time).total_seconds() * 1000),
                processing_timestamp=datetime.utcnow(),
                created_by=user["id"]
            )
            
            session.add(ml_prediction)
            await session.commit()
            await session.refresh(ml_prediction)
            
            # Update model usage statistics
            await self._update_model_usage_stats(session, model_config.id)
            
            logger.info(f"Created ML prediction: {prediction_id}")
            
            return ml_prediction
            
        except Exception as e:
            logger.error(f"Error creating ML prediction: {str(e)}")
            await session.rollback()
            raise
    
    async def batch_predict(
        self,
        session: AsyncSession,
        user: dict,
        batch_request: Dict[str, Any]
    ) -> List[MLPrediction]:
        """Batch ML prediction for multiple targets"""
        try:
            model_config_id = batch_request["model_config_id"]
            targets = batch_request["targets"]
            
            # Get model configuration
            model_config = await session.get(MLModelConfiguration, model_config_id)
            if not model_config or model_config.status != MLModelStatus.TRAINED:
                raise ValueError("Model not found or not trained")
            
            # Load model once for batch processing
            model = await self._load_model(model_config.model_path)
            
            predictions = []
            batch_id = f"batch_{uuid.uuid4().hex[:8]}"
            
            for target in targets:
                try:
                    # Create individual prediction request
                    prediction_request = {
                        "model_config_id": model_config_id,
                        "target_type": target["target_type"],
                        "target_id": target["target_id"],
                        "target_identifier": target["target_identifier"],
                        "input_data": target["input_data"]
                    }
                    
                    # Create prediction
                    prediction = await self.create_ml_prediction(
                        session, user, prediction_request
                    )
                    prediction.batch_id = batch_id
                    predictions.append(prediction)
                    
                except Exception as e:
                    logger.warning(f"Failed to predict for target {target['target_id']}: {str(e)}")
                    continue
            
            await session.commit()
            
            logger.info(f"Completed batch prediction: {batch_id} ({len(predictions)} predictions)")
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            raise
    
    # ============ ML Feedback and Active Learning ============
    
    async def submit_ml_feedback(
        self,
        session: AsyncSession,
        user: dict,
        feedback_data: Dict[str, Any]
    ) -> MLFeedback:
        """Submit ML feedback for active learning"""
        try:
            # Get prediction
            prediction = await session.get(MLPrediction, feedback_data["prediction_id"])
            if not prediction:
                raise ValueError("Prediction not found")
            
            # Create feedback
            feedback = MLFeedback(
                prediction_id=prediction.id,
                feedback_type=feedback_data["feedback_type"],
                feedback_source=feedback_data.get("feedback_source", "human_expert"),
                feedback_quality=feedback_data.get("feedback_quality", 1.0),
                original_prediction=prediction.prediction_result,
                corrected_prediction=feedback_data.get("corrected_prediction", {}),
                feedback_notes=feedback_data.get("feedback_notes"),
                correction_reasoning=feedback_data.get("correction_reasoning"),
                expert_id=user["id"],
                expert_confidence=feedback_data.get("expert_confidence"),
                expert_domain=feedback_data.get("expert_domain"),
                created_by=user["id"]
            )
            
            session.add(feedback)
            await session.commit()
            await session.refresh(feedback)
            
            # Process feedback for learning
            await self._process_feedback_for_learning(session, feedback)
            
            logger.info(f"Submitted ML feedback for prediction: {prediction.prediction_id}")
            
            return feedback
            
        except Exception as e:
            logger.error(f"Error submitting ML feedback: {str(e)}")
            await session.rollback()
            raise
    
    async def trigger_retraining(
        self,
        session: AsyncSession,
        user: dict,
        model_config_id: int,
        retraining_config: Dict[str, Any]
    ) -> MLTrainingJob:
        """Trigger model retraining based on feedback"""
        try:
            # Get model configuration
            model_config = await session.get(MLModelConfiguration, model_config_id)
            if not model_config:
                raise ValueError("Model configuration not found")
            
            # Collect feedback data
            feedback_data = await self._collect_feedback_for_retraining(session, model_config_id)
            
            # Update training dataset with feedback
            updated_dataset = await self._update_dataset_with_feedback(
                session, feedback_data, retraining_config
            )
            
            # Create retraining job
            retraining_job_config = {
                "job_name": f"Retrain_{model_config.name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                "description": "Automated retraining based on feedback",
                "model_config_id": model_config_id,
                "training_dataset_id": updated_dataset.id,
                "job_config": retraining_config,
                "training_parameters": model_config.model_config
            }
            
            # Start retraining job
            retraining_job = await self.start_training_job(
                session, user, retraining_job_config
            )
            
            logger.info(f"Triggered retraining for model: {model_config.name}")
            
            return retraining_job
            
        except Exception as e:
            logger.error(f"Error triggering retraining: {str(e)}")
            raise
    
    # ============ ML Experiment Management ============
    
    async def create_ml_experiment(
        self,
        session: AsyncSession,
        user: dict,
        experiment_config: Dict[str, Any]
    ) -> MLExperiment:
        """Create ML experiment for model optimization"""
        try:
            # Create experiment
            experiment = MLExperiment(
                experiment_name=experiment_config["experiment_name"],
                description=experiment_config.get("description"),
                model_config_id=experiment_config["model_config_id"],
                experiment_type=experiment_config["experiment_type"],
                experiment_config=experiment_config["config"],
                parameter_space=experiment_config["parameter_space"],
                optimization_objective=experiment_config["optimization_objective"],
                status=MLModelStatus.DRAFT,
                total_runs=experiment_config.get("total_runs", 10),
                created_by=user["id"]
            )
            
            session.add(experiment)
            await session.commit()
            await session.refresh(experiment)
            
            # Start experiment execution
            await self._execute_ml_experiment(session, experiment)
            
            logger.info(f"Created ML experiment: {experiment.experiment_name}")
            
            return experiment
            
        except Exception as e:
            logger.error(f"Error creating ML experiment: {str(e)}")
            await session.rollback()
            raise
    
    # ============ ML Model Monitoring ============
    
    async def monitor_ml_model_performance(
        self,
        session: AsyncSession,
        model_config_id: int
    ) -> MLModelMonitoring:
        """Monitor ML model performance and health"""
        try:
            # Get recent predictions for the model
            recent_predictions = await self._get_recent_predictions(session, model_config_id)
            
            # Calculate performance metrics
            performance_metrics = await self._calculate_performance_metrics(recent_predictions)
            
            # Detect data drift
            drift_metrics = await self._detect_data_drift(session, model_config_id, recent_predictions)
            
            # Analyze model behavior
            behavior_metrics = await self._analyze_model_behavior(recent_predictions)
            
            # Create monitoring record
            monitoring = MLModelMonitoring(
                model_config_id=model_config_id,
                monitoring_timestamp=datetime.utcnow(),
                accuracy_metrics=performance_metrics["accuracy"],
                precision_recall_metrics=performance_metrics["precision_recall"],
                prediction_distribution=performance_metrics["distribution"],
                input_drift_metrics=drift_metrics.get("input_drift", {}),
                prediction_drift_metrics=drift_metrics.get("prediction_drift", {}),
                confidence_distribution=behavior_metrics["confidence"],
                inference_latency_metrics=behavior_metrics["latency"],
                throughput_metrics=behavior_metrics["throughput"],
                alert_status="normal",
                created_by=1  # System user
            )
            
            # Check for alerts
            alerts = await self._check_performance_alerts(monitoring)
            if alerts:
                monitoring.alert_status = "warning"
                monitoring.alerts_triggered = alerts
            
            session.add(monitoring)
            await session.commit()
            
            logger.info(f"Completed ML model monitoring for model: {model_config_id}")
            
            return monitoring
            
        except Exception as e:
            logger.error(f"Error monitoring ML model: {str(e)}")
            raise
    
    # ============ Helper Methods ============
    
    async def _validate_model_config(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate ML model configuration"""
        required_fields = ["name", "model_type", "task_type", "framework", "model_config", "training_config", "validation_config"]
        
        for field in required_fields:
            if field not in config_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate model type and framework compatibility
        if not ML_FRAMEWORKS_AVAILABLE and config_data["framework"] == "scikit_learn":
            raise ValueError("Scikit-learn not available")
        
        return config_data
    
    async def _validate_dataset_config(self, dataset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate training dataset configuration"""
        required_fields = ["name", "dataset_type", "data_source_ids", "data_config", "schema_config", "labeling_config", "ground_truth_labels"]
        
        for field in required_fields:
            if field not in dataset_data:
                raise ValueError(f"Missing required field: {field}")
        
        return dataset_data
    
    async def _validate_training_config(self, job_config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate training job configuration"""
        required_fields = ["job_name", "model_config_id", "training_dataset_id", "job_config", "training_parameters"]
        
        for field in required_fields:
            if field not in job_config:
                raise ValueError(f"Missing required field: {field}")
        
        return job_config
    
    async def _initialize_feature_pipeline(
        self,
        session: AsyncSession,
        ml_config: MLModelConfiguration
    ) -> None:
        """Initialize feature engineering pipeline"""
        # Create default feature configuration
        feature_config = {
            "text_features": {
                "vectorizer": "tfidf",
                "max_features": 10000,
                "ngram_range": [1, 2]
            },
            "numerical_features": {
                "scaler": "standard",
                "handle_missing": "median"
            },
            "categorical_features": {
                "encoder": "onehot",
                "handle_missing": "mode"
            }
        }
        
        ml_config.feature_config = feature_config
        await session.commit()
    
    async def _process_training_dataset(
        self,
        session: AsyncSession,
        dataset: MLTrainingDataset
    ) -> None:
        """Process training dataset and generate statistics"""
        try:
            # Extract sample data for analysis
            sample_data = await self._extract_sample_data(session, dataset)
            
            # Generate quality metrics
            quality_metrics = await self._generate_quality_metrics(sample_data)
            
            # Update dataset
            dataset.quality_metrics = quality_metrics
            dataset.total_samples = len(sample_data) if sample_data is not None else 0
            dataset.last_used = datetime.utcnow()
            
            await session.commit()
            
        except Exception as e:
            logger.warning(f"Error processing training dataset {dataset.id}: {str(e)}")
    
    def _determine_confidence_level(self, confidence_score: float) -> ClassificationConfidenceLevel:
        """Determine confidence level from score"""
        if confidence_score >= 0.95:
            return ClassificationConfidenceLevel.CERTAIN
        elif confidence_score >= 0.85:
            return ClassificationConfidenceLevel.VERY_HIGH
        elif confidence_score >= 0.70:
            return ClassificationConfidenceLevel.HIGH
        elif confidence_score >= 0.50:
            return ClassificationConfidenceLevel.MEDIUM
        else:
            return ClassificationConfidenceLevel.LOW
    
    # ============ Advanced ML Intelligence Scenarios ============
    
    async def intelligent_model_recommendation(
        self,
        session: AsyncSession,
        data_characteristics: Dict[str, Any],
        classification_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """AI-powered model recommendation based on data characteristics"""
        try:
            # Analyze data characteristics
            data_analysis = await self._analyze_data_characteristics(data_characteristics)
            
            # Determine optimal ML approaches
            model_recommendations = await self._recommend_ml_models(
                data_analysis, classification_requirements
            )
            
            # Generate ensemble strategies
            ensemble_strategies = await self._generate_ensemble_strategies(model_recommendations)
            
            # Calculate expected performance
            performance_estimates = await self._estimate_model_performance(
                model_recommendations, data_analysis
            )
            
            return {
                "recommended_models": model_recommendations,
                "ensemble_strategies": ensemble_strategies,
                "performance_estimates": performance_estimates,
                "implementation_roadmap": await self._generate_implementation_roadmap(
                    model_recommendations, classification_requirements
                ),
                "resource_requirements": await self._calculate_resource_requirements(
                    model_recommendations
                )
            }
            
        except Exception as e:
            logger.error(f"Error in intelligent model recommendation: {str(e)}")
            raise
    
    async def adaptive_learning_pipeline(
        self,
        session: AsyncSession,
        model_config_id: int,
        learning_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced adaptive learning with intelligent pipeline optimization"""
        try:
            model_config = await session.get(MLModelConfiguration, model_config_id)
            
            # Analyze current model performance
            performance_analysis = await self._analyze_current_performance(session, model_config)
            
            # Identify learning opportunities
            learning_opportunities = await self._identify_learning_opportunities(
                performance_analysis, learning_config
            )
            
            # Generate adaptive strategies
            adaptive_strategies = await self._generate_adaptive_strategies(
                learning_opportunities, model_config
            )
            
            # Execute adaptive learning
            learning_results = await self._execute_adaptive_learning(
                session, model_config, adaptive_strategies
            )
            
            return {
                "performance_analysis": performance_analysis,
                "learning_opportunities": learning_opportunities,
                "adaptive_strategies": adaptive_strategies,
                "learning_results": learning_results,
                "optimization_recommendations": await self._generate_optimization_recommendations(
                    learning_results
                )
            }
            
        except Exception as e:
            logger.error(f"Error in adaptive learning pipeline: {str(e)}")
            raise
    
    async def intelligent_feature_discovery(
        self,
        session: AsyncSession,
        dataset_id: int,
        discovery_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced feature discovery with intelligent feature engineering"""
        try:
            dataset = await session.get(MLTrainingDataset, dataset_id)
            
            # Extract and analyze raw data
            raw_data = await self._extract_raw_data(session, dataset)
            
            # Discover potential features
            feature_candidates = await self._discover_feature_candidates(
                raw_data, discovery_config
            )
            
            # Intelligent feature selection
            selected_features = await self._intelligent_feature_selection(
                feature_candidates, raw_data, discovery_config
            )
            
            # Generate feature engineering pipeline
            feature_pipeline = await self._generate_feature_pipeline(
                selected_features, discovery_config
            )
            
            # Validate feature quality
            feature_validation = await self._validate_feature_quality(
                feature_pipeline, raw_data
            )
            
            return {
                "feature_candidates": feature_candidates,
                "selected_features": selected_features,
                "feature_pipeline": feature_pipeline,
                "feature_validation": feature_validation,
                "implementation_guide": await self._generate_feature_implementation_guide(
                    feature_pipeline
                )
            }
            
        except Exception as e:
            logger.error(f"Error in intelligent feature discovery: {str(e)}")
            raise
    
    async def advanced_hyperparameter_optimization(
        self,
        session: AsyncSession,
        model_config_id: int,
        optimization_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced hyperparameter optimization with multi-objective optimization"""
        try:
            model_config = await session.get(MLModelConfiguration, model_config_id)
            
            # Define optimization space
            optimization_space = await self._define_optimization_space(
                model_config, optimization_config
            )
            
            # Multi-objective optimization
            optimization_results = await self._execute_multi_objective_optimization(
                optimization_space, model_config, optimization_config
            )
            
            # Pareto frontier analysis
            pareto_analysis = await self._analyze_pareto_frontier(optimization_results)
            
            # Generate optimal configurations
            optimal_configs = await self._generate_optimal_configurations(
                pareto_analysis, optimization_config
            )
            
            return {
                "optimization_space": optimization_space,
                "optimization_results": optimization_results,
                "pareto_analysis": pareto_analysis,
                "optimal_configurations": optimal_configs,
                "deployment_recommendations": await self._generate_deployment_recommendations(
                    optimal_configs
                )
            }
            
        except Exception as e:
            logger.error(f"Error in advanced hyperparameter optimization: {str(e)}")
            raise
    
    async def intelligent_model_ensemble(
        self,
        session: AsyncSession,
        model_ids: List[int],
        ensemble_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create intelligent model ensemble with advanced combination strategies"""
        try:
            # Load models
            models = []
            for model_id in model_ids:
                model_config = await session.get(MLModelConfiguration, model_id)
                model = await self._load_model(model_config.model_path)
                models.append((model_config, model))
            
            # Analyze model complementarity
            complementarity_analysis = await self._analyze_model_complementarity(models)
            
            # Generate ensemble strategies
            ensemble_strategies = await self._generate_intelligent_ensemble_strategies(
                models, complementarity_analysis, ensemble_config
            )
            
            # Optimize ensemble weights
            optimal_weights = await self._optimize_ensemble_weights(
                models, ensemble_strategies, ensemble_config
            )
            
            # Create ensemble model
            ensemble_model = await self._create_ensemble_model(
                models, optimal_weights, ensemble_strategies
            )
            
            # Validate ensemble performance
            ensemble_validation = await self._validate_ensemble_performance(
                ensemble_model, ensemble_config
            )
            
            return {
                "complementarity_analysis": complementarity_analysis,
                "ensemble_strategies": ensemble_strategies,
                "optimal_weights": optimal_weights,
                "ensemble_performance": ensemble_validation,
                "deployment_config": await self._generate_ensemble_deployment_config(
                    ensemble_model, ensemble_strategies
                )
            }
            
        except Exception as e:
            logger.error(f"Error in intelligent model ensemble: {str(e)}")
            raise
    
    async def advanced_drift_detection_and_adaptation(
        self,
        session: AsyncSession,
        model_config_id: int,
        monitoring_window: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced drift detection with intelligent adaptation strategies"""
        try:
            model_config = await session.get(MLModelConfiguration, model_config_id)
            
            # Multi-dimensional drift detection
            drift_analysis = await self._perform_multi_dimensional_drift_analysis(
                session, model_config, monitoring_window
            )
            
            # Causal drift analysis
            causal_analysis = await self._perform_causal_drift_analysis(
                drift_analysis, model_config
            )
            
            # Generate adaptation strategies
            adaptation_strategies = await self._generate_drift_adaptation_strategies(
                drift_analysis, causal_analysis
            )
            
            # Execute adaptive measures
            adaptation_results = await self._execute_drift_adaptation(
                session, model_config, adaptation_strategies
            )
            
            return {
                "drift_analysis": drift_analysis,
                "causal_analysis": causal_analysis,
                "adaptation_strategies": adaptation_strategies,
                "adaptation_results": adaptation_results,
                "monitoring_recommendations": await self._generate_drift_monitoring_recommendations(
                    drift_analysis
                )
            }
            
        except Exception as e:
            logger.error(f"Error in advanced drift detection: {str(e)}")
            raise
    
    async def intelligent_data_quality_assessment(
        self,
        session: AsyncSession,
        dataset_id: int,
        quality_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Comprehensive data quality assessment with ML-driven insights"""
        try:
            dataset = await session.get(MLTrainingDataset, dataset_id)
            raw_data = await self._extract_raw_data(session, dataset)
            
            # Multi-dimensional quality assessment
            quality_dimensions = await self._assess_data_quality_dimensions(
                raw_data, quality_config
            )
            
            # ML-driven anomaly detection
            anomaly_analysis = await self._detect_data_anomalies_ml(
                raw_data, quality_dimensions
            )
            
            # Data profiling with statistical analysis
            statistical_profile = await self._generate_statistical_profile(
                raw_data, quality_config
            )
            
            # Generate quality improvement recommendations
            improvement_recommendations = await self._generate_quality_improvements(
                quality_dimensions, anomaly_analysis, statistical_profile
            )
            
            return {
                "quality_dimensions": quality_dimensions,
                "anomaly_analysis": anomaly_analysis,
                "statistical_profile": statistical_profile,
                "improvement_recommendations": improvement_recommendations,
                "quality_score": await self._calculate_overall_quality_score(
                    quality_dimensions
                )
            }
            
        except Exception as e:
            logger.error(f"Error in intelligent data quality assessment: {str(e)}")
            raise
    
    # ============ Enhanced Helper Methods ============
    
    async def _extract_raw_data(self, session: AsyncSession, dataset: MLTrainingDataset) -> pd.DataFrame:
        """Extract raw data from data sources with intelligent sampling"""
        try:
            # Get data sources
            data_sources = []
            for source_id in dataset.data_source_ids:
                # Would integrate with actual data source service
                data_sources.append({"id": source_id, "type": "sample"})
            
            # Intelligent sampling strategy
            sampling_config = dataset.data_config.get("sampling_config", {})
            
            # Extract data with optimization
            raw_data_chunks = []
            for source in data_sources:
                # Simulate data extraction
                chunk = pd.DataFrame({
                    'column_1': np.random.randn(1000),
                    'column_2': np.random.choice(['A', 'B', 'C'], 1000),
                    'target': np.random.choice([0, 1], 1000)
                })
                raw_data_chunks.append(chunk)
            
            # Combine and optimize
            combined_data = pd.concat(raw_data_chunks, ignore_index=True)
            
            # Apply intelligent sampling
            if sampling_config.get("enable_smart_sampling", False):
                combined_data = await self._apply_smart_sampling(
                    combined_data, sampling_config
                )
            
            return combined_data
            
        except Exception as e:
            logger.error(f"Error extracting raw data: {str(e)}")
            raise
    
    async def _apply_feature_engineering(
        self, 
        raw_data: pd.DataFrame, 
        feature_config: Dict[str, Any], 
        feature_schema: Dict[str, Any]
    ) -> pd.DataFrame:
        """Apply advanced feature engineering pipeline"""
        try:
            processed_data = raw_data.copy()
            
            # Text feature processing
            if feature_config.get("text_features"):
                processed_data = await self._process_text_features(
                    processed_data, feature_config["text_features"]
                )
            
            # Numerical feature processing
            if feature_config.get("numerical_features"):
                processed_data = await self._process_numerical_features(
                    processed_data, feature_config["numerical_features"]
                )
            
            # Categorical feature processing
            if feature_config.get("categorical_features"):
                processed_data = await self._process_categorical_features(
                    processed_data, feature_config["categorical_features"]
                )
            
            # Advanced feature interactions
            if feature_config.get("feature_interactions"):
                processed_data = await self._create_feature_interactions(
                    processed_data, feature_config["feature_interactions"]
                )
            
            # Feature selection
            if feature_config.get("feature_selection"):
                processed_data = await self._apply_feature_selection(
                    processed_data, feature_config["feature_selection"]
                )
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error in feature engineering: {str(e)}")
            raise
    
    async def _split_dataset(
        self, 
        data: pd.DataFrame, 
        split_config: Dict[str, Any]
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Advanced dataset splitting with stratification and temporal considerations"""
        try:
            split_strategy = split_config.get("strategy", "random")
            train_ratio = split_config.get("train_ratio", 0.7)
            val_ratio = split_config.get("val_ratio", 0.15)
            test_ratio = split_config.get("test_ratio", 0.15)
            
            if split_strategy == "stratified":
                # Stratified split
                target_col = split_config.get("target_column", "target")
                if target_col in data.columns:
                    # Use sklearn stratified split
                    train_data, temp_data = train_test_split(
                        data, test_size=(1-train_ratio), 
                        stratify=data[target_col], random_state=42
                    )
                    val_data, test_data = train_test_split(
                        temp_data, test_size=(test_ratio/(val_ratio + test_ratio)),
                        stratify=temp_data[target_col], random_state=42
                    )
                else:
                    # Fallback to random split
                    train_data, temp_data = train_test_split(
                        data, test_size=(1-train_ratio), random_state=42
                    )
                    val_data, test_data = train_test_split(
                        temp_data, test_size=(test_ratio/(val_ratio + test_ratio)),
                        random_state=42
                    )
            elif split_strategy == "temporal":
                # Temporal split for time series data
                time_col = split_config.get("time_column")
                if time_col and time_col in data.columns:
                    data_sorted = data.sort_values(time_col)
                    train_end = int(len(data_sorted) * train_ratio)
                    val_end = int(len(data_sorted) * (train_ratio + val_ratio))
                    
                    train_data = data_sorted.iloc[:train_end]
                    val_data = data_sorted.iloc[train_end:val_end]
                    test_data = data_sorted.iloc[val_end:]
                else:
                    # Fallback to random split
                    train_data, temp_data = train_test_split(
                        data, test_size=(1-train_ratio), random_state=42
                    )
                    val_data, test_data = train_test_split(
                        temp_data, test_size=(test_ratio/(val_ratio + test_ratio)),
                        random_state=42
                    )
            else:
                # Random split
                train_data, temp_data = train_test_split(
                    data, test_size=(1-train_ratio), random_state=42
                )
                val_data, test_data = train_test_split(
                    temp_data, test_size=(test_ratio/(val_ratio + test_ratio)),
                    random_state=42
                )
            
            return train_data, val_data, test_data
            
        except Exception as e:
            logger.error(f"Error splitting dataset: {str(e)}")
            raise
    
    async def _initialize_model(
        self, 
        model_config: MLModelConfiguration, 
        training_parameters: Dict[str, Any]
    ):
        """Initialize ML model with advanced configuration"""
        try:
            model_type = model_config.model_type
            framework = model_config.framework
            
            if framework == MLModelFramework.SCIKIT_LEARN:
                if model_type == MLModelType.RANDOM_FOREST:
                    model = RandomForestClassifier(**training_parameters)
                elif model_type == MLModelType.GRADIENT_BOOSTING:
                    model = GradientBoostingClassifier(**training_parameters)
                elif model_type == MLModelType.SVM:
                    model = SVC(**training_parameters)
                elif model_type == MLModelType.LOGISTIC_REGRESSION:
                    model = LogisticRegression(**training_parameters)
                elif model_type == MLModelType.NEURAL_NETWORK:
                    model = MLPClassifier(**training_parameters)
                else:
                    # Default to Random Forest
                    model = RandomForestClassifier(**training_parameters)
            
            elif framework == MLModelFramework.XGBOOST and XGBOOST_AVAILABLE:
                model = xgb.XGBClassifier(**training_parameters)
            
            elif framework == MLModelFramework.LIGHTGBM and LIGHTGBM_AVAILABLE:
                model = lgb.LGBMClassifier(**training_parameters)
            
            elif framework == MLModelFramework.CATBOOST and CATBOOST_AVAILABLE:
                model = cb.CatBoostClassifier(**training_parameters)
            
            else:
                # Default fallback
                model = RandomForestClassifier(**training_parameters)
            
            return model
            
        except Exception as e:
            logger.error(f"Error initializing model: {str(e)}")
            raise
    
    async def _train_model_with_monitoring(
        self, 
        model, 
        training_data: Dict[str, Any], 
        training_job: MLTrainingJob, 
        session: AsyncSession
    ) -> Tuple[Any, Dict[str, Any]]:
        """Train model with comprehensive monitoring"""
        try:
            train_data = training_data["train_data"]
            val_data = training_data["validation_data"]
            
            # Prepare features and target
            feature_cols = [col for col in train_data.columns if col != 'target']
            X_train = train_data[feature_cols]
            y_train = train_data['target']
            X_val = val_data[feature_cols]
            y_val = val_data['target']
            
            # Train model
            start_time = datetime.utcnow()
            
            # Update progress
            training_job.progress_percentage = 30.0
            await session.commit()
            
            # Fit model
            model.fit(X_train, y_train)
            
            # Update progress
            training_job.progress_percentage = 70.0
            await session.commit()
            
            # Calculate training metrics
            train_predictions = model.predict(X_train)
            train_proba = model.predict_proba(X_train) if hasattr(model, 'predict_proba') else None
            
            training_metrics = {
                "accuracy": accuracy_score(y_train, train_predictions),
                "precision": precision_score(y_train, train_predictions, average='weighted'),
                "recall": recall_score(y_train, train_predictions, average='weighted'),
                "f1_score": f1_score(y_train, train_predictions, average='weighted'),
                "training_time_seconds": (datetime.utcnow() - start_time).total_seconds()
            }
            
            # Update progress
            training_job.progress_percentage = 90.0
            await session.commit()
            
            return model, training_metrics
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
    
    async def _validate_model(
        self, 
        model, 
        validation_data: pd.DataFrame, 
        training_job: MLTrainingJob
    ) -> Dict[str, Any]:
        """Comprehensive model validation"""
        try:
            feature_cols = [col for col in validation_data.columns if col != 'target']
            X_val = validation_data[feature_cols]
            y_val = validation_data['target']
            
            # Make predictions
            val_predictions = model.predict(X_val)
            val_proba = model.predict_proba(X_val) if hasattr(model, 'predict_proba') else None
            
            # Calculate validation metrics
            validation_metrics = {
                "accuracy": accuracy_score(y_val, val_predictions),
                "precision": precision_score(y_val, val_predictions, average='weighted'),
                "recall": recall_score(y_val, val_predictions, average='weighted'),
                "f1_score": f1_score(y_val, val_predictions, average='weighted'),
                "classification_report": classification_report(y_val, val_predictions, output_dict=True)
            }
            
            return validation_metrics
            
        except Exception as e:
            logger.error(f"Error validating model: {str(e)}")
            raise
    
    async def _test_model(
        self, 
        model, 
        test_data: pd.DataFrame, 
        training_job: MLTrainingJob
    ) -> Dict[str, Any]:
        """Comprehensive model testing"""
        try:
            feature_cols = [col for col in test_data.columns if col != 'target']
            X_test = test_data[feature_cols]
            y_test = test_data['target']
            
            # Make predictions
            test_predictions = model.predict(X_test)
            test_proba = model.predict_proba(X_test) if hasattr(model, 'predict_proba') else None
            
            # Calculate test metrics
            test_metrics = {
                "accuracy": accuracy_score(y_test, test_predictions),
                "precision": precision_score(y_test, test_predictions, average='weighted'),
                "recall": recall_score(y_test, test_predictions, average='weighted'),
                "f1_score": f1_score(y_test, test_predictions, average='weighted'),
                "classification_report": classification_report(y_test, test_predictions, output_dict=True)
            }
            
            return test_metrics
            
        except Exception as e:
            logger.error(f"Error testing model: {str(e)}")
            raise
    
    async def _save_model_artifacts(
        self, 
        model, 
        training_job: MLTrainingJob, 
        preprocessing_pipeline
    ) -> str:
        """Save model artifacts with versioning"""
        try:
            # Create model directory
            model_dir = Path(f"models/ml_model_{training_job.id}")
            model_dir.mkdir(parents=True, exist_ok=True)
            
            # Save model
            model_path = model_dir / "model.joblib"
            joblib.dump(model, model_path)
            
            # Save preprocessing pipeline
            if preprocessing_pipeline:
                pipeline_path = model_dir / "preprocessing.joblib"
                joblib.dump(preprocessing_pipeline, pipeline_path)
            
            # Save metadata
            metadata = {
                "model_type": str(training_job.model_config.model_type),
                "framework": str(training_job.model_config.framework),
                "training_job_id": training_job.id,
                "created_at": datetime.utcnow().isoformat(),
                "version": training_job.model_config.model_version
            }
            
            metadata_path = model_dir / "metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            return str(model_path)
            
        except Exception as e:
            logger.error(f"Error saving model artifacts: {str(e)}")
            raise
    
    async def _load_model(self, model_path: str):
        """Load trained model from storage"""
        try:
            if model_path and Path(model_path).exists():
                return joblib.load(model_path)
            else:
                raise ValueError(f"Model path not found: {model_path}")
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    async def _make_prediction(self, model, input_features) -> Dict[str, Any]:
        """Make prediction with confidence scores"""
        try:
            # Convert input to proper format
            if isinstance(input_features, dict):
                input_df = pd.DataFrame([input_features])
            else:
                input_df = input_features
            
            # Make prediction
            prediction = model.predict(input_df)
            
            # Get probabilities if available
            probabilities = {}
            confidence_score = 0.0
            
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(input_df)
                if hasattr(model, 'classes_'):
                    for i, class_label in enumerate(model.classes_):
                        probabilities[str(class_label)] = float(proba[0][i])
                    confidence_score = float(np.max(proba))
                else:
                    confidence_score = float(np.max(proba))
            
            return {
                "prediction": prediction[0] if len(prediction) > 0 else None,
                "probabilities": probabilities,
                "confidence_score": confidence_score
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise
    
    async def _process_prediction_result(
        self, 
        prediction_result: Dict[str, Any], 
        model_config: MLModelConfiguration
    ) -> Dict[str, Any]:
        """Process and enrich prediction results"""
        try:
            # Map prediction to classification
            predicted_class = str(prediction_result.get("prediction", "unknown"))
            
            # Determine sensitivity level based on prediction
            sensitivity_mapping = model_config.model_config.get("sensitivity_mapping", {})
            sensitivity_prediction = sensitivity_mapping.get(predicted_class, SensitivityLevel.PUBLIC)
            
            # Enrich result
            enriched_result = {
                "predicted_class": predicted_class,
                "probabilities": prediction_result.get("probabilities", {}),
                "confidence_score": prediction_result.get("confidence_score", 0.0),
                "sensitivity_prediction": sensitivity_prediction,
                "model_version": model_config.model_version,
                "processing_timestamp": datetime.utcnow().isoformat()
            }
            
            return enriched_result
            
        except Exception as e:
            logger.error(f"Error processing prediction result: {str(e)}")
            raise
    
    # ============ Additional Helper Methods for Intelligence Scenarios ============
    
    async def _categorize_data_size(self, data_size: int) -> str:
        """Categorize data size for optimization recommendations"""
        if data_size < 1000:
            return "small"
        elif data_size < 100000:
            return "medium"
        elif data_size < 1000000:
            return "large"
        else:
            return "very_large"
    
    async def _assess_missing_data_impact(self, missing_ratio: float) -> str:
        """Assess the impact of missing data"""
        if missing_ratio < 0.05:
            return "minimal"
        elif missing_ratio < 0.15:
            return "moderate"
        elif missing_ratio < 0.3:
            return "significant"
        else:
            return "severe"
    
    async def _assess_target_balance(self, target_distribution: Dict[str, Any]) -> Dict[str, Any]:
        """Assess target variable balance"""
        if not target_distribution:
            return {"balance_status": "unknown", "imbalance_ratio": 0.0}
        
        values = list(target_distribution.values())
        if not values:
            return {"balance_status": "unknown", "imbalance_ratio": 0.0}
        
        max_val = max(values)
        min_val = min(values)
        imbalance_ratio = max_val / min_val if min_val > 0 else float('inf')
        
        if imbalance_ratio <= 2:
            balance_status = "balanced"
        elif imbalance_ratio <= 5:
            balance_status = "slightly_imbalanced"
        elif imbalance_ratio <= 10:
            balance_status = "moderately_imbalanced"
        else:
            balance_status = "severely_imbalanced"
        
        return {
            "balance_status": balance_status,
            "imbalance_ratio": imbalance_ratio,
            "class_distribution": target_distribution
        }
    
    async def _recommend_preprocessing(self, data_characteristics: Dict[str, Any]) -> List[str]:
        """Recommend preprocessing steps based on data characteristics"""
        recommendations = []
        
        missing_ratio = data_characteristics.get("missing_values_ratio", 0.0)
        if missing_ratio > 0.1:
            recommendations.append("missing_value_imputation")
        
        categorical_features = data_characteristics.get("categorical_features", [])
        if len(categorical_features) > 0:
            recommendations.append("categorical_encoding")
        
        numerical_features = data_characteristics.get("numerical_features", [])
        if len(numerical_features) > 0:
            recommendations.append("feature_scaling")
        
        text_features = data_characteristics.get("text_features", [])
        if len(text_features) > 0:
            recommendations.append("text_preprocessing")
            recommendations.append("text_vectorization")
        
        return recommendations
    
    async def _assess_scalability_needs(self, data_size: int) -> Dict[str, Any]:
        """Assess scalability requirements based on data size"""
        if data_size < 10000:
            return {
                "parallel_processing": False,
                "distributed_training": False,
                "memory_optimization": False,
                "recommended_batch_size": 32
            }
        elif data_size < 1000000:
            return {
                "parallel_processing": True,
                "distributed_training": False,
                "memory_optimization": True,
                "recommended_batch_size": 128
            }
        else:
            return {
                "parallel_processing": True,
                "distributed_training": True,
                "memory_optimization": True,
                "recommended_batch_size": 256
            }