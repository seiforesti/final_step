"""
Enterprise Catalog Quality Management API Routes

Provides comprehensive API endpoints for:
- Data quality rule management
- Automated quality assessments
- Real-time quality monitoring
- Quality analytics and reporting
- Quality scorecards and trends
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
from ...core.rate_limiting import RateLimiter
from ...core.audit import audit_log
from ...services.catalog_quality_service import CatalogQualityService
from ...models.catalog_quality_models import (
    DataQualityRule, QualityAssessment, QualityScorecard, QualityMonitoringConfig,
    QualityMonitoringAlert, QualityReport, QualityDimension, QualityRuleType,
    QualityStatus, QualitySeverity, QualityScoreMethod, QualityTrend,
    MonitoringFrequency, AlertThreshold, QualityReportType
)
from ...models.api import (
    QualityRuleRequest, QualityRuleResponse,
    QualityAssessmentRequest, QualityAssessmentResponse,
    QualityScorecardRequest, QualityScorecardResponse,
    QualityMonitoringRequest, QualityMonitoringResponse,
    QualityReportRequest, QualityReportResponse,
    QualityAnalyticsRequest, QualityAnalyticsResponse,
    QualityMetricsResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/catalog-quality", tags=["Catalog Quality"])
rate_limiter = RateLimiter()

def get_quality_service() -> CatalogQualityService:
    """Dependency to get catalog quality service instance"""
    return CatalogQualityService()

# Quality Rule Management Routes

@router.post("/rules")
@rate_limiter.limit("50/minute")
async def create_quality_rule(
    request: QualityRuleRequest,
    background_tasks: BackgroundTasks,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new data quality rule.
    
    Features:
    - Multiple rule types (null check, range check, format check, etc.)
    - Configurable thresholds and parameters
    - Business impact assessment
    - Automatic rule validation
    """
    try:
        await audit_log(
            action="quality_rule_created",
            user_id=current_user.get("user_id"),
            resource_type="quality_rule",
            resource_id=None,
            metadata={"rule_type": request.rule_type, "rule_name": request.rule_name}
        )
        
        rule = await quality_service.create_quality_rule(
            rule_name=request.rule_name,
            rule_type=request.rule_type,
            quality_dimension=request.quality_dimension,
            description=request.description,
            rule_definition=request.rule_definition,
            parameters=request.parameters,
            thresholds=request.thresholds,
            severity=request.severity,
            weight=request.weight,
            business_impact=request.business_impact,
            owner=request.owner,
            tags=request.tags,
            created_by=current_user.get("user_id")
        )
        
        # Validate rule in background
        if request.auto_validate:
            background_tasks.add_task(
                quality_service.validate_rule,
                rule.rule_id
            )
        
        return SuccessResponse(
            message="Quality rule created successfully",
            data={
                "rule": QualityRuleResponse.from_orm(rule),
                "validation_status": "started" if request.auto_validate else "manual"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create quality rule: {e}")
        raise HTTPException(status_code=500, detail=f"Rule creation failed: {str(e)}")

@router.get("/rules")
@rate_limiter.limit("200/minute")
@cache_response(expire_time=300)
async def list_quality_rules(
    rule_type: Optional[QualityRuleType] = Query(default=None, description="Filter by rule type"),
    quality_dimension: Optional[QualityDimension] = Query(default=None, description="Filter by quality dimension"),
    severity: Optional[QualitySeverity] = Query(default=None, description="Filter by severity"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    owner: Optional[str] = Query(default=None, description="Filter by owner"),
    tags: Optional[List[str]] = Query(default=None, description="Filter by tags"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List data quality rules with filtering and pagination.
    
    Features:
    - Advanced filtering by type, dimension, severity
    - Owner and tag-based filtering
    - Performance statistics inclusion
    - Pagination support
    """
    try:
        rules = await quality_service.list_quality_rules(
            rule_type=rule_type,
            quality_dimension=quality_dimension,
            severity=severity,
            is_active=is_active,
            owner=owner,
            tags=tags,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await quality_service.count_quality_rules(
            rule_type=rule_type,
            quality_dimension=quality_dimension,
            severity=severity,
            is_active=is_active,
            owner=owner,
            tags=tags
        )
        
        return SuccessResponse(
            message="Quality rules retrieved successfully",
            data={
                "rules": [QualityRuleResponse.from_orm(rule) for rule in rules],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list quality rules: {e}")
        raise HTTPException(status_code=500, detail=f"Rule listing failed: {str(e)}")

@router.get("/rules/{rule_id}")
@rate_limiter.limit("300/minute")
@cache_response(expire_time=120)
async def get_quality_rule(
    rule_id: str,
    include_assessments: bool = Query(default=False, description="Include recent assessments"),
    include_statistics: bool = Query(default=True, description="Include performance statistics"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get detailed information about a specific quality rule.
    
    Features:
    - Complete rule configuration and metadata
    - Recent assessment history
    - Performance statistics and trends
    - Usage analytics
    """
    try:
        rule = await quality_service.get_quality_rule(
            rule_id=rule_id,
            include_assessments=include_assessments,
            include_statistics=include_statistics
        )
        
        if not rule:
            raise HTTPException(status_code=404, detail="Quality rule not found")
        
        return SuccessResponse(
            message="Quality rule retrieved successfully",
            data={"rule": QualityRuleResponse.from_orm(rule)}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get quality rule {rule_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Rule retrieval failed: {str(e)}")

@router.put("/rules/{rule_id}")
@rate_limiter.limit("100/minute")
async def update_quality_rule(
    rule_id: str,
    request: QualityRuleRequest,
    background_tasks: BackgroundTasks,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update an existing data quality rule.
    
    Features:
    - Complete rule configuration updates
    - Version management and history
    - Impact analysis for rule changes
    - Automatic re-validation
    """
    try:
        await audit_log(
            action="quality_rule_updated",
            user_id=current_user.get("user_id"),
            resource_type="quality_rule",
            resource_id=rule_id,
            metadata={"rule_type": request.rule_type, "rule_name": request.rule_name}
        )
        
        rule = await quality_service.update_quality_rule(
            rule_id=rule_id,
            rule_name=request.rule_name,
            rule_type=request.rule_type,
            quality_dimension=request.quality_dimension,
            description=request.description,
            rule_definition=request.rule_definition,
            parameters=request.parameters,
            thresholds=request.thresholds,
            severity=request.severity,
            weight=request.weight,
            business_impact=request.business_impact,
            owner=request.owner,
            tags=request.tags,
            is_active=request.is_active,
            updated_by=current_user.get("user_id")
        )
        
        # Re-validate rule if significant changes
        if request.auto_validate:
            background_tasks.add_task(
                quality_service.validate_rule,
                rule_id
            )
        
        return SuccessResponse(
            message="Quality rule updated successfully",
            data={"rule": QualityRuleResponse.from_orm(rule)}
        )
        
    except Exception as e:
        logger.error(f"Failed to update quality rule {rule_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Rule update failed: {str(e)}")

# Quality Assessment Routes

@router.post("/assessments")
@rate_limiter.limit("100/minute")
async def create_quality_assessment(
    request: QualityAssessmentRequest,
    background_tasks: BackgroundTasks,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Execute quality assessment for specified assets.
    
    Features:
    - Multiple asset types (tables, columns, datasets)
    - Rule-based or comprehensive assessments
    - Real-time execution monitoring
    - Automated scoring and reporting
    """
    try:
        await audit_log(
            action="quality_assessment_started",
            user_id=current_user.get("user_id"),
            resource_type="quality_assessment",
            resource_id=None,
            metadata={"target_id": request.target_id, "assessment_type": request.assessment_type}
        )
        
        assessment = await quality_service.create_quality_assessment(
            target_id=request.target_id,
            target_type=request.target_type,
            assessment_type=request.assessment_type,
            rule_ids=request.rule_ids,
            assessment_scope=request.assessment_scope,
            parameters=request.parameters,
            auto_execute=request.auto_execute,
            user_id=current_user.get("user_id")
        )
        
        # Execute assessment in background if auto_execute is True
        if request.auto_execute:
            background_tasks.add_task(
                quality_service.execute_assessment,
                assessment.assessment_id
            )
        
        return SuccessResponse(
            message="Quality assessment created successfully",
            data={
                "assessment": QualityAssessmentResponse.from_orm(assessment),
                "execution_status": "started" if request.auto_execute else "pending"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create quality assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment creation failed: {str(e)}")

@router.post("/assessments/{assessment_id}/execute")
@rate_limiter.limit("50/minute")
async def execute_quality_assessment(
    assessment_id: str,
    background_tasks: BackgroundTasks,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Execute a pending quality assessment.
    
    Features:
    - Safe execution with progress monitoring
    - Real-time result streaming
    - Automatic error handling and recovery
    - Result validation and scoring
    """
    try:
        await audit_log(
            action="quality_assessment_executed",
            user_id=current_user.get("user_id"),
            resource_type="quality_assessment",
            resource_id=assessment_id
        )
        
        result = await quality_service.execute_assessment(assessment_id)
        
        return SuccessResponse(
            message="Quality assessment execution started",
            data={
                "assessment_id": assessment_id,
                "execution_status": result.get("status"),
                "estimated_completion": result.get("estimated_completion"),
                "progress_stream_url": f"/api/v1/catalog-quality/assessments/{assessment_id}/stream"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to execute quality assessment {assessment_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment execution failed: {str(e)}")

@router.get("/assessments")
@rate_limiter.limit("200/minute")
@cache_response(expire_time=180)
async def list_quality_assessments(
    target_type: Optional[str] = Query(default=None, description="Filter by target type"),
    assessment_type: Optional[str] = Query(default=None, description="Filter by assessment type"),
    status: Optional[QualityStatus] = Query(default=None, description="Filter by status"),
    time_range: Optional[str] = Query(default="7d", description="Time range (1h, 24h, 7d, 30d)"),
    include_results: bool = Query(default=False, description="Include assessment results"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=50, ge=1, le=200, description="Page size"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List quality assessments with filtering and pagination.
    
    Features:
    - Advanced filtering by type, status, and time
    - Result inclusion options
    - Summary statistics
    - Export capabilities
    """
    try:
        assessments = await quality_service.list_quality_assessments(
            target_type=target_type,
            assessment_type=assessment_type,
            status=status,
            time_range=time_range,
            include_results=include_results,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await quality_service.count_quality_assessments(
            target_type=target_type,
            assessment_type=assessment_type,
            status=status,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Quality assessments retrieved successfully",
            data={
                "assessments": [QualityAssessmentResponse.from_orm(assessment) for assessment in assessments],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                },
                "summary": await quality_service.get_assessment_summary(
                    target_type=target_type,
                    assessment_type=assessment_type,
                    time_range=time_range
                )
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list quality assessments: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment listing failed: {str(e)}")

@router.get("/assessments/{assessment_id}")
@rate_limiter.limit("300/minute")
@cache_response(expire_time=120)
async def get_quality_assessment(
    assessment_id: str,
    include_details: bool = Query(default=True, description="Include detailed results"),
    include_recommendations: bool = Query(default=True, description="Include recommendations"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get detailed information about a specific quality assessment.
    
    Features:
    - Complete assessment results and scoring
    - Rule-level breakdown and analysis
    - Quality recommendations and insights
    - Historical comparison data
    """
    try:
        assessment = await quality_service.get_quality_assessment(
            assessment_id=assessment_id,
            include_details=include_details,
            include_recommendations=include_recommendations
        )
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Quality assessment not found")
        
        return SuccessResponse(
            message="Quality assessment retrieved successfully",
            data={"assessment": QualityAssessmentResponse.from_orm(assessment)}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get quality assessment {assessment_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment retrieval failed: {str(e)}")

# Quality Scorecard Routes

@router.post("/scorecards")
@rate_limiter.limit("50/minute")
async def create_quality_scorecard(
    request: QualityScorecardRequest,
    background_tasks: BackgroundTasks,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a quality scorecard for tracking data quality metrics.
    
    Features:
    - Customizable scoring methodology
    - Multiple quality dimensions
    - Trend analysis and benchmarking
    - Automated score updates
    """
    try:
        await audit_log(
            action="quality_scorecard_created",
            user_id=current_user.get("user_id"),
            resource_type="quality_scorecard",
            resource_id=None,
            metadata={"scorecard_name": request.scorecard_name, "target_id": request.target_id}
        )
        
        scorecard = await quality_service.create_quality_scorecard(
            scorecard_name=request.scorecard_name,
            target_id=request.target_id,
            target_type=request.target_type,
            scoring_method=request.scoring_method,
            quality_dimensions=request.quality_dimensions,
            weights=request.weights,
            thresholds=request.thresholds,
            auto_update=request.auto_update,
            update_frequency=request.update_frequency,
            created_by=current_user.get("user_id")
        )
        
        # Calculate initial score if auto_update is enabled
        if request.auto_update:
            background_tasks.add_task(
                quality_service.calculate_scorecard_score,
                scorecard.scorecard_id
            )
        
        return SuccessResponse(
            message="Quality scorecard created successfully",
            data={"scorecard": QualityScorecardResponse.from_orm(scorecard)}
        )
        
    except Exception as e:
        logger.error(f"Failed to create quality scorecard: {e}")
        raise HTTPException(status_code=500, detail=f"Scorecard creation failed: {str(e)}")

@router.get("/scorecards")
@rate_limiter.limit("200/minute")
@cache_response(expire_time=300)
async def list_quality_scorecards(
    target_type: Optional[str] = Query(default=None, description="Filter by target type"),
    scoring_method: Optional[QualityScoreMethod] = Query(default=None, description="Filter by scoring method"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    include_scores: bool = Query(default=True, description="Include current scores"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List quality scorecards with filtering and current scores.
    
    Features:
    - Advanced filtering options
    - Current score inclusion
    - Trend indicators
    - Performance analytics
    """
    try:
        scorecards = await quality_service.list_quality_scorecards(
            target_type=target_type,
            scoring_method=scoring_method,
            is_active=is_active,
            include_scores=include_scores,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await quality_service.count_quality_scorecards(
            target_type=target_type,
            scoring_method=scoring_method,
            is_active=is_active
        )
        
        return SuccessResponse(
            message="Quality scorecards retrieved successfully",
            data={
                "scorecards": [QualityScorecardResponse.from_orm(scorecard) for scorecard in scorecards],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list quality scorecards: {e}")
        raise HTTPException(status_code=500, detail=f"Scorecard listing failed: {str(e)}")

# Quality Monitoring Routes

@router.post("/monitoring")
@rate_limiter.limit("30/minute")
async def create_quality_monitoring(
    request: QualityMonitoringRequest,
    background_tasks: BackgroundTasks,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Set up continuous quality monitoring for data assets.
    
    Features:
    - Real-time quality monitoring
    - Configurable alert thresholds
    - Multiple monitoring frequencies
    - Automated response actions
    """
    try:
        await audit_log(
            action="quality_monitoring_created",
            user_id=current_user.get("user_id"),
            resource_type="quality_monitoring",
            resource_id=None,
            metadata={"monitor_name": request.monitor_name, "target_id": request.target_id}
        )
        
        monitor = await quality_service.create_quality_monitoring(
            monitor_name=request.monitor_name,
            target_id=request.target_id,
            target_type=request.target_type,
            quality_rules=request.quality_rules,
            monitoring_frequency=request.monitoring_frequency,
            alert_thresholds=request.alert_thresholds,
            notification_settings=request.notification_settings,
            auto_start=request.auto_start,
            created_by=current_user.get("user_id")
        )
        
        # Start monitoring if auto_start is enabled
        if request.auto_start:
            background_tasks.add_task(
                quality_service.start_monitoring,
                monitor.monitor_id
            )
        
        return SuccessResponse(
            message="Quality monitoring created successfully",
            data={
                "monitor": QualityMonitoringResponse.from_orm(monitor),
                "monitoring_status": "started" if request.auto_start else "stopped"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create quality monitoring: {e}")
        raise HTTPException(status_code=500, detail=f"Monitoring creation failed: {str(e)}")

@router.post("/monitoring/{monitor_id}/start")
@rate_limiter.limit("100/minute")
async def start_quality_monitoring(
    monitor_id: str,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Start quality monitoring for a specific monitor.
    
    Features:
    - Immediate monitoring activation
    - Health check validation
    - Resource allocation
    - Status tracking
    """
    try:
        await audit_log(
            action="quality_monitoring_started",
            user_id=current_user.get("user_id"),
            resource_type="quality_monitoring",
            resource_id=monitor_id
        )
        
        result = await quality_service.start_monitoring(monitor_id)
        
        return SuccessResponse(
            message="Quality monitoring started successfully",
            data={
                "monitor_id": monitor_id,
                "status": result.get("status"),
                "next_execution": result.get("next_execution"),
                "monitoring_url": f"/api/v1/catalog-quality/monitoring/{monitor_id}/stream"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to start quality monitoring {monitor_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Monitoring start failed: {str(e)}")

@router.post("/monitoring/{monitor_id}/stop")
@rate_limiter.limit("100/minute")
async def stop_quality_monitoring(
    monitor_id: str,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Stop quality monitoring for a specific monitor.
    
    Features:
    - Graceful monitoring shutdown
    - Data preservation
    - Final status report
    - Resource cleanup
    """
    try:
        await audit_log(
            action="quality_monitoring_stopped",
            user_id=current_user.get("user_id"),
            resource_type="quality_monitoring",
            resource_id=monitor_id
        )
        
        result = await quality_service.stop_monitoring(monitor_id)
        
        return SuccessResponse(
            message="Quality monitoring stopped successfully",
            data={
                "monitor_id": monitor_id,
                "status": result.get("status"),
                "final_report": result.get("final_report")
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to stop quality monitoring {monitor_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Monitoring stop failed: {str(e)}")

# Quality Reporting Routes

@router.post("/reports")
@rate_limiter.limit("50/minute")
async def generate_quality_report(
    request: QualityReportRequest,
    background_tasks: BackgroundTasks,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Generate comprehensive quality reports.
    
    Features:
    - Multiple report types (summary, detailed, trend, compliance)
    - Customizable time ranges and filters
    - Export formats (PDF, Excel, JSON)
    - Automated report scheduling
    """
    try:
        await audit_log(
            action="quality_report_generated",
            user_id=current_user.get("user_id"),
            resource_type="quality_report",
            resource_id=None,
            metadata={"report_type": request.report_type, "scope": request.scope}
        )
        
        report = await quality_service.generate_quality_report(
            report_type=request.report_type,
            scope=request.scope,
            filters=request.filters,
            time_range=request.time_range,
            output_format=request.output_format,
            include_recommendations=request.include_recommendations,
            auto_generate=request.auto_generate,
            user_id=current_user.get("user_id")
        )
        
        # Generate report in background if auto_generate is True
        if request.auto_generate:
            background_tasks.add_task(
                quality_service.generate_report_content,
                report.report_id
            )
        
        return SuccessResponse(
            message="Quality report generation started",
            data={
                "report": QualityReportResponse.from_orm(report),
                "generation_status": "started" if request.auto_generate else "pending"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to generate quality report: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.get("/reports")
@rate_limiter.limit("200/minute")
@cache_response(expire_time=300)
async def list_quality_reports(
    report_type: Optional[QualityReportType] = Query(default=None, description="Filter by report type"),
    status: Optional[str] = Query(default=None, description="Filter by generation status"),
    time_range: Optional[str] = Query(default="30d", description="Time range for reports"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List quality reports with filtering and pagination.
    
    Features:
    - Advanced filtering options
    - Status tracking
    - Download links for completed reports
    - Report metadata and statistics
    """
    try:
        reports = await quality_service.list_quality_reports(
            report_type=report_type,
            status=status,
            time_range=time_range,
            offset=(page - 1) * page_size,
            limit=page_size
        )
        
        total_count = await quality_service.count_quality_reports(
            report_type=report_type,
            status=status,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Quality reports retrieved successfully",
            data={
                "reports": [QualityReportResponse.from_orm(report) for report in reports],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list quality reports: {e}")
        raise HTTPException(status_code=500, detail=f"Report listing failed: {str(e)}")

# Quality Analytics Routes

@router.get("/analytics")
@rate_limiter.limit("100/minute")
@cache_response(expire_time=600)
async def get_quality_analytics(
    scope: Optional[str] = Query(default="global", description="Analytics scope"),
    time_range: Optional[str] = Query(default="7d", description="Time range for analytics"),
    include_trends: bool = Query(default=True, description="Include trend analysis"),
    include_benchmarks: bool = Query(default=True, description="Include benchmark comparisons"),
    include_predictions: bool = Query(default=False, description="Include quality predictions"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get comprehensive quality analytics and insights.
    
    Features:
    - Cross-dimensional quality analytics
    - Trend identification and forecasting
    - Benchmark comparisons
    - Predictive quality insights
    """
    try:
        analytics = await quality_service.get_quality_analytics(
            scope=scope,
            time_range=time_range,
            include_trends=include_trends,
            include_benchmarks=include_benchmarks,
            include_predictions=include_predictions
        )
        
        return SuccessResponse(
            message="Quality analytics retrieved successfully",
            data=QualityAnalyticsResponse(**analytics)
        )
        
    except Exception as e:
        logger.error(f"Failed to get quality analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Quality analytics retrieval failed: {str(e)}")

@router.get("/metrics")
@rate_limiter.limit("300/minute")
@cache_response(expire_time=60)
async def get_quality_metrics(
    scope: Optional[str] = Query(default="global", description="Metrics scope"),
    time_range: Optional[str] = Query(default="1h", description="Time range for metrics"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get real-time quality metrics and KPIs.
    
    Features:
    - Real-time quality KPIs
    - System performance metrics
    - Operation statistics
    - Health indicators
    """
    try:
        metrics = await quality_service.get_quality_metrics(
            scope=scope,
            time_range=time_range
        )
        
        return SuccessResponse(
            message="Quality metrics retrieved successfully",
            data=QualityMetricsResponse(**metrics)
        )
        
    except Exception as e:
        logger.error(f"Failed to get quality metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Quality metrics retrieval failed: {str(e)}")

# Streaming and Real-time Routes

@router.get("/stream/assessments/{assessment_id}")
async def stream_assessment_progress(
    assessment_id: str,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time progress for a quality assessment.
    
    Features:
    - Live assessment progress updates
    - Rule-level execution status
    - Real-time result streaming
    - Error and warning notifications
    """
    async def assessment_stream():
        try:
            async for progress_data in quality_service.stream_assessment_progress(
                assessment_id=assessment_id,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(progress_data)}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"Assessment stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        assessment_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@router.get("/stream/monitoring/{monitor_id}")
async def stream_monitoring_updates(
    monitor_id: str,
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time updates from quality monitoring.
    
    Features:
    - Live monitoring data updates
    - Alert notifications
    - Quality score changes
    - System health indicators
    """
    async def monitoring_stream():
        try:
            async for monitoring_data in quality_service.stream_monitoring_updates(
                monitor_id=monitor_id,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(monitoring_data)}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"Monitoring stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        monitoring_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@router.get("/stream/alerts")
async def stream_quality_alerts(
    severity_min: Optional[QualitySeverity] = Query(default=QualitySeverity.MEDIUM, description="Minimum alert severity"),
    quality_service: CatalogQualityService = Depends(get_quality_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time quality alerts and notifications.
    
    Features:
    - Live quality alert notifications
    - Severity-based filtering
    - Automated response suggestions
    - Alert correlation and analysis
    """
    async def alert_stream():
        try:
            async for alert_data in quality_service.stream_quality_alerts(
                severity_min=severity_min,
                user_id=current_user.get("user_id")
            ):
                yield f"data: {json.dumps(alert_data)}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"Alert stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        alert_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )