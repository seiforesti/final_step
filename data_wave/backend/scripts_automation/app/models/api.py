from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class QualityRuleRequest(BaseModel):
    rule_name: str
    rule_type: str
    quality_dimension: str
    description: Optional[str] = None
    rule_definition: Dict[str, Any] = {}
    parameters: Dict[str, Any] = {}
    thresholds: Dict[str, Any] = {}
    severity: str = "MEDIUM"
    weight: float = 1.0
    business_impact: Optional[str] = None
    owner: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: bool = True
    auto_validate: bool = True


class QualityRuleResponse(BaseModel):
    rule_id: str
    rule_name: str
    rule_type: str
    quality_dimension: str
    is_active: bool


class QualityAssessmentRequest(BaseModel):
    target_id: str
    target_type: str
    assessment_type: str = "comprehensive"
    rule_ids: Optional[List[str]] = None
    assessment_scope: Optional[Dict[str, Any]] = None
    parameters: Dict[str, Any] = {}
    auto_execute: bool = True


class QualityAssessmentResponse(BaseModel):
    assessment_id: str
    target_id: str
    status: str


class QualityScorecardRequest(BaseModel):
    scorecard_name: str
    target_id: str
    target_type: str
    scoring_method: str = "WEIGHTED_AVERAGE"
    quality_dimensions: Optional[List[str]] = None
    weights: Optional[Dict[str, float]] = None
    thresholds: Optional[Dict[str, Any]] = None
    auto_update: bool = True
    update_frequency: Optional[str] = None


class QualityScorecardResponse(BaseModel):
    scorecard_id: str
    overall_score: float
    trend: str


class QualityMonitoringRequest(BaseModel):
    monitor_name: str
    target_id: str
    target_type: str
    quality_rules: List[str]
    monitoring_frequency: str = "daily"
    alert_thresholds: Dict[str, Any] = {}
    notification_settings: Dict[str, Any] = {}
    auto_start: bool = True


class QualityMonitoringResponse(BaseModel):
    monitor_id: str
    status: str


class QualityReportType(str):
    pass


class QualityReportRequest(BaseModel):
    report_type: str
    scope: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    time_range: str = "30d"
    output_format: str = "json"
    include_recommendations: bool = True
    auto_generate: bool = True


class QualityReportResponse(BaseModel):
    report_id: str
    status: str


class QualityAnalyticsRequest(BaseModel):
    scope: str = "global"
    time_range: str = "7d"
    include_trends: bool = True
    include_benchmarks: bool = True
    include_predictions: bool = False


class QualityAnalyticsResponse(BaseModel):
    analytics_id: str
    status: str


class QualityMetricsResponse(BaseModel):
    metrics: Dict[str, Any]


__all__ = [
    "QualityRuleRequest", "QualityRuleResponse",
    "QualityAssessmentRequest", "QualityAssessmentResponse",
    "QualityScorecardRequest", "QualityScorecardResponse",
    "QualityMonitoringRequest", "QualityMonitoringResponse",
    "QualityReportType", "QualityReportRequest", "QualityReportResponse",
    "QualityAnalyticsRequest", "QualityAnalyticsResponse",
    "QualityMetricsResponse"
]

# ===================== SCAN INTELLIGENCE API MODELS =====================

class IntelligenceEngineRequest(BaseModel):
    engine_name: str
    intelligence_type: str
    configuration: Dict[str, Any] = {}
    optimization_strategy: str = "balanced"
    intelligence_scope: str = "system_wide"
    learning_mode: str = "supervised"


class IntelligenceEngineResponse(BaseModel):
    engine_id: str
    engine_name: str
    intelligence_type: str
    status: str
    version: str


class PredictionRequest(BaseModel):
    prediction_type: str
    target_scan_id: Optional[str] = None
    target_data_source_id: Optional[int] = None
    prediction_scope: str = "system_wide"
    input_features: Dict[str, Any] = {}


class PredictionResponse(BaseModel):
    prediction_id: str
    prediction_value: Any
    confidence_score: float


class OptimizationRequest(BaseModel):
    optimization_type: str
    target_scan_id: Optional[str] = None
    target_system: Optional[str] = None
    optimization_scope: str = "system_wide"
    optimization_strategy: str = "balanced"
    original_configuration: Dict[str, Any] = {}


class OptimizationResponse(BaseModel):
    optimization_id: str
    improvement_percentage: float
    status: str


class AnomalyDetectionRequest(BaseModel):
    target_scan_id: Optional[str] = None
    target_data_source_id: Optional[int] = None
    detection_window: str = "24h"
    detection_threshold: float = 0.8


class AnomalyDetectionResponse(BaseModel):
    anomaly_id: str
    anomaly_type: str
    anomaly_severity: str
    anomaly_score: float


class PatternRecognitionRequest(BaseModel):
    pattern_scope: str = "system_wide"
    min_strength: float = 0.5
    min_consistency: float = 0.5
    time_window: str = "7d"


