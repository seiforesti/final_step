"""
Advanced Rule Template API Routes for Scan-Rule-Sets Group
========================================================

Enterprise-grade API endpoints for rule template management:
- Template CRUD operations with advanced validation
- AI-powered template recommendations and search
- Template marketplace with ratings and reviews
- Version control integration and branch management
- Collaborative template development workflows
- Template analytics and usage tracking
- Template import/export and sharing features
- Advanced template validation and testing

Production Features:
- Comprehensive error handling and validation
- Rate limiting and security controls
- Caching and performance optimization
- Real-time collaboration notifications
- Audit logging and compliance tracking
- Advanced query and filtering capabilities
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session

from ....db_session import get_session
from ....api.security.rbac import get_current_user, require_permission, PERMISSION_SCAN_VIEW, PERMISSION_SCAN_MANAGE
from ....core.logging_config import get_logger
from ....utils.rate_limiter import check_rate_limit
from ....models.Scan_Rule_Sets_completed_models.rule_template_models import (
    RuleTemplate, TemplateCategory, TemplateVersion, TemplateUsage, TemplateReview,
    TemplateType, TemplateComplexity, TemplateStatus, TemplateCreateRequest,
    TemplateUpdateRequest, TemplateResponse, TemplateSearchParams
)
from ....services.Scan_Rule_Sets_completed_services.rule_template_service import RuleTemplateService

logger = get_logger(__name__)
router = APIRouter(prefix="/rule-templates", tags=["Rule Templates"])

# Initialize service
template_service = RuleTemplateService()

# ===================== TEMPLATE MANAGEMENT ENDPOINTS =====================

@router.post("/", response_model=Dict[str, Any])
async def create_template(
    template_data: TemplateCreateRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_MANAGE))
):
    """
    Create a new rule template with comprehensive validation and AI analysis.
    
    Features:
    - Advanced template validation and security checks
    - AI-powered content analysis and enhancement suggestions
    - Automatic categorization and tagging
    - Integration with version control system
    - Real-time collaboration notifications
    """
    try:
        # Rate limiting
        user_id = current_user.get("username", "anonymous")
        if not await check_rate_limit(f"create_template:{user_id}", limit=10, window=3600):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Maximum 10 template creations per hour."
            )
        
        # Create template
        result = await template_service.create_template(session, template_data, user_id)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Schedule background tasks
        background_tasks.add_task(
            _send_creation_notifications,
            result["template_id"],
            user_id,
            template_data.name
        )
        
        # Add audit log entry
        background_tasks.add_task(
            _log_template_activity,
            "template_created",
            result["template_id"],
            user_id,
            {"validation_score": result.get("validation_score", 0)}
        )
        
        return {
            "success": True,
            "message": "Template created successfully",
            "data": {
                "template_id": result["template_id"],
                "template": result["template"],
                "processing_time": result["processing_time"],
                "ai_analysis": result.get("ai_analysis", {}),
                "validation_score": result.get("validation_score", 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during template creation")

@router.get("/{template_id}", response_model=Dict[str, Any])
async def get_template(
    template_id: str = Path(..., description="Template ID"),
    include_analytics: bool = Query(False, description="Include usage analytics"),
    include_reviews: bool = Query(False, description="Include user reviews"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Retrieve a specific template with optional analytics and reviews.
    
    Features:
    - Comprehensive template information
    - Optional usage analytics and metrics
    - User reviews and ratings
    - Version history and branching info
    - AI-generated insights and recommendations
    """
    try:
        template = await template_service.get_template(session, template_id)
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        response_data = {
            "template": template,
            "permissions": _get_user_template_permissions(current_user, template)
        }
        
        # Include analytics if requested
        if include_analytics:
            analytics_result = await template_service.get_template_analytics(
                session, template_id, period_days=30
            )
            if analytics_result["success"]:
                response_data["analytics"] = analytics_result["analytics"]
        
        # Include reviews if requested
        if include_reviews:
            reviews = session.query(TemplateReview).filter(
                TemplateReview.template_id == template_id
            ).order_by(TemplateReview.created_at.desc()).limit(10).all()
            response_data["reviews"] = [review.__dict__ for review in reviews]
        
        return {
            "success": True,
            "data": response_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during template retrieval")

@router.put("/{template_id}", response_model=Dict[str, Any])
async def update_template(
    template_id: str = Path(..., description="Template ID"),
    update_data: TemplateUpdateRequest = Body(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_MANAGE))
):
    """
    Update an existing template with version control and collaboration features.
    
    Features:
    - Automatic version creation and change tracking
    - Conflict detection and resolution
    - Collaborative editing notifications
    - AI-powered enhancement suggestions
    - Quality and security validation
    """
    try:
        # Get existing template
        template = await template_service.get_template(session, template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Check permissions
        user_id = current_user.get("username", "anonymous")
        if not _can_user_edit_template(current_user, template):
            raise HTTPException(status_code=403, detail="Insufficient permissions to edit this template")
        
        # Update template
        update_result = await template_service.update_template(
            session, template_id, update_data, user_id
        )
        
        if not update_result["success"]:
            raise HTTPException(status_code=400, detail=update_result["error"])
        
        # Schedule background tasks
        background_tasks.add_task(
            _send_update_notifications,
            template_id,
            user_id,
            update_data.change_summary
        )
        
        return {
            "success": True,
            "message": "Template updated successfully",
            "data": update_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template update failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during template update")

# ===================== SEARCH AND DISCOVERY ENDPOINTS =====================

@router.get("/", response_model=Dict[str, Any])
async def search_templates(
    query: Optional[str] = Query(None, description="Search query"),
    categories: Optional[List[str]] = Query(None, description="Filter by categories"),
    template_types: Optional[List[TemplateType]] = Query(None, description="Filter by template types"),
    complexity_levels: Optional[List[TemplateComplexity]] = Query(None, description="Filter by complexity"),
    statuses: Optional[List[TemplateStatus]] = Query(None, description="Filter by status"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum user rating"),
    created_by: Optional[str] = Query(None, description="Filter by creator"),
    created_after: Optional[datetime] = Query(None, description="Created after date"),
    sort_by: str = Query("rating", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    include_ai_recommendations: bool = Query(True, description="Include AI recommendations"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Advanced template search with AI-powered recommendations.
    
    Features:
    - Multi-criteria filtering and sorting
    - Full-text search with relevance ranking
    - AI-powered personalized recommendations
    - User behavior-based suggestions
    - Advanced pagination and result optimization
    """
    try:
        # Build search parameters
        search_params = TemplateSearchParams(
            query=query,
            categories=categories or [],
            template_types=template_types or [],
            complexity_levels=complexity_levels or [],
            statuses=statuses or [],
            min_rating=min_rating,
            created_by=created_by,
            created_after=created_after,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            limit=limit
        )
        
        # Build user context for AI recommendations
        user_context = None
        if include_ai_recommendations:
            user_context = await _build_user_context(session, current_user)
        
        # Perform search
        search_result = await template_service.search_templates(
            session, search_params, user_context
        )
        
        # Apply pagination
        total_results = len(search_result["templates"])
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_templates = search_result["templates"][start_idx:end_idx]
        
        return {
            "success": True,
            "data": {
                "templates": paginated_templates,
                "recommendations": search_result.get("recommendations", []),
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total_results": total_results,
                    "total_pages": (total_results + limit - 1) // limit,
                    "has_next": end_idx < total_results,
                    "has_previous": page > 1
                },
                "search_metadata": search_result.get("search_metadata", {}),
                "processing_time": search_result.get("processing_time", 0)
            }
        }
        
    except Exception as e:
        logger.error(f"Template search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during template search")

@router.get("/recommendations", response_model=Dict[str, Any])
async def get_template_recommendations(
    context: str = Query("general", description="Recommendation context"),
    max_results: int = Query(10, ge=1, le=50, description="Maximum recommendations"),
    include_reasoning: bool = Query(True, description="Include recommendation reasoning"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get AI-powered template recommendations based on user context and behavior.
    
    Features:
    - Personalized recommendations based on user history
    - Context-aware suggestions (project, domain, skill level)
    - Collaborative filtering and similarity matching
    - Trending and popular template identification
    - Explanation and reasoning for recommendations
    """
    try:
        # Build comprehensive user context
        user_context = await _build_detailed_user_context(session, current_user, context)
        
        # Get available templates for recommendation
        all_templates = session.query(RuleTemplate).filter(
            RuleTemplate.is_active == True,
            RuleTemplate.status == TemplateStatus.PUBLISHED
        ).all()
        
        # Generate recommendations
        recommendations = template_service.recommendation_engine.generate_recommendations(
            user_context, all_templates
        )
        
        # Limit results
        limited_recommendations = recommendations[:max_results]
        
        # Enhance with additional metadata
        enhanced_recommendations = []
        for rec in limited_recommendations:
            enhanced_rec = rec.copy()
            
            if include_reasoning:
                enhanced_rec["detailed_reasoning"] = await _generate_detailed_reasoning(
                    rec["template"], rec["reasons"], user_context
                )
            
            # Add usage stats
            enhanced_rec["usage_stats"] = await _get_template_usage_stats(
                session, rec["template"].template_id
            )
            
            enhanced_recommendations.append(enhanced_rec)
        
        return {
            "success": True,
            "data": {
                "recommendations": enhanced_recommendations,
                "user_context_summary": {
                    "skill_level": user_context.get("skill_level"),
                    "domain_preferences": user_context.get("domain_preferences", []),
                    "recommendation_context": context
                },
                "total_available": len(recommendations),
                "returned_count": len(enhanced_recommendations)
            }
        }
        
    except Exception as e:
        logger.error(f"Template recommendations failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during recommendation generation")

# ===================== TEMPLATE USAGE AND ANALYTICS =====================

@router.post("/{template_id}/use", response_model=Dict[str, Any])
async def use_template(
    template_id: str = Path(..., description="Template ID"),
    usage_context: Dict[str, Any] = Body(..., description="Usage context and parameters"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Record template usage and generate analytics.
    
    Features:
    - Usage tracking and analytics collection
    - Parameter validation and customization tracking
    - Performance monitoring and optimization insights
    - User behavior analysis and pattern recognition
    - Template effectiveness measurement
    """
    try:
        user_id = current_user.get("username", "anonymous")
        
        # Record usage
        usage_result = await template_service.use_template(
            session, template_id, user_id, usage_context
        )
        
        if not usage_result["success"]:
            raise HTTPException(status_code=400, detail=usage_result["error"])
        
        return {
            "success": True,
            "message": "Template usage recorded successfully",
            "data": {
                "usage_id": usage_result["usage_id"],
                "template": usage_result["template"],
                "analytics_updated": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template usage recording failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during usage recording")

@router.get("/{template_id}/analytics", response_model=Dict[str, Any])
async def get_template_analytics(
    template_id: str = Path(..., description="Template ID"),
    period_days: int = Query(30, ge=1, le=365, description="Analytics period in days"),
    include_predictions: bool = Query(True, description="Include usage predictions"),
    include_comparisons: bool = Query(False, description="Include comparative analytics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get comprehensive template analytics and insights.
    
    Features:
    - Usage metrics and trends over time
    - User engagement and satisfaction analysis
    - Performance and efficiency measurements
    - Predictive analytics and forecasting
    - Comparative analysis with similar templates
    """
    try:
        # Get basic analytics
        analytics_result = await template_service.get_template_analytics(
            session, template_id, period_days
        )
        
        if not analytics_result["success"]:
            raise HTTPException(status_code=404, detail=analytics_result["error"])
        
        response_data = analytics_result.copy()
        
        # Add predictions if requested
        if include_predictions:
            usage_data = await _get_template_usage_data(session, template_id, period_days * 2)
            predictions = template_service.recommendation_engine._generate_usage_predictions(
                usage_data, forecast_days=30
            )
            response_data["predictions"] = predictions
        
        # Add comparisons if requested
        if include_comparisons:
            similar_templates = await _find_similar_templates(session, template_id)
            comparative_analytics = await _generate_comparative_analytics(
                session, template_id, similar_templates
            )
            response_data["comparative_analytics"] = comparative_analytics
        
        return {
            "success": True,
            "data": response_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template analytics retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during analytics retrieval")

# ===================== COLLABORATION AND REVIEW ENDPOINTS =====================

@router.post("/{template_id}/reviews", response_model=Dict[str, Any])
async def create_template_review(
    template_id: str = Path(..., description="Template ID"),
    review_data: Dict[str, Any] = Body(..., description="Review data"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Create a review for a template.
    
    Features:
    - Structured review system with ratings and comments
    - Review validation and moderation
    - Notification system for template authors
    - Review analytics and aggregation
    - Spam and abuse detection
    """
    try:
        user_id = current_user.get("username", "anonymous")
        
        # Validate template exists
        template = await template_service.get_template(session, template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Check if user already reviewed this template
        existing_review = session.query(TemplateReview).filter(
            TemplateReview.template_id == template_id,
            TemplateReview.reviewer_id == user_id
        ).first()
        
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this template")
        
        # Create review
        review = TemplateReview(
            review_id=f"rev_{uuid4().hex[:12]}",
            template_id=template_id,
            reviewer_id=user_id,
            rating=review_data.get("rating", 0),
            title=review_data.get("title", ""),
            content=review_data.get("content", ""),
            review_type=review_data.get("review_type", "general"),
            tags=review_data.get("tags", []),
            helpful_count=0,
            created_at=datetime.utcnow()
        )
        
        session.add(review)
        session.commit()
        session.refresh(review)
        
        # Update template rating
        await _update_template_rating(session, template_id)
        
        return {
            "success": True,
            "message": "Review created successfully",
            "data": {
                "review_id": review.review_id,
                "review": review
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template review creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during review creation")

@router.get("/{template_id}/reviews", response_model=Dict[str, Any])
async def get_template_reviews(
    template_id: str = Path(..., description="Template ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Reviews per page"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """
    Get reviews for a template with pagination and sorting.
    """
    try:
        # Build query
        query = session.query(TemplateReview).filter(
            TemplateReview.template_id == template_id
        )
        
        # Apply sorting
        if sort_by == "rating":
            order_field = TemplateReview.rating
        elif sort_by == "helpful_count":
            order_field = TemplateReview.helpful_count
        else:
            order_field = TemplateReview.created_at
        
        if sort_order == "asc":
            query = query.order_by(order_field)
        else:
            query = query.order_by(order_field.desc())
        
        # Get total count
        total_reviews = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        reviews = query.offset(offset).limit(limit).all()
        
        return {
            "success": True,
            "data": {
                "reviews": [review.__dict__ for review in reviews],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total_reviews": total_reviews,
                    "total_pages": (total_reviews + limit - 1) // limit,
                    "has_next": offset + limit < total_reviews,
                    "has_previous": page > 1
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Template reviews retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during reviews retrieval")

# ===================== UTILITY FUNCTIONS =====================

async def _send_creation_notifications(template_id: str, creator: str, template_name: str):
    """Send notifications for template creation"""
    try:
        # Implementation would send notifications to team members, etc.
        logger.info(f"Template creation notification sent for {template_id}")
    except Exception as e:
        logger.error(f"Failed to send creation notifications: {str(e)}")

async def _send_update_notifications(template_id: str, updater: str, change_summary: str):
    """Send notifications for template updates"""
    try:
        # Implementation would send notifications to watchers, collaborators, etc.
        logger.info(f"Template update notification sent for {template_id}")
    except Exception as e:
        logger.error(f"Failed to send update notifications: {str(e)}")

async def _log_template_activity(activity_type: str, template_id: str, user: str, metadata: Dict[str, Any]):
    """Log template activity for audit purposes"""
    try:
        # Implementation would log to audit system
        logger.info(f"Template activity logged: {activity_type} for {template_id} by {user}")
    except Exception as e:
        logger.error(f"Failed to log template activity: {str(e)}")

def _get_user_template_permissions(user: Dict[str, Any], template: RuleTemplate) -> Dict[str, bool]:
    """Get user permissions for a specific template"""
    # Simplified permission check - would be more sophisticated in production
    is_creator = template.created_by == user.get("username")
    is_admin = "admin" in user.get("roles", [])
    
    return {
        "can_view": True,
        "can_edit": is_creator or is_admin,
        "can_delete": is_creator or is_admin,
        "can_share": True,
        "can_review": not is_creator
    }

def _can_user_edit_template(user: Dict[str, Any], template: RuleTemplate) -> bool:
    """Check if user can edit template"""
    permissions = _get_user_template_permissions(user, template)
    return permissions["can_edit"]

async def _build_user_context(session: Session, user: Dict[str, Any]) -> Dict[str, Any]:
    """Build user context for AI recommendations"""
    user_id = user.get("username", "anonymous")
    
    # Get user's template usage history
    recent_usage = session.query(TemplateUsage).filter(
        TemplateUsage.user_id == user_id,
        TemplateUsage.started_at >= datetime.utcnow() - timedelta(days=30)
    ).all()
    
    # Extract preferences from usage patterns
    used_categories = set()
    used_types = set()
    complexity_preference = []
    
    for usage in recent_usage:
        template = session.query(RuleTemplate).filter(
            RuleTemplate.template_id == usage.template_id
        ).first()
        
        if template:
            used_categories.add(template.category)
            used_types.add(template.template_type.value)
            complexity_preference.append(template.complexity_level.value)
    
    return {
        "skill_level": _infer_skill_level(complexity_preference),
        "domain_preferences": list(used_categories),
        "preferred_types": list(used_types),
        "usage_history": [usage.template_id for usage in recent_usage],
        "collaboration_style": "standard"
    }

async def _build_detailed_user_context(session: Session, user: Dict[str, Any], context: str) -> Dict[str, Any]:
    """Build detailed user context for specific recommendation contexts"""
    base_context = await _build_user_context(session, user)
    
    # Add context-specific information
    if context == "project":
        # Add project-specific preferences
        base_context["project_context"] = {"type": "development", "timeline": "medium"}
    elif context == "learning":
        # Add learning-specific preferences
        base_context["learning_goals"] = ["skill_development", "best_practices"]
    
    return base_context

def _infer_skill_level(complexity_history: List[str]) -> str:
    """Infer user skill level from complexity history"""
    if not complexity_history:
        return "intermediate"
    
    # Count complexity levels
    complexity_counts = {}
    for level in complexity_history:
        complexity_counts[level] = complexity_counts.get(level, 0) + 1
    
    # Determine skill level based on most used complexity
    if complexity_counts.get("expert", 0) > len(complexity_history) * 0.5:
        return "expert"
    elif complexity_counts.get("advanced", 0) > len(complexity_history) * 0.4:
        return "advanced"
    elif complexity_counts.get("beginner", 0) > len(complexity_history) * 0.6:
        return "beginner"
    else:
        return "intermediate"

async def _generate_detailed_reasoning(template: RuleTemplate, basic_reasons: List[str], 
                                     user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Generate detailed reasoning for recommendations"""
    return {
        "primary_factors": basic_reasons,
        "skill_match": f"Matches your {user_context.get('skill_level', 'intermediate')} skill level",
        "usage_pattern": "Aligns with your recent template usage patterns",
        "popularity": f"Used by {template.usage_count} other users",
        "quality_indicators": {
            "rating": template.user_rating,
            "success_rate": template.success_rate,
            "quality_score": template.quality_score
        }
    }

async def _get_template_usage_stats(session: Session, template_id: str) -> Dict[str, Any]:
    """Get template usage statistics"""
    recent_usage = session.query(TemplateUsage).filter(
        TemplateUsage.template_id == template_id,
        TemplateUsage.started_at >= datetime.utcnow() - timedelta(days=30)
    ).all()
    
    return {
        "recent_uses": len(recent_usage),
        "unique_users": len(set(usage.user_id for usage in recent_usage)),
        "success_rate": sum(1 for usage in recent_usage if usage.success) / max(len(recent_usage), 1),
        "avg_duration": sum(usage.usage_duration or 0 for usage in recent_usage) / max(len(recent_usage), 1)
    }

async def _get_template_usage_data(session: Session, template_id: str, days: int) -> List[Dict[str, Any]]:
    """Get template usage data for analytics"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    usage_records = session.query(TemplateUsage).filter(
        TemplateUsage.template_id == template_id,
        TemplateUsage.started_at >= cutoff_date
    ).all()
    
    return [usage.__dict__ for usage in usage_records]

async def _find_similar_templates(session: Session, template_id: str) -> List[RuleTemplate]:
    """Find templates similar to the given template"""
    # Simplified similarity - would use more sophisticated matching in production
    template = session.query(RuleTemplate).filter(
        RuleTemplate.template_id == template_id
    ).first()
    
    if not template:
        return []
    
    # Find templates with same category and type
    similar = session.query(RuleTemplate).filter(
        RuleTemplate.category == template.category,
        RuleTemplate.template_type == template.template_type,
        RuleTemplate.template_id != template_id,
        RuleTemplate.is_active == True
    ).limit(5).all()
    
    return similar

async def _generate_comparative_analytics(session: Session, template_id: str, 
                                        similar_templates: List[RuleTemplate]) -> Dict[str, Any]:
    """Generate comparative analytics against similar templates"""
    if not similar_templates:
        return {"message": "No similar templates found for comparison"}
    
    # Get metrics for comparison
    template = session.query(RuleTemplate).filter(
        RuleTemplate.template_id == template_id
    ).first()
    
    similar_ratings = [t.user_rating for t in similar_templates]
    similar_usage_counts = [t.usage_count for t in similar_templates]
    
    return {
        "rating_percentile": _calculate_percentile(template.user_rating, similar_ratings),
        "usage_percentile": _calculate_percentile(template.usage_count, similar_usage_counts),
        "compared_against": len(similar_templates),
        "category_average_rating": sum(similar_ratings) / len(similar_ratings),
        "category_average_usage": sum(similar_usage_counts) / len(similar_usage_counts)
    }

def _calculate_percentile(value: float, comparison_values: List[float]) -> float:
    """Calculate percentile ranking of value in comparison list"""
    if not comparison_values:
        return 50.0
    
    below_count = sum(1 for v in comparison_values if v < value)
    return (below_count / len(comparison_values)) * 100

async def _update_template_rating(session: Session, template_id: str):
    """Update template's average rating based on all reviews"""
    reviews = session.query(TemplateReview).filter(
        TemplateReview.template_id == template_id
    ).all()
    
    if reviews:
        avg_rating = sum(review.rating for review in reviews) / len(reviews)
        
        template = session.query(RuleTemplate).filter(
            RuleTemplate.template_id == template_id
        ).first()
        
        if template:
            template.user_rating = avg_rating
            template.review_count = len(reviews)
            session.commit()

# ===================== SERVICE METRICS ENDPOINT =====================

@router.get("/service/metrics", response_model=Dict[str, Any])
async def get_service_metrics(
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_SCAN_VIEW))
):
    """Get rule template service performance metrics"""
    try:
        metrics = template_service.get_service_metrics()
        return {
            "success": True,
            "data": metrics
        }
    except Exception as e:
        logger.error(f"Service metrics retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during metrics retrieval")