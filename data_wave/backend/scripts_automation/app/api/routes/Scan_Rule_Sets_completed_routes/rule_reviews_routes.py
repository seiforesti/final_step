"""
Rule Reviews API Routes for Scan-Rule-Sets Group
==============================================

Comprehensive API endpoints for rule review management, approval workflows,
and collaborative feedback systems.

Endpoints:
- Review lifecycle management (create, update, approve, reject)
- Comment and annotation systems
- Review metrics and analytics
- AI-powered review recommendations
- Approval workflow management
- Review assignment and notifications
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from app.core.database import get_db_session
from app.models.Scan-Rule-Sets-completed-models.enhanced_collaboration_models import (
    ReviewStatus, ReviewType, Priority,
    RuleReviewRequest, RuleReviewResponse,
    RuleCommentRequest, RuleCommentResponse
)
from app.services.Scan-Rule-Sets-completed-services.rule_review_service import RuleReviewService
from app.api.security.rbac import current_user, require_permissions
from app.utils.rate_limiter import check_rate_limit
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/rule-reviews", tags=["Rule Reviews"])

# Initialize service
rule_review_service = RuleReviewService()

# ===================== REVIEW MANAGEMENT =====================

@router.post(
    "/",
    response_model=RuleReviewResponse,
    summary="Create Rule Review",
    description="Create a new rule review with comprehensive workflow setup and automatic reviewer assignment."
)
@check_rate_limit("rule_review_create", max_calls=10, window_seconds=60)
async def create_review(
    review_request: RuleReviewRequest = Body(..., description="Rule review creation request"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> RuleReviewResponse:
    """
    Create a new rule review with comprehensive workflow setup.
    
    Features:
    - Automatic reviewer assignment based on expertise
    - Configurable approval workflows
    - Real-time notifications and alerts
    - Integration with rule lifecycle management
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        review = await rule_review_service.create_review(
            review_request=review_request,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Created rule review {review.id} for rule {review_request.rule_id}")
        return review
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating review: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/{review_id}",
    response_model=RuleReviewResponse,
    summary="Get Rule Review",
    description="Retrieve detailed information about a specific rule review including comments and workflow status."
)
async def get_review(
    review_id: uuid.UUID = Path(..., description="Review ID"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> RuleReviewResponse:
    """Get detailed review information with full context."""
    try:
        review = await rule_review_service.get_review(review_id=review_id, db=db)
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return review
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put(
    "/{review_id}/status",
    response_model=RuleReviewResponse,
    summary="Update Review Status",
    description="Update review status with comprehensive validation, notifications, and workflow progression."
)
@check_rate_limit("review_status_update", max_calls=20, window_seconds=60)
async def update_review_status(
    review_id: uuid.UUID = Path(..., description="Review ID"),
    new_status: ReviewStatus = Body(..., description="New review status"),
    notes: Optional[str] = Body(None, description="Status change notes"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> RuleReviewResponse:
    """
    Update review status with comprehensive workflow management.
    
    Features:
    - Status transition validation
    - Automatic workflow progression
    - Notification and alert systems
    - Audit trail maintenance
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        review = await rule_review_service.update_review_status(
            review_id=review_id,
            new_status=new_status,
            notes=notes,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Updated review {review_id} status to {new_status}")
        return review
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating review status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/",
    response_model=List[RuleReviewResponse],
    summary="List Reviews",
    description="Get a paginated list of reviews with comprehensive filtering and sorting options."
)
async def list_reviews(
    rule_id: Optional[uuid.UUID] = Query(None, description="Filter by rule ID"),
    reviewer_id: Optional[uuid.UUID] = Query(None, description="Filter by reviewer ID"),
    status: Optional[ReviewStatus] = Query(None, description="Filter by review status"),
    review_type: Optional[ReviewType] = Query(None, description="Filter by review type"),
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    skip: int = Query(0, ge=0, description="Number of reviews to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of reviews to return"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[RuleReviewResponse]:
    """Get paginated list of reviews with advanced filtering."""
    try:
        # Build filters
        filters = {}
        if rule_id:
            filters["rule_id"] = rule_id
        if reviewer_id:
            filters["reviewer_id"] = reviewer_id
        if status:
            filters["status"] = status
        if review_type:
            filters["review_type"] = review_type
        if priority:
            filters["priority"] = priority
        
        reviews = await rule_review_service.list_reviews(
            filters=filters,
            skip=skip,
            limit=limit,
            db=db
        )
        
        return reviews
        
    except Exception as e:
        logger.error(f"Error listing reviews: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== COMMENT MANAGEMENT =====================

@router.post(
    "/{review_id}/comments",
    response_model=RuleCommentResponse,
    summary="Add Review Comment",
    description="Add a comment to a review with comprehensive threading, mentions, and notification support."
)
@check_rate_limit("add_comment", max_calls=30, window_seconds=60)
async def add_comment(
    review_id: uuid.UUID = Path(..., description="Review ID"),
    comment_request: RuleCommentRequest = Body(..., description="Comment creation request"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> RuleCommentResponse:
    """
    Add a comment to a review with advanced features.
    
    Features:
    - Threaded comment discussions
    - @mentions with notifications
    - File attachments and code references
    - Real-time collaboration
    """
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        # Ensure review_id matches
        comment_request.review_id = review_id
        
        comment = await rule_review_service.add_comment(
            comment_request=comment_request,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Added comment {comment.id} to review {review_id}")
        return comment
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error adding comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/{review_id}/comments",
    response_model=List[RuleCommentResponse],
    summary="Get Review Comments",
    description="Retrieve all comments for a review with threading and pagination support."
)
async def get_review_comments(
    review_id: uuid.UUID = Path(..., description="Review ID"),
    include_resolved: bool = Query(True, description="Include resolved comments"),
    skip: int = Query(0, ge=0, description="Number of comments to skip"),
    limit: int = Query(100, ge=1, le=200, description="Maximum number of comments to return"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> List[RuleCommentResponse]:
    """Get all comments for a review with threading support."""
    try:
        comments = await rule_review_service.get_review_comments(
            review_id=review_id,
            include_resolved=include_resolved,
            skip=skip,
            limit=limit,
            db=db
        )
        
        return comments
        
    except Exception as e:
        logger.error(f"Error getting review comments: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put(
    "/comments/{comment_id}/resolve",
    response_model=RuleCommentResponse,
    summary="Resolve Comment",
    description="Mark a comment as resolved with optional resolution notes and tracking."
)
@check_rate_limit("resolve_comment", max_calls=20, window_seconds=60)
async def resolve_comment(
    comment_id: uuid.UUID = Path(..., description="Comment ID"),
    resolution_notes: Optional[str] = Body(None, description="Resolution notes"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> RuleCommentResponse:
    """Mark a comment as resolved with comprehensive tracking."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        comment = await rule_review_service.resolve_comment(
            comment_id=comment_id,
            resolution_notes=resolution_notes,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Resolved comment {comment_id}")
        return comment
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error resolving comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== REVIEW ANALYTICS =====================

@router.get(
    "/analytics/metrics",
    summary="Get Review Metrics",
    description="Get comprehensive review metrics and analytics with filtering and aggregation options."
)
async def get_review_metrics(
    rule_id: Optional[uuid.UUID] = Query(None, description="Filter by rule ID"),
    reviewer_id: Optional[uuid.UUID] = Query(None, description="Filter by reviewer ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for metrics"),
    end_date: Optional[datetime] = Query(None, description="End date for metrics"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Get comprehensive review metrics and analytics.
    
    Returns:
    - Review completion rates and timelines
    - Quality scores and trends
    - Reviewer performance metrics
    - Review type and priority distributions
    """
    try:
        date_range = None
        if start_date and end_date:
            date_range = (start_date, end_date)
        
        metrics = await rule_review_service.get_review_metrics(
            rule_id=rule_id,
            reviewer_id=reviewer_id,
            date_range=date_range,
            db=db
        )
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error getting review metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== AI-POWERED FEATURES =====================

@router.get(
    "/ai/recommendations/{rule_id}",
    summary="Get AI Review Recommendations",
    description="Get AI-powered review recommendations including reviewer suggestions and focus areas."
)
async def get_ai_review_recommendations(
    rule_id: uuid.UUID = Path(..., description="Rule ID"),
    review_type: ReviewType = Query(..., description="Type of review"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Get AI-powered review recommendations.
    
    Returns:
    - Suggested reviewers with expertise matching
    - Estimated review time and complexity
    - Focus areas and potential issues
    - Quality checklist and best practices
    """
    try:
        recommendations = await rule_review_service.get_ai_review_recommendations(
            rule_id=rule_id,
            review_type=review_type,
            db=db
        )
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting AI recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(
    "/{review_id}/auto-assign",
    response_model=RuleReviewResponse,
    summary="Auto-assign Reviewers",
    description="Automatically assign reviewers based on expertise, availability, and workload balancing."
)
@require_permissions(["review_management"])
async def auto_assign_reviewers(
    review_id: uuid.UUID = Path(..., description="Review ID"),
    max_reviewers: int = Body(3, ge=1, le=10, description="Maximum number of reviewers to assign"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> RuleReviewResponse:
    """Automatically assign reviewers using AI-powered matching."""
    try:
        review = await rule_review_service.auto_assign_reviewers(
            review_id=review_id,
            max_reviewers=max_reviewers,
            db=db
        )
        
        logger.info(f"Auto-assigned reviewers to review {review_id}")
        return review
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error auto-assigning reviewers: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== WORKFLOW MANAGEMENT =====================

@router.get(
    "/{review_id}/workflow",
    summary="Get Review Workflow",
    description="Get detailed workflow status and progression for a review including approval stages."
)
async def get_review_workflow(
    review_id: uuid.UUID = Path(..., description="Review ID"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Get detailed workflow information for a review."""
    try:
        workflow = await rule_review_service.get_review_workflow(
            review_id=review_id,
            db=db
        )
        
        return workflow
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting review workflow: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(
    "/{review_id}/workflow/advance",
    response_model=RuleReviewResponse,
    summary="Advance Review Workflow",
    description="Advance the review workflow to the next stage with validation and notifications."
)
@require_permissions(["review_management"])
async def advance_review_workflow(
    review_id: uuid.UUID = Path(..., description="Review ID"),
    force_advance: bool = Body(False, description="Force advancement even if prerequisites not met"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> RuleReviewResponse:
    """Advance review workflow to next stage."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        review = await rule_review_service.advance_workflow(
            review_id=review_id,
            force_advance=force_advance,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Advanced workflow for review {review_id}")
        return review
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error advancing review workflow: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== BULK OPERATIONS =====================

@router.post(
    "/bulk/assign",
    summary="Bulk Assign Reviews",
    description="Assign multiple reviews to reviewers with intelligent load balancing and expertise matching."
)
@require_permissions(["review_management"])
async def bulk_assign_reviews(
    review_ids: List[uuid.UUID] = Body(..., description="List of review IDs"),
    assignment_strategy: str = Body("auto", description="Assignment strategy (auto, round_robin, expertise)"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Bulk assign multiple reviews with intelligent strategies."""
    try:
        results = await rule_review_service.bulk_assign_reviews(
            review_ids=review_ids,
            assignment_strategy=assignment_strategy,
            db=db
        )
        
        logger.info(f"Bulk assigned {len(review_ids)} reviews")
        return results
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error bulk assigning reviews: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put(
    "/bulk/status",
    summary="Bulk Update Review Status",
    description="Update status for multiple reviews simultaneously with comprehensive validation."
)
@require_permissions(["review_management"])
async def bulk_update_review_status(
    review_ids: List[uuid.UUID] = Body(..., description="List of review IDs"),
    new_status: ReviewStatus = Body(..., description="New status for all reviews"),
    notes: Optional[str] = Body(None, description="Status change notes"),
    current_user_data: dict = Depends(current_user),
    db = Depends(get_db_session)
) -> Dict[str, Any]:
    """Bulk update status for multiple reviews."""
    try:
        current_user_id = uuid.UUID(current_user_data["user_id"])
        
        results = await rule_review_service.bulk_update_status(
            review_ids=review_ids,
            new_status=new_status,
            notes=notes,
            current_user_id=current_user_id,
            db=db
        )
        
        logger.info(f"Bulk updated status for {len(review_ids)} reviews")
        return results
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error bulk updating review status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")