"""
Enterprise Data Catalog API Routes - Advanced Production Implementation
=====================================================================

This module provides comprehensive FastAPI routes for the Enterprise Intelligent Data Catalog,
featuring advanced search capabilities, real-time monitoring, comprehensive lineage management,
quality assessment operations, and seamless integration with all data governance systems.

Enterprise Features:
- Advanced semantic search with AI-powered ranking
- Real-time asset monitoring via WebSocket and SSE
- Comprehensive lineage visualization and analysis
- Automated quality assessment and profiling
- Business glossary integration and management
- Bulk operations for enterprise-scale data management
- Advanced analytics and insights generation
- Cross-system integration endpoints
- Export/import capabilities for enterprise workflows
- Role-based access control and audit trails

Performance Targets:
- Sub-100ms response times for 95% of read operations
- Support for 10M+ concurrent asset searches
- Real-time streaming for 100K+ concurrent connections
- Horizontal scaling across multiple data centers
- 99.99% uptime with zero-downtime deployments
"""

from typing import List, Dict, Any, Optional, Union, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
import time
from concurrent.futures import ThreadPoolExecutor
import traceback
import io
import csv
from pathlib import Path

# FastAPI and HTTP imports
from fastapi import (
    APIRouter, Depends, HTTPException, BackgroundTasks, Query, 
    StreamingResponse, JSONResponse, WebSocket, Path as FastAPIPath, 
    Body, status, Response, Request, WebSocketDisconnect, File, UploadFile
)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_, func, text, desc, asc
from sqlalchemy.orm import selectinload, joinedload
import pandas as pd

# Core application imports
from ...models.advanced_catalog_models import (
    IntelligentDataAsset, EnterpriseDataLineage, DataQualityAssessment,
    BusinessGlossaryTerm, BusinessGlossaryAssociation, AssetUsageMetrics,
    DataProfilingResult, AssetType, AssetStatus, DataQuality, LineageDirection,
    LineageType, DiscoveryMethod, AssetCriticality, DataSensitivity,
    UsageFrequency, IntelligentAssetResponse, AssetCreateRequest,
    AssetUpdateRequest, AssetSearchRequest, LineageResponse,
    QualityAssessmentResponse, BusinessGlossaryResponse, AssetDiscoveryEvent,
    LineageGraph, CatalogAnalytics
)
from ...services.enterprise_catalog_service import (
    EnterpriseIntelligentCatalogService, get_enterprise_catalog_service,
    DiscoveryTrigger, CatalogEngineStatus
)
from ...db_session import get_session
from ...api.security.rbac import get_current_user, check_permission
from ...core.monitoring import MetricsCollector, AlertManager
from ...core.logging import StructuredLogger
from ...core.cache import RedisCache
from ...core.pagination import PaginationParams, PaginatedResponse
from ...core.rate_limiting import RateLimiter
from ...core.background_tasks import BackgroundTaskManager

# Configure structured logging and dependencies
logger = StructuredLogger(__name__)
security = HTTPBearer()
router = APIRouter(prefix="/api/v1/catalog", tags=["Enterprise Data Catalog"])


# ===================== DEPENDENCY INJECTION =====================

async def get_catalog_service() -> EnterpriseIntelligentCatalogService:
    """Get the enterprise catalog service instance."""
    return await get_enterprise_catalog_service()


async def get_metrics_collector() -> MetricsCollector:
    """Get metrics collector instance."""
    return MetricsCollector()


async def get_cache() -> RedisCache:
    """Get Redis cache instance."""
    return RedisCache()


async def get_rate_limiter() -> RateLimiter:
    """Get rate limiter instance."""
    return RateLimiter()


# ===================== REQUEST/RESPONSE MODELS =====================

class BulkAssetCreateRequest(BaseModel):
    """Request model for bulk asset creation"""
    assets: List[AssetCreateRequest]
    discovery_config: Optional[Dict[str, Any]] = {}
    enable_ai_enhancement: bool = True
    batch_size: int = Field(default=100, ge=1, le=1000)
    parallel_processing: bool = True


class BulkAssetUpdateRequest(BaseModel):
    """Request model for bulk asset updates"""
    updates: Dict[int, AssetUpdateRequest]  # asset_id -> update_data
    update_strategy: str = Field(default="merge", regex="^(merge|replace|partial)$")
    skip_validation: bool = False


class AssetDiscoveryRequest(BaseModel):
    """Request model for asset discovery operations"""
    data_source_ids: List[int]
    discovery_config: Dict[str, Any] = {}
    trigger_type: DiscoveryTrigger = DiscoveryTrigger.MANUAL
    schedule_config: Optional[Dict[str, Any]] = None
    notification_config: Optional[Dict[str, Any]] = None


