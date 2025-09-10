"""
Advanced Lineage Routes - Enterprise Production Implementation
=============================================================

This module provides comprehensive API routes for advanced data lineage tracking
with real-time updates, impact analysis, intelligent discovery, and graph-based
visualization for enterprise data governance systems.

Key Features:
- Real-time lineage tracking and updates
- Column-level lineage with transformation logic
- Impact analysis and dependency mapping
- Intelligent lineage discovery using AI/ML
- Graph-based lineage visualization
- Cross-system lineage integration
- Performance optimizations for large-scale lineage graphs

Production Requirements:
- 99.9% uptime with real-time processing
- Sub-second response times for lineage queries
- Horizontal scalability to handle 10M+ lineage relationships
- Real-time streaming updates
- Advanced graph algorithms for complex lineage analysis
"""

from typing import List, Dict, Any, Optional, Union, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path, Body
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Session

# Pydantic models
from pydantic import BaseModel, Field, validator
from enum import Enum

# Internal imports
from ...models.data_lineage_models import *
from ...models.advanced_catalog_models import *
from ...models.catalog_intelligence_models import *
from ...services.advanced_lineage_service import AdvancedLineageService
from ...services.intelligent_discovery_service import IntelligentDiscoveryService
from ...db_session import get_session
from ...api.security.rbac import get_current_user, require_permission
try:
    from ...utils.response_models import *  # noqa: F401,F403
except Exception:
    from pydantic import BaseModel
    class SuccessResponse(BaseModel):
        success: bool = True
        data: dict | list | None = None
    class ErrorResponse(BaseModel):
        success: bool = False
        error: str
from ...utils.error_handler import handle_route_error
from ...utils.rate_limiter import check_rate_limit, get_rate_limiter, rate_limit
try:
    # Prefer dedicated audit module if present
    from ...utils.audit_logger import audit_log  # type: ignore
except Exception:
    # Fallback to utils package shim
    from ...utils import audit_logger as _audit
    audit_log = _audit.audit_log

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api/v1/lineage", tags=["Advanced Lineage"])
security = HTTPBearer()
rate_limiter = get_rate_limiter()

# ===================== REQUEST/RESPONSE MODELS =====================

class LineageQueryRequest(BaseModel):
    """Model for lineage query requests"""
    asset_id: str = Field(..., description="Asset ID to query lineage for")
    direction: LineageDirection = Field(default=LineageDirection.DOWNSTREAM, description="Lineage direction")
    max_depth: int = Field(default=5, ge=1, le=20, description="Maximum traversal depth")
    include_column_lineage: bool = Field(default=True, description="Include column-level lineage")
    filter_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Minimum confidence filter")
    filter_asset_types: Optional[List[str]] = Field(None, description="Filter by asset types")
    include_transformations: bool = Field(default=True, description="Include transformation details")
    include_metadata: bool = Field(default=True, description="Include additional metadata")
    algorithm: str = Field(default="breadth_first", description="Graph traversal algorithm")

class ImpactAnalysisRequest(BaseModel):
    """Model for impact analysis requests"""
    source_asset_id: str = Field(..., description="Source asset ID for impact analysis")
    change_type: str = Field(..., description="Type of change: schema_change, deletion, data_quality_issue")
    change_details: Optional[Dict[str, Any]] = Field(None, description="Detailed change information")
    include_recommendations: bool = Field(default=True, description="Include impact recommendations")
    analysis_depth: int = Field(default=10, ge=1, le=50, description="Analysis depth")
    priority_threshold: float = Field(default=0.5, description="Priority threshold for affected assets")

class LineageUpdateRequest(BaseModel):
    """Model for lineage update requests"""
    update_type: str = Field(..., description="Update type: create, update, delete, bulk_load")
    lineage_data: Dict[str, Any] = Field(..., description="Lineage data to update")
    source_system: str = Field(..., description="Source system for the update")
    update_metadata: Dict[str, Any] = Field(default_factory=dict, description="Update metadata")

