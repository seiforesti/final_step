"""
Advanced Reporting API Routes for Scan-Rule-Sets Group
====================================================

Comprehensive API endpoints for advanced reporting, analytics, dashboards,
and business intelligence for scan rule management and governance.

Endpoints:
- Executive and operational dashboards
- Advanced analytics and custom reports
- Data visualization and export capabilities
- Scheduled reporting and delivery
- Performance monitoring and insights
- Comparative analysis and benchmarking
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import uuid
import io

from app.db_session import get_db_session
from app.models.Scan_Rule_Sets_completed_models.analytics_reporting_models import (
    AnalyticsType, TrendDirection, ROICategory,
    AnalyticsSummary, ROIDashboard, ComplianceDashboard
)
from app.services.Scan_Rule_Sets_completed_services.advanced_reporting_service import AdvancedReportingService
from app.services.Scan_Rule_Sets_completed_services.roi_calculation_service import ROICalculationService
from ...security.rbac import get_current_user as current_user, require_permissions
from app.utils.rate_limiter import rate_limit
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/reporting", tags=["Advanced Reporting"])

# Initialize services
reporting_service = AdvancedReportingService()
roi_service = ROICalculationService()

# ===================== EXECUTIVE DASHBOARDS =====================

@router.get(
    "/dashboards/executive",
    summary="Get Executive Dashboard",
    description="Generate comprehensive executive dashboard with key metrics, insights, and alerts."
)
@rate_limit(requests=20, window=60)
async def get_executive_dashboard(
    start_date: Optional[datetime] = Query(None, description="Dashboard start date"),
    end_date: Optional[datetime] = Query(None, description="Dashboard end date"),
    organization_id: Optional[uuid.UUID] = Query(None, description="Filter by organization"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Generate comprehensive executive dashboard.
    
    Features:
    - Key performance indicators (KPIs) and metrics
    - Rule governance health scores
    - Compliance status and risk indicators
    - ROI and business value summaries
    - Strategic insights and recommendations
    """
    try:
        time_period = None
        if start_date and end_date:
            time_period = (start_date, end_date)
        
        dashboard = await reporting_service.get_executive_dashboard(
            time_period=time_period,
            organization_id=organization_id,
            db=db
        )
        
        logger.info(f"Generated executive dashboard for user {current_user_data['user_id']}")
        return dashboard
        
    except Exception as e:
        logger.error(f"Error generating executive dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/dashboards/operational",
    summary="Get Operational Dashboard",
    description="Generate operational dashboard for team leads and managers with detailed operational metrics."
)
async def get_operational_dashboard(
    start_date: Optional[datetime] = Query(None, description="Dashboard start date"),
    end_date: Optional[datetime] = Query(None, description="Dashboard end date"),
    team_id: Optional[uuid.UUID] = Query(None, description="Filter by team"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Generate operational dashboard for daily management.
    
    Features:
    - Team performance metrics
    - Rule development and review progress
    - Resource utilization and workload
    - Quality metrics and trends
    - Operational alerts and recommendations
    """
    try:
        time_period = None
        if start_date and end_date:
            time_period = (start_date, end_date)
        
        dashboard = await reporting_service.get_operational_dashboard(
            time_period=time_period,
            team_id=team_id,
            db=db
        )
        
        return dashboard
        
    except Exception as e:
        logger.error(f"Error generating operational dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/dashboards/roi",
    response_model=ROIDashboard,
    summary="Get ROI Dashboard",
    description="Generate comprehensive ROI dashboard with financial metrics and business value analysis."
)
async def get_roi_dashboard(
    start_date: Optional[datetime] = Query(None, description="Dashboard start date"),
    end_date: Optional[datetime] = Query(None, description="Dashboard end date"),
    organization_id: Optional[uuid.UUID] = Query(None, description="Filter by organization"),
    category_filter: Optional[ROICategory] = Query(None, description="Filter by ROI category"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> ROIDashboard:
    """
    Generate comprehensive ROI dashboard.
    
    Features:
    - Total investment and benefit analysis
    - ROI breakdown by category
    - Monthly trends and projections
    - Top performing entities
    - Financial impact assessment
    """
    try:
        time_period = None
        if start_date and end_date:
            time_period = (start_date, end_date)
        
        dashboard = await roi_service.get_roi_dashboard(
            time_period=time_period,
            organization_id=organization_id,
            category_filter=category_filter,
            db=db
        )
        
        return dashboard
        
    except Exception as e:
        logger.error(f"Error generating ROI dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== ADVANCED ANALYTICS =====================

@router.post(
    "/analytics/generate",
    summary="Generate Analytics Report",
    description="Generate advanced analytics report with customizable parameters and output formats."
)
@rate_limit(requests=10, window=60)
async def generate_analytics_report(
    report_type: str = Body(..., description="Type of analytics report"),
    parameters: Dict[str, Any] = Body({}, description="Report parameters"),
    output_format: str = Body("json", description="Output format (json, csv, excel, pdf)"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Generate advanced analytics report with customizable options.
    
    Available report types:
    - rule_performance: Rule performance analysis
    - review_efficiency: Review workflow efficiency
    - compliance_assessment: Compliance status assessment
    - roi_analysis: ROI and business value analysis
    - trend_forecast: Predictive trend analysis
    - usage_patterns: Usage pattern analysis
    """
    try:
        report = await reporting_service.generate_analytics_report(
            report_type=report_type,
            parameters=parameters,
            output_format=output_format,
            db=db
        )
        
        logger.info(f"Generated {report_type} analytics report")
        return report
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating analytics report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/analytics/trends",
    summary="Get Trend Analysis",
    description="Get comprehensive trend analysis with predictive insights and pattern recognition."
)
async def get_trend_analysis(
    entity_type: str = Query(..., description="Type of entity to analyze"),
    metric_type: str = Query(..., description="Type of metric to analyze"),
    start_date: datetime = Query(..., description="Analysis start date"),
    end_date: datetime = Query(..., description="Analysis end date"),
    granularity: str = Query("day", description="Analysis granularity (hour, day, week, month)"),
    forecast_days: int = Query(30, ge=1, le=365, description="Number of days to forecast"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Get comprehensive trend analysis with AI-powered insights.
    
    Features:
    - Historical trend analysis
    - Seasonal pattern detection
    - Anomaly identification
    - Predictive forecasting
    - Statistical significance testing
    """
    try:
        analysis = await reporting_service.get_trend_analysis(
            entity_type=entity_type,
            metric_type=metric_type,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            forecast_days=forecast_days,
            db=db
        )
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error getting trend analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/analytics/comparative",
    summary="Get Comparative Analysis",
    description="Generate comparative analysis between different entities, time periods, or metrics."
)
async def get_comparative_analysis(
    comparison_type: str = Query(..., description="Type of comparison (entities, periods, metrics)"),
    comparison_config: str = Query(..., description="JSON configuration for comparison"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Generate comparative analysis with advanced statistical methods.
    
    Features:
    - Multi-dimensional comparisons
    - Statistical significance testing
    - Performance benchmarking
    - Variance analysis
    - Correlation detection
    """
    try:
        import json
        config = json.loads(comparison_config)
        
        analysis = await reporting_service.get_comparative_analysis(
            comparison_type=comparison_type,
            comparison_config=config,
            db=db
        )
        
        return analysis
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid comparison configuration JSON")
    except Exception as e:
        logger.error(f"Error getting comparative analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== CUSTOM REPORTS =====================

@router.post(
    "/custom-reports",
    summary="Create Custom Report",
    description="Create a custom report based on user-defined specifications and data requirements."
)
@require_permissions(["report_management"])
async def create_custom_report(
    report_definition: Dict[str, Any] = Body(..., description="Custom report definition"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Create custom report with flexible data selection and formatting.
    
    Features:
    - Custom data queries and filters
    - Flexible visualization options
    - Scheduled generation and delivery
    - Template-based reporting
    - Interactive parameter selection
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        custom_report = await reporting_service.create_custom_report(
            report_definition=report_definition,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Created custom report: {custom_report.get('name')}")
        return custom_report
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating custom report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/custom-reports/{report_id}",
    summary="Get Custom Report",
    description="Retrieve and execute a custom report with optional parameter overrides."
)
async def get_custom_report(
    report_id: uuid.UUID = Path(..., description="Custom report ID"),
    parameters: Optional[str] = Query(None, description="JSON parameters to override defaults"),
    output_format: str = Query("json", description="Output format"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Execute custom report with parameter overrides."""
    try:
        param_overrides = {}
        if parameters:
            import json
            param_overrides = json.loads(parameters)
        
        report = await reporting_service.execute_custom_report(
            report_id=report_id,
            parameter_overrides=param_overrides,
            output_format=output_format,
            db=db
        )
        
        return report
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid parameters JSON")
    except Exception as e:
        logger.error(f"Error executing custom report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(
    "/custom-reports/{report_id}/schedule",
    summary="Schedule Custom Report",
    description="Schedule a custom report for automatic generation and delivery."
)
@require_permissions(["report_management"])
async def schedule_custom_report(
    report_id: uuid.UUID = Path(..., description="Custom report ID"),
    schedule_config: Dict[str, Any] = Body(..., description="Schedule configuration"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Schedule custom report for automatic execution and delivery.
    
    Features:
    - Flexible scheduling (daily, weekly, monthly, custom cron)
    - Multiple delivery methods (email, API, file storage)
    - Parameter automation and date shifting
    - Conditional execution based on data availability
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        schedule = await reporting_service.schedule_report(
            report_id=report_id,
            schedule_config=schedule_config,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Scheduled custom report {report_id}")
        return schedule
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error scheduling custom report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== DATA VISUALIZATION =====================

@router.post(
    "/visualizations",
    summary="Generate Data Visualization",
    description="Generate interactive data visualizations with customizable chart types and styling."
)
@rate_limit(requests=30, window=60)
async def generate_visualization(
    chart_type: str = Body(..., description="Type of chart (bar, line, pie, scatter, heatmap, etc.)"),
    data_query: Dict[str, Any] = Body(..., description="Data query configuration"),
    visualization_config: Dict[str, Any] = Body({}, description="Visualization styling and options"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Generate interactive data visualizations.
    
    Features:
    - Multiple chart types and styling options
    - Interactive features and drill-down capabilities
    - Real-time data refresh
    - Export capabilities (PNG, SVG, PDF)
    - Responsive design for different screen sizes
    """
    try:
        visualization = await reporting_service.generate_visualization(
            chart_type=chart_type,
            data_query=data_query,
            visualization_config=visualization_config,
            db=db
        )
        
        return visualization
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating visualization: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/visualizations/templates",
    summary="Get Visualization Templates",
    description="Get available visualization templates for common reporting scenarios."
)
async def get_visualization_templates(
    category: Optional[str] = Query(None, description="Filter by template category"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[Dict[str, Any]]:
    """Get pre-built visualization templates."""
    try:
        templates = await reporting_service.get_visualization_templates(
            category=category,
            db=db
        )
        
        return templates
        
    except Exception as e:
        logger.error(f"Error getting visualization templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== EXPORT AND DELIVERY =====================

@router.get(
    "/export/{report_id}",
    summary="Export Report",
    description="Export a report in various formats (PDF, Excel, CSV) with customizable styling."
)
async def export_report(
    report_id: str = Path(..., description="Report ID or type"),
    format: str = Query("pdf", description="Export format (pdf, excel, csv, json)"),
    parameters: Optional[str] = Query(None, description="JSON parameters for report generation"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> StreamingResponse:
    """
    Export report in specified format.
    
    Features:
    - Multiple export formats
    - Custom styling and branding
    - Compression for large datasets
    - Secure download links
    """
    try:
        param_dict = {}
        if parameters:
            import json
            param_dict = json.loads(parameters)
        
        file_content, content_type, filename = await reporting_service.export_report(
            report_id=report_id,
            export_format=format,
            parameters=param_dict,
            db=db
        )
        
        # Create streaming response
        file_stream = io.BytesIO(file_content)
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid parameters JSON")
    except Exception as e:
        logger.error(f"Error exporting report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(
    "/delivery/email",
    summary="Email Report",
    description="Send a report via email to specified recipients with customizable formatting."
)
@require_permissions(["report_delivery"])
async def email_report(
    background_tasks: BackgroundTasks,
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session),
    report_config: Dict[str, Any] = Body(..., description="Report and email configuration")
) -> Dict[str, Any]:
    """
    Send report via email with professional formatting.
    
    Features:
    - Professional email templates
    - Multiple attachment formats
    - Recipient list management
    - Delivery confirmation tracking
    - Bounce handling and retry logic
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        # Add email delivery task to background
        background_tasks.add_task(
            reporting_service.send_report_email,
            report_config=report_config,
            sender_id=current_user_id,
            db=db
        )
        
        return {
            "status": "queued",
            "message": "Report email has been queued for delivery",
            "estimated_delivery": "within 5 minutes"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error queuing report email: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== PERFORMANCE MONITORING =====================

@router.get(
    "/performance/metrics",
    summary="Get Performance Metrics",
    description="Get comprehensive performance metrics for the reporting system and data sources."
)
@require_permissions(["system_monitoring"])
async def get_performance_metrics(
    start_date: Optional[datetime] = Query(None, description="Metrics start date"),
    end_date: Optional[datetime] = Query(None, description="Metrics end date"),
    metric_types: Optional[str] = Query(None, description="Comma-separated list of metric types"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Get comprehensive performance metrics.
    
    Returns:
    - Report generation times and throughput
    - Data source response times
    - System resource utilization
    - User activity and engagement
    - Error rates and reliability metrics
    """
    try:
        time_period = None
        if start_date and end_date:
            time_period = (start_date, end_date)
        
        metric_type_list = None
        if metric_types:
            metric_type_list = [t.strip() for t in metric_types.split(",")]
        
        metrics = await reporting_service.get_performance_metrics(
            time_period=time_period,
            metric_types=metric_type_list,
            db=db
        )
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error getting performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/health-check",
    summary="Reporting System Health Check",
    description="Perform comprehensive health check of the reporting system and dependencies."
)
async def reporting_health_check(
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Comprehensive health check of reporting system.
    
    Checks:
    - Database connectivity and performance
    - Cache system status
    - External service dependencies
    - Resource availability
    - Recent error rates
    """
    try:
        health_status = await reporting_service.perform_health_check(db=db)
        
        return health_status
        
    except Exception as e:
        logger.error(f"Error performing health check: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== CONFIGURATION AND SETTINGS =====================

@router.get(
    "/settings",
    summary="Get Reporting Settings",
    description="Get current reporting system settings and configuration options."
)
@require_permissions(["system_configuration"])
async def get_reporting_settings(
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Get current reporting system settings."""
    try:
        settings = await reporting_service.get_system_settings(db=db)
        
        return settings
        
    except Exception as e:
        logger.error(f"Error getting reporting settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put(
    "/settings",
    summary="Update Reporting Settings",
    description="Update reporting system settings and configuration options."
)
@require_permissions(["system_configuration"])
async def update_reporting_settings(
    settings_update: Dict[str, Any] = Body(..., description="Settings to update"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Update reporting system settings."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        updated_settings = await reporting_service.update_system_settings(
            settings_update=settings_update,
            updated_by=current_user_id,
            db=db
        )
        
        logger.info(f"Updated reporting settings")
        return updated_settings
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating reporting settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")