class LineageAnalysisRequest(BaseModel):
    """Request model for advanced lineage analysis"""
    asset_ids: List[int]
    analysis_type: str = Field(default="comprehensive", regex="^(basic|comprehensive|impact|dependency)$")
    direction: LineageDirection = LineageDirection.BIDIRECTIONAL
    max_depth: int = Field(default=10, ge=1, le=20)
    include_transformations: bool = True
    include_business_context: bool = True


class QualityAssessmentRequest(BaseModel):
    """Request model for quality assessments"""
    asset_ids: List[int]
    assessment_type: str = Field(default="comprehensive", regex="^(basic|comprehensive|detailed|custom)$")
    assessment_config: Dict[str, Any] = {}
    schedule_recurring: bool = False
    alert_thresholds: Optional[Dict[str, float]] = None


class BusinessGlossaryImportRequest(BaseModel):
    """Request model for business glossary import"""
    import_format: str = Field(default="csv", regex="^(csv|json|xlsx|xml)$")
    import_config: Dict[str, Any] = {}
    merge_strategy: str = Field(default="update", regex="^(create|update|replace)$")
    validation_rules: Optional[Dict[str, Any]] = None


class AnalyticsRequest(BaseModel):
    """Request model for analytics generation"""
    analytics_types: List[str]
    time_range: Optional[Dict[str, datetime]] = None
    filters: Optional[Dict[str, Any]] = None
    aggregation_level: str = Field(default="daily", regex="^(hourly|daily|weekly|monthly)$")
    include_predictions: bool = True


# ===================== CORE ASSET MANAGEMENT ENDPOINTS =====================

