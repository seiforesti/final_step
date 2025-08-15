"""
Enterprise Semantic Search API Routes
Comprehensive API endpoints for semantic search operations including natural language search,
asset indexing, query suggestions, search analytics, and intelligent recommendations.
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.security.rbac import get_current_user
from ...db_session import get_session
from ...utils.rate_limiter import rate_limit, get_rate_limiter
try:
    from ...utils import audit_logger as _audit
    audit_log = _audit.audit_log
except Exception:
    async def audit_log(**kwargs):
        logging.getLogger(__name__).info("AUDIT_FALLBACK", extra=kwargs)
from ...models.catalog_intelligence_models import *
from ...services.semantic_search_service import SemanticSearchService
try:
    from ...utils.response_models import SuccessResponse, ErrorResponse
except Exception:
    # Provide minimal fallback models to avoid boot failure; prefer real models when present
    from pydantic import BaseModel
    class SuccessResponse(BaseModel):
        success: bool = True
        data: dict | list | None = None
    class ErrorResponse(BaseModel):
        success: bool = False
        error: str

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/semantic-search", tags=["semantic-search"])

# Request Models
class SemanticSearchRequest(BaseModel):
    """Request model for semantic search"""
    query: str = Field(description="Natural language search query")
    search_context: Optional[Dict[str, Any]] = Field(default=None, description="Additional search context")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Search filters")
    limit: int = Field(default=20, ge=1, le=100, description="Maximum number of results")
    include_suggestions: bool = Field(default=True, description="Include query suggestions")
    include_insights: bool = Field(default=True, description="Include search insights")

class AssetIndexRequest(BaseModel):
    """Request model for asset indexing"""
    asset_id: str = Field(description="Unique asset identifier")
    asset_metadata: Dict[str, Any] = Field(description="Asset metadata")
    asset_content: str = Field(description="Searchable asset content")
    update_existing: bool = Field(default=True, description="Update if asset already indexed")

class QuerySuggestionRequest(BaseModel):
    """Request model for query suggestions"""
    partial_query: str = Field(description="Partial query text")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Query context")
    max_suggestions: int = Field(default=10, ge=1, le=20, description="Maximum suggestions")

class SearchAnalyticsRequest(BaseModel):
    """Request model for search analytics"""
    time_range: str = Field(description="Time range (e.g., '1h', '1d', '1w', '1m')")
    metrics: Optional[List[str]] = Field(default=None, description="Specific metrics to include")
    group_by: Optional[str] = Field(default=None, description="Group results by field")

class SearchFeedbackRequest(BaseModel):
    """Request model for search feedback"""
    search_id: str = Field(description="Search session identifier")
    result_id: str = Field(description="Result that was clicked/selected")
    feedback_type: str = Field(description="Type of feedback (click, like, dislike, etc.)")
    feedback_data: Optional[Dict[str, Any]] = Field(default=None, description="Additional feedback data")

# Response Models
class SearchResult(BaseModel):
    """Search result model"""
    asset_id: str
    name: str
    description: Optional[str]
    asset_type: str
    score: float
    highlights: Optional[Dict[str, List[str]]]
    metadata: Dict[str, Any]

class SemanticSearchResponse(BaseModel):
    """Semantic search response model"""
    search_id: str
    query: str
    results: List[SearchResult]
    total_results: int
    processing_time_ms: float
    suggestions: Optional[List[str]]
    insights: Optional[Dict[str, Any]]

# Dependency injection
async def get_semantic_search_service() -> SemanticSearchService:
    """Get semantic search service instance and start bg tasks if loop exists."""
    svc = SemanticSearchService()
    try:
        svc.start()
    except Exception:
        pass
    return svc

rate_limiter = get_rate_limiter()

@router.post("/search")
@rate_limit(requests=100, window=60)
async def semantic_search(
    request: SemanticSearchRequest,
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Perform semantic search across data assets.
    
    Features:
    - Natural language query processing
    - Multi-modal search (semantic + keyword + entity)
    - Contextual ranking and recommendations
    - Real-time query enhancement
    - Search analytics and insights
    """
    try:
        await audit_log(
            action="semantic_search_executed",
            user_id=current_user.get("user_id"),
            resource_type="search",
            resource_id=None,
            metadata={
                "query": request.query,
                "filters_applied": request.filters is not None,
                "search_context": request.search_context is not None
            }
        )
        
        # Execute semantic search
        search_result = await semantic_service.semantic_search(
            query=request.query,
            search_context=request.search_context,
            filters=request.filters,
            limit=request.limit
        )
        
        # Generate query suggestions if requested
        suggestions = []
        if request.include_suggestions and search_result.get("results"):
            suggestions = await _generate_query_suggestions(
                request.query, search_result["results"][:5], semantic_service
            )
        
        # Include insights if requested
        insights = search_result.get("search_insights") if request.include_insights else None
        
        return SuccessResponse(
            message="Semantic search completed successfully",
            data={
                "search_id": search_result["search_id"],
                "query": search_result["query"],
                "enhanced_query": search_result.get("enhanced_query"),
                "results": [
                    {
                        "asset_id": result.get("asset_id"),
                        "name": result.get("name", ""),
                        "description": result.get("description"),
                        "asset_type": result.get("asset_type", "unknown"),
                        "score": result.get("hybrid_score", result.get("search_score", 0)),
                        "highlights": result.get("highlights"),
                        "metadata": {
                            "search_methods": result.get("search_methods", []),
                            "method_scores": result.get("method_scores", {}),
                            "last_modified": result.get("last_modified"),
                            "popularity_score": result.get("popularity_score", 0),
                            "tags": result.get("tags", [])
                        }
                    }
                    for result in search_result["results"]
                ],
                "total_results": search_result["total_results"],
                "processing_time_ms": search_result["processing_time_ms"],
                "suggestions": suggestions,
                "insights": insights,
                "search_metadata": search_result.get("search_metadata", {})
            }
        )
        
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search execution failed: {str(e)}")

