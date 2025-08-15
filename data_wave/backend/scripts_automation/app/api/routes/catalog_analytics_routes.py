"""
🏢 Enterprise Catalog Analytics Routes (Data Catalog Group)
==========================================================

This module provides comprehensive API endpoints for catalog analytics with:
- Advanced data asset analytics and insights
- Usage pattern analysis and trend forecasting
- Business value assessment and optimization
- AI-powered recommendation and discovery analytics
- Enterprise-grade reporting and dashboard capabilities

Authors: Enterprise Data Governance Team
Version: 1.0.0 (Production-Ready)
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Body, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from pydantic import BaseModel, Field, validator

# Core dependencies
from ...db_session import get_session
from ...models.catalog_models import CatalogItem as CatalogAsset, CatalogUsageLog as AssetUsage, CatalogTag as AssetTag
from ...models.catalog_quality_models import QualityAssessment, QualityScorecard
try:
    from ...models.catalog_intelligence_models import CatalogIntelligenceModel, UsagePatternAnalysis
except Exception:
    from pydantic import BaseModel
    class CatalogIntelligenceModel(BaseModel):
        model_id: str
        description: str | None = None
        version: str | None = None
    class UsagePatternAnalysis(BaseModel):
        asset_id: int
        patterns: list = []
        generated_at: datetime | None = None

# Service dependencies
from ...services.catalog_analytics_service import CatalogAnalyticsService
from ...services.catalog_recommendation_service import CatalogRecommendationService
from ...services.catalog_quality_service import CatalogQualityService
from ...services.enterprise_catalog_service import EnterpriseIntelligentCatalogService as EnterpriseCatalogService

# Authentication and authorization
from ...api.security.rbac import (
    get_current_user,
    require_permission,
    PERMISSION_ANALYTICS_VIEW as Permission_ANALYTICS_VIEW,
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/api/v1/catalog-analytics",
    tags=["Catalog Analytics", "Data Catalog", "Analytics"],
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

# Request/Response Models

class AnalyticsRequest(BaseModel):
    """Request model for catalog analytics"""
    analysis_type: str = Field(..., description="Type of analysis: usage, quality, business_value, trends")
    scope: str = Field("catalog", description="Analysis scope: catalog, domain, asset_type, specific")
    target_ids: Optional[List[str]] = Field(None, description="Specific asset or domain IDs")
    timeframe: str = Field("30d", description="Analysis timeframe")
    aggregation_level: str = Field("daily", description="Aggregation level: hourly, daily, weekly, monthly")
    include_predictions: bool = Field(True, description="Include predictive analytics")
    detail_level: str = Field("summary", description="Detail level: summary, detailed, comprehensive")

class UsageAnalyticsRequest(BaseModel):
    """Request model for usage analytics"""
    asset_types: Optional[List[str]] = Field(None, description="Filter by asset types")
    user_groups: Optional[List[str]] = Field(None, description="Filter by user groups")
    departments: Optional[List[str]] = Field(None, description="Filter by departments")
    timeframe: str = Field("30d", description="Analysis timeframe")
    include_patterns: bool = Field(True, description="Include usage pattern analysis")
    include_anomalies: bool = Field(True, description="Include usage anomaly detection")

class BusinessValueRequest(BaseModel):
    """Request model for business value analysis"""
    value_metrics: List[str] = Field(..., description="Value metrics to analyze")
    business_domains: Optional[List[str]] = Field(None, description="Filter by business domains")
    calculation_method: str = Field("weighted", description="Value calculation method")
    include_roi_analysis: bool = Field(True, description="Include ROI analysis")
    benchmark_comparison: bool = Field(True, description="Include benchmark comparison")

class TrendAnalysisRequest(BaseModel):
    """Request model for trend analysis"""
    trend_types: List[str] = Field(..., description="Types of trends to analyze")
    timeframe: str = Field("90d", description="Analysis timeframe")
    forecast_horizon: str = Field("30d", description="Forecasting horizon")
    confidence_level: float = Field(0.95, ge=0.5, le=0.99, description="Confidence level for predictions")
    include_seasonality: bool = Field(True, description="Include seasonal analysis")

class ReportGenerationRequest(BaseModel):
    """Request model for report generation"""
    report_type: str = Field(..., description="Type of report to generate")
    report_format: str = Field("json", description="Report format: json, pdf, excel, csv")
    sections: List[str] = Field(..., description="Report sections to include")
    recipients: Optional[List[str]] = Field(None, description="Email recipients")
    schedule_recurring: bool = Field(False, description="Schedule as recurring report")
    schedule_frequency: Optional[str] = Field(None, description="Frequency for recurring reports")

# Service Dependencies

def get_analytics_service() -> CatalogAnalyticsService:
    """Get catalog analytics service"""
    return CatalogAnalyticsService()

def get_recommendation_service() -> CatalogRecommendationService:
    """Get catalog recommendation service"""
    return CatalogRecommendationService()

def get_quality_service() -> CatalogQualityService:
    """Get catalog quality service"""
    return CatalogQualityService()

def get_catalog_service() -> EnterpriseCatalogService:
    """Get enterprise catalog service"""
    return EnterpriseCatalogService()

# API Endpoints

@router.post("/analyze")
async def perform_catalog_analysis(
    request: AnalyticsRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Perform comprehensive catalog analytics
    
    This endpoint provides:
    - Multi-dimensional catalog analysis and insights
    - Usage pattern recognition and optimization
    - Quality trend analysis and recommendations
    - Business value assessment and ROI calculation
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.ANALYTICS_VIEW])
        
        # Validate analysis request
        validation_result = await _validate_analytics_request(request, session)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid analysis request: {validation_result['error']}"
            )
        
        # Execute analysis based on type
        if request.analysis_type == "usage":
            analysis_result = await analytics_service.analyze_usage_patterns({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "aggregation_level": request.aggregation_level,
                "include_predictions": request.include_predictions,
                "detail_level": request.detail_level
            }, session)
        
        elif request.analysis_type == "quality":
            analysis_result = await analytics_service.analyze_quality_trends({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "aggregation_level": request.aggregation_level,
                "include_predictions": request.include_predictions,
                "detail_level": request.detail_level
            }, session)
        
        elif request.analysis_type == "business_value":
            analysis_result = await analytics_service.analyze_business_value({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "aggregation_level": request.aggregation_level,
                "include_predictions": request.include_predictions,
                "detail_level": request.detail_level
            }, session)
        
        elif request.analysis_type == "trends":
            analysis_result = await analytics_service.analyze_catalog_trends({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "aggregation_level": request.aggregation_level,
                "include_predictions": request.include_predictions,
                "detail_level": request.detail_level
            }, session)
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported analysis type: {request.analysis_type}"
            )
        
        if not analysis_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {analysis_result['error']}"
            )
        
        # Generate insights and recommendations
        insights = await analytics_service.generate_insights(
            analysis_result["analysis_data"],
            request.analysis_type,
            session
        )
        
        # Start background processing for advanced analytics
        background_tasks.add_task(
            _process_advanced_analytics,
            analysis_result["analysis_id"],
            request.analysis_type,
            session
        )
        
        return {
            "success": True,
            "analysis_id": analysis_result["analysis_id"],
            "analysis_type": request.analysis_type,
            "scope": request.scope,
            "timeframe": request.timeframe,
            "summary": analysis_result["summary"],
            "key_metrics": analysis_result["key_metrics"],
            "insights": insights["insights"],
            "recommendations": insights["recommendations"],
            "data_points": analysis_result["data_points"],
            "predictions": analysis_result.get("predictions", {}),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing catalog analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/usage/analyze")
async def analyze_usage_patterns(
    request: UsageAnalyticsRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Analyze catalog usage patterns and behaviors
    
    This endpoint provides:
    - Detailed usage pattern analysis across assets
    - User behavior and access pattern recognition
    - Anomaly detection in usage patterns
    - Usage optimization recommendations
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.USAGE_ANALYTICS])
        
        # Perform usage pattern analysis
        usage_analysis = await analytics_service.analyze_detailed_usage_patterns({
            "asset_types": request.asset_types,
            "user_groups": request.user_groups,
            "departments": request.departments,
            "timeframe": request.timeframe,
            "include_patterns": request.include_patterns,
            "include_anomalies": request.include_anomalies
        }, session)
        
        if not usage_analysis["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Usage analysis failed: {usage_analysis['error']}"
            )
        
        # Generate usage optimization recommendations
        optimization_recommendations = await analytics_service.generate_usage_optimizations(
            usage_analysis["patterns"],
            session
        )
        
        return {
            "success": True,
            "analysis_id": usage_analysis["analysis_id"],
            "timeframe": request.timeframe,
            "usage_summary": usage_analysis["usage_summary"],
            "patterns": usage_analysis["patterns"],
            "anomalies": usage_analysis.get("anomalies", []),
            "user_insights": usage_analysis["user_insights"],
            "asset_insights": usage_analysis["asset_insights"],
            "optimization_recommendations": optimization_recommendations,
            "trend_analysis": usage_analysis["trend_analysis"],
            "peak_usage_times": usage_analysis["peak_usage_times"],
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing usage patterns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/business-value")
async def analyze_business_value(
    request: BusinessValueRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Analyze business value and ROI of catalog assets
    
    This endpoint provides:
    - Comprehensive business value assessment
    - ROI calculation and cost-benefit analysis
    - Value-based asset ranking and prioritization
    - Investment optimization recommendations
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.BUSINESS_ANALYTICS])
        
        # Validate value metrics
        if not request.value_metrics:
            raise HTTPException(
                status_code=400,
                detail="At least one value metric must be specified"
            )
        
        # Perform business value analysis
        value_analysis = await analytics_service.analyze_business_value_metrics({
            "value_metrics": request.value_metrics,
            "business_domains": request.business_domains,
            "calculation_method": request.calculation_method,
            "include_roi_analysis": request.include_roi_analysis,
            "benchmark_comparison": request.benchmark_comparison
        }, session)
        
        if not value_analysis["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Business value analysis failed: {value_analysis['error']}"
            )
        
        # Generate investment recommendations
        investment_recommendations = await analytics_service.generate_investment_recommendations(
            value_analysis["value_data"],
            session
        )
        
        return {
            "success": True,
            "analysis_id": value_analysis["analysis_id"],
            "value_metrics": request.value_metrics,
            "business_domains": request.business_domains,
            "overall_value_score": value_analysis["overall_value_score"],
            "value_breakdown": value_analysis["value_breakdown"],
            "roi_analysis": value_analysis.get("roi_analysis", {}),
            "benchmarks": value_analysis.get("benchmarks", {}),
            "top_value_assets": value_analysis["top_value_assets"],
            "underperforming_assets": value_analysis["underperforming_assets"],
            "investment_recommendations": investment_recommendations,
            "cost_optimization_opportunities": value_analysis["cost_optimization_opportunities"],
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing business value: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trends")
async def analyze_trends(
    request: TrendAnalysisRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Analyze catalog trends and generate forecasts
    
    This endpoint provides:
    - Comprehensive trend analysis across multiple dimensions
    - Predictive forecasting with confidence intervals
    - Seasonal pattern recognition and analysis
    - Trend-based strategic recommendations
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.TREND_ANALYSIS])
        
        # Perform trend analysis
        trend_analysis = await analytics_service.analyze_comprehensive_trends({
            "trend_types": request.trend_types,
            "timeframe": request.timeframe,
            "forecast_horizon": request.forecast_horizon,
            "confidence_level": request.confidence_level,
            "include_seasonality": request.include_seasonality
        }, session)
        
        if not trend_analysis["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Trend analysis failed: {trend_analysis['error']}"
            )
        
        # Generate strategic recommendations
        strategic_recommendations = await analytics_service.generate_strategic_recommendations(
            trend_analysis["trends"],
            request.forecast_horizon,
            session
        )
        
        return {
            "success": True,
            "analysis_id": trend_analysis["analysis_id"],
            "trend_types": request.trend_types,
            "timeframe": request.timeframe,
            "forecast_horizon": request.forecast_horizon,
            "confidence_level": request.confidence_level,
            "trends": trend_analysis["trends"],
            "forecasts": trend_analysis["forecasts"],
            "seasonal_patterns": trend_analysis.get("seasonal_patterns", {}),
            "trend_insights": trend_analysis["trend_insights"],
            "strategic_recommendations": strategic_recommendations,
            "risk_indicators": trend_analysis["risk_indicators"],
            "opportunity_indicators": trend_analysis["opportunity_indicators"],
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_analytics_dashboard(
    dashboard_type: str = Query("executive", description="Dashboard type"),
    timeframe: str = Query("30d", description="Dashboard timeframe"),
    refresh_cache: bool = Query(False, description="Force refresh cached data"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Get comprehensive analytics dashboard
    
    This endpoint provides:
    - Real-time analytics dashboard with key metrics
    - Interactive visualizations and charts
    - Customizable dashboard configurations
    - Role-based dashboard views and permissions
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.DASHBOARD_VIEW])
        
        # Get dashboard data
        dashboard_data = await analytics_service.get_analytics_dashboard({
            "dashboard_type": dashboard_type,
            "timeframe": timeframe,
            "user_role": current_user.role,
            "refresh_cache": refresh_cache
        }, session)
        
        if not dashboard_data["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Dashboard generation failed: {dashboard_data['error']}"
            )
        
        return {
            "success": True,
            "dashboard_type": dashboard_type,
            "timeframe": timeframe,
            "last_updated": dashboard_data["last_updated"],
            "summary_metrics": dashboard_data["summary_metrics"],
            "charts": dashboard_data["charts"],
            "widgets": dashboard_data["widgets"],
            "alerts": dashboard_data["alerts"],
            "recommendations": dashboard_data["recommendations"],
            "custom_views": dashboard_data.get("custom_views", []),
            "export_options": dashboard_data["export_options"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating analytics dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/generate")
async def generate_analytics_report(
    request: ReportGenerationRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Generate comprehensive analytics reports
    
    This endpoint provides:
    - Custom report generation with multiple formats
    - Automated report scheduling and distribution
    - Template-based and custom report creation
    - Export capabilities in various formats
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.REPORT_GENERATE])
        
        # Validate report request
        if not request.sections:
            raise HTTPException(
                status_code=400,
                detail="At least one report section must be specified"
            )
        
        # Generate report
        report_result = await analytics_service.generate_analytics_report({
            "report_type": request.report_type,
            "report_format": request.report_format,
            "sections": request.sections,
            "user_id": current_user.id,
            "generation_timestamp": datetime.utcnow()
        }, session)
        
        if not report_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Report generation failed: {report_result['error']}"
            )
        
        # Schedule recurring report if requested
        if request.schedule_recurring and request.schedule_frequency:
            schedule_result = await analytics_service.schedule_recurring_report({
                "report_template_id": report_result["template_id"],
                "frequency": request.schedule_frequency,
                "recipients": request.recipients or [],
                "user_id": current_user.id
            }, session)
        
        # Send report to recipients if specified
        if request.recipients:
            background_tasks.add_task(
                _send_report_to_recipients,
                report_result["report_id"],
                request.recipients,
                session
            )
        
        return {
            "success": True,
            "report_id": report_result["report_id"],
            "report_type": request.report_type,
            "report_format": request.report_format,
            "download_url": report_result["download_url"],
            "file_size": report_result["file_size"],
            "sections_included": request.sections,
            "scheduled_recurring": request.schedule_recurring,
            "recipients_notified": len(request.recipients) if request.recipients else 0,
            "generation_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating analytics report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_ai_insights(
    insight_type: str = Query("all", description="Type of insights"),
    priority_level: str = Query("high", description="Minimum priority level"),
    limit: int = Query(20, ge=1, le=100, description="Maximum insights"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Get AI-powered catalog insights and recommendations
    
    This endpoint provides:
    - Intelligent insight generation from catalog data
    - Priority-based insight ranking and filtering
    - Actionable recommendations with impact assessment
    - Automated insight discovery and alerting
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.AI_INSIGHTS])
        
        # Get AI insights
        insights_result = await analytics_service.get_ai_insights({
            "insight_type": insight_type,
            "priority_level": priority_level,
            "limit": limit,
            "user_context": {
                "role": current_user.role,
                "department": getattr(current_user, 'department', None),
                "access_level": current_user.access_level
            }
        }, session)
        
        if not insights_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get AI insights: {insights_result['error']}"
            )
        
        return {
            "success": True,
            "insight_type": insight_type,
            "priority_level": priority_level,
            "insights_count": len(insights_result["insights"]),
            "insights": insights_result["insights"],
            "summary": {
                "critical": len([i for i in insights_result["insights"] if i["priority"] == "critical"]),
                "high": len([i for i in insights_result["insights"] if i["priority"] == "high"]),
                "medium": len([i for i in insights_result["insights"] if i["priority"] == "medium"]),
                "actionable": len([i for i in insights_result["insights"] if i.get("actionable", False)])
            },
            "confidence_score": insights_result["average_confidence"],
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/real-time")
async def get_real_time_metrics(
    metric_types: List[str] = Query(..., description="Types of metrics to retrieve"),
    aggregation: str = Query("current", description="Aggregation level"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Get real-time catalog metrics and KPIs
    
    This endpoint provides:
    - Live catalog performance metrics
    - Real-time usage and activity indicators
    - System health and operational metrics
    - Performance benchmarking and comparisons
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.METRICS_VIEW])
        
        # Get real-time metrics
        metrics_result = await analytics_service.get_real_time_metrics({
            "metric_types": metric_types,
            "aggregation": aggregation,
            "include_trends": True,
            "include_comparisons": True
        }, session)
        
        if not metrics_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get real-time metrics: {metrics_result['error']}"
            )
        
        return {
            "success": True,
            "metric_types": metric_types,
            "aggregation": aggregation,
            "metrics": metrics_result["metrics"],
            "trends": metrics_result["trends"],
            "comparisons": metrics_result["comparisons"],
            "alerts": metrics_result["alerts"],
            "system_health": metrics_result["system_health"],
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting real-time metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream/analytics")
async def stream_analytics_updates(
    update_types: List[str] = Query(["metrics", "insights"], description="Types of updates"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: CatalogAnalyticsService = Depends(get_analytics_service)
):
    """
    Stream real-time analytics updates and notifications
    
    This endpoint provides:
    - Live analytics data streaming
    - Real-time insight and alert notifications
    - Continuous monitoring data updates
    - Event-driven analytics notifications
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.CATALOG_VIEW, Permission.REAL_TIME_UPDATES])
        
        async def generate_analytics_stream():
            """Generate real-time analytics updates"""
            while True:
                try:
                    # Get latest analytics updates
                    updates = await analytics_service.get_real_time_updates(
                        update_types=update_types,
                        user_context={"id": current_user.id, "role": current_user.role},
                        session=session
                    )
                    
                    if updates:
                        # Format as Server-Sent Events
                        for update in updates:
                            yield f"data: {json.dumps(update)}\n\n"
                    
                    await asyncio.sleep(5)  # Update every 5 seconds
                    
                except Exception as e:
                    logger.error(f"Error in analytics stream: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    break
        
        return StreamingResponse(
            generate_analytics_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting analytics stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Private Helper Functions

async def _validate_analytics_request(request: AnalyticsRequest, session: AsyncSession) -> Dict[str, Any]:
    """Validate analytics request parameters"""
    try:
        # Validate analysis type
        valid_types = ["usage", "quality", "business_value", "trends"]
        if request.analysis_type not in valid_types:
            return {"valid": False, "error": f"Invalid analysis type. Must be one of: {valid_types}"}
        
        # Validate scope
        valid_scopes = ["catalog", "domain", "asset_type", "specific"]
        if request.scope not in valid_scopes:
            return {"valid": False, "error": f"Invalid scope. Must be one of: {valid_scopes}"}
        
        # Validate timeframe format
        if not _is_valid_timeframe(request.timeframe):
            return {"valid": False, "error": "Invalid timeframe format"}
        
        return {"valid": True}
        
    except Exception as e:
        return {"valid": False, "error": f"Validation error: {str(e)}"}

def _is_valid_timeframe(timeframe: str) -> bool:
    """Validate timeframe format"""
    valid_units = ['h', 'd', 'w', 'm', 'y']
    if len(timeframe) < 2:
        return False
    
    try:
        number = int(timeframe[:-1])
        unit = timeframe[-1]
        return unit in valid_units and number > 0
    except ValueError:
        return False

# Background Tasks

async def _process_advanced_analytics(
    analysis_id: str,
    analysis_type: str,
    session: AsyncSession
):
    """Process advanced analytics in background"""
    try:
        analytics_service = CatalogAnalyticsService()
        
        # Perform deep learning analysis
        await analytics_service.perform_deep_analysis(analysis_id, analysis_type, session)
        
        # Generate advanced insights
        await analytics_service.generate_advanced_insights(analysis_id, session)
        
        # Update analysis status
        await analytics_service.mark_analysis_complete(analysis_id, session)
        
    except Exception as e:
        logger.error(f"Error in background analytics processing {analysis_id}: {str(e)}")

async def _send_report_to_recipients(
    report_id: str,
    recipients: List[str],
    session: AsyncSession
):
    """Send generated report to recipients"""
    try:
        analytics_service = CatalogAnalyticsService()
        
        # Get report details
        report_details = await analytics_service.get_report_details(report_id, session)
        
        # Send email notifications
        await analytics_service.send_report_notifications(
            report_id,
            recipients,
            report_details,
            session
        )
        
    except Exception as e:
        logger.error(f"Error sending report {report_id} to recipients: {str(e)}")

# Health Check
@router.get("/health")
async def health_check():
    """Health check for catalog analytics service"""
    return {
        "status": "healthy",
        "service": "catalog-analytics",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "usage_analytics",
            "business_value_analysis",
            "trend_forecasting",
            "ai_insights",
            "real_time_metrics",
            "dashboard_generation",
            "report_automation"
        ]
    }