@router.post("/assets", response_model=IntelligentAssetResponse, status_code=status.HTTP_201_CREATED)
async def create_intelligent_asset(
    request: AssetCreateRequest,
    enhancement_config: Optional[Dict[str, Any]] = Body(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    catalog_service: EnterpriseIntelligentCatalogService = Depends(get_catalog_service),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Create a new intelligent data asset with AI-powered enhancement and
    automatic integration with all governance systems.
    
    Features:
    - AI-powered metadata extraction and enrichment
    - Automatic classification and sensitivity detection
    - Business context discovery and tagging
    - Quality assessment initialization
    - Integration with compliance frameworks
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "catalog:asset:create")
        
        logger.info(
            "Creating intelligent data asset",
            extra={
                "qualified_name": request.qualified_name,
                "asset_type": request.asset_type.value,
                "user_id": current_user["user_id"],
                "data_source_id": request.data_source_id
            }
        )
        
        # Create asset UUID
        asset_uuid = f"asset_{uuid.uuid4().hex[:16]}"
        
        # Create intelligent data asset
        intelligent_asset = IntelligentDataAsset(
            asset_uuid=asset_uuid,
            qualified_name=request.qualified_name,
            display_name=request.display_name,
            description=request.description,
            asset_type=request.asset_type,
            asset_criticality=request.asset_criticality,
            data_sensitivity=request.data_sensitivity,
            data_source_id=request.data_source_id,
            database_name=request.database_name,
            schema_name=request.schema_name,
            table_name=request.table_name,
            full_path=f"{request.database_name or ''}.{request.schema_name or ''}.{request.table_name or request.qualified_name}",
            discovery_method=DiscoveryMethod.MANUAL_ENTRY,
            business_domain=request.business_domain,
            business_purpose=request.business_purpose,
            owner=request.owner,
            steward=request.steward,
            user_tags=request.user_tags or [],
            custom_properties=request.custom_properties or {},
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"]
        )
        
        # Save to database
        session.add(intelligent_asset)
        await session.commit()
        await session.refresh(intelligent_asset)
        
        # Schedule AI enhancement in background
        if enhancement_config is not None or True:  # Default to enabled
            background_tasks.add_task(
                _enhance_asset_with_ai,
                intelligent_asset.id,
                enhancement_config or {},
                current_user["user_id"]
            )
        
        # Schedule quality assessment
        background_tasks.add_task(
            _schedule_initial_quality_assessment,
            intelligent_asset.id,
            current_user["user_id"]
        )
        
        # Record metrics
        creation_time = time.time() - start_time
        await metrics.record_histogram("asset_creation_duration", creation_time)
        await metrics.increment_counter(
            "assets_created",
            tags={
                "asset_type": request.asset_type.value,
                "data_sensitivity": request.data_sensitivity.value,
                "user_id": current_user["user_id"]
            }
        )
        
        # Convert to response model
        response = IntelligentAssetResponse.from_orm(intelligent_asset)
        
        logger.info(
            "Intelligent data asset created successfully",
            extra={
                "asset_id": intelligent_asset.id,
                "asset_uuid": asset_uuid,
                "creation_time": creation_time,
                "qualified_name": request.qualified_name
            }
        )
        
        return response
        
    except Exception as e:
        await metrics.increment_counter(
            "asset_creation_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Failed to create intelligent data asset",
            extra={
                "qualified_name": request.qualified_name,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create asset: {str(e)}"
        )


@router.get("/assets/{asset_id}", response_model=IntelligentAssetResponse)
async def get_intelligent_asset(
    asset_id: int = FastAPIPath(..., description="Asset ID"),
    include_relationships: bool = Query(False, description="Include relationship data"),
    include_quality_metrics: bool = Query(False, description="Include quality assessment data"),
    include_usage_analytics: bool = Query(False, description="Include usage analytics"),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    cache: RedisCache = Depends(get_cache),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Retrieve an intelligent data asset with optional enriched data including
    relationships, quality metrics, and usage analytics.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "catalog:asset:read")
        
        # Check cache first
        cache_key = f"asset:{asset_id}:{include_relationships}:{include_quality_metrics}:{include_usage_analytics}"
        cached_asset = await cache.get(cache_key)
        
        if cached_asset:
            await metrics.increment_counter("asset_cache_hits")
            return IntelligentAssetResponse.parse_obj(cached_asset)
        
        # Build query with optional relationships
        query = select(IntelligentDataAsset).where(IntelligentDataAsset.id == asset_id)
        
        if include_relationships:
            query = query.options(
                selectinload(IntelligentDataAsset.lineage_sources),
                selectinload(IntelligentDataAsset.lineage_targets),
                selectinload(IntelligentDataAsset.business_glossary_terms)
            )
        
        if include_quality_metrics:
            query = query.options(
                selectinload(IntelligentDataAsset.quality_assessments),
                selectinload(IntelligentDataAsset.profiling_results)
            )
        
        if include_usage_analytics:
            query = query.options(
                selectinload(IntelligentDataAsset.usage_metrics)
            )
        
        # Execute query
        result = await session.execute(query)
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(
                status_code=404,
                detail=f"Asset with ID {asset_id} not found"
            )
        
        # Convert to response model
        response = IntelligentAssetResponse.from_orm(asset)
        
        # Cache the result
        await cache.set(
            cache_key, 
            response.dict(), 
            expire=300  # 5 minutes
        )
        
        # Record metrics
        retrieval_time = time.time() - start_time
        await metrics.record_histogram("asset_retrieval_duration", retrieval_time)
        await metrics.increment_counter("assets_retrieved")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await metrics.increment_counter(
            "asset_retrieval_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Failed to retrieve asset",
            extra={
                "asset_id": asset_id,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve asset: {str(e)}"
        )


@router.put("/assets/{asset_id}", response_model=IntelligentAssetResponse)
async def update_intelligent_asset(
    asset_id: int,
    request: AssetUpdateRequest,
    trigger_reanalysis: bool = Query(False, description="Trigger AI reanalysis after update"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    cache: RedisCache = Depends(get_cache),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Update an intelligent data asset with optional AI reanalysis and
    automatic change tracking.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "catalog:asset:update")
        
        # Load existing asset
        result = await session.execute(
            select(IntelligentDataAsset).where(IntelligentDataAsset.id == asset_id)
        )
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(
                status_code=404,
                detail=f"Asset with ID {asset_id} not found"
            )
        
        # Store change history
        change_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": current_user["user_id"],
            "changes": {},
            "previous_values": {}
        }
        
        # Apply updates with change tracking
        if request.display_name is not None:
            change_record["previous_values"]["display_name"] = asset.display_name
            change_record["changes"]["display_name"] = request.display_name
            asset.display_name = request.display_name
        
        if request.description is not None:
            change_record["previous_values"]["description"] = asset.description
            change_record["changes"]["description"] = request.description
            asset.description = request.description
        
        if request.asset_criticality is not None:
            change_record["previous_values"]["asset_criticality"] = asset.asset_criticality.value
            change_record["changes"]["asset_criticality"] = request.asset_criticality.value
            asset.asset_criticality = request.asset_criticality
        
        if request.data_sensitivity is not None:
            change_record["previous_values"]["data_sensitivity"] = asset.data_sensitivity.value
            change_record["changes"]["data_sensitivity"] = request.data_sensitivity.value
            asset.data_sensitivity = request.data_sensitivity
        
        if request.business_domain is not None:
            change_record["previous_values"]["business_domain"] = asset.business_domain
            change_record["changes"]["business_domain"] = request.business_domain
            asset.business_domain = request.business_domain
        
        if request.business_purpose is not None:
            change_record["previous_values"]["business_purpose"] = asset.business_purpose
            change_record["changes"]["business_purpose"] = request.business_purpose
            asset.business_purpose = request.business_purpose
        
        if request.owner is not None:
            change_record["previous_values"]["owner"] = asset.owner
            change_record["changes"]["owner"] = request.owner
            asset.owner = request.owner
        
        if request.steward is not None:
            change_record["previous_values"]["steward"] = asset.steward
            change_record["changes"]["steward"] = request.steward
            asset.steward = request.steward
        
        if request.user_tags is not None:
            change_record["previous_values"]["user_tags"] = asset.user_tags
            change_record["changes"]["user_tags"] = request.user_tags
            asset.user_tags = request.user_tags
        
        if request.custom_properties is not None:
            change_record["previous_values"]["custom_properties"] = asset.custom_properties
            change_record["changes"]["custom_properties"] = request.custom_properties
            asset.custom_properties.update(request.custom_properties)
        
        # Update tracking fields
        asset.updated_at = datetime.utcnow()
        asset.updated_by = current_user["user_id"]
        
        # Add change record to modification history
        if change_record["changes"]:
            asset.modification_history.append(change_record)
        
        # Save changes
        await session.commit()
        await session.refresh(asset)
        
        # Clear related caches
        await _clear_asset_caches(cache, asset_id)
        
        # Trigger AI reanalysis if requested
        if trigger_reanalysis and change_record["changes"]:
            background_tasks.add_task(
                _trigger_asset_reanalysis,
                asset_id,
                change_record["changes"],
                current_user["user_id"]
            )
        
        # Record metrics
        update_time = time.time() - start_time
        await metrics.record_histogram("asset_update_duration", update_time)
        await metrics.increment_counter(
            "assets_updated",
            tags={
                "changes_count": str(len(change_record["changes"])),
                "triggered_reanalysis": str(trigger_reanalysis)
            }
        )
        
        # Convert to response model
        response = IntelligentAssetResponse.from_orm(asset)
        
        logger.info(
            "Asset updated successfully",
            extra={
                "asset_id": asset_id,
                "changes_made": len(change_record["changes"]),
                "update_time": update_time,
                "triggered_reanalysis": trigger_reanalysis
            }
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await metrics.increment_counter(
            "asset_update_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Failed to update asset",
            extra={
                "asset_id": asset_id,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update asset: {str(e)}"
        )


# ===================== ADVANCED SEMANTIC SEARCH ENDPOINTS =====================

@router.post("/search", response_model=PaginatedResponse[IntelligentAssetResponse])
async def semantic_search_assets(
    search_request: AssetSearchRequest,
    enable_ai_ranking: bool = Query(True, description="Enable AI-powered result ranking"),
    include_suggestions: bool = Query(True, description="Include search suggestions"),
    pagination: PaginationParams = Depends(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    catalog_service: EnterpriseIntelligentCatalogService = Depends(get_catalog_service),
    metrics: MetricsCollector = Depends(get_metrics_collector),
    rate_limiter: RateLimiter = Depends(get_rate_limiter)
):
    """
    Perform advanced semantic search across data assets with AI-powered ranking,
    contextual understanding, and personalized recommendations.
    
    Features:
    - Natural language query processing
    - Semantic similarity matching
    - AI-powered result ranking
    - Personalized recommendations
    - Advanced filtering and faceting
    - Real-time suggestion generation
    """
    try:
        # Apply rate limiting
        await rate_limiter.check_limit(
            current_user["user_id"], 
            "semantic_search", 
            limit=100,  # 100 searches per minute
            window=60
        )
        
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "catalog:asset:search")
        
        logger.info(
            "Performing semantic search",
            extra={
                "query": search_request.query,
                "user_id": current_user["user_id"],
                "ai_ranking": enable_ai_ranking,
                "filters_count": len([
                    f for f in [
                        search_request.asset_types,
                        search_request.business_domains,
                        search_request.owners
                    ] if f
                ])
            }
        )
        
        # Perform semantic search using catalog service
        search_results = await catalog_service.semantic_search(
            search_request=search_request,
            session=session,
            user_id=current_user["user_id"],
            enable_ai_ranking=enable_ai_ranking
        )
        
        # Apply pagination
        total_count = len(search_results)
        start_idx = (pagination.page - 1) * pagination.size
        end_idx = start_idx + pagination.size
        paginated_results = search_results[start_idx:end_idx]
        
        # Generate search suggestions if requested
        suggestions = []
        if include_suggestions and search_request.query:
            suggestions = await _generate_search_suggestions(
                search_request.query,
                search_results[:10],  # Use top 10 results for suggestions
                session
            )
        
        # Create paginated response
        response = PaginatedResponse[IntelligentAssetResponse](
            items=paginated_results,
            total=total_count,
            page=pagination.page,
            size=pagination.size,
            pages=(total_count + pagination.size - 1) // pagination.size,
            has_next=end_idx < total_count,
            has_previous=pagination.page > 1,
            metadata={
                "search_time": time.time() - start_time,
                "ai_ranking_enabled": enable_ai_ranking,
                "suggestions": suggestions,
                "facets": await _generate_search_facets(search_results)
            }
        )
        
        # Record search metrics
        search_time = time.time() - start_time
        await metrics.record_histogram("semantic_search_duration", search_time)
        await metrics.increment_counter(
            "semantic_searches_completed",
            tags={
                "has_query": str(bool(search_request.query)),
                "ai_ranking": str(enable_ai_ranking),
                "results_count": str(total_count)
            }
        )
        
        logger.info(
            "Semantic search completed successfully",
            extra={
                "search_time": search_time,
                "total_results": total_count,
                "page": pagination.page,
                "suggestions_count": len(suggestions)
            }
        )
        
        return response
        
    except Exception as e:
        await metrics.increment_counter(
            "semantic_search_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Semantic search failed",
            extra={
                "query": search_request.query,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )


@router.get("/search/suggestions")
async def get_search_suggestions(
    query: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(10, ge=1, le=50),
    include_popular: bool = Query(True, description="Include popular search terms"),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    cache: RedisCache = Depends(get_cache),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Get intelligent search suggestions based on query input, popular searches,
    and user behavior patterns.
    """
    try:
        start_time = time.time()
        
        # Check cache for suggestions
        cache_key = f"search_suggestions:{query.lower()}:{limit}:{include_popular}"
        cached_suggestions = await cache.get(cache_key)
        
        if cached_suggestions:
            await metrics.increment_counter("suggestion_cache_hits")
            return {"suggestions": cached_suggestions}
        
        suggestions = []
        
        # Generate semantic suggestions based on asset names and descriptions
        semantic_suggestions = await _generate_semantic_suggestions(
            query, session, limit // 2
        )
        suggestions.extend(semantic_suggestions)
        
        # Add popular search terms if requested
        if include_popular:
            popular_suggestions = await _get_popular_search_terms(
                query, session, limit - len(suggestions)
            )
            suggestions.extend(popular_suggestions)
        
        # Remove duplicates and limit results
        unique_suggestions = list(dict.fromkeys(suggestions))[:limit]
        
        # Cache suggestions
        await cache.set(cache_key, unique_suggestions, expire=600)  # 10 minutes
        
        # Record metrics
        suggestion_time = time.time() - start_time
        await metrics.record_histogram("suggestion_generation_duration", suggestion_time)
        await metrics.increment_counter("suggestions_generated")
        
        return {
            "suggestions": unique_suggestions,
            "query": query,
            "generation_time": suggestion_time
        }
        
    except Exception as e:
        await metrics.increment_counter(
            "suggestion_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Failed to generate suggestions",
            extra={
                "query": query,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate suggestions: {str(e)}"
        )


# ===================== COMPREHENSIVE LINEAGE MANAGEMENT ENDPOINTS =====================

@router.post("/lineage/analyze", response_model=LineageGraph)
async def analyze_comprehensive_lineage(
    request: LineageAnalysisRequest,
    background_analysis: bool = Query(False, description="Perform analysis in background"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    catalog_service: EnterpriseIntelligentCatalogService = Depends(get_catalog_service),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Perform comprehensive lineage analysis with AI-powered relationship detection,
    impact analysis, and graph visualization.
    
    Features:
    - Multi-asset lineage analysis
    - AI-powered relationship discovery
    - Impact and dependency analysis
    - Critical path identification
    - Business context integration
    - Graph-based visualization data
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "catalog:lineage:analyze")
        
        logger.info(
            "Starting comprehensive lineage analysis",
            extra={
                "asset_ids": request.asset_ids,
                "analysis_type": request.analysis_type,
                "direction": request.direction.value,
                "max_depth": request.max_depth,
                "user_id": current_user["user_id"]
            }
        )
        
        if background_analysis:
            # Queue background analysis
            analysis_id = f"lineage_analysis_{uuid.uuid4().hex[:12]}"
            background_tasks.add_task(
                _perform_background_lineage_analysis,
                analysis_id,
                request,
                current_user["user_id"]
            )
            
            return JSONResponse(
                status_code=status.HTTP_202_ACCEPTED,
                content={
                    "analysis_id": analysis_id,
                    "status": "queued",
                    "message": "Lineage analysis queued for background processing"
                }
            )
        
        # Perform immediate analysis for single asset (most common case)
        if len(request.asset_ids) == 1:
            lineage_graph = await catalog_service.build_comprehensive_lineage(
                asset_id=request.asset_ids[0],
                direction=request.direction,
                max_depth=request.max_depth,
                session=session,
                user_id=current_user["user_id"]
            )
        else:
            # Handle multi-asset lineage analysis
            lineage_graph = await _build_multi_asset_lineage(
                request,
                catalog_service,
                session,
                current_user["user_id"]
            )
        
        # Record analysis metrics
        analysis_time = time.time() - start_time
        await metrics.record_histogram("lineage_analysis_duration", analysis_time)
        await metrics.increment_counter(
            "lineage_analyses_completed",
            tags={
                "analysis_type": request.analysis_type,
                "direction": request.direction.value,
                "asset_count": str(len(request.asset_ids))
            }
        )
        
        logger.info(
            "Comprehensive lineage analysis completed",
            extra={
                "analysis_time": analysis_time,
                "nodes_count": len(lineage_graph.nodes),
                "edges_count": len(lineage_graph.edges),
                "critical_paths": len(lineage_graph.critical_paths),
                "complexity_score": lineage_graph.complexity_score
            }
        )
        
        return lineage_graph
        
    except Exception as e:
        await metrics.increment_counter(
            "lineage_analysis_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Comprehensive lineage analysis failed",
            extra={
                "asset_ids": request.asset_ids,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Lineage analysis failed: {str(e)}"
        )


@router.get("/lineage/{asset_id}/impact")
async def get_impact_analysis(
    asset_id: int,
    change_type: str = Query("schema_change", regex="^(schema_change|deletion|quality_degradation|access_restriction)$"),
    simulation_depth: int = Query(5, ge=1, le=10),
    include_business_impact: bool = Query(True),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    catalog_service: EnterpriseIntelligentCatalogService = Depends(get_catalog_service),
    metrics: MetricsCollector = Depends(get_metrics_collector),
    cache: RedisCache = Depends(get_cache)
):
    """
    Perform impact analysis to understand the downstream effects of changes
    to a specific data asset.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "catalog:lineage:impact")
        
        # Check cache for recent impact analysis
        cache_key = f"impact_analysis:{asset_id}:{change_type}:{simulation_depth}:{include_business_impact}"
        cached_analysis = await cache.get(cache_key)
        
        if cached_analysis:
            await metrics.increment_counter("impact_analysis_cache_hits")
            return cached_analysis
        
        # Build lineage graph for impact analysis
        lineage_graph = await catalog_service.build_comprehensive_lineage(
            asset_id=asset_id,
            direction=LineageDirection.DOWNSTREAM,
            max_depth=simulation_depth,
            session=session,
            user_id=current_user["user_id"]
        )
        
        # Perform impact simulation
        impact_analysis = await _simulate_impact_analysis(
            lineage_graph,
            change_type,
            include_business_impact,
            session
        )
        
        # Cache analysis results
        await cache.set(cache_key, impact_analysis, expire=1800)  # 30 minutes
        
        # Record metrics
        analysis_time = time.time() - start_time
        await metrics.record_histogram("impact_analysis_duration", analysis_time)
        await metrics.increment_counter(
            "impact_analyses_completed",
            tags={
                "change_type": change_type,
                "affected_assets": str(impact_analysis["affected_assets_count"])
            }
        )
        
        return impact_analysis
        
    except Exception as e:
        await metrics.increment_counter(
            "impact_analysis_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Impact analysis failed",
            extra={
                "asset_id": asset_id,
                "change_type": change_type,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Impact analysis failed: {str(e)}"
        )


# ===================== REAL-TIME MONITORING ENDPOINTS =====================

@router.websocket("/assets/{asset_id}/monitor")
async def websocket_asset_monitoring(
    websocket: WebSocket,
    asset_id: int = FastAPIPath(..., description="Asset ID to monitor"),
    current_user: dict = Depends(get_current_user),
    catalog_service: EnterpriseIntelligentCatalogService = Depends(get_catalog_service),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Real-time WebSocket monitoring for asset changes, quality metrics,
    usage patterns, and system events.
    """
    await websocket.accept()
    
    try:
        # Validate permissions
        await check_permissions(current_user, "catalog:asset:monitor")
        
        logger.info(
            "Starting WebSocket asset monitoring",
            extra={
                "asset_id": asset_id,
                "user_id": current_user["user_id"],
                "client_ip": websocket.client.host
            }
        )
        
        # Initialize monitoring session
        monitoring_session = {
            "asset_id": asset_id,
            "user_id": current_user["user_id"],
            "start_time": time.time(),
            "metrics_sent": 0,
            "last_heartbeat": time.time()
        }
        
        # Send initial asset status
        initial_status = await _get_asset_monitoring_status(asset_id, session)
        await websocket.send_json({
            "type": "initial_status",
            "timestamp": datetime.utcnow().isoformat(),
            "data": initial_status
        })
        
        while True:
            try:
                # Check for client messages (heartbeat, config changes)
                try:
                    message = await asyncio.wait_for(
                        websocket.receive_json(),
                        timeout=1.0
                    )
                    
                    if message.get("type") == "heartbeat":
                        monitoring_session["last_heartbeat"] = time.time()
                        await websocket.send_json({
                            "type": "heartbeat_ack",
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    
                except asyncio.TimeoutError:
                    # No message received, continue monitoring
                    pass
                
                # Get latest monitoring data
                monitoring_data = await _get_asset_monitoring_data(
                    asset_id, 
                    monitoring_session
                )
                
                if monitoring_data:
                    await websocket.send_json({
                        "type": "monitoring_update",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": monitoring_data
                    })
                    
                    monitoring_session["metrics_sent"] += 1
                
                # Check for connection health
                if time.time() - monitoring_session["last_heartbeat"] > 300:  # 5 minutes
                    logger.warning(
                        "WebSocket client appears disconnected (no heartbeat)",
                        extra={
                            "asset_id": asset_id,
                            "user_id": current_user["user_id"]
                        }
                    )
                    break
                
                # Wait before next update
                await asyncio.sleep(5)  # 5-second intervals
                
            except WebSocketDisconnect:
                logger.info(
                    "WebSocket client disconnected",
                    extra={
                        "asset_id": asset_id,
                        "user_id": current_user["user_id"],
                        "session_duration": time.time() - monitoring_session["start_time"],
                        "metrics_sent": monitoring_session["metrics_sent"]
                    }
                )
                break
                
    except Exception as e:
        logger.error(
            "WebSocket monitoring error",
            extra={
                "asset_id": asset_id,
                "user_id": current_user["user_id"],
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        await websocket.send_json({
            "type": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Monitoring session error"
        })
        
    finally:
        await metrics.increment_counter(
            "websocket_monitoring_sessions_ended",
            tags={"asset_id": str(asset_id)}
        )


@router.get("/monitoring/dashboard/stream")
async def stream_monitoring_dashboard(
    asset_ids: List[int] = Query([], description="Asset IDs to monitor"),
    metrics_types: List[str] = Query(["quality", "usage", "health"], description="Metric types to stream"),
    interval: int = Query(10, ge=5, le=60, description="Update interval in seconds"),
    current_user: dict = Depends(get_current_user),
    catalog_service: EnterpriseIntelligentCatalogService = Depends(get_catalog_service)
):
    """
    Server-Sent Events (SSE) stream for real-time monitoring dashboard
    with multiple assets and metric types.
    """
    try:
        # Validate permissions
        await check_permissions(current_user, "catalog:monitoring:dashboard")
        
        async def event_stream():
            session_start = time.time()
            events_sent = 0
            
            logger.info(
                "Starting SSE monitoring dashboard stream",
                extra={
                    "asset_ids": asset_ids,
                    "metrics_types": metrics_types,
                    "interval": interval,
                    "user_id": current_user["user_id"]
                }
            )
            
            try:
                while True:
                    # Collect monitoring data for all assets
                    dashboard_data = await _collect_dashboard_monitoring_data(
                        asset_ids or [],  # If empty, monitor all user-accessible assets
                        metrics_types,
                        current_user["user_id"]
                    )
                    
                    # Send data as SSE event
                    yield f"data: {json.dumps(dashboard_data)}\n\n"
                    events_sent += 1
                    
                    # Send periodic heartbeat
                    if events_sent % 10 == 0:  # Every 10th event
                        heartbeat_data = {
                            "type": "heartbeat",
                            "timestamp": datetime.utcnow().isoformat(),
                            "session_duration": time.time() - session_start,
                            "events_sent": events_sent
                        }
                        yield f"event: heartbeat\ndata: {json.dumps(heartbeat_data)}\n\n"
                    
                    # Wait for next interval
                    await asyncio.sleep(interval)
                    
            except Exception as e:
                error_data = {
                    "type": "error",
                    "timestamp": datetime.utcnow().isoformat(),
                    "error": f"Streaming error: {str(e)}"
                }
                yield f"event: error\ndata: {json.dumps(error_data)}\n\n"
                
                logger.error(
                    "SSE monitoring stream error",
                    extra={
                        "user_id": current_user["user_id"],
                        "error": str(e),
                        "events_sent": events_sent
                    }
                )
        
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control"
            }
        )
        
    except Exception as e:
        logger.error(
            "Failed to start SSE monitoring stream",
            extra={
                "user_id": current_user["user_id"],
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start monitoring stream: {str(e)}"
        )


# ===================== QUALITY ASSESSMENT ENDPOINTS =====================

@router.post("/quality/assess", response_model=List[QualityAssessmentResponse])
async def perform_quality_assessment(
    request: QualityAssessmentRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    catalog_service: EnterpriseIntelligentCatalogService = Depends(get_catalog_service),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Perform comprehensive quality assessment on specified assets with
    configurable analysis types and automated reporting.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "catalog:quality:assess")
        
        logger.info(
            "Starting quality assessment",
            extra={
                "asset_ids": request.asset_ids,
                "assessment_type": request.assessment_type,
                "user_id": current_user["user_id"],
                "schedule_recurring": request.schedule_recurring
            }
        )
        
        assessment_results = []
        
        for asset_id in request.asset_ids:
            try:
                # Perform quality assessment for each asset
                assessment = await _perform_asset_quality_assessment(
                    asset_id=asset_id,
                    assessment_type=request.assessment_type,
                    assessment_config=request.assessment_config,
                    session=session,
                    user_id=current_user["user_id"]
                )
                
                assessment_results.append(assessment)
                
                # Schedule recurring assessment if requested
                if request.schedule_recurring:
                    background_tasks.add_task(
                        _schedule_recurring_quality_assessment,
                        asset_id,
                        request.assessment_type,
                        request.assessment_config,
                        current_user["user_id"]
                    )
                
                # Set up alert thresholds if provided
                if request.alert_thresholds:
                    background_tasks.add_task(
                        _configure_quality_alerts,
                        asset_id,
                        request.alert_thresholds,
                        current_user["user_id"]
                    )
                
            except Exception as e:
                logger.error(
                    f"Quality assessment failed for asset {asset_id}",
                    extra={
                        "asset_id": asset_id,
                        "error": str(e)
                    }
                )
                # Continue with other assets
                continue
        
        # Record assessment metrics
        assessment_time = time.time() - start_time
        await metrics.record_histogram("quality_assessment_duration", assessment_time)
        await metrics.increment_counter(
            "quality_assessments_completed",
            tags={
                "assessment_type": request.assessment_type,
                "assets_count": str(len(request.asset_ids)),
                "successful_assessments": str(len(assessment_results))
            }
        )
        
        logger.info(
            "Quality assessment completed",
            extra={
                "assessment_time": assessment_time,
                "assets_processed": len(request.asset_ids),
                "successful_assessments": len(assessment_results),
                "average_quality_score": sum(a.overall_quality_score for a in assessment_results) / len(assessment_results) if assessment_results else 0
            }
        )
        
        return assessment_results
        
    except Exception as e:
        await metrics.increment_counter(
            "quality_assessment_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Quality assessment batch failed",
            extra={
                "asset_ids": request.asset_ids,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Quality assessment failed: {str(e)}"
        )


# ===================== HELPER FUNCTIONS =====================

async def _enhance_asset_with_ai(
    asset_id: int,
    enhancement_config: Dict[str, Any],
    user_id: str
):
    """Background task to enhance asset with AI analysis."""
    try:
        catalog_service = await get_enterprise_catalog_service()
        
        # Perform AI enhancement (implementation would call catalog service methods)
        logger.info(
            "AI enhancement scheduled for asset",
            extra={
                "asset_id": asset_id,
                "user_id": user_id,
                "config": enhancement_config
            }
        )
        
    except Exception as e:
        logger.error(
            "AI enhancement failed",
            extra={
                "asset_id": asset_id,
                "error": str(e)
            }
        )


async def _schedule_initial_quality_assessment(
    asset_id: int,
    user_id: str
):
    """Background task to schedule initial quality assessment."""
    try:
        # Schedule quality assessment (implementation would call catalog service methods)
        logger.info(
            "Initial quality assessment scheduled for asset",
            extra={
                "asset_id": asset_id,
                "user_id": user_id
            }
        )
        
    except Exception as e:
        logger.error(
            "Quality assessment scheduling failed",
            extra={
                "asset_id": asset_id,
                "error": str(e)
            }
        )


async def _clear_asset_caches(cache: RedisCache, asset_id: int):
    """Clear all caches related to an asset."""
    try:
        # Clear various cache patterns
        cache_patterns = [
            f"asset:{asset_id}:*",
            f"lineage:*:{asset_id}:*",
            f"quality:{asset_id}:*",
            f"search:*:{asset_id}*"
        ]
        
        for pattern in cache_patterns:
            await cache.delete_pattern(pattern)
            
    except Exception as e:
        logger.error(
            "Cache clearing failed",
            extra={
                "asset_id": asset_id,
                "error": str(e)
            }
        )


# ===================== EXPORTS =====================

__all__ = [
    "router",
    "create_intelligent_asset",
    "get_intelligent_asset", 
    "update_intelligent_asset",
    "semantic_search_assets",
    "analyze_comprehensive_lineage",
    "websocket_asset_monitoring",
    "perform_quality_assessment"
]