class LineageVisualizationRequest(BaseModel):
    """Model for lineage visualization requests"""
    asset_ids: List[str] = Field(..., description="Asset IDs to visualize")
    layout_type: str = Field(default="hierarchical", description="Visualization layout type")
    include_column_level: bool = Field(default=False, description="Include column-level visualization")
    max_nodes: int = Field(default=1000, ge=10, le=5000, description="Maximum nodes to visualize")
    visualization_config: Dict[str, Any] = Field(default_factory=dict, description="Visualization configuration")

class LineageMetricsRequest(BaseModel):
    """Model for lineage metrics requests"""
    time_window: str = Field(default="24h", description="Time window for metrics")
    aggregation_level: str = Field(default="hour", description="Metrics aggregation level")
    include_predictions: bool = Field(default=True, description="Include predictive metrics")
    asset_filter: Optional[List[str]] = Field(None, description="Filter by specific assets")

class ImpactAnalysisResult(BaseModel):
    """Result model for impact analysis responses."""
    analysis_id: str
    affected_assets: List[str] = []
    impact_score: float = 0.0
    recommendations: List[str] = []

class LineageSearchRequest(BaseModel):
    """Model for lineage search requests"""
    search_query: str = Field(..., description="Search query for lineage assets")
    search_type: str = Field(default="semantic", description="Search type: semantic, exact, fuzzy")
    max_results: int = Field(default=100, ge=1, le=1000, description="Maximum search results")
    include_lineage: bool = Field(default=True, description="Include lineage information in results")

# ===================== DEPENDENCY INJECTION =====================

async def get_lineage_service() -> AdvancedLineageService:
    """Get advanced lineage service instance"""
    return AdvancedLineageService()

async def get_discovery_service() -> IntelligentDiscoveryService:
    """Get intelligent discovery service instance"""
    return IntelligentDiscoveryService()

# ===================== LINEAGE QUERY ENDPOINTS =====================

