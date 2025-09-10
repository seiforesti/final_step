from app.utils.serialization_utils import safe_serialize_model, safe_serialize_list
"""
Enterprise Scan Intelligence API Routes

Provides comprehensive API endpoints for:
- Scan intelligence engine management
- AI-powered predictions and recommendations
- Performance optimization
- Anomaly detection and pattern recognition
- Real-time monitoring and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Body
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from typing import List, Optional, Dict, Any, Union
import asyncio
import json
import logging
from datetime import datetime, timedelta
import uuid

from ...db_session import get_session
from ...api.security.rbac import get_current_user, require_permission
from ...core.response_models import SuccessResponse, ErrorResponse
from ...core.cache import cache_response
from ...utils.rate_limiter import rate_limit, get_rate_limiter
try:
    from ...utils import audit_logger as _audit
    audit_log = _audit.audit_log
except Exception:
    async def audit_log(**kwargs):
        pass
from ...services.scan_intelligence_service import ScanIntelligenceService
from ...models.scan_intelligence_models import (
    ScanIntelligenceEngine, ScanAIModel, ScanPrediction, ScanOptimizationRecord,
    ScanAnomalyDetection, ScanPatternRecognition, ScanPerformanceOptimization,
    ScanIntelligenceType, AIModelType, OptimizationStrategy, IntelligenceScope,
    LearningMode, ModelStatus, AnomalyType, PatternType, PerformanceMetric
)
from ...models.api import (
    IntelligenceEngineRequest, IntelligenceEngineResponse, 
    PredictionRequest, PredictionResponse,
    OptimizationRequest, OptimizationResponse,
    AnomalyDetectionRequest, AnomalyDetectionResponse,
    PatternRecognitionRequest, PatternRecognitionResponse,
    PerformanceOptimizationRequest, PerformanceOptimizationResponse,
    IntelligenceAnalyticsRequest, IntelligenceAnalyticsResponse,
    ModelTrainingRequest, ModelTrainingResponse,
    IntelligenceMetricsResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/scan-intelligence", tags=["Scan Intelligence"])
rate_limiter = get_rate_limiter()

def get_intelligence_service() -> ScanIntelligenceService:
    """Dependency to get scan intelligence service instance"""
    return ScanIntelligenceService()

# Intelligence Engine Management Routes

@router.post("/engines")
@rate_limit(requests=50, window=60)
async def create_intelligence_engine(
    request: IntelligenceEngineRequest,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new scan intelligence engine.
    
    Features:
    - Multiple intelligence types (predictive, optimization, anomaly detection, pattern recognition)
    - Configurable AI models and strategies
    - Automatic model initialization and training
    - Performance baseline establishment
    """
    try:
        await audit_log(
            action="intelligence_engine_created",
            user_id=current_user.get("user_id"),
            resource_type="intelligence_engine",
            resource_id=None,
            metadata={"intelligence_type": request.intelligence_type, "engine_name": request.engine_name}
        )
        
        engine = await intelligence_service.create_intelligence_engine(
            engine_name=request.engine_name,
            intelligence_type=request.intelligence_type,
            configuration=request.configuration,
            optimization_strategy=request.optimization_strategy,
            intelligence_scope=request.intelligence_scope,
            learning_mode=request.learning_mode,
            created_by=current_user.get("user_id"),
            auto_train=request.auto_train
        )
        
        # Start background training if requested
        if request.auto_train:
            background_tasks.add_task(
                intelligence_service.train_engine_models,
                engine.engine_id
            )
        
        return SuccessResponse(
            message="Intelligence engine created successfully",
            data={
                "engine": IntelligenceEngineResponse.model_validate(engine, from_attributes=True),
                "training_status": "started" if request.auto_train else "manual",
                "estimated_training_time": "15-30 minutes" if request.auto_train else None
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create intelligence engine: {e}")
        raise HTTPException(status_code=500, detail=f"Engine creation failed: {str(e)}")

@router.get("/engines")
@rate_limit(requests=200, window=60)
@cache_response(ttl=300)
async def list_intelligence_engines(
    intelligence_type: Optional[ScanIntelligenceType] = Query(default=None, description="Filter by intelligence type"),
    status: Optional[str] = Query(default=None, description="Filter by engine status"),
    scope: Optional[IntelligenceScope] = Query(default=None, description="Filter by intelligence scope"),
    include_metrics: bool = Query(default=True, description="Include performance metrics"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List scan intelligence engines with filtering and pagination.
    
    Features:
    - Advanced filtering by type, status, and scope
    - Performance metrics inclusion
    - Pagination support
    - Real-time status updates
    """
    try:
        engines = await intelligence_service.list_intelligence_engines(
            intelligence_type=intelligence_type,
            status=status,
            scope=scope,
            include_metrics=include_metrics,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await intelligence_service.count_intelligence_engines(
            intelligence_type=intelligence_type,
            status=status,
            scope=scope
        )
        
        return SuccessResponse(
            message="Intelligence engines retrieved successfully",
            data={
                "engines": [IntelligenceEngineResponse.model_validate(engine, from_attributes=True) for engine in engines],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list intelligence engines: {e}")
        raise HTTPException(status_code=500, detail=f"Engine listing failed: {str(e)}")

@router.get("/engines/{engine_id}")
@rate_limit(requests=300, window=60)
@cache_response(ttl=120)
async def get_intelligence_engine(
    engine_id: str,
    include_models: bool = Query(default=True, description="Include AI models information"),
    include_history: bool = Query(default=False, description="Include optimization history"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get detailed information about a specific intelligence engine.
    
    Features:
    - Complete engine configuration and status
    - AI models and their performance metrics
    - Optimization history and trends
    - Real-time performance indicators
    """
    try:
        engine = await intelligence_service.get_intelligence_engine(
            engine_id=engine_id,
            include_models=include_models,
            include_history=include_history
        )
        
        if not engine:
            raise HTTPException(status_code=404, detail="Intelligence engine not found")
        
        return SuccessResponse(
            message="Intelligence engine retrieved successfully",
            data={"engine": IntelligenceEngineResponse.model_validate(engine, from_attributes=True)}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get intelligence engine {engine_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Engine retrieval failed: {str(e)}")

# Prediction and Forecasting Routes

@router.post("/predictions")
@rate_limit(requests=100, window=60)
async def generate_prediction(
    request: PredictionRequest,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Generate AI-powered predictions for scan operations.
    
    Features:
    - Multiple prediction types (performance, duration, resource usage, success probability)
    - Context-aware predictions based on historical data
    - Confidence intervals and uncertainty quantification
    - Real-time prediction updates
    """
    try:
        await audit_log(
            action="prediction_generated",
            user_id=current_user.get("user_id"),
            resource_type="prediction",
            resource_id=None,
            metadata={"prediction_type": request.prediction_type, "target_id": request.target_id}
        )
        
        prediction = await intelligence_service.generate_prediction(
            prediction_type=request.prediction_type,
            target_id=request.target_id,
            target_type=request.target_type,
            context_data=request.context_data,
            prediction_horizon=request.prediction_horizon,
            confidence_level=request.confidence_level,
            include_explanations=request.include_explanations,
            user_id=current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Prediction generated successfully",
            data={
                "prediction": PredictionResponse.model_validate(prediction, from_attributes=True),
                "confidence_score": prediction.confidence_score,
                "predicted_value": prediction.predicted_value,
                "prediction_interval": prediction.prediction_interval,
                "explanation": prediction.explanation if request.include_explanations else None
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to generate prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction generation failed: {str(e)}")

@router.get("/predictions/{prediction_id}")
@rate_limit(requests=200, window=60)
@cache_response(ttl=300)
async def get_prediction(
    prediction_id: str,
    include_explanations: bool = Query(default=True, description="Include model explanations"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Retrieve a specific prediction with detailed analysis.
    
    Features:
    - Complete prediction details and metadata
    - Model explanations and feature importance
    - Confidence intervals and uncertainty analysis
    - Historical comparison and trends
    """
    try:
        prediction = await intelligence_service.get_prediction(
            prediction_id=prediction_id,
            include_explanations=include_explanations
        )
        
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        return SuccessResponse(
            message="Prediction retrieved successfully",
            data={"prediction": PredictionResponse.model_validate(prediction, from_attributes=True)}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get prediction {prediction_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction retrieval failed: {str(e)}")

# Optimization Routes

@router.post("/optimizations")
@rate_limit(requests=50, window=60)
async def create_optimization(
    request: OptimizationRequest,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create and execute scan optimization using AI-powered strategies.
    
    Features:
    - Multiple optimization strategies (performance, resource, accuracy, cost)
    - Real-time optimization execution
    - Performance impact prediction
    - Rollback capabilities for failed optimizations
    """
    try:
        await audit_log(
            action="optimization_started",
            user_id=current_user.get("user_id"),
            resource_type="optimization",
            resource_id=None,
            metadata={"optimization_type": request.optimization_type, "target_id": request.target_id}
        )
        
        optimization = await intelligence_service.create_optimization(
            optimization_type=request.optimization_type,
            target_id=request.target_id,
            target_type=request.target_type,
            optimization_strategy=request.optimization_strategy,
            parameters=request.parameters,
            constraints=request.constraints,
            auto_apply=request.auto_apply,
            user_id=current_user.get("user_id")
        )
        
        # Execute optimization in background if auto_apply is True
        if request.auto_apply:
            background_tasks.add_task(
                intelligence_service.execute_optimization,
                optimization.optimization_id
            )
        
        return SuccessResponse(
            message="Optimization created successfully",
            data={
                "optimization": OptimizationResponse.model_validate(optimization, from_attributes=True),
                "execution_status": "started" if request.auto_apply else "pending",
                "estimated_completion": optimization.estimated_completion_time
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create optimization: {e}")
        raise HTTPException(status_code=500, detail=f"Optimization creation failed: {str(e)}")

@router.post("/optimizations/{optimization_id}/execute")
@rate_limit(requests=30, window=60)
async def execute_optimization(
    optimization_id: str,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Execute a pending optimization.
    
    Features:
    - Safe execution with rollback capabilities
    - Real-time progress monitoring
    - Performance impact tracking
    - Automatic validation of optimization results
    """
    try:
        await audit_log(
            action="optimization_executed",
            user_id=current_user.get("user_id"),
            resource_type="optimization",
            resource_id=optimization_id
        )
        
        result = await intelligence_service.execute_optimization(optimization_id)
        
        background_tasks.add_task(
            intelligence_service.monitor_optimization_impact,
            optimization_id
        )
        
        return SuccessResponse(
            message="Optimization execution started",
            data={
                "optimization_id": optimization_id,
                "execution_status": result.get("status"),
                "estimated_completion": result.get("estimated_completion"),
                "performance_impact": result.get("performance_impact")
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to execute optimization {optimization_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Optimization execution failed: {str(e)}")

# Anomaly Detection Routes

@router.post("/anomalies/detect")
@rate_limit(requests=100, window=60)
async def detect_anomalies(
    request: AnomalyDetectionRequest,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Detect anomalies in scan operations using AI-powered analysis.
    
    Features:
    - Multiple anomaly detection algorithms (statistical, ML-based, deep learning)
    - Real-time anomaly detection
    - Severity classification and impact assessment
    - Automated response suggestions
    """
    try:
        await audit_log(
            action="anomaly_detection_started",
            user_id=current_user.get("user_id"),
            resource_type="anomaly_detection",
            resource_id=None,
            metadata={"detection_type": request.detection_type, "scope": request.scope}
        )
        
        anomalies = await intelligence_service.detect_anomalies(
            detection_type=request.detection_type,
            scope=request.scope,
            target_id=request.target_id,
            time_range=request.time_range,
            sensitivity_level=request.sensitivity_level,
            algorithms=request.algorithms,
            include_explanations=request.include_explanations,
            user_id=current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Anomaly detection completed successfully",
            data={
                "anomalies": [AnomalyDetectionResponse.model_validate(anomaly, from_attributes=True) for anomaly in anomalies],
                "total_anomalies": len(anomalies),
                "severity_summary": await intelligence_service.get_anomaly_severity_summary(anomalies),
                "recommendations": await intelligence_service.get_anomaly_recommendations(anomalies)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to detect anomalies: {e}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.get("/anomalies")
@rate_limit(requests=200, window=60)
@cache_response(ttl=120)
async def list_anomalies(
    anomaly_type: Optional[AnomalyType] = Query(default=None, description="Filter by anomaly type"),
    severity: Optional[str] = Query(default=None, description="Filter by severity level"),
    status: Optional[str] = Query(default=None, description="Filter by resolution status"),
    time_range: Optional[str] = Query(default="24h", description="Time range (1h, 24h, 7d, 30d)"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=50, ge=1, le=200, description="Page size"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List detected anomalies with filtering and pagination.
    
    Features:
    - Advanced filtering by type, severity, and status
    - Time-based filtering
    - Trend analysis and patterns
    - Export capabilities for further analysis
    """
    try:
        anomalies = await intelligence_service.list_anomalies(
            anomaly_type=anomaly_type,
            severity=severity,
            status=status,
            time_range=time_range,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await intelligence_service.count_anomalies(
            anomaly_type=anomaly_type,
            severity=severity,
            status=status,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Anomalies retrieved successfully",
            data={
                "anomalies": [AnomalyDetectionResponse.model_validate(anomaly, from_attributes=True) for anomaly in anomalies],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                },
                "summary": await intelligence_service.get_anomaly_summary(
                    anomaly_type=anomaly_type,
                    severity=severity,
                    status=status,
                    time_range=time_range
                )
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list anomalies: {e}")
        raise HTTPException(status_code=500, detail=f"Anomaly listing failed: {str(e)}")

# Pattern Recognition Routes

@router.post("/patterns/recognize")
@rate_limit(requests=80, window=60)
async def recognize_patterns(
    request: PatternRecognitionRequest,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Recognize patterns in scan data using AI-powered analysis.
    
    Features:
    - Multiple pattern types (temporal, structural, behavioral, semantic)
    - Machine learning-based pattern detection
    - Pattern confidence scoring
    - Actionable insights and recommendations
    """
    try:
        await audit_log(
            action="pattern_recognition_started",
            user_id=current_user.get("user_id"),
            resource_type="pattern_recognition",
            resource_id=None,
            metadata={"pattern_types": request.pattern_types, "scope": request.scope}
        )
        
        patterns = await intelligence_service.recognize_patterns(
            pattern_types=request.pattern_types,
            scope=request.scope,
            target_id=request.target_id,
            data_sources=request.data_sources,
            time_range=request.time_range,
            confidence_threshold=request.confidence_threshold,
            include_insights=request.include_insights,
            user_id=current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Pattern recognition completed successfully",
            data={
                "patterns": [PatternRecognitionResponse.model_validate(pattern, from_attributes=True) for pattern in patterns],
                "total_patterns": len(patterns),
                "pattern_summary": await intelligence_service.get_pattern_summary(patterns),
                "insights": await intelligence_service.get_pattern_insights(patterns) if request.include_insights else None
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to recognize patterns: {e}")
        raise HTTPException(status_code=500, detail=f"Pattern recognition failed: {str(e)}")

@router.get("/patterns")
@rate_limit(requests=150, window=60)
@cache_response(ttl=300)
async def list_patterns(
    pattern_type: Optional[PatternType] = Query(default=None, description="Filter by pattern type"),
    confidence_min: Optional[float] = Query(default=0.7, ge=0.0, le=1.0, description="Minimum confidence threshold"),
    time_range: Optional[str] = Query(default="7d", description="Time range (1h, 24h, 7d, 30d)"),
    include_insights: bool = Query(default=True, description="Include pattern insights"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=30, ge=1, le=100, description="Page size"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List recognized patterns with filtering and analysis.
    
    Features:
    - Advanced filtering by type and confidence
    - Time-based pattern analysis
    - Pattern trend identification
    - Actionable insights and recommendations
    """
    try:
        patterns = await intelligence_service.list_patterns(
            pattern_type=pattern_type,
            confidence_min=confidence_min,
            time_range=time_range,
            include_insights=include_insights,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await intelligence_service.count_patterns(
            pattern_type=pattern_type,
            confidence_min=confidence_min,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Patterns retrieved successfully",
            data={
                "patterns": [PatternRecognitionResponse.model_validate(pattern, from_attributes=True) for pattern in patterns],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                },
                "analytics": await intelligence_service.get_pattern_analytics(
                    pattern_type=pattern_type,
                    time_range=time_range
                )
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list patterns: {e}")
        raise HTTPException(status_code=500, detail=f"Pattern listing failed: {str(e)}")

# Performance Optimization Routes

@router.post("/performance/optimize")
@rate_limit(requests=30, window=60)
async def optimize_performance(
    request: PerformanceOptimizationRequest,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Optimize scan performance using AI-powered strategies.
    
    Features:
    - Multiple optimization targets (speed, resource usage, accuracy, cost)
    - Real-time performance monitoring
    - Predictive optimization recommendations
    - A/B testing for optimization strategies
    """
    try:
        await audit_log(
            action="performance_optimization_started",
            user_id=current_user.get("user_id"),
            resource_type="performance_optimization",
            resource_id=None,
            metadata={"optimization_targets": request.optimization_targets, "scope": request.scope}
        )
        
        optimization = await intelligence_service.optimize_performance(
            optimization_targets=request.optimization_targets,
            scope=request.scope,
            target_id=request.target_id,
            performance_constraints=request.performance_constraints,
            optimization_strategy=request.optimization_strategy,
            auto_apply=request.auto_apply,
            user_id=current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Performance optimization started successfully",
            data={
                "optimization": PerformanceOptimizationResponse.model_validate(optimization, from_attributes=True),
                "baseline_metrics": optimization.baseline_metrics,
                "target_metrics": optimization.target_metrics,
                "estimated_improvement": optimization.estimated_improvement
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to optimize performance: {e}")
        raise HTTPException(status_code=500, detail=f"Performance optimization failed: {str(e)}")

@router.get("/performance/metrics")
@rate_limit(requests=200, window=60)
@cache_response(ttl=60)
async def get_performance_metrics(
    scope: Optional[str] = Query(default=None, description="Scope for metrics collection"),
    metric_types: Optional[List[PerformanceMetric]] = Query(default=None, description="Specific metrics to retrieve"),
    time_range: Optional[str] = Query(default="1h", description="Time range for metrics"),
    aggregation: Optional[str] = Query(default="avg", description="Aggregation method (avg, min, max, sum)"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get comprehensive performance metrics and analytics.
    
    Features:
    - Real-time performance monitoring
    - Historical trend analysis
    - Comparative performance analysis
    - Performance bottleneck identification
    """
    try:
        metrics = await intelligence_service.get_performance_metrics(
            scope=scope,
            metric_types=metric_types,
            time_range=time_range,
            aggregation=aggregation
        )
        
        return SuccessResponse(
            message="Performance metrics retrieved successfully",
            data={
                "metrics": metrics,
                "summary": await intelligence_service.get_performance_summary(metrics),
                "trends": await intelligence_service.get_performance_trends(
                    scope=scope,
                    time_range=time_range
                ),
                "recommendations": await intelligence_service.get_performance_recommendations(metrics)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get performance metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Performance metrics retrieval failed: {str(e)}")

# Analytics and Reporting Routes

@router.get("/analytics")
@rate_limit(requests=100, window=60)
@cache_response(ttl=600)
async def get_intelligence_analytics(
    scope: Optional[str] = Query(default="global", description="Analytics scope"),
    time_range: Optional[str] = Query(default="7d", description="Time range for analytics"),
    include_predictions: bool = Query(default=True, description="Include prediction analytics"),
    include_optimizations: bool = Query(default=True, description="Include optimization analytics"),
    include_anomalies: bool = Query(default=True, description="Include anomaly analytics"),
    include_patterns: bool = Query(default=True, description="Include pattern analytics"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get comprehensive intelligence analytics and insights.
    
    Features:
    - Cross-functional intelligence analytics
    - Trend identification and forecasting
    - ROI analysis for intelligence features
    - Comparative performance analysis
    """
    try:
        analytics = await intelligence_service.get_intelligence_analytics(
            scope=scope,
            time_range=time_range,
            include_predictions=include_predictions,
            include_optimizations=include_optimizations,
            include_anomalies=include_anomalies,
            include_patterns=include_patterns
        )
        
        return SuccessResponse(
            message="Intelligence analytics retrieved successfully",
            data=IntelligenceAnalyticsResponse(**analytics)
        )
        
    except Exception as e:
        logger.error(f"Failed to get intelligence analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Intelligence analytics retrieval failed: {str(e)}")

@router.get("/metrics/system")
@rate_limit(requests=300, window=60)
async def get_system_metrics(
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get real-time system metrics for intelligence operations.
    
    Features:
    - Real-time system performance
    - Resource utilization metrics
    - Operation throughput statistics
    - System health indicators
    """
    try:
        metrics = await intelligence_service.get_system_metrics()
        
        return SuccessResponse(
            message="System metrics retrieved successfully",
            data=IntelligenceMetricsResponse(**metrics)
        )
        
    except Exception as e:
        logger.error(f"Failed to get system metrics: {e}")
        raise HTTPException(status_code=500, detail=f"System metrics retrieval failed: {str(e)}")

# Streaming and Real-time Routes

@router.get("/stream/predictions/{target_id}")
async def stream_predictions(
    target_id: str,
    prediction_types: Optional[List[str]] = Query(default=None, description="Prediction types to stream"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time predictions for a target resource.
    
    Features:
    - Server-sent events for real-time updates
    - Multiple prediction types
    - Configurable update intervals
    - Connection health monitoring
    """
    async def prediction_stream():
        try:
            async for prediction_data in intelligence_service.stream_predictions(
                target_id=target_id,
                prediction_types=prediction_types,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(prediction_data)}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"Prediction stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        prediction_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@router.get("/stream/anomalies")
async def stream_anomalies(
    scope: Optional[str] = Query(default="global", description="Scope for anomaly monitoring"),
    severity_min: Optional[str] = Query(default="medium", description="Minimum severity to stream"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time anomaly detections.
    
    Features:
    - Live anomaly detection streaming
    - Severity-based filtering
    - Real-time alert notifications
    - Automated response triggers
    """
    async def anomaly_stream():
        try:
            async for anomaly_data in intelligence_service.stream_anomalies(
                scope=scope,
                severity_min=severity_min,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(anomaly_data)}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"Anomaly stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        anomaly_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

# Model Management Routes

@router.post("/models/train")
@rate_limit(requests=10, window=60)
async def train_models(
    request: ModelTrainingRequest,
    background_tasks: BackgroundTasks,
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Train or retrain AI models for intelligence engines.
    
    Features:
    - Automated model training and validation
    - A/B testing for model performance
    - Incremental learning capabilities
    - Model versioning and rollback
    """
    try:
        await audit_log(
            action="model_training_started",
            user_id=current_user.get("user_id"),
            resource_type="model_training",
            resource_id=None,
            metadata={"engine_id": request.engine_id, "model_types": request.model_types}
        )
        
        training_job = await intelligence_service.train_models(
            engine_id=request.engine_id,
            model_types=request.model_types,
            training_data=request.training_data,
            training_parameters=request.training_parameters,
            validation_split=request.validation_split,
            auto_deploy=request.auto_deploy,
            user_id=current_user.get("user_id")
        )
        
        background_tasks.add_task(
            intelligence_service.monitor_training_progress,
            training_job.job_id
        )
        
        return SuccessResponse(
            message="Model training started successfully",
            data=ModelTrainingResponse.model_validate(training_job, from_attributes=True)
        )
        
    except Exception as e:
        logger.error(f"Failed to start model training: {e}")
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/models/{model_id}/status")
@rate_limit(requests=200, window=60)
async def get_model_status(
    model_id: str,
    include_metrics: bool = Query(default=True, description="Include performance metrics"),
    intelligence_service: ScanIntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get detailed status and performance metrics for a specific AI model.
    
    Features:
    - Real-time model status and health
    - Performance metrics and accuracy scores
    - Training progress and history
    - Resource utilization statistics
    """
    try:
        model_status = await intelligence_service.get_model_status(
            model_id=model_id,
            include_metrics=include_metrics
        )
        
        if not model_status:
            raise HTTPException(status_code=404, detail="Model not found")
        
        return SuccessResponse(
            message="Model status retrieved successfully",
            data=model_status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get model status {model_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Model status retrieval failed: {str(e)}")