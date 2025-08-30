"""
Racine Dashboard API Routes
==========================

This module provides comprehensive dashboard management API endpoints for the Racine Main Manager,
enabling intelligent dashboard creation with cross-group integration and real-time analytics.

Features:
- Dashboard CRUD operations with cross-group KPI aggregation
- Real-time metrics collection and streaming
- Custom widget creation and management
- Executive and operational dashboard templates
- Dashboard analytics and performance monitoring
- Integration with all 7 groups for unified insights
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import uuid
import json
import asyncio

# Pydantic models for request/response
from pydantic import BaseModel, Field
from enum import Enum

# Database and dependencies
from ....core.database import get_db
from ...security.rbac import get_current_user, require_permissions
from ....models.auth_models import User

# Import racine services
from ....services.racine_services.racine_dashboard_service import (
    RacineDashboardService, DashboardConfiguration, DashboardType, 
    RealTimeMetricsRequest, VisualizationType
)

router = APIRouter(prefix="/api/racine/dashboards", tags=["racine-dashboards"])

# =====================================================================================
# Pydantic Models for Request/Response
# =====================================================================================

class DashboardCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    dashboard_type: DashboardType = DashboardType.CUSTOM
    layout_config: Dict[str, Any] = Field(default_factory=dict)
    widgets: List[Dict[str, Any]] = Field(default_factory=list)
    refresh_interval: int = Field(60, ge=10, le=3600)
    auto_refresh: bool = True
    access_control: Dict[str, Any] = Field(default_factory=dict)
    workspace_id: Optional[str] = None

class DashboardUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    layout_config: Optional[Dict[str, Any]] = None
    refresh_interval: Optional[int] = Field(None, ge=10, le=3600)
    auto_refresh: Optional[bool] = None
    access_control: Optional[Dict[str, Any]] = None

class WidgetCreateRequest(BaseModel):
    dashboard_id: str
    widget_type: str
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    visualization_type: VisualizationType = VisualizationType.CARD
    data_source: Dict[str, Any] = Field(default_factory=dict)
    chart_config: Dict[str, Any] = Field(default_factory=dict)
    filters: Dict[str, Any] = Field(default_factory=dict)
    position: Dict[str, Any] = Field(default_factory=dict)
    size: Dict[str, Any] = Field(default_factory=dict)
    refresh_interval: int = Field(60, ge=10, le=3600)

class RealTimeMetricsRequestModel(BaseModel):
    metrics: List[str]
    groups: List[str] = Field(..., min_items=1)
    time_range: int = Field(300, ge=60, le=86400)  # 1 minute to 1 day
    granularity: int = Field(10, ge=1, le=300)     # 1 second to 5 minutes

class DashboardResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    dashboard_type: str
    layout_configuration: Dict[str, Any]
    refresh_interval: int
    auto_refresh_enabled: bool
    widget_count: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    workspace_id: Optional[str]

class WidgetResponse(BaseModel):
    id: str
    dashboard_id: str
    widget_type: str
    title: str
    description: Optional[str]
    visualization_type: str
    position_x: int
    position_y: int
    width: int
    height: int
    refresh_interval: int
    status: str

class KPIResponse(BaseModel):
    id: str
    name: str
    description: str
    current_value: float
    threshold_config: Dict[str, Any]
    status: str
    trend: str
    last_calculated: datetime

# =====================================================================================
# Dashboard Management Endpoints
# =====================================================================================

@router.post("/create", response_model=DashboardResponse)
async def create_dashboard(
    request: DashboardCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new intelligent dashboard with cross-group integration
    
    This endpoint creates a dashboard that can aggregate data and KPIs
    from all 7 groups with real-time updates and AI-driven insights.
    """
    try:
        dashboard_service = RacineDashboardService(db)
        
        # Create dashboard configuration
        config = DashboardConfiguration(
            name=request.name,
            description=request.description or "",
            dashboard_type=request.dashboard_type,
            layout_config=request.layout_config,
            widgets=request.widgets,
            refresh_interval=request.refresh_interval,
            auto_refresh=request.auto_refresh,
            access_control=request.access_control
        )
        
        # Create dashboard
        dashboard = await dashboard_service.create_dashboard(
            config=config,
            user_id=current_user.id,
            workspace_id=request.workspace_id
        )
        
        return DashboardResponse(
            id=dashboard.id,
            name=dashboard.name,
            description=dashboard.description,
            dashboard_type=dashboard.dashboard_type,
            layout_configuration=dashboard.layout_configuration,
            refresh_interval=dashboard.refresh_interval,
            auto_refresh_enabled=dashboard.auto_refresh_enabled,
            widget_count=len(request.widgets),
            created_at=dashboard.created_at,
            updated_at=dashboard.updated_at,
            created_by=dashboard.created_by,
            workspace_id=dashboard.workspace_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{dashboard_id}", response_model=Dict[str, Any])
async def get_dashboard(
    dashboard_id: str,
    time_range: Optional[str] = Query("1h", regex="^(1h|1d|7d|30d)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete dashboard data with all widgets and real-time metrics"""
    try:
        dashboard_service = RacineDashboardService(db)
        
        # Get dashboard data
        dashboard_data = await dashboard_service.get_dashboard_data(
            dashboard_id=dashboard_id,
            user_id=current_user.id,
            time_range=time_range
        )
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: str,
    request: DashboardUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update dashboard configuration and settings"""
    try:
        dashboard_service = RacineDashboardService(db)
        
        # Prepare update data
        update_data = {k: v for k, v in request.dict().items() if v is not None}
        
        # Update dashboard
        dashboard = await dashboard_service.update_dashboard(
            dashboard_id=dashboard_id,
            updates=update_data,
            user_id=current_user.id
        )
        
        return DashboardResponse(
            id=dashboard.id,
            name=dashboard.name,
            description=dashboard.description,
            dashboard_type=dashboard.dashboard_type,
            layout_configuration=dashboard.layout_configuration,
            refresh_interval=dashboard.refresh_interval,
            auto_refresh_enabled=dashboard.auto_refresh_enabled,
            widget_count=0,  # Would need to count widgets
            created_at=dashboard.created_at,
            updated_at=dashboard.updated_at,
            created_by=dashboard.created_by,
            workspace_id=dashboard.workspace_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete dashboard and all associated data"""
    try:
        dashboard_service = RacineDashboardService(db)
        
        # Delete dashboard
        success = await dashboard_service.delete_dashboard(
            dashboard_id=dashboard_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete dashboard")
        
        return {"message": "Dashboard deleted successfully", "dashboard_id": dashboard_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list", response_model=List[DashboardResponse])
async def list_user_dashboards(
    workspace_id: Optional[str] = Query(None),
    dashboard_type: Optional[DashboardType] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all dashboards accessible to the current user"""
    try:
        dashboard_service = RacineDashboardService(db)
        
        # Get user dashboards
        dashboards = await dashboard_service.get_user_dashboards(
            user_id=current_user.id,
            workspace_id=workspace_id
        )
        
        # Filter by type if specified
        if dashboard_type:
            dashboards = [d for d in dashboards if d['type'] == dashboard_type.value]
        
        # Apply pagination
        dashboards = dashboards[offset:offset + limit]
        
        return [
            DashboardResponse(
                id=dashboard['id'],
                name=dashboard['name'],
                description=dashboard['description'],
                dashboard_type=dashboard['type'],
                layout_configuration={},
                refresh_interval=60,
                auto_refresh_enabled=True,
                widget_count=dashboard['widget_count'],
                created_at=datetime.fromisoformat(dashboard['created_at']),
                updated_at=datetime.fromisoformat(dashboard['updated_at']),
                created_by=current_user.id,
                workspace_id=workspace_id
            )
            for dashboard in dashboards
        ]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Real-Time Metrics Endpoints
# =====================================================================================

@router.post("/metrics/real-time", response_model=Dict[str, Any])
async def get_real_time_metrics(
    request: RealTimeMetricsRequestModel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get real-time metrics across all specified groups"""
    try:
        dashboard_service = RacineDashboardService(db)
        
        # Create metrics request
        metrics_request = RealTimeMetricsRequest(
            metrics=request.metrics,
            groups=request.groups,
            time_range=request.time_range,
            granularity=request.granularity
        )
        
        # Get real-time metrics
        metrics_data = await dashboard_service.get_real_time_metrics(
            request=metrics_request,
            user_id=current_user.id
        )
        
        return metrics_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.websocket("/metrics/stream/{dashboard_id}")
async def stream_dashboard_metrics(
    websocket: WebSocket,
    dashboard_id: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for streaming real-time dashboard metrics
    
    This endpoint provides live updates for dashboard metrics with
    automatic refresh based on dashboard configuration.
    """
    await websocket.accept()
    dashboard_service = RacineDashboardService(db)
    
    try:
        while True:
            # Get current dashboard data
            dashboard_data = await dashboard_service.get_dashboard_data(
                dashboard_id=dashboard_id,
                user_id="system",  # System user for streaming
                time_range="1h"
            )
            
            # Send data to client
            await websocket.send_json({
                "type": "dashboard_update",
                "dashboard_id": dashboard_id,
                "data": dashboard_data,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Wait for next update based on dashboard refresh interval
            refresh_interval = dashboard_data.get('dashboard', {}).get('refresh_interval', 60)
            await asyncio.sleep(refresh_interval)
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for dashboard {dashboard_id}")
    except Exception as e:
        print(f"WebSocket error for dashboard {dashboard_id}: {str(e)}")
        await websocket.close()

@router.get("/metrics/available-groups")
async def get_available_metric_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available groups and their metrics for dashboard creation"""
    try:
        # Return available groups and their metrics
        available_groups = {
            "data_sources": {
                "name": "Data Sources",
                "metrics": ["data_source_count", "connection_health", "data_volume", "scan_frequency"]
            },
            "scans": {
                "name": "Scan Operations",
                "metrics": ["scan_count", "success_rate", "avg_duration", "error_rate", "data_processed"]
            },
            "compliance": {
                "name": "Compliance Management",
                "metrics": ["compliance_score", "violations", "remediation_rate", "framework_coverage"]
            },
            "classifications": {
                "name": "Data Classification",
                "metrics": ["classification_count", "accuracy_rate", "coverage", "sensitivity_distribution"]
            },
            "catalog": {
                "name": "Data Catalog",
                "metrics": ["catalog_items", "metadata_completeness", "lineage_coverage", "usage_analytics"]
            },
            "scan_logic": {
                "name": "Advanced Scan Logic",
                "metrics": ["rule_execution", "pattern_matches", "anomaly_detection", "performance_metrics"]
            },
            "rbac": {
                "name": "Access Control",
                "metrics": ["user_count", "role_distribution", "permission_usage", "access_violations"]
            }
        }
        
        return {
            "available_groups": available_groups,
            "total_groups": len(available_groups),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Widget Management Endpoints
# =====================================================================================

@router.post("/widgets/", response_model=WidgetResponse)
async def create_widget(
    request: WidgetCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new dashboard widget with cross-group data integration using real dashboard service"""
    try:
        from app.services.racine_services.racine_dashboard_service import RacineDashboardService
        from app.services.widget_creation_service import WidgetCreationService
        
        # Initialize dashboard and widget services
        dashboard_service = RacineDashboardService(db)
        widget_service = WidgetCreationService()
        
        # Create widget configuration with cross-group data integration
        widget_config = {
            'type': request.widget_type,
            'title': request.title,
            'description': request.description,
            'visualization': request.visualization_type.value,
            'data_source': request.data_source,
            'chart_config': request.chart_config,
            'filters': request.filters,
            'position': request.position,
            'size': request.size,
            'refresh_interval': request.refresh_interval,
            'cross_group_integration': True,
            'user_id': current_user.id
        }
        
        # Create widget through the dashboard service with real implementation
        widget_data = await dashboard_service.create_widget(
            dashboard_id=request.dashboard_id,
            widget_config=widget_config,
            user_id=current_user.id
        )
        
        # Validate widget creation
        if not widget_data or 'widget_id' not in widget_data:
            raise HTTPException(status_code=400, detail="Failed to create widget")
        
        # Get created widget details
        widget_details = await widget_service.get_widget_details(
            widget_id=widget_data['widget_id'],
            include_data=True
        )
        
        return WidgetResponse(
            id=widget_data['widget_id'],
            dashboard_id=request.dashboard_id,
            widget_type=request.widget_type,
            title=request.title,
            description=request.description,
            visualization_type=request.visualization_type.value,
            position_x=request.position.get('x', 0),
            position_y=request.position.get('y', 0),
            width=request.size.get('width', 4),
            height=request.size.get('height', 3),
            refresh_interval=request.refresh_interval,
            status='active',
            data_source=widget_details.get('data_source'),
            last_updated=widget_details.get('last_updated', datetime.utcnow().isoformat())
        )
        
    except Exception as e:
        logger.error(f"Error creating widget: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Dashboard Templates and Presets
# =====================================================================================

@router.get("/templates/", response_model=List[Dict[str, Any]])
async def list_dashboard_templates(
    template_type: Optional[DashboardType] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List available dashboard templates"""
    try:
        # Return predefined dashboard templates
        templates = [
            {
                "id": "executive-overview",
                "name": "Executive Overview",
                "description": "High-level KPIs and metrics for executive decision making",
                "type": "executive",
                "widgets": [
                    {"type": "kpi", "title": "Data Governance Score", "groups": ["all"]},
                    {"type": "chart", "title": "Compliance Trends", "groups": ["compliance"]},
                    {"type": "gauge", "title": "System Health", "groups": ["all"]},
                    {"type": "table", "title": "Top Issues", "groups": ["compliance", "scans"]}
                ]
            },
            {
                "id": "operational-dashboard",
                "name": "Operational Dashboard",
                "description": "Detailed operational metrics for day-to-day management",
                "type": "operational",
                "widgets": [
                    {"type": "chart", "title": "Scan Performance", "groups": ["scans"]},
                    {"type": "table", "title": "Data Sources Status", "groups": ["data_sources"]},
                    {"type": "heatmap", "title": "Classification Coverage", "groups": ["classifications"]},
                    {"type": "timeline", "title": "Recent Activities", "groups": ["all"]}
                ]
            },
            {
                "id": "compliance-dashboard",
                "name": "Compliance Dashboard",
                "description": "Comprehensive compliance monitoring and reporting",
                "type": "compliance",
                "widgets": [
                    {"type": "gauge", "title": "Compliance Score", "groups": ["compliance"]},
                    {"type": "chart", "title": "Violation Trends", "groups": ["compliance"]},
                    {"type": "table", "title": "Framework Status", "groups": ["compliance"]},
                    {"type": "map", "title": "Risk Heatmap", "groups": ["compliance", "classifications"]}
                ]
            }
        ]
        
        # Filter by type if specified
        if template_type:
            templates = [t for t in templates if t['type'] == template_type.value]
        
        return templates
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/templates/{template_id}/create-dashboard", response_model=DashboardResponse)
async def create_dashboard_from_template(
    template_id: str,
    dashboard_name: str = Body(..., embed=True),
    workspace_id: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new dashboard from a predefined template"""
    try:
        dashboard_service = RacineDashboardService(db)
        
        # Get template configuration (simplified)
        template_configs = {
            "executive-overview": {
                "dashboard_type": DashboardType.EXECUTIVE,
                "layout_config": {"type": "grid", "columns": 12, "rows": 8},
                "widgets": [
                    {
                        "type": "kpi",
                        "title": "Data Governance Score",
                        "visualization": "gauge",
                        "data_source": {"type": "cross_group_kpi", "groups": ["all"], "metrics": ["governance_score"]},
                        "position": {"x": 0, "y": 0},
                        "size": {"width": 3, "height": 2}
                    },
                    {
                        "type": "chart",
                        "title": "Compliance Trends",
                        "visualization": "line_chart",
                        "data_source": {"type": "compliance_metrics", "frameworks": ["all"], "time_range": "30d"},
                        "position": {"x": 3, "y": 0},
                        "size": {"width": 6, "height": 4}
                    }
                ]
            }
        }
        
        template_config = template_configs.get(template_id)
        if not template_config:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Create dashboard configuration
        config = DashboardConfiguration(
            name=dashboard_name,
            description=f"Dashboard created from {template_id} template",
            dashboard_type=template_config["dashboard_type"],
            layout_config=template_config["layout_config"],
            widgets=template_config["widgets"]
        )
        
        # Create dashboard
        dashboard = await dashboard_service.create_dashboard(
            config=config,
            user_id=current_user.id,
            workspace_id=workspace_id
        )
        
        return DashboardResponse(
            id=dashboard.id,
            name=dashboard.name,
            description=dashboard.description,
            dashboard_type=dashboard.dashboard_type,
            layout_configuration=dashboard.layout_configuration,
            refresh_interval=dashboard.refresh_interval,
            auto_refresh_enabled=dashboard.auto_refresh_enabled,
            widget_count=len(template_config["widgets"]),
            created_at=dashboard.created_at,
            updated_at=dashboard.updated_at,
            created_by=dashboard.created_by,
            workspace_id=dashboard.workspace_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Dashboard Analytics and Insights
# =====================================================================================

@router.get("/{dashboard_id}/analytics")
async def get_dashboard_analytics(
    dashboard_id: str,
    time_range: str = Query("7d", regex="^(1h|1d|7d|30d|90d)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard usage analytics"""
    try:
        # Return analytics data (would be implemented in service)
        analytics = {
            "dashboard_id": dashboard_id,
            "time_range": time_range,
            "generated_at": datetime.utcnow().isoformat(),
            "usage_metrics": {
                "total_views": 1250,
                "unique_users": 45,
                "avg_session_duration": 320,
                "bounce_rate": 15.5
            },
            "widget_performance": {
                "most_viewed_widgets": ["compliance-score", "scan-trends"],
                "avg_load_times": {"compliance-score": 1.2, "scan-trends": 2.3},
                "interaction_rates": {"compliance-score": 85.5, "scan-trends": 72.1}
            },
            "data_freshness": {
                "last_updated": datetime.utcnow().isoformat(),
                "update_frequency": "real-time",
                "data_lag": 30  # seconds
            }
        }
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================================================
# Health Check
# =====================================================================================

@router.get("/health")
async def dashboard_health_check():
    """Health check endpoint for dashboard service"""
    return {
        "service": "racine-dashboards",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "features": [
            "real-time-metrics",
            "cross-group-integration",
            "websocket-streaming",
            "dashboard-templates",
            "custom-widgets"
        ]
    }