class PatternRecognitionResponse(BaseModel):
    pattern_id: str
    pattern_type: str
    strength: float
    consistency: float


class PerformanceOptimizationRequest(BaseModel):
    target_scan_id: Optional[str] = None
    target_component: Optional[str] = None
    optimization_category: str = "general"
    constraints: Dict[str, Any] = {}


class PerformanceOptimizationResponse(BaseModel):
    optimization_id: str
    expected_improvements: Dict[str, float]
    status: str


class IntelligenceAnalyticsRequest(BaseModel):
    scope: str = "global"
    time_range: str = "7d"
    include_predictions: bool = True
    include_trends: bool = True


class IntelligenceAnalyticsResponse(BaseModel):
    analytics_id: str
    status: str
    insights: Dict[str, Any] = {}


class ModelTrainingRequest(BaseModel):
    model_id: Optional[str] = None
    algorithm: Optional[str] = None
    hyperparameters: Dict[str, Any] = {}
    training_config: Dict[str, Any] = {}


class ModelTrainingResponse(BaseModel):
    model_id: str
    status: str
    training_metrics: Dict[str, Any] = {}


class IntelligenceMetricsResponse(BaseModel):
    metrics: Dict[str, Any]


__all__ += [
    "IntelligenceEngineRequest", "IntelligenceEngineResponse",
    "PredictionRequest", "PredictionResponse",
    "OptimizationRequest", "OptimizationResponse",
    "AnomalyDetectionRequest", "AnomalyDetectionResponse",
    "PatternRecognitionRequest", "PatternRecognitionResponse",
    "PerformanceOptimizationRequest", "PerformanceOptimizationResponse",
    "IntelligenceAnalyticsRequest", "IntelligenceAnalyticsResponse",
    "ModelTrainingRequest", "ModelTrainingResponse",
    "IntelligenceMetricsResponse"
]

# ===================== SCAN PERFORMANCE API MODELS =====================

class PerformanceMetricRequest(BaseModel):
    metric_name: str
    metric_type: str
    scope: str
    resource_id: str
    resource_type: str
    component: str
    current_value: float
    unit: str
    warning_threshold: float | None = None
    critical_threshold: float | None = None
    target_value: float | None = None
    tags: List[str] | None = None


class PerformanceMetricResponse(BaseModel):
    metric_id: str
    metric_name: str
    metric_type: str
    status: str
    trend: str
    measured_at: str
    unit: str


class PerformanceOptimizationRequest(BaseModel):
    target_components: List[str]
    optimization_types: List[str] | None = None
    priority_threshold: int = 5
    include_risk_assessment: bool = True


class PerformanceOptimizationResponse(BaseModel):
    optimization_id: str
    optimization_name: str | None = None
    optimization_type: str | None = None
    predicted_improvement: float | None = None
    confidence: float | None = None
    priority: int | None = None
    risk_assessment: str | None = None
    status: str


class PerformanceAlertRequest(BaseModel):
    alert_name: str
    metric_id: str
    alert_condition: str
    threshold_value: float
    severity: str
    notification_channels: List[str]
    escalation_policy: Dict[str, Any] | None = None
    auto_response: bool = False
    is_active: bool = True


class PerformanceAlertResponse(BaseModel):
    alert_id: str
    status: str


class PerformanceBenchmarkRequest(BaseModel):
    benchmark_name: str
    benchmark_type: str
    scope: str
    component: str
    metric_type: str
    target_value: float
    minimum_acceptable: float | None = None
    maximum_acceptable: float | None = None


class PerformanceBenchmarkResponse(BaseModel):
    benchmark_id: str
    status: str


class PerformanceReportRequest(BaseModel):
    report_name: str
    report_type: str
    scope: str
    components: List[str]
    date_range: Dict[str, str]
    include_recommendations: bool = True
    include_benchmarks: bool = True
    recipients: List[str] | None = None


class PerformanceReportResponse(BaseModel):
    report_id: str
    status: str


class PerformanceAnalyticsRequest(BaseModel):
    scope: str = "system"
    components: List[str] | None = None
    time_range: str = "24h"
    include_predictions: bool = True


class PerformanceAnalyticsResponse(BaseModel):
    analytics_id: str
    status: str
    insights: Dict[str, Any] | None = None


class PerformanceMetricsResponse(BaseModel):
    metrics: Dict[str, Any]


__all__ += [
    "PerformanceMetricRequest", "PerformanceMetricResponse",
    "PerformanceOptimizationRequest", "PerformanceOptimizationResponse",
    "PerformanceAlertRequest", "PerformanceAlertResponse",
    "PerformanceBenchmarkRequest", "PerformanceBenchmarkResponse",
    "PerformanceReportRequest", "PerformanceReportResponse",
    "PerformanceAnalyticsRequest", "PerformanceAnalyticsResponse",
    "PerformanceMetricsResponse"
]


