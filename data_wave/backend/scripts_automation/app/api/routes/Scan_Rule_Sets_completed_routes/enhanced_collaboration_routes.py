"""
🔧 Enhanced Collaboration Routes for Scan-Rule-Sets Group
=========================================================

This module provides comprehensive API endpoints for team collaboration,
including collaboration hubs, review workflows, advanced commenting,
and knowledge base management.

Key Features:
- Team collaboration hubs with workspace management
- Advanced review workflows with approval processes
- Real-time commenting and annotation systems
- Knowledge sharing and documentation
- Expert consultation and advisory features
- Discussion forums and Q&A
- Collaborative rule development
- Team performance analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, UploadFile, File
from sqlmodel import Session, select
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta

from app.core.database import get_session
from app.api.security.rbac import require_permission, get_current_user
from app.utils.rate_limiter import check_rate_limit
from app.core.logging_config import get_logger
from app.models.Scan-Rule-Sets-completed-models.enhanced_collaboration_models import (
    TeamCollaborationHub, TeamMember, RuleReview, Comment, KnowledgeItem,
    Discussion, TeamCollaborationHubCreate, TeamMemberCreate, RuleReviewCreate,
    CommentCreate, KnowledgeItemCreate, DiscussionCreate, TeamHubResponse,
    TeamMemberResponse, RuleReviewResponse, CommentResponse, KnowledgeItemResponse,
    DiscussionResponse, CollaborationAnalyticsResponse
)
from app.services.Scan-Rule-Sets-completed-services.enhanced_collaboration_service import EnhancedCollaborationService
from app.models.response_models import StandardResponse

# Initialize router and logger
router = APIRouter(prefix="/enhanced-collaboration", tags=["Enhanced Collaboration"])
logger = get_logger(__name__)

# Permission constants
PERMISSION_COLLABORATION_VIEW = "collaboration:view"
PERMISSION_COLLABORATION_PARTICIPATE = "collaboration:participate"
PERMISSION_COLLABORATION_MODERATE = "collaboration:moderate"
PERMISSION_COLLABORATION_ADMIN = "collaboration:admin"
PERMISSION_TEAM_MANAGE = "team:manage"
PERMISSION_REVIEW_SUBMIT = "review:submit"
PERMISSION_REVIEW_APPROVE = "review:approve"
PERMISSION_KNOWLEDGE_CONTRIBUTE = "knowledge:contribute"
PERMISSION_KNOWLEDGE_MODERATE = "knowledge:moderate"


# ===============================
# TEAM COLLABORATION HUB ENDPOINTS
# ===============================

@router.post("/teams", response_model=StandardResponse)
async def create_team_collaboration_hub(
    team_data: TeamCollaborationHubCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_TEAM_MANAGE))
):
    """
    Create a new team collaboration hub with workspace setup
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Create team hub
        team_hub = await collaboration_service.create_team_hub(
            session=session,
            team_name=team_data.team_name,
            description=team_data.description,
            team_type=team_data.team_type,
            owner_id=current_user.get("id"),
            initial_members=team_data.initial_members,
            settings=team_data.settings
        )
        
        logger.info(f"Created team collaboration hub: {team_hub.team_name}")
        
        return StandardResponse(
            success=True,
            message="Team collaboration hub created successfully",
            data={
                "team_id": team_hub.id,
                "team_name": team_hub.team_name,
                "workspace_url": team_hub.workspace_url,
                "created_at": team_hub.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create team hub: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create team hub: {str(e)}")


@router.get("/teams/{team_id}", response_model=TeamHubResponse)
async def get_team_collaboration_hub(
    team_id: int,
    include_members: bool = Query(default=True, description="Include team members"),
    include_activity: bool = Query(default=True, description="Include recent activity"),
    include_analytics: bool = Query(default=False, description="Include team analytics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
):
    """
    Get detailed information about a team collaboration hub
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Get team hub details
        team_hub = await collaboration_service.get_team_hub(
            session=session,
            team_id=team_id,
            user_id=current_user.get("id"),
            include_members=include_members,
            include_activity=include_activity,
            include_analytics=include_analytics
        )
        
        if not team_hub:
            raise HTTPException(status_code=404, detail="Team hub not found")
        
        return TeamHubResponse(
            id=team_hub.id,
            team_name=team_hub.team_name,
            description=team_hub.description,
            team_type=team_hub.team_type,
            owner_id=team_hub.owner_id,
            workspace_url=team_hub.workspace_url,
            is_active=team_hub.is_active,
            visibility=team_hub.visibility,
            settings=team_hub.settings,
            created_at=team_hub.created_at,
            updated_at=team_hub.updated_at,
            members=team_hub.members if include_members else [],
            recent_activity=team_hub.recent_activity if include_activity else [],
            analytics=team_hub.analytics if include_analytics else {}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get team hub {team_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team hub")


@router.get("/teams", response_model=List[TeamHubResponse])
async def list_team_collaboration_hubs(
    user_teams_only: bool = Query(default=False, description="Show only user's teams"),
    team_type: Optional[str] = Query(default=None, description="Filter by team type"),
    include_archived: bool = Query(default=False, description="Include archived teams"),
    limit: int = Query(default=50, le=100, description="Maximum teams to return"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
):
    """
    List team collaboration hubs with filtering options
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Get team hubs
        team_hubs = await collaboration_service.list_team_hubs(
            session=session,
            user_id=current_user.get("id") if user_teams_only else None,
            team_type=team_type,
            include_archived=include_archived,
            limit=limit
        )
        
        return [
            TeamHubResponse(
                id=hub.id,
                team_name=hub.team_name,
                description=hub.description,
                team_type=hub.team_type,
                owner_id=hub.owner_id,
                workspace_url=hub.workspace_url,
                is_active=hub.is_active,
                visibility=hub.visibility,
                settings=hub.settings,
                created_at=hub.created_at,
                updated_at=hub.updated_at,
                member_count=getattr(hub, 'member_count', 0),
                activity_score=getattr(hub, 'activity_score', 0)
            ) for hub in team_hubs
        ]
        
    except Exception as e:
        logger.error(f"Failed to list team hubs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team hubs")


@router.post("/teams/{team_id}/members", response_model=StandardResponse)
async def add_team_member(
    team_id: int,
    member_data: TeamMemberCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_TEAM_MANAGE))
):
    """
    Add a new member to a team collaboration hub
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Add team member
        member = await collaboration_service.add_team_member(
            session=session,
            team_id=team_id,
            user_id=member_data.user_id,
            role=member_data.role,
            permissions=member_data.permissions,
            added_by=current_user.get("id")
        )
        
        if not member:
            raise HTTPException(status_code=404, detail="Team not found or user already a member")
        
        return StandardResponse(
            success=True,
            message="Team member added successfully",
            data={
                "member_id": member.id,
                "user_id": member.user_id,
                "role": member.role,
                "joined_at": member.joined_at
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add team member: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add team member")


# ===============================
# RULE REVIEW WORKFLOW ENDPOINTS
# ===============================

@router.post("/reviews", response_model=StandardResponse)
async def create_rule_review(
    review_data: RuleReviewCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_REVIEW_SUBMIT))
):
    """
    Create a new rule review with workflow automation
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Create rule review
        review = await collaboration_service.create_rule_review(
            session=session,
            rule_id=review_data.rule_id,
            review_type=review_data.review_type,
            title=review_data.title,
            description=review_data.description,
            requested_by=current_user.get("id"),
            reviewers=review_data.reviewers,
            priority=review_data.priority,
            due_date=review_data.due_date
        )
        
        # Background task for review notifications
        background_tasks.add_task(
            collaboration_service.send_review_notifications,
            session, review.id
        )
        
        logger.info(f"Created rule review {review.id} for rule {review_data.rule_id}")
        
        return StandardResponse(
            success=True,
            message="Rule review created successfully",
            data={
                "review_id": review.id,
                "rule_id": review.rule_id,
                "status": review.status,
                "created_at": review.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create rule review: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")


@router.get("/reviews/{review_id}", response_model=RuleReviewResponse)
async def get_rule_review(
    review_id: int,
    include_comments: bool = Query(default=True, description="Include review comments"),
    include_history: bool = Query(default=False, description="Include review history"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
):
    """
    Get detailed information about a rule review
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Get review details
        review = await collaboration_service.get_rule_review(
            session=session,
            review_id=review_id,
            user_id=current_user.get("id"),
            include_comments=include_comments,
            include_history=include_history
        )
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return RuleReviewResponse(
            id=review.id,
            rule_id=review.rule_id,
            review_type=review.review_type,
            title=review.title,
            description=review.description,
            status=review.status,
            priority=review.priority,
            requested_by=review.requested_by,
            assigned_reviewers=review.assigned_reviewers,
            approved_by=review.approved_by,
            rejected_by=review.rejected_by,
            due_date=review.due_date,
            created_at=review.created_at,
            updated_at=review.updated_at,
            completed_at=review.completed_at,
            metadata=review.metadata,
            comments=review.comments if include_comments else [],
            history=review.history if include_history else []
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get rule review {review_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve review")


@router.put("/reviews/{review_id}/status", response_model=StandardResponse)
async def update_review_status(
    review_id: int,
    new_status: str,
    review_comment: Optional[str] = None,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_REVIEW_APPROVE))
):
    """
    Update the status of a rule review (approve, reject, request changes)
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Update review status
        review = await collaboration_service.update_review_status(
            session=session,
            review_id=review_id,
            new_status=new_status,
            reviewer_id=current_user.get("id"),
            review_comment=review_comment
        )
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Background task for status notifications
        background_tasks.add_task(
            collaboration_service.send_status_update_notifications,
            session, review_id, new_status
        )
        
        logger.info(f"Updated review {review_id} status to {new_status}")
        
        return StandardResponse(
            success=True,
            message=f"Review status updated to {new_status}",
            data={
                "review_id": review_id,
                "new_status": new_status,
                "updated_by": current_user.get("username"),
                "updated_at": datetime.now()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update review status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update review status")


# ===============================
# COMMENTING SYSTEM ENDPOINTS
# ===============================

@router.post("/comments", response_model=StandardResponse)
async def create_comment(
    comment_data: CommentCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_PARTICIPATE))
):
    """
    Create a new comment with advanced annotation features
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Create comment
        comment = await collaboration_service.create_comment(
            session=session,
            entity_type=comment_data.entity_type,
            entity_id=comment_data.entity_id,
            content=comment_data.content,
            comment_type=comment_data.comment_type,
            author_id=current_user.get("id"),
            parent_comment_id=comment_data.parent_comment_id,
            mentions=comment_data.mentions,
            attachments=comment_data.attachments,
            annotations=comment_data.annotations
        )
        
        logger.info(f"Created comment {comment.id} for {comment_data.entity_type} {comment_data.entity_id}")
        
        return StandardResponse(
            success=True,
            message="Comment created successfully",
            data={
                "comment_id": comment.id,
                "entity_type": comment.entity_type,
                "entity_id": comment.entity_id,
                "created_at": comment.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create comment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create comment: {str(e)}")


@router.get("/comments/{entity_type}/{entity_id}", response_model=List[CommentResponse])
async def get_entity_comments(
    entity_type: str,
    entity_id: int,
    include_replies: bool = Query(default=True, description="Include comment replies"),
    sort_order: str = Query(default="newest", description="Sort order (newest, oldest, likes)"),
    limit: int = Query(default=100, le=500, description="Maximum comments to return"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
):
    """
    Get all comments for a specific entity (rule, review, etc.)
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Get entity comments
        comments = await collaboration_service.get_entity_comments(
            session=session,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=current_user.get("id"),
            include_replies=include_replies,
            sort_order=sort_order,
            limit=limit
        )
        
        return [
            CommentResponse(
                id=comment.id,
                entity_type=comment.entity_type,
                entity_id=comment.entity_id,
                content=comment.content,
                comment_type=comment.comment_type,
                author_id=comment.author_id,
                author_name=getattr(comment, 'author_name', 'Unknown'),
                parent_comment_id=comment.parent_comment_id,
                mentions=comment.mentions,
                attachments=comment.attachments,
                annotations=comment.annotations,
                likes_count=comment.likes_count,
                is_edited=comment.is_edited,
                is_resolved=comment.is_resolved,
                created_at=comment.created_at,
                updated_at=comment.updated_at,
                replies=getattr(comment, 'replies', []) if include_replies else []
            ) for comment in comments
        ]
        
    except Exception as e:
        logger.error(f"Failed to get comments for {entity_type} {entity_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve comments")


@router.put("/comments/{comment_id}/resolve", response_model=StandardResponse)
async def resolve_comment(
    comment_id: int,
    resolution_note: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_MODERATE))
):
    """
    Mark a comment as resolved
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Resolve comment
        result = await collaboration_service.resolve_comment(
            session=session,
            comment_id=comment_id,
            resolved_by=current_user.get("id"),
            resolution_note=resolution_note
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        return StandardResponse(
            success=True,
            message="Comment resolved successfully",
            data={
                "comment_id": comment_id,
                "resolved_by": current_user.get("username"),
                "resolved_at": datetime.now()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resolve comment {comment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to resolve comment")


# ===============================
# KNOWLEDGE BASE ENDPOINTS
# ===============================

@router.post("/knowledge", response_model=StandardResponse)
async def create_knowledge_item(
    knowledge_data: KnowledgeItemCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_KNOWLEDGE_CONTRIBUTE))
):
    """
    Create a new knowledge base item with content management
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Create knowledge item
        knowledge_item = await collaboration_service.create_knowledge_item(
            session=session,
            title=knowledge_data.title,
            content=knowledge_data.content,
            category=knowledge_data.category,
            knowledge_type=knowledge_data.knowledge_type,
            author_id=current_user.get("id"),
            tags=knowledge_data.tags,
            related_rules=knowledge_data.related_rules,
            attachments=knowledge_data.attachments,
            visibility=knowledge_data.visibility
        )
        
        # Background task for content indexing
        background_tasks.add_task(
            collaboration_service.index_knowledge_content,
            session, knowledge_item.id
        )
        
        logger.info(f"Created knowledge item {knowledge_item.id}: {knowledge_item.title}")
        
        return StandardResponse(
            success=True,
            message="Knowledge item created successfully",
            data={
                "knowledge_id": knowledge_item.id,
                "title": knowledge_item.title,
                "category": knowledge_item.category,
                "created_at": knowledge_item.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create knowledge item: {str(e)}")


@router.get("/knowledge/search", response_model=List[KnowledgeItemResponse])
async def search_knowledge_base(
    query: str = Query(description="Search query"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    knowledge_type: Optional[str] = Query(default=None, description="Filter by type"),
    tags: Optional[List[str]] = Query(default=None, description="Filter by tags"),
    limit: int = Query(default=20, le=100, description="Maximum results to return"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
):
    """
    Search the knowledge base with advanced filtering
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Search knowledge base
        knowledge_items = await collaboration_service.search_knowledge_base(
            session=session,
            query=query,
            category=category,
            knowledge_type=knowledge_type,
            tags=tags,
            user_id=current_user.get("id"),
            limit=limit
        )
        
        return [
            KnowledgeItemResponse(
                id=item.id,
                title=item.title,
                content=item.content,
                category=item.category,
                knowledge_type=item.knowledge_type,
                author_id=item.author_id,
                author_name=getattr(item, 'author_name', 'Unknown'),
                tags=item.tags,
                related_rules=item.related_rules,
                attachments=item.attachments,
                visibility=item.visibility,
                views_count=item.views_count,
                likes_count=item.likes_count,
                is_featured=item.is_featured,
                last_updated=item.last_updated,
                created_at=item.created_at,
                relevance_score=getattr(item, 'relevance_score', 0.0)
            ) for item in knowledge_items
        ]
        
    except Exception as e:
        logger.error(f"Failed to search knowledge base: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search knowledge base")


# ===============================
# DISCUSSION FORUM ENDPOINTS
# ===============================

@router.post("/discussions", response_model=StandardResponse)
async def create_discussion(
    discussion_data: DiscussionCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_PARTICIPATE))
):
    """
    Create a new discussion thread
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Create discussion
        discussion = await collaboration_service.create_discussion(
            session=session,
            title=discussion_data.title,
            content=discussion_data.content,
            category=discussion_data.category,
            discussion_type=discussion_data.discussion_type,
            author_id=current_user.get("id"),
            tags=discussion_data.tags,
            related_entities=discussion_data.related_entities,
            is_pinned=discussion_data.is_pinned
        )
        
        logger.info(f"Created discussion {discussion.id}: {discussion.title}")
        
        return StandardResponse(
            success=True,
            message="Discussion created successfully",
            data={
                "discussion_id": discussion.id,
                "title": discussion.title,
                "category": discussion.category,
                "created_at": discussion.created_at
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create discussion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create discussion: {str(e)}")


@router.get("/discussions", response_model=List[DiscussionResponse])
async def list_discussions(
    category: Optional[str] = Query(default=None, description="Filter by category"),
    discussion_type: Optional[str] = Query(default=None, description="Filter by type"),
    status: Optional[str] = Query(default="active", description="Filter by status"),
    sort_by: str = Query(default="recent", description="Sort order"),
    limit: int = Query(default=50, le=100, description="Maximum discussions to return"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
):
    """
    List discussions with filtering and sorting options
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # List discussions
        discussions = await collaboration_service.list_discussions(
            session=session,
            category=category,
            discussion_type=discussion_type,
            status=status,
            sort_by=sort_by,
            user_id=current_user.get("id"),
            limit=limit
        )
        
        return [
            DiscussionResponse(
                id=discussion.id,
                title=discussion.title,
                content=discussion.content[:500] + "..." if len(discussion.content) > 500 else discussion.content,
                category=discussion.category,
                discussion_type=discussion.discussion_type,
                author_id=discussion.author_id,
                author_name=getattr(discussion, 'author_name', 'Unknown'),
                tags=discussion.tags,
                related_entities=discussion.related_entities,
                is_pinned=discussion.is_pinned,
                is_locked=discussion.is_locked,
                views_count=discussion.views_count,
                replies_count=discussion.replies_count,
                last_reply_at=discussion.last_reply_at,
                created_at=discussion.created_at,
                updated_at=discussion.updated_at
            ) for discussion in discussions
        ]
        
    except Exception as e:
        logger.error(f"Failed to list discussions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve discussions")


# ===============================
# COLLABORATION ANALYTICS ENDPOINTS
# ===============================

@router.get("/analytics/team/{team_id}", response_model=CollaborationAnalyticsResponse)
async def get_team_collaboration_analytics(
    team_id: int,
    time_range: int = Query(default=30, description="Days to analyze"),
    include_individual_metrics: bool = Query(default=False, description="Include per-member metrics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COLLABORATION_VIEW))
):
    """
    Get collaboration analytics for a specific team
    """
    try:
        collaboration_service = EnhancedCollaborationService()
        
        # Get team analytics
        analytics = await collaboration_service.get_team_analytics(
            session=session,
            team_id=team_id,
            time_range=time_range,
            user_id=current_user.get("id"),
            include_individual_metrics=include_individual_metrics
        )
        
        if not analytics:
            raise HTTPException(status_code=404, detail="Team not found or no access")
        
        return CollaborationAnalyticsResponse(
            team_id=team_id,
            time_range=time_range,
            total_activities=analytics.total_activities,
            collaboration_score=analytics.collaboration_score,
            activity_breakdown=analytics.activity_breakdown,
            participation_metrics=analytics.participation_metrics,
            knowledge_sharing_stats=analytics.knowledge_sharing_stats,
            review_efficiency=analytics.review_efficiency,
            communication_patterns=analytics.communication_patterns,
            individual_metrics=analytics.individual_metrics if include_individual_metrics else {},
            trends=analytics.trends,
            insights=analytics.insights
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get team analytics for team {team_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team analytics")


@router.get("/health", response_model=Dict[str, Any])
async def collaboration_health_check():
    """
    Health check endpoint for collaboration system
    """
    try:
        return {
            "status": "healthy",
            "service": "enhanced-collaboration",
            "timestamp": datetime.now(),
            "version": "1.0.0",
            "components": {
                "team_hubs": "operational",
                "review_workflows": "operational",
                "commenting_system": "operational",
                "knowledge_base": "operational",
                "discussion_forums": "operational"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now()
        }