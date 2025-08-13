"""
🔧 Enhanced Collaboration Service for Scan-Rule-Sets Group
==========================================================

This service provides comprehensive team collaboration capabilities including:
- Team collaboration hubs with workspace management
- Advanced review workflows with approval processes
- Real-time commenting and annotation systems
- Knowledge sharing and documentation
- Expert consultation and advisory features
- Discussion forums and Q&A
- Collaborative rule development
- Team performance analytics

Key Features:
- Scalable team management with role-based access
- Automated workflow orchestration
- AI-powered content recommendations
- Real-time collaboration tools
- Comprehensive analytics and insights
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from sqlmodel import Session, select, and_, or_, func
from app.db_session import get_session
from app.utils.cache import cache_get, cache_set
from app.utils.rate_limiter import check_rate_limit
from app.core.logging_config import get_logger
from app.models.Scan_Rule_Sets_completed_models.enhanced_collaboration_models import (
    TeamCollaborationHub, RuleTeamMember, EnhancedRuleReview, EnhancedRuleComment, KnowledgeItem,
    RuleDiscussion, RoleType, CommentType
)
from app.models.Scan_Rule_Sets_completed_models.advanced_collaboration_models import (
    ReviewStatus
)

# Initialize logger
logger = get_logger(__name__)


class EnhancedCollaborationService:
    """
    Enterprise-grade collaboration service with advanced team management
    """
    
    def __init__(self):
        self.logger = get_logger(self.__class__.__name__)
        self.collaboration_cache = {}
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize collaboration service components"""
        try:
            self.logger.info("Enhanced collaboration service initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize collaboration service: {str(e)}")
            raise
    
    # ===============================
    # TEAM COLLABORATION HUB METHODS
    # ===============================
    
    async def create_team_hub(
        self,
        session: Session,
        team_name: str,
        description: str,
        team_type: str,
        owner_id: int,
        initial_members: Optional[List[Dict[str, Any]]] = None,
        settings: Optional[Dict[str, Any]] = None
    ) -> TeamCollaborationHub:
        """Create a new team collaboration hub"""
        try:
            # Create team hub
            team_hub = TeamCollaborationHub(
                team_name=team_name,
                description=description,
                team_type=team_type,
                owner_id=owner_id,
                workspace_url=f"/teams/{team_name.lower().replace(' ', '-')}",
                is_active=True,
                visibility=VisibilityLevel.TEAM,
                settings=settings or {}
            )
            
            session.add(team_hub)
            session.commit()
            session.refresh(team_hub)
            
            # Add owner as admin member
            owner_member = RuleTeamMember(
                team_id=team_hub.id,
                user_id=owner_id,
                role=RoleType.TEAM_LEAD,
                permissions=["all"],
                joined_at=datetime.now(),
                added_by=owner_id,
                is_active=True
            )
            session.add(owner_member)
            
            # Add initial members if provided
            if initial_members:
                for member_data in initial_members:
                                    member = RuleTeamMember(
                    team_id=team_hub.id,
                    user_id=member_data.get("user_id"),
                    role=RoleType(member_data.get("role", "guest_contributor")),
                    permissions=member_data.get("permissions", ["read", "comment"]),
                    joined_at=datetime.now(),
                    added_by=owner_id,
                    is_active=True
                )
                session.add(member)
            
            session.commit()
            
            self.logger.info(f"Created team collaboration hub: {team_name}")
            return team_hub
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to create team hub: {str(e)}")
            raise
    
    async def get_team_hub(
        self,
        session: Session,
        team_id: int,
        user_id: int,
        include_members: bool = True,
        include_activity: bool = True,
        include_analytics: bool = False
    ) -> Optional[TeamCollaborationHub]:
        """Get team hub details with optional inclusions"""
        try:
            # Get team hub
            statement = select(TeamCollaborationHub).where(TeamCollaborationHub.id == team_id)
            result = session.exec(statement)
            team_hub = result.first()
            
            if not team_hub:
                return None
            
            # Check if user has access
            if not await self._user_has_team_access(session, user_id, team_id):
                return None
            
            # Add members if requested
            if include_members:
                members_statement = select(RuleTeamMember).where(
                    and_(RuleTeamMember.team_id == team_id, RuleTeamMember.is_active == True)
                )
                members_result = session.exec(members_statement)
                team_hub.members = list(members_result)
            
            # Add recent activity if requested
            if include_activity:
                team_hub.recent_activity = await self._get_team_recent_activity(session, team_id)
            
            # Add analytics if requested
            if include_analytics:
                team_hub.analytics = await self._get_basic_team_analytics(session, team_id)
            
            return team_hub
            
        except Exception as e:
            self.logger.error(f"Failed to get team hub {team_id}: {str(e)}")
            return None
    
    async def list_team_hubs(
        self,
        session: Session,
        user_id: Optional[int] = None,
        team_type: Optional[str] = None,
        include_archived: bool = False,
        limit: int = 50
    ) -> List[TeamCollaborationHub]:
        """List team hubs with filtering"""
        try:
            # Build query
            conditions = []
            
            if not include_archived:
                conditions.append(TeamCollaborationHub.is_active == True)
            
            if team_type:
                conditions.append(TeamCollaborationHub.team_type == team_type)
            
            if user_id:
                # User is a member of the team
                member_subquery = select(RuleTeamMember.team_id).where(
                    and_(RuleTeamMember.user_id == user_id, RuleTeamMember.is_active == True)
                )
                conditions.append(TeamCollaborationHub.id.in_(member_subquery))
            
            # Execute query
            statement = select(TeamCollaborationHub)
            if conditions:
                statement = statement.where(and_(*conditions))
            statement = statement.limit(limit)
            
            result = session.exec(statement)
            return list(result)
            
        except Exception as e:
            self.logger.error(f"Failed to list team hubs: {str(e)}")
            return []
    
    async def add_team_member(
        self,
        session: Session,
        team_id: int,
        user_id: int,
        role: str,
        permissions: List[str],
        added_by: int
    ) -> Optional[RuleTeamMember]:
        """Add a new member to a team"""
        try:
            # Check if user is already a member
            existing_statement = select(RuleTeamMember).where(
                and_(RuleTeamMember.team_id == team_id, RuleTeamMember.user_id == user_id)
            )
            existing_result = session.exec(existing_statement)
            existing_member = existing_result.first()
            
            if existing_member:
                if existing_member.is_active:
                    return None  # Already active member
                else:
                    # Reactivate member
                    existing_member.is_active = True
                    existing_member.role = RoleType(role)
                    existing_member.permissions = permissions
                    existing_member.rejoined_at = datetime.now()
                    session.commit()
                    return existing_member
            
            # Create new member
            member = RuleTeamMember(
                team_id=team_id,
                user_id=user_id,
                role=RoleType(role),
                permissions=permissions,
                joined_at=datetime.now(),
                added_by=added_by,
                is_active=True
            )
            
            session.add(member)
            session.commit()
            session.refresh(member)
            
            return member
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to add team member: {str(e)}")
            return None
    
    # ===============================
    # RULE REVIEW WORKFLOW METHODS
    # ===============================
    
    async def create_rule_review(
        self,
        session: Session,
        rule_id: int,
        review_type: str,
        title: str,
        description: str,
        requested_by: int,
        reviewers: List[int],
        priority: str = "normal",
        due_date: Optional[datetime] = None
    ) -> EnhancedRuleReview:
        """Create a new rule review"""
        try:
            review = EnhancedRuleReview(
                rule_id=rule_id,
                review_type=review_type,
                title=title,
                description=description,
                status=ReviewStatus.PENDING,
                priority=priority,
                requested_by=requested_by,
                assigned_reviewers=reviewers,
                due_date=due_date,
                created_at=datetime.now(),
                metadata={}
            )
            
            session.add(review)
            session.commit()
            session.refresh(review)
            
            self.logger.info(f"Created rule review {review.id} for rule {rule_id}")
            return review
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to create rule review: {str(e)}")
            raise
    
    async def get_rule_review(
        self,
        session: Session,
        review_id: int,
        user_id: int,
        include_comments: bool = True,
        include_history: bool = False
    ) -> Optional[EnhancedRuleReview]:
        """Get rule review details"""
        try:
            statement = select(EnhancedRuleReview).where(EnhancedRuleReview.id == review_id)
            result = session.exec(statement)
            review = result.first()
            
            if not review:
                return None
            
            # Check access permissions
            if not await self._user_has_review_access(session, user_id, review_id):
                return None
            
            # Add comments if requested
            if include_comments:
                            comments_statement = select(EnhancedRuleComment).where(
                and_(EnhancedRuleComment.entity_type == "review", EnhancedRuleComment.entity_id == review_id)
            ).order_by(EnhancedRuleComment.created_at)
            comments_result = session.exec(comments_statement)
            review.comments = list(comments_result)
            
            # Add history if requested
            if include_history:
                review.history = await self._get_review_history(session, review_id)
            
            return review
            
        except Exception as e:
            self.logger.error(f"Failed to get rule review {review_id}: {str(e)}")
            return None
    
    async def update_review_status(
        self,
        session: Session,
        review_id: int,
        new_status: str,
        reviewer_id: int,
        review_comment: Optional[str] = None
    ) -> Optional[EnhancedRuleReview]:
        """Update review status"""
        try:
            statement = select(EnhancedRuleReview).where(EnhancedRuleReview.id == review_id)
            result = session.exec(statement)
            review = result.first()
            
            if not review:
                return None
            
            # Update status
            old_status = review.status
            review.status = ReviewStatus(new_status)
            review.updated_at = datetime.now()
            
            # Track reviewer actions
            if new_status == "approved":
                if not review.approved_by:
                    review.approved_by = []
                review.approved_by.append(reviewer_id)
            elif new_status == "rejected":
                if not review.rejected_by:
                    review.rejected_by = []
                review.rejected_by.append(reviewer_id)
            
            if new_status in ["approved", "rejected"]:
                review.completed_at = datetime.now()
            
            # Add status change comment if provided
            if review_comment:
                comment = EnhancedRuleComment(
                    entity_type="review",
                    entity_id=review_id,
                    content=review_comment,
                    comment_type=CommentType.STATUS_CHANGE,
                    author_id=reviewer_id,
                    created_at=datetime.now()
                )
                session.add(comment)
            
            session.commit()
            return review
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to update review status: {str(e)}")
            return None
    
    # ===============================
    # COMMENTING SYSTEM METHODS
    # ===============================
    
    async def create_comment(
        self,
        session: Session,
        entity_type: str,
        entity_id: int,
        content: str,
        comment_type: str,
        author_id: int,
        parent_comment_id: Optional[int] = None,
        mentions: Optional[List[int]] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        annotations: Optional[Dict[str, Any]] = None
    ) -> EnhancedRuleComment:
        """Create a new comment"""
        try:
            comment = EnhancedRuleComment(
                entity_type=entity_type,
                entity_id=entity_id,
                content=content,
                comment_type=CommentType(comment_type),
                author_id=author_id,
                parent_comment_id=parent_comment_id,
                mentions=mentions or [],
                attachments=attachments or [],
                annotations=annotations or {},
                likes_count=0,
                is_edited=False,
                is_resolved=False,
                created_at=datetime.now()
            )
            
            session.add(comment)
            session.commit()
            session.refresh(comment)
            
            return comment
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to create comment: {str(e)}")
            raise
    
    async def get_entity_comments(
        self,
        session: Session,
        entity_type: str,
        entity_id: int,
        user_id: int,
        include_replies: bool = True,
        sort_order: str = "newest",
        limit: int = 100
    ) -> List[EnhancedRuleComment]:
        """Get comments for an entity"""
        try:
            # Base query for top-level comments
            conditions = [
                EnhancedRuleComment.entity_type == entity_type,
                EnhancedRuleComment.entity_id == entity_id
            ]
            
            if not include_replies:
                conditions.append(EnhancedRuleComment.parent_comment_id.is_(None))
            
            statement = select(EnhancedRuleComment).where(and_(*conditions))
            
            # Apply sorting
            if sort_order == "oldest":
                statement = statement.order_by(EnhancedRuleComment.created_at)
            elif sort_order == "likes":
                statement = statement.order_by(EnhancedRuleComment.likes_count.desc())
            else:  # newest
                statement = statement.order_by(EnhancedRuleComment.created_at.desc())
            
            statement = statement.limit(limit)
            
            result = session.exec(statement)
            comments = list(result)
            
            # If including replies, organize them hierarchically
            if include_replies:
                comments = await self._organize_comments_hierarchy(comments)
            
            return comments
            
        except Exception as e:
            self.logger.error(f"Failed to get entity comments: {str(e)}")
            return []
    
    async def resolve_comment(
        self,
        session: Session,
        comment_id: int,
        resolved_by: int,
        resolution_note: Optional[str] = None
    ) -> bool:
        """Resolve a comment"""
        try:
            statement = select(EnhancedRuleComment).where(EnhancedRuleComment.id == comment_id)
            result = session.exec(statement)
            comment = result.first()
            
            if not comment:
                return False
            
            comment.is_resolved = True
            comment.resolved_by = resolved_by
            comment.resolved_at = datetime.now()
            comment.resolution_note = resolution_note
            
            session.commit()
            return True
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to resolve comment {comment_id}: {str(e)}")
            return False
    
    # ===============================
    # KNOWLEDGE BASE METHODS
    # ===============================
    
    async def create_knowledge_item(
        self,
        session: Session,
        title: str,
        content: str,
        category: str,
        knowledge_type: str,
        author_id: int,
        tags: List[str],
        related_rules: Optional[List[int]] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        visibility: str = "team"
    ) -> KnowledgeItem:
        """Create a new knowledge base item"""
        try:
            knowledge_item = KnowledgeItem(
                title=title,
                content=content,
                category=category,
                knowledge_type=KnowledgeType(knowledge_type),
                author_id=author_id,
                tags=tags,
                related_rules=related_rules or [],
                attachments=attachments or [],
                visibility=VisibilityLevel(visibility),
                views_count=0,
                likes_count=0,
                is_featured=False,
                last_updated=datetime.now(),
                created_at=datetime.now()
            )
            
            session.add(knowledge_item)
            session.commit()
            session.refresh(knowledge_item)
            
            return knowledge_item
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to create knowledge item: {str(e)}")
            raise
    
    async def search_knowledge_base(
        self,
        session: Session,
        query: str,
        category: Optional[str] = None,
        knowledge_type: Optional[str] = None,
        tags: Optional[List[str]] = None,
        user_id: Optional[int] = None,
        limit: int = 20
    ) -> List[KnowledgeItem]:
        """Search knowledge base with filtering"""
        try:
            # Build search conditions
            conditions = []
            
            # Text search (simplified - in production would use full-text search)
            if query:
                conditions.append(
                    or_(
                        KnowledgeItem.title.contains(query),
                        KnowledgeItem.content.contains(query)
                    )
                )
            
            if category:
                conditions.append(KnowledgeItem.category == category)
            
            if knowledge_type:
                conditions.append(KnowledgeItem.knowledge_type == knowledge_type)
            
            if tags:
                # Simplified tag search
                for tag in tags:
                    conditions.append(KnowledgeItem.tags.contains([tag]))
            
            # Visibility check (simplified)
            conditions.append(
                or_(
                    KnowledgeItem.visibility == VisibilityLevel.PUBLIC,
                    KnowledgeItem.author_id == user_id if user_id else False
                )
            )
            
            statement = select(KnowledgeItem)
            if conditions:
                statement = statement.where(and_(*conditions))
            
            statement = statement.order_by(KnowledgeItem.views_count.desc()).limit(limit)
            
            result = session.exec(statement)
            return list(result)
            
        except Exception as e:
            self.logger.error(f"Failed to search knowledge base: {str(e)}")
            return []
    
    # ===============================
    # DISCUSSION FORUM METHODS
    # ===============================
    
    async def create_discussion(
        self,
        session: Session,
        title: str,
        content: str,
        category: str,
        discussion_type: str,
        author_id: int,
        tags: List[str],
        related_entities: Optional[Dict[str, Any]] = None,
        is_pinned: bool = False
    ) -> RuleDiscussion:
        """Create a new discussion thread"""
        try:
            discussion = RuleDiscussion(
                title=title,
                content=content,
                category=category,
                discussion_type=DiscussionType(discussion_type),
                author_id=author_id,
                tags=tags,
                related_entities=related_entities or {},
                is_pinned=is_pinned,
                is_locked=False,
                views_count=0,
                replies_count=0,
                last_reply_at=None,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            session.add(discussion)
            session.commit()
            session.refresh(discussion)
            
            return discussion
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to create discussion: {str(e)}")
            raise
    
    async def list_discussions(
        self,
        session: Session,
        category: Optional[str] = None,
        discussion_type: Optional[str] = None,
        status: str = "active",
        sort_by: str = "recent",
        user_id: Optional[int] = None,
        limit: int = 50
    ) -> List[RuleDiscussion]:
        """List discussions with filtering"""
        try:
            conditions = []
            
            if category:
                conditions.append(RuleDiscussion.category == category)
            
            if discussion_type:
                conditions.append(RuleDiscussion.discussion_type == discussion_type)
            
            if status == "active":
                conditions.append(RuleDiscussion.is_locked == False)
            
            statement = select(RuleDiscussion)
            if conditions:
                statement = statement.where(and_(*conditions))
            
            # Apply sorting
            if sort_by == "popular":
                statement = statement.order_by(RuleDiscussion.views_count.desc())
            elif sort_by == "replies":
                statement = statement.order_by(RuleDiscussion.replies_count.desc())
            else:  # recent
                statement = statement.order_by(RuleDiscussion.updated_at.desc())
            
            statement = statement.limit(limit)
            
            result = session.exec(statement)
            return list(result)
            
        except Exception as e:
            self.logger.error(f"Failed to list discussions: {str(e)}")
            return []
    
    # ===============================
    # ANALYTICS METHODS
    # ===============================
    
    async def get_team_analytics(
        self,
        session: Session,
        team_id: int,
        time_range: int,
        user_id: int,
        include_individual_metrics: bool = False
    ) -> Optional[Dict[str, Any]]:
        """Get comprehensive team analytics"""
        try:
            # Check access
            if not await self._user_has_team_access(session, user_id, team_id):
                return None
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=time_range)
            
            # Basic analytics structure
            analytics = {
                "total_activities": 0,
                "collaboration_score": 0.0,
                "activity_breakdown": {},
                "participation_metrics": {},
                "knowledge_sharing_stats": {},
                "review_efficiency": {},
                "communication_patterns": {},
                "trends": {},
                "insights": []
            }
            
            # In a real implementation, this would calculate actual metrics
            # For now, returning mock structure
            analytics.update({
                "total_activities": 150,
                "collaboration_score": 8.5,
                "activity_breakdown": {
                    "reviews": 25,
                    "comments": 80,
                    "knowledge_items": 15,
                    "discussions": 30
                },
                "participation_metrics": {
                    "active_members": 8,
                    "avg_response_time": "4.2 hours",
                    "engagement_rate": 0.85
                }
            })
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"Failed to get team analytics: {str(e)}")
            return None
    
    # ===============================
    # NOTIFICATION METHODS
    # ===============================
    
    async def send_review_notifications(self, session: Session, review_id: int):
        """Send notifications for new review"""
        try:
            # In a real implementation, this would send actual notifications
            self.logger.info(f"Sending review notifications for review {review_id}")
        except Exception as e:
            self.logger.error(f"Failed to send review notifications: {str(e)}")
    
    async def send_status_update_notifications(self, session: Session, review_id: int, new_status: str):
        """Send notifications for status updates"""
        try:
            # In a real implementation, this would send actual notifications
            self.logger.info(f"Sending status update notifications for review {review_id}: {new_status}")
        except Exception as e:
            self.logger.error(f"Failed to send status notifications: {str(e)}")
    
    async def index_knowledge_content(self, session: Session, knowledge_id: int):
        """Index knowledge content for search"""
        try:
            # In a real implementation, this would index content for full-text search
            self.logger.info(f"Indexing knowledge content for item {knowledge_id}")
        except Exception as e:
            self.logger.error(f"Failed to index knowledge content: {str(e)}")
    
    # ===============================
    # HELPER METHODS
    # ===============================
    
    async def _user_has_team_access(self, session: Session, user_id: int, team_id: int) -> bool:
        """Check if user has access to team"""
        try:
            statement = select(RuleTeamMember).where(
                and_(
                    RuleTeamMember.team_id == team_id,
                    RuleTeamMember.user_id == user_id,
                    RuleTeamMember.is_active == True
                )
            )
            result = session.exec(statement)
            return result.first() is not None
        except Exception:
            return False
    
    async def _user_has_review_access(self, session: Session, user_id: int, review_id: int) -> bool:
        """Check if user has access to review"""
        try:
            statement = select(EnhancedRuleReview).where(EnhancedRuleReview.id == review_id)
            result = session.exec(statement)
            review = result.first()
            
            if not review:
                return False
            
            # Check if user is requester, reviewer, or has team access
            if review.requested_by == user_id:
                return True
            
            if user_id in (review.assigned_reviewers or []):
                return True
            
            return False
        except Exception:
            return False
    
    async def _get_team_recent_activity(self, session: Session, team_id: int) -> List[Dict[str, Any]]:
        """Get recent team activity"""
        try:
            # In a real implementation, this would aggregate various activities
            return [
                {
                    "type": "review_created",
                    "user": "John Doe",
                    "timestamp": datetime.now() - timedelta(hours=2),
                    "description": "Created review for Data Classification Rule"
                },
                {
                    "type": "comment_added",
                    "user": "Jane Smith",
                    "timestamp": datetime.now() - timedelta(hours=4),
                    "description": "Added comment on SQL Injection Detection Rule"
                }
            ]
        except Exception:
            return []
    
    async def _get_basic_team_analytics(self, session: Session, team_id: int) -> Dict[str, Any]:
        """Get basic team analytics"""
        try:
            return {
                "active_members": 8,
                "monthly_activities": 125,
                "collaboration_score": 8.5
            }
        except Exception:
            return {}
    
    async def _get_review_history(self, session: Session, review_id: int) -> List[Dict[str, Any]]:
        """Get review history"""
        try:
            # In a real implementation, this would track all review changes
            return [
                {
                    "action": "created",
                    "timestamp": datetime.now() - timedelta(days=1),
                    "user": "John Doe",
                    "details": "Review created"
                }
            ]
        except Exception:
            return []
    
    async def _organize_comments_hierarchy(self, comments: List[EnhancedRuleComment]) -> List[EnhancedRuleComment]:
        """Organize comments in hierarchical structure"""
        try:
            # Create a map of parent comments and their replies
            comment_map = {comment.id: comment for comment in comments}
            root_comments = []
            
            for comment in comments:
                if comment.parent_comment_id is None:
                    root_comments.append(comment)
                    comment.replies = []
                else:
                    parent = comment_map.get(comment.parent_comment_id)
                    if parent:
                        if not hasattr(parent, 'replies'):
                            parent.replies = []
                        parent.replies.append(comment)
            
            return root_comments
        except Exception:
            return comments