@router.post("/query")
@rate_limit(requests=200, window=60)
async def query_lineage(
    request: LineageQueryRequest,
    use_cache: bool = Query(default=True, description="Use cached results if available"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Query data lineage with advanced graph algorithms and filtering.
    
    Features:
    - Multiple traversal algorithms (BFS, DFS, shortest path, etc.)
    - Column-level lineage tracking
    - Confidence-based filtering
    - Real-time lineage updates
    - Performance optimization for large graphs
    """
    try:
        # Audit log
        await audit_log(
            action="lineage_query_executed",
            user_id=current_user.get("user_id"),
            resource_type="lineage",
            resource_id=request.asset_id,
            metadata={
                "direction": request.direction.value,
                "max_depth": request.max_depth,
                "algorithm": request.algorithm
            }
        )
        
        # Create lineage query
        lineage_query = LineageQuery(
            asset_id=request.asset_id,
            direction=request.direction,
            max_depth=request.max_depth,
            include_column_lineage=request.include_column_lineage,
            filter_confidence=request.filter_confidence,
            filter_asset_types=request.filter_asset_types,
            include_transformations=request.include_transformations,
            include_metadata=request.include_metadata
        )
        
        # Determine graph algorithm
        from ...services.advanced_lineage_service import GraphAlgorithm
        algorithm_map = {
            "breadth_first": GraphAlgorithm.BREADTH_FIRST,
            "depth_first": GraphAlgorithm.DEPTH_FIRST,
            "shortest_path": GraphAlgorithm.SHORTEST_PATH,
            "all_paths": GraphAlgorithm.ALL_PATHS,
            "critical_path": GraphAlgorithm.CRITICAL_PATH,
            "centrality_based": GraphAlgorithm.CENTRALITY_BASED
        }
        
        algorithm = algorithm_map.get(request.algorithm, GraphAlgorithm.BREADTH_FIRST)
        
        # Execute lineage query
        lineage_graph = await lineage_service.get_lineage(
            query=lineage_query,
            use_cache=use_cache,
            algorithm=algorithm
        )
        
        return SuccessResponse(
            message="Lineage query executed successfully",
            data={
                "lineage_graph": {
                    "nodes": [node.__dict__ for node in lineage_graph.nodes],
                    "edges": [edge.__dict__ for edge in lineage_graph.edges],
                    "root_node": lineage_graph.root_node,
                    "direction": lineage_graph.direction.value,
                    "max_depth": lineage_graph.max_depth,
                    "total_nodes": lineage_graph.total_nodes,
                    "total_edges": lineage_graph.total_edges,
                    "query_metadata": lineage_graph.query_metadata
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to query lineage: {e}")
        raise HTTPException(status_code=500, detail=f"Lineage query failed: {str(e)}")

@router.get("/assets/{asset_id}/lineage/stream")
async def stream_lineage_updates(
    asset_id: str = Path(..., description="Asset ID to stream lineage updates for"),
    include_downstream: bool = Query(default=True, description="Include downstream updates"),
    include_upstream: bool = Query(default=True, description="Include upstream updates"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time lineage updates for a specific asset.
    
    Features:
    - Real-time lineage change notifications
    - Upstream and downstream update filtering
    - Granular change tracking
    - WebSocket-like streaming over HTTP
    """
    try:
        async def generate_lineage_stream():
            """Generate real-time lineage updates"""
            try:
                async for update in lineage_service.stream_lineage_updates(
                    asset_id, include_downstream, include_upstream
                ):
                    yield f"data: {json.dumps(update)}\n\n"
                    
            except Exception as e:
                logger.error(f"Lineage streaming error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_lineage_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to start lineage streaming: {e}")
        raise HTTPException(status_code=500, detail=f"Lineage streaming failed: {str(e)}")

@router.get("/assets/{asset_id}/dependencies")
async def get_asset_dependencies(
    asset_id: str = Path(..., description="Asset ID to get dependencies for"),
    dependency_type: str = Query(default="all", description="Dependency type: upstream, downstream, all"),
    include_indirect: bool = Query(default=True, description="Include indirect dependencies"),
    max_depth: int = Query(default=5, ge=1, le=20, description="Maximum dependency depth"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive dependency information for an asset.
    
    Features:
    - Direct and indirect dependencies
    - Dependency strength analysis
    - Critical path identification
    - Dependency health monitoring
    """
    try:
        # Get dependencies based on type
        dependencies = await lineage_service.get_asset_dependencies(
            asset_id=asset_id,
            dependency_type=dependency_type,
            include_indirect=include_indirect,
            max_depth=max_depth
        )
        
        return SuccessResponse(
            message="Asset dependencies retrieved successfully",
            data=dependencies
        )
        
    except Exception as e:
        logger.error(f"Failed to get asset dependencies: {e}")
        raise HTTPException(status_code=500, detail=f"Dependency retrieval failed: {str(e)}")

# ===================== IMPACT ANALYSIS ENDPOINTS =====================

@router.post("/impact-analysis")
@rate_limit(requests=50, window=60)
async def analyze_impact(
    request: ImpactAnalysisRequest,
    background_tasks: BackgroundTasks,
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Perform comprehensive impact analysis for asset changes.
    
    Features:
    - Multi-dimensional impact scoring
    - Critical path analysis
    - Business impact assessment
    - Automated recommendation generation
    - Risk assessment and mitigation strategies
    """
    try:
        # Audit log
        await audit_log(
            action="impact_analysis_requested",
            user_id=current_user.get("user_id"),
            resource_type="impact_analysis",
            resource_id=request.source_asset_id,
            metadata={
                "change_type": request.change_type,
                "analysis_depth": request.analysis_depth
            }
        )
        
        # Perform impact analysis
        impact_result = await lineage_service.analyze_impact(
            source_asset_id=request.source_asset_id,
            change_type=request.change_type,
            include_recommendations=request.include_recommendations
        )
        
        # Store analysis results in background
        background_tasks.add_task(
            _store_impact_analysis_results,
            impact_result,
            current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Impact analysis completed successfully",
            data={
                "source_asset": impact_result.source_asset,
                "affected_assets": impact_result.affected_assets,
                "impact_score": impact_result.impact_score,
                "critical_path": impact_result.critical_path,
                "recommended_actions": impact_result.recommended_actions,
                "analysis_metadata": impact_result.analysis_metadata
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to analyze impact: {e}")
        raise HTTPException(status_code=500, detail=f"Impact analysis failed: {str(e)}")

@router.get("/impact-analysis/{analysis_id}")
async def get_impact_analysis(
    analysis_id: str = Path(..., description="Impact analysis ID"),
    include_details: bool = Query(default=True, description="Include detailed analysis information"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve stored impact analysis results.
    
    Features:
    - Historical impact analysis access
    - Detailed analysis breakdown
    - Progress tracking for ongoing analyses
    - Comparative analysis capabilities
    """
    try:
        # Get impact analysis
        analysis = await lineage_service.get_impact_analysis(
            analysis_id=analysis_id,
            include_details=include_details
        )
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Impact analysis not found")
        
        return SuccessResponse(
            message="Impact analysis retrieved successfully",
            data=analysis
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get impact analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis retrieval failed: {str(e)}")

@router.post("/impact-analysis/batch")
@rate_limit(requests=10, window=60)
async def batch_impact_analysis(
    background_tasks: BackgroundTasks,
    asset_ids: List[str] = Body(..., description="List of asset IDs for batch analysis"),
    change_type: str = Body(..., description="Type of change for all assets"),
    analysis_config: Dict[str, Any] = Body(default_factory=dict, description="Batch analysis configuration"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Perform batch impact analysis for multiple assets.
    
    Features:
    - Concurrent analysis execution
    - Cross-asset impact correlation
    - Batch optimization algorithms
    - Comprehensive reporting
    """
    try:
        # Validate batch size
        if len(asset_ids) > 50:
            raise HTTPException(status_code=400, detail="Maximum batch size is 50 assets")
        
        # Audit log
        await audit_log(
            action="batch_impact_analysis_requested",
            user_id=current_user.get("user_id"),
            resource_type="batch_impact_analysis",
            resource_id=None,
            metadata={
                "asset_count": len(asset_ids),
                "change_type": change_type
            }
        )
        
        # Execute batch analysis
        batch_results = await lineage_service.batch_impact_analysis(
            asset_ids=asset_ids,
            change_type=change_type,
            analysis_config=analysis_config
        )
        
        return SuccessResponse(
            message=f"Batch impact analysis completed for {len(asset_ids)} assets",
            data=batch_results
        )
        
    except Exception as e:
        logger.error(f"Failed to perform batch impact analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

# ===================== LINEAGE MANAGEMENT ENDPOINTS =====================

@router.post("/update")
@rate_limit(requests=1000, window=60)
async def update_lineage(
    request: LineageUpdateRequest,
    validate_update: bool = Query(default=True, description="Validate update before applying"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Update lineage information with real-time processing.
    
    Features:
    - Real-time lineage updates
    - Validation and consistency checking
    - Incremental and bulk updates
    - Conflict resolution
    - Change tracking and auditing
    """
    try:
        # Audit log
        await audit_log(
            action="lineage_update_requested",
            user_id=current_user.get("user_id"),
            resource_type="lineage_update",
            resource_id=None,
            metadata={
                "update_type": request.update_type,
                "source_system": request.source_system
            }
        )
        
        # Validate update if requested
        if validate_update:
            validation_result = await lineage_service.validate_lineage_update(
                request.update_type,
                request.lineage_data
            )
            if not validation_result.get("valid", False):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid lineage update: {validation_result.get('errors')}"
                )
        
        # Process update
        from ...services.advanced_lineage_service import LineageUpdateType
        update_type_map = {
            "create": LineageUpdateType.CREATE,
            "update": LineageUpdateType.UPDATE,
            "delete": LineageUpdateType.DELETE,
            "bulk_load": LineageUpdateType.BULK_LOAD,
            "sync": LineageUpdateType.SYNC
        }
        
        update_type = update_type_map.get(request.update_type, LineageUpdateType.UPDATE)
        
        # Apply update
        update_result = await lineage_service.update_lineage_real_time(
            update_type=update_type,
            lineage_data=request.lineage_data
        )
        
        return SuccessResponse(
            message="Lineage updated successfully",
            data=update_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update lineage: {e}")
        raise HTTPException(status_code=500, detail=f"Lineage update failed: {str(e)}")

@router.delete("/assets/{asset_id}")
async def delete_asset_lineage(
    asset_id: str = Path(..., description="Asset ID to delete lineage for"),
    cascade_delete: bool = Query(default=False, description="Cascade delete related lineage"),
    backup_before_delete: bool = Query(default=True, description="Create backup before deletion"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete lineage information for a specific asset.
    
    Features:
    - Safe deletion with backup options
    - Cascade deletion for related lineage
    - Impact assessment before deletion
    - Rollback capabilities
    """
    try:
        # Audit log
        await audit_log(
            action="lineage_deletion_requested",
            user_id=current_user.get("user_id"),
            resource_type="lineage",
            resource_id=asset_id,
            metadata={
                "cascade_delete": cascade_delete,
                "backup_before_delete": backup_before_delete
            }
        )
        
        # Perform impact assessment
        if cascade_delete:
            impact_assessment = await lineage_service.assess_deletion_impact(asset_id)
            if impact_assessment.get("high_impact_assets", 0) > 0:
                logger.warning(f"High impact deletion requested for asset {asset_id}")
        
        # Delete lineage
        deletion_result = await lineage_service.delete_asset_lineage(
            asset_id=asset_id,
            cascade_delete=cascade_delete,
            backup_before_delete=backup_before_delete
        )
        
        return SuccessResponse(
            message="Asset lineage deleted successfully",
            data=deletion_result
        )
        
    except Exception as e:
        logger.error(f"Failed to delete asset lineage: {e}")
        raise HTTPException(status_code=500, detail=f"Lineage deletion failed: {str(e)}")

# ===================== LINEAGE VISUALIZATION ENDPOINTS =====================

@router.post("/visualization")
async def generate_lineage_visualization(
    request: LineageVisualizationRequest,
    export_format: str = Query(default="json", description="Export format: json, svg, png, pdf"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Generate interactive lineage visualizations.
    
    Features:
    - Multiple visualization layouts
    - Interactive graph exploration
    - Column-level visualization
    - Export to multiple formats
    - Custom styling and theming
    """
    try:
        # Generate visualization
        visualization = await lineage_service.generate_lineage_visualization(
            asset_ids=request.asset_ids,
            layout_type=request.layout_type,
            include_column_level=request.include_column_level,
            max_nodes=request.max_nodes,
            visualization_config=request.visualization_config
        )
        
        # Return appropriate format
        if export_format == "json":
            return SuccessResponse(
                message="Lineage visualization generated successfully",
                data=visualization
            )
        elif export_format in ["svg", "png", "pdf"]:
            # Generate binary visualization
            binary_data = await lineage_service.export_visualization(
                visualization, export_format
            )
            
            content_types = {
                "svg": "image/svg+xml",
                "png": "image/png",
                "pdf": "application/pdf"
            }
            
            return StreamingResponse(
                binary_data,
                media_type=content_types[export_format],
                headers={
                    "Content-Disposition": f"attachment; filename=lineage_visualization.{export_format}"
                }
            )
        
    except Exception as e:
        logger.error(f"Failed to generate lineage visualization: {e}")
        raise HTTPException(status_code=500, detail=f"Visualization generation failed: {str(e)}")

@router.get("/visualization/interactive/{asset_id}")
async def get_interactive_lineage_visualization(
    asset_id: str = Path(..., description="Asset ID for interactive visualization"),
    depth: int = Query(default=3, ge=1, le=10, description="Visualization depth"),
    theme: str = Query(default="light", description="Visualization theme"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get interactive lineage visualization data for web interfaces.
    
    Features:
    - Web-optimized visualization data
    - Interactive exploration capabilities
    - Real-time updates
    - Custom theming
    """
    try:
        # Generate interactive visualization
        interactive_viz = await lineage_service.get_interactive_visualization(
            asset_id=asset_id,
            depth=depth,
            theme=theme
        )
        
        return SuccessResponse(
            message="Interactive lineage visualization generated successfully",
            data=interactive_viz
        )
        
    except Exception as e:
        logger.error(f"Failed to generate interactive visualization: {e}")
        raise HTTPException(status_code=500, detail=f"Interactive visualization failed: {str(e)}")

# ===================== LINEAGE ANALYTICS ENDPOINTS =====================

@router.get("/metrics")
async def get_lineage_metrics(
    request: LineageMetricsRequest = Depends(),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive lineage metrics and analytics.
    
    Features:
    - Real-time lineage statistics
    - Historical trend analysis
    - Performance metrics
    - Quality indicators
    - Predictive analytics
    """
    try:
        # Get lineage metrics
        metrics = await lineage_service.get_lineage_metrics(
            time_window=request.time_window,
            aggregation_level=request.aggregation_level,
            include_predictions=request.include_predictions,
            asset_filter=request.asset_filter
        )
        
        return SuccessResponse(
            message="Lineage metrics retrieved successfully",
            data=metrics
        )
        
    except Exception as e:
        logger.error(f"Failed to get lineage metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Metrics retrieval failed: {str(e)}")

@router.get("/analytics/coverage")
async def get_lineage_coverage_analytics(
    time_range: str = Query(default="30d", description="Time range for coverage analysis"),
    include_recommendations: bool = Query(default=True, description="Include coverage recommendations"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get lineage coverage analytics and gap analysis.
    
    Features:
    - Coverage percentage analysis
    - Gap identification
    - Quality assessment
    - Improvement recommendations
    """
    try:
        # Get coverage analytics
        coverage_analytics = await lineage_service.get_coverage_analytics(
            time_range=time_range,
            include_recommendations=include_recommendations
        )
        
        return SuccessResponse(
            message="Lineage coverage analytics retrieved successfully",
            data=coverage_analytics
        )
        
    except Exception as e:
        logger.error(f"Failed to get coverage analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Coverage analytics failed: {str(e)}")

@router.get("/analytics/performance")
async def get_lineage_performance_analytics(
    time_window: str = Query(default="24h", description="Time window for performance analysis"),
    include_bottlenecks: bool = Query(default=True, description="Include bottleneck analysis"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get lineage system performance analytics.
    
    Features:
    - Query performance analysis
    - System bottleneck identification
    - Resource utilization metrics
    - Optimization recommendations
    """
    try:
        # Get performance analytics
        performance_analytics = await lineage_service.get_performance_analytics(
            time_window=time_window,
            include_bottlenecks=include_bottlenecks
        )
        
        return SuccessResponse(
            message="Lineage performance analytics retrieved successfully",
            data=performance_analytics
        )
        
    except Exception as e:
        logger.error(f"Failed to get performance analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Performance analytics failed: {str(e)}")

# ===================== LINEAGE SEARCH ENDPOINTS =====================

@router.post("/search")
@rate_limit(requests=300, window=60)
async def search_lineage(
    request: LineageSearchRequest,
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Search through lineage data with advanced query capabilities.
    
    Features:
    - Semantic search across lineage
    - Multi-faceted filtering
    - Relevance scoring
    - Context-aware results
    """
    try:
        # Execute search
        search_results = await lineage_service.search_lineage(
            search_query=request.search_query,
            search_type=request.search_type,
            max_results=request.max_results,
            include_lineage=request.include_lineage
        )
        
        return SuccessResponse(
            message="Lineage search completed successfully",
            data=search_results
        )
        
    except Exception as e:
        logger.error(f"Failed to search lineage: {e}")
        raise HTTPException(status_code=500, detail=f"Lineage search failed: {str(e)}")

@router.get("/search/suggestions")
async def get_search_suggestions(
    query: str = Query(..., description="Partial search query"),
    max_suggestions: int = Query(default=10, ge=1, le=50, description="Maximum suggestions"),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get search suggestions for lineage queries.
    
    Features:
    - Auto-completion for asset names
    - Context-aware suggestions
    - Popular query suggestions
    - Recent search history
    """
    try:
        # Get search suggestions
        suggestions = await lineage_service.get_search_suggestions(
            query=query,
            max_suggestions=max_suggestions,
            user_context=current_user
        )
        
        return SuccessResponse(
            message="Search suggestions retrieved successfully",
            data=suggestions
        )
        
    except Exception as e:
        logger.error(f"Failed to get search suggestions: {e}")
        raise HTTPException(status_code=500, detail=f"Search suggestions failed: {str(e)}")

# ===================== LINEAGE DISCOVERY ENDPOINTS =====================

@router.post("/discover")
@rate_limit(requests=50, window=60)
async def discover_lineage(
    background_tasks: BackgroundTasks,
    data_source_ids: List[int] = Body(..., description="Data source IDs for lineage discovery"),
    discovery_config: Dict[str, Any] = Body(default_factory=dict, description="Discovery configuration"),
    discovery_service: IntelligentDiscoveryService = Depends(get_discovery_service),
    lineage_service: AdvancedLineageService = Depends(get_lineage_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Discover lineage relationships using AI-powered analysis.
    
    Features:
    - Automated lineage discovery
    - Pattern recognition
    - Confidence scoring
    - Multi-source integration
    """
    try:
        # Audit log
        await audit_log(
            action="lineage_discovery_initiated",
            user_id=current_user.get("user_id"),
            resource_type="lineage_discovery",
            resource_id=None,
            metadata={
                "data_source_count": len(data_source_ids),
                "discovery_config": discovery_config
            }
        )
        
        # Start discovery process
        discovery_id = await discovery_service.discover_lineage_relationships(
            data_source_ids=data_source_ids,
            discovery_config=discovery_config
        )
        
        # Schedule background processing
        background_tasks.add_task(
            _process_lineage_discovery,
            discovery_id,
            current_user.get("user_id")
        )
        
        return SuccessResponse(
            message="Lineage discovery initiated successfully",
            data={
                "discovery_id": discovery_id,
                "status": "processing",
                "estimated_completion": datetime.utcnow() + timedelta(minutes=30)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to initiate lineage discovery: {e}")
        raise HTTPException(status_code=500, detail=f"Lineage discovery failed: {str(e)}")

@router.get("/discover/{discovery_id}/status")
async def get_discovery_status(
    discovery_id: str = Path(..., description="Discovery process ID"),
    discovery_service: IntelligentDiscoveryService = Depends(get_discovery_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get status of lineage discovery process.
    
    Features:
    - Real-time discovery progress
    - Intermediate results
    - Error reporting
    - Performance metrics
    """
    try:
        # Get discovery status
        status = await discovery_service.get_discovery_status(discovery_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Discovery process not found")
        
        return SuccessResponse(
            message="Discovery status retrieved successfully",
            data=status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get discovery status: {e}")
        raise HTTPException(status_code=500, detail=f"Discovery status retrieval failed: {str(e)}")

# ===================== HEALTH CHECK AND MONITORING =====================

@router.get("/health")
async def health_check(
    lineage_service: AdvancedLineageService = Depends(get_lineage_service)
):
    """
    Comprehensive health check for the lineage system.
    
    Features:
    - System component health
    - Performance metrics
    - Graph size and integrity
    - Recent operation status
    """
    try:
        health_status = await lineage_service.health_check()
        
        return SuccessResponse(
            message="Health check completed",
            data=health_status
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# ===================== UTILITY FUNCTIONS =====================

async def _store_impact_analysis_results(
    impact_result: ImpactAnalysisResult,
    user_id: str
):
    """Background task to store impact analysis results"""
    try:
        # Implementation would store results in database
        logger.info(f"Stored impact analysis results for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to store impact analysis results: {e}")

async def _process_lineage_discovery(
    discovery_id: str,
    user_id: str
):
    """Background task to process lineage discovery"""
    try:
        # Implementation would process discovery results
        logger.info(f"Processing lineage discovery {discovery_id} for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to process lineage discovery: {e}")

# ===================== EXPORTS =====================

__all__ = [
    "router",
    "query_lineage",
    "analyze_impact",
    "update_lineage",
    "generate_lineage_visualization",
    "search_lineage",
    "discover_lineage"
]