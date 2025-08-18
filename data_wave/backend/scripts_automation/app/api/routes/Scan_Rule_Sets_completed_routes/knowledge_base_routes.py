"""
Knowledge Base API Routes for Scan-Rule-Sets Group
================================================

Comprehensive API endpoints for knowledge base management, expert consultation,
and institutional knowledge preservation systems.

Endpoints:
- Knowledge base content management (create, search, categorize)
- Expert consultation and scheduling
- Knowledge analytics and gap analysis
- AI-powered knowledge discovery and recommendations
- Knowledge sharing and collaboration
- Content approval and versioning workflows
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from app.db_session import get_db_session
from app.models.Scan_Rule_Sets_completed_models.enhanced_collaboration_models import (
    KnowledgeType, ConsultationStatus, ExpertiseLevel,
    KnowledgeBaseRequest, KnowledgeBaseResponse,
    ExpertConsultationRequest, ExpertConsultationResponse
)
from app.services.Scan_Rule_Sets_completed_services.knowledge_management_service import KnowledgeManagementService
from ...security.rbac import get_current_user as current_user, require_permissions
from app.utils.rate_limiter import rate_limit
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

# Initialize service
knowledge_service = KnowledgeManagementService()

# ===================== KNOWLEDGE BASE MANAGEMENT =====================

@router.post(
    "/",
    response_model=KnowledgeBaseResponse,
    summary="Create Knowledge Item",
    description="Create a new knowledge base item with AI-powered enhancement and categorization."
)
@rate_limit(requests=20, window=60)
async def create_knowledge_item(
    knowledge_request: KnowledgeBaseRequest = Body(..., description="Knowledge item creation request"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> KnowledgeBaseResponse:
    """
    Create a new knowledge base item with advanced features.
    
    Features:
    - AI-powered content enhancement and structuring
    - Automatic categorization and tagging
    - Semantic embeddings for advanced search
    - Integration with rule and review systems
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        knowledge_item = await knowledge_service.create_knowledge_item(
            knowledge_request=knowledge_request,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Created knowledge item {knowledge_item.id}: {knowledge_item.title}")
        return knowledge_item
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/{item_id}",
    response_model=KnowledgeBaseResponse,
    summary="Get Knowledge Item",
    description="Retrieve detailed information about a specific knowledge base item."
)
async def get_knowledge_item(
    item_id: uuid.UUID = Path(..., description="Knowledge item ID"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> KnowledgeBaseResponse:
    """Get detailed knowledge item information."""
    try:
        item = await knowledge_service.get_knowledge_item(item_id=item_id, db=db)
        
        if not item:
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        return item
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting knowledge item {item_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/search",
    response_model=List[KnowledgeBaseResponse],
    summary="Search Knowledge Base",
    description="Advanced knowledge search with semantic understanding, filtering, and ranking."
)
async def search_knowledge(
    query: str = Query(..., description="Search query"),
    knowledge_type: Optional[KnowledgeType] = Query(None, description="Filter by knowledge type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty_level: Optional[str] = Query(None, description="Filter by difficulty level"),
    semantic_search: bool = Query(True, description="Enable semantic search"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[KnowledgeBaseResponse]:
    """
    Advanced knowledge search with multiple search modes.
    
    Features:
    - Semantic search using AI embeddings
    - Traditional text-based search
    - Category and type filtering
    - Relevance ranking and scoring
    """
    try:
        results = await knowledge_service.search_knowledge(
            query=query,
            knowledge_type=knowledge_type,
            category=category,
            difficulty_level=difficulty_level,
            limit=limit,
            semantic_search=semantic_search,
            db=db
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Error searching knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/recommendations",
    response_model=List[KnowledgeBaseResponse],
    summary="Get Knowledge Recommendations",
    description="Get personalized knowledge recommendations based on user activity and context."
)
async def get_knowledge_recommendations(
    context: Optional[Dict[str, Any]] = Body(None, description="Context information for recommendations"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recommendations"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[KnowledgeBaseResponse]:
    """
    Get personalized knowledge recommendations.
    
    Features:
    - AI-powered content recommendations
    - User behavior and preference analysis
    - Context-aware suggestions
    - Learning path optimization
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        recommendations = await knowledge_service.get_knowledge_recommendations(
            user_id=current_user_id,
            context=context,
            limit=limit,
            db=db
        )
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting knowledge recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put(
    "/{item_id}",
    response_model=KnowledgeBaseResponse,
    summary="Update Knowledge Item",
    description="Update a knowledge base item with versioning and change tracking."
)
@rate_limit(requests=30, window=60)
async def update_knowledge_item(
    item_id: uuid.UUID = Path(..., description="Knowledge item ID"),
    update_data: Dict[str, Any] = Body(..., description="Update data"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> KnowledgeBaseResponse:
    """Update knowledge item with comprehensive versioning."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        updated_item = await knowledge_service.update_knowledge_item(
            item_id=item_id,
            update_data=update_data,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Updated knowledge item {item_id}")
        return updated_item
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== EXPERT CONSULTATION =====================

@router.post(
    "/consultations",
    response_model=ExpertConsultationResponse,
    summary="Request Expert Consultation",
    description="Request expert consultation with automatic expert matching and scheduling."
)
@rate_limit(requests=5, window=60)
async def request_expert_consultation(
    consultation_request: ExpertConsultationRequest = Body(..., description="Consultation request"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> ExpertConsultationResponse:
    """
    Request expert consultation with intelligent matching.
    
    Features:
    - AI-powered expert matching based on expertise and availability
    - Automatic scheduling and calendar integration
    - Context-aware preparation materials
    - Real-time communication setup
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        consultation = await knowledge_service.request_expert_consultation(
            consultation_request=consultation_request,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Created expert consultation {consultation.id}")
        return consultation
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error requesting expert consultation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/consultations/{consultation_id}",
    response_model=ExpertConsultationResponse,
    summary="Get Expert Consultation",
    description="Retrieve detailed information about a specific expert consultation."
)
async def get_expert_consultation(
    consultation_id: uuid.UUID = Path(..., description="Consultation ID"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> ExpertConsultationResponse:
    """Get detailed consultation information."""
    try:
        consultation = await knowledge_service.get_expert_consultation(
            consultation_id=consultation_id,
            db=db
        )
        
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        return consultation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting consultation {consultation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/experts/{expert_id}/availability",
    summary="Get Expert Availability",
    description="Get expert availability for scheduling consultations."
)
async def get_expert_availability(
    expert_id: uuid.UUID = Path(..., description="Expert ID"),
    start_date: datetime = Query(..., description="Start date for availability window"),
    end_date: datetime = Query(..., description="End date for availability window"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[Dict[str, Any]]:
    """Get expert availability slots for consultation scheduling."""
    try:
        availability = await knowledge_service.get_expert_availability(
            expert_id=expert_id,
            start_date=start_date,
            end_date=end_date,
            db=db
        )
        
        return availability
        
    except Exception as e:
        logger.error(f"Error getting expert availability: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put(
    "/consultations/{consultation_id}/status",
    response_model=ExpertConsultationResponse,
    summary="Update Consultation Status",
    description="Update consultation status with comprehensive tracking and notifications."
)
@require_permissions(["consultation_management"])
async def update_consultation_status(
    consultation_id: uuid.UUID = Path(..., description="Consultation ID"),
    new_status: ConsultationStatus = Body(..., description="New consultation status"),
    notes: Optional[str] = Body(None, description="Status change notes"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> ExpertConsultationResponse:
    """Update consultation status with comprehensive tracking."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        consultation = await knowledge_service.update_consultation_status(
            consultation_id=consultation_id,
            new_status=new_status,
            notes=notes,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Updated consultation {consultation_id} status to {new_status}")
        return consultation
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating consultation status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== KNOWLEDGE ANALYTICS =====================

@router.get(
    "/analytics",
    summary="Get Knowledge Analytics",
    description="Get comprehensive knowledge base analytics and insights."
)
async def get_knowledge_analytics(
    start_date: Optional[datetime] = Query(None, description="Start date for analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for analytics"),
    knowledge_type: Optional[KnowledgeType] = Query(None, description="Filter by knowledge type"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Get comprehensive knowledge base analytics.
    
    Returns:
    - Usage statistics and trends
    - Content performance metrics
    - Knowledge gap analysis
    - User engagement patterns
    """
    try:
        time_period = None
        if start_date and end_date:
            time_period = (start_date, end_date)
        
        analytics = await knowledge_service.get_knowledge_analytics(
            time_period=time_period,
            knowledge_type=knowledge_type,
            db=db
        )
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting knowledge analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/analytics/gaps",
    summary="Identify Knowledge Gaps",
    description="Identify knowledge gaps and content opportunities using AI analysis."
)
async def identify_knowledge_gaps(
    analysis_scope: Optional[str] = Query("all", description="Scope of gap analysis"),
    confidence_threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum confidence for gap identification"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Identify knowledge gaps using AI analysis.
    
    Returns:
    - Identified knowledge gaps
    - Priority rankings
    - Suggested content areas
    - Implementation recommendations
    """
    try:
        gaps = await knowledge_service.identify_knowledge_gaps(
            analysis_scope=analysis_scope,
            confidence_threshold=confidence_threshold,
            db=db
        )
        
        return gaps
        
    except Exception as e:
        logger.error(f"Error identifying knowledge gaps: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== CONTENT MANAGEMENT =====================

@router.post(
    "/{item_id}/vote",
    summary="Vote on Knowledge Item",
    description="Vote on the usefulness of a knowledge base item."
)
@rate_limit(requests=50, window=60)
async def vote_on_knowledge_item(
    item_id: uuid.UUID = Path(..., description="Knowledge item ID"),
    vote_type: str = Body(..., description="Vote type (useful, not_useful)"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Vote on knowledge item usefulness."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        result = await knowledge_service.vote_on_item(
            item_id=item_id,
            vote_type=vote_type,
            user_id=current_user_id,
            db=db
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error voting on knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(
    "/{item_id}/bookmark",
    summary="Bookmark Knowledge Item",
    description="Bookmark a knowledge item for quick access."
)
@rate_limit(requests=100, window=60)
async def bookmark_knowledge_item(
    item_id: uuid.UUID = Path(..., description="Knowledge item ID"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Bookmark knowledge item for user."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        result = await knowledge_service.bookmark_item(
            item_id=item_id,
            user_id=current_user_id,
            db=db
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error bookmarking knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/categories",
    summary="Get Knowledge Categories",
    description="Get all available knowledge categories with statistics."
)
async def get_knowledge_categories(
    include_stats: bool = Query(True, description="Include category statistics"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[Dict[str, Any]]:
    """Get all knowledge categories with optional statistics."""
    try:
        categories = await knowledge_service.get_categories(
            include_stats=include_stats,
            db=db
        )
        
        return categories
        
    except Exception as e:
        logger.error(f"Error getting knowledge categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== COLLABORATION FEATURES =====================

@router.post(
    "/{item_id}/share",
    summary="Share Knowledge Item",
    description="Share a knowledge item with specific users or teams."
)
@rate_limit(requests=20, window=60)
async def share_knowledge_item(
    item_id: uuid.UUID = Path(..., description="Knowledge item ID"),
    share_data: Dict[str, Any] = Body(..., description="Share configuration"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Share knowledge item with users or teams."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        result = await knowledge_service.share_item(
            item_id=item_id,
            share_data=share_data,
            shared_by=current_user_id,
            db=db
        )
        
        logger.info(f"Shared knowledge item {item_id}")
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error sharing knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/trending",
    response_model=List[KnowledgeBaseResponse],
    summary="Get Trending Knowledge",
    description="Get trending knowledge items based on views, votes, and engagement."
)
async def get_trending_knowledge(
    time_window: str = Query("week", description="Time window for trending analysis"),
    limit: int = Query(20, ge=1, le=50, description="Maximum number of trending items"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[KnowledgeBaseResponse]:
    """Get trending knowledge items based on engagement metrics."""
    try:
        trending = await knowledge_service.get_trending_knowledge(
            time_window=time_window,
            limit=limit,
            db=db
        )
        
        return trending
        
    except Exception as e:
        logger.error(f"Error getting trending knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== BULK OPERATIONS =====================

@router.post(
    "/bulk/import",
    summary="Bulk Import Knowledge",
    description="Import multiple knowledge items from external sources or file upload."
)
@require_permissions(["knowledge_management"])
async def bulk_import_knowledge(
    import_config: Dict[str, Any] = Body(..., description="Import configuration"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Bulk import knowledge items with validation and processing."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        result = await knowledge_service.bulk_import(
            import_config=import_config,
            imported_by=current_user_id,
            db=db
        )
        
        logger.info(f"Bulk imported knowledge items")
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error bulk importing knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(
    "/bulk/update-categories",
    summary="Bulk Update Categories",
    description="Update categories for multiple knowledge items simultaneously."
)
@require_permissions(["knowledge_management"])
async def bulk_update_categories(
    item_ids: List[uuid.UUID] = Body(..., description="List of knowledge item IDs"),
    new_category: str = Body(..., description="New category name"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Bulk update categories for multiple knowledge items."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        result = await knowledge_service.bulk_update_categories(
            item_ids=item_ids,
            new_category=new_category,
            updated_by=current_user_id,
            db=db
        )
        
        logger.info(f"Bulk updated categories for {len(item_ids)} items")
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error bulk updating categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")