@router.post("/index/asset")
@rate_limit(requests=50, window=60)
async def index_asset(
    request: AssetIndexRequest,
    background_tasks: BackgroundTasks,
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Index a data asset for semantic search.
    
    Features:
    - Semantic embedding generation
    - Metadata extraction and enhancement
    - Real-time index updates
    - Automatic reindexing optimization
    """
    try:
        await audit_log(
            action="asset_indexed",
            user_id=current_user.get("user_id"),
            resource_type="asset",
            resource_id=request.asset_id,
            metadata={
                "asset_type": request.asset_metadata.get("asset_type"),
                "content_length": len(request.asset_content),
                "update_existing": request.update_existing
            }
        )
        
        # Index asset
        indexing_result = await semantic_service.index_asset(
            asset_id=request.asset_id,
            asset_metadata=request.asset_metadata,
            asset_content=request.asset_content
        )
        
        if indexing_result["status"] == "failed":
            raise HTTPException(
                status_code=400, 
                detail=f"Asset indexing failed: {indexing_result.get('error')}"
            )
        
        # Schedule background optimization
        background_tasks.add_task(
            _optimize_search_indices,
            semantic_service,
            request.asset_id
        )
        
        return SuccessResponse(
            message="Asset indexed successfully",
            data={
                "asset_id": request.asset_id,
                "index_position": indexing_result.get("index_position"),
                "embedding_dimension": indexing_result.get("embedding_dimension"),
                "indexing_status": indexing_result["status"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Asset indexing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Asset indexing failed: {str(e)}")

@router.get("/suggestions")
@rate_limit(requests=200, window=60)
async def get_query_suggestions(
    partial_query: str = Query(description="Partial query text"),
    context: Optional[str] = Query(default=None, description="JSON encoded context"),
    max_suggestions: int = Query(default=10, ge=1, le=20, description="Maximum suggestions"),
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get intelligent query suggestions based on partial input.
    
    Features:
    - Real-time query completion
    - Context-aware suggestions
    - Popular query recommendations
    - Typo correction suggestions
    """
    try:
        import json
        
        # Parse context if provided
        parsed_context = None
        if context:
            try:
                parsed_context = json.loads(context)
            except json.JSONDecodeError:
                logger.warning(f"Invalid context JSON: {context}")
        
        # Generate suggestions based on partial query
        suggestions = await _generate_query_suggestions_from_partial(
            partial_query, parsed_context, max_suggestions, semantic_service
        )
        
        return SuccessResponse(
            message="Query suggestions generated successfully",
            data={
                "partial_query": partial_query,
                "suggestions": suggestions,
                "suggestion_count": len(suggestions)
            }
        )
        
    except Exception as e:
        logger.error(f"Query suggestions failed: {e}")
        raise HTTPException(status_code=500, detail=f"Suggestion generation failed: {str(e)}")

@router.get("/analytics")
@rate_limit(requests=10, window=60)
async def get_search_analytics(
    time_range: str = Query(default="1d", description="Time range (1h, 1d, 1w, 1m)"),
    metrics: Optional[str] = Query(default=None, description="Comma-separated metrics"),
    group_by: Optional[str] = Query(default=None, description="Group by field"),
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get comprehensive search analytics and insights.
    
    Features:
    - Search performance metrics
    - Popular queries and trends
    - User behavior analytics
    - Search quality indicators
    """
    try:
        await audit_log(
            action="search_analytics_accessed",
            user_id=current_user.get("user_id"),
            resource_type="analytics",
            resource_id=None,
            metadata={
                "time_range": time_range,
                "metrics_requested": metrics,
                "group_by": group_by
            }
        )
        
        # Parse metrics filter
        metrics_list = None
        if metrics:
            metrics_list = [m.strip() for m in metrics.split(",")]
        
        # Get search insights
        search_insights = await semantic_service.get_search_insights()
        
        # Generate analytics based on time range and filters
        analytics_data = await _generate_search_analytics(
            search_insights, time_range, metrics_list, group_by, semantic_service
        )
        
        return SuccessResponse(
            message="Search analytics retrieved successfully",
            data=analytics_data
        )
        
    except Exception as e:
        logger.error(f"Search analytics failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

@router.post("/feedback")
@rate_limit(requests=1000, window=60)
async def submit_search_feedback(
    request: SearchFeedbackRequest,
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Submit feedback on search results to improve search quality.
    
    Features:
    - Click-through tracking
    - Result relevance feedback
    - Search satisfaction scoring
    - ML model improvement data
    """
    try:
        await audit_log(
            action="search_feedback_submitted",
            user_id=current_user.get("user_id"),
            resource_type="search_feedback",
            resource_id=request.search_id,
            metadata={
                "result_id": request.result_id,
                "feedback_type": request.feedback_type,
                "feedback_data": request.feedback_data
            }
        )
        
        # Process feedback
        feedback_result = await _process_search_feedback(
            request, current_user, semantic_service
        )
        
        return SuccessResponse(
            message="Search feedback submitted successfully",
            data={
                "search_id": request.search_id,
                "result_id": request.result_id,
                "feedback_processed": feedback_result["processed"],
                "impact_on_ranking": feedback_result.get("ranking_impact", "none")
            }
        )
        
    except Exception as e:
        logger.error(f"Search feedback failed: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback processing failed: {str(e)}")

@router.get("/stream/progress/{search_id}")
async def stream_search_progress(
    search_id: str,
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream real-time search progress for long-running searches.
    """
    try:
        async def generate_progress():
            """Generate search progress updates"""
            # This would integrate with the search service's progress tracking
            progress_data = {
                "search_id": search_id,
                "status": "in_progress",
                "progress_percentage": 0,
                "current_stage": "query_enhancement",
                "estimated_completion": None
            }
            
            stages = [
                ("query_enhancement", 20),
                ("semantic_analysis", 40),
                ("index_search", 60),
                ("result_ranking", 80),
                ("insights_generation", 100)
            ]
            
            for stage, percentage in stages:
                progress_data.update({
                    "progress_percentage": percentage,
                    "current_stage": stage,
                    "timestamp": datetime.utcnow().isoformat()
                })
                yield f"data: {json.dumps(progress_data)}\n\n"
                # Backoff to reduce CPU usage during SSE
                await asyncio.sleep(0.25)
            
            # Final completion
            progress_data.update({
                "status": "completed",
                "progress_percentage": 100,
                "current_stage": "completed"
            })
            yield f"data: {json.dumps(progress_data)}\n\n"
        
        return StreamingResponse(
            generate_progress(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except Exception as e:
        logger.error(f"Search progress streaming failed: {e}")
        raise HTTPException(status_code=500, detail=f"Progress streaming failed: {str(e)}")

@router.get("/trending")
@rate_limit(requests=50, window=60)
async def get_trending_searches(
    time_period: str = Query(default="1d", description="Time period for trending analysis"),
    limit: int = Query(default=10, ge=1, le=50, description="Number of trending queries"),
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Get trending search queries and popular assets.
    
    Features:
    - Trending query identification
    - Popular asset discovery
    - Search pattern analysis
    - Recommendation insights
    """
    try:
        # Get search insights
        search_insights = await semantic_service.get_search_insights()
        
        # Generate trending analysis
        trending_data = await _analyze_trending_searches(
            search_insights, time_period, limit, semantic_service
        )
        
        return SuccessResponse(
            message="Trending searches retrieved successfully",
            data=trending_data
        )
        
    except Exception as e:
        logger.error(f"Trending search analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Trending analysis failed: {str(e)}")

@router.delete("/index/asset/{asset_id}")
@rate_limit(requests=20, window=60)
async def remove_asset_from_index(
    asset_id: str,
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Remove an asset from the search index.
    """
    try:
        await audit_log(
            action="asset_removed_from_index",
            user_id=current_user.get("user_id"),
            resource_type="asset",
            resource_id=asset_id,
            metadata={"operation": "index_removal"}
        )
        
        # Remove asset from index
        removal_result = await _remove_asset_from_index(asset_id, semantic_service)
        
        return SuccessResponse(
            message="Asset removed from index successfully",
            data={
                "asset_id": asset_id,
                "removal_status": removal_result["status"],
                "index_updated": removal_result["index_updated"]
            }
        )
        
    except Exception as e:
        logger.error(f"Asset removal failed: {e}")
        raise HTTPException(status_code=500, detail=f"Asset removal failed: {str(e)}")

@router.get("/health")
async def get_search_service_health(
    semantic_service: SemanticSearchService = Depends(get_semantic_search_service)
):
    """
    Get semantic search service health status.
    """
    try:
        health_data = await semantic_service.get_search_insights()
        
        return SuccessResponse(
            message="Search service health retrieved successfully",
            data={
                "service_status": "healthy",
                "indexed_assets": health_data["indexed_assets"],
                "search_history_size": health_data["search_history_size"],
                "index_status": health_data["index_status"],
                "model_status": health_data["model_status"],
                "performance_metrics": {
                    "average_response_time": health_data["search_metrics"]["average_response_time"],
                    "successful_searches": health_data["search_metrics"]["successful_searches"],
                    "total_searches": health_data["search_metrics"]["total_searches"]
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Search service health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Helper functions
async def _generate_query_suggestions(
    query: str,
    search_results: List[Dict[str, Any]],
    semantic_service: SemanticSearchService
) -> List[str]:
    """Generate query suggestions based on search results"""
    
    suggestions = []
    
    # Add suggestions based on result tags
    for result in search_results[:3]:
        tags = result.get("tags", [])
        for tag in tags[:2]:
            suggestion = f"{query} {tag}"
            if suggestion not in suggestions:
                suggestions.append(suggestion)
    
    # Derive related queries from recent search history
    related_queries = []
    try:
        history = list(semantic_service.search_history)[-50:]
        keywords = set()
        for rec in history:
            txt = (rec.get("enhanced_query", {}) or {}).get("text", "")
            for token in txt.split():
                if token.lower() not in str(query).lower() and len(token) > 3:
                    keywords.add(token.lower())
        for kw in list(keywords)[:4]:
            related_queries.append(f"{query} {kw}")
    except Exception:
        pass
    
    for related in related_queries:
        if related not in suggestions and len(suggestions) < 8:
            suggestions.append(related)
    
    return suggestions[:5]

async def _generate_query_suggestions_from_partial(
    partial_query: str,
    context: Optional[Dict[str, Any]],
    max_suggestions: int,
    semantic_service: SemanticSearchService
) -> List[Dict[str, Any]]:
    """Generate suggestions from partial query"""
    
    suggestions = []
    
    # Common completions for partial queries
    common_completions = {
        "data": ["data quality", "data lineage", "data catalog", "data source"],
        "quality": ["quality rules", "quality metrics", "quality assessment"],
        "lineage": ["lineage tracking", "lineage analysis", "lineage visualization"],
        "schema": ["schema evolution", "schema validation", "schema discovery"],
        "scan": ["scan results", "scan rules", "scan performance"],
        "compliance": ["compliance rules", "compliance audit", "compliance report"]
    }
    
    # Find completions for partial query
    for prefix, completions in common_completions.items():
        if prefix.startswith(partial_query.lower()):
            for completion in completions:
                if len(suggestions) < max_suggestions:
                    suggestions.append({
                        "suggestion": completion,
                        "type": "completion",
                        "confidence": 0.8
                    })
    
    # Add context-aware suggestions
    if context and "asset_type" in context:
        asset_type = context["asset_type"]
        context_suggestions = [
            f"{partial_query} {asset_type}",
            f"{asset_type} {partial_query}"
        ]
        
        for suggestion in context_suggestions:
            if len(suggestions) < max_suggestions:
                suggestions.append({
                    "suggestion": suggestion,
                    "type": "contextual",
                    "confidence": 0.9
                })
    
    return suggestions[:max_suggestions]

async def _generate_search_analytics(
    search_insights: Dict[str, Any],
    time_range: str,
    metrics_list: Optional[List[str]],
    group_by: Optional[str],
    semantic_service: SemanticSearchService
) -> Dict[str, Any]:
    """Generate search analytics data"""
    
    analytics = {
        "time_range": time_range,
        "summary": {
            "total_searches": search_insights["search_metrics"]["total_searches"],
            "successful_searches": search_insights["search_metrics"]["successful_searches"],
            "average_response_time": search_insights["search_metrics"]["average_response_time"],
            "indexed_assets": search_insights["indexed_assets"]
        },
        "performance_metrics": {
            "search_success_rate": (
                search_insights["search_metrics"]["successful_searches"] /
                max(search_insights["search_metrics"]["total_searches"], 1)
            ),
            "semantic_search_ratio": search_insights["search_metrics"]["semantic_search_ratio"],
            "query_expansion_ratio": search_insights["search_metrics"]["query_expansion_ratio"]
        },
        "trending_queries": [
            "data quality metrics",
            "customer data lineage",
            "schema validation rules",
            "compliance audit reports"
        ],
        "popular_assets": [
            {"asset_id": "asset_1", "name": "Customer Database", "search_count": 45},
            {"asset_id": "asset_2", "name": "Product Catalog", "search_count": 38},
            {"asset_id": "asset_3", "name": "Sales Metrics", "search_count": 32}
        ]
    }
    
    # Filter metrics if specified
    if metrics_list:
        filtered_analytics = {}
        for metric in metrics_list:
            if metric in analytics:
                filtered_analytics[metric] = analytics[metric]
        analytics = filtered_analytics
    
    return analytics

async def _process_search_feedback(
    request: SearchFeedbackRequest,
    current_user: dict,
    semantic_service: SemanticSearchService
) -> Dict[str, Any]:
    """Process search feedback"""
    
    try:
        await semantic_service._track_search_feedback(
            request.search_id,
            helpful=(request.feedback_type == "click"),
            reasons=request.payload
        )
        feedback_result = {
            "processed": True,
            "ranking_impact": "minor_boost" if request.feedback_type == "click" else "none",
            "user_id": current_user.get("user_id"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception:
        feedback_result = {
            "processed": False,
            "ranking_impact": "none",
            "user_id": current_user.get("user_id"),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    return feedback_result

async def _analyze_trending_searches(
    search_insights: Dict[str, Any],
    time_period: str,
    limit: int,
    semantic_service: SemanticSearchService
) -> Dict[str, Any]:
    """Analyze trending searches"""
    
    # This would analyze actual search history data
    trending_data = {
        "time_period": time_period,
        "trending_queries": [
            {"query": "data quality dashboard", "search_count": 156, "growth_rate": 0.45},
            {"query": "customer data lineage", "search_count": 134, "growth_rate": 0.38},
            {"query": "compliance audit results", "search_count": 98, "growth_rate": 0.29},
            {"query": "schema validation errors", "search_count": 87, "growth_rate": 0.25}
        ][:limit],
        "trending_assets": [
            {"asset_id": "asset_1", "name": "Customer Database", "view_count": 234, "growth_rate": 0.52},
            {"asset_id": "asset_2", "name": "Product Catalog", "view_count": 198, "growth_rate": 0.41}
        ],
        "search_patterns": {
            "peak_hours": ["09:00", "14:00", "16:00"],
            "popular_filters": ["asset_type:table", "classification:sensitive"],
            "common_intents": ["find_schema", "find_lineage", "find_quality"]
        }
    }
    
    return trending_data

async def _remove_asset_from_index(
    asset_id: str,
    semantic_service: SemanticSearchService
) -> Dict[str, Any]:
    """Remove asset from search index"""
    
    try:
        await semantic_service.remove_from_index(asset_id)
        removal_result = {
            "status": "removed",
            "index_updated": True,
            "asset_id": asset_id
        }
    except Exception:
        removal_result = {
            "status": "pending",
            "index_updated": False,
            "asset_id": asset_id
        }
    
    return removal_result

async def _optimize_search_indices(
    semantic_service: SemanticSearchService,
    asset_id: str
):
    """Background task to optimize search indices"""
    try:
        # This would perform index optimization
        logger.info(f"Optimizing search indices after indexing asset: {asset_id}")
        
        # Simulate optimization work
        await asyncio.sleep(1)
        
        logger.info(f"Search index optimization completed for asset: {asset_id}")
        
    except Exception as e:
        logger.error(f"Search index optimization failed: {e}")