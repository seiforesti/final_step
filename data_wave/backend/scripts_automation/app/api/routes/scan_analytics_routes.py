"""
🏢 Enterprise Scan Analytics Routes (Scan Logic Group)
=====================================================

This module provides comprehensive API endpoints for scan analytics with:
- Advanced scan performance analytics and insights
- Comprehensive scan trend analysis and forecasting
- AI-powered scan optimization recommendations
- Real-time scan monitoring and alerting
- Enterprise-grade scan reporting and dashboards

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
from pydantic import BaseModel, Field

# Core dependencies
from ...db_session import get_session
from ...models.scan_models import ScanRule, ScanExecution, ScanResult
from ...models.scan_performance_models import PerformanceMetric, PerformanceHistory
from ...models.scan_intelligence_models import ScanPrediction, ScanAnomalyDetection

# Service dependencies
from ...services.scan_intelligence_service import ScanIntelligenceService
from ...services.scan_performance_optimizer import ScanPerformanceOptimizer
from ...services.comprehensive_analytics_service import ComprehensiveAnalyticsService
from ...services.unified_scan_manager import UnifiedScanManager

# Authentication and authorization
from ...api.security.rbac import get_current_user, require_permission
from ...core.rbac import Permission

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/api/v1/scan-analytics",
    tags=["Scan Analytics", "Scan Logic", "Analytics"],
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

# Request/Response Models

class ScanAnalyticsRequest(BaseModel):
    """Request model for scan analytics"""
    analysis_type: str = Field(..., description="Type of analysis: performance, trends, efficiency, quality")
    scope: str = Field("system", description="Analysis scope: system, rule_set, execution, custom")
    target_ids: Optional[List[str]] = Field(None, description="Specific IDs to analyze")
    timeframe: str = Field("30d", description="Analysis timeframe")
    granularity: str = Field("hourly", description="Data granularity: minute, hourly, daily")
    include_predictions: bool = Field(True, description="Include predictive analytics")
    include_anomalies: bool = Field(True, description="Include anomaly detection")

class PerformanceAnalyticsRequest(BaseModel):
    """Request model for performance analytics"""
    metric_types: List[str] = Field(..., description="Performance metrics to analyze")
    aggregation_method: str = Field("average", description="Aggregation method")
    comparison_baseline: Optional[str] = Field(None, description="Baseline for comparison")
    include_bottlenecks: bool = Field(True, description="Include bottleneck analysis")
    optimization_focus: str = Field("balanced", description="Optimization focus area")

class TrendAnalysisRequest(BaseModel):
    """Request model for trend analysis"""
    trend_dimensions: List[str] = Field(..., description="Dimensions for trend analysis")
    forecasting_horizon: str = Field("30d", description="Forecasting time horizon")
    confidence_level: float = Field(0.95, ge=0.5, le=0.99, description="Confidence level")
    seasonal_analysis: bool = Field(True, description="Include seasonal pattern analysis")
    correlation_analysis: bool = Field(True, description="Include correlation analysis")

class ScanInsightsRequest(BaseModel):
    """Request model for scan insights"""
    insight_categories: List[str] = Field(..., description="Categories of insights to generate")
    priority_threshold: float = Field(0.7, description="Minimum priority threshold")
    actionable_only: bool = Field(False, description="Return only actionable insights")
    business_context: Optional[Dict[str, Any]] = Field(None, description="Business context for insights")

class ReportRequest(BaseModel):
    """Request model for analytics reports"""
    report_type: str = Field(..., description="Type of report to generate")
    sections: List[str] = Field(..., description="Report sections to include")
    format: str = Field("json", description="Report format: json, pdf, excel")
    delivery_method: str = Field("download", description="Delivery method: download, email")
    recipients: Optional[List[str]] = Field(None, description="Email recipients")

# Service Dependencies

def get_scan_intelligence() -> ScanIntelligenceService:
    """Get scan intelligence service"""
    return ScanIntelligenceService()

def get_performance_optimizer() -> ScanPerformanceOptimizer:
    """Get scan performance optimizer"""
    return ScanPerformanceOptimizer()

def get_analytics_service() -> ComprehensiveAnalyticsService:
    """Get comprehensive analytics service"""
    return ComprehensiveAnalyticsService()

def get_unified_manager() -> UnifiedScanManager:
    """Get unified scan manager"""
    return UnifiedScanManager()

# API Endpoints

@router.post("/analyze")
async def perform_scan_analytics(
    request: ScanAnalyticsRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: ComprehensiveAnalyticsService = Depends(get_analytics_service),
    intelligence_service: ScanIntelligenceService = Depends(get_scan_intelligence)
):
    """
    Perform comprehensive scan analytics
    
    This endpoint provides:
    - Multi-dimensional scan analysis and insights
    - Performance trend analysis and optimization
    - Quality assessment and improvement recommendations
    - Efficiency metrics and enhancement opportunities
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.ANALYTICS_VIEW])
        
        # Validate analytics request
        validation_result = await _validate_analytics_request(request, session)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid analytics request: {validation_result['error']}"
            )
        
        # Execute analysis based on type
        if request.analysis_type == "performance":
            analysis_result = await analytics_service.analyze_scan_performance({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "granularity": request.granularity,
                "include_predictions": request.include_predictions,
                "include_anomalies": request.include_anomalies
            }, session)
        
        elif request.analysis_type == "trends":
            analysis_result = await analytics_service.analyze_scan_trends({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "granularity": request.granularity,
                "include_predictions": request.include_predictions,
                "include_anomalies": request.include_anomalies
            }, session)
        
        elif request.analysis_type == "efficiency":
            analysis_result = await analytics_service.analyze_scan_efficiency({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "granularity": request.granularity,
                "include_predictions": request.include_predictions,
                "include_anomalies": request.include_anomalies
            }, session)
        
        elif request.analysis_type == "quality":
            analysis_result = await analytics_service.analyze_scan_quality({
                "scope": request.scope,
                "target_ids": request.target_ids,
                "timeframe": request.timeframe,
                "granularity": request.granularity,
                "include_predictions": request.include_predictions,
                "include_anomalies": request.include_anomalies
            }, session)
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported analysis type: {request.analysis_type}"
            )
        
        if not analysis_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Scan analysis failed: {analysis_result['error']}"
            )
        
        # Generate AI-powered insights
        insights = await intelligence_service.generate_scan_insights(
            analysis_result["analysis_data"],
            request.analysis_type,
            session
        )
        
        # Start background deep analysis
        background_tasks.add_task(
            _perform_deep_analysis,
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
            "trends": analysis_result.get("trends", {}),
            "predictions": analysis_result.get("predictions", {}),
            "anomalies": analysis_result.get("anomalies", []),
            "insights": insights["insights"],
            "recommendations": insights["recommendations"],
            "confidence_score": insights["confidence_score"],
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing scan analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/performance")
async def analyze_scan_performance(
    request: PerformanceAnalyticsRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    performance_optimizer: ScanPerformanceOptimizer = Depends(get_performance_optimizer),
    analytics_service: ComprehensiveAnalyticsService = Depends(get_analytics_service)
):
    """
    Analyze scan performance metrics and optimization opportunities
    
    This endpoint provides:
    - Detailed performance metric analysis
    - Bottleneck identification and resolution
    - Performance optimization recommendations
    - Comparative performance analysis
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.PERFORMANCE_ANALYTICS])
        
        # Validate metric types
        if not request.metric_types:
            raise HTTPException(
                status_code=400,
                detail="At least one metric type must be specified"
            )
        
        # Analyze scan performance
        performance_analysis = await performance_optimizer.analyze_comprehensive_performance({
            "metric_types": request.metric_types,
            "aggregation_method": request.aggregation_method,
            "comparison_baseline": request.comparison_baseline,
            "include_bottlenecks": request.include_bottlenecks,
            "optimization_focus": request.optimization_focus
        }, session)
        
        if not performance_analysis["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Performance analysis failed: {performance_analysis['error']}"
            )
        
        # Generate optimization recommendations
        optimization_recommendations = await performance_optimizer.generate_performance_optimizations(
            performance_analysis["analysis_data"],
            request.optimization_focus,
            session
        )
        
        return {
            "success": True,
            "analysis_id": performance_analysis["analysis_id"],
            "metric_types": request.metric_types,
            "aggregation_method": request.aggregation_method,
            "performance_summary": performance_analysis["performance_summary"],
            "metric_details": performance_analysis["metric_details"],
            "bottlenecks": performance_analysis.get("bottlenecks", []),
            "baseline_comparison": performance_analysis.get("baseline_comparison", {}),
            "optimization_opportunities": optimization_recommendations["opportunities"],
            "recommended_actions": optimization_recommendations["actions"],
            "expected_improvements": optimization_recommendations["expected_improvements"],
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing scan performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trends")
async def analyze_scan_trends(
    request: TrendAnalysisRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: ComprehensiveAnalyticsService = Depends(get_analytics_service),
    intelligence_service: ScanIntelligenceService = Depends(get_scan_intelligence)
):
    """
    Analyze scan trends and generate forecasts
    
    This endpoint provides:
    - Multi-dimensional trend analysis
    - Predictive forecasting with confidence intervals
    - Seasonal pattern recognition
    - Correlation analysis across metrics
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.TREND_ANALYSIS])
        
        # Analyze scan trends
        trend_analysis = await analytics_service.analyze_comprehensive_trends({
            "trend_dimensions": request.trend_dimensions,
            "forecasting_horizon": request.forecasting_horizon,
            "confidence_level": request.confidence_level,
            "seasonal_analysis": request.seasonal_analysis,
            "correlation_analysis": request.correlation_analysis
        }, session)
        
        if not trend_analysis["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Trend analysis failed: {trend_analysis['error']}"
            )
        
        # Generate predictive insights
        predictive_insights = await intelligence_service.generate_predictive_insights(
            trend_analysis["trend_data"],
            request.forecasting_horizon,
            session
        )
        
        return {
            "success": True,
            "analysis_id": trend_analysis["analysis_id"],
            "trend_dimensions": request.trend_dimensions,
            "forecasting_horizon": request.forecasting_horizon,
            "confidence_level": request.confidence_level,
            "trends": trend_analysis["trends"],
            "forecasts": trend_analysis["forecasts"],
            "seasonal_patterns": trend_analysis.get("seasonal_patterns", {}),
            "correlations": trend_analysis.get("correlations", {}),
            "predictive_insights": predictive_insights["insights"],
            "forecast_accuracy": trend_analysis["forecast_accuracy"],
            "trend_indicators": trend_analysis["trend_indicators"],
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing scan trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insights")
async def generate_scan_insights(
    request: ScanInsightsRequest,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    intelligence_service: ScanIntelligenceService = Depends(get_scan_intelligence),
    analytics_service: ComprehensiveAnalyticsService = Depends(get_analytics_service)
):
    """
    Generate AI-powered scan insights and recommendations
    
    This endpoint provides:
    - Intelligent insight generation from scan data
    - Business-context-aware recommendations
    - Priority-based insight ranking
    - Actionable improvement suggestions
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.AI_INSIGHTS])
        
        # Generate scan insights
        insights_result = await intelligence_service.generate_comprehensive_insights({
            "insight_categories": request.insight_categories,
            "priority_threshold": request.priority_threshold,
            "actionable_only": request.actionable_only,
            "business_context": request.business_context or {},
            "user_context": {
                "role": current_user.role,
                "department": getattr(current_user, 'department', None),
                "access_level": current_user.access_level
            }
        }, session)
        
        if not insights_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Insight generation failed: {insights_result['error']}"
            )
        
        # Enhance insights with business context
        enhanced_insights = await analytics_service.enhance_insights_with_context(
            insights_result["insights"],
            request.business_context or {},
            session
        )
        
        return {
            "success": True,
            "insight_categories": request.insight_categories,
            "priority_threshold": request.priority_threshold,
            "insights_generated": len(enhanced_insights["insights"]),
            "insights": enhanced_insights["insights"],
            "summary": {
                "critical": len([i for i in enhanced_insights["insights"] if i["priority"] == "critical"]),
                "high": len([i for i in enhanced_insights["insights"] if i["priority"] == "high"]),
                "medium": len([i for i in enhanced_insights["insights"] if i["priority"] == "medium"]),
                "actionable": len([i for i in enhanced_insights["insights"] if i.get("actionable", False)])
            },
            "business_impact": enhanced_insights["business_impact"],
            "recommended_actions": enhanced_insights["recommended_actions"],
            "confidence_score": enhanced_insights["confidence_score"],
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating scan insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_scan_analytics_dashboard(
    dashboard_type: str = Query("overview", description="Dashboard type"),
    timeframe: str = Query("24h", description="Dashboard timeframe"),
    refresh_data: bool = Query(False, description="Force data refresh"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: ComprehensiveAnalyticsService = Depends(get_analytics_service)
):
    """
    Get comprehensive scan analytics dashboard
    
    This endpoint provides:
    - Real-time scan analytics dashboard
    - Customizable dashboard views and widgets
    - Interactive charts and visualizations
    - Role-based dashboard personalization
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.DASHBOARD_VIEW])
        
        # Get dashboard data
        dashboard_data = await analytics_service.get_scan_analytics_dashboard({
            "dashboard_type": dashboard_type,
            "timeframe": timeframe,
            "user_role": current_user.role,
            "refresh_data": refresh_data,
            "personalization": {
                "user_id": current_user.id,
                "preferences": getattr(current_user, 'dashboard_preferences', {})
            }
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
            "overview_metrics": dashboard_data["overview_metrics"],
            "performance_charts": dashboard_data["performance_charts"],
            "trend_widgets": dashboard_data["trend_widgets"],
            "alert_summary": dashboard_data["alert_summary"],
            "quick_insights": dashboard_data["quick_insights"],
            "personalized_views": dashboard_data.get("personalized_views", []),
            "export_options": dashboard_data["export_options"],
            "refresh_interval": dashboard_data["refresh_interval"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating scan analytics dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/generate")
async def generate_analytics_report(
    request: ReportRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: ComprehensiveAnalyticsService = Depends(get_analytics_service)
):
    """
    Generate comprehensive scan analytics reports
    
    This endpoint provides:
    - Custom analytics report generation
    - Multiple report formats and delivery options
    - Automated report scheduling and distribution
    - Template-based and custom report creation
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.REPORT_GENERATE])
        
        # Validate report request
        if not request.sections:
            raise HTTPException(
                status_code=400,
                detail="At least one report section must be specified"
            )
        
        # Generate analytics report
        report_result = await analytics_service.generate_scan_analytics_report({
            "report_type": request.report_type,
            "sections": request.sections,
            "format": request.format,
            "user_id": current_user.id,
            "generation_parameters": {
                "include_charts": True,
                "include_recommendations": True,
                "detail_level": "comprehensive"
            }
        }, session)
        
        if not report_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Report generation failed: {report_result['error']}"
            )
        
        # Handle delivery method
        if request.delivery_method == "email" and request.recipients:
            background_tasks.add_task(
                _deliver_report_via_email,
                report_result["report_id"],
                request.recipients,
                session
            )
        
        return {
            "success": True,
            "report_id": report_result["report_id"],
            "report_type": request.report_type,
            "format": request.format,
            "sections": request.sections,
            "download_url": report_result["download_url"],
            "file_size": report_result["file_size"],
            "delivery_method": request.delivery_method,
            "recipients": request.recipients if request.delivery_method == "email" else None,
            "generation_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating analytics report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/real-time")
async def get_real_time_scan_metrics(
    metric_categories: List[str] = Query(..., description="Metric categories to retrieve"),
    aggregation_window: str = Query("5m", description="Aggregation time window"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    unified_manager: UnifiedScanManager = Depends(get_unified_manager)
):
    """
    Get real-time scan metrics and KPIs
    
    This endpoint provides:
    - Live scan performance metrics
    - Real-time system health indicators
    - Current resource utilization metrics
    - Active scan monitoring data
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.REAL_TIME_METRICS])
        
        # Get real-time metrics
        metrics_result = await unified_manager.get_real_time_scan_metrics({
            "metric_categories": metric_categories,
            "aggregation_window": aggregation_window,
            "include_trends": True,
            "include_alerts": True
        }, session)
        
        if not metrics_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get real-time metrics: {metrics_result['error']}"
            )
        
        return {
            "success": True,
            "metric_categories": metric_categories,
            "aggregation_window": aggregation_window,
            "metrics": metrics_result["metrics"],
            "system_health": metrics_result["system_health"],
            "active_scans": metrics_result["active_scans"],
            "resource_utilization": metrics_result["resource_utilization"],
            "alerts": metrics_result["alerts"],
            "trends": metrics_result["trends"],
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting real-time scan metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream/analytics")
async def stream_scan_analytics(
    stream_types: List[str] = Query(["metrics", "alerts", "insights"], description="Types of data to stream"),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
    analytics_service: ComprehensiveAnalyticsService = Depends(get_analytics_service)
):
    """
    Stream real-time scan analytics updates
    
    This endpoint provides:
    - Live analytics data streaming
    - Real-time metric updates and alerts
    - Continuous insight generation
    - Event-driven analytics notifications
    """
    try:
        # Validate user permissions
        await require_permissions(current_user, [Permission.SCAN_VIEW, Permission.REAL_TIME_UPDATES])
        
        async def generate_analytics_stream():
            """Generate real-time analytics updates"""
            while True:
                try:
                    # Get latest analytics updates
                    updates = await analytics_service.get_real_time_analytics_updates(
                        stream_types=stream_types,
                        user_context={"id": current_user.id, "role": current_user.role},
                        session=session
                    )
                    
                    if updates:
                        # Format as Server-Sent Events
                        for update in updates:
                            yield f"data: {json.dumps(update)}\n\n"
                    
                    await asyncio.sleep(3)  # Update every 3 seconds
                    
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

async def _validate_analytics_request(request: ScanAnalyticsRequest, session: AsyncSession) -> Dict[str, Any]:
    """Validate analytics request parameters"""
    try:
        # Validate analysis type
        valid_types = ["performance", "trends", "efficiency", "quality"]
        if request.analysis_type not in valid_types:
            return {"valid": False, "error": f"Invalid analysis type. Must be one of: {valid_types}"}
        
        # Validate scope
        valid_scopes = ["system", "rule_set", "execution", "custom"]
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
    valid_units = ['m', 'h', 'd', 'w', 'M', 'y']
    if len(timeframe) < 2:
        return False
    
    try:
        number = int(timeframe[:-1])
        unit = timeframe[-1]
        return unit in valid_units and number > 0
    except ValueError:
        return False

# Background Tasks

async def _perform_deep_analysis(
    analysis_id: str,
    analysis_type: str,
    session: AsyncSession
):
    """Perform deep analysis in background"""
    try:
        analytics_service = ComprehensiveAnalyticsService()
        
        # Perform advanced AI analysis
        await analytics_service.perform_deep_ai_analysis(analysis_id, analysis_type, session)
        
        # Generate predictive models
        await analytics_service.generate_predictive_models(analysis_id, session)
        
        # Update analysis with deep insights
        await analytics_service.finalize_deep_analysis(analysis_id, session)
        
    except Exception as e:
        logger.error(f"Error in deep analysis {analysis_id}: {str(e)}")

async def _deliver_report_via_email(
    report_id: str,
    recipients: List[str],
    session: AsyncSession
):
    """Deliver report via email"""
    try:
        analytics_service = ComprehensiveAnalyticsService()
        
        # Send report to recipients
        await analytics_service.send_report_via_email(
            report_id,
            recipients,
            session
        )
        
    except Exception as e:
        logger.error(f"Error delivering report {report_id} via email: {str(e)}")

# Health Check
@router.get("/reports")
async def get_analytics_reports(
    report_types: List[str] = Query(default=["performance", "trends", "business_intelligence"]),
    timeframe: str = Query(default="30d"),
    include_insights: bool = Query(default=True),
    include_recommendations: bool = Query(default=True),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get existing analytics reports"""
    try:
        # Permission check
        if not await require_permissions([Permission.SCAN_ANALYTICS_VIEW], current_user):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get analytics service
        analytics_service = ComprehensiveAnalyticsService(session)
        
        # Fetch reports
        reports = await analytics_service.get_analytics_reports(
            report_types=report_types,
            timeframe=timeframe,
            include_insights=include_insights,
            include_recommendations=include_recommendations,
            user_id=current_user.id
        )
        
        return {"reports": reports, "total": len(reports)}
        
    except Exception as e:
        logger.error(f"Error fetching analytics reports: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics reports: {str(e)}")

@router.get("/visualizations")
async def get_analytics_visualizations(
    visualization_types: List[str] = Query(default=["line_chart", "bar_chart", "pie_chart", "heatmap"]),
    timeframe: str = Query(default="30d"),
    include_data: bool = Query(default=True),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get analytics visualizations"""
    try:
        # Permission check
        if not await require_permissions([Permission.SCAN_ANALYTICS_VIEW], current_user):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get analytics service
        analytics_service = ComprehensiveAnalyticsService(session)
        
        # Fetch visualizations
        visualizations = await analytics_service.get_analytics_visualizations(
            visualization_types=visualization_types,
            timeframe=timeframe,
            include_data=include_data,
            user_id=current_user.id
        )
        
        return {"visualizations": visualizations, "total": len(visualizations)}
        
    except Exception as e:
        logger.error(f"Error fetching analytics visualizations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics visualizations: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for scan analytics service"""
    return {
        "status": "healthy",
        "service": "scan-analytics",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "comprehensive_analytics",
            "performance_analysis",
            "trend_forecasting",
            "ai_insights",
            "real_time_metrics",
            "dashboard_generation",
            "report_automation"
        ]
    }